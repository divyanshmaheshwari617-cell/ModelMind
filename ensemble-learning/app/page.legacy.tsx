
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Layers3,
  Settings2,
  Trees,
  Database,
  Info,
} from "lucide-react";

import EnsembleDatasetManager, {
  initialEnsembleDatasetSelection,
  type EnsembleDatasetSelection,
} from "@/components/dataset/EnsembleDatasetManager";

import {
  ensembleDatasets,
  type EnsembleTask,
} from "@/lib/datasets/ensembleDatasets";
import EnsembleTrainingStudio from "@/components/training/EnsembleTrainingStudio";
import Ensemble2DChart from "@/components/visualization/Ensemble2DChart";
import Ensemble3DChart from "@/components/visualization/Ensemble3DChart";

import type {
  EnsembleTrainingResponse,
} from "@/lib/api/ensembleApi";
import EnsembleAnimationStudio from "@/components/animation/EnsembleAnimationStudio";
import EnsembleTrainingPlayback from "@/components/animation/EnsembleTrainingPlayback";

type EnsembleModel =
  | "bagging"
  | "random-forest"
  | "adaboost"
  | "gradient-boosting"
  | "voting"
  | "stacking";

type ViewMode = "2d" | "3d";

interface ModelOption {
  id: EnsembleModel;
  label: string;
  description: string;
}

const modelOptions: ModelOption[] = [
  {
    id: "bagging",
    label: "Bagging",
    description:
      "Train independent learners on bootstrap samples and combine their predictions to reduce variance.",
  },
  {
    id: "random-forest",
    label: "Random Forest",
    description:
      "Combine decision trees trained on bootstrap samples with randomized feature selection.",
  },
  {
    id: "adaboost",
    label: "AdaBoost",
    description:
      "Build a sequence of weak learners that increasingly emphasizes difficult training examples.",
  },
  {
    id: "gradient-boosting",
    label: "Gradient Boosting",
    description:
      "Build an additive ensemble by fitting learners to improve the current model's loss.",
  },
  {
    id: "voting",
    label: "Voting Ensemble",
    description:
      "Combine the predictions of independently trained models using voting or averaging.",
  },
  {
    id: "stacking",
    label: "Stacking Ensemble",
    description:
      "Train a meta-learner using predictions from base models, with out-of-fold training predictions to avoid leakage.",
  },
];

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/75 p-5";

const field =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white";

function SummaryCard({
  title,
  value,
  color = "text-violet-400",
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className={panel}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${color}`}>
        {title}
      </p>

      <p className="mt-3 break-words text-xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

export default function Home() {
  const [datasetSelection, setDatasetSelection] =
    useState<EnsembleDatasetSelection>(
      initialEnsembleDatasetSelection,
    );

  const [model, setModel] =
    useState<EnsembleModel>("random-forest");

  const [viewMode, setViewMode] =
    useState<ViewMode>("2d");

  const [estimators, setEstimators] = useState(50);
  const [maxDepth, setMaxDepth] = useState(5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [testSize, setTestSize] = useState(0.2);
  const [trainedState, setTrainedState] = useState<{
  signature: string;
  result: EnsembleTrainingResponse;
} | null>(null);

  const selectedModel = useMemo(
    () =>
      modelOptions.find((option) => option.id === model) ??
      modelOptions[0],
    [model],
  );

  const builtinDataset = useMemo(
    () =>
      ensembleDatasets.find(
        (dataset) => dataset.id === datasetSelection.datasetId,
      ) ?? ensembleDatasets[0],
    [datasetSelection.datasetId],
  );

  const datasetRows = datasetSelection.uploadedDataset
    ? datasetSelection.uploadedDataset.rows
    : builtinDataset.rows;

  const datasetName = datasetSelection.uploadedDataset
    ? datasetSelection.uploadedDataset.name
    : builtinDataset.name;

  const datasetFeatures = datasetSelection.features;

  const targetName = datasetSelection.target;

  const task: EnsembleTask = datasetSelection.task;
  const experimentSignature = JSON.stringify({
  dataset:
    datasetSelection.uploadedDataset?.id ??
    datasetSelection.datasetId,
  task,
  features: datasetFeatures,
  target: targetName,
  missingStrategy: datasetSelection.missingStrategy,
  rowCount: datasetRows.length,
  model,
  estimators,
  maxDepth,
  learningRate,
  testSize,
});

const activeResult =
  trainedState?.signature === experimentSignature
    ? trainedState.result
    : null;

  const supportsLearningRate =
    model === "adaboost" ||
    model === "gradient-boosting";

  const supportsEstimators =
    model !== "voting" && model !== "stacking";

  const supportsTreeDepth =
    model === "bagging" ||
    model === "random-forest" ||
    model === "adaboost" ||
    model === "gradient-boosting";

  const canUse3D = datasetFeatures.length >= 2;

  const effectiveViewMode: ViewMode =
    viewMode === "3d" && !canUse3D
      ? "2d"
      : viewMode;

  const validSelection =
    datasetRows.length >= 2 &&
    datasetFeatures.length >= 1 &&
    Boolean(targetName) &&
    !datasetFeatures.includes(targetName);

  const sampleRows = datasetRows.slice(0, 5);

  function changeDataset(
    selection: EnsembleDatasetSelection,
  ) {
    setDatasetSelection(selection);

    if (selection.features.length < 2) {
      setViewMode("2d");
    }
  }

  return (
    <main className="min-h-screen bg-[#080d19] text-slate-100">
      <div className="mx-auto max-w-[1700px] px-4 py-7 md:px-6 lg:px-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-400">
              <BrainCircuit size={30} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                ModelMind / Interactive ML Labs
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Ensemble Learning Lab
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Explore Bagging, Random Forest, AdaBoost,
                Gradient Boosting, Voting, and Stacking.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
            Local Development
          </span>
        </header>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-5">
            <section className={panel}>
              <EnsembleDatasetManager
                value={datasetSelection}
                onChange={changeDataset}
              />
            </section>

            <section className={panel}>
              <div className="mb-5 flex items-center gap-2">
                <Trees
                  size={19}
                  className="text-emerald-400"
                />

                <h2 className="font-semibold">
                  Ensemble Algorithm
                </h2>
              </div>

              <div className="space-y-2">
                {modelOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setModel(option.id)}
                    className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                      model === option.id
                        ? "border-violet-500 bg-violet-500/15 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={panel}>
              <div className="mb-5 flex items-center gap-2">
                <Settings2
                  size={19}
                  className="text-violet-400"
                />

                <h2 className="font-semibold">
                  Hyperparameter Controls
                </h2>
              </div>

              {supportsEstimators && (
                <label className="block text-sm">
                  Number of Estimators:{" "}
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
                    className="mt-3 w-full"
                  />
                </label>
              )}

              {supportsTreeDepth && (
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
                    className="mt-3 w-full"
                  />
                </label>
              )}

              {supportsLearningRate && (
                <label className="mt-6 block text-sm">
                  Learning Rate:{" "}
                  <strong className="text-violet-300">
                    {learningRate.toFixed(2)}
                  </strong>

                  <input
                    type="range"
                    min={0.01}
                    max={1}
                    step={0.01}
                    value={learningRate}
                    onChange={(event) =>
                      setLearningRate(Number(event.target.value))
                    }
                    className="mt-3 w-full"
                  />
                </label>
              )}

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
                  className="mt-3 w-full"
                />
              </label>

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-xs font-semibold text-slate-200">
                  Training Configuration
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Model: {selectedModel.label}
                </p>

                <p className="text-xs leading-6 text-slate-400">
                  Task: {task}
                </p>

                <p className="text-xs leading-6 text-slate-400">
                  Inputs: {datasetFeatures.join(", ") || "None"}
                </p>

                <p className="text-xs leading-6 text-slate-400">
                  Target: {targetName || "None"}
                </p>

                <p className="text-xs leading-6 text-slate-400">
                  Missing Values:{" "}
                  {datasetSelection.missingStrategy}
                </p>
              </div>

              <p className="mt-5 text-xs leading-6 text-slate-500">
                These controls will be passed to the
                FastAPI training engine in the next phase.
                No actual model training runs yet.
              </p>
            </section>
          </aside>

          <div className="min-w-0 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Task"
                value={
                  task === "classification"
                    ? "Classification"
                    : "Regression"
                }
                color="text-sky-400"
              />

              <SummaryCard
                title="Selected Model"
                value={selectedModel.label}
                color="text-violet-400"
              />

              <SummaryCard
                title="Dataset Rows"
                value={datasetRows.length}
                color="text-emerald-400"
              />

              <SummaryCard
                title="Input Features"
                value={datasetFeatures.length}
                color="text-amber-400"
              />
            </div>

            <section className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Database
                      size={19}
                      className="text-sky-400"
                    />

                    <h2 className="text-xl font-semibold">
                      Active Dataset
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-white">
                    {datasetName}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {datasetFeatures.join(" + ") || "No inputs"}
                    {" → "}
                    {targetName || "No target"}
                  </p>
                </div>

                <span
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    validSelection
                      ? "border-emerald-500/30 text-emerald-300"
                      : "border-amber-500/30 text-amber-300"
                  }`}
                >
                  {validSelection
                    ? "Dataset configured"
                    : "Select valid features"}
                </span>
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-3 py-3">Row</th>

                      {[
                        ...datasetFeatures,
                        targetName,
                      ]
                        .filter(Boolean)
                        .map((column) => (
                          <th
                            key={column}
                            className="whitespace-nowrap px-3 py-3"
                          >
                            {column}
                          </th>
                        ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sampleRows.map((row, index) => (
                      <tr
                        key={index}
                        className="border-t border-slate-800"
                      >
                        <td className="px-3 py-3 text-slate-500">
                          {index + 1}
                        </td>

                        {[
                          ...datasetFeatures,
                          targetName,
                        ]
                          .filter(Boolean)
                          .map((column) => (
                            <td
                              key={column}
                              className="whitespace-nowrap px-3 py-3 text-slate-300"
                            >
                              {row[column] === null ||
                              row[column] === undefined
                                ? "Missing"
                                : String(row[column])}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers3
                      size={21}
                      className="text-violet-400"
                    />

                    <h2 className="text-xl font-bold">
                      Ensemble Visualization Studio
                    </h2>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    {selectedModel.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  {(["2d", "3d"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      disabled={
                        mode === "3d" && !canUse3D
                      }
                      onClick={() => setViewMode(mode)}
                      className={`rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        effectiveViewMode === mode
                          ? "bg-violet-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {!canUse3D && (
                <p className="mt-4 text-xs text-amber-300">
                  Select at least two numeric input features
                  to enable a 3D decision or regression surface.
                </p>
              )}

                <div
  className={`mt-6 min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 ${
    activeResult ? "hidden" : "flex"
  }`}
>
                <div className="max-w-lg text-center">
                  <BarChart3
                    size={45}
                    className="mx-auto text-violet-400"
                  />

                  <h3 className="mt-5 text-xl font-semibold">
                    {effectiveViewMode.toUpperCase()}{" "}
                    Visualization Workspace
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Dataset: {datasetName}
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Model: {selectedModel.label}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Actual fitted decision boundaries and
                    prediction surfaces will appear when
                    the training API and chart components
                    are connected.
                  </p>
                </div>
              </div>
            </section>
            {/* REAL ENSEMBLE TRAINING STUDIO */}
<EnsembleTrainingStudio
  selection={datasetSelection}
  rows={datasetRows}
  model={model}
  estimators={estimators}
  maxDepth={maxDepth}
  learningRate={learningRate}
  testSize={testSize}
  onTrained={(result) => {
    setTrainedState({
      signature: experimentSignature,
      result,
    });
  }}
  onTrainingStart={() => setTrainedState(null)}
  onReset={() => setTrainedState(null)}
/>
{/* INTERACTIVE ALGORITHM ANIMATION */}
<EnsembleAnimationStudio
  key={model}
  model={model}
/>
{/* REAL TRAINING CHECKPOINT PLAYBACK */}
{activeResult && (
  <EnsembleTrainingPlayback
    key={`${activeResult.model}-${experimentSignature}`}
    result={activeResult}
  />
)}
<EnsembleAnimationStudio
  key={model}
  model={model}
/>
{/* REAL 2D AND 3D VISUALIZATIONS */}
{activeResult && (
  <div className="min-w-0 space-y-5">
    {effectiveViewMode === "2d" ? (
      <Ensemble2DChart result={activeResult} />
    ) : (
      <Ensemble3DChart result={activeResult} />
    )}
  </div>
)}

            <section className={panel}>
              <div className="flex items-center gap-2">
                <Activity
                  size={19}
                  className="text-emerald-400"
                />

                <h2 className="text-lg font-semibold">
                  Current Experiment
                </h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-400">
                    Dataset
                  </p>

                  <p className="mt-2 font-semibold">
                    {datasetName}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-400">
                    Ensemble Algorithm
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedModel.label}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-400">
                    Selected Features
                  </p>

                  <p className="mt-2 break-words font-semibold">
                    {datasetFeatures.join(", ") || "None"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-400">
                    Target Column
                  </p>

                  <p className="mt-2 font-semibold">
                    {targetName || "None"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                <Info
                  size={18}
                  className="mt-1 shrink-0 text-sky-400"
                />

                <p className="text-sm leading-7 text-slate-300">
                  Dataset selection, CSV parsing, input
                  configuration, and hyperparameter controls
                  are ready. The next development phase will
                  connect them to actual scikit-learn ensemble
                  training with leakage-safe preprocessing.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
