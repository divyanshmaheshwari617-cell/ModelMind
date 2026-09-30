import type {
  SVMVisualStep,
} from "./learningSteps";

type Props = {
  step: SVMVisualStep;
};

export default function SVMStepExplanation({
  step,
}: Props) {
  return (
    <section style={sectionStyle}>
      <div style={stepNumberStyle}>
        STEP{" "}
        {String(step.id).padStart(
          2,
          "0"
        )}
      </div>

      <h2 style={titleStyle}>
        {step.title}
      </h2>

      <p style={explanationStyle}>
        {step.explanation}
      </p>

      <div style={focusStyle}>
        <div style={focusLabelStyle}>
          LOOK AT THIS
        </div>

        <div>
          {step.focus}
        </div>
      </div>

      {step.formula && (
        <div style={formulaStyle}>
          {step.formula}
        </div>
      )}
    </section>
  );
}

const sectionStyle = {
  padding: 22,
  borderRadius: 18,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const stepNumberStyle = {
  color: "#a78bfa",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.5,
};

const titleStyle = {
  margin:
    "8px 0 12px",
  fontSize: 25,
};

const explanationStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.75,
  fontSize: 16,
};

const focusStyle = {
  marginTop: 18,
  padding: 15,
  borderRadius: 12,
  background: "#020617",
  border:
    "1px solid #1e293b",
  color: "#e2e8f0",
  lineHeight: 1.6,
};

const focusLabelStyle = {
  marginBottom: 6,
  color: "#22c55e",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const formulaStyle = {
  marginTop: 16,
  padding: 14,
  borderRadius: 12,
  background: "#1e1b4b",
  color: "#ddd6fe",
  fontFamily: "monospace",
  textAlign:
    "center" as const,
  fontSize: 17,
};