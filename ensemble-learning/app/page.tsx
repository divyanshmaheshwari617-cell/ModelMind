
"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  Layers3,
  Lightbulb,
  Network,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import EnsembleConceptStudio from "@/components/overview/EnsembleConceptStudio";
import EnsembleComparisonStudio from "@/components/overview/EnsembleComparisonStudio";
import EnsembleBiasVarianceStudio from "@/components/overview/EnsembleBiasVarianceStudio";
import EnsembleTheoryStudio from "@/components/overview/EnsembleTheoryStudio";
import EnsembleLearningJourney from "@/components/overview/EnsembleLearningJourney";
import EnsembleNavigation from "@/components/overview/EnsembleNavigation";

type LearningLevel = "basic" | "intermediate" | "advanced";

const topics = [
  {
    number: "01",
    title: "What Is Ensemble Learning?",
    description:
      "Understand why combining multiple models can produce better predictions than relying on a single model.",
    icon: BrainCircuit,
  },
  {
    number: "02",
    title: "How Models Work Together",
    description:
      "Explore individual predictions, model agreement, and the final combined prediction.",
    icon: Network,
  },
  {
    number: "03",
    title: "Model Diversity",
    description:
      "Discover why different mistakes and complementary learners can make an ensemble useful.",
    icon: Layers3,
  },
  {
    number: "04",
    title: "Bias and Variance",
    description:
      "Learn the difference between systematic prediction errors and sensitivity to training data.",
    icon: TrendingUp,
  },
];

const explanations: Record<
  LearningLevel,
  {
    title: string;
    description: string;
    example: string;
    takeaway: string;
  }
> = {
  basic: {
    title: "Think of an ensemble as a team",
    description:
      "Imagine asking three students to solve the same problem. One student may make a mistake, but the others may get the correct answer. Combining their opinions can sometimes give a more reliable result.",
    example:
      "Model A predicts Class 1, Model B predicts Class 1, and Model C predicts Class 0. If we use majority voting, the combined prediction is Class 1.",
    takeaway:
      "An ensemble uses several models instead of depending entirely on one.",
  },
  intermediate: {
    title: "Combining different prediction functions",
    description:
      "An ensemble combines predictions from multiple fitted models. Averaging can reduce variance when prediction errors are not perfectly correlated. Voting can combine classification decisions.",
    example:
      "Three regression models predict 72, 78, and 75. Their simple average is 75. This combined estimate may be more stable, although it is not guaranteed to be more accurate.",
    takeaway:
      "Diversity between useful learners can make aggregation more effective.",
  },
  advanced: {
    title: "Ensembles, error correlation, and generalization",
    description:
      "For an average of n estimators with equal error variance σ² and pairwise error correlation ρ, the variance of the averaged error is σ²[ρ + (1−ρ)/n]. This simplified result shows why adding learners helps less when their errors are highly correlated.",
    example:
      "If learner errors are perfectly correlated, averaging does not reduce their variance. If errors are uncorrelated, averaging n learners reduces the variance to σ²/n, under the equal-variance assumptions.",
    takeaway:
      "The benefit depends on individual learner quality, error dependence, and the way predictions are combined.",
  },
};

const futureLabs = [
  {
    title: "Bagging",
    subtitle: "Parallel learners",
    description:
      "Bootstrap sampling, independent learners, variance reduction, and Random Forest intuition.",
    icon: GitBranch,
    accent: "text-sky-300",
  },
  {
    title: "Voting & Stacking",
    subtitle: "Prediction combination",
    description:
      "Hard voting, soft voting, model agreement, meta-learning, and out-of-fold predictions.",
    icon: Network,
    accent: "text-violet-300",
  },
  {
    title: "Boosting Foundations",
    subtitle: "Sequential improvement",
    description:
      "Weak learners, correcting mistakes, loss reduction, learning rate, and boosting intuition.",
    icon: TrendingUp,
    accent: "text-emerald-300",
  },
];

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6";

export default function Home() {
  const [level, setLevel] = useState<LearningLevel>("basic");
  const [showFormula, setShowFormula] = useState(false);

  const content = explanations[level];

  return (
    <main className="min-h-screen bg-[#080d19] text-slate-100">
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/15 p-3">
              <BrainCircuit
                size={28}
                className="text-violet-300"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                ModelMind
              </p>
              <p className="mt-1 text-lg font-semibold">
                Interactive ML Laboratory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Ensemble Learning Overview
          </div>
        </header>
        <EnsembleNavigation />

        <section className="relative mt-8 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-[#21143c] via-[#11182c] to-[#08101e] px-6 py-10 md:px-10 md:py-14">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-200">
              <Sparkles size={15} />
              Learn • Visualize • Understand
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Ensemble
              <span className="block bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                Learning Lab
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              One model gives one prediction. An ensemble
              combines multiple models to potentially produce
              a more reliable result. Discover how it works
              through interactive examples, visual explanations,
              and guided experiments.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#explore"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Explore Visualizations
                <ArrowRight size={17} />
              </a>

              <a
                href="#learn"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-violet-400"
              >
                <BookOpen size={17} />
                Learn the Concept
              </a>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topics.map((topic) => {
            const Icon = topic.icon;

            return (
              <article
                key={topic.number}
                className={`${panel} transition hover:border-violet-500/40`}
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-violet-500/10 p-3">
                    <Icon size={21} className="text-violet-300" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {topic.number}
                  </span>
                </div>

                <h2 className="mt-5 text-lg font-bold">
                  {topic.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {topic.description}
                </p>
              </article>
            );
          })}
        </section>
        {/* GUIDED ENSEMBLE LEARNING JOURNEY */}
<section id="journey" className="mt-12 scroll-mt-8">
  <EnsembleLearningJourney />
</section>

        <section id="learn" className="mt-10 scroll-mt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-300">
                Learning Studio
              </p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Understand at Your Level
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Switch between simple explanations and deeper theory.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1.5">
              {(["basic", "intermediate", "advanced"] as const).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLevel(item)}
                    className={`rounded-lg px-4 py-2.5 text-xs font-semibold capitalize transition ${
                      level === item
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className={`${panel} grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,1fr)]`}>
            <div>
              <div className="flex items-center gap-2 text-emerald-300">
                <Lightbulb size={21} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {level} explanation
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                {content.title}
              </h3>

              <p className="mt-5 text-sm leading-8 text-slate-300">
                {content.description}
              </p>

              <div className="mt-6 rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
                <p className="text-sm font-bold text-sky-300">
                  Example
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {content.example}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={18} />
                  <h3 className="font-bold">Key Takeaway</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {content.takeaway}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFormula((current) => !current)}
                aria-expanded={showFormula}
                className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-4 text-left text-sm font-semibold hover:border-violet-500"
              >
                Explore the Mathematics
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    showFormula ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFormula && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-xs text-violet-300">
                    Simple regression averaging
                  </p>

                  <p className="mt-3 overflow-x-auto font-mono text-base text-white">
                    Prediction = (f₁(x) + ... + fₙ(x)) / n
                  </p>

                  <p className="mt-4 text-xs leading-7 text-slate-400">
                    Here, each f represents one model.
                    This is one way to combine numeric
                    predictions; not all ensembles use
                    simple averaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="explore" className="mt-10 scroll-mt-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
              Interactive Experiment
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              See the Power of Combining Models
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Change the diversity slider, compare learners,
              and click a point to see how individual predictions
              combine. This is a conceptual experiment rather
              than fitted ML training.
            </p>
          </div>

          <EnsembleConceptStudio />
          {/* REAL SINGLE MODEL VS ENSEMBLE COMPARISON */}
<section
  id="compare"
  className="mt-12 scroll-mt-8"
>
  <EnsembleComparisonStudio />
</section>
{/* BIAS VARIANCE AND DIVERSITY STUDIO */}
<section id="bias-variance" className="mt-12 scroll-mt-8">
  <EnsembleBiasVarianceStudio />
  {/* ENSEMBLE THEORY, INTUITION AND QUIZ */}
<section id="theory" className="mt-12 scroll-mt-8">
  <EnsembleTheoryStudio />
</section>
</section>

        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <div className={panel}>
            <div className="flex items-center gap-2 text-sky-300">
              <Target size={21} />
              <h2 className="text-xl font-bold">
                Why Ensemble Learning Helps
              </h2>
            </div>

            <p className="mt-5 text-sm leading-8 text-slate-300">
              A single model may be unstable or miss important
              patterns. Combining useful learners can reduce
              variance, improve robustness, or learn richer
              relationships, depending on the ensemble method.
            </p>

            <div className="mt-5 rounded-xl bg-slate-950 p-4">
              <p className="text-sm font-semibold text-emerald-300">
                The important idea
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                More models do not automatically mean
                better accuracy. Their quality, diversity,
                and combination method matter.
              </p>
            </div>
          </div>

          <div className={panel}>
            <div className="flex items-center gap-2 text-violet-300">
              <ChartNoAxesCombined size={21} />
              <h2 className="text-xl font-bold">
                Bias vs Variance
              </h2>
            </div>

            <p className="mt-5 text-sm leading-8 text-slate-300">
              Bias describes systematic prediction error
              caused by limited assumptions. Variance
              describes sensitivity to the training data.
              Some ensemble methods primarily reduce variance;
              others can reduce bias by adding corrective
              learners.
            </p>

            <div className="mt-5 rounded-xl bg-slate-950 p-4">
              <p className="text-sm font-semibold text-violet-300">
                Remember
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Understanding bias and variance helps
                explain why different ensemble methods
                behave differently.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Continue Your Learning
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              Explore Dedicated Ensemble Labs
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              These will be separate ModelMind labs.
              We'll connect them here once each is developed.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {futureLabs.map((lab) => {
              const Icon = lab.icon;

              return (
                <article
                  key={lab.title}
                  className={`${panel} flex flex-col`}
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-slate-950 p-3">
                      <Icon size={23} className={lab.accent} />
                    </div>

                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                      Separate Lab
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {lab.title}
                  </h3>

                  <p className={`mt-2 text-xs font-semibold ${lab.accent}`}>
                    {lab.subtitle}
                  </p>

                  <p className="mt-4 flex-1 text-sm leading-7 text-slate-400">
                    {lab.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500">
                    <BookOpen size={15} />
                    Link will be added later
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-800 py-7 text-center text-xs text-slate-500">
          ModelMind · Learn Machine Learning Through Understanding
        </footer>
      </div>
    </main>
  );
}
