import type {
  SVMRow,
  SVMTarget,
} from "../types/svm";

export type PlotPoint = {
  id: string;

  x: number;
  y: number;
  z: number;

  target: SVMTarget;

  originalIndex: number;
};

export type FeatureRange = {
  min: number;
  max: number;
  span: number;
  padding: number;
};

export function toPlotPoints(
  rows: SVMRow[]
): PlotPoint[] {
  return rows.map(
    (row, index) => ({
      id: row.id,

      x:
        row.features[0] ??
        0,

      y:
        row.features[1] ??
        0,

      z:
        row.features[2] ??
        0,

      target: row.target,

      originalIndex:
        index,
    })
  );
}

export function getRange(
  values: number[]
): FeatureRange {
  const finite =
    values.filter(
      Number.isFinite
    );

  if (
    finite.length === 0
  ) {
    return {
      min: -1,
      max: 1,
      span: 2,
      padding: 0.2,
    };
  }

  let min =
    Math.min(...finite);

  let max =
    Math.max(...finite);

  if (min === max) {
    min -= 1;
    max += 1;
  }

  const span =
    max - min;

  const padding =
    Math.max(
      span * 0.12,
      0.25
    );

  return {
    min,
    max,
    span,
    padding,
  };
}

export function getUniqueTargets(
  rows: SVMRow[]
) {
  return Array.from(
    new Set(
      rows.map(
        (row) =>
          String(row.target)
      )
    )
  );
}

export function normalizeValue(
  value: number,
  min: number,
  max: number
) {
  if (max === min) {
    return 0;
  }

  return (
    (value - min) /
    (max - min)
  );
}

export function distance2D(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.sqrt(
    (x1 - x2) ** 2 +
    (y1 - y2) ** 2
  );
}