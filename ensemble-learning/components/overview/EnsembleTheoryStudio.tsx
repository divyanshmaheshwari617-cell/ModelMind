
"use client";

import { useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  Lightbulb,
  Sparkles,
  XCircle,
} from "lucide-react";

type Level = "basic" | "intermediate" | "advanced";

type Lesson = {
  id: string;
  title: string;
  duration: string;
  basic: string;
  intermediate: string;
  advanced: string;
  example: string;
  takeaway: string;
};

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6";

const lessons: Lesson[] = [
  {
    id: "foundation",
    title: "What is Ensemble Learning?",
    duration: "5 min",
    basic:
      "Ensemble Learning combines predictions from multiple machine learning models. Instead of trusting one model completely, we use several models and combine their answers.",
    intermediate:
      "An ensemble combines fitted estimators using an aggregation function or a learned combination rule. It aims to improve generalization, robustness, or predictive performance.",
    advanced:
      "Given base estimators f₁(x), ..., fₘ(x), an ensemble constructs F(x) = A(f₁(x), ..., fₘ(x)), where A is an aggregation operator or a learned function. The effect on generalization depends on base-model errors, their dependence, and the aggregation strategy.",
    example:
      "Three regression models predict 70, 74, and 72. Their unweighted mean is 72.",
    takeaway:
      "An ensemble combines multiple predictions, but improvement is not guaranteed.",
  },
  {
    id: "why",
    title: "Why Combine Models?",
    duration: "6 min",
    basic:
      "Different models can make different mistakes. When one model is wrong, other models might be correct, helping the combined system produce a better result.",
    intermediate:
      "Averaging can reduce prediction variance, especially when useful estimators have imperfectly correlated errors. Other ensemble approaches can improve model flexibility.",
    advanced:
      "For n unbiased estimators with common error variance σ² and identical pairwise error correlation ρ, the variance of their average is σ²[ρ + (1−ρ)/n]. This is smaller than σ² for ρ < 1 and n > 1, assuming the correlation structure is feasible.",
    example:
      "When learners disagree on some noisy examples but agree on clear patterns, combining them may make predictions more stable.",
    takeaway:
      "Base-model quality and diversity both influence ensemble performance.",
  },
  {
    id: "diversity",
    title: "Understanding Model Diversity",
    duration: "7 min",
    basic:
      "A team where everyone makes exactly the same mistake is not very helpful. A team with different strengths may perform better.",
    intermediate:
      "Diversity refers to differences among learners' predictions, errors, training data, architectures, or fitted decision boundaries. Diversity is useful when paired with predictive skill.",
    advanced:
      "For averaged regression estimates, covariance terms contribute to ensemble variance. Lower error covariance can make averaging more effective, but excessive diversity from weak or biased estimators can damage prediction quality.",
    example:
      "If three identical models always predict the same value, their average is unchanged. If they produce different useful estimates, averaging may stabilize the result.",
    takeaway:
      "Diversity by itself is not enough: learners must also provide useful information.",
  },
  {
    id: "bias",
    title: "Bias, Variance and Generalization",
    duration: "8 min",
    basic:
      "Bias means consistently missing the true pattern. Variance means predictions change a lot when training data changes. We want models that learn well without being too unstable.",
    intermediate:
      "Under squared-error regression, expected prediction error decomposes into squared bias, prediction variance, and irreducible observation noise. Different ensemble approaches affect these components differently.",
    advanced:
      "At an input x, assuming y = f(x) + ε with E[ε|x] = 0 and noise independent of training samples: E[(y−F(x))²] = (E[F(x)]−f(x))² + Var(F(x)) + Var(ε|x). A finite simulation only estimates these quantities.",
    example:
      "A highly sensitive learner may fit small differences between training datasets. Averaging suitably diverse learners may reduce that sensitivity.",
    takeaway:
      "Ensembling may reduce variance or improve fit, depending on the methods used.",
  },
  {
    id: "classification",
    title: "Classification vs Regression Ensembles",
    duration: "6 min",
    basic:
      "For classification, models predict categories such as Yes or No. For regression, models predict numbers such as house prices.",
    intermediate:
      "Classification ensembles may combine class labels or class probabilities. Regression ensembles may average numeric predictions or use a learned combination function.",
    advanced:
      "Combining class probabilities retains information about confidence and may differ from majority voting. Probability calibration, class imbalance, decision thresholds, and differing model scales can affect results.",
    example:
      "Classification: three models predict A, A, B, giving A by majority vote. Regression: predictions 12, 15, 18 average to 15.",
    takeaway:
      "The way predictions are combined depends on the task and ensemble architecture.",
  },
  {
    id: "evaluation",
    title: "How to Evaluate an Ensemble",
    duration: "8 min",
    basic:
      "We must test whether the combined model actually works better. We should compare it with a single model on data neither model trained on.",
    intermediate:
      "Use the same held-out test set, suitable task metrics, and fair preprocessing. Review training-versus-test performance and compare performance across multiple random splits when possible.",
    advanced:
      "An observed difference on one split can be noisy. Cross-validation, confidence intervals, leakage-safe pipelines, and paired evaluation help establish whether improvements are reliable. Computational cost and prediction latency are additional trade-offs.",
    example:
      "A single tree gets 84% test accuracy while an ensemble gets 87%. The ensemble performed better on that split, but the 3-point difference alone does not prove universal superiority.",
    takeaway:
      "Measure actual generalization, computational cost, and robustness instead of assuming more models are better.",
  },
];

const misconceptions = [
  {
    myth: "More models always mean higher accuracy.",
    reality:
      "Adding weak or highly correlated learners may not improve results. Additional complexity can even hurt performance.",
  },
  {
    myth: "Every ensemble uses majority voting.",
    reality:
      "Ensembles can average numbers, aggregate probabilities, use weighted combinations, or learn a combination model.",
  },
  {
    myth: "Diversity means models must disagree as much as possible.",
    reality:
      "Useful diversity comes from complementary, predictive learners. Random disagreement without predictive skill is not enough.",
  },
  {
    myth: "High training accuracy proves a better ensemble.",
    reality:
      "Training performance does not establish generalization. Held-out evaluation, leakage prevention, and robustness matter.",
  },
];

const applications = [
  {
    title: "Healthcare Risk Prediction",
    text: "Combining predictors may improve risk estimation, but clinical validity and calibration must be tested.",
  },
  {
    title: "Financial Risk Analysis",
    text: "Multiple estimators can capture complementary patterns in complex financial data.",
  },
  {
    title: "Environmental Forecasting",
    text: "Combining forecasts can sometimes reduce sensitivity to individual model errors.",
  },
  {
    title: "Fraud Detection",
    text: "An ensemble may combine different signals to identify unusual transactions.",
  },
];

const levelDescription: Record<Level, string> = {
  basic: "Simple intuition, clear examples, and beginner explanations.",
  intermediate:
    "Model behavior, evaluation, and the reasoning behind ensemble performance.",
  advanced:
    "Mathematical intuition, assumptions, error dependence, and generalization.",
};

export default function EnsembleTheoryStudio() {
  const [level, setLevel] = useState<Level>("basic");
  const [openLesson, setOpenLesson] = useState("foundation");
  const [showMisconceptions, setShowMisconceptions] = useState(true);

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Guided Learning
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Ensemble Learning Theory &amp; Intuition
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Learn the intuition, mathematics, applications, and limitations
          of Ensemble Learning. Explore each concept at your preferred
          difficulty level, with practical examples and clear explanations.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["basic", "intermediate", "advanced"] as const).map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLevel(option)}
                aria-pressed={level === option}
                className={`rounded-xl px-5 py-3 text-sm font-semibold capitalize transition ${
                  level === option
                    ? "bg-violet-600 text-white"
                    : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-violet-500"
                }`}
              >
                {option}
              </button>
            )
          )}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          {levelDescription[level]}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
        <section className={panel}>
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-violet-300" />
            <h3 className="text-xl font-bold">Guided Lessons</h3>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Select a topic to understand its explanation, practical
            example, and key takeaway.
          </p>

          <div className="mt-6 space-y-3">
            {lessons.map((lesson, index) => {
              const expanded = openLesson === lesson.id;

              return (
                <div
                  key={lesson.id}
                  className={`overflow-hidden rounded-xl border transition ${
                    expanded
                      ? "border-violet-500/50 bg-violet-500/5"
                      : "border-slate-800 bg-slate-950/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenLesson(expanded ? "" : lesson.id)
                    }
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 font-mono text-xs font-semibold text-violet-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {lesson.title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {lesson.duration} read
                      </span>
                    </span>

                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expanded && (
                    <div className="space-y-5 border-t border-slate-800 px-5 pb-5 pt-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
                          {level} explanation
                        </p>
                        <p className="mt-3 text-sm leading-8 text-slate-200">
                          {lesson[level]}
                        </p>
                      </div>

                      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                        <div className="flex items-center gap-2 font-semibold text-sky-300">
                          <Lightbulb size={17} />
                          <span className="text-sm">
                            Practical Example
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {lesson.example}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="flex items-center gap-2 font-semibold text-emerald-300">
                          <CheckCircle2 size={17} />
                          <span className="text-sm">
                            Remember This
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {lesson.takeaway}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-5">
          <section className={panel}>
            <div className="flex items-center gap-2">
              <GraduationCap
                size={20}
                className="text-sky-300"
              />
              <h3 className="text-lg font-bold">
                Learning Roadmap
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setOpenLesson(lesson.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    openLesson === lesson.id
                      ? "border-violet-400/50 bg-violet-500/10"
                      : "border-slate-800 bg-slate-950 hover:border-slate-600"
                  }`}
                >
                  <span className="font-mono text-xs text-violet-300">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-xs text-slate-300">
                    {lesson.title}
                  </span>
                  <ChevronRight
                    size={15}
                    className="text-slate-500"
                  />
                </button>
              ))}
            </div>
          </section>

          <section className={panel}>
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={20}
                className="text-emerald-300"
              />
              <h3 className="text-lg font-bold">
                Real-World Applications
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {applications.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="text-sm font-semibold">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className={panel}>
        <button
          type="button"
          onClick={() =>
            setShowMisconceptions((current) => !current)
          }
          aria-expanded={showMisconceptions}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-2">
            <CircleHelp
              size={20}
              className="text-amber-300"
            />
            <h3 className="text-xl font-bold">
              Common Misconceptions
            </h3>
          </div>
          <ChevronDown
            size={19}
            className={`transition-transform ${
              showMisconceptions ? "rotate-180" : ""
            }`}
          />
        </button>

        {showMisconceptions && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {misconceptions.map((item) => (
              <div
                key={item.myth}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5"
              >
                <div className="flex items-start gap-2">
                  <XCircle
                    size={18}
                    className="mt-1 shrink-0 text-rose-400"
                  />
                  <p className="text-sm font-semibold text-rose-200">
                    {item.myth}
                  </p>
                </div>

                <div className="mt-4 flex items-start gap-2">
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-emerald-400"
                  />
                  <p className="text-sm leading-7 text-slate-300">
                    {item.reality}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
