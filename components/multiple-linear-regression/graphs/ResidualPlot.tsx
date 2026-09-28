import { useMemo } from "react";

import type {
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface ResidualPlotProps {
  model: TrainedMultipleRegressionModel;
}

export default function ResidualPlot({
  model,
}: ResidualPlotProps) {
  const graph = useMemo(() => {
    const points = model.predictions.filter(
      (point) =>
        Number.isFinite(point.predicted) &&
        Number.isFinite(point.residual),
    );

    if (points.length === 0) {
      return null;
    }

    const predictedValues = points.map(
      (point) => point.predicted,
    );

    const residualValues = points.map(
      (point) => point.residual,
    );

    const xMin = Math.min(...predictedValues);
    const xMax = Math.max(...predictedValues);

    const maxResidualMagnitude = Math.max(
      ...residualValues.map((value) =>
        Math.abs(value),
      ),
      1,
    );

    const xRange = xMax - xMin || 1;

    return {
      points,

      xMin: xMin - xRange * 0.08,
      xMax: xMax + xRange * 0.08,

      yMin: -maxResidualMagnitude * 1.15,
      yMax: maxResidualMagnitude * 1.15,

      meanResidual:
        residualValues.reduce(
          (sum, value) => sum + value,
          0,
        ) / residualValues.length,
    };
  }, [model.predictions]);

  if (!graph) {
    return (
      <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
        <p className="font-bold text-amber-300">
          Residual plot unavailable
        </p>

        <p className="mt-2 text-sm text-slate-300">
          No valid residual values are available.
        </p>
      </section>
    );
  }

  const graphData = graph;

  const width = 760;
  const height = 500;

  const paddingLeft = 80;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 70;

  const plotWidth =
    width - paddingLeft - paddingRight;

  const plotHeight =
    height - paddingTop - paddingBottom;

  function xScale(value: number) {
    return (
      paddingLeft +
      ((value - graphData.xMin) /
        (graphData.xMax - graphData.xMin)) *
        plotWidth
    );
  }

  function yScale(value: number) {
    return (
      paddingTop +
      plotHeight -
      ((value - graphData.yMin) /
        (graphData.yMax - graphData.yMin)) *
        plotHeight
    );
  }

  const xTicks = createTicks(
    graphData.xMin,
    graphData.xMax,
    6,
  );

  const yTicks = createTicks(
    graphData.yMin,
    graphData.yMax,
    5,
  );

  const zeroY = yScale(0);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">
          Error Diagnostics
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Residual Plot
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          A residual tells us how far an actual value is
          from the model&apos;s prediction.
        </p>
      </div>

      {/* FORMULA */}

      <div className="mt-5 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
          Residual Formula
        </p>

        <p className="mt-2 font-mono text-lg font-bold text-white">
          Residual = Actual − Predicted
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          A positive residual means the actual value was
          higher than the prediction. A negative residual
          means the model predicted too high.
        </p>
      </div>

      {/* QUICK INFORMATION */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoCard
          label="Mean Residual"
          value={formatNumber(
            graphData.meanResidual,
          )}
          description="Average signed prediction error"
        />

        <InfoCard
          label="RMSE"
          value={formatNumber(
            model.metrics.rmse,
          )}
          description="Typical squared-error scale"
        />

        <InfoCard
          label="MAE"
          value={formatNumber(
            model.metrics.mae,
          )}
          description="Average absolute error"
        />
      </div>

      {/* GRAPH */}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px] w-full"
          role="img"
          aria-label="Residuals versus predicted values plot"
        >
          {/* GRID */}

          {xTicks.map((tick) => (
            <line
              key={`x-grid-${tick}`}
              x1={xScale(tick)}
              y1={paddingTop}
              x2={xScale(tick)}
              y2={paddingTop + plotHeight}
              stroke="currentColor"
              className="text-slate-800"
              strokeWidth="1"
            />
          ))}

          {yTicks.map((tick) => (
            <line
              key={`y-grid-${tick}`}
              x1={paddingLeft}
              y1={yScale(tick)}
              x2={paddingLeft + plotWidth}
              y2={yScale(tick)}
              stroke="currentColor"
              className="text-slate-800"
              strokeWidth="1"
            />
          ))}

          {/* ZERO RESIDUAL LINE */}

          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={paddingLeft + plotWidth}
            y2={zeroY}
            stroke="currentColor"
            className="text-emerald-400"
            strokeWidth="3"
            strokeDasharray="9 7"
          />

          {/* RESIDUAL POINTS */}

          {graphData.points.map((point) => {
            const cx = xScale(
              point.predicted,
            );

            const cy = yScale(
              point.residual,
            );

            return (
              <circle
                key={point.index}
                cx={cx}
                cy={cy}
                r="6"
                fill="currentColor"
                className="text-fuchsia-400"
              >
                <title>
                  {`Row ${point.index + 1}
Actual: ${formatNumber(point.actual)}
Predicted: ${formatNumber(point.predicted)}
Residual: ${formatNumber(point.residual)}`}
                </title>
              </circle>
            );
          })}

          {/* X AXIS */}

          <line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={paddingLeft + plotWidth}
            y2={paddingTop + plotHeight}
            stroke="currentColor"
            className="text-slate-500"
            strokeWidth="2"
          />

          {/* Y AXIS */}

          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + plotHeight}
            stroke="currentColor"
            className="text-slate-500"
            strokeWidth="2"
          />

          {/* X TICK LABELS */}

          {xTicks.map((tick) => (
            <text
              key={`x-label-${tick}`}
              x={xScale(tick)}
              y={
                paddingTop +
                plotHeight +
                27
              }
              textAnchor="middle"
              fill="currentColor"
              className="text-[11px] text-slate-400"
            >
              {shortNumber(tick)}
            </text>
          ))}

          {/* Y TICK LABELS */}

          {yTicks.map((tick) => (
            <text
              key={`y-label-${tick}`}
              x={paddingLeft - 12}
              y={yScale(tick) + 4}
              textAnchor="end"
              fill="currentColor"
              className="text-[11px] text-slate-400"
            >
              {shortNumber(tick)}
            </text>
          ))}

          {/* AXIS TITLES */}

          <text
            x={paddingLeft + plotWidth / 2}
            y={height - 15}
            textAnchor="middle"
            fill="currentColor"
            className="text-sm font-semibold text-slate-300"
          >
            Predicted {model.targetName}
          </text>

          <text
            transform={`translate(20 ${
              paddingTop + plotHeight / 2
            }) rotate(-90)`}
            textAnchor="middle"
            fill="currentColor"
            className="text-sm font-semibold text-slate-300"
          >
            Residual
          </text>
        </svg>
      </div>

      {/* INTERPRETATION */}

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PatternCard
          title="Random scatter"
          status="Good sign"
          text="Residuals randomly distributed above and below zero are consistent with a linear model capturing the main systematic pattern."
        />

        <PatternCard
          title="Curved pattern"
          status="Investigate"
          text="A visible curve can indicate that the relationship is not adequately represented by a purely linear equation."
        />

        <PatternCard
          title="Funnel shape"
          status="Investigate"
          text="Residual spread that grows or shrinks with predictions can indicate non-constant error variance."
        />

        <PatternCard
          title="Mostly one side"
          status="Investigate"
          text="Residuals systematically above or below zero can reveal prediction bias in part of the fitted range."
        />
      </div>

      {/* EDUCATIONAL EXPLANATION */}

      <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <p className="font-bold text-cyan-300">
          What should a student look for?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Do not look only for small residuals. Also inspect
          their pattern. For a well-specified linear model,
          we generally want residuals distributed around zero
          without a clear systematic shape. A visible pattern
          can tell us that the model is missing structure in
          the data.
        </p>
      </div>

      {/* IMPORTANT NOTE */}

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-bold text-white">
          Important
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          A residual plot is a diagnostic tool, not automatic
          proof that an assumption is satisfied or violated.
          The pattern should be considered together with the
          dataset, domain knowledge and other diagnostics.
        </p>
      </div>
    </section>
  );
}

function InfoCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PatternCard({
  title,
  status,
  text,
}: {
  title: string;
  status: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="font-bold text-slate-200">
        {title}
      </p>

      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
        {status}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function createTicks(
  minimum: number,
  maximum: number,
  count: number,
): number[] {
  if (count <= 1) {
    return [minimum];
  }

  const ticks: number[] = [];

  const step =
    (maximum - minimum) /
    (count - 1);

  for (
    let index = 0;
    index < count;
    index++
  ) {
    ticks.push(
      minimum + step * index,
    );
  }

  return ticks;
}

function shortNumber(
  value: number,
): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(1)}M`;
  }

  if (absolute >= 1_000) {
    return `${(
      value / 1_000
    ).toFixed(1)}K`;
  }

  if (
    absolute > 0 &&
    absolute < 0.01
  ) {
    return value.toExponential(1);
  }

  return value.toFixed(1);
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