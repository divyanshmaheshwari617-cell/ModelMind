import { useMemo, useState } from "react";

import type {
  NumericRow,
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface FeatureContributionGraphProps {
  rows: NumericRow[];
  model: TrainedMultipleRegressionModel;
}

interface Contribution {
  feature: string;
  featureValue: number;
  coefficient: number;
  contribution: number;
}

export default function FeatureContributionGraph({
  rows,
  model,
}: FeatureContributionGraphProps) {
  const validRows = useMemo(() => {
    return rows.filter((row) => {
      const target = row[model.targetName];

      if (!Number.isFinite(target)) {
        return false;
      }

      return model.featureNames.every((feature) =>
        Number.isFinite(row[feature]),
      );
    });
  }, [rows, model]);

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  if (validRows.length === 0) {
    return (
      <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
        <p className="font-bold text-amber-300">
          Feature contribution unavailable
        </p>

        <p className="mt-2 text-sm text-slate-300">
          No complete numeric observations are available.
        </p>
      </section>
    );
  }

  const safeIndex = Math.min(
    selectedIndex,
    validRows.length - 1,
  );

  const selectedRow =
    validRows[safeIndex];

  const contributions: Contribution[] =
    model.featureNames.map((feature) => {
      const featureValue =
        selectedRow[feature];

      const coefficient =
        model.coefficients[feature] ?? 0;

      return {
        feature,
        featureValue,
        coefficient,
        contribution:
          coefficient * featureValue,
      };
    });

  const predicted =
    model.intercept +
    contributions.reduce(
      (sum, item) =>
        sum + item.contribution,
      0,
    );

  const actual =
    selectedRow[model.targetName];

  const residual =
    actual - predicted;

  const maximumMagnitude =
    Math.max(
      ...contributions.map((item) =>
        Math.abs(item.contribution),
      ),
      Math.abs(model.intercept),
      1e-12,
    );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
          Prediction Breakdown
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Feature Contribution Explorer
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Select an observation and see how the
          intercept and every feature combine to
          create its prediction.
        </p>
      </div>

      {/* ROW SELECTOR */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Observation
            </p>

            <p className="mt-1 font-bold text-white">
              Row {safeIndex + 1} of{" "}
              {validRows.length}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={() =>
                setSelectedIndex((current) =>
                  Math.max(0, current - 1),
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>

            <button
              type="button"
              disabled={
                safeIndex ===
                validRows.length - 1
              }
              onClick={() =>
                setSelectedIndex((current) =>
                  Math.min(
                    validRows.length - 1,
                    current + 1,
                  ),
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={validRows.length - 1}
          value={safeIndex}
          onChange={(event) =>
            setSelectedIndex(
              Number(event.target.value),
            )
          }
          className="mt-4 w-full"
        />
      </div>

      {/* RESULT CARDS */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ResultCard
          label="Actual"
          value={formatNumber(actual)}
        />

        <ResultCard
          label="Predicted"
          value={formatNumber(predicted)}
        />

        <ResultCard
          label="Residual"
          value={formatNumber(residual)}
        />
      </div>

      {/* EQUATION */}

      <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
          This Observation&apos;s Calculation
        </p>

        <p className="mt-3 break-words font-mono text-sm leading-7 text-slate-200">
          ŷ = {formatNumber(model.intercept)}

          {contributions.map((item) => (
            <span key={item.feature}>
              {" "}
              {item.contribution >= 0
                ? "+"
                : "-"}{" "}
              {formatNumber(
                Math.abs(item.contribution),
              )}
            </span>
          ))}

          {" = "}

          <strong className="text-white">
            {formatNumber(predicted)}
          </strong>
        </p>
      </div>

      {/* INTERCEPT */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-white">
              Intercept
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Starting value b₀
            </p>
          </div>

          <p className="font-mono text-lg font-black text-white">
            {formatNumber(model.intercept)}
          </p>
        </div>

        <ContributionBar
          value={model.intercept}
          maximumMagnitude={
            maximumMagnitude
          }
        />
      </div>

      {/* FEATURE CONTRIBUTIONS */}

      <div className="mt-4 space-y-4">
        {contributions.map((item) => (
          <div
            key={item.feature}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-bold text-white">
                  {item.feature}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Feature value ={" "}
                  {formatNumber(
                    item.featureValue,
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-lg font-black text-white">
                  {item.contribution >= 0
                    ? "+"
                    : ""}
                  {formatNumber(
                    item.contribution,
                  )}
                </p>

                <p className="text-xs text-slate-500">
                  contribution
                </p>
              </div>
            </div>

            <ContributionBar
              value={item.contribution}
              maximumMagnitude={
                maximumMagnitude
              }
            />

            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="font-mono text-xs leading-6 text-slate-400">
                {formatNumber(
                  item.coefficient,
                )}{" "}
                ×{" "}
                {formatNumber(
                  item.featureValue,
                )}{" "}
                ={" "}
                <strong className="text-slate-200">
                  {formatNumber(
                    item.contribution,
                  )}
                </strong>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FINAL CALCULATION */}

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="font-bold text-emerald-300">
          Final prediction
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Start with the intercept{" "}
          <strong>
            {formatNumber(
              model.intercept,
            )}
          </strong>
          , then add every feature&apos;s
          coefficient × value contribution.
        </p>

        <p className="mt-3 text-2xl font-black text-white">
          ŷ = {formatNumber(predicted)}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Actual {model.targetName}:{" "}
          <strong className="text-slate-200">
            {formatNumber(actual)}
          </strong>
          {" · "}
          Residual:{" "}
          <strong className="text-slate-200">
            {formatNumber(residual)}
          </strong>
        </p>
      </div>

      {/* EDUCATION */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ExplanationCard
          title="Positive contribution"
          text="This feature pushes this observation's prediction upward relative to the intercept."
        />

        <ExplanationCard
          title="Negative contribution"
          text="This feature pushes this observation's prediction downward relative to the intercept."
        />

        <ExplanationCard
          title="Contribution ≠ importance"
          text="A large contribution for one observation does not automatically mean the feature is globally the most important predictor."
        />
      </div>

      {/* IMPORTANT DISTINCTION */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Coefficient vs contribution
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          A coefficient belongs to the fitted model and
          stays the same across observations. A feature
          contribution depends on both that coefficient
          and the selected observation&apos;s feature
          value:
        </p>

        <p className="mt-3 font-mono font-bold text-white">
          Contribution = coefficient × feature value
        </p>
      </div>
    </section>
  );
}

function ContributionBar({
  value,
  maximumMagnitude,
}: {
  value: number;
  maximumMagnitude: number;
}) {
  const percentage =
    Math.min(
      100,
      (Math.abs(value) /
        maximumMagnitude) *
        100,
    );

  const positive = value >= 0;

  return (
    <div className="relative mt-4 h-9 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="absolute bottom-0 left-1/2 top-0 w-px bg-slate-500" />

      {positive ? (
        <div
          className="absolute left-1/2 top-2 h-5 rounded-r-lg bg-emerald-500/70"
          style={{
            width: `${percentage / 2}%`,
          }}
        />
      ) : (
        <div
          className="absolute right-1/2 top-2 h-5 rounded-l-lg bg-rose-500/70"
          style={{
            width: `${percentage / 2}%`,
          }}
        />
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function ExplanationCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="font-bold text-slate-200">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function formatNumber(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const absolute = Math.abs(value);

  if (
    absolute >= 100000 ||
    (absolute > 0 &&
      absolute < 0.001)
  ) {
    return value.toExponential(3);
  }

  return value.toFixed(3);
}