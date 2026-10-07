import type { BernoulliNBModel } from "../types/naiveBayes";

type Props = {
  model: BernoulliNBModel;
};

export default function BernoulliLikelihoodVisualizer({
  model,
}: Props) {
  return (
    <section style={card}>
      <div style={eyebrow}>STEP 2 · BERNOULLI LIKELIHOOD</div>

      <h3 style={title}>Presence and absence both contain information</h3>

      <p style={description}>
        If a feature is present, the model uses P(feature | class).
        If it is absent, it uses 1 − P(feature | class).
      </p>

      <div style={formulaGrid}>
        <div style={formula}>
          <div style={formulaTitle}>When x = 1</div>
          <strong>P(x | C) = p</strong>
          <span>Use the learned presence probability.</span>
        </div>

        <div style={formula}>
          <div style={formulaTitle}>When x = 0</div>
          <strong>P(x | C) = 1 − p</strong>
          <span>Use the learned absence probability.</span>
        </div>
      </div>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Class</th>
              <th style={th}>Feature</th>
              <th style={th}>P(Present)</th>
              <th style={th}>P(Absent)</th>
            </tr>
          </thead>

          <tbody>
            {model.classes.flatMap((classLabel) =>
              model.features.map((feature) => {
                const p =
                  model.featureProbabilities[classLabel]?.[feature] ?? 0;

                return (
                  <tr key={`${classLabel}-${feature}`}>
                    <td style={td}>
                      <strong>{classLabel}</strong>
                    </td>

                    <td style={td}>{feature}</td>

                    <td style={td}>
                      <strong style={green}>{p.toFixed(4)}</strong>
                    </td>

                    <td style={td}>
                      <strong style={purple}>
                        {(1 - p).toFixed(4)}
                      </strong>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={smoothing}>
        Laplace smoothing α = <strong>{model.alpha}</strong>. It helps
        prevent extreme zero/one probabilities when training data is
        small.
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
  color: "#fbbf24",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = { margin: "5px 0 8px" };

const description = {
  color: "#94a3b8",
  lineHeight: 1.65,
};

const formulaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const formula = {
  display: "grid",
  gap: 6,
  padding: 14,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #334155",
  color: "#cbd5e1",
  fontFamily: "monospace",
};

const formulaTitle = {
  color: "#a78bfa",
  fontFamily: "sans-serif",
  fontWeight: 900,
};

const tableWrapper = {
  overflowX: "auto" as const,
  marginTop: 14,
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const th = {
  padding: 10,
  textAlign: "left" as const,
  borderBottom: "1px solid #334155",
  color: "#94a3b8",
  fontSize: 11,
};

const td = {
  padding: 10,
  borderBottom: "1px solid #1e293b",
  color: "#cbd5e1",
  fontSize: 12,
};

const green = { color: "#34d399" };
const purple = { color: "#c4b5fd" };

const smoothing = {
  marginTop: 13,
  padding: 11,
  borderRadius: 9,
  background: "#422006",
  color: "#fde68a",
};