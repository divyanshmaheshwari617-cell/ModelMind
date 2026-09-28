import { useMemo, useState } from "react";

import type {
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface CoefficientComparisonProps {
  model: TrainedMultipleRegressionModel;
}

type ViewMode =
  | "standardized"
  | "raw";

export default function CoefficientComparison({
  model,
}: CoefficientComparisonProps) {
  const [viewMode, setViewMode] =
    useState<ViewMode>("standardized");

  const coefficients = useMemo(() => {
    return model.featureNames.map(
      (feature) => {
        const raw =
          model.coefficients[
            feature
          ] ?? 0;

        const standardized =
  model.standardizedCoefficients.find(
    (item) =>
      item.feature === feature,
  )?.standardizedCoefficient ?? 0;

        return {
          feature,
          raw,
          standardized,
        };
      },
    );
  }, [model]);

  const displayValues =
    useMemo(() => {
      return coefficients.map(
        (item) => ({
          feature:
            item.feature,

          value:
            viewMode ===
            "standardized"
              ? item.standardized
              : item.raw,

          raw: item.raw,

          standardized:
            item.standardized,
        }),
      );
    }, [
      coefficients,
      viewMode,
    ]);

  const maximumMagnitude =
    useMemo(() => {
      return Math.max(
        ...displayValues.map(
          (item) =>
            Math.abs(
              item.value,
            ),
        ),
        1e-12,
      );
    }, [displayValues]);

  const strongestFeature =
    useMemo(() => {
      if (
        coefficients.length ===
        0
      ) {
        return null;
      }

      return [...coefficients].sort(
        (a, b) =>
          Math.abs(
            b.standardized,
          ) -
          Math.abs(
            a.standardized,
          ),
      )[0];
    }, [coefficients]);

  if (
    coefficients.length === 0
  ) {
    return (
      <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
        <p className="font-bold text-amber-300">
          Coefficient comparison unavailable
        </p>

        <p className="mt-2 text-sm text-slate-300">
          The trained model does not
          contain feature coefficients.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
          Feature Effects
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Coefficient Comparison
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Explore how each input
          feature contributes to the
          regression equation and why
          standardized coefficients are
          often more useful when
          comparing features measured
          in different units.
        </p>
      </div>

      {/* MODE SELECTOR */}

      <div className="mt-5 inline-flex rounded-2xl border border-slate-800 bg-slate-900 p-1">
        <ModeButton
          active={
            viewMode ===
            "standardized"
          }
          onClick={() =>
            setViewMode(
              "standardized",
            )
          }
        >
          Standardized
        </ModeButton>

        <ModeButton
          active={
            viewMode === "raw"
          }
          onClick={() =>
            setViewMode("raw")
          }
        >
          Raw
        </ModeButton>
      </div>

      {/* CURRENT VIEW EXPLANATION */}

      <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
        {viewMode ===
        "standardized" ? (
          <>
            <p className="font-bold text-blue-300">
              Standardized coefficients
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              These compare feature
              effects after accounting
              for differences in scale.
              A larger absolute
              standardized coefficient
              means the feature has a
              larger linear association
              with the prediction,
              holding the other model
              features constant.
            </p>
          </>
        ) : (
          <>
            <p className="font-bold text-blue-300">
              Raw coefficients
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              A raw coefficient tells
              us how much the predicted{" "}
              <strong>
                {model.targetName}
              </strong>{" "}
              changes when that feature
              increases by one unit,
              while the other features
              are held constant.
            </p>
          </>
        )}
      </div>

      {/* ZERO LINE / BAR CHART */}

      <div className="mt-6 space-y-5">
        {displayValues.map(
          (item) => {
            const magnitude =
              Math.abs(
                item.value,
              );

            const percentage =
              maximumMagnitude ===
              0
                ? 0
                : (magnitude /
                    maximumMagnitude) *
                  100;

            const positive =
              item.value >= 0;

            return (
              <div
                key={
                  item.feature
                }
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      {
                        item.feature
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {positive
                        ? "Positive relationship"
                        : "Negative relationship"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-lg font-black text-white">
                      {formatNumber(
                        item.value,
                      )}
                    </p>

                    <p className="text-xs text-slate-500">
                      {viewMode ===
                      "standardized"
                        ? "standardized β"
                        : "raw coefficient"}
                    </p>
                  </div>
                </div>

                {/* CENTERED BAR */}

                <div className="relative mt-4 h-10 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  {/* ZERO */}

                  <div className="absolute bottom-0 left-1/2 top-0 w-px bg-slate-500" />

                  {/* NEGATIVE SIDE LABEL */}

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Negative
                  </span>

                  {/* POSITIVE SIDE LABEL */}

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Positive
                  </span>

                  {/* BAR */}

                  {positive ? (
                    <div
                      className="absolute left-1/2 top-2 h-6 rounded-r-lg bg-emerald-500/70"
                      style={{
                        width: `${percentage / 2}%`,
                      }}
                    />
                  ) : (
                    <div
                      className="absolute right-1/2 top-2 h-6 rounded-l-lg bg-rose-500/70"
                      style={{
                        width: `${percentage / 2}%`,
                      }}
                    />
                  )}
                </div>

                {/* BOTH VALUES */}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <SmallValue
                    label="Raw coefficient"
                    value={formatNumber(
                      item.raw,
                    )}
                  />

                  <SmallValue
                    label="Standardized coefficient"
                    value={formatNumber(
                      item.standardized,
                    )}
                  />
                </div>

                {/* INTERPRETATION */}

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-sm leading-6 text-slate-400">
                    {item.raw >= 0
                      ? `Holding the other selected features constant, increasing ${item.feature} by one unit is associated with an increase of approximately ${formatNumber(
                          Math.abs(
                            item.raw,
                          ),
                        )} in predicted ${model.targetName}.`
                      : `Holding the other selected features constant, increasing ${item.feature} by one unit is associated with a decrease of approximately ${formatNumber(
                          Math.abs(
                            item.raw,
                          ),
                        )} in predicted ${model.targetName}.`}
                  </p>
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* STRONGEST STANDARDIZED FEATURE */}

      {strongestFeature && (
        <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
            Largest standardized
            coefficient magnitude
          </p>

          <p className="mt-2 text-xl font-black text-white">
            {
              strongestFeature.feature
            }
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Among the features in this
            fitted model,{" "}
            <strong>
              {
                strongestFeature.feature
              }
            </strong>{" "}
            has the largest absolute
            standardized coefficient:{" "}
            <strong>
              {formatNumber(
                strongestFeature.standardized,
              )}
            </strong>
            .
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            This does not automatically
            mean it is the most
            important causal variable.
            Correlation between
            predictors, sampling
            variation and model
            specification can affect
            coefficient interpretation.
          </p>
        </div>
      )}

      {/* EDUCATION */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ExplanationCard
          title="Positive coefficient"
          text="As the feature increases, the prediction tends to increase when the other predictors are held constant."
        />

        <ExplanationCard
          title="Negative coefficient"
          text="As the feature increases, the prediction tends to decrease when the other predictors are held constant."
        />

        <ExplanationCard
          title="Near zero"
          text="The fitted linear effect is relatively small on the displayed coefficient scale, conditional on the other included predictors."
        />
      </div>

      {/* RAW VS STANDARDIZED */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Why not compare only raw
          coefficients?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Imagine Area is measured in
          square feet while Age is
          measured in years. A one-unit
          change means something very
          different for those two
          variables. Raw coefficient
          magnitudes therefore should
          not usually be compared
          directly as a measure of
          feature strength.
          Standardization puts the
          features onto comparable
          standard-deviation scales.
        </p>
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Mode Button
|--------------------------------------------------------------------------
*/

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2 text-sm font-bold transition",

        active
          ? "bg-cyan-500 text-slate-950"
          : "text-slate-400 hover:bg-slate-800 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Small Value
|--------------------------------------------------------------------------
*/

function SmallValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-mono font-bold text-slate-200">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Explanation Card
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Number Formatting
|--------------------------------------------------------------------------
*/

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

  return value.toFixed(4);
}