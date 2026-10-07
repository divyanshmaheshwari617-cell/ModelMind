import { useMemo } from "react";

import type {
  NBRow,
} from "../types/naiveBayes";

import {
  predictGaussianNB,
  trainGaussianNB,
} from "../utils/naiveBayesMath";

type Props = {
  rows: NBRow[];
  features: string[];
  step: number;
};

export default function PosteriorCalculator({
  rows,
  features,
  step,
}: Props) {
  const model = useMemo(() => {
    if (
      rows.length === 0 ||
      features.length === 0
    ) {
      return null;
    }

    return trainGaussianNB(
      rows,
      features
    );
  }, [rows, features]);

  const query = useMemo(() => {
    if (!model) {
      return {};
    }

    const values: Record<
      string,
      number
    > = {};

    features.forEach(
      (feature) => {
        const classMeans =
          model.classes.map(
            (classLabel) =>
              model.statistics[
                classLabel
              ][feature].mean
          );

        values[feature] =
          classMeans.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          Math.max(
            classMeans.length,
            1
          );
      }
    );

    return values;
  }, [model, features]);

  const prediction =
    useMemo(() => {
      if (!model) {
        return null;
      }

      return predictGaussianNB(
        model,
        query
      );
    }, [model, query]);

  if (
    step < 5 ||
    !model ||
    !prediction
  ) {
    return null;
  }

  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>
        LIVE CLASS CALCULATION
      </div>

      <h3 style={titleStyle}>
        Follow one prediction from evidence to class
      </h3>

      <p style={descriptionStyle}>
        ModelMind creates a demonstration student near
        the middle of the observed class distributions.
        Every value below comes from the current
        Gaussian Naive Bayes model.
      </p>

      <div style={queryStyle}>
        <strong>
          New Student
        </strong>

        <div style={queryGridStyle}>
          {features.map(
            (feature) => (
              <div
                key={feature}
                style={queryItemStyle}
              >
                <span style={mutedStyle}>
                  {feature}
                </span>

                <strong>
                  {query[
                    feature
                  ]?.toFixed(
                    2
                  )}
                </strong>
              </div>
            )
          )}
        </div>
      </div>

      <div style={classGridStyle}>
        {prediction.classScores.map(
          (score) => (
            <div
              key={
                score.classLabel
              }
              style={classCardStyle}
            >
              <div style={classTitleStyle}>
                Class: {score.classLabel}
              </div>

              <CalculationRow
                label="Prior"
                formula={`P(${score.classLabel})`}
                value={score.prior}
              />

              {score.likelihoods.map(
                (
                  likelihood
                ) => (
                  <CalculationRow
                    key={
                      likelihood.feature
                    }
                    label={
                      likelihood.feature
                    }
                    formula={`P(${likelihood.value.toFixed(
                      2
                    )} | ${score.classLabel})`}
                    value={
                      likelihood.likelihood
                    }
                  />
                )
              )}

              {step >= 7 && (
                <div style={multiplyStyle}>
                  <strong>
                    Naive combination
                  </strong>

                  <div style={smallTextStyle}>
                    log prior + sum of log likelihoods
                  </div>

                  <div style={scoreStyle}>
                    {score.logPosteriorScore.toFixed(
                      4
                    )}
                  </div>
                </div>
              )}

              {step >= 8 && (
                <div style={posteriorStyle}>
                  <span>
                    Posterior
                  </span>

                  <strong>
                    {(
                      score.posteriorProbability *
                      100
                    ).toFixed(
                      2
                    )}
                    %
                  </strong>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {step >= 9 && (
        <div style={winnerStyle}>
          <div style={winnerIconStyle}>
            ✓
          </div>

          <div>
            <strong>
              Prediction:{" "}
              {
                prediction.predictedClass
              }
            </strong>

            <div style={smallTextStyle}>
              This class has the largest posterior
              score among the available classes.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CalculationRow({
  label,
  formula,
  value,
}: {
  label: string;
  formula: string;
  value: number;
}) {
  return (
    <div style={rowStyle}>
      <div>
        <strong>{label}</strong>

        <div style={formulaStyle}>
          {formula}
        </div>
      </div>

      <strong>
        {value.toExponential(3)}
      </strong>
    </div>
  );
}

const cardStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const eyebrowStyle = {
  color: "#38bdf8",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const titleStyle = {
  margin: "5px 0 8px",
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const queryStyle = {
  padding: 14,
  borderRadius: 12,
  background: "#172554",
  border: "1px solid #1d4ed8",
};

const queryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 8,
  marginTop: 10,
};

const queryItemStyle = {
  display: "grid",
  gap: 4,
  padding: 9,
  borderRadius: 8,
  background: "#020617",
};

const mutedStyle = {
  color: "#94a3b8",
  fontSize: 12,
};

const classGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 11,
  marginTop: 13,
};

const classCardStyle = {
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #334155",
};

const classTitleStyle = {
  color: "#c4b5fd",
  fontWeight: 900,
  marginBottom: 9,
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "9px 0",
  borderBottom: "1px solid #1e293b",
};

const formulaStyle = {
  marginTop: 3,
  color: "#64748b",
  fontFamily: "monospace",
  fontSize: 11,
};

const multiplyStyle = {
  marginTop: 11,
  padding: 10,
  borderRadius: 9,
  background: "#111827",
};

const smallTextStyle = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.5,
};

const scoreStyle = {
  marginTop: 7,
  color: "#fbbf24",
  fontFamily: "monospace",
  fontWeight: 900,
};

const posteriorStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10,
  padding: 10,
  borderRadius: 9,
  background: "#312e81",
  color: "#ede9fe",
};

const winnerStyle = {
  display: "flex",
  gap: 11,
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: "#052e16",
  border: "1px solid #166534",
  color: "#bbf7d0",
};

const winnerIconStyle = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#16a34a",
  color: "white",
  fontWeight: 900,
};