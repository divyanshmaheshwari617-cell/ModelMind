"use client";

type LossCurveProps = {
  lossHistory: number[];
  currentIteration: number;
  maxIterations: number;
};

export default function LossCurve({
  lossHistory,
  currentIteration,
  maxIterations,
}: LossCurveProps) {
  const width = 760;
  const height = 300;

  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 50;

  const usableWidth =
    width -
    paddingLeft -
    paddingRight;

  const usableHeight =
    height -
    paddingTop -
    paddingBottom;

  /*
  ========================================================
  SAFE LOSS VALUES
  ========================================================
  */

  const validLosses =
    lossHistory.filter(
      (loss) =>
        Number.isFinite(loss) &&
        loss >= 0
    );

  const safeLosses =
    validLosses.length > 0
      ? validLosses
      : [0];

  const currentLoss =
    safeLosses[
      safeLosses.length - 1
    ];

  const firstLoss =
    safeLosses[0];

  const minimumLoss =
    Math.min(...safeLosses);

  const maximumLoss =
    Math.max(...safeLosses, 1);

  /*
  ========================================================
  GRAPH RANGE

  Add a little space above the highest loss.
  ========================================================
  */

  const yMax =
    maximumLoss * 1.1;

  function toGraphX(
    iteration: number
  ) {
    return (
      paddingLeft +
      (iteration /
        Math.max(
          maxIterations,
          1
        )) *
        usableWidth
    );
  }

  function toGraphY(
    loss: number
  ) {
    const normalized =
      yMax === 0
        ? 0
        : loss / yMax;

    return (
      height -
      paddingBottom -
      normalized *
        usableHeight
    );
  }

  /*
  ========================================================
  BUILD CURVE
  ========================================================
  */

  const curvePoints =
    safeLosses
      .map(
        (loss, index) =>
          `${toGraphX(
            index
          )},${toGraphY(loss)}`
      )
      .join(" ");

  /*
  ========================================================
  TRAINING STATUS
  ========================================================
  */

  const status =
    getTrainingStatus(
      safeLosses
    );

  const improvement =
    firstLoss > 0
      ? ((firstLoss -
          currentLoss) /
          firstLoss) *
        100
      : 0;

  /*
  ========================================================
  GRID
  ========================================================
  */

  const xGridCount = 5;
  const yGridCount = 4;

  const xGrid =
    Array.from(
      {
        length:
          xGridCount + 1,
      },
      (_, index) =>
        Math.round(
          (maxIterations /
            xGridCount) *
            index
        )
    );

  const yGrid =
    Array.from(
      {
        length:
          yGridCount + 1,
      },
      (_, index) =>
        (yMax /
          yGridCount) *
        index
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Optimization Progress
          </p>

          <h3 className="mt-2 text-lg font-semibold text-zinc-100">
            Loss vs Iteration
          </h3>

          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
            Gradient Descent tries
            to reduce this loss
            after every parameter
            update.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2">
          <p className="text-xs text-zinc-500">
            Training Status
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-100">
            {status}
          </p>
        </div>
      </div>

      {/* METRICS */}

      <div className="grid gap-3 border-b border-zinc-800 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Iteration"
          value={`${currentIteration} / ${maxIterations}`}
        />

        <Metric
          label="Current Loss"
          value={formatLoss(
            currentLoss
          )}
        />

        <Metric
          label="Best Loss"
          value={formatLoss(
            minimumLoss
          )}
        />

        <Metric
          label="Loss Reduction"
          value={`${Math.max(
            0,
            improvement
          ).toFixed(1)}%`}
        />
      </div>

      {/* GRAPH */}

      <div className="overflow-x-auto p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[620px] w-full"
          role="img"
          aria-label="Gradient Descent loss curve"
        >
          {/* HORIZONTAL GRID */}

          {yGrid.map(
            (
              value,
              index
            ) => {
              const y =
                toGraphY(value);

              return (
                <g
                  key={`y-grid-${index}`}
                >
                  <line
                    x1={
                      paddingLeft
                    }
                    y1={y}
                    x2={
                      width -
                      paddingRight
                    }
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-zinc-900"
                  />

                  <text
                    x={
                      paddingLeft -
                      10
                    }
                    y={y + 4}
                    textAnchor="end"
                    fill="currentColor"
                    className="text-[10px] text-zinc-600"
                  >
                    {formatAxisLoss(
                      value
                    )}
                  </text>
                </g>
              );
            }
          )}

          {/* VERTICAL GRID */}

          {xGrid.map(
            (
              value,
              index
            ) => {
              const x =
                toGraphX(value);

              return (
                <g
                  key={`x-grid-${index}`}
                >
                  <line
                    x1={x}
                    y1={
                      paddingTop
                    }
                    x2={x}
                    y2={
                      height -
                      paddingBottom
                    }
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-zinc-900"
                  />

                  <text
                    x={x}
                    y={
                      height - 20
                    }
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[10px] text-zinc-600"
                  >
                    {value}
                  </text>
                </g>
              );
            }
          )}

          {/* AXES */}

          <line
            x1={paddingLeft}
            y1={
              height -
              paddingBottom
            }
            x2={
              width -
              paddingRight
            }
            y2={
              height -
              paddingBottom
            }
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-700"
          />

          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={
              height -
              paddingBottom
            }
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-700"
          />

          {/* AXIS LABEL */}

          <text
            x={width / 2}
            y={height - 3}
            textAnchor="middle"
            fill="currentColor"
            className="text-xs text-zinc-500"
          >
            Iteration
          </text>

          <text
            x="15"
            y={height / 2}
            textAnchor="middle"
            fill="currentColor"
            className="text-xs text-zinc-500"
            transform={`rotate(-90 15 ${
              height / 2
            })`}
          >
            Loss
          </text>

          {/* LOSS AREA */}

          {safeLosses.length >
            1 && (
            <polygon
              points={[
                `${toGraphX(
                  0
                )},${height -
                  paddingBottom}`,
                curvePoints,
                `${toGraphX(
                  safeLosses.length -
                    1
                )},${height -
                  paddingBottom}`,
              ].join(" ")}
              fill="currentColor"
              className="text-zinc-900"
            />
          )}

          {/* LOSS CURVE */}

          {safeLosses.length >
            1 && (
            <polyline
              points={
                curvePoints
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            />
          )}

          {/* INDIVIDUAL ITERATION POINTS */}

          {safeLosses.map(
            (
              loss,
              index
            ) => {
              const isCurrent =
                index ===
                safeLosses.length -
                  1;

              return (
                <circle
                  key={`loss-${index}`}
                  cx={toGraphX(
                    index
                  )}
                  cy={toGraphY(
                    loss
                  )}
                  r={
                    isCurrent
                      ? 6
                      : 2.5
                  }
                  fill="currentColor"
                  className={
                    isCurrent
                      ? "text-emerald-300"
                      : "text-zinc-500"
                  }
                />
              );
            }
          )}

          {/* CURRENT ITERATION GUIDE */}

          {safeLosses.length >
            0 && (
            <line
              x1={toGraphX(
                safeLosses.length -
                  1
              )}
              y1={paddingTop}
              x2={toGraphX(
                safeLosses.length -
                  1
              )}
              y2={
                height -
                paddingBottom
              }
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5 5"
              className="text-zinc-700"
            />
          )}
        </svg>
      </div>

      {/* EXPLANATION */}

      <div className="border-t border-zinc-800 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          What should I notice?
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {getStatusExplanation(
            status
          )}
        </p>
      </div>
    </div>
  );
}

/*
========================================================
METRIC
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

/*
========================================================
TRAINING STATUS
========================================================
*/

function getTrainingStatus(
  losses: number[]
) {
  if (losses.length < 2) {
    return "Ready";
  }

  const current =
    losses[
      losses.length - 1
    ];

  const previous =
    losses[
      losses.length - 2
    ];

  const first =
    losses[0];

  if (
    !Number.isFinite(
      current
    )
  ) {
    return "Diverging";
  }

  /*
  If loss becomes dramatically
  larger than the starting loss.
  */

  if (
    first > 0 &&
    current > first * 3
  ) {
    return "Diverging";
  }

  /*
  Detect recent oscillation.
  */

  if (losses.length >= 6) {
    const recent =
      losses.slice(-6);

    let directionChanges = 0;

    for (
      let i = 2;
      i < recent.length;
      i++
    ) {
      const previousChange =
        recent[i - 1] -
        recent[i - 2];

      const currentChange =
        recent[i] -
        recent[i - 1];

      if (
        previousChange *
          currentChange <
        0
      ) {
        directionChanges++;
      }
    }

    if (
      directionChanges >= 3
    ) {
      return "Oscillating";
    }
  }

  /*
  Detect convergence.
  */

  if (losses.length >= 6) {
    const recent =
      losses.slice(-5);

    const range =
      Math.max(...recent) -
      Math.min(...recent);

    if (
      range <
      Math.max(
        current * 0.001,
        0.000001
      )
    ) {
      return "Converged";
    }
  }

  if (
    current < previous
  ) {
    return "Learning";
  }

  if (
    current > previous
  ) {
    return "Loss Increasing";
  }

  return "Stable";
}

/*
========================================================
STATUS EXPLANATION
========================================================
*/

function getStatusExplanation(
  status: string
) {
  switch (status) {
    case "Ready":
      return "Training has not started yet. Press Play or Step to begin Gradient Descent.";

    case "Learning":
      return "The loss is decreasing. Gradient Descent is currently moving the model toward a lower-error solution.";

    case "Converged":
      return "Recent loss values are changing very little. The optimizer appears to be close to a stable solution.";

    case "Oscillating":
      return "The loss is repeatedly moving up and down. This can happen when parameter updates are too aggressive or noisy.";

    case "Diverging":
      return "The loss is moving far away from its starting value. A learning rate that is too large is one possible cause.";

    case "Loss Increasing":
      return "The latest update increased the loss. One increase does not always mean failure, especially with stochastic updates, but repeated increases should be investigated.";

    default:
      return "Watch how the loss changes as the model parameters are updated.";
  }
}

/*
========================================================
NUMBER FORMATTING
========================================================
*/

function formatLoss(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "∞";
  }

  if (
    value > 100000
  ) {
    return value.toExponential(
      2
    );
  }

  if (value < 0.001) {
    return value.toExponential(
      3
    );
  }

  return value.toFixed(5);
}

function formatAxisLoss(
  value: number
) {
  if (
    value >= 10000
  ) {
    return value.toExponential(
      1
    );
  }

  if (value < 0.01) {
    return value.toExponential(
      1
    );
  }

  return value.toFixed(1);
}