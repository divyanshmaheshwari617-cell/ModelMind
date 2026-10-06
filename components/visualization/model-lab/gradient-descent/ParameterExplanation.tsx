"use client";

import type {
  ParameterDefinition,
} from "../config/parameterRegistry";

type ParameterExplanationProps = {
  parameter: ParameterDefinition;
};

export default function ParameterExplanation({
  parameter,
}: ParameterExplanationProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      {/* HEADER */}

      <div className="border-b border-zinc-800 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Parameter Explained
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-semibold text-zinc-100">
            {parameter.name}
          </h3>

          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
            {parameter.level}
          </span>
        </div>
      </div>

      {/* WHAT IS IT */}

      <div className="space-y-5 p-5">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            What is it?
          </p>

          <p className="mt-2 text-sm leading-7 text-zinc-300">
            {parameter.description}
          </p>
        </section>

        {/* WHAT DOES IT CONTROL */}

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm font-semibold text-zinc-200">
            What does it control?
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {parameter.whatItControls}
          </p>
        </section>

        {/* LOW VS HIGH */}

        <div className="grid gap-3 md:grid-cols-2">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Lower / Smaller Value
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {parameter.lowValueEffect}
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Higher / Larger Value
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {parameter.highValueEffect}
            </p>
          </section>
        </div>

        {/* VISUALIZATION */}

        <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-lg">
              ◉
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-100">
                What should I watch in the animation?
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {parameter.visualizationEffect}
              </p>
            </div>
          </div>
        </section>

        {/* CURRENT PARAMETER CONFIGURATION */}

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Parameter Configuration
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoRow
              label="Control"
              value={parameter.controlType}
            />

            <InfoRow
              label="Default"
              value={String(
                parameter.defaultValue
              )}
            />

            {parameter.min !== undefined && (
              <InfoRow
                label="Minimum"
                value={String(parameter.min)}
              />
            )}

            {parameter.max !== undefined && (
              <InfoRow
                label="Maximum"
                value={String(parameter.max)}
              />
            )}

            {parameter.step !== undefined && (
              <InfoRow
                label="Step"
                value={String(parameter.step)}
              />
            )}
          </div>
        </section>

        {/* OPTIONS */}

        {parameter.options &&
          parameter.options.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Available Options
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {parameter.options.map(
                  (option) => (
                    <span
                      key={option}
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300"
                    >
                      {option}
                    </span>
                  )
                )}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
      <span className="text-xs text-zinc-500">
        {label}
      </span>

      <span className="break-all text-right font-mono text-xs font-medium text-zinc-200">
        {value}
      </span>
    </div>
  );
}