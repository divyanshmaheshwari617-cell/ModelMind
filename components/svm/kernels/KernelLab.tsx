import {
  useMemo,
} from "react";

import {
  useSVM,
} from "../context/SVMContext";

import {
  getKernelDefinition,
  kernelDefinitions,
} from "./kernelMath";

import type {
  SVMKernel,
} from "../types/svm";

import "./KernelLab.css";

export default function KernelLab() {
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

  function setKernel(
    kernel: SVMKernel
  ) {
    updateParameters({
      kernel,
    });
  }

  return (
    <section className="kernel-lab">
      <div className="kernel-heading">
        <div>
          <span>
            KERNEL & HYPERPARAMETER LAB
          </span>

          <h2>
            Control How SVM Learns
          </h2>

          <p>
            Change the kernel and
            optimization parameters.
            The same values will be
            used throughout the SVM
            visualizations and later
            experiment engines.
          </p>
        </div>

        <div className="kernel-current">
          <span>
            CURRENT KERNEL
          </span>

          <strong>
            {definition.name}
          </strong>
        </div>
      </div>

      <div className="kernel-grid">
        {kernelDefinitions.map(
          (kernel) => (
            <button
              key={kernel.id}
              className={
                state.parameters
                  .kernel ===
                kernel.id
                  ? "kernel-card selected"
                  : "kernel-card"
              }
              onClick={() =>
                setKernel(
                  kernel.id
                )
              }
            >
              <span>
                {kernel.shortName}
              </span>

              <small>
                {
                  kernel.description
                }
              </small>

              <div>
                {kernel.sklearnSupported
                  ? "Direct sklearn"
                  : "Custom / educational"}
              </div>
            </button>
          )
        )}
      </div>

      <div className="kernel-workspace">
        <div className="kernel-info-panel">
          <span className="kernel-label">
            SELECTED KERNEL
          </span>

          <h3>
            {definition.name}
          </h3>

          <p>
            {definition.description}
          </p>

          <div className="kernel-formula">
            <span>
              Formula
            </span>

            <strong>
              {definition.formula}
            </strong>
          </div>

          <div className="kernel-support-status">
            <span>
              Training mode
            </span>

            <strong>
              {definition.sklearnSupported
                ? "Native SVC / SVR kernel"
                : "Custom / precomputed kernel"}
            </strong>
          </div>
        </div>

        <div className="parameter-panel">
          <ParameterSlider
            label="C"
            description="Penalty strength for margin violations."
            value={
              state.parameters.C
            }
            min={0.05}
            max={20}
            step={0.05}
            onChange={(C) =>
              updateParameters({
                C,
              })
            }
          />

          {definition.requiresGamma && (
            <ParameterSlider
              label="Gamma"
              description="Controls how local the influence of each observation becomes."
              value={
                state.parameters
                  .gamma
              }
              min={0.01}
              max={5}
              step={0.01}
              onChange={(
                gamma
              ) =>
                updateParameters({
                  gamma,
                })
              }
            />
          )}

          {definition.requiresDegree && (
            <ParameterSlider
              label="Degree"
              description="Polynomial complexity."
              value={
                state.parameters
                  .degree
              }
              min={2}
              max={8}
              step={1}
              onChange={(
                degree
              ) =>
                updateParameters({
                  degree,
                })
              }
            />
          )}

          {definition.requiresCoef0 && (
            <ParameterSlider
              label="Coef0"
              description="Independent term used by polynomial and sigmoid-style kernels."
              value={
                state.parameters
                  .coef0
              }
              min={-3}
              max={3}
              step={0.05}
              onChange={(
                coef0
              ) =>
                updateParameters({
                  coef0,
                })
              }
            />
          )}

          {state.task ===
            "regression" && (
            <ParameterSlider
              label="Epsilon"
              description="Width of the SVR epsilon-insensitive tube."
              value={
                state.parameters
                  .epsilon
              }
              min={0.01}
              max={3}
              step={0.01}
              onChange={(
                epsilon
              ) =>
                updateParameters({
                  epsilon,
                })
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

type SliderProps = {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange:
    (value: number) => void;
};

function ParameterSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
}: SliderProps) {
  return (
    <div className="parameter-control">
      <div className="parameter-title">
        <div>
          <strong>
            {label}
          </strong>

          <small>
            {description}
          </small>
        </div>

        <output>
          {Number(
            value.toFixed(3)
          )}
        </output>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
      />

      <div className="parameter-range">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}