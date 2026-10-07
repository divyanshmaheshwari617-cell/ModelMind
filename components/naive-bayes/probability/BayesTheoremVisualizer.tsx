type Props = {
  step: number;
};

export default function BayesTheoremVisualizer({
  step,
}: Props) {
  if (step < 4) {
    return null;
  }

  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>
        BAYES THEOREM
      </div>

      <h3 style={titleStyle}>
        Updating a belief using evidence
      </h3>

      <p style={textStyle}>
        Suppose we want to know whether a new student
        will <strong>Pass</strong>. We begin with the
        probability of Pass and then update that belief
        using information about the student.
      </p>

      {step >= 4 && (
        <Concept
          number="1"
          title="Conditional Probability"
          formula="P(A | B)"
          description="The probability of A when we already know B."
          example="Example: P(High Attendance | Pass)"
        />
      )}

      {step >= 5 && (
        <Concept
          number="2"
          title="Likelihood"
          formula="P(Evidence | Class)"
          description="How compatible is the observed evidence with a particular class?"
          example="Example: P(Attendance = 82 | Pass)"
        />
      )}

      {step >= 6 && (
        <>
          <div style={formulaBoxStyle}>
            <div style={formulaTitleStyle}>
              Bayes' Theorem
            </div>

            <div style={bigFormulaStyle}>
              P(Class | Evidence)
            </div>

            <div style={equalsStyle}>
              =
            </div>

            <div style={fractionStyle}>
              <div style={numeratorStyle}>
                P(Evidence | Class) × P(Class)
              </div>

              <div style={denominatorStyle}>
                P(Evidence)
              </div>
            </div>
          </div>

          <div style={translationStyle}>
            <FlowBox
              title="Prior"
              text="What we believed before seeing the new student's features."
            />

            <Arrow />

            <FlowBox
              title="Likelihood"
              text="How well the student's observed features match the class."
            />

            <Arrow />

            <FlowBox
              title="Posterior"
              text="Our updated belief after considering the evidence."
            />
          </div>
        </>
      )}

      {step >= 7 && (
        <div style={naiveStyle}>
          <strong>
            Where does “Naive” enter?
          </strong>

          <div style={{ marginTop: 7 }}>
            Instead of modelling all features jointly,
            Naive Bayes assumes that the features are
            conditionally independent given the class.
          </div>

          <div style={naiveFormulaStyle}>
            P(x₁, x₂, x₃ | C)
            <br />
            ≈
            <br />
            P(x₁ | C) × P(x₂ | C) × P(x₃ | C)
          </div>
        </div>
      )}
    </section>
  );
}

function Concept({
  number,
  title,
  formula,
  description,
  example,
}: {
  number: string;
  title: string;
  formula: string;
  description: string;
  example: string;
}) {
  return (
    <div style={conceptStyle}>
      <div style={numberStyle}>
        {number}
      </div>

      <div>
        <strong>{title}</strong>

        <div style={conceptFormulaStyle}>
          {formula}
        </div>

        <div style={smallTextStyle}>
          {description}
        </div>

        <div style={exampleStyle}>
          {example}
        </div>
      </div>
    </div>
  );
}

function FlowBox({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={flowBoxStyle}>
      <strong>{title}</strong>

      <div style={smallTextStyle}>
        {text}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div style={arrowStyle}>
      →
    </div>
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

const textStyle = {
  color: "#94a3b8",
  lineHeight: 1.7,
};

const conceptStyle = {
  display: "flex",
  gap: 12,
  marginTop: 11,
  padding: 13,
  borderRadius: 11,
  background: "#020617",
  border: "1px solid #1e293b",
};

const numberStyle = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  background: "#7c3aed",
  color: "white",
  fontWeight: 900,
};

const conceptFormulaStyle = {
  marginTop: 6,
  color: "#c4b5fd",
  fontFamily: "monospace",
  fontSize: 16,
};

const smallTextStyle = {
  marginTop: 5,
  color: "#94a3b8",
  lineHeight: 1.5,
  fontSize: 13,
};

const exampleStyle = {
  marginTop: 6,
  color: "#38bdf8",
  fontSize: 13,
};

const formulaBoxStyle = {
  marginTop: 16,
  padding: 18,
  textAlign: "center" as const,
  borderRadius: 13,
  background: "#020617",
  border: "1px solid #4c1d95",
};

const formulaTitleStyle = {
  color: "#a78bfa",
  fontWeight: 900,
};

const bigFormulaStyle = {
  marginTop: 12,
  fontSize: 19,
  fontFamily: "monospace",
};

const equalsStyle = {
  margin: "7px 0",
  color: "#94a3b8",
};

const fractionStyle = {
  display: "inline-block",
  fontFamily: "monospace",
};

const numeratorStyle = {
  padding: "0 8px 7px",
  borderBottom: "2px solid #64748b",
};

const denominatorStyle = {
  paddingTop: 7,
};

const translationStyle = {
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
  gap: 8,
  flexWrap: "wrap" as const,
  marginTop: 14,
};

const flowBoxStyle = {
  flex: "1 1 180px",
  padding: 12,
  borderRadius: 10,
  background: "#172554",
  border: "1px solid #1d4ed8",
};

const arrowStyle = {
  display: "grid",
  placeItems: "center",
  fontSize: 24,
  color: "#a78bfa",
};

const naiveStyle = {
  marginTop: 14,
  padding: 14,
  borderRadius: 11,
  background: "#422006",
  border: "1px solid #a16207",
  color: "#fde68a",
  lineHeight: 1.6,
};

const naiveFormulaStyle = {
  marginTop: 10,
  padding: 10,
  textAlign: "center" as const,
  borderRadius: 8,
  background: "#020617",
  color: "#f8fafc",
  fontFamily: "monospace",
};