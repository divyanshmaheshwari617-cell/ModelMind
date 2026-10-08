import {
  useSVM,
} from "../context/SVMContext";

import SVMLearningVisual
  from "../SVMLearningVisual";

export default function SupportVectorExplorer() {
  const { state } = useSVM();

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy">
        <span>
          CRITICAL TRAINING POINTS
        </span>

        <h3>
          Support Vector Explorer
        </h3>

        <p>
          The observations nearest the
          separating region are the
          points that matter most for
          defining an SVM boundary.
        </p>

        <div className="concept-box">
          <strong>
            Support vectors define the
            margin.
          </strong>

          <small>
            Large rings identify the
            educational support-vector
            candidates.
          </small>
        </div>
      </div>

      <SVMLearningVisual
        rows={
          state.dataset?.rows ??
          []
        }
        mode="support"
      />
    </article>
  );
}