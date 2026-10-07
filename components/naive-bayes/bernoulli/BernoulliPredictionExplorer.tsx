import type {
  BernoulliNBModel,
  NaiveBayesPrediction,
} from "../types/naiveBayes";

type Props = {
  model: BernoulliNBModel;
  prediction: NaiveBayesPrediction;
  queryValues: Record<string, number>;
  onChange: (feature: string, value: number) => void;
};

export default function BernoulliPredictionExplorer({
  model,
  prediction,
  queryValues,
  onChange,
}: Props) {
  return (
    <section style={card}>
      <div style={eyebrow}>STEP 3 · BUILD A NEW EMAIL</div>

      <h3 style={title}>
        Toggle words on and off
      </h3>

      <p style={description}>
        Turn each feature ON if the word is present and OFF if it is
        absent. Watch how both presence and absence change the
        prediction.
      </p>

      <div style={toggleGrid}>
        {model.features.map((feature) => {
          const active = (queryValues[feature] ?? 0) > 0;

          return (
            <button
              key={feature}
              type="button"
              onClick={() =>
                onChange(feature, active ? 0 : 1)
              }
              style={{
                ...toggle,
                ...(active ? activeToggle : inactiveToggle),
              }}
            >
              <span style={toggleFeature}>{feature}</span>

              <strong>
                {active ? "1 · PRESENT" : "0 · ABSENT"}
              </strong>
            </button>
          );
        })}
      </div>

      <div style={emailBox}>
        <strong>New email:</strong>

        <div style={chips}>
          {model.features.map((feature) => {
            const active = (queryValues[feature] ?? 0) > 0;

            return (
              <span
                key={feature}
                style={{
                  ...chip,
                  opacity: active ? 1 : 0.35,
                }}
              >
                {feature}: {active ? "Present" : "Absent"}
              </span>
            );
          })}
        </div>
      </div>

      <div style={scoreGrid}>
        {prediction.classScores.map((score) => (
          <div key={score.classLabel} style={scoreCard}>
            <div style={scoreHeader}>
              <strong style={className}>{score.classLabel}</strong>

              <strong style={posterior}>
                {(score.posteriorProbability * 100).toFixed(2)}%
              </strong>
            </div>

            <div style={prior}>
              Prior = {score.prior.toFixed(4)}
            </div>

            <div style={featureRows}>
              {score.likelihoods.map((item) => (
                <div key={item.feature} style={featureRow}>
                  <div>
                    <strong>{item.feature}</strong>

                    <div style={tiny}>
                      x = {item.value}
                    </div>
                  </div>

                  <div style={right}>
                    <div>
                      likelihood = {item.likelihood.toFixed(4)}
                    </div>

                    <div style={meaning}>
                      {item.value > 0
                        ? "uses P(feature | class)"
                        : "uses 1 − P(feature | class)"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={logScore}>
              <span>Log score</span>
              <strong>{score.logPosteriorScore.toFixed(4)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div style={predictionBox}>
        <div style={check}>✓</div>

        <div>
          <div style={predictionLabel}>
            Bernoulli Naive Bayes predicts
          </div>

          <strong style={predictionValue}>
            {prediction.predictedClass}
          </strong>
        </div>
      </div>
    </section>
  );
}

const card = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const eyebrow = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = { margin: "5px 0 8px" };

const description = {
  color: "#94a3b8",
  lineHeight: 1.65,
};

const toggleGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const toggle = {
  padding: 14,
  borderRadius: 11,
  cursor: "pointer",
  textAlign: "left" as const,
  display: "grid",
  gap: 7,
};

const activeToggle = {
  border: "1px solid #22c55e",
  background: "#052e16",
  color: "#bbf7d0",
};

const inactiveToggle = {
  border: "1px solid #475569",
  background: "#020617",
  color: "#94a3b8",
};

const toggleFeature = {
  color: "inherit",
  fontSize: 13,
};

const emailBox = {
  marginTop: 14,
  padding: 13,
  borderRadius: 11,
  background: "#111827",
};

const chips = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 7,
  marginTop: 9,
};

const chip = {
  padding: "6px 9px",
  borderRadius: 999,
  background: "#172554",
  color: "#bfdbfe",
  fontSize: 11,
};

const scoreGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 12,
  marginTop: 14,
};

const scoreCard = {
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #334155",
};

const scoreHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const className = { fontSize: 18 };

const posterior = {
  color: "#34d399",
  fontSize: 21,
};

const prior = {
  marginTop: 7,
  color: "#94a3b8",
  fontSize: 11,
  fontFamily: "monospace",
};

const featureRows = {
  display: "grid",
  gap: 6,
  marginTop: 11,
};

const featureRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: 8,
  borderRadius: 8,
  background: "#111827",
  color: "#cbd5e1",
  fontSize: 11,
};

const tiny = {
  color: "#64748b",
  marginTop: 2,
};

const right = {
  textAlign: "right" as const,
  fontFamily: "monospace",
};

const meaning = {
  color: "#a78bfa",
  marginTop: 2,
  fontFamily: "sans-serif",
};

const logScore = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10,
  paddingTop: 10,
  borderTop: "1px solid #334155",
  fontFamily: "monospace",
};

const predictionBox = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: "#052e16",
  border: "1px solid #166534",
};

const check = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#16a34a",
  fontWeight: 900,
};

const predictionLabel = {
  color: "#86efac",
  fontSize: 12,
};

const predictionValue = {
  display: "block",
  marginTop: 2,
  color: "#dcfce7",
  fontSize: 24,
};