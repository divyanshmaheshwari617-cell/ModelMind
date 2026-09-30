import { useMemo, useState } from "react";

import type {
  NBRow,
} from "../types/naiveBayes";

import {
  calculateClassificationMetrics,
  predictMultinomialNB,
  stratifiedSplit,
  trainMultinomialNB,
} from "../utils/naiveBayesMath";

import MultinomialNBVisualizer from "./MultinomialNBVisualizer";

type Props = {
  rows: NBRow[];
  features: string[];
  targetName: string;
};

export default function MultinomialNBLab({
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
      trainMultinomialNB(
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
      const featureValues: Record<string, number> = {};

      features.forEach((feature) => {
        const raw = row.features[feature];

        const numeric =
          typeof raw === "number"
            ? raw
            : Number(raw ?? 0);

        featureValues[feature] =
          Number.isFinite(numeric)
            ? Math.max(0, numeric)
            : 0;
      });

      const result =
        predictMultinomialNB(
          model,
          featureValues
        );

      actual.push(row.target);
      predicted.push(
        result.predictedClass
      );
    });

    return calculateClassificationMetrics(
      actual,
      predicted
    );
  }, [
    split.test,
    model,
    features,
  ]);

  return (
    <div style={containerStyle}>
      <section style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            MODELMIND MODEL LAB
          </div>

          <h2 style={titleStyle}>
            Multinomial Naive Bayes
          </h2>

          <p style={descriptionStyle}>
            Target: <strong>{targetName}</strong>. Train the model on
            word-count features, inspect Laplace smoothing and then
            create new emails to understand every prediction.
          </p>
        </div>

        <div style={alphaControlStyle}>
          <label style={alphaLabelStyle}>
            Laplace α
          </label>

          <input
            type="number"
            min={0.1}
            max={5}
            step={0.1}
            value={alpha}
            onChange={(event) => {
              const value =
                Number(event.target.value);

              if (
                Number.isFinite(value) &&
                value > 0
              ) {
                setAlpha(value);
              }
            }}
            style={alphaInputStyle}
          />

          <div style={alphaHelpStyle}>
            Default: 1
          </div>
        </div>
      </section>

      <section style={splitStyle}>
        <div style={splitCardStyle}>
          <span style={metricLabelStyle}>
            Total Emails
          </span>

          <strong style={bigValueStyle}>
            {rows.length}
          </strong>
        </div>

        <div style={splitCardStyle}>
          <span style={metricLabelStyle}>
            Training
          </span>

          <strong style={bigValueStyle}>
            {split.train.length}
          </strong>
        </div>

        <div style={splitCardStyle}>
          <span style={metricLabelStyle}>
            Held-out Test
          </span>

          <strong style={bigValueStyle}>
            {split.test.length}
          </strong>
        </div>

        <div style={splitCardStyle}>
          <span style={metricLabelStyle}>
            Features
          </span>

          <strong style={bigValueStyle}>
            {features.length}
          </strong>
        </div>
      </section>

      <MultinomialNBVisualizer
        model={model}
      />

      <section style={metricsStyle}>
        <div style={eyebrowStyle}>
          HELD-OUT EVALUATION
        </div>

        <h3 style={metricsTitleStyle}>
          Did the model generalize to unseen emails?
        </h3>

        <p style={metricsDescriptionStyle}>
          These metrics are calculated on the held-out test split, not
          the same emails used to train the model.
        </p>

        <div style={metricGridStyle}>
          <MetricCard
            label="Accuracy"
            value={metrics.accuracy}
          />

          <MetricCard
            label="Precision"
            value={metrics.precision}
          />

          <MetricCard
            label="Recall"
            value={metrics.recall}
          />

          <MetricCard
            label="F1 Score"
            value={metrics.f1}
          />
        </div>

        <div style={confusionWrapperStyle}>
          <h4 style={confusionTitleStyle}>
            Confusion Matrix
          </h4>

          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>
                    Actual ↓ / Predicted →
                  </th>

                  {metrics.confusionMatrix.labels.map(
                    (label) => (
                      <th
                        key={label}
                        style={thStyle}
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {metrics.confusionMatrix.labels.map(
                  (actualLabel, rowIndex) => (
                    <tr key={actualLabel}>
                      <td style={tdStyle}>
                        <strong>
                          {actualLabel}
                        </strong>
                      </td>

                      {metrics.confusionMatrix.matrix[
                        rowIndex
                      ].map(
                        (value, columnIndex) => (
                          <td
                            key={`${rowIndex}-${columnIndex}`}
                            style={{
                              ...tdStyle,
                              color:
                                rowIndex ===
                                columnIndex
                                  ? "#34d399"
                                  : "#fca5a5",
                              fontWeight: 900,
                            }}
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
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={metricCardStyle}>
      <span style={metricLabelStyle}>
        {label}
      </span>

      <strong style={metricValueStyle}>
        {(value * 100).toFixed(1)}%
      </strong>
    </div>
  );
}

const containerStyle = {
  display: "grid",
  gap: 16,
};

const headerStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "space-between",
  gap: 16,
  padding: 20,
  borderRadius: 17,
  border: "1px solid #334155",
  background: "#0f172a",
};

const eyebrowStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const titleStyle = {
  margin: "5px 0 7px",
  fontSize: 28,
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
  maxWidth: 800,
};

const alphaControlStyle = {
  minWidth: 160,
  padding: 12,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #334155",
};

const alphaLabelStyle = {
  display: "block",
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 900,
  marginBottom: 6,
};

const alphaInputStyle = {
  width: "100%",
  padding: "8px 9px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#f8fafc",
};

const alphaHelpStyle = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 10,
};

const splitStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 9,
};

const splitCardStyle = {
  padding: 13,
  borderRadius: 11,
  background: "#0f172a",
  border: "1px solid #334155",
};

const metricLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: 11,
};

const bigValueStyle = {
  display: "block",
  marginTop: 4,
  color: "#f8fafc",
  fontSize: 23,
};

const metricsStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const metricsTitleStyle = {
  margin: "5px 0 7px",
};

const metricsDescriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const metricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 9,
  marginTop: 13,
};

const metricCardStyle = {
  padding: 13,
  borderRadius: 10,
  background: "#020617",
  border: "1px solid #1e293b",
};

const metricValueStyle = {
  display: "block",
  marginTop: 5,
  color: "#34d399",
  fontSize: 22,
};

const confusionWrapperStyle = {
  marginTop: 16,
};

const confusionTitleStyle = {
  marginBottom: 8,
};

const tableWrapperStyle = {
  overflowX: "auto" as const,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const thStyle = {
  padding: 10,
  textAlign: "center" as const,
  borderBottom: "1px solid #334155",
  color: "#94a3b8",
  fontSize: 11,
};

const tdStyle = {
  padding: 10,
  textAlign: "center" as const,
  borderBottom: "1px solid #1e293b",
  color: "#cbd5e1",
};