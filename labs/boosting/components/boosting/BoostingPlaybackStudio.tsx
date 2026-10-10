
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export type BoostingStageMetrics = {
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  r2?: number | null;
  mae?: number | null;
  rmse?: number | null;
};

export type BoostingStage = {
  stage: number;
  metrics: BoostingStageMetrics;
  predictions: (number | null)[];
};

export type BoostingModelKey =
  | "adaboost"
  | "gradient_boosting";

type Props = {
  task: "classification" | "regression";
  adaboostStages: BoostingStage[];
  gradientStages: BoostingStage[];
  onStageChange?: (
    model: BoostingModelKey,
    stage: number,
  ) => void;
};

function format(value?: number | null) {
  return value == null || !Number.isFinite(value)
    ? "N/A"
    : value.toFixed(4);
}

export default function BoostingPlaybackStudio({
  task,
  adaboostStages,
  gradientStages,
  onStageChange,
}: Props) {
  const [model, setModel] =
    useState<BoostingModelKey>("gradient_boosting");

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const stages =
    model === "adaboost"
      ? adaboostStages
      : gradientStages;

  const current = stages[index];
  const isLast = index >= stages.length - 1;

  useEffect(() => {
    if (!playing || stages.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((previous) =>
        Math.min(previous + 1, stages.length - 1),
      );
    }, 1100 / speed);

    return () => window.clearInterval(timer);
  }, [playing, speed, stages.length]);

  useEffect(() => {
    if (playing && isLast) {
      setPlaying(false);
    }
  }, [playing, isLast]);

  useEffect(() => {
    if (current) {
      onStageChange?.(model, current.stage);
    }
  }, [model, current?.stage, onStageChange]);

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

  function changeModel(next: BoostingModelKey) {
    setPlaying(false);
    setModel(next);
    setIndex(0);
  }

  function restart() {
    setPlaying(false);
    setIndex(0);
  }

  function togglePlay() {
    if (!stages.length) return;

    if (playing) {
      setPlaying(false);
      return;
    }

    if (isLast) {
      setIndex(0);
    }

    setPlaying(true);
  }

  if (!current) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
        <h2 className="text-xl font-bold">
          Boosting Training Playback
        </h2>
        <p className="mt-3 text-sm">
          Train AdaBoost and Gradient Boosting to inspect
          their fitted learning stages.
        </p>
      </section>
    );
  }

  const maxStage = stages[stages.length - 1].stage;

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Sequential Learning
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Boosting Training Playback
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Explore real post-training checkpoints.
          Watch how the ensemble's held-out predictions
          and evaluation metrics change as more
          boosting stages are included.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["gradient_boosting", "Gradient Boosting"],
            ["adaboost", "AdaBoost"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => changeModel(key)}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              model === key
                ? "bg-violet-600 text-white"
                : "border border-slate-700 bg-slate-950 text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Learners included",
            value: `${current.stage} / ${maxStage}`,
          },
          {
            label: "Saved checkpoint",
            value: `${index + 1} / ${stages.length}`,
          },
          {
            label:
              task === "classification"
                ? "Test accuracy"
                : "Test R²",
            value: format(
              task === "classification"
                ? current.metrics.accuracy
                : current.metrics.r2,
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <p className="text-xs text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-300">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <strong>Ensemble progression</strong>
          <span className="font-mono text-violet-300">
            {Math.round(
              (current.stage / maxStage) * 100,
            )}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all duration-300"
            style={{
              width: `${(current.stage / maxStage) * 100}%`,
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
          aria-label="Boosting checkpoint slider"
          className="mt-6 w-full accent-violet-500"
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={restart}
            aria-label="Restart playback"
            className="rounded-xl border border-slate-700 p-3"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            disabled={index === 0}
            onClick={() => {
              setPlaying(false);
              setIndex((value) => Math.max(0, value - 1));
            }}
            aria-label="Previous checkpoint"
            className="rounded-xl border border-slate-700 p-3 disabled:opacity-40"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold hover:bg-violet-500"
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
            disabled={isLast}
            onClick={() => {
              setPlaying(false);
              setIndex((value) =>
                Math.min(stages.length - 1, value + 1),
              );
            }}
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
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-2">
            <Activity
              size={19}
              className="text-sky-400"
            />
            <h3 className="font-bold">
              Metrics at This Stage
            </h3>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.key}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <p className="text-xs text-slate-400">
                  {metric.label}
                </p>

                <p className="mt-2 font-mono text-xl font-bold">
                  {format(
                    current.metrics[
                      metric.key as keyof BoostingStageMetrics
                    ],
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-2">
            <BarChart3
              size={19}
              className="text-emerald-400"
            />
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
                {current.predictions.map((value, row) => (
                  <tr
                    key={row}
                    className="border-t border-slate-800"
                  >
                    <td className="p-2">{row + 1}</td>
                    <td className="p-2 font-mono text-violet-300">
                      {format(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <div className="flex items-center gap-2 text-sky-300">
          <BookOpen size={17} />
          <strong className="text-sm">
            What is happening?
          </strong>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {model === "adaboost"
            ? "AdaBoost assigns greater importance to observations that are difficult for earlier learners. Each new estimator is trained using updated sample weights, and the ensemble combines its learners according to the AdaBoost algorithm."
            : "Gradient Boosting builds models sequentially, using the negative gradient of the loss function to guide each new stage. For squared-error regression, this corresponds to learning from residual errors."}
        </p>

        <p className="mt-3 text-xs leading-6 text-slate-500">
          These are checkpoints recorded after model fitting,
          not live training events. The table and metrics
          use actual scikit-learn staged predictions.
          The selected stage can also be sent to the
          graph component once stage-specific prediction
          surfaces are connected.
        </p>
      </div>
    </section>
  );
}
