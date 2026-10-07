import {
  useMemo,
  useState,
} from "react";

import type {
  NBRow,
  NaiveBayesVariant,
} from "../types/naiveBayes";

import NaiveBayesDatasetAnalyzer from "../dataset/NaiveBayesDatasetAnalyzer";

import GaussianNBLab from "../gaussian/GaussianNBLab";

import MultinomialNBLab from "../multinomial/MultinomialNBLab";

import BernoulliNBLab from "../bernoulli/BernoulliNBLab";

import TargetTypeAnalyzer, {
  analyzeTarget,
} from "./TargetTypeAnalyzer";

type ActiveDataset = {
  rows: NBRow[];
  features: string[];
  targetColumn: string;
  variant: NaiveBayesVariant;
};

export default function CustomNaiveBayesLab() {
  const [
    activeDataset,
    setActiveDataset,
  ] =
    useState<ActiveDataset | null>(
      null
    );

  const targetAnalysis =
    useMemo(
      () =>
        activeDataset
          ? analyzeTarget(
              activeDataset.rows
            )
          : null,
      [activeDataset]
    );

  function useDataset(
    rows: NBRow[],
    features: string[],
    targetColumn: string,
    variant: NaiveBayesVariant
  ) {
    setActiveDataset({
      rows,
      features,
      targetColumn,
      variant,
    });
  }

  function clearDataset() {
    setActiveDataset(null);
  }

  return (
    <div style={container}>
      <section style={hero}>
        <div style={eyebrow}>
          BRING YOUR OWN DATA
        </div>

        <h2 style={title}>
          Custom Naive Bayes
          Dataset Lab
        </h2>

        <p style={description}>
          Upload a CSV, select
          the target and input
          features, inspect
          missing values and
          feature types, then run
          the actual dataset
          through the appropriate
          Naive Bayes
          visualization.
        </p>

        <div style={flow}>
          <span style={flowItem}>
            Upload CSV
          </span>

          <span>→</span>

          <span style={flowItem}>
            Choose Target
          </span>

          <span>→</span>

          <span style={flowItem}>
            Analyze
          </span>

          <span>→</span>

          <span style={flowItem}>
            Choose NB Variant
          </span>

          <span>→</span>

          <span style={flowItem}>
            Train
          </span>

          <span>→</span>

          <span style={flowItem}>
            Visualize
          </span>
        </div>
      </section>

      <NaiveBayesDatasetAnalyzer
        onUseDataset={
          useDataset
        }
      />

      {activeDataset && (
        <>
          <TargetTypeAnalyzer
            rows={
              activeDataset.rows
            }
            targetColumn={
              activeDataset.targetColumn
            }
          />

          {targetAnalysis?.task ===
            "classification" && (
            <section
              style={activeBox}
            >
              <div>
                <div
                  style={
                    activeLabel
                  }
                >
                  ACTIVE DATASET
                </div>

                <strong
                  style={
                    activeTitle
                  }
                >
                  Running{" "}
                  {variantName(
                    activeDataset.variant
                  )}
                </strong>

                <div
                  style={
                    activeText
                  }
                >
                  {
                    activeDataset
                      .rows.length
                  }{" "}
                  rows ·{" "}
                  {
                    activeDataset
                      .features
                      .length
                  }{" "}
                  features · target:{" "}
                  {
                    activeDataset.targetColumn
                  }
                </div>
              </div>

              <button
                type="button"
                onClick={
                  clearDataset
                }
                style={
                  resetButton
                }
              >
                Clear Active Model
              </button>
            </section>
          )}

          {targetAnalysis?.task ===
            "classification" &&
            activeDataset.variant ===
              "gaussian" && (
              <GaussianNBLab
                rows={
                  activeDataset.rows
                }
                features={
                  activeDataset.features
                }
                targetName={
                  activeDataset.targetColumn
                }
              />
            )}

          {targetAnalysis?.task ===
            "classification" &&
            activeDataset.variant ===
              "multinomial" && (
              <MultinomialNBLab
                rows={
                  activeDataset.rows
                }
                features={
                  activeDataset.features
                }
                targetName={
                  activeDataset.targetColumn
                }
              />
            )}

          {targetAnalysis?.task ===
            "classification" &&
            activeDataset.variant ===
              "bernoulli" && (
              <BernoulliNBLab
                rows={
                  activeDataset.rows
                }
                features={
                  activeDataset.features
                }
                targetName={
                  activeDataset.targetColumn
                }
              />
            )}

          {targetAnalysis?.task ===
            "regression" && (
            <section
              style={
                regressionBox
              }
            >
              <div
                style={
                  regressionIcon
                }
              >
                ↗
              </div>

              <div>
                <strong
                  style={
                    regressionTitle
                  }
                >
                  Regression dataset
                  detected
                </strong>

                <p
                  style={
                    regressionText
                  }
                >
                  Your selected
                  target appears
                  continuous.
                  Gaussian,
                  Multinomial and
                  Bernoulli Naive
                  Bayes in this lab
                  are classification
                  models, so
                  ModelMind will not
                  train an
                  inappropriate
                  classifier.
                </p>

                <p
                  style={
                    regressionText
                  }
                >
                  In the complete
                  ModelMind platform,
                  this dataset can be
                  redirected to a
                  regression model
                  such as Simple or
                  Multiple Linear
                  Regression.
                </p>
              </div>
            </section>
          )}

          {targetAnalysis?.task ===
            "unknown" && (
            <section
              style={
                reviewBox
              }
            >
              <strong>
                Target needs manual
                review
              </strong>

              <p
                style={{
                  marginBottom: 0,
                }}
              >
                ModelMind cannot
                confidently decide
                whether these numeric
                target values are
                classes or a
                continuous quantity.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function variantName(
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

const container = {
  display: "grid",
  gap: 18,
};

const hero = {
  padding: 21,
  borderRadius: 18,
  border:
    "1px solid #4c1d95",
  background:
    "linear-gradient(135deg, #111827 0%, #1e1b4b 100%)",
};

const eyebrow = {
  color: "#c4b5fd",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const title = {
  margin: "6px 0 8px",
};

const description = {
  color: "#cbd5e1",
  lineHeight: 1.65,
  maxWidth: 900,
};

const flow = {
  display: "flex",
  flexWrap:
    "wrap" as const,
  gap: 7,
  alignItems: "center",
  marginTop: 14,
  color: "#64748b",
};

const flowItem = {
  padding: "6px 9px",
  borderRadius: 999,
  background: "#020617",
  color: "#c4b5fd",
  fontSize: 11,
  fontWeight: 800,
};

const activeBox = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap:
    "wrap" as const,
  gap: 12,
  padding: 16,
  borderRadius: 13,
  border:
    "1px solid #166534",
  background: "#052e16",
};

const activeLabel = {
  color: "#86efac",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const activeTitle = {
  display: "block",
  marginTop: 4,
  color: "#dcfce7",
  fontSize: 18,
};

const activeText = {
  marginTop: 4,
  color: "#86efac",
  fontSize: 12,
};

const resetButton = {
  padding: "9px 12px",
  borderRadius: 8,
  border:
    "1px solid #15803d",
  background: "#166534",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const regressionBox = {
  display: "flex",
  gap: 14,
  padding: 18,
  borderRadius: 14,
  background: "#450a0a",
  border:
    "1px solid #991b1b",
};

const regressionIcon = {
  minWidth: 42,
  height: 42,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#991b1b",
  color: "white",
  fontSize: 20,
  fontWeight: 900,
};

const regressionTitle = {
  color: "#fecaca",
  fontSize: 18,
};

const regressionText = {
  color: "#fca5a5",
  lineHeight: 1.6,
};

const reviewBox = {
  padding: 16,
  borderRadius: 12,
  background: "#422006",
  border:
    "1px solid #a16207",
  color: "#fde68a",
};