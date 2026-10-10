
"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import type { Data, Layout } from "plotly.js";
import BoostingPlaybackStudio, {
  type BoostingModelKey,
} from "@/components/boosting/BoostingPlaybackStudio";
import BoostingLearningDiagnostics from "@/components/boosting/BoostingLearningDiagnostics";
import BoostingFeatureImportanceStudio, {
  type FeatureImportanceResult,
} from "@/components/boosting/BoostingFeatureImportanceStudio";
import BoostingExperimentHistory, {
  type BoostingExperiment,
} from "@/components/boosting/BoostingExperimentHistory";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Database,
  LoaderCircle,
  Play,
  Rotate3D,
  Settings2,
  Upload,
} from "lucide-react";
import BoostingModelInterpretation from "@/components/boosting/BoostingModelInterpretation";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type Task = "classification" | "regression";
type Row = Record<string, string | number | null>;
type View = "2d" | "3d";

type Metrics = {
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  r2?: number | null;
  mae?: number | null;
  rmse?: number | null;
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
};

type Progression = {
  stage: number;
  metrics: Metrics;
  predictions: (number | null)[];
};
type StageSurface = {
  stage: number;
  x_values: number[];
  y_values: number[];
  z_values: number[][];
};

type LearningDiagnostics = {
  type: string;
  note?: string;

  learner_count?: number;

  learners?: {
    stage: number;
    estimator_weight: number | null;
    estimator_error: number | null;
  }[];

  stage_count?: number;

  stages?: {
    stage: number;

    accuracy?: number | null;
    log_loss?: number | null;
    mean_probability_error?: number | null;

    mae?: number | null;
    rmse?: number | null;
    mean_absolute_residual?: number | null;

    true_values?: (number | null)[];
    predicted_values?: (number | null)[];
    residuals?: (number | null)[];

    true_labels?: (number | null)[];
    predicted_labels?: (number | null)[];

    true_class_probabilities?: (number | null)[];
    probability_errors?: (number | null)[];
  }[];
};

type ModelResult = {
  name: string;
  metrics: {
    train: Metrics;
    test: Metrics;
  };
  visualization: Surface | null;
  training_progression: Progression[];
  stage_surfaces: StageSurface[];
  fitted_estimators: number;
  learning_diagnostics?: LearningDiagnostics;
  feature_importance?: FeatureImportanceResult;
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
  models: {
    single_tree: ModelResult;
    adaboost: ModelResult;
    gradient_boosting: ModelResult;
  };
  warnings: string[];
  learning_diagnostics?: {
  type: string;
  note?: string;
  learner_count?: number;
  learners?: {
    stage: number;
    estimator_weight: number | null;
    estimator_error: number | null;
  }[];
  stage_count?: number;
  stages?: {
    stage: number;
    accuracy?: number | null;
    log_loss?: number | null;
    mean_probability_error?: number | null;
    mae?: number | null;
    rmse?: number | null;
    mean_absolute_residual?: number | null;
    true_values?: (number | null)[];
    predicted_values?: (number | null)[];
    residuals?: (number | null)[];
    true_labels?: (number | null)[];
    predicted_labels?: (number | null)[];
    true_class_probabilities?: (number | null)[];
    probability_errors?: (number | null)[];
  }[];
};
};

const API =
  process.env.NEXT_PUBLIC_BOOSTING_API_URL ||
  "http://127.0.0.1:8004";

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#0e1729] p-5";

function makeBuiltin(id: string): {
  rows: Row[];
  task: Task;
  features: string[];
  target: string;
} {
  const rows: Row[] = [];

  for (let i = 0; i < 200; i++) {
    const x = ((i * 73) % 199) / 20 - 5;
    const y = ((i * 41 + 17) % 197) / 20 - 5;

    if (id === "circles") {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target: x * x + y * y < 12 ? 1 : 0,
      });
    } else if (id === "xor") {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target: x * y >= 0 ? 1 : 0,
      });
    } else if (id === "nonlinear") {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target:
          0.18 * x * x +
          Math.sin(y * 1.3) +
          0.25 * Math.cos(i * 5),
      });
    } else {
      rows.push({
        Feature1: x,
        Feature2: y,
        Target:
          2 * Math.sin(x) +
          0.45 * y +
          0.12 * Math.cos(i * 3),
      });
    }
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
      values.some((value) =>
        Number.isFinite(Number(value)),
      ) &&
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

function metricRows(task: Task, metrics: Metrics) {
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

function TrainingGraph({
  model,
  title,
  view,
  task,
  target,
}: {
  model: ModelResult;
  title: string;
  view: View;
  task: Task;
  target: string;
}) {
  const surface = model.visualization;

  if (
    !surface ||
    !surface.z_values ||
    surface.x_values.length < 2 ||
    surface.y_values.length < 2
  ) {
    return (
      <section className={panel}>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-4 text-sm text-slate-400">
          Select at least two numeric features to generate
          the prediction surface.
        </p>
      </section>
    );
  }

  const xName = surface.x_feature;
  const yName = surface.y_feature;

  const train = surface.train_points.filter(
    (p) => p.x !== null && p.y !== null,
  );

  const test = surface.test_points.filter(
    (p) => p.x !== null && p.y !== null,
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
            name: "Model prediction",
            hovertemplate:
              `${xName}: %{x:.3f}<br>` +
              `${yName}: %{y:.3f}<br>` +
              "Prediction: %{z:.3f}<extra></extra>",
          } as Data,
          {
            type: "scatter",
            mode: "markers",
            x: train.map((p) => p.x),
            y: train.map((p) => p.y),
            name: "Train",
            marker: {
              size: 5,
              color: "#fb923c",
              opacity: 0.7,
            },
          } as Data,
          {
            type: "scatter",
            mode: "markers",
            x: test.map((p) => p.x),
            y: test.map((p) => p.y),
            name: "Test",
            marker: {
              size: 7,
              color: "#38bdf8",
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
            name: "Prediction surface",
            hovertemplate:
              `${xName}: %{x:.3f}<br>` +
              `${yName}: %{y:.3f}<br>` +
              "Prediction: %{z:.3f}<extra></extra>",
          } as Data,
          {
            type: "scatter3d",
            mode: "markers",
            x: train.map((p) => p.x),
            y: train.map((p) => p.y),
            z: train.map((p) => p.actual),
            name: "Train",
            marker: {
              size: 3,
              color: "#fb923c",
              opacity: 0.8,
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
              size: 4,
              color: "#38bdf8",
            },
          } as Data,
        ];

  const layout: Partial<Layout> = {
    autosize: true,
    height: view === "3d" ? 490 : 430,
    paper_bgcolor: "#0c1427",
    plot_bgcolor: "#121e33",
    font: { color: "#cbd5e1" },
    margin:
      view === "3d"
        ? { l: 0, r: 0, t: 15, b: 0 }
        : { l: 60, r: 20, t: 15, b: 65 },
    xaxis: {
      title: { text: xName },
      gridcolor: "#334155",
    },
    yaxis: {
      title: { text: yName },
      gridcolor: "#334155",
    },
    scene: {
      xaxis: { title: { text: xName } },
      yaxis: { title: { text: yName } },
      zaxis: { title: { text: target } },
      camera: {
        eye: { x: 1.6, y: 1.5, z: 1.2 },
      },
    },
    legend: {
      orientation: "h",
    },
    uirevision: `${model.name}-${view}`,
  };

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
          {model.fitted_estimators} estimators
        </span>
      </div>

      <div
        className="mt-4 min-w-0 overflow-hidden rounded-xl"
        style={{
          height: view === "3d" ? 490 : 430,
        }}
      >
        <Plot
          key={`${model.name}-${view}`}
          data={traces}
          layout={layout}
          config={{
            responsive: true,
            displaylogo: false,
            scrollZoom: true,
            displayModeBar: true,
          }}
          style={{
            width: "100%",
            height: view === "3d" ? 490 : 430,
          }}
          useResizeHandler
        />
      </div>

      <p className="mt-3 text-xs leading-6 text-slate-400">
        {task === "classification"
          ? "The surface height/color represents the numeric class index predicted by the trained model."
          : "The surface height/color represents the predicted target value."}
        {" "}Orange points are training observations;
        blue diamonds are test observations.
      </p>
    </section>
  );
}

function RangeControl({
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
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <strong className="text-violet-300">
          {value}
        </strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-violet-500"
      />
    </label>
  );
}

export default function BoostingTrainingStudio() {
  const initial = useMemo(
    () => makeBuiltin("circles"),
    [],
  );

  const [datasetId, setDatasetId] =
    useState("circles");

  const [rows, setRows] = useState<Row[]>(
    initial.rows,
  );

  const [task, setTask] = useState<Task>(
    initial.task,
  );

  const [features, setFeatures] = useState<string[]>(
    initial.features,
  );

  const [target, setTarget] = useState(
    initial.target,
  );

  const [fileName, setFileName] =
    useState<string | null>(null);

  const [estimators, setEstimators] = useState(30);
  const [learningRate, setLearningRate] =
    useState(0.1);
  const [depth, setDepth] = useState(3);
  const [subsample, setSubsample] = useState(1);
  const [missingStrategy, setMissingStrategy] =
    useState("median");

  const [view, setView] = useState<View>("2d");
  const [playbackSelection, setPlaybackSelection] =
  useState<{
    model: BoostingModelKey;
    stage: number;
  } | null>(null);

const handleStageChange = useCallback(
  (model: BoostingModelKey, stage: number) => {
    setPlaybackSelection((previous) => {
      if (
        previous?.model === model &&
        previous.stage === stage
      ) {
        return previous;
      }

      return { model, stage };
    });
  },
  [],
);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] =
    useState<TrainingResult | null>(null);
  const [experimentHistory, setExperimentHistory] =
  useState<BoostingExperiment[]>([]);
  const trainingRequestId = useRef(0);

const [trainedSettings, setTrainedSettings] = useState<{
  n_estimators: number;
  learning_rate: number;
  max_depth: number;
  subsample: number;
} | null>(null);

  const columns = rows.length
    ? Object.keys(rows[0])
    : [];

  const numeric = useMemo(
    () => numericColumns(rows),
    [rows],
  );

  function resetResult() {
  // Invalidate any training request that was started
  // before the user changed the experiment.
  trainingRequestId.current += 1;

  setResult(null);
  setError("");
  setLoading(false);
  setPlaybackSelection(null);
  setTrainedSettings(null);

  // Do not clear experimentHistory.
  // Previous experiments must remain available.
}
  function deleteExperiment(id: string) {
  setExperimentHistory((previous) =>
    previous.filter((item) => item.id !== id),
  );
}

function clearExperimentHistory() {
  setExperimentHistory([]);
}

  function changeDataset(id: string) {
    const data = makeBuiltin(id);

    setDatasetId(id);
    setRows(data.rows);
    setTask(data.task);
    setFeatures(data.features);
    setTarget(data.target);
    setFileName(null);
    resetResult();
  }

  function uploadFile(file: File) {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (parsed) => {
        const data = parsed.data.filter(
          (row) =>
            Object.values(row).some(
              (value) =>
                value !== null &&
                String(value ?? "").trim() !== "",
            ),
        );

        if (
          parsed.errors.length > 0 &&
          data.length === 0
        ) {
          setError("Unable to parse the uploaded CSV.");
          return;
        }

        if (data.length < 12) {
          setError(
            "Upload a CSV containing at least 12 data rows.",
          );
          return;
        }

        const available = numericColumns(data);
        const all = Object.keys(data[0]);

        setDatasetId("csv");
        setRows(data);
        setTask("classification");
        setTarget(all[all.length - 1]);
        setFeatures(
          available
            .filter(
              (name) => name !== all[all.length - 1],
            )
            .slice(0, 2),
        );
        setFileName(file.name);
        resetResult();
      },
      error: () =>
        setError("CSV upload failed."),
    });
  }

  function toggleFeature(name: string) {
    setFeatures((previous) =>
      previous.includes(name)
        ? previous.filter((value) => value !== name)
        : [...previous, name],
    );
    resetResult();
  }

  async function train() {
    if (features.length === 0) {
      setError("Select at least one numeric feature.");
      return;
    }

    if (!target || features.includes(target)) {
      setError(
        "Select a target that is not also a feature.",
      );
      return;
    }

    const requestId = ++trainingRequestId.current;

const settingsForThisRun = {
  n_estimators: estimators,
  learning_rate: learningRate,
  max_depth: depth,
  subsample,
};

setLoading(true);
setError("");
setResult(null);
setPlaybackSelection(null);
setTrainedSettings(null);

try {
      const response = await fetch(
        `${API}/api/boosting/train`,
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
            n_estimators: estimators,
            learning_rate: learningRate,
            max_depth: depth,
            subsample,
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
            : `Training failed (HTTP ${response.status})`,
        );
      }

      
const trained = payload as TrainingResult;

// Ignore responses from outdated training requests.
if (requestId !== trainingRequestId.current) {
  return;
}

setResult(trained);
setTrainedSettings(settingsForThisRun);

const recordedExperiment: BoostingExperiment = {
  id: `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`,

  createdAt: new Date().toISOString(),

  label: `Experiment ${Date.now().toString().slice(-6)}`,

  task: trained.task,

  dataset:
    fileName ??
    (datasetId === "csv"
      ? "Uploaded CSV"
      : datasetId),

  rows: trained.dataset.valid_rows,

  features: [...trained.dataset.features],

  target: trained.dataset.target,

  settings: {
    n_estimators: estimators,
    learning_rate: learningRate,
    max_depth: depth,
    subsample,
    missing_strategy: missingStrategy,
  },

  models: {
    single_tree: {
      ...trained.models.single_tree.metrics.test,
    },
    adaboost: {
      ...trained.models.adaboost.metrics.test,
    },
    gradient_boosting: {
      ...trained.models.gradient_boosting.metrics.test,
    },
  },
};

setExperimentHistory((previous) => [
  recordedExperiment,
  ...previous,
].slice(0, 30));

    } catch (caught) {
  if (requestId === trainingRequestId.current) {
    setError(
      caught instanceof Error
        ? caught.message
        : "Unable to connect to Boosting API.",
    );
  }
} finally {
  if (requestId === trainingRequestId.current) {
    setLoading(false);
  }
}
}

  const models = result
    ? [
        {
          key: "single_tree",
          title: "Single Decision Tree",
          data: result.models.single_tree,
        },
        {
          key: "adaboost",
          title: "AdaBoost",
          data: result.models.adaboost,
        },
        {
          key: "gradient_boosting",
          title: "Gradient Boosting",
          data: result.models.gradient_boosting,
        },
      ]
    : [];

  return (
    <div className="space-y-6 text-white">
      <header className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-[#111a30] to-[#080d19] p-7 md:p-9">
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Real Boosting Experiments
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold md:text-4xl">
          Boosting Training & Visualization Lab
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Train a Decision Tree, AdaBoost, and Gradient
          Boosting on the same dataset. Compare their
          performance and explore their fitted prediction
          surfaces in 2D and 3D.
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

            <label className="mt-5 block text-xs text-slate-400">
              Default dataset
              <select
                value={datasetId}
                onChange={(event) =>
                  changeDataset(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
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

            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold text-slate-300">
                Task
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(["classification", "regression"] as const)
                  .map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setTask(option);
                        resetResult();
                      }}
                      className={`rounded-xl p-3 text-xs font-semibold capitalize ${
                        task === option
                          ? "bg-violet-600"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
              </div>
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
                  resetResult();
                }}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
              >
                {columns.map((name) => (
                  <option key={name} value={name}>
                    {name}
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
              Boosting Settings
            </h2>

            <RangeControl
              label="Number of Estimators"
              value={estimators}
              min={2}
              max={150}
              step={1}
              onChange={(value) => {
                setEstimators(value);
                resetResult();
              }}
            />

            <RangeControl
              label="Learning Rate"
              value={learningRate}
              min={0.05}
              max={1}
              step={0.05}
              onChange={(value) => {
                setLearningRate(value);
                resetResult();
              }}
            />

            <RangeControl
              label="Tree Depth"
              value={depth}
              min={1}
              max={8}
              step={1}
              onChange={(value) => {
                setDepth(value);
                resetResult();
              }}
            />

            <RangeControl
              label="Gradient Boosting Subsample"
              value={subsample}
              min={0.5}
              max={1}
              step={0.05}
              onChange={(value) => {
                setSubsample(value);
                resetResult();
              }}
            />

            <label className="block text-xs text-slate-300">
              Missing-value strategy
              <select
                value={missingStrategy}
                onChange={(event) => {
                  setMissingStrategy(event.target.value);
                  resetResult();
                }}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
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
                ? "Training Models..."
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <BarChart3
                  size={20}
                  className="text-sky-300"
                />
                Interactive Model Visualizations
              </h2>

              <div className="flex gap-2">
                {(["2d", "3d"] as const).map((option) => (
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
                ))}
              </div>
            </div>

            {!result ? (
              <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center">
                <BarChart3
                  size={42}
                  className="text-violet-400"
                />

                <h3 className="mt-5 text-lg font-bold">
                  Ready to Visualize
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
                  Choose a dataset and click Train & Compare
                  to generate genuine fitted decision
                  boundaries and regression surfaces.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                
{models.map((model) => {
  const isSelectedModel =
    playbackSelection?.model === model.key;

  const selectedStage = isSelectedModel
    ? model.data.stage_surfaces?.find(
        (surface) =>
          surface.stage === playbackSelection.stage,
      )
    : undefined;

  const originalSurface =
    model.data.visualization;

  const playbackSurface: Surface | null =
    selectedStage && originalSurface
      ? {
          ...originalSurface,
          x_values: selectedStage.x_values,
          y_values: selectedStage.y_values,
          z_values: selectedStage.z_values,
        }
      : null;

  const displayedModel: ModelResult =
    playbackSurface
      ? {
          ...model.data,
          visualization: playbackSurface,
        }
      : model.data;

  return (
    <TrainingGraph
      key={model.key}
      model={displayedModel}
      title={model.title}
      view={view}
      task={result.task}
      target={result.dataset.target}
    />
  );
})}

              </div>
            )}
          </section>

          {result && (
            <>
            <BoostingPlaybackStudio
  key={JSON.stringify({
    task: result.task,
    ada: result.models.adaboost.training_progression,
    gradient: result.models.gradient_boosting.training_progression,
  })}
  task={result.task}
  adaboostStages={
    result.models.adaboost.training_progression
  }
  
  gradientStages={
    result.models.gradient_boosting.training_progression
  }
  onStageChange={handleStageChange}
/>
<BoostingLearningDiagnostics
  task={result.task}
  adaboost={
    result.models.adaboost.learning_diagnostics
  }
  gradientBoosting={
    result.models.gradient_boosting.learning_diagnostics
  }
  playbackModel={playbackSelection?.model ?? null}
  playbackStage={playbackSelection?.stage ?? null}
/>
<BoostingFeatureImportanceStudio
  task={result.task}
  singleTree={
    result.models.single_tree.feature_importance
  }
  adaboost={
    result.models.adaboost.feature_importance
  }
  gradientBoosting={
    result.models.gradient_boosting.feature_importance
  }
/>

{trainedSettings && (
  <BoostingModelInterpretation
    result={result}
    settings={trainedSettings}
  />
)}
              <section className={panel}>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Activity
                    size={20}
                    className="text-emerald-300"
                  />
                  Held-Out Test Performance
                </h2>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  All three models use the same train/test
                  split for a direct comparison.
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="p-3">Metric</th>
                        <th className="p-3">Single Tree</th>
                        <th className="p-3">AdaBoost</th>
                        <th className="p-3">
                          Gradient Boosting
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {metricRows(
                        result.task,
                        result.models.single_tree.metrics.test,
                      ).map(([name, value]) => {
                        const getValue = (
                          model: ModelResult,
                        ) =>
                          metricRows(
                            result.task,
                            model.metrics.test,
                          ).find(
                            (entry) => entry[0] === name,
                          )?.[1] as
                            | number
                            | null
                            | undefined;

                        return (
                          <tr
                            key={name}
                            className="border-t border-slate-800"
                          >
                            <td className="p-3">{name}</td>
                            <td className="p-3 font-mono">
                              {format(value as number | null)}
                            </td>
                            <td className="p-3 font-mono text-violet-300">
                              {format(
                                getValue(
                                  result.models.adaboost,
                                ),
                              )}
                            </td>
                            <td className="p-3 font-mono text-emerald-300">
                              {format(
                                getValue(
                                  result.models.gradient_boosting,
                                ),
                              )}
                            </td>
                          </tr>
                        );
                      })}
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

                  {result.warnings.map((warning, index) => (
                    <p
                      key={index}
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

      {experimentHistory.length > 0 && (
        <BoostingExperimentHistory
          experiments={experimentHistory}
          onDelete={deleteExperiment}
          onClear={clearExperimentHistory}
        />
      )}
    </div>
  );
}
