import type {
  ActiveSVMDataset,
  SVMKernel,
  SVMParameters,
  SVMRow,
} from "../types/svm";
import {
  prepareVisualizationRows,
} from "../dataset/datasetUtils";
import { calculateKernel } from "../kernels/kernelMath";

const EPS = 1e-9;

export type SVCExperimentOutput = {
  labels: string[];
  actual: string[];
  predicted: string[];
  confidence: number[];
  decisionGap: number[];
  confusionMatrix: number[][];
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  supportVectorIndexes: number[];
  misclassifiedIndexes: number[];
};

export type SVRExperimentOutput = {
  actual: number[];
  predicted: number[];
  residuals: number[];
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  outsideEpsilonIndexes: number[];
  supportVectorIndexes: number[];
};

function kernel(
  a: number[],
  b: number[],
  parameters: SVMParameters
) {
  return Number(
    calculateKernel(
      parameters.kernel,
      a,
      b,
      {
        gamma: parameters.gamma,
        degree: parameters.degree,
        coef0: parameters.coef0,
      }
    )
  ) || 0;
}

function positiveWeights(values: number[]) {
  if (values.length === 0) return [];
  const minimum = Math.min(...values);
  return values.map((value) =>
    Math.max(value - minimum + 0.001, 0.001)
  );
}

function uniqueLabels(rows: SVMRow[]) {
  return Array.from(
    new Set(rows.map((row) => String(row.target)))
  );
}

function predictClass(
  query: number[],
  trainingRows: SVMRow[],
  labels: string[],
  parameters: SVMParameters
) {
  const total = Math.max(trainingRows.length, 1);
  const cStrength =
    Math.max(parameters.C, 0.01) /
    (Math.max(parameters.C, 0.01) + 1);

  const scored = labels.map((label) => {
    const classRows = trainingRows.filter(
      (row) => String(row.target) === label
    );

    if (classRows.length === 0) {
      return { label, score: -Infinity };
    }

    const averageSimilarity =
      classRows.reduce(
        (sum, row) =>
          sum +
          kernel(query, row.features, parameters),
        0
      ) / classRows.length;

    const prior = classRows.length / total;
    const classWeight =
      parameters.classWeight === "balanced"
        ? total /
          Math.max(labels.length * classRows.length, 1)
        : 1;

    const score =
      classWeight *
      (
        cStrength * averageSimilarity +
        (1 - cStrength) * prior
      );

    return { label, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const first = scored[0] ?? {
    label: labels[0] ?? "Unknown",
    score: 0,
  };
  const second = scored[1]?.score ?? first.score;
  const gap = Math.max(first.score - second, 0);
  const confidence =
    1 - Math.exp(-Math.max(gap, 0));

  return {
    label: first.label,
    gap,
    confidence,
  };
}

function predictRegression(
  query: number[],
  trainingRows: SVMRow[],
  parameters: SVMParameters
) {
  if (trainingRows.length === 0) return 0;

  const similarities = trainingRows.map((row) =>
    kernel(query, row.features, parameters)
  );
  const weights = positiveWeights(similarities);
  const totalWeight = weights.reduce(
    (sum, value) => sum + value,
    0
  );

  const local =
    weights.reduce(
      (sum, weight, index) =>
        sum +
        weight *
          Number(trainingRows[index]?.target ?? 0),
      0
    ) / Math.max(totalWeight, EPS);

  const globalMean =
    trainingRows.reduce(
      (sum, row) => sum + Number(row.target),
      0
    ) / trainingRows.length;

  const C = Math.max(parameters.C, 0.01);
  const influence = C / (C + 1);

  return (
    globalMean * (1 - influence) +
    local * influence
  );
}

export function runSVCExperiment(
  dataset: ActiveSVMDataset,
  parameters: SVMParameters
): SVCExperimentOutput {
  const rows = prepareVisualizationRows(
    dataset.rows,
    dataset.scalingEnabled
  ).rows;

  const labels = uniqueLabels(rows);
  const actual: string[] = [];
  const predicted: string[] = [];
  const confidence: number[] = [];
  const decisionGap: number[] = [];

  rows.forEach((row, index) => {
    const trainingRows = rows.filter(
      (_item, rowIndex) => rowIndex !== index
    );

    const usableTraining =
      trainingRows.length > 0
        ? trainingRows
        : rows;

    const result = predictClass(
      row.features,
      usableTraining,
      labels,
      parameters
    );

    actual.push(String(row.target));
    predicted.push(result.label);
    confidence.push(result.confidence);
    decisionGap.push(result.gap);
  });

  const confusionMatrix = labels.map(
    (actualLabel) =>
      labels.map(
        (predictedLabel) =>
          actual.reduce(
            (count, label, index) =>
              count +
              (label === actualLabel &&
              predicted[index] === predictedLabel
                ? 1
                : 0),
            0
          )
      )
  );

  const accuracy =
    actual.reduce(
      (count, label, index) =>
        count +
        (label === predicted[index] ? 1 : 0),
      0
    ) / Math.max(actual.length, 1);

  const perClass = labels.map((label) => {
    let tp = 0;
    let fp = 0;
    let fn = 0;

    actual.forEach((actualLabel, index) => {
      const predictedLabel = predicted[index];
      if (
        actualLabel === label &&
        predictedLabel === label
      ) {
        tp += 1;
      } else if (
        actualLabel !== label &&
        predictedLabel === label
      ) {
        fp += 1;
      } else if (
        actualLabel === label &&
        predictedLabel !== label
      ) {
        fn += 1;
      }
    });

    const precision = tp / Math.max(tp + fp, 1);
    const recall = tp / Math.max(tp + fn, 1);
    const f1 =
      (2 * precision * recall) /
      Math.max(precision + recall, EPS);

    return { precision, recall, f1 };
  });

  const macroPrecision =
    perClass.reduce(
      (sum, metric) => sum + metric.precision,
      0
    ) / Math.max(perClass.length, 1);

  const macroRecall =
    perClass.reduce(
      (sum, metric) => sum + metric.recall,
      0
    ) / Math.max(perClass.length, 1);

  const macroF1 =
    perClass.reduce(
      (sum, metric) => sum + metric.f1,
      0
    ) / Math.max(perClass.length, 1);

  const misclassifiedIndexes = actual
    .map((_value, index) => index)
    .filter(
      (index) => actual[index] !== predicted[index]
    );

  const sortedGaps = [...decisionGap].sort(
    (a, b) => a - b
  );
  const threshold =
    sortedGaps[
      Math.min(
        Math.floor(sortedGaps.length * 0.35),
        Math.max(sortedGaps.length - 1, 0)
      )
    ] ?? 0;

  const supportVectorIndexes = decisionGap
    .map((_value, index) => index)
    .filter(
      (index) =>
        decisionGap[index] <= threshold ||
        misclassifiedIndexes.includes(index)
    );

  return {
    labels,
    actual,
    predicted,
    confidence,
    decisionGap,
    confusionMatrix,
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1,
    supportVectorIndexes,
    misclassifiedIndexes,
  };
}

export function runSVRExperiment(
  dataset: ActiveSVMDataset,
  parameters: SVMParameters
): SVRExperimentOutput {
  const rows = prepareVisualizationRows(
    dataset.rows,
    dataset.scalingEnabled
  ).rows.filter((row) =>
    Number.isFinite(Number(row.target))
  );

  const actual = rows.map((row) =>
    Number(row.target)
  );

  const predicted = rows.map((row, index) => {
    const trainingRows = rows.filter(
      (_item, rowIndex) => rowIndex !== index
    );

    return predictRegression(
      row.features,
      trainingRows.length > 0
        ? trainingRows
        : rows,
      parameters
    );
  });

  const residuals = actual.map(
    (value, index) =>
      value - (predicted[index] ?? 0)
  );

  const absoluteErrors = residuals.map(Math.abs);
  const squaredErrors = residuals.map(
    (value) => value * value
  );

  const mae =
    absoluteErrors.reduce(
      (sum, value) => sum + value,
      0
    ) / Math.max(actual.length, 1);

  const mse =
    squaredErrors.reduce(
      (sum, value) => sum + value,
      0
    ) / Math.max(actual.length, 1);

  const rmse = Math.sqrt(mse);

  const actualMean =
    actual.reduce(
      (sum, value) => sum + value,
      0
    ) / Math.max(actual.length, 1);

  const totalSquares = actual.reduce(
    (sum, value) =>
      sum + (value - actualMean) ** 2,
    0
  );

  const residualSquares =
    squaredErrors.reduce(
      (sum, value) => sum + value,
      0
    );

  const r2 =
    totalSquares <= EPS
      ? 0
      : 1 - residualSquares / totalSquares;

  const epsilon = Math.max(
    parameters.epsilon,
    0
  );

  const outsideEpsilonIndexes = residuals
    .map((_value, index) => index)
    .filter(
      (index) =>
        Math.abs(residuals[index] ?? 0) > epsilon
    );

  const tolerance = Math.max(
    epsilon * 0.25,
    rmse * 0.08,
    0.001
  );

  const supportVectorIndexes = residuals
    .map((_value, index) => index)
    .filter((index) => {
      const distance = Math.abs(
        residuals[index] ?? 0
      );

      return (
        distance > epsilon ||
        Math.abs(distance - epsilon) <= tolerance
      );
    });

  return {
    actual,
    predicted,
    residuals,
    mae,
    mse,
    rmse,
    r2,
    outsideEpsilonIndexes,
    supportVectorIndexes,
  };
}

export function getKernelLabel(
  kernelName: SVMKernel
) {
  switch (kernelName) {
    case "polynomial":
      return "Polynomial";
    case "rbf":
      return "RBF / Gaussian";
    case "chi-square":
      return "Chi-Square";
    default:
      return (
        kernelName.charAt(0).toUpperCase() +
        kernelName.slice(1)
      );
  }
}
