import {
  useSVM,
} from "../context/SVMContext";

export default function SVMMathMode() {
  const { state } = useSVM();

  const isClassification =
    state.task === "classification";

  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-heading">
        <span>MATHEMATICAL FOUNDATION</span>

        <h3>
          {isClassification
            ? "SVC Mathematics"
            : "SVR Mathematics"}
        </h3>

        <p>
          Connect the visual intuition
          with the equations used by
          Support Vector Machines.
        </p>
      </div>

      <div className="math-grid">
        <MathCard
          title="Decision Function"
          formula="f(x) = wᵀx + b"
          explanation={
            isClassification
              ? "The sign of f(x) determines which side of the separating hyperplane a point lies on."
              : "The function estimates the continuous target value."
          }
        />

        <MathCard
          title="Hyperplane"
          formula="wᵀx + b = 0"
          explanation="This equation describes the central separating hyperplane. The weight vector w controls its orientation."
        />

        <MathCard
          title="Geometric Margin"
          formula="Margin = 2 / ||w||"
          explanation="SVM searches for a boundary with a large margin. Maximizing the margin is equivalent to minimizing the magnitude of w."
        />

        {isClassification ? (
          <>
            <MathCard
              title="Classification Constraint"
              formula="yᵢ(wᵀxᵢ + b) ≥ 1"
              explanation="For a perfectly separable hard-margin problem, every training point must remain on the correct side of its margin."
            />

            <MathCard
              title="Soft Margin Objective"
              formula="½||w||² + C Σ ξᵢ"
              explanation="Slack variables ξ allow margin violations. C controls the trade-off between a wider margin and penalizing violations."
            />

            <MathCard
              title="Hinge Loss"
              formula="max(0, 1 − y f(x))"
              explanation="Correct and confidently classified observations have zero hinge loss. Points near or across the margin receive a penalty."
            />
          </>
        ) : (
          <>
            <MathCard
              title="Epsilon Tube"
              formula="|y − f(x)| ≤ ε"
              explanation="Errors inside the epsilon tube are ignored by epsilon-SVR."
            />

            <MathCard
              title="SVR Loss"
              formula="max(0, |y − f(x)| − ε)"
              explanation="Only residuals extending beyond the epsilon tube contribute to epsilon-insensitive loss."
            />

            <MathCard
              title="SVR Objective"
              formula="½||w||² + C Σ(ξᵢ + ξᵢ*)"
              explanation="SVR balances model flatness against errors outside the epsilon tube."
            />
          </>
        )}

        <MathCard
          title="Kernel Trick"
          formula="K(x,z) = φ(x)ᵀφ(z)"
          explanation="A kernel computes similarity as though observations had been transformed into another feature space, without always constructing that space explicitly."
        />

        <MathCard
          title="RBF Kernel"
          formula="K(x,z) = exp(−γ||x−z||²)"
          explanation="Gamma controls how quickly similarity decreases with distance. Larger gamma creates more local influence."
        />

        <MathCard
          title="Polynomial Kernel"
          formula="K(x,z) = (γxᵀz + r)ᵈ"
          explanation="The degree controls polynomial complexity while r corresponds to coef0."
        />
      </div>
    </div>
  );
}

function MathCard({
  title,
  formula,
  explanation,
}: {
  title: string;
  formula: string;
  explanation: string;
}) {
  return (
    <article className="math-card">
      <span>{title}</span>

      <strong>{formula}</strong>

      <p>{explanation}</p>
    </article>
  );
}