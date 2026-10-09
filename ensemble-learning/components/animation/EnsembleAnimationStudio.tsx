
"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trees,
} from "lucide-react";

import type { EnsembleModel } from "@/lib/api/ensembleApi";

interface Props {
  model: EnsembleModel;
}

interface AnimationStep {
  title: string;
  explanation: string;
  intuition: string;
  input: string;
  learners: string[];
  output: string;
  focus: number;
}

interface AlgorithmLesson {
  title: string;
  subtitle: string;
  formula: string;
  steps: AnimationStep[];
}

const lessons: Record<EnsembleModel, AlgorithmLesson> = {
  bagging: {
    title: "Bagging",
    subtitle: "Bootstrap Aggregating",
    formula: "Final prediction = aggregate(base learner predictions)",
    steps: [
      {
        title: "Start with a dataset",
        explanation:
          "All learners begin with the same original training dataset.",
        intuition:
          "One model can be sensitive to which examples it sees.",
        input: "Original dataset",
        learners: ["Tree A", "Tree B", "Tree C"],
        output: "Not combined yet",
        focus: 0,
      },
      {
        title: "Create bootstrap samples",
        explanation:
          "Randomly sample training rows with replacement. An example can appear more than once in a sample.",
        intuition:
          "Different samples introduce diversity among learners.",
        input: "Bootstrap samples",
        learners: ["Sample A", "Sample B", "Sample C"],
        output: "Three training subsets",
        focus: 1,
      },
      {
        title: "Train independent trees",
        explanation:
          "Fit each base learner independently on its bootstrap sample.",
        intuition:
          "The learners may make different mistakes.",
        input: "Sampled training rows",
        learners: ["Fitted Tree A", "Fitted Tree B", "Fitted Tree C"],
        output: "Individual predictions",
        focus: 2,
      },
      {
        title: "Aggregate predictions",
        explanation:
          "For regression, average predictions. For classification, combine class predictions, commonly by voting.",
        intuition:
          "Combining learners can reduce prediction variance.",
        input: "New observation",
        learners: ["Prediction A", "Prediction B", "Prediction C"],
        output: "Aggregated prediction",
        focus: 3,
      },
    ],
  },

  "random-forest": {
    title: "Random Forest",
    subtitle: "Bagged Trees with Feature Randomness",
    formula: "Forest prediction = combined tree predictions",
    steps: [
      {
        title: "Select training examples",
        explanation:
          "Trees usually receive different bootstrap samples of the training dataset.",
        intuition:
          "Changing the training data makes trees less alike.",
        input: "Training dataset",
        learners: ["Sample A", "Sample B", "Sample C"],
        output: "Diverse training samples",
        focus: 0,
      },
      {
        title: "Randomize candidate features",
        explanation:
          "At each split, a tree considers a random subset of input features.",
        intuition:
          "Strong features cannot dominate every tree in exactly the same way.",
        input: "Feature subsets",
        learners: ["Feature set A", "Feature set B", "Feature set C"],
        output: "Different split candidates",
        focus: 1,
      },
      {
        title: "Grow the trees",
        explanation:
          "Each decision tree learns its own rules using the available candidate features.",
        intuition:
          "Tree diversity is a central reason forests work well.",
        input: "Randomized splits",
        learners: ["Tree A", "Tree B", "Tree C"],
        output: "Trained forest",
        focus: 2,
      },
      {
        title: "Combine forest predictions",
        explanation:
          "Every tree predicts; the forest combines their results.",
        intuition:
          "The combined result is often more stable than one decision tree.",
        input: "New observation",
        learners: ["Tree vote A", "Tree vote B", "Tree vote C"],
        output: "Forest prediction",
        focus: 3,
      },
    ],
  },

  adaboost: {
    title: "AdaBoost",
    subtitle: "Adaptive Boosting",
    formula: "Ensemble score = weighted sum of learner outputs",
    steps: [
      {
        title: "Initialize sample weights",
        explanation:
          "Training examples begin with equal importance in the standard AdaBoost classification procedure.",
        intuition:
          "Initially, each example receives similar attention.",
        input: "Equally weighted rows",
        learners: ["Weak learner 1", "Waiting", "Waiting"],
        output: "Initial weights",
        focus: 0,
      },
      {
        title: "Fit a weak learner",
        explanation:
          "Train a simple model using the current sample weights.",
        intuition:
          "Even a weak learner can contribute useful information.",
        input: "Weighted dataset",
        learners: ["Learner 1 fitted", "Waiting", "Waiting"],
        output: "First predictions",
        focus: 1,
      },
      {
        title: "Focus on mistakes",
        explanation:
          "In the standard discrete classification algorithm, incorrectly classified examples gain relative importance.",
        intuition:
          "Later learners focus more on examples earlier learners struggled with.",
        input: "Updated sample weights",
        learners: ["Learner 1", "Learner 2 fitted", "Waiting"],
        output: "Sequential improvement",
        focus: 2,
      },
      {
        title: "Combine weighted learners",
        explanation:
          "Individual learners contribute according to their fitted ensemble weights.",
        intuition:
          "The final decision reflects the accumulated weighted evidence.",
        input: "New observation",
        learners: ["Weighted vote 1", "Weighted vote 2", "Weighted vote 3"],
        output: "Boosted prediction",
        focus: 3,
      },
    ],
  },

  "gradient-boosting": {
    title: "Gradient Boosting",
    subtitle: "Sequential Loss Optimization",
    formula: "Fₘ(x) = Fₘ₋₁(x) + learning_rate × hₘ(x)",
    steps: [
      {
        title: "Start with an initial model",
        explanation:
          "Begin with a simple baseline prediction, such as a constant estimate for regression.",
        intuition:
          "Boosting improves an existing prediction rather than starting from scratch each time.",
        input: "Training targets",
        learners: ["Baseline model", "Waiting", "Waiting"],
        output: "Initial prediction",
        focus: 0,
      },
      {
        title: "Measure prediction errors",
        explanation:
          "Calculate loss gradients, or residual-like targets, based on the chosen objective.",
        intuition:
          "These values show what the model should correct next.",
        input: "Current predictions",
        learners: ["Current model", "Loss gradients", "Next learner"],
        output: "Correction targets",
        focus: 1,
      },
      {
        title: "Fit a correction tree",
        explanation:
          "Train a new weak learner to approximate the direction that improves the loss.",
        intuition:
          "Each learner adds a correction to the ensemble.",
        input: "Correction targets",
        learners: ["Previous ensemble", "Correction tree", "Updated ensemble"],
        output: "Smaller loss sought",
        focus: 2,
      },
      {
        title: "Update the ensemble",
        explanation:
          "Scale the new learner contribution by the learning rate and add it to the current prediction.",
        intuition:
          "A smaller learning rate makes each boosting step more conservative.",
        input: "Current ensemble",
        learners: ["Existing prediction", "Scaled correction", "New prediction"],
        output: "Improved fitted model",
        focus: 3,
      },
    ],
  },

  voting: {
    title: "Voting Ensemble",
    subtitle: "Combining Different Models",
    formula: "Classification: vote or average probabilities",
    steps: [
      {
        title: "Choose different algorithms",
        explanation:
          "Select several complementary estimators, such as decision trees, forests, and nearest neighbors.",
        intuition:
          "Models with different assumptions may make different mistakes.",
        input: "Training dataset",
        learners: ["Decision Tree", "Random Forest", "KNN"],
        output: "Model collection",
        focus: 0,
      },
      {
        title: "Train each model",
        explanation:
          "Fit each estimator independently on the training data.",
        intuition:
          "Voting does not require learners to train sequentially.",
        input: "Training features",
        learners: ["Fitted Tree", "Fitted Forest", "Fitted KNN"],
        output: "Independent estimators",
        focus: 1,
      },
      {
        title: "Collect predictions",
        explanation:
          "For a new observation, gather every estimator's prediction or class probabilities.",
        intuition:
          "The final system receives multiple perspectives.",
        input: "New observation",
        learners: ["Tree prediction", "Forest prediction", "KNN prediction"],
        output: "Prediction collection",
        focus: 2,
      },
      {
        title: "Vote or average",
        explanation:
          "Hard voting uses predicted class labels; soft voting averages class probabilities. Regression voting averages numeric predictions.",
        intuition:
          "The ensemble combines the models without training a separate meta-learner.",
        input: "Individual outputs",
        learners: ["Vote A", "Vote B", "Vote C"],
        output: "Voting result",
        focus: 3,
      },
    ],
  },

  stacking: {
    title: "Stacking Ensemble",
    subtitle: "Learning How to Combine Models",
    formula: "Final prediction = meta_model(base_model_outputs)",
    steps: [
      {
        title: "Choose base learners",
        explanation:
          "Select different algorithms that can learn complementary patterns.",
        intuition:
          "A useful stack combines models with different strengths.",
        input: "Training dataset",
        learners: ["Decision Tree", "Random Forest", "KNN"],
        output: "Base model collection",
        focus: 0,
      },
      {
        title: "Create out-of-fold predictions",
        explanation:
          "Use cross-validation to produce training predictions from models that did not fit each corresponding validation fold.",
        intuition:
          "This reduces leakage into the meta-learner.",
        input: "Cross-validation folds",
        learners: ["OOF Tree", "OOF Forest", "OOF KNN"],
        output: "Meta-training features",
        focus: 1,
      },
      {
        title: "Train the meta-learner",
        explanation:
          "Fit another model using the base learners' out-of-fold outputs.",
        intuition:
          "The meta-learner discovers how to combine different model signals.",
        input: "OOF predictions",
        learners: ["Tree outputs", "Forest outputs", "KNN outputs"],
        output: "Trained meta-learner",
        focus: 2,
      },
      {
        title: "Make a stacked prediction",
        explanation:
          "Base learners predict on the new observation; their outputs are passed to the fitted meta-learner.",
        intuition:
          "Unlike voting, the combination strategy is itself learned.",
        input: "New observation",
        learners: ["Base prediction A", "Base prediction B", "Base prediction C"],
        output: "Meta-model prediction",
        focus: 3,
      },
    ],
  },
};

function clampStep(value: number, length: number) {
  return Math.max(0, Math.min(length - 1, value));
}

export default function EnsembleAnimationStudio({
  model,
}: Props) {
  const lesson = lessons[model];

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const step = lesson.steps[stepIndex];
  const totalSteps = lesson.steps.length;

  useEffect(() => {
    if (!playing) return;

    const interval = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= totalSteps - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 2100 / speed);

    return () => window.clearInterval(interval);
  }, [playing, speed, totalSteps]);

  function goTo(index: number) {
    setPlaying(false);
    setStepIndex(clampStep(index, totalSteps));
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      return;
    }

    if (stepIndex >= totalSteps - 1) {
      setStepIndex(0);
    }

    setPlaying(true);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400">
            <BrainCircuit size={22} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              ModelMind Learning Studio
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold">
            {lesson.title} Animation
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {lesson.subtitle}
          </p>
        </div>

        <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs text-violet-200">
          Step {stepIndex + 1} of {totalSteps}
        </div>
      </header>

      <div className="mt-6 grid gap-2 sm:grid-cols-4">
        {lesson.steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => goTo(index)}
            className={`rounded-xl border p-3 text-left transition ${
              index === stepIndex
                ? "border-violet-400 bg-violet-500/15"
                : index < stepIndex
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-800 bg-slate-950"
            }`}
          >
            <span className="text-xs text-slate-400">
              STEP {index + 1}
            </span>
            <p className="mt-2 text-xs font-semibold leading-5">
              {item.title}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#090f1d] p-4 md:p-6">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Sparkles size={18} className="text-violet-300" />
          <h3 className="text-center text-lg font-bold">
            {step.title}
          </h3>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex justify-center">
            <div className={`rounded-xl border px-6 py-4 text-center transition-all duration-500 ${
              step.focus === 0
                ? "scale-105 border-violet-400 bg-violet-500/20 shadow-lg shadow-violet-500/10"
                : "border-slate-700 bg-slate-900"
            }`}>
              <BookOpen size={20} className="mx-auto text-sky-400" />
              <p className="mt-2 text-sm font-semibold">
                {step.input}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="text-slate-500" />
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {step.learners.map((learner, index) => (
              <div
                key={`${model}-${stepIndex}-${index}`}
                className={`flex min-h-28 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-500 ${
                  step.focus === 1 || step.focus === 2
                    ? "border-violet-400/70 bg-violet-500/15 shadow-lg shadow-violet-500/10"
                    : "border-slate-700 bg-slate-900"
                }`}
                style={{
                  animation:
                    playing
                      ? `pulse ${1.5 / speed}s ease-in-out infinite`
                      : undefined,
                  animationDelay: `${index * 180}ms`,
                }}
              >
                <Trees size={24} className="text-emerald-400" />
                <p className="mt-3 break-words text-xs font-semibold md:text-sm">
                  {learner}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <ArrowDown className="text-slate-500" />
          </div>

          <div className={`mx-auto max-w-sm rounded-xl border px-5 py-4 text-center transition-all duration-500 ${
            step.focus === 3
              ? "scale-105 border-emerald-400 bg-emerald-500/15 shadow-lg shadow-emerald-500/10"
              : "border-slate-700 bg-slate-900"
          }`}>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <ArrowRight size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Output
              </span>
            </div>
            <p className="mt-2 text-sm font-bold">
              {step.output}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? "Pause" : "Play Animation"}
        </button>

        <button
          type="button"
          disabled={stepIndex === 0}
          onClick={() => goTo(stepIndex - 1)}
          className="rounded-xl border border-slate-700 p-3 disabled:opacity-35"
          aria-label="Previous step"
        >
          <ChevronLeft size={17} />
        </button>

        <button
          type="button"
          disabled={stepIndex === totalSteps - 1}
          onClick={() => goTo(stepIndex + 1)}
          className="rounded-xl border border-slate-700 p-3 disabled:opacity-35"
          aria-label="Next step"
        >
          <ChevronRight size={17} />
        </button>

        <button
          type="button"
          onClick={() => goTo(0)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm"
        >
          <RotateCcw size={15} />
          Restart
        </button>

        <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          Speed
          <select
            value={speed}
            onChange={(event) =>
              setSpeed(Number(event.target.value))
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all duration-500"
          style={{
            width: `${((stepIndex + 1) / totalSteps) * 100}%`,
          }}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
          <h4 className="text-sm font-bold text-sky-300">
            What is happening?
          </h4>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {step.explanation}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h4 className="text-sm font-bold text-emerald-300">
            Why does it matter?
          </h4>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {step.intuition}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
          Mathematical intuition
        </p>
        <p className="mt-2 font-mono text-sm text-slate-200">
          {lesson.formula}
        </p>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-500">
        This is an illustrative algorithm walkthrough,
        not a visualization of actual fitted trees or
        training iterations. The trained-model animation
        layer will be added separately.
      </p>
    </section>
  );
}
