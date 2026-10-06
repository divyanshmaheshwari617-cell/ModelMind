import {
  LearningLevel,
  LogisticModel,
} from "../types/logisticRegression";

interface Props {
  model: LogisticModel;
  learningLevel:
    LearningLevel;
}

export default function LogisticLearningDashboard({
  model,
  learningLevel,
}: Props) {
  return (
    <>
      <section className="panel">
        <span className="eyebrow">
          STEP-BY-STEP THEORY
        </span>

        <h2>
          Logistic Regression from
          input to prediction
        </h2>

        <div className="control-grid">
          <div className="sub-panel">
            <strong>
              1. Linear score
            </strong>

            <p className="muted">
              Combine the input
              features using learned
              coefficients.
            </p>

            <div className="formula-box">
              z = β₀ + β₁x₁ +
              β₂x₂ + ...
            </div>
          </div>

          <div className="sub-panel">
            <strong>
              2. Sigmoid
            </strong>

            <p className="muted">
              Convert the unrestricted
              linear score into a
              number between 0 and 1.
            </p>

            <div className="formula-box">
              p = 1 / (1 + e⁻ᶻ)
            </div>
          </div>

          <div className="sub-panel">
            <strong>
              3. Threshold
            </strong>

            <p className="muted">
              Turn probability into a
              class decision.
            </p>

            <div className="formula-box">
              p ≥ threshold → 1
            </div>
          </div>

          <div className="sub-panel">
            <strong>
              4. Log Loss
            </strong>

            <p className="muted">
              Penalize incorrect
              probabilities,
              especially confident
              incorrect predictions.
            </p>

            <div className="formula-box">
              −[y ln(p) +
              (1−y) ln(1−p)]
            </div>
          </div>
        </div>

        {learningLevel !==
          "basic" && (
          <div className="info-box">
            Logistic Regression is a
            linear model in
            <strong>
              {" "}log-odds space
            </strong>
            . The probability itself
            becomes nonlinear because
            the sigmoid transformation
            is applied to the linear
            score.
          </div>
        )}

        {learningLevel ===
          "advanced" && (
          <div className="info-box">
            Gradient descent minimizes
            average binary
            cross-entropy. With L2
            regularization enabled,
            an additional penalty on
            squared coefficient
            magnitude is added to the
            optimization objective.
          </div>
        )}
      </section>

      <section className="panel">
        <span className="eyebrow">
          ASSUMPTIONS & LIMITATIONS
        </span>

        <h2>
          When should you trust
          Logistic Regression?
        </h2>

        <div className="control-grid">
          <div className="sub-panel">
            <h3>
              Binary outcome
            </h3>

            <p className="muted">
              This implementation
              models two classes:
              0 and 1.
            </p>
          </div>

          <div className="sub-panel">
            <h3>
              Linear log-odds
            </h3>

            <p className="muted">
              Logistic Regression
              assumes the predictors
              combine linearly in
              log-odds space.
            </p>
          </div>

          <div className="sub-panel">
            <h3>
              Independent samples
            </h3>

            <p className="muted">
              Observations should not
              simply be duplicated or
              strongly dependent
              measurements treated as
              independent.
            </p>
          </div>

          <div className="sub-panel">
            <h3>
              Multicollinearity
            </h3>

            <p className="muted">
              Highly correlated
              features can make
              individual coefficient
              interpretation unstable.
            </p>
          </div>

          <div className="sub-panel">
            <h3>
              Class imbalance
            </h3>

            <p className="muted">
              High accuracy can be
              misleading when one
              class dominates. Inspect
              precision, recall, F1
              and ROC-AUC too.
            </p>
          </div>

          <div className="sub-panel">
            <h3>
              Extrapolation
            </h3>

            <p className="muted">
              Predictions far outside
              the range represented in
              training data should be
              interpreted carefully.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <span className="eyebrow">
          FINAL DASHBOARD
        </span>

        <h2>
          Logistic Regression Model
          Summary
        </h2>

        <div className="metric-grid">
          <div className="metric-card">
            <span>
              Test Accuracy
            </span>

            <strong>
              {(
                model.testMetrics
                  .accuracy * 100
              ).toFixed(1)}
              %
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Precision
            </span>

            <strong>
              {model.testMetrics.precision.toFixed(
                3
              )}
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Recall
            </span>

            <strong>
              {model.testMetrics.recall.toFixed(
                3
              )}
            </strong>
          </div>

          <div className="metric-card">
            <span>F1</span>

            <strong>
              {model.testMetrics.f1.toFixed(
                3
              )}
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Specificity
            </span>

            <strong>
              {model.testMetrics.specificity.toFixed(
                3
              )}
            </strong>
          </div>

          <div className="metric-card">
            <span>ROC-AUC</span>

            <strong>
              {model.testMetrics.auc.toFixed(
                3
              )}
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Log Loss
            </span>

            <strong>
              {model.testMetrics.logLoss.toFixed(
                3
              )}
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Features
            </span>

            <strong>
              {model.features.length}
            </strong>
          </div>
        </div>

        <div className="info-box">
          Complete learning flow:
          Dataset → Standardization →
          Linear Score → Sigmoid →
          Probability → Threshold →
          Class → Confusion Matrix →
          Precision/Recall/F1 →
          ROC-AUC → Log Loss.
        </div>
      </section>
    </>
  );
}