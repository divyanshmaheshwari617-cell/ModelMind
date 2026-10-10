
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";
import {
  Activity,
  BarChart3,
  BookOpen,
  GitCompare,
  Info,
  Layers3,
  Shuffle,
} from "lucide-react";

const Plot = dynamic(
  () => import("react-plotly.js"),
  { ssr: false },
);

type ModelKey =
  | "single_tree"
  | "adaboost"
  | "gradient_boosting";

type ImportanceMode =
  | "native"
  | "permutation";

export type FeatureImportanceScore = {
  feature: string;
  importance: number | null;
  std?: number | null;
  rank: number;
};

type ImportanceDetails = {
  available: boolean;
  scores: FeatureImportanceScore[];
  reason?: string | null;
  scoring?: string;
  repeats?: number;
  evaluated_rows?: number;
  total_importance?: number | null;
};

type ImportanceSummary = {
  top_native_feature?: string | null;
  top_permutation_feature?: string | null;
  statements?: string[];
  model_description?: string;
  native_meaning?: string;
  interpretation?: string;
};

export type FeatureImportanceResult = {
  available: boolean;
  model: string;
  task: "classification" | "regression";
  feature_count: number;
  features: string[];
  native: ImportanceDetails;
  permutation: ImportanceDetails;
  summary: ImportanceSummary;
};

type Props = {
  task: "classification" | "regression";
  singleTree?: FeatureImportanceResult;
  adaboost?: FeatureImportanceResult;
  gradientBoosting?: FeatureImportanceResult;
};

const modelNames: Record<ModelKey, string> = {
  single_tree: "Decision Tree",
  adaboost: "AdaBoost",
  gradient_boosting: "Gradient Boosting",
};

const modelColors: Record<ModelKey, string> = {
  single_tree: "#38bdf8",
  adaboost: "#a78bfa",
  gradient_boosting: "#34d399",
};

const panel =
  "min-w-0 rounded-2xl border border-slate-800 bg-[#0b1426] p-5";

const plotHeight = 420;

function numberValue(
  value: number | null | undefined,
): number | null {
  return value != null && Number.isFinite(value)
    ? value
    : null;
}

function format(
  value: number | null | undefined,
  digits = 4,
): string {
  return numberValue(value) == null
    ? "N/A"
    : Number(value).toFixed(digits);
}

function chartLayout(
  xTitle: string,
  height = plotHeight,
): Partial<Layout> {
  return {
    autosize: true,
    height,
    paper_bgcolor: "#0b1426",
    plot_bgcolor: "#0b1426",
    font: {
      color: "#cbd5e1",
      size: 12,
    },
    margin: {
      l: 125,
      r: 35,
      t: 25,
      b: 75,
    },
    xaxis: {
      title: { text: xTitle },
      gridcolor: "#273449",
      zerolinecolor: "#94a3b8",
      zeroline: true,
    },
    yaxis: {
      automargin: true,
      gridcolor: "#273449",
    },
    legend: {
      orientation: "h",
      x: 0,
      y: -0.3,
    },
    hovermode: "closest",
  };
}

function ImportanceChart({
  traces,
  xTitle,
  height = plotHeight,
}: {
  traces: Data[];
  xTitle: string;
  height?: number;
}) {
  return (
    <div
      className="mt-5 w-full min-w-0 overflow-hidden rounded-xl"
      style={{ height }}
    >
      <Plot
        data={traces}
        layout={chartLayout(xTitle, height)}
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

function ValueCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-2 break-words text-lg font-bold text-violet-300">
        {value}
      </p>
      {detail && (
        <p className="mt-2 text-xs leading-6 text-slate-500">
          {detail}
        </p>
      )}
    </div>
  );
}

export default function BoostingFeatureImportanceStudio({
  task,
  singleTree,
  adaboost,
  gradientBoosting,
}: Props) {
  const [model, setModel] =
    useState<ModelKey>("gradient_boosting");

  const [mode, setMode] =
    useState<ImportanceMode>("native");

  const [selectedFeature, setSelectedFeature] =
    useState<string>("");

  const models = useMemo(
    () => ({
      single_tree: singleTree,
      adaboost,
      gradient_boosting: gradientBoosting,
    }),
    [singleTree, adaboost, gradientBoosting],
  );

  const current = models[model];

  const details =
    mode === "native"
      ? current?.native
      : current?.permutation;

  const scores = useMemo(
    () => details?.scores ?? [],
    [details],
  );

  const featureNames = useMemo(() => {
    const all = new Set<string>();

    for (const value of Object.values(models)) {
      for (const name of value?.features ?? []) {
        all.add(name);
      }
    }

    return Array.from(all);
  }, [models]);

  const activeFeature =
    selectedFeature &&
    featureNames.includes(selectedFeature)
      ? selectedFeature
      : featureNames[0] ?? "";

  const selectedScore =
    scores.find(
      (item) => item.feature === activeFeature,
    ) ?? null;

  const sortedScores = useMemo(
    () =>
      [...scores].sort(
        (a, b) =>
          (numberValue(b.importance) ??
            Number.NEGATIVE_INFINITY) -
          (numberValue(a.importance) ??
            Number.NEGATIVE_INFINITY),
      ),
    [scores],
  );

  const graphScores = [...sortedScores].reverse();

  const singleModelTrace: Data[] = [
    {
      type: "bar",
      orientation: "h",
      name:
        mode === "native"
          ? "Native importance"
          : "Permutation score decrease",
      x: graphScores.map(
        (item) => numberValue(item.importance),
      ),
      y: graphScores.map(
        (item) => item.feature,
      ),
      marker: {
        color: graphScores.map((item) =>
          item.feature === activeFeature
            ? "#fbbf24"
            : modelColors[model],
        ),
      },
      hovertemplate:
        "Feature: %{y}<br>" +
        "Importance: %{x:.5f}" +
        "<extra></extra>",
    },
  ];

  const comparisonTraces: Data[] = (
    Object.keys(modelNames) as ModelKey[]
  ).map((key) => {
    const values =
      models[key]?.[mode]?.scores ?? [];

    return {
      type: "bar",
      orientation: "h",
      name: modelNames[key],
      x: featureNames.map((feature) => {
        const found = values.find(
          (item) => item.feature === feature,
        );

        return numberValue(found?.importance);
      }),
      y: featureNames,
      marker: {
        color: modelColors[key],
      },
      hovertemplate:
        "Feature: %{y}<br>" +
        "Importance: %{x:.5f}" +
        "<extra>%{fullData.name}</extra>",
    };
  });

  if (
    !singleTree &&
    !adaboost &&
    !gradientBoosting
  ) {
    return (
      <section className={panel}>
        <h2 className="text-xl font-bold">
          Feature Importance Studio
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          Train the models to explore real feature
          rankings and permutation importance.
        </p>
      </section>
    );
  }

  const topFeature =
    sortedScores.find(
      (item) => item.importance !== null,
    )?.feature ?? "Not available";

  const modeExplanation =
    mode === "native"
      ? "Native importance measures how much the fitted trees reduce their splitting criterion using each feature. These values are usually nonnegative and normalized within each model."
      : "Permutation importance measures the average drop in held-out model score when a feature is shuffled. Positive values indicate a score decrease. Negative values mean shuffling improved the score in this experiment.";

  return (
    <section className="min-w-0 space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <Layers3 size={20} />

          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Explainable Machine Learning
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Feature Importance Studio
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Discover which selected features matter most
          to your fitted models. Compare native
          tree-based importance with held-out permutation
          importance and explore how the rankings differ.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          Object.keys(modelNames) as ModelKey[]
        ).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setModel(key)}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              model === key
                ? "bg-violet-600"
                : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-violet-500"
            }`}
          >
            {modelNames[key]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("native")}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            mode === "native"
              ? "bg-sky-600"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          <BarChart3 size={17} />
          Native Importance
        </button>

        <button
          type="button"
          onClick={() => setMode("permutation")}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            mode === "permutation"
              ? "bg-sky-600"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          <Shuffle size={17} />
          Permutation Importance
        </button>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <div className="flex items-center gap-2 text-sky-300">
          <Info size={17} />
          <h3 className="text-sm font-bold">
            What are we measuring?
          </h3>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {modeExplanation}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ValueCard
          title="Selected model"
          value={modelNames[model]}
        />

        <ValueCard
          title="Top ranked feature"
          value={topFeature}
        />

        <ValueCard
          title="Selected features"
          value={String(current?.feature_count ?? 0)}
        />
      </div>

      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Activity
                size={19}
                className="text-violet-300"
              />
              {mode === "native"
                ? "Native Feature Importance"
                : "Permutation Score Changes"}
            </h3>

            <p className="mt-2 text-xs leading-6 text-slate-400">
              Actual values from the selected fitted model.
            </p>
          </div>

          <label className="text-xs text-slate-300">
            Explore feature
            <select
              value={activeFeature}
              onChange={(event) =>
                setSelectedFeature(event.target.value)
              }
              className="mt-2 block max-w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
            >
              {featureNames.map((feature) => (
                <option
                  key={feature}
                  value={feature}
                >
                  {feature}
                </option>
              ))}
            </select>
          </label>
        </div>

        {details?.available && scores.length ? (
          <>
            <ImportanceChart
              traces={singleModelTrace}
              xTitle={
                mode === "native"
                  ? "Normalized tree importance"
                  : `Mean decrease in ${
                      task === "classification"
                        ? "accuracy"
                        : "R²"
                    }`
              }
              height={Math.max(
                400,
                Math.min(
                  850,
                  scores.length * 35 + 160,
                ),
              )}
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ValueCard
                title="Selected feature"
                value={activeFeature}
              />

              <ValueCard
                title="Importance value"
                value={format(
                  selectedScore?.importance,
                )}
              />

              <ValueCard
                title="Importance rank"
                value={
                  selectedScore?.rank != null
                    ? `#${selectedScore.rank}`
                    : "N/A"
                }
              />
            </div>

            {mode === "permutation" && (
              <p className="mt-4 text-xs leading-6 text-slate-400">
                Evaluation uses{" "}
                {details.evaluated_rows ?? "available"}{" "}
                held-out rows and{" "}
                {details.repeats ?? "multiple"}{" "}
                permutations per feature.
                The displayed importance is a score change,
                not a percentage.
                {selectedScore?.std != null &&
                  ` Selected feature standard deviation: ${format(
                    selectedScore.std,
                  )}.`}
              </p>
            )}
          </>
        ) : (
          <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-200">
            {details?.reason ??
              "Importance data is unavailable for this model."}
          </p>
        )}
      </div>

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <GitCompare
            size={19}
            className="text-emerald-300"
          />
          Three-Model Feature Comparison
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Compare the same selected features across
          Decision Tree, AdaBoost, and Gradient Boosting.
          The values are computed separately for each
          fitted model.
        </p>

        {featureNames.length > 0 ? (
          <ImportanceChart
            traces={comparisonTraces}
            xTitle={
              mode === "native"
                ? "Native feature importance"
                : `Held-out ${
                    task === "classification"
                      ? "accuracy"
                      : "R²"
                  } decrease`
            }
            height={Math.max(
              430,
              Math.min(
                900,
                featureNames.length * 43 + 190,
              ),
            )}
          />
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No feature data is available.
          </p>
        )}

        <p className="mt-3 text-xs leading-6 text-slate-500">
          Native importance is normalized independently
          for each model. Permutation values use a
          common held-out scoring rule, but correlated
          features and evaluation variation can affect
          the rankings.
        </p>
      </div>

      <div className={panel}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <BarChart3
            size={19}
            className="text-sky-300"
          />
          Ranked Feature Table
        </h3>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="p-3">Rank</th>
                <th className="p-3">Feature</th>
                <th className="p-3">Importance</th>
                <th className="p-3">
                  {mode === "permutation"
                    ? "Std. deviation"
                    : "Method"}
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedScores.map((item) => (
                <tr
                  key={item.feature}
                  className={`border-b border-slate-800 ${
                    item.feature === activeFeature
                      ? "bg-violet-500/10"
                      : ""
                  }`}
                >
                  <td className="p-3 font-mono text-violet-300">
                    #{item.rank}
                  </td>

                  <td className="p-3 break-all">
                    {item.feature}
                  </td>

                  <td className="p-3 font-mono">
                    {format(item.importance)}
                  </td>

                  <td className="p-3 font-mono text-slate-400">
                    {mode === "permutation"
                      ? format(item.std)
                      : "Tree-based"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-sky-300">
          <BookOpen size={19} />
          Interpretation and Limitations
        </h3>

        {current?.summary?.model_description && (
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {current.summary.model_description}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {(current?.summary?.statements ?? []).map(
            (statement, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <Info
                  size={17}
                  className="mt-1 shrink-0 text-violet-300"
                />

                <p className="text-sm leading-7 text-slate-300">
                  {statement}
                </p>
              </div>
            ),
          )}
        </div>

        <p className="mt-5 text-xs leading-7 text-slate-400">
          Feature importance describes the fitted model,
          not causation. Features may receive low
          permutation importance when their information
          is duplicated by correlated features.
          These results should be interpreted alongside
          test performance and domain knowledge.
        </p>
      </div>
    </section>
  );
}
