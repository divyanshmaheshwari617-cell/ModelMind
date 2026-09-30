import type {
  NaiveBayesVariant,
} from "../types/naiveBayes";

type ModelInfo = {
  variant: NaiveBayesVariant;
  name: string;
  data: string;
  question: string;
  example: string;
  likelihood: string;
  bestFor: string;
};

const models: ModelInfo[] = [
  {
    variant: "gaussian",
    name:
      "Gaussian Naive Bayes",
    data:
      "Continuous numerical values",
    question:
      "What numerical value did we observe?",
    example:
      "Age = 24, Score = 81.5",
    likelihood:
      "Gaussian probability density",
    bestFor:
      "Measurements such as age, height, temperature, score or sensor values.",
  },
  {
    variant:
      "multinomial",
    name:
      "Multinomial Naive Bayes",
    data:
      "Non-negative counts / frequencies",
    question:
      "How many times did it occur?",
    example:
      "Free = 4, Offer = 2",
    likelihood:
      "Smoothed count probability",
    bestFor:
      "Word counts, event frequencies and count-based representations.",
  },
  {
    variant:
      "bernoulli",
    name:
      "Bernoulli Naive Bayes",
    data:
      "Binary 0 / 1 values",
    question:
      "Did it occur or not?",
    example:
      "Free = 1, Offer = 0",
    likelihood:
      "Presence and absence probability",
    bestFor:
      "Binary indicators and presence/absence features.",
  },
];

export default function NaiveBayesComparison() {
  return (
    <section style={card}>
      <div style={eyebrow}>
        MODEL COMPARISON
      </div>

      <h2 style={title}>
        Gaussian vs Multinomial
        vs Bernoulli
      </h2>

      <p style={description}>
        The three models share the
        same Bayes idea. The major
        difference is how they
        model each feature's
        likelihood.
      </p>

      <div style={grid}>
        {models.map(
          (model) => (
            <article
              key={
                model.variant
              }
              style={modelCard}
            >
              <div
                style={
                  modelBadge
                }
              >
                {model.variant.toUpperCase()}
              </div>

              <h3>
                {model.name}
              </h3>

              <Row
                label="Feature data"
                value={
                  model.data
                }
              />

              <Row
                label="Main question"
                value={
                  model.question
                }
              />

              <Row
                label="Example"
                value={
                  model.example
                }
              />

              <Row
                label="Likelihood"
                value={
                  model.likelihood
                }
              />

              <Row
                label="Useful for"
                value={
                  model.bestFor
                }
              />
            </article>
          )
        )}
      </div>

      <div style={memoryBox}>
        <strong>
          Easy memory rule:
        </strong>

        <div style={memoryFlow}>
          <span style={pill}>
            Measurement → Gaussian
          </span>

          <span style={pill}>
            Count → Multinomial
          </span>

          <span style={pill}>
            Yes / No → Bernoulli
          </span>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={row}>
      <span style={rowLabel}>
        {label}
      </span>

      <span style={rowValue}>
        {value}
      </span>
    </div>
  );
}

const card = {
  padding: 20,
  borderRadius: 17,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const eyebrow = {
  color: "#c4b5fd",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = {
  margin: "6px 0 8px",
};

const description = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
  marginTop: 15,
};

const modelCard = {
  padding: 15,
  borderRadius: 13,
  background: "#020617",
  border:
    "1px solid #334155",
};

const modelBadge = {
  display: "inline-block",
  padding: "5px 8px",
  borderRadius: 999,
  background: "#312e81",
  color: "#c4b5fd",
  fontSize: 9,
  fontWeight: 900,
};

const row = {
  display: "grid",
  gap: 3,
  padding: "9px 0",
  borderBottom:
    "1px solid #1e293b",
};

const rowLabel = {
  color: "#64748b",
  fontSize: 10,
  fontWeight: 800,
};

const rowValue = {
  color: "#cbd5e1",
  fontSize: 12,
  lineHeight: 1.5,
};

const memoryBox = {
  marginTop: 15,
  padding: 14,
  borderRadius: 11,
  background: "#172554",
  color: "#dbeafe",
};

const memoryFlow = {
  display: "flex",
  flexWrap:
    "wrap" as const,
  gap: 8,
  marginTop: 9,
};

const pill = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "#020617",
  color: "#bfdbfe",
  fontSize: 11,
  fontWeight: 800,
};