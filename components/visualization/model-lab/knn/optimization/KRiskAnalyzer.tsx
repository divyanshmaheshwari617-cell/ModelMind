interface Props {
  currentK: number;
  trainingSize: number;
}

type RiskLevel =
  | "High overfitting risk"
  | "Overfitting risk"
  | "Balanced region"
  | "Underfitting risk"
  | "High underfitting risk";

export default function KRiskAnalyzer({
  currentK,
  trainingSize,
}: Props) {
  const ratio =
    trainingSize > 0
      ? currentK / trainingSize
      : 0;

  let risk: RiskLevel;
  let explanation: string;

  if (currentK === 1) {
    risk = "High overfitting risk";

    explanation =
      "K = 1 uses only the single nearest training sample. " +
      "This gives KNN very high flexibility and makes the prediction " +
      "sensitive to noise, outliers and individual training points.";
  } else if (
    currentK <= 3 ||
    ratio <= 0.1
  ) {
    risk = "Overfitting risk";

    explanation =
      "A small K creates a very local model. This can capture useful " +
      "local patterns, but it can also react strongly to noise and " +
      "produce unstable predictions.";
  } else if (ratio < 0.5) {
    risk = "Balanced region";

    explanation =
      "This K uses several nearby observations while still preserving " +
      "local information. It may provide a useful bias-variance balance, " +
      "but validation performance should still determine the final choice.";
  } else if (ratio < 0.8) {
    risk = "Underfitting risk";

    explanation =
      "A large portion of the training dataset now participates in each " +
      "prediction. Local patterns can start disappearing and predictions " +
      "become increasingly smooth.";
  } else {
    risk = "High underfitting risk";

    explanation =
      "K is close to the training-set size. Predictions depend on almost " +
      "the whole dataset, so KNN loses much of its ability to model local " +
      "structure.";
  }

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            MODEL COMPLEXITY
          </p>

          <h2>
            K, Overfitting & Underfitting
          </h2>

          <p className="knn-muted">
            Watch how changing K changes
            the bias-variance behavior of KNN.
          </p>
        </div>

        <span className="knn-badge">
          K = {currentK}
        </span>
      </div>

      <div className="knn-stat-grid">
        <div className="knn-stat">
          <span>Current K</span>
          <strong>{currentK}</strong>
        </div>

        <div className="knn-stat">
          <span>Training samples</span>
          <strong>{trainingSize}</strong>
        </div>

        <div className="knn-stat">
          <span>Neighborhood size</span>
          <strong>
            {trainingSize > 0
              ? `${(
                  (currentK /
                    trainingSize) *
                  100
                ).toFixed(1)}%`
              : "—"}
          </strong>
        </div>

        <div className="knn-stat">
          <span>Current behavior</span>
          <strong>{risk}</strong>
        </div>
      </div>

      <div className="knn-concept-box">
        <strong>{risk}</strong>
        <p>{explanation}</p>
      </div>

      <div className="knn-choice-grid">
        <div className="knn-choice">
          <strong>K = 1</strong>
          <span>
            Very flexible
            <br />
            High variance
            <br />
            Noise sensitive
          </span>
        </div>

        <div className="knn-choice">
          <strong>Small K</strong>
          <span>
            Local predictions
            <br />
            Lower bias
            <br />
            Higher variance
          </span>
        </div>

        <div className="knn-choice">
          <strong>Moderate K</strong>
          <span>
            More stable
            <br />
            Bias-variance trade-off
            <br />
            Validate before choosing
          </span>
        </div>

        <div className="knn-choice">
          <strong>Large K</strong>
          <span>
            Very smooth
            <br />
            Higher bias
            <br />
            Underfitting risk
          </span>
        </div>
      </div>

      <div className="knn-info-box">
        <strong>
          Important: there is no universally
          correct K.
        </strong>

        <p>
          K = 3 or K = 5 is not automatically
          correct. ModelMind shows the risk
          pattern for learning, while validation
          performance should be used to compare
          candidate K values for the current
          dataset.
        </p>
      </div>
    </section>
  );
}