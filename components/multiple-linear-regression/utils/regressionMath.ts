import type {
  CorrelationPair,
  FeatureContribution,
  FeatureStatistics,
  NumericRow,
  PredictionBreakdown,
  RegressionMetrics,
  RegressionPrediction,
  StandardizedCoefficient,
  TrainedMultipleRegressionModel,
} from "../types/dataset";

/*
|--------------------------------------------------------------------------
| Basic helpers
|--------------------------------------------------------------------------
*/

export function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const avg = mean(values);

  return (
    values.reduce((sum, value) => {
      const difference = value - avg;
      return sum + difference * difference;
    }, 0) / values.length
  );
}

export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

/*
|--------------------------------------------------------------------------
| Matrix helpers
|--------------------------------------------------------------------------
|
| Multiple Linear Regression:
|
| β = (XᵀX)⁻¹Xᵀy
|
| β contains:
|
| β₀ = intercept
| β₁ = coefficient of X₁
| β₂ = coefficient of X₂
| ...
|
*/

type Matrix = number[][];

function transpose(matrix: Matrix): Matrix {
  if (matrix.length === 0) {
    return [];
  }

  return matrix[0].map((_, columnIndex) =>
    matrix.map((row) => row[columnIndex]),
  );
}

function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
  if (a.length === 0 || b.length === 0) {
    return [];
  }

  const aColumns = a[0].length;
  const bRows = b.length;

  if (aColumns !== bRows) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }

  const result: Matrix = Array.from({ length: a.length }, () =>
    Array(b[0].length).fill(0),
  );

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;

      for (let k = 0; k < aColumns; k++) {
        sum += a[i][k] * b[k][j];
      }

      result[i][j] = sum;
    }
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| Matrix inverse using Gauss-Jordan elimination
|--------------------------------------------------------------------------
*/

function inverseMatrix(matrix: Matrix): Matrix {
  const size = matrix.length;

  if (size === 0 || matrix.some((row) => row.length !== size)) {
    throw new Error("Only square matrices can be inverted.");
  }

  const augmented: Matrix = matrix.map((row, rowIndex) => [
    ...row,
    ...Array.from(
      { length: size },
      (_, columnIndex) => (rowIndex === columnIndex ? 1 : 0),
    ),
  ]);

  const epsilon = 1e-12;

  for (let column = 0; column < size; column++) {
    let pivotRow = column;

    for (let row = column + 1; row < size; row++) {
      if (
        Math.abs(augmented[row][column]) >
        Math.abs(augmented[pivotRow][column])
      ) {
        pivotRow = row;
      }
    }

    if (Math.abs(augmented[pivotRow][column]) < epsilon) {
      throw new Error(
        "The regression matrix is singular. Some features may be constant, duplicated, or perfectly correlated.",
      );
    }

    if (pivotRow !== column) {
      [augmented[column], augmented[pivotRow]] = [
        augmented[pivotRow],
        augmented[column],
      ];
    }

    const pivot = augmented[column][column];

    for (let j = 0; j < size * 2; j++) {
      augmented[column][j] /= pivot;
    }

    for (let row = 0; row < size; row++) {
      if (row === column) {
        continue;
      }

      const factor = augmented[row][column];

      for (let j = 0; j < size * 2; j++) {
        augmented[row][j] -= factor * augmented[column][j];
      }
    }
  }

  return augmented.map((row) => row.slice(size));
}

/*
|--------------------------------------------------------------------------
| Build design matrix
|--------------------------------------------------------------------------
|
| If features are:
|
| Area
| Bedrooms
| Age
|
| X becomes:
|
| [1, Area, Bedrooms, Age]
|
| The first 1 is for the intercept.
|
*/

function createDesignMatrix(
  rows: NumericRow[],
  featureNames: string[],
): Matrix {
  return rows.map((row) => [
    1,
    ...featureNames.map((feature) => row[feature]),
  ]);
}

/*
|--------------------------------------------------------------------------
| Train Multiple Linear Regression
|--------------------------------------------------------------------------
*/

export function calculateRegressionCoefficients(
  rows: NumericRow[],
  featureNames: string[],
  targetName: string,
): {
  intercept: number;
  coefficients: Record<string, number>;
} {
  if (rows.length === 0) {
    throw new Error("Cannot train regression without data.");
  }

  if (featureNames.length === 0) {
    throw new Error("Select at least one feature.");
  }

  if (rows.length <= featureNames.length) {
    throw new Error(
      "Multiple Linear Regression needs more observations than selected features.",
    );
  }

  const X = createDesignMatrix(rows, featureNames);

  const y: Matrix = rows.map((row) => [row[targetName]]);

  const XT = transpose(X);

  const XTX = multiplyMatrices(XT, X);

  const XTXInverse = inverseMatrix(XTX);

  const XTy = multiplyMatrices(XT, y);

  const beta = multiplyMatrices(XTXInverse, XTy);

  const intercept = beta[0][0];

  const coefficients: Record<string, number> = {};

  featureNames.forEach((feature, index) => {
    coefficients[feature] = beta[index + 1][0];
  });

  return {
    intercept,
    coefficients,
  };
}

/*
|--------------------------------------------------------------------------
| Prediction
|--------------------------------------------------------------------------
*/

export function predictRow(
  row: NumericRow,
  featureNames: string[],
  intercept: number,
  coefficients: Record<string, number>,
): number {
  let prediction = intercept;

  for (const feature of featureNames) {
    prediction += coefficients[feature] * row[feature];
  }

  return prediction;
}

export function predictFromValues(
  values: Record<string, number>,
  featureNames: string[],
  intercept: number,
  coefficients: Record<string, number>,
): PredictionBreakdown {
  const contributions: FeatureContribution[] = featureNames.map((feature) => {
    const value = values[feature] ?? 0;
    const coefficient = coefficients[feature] ?? 0;

    return {
      feature,
      value,
      coefficient,
      contribution: value * coefficient,
    };
  });

  const prediction =
    intercept +
    contributions.reduce(
      (sum, contribution) => sum + contribution.contribution,
      0,
    );

  return {
    intercept,
    contributions,
    prediction,
  };
}

/*
|--------------------------------------------------------------------------
| Predictions + residuals
|--------------------------------------------------------------------------
|
| Residual:
|
| actual - predicted
|
*/

export function calculatePredictions(
  rows: NumericRow[],
  featureNames: string[],
  targetName: string,
  intercept: number,
  coefficients: Record<string, number>,
): RegressionPrediction[] {
  return rows.map((row, index) => {
    const actual = row[targetName];

    const predicted = predictRow(
      row,
      featureNames,
      intercept,
      coefficients,
    );

    const residual = actual - predicted;

    return {
      index,
      actual,
      predicted,
      residual,
      squaredError: residual * residual,
    };
  });
}

/*
|--------------------------------------------------------------------------
| Regression metrics
|--------------------------------------------------------------------------
*/

export function calculateMetrics(
  predictions: RegressionPrediction[],
): RegressionMetrics {
  if (predictions.length === 0) {
    return {
      mse: 0,
      rmse: 0,
      r2: 0,
      mae: 0,
    };
  }

  const actualValues = predictions.map((prediction) => prediction.actual);

  const actualMean = mean(actualValues);

  const mse =
    predictions.reduce(
      (sum, prediction) => sum + prediction.squaredError,
      0,
    ) / predictions.length;

  const rmse = Math.sqrt(mse);

  const mae =
    predictions.reduce(
      (sum, prediction) => sum + Math.abs(prediction.residual),
      0,
    ) / predictions.length;

  const totalSumSquares = predictions.reduce((sum, prediction) => {
    const difference = prediction.actual - actualMean;
    return sum + difference * difference;
  }, 0);

  const residualSumSquares = predictions.reduce(
    (sum, prediction) => sum + prediction.squaredError,
    0,
  );

  let r2 = 0;

  if (totalSumSquares > 0) {
    r2 = 1 - residualSumSquares / totalSumSquares;
  }

  return {
    mse,
    rmse,
    r2,
    mae,
  };
}

/*
|--------------------------------------------------------------------------
| Feature statistics
|--------------------------------------------------------------------------
*/

export function calculateFeatureStatistics(
  rows: NumericRow[],
  featureNames: string[],
): FeatureStatistics[] {
  return featureNames.map((feature) => {
    const values = rows.map((row) => row[feature]);

    return {
      name: feature,
      mean: mean(values),
      standardDeviation: standardDeviation(values),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });
}

/*
|--------------------------------------------------------------------------
| Standardized coefficients
|--------------------------------------------------------------------------
|
| Raw coefficients cannot always be compared directly because features can
| have very different units.
|
| Standardized coefficient:
|
| β_standardized = β × SD(X) / SD(Y)
|
*/

export function calculateStandardizedCoefficients(
  rows: NumericRow[],
  featureNames: string[],
  targetName: string,
  coefficients: Record<string, number>,
): StandardizedCoefficient[] {
  const targetValues = rows.map((row) => row[targetName]);

  const targetSD = standardDeviation(targetValues);

  return featureNames.map((feature) => {
    const featureValues = rows.map((row) => row[feature]);

    const featureSD = standardDeviation(featureValues);

    const rawCoefficient = coefficients[feature];

    const standardizedCoefficient =
      targetSD === 0
        ? 0
        : rawCoefficient * (featureSD / targetSD);

    return {
      feature,
      rawCoefficient,
      standardizedCoefficient,
      absoluteStandardizedCoefficient: Math.abs(
        standardizedCoefficient,
      ),
    };
  });
}

/*
|--------------------------------------------------------------------------
| Pearson correlation
|--------------------------------------------------------------------------
*/

export function pearsonCorrelation(
  x: number[],
  y: number[],
): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const xMean = mean(x);
  const yMean = mean(y);

  let numerator = 0;
  let xSquared = 0;
  let ySquared = 0;

  for (let i = 0; i < x.length; i++) {
    const xDifference = x[i] - xMean;
    const yDifference = y[i] - yMean;

    numerator += xDifference * yDifference;
    xSquared += xDifference * xDifference;
    ySquared += yDifference * yDifference;
  }

  const denominator = Math.sqrt(xSquared * ySquared);

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/*
|--------------------------------------------------------------------------
| Feature-to-feature correlations
|--------------------------------------------------------------------------
|
| This will later power the multicollinearity visualizer.
|
*/

export function calculateFeatureCorrelations(
  rows: NumericRow[],
  featureNames: string[],
): CorrelationPair[] {
  const correlations: CorrelationPair[] = [];

  for (let i = 0; i < featureNames.length; i++) {
    for (let j = i + 1; j < featureNames.length; j++) {
      const featureA = featureNames[i];
      const featureB = featureNames[j];

      const valuesA = rows.map((row) => row[featureA]);
      const valuesB = rows.map((row) => row[featureB]);

      correlations.push({
        featureA,
        featureB,
        correlation: pearsonCorrelation(valuesA, valuesB),
      });
    }
  }

  return correlations;
}

/*
|--------------------------------------------------------------------------
| Complete training pipeline
|--------------------------------------------------------------------------
*/

export function trainMultipleLinearRegression(
  rows: NumericRow[],
  featureNames: string[],
  targetName: string,
): TrainedMultipleRegressionModel {
  const { intercept, coefficients } =
    calculateRegressionCoefficients(
      rows,
      featureNames,
      targetName,
    );

  const predictions = calculatePredictions(
    rows,
    featureNames,
    targetName,
    intercept,
    coefficients,
  );

  const metrics = calculateMetrics(predictions);

  const standardizedCoefficients =
    calculateStandardizedCoefficients(
      rows,
      featureNames,
      targetName,
      coefficients,
    );

  return {
    featureNames,
    targetName,
    intercept,
    coefficients,
    predictions,
    metrics,
    standardizedCoefficients,
  };
}