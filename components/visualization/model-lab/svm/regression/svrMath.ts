import type {
  RegressionMetrics,
  SVMKernel,
  SVMRow,
} from "../types/svm";

import {
  calculateKernel,
  createScalers,
  evaluateRegression,
  splitRegressionDataset,
  standardizeRows,
} from "../utils/svmMath";

export type SVRTrainingOptions = {
  kernel: SVMKernel;
  C: number;
  gamma: number;
  degree: number;
  epsilon: number;
  epochs?: number;
  learningRate?: number;
};

export type TrainedSVR = {
  trainingRows: SVMRow[];

  coefficients: number[];

  bias: number;

  kernel: SVMKernel;

  C: number;

  gamma: number;

  degree: number;

  epsilon: number;

  supportVectorIndices: number[];
};

export type SVRPrediction = {
  prediction: number;
};

export type SVREvaluation = {
  model: TrainedSVR;

  trainRows: SVMRow[];

  testRows: SVMRow[];

  actual: number[];

  predicted: number[];

  metrics: RegressionMetrics;
};

function targetNumber(
  value: string | number | null
): number {
  if (
    typeof value === "number"
  ) {
    return value;
  }

  if (value === null) {
    return 0;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function svrDecisionFunction(
  model: TrainedSVR,
  features: number[]
): number {
  let prediction =
    model.bias;

  for (
    let index = 0;
    index <
    model.trainingRows.length;
    index += 1
  ) {
    const coefficient =
      model.coefficients[
        index
      ] ?? 0;

    if (
      Math.abs(coefficient) <
      1e-10
    ) {
      continue;
    }

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

    prediction +=
      coefficient *
      kernelValue;
  }

  return prediction;
}

export function predictSVR(
  model: TrainedSVR,
  features: number[]
): SVRPrediction {
  return {
    prediction:
      svrDecisionFunction(
        model,
        features
      ),
  };
}

/*
  Small educational kernel SVR
  optimizer.

  It demonstrates the
  epsilon-insensitive objective
  and kernel behavior without
  pretending to replace a
  production libsvm-style solver.
*/
export function trainSVR(
  rows: SVMRow[],
  options: SVRTrainingOptions
): TrainedSVR {
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

  const epsilon =
    Math.max(
      0,
      options.epsilon
    );

  const epochs =
    Math.max(
      1,
      options.epochs ?? 150
    );

  const baseLearningRate =
    Math.max(
      0.0001,
      options.learningRate ??
        0.02
    );

  const coefficients =
    new Array(
      rows.length
    ).fill(0);

  const targets =
    rows.map(
      (row) =>
        targetNumber(
          row.target
        )
    );

  const targetMean =
    targets.length > 0
      ? targets.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        ) / targets.length
      : 0;

  let bias =
    targetMean;

  for (
    let epoch = 0;
    epoch < epochs;
    epoch += 1
  ) {
    const learningRate =
      baseLearningRate /
      (1 +
        epoch * 0.01);

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      let prediction =
        bias;

      for (
        let supportIndex = 0;
        supportIndex <
        rows.length;
        supportIndex += 1
      ) {
        const coefficient =
          coefficients[
            supportIndex
          ] ?? 0;

        if (
          Math.abs(
            coefficient
          ) < 1e-10
        ) {
          continue;
        }

        prediction +=
          coefficient *
          calculateKernel(
            rows[
              supportIndex
            ].features,
            rows[index]
              .features,
            options.kernel,
            gamma,
            degree
          );
      }

      const residual =
        targets[index] -
        prediction;

      if (
        Math.abs(residual) >
        epsilon
      ) {
        const direction =
          residual > 0
            ? 1
            : -1;

        coefficients[index] +=
          learningRate *
          direction;

        coefficients[index] =
          Math.max(
            -C,
            Math.min(
              C,
              coefficients[
                index
              ]
            )
          );

        bias +=
          learningRate *
          direction *
          0.1;
      } else {
        coefficients[index] *=
          1 -
          learningRate *
            0.01;
      }
    }
  }

  const provisional: TrainedSVR =
    {
      trainingRows: rows,

      coefficients,

      bias,

      kernel:
        options.kernel,

      C,

      gamma,

      degree,

      epsilon,

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
        const prediction =
          svrDecisionFunction(
            provisional,
            rows[index]
              .features
          );

        const residual =
          Math.abs(
            targets[index] -
              prediction
          );

        return (
          Math.abs(
            coefficients[
              index
            ] ?? 0
          ) > 0.001 ||
          residual >=
            epsilon * 0.95
        );
      });

  return {
    ...provisional,
    supportVectorIndices,
  };
}

export function evaluateSVR(
  rows: SVMRow[],
  options: SVRTrainingOptions,
  scalingEnabled: boolean
): SVREvaluation {
  const split =
    splitRegressionDataset(
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

  const model =
    trainSVR(
      trainRows,
      options
    );

  const actual =
    testRows.map(
      (row) =>
        targetNumber(
          row.target
        )
    );

  const predicted =
    testRows.map(
      (row) =>
        predictSVR(
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
      evaluateRegression(
        actual,
        predicted
      ),
  };
}