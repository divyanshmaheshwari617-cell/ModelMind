
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Database,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import PolynomialBackend2DChart from "@/components/charts/PolynomialBackend2DChart";
import Polynomial3DChart from "@/components/charts/Polynomial3DChart";
import PolynomialDatasetManager, {
  getUploadedPoints,
  type UploadedDataset,
} from "@/components/dataset/PolynomialDatasetManager";
import PolynomialLearningStudio from "@/components/learning/PolynomialLearningStudio";
import PolynomialMathVisualizer from "@/components/learning/PolynomialMathVisualizer";
import PolynomialAnimationStudio from "@/components/animation/PolynomialAnimationStudio";
import PolynomialComparisonStudio from "@/components/comparison/PolynomialComparisonStudio";
import PolynomialResidualStudio from "@/components/residuals/PolynomialResidualStudio";
import PolynomialCoefficientStudio from "@/components/coefficients/PolynomialCoefficientStudio";
import PolynomialRegularizationStudio from "@/components/regularization/PolynomialRegularizationStudio";
import PolynomialPredictionExplorer from "@/components/prediction/PolynomialPredictionExplorer";

import { polynomialDatasets } from "@/lib/datasets/polynomialDatasets";
import {
  getPolynomialCurve,
  getPolynomialSurface,
  findBestPolynomialDegree,
  predictPolynomialValues,
  type CurveResponse,
  type SurfaceResponse,
  type Regularization,
  type TrainingRequest,
  type PreprocessingConfig,
  type DegreeSearchResponse,
  type NewPredictionResponse,
} from "@/lib/api/polynomialApi";

const PolynomialLoss3DChart = dynamic(
  () => import("@/components/charts/PolynomialLoss3DChart"),
  { ssr: false },
);

type ViewMode = "2d" | "3d";
type ThreeDType = "loss" | "regression";

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";
const field =
  "w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white";
const primary =
  "rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40";
const secondary =
  "rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40";

function fmt(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(4);
}

function countTerms(n: number, degree: number) {
  if (n < 1) return 0;
  let value = 1;
  for (let i = 1; i <= degree; i++) {
    value = (value * (n + i)) / i;
  }
  return Math.round(value - 1);
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: number | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-2xl font-bold">
        {fmt(value)}
      </p>
    </div>
  );
}

export default function Home() {
  const [datasetId, setDatasetId] = useState("quadratic");
  const [uploadedDataset, setUploadedDataset] =
    useState<UploadedDataset | null>(null);

  const [selectedFeature, setSelectedFeature] = useState("");
  const [selectedFeatures, setSelectedFeatures] =
    useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState("");

  const [degree, setDegree] = useState(2);
  const [regularization, setRegularization] =
    useState<Regularization>("none");
  const [alpha, setAlpha] = useState(1);
  const [testSize, setTestSize] = useState(0.2);
  const [standardize, setStandardize] = useState(true);
  const [showResiduals, setShowResiduals] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [threeDType, setThreeDType] =
    useState<ThreeDType>("loss");
  const [surfaceX, setSurfaceX] = useState("");
  const [surfaceY, setSurfaceY] = useState("");

  const [curve, setCurve] = useState<CurveResponse | null>(null);
  const [surface, setSurface] =
    useState<SurfaceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comparisonFrames, setComparisonFrames] = useState<
    Record<number, CurveResponse | SurfaceResponse>
  >({});

  const [degreeSearch, setDegreeSearch] =
    useState<DegreeSearchResponse | null>(null);
  const [searchingDegree, setSearchingDegree] = useState(false);
  const [degreeError, setDegreeError] = useState("");

  const [predictionInputs, setPredictionInputs] = useState<
    Record<string, string>
  >({});
  const [newPrediction, setNewPrediction] =
    useState<NewPredictionResponse | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  const dataset = useMemo(
    () =>
      polynomialDatasets.find((d) => d.id === datasetId) ??
      polynomialDatasets[0],
    [datasetId],
  );

  const numericColumns = uploadedDataset?.numericColumns ?? [];
  const availableFeatures = numericColumns.filter(
    (name) => name !== selectedTarget,
  );

  const modelFeatures = uploadedDataset
  ? selectedFeatures.filter((name) =>
      availableFeatures.includes(name),
    )
  : (dataset.features ?? ["x"]);

const modelTarget = uploadedDataset
  ? selectedTarget
  : (dataset.target ?? "y");
  const xFeature = modelFeatures.includes(selectedFeature)
    ? selectedFeature
    : (modelFeatures[0] ?? "");

  // Regression surfaces need two independent input columns.
  // Loss surfaces do not.
  const canUseRegression3D = modelFeatures.length >= 2;
  const canUseLoss3D = modelFeatures.length === 1;

  const effectiveSurfaceX = modelFeatures.includes(surfaceX)
    ? surfaceX
    : (modelFeatures[0] ?? "");

  const effectiveSurfaceY =
    modelFeatures.includes(surfaceY) &&
    surfaceY !== effectiveSurfaceX
      ? surfaceY
      : (modelFeatures.find(
          (name) => name !== effectiveSurfaceX,
        ) ?? "");

  // Prevent invalid 3D regression requests if feature
  // selections change while a regression surface is open.
  const effective3DType: ThreeDType =
    threeDType === "regression" && !canUseRegression3D
      ? "loss"
      : threeDType === "loss" &&
          !canUseLoss3D &&
          canUseRegression3D
        ? "regression"
        : threeDType;

  const isRegressionSurface =
    viewMode === "3d" &&
    effective3DType === "regression" &&
    canUseRegression3D;

  const isLossSurface =
    viewMode === "3d" &&
    effective3DType === "loss" &&
    canUseLoss3D;

  // Existing studios understand only "2d" and "3d".
  // A coefficient-loss surface is not a regression
  // surface, so studios receive "2d" in loss mode.
  const studioViewMode: ViewMode = isRegressionSurface
    ? "3d"
    : "2d";

  const termCount = countTerms(
    modelFeatures.length,
    degree,
  );

  const complexityError =
    termCount > 500
      ? `${termCount} polynomial terms exceed the 500-term limit. Reduce degree or feature count.`
      : null;

  const request = useMemo<TrainingRequest | null>(() => {
    if (uploadedDataset) {
      const features = selectedFeatures.filter(
        (name) =>
          uploadedDataset.numericColumns.includes(name) &&
          name !== selectedTarget,
      );

      if (
        !selectedTarget ||
        features.length === 0 ||
        features.length > 8
      ) {
        return null;
      }

      const strategies:
        PreprocessingConfig["feature_strategies"] = {};

      for (const name of features) {
        const strategy =
          uploadedDataset.preprocessing?.feature_strategies[
            name
          ];
        if (strategy) strategies[name] = strategy;
      }

      const preprocessing: PreprocessingConfig | undefined =
        uploadedDataset.preprocessing
          ? {
              default_strategy:
                uploadedDataset.preprocessing.default_strategy,
              feature_strategies: strategies,
            }
          : undefined;

      return {
        rows: uploadedDataset.rows.map((row) => {
          const converted: Record<
            string,
            string | number | null
          > = {};

          for (const [key, value] of Object.entries(row)) {
            converted[key] =
              value == null
                ? null
                : typeof value === "number"
                  ? Number.isFinite(value)
                    ? value
                    : null
                  : String(value);
          }
          return converted;
        }),
        features,
        target: selectedTarget,
        degree,
        regularization,
        alpha,
        test_size: testSize,
        random_state: 42,
        interaction_only: false,
        standardize,
        preprocessing,
      };
    }

    return {
  rows:
    dataset.rows ??
    dataset.points.map((p) => ({
      x: p.x,
      y: p.y,
    })),
  features: dataset.features ?? ["x"],
  target: dataset.target ?? "y",
  degree,
  regularization,
  alpha,
  test_size: testSize,
  random_state: 42,
  interaction_only: false,
  standardize,
};
  }, [
    uploadedDataset,
    selectedFeatures,
    selectedTarget,
    dataset,
    degree,
    regularization,
    alpha,
    testSize,
    standardize,
  ]);

  // A single effect owns the active experiment response.
  // 2D and 3D loss use the curve endpoint.
  // 3D regression uses the surface endpoint.
  useEffect(() => {
    const controller = new AbortController();

    if (!request || complexityError) {
      return () => controller.abort();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setCurve(null);
    setSurface(null);

    async function load() {
      if (!request) return;

      try {
        if (isRegressionSurface) {
          const response = await getPolynomialSurface(
            {
              ...request,
              x_feature: effectiveSurfaceX,
              y_feature: effectiveSurfaceY,
              grid_size: 35,
            },
            controller.signal,
          );

          if (!controller.signal.aborted) {
            setSurface(response);
          }
        } else {
          const response = await getPolynomialCurve(
            {
              ...request,
              x_feature: xFeature,
              grid_size: 250,
            },
            controller.signal,
          );

          if (!controller.signal.aborted) {
            setCurve(response);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Model training failed.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [
    request,
    complexityError,
    isRegressionSurface,
    effectiveSurfaceX,
    effectiveSurfaceY,
    xFeature,
  ]);

  const result = isRegressionSurface ? surface : curve;

  const equation = result
    ? [
        `${modelTarget} = ${fmt(result.polynomial.intercept)}`,
        ...result.polynomial.feature_names.map(
          (name, index) => {
            const coefficient =
              result.polynomial.coefficients[index] ?? 0;
            return `${coefficient >= 0 ? "+" : "-"} ${fmt(
              Math.abs(coefficient),
            )} × ${name}`;
          },
        ),
      ].join(" ")
    : "Train a model to generate the equation.";

  const datasetName = uploadedDataset
    ? uploadedDataset.name
    : dataset.name;

  const activePoints = uploadedDataset
  ? getUploadedPoints(
      uploadedDataset,
      xFeature,
      selectedTarget,
    )
  : dataset.rows
    ? dataset.rows.map((row) => ({
        x: row[xFeature],
        y: row[modelTarget],
      }))
    : dataset.points;

  const handleFrames = useCallback(
    (
      frames: Record<
        number,
        CurveResponse | SurfaceResponse
      >,
    ) => setComparisonFrames(frames),
    [],
  );

  function reset() {
    setDatasetId("quadratic");
    setUploadedDataset(null);
    setSelectedFeature("");
    setSelectedFeatures([]);
    setSelectedTarget("");
    setDegree(2);
    setRegularization("none");
    setAlpha(1);
    setTestSize(0.2);
    setStandardize(true);
    setShowResiduals(false);
    setViewMode("2d");
    setThreeDType("loss");
    setSurfaceX("");
    setSurfaceY("");
    setDegreeSearch(null);
    setNewPrediction(null);
    setPredictionInputs({});
    setError(null);
    setDegreeError("");
    setPredictionError("");
    setComparisonFrames({});
  }

  function handleUpload(data: UploadedDataset) {
    const target = data.numericColumns.at(-1) ?? "";
    const firstFeature =
      data.numericColumns.find((name) => name !== target) ??
      "";

    setUploadedDataset(data);
    setSelectedTarget(target);
    setSelectedFeature(firstFeature);
    setSelectedFeatures(
      firstFeature ? [firstFeature] : [],
    );
    setViewMode("2d");
    setThreeDType("loss");
    setSurfaceX("");
    setSurfaceY("");
    setDegreeSearch(null);
    setNewPrediction(null);
    setComparisonFrames({});
  }

  function clearUpload() {
    setUploadedDataset(null);
    setSelectedFeatures([]);
    setSelectedFeature("");
    setSelectedTarget("");
    setViewMode("2d");
    setThreeDType("loss");
    setDegreeSearch(null);
    setNewPrediction(null);
    setComparisonFrames({});
  }

  function changeTarget(target: string) {
    const next = selectedFeatures.filter(
      (name) => name !== target,
    );

    if (next.length === 0) {
      const first = numericColumns.find(
        (name) => name !== target,
      );
      if (first) next.push(first);
    }

    setSelectedTarget(target);
    setSelectedFeatures(next);
    setSelectedFeature(next[0] ?? "");
    setDegreeSearch(null);
    setNewPrediction(null);
    setComparisonFrames({});
  }

  function toggleFeature(name: string, checked: boolean) {
    const next = checked
      ? [...selectedFeatures, name]
      : selectedFeatures.filter((item) => item !== name);

    if (next.length > 8) return;

    setSelectedFeatures(next);
    setSelectedFeature(
      next.includes(selectedFeature)
        ? selectedFeature
        : (next[0] ?? ""),
    );
    setDegreeSearch(null);
    setNewPrediction(null);
    setComparisonFrames({});
  }

  async function findBestDegree() {
    if (!request) return;

    setSearchingDegree(true);
    setDegreeError("");
    setDegreeSearch(null);

    try {
      const response = await findBestPolynomialDegree({
        ...request,
        min_degree: 1,
        max_degree: 10,
        cv_folds: 5,
      });
      setDegreeSearch(response);
    } catch (err) {
      setDegreeError(
        err instanceof Error
          ? err.message
          : "Degree search failed.",
      );
    } finally {
      setSearchingDegree(false);
    }
  }

  async function predictNewValues() {
    if (!request || complexityError) return;

    setPredicting(true);
    setPredictionError("");
    setNewPrediction(null);

    try {
      const inputs: Record<string, number | null> = {};

      for (const name of request.features) {
        const raw = predictionInputs[name] ?? "";
        const value =
          raw.trim() === "" ? null : Number(raw);

        if (value !== null && !Number.isFinite(value)) {
          throw new Error(
            `Enter a valid numeric value for ${name}.`,
          );
        }
        inputs[name] = value;
      }

      const response = await predictPolynomialValues({
        training: request,
        inputs: [inputs],
      });

      setNewPrediction(response);
    } catch (err) {
      setPredictionError(
        err instanceof Error
          ? err.message
          : "Prediction failed.",
      );
    } finally {
      setPredicting(false);
    }
  }

  const studioX = isRegressionSurface
    ? effectiveSurfaceX
    : xFeature;
  const studioY = isRegressionSurface
    ? effectiveSurfaceY
    : "";

  return (
    <main className="min-h-screen bg-[#070b16] text-slate-100">
      <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-500/15 p-3 text-violet-400">
              <BrainCircuit size={30} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-violet-400">
                ModelMind / Interactive ML Labs
              </p>
              <h1 className="mt-1 text-3xl font-bold">
                Polynomial Regression
              </h1>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 px-4 py-2 text-xs text-emerald-400">
            Interactive ML Experiment
          </span>
        </header>

        <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className={panel}>
              <div className="mb-4 flex items-center gap-2">
                <Database size={18} className="text-sky-400" />
                <h2 className="font-semibold">Dataset</h2>
              </div>

              <PolynomialDatasetManager
                datasetId={datasetId}
                onDatasetChange={(id) => {
                  setDatasetId(id);
                  setDegreeSearch(null);
                  setNewPrediction(null);
                  setComparisonFrames({});
                }}
                uploadedDataset={uploadedDataset}
                selectedFeature={xFeature}
                selectedTarget={selectedTarget}
                onFeatureChange={setSelectedFeature}
                onTargetChange={changeTarget}
                onUpload={handleUpload}
                onClearUpload={clearUpload}
              />

              <p className="mt-4 text-xs text-slate-400">
                {datasetName} ·{" "}
                {uploadedDataset
  ? uploadedDataset.rows.length
  : (dataset.rows?.length ?? dataset.points.length)}{" "}
rows
              </p>
              {uploadedDataset && (
                <p className="mt-2 text-xs text-slate-400">
                  {activePoints.length} complete 2D points.
                </p>
              )}
            </section>

            <section className={panel}>
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal
                  size={18}
                  className="text-violet-400"
                />
                <h2 className="font-semibold">
                  Model Controls
                </h2>
              </div>

              {uploadedDataset && (
                <div className="mb-6 rounded-xl border border-violet-500/20 bg-slate-950 p-4">
                  <h3 className="text-sm font-semibold">
                    Input Features
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">
                    Select up to eight columns.
                  </p>

                  <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
                    {availableFeatures.map((name) => (
                      <label
                        key={name}
                        className="flex items-center gap-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(name)}
                          disabled={
                            !selectedFeatures.includes(name) &&
                            selectedFeatures.length >= 8
                          }
                          onChange={(event) =>
                            toggleFeature(
                              name,
                              event.target.checked,
                            )
                          }
                          className="accent-violet-500"
                        />
                        <span className="break-all">
                          {name}
                        </span>
                      </label>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-violet-300">
                    {modelFeatures.length} selected features
                  </p>
                </div>
              )}
              {!uploadedDataset && dataset.rows && (
  <div className="mb-6 rounded-xl border border-violet-500/20 bg-slate-950 p-4">
    <h3 className="text-sm font-semibold text-white">
      Built-in Model Features
    </h3>

    <p className="mt-2 text-xs text-slate-400">
      These input features are automatically selected
      for the built-in dataset.
    </p>

    <div className="mt-4 space-y-2">
      {modelFeatures.map((name) => (
        <div
          key={name}
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-emerald-300"
        >
          ✓ {name}
        </div>
      ))}
    </div>

    <p className="mt-3 text-xs text-violet-300">
      {modelFeatures.length} selected features
    </p>

    <p className="mt-2 text-xs text-slate-400">
      Target: {modelTarget}
    </p>
  </div>
)}

              <div className="flex justify-between text-sm">
                <label htmlFor="degree">
                  Polynomial Degree
                </label>
                <strong className="text-violet-300">
                  {degree}
                </strong>
              </div>

              <input
                id="degree"
                type="range"
                min={1}
                max={10}
                value={degree}
                onChange={(event) => {
                  setDegree(Number(event.target.value));
                  setDegreeSearch(null);
                  setNewPrediction(null);
                  setComparisonFrames({});
                }}
                className="mt-4 w-full accent-violet-500"
              />

              <div className="mt-3 rounded-xl bg-slate-950 p-3 text-xs">
                Polynomial terms:{" "}
                <strong
                  className={
                    complexityError
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }
                >
                  {termCount} / 500
                </strong>
                {complexityError && (
                  <p className="mt-2 text-rose-400">
                    {complexityError}
                  </p>
                )}
              </div>

              <label
                htmlFor="method"
                className="mt-6 mb-2 block text-sm"
              >
                Regression Method
              </label>
              <select
                id="method"
                value={regularization}
                onChange={(event) =>
                  setRegularization(
                    event.target.value as Regularization,
                  )
                }
                className={field}
              >
                <option value="none">
                  Ordinary Least Squares
                </option>
                <option value="ridge">Ridge (L2)</option>
                <option value="lasso">Lasso (L1)</option>
              </select>

              {regularization !== "none" && (
                <div className="mt-5">
                  <label
                    htmlFor="alpha"
                    className="mb-2 block text-sm"
                  >
                    Regularization Strength
                  </label>
                  <input
                    id="alpha"
                    type="number"
                    min={0}
                    max={100000}
                    step={0.1}
                    value={alpha}
                    onChange={(event) =>
                      setAlpha(
                        Math.min(
                          100000,
                          Math.max(
                            0,
                            Number(event.target.value) || 0,
                          ),
                        ),
                      )
                    }
                    className={field}
                  />
                </div>
              )}

              <label
                htmlFor="testSize"
                className="mt-6 mb-2 block text-sm"
              >
                Test Split: {Math.round(testSize * 100)}%
              </label>
              <input
                id="testSize"
                type="range"
                min={0.1}
                max={0.4}
                step={0.05}
                value={testSize}
                onChange={(event) =>
                  setTestSize(Number(event.target.value))
                }
                className="w-full accent-violet-500"
              />

              <label className="mt-6 flex items-center justify-between gap-3 text-sm">
                Standardize Polynomial Features
                <input
                  type="checkbox"
                  checked={standardize}
                  onChange={(event) =>
                    setStandardize(event.target.checked)
                  }
                  className="accent-violet-500"
                />
              </label>

              <label className="mt-5 flex items-center justify-between gap-3 text-sm">
                Show Residuals
                <input
                  type="checkbox"
                  checked={showResiduals}
                  onChange={(event) =>
                    setShowResiduals(event.target.checked)
                  }
                  className="accent-violet-500"
                />
              </label>

              <button
                type="button"
                onClick={reset}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 p-3 text-sm hover:bg-slate-800"
              >
                <RotateCcw size={16} />
                Reset Experiment
              </button>
            </section>
          </aside>

          <div className="min-w-0 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                title="Train R²"
                value={result?.metrics.train.r2}
              />
              <Metric
                title="Test R²"
                value={result?.metrics.test.r2}
              />
              <Metric
                title="Train RMSE"
                value={result?.metrics.train.rmse}
              />
              <Metric
                title="Test RMSE"
                value={result?.metrics.test.rmse}
              />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-5">
                <div>
                  <h2 className="font-semibold">
                    Polynomial Fitting Studio
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Model: {modelFeatures.join(", ")} →{" "}
                    {modelTarget}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("2d")}
                    className={
                      viewMode === "2d"
                        ? primary
                        : secondary
                    }
                  >
                    2D
                  </button>
                  <button
                    type="button"
                    disabled={modelFeatures.length === 0}
                    onClick={() => {
                      setThreeDType(
                        canUseRegression3D
                          ? "regression"
                          : "loss",
                      );
                      setViewMode("3d");
                    }}
                    className={
                      viewMode === "3d"
                        ? primary
                        : secondary
                    }
                  >
                    3D
                  </button>
                </div>
              </div>

              {viewMode === "3d" && (
                <div className="flex flex-wrap gap-3 border-b border-slate-800 p-5">
                  <button
                    type="button"
                    disabled={!canUseLoss3D}
                    onClick={() => setThreeDType("loss")}
                    className={
                      effective3DType === "loss"
                        ? primary
                        : secondary
                    }
                  >
                    3D Loss Surface
                  </button>

                  <button
  type="button"
  disabled={!canUseRegression3D}
  title={
    canUseRegression3D
      ? "Visualize the fitted surface using two input features"
      : "Select at least two input features to enable the 3D regression surface"
  }
  onClick={() => {
    if (canUseRegression3D) {
      setThreeDType("regression");
      setViewMode("3d");
    }
  }}
  className={
    effective3DType === "regression" && canUseRegression3D
      ? primary
      : secondary
  }
>
  3D Regression Surface
</button>
{!canUseRegression3D && (
  <p className="w-full text-xs leading-6 text-amber-300">
    A 3D regression surface requires two independent input
    features. The current model contains {modelFeatures.length}.
    Upload a dataset with at least two numeric input columns,
    select both features, and choose 3D Regression Surface.
    For a single-feature model, use 3D Loss Surface.
  </p>
)}
                </div>
              )}

              {viewMode === "2d" &&
                modelFeatures.length > 1 && (
                  <div className="border-b border-slate-800 p-5">
                    <label className="mb-2 block text-xs text-slate-400">
                      2D Horizontal Axis
                    </label>
                    <select
                      value={xFeature}
                      onChange={(event) =>
                        setSelectedFeature(event.target.value)
                      }
                      className={field}
                    >
                      {modelFeatures.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-slate-400">
                      Other features are fixed at their
                      median values.
                    </p>
                  </div>
                )}

              {isRegressionSurface && (
                <div className="grid gap-4 border-b border-slate-800 p-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs">
                      X-axis
                    </label>
                    <select
                      value={effectiveSurfaceX}
                      onChange={(event) =>
                        setSurfaceX(event.target.value)
                      }
                      className={field}
                    >
                      {modelFeatures
                        .filter(
                          (name) =>
                            name !== effectiveSurfaceY,
                        )
                        .map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs">
                      Y-axis
                    </label>
                    <select
                      value={effectiveSurfaceY}
                      onChange={(event) =>
                        setSurfaceY(event.target.value)
                      }
                      className={field}
                    >
                      {modelFeatures
                        .filter(
                          (name) =>
                            name !== effectiveSurfaceX,
                        )
                        .map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {loading && (
                <p className="p-5 text-sm text-sky-300">
                  Training model and generating visualization...
                </p>
              )}

              {(error || complexityError) && (
                <p
                  role="alert"
                  className="p-5 text-sm text-rose-400"
                >
                  {complexityError ?? error}
                </p>
              )}

              {!complexityError && !error && (
                isRegressionSurface ? (
                  surface ? (
                    <Polynomial3DChart result={surface} />
                  ) : (
                    <p className="p-8 text-slate-400">
                      {loading
                        ? "Generating 3D regression surface..."
                        : "No regression surface available."}
                    </p>
                  )
                ) : isLossSurface ? (
                  <PolynomialLoss3DChart
                    result={curve}
                    targetName={modelTarget}
                  />
                ) : curve ? (
                  <PolynomialBackend2DChart
                    result={curve}
                    featureName={xFeature}
                    targetName={modelTarget}
                    showResiduals={showResiduals}
                  />
                ) : (
                  <p className="p-8 text-slate-400">
                    {loading
                      ? "Generating 2D curve..."
                      : "No fitted curve available."}
                  </p>
                )
              )}
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                title="Train MAE"
                value={result?.metrics.train.mae}
              />
              <Metric
                title="Test MAE"
                value={result?.metrics.test.mae}
              />
              <Metric
                title="Train MSE"
                value={result?.metrics.train.mse}
              />
              <Metric
                title="Test MSE"
                value={result?.metrics.test.mse}
              />
            </div>

            <section className={panel}>
              <div className="flex items-center gap-2">
                <Activity
                  size={19}
                  className="text-violet-400"
                />
                <h2 className="font-semibold">
                  Model Intuition & Real Equation
                </h2>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Predicting{" "}
                <strong className="text-white">
                  {modelTarget}
                </strong>{" "}
                from{" "}
                <strong className="text-white">
                  {modelFeatures.join(", ")}
                </strong>
                . Degree {degree} generates {termCount}
                polynomial terms.
              </p>

              <div className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-sm leading-7 text-sky-300">
                {equation}
              </div>

              {result && (
                <p className="mt-3 text-xs text-slate-400">
                  Coefficient space:{" "}
                  {result.polynomial.coefficient_space}.
                  Missing inputs are imputed before polynomial
                  transformation.
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {result?.polynomial.feature_names.map(
                  (name) => (
                    <span
                      key={name}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-violet-300"
                    >
                      {name}
                    </span>
                  ),
                )}
              </div>
            </section>

            <section className={panel}>
              <div className="flex items-center gap-2">
                <BarChart3
                  size={19}
                  className="text-emerald-400"
                />
                <h2 className="font-semibold">
                  Experiment Insight
                </h2>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                {degree === 1
                  ? "A linear model fits a straight-line relationship."
                  : degree <= 3
                    ? "A moderate-degree polynomial can capture nonlinear patterns."
                    : "A high-degree polynomial can fit complex patterns but may overfit."}
              </p>

              <p className="mt-3 text-sm text-slate-400">
                {regularization === "none"
                  ? "Ordinary least squares minimizes squared errors."
                  : regularization === "ridge"
                    ? "Ridge uses L2 regularization to penalize large coefficients."
                    : "Lasso uses L1 regularization and may reduce coefficients to zero."}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Features: {modelFeatures.join(", ")}.
                Test split: {Math.round(testSize * 100)}%.
              </p>
            </section>

            <section className={panel}>
              <h2 className="font-semibold">
                Best Polynomial Degree Finder
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Evaluate degrees 1–10 using cross-validation
                on the training portion. Select the lowest
                validation RMSE.
              </p>

              <button
                type="button"
                onClick={() => void findBestDegree()}
                disabled={!request || searchingDegree}
                className={`mt-5 ${primary}`}
              >
                {searchingDegree
                  ? "Evaluating Degrees..."
                  : "Find Best Degree"}
              </button>

              {degreeError && (
                <p className="mt-3 text-sm text-rose-400">
                  {degreeError}
                </p>
              )}

              {degreeSearch && (
                <div className="mt-5">
                  <p className="text-sm text-emerald-400">
                    Recommended degree:{" "}
                    {degreeSearch.best_degree ?? "Unavailable"}
                  </p>

                  {degreeSearch.best_degree !== null && (
                    <button
                      type="button"
                      onClick={() =>
                        setDegree(
                          degreeSearch.best_degree as number,
                        )
                      }
                      className={`mt-3 ${primary}`}
                    >
                      Apply Recommended Degree
                    </button>
                  )}

                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-400">
                        <tr>
                          <th className="p-2">Degree</th>
                          <th className="p-2">Terms</th>
                          <th className="p-2">CV RMSE</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {degreeSearch.results.map((item) => (
                          <tr
                            key={item.degree}
                            className="border-t border-slate-800"
                          >
                            <td className="p-2">
                              {item.degree}
                            </td>
                            <td className="p-2">
                              {item.feature_count}
                            </td>
                            <td className="p-2">
                              {item.status === "success"
                                ? fmt(
                                    item.mean_validation_rmse,
                                  )
                                : "—"}
                            </td>
                            <td className="p-2">
                              {item.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    {degreeSearch.explanation}
                  </p>
                </div>
              )}
            </section>

            <section className={panel}>
              <h2 className="font-semibold">
                Predict New Values
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Enter selected feature values to predict{" "}
                {modelTarget}.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {modelFeatures.map((name) => (
                  <div key={name}>
                    <label className="mb-2 block text-sm">
                      {name}
                    </label>
                    <input
                      type="number"
                      value={predictionInputs[name] ?? ""}
                      placeholder={`Enter ${name}`}
                      onChange={(event) =>
                        setPredictionInputs((current) => ({
                          ...current,
                          [name]: event.target.value,
                        }))
                      }
                      className={field}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void predictNewValues()}
                disabled={
                  !request ||
                  Boolean(complexityError) ||
                  predicting
                }
                className={`mt-5 ${primary}`}
              >
                {predicting
                  ? "Predicting..."
                  : `Predict ${modelTarget}`}
              </button>

              {predictionError && (
                <p className="mt-3 text-sm text-rose-400">
                  {predictionError}
                </p>
              )}

              {newPrediction?.predictions.map(
                (prediction, index) => (
                  <div
                    key={index}
                    className="mt-5 rounded-xl border border-emerald-500/20 bg-slate-950 p-5"
                  >
                    <p className="text-xs text-slate-400">
                      Predicted {modelTarget}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-400">
                      {fmt(prediction.predicted)}
                    </p>

                    {prediction.term_contributions && (
                      <div className="mt-4 space-y-2 text-xs">
                        {Object.entries(
                          prediction.term_contributions,
                        ).map(([name, value]) => (
                          <div
                            key={name}
                            className="flex justify-between gap-3"
                          >
                            <span className="text-slate-400">
                              {name}
                            </span>
                            <span>{fmt(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
            </section>
          </div>
        </div>

        {/* Preserve all existing learning and experiment studios. */}

        <section className="mt-8">
          <PolynomialLearningStudio
            degree={degree}
            regularization={regularization}
            featureName={modelFeatures.join(", ")}
            targetName={modelTarget}
            datasetName={datasetName}
          />
        </section>

        <section className="mt-8">
          <PolynomialMathVisualizer
            degree={degree}
            featureName={modelFeatures.join(", ")}
            targetName={modelTarget}
            result={result}
          />
        </section>

        <section className="mt-8">
          <PolynomialAnimationStudio
            request={complexityError ? null : request}
            onFramesChange={handleFrames}
            viewMode={studioViewMode}
            xFeature={studioX}
            yFeature={studioY}
            targetName={modelTarget}
            showResiduals={showResiduals}
          />
        </section>

        <section className="mt-8">
          <PolynomialComparisonStudio
            frames={comparisonFrames}
            maxDegree={degree}
            viewMode={studioViewMode}
            datasetName={datasetName}
          />
        </section>

        <section className="mt-8">
          <PolynomialResidualStudio
            result={result}
            featureName={
              isRegressionSurface
                ? `${effectiveSurfaceX}, ${effectiveSurfaceY}`
                : xFeature
            }
            targetName={modelTarget}
            viewMode={studioViewMode}
          />
        </section>

        <section className="mt-8">
          <PolynomialCoefficientStudio
            result={result}
            featureName={modelFeatures.join(", ")}
            targetName={modelTarget}
            viewMode={studioViewMode}
          />
        </section>

        <section className="mt-8">
          <PolynomialRegularizationStudio
            request={complexityError ? null : request}
            viewMode={studioViewMode}
            xFeature={studioX}
            yFeature={studioY}
          />
        </section>

        <section className="mt-8">
          <PolynomialPredictionExplorer
            result={result}
            targetName={modelTarget}
          />
        </section>
      </div>
    </main>
  );
}
