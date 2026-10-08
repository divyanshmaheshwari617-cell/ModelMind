import type {
  SVMParameters,
  SVMRow,
} from "../types/svm";

import {
  standardizeFeatures,
} from "../dataset/datasetUtils";

export type ClassificationPrediction = {
  rowId: string;
  actual: string;
  predicted: string;
  score: number;
  correct: boolean;
};

export type ClassificationExperiment = {
  labels: string[];

  predictions:
    ClassificationPrediction[];

  accuracy: number;
  precision: number;
  recall: number;
  f1: number;

  confusionMatrix: number[][];

  supportVectorIndexes: number[];

  supportVectorCount: number;

  misclassifiedCount: number;
};

export type RegressionPrediction = {
  rowId: string;
  actual: number;
  predicted: number;
  residual: number;
  outsideEpsilon: boolean;
};

export type RegressionExperiment = {
  predictions:
    RegressionPrediction[];

  mae: number;
  mse: number;
  rmse: number;
  r2: number;

  supportVectorIndexes: number[];

  supportVectorCount: number;
};

function distance(
  left: number[],
  right: number[]
) {
  const length =
    Math.max(
      left.length,
      right.length
    );

  let total = 0;

  for (
    let index = 0;
    index < length;
    index++
  ) {
    const difference =
      (left[index] ?? 0) -
      (right[index] ?? 0);

    total +=
      difference *
      difference;
  }

  return Math.sqrt(total);
}

function kernelSimilarity(
  left: number[],
  right: number[],
  parameters: SVMParameters
) {
  const dot =
    left.reduce(
      (sum, value, index) =>
        sum +
        value *
          (right[index] ?? 0),
      0
    );

  const squaredDistance =
    left.reduce(
      (sum, value, index) => {
        const difference =
          value -
          (right[index] ?? 0);

        return (
          sum +
          difference *
            difference
        );
      },
      0
    );

  switch (
    parameters.kernel
  ) {
    case "linear":
      return dot;

    case "polynomial":
      return Math.pow(
        parameters.gamma *
          dot +
          parameters.coef0,
        parameters.degree
      );

    case "rbf":
      return Math.exp(
        -parameters.gamma *
          squaredDistance
      );

    case "sigmoid":
      return Math.tanh(
        parameters.gamma *
          dot +
          parameters.coef0
      );

    case "laplacian":
      return Math.exp(
        -parameters.gamma *
          Math.sqrt(
            squaredDistance
          )
      );

    case "chi-square": {
      let result = 0;

      for (
        let index = 0;
        index <
        Math.max(
          left.length,
          right.length
        );
        index++
      ) {
        const a =
          Math.max(
            left[index] ?? 0,
            0
          );

        const b =
          Math.max(
            right[index] ?? 0,
            0
          );

        const denominator =
          a + b;

        if (
          denominator >
          1e-9
        ) {
          result +=
            ((a - b) ** 2) /
            denominator;
        }
      }

      return Math.exp(
        -parameters.gamma *
          result
      );
    }

    case "custom":
    default:
      return Math.exp(
        -parameters.gamma *
          squaredDistance
      );
  }
}

function prepareRows(
  rows: SVMRow[],
  scalingEnabled: boolean
) {
  return scalingEnabled
    ? standardizeFeatures(rows)
    : rows.map(
        (row) => ({
          ...row,
          features: [
            ...row.features,
          ],
        })
      );
}

/*
 * IMPORTANT:
 *
 * This browser engine is an
 * educational SVM-like experiment
 * engine. It is NOT sklearn SVC/SVR.
 *
 * Exact sklearn training will be
 * connected through the Python
 * backend later.
 */

export function runClassificationExperiment(
  rows: SVMRow[],
  parameters: SVMParameters,
  scalingEnabled: boolean
): ClassificationExperiment {
  const workingRows =
    prepareRows(
      rows,
      scalingEnabled
    );

  const labels =
    Array.from(
      new Set(
        workingRows.map(
          (row) =>
            String(row.target)
        )
      )
    );

  if (
    workingRows.length === 0 ||
    labels.length < 2
  ) {
    return {
      labels,
      predictions: [],
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      confusionMatrix: [],
      supportVectorIndexes: [],
      supportVectorCount: 0,
      misclassifiedCount: 0,
    };
  }

  const classRows =
    new Map<
      string,
      SVMRow[]
    >();

  labels.forEach(
    (label) =>
      classRows.set(
        label,
        []
      )
  );

  workingRows.forEach(
    (row) => {
      classRows
        .get(
          String(
            row.target
          )
        )
        ?.push(row);
    }
  );

  const predictions =
    workingRows.map(
      (row) => {
        const classScores =
          labels.map(
            (label) => {
              const examples =
                classRows.get(
                  label
                ) ?? [];

              if (
                examples.length ===
                0
              ) {
                return {
                  label,
                  score:
                    -Infinity,
                };
              }

              const similarities =
                examples
                  .filter(
                    (example) =>
                      example.id !==
                      row.id
                  )
                  .map(
                    (example) =>
                      kernelSimilarity(
                        row.features,
                        example.features,
                        parameters
                      )
                  );

              const usable =
                similarities.length >
                0
                  ? similarities
                  : examples.map(
                      (example) =>
                        kernelSimilarity(
                          row.features,
                          example.features,
                          parameters
                        )
                    );

              const score =
                usable.reduce(
                  (
                    sum,
                    value
                  ) =>
                    sum +
                    value,
                  0
                ) /
                Math.max(
                  usable.length,
                  1
                );

              return {
                label,
                score,
              };
            }
          );

        classScores.sort(
          (left, right) =>
            right.score -
            left.score
        );

        const predicted =
          classScores[0]
            ?.label ??
          labels[0];

        const score =
          classScores[0]
            ?.score ?? 0;

        const actual =
          String(
            row.target
          );

        return {
          rowId: row.id,
          actual,
          predicted,
          score,
          correct:
            predicted ===
            actual,
        };
      }
    );

  const confusionMatrix =
    labels.map(
      (actual) =>
        labels.map(
          (predicted) =>
            predictions.filter(
              (item) =>
                item.actual ===
                  actual &&
                item.predicted ===
                  predicted
            ).length
        )
    );

  const correct =
    predictions.filter(
      (item) =>
        item.correct
    ).length;

  const accuracy =
    correct /
    Math.max(
      predictions.length,
      1
    );

  /*
   * Macro precision/recall/F1.
   */
  const perClass =
    labels.map(
      (label) => {
        const tp =
          predictions.filter(
            (item) =>
              item.actual ===
                label &&
              item.predicted ===
                label
          ).length;

        const fp =
          predictions.filter(
            (item) =>
              item.actual !==
                label &&
              item.predicted ===
                label
          ).length;

        const fn =
          predictions.filter(
            (item) =>
              item.actual ===
                label &&
              item.predicted !==
                label
          ).length;

        const precision =
          tp /
          Math.max(
            tp + fp,
            1
          );

        const recall =
          tp /
          Math.max(
            tp + fn,
            1
          );

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

        return {
          precision,
          recall,
          f1,
        };
      }
    );

  const precision =
    perClass.reduce(
      (sum, metric) =>
        sum +
        metric.precision,
      0
    ) /
    labels.length;

  const recall =
    perClass.reduce(
      (sum, metric) =>
        sum +
        metric.recall,
      0
    ) /
    labels.length;

  const f1 =
    perClass.reduce(
      (sum, metric) =>
        sum +
        metric.f1,
      0
    ) /
    labels.length;

  /*
   * Educational support-vector
   * candidates:
   *
   * Find observations whose best
   * and second-best kernel scores
   * are close together.
   */
  const ambiguity =
    workingRows.map(
      (row, index) => {
        const scores =
          labels
            .map(
              (label) => {
                const examples =
                  classRows.get(
                    label
                  ) ?? [];

                return (
                  examples.reduce(
                    (
                      sum,
                      example
                    ) =>
                      sum +
                      kernelSimilarity(
                        row.features,
                        example.features,
                        parameters
                      ),
                    0
                  ) /
                  Math.max(
                    examples.length,
                    1
                  )
                );
              }
            )
            .sort(
              (a, b) =>
                b - a
            );

        return {
          index,
          difference:
            Math.abs(
              (scores[0] ??
                0) -
                (scores[1] ??
                  0)
            ),
        };
      }
    )
    .sort(
      (a, b) =>
        a.difference -
        b.difference
    );

  const desiredCount =
    Math.max(
      2,
      Math.min(
        Math.ceil(
          workingRows.length *
            Math.min(
              0.35,
              0.08 +
                1 /
                  Math.max(
                    parameters.C,
                    1
                  )
            )
        ),
        workingRows.length
      )
    );

  const supportVectorIndexes =
    ambiguity
      .slice(
        0,
        desiredCount
      )
      .map(
        (item) =>
          item.index
      );

  return {
    labels,
    predictions,
    accuracy,
    precision,
    recall,
    f1,
    confusionMatrix,
    supportVectorIndexes,
    supportVectorCount:
      supportVectorIndexes.length,
    misclassifiedCount:
      predictions.filter(
        (item) =>
          !item.correct
      ).length,
  };
}

export function runRegressionExperiment(
  rows: SVMRow[],
  parameters: SVMParameters,
  scalingEnabled: boolean
): RegressionExperiment {
  const workingRows =
    prepareRows(
      rows,
      scalingEnabled
    );

  if (
    workingRows.length === 0
  ) {
    return {
      predictions: [],
      mae: 0,
      mse: 0,
      rmse: 0,
      r2: 0,
      supportVectorIndexes: [],
      supportVectorCount: 0,
    };
  }

  const targets =
    workingRows.map(
      (row) =>
        Number(row.target)
    );

  if (
    targets.some(
      (value) =>
        !Number.isFinite(
          value
        )
    )
  ) {
    return {
      predictions: [],
      mae: 0,
      mse: 0,
      rmse: 0,
      r2: 0,
      supportVectorIndexes: [],
      supportVectorCount: 0,
    };
  }

  const predictions =
    workingRows.map(
      (row, rowIndex) => {
        let weightedTarget =
          0;

        let totalWeight =
          0;

        workingRows.forEach(
          (
            example,
            exampleIndex
          ) => {
            if (
              exampleIndex ===
                rowIndex &&
              workingRows.length >
                1
            ) {
              return;
            }

            let weight =
              kernelSimilarity(
                row.features,
                example.features,
                parameters
              );

            if (
              parameters.kernel ===
              "linear"
            ) {
              weight =
                1 /
                (1 +
                  distance(
                    row.features,
                    example.features
                  ));
            }

            weight =
              Math.max(
                Math.abs(
                  weight
                ),
                1e-8
              );

            weightedTarget +=
              weight *
              Number(
                example.target
              );

            totalWeight +=
              weight;
          }
        );

        const predicted =
          weightedTarget /
          Math.max(
            totalWeight,
            1e-8
          );

        const actual =
          Number(
            row.target
          );

        const residual =
          actual -
          predicted;

        return {
          rowId: row.id,
          actual,
          predicted,
          residual,
          outsideEpsilon:
            Math.abs(
              residual
            ) >
            parameters.epsilon,
        };
      }
    );

  const absoluteErrors =
    predictions.map(
      (item) =>
        Math.abs(
          item.residual
        )
    );

  const squaredErrors =
    predictions.map(
      (item) =>
        item.residual *
        item.residual
    );

  const mae =
    absoluteErrors.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    predictions.length;

  const mse =
    squaredErrors.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    predictions.length;

  const rmse =
    Math.sqrt(mse);

  const meanTarget =
    targets.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    targets.length;

  const totalVariation =
    targets.reduce(
      (sum, value) =>
        sum +
        (value -
          meanTarget) **
          2,
      0
    );

  const residualVariation =
    squaredErrors.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const r2 =
    totalVariation >
    1e-12
      ? 1 -
        residualVariation /
          totalVariation
      : 0;

  const supportVectorIndexes =
    predictions
      .map(
        (
          prediction,
          index
        ) => ({
          index,
          outside:
            prediction
              .outsideEpsilon,
        })
      )
      .filter(
        (item) =>
          item.outside
      )
      .map(
        (item) =>
          item.index
      );

  return {
    predictions,
    mae,
    mse,
    rmse,
    r2,
    supportVectorIndexes,
    supportVectorCount:
      supportVectorIndexes.length,
  };
}