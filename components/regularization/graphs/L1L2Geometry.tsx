import { useMemo, useState } from "react";
import Plot from "react-plotly.js";

import {
  TrainedRegularizationModel,
} from "../types/regularization";

interface Props {
  model: TrainedRegularizationModel;
}

type GeometryMode =
  | "compare"
  | "ridge"
  | "lasso";

function createRange(
  start: number,
  end: number,
  count: number
): number[] {
  const step =
    (end - start) /
    Math.max(count - 1, 1);

  return Array.from(
    { length: count },
    (_, index) =>
      start + index * step
  );
}

function createCircle(
  radius: number,
  count = 160
) {
  const angles =
    createRange(
      0,
      Math.PI * 2,
      count
    );

  return {
    x: angles.map(
      (angle) =>
        radius *
        Math.cos(angle)
    ),

    y: angles.map(
      (angle) =>
        radius *
        Math.sin(angle)
    ),
  };
}

function createDiamond(
  radius: number
) {
  return {
    x: [
      0,
      radius,
      0,
      -radius,
      0,
    ],

    y: [
      radius,
      0,
      -radius,
      0,
      radius,
    ],
  };
}

/*
 * Educational loss function.
 *
 * Its minimum is intentionally
 * outside the regularization
 * constraint so learners can see
 * how Ridge and Lasso pull the
 * solution toward the origin.
 */
function loss(
  beta1: number,
  beta2: number
): number {
  const center1 = 2.25;
  const center2 = 1.35;

  const rotated1 =
    0.82 *
      (beta1 - center1) +
    0.42 *
      (beta2 - center2);

  const rotated2 =
    -0.34 *
      (beta1 - center1) +
    0.95 *
      (beta2 - center2);

  return (
    rotated1 * rotated1 +
    2.3 *
      rotated2 *
      rotated2
  );
}

function findBestOnCircle(
  radius: number
) {
  let bestX = 0;
  let bestY = 0;
  let bestLoss =
    Number.POSITIVE_INFINITY;

  for (
    let index = 0;
    index < 1000;
    index++
  ) {
    const angle =
      (
        index /
        1000
      ) *
      Math.PI *
      2;

    const x =
      radius *
      Math.cos(angle);

    const y =
      radius *
      Math.sin(angle);

    const currentLoss =
      loss(x, y);

    if (
      currentLoss <
      bestLoss
    ) {
      bestLoss =
        currentLoss;

      bestX = x;
      bestY = y;
    }
  }

  return {
    x: bestX,
    y: bestY,
    loss: bestLoss,
  };
}

function findBestOnDiamond(
  radius: number
) {
  let bestX = 0;
  let bestY = 0;
  let bestLoss =
    Number.POSITIVE_INFINITY;

  const count = 500;

  const edges = [
    [
      [0, radius],
      [radius, 0],
    ],
    [
      [radius, 0],
      [0, -radius],
    ],
    [
      [0, -radius],
      [-radius, 0],
    ],
    [
      [-radius, 0],
      [0, radius],
    ],
  ];

  for (
    const edge of edges
  ) {
    const [start, end] =
      edge;

    for (
      let index = 0;
      index <= count;
      index++
    ) {
      const progress =
        index / count;

      const x =
        start[0] +
        (
          end[0] -
          start[0]
        ) *
          progress;

      const y =
        start[1] +
        (
          end[1] -
          start[1]
        ) *
          progress;

      const currentLoss =
        loss(x, y);

      if (
        currentLoss <
        bestLoss
      ) {
        bestLoss =
          currentLoss;

        bestX = x;
        bestY = y;
      }
    }
  }

  return {
    x: bestX,
    y: bestY,
    loss: bestLoss,
  };
}

function modelLabel(
  model:
    TrainedRegularizationModel
) {
  if (
    model.modelType ===
    "ridge"
  ) {
    return "Ridge";
  }

  if (
    model.modelType ===
    "lasso"
  ) {
    return "Lasso";
  }

  if (
    model.modelType ===
    "elastic-net"
  ) {
    return "Elastic Net";
  }

  return "OLS";
}

export default function L1L2Geometry({
  model,
}: Props) {
  const [mode, setMode] =
    useState<GeometryMode>(
      "compare"
    );

  const [demoAlpha, setDemoAlpha] =
    useState(
      Math.max(
        0.1,
        Math.min(
          model.alpha || 1,
          10
        )
      )
    );

  const features =
    model.features.slice(0, 2);

  const visualization =
    useMemo(() => {
      /*
       * Higher alpha should mean a
       * tighter allowed coefficient
       * region.
       */
      const radius =
        2.6 /
        (
          1 +
          demoAlpha * 0.18
        );

      const circle =
        createCircle(radius);

      const diamond =
        createDiamond(radius);

      const ridgePoint =
        findBestOnCircle(
          radius
        );

      const lassoPoint =
        findBestOnDiamond(
          radius
        );

      const axis =
        createRange(
          -3.3,
          3.3,
          75
        );

      const z =
        axis.map((y) =>
          axis.map((x) =>
            loss(x, y)
          )
        );

      return {
        radius,
        circle,
        diamond,
        ridgePoint,
        lassoPoint,
        axis,
        z,
      };
    }, [demoAlpha]);

  if (
    features.length < 2
  ) {
    return (
      <section className="panel">
        <span className="eyebrow">
          REGULARIZATION GEOMETRY
        </span>

        <h2>
          Select at least two
          features
        </h2>

        <p className="muted">
          Two coefficients are
          required to visualize L1
          and L2 geometry.
        </p>
      </section>
    );
  }

  const showRidge =
    mode === "ridge" ||
    mode === "compare";

  const showLasso =
    mode === "lasso" ||
    mode === "compare";

  const plotData: any[] = [
    {
      type: "contour",

      x:
        visualization.axis,

      y:
        visualization.axis,

      z:
        visualization.z,

      name: "MSE contours",

      showscale: false,

      hoverinfo: "skip",

      contours: {
        coloring: "lines",

        showlabels: false,
      },

      line: {
        width: 1.5,
      },
    },

    {
      type: "scatter",

      mode:
        "markers+text",

      x: [2.25],

      y: [1.35],

      text: [
        "Unregularized optimum",
      ],

      textposition:
        "top center",

      name:
        "OLS optimum",

      marker: {
        size: 10,
        symbol: "x",
      },
    },
  ];

  if (showRidge) {
    plotData.push(
      {
        type: "scatter",

        mode: "lines",

        x:
          visualization.circle.x,

        y:
          visualization.circle.y,

        name:
          "Ridge — L2 constraint",

        fill:
          mode === "ridge"
            ? "toself"
            : undefined,

        opacity:
          mode === "ridge"
            ? 0.28
            : 0.9,

        line: {
          width: 3,
        },
      },

      {
        type: "scatter",

        mode:
          "markers+text",

        x: [
          visualization
            .ridgePoint.x,
        ],

        y: [
          visualization
            .ridgePoint.y,
        ],

        text: [
          "Ridge solution",
        ],

        textposition:
          "bottom right",

        name:
          "Ridge solution",

        marker: {
          size: 12,
          symbol: "circle",
        },
      }
    );
  }

  if (showLasso) {
    plotData.push(
      {
        type: "scatter",

        mode: "lines",

        x:
          visualization.diamond.x,

        y:
          visualization.diamond.y,

        name:
          "Lasso — L1 constraint",

        fill:
          mode === "lasso"
            ? "toself"
            : undefined,

        opacity:
          mode === "lasso"
            ? 0.28
            : 0.9,

        line: {
          width: 3,
        },
      },

      {
        type: "scatter",

        mode:
          "markers+text",

        x: [
          visualization
            .lassoPoint.x,
        ],

        y: [
          visualization
            .lassoPoint.y,
        ],

        text: [
          "Lasso solution",
        ],

        textposition:
          "bottom left",

        name:
          "Lasso solution",

        marker: {
          size: 12,
          symbol: "diamond",
        },
      }
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            REGULARIZATION GEOMETRY
          </span>

          <h2>
            Why can Lasso create
            zero coefficients?
          </h2>
        </div>

        <span className="value-pill">
          Current model:{" "}
          {modelLabel(model)}
        </span>
      </div>

      <p className="muted">
        This is a normalized
        educational coefficient
        space. The contour lines show
        equal prediction loss. Ridge
        restricts coefficients using
        a smooth L2 circle, while
        Lasso uses an L1 diamond with
        sharp corners on the axes.
      </p>

      <div
        className="feature-chip-row"
        style={{
          marginTop: 18,
        }}
      >
        <button
          type="button"
          className={
            mode === "compare"
              ? "target-chip"
              : "feature-chip"
          }
          onClick={() =>
            setMode("compare")
          }
        >
          Compare
        </button>

        <button
          type="button"
          className={
            mode === "ridge"
              ? "target-chip"
              : "feature-chip"
          }
          onClick={() =>
            setMode("ridge")
          }
        >
          Ridge — L2
        </button>

        <button
          type="button"
          className={
            mode === "lasso"
              ? "target-chip"
              : "feature-chip"
          }
          onClick={() =>
            setMode("lasso")
          }
        >
          Lasso — L1
        </button>
      </div>

      <div
        className="input-card"
        style={{
          marginTop: 18,
        }}
      >
        <span>
          Educational α ={" "}
          {demoAlpha.toFixed(2)}
        </span>

        <input
          type="range"
          min={0.1}
          max={10}
          step={0.1}
          value={demoAlpha}
          onChange={(
            event
          ) =>
            setDemoAlpha(
              Number(
                event.target
                  .value
              )
            )
          }
        />

        <p className="muted">
          Increase α to tighten the
          allowed coefficient region.
          This demonstrates stronger
          regularization.
        </p>
      </div>

      <Plot
        data={plotData}
        layout={{
          autosize: true,

          height: 590,

          xaxis: {
            title: {
              text: `Normalized β₁ — ${features[0]}`,
            },

            range: [
              -3.4,
              3.4,
            ],

            zeroline: true,

            zerolinewidth: 2,

            constrain:
              "domain",
          },

          yaxis: {
            title: {
              text: `Normalized β₂ — ${features[1]}`,
            },

            range: [
              -3.4,
              3.4,
            ],

            zeroline: true,

            zerolinewidth: 2,

            scaleanchor: "x",

            scaleratio: 1,
          },

          margin: {
            l: 70,
            r: 40,
            t: 45,
            b: 70,
          },

          legend: {
            orientation: "h",

            y: 1.08,
          },

          paper_bgcolor:
            "transparent",

          plot_bgcolor:
            "transparent",

          hovermode:
            "closest",
        }}
        useResizeHandler
        style={{
          width: "100%",
          height: "590px",
        }}
        config={{
          responsive: true,

          displaylogo: false,

          scrollZoom: true,
        }}
      />

      <div className="three-column-grid">
        <div className="mini-card">
          <span>
            Ridge / L2
          </span>

          <strong>
            β₁² + β₂² ≤ t
          </strong>

          <p className="muted">
            The boundary is smooth,
            so solutions generally
            shrink toward zero
            without landing exactly
            on an axis.
          </p>
        </div>

        <div className="mini-card">
          <span>
            Lasso / L1
          </span>

          <strong>
            |β₁| + |β₂| ≤ t
          </strong>

          <p className="muted">
            The diamond has sharp
            corners directly on the
            axes, making zero
            coefficients more likely.
          </p>
        </div>

        <div className="mini-card">
          <span>
            Elastic Net
          </span>

          <strong>
            L1 + L2
          </strong>

          <p className="muted">
            Elastic Net combines
            Lasso-style sparsity with
            Ridge-style coefficient
            shrinkage.
          </p>
        </div>
      </div>

      <div
        className="info-box"
        style={{
          marginTop: 20,
        }}
      >
        Look at the Lasso diamond:
        its corners lie at β₁ = 0 or
        β₂ = 0. If a loss contour
        first touches the constraint
        at one of those corners, one
        coefficient becomes exactly
        zero. That is the geometric
        intuition behind Lasso
        feature selection.
      </div>
    </section>
  );
}