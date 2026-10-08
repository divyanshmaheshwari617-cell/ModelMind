
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Info,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  CurveResponse,
  SurfaceResponse,
} from "@/lib/api/polynomialApi";

type Frame = CurveResponse | SurfaceResponse;
type MetricType = "rmse" | "r2";

interface Props {
  frames: Record<number, Frame>;
  maxDegree: number;
  viewMode: "2d" | "3d";
  datasetName: string;
  onSelectDegree?: (degree: number) => void;
}

function format(value: number | null | undefined) {
  return value == null || !Number.isFinite(value)
    ? "—"
    : value.toFixed(4);
}
const CHART_MARGIN = {
  top: 10,
  right: 20,
  bottom: 15,
  left: 10,
};
export default function PolynomialComparisonStudio({
  frames,
  maxDegree,
  viewMode,
  datasetName,
  onSelectDegree,
}: Props) {
  const [metricType, setMetricType] =
    useState<MetricType>("rmse");

  const [selectedDegree, setSelectedDegree] =
    useState<number | null>(null);

  const rows = useMemo(() => {
    return Object.entries(frames)
      .map(([degree, frame]) => ({
        degree: Number(degree),
        trainRmse: frame.metrics.train.rmse,
        testRmse: frame.metrics.test.rmse,
        trainR2: frame.metrics.train.r2,
        testR2: frame.metrics.test.r2,
        trainMae: frame.metrics.train.mae,
        testMae: frame.metrics.test.mae,
        features: frame.polynomial.feature_count,
        trainingRows: frame.dataset.training_rows,
        testingRows: frame.dataset.testing_rows,
      }))
      .filter((row) => Number.isFinite(row.degree))
      .sort((a, b) => a.degree - b.degree);
  }, [frames]);

  const best = useMemo(() => {
    const eligible = rows.filter(
      (row) =>
        typeof row.testRmse === "number" &&
        Number.isFinite(row.testRmse)
    );

    if (eligible.length === 0) return null;

    return eligible.reduce((winner, current) =>
      current.testRmse < winner.testRmse
        ? current
        : winner
    );
  }, [rows]);

  const active =
    rows.find((row) => row.degree === selectedDegree) ??
    best ??
    rows[0] ??
    null;

  const complete = rows.length >= maxDegree;

  const chartData = useMemo(
  () =>
    rows.map((row) => ({
      degree: row.degree,
      train:
        metricType === "rmse"
          ? row.trainRmse
          : row.trainR2,
      test:
        metricType === "rmse"
          ? row.testRmse
          : row.testR2,
    })),
  [rows, metricType],
);

  function selectDegree(degree: number) {
    setSelectedDegree(degree);
    onSelectDegree?.(degree);
  }

  const trainTestGap = active
    ? active.testRmse - active.trainRmse
    : null;

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400">
            <BarChart3 size={21} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              ModelMind Comparison Studio
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Polynomial Degree Comparison
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
            Compare actual training and held-out test
            performance across polynomial degrees.
            Explore model complexity, generalization,
            and the bias–variance tradeoff.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          {rows.length} / {maxDegree} models evaluated
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="rounded-lg bg-slate-950 px-3 py-2">
          Dataset: {datasetName}
        </span>

        <span className="rounded-lg bg-slate-950 px-3 py-2">
          View: {viewMode.toUpperCase()}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
          Waiting for backend-trained polynomial models.
          Comparison results will appear as animation
          frames become available.
        </div>
      ) : (
        <>
          {!complete && (
            <p className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-300">
              Models are still being evaluated, or training
              stopped before all degrees completed.
              Results below cover only the degrees shown.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={17} />
                <span className="text-xs">
                  Lowest test RMSE
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-white">
                {best ? `Degree ${best.degree}` : "—"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Among evaluated degrees
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center gap-2 text-sky-400">
                <Activity size={17} />
                <span className="text-xs">
                  Lowest test RMSE value
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-white">
                {format(best?.testRmse)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Lower is better
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center gap-2 text-violet-400">
                <TrendingUp size={17} />
                <span className="text-xs">
                  Selected test R²
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-white">
                {format(active?.testR2)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Degree {active?.degree ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center gap-2 text-amber-400">
                <BrainCircuit size={17} />
                <span className="text-xs">
                  Polynomial features
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-white">
                {active?.features ?? "—"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Degree {active?.degree ?? "—"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">
                  Training vs Test Performance
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Models share the same configured train/test split.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMetricType("rmse")}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    metricType === "rmse"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  RMSE
                </button>

                <button
                  type="button"
                  onClick={() => setMetricType("r2")}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    metricType === "r2"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  R²
                </button>
              </div>
            </div>

            <div className="h-[340px] w-full min-w-0 overflow-hidden">
  <ResponsiveContainer
    width="100%"
    height={340}
    minWidth={0}
    debounce={100}
  >
    <LineChart
  data={chartData}
  margin={CHART_MARGIN}
>
                  <CartesianGrid
                    stroke="#263244"
                    strokeDasharray="4 4"
                  />

                  <XAxis
                    dataKey="degree"
                    type="number"
                    domain={[1, Math.max(1, maxDegree)]}
                    allowDecimals={false}
                    stroke="#94a3b8"
                    label={{
                      value: "Polynomial degree",
                      position: "insideBottom",
                      offset: -10,
                      fill: "#94a3b8",
                    }}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    width={65}
                    tickFormatter={(value: number) =>
                      Number(value).toPrecision(3)
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                    formatter={(value, name) => [
  typeof value === "number"
    ? value.toFixed(5)
    : Array.isArray(value)
      ? value.join(", ")
      : value == null
        ? "—"
        : String(value),
  name === "train" ? "Training" : "Testing",
]}
                  />

                  <Legend verticalAlign="top" height={36} />

                  {best && (
                    <ReferenceLine
                      x={best.degree}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                    />
                  )}

                  <Line
                    type="linear"
                    dataKey="train"
                    name="Training"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />

                  <Line
                    type="linear"
                    dataKey="test"
                    name="Testing"
                    stroke="#a78bfa"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-400">
              {metricType === "rmse"
                ? "RMSE measures prediction error in the target variable's units. Lower values are better."
                : "R² measures performance relative to predicting the mean target. Higher values are generally better; negative values are possible."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-lg font-semibold text-white">
              Select a Degree to Inspect
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {rows.map((row) => (
                <button
                  key={row.degree}
                  type="button"
                  onClick={() => selectDegree(row.degree)}
                  className={`rounded-xl border px-4 py-2 text-sm transition ${
                    active?.degree === row.degree
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-violet-500"
                  }`}
                >
                  Degree {row.degree}
                </button>
              ))}
            </div>

            {active && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Train RMSE", format(active.trainRmse)],
                  ["Test RMSE", format(active.testRmse)],
                  ["Train R²", format(active.trainR2)],
                  ["Test R²", format(active.testR2)],
                  ["Train MAE", format(active.trainMae)],
                  ["Test MAE", format(active.testMae)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <p className="text-xs text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-slate-800 text-xs text-slate-400">
                <tr>
                  <th className="p-4">Degree</th>
                  <th className="p-4">Features</th>
                  <th className="p-4">Train RMSE</th>
                  <th className="p-4">Test RMSE</th>
                  <th className="p-4">Train R²</th>
                  <th className="p-4">Test R²</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.degree}
                    className="border-b border-slate-800/70 text-slate-300"
                  >
                    <td className="p-4 font-semibold text-white">
                      {row.degree}
                    </td>
                    <td className="p-4">{row.features}</td>
                    <td className="p-4">
                      {format(row.trainRmse)}
                    </td>
                    <td className="p-4">
                      {format(row.testRmse)}
                    </td>
                    <td className="p-4">
                      {format(row.trainR2)}
                    </td>
                    <td className="p-4">
                      {format(row.testR2)}
                    </td>
                    <td className="p-4">
                      {best?.degree === row.degree ? (
                        <span className="text-emerald-400">
                          Lowest test RMSE
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Evaluated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
              <div className="flex items-center gap-2 text-sky-300">
                <Info size={18} />
                <h3 className="font-semibold">
                  Bias–Variance Intuition
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Low-degree models have limited flexibility
                and can underfit. Higher-degree models can
                capture more complex relationships but may
                also fit noise. Compare training and test
                errors rather than relying on training
                performance alone.
              </p>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex items-center gap-2 text-violet-300">
                <BrainCircuit size={18} />
                <h3 className="font-semibold">
                  Current Experiment Insight
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {active
                  ? `Degree ${active.degree} uses ${active.features} polynomial features. Its training RMSE is ${format(active.trainRmse)}, while its test RMSE is ${format(active.testRmse)}.`
                  : "Select a degree to inspect its performance."}
              </p>

              {trainTestGap !== null && (
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Test minus training RMSE:{" "}
                  {format(trainTestGap)}. A large positive
                  gap can indicate a generalization problem,
                  although it is not proof of overfitting.
                </p>
              )}
            </div>
          </div>

          <p className="text-xs leading-6 text-slate-500">
            Educational note: Choosing a degree using test
            performance repeatedly can bias the reported
            result. For rigorous model selection, use
            cross-validation on training data and reserve
            an untouched test set for final evaluation.
          </p>
        </>
      )}
    </section>
  );
}

