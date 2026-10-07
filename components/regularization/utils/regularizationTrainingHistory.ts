import {
  FeatureScaler,
  ModelType,
  NumericRow,
  TrainedRegularizationModel,
} from "../types/regularization";

const EPSILON = 1e-10;

export interface RegularizationTrainingStep {
  iteration: number;

  intercept: number;

  coefficients: Record<string, number>;

  mse: number;

  penalty: number;

  objective: number;

  coefficientMagnitude: number;

  zeroCoefficients: number;
}

export interface RegularizationTrainingHistory {
  modelType: ModelType;

  features: string[];

  target: string;

  alpha: number;

  l1Ratio: number;

  scalers: FeatureScaler[];

  steps: RegularizationTrainingStep[];
}

function mean(values: number[]): number {
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

function scaleValue(
  value: number,
  scaler: FeatureScaler
): number {
  return (
    (value - scaler.mean) /
    scaler.std
  );
}

function transformRows(
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
      const scaler =
        scalerMap.get(feature);

      const value =
        Number(row[feature]);

      if (!scaler) {
        return value;
      }

      return scaleValue(
        value,
        scaler
      );
    })
  );
}

function calculateMSE(
  x: number[][],
  y: number[],
  intercept: number,
  weights: number[]
): number {
  if (x.length === 0) {
    return 0;
  }

  let squaredError = 0;

  for (
    let rowIndex = 0;
    rowIndex < x.length;
    rowIndex++
  ) {
    let prediction = intercept;

    for (
      let featureIndex = 0;
      featureIndex <
      weights.length;
      featureIndex++
    ) {
      prediction +=
        x[rowIndex][featureIndex] *
        weights[featureIndex];
    }

    const error =
      y[rowIndex] - prediction;

    squaredError +=
      error * error;
  }

  return (
    squaredError / x.length
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

  const l1 =
    weights.reduce(
      (sum, weight) =>
        sum +
        Math.abs(weight),
      0
    );

  const l2 =
    weights.reduce(
      (sum, weight) =>
        sum +
        weight * weight,
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
    (
      l1Ratio * l1 +
      (1 - l1Ratio) * l2
    )
  );
}

function createStep(
  iteration: number,
  intercept: number,
  weights: number[],
  features: string[],
  x: number[][],
  y: number[],
  modelType: ModelType,
  alpha: number,
  l1Ratio: number
): RegularizationTrainingStep {
  const coefficients =
    Object.fromEntries(
      features.map(
        (feature, index) => [
          feature,
          weights[index] ?? 0,
        ]
      )
    );

  const mse =
    calculateMSE(
      x,
      y,
      intercept,
      weights
    );

  const penalty =
    calculatePenalty(
      weights,
      modelType,
      alpha,
      l1Ratio
    );

  const coefficientMagnitude =
    weights.reduce(
      (sum, weight) =>
        sum +
        Math.abs(weight),
      0
    );

  const zeroCoefficients =
    weights.filter(
      (weight) =>
        Math.abs(weight) <=
        1e-6
    ).length;

  return {
    iteration,

    intercept,

    coefficients,

    mse,

    penalty,

    objective:
      mse + penalty,

    coefficientMagnitude,

    zeroCoefficients,
  };
}

export function generateRegularizationTrainingHistory(
  trainRows: NumericRow[],
  model: TrainedRegularizationModel,
  maxIterations = 80
): RegularizationTrainingHistory {
  const {
    modelType,
    features,
    target,
    alpha,
    l1Ratio,
    scalers,
  } = model;

  if (trainRows.length === 0) {
    return {
      modelType,
      features,
      target,
      alpha,
      l1Ratio,
      scalers,
      steps: [],
    };
  }

  const x =
    transformRows(
      trainRows,
      features,
      scalers
    );

  const y =
    trainRows.map(
      (row) =>
        Number(row[target])
    );

  const rowCount =
    x.length;

  const featureCount =
    features.length;

  const weights =
    Array(featureCount).fill(0);

  let intercept =
    mean(y);

  const safeAlpha =
    Math.max(0, alpha);

  const safeL1Ratio =
    Math.min(
      1,
      Math.max(0, l1Ratio)
    );

  let l1Penalty = 0;
  let l2Penalty = 0;

  if (modelType === "ridge") {
    l2Penalty =
      safeAlpha;
  }

  if (modelType === "lasso") {
    l1Penalty =
      safeAlpha;
  }

  if (
    modelType ===
    "elastic-net"
  ) {
    l1Penalty =
      safeAlpha *
      safeL1Ratio;

    l2Penalty =
      safeAlpha *
      (1 - safeL1Ratio);
  }

  const steps:
    RegularizationTrainingStep[] =
    [];

  steps.push(
    createStep(
      0,
      intercept,
      weights,
      features,
      x,
      y,
      modelType,
      alpha,
      l1Ratio
    )
  );

  /*
   * OLS is solved directly in the existing
   * ModelMind implementation instead of using
   * coordinate descent.
   *
   * For educational playback we interpolate
   * toward its solved coefficients.
   */
  if (modelType === "linear") {
    const finalWeights =
      features.map(
        (feature) =>
          model.coefficients[
            feature
          ] ?? 0
      );

    const finalIntercept =
      model.intercept;

    const animationSteps = 30;

    for (
      let iteration = 1;
      iteration <=
      animationSteps;
      iteration++
    ) {
      const progress =
        iteration /
        animationSteps;

      const currentWeights =
        finalWeights.map(
          (weight) =>
            weight * progress
        );

      const currentIntercept =
        mean(y) +
        (
          finalIntercept -
          mean(y)
        ) *
          progress;

      steps.push(
        createStep(
          iteration,
          currentIntercept,
          currentWeights,
          features,
          x,
          y,
          modelType,
          alpha,
          l1Ratio
        )
      );
    }

    return {
      modelType,
      features,
      target,
      alpha,
      l1Ratio,
      scalers,
      steps,
    };
  }

  for (
    let iteration = 0;
    iteration <
    maxIterations;
    iteration++
  ) {
    const oldWeights =
      [...weights];

    const predictions =
      x.map((row) => {
        let prediction =
          intercept;

        for (
          let index = 0;
          index <
          featureCount;
          index++
        ) {
          prediction +=
            row[index] *
            weights[index];
        }

        return prediction;
      });

    const residualMean =
      mean(
        y.map(
          (
            targetValue,
            index
          ) =>
            targetValue -
            predictions[index]
        )
      );

    intercept +=
      residualMean;

    for (
      let featureIndex = 0;
      featureIndex <
      featureCount;
      featureIndex++
    ) {
      let numerator = 0;
      let denominator = 0;

      for (
        let rowIndex = 0;
        rowIndex <
        rowCount;
        rowIndex++
      ) {
        let predictionWithoutFeature =
          intercept;

        for (
          let j = 0;
          j <
          featureCount;
          j++
        ) {
          if (
            j ===
            featureIndex
          ) {
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
          x[rowIndex][
            featureIndex
          ] *
          partialResidual;

        denominator +=
          x[rowIndex][
            featureIndex
          ] *
          x[rowIndex][
            featureIndex
          ];
      }

      numerator /=
        rowCount;

      denominator /=
        rowCount;

      weights[featureIndex] =
        softThreshold(
          numerator,
          l1Penalty
        ) /
        Math.max(
          denominator +
            l2Penalty,
          EPSILON
        );
    }

    steps.push(
      createStep(
        iteration + 1,
        intercept,
        weights,
        features,
        x,
        y,
        modelType,
        alpha,
        l1Ratio
      )
    );

    const maxChange =
      Math.max(
        ...weights.map(
          (
            weight,
            index
          ) =>
            Math.abs(
              weight -
                oldWeights[
                  index
                ]
            )
        )
      );

    if (
      maxChange <
      1e-7
    ) {
      break;
    }
  }

  return {
    modelType,
    features,
    target,
    alpha,
    l1Ratio,
    scalers,
    steps,
  };
}