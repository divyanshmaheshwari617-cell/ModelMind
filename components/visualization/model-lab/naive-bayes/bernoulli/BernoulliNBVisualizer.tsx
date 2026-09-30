import { useMemo, useState } from "react";

import type { BernoulliNBModel } from "../types/naiveBayes";

import { predictBernoulliNB } from "../utils/naiveBayesMath";

import BernoulliPresenceVisualizer from "./BernoulliPresenceVisualizer";
import BernoulliLikelihoodVisualizer from "./BernoulliLikelihoodVisualizer";
import BernoulliPredictionExplorer from "./BernoulliPredictionExplorer";

type Props = {
  model: BernoulliNBModel;
};

function createInitialQuery(
  features: string[]
): Record<string, number> {
  const values: Record<string, number> = {};

  features.forEach((feature, index) => {
    values[feature] = index < 2 ? 1 : 0;
  });

  return values;
}

export default function BernoulliNBVisualizer({
  model,
}: Props) {
  const [queryValues, setQueryValues] = useState<
    Record<string, number>
  >(() => createInitialQuery(model.features));

  const prediction = useMemo(
    () => predictBernoulliNB(model, queryValues),
    [model, queryValues]
  );

  function updateQuery(feature: string, value: number) {
    setQueryValues((current) => ({
      ...current,
      [feature]: value > 0 ? 1 : 0,
    }));
  }

  function reset() {
    setQueryValues(createInitialQuery(model.features));
  }

  return (
    <div style={container}>
      <section style={hero}>
        <div style={eyebrow}>BERNOULLI NAIVE BAYES</div>

        <h2 style={heroTitle}>
          Learn from yes/no evidence
        </h2>

        <p style={heroText}>
          Bernoulli Naive Bayes is designed for binary features.
          Each feature answers a question such as “Does this email
          contain the word Free?”
        </p>

        <div style={flow}>
          <span style={flowItem}>0 / 1 Features</span>
          <span>→</span>
          <span style={flowItem}>Class Prior</span>
          <span>→</span>
          <span style={flowItem}>Presence Probability</span>
          <span>→</span>
          <span style={flowItem}>Absence Probability</span>
          <span>→</span>
          <span style={flowItem}>Posterior</span>
          <span>→</span>
          <span style={flowItem}>Prediction</span>
        </div>

        <button type="button" onClick={reset} style={resetButton}>
          Reset New Email
        </button>
      </section>

      <BernoulliPresenceVisualizer model={model} />

      <BernoulliLikelihoodVisualizer model={model} />

      <BernoulliPredictionExplorer
        model={model}
        prediction={prediction}
        queryValues={queryValues}
        onChange={updateQuery}
      />

      <section style={comparison}>
        <h3 style={{ marginTop: 0 }}>
          Multinomial vs Bernoulli
        </h3>

        <div style={comparisonGrid}>
          <div style={comparisonCard}>
            <strong style={{ color: "#38bdf8" }}>
              Multinomial
            </strong>

            <p style={comparisonText}>
              Uses frequency/count information.
            </p>

            <code style={code}>
              Free = 4, Offer = 2
            </code>

            <div style={example}>
              “How many times did it appear?”
            </div>
          </div>

          <div style={comparisonCard}>
            <strong style={{ color: "#34d399" }}>
              Bernoulli
            </strong>

            <p style={comparisonText}>
              Uses binary presence/absence information.
            </p>

            <code style={code}>
              Free = 1, Offer = 0
            </code>

            <div style={example}>
              “Did it appear at all?”
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const container = {
  display: "grid",
  gap: 16,
};

const hero = {
  padding: 20,
  borderRadius: 17,
  border: "1px solid #065f46",
  background:
    "linear-gradient(135deg, #111827 0%, #022c22 100%)",
};

const eyebrow = {
  color: "#6ee7b7",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const heroTitle = {
  margin: "6px 0 8px",
};

const heroText = {
  color: "#cbd5e1",
  lineHeight: 1.65,
  maxWidth: 900,
};

const flow = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 7,
  alignItems: "center",
  marginTop: 14,
  color: "#94a3b8",
};

const flowItem = {
  padding: "6px 9px",
  borderRadius: 999,
  background: "#020617",
  color: "#a7f3d0",
  fontSize: 11,
  fontWeight: 800,
};

const resetButton = {
  marginTop: 14,
  padding: "9px 13px",
  borderRadius: 9,
  border: "1px solid #059669",
  background: "#047857",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const comparison = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const comparisonGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 10,
};

const comparisonCard = {
  padding: 14,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #1e293b",
};

const comparisonText = {
  color: "#cbd5e1",
  lineHeight: 1.6,
};

const code = {
  color: "#f8fafc",
};

const example = {
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 8,
};