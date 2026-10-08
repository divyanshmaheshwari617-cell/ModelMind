import {
  useSVM,
} from "../context/SVMContext";

import SVMLearningVisual
  from "../SVMLearningVisual";

export default function CVisualizer() {
  const {
    state,
    updateParameters,
  } = useSVM();

  const C =
    state.parameters.C;

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy">
        <span>
          REGULARIZATION
        </span>

        <h3>
          C Parameter Visualizer
        </h3>

        <p>
          C controls the trade-off
          between a wider margin and
          penalizing training
          violations.
        </p>

        <label className="interactive-control">
          <div>
            <strong>C</strong>

            <output>
              {C.toFixed(2)}
            </output>
          </div>

          <input
            type="range"
            min="0.05"
            max="20"
            step="0.05"
            value={C}
            onChange={(event) =>
              updateParameters({
                C: Number(
                  event.target.value
                ),
              })
            }
          />
        </label>

        <div className="concept-box">
          <strong>
            {C < 1
              ? "Lower C → stronger regularization"
              : C > 5
                ? "Higher C → stronger penalty for violations"
                : "Moderate C → balanced trade-off"}
          </strong>

          <small>
            This panel illustrates the
            concept. Batch 2 will show
            the result from an actual
            trained SVC.
          </small>
        </div>
      </div>

      <SVMLearningVisual
        rows={
          state.dataset?.rows ??
          []
        }
        mode="c"
        C={C}
      />
    </article>
  );
}