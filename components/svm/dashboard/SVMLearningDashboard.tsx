import {
  useMemo,
} from "react";

import {
  useSVM,
} from "../context/SVMContext";

export default function SVMLearningDashboard() {
  const { state } = useSVM();

  const completedSteps =
    Math.max(
      0,
      Math.min(
        state.learningStep,
        11
      )
    );

  const progress =
    Math.round(
      (completedSteps / 11) *
        100
    );

  const classificationRuns =
    useMemo(
      () =>
        state.experiments.filter(
          (experiment) =>
            experiment.task ===
            "classification"
        ).length,
      [state.experiments]
    );

  const regressionRuns =
    useMemo(
      () =>
        state.experiments.filter(
          (experiment) =>
            experiment.task ===
            "regression"
        ).length,
      [state.experiments]
    );

  const latestExperiment =
    state.experiments.length > 0
      ? state.experiments[
          state.experiments.length -
            1
        ]
      : null;

  const levelLabel =
    state.level === "basic"
      ? "Basic"
      : state.level ===
          "intermediate"
        ? "Intermediate"
        : "Advanced";

  const kernelLabel =
    state.parameters.kernel ===
    "rbf"
      ? "RBF"
      : state.parameters.kernel ===
          "chi-square"
        ? "Chi-Square"
        : state.parameters.kernel;

  const cards = [
    {
      label:
        "Visual Learning",
      value:
        `${completedSteps}/11`,
    },
    {
      label: "Progress",
      value: `${progress}%`,
    },
    {
      label:
        "Learning Level",
      value: levelLabel,
    },
    {
      label: "Task",
      value:
        state.task ===
        "classification"
          ? "SVC"
          : "SVR",
    },
    {
      label: "Kernel",
      value: kernelLabel,
    },
    {
      label:
        "Total Saved Runs",
      value: String(
        state.experiments.length
      ),
    },
    {
      label: "SVC Runs",
      value: String(
        classificationRuns
      ),
    },
    {
      label: "SVR Runs",
      value: String(
        regressionRuns
      ),
    },
  ];

  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-heading">
        <span>
          LEARNING DASHBOARD
        </span>

        <h3>
          Your SVM Progress
        </h3>

        <p>
          Track your visual lesson,
          active model configuration
          and saved SVC/SVR
          experiments.
        </p>
      </div>

      <div className="dashboard-progress">
        <div>
          <strong>
            {progress}%
          </strong>

          <span>
            Visual learning progress
          </span>
        </div>

        <div className="dashboard-progress-track">
          <div
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        {cards.map(
          (card) => (
            <article
              key={card.label}
            >
              <span>
                {card.label}
              </span>

              <strong>
                {card.value}
              </strong>
            </article>
          )
        )}
      </div>

      {latestExperiment && (
        <div className="live-parameter-effect">
          <span>
            LATEST SAVED EXPERIMENT
          </span>

          <strong>
            {latestExperiment.task ===
            "classification"
              ? "SVC"
              : "SVR"}
            {" · "}
            {latestExperiment.kernel.toUpperCase()}
          </strong>

          <p>
            C ={" "}
            {latestExperiment.parameters.C.toFixed(
              2
            )}
            {" · "}
            {Object.entries(
              latestExperiment.metrics
            )
              .slice(0, 3)
              .map(
                ([name, value]) =>
                  `${name}: ${
                    Number.isFinite(
                      value
                    )
                      ? value.toFixed(
                          4
                        )
                      : "—"
                  }`
              )
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}