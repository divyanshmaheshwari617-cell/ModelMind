import {
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import {
  LogisticPrediction,
} from "../types/logisticRegression";

import {
  binaryCrossEntropy,
  calculateAUC,
  generateROC,
} from "../utils/logisticMath";

interface Props {
  predictions:
    LogisticPrediction[];
}

function range(
  start: number,
  end: number,
  count: number
) {
  if (count <= 1) {
    return [start];
  }

  const step =
    (end - start) /
    (count - 1);

  return Array.from(
    { length: count },
    (_, index) =>
      start +
      index * step
  );
}

export default function ROCLossVisualizer({
  predictions,
}: Props) {
  const [
    actual,
    setActual,
  ] = useState<0 | 1>(1);

  const [
    probability,
    setProbability,
  ] = useState(0.8);

  /*
   * Generate the ROC points from
   * the fixed predicted
   * probabilities.
   */
  const roc =
    useMemo(
      () =>
        generateROC(
          predictions
        ),
      [predictions]
    );

  const auc =
    useMemo(
      () =>
        calculateAUC(roc),
      [roc]
    );

  /*
   * Sort explicitly by FPR and
   * then TPR so Plotly connects
   * the ROC path in a predictable
   * order.
   */
  const sortedROC =
    useMemo(
      () =>
        [...roc].sort(
          (a, b) => {
            if (
              a.fpr !== b.fpr
            ) {
              return (
                a.fpr -
                b.fpr
              );
            }

            return (
              a.tpr -
              b.tpr
            );
          }
        ),
      [roc]
    );

  /*
   * Find the ROC point closest
   * to threshold 0.5 so students
   * can connect the default
   * classification threshold to
   * one point on the ROC curve.
   */
  const defaultPoint =
    useMemo(() => {
      if (
        sortedROC.length === 0
      ) {
        return null;
      }

      return sortedROC.reduce(
        (best, point) => {
          const bestDistance =
            Math.abs(
              best.threshold -
                0.5
            );

          const pointDistance =
            Math.abs(
              point.threshold -
                0.5
            );

          return pointDistance <
            bestDistance
            ? point
            : best;
        }
      );
    }, [sortedROC]);

  /*
   * Cross-entropy visualizer.
   */
  const probabilities =
    useMemo(
      () =>
        range(
          0.01,
          0.99,
          150
        ),
      []
    );

  const positiveLoss =
    useMemo(
      () =>
        probabilities.map(
          (p) =>
            binaryCrossEntropy(
              1,
              p
            )
        ),
      [probabilities]
    );

  const negativeLoss =
    useMemo(
      () =>
        probabilities.map(
          (p) =>
            binaryCrossEntropy(
              0,
              p
            )
        ),
      [probabilities]
    );

  const currentLoss =
    binaryCrossEntropy(
      actual,
      probability
    );

  const positives =
    predictions.filter(
      (prediction) =>
        prediction.actual === 1
    ).length;

  const negatives =
    predictions.filter(
      (prediction) =>
        prediction.actual === 0
    ).length;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            MODEL EVALUATION
          </span>

          <h2>
            ROC-AUC & Log Loss
          </h2>
        </div>

        <span className="value-pill">
          AUC ={" "}
          {auc.toFixed(3)}
        </span>
      </div>

      <p className="muted">
        ROC evaluates the ranking
        ability of the model across
        many classification
        thresholds. Log Loss instead
        evaluates the quality of the
        predicted probabilities
        themselves.
      </p>

      <div className="control-grid">
        {/* ==========================
            ROC / AUC
        ========================== */}

        <div className="sub-panel">
          <div className="section-heading">
            <div>
              <h3>
                ROC Curve
              </h3>

              <p className="muted">
                Each marker is a
                different decision
                threshold.
              </p>
            </div>

            <span className="value-pill">
              AUC{" "}
              {auc.toFixed(3)}
            </span>
          </div>

          {positives === 0 ||
          negatives === 0 ? (
            <div className="warning-box">
              ROC-AUC requires both
              class 0 and class 1 in
              the evaluation data.
              The current test split
              does not contain both
              classes.
            </div>
          ) : (
            <>
              <Plot
                data={[
                  /*
                   * Filled ROC path.
                   */
                  {
                    type:
                      "scatter",

                    mode:
                      "lines+markers",

                    x:
                      sortedROC.map(
                        (point) =>
                          point.fpr
                      ),

                    y:
                      sortedROC.map(
                        (point) =>
                          point.tpr
                      ),

                    customdata:
                      sortedROC.map(
                        (point) => [
                          point.threshold,
                        ]
                      ),

                    name:
                      "ROC curve",

                    fill:
                      "tozeroy",

                    fillcolor:
                      "rgba(76, 125, 255, 0.18)",

                    line: {
                      color:
                        "#4ea8ff",
                      width: 5,
                    },

                    marker: {
                      color:
                        "#7cc4ff",
                      size: 9,
                      line: {
                        color:
                          "#ffffff",
                        width: 1,
                      },
                    },

                    hovertemplate:
                      "FPR: %{x:.3f}" +
                      "<br>TPR: %{y:.3f}" +
                      "<br>Threshold: %{customdata[0]:.3f}" +
                      "<extra>ROC point</extra>",
                  },

                  /*
                   * Random classifier
                   * reference line.
                   */
                  {
                    type:
                      "scatter",

                    mode:
                      "lines",

                    x: [0, 1],
                    y: [0, 1],

                    name:
                      "Random classifier",

                    line: {
                      color:
                        "#ff9d3d",
                      width: 3,
                      dash: "dash",
                    },

                    hoverinfo:
                      "skip",
                  },

                  /*
                   * Default threshold
                   * operating point.
                   */
                  ...(defaultPoint
                    ? [
                        {
                          type:
                            "scatter" as const,

                          mode:
                            "markers+text" as const,

                          x: [
                            defaultPoint.fpr,
                          ],

                          y: [
                            defaultPoint.tpr,
                          ],

                          text: [
                            "t≈0.50",
                          ],

                          textposition:
                            "bottom right" as const,

                          name:
                            "Default threshold",

                          marker: {
                            color:
                              "#ffdf5d",
                            size: 15,
                            symbol:
                              "diamond" as const,

                            line: {
                              color:
                                "#ffffff",
                              width: 2,
                            },
                          },

                          hovertemplate:
                            `Default threshold` +
                            `<br>FPR: ${defaultPoint.fpr.toFixed(
                              3
                            )}` +
                            `<br>TPR: ${defaultPoint.tpr.toFixed(
                              3
                            )}` +
                            `<br>Threshold: ${defaultPoint.threshold.toFixed(
                              3
                            )}` +
                            `<extra></extra>`,
                        },
                      ]
                    : []),
                ]}
                layout={{
                  autosize: true,

                  height: 520,

                  margin: {
                    l: 70,
                    r: 35,
                    t: 35,
                    b: 70,
                  },

                  xaxis: {
                    title: {
                      text:
                        "False Positive Rate (FPR)",
                    },

                    range: [
                      -0.04,
                      1.04,
                    ],

                    dtick: 0.2,

                    zeroline:
                      false,
                  },

                  yaxis: {
                    title: {
                      text:
                        "True Positive Rate (TPR / Recall)",
                    },

                    range: [
                      -0.04,
                      1.04,
                    ],

                    dtick: 0.2,

                    zeroline:
                      false,
                  },

                  paper_bgcolor:
                    "transparent",

                  plot_bgcolor:
                    "#0b1220",

                  legend: {
                    orientation:
                      "h",

                    x: 0,
                    y: 1.12,
                  },

                  annotations: [
                    {
                      x: 0.64,
                      y: 0.16,

                      xref: "paper",
                      yref: "paper",

                      text:
                        `AUC = ${auc.toFixed(
                          3
                        )}`,

                      showarrow:
                        false,

                      font: {
                        size: 18,
                        color:
                          "#dbe8ff",
                      },

                      bgcolor:
                        "rgba(10, 17, 31, 0.85)",

                      bordercolor:
                        "#43577d",

                      borderwidth:
                        1,

                      borderpad:
                        8,
                    },
                  ],
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

              <div className="metric-grid">
                <div className="metric-card">
                  <span>
                    ROC-AUC
                  </span>

                  <strong>
                    {auc.toFixed(
                      3
                    )}
                  </strong>
                </div>

                <div className="metric-card">
                  <span>
                    Positive samples
                  </span>

                  <strong>
                    {positives}
                  </strong>
                </div>

                <div className="metric-card">
                  <span>
                    Negative samples
                  </span>

                  <strong>
                    {negatives}
                  </strong>
                </div>

                <div className="metric-card">
                  <span>
                    ROC points
                  </span>

                  <strong>
                    {
                      sortedROC.length
                    }
                  </strong>
                </div>
              </div>

              <div className="info-box">
                <strong>
                  Why can the curve
                  hug the left and
                  top edges?
                </strong>{" "}
                If the model ranks
                every positive sample
                above every negative
                sample, the ROC curve
                can go from (0,0) to
                (0,1) and then to
                (1,1), producing an
                AUC close to 1. That
                is a valid ROC curve,
                not a missing graph.
              </div>

              <div className="sub-panel">
                <h3>
                  Threshold points
                </h3>

                <div
                  className="table-wrap"
                  style={{
                    maxHeight:
                      "260px",
                    overflowY:
                      "auto",
                  }}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Threshold
                        </th>

                        <th>
                          FPR
                        </th>

                        <th>
                          TPR
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {sortedROC.map(
                        (
                          point,
                          index
                        ) => (
                          <tr
                            key={
                              index
                            }
                          >
                            <td>
                              {Number.isFinite(
                                point.threshold
                              )
                                ? point.threshold.toFixed(
                                    3
                                  )
                                : "∞"}
                            </td>

                            <td>
                              {point.fpr.toFixed(
                                3
                              )}
                            </td>

                            <td>
                              {point.tpr.toFixed(
                                3
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ==========================
            LOG LOSS
        ========================== */}

        <div className="sub-panel">
          <h3>
            Cross-Entropy /
            Log Loss
          </h3>

          <p className="muted">
            Move the predicted
            probability and see how
            strongly Logistic
            Regression penalizes
            confident mistakes.
          </p>

          <div className="feature-chip-row">
            <button
              type="button"
              className={
                actual === 1
                  ? "target-chip"
                  : "feature-chip"
              }
              onClick={() =>
                setActual(1)
              }
            >
              Actual = 1
            </button>

            <button
              type="button"
              className={
                actual === 0
                  ? "target-chip"
                  : "feature-chip"
              }
              onClick={() =>
                setActual(0)
              }
            >
              Actual = 0
            </button>
          </div>

          <label className="control-card">
            <span>
              Predicted P(y=1)
            </span>

            <strong>
              {probability.toFixed(
                2
              )}
            </strong>

            <input
              type="range"
              min={0.01}
              max={0.99}
              step={0.01}
              value={
                probability
              }
              onChange={(
                event
              ) =>
                setProbability(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />

            <small>
              Actual class ={" "}
              {actual}
            </small>
          </label>

          <Plot
            data={[
              {
                type:
                  "scatter",

                mode:
                  "lines",

                x:
                  probabilities,

                y:
                  actual === 1
                    ? positiveLoss
                    : negativeLoss,

                name:
                  `Loss for y=${actual}`,

                line: {
                  color:
                    "#7c8cff",
                  width: 4,
                },
              },

              {
                type:
                  "scatter",

                mode:
                  "markers+text",

                x: [
                  probability,
                ],

                y: [
                  currentLoss,
                ],

                text: [
                  currentLoss.toFixed(
                    3
                  ),
                ],

                textposition:
                  "top center",

                name:
                  "Current prediction",

                marker: {
                  color:
                    "#ffcf5c",
                  size: 14,

                  line: {
                    color:
                      "#ffffff",
                    width: 1,
                  },
                },
              },
            ]}
            layout={{
              autosize: true,

              height: 420,

              xaxis: {
                title: {
                  text:
                    "Predicted P(y=1)",
                },

                range: [
                  0,
                  1,
                ],
              },

              yaxis: {
                title: {
                  text:
                    "Binary Cross-Entropy",
                },
              },

              margin: {
                l: 70,
                r: 25,
                t: 30,
                b: 60,
              },

              paper_bgcolor:
                "transparent",

              plot_bgcolor:
                "#0b1220",

              legend: {
                orientation:
                  "h",
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

          <div className="metric-grid">
            <div className="metric-card">
              <span>
                Actual class
              </span>

              <strong>
                {actual}
              </strong>
            </div>

            <div className="metric-card">
              <span>
                Predicted probability
              </span>

              <strong>
                {probability.toFixed(
                  2
                )}
              </strong>
            </div>

            <div className="metric-card">
              <span>
                Current Log Loss
              </span>

              <strong>
                {currentLoss.toFixed(
                  4
                )}
              </strong>
            </div>
          </div>

          <div className="info-box">
            If the actual class is 1,
            predicting a probability
            close to 1 gives low
            loss. Predicting close to
            0 gives a very large
            loss. For actual class 0,
            the behavior is reversed.
          </div>
        </div>
      </div>
    </section>
  );
}