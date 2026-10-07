import type {
  RegressionMetrics as RegressionMetricsType,
} from "../types/knn";

interface Props {
  metrics:
    RegressionMetricsType;
}

export default function RegressionMetrics({
  metrics,
}: Props) {
  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            MODEL EVALUATION
          </p>

          <h2>
            Regression Metrics
          </h2>
        </div>

        <span className="knn-badge">
          KNN Regression
        </span>
      </div>

      <div className="knn-stat-grid">
        <div className="knn-stat">
          <span>
            MSE
          </span>

          <strong>
            {metrics.mse.toFixed(
              4,
            )}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            RMSE
          </span>

          <strong>
            {metrics.rmse.toFixed(
              4,
            )}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            MAE
          </span>

          <strong>
            {metrics.mae.toFixed(
              4,
            )}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            R²
          </span>

          <strong>
            {metrics.r2.toFixed(
              4,
            )}
          </strong>
        </div>
      </div>

      <div className="knn-concept-box">
        <strong>
          MSE
        </strong>

        <p>
          Mean Squared Error squares
          prediction errors before
          averaging them, so large
          mistakes receive a stronger
          penalty.
        </p>
      </div>

      <div className="knn-concept-box">
        <strong>
          RMSE
        </strong>

        <p>
          Root Mean Squared Error is
          the square root of MSE and
          returns the error to the
          same units as the target.
        </p>
      </div>

      <div className="knn-concept-box">
        <strong>
          MAE
        </strong>

        <p>
          Mean Absolute Error measures
          the average absolute
          difference between actual
          and predicted values.
        </p>
      </div>

      <div className="knn-concept-box">
        <strong>
          R²
        </strong>

        <p>
          R² describes how much of the
          target variation is captured
          by the model relative to
          predicting the target mean.
        </p>
      </div>
    </section>
  );
}