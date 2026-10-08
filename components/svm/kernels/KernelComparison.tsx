import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSVM } from "../context/SVMContext";
import {
  calculateKernel,
  kernelDefinitions,
} from "./kernelMath";
import { prepareVisualizationRows } from "../dataset/datasetUtils";
import type { SVMKernel } from "../types/svm";

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

export default function KernelComparison() {
  const {
    state,
    updateParameters,
  } = useSVM();

  const rawRows =
    state.dataset?.rows ?? [];

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

  const featureNames =
    state.dataset?.featureColumns ?? [];

  const gamma =
    state.parameters.gamma;

  const degree =
    state.parameters.degree;

  const coef0 =
    state.parameters.coef0;

  const reference =
    rows[0] ?? null;

  const comparisonTraces =
    useMemo<Data[]>(() => {
      if (!reference) return [];

      return kernelDefinitions.map(
        (definition, index) => {
          const raw = rows.map(
            (row) =>
              finite(
                calculateKernel(
                  definition.id,
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

          const normalized =
            normalize(raw);

          return {
            x: rows.map(
              (_, rowIndex) =>
                rowIndex + 1
            ),
            y: normalized,
            customdata: raw.map(
              (value) => [value]
            ),
            type: "scatter",
            mode: "lines+markers",
            name: definition.name,
            line: {
              width:
                state.parameters.kernel ===
                definition.id
                  ? 4
                  : 2,
              color:
                COLORS[
                  index %
                    COLORS.length
                ],
            },
            marker: {
              size:
                state.parameters.kernel ===
                definition.id
                  ? 8
                  : 5,
            },
            opacity:
              state.parameters.kernel ===
              definition.id
                ? 1
                : 0.58,
            hovertemplate:
              `${definition.name}<br>` +
              "Observation: %{x}<br>" +
              "Normalized similarity: %{y:.3f}<br>" +
              "Raw similarity: %{customdata[0]:.4f}" +
              "<extra></extra>",
          } as Data;
        }
      );
    }, [
      rows,
      reference,
      gamma,
      degree,
      coef0,
      state.parameters.kernel,
    ]);

  const activeDefinition =
    kernelDefinitions.find(
      (definition) =>
        definition.id ===
        state.parameters.kernel
    );

  const activeSimilarity =
    useMemo(() => {
      if (!reference) return [];

      return rows.map((row) =>
        finite(
          calculateKernel(
            state.parameters.kernel,
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
      state.parameters.kernel,
      gamma,
      degree,
      coef0,
    ]);

  const strongestIndexes =
    useMemo(
      () =>
        activeSimilarity
          .map((value, index) => ({
            index,
            value,
          }))
          .sort(
            (left, right) =>
              Math.abs(right.value) -
              Math.abs(left.value)
          )
          .slice(
            0,
            Math.min(
              5,
              activeSimilarity.length
            )
          ),
      [activeSimilarity]
    );

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
      t: 50,
      b: 60,
    },
    title: {
      text:
        "Same Data · Different Kernel Similarities",
      font: {
        size: 16,
      },
    },
    xaxis: {
      title: {
        text:
          "Dataset observation",
      },
      gridcolor:
        "rgba(255,255,255,.08)",
    },
    yaxis: {
      title: {
        text:
          "Normalized similarity to reference",
      },
      gridcolor:
        "rgba(255,255,255,.08)",
    },
    legend: {
      orientation: "h",
    },
    uirevision:
      "kernel-comparison",
  };

  if (rows.length === 0) {
    return (
      <article className="learning-lab-panel">
        <div className="lab-copy">
          <h3>
            Kernel Comparison
          </h3>

          <p>
            Select or upload a dataset
            first.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="learning-lab-panel">
      <div className="lab-copy full-width">
        <span>
          LIVE KERNEL COMPARISON
        </span>

        <h3>
          Compare SVM Kernels
        </h3>

        <p>
          Every curve below evaluates
          the same active dataset
          against the same reference
          observation. The only thing
          changing is the kernel
          relationship.
        </p>

        <div className="kernel-comparison-grid">
          {kernelDefinitions.map(
            (kernel) => {
              const selected =
                state.parameters.kernel ===
                kernel.id;

              return (
                <button
                  key={kernel.id}
                  type="button"
                  className={
                    selected
                      ? "kernel-compare-card selected"
                      : "kernel-compare-card"
                  }
                  onClick={() =>
                    updateParameters({
                      kernel:
                        kernel.id as SVMKernel,
                    })
                  }
                >
                  <strong>
                    {kernel.name}
                  </strong>

                  <span>
                    {kernel.formula}
                  </span>

                  <small>
                    {kernel.description}
                  </small>

                  <em>
                    {kernel.sklearnSupported
                      ? "Native sklearn SVC/SVR"
                      : "Educational / custom precomputed"}
                  </em>
                </button>
              );
            }
          )}
        </div>

        <div className="concept-box">
          <strong>
            Active kernel:{" "}
            {activeDefinition?.name ??
              state.parameters.kernel}
          </strong>

          <small>
            The selected curve is
            emphasized. Gamma =
            {" "}
            {gamma.toFixed(3)},
            degree = {degree},
            coef0 ={" "}
            {coef0.toFixed(2)}.
            Applicable parameter
            changes immediately
            recompute every kernel
            response.
          </small>
        </div>

        <div className="concept-box">
          <strong>
            Reference observation
          </strong>

          <small>
            The comparison uses the
            first active dataset row as
            a common reference. This
            lets learners see how
            different kernels assign
            different similarity to
            exactly the same points.
          </small>
        </div>

        {strongestIndexes.length > 0 && (
          <div className="concept-box">
            <strong>
              Strongest relationships
              for selected kernel
            </strong>

            <small>
              {strongestIndexes
                .map(
                  ({ index, value }) =>
                    `#${index + 1}: ${value.toFixed(3)}`
                )
                .join(" · ")}
            </small>
          </div>
        )}

        <div className="concept-box">
          <strong>
            Active feature space
          </strong>

          <small>
            {scalingEnabled
              ? "Standardized model space"
              : "Raw feature space"}
            {" · "}
            {featureNames.length}
            {" "}feature
            {featureNames.length === 1
              ? ""
              : "s"}
            {" · "}
            {rows.length} observations.
          </small>
        </div>
      </div>

      <Plot
        data={comparisonTraces}
        layout={layout}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
        }}
        style={{
          width: "100%",
          height: "480px",
        }}
      />
    </article>
  );
}
