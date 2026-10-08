import { useMemo } from "react";

import {
  useSVM,
} from "../context/SVMContext";

function formatMetric(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (
    Math.abs(value) >= 100
  ) {
    return value.toFixed(2);
  }

  return value.toFixed(4);
}

function formatKernel(
  kernel: string
) {
  if (kernel === "rbf") {
    return "RBF";
  }

  if (kernel === "chi-square") {
    return "Chi-Square";
  }

  return (
    kernel.charAt(0).toUpperCase() +
    kernel.slice(1)
  );
}

export default function ExperimentHistory() {
  const { state } = useSVM();

  const experiments =
    useMemo(
      () =>
        state.experiments
          .slice()
          .sort(
            (a, b) =>
              b.createdAt -
              a.createdAt
          ),
      [state.experiments]
    );

  if (experiments.length === 0) {
    return (
      <div className="knowledge-panel">
        <div className="knowledge-panel-heading">
          <span>
            EXPERIMENT HISTORY
          </span>

          <h3>
            No Saved Experiments Yet
          </h3>

          <p>
            Run an SVC or SVR
            experiment and save it.
            Your model configuration
            and evaluation metrics will
            appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-heading">
        <span>
          EXPERIMENT HISTORY
        </span>

        <h3>
          Saved SVM Experiments
        </h3>

        <p>
          Review the parameters and
          metrics produced by your
          previous experiment runs.
        </p>
      </div>

      <div className="history-grid">
        {experiments.map(
          (
            experiment,
            index
          ) => {
            const {
              parameters,
            } = experiment;

            const isRegression =
              experiment.task ===
              "regression";

            return (
              <article
                key={experiment.id}
                className="history-card"
              >
                <div>
                  <strong>
                    {formatKernel(
                      experiment.kernel
                    )}
                  </strong>

                  <span>
                    {isRegression
                      ? "SVR"
                      : "SVC"}
                  </span>
                </div>

                <p>
                  Run{" "}
                  {experiments.length -
                    index}
                  {" · "}
                  {new Date(
                    experiment.createdAt
                  ).toLocaleString()}
                </p>

                <div className="history-metrics">
                  <span>
                    C:{" "}
                    {parameters.C.toFixed(
                      2
                    )}
                  </span>

                  <span>
                    Gamma:{" "}
                    {parameters.gamma.toFixed(
                      3
                    )}
                  </span>

                  {parameters.kernel ===
                    "polynomial" && (
                    <span>
                      Degree:{" "}
                      {
                        parameters.degree
                      }
                    </span>
                  )}

                  {(parameters.kernel ===
                    "polynomial" ||
                    parameters.kernel ===
                      "sigmoid") && (
                    <span>
                      Coef0:{" "}
                      {parameters.coef0.toFixed(
                        2
                      )}
                    </span>
                  )}

                  {isRegression && (
                    <span>
                      Epsilon:{" "}
                      {parameters.epsilon.toFixed(
                        3
                      )}
                    </span>
                  )}

                  {!isRegression && (
                    <span>
                      Weight:{" "}
                      {
                        parameters.classWeight
                      }
                    </span>
                  )}
                </div>

                <div className="history-metrics">
                  {Object.entries(
                    experiment.metrics
                  ).map(
                    ([
                      name,
                      value,
                    ]) => (
                      <span
                        key={name}
                      >
                        {name}:{" "}
                        {formatMetric(
                          value
                        )}
                      </span>
                    )
                  )}
                </div>
              </article>
            );
          }
        )}
      </div>
    </div>
  );
}