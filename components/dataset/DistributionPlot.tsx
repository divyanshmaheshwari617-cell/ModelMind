"use client";

import { FeatureAnalysis } from "@/lib/api";

interface Props {
  analysis: FeatureAnalysis;
}

export default function DistributionPlot({
  analysis,
}: Props) {
  const counts =
    analysis.histogram_counts ?? [];

  const edges =
    analysis.histogram_edges ?? [];

  const kdeX =
    analysis.kde_x ?? [];

  const kdeY =
    analysis.kde_y ?? [];

  if (
    counts.length === 0 ||
    edges.length < 2
  ) {
    return (
      <div
        style={{
          padding: "12px",
          fontSize: "11px",
          opacity: 0.6,
        }}
      >
        Distribution visualization is
        unavailable for this feature.
      </div>
    );
  }

  /* =========================================
     SVG DIMENSIONS
     ========================================= */

  const width = 700;
  const height = 300;

  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;

  const plotWidth =
    width -
    paddingLeft -
    paddingRight;

  const plotHeight =
    height -
    paddingTop -
    paddingBottom;

  /* =========================================
     X RANGE
     ========================================= */

  const xMin = edges[0];

  const xMax =
    edges[edges.length - 1];

  const xRange =
    xMax - xMin || 1;

  function scaleX(
    value: number
  ) {
    return (
      paddingLeft +
      ((value - xMin) / xRange) *
        plotWidth
    );
  }

  /* =========================================
     HISTOGRAM SCALE
     ========================================= */

  const maxCount =
    Math.max(...counts, 1);

  function scaleHistogramY(
    value: number
  ) {
    return (
      paddingTop +
      plotHeight -
      (value / maxCount) *
        plotHeight
    );
  }

  /* =========================================
     KDE SCALE
     ========================================= */

  const validKDE =
    kdeX.length > 1 &&
    kdeX.length === kdeY.length;

  const maxKDE =
    validKDE
      ? Math.max(...kdeY, 0)
      : 0;

  function scaleKDEY(
    value: number
  ) {
    if (maxKDE <= 0) {
      return (
        paddingTop +
        plotHeight
      );
    }

    return (
      paddingTop +
      plotHeight -
      (value / maxKDE) *
        plotHeight *
        0.92
    );
  }

  /* =========================================
     KDE SVG PATH
     ========================================= */

  const kdePath =
    validKDE
      ? kdeX
          .map(
            (xValue, index) => {
              const x =
                scaleX(xValue);

              const y =
                scaleKDEY(
                  kdeY[index]
                );

              return `${
                index === 0
                  ? "M"
                  : "L"
              } ${x} ${y}`;
            }
          )
          .join(" ")
      : "";

  /* =========================================
     MEAN / MEDIAN
     ========================================= */

  const mean =
    analysis.mean;

  const median =
    analysis.median;

  const meanX =
    mean !== undefined
      ? scaleX(mean)
      : null;

  const medianX =
    median !== undefined
      ? scaleX(median)
      : null;

  /* =========================================
     X AXIS LABELS
     ========================================= */

  const ticks = 5;

  const xTicks =
    Array.from(
      { length: ticks },
      (_, index) =>
        xMin +
        (index /
          (ticks - 1)) *
          xRange
    );

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "14px",
        borderRadius: "10px",
        border:
          "1px solid rgba(255,255,255,0.08)",
        background:
          "rgba(255,255,255,0.02)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          📊 Distribution Explorer
        </div>

        <div
          style={{
            marginTop: "4px",
            fontSize: "10px",
            opacity: 0.55,
          }}
        >
          Histogram + KDE for{" "}
          <strong>
            {analysis.feature}
          </strong>
        </div>
      </div>

      {/* CHART */}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: "100%",
            minWidth: "520px",
            display: "block",
          }}
          role="img"
          aria-label={`Distribution of ${analysis.feature}`}
        >
          {/* HORIZONTAL GRID */}

          {[0, 0.25, 0.5, 0.75, 1].map(
            (ratio) => {
              const y =
                paddingTop +
                plotHeight -
                ratio *
                  plotHeight;

              return (
                <line
                  key={ratio}
                  x1={paddingLeft}
                  x2={
                    paddingLeft +
                    plotWidth
                  }
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                />
              );
            }
          )}

          {/* HISTOGRAM */}

          {counts.map(
            (count, index) => {
              const left =
                edges[index];

              const right =
                edges[index + 1];

              if (
                left === undefined ||
                right === undefined
              ) {
                return null;
              }

              const x1 =
                scaleX(left);

              const x2 =
                scaleX(right);

              const y =
                scaleHistogramY(
                  count
                );

              const barHeight =
                paddingTop +
                plotHeight -
                y;

              return (
                <rect
                  key={index}
                  x={x1 + 1}
                  y={y}
                  width={Math.max(
                    x2 -
                      x1 -
                      2,
                    1
                  )}
                  height={barHeight}
                  rx="2"
                  fill="currentColor"
                  fillOpacity="0.18"
                  stroke="currentColor"
                  strokeOpacity="0.28"
                />
              );
            }
          )}

          {/* KDE CURVE */}

          {validKDE &&
            kdePath && (
              <path
                d={kdePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.9"
              />
            )}

          {/* MEAN */}

          {meanX !== null &&
            meanX >= paddingLeft &&
            meanX <=
              paddingLeft +
                plotWidth && (
              <>
                <line
                  x1={meanX}
                  x2={meanX}
                  y1={paddingTop}
                  y2={
                    paddingTop +
                    plotHeight
                  }
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="6 5"
                  strokeOpacity="0.8"
                />

                <text
                  x={meanX}
                  y={15}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="10"
                >
                  Mean
                </text>
              </>
            )}

          {/* MEDIAN */}

          {medianX !== null &&
            medianX >=
              paddingLeft &&
            medianX <=
              paddingLeft +
                plotWidth && (
              <>
                <line
                  x1={medianX}
                  x2={medianX}
                  y1={
                    paddingTop + 10
                  }
                  y2={
                    paddingTop +
                    plotHeight
                  }
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="2 5"
                  strokeOpacity="0.55"
                />

                <text
                  x={medianX}
                  y={29}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="10"
                  opacity="0.75"
                >
                  Median
                </text>
              </>
            )}

          {/* X AXIS */}

          <line
            x1={paddingLeft}
            x2={
              paddingLeft +
              plotWidth
            }
            y1={
              paddingTop +
              plotHeight
            }
            y2={
              paddingTop +
              plotHeight
            }
            stroke="currentColor"
            strokeOpacity="0.3"
          />

          {/* X TICKS */}

          {xTicks.map(
            (value, index) => {
              const x =
                scaleX(value);

              return (
                <g key={index}>
                  <line
                    x1={x}
                    x2={x}
                    y1={
                      paddingTop +
                      plotHeight
                    }
                    y2={
                      paddingTop +
                      plotHeight +
                      5
                    }
                    stroke="currentColor"
                    strokeOpacity="0.3"
                  />

                  <text
                    x={x}
                    y={
                      paddingTop +
                      plotHeight +
                      20
                    }
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="9"
                    opacity="0.55"
                  >
                    {formatTick(
                      value
                    )}
                  </text>
                </g>
              );
            }
          )}

          {/* FEATURE LABEL */}

          <text
            x={
              paddingLeft +
              plotWidth / 2
            }
            y={height - 5}
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            opacity="0.65"
          >
            {analysis.feature}
          </text>
        </svg>
      </div>

      {/* LEGEND */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "8px",
          fontSize: "10px",
          opacity: 0.65,
        }}
      >
        <span>
          ▮ Histogram
        </span>

        <span>
          ━ KDE
        </span>

        <span>
          ┄ Mean
        </span>

        <span>
          ┈ Median
        </span>
      </div>

      {/* EDUCATIONAL EXPLANATION */}

      <DistributionExplanation
        analysis={analysis}
      />
    </div>
  );
}


/* =========================================================
   BEGINNER EXPLANATION
   ========================================================= */

function DistributionExplanation({
  analysis,
}: Props) {
  const skewness =
    analysis.skewness ?? 0;

  const mean =
    analysis.mean;

  const median =
    analysis.median;

  let explanation = "";

  if (
    Math.abs(skewness) <= 0.5
  ) {
    explanation =
      "This feature is approximately symmetric. " +
      "The distribution does not show strong skewness. " +
      "If mean and median are also close and there are " +
      "few important outliers, mean imputation can be " +
      "a reasonable starting strategy for missing values.";
  } else if (skewness > 0.5) {
    explanation =
      "This feature is right-skewed. The long tail is " +
      "toward larger values. Large observations can pull " +
      "the mean upward, so the median is often more robust " +
      "when considering missing-value imputation.";
  } else {
    explanation =
      "This feature is left-skewed. The long tail is " +
      "toward smaller values. Extreme low observations can " +
      "pull the mean downward, so the median is often more " +
      "robust when considering missing-value imputation.";
  }

  return (
    <div
      style={{
        marginTop: "13px",
        padding: "12px",
        borderRadius: "8px",
        border:
          "1px solid rgba(100,160,255,0.14)",
        background:
          "rgba(100,160,255,0.035)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        🧠 What is this graph
        telling me?
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "11px",
          lineHeight: 1.7,
          opacity: 0.72,
        }}
      >
        {explanation}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "8px",
          marginTop: "11px",
        }}
      >
        <MiniCard
          label="Skewness"
          value={formatNumber(
            skewness
          )}
        />

        <MiniCard
          label="Mean"
          value={formatNumber(
            mean
          )}
        />

        <MiniCard
          label="Median"
          value={formatNumber(
            median
          )}
        />

        <MiniCard
          label="Suggested Imputation"
          value={formatImputation(
            analysis
              .imputation_strategy
          )}
        />
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "10px",
          lineHeight: 1.6,
          opacity: 0.5,
        }}
      >
        The recommendation is a
        starting point, not a universal
        rule. Feature meaning, model
        choice, outliers and why values
        are missing should also be
        considered.
      </div>
    </div>
  );
}


/* =========================================================
   SMALL HELPERS
   ========================================================= */

function MiniCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "9px",
        borderRadius: "7px",
        background:
          "rgba(255,255,255,0.035)",
        border:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontSize: "9px",
          opacity: 0.5,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}


function formatTick(
  value: number
): string {
  const absValue =
    Math.abs(value);

  if (absValue >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(1)}M`;
  }

  if (absValue >= 1_000) {
    return `${(
      value / 1_000
    ).toFixed(1)}K`;
  }

  return Number(
    value.toFixed(2)
  ).toString();
}


function formatNumber(
  value: number | undefined
): string {
  if (
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return Number(
    value.toFixed(4)
  ).toLocaleString();
}


function formatImputation(
  strategy:
    FeatureAnalysis[
      "imputation_strategy"
    ]
): string {
  switch (strategy) {
    case "mean":
      return "Mean";

    case "median":
      return "Median";

    case "none":
      return "None needed";

    case "most_frequent_or_unknown":
      return "Mode / Unknown";

    default:
      return "Inspect";
  }
}