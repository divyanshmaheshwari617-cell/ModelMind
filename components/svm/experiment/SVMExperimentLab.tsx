import {
  useSVM,
} from "../context/SVMContext";

import SVCExperiment
  from "./SVCExperiment";

import SVRExperiment
  from "./SVRExperiment";

import "./SVMExperimentLab.css";

export default function SVMExperimentLab() {
  const {
    state,
    setTask,
  } = useSVM();

  return (
    <section className="svm-experiment-lab">
      <div className="experiment-heading">
        <div>
          <span>
            MODEL EXPERIMENT
          </span>

          <h2>
            SVC & SVR Experiment
            Studio
          </h2>

          <p>
            Evaluate predictions,
            classification or
            regression metrics,
            support-vector candidates,
            decision scores and
            epsilon behavior.
          </p>
        </div>

        <div className="experiment-task-switch">
          <button
            className={
              state.task ===
              "classification"
                ? "active"
                : ""
            }
            onClick={() =>
              setTask(
                "classification"
              )
            }
          >
            SVC
          </button>

          <button
            className={
              state.task ===
              "regression"
                ? "active"
                : ""
            }
            onClick={() =>
              setTask(
                "regression"
              )
            }
          >
            SVR
          </button>
        </div>
      </div>

      {state.task ===
      "classification" ? (
        <SVCExperiment />
      ) : (
        <SVRExperiment />
      )}
    </section>
  );
}