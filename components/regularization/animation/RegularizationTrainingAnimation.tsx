import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import {
  NumericRow,
  TrainedRegularizationModel,
} from "../types/regularization";

import {
  generateRegularizationTrainingHistory,
  RegularizationTrainingStep,
} from "../utils/regularizationTrainingHistory";

interface Props {
  trainRows: NumericRow[];

  model:
    TrainedRegularizationModel;
}

function modelName(
  model:
    TrainedRegularizationModel
): string {
  if (
    model.modelType ===
    "linear"
  ) {
    return "OLS";
  }

  if (
    model.modelType ===
    "ridge"
  ) {
    return "Ridge";
  }

  if (
    model.modelType ===
    "lasso"
  ) {
    return "Lasso";
  }

  return "Elastic Net";
}

function createRange(
  min: number,
  max: number,
  count = 18
): number[] {
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return [];
  }

  if (
    Math.abs(max - min) <
    1e-12
  ) {
    return Array(count).fill(
      min
    );
  }

  const step =
    (max - min) /
    (count - 1);

  return Array.from(
    { length: count },
    (_, index) =>
      min + step * index
  );
}

function predictionFromStep(
  row: NumericRow,
  step:
    RegularizationTrainingStep,
  model:
    TrainedRegularizationModel
): number {
  let prediction =
    step.intercept;

  for (
    const feature of
    model.features
  ) {
    const scaler =
      model.scalers.find(
        (item) =>
          item.feature ===
          feature
      );

    const rawValue =
      Number(row[feature]);

    const scaledValue =
      scaler
        ? (
            rawValue -
            scaler.mean
          ) /
          scaler.std
        : rawValue;

    prediction +=
      scaledValue *
      (
        step.coefficients[
          feature
        ] ?? 0
      );
  }

  return prediction;
}

function penaltyAtPoint(
  coefficients: number[],
  model:
    TrainedRegularizationModel
): number {
  if (
    model.modelType ===
      "linear" ||
    model.alpha <= 0
  ) {
    return 0;
  }

  const l1 =
    coefficients.reduce(
      (sum, value) =>
        sum +
        Math.abs(value),
      0
    );

  const l2 =
    coefficients.reduce(
      (sum, value) =>
        sum +
        value * value,
      0
    );

  if (
    model.modelType ===
    "ridge"
  ) {
    return (
      model.alpha * l2
    );
  }

  if (
    model.modelType ===
    "lasso"
  ) {
    return (
      model.alpha * l1
    );
  }

  return (
    model.alpha *
    (
      model.l1Ratio * l1 +
      (
        1 -
        model.l1Ratio
      ) *
        l2
    )
  );
}

export default function RegularizationTrainingAnimation({
  trainRows,
  model,
}: Props) {
  const [isPlaying, setIsPlaying] =
    useState(false);

  const [stepIndex, setStepIndex] =
    useState(0);

  const [speed, setSpeed] =
    useState(600);

  const [xFeature, setXFeature] =
    useState(
      model.features[0] ?? ""
    );

  const [yFeature, setYFeature] =
    useState(
      model.features[1] ??
        model.features[0] ??
        ""
    );

  const history =
    useMemo(
      () =>
        generateRegularizationTrainingHistory(
          trainRows,
          model
        ),
      [trainRows, model]
    );

  const totalSteps =
    history.steps.length;

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);

    setXFeature(
      model.features[0] ?? ""
    );

    setYFeature(
      model.features[1] ??
        model.features[0] ??
        ""
    );
  }, [model]);

  useEffect(() => {
    if (
      !isPlaying ||
      totalSteps <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setStepIndex(
            (current) => {
              if (
                current >=
                totalSteps - 1
              ) {
                setIsPlaying(
                  false
                );

                return current;
              }

              return current + 1;
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
    isPlaying,
    speed,
    totalSteps,
  ]);

  const currentStep =
    history.steps[
      Math.min(
        stepIndex,
        Math.max(
          totalSteps - 1,
          0
        )
      )
    ];

  const visualization =
    useMemo(() => {
      if (
        !currentStep ||
        !xFeature ||
        !yFeature ||
        xFeature ===
          yFeature ||
        trainRows.length ===
          0
      ) {
        return null;
      }

      const xValues =
        trainRows.map(
          (row) =>
            Number(
              row[xFeature]
            )
        );

      const yValues =
        trainRows.map(
          (row) =>
            Number(
              row[yFeature]
            )
        );

      const xMin =
        Math.min(...xValues);

      const xMax =
        Math.max(...xValues);

      const yMin =
        Math.min(...yValues);

      const yMax =
        Math.max(...yValues);

      const xGrid =
        createRange(
          xMin,
          xMax
        );

      const yGrid =
        createRange(
          yMin,
          yMax
        );

      const baseRow:
        NumericRow =
        Object.fromEntries(
          model.scalers.map(
            (scaler) => [
              scaler.feature,
              scaler.mean,
            ]
          )
        );

      const zGrid =
        yGrid.map((y) =>
          xGrid.map((x) => {
            const row = {
              ...baseRow,

              [xFeature]: x,

              [yFeature]: y,
            };

            return predictionFromStep(
              row,
              currentStep,
              model
            );
          })
        );

      const actualX =
        trainRows.map(
          (row) =>
            Number(
              row[xFeature]
            )
        );

      const actualY =
        trainRows.map(
          (row) =>
            Number(
              row[yFeature]
            )
        );

      const actualZ =
        trainRows.map(
          (row) =>
            Number(
              row[
                model.target
              ]
            )
        );

      /*
       * Build a local 3D objective
       * surface around the two
       * selected coefficients.
       */

      const currentBeta1 =
        currentStep
          .coefficients[
          xFeature
        ] ?? 0;

      const currentBeta2 =
        currentStep
          .coefficients[
          yFeature
        ] ?? 0;

      const finalBeta1 =
        model.coefficients[
          xFeature
        ] ?? 0;

      const finalBeta2 =
        model.coefficients[
          yFeature
        ] ?? 0;

      const coefficientScale =
        Math.max(
          Math.abs(
            currentBeta1
          ),
          Math.abs(
            currentBeta2
          ),
          Math.abs(
            finalBeta1
          ),
          Math.abs(
            finalBeta2
          ),
          1
        );

      const beta1Grid =
        createRange(
          -coefficientScale *
            1.6,
          coefficientScale *
            1.6,
          22
        );

      const beta2Grid =
        createRange(
          -coefficientScale *
            1.6,
          coefficientScale *
            1.6,
          22
        );

      const scalerMap =
        new Map(
          model.scalers.map(
            (scaler) => [
              scaler.feature,
              scaler,
            ]
          )
        );

      const standardizedRows =
        trainRows.map(
          (row) => {
            const values:
              Record<
                string,
                number
              > = {};

            for (
              const feature of
              model.features
            ) {
              const scaler =
                scalerMap.get(
                  feature
                );

              const raw =
                Number(
                  row[
                    feature
                  ]
                );

              values[
                feature
              ] = scaler
                ? (
                    raw -
                    scaler.mean
                  ) /
                  scaler.std
                : raw;
            }

            return {
              values,

              target:
                Number(
                  row[
                    model.target
                  ]
                ),
            };
          }
        );

      function objective(
        beta1: number,
        beta2: number
      ): number {
        let squaredError = 0;

        for (
          const row of
          standardizedRows
        ) {
          let prediction =
            currentStep.intercept;

          const coefficients =
            model.features.map(
              (feature) => {
                if (
                  feature ===
                  xFeature
                ) {
                  return beta1;
                }

                if (
                  feature ===
                  yFeature
                ) {
                  return beta2;
                }

                return (
                  currentStep
                    .coefficients[
                    feature
                  ] ?? 0
                );
              }
            );

          model.features.forEach(
            (
              feature,
              index
            ) => {
              prediction +=
                row.values[
                  feature
                ] *
                coefficients[
                  index
                ];
            }
          );

          const error =
            row.target -
            prediction;

          squaredError +=
            error * error;
        }

        const mse =
          squaredError /
          standardizedRows.length;

        const allCoefficients =
          model.features.map(
            (feature) => {
              if (
                feature ===
                xFeature
              ) {
                return beta1;
              }

              if (
                feature ===
                yFeature
              ) {
                return beta2;
              }

              return (
                currentStep
                  .coefficients[
                  feature
                ] ?? 0
              );
            }
          );

        return (
          mse +
          penaltyAtPoint(
            allCoefficients,
            model
          )
        );
      }

      const lossGrid =
        beta2Grid.map(
          (beta2) =>
            beta1Grid.map(
              (beta1) =>
                objective(
                  beta1,
                  beta2
                )
            )
        );

      const currentObjective =
        objective(
          currentBeta1,
          currentBeta2
        );

      return {
        xGrid,
        yGrid,
        zGrid,

        actualX,
        actualY,
        actualZ,

        beta1Grid,
        beta2Grid,
        lossGrid,

        currentBeta1,
        currentBeta2,
        currentObjective,
      };
    }, [
      currentStep,
      trainRows,
      model,
      xFeature,
      yFeature,
    ]);

  if (
    model.features.length <
    2
  ) {
    return (
      <section className="panel">
        <span className="eyebrow">
          3D TRAINING PLAYER
        </span>

        <h2>
          Select at least two
          features
        </h2>

        <p className="muted">
          The synchronized 3D
          animation requires two
          features for the visible
          regression plane.
        </p>
      </section>
    );
  }

  if (
    !currentStep ||
    !visualization
  ) {
    return null;
  }

  const progress =
    totalSteps <= 1
      ? 100
      : (
          stepIndex /
          (totalSteps - 1)
        ) *
        100;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            INTERACTIVE 3D TRAINING
          </span>

          <h2>
            Watch{" "}
            {modelName(model)}{" "}
            learn
          </h2>
        </div>

        <span className="value-pill">
          Iteration{" "}
          {currentStep.iteration}
          {" / "}
          {
            history.steps[
              totalSteps - 1
            ]?.iteration
          }
        </span>
      </div>

      <p className="muted">
        Press Play to watch the
        regression plane and the
        optimization point move
        together as the model
        updates its coefficients.
      </p>

      <div className="two-column-grid">
        <label className="input-card">
          <span>
            Plane X feature
          </span>

          <select
            value={xFeature}
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
                  model.features.find(
                    (feature) =>
                      feature !==
                      next
                  );

                if (
                  replacement
                ) {
                  setYFeature(
                    replacement
                  );
                }
              }
            }}
          >
            {model.features.map(
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

        <label className="input-card">
          <span>
            Plane Y feature
          </span>

          <select
            value={yFeature}
            onChange={(
              event
            ) => {
              const next =
                event.target
                  .value;

              setYFeature(
                next
              );

              if (
                next ===
                xFeature
              ) {
                const replacement =
                  model.features.find(
                    (feature) =>
                      feature !==
                      next
                  );

                if (
                  replacement
                ) {
                  setXFeature(
                    replacement
                  );
                }
              }
            }}
          >
            {model.features.map(
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
      </div>

      <div
        className="feature-chip-row"
        style={{
          marginTop: 18,
        }}
      >
        <button
          type="button"
          className="feature-chip"
          onClick={() => {
            setStepIndex(0);
            setIsPlaying(
              false
            );
          }}
        >
          ↺ Reset
        </button>

        <button
          type="button"
          className="feature-chip"
          disabled={
            stepIndex === 0
          }
          onClick={() => {
            setIsPlaying(
              false
            );

            setStepIndex(
              (current) =>
                Math.max(
                  0,
                  current - 1
                )
            );
          }}
        >
          ← Previous
        </button>

        <button
          type="button"
          className="target-chip"
          onClick={() => {
            if (
              stepIndex >=
              totalSteps - 1
            ) {
              setStepIndex(
                0
              );
            }

            setIsPlaying(
              (current) =>
                !current
            );
          }}
        >
          {isPlaying
            ? "⏸ Pause"
            : "▶ Play"}
        </button>

        <button
          type="button"
          className="feature-chip"
          disabled={
            stepIndex >=
            totalSteps - 1
          }
          onClick={() => {
            setIsPlaying(
              false
            );

            setStepIndex(
              (current) =>
                Math.min(
                  totalSteps -
                    1,
                  current + 1
                )
            );
          }}
        >
          Next →
        </button>
      </div>

      <div
        className="input-card"
        style={{
          marginTop: 18,
        }}
      >
        <span>
          Training progress:{" "}
          {progress.toFixed(0)}%
        </span>

        <input
          type="range"
          min={0}
          max={
            Math.max(
              totalSteps - 1,
              0
            )
          }
          step={1}
          value={stepIndex}
          onChange={(
            event
          ) => {
            setIsPlaying(
              false
            );

            setStepIndex(
              Number(
                event.target
                  .value
              )
            );
          }}
        />
      </div>

      <div
        className="input-card"
        style={{
          marginTop: 18,
        }}
      >
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
          <option value={1000}>
            Slow
          </option>

          <option value={600}>
            Normal
          </option>

          <option value={250}>
            Fast
          </option>

          <option value={100}>
            Very Fast
          </option>
        </select>
      </div>

      <div
        className="three-column-grid"
        style={{
          marginTop: 20,
        }}
      >
        <div className="mini-card">
          <span>
            Training MSE
          </span>

          <strong>
            {currentStep.mse.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="mini-card">
          <span>
            Penalty
          </span>

          <strong>
            {currentStep.penalty.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="mini-card">
          <span>
            Objective
          </span>

          <strong>
            {currentStep.objective.toFixed(
              4
            )}
          </strong>
        </div>
      </div>

      <div
        className="feature-chip-row"
        style={{
          marginTop: 18,
        }}
      >
        {model.features.map(
          (feature) => (
            <span
              className="feature-chip"
              key={feature}
            >
              β {feature}:{" "}
              {(
                currentStep
                  .coefficients[
                  feature
                ] ?? 0
              ).toFixed(4)}
            </span>
          )
        )}
      </div>

      <div
        className="two-column-grid"
        style={{
          marginTop: 24,
        }}
      >
        <div className="input-card">
          <span className="eyebrow">
            3D REGRESSION PLANE
          </span>

          <Plot
            data={[
              {
                type: "surface",

                x:
                  visualization.xGrid,

                y:
                  visualization.yGrid,

                z:
                  visualization.zGrid,

                opacity: 0.72,

                showscale: false,

                name:
                  "Current plane",
              },

              {
                type:
                  "scatter3d",

                mode: "markers",

                x:
                  visualization.actualX,

                y:
                  visualization.actualY,

                z:
                  visualization.actualZ,

                name:
                  "Training data",

                marker: {
                  size: 4,
                },
              },
            ]}
            layout={{
              autosize: true,

              height: 500,

              margin: {
                l: 0,
                r: 0,
                t: 20,
                b: 0,
              },

              scene: {
                xaxis: {
                  title: {
                    text:
                      xFeature,
                  },
                },

                yaxis: {
                  title: {
                    text:
                      yFeature,
                  },
                },

                zaxis: {
                  title: {
                    text:
                      model.target,
                  },
                },

                camera: {
                  eye: {
                    x: 1.4,
                    y: 1.4,
                    z: 1.1,
                  },
                },
              },

              paper_bgcolor:
                "transparent",
            }}
            useResizeHandler
            style={{
              width: "100%",
              height: "500px",
            }}
            config={{
              responsive: true,
              displaylogo: false,
              scrollZoom: true,
            }}
          />
        </div>

        <div className="input-card">
          <span className="eyebrow">
            3D LOSS LANDSCAPE
          </span>

          <Plot
            data={[
              {
                type: "surface",

                x:
                  visualization.beta1Grid,

                y:
                  visualization.beta2Grid,

                z:
                  visualization.lossGrid,

                opacity: 0.82,

                showscale: false,

                name:
                  "Objective",
              },

              {
                type:
                  "scatter3d",

                mode:
                  "markers+text",

                x: [
                  visualization.currentBeta1,
                ],

                y: [
                  visualization.currentBeta2,
                ],

                z: [
                  visualization.currentObjective,
                ],

                text: [
                  "Current",
                ],

                textposition:
                  "top center",

                name:
                  "Current solution",

                marker: {
                  size: 8,
                  symbol:
                    "diamond",
                },
              },
            ]}
            layout={{
              autosize: true,

              height: 500,

              margin: {
                l: 0,
                r: 0,
                t: 20,
                b: 0,
              },

              scene: {
                xaxis: {
                  title: {
                    text: `β ${xFeature}`,
                  },
                },

                yaxis: {
                  title: {
                    text: `β ${yFeature}`,
                  },
                },

                zaxis: {
                  title: {
                    text:
                      "Objective",
                  },
                },

                camera: {
                  eye: {
                    x: 1.4,
                    y: 1.4,
                    z: 1.1,
                  },
                },
              },

              paper_bgcolor:
                "transparent",
            }}
            useResizeHandler
            style={{
              width: "100%",
              height: "500px",
            }}
            config={{
              responsive: true,
              displaylogo: false,
              scrollZoom: true,
            }}
          />
        </div>
      </div>

      <div
        className="info-box"
        style={{
          marginTop: 20,
        }}
      >
        {model.modelType ===
          "ridge" &&
          "Ridge uses L2 regularization. Watch the coefficients shrink continuously while the regression plane moves toward the regularized solution."}

        {model.modelType ===
          "lasso" &&
          "Lasso uses L1 regularization. Watch coefficients shrink, and some may become exactly zero."}

        {model.modelType ===
          "elastic-net" &&
          "Elastic Net combines L1 and L2 regularization. Watch both shrinkage and feature-selection behaviour."}

        {model.modelType ===
          "linear" &&
          "OLS has no regularization penalty. The animation shows the model moving toward the ordinary least-squares solution."}
      </div>
    </section>
  );
}