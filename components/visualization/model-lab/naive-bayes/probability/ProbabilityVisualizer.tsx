import { useMemo } from "react";

import type { NBRow } from "../types/naiveBayes";

import { calculateClassPriors } from "../utils/naiveBayesMath";

type Props = {
  rows: NBRow[];
  step: number;
};

export default function ProbabilityVisualizer({
  rows,
  step,
}: Props) {
  const priors = useMemo(
    () => calculateClassPriors(rows),
    [rows]
  );

  if (rows.length === 0) {
    return null;
  }

  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>
        LIVE PROBABILITY
      </div>

      <h3 style={{ margin: "5px 0 8px" }}>
        From observations to probability
      </h3>

      <p style={descriptionStyle}>
        There are <strong>{rows.length}</strong>{" "}
        observations in this dataset. Count the
        classes first, then convert those counts into
        probabilities.
      </p>

      <div style={gridStyle}>
        {priors.map((item) => {
          const percentage =
            item.probability * 100;

          return (
            <div
              key={item.classLabel}
              style={classCardStyle}
            >
              <div style={classHeaderStyle}>
                <strong>{item.classLabel}</strong>

                <span style={countBadgeStyle}>
                  {item.count} rows
                </span>
              </div>

              <div style={barTrackStyle}>
                <div
                  style={{
                    ...barFillStyle,
                    width: `${percentage}%`,
                  }}
                />
              </div>

              {step >= 2 && (
                <div style={formulaStyle}>
                  P({item.classLabel}) ={" "}
                  {item.count} / {rows.length}
                </div>
              )}

              {step >= 3 && (
                <div style={probabilityStyle}>
                  {item.probability.toFixed(3)}
                  <span style={percentageStyle}>
                    {" "}
                    = {percentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {step >= 3 && (
        <div style={noteStyle}>
          <strong>These are the priors.</strong>
          <div style={{ marginTop: 4 }}>
            They represent what Naive Bayes knows
            about the classes before looking at the
            features of a new observation.
          </div>
        </div>
      )}
    </section>
  );
}

const cardStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const eyebrowStyle = {
  color: "#38bdf8",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 10,
  marginTop: 13,
};

const classCardStyle = {
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #1e293b",
};

const classHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
};

const countBadgeStyle = {
  padding: "3px 7px",
  borderRadius: 999,
  background: "#1e293b",
  color: "#cbd5e1",
  fontSize: 11,
};

const barTrackStyle = {
  height: 9,
  marginTop: 13,
  borderRadius: 999,
  overflow: "hidden",
  background: "#1e293b",
};

const barFillStyle = {
  height: "100%",
  borderRadius: 999,
  background: "#8b5cf6",
  transition: "width 500ms ease",
};

const formulaStyle = {
  marginTop: 11,
  color: "#cbd5e1",
  fontFamily: "monospace",
};

const probabilityStyle = {
  marginTop: 7,
  color: "#a78bfa",
  fontSize: 22,
  fontWeight: 900,
};

const percentageStyle = {
  color: "#94a3b8",
  fontSize: 13,
  fontWeight: 500,
};

const noteStyle = {
  marginTop: 13,
  padding: 12,
  borderRadius: 10,
  background: "#172554",
  border: "1px solid #1d4ed8",
  color: "#cbd5e1",
  lineHeight: 1.5,
};