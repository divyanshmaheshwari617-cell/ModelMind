
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Info,
  Target,
} from "lucide-react";

type Task = "classification" | "regression";

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

type ModelEvaluation = {
  metrics: {
    train: Metrics;
    test: Metrics;
  };
  predictions: {
    actual: (number | null)[];
    predicted: (number | null)[];
  };
};

type EvaluationResult = {
  task: Task;
  dataset: {
    class_labels: string[] | null;
    train_rows: number;
    test_rows: number;
  };
  models: Record<string, ModelEvaluation>;
};

type Props = {
  result: EvaluationResult;
};

const modelNames: Record<string, string> = {
  linear: "Linear Model",
  knn: "K-Nearest Neighbors",
  random_forest: "Random Forest",
  hard_voting: "Hard Voting",
  soft_voting: "Soft Voting",
  voting: "Voting Regressor",
  stacking: "Stacking",
};

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#0b1426] p-5";

function isFiniteNumber(
  value: number | null | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function format(
  value: number | null | undefined,
  digits = 4,
): string {
  return isFiniteNumber(value)
    ? value.toFixed(digits)
    : "N/A";
}

function classLabel(
  index: number,
  labels: string[] | null,
) {
  return labels?.[index] ?? `Class ${index}`;
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">{title}</p>

      <p className="mt-3 text-2xl font-bold text-violet-300">
        {value}
      </p>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ClassificationEvaluation({
  metrics,
  classLabels,
}: {
  metrics: Metrics;
  classLabels: string[] | null;
}) {
  const matrix = metrics.confusion_matrix ?? [];

  if (matrix.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No confusion matrix was returned.
      </p>
    );
  }

  const total = matrix.reduce(
    (sum, row) =>
      sum +
      row.reduce(
        (rowTotal, value) => rowTotal + value,
        0,
      ),
    0,
  );

  const correct = matrix.reduce(
    (sum, row, index) =>
      sum + (row[index] ?? 0),
    0,
  );

  const incorrect = total - correct;

  const maxCell = Math.max(
    1,
    ...matrix.flat(),
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Accuracy"
          value={format(metrics.accuracy)}
          description="Fraction of correct test predictions"
        />
        <StatCard
          title="Weighted F1"
          value={format(metrics.f1)}
          description="Class-support-weighted F1 score"
        />
        <StatCard
          title="Correct predictions"
          value={String(correct)}
          description="Diagonal confusion-matrix entries"
        />
        <StatCard
          title="Incorrect predictions"
          value={String(incorrect)}
          description="Off-diagonal confusion-matrix entries"
        />
      </div>

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Target
            size={19}
            className="text-sky-300"
          />
          Confusion Matrix
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Rows represent actual classes. Columns
          represent predicted classes. Diagonal cells
          are correct predictions; off-diagonal
          cells show mistakes.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[440px] border-separate border-spacing-2 text-center text-sm">
            <thead>
              <tr>
                <th className="p-2 text-slate-400">
                  Actual / Predicted
                </th>

                {matrix.map((_, index) => (
                  <th
                    key={index}
                    className="max-w-32 break-words p-2 text-sky-300"
                  >
                    {classLabel(index, classLabels)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <th className="max-w-32 break-words p-2 text-left text-violet-300">
                    {classLabel(
                      rowIndex,
                      classLabels,
                    )}
                  </th>

                  {row.map((count, columnIndex) => {
                    const opacity =
                      0.08 +
                      (count / maxCell) * 0.42;

                    const correctCell =
                      rowIndex === columnIndex;

                    return (
                      <td
                        key={columnIndex}
                        className="rounded-xl border border-slate-700 p-4 font-mono font-bold"
                        style={{
                          backgroundColor: correctCell
                            ? `rgba(16,185,129,${opacity})`
                            : `rgba(244,63,94,${opacity})`,
                        }}
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

        <p className="mt-4 text-xs text-slate-500">
          Green cells: correct predictions. Red cells:
          misclassifications.
        </p>
      </div>

      <div className={panel}>
        <h3 className="text-lg font-bold">
          Per-Class Recall
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Recall answers: of all test observations
          actually belonging to a particular class,
          what proportion did the model identify?
        </p>

        <div className="mt-5 space-y-5">
          {matrix.map((row, index) => {
            const support = row.reduce(
              (sum, value) => sum + value,
              0,
            );

            const recall =
              support > 0
                ? (row[index] ?? 0) / support
                : null;

            return (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="break-words">
                    {classLabel(index, classLabels)}
                  </span>

                  <span className="font-mono text-emerald-300">
                    {recall === null
                      ? "N/A"
                      : `${(recall * 100).toFixed(1)}%`}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${
                        (recall ?? 0) * 100
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {support} actual observations
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RegressionEvaluation({
  model,
}: {
  model: ModelEvaluation;
}) {
  const metrics = model.metrics.test;

  const rows = useMemo(() => {
    return model.predictions.actual
      .map((actual, index) => {
        const predicted =
          model.predictions.predicted[index];

        if (
          !isFiniteNumber(actual) ||
          !isFiniteNumber(predicted)
        ) {
          return null;
        }

        const residual = actual - predicted;

        return {
          index,
          actual,
          predicted,
          residual,
          absoluteError: Math.abs(residual),
        };
      })
      .filter(
        (row): row is NonNullable<typeof row> =>
          row !== null,
      );
  }, [model]);

  const largestErrors = [...rows]
    .sort(
      (a, b) =>
        b.absoluteError - a.absoluteError,
    )
    .slice(0, 10);

  const maxAbsoluteError = Math.max(
    0.000001,
    ...largestErrors.map(
      (row) => row.absoluteError,
    ),
  );

  const sampleMAE =
    rows.length > 0
      ? rows.reduce(
          (sum, row) =>
            sum + row.absoluteError,
          0,
        ) / rows.length
      : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="R²"
          value={format(metrics.r2)}
          description="Test coefficient of determination"
        />

        <StatCard
          title="MAE"
          value={format(metrics.mae)}
          description="Mean absolute test prediction error"
        />

        <StatCard
          title="RMSE"
          value={format(metrics.rmse)}
          description="Root mean squared test error"
        />
      </div>

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Activity
            size={19}
            className="text-sky-300"
          />
          Actual vs Predicted
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          These rows show actual numerical targets
          alongside predictions produced by the
          fitted model.
        </p>

        <div className="mt-5 max-h-80 overflow-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead className="sticky top-0 bg-[#0b1426] text-slate-400">
              <tr>
                <th className="p-3">Test row</th>
                <th className="p-3">Actual</th>
                <th className="p-3">Predicted</th>
                <th className="p-3">Residual</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.index}
                  className="border-t border-slate-800"
                >
                  <td className="p-3">
                    {row.index + 1}
                  </td>

                  <td className="p-3 font-mono">
                    {format(row.actual)}
                  </td>

                  <td className="p-3 font-mono text-violet-300">
                    {format(row.predicted)}
                  </td>

                  <td
                    className={`p-3 font-mono ${
                      row.residual >= 0
                        ? "text-sky-300"
                        : "text-amber-300"
                    }`}
                  >
                    {format(row.residual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Residual = actual − predicted. Positive
          residuals mean the model underpredicted;
          negative residuals mean it overpredicted.
        </p>
      </div>

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <BarChart3
            size={19}
            className="text-amber-300"
          />
          Largest Prediction Errors
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          These are the largest absolute errors among
          the returned prediction samples, not
          necessarily the largest errors in the
          entire test set.
        </p>

        <div className="mt-5 space-y-4">
          {largestErrors.map((row) => (
            <div key={row.index}>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300">
                  Test row {row.index + 1}
                </span>

                <span className="font-mono text-amber-300">
                  {format(row.absoluteError)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{
                    width: `${
                      (row.absoluteError /
                        maxAbsoluteError) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-slate-400">
          Sample MAE across {rows.length} returned
          predictions: {format(sampleMAE)}.
          The full test-set MAE shown above is
          calculated by the backend separately.
        </p>
      </div>
    </div>
  );
}

export default function VotingStackingEvaluationStudio({
  result,
}: Props) {
  const availableModels = Object.keys(
    result.models,
  );

  const [requestedModel, setRequestedModel] =
    useState("stacking");

  const selectedModel = availableModels.includes(
    requestedModel,
  )
    ? requestedModel
    : availableModels[0];

  const model = result.models[selectedModel];

  if (!model) return null;

  const trainMetric =
    result.task === "classification"
      ? model.metrics.train.f1
      : model.metrics.train.rmse;

  const testMetric =
    result.task === "classification"
      ? model.metrics.test.f1
      : model.metrics.test.rmse;

  const generalizationGap =
    isFiniteNumber(trainMetric) &&
    isFiniteNumber(testMetric)
      ? result.task === "classification"
        ? trainMetric - testMetric
        : testMetric - trainMetric
      : null;

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <Target size={20} />

          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Evaluation & Error Analysis
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Model Evaluation Studio
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Inspect actual classification mistakes,
          regression residuals and training-versus-test
          behavior for every fitted model.
        </p>
      </header>

      <div className={panel}>
        <p className="mb-3 text-sm font-semibold">
          Select model to evaluate
        </p>

        <div className="flex flex-wrap gap-2">
          {availableModels.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setRequestedModel(name)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                selectedModel === name
                  ? "bg-violet-600 text-white"
                  : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-violet-500"
              }`}
            >
              {modelNames[name] ?? name}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard
            title="Training observations"
            value={String(result.dataset.train_rows)}
            description="Rows used for fitting"
          />

          <StatCard
            title="Test observations"
            value={String(result.dataset.test_rows)}
            description="Held-out evaluation rows"
          />

          <StatCard
            title="Generalization gap"
            value={format(generalizationGap)}
            description={
              result.task === "classification"
                ? "Training F1 minus test F1"
                : "Test RMSE minus training RMSE"
            }
          />
        </div>
      </div>

      {result.task === "classification" ? (
        <ClassificationEvaluation
          metrics={model.metrics.test}
          classLabels={result.dataset.class_labels}
        />
      ) : (
        <RegressionEvaluation model={model} />
      )}

      <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <Info
          size={18}
          className="mt-1 shrink-0 text-sky-300"
        />

        <p className="text-xs leading-7 text-slate-300">
          A positive generalization gap suggests
          that training performance is better than
          test performance according to the selected
          metric. A large gap may indicate
          overfitting, but cannot establish its
          cause on its own. Use proper validation
          and multiple experiments before drawing
          conclusions.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-300">
        <CheckCircle2 size={16} />
        All metrics are taken from the real fitted
        backend model.
      </div>
    </section>
  );
}
