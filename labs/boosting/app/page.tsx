
import {
  ArrowDown,
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  Layers3,
  Sparkles,
} from "lucide-react";

import BoostingTrainingStudio from "@/components/boosting/BoostingTrainingStudio";
import BoostingTheoryStudio from "@/components/boosting/BoostingTheoryStudio";

const navigation = [
  { href: "#training-studio", label: "Experiment Lab" },
  { href: "#theory-studio", label: "Learn Boosting" },
  { href: "#algorithm-comparison", label: "Algorithms" },
  { href: "#concept-simulator", label: "Simulator" },
  { href: "#parameter-guide", label: "Parameters" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080d19] text-white">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080d19]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-4 py-4 md:px-8">
          <a
            href="#top"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <BrainCircuit size={23} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">
                ModelMind
              </p>
              <p className="text-[10px] uppercase tracking-widest text-violet-300">
                Boosting Laboratory
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-5 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs font-medium text-slate-300 transition hover:text-violet-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="#training-studio"
            className="rounded-xl bg-violet-600 px-4 py-3 text-xs font-bold hover:bg-violet-500"
          >
            Start Lab
          </a>
        </div>

        <nav className="flex gap-5 overflow-x-auto border-t border-slate-800 px-4 py-3 lg:hidden">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 text-xs font-semibold text-slate-300"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <div id="top">
        <section className="relative overflow-hidden border-b border-slate-800/70">
          <div className="pointer-events-none absolute left-[-130px] top-[-120px] h-96 w-96 rounded-full bg-violet-600/15 blur-[110px]" />
          <div className="pointer-events-none absolute right-[-110px] top-[-50px] h-96 w-96 rounded-full bg-sky-500/10 blur-[110px]" />

          <div className="relative mx-auto max-w-[1500px] px-4 py-16 md:px-8 md:py-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300">
              <Sparkles size={15} />
              Interactive Machine Learning Education
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Learn Boosting.
              <span className="block bg-gradient-to-r from-violet-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                See Every Learner Improve.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Train real AdaBoost and Gradient Boosting
              models, explore interactive decision
              boundaries and 3D prediction surfaces,
              replay their training stages, and understand
              every important concept behind the results.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#training-studio"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-4 text-sm font-bold hover:bg-violet-500"
              >
                <ChartNoAxesCombined size={18} />
                Launch Experiment
              </a>
              <a
                href="#theory-studio"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-bold text-slate-200 hover:border-violet-500"
              >
                <BookOpen size={18} />
                Learn Concepts
              </a>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: <Layers3 size={20} />,
                  label: "3 real ML models",
                  detail: "Tree, AdaBoost, Gradient Boosting",
                },
                {
                  icon: <ChartNoAxesCombined size={20} />,
                  label: "Interactive 2D + 3D",
                  detail: "Actual trained prediction surfaces",
                },
                {
                  icon: <ArrowDown size={20} />,
                  label: "Sequential playback",
                  detail: "Explore actual fitted checkpoints",
                },
                {
                  icon: <BookOpen size={20} />,
                  label: "Complete teaching",
                  detail: "Basic through advanced levels",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-800 bg-[#111c30]/90 p-5"
                >
                  <div className="text-violet-300">
                    {item.icon}
                  </div>
                  <h3 className="mt-3 text-sm font-bold">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section
        id="training-studio"
        className="scroll-mt-32 py-14"
      >
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <BoostingTrainingStudio />
        </div>
      </section>

      <section
        id="theory-studio"
        className="scroll-mt-32 border-t border-slate-800 bg-[#0a1120] py-16"
      >
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <BoostingTheoryStudio />
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-[#080d19]">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 px-4 py-8 md:flex-row md:items-center md:px-8">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={19}
                className="text-violet-300"
              />
              <strong>ModelMind</strong>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Boosting Learning Laboratory · Interactive ML Education
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-slate-400">
            <a
              href="#training-studio"
              className="hover:text-white"
            >
              Experiments
            </a>
            <a
              href="#theory-studio"
              className="hover:text-white"
            >
              Learning
            </a>
            <a
              href="#faq"
              className="hover:text-white"
            >
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
