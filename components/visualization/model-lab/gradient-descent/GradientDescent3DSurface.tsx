"use client";

import dynamic from "next/dynamic";

import type {
  RegressionPoint,
} from "./RegressionAnimation";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  }
);

export type OptimizationPoint3D = {
  weight: number;
  bias: number;
  loss: number;
};

export type OptimizationPath3D = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  path: OptimizationPoint3D[];
};

type GradientDescent3DSurfaceProps = {
  data: RegressionPoint[];
  paths: OptimizationPath3D[];
  lossFunction?: string;
  title?: string;
  description?: string;
};

export default function GradientDescent3DSurface({
  data,
  paths,
  lossFunction = "Mean Squared Error",
  title = "3D Gradient Descent Loss Surface",
  description =
    "Watch the optimizer move through weight-bias space while descending toward a lower-loss region.",
}: GradientDescent3DSurfaceProps) {
  /*
  ========================================================
  ADAPTIVE PARAMETER SPACE
  ========================================================
  */

  const allValidPathPoints =
    paths.flatMap((method) =>
      method.path.filter(
        (point) =>
          Number.isFinite(
            point.weight
          ) &&
          Number.isFinite(
            point.bias
          ) &&
          Number.isFinite(
            point.loss
          )
      )
    );

  const pathWeights =
    allValidPathPoints.map(
      (point) => point.weight
    );

  const pathBiases =
    allValidPathPoints.map(
      (point) => point.bias
    );

  /*
  Keep a useful teaching region visible,
  but expand it when the optimizer moves
  outside the normal range.
  */

  const rawMinWeight =
    pathWeights.length > 0
      ? Math.min(
          -1,
          ...pathWeights
        )
      : -1;

  const rawMaxWeight =
    pathWeights.length > 0
      ? Math.max(
          4,
          ...pathWeights
        )
      : 4;

  const rawMinBias =
    pathBiases.length > 0
      ? Math.min(
          -5,
          ...pathBiases
        )
      : -5;

  const rawMaxBias =
    pathBiases.length > 0
      ? Math.max(
          8,
          ...pathBiases
        )
      : 8;

  const weightSpan =
    Math.max(
      rawMaxWeight -
        rawMinWeight,
      1
    );

  const biasSpan =
    Math.max(
      rawMaxBias -
        rawMinBias,
      1
    );

  const weightPadding =
    weightSpan * 0.15;

  const biasPadding =
    biasSpan * 0.15;

  /*
  Protect the visualization from an
  exploding optimization experiment.
  */

  const MAX_ABS_WEIGHT = 50;
  const MAX_ABS_BIAS = 100;

  const minWeight =
    Math.max(
      -MAX_ABS_WEIGHT,
      rawMinWeight -
        weightPadding
    );

  const maxWeight =
    Math.min(
      MAX_ABS_WEIGHT,
      rawMaxWeight +
        weightPadding
    );

  const minBias =
    Math.max(
      -MAX_ABS_BIAS,
      rawMinBias -
        biasPadding
    );

  const maxBias =
    Math.min(
      MAX_ABS_BIAS,
      rawMaxBias +
        biasPadding
    );

  const resolution = 32;

  /*
  ========================================================
  LOSS FUNCTION
  ========================================================
  */

  const isMAE =
    lossFunction === "MAE" ||
    lossFunction ===
      "Mean Absolute Error";

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
        prediction - point.y;

      if (isMAE) {
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
  BUILD PARAMETER AXES
  ========================================================
  */

  const weightValues =
    Array.from(
      {
        length: resolution,
      },
      (_, index) =>
        minWeight +
        (index /
          (resolution - 1)) *
          (maxWeight -
            minWeight)
    );

  const biasValues =
    Array.from(
      {
        length: resolution,
      },
      (_, index) =>
        minBias +
        (index /
          (resolution - 1)) *
          (maxBias -
            minBias)
    );

  /*
  ========================================================
  BUILD LOSS SURFACE
  ========================================================
  */

  const lossSurface =
    biasValues.map(
      (bias) =>
        weightValues.map(
          (weight) =>
            calculateLoss(
              weight,
              bias
            )
        )
    );

  /*
  ========================================================
  FIND APPROXIMATE MINIMUM
  ========================================================
  */

  let minimumLoss =
    Number.POSITIVE_INFINITY;

  let minimumWeight = 0;
  let minimumBias = 0;

  for (
    let row = 0;
    row <
    biasValues.length;
    row++
  ) {
    for (
      let column = 0;
      column <
      weightValues.length;
      column++
    ) {
      const loss =
        lossSurface[row][
          column
        ];

      if (
        Number.isFinite(
          loss
        ) &&
        loss <
          minimumLoss
      ) {
        minimumLoss = loss;

        minimumWeight =
          weightValues[
            column
          ];

        minimumBias =
          biasValues[row];
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

  /*
  ========================================================
  PLOTLY TRACES
  ========================================================
  */

  const traces: any[] = [
    {
      type: "surface",

      x: weightValues,

      y: biasValues,

      z: lossSurface,

      name: "Loss Surface",

      showscale: true,

      opacity: 0.82,

      colorscale: [
        [0, "#082f49"],
        [0.25, "#0e7490"],
        [0.5, "#2563eb"],
        [0.75, "#7c3aed"],
        [1, "#be123c"],
      ],

      colorbar: {
        title: {
          text: "Loss",

          font: {
            color:
              "#a1a1aa",
          },
        },

        tickfont: {
          color:
            "#a1a1aa",
        },

        thickness: 12,
      },

      hovertemplate:
        "Weight: %{x:.3f}<br>" +
        "Bias: %{y:.3f}<br>" +
        "Loss: %{z:.4f}" +
        "<extra>Loss Surface</extra>",
    },
  ];

  /*
  ========================================================
  OPTIMIZATION PATHS
  ========================================================
  */

  for (const method of paths) {
    const validPath =
      method.path.filter(
        (point) =>
          Number.isFinite(
            point.weight
          ) &&
          Number.isFinite(
            point.bias
          ) &&
          Number.isFinite(
            point.loss
          )
      );

    if (
      validPath.length === 0
    ) {
      continue;
    }

    /*
    PATH
    */

    traces.push({
      type: "scatter3d",

      mode:
        "lines+markers",

      name:
        method.shortName,

      x: validPath.map(
        (point) =>
          point.weight
      ),

      y: validPath.map(
        (point) =>
          point.bias
      ),

      z: validPath.map(
        (point) =>
          point.loss
      ),

      line: {
        color:
          method.color,

        width: 7,
      },

      marker: {
        color:
          method.color,

        size: 3,
      },

      hovertemplate:
        `${method.name}<br>` +
        "Weight: %{x:.4f}<br>" +
        "Bias: %{y:.4f}<br>" +
        "Loss: %{z:.5f}" +
        "<extra></extra>",
    });

    /*
    CURRENT POSITION
    */

    const current =
      validPath[
        validPath.length - 1
      ];

    traces.push({
      type: "scatter3d",

      mode: "markers",

      name:
        `${method.shortName} Current`,

      showlegend: false,

      x: [
        current.weight,
      ],

      y: [
        current.bias,
      ],

      z: [
        current.loss,
      ],

      marker: {
        color:
          method.color,

        size: 9,

        line: {
          color: "#ffffff",
          width: 2,
        },
      },

      hovertemplate:
        `${method.shortName} Current Position<br>` +
        "Weight: %{x:.4f}<br>" +
        "Bias: %{y:.4f}<br>" +
        "Loss: %{z:.5f}" +
        "<extra></extra>",
    });
  }

  /*
  ========================================================
  APPROXIMATE MINIMUM
  ========================================================
  */

  traces.push({
    type: "scatter3d",

    mode: "markers",

    name:
      "Approx. Minimum",

    x: [
      minimumWeight,
    ],

    y: [
      minimumBias,
    ],

    z: [
      minimumLoss,
    ],

    marker: {
      color: "#34d399",

      size: 9,

      symbol: "diamond",

      line: {
        color: "#ffffff",
        width: 2,
      },
    },

    hovertemplate:
      "Approximate Minimum<br>" +
      "Weight: %{x:.4f}<br>" +
      "Bias: %{y:.4f}<br>" +
      "Loss: %{z:.5f}" +
      "<extra></extra>",
  });

  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          3D Optimization
        </p>

        <h3 className="mt-2 text-lg font-semibold text-zinc-100">
          {title}
        </h3>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>

      {/* AXES */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <AxisCard
          axis="X"
          name="Weight"
          description="Controls the slope of the regression line."
        />

        <AxisCard
          axis="Y"
          name="Bias"
          description="Moves the regression line upward or downward."
        />

        <AxisCard
          axis="Z"
          name="Loss"
          description="Measures how wrong the current predictions are."
        />
      </div>

      {/* PARAMETER SPACE */}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-xs text-zinc-400">
          Weight range:{" "}
          {formatNumber(
            minWeight
          )}
          {" → "}
          {formatNumber(
            maxWeight
          )}
        </span>

        <span className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-xs text-zinc-400">
          Bias range:{" "}
          {formatNumber(
            minBias
          )}
          {" → "}
          {formatNumber(
            maxBias
          )}
        </span>

        <span className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-xs text-zinc-400">
          Surface:{" "}
          {isMAE
            ? "MAE loss landscape"
            : "MSE convex bowl"}
        </span>
      </div>

      {/* 3D GRAPH */}

      <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <Plot
          data={traces}
          layout={{
            autosize: true,

            height: 620,

            margin: {
              l: 0,
              r: 0,
              b: 0,
              t: 30,
            },

            paper_bgcolor:
              "#09090b",

            plot_bgcolor:
              "#09090b",

            font: {
              color:
                "#d4d4d8",
            },

            legend: {
              orientation:
                "h",

              x: 0,

              y: 1.04,

              bgcolor:
                "rgba(0,0,0,0)",
            },

            scene: {
              bgcolor:
                "#09090b",

              xaxis: {
                title: {
                  text:
                    "Weight (w)",
                },

                range: [
                  minWeight,
                  maxWeight,
                ],

                color:
                  "#a1a1aa",

                gridcolor:
                  "#27272a",

                zerolinecolor:
                  "#3f3f46",
              },

              yaxis: {
                title: {
                  text:
                    "Bias (b)",
                },

                range: [
                  minBias,
                  maxBias,
                ],

                color:
                  "#a1a1aa",

                gridcolor:
                  "#27272a",

                zerolinecolor:
                  "#3f3f46",
              },

              zaxis: {
                title: {
                  text:
                    "Loss J(w,b)",
                },

                color:
                  "#a1a1aa",

                gridcolor:
                  "#27272a",

                zerolinecolor:
                  "#3f3f46",
              },

              camera: {
                eye: {
                  x: 1.5,
                  y: 1.5,
                  z: 1.15,
                },
              },

              aspectmode:
                "auto",
            },
          }}
          config={{
            responsive: true,

            displaylogo: false,

            scrollZoom: true,

            modeBarButtonsToRemove: [
              "toImage",
              "sendDataToCloud",
            ] as any,
          }}
          style={{
            width: "100%",
            height: "620px",
          }}
          useResizeHandler={true}
        />
      </div>

      {/* CURRENT OPTIMIZER RESULTS */}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {paths.map(
          (method) => {
            const validPath =
              method.path.filter(
                (point) =>
                  Number.isFinite(
                    point.weight
                  ) &&
                  Number.isFinite(
                    point.bias
                  ) &&
                  Number.isFinite(
                    point.loss
                  )
              );

            const current =
              validPath[
                validPath.length -
                  1
              ];

            return (
              <div
                key={method.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        method.color,
                    }}
                  />

                  <p className="font-semibold text-zinc-200">
                    {
                      method.name
                    }
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Metric
                    label="Weight"
                    value={formatNumber(
                      current
                        ?.weight ??
                        0
                    )}
                  />

                  <Metric
                    label="Bias"
                    value={formatNumber(
                      current
                        ?.bias ??
                        0
                    )}
                  />

                  <Metric
                    label="Loss"
                    value={formatNumber(
                      current
                        ?.loss ??
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

      <div className="mt-4 rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4">
        <p className="text-sm font-semibold text-emerald-300">
          Approximate minimum
        </p>

        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-zinc-300">
          <span>
            Weight ={" "}
            {formatNumber(
              minimumWeight
            )}
          </span>

          <span>
            Bias ={" "}
            {formatNumber(
              minimumBias
            )}
          </span>

          <span>
            Loss ={" "}
            {formatNumber(
              minimumLoss
            )}
          </span>
        </div>
      </div>

      {/* EXPLANATION */}

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <p className="text-sm font-semibold text-zinc-200">
          What should I watch?
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Every position on this
          surface represents one
          possible combination of
          weight and bias. The height
          represents the prediction
          loss produced by those
          parameters.
        </p>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          The colored trajectory shows
          the optimization history.
          The highlighted current point
          shows where the optimizer is
          now, while the green diamond
          marks the approximate
          low-loss point found from the
          displayed surface.
        </p>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {isMAE
            ? "With MAE, the loss landscape is not a smooth quadratic paraboloid because absolute error creates piecewise-linear behavior."
            : "With MSE and linear regression, the loss is quadratic in weight and bias, producing the familiar convex bowl-shaped loss surface."}
        </p>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          The visible weight and bias
          ranges automatically expand
          when the optimizer travels
          outside the normal teaching
          region. This makes
          oscillation and divergence
          easier to observe.
        </p>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Rotate the graph with your
          mouse to inspect the surface
          from different angles. Scroll
          over the graph to zoom.
        </p>
      </div>
    </div>
  );
}

/*
========================================================
SMALL UI COMPONENTS
========================================================
*/

function AxisCard({
  axis,
  name,
  description,
}: {
  axis: string;
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <p className="font-mono text-xs text-zinc-500">
        {axis}-AXIS
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-200">
        {name}
      </p>

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {description}
      </p>
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

function formatNumber(
  value: number
) {
  if (
    !Number.isFinite(value)
  ) {
    return "Infinity";
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