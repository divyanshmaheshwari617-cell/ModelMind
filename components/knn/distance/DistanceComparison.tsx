import {
  euclideanDistance,
  manhattanDistance,
  minkowskiDistance,
} from "../utils/knnMath";

interface Props {
  queryFeatures: number[];
  neighborFeatures: number[];
  minkowskiP: number;
}

export default function DistanceComparison({
  queryFeatures,
  neighborFeatures,
  minkowskiP,
}: Props) {
  const valid =
    queryFeatures.length > 0 &&
    queryFeatures.length ===
      neighborFeatures.length;

  if (!valid) {
    return (
      <section className="knn-card">
        <h2>
          Distance Comparison
        </h2>

        <p className="knn-muted">
          Select a query point and a
          neighbor to compare distance
          metrics.
        </p>
      </section>
    );
  }

  const euclidean =
    euclideanDistance(
      queryFeatures,
      neighborFeatures,
    );

  const manhattan =
    manhattanDistance(
      queryFeatures,
      neighborFeatures,
    );

  const minkowski =
    minkowskiDistance(
      queryFeatures,
      neighborFeatures,
      minkowskiP,
    );

  return (
    <section className="knn-card">
      <p className="knn-eyebrow">
        DISTANCE LAB
      </p>

      <h2>
        Compare Distance Metrics
      </h2>

      <div className="knn-stat-grid">
        <div className="knn-stat">
          <span>
            Euclidean
          </span>

          <strong>
            {euclidean.toFixed(4)}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Manhattan
          </span>

          <strong>
            {manhattan.toFixed(4)}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Minkowski
            {" "}
            (p={minkowskiP})
          </span>

          <strong>
            {minkowski.toFixed(4)}
          </strong>
        </div>
      </div>

      <div className="knn-info-box">
        <strong>
          Why can the nearest neighbors
          change?
        </strong>

        <p>
          Different distance metrics define
          closeness differently. Therefore,
          changing the metric can change the
          order of neighbors and eventually
          change the prediction.
        </p>
      </div>
    </section>
  );
}