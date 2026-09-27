"use client";

import type {
  RegressionPoint,
} from "./RegressionAnimation";

export type OptimizationPoint = {
  weight: number;
  bias: number;
  loss: number;
};

type ComparisonLossSurfaceProps = {
  data: RegressionPoint[];

  batchPath: OptimizationPoint[];

  sgdPath: OptimizationPoint[];

  miniBatchPath: OptimizationPoint[];

  lossFunction: string;
};

type MethodPath = {
  id: string;
  name: string;
  shortName: string;
  path: OptimizationPoint[];
  color: string;
};

export default function ComparisonLossSurface({
  data,
  batchPath,
  sgdPath,
  miniBatchPath,
  lossFunction,
}: ComparisonLossSurfaceProps) {
  /*
  ========================================================
  SVG SETTINGS
  ========================================================
  */

  const width = 900;
  const height = 540;

  const padding = {
    top: 45,
    right: 55,
    bottom: 80,
    left: 85,
  };

  const graphWidth =
    width -
    padding.left -
    padding.right;

  const graphHeight =
    height -
    padding.top -
    padding.bottom;

  /*
  ========================================================
  PARAMETER SPACE
  ========================================================
  */

  const minWeight = -1;
  const maxWeight = 4;

  const minBias = -5;
  const maxBias = 8;

  const columns = 38;
  const rows = 32;

  /*
  ========================================================
  LOSS FUNCTION
  ========================================================
  */

  function calculateLoss(
    weight: number,
    bias: number
  ) {
    if (data.length === 0) {
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

    return total / data.length;
  }

  /*
  ========================================================
  BUILD LOSS LANDSCAPE
  ========================================================
  */

  const cells: {
    weight: number;
    bias: number;
    loss: number;
    column: number;
    row: number;
  }[] = [];

  let minimumLoss =
    Number.POSITIVE_INFINITY;

  let minimumWeight = 0;
  let minimumBias = 0;

  let maximumLoss = 0;

  for (
    let row = 0;
    row < rows;
    row++
  ) {
    const bias =
      minBias +
      (row /
        Math.max(
          1,
          rows - 1
        )) *
        (maxBias -
          minBias);

    for (
      let column = 0;
      column < columns;
      column++
    ) {
      const weight =
        minWeight +
        (column /
          Math.max(
            1,
            columns - 1
          )) *
          (maxWeight -
            minWeight);

      const loss =
        calculateLoss(
          weight,
          bias
        );

      cells.push({
        weight,
        bias,
        loss,
        column,
        row,
      });

      if (
        Number.isFinite(loss)
      ) {
        if (
          loss <
          minimumLoss
        ) {
          minimumLoss =
            loss;

          minimumWeight =
            weight;

          minimumBias =
            bias;
        }

        maximumLoss =
          Math.max(
            maximumLoss,
            loss
          );
      }
    }
  }

  if (
    !Number.isFinite(
      minimumLoss
    )
  ) {
    minimumLoss = 0;
  }

  if (
    maximumLoss <=
    minimumLoss
  ) {
    maximumLoss =
      minimumLoss + 1;
  }

  /*
  ========================================================
  PATHS
  ========================================================
  */

  const methods: MethodPath[] = [
    {
      id: "batch",
      name:
        "Batch Gradient Descent",
      shortName:
        "Batch GD",
      path: batchPath,
      color: "#38bdf8",
    },
    {
      id: "sgd",
      name:
        "Stochastic Gradient Descent",
      shortName: "SGD",
      path: sgdPath,
      color: "#f59e0b",
    },
    {
      id: "mini",
      name:
        "Mini-Batch Gradient Descent",
      shortName:
        "Mini-Batch",
      path: miniBatchPath,
      color: "#a78bfa",
    },
  ];

  /*
  ========================================================
  COORDINATE CONVERSION
  ========================================================
  */

  function xPosition(
    weight: number
  ) {
    const ratio =
      (weight -
        minWeight) /
      (maxWeight -
        minWeight);

    return (
      padding.left +
      clamp(
        ratio,
        0,
        1
      ) *
        graphWidth
    );
  }

  function yPosition(
    bias: number
  ) {
    const ratio =
      (bias -
        minBias) /
      (maxBias -
        minBias);

    return (
      padding.top +
      graphHeight -
      clamp(
        ratio,
        0,
        1
      ) *
        graphHeight
    );
  }

  /*
  ========================================================
  LANDSCAPE COLOR
  ========================================================
  */

  function lossColor(
    loss: number
  ) {
    const minLog =
      Math.log1p(
        Math.max(
          0,
          minimumLoss
        )
      );

    const maxLog =
      Math.log1p(
        Math.max(
          0,
          maximumLoss
        )
      );

    const currentLog =
      Math.log1p(
        Math.max(
          0,
          loss
        )
      );

    const denominator =
      Math.max(
        0.000001,
        maxLog -
          minLog
      );

    const normalized =
      clamp(
        (currentLog -
          minLog) /
          denominator,
        0,
        1
      );

    /*
      Low loss:
      darker blue / cyan

      Higher loss:
      purple / red
    */

    const red =
      Math.round(
        20 +
          normalized *
            95
      );

    const green =
      Math.round(
        70 -
          normalized *
            40
      );

    const blue =
      Math.round(
        100 +
          normalized *
            70
      );

    return `rgb(${red}, ${green}, ${blue})`;
  }

  /*
  ========================================================
  PATH BUILDER
  ========================================================
  */

  function buildPath(
    points: OptimizationPoint[]
  ) {
    if (
      points.length === 0
    ) {
      return "";
    }

    return points
      .filter(
        (point) =>
          Number.isFinite(
            point.weight
          ) &&
          Number.isFinite(
            point.bias
          )
      )
      .map(
        (
          point,
          index
        ) => {
          const x =
            xPosition(
              point.weight
            );

          const y =
            yPosition(
              point.bias
            );

          return `${
            index === 0
              ? "M"
              : "L"
          } ${x} ${y}`;
        }
      )
      .join(" ");
  }

  /*
  ========================================================
  AXIS VALUES
  ========================================================
  */

  const weightTicks =
    Array.from(
      {
        length: 6,
      },
      (_, index) =>
        minWeight +
        (index / 5) *
          (maxWeight -
            minWeight)
    );

  const biasTicks =
    Array.from(
      {
        length: 6,
      },
      (_, index) =>
        minBias +
        (index / 5) *
          (maxBias -
            minBias)
    );

  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Optimization Landscape
          </p>

          <h3 className="mt-2 text-lg font-semibold text-zinc-100">
            Compare Optimization
            Paths
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Each method starts from
            the same weight and bias,
            but the samples used for
            each gradient calculation
            can make the parameters
            travel through the loss
            landscape differently.
          </p>
        </div>

        {/* LEGEND */}

        <div className="flex flex-wrap gap-2">
          {methods.map(
            (method) => (
              <div
                key={
                  method.id
                }
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      method.color,
                  }}
                />

                <span className="text-xs text-zinc-400">
                  {
                    method.shortName
                  }
                </span>
              </div>
            )
          )}

          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

            <span className="text-xs text-zinc-400">
              Approx. Minimum
            </span>
          </div>
        </div>
      </div>

      {/* GRAPH */}

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[760px] w-full"
          role="img"
          aria-label="Weight and bias loss landscape comparing Batch Gradient Descent, SGD and Mini-Batch Gradient Descent optimization paths"
        >
          {/* BACKGROUND */}

          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            rx="16"
            fill="#09090b"
          />

          {/* HEATMAP */}

          {cells.map(
            (cell) => {
              const cellWidth =
                graphWidth /
                columns;

              const cellHeight =
                graphHeight /
                rows;

              const x =
                padding.left +
                cell.column *
                  cellWidth;

              const y =
                padding.top +
                graphHeight -
                (cell.row +
                  1) *
                  cellHeight;

              return (
                <rect
                  key={`${cell.row}-${cell.column}`}
                  x={x}
                  y={y}
                  width={
                    cellWidth +
                    0.5
                  }
                  height={
                    cellHeight +
                    0.5
                  }
                  fill={lossColor(
                    cell.loss
                  )}
                  opacity="0.78"
                />
              );
            }
          )}

          {/* GRID / WEIGHT */}

          {weightTicks.map(
            (
              tick,
              index
            ) => {
              const x =
                xPosition(
                  tick
                );

              return (
                <g
                  key={`weight-${index}`}
                >
                  <line
                    x1={x}
                    y1={
                      padding.top
                    }
                    x2={x}
                    y2={
                      padding.top +
                      graphHeight
                    }
                    stroke="#ffffff"
                    strokeOpacity="0.08"
                  />

                  <text
                    x={x}
                    y={
                      padding.top +
                      graphHeight +
                      25
                    }
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="11"
                  >
                    {tick.toFixed(
                      1
                    )}
                  </text>
                </g>
              );
            }
          )}

          {/* GRID / BIAS */}

          {biasTicks.map(
            (
              tick,
              index
            ) => {
              const y =
                yPosition(
                  tick
                );

              return (
                <g
                  key={`bias-${index}`}
                >
                  <line
                    x1={
                      padding.left
                    }
                    y1={y}
                    x2={
                      padding.left +
                      graphWidth
                    }
                    y2={y}
                    stroke="#ffffff"
                    strokeOpacity="0.08"
                  />

                  <text
                    x={
                      padding.left -
                      12
                    }
                    y={y + 4}
                    textAnchor="end"
                    fill="#a1a1aa"
                    fontSize="11"
                  >
                    {tick.toFixed(
                      1
                    )}
                  </text>
                </g>
              );
            }
          )}

          {/* METHOD PATHS */}

          {methods.map(
            (method) => (
              <path
                key={`${method.id}-path`}
                d={buildPath(
                  method.path
                )}
                fill="none"
                stroke={
                  method.color
                }
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
            )
          )}

          {/* SMALL PATH POINTS */}

          {methods.flatMap(
            (method) =>
              method.path
                .filter(
                  (
                    _,
                    index
                  ) =>
                    index === 0 ||
                    index ===
                      method.path
                        .length -
                        1 ||
                    index % 5 ===
                      0
                )
                .map(
                  (
                    point,
                    index
                  ) => {
                    if (
                      !Number.isFinite(
                        point.weight
                      ) ||
                      !Number.isFinite(
                        point.bias
                      )
                    ) {
                      return null;
                    }

                    return (
                      <circle
                        key={`${method.id}-point-${index}`}
                        cx={xPosition(
                          point.weight
                        )}
                        cy={yPosition(
                          point.bias
                        )}
                        r="3"
                        fill={
                          method.color
                        }
                        stroke="#09090b"
                        strokeWidth="1"
                      />
                    );
                  }
                )
          )}

          {/* CURRENT METHOD POSITIONS */}

          {methods.map(
            (method) => {
              const point =
                method.path[
                  method.path
                    .length - 1
                ];

              if (
                !point ||
                !Number.isFinite(
                  point.weight
                ) ||
                !Number.isFinite(
                  point.bias
                )
              ) {
                return null;
              }

              return (
                <g
                  key={`${method.id}-current`}
                >
                  <circle
                    cx={xPosition(
                      point.weight
                    )}
                    cy={yPosition(
                      point.bias
                    )}
                    r="8"
                    fill={
                      method.color
                    }
                    stroke="#09090b"
                    strokeWidth="3"
                  />

                  <circle
                    cx={xPosition(
                      point.weight
                    )}
                    cy={yPosition(
                      point.bias
                    )}
                    r="14"
                    fill="none"
                    stroke={
                      method.color
                    }
                    strokeWidth="2"
                    opacity="0.45"
                  />
                </g>
              );
            }
          )}

          {/* APPROXIMATE MINIMUM */}

          <g>
            <circle
              cx={xPosition(
                minimumWeight
              )}
              cy={yPosition(
                minimumBias
              )}
              r="8"
              fill="#34d399"
              stroke="#052e16"
              strokeWidth="3"
            />

            <circle
              cx={xPosition(
                minimumWeight
              )}
              cy={yPosition(
                minimumBias
              )}
              r="16"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              opacity="0.35"
            />
          </g>

          {/* AXIS LABELS */}

          <text
            x={
              padding.left +
              graphWidth / 2
            }
            y={
              height - 22
            }
            textAnchor="middle"
            fill="#d4d4d8"
            fontSize="13"
          >
            Weight
          </text>

          <text
            x="22"
            y={
              padding.top +
              graphHeight / 2
            }
            textAnchor="middle"
            fill="#d4d4d8"
            fontSize="13"
            transform={`rotate(-90 22 ${
              padding.top +
              graphHeight / 2
            })`}
          >
            Bias
          </text>
        </svg>
      </div>

      {/* CURRENT RESULTS */}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {methods.map(
          (method) => {
            const current =
              method.path[
                method.path
                  .length - 1
              ];

            return (
              <div
                key={`${method.id}-result`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        method.color,
                    }}
                  />

                  <p className="text-sm font-semibold text-zinc-200">
                    {
                      method.shortName
                    }
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Metric
                    label="Weight"
                    value={formatNumber(
                      current?.weight ??
                        0
                    )}
                  />

                  <Metric
                    label="Bias"
                    value={formatNumber(
                      current?.bias ??
                        0
                    )}
                  />

                  <Metric
                    label="Loss"
                    value={formatNumber(
                      current?.loss ??
                        0
                    )}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* MINIMUM */}

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Approximate minimum
              on displayed landscape
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              This point is estimated
              from the grid displayed
              above. It is used as a
              visual reference rather
              than an exact analytical
              solution.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 font-mono text-xs text-zinc-300">
            <span>
              w ={" "}
              {minimumWeight.toFixed(
                3
              )}
            </span>

            <span>
              b ={" "}
              {minimumBias.toFixed(
                3
              )}
            </span>

            <span>
              loss ={" "}
              {formatNumber(
                minimumLoss
              )}
            </span>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL EXPLANATION */}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Explanation
          title="Batch path"
          text="Because every update uses the full dataset, its gradient direction is based on all training examples together. Its path will often appear comparatively smooth."
        />

        <Explanation
          title="SGD path"
          text="Each update depends on one training example. Different examples can pull the parameters in different directions, producing a more irregular trajectory."
        />

        <Explanation
          title="Mini-Batch path"
          text="Each update averages information from a small group of examples. Its trajectory can reduce some single-sample noise while still updating frequently."
        />
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <p className="text-sm font-semibold text-zinc-200">
          How to read this graph
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Horizontal movement means
          the learned{" "}
          <strong className="text-zinc-300">
            weight
          </strong>{" "}
          is changing. Vertical
          movement means the{" "}
          <strong className="text-zinc-300">
            bias
          </strong>{" "}
          is changing. The background
          represents the loss for
          different weight and bias
          combinations. The paths
          show how each optimization
          strategy moves through this
          parameter space.
        </p>
      </div>
    </div>
  );
}

/*
========================================================
HELPERS
========================================================
*/

function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

function formatNumber(
  value: number
) {
  if (
    !Number.isFinite(value)
  ) {
    return "∞";
  }

  if (
    Math.abs(value) >=
    100000
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

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-all font-mono text-xs font-semibold text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function Explanation({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <p className="text-sm font-semibold text-zinc-200">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}