import {
  TrainedRegularizationModel,
} from "../types/regularization";

interface Props {
  linearModel: TrainedRegularizationModel;
  selectedModel: TrainedRegularizationModel;
}

export default function CoefficientShrinkageGraph({
  linearModel,
  selectedModel,
}: Props) {
  const features = linearModel.features;

  const maxMagnitude = Math.max(
    ...features.flatMap((feature) => [
      Math.abs(linearModel.coefficients[feature] ?? 0),
      Math.abs(selectedModel.coefficients[feature] ?? 0),
    ]),
    0.0001
  );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">COEFFICIENT SHRINKAGE</span>
          <h2>Watch regularization constrain coefficients</h2>
        </div>
      </div>

      <p className="muted">
        Compare each coefficient with ordinary least squares. Increasing
        regularization strength usually pulls coefficients toward zero.
      </p>

      <div className="coefficient-list">
        {features.map((feature) => {
          const original = linearModel.coefficients[feature] ?? 0;
          const regularized = selectedModel.coefficients[feature] ?? 0;

          const originalWidth =
            (Math.abs(original) / maxMagnitude) * 100;

          const regularizedWidth =
            (Math.abs(regularized) / maxMagnitude) * 100;

          return (
            <div className="coefficient-row" key={feature}>
              <h3>{feature}</h3>

              <div className="coefficient-bar-line">
                <span>OLS</span>
                <div className="horizontal-track">
                  <div
                    className="horizontal-bar"
                    style={{ width: `${originalWidth}%` }}
                  />
                </div>
                <strong>{original.toFixed(4)}</strong>
              </div>

              <div className="coefficient-bar-line">
                <span>Selected</span>
                <div className="horizontal-track">
                  <div
                    className="horizontal-bar regularized"
                    style={{ width: `${regularizedWidth}%` }}
                  />
                </div>
                <strong>{regularized.toFixed(4)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}