"use client";

import { useEffect, useState } from "react";

import {
  getPreprocessingAdvice,
  previewPreprocessing,
  PreprocessingAdvisorResult,
  PreprocessingRecommendation,
  PreprocessingPreviewResult,
} from "@/lib/api";

import { LearningLevel } from "@/types/learning";

interface Props {
  runtimeId: string;
  filename: string;
  learningLevel: LearningLevel;
  onInsertCode: (code: string) => void;
}

export default function SmartPreprocessingAdvisor({
  runtimeId,
  filename,
  learningLevel,
  onInsertCode,
}: Props) {
  const [result, setResult] =
    useState<PreprocessingAdvisorResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAdvice() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getPreprocessingAdvice(
          runtimeId,
          filename,
          learningLevel
        );

        if (!cancelled) {
          setResult(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setResult(null);

          setError(
            requestError instanceof Error
              ? requestError.message
              : "Preprocessing analysis failed."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAdvice();

    return () => {
      cancelled = true;
    };
  }, [runtimeId, filename, learningLevel]);

  if (isLoading) {
    return (
      <Panel>
        <Header learningLevel={learningLevel} />

        <StatusBox>
          Analyzing the dataset for{" "}
          {learningLevel} preprocessing
          recommendations...
        </StatusBox>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel>
        <Header learningLevel={learningLevel} />

        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            border:
              "1px solid rgba(255,90,90,0.20)",
            background:
              "rgba(255,90,90,0.05)",
            fontSize: "11px",
            lineHeight: 1.6,
          }}
        >
          ⚠ {error}
        </div>
      </Panel>
    );
  }

  if (!result) {
    return (
      <Panel>
        <Header learningLevel={learningLevel} />

        <StatusBox>
          No preprocessing analysis is available.
        </StatusBox>
      </Panel>
    );
  }

  return (
    <Panel>
      <Header learningLevel={learningLevel} />

      {/* DATASET SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <Metric
          label="Rows"
          value={result.rows}
        />

        <Metric
          label="Columns"
          value={result.columns}
        />

        <Metric
          label="Numerical"
          value={result.numerical_features}
        />

        <Metric
          label="Categorical"
          value={result.categorical_features}
        />

        <Metric
          label="Missing"
          value={result.total_missing_values}
        />

        <Metric
          label="Duplicates"
          value={result.duplicate_rows}
        />

        <Metric
          label="Warnings"
          value={result.feature_warning_count}
        />
      </div>

      {/* DATASET WARNINGS */}

      {result.dataset_warnings.length > 0 && (
        <section
          style={{
            marginBottom: "18px",
          }}
        >
          <SectionTitle>
            Dataset Warnings
          </SectionTitle>

          <div
            style={{
              display: "grid",
              gap: "7px",
            }}
          >
            {result.dataset_warnings.map(
              (warning, index) => (
                <WarningBox
                  key={`${warning}-${index}`}
                >
                  {warning}
                </WarningBox>
              )
            )}
          </div>
        </section>
      )}

      {/* FEATURE RECOMMENDATIONS */}

      <section>
        <SectionTitle>
          Feature Recommendations
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {result.recommendations.map(
            (recommendation) => (
              <RecommendationCard
  key={recommendation.feature}
  recommendation={recommendation}
  runtimeId={runtimeId}
  filename={filename}
  learningLevel={learningLevel}
  onInsertCode={onInsertCode}
/>
            )
          )}
        </div>
      </section>

      {/* SAFETY */}

      <div
        style={{
          marginTop: "18px",
          padding: "12px",
          borderRadius: "8px",
          border:
            "1px solid rgba(114,226,138,0.18)",
          background:
            "rgba(114,226,138,0.05)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          ✓ Learning & Recommendation Mode
        </div>

        <div
          style={{
            marginTop: "5px",
            fontSize: "10px",
            lineHeight: 1.6,
            opacity: 0.72,
          }}
        >
          ModelMind analyzes your dataset,
          explains the recommendation and
          generates preprocessing code.
          Nothing is applied automatically.
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "7px",
            marginTop: "8px",
          }}
        >
          <Chip
            label="Dataset modified"
            value="No"
          />

          <Chip
            label="Automatic apply"
            value="Disabled"
          />

          <Chip
            label="Student control"
            value="Enabled"
          />
        </div>
      </div>
    </Panel>
  );
}

function RecommendationCard({
  recommendation,
  runtimeId,
  filename,
  learningLevel,
  onInsertCode,
}: {
  recommendation: PreprocessingRecommendation;
  runtimeId: string;
  filename: string;
  learningLevel: LearningLevel;
  onInsertCode: (code: string) => void;
}) {
  const [preview, setPreview] =
    useState<PreprocessingPreviewResult | null>(
      null
    );

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false);

  const [previewError, setPreviewError] =
    useState("");

  const isNumerical =
    recommendation.feature_type ===
    "numerical";

  const previewStrategy =
    getPreviewStrategy(recommendation);

  const recommendedCode =
    getRecommendedCode(
      recommendation,
      learningLevel
    );

  async function handlePreview() {
    if (!previewStrategy) {
      setPreviewError(
        "This recommendation does not currently have a supported preview strategy."
      );
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError("");
      setPreview(null);

      const data =
        await previewPreprocessing(
          runtimeId,
          filename,
          recommendation.feature,
          previewStrategy
        );

      setPreview(data);
    } catch (requestError) {
      setPreviewError(
        requestError instanceof Error
          ? requestError.message
          : "Preprocessing preview failed."
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "10px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.025)",
      }}
    >
      {/* FEATURE HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {recommendation.feature}
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              opacity: 0.5,
            }}
          >
            {recommendation.feature_type}
            {" · "}
            {recommendation.dtype ??
              "unknown"}
          </div>
        </div>

        <MissingBadge
          percentage={
            recommendation
              .missing_percentage
          }
          severity={
            recommendation
              .missing_severity
          }
        />
      </div>

      {/* RECOMMENDED ACTION */}

      <div
        style={{
          marginTop: "12px",
          fontSize: "10px",
          opacity: 0.5,
        }}
      >
        Recommended action
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "12px",
          fontWeight: 700,
          lineHeight: 1.6,
        }}
      >
        {recommendation.recommended_action}
      </div>

      {/* EXPLANATION */}

      <div
        style={{
          marginTop: "8px",
          fontSize: "11px",
          opacity: 0.72,
          lineHeight: 1.7,
        }}
      >
        {recommendation.explanation}
      </div>

      {/* STATISTICS */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "7px",
          marginTop: "11px",
        }}
      >
        <Chip
          label="Missing"
          value={`${recommendation.missing_count} (${recommendation.missing_percentage}%)`}
        />

        <Chip
          label="Unique"
          value={recommendation.unique_count}
        />

        <Chip
          label="Imputation"
          value={
            recommendation
              .imputation_strategy
          }
        />

        {isNumerical && (
          <>
            <Chip
              label="Skewness"
              value={
                recommendation.skewness ??
                "N/A"
              }
            />

            <Chip
              label="Distribution"
              value={
                recommendation
                  .distribution_shape ??
                "N/A"
              }
            />

            <Chip
              label="Outliers"
              value={
                recommendation
                  .outlier_percentage !==
                undefined
                  ? `${recommendation.outlier_percentage}%`
                  : "N/A"
              }
            />

            <Chip
              label="Scaling"
              value={
                recommendation
                  .scaling_strategy ??
                "N/A"
              }
            />

            <Chip
              label="Transform"
              value={
                recommendation
                  .transformation_strategy ??
                "N/A"
              }
            />
          </>
        )}

        {!isNumerical && (
          <Chip
            label="Unique ratio"
            value={
              recommendation
                .unique_ratio !== undefined
                ? recommendation.unique_ratio
                : "N/A"
            }
          />
        )}
      </div>

      {/* WHY THIS DECISION */}

      {isNumerical &&
        (recommendation.imputation_reason ||
          recommendation.scaling_reason ||
          recommendation
            .transformation_reason) && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px",
              borderRadius: "7px",
              background:
                "rgba(100,160,255,0.04)",
              border:
                "1px solid rgba(100,160,255,0.10)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Why?
            </div>

            {recommendation
              .imputation_reason && (
              <Reason
                label="Imputation"
                text={
                  recommendation
                    .imputation_reason
                }
              />
            )}

            {recommendation
              .scaling_reason && (
              <Reason
                label="Scaling"
                text={
                  recommendation
                    .scaling_reason
                }
              />
            )}

            {recommendation
              .transformation_reason && (
              <Reason
                label="Transformation"
                text={
                  recommendation
                    .transformation_reason
                }
              />
            )}
          </div>
        )}

      {/* WARNINGS */}

      {recommendation.warnings.length >
        0 && (
        <div
          style={{
            display: "grid",
            gap: "6px",
            marginTop: "11px",
          }}
        >
          {recommendation.warnings.map(
            (warning, index) => (
              <WarningBox
                key={`${warning}-${index}`}
              >
                {warning}
              </WarningBox>
            )
          )}
        </div>
      )}

      {/* PREPROCESSING PREVIEW */}

      {recommendation.missing_count >
        0 && (
        <div
          style={{
            marginTop: "13px",
            padding: "12px",
            borderRadius: "8px",
            border:
              "1px solid rgba(100,160,255,0.16)",
            background:
              "rgba(100,160,255,0.035)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                Preprocessing Preview
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "9px",
                  opacity: 0.55,
                  lineHeight: 1.5,
                }}
              >
                See the expected effect
                without changing your
                dataset.
              </div>
            </div>

            <button
              type="button"
              disabled={
                previewLoading ||
                !previewStrategy
              }
              onClick={handlePreview}
              style={{
                padding: "7px 11px",
                borderRadius: "7px",
                border:
                  "1px solid rgba(100,160,255,0.22)",
                background:
                  "rgba(100,160,255,0.09)",
                color: "inherit",
                cursor:
                  previewLoading ||
                  !previewStrategy
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  previewLoading ||
                  !previewStrategy
                    ? 0.45
                    : 1,
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {previewLoading
                ? "Generating..."
                : preview
                  ? "Refresh Preview"
                  : "Preview"}
            </button>
          </div>

          {!previewStrategy && (
            <div
              style={{
                marginTop: "9px",
                fontSize: "10px",
                opacity: 0.6,
                lineHeight: 1.6,
              }}
            >
              Preview is not yet available
              for this recommendation.
            </div>
          )}

          {previewError && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 10px",
                borderRadius: "7px",
                border:
                  "1px solid rgba(255,90,90,0.18)",
                background:
                  "rgba(255,90,90,0.04)",
                fontSize: "10px",
                lineHeight: 1.6,
              }}
            >
              ⚠ {previewError}
            </div>
          )}

          {preview && (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "7px",
                  marginTop: "11px",
                }}
              >
                <Chip
                  label="Strategy"
                  value={preview.strategy}
                />

                <Chip
                  label="Fill value"
                  value={
                    preview.fill_value ??
                    "N/A"
                  }
                />

                <Chip
                  label="Rows affected"
                  value={
                    preview.changed_count
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: "9px",
                  marginTop: "11px",
                }}
              >
                <PreviewSide
                  title="Before"
                  preview={preview}
                  side="before"
                />

                <PreviewSide
                  title="After"
                  preview={preview}
                  side="after"
                />
              </div>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "10px",
                  lineHeight: 1.6,
                  opacity: 0.72,
                }}
              >
                {preview.explanation}
              </div>

              <div
                style={{
                  marginTop: "10px",
                  padding: "8px 10px",
                  borderRadius: "7px",
                  border:
                    "1px solid rgba(114,226,138,0.18)",
                  background:
                    "rgba(114,226,138,0.04)",
                  fontSize: "10px",
                  lineHeight: 1.6,
                }}
              >
                ✓ Preview only — your
                uploaded dataset has not
                been modified.
              </div>
            </>
          )}
        </div>
      )}

      {/* RECOMMENDED CODE */}

      {recommendedCode.trim() && (
        <RecommendedCode
  code={recommendedCode}
  learningLevel={learningLevel}
  onInsertCode={onInsertCode}
/>
      )}
    </div>
  );
}
function getRecommendedCode(
  recommendation: PreprocessingRecommendation,
  learningLevel: LearningLevel
): string {
  const backendCode =
    recommendation.example_code?.trim();

  if (
    learningLevel === "Advanced" &&
    backendCode
  ) {
    return backendCode;
  }

  const feature = JSON.stringify(
    recommendation.feature
  );

  const strategy =
    getPreviewStrategy(recommendation);

  if (!strategy) {
    return backendCode ?? "";
  }

  if (
    recommendation.feature_type ===
    "numerical"
  ) {
    if (strategy === "median") {
      if (learningLevel === "Medium") {
        return `# Median imputation is recommended because this feature
# may be affected by skewness or outliers.

fill_value = df[${feature}].median()

df[${feature}] = df[${feature}].fillna(
    fill_value
)`;
      }

      return `df[${feature}] = df[${feature}].fillna(
    df[${feature}].median()
)`;
    }

    if (strategy === "mean") {
      if (learningLevel === "Medium") {
        return `# Mean imputation is recommended because this feature
# is approximately symmetric with limited outlier influence.

fill_value = df[${feature}].mean()

df[${feature}] = df[${feature}].fillna(
    fill_value
)`;
      }

      return `df[${feature}] = df[${feature}].fillna(
    df[${feature}].mean()
)`;
    }
  }

  if (
    recommendation.feature_type ===
    "categorical"
  ) {
    if (strategy === "most_frequent") {
      if (learningLevel === "Medium") {
        return `# Fill missing categories using the most frequent value.

fill_value = df[${feature}].mode()[0]

df[${feature}] = df[${feature}].fillna(
    fill_value
)`;
      }

      return `df[${feature}] = df[${feature}].fillna(
    df[${feature}].mode()[0]
)`;
    }

    if (strategy === "unknown") {
      if (learningLevel === "Medium") {
        return `# Keep missing values as an explicit category.

df[${feature}] = df[${feature}].fillna(
    "Unknown"
)`;
      }

      return `df[${feature}] = df[${feature}].fillna(
    "Unknown"
)`;
    }
  }

  return backendCode ?? "";
}

function RecommendedCode({
  code,
  learningLevel,
  onInsertCode,
}: {
  code: string;
  learningLevel: LearningLevel;
  onInsertCode: (code: string) => void;
}) {
  const [showCode, setShowCode] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [copyError, setCopyError] =
    useState("");

  async function handleCopy() {
    try {
      setCopyError("");

      await navigator.clipboard.writeText(
        code
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);

      setCopyError(
        "Could not access the clipboard. Select the code and copy it manually."
      );
    }
  }

  return (
    <div
      style={{
        marginTop: "13px",
        padding: "12px",
        borderRadius: "8px",
        border:
          "1px solid rgba(114,226,138,0.16)",
        background:
          "rgba(114,226,138,0.035)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            Recommended Code
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "9px",
              opacity: 0.55,
              lineHeight: 1.5,
            }}
          >
            {learningLevel} learning
            level • Nothing is executed
            automatically.
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCode(
              (previous) => !previous
            )
          }
          style={{
            padding: "7px 11px",
            borderRadius: "7px",
            border:
              "1px solid rgba(114,226,138,0.22)",
            background:
              "rgba(114,226,138,0.08)",
            color: "inherit",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: 700,
          }}
        >
          {showCode
            ? "Hide Recommended Code"
            : "Show Recommended Code"}
        </button>
      </div>

      {showCode && (
        <>
          <pre
            style={{
              marginTop: "10px",
              marginBottom: 0,
              padding: "12px",
              borderRadius: "8px",
              overflowX: "auto",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(0,0,0,0.22)",
              fontSize: "10px",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
            }}
          >
            {code}
          </pre>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "9px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: "7px 11px",
                borderRadius: "7px",
                border:
                  "1px solid rgba(114,226,138,0.22)",
                background:
                  "rgba(114,226,138,0.08)",
                color: "inherit",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {copied
                ? "✓ Copied"
                : "Copy Code"}
            </button>
            <button
  type="button"
  onClick={() => onInsertCode(code)}
  style={{
    padding: "7px 11px",
    borderRadius: "7px",
    border:
      "1px solid rgba(100,160,255,0.25)",
    background:
      "rgba(100,160,255,0.09)",
    color: "inherit",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 700,
  }}
>
  + Insert into New Cell
</button>
          </div>

          {copyError && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "9px",
                lineHeight: 1.5,
                opacity: 0.75,
              }}
            >
              ⚠ {copyError}
            </div>
          )}

          <div
            style={{
              marginTop: "9px",
              fontSize: "9px",
              opacity: 0.6,
              lineHeight: 1.55,
            }}
          >
            Copy this code into a notebook
            cell and run it yourself.
            ModelMind does not change the
            dataset automatically.
          </div>
        </>
      )}
    </div>
  );
}

function Header({
  learningLevel,
}: {
  learningLevel: LearningLevel;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "flex-start",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "16px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          🧠 Smart Preprocessing
          Advisor 2.0
        </div>

        <div
          style={{
            marginTop: "5px",
            fontSize: "11px",
            opacity: 0.6,
            lineHeight: 1.6,
          }}
        >
          Understand what preprocessing
          your dataset may need, why it is
          recommended, and the code you can
          run yourself.
        </div>
      </div>

      <div
        style={{
          padding: "6px 9px",
          borderRadius: "7px",
          border:
            "1px solid rgba(100,160,255,0.18)",
          background:
            "rgba(100,160,255,0.07)",
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        {learningLevel}
      </div>
    </div>
  );
}

function Panel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: "18px",
        padding: "16px",
        borderRadius: "10px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.015)",
      }}
    >
      {children}
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
    <div
      style={{
        padding: "10px",
        borderRadius: "7px",
        border:
          "1px solid rgba(255,255,255,0.07)",
        background:
          "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "3px",
          fontSize: "9px",
          opacity: 0.5,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontWeight: 700,
        marginBottom: "9px",
      }}
    >
      {children}
    </div>
  );
}

function Chip({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | boolean;
}) {
  return (
    <span
      style={{
        padding: "5px 7px",
        borderRadius: "6px",
        border:
          "1px solid rgba(255,255,255,0.07)",
        background:
          "rgba(255,255,255,0.025)",
        fontSize: "9px",
      }}
    >
      <span
        style={{
          opacity: 0.5,
        }}
      >
        {label}:{" "}
      </span>

      <strong>
        {String(value)}
      </strong>
    </span>
  );
}

function MissingBadge({
  percentage,
  severity,
}: {
  percentage: number;
  severity: string;
}) {
  return (
    <div
      style={{
        padding: "5px 8px",
        borderRadius: "6px",
        border:
          "1px solid rgba(255,255,255,0.07)",
        background:
          percentage > 0
            ? "rgba(255,190,90,0.06)"
            : "rgba(114,226,138,0.06)",
        fontSize: "9px",
      }}
    >
      {percentage > 0
        ? `${percentage}% missing · ${severity}`
        : "No missing values"}
    </div>
  );
}

function WarningBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: "7px",
        border:
          "1px solid rgba(255,190,90,0.16)",
        background:
          "rgba(255,190,90,0.04)",
        fontSize: "10px",
        lineHeight: 1.55,
      }}
    >
      ⚠ {children}
    </div>
  );
}

function Reason({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div
      style={{
        marginTop: "5px",
        fontSize: "10px",
        lineHeight: 1.6,
        opacity: 0.75,
      }}
    >
      <strong>{label}:</strong>{" "}
      {text}
    </div>
  );
}

function StatusBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        fontSize: "11px",
        opacity: 0.7,
      }}
    >
      {children}
    </div>
  );
}

function getPreviewStrategy(
  recommendation: PreprocessingRecommendation
): string | null {
  if (
    recommendation.missing_count <= 0
  ) {
    return null;
  }

  const strategy =
    recommendation.imputation_strategy
      .trim()
      .toLowerCase()
      .replace(/-/g, "_")
      .replace(/\s+/g, "_");

  if (
    recommendation.feature_type ===
    "numerical"
  ) {
    if (
      strategy.includes("median")
    ) {
      return "median";
    }

    if (
      strategy.includes("mean")
    ) {
      return "mean";
    }

    return null;
  }

  if (
    strategy.includes(
      "most_frequent"
    ) ||
    strategy.includes("mode")
  ) {
    return "most_frequent";
  }

  if (
    strategy.includes("unknown")
  ) {
    return "unknown";
  }

  return null;
}

function PreviewSide({
  title,
  preview,
  side,
}: {
  title: string;
  preview: PreprocessingPreviewResult;
  side: "before" | "after";
}) {
  const data = preview[side];
  const stats = data.statistics;

  return (
    <div
      style={{
        padding: "10px",
        borderRadius: "7px",
        border:
          "1px solid rgba(255,255,255,0.07)",
        background:
          "rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        <Chip
          label="Missing"
          value={
            stats.missing_count
          }
        />

        <Chip
          label="Missing %"
          value={`${stats.missing_percentage}%`}
        />

        {preview.feature_type ===
          "numerical" && (
          <>
            <Chip
              label="Mean"
              value={
                stats.mean ??
                "N/A"
              }
            />

            <Chip
              label="Median"
              value={
                stats.median ??
                "N/A"
              }
            />

            <Chip
              label="Std"
              value={
                stats.std ??
                "N/A"
              }
            />
          </>
        )}

        {preview.feature_type ===
          "categorical" && (
          <>
            <Chip
              label="Unique"
              value={
                stats.unique_count ??
                "N/A"
              }
            />

            <Chip
              label="Most frequent"
              value={
                stats
                  .most_frequent_value ??
                "N/A"
              }
            />
          </>
        )}
      </div>

      <div
        style={{
          marginTop: "9px",
          fontSize: "9px",
          opacity: 0.55,
          lineHeight: 1.6,
        }}
      >
        Sample:{" "}
        {data.sample
          .map((value) =>
            value === null
              ? "null"
              : String(value)
          )
          .join(", ")}
      </div>
    </div>
  );
}