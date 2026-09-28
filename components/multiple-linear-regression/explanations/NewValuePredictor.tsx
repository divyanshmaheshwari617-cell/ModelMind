import { useMemo, useState } from "react";

import type {
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface NewValuePredictorProps {
  model: TrainedMultipleRegressionModel;
}

interface FeatureInput {
  feature: string;
  value: string;
}

export default function NewValuePredictor({
  model,
}: NewValuePredictorProps) {
  const [inputs, setInputs] = useState<
    FeatureInput[]
  >(() =>
    model.featureNames.map((feature) => ({
      feature,
      value: "0",
    })),
  );

  const calculation = useMemo(() => {
    const contributions =
      model.featureNames.map((feature) => {
        const input =
          inputs.find(
            (item) =>
              item.feature === feature,
          );

        const parsedValue =
          Number(input?.value ?? "");

        const valid =
          input?.value.trim() !== "" &&
          Number.isFinite(parsedValue);

        const coefficient =
          model.coefficients[feature] ??
          0;

        return {
          feature,
          value: valid
            ? parsedValue
            : 0,
          coefficient,
          contribution: valid
            ? parsedValue *
              coefficient
            : 0,
          valid,
        };
      });

    const allValid =
      contributions.every(
        (item) => item.valid,
      );

    const prediction =
      allValid
        ? model.intercept +
          contributions.reduce(
            (sum, item) =>
              sum +
              item.contribution,
            0,
          )
        : null;

    return {
      contributions,
      allValid,
      prediction,
    };
  }, [
    inputs,
    model.featureNames,
    model.coefficients,
    model.intercept,
  ]);

  function updateFeature(
    feature: string,
    value: string,
  ) {
    setInputs((current) =>
      current.map((item) =>
        item.feature === feature
          ? {
              ...item,
              value,
            }
          : item,
      ),
    );
  }

  function resetInputs() {
    setInputs(
      model.featureNames.map(
        (feature) => ({
          feature,
          value: "0",
        }),
      ),
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Interactive Prediction
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Predict a New Value
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Enter new values for the
          model&apos;s input features.
          ModelMind will show how each
          value moves through the fitted
          regression equation to produce
          the final prediction.
        </p>
      </div>

      {/* EQUATION */}

      <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Trained Equation
        </p>

        <div className="mt-3 overflow-x-auto">
          <p className="min-w-max font-mono text-sm font-bold leading-7 text-white">
            {model.targetName} ={" "}
            {formatNumber(
              model.intercept,
            )}

            {model.featureNames.map(
              (feature) => {
                const coefficient =
                  model.coefficients[
                    feature
                  ] ?? 0;

                return (
                  <span key={feature}>
                    {" "}
                    {coefficient >= 0
                      ? "+"
                      : "-"}{" "}
                    {formatNumber(
                      Math.abs(
                        coefficient,
                      ),
                    )}
                    ({feature})
                  </span>
                );
              },
            )}
          </p>
        </div>
      </div>

      {/* INPUTS */}

      <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Enter Feature Values
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Enter one numeric value
              for every predictor.
            </p>
          </div>

          <button
            type="button"
            onClick={resetInputs}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Reset
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {inputs.map((item) => {
            const parsed =
              Number(item.value);

            const valid =
              item.value.trim() !==
                "" &&
              Number.isFinite(parsed);

            return (
              <label
                key={item.feature}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <span className="font-bold text-white">
                  {item.feature}
                </span>

                <span className="mt-1 block text-xs text-slate-500">
                  Coefficient:{" "}
                  {formatNumber(
                    model.coefficients[
                      item.feature
                    ] ?? 0,
                  )}
                </span>

                <input
                  type="number"
                  step="any"
                  value={item.value}
                  onChange={(event) =>
                    updateFeature(
                      item.feature,
                      event.target
                        .value,
                    )
                  }
                  className={[
                    "mt-3 w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-white outline-none transition",
                    valid
                      ? "border-slate-700 focus:border-cyan-500"
                      : "border-rose-500/60 focus:border-rose-400",
                  ].join(" ")}
                />

                {!valid && (
                  <span className="mt-2 block text-xs text-rose-300">
                    Enter a valid
                    numeric value.
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* CALCULATION */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Step-by-Step Calculation
        </p>

        {/* INTERCEPT */}

        <div className="mt-4 rounded-xl border border-cyan-500/10 bg-slate-950/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-white">
                Intercept
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Starting value
              </p>
            </div>

            <p className="font-mono font-black text-cyan-300">
              {formatNumber(
                model.intercept,
              )}
            </p>
          </div>
        </div>

        {/* CONTRIBUTIONS */}

        <div className="mt-3 space-y-3">
          {calculation.contributions.map(
            (item) => (
              <div
                key={item.feature}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      {item.feature}
                    </p>

                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {formatNumber(
                        item.coefficient,
                      )}{" "}
                      ×{" "}
                      {item.valid
                        ? formatNumber(
                            item.value,
                          )
                        : "invalid"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Contribution
                    </p>

                    <p
                      className={[
                        "mt-1 font-mono font-black",
                        !item.valid
                          ? "text-slate-600"
                          : item.contribution >=
                              0
                            ? "text-emerald-300"
                            : "text-rose-300",
                      ].join(" ")}
                    >
                      {item.valid
                        ? `${
                            item.contribution >=
                            0
                              ? "+"
                              : ""
                          }${formatNumber(
                            item.contribution,
                          )}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* EXPANDED EQUATION */}

      {calculation.allValid &&
        calculation.prediction !==
          null && (
          <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Substitute the Values
            </p>

            <div className="mt-3 overflow-x-auto">
              <p className="min-w-max font-mono text-sm leading-7 text-slate-200">
                ŷ ={" "}
                {formatNumber(
                  model.intercept,
                )}

                {calculation.contributions.map(
                  (item) => (
                    <span
                      key={
                        item.feature
                      }
                    >
                      {" "}
                      {item.contribution >=
                      0
                        ? "+"
                        : "-"}{" "}
                      {formatNumber(
                        Math.abs(
                          item.contribution,
                        ),
                      )}
                    </span>
                  ),
                )}

                {" = "}

                <strong className="text-white">
                  {formatNumber(
                    calculation.prediction,
                  )}
                </strong>
              </p>
            </div>
          </div>
        )}

      {/* RESULT */}

      <div
        className={[
          "mt-5 rounded-2xl border p-6",
          calculation.allValid
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-amber-500/30 bg-amber-500/10",
        ].join(" ")}
      >
        {calculation.allValid &&
        calculation.prediction !==
          null ? (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Predicted{" "}
              {model.targetName}
            </p>

            <p className="mt-3 break-all font-mono text-3xl font-black text-white">
              {formatNumber(
                calculation.prediction,
              )}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              This value was calculated
              using the coefficients
              learned from the current
              training dataset.
            </p>
          </>
        ) : (
          <>
            <p className="font-bold text-amber-300">
              Prediction waiting
            </p>

            <p className="mt-2 text-sm text-slate-300">
              Enter valid numerical
              values for every feature
              to calculate a prediction.
            </p>
          </>
        )}
      </div>

      {/* EDUCATION */}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <EducationCard
          number="1"
          title="Model stays fixed"
          text="Changing these input values does not retrain the model. The learned coefficients remain unchanged."
        />

        <EducationCard
          number="2"
          title="Inputs change"
          text="Each new feature value changes its coefficient × value contribution."
        />

        <EducationCard
          number="3"
          title="Prediction changes"
          text="The intercept plus all feature contributions produces the new predicted target."
        />
      </div>

      {/* EXTRAPOLATION */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Be careful with extreme
          values
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          The equation can mathematically
          produce a prediction for values
          far outside the training data,
          but such extrapolated predictions
          may be unreliable because the
          model has not learned from that
          region of the feature space.
        </p>
      </div>
    </section>
  );
}

function EducationCard({
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
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-xs font-black text-cyan-300">
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