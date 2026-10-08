import { useMemo } from "react";

import {
  useSVM,
} from "../context/SVMContext";

import {
  calculateKernel,
} from "../kernels/kernelMath";

import {
  prepareVisualizationRows,
  transformQueryForDataset,
} from "../dataset/datasetUtils";

import type {
  SVMRow,
} from "../types/svm";

const EPS = 1e-9;

function mean(values: number[]) {
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

function numericTarget(
  value: string | number
) {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function featureRange(
  rows: SVMRow[],
  featureIndex: number
) {
  const values =
    rows
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

  if (values.length === 0) {
    return {
      min: 0,
      max: 1,
      step: 0.01,
    };
  }

  const min =
    Math.min(...values);

  const max =
    Math.max(...values);

  const span =
    Math.max(
      max - min,
      1
    );

  return {
    min,
    max,
    step:
      span / 100,
  };
}

export default function LiveSVMPrediction() {
  const {
    state,
    setQueryPoint,
  } = useSVM();

  const rawRows =
    state.dataset?.rows ?? [];

  const scalingEnabled =
    state.dataset
      ?.scalingEnabled ??
    false;

  const prepared =
    useMemo(
      () =>
        prepareVisualizationRows(
          rawRows,
          scalingEnabled
        ),
      [
        rawRows,
        scalingEnabled,
      ]
    );

  const modelRows =
    prepared.rows;

  const featureNames =
    state.dataset
      ?.featureColumns ??
    [];

  const featureCount =
    Math.max(
      featureNames.length,
      rawRows[0]
        ?.features.length ??
        0
    );

  const rawQuery =
    useMemo(
      () =>
        Array.from(
          {
            length:
              featureCount,
          },
          (
            _,
            featureIndex
          ) => {
            const explicit =
              state.queryPoint
                .values[
                featureIndex
              ];

            if (
              Number.isFinite(
                explicit
              )
            ) {
              return explicit;
            }

            return mean(
              rawRows.map(
                (row) =>
                  row.features[
                    featureIndex
                  ] ?? 0
              )
            );
          }
        ),
      [
        featureCount,
        state.queryPoint
          .values,
        rawRows,
      ]
    );

  const modelQuery =
    useMemo(
      () =>
        transformQueryForDataset(
          rawQuery,
          rawRows,
          scalingEnabled
        ),
      [
        rawQuery,
        rawRows,
        scalingEnabled,
      ]
    );

  const prediction =
    useMemo(() => {
      if (
        modelRows.length ===
        0
      ) {
        return null;
      }

      const kernelOptions = {
        gamma:
          state.parameters
            .gamma,
        degree:
          state.parameters
            .degree,
        coef0:
          state.parameters
            .coef0,
      };

      if (
        state.task ===
        "classification"
      ) {
        const labels =
          Array.from(
            new Set(
              modelRows.map(
                (row) =>
                  String(
                    row.target
                  )
              )
            )
          );

        if (
          labels.length ===
          0
        ) {
          return null;
        }

        const totalRows =
          modelRows.length;

        const classCount =
          labels.length;

        const safeC =
          Math.max(
            state.parameters.C,
            0.01
          );

        const cStrength =
          safeC /
          (safeC + 1);

        const scores =
          labels.map(
            (label) => {
              const classRows =
                modelRows.filter(
                  (row) =>
                    String(
                      row.target
                    ) === label
                );

              const similarities =
                classRows.map(
                  (row) =>
                    calculateKernel(
                      state.parameters
                        .kernel,
                      modelQuery,
                      row.features,
                      kernelOptions
                    )
                );

              const averageSimilarity =
                mean(
                  similarities.filter(
                    Number.isFinite
                  )
                );

              const prior =
                classRows.length /
                Math.max(
                  totalRows,
                  1
                );

              const classWeight =
                state.parameters
                  .classWeight ===
                "balanced"
                  ? totalRows /
                    Math.max(
                      classCount *
                        classRows.length,
                      1
                    )
                  : 1;

              const score =
                (
                  (1 -
                    cStrength) *
                    prior +
                  cStrength *
                    averageSimilarity
                ) *
                classWeight;

              return {
                label,
                score,
              };
            }
          );

        scores.sort(
          (left, right) =>
            right.score -
            left.score
        );

        const best =
          scores[0];

        const second =
          scores[1];

        const gap =
          best.score -
          (second?.score ??
            0);

        const confidence =
          Math.abs(gap) /
          (
            Math.abs(
              best.score
            ) +
            Math.abs(
              second?.score ??
                0
            ) +
            EPS
          );

        return {
          task:
            "classification" as const,
          predicted:
            best.label,
          score: gap,
          confidence,
          scores,
        };
      }

      const validRows =
        modelRows.filter(
          (row) =>
            Number.isFinite(
              Number(
                row.target
              )
            )
        );

      if (
        validRows.length ===
        0
      ) {
        return null;
      }

      const targets =
        validRows.map(
          (row) =>
            numericTarget(
              row.target
            )
        );

      const globalMean =
        mean(targets);

      const similarities =
        validRows.map(
          (row) =>
            calculateKernel(
              state.parameters
                .kernel,
              modelQuery,
              row.features,
              kernelOptions
            )
        );

      /*
       * Educational browser SVR:
       * shift similarities positive
       * before weighted averaging.
       * This is intentionally not
       * presented as sklearn's exact
       * SVR optimizer.
       */
      const finiteSimilarities =
        similarities.map(
          (value) =>
            Number.isFinite(value)
              ? value
              : 0
        );

      const minimumSimilarity =
        Math.min(
          ...finiteSimilarities
        );

      const weights =
        finiteSimilarities.map(
          (value) =>
            Math.max(
              value -
                minimumSimilarity +
                EPS,
              EPS
            )
        );

      const totalWeight =
        weights.reduce(
          (sum, value) =>
            sum + value,
          0
        );

      const localPrediction =
        validRows.reduce(
          (
            sum,
            row,
            index
          ) =>
            sum +
            numericTarget(
              row.target
            ) *
              weights[index],
          0
        ) /
        Math.max(
          totalWeight,
          EPS
        );

      const safeC =
        Math.max(
          state.parameters.C,
          0.01
        );

      const cStrength =
        safeC /
        (safeC + 1);

      const predicted =
        (1 - cStrength) *
          globalMean +
        cStrength *
          localPrediction;

      const nearestIndex =
        weights.reduce(
          (
            bestIndex,
            value,
            index
          ) =>
            value >
            weights[
              bestIndex
            ]
              ? index
              : bestIndex,
          0
        );

      const nearestTarget =
        targets[
          nearestIndex
        ];

      const epsilonDistance =
        Math.abs(
          nearestTarget -
            predicted
        );

      return {
        task:
          "regression" as const,
        predicted,
        localPrediction,
        globalMean,
        nearestTarget,
        epsilonDistance,
        insideEpsilon:
          epsilonDistance <=
          state.parameters
            .epsilon,
      };
    }, [
      modelRows,
      modelQuery,
      state.task,
      state.parameters,
    ]);

  if (
    rawRows.length === 0 ||
    featureCount === 0 ||
    !prediction
  ) {
    return null;
  }

  const updateFeature = (
    featureIndex: number,
    value: number
  ) => {
    const next =
      [...rawQuery];

    next[
      featureIndex
    ] = value;

    setQueryPoint({
      values: next,
    });
  };

  return (
    <section className="live-prediction">
      <div>
        <span>
          LIVE PREDICTION
        </span>

        <h3>
          {state.task ===
          "classification"
            ? "Classify a New Observation"
            : "Predict a Continuous Value"}
        </h3>

        <p>
          Move the feature values in
          original dataset units.
          ModelMind transforms the
          query into the same{" "}
          {scalingEnabled
            ? "standardized"
            : "raw"}{" "}
          model space used by the
          active SVM learning model.
        </p>
      </div>

      <div className="live-prediction-controls">
        {Array.from(
          {
            length:
              featureCount,
          },
          (
            _,
            featureIndex
          ) => {
            const range =
              featureRange(
                rawRows,
                featureIndex
              );

            const value =
              rawQuery[
                featureIndex
              ] ??
              range.min;

            return (
              <label
                key={
                  featureNames[
                    featureIndex
                  ] ??
                  featureIndex
                }
              >
                <span>
                  {featureNames[
                    featureIndex
                  ] ??
                    `Feature ${
                      featureIndex +
                      1
                    }`}
                </span>

                <strong>
                  {value.toFixed(
                    3
                  )}
                </strong>

                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={value}
                  onChange={(
                    event
                  ) =>
                    updateFeature(
                      featureIndex,
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  }
                />
              </label>
            );
          }
        )}
      </div>

      <div className="live-prediction-result">
        {prediction.task ===
        "classification" ? (
          <>
            <span>
              Predicted class
            </span>

            <strong>
              {
                prediction.predicted
              }
            </strong>

            <small>
              Kernel score gap:{" "}
              {prediction.score.toFixed(
                4
              )}
            </small>

            <small>
              Educational confidence:{" "}
              {(
                prediction.confidence *
                100
              ).toFixed(1)}
              %
            </small>

            <small>
              Kernel:{" "}
              {
                state.parameters
                  .kernel
              }
              {" · "}C ={" "}
              {state.parameters.C.toFixed(
                2
              )}
              {" · "}class weight ={" "}
              {
                state.parameters
                  .classWeight
              }
            </small>
          </>
        ) : (
          <>
            <span>
              Predicted value
            </span>

            <strong>
              {prediction.predicted.toFixed(
                4
              )}
            </strong>

            <small>
              ε ={" "}
              {state.parameters.epsilon.toFixed(
                3
              )}
              {" · "}
              {prediction.insideEpsilon
                ? "inside educational ε tolerance"
                : "outside educational ε tolerance"}
            </small>

            <small>
              Kernel:{" "}
              {
                state.parameters
                  .kernel
              }
              {" · "}C ={" "}
              {state.parameters.C.toFixed(
                2
              )}
            </small>

            <small>
              Nearest kernel-related
              target:{" "}
              {prediction.nearestTarget.toFixed(
                4
              )}
              {" · "}distance ={" "}
              {prediction.epsilonDistance.toFixed(
                4
              )}
            </small>
          </>
        )}
      </div>

      <div className="live-model-truth">
        <strong>
          Educational prediction
        </strong>

        <span>
          This browser visualization
          uses ModelMind's educational
          kernel prediction logic so
          every control reacts
          instantly. It is not claimed
          to be the exact optimization
          result of scikit-learn SVC or
          SVR.
        </span>
      </div>
    </section>
  );
}
