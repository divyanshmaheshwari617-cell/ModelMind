"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  DatasetAnalysis,
  TargetAnalysis,
  analyzeDatasetTarget,
} from "@/lib/api";
import TargetHealth from "./TargetHealth";

interface Props {
  dataset: DatasetAnalysis;
  runtimeId: string;
  filename: string;
}

type MLTask =
  | "classification"
  | "regression"
  | "unknown";

export default function TargetAnalyzer({
  dataset,
  runtimeId,
  filename,
}: Props) {
  const [target, setTarget] =
    useState("");

  const [analysis, setAnalysis] =
    useState<TargetAnalysis | null>(
      null
    );

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisError, setAnalysisError] =
    useState("");

  /* ======================================================
     FULL DATASET TARGET ANALYSIS
     ====================================================== */

  useEffect(() => {
    if (!target) {
      setAnalysis(null);
      setAnalysisError("");
      return;
    }

    let cancelled = false;

    async function loadAnalysis() {
      try {
        setIsAnalyzing(true);
        setAnalysisError("");
        setAnalysis(null);

        const result =
          await analyzeDatasetTarget(
            runtimeId,
            filename,
            target
          );

        if (!cancelled) {
          setAnalysis(result);
        }
      } catch (error) {
        if (!cancelled) {
          setAnalysisError(
            error instanceof Error
              ? error.message
              : "Target analysis failed."
          );
        }
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [
    target,
    runtimeId,
    filename,
  ]);

  /* ======================================================
     EDUCATIONAL EXPLANATION
     ====================================================== */

  function getExplanation(
    result: TargetAnalysis
  ) {
    if (
      result.task ===
      "classification"
    ) {
      if (
        result.task_type ===
        "Binary Classification"
      ) {
        return `${result.target} contains two target classes. The model therefore needs to learn which of the two classes each example belongs to.`;
      }

      return `${result.target} contains ${result.unique_count} distinct target classes. The model therefore needs to choose between multiple categories.`;
    }

    if (
      result.task === "regression"
    ) {
      return `${result.target} behaves like a continuous numerical target. The goal is therefore to predict a numerical value rather than a category.`;
    }

    return "ModelMind could not confidently determine the machine-learning task for this target.";
  }

  return (
    <div
      style={{
        marginTop: "20px",
        paddingTop: "18px",
        borderTop:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* =====================================
          HEADER
          ===================================== */}

      <div
        style={{
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          🎯 Target Analyzer
        </div>

        <div
          style={{
            fontSize: "12px",
            opacity: 0.6,
            marginTop: "4px",
          }}
        >
          Tell ModelMind what you want
          your machine-learning model to
          predict.
        </div>
      </div>

      {/* =====================================
          TARGET SELECTOR
          ===================================== */}

      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "7px",
          }}
        >
          What do you want to predict?
        </label>

        <select
          value={target}
          onChange={(event) =>
            setTarget(
              event.target.value
            )
          }
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "9px 10px",
            borderRadius: "7px",
            border:
              "1px solid rgba(255,255,255,0.14)",
            background: "#161a20",
            color: "inherit",
            outline: "none",
          }}
        >
          <option value="">
            Select target column
          </option>

          {dataset.column_names.map(
            (column) => (
              <option
                key={column}
                value={column}
              >
                {column}
              </option>
            )
          )}
        </select>
      </div>

      {/* =====================================
          LOADING
          ===================================== */}

      {isAnalyzing && (
        <div
          style={{
            padding: "13px",
            borderRadius: "8px",
            border:
              "1px solid rgba(100,160,255,0.16)",
            background:
              "rgba(100,160,255,0.05)",
            fontSize: "12px",
            marginBottom: "14px",
          }}
        >
          Analyzing the entire{" "}
          <strong>{target}</strong>{" "}
          column...
        </div>
      )}

      {/* =====================================
          ERROR
          ===================================== */}

      {analysisError && (
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            border:
              "1px solid rgba(255,90,90,0.25)",
            background:
              "rgba(255,90,90,0.06)",
            color: "#ff9292",
            fontSize: "12px",
            marginBottom: "14px",
          }}
        >
          {analysisError}
        </div>
      )}

      {/* =====================================
          REAL FULL DATASET ANALYSIS
          ===================================== */}

      {analysis && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(145px, 1fr))",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <InfoCard
              label="Target"
              value={analysis.target}
            />

            <InfoCard
              label="Detected Task"
              value={
                analysis.task_type
              }
            />

            <InfoCard
              label="Data Type"
              value={analysis.dtype}
            />

            <InfoCard
              label={
                analysis.task ===
                "classification"
                  ? "Classes"
                  : "Unique Values"
              }
              value={String(
                analysis.unique_count
              )}
            />

            <InfoCard
              label="Target Values"
              value={String(
                analysis.non_null_count
              )}
            />

            <InfoCard
              label="Missing Target"
              value={String(
                analysis.missing_count
              )}
            />
          </div>

          {/* =================================
              EXPLANATION
              ================================= */}

          <div
            style={{
              padding: "13px",
              borderRadius: "8px",
              border:
                "1px solid rgba(100,160,255,0.16)",
              background:
                "rgba(100,160,255,0.05)",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              🧠 Why did ModelMind
              choose this?
            </div>

            <div
              style={{
                fontSize: "12px",
                lineHeight: 1.7,
                opacity: 0.78,
              }}
            >
              {getExplanation(
                analysis
              )}
            </div>
          </div>

          {/* =================================
              CLASSIFICATION
              ================================= */}

          {analysis.task ===
            "classification" && (
            <ClassificationAnalysis
              analysis={analysis}
            />
          )}
          {/* =================================
    TARGET HEALTH
    ================================= */}

<TargetHealth
  analysis={analysis}
/>

          {/* =================================
              REGRESSION
              ================================= */}

          {analysis.task ===
            "regression" && (
            <RegressionAnalysis
              analysis={analysis}
            />
          )}

          {/* =================================
              MODEL + METRIC LEARNING
              ================================= */}

          <RecommendationSection
            task={analysis.task}
          />

          <div
            style={{
              marginTop: "14px",
              padding: "10px 12px",
              borderRadius: "7px",
              border:
                "1px solid rgba(114,226,138,0.14)",
              background:
                "rgba(114,226,138,0.04)",
              fontSize: "11px",
              lineHeight: 1.6,
              opacity: 0.75,
            }}
          >
            ✓ This analysis uses the
            complete target column, not
            only the dataset preview.
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   CLASSIFICATION ANALYSIS
   ========================================================= */

function ClassificationAnalysis({
  analysis,
}: {
  analysis: TargetAnalysis;
}) {
  const distribution =
    analysis.class_distribution ?? [];

  return (
    <div
      style={{
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          marginBottom: "9px",
        }}
      >
        Class Distribution
      </div>

      <div
        style={{
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {distribution.map(
          (item) => (
            <div
              key={item.value}
              style={{
                padding: "10px 12px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "12px",
                  fontSize: "12px",
                  marginBottom: "7px",
                }}
              >
                <strong>
                  {item.value}
                </strong>

                <span
                  style={{
                    opacity: 0.65,
                  }}
                >
                  {item.count}{" "}
                  ({item.percentage}%)
                </span>
              </div>

              <div
                style={{
                  height: "6px",
                  borderRadius: "999px",
                  background:
                    "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      item.percentage,
                      100
                    )}%`,
                    height: "100%",
                    borderRadius:
                      "999px",
                    background:
                      "rgba(100,160,255,0.75)",
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>

      <ImbalanceWarning
        analysis={analysis}
      />
    </div>
  );
}


/* =========================================================
   IMBALANCE EXPLANATION
   ========================================================= */

function ImbalanceWarning({
  analysis,
}: {
  analysis: TargetAnalysis;
}) {
  const level =
    analysis.imbalance_level ??
    "unknown";

  const ratio =
    analysis.imbalance_ratio;

  let title =
    "✓ Classes look reasonably balanced";

  let explanation =
    "No strong class imbalance was detected by ModelMind's current rule.";

  if (level === "moderate") {
    title =
      "⚠ Moderate class imbalance";

    explanation =
      "One class appears more frequently than another. Accuracy alone may hide weaker performance on the smaller class.";
  }

  if (level === "high") {
    title =
      "⚠ High class imbalance";

    explanation =
      "The target is noticeably imbalanced. Precision, recall and F1 score can be especially important when evaluating the model.";
  }

  if (level === "severe") {
    title =
      "⚠ Severe class imbalance";

    explanation =
      "One class dominates the target. A high accuracy score could be misleading if the model performs poorly on the minority class.";
  }

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "12px",
        borderRadius: "8px",
        border:
          level === "balanced"
            ? "1px solid rgba(114,226,138,0.16)"
            : "1px solid rgba(255,190,90,0.18)",
        background:
          level === "balanced"
            ? "rgba(114,226,138,0.04)"
            : "rgba(255,190,90,0.05)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          marginBottom: "5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "11px",
          lineHeight: 1.6,
          opacity: 0.72,
        }}
      >
        {explanation}

        {ratio !== undefined &&
          ratio !== null && (
            <>
              {" "}
              Current largest-to-smallest
              class ratio:{" "}
              <strong>
                {ratio}:1
              </strong>
              .
            </>
          )}
      </div>
    </div>
  );
}


/* =========================================================
   REGRESSION ANALYSIS
   ========================================================= */

function RegressionAnalysis({
  analysis,
}: {
  analysis: TargetAnalysis;
}) {
  return (
    <div
      style={{
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          marginBottom: "9px",
        }}
      >
        Numerical Target Statistics
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
        }}
      >
        <InfoCard
          label="Minimum"
          value={formatNumber(
            analysis.minimum
          )}
        />

        <InfoCard
          label="Maximum"
          value={formatNumber(
            analysis.maximum
          )}
        />

        <InfoCard
          label="Mean"
          value={formatNumber(
            analysis.mean
          )}
        />

        <InfoCard
          label="Median"
          value={formatNumber(
            analysis.median
          )}
        />

        <InfoCard
          label="Std. Deviation"
          value={formatNumber(
            analysis.standard_deviation
          )}
        />
      </div>
    </div>
  );
}


/* =========================================================
   INFO CARD
   ========================================================= */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "11px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          opacity: 0.5,
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}


/* =========================================================
   RECOMMENDATIONS
   ========================================================= */

function RecommendationSection({
  task,
}: {
  task: MLTask;
}) {
  if (task === "unknown") {
    return null;
  }

  const classificationModels = [
    "Logistic Regression",
    "Decision Tree",
    "Random Forest",
    "K-Nearest Neighbors",
  ];

  const regressionModels = [
    "Linear Regression",
    "Decision Tree Regressor",
    "Random Forest Regressor",
  ];

  const classificationMetrics = [
    "Accuracy",
    "Precision",
    "Recall",
    "F1 Score",
    "ROC-AUC",
  ];

  const regressionMetrics = [
    "MAE",
    "MSE",
    "RMSE",
    "R² Score",
  ];

  const models =
    task === "classification"
      ? classificationModels
      : regressionModels;

  const metrics =
    task === "classification"
      ? classificationMetrics
      : regressionMetrics;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "10px",
      }}
    >
      <RecommendationCard
        title="🤖 Models to Explore"
        values={models}
      />

      <RecommendationCard
        title="📊 Metrics to Learn"
        values={metrics}
      />
    </div>
  );
}


function RecommendationCard({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.025)",
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
        {values.map((value) => (
          <div
            key={value}
            style={{
              fontSize: "11px",
              opacity: 0.72,
            }}
          >
            • {value}
          </div>
        ))}
      </div>
    </div>
  );
}


/* =========================================================
   NUMBER FORMATTER
   ========================================================= */

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