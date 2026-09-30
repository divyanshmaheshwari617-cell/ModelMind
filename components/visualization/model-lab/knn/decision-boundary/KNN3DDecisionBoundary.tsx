import {
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
  predictClassification,
} from "../utils/knnMath";

interface Props {
  rows: KNNRow[];

  featureNames: string[];

  xFeatureIndex: number;

  yFeatureIndex: number;

  k: number;

  distanceMetric: DistanceMetric;

  weighting: WeightingMethod;

  minkowskiP: number;

  queryFeatures?: number[];
}

export default function KNN3DDecisionBoundary({
  rows,
  featureNames,
  xFeatureIndex,
  yFeatureIndex,
  k,
  distanceMetric,
  weighting,
  minkowskiP,
  queryFeatures,
}: Props) {
  const [
    showSurface,
    setShowSurface,
  ] = useState(true);

  const [
    showPoints,
    setShowPoints,
  ] = useState(true);

  const classes = useMemo(
    () =>
      Array.from(
        new Set(
          rows.map(
            (row) =>
              row.target,
          ),
        ),
      ),
    [rows],
  );

  const featureMeans =
    useMemo(() => {
      if (
        rows.length === 0
      ) {
        return [];
      }

      return rows[
        0
      ].features.map(
        (
          _,
          featureIndex,
        ) =>
          rows.reduce(
            (
              total,
              row,
            ) =>
              total +
              row.features[
                featureIndex
              ],
            0,
          ) /
          rows.length,
      );
    }, [rows]);

  const surface =
    useMemo(() => {
      if (
        rows.length === 0 ||
        classes.length < 2
      ) {
        return null;
      }

      const xValues =
        rows.map(
          (row) =>
            row.features[
              xFeatureIndex
            ],
        );

      const yValues =
        rows.map(
          (row) =>
            row.features[
              yFeatureIndex
            ],
        );

      const xMin =
        Math.min(
          ...xValues,
        );

      const xMax =
        Math.max(
          ...xValues,
        );

      const yMin =
        Math.min(
          ...yValues,
        );

      const yMax =
        Math.max(
          ...yValues,
        );

      const xSpan =
        Math.max(
          xMax - xMin,
          1,
        );

      const ySpan =
        Math.max(
          yMax - yMin,
          1,
        );

      const xPadding =
        xSpan * 0.1;

      const yPadding =
        ySpan * 0.1;

      /*
        45 x 45 = 2025 KNN
        predictions.

        Detailed enough for the
        educational visualization
        without making the browser
        unnecessarily heavy.
      */
      const gridSize = 45;

      const xGrid =
        Array.from(
          {
            length:
              gridSize,
          },
          (
            _,
            index,
          ) =>
            xMin -
            xPadding +
            (index /
              (gridSize -
                1)) *
              (xSpan +
                2 *
                  xPadding),
        );

      const yGrid =
        Array.from(
          {
            length:
              gridSize,
          },
          (
            _,
            index,
          ) =>
            yMin -
            yPadding +
            (index /
              (gridSize -
                1)) *
              (ySpan +
                2 *
                  yPadding),
        );

      const z =
        yGrid.map(
          (y) =>
            xGrid.map(
              (x) => {
                /*
                  When the dataset has
                  more than two
                  features, only two
                  are visualized.

                  The remaining
                  features are fixed
                  at their dataset
                  means.
                */
                const sample = [
                  ...featureMeans,
                ];

                sample[
                  xFeatureIndex
                ] = x;

                sample[
                  yFeatureIndex
                ] = y;

                const result =
                  predictClassification(
                    rows,
                    sample,
                    k,
                    distanceMetric,
                    weighting,
                    minkowskiP,
                  );

                return classes.indexOf(
                  result.predictedClass,
                );
              },
            ),
        );

      return {
        xGrid,
        yGrid,
        z,
      };
    }, [
      rows,
      classes,
      featureMeans,
      xFeatureIndex,
      yFeatureIndex,
      k,
      distanceMetric,
      weighting,
      minkowskiP,
    ]);

  if (
    rows.length === 0
  ) {
    return (
      <section className="knn-card">
        <h2>
          3D KNN Decision Surface
        </h2>

        <p className="knn-muted">
          Load a dataset to
          visualize the KNN
          decision surface.
        </p>
      </section>
    );
  }

  if (
    featureNames.length <
    2
  ) {
    return (
      <section className="knn-card">
        <h2>
          3D KNN Decision Surface
        </h2>

        <div className="knn-warning-box">
          Select at least two
          numerical features to
          create the 3D decision
          visualization.
        </div>
      </section>
    );
  }

  if (
    classes.length < 2
  ) {
    return (
      <section className="knn-card">
        <h2>
          3D KNN Decision Surface
        </h2>

        <div className="knn-warning-box">
          Classification requires
          at least two target
          classes.
        </div>
      </section>
    );
  }

  if (!surface) {
    return null;
  }

  const traces: any[] =
    [];

  if (showSurface) {
    traces.push({
      type: "surface",

      name:
        "KNN Decision Surface",

      x: surface.xGrid,

      y: surface.yGrid,

      z: surface.z,

      surfacecolor:
        surface.z,

      opacity: 0.58,

      showscale: true,

      colorbar: {
        title: {
          text:
            "Predicted Class",
        },

        tickmode:
          "array",

        tickvals:
          classes.map(
            (
              _,
              index,
            ) => index,
          ),

        ticktext:
          classes.map(
            (label) =>
              String(label),
          ),
      },

      hovertemplate:
        `${featureNames[
          xFeatureIndex
        ]}: %{x:.3f}<br>` +
        `${featureNames[
          yFeatureIndex
        ]}: %{y:.3f}<br>` +
        "Class index: %{z}<extra></extra>",
    });
  }

  if (showPoints) {
    classes.forEach(
      (
        classLabel,
        classIndex,
      ) => {
        const classRows =
          rows.filter(
            (row) =>
              row.target ===
              classLabel,
          );

        traces.push({
          type:
            "scatter3d",

          mode:
            "markers",

          name: `Class ${String(
            classLabel,
          )}`,

          x: classRows.map(
            (row) =>
              row.features[
                xFeatureIndex
              ],
          ),

          y: classRows.map(
            (row) =>
              row.features[
                yFeatureIndex
              ],
          ),

          /*
            Place actual points
            slightly above their
            corresponding class
            level so they remain
            visible over the
            decision surface.
          */
          z: classRows.map(
            () =>
              classIndex +
              0.08,
          ),

          text:
            classRows.map(
              (row) =>
                `Actual class: ${String(
                  row.target,
                )}`,
            ),

          hoverinfo:
            "text+x+y",

          marker: {
            size: 6,

            line: {
              width: 1,
            },
          },
        });
      },
    );
  }

  if (
    queryFeatures &&
    queryFeatures.length >
      Math.max(
        xFeatureIndex,
        yFeatureIndex,
      )
  ) {
    const queryPrediction =
      predictClassification(
        rows,
        queryFeatures,
        k,
        distanceMetric,
        weighting,
        minkowskiP,
      );

    const queryClassIndex =
      classes.indexOf(
        queryPrediction.predictedClass,
      );

    traces.push({
      type:
        "scatter3d",

      mode:
        "markers+text",

      name:
        "Query Point",

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

      z: [
        queryClassIndex +
          0.2,
      ],

      text: [
        `QUERY → ${String(
          queryPrediction.predictedClass,
        )}`,
      ],

      textposition:
        "top center",

      marker: {
        size: 10,

        symbol:
          "diamond",
      },

      hovertemplate:
        `Query<br>${featureNames[
          xFeatureIndex
        ]}: %{x:.3f}<br>` +
        `${featureNames[
          yFeatureIndex
        ]}: %{y:.3f}<br>` +
        `Prediction: ${String(
          queryPrediction.predictedClass,
        )}<extra></extra>`,
    });
  }

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            3D MODEL LAB
          </p>

          <h2>
            KNN Decision Surface
          </h2>

          <p className="knn-muted">
            Rotate, zoom and inspect
            how KNN divides feature
            space into predicted
            classes.
          </p>
        </div>

        <span className="knn-badge">
          K = {k}
        </span>
      </div>

      <div className="knn-choice-grid">
        <button
          type="button"
          className={
            showSurface
              ? "knn-choice active"
              : "knn-choice"
          }
          onClick={() =>
            setShowSurface(
              (current) =>
                !current,
            )
          }
        >
          <strong>
            Decision Surface
          </strong>

          <span>
            {showSurface
              ? "Visible"
              : "Hidden"}
          </span>
        </button>

        <button
          type="button"
          className={
            showPoints
              ? "knn-choice active"
              : "knn-choice"
          }
          onClick={() =>
            setShowPoints(
              (current) =>
                !current,
            )
          }
        >
          <strong>
            Training Points
          </strong>

          <span>
            {showPoints
              ? "Visible"
              : "Hidden"}
          </span>
        </button>
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
            color:
              "#dce6ff",
          },

          scene: {
            xaxis: {
              title: {
                text:
                  featureNames[
                    xFeatureIndex
                  ] ??
                  "Feature 1",
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
                  "Feature 2",
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            zaxis: {
              title: {
                text:
                  "Predicted Class",
              },

              tickmode:
                "array",

              tickvals:
                classes.map(
                  (
                    _,
                    index,
                  ) =>
                    index,
                ),

              ticktext:
                classes.map(
                  (label) =>
                    String(
                      label,
                    ),
                ),

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            camera: {
              eye: {
                x: 1.5,
                y: 1.5,
                z: 1.15,
              },
            },
          },

          legend: {
            orientation:
              "h",
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

      <div className="knn-stat-grid">
        <div className="knn-stat">
          <span>
            K
          </span>

          <strong>
            {k}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Distance
          </span>

          <strong>
            {distanceMetric}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Voting
          </span>

          <strong>
            {weighting}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Classes
          </span>

          <strong>
            {classes.length}
          </strong>
        </div>
      </div>

      <div className="knn-concept-box">
        <strong>
          Why is the KNN surface
          irregular?
        </strong>

        <p>
          Unlike linear models, KNN
          does not learn one straight
          decision line or plane.
          Different regions are
          classified according to the
          nearby training samples, so
          the boundary can bend around
          local groups of data.
        </p>
      </div>

      <div className="knn-info-box">
        <strong>
          What happens when K
          changes?
        </strong>

        <p>
          K = 1 can create very local
          and irregular regions.
          Increasing K usually makes
          the decision regions
          smoother because more
          neighbors participate in
          each prediction. An
          excessively large K can
          oversmooth the model and
          favor dominant classes.
        </p>
      </div>

      {featureNames.length >
        2 && (
        <div className="knn-warning-box">
          This visualization displays
          two selected features. The
          remaining features are held
          at their dataset mean values
          while ModelMind calculates
          the decision surface.
        </div>
      )}
    </section>
  );
}