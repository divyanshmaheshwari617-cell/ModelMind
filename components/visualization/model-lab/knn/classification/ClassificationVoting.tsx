import type {
  ClassificationPrediction,
  WeightingMethod,
} from "../types/knn";

interface Props {
  prediction: ClassificationPrediction;
  weighting: WeightingMethod;
}

export default function ClassificationVoting({
  prediction,
  weighting,
}: Props) {
  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            STEP 3
          </p>

          <h2>
            Neighbor Voting
          </h2>
        </div>

        <span className="knn-badge">
          Classification
        </span>
      </div>

      <div className="knn-prediction-box">
        <span>
          Final Prediction
        </span>

        <strong>
          {String(
            prediction.predictedClass,
          )}
        </strong>
      </div>

      <div className="knn-table-wrap">
        <table className="knn-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Neighbors</th>
              <th>
                Weighted Vote
              </th>
              <th>Influence</th>
            </tr>
          </thead>

          <tbody>
            {prediction.votes.map(
              (vote) => (
                <tr
                  key={String(
                    vote.classLabel,
                  )}
                >
                  <td>
                    {String(
                      vote.classLabel,
                    )}
                  </td>

                  <td>
                    {vote.votes}
                  </td>

                  <td>
                    {vote.weightedVotes.toFixed(
                      4,
                    )}
                  </td>

                  <td>
                    {vote.percentage.toFixed(
                      1,
                    )}
                    %
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="knn-concept-box">
        <strong>
          {weighting === "uniform"
            ? "Majority voting"
            : "Distance-weighted voting"}
        </strong>

        <p>
          {weighting === "uniform"
            ? "Every selected neighbor gets one equal vote. The class receiving the strongest vote becomes the prediction."
            : "Closer neighbors receive more influence than distant neighbors. The class with the strongest total weighted vote becomes the prediction."}
        </p>
      </div>

      <div className="knn-neighbor-vote-list">
        {prediction.neighbors.map(
          (neighbor) => (
            <div
              key={`${neighbor.index}-${neighbor.rank}`}
              className="knn-neighbor-vote"
            >
              <span>
                #{neighbor.rank}
              </span>

              <strong>
                {String(
                  neighbor.row.target,
                )}
              </strong>

              <small>
                distance{" "}
                {neighbor.distance.toFixed(
                  4,
                )}
              </small>
            </div>
          ),
        )}
      </div>
    </section>
  );
}