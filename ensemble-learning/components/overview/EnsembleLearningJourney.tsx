
"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  Compass,
  Layers3,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

type JourneyStep = {
  id: string;
  title: string;
  description: string;
  outcome: string;
  duration: string;
  href: string;
  Icon: typeof BookOpen;
};

const steps: JourneyStep[] = [
  {
    id: "foundation",
    title: "Learn the Foundations",
    description:
      "Understand what ensemble learning means and why combining models can be useful.",
    outcome:
      "Explain the difference between one model and an ensemble.",
    duration: "10 min",
    href: "#learn",
    Icon: BookOpen,
  },
  {
    id: "concept",
    title: "Explore Model Predictions",
    description:
      "Change learner diversity and inspect how individual predictions combine.",
    outcome:
      "Describe model agreement and how a combined prediction is formed.",
    duration: "12 min",
    href: "#explore",
    Icon: BrainCircuit,
  },
  {
    id: "comparison",
    title: "Run a Real Model Comparison",
    description:
      "Compare a single Decision Tree with a Random Forest using fitted predictions.",
    outcome:
      "Interpret held-out performance and decide whether the ensemble helped.",
    duration: "20 min",
    href: "#compare",
    Icon: Layers3,
  },
  {
    id: "bias",
    title: "Understand Bias and Variance",
    description:
      "Experiment with training samples, learner complexity, noise, and model diversity.",
    outcome:
      "Explain why combining useful, diverse learners can improve stability.",
    duration: "15 min",
    href: "#bias-variance",
    Icon: TrendingUp,
  },
  {
    id: "theory",
    title: "Master Ensemble Learning Theory",
    description:
      "Review mathematical intuition, misconceptions, examples, and quiz questions.",
    outcome:
      "Explain ensemble limitations and evaluate your understanding.",
    duration: "20 min",
    href: "#theory",
    Icon: ClipboardCheck,
  },
];

export default function EnsembleLearningJourney() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(
    "foundation",
  );
  const [showReset, setShowReset] = useState(false);

  const completedCount = completed.length;
  const progress = Math.round(
    (completedCount / steps.length) * 100,
  );

  const nextStep = useMemo(
    () => steps.find((step) => !completed.includes(step.id)),
    [completed],
  );

  function toggleComplete(id: string) {
    setCompleted((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  function resetJourney() {
    setCompleted([]);
    setExpanded("foundation");
    setShowReset(false);
  }

  return (
    <div className="space-y-6 text-slate-100">
      <section className="overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={18} />
          <span className="text-xs font-bold uppercase tracking-[0.18em]">
            ModelMind · Guided Learning
          </span>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">
              Your Ensemble Learning Journey
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
              Follow five guided checkpoints, from the
              fundamentals to real experiments and deeper
              mathematical understanding.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-400/25 bg-slate-950/70 px-7 py-5 text-center">
            <p className="text-4xl font-bold text-violet-300">
              {progress}%
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Journey completed
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-3 flex justify-between text-xs text-slate-300">
            <span>Learning progress</span>
            <span>
              {completedCount} / {steps.length} checkpoints
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Ensemble learning journey progress"
            className="h-3 overflow-hidden rounded-full bg-slate-800"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Compass size={21} className="text-violet-300" />
              Learning Checkpoints
            </h3>

            <button
              type="button"
              onClick={() => setShowReset((value) => !value)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-violet-400"
            >
              <RotateCcw size={14} />
              Reset Progress
            </button>
          </div>

          {showReset && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm text-slate-300">
                Clear all completed checkpoints?
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={resetJourney}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {steps.map((step, index) => {
              const done = completed.includes(step.id);
              const opened = expanded === step.id;
              const Icon = step.Icon;

              return (
                <article
                  key={step.id}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    done
                      ? "border-emerald-500/35 bg-emerald-500/5"
                      : opened
                        ? "border-violet-500/40 bg-violet-500/5"
                        : "border-slate-800 bg-slate-950/70"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={opened}
                    onClick={() =>
                      setExpanded(opened ? null : step.id)
                    }
                    className="flex w-full items-center gap-4 p-4 text-left"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        done
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-violet-500/15 text-violet-300"
                      }`}
                    >
                      {done ? <Check size={21} /> : <Icon size={21} />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-slate-400">
                        STEP {String(index + 1).padStart(2, "0")}
                        {" · "}{step.duration}
                      </span>

                      <span className="mt-1 block font-semibold">
                        {step.title}
                      </span>
                    </span>

                    {done && (
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-emerald-400"
                      />
                    )}

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        opened ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {opened && (
                    <div className="border-t border-slate-800 px-5 pb-5 pt-4">
                      <p className="text-sm leading-7 text-slate-300">
                        {step.description}
                      </p>

                      <div className="mt-4 rounded-xl bg-slate-950 p-4">
                        <p className="text-xs font-semibold text-sky-300">
                          Learning goal
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {step.outcome}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={step.href}
                          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                        >
                          Open Studio
                          <ArrowRight size={15} />
                        </a>

                        <button
                          type="button"
                          aria-pressed={done}
                          onClick={() => toggleComplete(step.id)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                            done
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-slate-600 text-slate-200 hover:border-emerald-400"
                          }`}
                        >
                          {done ? (
                            <>
                              <CheckCircle2 size={16} />
                              Completed
                            </>
                          ) : (
                            <>
                              <Circle size={16} />
                              Mark Complete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="flex items-center gap-2 font-bold">
              <Target size={19} className="text-sky-300" />
              Recommended Next Step
            </h3>

            {nextStep ? (
              <>
                <p className="mt-5 text-lg font-semibold">
                  {nextStep.title}
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {nextStep.description}
                </p>

                <a
                  href={nextStep.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
                >
                  Continue Learning
                  <ArrowRight size={16} />
                </a>
              </>
            ) : (
              <div className="mt-5">
                <CheckCircle2
                  size={30}
                  className="text-emerald-400"
                />

                <p className="mt-3 font-semibold text-emerald-300">
                  All checkpoints completed!
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  You have marked every overview
                  checkpoint as complete.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 className="font-bold">
              What You'll Learn
            </h3>

            <div className="mt-5 space-y-4">
              {[
                "Ensemble fundamentals",
                "Model predictions and agreement",
                "Real test-set comparisons",
                "Bias–variance tradeoffs",
                "Generalization and evaluation",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle2
                    size={16}
                    className="shrink-0 text-violet-400"
                  />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <p className="px-2 text-xs leading-6 text-slate-500">
            Progress is marked manually and is stored only
            while this page remains mounted. Refreshing the
            page resets it. Automatic completion and saved
            progress can be added in a later phase.
          </p>
        </aside>
      </div>
    </div>
  );
}
