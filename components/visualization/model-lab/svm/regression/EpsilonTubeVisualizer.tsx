import {
  useMemo,
} from "react";

import type {
  SVMRow,
} from "../types/svm";

import {
  predictSVR,
  type TrainedSVR,
} from "./svrMath";

type Props = {
  rows: SVMRow[];

  model: TrainedSVR;

  featureName: string;
};

type Point = {
  x: number;
  actual: number;
  predicted: number;
  residual: number;
  insideTube: boolean;
  supportVector: boolean;
};

function numberTarget(
  value: string | number | null
) {
  if (
    typeof value === "number"
  ) {
    return value;
  }

  if (value === null) {
    return 0;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export default function EpsilonTubeVisualizer({
  rows,
  model,
  featureName,
}: Props) {
  const points =
    useMemo<Point[]>(
      () =>
        rows.map(
          (row, index) => {
            const actual =
              numberTarget(
                row.target
              );

            const predicted =
              predictSVR(
                model,
                row.features
              ).prediction;

            const residual =
              actual -
              predicted;

            return {
              x:
                row.features[0] ??
                0,

              actual,

              predicted,

              residual,

              insideTube:
                Math.abs(
                  residual
                ) <=
                model.epsilon,

              supportVector:
                model.supportVectorIndices.includes(
                  index
                ),
            };
          }
        ),
      [rows, model]
    );

  const sorted =
    useMemo(
      () =>
        [...points].sort(
          (a, b) =>
            a.x - b.x
        ),
      [points]
    );

  if (
    sorted.length === 0
  ) {
    return null;
  }

  const width = 760;
  const height = 500;
  const padding = 55;

  const xValues =
    sorted.map(
      (point) => point.x
    );

  const yValues =
    sorted.flatMap(
      (point) => [
        point.actual,
        point.predicted +
          model.epsilon,
        point.predicted -
          model.epsilon,
      ]
    );

  const minX =
    Math.min(...xValues);

  const maxX =
    Math.max(...xValues);

  const minY =
    Math.min(...yValues);

  const maxY =
    Math.max(...yValues);

  const xSpan =
    maxX - minX || 1;

  const ySpan =
    maxY - minY || 1;

  const xPadding =
    xSpan * 0.1;

  const yPadding =
    ySpan * 0.12;

  const xMin =
    minX - xPadding;

  const xMax =
    maxX + xPadding;

  const yMin =
    minY - yPadding;

  const yMax =
    maxY + yPadding;

  function scaleX(
    value: number
  ) {
    return (
      padding +
      ((value - xMin) /
        (xMax - xMin)) *
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
      ((value - yMin) /
        (yMax - yMin)) *
        (height -
          padding * 2)
    );
  }

  function pathFor(
    selector: (
      point: Point
    ) => number
  ) {
    return sorted
      .map(
        (point, index) =>
          `${
            index === 0
              ? "M"
              : "L"
          } ${scaleX(
            point.x
          )} ${scaleY(
            selector(point)
          )}`
      )
      .join(" ");
  }

  const predictionPath =
    pathFor(
      (point) =>
        point.predicted
    );

  const upperPath =
    pathFor(
      (point) =>
        point.predicted +
        model.epsilon
    );

  const lowerPath =
    pathFor(
      (point) =>
        point.predicted -
        model.epsilon
    );

  const inside =
    points.filter(
      (point) =>
        point.insideTube
    ).length;

  const outside =
    points.length - inside;

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
        ε-Insensitive Tube
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        SVR ignores prediction
        errors that remain within
        ±ε of the prediction
        function. Errors outside
        the tube contribute to the
        epsilon-insensitive loss.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Badge
          text={`ε = ${model.epsilon.toFixed(
            3
          )}`}
        />

        <Badge
          text={`Inside tube: ${inside}`}
        />

        <Badge
          text={`Outside tube: ${outside}`}
        />

        <Badge
          text={`Support vectors: ${model.supportVectorIndices.length}`}
        />
      </div>

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
          <path
            d={upperPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="8 6"
          />

          <path
            d={lowerPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="8 6"
          />

          <path
            d={predictionPath}
            fill="none"
            stroke="#f8fafc"
            strokeWidth={3}
          />

          {points.map(
            (
              point,
              index
            ) => (
              <g key={index}>
                {point.supportVector && (
                  <circle
                    cx={scaleX(
                      point.x
                    )}
                    cy={scaleY(
                      point.actual
                    )}
                    r={12}
                    fill="none"
                    stroke="#facc15"
                    strokeWidth={3}
                  />
                )}

                <circle
                  cx={scaleX(
                    point.x
                  )}
                  cy={scaleY(
                    point.actual
                  )}
                  r={7}
                  fill={
                    point.insideTube
                      ? "#22c55e"
                      : "#ef4444"
                  }
                  stroke="#f8fafc"
                  strokeWidth={1}
                />

                {!point.insideTube && (
                  <line
                    x1={scaleX(
                      point.x
                    )}
                    y1={scaleY(
                      point.actual
                    )}
                    x2={scaleX(
                      point.x
                    )}
                    y2={scaleY(
                      point.predicted
                    )}
                    stroke="#64748b"
                    strokeDasharray="4 4"
                  />
                )}
              </g>
            )
          )}

          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#94a3b8"
          >
            {featureName}
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
            Target
          </text>
        </svg>
      </div>

      <div
        style={{
          marginTop: 14,
          color:
            "#94a3b8",
          lineHeight: 1.7,
        }}
      >
        🟢 Inside ε-tube &nbsp;
        🔴 Outside ε-tube &nbsp;
        🟡 Ring = support vector
        &nbsp; — Prediction
        function &nbsp; - - ε
        boundaries
      </div>
    </section>
  );
}

function Badge({
  text,
}: {
  text: string;
}) {
  return (
    <span
      style={{
        padding:
          "7px 10px",
        borderRadius: 999,
        background:
          "#020617",
        color:
          "#cbd5e1",
        fontSize: 13,
      }}
    >
      {text}
    </span>
  );
}