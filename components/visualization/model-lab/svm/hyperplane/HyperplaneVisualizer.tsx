import { useMemo } from "react";

import type {
  Hyperplane2D,
  SVMRow,
} from "../types/svm";

import {
  calculateMarginWidth,
  decisionFunction2D,
  solveHyperplaneY,
} from "../utils/svmMath";

type Props = {
  rows: SVMRow[];
  labels: (-1 | 1)[];
  featureNames: [string, string];

  hyperplane: Hyperplane2D;

  onHyperplaneChange: (
    hyperplane: Hyperplane2D
  ) => void;
};

type PlotPoint = {
  x: number;
  y: number;
  label: -1 | 1;
  score: number;
};

function getRange(
  values: number[]
): {
  minimum: number;
  maximum: number;
} {
  if (values.length === 0) {
    return {
      minimum: -5,
      maximum: 5,
    };
  }

  const minimum =
    Math.min(...values);

  const maximum =
    Math.max(...values);

  const range =
    maximum - minimum;

  const padding =
    range > 0
      ? range * 0.15
      : 1;

  return {
    minimum:
      minimum - padding,

    maximum:
      maximum + padding,
  };
}

export default function HyperplaneVisualizer({
  rows,
  labels,
  featureNames,
  hyperplane,
  onHyperplaneChange,
}: Props) {
  const points =
    useMemo<PlotPoint[]>(
      () =>
        rows
          .filter(
            (row) =>
              row.features.length >=
              2
          )
          .map(
            (row, index) => ({
              x:
                row.features[0] ??
                0,

              y:
                row.features[1] ??
                0,

              label:
                labels[index] ??
                -1,

              score:
                decisionFunction2D(
                  row.features,
                  hyperplane
                ),
            })
          ),
      [
        rows,
        labels,
        hyperplane,
      ]
    );

  const xRange =
    useMemo(
      () =>
        getRange(
          points.map(
            (point) =>
              point.x
          )
        ),
      [points]
    );

  const yRange =
    useMemo(
      () =>
        getRange(
          points.map(
            (point) =>
              point.y
          )
        ),
      [points]
    );

  const width = 760;
  const height = 480;

  const padding = 55;

  const plotWidth =
    width -
    padding * 2;

  const plotHeight =
    height -
    padding * 2;

  function scaleX(
    value: number
  ): number {
    const denominator =
      xRange.maximum -
      xRange.minimum ||
      1;

    return (
      padding +
      ((value -
        xRange.minimum) /
        denominator) *
        plotWidth
    );
  }

  function scaleY(
    value: number
  ): number {
    const denominator =
      yRange.maximum -
      yRange.minimum ||
      1;

    return (
      height -
      padding -
      ((value -
        yRange.minimum) /
        denominator) *
        plotHeight
    );
  }

  function createLine(
    level: number
  ) {
    const firstX =
      xRange.minimum;

    const secondX =
      xRange.maximum;

    const firstY =
      solveHyperplaneY(
        firstX,
        hyperplane,
        level
      );

    const secondY =
      solveHyperplaneY(
        secondX,
        hyperplane,
        level
      );

    if (
      firstY === null ||
      secondY === null
    ) {
      const w1 =
        hyperplane.w1;

      if (
        Math.abs(w1) <
        1e-9
      ) {
        return null;
      }

      const x =
        (level -
          hyperplane.bias) /
        w1;

      return {
        x1: scaleX(x),
        y1:
          scaleY(
            yRange.minimum
          ),
        x2: scaleX(x),
        y2:
          scaleY(
            yRange.maximum
          ),
      };
    }

    return {
      x1:
        scaleX(firstX),
      y1:
        scaleY(firstY),
      x2:
        scaleX(secondX),
      y2:
        scaleY(secondY),
    };
  }

  const decisionLine =
    createLine(0);

  const positiveMargin =
    createLine(1);

  const negativeMargin =
    createLine(-1);

  const marginWidth =
    calculateMarginWidth(
      hyperplane
    );

  const classNegative =
    points.filter(
      (point) =>
        point.label === -1
    );

  const classPositive =
    points.filter(
      (point) =>
        point.label === 1
    );

  function updateValue(
    key:
      | "w1"
      | "w2"
      | "bias",
    value: number
  ) {
    onHyperplaneChange({
      ...hyperplane,
      [key]: value,
    });
  }

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
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: 16,
        }}
      >
        <div>
          <h2
            style={{
              marginTop: 0,
              marginBottom: 6,
            }}
          >
            Interactive SVM
            Hyperplane
          </h2>

          <p
            style={{
              marginTop: 0,
              color:
                "#94a3b8",
              lineHeight: 1.6,
              maxWidth: 700,
            }}
          >
            Change the weights
            and bias to see how
            the SVM decision
            boundary and margins
            move through feature
            space.
          </p>
        </div>

        <div
          style={{
            padding:
              "10px 14px",
            borderRadius: 10,
            background:
              "#020617",
          }}
        >
          Margin width:{" "}
          <strong>
            {marginWidth.toFixed(
              3
            )}
          </strong>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginTop: 18,
          marginBottom: 18,
        }}
      >
        <ParameterControl
          label="w₁"
          value={
            hyperplane.w1
          }
          minimum={-5}
          maximum={5}
          step={0.1}
          onChange={(
            value
          ) =>
            updateValue(
              "w1",
              value
            )
          }
        />

        <ParameterControl
          label="w₂"
          value={
            hyperplane.w2
          }
          minimum={-5}
          maximum={5}
          step={0.1}
          onChange={(
            value
          ) =>
            updateValue(
              "w2",
              value
            )
          }
        />

        <ParameterControl
          label="Bias (b)"
          value={
            hyperplane.bias
          }
          minimum={-10}
          maximum={10}
          step={0.1}
          onChange={(
            value
          ) =>
            updateValue(
              "bias",
              value
            )
          }
        />
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background:
            "#020617",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily:
              "monospace",
            fontSize: 16,
          }}
        >
          {hyperplane.w1.toFixed(
            2
          )}
          x₁ +{" "}
          {hyperplane.w2.toFixed(
            2
          )}
          x₂ +{" "}
          {hyperplane.bias.toFixed(
            2
          )}{" "}
          = 0
        </div>

        <p
          style={{
            color:
              "#94a3b8",
            marginBottom: 0,
            fontSize: 14,
          }}
        >
          Points with a positive
          decision score are
          predicted as class +1.
          Points with a negative
          score are predicted as
          class -1.
        </p>
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
            minWidth: 600,
            background:
              "#020617",
            borderRadius: 14,
          }}
        >
          <rect
            x={padding}
            y={padding}
            width={plotWidth}
            height={plotHeight}
            fill="#020617"
            stroke="#334155"
          />

          {Array.from({
            length: 6,
          }).map(
            (_, index) => {
              const ratio =
                index / 5;

              const x =
                padding +
                ratio *
                  plotWidth;

              const y =
                padding +
                ratio *
                  plotHeight;

              return (
                <g
                  key={
                    index
                  }
                >
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={
                      height -
                      padding
                    }
                    stroke="#1e293b"
                  />

                  <line
                    x1={
                      padding
                    }
                    y1={y}
                    x2={
                      width -
                      padding
                    }
                    y2={y}
                    stroke="#1e293b"
                  />
                </g>
              );
            }
          )}

          {positiveMargin && (
            <line
              {...positiveMargin}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="8 6"
            />
          )}

          {negativeMargin && (
            <line
              {...negativeMargin}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="8 6"
            />
          )}

          {decisionLine && (
            <line
              {...decisionLine}
              stroke="#f8fafc"
              strokeWidth={3}
            />
          )}

          {classNegative.map(
            (
              point,
              index
            ) => (
              <circle
                key={`negative-${index}`}
                cx={scaleX(
                  point.x
                )}
                cy={scaleY(
                  point.y
                )}
                r={7}
                fill="#38bdf8"
                stroke="#e0f2fe"
                strokeWidth={1.5}
              >
                <title>
                  {featureNames[0]}
                  :{" "}
                  {point.x.toFixed(
                    2
                  )}
                  ,{" "}
                  {featureNames[1]}
                  :{" "}
                  {point.y.toFixed(
                    2
                  )}
                  , score:{" "}
                  {point.score.toFixed(
                    3
                  )}
                </title>
              </circle>
            )
          )}

          {classPositive.map(
            (
              point,
              index
            ) => (
              <circle
                key={`positive-${index}`}
                cx={scaleX(
                  point.x
                )}
                cy={scaleY(
                  point.y
                )}
                r={7}
                fill="#f472b6"
                stroke="#fce7f3"
                strokeWidth={1.5}
              >
                <title>
                  {featureNames[0]}
                  :{" "}
                  {point.x.toFixed(
                    2
                  )}
                  ,{" "}
                  {featureNames[1]}
                  :{" "}
                  {point.y.toFixed(
                    2
                  )}
                  , score:{" "}
                  {point.score.toFixed(
                    3
                  )}
                </title>
              </circle>
            )
          )}

          <text
            x={
              width / 2
            }
            y={
              height - 12
            }
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={14}
          >
            {featureNames[0]}
          </text>

          <text
            x={18}
            y={
              height / 2
            }
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={14}
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
          gap: 16,
          marginTop: 14,
          color:
            "#cbd5e1",
          fontSize: 13,
        }}
      >
        <Legend
          color="#38bdf8"
          text="Class -1"
        />

        <Legend
          color="#f472b6"
          text="Class +1"
        />

        <LineLegend
          color="#f8fafc"
          text="Decision Boundary"
        />

        <LineLegend
          color="#f59e0b"
          text="Margins (+1 / -1)"
          dashed
        />
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 12,
          background:
            "#020617",
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        <strong
          style={{
            color:
              "#e2e8f0",
          }}
        >
          What should you notice?
        </strong>

        <br />

        Changing{" "}
        <strong>w₁</strong>{" "}
        and{" "}
        <strong>w₂</strong>{" "}
        rotates the decision
        boundary and also changes
        the margin width. Changing
        the{" "}
        <strong>bias</strong>{" "}
        moves the boundary without
        directly changing the
        weight magnitude.
      </div>
    </section>
  );
}

type ParameterControlProps = {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  onChange: (
    value: number
  ) => void;
};

function ParameterControl({
  label,
  value,
  minimum,
  maximum,
  step,
  onChange,
}: ParameterControlProps) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        background:
          "#020617",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <strong>
          {label}
        </strong>

        <span
          style={{
            fontFamily:
              "monospace",
          }}
        >
          {value.toFixed(2)}
        </span>
      </div>

      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            Number(
              event.target
                .value
            )
          )
        }
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}

function Legend({
  color,
  text,
}: {
  color: string;
  text: string;
}) {
  return (
    <span
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: 6,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius:
            "50%",
          background: color,
          display:
            "inline-block",
        }}
      />

      {text}
    </span>
  );
}

function LineLegend({
  color,
  text,
  dashed = false,
}: {
  color: string;
  text: string;
  dashed?: boolean;
}) {
  return (
    <span
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: 6,
      }}
    >
      <span
        style={{
          width: 24,
          height: 0,
          borderTop: `2px ${
            dashed
              ? "dashed"
              : "solid"
          } ${color}`,
          display:
            "inline-block",
        }}
      />

      {text}
    </span>
  );
}