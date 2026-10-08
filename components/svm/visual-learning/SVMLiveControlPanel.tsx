import { useMemo } from "react";

import { useSVM } from "../context/SVMContext";
import {
  getKernelDefinition,
  kernelDefinitions,
} from "../kernels/kernelMath";

import type {
  SVMKernel,
} from "../types/svm";

type Props = {
  step: number;
  viewMode: "2d" | "3d";
};

function parameterEffect(
  task: "classification" | "regression",
  kernel: SVMKernel,
  step: number
) {
  if (task === "classification") {
    if (step <= 2) {
      return "Explore the raw observations first. Parameters become important as the separator, margin and kernel model are introduced.";
    }

    if (step === 3) {
      return "The model is searching among possible separating hyperplanes.";
    }

    if (step >= 4 && step <= 6) {
      return "C controls the soft-margin trade-off. Support vectors are the influential observations closest to the decision region.";
    }

    if (step === 7) {
      return "Change C now. Lower C gives more violation tolerance; higher C makes the educational margin view stricter.";
    }

    if (step === 8) {
      return `${kernel.toUpperCase()} controls how observations are compared. Applicable kernel parameters immediately change the similarity relationships.`;
    }

    if (step === 9) {
      return "This step exposes an educational kernel representation. Change kernel, gamma, degree or coef0 where applicable and watch the transformation move.";
    }

    if (step === 10) {
      return "The final educational classifier combines the selected kernel representation with a separating surface.";
    }

    return "Move the query point to inspect its decision score and predicted class.";
  }

  if (step <= 4) {
    return "SVR begins by learning the continuous relationship between features and the numeric target.";
  }

  if (step >= 5 && step <= 7) {
    return "Epsilon controls the width of the epsilon-insensitive tube and therefore which observations become influential.";
  }

  if (step === 8) {
    return "C controls how strongly the educational regression model reacts to errors outside the epsilon tube.";
  }

  if (step === 9) {
    return "Change the selected kernel and its applicable parameters to change the feature-only kernel representation.";
  }

  if (step === 10) {
    return "C, epsilon and the selected kernel now affect the final educational regression visualization.";
  }

  return "Move the query point to generate a continuous SVR prediction.";
}

export default function SVMLiveControlPanel({
  step,
  viewMode,
}: Props) {
  const {
    state,
    updateParameters,
  } = useSVM();

  const definition =
    useMemo(
      () =>
        getKernelDefinition(
          state.parameters.kernel
        ),
      [state.parameters.kernel]
    );

  const dataset =
    state.dataset;

  const taskLabel =
    state.task === "classification"
      ? "SVC"
      : "SVR";

  const kernel =
    state.parameters.kernel;

  const isPolynomial =
    kernel === "polynomial";

  const usesGamma =
    definition.requiresGamma;

  const usesDegree =
    isPolynomial;

  const usesCoef0 =
    kernel === "polynomial" ||
    kernel === "sigmoid";

  const effect =
    parameterEffect(
      state.task,
      kernel,
      step
    );

  return (
    <aside className="svm-live-control-panel">
      <div className="live-control-heading">
        <span>
          LIVE MODEL CONTROLS
        </span>

        <h3>
          Tune the visualization
        </h3>

        <p>
          Change an applicable parameter
          and the current SVM visual updates
          immediately.
        </p>
      </div>

      <div className="live-status-grid">
        <div>
          <span>Task</span>
          <strong>{taskLabel}</strong>
        </div>

        <div>
          <span>View</span>
          <strong>
            {viewMode.toUpperCase()}
          </strong>
        </div>

        <div>
          <span>Step</span>
          <strong>
            {step}/11
          </strong>
        </div>

        <div>
          <span>Source</span>
          <strong>
            {dataset?.source ===
            "uploaded"
              ? "CSV"
              : "Showcase"}
          </strong>
        </div>
      </div>

      <div className="live-feature-card">
        <span>
          ACTIVE FEATURES
        </span>

        <strong>
          {dataset?.featureColumns
            .slice(0, 3)
            .join(" • ") ||
            "No active features"}
        </strong>

        <small>
          Target:{" "}
          {dataset?.targetColumn ??
            "None"}
        </small>
      </div>

      <div className="live-control-group">
        <label htmlFor="svm-kernel">
          Kernel
        </label>

        <select
          id="svm-kernel"
          value={kernel}
          onChange={(event) =>
            updateParameters({
              kernel:
                event.target
                  .value as SVMKernel,
            })
          }
        >
          {kernelDefinitions.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.shortName}
              </option>
            )
          )}
        </select>

        <small>
          {definition.description}
        </small>
      </div>

      <div className="live-control-group">
        <div className="live-slider-label">
          <label htmlFor="svm-c">
            C
          </label>

          <strong>
            {state.parameters.C.toFixed(
              2
            )}
          </strong>
        </div>

        <input
          id="svm-c"
          type="range"
          min="0.05"
          max="10"
          step="0.05"
          value={state.parameters.C}
          onChange={(event) =>
            updateParameters({
              C: Number(
                event.target.value
              ),
            })
          }
        />

        <div className="live-range-scale">
          <span>
            Softer / smoother
          </span>
          <span>
            Stronger penalty
          </span>
        </div>
      </div>

      {state.task ===
        "regression" && (
        <div className="live-control-group">
          <div className="live-slider-label">
            <label htmlFor="svm-epsilon">
              Epsilon ε
            </label>

            <strong>
              {state.parameters.epsilon.toFixed(
                3
              )}
            </strong>
          </div>

          <input
            id="svm-epsilon"
            type="range"
            min="0"
            max="10"
            step="0.05"
            value={
              state.parameters.epsilon
            }
            onChange={(event) =>
              updateParameters({
                epsilon: Number(
                  event.target.value
                ),
              })
            }
          />

          <div className="live-range-scale">
            <span>
              Narrow tube
            </span>
            <span>
              Wide tube
            </span>
          </div>
        </div>
      )}

      {usesGamma && (
        <div className="live-control-group">
          <div className="live-slider-label">
            <label htmlFor="svm-gamma">
              Gamma γ
            </label>

            <strong>
              {state.parameters.gamma.toFixed(
                3
              )}
            </strong>
          </div>

          <input
            id="svm-gamma"
            type="range"
            min="0.01"
            max="5"
            step="0.01"
            value={
              state.parameters.gamma
            }
            onChange={(event) =>
              updateParameters({
                gamma: Number(
                  event.target.value
                ),
              })
            }
          />

          <div className="live-range-scale">
            <span>
              Broad influence
            </span>
            <span>
              Local influence
            </span>
          </div>
        </div>
      )}

      {usesDegree && (
        <div className="live-control-group">
          <div className="live-slider-label">
            <label htmlFor="svm-degree">
              Polynomial Degree
            </label>

            <strong>
              {state.parameters.degree}
            </strong>
          </div>

          <input
            id="svm-degree"
            type="range"
            min="2"
            max="8"
            step="1"
            value={
              state.parameters.degree
            }
            onChange={(event) =>
              updateParameters({
                degree: Number(
                  event.target.value
                ),
              })
            }
          />

          <div className="live-range-scale">
            <span>Simple</span>
            <span>
              More complex
            </span>
          </div>
        </div>
      )}

      {usesCoef0 && (
        <div className="live-control-group">
          <div className="live-slider-label">
            <label htmlFor="svm-coef0">
              Coef0
            </label>

            <strong>
              {state.parameters.coef0.toFixed(
                2
              )}
            </strong>
          </div>

          <input
            id="svm-coef0"
            type="range"
            min="-3"
            max="3"
            step="0.05"
            value={
              state.parameters.coef0
            }
            onChange={(event) =>
              updateParameters({
                coef0: Number(
                  event.target.value
                ),
              })
            }
          />

          <div className="live-range-scale">
            <span>-3</span>
            <span>+3</span>
          </div>
        </div>
      )}

      {state.task ===
        "classification" && (
        <div className="live-control-group">
          <label htmlFor="svm-class-weight">
            Class Weight
          </label>

          <select
            id="svm-class-weight"
            value={
              state.parameters
                .classWeight
            }
            onChange={(event) =>
              updateParameters({
                classWeight:
                  event.target
                    .value as
                    | "none"
                    | "balanced",
              })
            }
          >
            <option value="none">
              None
            </option>

            <option value="balanced">
              Balanced
            </option>
          </select>

          <small>
            Balanced weighting is most
            useful when classes contain
            different numbers of
            observations. Experiment
            metrics and generated model
            configuration preserve this
            setting.
          </small>
        </div>
      )}

      <div className="live-parameter-effect">
        <span>
          WHAT CHANGES NOW?
        </span>

        <strong>
          Step {step}
        </strong>

        <p>{effect}</p>
      </div>

      <div className="live-kernel-card">
        <div className="live-kernel-title">
          <span>
            KERNEL FORMULA
          </span>

          <strong>
            {definition.shortName}
          </strong>
        </div>

        <code>
          {definition.formula}
        </code>

        <div className="live-kernel-support">
          <span
            className={
              definition.sklearnSupported
                ? "native-kernel"
                : "educational-kernel"
            }
          >
            {definition.sklearnSupported
              ? "Direct sklearn kernel"
              : "Educational / custom kernel"}
          </span>
        </div>
      </div>

      <div className="live-model-truth">
        <span>
          VISUAL MODEL
        </span>

        <p>
          The browser visualization is an
          educational SVM model designed to
          make the mathematics and parameter
          effects visible. Generated sklearn
          code is kept separate from this
          educational visualization.
        </p>
      </div>
    </aside>
  );
}