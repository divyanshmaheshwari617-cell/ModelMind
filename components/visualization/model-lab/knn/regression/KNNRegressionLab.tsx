import {
  useMemo,
} from "react";

import Plot from "react-plotly.js";

import type {
  DistanceMetric,
  KNNRow,
  WeightingMethod,
} from "../types/knn";

import {
  createScalers,
  evaluateRegression,
  predictRegression,
  splitRegressionDataset,
  standardizeRows,
} from "../utils/knnMath";

import RegressionAveraging from "./RegressionAveraging";
import RegressionMetrics from "../metrics/RegressionMetrics";
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
}

export default function KNNRegressionLab({
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
}: Props) {
  const prediction =
    useMemo(
      () =>
        predictRegression(
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
   * Leakage-free evaluation:
   *
   * RAW rows
   *   ↓
   * train/test split
   *   ↓
   * scaler fitted on TRAIN only
   *   ↓
   * transform train + test
   *   ↓
   * evaluate KNN
   */
  const evaluation =
    useMemo(() => {
      const split =
        splitRegressionDataset(
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

      return evaluateRegression(
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

  const numericRows =
    rows.filter(
      (row) =>
        typeof row.target ===
        "number",
    );

  const yFeatureIndex =
    featureNames.length > 1
      ? xFeatureIndex === 0
        ? 1
        : 0
      : xFeatureIndex;

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
          task="regression"
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

      <RegressionAveraging
        prediction={prediction}
        weighting={weighting}
      />

      <section className="knn-card">
        <div className="knn-section-heading">
          <div>
            <p className="knn-eyebrow">
              REGRESSION VISUALIZATION
            </p>

            <h2>
              Local KNN Prediction
            </h2>
          </div>

          <span className="knn-badge">
            K = {k}
          </span>
        </div>

        <Plot
          data={[
            {
              type: "scatter",
              mode: "markers",
              name: "Dataset",

              x: numericRows.map(
                (row) =>
                  row.features[
                    xFeatureIndex
                  ],
              ),

              y: numericRows.map(
                (row) =>
                  row.target as number,
              ),

              marker: {
                size: 9,
              },
            },

            {
              type: "scatter",
              mode: "markers+text",
              name: "Prediction",

              x: [
                queryFeatures[
                  xFeatureIndex
                ],
              ],

              y: [
                prediction.predictedValue,
              ],

              text: [
                "Prediction",
              ],

              textposition:
                "top center",

              marker: {
                size: 15,
                symbol: "diamond",
              },
            },

            {
              type: "scatter",
              mode: "markers",
              name:
                "Selected Neighbors",

              x:
                prediction.neighbors.map(
                  (neighbor) =>
                    neighbor.row
                      .features[
                        xFeatureIndex
                      ],
                ),

              y:
                prediction.neighbors.map(
                  (neighbor) =>
                    Number(
                      neighbor.row
                        .target,
                    ),
                ),

              marker: {
                size: 15,
                symbol:
                  "circle-open",

                line: {
                  width: 3,
                },
              },
            },
          ]}
          layout={{
            autosize: true,
            height: 480,

            margin: {
              l: 70,
              r: 30,
              t: 30,
              b: 70,
            },

            paper_bgcolor:
              "transparent",

            plot_bgcolor:
              "transparent",

            font: {
              color: "#dce6ff",
            },

            xaxis: {
              title: {
                text:
                  featureNames[
                    xFeatureIndex
                  ] ??
                  "Feature",
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            yaxis: {
              title: {
                text:
                  "Target",
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },
          }}
          config={{
            responsive: true,
            displaylogo: false,
          }}
          style={{
            width: "100%",
          }}
        />

        {featureNames.length >
          1 && (
          <div className="knn-info-box">
            This plot displays one
            feature against the
            regression target. The KNN
            prediction itself still uses
            all selected features.
          </div>
        )}
      </section>

      {evaluation ? (
        <RegressionMetrics
          metrics={
            evaluation.metrics
          }
        />
      ) : (
        <section className="knn-card">
          <h2>
            Regression Metrics
          </h2>

          <p className="knn-muted">
            More data is required
            for train/test
            evaluation.
          </p>
        </section>
      )}
    </>
  );
}