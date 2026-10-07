import type { MultinomialNBModel } from "../types/naiveBayes";

type Props = {
  model: MultinomialNBModel;
};

const COLORS = ["#f472b6", "#38bdf8", "#fbbf24", "#34d399"];

export default function MultinomialWordCountVisualizer({
  model,
}: Props) {
  const maximum = Math.max(
    1,
    ...model.classes.flatMap((classLabel) =>
      model.features.map(
        (feature) =>
          model.featureCounts[classLabel]?.[feature] ?? 0
      )
    )
  );

  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>STEP 1 · WORD COUNTS</div>

      <h3 style={titleStyle}>
        What did the model learn from the emails?
      </h3>

      <p style={descriptionStyle}>
        Multinomial Naive Bayes does not ask only whether a word exists.
        It learns how many times each word occurs inside each class.
      </p>

      <div style={classGridStyle}>
        {model.classes.map((classLabel, classIndex) => (
          <div key={classLabel} style={classCardStyle}>
            <div style={classHeaderStyle}>
              <div>
                <div
                  style={{
                    ...classNameStyle,
                    color: COLORS[classIndex % COLORS.length],
                  }}
                >
                  {classLabel}
                </div>

                <div style={smallStyle}>
                  Prior ={" "}
                  {(
                    (model.priors[classLabel] ?? 0) * 100
                  ).toFixed(1)}
                  %
                </div>
              </div>

              <div style={totalBadgeStyle}>
                Total words:{" "}
                {model.classFeatureTotals[classLabel] ?? 0}
              </div>
            </div>

            <div style={barsStyle}>
              {model.features.map((feature) => {
                const count =
                  model.featureCounts[classLabel]?.[feature] ?? 0;

                const width = (count / maximum) * 100;

                return (
                  <div key={feature}>
                    <div style={barLabelStyle}>
                      <span>{feature}</span>
                      <strong>{count}</strong>
                    </div>

                    <div style={trackStyle}>
                      <div
                        style={{
                          ...fillStyle,
                          width: `${width}%`,
                          background:
                            COLORS[classIndex % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={lessonStyle}>
        <strong>How to read this:</strong>{" "}
        a larger bar means that word appeared more often in training
        emails belonging to that class.
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
  lineHeight: 1.65,
};

const classGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 12,
  marginTop: 14,
};

const classCardStyle = {
  padding: 15,
  borderRadius: 13,
  background: "#020617",
  border: "1px solid #1e293b",
};

const classHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
};

const classNameStyle = {
  fontSize: 20,
  fontWeight: 900,
};

const smallStyle = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
};

const totalBadgeStyle = {
  padding: "5px 9px",
  borderRadius: 999,
  background: "#172554",
  color: "#bfdbfe",
  fontSize: 11,
  fontWeight: 800,
};

const barsStyle = {
  display: "grid",
  gap: 11,
  marginTop: 16,
};

const barLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#cbd5e1",
  fontSize: 12,
  marginBottom: 5,
};

const trackStyle = {
  height: 11,
  borderRadius: 999,
  background: "#1e293b",
  overflow: "hidden",
};

const fillStyle = {
  height: "100%",
  borderRadius: 999,
  minWidth: 2,
  transition: "width 250ms ease",
};

const lessonStyle = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  background: "#082f49",
  border: "1px solid #0e7490",
  color: "#bae6fd",
  lineHeight: 1.6,
};