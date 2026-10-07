import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import type {
  DistanceMetric,
  KNNRow,
  WeightingMethod,
} from "../types/knn";

import {
  calculateDistance,
  findNearestNeighbors,
} from "../utils/knnMath";

interface Props {
  rows: KNNRow[];
  queryFeatures: number[];

  featureNames: string[];

  xFeatureIndex: number;
  yFeatureIndex: number;

  k: number;

  distanceMetric: DistanceMetric;
  weighting: WeightingMethod;

  minkowskiP: number;

  onNeighborsChange?: (
    neighbors: ReturnType<
      typeof findNearestNeighbors
    >,
  ) => void;
}

export default function NeighborSelectionVisualizer({
  rows,
  queryFeatures,
  featureNames,
  xFeatureIndex,
  yFeatureIndex,
  k,
  distanceMetric,
  weighting,
  minkowskiP,
  onNeighborsChange,
}: Props) {
  const [step, setStep] =
    useState(0);

  const [playing, setPlaying] =
    useState(false);

  const allRankedRows =
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

  const neighbors = useMemo(
    () =>
      findNearestNeighbors(
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

  useEffect(() => {
    onNeighborsChange?.(
      neighbors,
    );
  }, [
    neighbors,
    onNeighborsChange,
  ]);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [
    queryFeatures,
    k,
    distanceMetric,
    weighting,
    minkowskiP,
    rows,
  ]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    if (
      step >= neighbors.length
    ) {
      setPlaying(false);
      return;
    }

    const timer =
      window.setTimeout(() => {
        setStep(
          (current) =>
            Math.min(
              current + 1,
              neighbors.length,
            ),
        );
      }, 700);

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    playing,
    step,
    neighbors.length,
  ]);

  const visibleNeighbors =
    neighbors.slice(0, step);

  const selectedIndexes =
    new Set(
      visibleNeighbors.map(
        (neighbor) =>
          neighbor.index,
      ),
    );

  const ordinaryRows =
    allRankedRows.filter(
      (item) =>
        !selectedIndexes.has(
          item.index,
        ),
    );

  const traces: any[] = [
    {
      type: "scatter",
      mode: "markers",
      name: "Dataset",

      x: ordinaryRows.map(
        (item) =>
          item.row.features[
            xFeatureIndex
          ],
      ),

      y: ordinaryRows.map(
        (item) =>
          item.row.features[
            yFeatureIndex
          ],
      ),

      text: ordinaryRows.map(
        (item) =>
          `Target: ${String(
            item.row.target,
          )}<br>Distance: ${item.distance.toFixed(
            4,
          )}`,
      ),

      hoverinfo: "text",

      marker: {
        size: 10,
        opacity: 0.65,
      },
    },
  ];

  visibleNeighbors.forEach(
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
        type: "scatter",
        mode: "lines",

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

        line: {
          width: 2,
          dash: "dot",
        },

        hoverinfo: "skip",
      });

      traces.push({
        type: "scatter",
        mode: "markers+text",

        name: `Neighbor #${neighbor.rank}`,

        x: [x],
        y: [y],

        text: [
          `#${neighbor.rank}`,
        ],

        textposition: "top center",

        hovertext: [
          `Rank: #${neighbor.rank}<br>Target: ${String(
            neighbor.row.target,
          )}<br>Distance: ${neighbor.distance.toFixed(
            5,
          )}`,
        ],

        hoverinfo: "text",

        marker: {
          size: 16,
          symbol: "circle-open",
          line: {
            width: 4,
          },
        },
      });
    },
  );

  traces.push({
    type: "scatter",
    mode: "markers+text",

    name: "Query Point",

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

    text: ["QUERY"],

    textposition: "top center",

    marker: {
      size: 20,
      symbol: "star",
    },
  });

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            INTERACTIVE VISUALIZATION
          </p>

          <h2>
            How KNN Finds Neighbors
          </h2>
        </div>

        <span className="knn-badge">
          {step}/{neighbors.length}
        </span>
      </div>

      {featureNames.length < 2 ? (
        <div className="knn-warning-box">
          Select at least two features
          to display the 2D neighbor
          visualization.
        </div>
      ) : (
        <Plot
          data={traces}
          layout={{
            autosize: true,

            height: 520,

            margin: {
              l: 60,
              r: 30,
              t: 40,
              b: 60,
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
                  "Feature X",
              },
              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            yaxis: {
              title: {
                text:
                  featureNames[
                    yFeatureIndex
                  ] ??
                  "Feature Y",
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            legend: {
              orientation: "h",
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
      )}

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

            setStep(
              (current) =>
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
            step >=
            neighbors.length
          }
          onClick={() => {
            setPlaying(false);

            setStep(
              (current) =>
                Math.min(
                  neighbors.length,
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

            setStep(
              neighbors.length,
            );
          }}
        >
          Show K Neighbors
        </button>
      </div>

      <div className="knn-info-box">
        <strong>
          What are you watching?
        </strong>

        <p>
          ModelMind reveals the selected
          neighbors in distance order.
          The dataset points remain fixed;
          connection lines show which
          samples become the nearest
          neighbors of the query point.
        </p>
      </div>
    </section>
  );
}