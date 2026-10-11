
"use client";
import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import type { Data, Layout } from "plotly.js";
import VotingDecisionExplorer from "@/components/voting_stacking/VotingDecisionExplorer";
import StackingMetaLearnerExplorer from "@/components/voting_stacking/StackingMetaLearnerExplorer";
import VotingStackingInterpretationStudio from "@/components/voting_stacking/VotingStackingInterpretationStudio";
import VotingStackingEvaluationStudio from "@/components/voting_stacking/VotingStackingEvaluationStudio";
import VotingStackingDataStudio from "@/components/voting_stacking/VotingStackingDataStudio";
import {
  Activity,
  BarChart3,
  Database,
  GitMerge,
  LoaderCircle,
  Play,
  Rotate3D,
  Settings2,
  Upload,
} from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

const API =
  process.env.NEXT_PUBLIC_VOTING_STACKING_API_URL ||
  "http://127.0.0.1:8005";

type Task = "classification" | "regression";
type View = "2d" | "3d";
type Row = Record<string, string | number | null>;

type Metrics = {
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  r2?: number | null;
  mae?: number | null;
  rmse?: number | null;
  confusion_matrix?: number[][];
};

type SurfacePoint = {
  x: number | null;
  y: number | null;
  actual: number | null;
};

type Surface = {
  x_feature: string;
  y_feature: string;
  x_values: number[];
  y_values: number[];
  z_values: number[][];
  train_points: SurfacePoint[];
  test_points: SurfacePoint[];
  fixed_features?: Record<string, number | null>;
  note?: string;
};

type ModelResult = {
  name: string;
  metrics: {
    train: Metrics;
    test: Metrics;
  };
  visualization: Surface | null;
  predictions: {
    actual: (number | null)[];
    predicted: (number | null)[];
  };
};

type EnsembleObservation = {
  index: number;
  actual: number | null;
  base_predictions: Record<string, number | null>;
  voting_prediction: number | null;
  stacking_prediction: number | null;
  stacking_meta_features: (number | null)[];
  soft_voting_prediction?: number | null;
  soft_voting_probabilities?: (number | null)[];
};

type TrainingResult = {
  success: boolean;
  task: Task;
  dataset: {
    total_rows: number;
    valid_rows: number;
    train_rows: number;
    test_rows: number;
    features: string[];
    target: string;
    class_labels: string[] | null;
  };
  configuration: {
    knn_neighbors: number;
    forest_estimators: number;
    max_depth: number;
    stacking_cv: number;
    stacking_passthrough: boolean;
    voting_weights: number[];
    missing_strategy: string;
    test_size: number;
    random_state: number;
  };
  models: Record<string, ModelResult>;
  ensemble_explanation: {
    method: string;
    base_model_names: string[];
    weights: number[];
    meta_feature_count: number;
    observations: EnsembleObservation[];
    note: string;
  };
  warnings: string[];
};

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#0e1729] p-5";

const modelNames: Record<string, string> = {
  linear: "Linear Model",
  knn: "K-Nearest Neighbors",
  random_forest: "Random Forest",
  hard_voting: "Hard Voting",
  soft_voting: "Soft Voting",
  voting: "Voting Regressor",
  stacking: "Stacking",
};

function createBuiltin(id: string): {
  rows: Row[];
  task: Task;
  features: string[];
  target: string;
} {
  const rows: Row[] = [];

  for (let i = 0; i < 240; i++) {
    const x = ((i * 73) % 239) / 22 - 5.4;
    const y = ((i * 47 + 19) % 233) / 22 - 5.3;

    let targetValue: number;

    switch (id) {
      case "xor":
        targetValue = x * y >= 0 ? 1 : 0;
        break;
      case "circles":
        targetValue = x * x + y * y < 13 ? 1 : 0;
        break;
      case "nonlinear":
        targetValue =
          0.3 * x * x +
          Math.cos(y * 1.4) +
          0.15 * Math.sin(i);
        break;
      default:
        targetValue =
          2.2 * Math.sin(x) +
          0.55 * y +
          0.1 * Math.cos(i * 3);
    }

    rows.push({
      Feature1: x,
      Feature2: y,
      Target: targetValue,
    });
  }

  return {
    rows,
    task:
      id === "circles" || id === "xor"
        ? "classification"
        : "regression",
    features: ["Feature1", "Feature2"],
    target: "Target",
  };
}

function numericColumns(rows: Row[]): string[] {
  if (!rows.length) return [];

  return Object.keys(rows[0]).filter((column) => {
    const values = rows
      .map((row) => row[column])
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).trim() !== "",
      );

    return (
      values.length > 0 &&
      values.every((value) =>
        Number.isFinite(Number(value)),
      )
    );
  });
}

function format(value: number | null | undefined) {
  return value == null || !Number.isFinite(value)
    ? "N/A"
    : value.toFixed(4);
}

function getMetrics(task: Task, metrics: Metrics) {
  return task === "classification"
    ? [
        ["Accuracy", metrics.accuracy],
        ["Precision", metrics.precision],
        ["Recall", metrics.recall],
        ["F1 Score", metrics.f1],
      ]
    : [
        ["R²", metrics.r2],
        ["MAE", metrics.mae],
        ["RMSE", metrics.rmse],
      ];
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
    <label className="block">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <strong className="text-violet-300">
          {value}
        </strong>
      </div>

      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-violet-500"
      />
    </label>
  );
}

function ModelGraph({
  model,
  label,
  view,
  task,
  target,
}: {
  model: ModelResult;
  label: string;
  view: View;
  task: Task;
  target: string;
}) {
  const surface = model.visualization;

  if (!surface) {
    return (
      <div className={panel}>
        <h3 className="font-bold">{label}</h3>
        <p className="mt-3 text-sm text-slate-400">
          Select at least two input features to display
          a prediction surface.
        </p>
      </div>
    );
  }

  const train = surface.train_points.filter(
    (point) =>
      point.x !== null && point.y !== null,
  );

  const test = surface.test_points.filter(
    (point) =>
      point.x !== null && point.y !== null,
  );

  const traces: Data[] =
    view === "2d"
      ? [
          {
            type: "contour",
            x: surface.x_values,
            y: surface.y_values,
            z: surface.z_values,
            colorscale: "Viridis",
            contours: {
              coloring: "heatmap",
              showlines: true,
            },
            name: "Fitted prediction",
          } as Data,
          {
            type: "scatter",
            mode: "markers",
            x: train.map((p) => p.x),
            y: train.map((p) => p.y),
            name: "Train",
            marker: {
              color: "#fb923c",
              size: 5,
              opacity: 0.75,
            },
          } as Data,
          {
            type: "scatter",
            mode: "markers",
            x: test.map((p) => p.x),
            y: test.map((p) => p.y),
            name: "Test",
            marker: {
              color: "#38bdf8",
              size: 7,
              symbol: "diamond",
            },
          } as Data,
        ]
      : [
          {
            type: "surface",
            x: surface.x_values,
            y: surface.y_values,
            z: surface.z_values,
            colorscale: "Viridis",
            opacity: 0.9,
            name: "Fitted prediction",
          } as Data,
          {
            type: "scatter3d",
            mode: "markers",
            x: train.map((p) => p.x),
            y: train.map((p) => p.y),
            z: train.map((p) => p.actual),
            name: "Train",
            marker: {
              color: "#fb923c",
              size: 3,
            },
          } as Data,
          {
            type: "scatter3d",
            mode: "markers",
            x: test.map((p) => p.x),
            y: test.map((p) => p.y),
            z: test.map((p) => p.actual),
            name: "Test",
            marker: {
              color: "#38bdf8",
              size: 4,
            },
          } as Data,
        ];

  const height = view === "3d" ? 480 : 420;

  const layout: Partial<Layout> = {
    autosize: true,
    height,
    paper_bgcolor: "#0c1427",
    plot_bgcolor: "#121e33",
    font: { color: "#cbd5e1" },
    margin:
      view === "3d"
        ? { l: 0, r: 0, t: 15, b: 0 }
        : { l: 65, r: 20, t: 15, b: 60 },
    xaxis: {
      title: { text: surface.x_feature },
      gridcolor: "#334155",
    },
    yaxis: {
      title: { text: surface.y_feature },
      gridcolor: "#334155",
    },
    scene: {
      xaxis: {
        title: { text: surface.x_feature },
      },
      yaxis: {
        title: { text: surface.y_feature },
      },
      zaxis: {
        title: { text: target },
      },
    },
    legend: { orientation: "h" },
  };

  return (
    <section className={panel}>
      <h3 className="text-lg font-bold">{label}</h3>

      <div
        className="mt-4 min-w-0 overflow-hidden rounded-xl"
        style={{ height }}
      >
        <Plot
          data={traces}
          layout={layout}
          config={{
            responsive: true,
            displaylogo: false,
            scrollZoom: true,
          }}
          style={{
            width: "100%",
            height,
          }}
          useResizeHandler
        />
      </div>

      <p className="mt-3 text-xs leading-6 text-slate-400">
        {task === "classification"
          ? "Colors represent predicted numeric class indices."
          : "Colors represent predicted target values."}
        {" "}Orange observations belong to the training
        split; blue diamonds belong to the test split.
      </p>
    </section>
  );
}

export default function VotingStackingTrainingStudio() {
  const initial = useMemo(
    () => createBuiltin("circles"),
    [],
  );
  const requestVersion = useRef(0);

  const [datasetId, setDatasetId] =
    useState("circles");

  const [rows, setRows] =
    useState<Row[]>(initial.rows);

  const [task, setTask] =
    useState<Task>(initial.task);

  const [features, setFeatures] =
    useState<string[]>(initial.features);

  const [target, setTarget] =
    useState(initial.target);

  const [fileName, setFileName] =
    useState<string | null>(null);

  const [neighbors, setNeighbors] = useState(5);
  const [forestEstimators, setForestEstimators] =
    useState(40);
  const [depth, setDepth] = useState(5);
  const [stackingCV, setStackingCV] = useState(3);
  const [passthrough, setPassthrough] =
    useState(false);

  const [weights, setWeights] =
    useState([1, 1, 1]);

  const [missingStrategy, setMissingStrategy] =
    useState("median");

  const [view, setView] = useState<View>("2d");

  const [result, setResult] =
    useState<TrainingResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const nextExperimentId = useRef(1);

  const columns = rows.length
    ? Object.keys(rows[0])
    : [];

  const numeric = useMemo(
    () => numericColumns(rows),
    [rows],
  );

  function clearResult() {
  requestVersion.current += 1;
  setResult(null);
  setError("");
  setLoading(false);
}

  function selectDataset(id: string) {
    const data = createBuiltin(id);

    setDatasetId(id);
    setRows(data.rows);
    setTask(data.task);
    setFeatures(data.features);
    setTarget(data.target);
    setFileName(null);
    clearResult();
  }

  function uploadFile(file: File) {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,

      complete: (parsed) => {
        if (parsed.errors.length > 0) {
          setError(
            "Unable to parse this CSV. Check its formatting.",
          );
          return;
        }

        const data = parsed.data.filter(
          (row) =>
            Object.values(row).some(
              (value) =>
                value !== null &&
                String(value ?? "").trim() !== "",
            ),
        );

        if (data.length < 20) {
          setError(
            "Upload a CSV containing at least 20 rows.",
          );
          return;
        }

        const available = numericColumns(data);
        const all = Object.keys(data[0]);
        const nextTarget = all[all.length - 1];

        setDatasetId("csv");
        setRows(data);
        setTarget(nextTarget);
        setTask("classification");
        setFeatures(
          available
            .filter((name) => name !== nextTarget)
            .slice(0, 2),
        );
        setFileName(file.name);
        clearResult();
      },

      error: () => {
        setError("CSV upload failed.");
      },
    });
  }

  function toggleFeature(name: string) {
    setFeatures((previous) =>
      previous.includes(name)
        ? previous.filter((item) => item !== name)
        : [...previous, name],
    );

    clearResult();
  }

  function changeWeight(index: number, value: number) {
    setWeights((previous) =>
      previous.map((weight, current) =>
        current === index ? value : weight,
      ),
    );

    clearResult();
  }

  async function train() {
    if (!features.length) {
      setError("Select at least one numeric feature.");
      return;
    }

    if (features.includes(target)) {
      setError(
        "The target cannot also be an input feature.",
      );
      return;
    }

    if (weights.every((weight) => weight === 0)) {
      setError(
        "At least one voting weight must be positive.",
      );
      return;
    }

    const currentRequest = ++requestVersion.current;

setLoading(true);
setError("");
setResult(null);

    try {
      const response = await fetch(
        `${API}/api/voting-stacking/train`,
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
            knn_neighbors: neighbors,
            forest_estimators: forestEstimators,
            max_depth: depth,
            stacking_cv: stackingCV,
            stacking_passthrough: passthrough,
            voting_weights: weights,
            missing_strategy: missingStrategy,
            test_size: 0.25,
            random_state: 42,
            grid_resolution: 35,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof payload.detail === "string"
            ? payload.detail
            : `Training failed (HTTP ${response.status}).`,
        );
      }

      if (currentRequest === requestVersion.current) {
  setResult(payload as TrainingResult);
}
    } catch (caught) {
  if (currentRequest === requestVersion.current) {
    setError(
      caught instanceof Error
        ? caught.message
        : "Unable to connect to the Voting & Stacking API.",
    );
  }
} finally {
  if (currentRequest === requestVersion.current) {
    setLoading(false);
  }
}
  }

  const modelEntries = result
    ? Object.entries(result.models)
    : [];

  return (
    <div className="space-y-6 text-white">
      <header className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-[#111a30] to-[#080d19] p-7 md:p-9">
        <div className="flex items-center gap-2 text-violet-300">
          <GitMerge size={20} />

          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Ensemble Learning
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold md:text-4xl">
          Voting & Stacking Lab
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Train individual models and combine their
          predictions using real Voting and Stacking
          ensembles. Compare held-out performance
          and explore decision boundaries in 2D or 3D.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className={panel}>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Database
                size={19}
                className="text-sky-300"
              />
              Dataset
            </h2>

            <label className="mt-5 block text-xs text-slate-300">
              Select built-in dataset

              <select
                value={datasetId}
                onChange={(event) =>
                  selectDataset(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
              >
                <option value="circles">
                  Circles — Classification
                </option>
                <option value="xor">
                  XOR — Classification
                </option>
                <option value="wave">
                  Wave — Regression
                </option>
                <option value="nonlinear">
                  Nonlinear — Regression
                </option>
                {datasetId === "csv" && (
                  <option value="csv">
                    Uploaded CSV
                  </option>
                )}
              </select>
            </label>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-violet-500/50 bg-violet-500/10 p-4 text-sm text-violet-200">
              <Upload size={17} />
              Upload CSV

              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) uploadFile(file);

                  event.target.value = "";
                }}
              />
            </label>

            {fileName && (
              <p className="mt-3 break-all text-xs text-sky-300">
                {fileName}
              </p>
            )}

            <p className="mt-3 text-xs text-slate-400">
              {rows.length} rows loaded
            </p>

            <p className="mb-3 mt-5 text-xs font-semibold text-slate-300">
              Prediction task
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(["classification", "regression"] as const).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setTask(option);
                      clearResult();
                    }}
                    className={`rounded-xl p-3 text-xs font-semibold capitalize ${
                      task === option
                        ? "bg-violet-600"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {option}
                  </button>
                ),
              )}
            </div>

            <label className="mt-5 block text-xs text-slate-300">
              Target column

              <select
                value={target}
                onChange={(event) => {
                  const next = event.target.value;

                  setTarget(next);

                  setFeatures((previous) =>
                    previous.filter(
                      (name) => name !== next,
                    ),
                  );

                  clearResult();
                }}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
              >
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold text-slate-300">
                Numeric input features
              </p>

              <div className="max-h-44 space-y-2 overflow-y-auto">
                {numeric
                  .filter((name) => name !== target)
                  .map((name) => (
                    <label
                      key={name}
                      className="flex items-center gap-3 rounded-lg bg-slate-950 p-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={features.includes(name)}
                        onChange={() =>
                          toggleFeature(name)
                        }
                        className="accent-violet-500"
                      />
                      <span className="break-all">
                        {name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          </section>

          <section className={`${panel} space-y-6`}>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Settings2
                size={19}
                className="text-violet-300"
              />
              Model Settings
            </h2>

            <Slider
              label="KNN Neighbors"
              value={neighbors}
              min={1}
              max={20}
              step={1}
              onChange={(value) => {
                setNeighbors(value);
                clearResult();
              }}
            />

            <Slider
              label="Random Forest Trees"
              value={forestEstimators}
              min={10}
              max={120}
              step={10}
              onChange={(value) => {
                setForestEstimators(value);
                clearResult();
              }}
            />

            <Slider
              label="Forest Max Depth"
              value={depth}
              min={1}
              max={12}
              step={1}
              onChange={(value) => {
                setDepth(value);
                clearResult();
              }}
            />

            <Slider
              label="Stacking CV Folds"
              value={stackingCV}
              min={2}
              max={5}
              step={1}
              onChange={(value) => {
                setStackingCV(value);
                clearResult();
              }}
            />

            <div>
              <p className="mb-4 text-sm font-semibold">
                Voting Weights
              </p>

              {[
                "Linear Model",
                "KNN",
                "Random Forest",
              ].map((label, index) => (
                <div key={label} className="mb-4">
                  <Slider
                    label={label}
                    value={weights[index]}
                    min={0}
                    max={5}
                    step={0.5}
                    onChange={(value) =>
                      changeWeight(index, value)
                    }
                  />
                </div>
              ))}

              <p className="text-xs leading-6 text-slate-400">
                Higher weights give a base learner
                greater influence in the Voting ensemble.
                Stacking trains its own meta-learner
                instead of using these weights.
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={passthrough}
                onChange={(event) => {
                  setPassthrough(event.target.checked);
                  clearResult();
                }}
                className="accent-violet-500"
              />

              Pass original features to stacking meta-learner
            </label>

            <label className="block text-xs text-slate-300">
              Missing-value strategy

              <select
                value={missingStrategy}
                onChange={(event) => {
                  setMissingStrategy(event.target.value);
                  clearResult();
                }}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
              >
                <option value="median">Median</option>
                <option value="mean">Mean</option>
                <option value="most_frequent">
                  Most frequent
                </option>
              </select>
            </label>

            <button
              type="button"
              disabled={loading}
              onClick={() => void train()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 text-sm font-bold hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Play size={19} />
              )}

              {loading
                ? "Training Ensembles..."
                : "Train & Compare"}
            </button>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-7 text-rose-300"
              >
                {error}
              </p>
            )}
          </section>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <BarChart3
                  size={20}
                  className="text-sky-300"
                />
                Interactive Prediction Surfaces
              </h2>

              <div className="flex gap-2">
                {(["2d", "3d"] as const).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setView(option)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                        view === option
                          ? "bg-violet-600"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {option === "3d" && (
                        <Rotate3D size={16} />
                      )}
                      {option.toUpperCase()}
                    </button>
                  ),
                )}
              </div>
            </div>

            {!result ? (
              <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center">
                <GitMerge
                  size={42}
                  className="text-violet-400"
                />

                <h3 className="mt-5 text-lg font-bold">
                  Ready to Train
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
                  Select your data and settings, then
                  click Train & Compare to calculate real
                  ensemble predictions.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {modelEntries.map(([key, model]) => (
                  <ModelGraph
                    key={`${key}-${view}`}
                    model={model}
                    label={modelNames[key] ?? key}
                    view={view}
                    task={result.task}
                    target={result.dataset.target}
                  />
                ))}
              </div>
            )}
          </section>

          {result && (
            <>
            <VotingStackingDataStudio
  rows={rows}
  result={result}
/>
            <VotingStackingEvaluationStudio
  result={result}
/>
            <VotingStackingInterpretationStudio
  result={result}
/>
            <VotingDecisionExplorer
  key={JSON.stringify(result.configuration)}
  task={result.task}
  explanation={result.ensemble_explanation}
  classLabels={result.dataset.class_labels}
/>
<StackingMetaLearnerExplorer
  key={`stacking-${JSON.stringify(result.configuration)}`}
  task={result.task}
  explanation={result.ensemble_explanation}
  classLabels={result.dataset.class_labels}
  features={result.dataset.features}
  configuration={result.configuration}
/>
              <section className={panel}>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Activity
                    size={20}
                    className="text-emerald-300"
                  />
                  Held-Out Model Comparison
                </h2>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Every model is evaluated using the
                  same held-out train/test split.
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[530px] text-left text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="p-3">Model</th>
                        {getMetrics(
                          result.task,
                          {},
                        ).map(([metric]) => (
                          <th
                            key={metric}
                            className="p-3"
                          >
                            {metric}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {modelEntries.map(([key, model]) => (
                        <tr
                          key={key}
                          className="border-t border-slate-800"
                        >
                          <td className="p-3 font-semibold">
                            {modelNames[key] ?? key}
                          </td>

                          {getMetrics(
                            result.task,
                            model.metrics.test,
                          ).map(([metric, value]) => (
                            <td
                              key={metric}
                              className="p-3 font-mono text-violet-300"
                            >
                              {format(
                                value as number | null,
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={panel}>
                <h3 className="text-lg font-bold">
                  Training Dataset Summary
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    [
                      "Training rows",
                      result.dataset.train_rows,
                    ],
                    [
                      "Test rows",
                      result.dataset.test_rows,
                    ],
                    [
                      "Selected features",
                      result.dataset.features.length,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl bg-slate-950 p-4"
                    >
                      <p className="text-xs text-slate-400">
                        {label}
                      </p>

                      <p className="mt-2 text-xl font-bold text-violet-300">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {result.dataset.class_labels && (
                  <p className="mt-4 text-xs leading-6 text-slate-400">
                    Class index mapping:{" "}
                    {result.dataset.class_labels
                      .map(
                        (label, index) =>
                          `${index} = ${label}`,
                      )
                      .join(", ")}
                  </p>
                )}
              </section>

              {result.warnings.length > 0 && (
                <section className={panel}>
                  <h3 className="font-bold text-amber-300">
                    Training Warnings
                  </h3>

                  {result.warnings.map(
                    (warning, index) => (
                      <p
                        key={index}
                        className="mt-3 text-xs leading-6 text-slate-300"
                      >
                        {warning}
                      </p>
                    ),
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
