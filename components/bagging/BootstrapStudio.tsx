
"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  Dices,
  Layers3,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const N = 20;

function randomGenerator(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeBootstrap(seed: number, count: number) {
  const random = randomGenerator(seed);

  return Array.from(
    { length: count },
    () => Math.floor(random() * N),
  );
}

export default function BootstrapStudio() {
  const [seed, setSeed] = useState(42);
  const [fraction, setFraction] = useState(1);
  const [visibleDraws, setVisibleDraws] = useState(N);
  const [selectedRow, setSelectedRow] = useState<number | null>(
    null,
  );

  const drawCount = Math.round(N * fraction);

  const samples = useMemo(
    () => makeBootstrap(seed, drawCount),
    [seed, drawCount],
  );

  const counts = useMemo(() => {
    const values = Array<number>(N).fill(0);

    samples.forEach((index) => {
      values[index]++;
    });

    return values;
  }, [samples]);

  const visibleCounts = useMemo(() => {
    const values = Array<number>(N).fill(0);

    samples.slice(0, visibleDraws).forEach((index) => {
      values[index]++;
    });

    return values;
  }, [samples, visibleDraws]);

  const uniqueCount = counts.filter((count) => count > 0).length;
  const oobCount = N - uniqueCount;
  const duplicateCount = drawCount - uniqueCount;

  const card =
    "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";

  function regenerate() {
    setSeed((previous) => previous + 1);
    setVisibleDraws(0);
    setSelectedRow(null);
  }

  function reset() {
    setSeed(42);
    setFraction(1);
    setVisibleDraws(N);
    setSelectedRow(null);
  }

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/20 via-slate-900 to-slate-950 p-7 md:p-10">
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind • Bagging Foundations
          </span>
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
          Bootstrap Sampling
          <span className="block text-violet-300">
            Interactive Studio
          </span>
        </h1>

        <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
          Bagging stands for Bootstrap Aggregating. It creates
          different training samples by selecting observations
          randomly with replacement. Explore which rows get
          repeated, which rows are left out, and how one
          bootstrap dataset is formed.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "Real sampling with replacement",
            "Interactive visualization",
            "Out-of-bag analysis",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-xs text-violet-200"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className={`${card} h-fit space-y-6`}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="text-violet-400"
              size={20}
            />
            <h2 className="text-lg font-bold">
              Sampling Controls
            </h2>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Sample fraction</span>
              <strong className="text-violet-300">
                {(fraction * 100).toFixed(0)}%
              </strong>
            </div>

            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={fraction}
              onChange={(event) => {
                setFraction(Number(event.target.value));
                setVisibleDraws(0);
              }}
              className="mt-4 w-full accent-violet-500"
            />

            <p className="mt-2 text-xs leading-6 text-slate-400">
              Controls how many times we draw from the
              original dataset.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Draws revealed</span>
              <strong className="text-sky-300">
                {visibleDraws} / {drawCount}
              </strong>
            </div>

            <input
              type="range"
              min="0"
              max={drawCount}
              step="1"
              value={Math.min(visibleDraws, drawCount)}
              onChange={(event) =>
                setVisibleDraws(Number(event.target.value))
              }
              className="mt-4 w-full accent-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setVisibleDraws((previous) =>
                  Math.min(drawCount, previous + 1),
                )
              }
              disabled={visibleDraws >= drawCount}
              className="rounded-xl bg-violet-600 px-3 py-3 text-xs font-bold hover:bg-violet-500 disabled:opacity-40"
            >
              Next Draw
            </button>

            <button
              type="button"
              onClick={() => setVisibleDraws(drawCount)}
              className="rounded-xl border border-slate-700 px-3 py-3 text-xs font-semibold hover:border-violet-400"
            >
              Reveal All
            </button>

            <button
              type="button"
              onClick={regenerate}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-3 text-xs hover:border-violet-400"
            >
              <Dices size={15} />
              Resample
            </button>

            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-3 text-xs hover:border-violet-400"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 text-xs leading-7 text-slate-400">
            <strong className="text-slate-200">
              How it works
            </strong>

            <p className="mt-2">
              Each draw independently selects one of the
              original 20 observations. Because selected rows
              remain available, the same observation can
              appear multiple times.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: "Original Rows",
                value: N,
                color: "text-sky-300",
              },
              {
                label: "Bootstrap Draws",
                value: drawCount,
                color: "text-violet-300",
              },
              {
                label: "Unique Rows",
                value: uniqueCount,
                color: "text-emerald-300",
              },
              {
                label: "OOB Rows",
                value: oobCount,
                color: "text-amber-300",
              },
            ].map((stat) => (
              <div key={stat.label} className={card}>
                <p className="text-xs text-slate-400">
                  {stat.label}
                </p>
                <p
                  className={`mt-3 text-3xl font-bold ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <section className={card}>
            <div className="flex items-center gap-2">
              <Database size={20} className="text-sky-400" />
              <h2 className="text-xl font-bold">
                Original Dataset
              </h2>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              All 20 original observations are eligible
              for every draw. Click a row to inspect how
              frequently it was selected.
            </p>

            <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {counts.map((count, index) => {
                const selected = selectedRow === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedRow(index)}
                    className={`rounded-xl border p-3 text-center transition ${
                      selected
                        ? "border-violet-400 bg-violet-500/20"
                        : count === 0
                          ? "border-amber-500/30 bg-amber-500/10"
                          : "border-sky-500/20 bg-sky-500/10 hover:border-sky-400"
                    }`}
                  >
                    <span className="block text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {count}×
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedRow !== null && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm">
                Row {selectedRow + 1} was selected{" "}
                <strong className="text-violet-300">
                  {counts[selectedRow]} time(s)
                </strong>
                {" "}in the complete bootstrap sample.
                {counts[selectedRow] === 0 && (
                  <span className="mt-2 block text-amber-300">
                    This row is out-of-bag.
                  </span>
                )}
              </div>
            )}
          </section>

          <section className={card}>
            <div className="flex items-center gap-2">
              <Shuffle size={20} className="text-violet-400" />
              <h2 className="text-xl font-bold">
                Bootstrap Draw Sequence
              </h2>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Reveal the selected observations one by one.
              Repeated numbers are valid because sampling
              happens with replacement.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {samples
                .slice(0, visibleDraws)
                .map((index, position) => (
                  <span
                    key={position}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 font-mono text-xs font-bold text-violet-200"
                    title={`Draw ${position + 1}: Row ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                ))}

              {visibleDraws === 0 && (
                <p className="py-6 text-sm text-slate-500">
                  Click Next Draw to begin sampling.
                </p>
              )}
            </div>
          </section>

          <section className={card}>
            <div className="flex items-center gap-2">
              <Layers3 size={20} className="text-emerald-400" />
              <h2 className="text-xl font-bold">
                Sampling Frequency
              </h2>
            </div>

            <p className="mt-3 text-sm text-slate-400">
              Number of appearances of each observation
              in the currently revealed draws.
            </p>

            <div className="mt-6 flex h-52 items-end gap-1 rounded-xl border border-slate-800 bg-slate-950 p-4">
              {visibleCounts.map((count, index) => (
                <div
                  key={index}
                  className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                  title={`Row ${index + 1}: ${count} draws revealed`}
                >
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-sky-400 transition-all"
                    style={{
                      height:
                        count === 0
                          ? "2px"
                          : `${Math.max(
                              5,
                              (count /
                                Math.max(1, ...visibleCounts)) *
                                100,
                            )}%`,
                    }}
                  />
                  <span className="text-center text-[9px] text-slate-500">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className={card}>
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-violet-300" />
          <h2 className="text-xl font-bold">
            Understand Out-of-Bag Samples
          </h2>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Selected Observations",
              description:
                `${uniqueCount} different original rows appear in the complete bootstrap sample.`,
            },
            {
              title: "Repeated Selections",
              description:
                `${duplicateCount} draws are additional occurrences of rows already selected.`,
            },
            {
              title: "Out-of-Bag Observations",
              description:
                `${oobCount} original rows were never selected. These can be used for out-of-bag evaluation of the learner trained on this sample.`,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-950 p-5"
            >
              <CheckCircle2
                size={20}
                className="text-emerald-400"
              />
              <h3 className="mt-4 font-semibold">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-500">
          This studio visualizes a reproducible random
          sampling process. It does not yet train a model.
          The approximate 63.2% unique-row rule applies
          when drawing N times from N observations as N
          becomes large; individual samples can differ.
        </p>
      </section>

      <div className="flex items-center justify-center gap-3 pb-5 text-xs text-slate-500">
        Original Dataset
        <ArrowRight size={15} />
        Bootstrap Sample
        <ArrowRight size={15} />
        Train Base Learner
      </div>
    </div>
  );
}
