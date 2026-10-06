import Plot from "react-plotly.js";

import {
  ClassificationMetrics,
  LogisticPrediction,
} from "../types/logisticRegression";

import {
  applyThreshold,
  calculateMetrics,
} from "../utils/logisticMath";

interface Props {
  predictions: LogisticPrediction[];
  threshold: number;
  onThresholdChange: (
    threshold: number
  ) => void;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ConfusionMatrix({
  metrics,
}: {
  metrics: ClassificationMetrics;
}) {
  return (
    <div className="sub-panel">
      <h3>Confusion Matrix</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        <div className="success-box">
          <strong>
            TP = {metrics.tp}
          </strong>
          <div>
            Actual 1 → Predicted 1
          </div>
        </div>

        <div className="warning-box">
          <strong>
            FN = {metrics.fn}
          </strong>
          <div>
            Actual 1 → Predicted 0
          </div>
        </div>

        <div className="warning-box">
          <strong>
            FP = {metrics.fp}
          </strong>
          <div>
            Actual 0 → Predicted 1
          </div>
        </div>

        <div className="success-box">
          <strong>
            TN = {metrics.tn}
          </strong>
          <div>
            Actual 0 → Predicted 0
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThresholdExplorer({
  predictions,
  threshold,
  onThresholdChange,
}: Props) {
  const updated =
    applyThreshold(
      predictions,
      threshold
    );

  const metrics =
    calculateMetrics(updated);

  const class0 =
    updated.filter(
      (item) =>
        item.actual === 0
    );

  const class1 =
    updated.filter(
      (item) =>
        item.actual === 1
    );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            CLASSIFICATION THRESHOLD
          </span>

          <h2>
            Probability → Class
          </h2>
        </div>

        <span className="value-pill">
          Threshold ={" "}
          {threshold.toFixed(2)}
        </span>
      </div>

      <p className="muted">
        Moving the threshold does
        not retrain Logistic
        Regression. The predicted
        probabilities stay the same;
        only the final class decision
        changes.
      </p>

      <label className="control-card">
        <span>
          Decision threshold
        </span>

        <strong>
          {threshold.toFixed(2)}
        </strong>

        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={threshold}
          onChange={(event) =>
            onThresholdChange(
              Number(
                event.target.value
              )
            )
          }
        />

        <small>
          Probability ≥ threshold
          becomes class 1.
        </small>
      </label>

      <Plot
        data={[
          {
            type: "scatter",
            mode: "markers",
            x: class0.map(
              (_, index) =>
                index
            ),
            y: class0.map(
              (item) =>
                item.probability
            ),
            name: "Actual class 0",
            marker: {
              size: 10,
            },
          },
          {
            type: "scatter",
            mode: "markers",
            x: class1.map(
              (_, index) =>
                index +
                class0.length
            ),
            y: class1.map(
              (item) =>
                item.probability
            ),
            name: "Actual class 1",
            marker: {
              size: 10,
            },
          },
          {
            type: "scatter",
            mode: "lines",
            x: [
              0,
              Math.max(
                predictions.length,
                1
              ),
            ],
            y: [
              threshold,
              threshold,
            ],
            name:
              "Decision threshold",
            line: {
              dash: "dash",
              width: 3,
            },
          },
        ]}
        layout={{
          autosize: true,
          height: 420,

          xaxis: {
            title: {
              text: "Test samples",
            },
          },

          yaxis: {
            title: {
              text:
                "Predicted probability",
            },
            range: [0, 1],
          },

          margin: {
            l: 65,
            r: 30,
            t: 30,
            b: 60,
          },

          paper_bgcolor:
            "transparent",
          plot_bgcolor:
            "transparent",

          legend: {
            orientation: "h",
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
        <Metric
          label="Accuracy"
          value={`${(
            metrics.accuracy * 100
          ).toFixed(1)}%`}
        />

        <Metric
          label="Precision"
          value={metrics.precision.toFixed(
            3
          )}
        />

        <Metric
          label="Recall"
          value={metrics.recall.toFixed(
            3
          )}
        />

        <Metric
          label="Specificity"
          value={metrics.specificity.toFixed(
            3
          )}
        />

        <Metric
          label="F1"
          value={metrics.f1.toFixed(
            3
          )}
        />

        <Metric
          label="Log Loss"
          value={metrics.logLoss.toFixed(
            3
          )}
        />
      </div>

      <ConfusionMatrix
        metrics={metrics}
      />

      <div className="info-box">
        Lower thresholds generally
        classify more samples as
        positive, which can increase
        recall but also increase
        false positives. Higher
        thresholds usually do the
        opposite.
      </div>
    </section>
  );
}