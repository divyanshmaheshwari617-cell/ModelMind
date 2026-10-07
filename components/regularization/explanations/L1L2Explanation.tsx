export default function L1L2Explanation() {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">L1 VS L2</span>
          <h2>Why Ridge and Lasso behave differently</h2>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="concept-card">
          <span className="concept-number">L2</span>
          <h3>Ridge Regression</h3>

          <div className="formula">
            Loss + α Σ βᵢ²
          </div>

          <p>
            Squaring coefficients makes large coefficients increasingly
            expensive. Ridge therefore tends to distribute influence
            across correlated features and shrink coefficients smoothly.
          </p>

          <strong>
            Typical behavior: small coefficients, but not exact zeros.
          </strong>
        </div>

        <div className="concept-card">
          <span className="concept-number">L1</span>
          <h3>Lasso Regression</h3>

          <div className="formula">
            Loss + α Σ |βᵢ|
          </div>

          <p>
            The absolute-value penalty can push some coefficients exactly
            to zero. This gives Lasso a built-in feature-selection effect.
          </p>

          <strong>
            Typical behavior: sparse coefficient set.
          </strong>
        </div>
      </div>

      <div className="concept-card">
        <span className="concept-number">L1 + L2</span>
        <h3>Elastic Net</h3>

        <div className="formula">
          Loss + α[r Σ|βᵢ| + (1-r) Σβᵢ²]
        </div>

        <p>
          Elastic Net combines both ideas. The L1 ratio controls how much
          Lasso-like versus Ridge-like behavior is used.
        </p>
      </div>
    </section>
  );
}