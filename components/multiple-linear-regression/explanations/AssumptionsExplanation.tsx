export default function AssumptionsExplanation() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
          Model Diagnostics
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Multiple Linear Regression Assumptions
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Regression metrics alone do not tell the
          whole story. Before interpreting a fitted
          Multiple Linear Regression model, we should
          also examine whether its assumptions are
          reasonably supported.
        </p>
      </div>

      {/* OVERVIEW */}

      <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <p className="font-bold text-cyan-300">
          Why assumptions matter
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Ordinary Least Squares can still calculate
          coefficients when assumptions are violated,
          but violations can make predictions,
          coefficient interpretation, uncertainty
          estimates, or statistical inference less
          reliable.
        </p>
      </div>

      {/* ASSUMPTIONS */}

      <div className="mt-6 space-y-4">
        <AssumptionCard
          number="01"
          title="Linearity"
          short="The target should have an approximately linear relationship with the predictors."
          check="Look at residual plots. Strong curved patterns can indicate that the linear form is missing structure."
          violation="The model may systematically underpredict or overpredict in different regions."
        />

        <AssumptionCard
          number="02"
          title="Independence of Errors"
          short="Residuals should not systematically depend on one another."
          check="Consider how observations were collected. Ordered or time-based data may require additional diagnostics for autocorrelation."
          violation="Standard regression uncertainty calculations can become misleading when errors are dependent."
        />

        <AssumptionCard
          number="03"
          title="Constant Error Variance"
          short="The spread of residuals should be reasonably stable across fitted values."
          check="Inspect the residual-vs-predicted plot. A strong funnel or widening pattern can suggest non-constant variance."
          violation="This condition is commonly called heteroscedasticity and can affect standard-error based inference."
        />

        <AssumptionCard
          number="04"
          title="No Perfect Multicollinearity"
          short="A predictor should not be an exact linear combination of the other predictors."
          check="Inspect feature correlations and, for deeper analysis, diagnostics such as VIF or condition numbers."
          violation="The model may be unable to uniquely estimate individual coefficients."
        />

        <AssumptionCard
          number="05"
          title="Residual Normality for Inference"
          short="For classical small-sample hypothesis tests and confidence intervals, residual normality can be important."
          check="A histogram or Q-Q plot of residuals can help assess their distribution."
          violation="Strong departures from normality can affect classical inferential procedures, especially in smaller samples."
        />

        <AssumptionCard
          number="06"
          title="Appropriate Model Specification"
          short="Important structure should not be systematically omitted from the model."
          check="Use domain knowledge and residual diagnostics to look for missing nonlinearities, interactions, or relevant predictors."
          violation="A model can have biased or systematically incorrect predictions when important structure is omitted."
        />
      </div>

      {/* RESIDUAL CONNECTION */}

      <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Why ModelMind Includes a Residual Plot
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Residuals are one of the most useful ways
          to diagnose a regression model because
          they show what remains unexplained after
          prediction.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <PatternCard
            title="Random-looking scatter"
            text="Generally more consistent with the linear model capturing the main systematic pattern."
          />

          <PatternCard
            title="Curved pattern"
            text="Can suggest that the relationship is not adequately represented by a purely linear equation."
          />

          <PatternCard
            title="Funnel shape"
            text="Can suggest that residual variance changes as predicted values increase or decrease."
          />

          <PatternCard
            title="Large isolated residuals"
            text="Can identify observations worth investigating for outliers, unusual cases, or data-quality problems."
          />
        </div>
      </div>

      {/* MULTICOLLINEARITY */}

      <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
        <p className="font-bold text-rose-300">
          Multicollinearity deserves separate attention
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Strongly related predictors can make
          individual coefficient estimates unstable
          even when the model still produces useful
          predictions. That is why ModelMind provides
          a separate multicollinearity diagnostic
          instead of treating prediction accuracy as
          the only concern.
        </p>
      </div>

      {/* NORMALITY CLARIFICATION */}

      <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
        <p className="font-bold text-blue-300">
          A common misunderstanding
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Multiple Linear Regression does{" "}
          <strong className="text-white">
            not require every input feature to be
            normally distributed
          </strong>
          . The classical normality assumption concerns
          the model errors when performing standard
          inferential procedures.
        </p>
      </div>

      {/* OUTLIERS */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Outliers and influential observations
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          A small number of unusual observations can
          sometimes have a large effect on a fitted
          regression model. Large residuals are one
          clue, but influence also depends on unusual
          predictor values and how strongly an
          observation changes the fitted coefficients.
        </p>

        <p className="mt-3 text-sm text-slate-400">
          Advanced regression diagnostics can include
          leverage and Cook&apos;s distance.
        </p>
      </div>

      {/* CHECKLIST */}

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          ModelMind Regression Checklist
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ChecklistItem
            number="1"
            text="Check whether a linear relationship is reasonable."
          />

          <ChecklistItem
            number="2"
            text="Inspect residuals for systematic patterns."
          />

          <ChecklistItem
            number="3"
            text="Check whether residual spread changes strongly."
          />

          <ChecklistItem
            number="4"
            text="Investigate strongly correlated predictors."
          />

          <ChecklistItem
            number="5"
            text="Investigate unusual or influential observations."
          />

          <ChecklistItem
            number="6"
            text="Use domain knowledge to judge whether important structure is missing."
          />
        </div>
      </div>

      {/* FINAL RULE */}

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="font-bold text-emerald-300">
          The important lesson
        </p>

        <p className="mt-3 text-lg font-black leading-8 text-white">
          A high R² does not automatically mean that
          every regression assumption is satisfied.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Evaluate the metrics, residual behavior,
          predictor relationships and real-world
          meaning of the model together.
        </p>
      </div>
    </section>
  );
}

function AssumptionCard({
  number,
  title,
  short,
  check,
  violation,
}: {
  number: string;
  title: string;
  short: string;
  check: string;
  violation: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs font-black text-amber-300">
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-7 text-slate-300">
            {short}
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                How to investigate
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {check}
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
                If violated
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {violation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatternCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-violet-500/10 bg-slate-950/40 p-4">
      <p className="font-bold text-white">
        {title}
      </p>

      <p className="mt-2 text-xs leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function ChecklistItem({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-black text-emerald-300">
        {number}
      </div>

      <p className="pt-1 text-sm leading-6 text-slate-300">
        {text}
      </p>
    </div>
  );
}