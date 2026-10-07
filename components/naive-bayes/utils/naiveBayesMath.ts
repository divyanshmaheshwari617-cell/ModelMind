import type {
  BernoulliNBModel,
  ClassificationMetrics,
  ClassPredictionScore,
  ClassPrior,
  DatasetSplit,
  GaussianNBModel,
  MultinomialNBModel,
  NaiveBayesPrediction,
  NBRow,
  NumericSummary,
} from "../types/naiveBayes";

/*
|--------------------------------------------------------------------------
| BASIC MATH HELPERS
|--------------------------------------------------------------------------
*/

const EPSILON = 1e-9;

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

export function variance(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  const avg = mean(values);

  return (
    values.reduce(
      (sum, value) => {
        const difference =
          value - avg;

        return (
          sum +
          difference *
            difference
        );
      },
      0
    ) / values.length
  );
}

export function standardDeviation(
  values: number[]
): number {
  return Math.sqrt(
    variance(values)
  );
}

export function numericSummary(
  values: number[]
): NumericSummary {
  const calculatedMean =
    mean(values);

  const calculatedVariance =
    variance(values);

  return {
    mean: calculatedMean,

    variance:
      calculatedVariance,

    stdDev: Math.sqrt(
      calculatedVariance
    ),
  };
}

/*
|--------------------------------------------------------------------------
| DATA HELPERS
|--------------------------------------------------------------------------
*/

export function getClassLabels(
  rows: NBRow[]
): string[] {
  return Array.from(
    new Set(
      rows.map(
        (row) => row.target
      )
    )
  );
}

export function getClassRows(
  rows: NBRow[],
  classLabel: string
): NBRow[] {
  return rows.filter(
    (row) =>
      row.target === classLabel
  );
}

export function getNumericValue(
  row: NBRow,
  feature: string
): number | null {
  const value =
    row.features[feature];

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| CLASS PRIORS
|--------------------------------------------------------------------------
|
| P(Class)
|
| Example:
|
| 6 Pass students
| 4 Fail students
|
| P(Pass) = 6 / 10
| P(Fail) = 4 / 10
|
*/

export function calculateClassPriors(
  rows: NBRow[]
): ClassPrior[] {
  if (rows.length === 0) {
    return [];
  }

  const classes =
    getClassLabels(rows);

  return classes.map(
    (classLabel) => {
      const count =
        rows.filter(
          (row) =>
            row.target ===
            classLabel
        ).length;

      return {
        classLabel,
        count,

        probability:
          count /
          rows.length,
      };
    }
  );
}

/*
|--------------------------------------------------------------------------
| CONDITIONAL PROBABILITY
|--------------------------------------------------------------------------
|
| P(A | B)
|
| Used for educational probability visualizations.
|
*/

export function conditionalProbability(
  jointCount: number,
  conditionCount: number
): number {
  if (
    conditionCount === 0
  ) {
    return 0;
  }

  return (
    jointCount /
    conditionCount
  );
}

/*
|--------------------------------------------------------------------------
| BAYES THEOREM
|--------------------------------------------------------------------------
|
| P(A | B)
|
|       P(B | A) × P(A)
| = -------------------------
|             P(B)
|
*/

export function bayesTheorem(
  prior: number,
  likelihood: number,
  evidence: number
): number {
  if (evidence === 0) {
    return 0;
  }

  return (
    likelihood *
    prior /
    evidence
  );
}

/*
|--------------------------------------------------------------------------
| GAUSSIAN PROBABILITY DENSITY
|--------------------------------------------------------------------------
|
| Used by Gaussian Naive Bayes.
|
|              1
| P(x|C) = ------------ ×
|          sqrt(2πσ²)
|
|          exp(
|            -(x-μ)²
|            --------
|              2σ²
|          )
|
*/

export function gaussianPDF(
  value: number,
  meanValue: number,
  varianceValue: number
): number {
  const safeVariance =
    Math.max(
      varianceValue,
      EPSILON
    );

  const coefficient =
    1 /
    Math.sqrt(
      2 *
        Math.PI *
        safeVariance
    );

  const exponent =
    Math.exp(
      -Math.pow(
        value -
          meanValue,
        2
      ) /
        (2 *
          safeVariance)
    );

  return (
    coefficient *
    exponent
  );
}

/*
|--------------------------------------------------------------------------
| GAUSSIAN NAIVE BAYES TRAINING
|--------------------------------------------------------------------------
*/

export function trainGaussianNB(
  rows: NBRow[],
  features: string[]
): GaussianNBModel {
  const classes =
    getClassLabels(rows);

  const priorArray =
    calculateClassPriors(
      rows
    );

  const priors: Record<
    string,
    number
  > = {};

  priorArray.forEach(
    (item) => {
      priors[
        item.classLabel
      ] =
        item.probability;
    }
  );

  const statistics: GaussianNBModel["statistics"] =
    {};

  classes.forEach(
    (classLabel) => {
      statistics[
        classLabel
      ] = {};

      const classRows =
        getClassRows(
          rows,
          classLabel
        );

      features.forEach(
        (feature) => {
          const values =
            classRows
              .map((row) =>
                getNumericValue(
                  row,
                  feature
                )
              )
              .filter(
                (
                  value
                ): value is number =>
                  value !==
                  null
              );

          statistics[
            classLabel
          ][feature] =
            numericSummary(
              values
            );
        }
      );
    }
  );

  return {
    variant:
      "gaussian",

    classes,
    features,
    priors,
    statistics,
  };
}

/*
|--------------------------------------------------------------------------
| GAUSSIAN NAIVE BAYES PREDICTION
|--------------------------------------------------------------------------
|
| Instead of multiplying tiny probabilities directly,
| we use logarithms:
|
| log P(C)
| +
| Σ log P(x_i | C)
|
| This avoids numerical underflow.
|
*/

export function predictGaussianNB(
  model: GaussianNBModel,
  featureValues: Record<
    string,
    number
  >
): NaiveBayesPrediction {
  const rawScores: {
    classLabel: string;
    logScore: number;
    likelihoods: {
      feature: string;
      value: number;
      classLabel: string;
      likelihood: number;
    }[];
  }[] = [];

  model.classes.forEach(
    (classLabel) => {
      const prior =
        Math.max(
          model.priors[
            classLabel
          ] ?? 0,
          EPSILON
        );

      const logPrior =
        Math.log(prior);

      let logLikelihood =
        0;

      const likelihoods =
        model.features.map(
          (feature) => {
            const value =
              featureValues[
                feature
              ];

            const stats =
              model.statistics[
                classLabel
              ][feature];

            const likelihood =
              gaussianPDF(
                value,
                stats.mean,
                stats.variance
              );

            const safeLikelihood =
              Math.max(
                likelihood,
                EPSILON
              );

            logLikelihood +=
              Math.log(
                safeLikelihood
              );

            return {
              feature,
              value,
              classLabel,
              likelihood,
            };
          }
        );

      rawScores.push({
        classLabel,

        logScore:
          logPrior +
          logLikelihood,

        likelihoods,
      });
    }
  );

  return buildPrediction(
    rawScores,
    model.priors
  );
}

/*
|--------------------------------------------------------------------------
| MULTINOMIAL NAIVE BAYES TRAINING
|--------------------------------------------------------------------------
|
| Best suited for count/frequency features.
|
| Example:
|
| word counts:
|
| free = 3
| offer = 2
| meeting = 0
|
| Laplace smoothing:
|
| count + alpha
| -----------------------------
| total count + alpha × features
|
*/

export function trainMultinomialNB(
  rows: NBRow[],
  features: string[],
  alpha = 1
): MultinomialNBModel {
  const classes =
    getClassLabels(rows);

  const priors: Record<
    string,
    number
  > = {};

  calculateClassPriors(
    rows
  ).forEach((item) => {
    priors[
      item.classLabel
    ] =
      item.probability;
  });

  const featureCounts: Record<
    string,
    Record<string, number>
  > = {};

  const classFeatureTotals: Record<
    string,
    number
  > = {};

  classes.forEach(
    (classLabel) => {
      featureCounts[
        classLabel
      ] = {};

      let total = 0;

      const classRows =
        getClassRows(
          rows,
          classLabel
        );

      features.forEach(
        (feature) => {
          const featureTotal =
            classRows.reduce(
              (
                sum,
                row
              ) => {
                const value =
                  getNumericValue(
                    row,
                    feature
                  ) ?? 0;

                return (
                  sum +
                  Math.max(
                    0,
                    value
                  )
                );
              },
              0
            );

          featureCounts[
            classLabel
          ][feature] =
            featureTotal;

          total +=
            featureTotal;
        }
      );

      classFeatureTotals[
        classLabel
      ] = total;
    }
  );

  return {
    variant:
      "multinomial",

    classes,
    features,
    priors,
    featureCounts,
    classFeatureTotals,
    alpha,
  };
}

/*
|--------------------------------------------------------------------------
| MULTINOMIAL NAIVE BAYES PREDICTION
|--------------------------------------------------------------------------
*/

export function predictMultinomialNB(
  model: MultinomialNBModel,
  featureValues: Record<
    string,
    number
  >
): NaiveBayesPrediction {
  const rawScores: {
    classLabel: string;
    logScore: number;
    likelihoods: {
      feature: string;
      value: number;
      classLabel: string;
      likelihood: number;
    }[];
  }[] = [];

  model.classes.forEach(
    (classLabel) => {
      const prior =
        Math.max(
          model.priors[
            classLabel
          ] ?? 0,
          EPSILON
        );

      const logPrior =
        Math.log(prior);

      let logLikelihood =
        0;

      const total =
        model.classFeatureTotals[
          classLabel
        ];

      const denominator =
        total +
        model.alpha *
          model.features
            .length;

      const likelihoods =
        model.features.map(
          (feature) => {
            const value =
              Math.max(
                0,
                featureValues[
                  feature
                ] ?? 0
              );

            const count =
              model.featureCounts[
                classLabel
              ][feature] ?? 0;

            const likelihood =
              (count +
                model.alpha) /
              Math.max(
                denominator,
                EPSILON
              );

            logLikelihood +=
              value *
              Math.log(
                Math.max(
                  likelihood,
                  EPSILON
                )
              );

            return {
              feature,
              value,
              classLabel,
              likelihood,
            };
          }
        );

      rawScores.push({
        classLabel,

        logScore:
          logPrior +
          logLikelihood,

        likelihoods,
      });
    }
  );

  return buildPrediction(
    rawScores,
    model.priors
  );
}

/*
|--------------------------------------------------------------------------
| BERNOULLI NAIVE BAYES TRAINING
|--------------------------------------------------------------------------
|
| Each feature is treated as:
|
| 1 = present / yes
| 0 = absent / no
|
| Example:
|
| Contains "free" = 1
| Contains "meeting" = 0
|
*/

export function trainBernoulliNB(
  rows: NBRow[],
  features: string[],
  alpha = 1
): BernoulliNBModel {
  const classes =
    getClassLabels(rows);

  const priors: Record<
    string,
    number
  > = {};

  calculateClassPriors(
    rows
  ).forEach((item) => {
    priors[
      item.classLabel
    ] =
      item.probability;
  });

  const featureProbabilities: Record<
    string,
    Record<string, number>
  > = {};

  classes.forEach(
    (classLabel) => {
      featureProbabilities[
        classLabel
      ] = {};

      const classRows =
        getClassRows(
          rows,
          classLabel
        );

      features.forEach(
        (feature) => {
          const presentCount =
            classRows.filter(
              (row) => {
                const value =
                  getNumericValue(
                    row,
                    feature
                  ) ?? 0;

                return (
                  value > 0
                );
              }
            ).length;

          const probability =
            (presentCount +
              alpha) /
            (classRows.length +
              2 * alpha);

          featureProbabilities[
            classLabel
          ][feature] =
            probability;
        }
      );
    }
  );

  return {
    variant:
      "bernoulli",

    classes,
    features,
    priors,
    featureProbabilities,
    alpha,
  };
}

/*
|--------------------------------------------------------------------------
| BERNOULLI NAIVE BAYES PREDICTION
|--------------------------------------------------------------------------
|
| For each feature:
|
| if x = 1:
|     P(feature | class)
|
| if x = 0:
|     1 - P(feature | class)
|
*/

export function predictBernoulliNB(
  model: BernoulliNBModel,
  featureValues: Record<
    string,
    number
  >
): NaiveBayesPrediction {
  const rawScores: {
    classLabel: string;
    logScore: number;
    likelihoods: {
      feature: string;
      value: number;
      classLabel: string;
      likelihood: number;
    }[];
  }[] = [];

  model.classes.forEach(
    (classLabel) => {
      const prior =
        Math.max(
          model.priors[
            classLabel
          ] ?? 0,
          EPSILON
        );

      const logPrior =
        Math.log(prior);

      let logLikelihood =
        0;

      const likelihoods =
        model.features.map(
          (feature) => {
            const rawValue =
              featureValues[
                feature
              ] ?? 0;

            const binaryValue =
              rawValue > 0
                ? 1
                : 0;

            const presentProbability =
              model
                .featureProbabilities[
                classLabel
              ][feature];

            const likelihood =
              binaryValue === 1
                ? presentProbability
                : 1 -
                  presentProbability;

            logLikelihood +=
              Math.log(
                Math.max(
                  likelihood,
                  EPSILON
                )
              );

            return {
              feature,
              value:
                binaryValue,
              classLabel,
              likelihood,
            };
          }
        );

      rawScores.push({
        classLabel,

        logScore:
          logPrior +
          logLikelihood,

        likelihoods,
      });
    }
  );

  return buildPrediction(
    rawScores,
    model.priors
  );
}

/*
|--------------------------------------------------------------------------
| LOG SCORE -> NORMALIZED POSTERIOR
|--------------------------------------------------------------------------
|
| We calculate class scores in log-space.
|
| Then use a stable softmax-like normalization
| so the UI can show understandable probabilities.
|
*/

function buildPrediction(
  rawScores: {
    classLabel: string;
    logScore: number;
    likelihoods: {
      feature: string;
      value: number;
      classLabel: string;
      likelihood: number;
    }[];
  }[],
  priors: Record<
    string,
    number
  >
): NaiveBayesPrediction {
  if (
    rawScores.length === 0
  ) {
    return {
      predictedClass: "",
      classScores: [],
    };
  }

  const maxLogScore =
    Math.max(
      ...rawScores.map(
        (item) =>
          item.logScore
      )
    );

  const exponentials =
    rawScores.map(
      (item) =>
        Math.exp(
          item.logScore -
            maxLogScore
        )
    );

  const denominator =
    exponentials.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const classScores: ClassPredictionScore[] =
    rawScores.map(
      (item, index) => {
        const prior =
          Math.max(
            priors[
              item.classLabel
            ] ?? 0,
            EPSILON
          );

        const logPrior =
          Math.log(prior);

        return {
          classLabel:
            item.classLabel,

          prior,

          likelihoods:
            item.likelihoods,

          logPrior,

          logLikelihood:
            item.logScore -
            logPrior,

          logPosteriorScore:
            item.logScore,

          posteriorProbability:
            denominator === 0
              ? 0
              : exponentials[
                  index
                ] /
                denominator,
        };
      }
    );

  const winner =
    classScores.reduce(
      (best, current) =>
        current
          .logPosteriorScore >
        best.logPosteriorScore
          ? current
          : best
    );

  return {
    predictedClass:
      winner.classLabel,

    classScores,
  };
}

/*
|--------------------------------------------------------------------------
| DETERMINISTIC RANDOM NUMBER
|--------------------------------------------------------------------------
|
| Used so train/test split remains repeatable.
|
*/

function seededRandom(
  seed: number
): () => number {
  let state =
    seed >>> 0;

  return () => {
    state =
      (state *
        1664525 +
        1013904223) >>>
      0;

    return (
      state /
      4294967296
    );
  };
}

/*
|--------------------------------------------------------------------------
| DETERMINISTIC SHUFFLE
|--------------------------------------------------------------------------
*/

export function seededShuffle<T>(
  values: T[],
  seed = 42
): T[] {
  const random =
    seededRandom(seed);

  const result =
    [...values];

  for (
    let i =
      result.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        random() *
          (i + 1)
      );

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| STRATIFIED TRAIN / TEST SPLIT
|--------------------------------------------------------------------------
|
| Classification classes are split independently.
|
| This helps preserve class representation
| in both train and test sets.
|
*/

export function stratifiedSplit(
  rows: NBRow[],
  trainRatio = 0.75,
  seed = 42
): DatasetSplit {
  const classes =
    getClassLabels(rows);

  const train: NBRow[] =
    [];

  const test: NBRow[] =
    [];

  classes.forEach(
    (
      classLabel,
      classIndex
    ) => {
      const classRows =
        seededShuffle(
          getClassRows(
            rows,
            classLabel
          ),
          seed +
            classIndex *
              100
        );

      if (
        classRows.length ===
        1
      ) {
        train.push(
          classRows[0]
        );

        return;
      }

      let trainCount =
        Math.floor(
          classRows.length *
            trainRatio
        );

      trainCount =
        Math.max(
          1,
          trainCount
        );

      trainCount =
        Math.min(
          classRows.length -
            1,
          trainCount
        );

      train.push(
        ...classRows.slice(
          0,
          trainCount
        )
      );

      test.push(
        ...classRows.slice(
          trainCount
        )
      );
    }
  );

  return {
    train:
      seededShuffle(
        train,
        seed + 1000
      ),

    test:
      seededShuffle(
        test,
        seed + 2000
      ),
  };
}

/*
|--------------------------------------------------------------------------
| CLASSIFICATION METRICS
|--------------------------------------------------------------------------
|
| Supports binary and multiclass classification.
|
| Precision / Recall / F1 are macro averaged.
|
*/

export function calculateClassificationMetrics(
  actual: string[],
  predicted: string[]
): ClassificationMetrics {
  const labels =
    Array.from(
      new Set([
        ...actual,
        ...predicted,
      ])
    );

  const matrix =
    labels.map(() =>
      labels.map(() => 0)
    );

  const labelIndex =
    new Map<
      string,
      number
    >();

  labels.forEach(
    (label, index) => {
      labelIndex.set(
        label,
        index
      );
    }
  );

  const length =
    Math.min(
      actual.length,
      predicted.length
    );

  let correct = 0;

  for (
    let i = 0;
    i < length;
    i++
  ) {
    const actualIndex =
      labelIndex.get(
        actual[i]
      );

    const predictedIndex =
      labelIndex.get(
        predicted[i]
      );

    if (
      actualIndex ===
        undefined ||
      predictedIndex ===
        undefined
    ) {
      continue;
    }

    matrix[
      actualIndex
    ][predictedIndex]++;

    if (
      actual[i] ===
      predicted[i]
    ) {
      correct++;
    }
  }

  const precisions: number[] =
    [];

  const recalls: number[] =
    [];

  const f1Scores: number[] =
    [];

  labels.forEach(
    (_, classIndex) => {
      const tp =
        matrix[
          classIndex
        ][classIndex];

      let fp = 0;
      let fn = 0;

      for (
        let i = 0;
        i < labels.length;
        i++
      ) {
        if (
          i !== classIndex
        ) {
          fp +=
            matrix[i][
              classIndex
            ];

          fn +=
            matrix[
              classIndex
            ][i];
        }
      }

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

      const f1 =
        precision +
          recall ===
        0
          ? 0
          : (2 *
              precision *
              recall) /
            (precision +
              recall);

      precisions.push(
        precision
      );

      recalls.push(
        recall
      );

      f1Scores.push(f1);
    }
  );

  return {
    accuracy:
      length === 0
        ? 0
        : correct /
          length,

    precision:
      mean(precisions),

    recall:
      mean(recalls),

    f1:
      mean(f1Scores),

    confusionMatrix: {
      labels,
      matrix,
    },
  };
}

/*
|--------------------------------------------------------------------------
| MODEL EVALUATION
|--------------------------------------------------------------------------
|
| Split first -> train only on train data -> evaluate on test.
|
*/

export function evaluateGaussianNB(
  rows: NBRow[],
  features: string[],
  trainRatio = 0.75
): ClassificationMetrics {
  const split =
    stratifiedSplit(
      rows,
      trainRatio
    );

  const model =
    trainGaussianNB(
      split.train,
      features
    );

  const actual: string[] =
    [];

  const predicted: string[] =
    [];

  split.test.forEach(
    (row) => {
      const values: Record<
        string,
        number
      > = {};

      let valid = true;

      features.forEach(
        (feature) => {
          const value =
            getNumericValue(
              row,
              feature
            );

          if (
            value === null
          ) {
            valid = false;
          } else {
            values[
              feature
            ] = value;
          }
        }
      );

      if (!valid) {
        return;
      }

      const prediction =
        predictGaussianNB(
          model,
          values
        );

      actual.push(
        row.target
      );

      predicted.push(
        prediction.predictedClass
      );
    }
  );

  return calculateClassificationMetrics(
    actual,
    predicted
  );
}

export function evaluateMultinomialNB(
  rows: NBRow[],
  features: string[],
  alpha = 1,
  trainRatio = 0.75
): ClassificationMetrics {
  const split =
    stratifiedSplit(
      rows,
      trainRatio
    );

  const model =
    trainMultinomialNB(
      split.train,
      features,
      alpha
    );

  const actual: string[] =
    [];

  const predicted: string[] =
    [];

  split.test.forEach(
    (row) => {
      const values: Record<
        string,
        number
      > = {};

      features.forEach(
        (feature) => {
          values[
            feature
          ] =
            Math.max(
              0,
              getNumericValue(
                row,
                feature
              ) ?? 0
            );
        }
      );

      const prediction =
        predictMultinomialNB(
          model,
          values
        );

      actual.push(
        row.target
      );

      predicted.push(
        prediction.predictedClass
      );
    }
  );

  return calculateClassificationMetrics(
    actual,
    predicted
  );
}

export function evaluateBernoulliNB(
  rows: NBRow[],
  features: string[],
  alpha = 1,
  trainRatio = 0.75
): ClassificationMetrics {
  const split =
    stratifiedSplit(
      rows,
      trainRatio
    );

  const model =
    trainBernoulliNB(
      split.train,
      features,
      alpha
    );

  const actual: string[] =
    [];

  const predicted: string[] =
    [];

  split.test.forEach(
    (row) => {
      const values: Record<
        string,
        number
      > = {};

      features.forEach(
        (feature) => {
          values[
            feature
          ] =
            getNumericValue(
              row,
              feature
            ) ?? 0;
        }
      );

      const prediction =
        predictBernoulliNB(
          model,
          values
        );

      actual.push(
        row.target
      );

      predicted.push(
        prediction.predictedClass
      );
    }
  );

  return calculateClassificationMetrics(
    actual,
    predicted
  );
}