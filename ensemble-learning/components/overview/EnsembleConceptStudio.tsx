
"use client";

import { useMemo, useState } from "react";
import {
  BrainCircuit,
  ChevronRight,
  Info,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type LearnerId = 0 | 1 | 2;
type Point = { x: number; y: number; label: number };

const colors = ["#818cf8", "#34d399"];

const learners = [
  { name: "Learner A", color: "#a78bfa", angle: 0.38 },
  { name: "Learner B", color: "#38bdf8", angle: -0.32 },
  { name: "Learner C", color: "#fb923c", angle: 0.08 },
] as const;

function makeRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const points: Point[] = (() => {
  const random = makeRandom(2026);

  return Array.from({ length: 100 }, (_, index) => {
    const label = index % 2;

    const x = Math.max(
      -2.6,
      Math.min(2.6, (random() - 0.5) * 4.6),
    );

    const y = Math.max(
      -2.6,
      Math.min(
        2.6,
        (label ? 0.7 : -0.7) +
          (random() - 0.5) * 3.2,
      ),
    );

    return { x, y, label };
  });
})();

function predict(
  x: number,
  y: number,
  learner: LearnerId,
  diversity: number,
): number {
  const config = learners[learner];

  const score =
    y +
    x * config.angle * diversity +
    Math.sin(x * (learner + 1)) *
      0.32 *
      diversity;

  return score >= 0 ? 1 : 0;
}

function getVotes(
  x: number,
  y: number,
  diversity: number,
): number[] {
  return ([0, 1, 2] as LearnerId[]).map((index) =>
    predict(x, y, index, diversity),
  );
}

function combinedPrediction(votes: number[]): number {
  return votes.reduce((sum, value) => sum + value, 0) >= 2
    ? 1
    : 0;
}

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function EnsembleConceptStudio() {
  const [diversity, setDiversity] = useState(1);
  const [activeLearner, setActiveLearner] =
    useState<"ensemble" | LearnerId>("ensemble");
  const [selectedPoint, setSelectedPoint] = useState({
    x: 0.4,
    y: 0.2,
  });
  const [showPoints, setShowPoints] = useState(true);

  const votes = getVotes(
    selectedPoint.x,
    selectedPoint.y,
    diversity,
  );
  const finalPrediction = combinedPrediction(votes);
  const agreement = Math.max(
    votes.filter((value) => value === 0).length,
    votes.filter((value) => value === 1).length,
  ) / 3;

  const cells = useMemo(() => {
    const resolution = 36;
    const result: {
      x: number;
      y: number;
      label: number;
    }[] = [];

    for (let row = 0; row < resolution; row++) {
      for (let col = 0; col < resolution; col++) {
        const x = -3 + (col + 0.5) * (6 / resolution);
        const y = 3 - (row + 0.5) * (6 / resolution);
        const learnerVotes = getVotes(x, y, diversity);

        result.push({
          x: col * (600 / resolution),
          y: row * (420 / resolution),
          label:
            activeLearner === "ensemble"
              ? combinedPrediction(learnerVotes)
              : learnerVotes[activeLearner],
        });
      }
    }

    return result;
  }, [activeLearner, diversity]);

  const panel =
    "rounded-2xl border border-slate-800 bg-slate-900/85 p-5";

  const viewOptions: {
    label: string;
    value: "ensemble" | LearnerId;
  }[] = [
    { label: "Combined Ensemble", value: "ensemble" },
    { label: "Learner A", value: 0 },
    { label: "Learner B", value: 1 },
    { label: "Learner C", value: 2 },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={18} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            ModelMind · Interactive Learning
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Why do multiple models work better together?
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
          A single model learns one interpretation of the data.
          An ensemble combines multiple predictions. When
          individual models make different errors, combining
          them can improve stability and generalization.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs text-violet-200">
            Learn by experimenting
          </span>
          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs text-sky-200">
            Interactive 2D
          </span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200">
            Beginner friendly
          </span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={panel}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Layers3 size={20} className="text-violet-400" />
                Decision Boundary Explorer
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Choose a learner or the combined ensemble.
                Click anywhere on the chart to inspect
                predictions at that location.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDiversity(1);
                setActiveLearner("ensemble");
                setSelectedPoint({ x: 0.4, y: 0.2 });
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-violet-400"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {viewOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setActiveLearner(option.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  activeLearner === option.value
                    ? "border-violet-400 bg-violet-500/20 text-violet-200"
                    : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-[#090f1d] p-3">
            <svg
              viewBox="0 0 600 420"
              className="w-full cursor-crosshair"
              role="img"
              aria-label="Interactive example showing three classifier decision boundaries and their majority vote"
              onClick={(event) => {
                const rect =
                  event.currentTarget.getBoundingClientRect();
                const px =
                  (event.clientX - rect.left) / rect.width;
                const py =
                  (event.clientY - rect.top) / rect.height;

                setSelectedPoint({
                  x: (px - 0.5) * 6,
                  y: (0.5 - py) * 6,
                });
              }}
            >
              <rect
                width="600"
                height="420"
                fill="#0b1220"
              />

              {cells.map((cell, index) => (
                <rect
                  key={index}
                  x={cell.x}
                  y={cell.y}
                  width={600 / 36 + 0.5}
                  height={420 / 36 + 0.5}
                  fill={colors[cell.label]}
                  opacity={0.27}
                />
              ))}

              {Array.from({ length: 7 }, (_, i) => (
                <g key={i} opacity={0.3}>
                  <line
                    x1={i * 100}
                    x2={i * 100}
                    y1={0}
                    y2={420}
                    stroke="#94a3b8"
                    strokeDasharray="3 7"
                  />
                  <line
                    x1={0}
                    x2={600}
                    y1={i * 70}
                    y2={i * 70}
                    stroke="#94a3b8"
                    strokeDasharray="3 7"
                  />
                </g>
              ))}

              {showPoints &&
                points.map((point, index) => (
                  <circle
                    key={index}
                    cx={(point.x + 3) * 100}
                    cy={(3 - point.y) * 70}
                    r={3.2}
                    fill={colors[point.label]}
                    stroke="#e2e8f0"
                    strokeWidth={0.7}
                    opacity={0.9}
                  />
                ))}

              <circle
                cx={(selectedPoint.x + 3) * 100}
                cy={(3 - selectedPoint.y) * 70}
                r={12}
                fill="none"
                stroke="#fff"
                strokeWidth={2}
              />
              <circle
                cx={(selectedPoint.x + 3) * 100}
                cy={(3 - selectedPoint.y) * 70}
                r={4}
                fill="#fff"
              />
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-indigo-400" />
              Class 0
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              Class 1
            </span>
            <label className="ml-auto flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPoints}
                onChange={(event) =>
                  setShowPoints(event.target.checked)
                }
                className="accent-violet-500"
              />
              Show data points
            </label>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-slate-500">
            <Info size={15} className="mt-1 shrink-0" />
            This is an illustrative mathematical example
            of three classifiers and majority voting.
            It is not a fitted scikit-learn model or a
            measured accuracy result.
          </p>
        </section>

        <div className="space-y-5">
          <section className={panel}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <SlidersHorizontal
                size={19}
                className="text-sky-400"
              />
              Model Diversity
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Change how different the three example
              learners are from one another.
            </p>

            <div className="mt-6 flex items-center justify-between text-sm">
              <span>Diversity</span>
              <span className="font-mono text-violet-300">
                {diversity.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={diversity}
              onChange={(event) =>
                setDiversity(Number(event.target.value))
              }
              className="mt-3 w-full accent-violet-500"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Similar</span>
              <span>Different</span>
            </div>

            <p className="mt-5 text-xs leading-6 text-slate-400">
              Notice how the individual boundaries
              change, and how their combined majority
              prediction responds.
            </p>
          </section>

          <section className={panel}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <BrainCircuit
                size={19}
                className="text-emerald-400"
              />
              Prediction Inspector
            </h3>

            <div className="mt-4 space-y-3">
              {learners.map((learner, index) => (
                <div
                  key={learner.name}
                  className="flex items-center justify-between rounded-xl bg-slate-950 p-3"
                >
                  <span className="text-sm text-slate-300">
                    {learner.name}
                  </span>
                  <span
                    className="rounded-lg px-3 py-1.5 text-xs font-bold"
                    style={{
                      backgroundColor:
                        `${colors[votes[index]]}22`,
                      color: colors[votes[index]],
                    }}
                  >
                    Class {votes[index]}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-4 flex justify-center">
              <ChevronRight
                size={22}
                className="rotate-90 text-slate-500"
              />
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-emerald-300">
                Combined prediction
              </p>
              <p className="mt-2 text-3xl font-bold">
                Class {finalPrediction}
              </p>
              <p className="mt-2 text-xs text-slate-300">
                {pct(agreement)} learner agreement
              </p>
            </div>
          </section>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Individual predictions",
            description:
              "Each learner has its own decision boundary and may predict a different class.",
          },
          {
            title: "Combining predictions",
            description:
              "This example uses majority voting: at least two of three learners determine the class.",
          },
          {
            title: "Diversity matters",
            description:
              "Useful diversity can help when errors differ, although combining models does not always improve accuracy.",
          },
        ].map((item, index) => (
          <div key={item.title} className={panel}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
              0{index + 1}
            </div>
            <h3 className="mt-4 font-bold">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
