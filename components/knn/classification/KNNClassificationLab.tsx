import {
  useMemo,
} from "react";

import type {
  DistanceMetric,
  KNNRow,
  WeightingMethod,
} from "../types/knn";

import {
  createScalers,
  evaluateClassification,
  predictClassification,
  splitClassificationDataset,
  standardizeRows,
} from "../utils/knnMath";

import ClassificationVoting from "./ClassificationVoting";
import ClassificationMetrics from "../metrics/ClassificationMetrics";
import KNN3DLivePrediction from "../neighbors/KNN3DLivePrediction";

interface Props {
  rows: KNNRow[];
  evaluationRows: KNNRow[];
  scalingEnabled: boolean;
  queryFeatures: number[];
  featureNames: string[];
  k: number;
  distanceMetric: DistanceMetric;
  weighting: WeightingMethod;
  minkowskiP: number;
  xFeatureIndex: number;
  yFeatureIndex: number;
}

export default function KNNClassificationLab({
  rows,
  evaluationRows,
  scalingEnabled,
  queryFeatures,
  featureNames,
  k,
  distanceMetric,
  weighting,
  minkowskiP,
  xFeatureIndex,
  yFeatureIndex,
}: Props) {
  const prediction =
    useMemo(
      () =>
        predictClassification(
          rows,
          queryFeatures,
          k,
          distanceMetric,
          weighting,
          minkowskiP,
        ),
      [
        rows,
        queryFeatures,
        k,
        distanceMetric,
        weighting,
        minkowskiP,
      ],
    );

  /*
   * IMPORTANT:
   *
   * Evaluation starts from RAW rows.
   *
   * We split first.
   * Then the scaler is fitted ONLY on training data.
   *
   * This prevents train/test data leakage.
   */
  const evaluation =
    useMemo(() => {
      const split =
        splitClassificationDataset(
          evaluationRows,
          0.75,
        );

      if (
        split.train.length === 0 ||
        split.test.length === 0
      ) {
        return null;
      }

      let trainingRows =
        split.train;

      let testRows =
        split.test;

      if (
        scalingEnabled
      ) {
        const trainScalers =
          createScalers(
            split.train,
          );

        trainingRows =
          standardizeRows(
            split.train,
            trainScalers,
          );

        testRows =
          standardizeRows(
            split.test,
            trainScalers,
          );
      }

      const safeK =
        Math.max(
          1,
          Math.min(
            k,
            trainingRows.length,
          ),
        );

      return evaluateClassification(
        trainingRows,
        testRows,
        safeK,
        distanceMetric,
        weighting,
        minkowskiP,
      );
    }, [
      evaluationRows,
      scalingEnabled,
      k,
      distanceMetric,
      weighting,
      minkowskiP,
    ]);

  return (
    <>
      {featureNames.length >= 2 && (
        <KNN3DLivePrediction
          rows={rows}
          queryFeatures={
            queryFeatures
          }
          featureNames={
            featureNames
          }
          task="classification"
          k={k}
          distanceMetric={
            distanceMetric
          }
          weighting={
            weighting
          }
          minkowskiP={
            minkowskiP
          }
          xFeatureIndex={
            xFeatureIndex
          }
          yFeatureIndex={
            yFeatureIndex
          }
        />
      )}

      <ClassificationVoting
        prediction={prediction}
        weighting={weighting}
      />

      {evaluation ? (
        <ClassificationMetrics
          metrics={
            evaluation.metrics
          }
        />
      ) : (
        <section className="knn-card">
          <h2>
            Classification Metrics
          </h2>

          <p className="knn-muted">
            More data is required
            to create a train/test
            evaluation.
          </p>
        </section>
      )}
    </>
  );
}