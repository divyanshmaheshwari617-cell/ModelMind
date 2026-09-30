import type {
  NBRow,
} from "../types/naiveBayes";

import {
  evaluateGaussianNB,
} from "../utils/naiveBayesMath";

import GaussianNBVisualizer from "./GaussianNBVisualizer";

type Props = {
  rows: NBRow[];
  features: string[];
  targetName?: string;
};

export default function GaussianNBLab({
  rows,
  features,
  targetName = "Target",
}: Props) {
  const metrics =
    rows.length >= 4 &&
    features.length > 0
      ? evaluateGaussianNB(
          rows,
          features
        )
      : null;

  return (
    <section style={containerStyle}>
      <section style={introStyle}>
        <div style={eyebrowStyle}>
          GAUSSIAN NB LAB
        </div>

        <h1 style={titleStyle}>
          Continuous Features → Gaussian Distributions → Prediction
        </h1>

        <p style={descriptionStyle}>
          Target:{" "}
          <strong>
            {targetName}
          </strong>
          . Gaussian Naive Bayes
          learns a mean and
          variance for every
          selected feature
          inside every class.
        </p>

        <div style={flowStyle}>
          <span>Dataset</span>
          <span>→</span>
          <span>Class Priors</span>
          <span>→</span>
          <span>Mean + Variance</span>
          <span>→</span>
          <span>Gaussian Likelihood</span>
          <span>→</span>
          <span>Posterior</span>
          <span>→</span>
          <span>Prediction</span>
        </div>
      </section>

      <GaussianNBVisualizer
        rows={rows}
        features={features}
      />

      {metrics && (
        <section style={metricsCardStyle}>
          <div style={eyebrowStyle}>
            HELD-OUT EVALUATION
          </div>

          <h3>
            How does the model perform on unseen rows?
          </h3>

          <p style={descriptionStyle}>
            ModelMind performs a
            stratified train/test
            split first, trains
            Gaussian Naive Bayes
            only on the training
            rows, and evaluates
            the held-out test
            rows.
          </p>

          <div style={metricGridStyle}>
            <Metric
              label="Accuracy"
              value={
                metrics.accuracy
              }
            />

            <Metric
              label="Precision"
              value={
                metrics.precision
              }
            />

            <Metric
              label="Recall"
              value={
                metrics.recall
              }
            />

            <Metric
              label="F1"
              value={
                metrics.f1
              }
            />
          </div>

          <div style={confusionStyle}>
            <strong>
              Confusion Matrix
            </strong>

            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={cellStyle}>
                      Actual ↓ / Predicted →
                    </th>

                    {metrics.confusionMatrix.labels.map(
                      (label) => (
                        <th
                          key={label}
                          style={cellStyle}
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {metrics.confusionMatrix.matrix.map(
                    (row, rowIndex) => (
                      <tr
                        key={
                          metrics.confusionMatrix.labels[
                            rowIndex
                          ]
                        }
                      >
                        <th style={cellStyle}>
                          {
                            metrics.confusionMatrix.labels[
                              rowIndex
                            ]
                          }
                        </th>

                        {row.map(
                          (
                            value,
                            columnIndex
                          ) => (
                            <td
                              key={
                                columnIndex
                              }
                              style={cellStyle}
                            >
                              {value}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={metricStyle}>
      <div style={metricLabelStyle}>
        {label}
      </div>

      <strong style={metricValueStyle}>
        {(value * 100).toFixed(1)}%
      </strong>
    </div>
  );
}

const containerStyle = {
  display: "grid",
  gap: 14,
};

const introStyle = {
  padding: 20,
  borderRadius: 18,
  background:
    "linear-gradient(135deg, #111827, #172554)",
  border: "1px solid #1d4ed8",
};

const eyebrowStyle = {
  color: "#60a5fa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const titleStyle = {
  margin: "6px 0 8px",
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.7,
};

const flowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  marginTop: 12,
  color: "#dbeafe",
  fontWeight: 700,
  fontSize: 13,
};

const metricsCardStyle = {
  padding: 18,
  borderRadius: 16,
  background: "#0f172a",
  border: "1px solid #334155",
};

const metricGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 9,
  marginTop: 12,
};

const metricStyle = {
  padding: 13,
  borderRadius: 10,
  background: "#020617",
  border: "1px solid #1e293b",
};

const metricLabelStyle = {
  color: "#64748b",
  fontSize: 11,
};

const metricValueStyle = {
  display: "block",
  marginTop: 4,
  color: "#f8fafc",
  fontSize: 21,
};

const confusionStyle = {
  marginTop: 14,
};

const tableWrapperStyle = {
  overflowX: "auto" as const,
  marginTop: 9,
};

const tableStyle = {
  borderCollapse: "collapse" as const,
  minWidth: 420,
};

const cellStyle = {
  padding: 9,
  border: "1px solid #334155",
  color: "#cbd5e1",
  textAlign: "center" as const,
};