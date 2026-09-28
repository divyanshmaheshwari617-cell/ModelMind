import { useMemo } from "react";

import type {
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface ActualVsPredictedGraphProps {
  model: TrainedMultipleRegressionModel;
}

export default function ActualVsPredictedGraph({
  model,
}: ActualVsPredictedGraphProps) {
  const graph = useMemo(() => {
    const points = model.predictions.filter(
      (point) =>
        Number.isFinite(point.actual) &&
        Number.isFinite(point.predicted),
    );

    if (points.length === 0) {
      return null;
    }

    const values = points.flatMap((point) => [
      point.actual,
      point.predicted,
    ]);

    const minimum = Math.min(...values);
    const maximum = Math.max(...values);

    const range = maximum - minimum || 1;
    const padding = range * 0.08;

    return {
      points,
      minimum: minimum - padding,
      maximum: maximum + padding,
    };
  }, [model.predictions]);

  if (!graph) {
    return (
      <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
        <p className="font-bold text-amber-300">
          Actual vs Predicted graph unavailable
        </p>

        <p className="mt-2 text-sm text-slate-300">
          No valid predictions are available to display.
        </p>
      </section>
    );
  }

  /*
   * Keep a permanently non-null reference.
   *
   * TypeScript can lose the graph !== null narrowing
   * inside nested functions such as xScale() and yScale().
   */
  const graphData = graph;

  const width = 700;
  const height = 480;

  const paddingLeft = 75;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 65;

  const plotWidth =
    width - paddingLeft - paddingRight;

  const plotHeight =
    height - paddingTop - paddingBottom;

  function xScale(value: number) {
    return (
      paddingLeft +
      ((value - graphData.minimum) /
        (graphData.maximum - graphData.minimum)) *
        plotWidth
    );
  }

  function yScale(value: number) {
    return (
      paddingTop +
      plotHeight -
      ((value - graphData.minimum) /
        (graphData.maximum - graphData.minimum)) *
        plotHeight
    );
  }

  const ticks = createTicks(
    graphData.minimum,
    graphData.maximum,
    5,
  );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          Prediction Quality
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Actual vs Predicted
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Each point compares the real{" "}
          <strong className="text-slate-200">
            {model.targetName}
          </strong>{" "}
          value with the value predicted by the model.
        </p>
      </div>

      {/* METRICS */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="R²"
          value={formatNumber(model.metrics.r2)}
          description="Explained variation"
        />

        <MetricCard
          label="RMSE"
          value={formatNumber(model.metrics.rmse)}
          description="Typical error size"
        />

        <MetricCard
          label="MAE"
          value={formatNumber(model.metrics.mae)}
          description="Average absolute error"
        />
      </div>

      {/* GRAPH */}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[650px] w-full"
          role="img"
          aria-label="Actual versus predicted regression graph"
        >
          {/* GRID */}

          {ticks.map((tick) => (
            <g key={`grid-${tick}`}>
              <line
                x1={xScale(tick)}
                y1={paddingTop}
                x2={xScale(tick)}
                y2={paddingTop + plotHeight}
                stroke="currentColor"
                className="text-slate-800"
                strokeWidth="1"
              />

              <line
                x1={paddingLeft}
                y1={yScale(tick)}
                x2={paddingLeft + plotWidth}
                y2={yScale(tick)}
                stroke="currentColor"
                className="text-slate-800"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* PERFECT PREDICTION LINE */}

          <line
            x1={xScale(graphData.minimum)}
            y1={yScale(graphData.minimum)}
            x2={xScale(graphData.maximum)}
            y2={yScale(graphData.maximum)}
            stroke="currentColor"
            className="text-emerald-400"
            strokeWidth="3"
            strokeDasharray="8 7"
          />

          {/* DATA POINTS */}

          {graphData.points.map((point) => {
            const cx = xScale(point.actual);
            const cy = yScale(point.predicted);

            return (
              <g key={point.index}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="currentColor"
                  className="text-blue-400"
                >
                  <title>
                    {`Row ${point.index + 1}
Actual: ${formatNumber(point.actual)}
Predicted: ${formatNumber(point.predicted)}
Residual: ${formatNumber(point.residual)}`}
                  </title>
                </circle>
              </g>
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

          {/* TICK LABELS */}

          {ticks.map((tick) => (
            <g key={`label-${tick}`}>
              <text
                x={xScale(tick)}
                y={paddingTop + plotHeight + 25}
                textAnchor="middle"
                fill="currentColor"
                className="text-[11px] text-slate-400"
              >
                {shortNumber(tick)}
              </text>

              <text
                x={paddingLeft - 12}
                y={yScale(tick) + 4}
                textAnchor="end"
                fill="currentColor"
                className="text-[11px] text-slate-400"
              >
                {shortNumber(tick)}
              </text>
            </g>
          ))}

          {/* X AXIS TITLE */}

          <text
            x={paddingLeft + plotWidth / 2}
            y={height - 15}
            textAnchor="middle"
            fill="currentColor"
            className="text-sm font-semibold text-slate-300"
          >
            Actual {model.targetName}
          </text>

          {/* Y AXIS TITLE */}

          <text
            transform={`translate(20 ${
              paddingTop + plotHeight / 2
            }) rotate(-90)`}
            textAnchor="middle"
            fill="currentColor"
            className="text-sm font-semibold text-slate-300"
          >
            Predicted {model.targetName}
          </text>
        </svg>
      </div>

      {/* EXPLANATIONS */}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ExplanationCard
          title="Perfect prediction line"
          text="The dashed diagonal represents Actual = Predicted. A perfect model would place every point on this line."
        />

        <ExplanationCard
          title="Close to the line"
          text="Points close to the diagonal have similar actual and predicted values, so their prediction errors are small."
        />

        <ExplanationCard
          title="Far from the line"
          text="A point far from the diagonal represents an observation where the model made a larger prediction error."
        />
      </div>

      {/* LEARNING EXPLANATION */}

      <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
        <p className="font-bold text-blue-300">
          How do I judge this graph?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Look for points clustering around the dashed
          diagonal. The closer they are to that line,
          the closer the predictions are to the actual
          values. Also use R², RMSE and MAE alongside
          this graph rather than judging model quality
          from the picture alone.
        </p>
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Metric Card
|--------------------------------------------------------------------------
*/

function MetricCard({
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
| Create Axis Ticks
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Short Number Formatting
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| General Number Formatting
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

  return value.toFixed(3);
}