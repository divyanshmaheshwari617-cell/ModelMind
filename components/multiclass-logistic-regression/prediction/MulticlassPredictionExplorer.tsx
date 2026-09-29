import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import type {
  MulticlassModel,
  NumericRow,
} from "../types/multiclassLogisticRegression";

import {
  predictNewSample,
} from "../utils/multiclassMath";

interface Props {
  model: MulticlassModel;
}

export default function MulticlassPredictionExplorer({
  model,
}: Props) {
  const initialValues =
    useMemo(
      () =>
        Object.fromEntries(
          model.scalers.map(
            (scaler) => [
              scaler.feature,
              scaler.mean,
            ]
          )
        ) as NumericRow,
      [model]
    );

  const [
    values,
    setValues,
  ] =
    useState<NumericRow>(
      initialValues
    );

  useEffect(() => {
    setValues(
      initialValues
    );
  }, [initialValues]);

  const prediction =
    predictNewSample(
      values,
      model
    );

  const sorted =
    [...prediction.probabilities].sort(
      (a, b) =>
        b.probability -
        a.probability
    );

  const confidence =
    sorted[0]?.probability ??
    0;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            TRY THE MODEL
          </span>

          <h2>
            Predict a New Sample
          </h2>
        </div>

        <span className="value-pill">
          Prediction:{" "}
          {String(
            prediction.predicted
          )}
        </span>
      </div>

      <p className="muted">
        Change the feature values and watch how
        every class probability changes. The class
        with the highest Softmax probability becomes
        the prediction.
      </p>

      <div className="control-grid">
        {model.scalers.map(
          (scaler) => {
            const span =
              Math.max(
                scaler.std * 4,
                1
              );

            const value =
              values[
                scaler.feature
              ] ??
              scaler.mean;

            return (
              <label
                className="control-card"
                key={
                  scaler.feature
                }
              >
                <span>
                  {scaler.feature}
                </span>

                <strong>
                  {value.toFixed(2)}
                </strong>

                <input
                  type="range"
                  min={
                    scaler.mean -
                    span
                  }
                  max={
                    scaler.mean +
                    span
                  }
                  step={
                    span / 100
                  }
                  value={value}
                  onChange={(event) =>
                    setValues(
                      (current) => ({
                        ...current,

                        [scaler.feature]:
                          Number(
                            event.target
                              .value
                          ),
                      })
                    )
                  }
                />

                <small>
                  Training mean:{" "}
                  {scaler.mean.toFixed(
                    2
                  )}
                </small>
              </label>
            );
          }
        )}
      </div>

      <div className="sub-panel">
        <h3>
          Probability for Every Class
        </h3>

        <Plot
          data={[
            {
              type: "bar",

              x:
                prediction.probabilities.map(
                  (item) =>
                    String(
                      item.classLabel
                    )
                ),

              y:
                prediction.probabilities.map(
                  (item) =>
                    item.probability
                ),

              text:
                prediction.probabilities.map(
                  (item) =>
                    `${(
                      item.probability *
                      100
                    ).toFixed(1)}%`
                ),

              textposition:
                "auto",

              hovertemplate:
                "Class: %{x}" +
                "<br>Probability: %{y:.4f}" +
                "<extra></extra>",
            },
          ]}
          layout={{
            autosize: true,
            height: 420,

            margin: {
              l: 70,
              r: 20,
              t: 20,
              b: 70,
            },

            xaxis: {
              title: {
                text: "Class",
              },
            },

            yaxis: {
              title: {
                text: "Probability",
              },

              range: [0, 1],
            },

            paper_bgcolor:
              "transparent",

            plot_bgcolor:
              "transparent",

            font: {
              color: "#c8d5e6",
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

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Predicted Class
          </span>

          <strong>
            {String(
              prediction.predicted
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Confidence
          </span>

          <strong>
            {(confidence * 100).toFixed(
              1
            )}
            %
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Number of Classes
          </span>

          <strong>
            {model.classes.length}
          </strong>
        </div>
      </div>

      <div className="sub-panel">
        <h3>
          What happened internally?
        </h3>

        <div className="coefficient-list">
          {prediction.logits.map(
            (item) => {
              const probability =
                prediction.probabilities.find(
                  (probabilityItem) =>
                    String(
                      probabilityItem.classLabel
                    ) ===
                    String(
                      item.classLabel
                    )
                )?.probability ??
                0;

              return (
                <div
                  className="coefficient-row"
                  key={String(
                    item.classLabel
                  )}
                >
                  <strong>
                    {String(
                      item.classLabel
                    )}
                  </strong>

                  <div className="muted">
                    Logit z ={" "}
                    {item.score.toFixed(
                      4
                    )}
                    {" → "}
                    Softmax probability ={" "}
                    {(
                      probability *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}