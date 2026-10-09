
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeftRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  LoaderCircle,
  Play,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import type { Data, Layout, Config } from "plotly.js";

import EnsembleDatasetManager, {
  initialEnsembleDatasetSelection,
  type EnsembleDatasetSelection,
} from "@/components/dataset/EnsembleDatasetManager";

import {
  ensembleDatasets,
} from "@/lib/datasets/ensembleDatasets";

import {
  buildEnsembleTrainingRequest,
  type EnsembleMetrics,
  type EnsemblePlotPoint,
  type EnsembleVisualization,
} from "@/lib/api/ensembleApi";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center text-sm text-slate-400">
      Loading interactive chart...
    </div>
  ),
});

type ViewMode = "2d" | "3d";

interface ComparisonModel {
  name: string;
  type: string;
  metrics: {
    train: EnsembleMetrics;
    test: EnsembleMetrics;
  };
  visualization: EnsembleVisualization;
}

interface ComparisonResponse {
  success: boolean;
  experiment: string;
  task: "classification" | "regression";
  dataset: {
    total_rows: number;
    valid_rows: number;
    train_rows: number;
    test_rows: number;
    features: string[];
    target: string;
  };
  single_model: ComparisonModel;
  ensemble_model: ComparisonModel;
  prediction_comparison: {
    comparison_type: string;
    test_rows: number;
    agreement_rate?: number;
    disagreement_rate?: number;
    both_correct?: number;
    both_wrong?: number;
    single_only_correct?: number;
    ensemble_only_correct?: number;
    mean_prediction_difference?: number;
    ensemble_better_rows?: number;
    single_better_rows?: number;
    prediction_examples: {
      actual: number;
      single: number;
      ensemble: number;
    }[];
  };
  explanation: string;
}

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";

const CLASS_COLORS = [
  "#818cf8",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#22d3ee",
  "#facc15",
];

const API_URL = (
  process.env.NEXT_PUBLIC_ENSEMBLE_API_URL?.trim() ||
  "http://127.0.0.1:8002"
).replace(/\/+$/, "");

function displayNumber(
  value: number | null | undefined,
  digits = 4,
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return Number(value.toFixed(digits)).toLocaleString();
}

function readMetric(
  metrics: EnsembleMetrics,
  key: string,
): number | null {
  if (key === "accuracy" && "accuracy" in metrics) {
    return metrics.accuracy;
  }

  if (key === "f1" && "f1" in metrics) {
    return metrics.f1;
  }

  if (key === "r2" && "r2" in metrics) {
    return metrics.r2;
  }

  if (key === "mae" && "mae" in metrics) {
    return metrics.mae;
  }

  if (key === "rmse" && "rmse" in metrics) {
    return metrics.rmse;
  }

  return null;
}

function classLabels(
  visualization: EnsembleVisualization,
): number[] {
  const labels = new Set<number>();

  for (const point of [
    ...visualization.train_points,
    ...visualization.test_points,
  ]) {
    if (point.actual !== null) {
      labels.add(point.actual);
    }
  }

  visualization.z_values?.forEach((row) => {
    row.forEach((value) => labels.add(value));
  });

  visualization.predictions?.forEach((value) => {
    labels.add(value);
  });

  return [...labels].sort((a, b) => a - b);
}

function generateTraces(
  visualization: EnsembleVisualization,
  task: "classification" | "regression",
  mode: ViewMode,
): Data[] {
  const traces: Data[] = [];

  const twoFeatures =
    visualization.y_feature !== null &&
    !!visualization.z_values?.length;

  const labels =
    task === "classification"
      ? classLabels(visualization)
      : [];

  const z = visualization.z_values ?? [];

  if (twoFeatures) {
    if (mode === "3d") {
      if (task === "regression") {
        traces.push({
          type: "surface",
          x: visualization.x_values,
          y: visualization.y_values,
          z,
          colorscale: [
            [0, "#2563eb"],
            [0.5, "#8b5cf6"],
            [1, "#f59e0b"],
          ],
          opacity: 0.78,
          showscale: true,
          name: "Fitted prediction surface",
          hovertemplate:
            "X: %{x:.3f}<br>Y: %{y:.3f}<br>Prediction: %{z:.3f}<extra></extra>",
        } as Data);
      } else {
        const count = Math.max(labels.length, 1);

        const colorscale: [number, string][] = [];

        for (let i = 0; i < count; i++) {
          const color =
            CLASS_COLORS[i % CLASS_COLORS.length];

          colorscale.push([i / count, color]);
          colorscale.push([(i + 1) / count, color]);
        }

        const indices = z.map((row) =>
          row.map((value) =>
            Math.max(0, labels.indexOf(value)),
          ),
        );

        traces.push({
          type: "surface",
          x: visualization.x_values,
          y: visualization.y_values,
          z: z.map((row) => row.map(() => 0)),
          surfacecolor: indices,
          colorscale,
          cmin: -0.5,
          cmax: count - 0.5,
          showscale: false,
          opacity: 0.75,
          name: "Predicted class regions",
          hovertemplate:
            "X: %{x:.3f}<br>Y: %{y:.3f}<br>Class index: %{surfacecolor:.0f}<extra></extra>",
        } as Data);
      }
    } else {
      traces.push({
        type: "heatmap",
        x: visualization.x_values,
        y: visualization.y_values,
        z:
          task === "classification"
            ? z.map((row) =>
                row.map((value) =>
                  Math.max(0, labels.indexOf(value)),
                ),
              )
            : z,
        colorscale:
          task === "classification"
            ? [
                [0, "#818cf8"],
                [0.5, "#34d399"],
                [1, "#fb923c"],
              ]
            : [
                [0, "#2563eb"],
                [0.5, "#8b5cf6"],
                [1, "#f59e0b"],
              ],
        showscale: task === "regression",
        opacity: 0.55,
        name: "Model predictions",
        hovertemplate:
          "X: %{x:.3f}<br>Y: %{y:.3f}<br>Prediction value/index: %{z}<extra></extra>",
      } as Data);
    }
  } else {
    traces.push({
      type: "scatter",
      mode: "lines",
      x: visualization.x_values,
      y: visualization.predictions ?? [],
      line: {
        color: "#a78bfa",
        width: 3,
        shape:
          task === "classification" ? "hv" : "linear",
      },
      name: "Fitted model",
      hovertemplate:
        "Feature: %{x:.3f}<br>Prediction: %{y:.3f}<extra></extra>",
    } as Data);
  }

  function addObservations(
    points: EnsemblePlotPoint[],
    group: string,
    isTest: boolean,
  ) {
    const valid = points.filter(
      (point) =>
        point.x !== null &&
        point.actual !== null &&
        (!twoFeatures ||
          (point.y !== null && point.y !== undefined)),
    );

    if (!valid.length) return;

    const pointGroups =
      task === "classification"
        ? labels
        : [0];

    for (const label of pointGroups) {
      const subset =
        task === "classification"
          ? valid.filter((point) => point.actual === label)
          : valid;

      if (!subset.length) continue;

      const color =
        task === "classification"
          ? CLASS_COLORS[
              Math.max(0, labels.indexOf(label)) %
                CLASS_COLORS.length
            ]
          : isTest
            ? "#fbbf24"
            : "#38bdf8";

      const x = subset.map((point) => point.x);
      const y = subset.map((point) =>
        twoFeatures ? point.y : point.actual,
      );

      const description = subset.map(
        (point) =>
          `Actual: ${displayNumber(point.actual)}` +
          (point.predicted === undefined
            ? ""
            : `<br>Predicted: ${displayNumber(
                point.predicted,
              )}`),
      );

      const name =
        task === "classification"
          ? `${group} · Class ${label}`
          : group;

      if (mode === "3d" && twoFeatures) {
        traces.push({
          type: "scatter3d",
          mode: "markers",
          x,
          y,
          z: subset.map((point) =>
            task === "classification"
              ? isTest
                ? 0.12
                : 0.06
              : point.actual,
          ),
          text: description,
          name,
          marker: {
            size: isTest ? 5 : 3,
            color,
            symbol: isTest ? "diamond" : "circle",
            opacity: isTest ? 1 : 0.85,
          },
          hovertemplate:
            "X: %{x:.3f}<br>Y: %{y:.3f}<br>%{text}<extra></extra>",
        } as Data);
      } else {
        traces.push({
          type: "scatter",
          mode: "markers",
          x,
          y,
          text: description,
          name,
          marker: {
            size: isTest ? 9 : 6,
            color,
            symbol: isTest ? "diamond-open" : "circle",
            opacity: isTest ? 1 : 0.8,
            line: { width: isTest ? 2 : 0 },
          },
          hovertemplate:
            "X: %{x:.3f}<br>Y: %{y:.3f}<br>%{text}<extra></extra>",
        } as Data);
      }
    }
  }

  addObservations(
    visualization.train_points,
    "Train",
    false,
  );

  addObservations(
    visualization.test_points,
    "Test",
    true,
  );

  return traces;
}

function ModelChart({
  model,
  task,
  target,
  mode,
}: {
  model: ComparisonModel;
  task: "classification" | "regression";
  target: string;
  mode: ViewMode;
}) {
  const visualization = model.visualization;

  const twoFeatures =
    visualization.y_feature !== null &&
    !!visualization.z_values?.length;

  const actualMode =
    mode === "3d" && !twoFeatures
      ? "2d"
      : mode;

  const traces = useMemo(
    () =>
      generateTraces(
        visualization,
        task,
        actualMode,
      ),
    [visualization, task, actualMode],
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      paper_bgcolor: "#080f1d",
      plot_bgcolor: "#101a2c",
      font: {
        color: "#cbd5e1",
        family: "Arial, sans-serif",
      },
      margin:
        actualMode === "3d"
          ? { l: 5, r: 5, t: 15, b: 5 }
          : { l: 60, r: 20, t: 15, b: 55 },
      legend: {
        orientation: "h",
        x: 0,
        y: -0.25,
        font: { size: 10 },
      },
      showlegend: true,
      ...(actualMode === "2d"
        ? {
            xaxis: {
              title: { text: visualization.x_feature },
              gridcolor: "#263246",
              zerolinecolor: "#475569",
            },
            yaxis: {
              title: {
                text:
                  visualization.y_feature ?? target,
              },
              gridcolor: "#263246",
              zerolinecolor: "#475569",
            },
          }
        : {
            scene: {
              bgcolor: "#080f1d",
              xaxis: {
                title: { text: visualization.x_feature },
                color: "#cbd5e1",
                gridcolor: "#334155",
              },
              yaxis: {
                title: {
                  text:
                    visualization.y_feature ?? "Feature 2",
                },
                color: "#cbd5e1",
                gridcolor: "#334155",
              },
              zaxis: {
                title: {
                  text:
                    task === "classification"
                      ? "Class regions"
                      : target,
                },
                color: "#cbd5e1",
                gridcolor: "#334155",
                ...(task === "classification"
                  ? { range: [-0.08, 0.25] as [number, number] }
                  : {}),
              },
              camera: {
                eye: { x: 1.5, y: 1.5, z: 1.1 },
              },
            },
          }),
      uirevision: `${model.type}-${actualMode}`,
    }),
    [visualization, actualMode, task, target, model.type],
  );

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
  };

  return (
    <div className="min-w-0 rounded-2xl border border-slate-800 bg-[#080f1d] p-3">
      <Plot
        data={traces}
        layout={layout}
        config={config}
        useResizeHandler
        style={{
          width: "100%",
          height: actualMode === "3d" ? 480 : 410,
        }}
      />
      {mode === "3d" && !twoFeatures && (
        <p className="pb-3 text-center text-xs text-amber-300">
          Select two input features for a 3D surface.
        </p>
      )}
    </div>
  );
}

function MetricsPanel({
  single,
  ensemble,
  task,
}: {
  single: ComparisonModel;
  ensemble: ComparisonModel;
  task: "classification" | "regression";
}) {
  const keys =
    task === "classification"
      ? [
          { id: "accuracy", label: "Accuracy", higher: true },
          { id: "f1", label: "Weighted F1", higher: true },
        ]
      : [
          { id: "r2", label: "R²", higher: true },
          { id: "mae", label: "MAE", higher: false },
          { id: "rmse", label: "RMSE", higher: false },
        ];

  return (
    <section className={panel}>
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-violet-400" />
        <h3 className="text-xl font-bold">
          Held-Out Test Performance
        </h3>
      </div>

      <p className="mt-2 text-sm leading-7 text-slate-400">
        Both models use the same training and test rows.
        Compare the test metrics rather than assuming the
        ensemble must perform better.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="px-3 py-3">Metric</th>
              <th className="px-3 py-3">Single Tree</th>
              <th className="px-3 py-3">Ensemble</th>
              <th className="px-3 py-3">Better</th>
            </tr>
          </thead>

          <tbody>
            {keys.map((key) => {
              const a = readMetric(
                single.metrics.test,
                key.id,
              );
              const b = readMetric(
                ensemble.metrics.test,
                key.id,
              );

              const winner =
                a === null || b === null
                  ? "N/A"
                  : Math.abs(a - b) < 1e-9
                    ? "Tie"
                    : (key.higher ? a > b : a < b)
                      ? "Single"
                      : "Ensemble";

              return (
                <tr
                  key={key.id}
                  className="border-t border-slate-800"
                >
                  <td className="px-3 py-4 text-slate-300">
                    {key.label}
                  </td>
                  <td className="px-3 py-4 font-mono">
                    {displayNumber(a)}
                  </td>
                  <td className="px-3 py-4 font-mono">
                    {displayNumber(b)}
                  </td>
                  <td
                    className={`px-3 py-4 font-medium ${
                      winner === "Ensemble"
                        ? "text-emerald-300"
                        : winner === "Single"
                          ? "text-sky-300"
                          : "text-slate-400"
                    }`}
                  >
                    {winner}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function EnsembleComparisonStudio() {
  const [selection, setSelection] =
    useState<EnsembleDatasetSelection>(
      initialEnsembleDatasetSelection,
    );

  const [estimators, setEstimators] = useState(50);
  const [maxDepth, setMaxDepth] = useState(5);
  const [testSize, setTestSize] = useState(0.2);
  const [mode, setMode] = useState<ViewMode>("2d");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [trained, setTrained] = useState<{
    signature: string;
    result: ComparisonResponse;
  } | null>(null);

  const controllerRef = useRef<AbortController | null>(
    null,
  );

  const builtin =
    ensembleDatasets.find(
      (dataset) => dataset.id === selection.datasetId,
    ) ?? ensembleDatasets[0];

  const rows =
    selection.uploadedDataset?.rows ?? builtin.rows;

  const signature = JSON.stringify({
    dataset:
      selection.uploadedDataset?.id ??
      selection.datasetId,
    features: selection.features,
    target: selection.target,
    task: selection.task,
    missing: selection.missingStrategy,
    estimators,
    maxDepth,
    testSize,
  });

  const result =
    trained?.signature === signature
      ? trained.result
      : null;

  const ready =
    rows.length >= 20 &&
    selection.features.length >= 1 &&
    !!selection.target &&
    !selection.features.includes(selection.target);

  const supports3D = selection.features.length >= 2;

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);
  useEffect(() => {
  if (!ready) return;

  const timer = window.setTimeout(() => {
    void trainComparison();
  }, 500);

  return () => {
    window.clearTimeout(timer);
    controllerRef.current?.abort();
  };

  // This effect is intentionally tied to the experiment signature.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [signature, ready]);

  async function trainComparison() {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError("");
    setTrained(null);

    try {
      const payload = buildEnsembleTrainingRequest(
        selection,
        rows,
        {
          model: "random-forest",
          nEstimators: estimators,
          maxDepth,
          learningRate: 0.1,
          testSize,
          gridResolution: 35,
        },
      );

      const response = await fetch(
        `${API_URL}/api/ensemble/overview/compare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
          cache: "no-store",
        },
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "detail" in data &&
          typeof data.detail === "string"
            ? data.detail
            : `Comparison API returned HTTP ${response.status}.`;

        throw new Error(message);
      }

      if (
        !data ||
        typeof data !== "object" ||
        !("success" in data) ||
        data.success !== true
      ) {
        throw new Error(
          "Unexpected response from comparison API.",
        );
      }

      if (!controller.signal.aborted) {
        setTrained({
          signature,
          result: data as ComparisonResponse,
        });
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to train comparison models.",
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  function resetResults() {
    controllerRef.current?.abort();
    setLoading(false);
    setError("");
    setTrained(null);
  }

  const agreement =
    result?.prediction_comparison;

  const accuracyDifference =
    result?.task === "classification"
      ? (() => {
          const a = readMetric(
            result.single_model.metrics.test,
            "accuracy",
          );
          const b = readMetric(
            result.ensemble_model.metrics.test,
            "accuracy",
          );

          return a !== null && b !== null
            ? b - a
            : null;
        })()
      : null;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="flex items-center gap-2 text-violet-300">
          <ArrowLeftRight size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind / Practical Experiment
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold">
          One Model vs Multiple Models
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Train a single Decision Tree and a Random Forest
          ensemble using exactly the same dataset. Compare
          their fitted predictions, generalization metrics,
          and agreement to understand when combining
          learners helps.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-5">
          <section className={panel}>
            <EnsembleDatasetManager
              value={selection}
              onChange={(next) => {
                setSelection(next);
                setError("");
                setTrained(null);
              }}
            />
          </section>

          <section className={panel}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <SlidersHorizontal
                size={19}
                className="text-violet-400"
              />
              Experiment Controls
            </h3>

            <label className="mt-6 block text-sm">
              Ensemble Trees:{" "}
              <strong className="text-violet-300">
                {estimators}
              </strong>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={estimators}
                onChange={(event) =>
                  setEstimators(Number(event.target.value))
                }
                className="mt-3 w-full accent-violet-500"
              />
            </label>

            <label className="mt-6 block text-sm">
              Maximum Tree Depth:{" "}
              <strong className="text-violet-300">
                {maxDepth}
              </strong>
              <input
                type="range"
                min={1}
                max={20}
                value={maxDepth}
                onChange={(event) =>
                  setMaxDepth(Number(event.target.value))
                }
                className="mt-3 w-full accent-violet-500"
              />
            </label>

            <label className="mt-6 block text-sm">
              Test Split:{" "}
              <strong className="text-violet-300">
                {Math.round(testSize * 100)}%
              </strong>
              <input
                type="range"
                min={0.1}
                max={0.4}
                step={0.05}
                value={testSize}
                onChange={(event) =>
                  setTestSize(Number(event.target.value))
                }
                className="mt-3 w-full accent-violet-500"
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!ready || loading}
                onClick={() => void trainComparison()}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-40"
              >
                {loading ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Play size={17} />
                )}
                {loading ? "Training..." : "Compare Models"}
              </button>

              <button
                type="button"
                onClick={resetResults}
                className="rounded-xl border border-slate-700 p-3 text-slate-300"
                title="Reset experiment results"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 flex gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}
          </section>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <BrainCircuit
                    size={20}
                    className="text-sky-400"
                  />
                  Model Comparison Visualizer
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Side-by-side fitted predictions.
                </p>
              </div>

              <div className="flex gap-2">
                {(["2d", "3d"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={
                      option === "3d" && !supports3D
                    }
                    onClick={() => setMode(option)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40 ${
                      mode === option
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {!result && (
              <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
                {loading ? (
                  <LoaderCircle
                    size={38}
                    className="animate-spin text-violet-400"
                  />
                ) : (
                  <Database
                    size={38}
                    className="text-violet-400"
                  />
                )}

                <h4 className="mt-4 text-lg font-bold">
                  {loading
                    ? "Training both models..."
                    : "Ready to Compare"}
                </h4>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                  Select a dataset, configure the experiment,
                  and click Compare Models to display
                  real decision regions or regression surfaces.
                </p>
              </div>
            )}

            {result && (
              <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-2">
                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-sky-400" />
                    <h4 className="text-lg font-bold">
                      Single Decision Tree
                    </h4>
                  </div>
                  <ModelChart
                    model={result.single_model}
                    task={result.task}
                    target={result.dataset.target}
                    mode={mode}
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-violet-400" />
                    <h4 className="text-lg font-bold">
                      Random Forest Ensemble
                    </h4>
                  </div>
                  <ModelChart
                    model={result.ensemble_model}
                    task={result.task}
                    target={result.dataset.target}
                    mode={mode}
                  />
                </div>
              </div>
            )}
          </section>

          {result && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className={panel}>
                  <p className="text-xs text-slate-400">
                    Training Rows
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {result.dataset.train_rows}
                  </p>
                </div>

                <div className={panel}>
                  <p className="text-xs text-slate-400">
                    Test Rows
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {result.dataset.test_rows}
                  </p>
                </div>

                <div className={panel}>
                  <p className="text-xs text-slate-400">
                    Input Features
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {result.dataset.features.length}
                  </p>
                </div>
              </div>

              <MetricsPanel
                single={result.single_model}
                ensemble={result.ensemble_model}
                task={result.task}
              />

              <section className={panel}>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <Activity
                    size={20}
                    className="text-emerald-400"
                  />
                  What Did We Learn?
                </h3>

                {result.task === "classification" ? (
                  <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                    <p>
                      The models agree on{" "}
                      <strong className="text-white">
                        {displayNumber(
                          (agreement?.agreement_rate ?? 0) * 100,
                          2,
                        )}%
                      </strong>{" "}
                      of test predictions.
                    </p>

                    <p>
                      The ensemble alone correctly predicted{" "}
                      <strong className="text-emerald-300">
                        {agreement?.ensemble_only_correct ?? 0}
                      </strong>{" "}
                      test samples where the single model was wrong.
                    </p>

                    <p>
                      The single model alone correctly predicted{" "}
                      <strong className="text-sky-300">
                        {agreement?.single_only_correct ?? 0}
                      </strong>{" "}
                      samples where the ensemble was wrong.
                    </p>

                    {accuracyDifference !== null && (
                      <p className="rounded-xl bg-slate-950 p-4">
                        Ensemble accuracy difference:{" "}
                        <strong
                          className={
                            accuracyDifference > 0
                              ? "text-emerald-300"
                              : accuracyDifference < 0
                                ? "text-rose-300"
                                : "text-slate-200"
                          }
                        >
                          {accuracyDifference > 0 ? "+" : ""}
                          {displayNumber(
                            accuracyDifference * 100,
                            2,
                          )} percentage points
                        </strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                    <p>
                      Average absolute difference between
                      model predictions:{" "}
                      <strong className="text-white">
                        {displayNumber(
                          agreement?.mean_prediction_difference,
                        )}
                      </strong>
                    </p>

                    <p>
                      Ensemble predictions had smaller errors
                      on{" "}
                      <strong className="text-emerald-300">
                        {agreement?.ensemble_better_rows ?? 0}
                      </strong>{" "}
                      test rows.
                    </p>

                    <p>
                      The single model had smaller errors on{" "}
                      <strong className="text-sky-300">
                        {agreement?.single_better_rows ?? 0}
                      </strong>{" "}
                      test rows.
                    </p>
                  </div>
                )}

                <p className="mt-5 flex items-start gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm leading-7 text-slate-300">
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-violet-300"
                  />
                  {result.explanation}
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
