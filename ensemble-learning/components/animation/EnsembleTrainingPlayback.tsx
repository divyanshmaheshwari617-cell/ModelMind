
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Pause,
  Play,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  EnsembleTrainingProgression,
  EnsembleTrainingResponse,
} from "@/lib/api/ensembleApi";

interface Props {
  result: EnsembleTrainingResponse;
  onStageChange?: (
    stage: EnsembleTrainingProgression["stages"][number],
  ) => void;
}

type Stage = EnsembleTrainingProgression["stages"][number];

type MetricKey =
  | "accuracy"
  | "f1"
  | "r2"
  | "mae"
  | "rmse";

const card =
  "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";

const metricDescriptions: Record<MetricKey, string> = {
  accuracy:
    "The proportion of test examples classified correctly. Higher is better.",
  f1:
    "Weighted F1 combines precision and recall across classes. Higher is better.",
  r2:
    "R² describes how much variation is explained compared with a constant baseline. Higher is better.",
  mae:
    "Mean absolute error measures the average size of prediction mistakes. Lower is better.",
  rmse:
    "Root mean squared error penalizes larger mistakes more strongly. Lower is better.",
};

function metricValue(
  stage: Stage,
  key: MetricKey,
): number | null {
  const metrics = stage.metrics;

  if (!(key in metrics)) return null;

  const value = metrics[key as keyof typeof metrics];

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

function formatNumber(
  value: number | null | undefined,
  digits = 4,
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return Number(value.toFixed(digits)).toLocaleString();
}

function displayModel(name: string): string {
  return name
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function MetricTile({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-violet-200">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StageExplanation({
  progression,
  stage,
}: {
  progression: EnsembleTrainingProgression;
  stage: Stage;
}) {
  const type = progression.progression_type;

  let explanation = "";

  if (type === "boosting-stages") {
    explanation =
      `At stage ${stage.stage}, the boosting model uses ` +
      `${stage.stage} fitted boosting stages. ` +
      "Each stage contributes to the prediction produced " +
      "by the accumulated ensemble.";
  } else if (type === "cumulative-learners") {
    explanation =
      `This checkpoint combines the first ${stage.stage} ` +
      "fitted learners to demonstrate how an ensemble " +
      "changes as more learners contribute.";
  } else {
    explanation =
      "Voting and stacking do not have boosting-style " +
      "training stages. This checkpoint shows the " +
      "prediction of the complete fitted ensemble.";
  }

  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
      <div className="flex items-center gap-2 text-sky-300">
        <CircleHelp size={17} />
        <h3 className="text-sm font-semibold">
          Understand this checkpoint
        </h3>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-300">
        {explanation}
      </p>

      {!stage.is_exact_model_stage && (
        <p className="mt-3 text-xs leading-6 text-amber-300">
          Educational aggregation preview: this
          intermediate checkpoint is not necessarily
          identical to the corresponding partial
          scikit-learn ensemble prediction.
        </p>
      )}
    </div>
  );
}

function PredictionPreview({
  stage,
  classification,
}: {
  stage: Stage;
  classification: boolean;
}) {
  const [limit, setLimit] = useState(8);

  const predictions = stage.prediction_preview;

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">
          Checkpoint Predictions
        </h3>

        <span className="text-xs text-slate-400">
          {predictions.length} preview samples
        </span>
      </div>

      <p className="mt-2 text-xs leading-6 text-slate-400">
        These are held-out test predictions from the
        currently selected checkpoint, not training
        observations. Only the preview samples returned
        by the backend are displayed.
      </p>

      <div className="mt-5 max-h-80 overflow-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[360px] text-left text-xs">
          <thead className="sticky top-0 bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Actual</th>
              <th className="px-4 py-3">Predicted</th>
              <th className="px-4 py-3">
                {classification ? "Correct?" : "Error"}
              </th>
            </tr>
          </thead>

          <tbody>
            {predictions
              .slice(0, limit)
              .map((item, index) => {
                const correct =
                  item.actual === item.predicted;

                const error = Math.abs(
                  item.actual - item.predicted,
                );

                return (
                  <tr
                    key={index}
                    className="border-t border-slate-800/70"
                  >
                    <td className="px-4 py-3 text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-slate-200">
                      {formatNumber(item.actual)}
                    </td>

                    <td className="px-4 py-3 text-slate-200">
                      {formatNumber(item.predicted)}
                    </td>

                    <td className="px-4 py-3">
                      {classification ? (
                        <span
                          className={
                            correct
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }
                        >
                          {correct ? "Yes" : "No"}
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          {formatNumber(error)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {limit < predictions.length && (
        <button
          type="button"
          onClick={() =>
            setLimit((current) =>
              Math.min(current + 12, predictions.length),
            )
          }
          className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:border-violet-500"
        >
          Show More Samples
        </button>
      )}
    </section>
  );
}

export default function EnsembleTrainingPlayback({
  result,
  onStageChange,
}: Props) {
  const progression = result.training_progression;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>(
      result.task === "classification"
        ? "accuracy"
        : "r2",
    );

  const stages = progression?.stages ?? [];
  const currentIndex = Math.min(
    index,
    Math.max(0, stages.length - 1),
  );
  const currentStage = stages[currentIndex];

  const availableMetrics: MetricKey[] =
    result.task === "classification"
      ? ["accuracy", "f1"]
      : ["r2", "mae", "rmse"];

  const metric = availableMetrics.includes(selectedMetric)
    ? selectedMetric
    : availableMetrics[0];

  const chartData = useMemo(
    () =>
      stages.map((stage) => ({
        stage: stage.stage,
        value: metricValue(stage, metric),
      })),
    [stages, metric],
  );

  const hasMultipleStages = stages.length > 1;

  useEffect(() => {
    if (!playing || !hasMultipleStages) return;

    const timer = window.setInterval(() => {
      setIndex((previous) => {
        if (previous >= stages.length - 1) {
          setPlaying(false);
          return previous;
        }

        return previous + 1;
      });
    }, 1800 / speed);

    return () => window.clearInterval(timer);
  }, [playing, speed, stages.length, hasMultipleStages]);

  useEffect(() => {
    if (currentStage) {
      onStageChange?.(currentStage);
    }
    // Parent callback should be stable if supplied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStage]);

  if (!progression || !currentStage) {
    return (
      <section className={card}>
        <div className="flex items-center gap-2">
          <Activity size={21} className="text-violet-400" />
          <h2 className="text-xl font-semibold">
            Training Playback Studio
          </h2>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Training progression data is not available
          in this result. The FastAPI backend needs
          the training progression update from Phase 9.
        </p>
      </section>
    );
  }

  function navigate(nextIndex: number) {
    setPlaying(false);
    setIndex(
      Math.max(
        0,
        Math.min(stages.length - 1, nextIndex),
      ),
    );
  }

  function togglePlay() {
    if (!hasMultipleStages) return;

    if (playing) {
      setPlaying(false);
      return;
    }

    if (currentIndex >= stages.length - 1) {
      setIndex(0);
    }

    setPlaying(true);
  }

  const selectedValue = metricValue(
    currentStage,
    metric,
  );

  const firstValue = metricValue(
    stages[0],
    metric,
  );

  const difference =
    selectedValue !== null && firstValue !== null
      ? selectedValue - firstValue
      : null;

  return (
    <div className="space-y-5">
      <section className={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-400">
              <Activity size={22} />

              <span className="text-xs font-semibold uppercase tracking-widest">
                ModelMind / Real Training Progression
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Ensemble Training Playback
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {displayModel(result.model)}
              {" · "}
              {result.task}
            </p>
          </div>

          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center">
            <p className="text-xs text-violet-200">
              Checkpoint
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {currentIndex + 1} / {stages.length}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-300">
          {progression.description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MetricTile
            label="Active Stage"
            value={String(currentStage.stage)}
            description="Number of fitted stages or learners included in this checkpoint."
          />

          <MetricTile
            label="Full Ensemble"
            value={String(progression.total_stages)}
            description="Total stages represented by the fitted model."
          />

          <MetricTile
            label={metric.toUpperCase()}
            value={formatNumber(selectedValue)}
            description="Held-out test metric at this checkpoint."
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!hasMultipleStages}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {playing ? (
              <Pause size={17} />
            ) : (
              <Play size={17} />
            )}

            {playing ? "Pause" : "Play"}
          </button>

          <button
            type="button"
            onClick={() => navigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            aria-label="Previous checkpoint"
            className="rounded-xl border border-slate-700 p-3 disabled:opacity-35"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={() => navigate(currentIndex + 1)}
            disabled={currentIndex === stages.length - 1}
            aria-label="Next checkpoint"
            className="rounded-xl border border-slate-700 p-3 disabled:opacity-35"
          >
            <ChevronRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => navigate(0)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:border-violet-500"
          >
            <RotateCcw size={16} />
            Restart
          </button>

          <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
            Speed

            <select
              value={speed}
              onChange={(event) =>
                setSpeed(Number(event.target.value))
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={1.5}>1.5×</option>
              <option value={2}>2×</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <input
            type="range"
            min={0}
            max={stages.length - 1}
            step={1}
            value={currentIndex}
            disabled={!hasMultipleStages}
            onChange={(event) =>
              navigate(Number(event.target.value))
            }
            aria-label="Choose training checkpoint"
            className="w-full accent-violet-500 disabled:opacity-40"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>First checkpoint</span>
            <span>Full fitted model</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {stages.map((stage, stageIndex) => (
            <button
              key={stageIndex}
              type="button"
              onClick={() => navigate(stageIndex)}
              title={`Jump to stage ${stage.stage}`}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                stageIndex === currentIndex
                  ? "border-violet-400 bg-violet-500/20 text-violet-200"
                  : "border-slate-700 bg-slate-950 text-slate-400 hover:border-violet-500/50"
              }`}
            >
              {stage.stage}
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp
                size={20}
                className="text-emerald-400"
              />

              <h3 className="text-lg font-bold">
                Performance Across Training Stages
              </h3>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Test-set evaluation at recorded checkpoints
            </p>
          </div>

          <select
            value={metric}
            onChange={(event) =>
              setSelectedMetric(
                event.target.value as MetricKey,
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
            aria-label="Performance metric"
          >
            {availableMetrics.map((key) => (
              <option key={key} value={key}>
                {key.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 h-[310px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 15,
                right: 25,
                left: 5,
                bottom: 10,
              }}
            >
              <CartesianGrid
                stroke="#263246"
                strokeDasharray="4 5"
              />

              <XAxis
                dataKey="stage"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                type="category"
                label={{
                  value: "Training stage",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                width={64}
                domain={["auto", "auto"]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  color: "#f1f5f9",
                }}
                formatter={(value) =>
                  formatNumber(Number(value))
                }
              />

              <Line
                type="linear"
                dataKey="value"
                name={metric.toUpperCase()}
                stroke="#a78bfa"
                strokeWidth={3}
                dot={(props: {
                  cx?: number;
                  cy?: number;
                  index?: number;
                }) => {
                  const selected =
                    props.index === currentIndex;

                  return (
                    <circle
                      key={`point-${props.index}`}
                      cx={props.cx ?? 0}
                      cy={props.cy ?? 0}
                      r={selected ? 7 : 4}
                      fill={selected ? "#34d399" : "#a78bfa"}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 8 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MetricTile
            label="Current Metric"
            value={formatNumber(selectedValue)}
            description={metricDescriptions[metric]}
          />

          <MetricTile
            label="Change from First Checkpoint"
            value={
              difference === null
                ? "N/A"
                : `${difference > 0 ? "+" : ""}${formatNumber(
                    difference,
                  )}`
            }
            description="Current metric minus the first recorded checkpoint. For error metrics, a negative change is an improvement."
          />
        </div>
      </section>

      <StageExplanation
        progression={progression}
        stage={currentStage}
      />

      <PredictionPreview
        key={`${result.model}-${currentStage.stage}`}
        stage={currentStage}
        classification={result.task === "classification"}
      />

      <section className={card}>
        <div className="flex items-start gap-3">
          <BarChart3
            size={20}
            className="mt-1 shrink-0 text-violet-400"
          />

          <div>
            <h3 className="font-semibold">
              How this relates to the 2D/3D charts
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              These checkpoints contain actual test
              predictions and metrics. The existing
              2D/3D visualization currently represents
              the fully trained model.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-violet-300">
              <span>Stage metrics</span>
              <ArrowRight size={14} />
              <span>Prediction checkpoints</span>
              <ArrowRight size={14} />
              <span>Future stage-by-stage surfaces</span>
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-500">
              To animate decision boundaries and 3D
              surfaces across stages, the backend must
              also return spatial prediction grids for
              those stages. We will implement that
              separately rather than inventing visuals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
