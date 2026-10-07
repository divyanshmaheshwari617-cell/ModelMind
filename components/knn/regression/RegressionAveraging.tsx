import type {
  RegressionPrediction,
  WeightingMethod,
} from "../types/knn";

interface Props {
  prediction: RegressionPrediction;
  weighting: WeightingMethod;
}

export default function RegressionAveraging({
  prediction,
  weighting,
}: Props) {
  const numerator =
    prediction.neighbors.reduce(
      (sum, neighbor) => {
        const target =
          typeof neighbor.row.target ===
          "number"
            ? neighbor.row.target
            : 0;

        return (
          sum +
          target *
            (weighting === "distance"
              ? neighbor.weight
              : 1)
        );
      },
      0,
    );

  const denominator =
    weighting === "distance"
      ? prediction.neighbors.reduce(
          (sum, neighbor) =>
            sum + neighbor.weight,
          0,
        )
      : prediction.neighbors.length;

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            STEP 3
          </p>

          <h2>
            Neighbor Averaging
          </h2>
        </div>

        <span className="knn-badge">
          Regression
        </span>
      </div>

      <div className="knn-prediction-box">
        <span>
          Predicted Value
        </span>

        <strong>
          {prediction.predictedValue.toFixed(
            4,
          )}
        </strong>
      </div>

      <div className="knn-table-wrap">
        <table className="knn-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Target Value</th>
              <th>Distance</th>
              <th>Weight</th>
              <th>
                Contribution
              </th>
            </tr>
          </thead>

          <tbody>
            {prediction.neighbors.map(
              (neighbor) => {
                const target =
                  typeof neighbor.row
                    .target === "number"
                    ? neighbor.row.target
                    : 0;

                const effectiveWeight =
                  weighting ===
                  "distance"
                    ? neighbor.weight
                    : 1;

                return (
                  <tr
                    key={`${neighbor.index}-${neighbor.rank}`}
                  >
                    <td>
                      #{neighbor.rank}
                    </td>

                    <td>
                      {target.toFixed(
                        4,
                      )}
                    </td>

                    <td>
                      {neighbor.distance.toFixed(
                        4,
                      )}
                    </td>

                    <td>
                      {effectiveWeight.toFixed(
                        4,
                      )}
                    </td>

                    <td>
                      {(
                        target *
                        effectiveWeight
                      ).toFixed(4)}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>

      <div className="knn-formula-box">
        {weighting === "uniform"
          ? `Prediction = sum of neighbor targets / ${prediction.neighbors.length}`
          : "Prediction = Σ(target × weight) / Σ(weight)"}
      </div>

      <div className="knn-stat-grid">
        <div className="knn-stat">
          <span>
            Numerator
          </span>

          <strong>
            {numerator.toFixed(4)}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Denominator
          </span>

          <strong>
            {denominator.toFixed(4)}
          </strong>
        </div>
      </div>

      <div className="knn-info-box">
        <strong>
          Classification vs Regression
        </strong>

        <p>
          Classification asks the
          neighbors to vote for a class.
          Regression instead combines
          their numerical target values
          to produce a continuous
          prediction.
        </p>
      </div>
    </section>
  );
}