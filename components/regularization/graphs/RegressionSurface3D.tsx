import { useMemo, useState } from "react";
import Plot from "react-plotly.js";

import {
  NumericRow,
  TrainedRegularizationModel,
} from "../types/regularization";

import {
  predictNewRow,
} from "../utils/regularizationMath";

interface Props {
  rows: NumericRow[];
  model: TrainedRegularizationModel;
}

function modelName(model: TrainedRegularizationModel) {
  if (model.modelType === "linear") return "OLS";
  if (model.modelType === "ridge") return "Ridge";
  if (model.modelType === "lasso") return "Lasso";
  return "Elastic Net";
}

function createRange(
  min: number,
  max: number,
  count = 22
): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }

  if (Math.abs(max - min) < 1e-12) {
    return Array(count).fill(min);
  }

  const step = (max - min) / (count - 1);

  return Array.from(
    { length: count },
    (_, index) => min + step * index
  );
}

export default function RegressionSurface3D({
  rows,
  model,
}: Props) {
  const availableFeatures = model.features;

  const [xFeature, setXFeature] = useState(
    availableFeatures[0] ?? ""
  );

  const [yFeature, setYFeature] = useState(
    availableFeatures[1] ??
      availableFeatures[0] ??
      ""
  );

  const visualization = useMemo(() => {
    if (
      rows.length === 0 ||
      !xFeature ||
      !yFeature ||
      xFeature === yFeature
    ) {
      return null;
    }

    const xValues = rows
      .map((row) => Number(row[xFeature]))
      .filter(Number.isFinite);

    const yValues = rows
      .map((row) => Number(row[yFeature]))
      .filter(Number.isFinite);

    if (
      xValues.length === 0 ||
      yValues.length === 0
    ) {
      return null;
    }

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xGrid = createRange(xMin, xMax);
    const yGrid = createRange(yMin, yMax);

    const baseRow: NumericRow =
      Object.fromEntries(
        model.scalers.map((scaler) => [
          scaler.feature,
          scaler.mean,
        ])
      );

    const zGrid = yGrid.map((y) =>
      xGrid.map((x) => {
        const row: NumericRow = {
          ...baseRow,
          [xFeature]: x,
          [yFeature]: y,
        };

        return predictNewRow(row, model);
      })
    );

    const actualX = rows.map(
      (row) => Number(row[xFeature])
    );

    const actualY = rows.map(
      (row) => Number(row[yFeature])
    );

    const actualZ = rows.map(
      (row) => Number(row[model.target])
    );

    const predictedZ = rows.map((row) =>
      predictNewRow(row, model)
    );

    return {
      xGrid,
      yGrid,
      zGrid,
      actualX,
      actualY,
      actualZ,
      predictedZ,
    };
  }, [rows, model, xFeature, yFeature]);

  if (availableFeatures.length < 2) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              3D REGRESSION SURFACE
            </span>

            <h2>
              Two features are required
            </h2>
          </div>
        </div>

        <div className="info-box">
          Select at least two input features to visualize
          a 3D regression surface.
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            3D REGRESSION SURFACE
          </span>

          <h2>
            See the {modelName(model)} model in 3D
          </h2>
        </div>

        <span className="value-pill">
          α = {model.alpha.toFixed(2)}
        </span>
      </div>

      <p className="muted">
        Choose two features for the horizontal axes.
        Other features are held at their training means,
        giving you a 3D slice of the full regression model.
      </p>

      <div className="two-column-grid">
        <label className="input-card">
          <span>X-axis feature</span>

          <select
            value={xFeature}
            onChange={(event) => {
              const next = event.target.value;
              setXFeature(next);

              if (next === yFeature) {
                const replacement =
                  availableFeatures.find(
                    (feature) => feature !== next
                  );

                if (replacement) {
                  setYFeature(replacement);
                }
              }
            }}
          >
            {availableFeatures.map((feature) => (
              <option
                key={feature}
                value={feature}
              >
                {feature}
              </option>
            ))}
          </select>
        </label>

        <label className="input-card">
          <span>Y-axis feature</span>

          <select
            value={yFeature}
            onChange={(event) => {
              const next = event.target.value;
              setYFeature(next);

              if (next === xFeature) {
                const replacement =
                  availableFeatures.find(
                    (feature) => feature !== next
                  );

                if (replacement) {
                  setXFeature(replacement);
                }
              }
            }}
          >
            {availableFeatures.map((feature) => (
              <option
                key={feature}
                value={feature}
              >
                {feature}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visualization && (
        <Plot
          data={[
            {
              type: "surface",
              x: visualization.xGrid,
              y: visualization.yGrid,
              z: visualization.zGrid,
              name: `${modelName(model)} surface`,
              opacity: 0.72,
              showscale: true,
              colorbar: {
                title: {
                  text: `Predicted ${model.target}`,
                },
              },
              hovertemplate:
                `${xFeature}: %{x:.3f}<br>` +
                `${yFeature}: %{y:.3f}<br>` +
                `${model.target}: %{z:.3f}` +
                "<extra>Regression surface</extra>",
            },
            {
              type: "scatter3d",
              mode: "markers",
              x: visualization.actualX,
              y: visualization.actualY,
              z: visualization.actualZ,
              name: "Actual observations",
              marker: {
                size: 5,
                symbol: "circle",
              },
              hovertemplate:
                `${xFeature}: %{x:.3f}<br>` +
                `${yFeature}: %{y:.3f}<br>` +
                `Actual ${model.target}: %{z:.3f}` +
                "<extra>Actual</extra>",
            },
            {
              type: "scatter3d",
              mode: "markers",
              x: visualization.actualX,
              y: visualization.actualY,
              z: visualization.predictedZ,
              name: "Model predictions",
              marker: {
                size: 3,
                symbol: "diamond",
              },
              hovertemplate:
                `${xFeature}: %{x:.3f}<br>` +
                `${yFeature}: %{y:.3f}<br>` +
                `Predicted ${model.target}: %{z:.3f}` +
                "<extra>Prediction</extra>",
            },
          ]}
          layout={{
            autosize: true,
            height: 620,

            margin: {
              l: 0,
              r: 0,
              t: 35,
              b: 0,
            },

            scene: {
              xaxis: {
                title: {
                  text: xFeature,
                },
              },

              yaxis: {
                title: {
                  text: yFeature,
                },
              },

              zaxis: {
                title: {
                  text: model.target,
                },
              },

              camera: {
                eye: {
                  x: 1.45,
                  y: 1.45,
                  z: 1.1,
                },
              },
            },

            legend: {
              orientation: "h",
            },

            paper_bgcolor: "transparent",
          }}
          useResizeHandler
          style={{
            width: "100%",
            height: "620px",
          }}
          config={{
            responsive: true,
            displaylogo: false,
            scrollZoom: true,
          }}
        />
      )}

      <div className="info-box">
        Drag to rotate the model, scroll to zoom, and
        hover over points. With more than two features,
        this is a two-feature slice of the complete model.
      </div>
    </section>
  );
}