import { TrainedRegularizationModel } from "../types/regularization";

interface Props {
  linearModel: TrainedRegularizationModel;
  selectedModel: TrainedRegularizationModel;
}

function metricGap(model: TrainedRegularizationModel): number {
  return model.testMetrics.mse - model.trainMetrics.mse;
}

export default function OverfittingVisualizer({
  linearModel,
  selectedModel,
}: Props) {
  const linearGap = metricGap(linearModel);
  const selectedGap = metricGap(selectedModel);

  const regularizationImprovedGap =
    Math.abs(selectedGap) < Math.abs(linearGap);

  const linearTrain = linearModel.trainMetrics.rmse;
  const linearTest = linearModel.testMetrics.rmse;

  const selectedTrain = selectedModel.trainMetrics.rmse;
  const selectedTest = selectedModel.testMetrics.rmse;

  const maxValue = Math.max(
    linearTrain,
    linearTest,
    selectedTrain,
    selectedTest,
    0.0001
  );

  function height(value: number) {
    return Math.max(8, (value / maxValue) * 180);
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">OVERFITTING LAB</span>
          <h2>Training performance is not the whole story</h2>
        </div>
      </div>

      <p className="muted">
        An overfit model can perform extremely well on training examples
        but generalize poorly to unseen test examples. Regularization
        intentionally constrains model complexity.
      </p>

      <div className="overfit-grid">
        <div className="comparison-card">
          <h3>OLS — no penalty</h3>

          <div className="bar-chart">
            <div className="bar-item">
              <div
                className="metric-bar"
                style={{ height: `${height(linearTrain)}px` }}
              />
              <strong>{linearTrain.toFixed(3)}</strong>
              <span>Train RMSE</span>
            </div>

            <div className="bar-item">
              <div
                className="metric-bar"
                style={{ height: `${height(linearTest)}px` }}
              />
              <strong>{linearTest.toFixed(3)}</strong>
              <span>Test RMSE</span>
            </div>
          </div>

          <p>
            Generalization MSE gap:{" "}
            <strong>{linearGap.toFixed(4)}</strong>
          </p>
        </div>

        <div className="comparison-card">
          <h3>
            {selectedModel.modelType === "linear"
              ? "Selected OLS"
              : selectedModel.modelType === "ridge"
              ? "Ridge"
              : selectedModel.modelType === "lasso"
              ? "Lasso"
              : "Elastic Net"}
          </h3>

          <div className="bar-chart">
            <div className="bar-item">
              <div
                className="metric-bar"
                style={{ height: `${height(selectedTrain)}px` }}
              />
              <strong>{selectedTrain.toFixed(3)}</strong>
              <span>Train RMSE</span>
            </div>

            <div className="bar-item">
              <div
                className="metric-bar"
                style={{ height: `${height(selectedTest)}px` }}
              />
              <strong>{selectedTest.toFixed(3)}</strong>
              <span>Test RMSE</span>
            </div>
          </div>

          <p>
            Generalization MSE gap:{" "}
            <strong>{selectedGap.toFixed(4)}</strong>
          </p>
        </div>
      </div>

      {selectedModel.modelType !== "linear" && (
        <div
          className={
            regularizationImprovedGap
              ? "success-box"
              : "info-box"
          }
        >
          {regularizationImprovedGap
            ? "For this split, regularization reduced the train/test MSE gap. This is evidence of improved generalization balance, although test performance should also be checked."
            : "For this split, regularization did not reduce the train/test MSE gap. Try changing α and watch how bias and variance change."}
        </div>
      )}

      <div className="concept-grid">
        <div className="concept-card">
          <span className="concept-number">1</span>
          <h3>Low training error</h3>
          <p>
            This only tells us how closely the model fits examples it
            already saw.
          </p>
        </div>

        <div className="concept-card">
          <span className="concept-number">2</span>
          <h3>Test error</h3>
          <p>
            Unseen examples provide a better indication of how the model
            generalizes.
          </p>
        </div>

        <div className="concept-card">
          <span className="concept-number">3</span>
          <h3>Regularization</h3>
          <p>
            Ridge, Lasso and Elastic Net trade some fitting freedom for
            simpler coefficient patterns.
          </p>
        </div>
      </div>
    </section>
  );
}