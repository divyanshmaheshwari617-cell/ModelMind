
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  GitMerge,
  Info,
  Layers3,
  Network,
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

type Explanation = {
  method: string;
  base_model_names: string[];
  weights: number[];
  meta_feature_count: number;
  observations: Observation[];
  note: string;
};

type Configuration = {
  stacking_cv: number;
  stacking_passthrough: boolean;
};

type Props = {
  task: Task;
  explanation: Explanation;
  classLabels: string[] | null;
  features: string[];
  configuration: Configuration;
};

const memberNames: Record<string, string> = {
  linear: "Linear Model",
  knn: "K-Nearest Neighbors",
  random_forest: "Random Forest",
};

const memberColors = [
  "#38bdf8",
  "#a78bfa",
  "#34d399",
];

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#0b1426] p-5";

function finite(
  value: number | null | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function format(
  value: number | null | undefined,
  digits = 5,
): string {
  return finite(value) ? value.toFixed(digits) : "N/A";
}

function classLabel(
  value: number | null | undefined,
  labels: string[] | null,
): string {
  if (!finite(value)) return "Unavailable";

  return labels?.[Math.trunc(value)] ??
    `Class ${Math.trunc(value)}`;
}

function displayPrediction(
  task: Task,
  value: number | null | undefined,
  labels: string[] | null,
): string {
  return task === "classification"
    ? classLabel(value, labels)
    : format(value, 4);
}

function buildMetaFeatureLabels(
  task: Task,
  modelNames: string[],
  classLabels: string[] | null,
  features: string[],
  passthrough: boolean,
  actualCount: number,
): string[] {
  const labels: string[] = [];

  const classCount = classLabels?.length ?? 0;

  for (const modelName of modelNames) {
    const name = memberNames[modelName] ?? modelName;

    if (task === "regression") {
      labels.push(`${name} prediction`);
    } else if (classCount === 2) {
      // sklearn StackingClassifier drops the first
      // probability column in binary classification.
      labels.push(
        `${name} · P(${classLabels?.[1] ?? "class 1"})`,
      );
    } else if (classCount > 2) {
      for (let index = 0; index < classCount; index++) {
        labels.push(
          `${name} · P(${classLabels?.[index] ?? index})`,
        );
      }
    }
  }

  if (passthrough) {
    for (const feature of features) {
      labels.push(`Original input · ${feature}`);
    }
  }

  // The fitted transform is authoritative. If a
  // configuration or sklearn version produces more
  // columns, label them without fabricating semantics.
  return Array.from({ length: actualCount }, (_, index) =>
    labels[index] ?? `Meta-feature ${index + 1}`,
  );
}

function ValueCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-violet-300">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs leading-6 text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function StackingMetaLearnerExplorer({
  task,
  explanation,
  classLabels,
  features,
  configuration,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] =
    useState(false);

  const observations = explanation.observations ?? [];

  const index = Math.min(
    selectedIndex,
    Math.max(observations.length - 1, 0),
  );

  const observation = observations[index];

  const metaFeatures =
    observation?.stacking_meta_features ?? [];

  const labels = useMemo(
    () =>
      buildMetaFeatureLabels(
        task,
        explanation.base_model_names,
        classLabels,
        features,
        configuration.stacking_passthrough,
        metaFeatures.length,
      ),
    [
      task,
      explanation.base_model_names,
      classLabels,
      features,
      configuration.stacking_passthrough,
      metaFeatures.length,
    ],
  );

  const displayedFeatures = metaFeatures
    .map((value, featureIndex) => ({
      value,
      name: labels[featureIndex],
      index: featureIndex,
    }))
    .slice(
      0,
      showAllFeatures ? undefined : 12,
    );

  const memberPredictions = (
    explanation.base_model_names ?? []
  ).map((name, memberIndex) => ({
    name: memberNames[name] ?? name,
    prediction:
      observation?.base_predictions?.[name] ?? null,
    color: memberColors[
      memberIndex % memberColors.length
    ],
  }));

  if (!observation) {
    return (
      <section className={panel}>
        <h2 className="text-xl font-bold">
          Stacking Meta-Learner Explorer
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Train the ensemble to explore actual
          stacking meta-features.
        </p>
      </section>
    );
  }

  const finalModelName =
    task === "classification"
      ? "Logistic Regression Meta-Learner"
      : "Ridge Regression Meta-Learner";

  return (
    <section className="min-w-0 space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <Network size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Ensemble Architecture
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Stacking Meta-Learner Explorer
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Examine how fitted base learners generate
          meta-features and how the trained stacking
          ensemble produces a final prediction.
        </p>
      </header>

      <div className={panel}>
        <label className="block text-sm font-semibold">
          Select held-out observation
        </label>

        <select
          value={index}
          onChange={(event) =>
            setSelectedIndex(Number(event.target.value))
          }
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
        >
          {observations.map((item, itemIndex) => (
            <option key={itemIndex} value={itemIndex}>
              Test observation {item.index + 1}
            </option>
          ))}
        </select>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ValueCard
            label="Actual target"
            value={displayPrediction(
              task,
              observation.actual,
              classLabels,
            )}
          />

          <ValueCard
            label="Stacking prediction"
            value={displayPrediction(
              task,
              observation.stacking_prediction,
              classLabels,
            )}
          />

          <ValueCard
            label="Meta-feature count"
            value={String(metaFeatures.length)}
          />
        </div>
      </div>

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Layers3 size={19} className="text-sky-300" />
          Actual Stacking Pipeline
        </h3>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {memberPredictions.map((member) => (
            <div
              key={member.name}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: member.color,
                  }}
                />

                <h4 className="text-sm font-bold">
                  {member.name}
                </h4>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Independent model prediction
              </p>

              <p className="mt-2 break-words text-lg font-semibold">
                {displayPrediction(
                  task,
                  member.prediction,
                  classLabels,
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="my-5 flex justify-center">
          <ArrowDown
            size={27}
            className="text-violet-300"
          />
        </div>

        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <GitMerge
              size={19}
              className="text-violet-300"
            />

            <h4 className="font-bold">
              Stacking Meta-Feature Vector
            </h4>
          </div>

          <p className="mt-3 text-sm text-slate-300">
            {metaFeatures.length} actual values
            generated by the fitted stacking transform
          </p>

          <p className="mt-3 text-xs leading-6 text-slate-400">
            {task === "classification"
              ? "The stacking classifier passes class-probability information to the final estimator."
              : "The stacking regressor passes base-model regression predictions to the final estimator."}
          </p>
        </div>

        <div className="my-5 flex justify-center">
          <ArrowDown
            size={27}
            className="text-violet-300"
          />
        </div>

        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <BrainCircuit
              size={19}
              className="text-sky-300"
            />

            <h4 className="font-bold">
              {finalModelName}
            </h4>
          </div>

          <p className="mt-3 text-sm text-slate-300">
            The meta-learner combines the meta-feature
            values using parameters learned during
            stacking training.
          </p>
        </div>

        <div className="my-5 flex justify-center">
          <ArrowDown
            size={27}
            className="text-emerald-300"
          />
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
          <CheckCircle2
            size={24}
            className="mx-auto text-emerald-300"
          />

          <h4 className="mt-3 font-bold">
            Final Stacking Prediction
          </h4>

          <p className="mt-3 break-words text-2xl font-bold text-emerald-300">
            {displayPrediction(
              task,
              observation.stacking_prediction,
              classLabels,
            )}
          </p>
        </div>
      </div>

      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Activity
                size={19}
                className="text-violet-300"
              />
              Real Meta-Feature Values
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Each value comes directly from
              `stacking.transform()` on the selected
              held-out observation.
            </p>
          </div>

          {metaFeatures.length > 12 && (
            <button
              type="button"
              onClick={() =>
                setShowAllFeatures((previous) => !previous)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm hover:border-violet-500"
            >
              {showAllFeatures
                ? "Show fewer"
                : "Show all features"}
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {displayedFeatures.map((feature) => (
            <div
              key={feature.index}
              className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="text-xs text-slate-500">
                Meta-feature {feature.index + 1}
              </p>

              <p className="mt-2 break-words text-xs font-semibold text-slate-300">
                {feature.name}
              </p>

              <p className="mt-3 break-all font-mono text-lg text-violet-300">
                {format(feature.value)}
              </p>
            </div>
          ))}
        </div>

        {task === "classification" && (
          <p className="mt-5 text-xs leading-7 text-slate-400">
            In binary classification, scikit-learn
            drops one probability column per base
            classifier because the two class
            probabilities sum to one. In multiclass
            classification, the probability columns
            for every class are normally retained.
          </p>
        )}

        {configuration.stacking_passthrough && (
          <p className="mt-4 text-xs leading-7 text-sky-300">
            Passthrough is enabled. The original
            selected feature values are appended to
            the meta-features supplied to the
            final estimator.
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={panel}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <BookOpen
              size={19}
              className="text-sky-300"
            />
            Why Cross-Validation?
          </h3>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            When stacking is fitted, scikit-learn
            generates out-of-fold base-model predictions
            for training the meta-learner. This reduces
            the risk of training the meta-learner on
            overly optimistic in-sample predictions.
          </p>

          <div className="mt-4 rounded-xl bg-slate-950 p-4">
            <p className="text-xs text-slate-400">
              Configured stacking CV folds
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-300">
              {configuration.stacking_cv}
            </p>
          </div>
        </div>

        <div className={panel}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Network
              size={19}
              className="text-emerald-300"
            />
            Voting vs Stacking
          </h3>

          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
            <p>
              <strong>Voting:</strong> Uses specified
              weights to combine model predictions
              without training another combination model.
            </p>

            <p>
              <strong>Stacking:</strong> Trains a
              second-level model on base-model prediction
              features. Its learned combination is not
              the same as the Voting weights.
            </p>

            <p>
              <strong>Important:</strong> The base-model
              predictions shown above are independent
              model predictions. The meta-feature
              vector is obtained directly from the
              separately fitted stacking ensemble.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <Info
          size={18}
          className="mt-1 shrink-0 text-sky-300"
        />

        <p className="text-xs leading-7 text-slate-300">
          {explanation.note}
          {" "}The trained meta-learner's coefficients
          are not included in the current backend
          response. Therefore, this explorer shows
          actual inputs and predictions without
          inventing internal coefficient values.
        </p>
      </div>
    </section>
  );
}
