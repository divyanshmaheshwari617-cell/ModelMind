import type {
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface EquationExplanationProps {
  model: TrainedMultipleRegressionModel;
}

export default function EquationExplanation({
  model,
}: EquationExplanationProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
          Understand the Equation
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Your Multiple Regression Equation
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          ModelMind translates the fitted mathematical
          equation into plain language so you can
          understand what every term means.
        </p>
      </div>

      {/* GENERIC EQUATION */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          General Form
        </p>

        <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-lg font-black text-white">
          ŷ = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ
        </p>
      </div>

      {/* TRAINED EQUATION */}

      <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Your Fitted Equation
        </p>

        <div className="mt-3 overflow-x-auto">
          <p className="min-w-max font-mono text-base font-bold leading-8 text-white">
            {model.targetName} ={" "}
            {formatNumber(model.intercept)}

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
                    (
                    {feature})
                  </span>
                );
              },
            )}
          </p>
        </div>
      </div>

      {/* SYMBOL EXPLANATIONS */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SymbolCard
          symbol="ŷ"
          title="Prediction"
          description={`The model's predicted ${model.targetName}.`}
        />

        <SymbolCard
          symbol="b₀"
          title="Intercept"
          description="The model's baseline value when every input feature equals zero."
        />

        <SymbolCard
          symbol="bᵢ"
          title="Coefficient"
          description="The fitted change associated with one unit of a feature, holding the other predictors constant."
        />

        <SymbolCard
          symbol="xᵢ"
          title="Feature Value"
          description="The actual input value supplied to the model."
        />
      </div>

      {/* INTERCEPT */}

      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Step 1 · Intercept
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-bold text-white">
              Starting prediction
            </p>

            <p className="mt-1 text-sm text-slate-400">
              b₀
            </p>
          </div>

          <p className="font-mono text-2xl font-black text-white">
            {formatNumber(
              model.intercept,
            )}
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          Mathematically, this is the predicted{" "}
          <strong>
            {model.targetName}
          </strong>{" "}
          when every selected feature equals zero.
          Whether that situation has a meaningful
          real-world interpretation depends on the
          dataset.
        </p>
      </div>

      {/* COEFFICIENTS */}

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Step 2 · Understand Each Coefficient
        </p>

        <div className="mt-4 space-y-4">
          {model.featureNames.map(
            (feature, index) => {
              const coefficient =
                model.coefficients[
                  feature
                ] ?? 0;

              const positive =
                coefficient >= 0;

              return (
                <div
                  key={feature}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        b{index + 1}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-white">
                        {feature}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-xl font-black text-white">
                        {coefficient >= 0
                          ? "+"
                          : ""}
                        {formatNumber(
                          coefficient,
                        )}
                      </p>

                      <p
                        className={[
                          "mt-1 text-xs font-bold uppercase tracking-wider",
                          positive
                            ? "text-emerald-400"
                            : "text-rose-400",
                        ].join(" ")}
                      >
                        {positive
                          ? "Positive coefficient"
                          : "Negative coefficient"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="text-sm leading-7 text-slate-300">
                      Holding all other selected
                      predictors constant, a one-unit
                      increase in{" "}
                      <strong className="text-white">
                        {feature}
                      </strong>{" "}
                      is associated with an
                      approximate{" "}
                      <strong
                        className={
                          positive
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }
                      >
                        {positive
                          ? "increase"
                          : "decrease"}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-white">
                        {formatNumber(
                          Math.abs(
                            coefficient,
                          ),
                        )}
                      </strong>{" "}
                      in predicted{" "}
                      <strong className="text-white">
                        {model.targetName}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* HOW PREDICTION IS BUILT */}

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
          Step 3 · Build a Prediction
        </p>

        <div className="mt-4 space-y-3">
          <Step
            number="1"
            text={`Start with the intercept: ${formatNumber(
              model.intercept,
            )}`}
          />

          <Step
            number="2"
            text="Multiply every feature value by its learned coefficient."
          />

          <Step
            number="3"
            text="Add all of those contributions to the intercept."
          />

          <Step
            number="4"
            text={`The result is the predicted ${model.targetName}.`}
          />
        </div>
      </div>

      {/* CONDITIONAL INTERPRETATION */}

      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          The phrase you must remember
        </p>

        <p className="mt-3 text-xl font-black text-white">
          “Holding the other predictors constant”
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          In Multiple Linear Regression, a
          coefficient is not normally interpreted
          as if its feature were the only variable
          in the model. Its fitted effect is
          conditional on the other predictors that
          are included.
        </p>
      </div>

      {/* CAUSATION WARNING */}

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-bold text-white">
          Association is not automatically causation
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          A positive or negative regression
          coefficient describes the fitted
          relationship in this model. By itself, it
          does not prove that changing that feature
          causes the target to change.
        </p>
      </div>
    </section>
  );
}

function SymbolCard({
  symbol,
  title,
  description,
}: {
  symbol: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="font-mono text-xl font-black text-cyan-300">
        {symbol}
      </p>

      <p className="mt-2 font-bold text-white">
        {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Step({
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
    return value.toExponential(3);
  }

  return value.toFixed(4);
}