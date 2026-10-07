import type {
  GaussianNBModel,
  NaiveBayesPrediction,
} from "../types/naiveBayes";

type Props = {
  model: GaussianNBModel;
  prediction: NaiveBayesPrediction;
  queryValues: Record<string, number>;
  onQueryChange: (
    feature: string,
    value: number
  ) => void;
};

function getStandardDeviation(variance: number) {
  return Math.sqrt(Math.max(variance, 0));
}

export default function GaussianLikelihoodExplorer({
  model,
  prediction,
  queryValues,
  onQueryChange,
}: Props) {
  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>LIVE LIKELIHOOD EXPLORER</div>

      <h3 style={titleStyle}>
        Move the new student and watch the probabilities change
      </h3>

      <p style={descriptionStyle}>
        Change any feature. ModelMind immediately recalculates every
        Gaussian likelihood, posterior probability and final prediction.
      </p>

      <div style={sliderGridStyle}>
        {model.features.map((feature) => {
          const allStats = model.classes.map(
            (classLabel) => model.statistics[classLabel][feature]
          );

          const minimum = Math.min(
            ...allStats.map((stats) => {
              const standardDeviation = getStandardDeviation(
                stats.variance
              );

              return (
                stats.mean -
                3 * Math.max(standardDeviation, 1)
              );
            })
          );

          const maximum = Math.max(
            ...allStats.map((stats) => {
              const standardDeviation = getStandardDeviation(
                stats.variance
              );

              return (
                stats.mean +
                3 * Math.max(standardDeviation, 1)
              );
            })
          );

          const range = Math.max(maximum - minimum, 1);
          const step = range / 100;

          return (
            <div key={feature} style={sliderCardStyle}>
              <div style={sliderHeaderStyle}>
                <strong>{feature}</strong>

                <span style={valueBadgeStyle}>
                  {queryValues[feature].toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min={minimum}
                max={maximum}
                step={step}
                value={queryValues[feature]}
                onChange={(event) =>
                  onQueryChange(
                    feature,
                    Number(event.target.value)
                  )
                }
                style={rangeStyle}
              />

              <div style={rangeLabelsStyle}>
                <span>{minimum.toFixed(1)}</span>
                <span>{maximum.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={scoreGridStyle}>
        {prediction.classScores.map((score) => (
          <div key={score.classLabel} style={scoreCardStyle}>
            <div style={scoreHeaderStyle}>
              <strong>{score.classLabel}</strong>

              <strong style={posteriorStyle}>
                {(score.posteriorProbability * 100).toFixed(2)}%
              </strong>
            </div>

            <div style={priorStyle}>
              Prior P({score.classLabel}) = {score.prior.toFixed(4)}
            </div>

            <div style={likelihoodListStyle}>
              {score.likelihoods.map((item) => (
                <div key={item.feature} style={likelihoodRowStyle}>
                  <span>{item.feature}</span>

                  <span style={monoStyle}>
                    {item.likelihood.toExponential(3)}
                  </span>
                </div>
              ))}
            </div>

            <div style={calculationStyle}>
              <div>log P({score.classLabel})</div>

              <div>+</div>

              <div>
                Σ log P(feature | {score.classLabel})
              </div>

              <div style={equalsStyle}>=</div>

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
            Gaussian Naive Bayes predicts
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
  lineHeight: 1.6,
};

const sliderGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  marginTop: 13,
};

const sliderCardStyle = {
  padding: 13,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #1e293b",
};

const sliderHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
};

const valueBadgeStyle = {
  padding: "3px 8px",
  borderRadius: 999,
  background: "#312e81",
  color: "#ddd6fe",
  fontSize: 12,
};

const rangeStyle = {
  width: "100%",
  marginTop: 12,
};

const rangeLabelsStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#64748b",
  fontSize: 11,
};

const scoreGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
  gap: 11,
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
  alignItems: "center",
  gap: 10,
};

const posteriorStyle = {
  color: "#34d399",
  fontSize: 20,
};

const priorStyle = {
  marginTop: 8,
  color: "#94a3b8",
  fontFamily: "monospace",
  fontSize: 12,
};

const likelihoodListStyle = {
  display: "grid",
  gap: 5,
  marginTop: 11,
};

const likelihoodRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  paddingBottom: 5,
  borderBottom: "1px solid #1e293b",
  color: "#cbd5e1",
  fontSize: 12,
};

const monoStyle = {
  fontFamily: "monospace",
};

const calculationStyle = {
  display: "grid",
  gap: 4,
  marginTop: 11,
  padding: 10,
  borderRadius: 9,
  background: "#111827",
  color: "#cbd5e1",
  fontFamily: "monospace",
  fontSize: 12,
};

const equalsStyle = {
  color: "#64748b",
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
  fontSize: 22,
};