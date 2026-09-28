import type {
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface RegressionMetricsProps {
  model: TrainedMultipleRegressionModel;
}

export default function RegressionMetrics({
  model,
}: RegressionMetricsProps) {
  const { mse, rmse, mae, r2 } =
    model.metrics;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
          Model Evaluation
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Regression Metrics
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          These metrics summarize different
          aspects of how closely the model&apos;s
          predictions match the actual target
          values.
        </p>
      </div>

      {/* LIVE METRICS */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          name="MSE"
          value={formatNumber(mse)}
          subtitle="Mean Squared Error"
          description="Average squared prediction error."
        />

        <MetricCard
          name="RMSE"
          value={formatNumber(rmse)}
          subtitle="Root Mean Squared Error"
          description={`Typical error magnitude expressed in the same units as ${model.targetName}.`}
        />

        <MetricCard
          name="MAE"
          value={formatNumber(mae)}
          subtitle="Mean Absolute Error"
          description={`Average absolute prediction error in ${model.targetName} units.`}
        />

        <MetricCard
          name="R²"
          value={formatR2(r2)}
          subtitle="Coefficient of Determination"
          description="Compares the fitted model with predicting the target mean."
        />
      </div>

      {/* MSE */}

      <MetricExplanation
        number="01"
        title="Mean Squared Error"
        abbreviation="MSE"
        formula="MSE = (1/n) Σ(yᵢ − ŷᵢ)²"
        value={formatNumber(mse)}
      >
        MSE squares every residual before
        averaging. Squaring prevents positive and
        negative residuals from cancelling each
        other and gives larger errors more weight.
      </MetricExplanation>

      {/* RMSE */}

      <MetricExplanation
        number="02"
        title="Root Mean Squared Error"
        abbreviation="RMSE"
        formula="RMSE = √MSE"
        value={formatNumber(rmse)}
      >
        RMSE takes the square root of MSE. This
        brings the error measure back to the same
        units as the target, which often makes it
        easier to interpret.
      </MetricExplanation>

      {/* MAE */}

      <MetricExplanation
        number="03"
        title="Mean Absolute Error"
        abbreviation="MAE"
        formula="MAE = (1/n) Σ|yᵢ − ŷᵢ|"
        value={formatNumber(mae)}
      >
        MAE calculates the average absolute
        prediction error. Unlike MSE, it does not
        square errors, so very large errors do not
        receive the same extra quadratic penalty.
      </MetricExplanation>

      {/* R2 */}

      <MetricExplanation
        number="04"
        title="Coefficient of Determination"
        abbreviation="R²"
        formula="R² = 1 − SSres / SStot"
        value={formatR2(r2)}
      >
        R² compares the model&apos;s squared error
        with a baseline that always predicts the
        mean of the observed target values.
      </MetricExplanation>

      {/* R2 INTERPRETATION */}

      <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="font-bold text-violet-300">
          How should you read R²?
        </p>

        <div className="mt-4 space-y-3">
          <InterpretationRow
            label="R² = 1"
            text="The fitted predictions perfectly match the observed target values on this evaluated dataset."
          />

          <InterpretationRow
            label="R² = 0"
            text="The model performs like the target-mean baseline in terms of squared error."
          />

          <InterpretationRow
            label="R² < 0"
            text="The model has greater squared error than simply predicting the target mean."
          />
        </div>

        <p className="mt-4 text-xs leading-6 text-slate-400">
          R² is not generally restricted to 0–1
          when evaluating arbitrary predictions,
          especially on unseen data.
        </p>
      </div>

      {/* ERROR COMPARISON */}

      <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
        <p className="font-bold text-blue-300">
          RMSE vs MAE
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CompareCard
            title="RMSE"
            text="Squares errors before averaging, so larger prediction mistakes influence it more strongly."
          />

          <CompareCard
            title="MAE"
            text="Uses absolute errors, giving a more direct average magnitude of prediction mistakes."
          />
        </div>
      </div>

      {/* LOWER / HIGHER */}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Error Metrics
          </p>

          <p className="mt-2 text-lg font-black text-white">
            Lower is generally better
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            For MSE, RMSE and MAE, smaller values
            mean predictions are closer to the
            actual values on the evaluated data.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            R²
          </p>

          <p className="mt-2 text-lg font-black text-white">
            Higher indicates better relative fit
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            But a high R² alone does not prove that
            the model is appropriate, causal, or
            good at generalizing to unseen data.
          </p>
        </div>
      </div>

      {/* SCALE WARNING */}

      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Is this RMSE or MAE “good”?
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          There is no universal RMSE or MAE value
          that is good for every dataset. Their
          meaning depends on the scale of{" "}
          <strong className="text-white">
            {model.targetName}
          </strong>
          , the application, the cost of errors,
          and how the model compares with useful
          baselines or alternative models.
        </p>
      </div>

      {/* TRAINING WARNING */}

      <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
        <p className="font-bold text-rose-300">
          Training performance is not the same as
          generalization
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          If these metrics are calculated on the
          same observations used to fit the model,
          they describe in-sample fit. To estimate
          performance on unseen examples, evaluate
          the model using a proper validation or
          test dataset.
        </p>
      </div>

      {/* FINAL LESSON */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-bold text-white">
          Don&apos;t judge a regression model using
          one number
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Use MSE, RMSE, MAE and R² together with
          residual plots, multicollinearity checks,
          assumptions, domain knowledge and
          out-of-sample evaluation.
        </p>
      </div>
    </section>
  );
}

function MetricCard({
  name,
  value,
  subtitle,
  description,
}: {
  name: string;
  value: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
        {name}
      </p>

      <p className="mt-2 break-all font-mono text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-xs font-bold text-slate-300">
        {subtitle}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function MetricExplanation({
  number,
  title,
  abbreviation,
  formula,
  value,
  children,
}: {
  number: string;
  title: string;
  abbreviation: string;
  formula: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-black text-emerald-300">
            {number}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {abbreviation}
            </p>

            <h3 className="mt-1 text-lg font-bold text-white">
              {title}
            </h3>
          </div>
        </div>

        <p className="font-mono text-xl font-black text-white">
          {value}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <p className="overflow-x-auto whitespace-nowrap font-mono text-sm font-bold text-cyan-300">
          {formula}
        </p>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-400">
        {children}
      </p>
    </div>
  );
}

function InterpretationRow({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-violet-500/10 bg-slate-950/40 p-4">
      <span className="shrink-0 font-mono text-sm font-black text-violet-300">
        {label}
      </span>

      <p className="text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function CompareCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-blue-500/10 bg-slate-950/40 p-4">
      <p className="font-bold text-white">
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
    return value.toExponential(4);
  }

  return value.toFixed(4);
}

function formatR2(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(4);
}