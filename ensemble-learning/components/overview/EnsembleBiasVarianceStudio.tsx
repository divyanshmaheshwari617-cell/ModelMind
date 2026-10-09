
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChartLine,
  Info,
  Layers3,
  RefreshCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type Observation = {
  x: number;
  y: number;
};

type Model = {
  predict: (x: number) => number;
};

type ExperimentResult = {
  xGrid: number[];
  truth: number[];
  singleCurves: number[][];
  ensembleCurves: number[][];
  singleMean: number[];
  ensembleMean: number[];
  singleBias: number;
  ensembleBias: number;
  singleVariance: number;
  ensembleVariance: number;
  singleMSE: number;
  ensembleMSE: number;
  noiseVariance: number;
  averageCorrelation: number | null;
};

const CARD =
  "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";

const SVG_WIDTH = 840;
const SVG_HEIGHT = 370;
const LEFT = 54;
const RIGHT = 22;
const TOP = 24;
const BOTTOM = 46;

const SINGLE = "#f59e0b";
const ENSEMBLE = "#a78bfa";
const TRUTH = "#34d399";

function randomGenerator(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function gaussian(random: () => number): number {
  const a = Math.max(random(), 1e-12);
  const b = random();

  return Math.sqrt(-2 * Math.log(a)) *
    Math.cos(2 * Math.PI * b);
}

function trueFunction(x: number): number {
  return (
    0.5 +
    0.27 * Math.sin(2 * Math.PI * x) +
    0.13 * Math.cos(4 * Math.PI * x)
  );
}

function makeDataset(
  count: number,
  noise: number,
  random: () => number,
): Observation[] {
  return Array.from({ length: count }, () => {
    const x = random();

    return {
      x,
      y: trueFunction(x) + gaussian(random) * noise,
    };
  });
}

/**
 * An educational piecewise-constant regressor.
 * This is a histogram-style learner, not an sklearn
 * DecisionTreeRegressor.
 *
 * The shift changes bin boundaries, introducing
 * additional diversity between base learners.
 */
function trainPiecewise(
  rows: Observation[],
  bins: number,
  shift: number,
): Model {
  const count = Array<number>(bins + 1).fill(0);
  const sums = Array<number>(bins + 1).fill(0);

  const overall =
    rows.reduce((sum, row) => sum + row.y, 0) /
    Math.max(1, rows.length);

  function bucket(x: number) {
    return Math.max(
      0,
      Math.min(bins, Math.floor(x * bins + shift)),
    );
  }

  for (const row of rows) {
    const index = bucket(row.x);
    count[index]++;
    sums[index] += row.y;
  }

  const means = count.map((n, index) =>
    n > 0 ? sums[index] / n : overall,
  );

  return {
    predict: (x) => means[bucket(x)],
  };
}

function trainAggregate(
  rows: Observation[],
  bins: number,
  estimators: number,
  random: () => number,
): {
  model: Model;
  learners: Model[];
} {
  const learners = Array.from(
    { length: estimators },
    () => {
      const bootstrap = Array.from(
        { length: rows.length },
        () => rows[Math.floor(random() * rows.length)],
      );

      const shift = random() - 0.5;

      return trainPiecewise(bootstrap, bins, shift);
    },
  );

  return {
    learners,
    model: {
      predict: (x) =>
        learners.reduce(
          (sum, learner) => sum + learner.predict(x),
          0,
        ) / learners.length,
    },
  };
}

function mean(values: number[]) {
  if (values.length === 0) return 0;

  return values.reduce((sum, v) => sum + v, 0) /
    values.length;
}

function variance(values: number[]) {
  if (!values.length) return 0;

  const avg = mean(values);

  return mean(values.map((v) => (v - avg) ** 2));
}

function correlation(a: number[], b: number[]) {
  const ma = mean(a);
  const mb = mean(b);

  const covariance = mean(
    a.map((value, i) => (value - ma) * (b[i] - mb)),
  );

  const sd = Math.sqrt(variance(a) * variance(b));

  return sd > 1e-12 ? covariance / sd : null;
}

function simulate({
  sampleSize,
  complexity,
  estimators,
  noise,
  seed,
}: {
  sampleSize: number;
  complexity: number;
  estimators: number;
  noise: number;
  seed: number;
}): ExperimentResult {
  const random = randomGenerator(seed);

  const xGrid = Array.from(
    { length: 101 },
    (_, i) => i / 100,
  );

  const truth = xGrid.map(trueFunction);

  const singleCurves: number[][] = [];
  const ensembleCurves: number[][] = [];
  const correlations: number[] = [];

  const trials = 12;

  for (let trial = 0; trial < trials; trial++) {
    // A fresh dataset represents a different
    // hypothetical training sample.
    const data = makeDataset(sampleSize, noise, random);

    const singleModel = trainPiecewise(
      data,
      complexity,
      0,
    );

    const ensemble = trainAggregate(
      data,
      complexity,
      estimators,
      random,
    );

    singleCurves.push(
      xGrid.map(singleModel.predict),
    );

    ensembleCurves.push(
      xGrid.map(ensemble.model.predict),
    );

    if (trial === 0 && ensemble.learners.length > 1) {
      const selected = ensemble.learners.slice(0, 8);

      for (let i = 0; i < selected.length; i++) {
        for (let j = i + 1; j < selected.length; j++) {
          const a = xGrid.map(selected[i].predict);
          const b = xGrid.map(selected[j].predict);
          const c = correlation(a, b);

          if (c !== null) correlations.push(c);
        }
      }
    }
  }

  function statistics(curves: number[][]) {
    const expected = xGrid.map((_, index) =>
      mean(curves.map((curve) => curve[index])),
    );

    const biasSquared = mean(
      expected.map(
        (prediction, index) =>
          (prediction - truth[index]) ** 2,
      ),
    );

    const predictiveVariance = mean(
      xGrid.map((_, index) =>
        variance(curves.map((curve) => curve[index])),
      ),
    );

    return {
      expected,
      biasSquared,
      predictiveVariance,
      estimatedError:
        biasSquared + predictiveVariance + noise ** 2,
    };
  }

  const single = statistics(singleCurves);
  const ensemble = statistics(ensembleCurves);

  return {
    xGrid,
    truth,
    singleCurves,
    ensembleCurves,
    singleMean: single.expected,
    ensembleMean: ensemble.expected,
    singleBias: single.biasSquared,
    ensembleBias: ensemble.biasSquared,
    singleVariance: single.predictiveVariance,
    ensembleVariance: ensemble.predictiveVariance,
    singleMSE: single.estimatedError,
    ensembleMSE: ensemble.estimatedError,
    noiseVariance: noise ** 2,
    averageCorrelation: correlations.length
      ? mean(correlations)
      : null,
  };
}

function number(value: number, digits = 4) {
  return Number(value.toFixed(digits)).toString();
}

function CurveChart({
  result,
  mode,
  showIndividual,
}: {
  result: ExperimentResult;
  mode: "single" | "ensemble";
  showIndividual: boolean;
}) {
  const curves =
    mode === "single"
      ? result.singleCurves
      : result.ensembleCurves;

  const center =
    mode === "single"
      ? result.singleMean
      : result.ensembleMean;

  const accent = mode === "single" ? SINGLE : ENSEMBLE;

  function xPosition(x: number) {
    return LEFT + x * (SVG_WIDTH - LEFT - RIGHT);
  }

  function yPosition(y: number) {
    const min = -0.25;
    const max = 1.25;

    return TOP +
      ((max - y) / (max - min)) *
        (SVG_HEIGHT - TOP - BOTTOM);
  }

  function path(values: number[]) {
    return values
      .map((value, index) => {
        const command = index === 0 ? "M" : "L";

        return `${command}${xPosition(
          result.xGrid[index],
        ).toFixed(2)},${yPosition(value).toFixed(2)}`;
      })
      .join(" ");
  }

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-[#090f1d] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3">
        <h4 className="font-semibold">
          {mode === "single"
            ? "Single Learner"
            : "Combined Ensemble"}
        </h4>

        <span
          className="text-xs"
          style={{ color: accent }}
        >
          {curves.length} training repetitions
        </span>
      </div>

      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`${mode} prediction curves across repeated simulated training datasets`}
      >
        {Array.from({ length: 6 }, (_, index) => {
          const x = LEFT +
            index * (SVG_WIDTH - LEFT - RIGHT) / 5;

          return (
            <g key={`x-${index}`}>
              <line
                x1={x}
                x2={x}
                y1={TOP}
                y2={SVG_HEIGHT - BOTTOM}
                stroke="#293449"
                strokeDasharray="3 5"
              />
              <text
                x={x}
                y={SVG_HEIGHT - 15}
                textAnchor="middle"
                fontSize={12}
                fill="#94a3b8"
              >
                {(index / 5).toFixed(1)}
              </text>
            </g>
          );
        })}

        {Array.from({ length: 7 }, (_, index) => {
          const value = index * 0.2 - 0.2;

          return (
            <g key={`y-${index}`}>
              <line
                x1={LEFT}
                x2={SVG_WIDTH - RIGHT}
                y1={yPosition(value)}
                y2={yPosition(value)}
                stroke="#293449"
                strokeDasharray="3 5"
              />
              <text
                x={LEFT - 10}
                y={yPosition(value) + 4}
                textAnchor="end"
                fontSize={12}
                fill="#94a3b8"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        <defs>
          <clipPath id={`bias-clip-${mode}`}>
            <rect
              x={LEFT}
              y={TOP}
              width={SVG_WIDTH - LEFT - RIGHT}
              height={SVG_HEIGHT - TOP - BOTTOM}
            />
          </clipPath>
        </defs>

        <g clipPath={`url(#bias-clip-${mode})`}>
          {showIndividual &&
            curves.map((curve, index) => (
              <path
                key={index}
                d={path(curve)}
                fill="none"
                stroke={accent}
                strokeWidth={1.2}
                opacity={0.17}
              />
            ))}

          <path
            d={path(result.truth)}
            fill="none"
            stroke={TRUTH}
            strokeWidth={3}
            strokeDasharray="7 5"
          />

          <path
            d={path(center)}
            fill="none"
            stroke={accent}
            strokeWidth={3}
          />
        </g>
      </svg>

      <div className="flex flex-wrap gap-4 px-2 pb-2 text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <span
            className="h-1 w-5 rounded"
            style={{ backgroundColor: TRUTH }}
          />
          True relationship
        </span>

        <span className="flex items-center gap-2">
          <span
            className="h-1 w-5 rounded"
            style={{ backgroundColor: accent }}
          />
          Average fitted prediction
        </span>

        <span className="text-slate-500">
          Faint lines = individual repetitions
        </span>
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
  description,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-200">
          {label}
        </label>

        <span className="font-mono text-sm text-violet-300">
          {value}
        </span>
      </div>

      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-3 w-full accent-violet-500"
        aria-label={label}
      />

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function EnsembleBiasVarianceStudio() {
  const [sampleSize, setSampleSize] = useState(45);
  const [complexity, setComplexity] = useState(10);
  const [estimators, setEstimators] = useState(25);
  const [noise, setNoise] = useState(0.15);
  const [seed, setSeed] = useState(2026);
  const [showIndividual, setShowIndividual] = useState(true);
  const [level, setLevel] =
    useState<"basic" | "intermediate" | "advanced">(
      "basic",
    );

  const result = useMemo(
    () =>
      simulate({
        sampleSize,
        complexity,
        estimators,
        noise,
        seed,
      }),
    [sampleSize, complexity, estimators, noise, seed],
  );

  const improved =
    result.ensembleMSE < result.singleMSE;

  const varianceReduction =
    result.singleVariance > 0
      ? (1 -
          result.ensembleVariance /
            result.singleVariance) * 100
      : null;

  function reset() {
    setSampleSize(45);
    setComplexity(10);
    setEstimators(25);
    setNoise(0.15);
    setSeed(2026);
    setShowIndividual(true);
  }

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Ensemble Stability Laboratory
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Bias, Variance & Model Diversity
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Why does combining learners sometimes produce
          more stable predictions? Explore repeated training
          samples, model complexity, noise, and aggregation
          through a reproducible statistical experiment.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className={`${CARD} space-y-6`}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={20}
              className="text-violet-400"
            />
            <h3 className="text-lg font-bold">
              Experiment Controls
            </h3>
          </div>

          <Control
            label="Training Samples"
            value={sampleSize}
            min={20}
            max={120}
            step={5}
            onChange={setSampleSize}
            description="Number of noisy observations used in each training repetition."
          />

          <Control
            label="Model Complexity"
            value={complexity}
            min={3}
            max={18}
            step={1}
            onChange={setComplexity}
            description="Number of fitted piecewise regions. More regions allow more detailed patterns."
          />

          <Control
            label="Ensemble Learners"
            value={estimators}
            min={3}
            max={60}
            step={3}
            onChange={setEstimators}
            description="Number of resampled base learners averaged into the ensemble."
          />

          <Control
            label="Noise Strength"
            value={noise}
            min={0}
            max={0.4}
            step={0.025}
            onChange={setNoise}
            description="Standard deviation of the random Gaussian observation noise."
          />

          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showIndividual}
              onChange={(event) =>
                setShowIndividual(event.target.checked)
              }
              className="accent-violet-500"
            />
            Show individual training curves
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeed((old) => old + 1)}
              className="rounded-xl bg-violet-600 px-4 py-3 text-xs font-semibold hover:bg-violet-500"
            >
              New Training Samples
            </button>

            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-3 text-xs text-slate-300"
            >
              <RefreshCcw size={14} />
              Reset
            </button>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={CARD}>
              <div className="flex items-center gap-2 text-amber-300">
                <ChartLine size={18} />
                <h3 className="font-bold">Single Learner</h3>
              </div>

              <p className="mt-3 text-2xl font-bold">
                {number(result.singleMSE)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Estimated prediction MSE
              </p>
            </div>

            <div className={CARD}>
              <div className="flex items-center gap-2 text-violet-300">
                <Layers3 size={18} />
                <h3 className="font-bold">Ensemble</h3>
              </div>

              <p className="mt-3 text-2xl font-bold">
                {number(result.ensembleMSE)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Estimated prediction MSE
              </p>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
            <CurveChart
              result={result}
              mode="single"
              showIndividual={showIndividual}
            />

            <CurveChart
              result={result}
              mode="ensemble"
              showIndividual={showIndividual}
            />
          </div>

          <section className={CARD}>
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-sky-400" />
              <h3 className="text-lg font-bold">
                Measured Error Components
              </h3>
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-400">
              Empirical estimates from 12 independently
              generated training datasets, evaluated along
              the same underlying function.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-3 pr-3">Component</th>
                    <th className="py-3 pr-3">Single</th>
                    <th className="py-3">Ensemble</th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    {
                      label: "Bias²",
                      single: result.singleBias,
                      ensemble: result.ensembleBias,
                    },
                    {
                      label: "Variance",
                      single: result.singleVariance,
                      ensemble: result.ensembleVariance,
                    },
                    {
                      label: "Noise variance",
                      single: result.noiseVariance,
                      ensemble: result.noiseVariance,
                    },
                    {
                      label: "Estimated MSE",
                      single: result.singleMSE,
                      ensemble: result.ensembleMSE,
                    },
                  ].map((row) => (
                    <tr
                      key={row.label}
                      className="border-t border-slate-800"
                    >
                      <td className="py-3 pr-3 text-slate-300">
                        {row.label}
                      </td>
                      <td className="py-3 pr-3 font-mono text-amber-300">
                        {number(row.single)}
                      </td>
                      <td className="py-3 font-mono text-violet-300">
                        {number(row.ensemble)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-white">
                {improved
                  ? "The ensemble has lower estimated error in this experiment."
                  : result.ensembleMSE === result.singleMSE
                    ? "Both models have equal estimated error."
                    : "The single learner has lower estimated error in this experiment."}
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {varianceReduction === null
                  ? "Variance reduction is not defined when the single learner has zero measured variance."
                  : `Measured variance change: ${number(
                      varianceReduction,
                      1,
                    )}% reduction (a negative value means an increase).`}
                {" "}These results depend on the current data,
                model complexity, and random samples.
              </p>
            </div>
          </section>

          <section className={CARD}>
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={20}
                className="text-emerald-400"
              />
              <h3 className="text-lg font-bold">
                Model Diversity Inspector
              </h3>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950 p-4">
              <div>
                <p className="text-xs text-slate-400">
                  Average pairwise learner correlation
                </p>

                <p className="mt-2 text-2xl font-bold text-sky-300">
                  {result.averageCorrelation === null
                    ? "N/A"
                    : number(result.averageCorrelation, 3)}
                </p>
              </div>

              <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">
                First training repetition
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              This measurement compares prediction curves
              from pairs of base learners. Very similar
              predictions produce high correlation.
              Correlation alone does not measure model
              quality or prove that diversity improves accuracy.
            </p>
          </section>
        </div>
      </div>

      <section className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-bold">
            Understand the Experiment
          </h3>

          <div className="flex flex-wrap gap-2">
            {(["basic", "intermediate", "advanced"] as const).map(
              (option) => (
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
              ),
            )}
          </div>
        </div>

        {level === "basic" && (
          <p className="mt-5 text-sm leading-8 text-slate-300">
            Imagine twelve students learning the same
            pattern from different examples. Their answers
            may vary. A single learner's faint lines show
            these differences. The ensemble averages several
            learners, which can make predictions more stable.
            The green dashed line shows the actual pattern.
          </p>
        )}

        {level === "intermediate" && (
          <p className="mt-5 text-sm leading-8 text-slate-300">
            Bias measures how far the average learned
            prediction is from the true relationship.
            Variance measures how much fitted predictions
            differ across repeated training samples.
            Aggregation often reduces variance when learner
            errors are not perfectly correlated, but bias
            can also change.
          </p>
        )}

        {level === "advanced" && (
          <div className="mt-5 space-y-3 text-sm leading-8 text-slate-300">
            <p>
              For squared-error regression with independent,
              zero-mean observation noise:
            </p>

            <p className="rounded-xl bg-slate-950 p-4 font-mono text-violet-200">
              Expected test MSE = Bias² + Variance + Noise Variance
            </p>

            <p>
              Here, bias² and variance are estimated using
              12 repeated training samples over a fixed grid
              of input locations. Noise variance is known
              from the simulator. These are finite-simulation
              estimates, not exact population quantities.
            </p>
          </div>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
          <Info
            size={17}
            className="mt-1 shrink-0 text-sky-400"
          />

          <p className="text-xs leading-6 text-slate-300">
            This is a real numerical simulation using
            piecewise-constant regression learners and
            bootstrap aggregation. It is not the same as
            scikit-learn Random Forest training. The
            simulation uses a known synthetic function,
            allowing bias and variance to be estimated.
          </p>
        </div>
      </section>

      <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
        Change parameters
        <ArrowRight size={15} />
        Refit learners
        <ArrowRight size={15} />
        Compare stability
      </div>
    </div>
  );
}
