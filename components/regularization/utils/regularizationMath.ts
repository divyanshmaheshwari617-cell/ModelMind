import {
  CoefficientPathPoint,
  DatasetSplit,
  FeatureScaler,
  ModelType,
  NumericRow,
  RegressionMetrics,
  RegressionPrediction,
  TrainedRegularizationModel,
} from "../types/regularization";

const EPSILON = 1e-10;

function mean(values: number[]): number {
  if (values.length === 0) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function standardDeviation(
  values: number[],
  valueMean: number
): number {
  if (values.length === 0) return 1;

  const variance =
    values.reduce(
      (sum, value) =>
        sum + Math.pow(value - valueMean, 2),
      0
    ) / values.length;

  const std = Math.sqrt(variance);

  return std < EPSILON ? 1 : std;
}

export function splitDataset(
  rows: NumericRow[],
  trainRatio = 0.8
): DatasetSplit {
  if (rows.length <= 1) {
    return {
      trainRows: [...rows],
      testRows: [...rows],
    };
  }

  const safeRatio = Math.min(
    0.95,
    Math.max(0.5, trainRatio)
  );

  const splitIndex = Math.max(
    1,
    Math.min(
      rows.length - 1,
      Math.floor(rows.length * safeRatio)
    )
  );

  return {
    trainRows: rows.slice(0, splitIndex),
    testRows: rows.slice(splitIndex),
  };
}

export function createFeatureScalers(
  rows: NumericRow[],
  features: string[]
): FeatureScaler[] {
  return features.map((feature) => {
    const values = rows.map(
      (row) => Number(row[feature])
    );

    const featureMean = mean(values);

    return {
      feature,
      mean: featureMean,
      std: standardDeviation(values, featureMean),
    };
  });
}

function scaleValue(
  value: number,
  scaler: FeatureScaler
): number {
  return (value - scaler.mean) / scaler.std;
}

export function transformRows(
  rows: NumericRow[],
  features: string[],
  scalers: FeatureScaler[]
): number[][] {
  const scalerMap = new Map(
    scalers.map((scaler) => [
      scaler.feature,
      scaler,
    ])
  );

  return rows.map((row) =>
    features.map((feature) => {
      const scaler = scalerMap.get(feature);

      if (!scaler) {
        return Number(row[feature]);
      }

      return scaleValue(
        Number(row[feature]),
        scaler
      );
    })
  );
}

function transpose(matrix: number[][]): number[][] {
  if (matrix.length === 0) return [];

  return matrix[0].map((_, columnIndex) =>
    matrix.map((row) => row[columnIndex])
  );
}

function multiplyMatrices(
  a: number[][],
  b: number[][]
): number[][] {
  if (
    a.length === 0 ||
    b.length === 0 ||
    a[0].length !== b.length
  ) {
    throw new Error(
      "Matrix dimensions are incompatible."
    );
  }

  const result = Array.from(
    { length: a.length },
    () => Array(b[0].length).fill(0)
  );

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < b.length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

function inverseMatrix(
  matrix: number[][]
): number[][] {
  const n = matrix.length;

  const augmented = matrix.map(
    (row, rowIndex) => [
      ...row,
      ...Array.from(
        { length: n },
        (_, columnIndex) =>
          rowIndex === columnIndex ? 1 : 0
      ),
    ]
  );

  for (let column = 0; column < n; column++) {
    let pivotRow = column;

    for (
      let row = column + 1;
      row < n;
      row++
    ) {
      if (
        Math.abs(augmented[row][column]) >
        Math.abs(
          augmented[pivotRow][column]
        )
      ) {
        pivotRow = row;
      }
    }

    if (
      Math.abs(
        augmented[pivotRow][column]
      ) < EPSILON
    ) {
      augmented[pivotRow][column] += 1e-8;
    }

    [
      augmented[column],
      augmented[pivotRow],
    ] = [
      augmented[pivotRow],
      augmented[column],
    ];

    const pivot =
      augmented[column][column];

    for (
      let j = 0;
      j < 2 * n;
      j++
    ) {
      augmented[column][j] /= pivot;
    }

    for (
      let row = 0;
      row < n;
      row++
    ) {
      if (row === column) continue;

      const factor =
        augmented[row][column];

      for (
        let j = 0;
        j < 2 * n;
        j++
      ) {
        augmented[row][j] -=
          factor *
          augmented[column][j];
      }
    }
  }

  return augmented.map((row) =>
    row.slice(n)
  );
}

function trainOLS(
  x: number[][],
  y: number[]
): number[] {
  if (x.length === 0) return [];

  const design = x.map((row) => [
    1,
    ...row,
  ]);

  const xt = transpose(design);

  const xtx = multiplyMatrices(
    xt,
    design
  );

  for (
    let i = 0;
    i < xtx.length;
    i++
  ) {
    xtx[i][i] += 1e-8;
  }

  const inverse = inverseMatrix(xtx);

  const yMatrix = y.map((value) => [
    value,
  ]);

  const xty = multiplyMatrices(
    xt,
    yMatrix
  );

  const beta = multiplyMatrices(
    inverse,
    xty
  );

  return beta.map((row) => row[0]);
}

function softThreshold(
  value: number,
  threshold: number
): number {
  if (value > threshold) {
    return value - threshold;
  }

  if (value < -threshold) {
    return value + threshold;
  }

  return 0;
}

function trainCoordinateDescent(
  x: number[][],
  y: number[],
  modelType: ModelType,
  alpha: number,
  l1Ratio: number,
  maxIterations = 1500,
  tolerance = 1e-7
): {
  intercept: number;
  weights: number[];
  iterations: number;
} {
  const rowCount = x.length;

  if (rowCount === 0) {
    return {
      intercept: 0,
      weights: [],
      iterations: 0,
    };
  }

  const featureCount = x[0].length;

  const weights =
    Array(featureCount).fill(0);

  let intercept = mean(y);

  let iterations = 0;

  const safeAlpha = Math.max(
    0,
    alpha
  );

  const safeL1Ratio = Math.min(
    1,
    Math.max(0, l1Ratio)
  );

  let l1Penalty = 0;
  let l2Penalty = 0;

  if (modelType === "ridge") {
    l2Penalty = safeAlpha;
  }

  if (modelType === "lasso") {
    l1Penalty = safeAlpha;
  }

  if (
    modelType === "elastic-net"
  ) {
    l1Penalty =
      safeAlpha * safeL1Ratio;

    l2Penalty =
      safeAlpha *
      (1 - safeL1Ratio);
  }

  for (
    let iteration = 0;
    iteration < maxIterations;
    iteration++
  ) {
    iterations = iteration + 1;

    const oldWeights = [...weights];

    const predictions = x.map(
      (row) =>
        intercept +
        row.reduce(
          (sum, value, index) =>
            sum +
            value * weights[index],
          0
        )
    );

    const residualMean = mean(
      y.map(
        (target, index) =>
          target - predictions[index]
      )
    );

    intercept += residualMean;

    for (
      let featureIndex = 0;
      featureIndex < featureCount;
      featureIndex++
    ) {
      let numerator = 0;
      let denominator = 0;

      for (
        let rowIndex = 0;
        rowIndex < rowCount;
        rowIndex++
      ) {
        let predictionWithoutFeature =
          intercept;

        for (
          let j = 0;
          j < featureCount;
          j++
        ) {
          if (j === featureIndex) {
            continue;
          }

          predictionWithoutFeature +=
            x[rowIndex][j] *
            weights[j];
        }

        const partialResidual =
          y[rowIndex] -
          predictionWithoutFeature;

        numerator +=
          x[rowIndex][featureIndex] *
          partialResidual;

        denominator +=
          x[rowIndex][featureIndex] *
          x[rowIndex][featureIndex];
      }

      numerator /= rowCount;
      denominator /= rowCount;

      if (
        modelType === "linear"
      ) {
        weights[featureIndex] =
          numerator /
          Math.max(
            denominator,
            EPSILON
          );
      } else {
        weights[featureIndex] =
          softThreshold(
            numerator,
            l1Penalty
          ) /
          Math.max(
            denominator + l2Penalty,
            EPSILON
          );
      }
    }

    const maxChange = Math.max(
      ...weights.map(
        (weight, index) =>
          Math.abs(
            weight -
            oldWeights[index]
          )
      )
    );

    if (maxChange < tolerance) {
      break;
    }
  }

  return {
    intercept,
    weights,
    iterations,
  };
}

function predictScaled(
  x: number[][],
  intercept: number,
  weights: number[]
): number[] {
  return x.map(
    (row) =>
      intercept +
      row.reduce(
        (sum, value, index) =>
          sum +
          value *
          (weights[index] ?? 0),
        0
      )
  );
}

export function calculateMetrics(
  actual: number[],
  predicted: number[]
): RegressionMetrics {
  if (
    actual.length === 0 ||
    predicted.length === 0
  ) {
    return {
      mse: 0,
      rmse: 0,
      mae: 0,
      r2: 0,
    };
  }

  const count = Math.min(
    actual.length,
    predicted.length
  );

  const actualValues =
    actual.slice(0, count);

  const predictedValues =
    predicted.slice(0, count);

  const targetMean =
    mean(actualValues);

  let squaredError = 0;
  let absoluteError = 0;
  let totalVariance = 0;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const error =
      actualValues[i] -
      predictedValues[i];

    squaredError += error * error;

    absoluteError +=
      Math.abs(error);

    totalVariance += Math.pow(
      actualValues[i] -
        targetMean,
      2
    );
  }

  const mse =
    squaredError / count;

  const r2 =
    totalVariance < EPSILON
      ? squaredError < EPSILON
        ? 1
        : 0
      : 1 -
        squaredError /
          totalVariance;

  return {
    mse,
    rmse: Math.sqrt(mse),
    mae: absoluteError / count,
    r2,
  };
}

function createPredictions(
  actual: number[],
  predicted: number[]
): RegressionPrediction[] {
  return actual.map(
    (value, index) => ({
      actual: value,
      predicted:
        predicted[index] ?? 0,
      residual:
        value -
        (predicted[index] ?? 0),
    })
  );
}

function calculatePenalty(
  weights: number[],
  modelType: ModelType,
  alpha: number,
  l1Ratio: number
): number {
  if (
    modelType === "linear" ||
    alpha <= 0
  ) {
    return 0;
  }

  const l1 = weights.reduce(
    (sum, weight) =>
      sum + Math.abs(weight),
    0
  );

  const l2 = weights.reduce(
    (sum, weight) =>
      sum + weight * weight,
    0
  );

  if (modelType === "ridge") {
    return alpha * l2;
  }

  if (modelType === "lasso") {
    return alpha * l1;
  }

  return (
    alpha *
    (l1Ratio * l1 +
      (1 - l1Ratio) * l2)
  );
}

export function trainRegularizedModel(
  trainRows: NumericRow[],
  testRows: NumericRow[],
  features: string[],
  target: string,
  modelType: ModelType,
  alpha = 1,
  l1Ratio = 0.5
): TrainedRegularizationModel {
  if (trainRows.length === 0) {
    throw new Error(
      "Training dataset is empty."
    );
  }

  if (features.length === 0) {
    throw new Error(
      "Select at least one feature."
    );
  }

  const scalers =
    createFeatureScalers(
      trainRows,
      features
    );

  const trainX = transformRows(
    trainRows,
    features,
    scalers
  );

  const testX = transformRows(
    testRows,
    features,
    scalers
  );

  const trainY = trainRows.map(
    (row) => Number(row[target])
  );

  const testY = testRows.map(
    (row) => Number(row[target])
  );

  let intercept = 0;
  let weights: number[] = [];
  let iterations = 1;

  if (modelType === "linear") {
    const beta = trainOLS(
      trainX,
      trainY
    );

    intercept = beta[0] ?? 0;
    weights = beta.slice(1);
  } else {
    const result =
      trainCoordinateDescent(
        trainX,
        trainY,
        modelType,
        alpha,
        l1Ratio
      );

    intercept = result.intercept;
    weights = result.weights;
    iterations = result.iterations;
  }

  const trainPredicted =
    predictScaled(
      trainX,
      intercept,
      weights
    );

  const testPredicted =
    predictScaled(
      testX,
      intercept,
      weights
    );

  const trainMetrics =
    calculateMetrics(
      trainY,
      trainPredicted
    );

  const testMetrics =
    calculateMetrics(
      testY,
      testPredicted
    );

  const coefficients =
    Object.fromEntries(
      features.map(
        (feature, index) => [
          feature,
          weights[index] ?? 0,
        ]
      )
    );

  const penalty =
    calculatePenalty(
      weights,
      modelType,
      alpha,
      l1Ratio
    );

  return {
    modelType,
    features,
    target,

    alpha,
    l1Ratio,

    intercept,
    coefficients,

    scalers,
    targetMean: mean(trainY),

    trainPredictions:
      createPredictions(
        trainY,
        trainPredicted
      ),

    testPredictions:
      createPredictions(
        testY,
        testPredicted
      ),

    trainMetrics,
    testMetrics,

    penalty,

    objectiveValue:
      trainMetrics.mse + penalty,

    iterations,
  };
}

export function predictNewRow(
  row: NumericRow,
  model: TrainedRegularizationModel
): number {
  const scalerMap = new Map(
    model.scalers.map((scaler) => [
      scaler.feature,
      scaler,
    ])
  );

  let prediction =
    model.intercept;

  for (const feature of model.features) {
    const scaler =
      scalerMap.get(feature);

    const rawValue =
      Number(row[feature]);

    const scaledValue = scaler
      ? scaleValue(
          rawValue,
          scaler
        )
      : rawValue;

    prediction +=
      scaledValue *
      (model.coefficients[
        feature
      ] ?? 0);
  }

  return prediction;
}

export function generateCoefficientPath(
  trainRows: NumericRow[],
  testRows: NumericRow[],
  features: string[],
  target: string,
  modelType:
    | "ridge"
    | "lasso"
    | "elastic-net",
  l1Ratio = 0.5,
  alphaValues: number[] = [
    0,
    0.01,
    0.05,
    0.1,
    0.25,
    0.5,
    1,
    2,
    5,
    10,
    25,
    50,
    100,
  ]
): CoefficientPathPoint[] {
  return alphaValues.map(
    (alpha) => {
      const model =
        trainRegularizedModel(
          trainRows,
          testRows,
          features,
          target,
          modelType,
          alpha,
          l1Ratio
        );

      return {
        alpha,
        coefficients:
          model.coefficients,
      };
    }
  );
}

export function coefficientMagnitude(
  model: TrainedRegularizationModel
): number {
  return Object.values(
    model.coefficients
  ).reduce(
    (sum, coefficient) =>
      sum +
      Math.abs(coefficient),
    0
  );
}

export function countZeroCoefficients(
  model: TrainedRegularizationModel,
  tolerance = 1e-6
): number {
  return Object.values(
    model.coefficients
  ).filter(
    (coefficient) =>
      Math.abs(coefficient) <=
      tolerance
  ).length;
}