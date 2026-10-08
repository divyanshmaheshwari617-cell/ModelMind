
"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  Database,
  RotateCcw,
} from "lucide-react";

import type {
  TrainingResponse,
  PredictionRecord,
} from "@/lib/api/polynomialApi";

interface Props {
  degree?: number;
  featureName?: string;
  targetName?: string;
  result?: TrainingResponse | null;
}

type Mode = "real" | "example";

const steps = [
  "Select observation",
  "Expand polynomial features",
  "Inspect coefficients",
  "Calculate prediction",
  "Calculate residual and error",
];

function format(value: number): string {
  if (!Number.isFinite(value)) return "—";

  return Number(value.toFixed(5)).toLocaleString(
    undefined,
    { maximumFractionDigits: 5 }
  );
}

function polynomialTerm(
  name: string,
  features: Record<string, number | null>
): number | null {
  if (name === "1") return 1;

  let product = 1;

  for (const part of name.trim().split(/\s+/)) {
    const match = part.match(/^(.+?)(?:\^(\d+))?$/);

    if (!match) return null;

    const feature = match[1];
    const power = Number(match[2] ?? 1);
    const value = features[feature];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value)
    ) {
      return null;
    }

    product *= value ** power;
  }

  return product;
}

function supportsRawCoefficients(
  space: string
): boolean {
  const normalized = space.trim().toLowerCase();

  return [
    "original",
    "original_feature_space",
    "original_polynomial_space",
    "unscaled",
    "raw",
    "raw_polynomial",
  ].includes(normalized);
}

export default function PolynomialMathVisualizer({
  degree = 2,
  featureName = "x",
  targetName = "y",
  result = null,
}: Props) {
  const [mode, setMode] = useState<Mode>("real");
  const [step, setStep] = useState(0);
  const [observationIndex, setObservationIndex] =
    useState(0);

  const [x, setX] = useState(2);
  const [actualY, setActualY] = useState(12);
  const [coefficients, setCoefficients] =
    useState<number[]>([1, 2, 1]);

  const safeDegree = Math.min(
    10,
    Math.max(1, Math.floor(degree))
  );

  const observations = result?.predictions ?? [];

  const observation: PredictionRecord | null =
    observations.length > 0
      ? observations[
          Math.min(
            observationIndex,
            observations.length - 1
          )
        ]
      : null;

  const realMode =
    mode === "real" &&
    result !== null &&
    observation !== null;

  const realTerms = useMemo(() => {
    if (!result || !observation) return [];

    return result.polynomial.feature_names.map(
      (name, index) => {
        const value = polynomialTerm(
          name,
          observation.features
        );

        const coefficient =
          result.polynomial.coefficients[index];

        return {
          name,
          value,
          coefficient,
          contribution:
            value !== null &&
            typeof coefficient === "number"
              ? value * coefficient
              : null,
        };
      }
    );
  }, [result, observation]);

  const exampleTerms = useMemo(
    () =>
      Array.from(
        { length: safeDegree + 1 },
        (_, power) => {
          const coefficient =
            coefficients[power] ?? 0;

          const value = x ** power;

          return {
            name:
              power === 0
                ? "1"
                : power === 1
                  ? featureName
                  : `${featureName}^${power}`,
            value,
            coefficient,
            contribution: value * coefficient,
          };
        }
      ),
    [safeDegree, coefficients, x, featureName]
  );

  const rawCoefficientSpace =
    result !== null &&
    supportsRawCoefficients(
      result.polynomial.coefficient_space
    );

  const canDecompose =
    realMode &&
    rawCoefficientSpace &&
    realTerms.every(
      (term) =>
        term.value !== null &&
        term.contribution !== null &&
        Number.isFinite(term.contribution)
    );

  const examplePrediction = exampleTerms.reduce(
    (sum, term) =>
      sum + (term.contribution ?? 0),
    0
  );

  const predicted =
    realMode && observation
      ? observation.predicted
      : examplePrediction;

  const actual =
    realMode && observation
      ? observation.actual
      : actualY;

  const residual = actual - predicted;
  const squaredError = residual ** 2;
  const absoluteError = Math.abs(residual);

  const terms = realMode
    ? realTerms
    : exampleTerms;

  const reconstructedPrediction =
    realMode && result && canDecompose
      ? result.polynomial.intercept +
        realTerms.reduce(
          (sum, term) =>
            sum + (term.contribution ?? 0),
          0
        )
      : null;

  const reconstructionMatches =
    reconstructedPrediction !== null &&
    Math.abs(
      reconstructedPrediction - predicted
    ) <=
      1e-5 * Math.max(1, Math.abs(predicted));

  function updateCoefficient(
    index: number,
    value: number
  ) {
    setCoefficients((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  function resetExample() {
    setStep(0);
    setX(2);
    setActualY(12);
    setCoefficients([1, 2, 1]);
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400">
            <Calculator size={21} />

            <span className="text-xs font-semibold uppercase tracking-widest">
              ModelMind Mathematics Lab
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Polynomial Prediction — Step by Step
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Explore actual model predictions or
            experiment with editable example
            coefficients.
          </p>
        </div>

        <button
          type="button"
          onClick={resetExample}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300"
        >
          <RotateCcw size={16} />
          Reset example
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("real");
            setStep(0);
          }}
          className={`rounded-xl px-4 py-2 text-sm ${
            mode === "real"
              ? "bg-violet-600 text-white"
              : "border border-slate-700 text-slate-300"
          }`}
        >
          <Database size={15} className="mr-2 inline" />
          Real Dataset
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("example");
            setStep(0);
          }}
          className={`rounded-xl px-4 py-2 text-sm ${
            mode === "example"
              ? "bg-violet-600 text-white"
              : "border border-slate-700 text-slate-300"
          }`}
        >
          Editable Example
        </button>
      </div>

      {mode === "real" && !realMode ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-7 text-amber-200">
          No trained-model observations are connected
          yet. Train your model and pass its backend
          response into this component, or select
          Editable Example to explore the mathematics.
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-5">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-xl border p-3 text-left text-xs ${
                  step === index
                    ? "border-violet-500 bg-violet-500/15 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400"
                }`}
              >
                <span className="block text-violet-300">
                  Step {index + 1}
                </span>
                <span className="mt-1 block">
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 md:p-7">
            <h3 className="mb-6 text-lg font-semibold text-white">
              {steps[step]}
            </h3>

            {step === 0 && (
              <div className="space-y-5">
                {realMode && observation ? (
                  <>
                    <label className="block text-sm text-slate-300">
                      Choose a trained-model observation
                    </label>

                    <select
                      value={Math.min(
                        observationIndex,
                        observations.length - 1
                      )}
                      onChange={(event) =>
                        setObservationIndex(
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                    >
                      {observations.map((item, index) => (
                        <option key={index} value={index}>
                          #{index + 1} — {item.split} —
                          actual {format(item.actual)}
                        </option>
                      ))}
                    </select>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(
                        observation.features
                      ).map(([name, value]) => (
                        <div
                          key={name}
                          className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                        >
                          <p className="text-xs text-slate-400">
                            {name}
                          </p>

                          <p className="mt-2 font-mono text-lg text-sky-300">
                            {value === null
                              ? "Missing"
                              : format(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-sm text-slate-300">
                      Input {featureName}
                    </label>

                    <input
                      type="number"
                      value={x}
                      onChange={(event) =>
                        setX(Number(event.target.value))
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3"
                    />

                    <label className="block text-sm text-slate-300">
                      Actual {targetName}
                    </label>

                    <input
                      type="number"
                      value={actualY}
                      onChange={(event) =>
                        setActualY(
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3"
                    />
                  </>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm leading-7 text-slate-300">
                  Each input is transformed into
                  polynomial powers and interaction
                  terms.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {terms.map((term, index) => (
                    <div
                      key={`${term.name}-${index}`}
                      className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                    >
                      <p className="text-xs text-slate-400">
                        {term.name}
                      </p>

                      <p className="mt-2 break-all font-mono text-lg text-sky-300">
                        {term.value === null
                          ? "Unavailable"
                          : format(term.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm leading-7 text-slate-300">
                  Inspect the coefficient assigned
                  to each polynomial feature.
                </p>

                {realMode && result && (
                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
                    Coefficient space:{" "}
                    <strong>
                      {result.polynomial.coefficient_space}
                    </strong>
                    <br />
                    Intercept:{" "}
                    <strong>
                      {format(result.polynomial.intercept)}
                    </strong>
                  </div>
                )}

                <div className="space-y-3">
                  {terms.map((term, index) => (
                    <div
                      key={`${term.name}-${index}`}
                      className="grid gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:grid-cols-3"
                    >
                      <span className="text-sm text-slate-300">
                        {term.name}
                      </span>

                      {realMode ? (
                        <span className="font-mono text-sm text-sky-300">
                          {format(term.coefficient)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={term.coefficient}
                          onChange={(event) =>
                            updateCoefficient(
                              index,
                              Number(event.target.value)
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 p-2"
                        />
                      )}

                      <span className="font-mono text-sm text-emerald-300">
                        {realMode && !canDecompose
                          ? "See coefficient-space note"
                          : term.contribution === null
                            ? "Unavailable"
                            : format(term.contribution)}
                      </span>
                    </div>
                  ))}
                </div>

                {realMode && !canDecompose && (
                  <p className="rounded-xl bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
                    These coefficients cannot be safely
                    multiplied by the displayed raw
                    polynomial features without
                    verifying the backend&apos;s
                    transformation. The model&apos;s
                    actual prediction is still
                    available in the next step.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <p className="text-sm leading-7 text-slate-300">
                  The model combines its polynomial
                  terms and coefficients to predict
                  the target.
                </p>

                {realMode &&
                  reconstructedPrediction !== null &&
                  reconstructionMatches && (
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <p className="text-xs text-slate-400">
                        Reconstructed prediction
                      </p>

                      <p className="mt-2 font-mono text-lg text-sky-300">
                        {format(reconstructedPrediction)}
                      </p>
                    </div>
                  )}

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                  <p className="text-sm text-emerald-200">
                    {realMode
                      ? "Actual backend prediction"
                      : "Example prediction"}{" "}
                    — {targetName}
                  </p>

                  <p className="mt-3 break-all text-4xl font-bold text-emerald-300">
                    {format(predicted)}
                  </p>
                </div>

                {realMode &&
                  (!canDecompose ||
                    !reconstructionMatches) && (
                    <p className="text-sm leading-6 text-amber-200">
                      The displayed prediction comes
                      directly from the Python backend.
                      A complete term-by-term
                      reconstruction requires
                      verified coefficient-space and
                      preprocessing details.
                    </p>
                  )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm leading-7 text-slate-300">
                  Residual = actual − predicted.
                  Squared error is the residual
                  multiplied by itself.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Actual value",
                      value: actual,
                    },
                    {
                      label: "Predicted value",
                      value: predicted,
                    },
                    {
                      label: "Residual",
                      value: residual,
                    },
                    {
                      label: "Squared error",
                      value: squaredError,
                    },
                    {
                      label: "Absolute error",
                      value: absoluteError,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                    >
                      <p className="text-xs text-slate-400">
                        {item.label}
                      </p>

                      <p className="mt-2 break-all font-mono text-xl font-semibold text-white">
                        {format(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between border-t border-slate-800 pt-6">
              <button
                type="button"
                disabled={step === 0}
                onClick={() =>
                  setStep((current) =>
                    Math.max(0, current - 1)
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                type="button"
                disabled={step === steps.length - 1}
                onClick={() =>
                  setStep((current) =>
                    Math.min(
                      steps.length - 1,
                      current + 1
                    )
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </>
      )}

      <p className="text-xs leading-6 text-slate-500">
        Real Dataset mode uses observations and
        predictions returned by the Python backend.
        Editable Example mode demonstrates the
        mathematics with manually selected
        coefficients.
      </p>
    </section>
  );
}
