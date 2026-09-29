import type {
  ClassLabel,
  ClassParameters,
  ClassProbability,
  ClassROC,
  DatasetSplit,
  FeatureScaler,
  MulticlassMetrics,
  MulticlassModel,
  MulticlassPrediction,
  MulticlassROCPoint,
  MulticlassRow,
  NumericRow,
  PerClassMetrics,
  TrainingOptions,
  TrainingResult,
  TrainingSnapshot,
} from "../types/multiclassLogisticRegression";

/* =========================================
   BASIC HELPERS
========================================= */

export function safeNumber(
  value: number,
  fallback = 0
) {
  return Number.isFinite(value)
    ? value
    : fallback;
}

export function mean(
  values: number[]
) {
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
) {
  if (values.length === 0) {
    return 1;
  }

  const avg =
    mean(values);

  const variance =
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          value - avg,
          2
        ),
      0
    ) / values.length;

  const result =
    Math.sqrt(variance);

  /*
   * Constant features have std = 0.
   * Use 1 to avoid division by zero.
   */
  return result > 1e-12
    ? result
    : 1;
}

/* =========================================
   CLASS HELPERS
========================================= */

export function getClasses(
  rows: MulticlassRow[]
): ClassLabel[] {
  const result:
    ClassLabel[] = [];

  rows.forEach((row) => {
    const exists =
      result.some(
        (classLabel) =>
          String(classLabel) ===
          String(row.target)
      );

    if (!exists) {
      result.push(
        row.target
      );
    }
  });

  return result;
}

/* =========================================
   TRAIN / TEST SPLIT
========================================= */

export function splitDataset(
  rows: MulticlassRow[],
  trainRatio = 0.8
): DatasetSplit {
  if (rows.length < 2) {
    return {
      trainRows: [...rows],
      testRows: [],
    };
  }

  const safeRatio = Math.min(
    0.95,
    Math.max(0.5, trainRatio)
  );

  const classes = getClasses(rows);

  const trainRows: MulticlassRow[] = [];
  const testRows: MulticlassRow[] = [];

  classes.forEach((classLabel) => {
    const classRows = rows.filter(
      (row) =>
        String(row.target) ===
        String(classLabel)
    );

    let trainCount = Math.floor(
      classRows.length * safeRatio
    );

    // If a class has at least 2 rows,
    // keep at least one in training
    // and one in testing.
    if (classRows.length >= 2) {
      trainCount = Math.max(
        1,
        Math.min(
          classRows.length - 1,
          trainCount
        )
      );
    }

    trainRows.push(
      ...classRows.slice(
        0,
        trainCount
      )
    );

    testRows.push(
      ...classRows.slice(
        trainCount
      )
    );
  });

  return {
    trainRows,
    testRows,
  };
}
/* =========================================
   FEATURE SCALING
========================================= */

export function createScalers(
  rows: MulticlassRow[],
  features: string[]
): FeatureScaler[] {
  return features.map(
    (feature) => {
      const values =
        rows
          .map(
            (row) =>
              row.features[
                feature
              ]
          )
          .filter(
            (value) =>
              Number.isFinite(
                value
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

export function standardizeFeatures(
  features: NumericRow,
  scalers: FeatureScaler[]
): NumericRow {
  const result:
    NumericRow = {};

  scalers.forEach(
    (scaler) => {
      const rawValue =
        safeNumber(
          features[
            scaler.feature
          ],
          scaler.mean
        );

      result[
        scaler.feature
      ] =
        (rawValue -
          scaler.mean) /
        scaler.std;
    }
  );

  return result;
}

/* =========================================
   LINEAR SCORE / LOGIT
========================================= */

export function linearScore(
  features: NumericRow,
  parameters: ClassParameters
) {
  let score =
    parameters.intercept;

  Object.entries(
    parameters.coefficients
  ).forEach(
    ([
      feature,
      coefficient,
    ]) => {
      score +=
        coefficient *
        safeNumber(
          features[
            feature
          ]
        );
    }
  );

  return score;
}

/* =========================================
   SOFTMAX
========================================= */

export function softmax(
  logits: number[]
): number[] {
  if (
    logits.length === 0
  ) {
    return [];
  }

  /*
   * Numerical stability:
   *
   * exp(z - max(z))
   *
   * gives the same Softmax
   * probabilities while preventing
   * huge exponentials.
   */
  const maxLogit =
    Math.max(
      ...logits
    );

  const exponentials =
    logits.map(
      (logit) =>
        Math.exp(
          logit -
            maxLogit
        )
    );

  const denominator =
    exponentials.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  if (
    denominator <= 0 ||
    !Number.isFinite(
      denominator
    )
  ) {
    return logits.map(
      () =>
        1 /
        logits.length
    );
  }

  return exponentials.map(
    (value) =>
      value /
      denominator
  );
}

/* =========================================
   PREDICT PROBABILITIES
========================================= */

export function predictProbabilities(
  standardizedFeatures:
    NumericRow,
  classParameters:
    ClassParameters[]
): ClassProbability[] {
  const logits =
    classParameters.map(
      (parameters) =>
        linearScore(
          standardizedFeatures,
          parameters
        )
    );

  const probabilities =
    softmax(logits);

  return classParameters.map(
    (
      parameters,
      index
    ) => ({
      classLabel:
        parameters.classLabel,

      probability:
        probabilities[
          index
        ],
    })
  );
}

/* =========================================
   ARGMAX
========================================= */

export function argmaxClass(
  probabilities:
    ClassProbability[]
): ClassLabel {
  if (
    probabilities.length ===
    0
  ) {
    return "";
  }

  let best =
    probabilities[0];

  for (
    let index = 1;
    index <
    probabilities.length;
    index++
  ) {
    if (
      probabilities[index]
        .probability >
      best.probability
    ) {
      best =
        probabilities[
          index
        ];
    }
  }

  return best.classLabel;
}

/* =========================================
   ONE ROW PREDICTION
========================================= */

export function predictRow(
  row: MulticlassRow,
  scalers: FeatureScaler[],
  classParameters:
    ClassParameters[]
): MulticlassPrediction {
  const standardized =
    standardizeFeatures(
      row.features,
      scalers
    );

  const logits =
    classParameters.map(
      (parameters) => ({
        classLabel:
          parameters.classLabel,

        score:
          linearScore(
            standardized,
            parameters
          ),
      })
    );

  const probabilities =
    softmax(
      logits.map(
        (item) =>
          item.score
      )
    );

  const classProbabilities:
    ClassProbability[] =
      logits.map(
        (
          item,
          index
        ) => ({
          classLabel:
            item.classLabel,

          probability:
            probabilities[
              index
            ],
        })
      );

  return {
    actual:
      row.target,

    predicted:
      argmaxClass(
        classProbabilities
      ),

    probabilities:
      classProbabilities,

    logits,
  };
}

/* =========================================
   MULTICLASS CROSS ENTROPY
========================================= */

export function multiclassCrossEntropy(
  predictions:
    MulticlassPrediction[]
) {
  if (
    predictions.length ===
    0
  ) {
    return 0;
  }

  const epsilon =
    1e-15;

  let totalLoss = 0;

  predictions.forEach(
    (prediction) => {
      const correctClass =
        prediction.probabilities.find(
          (item) =>
            String(
              item.classLabel
            ) ===
            String(
              prediction.actual
            )
        );

      const probability =
        correctClass
          ? correctClass.probability
          : epsilon;

      const clipped =
        Math.min(
          1 - epsilon,
          Math.max(
            epsilon,
            probability
          )
        );

      totalLoss +=
        -Math.log(
          clipped
        );
    }
  );

  return (
    totalLoss /
    predictions.length
  );
}

/* =========================================
   ACCURACY
========================================= */

export function calculateAccuracy(
  predictions:
    MulticlassPrediction[]
) {
  if (
    predictions.length ===
    0
  ) {
    return 0;
  }

  const correct =
    predictions.filter(
      (prediction) =>
        String(
          prediction.actual
        ) ===
        String(
          prediction.predicted
        )
    ).length;

  return (
    correct /
    predictions.length
  );
}

/* =========================================
   CREATE PREDICTIONS
========================================= */

function createPredictions(
  rows: MulticlassRow[],
  scalers: FeatureScaler[],
  classParameters:
    ClassParameters[]
) {
  return rows.map(
    (row) =>
      predictRow(
        row,
        scalers,
        classParameters
      )
  );
}

/* =========================================
   INITIAL PARAMETERS
========================================= */

function createInitialParameters(
  classes: ClassLabel[],
  features: string[]
): ClassParameters[] {
  return classes.map(
    (classLabel) => ({
      classLabel,

      intercept: 0,

      coefficients:
        Object.fromEntries(
          features.map(
            (feature) => [
              feature,
              0,
            ]
          )
        ),
    })
  );
}

/* =========================================
   COPY PARAMETERS
========================================= */

function cloneParameters(
  parameters:
    ClassParameters[]
): ClassParameters[] {
  return parameters.map(
    (item) => ({
      classLabel:
        item.classLabel,

      intercept:
        item.intercept,

      coefficients: {
        ...item.coefficients,
      },
    })
  );
}

/* =========================================
   MULTINOMIAL LOGISTIC REGRESSION
   TRAINING
========================================= */

export function trainMulticlassLogisticRegression(
  trainRows:
    MulticlassRow[],
  testRows:
    MulticlassRow[],
  features: string[],
  target: string,
  options: TrainingOptions
): TrainingResult {
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

  const classes =
    getClasses(trainRows);

  if (
    classes.length < 3
  ) {
    throw new Error(
      "Multiclass Logistic Regression requires at least 3 target classes."
    );
  }

  const learningRate =
    Math.max(
      0.000001,
      options.learningRate
    );

  const iterations =
    Math.max(
      1,
      Math.floor(
        options.iterations
      )
    );

  const lambda =
    Math.max(
      0,
      options.regularizationStrength ??
        0
    );

  const scalers =
    createScalers(
      trainRows,
      features
    );

  const standardizedTrain =
    trainRows.map(
      (row) => ({
        original: row,

        standardized:
          standardizeFeatures(
            row.features,
            scalers
          ),
      })
    );

  let parameters =
    createInitialParameters(
      classes,
      features
    );

  const history:
    TrainingSnapshot[] = [];

  for (
    let iteration = 1;
    iteration <=
    iterations;
    iteration++
  ) {
    /*
     * Gradient containers.
     */
    const interceptGradients =
      classes.map(
        () => 0
      );

    const coefficientGradients =
      classes.map(
        () =>
          Object.fromEntries(
            features.map(
              (feature) => [
                feature,
                0,
              ]
            )
          ) as NumericRow
      );

    /*
     * Calculate gradient for
     * every training sample.
     */
    standardizedTrain.forEach(
      ({
        original,
        standardized,
      }) => {
        const logits =
          parameters.map(
            (
              classParameters
            ) =>
              linearScore(
                standardized,
                classParameters
              )
          );

        const probabilities =
          softmax(logits);

        classes.forEach(
          (
            classLabel,
            classIndex
          ) => {
            const actual =
              String(
                original.target
              ) ===
              String(
                classLabel
              )
                ? 1
                : 0;

            const error =
              probabilities[
                classIndex
              ] - actual;

            interceptGradients[
              classIndex
            ] += error;

            features.forEach(
              (feature) => {
                coefficientGradients[
                  classIndex
                ][feature] +=
                  error *
                  standardized[
                    feature
                  ];
              }
            );
          }
        );
      }
    );

    /*
     * Gradient-descent update.
     */
    parameters =
      parameters.map(
        (
          classParameters,
          classIndex
        ) => {
          const newCoefficients:
            NumericRow = {};

          features.forEach(
            (feature) => {
              const oldCoefficient =
                classParameters
                  .coefficients[
                  feature
                ];

              const gradient =
                coefficientGradients[
                  classIndex
                ][feature] /
                  trainRows.length +
                lambda *
                  oldCoefficient;

              newCoefficients[
                feature
              ] =
                oldCoefficient -
                learningRate *
                  gradient;
            }
          );

          return {
            classLabel:
              classParameters.classLabel,

            /*
             * Do not regularize
             * the intercept.
             */
            intercept:
              classParameters.intercept -
              learningRate *
                (interceptGradients[
                  classIndex
                ] /
                  trainRows.length),

            coefficients:
              newCoefficients,
          };
        }
      );

    /*
     * Save real training state
     * after every iteration.
     *
     * This will later power the
     * Play/Pause visualization.
     */
    const currentPredictions =
      createPredictions(
        trainRows,
        scalers,
        parameters
      );

    const currentLoss =
      multiclassCrossEntropy(
        currentPredictions
      );

    const currentAccuracy =
      calculateAccuracy(
        currentPredictions
      );

    history.push({
      iteration,

      classParameters:
        cloneParameters(
          parameters
        ),

      loss:
        currentLoss,

      accuracy:
        currentAccuracy,
    });
  }

  const trainPredictions =
    createPredictions(
      trainRows,
      scalers,
      parameters
    );

  const testPredictions =
    createPredictions(
      testRows,
      scalers,
      parameters
    );

  const trainLoss =
    multiclassCrossEntropy(
      trainPredictions
    );

  const testLoss =
    multiclassCrossEntropy(
      testPredictions
    );

  const trainAccuracy =
    calculateAccuracy(
      trainPredictions
    );

  const testAccuracy =
    calculateAccuracy(
      testPredictions
    );

  const model:
    MulticlassModel = {
      features,
      target,
      classes,
      scalers,

      classParameters:
        cloneParameters(
          parameters
        ),

      trainPredictions,
      testPredictions,

      trainLoss,
      testLoss,

      trainAccuracy,
      testAccuracy,
    };

  return {
    model,
    history,
  };
}

/* =========================================
   CONFUSION MATRIX
========================================= */

export function createConfusionMatrix(
  predictions:
    MulticlassPrediction[],
  classes: ClassLabel[]
) {
  const matrix =
    classes.map(
      () =>
        classes.map(
          () => 0
        )
    );

  predictions.forEach(
    (prediction) => {
      const actualIndex =
        classes.findIndex(
          (classLabel) =>
            String(
              classLabel
            ) ===
            String(
              prediction.actual
            )
        );

      const predictedIndex =
        classes.findIndex(
          (classLabel) =>
            String(
              classLabel
            ) ===
            String(
              prediction.predicted
            )
        );

      if (
        actualIndex >= 0 &&
        predictedIndex >= 0
      ) {
        matrix[
          actualIndex
        ][
          predictedIndex
        ]++;
      }
    }
  );

  return {
    classes,
    matrix,
  };
}

/* =========================================
   PER-CLASS METRICS
========================================= */

export function calculateMulticlassMetrics(
  predictions:
    MulticlassPrediction[],
  classes: ClassLabel[]
): MulticlassMetrics {
  const total =
    predictions.length;

  if (total === 0) {
    return {
      accuracy: 0,

      macroPrecision: 0,
      macroRecall: 0,
      macroF1: 0,

      weightedPrecision: 0,
      weightedRecall: 0,
      weightedF1: 0,

      perClass: [],
    };
  }

  const perClass:
    PerClassMetrics[] =
      classes.map(
        (classLabel) => {
          let truePositive = 0;
          let falsePositive = 0;
          let falseNegative = 0;
          let trueNegative = 0;

          predictions.forEach(
            (prediction) => {
              const actualIsClass =
                String(
                  prediction.actual
                ) ===
                String(
                  classLabel
                );

              const predictedIsClass =
                String(
                  prediction.predicted
                ) ===
                String(
                  classLabel
                );

              if (
                actualIsClass &&
                predictedIsClass
              ) {
                truePositive++;
              } else if (
                !actualIsClass &&
                predictedIsClass
              ) {
                falsePositive++;
              } else if (
                actualIsClass &&
                !predictedIsClass
              ) {
                falseNegative++;
              } else {
                trueNegative++;
              }
            }
          );

          const precision =
            truePositive +
              falsePositive >
            0
              ? truePositive /
                (truePositive +
                  falsePositive)
              : 0;

          const recall =
            truePositive +
              falseNegative >
            0
              ? truePositive /
                (truePositive +
                  falseNegative)
              : 0;

          const f1 =
            precision +
              recall >
            0
              ? (2 *
                  precision *
                  recall) /
                (precision +
                  recall)
              : 0;

          const specificity =
            trueNegative +
              falsePositive >
            0
              ? trueNegative /
                (trueNegative +
                  falsePositive)
              : 0;

          const support =
            truePositive +
            falseNegative;

          return {
            classLabel,

            truePositive,
            falsePositive,
            falseNegative,
            trueNegative,

            precision,
            recall,
            f1,
            specificity,

            support,
          };
        }
      );

  const accuracy =
    calculateAccuracy(
      predictions
    );

  const macroPrecision =
    mean(
      perClass.map(
        (item) =>
          item.precision
      )
    );

  const macroRecall =
    mean(
      perClass.map(
        (item) =>
          item.recall
      )
    );

  const macroF1 =
    mean(
      perClass.map(
        (item) =>
          item.f1
      )
    );

  const weightedPrecision =
    perClass.reduce(
      (sum, item) =>
        sum +
        item.precision *
          item.support,
      0
    ) / total;

  const weightedRecall =
    perClass.reduce(
      (sum, item) =>
        sum +
        item.recall *
          item.support,
      0
    ) / total;

  const weightedF1 =
    perClass.reduce(
      (sum, item) =>
        sum +
        item.f1 *
          item.support,
      0
    ) / total;

  return {
    accuracy,

    macroPrecision,
    macroRecall,
    macroF1,

    weightedPrecision,
    weightedRecall,
    weightedF1,

    perClass,
  };
}


/* =========================================
   ONE-VS-REST ROC
========================================= */

export function generateOneVsRestROC(
  predictions: MulticlassPrediction[],
  classLabel: ClassLabel
): MulticlassROCPoint[] {
  if (predictions.length === 0) {
    return [];
  }

  const scoredSamples = predictions.map(
    (prediction) => {
      const probability =
        prediction.probabilities.find(
          (item) =>
            String(item.classLabel) ===
            String(classLabel)
        )?.probability ?? 0;

      return {
        probability:
          Number.isFinite(probability)
            ? probability
            : 0,

        positive:
          String(prediction.actual) ===
          String(classLabel),
      };
    }
  );

  const positiveCount =
    scoredSamples.filter(
      (sample) => sample.positive
    ).length;

  const negativeCount =
    scoredSamples.length -
    positiveCount;

  if (
    positiveCount === 0 ||
    negativeCount === 0
  ) {
    return [];
  }

  const uniqueScores = Array.from(
    new Set(
      scoredSamples.map(
        (sample) =>
          sample.probability
      )
    )
  ).sort((a, b) => b - a);

  const thresholds = [
    Number.POSITIVE_INFINITY,
    ...uniqueScores,
    Number.NEGATIVE_INFINITY,
  ];

  const points: MulticlassROCPoint[] =
    thresholds.map((threshold) => {
      let truePositive = 0;
      let falsePositive = 0;
      let trueNegative = 0;
      let falseNegative = 0;

      scoredSamples.forEach(
        (sample) => {
          const predictedPositive =
            sample.probability >=
            threshold;

          if (
            sample.positive &&
            predictedPositive
          ) {
            truePositive++;
          } else if (
            !sample.positive &&
            predictedPositive
          ) {
            falsePositive++;
          } else if (
            sample.positive &&
            !predictedPositive
          ) {
            falseNegative++;
          } else {
            trueNegative++;
          }
        }
      );

      const tpr =
        truePositive +
          falseNegative >
        0
          ? truePositive /
            (truePositive +
              falseNegative)
          : 0;

      const fpr =
        falsePositive +
          trueNegative >
        0
          ? falsePositive /
            (falsePositive +
              trueNegative)
          : 0;

      return {
        threshold,
        fpr,
        tpr,
      };
    });

  const uniquePoints:
    MulticlassROCPoint[] = [];

  points.forEach((point) => {
    const exists =
      uniquePoints.some(
        (existing) =>
          Math.abs(
            existing.fpr -
              point.fpr
          ) < 1e-12 &&
          Math.abs(
            existing.tpr -
              point.tpr
          ) < 1e-12
      );

    if (!exists) {
      uniquePoints.push(point);
    }
  });

  return uniquePoints;
}


/* =========================================
   AUC
========================================= */

export function calculateAUC(
  points: MulticlassROCPoint[]
) {
  if (points.length < 2) {
    return 0;
  }

  const sorted = [...points].sort(
    (a, b) => {
      if (
        Math.abs(
          a.fpr - b.fpr
        ) > 1e-12
      ) {
        return a.fpr - b.fpr;
      }

      return a.tpr - b.tpr;
    }
  );

  let auc = 0;

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
      (previous.tpr +
        current.tpr) /
      2;

    auc +=
      width *
      averageHeight;
  }

  if (!Number.isFinite(auc)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, auc)
  );
}


/* =========================================
   ALL CLASS ROC
========================================= */

export function generateAllClassROC(
  predictions: MulticlassPrediction[],
  classes: ClassLabel[]
): ClassROC[] {
  return classes.map(
    (classLabel) => {
      const points =
        generateOneVsRestROC(
          predictions,
          classLabel
        );

      return {
        classLabel,
        points,
        auc:
          calculateAUC(
            points
          ),
      };
    }
  );
}
/* =========================================
   PREDICT NEW USER INPUT
========================================= */

export function predictNewSample(
  values: NumericRow,
  model: MulticlassModel
) {
  const standardized =
    standardizeFeatures(
      values,
      model.scalers
    );

  const logits =
    model.classParameters.map(
      (parameters) => ({
        classLabel:
          parameters.classLabel,

        score:
          linearScore(
            standardized,
            parameters
          ),
      })
    );

  const probabilities =
    softmax(
      logits.map(
        (item) =>
          item.score
      )
    );

  const classProbabilities =
    logits.map(
      (
        item,
        index
      ) => ({
        classLabel:
          item.classLabel,

        probability:
          probabilities[
            index
          ],
      })
    );

  return {
    logits,

    probabilities:
      classProbabilities,

    predicted:
      argmaxClass(
        classProbabilities
      ),
  };
}