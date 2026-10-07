import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import type {
  DistanceMetric,
  KNNRow,
  KNNTask,
  WeightingMethod,
} from "../types/knn";

import {
  calculateDistance,
  findNearestNeighbors,
  predictClassification,
  predictRegression,
} from "../utils/knnMath";

interface Props {
  rows: KNNRow[];
  queryFeatures: number[];
  featureNames: string[];
  task: KNNTask;
  k: number;
  distanceMetric: DistanceMetric;
  weighting: WeightingMethod;
  minkowskiP: number;
  xFeatureIndex: number;
  yFeatureIndex: number;
}

export default function KNN3DLivePrediction({
  rows,
  queryFeatures,
  featureNames,
  task,
  k,
  distanceMetric,
  weighting,
  minkowskiP,
  xFeatureIndex,
  yFeatureIndex,
}: Props) {
  const [step, setStep] =
    useState(0);

  const [playing, setPlaying] =
    useState(false);

  const rankedRows =
    useMemo(() => {
      return rows
        .map((row, index) => ({
          row,
          index,

          distance:
            calculateDistance(
              row.features,
              queryFeatures,
              distanceMetric,
              minkowskiP,
            ),
        }))
        .sort(
          (a, b) =>
            a.distance -
            b.distance,
        );
    }, [
      rows,
      queryFeatures,
      distanceMetric,
      minkowskiP,
    ]);

  const safeK =
    Math.max(
      1,
      Math.min(k, rows.length),
    );

  const neighbors =
    useMemo(
      () =>
        findNearestNeighbors(
          rows,
          queryFeatures,
          safeK,
          distanceMetric,
          weighting,
          minkowskiP,
        ),
      [
        rows,
        queryFeatures,
        safeK,
        distanceMetric,
        weighting,
        minkowskiP,
      ],
    );

  const classificationPrediction =
    useMemo(
      () =>
        task === "classification"
          ? predictClassification(
              rows,
              queryFeatures,
              safeK,
              distanceMetric,
              weighting,
              minkowskiP,
            )
          : null,
      [
        task,
        rows,
        queryFeatures,
        safeK,
        distanceMetric,
        weighting,
        minkowskiP,
      ],
    );

  const regressionPrediction =
    useMemo(
      () =>
        task === "regression"
          ? predictRegression(
              rows,
              queryFeatures,
              safeK,
              distanceMetric,
              weighting,
              minkowskiP,
            )
          : null,
      [
        task,
        rows,
        queryFeatures,
        safeK,
        distanceMetric,
        weighting,
        minkowskiP,
      ],
    );

  /*
    Animation stages

    0 = Query
    1 = Calculate all distances
    2 = Rank distances
    3.. = Reveal K nearest neighbors
    K + 3 = Final prediction
  */
  const finalStep =
    safeK + 3;

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [
    rows,
    queryFeatures,
    safeK,
    distanceMetric,
    weighting,
    minkowskiP,
  ]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    if (step >= finalStep) {
      setPlaying(false);
      return;
    }

    const timer =
      window.setTimeout(() => {
        setStep((current) =>
          Math.min(
            current + 1,
            finalStep,
          ),
        );
      }, 850);

    return () =>
      window.clearTimeout(timer);
  }, [
    playing,
    step,
    finalStep,
  ]);

  const showDistances =
    step >= 1;

  const showRanking =
    step >= 2;

  const revealedNeighborCount =
    Math.max(
      0,
      Math.min(
        safeK,
        step - 2,
      ),
    );

  const predictionReady =
    step >= finalStep;

  const revealedNeighbors =
    neighbors.slice(
      0,
      revealedNeighborCount,
    );

  const selectedIndexes =
    new Set(
      revealedNeighbors.map(
        (neighbor) =>
          neighbor.index,
      ),
    );

  const traces: any[] = [];

  traces.push({
    type: "scatter3d",
    mode: "markers",

    name: "Training samples",

    x: rankedRows.map(
      (item) =>
        item.row.features[
          xFeatureIndex
        ],
    ),

    y: rankedRows.map(
      (item) =>
        item.row.features[
          yFeatureIndex
        ],
    ),

    z: rankedRows.map(
      (item) =>
        showDistances
          ? item.distance
          : 0,
    ),

    text: rankedRows.map(
      (item, index) =>
        `Target: ${String(
          item.row.target,
        )}<br>` +
        `${
          showRanking
            ? `Distance rank: #${
                index + 1
              }<br>`
            : ""
        }` +
        `Distance: ${
          showDistances
            ? item.distance.toFixed(
                5,
              )
            : "calculating..."
        }`,
    ),

    hoverinfo: "text",

    marker: {
      size: rankedRows.map(
        (item) =>
          selectedIndexes.has(
            item.index,
          )
            ? 9
            : 5,
      ),

      opacity: 0.72,
    },
  });

  if (showDistances) {
    revealedNeighbors.forEach(
      (neighbor) => {
        const x =
          neighbor.row.features[
            xFeatureIndex
          ];

        const y =
          neighbor.row.features[
            yFeatureIndex
          ];

        traces.push({
          type: "scatter3d",
          mode: "lines",

          name:
            `Distance to #${neighbor.rank}`,

          showlegend: false,

          x: [
            queryFeatures[
              xFeatureIndex
            ],
            x,
          ],

          y: [
            queryFeatures[
              yFeatureIndex
            ],
            y,
          ],

          z: [
            0,
            neighbor.distance,
          ],

          line: {
            width: 5,
            dash: "dot",
          },

          hoverinfo: "skip",
        });

        traces.push({
          type: "scatter3d",
          mode: "markers+text",

          name:
            `Neighbor #${neighbor.rank}`,

          x: [x],
          y: [y],

          z: [
            neighbor.distance,
          ],

          text: [
            `#${neighbor.rank}`,
          ],

          textposition:
            "top center",

          hovertext: [
            `Neighbor #${neighbor.rank}` +
              `<br>Target: ${String(
                neighbor.row.target,
              )}` +
              `<br>Distance: ${neighbor.distance.toFixed(
                5,
              )}` +
              `<br>Weight: ${neighbor.weight.toFixed(
                5,
              )}`,
          ],

          hoverinfo: "text",

          marker: {
            size: 10,
            symbol: "circle",
          },
        });
      },
    );
  }

  traces.push({
    type: "scatter3d",
    mode: "markers+text",

    name: "Query",

    x: [
      queryFeatures[
        xFeatureIndex
      ],
    ],

    y: [
      queryFeatures[
        yFeatureIndex
      ],
    ],

    z: [0],

    text: ["QUERY"],

    textposition:
      "top center",

    marker: {
      size: 12,
      symbol: "diamond",
    },

    hovertemplate:
      "Query point<extra></extra>",
  });

  const stageTitle =
    step === 0
      ? "Step 1 — New query point"
      : step === 1
        ? "Step 2 — Calculate distances"
        : step === 2
          ? "Step 3 — Rank all samples"
          : !predictionReady
            ? `Step 4 — Select neighbor #${revealedNeighborCount}`
            : "Step 5 — Make the prediction";

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            LIVE 3D ALGORITHM LAB
          </p>

          <h2>
            How KNN Makes One Prediction
          </h2>

          <p className="knn-muted">
            Follow the complete KNN
            prediction process from the
            query point to the final
            result.
          </p>
        </div>

        <span className="knn-badge">
          {stageTitle}
        </span>
      </div>

      <div className="knn-info-box">
        <strong>
          What does the Z-axis mean?
        </strong>

        <p>
          X and Y are the two selected
          input features. Z represents
          the calculated distance from
          each training sample to the
          query point. It is not a third
          input feature.
        </p>
      </div>

      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 650,

          margin: {
            l: 20,
            r: 20,
            t: 30,
            b: 20,
          },

          paper_bgcolor:
            "transparent",

          font: {
            color: "#dce6ff",
          },

          scene: {
            xaxis: {
              title: {
                text:
                  featureNames[
                    xFeatureIndex
                  ] ?? "Feature 1",
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            yaxis: {
              title: {
                text:
                  featureNames[
                    yFeatureIndex
                  ] ?? "Feature 2",
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            zaxis: {
              title: {
                text:
                  "Distance to Query",
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            camera: {
              eye: {
                x: 1.55,
                y: 1.55,
                z: 1.2,
              },
            },
          },

          legend: {
            orientation: "h",
          },
        }}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
        }}
        style={{
          width: "100%",
        }}
      />

      <div className="knn-animation-controls">
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setStep(0);
          }}
        >
          Reset
        </button>

        <button
          type="button"
          disabled={step <= 0}
          onClick={() => {
            setPlaying(false);

            setStep((current) =>
              Math.max(
                0,
                current - 1,
              ),
            );
          }}
        >
          Previous
        </button>

        <button
          type="button"
          onClick={() =>
            setPlaying(
              (current) =>
                !current,
            )
          }
        >
          {playing
            ? "Pause"
            : "Play"}
        </button>

        <button
          type="button"
          disabled={
            step >= finalStep
          }
          onClick={() => {
            setPlaying(false);

            setStep((current) =>
              Math.min(
                finalStep,
                current + 1,
              ),
            );
          }}
        >
          Next
        </button>

        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setStep(finalStep);
          }}
        >
          Show Final Prediction
        </button>
      </div>

      {showRanking && (
        <div className="knn-card">
          <h3>
            Distance Ranking
          </h3>

          <div className="knn-stat-grid">
            {rankedRows
              .slice(
                0,
                Math.min(
                  rankedRows.length,
                  8,
                ),
              )
              .map(
                (item, index) => (
                  <div
                    className="knn-stat"
                    key={item.index}
                  >
                    <span>
                      #{index + 1} —{" "}
                      {String(
                        item.row.target,
                      )}
                    </span>

                    <strong>
                      {item.distance.toFixed(
                        4,
                      )}
                    </strong>
                  </div>
                ),
              )}
          </div>
        </div>
      )}

      {revealedNeighbors.length >
        0 && (
        <div className="knn-card">
          <h3>
            Selected K Nearest Neighbors
          </h3>

          <div className="knn-stat-grid">
            {revealedNeighbors.map(
              (neighbor) => (
                <div
                  className="knn-stat"
                  key={
                    neighbor.index
                  }
                >
                  <span>
                    Neighbor #
                    {neighbor.rank}
                  </span>

                  <strong>
                    {String(
                      neighbor.row
                        .target,
                    )}
                  </strong>

                  <span>
                    d ={" "}
                    {neighbor.distance.toFixed(
                      4,
                    )}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {predictionReady &&
        task ===
          "classification" &&
        classificationPrediction && (
          <div className="knn-concept-box">
            <strong>
              Final Classification
              Prediction
            </strong>

            <p>
              K = {safeK}
              {" → "}
              {classificationPrediction.votes
                .map(
                  (vote) =>
                    `${String(
                      vote.classLabel,
                    )}: ${
                      weighting ===
                      "distance"
                        ? vote.weightedVotes.toFixed(
                            2,
                          )
                        : vote.votes
                    }`,
                )
                .join(" | ")}
            </p>

            <h3>
              Prediction ={" "}
              {String(
                classificationPrediction.predictedClass,
              )}
            </h3>
          </div>
        )}

      {predictionReady &&
        task === "regression" &&
        regressionPrediction && (
          <div className="knn-concept-box">
            <strong>
              Final Regression Prediction
            </strong>

            <p>
              ModelMind uses the target
              values of the selected K
              neighbors and applies{" "}
              {weighting === "uniform"
                ? "ordinary averaging"
                : "distance-weighted averaging"}
              .
            </p>

            <h3>
              Prediction ={" "}
              {regressionPrediction.predictedValue.toFixed(
                4,
              )}
            </h3>
          </div>
        )}

      <div className="knn-info-box">
        <strong>
          Live behavior
        </strong>

        <p>
          Change K, move the query
          point, change the distance
          metric or switch between
          uniform and distance
          weighting. ModelMind
          recalculates the distances,
          nearest neighbors and
          prediction automatically.
        </p>
      </div>
    </section>
  );
}