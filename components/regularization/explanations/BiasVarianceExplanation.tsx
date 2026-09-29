import { TrainedRegularizationModel } from "../types/regularization";

interface Props {
  model: TrainedRegularizationModel;
}

export default function BiasVarianceExplanation({
  model,
}: Props) {
  const gap =
    model.testMetrics.mse - model.trainMetrics.mse;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">BIAS–VARIANCE</span>
          <h2>Regularization is a trade-off</h2>
        </div>
      </div>

      <div className="bias-scale">
        <div>
          <strong>Too little regularization</strong>
          <span>Lower bias / potentially higher variance</span>
        </div>

        <div>
          <strong>Balanced</strong>
          <span>Useful generalization region</span>
        </div>

        <div>
          <strong>Too much regularization</strong>
          <span>Higher bias / lower flexibility</span>
        </div>
      </div>

      <div className="three-column-grid">
        <div className="mini-card">
          <span>α</span>
          <strong>{model.alpha.toFixed(2)}</strong>
        </div>

        <div className="mini-card">
          <span>Train MSE</span>
          <strong>{model.trainMetrics.mse.toFixed(4)}</strong>
        </div>

        <div className="mini-card">
          <span>Test − Train MSE</span>
          <strong>{gap.toFixed(4)}</strong>
        </div>
      </div>

      <div className="info-box">
        Increasing α is not automatically better. Very strong
        regularization can make the model too simple and cause
        underfitting.
      </div>
    </section>
  );
}