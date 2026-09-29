import {
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import type {
  ClassLabel,
} from "../types/multiclassLogisticRegression";

import {
  softmax,
} from "../utils/multiclassMath";

interface Props {
  classes: ClassLabel[];
}

export default function SoftmaxVisualizer({
  classes,
}: Props) {
  const visibleClasses =
    classes.slice(0, 8);

  const [logits, setLogits] =
    useState<number[]>(
      visibleClasses.map(
        (_, index) =>
          index === 0
            ? 1.5
            : 0.5 - index * 0.3
      )
    );

  /*
   * Uploaded datasets may change
   * class count. Build a safe array
   * for the current class list.
   */
  const safeLogits =
    useMemo(
      () =>
        visibleClasses.map(
          (_, index) =>
            Number.isFinite(
              logits[index]
            )
              ? logits[index]
              : 0
        ),
      [
        visibleClasses,
        logits,
      ]
    );

  const probabilities =
    softmax(safeLogits);

  let winningIndex = 0;

  probabilities.forEach(
    (probability, index) => {
      if (
        probability >
        probabilities[
          winningIndex
        ]
      ) {
        winningIndex = index;
      }
    }
  );

  function updateLogit(
    index: number,
    value: number
  ) {
    setLogits(
      (current) => {
        const next =
          visibleClasses.map(
            (_, classIndex) =>
              Number.isFinite(
                current[
                  classIndex
                ]
              )
                ? current[
                    classIndex
                  ]
                : 0
          );

        next[index] =
          value;

        return next;
      }
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            SOFTMAX LAB
          </span>

          <h2>
            From Class Scores to Probabilities
          </h2>
        </div>

        <span className="value-pill">
          ΣP ={" "}
          {probabilities
            .reduce(
              (sum, value) =>
                sum + value,
              0
            )
            .toFixed(3)}
        </span>
      </div>

      <p className="muted">
        Multiclass Logistic Regression creates one
        score (logit) for every class. Softmax
        converts those scores into probabilities
        that add to 1.
      </p>

      {classes.length > 8 && (
        <div className="warning-box">
          This teaching visualizer displays the
          first 8 classes to keep the controls
          readable. The actual model still trains
          on all {classes.length} classes.
        </div>
      )}

      <div className="control-grid">
        {visibleClasses.map(
          (classLabel, index) => (
            <label
              className="control-card"
              key={`${String(
                classLabel
              )}-${index}`}
            >
              <span>
                z({String(classLabel)})
              </span>

              <strong>
                {safeLogits[
                  index
                ].toFixed(2)}
              </strong>

              <input
                type="range"
                min={-5}
                max={5}
                step={0.05}
                value={
                  safeLogits[index]
                }
                onChange={(event) =>
                  updateLogit(
                    index,
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              />

              <small>
                Raw score before Softmax
              </small>
            </label>
          )
        )}
      </div>

      <div className="sub-panel">
        <h3>
          Softmax Probabilities
        </h3>

        <Plot
          data={[
            {
              type: "bar",

              x:
                visibleClasses.map(
                  (classLabel) =>
                    String(
                      classLabel
                    )
                ),

              y:
                probabilities,

              text:
                probabilities.map(
                  (probability) =>
                    `${(
                      probability *
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
            height: 400,

            margin: {
              l: 70,
              r: 20,
              t: 25,
              b: 70,
            },

            xaxis: {
              title: {
                text:
                  "Class",
              },
            },

            yaxis: {
              title: {
                text:
                  "Softmax Probability",
              },

              range: [
                0,
                1,
              ],
            },

            paper_bgcolor:
              "transparent",

            plot_bgcolor:
              "transparent",
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
        {visibleClasses.map(
          (classLabel, index) => (
            <div
              className="metric-card"
              key={`probability-${String(
                classLabel
              )}`}
            >
              <span>
                {String(
                  classLabel
                )}
              </span>

              <strong>
                {(
                  probabilities[
                    index
                  ] * 100
                ).toFixed(1)}
                %
              </strong>
            </div>
          )
        )}
      </div>

      <div className="info-box">
        <strong>
          Predicted class:{" "}
          {String(
            visibleClasses[
              winningIndex
            ]
          )}
        </strong>
        <br />
        Softmax itself does not use a binary
        0.50 threshold. The class with the
        highest probability is selected.
      </div>
    </section>
  );
}