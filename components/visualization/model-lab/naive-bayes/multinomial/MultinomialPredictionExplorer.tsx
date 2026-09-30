import type {
  MultinomialNBModel,
  NaiveBayesPrediction,
} from "../types/naiveBayes";

type Props = {
  model: MultinomialNBModel;
  prediction: NaiveBayesPrediction;
  queryValues: Record<string, number>;
  onQueryChange: (
    feature: string,
    value: number
  ) => void;
};

export default function MultinomialPredictionExplorer({
  model,
  prediction,
  queryValues,
  onQueryChange,
}: Props) {
  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>STEP 3 · NEW EMAIL</div>

      <h3 style={titleStyle}>
        Build a new email and watch the prediction change
      </h3>

      <p style={descriptionStyle}>
        Each control represents how many times a word occurs in the new
        email. Multinomial Naive Bayes uses those counts when calculating
        each class score.
      </p>

      <div style={controlGridStyle}>
        {model.features.map((feature) => (
          <div key={feature} style={controlStyle}>
            <div style={controlHeaderStyle}>
              <strong>{feature}</strong>

              <span style={countBadgeStyle}>
                {queryValues[feature] ?? 0}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={queryValues[feature] ?? 0}
              onChange={(event) =>
                onQueryChange(
                  feature,
                  Number(event.target.value)
                )
              }
              style={rangeStyle}
            />

            <div style={rangeLabelsStyle}>
              <span>0 times</span>
              <span>8 times</span>
            </div>
          </div>
        ))}
      </div>

      <div style={emailStyle}>
        <div style={emailTitleStyle}>
          ✉ New email representation
        </div>

        <div style={tokenContainerStyle}>
          {model.features.map((feature) => {
            const count = queryValues[feature] ?? 0;

            return (
              <span
                key={feature}
                style={{
                  ...tokenStyle,
                  opacity: count === 0 ? 0.35 : 1,
                }}
              >
                {feature} × {count}
              </span>
            );
          })}
        </div>
      </div>

      <div style={scoresGridStyle}>
        {prediction.classScores.map((score) => (
          <div key={score.classLabel} style={scoreCardStyle}>
            <div style={scoreHeaderStyle}>
              <strong style={classStyle}>
                {score.classLabel}
              </strong>

              <strong style={posteriorStyle}>
                {(score.posteriorProbability * 100).toFixed(2)}%
              </strong>
            </div>

            <div style={priorStyle}>
              Prior P({score.classLabel}) ={" "}
              {score.prior.toFixed(4)}
            </div>

            <div style={calculationTitleStyle}>
              Feature contributions
            </div>

            <div style={featureListStyle}>
              {score.likelihoods.map((item) => {
                const contribution =
                  item.value === 0
                    ? 0
                    : item.value *
                      Math.log(
                        Math.max(item.likelihood, 1e-12)
                      );

                return (
                  <div key={item.feature} style={featureRowStyle}>
                    <div>
                      <strong>{item.feature}</strong>

                      <div style={tinyStyle}>
                        count = {item.value}
                      </div>
                    </div>

                    <div style={rightStyle}>
                      <div>
                        P = {item.likelihood.toFixed(4)}
                      </div>

                      <div style={contributionStyle}>
                        {item.value} × ln(P) ={" "}
                        {contribution.toFixed(4)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={logScoreStyle}>
              <span>Final log score</span>

              <strong>
                {score.logPosteriorScore.toFixed(4)}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <div style={predictionStyle}>
        <div style={predictionIconStyle}>✓</div>

        <div>
          <div style={predictionLabelStyle}>
            Multinomial Naive Bayes predicts
          </div>

          <strong style={predictionValueStyle}>
            {prediction.predictedClass}
          </strong>
        </div>
      </div>
    </section>
  );
}

const cardStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const eyebrowStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const titleStyle = {
  margin: "5px 0 8px",
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.65,
};

const controlGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const controlStyle = {
  padding: 13,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #1e293b",
};

const controlHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const countBadgeStyle = {
  minWidth: 32,
  padding: "4px 9px",
  textAlign: "center" as const,
  borderRadius: 999,
  background: "#312e81",
  color: "#ddd6fe",
  fontWeight: 900,
};

const rangeStyle = {
  width: "100%",
  marginTop: 12,
};

const rangeLabelsStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#64748b",
  fontSize: 10,
};

const emailStyle = {
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: "#111827",
  border: "1px solid #334155",
};

const emailTitleStyle = {
  color: "#cbd5e1",
  fontWeight: 800,
  marginBottom: 10,
};

const tokenContainerStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 7,
};

const tokenStyle = {
  padding: "6px 9px",
  borderRadius: 999,
  background: "#172554",
  color: "#bfdbfe",
  fontSize: 12,
  transition: "opacity 150ms ease",
};

const scoresGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 12,
  marginTop: 14,
};

const scoreCardStyle = {
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #334155",
};

const scoreHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
};

const classStyle = {
  fontSize: 18,
};

const posteriorStyle = {
  color: "#34d399",
  fontSize: 21,
};

const priorStyle = {
  marginTop: 7,
  color: "#94a3b8",
  fontFamily: "monospace",
  fontSize: 11,
};

const calculationTitleStyle = {
  marginTop: 13,
  marginBottom: 7,
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
};

const featureListStyle = {
  display: "grid",
  gap: 6,
};

const featureRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: 8,
  borderRadius: 8,
  background: "#111827",
  color: "#cbd5e1",
  fontSize: 11,
};

const tinyStyle = {
  color: "#64748b",
  marginTop: 2,
};

const rightStyle = {
  textAlign: "right" as const,
  fontFamily: "monospace",
};

const contributionStyle = {
  marginTop: 2,
  color: "#a78bfa",
};

const logScoreStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10,
  paddingTop: 10,
  borderTop: "1px solid #334155",
  color: "#f8fafc",
  fontFamily: "monospace",
};

const predictionStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: "#052e16",
  border: "1px solid #166534",
};

const predictionIconStyle = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#16a34a",
  color: "white",
  fontWeight: 900,
};

const predictionLabelStyle = {
  color: "#86efac",
  fontSize: 12,
};

const predictionValueStyle = {
  display: "block",
  marginTop: 2,
  color: "#dcfce7",
  fontSize: 24,
};