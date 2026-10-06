import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import {
  LogisticModel,
  NumericRow,
  TrainingSnapshot,
} from "../types/logisticRegression";

interface Props {
  model: LogisticModel;
  rows: NumericRow[];
  history: TrainingSnapshot[];
  threshold: number;
}

function minMax(values: number[]) {
  if (values.length === 0) {
    return {
      min: 0,
      max: 1,
    };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function paddedRange(
  min: number,
  max: number
) {
  const difference =
    max - min;

  const padding =
    difference === 0
      ? 1
      : difference * 0.12;

  return {
    min: min - padding,
    max: max + padding,
  };
}

function linspace(
  min: number,
  max: number,
  count: number
) {
  if (count <= 1) {
    return [min];
  }

  const step =
    (max - min) /
    (count - 1);

  return Array.from(
    { length: count },
    (_, index) =>
      min + index * step
  );
}

export default function DecisionBoundaryVisualizer({
  model,
  rows,
  history,
  threshold,
}: Props) {
  const [
    snapshotIndex,
    setSnapshotIndex,
  ] = useState(0);

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    speed,
    setSpeed,
  ] = useState(180);

  /*
   * Use the first two selected
   * features for the visual lab.
   *
   * Remaining standardized
   * features are held at 0,
   * which corresponds to their
   * training mean.
   */
  const feature1 =
    model.features[0];

  const feature2 =
    model.features[1];

  useEffect(() => {
    setSnapshotIndex(0);
    setPlaying(false);
  }, [history]);

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
          setSnapshotIndex(
            (current) => {
              if (
                current >=
                history.length - 1
              ) {
                setPlaying(false);

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
    playing,
    speed,
    history.length,
  ]);

  const currentSnapshot =
    history[
      Math.min(
        snapshotIndex,
        Math.max(
          history.length - 1,
          0
        )
      )
    ];

  const visualization =
    useMemo(() => {
      if (
        !feature1 ||
        !feature2 ||
        !currentSnapshot ||
        rows.length === 0
      ) {
        return null;
      }

      const scaler1 =
        model.scalers.find(
          (scaler) =>
            scaler.feature ===
            feature1
        );

      const scaler2 =
        model.scalers.find(
          (scaler) =>
            scaler.feature ===
            feature2
        );

      if (
        !scaler1 ||
        !scaler2
      ) {
        return null;
      }

      const xValues =
        rows.map(
          (row) =>
            row[feature1]
        );

      const yValues =
        rows.map(
          (row) =>
            row[feature2]
        );

      const rawXRange =
        minMax(xValues);

      const rawYRange =
        minMax(yValues);

      const xRange =
        paddedRange(
          rawXRange.min,
          rawXRange.max
        );

      const yRange =
        paddedRange(
          rawYRange.min,
          rawYRange.max
        );

      const planeX =
        linspace(
          xRange.min,
          xRange.max,
          30
        );

      const planeY =
        linspace(
          yRange.min,
          yRange.max,
          30
        );

      const beta1 =
        currentSnapshot
          .coefficients[
            feature1
          ] ?? 0;

      const beta2 =
        currentSnapshot
          .coefficients[
            feature2
          ] ?? 0;

      const intercept =
        currentSnapshot.intercept;

      /*
       * Logistic Regression:
       *
       * z =
       * b0 + b1*x1 + b2*x2
       *
       * Decision threshold t:
       *
       * sigmoid(z) = t
       *
       * Therefore:
       *
       * z = log(t / (1-t))
       *
       * We visualize:
       *
       * z(x1,x2) - logit(t)
       *
       * The z=0 intersection is
       * the classification boundary.
       */

      const safeThreshold =
        Math.min(
          0.999,
          Math.max(
            0.001,
            threshold
          )
        );

      const thresholdLogit =
        Math.log(
          safeThreshold /
            (1 -
              safeThreshold)
        );

      const planeZ =
        planeY.map((y) =>
          planeX.map((x) => {
            const standardizedX =
              (x -
                scaler1.mean) /
              scaler1.std;

            const standardizedY =
              (y -
                scaler2.mean) /
              scaler2.std;

            return (
              intercept +
              beta1 *
                standardizedX +
              beta2 *
                standardizedY -
              thresholdLogit
            );
          })
        );

      /*
       * Put class points on two
       * separated z levels so the
       * student can clearly see
       * which class each point
       * belongs to.
       */
      const allPlaneValues =
        planeZ.flat();

      const planeMagnitude =
        Math.max(
          1,
          ...allPlaneValues.map(
            (value) =>
              Math.abs(value)
          )
        );

      const classHeight =
        planeMagnitude * 0.75;

      const class0 =
        rows.filter(
          (row) =>
            row[model.target] ===
            0
        );

      const class1 =
        rows.filter(
          (row) =>
            row[model.target] ===
            1
        );

      return {
        xRange,
        yRange,
        planeX,
        planeY,
        planeZ,
        classHeight,
        class0,
        class1,
        beta1,
        beta2,
        intercept,
      };
    }, [
      model,
      rows,
      feature1,
      feature2,
      currentSnapshot,
      threshold,
    ]);

  if (
    !feature1 ||
    !feature2
  ) {
    return (
      <section className="panel">
        <span className="eyebrow">
          3D DECISION PLANE
        </span>

        <h2>
          Select at least two
          features
        </h2>

        <div className="warning-box">
          The interactive 3D
          separator requires at
          least two numerical
          features.
        </div>
      </section>
    );
  }

  if (
    !currentSnapshot ||
    !visualization
  ) {
    return (
      <section className="panel">
        <span className="eyebrow">
          3D DECISION PLANE
        </span>

        <h2>
          Training history is not
          available
        </h2>
      </section>
    );
  }

  const lastIndex =
    Math.max(
      history.length - 1,
      0
    );

  const progress =
    lastIndex === 0
      ? 100
      : (snapshotIndex /
          lastIndex) *
        100;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            INTERACTIVE 3D TRAINING
          </span>

          <h2>
            Watch the Decision Plane
            Learn to Separate the
            Classes
          </h2>
        </div>

        <span className="value-pill">
          Iteration{" "}
          {
            currentSnapshot.iteration
          }
        </span>
      </div>

      <p className="muted">
        Class 0 and Class 1 are shown
        as different groups of
        datapoints. Press Play to
        watch the Logistic Regression
        coefficients change and move
        the separating plane during
        gradient descent.
      </p>

      <div className="toolbar-row">
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            if (
              snapshotIndex >=
              lastIndex
            ) {
              setSnapshotIndex(0);
            }

            setPlaying(
              (current) =>
                !current
            );
          }}
        >
          {playing
            ? "⏸ Pause"
            : "▶ Play"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);

            setSnapshotIndex(
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
          className="secondary-button"
          onClick={() => {
            setPlaying(false);

            setSnapshotIndex(
              (current) =>
                Math.min(
                  lastIndex,
                  current + 1
                )
            );
          }}
        >
          Next →
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);
            setSnapshotIndex(0);
          }}
        >
          Reset
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);

            setSnapshotIndex(
              lastIndex
            );
          }}
        >
          Final Plane
        </button>
      </div>

      <div className="control-grid">
        <label className="control-card">
          <span>
            Training progress
          </span>

          <strong>
            {progress.toFixed(0)}%
          </strong>

          <input
            type="range"
            min={0}
            max={lastIndex}
            step={1}
            value={
              snapshotIndex
            }
            onChange={(event) => {
              setPlaying(false);

              setSnapshotIndex(
                Number(
                  event.target.value
                )
              );
            }}
          />

          <small>
            Snapshot{" "}
            {snapshotIndex + 1} of{" "}
            {history.length}
          </small>
        </label>

        <label className="control-card">
          <span>
            Animation speed
          </span>

          <select
            value={speed}
            onChange={(event) =>
              setSpeed(
                Number(
                  event.target.value
                )
              )
            }
          >
            <option value={400}>
              Slow
            </option>

            <option value={180}>
              Normal
            </option>

            <option value={70}>
              Fast
            </option>
          </select>

          <small>
            Controls only the
            animation speed.
          </small>
        </label>

        <div className="control-card">
          <span>
            Classification threshold
          </span>

          <strong>
            {threshold.toFixed(2)}
          </strong>

          <small>
            The threshold changes
            where the separating
            boundary lies. It does
            not retrain the model.
          </small>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Iteration
          </span>

          <strong>
            {
              currentSnapshot.iteration
            }
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Current Loss
          </span>

          <strong>
            {currentSnapshot.loss.toFixed(
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
              currentSnapshot.accuracy *
              100
            ).toFixed(1)}
            %
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Threshold
          </span>

          <strong>
            {threshold.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="sub-panel">
        <h3>
          3D Separating Plane
        </h3>

        <Plot
          data={[
            /*
             * Class 0
             */
            {
              type: "scatter3d",
              mode: "markers",

              x:
                visualization.class0.map(
                  (row) =>
                    row[feature1]
                ),

              y:
                visualization.class0.map(
                  (row) =>
                    row[feature2]
                ),

              z:
                visualization.class0.map(
                  () =>
                    -visualization.classHeight
                ),

              name: "Class 0",

              marker: {
                size: 7,
                color: "#ff8a24",
                opacity: 1,
                line: {
                  color: "#ffffff",
                  width: 1,
                },
              },

              hovertemplate:
                `${feature1}: %{x:.3f}` +
                `<br>${feature2}: %{y:.3f}` +
                `<br>Actual class: 0` +
                `<extra></extra>`,
            },

            /*
             * Class 1
             */
            {
              type: "scatter3d",
              mode: "markers",

              x:
                visualization.class1.map(
                  (row) =>
                    row[feature1]
                ),

              y:
                visualization.class1.map(
                  (row) =>
                    row[feature2]
                ),

              z:
                visualization.class1.map(
                  () =>
                    visualization.classHeight
                ),

              name: "Class 1",

              marker: {
                size: 7,
                color: "#20d875",
                opacity: 1,
                line: {
                  color: "#ffffff",
                  width: 1,
                },
              },

              hovertemplate:
                `${feature1}: %{x:.3f}` +
                `<br>${feature2}: %{y:.3f}` +
                `<br>Actual class: 1` +
                `<extra></extra>`,
            },

            /*
             * Moving decision plane
             */
            {
              type: "surface",

              x:
                visualization.planeX,

              y:
                visualization.planeY,

              z:
                visualization.planeZ,

              name:
                "Decision plane",

              showscale: false,

              opacity: 0.62,

              colorscale: [
                [
                  0,
                  "#6f7cff",
                ],
                [
                  1,
                  "#9aa4ff",
                ],
              ],

              hovertemplate:
                `${feature1}: %{x:.3f}` +
                `<br>${feature2}: %{y:.3f}` +
                `<br>Boundary score: %{z:.3f}` +
                `<extra>Decision plane</extra>`,
            },
          ]}
          layout={{
            autosize: true,

            height: 680,

            margin: {
              l: 0,
              r: 0,
              t: 20,
              b: 0,
            },

            paper_bgcolor:
              "transparent",

            scene: {
              xaxis: {
                title: {
                  text:
                    feature1,
                },

                range: [
                  visualization
                    .xRange.min,
                  visualization
                    .xRange.max,
                ],
              },

              yaxis: {
                title: {
                  text:
                    feature2,
                },

                range: [
                  visualization
                    .yRange.min,
                  visualization
                    .yRange.max,
                ],
              },

              zaxis: {
                title: {
                  text:
                    "Class / Decision Score",
                },
              },

              camera: {
                eye: {
                  x: 1.5,
                  y: 1.5,
                  z: 1.15,
                },
              },

              aspectmode: "cube",
            },

            legend: {
              orientation: "h",

              x: 0,
              y: 1.05,
            },
          }}
          useResizeHandler
          style={{
            width: "100%",
            height: "680px",
          }}
          config={{
            responsive: true,
            displaylogo: false,
          }}
        />
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Intercept β₀
          </span>

          <strong>
            {visualization.intercept.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            β₁ · {feature1}
          </span>

          <strong>
            {visualization.beta1.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            β₂ · {feature2}
          </span>

          <strong>
            {visualization.beta2.toFixed(
              4
            )}
          </strong>
        </div>
      </div>

      <div className="info-box">
        <strong>
          What is moving?
        </strong>{" "}
        Gradient descent changes
        β₀, β₁ and β₂. Therefore the
        decision plane changes its
        position and orientation as
        training progresses.
      </div>

      {model.features.length >
        2 && (
        <div className="info-box">
          This 3D view displays{" "}
          <strong>
            {feature1}
          </strong>{" "}
          and{" "}
          <strong>
            {feature2}
          </strong>
          . The remaining selected
          features are held at their
          standardized value of 0,
          which corresponds to their
          training mean.
        </div>
      )}
    </section>
  );
}