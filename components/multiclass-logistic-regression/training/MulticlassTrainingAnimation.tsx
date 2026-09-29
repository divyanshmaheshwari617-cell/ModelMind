import {
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import type {
  ClassLabel,
  MulticlassModel,
  NumericRow,
} from "../types/multiclassLogisticRegression";

import {
  linearScore,
  softmax,
} from "../utils/multiclassMath";

interface Props {
  model: MulticlassModel;
}

export default function MulticlassTrainingAnimation({
  model,
}: Props) {
  const [
    xFeature,
    setXFeature,
  ] = useState(
    model.features[0] ??
      ""
  );

  const [
    yFeature,
    setYFeature,
  ] = useState(
    model.features[1] ??
      model.features[0] ??
      ""
  );

  const [
    selectedClass,
    setSelectedClass,
  ] =
    useState<ClassLabel>(
      model.classes[0]
    );

  const surface =
    useMemo(() => {
      const xScaler =
        model.scalers.find(
          (scaler) =>
            scaler.feature ===
            xFeature
        );

      const yScaler =
        model.scalers.find(
          (scaler) =>
            scaler.feature ===
            yFeature
        );

      if (
        !xScaler ||
        !yScaler
      ) {
        return null;
      }

      const xMin =
        xScaler.mean -
        3 * xScaler.std;

      const xMax =
        xScaler.mean +
        3 * xScaler.std;

      const yMin =
        yScaler.mean -
        3 * yScaler.std;

      const yMax =
        yScaler.mean +
        3 * yScaler.std;

      const resolution = 38;

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
                const standardized:
                  NumericRow = {};

                model.features.forEach(
                  (feature) => {
                    standardized[
                      feature
                    ] = 0;
                  }
                );

                standardized[
                  xFeature
                ] =
                  (xValue -
                    xScaler.mean) /
                  xScaler.std;

                standardized[
                  yFeature
                ] =
                  (yValue -
                    yScaler.mean) /
                  yScaler.std;

                const logits =
                  model.classParameters.map(
                    (
                      parameters
                    ) =>
                      linearScore(
                        standardized,
                        parameters
                      )
                  );

                const probabilities =
                  softmax(
                    logits
                  );

                const classIndex =
                  model.classes.findIndex(
                    (classLabel) =>
                      String(
                        classLabel
                      ) ===
                      String(
                        selectedClass
                      )
                  );

                return (
                  probabilities[
                    Math.max(
                      classIndex,
                      0
                    )
                  ] ?? 0
                );
              }
            )
        );

      return {
        xGrid,
        yGrid,
        zGrid,
      };
    }, [
      model,
      xFeature,
      yFeature,
      selectedClass,
    ]);

  if (
    model.features.length <
    2
  ) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            3D SOFTMAX SURFACE
          </span>

          <h2>
            Explore Class Probability
            in 3D
          </h2>
        </div>

        <span className="value-pill">
          P(
          {String(
            selectedClass
          )}
          )
        </span>
      </div>

      <p className="muted">
        Height represents the
        Softmax probability of the
        selected class. Move across
        two features to see where
        the model becomes more or
        less confident in that
        class.
      </p>

      <div className="control-grid">
        <label className="control-card">
          <span>
            X feature
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
                setYFeature(
                  model.features.find(
                    (feature) =>
                      feature !==
                      next
                  ) ??
                    next
                );
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

        <label className="control-card">
          <span>
            Y feature
          </span>

          <select
            value={
              yFeature
            }
            onChange={(
              event
            ) =>
              setYFeature(
                event.target
                  .value
              )
            }
          >
            {model.features
              .filter(
                (feature) =>
                  feature !==
                  xFeature
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
            Probability surface
          </span>

          <select
            value={
              String(
                selectedClass
              )
            }
            onChange={(
              event
            ) => {
              const found =
                model.classes.find(
                  (classLabel) =>
                    String(
                      classLabel
                    ) ===
                    event.target
                      .value
                );

              if (
                found !==
                undefined
              ) {
                setSelectedClass(
                  found
                );
              }
            }}
          >
            {model.classes.map(
              (classLabel) => (
                <option
                  key={String(
                    classLabel
                  )}
                  value={String(
                    classLabel
                  )}
                >
                  {String(
                    classLabel
                  )}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      {surface && (
        <div className="sub-panel">
          <Plot
            data={[
              {
                type:
                  "surface" as const,

                x:
                  surface.xGrid,

                y:
                  surface.yGrid,

                z:
                  surface.zGrid,

                opacity: 0.9,

                colorbar: {
                  title: {
                    text:
                      "Probability",
                  },
                },

                hovertemplate:
                  `${xFeature}: %{x:.3f}` +
                  `<br>${yFeature}: %{y:.3f}` +
                  `<br>P(${String(
                    selectedClass
                  )}): %{z:.3f}` +
                  "<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,
              height: 650,

              margin: {
                l: 10,
                r: 10,
                t: 20,
                b: 10,
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
                      `P(${String(
                        selectedClass
                      )})`,
                  },

                  range: [
                    0,
                    1,
                  ],
                },
              },

              paper_bgcolor:
                "transparent",

              font: {
                color:
                  "#c8d5e6",
              },
            }}
            useResizeHandler
            style={{
              width: "100%",
            }}
            config={{
              responsive: true,
              displaylogo:
                false,
            }}
          />
        </div>
      )}

      <div className="info-box">
        The surface is not a separate
        model. It is a visual slice of
        the trained multinomial model.
        Features not shown on the X/Y
        axes are held at their training
        means.
      </div>
    </section>
  );
}