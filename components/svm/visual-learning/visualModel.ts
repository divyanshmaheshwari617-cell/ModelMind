import type {
  SVMRow,
} from "../types/svm";

export type LinearBoundary = {
  a: number;
  b: number;
  c: number;

  margin: number;

  supportVectorIndexes:
    number[];
};

type Centroid = {
  x: number;
  y: number;
};

function centroid(
  rows: SVMRow[]
): Centroid {
  if (
    rows.length === 0
  ) {
    return {
      x: 0,
      y: 0,
    };
  }

  return {
    x:
      rows.reduce(
        (sum, row) =>
          sum +
          (row.features[0] ??
            0),
        0
      ) / rows.length,

    y:
      rows.reduce(
        (sum, row) =>
          sum +
          (row.features[1] ??
            0),
        0
      ) / rows.length,
  };
}

export function buildEducationalBoundary(
  rows: SVMRow[]
): LinearBoundary | null {
  const targets =
    Array.from(
      new Set(
        rows.map(
          (row) =>
            String(row.target)
        )
      )
    );

  if (
    targets.length < 2
  ) {
    return null;
  }

  const first =
    rows.filter(
      (row) =>
        String(row.target) ===
        targets[0]
    );

  const second =
    rows.filter(
      (row) =>
        String(row.target) ===
        targets[1]
    );

  if (
    first.length === 0 ||
    second.length === 0
  ) {
    return null;
  }

  const c1 =
    centroid(first);

  const c2 =
    centroid(second);

  /*
   * Vector connecting the two
   * class centroids becomes the
   * normal vector of the
   * educational separator.
   */
  let a =
    c2.x - c1.x;

  let b =
    c2.y - c1.y;

  const norm =
    Math.sqrt(
      a * a +
      b * b
    );

  if (norm < 1e-9) {
    a = 1;
    b = 0;
  }

  const midpointX =
    (c1.x + c2.x) / 2;

  const midpointY =
    (c1.y + c2.y) / 2;

  const c =
    -(
      a * midpointX +
      b * midpointY
    );

  const denominator =
    Math.sqrt(
      a * a +
      b * b
    ) || 1;

  const distances =
    rows.map(
      (row, index) => ({
        index,

        distance:
          Math.abs(
            a *
              (row.features[0] ??
                0) +
            b *
              (row.features[1] ??
                0) +
            c
          ) /
          denominator,
      })
    );

  const sorted =
    [...distances].sort(
      (left, right) =>
        left.distance -
        right.distance
    );

  const supportVectorIndexes =
    sorted
      .slice(
        0,
        Math.min(
          4,
          sorted.length
        )
      )
      .map(
        (item) =>
          item.index
      );

  const margin =
    sorted.length > 0
      ? Math.max(
          sorted[
            Math.min(
              3,
              sorted.length - 1
            )
          ].distance,
          0.15
        )
      : 0.5;

  return {
    a,
    b,
    c,
    margin,
    supportVectorIndexes,
  };
}

export function boundaryY(
  boundary:
    LinearBoundary,
  x: number,
  offset = 0
) {
  if (
    Math.abs(
      boundary.b
    ) < 1e-9
  ) {
    return null;
  }

  return (
    -(
      boundary.a * x +
      boundary.c -
      offset
    ) /
    boundary.b
  );
}

export function signedScore(
  boundary:
    LinearBoundary,
  x: number,
  y: number
) {
  const denominator =
    Math.sqrt(
      boundary.a *
        boundary.a +
      boundary.b *
        boundary.b
    ) || 1;

  return (
    boundary.a * x +
    boundary.b * y +
    boundary.c
  ) / denominator;
}