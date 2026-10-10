
"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";
import {
  Box,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  Info,
  Rotate3D,
} from "lucide-react";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

export type BaggingGraphSurface = {
  x: number[];
  y: number[];
  z: number[][];
  train_points?: number[][];
  test_points?: number[][];
};

type Props = {
  single?: BaggingGraphSurface | null;
  bagging?: BaggingGraphSurface | null;
  playbackSurface?: BaggingGraphSurface | null;
  playbackCount?: number | null;
  featureNames?: [string, string];
  targetName?: string;
  source?: "demo" | "trained";
  task?: "classification" | "regression";
};

type Mode = "2d" | "3d";

const grid = Array.from(
  { length: 39 },
  (_, i) => -3 + (6 * i) / 38,
);

function smooth(x: number, y: number) {
  return (
    Math.sin(x * 1.35) * 0.75 +
    Math.cos(y * 1.2) * 0.65 +
    0.12 * x * y
  );
}

function defaultSurface(
  kind: "single" | "bagging",
): BaggingGraphSurface {
  const z = grid.map((y) =>
    grid.map((x) => {
      const value = smooth(x, y);

      if (kind === "single") {
        return (
          Math.round(value * 2.4) / 2.4 +
          0.2 *
            Math.sin(Math.floor(x * 2.5)) *
            Math.cos(Math.floor(y * 2))
        );
      }

      return value;
    }),
  );

  const train_points = Array.from(
    { length: 80 },
    (_, i) => {
      const x = -2.8 + ((i * 47) % 57) / 10;
      const y = -2.8 + ((i * 23) % 57) / 10;

      return [x, y, smooth(x, y)];
    },
  );

  return {
    x: grid,
    y: grid,
    z,
    train_points,
    test_points: [],
  };
}

function validSurface(
  value: BaggingGraphSurface | null | undefined,
): value is BaggingGraphSurface {
  if (!value) return false;

  if (!Array.isArray(value.x) || !Array.isArray(value.y)) {
    return false;
  }

  if (!Array.isArray(value.z)) return false;

  if (value.x.length < 2 || value.y.length < 2) {
    return false;
  }

  return (
    value.z.length === value.y.length &&
    value.z.every(
      (row) =>
        Array.isArray(row) &&
        row.length === value.x.length &&
        row.every((number) => Number.isFinite(number)),
    )
  );
}

function ModelGraph({
  title,
  surface,
  mode,
  xLabel,
  yLabel,
  zLabel,
  isClassification,
}: {
  title: string;
  surface: BaggingGraphSurface;
  mode: Mode;
  xLabel: string;
  yLabel: string;
  zLabel: string;
  isClassification: boolean;
}) {
  const train = surface.train_points ?? [];
  const test = surface.test_points ?? [];

  const traces = useMemo(() => {
    const data: Data[] = [];

    if (mode === "2d") {
      data.push({
        type: "contour",
        x: surface.x,
        y: surface.y,
        z: surface.z,
        name: "Model prediction",
        colorscale: "Viridis",
        contours: {
          coloring: "heatmap",
          showlines: true,
        },
        line: {
          width: 0.5,
        },
        colorbar: {
          title: {
            text: isClassification
              ? "Prediction"
              : zLabel,
          },
        },
        hovertemplate:
          `${xLabel}: %{x:.3f}` +
          `<br>${yLabel}: %{y:.3f}` +
          "<br>Prediction: %{z:.3f}<extra></extra>",
      } as Data);

      if (train.length) {
        data.push({
          type: "scatter",
          mode: "markers",
          x: train.map((p) => p[0]),
          y: train.map((p) => p[1]),
          name: "Training data",
          marker: {
            color: "#fb923c",
            size: 6,
            opacity: 0.85,
            line: {
              color: "#ffffff",
              width: 0.5,
            },
          },
          hovertemplate:
            `${xLabel}: %{x:.3f}` +
            `<br>${yLabel}: %{y:.3f}` +
            "<extra>Training observation</extra>",
        } as Data);
      }

      if (test.length) {
        data.push({
          type: "scatter",
          mode: "markers",
          x: test.map((p) => p[0]),
          y: test.map((p) => p[1]),
          name: "Test data",
          marker: {
            color: "#38bdf8",
            size: 7,
            symbol: "diamond",
            line: {
              color: "#ffffff",
              width: 1,
            },
          },
        } as Data);
      }
    } else {
      data.push({
        type: "surface",
        x: surface.x,
        y: surface.y,
        z: surface.z,
        colorscale: "Viridis",
        opacity: 0.93,
        name: "Prediction surface",
        colorbar: {
          title: {
            text: zLabel,
          },
        },
        hovertemplate:
          `${xLabel}: %{x:.3f}` +
          `<br>${yLabel}: %{y:.3f}` +
          "<br>Prediction: %{z:.3f}<extra></extra>",
      } as Data);

      if (train.length && train.every((p) => p.length >= 3)) {
        data.push({
          type: "scatter3d",
          mode: "markers",
          x: train.map((p) => p[0]),
          y: train.map((p) => p[1]),
          z: train.map((p) => p[2]),
          name: "Training data",
          marker: {
            size: 3,
            color: "#fb923c",
            opacity: 0.8,
          },
        } as Data);
      }

      if (test.length && test.every((p) => p.length >= 3)) {
        data.push({
          type: "scatter3d",
          mode: "markers",
          x: test.map((p) => p[0]),
          y: test.map((p) => p[1]),
          z: test.map((p) => p[2]),
          name: "Test data",
          marker: {
            size: 4,
            color: "#38bdf8",
            opacity: 0.9,
          },
        } as Data);
      }
    }

    return data;
  }, [
    surface,
    mode,
    xLabel,
    yLabel,
    zLabel,
    isClassification,
    train,
    test,
  ]);

  const layout = useMemo(
    (): Partial<Layout> => ({
      autosize: true,
      height: mode === "3d" ? 500 : 430,
      paper_bgcolor: "#0c1427",
      plot_bgcolor: "#111b30",
      font: {
        color: "#cbd5e1",
      },
      margin:
        mode === "3d"
          ? { l: 0, r: 0, t: 30, b: 0 }
          : { l: 65, r: 30, t: 30, b: 65 },
      xaxis: {
        title: {
          text: xLabel,
        },
        gridcolor: "#26334c",
        zerolinecolor: "#334155",
      },
      yaxis: {
        title: {
          text: yLabel,
        },
        gridcolor: "#26334c",
        zerolinecolor: "#334155",
      },
      scene: {
        xaxis: {
          title: {
            text: xLabel,
          },
          backgroundcolor: "#111b30",
          gridcolor: "#334155",
        },
        yaxis: {
          title: {
            text: yLabel,
          },
          backgroundcolor: "#111b30",
          gridcolor: "#334155",
        },
        zaxis: {
          title: {
            text: zLabel,
          },
          backgroundcolor: "#111b30",
          gridcolor: "#334155",
        },
        camera: {
          eye: { x: 1.6, y: 1.6, z: 1.2 },
        },
      },
      showlegend: true,
      legend: {
        orientation: "h",
      },
      uirevision: `${title}-${mode}`,
    }),
    [mode, xLabel, yLabel, zLabel, title],
  );

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1427] p-3 md:p-5">
      <h3 className="mb-3 text-lg font-bold text-white">
        {title}
      </h3>

      
<div
  className="relative w-full min-w-0 overflow-hidden rounded-xl"
  style={{
    height: mode === "3d" ? 520 : 460,
    minHeight: mode === "3d" ? 520 : 460,
  }}
>
  <Plot
    key={`${title}-${mode}`}
    data={traces}
    layout={{
      ...layout,
      autosize: true,
      height: mode === "3d" ? 520 : 460,
      width: undefined,
    }}
    config={{
      responsive: true,
      displaylogo: false,
      scrollZoom: true,
      displayModeBar: true,
    }}
    style={{
      width: "100%",
      height: mode === "3d" ? 520 : 460,
    }}
    useResizeHandler={true}
    className="w-full"
  />
</div>

    </div>
  );
}

export default function BaggingInteractiveGraphs({
  single,
  bagging,
  playbackSurface = null,
  playbackCount = null,
  featureNames = ["Feature 1", "Feature 2"],
  targetName = "Prediction",
  source = "demo",
  task = "regression",
}: Props) {
  const [mode, setMode] = useState<Mode>("2d");
  const [comparison, setComparison] = useState(true);

  const defaultSingle = useMemo(
    () => defaultSurface("single"),
    [],
  );

  const defaultBagging = useMemo(
    () => defaultSurface("bagging"),
    [],
  );

  const usingTrained =
    source === "trained" &&
    validSurface(single) &&
    validSurface(bagging);

  const singleSurface = usingTrained
    ? single
    : defaultSingle;

  const baggingSurface =
  usingTrained &&
  playbackSurface &&
  validSurface(playbackSurface)
    ? playbackSurface
    : usingTrained
      ? bagging
      : defaultBagging;

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-[#111a30] to-[#080d19] p-6 md:p-9">
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Interactive Model Graphs
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Bagging 2D & 3D Visualization Lab
        </h2>
        {usingTrained && playbackCount !== null && (
  <p className="mt-3 inline-flex rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200">
    Replay checkpoint: {playbackCount} fitted learners combined
  </p>
)}

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Compare the prediction geometry of a single
          Decision Tree with a Bagging ensemble. Switch
          between contour maps and interactive 3D
          prediction surfaces.
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("2d")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              mode === "2d"
                ? "bg-violet-600"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <ChartNoAxesCombined size={17} />
            2D Graph
          </button>

          <button
            type="button"
            onClick={() => setMode("3d")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              mode === "3d"
                ? "bg-violet-600"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <Rotate3D size={17} />
            3D Graph
          </button>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={comparison}
            onChange={(e) => setComparison(e.target.checked)}
            className="accent-violet-500"
          />
          Compare Single Tree vs Bagging
        </label>

        <span className="flex items-center gap-2 text-xs text-slate-400">
          <Database size={15} />
          {usingTrained
            ? "Trained model predictions"
            : "Default illustrative dataset"}
        </span>
      </div>

      <div
        className={`grid min-w-0 gap-5 ${
          comparison ? "2xl:grid-cols-2" : ""
        }`}
      >
        {comparison && (
          <ModelGraph
            title="Single Decision Tree"
            surface={singleSurface}
            mode={mode}
            xLabel={featureNames[0]}
            yLabel={featureNames[1]}
            zLabel={targetName}
            isClassification={task === "classification"}
          />
        )}

        <ModelGraph
          title="Bagging Ensemble"
          surface={baggingSurface}
          mode={mode}
          xLabel={featureNames[0]}
          yLabel={featureNames[1]}
          zLabel={targetName}
          isClassification={task === "classification"}
        />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-[#0c1427] p-5">
        <div className="flex items-start gap-3">
          <Info
            size={19}
            className="mt-1 shrink-0 text-sky-400"
          />
          <div className="space-y-3 text-sm leading-7 text-slate-300">
            <p>
              <strong className="text-white">
                2D visualization:
              </strong>{" "}
              Colors represent model predictions at
              combinations of two input features. Hover
              to inspect values, or zoom into a region.
            </p>

            <p>
              <strong className="text-white">
                3D visualization:
              </strong>{" "}
              The horizontal axes represent two features,
              while height represents the model prediction
              or a numeric class encoding. Drag to rotate,
              scroll to zoom, and hover to inspect predictions.
            </p>

            {!usingTrained && (
              <p className="text-amber-300">
                These default surfaces are illustrative,
                not predictions from your uploaded CSV.
                Actual dataset graphs will use the
                fitted-model surface data passed into
                this component.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
