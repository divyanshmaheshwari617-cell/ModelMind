"use client";

import { useMemo, useState } from "react";

type NewValuePredictorProps = {
  slope: number;
  intercept: number;
};

export default function NewValuePredictor({
  slope,
  intercept,
}: NewValuePredictorProps) {
  const [inputX, setInputX] = useState("8");

  const numericX = Number(inputX);

  const isValid =
    inputX.trim() !== "" &&
    Number.isFinite(numericX);

  const prediction = useMemo(() => {
    if (!isValid) {
      return null;
    }

    return slope * numericX + intercept;
  }, [slope, intercept, numericX, isValid]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Try the Model
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Predict a New Value
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Enter a new X value and use the current regression
          equation to make a prediction.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div>
          <label
            htmlFor="new-x-value"
            className="text-sm font-semibold text-slate-700"
          >
            New X value
          </label>

          <input
            id="new-x-value"
            type="number"
            step="any"
            value={inputX}
            onChange={(event) =>
              setInputX(event.target.value)
            }
            placeholder="Enter X"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Try values that were not present in the original
            dataset.
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
            Current Model
          </p>

          <p className="mt-2 text-2xl font-bold">
            ŷ = {slope.toFixed(3)}x{" "}
            {intercept >= 0 ? "+" : "−"}{" "}
            {Math.abs(intercept).toFixed(3)}
          </p>

          {isValid && prediction !== null ? (
            <div className="mt-5">
              <p className="font-mono text-sm text-slate-300">
                ŷ = {slope.toFixed(3)} ×{" "}
                {numericX.toFixed(3)}{" "}
                {intercept >= 0 ? "+" : "−"}{" "}
                {Math.abs(intercept).toFixed(3)}
              </p>

              <div className="mt-4 rounded-xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Prediction
                </p>

                <p className="mt-1 text-3xl font-bold">
                  ŷ = {prediction.toFixed(3)}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-white/10 p-4">
              <p className="text-sm text-slate-300">
                Enter a valid number to calculate a prediction.
              </p>
            </div>
          )}
        </div>
      </div>

      {isValid && prediction !== null && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-800">
            What just happened?
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            The model received{" "}
            <strong>X = {numericX.toFixed(3)}</strong>, multiplied
            it by the current slope, added the intercept, and
            produced{" "}
            <strong>
              ŷ = {prediction.toFixed(3)}
            </strong>
            .
          </p>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-800">
          Be careful with extrapolation
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Linear Regression can calculate predictions outside the
          range of the training data, but those predictions may be
          less reliable because the observed relationship may not
          continue in the same way beyond that range.
        </p>
      </div>
    </div>
  );
}