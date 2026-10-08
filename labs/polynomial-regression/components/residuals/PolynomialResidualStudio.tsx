
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Info,
  Target,
} from "lucide-react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Bar,
  BarChart,
  Cell,
} from "recharts";

import type {
  TrainingResponse,
} from "@/lib/api/polynomialApi";

type SplitFilter = "both" | "train" | "test";
type ChartMode = "residuals" | "actual" | "histogram";

interface Props {
  result: TrainingResponse | null;
  featureName?: string;
  targetName?: string;
  viewMode?: "2d" | "3d";
}

type Observation = TrainingResponse["predictions"][number];

interface PlotPoint {
  index: number;
  actual: number;
  predicted: number;
  residual: number;
  split: "train" | "test";
  features: Record<string, number | null>;
  x: number;
  y: number;
}

function format(value: number | null | undefined, digits = 4) {
  return value == null || !Number.isFinite(value)
    ? "—"
    : value.toFixed(digits);
}

function summarize(points: PlotPoint[]) {
  if (!points.length) {
    return {
      count: 0,
      mae: null as number | null,
      mse: null as number | null,
      rmse: null as number | null,
      meanResidual: null as number | null,
      maxAbsoluteError: null as number | null,
    };
  }

  const count = points.length;
  const sumAbsolute = points.reduce(
    (sum, point) => sum + Math.abs(point.residual),
    0
  );
  const sumSquared = points.reduce(
    (sum, point) => sum + point.residual ** 2,
    0
  );
  const sumResidual = points.reduce(
    (sum, point) => sum + point.residual,
    0
  );

  return {
    count,
    mae: sumAbsolute / count,
    mse: sumSquared / count,
    rmse: Math.sqrt(sumSquared / count),
    meanResidual: sumResidual / count,
    maxAbsoluteError: Math.max(
      ...points.map((point) => Math.abs(point.residual))
    ),
  };
}

function makeHistogram(points: PlotPoint[], binCount: number) {
  if (!points.length) return [];

  const values = points.map((point) => point.residual);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  if (minimum === maximum) {
    return [
      {
        label: format(minimum, 3),
        midpoint: minimum,
        count: values.length,
      },
    ];
  }

  const width = (maximum - minimum) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => {
    const lower = minimum + index * width;
    const upper = lower + width;

    return {
      label: `${format(lower, 2)} to ${format(upper, 2)}`,
      midpoint: (lower + upper) / 2,
      count: 0,
    };
  });

  for (const value of values) {
    const index = Math.min(
      binCount - 1,
      Math.floor((value - minimum) / width)
    );
    bins[index].count += 1;
  }

  return bins;
}

function preparePoint(
  observation: Observation,
  index: number,
  chartMode: ChartMode
): PlotPoint {
  const actual = observation.actual;
  const predicted = observation.predicted;
  const residual = observation.residual;

  return {
    index: index + 1,
    actual,
    predicted,
    residual,
    split: observation.split,
    features: observation.features,
    x: chartMode === "actual" ? actual : predicted,
    y: chartMode === "actual" ? predicted : residual,
  };
}

export default function PolynomialResidualStudio({
  result,
  featureName = "x",
  targetName = "y",
  viewMode = "2d",
}: Props) {
  const [splitFilter, setSplitFilter] =
    useState<SplitFilter>("both");

  const [chartMode, setChartMode] =
    useState<ChartMode>("residuals");

  const [binCount, setBinCount] = useState(12);

  const [selectedPoint, setSelectedPoint] =
    useState<PlotPoint | null>(null);

  const observations = result?.predictions;

  const points = useMemo(() => {
    if (!observations) return [];

    return observations
      .filter(
        (item) =>
          splitFilter === "both" ||
          item.split === splitFilter
      )
      .filter(
        (item) =>
          Number.isFinite(item.actual) &&
          Number.isFinite(item.predicted) &&
          Number.isFinite(item.residual)
      )
      .map((item, index) =>
        preparePoint(item, index, chartMode)
      );
  }, [observations, splitFilter, chartMode]);

  const trainPoints = points.filter(
    (point) => point.split === "train"
  );

  const testPoints = points.filter(
    (point) => point.split === "test"
  );

  const stats = useMemo(() => summarize(points), [points]);

  const histogram = useMemo(
    () => makeHistogram(points, binCount),
    [points, binCount]
  );

  const residualRange = useMemo(() => {
    if (!points.length) return [-1, 1] as [number, number];

    const maxAbsolute = Math.max(
      0.001,
      ...points.map((point) => Math.abs(point.residual))
    );

    return [
      -maxAbsolute * 1.15,
      maxAbsolute * 1.15,
    ] as [number, number];
  }, [points]);

  const xAxisLabel =
    chartMode === "actual"
      ? `Actual ${targetName}`
      : `Predicted ${targetName}`;

  const yAxisLabel =
    chartMode === "actual"
      ? `Predicted ${targetName}`
      : "Residual (actual - predicted)";

  function handlePointClick(data: PlotPoint) {
    setSelectedPoint(data);
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
      <div>
        <div className="flex items-center gap-2 text-violet-400">
          <Activity size={21} />
          <span className="text-xs font-semibold uppercase tracking-widest">
            ModelMind Residual Analysis Studio
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-white">
          Understand Every Prediction Error
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Explore the difference between actual and predicted
          values, identify patterns in model errors, and
          investigate how well your polynomial model
          generalizes to unseen samples.
        </p>
      </div>

      {!result ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
          Waiting for backend predictions. Train a model
          or select a valid dataset to explore residuals.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["both", "All samples"],
                ["train", "Training only"],
                ["test", "Testing only"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setSplitFilter(value);
                  setSelectedPoint(null);
                }}
                className={`rounded-xl border px-4 py-2 text-sm ${
                  splitFilter === value
                    ? "border-violet-500 bg-violet-600 text-white"
                    : "border-slate-700 bg-slate-950 text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Samples", String(stats.count)],
              ["MAE", format(stats.mae)],
              ["RMSE", format(stats.rmse)],
              ["Mean residual", format(stats.meanResidual)],
              ["Max absolute error", format(stats.maxAbsoluteError)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="text-xs text-slate-400">
                  {label}
                </p>
                <p className="mt-3 text-xl font-bold text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">
                  Interactive Error Visualization
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Click a scatter point to inspect its
                  actual and predicted values.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["residuals", "Residual plot"],
                    ["actual", "Actual vs predicted"],
                    ["histogram", "Error distribution"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setChartMode(value);
                      setSelectedPoint(null);
                    }}
                    className={`rounded-lg px-3 py-2 text-xs ${
                      chartMode === value
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {chartMode === "histogram" && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <label
                  htmlFor="residual-bin-count"
                  className="text-sm text-slate-400"
                >
                  Histogram bins: {binCount}
                </label>

                <input
                  id="residual-bin-count"
                  type="range"
                  min={5}
                  max={30}
                  value={binCount}
                  onChange={(event) =>
                    setBinCount(Number(event.target.value))
                  }
                  className="w-48 accent-violet-500"
                />
              </div>
            )}

            <div className="mt-6 h-[390px] w-full">
              {points.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No valid observations for this filter.
                </div>
              ) : chartMode === "histogram" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={histogram}
                    margin={{
                      top: 10,
                      right: 15,
                      bottom: 30,
                      left: 10,
                    }}
                  >
                    <CartesianGrid
                      stroke="#263244"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="midpoint"
                      type="category"
                      tickFormatter={(value: number) =>
                        format(value, 2)
                      }
                      stroke="#94a3b8"
                      label={{
                        value: "Residual",
                        position: "insideBottom",
                        offset: -12,
                        fill: "#94a3b8",
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 12,
                      }}
                      formatter={(value) => [
                        value == null ? "—" : String(value),
                        "Observations",
                      ]}
                      labelFormatter={(label) =>
                        `Residual midpoint: ${String(label)}`
                      }
                    />
                    <Bar
                      dataKey="count"
                      name="Observations"
                      fill="#a78bfa"
                      isAnimationActive
                    >
                      {histogram.map((bin, index) => (
                        <Cell
                          key={index}
                          fill={
                            bin.midpoint < 0
                              ? "#38bdf8"
                              : "#a78bfa"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 15,
                      right: 25,
                      bottom: 35,
                      left: 20,
                    }}
                  >
                    <CartesianGrid
                      stroke="#263244"
                      strokeDasharray="4 4"
                    />

                    <XAxis
                      type="number"
                      dataKey="x"
                      name={xAxisLabel}
                      domain={["auto", "auto"]}
                      stroke="#94a3b8"
                      tickFormatter={(value: number) =>
                        format(value, 2)
                      }
                      label={{
                        value: xAxisLabel,
                        position: "insideBottom",
                        offset: -15,
                        fill: "#94a3b8",
                      }}
                    />

                    <YAxis
                      type="number"
                      dataKey="y"
                      name={yAxisLabel}
                      domain={
                        chartMode === "residuals"
                          ? residualRange
                          : ["auto", "auto"]
                      }
                      stroke="#94a3b8"
                      width={75}
                      tickFormatter={(value: number) =>
                        format(value, 2)
                      }
                    />

                    <ZAxis range={[45, 45]} />

                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 12,
                      }}
                    />

                    {chartMode === "residuals" && (
                      <ReferenceLine
                        y={0}
                        stroke="#fbbf24"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    )}

                    <Scatter
  name="Training samples"
  data={trainPoints}
  fill="#38bdf8"
  onClick={(data) => {
  const point = data.payload as PlotPoint | undefined;
  if (point) handlePointClick(point);
}}
/>

                    <Scatter
  name="Testing samples"
  data={testPoints}
  fill="#a78bfa"
  onClick={(data) => {
  const point = data.payload as PlotPoint | undefined;
  if (point) handlePointClick(point);
}}
/>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-sky-400" />
                Training
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-violet-400" />
                Testing
              </span>
              {chartMode === "residuals" && (
                <span>
                  Dashed line = zero prediction error
                </span>
              )}
            </div>
          </div>

          {selectedPoint && chartMode !== "histogram" && (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
              <div className="flex items-center gap-2 text-violet-300">
                <Target size={19} />
                <h3 className="font-semibold">
                  Selected Observation
                </h3>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Split", selectedPoint.split],
                  ["Actual", format(selectedPoint.actual)],
                  ["Predicted", format(selectedPoint.predicted)],
                  ["Residual", format(selectedPoint.residual)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-slate-950 p-4"
                  >
                    <p className="text-xs text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(selectedPoint.features).map(
                  ([name, value]) => (
                    <span
                      key={name}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-sky-300"
                    >
                      {name}: {format(value)}
                    </span>
                  )
                )}
              </div>

              <p className="mt-4 text-sm text-slate-300">
                {selectedPoint.residual > 0
                  ? "The model underpredicted this observation: the actual value is higher than the prediction."
                  : selectedPoint.residual < 0
                    ? "The model overpredicted this observation: the actual value is lower than the prediction."
                    : "The prediction exactly matches the actual value."}
              </p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
              <div className="flex items-center gap-2 text-sky-300">
                <Info size={18} />
                <h3 className="font-semibold">
                  Understanding Residuals
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Residual = actual value − predicted value.
                A positive residual means underprediction;
                a negative residual means overprediction.
                Residuals scattered around zero without
                obvious structure are generally preferable
                to systematic curved or funnel-shaped patterns.
              </p>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex items-center gap-2 text-violet-300">
                <BrainCircuit size={18} />
                <h3 className="font-semibold">
                  Diagnostic Interpretation
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Curved residual patterns may indicate missing
                nonlinear structure. Increasing residual
                spread may suggest nonconstant error variance.
                Large isolated errors can indicate outliers.
                These are diagnostic clues, not definitive
                statistical tests.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <BarChart3 size={19} />
              <h3 className="font-semibold">
                Experiment Context
              </h3>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <p>Polynomial degree: {result.model.degree}</p>
              <p>Regression method: {result.model.regularization}</p>
              <p>Selected feature: {featureName}</p>
              <p>Target variable: {targetName}</p>
              <p>Visualization: {viewMode.toUpperCase()}</p>
              <p>Training rows: {result.dataset.training_rows}</p>
              <p>Testing rows: {result.dataset.testing_rows}</p>
              <p>Expanded features: {result.polynomial.feature_count}</p>
            </div>
          </div>

          <p className="text-xs leading-6 text-slate-500">
            Residual analysis uses predictions returned by
            the backend. Training and testing samples are
            identified separately. The combined filter is
            exploratory; use the testing filter when
            investigating held-out performance.
          </p>
        </>
      )}
    </section>
  );
}
