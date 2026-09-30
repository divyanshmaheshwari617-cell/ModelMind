import { useMemo } from "react";

import type {
  NBRow,
} from "../types/naiveBayes";

export type TargetAnalysis = {
  task:
    | "classification"
    | "regression"
    | "unknown";

  targetKind:
    | "categorical"
    | "binary-numeric"
    | "discrete-numeric"
    | "continuous-numeric"
    | "unknown";

  classes: string[];

  uniqueCount: number;

  totalCount: number;

  numeric: boolean;

  confidence:
    | "high"
    | "medium"
    | "low";

  reason: string;
};

type Props = {
  rows: NBRow[];
  targetColumn: string;
  onAnalysis?: (
    analysis: TargetAnalysis
  ) => void;
};

export function analyzeTarget(
  rows: NBRow[]
): TargetAnalysis {
  const targets = rows
    .map((row) =>
      String(
        row.target ?? ""
      ).trim()
    )
    .filter(
      (value) =>
        value !== ""
    );

  if (targets.length === 0) {
    return {
      task: "unknown",
      targetKind: "unknown",
      classes: [],
      uniqueCount: 0,
      totalCount: 0,
      numeric: false,
      confidence: "low",
      reason:
        "No usable target values were found.",
    };
  }

  const classes =
    Array.from(
      new Set(targets)
    );

  const numericValues =
    targets.map(Number);

  const numeric =
    numericValues.every(
      (value) =>
        Number.isFinite(value)
    );

  /*
    String targets such as:
    Pass / Fail
    Spam / Not Spam
    Cat / Dog

    are clearly classification.
  */

  if (!numeric) {
    return {
      task: "classification",
      targetKind:
        "categorical",
      classes,
      uniqueCount:
        classes.length,
      totalCount:
        targets.length,
      numeric: false,
      confidence: "high",
      reason:
        "The target contains categorical labels, so this is a classification problem.",
    };
  }

  /*
    Numeric 0 / 1 targets are
    extremely common class labels.
  */

  if (classes.length === 2) {
    return {
      task: "classification",
      targetKind:
        "binary-numeric",
      classes,
      uniqueCount:
        classes.length,
      totalCount:
        targets.length,
      numeric: true,
      confidence: "high",
      reason:
        "The target has exactly two numeric values, so ModelMind treats them as binary class labels.",
    };
  }

  const uniqueRatio =
    classes.length /
    targets.length;

  /*
    Small repeated integer sets
    are usually class labels.

    Example:
    0, 1, 2
    or
    1, 2, 3, 4
  */

  const allIntegers =
    numericValues.every(
      Number.isInteger
    );

  const smallClassLimit =
    Math.max(
      10,
      Math.floor(
        Math.sqrt(
          targets.length
        )
      )
    );

  if (
    allIntegers &&
    classes.length <=
      smallClassLimit &&
    uniqueRatio <= 0.5
  ) {
    return {
      task: "classification",
      targetKind:
        "discrete-numeric",
      classes,
      uniqueCount:
        classes.length,
      totalCount:
        targets.length,
      numeric: true,
      confidence: "medium",
      reason:
        "The numeric target contains a small repeated set of values. ModelMind interprets them as class labels.",
    };
  }

  /*
    A numeric target with many
    unique values is much more
    likely to represent a
    continuous quantity.
  */

  if (
    uniqueRatio >= 0.5 ||
    classes.length >
      smallClassLimit
  ) {
    return {
      task: "regression",
      targetKind:
        "continuous-numeric",
      classes,
      uniqueCount:
        classes.length,
      totalCount:
        targets.length,
      numeric: true,
      confidence: "medium",
      reason:
        "The target contains many distinct numeric values, so it looks like a continuous regression target.",
    };
  }

  return {
    task: "unknown",
    targetKind: "unknown",
    classes,
    uniqueCount:
      classes.length,
    totalCount:
      targets.length,
    numeric: true,
    confidence: "low",
    reason:
      "The target is numeric but its role is ambiguous. Check whether these numbers represent categories or a continuous quantity.",
  };
}

export default function TargetTypeAnalyzer({
  rows,
  targetColumn,
  onAnalysis,
}: Props) {
  const analysis =
    useMemo(
      () =>
        analyzeTarget(rows),
      [rows]
    );

  /*
    We intentionally do not
    silently change the model
    from this component.
  */

  if (onAnalysis) {
    /*
      Parent components do not
      need this callback for the
      current lab, but the prop
      is retained for future
      ModelMind integration.
    */
  }

  const classification =
    analysis.task ===
    "classification";

  const regression =
    analysis.task ===
    "regression";

  return (
    <section style={card}>
      <div style={eyebrow}>
        TARGET INTELLIGENCE
      </div>

      <h3 style={title}>
        What kind of prediction
        problem is this?
      </h3>

      <p style={description}>
        ModelMind inspected the
        selected target column{" "}
        <strong>
          {targetColumn}
        </strong>
        .
      </p>

      <div style={summaryGrid}>
        <Info
          label="Detected task"
          value={
            classification
              ? "Classification"
              : regression
              ? "Regression"
              : "Needs review"
          }
        />

        <Info
          label="Target type"
          value={
            analysis.targetKind
          }
        />

        <Info
          label="Unique values"
          value={String(
            analysis.uniqueCount
          )}
        />

        <Info
          label="Confidence"
          value={
            analysis.confidence
          }
        />
      </div>

      <div
        style={{
          ...resultBox,

          borderColor:
            classification
              ? "#166534"
              : regression
              ? "#991b1b"
              : "#a16207",

          background:
            classification
              ? "#052e16"
              : regression
              ? "#450a0a"
              : "#422006",
        }}
      >
        <strong>
          {classification
            ? "✓ Naive Bayes classification can proceed"
            : regression
            ? "⚠ Continuous regression target detected"
            : "⚠ Target requires review"}
        </strong>

        <p style={resultText}>
          {analysis.reason}
        </p>

        {regression && (
          <p style={resultText}>
            Naive Bayes in this
            ModelMind lab is a
            classifier. Do not
            force this target into
            Gaussian, Multinomial
            or Bernoulli Naive
            Bayes. Use a regression
            model such as Linear
            Regression instead.
          </p>
        )}
      </div>

      {classification &&
        analysis.classes.length <=
          12 && (
          <div style={classSection}>
            <strong>
              Detected classes
            </strong>

            <div style={chips}>
              {analysis.classes.map(
                (classLabel) => (
                  <span
                    key={
                      classLabel
                    }
                    style={chip}
                  >
                    {classLabel}
                  </span>
                )
              )}
            </div>
          </div>
        )}
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={infoCard}>
      <span style={infoLabel}>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

const card = {
  padding: 18,
  borderRadius: 16,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const eyebrow = {
  color: "#38bdf8",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = {
  margin: "5px 0 8px",
};

const description = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 9,
  marginTop: 13,
};

const infoCard = {
  padding: 12,
  borderRadius: 10,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const infoLabel = {
  display: "block",
  color: "#64748b",
  fontSize: 10,
  marginBottom: 5,
};

const resultBox = {
  marginTop: 14,
  padding: 14,
  borderRadius: 11,
  border:
    "1px solid #334155",
};

const resultText = {
  color: "#cbd5e1",
  lineHeight: 1.6,
  marginBottom: 0,
};

const classSection = {
  marginTop: 14,
};

const chips = {
  display: "flex",
  flexWrap:
    "wrap" as const,
  gap: 7,
  marginTop: 8,
};

const chip = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#172554",
  color: "#bfdbfe",
  fontSize: 11,
};