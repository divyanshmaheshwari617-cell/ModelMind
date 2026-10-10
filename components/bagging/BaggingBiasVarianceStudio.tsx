
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  BrainCircuit,
  RefreshCcw,
  SlidersHorizontal,
} from "lucide-react";

type Row = { x: number; y: number };

type Simulation = {
  grid: number[];
  truth: number[];
  singleCurves: number[][];
  baggingCurves: number[][];
  singleMean: number[];
  baggingMean: number[];
  singleBias: number;
  baggingBias: number;
  singleVariance: number;
  baggingVariance: number;
  singleError: number;
  baggingError: number;
};

const PANEL =
  "rounded-2xl border border-slate-800 bg-slate-900/85 p-5";

function rng(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function normal(random: () => number) {
  const u = Math.max(1e-12, random());
  return Math.sqrt(-2 * Math.log(u)) *
    Math.cos(2 * Math.PI * random());
}

function truth(x: number) {
  return (
    0.5 +
    0.25 * Math.sin(2 * Math.PI * x) +
    0.12 * Math.cos(4 * Math.PI * x)
  );
}

/*
 * Educational piecewise-constant regressor.
 * This is not scikit-learn DecisionTreeRegressor.
 */
function fitLearner(data: Row[], regions: number) {
  const counts = Array<number>(regions).fill(0);
  const sums = Array<number>(regions).fill(0);

  const mean = data.reduce(
    (sum, row) => sum + row.y, 0
  ) / data.length;

  const bucket = (x: number) =>
    Math.min(
      regions - 1,
      Math.max(0, Math.floor(x * regions)),
    );

  for (const row of data) {
    const index = bucket(row.x);
    counts[index]++;
    sums[index] += row.y;
  }

  const values = counts.map((count, index) =>
    count ? sums[index] / count : mean,
  );

  return (x: number) => values[bucket(x)];
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) /
    Math.max(values.length, 1);
}

function runSimulation(
  size: number,
  regions: number,
  estimators: number,
  noise: number,
  seed: number,
): Simulation {
  const random = rng(seed);
  const trials = 16;

  const grid = Array.from(
    { length: 101 },
    (_, i) => i / 100,
  );

  const actual = grid.map(truth);
  const singleCurves: number[][] = [];
  const baggingCurves: number[][] = [];

  for (let trial = 0; trial < trials; trial++) {
    const data = Array.from(
      { length: size },
      () => {
        const x = random();
        return {
          x,
          y: truth(x) + normal(random) * noise,
        };
      },
    );

    const single = fitLearner(data, regions);
    singleCurves.push(grid.map(single));

    const learners = Array.from(
      { length: estimators },
      () => {
        const sample = Array.from(
          { length: size },
          () => data[Math.floor(random() * size)],
        );

        return fitLearner(sample, regions);
      },
    );

    baggingCurves.push(
      grid.map((x) =>
        average(
          learners.map((learner) => learner(x)),
        ),
      ),
    );
  }

  function calculate(curves: number[][]) {
    const expected = grid.map((_, index) =>
      average(curves.map((curve) => curve[index])),
    );

    const bias = average(
      expected.map(
        (prediction, index) =>
          (prediction - actual[index]) ** 2,
      ),
    );

    const variance = average(
      grid.map((_, index) => {
        const predictions = curves.map(
          (curve) => curve[index],
        );

        const mean = average(predictions);

        return average(
          predictions.map(
            (value) => (value - mean) ** 2,
          ),
        );
      }),
    );

    return {
      expected,
      bias,
      variance,
      error: bias + variance + noise ** 2,
    };
  }

  const single = calculate(singleCurves);
  const bagging = calculate(baggingCurves);

  return {
    grid,
    truth: actual,
    singleCurves,
    baggingCurves,
    singleMean: single.expected,
    baggingMean: bagging.expected,
    singleBias: single.bias,
    baggingBias: bagging.bias,
    singleVariance: single.variance,
    baggingVariance: bagging.variance,
    singleError: single.error,
    baggingError: bagging.error,
  };
}

function fmt(value: number) {
  return value.toFixed(4);
}

function CurveChart({
  simulation,
  bagging,
}: {
  simulation: Simulation;
  bagging: boolean;
}) {
  const width = 700;
  const height = 290;

  const curves = bagging
    ? simulation.baggingCurves
    : simulation.singleCurves;

  const center = bagging
    ? simulation.baggingMean
    : simulation.singleMean;

  const accent = bagging ? "#a78bfa" : "#f59e0b";

  function xPos(x: number) {
    return 35 + x * 645;
  }

  function yPos(y: number) {
    return 245 - ((y + 0.3) / 1.6) * 215;
  }

  function path(values: number[]) {
    return values.map((value, index) =>
      `${index ? "L" : "M"}${xPos(
        simulation.grid[index],
      ).toFixed(2)},${yPos(value).toFixed(2)}`,
    ).join(" ");
  }

  return (
    <div className={PANEL}>
      <h3 className="text-lg font-bold">
        {bagging ? "Bootstrap Ensemble" : "Single Learner"}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        16 independently generated training datasets
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 w-full"
        role="img"
        aria-label={
          bagging
            ? "Bagged predictions across training repetitions"
            : "Single learner predictions across training repetitions"
        }
      >
        <defs>
          <clipPath id={bagging ? "baggingClip" : "singleClip"}>
            <rect x="35" y="20" width="645" height="225" />
          </clipPath>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((value) => (
          <line
            key={value}
            x1={xPos(value)}
            x2={xPos(value)}
            y1={20}
            y2={245}
            stroke="#334155"
            strokeDasharray="3 6"
          />
        ))}

        <g
          clipPath={`url(#${
            bagging ? "baggingClip" : "singleClip"
          })`}
        >
          {curves.map((curve, index) => (
            <path
              key={index}
              d={path(curve)}
              fill="none"
              stroke={accent}
              strokeWidth={1.3}
              opacity={0.16}
            />
          ))}

          <path
            d={path(simulation.truth)}
            fill="none"
            stroke="#34d399"
            strokeWidth={3}
            strokeDasharray="7 5"
          />

          <path
            d={path(center)}
            fill="none"
            stroke={accent}
            strokeWidth={3.5}
          />
        </g>
      </svg>

      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="text-emerald-300">
          — True pattern
        </span>
        <span style={{ color: accent }}>
          — Average prediction
        </span>
        <span>Faint lines: individual repetitions</span>
      </div>
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3 text-sm">
        <span>{label}</span>
        <strong className="text-violet-300">
          {value}
        </strong>
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-violet-500"
      />
    </label>
  );
}

export default function BaggingBiasVarianceStudio() {
  const [size, setSize] = useState(50);
  const [regions, setRegions] = useState(12);
  const [estimators, setEstimators] = useState(30);
  const [noise, setNoise] = useState(0.15);
  const [seed, setSeed] = useState(42);

  const [level, setLevel] =
    useState<"basic" | "intermediate" | "advanced">(
      "basic",
    );

  const simulation = useMemo(
    () =>
      runSimulation(
        size,
        regions,
        estimators,
        noise,
        seed,
      ),
    [size, regions, estimators, noise, seed],
  );

  const items = [
    {
      label: "Bias²",
      single: simulation.singleBias,
      bagging: simulation.baggingBias,
    },
    {
      label: "Variance",
      single: simulation.singleVariance,
      bagging: simulation.baggingVariance,
    },
    {
      label: "Noise variance",
      single: noise ** 2,
      bagging: noise ** 2,
    },
    {
      label: "Estimated test MSE",
      single: simulation.singleError,
      bagging: simulation.baggingError,
    },
  ];

  const explanation = {
    basic:
      "A single learner can change noticeably when its training examples change. Bagging creates several bootstrap samples, trains a learner on each sample, and averages their predictions. This can make the combined prediction more stable.",
    intermediate:
      "Bias measures systematic differences between the average fitted prediction and the true relationship. Variance measures changes across training datasets. Bootstrap aggregation can reduce variance, but it does not guarantee a reduction in bias or total error.",
    advanced:
      "For squared-error regression with zero-mean independent observation noise, expected prediction MSE decomposes into squared bias, predictive variance, and noise variance. The experiment estimates the first two components using 16 training repetitions over a fixed evaluation grid.",
  };

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-7 md:p-9">
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Bagging Fundamentals
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Bias–Variance & Prediction Stability
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Explore how bootstrap aggregation changes
          prediction stability. Adjust training data,
          learner complexity, and noise to observe when
          bagging helps and when it does not.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className={`${PANEL} h-fit space-y-7`}>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <SlidersHorizontal
              size={19}
              className="text-violet-300"
            />
            Experiment Controls
          </h3>

          <Control
            label="Training Samples"
            value={size}
            min={20}
            max={140}
            step={10}
            onChange={setSize}
          />

          <Control
            label="Model Complexity"
            value={regions}
            min={3}
            max={25}
            step={1}
            onChange={setRegions}
          />

          <Control
            label="Bagging Learners"
            value={estimators}
            min={2}
            max={80}
            step={2}
            onChange={setEstimators}
          />

          <Control
            label="Noise Strength"
            value={noise}
            min={0}
            max={0.4}
            step={0.025}
            onChange={setNoise}
          />

          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 p-3 text-sm font-semibold hover:bg-violet-500"
          >
            <RefreshCcw size={17} />
            Regenerate Training Samples
          </button>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
            <CurveChart
              simulation={simulation}
              bagging={false}
            />
            <CurveChart
              simulation={simulation}
              bagging
            />
          </div>

          <section className={PANEL}>
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Activity
                size={20}
                className="text-sky-300"
              />
              Measured Error Components
            </h3>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[350px] text-left text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="p-3">Measure</th>
                    <th className="p-3">Single</th>
                    <th className="p-3">Bagging</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.label}
                      className="border-t border-slate-800"
                    >
                      <td className="p-3">
                        {item.label}
                      </td>
                      <td className="p-3 font-mono text-amber-300">
                        {fmt(item.single)}
                      </td>
                      <td className="p-3 font-mono text-violet-300">
                        {fmt(item.bagging)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-7 text-slate-300">
              {simulation.baggingError <
              simulation.singleError
                ? "Bagging has lower estimated prediction error for these settings."
                : "The single learner has equal or lower estimated prediction error for these settings."}
              {" "}The outcome depends on model complexity,
              sample size, noise, and random training samples.
            </p>
          </section>
        </div>
      </div>

      <section className={PANEL}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <BookOpen
              size={20}
              className="text-violet-300"
            />
            Understand Bias and Variance
          </h3>

          <div className="flex flex-wrap gap-2">
            {(["basic", "intermediate", "advanced"] as const)
              .map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLevel(option)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize ${
                    level === option
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {option}
                </button>
              ))}
          </div>
        </div>

        <p className="mt-5 text-sm leading-8 text-slate-300">
          {explanation[level]}
        </p>

        <div className="mt-5 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs leading-7 text-slate-400">
          This is a reproducible educational simulation
          using piecewise-constant regression learners,
          bootstrap samples, and averaged predictions.
          It is separate from your FastAPI scikit-learn
          Bagging training experiment. The estimates are
          based on a finite number of simulated datasets,
          not exact theoretical population values.
        </div>
      </section>
    </div>
  );
}
