"use client";

import type {
  RegressionPoint,
} from "./RegressionAnimation";

type OptimizationPoint = {
  weight: number;
  bias: number;
  loss: number;
};

type LossSurfaceProps = {
  data: RegressionPoint[];

  weight: number;
  bias: number;

  history: OptimizationPoint[];

  lossFunction?: string;
};

type SurfaceCell = {
  x: number;
  y: number;
  width: number;
  height: number;

  weight: number;
  bias: number;

  loss: number;
  intensity: number;
};

export default function LossSurface({
  data,
  weight,
  bias,
  history,
  lossFunction = "Mean Squared Error",
}: LossSurfaceProps) {
  const svgWidth = 760;
  const svgHeight = 440;

  const paddingLeft = 70;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 65;

  /*
  ========================================================
  PARAMETER SPACE

  This is the region of weight/bias values that we explore.
  ========================================================
  */

  const weightMin = -1;
  const weightMax = 4;

  const biasMin = -5;
  const biasMax = 8;

  const columns = 35;
  const rows = 30;

  const plotWidth =
    svgWidth -
    paddingLeft -
    paddingRight;

  const plotHeight =
    svgHeight -
    paddingTop -
    paddingBottom;

  /*
  ========================================================
  CONVERT PARAMETER -> SVG POSITION
  ========================================================
  */

  function weightToX(
    value: number
  ) {
    return (
      paddingLeft +
      ((value - weightMin) /
        (weightMax -
          weightMin)) *
        plotWidth
    );
  }

  function biasToY(
    value: number
  ) {
    return (
      svgHeight -
      paddingBottom -
      ((value - biasMin) /
        (biasMax -
          biasMin)) *
        plotHeight
    );
  }

  /*
  ========================================================
  BUILD LOSS FIELD
  ========================================================
  */

  const rawCells: Omit<
    SurfaceCell,
    "intensity"
  >[] = [];

  let minimumLoss =
    Number.POSITIVE_INFINITY;

  let maximumLoss =
    Number.NEGATIVE_INFINITY;

  let bestWeight = 0;
  let bestBias = 0;

  for (
    let row = 0;
    row < rows;
    row++
  ) {
    for (
      let column = 0;
      column < columns;
      column++
    ) {
      const currentWeight =
        weightMin +
        (column /
          (columns - 1)) *
          (weightMax -
            weightMin);

      const currentBias =
        biasMax -
        (row /
          (rows - 1)) *
          (biasMax -
            biasMin);

      const loss =
        calculateLoss(
          data,
          currentWeight,
          currentBias,
          lossFunction
        );

      if (
        loss <
        minimumLoss
      ) {
        minimumLoss =
          loss;

        bestWeight =
          currentWeight;

        bestBias =
          currentBias;
      }

      if (
        loss >
        maximumLoss
      ) {
        maximumLoss =
          loss;
      }

      rawCells.push({
        x:
          paddingLeft +
          (column /
            columns) *
            plotWidth,

        y:
          paddingTop +
          (row /
            rows) *
            plotHeight,

        width:
          plotWidth /
          columns +
          1,

        height:
          plotHeight /
          rows +
          1,

        weight:
          currentWeight,

        bias:
          currentBias,

        loss,
      });
    }
  }

  /*
  ========================================================
  NORMALIZE LOSS

  We use logarithmic normalization because loss surfaces
  can contain a very large range of values.
  ========================================================
  */

  const logMinimum =
    Math.log1p(
      minimumLoss
    );

  const logMaximum =
    Math.log1p(
      maximumLoss
    );

  const cells: SurfaceCell[] =
    rawCells.map(
      (cell) => {
        const logLoss =
          Math.log1p(
            cell.loss
          );

        const normalized =
          logMaximum ===
          logMinimum
            ? 0
            : (logLoss -
                logMinimum) /
              (logMaximum -
                logMinimum);

        return {
          ...cell,

          intensity:
            normalized,
        };
      }
    );

  /*
  ========================================================
  PATH OF GRADIENT DESCENT
  ========================================================
  */

  const visibleHistory =
    history.filter(
      (point) =>
        Number.isFinite(
          point.weight
        ) &&
        Number.isFinite(
          point.bias
        )
    );

  const pathPoints =
    visibleHistory
      .map(
        (point) =>
          `${weightToX(
            clamp(
              point.weight,
              weightMin,
              weightMax
            )
          )},${biasToY(
            clamp(
              point.bias,
              biasMin,
              biasMax
            )
          )}`
      )
      .join(" ");

  /*
  ========================================================
  GRID LABELS
  ========================================================
  */

  const weightLabels =
    createRangeLabels(
      weightMin,
      weightMax,
      5
    );

  const biasLabels =
    createRangeLabels(
      biasMin,
      biasMax,
      5
    );

  const currentLoss =
    calculateLoss(
      data,
      weight,
      bias,
      lossFunction
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Optimization Landscape
          </p>

          <h3 className="mt-2 text-lg font-semibold text-zinc-100">
            Weight × Bias Loss Surface
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Every location represents
            one combination of weight
            and bias. Gradient Descent
            tries to move toward a
            region with lower loss.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
          <p className="text-xs text-zinc-500">
            Current Loss
          </p>

          <p className="mt-1 font-mono text-sm font-semibold text-zinc-100">
            {formatValue(
              currentLoss
            )}
          </p>
        </div>
      </div>

      {/* GRAPH */}

      <div className="overflow-x-auto p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="min-w-[650px] w-full"
          role="img"
          aria-label="Gradient Descent weight and bias loss landscape"
        >
          {/* LOSS FIELD */}

          {cells.map(
            (cell, index) => (
              <rect
                key={index}
                x={cell.x}
                y={cell.y}
                width={
                  cell.width
                }
                height={
                  cell.height
                }
                fill={getLossColor(
                  cell.intensity
                )}
              />
            )
          )}

          {/* GRID */}

          {weightLabels.map(
            (
              value,
              index
            ) => {
              const x =
                weightToX(
                  value
                );

              return (
                <g
                  key={`weight-${index}`}
                >
                  <line
                    x1={x}
                    y1={
                      paddingTop
                    }
                    x2={x}
                    y2={
                      svgHeight -
                      paddingBottom
                    }
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <text
                    x={x}
                    y={
                      svgHeight -
                      35
                    }
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[11px] text-zinc-500"
                  >
                    {value.toFixed(
                      1
                    )}
                  </text>
                </g>
              );
            }
          )}

          {biasLabels.map(
            (
              value,
              index
            ) => {
              const y =
                biasToY(
                  value
                );

              return (
                <g
                  key={`bias-${index}`}
                >
                  <line
                    x1={
                      paddingLeft
                    }
                    y1={y}
                    x2={
                      svgWidth -
                      paddingRight
                    }
                    y2={y}
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <text
                    x={
                      paddingLeft -
                      12
                    }
                    y={y + 4}
                    textAnchor="end"
                    fill="currentColor"
                    className="text-[11px] text-zinc-500"
                  >
                    {value.toFixed(
                      1
                    )}
                  </text>
                </g>
              );
            }
          )}

          {/* BORDER */}

          <rect
            x={paddingLeft}
            y={paddingTop}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="rgba(255,255,255,0.20)"
            strokeWidth="2"
          />

          {/* OPTIMIZATION PATH */}

          {visibleHistory.length >
            1 && (
            <polyline
              points={
                pathPoints
              }
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          )}

          {/* HISTORY POINTS */}

          {visibleHistory.map(
            (
              point,
              index
            ) => (
              <circle
                key={`history-${index}`}
                cx={weightToX(
                  clamp(
                    point.weight,
                    weightMin,
                    weightMax
                  )
                )}
                cy={biasToY(
                  clamp(
                    point.bias,
                    biasMin,
                    biasMax
                  )
                )}
                r={
                  index ===
                  visibleHistory.length -
                    1
                    ? 5
                    : 2.5
                }
                fill={
                  index ===
                  visibleHistory.length -
                    1
                    ? "#ffffff"
                    : "#d4d4d8"
                }
                opacity={
                  index ===
                  visibleHistory.length -
                    1
                    ? 1
                    : 0.65
                }
              />
            )
          )}

          {/* APPROXIMATE MINIMUM */}

          <circle
            cx={weightToX(
              bestWeight
            )}
            cy={biasToY(
              bestBias
            )}
            r="9"
            fill="none"
            stroke="#34d399"
            strokeWidth="3"
          />

          <circle
            cx={weightToX(
              bestWeight
            )}
            cy={biasToY(
              bestBias
            )}
            r="3"
            fill="#34d399"
          />

          {/* CURRENT POSITION */}

          <circle
            cx={weightToX(
              clamp(
                weight,
                weightMin,
                weightMax
              )
            )}
            cy={biasToY(
              clamp(
                bias,
                biasMin,
                biasMax
              )
            )}
            r="10"
            fill="#fbbf24"
            stroke="#ffffff"
            strokeWidth="3"
          />

          {/* AXIS LABELS */}

          <text
            x={
              paddingLeft +
              plotWidth / 2
            }
            y={
              svgHeight - 5
            }
            textAnchor="middle"
            fill="currentColor"
            className="text-xs text-zinc-400"
          >
            Weight (w)
          </text>

          <text
            x="18"
            y={
              paddingTop +
              plotHeight / 2
            }
            textAnchor="middle"
            fill="currentColor"
            className="text-xs text-zinc-400"
            transform={`rotate(-90 18 ${
              paddingTop +
              plotHeight / 2
            })`}
          >
            Bias (b)
          </text>
        </svg>
      </div>

      {/* LIVE VALUES */}

      <div className="grid gap-3 border-t border-zinc-800 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Current Weight"
          value={formatValue(
            weight
          )}
        />

        <Metric
          label="Current Bias"
          value={formatValue(
            bias
          )}
        />

        <Metric
          label="Current Loss"
          value={formatValue(
            currentLoss
          )}
        />

        <Metric
          label="Approx. Minimum"
          value={`w=${bestWeight.toFixed(
            2
          )}, b=${bestBias.toFixed(
            2
          )}`}
        />
      </div>

      {/* LEGEND */}

      <div className="border-t border-zinc-800 px-5 py-4">
        <div className="flex flex-wrap gap-5 text-xs text-zinc-500">
          <Legend
            symbol="●"
            text="Current position"
          />

          <Legend
            symbol="○"
            text="Approximate minimum"
          />

          <Legend
            symbol="━"
            text="Optimization path"
          />

          <Legend
            symbol="▦"
            text="Loss landscape"
          />
        </div>
      </div>

      {/* EXPLANATION */}

      <div className="border-t border-zinc-800 bg-zinc-900/30 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          How to read this
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ExplanationCard
            number="1"
            title="Choose w and b"
            text="Every point on this map represents a possible weight and bias combination."
          />

          <ExplanationCard
            number="2"
            title="Calculate Loss"
            text="The background represents how much prediction error that combination produces."
          />

          <ExplanationCard
            number="3"
            title="Move Downhill"
            text="Gradient Descent updates weight and bias so the optimization point moves toward lower loss."
          />
        </div>
      </div>
    </div>
  );
}

/*
========================================================
LOSS
========================================================
*/

function calculateLoss(
  data: RegressionPoint[],
  weight: number,
  bias: number,
  lossFunction: string
) {
  if (
    data.length === 0
  ) {
    return 0;
  }

  let total = 0;

  for (const point of data) {
    const prediction =
      weight * point.x +
      bias;

    const error =
      prediction -
      point.y;

    if (
      lossFunction ===
      "Mean Absolute Error"
    ) {
      total +=
        Math.abs(error);
    } else {
      total +=
        error * error;
    }
  }

  return (
    total /
    data.length
  );
}

/*
========================================================
LOSS COLOR
========================================================
*/

function getLossColor(
  intensity: number
) {
  /*
  Lower loss:
  darker green/teal region.

  Higher loss:
  darker purple/red region.

  We calculate RGB values ourselves
  so no chart dependency is needed.
  */

  const safe =
    clamp(
      intensity,
      0,
      1
    );

  const red =
    Math.round(
      20 + safe * 120
    );

  const green =
    Math.round(
      110 -
        safe * 75
    );

  const blue =
    Math.round(
      95 +
        safe * 65
    );

  return `rgb(${red}, ${green}, ${blue})`;
}

/*
========================================================
RANGE LABELS
========================================================
*/

function createRangeLabels(
  min: number,
  max: number,
  sections: number
) {
  return Array.from(
    {
      length:
        sections + 1,
    },
    (_, index) =>
      min +
      ((max - min) /
        sections) *
        index
  );
}

/*
========================================================
CLAMP
========================================================
*/

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

/*
========================================================
UI HELPERS
========================================================
*/

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 break-all font-mono text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function Legend({
  symbol,
  text,
}: {
  symbol: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-zinc-200">
        {symbol}
      </span>

      <span>{text}</span>
    </div>
  );
}

function ExplanationCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 font-mono text-xs text-zinc-300">
        {number}
      </div>

      <p className="mt-3 text-sm font-semibold text-zinc-200">
        {title}
      </p>

      <p className="mt-2 text-xs leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}

/*
========================================================
FORMAT
========================================================
*/

function formatValue(
  value: number
) {
  if (
    !Number.isFinite(value)
  ) {
    return "∞";
  }

  if (
    Math.abs(value) >
    100000
  ) {
    return value.toExponential(
      3
    );
  }

  if (
    Math.abs(value) <
      0.0001 &&
    value !== 0
  ) {
    return value.toExponential(
      3
    );
  }

  return value.toFixed(5);
}