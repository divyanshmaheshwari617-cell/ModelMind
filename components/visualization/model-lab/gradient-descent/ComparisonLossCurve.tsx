"use client";

type ComparisonLossCurveProps = {
  batchLoss: number[];
  sgdLoss: number[];
  miniBatchLoss: number[];
  maxIterations: number;
};

type CurveDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  values: number[];
  stroke: string;
};

export default function ComparisonLossCurve({
  batchLoss,
  sgdLoss,
  miniBatchLoss,
  maxIterations,
}: ComparisonLossCurveProps) {
  /*
  ========================================================
  CHART DIMENSIONS
  ========================================================
  */

  const width = 900;
  const height = 420;

  const padding = {
    top: 35,
    right: 35,
    bottom: 65,
    left: 80,
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
  CURVES
  ========================================================
  */

  const curves: CurveDefinition[] = [
    {
      id: "batch",
      label: "Batch Gradient Descent",
      shortLabel: "Batch GD",
      values: batchLoss,
      stroke: "#38bdf8",
    },
    {
      id: "sgd",
      label: "Stochastic Gradient Descent",
      shortLabel: "SGD",
      values: sgdLoss,
      stroke: "#f59e0b",
    },
    {
      id: "mini",
      label:
        "Mini-Batch Gradient Descent",
      shortLabel: "Mini-Batch",
      values: miniBatchLoss,
      stroke: "#a78bfa",
    },
  ];

  /*
  ========================================================
  SAFE VALUES
  ========================================================
  */

  const allFiniteLosses =
    curves.flatMap((curve) =>
      curve.values.filter(
        (value) =>
          Number.isFinite(value) &&
          value >= 0
      )
    );

  const rawMaxLoss =
    allFiniteLosses.length > 0
      ? Math.max(
          ...allFiniteLosses
        )
      : 1;

  const maxLoss =
    rawMaxLoss <= 0
      ? 1
      : rawMaxLoss * 1.08;

  /*
  ========================================================
  COORDINATE HELPERS
  ========================================================
  */

  function xPosition(
    iteration: number
  ) {
    const safeMaximum =
      Math.max(
        1,
        maxIterations
      );

    return (
      padding.left +
      (iteration /
        safeMaximum) *
        graphWidth
    );
  }

  function yPosition(
    loss: number
  ) {
    if (
      !Number.isFinite(loss)
    ) {
      return (
        padding.top +
        graphHeight
      );
    }

    const clamped =
      Math.min(
        Math.max(
          loss,
          0
        ),
        maxLoss
      );

    return (
      padding.top +
      graphHeight -
      (clamped /
        maxLoss) *
        graphHeight
    );
  }

  /*
  ========================================================
  PATH BUILDER
  ========================================================
  */

  function buildPath(
    values: number[]
  ) {
    if (
      values.length === 0
    ) {
      return "";
    }

    return values
      .map(
        (
          loss,
          index
        ) => {
          const x =
            xPosition(
              index
            );

          const y =
            yPosition(
              loss
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
  GRID
  ========================================================
  */

  const horizontalGrid =
    Array.from(
      {
        length: 6,
      },
      (_, index) => {
        const ratio =
          index / 5;

        const y =
          padding.top +
          ratio *
            graphHeight;

        const value =
          maxLoss *
          (1 - ratio);

        return {
          y,
          value,
        };
      }
    );

  const verticalGrid =
    Array.from(
      {
        length: 6,
      },
      (_, index) => {
        const ratio =
          index / 5;

        const x =
          padding.left +
          ratio *
            graphWidth;

        const iteration =
          Math.round(
            ratio *
              maxIterations
          );

        return {
          x,
          iteration,
        };
      }
    );

  /*
  ========================================================
  RESULT HELPERS
  ========================================================
  */

  function currentLoss(
    values: number[]
  ) {
    if (
      values.length === 0
    ) {
      return 0;
    }

    return (
      values[
        values.length - 1
      ] ?? 0
    );
  }

  function initialLoss(
    values: number[]
  ) {
    return (
      values[0] ?? 0
    );
  }

  function reduction(
    values: number[]
  ) {
    const initial =
      initialLoss(values);

    const current =
      currentLoss(values);

    if (
      initial === 0 ||
      !Number.isFinite(
        initial
      ) ||
      !Number.isFinite(
        current
      )
    ) {
      return 0;
    }

    return (
      ((initial -
        current) /
        initial) *
      100
    );
  }

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
            Live Comparison
          </p>

          <h3 className="mt-2 text-lg font-semibold text-zinc-100">
            Batch vs SGD vs
            Mini-Batch Loss
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            All three methods are
            plotted on the same
            loss axis so you can
            compare how their
            optimization behavior
            changes during
            training.
          </p>
        </div>

        {/* LEGEND */}

        <div className="flex flex-wrap gap-3">
          {curves.map(
            (curve) => (
              <div
                key={
                  curve.id
                }
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      curve.stroke,
                  }}
                />

                <span className="text-xs text-zinc-400">
                  {
                    curve.shortLabel
                  }
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* CHART */}

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[760px] w-full"
          role="img"
          aria-label="Comparison of Batch Gradient Descent, Stochastic Gradient Descent and Mini-Batch Gradient Descent loss"
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

          {/* HORIZONTAL GRID */}

          {horizontalGrid.map(
            (
              item,
              index
            ) => (
              <g
                key={`horizontal-${index}`}
              >
                <line
                  x1={
                    padding.left
                  }
                  y1={item.y}
                  x2={
                    width -
                    padding.right
                  }
                  y2={item.y}
                  stroke="#27272a"
                  strokeWidth="1"
                />

                <text
                  x={
                    padding.left -
                    12
                  }
                  y={
                    item.y + 4
                  }
                  textAnchor="end"
                  fill="#71717a"
                  fontSize="11"
                >
                  {formatAxisNumber(
                    item.value
                  )}
                </text>
              </g>
            )
          )}

          {/* VERTICAL GRID */}

          {verticalGrid.map(
            (
              item,
              index
            ) => (
              <g
                key={`vertical-${index}`}
              >
                <line
                  x1={item.x}
                  y1={
                    padding.top
                  }
                  x2={item.x}
                  y2={
                    padding.top +
                    graphHeight
                  }
                  stroke="#27272a"
                  strokeWidth="1"
                />

                <text
                  x={item.x}
                  y={
                    padding.top +
                    graphHeight +
                    25
                  }
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="11"
                >
                  {
                    item.iteration
                  }
                </text>
              </g>
            )
          )}

          {/* AXES */}

          <line
            x1={padding.left}
            y1={
              padding.top +
              graphHeight
            }
            x2={
              width -
              padding.right
            }
            y2={
              padding.top +
              graphHeight
            }
            stroke="#71717a"
            strokeWidth="1.5"
          />

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={
              padding.top +
              graphHeight
            }
            stroke="#71717a"
            strokeWidth="1.5"
          />

          {/* CURVES */}

          {curves.map(
            (curve) => (
              <path
                key={
                  curve.id
                }
                d={buildPath(
                  curve.values
                )}
                fill="none"
                stroke={
                  curve.stroke
                }
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          )}

          {/* CURRENT POINTS */}

          {curves.map(
            (curve) => {
              if (
                curve.values
                  .length === 0
              ) {
                return null;
              }

              const index =
                curve.values
                  .length - 1;

              const loss =
                curve.values[
                  index
                ];

              return (
                <g
                  key={`${curve.id}-current`}
                >
                  <circle
                    cx={xPosition(
                      index
                    )}
                    cy={yPosition(
                      loss
                    )}
                    r="6"
                    fill={
                      curve.stroke
                    }
                    stroke="#09090b"
                    strokeWidth="2"
                  />

                  <circle
                    cx={xPosition(
                      index
                    )}
                    cy={yPosition(
                      loss
                    )}
                    r="11"
                    fill="none"
                    stroke={
                      curve.stroke
                    }
                    strokeWidth="1"
                    opacity="0.35"
                  />
                </g>
              );
            }
          )}

          {/* AXIS LABEL */}

          <text
            x={
              padding.left +
              graphWidth / 2
            }
            y={height - 15}
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="12"
          >
            Iteration / Parameter
            Update
          </text>

          <text
            x="18"
            y={
              padding.top +
              graphHeight / 2
            }
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="12"
            transform={`rotate(-90 18 ${
              padding.top +
              graphHeight / 2
            })`}
          >
            Loss
          </text>
        </svg>
      </div>

      {/* LIVE METRICS */}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {curves.map(
          (curve) => (
            <div
              key={`${curve.id}-metric`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      curve.stroke,
                  }}
                />

                <p className="text-sm font-semibold text-zinc-200">
                  {
                    curve.shortLabel
                  }
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric
                  label="Updates"
                  value={Math.max(
                    0,
                    curve.values
                      .length - 1
                  )}
                />

                <Metric
                  label="Current Loss"
                  value={formatNumber(
                    currentLoss(
                      curve.values
                    )
                  )}
                />

                <Metric
                  label="Initial Loss"
                  value={formatNumber(
                    initialLoss(
                      curve.values
                    )
                  )}
                />

                <Metric
                  label="Reduction"
                  value={`${reduction(
                    curve.values
                  ).toFixed(
                    2
                  )}%`}
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* EDUCATIONAL EXPLANATION */}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <ExplanationCard
          title="Batch GD"
          text="The gradient is calculated from all training samples. Its loss trajectory will often look smoother because every update represents the whole dataset."
        />

        <ExplanationCard
          title="SGD"
          text="Only one sample contributes to each update. Different samples can produce different gradient directions, so the loss curve can fluctuate more strongly."
        />

        <ExplanationCard
          title="Mini-Batch GD"
          text="A small group of samples contributes to each update. This can reduce some of SGD's single-sample noise while still allowing frequent updates."
        />
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <p className="text-sm font-semibold text-zinc-200">
          What should you observe?
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Do not look only at which
          line has the lowest loss.
          Watch the{" "}
          <strong className="text-zinc-300">
            shape of the path
          </strong>
          , the amount of
          fluctuation and how
          quickly each method
          changes. The purpose is
          to understand how the
          sampling strategy changes
          optimization behavior.
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

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
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

function ExplanationCard({
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

/*
========================================================
FORMATTING
========================================================
*/

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

function formatAxisNumber(
  value: number
) {
  if (
    !Number.isFinite(value)
  ) {
    return "∞";
  }

  if (
    value >= 10000
  ) {
    return value.toExponential(
      1
    );
  }

  if (value >= 100) {
    return value.toFixed(0);
  }

  if (value >= 10) {
    return value.toFixed(1);
  }

  return value.toFixed(2);
}