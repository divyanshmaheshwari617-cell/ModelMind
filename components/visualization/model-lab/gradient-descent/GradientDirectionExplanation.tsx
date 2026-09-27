"use client";

type GradientDirectionExplanationProps = {
  weightGradient: number;
  biasGradient: number;
  learningRate: number;
  weight: number;
  bias: number;
};

export default function GradientDirectionExplanation({
  weightGradient,
  biasGradient,
  learningRate,
  weight,
  bias,
}: GradientDirectionExplanationProps) {
  const weightChange =
    -learningRate *
    weightGradient;

  const biasChange =
    -learningRate *
    biasGradient;

  const nextWeight =
    weight + weightChange;

  const nextBias =
    bias + biasChange;

  const gradientMagnitude =
    Math.sqrt(
      weightGradient *
        weightGradient +
        biasGradient *
          biasGradient
    );

  const isStable =
    Number.isFinite(
      gradientMagnitude
    );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      {/* HEADER */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Gradient Direction
        </p>

        <h3 className="mt-2 text-lg font-semibold text-zinc-100">
          Why does Gradient Descent move
          in this direction?
        </h3>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
          The gradient tells us which
          direction increases the loss
          fastest. Gradient Descent
          moves in the opposite
          direction — the negative
          gradient — to reduce the
          loss.
        </p>
      </div>

      {/* MAIN FLOW */}

      <div className="mt-6 grid gap-3 lg:grid-cols-5">
        <FlowCard
          step="1"
          title="Current Parameters"
          description="Where the optimizer is currently located."
          value={`w = ${formatNumber(
            weight
          )}, b = ${formatNumber(
            bias
          )}`}
        />

        <Arrow />

        <FlowCard
          step="2"
          title="Calculate Gradient"
          description="Measure how loss changes with weight and bias."
          value={`∂J/∂w = ${formatNumber(
            weightGradient
          )}, ∂J/∂b = ${formatNumber(
            biasGradient
          )}`}
        />

        <Arrow />

        <FlowCard
          step="3"
          title="Move Opposite"
          description="Subtract the gradient instead of following it uphill."
          value="− Gradient"
        />
      </div>

      {/* UPDATE EQUATIONS */}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Weight Update
          </p>

          <div className="mt-4 space-y-2 font-mono text-sm text-zinc-300">
            <p>
              w(new) =
              w − η × ∂J/∂w
            </p>

            <p className="text-zinc-500">
              {formatNumber(
                weight
              )} −{" "}
              {formatNumber(
                learningRate
              )} ×{" "}
              {formatNumber(
                weightGradient
              )}
            </p>

            <p className="pt-2 text-base font-semibold text-cyan-300">
              w(new) ={" "}
              {formatNumber(
                nextWeight
              )}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Bias Update
          </p>

          <div className="mt-4 space-y-2 font-mono text-sm text-zinc-300">
            <p>
              b(new) =
              b − η × ∂J/∂b
            </p>

            <p className="text-zinc-500">
              {formatNumber(
                bias
              )} −{" "}
              {formatNumber(
                learningRate
              )} ×{" "}
              {formatNumber(
                biasGradient
              )}
            </p>

            <p className="pt-2 text-base font-semibold text-cyan-300">
              b(new) ={" "}
              {formatNumber(
                nextBias
              )}
            </p>
          </div>
        </div>
      </div>

      {/* DIRECTION VISUALIZATION */}

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Direction of movement
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Positive gradient values
              mean increasing that
              parameter increases loss
              locally. Negative gradient
              values mean the opposite.
              Gradient Descent always
              applies the negative
              gradient.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-zinc-600">
              Gradient magnitude
            </p>

            <p className="mt-1 font-mono text-sm font-semibold text-zinc-200">
              {formatNumber(
                gradientMagnitude
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <DirectionCard
            parameter="Weight"
            gradient={
              weightGradient
            }
            change={
              weightChange
            }
          />

          <DirectionCard
            parameter="Bias"
            gradient={
              biasGradient
            }
            change={
              biasChange
            }
          />
        </div>
      </div>

      {/* LEARNING RATE */}

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <p className="text-sm font-semibold text-zinc-200">
          Where does the learning rate
          fit?
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          The gradient decides the
          direction. The learning rate
          controls how large the step
          is in that direction.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Metric
            label="Learning Rate"
            value={formatNumber(
              learningRate
            )}
          />

          <Metric
            label="Δ Weight"
            value={formatSigned(
              weightChange
            )}
          />

          <Metric
            label="Δ Bias"
            value={formatSigned(
              biasChange
            )}
          />

          <Metric
            label="Gradient Size"
            value={formatNumber(
              gradientMagnitude
            )}
          />
        </div>
      </div>

      {/* WARNING */}

      {!isStable && (
        <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
          <p className="text-sm font-semibold text-red-300">
            Gradient became unstable
          </p>

          <p className="mt-2 text-sm leading-6 text-red-400/80">
            The gradient is no longer
            finite. This commonly
            happens when the learning
            rate is too large and the
            optimization process
            diverges.
          </p>
        </div>
      )}

      {/* SUMMARY */}

      <div className="mt-5 rounded-xl border border-cyan-900/30 bg-cyan-950/10 p-5">
        <p className="text-sm font-semibold text-cyan-300">
          Remember
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Gradient = direction of
          steepest increase in loss.
          Negative gradient = downhill
          direction. Learning rate =
          size of the step.
        </p>
      </div>
    </div>
  );
}

/*
========================================================
SMALL COMPONENTS
========================================================
*/

function FlowCard({
  step,
  title,
  description,
  value,
}: {
  step: string;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 font-mono text-xs font-semibold text-zinc-300">
        {step}
      </div>

      <p className="mt-3 text-sm font-semibold text-zinc-200">
        {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {description}
      </p>

      <p className="mt-3 break-words font-mono text-xs text-cyan-300">
        {value}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden items-center justify-center text-xl text-zinc-700 lg:flex">
      →
    </div>
  );
}

function DirectionCard({
  parameter,
  gradient,
  change,
}: {
  parameter: string;
  gradient: number;
  change: number;
}) {
  const direction =
    change > 0
      ? "Increase"
      : change < 0
        ? "Decrease"
        : "No movement";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-200">
          {parameter}
        </p>

        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-400">
          {direction}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric
          label="Gradient"
          value={formatNumber(
            gradient
          )}
        />

        <Metric
          label="Parameter Change"
          value={formatSigned(
            change
          )}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
      <p className="text-[10px] uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-all font-mono text-xs font-semibold text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function formatNumber(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "Infinity";
  }

  if (
    Math.abs(value) >= 100000
  ) {
    return value.toExponential(
      2
    );
  }

  if (
    Math.abs(value) <
      0.0001 &&
    value !== 0
  ) {
    return value.toExponential(
      2
    );
  }

  return value.toFixed(4);
}

function formatSigned(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "Infinity";
  }

  const formatted =
    formatNumber(value);

  if (value > 0) {
    return `+${formatted}`;
  }

  return formatted;
}