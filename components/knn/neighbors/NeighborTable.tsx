import type {
  Neighbor,
} from "../types/knn";

interface Props {
  neighbors: Neighbor[];
  visibleCount?: number;
}

export default function NeighborTable({
  neighbors,
  visibleCount,
}: Props) {
  const visible =
    visibleCount === undefined
      ? neighbors
      : neighbors.slice(
          0,
          Math.max(
            0,
            visibleCount,
          ),
        );

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            STEP 2
          </p>

          <h2>
            Nearest Neighbor Ranking
          </h2>
        </div>

        <span className="knn-badge">
          {visible.length} visible
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="knn-muted">
          Start the animation to reveal
          neighbors from closest to
          farthest.
        </p>
      ) : (
        <div className="knn-table-wrap">
          <table className="knn-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Target</th>
                <th>Distance</th>
                <th>Weight</th>
              </tr>
            </thead>

            <tbody>
              {visible.map(
                (neighbor) => (
                  <tr
                    key={`${neighbor.index}-${neighbor.rank}`}
                  >
                    <td>
                      #{neighbor.rank}
                    </td>

                    <td>
                      {String(
                        neighbor.row
                          .target,
                      )}
                    </td>

                    <td>
                      {neighbor.distance.toFixed(
                        5,
                      )}
                    </td>

                    <td>
                      {neighbor.weight.toFixed(
                        5,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}