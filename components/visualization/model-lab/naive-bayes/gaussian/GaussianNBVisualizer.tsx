import {
  useMemo,
  useState,
} from "react";

import type {
  NBRow,
} from "../types/naiveBayes";

import {
  predictGaussianNB,
  trainGaussianNB,
} from "../utils/naiveBayesMath";

import GaussianDistributionPlot from "./GaussianDistributionPlot";
import GaussianLikelihoodExplorer from "./GaussianLikelihoodExplorer";
import GaussianDecisionMap from "./GaussianDecisionMap";

type Props = {
  rows: NBRow[];
  features: string[];
};

export default function GaussianNBVisualizer({
  rows,
  features,
}: Props) {
  const model = useMemo(
    () =>
      trainGaussianNB(
        rows,
        features
      ),
    [rows, features]
  );

  const initialQuery =
    useMemo(() => {
      const values: Record<
        string,
        number
      > = {};

      features.forEach(
        (feature) => {
          const means =
            model.classes.map(
              (classLabel) =>
                model.statistics[
                  classLabel
                ][feature].mean
            );

          values[feature] =
            means.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            Math.max(
              means.length,
              1
            );
        }
      );

      return values;
    }, [model, features]);

  const [
    queryValues,
    setQueryValues,
  ] = useState<
    Record<string, number>
  >(initialQuery);

  const [
    selectedFeature,
    setSelectedFeature,
  ] = useState(
    features[0] ?? ""
  );

  const [
    xFeature,
    setXFeature,
  ] = useState(
    features[0] ?? ""
  );

  const [
    yFeature,
    setYFeature,
  ] = useState(
    features[1] ??
      features[0] ??
      ""
  );

  const prediction =
    useMemo(
      () =>
        predictGaussianNB(
          model,
          queryValues
        ),
      [model, queryValues]
    );

  if (
    rows.length === 0 ||
    features.length === 0
  ) {
    return (
      <div style={warningStyle}>
        Gaussian Naive Bayes needs a dataset and at
        least one numerical feature.
      </div>
    );
  }

  return (
    <section style={containerStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>
          GAUSSIAN NAIVE BAYES
        </div>

        <h2 style={titleStyle}>
          Learn continuous-feature classification visually
        </h2>

        <p style={descriptionStyle}>
          Gaussian Naive Bayes assumes each numerical
          feature follows a Gaussian distribution inside
          each class. ModelMind exposes the mean,
          variance, likelihoods and posterior calculation
          instead of hiding them behind one prediction.
        </p>

        <div style={equationStyle}>
          P(C | x) ∝ P(C) × Π P(xᵢ | C)
        </div>
      </section>

      <section style={statisticsCardStyle}>
        <div style={eyebrowStyle}>
          WHAT THE MODEL LEARNS
        </div>

        <h3>
          Mean and variance for every class
        </h3>

        <div style={statisticsGridStyle}>
          {model.classes.map(
            (classLabel) => (
              <div
                key={classLabel}
                style={classStatsStyle}
              >
                <div style={classHeaderStyle}>
                  <strong>
                    {classLabel}
                  </strong>

                  <span style={priorBadgeStyle}>
                    Prior{" "}
                    {(
                      model.priors[
                        classLabel
                      ] * 100
                    ).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>

                {features.map(
                  (feature) => {
                    const stats =
                      model.statistics[
                        classLabel
                      ][feature];

                    return (
                      <div
                        key={
                          feature
                        }
                        style={
                          statRowStyle
                        }
                      >
                        <span>
                          {
                            feature
                          }
                        </span>

                        <span
                          style={
                            statValuesStyle
                          }
                        >
                          μ{" "}
                          {stats.mean.toFixed(
                            2
                          )}
                          {" • "}
                          σ²{" "}
                          {stats.variance.toFixed(
                            2
                          )}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )
          )}
        </div>
      </section>

      <section style={selectorCardStyle}>
        <label style={labelStyle}>
          Bell-curve feature

          <select
            value={
              selectedFeature
            }
            onChange={(
              event
            ) =>
              setSelectedFeature(
                event.target
                  .value
              )
            }
            style={selectStyle}
          >
            {features.map(
              (feature) => (
                <option
                  key={feature}
                  value={feature}
                >
                  {feature}
                </option>
              )
            )}
          </select>
        </label>

        {features.length >=
          2 && (
          <>
            <label
              style={
                labelStyle
              }
            >
              Decision-map X

              <select
                value={
                  xFeature
                }
                onChange={(
                  event
                ) =>
                  setXFeature(
                    event
                      .target
                      .value
                  )
                }
                style={
                  selectStyle
                }
              >
                {features.map(
                  (
                    feature
                  ) => (
                    <option
                      key={
                        feature
                      }
                      value={
                        feature
                      }
                    >
                      {
                        feature
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label
              style={
                labelStyle
              }
            >
              Decision-map Y

              <select
                value={
                  yFeature
                }
                onChange={(
                  event
                ) =>
                  setYFeature(
                    event
                      .target
                      .value
                  )
                }
                style={
                  selectStyle
                }
              >
                {features.map(
                  (
                    feature
                  ) => (
                    <option
                      key={
                        feature
                      }
                      value={
                        feature
                      }
                    >
                      {
                        feature
                      }
                    </option>
                  )
                )}
              </select>
            </label>
          </>
        )}
      </section>

      <GaussianLikelihoodExplorer
        model={model}
        prediction={prediction}
        queryValues={
          queryValues
        }
        onQueryChange={(
          feature,
          value
        ) =>
          setQueryValues(
            (previous) => ({
              ...previous,
              [feature]:
                value,
            })
          )
        }
      />

      {selectedFeature && (
        <GaussianDistributionPlot
          model={model}
          feature={
            selectedFeature
          }
          queryValue={
            queryValues[
              selectedFeature
            ]
          }
        />
      )}

      {features.length >=
        2 &&
        xFeature !==
          yFeature && (
          <GaussianDecisionMap
            model={model}
            rows={rows}
            xFeature={
              xFeature
            }
            yFeature={
              yFeature
            }
            queryValues={
              queryValues
            }
          />
        )}

      {xFeature ===
        yFeature &&
        features.length >=
          2 && (
          <div
            style={
              warningStyle
            }
          >
            Choose two
            different features
            for the 2D decision
            map.
          </div>
        )}
    </section>
  );
}

const containerStyle = {
  display: "grid",
  gap: 14,
};

const heroStyle = {
  padding: 20,
  borderRadius: 18,
  border:
    "1px solid #4c1d95",
  background:
    "linear-gradient(135deg, #111827, #1e1b4b)",
};

const eyebrowStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const titleStyle = {
  margin: "6px 0 8px",
};

const descriptionStyle = {
  color: "#cbd5e1",
  lineHeight: 1.7,
};

const equationStyle = {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  background: "#020617",
  color: "#c4b5fd",
  fontFamily: "monospace",
  textAlign:
    "center" as const,
  fontSize: 16,
};

const statisticsCardStyle = {
  padding: 18,
  borderRadius: 16,
  background: "#0f172a",
  border:
    "1px solid #334155",
};

const statisticsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 10,
};

const classStatsStyle = {
  padding: 13,
  borderRadius: 11,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const classHeaderStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 9,
};

const priorBadgeStyle = {
  padding: "3px 8px",
  borderRadius: 999,
  background: "#312e81",
  color: "#ddd6fe",
  fontSize: 11,
};

const statRowStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  gap: 10,
  padding: "7px 0",
  borderBottom:
    "1px solid #1e293b",
  color: "#cbd5e1",
  fontSize: 12,
};

const statValuesStyle = {
  color: "#94a3b8",
  fontFamily: "monospace",
};

const selectorCardStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 10,
  padding: 14,
  borderRadius: 13,
  background: "#0f172a",
  border:
    "1px solid #334155",
};

const labelStyle = {
  display: "grid",
  gap: 6,
  color: "#cbd5e1",
  fontSize: 12,
  fontWeight: 700,
};

const selectStyle = {
  padding: 9,
  borderRadius: 8,
  background: "#020617",
  color: "#f8fafc",
  border:
    "1px solid #475569",
};

const warningStyle = {
  padding: 14,
  borderRadius: 11,
  background: "#422006",
  border:
    "1px solid #a16207",
  color: "#fde68a",
};