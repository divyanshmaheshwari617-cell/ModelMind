
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  GitCompare,
  Info,
  Layers3,
} from "lucide-react";

export type BaggingDiversityResult = {
  task: "classification" | "regression";
  total_learners: number;
  inspected_learners: number;
  test_rows: number;
  diversity_metric: string;
  average_diversity: number | null;
  ensemble_predictions: number[];
  learners: {
    learner: number;
    agreement_with_ensemble: number | null;
    mean_absolute_difference: number | null;
    predictions: number[];
  }[];
  pairwise: {
    learner_a: number;
    learner_b: number;
    disagreement_rate: number | null;
    correlation: number | null;
    normalized_difference?: number | null;
  }[];
};

type Props = {
  data: BaggingDiversityResult;
};

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/85 p-5";

function fmt(value: number | null | undefined, digits = 3) {
  return value == null || !Number.isFinite(value)
    ? "N/A"
    : value.toFixed(digits);
}

function heatColor(value: number | null, max: number) {
  if (value === null || !Number.isFinite(value)) {
    return "rgba(71,85,105,.35)";
  }

  const intensity = Math.max(
    0.08,
    Math.min(0.85, value / Math.max(max, 1e-8)),
  );

  return `rgba(139,92,246,${intensity})`;
}

export default function BaggingDiversityStudio({
  data,
}: Props) {
  const [selected, setSelected] = useState(0);
  const [showPredictions, setShowPredictions] = useState(true);

  const learner =
    data.learners[
      Math.min(selected, Math.max(0, data.learners.length - 1))
    ];

  const isClassification = data.task === "classification";

  const matrix = useMemo(() => {
    const count = data.learners.length;
    const values: (number | null)[][] = Array.from(
      { length: count },
      () => Array<number | null>(count).fill(null),
    );

    for (let i = 0; i < count; i++) {
      values[i][i] = isClassification ? 0 : 1;
    }

    for (const pair of data.pairwise) {
      const i = pair.learner_a - 1;
      const j = pair.learner_b - 1;

      if (i < 0 || j < 0 || i >= count || j >= count) {
        continue;
      }

      const value = isClassification
        ? pair.disagreement_rate
        : pair.correlation;

      values[i][j] = value;
      values[j][i] = value;
    }

    return values;
  }, [data, isClassification]);

  const maxDifference = useMemo(() => {
    const values = data.pairwise
      .map((pair) =>
        isClassification
          ? pair.disagreement_rate
          : pair.correlation,
      )
      .filter(
        (value): value is number =>
          value !== null && Number.isFinite(value),
      );

    return Math.max(
      1,
      ...values.map((value) => Math.abs(value)),
    );
  }, [data, isClassification]);

  if (!learner) {
    return (
      <section className={panel}>
        <p className="text-sm text-slate-400">
          Train a Bagging model to inspect learner diversity.
        </p>
      </section>
    );
  }

  const previewCount = Math.min(
    learner.predictions.length,
    data.ensemble_predictions.length,
  );

  const disagreementCount = isClassification
    ? Array.from({ length: previewCount }).filter(
        (_, i) =>
          learner.predictions[i] !==
          data.ensemble_predictions[i],
      ).length
    : null;

  return (
    <div className="space-y-5 text-slate-100">
      <section className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Actual Fitted Learners
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Bagging Model Diversity Studio
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Bagging trains several models on different sampled
          datasets. Explore how their predictions differ,
          how often they agree, and how individual learners
          compare with the complete ensemble.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Fitted Learners",
            value: String(data.total_learners),
          },
          {
            label: "Learners Inspected",
            value: String(data.inspected_learners),
          },
          {
            label: "Average Pairwise Diversity",
            value: fmt(data.average_diversity),
          },
        ].map((item) => (
          <div key={item.label} className={panel}>
            <p className="text-xs text-slate-400">
              {item.label}
            </p>
            <p className="mt-3 text-2xl font-bold text-violet-300">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={panel}>
          <div className="flex items-center gap-2">
            <Layers3 size={20} className="text-sky-400" />
            <h3 className="text-xl font-bold">
              Select a Base Learner
            </h3>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Select one of the first {data.inspected_learners}
            {" "}fitted learners to inspect its predictions.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {data.learners.map((item, index) => (
              <button
                key={item.learner}
                type="button"
                onClick={() => setSelected(index)}
                aria-pressed={selected === index}
                className={`rounded-xl border px-3 py-4 text-sm font-bold transition ${
                  selected === index
                    ? "border-violet-400 bg-violet-500/20 text-violet-200"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-violet-500"
                }`}
              >
                {item.learner}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h4 className="font-bold text-violet-300">
              Learner {learner.learner}
            </h4>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">
                  {isClassification
                    ? "Agreement With Ensemble"
                    : "Mean Absolute Difference"}
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {fmt(
                    isClassification
                      ? learner.agreement_with_ensemble
                      : learner.mean_absolute_difference,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Test Samples
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {data.test_rows}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 font-bold">
              <GitCompare size={19} className="text-emerald-400" />
              Predictions vs Ensemble
            </h4>

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showPredictions}
                onChange={(event) =>
                  setShowPredictions(event.target.checked)
                }
                className="accent-violet-500"
              />
              Show predictions
            </label>
          </div>

          {showPredictions && (
            <>
              <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-slate-800">
                <table className="w-full min-w-[340px] text-left text-xs">
                  <thead className="sticky top-0 bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-3">Test Row</th>
                      <th className="p-3">Learner</th>
                      <th className="p-3">Ensemble</th>
                      <th className="p-3">Difference</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.from(
                      { length: previewCount },
                      (_, index) => {
                        const individual =
                          learner.predictions[index];
                        const ensemble =
                          data.ensemble_predictions[index];

                        const different = isClassification
                          ? individual !== ensemble
                          : Math.abs(individual - ensemble) >
                            1e-9;

                        return (
                          <tr
                            key={index}
                            className="border-t border-slate-800"
                          >
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-mono">
                              {fmt(individual)}
                            </td>
                            <td className="p-3 font-mono">
                              {fmt(ensemble)}
                            </td>
                            <td
                              className={`p-3 ${
                                different
                                  ? "text-amber-300"
                                  : "text-emerald-300"
                              }`}
                            >
                              {isClassification
                                ? different
                                  ? "Disagree"
                                  : "Agree"
                                : fmt(
                                    Math.abs(
                                      individual - ensemble,
                                    ),
                                  )}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              {isClassification && (
                <p className="mt-3 text-xs text-slate-400">
                  Learner and ensemble disagree on{" "}
                  {disagreementCount} of the first{" "}
                  {previewCount} displayed test predictions.
                </p>
              )}
            </>
          )}
        </section>

        <aside className="space-y-5">
          <section className={panel}>
            <div className="flex items-center gap-2">
              <BarChart3 size={19} className="text-violet-400" />
              <h3 className="font-bold">
                Learner Diversity Heatmap
              </h3>
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-400">
              {isClassification
                ? "Cell values show the fraction of test predictions on which two learners disagree."
                : "Cell values show Pearson correlation between two learners' numeric test predictions."}
            </p>

            <div className="mt-5 overflow-x-auto">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `28px repeat(${matrix.length}, minmax(27px, 1fr))`,
                  minWidth: `${28 + matrix.length * 28}px`,
                }}
              >
                <span />

                {data.learners.map((item) => (
                  <span
                    key={`top-${item.learner}`}
                    className="text-center text-[10px] text-slate-500"
                  >
                    {item.learner}
                  </span>
                ))}

                {matrix.map((row, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    className="contents"
                  >
                    <span className="flex items-center justify-center text-[10px] text-slate-500">
                      {rowIndex + 1}
                    </span>

                    {row.map((value, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        title={`Learner ${rowIndex + 1} vs ${colIndex + 1}: ${fmt(value)}`}
                        className="flex h-8 items-center justify-center rounded text-[9px] text-white"
                        style={{
                          backgroundColor:
                            rowIndex === colIndex
                              ? "#334155"
                              : isClassification
                                ? heatColor(value, maxDifference)
                                : value == null
                                  ? "#334155"
                                  : value >= 0
                                    ? `rgba(139,92,246,${Math.max(0.12, Math.abs(value) * 0.85)})`
                                    : `rgba(245,158,11,${Math.max(0.12, Math.abs(value) * 0.85)})`,
                        }}
                      >
                        {value == null
                          ? "—"
                          : fmt(value, 2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              {isClassification
                ? "Higher disagreement means more different class predictions, not necessarily better performance."
                : "High positive correlation means learners produce similar prediction patterns. Negative correlation indicates opposing patterns."}
            </p>
          </section>

          <section className={panel}>
            <div className="flex items-center gap-2">
              <Activity size={19} className="text-sky-400" />
              <h3 className="font-bold">
                What Does Diversity Mean?
              </h3>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Bagging introduces variation by training base
              learners on different sampled observations.
              Each model can learn slightly different
              decision boundaries or prediction functions.
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Averaging or combining sufficiently useful
              learners can reduce prediction instability.
              However, diversity alone does not guarantee
              a better ensemble.
            </p>
          </section>
        </aside>
      </div>

      <section className={panel}>
        <div className="flex items-start gap-3">
          <Info
            size={19}
            className="mt-1 shrink-0 text-sky-400"
          />
          <div>
            <h3 className="font-bold">
              About These Measurements
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              All displayed predictions originate from
              actual fitted Bagging estimators. Pairwise
              statistics use the full held-out test set.
              The prediction table previews the first 50
              test rows, and the heatmap examines up to
              12 base learners.
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              For regression, the average diversity statistic
              is the mean absolute pairwise prediction
              difference normalized by the ensemble prediction
              standard deviation. The heatmap instead shows
              pairwise correlation. These are distinct measures.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
