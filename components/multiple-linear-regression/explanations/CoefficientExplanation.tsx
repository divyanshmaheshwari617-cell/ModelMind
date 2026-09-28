import type {
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface CoefficientExplanationProps {
  model: TrainedMultipleRegressionModel;
}

export default function CoefficientExplanation({
  model,
}: CoefficientExplanationProps) {
  const coefficientData =
    model.featureNames.map((feature) => {
      const rawCoefficient =
        model.coefficients[feature] ?? 0;

      const standardizedData =
        model.standardizedCoefficients.find(
          (item) =>
            item.feature === feature,
        );

      return {
        feature,
        rawCoefficient,
        standardizedCoefficient:
          standardizedData?.standardizedCoefficient ?? 0,
      };
    });

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
          Understand the Parameters
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          What Do the Coefficients Mean?
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Every selected feature receives a
          coefficient. The sign tells us the
          direction of the fitted relationship,
          while its numerical value describes the
          feature&apos;s fitted effect in the
          regression equation.
        </p>
      </div>

      {/* CORE RULE */}

      <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          The Main Interpretation
        </p>

        <p className="mt-3 text-lg font-black leading-8 text-white">
          For a one-unit increase in a feature,
          predicted {model.targetName} changes by
          its coefficient, holding the other
          predictors constant.
        </p>
      </div>

      {/* SIGN EXPLANATION */}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <ConceptCard
          title="Positive"
          symbol="+"
          description={`Higher feature values are associated with higher predicted ${model.targetName}, conditional on the other included predictors.`}
        />

        <ConceptCard
          title="Negative"
          symbol="−"
          description={`Higher feature values are associated with lower predicted ${model.targetName}, conditional on the other included predictors.`}
        />

        <ConceptCard
          title="Near Zero"
          symbol="≈ 0"
          description="The fitted linear effect is relatively small on that feature's original measurement scale."
        />
      </div>

      {/* ACTUAL MODEL COEFFICIENTS */}

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Your Model&apos;s Coefficients
        </p>

        <div className="mt-4 space-y-4">
          {coefficientData.map(
            (item, index) => {
              const positive =
                item.rawCoefficient >= 0;

              return (
                <div
                  key={item.feature}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Coefficient b
                        {index + 1}
                      </p>

                      <h3 className="mt-1 text-lg font-black text-white">
                        {item.feature}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-xl font-black text-white">
                        {item.rawCoefficient >=
                        0
                          ? "+"
                          : ""}
                        {formatNumber(
                          item.rawCoefficient,
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
                          ? "Positive"
                          : "Negative"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="text-sm leading-7 text-slate-300">
                      If{" "}
                      <strong className="text-white">
                        {item.feature}
                      </strong>{" "}
                      increases by one
                      unit while the
                      other included
                      predictors stay
                      constant, the
                      model&apos;s
                      predicted{" "}
                      <strong className="text-white">
                        {model.targetName}
                      </strong>{" "}
                      changes by
                      approximately{" "}
                      <strong
                        className={
                          positive
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }
                      >
                        {formatNumber(
                          item.rawCoefficient,
                        )}
                      </strong>
                      .
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ValueCard
                      label="Raw coefficient"
                      value={formatNumber(
                        item.rawCoefficient,
                      )}
                    />

                    <ValueCard
                      label="Standardized coefficient"
                      value={formatNumber(
                        item.standardizedCoefficient,
                      )}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* RAW COEFFICIENT */}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <p className="font-bold text-blue-300">
            Raw coefficient
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            A raw coefficient uses the
            original units of the
            feature and target. This is
            usually the easiest form
            for explaining a practical
            one-unit change.
          </p>

          <div className="mt-4 rounded-xl border border-blue-500/10 bg-slate-950/40 p-4">
            <p className="font-mono text-sm text-white">
              Δŷ ≈ bᵢ × Δxᵢ
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
          <p className="font-bold text-violet-300">
            Standardized coefficient
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            Standardization expresses
            changes on
            standard-deviation
            scales, making coefficient
            magnitudes more comparable
            when predictors use very
            different units.
          </p>

          <div className="mt-4 rounded-xl border border-violet-500/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-300">
              Useful for comparing
              relative fitted effect
              magnitudes across
              differently scaled
              features.
            </p>
          </div>
        </div>
      </div>

      {/* WHY RAW MAGNITUDE CAN MISLEAD */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Why the largest raw
          coefficient is not
          automatically the strongest
          feature
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Suppose one feature is
          measured in square feet and
          another is measured in years.
          A one-unit change has a very
          different meaning for each.
          Because raw coefficients
          depend on measurement units,
          comparing only their
          numerical magnitudes can be
          misleading.
        </p>
      </div>

      {/* HOLDING CONSTANT */}

      <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="font-bold text-emerald-300">
          Why do we keep saying
          “holding other predictors
          constant”?
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Multiple Linear Regression
          estimates each coefficient
          while the other included
          predictors are also present
          in the equation. Therefore,
          the coefficient describes a
          conditional fitted
          relationship rather than a
          simple isolated
          relationship between one X
          variable and Y.
        </p>
      </div>

      {/* CORRELATED FEATURES */}

      <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
        <p className="font-bold text-rose-300">
          What if two predictors are
          strongly correlated?
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          If two features contain very
          similar linear information,
          the model may have difficulty
          separating their individual
          effects. Their coefficient
          estimates can become
          sensitive or unstable. This
          is called{" "}
          <strong className="text-white">
            multicollinearity
          </strong>
          .
        </p>

        <p className="mt-3 text-sm text-slate-400">
          We will examine this
          separately using the
          multicollinearity diagnostic.
        </p>
      </div>

      {/* COEFFICIENT VS CONTRIBUTION */}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-bold text-white">
          Coefficient ≠ contribution
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          The coefficient is a learned
          model parameter. It stays
          fixed after the model has
          been trained. A feature&apos;s
          contribution to one specific
          prediction also depends on
          that observation&apos;s
          feature value.
        </p>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="font-mono font-bold text-white">
            Contribution = coefficient
            × feature value
          </p>
        </div>
      </div>

      {/* FINAL MEMORY RULES */}

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Remember These Four Rules
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Rule
            number="1"
            text="The sign tells you the fitted direction."
          />

          <Rule
            number="2"
            text="Raw coefficients depend on measurement units."
          />

          <Rule
            number="3"
            text="Interpret a coefficient while holding the other included predictors constant."
          />

          <Rule
            number="4"
            text="A regression coefficient does not by itself establish causation."
          />
        </div>
      </div>
    </section>
  );
}

function ConceptCard({
  title,
  symbol,
  description,
}: {
  title: string;
  symbol: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="font-mono text-2xl font-black text-cyan-300">
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

function ValueCard({
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

      <p className="mt-1 font-mono font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function Rule({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-xs font-black text-cyan-300">
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