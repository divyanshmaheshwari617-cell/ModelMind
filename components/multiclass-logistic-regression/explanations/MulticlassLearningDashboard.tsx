import type {
  LearningLevel,
  MulticlassModel,
} from "../types/multiclassLogisticRegression";

interface Props {
  model: MulticlassModel;
  learningLevel: LearningLevel;
}

export default function MulticlassLearningDashboard({
  model,
  learningLevel,
}: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            LEARNING DASHBOARD
          </span>

          <h2>
            Understand Multiclass Logistic Regression
          </h2>
        </div>

        <span className="value-pill">
          {learningLevel}
        </span>
      </div>

      <div className="sub-panel">
        <h3>
          Core Idea
        </h3>

        <p className="muted">
          Multiclass Logistic Regression learns
          one linear score for every class.
          Softmax converts all scores into
          probabilities, and the class with the
          highest probability is selected.
        </p>

        <div className="info-box">
          zₖ = β₀ₖ + β₁ₖx₁ + β₂ₖx₂ + ... + βₙₖxₙ
          <br /><br />
          P(y = k | x) =
          exp(zₖ) / Σⱼ exp(zⱼ)
          <br /><br />
          Prediction = argmaxₖ P(y = k | x)
        </div>
      </div>

      {learningLevel !==
        "basic" && (
        <div className="sub-panel">
          <h3>
            Cross-Entropy
          </h3>

          <p className="muted">
            Training tries to increase
            the probability assigned to
            the correct class. If the
            correct class receives a low
            probability, cross-entropy
            produces a larger penalty.
          </p>

          <div className="info-box">
            Loss = -log(P(correct class))
          </div>
        </div>
      )}

      {learningLevel ===
        "advanced" && (
        <>
          <div className="sub-panel">
            <h3>
              Identifiability
            </h3>

            <p className="muted">
              Adding the same constant
              to every class logit does
              not change Softmax
              probabilities. Different
              implementations therefore
              may use a reference class
              or another parameterization.
              ModelMind focuses on the
              probability behavior and
              learned class-score
              functions.
            </p>
          </div>

          <div className="sub-panel">
            <h3>
              Assumptions & Limitations
            </h3>

            <p className="muted">
              The class log-odds are
              modeled from linear
              combinations of the input
              features. Strong nonlinear
              class structures may
              therefore require feature
              engineering or a nonlinear
              classifier.
            </p>

            <p className="muted">
              Multicollinearity can make
              individual coefficients
              unstable. Feature scaling
              helps optimization but does
              not remove redundant
              information.
            </p>

            <p className="muted">
              Severe class imbalance can
              make overall accuracy look
              stronger than minority-class
              performance, which is why
              ModelMind also displays
              per-class and macro metrics.
            </p>
          </div>
        </>
      )}

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Classes
          </span>

          <strong>
            {model.classes.length}
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

        <div className="metric-card">
          <span>
            Test Accuracy
          </span>

          <strong>
            {(
              model.testAccuracy *
              100
            ).toFixed(1)}
            %
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Test Cross-Entropy
          </span>

          <strong>
            {model.testLoss.toFixed(
              4
            )}
          </strong>
        </div>
      </div>

      <div className="info-box">
        <strong>
          Final mental model:
        </strong>
        <br /><br />

        Features → one logit per class
        → Softmax → probabilities →
        highest probability → predicted
        class.
      </div>
    </section>
  );
}