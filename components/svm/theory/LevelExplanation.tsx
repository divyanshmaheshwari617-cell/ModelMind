import {
  useSVM,
} from "../context/SVMContext";

export default function LevelExplanation() {
  const { state } = useSVM();

  if (state.level === "basic") {
    return (
      <Explanation
        level="Basic"
        title="Think of SVM as finding the safest road between groups."
        points={[
          "The decision boundary separates different classes.",
          "The margin is the empty safety region around that boundary.",
          "Support vectors are the important points closest to the margin.",
          "C controls how strongly SVM reacts to mistakes.",
          "A kernel helps when a straight line cannot separate the data.",
        ]}
      />
    );
  }

  if (
    state.level ===
    "intermediate"
  ) {
    return (
      <Explanation
        level="Intermediate"
        title="Understand the geometry and hyperparameters."
        points={[
          "SVM maximizes the geometric margin between classes.",
          "Support vectors determine the position of the decision boundary.",
          "Soft-margin SVM introduces slack variables for violations.",
          "C trades margin width against the penalty for violations.",
          "Gamma controls the locality of RBF-style kernel influence.",
          "Feature scaling is important because distance and dot products affect the model.",
        ]}
      />
    );
  }

  return (
    <Explanation
      level="Advanced"
      title="Connect primal optimization, kernels and generalization."
      points={[
        "The primal objective regularizes the norm of the weight vector while penalizing violations.",
        "The dual formulation expresses the solution through training examples and Lagrange multipliers.",
        "Only observations with non-zero relevant dual coefficients become support vectors.",
        "Kernel functions replace explicit inner products in transformed feature spaces.",
        "C and gamma jointly influence bias, variance and decision-boundary complexity.",
        "Evaluation must use held-out data or cross-validation rather than training performance alone.",
      ]}
    />
  );
}

function Explanation({
  level,
  title,
  points,
}: {
  level: string;
  title: string;
  points: string[];
}) {
  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-heading">
        <span>
          {level.toUpperCase()} MODE
        </span>

        <h3>{title}</h3>
      </div>

      <div className="explanation-list">
        {points.map(
          (point, index) => (
            <div
              key={point}
              className="explanation-item"
            >
              <strong>
                {index + 1}
              </strong>

              <p>{point}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}