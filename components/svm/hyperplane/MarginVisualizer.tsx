import {
  useSVM,
} from "../context/SVMContext";

import SVMLearningVisual
  from "../SVMLearningVisual";

export default function MarginVisualizer() {
  const { state } = useSVM();

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy">
        <span>MAXIMUM MARGIN</span>

        <h3>
          Margin Visualizer
        </h3>

        <p>
          SVM does not only search for a
          separating boundary. It tries
          to create a large safety gap
          between classes.
        </p>

        <div className="concept-box">
          <strong>
            Margin ∝ 2 / ‖w‖
          </strong>

          <small>
            The dashed lines represent
            the two sides of the
            educational margin.
          </small>
        </div>
      </div>

      <SVMLearningVisual
        rows={
          state.dataset?.rows ??
          []
        }
        mode="margin"
      />
    </article>
  );
}