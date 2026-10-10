
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock3,
  GitCompare,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";

export type ExperimentTask =
  | "classification"
  | "regression";

export type ExperimentMetrics = {
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  r2?: number | null;
  mae?: number | null;
  rmse?: number | null;
};

export type ExperimentModels = {
  single_tree: ExperimentMetrics;
  adaboost: ExperimentMetrics;
  gradient_boosting: ExperimentMetrics;
};

export type BoostingExperiment = {
  id: string;
  createdAt: string;
  label: string;

  task: ExperimentTask;
  dataset: string;
  rows: number;
  features: string[];
  target: string;

  settings: {
    n_estimators: number;
    learning_rate: number;
    max_depth: number;
    subsample: number;
    missing_strategy: string;
  };

  models: ExperimentModels;
};

type Props = {
  experiments: BoostingExperiment[];
  onDelete: (id: string) => void;
  onClear: () => void;
};

type ModelKey = keyof ExperimentModels;

const modelLabels: Record<ModelKey, string> = {
  single_tree: "Decision Tree",
  adaboost: "AdaBoost",
  gradient_boosting: "Gradient Boosting",
};

const card =
  "rounded-2xl border border-slate-800 bg-[#0b1426] p-5";

function displayNumber(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value)) {
    return "N/A";
  }

  return value.toFixed(4);
}

function getMetricNames(task: ExperimentTask) {
  return task === "classification"
    ? (["accuracy", "precision", "recall", "f1"] as const)
    : (["r2", "mae", "rmse"] as const);
}

function formatMetricName(key: string): string {
  const names: Record<string, string> = {
    accuracy: "Accuracy",
    precision: "Precision",
    recall: "Recall",
    f1: "F1 Score",
    r2: "R²",
    mae: "MAE",
    rmse: "RMSE",
  };

  return names[key] ?? key;
}

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

export default function BoostingExperimentHistory({
  experiments,
  onDelete,
  onClear,
}: Props) {
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!experiments.length) {
      setLeftId("");
      setRightId("");
      setSelectedId("");
      return;
    }

    const ids = new Set(
      experiments.map((item) => item.id),
    );

    setSelectedId((previous) =>
      ids.has(previous) ? previous : experiments[0].id,
    );

    setLeftId((previous) =>
      ids.has(previous) ? previous : experiments[0].id,
    );

    setRightId((previous) =>
      ids.has(previous)
        ? previous
        : experiments[1]?.id ?? experiments[0].id,
    );
  }, [experiments]);

  const selected =
    experiments.find((item) => item.id === selectedId) ??
    experiments[0];

  const left =
    experiments.find((item) => item.id === leftId);

  const right =
    experiments.find((item) => item.id === rightId);

  const comparable =
    Boolean(
      left &&
        right &&
        left.task === right.task,
    );

  const comparableMetrics =
    comparable && left
      ? getMetricNames(left.task)
      : [];

  if (!experiments.length) {
    return (
      <section className={card}>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <History
            size={21}
            className="text-violet-300"
          />
          Experiment History
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Train your first model to begin recording
          experiments. Successive training runs will
          appear here for comparison.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-300">
            <History size={19} />
            <span className="text-xs font-bold uppercase tracking-widest">
              ModelMind · Experiment Tracking
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-bold md:text-3xl">
            Experiment History & Comparison
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Compare actual held-out results from
            different Boosting training runs.
            Each record preserves the configuration
            and evaluation metrics used in that run.
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-xl border border-rose-500/30 px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10"
        >
          <Trash2 size={16} />
          Clear History
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Recorded experiments",
            value: experiments.length,
          },
          {
            label: "Classification runs",
            value: experiments.filter(
              (item) => item.task === "classification",
            ).length,
          },
          {
            label: "Regression runs",
            value: experiments.filter(
              (item) => item.task === "regression",
            ).length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <p className="text-xs text-slate-400">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-300">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className={card}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Clock3
            size={19}
            className="text-sky-300"
          />
          Previous Training Runs
        </h3>

        <div className="mt-5 max-h-[400px] space-y-3 overflow-y-auto">
          {experiments.map((item) => (
            <div
              key={item.id}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 ${
                selected?.id === item.id
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-slate-800 bg-slate-950"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="font-semibold">
                  {item.label}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(item.createdAt)}
                </p>

                <p className="mt-2 text-xs capitalize text-violet-300">
                  {item.task} · {item.dataset}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.label}`}
                className="rounded-lg border border-rose-500/20 p-3 text-rose-300 hover:bg-rose-500/10"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className={card}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Activity
              size={19}
              className="text-emerald-300"
            />
            Selected Experiment
          </h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Dataset", selected.dataset],
              ["Task", selected.task],
              ["Rows", String(selected.rows)],
              ["Target", selected.target],
              [
                "Estimators",
                String(selected.settings.n_estimators),
              ],
              [
                "Learning rate",
                String(selected.settings.learning_rate),
              ],
              [
                "Tree depth",
                String(selected.settings.max_depth),
              ],
              [
                "Subsample",
                String(selected.settings.subsample),
              ],
              [
                "Missing values",
                selected.settings.missing_strategy,
              ],
              ["Features", selected.features.join(", ")],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-0 rounded-xl bg-slate-950 p-4"
              >
                <p className="text-xs text-slate-400">
                  {label}
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-slate-200">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="p-3">Metric</th>
                  {(
                    Object.keys(
                      modelLabels,
                    ) as ModelKey[]
                  ).map((key) => (
                    <th key={key} className="p-3">
                      {modelLabels[key]}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {getMetricNames(selected.task).map(
                  (metric) => (
                    <tr
                      key={metric}
                      className="border-b border-slate-800"
                    >
                      <td className="p-3">
                        {formatMetricName(metric)}
                      </td>

                      {(
                        Object.keys(
                          modelLabels,
                        ) as ModelKey[]
                      ).map((key) => (
                        <td
                          key={key}
                          className="p-3 font-mono text-violet-300"
                        >
                          {displayNumber(
                            selected.models[key][metric],
                          )}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={card}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <GitCompare
            size={19}
            className="text-violet-300"
          />
          Compare Two Experiments
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Choose two recorded runs to compare the
          actual evaluation metrics and training settings.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            {
              label: "Experiment A",
              value: leftId,
              onChange: setLeftId,
            },
            {
              label: "Experiment B",
              value: rightId,
              onChange: setRightId,
            },
          ].map((control) => (
            <label
              key={control.label}
              className="block text-xs text-slate-300"
            >
              {control.label}

              <select
                value={control.value}
                onChange={(event) =>
                  control.onChange(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
              >
                {experiments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} — {item.task}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {!comparable ? (
          <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
            Select two experiments of the same task
            type to compare their metrics.
          </p>
        ) : (
          <>
            {left && right && left.id === right.id && (
              <p className="mt-5 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-200">
                Both selections currently refer to the
                same experiment.
              </p>
            )}

            {left && right && (
              <>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[590px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="p-3">Model / Metric</th>
                        <th className="p-3">Experiment A</th>
                        <th className="p-3">Experiment B</th>
                        <th className="p-3">B − A</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(
                        Object.keys(
                          modelLabels,
                        ) as ModelKey[]
                      ).flatMap((modelKey) =>
                        comparableMetrics.map((metric) => {
                          const a =
                            left.models[modelKey][metric];
                          const b =
                            right.models[modelKey][metric];

                          const difference =
                            a != null &&
                            b != null &&
                            Number.isFinite(a) &&
                            Number.isFinite(b)
                              ? b - a
                              : null;

                          return (
                            <tr
                              key={`${modelKey}-${metric}`}
                              className="border-b border-slate-800"
                            >
                              <td className="p-3">
                                <span className="block font-semibold">
                                  {modelLabels[modelKey]}
                                </span>

                                <span className="text-xs text-slate-400">
                                  {formatMetricName(metric)}
                                </span>
                              </td>

                              <td className="p-3 font-mono">
                                {displayNumber(a)}
                              </td>

                              <td className="p-3 font-mono">
                                {displayNumber(b)}
                              </td>

                              <td className="p-3 font-mono text-violet-300">
                                {displayNumber(difference)}
                              </td>
                            </tr>
                          );
                        }),
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="mt-5 text-xs leading-7 text-slate-400">
                  For accuracy, precision, recall, F1
                  and R², higher scores generally indicate
                  better performance. For MAE and RMSE,
                  lower scores are better. The B − A
                  column is the arithmetic difference,
                  not an improvement percentage.
                  Compare results cautiously when
                  datasets, targets, or test splits differ.
                </p>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <RotateCcw
          size={18}
          className="mt-1 shrink-0 text-sky-300"
        />

        <p className="text-xs leading-7 text-slate-300">
          History is stored only in the current page's
          memory. Reloading or closing the page clears
          these records. The comparison studio stores
          training settings and evaluation metrics;
          your active prediction graphs and playback
          continue to represent the latest trained run.
        </p>
      </div>
    </section>
  );
}
