interface FeatureRange {
  min: number;
  max: number;
}

interface Props {
  queryFeatures: number[];

  featureNames: string[];

  featureRanges: FeatureRange[];

  onQueryChange: (
    features: number[],
  ) => void;

  onReset?: () => void;
}

export default function QueryPointController({
  queryFeatures,
  featureNames,
  featureRanges,
  onQueryChange,
  onReset,
}: Props) {
  function updateFeature(
    index: number,
    value: number,
  ) {
    const updated = [
      ...queryFeatures,
    ];

    updated[index] = value;

    onQueryChange(updated);
  }

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            NEW SAMPLE
          </p>

          <h2>
            Query Point Controller
          </h2>

          <p className="knn-muted">
            Change the feature values
            of a new sample and watch
            KNN recalculate its nearest
            neighbors and prediction.
          </p>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
          >
            Reset Query
          </button>
        )}
      </div>

      <div className="knn-query-grid">
        {queryFeatures.map(
          (value, index) => {
            const range =
              featureRanges[index];

            const originalMin =
              range?.min ??
              value - 10;

            const originalMax =
              range?.max ??
              value + 10;

            const min =
              originalMin ===
              originalMax
                ? originalMin - 1
                : originalMin;

            const max =
              originalMin ===
              originalMax
                ? originalMax + 1
                : originalMax;

            const span =
              Math.abs(
                max - min,
              );

            const step =
              Math.max(
                span / 200,
                0.0001,
              );

            return (
              <div
                className="knn-control-block"
                key={
                  featureNames[
                    index
                  ] ??
                  index
                }
              >
                <div className="knn-section-heading">
                  <label>
                    {featureNames[
                      index
                    ] ??
                      `Feature ${
                        index + 1
                      }`}
                  </label>

                  <strong>
                    {value.toFixed(
                      4,
                    )}
                  </strong>
                </div>

                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={Math.min(
                    max,
                    Math.max(
                      min,
                      value,
                    ),
                  )}
                  onChange={(
                    event,
                  ) =>
                    updateFeature(
                      index,
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                />

                <input
                  type="number"
                  value={value}
                  step={step}
                  onChange={(
                    event,
                  ) =>
                    updateFeature(
                      index,
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                />

                <div className="knn-range-labels">
                  <span>
                    {min.toFixed(
                      2,
                    )}
                  </span>

                  <span>
                    {max.toFixed(
                      2,
                    )}
                  </span>
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className="knn-info-box">
        <strong>
          What happens when you move
          the query?
        </strong>

        <p>
          KNN recalculates the distance
          from this new sample to the
          stored training samples,
          sorts those distances, selects
          the nearest K samples and
          produces a new prediction.
        </p>
      </div>
    </section>
  );
}