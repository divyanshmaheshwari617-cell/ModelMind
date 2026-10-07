import type { NBLearningStep } from "./learningSteps";

type Props = {
  step: NBLearningStep;
};

export default function NBStepExplanation({
  step,
}: Props) {
  return (
    <section style={containerStyle}>
      <div style={stepStyle}>
        STEP {step.id}
      </div>

      <h2 style={titleStyle}>
        {step.title}
      </h2>

      <div style={questionStyle}>
        {step.question}
      </div>

      <p style={explanationStyle}>
        {step.explanation}
      </p>

      <div style={takeawayStyle}>
        <span>💡</span>

        <div>
          <strong>Remember</strong>

          <div style={takeawayTextStyle}>
            {step.takeaway}
          </div>
        </div>
      </div>
    </section>
  );
}

const containerStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const stepStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const titleStyle = {
  margin: "5px 0 7px",
};

const questionStyle = {
  color: "#38bdf8",
  fontWeight: 800,
  marginBottom: 10,
};

const explanationStyle = {
  color: "#cbd5e1",
  lineHeight: 1.7,
};

const takeawayStyle = {
  display: "flex",
  gap: 10,
  marginTop: 13,
  padding: 12,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #312e81",
};

const takeawayTextStyle = {
  color: "#94a3b8",
  marginTop: 4,
  lineHeight: 1.5,
};