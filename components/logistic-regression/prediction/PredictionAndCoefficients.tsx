import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LogisticModel,
  NumericRow,
} from "../types/logisticRegression";

import {
  coefficientOddsRatio,
  predictNewRow,
} from "../utils/logisticMath";

interface Props {
  model: LogisticModel;
  threshold: number;
}

export default function PredictionAndCoefficients({
  model,
  threshold,
}: Props) {
  /*
   * Create prediction input values
   * from the CURRENT model.
   *
   * Every feature starts at its
   * training mean.
   */
  const initialValues =
    useMemo(() => {
      return Object.fromEntries(
        model.scalers.map(
          (scaler) => [
            scaler.feature,
            Number.isFinite(
              scaler.mean
            )
              ? scaler.mean
              : 0,
          ]
        )
      ) as NumericRow;
    }, [model]);

  const [values, setValues] =
    useState<NumericRow>(
      initialValues
    );

  /*
   * IMPORTANT:
   *
   * When the user uploads another
   * CSV, the feature names can
   * completely change.
   *
   * React would otherwise preserve
   * the previous dataset's values.
   *
   * Reset them whenever a new model
   * is created.
   */
  useEffect(() => {
    setValues(
      initialValues
    );
  }, [initialValues]);

  /*
   * Make sure every feature needed
   * by the current model has a
   * valid number before prediction.
   *
   * This also protects the component
   * during the short render between
   * changing datasets and resetting
   * state.
   */
  const safeValues =
    useMemo(() => {
      const nextValues:
        NumericRow = {};

      model.scalers.forEach(
        (scaler) => {
          const currentValue =
            values[
              scaler.feature
            ];

          nextValues[
            scaler.feature
          ] =
            typeof currentValue ===
              "number" &&
            Number.isFinite(
              currentValue
            )
              ? currentValue
              : Number.isFinite(
                    scaler.mean
                  )
                ? scaler.mean
                : 0;
        }
      );

      return nextValues;
    }, [
      values,
      model.scalers,
    ]);

  const prediction =
    predictNewRow(
      safeValues,
      model,
      threshold
    );

  return (
    <section className="panel">
      <span className="eyebrow">
        INTERPRET & PREDICT
      </span>

      <h2>
        Coefficients, Odds Ratios &
        New Predictions
      </h2>

      <div className="control-grid">
        {/* =========================
            COEFFICIENTS
        ========================= */}

        <div className="sub-panel">
          <h3>
            What do coefficients
            mean?
          </h3>

          <p className="muted">
            Because the features are
            standardized, each
            coefficient describes the
            change in log-odds for
            approximately one
            standard-deviation
            increase in that feature,
            while other features are
            held constant.
          </p>

          <div className="coefficient-list">
            {model.features.map(
              (feature) => {
                const rawCoefficient =
                  model.coefficients[
                    feature
                  ];

                const coefficient =
                  typeof rawCoefficient ===
                    "number" &&
                  Number.isFinite(
                    rawCoefficient
                  )
                    ? rawCoefficient
                    : 0;

                const oddsRatio =
                  coefficientOddsRatio(
                    coefficient
                  );

                return (
                  <div
                    className="coefficient-row"
                    key={feature}
                  >
                    <span>
                      {feature}
                    </span>

                    <div
                      style={{
                        textAlign:
                          "right",
                      }}
                    >
                      <strong>
                        β ={" "}
                        {coefficient.toFixed(
                          4
                        )}
                      </strong>

                      <div className="muted">
                        Odds ratio ={" "}
                        {Number.isFinite(
                          oddsRatio
                        )
                          ? oddsRatio.toFixed(
                              3
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="info-box">
            Odds ratio &gt; 1 means
            the odds of class 1
            increase. Odds ratio
            &lt; 1 means they
            decrease.
          </div>
        </div>

        {/* =========================
            NEW SAMPLE PREDICTION
        ========================= */}

        <div className="sub-panel">
          <h3>
            Predict a new sample
          </h3>

          {model.scalers.map(
            (scaler) => {
              const safeMean =
                Number.isFinite(
                  scaler.mean
                )
                  ? scaler.mean
                  : 0;

              const safeStd =
                Number.isFinite(
                  scaler.std
                ) &&
                scaler.std > 0
                  ? scaler.std
                  : 1;

              const span =
                Math.max(
                  safeStd * 4,
                  1
                );

              const rawValue =
                safeValues[
                  scaler.feature
                ];

              const currentValue =
                typeof rawValue ===
                  "number" &&
                Number.isFinite(
                  rawValue
                )
                  ? rawValue
                  : safeMean;

              return (
                <label
                  className="control-card"
                  key={
                    scaler.feature
                  }
                >
                  <span>
                    {scaler.feature}
                  </span>

                  <strong>
                    {currentValue.toFixed(
                      2
                    )}
                  </strong>

                  <input
                    type="range"
                    min={
                      safeMean -
                      span
                    }
                    max={
                      safeMean +
                      span
                    }
                    step={
                      Math.max(
                        span / 100,
                        0.001
                      )
                    }
                    value={
                      currentValue
                    }
                    onChange={(
                      event
                    ) => {
                      const newValue =
                        Number(
                          event.target
                            .value
                        );

                      setValues(
                        (
                          current
                        ) => ({
                          ...current,

                          [scaler.feature]:
                            Number.isFinite(
                              newValue
                            )
                              ? newValue
                              : safeMean,
                        })
                      );
                    }}
                  />
                </label>
              );
            }
          )}

          {/* =========================
              PREDICTION METRICS
          ========================= */}

          <div className="metric-grid">
            <div className="metric-card">
              <span>
                Linear score z
              </span>

              <strong>
                {Number.isFinite(
                  prediction.score
                )
                  ? prediction.score.toFixed(
                      3
                    )
                  : "N/A"}
              </strong>
            </div>

            <div className="metric-card">
              <span>
                Probability
              </span>

              <strong>
                {Number.isFinite(
                  prediction.probability
                )
                  ? (
                      prediction.probability *
                      100
                    ).toFixed(
                      1
                    )
                  : "N/A"}
                %
              </strong>
            </div>

            <div className="metric-card">
              <span>
                Threshold
              </span>

              <strong>
                {Number.isFinite(
                  threshold
                )
                  ? threshold.toFixed(
                      2
                    )
                  : "N/A"}
              </strong>
            </div>

            <div className="metric-card">
              <span>
                Predicted class
              </span>

              <strong>
                {
                  prediction.predicted
                }
              </strong>
            </div>
          </div>

          <div className="info-box">
            The sliders begin at the
            training mean of each
            feature. Change them to
            see how the predicted
            probability and class
            change for a new sample.
          </div>
        </div>
      </div>
    </section>
  );
}