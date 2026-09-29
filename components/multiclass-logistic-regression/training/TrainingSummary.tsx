import type {
  MulticlassModel,
} from "../types/multiclassLogisticRegression";

interface Props {
  model: MulticlassModel;
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
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            TRAINED MODEL
          </span>

          <h2>
            Multinomial Logistic Regression Summary
          </h2>
        </div>

        <span className="value-pill">
          {model.classes.length} classes
        </span>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Training samples
          </span>

          <strong>
            {trainRows}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Testing samples
          </span>

          <strong>
            {testRows}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Train Accuracy
          </span>

          <strong>
            {(
              model.trainAccuracy *
              100
            ).toFixed(1)}
            %
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
            Train Loss
          </span>

          <strong>
            {model.trainLoss.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Test Loss
          </span>

          <strong>
            {model.testLoss.toFixed(
              4
            )}
          </strong>
        </div>
      </div>

      <div className="sub-panel">
        <h3>
          Learned Equations
        </h3>

        <p className="muted">
          Unlike binary Logistic Regression,
          Multinomial Logistic Regression learns
          one linear score for every class.
        </p>

        <div className="coefficient-list">
          {model.classParameters.map(
            (parameters) => (
              <div
                className="coefficient-row"
                key={String(
                  parameters.classLabel
                )}
              >
                <div>
                  <strong>
                    Class{" "}
                    {String(
                      parameters.classLabel
                    )}
                  </strong>

                  <div className="muted">
                    z ={" "}
                    {parameters.intercept.toFixed(
                      3
                    )}
                    {model.features.map(
                      (feature) => {
                        const value =
                          parameters
                            .coefficients[
                            feature
                          ] ?? 0;

                        return (
                          <span
                            key={
                              feature
                            }
                          >
                            {" "}
                            {value >=
                            0
                              ? "+"
                              : "-"}{" "}
                            {Math.abs(
                              value
                            ).toFixed(
                              3
                            )}
                            ·
                            {feature}
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="info-box">
        Each equation produces one class score.
        Softmax compares all class scores and
        converts them into probabilities.
      </div>
    </section>
  );
}