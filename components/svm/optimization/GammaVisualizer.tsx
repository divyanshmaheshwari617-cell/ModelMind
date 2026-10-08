import {
  useSVM,
} from "../context/SVMContext";

import SVMLearningVisual
  from "../SVMLearningVisual";

export default function GammaVisualizer() {
  const {
    state,
    updateParameters,
  } = useSVM();

  const gamma =
    state.parameters.gamma;

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy">
        <span>
          KERNEL INFLUENCE
        </span>

        <h3>
          Gamma Visualizer
        </h3>

        <p>
          Gamma determines how local
          the influence of individual
          observations becomes for
          kernels such as RBF.
        </p>

        <label className="interactive-control">
          <div>
            <strong>
              Gamma
            </strong>

            <output>
              {gamma.toFixed(2)}
            </output>
          </div>

          <input
            type="range"
            min="0.01"
            max="5"
            step="0.01"
            value={gamma}
            onChange={(event) =>
              updateParameters({
                gamma: Number(
                  event.target.value
                ),
              })
            }
          />
        </label>

        <div className="concept-box">
          <strong>
            exp(-γ‖x-z‖²)
          </strong>

          <small>
            Increase gamma and the
            illustrated influence
            region becomes more local.
          </small>
        </div>
      </div>

      <SVMLearningVisual
        rows={
          state.dataset?.rows ??
          []
        }
        mode="gamma"
        gamma={gamma}
      />
    </article>
  );
}