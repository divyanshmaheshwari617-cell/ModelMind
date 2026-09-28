import { useMemo } from "react";

import type {
  NumericRow,
  TrainedMultipleRegressionModel,
} from "../types/dataset";

import {
  calculateFeatureCorrelations,
} from "../utils/regressionMath";

interface MulticollinearityExplanationProps {
  rows: NumericRow[];
  model: TrainedMultipleRegressionModel;
}

type CorrelationLevel =
  | "low"
  | "moderate"
  | "strong"
  | "very-strong";

interface CorrelationItem {
  featureA: string;
  featureB: string;
  correlation: number;
  absoluteCorrelation: number;
  level: CorrelationLevel;
}

export default function MulticollinearityExplanation({
  rows,
  model,
}: MulticollinearityExplanationProps) {
  /*
  |--------------------------------------------------------------------------
  | Calculate correlations directly from the dataset
  |--------------------------------------------------------------------------
  |
  | Correlations belong to the dataset analysis.
  | They are not stored inside TrainedMultipleRegressionModel.
  |
  */

  const correlations =
    useMemo<CorrelationItem[]>(() => {
      const calculated =
        calculateFeatureCorrelations(
          rows,
          model.featureNames,
        );

      return calculated
        .filter((pair) =>
          Number.isFinite(
            pair.correlation,
          ),
        )
        .map((pair) => {
          const absoluteCorrelation =
            Math.abs(
              pair.correlation,
            );

          return {
            featureA:
              pair.featureA,

            featureB:
              pair.featureB,

            correlation:
              pair.correlation,

            absoluteCorrelation,

            level:
              getCorrelationLevel(
                absoluteCorrelation,
              ),
          };
        })
        .sort(
          (a, b) =>
            b.absoluteCorrelation -
            a.absoluteCorrelation,
        );
    }, [rows, model.featureNames]);

  const strongestPair =
    correlations[0] ?? null;

  const strongPairs =
    correlations.filter(
      (pair) =>
        pair.absoluteCorrelation >=
        0.85,
    );

  const veryStrongPairs =
    correlations.filter(
      (pair) =>
        pair.absoluteCorrelation >=
        0.98,
    );

  const overallStatus =
    getOverallStatus(
      correlations,
    );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
          Predictor Diagnostics
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Multicollinearity
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Multiple Linear Regression
          works best when predictors do
          not contain excessive
          overlapping linear
          information. ModelMind checks
          pairwise feature correlations
          to help identify possible
          multicollinearity concerns.
        </p>
      </div>

      {/* THEORY */}

      <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="font-bold text-violet-300">
          What is multicollinearity?
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Multicollinearity occurs when
          predictors are strongly
          linearly related to one
          another. When features
          contain very similar
          information, it becomes more
          difficult for the regression
          model to separate their
          individual coefficient
          effects.
        </p>
      </div>

      {/* STATUS */}

      <div
        className={[
          "mt-5 rounded-2xl border p-5",
          overallStatus.className,
        ].join(" ")}
      >
        <p className="text-xs font-bold uppercase tracking-wider">
          Dataset Diagnostic
        </p>

        <p className="mt-2 text-xl font-black">
          {overallStatus.title}
        </p>

        <p className="mt-2 text-sm leading-6 opacity-90">
          {overallStatus.description}
        </p>
      </div>

      {/* SUMMARY */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Features"
          value={String(
            model.featureNames.length,
          )}
          description="Predictors in model"
        />

        <SummaryCard
          label="Feature Pairs"
          value={String(
            correlations.length,
          )}
          description="Pairwise checks"
        />

        <SummaryCard
          label="Strong Pairs"
          value={String(
            strongPairs.length,
          )}
          description="|r| ≥ 0.85"
        />

        <SummaryCard
          label="Very Strong"
          value={String(
            veryStrongPairs.length,
          )}
          description="|r| ≥ 0.98"
        />
      </div>

      {/* STRONGEST PAIR */}

      {strongestPair && (
        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Strongest Pairwise
            Relationship
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <FeatureBadge
              name={
                strongestPair.featureA
              }
            />

            <span className="font-bold text-slate-500">
              ↔
            </span>

            <FeatureBadge
              name={
                strongestPair.featureB
              }
            />
          </div>

          <p className="mt-4 font-mono text-2xl font-black text-white">
            r ={" "}
            {formatNumber(
              strongestPair.correlation,
            )}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            This is the largest
            absolute pairwise
            correlation among the
            selected predictors.
          </p>
        </div>
      )}

      {/* NO CORRELATIONS */}

      {correlations.length === 0 && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="font-bold text-white">
            No pairwise correlations
            available
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            At least two valid
            numerical predictors are
            required to examine
            pairwise relationships.
          </p>
        </div>
      )}

      {/* PAIRWISE CORRELATIONS */}

      {correlations.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Pairwise Correlations
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Sorted from strongest
                to weakest absolute
                correlation.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Range: −1 to +1
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {correlations.map(
              (pair) => (
                <CorrelationCard
                  key={`${pair.featureA}-${pair.featureB}`}
                  pair={pair}
                />
              ),
            )}
          </div>
        </div>
      )}

      {/* SCALE */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-bold text-white">
          How ModelMind reads |r|
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScaleCard
            range="< 0.50"
            label="Lower"
            description="No strong pairwise linear relationship detected."
          />

          <ScaleCard
            range="0.50 – 0.84"
            label="Moderate"
            description="Some linear relationship is present."
          />

          <ScaleCard
            range="0.85 – 0.97"
            label="Strong"
            description="Investigate possible overlapping predictor information."
          />

          <ScaleCard
            range="≥ 0.98"
            label="Very Strong"
            description="Potentially severe pairwise redundancy."
          />
        </div>
      </div>

      {/* WHY IT MATTERS */}

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Why Does It Matter?
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ImpactCard
            number="01"
            title="Coefficient instability"
            text="Small changes in the dataset can sometimes produce noticeably different individual coefficient estimates."
          />

          <ImpactCard
            number="02"
            title="Harder interpretation"
            text="When predictors contain similar information, separating the individual effect associated with each predictor becomes more difficult."
          />

          <ImpactCard
            number="03"
            title="Surprising coefficients"
            text="Correlated predictors can sometimes produce coefficient magnitudes or signs that appear surprising when interpreted individually."
          />

          <ImpactCard
            number="04"
            title="Prediction may still work"
            text="Multicollinearity can make coefficient interpretation unstable even when overall predictions remain useful."
          />
        </div>
      </div>

      {/* EXAMPLE */}

      <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
        <p className="font-bold text-blue-300">
          Simple Example
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Imagine a house-price model
          contains both{" "}
          <strong className="text-white">
            Area in square feet
          </strong>{" "}
          and{" "}
          <strong className="text-white">
            Area in square metres
          </strong>
          . These two predictors
          contain essentially the same
          information expressed using
          different units.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          The model can struggle to
          decide how much coefficient
          weight should belong to each
          one individually.
        </p>
      </div>

      {/* LIMITATION */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Pairwise correlation is only
          a screening tool
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          High pairwise correlation is
          useful evidence of a possible
          multicollinearity problem,
          but pairwise correlations do
          not detect every form of
          multicollinearity.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          More advanced diagnostics
          include Variance Inflation
          Factor (VIF), condition
          numbers and examination of
          the design matrix.
        </p>
      </div>

      {/* ACTIONS */}

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="font-bold text-emerald-300">
          What should you investigate?
        </p>

        <div className="mt-4 space-y-3">
          <ActionRow
            number="1"
            text="Check whether highly correlated predictors represent nearly the same information."
          />

          <ActionRow
            number="2"
            text="Use domain knowledge before deciding whether a predictor should be removed."
          />

          <ActionRow
            number="3"
            text="Inspect coefficient stability instead of looking only at prediction metrics."
          />

          <ActionRow
            number="4"
            text="For advanced analysis, consider VIF or regularized models such as Ridge Regression."
          />
        </div>
      </div>

      {/* RIDGE CONNECTION */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-bold text-white">
          Connection to Ridge Regression
        </p>

        <p className="mt-2 text-sm leading-7 text-slate-400">
          Ridge Regression adds L2
          regularization. Among its
          useful properties is that it
          can stabilize coefficient
          estimates when predictors are
          strongly correlated.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------
   Correlation Card
-------------------------------------------------- */

function CorrelationCard({
  pair,
}: {
  pair: CorrelationItem;
}) {
  const percentage =
    Math.min(
      100,
      pair.absoluteCorrelation * 100,
    );

  const positive =
    pair.correlation >= 0;

  const appearance =
    getLevelAppearance(
      pair.level,
    );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white">
              {pair.featureA}
            </span>

            <span className="text-slate-600">
              ↔
            </span>

            <span className="font-bold text-white">
              {pair.featureB}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {positive
              ? "Positive correlation"
              : "Negative correlation"}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-xl font-black text-white">
            {formatNumber(
              pair.correlation,
            )}
          </p>

          <span
            className={[
              "mt-1 inline-block rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
              appearance.badge,
            ].join(" ")}
          >
            {appearance.label}
          </span>
        </div>
      </div>

      <div className="relative mt-5 h-9 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-slate-500" />

        {positive ? (
          <div
            className={[
              "absolute left-1/2 top-2 h-5 rounded-r-lg",
              appearance.bar,
            ].join(" ")}
            style={{
              width: `${percentage / 2}%`,
            }}
          />
        ) : (
          <div
            className={[
              "absolute right-1/2 top-2 h-5 rounded-l-lg",
              appearance.bar,
            ].join(" ")}
            style={{
              width: `${percentage / 2}%`,
            }}
          />
        )}

        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">
          −1
        </span>

        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
          0
        </span>

        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">
          +1
        </span>
      </div>

      {pair.absoluteCorrelation >=
        0.85 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-xs leading-5 text-amber-200">
            These predictors have a
            strong pairwise linear
            relationship. Interpret
            their individual regression
            coefficients carefully.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FeatureBadge({
  name,
}: {
  name: string;
}) {
  return (
    <span className="rounded-xl border border-cyan-500/20 bg-slate-950/50 px-3 py-2 text-sm font-bold text-cyan-200">
      {name}
    </span>
  );
}

function ScaleCard({
  range,
  label,
  description,
}: {
  range: string;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="font-mono font-black text-white">
        {range}
      </p>

      <p className="mt-1 text-sm font-bold text-cyan-300">
        {label}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ImpactCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-xs font-black text-rose-300">
          {number}
        </div>

        <div>
          <p className="font-bold text-white">
            {title}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionRow({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-emerald-500/10 bg-slate-950/40 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-black text-emerald-300">
        {number}
      </div>

      <p className="pt-1 text-sm leading-6 text-slate-300">
        {text}
      </p>
    </div>
  );
}

function getCorrelationLevel(
  absoluteCorrelation: number,
): CorrelationLevel {
  if (
    absoluteCorrelation >= 0.98
  ) {
    return "very-strong";
  }

  if (
    absoluteCorrelation >= 0.85
  ) {
    return "strong";
  }

  if (
    absoluteCorrelation >= 0.5
  ) {
    return "moderate";
  }

  return "low";
}

function getLevelAppearance(
  level: CorrelationLevel,
) {
  switch (level) {
    case "very-strong":
      return {
        label: "Very Strong",
        badge:
          "border-rose-500/30 bg-rose-500/10 text-rose-300",
        bar: "bg-rose-500/80",
      };

    case "strong":
      return {
        label: "Strong",
        badge:
          "border-amber-500/30 bg-amber-500/10 text-amber-300",
        bar: "bg-amber-500/80",
      };

    case "moderate":
      return {
        label: "Moderate",
        badge:
          "border-blue-500/30 bg-blue-500/10 text-blue-300",
        bar: "bg-blue-500/80",
      };

    default:
      return {
        label: "Lower",
        badge:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        bar: "bg-emerald-500/80",
      };
  }
}

function getOverallStatus(
  correlations: CorrelationItem[],
) {
  if (
    correlations.length === 0
  ) {
    return {
      title:
        "Not enough pairwise information",
      description:
        "No valid feature-pair correlations are available for this dataset.",
      className:
        "border-slate-700 bg-slate-900/60 text-slate-300",
    };
  }

  const maximum =
    correlations[0]
      .absoluteCorrelation;

  if (maximum >= 0.98) {
    return {
      title:
        "Very strong correlation detected",
      description:
        "At least one predictor pair is extremely strongly correlated. Individual coefficient interpretation may be unstable.",
      className:
        "border-rose-500/30 bg-rose-500/10 text-rose-200",
    };
  }

  if (maximum >= 0.85) {
    return {
      title:
        "Strong correlation detected",
      description:
        "At least one predictor pair has a strong linear relationship. Investigate possible multicollinearity.",
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-200",
    };
  }

  if (maximum >= 0.5) {
    return {
      title:
        "Moderate feature correlation",
      description:
        "Some predictors are moderately related, but no pair crossed ModelMind's strong-correlation screening threshold.",
      className:
        "border-blue-500/30 bg-blue-500/10 text-blue-200",
    };
  }

  return {
    title:
      "No strong pairwise correlation detected",
    description:
      "The selected predictors do not show strong pairwise linear correlation under this screening rule.",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  };
}

function formatNumber(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(4);
}