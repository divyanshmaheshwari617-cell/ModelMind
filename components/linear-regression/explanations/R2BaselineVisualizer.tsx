"use client";

type DataPoint = {
  x: number;
  y: number;
};

type PredictionPoint = DataPoint & {
  predicted: number;
  residual: number;
  squaredError: number;
};

type R2BaselineVisualizerProps = {
  data: PredictionPoint[];
  r2: number;
};

export default function R2BaselineVisualizer({
  data,
  r2,
}: R2BaselineVisualizerProps) {
  if (data.length === 0) {
    return null;
  }

  const meanY =
    data.reduce((sum, point) => sum + point.y, 0) /
    data.length;

  const ssResidual = data.reduce(
    (sum, point) => sum + point.squaredError,
    0
  );

  const ssTotal = data.reduce(
    (sum, point) =>
      sum + Math.pow(point.y - meanY, 2),
    0
  );

  const width = 760;
  const height = 390;

  const padding = {
    top: 30,
    right: 35,
    bottom: 60,
    left: 65,
  };

  const plotWidth =
    width - padding.left - padding.right;

  const plotHeight =
    height - padding.top - padding.bottom;

  const xValues = data.map((point) => point.x);

  const yValues = data.flatMap((point) => [
    point.y,
    point.predicted,
    meanY,
  ]);

  const minX = Math.min(...xValues) - 1;
  const maxX = Math.max(...xValues) + 1;

  const rawMinY = Math.min(...yValues);
  const rawMaxY = Math.max(...yValues);

  const yMargin = Math.max(
    2,
    (rawMaxY - rawMinY) * 0.15
  );

  const minY = rawMinY - yMargin;
  const maxY = rawMaxY + yMargin;

  const scaleX = (x: number) =>
    padding.left +
    ((x - minX) / (maxX - minX)) *
      plotWidth;

  const scaleY = (y: number) =>
    padding.top +
    plotHeight -
    ((y - minY) / (maxY - minY)) *
      plotHeight;

  const explainedPercent =
    Math.max(0, Math.min(100, r2 * 100));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
          R² Visualizer
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          What does R² actually mean?
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          R² compares your regression model against a very simple
          baseline model that predicts the mean of Y for every
          observation.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Mean of Y
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ȳ = {meanY.toFixed(3)}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            The baseline predicts this same value for every X.
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
            SSres
          </p>

          <p className="mt-2 text-2xl font-bold text-orange-700">
            {ssResidual.toFixed(3)}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Error remaining after using your regression model.
          </p>
        </div>

        <div className="rounded-xl bg-purple-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
            SStot
          </p>

          <p className="mt-2 text-2xl font-bold text-purple-700">
            {ssTotal.toFixed(3)}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Error from simply predicting the mean of Y.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px] w-full"
          role="img"
          aria-label="R squared baseline visualization"
        >
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            rx="12"
            fill="#f8fafc"
          />

          <line
            x1={padding.left}
            y1={scaleY(meanY)}
            x2={width - padding.right}
            y2={scaleY(meanY)}
            stroke="#9333ea"
            strokeWidth="3"
            strokeDasharray="8 6"
          />

          {data.map((point, index) => {
            const x = scaleX(point.x);

            return (
              <g key={`${point.x}-${index}`}>
                <line
                  x1={x}
                  y1={scaleY(point.y)}
                  x2={x}
                  y2={scaleY(meanY)}
                  stroke="#c084fc"
                  strokeWidth="2"
                  opacity="0.55"
                />

                <circle
                  cx={x}
                  cy={scaleY(point.y)}
                  r="7"
                  fill="#0f172a"
                  stroke="white"
                  strokeWidth="2"
                />

                <rect
                  x={x - 5}
                  y={scaleY(point.predicted) - 5}
                  width="10"
                  height="10"
                  rx="2"
                  fill="#2563eb"
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          <text
            x={width - padding.right - 8}
            y={scaleY(meanY) - 10}
            textAnchor="end"
            fontSize="12"
            fontWeight="700"
            fill="#9333ea"
          >
            Baseline: ȳ = {meanY.toFixed(2)}
          </text>

          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#475569"
            strokeWidth="1.5"
          />

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#475569"
            strokeWidth="1.5"
          />

          <text
            x={padding.left + plotWidth / 2}
            y={height - 15}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#334155"
          >
            Feature X
          </text>

          <text
            x="18"
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#334155"
            transform={`rotate(-90 18 ${
              padding.top + plotHeight / 2
            })`}
          >
            Target Y
          </text>
        </svg>
      </div>

      <div className="mt-5 flex flex-wrap gap-5 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-900" />
          Actual Y
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-blue-600" />
          Regression prediction
        </div>

        <div className="flex items-center gap-2">
          <span className="h-[2px] w-7 border-t-2 border-dashed border-purple-600" />
          Mean baseline
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
          R² Formula
        </p>

        <p className="mt-3 text-xl font-bold">
          R² = 1 − SSres / SStot
        </p>

        <p className="mt-3 font-mono text-sm text-slate-300">
          R² = 1 − {ssResidual.toFixed(3)} /{" "}
          {ssTotal.toFixed(3)}
        </p>

        <p className="mt-2 text-2xl font-bold">
          R² = {r2.toFixed(3)}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
        <p className="text-sm font-bold text-cyan-800">
          Interpretation
        </p>

        {r2 >= 0 ? (
          <p className="mt-2 text-sm leading-6 text-slate-700">
            On this dataset, the current model explains approximately{" "}
            <strong>{explainedPercent.toFixed(1)}%</strong> of the
            variation in Y relative to the mean-only baseline.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-700">
            The current R² is negative. That means this line has a
            larger squared-error total than simply predicting the
            mean of Y for every observation.
          </p>
        )}
      </div>
    </div>
  );
}