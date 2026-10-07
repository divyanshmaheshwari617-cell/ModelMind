import type { MultinomialNBModel } from "../types/naiveBayes";

type Props = {
  model: MultinomialNBModel;
};

export default function LaplaceSmoothingVisualizer({
  model,
}: Props) {
  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>STEP 2 · LAPLACE SMOOTHING</div>

      <h3 style={titleStyle}>
        What happens when a word was never seen?
      </h3>

      <p style={descriptionStyle}>
        A zero probability would make the complete Naive Bayes product
        zero. Laplace smoothing prevents this by adding α to every word
        count.
      </p>

      <div style={formulaStyle}>
        <span>P(word | class)</span>

        <strong>=</strong>

        <div style={fractionStyle}>
          <span>word count + α</span>
          <div style={fractionLineStyle} />
          <span>
            total class word count + α × vocabulary size
          </span>
        </div>
      </div>

      <div style={alphaBoxStyle}>
        Current α = <strong>{model.alpha}</strong>
        <span style={alphaExplanationStyle}>
          {" "}
          · vocabulary size = {model.features.length}
        </span>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Class</th>
              <th style={thStyle}>Word</th>
              <th style={thStyle}>Raw Count</th>
              <th style={thStyle}>+ α</th>
              <th style={thStyle}>Denominator</th>
              <th style={thStyle}>Smoothed Likelihood</th>
            </tr>
          </thead>

          <tbody>
            {model.classes.flatMap((classLabel) => {
              const total =
                model.classFeatureTotals[classLabel] ?? 0;

              const denominator =
                total + model.alpha * model.features.length;

              return model.features.map((feature) => {
                const count =
                  model.featureCounts[classLabel]?.[feature] ?? 0;

                const numerator = count + model.alpha;

                const probability =
                  denominator > 0
                    ? numerator / denominator
                    : 0;

                return (
                  <tr key={`${classLabel}-${feature}`}>
                    <td style={tdStyle}>
                      <strong>{classLabel}</strong>
                    </td>

                    <td style={tdStyle}>{feature}</td>

                    <td style={tdStyle}>{count}</td>

                    <td style={tdStyle}>
                      {count} + {model.alpha} ={" "}
                      <strong>{numerator}</strong>
                    </td>

                    <td style={tdStyle}>
                      {total} + {model.alpha} ×{" "}
                      {model.features.length} ={" "}
                      <strong>{denominator}</strong>
                    </td>

                    <td style={tdStyle}>
                      <strong style={probabilityStyle}>
                        {probability.toFixed(4)}
                      </strong>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      <div style={warningStyle}>
        Without smoothing, an unseen word could have probability 0.
        With Laplace smoothing, it receives a small non-zero
        probability instead.
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
  color: "#fbbf24",
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

const formulaStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 15,
  marginTop: 16,
  padding: 18,
  borderRadius: 12,
  background: "#020617",
  color: "#f8fafc",
  fontFamily: "monospace",
};

const fractionStyle = {
  display: "grid",
  textAlign: "center" as const,
  gap: 5,
};

const fractionLineStyle = {
  height: 1,
  background: "#f8fafc",
};

const alphaBoxStyle = {
  marginTop: 12,
  padding: 10,
  borderRadius: 9,
  background: "#422006",
  color: "#fde68a",
};

const alphaExplanationStyle = {
  color: "#fcd34d",
};

const tableWrapperStyle = {
  overflowX: "auto" as const,
  marginTop: 14,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  minWidth: 760,
};

const thStyle = {
  padding: 10,
  textAlign: "left" as const,
  borderBottom: "1px solid #334155",
  color: "#94a3b8",
  fontSize: 11,
};

const tdStyle = {
  padding: 10,
  borderBottom: "1px solid #1e293b",
  color: "#cbd5e1",
  fontSize: 12,
};

const probabilityStyle = {
  color: "#34d399",
};

const warningStyle = {
  marginTop: 13,
  padding: 12,
  borderRadius: 10,
  background: "#052e16",
  border: "1px solid #166534",
  color: "#bbf7d0",
  lineHeight: 1.6,
};