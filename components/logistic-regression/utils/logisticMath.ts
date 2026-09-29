import {
  ClassificationMetrics,
  DatasetSplit,
  FeatureScaler,
  LogisticModel,
  LogisticPrediction,
  NumericRow,
  ROCPoint,
  TrainingSnapshot,
} from "../types/logisticRegression";

const EPSILON = 1e-12;

export function sigmoid(
  value: number
): number {
  if (value >= 0) {
    const exp =
      Math.exp(-value);

    return 1 / (1 + exp);
  }

  const exp =
    Math.exp(value);

  return exp / (1 + exp);
}

export function clampProbability(
  probability: number
): number {
  return Math.min(
    1 - EPSILON,
    Math.max(
      EPSILON,
      probability
    )
  );
}

export function mean(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

export function standardDeviation(
  values: number[]
): number {
  if (values.length === 0) {
    return 1;
  }

  const average =
    mean(values);

  const variance =
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          value - average,
          2
        ),
      0
    ) / values.length;

  const std =
    Math.sqrt(variance);

  return std < EPSILON
    ? 1
    : std;
}

export function splitDataset(
  rows: NumericRow[],
  trainRatio = 0.8
): DatasetSplit {
  if (rows.length <= 1) {
    return {
      trainRows: [...rows],
      testRows: [],
    };
  }

  const safeRatio =
    Math.min(
      0.95,
      Math.max(
        0.5,
        trainRatio
      )
    );

  /*
   * Deterministic shuffle so the
   * same dataset gives the same
   * educational result every time.
   */
  const shuffled =
    rows
      .map((row, index) => ({
        row,
        key:
          (
            index * 9301 +
            49297
          ) %
          233280,
      }))
      .sort(
        (a, b) =>
          a.key - b.key
      )
      .map(
        (item) =>
          item.row
      );

  const splitIndex =
    Math.max(
      1,
      Math.min(
        shuffled.length - 1,
        Math.floor(
          shuffled.length *
            safeRatio
        )
      )
    );

  return {
    trainRows:
      shuffled.slice(
        0,
        splitIndex
      ),

    testRows:
      shuffled.slice(
        splitIndex
      ),
  };
}

export function createFeatureScalers(
  rows: NumericRow[],
  features: string[]
): FeatureScaler[] {
  return features.map(
    (feature) => {
      const values =
        rows.map(
          (row) =>
            Number(
              row[feature]
            )
        );

      return {
        feature,

        mean:
          mean(values),

        std:
          standardDeviation(
            values
          ),
      };
    }
  );
}

export function standardizeValue(
  value: number,
  scaler: FeatureScaler
): number {
  return (
    (
      value -
      scaler.mean
    ) /
    scaler.std
  );
}

export function standardizeRow(
  row: NumericRow,
  scalers: FeatureScaler[]
): NumericRow {
  const transformed:
    NumericRow = {};

  for (
    const scaler of scalers
  ) {
    transformed[
      scaler.feature
    ] =
      standardizeValue(
        row[
          scaler.feature
        ],
        scaler
      );
  }

  return transformed;
}

export function linearScore(
  row: NumericRow,
  features: string[],
  intercept: number,
  coefficients:
    Record<string, number>
): number {
  let score =
    intercept;

  for (
    const feature of features
  ) {
    score +=
      (
        coefficients[
          feature
        ] ?? 0
      ) *
      (
        row[
          feature
        ] ?? 0
      );
  }

  return score;
}

export function predictProbability(
  row: NumericRow,
  features: string[],
  intercept: number,
  coefficients:
    Record<string, number>
): number {
  return sigmoid(
    linearScore(
      row,
      features,
      intercept,
      coefficients
    )
  );
}

export function binaryCrossEntropy(
  actual: number,
  probability: number
): number {
  const p =
    clampProbability(
      probability
    );

  return -(
    actual *
      Math.log(p) +
    (
      1 - actual
    ) *
      Math.log(1 - p)
  );
}

export function calculateLogLoss(
  predictions:
    LogisticPrediction[]
): number {
  if (
    predictions.length === 0
  ) {
    return 0;
  }

  return (
    predictions.reduce(
      (
        sum,
        prediction
      ) =>
        sum +
        binaryCrossEntropy(
          prediction.actual,
          prediction.probability
        ),
      0
    ) /
    predictions.length
  );
}

export function confusionMatrix(
  predictions:
    LogisticPrediction[]
) {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (
    const prediction
      of predictions
  ) {
    if (
      prediction.actual ===
        1 &&
      prediction.predicted ===
        1
    ) {
      tp++;
    } else if (
      prediction.actual ===
        0 &&
      prediction.predicted ===
        0
    ) {
      tn++;
    } else if (
      prediction.actual ===
        0 &&
      prediction.predicted ===
        1
    ) {
      fp++;
    } else if (
      prediction.actual ===
        1 &&
      prediction.predicted ===
        0
    ) {
      fn++;
    }
  }

  return {
    tp,
    tn,
    fp,
    fn,
  };
}

export function generateROC(
  predictions:
    LogisticPrediction[]
): ROCPoint[] {
  if (
    predictions.length === 0
  ) {
    return [];
  }

  const thresholds =
    Array.from(
      { length: 101 },
      (_, index) =>
        1 - index / 100
    );

  return thresholds.map(
    (threshold) => {
      let tp = 0;
      let tn = 0;
      let fp = 0;
      let fn = 0;

      for (
        const prediction
          of predictions
      ) {
        const predicted =
          prediction
            .probability >=
          threshold
            ? 1
            : 0;

        if (
          prediction.actual ===
            1 &&
          predicted === 1
        ) {
          tp++;
        } else if (
          prediction.actual ===
            0 &&
          predicted === 0
        ) {
          tn++;
        } else if (
          prediction.actual ===
            0 &&
          predicted === 1
        ) {
          fp++;
        } else if (
          prediction.actual ===
            1 &&
          predicted === 0
        ) {
          fn++;
        }
      }

      const tpr =
        tp + fn === 0
          ? 0
          : tp /
            (tp + fn);

      const fpr =
        fp + tn === 0
          ? 0
          : fp /
            (fp + tn);

      return {
        threshold,
        tpr,
        fpr,
      };
    }
  );
}

export function calculateAUC(
  rocPoints: ROCPoint[]
): number {
  if (
    rocPoints.length < 2
  ) {
    return 0;
  }

  const sorted =
    [...rocPoints].sort(
      (a, b) =>
        a.fpr - b.fpr
    );

  let area = 0;

  for (
    let index = 1;
    index < sorted.length;
    index++
  ) {
    const previous =
      sorted[index - 1];

    const current =
      sorted[index];

    const width =
      current.fpr -
      previous.fpr;

    const averageHeight =
      (
        current.tpr +
        previous.tpr
      ) /
      2;

    area +=
      width *
      averageHeight;
  }

  return Math.max(
    0,
    Math.min(1, area)
  );
}

export function calculateMetrics(
  predictions:
    LogisticPrediction[]
): ClassificationMetrics {
  const {
    tp,
    tn,
    fp,
    fn,
  } =
    confusionMatrix(
      predictions
    );

  const total =
    tp + tn + fp + fn;

  const accuracy =
    total === 0
      ? 0
      : (
          tp + tn
        ) /
        total;

  const precision =
    tp + fp === 0
      ? 0
      : tp /
        (tp + fp);

  const recall =
    tp + fn === 0
      ? 0
      : tp /
        (tp + fn);

  const specificity =
    tn + fp === 0
      ? 0
      : tn /
        (tn + fp);

  const f1 =
    precision + recall === 0
      ? 0
      : (
          2 *
          precision *
          recall
        ) /
        (
          precision +
          recall
        );

  const roc =
    generateROC(
      predictions
    );

  return {
    accuracy,
    precision,
    recall,
    specificity,
    f1,

    tp,
    tn,
    fp,
    fn,

    logLoss:
      calculateLogLoss(
        predictions
      ),

    auc:
      calculateAUC(roc),
  };
}

function createPredictions(
  rows: NumericRow[],
  features: string[],
  target: string,
  scalers: FeatureScaler[],
  intercept: number,
  coefficients:
    Record<string, number>,
  threshold: number
): LogisticPrediction[] {
  return rows.map(
    (row) => {
      const standardized =
        standardizeRow(
          row,
          scalers
        );

      const score =
        linearScore(
          standardized,
          features,
          intercept,
          coefficients
        );

      const probability =
        sigmoid(score);

      return {
        actual:
          Number(
            row[target]
          ),

        probability,

        predicted:
          probability >=
          threshold
            ? 1
            : 0,

        score,
      };
    }
  );
}

export interface TrainOptions {
  learningRate?: number;
  iterations?: number;
  threshold?: number;
  regularizationStrength?: number;
}

export interface TrainResult {
  model: LogisticModel;
  history:
    TrainingSnapshot[];
}

export function trainLogisticRegression(
  trainRows: NumericRow[],
  testRows: NumericRow[],
  features: string[],
  target: string,
  options: TrainOptions = {}
): TrainResult {
  const learningRate =
    options.learningRate ??
    0.08;

  const iterations =
    options.iterations ??
    350;

  const threshold =
    options.threshold ??
    0.5;

  const regularizationStrength =
    options
      .regularizationStrength ??
    0;

  if (
    trainRows.length === 0
  ) {
    throw new Error(
      "Training dataset is empty."
    );
  }

  if (
    features.length === 0
  ) {
    throw new Error(
      "Select at least one feature."
    );
  }

  const targetValues =
    trainRows.map(
      (row) =>
        Number(row[target])
    );

  const invalidTarget =
    targetValues.some(
      (value) =>
        value !== 0 &&
        value !== 1
    );

  if (invalidTarget) {
    throw new Error(
      "Logistic Regression currently requires a binary target encoded as 0 and 1."
    );
  }

  const scalers =
    createFeatureScalers(
      trainRows,
      features
    );

  const standardizedTrain =
    trainRows.map(
      (row) =>
        standardizeRow(
          row,
          scalers
        )
    );

  const coefficients:
    Record<string, number> =
      {};

  for (
    const feature of features
  ) {
    coefficients[
      feature
    ] = 0;
  }

  let intercept = 0;

  const history:
    TrainingSnapshot[] = [];

  const lossHistory:
    number[] = [];

  for (
    let iteration = 0;
    iteration < iterations;
    iteration++
  ) {
    let interceptGradient =
      0;

    const gradients:
      Record<string, number> =
        {};

    for (
      const feature
        of features
    ) {
      gradients[
        feature
      ] = 0;
    }

    let loss = 0;
    let correct = 0;

    for (
      let rowIndex = 0;
      rowIndex <
      standardizedTrain.length;
      rowIndex++
    ) {
      const row =
        standardizedTrain[
          rowIndex
        ];

      const actual =
        Number(
          trainRows[
            rowIndex
          ][target]
        );

      const score =
        linearScore(
          row,
          features,
          intercept,
          coefficients
        );

      const probability =
        sigmoid(score);

      const error =
        probability -
        actual;

      interceptGradient +=
        error;

      for (
        const feature
          of features
      ) {
        gradients[
          feature
        ] +=
          error *
          row[feature];
      }

      loss +=
        binaryCrossEntropy(
          actual,
          probability
        );

      const predicted =
        probability >=
        threshold
          ? 1
          : 0;

      if (
        predicted === actual
      ) {
        correct++;
      }
    }

    const sampleCount =
      standardizedTrain.length;

    intercept -=
      learningRate *
      (
        interceptGradient /
        sampleCount
      );

    for (
      const feature
        of features
    ) {
      const l2Gradient =
        regularizationStrength *
        coefficients[
          feature
        ];

      const gradient =
        gradients[
          feature
        ] /
          sampleCount +
        l2Gradient;

      coefficients[
        feature
      ] -=
        learningRate *
        gradient;
    }

    let l2Penalty = 0;

    for (
      const feature
        of features
    ) {
      l2Penalty +=
        coefficients[
          feature
        ] *
        coefficients[
          feature
        ];
    }

    l2Penalty *=
      regularizationStrength /
      2;

    const averageLoss =
      loss /
        sampleCount +
      l2Penalty;

    lossHistory.push(
      averageLoss
    );

    history.push({
      iteration:
        iteration + 1,

      intercept,

      coefficients: {
        ...coefficients,
      },

      loss:
        averageLoss,

      accuracy:
        correct /
        sampleCount,
    });
  }

  const trainPredictions =
    createPredictions(
      trainRows,
      features,
      target,
      scalers,
      intercept,
      coefficients,
      threshold
    );

  const testPredictions =
    createPredictions(
      testRows,
      features,
      target,
      scalers,
      intercept,
      coefficients,
      threshold
    );

  const model:
    LogisticModel = {
      features:
        [...features],

      target,

      intercept,

      coefficients: {
        ...coefficients,
      },

      scalers,

      threshold,

      trainPredictions,

      testPredictions,

      trainMetrics:
        calculateMetrics(
          trainPredictions
        ),

      testMetrics:
        calculateMetrics(
          testPredictions
        ),

      iterations,

      learningRate,

      regularizationStrength,

      lossHistory,
    };

  return {
    model,
    history,
  };
}

export function applyThreshold(
  predictions:
    LogisticPrediction[],
  threshold: number
): LogisticPrediction[] {
  return predictions.map(
    (prediction) => ({
      ...prediction,

      predicted:
        prediction
          .probability >=
        threshold
          ? 1
          : 0,
    })
  );
}

export function predictNewRow(
  row: NumericRow,
  model: LogisticModel,
  threshold =
    model.threshold
) {
  const standardized =
    standardizeRow(
      row,
      model.scalers
    );

  const score =
    linearScore(
      standardized,
      model.features,
      model.intercept,
      model.coefficients
    );

  const probability =
    sigmoid(score);

  return {
    score,

    probability,

    predicted:
      probability >=
      threshold
        ? 1
        : 0,
  };
}

export function oddsFromProbability(
  probability: number
): number {
  const p =
    clampProbability(
      probability
    );

  return p / (1 - p);
}

export function logOddsFromProbability(
  probability: number
): number {
  return Math.log(
    oddsFromProbability(
      probability
    )
  );
}

export function coefficientOddsRatio(
  coefficient: number
): number {
  return Math.exp(
    coefficient
  );
}