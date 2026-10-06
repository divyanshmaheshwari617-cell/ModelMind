import Plot from "react-plotly.js";

import type {
  MulticlassModel,
} from "../types/multiclassLogisticRegression";

import {
  calculateMulticlassMetrics,
  createConfusionMatrix,
} from "../utils/multiclassMath";

interface Props {
  model: MulticlassModel;
}

export default function MulticlassMetricsVisualizer({
  model,
}: Props) {
  const predictions =
    model.testPredictions.length > 0
      ? model.testPredictions
      : model.trainPredictions;

  const confusion =
    createConfusionMatrix(
      predictions,
      model.classes
    );

  const metrics =
    calculateMulticlassMetrics(
      predictions,
      model.classes
    );

  const labels =
    model.classes.map(
      (classLabel) =>
        String(classLabel)
    );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            MULTICLASS EVALUATION
          </span>

          <h2>
            Confusion Matrix & Class Metrics
          </h2>
        </div>

        <span className="value-pill">
          {(metrics.accuracy * 100).toFixed(1)}% accuracy
        </span>
      </div>

      <p className="muted">
        In multiclass classification, the confusion
        matrix becomes N × N. Rows represent actual
        classes and columns represent predicted classes.
      </p>

      <div className="sub-panel">
        <h3>
          N × N Confusion Matrix
        </h3>

        <Plot
          data={[
            {
              type: "heatmap",
              z: confusion.matrix,
              x: labels,
              y: labels,
              text: confusion.matrix.map(
                (row) =>
                  row.map(
                    (value) =>
                      String(value)
                  )
              ),
              texttemplate: "%{text}",
              hovertemplate:
                "Actual: %{y}" +
                "<br>Predicted: %{x}" +
                "<br>Samples: %{z}" +
                "<extra></extra>",
              showscale: true,
            },
          ]}
          layout={{
            autosize: true,
            height: 480,

            margin: {
              l: 100,
              r: 40,
              t: 30,
              b: 90,
            },

            xaxis: {
              title: {
                text: "Predicted Class",
              },
            },

            yaxis: {
              title: {
                text: "Actual Class",
              },
              autorange: "reversed",
            },

            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
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
          <span>Accuracy</span>

          <strong>
            {(metrics.accuracy * 100).toFixed(1)}%
          </strong>
        </div>

        <div className="metric-card">
          <span>Macro Precision</span>

          <strong>
            {(metrics.macroPrecision * 100).toFixed(1)}%
          </strong>
        </div>

        <div className="metric-card">
          <span>Macro Recall</span>

          <strong>
            {(metrics.macroRecall * 100).toFixed(1)}%
          </strong>
        </div>

        <div className="metric-card">
          <span>Macro F1</span>

          <strong>
            {(metrics.macroF1 * 100).toFixed(1)}%
          </strong>
        </div>

        <div className="metric-card">
          <span>Weighted F1</span>

          <strong>
            {(metrics.weightedF1 * 100).toFixed(1)}%
          </strong>
        </div>
      </div>

      <div className="sub-panel">
        <h3>
          Per-Class Performance
        </h3>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1</th>
                <th>Specificity</th>
                <th>Support</th>
              </tr>
            </thead>

            <tbody>
              {metrics.perClass.map(
                (item) => (
                  <tr
                    key={String(
                      item.classLabel
                    )}
                  >
                    <td>
                      {String(
                        item.classLabel
                      )}
                    </td>

                    <td>
                      {(
                        item.precision *
                        100
                      ).toFixed(1)}
                      %
                    </td>

                    <td>
                      {(
                        item.recall *
                        100
                      ).toFixed(1)}
                      %
                    </td>

                    <td>
                      {(
                        item.f1 *
                        100
                      ).toFixed(1)}
                      %
                    </td>

                    <td>
                      {(
                        item.specificity *
                        100
                      ).toFixed(1)}
                      %
                    </td>

                    <td>
                      {item.support}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-box">
        <strong>Macro metrics</strong> give every class
        equal importance. <strong>Weighted metrics</strong>{" "}
        account for how many samples belong to each class.
      </div>
    </section>
  );
}