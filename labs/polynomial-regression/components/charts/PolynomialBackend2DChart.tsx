
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";
import type { CurveResponse } from "@/lib/api/polynomialApi";

const Plot = dynamic(
  () => import("react-plotly.js"),
  { ssr: false }
);

interface Props {
  result: CurveResponse;
  showResiduals: boolean;
  featureName?: string;
  targetName?: string;
}

export default function PolynomialBackend2DChart({
  result,
  showResiduals,
  featureName = "x",
  targetName = "y",
}: Props) {
  const traces = useMemo<Data[]>(() => {
    const train = result.predictions.filter(
      (point) => point.split === "train"
    );

    const test = result.predictions.filter(
      (point) => point.split === "test"
    );

    const validX = (value: number | null | undefined) =>
      typeof value === "number" && Number.isFinite(value);

    const trainPoints = train.filter((point) =>
      validX(point.features[featureName])
    );

    const testPoints = test.filter((point) =>
      validX(point.features[featureName])
    );

    const modelName =
      result.model.regularization === "none"
        ? "Polynomial Regression (OLS)"
        : result.model.regularization === "ridge"
          ? "Ridge Regression (L2)"
          : "Lasso Regression (L1)";

    const resultTraces: Data[] = [
      {
        type: "scatter",
        mode: "lines",
        name: modelName,
        x: result.curve.map((point) => point.x),
        y: result.curve.map((point) => point.y),
        line: {
          color: "#a78bfa",
          width: 4,
        },
        hovertemplate:
          "Feature: %{x:.3f}<br>Prediction: %{y:.3f}<extra></extra>",
      },
      {
        type: "scatter",
        mode: "markers",
        name: "Training Data",
        x: trainPoints.map((point) => point.features[featureName]),
        y: trainPoints.map((point) => point.actual),
        marker: {
          color: "#38bdf8",
          size: 9,
          opacity: 0.85,
        },
        hovertemplate:
          "X: %{x:.3f}<br>Actual: %{y:.3f}<extra>Train</extra>",
      },
      {
        type: "scatter",
        mode: "markers",
        name: "Testing Data",
        x: testPoints.map((point) => point.features[featureName]),
        y: testPoints.map((point) => point.actual),
        marker: {
          color: "#fbbf24",
          size: 10,
          symbol: "diamond",
        },
        hovertemplate:
          "X: %{x:.3f}<br>Actual: %{y:.3f}<extra>Test</extra>",
      },
    ];

    if (showResiduals) {
      const residualX: Array<number | null> = [];
      const residualY: Array<number | null> = [];

      for (const point of result.predictions) {
        const x = point.features[featureName];

        if (!validX(x)) {
          continue;
        }

        residualX.push(x!, x!, null);
        residualY.push(
          point.actual,
          point.predicted,
          null
        );
      }

      resultTraces.push({
        type: "scatter",
        mode: "lines",
        name: "Residual Errors",
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

    return resultTraces;
  }, [result, showResiduals, featureName]);

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      color: "#cbd5e1",
    },
    margin: {
      l: 65,
      r: 25,
      t: 45,
      b: 65,
    },
    xaxis: {
      title: { text: featureName },
      gridcolor: "#1e293b",
      zerolinecolor: "#334155",
    },
    yaxis: {
      title: { text: targetName },
      gridcolor: "#1e293b",
      zerolinecolor: "#334155",
    },
    legend: {
      orientation: "h",
      y: 1.15,
    },
    hovermode: "closest",
  };

  return (
    <div className="h-[510px] w-full">
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
