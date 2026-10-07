import type { BernoulliNBModel } from "../types/naiveBayes";

type Props = {
  model: BernoulliNBModel;
};

const COLORS = ["#f472b6", "#38bdf8", "#fbbf24", "#34d399"];

export default function BernoulliPresenceVisualizer({
  model,
}: Props) {
  return (
    <section style={card}>
      <div style={eyebrow}>STEP 1 · PRESENCE / ABSENCE</div>

      <h3 style={title}>Bernoulli features have only two states</h3>

      <p style={description}>
        Unlike Multinomial Naive Bayes, Bernoulli Naive Bayes does not
        care how many times a word occurs. It asks whether the feature
        is present or absent.
      </p>

      <div style={example}>
        <span style={present}>1 = Present</span>
        <span style={absent}>0 = Absent</span>
      </div>

      <div style={grid}>
        {model.classes.map((classLabel, classIndex) => (
          <div key={classLabel} style={classCard}>
            <div style={classHeader}>
              <div>
                <strong
                  style={{
                    ...className,
                    color: COLORS[classIndex % COLORS.length],
                  }}
                >
                  {classLabel}
                </strong>

                <div style={prior}>
                  Prior ={" "}
                  {((model.priors[classLabel] ?? 0) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={featureList}>
              {model.features.map((feature) => {
                const probability =
                  model.featureProbabilities[classLabel]?.[feature] ?? 0;

                return (
                  <div key={feature} style={featureBox}>
                    <div style={featureHeader}>
                      <strong>{feature}</strong>

                      <span style={probabilityText}>
                        {(probability * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div style={track}>
                      <div
                        style={{
                          ...fill,
                          width: `${probability * 100}%`,
                          background:
                            COLORS[classIndex % COLORS.length],
                        }}
                      />
                    </div>

                    <div style={meaning}>
                      P({feature} = 1 | {classLabel})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={lesson}>
        <strong>Key idea:</strong> each probability tells us how likely
        that feature is to be present when the email belongs to the
        given class.
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
  color: "#38bdf8",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const title = { margin: "5px 0 8px" };

const description = {
  color: "#94a3b8",
  lineHeight: 1.65,
};

const example = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  marginTop: 13,
};

const present = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "#052e16",
  color: "#86efac",
  fontWeight: 800,
};

const absent = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "#3f3f46",
  color: "#e4e4e7",
  fontWeight: 800,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 12,
  marginTop: 14,
};

const classCard = {
  padding: 15,
  borderRadius: 13,
  background: "#020617",
  border: "1px solid #1e293b",
};

const classHeader = {
  display: "flex",
  justifyContent: "space-between",
};

const className = {
  fontSize: 20,
  fontWeight: 900,
};

const prior = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
};

const featureList = {
  display: "grid",
  gap: 12,
  marginTop: 15,
};

const featureBox = {
  padding: 9,
  borderRadius: 9,
  background: "#111827",
};

const featureHeader = {
  display: "flex",
  justifyContent: "space-between",
  color: "#cbd5e1",
  fontSize: 12,
};

const probabilityText = {
  color: "#a7f3d0",
  fontWeight: 800,
};

const track = {
  height: 9,
  marginTop: 7,
  borderRadius: 999,
  background: "#1e293b",
  overflow: "hidden",
};

const fill = {
  height: "100%",
  borderRadius: 999,
  transition: "width 200ms ease",
};

const meaning = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 10,
  fontFamily: "monospace",
};

const lesson = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  background: "#082f49",
  color: "#bae6fd",
  lineHeight: 1.6,
};