import {
  LogisticModel,
} from "../types/logisticRegression";

interface Props {
  model: LogisticModel;
  trainRows: number;
  testRows: number;
}

export default function TrainingSummary({
  model,
  trainRows,
  testRows,
}: Props) {
  return (
    <section className="panel">
      <span className="eyebrow">
        TRAINED MODEL
      </span>

      <h2>
        What did Logistic Regression
        learn?
      </h2>

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Training rows
          </span>
          <strong>
            {trainRows}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Test rows
          </span>
          <strong>
            {testRows}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Iterations
          </span>
          <strong>
            {model.iterations}
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

      <div className="formula-box">
        <strong>
          log(p / (1-p))
        </strong>

        <span>=</span>

        <strong>
          {model.intercept.toFixed(
            3
          )}
          {" "}
          {model.features.map(
            (feature) => {
              const value =
                model.coefficients[
                  feature
                ];

              return (
                <span
                  key={feature}
                >
                  {value >= 0
                    ? " + "
                    : " - "}
                  {Math.abs(
                    value
                  ).toFixed(3)}
                  ·{feature}
                </span>
              );
            }
          )}
        </strong>
      </div>

      <div className="sub-panel">
        <h3>
          Standardized
          coefficients
        </h3>

        <div className="coefficient-list">
          {model.features.map(
            (feature) => (
              <div
                className="coefficient-row"
                key={feature}
              >
                <span>
                  {feature}
                </span>

                <strong>
                  {model.coefficients[
                    feature
                  ].toFixed(5)}
                </strong>
              </div>
            )
          )}
        </div>

        <p className="muted">
          Features are standardized
          before training, so these
          coefficients describe
          changes measured in
          standard-deviation units.
        </p>
      </div>
    </section>
  );
}