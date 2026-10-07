import { TrainedRegularizationModel } from "../types/regularization";

interface Props {
  model: TrainedRegularizationModel;
}

function modelName(type: TrainedRegularizationModel["modelType"]) {
  if (type === "linear") return "OLS Linear Regression";
  if (type === "ridge") return "Ridge Regression";
  if (type === "lasso") return "Lasso Regression";
  return "Elastic Net";
}

export default function RegularizationMetrics({ model }: Props) {
  const metrics = [
    {
      label: "Train MSE",
      value: model.trainMetrics.mse,
    },
    {
      label: "Test MSE",
      value: model.testMetrics.mse,
    },
    {
      label: "Train RMSE",
      value: model.trainMetrics.rmse,
    },
    {
      label: "Test RMSE",
      value: model.testMetrics.rmse,
    },
    {
      label: "Test MAE",
      value: model.testMetrics.mae,
    },
    {
      label: "Test R²",
      value: model.testMetrics.r2,
    },
  ];

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">MODEL PERFORMANCE</span>
          <h2>{modelName(model.modelType)}</h2>
        </div>

        <span className="value-pill">
          α = {model.alpha.toFixed(2)}
        </span>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value.toFixed(4)}</strong>
          </div>
        ))}
      </div>

      <div className="two-column-grid">
        <div className="mini-card">
          <span>Penalty</span>
          <strong>{model.penalty.toFixed(4)}</strong>
        </div>

        <div className="mini-card">
          <span>Objective</span>
          <strong>{model.objectiveValue.toFixed(4)}</strong>
        </div>
      </div>
    </section>
  );
}