import {
  useMemo,
} from "react";

import Plot from "react-plotly.js";

import type {
  SVMRow,
} from "../types/svm";

type Props = {
  rows: SVMRow[];
  labels: (-1 | 1)[];
  featureNames: [
    string,
    string
  ];
  gamma: number;
};

export default function KernelTransformation3D({
  rows,
  labels,
  featureNames,
  gamma,
}: Props) {
  const points =
    useMemo(
      () =>
        rows
          .filter(
            (row) =>
              row.features
                .length >= 2
          )
          .map(
            (
              row,
              index
            ) => {
              const x =
                row.features[0] ??
                0;

              const y =
                row.features[1] ??
                0;

              const radiusSquared =
                x * x +
                y * y;

              const radialFeature =
                Math.exp(
                  -gamma *
                    radiusSquared
                );

              return {
                x,
                y,
                z:
                  radialFeature,
                label:
                  labels[
                    index
                  ] ?? -1,
              };
            }
          ),
      [
        rows,
        labels,
        gamma,
      ]
    );

  const negative =
    points.filter(
      (point) =>
        point.label === -1
    );

  const positive =
    points.filter(
      (point) =>
        point.label === 1
    );

  return (
    <section
      style={{
        border:
          "1px solid #334155",
        borderRadius: 16,
        padding: 20,
        background:
          "#0f172a",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        3D Kernel
        Transformation
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        This educational
        visualization explicitly
        creates a radial third
        feature to demonstrate the
        intuition behind lifting
        nonlinear data into a
        higher-dimensional space.
        The actual RBF kernel does
        not explicitly create this
        single z coordinate.
      </p>

      <Plot
        data={[
          {
            x:
              negative.map(
                (p) => p.x
              ),
            y:
              negative.map(
                (p) => p.y
              ),
            z:
              negative.map(
                (p) => p.z
              ),
            type:
              "scatter3d",
            mode:
              "markers",
            name:
              "Class -1",
            marker: {
              size: 6,
            },
          },
          {
            x:
              positive.map(
                (p) => p.x
              ),
            y:
              positive.map(
                (p) => p.y
              ),
            z:
              positive.map(
                (p) => p.z
              ),
            type:
              "scatter3d",
            mode:
              "markers",
            name:
              "Class +1",
            marker: {
              size: 6,
            },
          },
        ]}
        layout={{
          autosize: true,
          height: 520,
          paper_bgcolor:
            "#020617",
          plot_bgcolor:
            "#020617",
          font: {
            color:
              "#cbd5e1",
          },
          margin: {
            l: 0,
            r: 0,
            t: 20,
            b: 0,
          },
          scene: {
            xaxis: {
              title: {
                text:
                  featureNames[
                    0
                  ],
              },
            },
            yaxis: {
              title: {
                text:
                  featureNames[
                    1
                  ],
              },
            },
            zaxis: {
              title: {
                text:
                  "Radial feature",
              },
            },
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

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 12,
          background:
            "#020617",
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        Current educational
        radial transformation:
        <div
          style={{
            fontFamily:
              "monospace",
            marginTop: 6,
            color:
              "#e2e8f0",
          }}
        >
          z =
          exp(-{gamma.toFixed(
            3
          )}
          (x₁² + x₂²))
        </div>

        <p
          style={{
            marginBottom: 0,
          }}
        >
          Rotate the plot to see
          how points that overlap
          in two dimensions may
          become easier to
          separate after a
          nonlinear
          transformation.
        </p>
      </div>
    </section>
  );
}