import { TrainedRegularizationModel } from "../types/regularization";

interface Props {
  model: TrainedRegularizationModel;
}

export default function RegularizationPenaltyGraph({
  model,
}: Props) {
  const coefficients = Object.values(model.coefficients);

  const l1 = coefficients.reduce(
    (sum, coefficient) => sum + Math.abs(coefficient),
    0
  );

  const l2 = coefficients.reduce(
    (sum, coefficient) => sum + coefficient * coefficient,
    0
  );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">PENALTY INSPECTOR</span>
          <h2>What exactly is being penalized?</h2>
        </div>
      </div>

      <div className="three-column-grid">
        <div className="concept-card">
          <span className="concept-number">L1</span>
          <h3>Absolute magnitude</h3>
          <strong>{l1.toFixed(4)}</strong>
          <p>Σ |βᵢ|</p>
        </div>

        <div className="concept-card">
          <span className="concept-number">L2</span>
          <h3>Squared magnitude</h3>
          <strong>{l2.toFixed(4)}</strong>
          <p>Σ βᵢ²</p>
        </div>

        <div className="concept-card">
          <span className="concept-number">OBJ</span>
          <h3>Current objective</h3>
          <strong>{model.objectiveValue.toFixed(4)}</strong>
          <p>Training MSE + penalty</p>
        </div>
      </div>

      <div className="info-box">
        The intercept is intentionally excluded from the regularization
        penalty. Only feature coefficients are constrained.
      </div>
    </section>
  );
}