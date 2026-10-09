
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  Info,
  LoaderCircle,
  Play,
  RefreshCcw,
  Target,
  Trees,
} from "lucide-react";

import type { EnsembleDatasetSelection } from "@/components/dataset/EnsembleDatasetManager";

import {
  buildEnsembleTrainingRequest,
  isClassificationMetrics,
  isRegressionMetrics,
  trainEnsemble,
  type EnsembleModel,
  type EnsembleTrainingResponse,
} from "@/lib/api/ensembleApi";

type Row = Record<string, string | number | null>;

interface Props {
  selection: EnsembleDatasetSelection;
  rows: Row[];
  model: EnsembleModel;
  estimators: number;
  maxDepth: number;
  learningRate: number;
  testSize: number;
  onTrainingStart?: () => void;
  onReset?: () => void;
  onTrained?: (result: EnsembleTrainingResponse) => void;
}

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";

function formatMetric(
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

  return value.toFixed(digits);
}

function formatPercent(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function prettyModel(model: EnsembleModel): string {
  const names: Record<EnsembleModel, string> = {
    bagging: "Bagging",
    "random-forest": "Random Forest",
    adaboost: "AdaBoost",
    "gradient-boosting": "Gradient Boosting",
    voting: "Voting Ensemble",
    stacking: "Stacking Ensemble",
  };

  return names[model];
}

function MetricCard({
  label,
  value,
  description,
  accent = "text-violet-300",
}: {
  label: string;
  value: string;
  description: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className={`mt-3 text-2xl font-bold ${accent}`}>
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ConfusionMatrix({
  matrix,
  labels,
}: {
  matrix: number[][];
  labels: number[];
}) {
  const maxValue = Math.max(
    1,
    ...matrix.flat(),
  );

  return (
    <div className={panel}>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Target size={19} className="text-sky-400" />
        Confusion Matrix
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Rows represent actual classes. Columns represent
        predicted classes. Larger diagonal values mean
        more correct predictions.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[300px] border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr>
              <th className="p-2 text-slate-500">
                Actual / Predicted
              </th>

              {labels.map((label) => (
                <th
                  key={label}
                  className="p-2 text-slate-300"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th className="p-2 text-slate-300">
                  {labels[rowIndex]}
                </th>

                {row.map((count, colIndex) => {
                  const intensity = count / maxValue;
                  const correct = rowIndex === colIndex;

                  return (
                    <td
                      key={colIndex}
                      className="rounded-lg p-3 font-semibold text-white"
                      style={{
                        backgroundColor: correct
                          ? `rgba(16,185,129,${0.12 + intensity * 0.75})`
                          : `rgba(244,63,94,${0.10 + intensity * 0.65})`,
                      }}
                      title={
                        `Actual ${labels[rowIndex]}, ` +
                        `Predicted ${labels[colIndex]}: ${count}`
                      }
                    >
                      {count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <span className="text-emerald-300">
          ● Correct predictions
        </span>

        <span className="text-rose-300">
          ● Incorrect predictions
        </span>
      </div>
    </div>
  );
}

function FeatureImportance({
  importance,
}: {
  importance: NonNullable<
    EnsembleTrainingResponse["feature_importances"]
  >;
}) {
  const sorted = [...importance].sort(
    (a, b) =>
      (b.importance ?? 0) - (a.importance ?? 0),
  );

  const max = Math.max(
    0.000001,
    ...sorted.map((item) => item.importance ?? 0),
  );

  return (
    <section className={panel}>
      <div className="flex items-center gap-2">
        <BarChart3
          size={19}
          className="text-violet-400"
        />
        <h3 className="text-lg font-semibold">
          Feature Importance
        </h3>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        The importance values provided by the fitted
        model. Larger values generally indicate a greater
        contribution to its tree-based decisions.
      </p>

      <div className="mt-6 space-y-5">
        {sorted.map((item) => {
          const value = Math.max(
            0,
            item.importance ?? 0,
          );

          return (
            <div key={item.feature}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="break-all text-slate-300">
                  {item.feature}
                </span>

                <span className="font-mono text-violet-300">
                  {formatMetric(value)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all"
                  style={{
                    width: `${(value / max) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs leading-6 text-slate-500">
        Tree impurity-based importances are not causal
        explanations and can be misleading for some
        feature distributions.
      </p>
    </section>
  );
}

function PredictionTable({
  result,
}: {
  result: EnsembleTrainingResponse;
}) {
  const [visibleCount, setVisibleCount] = useState(12);

  const rows = result.predictions;

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">
          Actual vs Predicted
        </h3>

        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
          {rows.length} test predictions
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        Predictions from the held-out test dataset.
      </p>

      <div className="mt-5 max-h-[380px] overflow-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Actual</th>
              <th className="px-4 py-3">Predicted</th>
              <th className="px-4 py-3">
                {result.task === "classification"
                  ? "Result"
                  : "Absolute Error"}
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.slice(0, visibleCount).map(
              (row, index) => {
                const correct =
                  row.actual === row.predicted;

                const difference = Math.abs(
                  row.actual - row.predicted,
                );

                return (
                  <tr
                    key={index}
                    className="border-t border-slate-800"
                  >
                    <td className="px-4 py-3 text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      {formatMetric(row.actual, 3)}
                    </td>

                    <td className="px-4 py-3">
                      {formatMetric(row.predicted, 3)}
                    </td>

                    <td className="px-4 py-3">
                      {result.task === "classification" ? (
                        <span
                          className={
                            correct
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }
                        >
                          {correct ? "Correct" : "Incorrect"}
                        </span>
                      ) : (
                        <span className="text-slate-300">
                          {formatMetric(difference, 3)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      {visibleCount < rows.length && (
        <button
          type="button"
          onClick={() =>
            setVisibleCount((count) =>
              Math.min(count + 20, rows.length),
            )
          }
          className="mt-4 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300 hover:border-violet-500"
        >
          Show More Predictions
        </button>
      )}
    </section>
  );
}

function Results({
  result,
}: {
  result: EnsembleTrainingResponse;
}) {
  const train = result.metrics.train;
  const test = result.metrics.test;

  return (
    <div className="space-y-5">
      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={21}
              className="text-emerald-400"
            />

            <h3 className="text-xl font-bold">
              Training Completed
            </h3>
          </div>

          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            Real scikit-learn results
          </span>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          The {prettyModel(result.model)} model was fitted
          on {result.dataset.train_rows} training rows and
          evaluated on {result.dataset.test_rows} separate
          test rows.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard
            label="Valid Rows"
            value={String(result.dataset.valid_rows)}
            description="Rows remaining after data cleaning."
          />

          <MetricCard
            label="Training Rows"
            value={String(result.dataset.train_rows)}
            description="Used to fit the model."
            accent="text-sky-300"
          />

          <MetricCard
            label="Test Rows"
            value={String(result.dataset.test_rows)}
            description="Held out for evaluation."
            accent="text-emerald-300"
          />

          <MetricCard
            label="Features"
            value={String(result.dataset.features.length)}
            description="Input variables used for training."
            accent="text-amber-300"
          />
        </div>
      </section>

      <section className={panel}>
        <div className="flex items-center gap-2">
          <Activity
            size={20}
            className="text-sky-400"
          />

          <h3 className="text-lg font-semibold">
            Model Performance
          </h3>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Compare training and test metrics to understand
          how well the model generalizes.
        </p>

        {isClassificationMetrics(train) &&
        isClassificationMetrics(test) ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Test Accuracy"
              value={formatPercent(test.accuracy)}
              description={`Train: ${formatPercent(train.accuracy)}. Fraction of correct predictions.`}
              accent="text-emerald-300"
            />

            <MetricCard
              label="Test Precision"
              value={formatPercent(test.precision)}
              description={`Train: ${formatPercent(train.precision)}. Weighted precision across classes.`}
              accent="text-sky-300"
            />

            <MetricCard
              label="Test Recall"
              value={formatPercent(test.recall)}
              description={`Train: ${formatPercent(train.recall)}. Weighted recall across classes.`}
              accent="text-violet-300"
            />

            <MetricCard
              label="Test F1"
              value={formatPercent(test.f1)}
              description={`Train: ${formatPercent(train.f1)}. Weighted balance of precision and recall.`}
              accent="text-amber-300"
            />
          </div>
        ) : isRegressionMetrics(train) &&
          isRegressionMetrics(test) ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Test R²"
              value={formatMetric(test.r2)}
              description={`Train: ${formatMetric(train.r2)}. Higher is generally better.`}
              accent="text-emerald-300"
            />

            <MetricCard
              label="Test MAE"
              value={formatMetric(test.mae)}
              description={`Train: ${formatMetric(train.mae)}. Mean absolute prediction error.`}
              accent="text-sky-300"
            />

            <MetricCard
              label="Test RMSE"
              value={formatMetric(test.rmse)}
              description={`Train: ${formatMetric(train.rmse)}. Larger errors have more influence.`}
              accent="text-violet-300"
            />
          </div>
        ) : (
          <p className="mt-4 text-amber-300">
            Metric data does not match the selected task.
          </p>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
          <Info
            size={17}
            className="mt-1 shrink-0 text-sky-400"
          />

          <p className="text-xs leading-6 text-slate-300">
            Training metrics describe performance on
            examples the model learned from. Test metrics
            describe performance on held-out examples.
            A large gap can indicate overfitting.
          </p>
        </div>
      </section>

      {isClassificationMetrics(test) && (
        <ConfusionMatrix
          matrix={test.confusion_matrix}
          labels={test.class_labels}
        />
      )}

      {result.feature_importances &&
        result.feature_importances.length > 0 && (
          <FeatureImportance
            importance={result.feature_importances}
          />
        )}

      <PredictionTable
        key={`${result.model}-${result.dataset.test_rows}`}
        result={result}
      />
    </div>
  );
}

export default function EnsembleTrainingStudio({
  selection,
  rows,
  model,
  estimators,
  maxDepth,
  learningRate,
  testSize,
    onTrained,
  onTrainingStart,
  onReset,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultState, setResultState] = useState<{
    signature: string;
    data: EnsembleTrainingResponse;
  } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestNumberRef = useRef(0);
  const onTrainedRef = useRef(onTrained);
  onTrainedRef.current = onTrained;

  const signature = JSON.stringify({
    dataset: selection.uploadedDataset?.id ??
      selection.datasetId,
    task: selection.task,
    features: selection.features,
    target: selection.target,
    missingStrategy: selection.missingStrategy,
    rowCount: rows.length,
    model,
    estimators,
    maxDepth,
    learningRate,
    testSize,
  });

  const currentSignatureRef = useRef(signature);
  currentSignatureRef.current = signature;

  const result =
    resultState?.signature === signature
      ? resultState.data
      : null;

  const validSelection =
    rows.length >= 20 &&
    selection.features.length >= 1 &&
    selection.features.length <= 8 &&
    Boolean(selection.target) &&
    !selection.features.includes(selection.target);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleTrain() {
    if (!validSelection) {
      setError(
        "Select a valid dataset with at least 20 rows, " +
        "one input feature, and a separate target.",
      );
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestNumber = ++requestNumberRef.current;
    const submittedSignature = signature;

    setLoading(true);
    setError("");
    setResultState(null);
    onTrainingStart?.();

    try {
      const payload = buildEnsembleTrainingRequest(
        selection,
        rows,
        {
          model,
          nEstimators: estimators,
          maxDepth,
          learningRate,
          testSize,
          randomState: 42,
          gridResolution: 35,
        },
      );

      const trained = await trainEnsemble(
        payload,
        controller.signal,
      );

      if (
        controller.signal.aborted ||
        requestNumber !== requestNumberRef.current ||
        submittedSignature !== currentSignatureRef.current
      ) {
        return;
      }

      setResultState({
        signature: submittedSignature,
        data: trained,
      });

      onTrainedRef.current?.(trained);
    } catch (cause) {
      if (
        controller.signal.aborted ||
        requestNumber !== requestNumberRef.current
      ) {
        return;
      }

      setError(
        cause instanceof Error
          ? cause.message
          : "Model training failed.",
      );
    } finally {
      if (requestNumber === requestNumberRef.current) {
        setLoading(false);
      }
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    requestNumberRef.current += 1;
    setResultState(null);
    setError("");
    onReset?.();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={22}
                className="text-violet-400"
              />

              <h2 className="text-xl font-bold">
                Ensemble Training Studio
              </h2>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Train a real {prettyModel(model)} model
              using scikit-learn. Explore its predictions,
              measure generalization, and understand how
              its hyperparameters affect performance.
            </p>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-violet-300">
              <Trees size={17} />
              {prettyModel(model)}
            </div>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {selection.task}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-950 p-4">
            <Database
              size={17}
              className="text-sky-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Dataset Rows
            </p>
            <p className="mt-1 text-xl font-semibold">
              {rows.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4">
            <BarChart3
              size={17}
              className="text-violet-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Input Features
            </p>
            <p className="mt-1 text-xl font-semibold">
              {selection.features.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4">
            <Target
              size={17}
              className="text-emerald-400"
            />
            <p className="mt-2 text-xs text-slate-400">
              Test Split
            </p>
            <p className="mt-1 text-xl font-semibold">
              {Math.round(testSize * 100)}%
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!validSelection || loading}
            onClick={() => void handleTrain()}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Play size={17} />
            )}

            {loading ? "Training Model..." : "Train Model"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-300 transition hover:border-slate-500"
          >
            <RefreshCcw size={16} />
            Reset Results
          </button>
        </div>

        {!validSelection && (
          <p className="mt-4 text-xs leading-6 text-amber-300">
            Choose at least 20 rows, one input feature,
            and a separate target before training.
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p className="leading-6">{error}</p>
          </div>
        )}
      </section>

      {loading && (
        <section
          className={`${panel} flex items-center gap-4`}
          role="status"
        >
          <LoaderCircle
            size={26}
            className="animate-spin text-violet-400"
          />

          <div>
            <p className="font-semibold">
              Training in progress
            </p>

            <p className="mt-1 text-sm text-slate-400">
              FastAPI is fitting the model, evaluating
              predictions, and generating visualization data.
            </p>
          </div>
        </section>
      )}

      {result && !loading && (
        <Results result={result} />
      )}

      {!result && !loading && !error && (
        <section className={`${panel} py-12 text-center`}>
          <Activity
            size={38}
            className="mx-auto text-violet-400"
          />

          <h3 className="mt-4 text-lg font-semibold">
            Ready for an ML Experiment
          </h3>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-400">
            Configure your dataset and hyperparameters,
            then click Train Model to generate real
            training results. Results will appear here
            after the Python backend responds.
          </p>
        </section>
      )}
    </div>
  );
}
