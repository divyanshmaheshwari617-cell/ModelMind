
import type { PolynomialDataPoint } from
  "@/lib/datasets/polynomialDatasets";

export interface FittedPolynomial {
  coefficients: number[];
  degree: number;
  predict: (x: number) => number;
  r2: number;
  mse: number;
  rmse: number;
  mae: number;
}

function solveLinearSystem(
  matrix: number[][],
  vector: number[]
): number[] {
  const n = vector.length;
  const augmented = matrix.map((row, i) => [
    ...row,
    vector[i],
  ]);

  for (let i = 0; i < n; i++) {
    let pivotRow = i;

    for (let j = i + 1; j < n; j++) {
      if (
        Math.abs(augmented[j][i]) >
        Math.abs(augmented[pivotRow][i])
      ) {
        pivotRow = j;
      }
    }

    if (Math.abs(augmented[pivotRow][i]) < 1e-12) {
      throw new Error(
        "Polynomial fitting failed: singular matrix."
      );
    }

    [augmented[i], augmented[pivotRow]] = [
      augmented[pivotRow],
      augmented[i],
    ];

    const pivot = augmented[i][i];

    for (let k = i; k <= n; k++) {
      augmented[i][k] /= pivot;
    }

    for (let j = 0; j < n; j++) {
      if (j === i) continue;

      const factor = augmented[j][i];

      for (let k = i; k <= n; k++) {
        augmented[j][k] -= factor * augmented[i][k];
      }
    }
  }

  return augmented.map((row) => row[n]);
}

export function fitPolynomial(
  points: PolynomialDataPoint[],
  degree: number
): FittedPolynomial {
  if (points.length < degree + 1) {
    throw new Error(
      "Not enough samples for the selected polynomial degree."
    );
  }

  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));

  const center = (minX + maxX) / 2;
  const scale = Math.max((maxX - minX) / 2, 1e-12);

  const normalized = points.map((p) => ({
    x: (p.x - center) / scale,
    y: p.y,
  }));

  const size = degree + 1;
  const matrix = Array.from(
    { length: size },
    () => Array(size).fill(0) as number[]
  );

  const vector = Array(size).fill(0) as number[];

  for (const point of normalized) {
    const powers = Array(2 * degree + 1).fill(1) as number[];

    for (let i = 1; i < powers.length; i++) {
      powers[i] = powers[i - 1] * point.x;
    }

    for (let row = 0; row < size; row++) {
      vector[row] += point.y * powers[row];

      for (let col = 0; col < size; col++) {
        matrix[row][col] += powers[row + col];
      }
    }
  }

  const coefficients = solveLinearSystem(matrix, vector);

  const predict = (x: number) => {
    const normalizedX = (x - center) / scale;

    return coefficients.reduceRight(
      (acc, coefficient) => acc * normalizedX + coefficient,
      0
    );
  };

  const actual = points.map((p) => p.y);
  const predicted = points.map((p) => predict(p.x));

  const mean =
    actual.reduce((sum, value) => sum + value, 0) /
    actual.length;

  const squaredErrors = actual.map(
    (value, i) => (value - predicted[i]) ** 2
  );

  const mse =
    squaredErrors.reduce((sum, value) => sum + value, 0) /
    actual.length;

  const mae =
    actual.reduce(
      (sum, value, i) => sum + Math.abs(value - predicted[i]),
      0
    ) / actual.length;

  const totalVariance = actual.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0
  );

  const residualVariance = squaredErrors.reduce(
    (sum, value) => sum + value,
    0
  );

  const r2 =
    totalVariance === 0
      ? residualVariance === 0
        ? 1
        : 0
      : 1 - residualVariance / totalVariance;

  return {
    coefficients,
    degree,
    predict,
    r2,
    mse,
    rmse: Math.sqrt(mse),
    mae,
  };
}
