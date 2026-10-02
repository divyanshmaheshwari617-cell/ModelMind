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

          <MLPipelineBuilder
  task={analysis.task}
  analysis={analysis}
  dataset={dataset}
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

/* =========================================================
   ML PIPELINE BUILDER
   ========================================================= */

interface PipelineModel {
  name: string;
  strengths: string[];
  cautions: string[];
}

function MLPipelineBuilder({
  task,
  analysis,
  dataset,
}: {
  task: MLTask;
  analysis: TargetAnalysis;
  dataset: DatasetAnalysis;
}) {
  const [showModels, setShowModels] =
    useState(false);

  const [openModel, setOpenModel] =
    useState<string | null>(null);

  if (task === "unknown") {
    return null;
  }

  const featureCount = Math.max(
    dataset.columns - 1,
    0
  );

  const numericalFeatureCount =
    dataset.numeric_columns.filter(
      (column) =>
        column !== analysis.target
    ).length;

  const categoricalFeatureCount =
    dataset.categorical_columns.filter(
      (column) =>
        column !== analysis.target
    ).length;

  const possibleIdColumns =
    dataset.likely_id_columns.filter(
      (column) =>
        column !== analysis.target
    );

  const hasMissingValues =
    dataset.total_missing_values > 0;

  const hasCategoricalFeatures =
    categoricalFeatureCount > 0;

  const hasPossibleIds =
    possibleIdColumns.length > 0;

  const classificationModels: PipelineModel[] =
    [
      {
        name: "Logistic Regression",
        strengths: [
          "Provides a strong and interpretable classification baseline.",
          "Works well when the relationship between features and class probability is reasonably simple.",
          "Produces probabilities that can support metrics such as ROC-AUC.",
        ],
        cautions: [
          "Usually benefits from feature scaling.",
          "Categorical features must be encoded before training.",
          "May struggle with strongly nonlinear relationships unless features are engineered.",
        ],
      },

      {
        name: "Decision Tree",
        strengths: [
          "Can learn nonlinear decision boundaries.",
          "Can capture interactions between features.",
          "Does not normally require feature scaling.",
        ],
        cautions: [
          "A deep tree can overfit the training data.",
          "Tree depth and other complexity controls should be validated.",
        ],
      },

      {
        name: "Random Forest",
        strengths: [
          "Combines many decision trees to learn nonlinear patterns.",
          "Can capture interactions between multiple features.",
          "Does not normally require feature scaling.",
        ],
        cautions: [
          "Less interpretable than a single decision tree or logistic regression.",
          "Training and prediction can require more computation than simpler models.",
        ],
      },

      {
        name: "K-Nearest Neighbors",
        strengths: [
          "Provides an intuitive distance-based classification approach.",
          "Can model nonlinear class boundaries without learning a fixed equation.",
          "Useful for learning how feature distance affects predictions.",
        ],
        cautions: [
          "Feature scaling is especially important because distance drives predictions.",
          "Prediction can become slower as the training dataset grows.",
          "Irrelevant features can distort distance calculations.",
        ],
      },
    ];

  const regressionModels: PipelineModel[] =
    [
      {
        name: "Linear Regression",
        strengths: [
          "Provides a simple and interpretable regression baseline.",
          "Helps you understand how numerical features relate to the predicted value.",
          "Useful for comparing whether more complex models actually improve performance.",
        ],
        cautions: [
          "Assumes an approximately linear relationship unless features are transformed.",
          "Can be sensitive to influential outliers.",
          "Categorical features must be encoded before training.",
        ],
      },

      {
        name: "Decision Tree Regressor",
        strengths: [
          "Can learn nonlinear relationships.",
          "Can automatically capture interactions between features.",
          "Does not normally require feature scaling.",
        ],
        cautions: [
          "Deep trees can strongly overfit training data.",
          "Tree complexity should be controlled and evaluated on unseen data.",
        ],
      },

      {
        name: "Random Forest Regressor",
        strengths: [
          "Can model complex nonlinear relationships.",
          "Can capture interactions between many features.",
          "Does not normally require feature scaling.",
        ],
        cautions: [
          "Less directly interpretable than Linear Regression.",
          "Uses more computation than a single decision tree.",
          "Hyperparameters should still be validated rather than chosen from training performance alone.",
        ],
      },
    ];

  const models =
    task === "classification"
      ? classificationModels
      : regressionModels;

  const metrics =
    task === "classification"
      ? [
          "Accuracy",
          "Precision",
          "Recall",
          "F1 Score",
          "ROC-AUC",
        ]
      : [
          "MAE",
          "MSE",
          "RMSE",
          "R² Score",
        ];

  const pipelineSteps: {
    title: string;
    detail: string;
  }[] = [
    {
      title: "Define X and y",
      detail: `Use ${analysis.target} as the target y and keep the remaining usable columns as model features X.`,
    },

    ...(hasPossibleIds
      ? [
          {
            title:
              "Review possible identifier columns",
            detail: `Check ${possibleIdColumns.join(
              ", "
            )}. Identifier columns often identify rows rather than provide generalizable predictive information.`,
          },
        ]
      : []),

    {
      title: "Create train/test split",
      detail:
        "Split the data before fitting learned preprocessing so the test set remains unseen during training.",
    },

    ...(hasMissingValues
      ? [
          {
            title:
              "Handle missing values",
            detail:
              "Choose suitable imputation strategies and fit learned imputation using training data only.",
          },
        ]
      : []),

    ...(hasCategoricalFeatures
      ? [
          {
            title:
              "Encode categorical features",
            detail:
              "Convert categorical features into a numerical representation that the selected model can use.",
          },
        ]
      : []),

    {
      title:
        "Scale features when required",
      detail:
        "Distance-based and many linear models benefit from scaling. Tree-based models usually do not require it.",
    },

    {
      title: "Create the model",
      detail:
        "Choose a model as an experiment rather than assuming one algorithm will always perform best.",
    },

    {
      title: "Train on training data",
      detail:
        "Fit preprocessing and the estimator using the training partition only.",
    },

    {
      title: "Predict unseen data",
      detail:
        "Use the trained pipeline to generate predictions for the held-out test data.",
    },

    {
      title: "Evaluate the model",
      detail:
        task === "classification"
          ? "Use classification metrics that match the target distribution and the cost of different mistakes."
          : "Use regression metrics to measure prediction error and how well predictions explain target variation.",
    },
  ];

  return (
    <div
      style={{
        marginTop: "18px",
        padding: "15px",
        borderRadius: "10px",
        border:
          "1px solid rgba(100,160,255,0.16)",
        background:
          "rgba(100,160,255,0.035)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          ⚙ ML Pipeline Builder
        </div>

        <div
          style={{
            marginTop: "4px",
            fontSize: "11px",
            lineHeight: 1.6,
            opacity: 0.62,
          }}
        >
          ModelMind is planning an
          educational machine-learning
          workflow for this dataset. Nothing
          is trained or changed automatically.
        </div>
      </div>

      {/* DATASET UNDERSTANDING */}

      <PipelineSectionTitle>
        Dataset Understanding
      </PipelineSectionTitle>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <PipelineStat
          label="Rows"
          value={String(dataset.rows)}
        />

        <PipelineStat
          label="Features"
          value={String(featureCount)}
        />

        <PipelineStat
          label="Numerical"
          value={String(
            numericalFeatureCount
          )}
        />

        <PipelineStat
          label="Categorical"
          value={String(
            categoricalFeatureCount
          )}
        />

        <PipelineStat
          label="Missing Values"
          value={String(
            dataset.total_missing_values
          )}
        />

        <PipelineStat
          label="Possible IDs"
          value={String(
            possibleIdColumns.length
          )}
        />
      </div>

      {/* TASK */}

      <PipelineSectionTitle>
        Detected Task
      </PipelineSectionTitle>

      <div
        style={{
          padding: "11px 12px",
          borderRadius: "8px",
          border:
            "1px solid rgba(255,255,255,0.08)",
          background:
            "rgba(255,255,255,0.025)",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {analysis.task_type}
        </div>

        <div
          style={{
            marginTop: "4px",
            fontSize: "11px",
            opacity: 0.62,
          }}
        >
          Target:{" "}
          <strong>
            {analysis.target}
          </strong>
        </div>
      </div>

      {/* PIPELINE PLAN */}

      <PipelineSectionTitle>
        Your Pipeline Plan
      </PipelineSectionTitle>

      <div
        style={{
          display: "grid",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        {pipelineSteps.map(
          (step, index) => (
            <PipelineStep
              key={step.title}
              number={index + 1}
              title={step.title}
              detail={step.detail}
            />
          )
        )}
      </div>

      {/* MODEL RECOMMENDATIONS */}

      <div
        style={{
          paddingTop: "14px",
          borderTop:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowModels(
              (previous) => !previous
            );

            setOpenModel(null);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: "7px",
            border:
              "1px solid rgba(100,160,255,0.24)",
            background:
              "rgba(100,160,255,0.08)",
            color: "inherit",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {showModels
            ? "Hide Recommended Models"
            : "Show Recommended Models"}
        </button>

        {showModels && (
          <div
            style={{
              marginTop: "14px",
            }}
          >
            <PipelineSectionTitle>
              Models Worth Exploring
            </PipelineSectionTitle>

            <div
              style={{
                display: "grid",
                gap: "9px",
              }}
            >
              {models.map((model) => (
                <PipelineModelCard
                  key={model.name}
                  model={model}
                  isOpen={
                    openModel ===
                    model.name
                  }
                  onToggle={() =>
                    setOpenModel(
                      openModel ===
                        model.name
                        ? null
                        : model.name
                    )
                  }
                />
              ))}
            </div>

            <div
              style={{
                marginTop: "16px",
              }}
            >
              <PipelineSectionTitle>
                Metrics to Learn
              </PipelineSectionTitle>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "7px",
                }}
              >
                {metrics.map(
                  (metric) => (
                    <span
                      key={metric}
                      style={{
                        padding:
                          "6px 9px",
                        borderRadius:
                          "6px",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        background:
                          "rgba(255,255,255,0.025)",
                        fontSize:
                          "11px",
                        opacity: 0.78,
                      }}
                    >
                      {metric}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BUILD BUTTON */}

      <div
        style={{
          marginTop: "18px",
          paddingTop: "14px",
          borderTop:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          type="button"
          disabled
          title="Pipeline code generation arrives in Batch 9B."
          style={{
            padding: "9px 13px",
            borderRadius: "7px",
            border:
              "1px solid rgba(114,226,138,0.18)",
            background:
              "rgba(114,226,138,0.06)",
            color: "inherit",
            fontSize: "11px",
            fontWeight: 700,
            opacity: 0.55,
            cursor: "not-allowed",
          }}
        >
          Build Learning Pipeline
        </button>

        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            lineHeight: 1.5,
            opacity: 0.5,
          }}
        >
          Planning only in Batch 9A.
          ModelMind will not train a model
          or modify your dataset.
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   PIPELINE BUILDER SMALL COMPONENTS
   ========================================================= */

function PipelineSectionTitle({
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


function PipelineStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "10px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.025)",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "3px",
          fontSize: "10px",
          opacity: 0.55,
        }}
      >
        {label}
      </div>
    </div>
  );
}


function PipelineStep({
  number,
  title,
  detail,
}: {
  number: number;
  title: string;
  detail: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        padding: "10px",
        borderRadius: "8px",
        border:
          "1px solid rgba(255,255,255,0.07)",
        background:
          "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          minWidth: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background:
            "rgba(100,160,255,0.10)",
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          ✓ {title}
        </div>

        <div
          style={{
            marginTop: "3px",
            fontSize: "10px",
            lineHeight: 1.55,
            opacity: 0.58,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}


function PipelineModelCard({
  model,
  isOpen,
  onToggle,
}: {
  model: PipelineModel;
  isOpen: boolean;
  onToggle: () => void;
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
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {model.name}
        </div>

        <button
          type="button"
          onClick={onToggle}
          style={{
            padding: "5px 8px",
            borderRadius: "6px",
            border:
              "1px solid rgba(255,255,255,0.10)",
            background:
              "rgba(255,255,255,0.04)",
            color: "inherit",
            fontSize: "10px",
            cursor: "pointer",
          }}
        >
          {isOpen
            ? "Hide reason"
            : "Why this model?"}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "5px",
              fontSize: "10px",
              lineHeight: 1.55,
            }}
          >
            {model.strengths.map(
              (strength) => (
                <div
                  key={strength}
                  style={{
                    opacity: 0.78,
                  }}
                >
                  ✓ {strength}
                </div>
              )
            )}
          </div>

          <div
            style={{
              marginTop: "9px",
              marginBottom: "5px",
              fontSize: "10px",
              fontWeight: 700,
            }}
          >
            Things to know
          </div>

          <div
            style={{
              display: "grid",
              gap: "5px",
              fontSize: "10px",
              lineHeight: 1.55,
            }}
          >
            {model.cautions.map(
              (caution) => (
                <div
                  key={caution}
                  style={{
                    opacity: 0.65,
                  }}
                >
                  ⚠ {caution}
                </div>
              )
            )}
          </div>
        </div>
      )}
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