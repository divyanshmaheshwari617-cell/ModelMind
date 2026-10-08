
"use client";

import { useMemo, useState } from "react";
import type { TrainingResponse } from "@/lib/api/polynomialApi";

type Props = {
  result: TrainingResponse | null;
  targetName: string;
};

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type ProjectedPoint = {
  x: number;
  y: number;
  depth: number;
};

type SurfaceCell = {
  key: string;
  depth: number;
  points: string;
  color: string;
};

const format = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return value.toPrecision(5);
};

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function getNumericRange(values: number[]) {
  let min = Infinity;
  let max = -Infinity;

  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return {
    min,
    max,
    span: max - min,
  };
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findInputFeature(
  firstTerm: string,
  features: Record<string, unknown>,
): string | null {
  const keys = Object.keys(features);

  if (keys.length === 0) return null;

  // Prefer the exact input name.
  if (firstTerm in features) return firstTerm;

  // Polynomial feature names may resemble "Area^1".
  const baseName = firstTerm
    .replace(/\^1$/, "")
    .trim();

  if (baseName in features) return baseName;

  const normalizedBase = normalizeName(baseName);

  const normalizedMatch = keys.find(
    (key) => normalizeName(key) === normalizedBase,
  );

  if (normalizedMatch) return normalizedMatch;

  // A first-degree term may be represented in a longer name.
  const matchingKey = keys.find((key) => {
    const normalizedKey = normalizeName(key);

    return (
      normalizedKey.length > 0 &&
      normalizeName(firstTerm).startsWith(normalizedKey)
    );
  });

  if (matchingKey) return matchingKey;

  // Safe fallback only when one original feature is present.
  return keys.length === 1 ? keys[0] : null;
}

export default function PolynomialLoss3DChart({
  result,
  targetName,
}: Props) {
  const [rotation, setRotation] = useState(35);
  const [elevation, setElevation] = useState(28);
  const [zoom, setZoom] = useState(1);
  const [resolution, setResolution] = useState(25);

  const model = useMemo(() => {
    if (!result) return null;

    const terms = result.polynomial.feature_names ?? [];
    const coefficients = result.polynomial.coefficients ?? [];

    const intercept = finiteNumber(
      result.polynomial.intercept,
    );

    if (
      terms.length === 0 ||
      coefficients.length === 0 ||
      intercept === null
    ) {
      return null;
    }

    const firstTerm = String(terms[0]);
    const firstCoefficient = finiteNumber(coefficients[0]);

    if (firstCoefficient === null) return null;

    const training = result.predictions.filter(
      (prediction) => prediction.split === "train",
    );

    if (training.length === 0) return null;

    const firstFeatures = training[0].features;

    if (
      !firstFeatures ||
      typeof firstFeatures !== "object"
    ) {
      return null;
    }

    const inputFeature = findInputFeature(
      firstTerm,
      firstFeatures as Record<string, unknown>,
    );

    if (!inputFeature) return null;

    const xs: number[] = [];
    const actualValues: number[] = [];
    const predictedValues: number[] = [];

    for (const prediction of training) {
      const features = prediction.features as
        | Record<string, unknown>
        | null
        | undefined;

      if (!features) continue;

      const x = finiteNumber(features[inputFeature]);
      const actual = finiteNumber(prediction.actual);
      const predicted = finiteNumber(prediction.predicted);

      if (
        x === null ||
        actual === null ||
        predicted === null
      ) {
        continue;
      }

      xs.push(x);
      actualValues.push(actual);
      predictedValues.push(predicted);
    }

    if (xs.length < 2) return null;

    const xRange = getNumericRange(xs);
    const targetRange = getNumericRange(actualValues);

    const spanIntercept = Math.max(
      targetRange.span * 0.6,
      Math.abs(intercept) * 0.25,
      0.001,
    );

    const spanCoefficient = Math.max(
      targetRange.span / Math.max(xRange.span, 0.001),
      Math.abs(firstCoefficient) * 0.4,
      0.001,
    );

    const fittedMSE =
      actualValues.reduce((sum, actual, index) => {
        const residual = actual - predictedValues[index];
        return sum + residual * residual;
      }, 0) / actualValues.length;

    const grid: Point3D[][] = [];

    for (let rowIndex = 0; rowIndex < resolution; rowIndex++) {
      const row: Point3D[] = [];

      for (
        let columnIndex = 0;
        columnIndex < resolution;
        columnIndex++
      ) {
        const u =
          (columnIndex / (resolution - 1)) * 2 - 1;

        const v =
          (rowIndex / (resolution - 1)) * 2 - 1;

        const interceptDelta = u * spanIntercept;
        const coefficientDelta = v * spanCoefficient;

        let squaredError = 0;

        for (let index = 0; index < xs.length; index++) {
          // Hold every other fitted polynomial coefficient fixed.
          // Change only the intercept and first coefficient.
          const adjustedPrediction =
            predictedValues[index] +
            interceptDelta +
            coefficientDelta * xs[index];

          const residual =
            actualValues[index] - adjustedPrediction;

          squaredError += residual * residual;
        }

        const mse = squaredError / xs.length;

        row.push({
          x: u,
          y: v,
          z: mse,
        });
      }

      grid.push(row);
    }

    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const row of grid) {
      for (const point of row) {
        minZ = Math.min(minZ, point.z);
        maxZ = Math.max(maxZ, point.z);
      }
    }

    if (!Number.isFinite(minZ) || !Number.isFinite(maxZ)) {
      return null;
    }

    return {
      grid,
      minZ: Math.min(minZ, fittedMSE),
      maxZ: Math.max(maxZ, fittedMSE),
      zRange: Math.max(
        Math.max(maxZ, fittedMSE) -
          Math.min(minZ, fittedMSE),
        1e-10,
      ),
      intercept,
      coefficient: firstCoefficient,
      firstTerm,
      inputFeature,
      fittedMSE,
      usedRows: xs.length,
      totalRows: training.length,
      spanIntercept,
      spanCoefficient,
    };
  }, [result, resolution]);

  const geometry = useMemo(() => {
    if (!model) return null;

    const angle = (rotation * Math.PI) / 180;
    const tilt = (elevation * Math.PI) / 180;

    function project(point: Point3D): ProjectedPoint {
      const normalizedZ =
        (point.z - model!.minZ) / model!.zRange;

      const rotatedX =
        point.x * Math.cos(angle) -
        point.y * Math.sin(angle);

      const rotatedY =
        point.x * Math.sin(angle) +
        point.y * Math.cos(angle);

      return {
        x: 350 + rotatedX * 145 * zoom,
        y:
          285 +
          rotatedY * Math.sin(tilt) * 115 * zoom -
          normalizedZ * Math.cos(tilt) * 185 * zoom,
        depth: rotatedY,
      };
    }

    const cells: SurfaceCell[] = [];

    for (
      let rowIndex = 0;
      rowIndex < model.grid.length - 1;
      rowIndex++
    ) {
      for (
        let columnIndex = 0;
        columnIndex < model.grid[rowIndex].length - 1;
        columnIndex++
      ) {
        const corners = [
          model.grid[rowIndex][columnIndex],
          model.grid[rowIndex][columnIndex + 1],
          model.grid[rowIndex + 1][columnIndex + 1],
          model.grid[rowIndex + 1][columnIndex],
        ];

        const projected = corners.map(project);

        const averageZ =
          corners.reduce((sum, point) => sum + point.z, 0) /
          corners.length;

        const ratio = Math.max(
          0,
          Math.min(
            1,
            (averageZ - model.minZ) / model.zRange,
          ),
        );

        const hue = 250 - ratio * 205;

        cells.push({
          key: `${rowIndex}-${columnIndex}`,
          depth:
            projected.reduce(
              (sum, point) => sum + point.depth,
              0,
            ) / projected.length,
          points: projected
            .map((point) => `${point.x},${point.y}`)
            .join(" "),
          color: `hsl(${hue}, 80%, ${36 + ratio * 15}%)`,
        });
      }
    }

    cells.sort((a, b) => a.depth - b.depth);

    const fittedMarker = project({
      x: 0,
      y: 0,
      z: model.fittedMSE,
    });

    return {
      cells,
      fittedMarker,
    };
  }, [model, rotation, elevation, zoom]);

  if (!result) {
    return (
      <div className="p-8 text-sm text-slate-400">
        Waiting for the trained polynomial regression model.
      </div>
    );
  }

  if (!model || !geometry) {
    return (
      <div className="space-y-3 p-8">
        <h3 className="font-semibold text-amber-300">
          Loss Surface Data Unavailable
        </h3>

        <p className="text-sm leading-7 text-slate-400">
          The training response does not contain enough matching,
          finite numeric input values and predictions to construct
          this loss surface.
        </p>

        <p className="text-xs text-slate-500">
          Train the model again and check that its selected input
          feature is numeric and its training predictions are
          included in the API response.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Interactive 3D Loss Surface
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-400">
          Explore how changing the intercept and the coefficient
          of {model.firstTerm} changes training mean squared error.
          All other polynomial coefficients remain fixed.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1021]">
        <svg
          viewBox="0 0 700 480"
          className="h-auto w-full"
          role="img"
          aria-label="Interactive three-dimensional polynomial regression loss surface"
        >
          <defs>
            <radialGradient id="polynomial-loss-background">
              <stop offset="0%" stopColor="#192447" />
              <stop offset="100%" stopColor="#080d1b" />
            </radialGradient>
          </defs>

          <rect
            width="700"
            height="480"
            fill="url(#polynomial-loss-background)"
          />

          {geometry.cells.map((cell) => (
            <polygon
              key={cell.key}
              points={cell.points}
              fill={cell.color}
              stroke="#a5b4fc"
              strokeOpacity={0.18}
              strokeWidth={0.5}
            />
          ))}

          <circle
            cx={geometry.fittedMarker.x}
            cy={geometry.fittedMarker.y}
            r={7}
            fill="#fb7185"
            stroke="white"
            strokeWidth={2}
          />

          <text
            x={18}
            y={30}
            fill="#e2e8f0"
            fontSize={14}
          >
            Z: Training MSE
          </text>

          <text
            x={18}
            y={52}
            fill="#94a3b8"
            fontSize={12}
          >
            X: Intercept | Y: {model.firstTerm} coefficient
          </text>

          <text
            x={18}
            y={455}
            fill="#fda4af"
            fontSize={12}
          >
            ● Fitted model
          </text>

          <text
            x={682}
            y={455}
            textAnchor="end"
            fill="#94a3b8"
            fontSize={11}
          >
            MSE: {format(model.fittedMSE)}
          </text>
        </svg>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-xs text-slate-400">
          Rotation: {rotation}°
          <input
            type="range"
            min={-180}
            max={180}
            value={rotation}
            onChange={(event) =>
              setRotation(Number(event.target.value))
            }
            className="mt-2 w-full accent-violet-500"
          />
        </label>

        <label className="text-xs text-slate-400">
          Elevation: {elevation}°
          <input
            type="range"
            min={10}
            max={75}
            value={elevation}
            onChange={(event) =>
              setElevation(Number(event.target.value))
            }
            className="mt-2 w-full accent-violet-500"
          />
        </label>

        <label className="text-xs text-slate-400">
          Zoom: {zoom.toFixed(1)}×
          <input
            type="range"
            min={0.6}
            max={1.5}
            step={0.1}
            value={zoom}
            onChange={(event) =>
              setZoom(Number(event.target.value))
            }
            className="mt-2 w-full accent-violet-500"
          />
        </label>
      </div>

      <label className="block text-xs text-slate-400">
        Surface resolution: {resolution} × {resolution}

        <input
          type="range"
          min={12}
          max={45}
          step={1}
          value={resolution}
          onChange={(event) =>
            setResolution(Number(event.target.value))
          }
          className="mt-2 w-full accent-violet-500"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            Fitted intercept
          </p>
          <p className="mt-2 font-mono text-violet-300">
            {format(model.intercept)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            First coefficient
          </p>
          <p className="mt-2 font-mono text-violet-300">
            {format(model.coefficient)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            Training MSE
          </p>
          <p className="mt-2 font-mono text-emerald-300">
            {format(model.fittedMSE)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-400">
        <p>
          <span className="font-semibold text-slate-200">
            Input feature:
          </span>{" "}
          {model.inputFeature}
        </p>

        <p>
          <span className="font-semibold text-slate-200">
            Target:
          </span>{" "}
          {targetName}
        </p>

        <p>
          <span className="font-semibold text-slate-200">
            Training records used:
          </span>{" "}
          {model.usedRows} / {model.totalRows}
        </p>

        <p className="mt-2">
          This visualization shows a two-parameter slice of
          training MSE rather than an additional regression input
          dimension. Ridge and Lasso penalties are not included.
          The coefficient perturbation assumes the first
          coefficient acts on the displayed raw input feature;
          if the backend uses standardized polynomial features,
          the surface needs the corresponding transformed values
          for exact coefficient-space interpretation.
        </p>
      </div>
    </div>
  );
}
