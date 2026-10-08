import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import type { SVMRow } from "./types/svm";
import { useSVM } from "./context/SVMContext";
import { calculateKernel } from "./kernels/kernelMath";
import { prepareVisualizationRows } from "./dataset/datasetUtils";
import {
  buildEducationalBoundary,
  boundaryY,
  signedScore,
} from "./visual-learning/visualModel";

type Props = {
  rows: SVMRow[];
  mode:
    | "hyperplane"
    | "margin"
    | "support"
    | "c"
    | "gamma"
    | "kernel"
    | "comparison"
    | "epsilon";
  C?: number;
  gamma?: number;
  epsilon?: number;
};

const CLASS_COLORS = [
  "#22d3ee",
  "#f472b6",
  "#facc15",
  "#4ade80",
  "#fb923c",
  "#a78bfa",
];

const EPS = 1e-9;

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function numericTarget(value: string | number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function linspace(min: number, max: number, count = 90) {
  if (count <= 1) return [min];

  return Array.from(
    { length: count },
    (_, index) =>
      min + ((max - min) * index) / (count - 1)
  );
}

function mean(values: number[]) {
  if (values.length === 0) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function getRange(values: number[]) {
  const clean = values.filter(Number.isFinite);

  if (clean.length === 0) {
    return {
      min: -1,
      max: 1,
      padding: 0.25,
    };
  }

  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const span = Math.max(max - min, 1);

  return {
    min,
    max,
    padding: span * 0.12,
  };
}

export default function SVMLearningVisual({
  rows: propRows,
  mode,
  C,
  gamma,
  epsilon,
}: Props) {
  const { state } = useSVM();

  const sourceRows =
    state.dataset?.rows ?? propRows;

  const scalingEnabled =
    state.dataset?.scalingEnabled ?? false;

  const prepared = useMemo(
    () =>
      prepareVisualizationRows(
        sourceRows,
        scalingEnabled
      ),
    [sourceRows, scalingEnabled]
  );

  const rows = prepared.rows;

  const activeC =
    C ?? state.parameters.C;

  const activeGamma =
    gamma ?? state.parameters.gamma;

  const activeEpsilon =
    epsilon ?? state.parameters.epsilon;

  const kernel =
    state.parameters.kernel;

  const degree =
    state.parameters.degree;

  const coef0 =
    state.parameters.coef0;

  const featureNames =
    state.dataset?.featureColumns ?? [
      "Feature 1",
      "Feature 2",
    ];

  if (rows.length === 0) {
    return (
      <div className="svm-empty-visual">
        Select or upload a dataset to
        activate this visualization.
      </div>
    );
  }

  /*
   * =====================================================
   * SVR EPSILON LAB
   * =====================================================
   *
   * This is an educational regression fit.
   * Epsilon and C are central ModelMind state.
   */
  if (mode === "epsilon") {
    const validRows = rows.filter((row) =>
      Number.isFinite(Number(row.target))
    );

    if (validRows.length < 2) {
      return (
        <div className="svm-empty-visual">
          SVR epsilon visualization needs
          a numeric regression target.
        </div>
      );
    }

    const ordered = [...validRows].sort(
      (left, right) =>
        (left.features[0] ?? 0) -
        (right.features[0] ?? 0)
    );

    const x = ordered.map(
      (row) => row.features[0] ?? 0
    );

    const y = ordered.map((row) =>
      numericTarget(row.target)
    );

    const meanX = mean(x);
    const meanY = mean(y);

    const numerator = x.reduce(
      (sum, value, index) =>
        sum +
        (value - meanX) *
          (y[index] - meanY),
      0
    );

    const denominator =
      x.reduce(
        (sum, value) =>
          sum + (value - meanX) ** 2,
        0
      ) || 1;

    const baseSlope =
      numerator / denominator;

    /*
     * Educational C response:
     * low C -> smoother/flatter fit
     * high C -> approaches the data-driven line
     */
    const cStrength =
      Math.max(activeC, 0.01) /
      (Math.max(activeC, 0.01) + 1);

    const slope =
      baseSlope * (0.55 + 0.45 * cStrength);

    const intercept =
      meanY - slope * meanX;

    const prediction = x.map(
      (value) =>
        slope * value + intercept
    );

    const upper = prediction.map(
      (value) =>
        value + activeEpsilon
    );

    const lower = prediction.map(
      (value) =>
        value - activeEpsilon
    );

    const insideX: number[] = [];
    const insideY: number[] = [];
    const outsideX: number[] = [];
    const outsideY: number[] = [];

    x.forEach((value, index) => {
      const residual = Math.abs(
        y[index] - prediction[index]
      );

      if (residual <= activeEpsilon) {
        insideX.push(value);
        insideY.push(y[index]);
      } else {
        outsideX.push(value);
        outsideY.push(y[index]);
      }
    });

    const traces: Data[] = [
      {
        x,
        y,
        type: "scatter",
        mode: "markers",
        name: "Training points",
        marker: {
          size: 9,
          color: "#64748b",
        },
      },
      {
        x: insideX,
        y: insideY,
        type: "scatter",
        mode: "markers",
        name: "Inside ε tube",
        marker: {
          size: 11,
          color: "#4ade80",
        },
      },
      {
        x,
        y: prediction,
        type: "scatter",
        mode: "lines",
        name: "Educational SVR function",
        line: {
          width: 4,
          color: "#a78bfa",
        },
      },
      {
        x,
        y: upper,
        type: "scatter",
        mode: "lines",
        name: "+ ε",
        line: {
          width: 2,
          dash: "dash",
          color: "#22d3ee",
        },
      },
      {
        x,
        y: lower,
        type: "scatter",
        mode: "lines",
        name: "- ε",
        line: {
          width: 2,
          dash: "dash",
          color: "#f472b6",
        },
      },
      {
        x: outsideX,
        y: outsideY,
        type: "scatter",
        mode: "markers",
        name: "Outside ε / support candidates",
        marker: {
          size: 17,
          symbol: "circle-open",
          color: "#fb923c",
          line: {
            width: 4,
            color: "#fb923c",
          },
        },
      },
    ];

    const layout: Partial<Layout> = {
      autosize: true,
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: {
        color: "#e8e9ff",
      },
      margin: {
        l: 60,
        r: 20,
        t: 35,
        b: 55,
      },
      title: {
        text:
          `ε = ${activeEpsilon.toFixed(2)} · ` +
          `${outsideX.length} outside · ` +
          `${insideX.length} inside`,
        font: {
          size: 15,
        },
      },
      xaxis: {
        title: {
          text:
            featureNames[0] ??
            "Feature 1",
        },
        gridcolor:
          "rgba(255,255,255,.08)",
      },
      yaxis: {
        title: {
          text:
            state.dataset?.targetColumn ??
            "Target",
        },
        gridcolor:
          "rgba(255,255,255,.08)",
      },
      legend: {
        orientation: "h",
      },
      uirevision: "svm-epsilon",
    };

    return (
      <Plot
        data={traces}
        layout={layout}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
        }}
        style={{
          width: "100%",
          height: "450px",
        }}
      />
    );
  }

  /*
   * =====================================================
   * CLASSIFICATION LEARNING LABS
   * =====================================================
   */

  const boundary =
    buildEducationalBoundary(rows);

  if (!boundary) {
    return (
      <div className="svm-empty-visual">
        This visualization needs at
        least two classes.
      </div>
    );
  }

  const xValues = rows.map(
    (row) => row.features[0] ?? 0
  );

  const yValues = rows.map(
    (row) => row.features[1] ?? 0
  );

  const xRange = getRange(xValues);
  const yRange = getRange(yValues);

  const xMin =
    xRange.min - xRange.padding;

  const xMax =
    xRange.max + xRange.padding;

  const lineX =
    linspace(xMin, xMax, 100);

  const makeLine = (offset = 0) =>
    lineX.map((x) =>
      boundaryY(
        boundary,
        x,
        offset
      )
    );

  const classNames = Array.from(
    new Set(
      rows.map((row) =>
        String(row.target)
      )
    )
  );

  const traces: Data[] =
    classNames.map(
      (target, targetIndex) => {
        const selected =
          rows.filter(
            (row) =>
              String(row.target) ===
              target
          );

        return {
          x: selected.map(
            (row) =>
              row.features[0] ?? 0
          ),
          y: selected.map(
            (row) =>
              row.features[1] ?? 0
          ),
          type: "scatter",
          mode: "markers",
          name: target,
          marker: {
            size: 11,
            color:
              CLASS_COLORS[
                targetIndex %
                  CLASS_COLORS.length
              ],
            line: {
              width: 1.5,
              color: "#e2e8f0",
            },
          },
          hovertemplate:
            `${featureNames[0] ?? "X"}: %{x:.3f}<br>` +
            `${featureNames[1] ?? "Y"}: %{y:.3f}<br>` +
            `Class: ${target}` +
            "<extra></extra>",
        } as Data;
      }
    );

  /*
   * Central C affects educational
   * soft-margin width in every
   * applicable learning lab.
   */
  const safeC =
    Math.max(activeC, 0.01);

  const marginDistance =
    boundary.margin /
    Math.max(
      0.35,
      Math.sqrt(safeC)
    );

  const norm =
    Math.sqrt(
      boundary.a ** 2 +
        boundary.b ** 2
    ) || 1;

  const algebraicMargin =
    marginDistance * norm;

  traces.push({
    x: lineX,
    y: makeLine(),
    type: "scatter",
    mode: "lines",
    name: "Decision boundary",
    line: {
      width: 4,
      color: "#8b5cf6",
    },
    hovertemplate:
      "Educational maximum-margin separator" +
      "<extra></extra>",
  } as Data);

  if (
    mode === "margin" ||
    mode === "support" ||
    mode === "c"
  ) {
    traces.push(
      {
        x: lineX,
        y: makeLine(
          algebraicMargin
        ),
        type: "scatter",
        mode: "lines",
        name: "+ Margin",
        line: {
          width: 2.5,
          dash: "dash",
          color: "#22d3ee",
        },
        hovertemplate:
          `+ Margin · C ${safeC.toFixed(2)}` +
          "<extra></extra>",
      } as Data,
      {
        x: lineX,
        y: makeLine(
          -algebraicMargin
        ),
        type: "scatter",
        mode: "lines",
        name: "- Margin",
        line: {
          width: 2.5,
          dash: "dash",
          color: "#f472b6",
        },
        hovertemplate:
          `- Margin · C ${safeC.toFixed(2)}` +
          "<extra></extra>",
      } as Data
    );
  }

  /*
   * Recompute educational support
   * candidates using the current C
   * margin instead of keeping a
   * permanently fixed ring set.
   */
  if (
    mode === "support" ||
    mode === "c"
  ) {
    const ranked = rows
      .map((row, index) => ({
        row,
        index,
        distance: Math.abs(
          signedScore(
            boundary,
            row.features[0] ?? 0,
            row.features[1] ?? 0
          )
        ),
      }))
      .sort(
        (left, right) =>
          left.distance -
          right.distance
      );

    const adaptiveSupport =
      ranked.filter(
        (item) =>
          item.distance <=
          marginDistance * 1.12
      );

    const supportCandidates =
      adaptiveSupport.length > 0
        ? adaptiveSupport
        : ranked.slice(
            0,
            Math.min(
              Math.max(
                classNames.length * 2,
                2
              ),
              ranked.length
            )
          );

    traces.push({
      x: supportCandidates.map(
        ({ row }) =>
          row.features[0] ?? 0
      ),
      y: supportCandidates.map(
        ({ row }) =>
          row.features[1] ?? 0
      ),
      type: "scatter",
      mode: "markers",
      name: "Support-vector candidates",
      marker: {
        size: 20,
        symbol: "circle-open",
        color: "#ffffff",
        line: {
          width: 4,
          color: "#ffffff",
        },
      },
      hovertemplate:
        "Educational support-vector candidate" +
        "<extra></extra>",
    } as Data);
  }

  if (mode === "c") {
    const violations =
      rows.filter((row) => {
        const distance =
          Math.abs(
            signedScore(
              boundary,
              row.features[0] ?? 0,
              row.features[1] ?? 0
            )
          );

        return (
          distance <
          marginDistance
        );
      });

    traces.push({
      x: violations.map(
        (row) =>
          row.features[0] ?? 0
      ),
      y: violations.map(
        (row) =>
          row.features[1] ?? 0
      ),
      type: "scatter",
      mode: "markers",
      name: "Soft-margin candidates",
      marker: {
        size: 16,
        symbol: "x",
        color: "#fb923c",
        line: {
          width: 3,
          color: "#fb923c",
        },
      },
      hovertemplate:
        `Inside educational C margin<br>` +
        `C = ${safeC.toFixed(2)}` +
        "<extra></extra>",
    } as Data);
  }

  /*
   * =====================================================
   * GAMMA / KERNEL INFLUENCE
   * =====================================================
   *
   * Similarities come from the SAME
   * calculateKernel() implementation
   * used by the rest of ModelMind.
   */
  if (
    mode === "gamma" ||
    mode === "kernel"
  ) {
    const reference =
      rows[0];

    const referenceFeatures =
      reference.features;

    const refX =
      referenceFeatures[0] ?? 0;

    const refY =
      referenceFeatures[1] ?? 0;

    const similarities =
      rows.map((row) =>
        finite(
          calculateKernel(
            kernel,
            referenceFeatures,
            row.features,
            {
              gamma: activeGamma,
              degree,
              coef0,
            }
          )
        )
      );

    const maxSimilarity =
      Math.max(
        ...similarities.map(
          (value) =>
            Math.abs(value)
        ),
        EPS
      );

    traces.push({
      x: [refX],
      y: [refY],
      type: "scatter",
      mode: "markers+text",
      name: "Kernel reference",
      text: ["Reference"],
      textposition: "top center",
      marker: {
        size: 20,
        symbol: "star",
        color: "#facc15",
        line: {
          width: 2,
          color: "#ffffff",
        },
      },
      hovertemplate:
        `${kernel.toUpperCase()} kernel reference` +
        "<extra></extra>",
    } as Data);

    rows.forEach(
      (row, index) => {
        if (index === 0) return;

        const similarity =
          similarities[index];

        const strength =
          Math.min(
            1,
            Math.abs(similarity) /
              maxSimilarity
          );

        traces.push({
          x: [
            refX,
            row.features[0] ?? 0,
          ],
          y: [
            refY,
            row.features[1] ?? 0,
          ],
          type: "scatter",
          mode: "lines",
          name: "Kernel similarity",
          showlegend: false,
          line: {
            width:
              1 + strength * 8,
            color:
              similarity >= 0
                ? "#a78bfa"
                : "#fb923c",
          },
          opacity:
            0.16 +
            strength * 0.8,
          hovertemplate:
            `${kernel} similarity: ` +
            `${similarity.toFixed(4)}` +
            "<extra></extra>",
        } as Data);
      }
    );

    /*
     * For distance-local kernels,
     * also draw an intuitive gamma
     * influence radius.
     */
    if (
      kernel === "rbf" ||
      kernel === "laplacian"
    ) {
      const radius =
        1 /
        Math.sqrt(
          Math.max(
            activeGamma,
            0.001
          )
        );

      const circleX: number[] = [];
      const circleY: number[] = [];

      for (
        let angle = 0;
        angle <= Math.PI * 2;
        angle += Math.PI / 50
      ) {
        circleX.push(
          refX +
            radius *
              Math.cos(angle)
        );

        circleY.push(
          refY +
            radius *
              Math.sin(angle)
        );
      }

      traces.push({
        x: circleX,
        y: circleY,
        type: "scatter",
        mode: "lines",
        name: "Gamma influence radius",
        line: {
          width: 2.5,
          dash: "dot",
          color: "#22d3ee",
        },
        hovertemplate:
          `γ = ${activeGamma.toFixed(3)}` +
          "<extra></extra>",
      } as Data);
    }
  }

  const title =
    mode === "hyperplane"
      ? "Decision Hyperplane"
      : mode === "margin"
        ? `Maximum Margin · C ${safeC.toFixed(2)}`
        : mode === "support"
          ? `Support Vectors · C ${safeC.toFixed(2)}`
          : mode === "c"
            ? `Soft Margin · C ${safeC.toFixed(2)}`
            : mode === "gamma"
              ? `${kernel.toUpperCase()} Influence · γ ${activeGamma.toFixed(3)}`
              : `${kernel.toUpperCase()} Kernel`;

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: {
      color: "#e8e9ff",
    },
    margin: {
      l: 58,
      r: 20,
      t: 48,
      b: 58,
    },
    title: {
      text: title,
      font: {
        size: 15,
      },
    },
    xaxis: {
      title: {
        text:
          featureNames[0] ??
          "Feature 1",
      },
      gridcolor:
        "rgba(255,255,255,.08)",
      range: [
        xRange.min -
          xRange.padding,
        xRange.max +
          xRange.padding,
      ],
    },
    yaxis: {
      title: {
        text:
          featureNames[1] ??
          "Feature 2",
      },
      gridcolor:
        "rgba(255,255,255,.08)",
      range: [
        yRange.min -
          yRange.padding,
        yRange.max +
          yRange.padding,
      ],
    },
    legend: {
      orientation: "h",
    },
    uirevision:
      `svm-learning-${mode}-${kernel}`,
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={{
        responsive: true,
        displaylogo: false,
        scrollZoom: true,
      }}
      style={{
        width: "100%",
        height: "450px",
      }}
    />
  );
}
