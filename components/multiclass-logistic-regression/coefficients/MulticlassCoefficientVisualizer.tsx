import Plot from "react-plotly.js";

import type {
  MulticlassModel,
} from "../types/multiclassLogisticRegression";

interface Props {
  model: MulticlassModel;
}

export default function MulticlassCoefficientVisualizer({
  model,
}: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            COEFFICIENTS
          </span>

          <h2>
            What Has Each Class Learned?
          </h2>
        </div>

        <span className="value-pill">
          {model.classes.length} coefficient vectors
        </span>
      </div>

      <p className="muted">
        Every class has its own coefficient
        vector. Positive and negative values
        change that class's logit before
        Softmax compares all classes.
      </p>

      <div className="sub-panel">
        <Plot
          data={model.classParameters.map(
            (parameters) => ({
              type: "bar" as const,

              name:
                String(
                  parameters.classLabel
                ),

              x:
                model.features,

              y:
                model.features.map(
                  (feature) =>
                    parameters
                      .coefficients[
                      feature
                    ] ?? 0
                ),

              hovertemplate:
                "Feature: %{x}" +
                "<br>Coefficient: %{y:.4f}" +
                "<extra></extra>",
            })
          )}
          layout={{
            autosize: true,
            height: 500,

            barmode: "group",

            margin: {
              l: 70,
              r: 20,
              t: 30,
              b: 100,
            },

            xaxis: {
              title: {
                text:
                  "Standardized Feature",
              },
            },

            yaxis: {
              title: {
                text:
                  "Coefficient",
              },

              zeroline: true,
            },

            legend: {
              orientation:
                "h",
            },

            paper_bgcolor:
              "transparent",

            plot_bgcolor:
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
            displaylogo: false,
          }}
        />
      </div>

      <div className="coefficient-list">
        {model.classParameters.map(
          (parameters) => (
            <div
              className="coefficient-row"
              key={String(
                parameters.classLabel
              )}
            >
              <strong>
                {String(
                  parameters.classLabel
                )}
              </strong>

              <div className="muted">
                Intercept ={" "}
                {parameters.intercept.toFixed(
                  4
                )}
              </div>

              {model.features.map(
                (feature) => (
                  <div
                    key={
                      feature
                    }
                  >
                    {feature}:{" "}
                    <strong>
                      {(
                        parameters
                          .coefficients[
                          feature
                        ] ?? 0
                      ).toFixed(
                        4
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          )
        )}
      </div>

      <div className="info-box">
        Because ModelMind standardizes
        the features before training,
        coefficient magnitudes are more
        directly comparable than they
        would be on unrelated raw
        feature scales.
      </div>
    </section>
  );
}