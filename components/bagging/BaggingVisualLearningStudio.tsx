
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  Database,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Trees,
} from "lucide-react";

type Point = {
  x: number;
  y: number;
  id: number;
};

type Tree = {
  predict: (x: number) => number;
  sample: Point[];
};

const chartBox =
  "rounded-2xl border border-slate-800 bg-[#0c1427] p-4 md:p-6";

const W = 760;
const H = 300;
const LEFT = 45;
const RIGHT = 20;
const TOP = 20;
const BOTTOM = 38;

function randomGenerator(seed: number) {
  let value = seed >>> 0;

  return () => {
    value =
      (Math.imul(value, 1664525) + 1013904223) >>> 0;

    return value / 4294967296;
  };
}

function trueFunction(x: number) {
  return (
    0.5 +
    0.23 * Math.sin(2 * Math.PI * x) +
    0.11 * Math.sin(5 * Math.PI * x)
  );
}

function makeDataset(seed: number, noise: number) {
  const random = randomGenerator(seed);

  return Array.from({ length: 45 }, (_, id) => {
    const x = (id + 0.5) / 45;

    return {
      id,
      x,
      y: trueFunction(x) + (random() - 0.5) * 2 * noise,
    };
  });
}

/*
 * Small educational CART-style regression tree.
 * Each split minimizes the sum of squared errors.
 */
function trainTree(
  points: Point[],
  maxDepth: number,
): (x: number) => number {
  const mean =
    points.reduce((sum, p) => sum + p.y, 0) /
    Math.max(points.length, 1);

  if (maxDepth <= 0 || points.length < 4) {
    return () => mean;
  }

  const sorted = [...points].sort((a, b) => a.x - b.x);

  let bestLoss = Infinity;
  let bestSplit = -1;

  for (let i = 2; i <= sorted.length - 2; i++) {
    if (sorted[i - 1].x === sorted[i].x) continue;

    const left = sorted.slice(0, i);
    const right = sorted.slice(i);

    const leftMean =
      left.reduce((sum, p) => sum + p.y, 0) /
      left.length;

    const rightMean =
      right.reduce((sum, p) => sum + p.y, 0) /
      right.length;

    const loss =
      left.reduce(
        (sum, p) => sum + (p.y - leftMean) ** 2,
        0,
      ) +
      right.reduce(
        (sum, p) => sum + (p.y - rightMean) ** 2,
        0,
      );

    if (loss < bestLoss) {
      bestLoss = loss;
      bestSplit = i;
    }
  }

  if (bestSplit === -1) return () => mean;

  const threshold =
    (sorted[bestSplit - 1].x + sorted[bestSplit].x) / 2;

  const leftPredict = trainTree(
    sorted.slice(0, bestSplit),
    maxDepth - 1,
  );

  const rightPredict = trainTree(
    sorted.slice(bestSplit),
    maxDepth - 1,
  );

  return (x: number) =>
    x <= threshold
      ? leftPredict(x)
      : rightPredict(x);
}

function buildTrees(
  data: Point[],
  count: number,
  depth: number,
  seed: number,
): Tree[] {
  return Array.from({ length: count }, (_, index) => {
    const random = randomGenerator(
      seed * 101 + index * 7919 + 17,
    );

    const sample = Array.from(
      { length: data.length },
      () => data[Math.floor(random() * data.length)],
    );

    return {
      sample,
      predict: trainTree(sample, depth),
    };
  });
}

function xPos(x: number) {
  return LEFT + x * (W - LEFT - RIGHT);
}

function yPos(y: number) {
  return (
    H -
    BOTTOM -
    ((y + 0.2) / 1.4) * (H - TOP - BOTTOM)
  );
}

function curvePath(
  values: number[],
  xs: number[],
) {
  return values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"}${xPos(xs[index]).toFixed(2)},${yPos(value).toFixed(2)}`,
    )
    .join(" ");
}

function Axes() {
  return (
    <g>
      {[0, 0.25, 0.5, 0.75, 1].map((x) => (
        <g key={x}>
          <line
            x1={xPos(x)}
            x2={xPos(x)}
            y1={TOP}
            y2={H - BOTTOM}
            stroke="#25334c"
            strokeDasharray="4 6"
          />
          <text
            x={xPos(x)}
            y={H - 12}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
          >
            {x}
          </text>
        </g>
      ))}

      {[0, 0.25, 0.5, 0.75, 1].map((y) => (
        <g key={y}>
          <line
            x1={LEFT}
            x2={W - RIGHT}
            y1={yPos(y)}
            y2={yPos(y)}
            stroke="#25334c"
            strokeDasharray="4 6"
          />
          <text
            x={LEFT - 8}
            y={yPos(y) + 4}
            textAnchor="end"
            fill="#94a3b8"
            fontSize="11"
          >
            {y.toFixed(2)}
          </text>
        </g>
      ))}
    </g>
  );
}

function LineLegend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 text-xs text-slate-300">
      <span
        className="h-1 w-5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export default function BaggingVisualLearningStudio() {
  const [treeCount, setTreeCount] = useState(20);
  const [depth, setDepth] = useState(4);
  const [noise, setNoise] = useState(0.12);
  const [seed, setSeed] = useState(42);

  const [step, setStep] = useState(1);
  const [selectedTree, setSelectedTree] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showAllTrees, setShowAllTrees] = useState(true);

  const dataset = useMemo(
    () => makeDataset(seed, noise),
    [seed, noise],
  );

  const trees = useMemo(
    () => buildTrees(dataset, treeCount, depth, seed),
    [dataset, treeCount, depth, seed],
  );

  const activeStep = Math.max(1, Math.min(step, trees.length));
  const activeTreeIndex = Math.max(
    0,
    Math.min(selectedTree, activeStep - 1),
  );

  useEffect(() => {
    if (!playing) return;

    const interval = window.setInterval(() => {
      setStep((current) => {
        if (current >= treeCount) {
          setPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 650);

    return () => window.clearInterval(interval);
  }, [playing, treeCount]);

  const xs = useMemo(
    () => Array.from({ length: 151 }, (_, i) => i / 150),
    [],
  );

  const computations = useMemo(() => {
    const actual = xs.map(trueFunction);

    const predictions = trees.map((tree) =>
      xs.map(tree.predict),
    );

    const cumulative: number[][] = [];
    const errors: number[] = [];

    const sums = Array<number>(xs.length).fill(0);

    for (let i = 0; i < predictions.length; i++) {
      for (let j = 0; j < xs.length; j++) {
        sums[j] += predictions[i][j];
      }

      const mean = sums.map((value) => value / (i + 1));
      cumulative.push(mean);

      errors.push(
        mean.reduce(
          (sum, value, index) =>
            sum + Math.abs(value - actual[index]),
          0,
        ) / xs.length,
      );
    }

    return {
      actual,
      predictions,
      cumulative,
      errors,
    };
  }, [trees, xs]);

  const ensemble =
    computations.cumulative[activeStep - 1] ?? [];

  const individual =
    computations.predictions[activeTreeIndex] ?? [];

  const currentTree = trees[activeTreeIndex];

  const frequencies = useMemo(() => {
    const counts = Array<number>(dataset.length).fill(0);

    for (const point of currentTree.sample) {
      counts[point.id]++;
    }

    return counts;
  }, [currentTree, dataset.length]);

  const uniqueCount = frequencies.filter(
    (count) => count > 0,
  ).length;

  const oobCount = frequencies.filter(
    (count) => count === 0,
  ).length;

  const observedCount =
    currentTree.sample.length - uniqueCount;

  const currentError =
    computations.errors[activeStep - 1] ?? 0;

  const firstError = computations.errors[0] ?? 0;

  function restart() {
    setPlaying(false);
    setStep(1);
    setSelectedTree(0);
  }

  function changeConfiguration() {
    setPlaying(false);
    setStep(1);
    setSelectedTree(0);
  }

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/20 via-[#10182c] to-[#080d19] p-6 md:p-9">
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={20} />
          <span className="text-xs font-semibold uppercase tracking-widest">
            ModelMind · Visual Learning Lab
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Understand Bagging Visually
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Explore the complete journey from training data
          to bootstrap samples, individual decision trees,
          and the final averaged prediction. Every graph
          updates from the same experiment.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        <div className={`${chartBox} lg:col-span-1`}>
          <h3 className="flex items-center gap-2 font-bold">
            <Trees size={19} className="text-violet-300" />
            Experiment Controls
          </h3>

          <div className="mt-6 space-y-6">
            {[
              {
                label: "Number of Trees",
                value: treeCount,
                min: 2,
                max: 60,
                step: 1,
                update: setTreeCount,
              },
              {
                label: "Tree Depth",
                value: depth,
                min: 1,
                max: 7,
                step: 1,
                update: setDepth,
              },
              {
                label: "Data Noise",
                value: noise,
                min: 0,
                max: 0.35,
                step: 0.01,
                update: setNoise,
              },
            ].map((control) => (
              <label
                key={control.label}
                className="block space-y-3"
              >
                <span className="flex justify-between gap-2 text-xs">
                  <span className="text-slate-300">
                    {control.label}
                  </span>
                  <strong className="text-violet-300">
                    {control.value}
                  </strong>
                </span>

                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.value}
                  onChange={(event) => {
                    control.update(
                      Number(event.target.value),
                    );
                    changeConfiguration();
                  }}
                  className="w-full accent-violet-500"
                />
              </label>
            ))}

            <button
              type="button"
              onClick={() => {
                setSeed((value) => value + 1);
                restart();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700"
            >
              <RefreshCw size={16} />
              New Dataset
            </button>
          </div>
        </div>

        <div className={`${chartBox} lg:col-span-3`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                Animated Bagging Training
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-400">
                Add trees one by one to see their combined
                prediction evolve.
              </p>
            </div>

            <div className="rounded-xl bg-violet-500/15 px-4 py-3 text-sm font-bold text-violet-300">
              {activeStep} / {treeCount} Trees
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (activeStep >= treeCount) {
                  setStep(1);
                }
                setPlaying(!playing);
              }}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
            >
              {playing ? (
                <Pause size={17} />
              ) : (
                <Play size={17} />
              )}
              {playing ? "Pause" : "Play Animation"}
            </button>

            <button
              type="button"
              onClick={restart}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm hover:bg-slate-700"
            >
              <RotateCcw size={17} />
              Restart
            </button>
          </div>

          <input
            type="range"
            min={1}
            max={treeCount}
            value={activeStep}
            onChange={(event) => {
              setPlaying(false);
              setStep(Number(event.target.value));
            }}
            className="mt-7 w-full accent-violet-500"
            aria-label="Number of trees currently included"
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Current Ensemble Size
              </p>
              <p className="mt-2 text-2xl font-bold text-violet-300">
                {activeStep}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Ensemble Reference MAE
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">
                {currentError.toFixed(4)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                First Tree Reference MAE
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-300">
                {firstError.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className={chartBox}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Database size={19} className="text-sky-400" />
            Graph 1 — Bootstrap Sampling
          </h3>

          <p className="mt-3 text-xs leading-6 text-slate-400">
            Select a tree. Orange points are selected;
            bigger circles mean repeated sampling.
            Gray points are out-of-bag.
          </p>

          <label className="mt-5 block text-sm text-slate-300">
            Inspect Tree {activeTreeIndex + 1}
            <select
              value={activeTreeIndex}
              onChange={(event) =>
                setSelectedTree(Number(event.target.value))
              }
              className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
            >
              {trees.slice(0, activeStep).map((_, i) => (
                <option key={i} value={i}>
                  Tree {i + 1}
                </option>
              ))}
            </select>
          </label>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-5 w-full"
            role="img"
            aria-label="Training observations showing bootstrap selection frequency and out-of-bag observations"
          >
            <Axes />

            <path
              d={curvePath(
                xs.map(trueFunction),
                xs,
              )}
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="7 5"
              fill="none"
            />

            {dataset.map((point) => {
              const frequency = frequencies[point.id];

              return (
                <circle
                  key={point.id}
                  cx={xPos(point.x)}
                  cy={yPos(point.y)}
                  r={
                    frequency === 0
                      ? 5
                      : 5 + frequency * 2.5
                  }
                  fill={
                    frequency === 0
                      ? "#64748b"
                      : "#fb923c"
                  }
                  opacity={0.85}
                  stroke="#e2e8f0"
                  strokeWidth={0.7}
                >
                  <title>
                    {`Row ${point.id + 1}: selected ${frequency} time(s)`}
                  </title>
                </circle>
              );
            })}
          </svg>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-slate-950 p-3">
              <p className="text-xs text-slate-400">
                Unique rows
              </p>
              <p className="mt-2 font-bold text-orange-300">
                {uniqueCount}
              </p>
            </div>

            <div className="rounded-lg bg-slate-950 p-3">
              <p className="text-xs text-slate-400">
                Repeated draws
              </p>
              <p className="mt-2 font-bold text-violet-300">
                {observedCount}
              </p>
            </div>

            <div className="rounded-lg bg-slate-950 p-3">
              <p className="text-xs text-slate-400">
                OOB rows
              </p>
              <p className="mt-2 font-bold text-sky-300">
                {oobCount}
              </p>
            </div>
          </div>
        </div>

        <div className={chartBox}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Trees size={19} className="text-violet-300" />
            Graph 2 — Individual Trees vs Bagging
          </h3>

          <p className="mt-3 text-xs leading-6 text-slate-400">
            See how decision trees produce different
            step-shaped predictions and how Bagging
            averages them.
          </p>

          <label className="mt-4 flex items-center gap-3 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={showAllTrees}
              onChange={(event) =>
                setShowAllTrees(event.target.checked)
              }
              className="accent-violet-500"
            />
            Show all active tree predictions
          </label>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-6 w-full"
            role="img"
            aria-label="Individual regression tree predictions compared with their bagged ensemble average"
          >
            <Axes />

            {showAllTrees &&
              computations.predictions
                .slice(0, activeStep)
                .map((values, index) => (
                  <path
                    key={index}
                    d={curvePath(values, xs)}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    opacity={0.14}
                  />
                ))}

            <path
              d={curvePath(
                computations.actual,
                xs,
              )}
              fill="none"
              stroke="#34d399"
              strokeWidth="3"
              strokeDasharray="8 5"
            />

            <path
              d={curvePath(individual, xs)}
              fill="none"
              stroke="#fb923c"
              strokeWidth="2.5"
            />

            <path
              d={curvePath(ensemble, xs)}
              fill="none"
              stroke="#a78bfa"
              strokeWidth="4"
            />
          </svg>

          <div className="flex flex-wrap gap-4">
            <LineLegend
              color="#34d399"
              label="True relationship"
            />
            <LineLegend
              color="#fb923c"
              label="Selected tree"
            />
            <LineLegend
              color="#a78bfa"
              label="Bagging average"
            />
          </div>
        </div>
      </div>

      <div className={chartBox}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <BarChart3 size={20} className="text-emerald-300" />
          Graph 3 — How Bagging Changes With More Trees
        </h3>

        <p className="mt-3 max-w-3xl text-xs leading-7 text-slate-400">
          This graph shows the mean absolute difference
          between the ensemble prediction and the known
          synthetic function. It is an educational reference
          error, not a held-out test score.
          Lower values are better on this particular example.
        </p>

        {(() => {
          const chartLeft = 50;
          const chartRight = 20;
          const chartTop = 20;
          const chartBottom = 40;

          const maxError = Math.max(
            0.01,
            ...computations.errors,
          );

          const pointX = (index: number) =>
            chartLeft +
            (index / Math.max(1, treeCount - 1)) *
              (W - chartLeft - chartRight);

          const pointY = (error: number) =>
            H -
            chartBottom -
            (error / (maxError * 1.12)) *
              (H - chartTop - chartBottom);

          const errorPath = computations.errors
            .slice(0, activeStep)
            .map(
              (error, index) =>
                `${index === 0 ? "M" : "L"}${pointX(index).toFixed(2)},${pointY(error).toFixed(2)}`,
            )
            .join(" ");

          return (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mt-5 w-full"
              role="img"
              aria-label="Ensemble reference error as more decision trees are added"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <g key={t}>
                  <line
                    x1={chartLeft}
                    x2={W - chartRight}
                    y1={pointY(t * maxError)}
                    y2={pointY(t * maxError)}
                    stroke="#25334c"
                    strokeDasharray="4 6"
                  />

                  <text
                    x={chartLeft - 8}
                    y={pointY(t * maxError) + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#94a3b8"
                  >
                    {(t * maxError).toFixed(2)}
                  </text>
                </g>
              ))}

              <path
                d={errorPath}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {computations.errors
                .slice(0, activeStep)
                .map((error, index) => (
                  <circle
                    key={index}
                    cx={pointX(index)}
                    cy={pointY(error)}
                    r={index === activeStep - 1 ? 5 : 2.5}
                    fill={
                      index === activeStep - 1
                        ? "#34d399"
                        : "#a78bfa"
                    }
                  >
                    <title>
                      {`${index + 1} trees: reference MAE ${error.toFixed(4)}`}
                    </title>
                  </circle>
                ))}

              <text
                x={W / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="12"
                fill="#94a3b8"
              >
                Number of Trees
              </text>
            </svg>
          );
        })()}

        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm leading-7 text-slate-300">
          <strong className="text-emerald-300">
            What to notice:
          </strong>{" "}
          As more bootstrap-trained trees are averaged,
          the ensemble prediction often becomes more stable.
          The reference error can still rise or fall as
          individual trees are added; improvement is not
          guaranteed at every step.
        </div>
      </div>

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
        <h3 className="text-lg font-bold text-violet-200">
          How to Use This Visualization
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <p className="text-sm leading-7 text-slate-300">
            <strong className="text-white">
              1. Explore bootstrap sampling.
            </strong>{" "}
            Select different trees and watch which training
            observations are repeated or omitted.
          </p>

          <p className="text-sm leading-7 text-slate-300">
            <strong className="text-white">
              2. Play the Bagging animation.
            </strong>{" "}
            Watch the purple ensemble line change as
            additional decision trees contribute predictions.
          </p>

          <p className="text-sm leading-7 text-slate-300">
            <strong className="text-white">
              3. Experiment with complexity.
            </strong>{" "}
            Increase tree depth or data noise and observe
            how the selected tree and ensemble behave.
          </p>
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-500">
          This is an interactive, browser-based regression
          demonstration with actual bootstrap sampling
          and small CART-style fitted trees. It uses a
          synthetic dataset with a known underlying function.
          Your separate FastAPI Training Studio remains
          responsible for scikit-learn model training,
          uploaded CSV datasets, and 2D/3D model surfaces.
        </p>
      </div>
    </section>
  );
}
