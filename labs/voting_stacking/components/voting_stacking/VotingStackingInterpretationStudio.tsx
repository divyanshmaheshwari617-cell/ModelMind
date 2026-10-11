
"use client";

import { useMemo, useState } from "react";
import {
  BrainCircuit,
  GitCompareArrows,
  Info,
  Network,
  TrendingUp,
  Users,
} from "lucide-react";

type Task = "classification" | "regression";

type Metrics = {
  accuracy?: number | null;
  f1?: number | null;
  r2?: number | null;
  mae?: number | null;
  rmse?: number | null;
};

type Observation = {
  index: number;
  actual: number | null;
  base_predictions: Record<string, number | null>;
  voting_prediction: number | null;
  stacking_prediction: number | null;
  stacking_meta_features: (number | null)[];
  soft_voting_prediction?: number | null;
};

type InterpretationResult = {
  task: Task;

  dataset: {
    class_labels: string[] | null;
    target: string;
    features: string[];
    train_rows: number;
    test_rows: number;
  };

  models: Record<
    string,
    {
      metrics: {
        train: Metrics;
        test: Metrics;
      };
    }
  >;

  ensemble_explanation: {
    base_model_names: string[];
    observations: Observation[];
  };
};

type Props = {
  result: InterpretationResult;
  datasetName?: string;
};

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#0b1426] p-5";

const modelLabels: Record<string, string> = {
  linear: "Linear Model",
  knn: "K-Nearest Neighbors",
  random_forest: "Random Forest",
  hard_voting: "Hard Voting",
  soft_voting: "Soft Voting",
  voting: "Weighted Voting",
  stacking: "Stacking",
};

const palette = [
  "#38bdf8",
  "#a78bfa",
  "#34d399",
];

function valid(
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
  return valid(value) ? value.toFixed(digits) : "N/A";
}

function displayPrediction(
  task: Task,
  value: number | null | undefined,
  classLabels: string[] | null,
): string {
  if (!valid(value)) return "N/A";

  if (task === "classification") {
    const index = Math.trunc(value);

    return (
      classLabels?.[index] ??
      `Class ${index}`
    );
  }

  return value.toFixed(4);
}

function primaryMetric(
  task: Task,
  metrics: Metrics,
): number | null {
  return task === "classification"
    ? metrics.f1 ?? null
    : metrics.rmse ?? null;
}

function MetricCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-3 break-words text-xl font-bold text-violet-300">
        {value}
      </p>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        {detail}
      </p>
    </div>
  );
}

export default function VotingStackingInterpretationStudio({
  result,
  datasetName,
}: Props) {
  const [selectedRow, setSelectedRow] = useState(0);

  const [
    showOnlyDisagreement,
    setShowOnlyDisagreement,
  ] = useState(false);

  const task = result.task;

  const classLabels =
    result.dataset.class_labels;

  const baseNames =
    result.ensemble_explanation.base_model_names;

  const observations =
    result.ensemble_explanation.observations;

  // All rankings use real test metrics from the
  // CURRENT training response, not stored datasets.
  const leaderboard = Object.entries(result.models)
    .map(([name, data]) => ({
      name,
      metric: primaryMetric(
        task,
        data.metrics.test,
      ),
      trainMetric: primaryMetric(
        task,
        data.metrics.train,
      ),
    }))
    .filter(
      (
        item,
      ): item is {
        name: string;
        metric: number;
        trainMetric: number | null;
      } => valid(item.metric),
    )
    .sort((a, b) =>
      task === "classification"
        ? b.metric - a.metric
        : a.metric - b.metric,
    );

  const bestModelName =
    leaderboard[0]?.name;

  const bestIndividual = leaderboard.find(
    (item) => baseNames.includes(item.name),
  );

  const stacking = leaderboard.find(
    (item) => item.name === "stacking",
  );

  const votingName =
    task === "classification"
      ? "soft_voting"
      : "voting";

  const voting = leaderboard.find(
    (item) => item.name === votingName,
  );

  const stackingImprovement =
    stacking && bestIndividual
      ? task === "classification"
        ? stacking.metric -
          bestIndividual.metric
        : bestIndividual.metric -
          stacking.metric
      : null;

  const votingImprovement =
    voting && bestIndividual
      ? task === "classification"
        ? voting.metric -
          bestIndividual.metric
        : bestIndividual.metric -
          voting.metric
      : null;

  // Real base-model diversity using returned
  // held-out observations from the backend.
  const basePairs = useMemo(() => {
    const pairs: {
      first: string;
      second: string;
      agreement: number;
      meanDifference: number;
      count: number;
    }[] = [];

    for (
      let i = 0;
      i < baseNames.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < baseNames.length;
        j++
      ) {
        const first = baseNames[i];
        const second = baseNames[j];

        let agreementCount = 0;
        let totalDifference = 0;
        let count = 0;

        for (const observation of observations) {
          const a =
            observation.base_predictions[first];

          const b =
            observation.base_predictions[second];

          if (!valid(a) || !valid(b)) {
            continue;
          }

          count++;

          if (a === b) {
            agreementCount++;
          }

          totalDifference += Math.abs(a - b);
        }

        pairs.push({
          first,
          second,
          agreement:
            count > 0
              ? agreementCount / count
              : 0,
          meanDifference:
            count > 0
              ? totalDifference / count
              : 0,
          count,
        });
      }
    }

    return pairs;
  }, [baseNames, observations]);

  const rowsWithDisagreement = useMemo(() => {
    return observations.filter(
      (observation) => {
        const predictions = baseNames
          .map(
            (name) =>
              observation.base_predictions[name],
          )
          .filter(valid);

        if (predictions.length < 2) {
          return false;
        }

        if (task === "classification") {
          return (
            new Set(predictions).size > 1
          );
        }

        // For regression, compare the prediction
        // spread rather than exact classification.
        return (
          Math.max(...predictions) -
            Math.min(...predictions) >
          0
        );
      },
    );
  }, [baseNames, observations, task]);

  const visibleRows =
    showOnlyDisagreement
      ? rowsWithDisagreement
      : observations;

  const safeRowIndex = Math.min(
    selectedRow,
    Math.max(visibleRows.length - 1, 0),
  );

  const current =
    visibleRows[safeRowIndex];

  const selectedMembers = current
    ? baseNames.map((name, index) => ({
        name,
        prediction:
          current.base_predictions[name],
        color:
          palette[index % palette.length],
      }))
    : [];

  const classificationAgreement = (() => {
    if (task !== "classification") {
      return null;
    }

    const count = observations.filter(
      (observation) => {
        const predictions = baseNames
          .map(
            (name) =>
              observation.base_predictions[name],
          )
          .filter(valid);

        return (
          predictions.length ===
            baseNames.length &&
          new Set(predictions).size === 1
        );
      },
    ).length;

    return observations.length > 0
      ? count / observations.length
      : null;
  })();

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      {/* HEADER */}

      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={20} />

          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Model Diagnostics
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Advanced Ensemble Interpretation
        </h2>

        {/* CURRENT DATASET INFORMATION */}

        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="break-all text-sm font-semibold text-emerald-300">
            Dataset:{" "}
            {datasetName ?? "Selected dataset"}
          </p>

          <p className="mt-3 text-sm text-sky-300">
            Training rows:{" "}
            {result.dataset.train_rows}
            {" | "}
            Test rows:{" "}
            {result.dataset.test_rows}
          </p>

          <p className="mt-2 break-words text-sm text-slate-300">
            Target: {result.dataset.target}
          </p>

          <p className="mt-2 break-words text-sm text-slate-300">
            Features:{" "}
            {result.dataset.features.join(", ")}
          </p>

          <p className="mt-3 text-xs leading-6 text-slate-400">
            Every score and ranking below uses
            the current training response.
            No historical experiment scores
            are used.
          </p>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
          Understand base-model diversity,
          prediction agreement, generalization,
          and ensemble gains using fitted models
          and held-out evaluation metrics.
        </p>
      </header>

      {/* PERFORMANCE SUMMARY */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Top Performing Model"
          value={
            bestModelName
              ? modelLabels[bestModelName] ??
                bestModelName
              : "N/A"
          }
          detail={
            task === "classification"
              ? "Highest held-out weighted F1"
              : "Lowest held-out RMSE"
          }
        />

        <MetricCard
          title="Stacking vs Best Base Model"
          value={
            stackingImprovement === null
              ? "N/A"
              : `${
                  stackingImprovement > 0
                    ? "+"
                    : ""
                }${format(stackingImprovement)}`
          }
          detail={
            task === "classification"
              ? "F1 gain (positive is better)"
              : "RMSE reduction (positive is better)"
          }
        />

        <MetricCard
          title="Voting vs Best Base Model"
          value={
            votingImprovement === null
              ? "N/A"
              : `${
                  votingImprovement > 0
                    ? "+"
                    : ""
                }${format(votingImprovement)}`
          }
          detail={
            task === "classification"
              ? "Soft Voting F1 gain"
              : "Voting RMSE reduction"
          }
        />

        <MetricCard
          title={
            task === "classification"
              ? "All Base Models Agree"
              : "Inspected Test Rows"
          }
          value={
            task === "classification"
              ? classificationAgreement === null
                ? "N/A"
                : `${(
                    classificationAgreement * 100
                  ).toFixed(1)}%`
              : String(observations.length)
          }
          detail={
            task === "classification"
              ? "Fraction of returned observations with identical base predictions"
              : "Held-out sample used for prediction exploration"
          }
        />
      </div>

      {/* ACTUAL MODEL RANKING */}

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <TrendingUp
            size={19}
            className="text-emerald-300"
          />
          Actual Model Performance Ranking
        </h3>

        <p className="mt-3 text-xs leading-6 text-slate-400">
          {task === "classification"
            ? "Models ranked by held-out weighted F1 (higher is better)."
            : "Models ranked by held-out RMSE (lower is better)."}
          {" "}
          Rankings are calculated from the
          current dataset&apos;s backend evaluation,
          not from predefined values.
        </p>

        <div className="mt-5 space-y-3">
          {leaderboard.map((item, index) => {
            const best = index === 0;

            return (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 font-bold text-violet-300">
                    {index + 1}
                  </span>

                  <div>
                    <p className="font-semibold">
                      {modelLabels[item.name] ??
                        item.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {baseNames.includes(item.name)
                        ? "Base learner"
                        : "Ensemble"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-mono font-bold ${
                      best
                        ? "text-emerald-300"
                        : "text-violet-300"
                    }`}
                  >
                    {format(item.metric)}
                  </p>

                  <p className="text-xs text-slate-500">
                    {task === "classification"
                      ? "Weighted F1"
                      : "RMSE"}
                  </p>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <p className="text-sm text-amber-300">
              No valid model metrics were returned
              for ranking.
            </p>
          )}
        </div>
      </div>

      {/* BASE LEARNER DIVERSITY */}

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Network
            size={19}
            className="text-sky-300"
          />
          Base-Learner Diversity
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {task === "classification"
            ? "Compare how often pairs of classifiers predict the same class."
            : "Compare the mean absolute difference between pairs of regressor predictions."}
          {" "}
          Calculations use the held-out observations
          returned for explanation, not the full
          test set.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {basePairs.map((pair) => {
            const label = `${
              modelLabels[pair.first] ??
              pair.first
            } vs ${
              modelLabels[pair.second] ??
              pair.second
            }`;

            const value =
              task === "classification"
                ? pair.agreement * 100
                : pair.meanDifference;

            return (
              <div
                key={`${pair.first}-${pair.second}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="min-h-12 text-sm font-semibold leading-6">
                  {label}
                </p>

                <p className="mt-3 text-2xl font-bold text-sky-300">
                  {task === "classification"
                    ? `${value.toFixed(1)}%`
                    : format(value)}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {task === "classification"
                    ? "Agreement rate"
                    : "Mean absolute prediction difference"}
                </p>

                {task === "classification" && (
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, value),
                        )}%`,
                      }}
                    />
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-500">
                  Based on {pair.count} predictions
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PREDICTION DISAGREEMENT EXPLORER */}

      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Users
              size={19}
              className="text-violet-300"
            />
            Prediction Disagreement Explorer
          </h3>

          {task === "classification" && (
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showOnlyDisagreement}
                onChange={(event) => {
                  setShowOnlyDisagreement(
                    event.target.checked,
                  );

                  setSelectedRow(0);
                }}
                className="accent-violet-500"
              />

              Only show disagreements
            </label>
          )}
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Inspect real base-model predictions
          for each returned held-out observation.
        </p>

        {visibleRows.length === 0 ? (
          <p className="mt-5 rounded-xl bg-slate-950 p-4 text-sm text-emerald-300">
            No base-model disagreements were found
            in the returned observations.
          </p>
        ) : (
          <>
            <select
              value={safeRowIndex}
              onChange={(event) =>
                setSelectedRow(
                  Number(event.target.value),
                )
              }
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
            >
              {visibleRows.map((item, index) => (
                <option
                  key={item.index}
                  value={index}
                >
                  Test observation {item.index + 1}
                </option>
              ))}
            </select>

            {current && (
              <>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.name}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              member.color,
                          }}
                        />

                        <p className="text-sm font-semibold">
                          {modelLabels[
                            member.name
                          ] ?? member.name}
                        </p>
                      </div>

                      <p className="mt-4 break-words text-lg font-bold">
                        {displayPrediction(
                          task,
                          member.prediction,
                          classLabels,
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard
                    title="Actual"
                    value={displayPrediction(
                      task,
                      current.actual,
                      classLabels,
                    )}
                    detail="Ground-truth test target"
                  />

                  <MetricCard
                    title="Voting"
                    value={displayPrediction(
                      task,
                      current.voting_prediction,
                      classLabels,
                    )}
                    detail={
                      task === "classification"
                        ? "Hard Voting prediction"
                        : "Weighted ensemble prediction"
                    }
                  />

                  <MetricCard
                    title="Stacking"
                    value={displayPrediction(
                      task,
                      current.stacking_prediction,
                      classLabels,
                    )}
                    detail="Meta-learner prediction"
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ENSEMBLE IMPROVEMENT */}

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <GitCompareArrows
            size={19}
            className="text-emerald-300"
          />
          Does the Ensemble Actually Improve?
        </h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            {
              name: "Voting",
              improvement: votingImprovement,
              metric: voting?.metric,
            },
            {
              name: "Stacking",
              improvement: stackingImprovement,
              metric: stacking?.metric,
            },
          ].map((entry) => {
            const improved =
              entry.improvement !== null &&
              entry.improvement > 0;

            return (
              <div
                key={entry.name}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5"
              >
                <h4 className="font-bold">
                  {entry.name}
                </h4>

                <p className="mt-3 text-sm text-slate-400">
                  Test metric
                </p>

                <p className="mt-2 text-xl font-bold text-violet-300">
                  {format(entry.metric)}
                </p>

                <p
                  className={`mt-4 text-sm font-semibold ${
                    improved
                      ? "text-emerald-300"
                      : "text-amber-300"
                  }`}
                >
                  {entry.improvement === null
                    ? "Not available"
                    : improved
                      ? "Improved over best base model"
                      : entry.improvement === 0
                        ? "Tied with best base model"
                        : "Did not outperform best base model"}
                </p>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  Comparison uses held-out{" "}
                  {task === "classification"
                    ? "weighted F1"
                    : "RMSE"}.
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-7 text-slate-400">
          An ensemble is not automatically better
          than a single model. Its value depends
          on how complementary the member models
          are, the available data, hyperparameters,
          and the validation procedure.
        </p>
      </div>

      {/* EVALUATION NOTES */}

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <div className="flex items-start gap-3">
          <Info
            size={18}
            className="mt-1 shrink-0 text-sky-300"
          />

          <div className="space-y-3 text-xs leading-7 text-slate-300">
            <p>
              <strong>Evaluation scope:</strong>{" "}
              Model rankings and ensemble
              improvements use the complete
              held-out test metrics returned
              by the backend.
            </p>

            <p>
              <strong>Diversity scope:</strong>{" "}
              Agreement and pairwise prediction
              differences use only the returned
              test observations. These are
              diagnostic examples rather than
              estimates over the entire test set.
            </p>

            <p>
              <strong>Feature importance:</strong>{" "}
              When available, feature-importance
              results are calculated using held-out
              permutation importance on the
              currently trained dataset. These
              indicate how much model performance
              changes when a feature is shuffled.
            </p>

            <p>
              <strong>Dataset-specific results:</strong>{" "}
              The best model can change when the
              selected dataset, features, target,
              task, or hyperparameters change.
              Rankings are never fixed in advance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
