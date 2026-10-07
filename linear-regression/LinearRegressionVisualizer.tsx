"use client";

import { useMemo, useState } from "react";

import RegressionFitGraph from "./graphs/RegressionFitGraph";
import RegressionLossLandscape from "./graphs/RegressionLossLandscape";

import BestFitExplanation from "./explanations/BestFitExplanation";
import ResidualExplorer from "./explanations/ResidualExplorer";
import R2BaselineVisualizer from "./explanations/R2BaselineVisualizer";
import LinearRegressionLearningGuide from "./explanations/LinearRegressionLearningGuide";
import NewValuePredictor from "./explanations/NewValuePredictor";

type DataPoint = {
  x: number;
  y: number;
};

type PredictionPoint = DataPoint & {
  predicted: number;
  residual: number;
  squaredError: number;
};

const DEFAULT_DATASET: DataPoint[] = [
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 6 },
  { x: 4, y: 8 },
  { x: 5, y: 11 },
  { x: 6, y: 12 },
  { x: 7, y: 15 },
];

type LinearRegressionVisualizerProps = {
  externalDataset?: DataPoint[];
  featureName?: string;
  targetName?: string;
};

export default function LinearRegressionVisualizer({
  externalDataset,
  featureName = "X",
  targetName = "Y",
}: LinearRegressionVisualizerProps) {
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);

  const dataset =
  externalDataset &&
  externalDataset.length > 0
    ? externalDataset
    : DEFAULT_DATASET;

  // =====================================================
  // CURRENT MODEL PREDICTIONS
  // =====================================================

  const predictions =
    useMemo<PredictionPoint[]>(() => {
      return dataset.map((point) => {
        const predicted =
          slope * point.x + intercept;

        const residual =
          point.y - predicted;

        return {
          ...point,
          predicted,
          residual,
          squaredError:
            residual * residual,
        };
      });
    }, [dataset, slope, intercept]);

  // =====================================================
  // EXACT OLS BEST FIT
  // =====================================================

  const bestFit = useMemo(() => {
    if (dataset.length === 0) {
      return {
        slope: 0,
        intercept: 0,
        mse: 0,
      };
    }

    const n = dataset.length;

    const meanX =
      dataset.reduce(
        (sum, point) =>
          sum + point.x,
        0
      ) / n;

    const meanY =
      dataset.reduce(
        (sum, point) =>
          sum + point.y,
        0
      ) / n;

    const numerator =
      dataset.reduce(
        (sum, point) =>
          sum +
          (point.x - meanX) *
            (point.y - meanY),
        0
      );

    const denominator =
      dataset.reduce(
        (sum, point) =>
          sum +
          Math.pow(
            point.x - meanX,
            2
          ),
        0
      );

    const bestSlope =
      denominator === 0
        ? 0
        : numerator / denominator;

    const bestIntercept =
      meanY -
      bestSlope * meanX;

    const bestMSE =
      dataset.reduce(
        (sum, point) => {
          const predicted =
            bestSlope * point.x +
            bestIntercept;

          const residual =
            point.y - predicted;

          return (
            sum +
            residual * residual
          );
        },
        0
      ) / n;

    return {
      slope: bestSlope,
      intercept: bestIntercept,
      mse: bestMSE,
    };
  }, [dataset]);

  // =====================================================
  // METRICS
  // =====================================================

  const metrics = useMemo(() => {
    const n = predictions.length;

    if (n === 0) {
      return {
        mse: 0,
        rmse: 0,
        r2: 0,
      };
    }

    const mse =
      predictions.reduce(
        (sum, point) =>
          sum +
          point.squaredError,
        0
      ) / n;

    const rmse =
      Math.sqrt(mse);

    const meanY =
      dataset.reduce(
        (sum, point) =>
          sum + point.y,
        0
      ) / dataset.length;

    const ssResidual =
      predictions.reduce(
        (sum, point) =>
          sum +
          point.squaredError,
        0
      );

    const ssTotal =
      dataset.reduce(
        (sum, point) =>
          sum +
          Math.pow(
            point.y - meanY,
            2
          ),
        0
      );

    const r2 =
      ssTotal === 0
        ? 0
        : 1 -
          ssResidual /
            ssTotal;

    return {
      mse,
      rmse,
      r2,
    };
  }, [dataset, predictions]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const resetModel = () => {
    setSlope(1);
    setIntercept(0);
  };

  const useBestFit = () => {
    setSlope(bestFit.slope);
    setIntercept(
      bestFit.intercept
    );
  };

  return (
    <div className="space-y-6">
      {/* =================================================
          INTRODUCTION
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          ModelMind Model Lab
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Linear Regression
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Learn Linear Regression by changing the
          model yourself. Move its parameters,
          inspect predictions, understand residuals,
          explore loss, compare against the best-fit
          solution, and understand evaluation
          metrics visually.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Model Equation
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ŷ = mx + b
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-semibold text-slate-400">
                X
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Input feature
              </p>
            </div>

            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-semibold text-slate-400">
                ŷ
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Prediction
              </p>
            </div>

            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-semibold text-slate-400">
                m
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Slope ={" "}
                {slope.toFixed(2)}
              </p>
            </div>

            <div className="rounded-lg bg-white p-3">
              <p className="text-xs font-semibold text-slate-400">
                b
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Intercept ={" "}
                {intercept.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          LEARNING LEVEL
      ================================================= */}

      <LinearRegressionLearningGuide />

      {/* =================================================
          CONTROLS + GRAPH
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Control the Model
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Change m and b manually and watch
            every part of the model update.
          </p>

          {/* SLOPE */}

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <label
                htmlFor="slope"
                className="text-sm font-semibold text-slate-700"
              >
                Slope (m)
              </label>

              <span className="rounded-md bg-blue-50 px-2 py-1 text-sm font-bold text-blue-700">
                {slope.toFixed(2)}
              </span>
            </div>

            <input
              id="slope"
              type="range"
              min="-3"
              max="5"
              step="0.01"
              value={slope}
              onChange={(event) =>
                setSlope(
                  Number(
                    event.target.value
                  )
                )
              }
              className="mt-4 w-full"
            />

            <div className="mt-3 rounded-lg bg-blue-50 p-3">
              <p className="text-xs leading-5 text-slate-600">
                When X increases by{" "}
                <strong>1</strong>, the
                prediction changes by{" "}
                <strong>
                  {slope.toFixed(2)}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* INTERCEPT */}

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <label
                htmlFor="intercept"
                className="text-sm font-semibold text-slate-700"
              >
                Intercept (b)
              </label>

              <span className="rounded-md bg-purple-50 px-2 py-1 text-sm font-bold text-purple-700">
                {intercept.toFixed(2)}
              </span>
            </div>

            <input
              id="intercept"
              type="range"
              min="-10"
              max="10"
              step="0.01"
              value={intercept}
              onChange={(event) =>
                setIntercept(
                  Number(
                    event.target.value
                  )
                )
              }
              className="mt-4 w-full"
            />

            <div className="mt-3 rounded-lg bg-purple-50 p-3">
              <p className="text-xs leading-5 text-slate-600">
                When X = 0, the model
                predicts{" "}
                <strong>
                  {intercept.toFixed(2)}
                </strong>
                .
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetModel}
            className="mt-7 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset Parameters
          </button>
        </div>

        <RegressionFitGraph
          data={predictions}
          slope={slope}
          intercept={intercept}
        />
      </div>

      {/* =================================================
          METRICS
      ================================================= */}

      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Model Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Every metric updates immediately when
            you move the regression line.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              MSE
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {metrics.mse.toFixed(3)}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Average squared prediction error.
              Smaller is better.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              RMSE
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {metrics.rmse.toFixed(3)}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Error expressed in the same units as
              the target.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              R²
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {metrics.r2.toFixed(3)}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Comparison against the mean-target
              baseline.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          BEST FIT
      ================================================= */}

      <BestFitExplanation
        currentSlope={slope}
        currentIntercept={
          intercept
        }
        bestSlope={
          bestFit.slope
        }
        bestIntercept={
          bestFit.intercept
        }
        currentMSE={
          metrics.mse
        }
        bestMSE={
          bestFit.mse
        }
        onUseBestFit={
          useBestFit
        }
      />

      {/* =================================================
          RESIDUAL EXPLORER
      ================================================= */}

      <ResidualExplorer
        data={predictions}
        slope={slope}
        intercept={intercept}
        mse={metrics.mse}
      />

      {/* =================================================
          LOSS LANDSCAPE
      ================================================= */}

      <RegressionLossLandscape
        data={dataset}
        currentSlope={slope}
        currentIntercept={
          intercept
        }
        bestSlope={
          bestFit.slope
        }
        bestIntercept={
          bestFit.intercept
        }
      />

      {/* =================================================
          R2 BASELINE
      ================================================= */}

      <R2BaselineVisualizer
        data={predictions}
        r2={metrics.r2}
      />
      {/* =================================================
    NEW VALUE PREDICTION
================================================= */}

<NewValuePredictor
  slope={slope}
  intercept={intercept}
/>
      {/* =================================================
          PREDICTION TABLE
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Prediction Breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Inspect every prediction made by the
            current model.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-3">
                  X
                </th>

                <th className="px-3 py-3">
                  Actual Y
                </th>

                <th className="px-3 py-3">
                  Predicted ŷ
                </th>

                <th className="px-3 py-3">
                  Residual
                </th>

                <th className="px-3 py-3">
                  Residual²
                </th>
              </tr>
            </thead>

            <tbody>
              {predictions.map(
                (point, index) => (
                  <tr
                    key={`${point.x}-${index}`}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-3 font-semibold text-slate-700">
                      {point.x}
                    </td>

                    <td className="px-3 py-3">
                      {point.y.toFixed(
                        2
                      )}
                    </td>

                    <td className="px-3 py-3 font-semibold text-blue-700">
                      {point.predicted.toFixed(
                        2
                      )}
                    </td>

                    <td className="px-3 py-3">
                      {point.residual.toFixed(
                        2
                      )}
                    </td>

                    <td className="px-3 py-3">
                      {point.squaredError.toFixed(
                        2
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          COMPLETE LEARNING FLOW
      ================================================= */}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          What you just learned
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          The complete Linear Regression flow
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-blue-600">
              01
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Input X
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-blue-600">
              02
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Predict ŷ = mx + b
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-blue-600">
              03
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Measure residuals
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-blue-600">
              04
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Minimize squared error
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-purple-600">
              05
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Find best m and b
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-purple-600">
              06
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Evaluate MSE / RMSE
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-purple-600">
              07
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Compare with R² baseline
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold text-emerald-600">
              08
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              Predict new values
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-blue-200 bg-white p-5">
          <p className="font-bold text-slate-900">
            Connection to Gradient Descent
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Here we can calculate the exact
            Ordinary Least Squares solution.
            Gradient Descent provides another way
            to search for parameters by repeatedly
            moving in a direction that reduces the
            loss.
          </p>
        </div>
      </div>
    </div>
  );
}