import {
  getFeatureRanges,
  shouldRecommendScaling,
} from "./preprocessingMath";

import type {
  RawDatasetRow,
} from "./preprocessingMath";

interface Props {
  rows: RawDatasetRow[];

  featureColumns: string[];

  scalingEnabled: boolean;

  onScalingChange: (
    enabled: boolean,
  ) => void;
}

export default function ScalingAnalyzer({
  rows,
  featureColumns,
  scalingEnabled,
  onScalingChange,
}: Props) {
  const ranges =
    getFeatureRanges(
      rows,
      featureColumns,
    );

  const scalingRecommended =
    shouldRecommendScaling(
      rows,
      featureColumns,
    );

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            DISTANCE HEALTH
          </p>

          <h2>
            Feature Scaling
          </h2>
        </div>

        <span
          className={
            scalingRecommended
              ? "knn-badge knn-badge-warning"
              : "knn-badge"
          }
        >
          {scalingRecommended
            ? "Recommended"
            : "Check complete"}
        </span>
      </div>

      <div className="knn-concept-box">
        <strong>
          Why does scaling matter
          more in KNN?
        </strong>

        <p>
          KNN decides which samples
          are close by calculating
          distances. A feature with
          a much larger numerical
          range can dominate the
          distance even when it is
          not more important.
        </p>
      </div>

      {ranges.length === 0 ? (
        <p className="knn-muted">
          Select numerical features
          to analyze their scales.
        </p>
      ) : (
        <div className="knn-table-wrap">
          <table className="knn-table">
            <thead>
              <tr>
                <th>
                  Feature
                </th>

                <th>
                  Minimum
                </th>

                <th>
                  Maximum
                </th>

                <th>
                  Range
                </th>
              </tr>
            </thead>

            <tbody>
              {ranges.map(
                (item) => (
                  <tr
                    key={
                      item.feature
                    }
                  >
                    <td>
                      {
                        item.feature
                      }
                    </td>

                    <td>
                      {item.min.toFixed(
                        3,
                      )}
                    </td>

                    <td>
                      {item.max.toFixed(
                        3,
                      )}
                    </td>

                    <td>
                      {item.range.toFixed(
                        3,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {scalingRecommended ? (
        <div className="knn-warning-box">
          <strong>
            Scaling is strongly
            recommended.
          </strong>

          <p>
            The selected features
            have substantially
            different ranges.
            Without scaling, the
            largest-scale feature
            may dominate neighbor
            selection.
          </p>
        </div>
      ) : (
        <div className="knn-info-box">
          <strong>
            Scaling can still be
            useful.
          </strong>

          <p>
            Even when feature ranges
            look similar,
            standardization is often
            useful for a
            distance-based model
            such as KNN.
          </p>
        </div>
      )}

      <label className="knn-toggle-row">
        <input
          type="checkbox"
          checked={scalingEnabled}
          onChange={(event) =>
            onScalingChange(
              event.target.checked,
            )
          }
        />

        <div>
          <strong>
            Standardize features
          </strong>

          <p>
            Convert features to
            comparable scales using
            their mean and standard
            deviation.
          </p>
        </div>
      </label>
    </section>
  );
}