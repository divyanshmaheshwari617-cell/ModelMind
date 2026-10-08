import { useMemo, useState } from "react";
import { useSVM } from "../context/SVMContext";
import type { SVMExperimentResult } from "../types/svm";
import SVCExperiment from "./SVCExperiment";
import SVRExperiment from "./SVRExperiment";
import {
  runSVCExperiment,
  runSVRExperiment,
} from "./experimentEngine";
import "./SVMExperimentLab.css";

export default function SVMExperimentLab() {
  const {
    state,
    addExperiment,
  } = useSVM();

  const [runId, setRunId] = useState(1);
  const [message, setMessage] = useState("");

  const dataset = state.dataset;

  const svcResult = useMemo(() => {
    if (!dataset || state.task !== "classification") {
      return null;
    }

    return runSVCExperiment(
      dataset,
      state.parameters
    );
  }, [
    dataset,
    state.task,
    state.parameters,
    runId,
  ]);

  const svrResult = useMemo(() => {
    if (!dataset || state.task !== "regression") {
      return null;
    }

    return runSVRExperiment(
      dataset,
      state.parameters
    );
  }, [
    dataset,
    state.task,
    state.parameters,
    runId,
  ]);

  function rerun() {
    setRunId((current) => current + 1);
    setMessage("Experiment recalculated with the current shared SVM state.");
  }

  function save() {
  if (!dataset) return;

  let metrics: Record<string, number>;

  if (
    state.task === "classification" &&
    svcResult
  ) {
    metrics = {
      accuracy: svcResult.accuracy,
      macroPrecision: svcResult.macroPrecision,
      macroRecall: svcResult.macroRecall,
      macroF1: svcResult.macroF1,
      supportVectors:
        svcResult.supportVectorIndexes.length,
      misclassified:
        svcResult.misclassifiedIndexes.length,
    };
  } else if (
    state.task === "regression" &&
    svrResult
  ) {
    metrics = {
      mae: svrResult.mae,
      mse: svrResult.mse,
      rmse: svrResult.rmse,
      r2: svrResult.r2,
      outsideEpsilon:
        svrResult.outsideEpsilonIndexes.length,
      supportVectors:
        svrResult.supportVectorIndexes.length,
    };
  } else {
    return;
  }

  const experiment: SVMExperimentResult = {
    id: `svm-${Date.now()}`,
    task: state.task,
    kernel: state.parameters.kernel,

    parameters: {
      ...state.parameters,
    },

    createdAt: Date.now(),

    metrics,
  };

  addExperiment(experiment);

  setMessage(
    `Saved ${
      state.task === "classification"
        ? "SVC"
        : "SVR"
    } experiment.`
  );
}

  if (!dataset) {
    return (
      <section className="svm-experiment-lab">
        <div className="experiment-heading">
          <div>
            <span>EXPERIMENT LAB</span>
            <h2>Activate a dataset first</h2>
            <p>
              Dataset Studio supplies the shared data used by SVC and SVR experiments.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="svm-experiment-lab">
      <div className="experiment-heading">
        <div>
          <span>MODEL EXPERIMENT</span>
          <h2>
            {state.task === "classification"
              ? "SVC Evaluation Lab"
              : "SVR Evaluation Lab"}
          </h2>
          <p>
            Evaluate the same dataset, preprocessing state and SVM parameters
            used by Visual Learning, Kernel Labs and Live Prediction.
          </p>
        </div>

        <div className="experiment-actions">
          <button type="button" onClick={rerun}>
            Run Experiment
          </button>
          <button
            type="button"
            className="primary"
            onClick={save}
          >
            Save Experiment
          </button>
        </div>
      </div>

      <div className="experiment-state-strip">
        <State label="Dataset" value={dataset.name} />
        <State
          label="Task"
          value={state.task === "classification" ? "SVC" : "SVR"}
        />
        <State label="Kernel" value={state.parameters.kernel} />
        <State label="C" value={state.parameters.C.toFixed(2)} />
        <State
          label={state.task === "classification" ? "Class Weight" : "Epsilon"}
          value={
            state.task === "classification"
              ? state.parameters.classWeight
              : state.parameters.epsilon.toFixed(3)
          }
        />
        <State
          label="Scaling"
          value={dataset.scalingEnabled ? "ON" : "OFF"}
        />
      </div>

      {message && (
        <div className="experiment-message">
          {message}
        </div>
      )}

      {state.task === "classification" && svcResult && (
        <SVCExperiment
          result={svcResult}
          parameters={state.parameters}
        />
      )}

      {state.task === "regression" && svrResult && (
        <SVRExperiment
          result={svrResult}
          parameters={state.parameters}
        />
      )}

      <div className="experiment-save-status">
        <strong>{state.experiments.length}</strong>
        <span>saved experiment{state.experiments.length === 1 ? "" : "s"}</span>
      </div>
    </section>
  );
}

function State({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
