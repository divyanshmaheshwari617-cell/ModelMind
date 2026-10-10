
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";

type Task = "classification" | "regression";
type ModelKey =
  | "single_tree"
  | "adaboost"
  | "gradient_boosting";

type Metrics = {
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  r2?: number | null;
  mae?: number | null;
  rmse?: number | null;
};

type ModelData = {
  metrics: {
    train: Metrics;
    test: Metrics;
  };
  fitted_estimators: number;
  training_progression: {
    stage: number;
    metrics: Metrics;
  }[];
};

export type InterpretationInput = {
  task: Task;
  dataset: {
    train_rows: number;
    test_rows: number;
    features: string[];
    target: string;
  };
  models: Record<ModelKey, ModelData>;
};

type Props = {
  result: InterpretationInput;
  settings: {
    n_estimators: number;
    learning_rate: number;
    max_depth: number;
    subsample: number;
  };
};

const names: Record<ModelKey, string> = {
  single_tree: "Decision Tree",
  adaboost: "AdaBoost",
  gradient_boosting: "Gradient Boosting",
};

const modelKeys: ModelKey[] = [
  "single_tree",
  "adaboost",
  "gradient_boosting",
];

function valid(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function fmt(value: number | null | undefined, digits = 4) {
  return valid(value) ? value.toFixed(digits) : "N/A";
}

function evaluation(
  task: Task,
  metrics: Metrics,
): number | null {
  const value =
    task === "classification"
      ? metrics.accuracy
      : metrics.rmse;

  return valid(value) ? value : null;
}

function scoreName(task: Task) {
  return task === "classification" ? "Accuracy" : "RMSE";
}

function determineBest(
  task: Task,
  models: Record<ModelKey, ModelData>,
): ModelKey | null {
  const candidates = modelKeys
    .map((key) => ({
      key,
      score: evaluation(task, models[key].metrics.test),
    }))
    .filter(
      (entry): entry is { key: ModelKey; score: number } =>
        entry.score !== null,
    );

  if (!candidates.length) return null;

  candidates.sort((a, b) =>
    task === "classification"
      ? b.score - a.score
      : a.score - b.score,
  );

  return candidates[0].key;
}


function Generalization({
  task,
  model,
  name,
}: {
  task: Task;
  model: ModelData;
  name: string;
}) {
  const train = evaluation(task, model.metrics.train);
  const test = evaluation(task, model.metrics.test);

  const gap =
    train === null || test === null
      ? null
      : task === "classification"
        ? train - test
        : test - train;

  let observation =
    "Insufficient data to assess the gap.";

  if (gap !== null) {
    if (task === "classification") {
      observation =
        gap > 0.12
          ? "Training accuracy is noticeably higher than test accuracy. This is a possible overfitting signal."
          : gap > 0.04
            ? "There is a moderate training-to-test accuracy gap. Try comparing simpler settings."
            : "Training and test accuracy are reasonably close in this split.";
    } else {
      observation =
        train !== null &&
        train > 0 &&
        gap > train * 0.5
          ? "Test RMSE is substantially higher than training RMSE. This may indicate poor generalization."
          : gap > 0
            ? "Test error is higher than training error, which is common. Compare the gap across configurations."
            : "Test error is not higher than training error in this split.";
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h4 className="font-bold">{name}</h4>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-400">
            Train {scoreName(task)}
          </p>

          <p className="mt-2 font-mono text-lg text-sky-300">
            {fmt(train)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">
            Test {scoreName(task)}
          </p>

          <p className="mt-2 font-mono text-lg text-violet-300">
            {fmt(test)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-300">
        {observation}
      </p>
    </div>
  );
}


function StageAnalysis({
  task,
  model,
  name,
}: {
  task: Task;
  model: ModelData;
  name: string;
}) {
  const progression = model.training_progression ?? [];

  if (progression.length === 0) {
    return null;
  }

  const validStages = progression
    .map((item) => ({
      stage: item.stage,
      value: evaluation(task, item.metrics),
    }))
    .filter(
      (entry): entry is { stage: number; value: number } =>
        entry.value !== null,
    );

  if (!validStages.length) return null;

  const best = [...validStages].sort((a, b) =>
    task === "classification"
      ? b.value - a.value
      : a.value - b.value,
  )[0];

  const final = validStages[validStages.length - 1];

  const finalWorse =
    task === "classification"
      ? final.value < best.value - 0.03
      : final.value > best.value * 1.1;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <h4 className="font-bold">{name}</h4>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400">
            Best saved checkpoint
          </p>
          <p className="mt-2 font-bold text-sky-300">
            Stage {best.stage}
          </p>
          <p className="mt-1 font-mono">
            {fmt(best.value)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">
            Final saved checkpoint
          </p>
          <p className="mt-2 font-bold text-violet-300">
            Stage {final.stage}
          </p>
          <p className="mt-1 font-mono">
            {fmt(final.value)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-300">
        {finalWorse
          ? "The final checkpoint scores worse than the best saved checkpoint. More learners did not improve this held-out score."
          : "The final checkpoint is close to the best saved performance by this comparison rule."}
      </p>

      <p className="mt-3 text-xs text-slate-500">
        Checkpoints are evaluated on held-out test data.
        These observations are exploratory, not formal
        early-stopping recommendations.
      </p>
    </div>
  );
}

export default function BoostingModelInterpretation({
  result,
  settings,
}: Props) {
  const [openTheory, setOpenTheory] = useState(false);

  const best = useMemo(
    () => determineBest(result.task, result.models),
    [result],
  );

  const bestMetric =
    best !== null
      ? evaluation(
          result.task,
          result.models[best].metrics.test,
        )
      : null;

  const suggestions = useMemo(() => {
    const items: string[] = [];

    if (settings.n_estimators <= 15) {
      items.push(
        "Try more estimators to see whether the sequential ensemble continues improving.",
      );
    } else if (settings.n_estimators >= 100) {
      items.push(
        "Compare fewer estimators. A larger ensemble is not always better on held-out data.",
      );
    }

    if (settings.learning_rate >= 0.5) {
      items.push(
        "Try a smaller learning rate with a suitable number of estimators to explore smoother updates.",
      );
    }

    if (settings.max_depth >= 5) {
      items.push(
        "Try shallower trees and compare training versus test performance.",
      );
    }

    if (settings.subsample === 1) {
      items.push(
        "For Gradient Boosting, compare subsampling at 0.7 or 0.8 against the current full-sample setting.",
      );
    }

    if (result.dataset.features.length > 2) {
      items.push(
        "Your prediction surfaces show only the first two selected features. The others remain fixed when the surface is calculated.",
      );
    }

    if (result.dataset.test_rows < 25) {
      items.push(
        "The test split is small, so the measured performance may be sensitive to individual observations.",
      );
    }

    items.push(
      "Compare one setting at a time using Experiment History. Keep the dataset, target, and train/test split consistent for meaningful comparisons.",
    );

    return items;
  }, [result, settings]);

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Result Interpretation
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Understand Your Model Results
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Automatically interpret real training results,
          generalization gaps, saved Boosting stages,
          and hyperparameter choices.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 lg:col-span-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <Target size={19} />
            <h3 className="font-bold">
              Best Test Score in This Run
            </h3>
          </div>

          <p className="mt-4 text-2xl font-bold">
            {best ? names[best] : "Unavailable"}
          </p>

          <p className="mt-2 font-mono text-xl text-emerald-300">
            {scoreName(result.task)}: {fmt(bestMetric)}
          </p>

          <p className="mt-4 text-xs leading-6 text-slate-300">
            {result.task === "classification"
              ? "Selected by highest held-out accuracy."
              : "Selected by lowest held-out RMSE."}
            {" "}A single split does not establish that a
            model will always perform best.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-2 text-sky-300">
            <Activity size={19} />
            <h3 className="font-bold">
              Dataset Summary
            </h3>
          </div>

          <p className="mt-4 text-sm text-slate-300">
            Training observations:{" "}
            <strong>{result.dataset.train_rows}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Test observations:{" "}
            <strong>{result.dataset.test_rows}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Input features:{" "}
            <strong>{result.dataset.features.length}</strong>
          </p>
          <p className="mt-2 break-all text-sm text-slate-300">
            Target: <strong>{result.dataset.target}</strong>
          </p>
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <GitCompare size={19} className="text-sky-300" />
          Train vs Test Generalization
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-400">
          Look for differences between training fit and
          performance on unseen held-out observations.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {modelKeys.map((key) => (
            <Generalization
              key={key}
              task={result.task}
              model={result.models[key]}
              name={names[key]}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <TrendingUp
            size={19}
            className="text-violet-300"
          />
          What Happened Across Boosting Stages?
        </h3>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <StageAnalysis
            task={result.task}
            model={result.models.adaboost}
            name="AdaBoost"
          />

          <StageAnalysis
            task={result.task}
            model={result.models.gradient_boosting}
            name="Gradient Boosting"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0b1426] p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Lightbulb size={19} className="text-amber-300" />
          Suggested Next Experiments
        </h3>

        <div className="mt-5 space-y-3">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <CheckCircle2
                size={17}
                className="mt-1 shrink-0 text-violet-300"
              />
              <p className="text-sm leading-7 text-slate-300">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
        <button
          type="button"
          onClick={() => setOpenTheory((value) => !value)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-2 font-bold text-sky-300">
            <BookOpen size={19} />
            How Should I Interpret These Results?
          </span>
          {openTheory ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openTheory && (
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>
              <strong>Overfitting:</strong> A model may
              perform exceptionally well on training data
              but less well on held-out observations.
              A large gap can indicate poor generalization.
            </p>
            <p>
              <strong>Underfitting:</strong> A shallow or
              overly constrained model may perform poorly
              on both training and test data.
            </p>
            <p>
              <strong>Boosting checkpoints:</strong> The
              ensemble may improve rapidly at first and
              then plateau. The best saved test checkpoint
              is descriptive; repeatedly choosing stages
              based on test performance risks test-set
              overfitting.
            </p>
            <p>
              <strong>Reliable selection:</strong> For
              serious ML work, tune using validation data
              or cross-validation and evaluate your chosen
              configuration on a separate final test set.
            </p>
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs leading-6 text-slate-500">
        <AlertTriangle size={16} className="mt-1 shrink-0" />
        Interpretations use simple, disclosed heuristics.
        They are not statistical significance tests,
        causal findings, or guarantees of future
        model performance.
      </p>
    </section>
  );
}
