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

type RegressionFitGraphProps = {
  data: PredictionPoint[];
  slope: number;
  intercept: number;
};

export default function RegressionFitGraph({
  data,
  slope,
  intercept,
}: RegressionFitGraphProps) {
  const width = 760;
  const height = 430;

  const padding = {
    top: 30,
    right: 35,
    bottom: 60,
    left: 65,
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        No data available.
      </div>
    );
  }

  const xValues = data.map((point) => point.x);

  const yValues = data.flatMap((point) => [
    point.y,
    point.predicted,
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

  const scaleX = (x: number) => {
    return (
      padding.left +
      ((x - minX) / (maxX - minX)) * plotWidth
    );
  };

  const scaleY = (y: number) => {
    return (
      padding.top +
      plotHeight -
      ((y - minY) / (maxY - minY)) * plotHeight
    );
  };

  const regressionStartY =
    slope * minX + intercept;

  const regressionEndY =
    slope * maxX + intercept;

  const xTicks = Array.from(
    { length: 7 },
    (_, index) =>
      minX + ((maxX - minX) / 6) * index
  );

  const yTicks = Array.from(
    { length: 6 },
    (_, index) =>
      minY + ((maxY - minY) / 5) * index
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          Interactive Regression Line
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          The circles are actual observations. The squares are
          predictions. The vertical dashed lines show the residual
          error between the actual value and the model prediction.
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px] w-full"
          role="img"
          aria-label="Interactive linear regression graph"
        >
          {/* Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            rx="12"
            fill="#f8fafc"
          />

          {/* Horizontal grid */}
          {yTicks.map((tick, index) => {
            const y = scaleY(tick);

            return (
              <g key={`y-${index}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Vertical grid */}
          {xTicks.map((tick, index) => {
            const x = scaleX(tick);

            return (
              <g key={`x-${index}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                <text
                  x={x}
                  y={height - padding.bottom + 25}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Axes */}
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

          {/* Axis labels */}
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

          {/* Residual lines */}
          {data.map((point, index) => {
            const x = scaleX(point.x);
            const actualY = scaleY(point.y);
            const predictedY = scaleY(point.predicted);

            return (
              <line
                key={`residual-${index}`}
                x1={x}
                y1={actualY}
                x2={x}
                y2={predictedY}
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="5 5"
                opacity="0.8"
              />
            );
          })}

          {/* Regression line */}
          <line
            x1={scaleX(minX)}
            y1={scaleY(regressionStartY)}
            x2={scaleX(maxX)}
            y2={scaleY(regressionEndY)}
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Predicted points */}
          {data.map((point, index) => {
            const x = scaleX(point.x);
            const y = scaleY(point.predicted);

            return (
              <rect
                key={`prediction-${index}`}
                x={x - 5}
                y={y - 5}
                width="10"
                height="10"
                rx="2"
                fill="#2563eb"
                stroke="white"
                strokeWidth="2"
              >
                <title>
                  {`Prediction: x=${point.x}, ŷ=${point.predicted.toFixed(
                    2
                  )}`}
                </title>
              </rect>
            );
          })}

          {/* Actual points */}
          {data.map((point, index) => {
            const x = scaleX(point.x);
            const y = scaleY(point.y);

            return (
              <circle
                key={`actual-${index}`}
                cx={x}
                cy={y}
                r="7"
                fill="#0f172a"
                stroke="white"
                strokeWidth="2"
              >
                <title>
                  {`Actual: x=${point.x}, y=${point.y}`}
                </title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-900" />
          Actual data
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-blue-600" />
          Predicted value
        </div>

        <div className="flex items-center gap-2">
          <span className="h-[3px] w-7 rounded bg-blue-600" />
          Regression line
        </div>

        <div className="flex items-center gap-2">
          <span className="h-[2px] w-7 border-t-2 border-dashed border-orange-500" />
          Residual
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Current Model
        </p>

        <p className="mt-1 text-lg font-bold text-slate-900">
          ŷ = {slope.toFixed(2)}x{" "}
          {intercept >= 0 ? "+" : "−"}{" "}
          {Math.abs(intercept).toFixed(2)}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Change the slope to rotate the line. Change the
          intercept to move the line vertically.
        </p>
      </div>
    </div>
  );
}