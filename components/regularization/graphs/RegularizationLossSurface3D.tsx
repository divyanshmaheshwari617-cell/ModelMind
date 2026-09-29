import { useMemo, useState } from "react";
import Plot from "react-plotly.js";

import {
  NumericRow,
  TrainedRegularizationModel,
} from "../types/regularization";

interface Props {
  trainRows: NumericRow[];
  model: TrainedRegularizationModel;
}

function modelName(model: TrainedRegularizationModel) {
  if (model.modelType === "linear") return "OLS";
  if (model.modelType === "ridge") return "Ridge";
  if (model.modelType === "lasso") return "Lasso";
  return "Elastic Net";
}

function createRange(
  center: number,
  radius: number,
  count = 31
): number[] {
  const safeRadius = Math.max(
    radius,
    Math.abs(center) * 0.75,
    1
  );

  const start = center - safeRadius;
  const end = center + safeRadius;

  const step =
    (end - start) / (count - 1);

  return Array.from(
    { length: count },
    (_, index) => start + index * step
  );
}

export default function RegularizationLossSurface3D({
  trainRows,
  model,
}: Props) {
  const [firstFeature, setFirstFeature] =
    useState(model.features[0] ?? "");

  const [secondFeature, setSecondFeature] =
    useState(
      model.features[1] ??
        model.features[0] ??
        ""
    );

  const surface = useMemo(() => {
    if (
      trainRows.length === 0 ||
      !firstFeature ||
      !secondFeature ||
      firstFeature === secondFeature
    ) {
      return null;
    }

    const firstCoefficient =
      model.coefficients[firstFeature] ?? 0;

    const secondCoefficient =
      model.coefficients[secondFeature] ?? 0;

    const maxCoefficient =
      Math.max(
        ...Object.values(model.coefficients).map(
          (value) => Math.abs(value)
        ),
        1
      );

    const radius =
      Math.max(maxCoefficient * 1.5, 2);

    const beta1Values = createRange(
      firstCoefficient,
      radius
    );

    const beta2Values = createRange(
      secondCoefficient,
      radius
    );

    const scalerMap = new Map(
      model.scalers.map((scaler) => [
        scaler.feature,
        scaler,
      ])
    );

    const standardizedRows =
      trainRows.map((row) => {
        const values: Record<string, number> = {};

        model.features.forEach((feature) => {
          const scaler =
            scalerMap.get(feature);

          const raw =
            Number(row[feature]);

          values[feature] = scaler
            ? (raw - scaler.mean) /
              scaler.std
            : raw;
        });

        return {
          values,
          target: Number(row[model.target]),
        };
      });

    function objective(
      beta1: number,
      beta2: number
    ): number {
      let squaredError = 0;

      standardizedRows.forEach(
        ({ values, target }) => {
          let prediction =
            model.intercept;

          model.features.forEach(
            (feature) => {
              let coefficient =
                model.coefficients[
                  feature
                ] ?? 0;

              if (
                feature === firstFeature
              ) {
                coefficient = beta1;
              }

              if (
                feature === secondFeature
              ) {
                coefficient = beta2;
              }

              prediction +=
                values[feature] *
                coefficient;
            }
          );

          const error =
            target - prediction;

          squaredError +=
            error * error;
        }
      );

      const mse =
        squaredError /
        standardizedRows.length;

      if (
        model.modelType === "linear"
      ) {
        return mse;
      }

      const coefficients =
        model.features.map(
          (feature) => {
            if (
              feature === firstFeature
            ) {
              return beta1;
            }

            if (
              feature === secondFeature
            ) {
              return beta2;
            }

            return (
              model.coefficients[
                feature
              ] ?? 0
            );
          }
        );

      const l1 =
        coefficients.reduce(
          (sum, value) =>
            sum + Math.abs(value),
          0
        );

      const l2 =
        coefficients.reduce(
          (sum, value) =>
            sum + value * value,
          0
        );

      if (
        model.modelType === "ridge"
      ) {
        return (
          mse +
          model.alpha * l2
        );
      }

      if (
        model.modelType === "lasso"
      ) {
        return (
          mse +
          model.alpha * l1
        );
      }

      return (
        mse +
        model.alpha *
          (
            model.l1Ratio * l1 +
            (1 - model.l1Ratio) * l2
          )
      );
    }

    const zValues =
      beta2Values.map((beta2) =>
        beta1Values.map((beta1) =>
          objective(beta1, beta2)
        )
      );

    const optimumLoss = objective(
      firstCoefficient,
      secondCoefficient
    );

    return {
      beta1Values,
      beta2Values,
      zValues,
      firstCoefficient,
      secondCoefficient,
      optimumLoss,
    };
  }, [
    trainRows,
    model,
    firstFeature,
    secondFeature,
  ]);

  if (model.features.length < 2) {
    return (
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              3D LOSS LANDSCAPE
            </span>

            <h2>
              Two features are required
            </h2>
          </div>
        </div>

        <div className="info-box">
          Select at least two features to inspect
          the optimization landscape.
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            3D LOSS LANDSCAPE
          </span>

          <h2>
            See where {modelName(model)} finds its solution
          </h2>
        </div>

        <span className="value-pill">
          α = {model.alpha.toFixed(2)}
        </span>
      </div>

      <p className="muted">
        The horizontal axes are two standardized
        coefficients. Height represents the current
        optimization objective. The marker shows the
        coefficients learned by the model.
      </p>

      <div className="two-column-grid">
        <label className="input-card">
          <span>β₁ coefficient</span>

          <select
            value={firstFeature}
            onChange={(event) => {
              const next =
                event.target.value;

              setFirstFeature(next);

              if (
                next === secondFeature
              ) {
                const replacement =
                  model.features.find(
                    (feature) =>
                      feature !== next
                  );

                if (replacement) {
                  setSecondFeature(
                    replacement
                  );
                }
              }
            }}
          >
            {model.features.map(
              (feature) => (
                <option
                  key={feature}
                  value={feature}
                >
                  {feature}
                </option>
              )
            )}
          </select>
        </label>

        <label className="input-card">
          <span>β₂ coefficient</span>

          <select
            value={secondFeature}
            onChange={(event) => {
              const next =
                event.target.value;

              setSecondFeature(next);

              if (
                next === firstFeature
              ) {
                const replacement =
                  model.features.find(
                    (feature) =>
                      feature !== next
                  );

                if (replacement) {
                  setFirstFeature(
                    replacement
                  );
                }
              }
            }}
          >
            {model.features.map(
              (feature) => (
                <option
                  key={feature}
                  value={feature}
                >
                  {feature}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      {surface && (
        <Plot
          data={[
            {
              type: "surface",
              x: surface.beta1Values,
              y: surface.beta2Values,
              z: surface.zValues,
              name: "Objective surface",
              opacity: 0.88,
              showscale: true,

              colorbar: {
                title: {
                  text: "Objective",
                },
              },

              contours: {
                z: {
                  show: true,
                  usecolormap: true,
                  project: {
                    z: true,
                  },
                },
              },

              hovertemplate:
                `${firstFeature} β: %{x:.4f}<br>` +
                `${secondFeature} β: %{y:.4f}<br>` +
                `Objective: %{z:.4f}` +
                "<extra>Loss surface</extra>",
            },

            {
              type: "scatter3d",
              mode: "markers+text",

              x: [
                surface.firstCoefficient,
              ],

              y: [
                surface.secondCoefficient,
              ],

              z: [
                surface.optimumLoss,
              ],

              text: ["Current model"],

              textposition:
                "top center",

              name: "Current solution",

              marker: {
                size: 8,
                symbol: "diamond",
              },

              hovertemplate:
                `${firstFeature} β: %{x:.4f}<br>` +
                `${secondFeature} β: %{y:.4f}<br>` +
                `Objective: %{z:.4f}` +
                "<extra>Current solution</extra>",
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
                  text: `β: ${firstFeature}`,
                },
              },

              yaxis: {
                title: {
                  text: `β: ${secondFeature}`,
                },
              },

              zaxis: {
                title: {
                  text: "Objective",
                },
              },

              camera: {
                eye: {
                  x: 1.5,
                  y: 1.5,
                  z: 1.15,
                },
              },
            },

            paper_bgcolor:
              "transparent",
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
        Increase α and watch the solution move.
        Ridge adds an L2 penalty, Lasso adds an
        L1 penalty, and Elastic Net combines both.
        The intercept is not regularized.
      </div>
    </section>
  );
}