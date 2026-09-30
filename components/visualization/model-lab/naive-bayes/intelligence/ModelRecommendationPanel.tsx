import { useMemo } from "react";

import type {
  NBRow,
  NaiveBayesVariant,
} from "../types/naiveBayes";

import {
  analyzeMissingValues,
  detectAllFeatureKinds,
  validateVariantSuitability,
} from "../preprocessing/preprocessingMath";

type Props = {
  rows: NBRow[];
  features: string[];
  currentVariant: NaiveBayesVariant;
  onUseRecommended?: (
    variant: NaiveBayesVariant
  ) => void;
};

type SafeRecommendation = {
  variant: NaiveBayesVariant | null;
  title: string;
  reason: string;
  safe: boolean;
};

export function getSafeRecommendation(
  rows: NBRow[],
  features: string[]
): SafeRecommendation {
  if (features.length === 0) {
    return {
      variant: null,
      title: "Select input features",
      reason:
        "ModelMind needs at least one input feature before recommending a Naive Bayes variant.",
      safe: false,
    };
  }

  const kinds =
    detectAllFeatureKinds(
      rows,
      features
    );

  const entries =
    Object.entries(kinds);

  const missing =
    analyzeMissingValues(
      rows,
      features
    );

  const hasMissing =
    missing.some(
      (item) =>
        item.missingCount > 0
    );

  const hasCategorical =
    entries.some(
      ([, kind]) =>
        kind === "categorical"
    );

  const hasUnknown =
    entries.some(
      ([, kind]) =>
        kind === "unknown"
    );

  if (
    hasCategorical ||
    hasUnknown
  ) {
    const problematic =
      entries
        .filter(
          ([, kind]) =>
            kind === "categorical" ||
            kind === "unknown"
        )
        .map(
          ([feature, kind]) =>
            `${feature} (${kind})`
        )
        .join(", ");

    return {
      variant: null,
      title:
        "No safe automatic recommendation",
      reason:
        `These selected features require preprocessing or a different Naive Bayes treatment: ${problematic}. ` +
        "ModelMind will not pretend raw categorical/unknown values are continuous measurements.",
      safe: false,
    };
  }

  if (
    entries.every(
      ([, kind]) =>
        kind === "binary"
    )
  ) {
    return {
      variant: "bernoulli",
      title:
        "Bernoulli Naive Bayes",
      reason:
        "Every selected feature contains binary 0/1 values. Bernoulli Naive Bayes explicitly models feature presence and absence.",
      safe: !hasMissing,
    };
  }

  if (
    entries.every(
      ([, kind]) =>
        kind === "count" ||
        kind === "binary"
    )
  ) {
    return {
      variant: "multinomial",
      title:
        "Multinomial Naive Bayes",
      reason:
        "The selected features are non-negative count/frequency-style values, which match Multinomial Naive Bayes.",
      safe: !hasMissing,
    };
  }

  if (
    entries.every(
      ([, kind]) =>
        kind === "continuous" ||
        kind === "count" ||
        kind === "binary"
    )
  ) {
    return {
      variant: "gaussian",
      title:
        "Gaussian Naive Bayes",
      reason:
        "The selected features are numerical and include continuous measurements, so Gaussian Naive Bayes is the natural starting point.",
      safe: !hasMissing,
    };
  }

  return {
    variant: null,
    title:
      "No safe automatic recommendation",
    reason:
      "The selected feature combination does not cleanly match Gaussian, Multinomial or Bernoulli Naive Bayes.",
    safe: false,
  };
}

export default function ModelRecommendationPanel({
  rows,
  features,
  currentVariant,
  onUseRecommended,
}: Props) {
  const recommendation =
    useMemo(
      () =>
        getSafeRecommendation(
          rows,
          features
        ),
      [rows, features]
    );

  const currentWarnings =
    useMemo(
      () =>
        validateVariantSuitability(
          rows,
          features,
          currentVariant
        ),
      [
        rows,
        features,
        currentVariant,
      ]
    );

  const canApply =
    recommendation.variant !==
      null &&
    recommendation.safe;

  return (
    <section style={card}>
      <div style={eyebrow}>
        MODEL RECOMMENDATION
      </div>

      <h3 style={title}>
        Which Naive Bayes variant
        matches this data?
      </h3>

      <div
        style={{
          ...recommendationBox,
          borderColor:
            recommendation.safe
              ? "#166534"
              : "#a16207",
          background:
            recommendation.safe
              ? "#052e16"
              : "#422006",
        }}
      >
        <div>
          <div style={smallLabel}>
            MODELMIND RECOMMENDS
          </div>

          <strong
            style={recommendationTitle}
          >
            {recommendation.title}
          </strong>

          <p style={reason}>
            {recommendation.reason}
          </p>
        </div>

        {recommendation.variant && (
          <button
            type="button"
            disabled={!canApply}
            onClick={() => {
              if (
                canApply &&
                recommendation.variant
              ) {
                onUseRecommended?.(
                  recommendation.variant
                );
              }
            }}
            style={{
              ...button,
              opacity:
                canApply
                  ? 1
                  : 0.45,
              cursor:
                canApply
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            Use Recommended Model
          </button>
        )}
      </div>

      <div style={currentBox}>
        <strong>
          Current manual selection:{" "}
          {formatVariant(
            currentVariant
          )}
        </strong>

        {currentWarnings.length ===
        0 ? (
          <div style={success}>
            Compatible with the
            currently selected
            features.
          </div>
        ) : (
          <div style={warningList}>
            {currentWarnings.map(
              (
                warning,
                index
              ) => (
                <div
                  key={`${warning}-${index}`}
                  style={warningStyle}
                >
                  ⚠ {warning}
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div style={controlNote}>
        <strong>
          You remain in control.
        </strong>{" "}
        ModelMind recommends a
        model and explains why,
        but the manual model
        selector remains available
        for experimentation.
      </div>
    </section>
  );
}

function formatVariant(
  variant: NaiveBayesVariant
) {
  if (
    variant ===
    "multinomial"
  ) {
    return "Multinomial Naive Bayes";
  }

  if (
    variant ===
    "bernoulli"
  ) {
    return "Bernoulli Naive Bayes";
  }

  return "Gaussian Naive Bayes";
}

const card = {
  padding: 18,
  borderRadius: 16,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const eyebrow = {
  color: "#fbbf24",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = {
  margin: "5px 0 12px",
};

const recommendationBox = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap:
    "wrap" as const,
  gap: 14,
  padding: 15,
  borderRadius: 12,
  border:
    "1px solid #334155",
};

const smallLabel = {
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 1.1,
};

const recommendationTitle = {
  display: "block",
  marginTop: 5,
  fontSize: 20,
};

const reason = {
  color: "#cbd5e1",
  lineHeight: 1.6,
  maxWidth: 750,
  marginBottom: 0,
};

const button = {
  padding: "10px 14px",
  borderRadius: 9,
  border: "none",
  background: "#16a34a",
  color: "white",
  fontWeight: 900,
};

const currentBox = {
  marginTop: 12,
  padding: 13,
  borderRadius: 10,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const success = {
  marginTop: 7,
  color: "#86efac",
  fontSize: 12,
};

const warningList = {
  display: "grid",
  gap: 5,
  marginTop: 8,
};

const warningStyle = {
  color: "#fde68a",
  fontSize: 12,
  lineHeight: 1.5,
};
const controlNote = {
  marginTop: 12,
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.6,
};