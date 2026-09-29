import Plot from "react-plotly.js";

import type {
  MulticlassModel,
} from "../types/multiclassLogisticRegression";

import {
  generateAllClassROC,
} from "../utils/multiclassMath";

interface Props {
  model: MulticlassModel;
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

export default function MulticlassROCVisualizer({
  model,
}: Props) {
  /*
   * --------------------------------------------------
   * EDUCATIONAL ROC DATA
   * --------------------------------------------------
   *
   * The built-in demo dataset is intentionally tiny.
   *
   * A small test split can contain only one or two
   * positive samples for each One-vs-Rest ROC curve.
   * That makes the ROC graph extremely coarse.
   *
   * For the visualization lab we therefore combine
   * train + test predictions.
   *
   * IMPORTANT:
   * This is labelled "Full Dataset ROC".
   *
   * It is for understanding ROC behavior, NOT for
   * claiming unbiased test performance.
   * --------------------------------------------------
   */

  const predictions = [
    ...model.trainPredictions,
    ...model.testPredictions,
  ];

  const curves =
    generateAllClassROC(
      predictions,
      model.classes
    );

  const validCurves =
    curves.filter(
      (curve) =>
        curve.points.length >= 2
    );

  const macroAUC =
    validCurves.length > 0
      ? validCurves.reduce(
          (sum, curve) =>
            sum + curve.auc,
          0
        ) /
        validCurves.length
      : 0;

  const totalSamples =
    predictions.length;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            ONE-VS-REST ROC
          </span>

          <h2>
            Multiclass ROC-AUC
          </h2>
        </div>

        <span className="value-pill">
          Macro AUC{" "}
          {macroAUC.toFixed(3)}
        </span>
      </div>

      <p className="muted">
        Multiclass ROC is calculated using
        One-vs-Rest. Each class becomes the
        positive class once, while every other
        class is treated as negative.
      </p>

      <div className="info-box">
        <strong>
          Visualization mode:
        </strong>{" "}
        Full Dataset ROC
        <br />
        <br />
        The built-in demo dataset is very small,
        so ModelMind combines training and test
        predictions here to create a more useful
        educational ROC visualization.
        <br />
        <br />
        For real model evaluation, ROC-AUC should
        normally be reported on unseen validation
        or test data.
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Samples visualized
          </span>

          <strong>
            {totalSamples}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Classes
          </span>

          <strong>
            {model.classes.length}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Valid ROC curves
          </span>

          <strong>
            {validCurves.length}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Macro AUC
          </span>

          <strong>
            {macroAUC.toFixed(3)}
          </strong>
        </div>
      </div>

      <div className="sub-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              ROC CURVES
            </span>

            <h3>
              One Curve per Class
            </h3>
          </div>

          <span className="value-pill">
            One-vs-Rest
          </span>
        </div>

        {validCurves.length === 0 ? (
          <div className="warning-box">
            ROC cannot be calculated because the
            current dataset does not contain both
            positive and negative samples for the
            selected classes.
          </div>
        ) : (
          <Plot
            data={[
              ...validCurves.map(
                (
                  curve,
                  index
                ) => ({
                  type:
                    "scatter" as const,

                  mode:
                    "lines+markers" as const,

                  x:
                    curve.points.map(
                      (point) =>
                        point.fpr
                    ),

                  y:
                    curve.points.map(
                      (point) =>
                        point.tpr
                    ),

                  text:
                    curve.points.map(
                      (point) => {
                        let thresholdText =
                          "";

                        if (
                          Number.isFinite(
                            point.threshold
                          )
                        ) {
                          thresholdText =
                            point.threshold.toFixed(
                              4
                            );
                        } else if (
                          point.threshold >
                          0
                        ) {
                          thresholdText =
                            "Above maximum score";
                        } else {
                          thresholdText =
                            "Below minimum score";
                        }

                        return (
                          `Class: ${String(
                            curve.classLabel
                          )}` +
                          `<br>Threshold: ${thresholdText}` +
                          `<br>FPR: ${point.fpr.toFixed(
                            3
                          )}` +
                          `<br>TPR: ${point.tpr.toFixed(
                            3
                          )}`
                        );
                      }
                    ),

                  name:
                    `${String(
                      curve.classLabel
                    )} — AUC ${curve.auc.toFixed(
                      3
                    )}`,

                  line: {
                    width: 3,

                    color:
                      CLASS_COLORS[
                        index %
                          CLASS_COLORS.length
                      ],
                  },

                  marker: {
                    size: 6,

                    color:
                      CLASS_COLORS[
                        index %
                          CLASS_COLORS.length
                      ],
                  },

                  hovertemplate:
                    "%{text}" +
                    "<extra></extra>",
                })
              ),

              {
                type:
                  "scatter" as const,

                mode:
                  "lines" as const,

                x: [0, 1],

                y: [0, 1],

                name:
                  "Random classifier",

                line: {
                  dash:
                    "dash" as const,

                  width: 2,

                  color:
                    "#94a3b8",
                },

                hovertemplate:
                  "Random baseline" +
                  "<br>TPR = FPR" +
                  "<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,

              height: 590,

              margin: {
                l: 75,
                r: 35,
                t: 40,
                b: 75,
              },

              xaxis: {
                title: {
                  text:
                    "False Positive Rate (FPR)",
                },

                range: [
                  -0.03,
                  1.03,
                ],

                dtick: 0.1,

                gridcolor:
                  "rgba(148,163,184,0.15)",

                zeroline: false,
              },

              yaxis: {
                title: {
                  text:
                    "True Positive Rate (TPR)",
                },

                range: [
                  -0.03,
                  1.03,
                ],

                dtick: 0.1,

                gridcolor:
                  "rgba(148,163,184,0.15)",

                zeroline: false,
              },

              legend: {
                orientation: "h",

                x: 0,

                y: 1.16,
              },

              hovermode:
                "closest",

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

              scrollZoom: true,
            }}
          />
        )}
      </div>

      <div className="metric-grid">
        {curves.map(
          (
            curve,
            index
          ) => (
            <div
              className="metric-card"
              key={String(
                curve.classLabel
              )}
            >
              <span
                style={{
                  color:
                    CLASS_COLORS[
                      index %
                        CLASS_COLORS.length
                    ],
                }}
              >
                {String(
                  curve.classLabel
                )} AUC
              </span>

              <strong>
                {curve.points.length >=
                2
                  ? curve.auc.toFixed(
                      3
                    )
                  : "N/A"}
              </strong>

              <small className="muted">
                {
                  curve.points
                    .length
                }{" "}
                ROC points
              </small>
            </div>
          )
        )}
      </div>

      <div className="info-box">
        <strong>
          How to read ROC:
        </strong>

        <br />
        <br />

        The horizontal axis is the False Positive
        Rate. The vertical axis is the True
        Positive Rate.

        <br />
        <br />

        A class curve closer to the upper-left
        corner indicates stronger ranking
        performance for that class.

        <br />
        <br />

        <strong>
          AUC = 1
        </strong>{" "}
        means perfect ranking, while an AUC around
        0.5 corresponds to random-like ranking.

        <br />
        <br />

        The ROC curve is naturally a{" "}
        <strong>staircase</strong> on finite
        datasets because it changes only when the
        threshold passes one of the model's actual
        predicted probabilities.
      </div>
    </section>
  );
}