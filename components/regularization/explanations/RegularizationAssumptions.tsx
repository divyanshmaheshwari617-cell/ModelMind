import {
  TrainedRegularizationModel,
} from "../types/regularization";

interface Props {
  model: TrainedRegularizationModel;
}

export default function RegularizationAssumptions({
  model,
}: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            ASSUMPTIONS & LIMITATIONS
          </span>

          <h2>
            Know when regularized
            linear regression works
          </h2>
        </div>
      </div>

      <div className="three-column-grid">
        <div className="mini-card">
          <span>01</span>
          <strong>
            Linear relationship
          </strong>
          <p className="muted">
            The model assumes the
            target can be reasonably
            represented by a linear
            combination of features.
          </p>
        </div>

        <div className="mini-card">
          <span>02</span>
          <strong>
            Feature scaling
          </strong>
          <p className="muted">
            Regularization depends on
            coefficient magnitude, so
            features should be placed
            on comparable scales.
          </p>
        </div>

        <div className="mini-card">
          <span>03</span>
          <strong>
            Outliers matter
          </strong>
          <p className="muted">
            Squared-error regression
            can be strongly affected
            by extreme observations.
          </p>
        </div>

        <div className="mini-card">
          <span>04</span>
          <strong>
            Correlated features
          </strong>
          <p className="muted">
            Ridge can distribute
            weight across correlated
            predictors, while Lasso
            may keep some and remove
            others.
          </p>
        </div>

        <div className="mini-card">
          <span>05</span>
          <strong>
            α must be chosen
          </strong>
          <p className="muted">
            Too little
            regularization may leave
            overfitting; too much may
            cause underfitting.
          </p>
        </div>

        <div className="mini-card">
          <span>06</span>
          <strong>
            Extrapolation risk
          </strong>
          <p className="muted">
            Predictions far outside
            the training-data range
            may be unreliable.
          </p>
        </div>
      </div>

      <div
        className="info-box"
        style={{
          marginTop: 20,
        }}
      >
        Current experiment:{" "}
        {model.features.length}{" "}
        features, α ={" "}
        {model.alpha.toFixed(2)}
        {model.modelType ===
          "elastic-net"
          ? `, L1 ratio = ${model.l1Ratio.toFixed(
              2
            )}`
          : ""}
        .
      </div>
    </section>
  );
}