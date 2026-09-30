import { useMemo, useState } from "react";

import type { NBRow } from "../types/naiveBayes";

import {
  calculateClassificationMetrics,
  predictBernoulliNB,
  stratifiedSplit,
  trainBernoulliNB,
} from "../utils/naiveBayesMath";

import BernoulliNBVisualizer from "./BernoulliNBVisualizer";

type Props = {
  rows: NBRow[];
  features: string[];
  targetName: string;
};

export default function BernoulliNBLab({
  rows,
  features,
  targetName,
}: Props) {
  const [alpha, setAlpha] = useState(1);

  const split = useMemo(
    () => stratifiedSplit(rows, 0.75),
    [rows]
  );

  const model = useMemo(
    () =>
      trainBernoulliNB(
        split.train,
        features,
        alpha
      ),
    [split.train, features, alpha]
  );

  const metrics = useMemo(() => {
    const actual: string[] = [];
    const predicted: string[] = [];

    split.test.forEach((row) => {
      const values: Record<string, number> = {};

      features.forEach((feature) => {
        const raw = row.features[feature];

        const numeric =
          typeof raw === "number"
            ? raw
            : Number(raw ?? 0);

        values[feature] =
          Number.isFinite(numeric) && numeric > 0
            ? 1
            : 0;
      });

      const result =
        predictBernoulliNB(model, values);

      actual.push(row.target);
      predicted.push(result.predictedClass);
    });

    return calculateClassificationMetrics(
      actual,
      predicted
    );
  }, [split.test, model, features]);

  return (
    <div style={container}>
      <section style={header}>
        <div>
          <div style={eyebrow}>
            MODELMIND MODEL LAB
          </div>

          <h2 style={title}>
            Bernoulli Naive Bayes
          </h2>

          <p style={description}>
            Target: <strong>{targetName}</strong>. Learn how binary
            presence and absence become evidence for a classification.
          </p>
        </div>

        <div style={alphaBox}>
          <label style={label}>
            Laplace α
          </label>

          <input
            type="number"
            min={0.1}
            max={5}
            step={0.1}
            value={alpha}
            onChange={(event) => {
              const value = Number(event.target.value);

              if (Number.isFinite(value) && value > 0) {
                setAlpha(value);
              }
            }}
            style={input}
          />

          <div style={help}>Default: 1</div>
        </div>
      </section>

      <section style={summaryGrid}>
        <Summary label="Total Emails" value={rows.length} />
        <Summary label="Training" value={split.train.length} />
        <Summary label="Held-out Test" value={split.test.length} />
        <Summary label="Binary Features" value={features.length} />
      </section>

      <BernoulliNBVisualizer model={model} />

      <section style={metricsSection}>
        <div style={eyebrow}>
          HELD-OUT EVALUATION
        </div>

        <h3 style={{ margin: "5px 0 7px" }}>
          Classification performance
        </h3>

        <p style={description}>
          These results come from emails that were not used to train
          this model.
        </p>

        <div style={metricGrid}>
          <Metric label="Accuracy" value={metrics.accuracy} />
          <Metric label="Precision" value={metrics.precision} />
          <Metric label="Recall" value={metrics.recall} />
          <Metric label="F1 Score" value={metrics.f1} />
        </div>

        <div style={matrixSection}>
          <h4>Confusion Matrix</h4>

          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>
                    Actual ↓ / Predicted →
                  </th>

                  {metrics.confusionMatrix.labels.map((label) => (
                    <th key={label} style={th}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {metrics.confusionMatrix.labels.map(
                  (actualLabel, rowIndex) => (
                    <tr key={actualLabel}>
                      <td style={td}>
                        <strong>{actualLabel}</strong>
                      </td>

                      {metrics.confusionMatrix.matrix[
                        rowIndex
                      ].map((value, columnIndex) => (
                        <td
                          key={`${rowIndex}-${columnIndex}`}
                          style={{
                            ...td,
                            color:
                              rowIndex === columnIndex
                                ? "#34d399"
                                : "#fca5a5",
                            fontWeight: 900,
                          }}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={summaryCard}>
      <span style={smallLabel}>{label}</span>
      <strong style={summaryValue}>{value}</strong>
    </div>
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
    <div style={summaryCard}>
      <span style={smallLabel}>{label}</span>

      <strong style={metricValue}>
        {(value * 100).toFixed(1)}%
      </strong>
    </div>
  );
}

const container = {
  display: "grid",
  gap: 16,
};

const header = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "space-between",
  gap: 16,
  padding: 20,
  borderRadius: 17,
  border: "1px solid #334155",
  background: "#0f172a",
};

const eyebrow = {
  color: "#6ee7b7",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = {
  margin: "5px 0 7px",
  fontSize: 28,
};

const description = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const alphaBox = {
  minWidth: 160,
  padding: 12,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #334155",
};

const label = {
  display: "block",
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 900,
  marginBottom: 6,
};

const input = {
  width: "100%",
  padding: "8px 9px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#f8fafc",
};

const help = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 10,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 9,
};

const summaryCard = {
  padding: 13,
  borderRadius: 11,
  background: "#0f172a",
  border: "1px solid #334155",
};

const smallLabel = {
  display: "block",
  color: "#94a3b8",
  fontSize: 11,
};

const summaryValue = {
  display: "block",
  marginTop: 4,
  fontSize: 23,
};

const metricsSection = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const metricGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 9,
  marginTop: 13,
};

const metricValue = {
  display: "block",
  marginTop: 5,
  color: "#34d399",
  fontSize: 22,
};

const matrixSection = {
  marginTop: 16,
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const th = {
  padding: 10,
  textAlign: "center" as const,
  borderBottom: "1px solid #334155",
  color: "#94a3b8",
  fontSize: 11,
};

const td = {
  padding: 10,
  textAlign: "center" as const,
  borderBottom: "1px solid #1e293b",
  color: "#cbd5e1",
};