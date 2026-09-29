import { LearningLevel } from "../types/regularization";

interface Props {
  level: LearningLevel;
}

export default function RegularizationLearningGuide({
  level,
}: Props) {
  return (
    <section className="hero-panel">
      <span className="eyebrow">MODELMIND VISUAL LAB</span>

      <h1>
        Overfitting, Ridge, Lasso & Elastic Net
      </h1>

      <p className="hero-description">
        Learn why a regression model can memorize training data, how
        regularization controls model complexity, and why L1 and L2
        penalties produce different coefficient behavior.
      </p>

      <div className="learning-flow">
        <span>OLS</span>
        <strong>→</strong>
        <span>Overfitting</span>
        <strong>→</strong>
        <span>Regularization</span>
        <strong>→</strong>
        <span>Ridge</span>
        <strong>→</strong>
        <span>Lasso</span>
        <strong>→</strong>
        <span>Elastic Net</span>
      </div>

      {level === "basic" && (
        <div className="learning-message">
          <strong>Basic:</strong> focus on the intuition. Regularization
          prevents coefficients from becoming unnecessarily large.
        </div>
      )}

      {level === "medium" && (
        <div className="learning-message">
          <strong>Medium:</strong> connect α, coefficient shrinkage,
          train/test error and generalization.
        </div>
      )}

      {level === "advanced" && (
        <div className="learning-message">
          <strong>Advanced:</strong> inspect L1/L2 penalties,
          optimization objectives, coefficient paths and the
          bias–variance trade-off.
        </div>
      )}
    </section>
  );
}