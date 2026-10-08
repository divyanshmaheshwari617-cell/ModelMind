
"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";

import type {
  SurfaceResponse,
} from "@/lib/api/polynomialApi";

const Plot = dynamic(
  () => import("react-plotly.js"),
  { ssr: false }
);

interface Props {
  result: SurfaceResponse;
}

export default function Polynomial3DChart({
  result,
}: Props) {
  const { surface } = result;

  const traces: Data[] = [
    {
      type: "surface",
      name: "Predicted polynomial surface",
      x: surface.x,
      y: surface.y,
      z: surface.z,
      opacity: 0.8,
      colorscale: [
        [0, "#2563eb"],
        [0.5, "#7c3aed"],
        [1, "#22d3ee"],
      ],
      showscale: true,
      colorbar: {
        title: { text: "Prediction" },
        tickfont: { color: "#cbd5e1" },
      },
      hovertemplate:
        "X: %{x:.3f}<br>Y: %{y:.3f}<br>Prediction: %{z:.3f}<extra></extra>",
    },
    {
      type: "scatter3d",
      mode: "markers",
      name: "Observed data",
      x: surface.observed_points.map((p) => p.x),
      y: surface.observed_points.map((p) => p.y),
      z: surface.observed_points.map((p) => p.z),
      marker: {
        size: 4,
        color: "#f8fafc",
        opacity: 0.85,
        line: {
          color: "#0f172a",
          width: 1,
        },
      },
      hovertemplate:
        "X: %{x:.3f}<br>Y: %{y:.3f}<br>Actual: %{z:.3f}<extra></extra>",
    },
  ];

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#cbd5e1" },
    margin: { l: 0, r: 0, t: 15, b: 0 },
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0,
      y: 1,
    },
    scene: {
      bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        title: { text: surface.x_feature },
        color: "#94a3b8",
        gridcolor: "#334155",
      },
      yaxis: {
        title: { text: surface.y_feature },
        color: "#94a3b8",
        gridcolor: "#334155",
      },
      zaxis: {
        title: { text: "Target / Prediction" },
        color: "#94a3b8",
        gridcolor: "#334155",
      },
      camera: {
        eye: { x: 1.6, y: 1.6, z: 1.1 },
      },
    },
  };

  return (
    <div className="h-[560px] w-full">
      <Plot
        data={traces}
        layout={layout}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
        }}
        useResizeHandler
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
