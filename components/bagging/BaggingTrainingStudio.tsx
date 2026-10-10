
"use client";
import BaggingTrainingPlayback, {
  type BaggingPlaybackStage,
} from "@/components/bagging/BaggingTrainingPlayback";
import BaggingInteractiveGraphs, {
  type BaggingGraphSurface,
} from "@/components/bagging/BaggingInteractiveGraphs";

import BaggingDiversityStudio, {
  type BaggingDiversityResult,
} from "@/components/bagging/BaggingDiversityStudio";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Papa from "papaparse";
import type { Data, Layout } from "plotly.js";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Database,
  FileUp,
  LoaderCircle,
  Play,
  SlidersHorizontal,
} from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type Task = "classification" | "regression";
type Row = Record<string, number | null>;
type View = "2d" | "3d";

type Metrics = {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  r2?: number;
  mae?: number;
  rmse?: number;
};

type Point = {
  x: number | null;
  y: number | null;
  actual: number;
  predicted: number;
};

type Visualization = {
  type: string;
  x_feature: string;
  y_feature: string | null;
  x_values: number[];
  y_values: number[];
  z_values: number[][] | null;
  predictions: number[] | null;
  train_points: Point[];
  test_points: Point[];
};
function toInteractiveSurface(
  visualization: Visualization,
): BaggingGraphSurface | null {
  const {
    x_values,
    y_values,
    z_values,
    train_points,
    test_points,
  } = visualization;

  // A two-feature surface requires a real 2D prediction grid.
  if (
    !visualization.y_feature ||
    !z_values ||
    x_values.length < 2 ||
    y_values.length < 2 ||
    z_values.length !== y_values.length ||
    !z_values.every(
      (row) =>
        row.length === x_values.length &&
        row.every(Number.isFinite),
    )
  ) {
    return null;
  }

  const convertPoints = (points: Point[]) =>
    points
      .filter(
        (point) =>
          point.x !== null &&
          point.y !== null &&
          Number.isFinite(point.x) &&
          Number.isFinite(point.y) &&
          Number.isFinite(point.actual),
      )
      .map((point) => [
        point.x as number,
        point.y as number,
        point.actual,
      ]);

  return {
    x: x_values,
    y: y_values,
    z: z_values,
    train_points: convertPoints(train_points),
    test_points: convertPoints(test_points),
  };
}

type FittedModel = {
  name: string;
  train_metrics: Metrics;
  test_metrics: Metrics;
  visualization: Visualization;
  oob_score?: number | null;
};

type BaggingResult = {
  success: boolean;
  task: Task;
  training_progression?: BaggingPlaybackStage[];
  surface_playback?: {
  total_learners: number;
  x_values: number[];
  y_values: number[];
  z_values: number[][];
}[];
  learner_diversity?: BaggingDiversityResult;
  dataset: {
    train_rows: number;
    test_rows: number;
    features: string[];
    target: string;
  };
  single_model: FittedModel;
  bagging_model: FittedModel;
  bootstrap_previews: {
    learner: number;
    sample_count: number;
    unique_count: number;
    oob_count: number;
  }[];
  prediction_comparison: {
    agreement_rate?: number;
    ensemble_only_correct?: number;
    single_only_correct?: number;
    mean_prediction_difference?: number;
    ensemble_better_rows?: number;
    single_better_rows?: number;
  };
  warnings: string[];
};

const API =
  process.env.NEXT_PUBLIC_BAGGING_API_URL ||
  "http://127.0.0.1:8003";

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/85 p-5";

const colors = [
  "#818cf8",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#38bdf8",
  "#facc15",
];

function builtinDataset(id: string): {
  task: Task;
  rows: Row[];
  features: string[];
  target: string;
} {
  const rows: Row[] = [];

  for (let i = 0; i < 180; i++) {
    const x = ((i * 37) % 181) / 18 - 5;
    const y = ((i * 73) % 179) / 18 - 5;

    if (id === "wave") {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target:
          2 * Math.sin(x) +
          0.4 * y +
          0.05 * Math.cos(i * 7),
      });
    } else if (id === "nonlinear") {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target:
          x * x * 0.25 +
          Math.sin(y) * 2 +
          0.05 * Math.sin(i * 3),
      });
    } else if (id === "xor") {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target: x * y >= 0 ? 1 : 0,
      });
    } else {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target: x * x + y * y < 10 ? 1 : 0,
      });
    }
  }

  return {
    task:
      id === "wave" || id === "nonlinear"
        ? "regression"
        : "classification",
    rows,
    features: ["Feature1", "Feature2"],
    target: "Target",
  };
}

function fmt(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A";
  if (!Number.isFinite(value)) return "N/A";
  return value.toFixed(4);
}

function metricEntries(
  metric: Metrics,
  task: Task,
): [string, number | undefined][] {
  if (task === "classification") {
    return [
      ["Accuracy", metric.accuracy],
      ["Precision", metric.precision],
      ["Recall", metric.recall],
      ["F1 Score", metric.f1],
    ];
  }

  return [
    ["R²", metric.r2],
    ["MAE", metric.mae],
    ["RMSE", metric.rmse],
  ];
}

function BaggingChart({
  model,
  task,
  view,
}: {
  model: FittedModel;
  task: Task;
  view: View;
}) {
  const v = model.visualization;
  const surfaceAvailable =
    !!v.y_feature && !!v.z_values?.length;

  const actualView =
    view === "3d" && surfaceAvailable
      ? "3d"
      : "2d";

  const traces = useMemo<Data[]>(() => {
    const result: Data[] = [];
    const classification = task === "classification";

    const labels = [
      ...new Set([
        ...v.train_points.map((p) => p.actual),
        ...v.test_points.map((p) => p.actual),
        ...(v.z_values?.flat() ?? []),
      ]),
    ].sort((a, b) => a - b);

    const classIndex = (value: number) =>
      Math.max(0, labels.indexOf(value));

    const scale: [number, string][] = [];

    const count = Math.max(labels.length, 1);

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];

      scale.push([i / count, color]);
      scale.push([(i + 1) / count, color]);
    }

    if (surfaceAvailable && v.z_values) {
      if (actualView === "3d") {
        result.push({
          type: "surface",
          x: v.x_values,
          y: v.y_values,
          z: classification
            ? v.z_values.map((row) =>
                row.map(classIndex),
              )
            : v.z_values,
          colorscale: classification
            ? scale
            : "Viridis",
          showscale: !classification,
          opacity: 0.82,
          name: "Fitted surface",
        } as Data);
      } else {
        result.push({
          type: "heatmap",
          x: v.x_values,
          y: v.y_values,
          z: classification
            ? v.z_values.map((row) =>
                row.map(classIndex),
              )
            : v.z_values,
          colorscale: classification
            ? scale
            : "Viridis",
          showscale: !classification,
          opacity: 0.55,
          name: "Predicted region",
        } as Data);
      }
    } else {
      result.push({
        type: "scatter",
        mode: "lines",
        x: v.x_values,
        y: v.predictions ?? [],
        name: "Fitted prediction",
        line: {
          color: "#a78bfa",
          width: 3,
          shape: classification ? "hv" : "linear",
        },
      } as Data);
    }

    for (const group of [
      { name: "Train", points: v.train_points },
      { name: "Test", points: v.test_points },
    ]) {
      if (!group.points.length) continue;

      const subsets = classification
        ? labels.map((label) => ({
            label,
            points: group.points.filter(
              (point) => point.actual === label,
            ),
          }))
        : [{ label: 0, points: group.points }];

      for (const subset of subsets) {
        if (!subset.points.length) continue;

        const color = classification
          ? colors[classIndex(subset.label) % colors.length]
          : group.name === "Train"
            ? "#38bdf8"
            : "#fbbf24";

        const name = classification
          ? `${group.name} · Class ${subset.label}`
          : group.name;

        const marker = {
          size: group.name === "Train" ? 4 : 7,
          color,
          opacity: 0.85,
        };

        if (actualView === "3d") {
          result.push({
            type: "scatter3d",
            mode: "markers",
            name,
            x: subset.points.map((p) => p.x),
            y: subset.points.map((p) => p.y),
            z: subset.points.map((p) =>
              classification
                ? classIndex(p.actual)
                : p.actual,
            ),
            marker,
          } as Data);
        } else {
          result.push({
            type: "scatter",
            mode: "markers",
            name,
            x: subset.points.map((p) => p.x),
            y: subset.points.map((p) =>
              surfaceAvailable ? p.y : p.actual,
            ),
            marker,
          } as Data);
        }
      }
    }

    return result;
  }, [v, actualView, task, surfaceAvailable]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      margin:
        actualView === "3d"
          ? { l: 0, r: 0, t: 12, b: 0 }
          : { l: 60, r: 15, t: 12, b: 60 },
      paper_bgcolor: "#0a1020",
      plot_bgcolor: "#111b30",
      font: { color: "#cbd5e1" },
      legend: {
        orientation: "h",
        y: -0.25,
        font: { size: 10 },
      },
      xaxis: {
        title: { text: v.x_feature },
        gridcolor: "#334155",
      },
      yaxis: {
        title: {
          text: v.y_feature ?? "Target",
        },
        gridcolor: "#334155",
      },
      scene: {
        xaxis: { title: { text: v.x_feature } },
        yaxis: {
          title: { text: v.y_feature ?? "Feature 2" },
        },
        zaxis: {
          title: {
            text:
              task === "classification"
                ? "Class index"
                : "Prediction",
          },
        },
      },
    }),
    [actualView, task, v],
  );

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-[#0a1020] p-2">
      <Plot
        data={traces}
        layout={layout}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
        }}
        useResizeHandler
        style={{
          width: "100%",
          height: actualView === "3d" ? 470 : 390,
        }}
      />

      {view === "3d" && !surfaceAvailable && (
        <p className="pb-3 text-center text-xs text-amber-300">
          Select two features to view a 3D surface.
        </p>
      )}
    </div>
  );
}

export default function BaggingTrainingStudio() {
  const [datasetId, setDatasetId] = useState("circles");
  const [upload, setUpload] = useState<Row[] | null>(null);
  const [task, setTask] = useState<Task>("classification");
  const [features, setFeatures] = useState([
    "Feature1",
    "Feature2",
  ]);
  const [target, setTarget] = useState("Target");

  const [estimators, setEstimators] = useState(30);
  const [depth, setDepth] = useState(5);
  const [sampleFraction, setSampleFraction] = useState(1);
  const [featureFraction, setFeatureFraction] = useState(1);
  const [bootstrap, setBootstrap] = useState(true);
  const [bootstrapFeatures, setBootstrapFeatures] =
    useState(false);

  const [view, setView] = useState<View>("2d");
  const [playbackLearners, setPlaybackLearners] =
  useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BaggingResult | null>(
    null,
  );

  const builtin = useMemo(
    () => builtinDataset(datasetId),
    [datasetId],
  );

  const rows = upload ?? builtin.rows;

  const columns = useMemo(
    () =>
      rows.length
        ? Object.keys(rows[0]).filter((column) =>
            rows.some(
              (row) =>
                typeof row[column] === "number" &&
                Number.isFinite(row[column]),
            ),
          )
        : [],
    [rows],
  );

  function resetResult() {
    setResult(null);
    setError("");
  }

  function selectBuiltin(id: string) {
    const data = builtinDataset(id);

    setDatasetId(id);
    setUpload(null);
    setTask(data.task);
    setFeatures(data.features);
    setTarget(data.target);
    resetResult();
  }

  function uploadCSV(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        if (parsed.errors.length) {
          setError(parsed.errors[0].message);
          return;
        }

        const headers = parsed.meta.fields ?? [];

        const parsedRows: Row[] = parsed.data.map(
          (row) => {
            const output: Row = {};

            for (const column of headers) {
              const raw = row[column]?.trim() ?? "";
              const value = Number(raw);

              output[column] =
                raw === "" || !Number.isFinite(value)
                  ? null
                  : value;
            }

            return output;
          },
        );

        const numericColumns = headers.filter(
          (column) =>
            parsedRows.some(
              (row) => row[column] !== null,
            ),
        );

        if (
          parsedRows.length < 20 ||
          numericColumns.length < 2
        ) {
          setError(
            "CSV needs at least 20 rows and two numeric columns.",
          );
          return;
        }

        const nextTarget =
          numericColumns[numericColumns.length - 1];

        setUpload(parsedRows);
        setTarget(nextTarget);
        setFeatures(
          numericColumns
            .filter((column) => column !== nextTarget)
            .slice(0, 2),
        );
        setTask("regression");
        resetResult();
      },
      error: (cause: Error) => {
        setError(cause.message);
      },
    });
  }

  function toggleFeature(column: string) {
    setFeatures((previous) =>
      previous.includes(column)
        ? previous.filter((name) => name !== column)
        : [...previous, column],
    );

    resetResult();
  }

  async function train() {
    if (
      loading ||
      !features.length ||
      !target ||
      features.includes(target)
    ) {
      return;
    }

    setLoading(true);
    resetResult();

    try {
      const response = await fetch(
        `${API}/api/bagging/train`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task,
            rows,
            features,
            target,
            missing_strategy: "median",
            n_estimators: estimators,
            max_depth: depth,
            max_samples: sampleFraction,
            max_features: featureFraction,
            bootstrap,
            bootstrap_features: bootstrapFeatures,
            test_size: 0.2,
            random_state: 42,
            grid_resolution: 35,
          }),
        },
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        if (
          data &&
          typeof data === "object" &&
          "detail" in data
        ) {
          throw new Error(String(data.detail));
        }

        throw new Error(`API error: HTTP ${response.status}`);
      }

      setResult(data as BaggingResult);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to train the models.",
      );
    } finally {
      setLoading(false);
    }
  }

  function Slider({
    label,
    value,
    min,
    max,
    step,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
  }) {
    return (
      <label className="block space-y-3">
        <span className="flex justify-between gap-3 text-sm">
          <span>{label}</span>
          <strong className="text-violet-300">
            {value}
          </strong>
        </span>
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            onChange(Number(event.target.value));
            resetResult();
          }}
          className="w-full accent-violet-500"
        />
      </label>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/20 via-slate-900 to-slate-950 p-7 md:p-10">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-300">
          <BrainCircuit size={18} />
          ModelMind · Real Machine Learning Experiment
        </p>

        <h2 className="mt-5 text-3xl font-bold md:text-4xl">
          Bagging Training & Comparison Studio
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Train a single Decision Tree and a Bagging ensemble
          on the same dataset. Compare actual predictions,
          evaluate generalization, and explore how bootstrap
          sampling affects ensemble performance.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className={panel}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Database size={19} className="text-sky-400" />
              Dataset Manager
            </h3>

            <label className="mt-5 block text-sm">
              Built-in Dataset
              <select
                value={upload ? "uploaded" : datasetId}
                onChange={(event) =>
                  selectBuiltin(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
              >
                {upload && (
                  <option value="uploaded">
                    Uploaded CSV
                  </option>
                )}
                <option value="circles">
                  Circular Classification
                </option>
                <option value="xor">
                  XOR Classification
                </option>
                <option value="wave">
                  Nonlinear Wave Regression
                </option>
                <option value="nonlinear">
                  Nonlinear Regression
                </option>
              </select>
            </label>

            <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-violet-500/50 bg-violet-500/5 p-4 text-sm text-violet-200">
              <FileUp size={18} />
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadCSV(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>

            <p className="mt-3 text-xs text-slate-400">
              {rows.length} data rows · {columns.length} numeric columns
            </p>

            <label className="mt-5 block text-sm">
              Learning Task
              <select
                value={task}
                onChange={(event) => {
                  setTask(event.target.value as Task);
                  resetResult();
                }}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
              >
                <option value="classification">
                  Classification
                </option>
                <option value="regression">
                  Regression
                </option>
              </select>
            </label>

            <label className="mt-5 block text-sm">
              Target Column
              <select
                value={target}
                onChange={(event) => {
                  const next = event.target.value;
                  setTarget(next);
                  setFeatures((old) =>
                    old.filter((name) => name !== next),
                  );
                  resetResult();
                }}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
              >
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-5 text-sm font-semibold">
              Select Input Features
            </p>

            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {columns
                .filter((column) => column !== target)
                .map((column) => (
                  <label
                    key={column}
                    className="flex items-center gap-3 rounded-lg bg-slate-950 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={features.includes(column)}
                      onChange={() => toggleFeature(column)}
                      className="accent-violet-500"
                    />
                    {column}
                  </label>
                ))}
            </div>
          </section>

          <section className={`${panel} space-y-6`}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <SlidersHorizontal
                size={19}
                className="text-violet-400"
              />
              Bagging Hyperparameters
            </h3>

            <Slider
              label="Number of Learners"
              value={estimators}
              min={2}
              max={150}
              step={1}
              onChange={setEstimators}
            />

            <Slider
              label="Tree Maximum Depth"
              value={depth}
              min={1}
              max={20}
              step={1}
              onChange={setDepth}
            />

            <Slider
              label="Sample Fraction"
              value={sampleFraction}
              min={0.1}
              max={1}
              step={0.05}
              onChange={setSampleFraction}
            />

            <Slider
              label="Feature Fraction"
              value={featureFraction}
              min={0.1}
              max={1}
              step={0.05}
              onChange={setFeatureFraction}
            />

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={bootstrap}
                onChange={(event) => {
                  setBootstrap(event.target.checked);
                  resetResult();
                }}
                className="accent-violet-500"
              />
              Bootstrap Rows
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={bootstrapFeatures}
                onChange={(event) => {
                  setBootstrapFeatures(event.target.checked);
                  resetResult();
                }}
                className="accent-violet-500"
              />
              Bootstrap Features
            </label>

            <button
              type="button"
              disabled={
                loading ||
                !features.length ||
                features.includes(target)
              }
              onClick={() => void train()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-40"
            >
              {loading ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Play size={19} />
              )}
              {loading ? "Training..." : "Train & Compare"}
            </button>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
              >
                {error}
              </p>
            )}
          </section>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Activity size={20} className="text-sky-400" />
                Fitted Prediction Visualizations
              </h3>

              <div className="flex gap-2">
                {(["2d", "3d"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setView(option)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold ${
                      view === option
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {!result ? (
              <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center">
                <BarChart3
                  size={42}
                  className="text-violet-400"
                />
                <h4 className="mt-5 text-lg font-bold">
                  Ready to Train
                </h4>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                  Choose a dataset, adjust Bagging settings,
                  and train your models to generate real
                  decision regions or regression surfaces.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-2">
                {[
                  result.single_model,
                  result.bagging_model,
                ].map((model) => (
                  <div key={model.name} className="min-w-0">
                    <h4 className="mb-3 font-bold">
                      {model.name}
                    </h4>
                    <BaggingChart
                      model={model}
                      task={result.task}
                      view={view}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {result && (
  <>
    {(() => {
      const singleSurface = toInteractiveSurface(
    result.single_model.visualization,
  );

  const baggingSurface = toInteractiveSurface(
    result.bagging_model.visualization,
  );
  const currentCheckpoint = result.surface_playback?.find(
  (checkpoint) =>
    checkpoint.total_learners === playbackLearners,
);

const checkpointSurface: BaggingGraphSurface | null =
  baggingSurface && currentCheckpoint
    ? {
        ...baggingSurface,
        x: currentCheckpoint.x_values,
        y: currentCheckpoint.y_values,
        z: currentCheckpoint.z_values,
      }
    : null;

  if (!singleSurface || !baggingSurface) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-lg font-bold text-white">
          Interactive 2D / 3D Model Comparison
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          A two-feature prediction surface is not available
          for this training result. The original fitted-model
          visualization above remains available.
          Select two numeric features and train again
          to generate interactive 2D and 3D surfaces.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0">
      <BaggingInteractiveGraphs
        key={JSON.stringify({
          features: result.dataset.features,
          target: result.dataset.target,
          task: result.task,
          single: singleSurface.z,
          bagging: baggingSurface.z,
          
        })}
        single={singleSurface}
        bagging={baggingSurface}
        playbackSurface={checkpointSurface}
playbackCount={playbackLearners}
        featureNames={[
          result.single_model.visualization.x_feature,
          result.single_model.visualization.y_feature ??
            "Feature 2",
        ]}
        targetName={result.dataset.target}
        task={result.task}
        source="trained"
      />
    </section>
  );
})()}
            
              <section className={panel}>
                <h3 className="text-xl font-bold">
                  Real Test Performance
                </h3>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="p-3">Metric</th>
                        <th className="p-3">Single Tree</th>
                        <th className="p-3">Bagging</th>
                      </tr>
                    </thead>

                    <tbody>
                      {metricEntries(
                        result.single_model.test_metrics,
                        result.task,
                      ).map(([label, value]) => {
                        const other = metricEntries(
                          result.bagging_model.test_metrics,
                          result.task,
                        ).find(([name]) => name === label)?.[1];

                        return (
                          <tr
                            key={label}
                            className="border-t border-slate-800"
                          >
                            <td className="p-3">{label}</td>
                            <td className="p-3 font-mono">
                              {fmt(value)}
                            </td>
                            <td className="p-3 font-mono text-violet-300">
                              {fmt(other)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className={panel}>
                  <p className="text-xs text-slate-400">
                    Training Rows
                  </p>
                  <p className="mt-3 text-2xl font-bold">
                    {result.dataset.train_rows}
                  </p>
                </div>

                <div className={panel}>
                  <p className="text-xs text-slate-400">
                    Testing Rows
                  </p>
                  <p className="mt-3 text-2xl font-bold">
                    {result.dataset.test_rows}
                  </p>
                </div>

                <div className={panel}>
                  <p className="text-xs text-slate-400">
                    Out-of-Bag Score
                  </p>
                  <p className="mt-3 text-2xl font-bold text-emerald-300">
                    {fmt(result.bagging_model.oob_score)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Accuracy for classification, R² for regression
                  </p>
                </div>
              </div>

              <section className={panel}>
                <h3 className="text-xl font-bold">
                  Actual Bootstrap Samples
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  These are the fitted Bagging learners'
                  actual sampled training observations,
                  returned by scikit-learn.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result.bootstrap_previews.map((item) => (
                    <div
                      key={item.learner}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <p className="font-bold text-violet-300">
                        Learner {item.learner}
                      </p>
                      <p className="mt-3 text-xs text-slate-300">
                        Draws: {item.sample_count}
                      </p>
                      <p className="mt-2 text-xs text-slate-300">
                        Unique rows: {item.unique_count}
                      </p>
                      <p className="mt-2 text-xs text-amber-300">
                        OOB rows: {item.oob_count}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              {result.training_progression &&
  result.training_progression.length > 0 && (
    <BaggingTrainingPlayback
      key={JSON.stringify(result.training_progression)}
      task={result.task}
      stages={result.training_progression}
      onStageChange={setPlaybackLearners}
    />
  )}
              {result.learner_diversity && (
  <BaggingDiversityStudio
    key={JSON.stringify({
      task: result.task,
      learners: result.learner_diversity.learners,
    })}
    data={result.learner_diversity}
  />
)}
              {result.warnings.length > 0 && (
                <section className={panel}>
                  <h3 className="font-bold text-amber-300">
                    Training Warnings
                  </h3>
                  {result.warnings.map((warning, i) => (
                    <p
                      key={i}
                      className="mt-3 text-xs leading-6 text-slate-300"
                    >
                      {warning}
                    </p>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
