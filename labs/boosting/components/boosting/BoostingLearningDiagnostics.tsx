
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";
import {
  Activity,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Info,
  Layers3,
  TrendingDown,
} from "lucide-react";

const Plot = dynamic(
  () => import("react-plotly.js"),
  { ssr: false },
);

type ModelKey = "adaboost" | "gradient_boosting";
type Task = "classification" | "regression";

type AdaLearner = {
  stage: number;
  estimator_weight: number | null;
  estimator_error: number | null;
};

type GradientStage = {
  stage: number;
  accuracy?: number | null;
  log_loss?: number | null;
  mean_probability_error?: number | null;
  mae?: number | null;
  rmse?: number | null;
  mean_absolute_residual?: number | null;
  true_values?: (number | null)[];
  predicted_values?: (number | null)[];
  residuals?: (number | null)[];
  true_labels?: (number | null)[];
  predicted_labels?: (number | null)[];
  true_class_probabilities?: (number | null)[];
  probability_errors?: (number | null)[];
};

export type LearningDiagnostics = {
  type: string;
  note?: string;
  learner_count?: number;
  learners?: AdaLearner[];
  stage_count?: number;
  stages?: GradientStage[];
};

type Props = {
  task: Task;
  adaboost: LearningDiagnostics | undefined;
  gradientBoosting: LearningDiagnostics | undefined;
  playbackModel?: ModelKey | null;
  playbackStage?: number | null;
};

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#0b1426] p-5";

const plotBackground = "#0b1426";

function format(value?: number | null, digits = 4) {
  return value == null || !Number.isFinite(value)
    ? "N/A"
    : value.toFixed(digits);
}

function getNumber(value?: number | null): number | null {
  return value != null && Number.isFinite(value)
    ? value
    : null;
}

function baseLayout(height = 370): Partial<Layout> {
  return {
    autosize: true,
    height,
    paper_bgcolor: plotBackground,
    plot_bgcolor: plotBackground,
    font: {
      color: "#cbd5e1",
      size: 12,
    },
    margin: {
      l: 65,
      r: 25,
      t: 35,
      b: 60,
    },
    xaxis: {
      title: { text: "Boosting stage" },
      gridcolor: "#263449",
      zerolinecolor: "#334155",
    },
    yaxis: {
      gridcolor: "#263449",
      zerolinecolor: "#334155",
    },
    legend: {
      orientation: "h",
      x: 0,
      y: -0.28,
    },
    hovermode: "closest",
  };
}

function DiagnosticChart({
  data,
  layout,
  height = 370,
}: {
  data: Data[];
  layout: Partial<Layout>;
  height?: number;
}) {
  return (
    <div
      className="mt-4 w-full min-w-0 overflow-hidden rounded-xl"
      style={{ height }}
    >
      <Plot
        data={data}
        layout={{
          ...layout,
          height,
        }}
        config={{
          responsive: true,
          displaylogo: false,
          displayModeBar: true,
          scrollZoom: true,
        }}
        style={{
          width: "100%",
          height,
        }}
        useResizeHandler
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-violet-300">
        {value}
      </p>
      {description && (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function BoostingLearningDiagnostics({
  task,
  adaboost,
  gradientBoosting,
  playbackModel = null,
  playbackStage = null,
}: Props) {
  const [model, setModel] =
    useState<ModelKey>("gradient_boosting");

  const [selectedStage, setSelectedStage] =
    useState<number | null>(null);

  const adaLearners = useMemo(
    () => adaboost?.learners ?? [],
    [adaboost],
  );

  const gradientStages = useMemo(
    () => gradientBoosting?.stages ?? [],
    [gradientBoosting],
  );

  useEffect(() => {
    if (
      playbackModel &&
      playbackStage != null
    ) {
      setModel(playbackModel);
      setSelectedStage(playbackStage);
    }
  }, [playbackModel, playbackStage]);

  const availableStages =
    model === "adaboost"
      ? adaLearners.map((item) => item.stage)
      : gradientStages.map((item) => item.stage);

  const activeStage =
    selectedStage != null &&
    availableStages.includes(selectedStage)
      ? selectedStage
      : availableStages[availableStages.length - 1] ?? 1;

  const activeLearner =
    adaLearners.find(
      (item) => item.stage === activeStage,
    ) ?? null;

  const activeGradientStage =
    gradientStages.find(
      (item) => item.stage === activeStage,
    ) ?? null;

  const currentDiagnostics =
    model === "adaboost"
      ? adaboost
      : gradientBoosting;

  function selectModel(next: ModelKey) {
    setModel(next);
    setSelectedStage(null);
  }

  const adaWeights: Data[] = [
    {
      type: "bar",
      name: "Estimator weight",
      x: adaLearners.map((item) => item.stage),
      y: adaLearners.map(
        (item) => item.estimator_weight,
      ),
      marker: {
        color: adaLearners.map((item) =>
          item.stage === activeStage
            ? "#38bdf8"
            : "#8b5cf6",
        ),
      },
      hovertemplate:
        "Learner %{x}<br>Weight: %{y:.4f}<extra></extra>",
    },
  ];

  const adaErrors: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Estimator error",
      x: adaLearners.map((item) => item.stage),
      y: adaLearners.map(
        (item) => item.estimator_error,
      ),
      line: {
        color: "#fb923c",
        width: 3,
      },
      marker: {
        size: 7,
        color: adaLearners.map((item) =>
          item.stage === activeStage
            ? "#38bdf8"
            : "#fb923c",
        ),
      },
      hovertemplate:
        "Learner %{x}<br>Error: %{y:.4f}<extra></extra>",
    },
  ];

  
  const gradientHistory: Data[] =
    task === "regression"
      ? [
          {
            type: "scatter",
            mode: "lines+markers",
            name: "Training MAE",
            x: gradientStages.map(
              (item) => item.stage,
            ),
            y: gradientStages.map(
              (item) => getNumber(item.mae),
            ),
            line: {
              color: "#8b5cf6",
              width: 3,
            },
          },
          {
            type: "scatter",
            mode: "lines+markers",
            name: "Training RMSE",
            x: gradientStages.map(
              (item) => item.stage,
            ),
            y: gradientStages.map(
              (item) => getNumber(item.rmse),
            ),
            line: {
              color: "#38bdf8",
              width: 3,
            },
          },
        ]
      : [
          {
            type: "scatter",
            mode: "lines+markers",
            name: "Training log loss",
            x: gradientStages.map(
              (item) => item.stage,
            ),
            y: gradientStages.map(
              (item) => getNumber(item.log_loss),
            ),
            line: {
              color: "#fb923c",
              width: 3,
            },
          },
          {
            type: "scatter",
            mode: "lines+markers",
            name: "Mean probability error",
            x: gradientStages.map(
              (item) => item.stage,
            ),
            y: gradientStages.map(
              (item) =>
                getNumber(item.mean_probability_error),
            ),
            line: {
              color: "#38bdf8",
              width: 3,
            },
          },
        ];


  const previewTrace: Data =
    task === "regression"
      ? {
          type: "scatter",
          mode: "markers",
          name: "Regression residual",
          x:
            activeGradientStage?.predicted_values ?? [],
          y:
            activeGradientStage?.residuals ?? [],
          marker: {
            size: 9,
            color: "#8b5cf6",
            opacity: 0.85,
            line: {
              color: "#c4b5fd",
              width: 1,
            },
          },
          hovertemplate:
            "Prediction: %{x:.3f}<br>" +
            "Residual: %{y:.3f}<extra></extra>",
        }
      : {
          type: "scatter",
          mode: "markers",
          name: "True-class probability",
          x: (
            activeGradientStage
              ?.true_class_probabilities ?? []
          ).map((_, index) => index + 1),
          y:
            activeGradientStage
              ?.true_class_probabilities ?? [],
          marker: {
            size: 9,
            color: "#38bdf8",
            opacity: 0.85,
          },
          hovertemplate:
            "Preview row %{x}<br>" +
            "True-class probability: %{y:.3f}" +
            "<extra></extra>",
        };

  if (
    adaLearners.length === 0 &&
    gradientStages.length === 0
  ) {
    return (
      <section className={panel}>
        <h2 className="text-xl font-bold">
          Boosting Learning Diagnostics
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Train the models to display real fitted
          learner statistics and learning curves.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Explainable Boosting
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          How Boosting Learns
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Inspect the real learning statistics of
          AdaBoost and Gradient Boosting, explore
          individual stages, and understand what
          changes as learners are added.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectModel("adaboost")}
          className={`rounded-xl px-5 py-3 text-sm font-semibold ${
            model === "adaboost"
              ? "bg-violet-600"
              : "border border-slate-700 bg-slate-950 text-slate-300"
          }`}
        >
          AdaBoost
        </button>

        <button
          type="button"
          onClick={() =>
            selectModel("gradient_boosting")
          }
          className={`rounded-xl px-5 py-3 text-sm font-semibold ${
            model === "gradient_boosting"
              ? "bg-violet-600"
              : "border border-slate-700 bg-slate-950 text-slate-300"
          }`}
        >
          Gradient Boosting
        </button>
      </div>

      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              <Layers3
                size={18}
                className="text-sky-300"
              />
              Learning Stage Explorer
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              Select a fitted learner or boosting stage.
            </p>
          </div>

          <span className="rounded-lg bg-violet-500/15 px-4 py-2 font-mono text-sm text-violet-300">
            Stage {activeStage} /{" "}
            {availableStages[
              availableStages.length - 1
            ] ?? 0}
          </span>
        </div>

        {availableStages.length > 0 && (
          <>
            <input
              type="range"
              min={0}
              max={availableStages.length - 1}
              value={Math.max(
                0,
                availableStages.indexOf(activeStage),
              )}
              onChange={(event) => {
                const index = Number(
                  event.target.value,
                );

                setSelectedStage(
                  availableStages[index],
                );
              }}
              className="mt-6 w-full accent-violet-500"
              aria-label="Learning diagnostics stage"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>
                Stage {availableStages[0]}
              </span>
              <span>
                Final stage{" "}
                {availableStages[
                  availableStages.length - 1
                ]}
              </span>
            </div>
          </>
        )}

        <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-slate-400">
          <Info
            size={16}
            className="mt-1 shrink-0 text-sky-300"
          />
          The existing Playback Studio can select a
          matching stage here. This diagnostics slider
          also works independently.
        </p>
      </div>

      {model === "adaboost" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Fitted learners"
              value={String(adaLearners.length)}
            />
            <MetricCard
              label="Selected estimator weight"
              value={format(
                activeLearner?.estimator_weight,
              )}
            />
            <MetricCard
              label="Selected estimator error"
              value={format(
                activeLearner?.estimator_error,
              )}
            />
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-2">
            <div className={panel}>
              <h3 className="flex items-center gap-2 font-bold">
                <BarChart3
                  size={19}
                  className="text-violet-300"
                />
                Learner Weights
              </h3>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                These are the recorded weights of
                individual fitted estimators.
              </p>

              <DiagnosticChart
                data={adaWeights}
                layout={{
                  ...baseLayout(),
                  yaxis: {
                    title: {
                      text: "Estimator weight",
                    },
                    gridcolor: "#263449",
                  },
                }}
              />
            </div>

            <div className={panel}>
              <h3 className="flex items-center gap-2 font-bold">
                <Activity
                  size={19}
                  className="text-orange-300"
                />
                Learner Errors
              </h3>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                Inspect the actual errors scikit-learn
                recorded for successive estimators.
              </p>

              <DiagnosticChart
                data={adaErrors}
                layout={{
                  ...baseLayout(),
                  yaxis: {
                    title: {
                      text: "Estimator error",
                    },
                    gridcolor: "#263449",
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
            <h3 className="flex items-center gap-2 font-bold text-sky-300">
              <BookOpen size={18} />
              Understanding AdaBoost
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              AdaBoost builds estimators sequentially.
              In classification, it adjusts training
              sample weights so that harder observations
              receive more attention in later rounds.
              The ensemble combines its learners using
              the fitted AdaBoost procedure.
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              The graphs above display estimator-level
              statistics recorded during training.
              They are not a visualization of individual
              sample weights.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Fitted boosting stages"
              value={String(gradientStages.length)}
            />

            {task === "regression" ? (
              <>
                <MetricCard
                  label="Training MAE"
                  value={format(
                    activeGradientStage?.mae,
                  )}
                />

                <MetricCard
                  label="Training RMSE"
                  value={format(
                    activeGradientStage?.rmse,
                  )}
                />
              </>
            ) : (
              <>
                <MetricCard
                  label="Training accuracy"
                  value={format(
                    activeGradientStage?.accuracy,
                  )}
                />

                <MetricCard
                  label="Training log loss"
                  value={format(
                    activeGradientStage?.log_loss,
                  )}
                />
              </>
            )}
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-2">
            <div className={panel}>
              <h3 className="flex items-center gap-2 font-bold">
                <TrendingDown
                  size={19}
                  className="text-emerald-300"
                />
                Learning Curve
              </h3>

              <p className="mt-3 text-xs leading-6 text-slate-400">
                {task === "regression"
                  ? "Training MAE and RMSE as boosting stages are added."
                  : "Training log loss and mean probability error across fitted stages."}
              </p>

              <DiagnosticChart
                data={gradientHistory}
                layout={{
                  ...baseLayout(),
                  yaxis: {
                    title: {
                      text:
                        task === "regression"
                          ? "Prediction error"
                          : "Loss / probability error",
                    },
                    gridcolor: "#263449",
                  },
                }}
              />
            </div>

            <div className={panel}>
              <h3 className="flex items-center gap-2 font-bold">
                <BarChart3
                  size={19}
                  className="text-sky-300"
                />
                {task === "regression"
                  ? "Residual Explorer"
                  : "True-Class Probability Explorer"}
              </h3>

              <p className="mt-3 text-xs leading-6 text-slate-400">
                {task === "regression"
                  ? "Actual training residuals for the selected boosting stage."
                  : "The predicted probability assigned to each preview observation's true class."}
              </p>

              <DiagnosticChart
                data={
                  task === "regression"
                    ? [
                        previewTrace,
                        {
                          type: "scatter",
                          mode: "lines",
                          name: "Zero residual",
                          x: [
                            Math.min(
                              ...(
                                activeGradientStage
                                  ?.predicted_values ?? []
                              ).filter(
                                (v): v is number =>
                                  getNumber(v) !== null,
                              ),
                            ),
                            Math.max(
                              ...(
                                activeGradientStage
                                  ?.predicted_values ?? []
                              ).filter(
                                (v): v is number =>
                                  getNumber(v) !== null,
                              ),
                            ),
                          ],
                          y: [0, 0],
                          line: {
                            color: "#64748b",
                            dash: "dash",
                          },
                        },
                      ]
                    : [previewTrace]
                }
                layout={{
                  ...baseLayout(),
                  xaxis: {
                    title: {
                      text:
                        task === "regression"
                          ? "Predicted target"
                          : "Training preview row",
                    },
                    gridcolor: "#263449",
                  },
                  yaxis: {
                    title: {
                      text:
                        task === "regression"
                          ? "Actual − predicted"
                          : "True-class probability",
                    },
                    gridcolor: "#263449",
                    ...(task === "classification"
                      ? {
                          range: [0, 1],
                        }
                      : {}),
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
            <h3 className="flex items-center gap-2 font-bold text-sky-300">
              <BookOpen size={18} />
              Understanding Gradient Boosting
            </h3>

            {task === "regression" ? (
              <>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Gradient Boosting adds new trees that
                  correct the current ensemble according
                  to the negative gradient of its loss
                  function.
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  In squared-error regression, this
                  correction is related to the residual:
                  actual target minus predicted target.
                  The residual plot shows which observations
                  remain difficult at the selected stage.
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Classification Gradient Boosting
                  progressively improves class scores
                  by optimizing a differentiable loss.
                  Log loss measures how well predicted
                  probabilities agree with the true classes.
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  The probability explorer shows model
                  confidence assigned to the correct
                  class. These probability values are
                  educational diagnostics, not the
                  exact negative gradients used internally.
                </p>
              </>
            )}
          </div>
        </>
      )}

      {currentDiagnostics?.note && (
        <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-400">
          {currentDiagnostics.note}
        </p>
      )}
    </section>
  );
}
