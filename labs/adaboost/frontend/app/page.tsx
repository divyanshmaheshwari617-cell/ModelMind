
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";

import {
  BrainCircuit,
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Activity,
  Layers3,
  ChartNoAxesCombined,
  Download,
  Info,
  Sparkles,
  Database,
  Settings2,
} from "lucide-react";

import { getDataset, trainModel, getDynamicSurface } from "@/lib/api";

import type {
  DataRow,
  DataSet,
  Task,
  TrainConfig,
  TrainResult,
  MissingStrategy,
} from "@/lib/types";

import {
  LearningCurve,
  WeightChart,
  ImportanceChart,
  SurfaceChart,
  pretty,
} from "@/components/charts";

import AdaBoostTheoryStudio from "@/components/AdaBoostTheoryStudio";
import BoostingProcessStudio from "@/components/BoostingProcessStudio";

const collections = [
  {
    id: "moons",
    name: "Two Moons",
    desc: "Noisy curves • classification",
  },
  {
    id: "complex-classification",
    name: "Mixed Classification",
    desc: "Missing data • categories",
  },
  {
    id: "nonlinear-regression",
    name: "Nonlinear Regression",
    desc: "Sinusoidal • interactions",
  },
  {
    id: "mixed-regression",
    name: "Mixed Regression",
    desc: "Friedman • categorical",
  },
];

const cap = (s: string) =>
  s.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());

const missing = (value: unknown) =>
  value === null ||
  value === undefined ||
  String(value).trim() === "";

function numericColumns(rows: DataRow[], columns: string[]) {
  return columns.filter((c) => {
    const values = rows.map((r) => r[c]).filter((v) => !missing(v));

    return (
      values.length > 0 &&
      values.filter((v) =>
        typeof v === "number"
          ? Number.isFinite(v)
          : String(v).trim() !== "" && Number.isFinite(Number(v))
      ).length /
        values.length >=
        0.95
    );
  });
}

// ============================================================
// DATASET INSIGHTS
// ============================================================

function DatasetInsights({
  data,
  target,
  features,
  task,
}: {
  data: DataSet;
  target: string;
  features: string[];
  task: Task;
}) {
  const summary = useMemo(() => {
    const nums = numericColumns(
      data.rows,
      data.columns.filter((c) => c !== target)
    );

    const missingByColumn = data.columns
      .map((c) => ({
        name: c,
        count: data.rows.filter((r) => missing(r[c])).length,
      }))
      .filter((v) => v.count > 0)
      .sort((a, b) => b.count - a.count);

    const targetValues = data.rows
      .map((r) => r[target])
      .filter((v) => !missing(v));

    const counts = new Map<string, number>();

    targetValues.forEach((v) =>
      counts.set(String(v), (counts.get(String(v)) || 0) + 1)
    );

    return {
      nums,
      missingByColumn,
      missingTotal: missingByColumn.reduce(
        (a, b) => a + b.count,
        0
      ),
      targetMissing: data.rows.length - targetValues.length,
      classes: [...counts].sort((a, b) => b[1] - a[1]),
      distinct: counts.size,
    };
  }, [data, target]);

  return (
    <div className="insights">
      <div className="insights-grid">
        <div>
          <b>{data.rows.length}</b>
          <small>Rows</small>
        </div>

        <div>
          <b>{summary.nums.length}</b>
          <small>Numeric columns</small>
        </div>

        <div>
          <b>{data.columns.length - summary.nums.length - 1}</b>
          <small>Other predictors</small>
        </div>

        <div>
          <b>{summary.missingTotal}</b>
          <small>Missing cells</small>
        </div>
      </div>

      <p className="small">
        <b>Dataset health:</b> {summary.targetMissing} missing targets;{" "}
        {summary.distinct} distinct nonempty target values;{" "}
        {features.length} selected inputs. Missing inputs are
        imputed using training-only statistics.
      </p>

      {summary.missingByColumn.length > 0 && (
        <div className="insights-rows">
          {summary.missingByColumn.slice(0, 7).map((x) => (
            <div key={x.name}>
              <span>{x.name}</span>

              <div className="missing-track">
                <div
                  style={{
                    width: `${(100 * x.count) / data.rows.length}%`,
                  }}
                />
              </div>

              <span>
                {((100 * x.count) / data.rows.length).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {task === "classification" && (
        <div className="insights-classes">
          <b>Target distribution</b>

          {summary.classes.slice(0, 10).map(([label, count]) => (
            <div key={label}>
              <span>{label}</span>

              <strong>
                {count} (
                {(
                  (100 * count) /
                  Math.max(
                    1,
                    data.rows.length - summary.targetMissing
                  )
                ).toFixed(1)}
                %)
              </strong>
            </div>
          ))}
        </div>
      )}

      {task === "regression" && (
        <p className="small">
          Regression target should be numeric and contain at least
          three distinct valid values.
        </p>
      )}

      <details>
        <summary>Preview uploaded rows</summary>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                {data.columns.slice(0, 10).map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.rows.slice(0, 6).map((r, i) => (
                <tr key={i}>
                  {data.columns.slice(0, 10).map((c) => (
                    <td key={c}>
                      {missing(r[c]) ? "—" : String(r[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

// ============================================================
// EXISTING THEORY PANEL
// ============================================================

function TheoryStudio({
  task,
  stage,
  result,
}: {
  task: Task;
  stage: number;
  result: TrainResult | null;
}) {
  const [level, setLevel] = useState<
    "basic" | "intermediate" | "advanced"
  >("basic");

  const current = result?.stages[stage];

  return (
    <div className="theory">
      <div className="tabs">
        {(["basic", "intermediate", "advanced"] as const).map(
          (v) => (
            <button
              key={v}
              className={v === level ? "current" : ""}
              onClick={() => setLevel(v)}
            >
              {cap(v)}
            </button>
          )
        )}
      </div>

      {level === "basic" ? (
        <>
          <h3>Why AdaBoost works</h3>

          <p>
            A weak learner (typically a small decision tree) makes
            a simple prediction. AdaBoost trains the next learner
            using a new weighting of training examples so the
            ensemble can correct earlier mistakes.
          </p>

          <p>
            Imagine five teachers solving the same question: we
            give more attention to questions the first teacher
            missed, then combine what they learned. AdaBoost does
            this automatically using a sequence of models.
          </p>

          <p>
            <b>
              {task === "classification"
                ? "Classification"
                : "Regression"}
              :
            </b>{" "}
            {task === "classification"
              ? "The final result combines weighted classification decisions. A low weighted classification error usually means a learner receives more influence."
              : "AdaBoost.R2 resamples examples using error-dependent weights and combines regression estimates using a weighted median."}
          </p>
        </>
      ) : level === "intermediate" ? (
        <>
          <h3>Understand the training controls</h3>

          <p>
            <b>n_estimators:</b> Upper limit on boosting rounds.
            More rounds may improve fit, but can increase training
            time or overfitting.
          </p>

          <p>
            <b>learning_rate:</b> Scales each learner&apos;s influence.
            Try smaller rates with more estimators and compare
            train/test curves.
          </p>

          <p>
            <b>max_depth:</b> Complexity of each decision tree.
            Depth 1 creates decision stumps; deeper trees learn
            feature interactions but can overfit.
          </p>

          <p>
            <b>min_samples_leaf:</b> Minimum observations in each
            leaf; larger values generally smooth boundaries.
          </p>

          <p>
            <b>Train vs test:</b> A large performance gap can be a
            warning sign of overfitting. Classification uses
            accuracy and macro-F1; regression uses R² and error
            metrics.
          </p>
        </>
      ) : (
        <>
          <h3>Mathematics and implementation details</h3>

          <p>
            <b>AdaBoost binary classification intuition:</b>{" "}
            weighted error εₜ = Σᵢ wᵢ·I(yᵢ ≠ hₜ(xᵢ)) / Σᵢ wᵢ.
          </p>

          <div className="formula">
            αₜ = learning_rate × ln((1 − εₜ) / εₜ)
          </div>

          <p>
            For multiclass SAMME, the learner weight includes
            ln(K − 1). Weighted errors and estimator weights
            depend on the implementation and class count.
          </p>

          <p>
            Weights shift towards examples the learner
            misclassifies, and the final classifier combines
            the weak learners&apos; weighted votes.
          </p>

          <p>
            <b>AdaBoost.R2:</b> Normalizes individual prediction
            errors, assigns loss-based sample weights, and uses
            the weighted median of the regressors. The SAMME
            equation above is not its regression formula.
          </p>

          <p>
            <b>Leakage prevention:</b> The split must happen
            before fitting imputers, encoders, and the estimator.
            The plot fixes unplotted features at training-set
            medians or modes; it is a slice, not a complete
            picture of a high-dimensional model.
          </p>
        </>
      )}

      {current && (
        <div className="notice">
          At round {current.round}, learner error ={" "}
          {pretty(current.error)}, learner weight ={" "}
          {pretty(current.weight)}. These are diagnostics;
          inspect test performance across rounds before
          drawing conclusions.
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================

function Card({
  title,
  desc,
  children,
  extra,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="cardhead">
        <div>
          <h2>{title}</h2>
          {desc && <p className="small">{desc}</p>}
        </div>

        {extra}
      </div>

      {children}
    </section>
  );
}

function NumberControl({
  name,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (x: number) => void;
}) {
  return (
    <label className="control">
      <span>
        {name}
        <b>{value}</b>
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Metric({
  name,
  value,
}: {
  name: string;
  value: number | null | undefined;
}) {
  return (
    <div className="metric">
      <span>{cap(name)}</span>
      <strong>{pretty(value)}</strong>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Page() {
  const [data, setData] = useState<DataSet | null>(null);
  const [datasetId, setDatasetId] = useState("moons");

  const [task, setTask] = useState<Task>("classification");
  const [target, setTarget] = useState("target");

  const [features, setFeatures] = useState<string[]>([]);
  const [plotAxes, setPlotAxes] = useState<string[]>([]);

  const [estimators, setEstimators] = useState(60);
  const [lr, setLr] = useState(0.8);
  const [depth, setDepth] = useState(1);
  const [leaf, setLeaf] = useState(1);

  const [loss, setLoss] = useState<
    "linear" | "square" | "exponential"
  >("linear");

  const [testSize, setTestSize] = useState(0.25);

  const [missingStrategy, setMissingStrategy] =
    useState<MissingStrategy>("median");

  const [catMissingStrategy, setCatMissingStrategy] =
    useState<"most_frequent" | "constant" | "drop">(
      "most_frequent"
    );

  const [missingFill, setMissingFill] = useState(0);
  const [catMissingFill, setCatMissingFill] =
    useState("Missing");

  const [columnStrategies, setColumnStrategies] =
    useState<Record<string, MissingStrategy>>({});

  const [result, setResult] = useState<TrainResult | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [loadData, setLoadData] = useState(false);
  const [err, setErr] = useState("");

  // Shared stage state for dashboard and Boosting Process Studio.
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [threeD, setThreeD] = useState(false);

  const [visualAxes, setVisualAxes] =
    useState<[string, string]>(["", ""]);

  const [visualSurface, setVisualSurface] =
    useState<TrainResult["surface"]>(null);

  const [surfaceLoading, setSurfaceLoading] =
    useState(false);

  const [surfaceError, setSurfaceError] =
    useState("");

  const surfaceRequestId = useRef(0);

  const trainedNumericFeatures =
    result?.numeric_features ??
    result?.preprocessing.numeric ??
    [];

  const activeSurface =
    visualSurface ?? result?.surface ?? null;

  // Invalidate pending requests if the model is cleared.
  useEffect(() => {
    if (!result) {
      surfaceRequestId.current += 1;
      setVisualSurface(null);
      setSurfaceLoading(false);
      setSurfaceError("");
    }
  }, [result]);

  // Change the surface using the already-trained model.
  // This function NEVER calls trainModel().
  function changeVisualAxis(
    axis: 0 | 1,
    feature: string
  ) {
    if (
      !result?.session_id ||
      surfaceLoading ||
      !trainedNumericFeatures.includes(feature)
    ) {
      return;
    }

    const next: [string, string] = [...visualAxes];

    next[axis] = feature;

    if (
      !next[0] ||
      !next[1] ||
      next[0] === next[1]
    ) {
      return;
    }

    if (
      next[0] === visualAxes[0] &&
      next[1] === visualAxes[1]
    ) {
      return;
    }

    setVisualAxes(next);
    setSurfaceLoading(true);
    setSurfaceError("");

    const requestId = ++surfaceRequestId.current;

    void getDynamicSurface({
      session_id: result.session_id,
      feature_x: next[0],
      feature_y: next[1],
    })
      .then((surface) => {
        if (surfaceRequestId.current === requestId) {
          setVisualSurface(surface);
        }
      })
      .catch((error: unknown) => {
        if (surfaceRequestId.current === requestId) {
          setSurfaceError(
            error instanceof Error
              ? error.message
              : String(error)
          );
        }
      })
      .finally(() => {
        if (surfaceRequestId.current === requestId) {
          setSurfaceLoading(false);
        }
      });
  }

  const [tab, setTab] = useState<
    "visualize" | "metrics" | "explain" | "predictions"
  >("visualize");

  const fileRef = useRef<HTMLInputElement>(null);

  // ==========================================================
  // DATASET LOADING
  // ==========================================================

  async function fetchDataset(id: string) {
    setLoadData(true);
    setErr("");

    try {
      const ds = await getDataset(id);

      setData(ds);
      setTask(ds.task);
      setTarget(ds.target);
      setFeatures(ds.features);

      setPlotAxes(
        numericColumns(ds.rows, ds.features).slice(0, 2)
      );

      setResult(null);
      setColumnStrategies({});
      setStage(0);
      setPlaying(false);
      setDatasetId(id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadData(false);
    }
  }

  useEffect(() => {
    void fetchDataset("moons");
  }, []);

  // Existing dashboard playback.
  useEffect(() => {
    if (!playing || !result) return;

    const timer = setInterval(() => {
      setStage((current) => {
        if (current >= result.stages.length - 1) {
          setPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [playing, result]);

  // Shared stage handler.
  function selectBoostingStage(nextStage: number) {
    setPlaying(false);

    const maximum = result
      ? Math.max(0, result.stages.length - 1)
      : 0;

    setStage(
      Math.min(
        maximum,
        Math.max(0, nextStage)
      )
    );
  }

  // ==========================================================
  // CSV UPLOAD
  // ==========================================================

  function handleFile(file?: File) {
    if (!file) return;

    setErr("");

    Papa.parse<DataRow>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,

      complete: (response) => {
        const rows = (response.data || []).filter((row) =>
          Object.values(row).some(
            (value) => value !== null && value !== ""
          )
        );

        const columns =
          response.meta.fields || Object.keys(rows[0] || {});

        if (!rows.length || columns.length < 2) {
          setErr(
            "CSV needs at least two columns and data rows"
          );
          return;
        }

        const tgt = columns.includes("target")
          ? "target"
          : columns[columns.length - 1];

        const values = rows
          .map((row) => row[tgt])
          .filter((value) => value != null && value !== "");

        const unique = new Set(values.map(String));

        const kind: Task =
          unique.size <= 12
            ? "classification"
            : "regression";

        const selectedFeatures = columns.filter(
          (c) => c !== tgt
        );

        setData({
          name: file.name,
          rows,
          columns,
          target: tgt,
          features: selectedFeatures,
          task: kind,
        });

        setTarget(tgt);
        setFeatures(selectedFeatures);

        setPlotAxes(
          numericColumns(
            rows,
            selectedFeatures
          ).slice(0, 2)
        );

        setTask(kind);
        setResult(null);
        setColumnStrategies({});
        setDatasetId("uploaded");
        setStage(0);
        setPlaying(false);
      },

      error: (error) => setErr(error.message),
    });
  }

  const usableFeatures = useMemo(
    () => data?.columns.filter((c) => c !== target) || [],
    [data, target]
  );

  const numericFeatures = useMemo(
    () => (data ? numericColumns(data.rows, features) : []),
    [data, features]
  );

  // ==========================================================
  // MODEL TRAINING
  // ==========================================================

  async function run() {
    if (
      plotAxes.length === 2 &&
      plotAxes[0] === plotAxes[1]
    ) {
      setErr("Choose two different visualization axes");
      return;
    }

    if (!data || features.length === 0) {
      setErr("Select a dataset and at least one feature");
      return;
    }

    surfaceRequestId.current += 1;
    setSurfaceLoading(false);
    setSurfaceError("");

    setLoading(true);
    setErr("");
    setPlaying(false);

    try {
      const input: TrainConfig = {
        rows: data.rows,
        features,
        target,
        task,
        n_estimators: estimators,
        learning_rate: lr,
        max_depth: depth,
        min_samples_leaf: leaf,
        loss,
        test_size: testSize,
        random_state: 42,
        compare_baseline: true,

        missing_strategy: missingStrategy,
        categorical_missing_strategy: catMissingStrategy,
        missing_fill_value: missingFill,
        categorical_fill_value: catMissingFill,
        feature_strategies: columnStrategies,

        plot_features:
          plotAxes.length === 2 &&
          plotAxes.every((f) => numericFeatures.includes(f))
            ? plotAxes
            : undefined,
      };

      const response = await trainModel(input);

      setResult(response);

      setVisualSurface(response.surface);

      setVisualAxes([
        response.surface?.feature_x ??
          response.numeric_features?.[0] ??
          "",
        response.surface?.feature_y ??
          response.numeric_features?.[1] ??
          "",
      ]);

      setStage(
        Math.max(0, response.stages.length - 1)
      );

      setTab("visualize");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // DOWNLOAD REPORT
  // ==========================================================

  function download() {
    if (!result) return;

    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelmind-adaboost-report.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  const active = result?.stages[stage];

  const focus =
    task === "classification"
      ? "accuracy"
      : "r2";

  // ==========================================================
  // PAGE RENDERING
  // ==========================================================

  return (
    <div className="shell">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="logo">
            <BrainCircuit size={22} />
          </div>

          <div>
            <strong>modelmind</strong>
            <small>ADABOOST LAB</small>
          </div>
        </div>

        <div className="sidetitle">
          LAB WORKSPACE
        </div>

        <a href="#datasets">
          <Database size={17} />
          Dataset studio
        </a>

        <a href="#controls">
          <Settings2 size={17} />
          Model controls
        </a>

        <a href="#results">
          <Activity size={17} />
          Training results
        </a>

        <a href="#boosting-process">
          <Layers3 size={17} />
          Boosting process
        </a>

        <a href="#learning">
          <Layers3 size={17} />
          Learning intuition
        </a>

        <div className="sidebottom">
          <span className="statusdot" />
          AdaBoost Classifier + Regressor
          <br />
          <small>
            Built for exploration · v1.0
          </small>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="content">
        <header className="topbar">
          <span>
            MODEL LABS
            <ChevronRight size={14} />
            ENSEMBLE METHODS
            <ChevronRight size={14} />
            <b>ADABOOST</b>
          </span>

          <span className="pill">
            Interactive Laboratory
          </span>
        </header>

        {/* HERO */}

        <div className="hero">
          <div className="eyebrow">
            <Sparkles size={15} />
            MODEL MIND / ENSEMBLE INTELLIGENCE
          </div>

          <h1>
            Learn how <em>weak learners</em>
            <br />
            become a strong ensemble.
          </h1>

          <p>
            Build AdaBoost models, inspect every boosting
            round, explore loss curves, and visualize how
            model confidence evolves.
          </p>

          <div className="herochips">
            <span>Classification + Regression</span>
            <span>Stage playback</span>
            <span>2D / 3D</span>
            <span>Train vs Test</span>
          </div>
        </div>

        {err && (
          <div role="alert" className="error">
            {err}
          </div>
        )}

        <div className="two">
          {/* ================================================
              DATASET STUDIO
          ================================================= */}

          <div id="datasets">
            <Card
              title="01 · Dataset Studio"
              desc="Built-in datasets or upload your own CSV"
              extra={
                <button
                  className="ghost"
                  onClick={() => fileRef.current?.click()}
                >
                  <UploadCloud size={15} />
                  Upload CSV
                </button>
              }
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) =>
                  handleFile(e.target.files?.[0])
                }
              />

              <div className="datasetgrid">
                {collections.map((dataset) => (
                  <button
                    type="button"
                    disabled={loadData}
                    onClick={() =>
                      void fetchDataset(dataset.id)
                    }
                    className={
                      "datasetbtn " +
                      (datasetId === dataset.id
                        ? "chosen"
                        : "")
                    }
                    key={dataset.id}
                  >
                    <strong>{dataset.name}</strong>
                    <span>{dataset.desc}</span>
                  </button>
                ))}
              </div>

              {data && (
                <>
                  <div className="datainfo">
                    <span>
                      <b>{data.rows.length}</b> samples
                    </span>

                    <span>
                      <b>{data.columns.length - 1}</b>{" "}
                      predictors available
                    </span>

                    <span>
                      <b>{task}</b>
                    </span>
                  </div>

                  <div className="formrow">
                    <label>
                      Problem type
                      <select
                        value={task}
                        onChange={(e) => {
                          setTask(e.target.value as Task);
                          setResult(null);
                        }}
                      >
                        <option value="classification">
                          Classification
                        </option>
                        <option value="regression">
                          Regression
                        </option>
                      </select>
                    </label>

                    <label>
                      Target column
                      <select
                        value={target}
                        onChange={(e) => {
                          const nextTarget = e.target.value;
                          const nextFeatures =
                            data.columns.filter(
                              (c) => c !== nextTarget
                            );

                          setTarget(nextTarget);
                          setFeatures(nextFeatures);

                          setPlotAxes(
                            numericColumns(
                              data.rows,
                              nextFeatures
                            ).slice(0, 2)
                          );

                          setResult(null);
                        }}
                      >
                        {data.columns.map((column) => (
                          <option
                            value={column}
                            key={column}
                          >
                            {column}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="featurehead">
                    Features selected
                    <span>
                      {features.length}/{usableFeatures.length}
                    </span>
                  </div>

                  <div className="chips">
                    {usableFeatures.map((feature) => (
                      <label
                        className={
                          "feature " +
                          (features.includes(feature)
                            ? "selected"
                            : "")
                        }
                        key={feature}
                      >
                        <input
                          type="checkbox"
                          checked={features.includes(feature)}
                          onChange={(e) =>
                            setFeatures((old) =>
                              e.target.checked
                                ? [...old, feature]
                                : old.filter(
                                    (x) => x !== feature
                                  )
                            )
                          }
                        />

                        {feature}
                      </label>
                    ))}
                  </div>

                  <DatasetInsights
                    data={data}
                    target={target}
                    features={features}
                    task={task}
                  />
                </>
              )}
            </Card>
          </div>

          {/* ================================================
              HYPERPARAMETER STUDIO
          ================================================= */}

          <div id="controls">
            <Card
              title="02 · Hyperparameter Studio"
              desc="Tune your weak learners and ensemble"
            >
              <NumberControl
                name="Boosting rounds (n_estimators)"
                value={estimators}
                min={1}
                max={200}
                onChange={setEstimators}
              />

              <NumberControl
                name="Learning rate"
                value={lr}
                min={0.05}
                max={2}
                step={0.05}
                onChange={setLr}
              />

              <NumberControl
                name="Tree depth"
                value={depth}
                min={1}
                max={8}
                onChange={setDepth}
              />

              <NumberControl
                name="Minimum samples per leaf"
                value={leaf}
                min={1}
                max={30}
                onChange={setLeaf}
              />

              <NumberControl
                name="Test split"
                value={testSize}
                min={0.1}
                max={0.4}
                step={0.05}
                onChange={setTestSize}
              />

              {task === "regression" && (
                <label className="singlelabel">
                  AdaBoost.R2 loss

                  <select
                    value={loss}
                    onChange={(e) =>
                      setLoss(
                        e.target.value as typeof loss
                      )
                    }
                  >
                    <option value="linear">
                      Linear
                    </option>
                    <option value="square">
                      Square
                    </option>
                    <option value="exponential">
                      Exponential
                    </option>
                  </select>
                </label>
              )}

              {/* MISSING VALUE STUDIO */}

              <div className="plot-selection">
                <h3>Missing Value Studio</h3>

                <p className="small">
                  Choose how missing input cells are handled.
                  Numerical: mean / median / mode / constant /
                  drop. Categorical: mode / constant / drop.
                  Imputation values are learned only from
                  training rows; missing targets are always
                  excluded.
                </p>

                <div className="formrow">
                  <label>
                    Default numeric strategy

                    <select
                      value={missingStrategy}
                      onChange={(e) => {
                        setMissingStrategy(
                          e.target.value as MissingStrategy
                        );
                        setResult(null);
                      }}
                    >
                      {(
                        [
                          "mean",
                          "median",
                          "most_frequent",
                          "constant",
                          "drop",
                        ] as const
                      ).map((strategy) => (
                        <option
                          key={strategy}
                          value={strategy}
                        >
                          {strategy === "most_frequent"
                            ? "Mode (most frequent)"
                            : strategy}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Default categorical strategy

                    <select
                      value={catMissingStrategy}
                      onChange={(e) => {
                        setCatMissingStrategy(
                          e.target.value as typeof catMissingStrategy
                        );
                        setResult(null);
                      }}
                    >
                      <option value="most_frequent">
                        Mode (most frequent)
                      </option>

                      <option value="constant">
                        Constant
                      </option>

                      <option value="drop">
                        Drop rows
                      </option>
                    </select>
                  </label>
                </div>

                {missingStrategy === "constant" && (
                  <label className="singlelabel">
                    Numeric constant value

                    <input
                      type="number"
                      value={missingFill}
                      onChange={(e) =>
                        setMissingFill(
                          Number(e.target.value)
                        )
                      }
                    />
                  </label>
                )}

                {catMissingStrategy === "constant" && (
                  <label className="singlelabel">
                    Categorical constant value

                    <input
                      value={catMissingFill}
                      onChange={(e) =>
                        setCatMissingFill(e.target.value)
                      }
                    />
                  </label>
                )}

                {data &&
                  features.filter((f) =>
                    data.rows.some((r) => missing(r[f]))
                  ).length > 0 && (
                    <details>
                      <summary>
                        Override strategy for individual columns
                      </summary>

                      <div className="formrow">
                        {features
                          .filter((f) =>
                            data.rows.some((r) =>
                              missing(r[f])
                            )
                          )
                          .map((f) => {
                            const isNum =
                              numericFeatures.includes(f);

                            const options = isNum
                              ? [
                                  "mean",
                                  "median",
                                  "most_frequent",
                                  "constant",
                                  "drop",
                                ]
                              : [
                                  "most_frequent",
                                  "constant",
                                  "drop",
                                ];

                            return (
                              <label key={f}>
                                {f}

                                <select
                                  value={
                                    columnStrategies[f] || ""
                                  }
                                  onChange={(e) => {
                                    setColumnStrategies(
                                      (old) => {
                                        const next = {
                                          ...old,
                                        };

                                        if (e.target.value) {
                                          next[f] =
                                            e.target.value as MissingStrategy;
                                        } else {
                                          delete next[f];
                                        }

                                        return next;
                                      }
                                    );

                                    setResult(null);
                                  }}
                                >
                                  <option value="">
                                    Use default
                                  </option>

                                  {options.map((value) => (
                                    <option
                                      key={value}
                                      value={value}
                                    >
                                      {value ===
                                      "most_frequent"
                                        ? "Mode"
                                        : value === "drop"
                                        ? "Drop rows"
                                        : value}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            );
                          })}
                      </div>
                    </details>
                  )}
              </div>

              {/* 2D / 3D AXIS SELECTION */}

              <div className="plot-selection">
                <h3>2D / 3D plot axes</h3>

                <p className="small">
                  Plot any two numeric features while training
                  with all selected columns. Other features
                  are fixed at training-set median or mode.
                </p>

                {numericFeatures.length >= 2 ? (
                  <div className="formrow">
                    {[0, 1].map((index) => (
                      <label key={index}>
                        {index === 0
                          ? "Horizontal (X)"
                          : "Vertical (Y)"}

                        <select
                          value={
                            plotAxes[index] &&
                            numericFeatures.includes(
                              plotAxes[index]
                            )
                              ? plotAxes[index]
                              : ""
                          }
                          onChange={(e) =>
                            setPlotAxes((old) => {
                              const next = [...old];
                              next[index] = e.target.value;
                              return next;
                            })
                          }
                        >
                          <option value="">
                            Choose a feature
                          </option>

                          {numericFeatures.map((column) => (
                            <option
                              value={column}
                              key={column}
                            >
                              {column}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="notice">
                    Select at least two numeric input
                    columns to visualize a surface.
                  </div>
                )}

                {plotAxes.length === 2 &&
                  plotAxes[0] === plotAxes[1] && (
                    <p className="small">
                      Choose different columns for X and Y.
                    </p>
                  )}
              </div>

              <button
                className="primary full"
                disabled={loading || loadData || !data}
                onClick={() => void run()}
              >
                <Play
                  size={17}
                  fill="currentColor"
                />

                {loading
                  ? "Training the ensemble…"
                  : "Train & Visualize AdaBoost"}

                <ChevronRight size={18} />
              </button>
            </Card>
          </div>
        </div>

        {/* ================================================
            TRAINING DASHBOARD
        ================================================= */}

        <div id="results">
          <Card
            title="03 · Training Dashboard"
            desc={
              result
                ? `${result.actual_estimators} weak learners fitted · ${result.rows.train} train / ${result.rows.test} test samples`
                : "Run a model to reveal training analytics"
            }
            extra={
              result && (
                <button
                  className="ghost"
                  onClick={download}
                >
                  <Download size={16} />
                  Report JSON
                </button>
              )
            }
          >
            {!result ? (
              <div className="empty">
                <ChartNoAxesCombined size={45} />

                <h3>Ready when you are.</h3>

                <p>
                  Select features, adjust parameters and
                  press “Train & Visualize AdaBoost.”
                </p>
              </div>
            ) : (
              <>
                <div className="metricgrid">
                  <Metric
                    name={
                      focus === "accuracy"
                        ? "test accuracy"
                        : "test r2"
                    }
                    value={result.metrics.test[focus]}
                  />

                  <Metric
                    name={
                      focus === "accuracy"
                        ? "train accuracy"
                        : "train r2"
                    }
                    value={result.metrics.train[focus]}
                  />

                  <Metric
                    name={
                      task === "classification"
                        ? "test f1 macro"
                        : "test rmse"
                    }
                    value={
                      result.metrics.test[
                        task === "classification"
                          ? "f1_macro"
                          : "rmse"
                      ]
                    }
                  />

                  <Metric
                    name="weak learners"
                    value={result.actual_estimators}
                  />
                </div>

                <div className="tabs">
                  {(
                    [
                      "visualize",
                      "metrics",
                      "explain",
                      "predictions",
                    ] as const
                  ).map((item) => (
                    <button
                      key={item}
                      className={
                        tab === item ? "current" : ""
                      }
                      onClick={() => setTab(item)}
                    >
                      {cap(item)}
                    </button>
                  ))}
                </div>

                {/* VISUALIZATION TAB */}

                {tab === "visualize" && (
                  <>
                    <div className="playbar">
                      <span>
                        Boosting round{" "}
                        <b>
                          {stage + 1} /{" "}
                          {result.stages.length}
                        </b>
                      </span>

                      <div>
                        <button
                          className="ghost iconbutton"
                          aria-label="Reset"
                          onClick={() =>
                            selectBoostingStage(0)
                          }
                        >
                          <RotateCcw size={16} />
                        </button>

                        <button
                          className="ghost iconbutton"
                          aria-label={
                            playing ? "Pause" : "Play"
                          }
                          onClick={() => {
                            if (
                              stage ===
                              result.stages.length - 1
                            ) {
                              setStage(0);
                            }

                            setPlaying(!playing);
                          }}
                        >
                          {playing ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      </div>

                      <input
                        aria-label="Round"
                        type="range"
                        min={0}
                        max={
                          result.stages.length - 1
                        }
                        value={stage}
                        onChange={(e) =>
                          selectBoostingStage(
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="two">
                      <Card
                        title="Learning performance"
                        desc="Training vs testing by boosting round"
                      >
                        <LearningCurve
                          data={result.stages}
                          active={stage}
                          metric={focus}
                        />
                      </Card>

                      <Card
                        title="Weak learner influence"
                        desc="Estimator weights through the selected round"
                      >
                        <WeightChart
                          data={result.stages}
                          active={stage}
                        />
                      </Card>
                    </div>

                    {activeSurface && (
                      <Card
                        title="Decision boundary / regression surface"
                        desc="Plot two chosen numeric axes; other training features are held at representative values"
                        extra={
                          <div className="toggle">
                            <button
                              onClick={() =>
                                setThreeD(false)
                              }
                              className={
                                !threeD ? "active" : ""
                              }
                            >
                              2D
                            </button>

                            <button
                              onClick={() =>
                                setThreeD(true)
                              }
                              className={
                                threeD ? "active" : ""
                              }
                            >
                              3D
                            </button>
                          </div>
                        }
                      >
                        <div
                          className="plot-selection"
                          style={{ marginBottom: 16 }}
                        >
                          <h3>
                            Explore the trained model
                          </h3>

                          <p className="small">
                            Change X and Y without retraining AdaBoost.
                          </p>

                          <div className="formrow">
                            <label>
                              X-axis (input feature)

                              <select
                                aria-label="Visualization X-axis"
                                value={visualAxes[0]}
                                disabled={
                                  surfaceLoading ||
                                  !result.session_id
                                }
                                onChange={(event) =>
                                  changeVisualAxis(
                                    0,
                                    event.target.value
                                  )
                                }
                              >
                                {trainedNumericFeatures.map(
                                  (feature) => (
                                    <option
                                      key={feature}
                                      value={feature}
                                      disabled={
                                        feature === visualAxes[1]
                                      }
                                    >
                                      {feature}
                                    </option>
                                  )
                                )}
                              </select>
                            </label>

                            <label>
                              Y-axis (input feature)

                              <select
                                aria-label="Visualization Y-axis"
                                value={visualAxes[1]}
                                disabled={
                                  surfaceLoading ||
                                  !result.session_id
                                }
                                onChange={(event) =>
                                  changeVisualAxis(
                                    1,
                                    event.target.value
                                  )
                                }
                              >
                                {trainedNumericFeatures.map(
                                  (feature) => (
                                    <option
                                      key={feature}
                                      value={feature}
                                      disabled={
                                        feature === visualAxes[0]
                                      }
                                    >
                                      {feature}
                                    </option>
                                  )
                                )}
                              </select>
                            </label>
                          </div>

                          <p className="small">
                            Z-axis (3D):{" "}
                            {result.task === "regression"
                              ? `Predicted ${result.target}`
                              : result.classes.length === 2
                              ? `Probability of ${result.target} = ${result.classes[1]}`
                              : `Predicted ${result.target} class index`}
                          </p>

                          {surfaceLoading && (
                            <p className="small" role="status">
                              Updating prediction surface…
                            </p>
                          )}

                          {surfaceError && (
                            <p className="error" role="alert">
                              {surfaceError}
                            </p>
                          )}

                          {!result.session_id && (
                            <p className="small">
                              Train with the updated backend
                              to enable live axis switching.
                            </p>
                          )}
                        </div>

                        <SurfaceChart
                          surface={activeSurface}
                          task={result.task}
                          classes={result.classes}
                          threeD={threeD}
                          target={result.target}
                        />

                        <p className="small">
                          Surface represents the final
                          full-feature model over the two
                          chosen axes. Other features are
                          fixed at training-set medians or
                          modes; stage playback is separate.
                        </p>
                      </Card>
                    )}

                    {!activeSurface && (
                      <div className="notice">
                        <Info size={17} />
                        Select at least two numeric predictors
                        and two different plot axes to enable
                        the 2D decision map and 3D surface.
                      </div>
                    )}
                  </>
                )}

                {/* METRICS TAB */}

                {tab === "metrics" && (
                  <div className="two">
                    <Card title="Final train / test metrics">
                      <div className="tablewrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Metric</th>
                              <th>Train</th>
                              <th>Test</th>
                              <th>Decision tree</th>
                            </tr>
                          </thead>

                          <tbody>
                            {Object.keys(
                              result.metrics.test
                            ).map((metric) => (
                              <tr key={metric}>
                                <td>
                                  {cap(metric)}
                                </td>

                                <td>
                                  {pretty(
                                    result.metrics.train[
                                      metric
                                    ]
                                  )}
                                </td>

                                <td>
                                  {pretty(
                                    result.metrics.test[
                                      metric
                                    ]
                                  )}
                                </td>

                                <td>
                                  {pretty(
                                    result.metrics.baseline?.[
                                      metric
                                    ]
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    <Card
                      title="Feature importance"
                      desc="Combined weighted importance across the ensemble"
                    >
                      <ImportanceChart
                        data={result.importance}
                      />
                    </Card>

                    {result.confusion_matrix && (
                      <Card
                        title="Confusion matrix"
                        desc={
                          "Class order: " +
                          result.classes.join(", ")
                        }
                      >
                        <table>
                          <tbody>
                            {result.confusion_matrix.map(
                              (row, i) => (
                                <tr key={i}>
                                  {row.map((value, j) => (
                                    <td
                                      key={j}
                                      className="matrixcell"
                                    >
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </Card>
                    )}
                  </div>
                )}

                {/* EXPLAIN TAB */}

                {tab === "explain" && (
                  <div className="explainer">
                    <TheoryStudio
                      task={task}
                      stage={stage}
                      result={result}
                    />

                    <h3>
                      Inside boosting round {stage + 1}
                    </h3>

                    <div className="metricgrid">
                      <Metric
                        name="estimator weight"
                        value={active?.weight}
                      />

                      <Metric
                        name="weighted estimator error"
                        value={active?.error}
                      />

                      <Metric
                        name={"staged test " + focus}
                        value={active?.test[focus]}
                      />

                      <Metric
                        name={"staged train " + focus}
                        value={active?.train[focus]}
                      />
                    </div>

                    <p>
                      <b>Classification:</b> AdaBoost
                      fits a weak classifier, measures its
                      weighted error, and increases focus
                      on previously misclassified training
                      samples. The final decision combines
                      weighted weak learners.
                    </p>

                    <p>
                      <b>Regression:</b> AdaBoost.R2 uses
                      normalized prediction errors to
                      update sampling weights and combines
                      regressors through a weighted median.
                      Its estimator weights should not be
                      interpreted with the classification
                      SAMME error formula.
                    </p>

                    <div className="formula">
                      Binary / SAMME learner weight:
                      α = learning_rate ×
                      ln((1 − error) / error)
                    </div>

                    <p className="small">
                      For multiclass SAMME, an extra
                      ln(K−1) term applies. This
                      mathematical panel is for intuition;
                      implementation follows your installed
                      scikit-learn version.
                    </p>
                  </div>
                )}

                {/* PREDICTIONS TAB */}

                {tab === "predictions" && (
                  <div className="tablewrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Row ID</th>
                          <th>Actual</th>
                          <th>Predicted</th>
                          <th>Result</th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.predictions.map((row) => (
                          <tr key={row.index}>
                            <td>{row.index}</td>
                            <td>{String(row.actual)}</td>
                            <td>{String(row.predicted)}</td>

                            <td>
                              {row.correct == null
                                ? "—"
                                : row.correct
                                ? "Correct"
                                : "Incorrect"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* ================================================
            NEW BOOSTING PROCESS STUDIO
        ================================================= */}

        <section
          id="boosting-process"
          style={{ marginTop: 24 }}
        >
          <BoostingProcessStudio
            result={result}
            stage={stage}
            onStageChange={selectBoostingStage}
          />
        </section>

        {/* ================================================
            EXISTING LEARNING INTUITION SECTION
        ================================================= */}

        <section
          id="learning"
          className="learning"
        >
          <AdaBoostTheoryStudio
            task={task}
            stage={stage}
            result={result}
            learningRate={lr}
          />

          <TheoryStudio
            task={task}
            stage={stage}
            result={result}
          />

          <div className="eyebrow">
            UNDERSTAND THE ALGORITHM
          </div>

          <h2>
            Boosting builds intelligence{" "}
            <em>one weak learner at a time.</em>
          </h2>

          <div className="learninggrid">
            <div>
              <span>01</span>
              <h3>Start small</h3>
              <p>
                A shallow decision tree makes simple
                predictions. With depth 1, it is a
                decision stump.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Focus on mistakes</h3>
              <p>
                Adaptive weights emphasize samples or
                errors that the previous model struggled
                with.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Combine carefully</h3>
              <p>
                Weighted classification votes or a
                regression weighted median produce
                stronger predictions.
              </p>
            </div>
          </div>
        </section>

        <footer>
          modelmind / adaboost lab · Interactive research
          &amp; education · No quiz required
        </footer>
      </main>
    </div>
  );
}
