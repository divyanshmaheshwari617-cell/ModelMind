import type {
  DistanceMetric,
  WeightingMethod,
} from "../types/knn";

interface Props {
  k: number;
  maxK: number;
  distanceMetric: DistanceMetric;
  weighting: WeightingMethod;
  minkowskiP: number;

  onKChange: (value: number) => void;

  onDistanceMetricChange: (
    value: DistanceMetric,
  ) => void;

  onWeightingChange: (
    value: WeightingMethod,
  ) => void;

  onMinkowskiPChange: (
    value: number,
  ) => void;
}

export default function KNNControls({
  k,
  maxK,
  distanceMetric,
  weighting,
  minkowskiP,
  onKChange,
  onDistanceMetricChange,
  onWeightingChange,
  onMinkowskiPChange,
}: Props) {
  const safeMaxK = Math.max(1, maxK);

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            MODEL CONTROLS
          </p>

          <h2>
            Configure KNN
          </h2>
        </div>

        <span className="knn-badge">
          K = {k}
        </span>
      </div>

      <div className="knn-control-block">
        <label>
          Number of neighbors (K)
        </label>

        <input
          type="range"
          min={1}
          max={safeMaxK}
          step={1}
          value={Math.min(k, safeMaxK)}
          onChange={(event) =>
            onKChange(
              Number(event.target.value),
            )
          }
        />

        <div className="knn-range-labels">
          <span>1</span>
          <strong>{k}</strong>
          <span>{safeMaxK}</span>
        </div>

        <p className="knn-muted">
          Small K creates a more flexible
          model. Large K considers a wider
          neighborhood and usually creates
          smoother predictions.
        </p>
      </div>

      <div className="knn-control-block">
        <label>
          Distance metric
        </label>

        <select
          value={distanceMetric}
          onChange={(event) =>
            onDistanceMetricChange(
              event.target
                .value as DistanceMetric,
            )
          }
        >
          <option value="euclidean">
            Euclidean Distance
          </option>

          <option value="manhattan">
            Manhattan Distance
          </option>

          <option value="minkowski">
            Minkowski Distance
          </option>
        </select>
      </div>

      {distanceMetric === "minkowski" && (
        <div className="knn-control-block">
          <label>
            Minkowski p = {minkowskiP}
          </label>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={minkowskiP}
            onChange={(event) =>
              onMinkowskiPChange(
                Number(
                  event.target.value,
                ),
              )
            }
          />

          <p className="knn-muted">
            p = 1 behaves like Manhattan
            distance. p = 2 behaves like
            Euclidean distance.
          </p>
        </div>
      )}

      <div className="knn-control-block">
        <label>
          Neighbor weighting
        </label>

        <div className="knn-choice-grid">
          <button
            type="button"
            className={
              weighting === "uniform"
                ? "knn-choice active"
                : "knn-choice"
            }
            onClick={() =>
              onWeightingChange("uniform")
            }
          >
            <strong>Uniform</strong>

            <span>
              Every selected neighbor has
              equal influence.
            </span>
          </button>

          <button
            type="button"
            className={
              weighting === "distance"
                ? "knn-choice active"
                : "knn-choice"
            }
            onClick={() =>
              onWeightingChange("distance")
            }
          >
            <strong>
              Distance Weighted
            </strong>

            <span>
              Closer neighbors receive
              greater influence.
            </span>
          </button>
        </div>
      </div>

      <div className="knn-info-box">
        <strong>
          Remember
        </strong>

        <p>
          KNN does not learn coefficients
          or build a tree. Prediction is
          produced by comparing a new
          sample directly with stored
          training samples.
        </p>
      </div>
    </section>
  );
}