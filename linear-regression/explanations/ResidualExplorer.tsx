"use client";

import { useState } from "react";

type PredictionPoint = {
  x: number;
  y: number;
  predicted: number;
  residual: number;
  squaredError: number;
};

type ResidualExplorerProps = {
  data: PredictionPoint[];
  slope: number;
  intercept: number;
  mse: number;
};

export default function ResidualExplorer({
  data,
  slope,
  intercept,
  mse,
}: ResidualExplorerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (data.length === 0) {
    return null;
  }

  const safeIndex = Math.min(
    selectedIndex,
    data.length - 1
  );

  const point = data[safeIndex];

  const contribution =
    data.length === 0
      ? 0
      : point.squaredError / data.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Residual Explorer
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Where does prediction error come from?
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Select one observation and follow it through the complete
          Linear Regression prediction and error calculation.
        </p>
      </div>

      {/* Point selector */}

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-700">
          Select a data point
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {data.map((item, index) => (
            <button
              key={`${item.x}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                safeIndex === index
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              X = {item.x}
            </button>
          ))}
        </div>
      </div>

      {/* Prediction flow */}

      <div className="mt-7 grid gap-3 lg:grid-cols-5">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Input
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            X = {point.x}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Prediction
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-700">
            ŷ = {point.predicted.toFixed(3)}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            Actual
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            Y = {point.y.toFixed(3)}
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
            Residual
          </p>

          <p className="mt-2 text-2xl font-bold text-orange-700">
            {point.residual.toFixed(3)}
          </p>
        </div>

        <div className="rounded-xl bg-purple-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
            Squared Error
          </p>

          <p className="mt-2 text-2xl font-bold text-purple-700">
            {point.squaredError.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Equation walkthrough */}

      <div className="mt-7 rounded-xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900">
          Follow the calculation
        </h3>

        <div className="mt-5 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Step 1 — Make the prediction
            </p>

            <p className="mt-2 font-mono text-sm text-slate-800">
              ŷ = mx + b
            </p>

            <p className="mt-1 font-mono text-sm text-slate-800">
              ŷ = {slope.toFixed(3)} × {point.x}{" "}
              {intercept >= 0 ? "+" : "−"}{" "}
              {Math.abs(intercept).toFixed(3)}
            </p>

            <p className="mt-1 font-mono text-sm font-bold text-blue-700">
              ŷ = {point.predicted.toFixed(3)}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
              Step 2 — Calculate the residual
            </p>

            <p className="mt-2 font-mono text-sm text-slate-800">
              residual = actual − predicted
            </p>

            <p className="mt-1 font-mono text-sm text-slate-800">
              residual = {point.y.toFixed(3)} −{" "}
              {point.predicted.toFixed(3)}
            </p>

            <p className="mt-1 font-mono text-sm font-bold text-orange-700">
              residual = {point.residual.toFixed(3)}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Step 3 — Square the error
            </p>

            <p className="mt-2 font-mono text-sm text-slate-800">
              squared error = residual²
            </p>

            <p className="mt-1 font-mono text-sm text-slate-800">
              squared error = ({point.residual.toFixed(3)})²
            </p>

            <p className="mt-1 font-mono text-sm font-bold text-purple-700">
              squared error ={" "}
              {point.squaredError.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* MSE connection */}

      <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
          How this contributes to MSE
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-200">
          MSE takes the squared errors from{" "}
          <strong>all {data.length} observations</strong>, adds them
          together, and divides by {data.length}.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-xs text-slate-300">
              This point&apos;s MSE contribution
            </p>

            <p className="mt-1 text-2xl font-bold">
              {contribution.toFixed(3)}
            </p>
          </div>

          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-xs text-slate-300">
              Total model MSE
            </p>

            <p className="mt-1 text-2xl font-bold">
              {mse.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm font-bold text-orange-800">
          Why square the residual?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Residuals can be positive or negative. Squaring prevents
          opposite errors from cancelling each other and gives
          larger errors a stronger penalty.
        </p>
      </div>
    </div>
  );
}