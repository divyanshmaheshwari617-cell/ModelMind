import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSVM } from "../context/SVMContext";
import { calculateKernel } from "./kernelMath";
import { prepareVisualizationRows } from "../dataset/datasetUtils";

const COLORS = [
  "#22d3ee",
  "#f472b6",
  "#facc15",
  "#4ade80",
  "#fb923c",
  "#a78bfa",
];

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function normalize(values: number[]) {
  const maxAbs = Math.max(
    ...values.map((value) => Math.abs(value)),
    1e-9
  );

  return values.map((value) => value / maxAbs);
}

function kernelExplanation(
  kernel: string,
  gamma: number,
  degree: number,
  coef0: number
) {
  switch (kernel) {
    case "linear":
      return "Linear kernel measures dot-product similarity. The geometry stays comparatively simple because no nonlinear distance transformation is introduced.";
    case "polynomial":
      return `Polynomial similarity is controlled by degree ${degree}, gamma ${gamma.toFixed(3)} and coef0 ${coef0.toFixed(2)}. Increasing degree can create much stronger curvature.`;
    case "rbf":
      return `RBF similarity decays with squared distance. Gamma ${gamma.toFixed(3)} controls how local each observation's influence becomes.`;
    case "sigmoid":
      return `Sigmoid uses gamma ${gamma.toFixed(3)} and coef0 ${coef0.toFixed(2)} inside a tanh-like similarity transformation.`;
    case "laplacian":
      return `Laplacian is a distance-local educational/custom kernel. Gamma ${gamma.toFixed(3)} controls how quickly similarity decays.`;
    case "chi-square":
      return "Chi-Square is most meaningful for non-negative histogram/count-like features. Standardized negative features can make this educational view less interpretable.";
    case "custom":
      return "Custom shows ModelMind's educational custom kernel response using the same central kernel implementation used elsewhere in this lab.";
    default:
      return "The vertical coordinate represents normalized similarity to a reference observation.";
  }
}

export default function KernelTransformation3D() {
  const { state } = useSVM();

  const rawRows = state.dataset?.rows ?? [];
  const scalingEnabled =
    state.dataset?.scalingEnabled ?? false;

  const prepared = useMemo(
    () =>
      prepareVisualizationRows(
        rawRows,
        scalingEnabled
      ),
    [rawRows, scalingEnabled]
  );

  const rows = prepared.rows;
  const features =
    state.dataset?.featureColumns ?? [];

  const kernel = state.parameters.kernel;
  const gamma = state.parameters.gamma;
  const degree = state.parameters.degree;
  const coef0 = state.parameters.coef0;

  const labels = useMemo(
    () =>
      Array.from(
        new Set(
          rows.map((row) =>
            String(row.target)
          )
        )
      ),
    [rows]
  );

  const reference =
    rows[0] ?? null;

  const similarities = useMemo(() => {
    if (!reference) return [];

    return rows.map((row) =>
      finite(
        calculateKernel(
          kernel,
          row.features,
          reference.features,
          {
            gamma,
            degree,
            coef0,
          }
        )
      )
    );
  }, [
    rows,
    reference,
    kernel,
    gamma,
    degree,
    coef0,
  ]);

  const normalizedSimilarities =
    useMemo(
      () => normalize(similarities),
      [similarities]
    );

  const traces = useMemo<Data[]>(() => {
    if (!reference) return [];

    const result: Data[] = labels.map(
      (label, labelIndex) => {
        const indexes = rows
          .map((row, index) => ({
            row,
            index,
          }))
          .filter(
            ({ row }) =>
              String(row.target) ===
              label
          );

        return {
          x: indexes.map(
            ({ row }) =>
              row.features[0] ?? 0
          ),
          y: indexes.map(
            ({ row }) =>
              row.features[1] ?? 0
          ),
          z: indexes.map(
            ({ index }) =>
              normalizedSimilarities[
                index
              ] ?? 0
          ),
          customdata: indexes.map(
            ({ index }) => [
              similarities[index] ?? 0,
            ]
          ),
          type: "scatter3d",
          mode: "markers",
          name: label,
          marker: {
            size: 6,
            color:
              COLORS[
                labelIndex %
                  COLORS.length
              ],
            line: {
              width: 1,
              color: "#e2e8f0",
            },
          },
          hovertemplate:
            `${features[0] ?? "Feature 1"}: %{x:.3f}<br>` +
            `${features[1] ?? "Feature 2"}: %{y:.3f}<br>` +
            "Normalized kernel response: %{z:.3f}<br>" +
            "Raw similarity: %{customdata[0]:.4f}<br>" +
            `Class/target: ${label}` +
            "<extra></extra>",
        } as Data;
      }
    );

    result.push({
      x: [
        reference.features[0] ?? 0,
      ],
      y: [
        reference.features[1] ?? 0,
      ],
      z: [
        normalizedSimilarities[0] ??
          0,
      ],
      type: "scatter3d",
      mode: "markers+text",
      name: "Kernel reference",
      text: ["Reference"],
      textposition: "top center",
      marker: {
        size: 10,
        symbol: "diamond",
        color: "#ffffff",
        line: {
          width: 3,
          color: "#facc15",
        },
      },
      hovertemplate:
        "Reference observation" +
        "<extra></extra>",
    } as Data);

    return result;
  }, [
    rows,
    labels,
    reference,
    similarities,
    normalizedSimilarities,
    features,
  ]);

  if (rows.length === 0) {
    return (
      <article className="learning-lab-panel">
        <div className="lab-copy">
          <h3>Kernel Trick 3D</h3>
          <p>
            Select or upload a dataset
            first.
          </p>
        </div>
      </article>
    );
  }

  const explanation =
    kernelExplanation(
      kernel,
      gamma,
      degree,
      coef0
    );

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "transparent",
    font: {
      color: "#e8e9ff",
    },
    margin: {
      l: 0,
      r: 0,
      t: 45,
      b: 0,
    },
    title: {
      text:
        `${kernel.toUpperCase()} Kernel Geometry`,
      font: {
        size: 16,
      },
    },
    scene: {
      xaxis: {
        title: {
          text:
            features[0] ??
            "Feature 1",
        },
        gridcolor:
          "rgba(255,255,255,.08)",
      },
      yaxis: {
        title: {
          text:
            features[1] ??
            "Feature 2",
        },
        gridcolor:
          "rgba(255,255,255,.08)",
      },
      zaxis: {
        title: {
          text:
            "Normalized kernel similarity",
        },
        gridcolor:
          "rgba(255,255,255,.08)",
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
      orientation: "h",
    },
    uirevision:
      `kernel-3d-${kernel}`,
  };

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy">
        <span>
          LIVE KERNEL GEOMETRY
        </span>

        <h3>
          Kernel Trick 3D
        </h3>

        <p>
          The vertical axis now uses
          the currently selected
          ModelMind kernel rather than
          a fixed x₁² + x₂² lift.
          Change the kernel or its
          applicable parameters and
          this geometry updates.
        </p>

        <div className="concept-box">
          <strong>
            {kernel.toUpperCase()}
            {" "}kernel
          </strong>

          <small>
            {explanation}
          </small>
        </div>

        <div className="concept-box">
          <strong>
            What does Z mean?
          </strong>

          <small>
            Z is normalized kernel
            similarity to the highlighted
            reference observation. This
            is an educational projection
            of kernel relationships, not
            a claim that sklearn
            explicitly creates this
            single hidden coordinate.
          </small>
        </div>

        <div className="concept-box">
          <strong>
            Active model space
          </strong>

          <small>
            {scalingEnabled
              ? "Feature scaling is ON, so the visualization uses standardized feature values."
              : "Feature scaling is OFF, so the visualization uses the raw feature values."}
          </small>
        </div>
      </div>

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
        style={{
          width: "100%",
          height: "520px",
        }}
      />
    </article>
  );
}
