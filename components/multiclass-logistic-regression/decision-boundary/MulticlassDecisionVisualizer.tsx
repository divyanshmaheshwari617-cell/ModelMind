import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import type {
  ClassLabel,
  ClassParameters,
  FeatureScaler,
  MulticlassRow,
  TrainingSnapshot,
} from "../types/multiclassLogisticRegression";

interface Props {
  rows: MulticlassRow[];
  features: string[];
  classes: ClassLabel[];
  scalers: FeatureScaler[];
  history: TrainingSnapshot[];
}

const CLASS_COLORS = [
  "#38bdf8",
  "#f97316",
  "#22c55e",
  "#a78bfa",
  "#f43f5e",
  "#eab308",
  "#14b8a6",
  "#ec4899",
  "#84cc16",
  "#6366f1",
];

function getScaler(
  scalers: FeatureScaler[],
  feature: string
) {
  return scalers.find(
    (scaler) =>
      scaler.feature === feature
  );
}

function getCoefficient(
  parameters: ClassParameters,
  feature: string
) {
  return (
    parameters.coefficients[
      feature
    ] ?? 0
  );
}

/*
 * Convert a raw-space logistic
 * regression equation into:
 *
 * score =
 * rawIntercept
 * + rawWx * x
 * + rawWy * y
 * + rawWz * z
 *
 * The original model was trained
 * in standardized feature space.
 */
function getRawEquation(
  parameters: ClassParameters,
  features: string[],
  scalers: FeatureScaler[],
  xFeature: string,
  yFeature: string,
  zFeature: string
) {
  let intercept =
    parameters.intercept;

  let xWeight = 0;
  let yWeight = 0;
  let zWeight = 0;

  features.forEach(
    (feature) => {
      const scaler =
        getScaler(
          scalers,
          feature
        );

      const coefficient =
        getCoefficient(
          parameters,
          feature
        );

      if (
        !scaler ||
        !Number.isFinite(
          scaler.std
        ) ||
        scaler.std === 0
      ) {
        return;
      }

      /*
       * coefficient *
       * ((x - mean) / std)
       *
       * =
       *
       * coefficient/std * x
       * -
       * coefficient*mean/std
       */
      intercept -=
        (coefficient *
          scaler.mean) /
        scaler.std;

      const rawWeight =
        coefficient /
        scaler.std;

      if (
        feature ===
        xFeature
      ) {
        xWeight =
          rawWeight;
      } else if (
        feature ===
        yFeature
      ) {
        yWeight =
          rawWeight;
      } else if (
        feature ===
        zFeature
      ) {
        zWeight =
          rawWeight;
      } else {
        /*
         * Hidden features are held
         * at their training mean.
         *
         * Their standardized value
         * is therefore zero, so they
         * contribute nothing.
         *
         * Undo the raw-space
         * intercept adjustment made
         * above for hidden features.
         */
        intercept +=
          (coefficient *
            scaler.mean) /
          scaler.std;
      }
    }
  );

  return {
    intercept,
    xWeight,
    yWeight,
    zWeight,
  };
}

function getBounds(
  rows: MulticlassRow[],
  feature: string
) {
  const values =
    rows
      .map(
        (row) =>
          row.features[
            feature
          ]
      )
      .filter(
        Number.isFinite
      );

  if (
    values.length === 0
  ) {
    return {
      min: 0,
      max: 1,
    };
  }

  const min =
    Math.min(...values);

  const max =
    Math.max(...values);

  const range =
    max - min;

  const padding =
    Math.max(
      range * 0.12,
      0.2
    );

  return {
    min:
      min - padding,

    max:
      max + padding,
  };
}

/*
 * Decision boundary between
 * class A and class B:
 *
 * scoreA = scoreB
 *
 * Therefore:
 *
 * (wA - wB)x
 * + (wA - wB)y
 * + (wA - wB)z
 * + (bA - bB)
 * = 0
 *
 * Solve for z to obtain the
 * separating plane.
 */
function createBoundaryPlane(
  first:
    ClassParameters,
  second:
    ClassParameters,
  features: string[],
  scalers: FeatureScaler[],
  xFeature: string,
  yFeature: string,
  zFeature: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  zMin: number,
  zMax: number
) {
  const firstEquation =
    getRawEquation(
      first,
      features,
      scalers,
      xFeature,
      yFeature,
      zFeature
    );

  const secondEquation =
    getRawEquation(
      second,
      features,
      scalers,
      xFeature,
      yFeature,
      zFeature
    );

  const a =
    firstEquation.xWeight -
    secondEquation.xWeight;

  const b =
    firstEquation.yWeight -
    secondEquation.yWeight;

  const c =
    firstEquation.zWeight -
    secondEquation.zWeight;

  const d =
    firstEquation.intercept -
    secondEquation.intercept;

  /*
   * If c is sufficiently large,
   * solve normally:
   *
   * z = -(a*x + b*y + d)/c
   */
  if (
    Math.abs(c) >
    0.000001
  ) {
    const resolution = 18;

    const xGrid =
      Array.from(
        {
          length:
            resolution,
        },
        (_, index) =>
          xMin +
          (index /
            (resolution -
              1)) *
            (xMax - xMin)
      );

    const yGrid =
      Array.from(
        {
          length:
            resolution,
        },
        (_, index) =>
          yMin +
          (index /
            (resolution -
              1)) *
            (yMax - yMin)
      );

    const zGrid =
      yGrid.map(
        (yValue) =>
          xGrid.map(
            (xValue) => {
              const zValue =
                -(
                  a *
                    xValue +
                  b *
                    yValue +
                  d
                ) /
                c;

              /*
               * Keep extreme plane
               * values from destroying
               * the graph scale.
               */
              const extra =
                (zMax -
                  zMin) *
                2;

              return Math.max(
                zMin -
                  extra,
                Math.min(
                  zMax +
                    extra,
                  zValue
                )
              );
            }
          )
      );

    return {
      x: xGrid,
      y: yGrid,
      z: zGrid,
      equation: {
        a,
        b,
        c,
        d,
      },
    };
  }

  /*
   * If c ≈ 0 the boundary is
   * vertical relative to Z.
   *
   * If a is usable:
   *
   * x = -(b*y + d)/a
   */
  if (
    Math.abs(a) >
    0.000001
  ) {
    const resolution = 18;

    const yGrid =
      Array.from(
        {
          length:
            resolution,
        },
        (_, index) =>
          yMin +
          (index /
            (resolution -
              1)) *
            (yMax - yMin)
      );

    const zGrid =
      Array.from(
        {
          length:
            resolution,
        },
        (_, index) =>
          zMin +
          (index /
            (resolution -
              1)) *
            (zMax - zMin)
      );

    const xMatrix =
      zGrid.map(
        () =>
          yGrid.map(
            (yValue) =>
              -(
                b *
                  yValue +
                d
              ) /
              a
          )
      );

    const yMatrix =
      zGrid.map(
        () =>
          [...yGrid]
      );

    const zMatrix =
      zGrid.map(
        (zValue) =>
          yGrid.map(
            () =>
              zValue
          )
      );

    return {
      x: xMatrix,
      y: yMatrix,
      z: zMatrix,
      equation: {
        a,
        b,
        c,
        d,
      },
    };
  }

  /*
   * Otherwise solve:
   *
   * y = -(a*x + d)/b
   */
  if (
    Math.abs(b) >
    0.000001
  ) {
    const resolution = 18;

    const xGrid =
      Array.from(
        {
          length:
            resolution,
        },
        (_, index) =>
          xMin +
          (index /
            (resolution -
              1)) *
            (xMax - xMin)
      );

    const zGrid =
      Array.from(
        {
          length:
            resolution,
        },
        (_, index) =>
          zMin +
          (index /
            (resolution -
              1)) *
            (zMax - zMin)
      );

    const xMatrix =
      zGrid.map(
        () =>
          [...xGrid]
      );

    const yMatrix =
      zGrid.map(
        () =>
          xGrid.map(
            (xValue) =>
              -(
                a *
                  xValue +
                d
              ) /
              b
          )
      );

    const zMatrix =
      zGrid.map(
        (zValue) =>
          xGrid.map(
            () =>
              zValue
          )
      );

    return {
      x: xMatrix,
      y: yMatrix,
      z: zMatrix,
      equation: {
        a,
        b,
        c,
        d,
      },
    };
  }

  return null;
}

export default function MulticlassDecisionVisualizer({
  rows,
  features,
  classes,
  scalers,
  history,
}: Props) {
  const [
    xFeature,
    setXFeature,
  ] = useState(
    features[0] ?? ""
  );

  const [
    yFeature,
    setYFeature,
  ] = useState(
    features[1] ??
      features[0] ??
      ""
  );

  const [
    zFeature,
    setZFeature,
  ] = useState(
    features[2] ??
      features[1] ??
      features[0] ??
      ""
  );

  const [
    historyIndex,
    setHistoryIndex,
  ] = useState(
    Math.max(
      history.length - 1,
      0
    )
  );

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    speed,
    setSpeed,
  ] = useState(70);

  /*
   * Make sure X, Y and Z remain
   * three different features.
   */
  useEffect(() => {
    if (
      features.length <
      3
    ) {
      return;
    }

    if (
      !features.includes(
        xFeature
      )
    ) {
      setXFeature(
        features[0]
      );
    }

    if (
      !features.includes(
        yFeature
      ) ||
      yFeature ===
        xFeature
    ) {
      setYFeature(
        features.find(
          (feature) =>
            feature !==
            xFeature
        ) ??
          features[1]
      );
    }

    if (
      !features.includes(
        zFeature
      ) ||
      zFeature ===
        xFeature ||
      zFeature ===
        yFeature
    ) {
      setZFeature(
        features.find(
          (feature) =>
            feature !==
              xFeature &&
            feature !==
              yFeature
        ) ??
          features[2]
      );
    }
  }, [
    features,
    xFeature,
    yFeature,
    zFeature,
  ]);

  /*
   * Whenever training is
   * recalculated, show the final
   * trained model first.
   */
  useEffect(() => {
    setHistoryIndex(
      Math.max(
        history.length - 1,
        0
      )
    );

    setPlaying(false);
  }, [history]);

  /*
   * Training animation.
   */
  useEffect(() => {
    if (
      !playing ||
      history.length === 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setHistoryIndex(
            (current) => {
              if (
                current >=
                history.length -
                  1
              ) {
                setPlaying(
                  false
                );

                return current;
              }

              return (
                current + 1
              );
            }
          );
        },
        speed
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    playing,
    history.length,
    speed,
  ]);

  const snapshot =
    history[
      Math.min(
        historyIndex,
        Math.max(
          history.length - 1,
          0
        )
      )
    ];

  const xBounds =
    useMemo(
      () =>
        getBounds(
          rows,
          xFeature
        ),
      [
        rows,
        xFeature,
      ]
    );

  const yBounds =
    useMemo(
      () =>
        getBounds(
          rows,
          yFeature
        ),
      [
        rows,
        yFeature,
      ]
    );

  const zBounds =
    useMemo(
      () =>
        getBounds(
          rows,
          zFeature
        ),
      [
        rows,
        zFeature,
      ]
    );

  /*
   * Create every pairwise
   * multiclass decision boundary.
   *
   * For K classes:
   *
   * K(K - 1) / 2
   *
   * pairwise planes can exist.
   */
  const boundaryPlanes =
    useMemo(() => {
      if (!snapshot) {
        return [];
      }

      const result: Array<{
        firstIndex: number;
        secondIndex: number;
        firstLabel: ClassLabel;
        secondLabel: ClassLabel;
        x: number[] | number[][];
        y: number[] | number[][];
        z: number[] | number[][];
        equation: {
          a: number;
          b: number;
          c: number;
          d: number;
        };
      }> = [];

      for (
        let firstIndex = 0;
        firstIndex <
        snapshot
          .classParameters
          .length;
        firstIndex++
      ) {
        for (
          let secondIndex =
            firstIndex + 1;
          secondIndex <
          snapshot
            .classParameters
            .length;
          secondIndex++
        ) {
          const first =
            snapshot
              .classParameters[
                firstIndex
              ];

          const second =
            snapshot
              .classParameters[
                secondIndex
              ];

          const plane =
            createBoundaryPlane(
              first,
              second,
              features,
              scalers,
              xFeature,
              yFeature,
              zFeature,
              xBounds.min,
              xBounds.max,
              yBounds.min,
              yBounds.max,
              zBounds.min,
              zBounds.max
            );

          if (!plane) {
            continue;
          }

          result.push({
            firstIndex,
            secondIndex,

            firstLabel:
              first.classLabel,

            secondLabel:
              second.classLabel,

            x:
              plane.x,

            y:
              plane.y,

            z:
              plane.z,

            equation:
              plane.equation,
          });
        }
      }

      return result;
    }, [
      snapshot,
      features,
      scalers,
      xFeature,
      yFeature,
      zFeature,
      xBounds,
      yBounds,
      zBounds,
    ]);

  /*
   * REAL dataset points.
   *
   * Notice:
   * Z is now a REAL FEATURE,
   * not probability and not logit.
   */
  const pointTraces =
    classes.map(
      (
        classLabel,
        classIndex
      ) => {
        const classRows =
          rows.filter(
            (row) =>
              String(
                row.target
              ) ===
              String(
                classLabel
              )
          );

        return {
          type:
            "scatter3d" as const,

          mode:
            "markers" as const,

          name:
            String(
              classLabel
            ),

          x:
            classRows.map(
              (row) =>
                row.features[
                  xFeature
                ]
            ),

          y:
            classRows.map(
              (row) =>
                row.features[
                  yFeature
                ]
            ),

          z:
            classRows.map(
              (row) =>
                row.features[
                  zFeature
                ]
            ),

          marker: {
            size: 7,

            color:
              CLASS_COLORS[
                classIndex %
                  CLASS_COLORS.length
              ],

            opacity: 0.95,

            line: {
              width: 1,
              color:
                "#ffffff",
            },
          },

          hovertemplate:
            `${xFeature}: %{x:.3f}` +
            `<br>${yFeature}: %{y:.3f}` +
            `<br>${zFeature}: %{z:.3f}` +
            `<br>Actual class: ${String(
              classLabel
            )}` +
            "<extra></extra>",
        };
      }
    );

  if (
    features.length < 3
  ) {
    return (
      <section className="panel">
        <span className="eyebrow">
          LIVE 3D DECISION
          VISUALIZATION
        </span>

        <h2>
          Multiclass Logistic
          Regression
        </h2>

        <div className="warning-box">
          Select at least three
          numerical features to
          create the real 3D
          feature-space decision
          visualization.
        </div>
      </section>
    );
  }

  if (!snapshot) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            LIVE 3D DECISION
            VISUALIZATION
          </span>

          <h2>
            Watch the Model Learn
            Its Separating Planes
          </h2>
        </div>

        <span className="value-pill">
          Iteration{" "}
          {snapshot.iteration} /{" "}
          {
            history[
              history.length - 1
            ]?.iteration
          }
        </span>
      </div>

      <p className="muted">
        Every dot is a real sample
        positioned using three real
        dataset features. The
        translucent surfaces are
        learned decision boundaries
        between pairs of classes.
        Press Reset and Play to
        watch those boundaries move
        while the model trains.
      </p>

      {/* =========================
          FEATURE CONTROLS
      ========================= */}

      <div className="control-grid">
        <label className="control-card">
          <span>
            X-axis feature
          </span>

          <select
            value={
              xFeature
            }
            onChange={(
              event
            ) => {
              const next =
                event.target
                  .value;

              setXFeature(
                next
              );

              if (
                next ===
                yFeature
              ) {
                const replacement =
                  features.find(
                    (feature) =>
                      feature !==
                        next &&
                      feature !==
                        zFeature
                  );

                if (
                  replacement
                ) {
                  setYFeature(
                    replacement
                  );
                }
              }

              if (
                next ===
                zFeature
              ) {
                const replacement =
                  features.find(
                    (feature) =>
                      feature !==
                        next &&
                      feature !==
                        yFeature
                  );

                if (
                  replacement
                ) {
                  setZFeature(
                    replacement
                  );
                }
              }
            }}
          >
            {features.map(
              (feature) => (
                <option
                  key={
                    feature
                  }
                  value={
                    feature
                  }
                >
                  {feature}
                </option>
              )
            )}
          </select>
        </label>

        <label className="control-card">
          <span>
            Y-axis feature
          </span>

          <select
            value={
              yFeature
            }
            onChange={(
              event
            ) => {
              const next =
                event.target
                  .value;

              if (
                next !==
                  xFeature &&
                next !==
                  zFeature
              ) {
                setYFeature(
                  next
                );
              }
            }}
          >
            {features
              .filter(
                (feature) =>
                  feature !==
                    xFeature &&
                  feature !==
                    zFeature
              )
              .map(
                (feature) => (
                  <option
                    key={
                      feature
                    }
                    value={
                      feature
                    }
                  >
                    {feature}
                  </option>
                )
              )}
          </select>
        </label>

        <label className="control-card">
          <span>
            Z-axis feature
          </span>

          <select
            value={
              zFeature
            }
            onChange={(
              event
            ) => {
              const next =
                event.target
                  .value;

              if (
                next !==
                  xFeature &&
                next !==
                  yFeature
              ) {
                setZFeature(
                  next
                );
              }
            }}
          >
            {features
              .filter(
                (feature) =>
                  feature !==
                    xFeature &&
                  feature !==
                    yFeature
              )
              .map(
                (feature) => (
                  <option
                    key={
                      feature
                    }
                    value={
                      feature
                    }
                  >
                    {feature}
                  </option>
                )
              )}
          </select>
        </label>

        <label className="control-card">
          <span>
            Animation speed
          </span>

          <select
            value={speed}
            onChange={(
              event
            ) =>
              setSpeed(
                Number(
                  event.target
                    .value
                )
              )
            }
          >
            <option value={140}>
              Slow
            </option>

            <option value={70}>
              Normal
            </option>

            <option value={30}>
              Fast
            </option>
          </select>
        </label>
      </div>

      {/* =========================
          TRAINING CONTROLS
      ========================= */}

      <div className="toolbar-row">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);
            setHistoryIndex(0);
          }}
        >
          ⏮ Reset
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={
            historyIndex <= 0
          }
          onClick={() => {
            setPlaying(false);

            setHistoryIndex(
              (current) =>
                Math.max(
                  0,
                  current - 1
                )
            );
          }}
        >
          ◀ Previous
        </button>

        <button
          type="button"
          className="primary-button"
          style={{
            marginTop: 0,
          }}
          onClick={() => {
            if (playing) {
              setPlaying(false);
              return;
            }

            if (
              historyIndex >=
              history.length - 1
            ) {
              setHistoryIndex(0);
            }

            setPlaying(true);
          }}
        >
          {playing
            ? "⏸ Pause"
            : "▶ Play"}
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={
            historyIndex >=
            history.length - 1
          }
          onClick={() => {
            setPlaying(false);

            setHistoryIndex(
              (current) =>
                Math.min(
                  history.length - 1,
                  current + 1
                )
            );
          }}
        >
          Next ▶
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);

            setHistoryIndex(
              history.length - 1
            );
          }}
        >
          Final ⏭
        </button>
      </div>

      <label
        className="control-card"
        style={{
          marginTop: 16,
        }}
      >
        <span>
          Training iteration
        </span>

        <input
          type="range"
          min={0}
          max={
            Math.max(
              history.length - 1,
              0
            )
          }
          step={1}
          value={
            historyIndex
          }
          onChange={(
            event
          ) => {
            setPlaying(false);

            setHistoryIndex(
              Number(
                event.target
                  .value
              )
            );
          }}
        />
      </label>

      {/* =========================
          LIVE METRICS
      ========================= */}

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Iteration
          </span>

          <strong>
            {snapshot.iteration}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Cross-Entropy
          </span>

          <strong>
            {snapshot.loss.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Training Accuracy
          </span>

          <strong>
            {(
              snapshot.accuracy *
              100
            ).toFixed(1)}
            %
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Classes
          </span>

          <strong>
            {classes.length}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Decision Planes
          </span>

          <strong>
            {
              boundaryPlanes.length
            }
          </strong>
        </div>
      </div>

      {/* =========================
          REAL 3D FEATURE SPACE
      ========================= */}

      <div className="sub-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              REAL FEATURE SPACE
            </span>

            <h3>
              Live Multiclass
              Decision Planes
            </h3>
          </div>

          <span className="value-pill">
            Pairwise Class
            Boundaries
          </span>
        </div>

        <p className="muted">
          X, Y and Z are actual
          dataset features. The
          model creates a boundary
          wherever two class scores
          become equal.
        </p>

        <Plot
          data={[
            ...boundaryPlanes.map(
              (
                plane,
                index
              ) => {
                const firstColor =
                  CLASS_COLORS[
                    plane.firstIndex %
                      CLASS_COLORS.length
                  ];

                return {
                  type:
                    "surface" as const,

                  name:
                    `${String(
                      plane.firstLabel
                    )} ↔ ${String(
                      plane.secondLabel
                    )}`,

                  x:
                    plane.x,

                  y:
                    plane.y,

                  z:
                    plane.z,

                  opacity: 0.32,

                  showscale:
                    false,

                  colorscale: [
                    [
                      0,
                      firstColor,
                    ],
                    [
                      1,
                      firstColor,
                    ],
                  ],

                  hovertemplate:
                    `${String(
                      plane.firstLabel
                    )} ↔ ${String(
                      plane.secondLabel
                    )}` +
                    "<br>Equal class scores" +
                    "<extra></extra>",

                  legendgroup:
                    `boundary-${index}`,
              };
            }
          ),

          ...pointTraces,
        ]}
          layout={{
            autosize: true,

            height: 760,

            margin: {
              l: 10,
              r: 10,
              t: 45,
              b: 10,
            },

            scene: {
              xaxis: {
                title: {
                  text:
                    xFeature,
                },

                range: [
                  xBounds.min,
                  xBounds.max,
                ],
              },

              yaxis: {
                title: {
                  text:
                    yFeature,
                },

                range: [
                  yBounds.min,
                  yBounds.max,
                ],
              },

              zaxis: {
                title: {
                  text:
                    zFeature,
                },

                range: [
                  zBounds.min,
                  zBounds.max,
                ],
              },

              camera: {
                eye: {
                  x: 1.45,
                  y: 1.45,
                  z: 1.15,
                },
              },

              bgcolor:
                "#081321",
            },

            legend: {
              orientation:
                "h",

              x: 0,
              y: 1.08,
            },

            paper_bgcolor:
              "transparent",

            font: {
              color:
                "#c8d5e6",
            },

            /*
             * Preserve camera angle
             * while planes move.
             */
            uirevision:
              `${xFeature}-${yFeature}-${zFeature}`,
          }}
          useResizeHandler
          style={{
            width: "100%",
          }}
          config={{
            responsive: true,
            displaylogo: false,
          }}
        />

        <div className="info-box">
          <strong>
            What are you seeing?
          </strong>

          <br />
          <br />

          The colored dots are the
          real training samples.
          Their X, Y and Z positions
          come directly from three
          selected dataset features.

          <br />
          <br />

          The translucent surfaces
          are not probability
          surfaces. They are real
          multiclass decision
          boundaries.

          <br />
          <br />

          For two classes A and B,
          the boundary appears
          wherever:

          <br />
          <br />

          <strong>
            Score(A) = Score(B)
          </strong>

          <br />
          <br />

          On one side of the plane,
          A has the larger score.
          On the other side, B has
          the larger score.

          <br />
          <br />

          With three classes, you
          can have:

          <br />

          A ↔ B
          <br />

          A ↔ C
          <br />

          B ↔ C

          <br />
          <br />

          Press{" "}
          <strong>Reset</strong>{" "}
          and{" "}
          <strong>Play</strong>{" "}
          to watch the learned
          separating planes move as
          gradient descent changes
          the class coefficients.
        </div>
      </div>

      {/* =========================
          HIGH-DIMENSION NOTE
      ========================= */}

      {features.length >
        3 && (
        <div className="info-box">
          <strong>
            ModelMind note:
          </strong>{" "}

          the trained model uses all{" "}
          {features.length} selected
          features, but a normal 3D
          graph can display only
          three feature dimensions
          at once.

          <br />
          <br />

          Currently displayed:

          <br />

          X ={" "}
          <strong>
            {xFeature}
          </strong>

          <br />

          Y ={" "}
          <strong>
            {yFeature}
          </strong>

          <br />

          Z ={" "}
          <strong>
            {zFeature}
          </strong>

          <br />
          <br />

          The remaining{" "}
          {features.length - 3}{" "}
          feature(s) are held at
          their training means only
          for this visualization.
          They are still used by the
          actual trained model.
        </div>
      )}
    </section>
  );
}