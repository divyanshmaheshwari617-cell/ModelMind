import {
  TrainedRegularizationModel,
} from "../types/regularization";

interface Props {
  model: TrainedRegularizationModel;
}

function penaltyFormula(
  model: TrainedRegularizationModel
): string {
  if (
    model.modelType === "ridge"
  ) {
    return "λ Σ βⱼ²";
  }

  if (
    model.modelType === "lasso"
  ) {
    return "λ Σ |βⱼ|";
  }

  if (
    model.modelType ===
    "elastic-net"
  ) {
    return (
      "λ [ρ Σ |βⱼ| + " +
      "(1 − ρ) Σ βⱼ²]"
    );
  }

  return "0";
}

function name(
  model: TrainedRegularizationModel
) {
  if (
    model.modelType === "linear"
  ) {
    return "Linear Regression";
  }

  if (
    model.modelType === "ridge"
  ) {
    return "Ridge Regression";
  }

  if (
    model.modelType === "lasso"
  ) {
    return "Lasso Regression";
  }

  return "Elastic Net";
}

export default function RegularizationMathWalkthrough({
  model,
}: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            STEP-BY-STEP MATH
          </span>

          <h2>
            How {name(model)} builds
            its objective
          </h2>
        </div>
      </div>

      <div className="learning-flow">
        <span>Prediction</span>
        <strong>→</strong>
        <span>Error</span>
        <strong>→</strong>
        <span>MSE</span>
        <strong>→</strong>
        <span>Penalty</span>
        <strong>→</strong>
        <span>Objective</span>
        <strong>→</strong>
        <span>Best β</span>
      </div>

      <div
        className="three-column-grid"
        style={{
          marginTop: 22,
        }}
      >
        <div className="mini-card">
          <span>Step 1</span>
          <strong>
            Make a prediction
          </strong>

          <p>
            ŷ = β₀ + β₁x₁ +
            β₂x₂ + ... + βₙxₙ
          </p>
        </div>

        <div className="mini-card">
          <span>Step 2</span>
          <strong>
            Calculate residual
          </strong>

          <p>
            eᵢ = yᵢ − ŷᵢ
          </p>
        </div>

        <div className="mini-card">
          <span>Step 3</span>
          <strong>
            Measure prediction loss
          </strong>

          <p>
            MSE = (1/n) Σ
            (yᵢ − ŷᵢ)²
          </p>
        </div>

        <div className="mini-card">
          <span>Step 4</span>
          <strong>
            Add regularization
          </strong>

          <p>
            Penalty ={" "}
            {penaltyFormula(model)}
          </p>
        </div>

        <div className="mini-card">
          <span>Step 5</span>
          <strong>
            Build objective
          </strong>

          <p>
            Objective = MSE +
            Penalty
          </p>
        </div>

        <div className="mini-card">
          <span>Step 6</span>
          <strong>
            Optimize coefficients
          </strong>

          <p>
            Choose β values that
            reduce the complete
            objective.
          </p>
        </div>
      </div>

      <div
        className="three-column-grid"
        style={{
          marginTop: 20,
        }}
      >
        <div className="mini-card">
          <span>Current MSE</span>

          <strong>
            {model.trainMetrics.mse.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="mini-card">
          <span>
            Current penalty
          </span>

          <strong>
            {model.penalty.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="mini-card">
          <span>
            Current objective
          </span>

          <strong>
            {model.objectiveValue.toFixed(
              4
            )}
          </strong>
        </div>
      </div>

      <div
        className="info-box"
        style={{
          marginTop: 20,
        }}
      >
        The intercept β₀ is not
        regularized in this lab.
        Regularization acts on the
        feature coefficients so the
        model trades some training
        fit for potentially better
        generalization.
      </div>
    </section>
  );
}