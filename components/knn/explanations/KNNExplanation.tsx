import type {
  KNNTask,
  LearningLevel,
} from "../types/knn";

interface Props {
  task: KNNTask;
  level: LearningLevel;
  onLevelChange: (
    level: LearningLevel,
  ) => void;
}

export default function KNNExplanation({
  task,
  level,
  onLevelChange,
}: Props) {
  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            LEARNING MODE
          </p>

          <h2>
            Understand KNN
          </h2>
        </div>

        <span className="knn-badge">
          {level.toUpperCase()}
        </span>
      </div>

      <div className="knn-choice-grid">
        {(
          [
            "basic",
            "medium",
            "advanced",
          ] as LearningLevel[]
        ).map((item) => (
          <button
            type="button"
            key={item}
            className={
              level === item
                ? "knn-choice active"
                : "knn-choice"
            }
            onClick={() =>
              onLevelChange(item)
            }
          >
            <strong>
              {item
                .charAt(0)
                .toUpperCase() +
                item.slice(1)}
            </strong>
          </button>
        ))}
      </div>

      {level === "basic" && (
        <>
          <div className="knn-concept-box">
            <strong>
              What is KNN?
            </strong>

            <p>
              K-Nearest Neighbors predicts
              a new sample by looking at
              the K training samples that
              are closest to it.
            </p>
          </div>

          <div className="knn-formula-box">
            New sample → Find closest
            points → Select K neighbors →
            Predict
          </div>

          <div className="knn-info-box">
            <strong>
              {task === "classification"
                ? "For classification"
                : "For regression"}
            </strong>

            <p>
              {task === "classification"
                ? "The selected neighbors vote for a class. The strongest vote becomes the prediction."
                : "The target values of the selected neighbors are averaged to predict a continuous value."}
            </p>
          </div>
        </>
      )}

      {level === "medium" && (
        <>
          <div className="knn-concept-box">
            <strong>
              K is a hyperparameter
            </strong>

            <p>
              K controls how many nearby
              samples participate in each
              prediction. Small K creates
              highly local predictions,
              while larger K produces
              smoother behavior.
            </p>
          </div>

          <div className="knn-concept-box">
            <strong>
              Distance defines
              "nearest"
            </strong>

            <p>
              Euclidean, Manhattan and
              Minkowski distance can rank
              neighbors differently.
              Changing the metric can
              therefore change the final
              prediction.
            </p>
          </div>

          <div className="knn-concept-box">
            <strong>
              Scaling matters
            </strong>

            <p>
              If one feature ranges from
              0–1 while another ranges
              from 0–10000, the larger
              numerical scale can dominate
              the distance calculation.
            </p>
          </div>
        </>
      )}

      {level === "advanced" && (
        <>
          <div className="knn-concept-box">
            <strong>
              Lazy learning
            </strong>

            <p>
              KNN is often described as a
              lazy or instance-based
              learner because it stores
              training examples instead of
              fitting a conventional
              parametric model.
            </p>
          </div>

          <div className="knn-concept-box">
            <strong>
              Prediction complexity
            </strong>

            <p>
              A straightforward KNN query
              compares the query against
              many or all stored training
              samples. This can make
              prediction expensive on very
              large datasets.
            </p>
          </div>

          <div className="knn-concept-box">
            <strong>
              Curse of dimensionality
            </strong>

            <p>
              As the number of features
              grows, distances can become
              less informative because
              samples become sparse in
              high-dimensional space.
            </p>
          </div>

          <div className="knn-concept-box">
            <strong>
              Bias–variance connection
            </strong>

            <p>
              Very small K usually has
              lower bias but higher
              variance. Increasing K tends
              to smooth predictions,
              increasing bias while
              reducing variance.
            </p>
          </div>
        </>
      )}
    </section>
  );
}