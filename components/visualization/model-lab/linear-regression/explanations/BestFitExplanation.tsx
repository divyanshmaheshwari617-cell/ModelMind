"use client";

type BestFitExplanationProps = {
  currentSlope: number;
  currentIntercept: number;
  bestSlope: number;
  bestIntercept: number;
  currentMSE: number;
  bestMSE: number;
  onUseBestFit: () => void;
};

export default function BestFitExplanation({
  currentSlope,
  currentIntercept,
  bestSlope,
  bestIntercept,
  currentMSE,
  bestMSE,
  onUseBestFit,
}: BestFitExplanationProps) {
  const improvement =
    currentMSE > 0
      ? ((currentMSE - bestMSE) / currentMSE) * 100
      : 0;

  const isNearBest =
    Math.abs(currentSlope - bestSlope) < 0.05 &&
    Math.abs(currentIntercept - bestIntercept) < 0.05;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Best-Fit Line
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Can you find the best line?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Linear Regression searches for the slope and intercept
            that make the total squared prediction error as small as
            possible.
          </p>
        </div>

        <button
          type="button"
          onClick={onUseBestFit}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Use Best Fit
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Your Line
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            ŷ = {currentSlope.toFixed(3)}x{" "}
            {currentIntercept >= 0 ? "+" : "−"}{" "}
            {Math.abs(currentIntercept).toFixed(3)}
          </p>

          <div className="mt-4">
            <p className="text-xs text-slate-500">MSE</p>

            <p className="text-2xl font-bold text-slate-800">
              {currentMSE.toFixed(3)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            Optimal Line
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            ŷ = {bestSlope.toFixed(3)}x{" "}
            {bestIntercept >= 0 ? "+" : "−"}{" "}
            {Math.abs(bestIntercept).toFixed(3)}
          </p>

          <div className="mt-4">
            <p className="text-xs text-slate-500">
              Minimum MSE
            </p>

            <p className="text-2xl font-bold text-emerald-700">
              {bestMSE.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        {isNearBest ? (
          <>
            <p className="font-bold text-emerald-700">
              Excellent — your line is very close to the best fit.
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your slope and intercept are close to the values that
              minimize Mean Squared Error.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-slate-800">
              Your current line can still improve.
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Moving toward the optimal parameters would reduce MSE
              by approximately{" "}
              <strong>
                {Math.max(0, improvement).toFixed(1)}%
              </strong>
              .
            </p>
          </>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs font-bold text-blue-700">
            STEP 1
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            Calculate the mean of X and Y
          </p>
        </div>

        <div className="rounded-lg bg-purple-50 p-4">
          <p className="text-xs font-bold text-purple-700">
            STEP 2
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            Calculate the optimal slope
          </p>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-bold text-emerald-700">
            STEP 3
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            Calculate the optimal intercept
          </p>
        </div>
      </div>
    </div>
  );
}