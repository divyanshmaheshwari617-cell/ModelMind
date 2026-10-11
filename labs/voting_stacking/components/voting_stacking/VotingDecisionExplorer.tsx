
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GitMerge,
  Info,
  Scale,
  Users,
} from "lucide-react";

type Task = "classification" | "regression";

type Observation = {
  index: number;
  actual: number | null;
  base_predictions: Record<string, number | null>;
  voting_prediction: number | null;
  stacking_prediction: number | null;
  stacking_meta_features: (number | null)[];
  soft_voting_prediction?: number | null;
  soft_voting_probabilities?: (number | null)[];
};

export type VotingExplanation = {
  method: string;
  base_model_names: string[];
  weights: number[];
  meta_feature_count: number;
  observations: Observation[];
  note: string;
};

type Props = {
  task: Task;
  explanation: VotingExplanation;
  classLabels: string[] | null;
};

const names: Record<string, string> = {
  linear: "Linear Model",
  knn: "K-Nearest Neighbors",
  random_forest: "Random Forest",
};

const colors = [
  "#38bdf8",
  "#a78bfa",
  "#34d399",
];

function isNumber(
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
  return isNumber(value)
    ? value.toFixed(digits)
    : "N/A";
}

function className(
  value: number | null | undefined,
  labels: string[] | null,
): string {
  if (!isNumber(value)) return "Unavailable";

  const index = Math.trunc(value);

  return labels?.[index] ?? `Class ${index}`;
}

function getDisplayValue(
  task: Task,
  value: number | null | undefined,
  labels: string[] | null,
): string {
  return task === "classification"
    ? className(value, labels)
    : format(value);
}

const panel =
  "rounded-2xl border border-slate-800 bg-[#0b1426] p-5";

export default function VotingDecisionExplorer({
  task,
  explanation,
  classLabels,
}: Props) {
  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const observations = explanation.observations ?? [];

  const safeIndex = Math.min(
    selectedIndex,
    Math.max(0, observations.length - 1),
  );

  const observation = observations[safeIndex];

  const memberRows = useMemo(() => {
    if (!observation) return [];

    return explanation.base_model_names.map(
      (key, index) => ({
        key,
        name: names[key] ?? key,
        prediction:
          observation.base_predictions[key] ?? null,
        weight: explanation.weights[index] ?? 0,
        color: colors[index % colors.length],
      }),
    );
  }, [observation, explanation]);

  const totalWeight = memberRows.reduce(
    (sum, member) => sum + member.weight,
    0,
  );

  const weightedVotes = useMemo(() => {
    if (task !== "classification") return [];

    const counts = new Map<number, number>();

    for (const member of memberRows) {
      if (!isNumber(member.prediction)) continue;

      counts.set(
        member.prediction,
        (counts.get(member.prediction) ?? 0) +
          member.weight,
      );
    }

    return Array.from(counts.entries())
      .map(([label, weight]) => ({
        label,
        weight,
      }))
      .sort((a, b) => a.label - b.label);
  }, [memberRows, task]);

  const calculatedAverage = useMemo(() => {
    if (task !== "regression") return null;

    const membersValid = memberRows.every(
      (member) =>
        isNumber(member.prediction) &&
        isNumber(member.weight),
    );

    if (!membersValid || totalWeight <= 0) {
      return null;
    }

    return (
      memberRows.reduce(
        (sum, member) =>
          sum +
          (member.prediction as number) *
            member.weight,
        0,
      ) / totalWeight
    );
  }, [memberRows, task, totalWeight]);

  const votingWinner = useMemo(() => {
    if (task !== "classification") return null;

    if (!weightedVotes.length) return null;

    // sklearn VotingClassifier hard voting uses the
    // highest weighted class count. For ties, the
    // smallest numeric encoded class wins.
    const winner = [...weightedVotes].sort(
      (a, b) =>
        b.weight - a.weight || a.label - b.label,
    )[0];

    return winner.label;
  }, [task, weightedVotes]);

  if (!observation) {
    return (
      <section className={panel}>
        <h2 className="text-xl font-bold">
          Voting Decision Explorer
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Train the models to explore fitted ensemble
          predictions.
        </p>
      </section>
    );
  }

  const maxVote = Math.max(
    1,
    ...weightedVotes.map((item) => item.weight),
  );

  const probabilities =
    observation.soft_voting_probabilities ?? [];

  const weightedTerms = memberRows.map(
    (member) =>
      `${format(member.prediction, 2)} × ${format(
        member.weight,
        1,
      )}`,
  );

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <GitMerge size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Ensemble Explanations
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Voting Decision Explorer
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Examine real held-out observations and see
          how the fitted base models combine their
          predictions using the selected voting weights.
        </p>
      </header>

      <div className={panel}>
        <label className="block text-sm font-semibold text-slate-300">
          Select a test observation
        </label>

        <select
          value={safeIndex}
          onChange={(event) =>
            setSelectedIndex(Number(event.target.value))
          }
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
        >
          {observations.map((item, index) => (
            <option key={index} value={index}>
              Test observation {item.index + 1}
            </option>
          ))}
        </select>

        <p className="mt-3 text-xs text-slate-400">
          Showing observation {safeIndex + 1} of{" "}
          {observations.length} returned samples.
          These observations belong to the held-out
          test split.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Actual target",
            value: getDisplayValue(
              task,
              observation.actual,
              classLabels,
            ),
          },
          {
            title:
              task === "classification"
                ? "Hard Voting"
                : "Weighted Voting",
            value: getDisplayValue(
              task,
              observation.voting_prediction,
              classLabels,
            ),
          },
          {
            title: "Stacking prediction",
            value: getDisplayValue(
              task,
              observation.stacking_prediction,
              classLabels,
            ),
          },
        ].map((card) => (
          <div
            key={card.title}
            className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <p className="text-xs text-slate-400">
              {card.title}
            </p>
            <p className="mt-2 break-words text-lg font-bold text-violet-300">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Users size={19} className="text-sky-300" />
          Base Model Predictions
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          These predictions come from the three
          independently fitted models in this experiment.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {memberRows.map((member) => (
            <div
              key={member.key}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: member.color,
                  }}
                />
                <h4 className="font-semibold">
                  {member.name}
                </h4>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Prediction
              </p>
              <p className="mt-2 break-words text-xl font-bold">
                {getDisplayValue(
                  task,
                  member.prediction,
                  classLabels,
                )}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Voting weight:{" "}
                <strong className="text-violet-300">
                  {format(member.weight, 1)}
                </strong>
              </p>
            </div>
          ))}
        </div>
      </div>

      {task === "classification" ? (
        <>
          <div className={panel}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <BarChart3
                size={19}
                className="text-emerald-300"
              />
              How Hard Voting Works
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Each model votes for its predicted class.
              The voting weight determines how much
              that model contributes to its chosen class.
            </p>

            <div className="mt-6 space-y-5">
              {weightedVotes.map((item) => {
                const percentage =
                  (item.weight / maxVote) * 100;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span>
                        {className(
                          item.label,
                          classLabels,
                        )}
                      </span>

                      <span className="font-mono text-violet-300">
                        {format(item.weight, 2)}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={18} />
                <h4 className="font-bold">
                  Calculated Hard Voting Result
                </h4>
              </div>

              <p className="mt-3 text-xl font-bold">
                {className(
                  votingWinner,
                  classLabels,
                )}
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Backend prediction:{" "}
                <strong>
                  {className(
                    observation.voting_prediction,
                    classLabels,
                  )}
                </strong>
                . The winning class has the largest
                total voting weight. If classes tie,
                scikit-learn selects the lowest encoded
                class index.
              </p>
            </div>
          </div>

          <div className={panel}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Activity
                size={19}
                className="text-sky-300"
              />
              Soft Voting Probabilities
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Soft Voting combines each model's class
              probabilities using the selected weights.
              The final class is chosen from the
              ensemble's averaged probabilities.
            </p>

            <div className="mt-5 space-y-4">
              {probabilities.map((value, index) => {
                const probability = isNumber(value)
                  ? Math.min(1, Math.max(0, value))
                  : 0;

                return (
                  <div key={index}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        {classLabels?.[index] ??
                          `Class ${index}`}
                      </span>

                      <span className="font-mono text-sky-300">
                        {format(value, 4)}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{
                          width: `${probability * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-sm">
              Final Soft Voting prediction:{" "}
              <strong className="text-sky-300">
                {className(
                  observation.soft_voting_prediction,
                  classLabels,
                )}
              </strong>
            </p>

            <p className="mt-3 text-xs leading-6 text-slate-500">
              These are real probabilities returned by
              the fitted Soft Voting ensemble. Individual
              base-model probability vectors are not
              included in the current API response,
              so they are not fabricated here.
            </p>
          </div>
        </>
      ) : (
        <div className={panel}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Scale
              size={19}
              className="text-emerald-300"
            />
            Weighted Regression Calculation
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Voting regression calculates the weighted
            average of the base-model predictions.
          </p>

          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-5 text-center">
            <p className="text-sm leading-7 text-slate-300">
              Weighted average = sum of (prediction ×
              weight) divided by sum of weights
            </p>

            <p className="mt-5 break-words font-mono text-sm text-violet-300">
              ({weightedTerms.join(" + ")})
            </p>

            <p className="mt-3 font-mono text-sm">
              ÷ {format(totalWeight, 2)}
            </p>

            <p className="mt-5 text-2xl font-bold text-emerald-300">
              {format(calculatedAverage)}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm leading-7">
              Actual backend VotingRegressor prediction:{" "}
              <strong className="text-emerald-300">
                {format(observation.voting_prediction)}
              </strong>
            </p>

            <p className="mt-2 text-xs leading-6 text-slate-400">
              Both results should agree up to numerical
              precision because they use the same fitted
              models and configured weights.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-sky-300">
          <BookOpen size={19} />
          Understanding Voting
        </h3>

        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          <p>
            <strong>Hard Voting:</strong> Each classifier
            predicts a class label. The ensemble counts
            weighted votes and chooses the winning class.
          </p>

          <p>
            <strong>Soft Voting:</strong> Each classifier
            predicts class probabilities. The ensemble
            combines the probabilities and selects the
            class with the highest weighted average.
          </p>

          <p>
            <strong>Voting Regression:</strong> Individual
            numerical predictions are combined using a
            weighted average.
          </p>

          <p>
            <strong>Stacking:</strong> Unlike Voting,
            Stacking learns how to combine the base
            learners' predictions using a trained
            meta-model. We'll explore this separately.
          </p>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs leading-6 text-slate-500">
        <Info
          size={16}
          className="mt-1 shrink-0"
        />
        All displayed observations come from the
        completed training response. Changing model
        settings requires retraining before the new
        weights or models affect these results.
      </p>
    </section>
  );
}
