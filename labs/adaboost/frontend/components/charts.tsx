
"use client";

import { useMemo, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import type { TrainResult, Stage } from "@/lib/types";

// ============================================================
// SHARED HELPERS
// ============================================================

const fmt = (value: number) =>
  Number.isFinite(value) ? value.toFixed(3) : "—";

export const pretty = (
  value: number | null | undefined
) => {
  return value == null ? "—" : fmt(value);
};

const isFiniteNumber = (
  value: unknown
): value is number =>
  typeof value === "number" &&
  Number.isFinite(value);

const clamp = (
  value: number,
  minimum: number,
  maximum: number
) => Math.max(minimum, Math.min(maximum, value));

const shortLabel = (value: string, max = 24) =>
  value.length > max
    ? `${value.slice(0, max - 1)}…`
    : value;

// ============================================================
// LEARNING CURVE
// ============================================================

export function LearningCurve({
  data,
  metric,
  active,
}: {
  data: Stage[];
  metric: string;
  active: number;
}) {
  const chart = data.map((stage) => ({
    round: stage.round,
    train: stage.train[metric],
    test: stage.test[metric],
  }));

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chart}>
          <CartesianGrid
            strokeDasharray="3 5"
            stroke="#24334a"
          />

          <XAxis
            dataKey="round"
            tick={{ fill: "#8394ae" }}
          />

          <YAxis
            tick={{ fill: "#8394ae" }}
            domain={["auto", "auto"]}
          />

          <Tooltip
            contentStyle={{
              background: "#172337",
              border: "1px solid #33435b",
              borderRadius: 12,
            }}
          />

          <Legend />

          <Line
            dataKey="train"
            name="Training"
            stroke="#5fe1ce"
            dot={false}
            strokeWidth={2}
          />

          <Line
            dataKey="test"
            name="Testing"
            stroke="#a78bfa"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="small">
        Selected round: {active + 1} / {data.length}.
        Final scores use all fitted rounds.
      </p>
    </div>
  );
}

// ============================================================
// ESTIMATOR WEIGHT CHART
// ============================================================

export function WeightChart({
  data,
  active,
}: {
  data: Stage[];
  active: number;
}) {
  const bars = data.slice(0, active + 1).map((stage) => ({
    round: stage.round,
    weight: stage.weight,
    error: stage.error,
  }));

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={bars}>
          <CartesianGrid
            strokeDasharray="3 5"
            stroke="#24334a"
          />

          <XAxis
            dataKey="round"
            tick={{ fill: "#8394ae" }}
          />

          <YAxis tick={{ fill: "#8394ae" }} />

          <Tooltip
            contentStyle={{
              background: "#172337",
              border: "1px solid #33435b",
              borderRadius: 12,
            }}
          />

          <Bar
            dataKey="weight"
            name="Estimator weight"
            fill="#4dd9c0"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className="small">
        Estimator weights are returned by scikit-learn.
        For regression they reflect the fitted AdaBoost.R2
        ensemble.
      </p>
    </div>
  );
}

// ============================================================
// FEATURE IMPORTANCE
// ============================================================

export function ImportanceChart({
  data,
}: {
  data: TrainResult["importance"];
}) {
  return (
    <div className="chart">
      <ResponsiveContainer
        width="100%"
        height={Math.max(230, data.length * 29)}
      >
        <BarChart
          layout="vertical"
          data={[...data].reverse()}
          margin={{
            left: 10,
            right: 25,
          }}
        >
          <XAxis
            type="number"
            tick={{ fill: "#8394ae" }}
          />

          <YAxis
            type="category"
            dataKey="feature"
            width={128}
            tick={{
              fill: "#d5e1f3",
              fontSize: 11,
            }}
          />

          <Tooltip
            contentStyle={{
              background: "#172337",
              border: "1px solid #33435b",
            }}
          />

          <Bar
            dataKey="value"
            fill="#a78bfa"
            radius={[0, 5, 5, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// SURFACE TYPES
// ============================================================

type Surface = NonNullable<TrainResult["surface"]>;

type SurfaceProps = {
  surface: Surface;
  task: TrainResult["task"];
  classes: string[];
  threeD: boolean;
  target?: string;
};

type ProjectedPoint = {
  x: number;
  y: number;
};

type SurfacePolygon = {
  key: string;
  points: string;
  fill: string;
  depth: number;
  z: number;
};

// ============================================================
// 2D / 3D ADABOOST SURFACE
// ============================================================

export function SurfaceChart({
  surface,
  task,
  classes,
  threeD,
  target = "Target",
}: SurfaceProps) {
  const [rotation, setRotation] = useState(35);
  const [elevation, setElevation] = useState(29);

  const nx = surface.x.length;
  const ny = surface.y.length;

  // ----------------------------------------------------------
  // DETERMINE Z-AXIS MEANING
  // ----------------------------------------------------------

  const zLabel =
    surface.target_axis ||
    (task === "regression"
      ? `Predicted ${target}`
      : surface.mode === "probability"
      ? `P(${classes[1] ?? "positive class"})`
      : `Predicted ${target} class index`);

  // ----------------------------------------------------------
  // NORMALIZE BACKEND PREDICTIONS
  // ----------------------------------------------------------

  const normalized = useMemo(() => {
    const rawGrid: unknown[][] = surface.z;

    const classIndex = new Map(
      classes.map((label, index) => [
        String(label),
        index,
      ])
    );

    const classificationLabels =
      task === "classification" &&
      surface.mode !== "probability";

    const convertValue = (raw: unknown): number | null => {
      if (raw === null || raw === undefined) {
        return null;
      }

      if (classificationLabels) {
        const index = classIndex.get(String(raw));

        if (index !== undefined) {
          return index;
        }
      }

      if (isFiniteNumber(raw)) {
        return raw;
      }

      if (
        typeof raw === "string" &&
        raw.trim() !== ""
      ) {
        const parsed = Number(raw);

        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }

      return null;
    };

    const grid: (number | null)[][] = Array.from(
      { length: ny },
      (_, rowIndex) =>
        Array.from(
          { length: nx },
          (_, columnIndex) =>
            convertValue(
              rawGrid[rowIndex]?.[columnIndex]
            )
        )
    );

    const validValues = grid
      .flat()
      .filter(isFiniteNumber);

    const minimum = validValues.length
      ? Math.min(...validValues)
      : null;

    const maximum = validValues.length
      ? Math.max(...validValues)
      : null;

    return {
      grid,
      minimum,
      maximum,
      validCount: validValues.length,
      invalidCount: nx * ny - validValues.length,
      classificationLabels,
    };
  }, [
    surface.z,
    surface.mode,
    task,
    classes,
    nx,
    ny,
  ]);

  // ----------------------------------------------------------
  // VALIDATE AXES
  // ----------------------------------------------------------

  const axes = useMemo(() => {
    const validX = surface.x.filter(isFiniteNumber);
    const validY = surface.y.filter(isFiniteNumber);

    const minimumX = validX.length
      ? Math.min(...validX)
      : 0;

    const maximumX = validX.length
      ? Math.max(...validX)
      : 1;

    const minimumY = validY.length
      ? Math.min(...validY)
      : 0;

    const maximumY = validY.length
      ? Math.max(...validY)
      : 1;

    return {
      minimumX,
      maximumX,
      minimumY,
      maximumY,
      rangeX: Math.max(
        1e-9,
        maximumX - minimumX
      ),
      rangeY: Math.max(
        1e-9,
        maximumY - minimumY
      ),
      valid:
        nx >= 2 &&
        ny >= 2 &&
        validX.length === nx &&
        validY.length === ny,
    };
  }, [surface.x, surface.y, nx, ny]);

  const lo = normalized.minimum ?? 0;
  const hi = normalized.maximum ?? 1;

  const zRange = Math.max(1e-9, hi - lo);

  const constantSurface =
    normalized.validCount > 0 &&
    Math.abs(hi - lo) < 1e-9;

  const normalizeZ = (z: number) =>
    constantSurface
      ? 0.5
      : clamp((z - lo) / zRange, 0, 1);

  const xToU = (x: number) =>
    (x - axes.minimumX) / axes.rangeX;

  const yToV = (y: number) =>
    (y - axes.minimumY) / axes.rangeY;

  const shade = (z: number): string => {
    const t = normalizeZ(z);

    return `hsl(${220 - 175 * t}, ${
      65 + 10 * t
    }%, ${30 + 25 * t}%)`;
  };

  // ----------------------------------------------------------
  // 3D PROJECTION
  // ----------------------------------------------------------

  const angle = (rotation * Math.PI) / 180;
  const tilt = (elevation * Math.PI) / 180;

  const project = (
    u: number,
    v: number,
    z: number
  ): ProjectedPoint => {
    const centeredU = u - 0.5;
    const centeredV = v - 0.5;

    const rotatedX =
      centeredU * Math.cos(angle) -
      centeredV * Math.sin(angle);

    const rotatedY =
      centeredU * Math.sin(angle) +
      centeredV * Math.cos(angle);

    const height = normalizeZ(z) - 0.5;

    return {
      x: 450 + rotatedX * 530,
      y:
        270 +
        rotatedY * Math.sin(tilt) * 340 -
        height * Math.cos(tilt) * 240,
    };
  };

  // ----------------------------------------------------------
  // BUILD 3D SURFACE POLYGONS
  // ----------------------------------------------------------

  const polygons = useMemo(() => {
    const output: SurfacePolygon[] = [];

    if (
      !threeD ||
      !axes.valid ||
      normalized.validCount === 0
    ) {
      return output;
    }

    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const z00 = normalized.grid[j]?.[i];
        const z10 = normalized.grid[j]?.[i + 1];
        const z11 = normalized.grid[j + 1]?.[i + 1];
        const z01 = normalized.grid[j + 1]?.[i];

        const zs = [z00, z10, z11, z01];

        if (!zs.every(isFiniteNumber)) {
          continue;
        }

        const corners: [number, number][] = [
          [i, j],
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
        ];

        const points = corners.map(
          ([column, row], index) =>
            project(
              column / (nx - 1),
              row / (ny - 1),
              zs[index] as number
            )
        );

        if (
          points.some(
            (point) =>
              !Number.isFinite(point.x) ||
              !Number.isFinite(point.y)
          )
        ) {
          continue;
        }

        const midU =
          (i + 0.5) / (nx - 1) - 0.5;

        const midV =
          (j + 0.5) / (ny - 1) - 0.5;

        const depth =
          midU * Math.sin(angle) +
          midV * Math.cos(angle);

        const averageZ =
          zs.reduce<number>(
            (sum, value) =>
              sum + (value as number),
            0
          ) / 4;

        const t = constantSurface
          ? 0.5
          : clamp(
              (averageZ - lo) / zRange,
              0,
              1
            );

        output.push({
          key: `${i}-${j}`,
          points: points
            .map((point) =>
              `${point.x},${point.y}`
            )
            .join(" "),
          fill: `hsl(${220 - 175 * t}, ${
            65 + 10 * t
          }%, ${30 + 25 * t}%)`,
          depth,
          z: averageZ,
        });
      }
    }

    return output.sort(
      (a, b) => a.depth - b.depth
    );
  }, [
    threeD,
    axes.valid,
    normalized,
    nx,
    ny,
    rotation,
    elevation,
    lo,
    zRange,
    constantSurface,
  ]);

  // ----------------------------------------------------------
  // 3D AXES AND AXIS ENDPOINT LABELS
  // ----------------------------------------------------------

  const axisLines = useMemo(() => {
    const origin = project(
      0,
      0,
      lo
    );

    const xEnd = project(
      1,
      0,
      lo
    );

    const yEnd = project(
      0,
      1,
      lo
    );

    const zEnd = project(
      0,
      0,
      hi
    );

    // On a constant surface, draw a visible Z direction
    // rather than collapsing the Z axis to zero length.
    if (constantSurface) {
      zEnd.y = origin.y - 160;
    }

    return {
      origin,
      xEnd,
      yEnd,
      zEnd,
    };
  }, [
    rotation,
    elevation,
    lo,
    hi,
    constantSurface,
  ]);

  // ----------------------------------------------------------
  // VALID TRAINING POINTS
  // ----------------------------------------------------------

  const samples = useMemo(
    () =>
      surface.points.filter(
        (point) =>
          isFiniteNumber(point.x) &&
          isFiniteNumber(point.y)
      ),
    [surface.points]
  );

  const noValues =
    normalized.validCount === 0;

  const noGeometry =
    threeD &&
    normalized.validCount > 0 &&
    polygons.length === 0;

  const unavailable =
    !axes.valid ||
    noValues ||
    noGeometry;

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div
      className="chart"
      style={{ overflow: "hidden" }}
    >
      <div
        className="small"
        style={{ marginBottom: 12 }}
      >
        X: {surface.feature_x}
        {" · "}
        Y: {surface.feature_y}
        {" · "}
        {threeD
          ? `Z: ${zLabel}`
          : `Color: ${zLabel}`}
        {" · "}
        {nx} × {ny} grid
      </div>

      {threeD && (
        <div
          className="formrow"
          style={{ marginBottom: 12 }}
        >
          <label>
            Rotate

            <input
              aria-label="Rotate 3D surface"
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(event) =>
                setRotation(
                  Number(event.target.value)
                )
              }
            />
          </label>

          <label>
            Elevation

            <input
              aria-label="3D elevation"
              type="range"
              min="5"
              max="80"
              value={elevation}
              onChange={(event) =>
                setElevation(
                  Number(event.target.value)
                )
              }
            />
          </label>
        </div>
      )}

      {unavailable ? (
        <div
          style={{
            minHeight: 280,
            background: "#111c2f",
            border: "1px solid #33435b",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#d5e1f3",
          }}
        >
          <h3>
            Surface visualization unavailable
          </h3>

          <p style={{ maxWidth: 560 }}>
            {!axes.valid
              ? "The backend returned invalid or insufficient X/Y grid coordinates."
              : noValues
              ? "The backend did not return finite numerical or recognized class predictions."
              : "There are not enough adjacent valid grid cells to construct a 3D surface."}
          </p>

          <p
            style={{
              color: "#a7b7d0",
              fontSize: 13,
            }}
          >
            This does not necessarily mean model
            training failed.
          </p>
        </div>
      ) : (
        <svg
          viewBox={
            threeD
              ? "0 0 900 540"
              : "0 0 900 530"
          }
          width="100%"
          role="img"
          aria-label={
            threeD
              ? `3D AdaBoost surface. X: ${surface.feature_x}, Y: ${surface.feature_y}, Z: ${zLabel}`
              : `2D AdaBoost heatmap. X: ${surface.feature_x}, Y: ${surface.feature_y}, Color: ${zLabel}`
          }
          style={{
            display: "block",
            background: "#111c2f",
            borderRadius: 12,
          }}
        >
          {threeD ? (
            <>
              {/* 3D SURFACE */}

              {polygons.map((polygon) => (
                <polygon
                  key={polygon.key}
                  points={polygon.points}
                  fill={polygon.fill}
                  stroke="rgba(255,255,255,.12)"
                  strokeWidth={0.7}
                >
                  <title>
                    {zLabel}: {fmt(polygon.z)}
                  </title>
                </polygon>
              ))}

              {/* VISIBLE 3D AXIS LINES */}

              <g
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <line
                  x1={axisLines.origin.x}
                  y1={axisLines.origin.y}
                  x2={axisLines.xEnd.x}
                  y2={axisLines.xEnd.y}
                  stroke="#5fe1ce"
                />

                <line
                  x1={axisLines.origin.x}
                  y1={axisLines.origin.y}
                  x2={axisLines.yEnd.x}
                  y2={axisLines.yEnd.y}
                  stroke="#a78bfa"
                />

                <line
                  x1={axisLines.origin.x}
                  y1={axisLines.origin.y}
                  x2={axisLines.zEnd.x}
                  y2={axisLines.zEnd.y}
                  stroke="#fbbf7b"
                />
              </g>

              {/* 3D AXIS NAMES */}

              <g
                fill="#f8fafc"
                fontSize={14}
                fontWeight={600}
              >
                <text
                  x={axisLines.xEnd.x + 14}
                  y={axisLines.xEnd.y + 20}
                  textAnchor="middle"
                >
                  X: {shortLabel(surface.feature_x)}
                </text>

                <text
                  x={axisLines.yEnd.x - 14}
                  y={axisLines.yEnd.y + 20}
                  textAnchor="middle"
                >
                  Y: {shortLabel(surface.feature_y)}
                </text>

                <text
                  x={axisLines.zEnd.x - 12}
                  y={axisLines.zEnd.y - 16}
                  textAnchor="end"
                >
                  Z: {shortLabel(zLabel, 36)}
                </text>
              </g>

              {/* 3D AXIS VALUES */}

              <g
                fill="#b8c8dd"
                fontSize={11}
              >
                <text
                  x={axisLines.origin.x + 8}
                  y={axisLines.origin.y + 18}
                >
                  {fmt(axes.minimumX)}
                </text>

                <text
                  x={axisLines.xEnd.x + 8}
                  y={axisLines.xEnd.y + 37}
                  textAnchor="middle"
                >
                  {fmt(axes.maximumX)}
                </text>

                <text
                  x={axisLines.yEnd.x - 8}
                  y={axisLines.yEnd.y + 37}
                  textAnchor="middle"
                >
                  {fmt(axes.maximumY)}
                </text>

                <text
                  x={axisLines.zEnd.x - 10}
                  y={axisLines.zEnd.y + 3}
                  textAnchor="end"
                >
                  {fmt(hi)}
                </text>
              </g>

              <text
                x="30"
                y="40"
                fill="#d5e1f3"
                fontSize="17"
              >
                AdaBoost prediction surface
              </text>
            </>
          ) : (
            <>
              {/* 2D HEATMAP */}

              {normalized.grid.map(
                (row, j) =>
                  row.slice(0, -1).map((z, i) => {
                    if (!isFiniteNumber(z)) {
                      return null;
                    }

                    return (
                      <rect
                        key={`${j}-${i}`}
                        x={
                          85 +
                          (i * 730) / (nx - 1)
                        }
                        y={
                          45 +
                          (j * 410) / (ny - 1)
                        }
                        width={
                          730 / (nx - 1) + 0.5
                        }
                        height={
                          410 / (ny - 1) + 0.5
                        }
                        fill={shade(z)}
                      >
                        <title>
                          {zLabel}: {fmt(z)}
                        </title>
                      </rect>
                    );
                  })
              )}

              {/* OBSERVED SAMPLES */}

              {samples
                .slice(0, 400)
                .map((point, index) => (
                  <circle
                    key={index}
                    cx={
                      85 +
                      xToU(point.x) * 730
                    }
                    cy={
                      45 +
                      yToV(point.y) * 410
                    }
                    r="3.2"
                    fill="#f8fafc"
                    fillOpacity={0.75}
                    stroke="#0b1220"
                    strokeWidth={0.7}
                  >
                    <title>
                      Actual {target}:{" "}
                      {String(point.label)}
                    </title>
                  </circle>
                ))}

              {/* 2D AXIS LINES */}

              <g
                stroke="#8394ae"
                strokeWidth={1.5}
              >
                <line
                  x1="85"
                  y1="455"
                  x2="815"
                  y2="455"
                />

                <line
                  x1="85"
                  y1="45"
                  x2="85"
                  y2="455"
                />
              </g>

              {/* 2D AXIS END VALUES */}

              <g
                fill="#a7b7d0"
                fontSize={12}
              >
                <text
                  x="85"
                  y="474"
                  textAnchor="middle"
                >
                  {fmt(axes.minimumX)}
                </text>

                <text
                  x="815"
                  y="474"
                  textAnchor="middle"
                >
                  {fmt(axes.maximumX)}
                </text>

                <text
                  x="76"
                  y="48"
                  textAnchor="end"
                >
                  {fmt(axes.minimumY)}
                </text>

                <text
                  x="76"
                  y="458"
                  textAnchor="end"
                >
                  {fmt(axes.maximumY)}
                </text>
              </g>

              {/* 2D AXIS LABELS */}

              <text
                x="450"
                y="506"
                textAnchor="middle"
                fill="#d5e1f3"
                fontSize="16"
                fontWeight={600}
              >
                X: {surface.feature_x}
              </text>

              <text
                x="18"
                y="250"
                transform="rotate(-90 18 250)"
                textAnchor="middle"
                fill="#d5e1f3"
                fontSize="16"
                fontWeight={600}
              >
                Y: {surface.feature_y}
              </text>
            </>
          )}
        </svg>
      )}

      {/* PREDICTION RANGE AND EXPLANATION */}

      <p
        className="small"
        style={{
          marginTop: 12,
          lineHeight: 1.8,
        }}
      >
        {normalized.validCount > 0
          ? `Color range: ${fmt(lo)} – ${fmt(hi)}.`
          : "Color range unavailable."}
        {" "}
        The graph is a two-feature slice of the
        complete trained model; other predictors
        are held at representative training values.
        {threeD
          ? " Use rotation and elevation controls to explore the surface."
          : ""}
      </p>

      {constantSurface && !unavailable && (
        <p
          className="small"
          style={{ color: "#8ee5d9" }}
        >
          All valid predictions on this grid are
          identical. A flat prediction surface is
          expected for this model and selected
          feature range.
        </p>
      )}

      {normalized.invalidCount > 0 && (
        <p
          className="small"
          style={{ color: "#fbbf7b" }}
        >
          {normalized.invalidCount} of {nx * ny}
          {" "}grid values could not be rendered.
          Invalid values are not replaced with
          fabricated predictions.
        </p>
      )}

      {/* MULTICLASS CLASS INDEX LEGEND */}

      {normalized.classificationLabels &&
        classes.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 12,
              fontSize: 12,
              color: "#a7b7d0",
            }}
          >
            {classes.map((label, index) => (
              <span key={`${index}-${label}`}>
                {index} = {label}
              </span>
            ))}
          </div>
        )}
    </div>
  );
}
