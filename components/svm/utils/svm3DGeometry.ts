import type {
  SVMRow,
} from "../types/svm";

import type {
  LinearBoundary,
} from "../visual-learning/visualModel";

export type SurfaceGrid = {
  x: number[][];
  y: number[][];
  z: number[][];
};

export function createGridValues(
  minimum: number,
  maximum: number,
  count = 20
) {
  if (count <= 1) {
    return [minimum];
  }

  return Array.from(
    { length: count },
    (_, index) =>
      minimum +
      (index / (count - 1)) *
        (maximum - minimum)
  );
}

export function createDecisionScoreSurface(
  boundary: LinearBoundary,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  offset = 0,
  resolution = 22
): SurfaceGrid {
  const xs =
    createGridValues(
      xMin,
      xMax,
      resolution
    );

  const ys =
    createGridValues(
      yMin,
      yMax,
      resolution
    );

  const normalLength =
    Math.sqrt(
      boundary.a ** 2 +
      boundary.b ** 2
    ) || 1;

  const xGrid: number[][] = [];
  const yGrid: number[][] = [];
  const zGrid: number[][] = [];

  ys.forEach((y) => {
    const xRow: number[] = [];
    const yRow: number[] = [];
    const zRow: number[] = [];

    xs.forEach((x) => {
      xRow.push(x);
      yRow.push(y);

      const score =
        (
          boundary.a * x +
          boundary.b * y +
          boundary.c
        ) / normalLength;

      zRow.push(
        score + offset
      );
    });

    xGrid.push(xRow);
    yGrid.push(yRow);
    zGrid.push(zRow);
  });

  return {
    x: xGrid,
    y: yGrid,
    z: zGrid,
  };
}

export function getDecisionScores(
  rows: SVMRow[],
  boundary: LinearBoundary
) {
  const normalLength =
    Math.sqrt(
      boundary.a ** 2 +
      boundary.b ** 2
    ) || 1;

  return rows.map((row) => {
    const x =
      row.features[0] ?? 0;

    const y =
      row.features[1] ?? 0;

    return (
      boundary.a * x +
      boundary.b * y +
      boundary.c
    ) / normalLength;
  });
}