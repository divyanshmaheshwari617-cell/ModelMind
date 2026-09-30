import {
  useMemo,
} from "react";

import type {
  SVMRow,
} from "../types/svm";

import {
  predictSVC,
  type TrainedSVC,
} from "./svcMath";

type Props = {
  rows: SVMRow[];
  labels: (-1 | 1)[];
  model: TrainedSVC;
  featureNames: [
    string,
    string
  ];
  queryPoint?: [
    number,
    number
  ];
};

type Range = {
  min: number;
  max: number;
};

function getRange(
  values: number[]
): Range {
  if (
    values.length === 0
  ) {
    return {
      min: -3,
      max: 3,
    };
  }

  const min =
    Math.min(...values);

  const max =
    Math.max(...values);

  const span =
    max - min || 1;

  return {
    min:
      min -
      span * 0.15,

    max:
      max +
      span * 0.15,
  };
}

export default function SVCDecisionVisualizer({
  rows,
  labels,
  model,
  featureNames,
  queryPoint,
}: Props) {
  const width = 760;
  const height = 500;
  const padding = 55;

  const xRange =
    useMemo(
      () =>
        getRange(
          rows.map(
            (row) =>
              row.features[0] ??
              0
          )
        ),
      [rows]
    );

  const yRange =
    useMemo(
      () =>
        getRange(
          rows.map(
            (row) =>
              row.features[1] ??
              0
          )
        ),
      [rows]
    );

  function scaleX(
    value: number
  ) {
    return (
      padding +
      ((value -
        xRange.min) /
        (xRange.max -
          xRange.min)) *
        (width -
          padding * 2)
    );
  }

  function scaleY(
    value: number
  ) {
    return (
      height -
      padding -
      ((value -
        yRange.min) /
        (yRange.max -
          yRange.min)) *
        (height -
          padding * 2)
    );
  }

  const grid =
    useMemo(() => {
      const result: Array<{
        x: number;
        y: number;
        prediction:
          | -1
          | 1;
        score: number;
      }> = [];

      const resolution = 34;

      for (
        let rowIndex = 0;
        rowIndex <
        resolution;
        rowIndex += 1
      ) {
        for (
          let columnIndex = 0;
          columnIndex <
          resolution;
          columnIndex += 1
        ) {
          const x =
            xRange.min +
            (columnIndex /
              (resolution -
                1)) *
              (xRange.max -
                xRange.min);

          const y =
            yRange.min +
            (rowIndex /
              (resolution -
                1)) *
              (yRange.max -
                yRange.min);

          const decision =
            predictSVC(
              model,
              [x, y]
            );

          result.push({
            x,
            y,
            prediction:
              decision.prediction,
            score:
              decision.score,
          });
        }
      }

      return result;
    }, [
      model,
      xRange,
      yRange,
    ]);

  const queryDecision =
    queryPoint
      ? predictSVC(
          model,
          queryPoint
        )
      : null;

  return (
    <section
      style={{
        border:
          "1px solid #334155",
        borderRadius: 16,
        padding: 20,
        background:
          "#0f172a",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        Live SVC Decision
        Region
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        The background shows the
        class predicted by the
        trained SVC across feature
        space. The transition
        between the two regions
        forms the nonlinear or
        linear decision boundary.
      </p>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: "100%",
            minWidth: 620,
            background:
              "#020617",
            borderRadius: 14,
          }}
        >
          {grid.map(
            (
              point,
              index
            ) => {
              const cellWidth =
                (width -
                  padding *
                    2) /
                34;

              const cellHeight =
                (height -
                  padding *
                    2) /
                34;

              return (
                <rect
                  key={index}
                  x={
                    scaleX(
                      point.x
                    ) -
                    cellWidth /
                      2
                  }
                  y={
                    scaleY(
                      point.y
                    ) -
                    cellHeight /
                      2
                  }
                  width={
                    cellWidth +
                    1
                  }
                  height={
                    cellHeight +
                    1
                  }
                  fill={
                    point.prediction ===
                    1
                      ? "rgba(244,114,182,0.14)"
                      : "rgba(56,189,248,0.14)"
                  }
                />
              );
            }
          )}

          {grid
            .filter(
              (point) =>
                Math.abs(
                  point.score
                ) < 0.12
            )
            .map(
              (
                point,
                index
              ) => (
                <circle
                  key={`boundary-${index}`}
                  cx={scaleX(
                    point.x
                  )}
                  cy={scaleY(
                    point.y
                  )}
                  r={2}
                  fill="#f8fafc"
                />
              )
            )}

          {rows.map(
            (
              row,
              index
            ) => {
              const label =
                labels[index] ??
                -1;

              const isSupport =
                model.supportVectorIndices.includes(
                  index
                );

              return (
                <g
                  key={
                    row.id
                  }
                >
                  {isSupport && (
                    <circle
                      cx={scaleX(
                        row
                          .features[0] ??
                          0
                      )}
                      cy={scaleY(
                        row
                          .features[1] ??
                          0
                      )}
                      r={12}
                      fill="none"
                      stroke="#facc15"
                      strokeWidth={3}
                    />
                  )}

                  <circle
                    cx={scaleX(
                      row
                        .features[0] ??
                        0
                    )}
                    cy={scaleY(
                      row
                        .features[1] ??
                        0
                    )}
                    r={7}
                    fill={
                      label === 1
                        ? "#f472b6"
                        : "#38bdf8"
                    }
                    stroke="#f8fafc"
                    strokeWidth={1}
                  />
                </g>
              );
            }
          )}

          {queryPoint && (
            <>
              <circle
                cx={scaleX(
                  queryPoint[0]
                )}
                cy={scaleY(
                  queryPoint[1]
                )}
                r={11}
                fill="#22c55e"
                stroke="#f8fafc"
                strokeWidth={3}
              />

              <text
                x={
                  scaleX(
                    queryPoint[0]
                  ) + 14
                }
                y={
                  scaleY(
                    queryPoint[1]
                  ) - 14
                }
                fill="#86efac"
                fontSize={13}
              >
                Query
              </text>
            </>
          )}

          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#94a3b8"
          >
            {featureNames[0]}
          </text>

          <text
            x={18}
            y={height / 2}
            textAnchor="middle"
            fill="#94a3b8"
            transform={`rotate(-90 18 ${
              height / 2
            })`}
          >
            {featureNames[1]}
          </text>
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          marginTop: 14,
          color:
            "#94a3b8",
          fontSize: 13,
        }}
      >
        <span>
          🔵 Class -1
        </span>

        <span>
          🩷 Class +1
        </span>

        <span>
          🟡 Ring = Support
          Vector
        </span>

        <span>
          🟢 Query Point
        </span>
      </div>

      {queryDecision && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background:
              "#020617",
          }}
        >
          Query prediction:{" "}
          <strong>
            {queryDecision.prediction ===
            1
              ? "Class +1"
              : "Class -1"}
          </strong>

          <div
            style={{
              color:
                "#94a3b8",
              marginTop: 6,
            }}
          >
            Decision score ={" "}
            {queryDecision.score.toFixed(
              4
            )}
          </div>
        </div>
      )}
    </section>
  );
}