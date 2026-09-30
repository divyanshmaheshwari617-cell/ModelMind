import type {
  ClassificationMetrics,
  SVMKernel,
  SVMRow,
} from "../types/svm";

import {
  calculateKernel,
  createScalers,
  evaluateBinaryClassification,
  splitClassificationDataset,
  standardizeRows,
} from "../utils/svmMath";

export type SVCTrainingOptions = {
  kernel: SVMKernel;
  C: number;
  gamma: number;
  degree: number;
  epochs?: number;
  learningRate?: number;
};

export type TrainedSVC = {
  trainingRows: SVMRow[];
  labels: (-1 | 1)[];
  alpha: number[];
  bias: number;

  kernel: SVMKernel;
  C: number;
  gamma: number;
  degree: number;

  supportVectorIndices: number[];
};

export type SVCDecision = {
  score: number;
  prediction: -1 | 1;
};

export type SVCEvaluation = {
  model: TrainedSVC;
  trainRows: SVMRow[];
  testRows: SVMRow[];

  actual: (-1 | 1)[];
  predicted: (-1 | 1)[];

  metrics: ClassificationMetrics;
};

function numericTarget(
  value: string | number
): number {
  if (
    typeof value === "number"
  ) {
    return value;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function getBinaryClasses(
  rows: SVMRow[]
): Array<string | number> {
  const classes =
    new Map<
      string,
      string | number
    >();

  for (const row of rows) {
    if (
      row.target === null
    ) {
      continue;
    }

    const key =
      String(row.target);

    if (!classes.has(key)) {
      classes.set(
        key,
        row.target
      );
    }
  }

  return Array.from(
    classes.values()
  );
}

export function encodeBinaryLabels(
  rows: SVMRow[],
  negativeClass:
    | string
    | number,
  positiveClass:
    | string
    | number
): (-1 | 1)[] {
  return rows.map((row) => {
    if (
      row.target !== null &&
      String(row.target) ===
        String(positiveClass)
    ) {
      return 1;
    }

    if (
      row.target !== null &&
      String(row.target) ===
        String(negativeClass)
    ) {
      return -1;
    }

    if (
      row.target === null
    ) {
      return -1;
    }

    return numericTarget(
      row.target
    ) >= 0
      ? 1
      : -1;
  });
}

export function svcDecisionFunction(
  model: TrainedSVC,
  features: number[]
): number {
  let score =
    model.bias;

  for (
    let index = 0;
    index <
    model.trainingRows.length;
    index += 1
  ) {
    const alpha =
      model.alpha[index] ??
      0;

    if (
      Math.abs(alpha) <
      1e-10
    ) {
      continue;
    }

    const label =
      model.labels[index] ??
      -1;

    const kernelValue =
      calculateKernel(
        model.trainingRows[
          index
        ].features,
        features,
        model.kernel,
        model.gamma,
        model.degree
      );

    score +=
      alpha *
      label *
      kernelValue;
  }

  return score;
}

export function predictSVC(
  model: TrainedSVC,
  features: number[]
): SVCDecision {
  const score =
    svcDecisionFunction(
      model,
      features
    );

  return {
    score,
    prediction:
      score >= 0
        ? 1
        : -1,
  };
}

/*
  Educational kernel SVC trainer.

  This uses a kernelized
  margin-loss optimization loop.

  It is intentionally small and
  understandable for the
  visualization lab rather than
  being a replacement for a
  production SVM library.
*/
export function trainSVC(
  rows: SVMRow[],
  labels: (-1 | 1)[],
  options: SVCTrainingOptions
): TrainedSVC {
  const kernel =
    options.kernel;

  const C =
    Math.max(
      options.C,
      0.0001
    );

  const gamma =
    Math.max(
      options.gamma,
      0.000001
    );

  const degree =
    Math.max(
      1,
      Math.round(
        options.degree
      )
    );

  const epochs =
    Math.max(
      1,
      options.epochs ?? 120
    );

  const baseLearningRate =
    Math.max(
      0.0001,
      options.learningRate ??
        0.04
    );

  const alpha =
    new Array(
      rows.length
    ).fill(0);

  let bias = 0;

  for (
    let epoch = 0;
    epoch < epochs;
    epoch += 1
  ) {
    const learningRate =
      baseLearningRate /
      (1 +
        epoch * 0.015);

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      const label =
        labels[index] ?? -1;

      let score = bias;

      for (
        let supportIndex = 0;
        supportIndex <
        rows.length;
        supportIndex += 1
      ) {
        const coefficient =
          alpha[
            supportIndex
          ] ?? 0;

        if (
          Math.abs(
            coefficient
          ) < 1e-10
        ) {
          continue;
        }

        score +=
          coefficient *
          (labels[
            supportIndex
          ] ?? -1) *
          calculateKernel(
            rows[
              supportIndex
            ].features,
            rows[index]
              .features,
            kernel,
            gamma,
            degree
          );
      }

      const functionalMargin =
        label * score;

      if (
        functionalMargin < 1
      ) {
        alpha[index] =
          Math.min(
            C,
            (alpha[index] ??
              0) +
              learningRate
          );

        bias +=
          learningRate *
          label *
          0.25;
      } else {
        alpha[index] =
          Math.max(
            0,
            (alpha[index] ??
              0) *
              (1 -
                learningRate *
                  0.02)
          );
      }
    }
  }

  const provisional: TrainedSVC =
    {
      trainingRows: rows,
      labels,
      alpha,
      bias,

      kernel,
      C,
      gamma,
      degree,

      supportVectorIndices:
        [],
    };

  const supportVectorIndices =
    rows
      .map(
        (_, index) =>
          index
      )
      .filter((index) => {
        const coefficient =
          alpha[index] ?? 0;

        if (
          coefficient >
          0.001
        ) {
          return true;
        }

        const decision =
          svcDecisionFunction(
            provisional,
            rows[index]
              .features
          );

        return (
          Math.abs(
            (labels[index] ??
              -1) *
              decision -
              1
          ) < 0.15
        );
      });

  return {
    ...provisional,
    supportVectorIndices,
  };
}

export function evaluateSVC(
  rows: SVMRow[],
  negativeClass:
    | string
    | number,
  positiveClass:
    | string
    | number,
  options: SVCTrainingOptions,
  scalingEnabled: boolean
): SVCEvaluation {
  const split =
    splitClassificationDataset(
      rows,
      0.75
    );

  let trainRows =
    split.train;

  let testRows =
    split.test;

  if (
    scalingEnabled &&
    trainRows.length > 0
  ) {
    const scalers =
      createScalers(
        trainRows
      );

    trainRows =
      standardizeRows(
        trainRows,
        scalers
      );

    testRows =
      standardizeRows(
        testRows,
        scalers
      );
  }

  const trainLabels =
    encodeBinaryLabels(
      trainRows,
      negativeClass,
      positiveClass
    );

  const model =
    trainSVC(
      trainRows,
      trainLabels,
      options
    );

  const actual =
    encodeBinaryLabels(
      testRows,
      negativeClass,
      positiveClass
    );

  const predicted =
    testRows.map(
      (row) =>
        predictSVC(
          model,
          row.features
        ).prediction
    );

  return {
    model,
    trainRows,
    testRows,
    actual,
    predicted,

    metrics:
      evaluateBinaryClassification(
        actual,
        predicted
      ),
  };
}