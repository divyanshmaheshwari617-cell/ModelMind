"use client";

import { DatasetAnalysis } from "@/lib/api";
import TargetAnalyzer from "./TargetAnalyzer";
import FeatureAnalyzer from "./FeatureAnalyzer";
interface Props {
  dataset: DatasetAnalysis;
  runtimeId: string;
  filename: string;
  onClose: () => void;
}
export default function DatasetXRay({
  dataset,
  runtimeId,
  filename,
  onClose,
}: Props) {
  const missingColumns =
    Object.entries(
      dataset.missing_values
    ).sort(
      (a, b) => b[1] - a[1]
    );

  const hasMissing =
    dataset.total_missing_values > 0;

  const hasDuplicates =
    dataset.duplicate_rows > 0;

  const hasPossibleIds =
    dataset.likely_id_columns.length > 0;

  return (
    <div
      style={{
        marginTop: "16px",
        borderTop:
          "1px solid rgba(255,255,255,0.08)",
        padding: "18px 16px",
      }}
    >
      {/* =====================================
          HEADER
          ===================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            🔬 Dataset X-Ray
          </div>

          <div
            style={{
              marginTop: "4px",
              fontSize: "12px",
              opacity: 0.6,
            }}
          >
            ModelMind analysis of{" "}
            {dataset.filename}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            border:
              "1px solid rgba(255,255,255,0.12)",
            background:
              "rgba(255,255,255,0.05)",
            color: "inherit",
            borderRadius: "7px",
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>

      {/* =====================================
          DATASET HEALTH
          ===================================== */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Dataset Health
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "10px",
          }}
        >
          <MetricCard
            label="Rows"
            value={dataset.rows}
          />

          <MetricCard
            label="Columns"
            value={dataset.columns}
          />

          <MetricCard
            label="Missing"
            value={
              dataset.total_missing_values
            }
          />

          <MetricCard
            label="Duplicates"
            value={
              dataset.duplicate_rows
            }
          />
        </div>
      </div>

      {/* =====================================
          FEATURE TYPES
          ===================================== */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Feature Types
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "10px",
          }}
        >
          <MetricCard
            label="Numerical"
            value={
              dataset.numeric_columns.length
            }
          />

          <MetricCard
            label="Categorical"
            value={
              dataset
                .categorical_columns.length
            }
          />
        </div>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "7px",
          }}
        >
          {dataset.column_names.map(
            (column) => {
              const isNumeric =
                dataset.numeric_columns.includes(
                  column
                );

              return (
                <span
                  key={column}
                  title={
                    dataset.dtypes[column]
                  }
                  style={{
                    padding:
                      "5px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    background: isNumeric
                      ? "rgba(100,160,255,0.08)"
                      : "rgba(190,120,255,0.08)",
                  }}
                >
                  {column}

                  <span
                    style={{
                      opacity: 0.5,
                      marginLeft: "5px",
                    }}
                  >
                    {
                      dataset.dtypes[
                        column
                      ]
                    }
                  </span>
                </span>
              );
            }
          )}
        </div>
      </div>

      {/* =====================================
          SMART WARNINGS
          ===================================== */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Smart Warnings
        </div>

        {!hasMissing &&
          !hasDuplicates &&
          !hasPossibleIds && (
            <InfoBox
              title="✓ No obvious structural problems"
              text="ModelMind did not detect missing values, duplicate rows, or obvious ID columns in this first scan."
              type="good"
            />
          )}

        {hasMissing && (
          <InfoBox
            title={`⚠ ${dataset.total_missing_values} missing values detected`}
            text="Missing data can affect model training. You may need to remove rows, fill missing values, or use an imputation strategy."
            type="warning"
          />
        )}

        {hasDuplicates && (
          <InfoBox
            title={`⚠ ${dataset.duplicate_rows} duplicate rows detected`}
            text="Duplicate records can give repeated observations extra influence during model training. Check whether these duplicates are intentional."
            type="warning"
          />
        )}

        {hasPossibleIds && (
          <InfoBox
            title="⚠ Possible identifier column"
            text={`ModelMind detected: ${dataset.likely_id_columns.join(
              ", "
            )}. Identifier columns often identify individual records rather than describe useful predictive patterns.`}
            type="warning"
          />
        )}
      </div>

      {/* =====================================
          MISSING VALUES
          ===================================== */}

      {hasMissing && (
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            Missing Values by Column
          </div>

          <div
            style={{
              border:
                "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {missingColumns.map(
              ([column, count]) => {
                const percentage =
                  dataset.rows > 0
                    ? (
                        (count /
                          dataset.rows) *
                        100
                      ).toFixed(1)
                    : "0.0";

                return (
                  <div
                    key={column}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "12px",
                      padding:
                        "9px 12px",
                      borderBottom:
                        "1px solid rgba(255,255,255,0.05)",
                      fontSize: "12px",
                    }}
                  >
                    <span>
                      {column}
                    </span>

                    <span
                      style={{
                        opacity: 0.65,
                      }}
                    >
                      {count} missing
                      {" · "}
                      {percentage}%
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* =====================================
          BEGINNER EXPLANATION
          ===================================== */}

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          🧠 ModelMind Explanation
        </div>

        <div
          style={{
            padding: "13px",
            borderRadius: "8px",
            border:
              "1px solid rgba(100,160,255,0.14)",
            background:
              "rgba(100,160,255,0.05)",
            fontSize: "12px",
            lineHeight: 1.7,
            opacity: 0.9,
          }}
        >
          Your dataset contains{" "}
          <strong>
            {
              dataset.numeric_columns
                .length
            }
          </strong>{" "}
          numerical features and{" "}
          <strong>
            {
              dataset
                .categorical_columns
                .length
            }
          </strong>{" "}
          categorical features.

          {dataset
            .categorical_columns
            .length > 0 && (
            <>
              {" "}
              Categorical features
              usually need to be
              converted into numerical
              form before many machine
              learning algorithms can
              use them.
            </>
          )}

          {hasMissing && (
            <>
              {" "}
              Your dataset also
              contains missing values,
              so you should decide how
              to handle them before
              training.
            </>
          )}

          {hasPossibleIds && (
            <>
              {" "}
              Review the detected ID
              columns before using them
              as model features.
            </>
          )}
        </div>
      </div>

      {/* =====================================
          RECOMMENDED NEXT STEPS
          ===================================== */}

      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          💡 Recommended Next Steps
        </div>

        <div
          style={{
            display: "grid",
            gap: "7px",
            fontSize: "12px",
          }}
        >
          {hasMissing && (
            <Step
              number={1}
              text="Handle missing values."
            />
          )}

          {hasDuplicates && (
            <Step
              number={2}
              text="Review duplicate rows."
            />
          )}

          {hasPossibleIds && (
            <Step
              number={3}
              text="Decide whether ID columns should be removed from model features."
            />
          )}

          <Step
            number={4}
            text="Choose the column you want the model to predict."
          />

          {dataset
            .categorical_columns
            .length > 0 && (
            <Step
              number={5}
              text="Encode categorical features before training models that require numerical input."
            />
          )}

          <Step
            number={6}
            text="Explore feature distributions and relationships."
          />

          <Step
            number={7}
            text="Split the dataset into training and testing data."
          />
        </div>
      </div>
      {/* =====================================
    TARGET ANALYZER
    ===================================== */}

<TargetAnalyzer
  dataset={dataset}
  runtimeId={runtimeId}
  filename={filename}
/>
{/* =========================================
    FEATURE ANALYZER
    ========================================= */}

<FeatureAnalyzer
  dataset={dataset}
  runtimeId={runtimeId}
  filename={filename}
/>
    </div>
  );


}


/* =========================================================
   SMALL UI COMPONENTS
   ========================================================= */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "11px",
          opacity: 0.55,
          marginTop: "3px",
        }}
      >
        {label}
      </div>
    </div>
  );
}


function InfoBox({
  title,
  text,
  type,
}: {
  title: string;
  text: string;
  type: "warning" | "good";
}) {
  return (
    <div
      style={{
        padding: "12px",
        marginBottom: "8px",
        borderRadius: "8px",

        border:
          type === "warning"
            ? "1px solid rgba(255,190,90,0.18)"
            : "1px solid rgba(114,226,138,0.18)",

        background:
          type === "warning"
            ? "rgba(255,190,90,0.05)"
            : "rgba(114,226,138,0.05)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 600,
          marginBottom: "5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "11px",
          lineHeight: 1.6,
          opacity: 0.7,
        }}
      >
        {text}
      </div>
    </div>
  );
}


function Step({
  number,
  text,
}: {
  number: number;
  text: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "9px",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          minWidth: "22px",
          height: "22px",
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "rgba(100,160,255,0.10)",
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        {number}
      </span>

      <span
        style={{
          paddingTop: "2px",
          opacity: 0.8,
        }}
      >
        {text}
      </span>
    </div>
  );
}