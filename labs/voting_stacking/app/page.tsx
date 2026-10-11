
import VotingStackingTrainingStudio from "@/components/voting_stacking/VotingStackingTrainingStudio";
import { ArrowDown, BrainCircuit, GitMerge, Layers3 } from "lucide-react";
import VotingStackingTheoryStudio from "@/components/voting_stacking/VotingStackingTheoryStudio";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080e1c]/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <a href="#" className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-600 p-2">
              <BrainCircuit size={23} />
            </span>

            <span className="text-lg font-bold tracking-tight">
              ModelMind
            </span>
          </a>

          <a
            href="#lab"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
          >
            Open Lab
          </a>
        </nav>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 lg:px-10">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold tracking-wider text-violet-300">
            <GitMerge size={15} />
            INTERACTIVE ENSEMBLE LEARNING
          </div>

          <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Understand{" "}
            <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
              Voting & Stacking
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Explore how different machine learning models
            combine predictions using hard voting, soft
            voting, weighted averaging, and stacking.
            Train real models, analyze their decisions,
            and visualize ensemble predictions in 2D and 3D.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#lab"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold transition hover:bg-violet-500"
            >
              <ArrowDown size={18} />
              Start Experimenting
            </a>

            <a
              href="#about"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-200 hover:border-violet-500"
            >
              <Layers3 size={18} />
              Explore Concepts
            </a>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Hard & Soft Voting",
                detail: "Combine class labels or predicted probabilities.",
              },
              {
                title: "Stacking",
                detail: "Train a meta-learner using base-model predictions.",
              },
              {
                title: "Real Visualizations",
                detail: "Explore fitted models and decision surfaces.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-[#111a2c]/75 p-5 text-left"
              >
                <h3 className="font-bold text-violet-200">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="lab"
        className="mx-auto max-w-[1600px] scroll-mt-20 px-4 py-12 md:px-6 lg:px-10"
      >
        <VotingStackingTrainingStudio />
      </section>
      <section
  id="theory"
  className="mx-auto max-w-[1600px] scroll-mt-20 px-4 pb-12 md:px-6 lg:px-10"
>
  <VotingStackingTheoryStudio />
</section>

      <section
        id="about"
        className="mx-auto max-w-[1600px] px-5 pb-16 lg:px-10"
      >
        <div className="rounded-3xl border border-slate-800 bg-[#0e1729] p-7 md:p-10">
          <h2 className="text-2xl font-bold">
            How Voting and Stacking Differ
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6">
              <h3 className="text-xl font-bold text-sky-300">
                Voting
              </h3>

              <p className="mt-3 text-sm leading-8 text-slate-300">
                Voting combines predictions from several
                fitted models. Hard voting counts predicted
                labels, while soft voting averages class
                probabilities. For regression, weighted
                voting averages numerical predictions.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
              <h3 className="text-xl font-bold text-violet-300">
                Stacking
              </h3>

              <p className="mt-3 text-sm leading-8 text-slate-300">
                Stacking trains another machine learning
                model called a meta-learner. It learns how
                to combine predictions from several base
                models, rather than relying on fixed voting
                weights. Cross-validated predictions are
                used during meta-learner training.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-7 text-center text-xs text-slate-500">
        ModelMind · Voting & Stacking Interactive Lab
      </footer>
    </main>
  );
}
