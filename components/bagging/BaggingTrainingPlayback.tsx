
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export type BaggingPlaybackMetrics = {
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  r2?: number | null;
  mae?: number | null;
  rmse?: number | null;
};

export type BaggingPlaybackStage = {
  stage: number;
  total_learners: number;
  metrics: BaggingPlaybackMetrics;
  predictions: number[];
};

type Props = {
  task: "classification" | "regression";
  stages: BaggingPlaybackStage[];
  onStageChange?: (learnerCount: number) => void;
};
function format(value?: number | null) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return value.toFixed(4);
}

export default function BaggingTrainingPlayback({
  task,
  stages,
  onStageChange,
}: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const current = stages[index];
  const isLast = index >= stages.length - 1;
  useEffect(() => {
  if (!current) return;

  onStageChange?.(current.total_learners);
}, [current?.total_learners, onStageChange]);

  useEffect(() => {
    if (!playing || stages.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((previous) => {
        if (previous >= stages.length - 1) {
          return previous;
        }
        return previous + 1;
      });
    }, 1100 / speed);

    return () => window.clearInterval(timer);
  }, [playing, speed, stages.length]);

  useEffect(() => {
    if (playing && isLast) {
      setPlaying(false);
    }
  }, [playing, isLast]);

  const metrics = useMemo(
    () =>
      task === "classification"
        ? [
            { key: "accuracy", label: "Accuracy" },
            { key: "precision", label: "Precision" },
            { key: "recall", label: "Recall" },
            { key: "f1", label: "F1 Score" },
          ]
        : [
            { key: "r2", label: "R²" },
            { key: "mae", label: "MAE" },
            { key: "rmse", label: "RMSE" },
          ],
    [task],
  );

  if (!stages.length || !current) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Train a Bagging model to generate learner playback.
        </p>
      </section>
    );
  }

  function previous() {
    setPlaying(false);
    setIndex((value) => Math.max(0, value - 1));
  }

  function next() {
    setPlaying(false);
    setIndex((value) =>
      Math.min(stages.length - 1, value + 1),
    );
  }

  function restart() {
    setPlaying(false);
    setIndex(0);
  }

  function togglePlay() {
    if (isLast) setIndex(0);
    setPlaying((value) => !value);
  }

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-slate-900/85 p-5 text-slate-100 md:p-7">
      <div>
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Bagging Progression
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          Training Playback Studio
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Explore checkpoints formed by combining actual
          fitted base learners. See how the combined
          predictions and evaluation metrics change as
          more learners are included.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            Learners included
          </p>
          <p className="mt-2 text-2xl font-bold text-violet-300">
            {current.stage} / {current.total_learners}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            Current checkpoint
          </p>
          <p className="mt-2 text-2xl font-bold">
            {index + 1} / {stages.length}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            Evaluation metric
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">
            {format(
              task === "classification"
                ? current.metrics.accuracy
                : current.metrics.r2,
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {task === "classification"
              ? "Test Accuracy"
              : "Test R²"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold">
            Ensemble construction
          </span>
          <span className="font-mono text-violet-300">
            {Math.round(
              (current.stage / current.total_learners) *
                100,
            )}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Learners included"
          aria-valuemin={0}
          aria-valuemax={current.total_learners}
          aria-valuenow={current.stage}
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all duration-300"
            style={{
              width: `${
                (current.stage / current.total_learners) *
                100
              }%`,
            }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={stages.length - 1}
          value={index}
          onChange={(event) => {
            setPlaying(false);
            setIndex(Number(event.target.value));
          }}
          aria-label="Select playback checkpoint"
          className="mt-6 w-full accent-violet-500"
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={restart}
            aria-label="Restart playback"
            className="rounded-xl border border-slate-700 p-3 hover:border-violet-400"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={previous}
            disabled={index === 0}
            aria-label="Previous checkpoint"
            className="rounded-xl border border-slate-700 p-3 disabled:opacity-40"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500"
          >
            {playing ? (
              <>
                <Pause size={17} />
                Pause
              </>
            ) : (
              <>
                <Play size={17} />
                {isLast ? "Replay" : "Play"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={next}
            disabled={isLast}
            aria-label="Next checkpoint"
            className="rounded-xl border border-slate-700 p-3 disabled:opacity-40"
          >
            <ArrowRight size={18} />
          </button>

          <select
            aria-label="Playback speed"
            value={speed}
            onChange={(event) =>
              setSpeed(Number(event.target.value))
            }
            className="ml-auto rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-2">
            <Activity size={19} className="text-sky-400" />
            <h3 className="font-bold">
              Metrics at This Checkpoint
            </h3>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => {
              const key =
                metric.key as keyof BaggingPlaybackMetrics;

              return (
                <div
                  key={metric.key}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                >
                  <p className="text-xs text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 font-mono text-xl font-bold">
                    {format(current.metrics[key])}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={19} className="text-emerald-400" />
            <h3 className="font-bold">
              Test Prediction Preview
            </h3>
          </div>

          <p className="mt-3 text-xs leading-6 text-slate-400">
            First {current.predictions.length} held-out
            predictions at this checkpoint.
          </p>

          <div className="mt-4 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-2">Test row</th>
                  <th className="p-2">Prediction</th>
                </tr>
              </thead>

              <tbody>
                {current.predictions.map((value, i) => (
                  <tr
                    key={i}
                    className="border-t border-slate-800"
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2 font-mono text-violet-300">
                      {format(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="text-xs leading-6 text-slate-500">
        These are post-training checkpoints, not a live
        training process. For regression, predictions
        are averaged. For classification, intermediate
        checkpoints use majority votes, which can differ
        from scikit-learn BaggingClassifier&apos;s
        probability-averaged predictions.
      </p>
    </section>
  );
}
