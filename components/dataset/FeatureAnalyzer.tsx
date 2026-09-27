"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  DatasetAnalysis,
  FeatureAnalysis,
  analyzeDatasetFeature,
} from "@/lib/api";
import DistributionPlot from "./DistributionPlot";
import PreprocessingGuide from "./PreprocessingGuide";

interface Props {
  dataset: DatasetAnalysis;
  runtimeId: string;
  filename: string;
}


export default function FeatureAnalyzer({
  dataset,
  runtimeId,
  filename,
}: Props) {

  const [feature, setFeature] =
    useState("");

  const [analysis, setAnalysis] =
    useState<FeatureAnalysis | null>(
      null
    );

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =====================================================
     LOAD FEATURE ANALYSIS
     ===================================================== */

  useEffect(() => {

    if (!feature) {
      setAnalysis(null);
      setError("");
      return;
    }

    let cancelled = false;

    async function loadFeature() {

      try {

        setIsAnalyzing(true);

        setError("");

        setAnalysis(null);

        const result =
          await analyzeDatasetFeature(
            runtimeId,
            filename,
            feature
          );

        if (!cancelled) {
          setAnalysis(result);
        }

      } catch (error) {

        if (!cancelled) {

          setError(
            error instanceof Error
              ? error.message
              : "Feature analysis failed."
          );
        }

      } finally {

        if (!cancelled) {
          setIsAnalyzing(false);
        }
      }
    }

    loadFeature();

    return () => {
      cancelled = true;
    };

  }, [
    feature,
    runtimeId,
    filename,
  ]);


  return (
    <div
      style={{
        marginTop: "22px",
        paddingTop: "20px",
        borderTop:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >

      {/* =============================================
          HEADER
          ============================================= */}

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
          🔬 Feature Analyzer
        </div>

        <div
          style={{
            marginTop: "5px",
            fontSize: "11px",
            opacity: 0.6,
            lineHeight: 1.6,
          }}
        >
          Understand each input feature
          before preprocessing and model
          training.
        </div>

      </div>


      {/* =============================================
          FEATURE SELECTOR
          ============================================= */}

      <div
        style={{
          marginBottom: "15px",
        }}
      >

        <label
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          Which feature do you want to
          understand?
        </label>

        <select
          value={feature}
          onChange={(event) =>
            setFeature(
              event.target.value
            )
          }
          style={{
            width: "100%",
            padding: "11px 12px",
            borderRadius: "8px",
            border:
              "1px solid rgba(255,255,255,0.12)",
            background: "#151820",
            color: "white",
            fontSize: "13px",
          }}
        >

          <option value="">
            Select a feature
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


      {/* =============================================
          LOADING
          ============================================= */}

      {isAnalyzing && (

        <StatusBox>
          Analyzing the complete{" "}
          <strong>
            {feature}
          </strong>{" "}
          column...
        </StatusBox>

      )}


      {/* =============================================
          ERROR
          ============================================= */}

      {error && (

        <div
          style={{
            padding: "11px",
            borderRadius: "8px",
            border:
              "1px solid rgba(255,90,90,0.2)",
            background:
              "rgba(255,90,90,0.05)",
            fontSize: "11px",
          }}
        >
          ⚠ {error}
        </div>

      )}


      {/* =============================================
          ANALYSIS
          ============================================= */}

      {analysis &&
        !isAnalyzing && (

          <FeatureResult
            analysis={analysis}
          />

        )}

    </div>
  );
}


/* =========================================================
   FEATURE RESULT
   ========================================================= */

function FeatureResult({
  analysis,
}: {
  analysis: FeatureAnalysis;
}) {

  return (
    <div>

      {/* BASIC INFORMATION */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "9px",
          marginBottom: "14px",
        }}
      >

        <InfoCard
          label="Feature"
          value={analysis.feature}
        />

        <InfoCard
          label="Feature Type"
          value={
            analysis.feature_type ===
            "numerical"
              ? "Numerical"
              : "Categorical"
          }
        />

        <InfoCard
          label="Data Type"
          value={analysis.dtype}
        />

        <InfoCard
          label="Known Values"
          value={String(
            analysis.non_null_count
          )}
        />

        <InfoCard
          label="Missing"
          value={
            `${analysis.missing_count} ` +
            `(${analysis.missing_percentage}%)`
          }
        />

        <InfoCard
          label="Unique Values"
          value={String(
            analysis.unique_count
          )}
        />

      </div>


      {/* NUMERICAL */}

      {analysis.feature_type ===
        "numerical" && (

        <NumericalFeature
          analysis={analysis}
        />

      )}


      {/* CATEGORICAL */}

      {analysis.feature_type ===
        "categorical" && (

        <CategoricalFeature
          analysis={analysis}
        />

      )}

    </div>
  );
}


/* =========================================================
   NUMERICAL FEATURE
   ========================================================= */

function NumericalFeature({
  analysis,
}: {
  analysis: FeatureAnalysis;
}) {

  return (
    <>

      {/* STATISTICS */}

      <Section
        title="📊 Numerical Statistics"
      >

        <StatRow
          label="Minimum"
          value={formatNumber(
            analysis.minimum
          )}
        />

        <StatRow
          label="Maximum"
          value={formatNumber(
            analysis.maximum
          )}
        />

        <StatRow
          label="Mean"
          value={formatNumber(
            analysis.mean
          )}
        />

        <StatRow
          label="Median"
          value={formatNumber(
            analysis.median
          )}
        />

        <StatRow
          label="Standard Deviation"
          value={formatNumber(
            analysis.standard_deviation
          )}
        />

        <StatRow
          label="Q1"
          value={formatNumber(
            analysis.q1
          )}
        />

        <StatRow
          label="Q3"
          value={formatNumber(
            analysis.q3
          )}
        />

        <StatRow
          label="IQR"
          value={formatNumber(
            analysis.iqr
          )}
        />

      </Section>


      {/* DISTRIBUTION */}

      <Section
        title="📈 Distribution Analysis"
      >

        <StatRow
          label="Shape"
          value={
            getDistributionLabel(
              analysis
                .distribution_shape
            )
          }
        />

        <StatRow
          label="Skewness"
          value={formatNumber(
            analysis.skewness
          )}
        />

        <StatRow
          label="Outliers"
          value={
            `${
              analysis.outlier_count ??
              0
            } (${
              analysis
                .outlier_percentage ??
              0
            }%)`
          }
        />

        <StatRow
          label="Negative Values"
          value={String(
            analysis
              .negative_count ?? 0
          )}
        />

        <StatRow
          label="Zero Values"
          value={String(
            analysis
              .zero_count ?? 0
          )}
        />

      </Section>
      {/* =============================================
    HISTOGRAM + KDE VISUALIZATION
    ============================================= */}

<DistributionPlot
  analysis={analysis}
/>



      {/* IMPUTATION */}

      <AdvisorCard
        icon="🧩"
        title="Missing Value Advisor"
        recommendation={
          getImputationLabel(
            analysis
              .imputation_strategy
          )
        }
        explanation={
          analysis
            .imputation_reason ||
          "No recommendation available."
        }
      />



      {/* SCALING */}

      <AdvisorCard
        icon="⚙️"
        title="Scaling Advisor"
        recommendation={
          getScalingLabel(
            analysis
              .scaling_strategy
          )
        }
        explanation={
          analysis
            .scaling_reason ||
          "No recommendation available."
        }
      />


      {/* TRANSFORMATION */}

      <AdvisorCard
        icon="🔧"
        title="Transformation Advisor"
        recommendation={
          getTransformationLabel(
            analysis
              .transformation_strategy
          )
        }
        explanation={
          analysis
            .transformation_reason ||
          "No recommendation available."
        }
      />
      {/* =============================================
    STEP-BY-STEP PREPROCESSING GUIDE
    ============================================= */}

<PreprocessingGuide
  analysis={analysis}
/>


      {/* IMPORTANT TEACHING NOTE */}

      <div
        style={{
          marginTop: "10px",
          padding: "11px 12px",
          borderRadius: "8px",
          border:
            "1px solid rgba(100,160,255,0.15)",
          background:
            "rgba(100,160,255,0.04)",
          fontSize: "11px",
          lineHeight: 1.65,
          opacity: 0.75,
        }}
      >
        💡 Scaling recommendations also
        depend on the model. For example,
        KNN, SVM and many linear models
        are sensitive to feature scale,
        while Decision Trees and Random
        Forests generally do not require
        feature scaling.
      </div>

    </>
  );
}


/* =========================================================
   CATEGORICAL FEATURE
   ========================================================= */

function CategoricalFeature({
  analysis,
}: {
  analysis: FeatureAnalysis;
}) {

  const distribution =
    analysis.category_distribution ??
    [];

  return (
    <>

      <Section
        title="📊 Category Distribution"
      >

        {distribution.length === 0 && (
          <div
            style={{
              fontSize: "11px",
              opacity: 0.6,
            }}
          >
            No category values
            available.
          </div>
        )}

        {distribution
          .slice(0, 20)
          .map((item) => (

            <div
              key={item.value}
              style={{
                marginBottom: "9px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "10px",
                  marginBottom: "4px",
                  fontSize: "11px",
                }}
              >

                <span>
                  {item.value}
                </span>

                <strong>
                  {item.count}{" "}
                  ({item.percentage}%)
                </strong>

              </div>

              <div
                style={{
                  height: "5px",
                  borderRadius: "999px",
                  overflow: "hidden",
                  background:
                    "rgba(255,255,255,0.07)",
                }}
              >

                <div
                  style={{
                    width:
                      `${Math.min(
                        item.percentage,
                        100
                      )}%`,
                    height: "100%",
                    background:
                      "rgba(120,150,255,0.75)",
                  }}
                />

              </div>

            </div>

          ))}

      </Section>


      <AdvisorCard
        icon="🧩"
        title="Missing Value Advisor"
        recommendation={
          getImputationLabel(
            analysis
              .imputation_strategy
          )
        }
        explanation={
          analysis
            .imputation_reason ||
          "No recommendation available."
        }
      />


      <div
        style={{
          marginTop: "10px",
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
            fontSize: "11px",
            fontWeight: 700,
            marginBottom: "5px",
          }}
        >
          🔤 Encoding Advisor
        </div>

        <div
          style={{
            fontSize: "11px",
            lineHeight: 1.65,
            opacity: 0.68,
          }}
        >
          ModelMind will next determine
          whether this feature is nominal,
          ordinal, binary or
          high-cardinality before
          recommending OneHotEncoder,
          OrdinalEncoder or another
          encoding strategy.
        </div>

      </div>

    </>
  );
}


/* =========================================================
   ADVISOR CARD
   ========================================================= */

function AdvisorCard({
  icon,
  title,
  recommendation,
  explanation,
}: {
  icon: string;
  title: string;
  recommendation: string;
  explanation: string;
}) {

  return (
    <div
      style={{
        marginTop: "10px",
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
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        {icon} {title}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "10px",
          opacity: 0.5,
        }}
      >
        Suggested starting point
      </div>

      <div
        style={{
          marginTop: "3px",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {recommendation}
      </div>

      <div
        style={{
          marginTop: "7px",
          fontSize: "11px",
          lineHeight: 1.65,
          opacity: 0.68,
        }}
      >
        {explanation}
      </div>

    </div>
  );
}


/* =========================================================
   BASIC UI
   ========================================================= */

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
        marginTop: "10px",
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
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "9px",
        }}
      >
        {title}
      </div>

      {children}

    </div>
  );
}


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
          fontSize: "13px",
          fontWeight: 700,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>

    </div>
  );
}


function StatRow({
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
        padding: "4px 0",
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

      <strong>
        {value}
      </strong>

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


/* =========================================================
   LABEL HELPERS
   ========================================================= */

function getDistributionLabel(
  value:
    | FeatureAnalysis[
        "distribution_shape"
      ]
    | undefined
): string {

  switch (value) {

    case "approximately_symmetric":
      return "Approximately symmetric";

    case "right_skewed":
      return "Right-skewed";

    case "strongly_right_skewed":
      return "Strongly right-skewed";

    case "left_skewed":
      return "Left-skewed";

    case "strongly_left_skewed":
      return "Strongly left-skewed";

    default:
      return "Unknown";
  }
}


function getImputationLabel(
  value:
    FeatureAnalysis[
      "imputation_strategy"
    ]
): string {

  switch (value) {

    case "mean":
      return "Mean Imputation";

    case "median":
      return "Median Imputation";

    case "most_frequent_or_unknown":
      return (
        "Most Frequent / Unknown"
      );

    case "none":
      return "No Imputation Needed";

    default:
      return "Inspect Feature";
  }
}


function getScalingLabel(
  value:
    FeatureAnalysis[
      "scaling_strategy"
    ]
): string {

  switch (value) {

    case "standard":
      return "StandardScaler";

    case "robust":
      return "RobustScaler";

    case "inspect_after_transform":
      return (
        "Inspect After Transformation"
      );

    default:
      return "Model Dependent";
  }
}


function getTransformationLabel(
  value:
    FeatureAnalysis[
      "transformation_strategy"
    ]
): string {

  switch (value) {

    case "log1p_candidate":
      return "Explore log1p";

    case "power_transform_candidate":
      return (
        "Explore PowerTransformer"
      );

    case "none":
      return (
        "No Transformation Needed"
      );

    default:
      return "Inspect Distribution";
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