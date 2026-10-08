import {
  useMemo,
  useState,
} from "react";

import {
  useSVM,
} from "../context/SVMContext";

import {
  runClassificationExperiment,
} from "./experimentEngine";

import ClassificationMetrics
  from "../metrics/ClassificationMetrics";

import ConfusionMatrix
  from "../metrics/ConfusionMatrix";

import DecisionScorePlot
  from "../metrics/DecisionScorePlot";

export default function SVCExperiment() {
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
          "classification"
      ) {
        return null;
      }

      return runClassificationExperiment(
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
        Select a classification
        dataset in Dataset Studio
        before running the SVC
        experiment.
      </div>
    );
  }

  if (
    dataset.task !==
    "classification"
  ) {
    return (
      <div className="experiment-empty">
        The active dataset is configured
        for regression. Switch to an SVC
        classification dataset first.
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
      id: `svc-${Date.now()}`,

      task:
        "classification",

      kernel:
        state.parameters.kernel,

      parameters: {
        ...state.parameters,
      },

      createdAt:
        Date.now(),

      metrics: {
        accuracy:
          result.accuracy,

        precision:
          result.precision,

        recall:
          result.recall,

        f1:
          result.f1,

        supportVectors:
          result.supportVectorCount,

        misclassified:
          result.misclassifiedCount,
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

  return (
    <div className="experiment-workspace">
      <div className="experiment-summary">
        <div>
          <span>
            EDUCATIONAL SVC ENGINE
          </span>

          <h3>
            Classification Experiment
          </h3>

          <p>
            Explore classification
            behavior using the selected
            dataset, kernel and
            hyperparameters.
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
            {dataset.scalingEnabled
              ? "Scaling ON"
              : "Scaling OFF"}
          </span>
        </div>
      </div>

      <div className="experiment-warning">
        This browser experiment is an
        educational SVM-like engine.
        Its metrics are not being
        presented as exact
        scikit-learn SVC results.
        Exact sklearn training can be
        connected through the Python
        backend.
      </div>

      <div className="experiment-save-row">
        <div>
          <strong>
            Save this experiment
          </strong>

          <p>
            Store the current kernel,
            hyperparameters and metrics
            so you can compare this run
            with later experiments.
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

      <ClassificationMetrics
        result={result}
      />

      <ConfusionMatrix
        result={result}
      />

      <DecisionScorePlot
        result={result}
      />

      <div className="experiment-block">
        <h4>
          Prediction Inspection
        </h4>

        <div className="prediction-table-wrap">
          <table className="prediction-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Actual</th>
                <th>Predicted</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {result.predictions
                .slice(0, 25)
                .map(
                  (
                    prediction,
                    index
                  ) => (
                    <tr
                      key={
                        prediction.rowId
                      }
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {
                          prediction.actual
                        }
                      </td>

                      <td>
                        {
                          prediction.predicted
                        }
                      </td>

                      <td>
                        {prediction.score.toFixed(
                          4
                        )}
                      </td>

                      <td>
                        {prediction.correct
                          ? "Correct"
                          : "Misclassified"}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}