import type {
  DistanceMetric,
  KNNTask,
  WeightingMethod,
} from "./types/knn";

interface Props {
  task: KNNTask;
  rowCount: number;
  featureCount: number;
  k: number;
  distanceMetric: DistanceMetric;
  weighting: WeightingMethod;
  scalingEnabled: boolean;
  bestK?: number;
}

export default function KNNLearningDashboard({
  task,
  rowCount,
  featureCount,
  k,
  distanceMetric,
  weighting,
  scalingEnabled,
  bestK,
}: Props) {
  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            FINAL DASHBOARD
          </p>

          <h2>
            What ModelMind Learned
          </h2>
        </div>

        <span className="knn-badge">
          KNN{" "}
          {task === "classification"
            ? "Classification"
            : "Regression"}
        </span>
      </div>

      <div className="knn-stat-grid">
        <div className="knn-stat">
          <span>
            Samples
          </span>
          <strong>{rowCount}</strong>
        </div>

        <div className="knn-stat">
          <span>
            Features
          </span>
          <strong>{featureCount}</strong>
        </div>

        <div className="knn-stat">
          <span>
            Current K
          </span>
          <strong>{k}</strong>
        </div>

        <div className="knn-stat">
          <span>
            Suggested K
          </span>
          <strong>
            {bestK ?? "—"}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Distance
          </span>
          <strong>
            {distanceMetric}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Weighting
          </span>
          <strong>
            {weighting}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Scaling
          </span>
          <strong>
            {scalingEnabled
              ? "Enabled"
              : "Disabled"}
          </strong>
        </div>
      </div>

      <div className="knn-concept-box">
        <strong>
          Complete KNN reasoning
        </strong>

        <p>
          Query sample → preprocess
          features → calculate distances →
          rank training samples → choose K
          nearest neighbors → combine
          neighbor information → produce
          prediction.
        </p>
      </div>

      <div className="knn-info-box">
        <strong>
          Good KNN workflow
        </strong>

        <p>
          Handle missing values, scale
          distance-sensitive features,
          choose an appropriate distance
          metric, evaluate multiple K
          values using validation data and
          inspect metrics on unseen data.
        </p>
      </div>

      <div className="knn-warning-box">
        <strong>
          Limitations
        </strong>

        <p>
          KNN can become slow with large
          datasets, sensitive to irrelevant
          features, sensitive to feature
          scaling, and less effective in
          very high-dimensional spaces.
        </p>
      </div>
    </section>
  );
}