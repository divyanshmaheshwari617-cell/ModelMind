"use client";

import {
  TargetAnalysis,
} from "@/lib/api";

interface Props {
  analysis: TargetAnalysis;
}

export default function TargetHealth({
  analysis,
}: Props) {
  if (
    analysis.task !== "regression"
  ) {
    return null;
  }

  const missing =
    analysis.missing_count ?? 0;

  const missingPercentage =
    analysis.missing_percentage ?? 0;

  const outliers =
    analysis.outlier_count ?? 0;

  const outlierPercentage =
    analysis.outlier_percentage ?? 0;

  const negatives =
    analysis.negative_count ?? 0;

  const zeros =
    analysis.zero_count ?? 0;

  const skewness =
    analysis.skewness ?? 0;

  return (
    <div
      style={{
        marginTop: "16px",
        marginBottom: "16px",
        paddingTop: "16px",
        borderTop:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          🩺 Target Health
        </div>

        <div
          style={{
            marginTop: "4px",
            fontSize: "11px",
            opacity: 0.6,
          }}
        >
          ModelMind checks the target
          before model training.
        </div>
      </div>

      {/* HEALTH METRICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <HealthCard
          label="Missing"
          value={`${missing}`}
          sub={`${missingPercentage}%`}
        />

        <HealthCard
          label="Outliers"
          value={`${outliers}`}
          sub={`${outlierPercentage}%`}
        />

        <HealthCard
          label="Negative Values"
          value={`${negatives}`}
          sub="Check domain meaning"
        />

        <HealthCard
          label="Zero Values"
          value={`${zeros}`}
          sub="Check if valid"
        />

        <HealthCard
          label="Skewness"
          value={formatNumber(
            skewness
          )}
          sub={getDistributionLabel(
            analysis.distribution_shape
          )}
        />
      </div>

      {/* DISTRIBUTION */}

      <Section
        title="📊 Distribution Health"
      >
        <Row
          label="Distribution"
          value={getDistributionLabel(
            analysis.distribution_shape
          )}
        />

        <Row
          label="Skewness"
          value={formatNumber(
            analysis.skewness
          )}
        />

        <Row
          label="Q1"
          value={formatNumber(
            analysis.q1
          )}
        />

        <Row
          label="Median"
          value={formatNumber(
            analysis.median
          )}
        />

        <Row
          label="Q3"
          value={formatNumber(
            analysis.q3
          )}
        />

        <Row
          label="IQR"
          value={formatNumber(
            analysis.iqr
          )}
        />
      </Section>

      {/* SMART WARNINGS */}

      <div
        style={{
          display: "grid",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {missing > 0 && (
          <Warning
            title="Missing target values"
            text={`${missing} rows (${missingPercentage}%) do not contain a target value. Supervised models normally require a known label for training, so these rows need special handling before training.`}
          />
        )}

        {negatives > 0 && (
          <Warning
            title="Negative target values detected"
            text={`${negatives} negative values were found. Negative numbers are not automatically incorrect. ModelMind recommends checking whether negative values make sense for ${analysis.target}.`}
          />
        )}

        {outliers > 0 && (
          <Warning
            title="Potential outliers detected"
            text={`${outliers} values (${outlierPercentage}%) fall outside the standard 1.5 × IQR bounds. They should be investigated before deciding whether to keep, transform, cap or remove them.`}
          />
        )}

        {zeros > 0 && (
          <Warning
            title="Zero target values detected"
            text={`${zeros} zero values were found. Check whether zero is a meaningful value for ${analysis.target} or represents missing/incorrect data.`}
          />
        )}
      </div>

      {/* PREPROCESSING ADVISOR */}

      <PreprocessingAdvisor
        analysis={analysis}
      />
    </div>
  );
}


/* =========================================================
   PREPROCESSING ADVISOR
   ========================================================= */

function PreprocessingAdvisor({
  analysis,
}: {
  analysis: TargetAnalysis;
}) {
  const shape =
    analysis.distribution_shape;

  const outliers =
    analysis.outlier_count ?? 0;

  const missing =
    analysis.missing_count ?? 0;

  let missingSuggestion =
    "No target imputation is suggested.";

  if (missing > 0) {
    missingSuggestion =
      "For a supervised-learning target, do not automatically replace missing labels with the mean or median. First investigate why the target is missing; training rows generally require known labels.";
  }

  let distributionSuggestion =
    "The target appears approximately symmetric.";

  if (
    shape === "right_skewed" ||
    shape ===
      "strongly_right_skewed"
  ) {
    distributionSuggestion =
      "The target is right-skewed. Investigate high-value outliers and consider whether a transformation such as log1p or a power transform is appropriate.";
  }

  if (
    shape === "left_skewed" ||
    shape ===
      "strongly_left_skewed"
  ) {
    distributionSuggestion =
      "The target is left-skewed. Investigate unusually low values before deciding whether transformation is useful.";
  }

  let outlierSuggestion =
    "No IQR outliers were detected.";

  if (outliers > 0) {
    outlierSuggestion =
      "Outliers are present. Do not remove them automatically: first determine whether they are genuine observations, data-entry errors or important rare cases.";
  }

  return (
    <div
      style={{
        marginTop: "14px",
        padding: "13px",
        borderRadius: "8px",
        border:
          "1px solid rgba(100,160,255,0.16)",
        background:
          "rgba(100,160,255,0.04)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        🧠 ModelMind Preprocessing
        Advisor
      </div>

      <Advice
        title="Missing target"
        text={missingSuggestion}
      />

      <Advice
        title="Distribution"
        text={distributionSuggestion}
      />

      <Advice
        title="Outliers"
        text={outlierSuggestion}
      />

      <div
        style={{
          marginTop: "10px",
          paddingTop: "10px",
          borderTop:
            "1px solid rgba(255,255,255,0.07)",
          fontSize: "11px",
          lineHeight: 1.65,
          opacity: 0.65,
        }}
      >
        Feature preprocessing is
        different from target
        preprocessing. Mean/median
        imputation and feature scaling
        will be analyzed separately for
        each input feature.
      </div>
    </div>
  );
}


/* =========================================================
   SMALL UI COMPONENTS
   ========================================================= */

function HealthCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      style={{
        padding: "11px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.025)",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          opacity: 0.5,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontSize: "15px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "3px",
          fontSize: "10px",
          opacity: 0.5,
        }}
      >
        {sub}
      </div>
    </div>
  );
}


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          marginBottom: "9px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "grid",
          gap: "6px",
        }}
      >
        {children}
      </div>
    </div>
  );
}


function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: "12px",
        fontSize: "11px",
      }}
    >
      <span
        style={{
          opacity: 0.55,
        }}
      >
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}


function Warning({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        padding: "11px 12px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,190,90,0.17)",
        background:
          "rgba(255,190,90,0.045)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        ⚠ {title}
      </div>

      <div
        style={{
          fontSize: "11px",
          lineHeight: 1.6,
          opacity: 0.68,
        }}
      >
        {text}
      </div>
    </div>
  );
}


function Advice({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          marginBottom: "3px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "11px",
          lineHeight: 1.6,
          opacity: 0.68,
        }}
      >
        {text}
      </div>
    </div>
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function getDistributionLabel(
  shape:
    | TargetAnalysis[
        "distribution_shape"
      ]
    | undefined
): string {
  switch (shape) {
    case "strongly_right_skewed":
      return "Strongly right-skewed";

    case "right_skewed":
      return "Right-skewed";

    case "strongly_left_skewed":
      return "Strongly left-skewed";

    case "left_skewed":
      return "Left-skewed";

    case "approximately_symmetric":
      return "Approximately symmetric";

    default:
      return "Unknown";
  }
}


function formatNumber(
  value: number | undefined
): string {
  if (
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return Number(
    value.toFixed(4)
  ).toLocaleString();
}