import {
  useMemo,
} from "react";

import {
  useSVM,
} from "../context/SVMContext";

function formatValue(
  value: number | undefined
) {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
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

export default function ExperimentComparison() {
  const { state } = useSVM();

  const experiments =
    useMemo(() => {
      const sameTask =
        state.experiments.filter(
          (experiment) =>
            experiment.task ===
            state.task
        );

      return sameTask.slice(-4);
    }, [
      state.experiments,
      state.task,
    ]);

  const metricNames =
    useMemo(
      () =>
        Array.from(
          new Set(
            experiments.flatMap(
              (experiment) =>
                Object.keys(
                  experiment.metrics
                )
            )
          )
        ),
      [experiments]
    );

  if (
    experiments.length < 2
  ) {
    return (
      <div className="knowledge-panel">
        <div className="knowledge-panel-heading">
          <span>
            COMPARE RUNS
          </span>

          <h3>
            Experiment Comparison
          </h3>

          <p>
            Save at least two{" "}
            {state.task ===
            "classification"
              ? "SVC"
              : "SVR"}{" "}
            experiments to compare
            kernels, hyperparameters
            and evaluation metrics.
          </p>
        </div>
      </div>
    );
  }

  const isRegression =
    state.task === "regression";

  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-heading">
        <span>
          COMPARE RUNS
        </span>

        <h3>
          {isRegression
            ? "SVR Experiment Comparison"
            : "SVC Experiment Comparison"}
        </h3>

        <p>
          Compare the latest four
          saved experiments for the
          currently selected task.
        </p>
      </div>

      <div className="comparison-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>
                Property
              </th>

              {experiments.map(
                (
                  experiment,
                  index
                ) => (
                  <th
                    key={
                      experiment.id
                    }
                  >
                    Run{" "}
                    {index + 1}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Kernel</td>

              {experiments.map(
                (experiment) => (
                  <td
                    key={
                      experiment.id
                    }
                  >
                    {formatKernel(
                      experiment.kernel
                    )}
                  </td>
                )
              )}
            </tr>

            <tr>
              <td>C</td>

              {experiments.map(
                (experiment) => (
                  <td
                    key={
                      experiment.id
                    }
                  >
                    {experiment.parameters.C.toFixed(
                      2
                    )}
                  </td>
                )
              )}
            </tr>

            <tr>
              <td>Gamma</td>

              {experiments.map(
                (experiment) => (
                  <td
                    key={
                      experiment.id
                    }
                  >
                    {experiment.parameters.gamma.toFixed(
                      3
                    )}
                  </td>
                )
              )}
            </tr>

            <tr>
              <td>Degree</td>

              {experiments.map(
                (experiment) => (
                  <td
                    key={
                      experiment.id
                    }
                  >
                    {experiment.kernel ===
                    "polynomial"
                      ? experiment
                          .parameters
                          .degree
                      : "—"}
                  </td>
                )
              )}
            </tr>

            <tr>
              <td>Coef0</td>

              {experiments.map(
                (experiment) => (
                  <td
                    key={
                      experiment.id
                    }
                  >
                    {experiment.kernel ===
                      "polynomial" ||
                    experiment.kernel ===
                      "sigmoid"
                      ? experiment.parameters.coef0.toFixed(
                          2
                        )
                      : "—"}
                  </td>
                )
              )}
            </tr>

            {isRegression ? (
              <tr>
                <td>Epsilon</td>

                {experiments.map(
                  (experiment) => (
                    <td
                      key={
                        experiment.id
                      }
                    >
                      {experiment.parameters.epsilon.toFixed(
                        3
                      )}
                    </td>
                  )
                )}
              </tr>
            ) : (
              <tr>
                <td>
                  Class Weight
                </td>

                {experiments.map(
                  (experiment) => (
                    <td
                      key={
                        experiment.id
                      }
                    >
                      {
                        experiment
                          .parameters
                          .classWeight
                      }
                    </td>
                  )
                )}
              </tr>
            )}

            {metricNames.map(
              (metric) => (
                <tr key={metric}>
                  <td>{metric}</td>

                  {experiments.map(
                    (
                      experiment
                    ) => (
                      <td
                        key={
                          experiment.id
                        }
                      >
                        {formatValue(
                          experiment
                            .metrics[
                            metric
                          ]
                        )}
                      </td>
                    )
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}