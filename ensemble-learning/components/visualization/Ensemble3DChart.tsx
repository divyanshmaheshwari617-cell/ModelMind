
"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  Box,
  Eye,
  EyeOff,
  Info,
  Maximize2,
  RotateCcw,
} from "lucide-react";

import type { Data, Layout, Config } from "plotly.js";
import type {
  EnsemblePlotPoint,
  EnsembleTrainingResponse,
} from "@/lib/api/ensembleApi";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center text-sm text-slate-400">
      Preparing interactive 3D visualization...
    </div>
  ),
});

interface Props {
  result: EnsembleTrainingResponse;
}

const CLASS_COLORS = [
  "#818cf8",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#22d3ee",
  "#facc15",
  "#a78bfa",
  "#f87171",
];

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";

function format(value: number | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return Number(value.toPrecision(5)).toString();
}

function validPoints(
  points: EnsemblePlotPoint[],
): EnsemblePlotPoint[] {
  return points.filter(
    (point) =>
      point.x !== null &&
      Number.isFinite(point.x) &&
      point.y !== null &&
      point.y !== undefined &&
      Number.isFinite(point.y) &&
      point.actual !== null &&
      Number.isFinite(point.actual),
  );
}

function classColor(
  label: number,
  labels: number[],
): string {
  const index = labels.indexOf(label);

  return CLASS_COLORS[
    Math.max(index, 0) % CLASS_COLORS.length
  ];
}

export default function Ensemble3DChart({
  result,
}: Props) {
  const [showSurface, setShowSurface] = useState(true);
  const [showTrain, setShowTrain] = useState(true);
  const [showTest, setShowTest] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [cameraRevision, setCameraRevision] = useState(0);
  const [opacity, setOpacity] = useState(0.7);

  const visualization = result.visualization;

  const isClassification =
    result.task === "classification";

  const hasSurface =
    visualization.y_feature !== null &&
    Array.isArray(visualization.z_values) &&
    visualization.z_values.length > 0;

  const trainPoints = useMemo(
    () => validPoints(visualization.train_points),
    [visualization.train_points],
  );

  const testPoints = useMemo(
    () => validPoints(visualization.test_points),
    [visualization.test_points],
  );

  const classLabels = useMemo(() => {
    if (!isClassification) return [];

    const labels = new Set<number>();

    visualization.z_values?.forEach((row) =>
      row.forEach((label) => {
        if (Number.isFinite(label)) {
          labels.add(label);
        }
      }),
    );

    trainPoints.forEach((point) => {
      if (point.actual !== null) {
        labels.add(point.actual);
      }
    });

    testPoints.forEach((point) => {
      if (point.actual !== null) {
        labels.add(point.actual);
      }
    });

    return [...labels].sort((a, b) => a - b);
  }, [
    isClassification,
    visualization.z_values,
    trainPoints,
    testPoints,
  ]);

  const traces = useMemo<Data[]>(() => {
    if (!hasSurface) return [];

    const tracesList: Data[] = [];
    const zValues = visualization.z_values ?? [];

    if (showSurface) {
      if (isClassification) {
        const classIndices = zValues.map((row) =>
          row.map((label) =>
            Math.max(0, classLabels.indexOf(label)),
          ),
        );

        const colorScale: Array<[number, string]> = [];
        const count = Math.max(1, classLabels.length);

        for (let index = 0; index < count; index++) {
          const start = index / count;
          const end = (index + 1) / count;

          const color =
            CLASS_COLORS[index % CLASS_COLORS.length];

          colorScale.push([start, color]);
          colorScale.push([end, color]);
        }

        // Classification uses a flat XY plane whose
        // color indicates the predicted class.
        // Class IDs are categories, not continuous height.
        tracesList.push({
          type: "surface",
          x: visualization.x_values,
          y: visualization.y_values,
          z: zValues.map((row) => row.map(() => 0)),
          surfacecolor: classIndices,
          colorscale: colorScale,
          cmin: -0.5,
          cmax: Math.max(0.5, count - 0.5),
          showscale: false,
          opacity,
          name: "Predicted class regions",
          hovertemplate:
            `${visualization.x_feature}: %{x:.3f}` +
            `<br>${visualization.y_feature}: %{y:.3f}` +
            "<br>Predicted class index: %{surfacecolor:.0f}" +
            "<extra></extra>",
          contours: {
            x: { show: false },
            y: { show: false },
            z: { show: false },
          },
        } as Data);
      } else {
        tracesList.push({
          type: "surface",
          x: visualization.x_values,
          y: visualization.y_values,
          z: zValues,
          colorscale: [
            [0, "#2563eb"],
            [0.28, "#06b6d4"],
            [0.5, "#8b5cf6"],
            [0.75, "#ec4899"],
            [1, "#f59e0b"],
          ],
          opacity,
          name: "Prediction surface",
          showscale: true,
          colorbar: {
            title: { text: "Prediction" },
            thickness: 12,
            len: 0.7,
            tickfont: { color: "#cbd5e1" },
          },
          hovertemplate:
            `${visualization.x_feature}: %{x:.3f}` +
            `<br>${visualization.y_feature}: %{y:.3f}` +
            `<br>Prediction: %{z:.3f}` +
            "<extra></extra>",
        } as Data);
      }
    }

    function addPoints(
      points: EnsemblePlotPoint[],
      datasetLabel: string,
      isTest: boolean,
    ) {
      if (points.length === 0) return;

      if (isClassification) {
        for (const label of classLabels) {
          const selected = points.filter(
            (point) => point.actual === label,
          );

          if (selected.length === 0) continue;

          tracesList.push({
            type: "scatter3d",
            mode: "markers",
            x: selected.map((point) => point.x),
            y: selected.map((point) => point.y),
            z: selected.map(() => (isTest ? 0.12 : 0.06)),
            name: `${datasetLabel} · Class ${label}`,
            marker: {
              size: isTest ? 5.5 : 3.5,
              color: classColor(label, classLabels),
              symbol: isTest ? "diamond" : "circle",
              opacity: isTest ? 1 : 0.75,
              line: {
                color: "#0f172a",
                width: 1,
              },
            },
            text: selected.map(
              (point) =>
                `Actual class: ${format(point.actual)}` +
                (point.predicted === undefined
                  ? ""
                  : `<br>Predicted: ${format(point.predicted)}`),
            ),
            hovertemplate:
              `${visualization.x_feature}: %{x:.3f}` +
              `<br>${visualization.y_feature}: %{y:.3f}` +
              "<br>%{text}<extra></extra>",
          } as Data);
        }
      } else {
        tracesList.push({
          type: "scatter3d",
          mode: "markers",
          x: points.map((point) => point.x),
          y: points.map((point) => point.y),
          z: points.map((point) => point.actual),
          name: datasetLabel,
          marker: {
            size: isTest ? 5 : 3,
            color: isTest ? "#fbbf24" : "#38bdf8",
            opacity: isTest ? 1 : 0.75,
          },
          text: points.map(
            (point) =>
              `Actual target: ${format(point.actual)}` +
              (point.predicted === undefined
                ? ""
                : `<br>Predicted: ${format(point.predicted)}`),
          ),
          hovertemplate:
            `${visualization.x_feature}: %{x:.3f}` +
            `<br>${visualization.y_feature}: %{y:.3f}` +
            "<br>%{text}<extra></extra>",
        } as Data);
      }
    }

    if (showTrain) {
      addPoints(trainPoints, "Training data", false);
    }

    if (showTest) {
      addPoints(testPoints, "Test data", true);
    }

    return tracesList;
  }, [
    hasSurface,
    visualization,
    isClassification,
    classLabels,
    opacity,
    showSurface,
    showTrain,
    showTest,
    trainPoints,
    testPoints,
  ]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      paper_bgcolor: "#020817",
      plot_bgcolor: "#020817",
      font: {
        color: "#cbd5e1",
        family: "Arial, sans-serif",
      },
      margin: {
        l: 5,
        r: 5,
        t: 10,
        b: 5,
      },
      showlegend: true,
      legend: {
        orientation: "h",
        x: 0,
        y: -0.05,
        font: { size: 11 },
      },
      scene: {
        bgcolor: "#020817",
        xaxis: {
          title: { text: visualization.x_feature },
          color: "#cbd5e1",
          gridcolor: "#334155",
          backgroundcolor: "#0f172a",
          showbackground: true,
        },
        yaxis: {
          title: {
            text: visualization.y_feature ?? "Feature 2",
          },
          color: "#cbd5e1",
          gridcolor: "#334155",
          backgroundcolor: "#0f172a",
          showbackground: true,
        },
        zaxis: {
          title: {
            text: isClassification
              ? "Class region plane"
              : result.dataset.target,
          },
          color: "#cbd5e1",
          gridcolor: "#334155",
          backgroundcolor: "#0f172a",
          showbackground: true,
          ...(isClassification
            ? { range: [-0.08, 0.3] as [number, number] }
            : {}),
        },
        camera: {
          eye: { x: 1.6, y: 1.6, z: 1.05 },
        },
        aspectmode: isClassification ? "manual" : "auto",
        ...(isClassification
          ? {
              aspectratio: {
                x: 1,
                y: 1,
                z: 0.15,
              },
            }
          : {}),
      },
      uirevision: `ensemble-3d-camera-${cameraRevision}`,
    }),
    [
      visualization.x_feature,
      visualization.y_feature,
      result.dataset.target,
      isClassification,
      cameraRevision,
    ],
  );

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
    modeBarButtonsToRemove: [
      "toImage",
      "sendChartToCloud",
    ],
  };

  if (!hasSurface) {
    return (
      <section className={panel}>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Box size={21} className="text-violet-400" />
          Interactive 3D Visualization
        </h2>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Select at least two input features and train the
          model to generate a 3D surface. A single-feature
          dataset can still be explored in the 2D chart.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`${panel} ${
        expanded
          ? "fixed inset-3 z-50 overflow-auto bg-[#080d19] shadow-2xl"
          : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Box size={21} className="text-violet-400" />
            <h2 className="text-xl font-bold">
              Interactive 3D Model Visualization
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {isClassification
              ? "Explore predicted classification regions in 3D space."
              : "Explore the fitted nonlinear regression surface."}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setCameraRevision((value) => value + 1)
            }
            title="Reset camera"
            className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-violet-500"
          >
            <RotateCcw size={17} />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Exit expanded view" : "Expand"}
            className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-violet-500"
          >
            <Maximize2 size={17} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          {
            label: "Prediction Surface",
            value: showSurface,
            setter: setShowSurface,
          },
          {
            label: "Training Points",
            value: showTrain,
            setter: setShowTrain,
          },
          {
            label: "Test Points",
            value: showTest,
            setter: setShowTest,
          },
        ].map((control) => (
          <button
            key={control.label}
            type="button"
            onClick={() =>
              control.setter(!control.value)
            }
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
              control.value
                ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                : "border-slate-700 bg-slate-950 text-slate-400"
            }`}
          >
            {control.value
              ? <Eye size={14} />
              : <EyeOff size={14} />}
            {control.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
        <label
          htmlFor="ensemble-3d-opacity"
          className="text-xs text-slate-300"
        >
          Surface Opacity
        </label>

        <input
          id="ensemble-3d-opacity"
          type="range"
          min={0.15}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(event) =>
            setOpacity(Number(event.target.value))
          }
          className="w-40 accent-violet-500"
        />

        <span className="font-mono text-xs text-violet-300">
          {Math.round(opacity * 100)}%
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-[#020817]">
        <Plot
          data={traces}
          layout={layout}
          config={config}
          useResizeHandler
          style={{
            width: "100%",
            height: expanded ? "80vh" : "560px",
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span>Drag to rotate</span>
        <span>Scroll to zoom</span>
        <span>Drag with right-click to pan</span>
      </div>

      {isClassification && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {classLabels.map((label) => (
            <span
              key={label}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: classColor(
                    label,
                    classLabels,
                  ),
                }}
              />
              Class {format(label)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <Info
          size={17}
          className="mt-0.5 shrink-0 text-sky-400"
        />

        <p className="text-xs leading-6 text-slate-300">
          {isClassification
            ? "The horizontal prediction plane is colored by the fitted model's predicted classes. Training and test samples appear slightly above the plane for visibility. Class labels represent categories, not continuous numerical heights."
            : "The surface represents fitted model predictions. Sample markers use their actual target values, allowing you to compare observations with the predicted surface."}
          {" "}
          Additional input features are held at
          representative values computed from the
          training dataset.
        </p>
      </div>
    </section>
  );
}
