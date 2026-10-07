import {
  TrainedRegularizationModel,
} from "../types/regularization";

import {
  coefficientMagnitude,
  countZeroCoefficients,
} from "../utils/regularizationMath";

interface Props {
  models: TrainedRegularizationModel[];
}

function name(model: TrainedRegularizationModel) {
  if (model.modelType === "linear") return "OLS";
  if (model.modelType === "ridge") return "Ridge";
  if (model.modelType === "lasso") return "Lasso";
  return "Elastic Net";
}

export default function ModelComparisonDashboard({
  models,
}: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FINAL COMPARISON</span>
          <h2>OLS vs Ridge vs Lasso vs Elastic Net</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Train RMSE</th>
              <th>Test RMSE</th>
              <th>Test R²</th>
              <th>|β| total</th>
              <th>Zero coefficients</th>
              <th>Penalty</th>
            </tr>
          </thead>

          <tbody>
            {models.map((model) => (
              <tr key={model.modelType}>
                <td>
                  <strong>{name(model)}</strong>
                </td>

                <td>{model.trainMetrics.rmse.toFixed(4)}</td>
                <td>{model.testMetrics.rmse.toFixed(4)}</td>
                <td>{model.testMetrics.r2.toFixed(4)}</td>

                <td>
                  {coefficientMagnitude(model).toFixed(4)}
                </td>

                <td>{countZeroCoefficients(model)}</td>

                <td>{model.penalty.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box">
        Lower coefficient magnitude means the model is being constrained
        more strongly. Lasso can produce exact zero coefficients, while
        Ridge generally shrinks coefficients continuously toward zero.
      </div>
    </section>
  );
}