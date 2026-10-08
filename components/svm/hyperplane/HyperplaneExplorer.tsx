import {
  useSVM,
} from "../context/SVMContext";

import SVMLearningVisual
  from "../SVMLearningVisual";

export default function HyperplaneExplorer() {
  const { state } = useSVM();

  const rows =
    state.dataset?.rows ?? [];

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy">
        <span>DECISION GEOMETRY</span>

        <h3>
          Hyperplane Explorer
        </h3>

        <p>
          SVM searches for a separating
          hyperplane. In two dimensions
          this hyperplane appears as a
          line.
        </p>

        <div className="concept-box">
          <strong>
            wᵀx + b = 0
          </strong>

          <small>
            The educational separator
            below is derived from the
            class geometry. The real SVC
            experiment will later use
            the trained model.
          </small>
        </div>
      </div>

      <SVMLearningVisual
        rows={rows}
        mode="hyperplane"
      />
    </article>
  );
}