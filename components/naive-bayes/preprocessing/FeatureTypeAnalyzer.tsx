import { useMemo } from "react";

import type {
  NBRow,
  NaiveBayesVariant,
} from "../types/naiveBayes";

import {
  detectAllFeatureKinds,
} from "./preprocessingMath";

import ModelRecommendationPanel from "../intelligence/ModelRecommendationPanel";

type Props = {
  rows: NBRow[];
  features: string[];
  variant: NaiveBayesVariant;
  onVariantChange?: (
    variant: NaiveBayesVariant
  ) => void;
};

export default function FeatureTypeAnalyzer({
  rows,
  features,
  variant,
  onVariantChange,
}: Props) {
  const featureKinds =
    useMemo(
      () =>
        detectAllFeatureKinds(
          rows,
          features
        ),
      [rows, features]
    );

  return (
    <div style={container}>
      <section style={cardStyle}>
        <div style={eyebrowStyle}>
          DATASET INTELLIGENCE
        </div>

        <h3
          style={{
            margin:
              "5px 0 8px",
          }}
        >
          Feature Type Analyzer
        </h3>

        <p
          style={
            descriptionStyle
          }
        >
          ModelMind inspects every
          selected feature before
          recommending a Naive
          Bayes variant.
        </p>

        <div style={gridStyle}>
          {features.map(
            (feature) => (
              <div
                key={feature}
                style={
                  featureStyle
                }
              >
                <strong>
                  {feature}
                </strong>

                <div
                  style={
                    typeStyle
                  }
                >
                  {featureKinds[
                    feature
                  ] ?? "unknown"}
                </div>

                <div
                  style={
                    explanationStyle
                  }
                >
                  {explainKind(
                    featureKinds[
                      feature
                    ]
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <ModelRecommendationPanel
        rows={rows}
        features={features}
        currentVariant={
          variant
        }
        onUseRecommended={
          onVariantChange
        }
      />
    </div>
  );
}

function explainKind(
  kind:
    | "continuous"
    | "count"
    | "binary"
    | "categorical"
    | "unknown"
    | undefined
) {
  if (kind === "binary") {
    return "Only 0/1 values.";
  }

  if (kind === "count") {
    return "Non-negative integer counts.";
  }

  if (
    kind ===
    "continuous"
  ) {
    return "Numerical measurement.";
  }

  if (
    kind ===
    "categorical"
  ) {
    return "Raw category labels.";
  }

  return "Could not determine a reliable feature type.";
}

const container = {
  display: "grid",
  gap: 14,
};

const cardStyle = {
  padding: 18,
  borderRadius: 16,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const eyebrowStyle = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
  color: "#38bdf8",
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 9,
};

const featureStyle = {
  padding: 12,
  borderRadius: 11,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const typeStyle = {
  marginTop: 6,
  color: "#a78bfa",
  textTransform:
    "capitalize" as const,
  fontSize: 13,
  fontWeight: 800,
};

const explanationStyle = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 11,
  lineHeight: 1.4,
};