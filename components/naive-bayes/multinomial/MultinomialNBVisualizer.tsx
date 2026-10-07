import { useMemo, useState } from "react";

import type {
  MultinomialNBModel,
} from "../types/naiveBayes";

import {
  predictMultinomialNB,
} from "../utils/naiveBayesMath";

import MultinomialWordCountVisualizer from "./MultinomialWordCountVisualizer";
import LaplaceSmoothingVisualizer from "./LaplaceSmoothingVisualizer";
import MultinomialPredictionExplorer from "./MultinomialPredictionExplorer";

type Props = {
  model: MultinomialNBModel;
};

function createInitialQuery(
  features: string[]
): Record<string, number> {
  const result: Record<string, number> = {};

  features.forEach((feature, index) => {
    result[feature] =
      index === 0 ? 2 :
      index === 1 ? 1 :
      0;
  });

  return result;
}

export default function MultinomialNBVisualizer({
  model,
}: Props) {
  const [queryValues, setQueryValues] = useState<
    Record<string, number>
  >(() => createInitialQuery(model.features));

  const prediction = useMemo(
    () =>
      predictMultinomialNB(
        model,
        queryValues
      ),
    [model, queryValues]
  );

  function updateQuery(
    feature: string,
    value: number
  ) {
    setQueryValues((current) => ({
      ...current,
      [feature]: Math.max(
        0,
        Math.round(value)
      ),
    }));
  }

  function resetQuery() {
    setQueryValues(
      createInitialQuery(model.features)
    );
  }

  return (
    <div style={containerStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>
          MULTINOMIAL NAIVE BAYES
        </div>

        <h2 style={heroTitleStyle}>
          Learn from counts, not continuous measurements
        </h2>

        <p style={heroTextStyle}>
          Multinomial Naive Bayes is especially useful when features
          represent non-negative counts or frequencies, such as how many
          times words occur in an email.
        </p>

        <div style={flowStyle}>
          <span style={flowItemStyle}>Word Counts</span>
          <span>→</span>
          <span style={flowItemStyle}>Class Prior</span>
          <span>→</span>
          <span style={flowItemStyle}>Laplace Smoothing</span>
          <span>→</span>
          <span style={flowItemStyle}>Likelihoods</span>
          <span>→</span>
          <span style={flowItemStyle}>Log Scores</span>
          <span>→</span>
          <span style={flowItemStyle}>Prediction</span>
        </div>

        <button
          type="button"
          onClick={resetQuery}
          style={resetButtonStyle}
        >
          Reset New Email
        </button>
      </section>

      <MultinomialWordCountVisualizer
        model={model}
      />

      <LaplaceSmoothingVisualizer
        model={model}
      />

      <MultinomialPredictionExplorer
        model={model}
        prediction={prediction}
        queryValues={queryValues}
        onQueryChange={updateQuery}
      />

      <section style={whyStyle}>
        <div style={whyTitleStyle}>
          Why Multinomial instead of Gaussian?
        </div>

        <div style={comparisonGridStyle}>
          <div style={comparisonCardStyle}>
            <strong style={badStyle}>
              Gaussian NB
            </strong>

            <p style={comparisonTextStyle}>
              Designed for continuous measurements whose values can be
              modeled with Gaussian distributions.
            </p>

            <div style={exampleStyle}>
              Example: height, temperature, exam score.
            </div>
          </div>

          <div style={comparisonCardStyle}>
            <strong style={goodStyle}>
              Multinomial NB
            </strong>

            <p style={comparisonTextStyle}>
              Designed for non-negative count or frequency features.
            </p>

            <div style={exampleStyle}>
              Example: word appears 0, 1, 2, 3... times.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const containerStyle = {
  display: "grid",
  gap: 16,
};

const heroStyle = {
  padding: 20,
  borderRadius: 17,
  border: "1px solid #4c1d95",
  background:
    "linear-gradient(135deg, #111827 0%, #1e1b4b 100%)",
};

const eyebrowStyle = {
  color: "#c4b5fd",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const heroTitleStyle = {
  margin: "6px 0 8px",
};

const heroTextStyle = {
  color: "#cbd5e1",
  lineHeight: 1.65,
  maxWidth: 900,
};

const flowStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "center",
  gap: 7,
  marginTop: 14,
  color: "#94a3b8",
};

const flowItemStyle = {
  padding: "6px 9px",
  borderRadius: 999,
  background: "#020617",
  color: "#ddd6fe",
  fontSize: 11,
  fontWeight: 800,
};

const resetButtonStyle = {
  marginTop: 14,
  padding: "9px 13px",
  borderRadius: 9,
  border: "1px solid #7c3aed",
  background: "#5b21b6",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const whyStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const whyTitleStyle = {
  fontWeight: 900,
  fontSize: 18,
};

const comparisonGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const comparisonCardStyle = {
  padding: 14,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #1e293b",
};

const badStyle = {
  color: "#fbbf24",
};

const goodStyle = {
  color: "#34d399",
};

const comparisonTextStyle = {
  color: "#cbd5e1",
  lineHeight: 1.6,
};

const exampleStyle = {
  color: "#94a3b8",
  fontSize: 12,
};