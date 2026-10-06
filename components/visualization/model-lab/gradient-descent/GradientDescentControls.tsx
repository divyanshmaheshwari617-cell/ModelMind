"use client";

import type {
  LearningLevel,
  ParameterDefinition,
} from "../config/parameterRegistry";

type ParameterValue =
  | string
  | number;

type GradientDescentControlsProps = {
  parameters: ParameterDefinition[];

  selectedParameterId: string;

  onParameterChange: (
    parameterId: string
  ) => void;

  values: Record<
    string,
    ParameterValue
  >;

  onValueChange: (
    parameterId: string,
    value: ParameterValue
  ) => void;

  learningLevel: LearningLevel;

  onLearningLevelChange: (
    level: LearningLevel
  ) => void;
};

export default function GradientDescentControls({
  parameters,
  selectedParameterId,
  onParameterChange,
  values,
  onValueChange,
  learningLevel,
  onLearningLevelChange,
}: GradientDescentControlsProps) {
  const selectedParameter =
    parameters.find(
      (parameter) =>
        parameter.id ===
        selectedParameterId
    );

  if (!selectedParameter) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-sm text-zinc-400">
          Select a parameter to begin.
        </p>
      </div>
    );
  }

  const currentValue =
    values[
      selectedParameter.id
    ] ??
    selectedParameter.defaultValue;

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      {/* HEADER */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Experiment Controls
        </p>

        <h3 className="mt-2 text-lg font-semibold text-zinc-100">
          Change a Parameter
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Select a parameter and
          change its value. The
          visualization will react
          to the selected setting.
        </p>
      </div>

      {/* LEARNING LEVEL */}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Learning Level
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              "Basic",
              "Medium",
              "Advanced",
            ] as LearningLevel[]
          ).map((level) => {
            const active =
              learningLevel === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() =>
                  onLearningLevelChange(
                    level
                  )
                }
                className={[
                  "rounded-xl border px-3 py-2.5 text-xs font-medium transition",
                  active
                    ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300",
                ].join(" ")}
              >
                {level}
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Higher levels reveal more
          parameters and deeper
          optimization concepts.
        </p>
      </div>

      {/* PARAMETER SELECTOR */}

      <div>
        <label
          htmlFor="gd-parameter"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
        >
          Parameter
        </label>

        <select
          id="gd-parameter"
          value={
            selectedParameterId
          }
          onChange={(event) =>
            onParameterChange(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
        >
          {parameters.map(
            (parameter) => (
              <option
                key={parameter.id}
                value={parameter.id}
              >
                {parameter.name}
              </option>
            )
          )}
        </select>
      </div>

      {/* SELECTED PARAMETER */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-zinc-500">
              Selected Parameter
            </p>

            <p className="mt-1 font-medium text-zinc-100">
              {
                selectedParameter.name
              }
            </p>
          </div>

          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
            {
              selectedParameter.level
            }
          </span>
        </div>

        <div className="mt-4">
          <ParameterControl
            parameter={
              selectedParameter
            }
            value={currentValue}
            onChange={(value) =>
              onValueChange(
                selectedParameter.id,
                value
              )
            }
          />
        </div>
      </div>

      {/* CURRENT VALUE */}

      <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
        <span className="text-sm text-zinc-500">
          Current Value
        </span>

        <span className="break-all font-mono text-sm font-semibold text-zinc-100">
          {String(currentValue)}
        </span>
      </div>
    </div>
  );
}

/*
========================================================
PARAMETER CONTROL
========================================================
*/

function ParameterControl({
  parameter,
  value,
  onChange,
}: {
  parameter: ParameterDefinition;

  value: ParameterValue;

  onChange: (
    value: ParameterValue
  ) => void;
}) {
  if (
    parameter.controlType ===
    "slider"
  ) {
    return (
      <SliderControl
        parameter={parameter}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (
    parameter.controlType ===
    "select"
  ) {
    return (
      <SelectControl
        parameter={parameter}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <NumberControl
      parameter={parameter}
      value={value}
      onChange={onChange}
    />
  );
}

/*
========================================================
SLIDER
========================================================
*/

function SliderControl({
  parameter,
  value,
  onChange,
}: {
  parameter: ParameterDefinition;

  value: ParameterValue;

  onChange: (
    value: ParameterValue
  ) => void;
}) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  const min =
    parameter.min ?? 0;

  const max =
    parameter.max ?? 100;

  const step =
    parameter.step ?? 1;

  const safeValue =
    Number.isFinite(numericValue)
      ? numericValue
      : Number(
          parameter.defaultValue
        );

  const percentage =
    max === min
      ? 0
      : ((safeValue - min) /
          (max - min)) *
        100;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm text-zinc-400">
          {parameter.name}
        </span>

        <span className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-100">
          {formatNumber(
            safeValue
          )}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-zinc-200"
      />

      <div className="mt-2 flex justify-between font-mono text-[11px] text-zinc-600">
        <span>
          {formatNumber(min)}
        </span>

        <span>
          {formatNumber(max)}
        </span>
      </div>

      {/* SIMPLE RANGE INDICATOR */}

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-zinc-600">
          <span>Lower</span>
          <span>Current</span>
          <span>Higher</span>
        </div>

        <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-zinc-500 transition-all duration-200"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  percentage
                )
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/*
========================================================
SELECT
========================================================
*/

function SelectControl({
  parameter,
  value,
  onChange,
}: {
  parameter: ParameterDefinition;

  value: ParameterValue;

  onChange: (
    value: ParameterValue
  ) => void;
}) {
  return (
    <div>
      <label
        htmlFor={`control-${parameter.id}`}
        className="mb-2 block text-sm text-zinc-400"
      >
        {parameter.name}
      </label>

      <select
        id={`control-${parameter.id}`}
        value={String(value)}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
      >
        {parameter.options?.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

/*
========================================================
NUMBER INPUT
========================================================
*/

function NumberControl({
  parameter,
  value,
  onChange,
}: {
  parameter: ParameterDefinition;

  value: ParameterValue;

  onChange: (
    value: ParameterValue
  ) => void;
}) {
  return (
    <div>
      <label
        htmlFor={`number-${parameter.id}`}
        className="mb-2 block text-sm text-zinc-400"
      >
        {parameter.name}
      </label>

      <input
        id={`number-${parameter.id}`}
        type="number"
        value={value}
        min={parameter.min}
        max={parameter.max}
        step={parameter.step}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 font-mono text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
      />
    </div>
  );
}

/*
========================================================
FORMAT NUMBER
========================================================
*/

function formatNumber(
  value: number
) {
  if (
    Math.abs(value) < 0.01 &&
    value !== 0
  ) {
    return value.toFixed(3);
  }

  if (
    Number.isInteger(value)
  ) {
    return String(value);
  }

  return value.toFixed(2);
}