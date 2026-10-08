import {
  useMemo,
  useState,
} from "react";

import Plot
  from "react-plotly.js";

import {
  useSVM,
} from "../context/SVMContext";

import {
  runRegressionExperiment,
} from "./experimentEngine";

import RegressionMetrics
  from "../metrics/RegressionMetrics";

export default function SVRExperiment() {
  const {
    state,
    addExperiment,
  } = useSVM();

  const [saved, setSaved] =
    useState(false);

  const dataset =
    state.dataset;

  const result =
    useMemo(() => {
      if (
        !dataset ||
        dataset.task !==
          "regression"
      ) {
        return null;
      }

      return runRegressionExperiment(
        dataset.rows,
        state.parameters,
        dataset.scalingEnabled
      );
    }, [
      dataset,
      state.parameters,
    ]);

  if (!dataset) {
    return (
      <div className="experiment-empty">
        Select the built-in SVR
        Regression dataset or upload
        regression data first.
      </div>
    );
  }

  if (
    dataset.task !==
    "regression"
  ) {
    return (
      <div className="experiment-empty">
        The active dataset is configured
        for classification. Select an
        SVR regression dataset first.
      </div>
    );
  }

  if (!result) {
    return null;
  }

  function saveExperiment() {
    if (!result) {
      return;
    }

    addExperiment({
      id: `svr-${Date.now()}`,

      task:
        "regression",

      kernel:
        state.parameters.kernel,

      parameters: {
        ...state.parameters,
      },

      createdAt:
        Date.now(),

      metrics: {
        mae:
          result.mae,

        mse:
          result.mse,

        rmse:
          result.rmse,

        r2:
          result.r2,

        supportVectors:
          result.supportVectorCount,
      },
    });

    setSaved(true);

    window.setTimeout(
      () => {
        setSaved(false);
      },
      1400
    );
  }

  const indexes =
    result.predictions.map(
      (_, index) =>
        index + 1
    );

  return (
    <div className="experiment-workspace">
      <div className="experiment-summary">
        <div>
          <span>
            EDUCATIONAL SVR ENGINE
          </span>

          <h3>
            Regression Experiment
          </h3>

          <p>
            Inspect regression
            predictions, residuals,
            epsilon behavior and
            evaluation metrics.
          </p>
        </div>

        <div className="experiment-badges">
          <strong>
            {state.parameters.kernel}
          </strong>

          <span>
            C ={" "}
            {state.parameters.C.toFixed(
              2
            )}
          </span>

          <span>
            ε ={" "}
            {state.parameters.epsilon.toFixed(
              2
            )}
          </span>
        </div>
      </div>

      <div className="experiment-warning">
        This is an educational
        browser-side approximation,
        not an exact sklearn SVR
        training result. The production
        Python engine can later replace
        this calculation layer without
        changing the UI.
      </div>

      <div className="experiment-save-row">
        <div>
          <strong>
            Save this experiment
          </strong>

          <p>
            Store the current kernel,
            hyperparameters and
            regression metrics for
            comparison with later runs.
          </p>
        </div>

        <button
          type="button"
          className="experiment-save-button"
          onClick={
            saveExperiment
          }
        >
          {saved
            ? "Saved ✓"
            : "Save Experiment"}
        </button>
      </div>

      <RegressionMetrics
        result={result}
      />

      <div className="experiment-block">
        <h4>
          Actual vs Predicted
        </h4>

        <Plot
          data={[
            {
              x: indexes,

              y:
                result.predictions.map(
                  (item) =>
                    item.actual
                ),

              type:
                "scatter",

              mode:
                "markers+lines",

              name:
                "Actual",
            },

            {
              x: indexes,

              y:
                result.predictions.map(
                  (item) =>
                    item.predicted
                ),

              type:
                "scatter",

              mode:
                "markers+lines",

              name:
                "Predicted",
            },
          ]}
          layout={{
            autosize: true,

            paper_bgcolor:
              "transparent",

            plot_bgcolor:
              "transparent",

            font: {
              color:
                "#e8e9ff",
            },

            margin: {
              l: 60,
              r: 20,
              t: 20,
              b: 50,
            },

            xaxis: {
              title: {
                text:
                  "Observation",
              },
            },

            yaxis: {
              title: {
                text:
                  dataset.targetColumn,
              },
            },

            legend: {
              orientation: "h",
            },
          }}
          config={{
            responsive: true,
            displaylogo: false,
          }}
          style={{
            width: "100%",
            height: "390px",
          }}
        />
      </div>

      <div className="experiment-block">
        <h4>
          Residual / Epsilon Analysis
        </h4>

        <Plot
          data={[
            {
              x: indexes,

              y:
                result.predictions.map(
                  (item) =>
                    item.residual
                ),

              type:
                "scatter",

              mode:
                "markers",

              name:
                "Residual",

              text:
                result.predictions.map(
                  (item) =>
                    item.outsideEpsilon
                      ? "Outside epsilon"
                      : "Inside epsilon"
                ),
            },

            {
              x: indexes,

              y:
                indexes.map(
                  () =>
                    state.parameters
                      .epsilon
                ),

              type:
                "scatter",

              mode:
                "lines",

              name:
                "+ epsilon",

              line: {
                dash:
                  "dash",
              },
            },

            {
              x: indexes,

              y:
                indexes.map(
                  () =>
                    -state.parameters
                      .epsilon
                ),

              type:
                "scatter",

              mode:
                "lines",

              name:
                "- epsilon",

              line: {
                dash:
                  "dash",
              },
            },
          ]}
          layout={{
            autosize: true,

            paper_bgcolor:
              "transparent",

            plot_bgcolor:
              "transparent",

            font: {
              color:
                "#e8e9ff",
            },

            margin: {
              l: 60,
              r: 20,
              t: 20,
              b: 50,
            },

            xaxis: {
              title: {
                text:
                  "Observation",
              },
            },

            yaxis: {
              title: {
                text:
                  "Residual",
              },
            },

            legend: {
              orientation:
                "h",
            },
          }}
          config={{
            responsive: true,
            displaylogo: false,
          }}
          style={{
            width: "100%",
            height: "390px",
          }}
        />
      </div>
    </div>
  );
}