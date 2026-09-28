import { useMemo, useState } from "react";

import type {
  NumericRow,
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface CoefficientControlsProps {
  rows: NumericRow[];
  model: TrainedMultipleRegressionModel;
}

interface ManualCoefficients {
  intercept: number;
  coefficients: Record<string, number>;
}

export default function CoefficientControls({
  rows,
  model,
}: CoefficientControlsProps) {
  const [manual, setManual] =
    useState<ManualCoefficients>(() => ({
      intercept: model.intercept,
      coefficients: {
        ...model.coefficients,
      },
    }));

  const comparison = useMemo(() => {
    const validRows = rows.filter(
      (row) =>
        Number.isFinite(
          row[model.targetName],
        ) &&
        model.featureNames.every(
          (feature) =>
            Number.isFinite(
              row[feature],
            ),
        ),
    );

    if (validRows.length === 0) {
      return null;
    }

    const predictions =
      validRows.map((row) => {
        const actual =
          row[model.targetName];

        const trainedPrediction =
          model.intercept +
          model.featureNames.reduce(
            (sum, feature) =>
              sum +
              (model.coefficients[
                feature
              ] ?? 0) *
                row[feature],
            0,
          );

        const manualPrediction =
          manual.intercept +
          model.featureNames.reduce(
            (sum, feature) =>
              sum +
              (manual.coefficients[
                feature
              ] ?? 0) *
                row[feature],
            0,
          );

        return {
          actual,
          trainedPrediction,
          manualPrediction,
        };
      });

    const trainedMSE =
      predictions.reduce(
        (sum, item) => {
          const error =
            item.actual -
            item.trainedPrediction;

          return (
            sum + error * error
          );
        },
        0,
      ) / predictions.length;

    const manualMSE =
      predictions.reduce(
        (sum, item) => {
          const error =
            item.actual -
            item.manualPrediction;

          return (
            sum + error * error
          );
        },
        0,
      ) / predictions.length;

    const trainedRMSE =
      Math.sqrt(trainedMSE);

    const manualRMSE =
      Math.sqrt(manualMSE);

    return {
      predictions,
      trainedMSE,
      manualMSE,
      trainedRMSE,
      manualRMSE,
    };
  }, [
    rows,
    model,
    manual,
  ]);

  function updateIntercept(
    value: number,
  ) {
    setManual((current) => ({
      ...current,
      intercept: value,
    }));
  }

  function updateCoefficient(
    feature: string,
    value: number,
  ) {
    setManual((current) => ({
      ...current,

      coefficients: {
        ...current.coefficients,
        [feature]: value,
      },
    }));
  }

  function resetToTrainedModel() {
    setManual({
      intercept:
        model.intercept,

      coefficients: {
        ...model.coefficients,
      },
    });
  }

  const changed =
    hasChanged(
      manual,
      model,
    );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">
          Parameter Playground
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Experiment With the
          Coefficients
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Change the intercept and
          coefficients manually and
          watch how the model&apos;s
          predictions and error change.
          This does not retrain the
          model.
        </p>
      </div>

      {/* IMPORTANT */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Experiment mode
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          The trained coefficients are
          preserved. These controls
          create a temporary manual
          version so you can understand
          why coefficient values matter.
        </p>
      </div>

      {/* RESET */}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-white">
            Manual Parameters
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {changed
              ? "You have changed the trained parameters."
              : "Currently identical to the trained model."}
          </p>
        </div>

        <button
          type="button"
          onClick={
            resetToTrainedModel
          }
          disabled={!changed}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset to Trained Model
        </button>
      </div>

      {/* INTERCEPT */}

      <ParameterControl
        name="Intercept"
        symbol="b₀"
        trainedValue={
          model.intercept
        }
        value={
          manual.intercept
        }
        onChange={
          updateIntercept
        }
      />

      {/* COEFFICIENTS */}

      <div className="mt-4 space-y-4">
        {model.featureNames.map(
          (feature, index) => (
            <ParameterControl
              key={feature}
              name={feature}
              symbol={`b${
                index + 1
              }`}
              trainedValue={
                model.coefficients[
                  feature
                ] ?? 0
              }
              value={
                manual.coefficients[
                  feature
                ] ?? 0
              }
              onChange={(value) =>
                updateCoefficient(
                  feature,
                  value,
                )
              }
            />
          ),
        )}
      </div>

      {/* MANUAL EQUATION */}

      <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Current Manual Equation
        </p>

        <div className="mt-3 overflow-x-auto">
          <p className="min-w-max font-mono text-sm font-bold leading-7 text-white">
            ŷ ={" "}
            {formatNumber(
              manual.intercept,
            )}

            {model.featureNames.map(
              (feature) => {
                const value =
                  manual.coefficients[
                    feature
                  ] ?? 0;

                return (
                  <span key={feature}>
                    {" "}
                    {value >= 0
                      ? "+"
                      : "-"}{" "}
                    {formatNumber(
                      Math.abs(value),
                    )}
                    ({feature})
                  </span>
                );
              },
            )}
          </p>
        </div>
      </div>

      {/* METRIC COMPARISON */}

      {comparison && (
        <>
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Trained vs Manual
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ModelCard
                title="Trained Model"
                mse={
                  comparison.trainedMSE
                }
                rmse={
                  comparison.trainedRMSE
                }
                highlight={!changed}
              />

              <ModelCard
                title="Your Manual Model"
                mse={
                  comparison.manualMSE
                }
                rmse={
                  comparison.manualRMSE
                }
                highlight={changed}
              />
            </div>
          </div>

          {/* ERROR CHANGE */}

          <div
            className={[
              "mt-5 rounded-2xl border p-5",
              comparison.manualMSE <=
              comparison.trainedMSE
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-rose-500/20 bg-rose-500/10",
            ].join(" ")}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              MSE Difference
            </p>

            <p className="mt-2 font-mono text-2xl font-black text-white">
              {formatSigned(
                comparison.manualMSE -
                  comparison.trainedMSE,
              )}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {changed
                ? comparison.manualMSE >
                  comparison.trainedMSE
                  ? "Your manual parameters produce more squared error than the trained OLS coefficients on these observations."
                  : comparison.manualMSE <
                      comparison.trainedMSE
                    ? "Your manual parameters currently show a lower computed MSE on these rows. Check whether the model and evaluated rows are exactly the same as those used during fitting."
                    : "Your manual parameters currently produce the same MSE."
                : "The manual parameters are identical to the trained model, so their errors match."}
            </p>
          </div>

          {/* SAMPLE PREDICTIONS */}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="font-bold text-white">
              Prediction Comparison
            </p>

            <p className="mt-2 text-sm text-slate-400">
              First five valid
              observations.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-3">
                      Row
                    </th>

                    <th className="px-3 py-3">
                      Actual
                    </th>

                    <th className="px-3 py-3">
                      Trained
                    </th>

                    <th className="px-3 py-3">
                      Manual
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {comparison.predictions
                    .slice(0, 5)
                    .map(
                      (
                        item,
                        index,
                      ) => (
                        <tr
                          key={index}
                          className="border-b border-slate-800/70"
                        >
                          <td className="px-3 py-3 text-slate-500">
                            {index +
                              1}
                          </td>

                          <td className="px-3 py-3 font-mono text-white">
                            {formatNumber(
                              item.actual,
                            )}
                          </td>

                          <td className="px-3 py-3 font-mono text-cyan-300">
                            {formatNumber(
                              item.trainedPrediction,
                            )}
                          </td>

                          <td className="px-3 py-3 font-mono text-fuchsia-300">
                            {formatNumber(
                              item.manualPrediction,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* LEARNING */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <LearningCard
          number="1"
          title="Change b₀"
          text="Changing the intercept shifts every prediction by the same amount."
        />

        <LearningCard
          number="2"
          title="Change bᵢ"
          text="Changing a feature coefficient changes how strongly that feature contributes to predictions."
        />

        <LearningCard
          number="3"
          title="Watch the error"
          text="Ordinary Least Squares chooses coefficients that minimize the sum, and therefore the mean, of squared residuals on the fitting data."
        />
      </div>

      {/* OLS CONNECTION */}

      <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="font-bold text-emerald-300">
          What should you discover?
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          When you move away from the
          fitted Ordinary Least Squares
          coefficients, the training
          squared error should generally
          increase. The fitted
          coefficients were selected to
          minimize that objective for
          the training observations.
        </p>
      </div>
    </section>
  );
}

function ParameterControl({
  name,
  symbol,
  trainedValue,
  value,
  onChange,
}: {
  name: string;
  symbol: string;
  trainedValue: number;
  value: number;
  onChange: (
    value: number,
  ) => void;
}) {
  const scale =
    Math.max(
      Math.abs(trainedValue),
      1,
    );

  const minimum =
    trainedValue -
    scale * 2;

  const maximum =
    trainedValue +
    scale * 2;

  const step =
    scale / 100;

  const changed =
    !approximatelyEqual(
      trainedValue,
      value,
    );

  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">
            {symbol}
          </p>

          <p className="mt-1 font-bold text-white">
            {name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Trained:{" "}
            {formatNumber(
              trainedValue,
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Manual
          </p>

          <p
            className={[
              "mt-1 font-mono text-xl font-black",
              changed
                ? "text-fuchsia-300"
                : "text-white",
            ].join(" ")}
          >
            {formatNumber(value)}
          </p>
        </div>
      </div>

      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="mt-5 w-full"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(event) => {
            const next =
              Number(
                event.target.value,
              );

            if (
              Number.isFinite(next)
            ) {
              onChange(next);
            }
          }}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 font-mono text-sm text-white outline-none focus:border-fuchsia-500 sm:w-48"
        />

        {changed && (
          <button
            type="button"
            onClick={() =>
              onChange(
                trainedValue,
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-400 transition hover:text-white"
          >
            Reset parameter
          </button>
        )}
      </div>
    </div>
  );
}

function ModelCard({
  title,
  mse,
  rmse,
  highlight,
}: {
  title: string;
  mse: number;
  rmse: number;
  highlight: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-5",
        highlight
          ? "border-fuchsia-500/30 bg-fuchsia-500/10"
          : "border-slate-800 bg-slate-900/60",
      ].join(" ")}
    >
      <p className="font-bold text-white">
        {title}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricValue
          label="MSE"
          value={mse}
        />

        <MetricValue
          label="RMSE"
          value={rmse}
        />
      </div>
    </div>
  );
}

function MetricValue({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all font-mono font-bold text-white">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function LearningCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 text-xs font-black text-fuchsia-300">
        {number}
      </div>

      <p className="mt-3 font-bold text-white">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function hasChanged(
  manual: ManualCoefficients,
  model: TrainedMultipleRegressionModel,
): boolean {
  if (
    !approximatelyEqual(
      manual.intercept,
      model.intercept,
    )
  ) {
    return true;
  }

  return model.featureNames.some(
    (feature) =>
      !approximatelyEqual(
        manual.coefficients[
          feature
        ] ?? 0,
        model.coefficients[
          feature
        ] ?? 0,
      ),
  );
}

function approximatelyEqual(
  a: number,
  b: number,
): boolean {
  return (
    Math.abs(a - b) <=
    1e-10 *
      Math.max(
        1,
        Math.abs(a),
        Math.abs(b),
      )
  );
}

function formatSigned(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (
    approximatelyEqual(
      value,
      0,
    )
  ) {
    return "0.0000";
  }

  return `${
    value > 0 ? "+" : ""
  }${formatNumber(value)}`;
}

function formatNumber(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const absolute =
    Math.abs(value);

  if (
    absolute >= 100000 ||
    (absolute > 0 &&
      absolute < 0.001)
  ) {
    return value.toExponential(4);
  }

  return value.toFixed(4);
}