import { useMemo, useState } from "react";

import type { NBRow } from "../types/naiveBayes";

import {
  analyzeMissingValues,
  applyImputation,
  type ImputationStrategy,
} from "./preprocessingMath";

type Props = {
  rows: NBRow[];
  features: string[];
  onRowsChange: (rows: NBRow[]) => void;
};

export default function MissingValueAnalyzer({
  rows,
  features,
  onRowsChange,
}: Props) {
  const [strategies, setStrategies] = useState<
    Record<string, ImputationStrategy>
  >({});

  const analysis = useMemo(
    () => analyzeMissingValues(rows, features),
    [rows, features]
  );

  const totalMissing = analysis.reduce(
    (sum, item) => sum + item.missingCount,
    0
  );

  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            PREPROCESSING
          </div>

          <h3 style={titleStyle}>
            Missing Value Analyzer
          </h3>
        </div>

        <div style={badgeStyle}>
          {totalMissing === 0
            ? "No missing values"
            : `${totalMissing} missing`}
        </div>
      </div>

      <p style={descriptionStyle}>
        ModelMind does not silently fill missing
        values. Review each feature and choose an
        imputation method yourself.
      </p>

      {analysis.map((item) => (
        <div
          key={item.feature}
          style={featureStyle}
        >
          <div style={featureHeaderStyle}>
            <strong>{item.feature}</strong>

            <span style={mutedStyle}>
              {item.missingCount} missing (
              {item.missingPercentage.toFixed(1)}%)
            </span>
          </div>

          {item.missingCount === 0 ? (
            <div style={goodStyle}>
              ✓ This feature is complete.
            </div>
          ) : (
            <>
              <div style={statsStyle}>
                <span>
                  Mean:{" "}
                  {item.mean === null
                    ? "N/A"
                    : item.mean.toFixed(2)}
                </span>

                <span>
                  Median:{" "}
                  {item.median === null
                    ? "N/A"
                    : item.median.toFixed(2)}
                </span>

                <span>
                  Mode:{" "}
                  {item.mode === null
                    ? "N/A"
                    : String(item.mode)}
                </span>
              </div>

              <div style={controlStyle}>
                <select
                  value={
                    strategies[item.feature] ??
                    "median"
                  }
                  onChange={(event) =>
                    setStrategies((previous) => ({
                      ...previous,
                      [item.feature]:
                        event.target
                          .value as ImputationStrategy,
                    }))
                  }
                  style={selectStyle}
                >
                  <option value="mean">
                    Fill with mean
                  </option>

                  <option value="median">
                    Fill with median
                  </option>

                  <option value="mode">
                    Fill with mode
                  </option>

                  <option value="zero">
                    Fill with zero
                  </option>
                </select>

                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    const strategy =
                      strategies[item.feature] ??
                      "median";

                    onRowsChange(
                      applyImputation(
                        rows,
                        item.feature,
                        strategy
                      )
                    );
                  }}
                >
                  Apply to {item.feature}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}

const cardStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap" as const,
};

const eyebrowStyle = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
  color: "#a78bfa",
};

const titleStyle = {
  margin: "5px 0 0",
};

const badgeStyle = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "#020617",
  color: "#cbd5e1",
  fontSize: 12,
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const featureStyle = {
  padding: 14,
  marginTop: 10,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #1e293b",
};

const featureHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap" as const,
};

const mutedStyle = {
  color: "#94a3b8",
  fontSize: 13,
};

const goodStyle = {
  marginTop: 9,
  color: "#86efac",
  fontSize: 13,
};

const statsStyle = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap" as const,
  marginTop: 10,
  color: "#cbd5e1",
  fontSize: 13,
};

const controlStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  marginTop: 12,
};

const selectStyle = {
  padding: "9px 10px",
  borderRadius: 9,
  border: "1px solid #475569",
  background: "#111827",
  color: "#e2e8f0",
};

const buttonStyle = {
  padding: "9px 13px",
  borderRadius: 9,
  border: "1px solid #7c3aed",
  background: "#6d28d9",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};