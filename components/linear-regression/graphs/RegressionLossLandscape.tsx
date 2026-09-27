"use client";

type DataPoint = {
  x: number;
  y: number;
};

type RegressionLossLandscapeProps = {
  data: DataPoint[];
  currentSlope: number;
  currentIntercept: number;
  bestSlope: number;
  bestIntercept: number;
};

type LossPoint = {
  slope: number;
  loss: number;
};

export default function RegressionLossLandscape({
  data,
  currentSlope,
  currentIntercept,
  bestSlope,
  bestIntercept,
}: RegressionLossLandscapeProps) {
  const width = 760;
  const height = 390;

  const padding = {
    top: 35,
    right: 35,
    bottom: 60,
    left: 70,
  };

  const plotWidth =
    width - padding.left - padding.right;

  const plotHeight =
    height - padding.top - padding.bottom;

  const calculateMSE = (
    slope: number,
    intercept: number
  ) => {
    if (data.length === 0) {
      return 0;
    }

    const totalSquaredError = data.reduce(
      (sum, point) => {
        const predicted =
          slope * point.x + intercept;

        const residual =
          point.y - predicted;

        return sum + residual * residual;
      },
      0
    );

    return totalSquaredError / data.length;
  };

  /*
   * For this 2D slice we keep the intercept fixed at
   * the current intercept and vary only the slope.
   *
   * This makes it easy for a student to understand:
   *
   * slope -> MSE
   */

  const minSlope = -1;
  const maxSlope = 4;

  const sampleCount = 100;

  const lossPoints: LossPoint[] =
    Array.from(
      { length: sampleCount + 1 },
      (_, index) => {
        const slope =
          minSlope +
          ((maxSlope - minSlope) * index) /
            sampleCount;

        return {
          slope,
          loss: calculateMSE(
            slope,
            currentIntercept
          ),
        };
      }
    );

  const currentLoss = calculateMSE(
    currentSlope,
    currentIntercept
  );

  const bestLoss = calculateMSE(
    bestSlope,
    bestIntercept
  );

  const maxLoss = Math.max(
    ...lossPoints.map((point) => point.loss),
    currentLoss,
    bestLoss,
    1
  );

  const scaleX = (slope: number) => {
    return (
      padding.left +
      ((slope - minSlope) /
        (maxSlope - minSlope)) *
        plotWidth
    );
  };

  const scaleY = (loss: number) => {
    return (
      padding.top +
      plotHeight -
      (loss / maxLoss) * plotHeight
    );
  };

  const path = lossPoints
    .map((point, index) => {
      const x = scaleX(point.slope);
      const y = scaleY(point.loss);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const xTicks = [-1, 0, 1, 2, 3, 4];

  const yTicks = Array.from(
    { length: 6 },
    (_, index) =>
      (maxLoss / 5) * index
  );

  const currentMarkerX = scaleX(
    Math.max(
      minSlope,
      Math.min(maxSlope, currentSlope)
    )
  );

  const currentMarkerY = scaleY(currentLoss);

  /*
   * The exact OLS optimum uses its own optimal intercept.
   * Therefore it does not necessarily lie directly on the
   * current-intercept slice drawn above.
   *
   * We display it separately as the global optimum.
   */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Loss Landscape
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          How does slope affect model error?
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This curve changes the slope while keeping
          the current intercept fixed. Every possible
          slope creates a different regression line
          and therefore a different Mean Squared Error.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px] w-full"
          role="img"
          aria-label="Linear regression mean squared error landscape"
        >
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            rx="12"
            fill="#f8fafc"
          />

          {/* Horizontal grid */}

          {yTicks.map((tick) => {
            const y = scaleY(tick);

            return (
              <g key={`y-${tick}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
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

          {xTicks.map((tick) => {
            const x = scaleX(tick);

            return (
              <g key={`x-${tick}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={
                    height - padding.bottom
                  }
                  stroke="#e2e8f0"
                />

                <text
                  x={x}
                  y={
                    height -
                    padding.bottom +
                    25
                  }
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {tick}
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

          {/* Loss curve */}

          <path
            d={path}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current model marker */}

          {currentSlope >= minSlope &&
            currentSlope <= maxSlope && (
              <>
                <line
                  x1={currentMarkerX}
                  y1={currentMarkerY}
                  x2={currentMarkerX}
                  y2={
                    height -
                    padding.bottom
                  }
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                />

                <circle
                  cx={currentMarkerX}
                  cy={currentMarkerY}
                  r="8"
                  fill="#2563eb"
                  stroke="white"
                  strokeWidth="3"
                />

                <text
                  x={currentMarkerX}
                  y={currentMarkerY - 15}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="#2563eb"
                >
                  You are here
                </text>
              </>
            )}

          {/* Labels */}

          <text
            x={
              padding.left +
              plotWidth / 2
            }
            y={height - 15}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#334155"
          >
            Slope (m)
          </text>

          <text
            x="18"
            y={
              padding.top +
              plotHeight / 2
            }
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#334155"
            transform={`rotate(-90 18 ${
              padding.top +
              plotHeight / 2
            })`}
          >
            Mean Squared Error
          </text>
        </svg>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Current Slope
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {currentSlope.toFixed(3)}
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
            Current MSE
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {currentLoss.toFixed(3)}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            Global Best MSE
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {bestLoss.toFixed(3)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4">
        <p className="text-sm font-bold text-purple-800">
          Why is the curve shaped like a bowl?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Mean Squared Error squares each residual.
          For Linear Regression, this creates a convex
          quadratic loss surface. Moving away from the
          minimum increases prediction error.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-800">
          Connection to Gradient Descent
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Gradient Descent uses the slope of the loss
          surface to decide which direction to move the
          model parameters. It repeatedly moves toward
          lower loss until it approaches the minimum.
        </p>
      </div>
    </div>
  );
}