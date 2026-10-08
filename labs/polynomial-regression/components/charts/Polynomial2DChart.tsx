
"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";
import type { PolynomialDataPoint } from
  "@/lib/datasets/polynomialDatasets";
import type { FittedPolynomial } from
  "@/lib/polynomial/polynomialEngine";

const Plot = dynamic(
  () => import("react-plotly.js"),
  { ssr: false }
);

interface Props {
  points: PolynomialDataPoint[];
  model: FittedPolynomial;
  showResiduals: boolean;
}

export default function Polynomial2DChart({
  points,
  model,
  showResiduals,
}: Props) {
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);

  const curveX = Array.from(
    { length: 250 },
    (_, i) => minX + (i / 249) * (maxX - minX)
  );

  const curveY = curveX.map(model.predict);

  const traces: Data[] = [
    {
      type: "scatter",
      mode: "markers",
      name: "Observed data",
      x: xValues,
      y: yValues,
      marker: {
        size: 8,
        color: "#38bdf8",
        opacity: 0.85,
        line: { color: "#e0f2fe", width: 0.6 },
      },
      hovertemplate:
        "X: %{x:.3f}<br>Y: %{y:.3f}<extra></extra>",
    },
    {
      type: "scatter",
      mode: "lines",
      name: `Degree ${model.degree} fit`,
      x: curveX,
      y: curveY,
      line: {
        color: "#a78bfa",
        width: 4,
      },
      hovertemplate:
        "X: %{x:.3f}<br>Prediction: %{y:.3f}<extra></extra>",
    },
  ];

  if (showResiduals) {
    const residualX: number[] = [];
    const residualY: number[] = [];

    points.forEach((point) => {
      residualX.push(point.x, point.x, NaN);
      residualY.push(
        point.y,
        model.predict(point.x),
        NaN
      );
    });

    traces.push({
      type: "scatter",
      mode: "lines",
      name: "Residuals",
      x: residualX,
      y: residualY,
      line: {
        color: "#fb7185",
        width: 1.5,
        dash: "dot",
      },
      hoverinfo: "skip",
    });
  }

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#94a3b8" },
    margin: { l: 55, r: 20, t: 25, b: 55 },
    hovermode: "closest",
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0,
      y: 1.12,
      font: { color: "#cbd5e1" },
    },
    xaxis: {
      title: { text: "Input feature (X)" },
      gridcolor: "#1e293b",
      zerolinecolor: "#334155",
    },
    yaxis: {
      title: { text: "Target (Y)" },
      gridcolor: "#1e293b",
      zerolinecolor: "#334155",
    },
  };

  return (
    <div className="h-[460px] w-full">
      <Plot
        data={traces}
        layout={layout}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
          modeBarButtonsToRemove: [
            "lasso2d",
            "select2d",
          ],
        }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
