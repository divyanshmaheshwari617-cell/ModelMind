import type {
  DistanceMetric,
} from "../types/knn";

interface Props {
  metric: DistanceMetric;
  minkowskiP: number;
  queryFeatures?: number[];
  neighborFeatures?: number[];
  featureNames?: string[];
}

export default function DistanceExplanation({
  metric,
  minkowskiP,
  queryFeatures,
  neighborFeatures,
  featureNames,
}: Props) {
  const hasExample =
    queryFeatures &&
    neighborFeatures &&
    queryFeatures.length ===
      neighborFeatures.length &&
    queryFeatures.length > 0;

  const differences =
    hasExample
      ? queryFeatures.map(
          (value, index) =>
            Math.abs(
              value -
                neighborFeatures[index],
            ),
        )
      : [];

  return (
    <section className="knn-card">
      <p className="knn-eyebrow">
        STEP 1
      </p>

      <h2>
        Calculate Distance
      </h2>

      {metric === "euclidean" && (
        <>
          <div className="knn-formula-box">
            d(x,q) = √Σ(xᵢ - qᵢ)²
          </div>

          <p className="knn-muted">
            Euclidean distance measures
            straight-line distance between
            two points.
          </p>
        </>
      )}

      {metric === "manhattan" && (
        <>
          <div className="knn-formula-box">
            d(x,q) = Σ|xᵢ - qᵢ|
          </div>

          <p className="knn-muted">
            Manhattan distance adds the
            absolute movement along each
            feature dimension.
          </p>
        </>
      )}

      {metric === "minkowski" && (
        <>
          <div className="knn-formula-box">
            d(x,q) =
            (Σ|xᵢ - qᵢ|ᵖ)^(1/p)
          </div>

          <p className="knn-muted">
            Current p = {minkowskiP}.
            Minkowski distance generalizes
            Manhattan and Euclidean
            distance.
          </p>
        </>
      )}

      {hasExample && (
        <div className="knn-distance-example">
          <h3>
            Live distance breakdown
          </h3>

          <div className="knn-table-wrap">
            <table className="knn-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Query</th>
                  <th>Neighbor</th>
                  <th>|Difference|</th>
                </tr>
              </thead>

              <tbody>
                {differences.map(
                  (difference, index) => (
                    <tr key={index}>
                      <td>
                        {featureNames?.[
                          index
                        ] ??
                          `Feature ${
                            index + 1
                          }`}
                      </td>

                      <td>
                        {queryFeatures[
                          index
                        ].toFixed(3)}
                      </td>

                      <td>
                        {neighborFeatures[
                          index
                        ].toFixed(3)}
                      </td>

                      <td>
                        {difference.toFixed(
                          3,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}