import type {
  CParameterExplanation,
  ClassificationMetrics,
  DatasetSplit,
  EpsilonTubePoint,
  FeatureScaler,
  GammaExplanation,
  Hyperplane2D,
  KernelResult,
  MarginLines2D,
  RegressionMetrics,
  SVMKernel,
  SVMRow,
  SupportVectorInfo,
} from "../types/svm";

export const EPSILON = 1e-9;

/* ========================================================
   BASIC STATISTICS
======================================================== */

export function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

export function variance(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  const avg = mean(values);

  return mean(
    values.map((value) => {
      const difference =
        value - avg;

      return difference * difference;
    })
  );
}

export function standardDeviation(
  values: number[]
): number {
  return Math.sqrt(
    variance(values)
  );
}

/* ========================================================
   VECTOR OPERATIONS
======================================================== */

export function dotProduct(
  first: number[],
  second: number[]
): number {
  const length = Math.min(
    first.length,
    second.length
  );

  let result = 0;

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    result +=
      first[index] *
      second[index];
  }

  return result;
}

export function vectorMagnitude(
  values: number[]
): number {
  return Math.sqrt(
    values.reduce(
      (sum, value) =>
        sum + value * value,
      0
    )
  );
}

export function euclideanDistance(
  first: number[],
  second: number[]
): number {
  const length = Math.min(
    first.length,
    second.length
  );

  let squaredDistance = 0;

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const difference =
      first[index] -
      second[index];

    squaredDistance +=
      difference * difference;
  }

  return Math.sqrt(
    squaredDistance
  );
}

/* ========================================================
   FEATURE SCALING
======================================================== */

export function createScalers(
  rows: SVMRow[]
): FeatureScaler[] {
  if (rows.length === 0) {
    return [];
  }

  const featureCount =
    rows[0].features.length;

  const scalers: FeatureScaler[] =
    [];

  for (
    let featureIndex = 0;
    featureIndex < featureCount;
    featureIndex += 1
  ) {
    const values = rows
      .map(
        (row) =>
          row.features[
            featureIndex
          ]
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );

    const featureMean =
      mean(values);

    const featureStd =
      standardDeviation(values);

    scalers.push({
      mean: featureMean,
      std:
        featureStd > EPSILON
          ? featureStd
          : 1,
    });
  }

  return scalers;
}

export function standardizeFeatures(
  features: number[],
  scalers: FeatureScaler[]
): number[] {
  return features.map(
    (value, index) => {
      const scaler =
        scalers[index];

      if (!scaler) {
        return value;
      }

      return (
        (value - scaler.mean) /
        scaler.std
      );
    }
  );
}

export function standardizeRows(
  rows: SVMRow[],
  scalers: FeatureScaler[]
): SVMRow[] {
  return rows.map((row) => ({
    ...row,

    features:
      standardizeFeatures(
        row.features,
        scalers
      ),
  }));
}

/* ========================================================
   DETERMINISTIC DATA SHUFFLING
======================================================== */

export function deterministicShuffle<T>(
  values: T[],
  seed = 42
): T[] {
  const result = [...values];

  let state = seed >>> 0;

  const random = () => {
    state =
      (
        Math.imul(
          state,
          1664525
        ) +
        1013904223
      ) >>> 0;

    return (
      state /
      4294967296
    );
  };

  for (
    let index =
      result.length - 1;
    index > 0;
    index -= 1
  ) {
    const swapIndex =
      Math.floor(
        random() *
          (index + 1)
      );

    [
      result[index],
      result[swapIndex],
    ] = [
      result[swapIndex],
      result[index],
    ];
  }

  return result;
}

/* ========================================================
   DATASET SPLITTING
======================================================== */

function clampTrainRatio(
  trainRatio: number
): number {
  return Math.min(
    0.95,
    Math.max(
      0.5,
      trainRatio
    )
  );
}

export function splitRegressionDataset(
  rows: SVMRow[],
  trainRatio = 0.75
): DatasetSplit {
  if (rows.length <= 1) {
    return {
      train: [...rows],
      test: [],
    };
  }

  const ratio =
    clampTrainRatio(
      trainRatio
    );

  const shuffled =
    deterministicShuffle(
      rows,
      42
    );

  const trainSize =
    Math.min(
      shuffled.length - 1,
      Math.max(
        1,
        Math.floor(
          shuffled.length *
            ratio
        )
      )
    );

  return {
    train:
      shuffled.slice(
        0,
        trainSize
      ),

    test:
      shuffled.slice(
        trainSize
      ),
  };
}

export function splitClassificationDataset(
  rows: SVMRow[],
  trainRatio = 0.75
): DatasetSplit {
  const ratio =
    clampTrainRatio(
      trainRatio
    );

  const groups =
    new Map<
      string,
      SVMRow[]
    >();

  rows.forEach((row) => {
    const key =
      String(row.target);

    const current =
      groups.get(key) ?? [];

    current.push(row);

    groups.set(
      key,
      current
    );
  });

  const train: SVMRow[] =
    [];

  const test: SVMRow[] =
    [];

  Array.from(
    groups.entries()
  ).forEach(
    (
      [, group],
      classIndex
    ) => {
      const shuffled =
        deterministicShuffle(
          group,
          42 +
            classIndex *
              997
        );

      if (
        shuffled.length === 1
      ) {
        train.push(
          shuffled[0]
        );

        return;
      }

      const trainSize =
        Math.min(
          shuffled.length - 1,
          Math.max(
            1,
            Math.floor(
              shuffled.length *
                ratio
            )
          )
        );

      train.push(
        ...shuffled.slice(
          0,
          trainSize
        )
      );

      test.push(
        ...shuffled.slice(
          trainSize
        )
      );
    }
  );

  return {
    train:
      deterministicShuffle(
        train,
        2026
      ),

    test:
      deterministicShuffle(
        test,
        2027
      ),
  };
}

/* ========================================================
   SVM KERNELS
======================================================== */

export function linearKernel(
  first: number[],
  second: number[]
): number {
  return dotProduct(
    first,
    second
  );
}

export function rbfKernel(
  first: number[],
  second: number[],
  gamma: number
): number {
  const safeGamma =
    Math.max(
      gamma,
      EPSILON
    );

  let squaredDistance = 0;

  const length = Math.min(
    first.length,
    second.length
  );

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const difference =
      first[index] -
      second[index];

    squaredDistance +=
      difference *
      difference;
  }

  return Math.exp(
    -safeGamma *
      squaredDistance
  );
}

export function polynomialKernel(
  first: number[],
  second: number[],
  gamma: number,
  degree: number,
  coef0 = 1
): number {
  const safeGamma =
    Math.max(
      gamma,
      EPSILON
    );

  const safeDegree =
    Math.max(
      1,
      Math.round(degree)
    );

  return Math.pow(
    safeGamma *
      dotProduct(
        first,
        second
      ) +
      coef0,
    safeDegree
  );
}

export function calculateKernel(
  first: number[],
  second: number[],
  kernel: SVMKernel,
  gamma = 1,
  degree = 3
): number {
  if (
    kernel === "rbf"
  ) {
    return rbfKernel(
      first,
      second,
      gamma
    );
  }

  if (
    kernel ===
    "polynomial"
  ) {
    return polynomialKernel(
      first,
      second,
      gamma,
      degree
    );
  }

  return linearKernel(
    first,
    second
  );
}

export function compareKernels(
  first: number[],
  second: number[],
  gamma = 1,
  degree = 3
): KernelResult {
  return {
    linear:
      linearKernel(
        first,
        second
      ),

    rbf:
      rbfKernel(
        first,
        second,
        gamma
      ),

    polynomial:
      polynomialKernel(
        first,
        second,
        gamma,
        degree
      ),
  };
}

/* ========================================================
   LINEAR HYPERPLANE
======================================================== */

export function decisionFunction2D(
  point: number[],
  hyperplane: Hyperplane2D
): number {
  const x1 =
    point[0] ?? 0;

  const x2 =
    point[1] ?? 0;

  return (
    hyperplane.w1 *
      x1 +
    hyperplane.w2 *
      x2 +
    hyperplane.bias
  );
}

export function predictLinearClass2D(
  point: number[],
  hyperplane: Hyperplane2D
): -1 | 1 {
  return (
    decisionFunction2D(
      point,
      hyperplane
    ) >= 0
      ? 1
      : -1
  );
}

export function hyperplaneMagnitude(
  hyperplane: Hyperplane2D
): number {
  return Math.sqrt(
    hyperplane.w1 *
      hyperplane.w1 +
      hyperplane.w2 *
        hyperplane.w2
  );
}

export function calculateMarginWidth(
  hyperplane: Hyperplane2D
): number {
  const magnitude =
    hyperplaneMagnitude(
      hyperplane
    );

  if (
    magnitude <= EPSILON
  ) {
    return 0;
  }

  return (
    2 / magnitude
  );
}

export function createMarginLines(
  hyperplane: Hyperplane2D
): MarginLines2D {
  return {
    decision: {
      ...hyperplane,
    },

    positive: {
      w1: hyperplane.w1,
      w2: hyperplane.w2,
      bias:
        hyperplane.bias -
        1,
    },

    negative: {
      w1: hyperplane.w1,
      w2: hyperplane.w2,
      bias:
        hyperplane.bias +
        1,
    },

    marginWidth:
      calculateMarginWidth(
        hyperplane
      ),
  };
}

export function solveHyperplaneY(
  x: number,
  hyperplane: Hyperplane2D,
  level = 0
): number | null {
  if (
    Math.abs(
      hyperplane.w2
    ) <= EPSILON
  ) {
    return null;
  }

  return (
    level -
    hyperplane.w1 * x -
    hyperplane.bias
  ) / hyperplane.w2;
}

export function distanceToHyperplane(
  point: number[],
  hyperplane: Hyperplane2D
): number {
  const magnitude =
    hyperplaneMagnitude(
      hyperplane
    );

  if (
    magnitude <= EPSILON
  ) {
    return 0;
  }

  return (
    Math.abs(
      decisionFunction2D(
        point,
        hyperplane
      )
    ) / magnitude
  );
}

/* ========================================================
   SUPPORT VECTOR ANALYSIS
======================================================== */

export function analyzeSupportVectors(
  rows: SVMRow[],
  labels: (-1 | 1)[],
  hyperplane: Hyperplane2D,
  tolerance = 0.15
): SupportVectorInfo[] {
  const magnitude =
    hyperplaneMagnitude(
      hyperplane
    );

  return rows.map(
    (row, index) => {
      const label =
        labels[index] ?? -1;

      const score =
        decisionFunction2D(
          row.features,
          hyperplane
        );

      const functionalMargin =
        label * score;

      const geometricDistance =
        magnitude >
        EPSILON
          ? Math.abs(
              score
            ) / magnitude
          : 0;

      const isSupportVector =
        Math.abs(
          functionalMargin -
            1
        ) <= tolerance ||
        functionalMargin < 1;

      const misclassified =
        functionalMargin < 0;

      const violatesMargin =
        functionalMargin < 1;

      return {
        row,
        label,
        functionalMargin,
        geometricDistance,
        isSupportVector,
        violatesMargin,
        misclassified,
      };
    }
  );
}

/* ========================================================
   HINGE LOSS
======================================================== */

export function hingeLoss(
  label: -1 | 1,
  score: number
): number {
  return Math.max(
    0,
    1 - label * score
  );
}

export function totalHingeLoss(
  labels: (-1 | 1)[],
  scores: number[]
): number {
  if (
    labels.length === 0
  ) {
    return 0;
  }

  let total = 0;

  const length =
    Math.min(
      labels.length,
      scores.length
    );

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    total += hingeLoss(
      labels[index],
      scores[index]
    );
  }

  return total / length;
}

/* ========================================================
   SVM OBJECTIVE
======================================================== */

export function linearSVMObjective(
  weights: number[],
  labels: (-1 | 1)[],
  scores: number[],
  C: number
): number {
  const safeC =
    Math.max(
      C,
      0
    );

  const regularization =
    0.5 *
    Math.pow(
      vectorMagnitude(
        weights
      ),
      2
    );

  const loss =
    totalHingeLoss(
      labels,
      scores
    );

  return (
    regularization +
    safeC * loss
  );
}

/* ========================================================
   C PARAMETER
======================================================== */

export function explainCParameter(
  C: number
): CParameterExplanation {
  const safeC =
    Math.max(
      C,
      EPSILON
    );

  const regularizationStrength =
    1 / safeC;

  if (safeC < 0.1) {
    return {
      C: safeC,
      regularizationStrength,
      marginPreference:
        "Very wide margin",
      errorTolerance:
        "High tolerance for margin violations",
      overfittingRisk:
        "Lower complexity, but underfitting may increase",
    };
  }

  if (safeC < 1) {
    return {
      C: safeC,
      regularizationStrength,
      marginPreference:
        "Wider margin",
      errorTolerance:
        "Moderate-to-high tolerance for violations",
      overfittingRisk:
        "Usually smoother and more regularized",
    };
  }

  if (safeC <= 10) {
    return {
      C: safeC,
      regularizationStrength,
      marginPreference:
        "Balanced margin",
      errorTolerance:
        "Balanced penalty for violations",
      overfittingRisk:
        "Moderate model complexity",
    };
  }

  return {
    C: safeC,
    regularizationStrength,
    marginPreference:
      "Narrower margin may be accepted",
    errorTolerance:
      "Strong penalty for violations",
    overfittingRisk:
      "Higher sensitivity to training observations",
  };
}

/* ========================================================
   GAMMA PARAMETER
======================================================== */

export function explainGamma(
  gamma: number
): GammaExplanation {
  const safeGamma =
    Math.max(
      gamma,
      EPSILON
    );

  if (
    safeGamma < 0.05
  ) {
    return {
      gamma: safeGamma,
      influenceRadius:
        "Very large",
      boundaryComplexity:
        "Very smooth",
      overfittingRisk:
        "Low complexity; underfitting may occur",
    };
  }

  if (
    safeGamma < 0.5
  ) {
    return {
      gamma: safeGamma,
      influenceRadius:
        "Large",
      boundaryComplexity:
        "Smooth",
      overfittingRisk:
        "Usually relatively stable",
    };
  }

  if (
    safeGamma <= 2
  ) {
    return {
      gamma: safeGamma,
      influenceRadius:
        "Moderate",
      boundaryComplexity:
        "Moderately flexible",
      overfittingRisk:
        "Depends strongly on dataset and C",
    };
  }

  return {
    gamma: safeGamma,
    influenceRadius:
      "Small",
    boundaryComplexity:
      "Highly local and flexible",
    overfittingRisk:
      "Higher risk of fitting local noise",
  };
}

/* ========================================================
   CLASSIFICATION METRICS
======================================================== */

export function evaluateBinaryClassification(
  actual: (-1 | 1)[],
  predicted: (-1 | 1)[]
): ClassificationMetrics {
  let truePositive = 0;
  let trueNegative = 0;
  let falsePositive = 0;
  let falseNegative = 0;

  const length =
    Math.min(
      actual.length,
      predicted.length
    );

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const actualValue =
      actual[index];

    const predictedValue =
      predicted[index];

    if (
      actualValue === 1 &&
      predictedValue === 1
    ) {
      truePositive += 1;
    } else if (
      actualValue === -1 &&
      predictedValue === -1
    ) {
      trueNegative += 1;
    } else if (
      actualValue === -1 &&
      predictedValue === 1
    ) {
      falsePositive += 1;
    } else if (
      actualValue === 1 &&
      predictedValue === -1
    ) {
      falseNegative += 1;
    }
  }

  const total =
    truePositive +
    trueNegative +
    falsePositive +
    falseNegative;

  const accuracy =
    total > 0
      ? (
          truePositive +
          trueNegative
        ) / total
      : 0;

  const precisionDenominator =
    truePositive +
    falsePositive;

  const precision =
    precisionDenominator > 0
      ? truePositive /
        precisionDenominator
      : 0;

  const recallDenominator =
    truePositive +
    falseNegative;

  const recall =
    recallDenominator > 0
      ? truePositive /
        recallDenominator
      : 0;

  const f1 =
    precision + recall > 0
      ? (
          2 *
          precision *
          recall
        ) /
        (
          precision +
          recall
        )
      : 0;

  return {
    accuracy,
    precision,
    recall,
    f1,

    confusionMatrix: {
      truePositive,
      trueNegative,
      falsePositive,
      falseNegative,
    },
  };
}

/* ========================================================
   REGRESSION METRICS
======================================================== */

export function evaluateRegression(
  actual: number[],
  predicted: number[]
): RegressionMetrics {
  const length =
    Math.min(
      actual.length,
      predicted.length
    );

  if (length === 0) {
    return {
      mse: 0,
      rmse: 0,
      mae: 0,
      r2: 0,
    };
  }

  const actualValues =
    actual.slice(
      0,
      length
    );

  const predictedValues =
    predicted.slice(
      0,
      length
    );

  let squaredError = 0;
  let absoluteError = 0;

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const residual =
      actualValues[index] -
      predictedValues[index];

    squaredError +=
      residual * residual;

    absoluteError +=
      Math.abs(residual);
  }

  const mse =
    squaredError / length;

  const rmse =
    Math.sqrt(mse);

  const mae =
    absoluteError / length;

  const actualMean =
    mean(actualValues);

  const totalVariation =
    actualValues.reduce(
      (sum, value) => {
        const difference =
          value -
          actualMean;

        return (
          sum +
          difference *
            difference
        );
      },
      0
    );

  const r2 =
    totalVariation >
    EPSILON
      ? 1 -
        squaredError /
          totalVariation
      : squaredError <=
        EPSILON
      ? 1
      : 0;

  return {
    mse,
    rmse,
    mae,
    r2,
  };
}

/* ========================================================
   SVR EPSILON TUBE
======================================================== */

export function epsilonInsensitiveLoss(
  actual: number,
  predicted: number,
  epsilon: number
): number {
  const safeEpsilon =
    Math.max(
      0,
      epsilon
    );

  return Math.max(
    0,
    Math.abs(
      actual -
      predicted
    ) -
      safeEpsilon
  );
}

export function analyzeEpsilonTubePoint(
  actual: number,
  predicted: number,
  epsilon: number
): EpsilonTubePoint {
  const safeEpsilon =
    Math.max(
      0,
      epsilon
    );

  const residual =
    actual - predicted;

  const absoluteResidual =
    Math.abs(residual);

  return {
    actual,
    predicted,

    upper:
      predicted +
      safeEpsilon,

    lower:
      predicted -
      safeEpsilon,

    residual,
    absoluteResidual,

    insideTube:
      absoluteResidual <=
      safeEpsilon,

    epsilonLoss:
      epsilonInsensitiveLoss(
        actual,
        predicted,
        safeEpsilon
      ),
  };
}

/* ========================================================
   SIMPLE LINEAR SVR VISUALIZATION HELPERS
======================================================== */

export function predictLinearRegression(
  features: number[],
  weights: number[],
  bias: number
): number {
  return (
    dotProduct(
      features,
      weights
    ) + bias
  );
}

export function calculateSVRLoss(
  actual: number[],
  predicted: number[],
  epsilon: number
): number {
  const length =
    Math.min(
      actual.length,
      predicted.length
    );

  if (length === 0) {
    return 0;
  }

  let total = 0;

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    total +=
      epsilonInsensitiveLoss(
        actual[index],
        predicted[index],
        epsilon
      );
  }

  return total / length;
}