import {
  useSVM,
} from "../context/SVMContext";

import SVMLearningVisual
  from "../SVMLearningVisual";

export default function EpsilonVisualizer() {
  const {
    state,
    updateParameters,
  } = useSVM();

  const epsilon =
    state.parameters.epsilon;

  if (
    state.task !==
    "regression"
  ) {
    return (
      <article className="learning-lab-panel">
        <div className="lab-copy">
          <span>SVR LAB</span>

          <h3>
            Epsilon Visualizer
          </h3>

          <p>
            Switch the main lab to
            <strong>
              {" "}SVR Regression{" "}
            </strong>
            to explore the
            epsilon-insensitive tube.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy">
        <span>
          EPSILON-INSENSITIVE LOSS
        </span>

        <h3>
          SVR Epsilon Visualizer
        </h3>

        <p>
          Errors inside the epsilon
          tube are ignored by the
          epsilon-insensitive loss.
        </p>

        <label className="interactive-control">
          <div>
            <strong>
              Epsilon
            </strong>

            <output>
              {epsilon.toFixed(2)}
            </output>
          </div>

          <input
            type="range"
            min="0.01"
            max="3"
            step="0.01"
            value={epsilon}
            onChange={(event) =>
              updateParameters({
                epsilon: Number(
                  event.target.value
                ),
              })
            }
          />
        </label>

        <div className="concept-box">
          <strong>
            |y - f(x)| ≤ ε
          </strong>

          <small>
            Points outside the tube
            receive a visible ring.
          </small>
        </div>
      </div>

      <SVMLearningVisual
        rows={
          state.dataset?.rows ??
          []
        }
        mode="epsilon"
        epsilon={epsilon}
      />
    </article>
  );
}