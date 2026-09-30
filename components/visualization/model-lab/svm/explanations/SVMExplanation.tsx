import type {
  LearningLevel,
  SVMTask,
} from "../types/svm";

type Props = {
  level: LearningLevel;
  task: SVMTask;
};

export default function SVMExplanation({
  level,
  task,
}: Props) {
  if (level === "basic") {
    return (
      <section style={sectionStyle}>
        <h2 style={titleStyle}>
          SVM — Basic Understanding
        </h2>

        <p style={paragraphStyle}>
          Support Vector Machine
          learns a boundary from
          important training
          examples called support
          vectors.
        </p>

        {task ===
        "classification" ? (
          <>
            <Concept
              title="1. Hyperplane"
              text="The hyperplane is the decision boundary that separates the classes."
            />

            <Concept
              title="2. Margin"
              text="SVM tries to create a large gap between the decision boundary and the nearest observations."
            />

            <Concept
              title="3. Support Vectors"
              text="The observations closest to the margin are especially important because they influence the position of the boundary."
            />

            <Concept
              title="4. Kernel"
              text="A kernel helps SVM model nonlinear patterns when a simple straight boundary is not enough."
            />
          </>
        ) : (
          <>
            <Concept
              title="1. Regression Function"
              text="SVR learns a function that predicts a continuous numerical target."
            />

            <Concept
              title="2. ε-Tube"
              text="Small prediction errors inside the epsilon tube receive no epsilon-insensitive penalty."
            />

            <Concept
              title="3. Support Vectors"
              text="Important observations near or outside the epsilon tube influence the regression function."
            />

            <Concept
              title="4. C"
              text="C controls how strongly the model penalizes errors outside the epsilon tube."
            />
          </>
        )}
      </section>
    );
  }

  if (level === "medium") {
    return (
      <section style={sectionStyle}>
        <h2 style={titleStyle}>
          SVM — Medium Understanding
        </h2>

        {task ===
        "classification" ? (
          <>
            <Concept
              title="Decision Function"
              text="For a linear classifier, the decision function can be written as wᵀx + b. The sign determines the predicted side of the boundary."
              formula="f(x) = wᵀx + b"
            />

            <Concept
              title="Margin Boundaries"
              text="In the canonical linear formulation, the two margin boundaries are represented by decision-function values +1 and -1."
              formula="wᵀx + b = +1 and wᵀx + b = -1"
            />

            <Concept
              title="Margin Width"
              text="For the canonical scaling, the distance between the two margin boundaries is inversely related to the magnitude of w."
              formula="Margin width = 2 / ||w||"
            />

            <Concept
              title="Soft Margin"
              text="Real datasets may overlap. Soft-margin SVM allows some margin violations while balancing margin size against classification errors."
            />

            <Concept
              title="C Parameter"
              text="Larger C generally places a stronger penalty on violations. Smaller C allows more violations in exchange for stronger regularization."
            />
          </>
        ) : (
          <>
            <Concept
              title="SVR Prediction"
              text="Support Vector Regression predicts a continuous value rather than a class."
              formula="ŷ = f(x)"
            />

            <Concept
              title="Epsilon-Insensitive Loss"
              text="Errors smaller than epsilon do not contribute to epsilon-insensitive loss."
              formula="Lε = max(0, |y - ŷ| - ε)"
            />

            <Concept
              title="C Parameter"
              text="C controls the penalty assigned to deviations beyond the epsilon tube."
            />

            <Concept
              title="Kernel"
              text="Kernel SVR can model nonlinear relationships without explicitly constructing every transformed feature."
            />
          </>
        )}
      </section>
    );
  }

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>
        SVM — Advanced Understanding
      </h2>

      {task ===
      "classification" ? (
        <>
          <Concept
            title="Maximum-Margin Principle"
            text="The linear hard-margin formulation seeks a separating hyperplane with minimum weight norm while satisfying the class constraints."
            formula="min ½||w||²"
          />

          <Concept
            title="Soft-Margin Objective"
            text="Slack variables allow violations. C controls the trade-off between regularization and violation penalties."
            formula="min ½||w||² + C Σ ξᵢ"
          />

          <Concept
            title="Kernel Trick"
            text="A kernel evaluates similarity corresponding to an implicit feature-space transformation, allowing nonlinear decision boundaries."
            formula="K(x,z) = φ(x)ᵀφ(z)"
          />

          <Concept
            title="RBF Kernel"
            text="The RBF kernel gives greater similarity to nearby observations. Gamma controls how quickly similarity decreases with distance."
            formula="K(x,z) = exp(-γ||x-z||²)"
          />

          <Concept
            title="Polynomial Kernel"
            text="Polynomial kernels model interactions of increasing degree between input features."
            formula="K(x,z) = (γxᵀz + 1)^d"
          />

          <Concept
            title="Why Scaling Matters"
            text="SVM depends strongly on distances and dot products. Features with very different scales can dominate the geometry, so standardization is commonly important."
          />
        </>
      ) : (
        <>
          <Concept
            title="SVR Optimization Idea"
            text="SVR combines model regularization with penalties for observations that fall outside the epsilon-insensitive region."
          />

          <Concept
            title="Epsilon"
            text="Epsilon controls the width of the region where prediction errors receive no epsilon-insensitive penalty."
            formula="|y - f(x)| ≤ ε"
          />

          <Concept
            title="Support Vectors"
            text="Training observations associated with active constraints or nonzero dual coefficients determine the learned support-vector solution."
          />

          <Concept
            title="Kernelized SVR"
            text="Kernel functions allow nonlinear regression while expressing predictions through similarities with training observations."
          />

          <Concept
            title="Bias–Complexity Trade-off"
            text="C, epsilon, gamma, kernel choice, and polynomial degree can substantially change model flexibility and generalization."
          />
        </>
      )}
    </section>
  );
}

function Concept({
  title,
  text,
  formula,
}: {
  title: string;
  text: string;
  formula?: string;
}) {
  return (
    <div style={conceptStyle}>
      <h3
        style={{
          margin:
            "0 0 8px",
          fontSize: 17,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          ...paragraphStyle,
          margin: 0,
        }}
      >
        {text}
      </p>

      {formula && (
        <div style={formulaStyle}>
          {formula}
        </div>
      )}
    </div>
  );
}

const sectionStyle = {
  border:
    "1px solid #334155",
  borderRadius: 18,
  padding: 22,
  background: "#0f172a",
};

const titleStyle = {
  marginTop: 0,
  marginBottom: 14,
};

const paragraphStyle = {
  color: "#94a3b8",
  lineHeight: 1.7,
};

const conceptStyle = {
  marginTop: 12,
  padding: 16,
  borderRadius: 12,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const formulaStyle = {
  marginTop: 12,
  padding: 12,
  borderRadius: 9,
  background: "#0f172a",
  color: "#c4b5fd",
  fontFamily: "monospace",
};