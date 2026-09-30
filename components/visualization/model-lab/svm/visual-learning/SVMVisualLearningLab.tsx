import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  SVMKernel,
  SVMTask,
} from "../types/svm";

import SVM3DLearningStage from "./SVM3DLearningStage";
import SVMPlaybackControls from "./SVMPlaybackControls";
import SVMStepExplanation from "./SVMStepExplanation";

import {
  getLearningSteps,
} from "./learningSteps";

export default function SVMVisualLearningLab() {
  const [task, setTask] =
    useState<SVMTask>(
      "classification"
    );

  const [currentStep, setCurrentStep] =
    useState(1);

  const [playing, setPlaying] =
    useState(false);

  const [C, setC] =
    useState(1);

  const [epsilon, setEpsilon] =
    useState(0.65);

  const [kernel, setKernel] =
    useState<SVMKernel>(
      "linear"
    );

  const [gamma, setGamma] =
    useState(0.5);

  const [degree, setDegree] =
    useState(3);

  const [queryX, setQueryX] =
    useState(3);

  const [queryY, setQueryY] =
    useState(3);

  const steps =
    useMemo(
      () =>
        getLearningSteps(
          task
        ),
      [task]
    );

  const currentLearningStep =
    steps[
      currentStep - 1
    ] ?? steps[0];

  /*
    PLAY MODE

    Automatically move through
    the visual lesson one concept
    at a time.
  */
  useEffect(() => {
    if (!playing) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setCurrentStep(
            (previous) => {
              if (
                previous >=
                steps.length
              ) {
                setPlaying(
                  false
                );

                return previous;
              }

              return (
                previous + 1
              );
            }
          );
        },
        3500
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    playing,
    steps.length,
  ]);

  function changeTask(
    nextTask: SVMTask
  ) {
    setTask(nextTask);

    setCurrentStep(1);

    setPlaying(false);

    setC(1);

    setEpsilon(0.65);

    setKernel("linear");

    setGamma(0.5);

    setDegree(3);

    setQueryX(3);

    setQueryY(3);
  }

  function previousStep() {
    setPlaying(false);

    setCurrentStep(
      (previous) =>
        Math.max(
          1,
          previous - 1
        )
    );
  }

  function nextStep() {
    setPlaying(false);

    setCurrentStep(
      (previous) =>
        Math.min(
          steps.length,
          previous + 1
        )
    );
  }

  function togglePlay() {
    if (
      currentStep ===
        steps.length &&
      !playing
    ) {
      setCurrentStep(1);

      setPlaying(true);

      return;
    }

    setPlaying(
      (previous) =>
        !previous
    );
  }

  function resetLesson() {
    setPlaying(false);

    setCurrentStep(1);

    setC(1);

    setEpsilon(0.65);

    setKernel("linear");

    setGamma(0.5);

    setDegree(3);

    setQueryX(3);

    setQueryY(3);
  }

  function selectStep(
    step: number
  ) {
    setPlaying(false);

    setCurrentStep(step);
  }

  return (
    <section style={pageStyle}>
      <header style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>
            MODELMIND • VISUAL
            LEARNING LAB
          </div>

          <h1 style={titleStyle}>
            Understand SVM
            Visually
          </h1>

          <p style={heroTextStyle}>
            Don't memorize SVM.
            Watch how the model
            creates a boundary,
            maximizes its margin,
            discovers support
            vectors and uses
            kernels.
          </p>
        </div>

        <div style={taskSwitchStyle}>
          <TaskButton
            active={
              task ===
              "classification"
            }
            onClick={() =>
              changeTask(
                "classification"
              )
            }
          >
            SVC Classification
          </TaskButton>

          <TaskButton
            active={
              task ===
              "regression"
            }
            onClick={() =>
              changeTask(
                "regression"
              )
            }
          >
            SVR Regression
          </TaskButton>
        </div>
      </header>

      <div style={lessonHeaderStyle}>
        <div>
          <div style={stepBadgeStyle}>
            STEP{" "}
            {currentStep} /{" "}
            {steps.length}
          </div>

          <h2
            style={{
              margin:
                "7px 0 0",
            }}
          >
            {
              currentLearningStep.title
            }
          </h2>
        </div>

        <div style={modeBadgeStyle}>
          {task ===
          "classification"
            ? "SVC"
            : "SVR"}
        </div>
      </div>

      <SVM3DLearningStage
        task={task}
        step={currentStep}
        C={C}
        epsilon={epsilon}
        kernel={kernel}
        gamma={gamma}
        degree={degree}
        queryX={queryX}
        queryY={queryY}
      />

      <div
        style={{
          marginTop: 14,
        }}
      >
        <SVMPlaybackControls
          currentStep={
            currentStep
          }
          totalSteps={
            steps.length
          }
          playing={playing}
          onPrevious={
            previousStep
          }
          onNext={nextStep}
          onTogglePlay={
            togglePlay
          }
          onReset={
            resetLesson
          }
          onSelectStep={
            selectStep
          }
        />
      </div>

      <div style={teachingGridStyle}>
        <SVMStepExplanation
          step={
            currentLearningStep
          }
        />

        <section style={tryPanelStyle}>
          <div style={panelEyebrowStyle}>
            TRY IT YOURSELF
          </div>

          <h2
            style={{
              margin:
                "7px 0 6px",
            }}
          >
            Interactive Controls
          </h2>

          <p style={mutedStyle}>
            Controls appear when
            they become useful in
            the lesson. Change
            them and watch the 3D
            scene respond.
          </p>

          {currentStep < 7 && (
            <div style={waitingStyle}>
              Continue to Step 7
              to start changing
              SVM parameters.
            </div>
          )}

          {currentStep >= 7 && (
            <div style={controlsGridStyle}>
              <ControlCard>
                <ControlTitle>
                  C
                </ControlTitle>

                <div style={valueStyle}>
                  {C.toFixed(2)}
                </div>

                <input
                  type="range"
                  min="-1"
                  max="1.3"
                  step="0.05"
                  value={
                    Math.log10(C)
                  }
                  onChange={(
                    event
                  ) =>
                    setC(
                      Math.pow(
                        10,
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    )
                  }
                />

                <ControlHelp>
                  Lower C allows
                  more violations.
                  Higher C
                  penalizes them
                  more strongly.
                </ControlHelp>
              </ControlCard>

              {task ===
                "regression" && (
                <ControlCard>
                  <ControlTitle>
                    ε
                  </ControlTitle>

                  <div style={valueStyle}>
                    {epsilon.toFixed(
                      2
                    )}
                  </div>

                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.05"
                    value={
                      epsilon
                    }
                    onChange={(
                      event
                    ) =>
                      setEpsilon(
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                  />

                  <ControlHelp>
                    Epsilon controls
                    the width of the
                    no-penalty tube.
                  </ControlHelp>
                </ControlCard>
              )}
            </div>
          )}

          {currentStep >= 8 && (
            <div
              style={{
                ...controlsGridStyle,
                marginTop: 12,
              }}
            >
              <ControlCard>
                <ControlTitle>
                  Kernel
                </ControlTitle>

                <select
                  value={kernel}
                  onChange={(
                    event
                  ) =>
                    setKernel(
                      event.target
                        .value as SVMKernel
                    )
                  }
                  style={selectStyle}
                >
                  <option value="linear">
                    Linear
                  </option>

                  <option value="rbf">
                    RBF
                  </option>

                  <option value="polynomial">
                    Polynomial
                  </option>
                </select>

                <ControlHelp>
                  Switch kernels
                  and rotate the
                  3D scene.
                </ControlHelp>
              </ControlCard>

              {kernel ===
                "rbf" && (
                <ControlCard>
                  <ControlTitle>
                    Gamma
                  </ControlTitle>

                  <div style={valueStyle}>
                    {gamma.toFixed(
                      2
                    )}
                  </div>

                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.05"
                    value={
                      gamma
                    }
                    onChange={(
                      event
                    ) =>
                      setGamma(
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                  />

                  <ControlHelp>
                    Gamma controls
                    how local the
                    RBF influence
                    becomes.
                  </ControlHelp>
                </ControlCard>
              )}

              {kernel ===
                "polynomial" && (
                <ControlCard>
                  <ControlTitle>
                    Degree
                  </ControlTitle>

                  <div style={valueStyle}>
                    {degree}
                  </div>

                  <input
                    type="range"
                    min="2"
                    max="5"
                    step="1"
                    value={
                      degree
                    }
                    onChange={(
                      event
                    ) =>
                      setDegree(
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                  />

                  <ControlHelp>
                    Degree controls
                    polynomial
                    complexity.
                  </ControlHelp>
                </ControlCard>
              )}
            </div>
          )}

          {currentStep >= 9 && (
            <div style={predictionStyle}>
              <div style={panelEyebrowStyle}>
                LIVE PREDICTION
              </div>

              <div
                style={{
                  ...controlsGridStyle,
                  marginTop: 12,
                }}
              >
                <ControlCard>
                  <ControlTitle>
                    Feature 1
                  </ControlTitle>

                  <div style={valueStyle}>
                    {queryX.toFixed(
                      2
                    )}
                  </div>

                  <input
                    type="range"
                    min="0.5"
                    max={
                      task ===
                      "classification"
                        ? 5.5
                        : 10
                    }
                    step="0.1"
                    value={
                      queryX
                    }
                    onChange={(
                      event
                    ) =>
                      setQueryX(
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                  />
                </ControlCard>

                {task ===
                  "classification" && (
                  <ControlCard>
                    <ControlTitle>
                      Feature 2
                    </ControlTitle>

                    <div style={valueStyle}>
                      {queryY.toFixed(
                        2
                      )}
                    </div>

                    <input
                      type="range"
                      min="0.5"
                      max="5.5"
                      step="0.1"
                      value={
                        queryY
                      }
                      onChange={(
                        event
                      ) =>
                        setQueryY(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                    />
                  </ControlCard>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <section style={quickGuideStyle}>
        <div style={panelEyebrowStyle}>
          WHAT YOU SHOULD
          UNDERSTAND
        </div>

        <div style={guideGridStyle}>
          {task ===
          "classification" ? (
            <>
              <GuideCard
                title="Hyperplane"
                text="The boundary used to separate classes."
              />

              <GuideCard
                title="Margin"
                text="The gap SVM tries to maximize."
              />

              <GuideCard
                title="Support Vectors"
                text="The influential observations closest to the margin."
              />

              <GuideCard
                title="C"
                text="Controls the penalty for margin violations."
              />

              <GuideCard
                title="Kernel"
                text="Allows nonlinear decision boundaries."
              />
            </>
          ) : (
            <>
              <GuideCard
                title="Prediction Function"
                text="The function used to estimate the continuous target."
              />

              <GuideCard
                title="ε-Tube"
                text="The tolerance region around the prediction function."
              />

              <GuideCard
                title="Support Vectors"
                text="Important observations influencing the SVR solution."
              />

              <GuideCard
                title="C"
                text="Controls penalties outside the tube."
              />

              <GuideCard
                title="Kernel"
                text="Allows nonlinear regression relationships."
              />
            </>
          )}
        </div>
      </section>
    </section>
  );
}

function TaskButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding:
          "11px 16px",
        borderRadius: 11,
        border:
          active
            ? "1px solid #8b5cf6"
            : "1px solid #334155",
        background:
          active
            ? "#6d28d9"
            : "#020617",
        color: "#f8fafc",
        cursor: "pointer",
        fontWeight: 800,
      }}
    >
      {children}
    </button>
  );
}

function ControlCard({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div style={controlCardStyle}>
      {children}
    </div>
  );
}

function ControlTitle({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div style={controlTitleStyle}>
      {children}
    </div>
  );
}

function ControlHelp({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div style={controlHelpStyle}>
      {children}
    </div>
  );
}

function GuideCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div style={guideCardStyle}>
      <strong>{title}</strong>

      <div
        style={{
          marginTop: 7,
          color: "#94a3b8",
          lineHeight: 1.55,
          fontSize: 14,
        }}
      >
        {text}
      </div>
    </div>
  );
}

const pageStyle = {
  display: "grid",
  gap: 18,
};

const heroStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 22,
  padding: "26px 24px",
  borderRadius: 20,
  border:
    "1px solid #334155",
  background:
    "linear-gradient(135deg, #0f172a 0%, #111827 55%, #1e1b4b 100%)",
};

const eyebrowStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const titleStyle = {
  margin: "8px 0 10px",
  fontSize:
    "clamp(32px, 5vw, 54px)",
  lineHeight: 1,
};

const heroTextStyle = {
  maxWidth: 720,
  color: "#94a3b8",
  lineHeight: 1.7,
  marginBottom: 0,
};

const taskSwitchStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 8,
};

const lessonHeaderStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 12,
  padding: "14px 4px 0",
};

const stepBadgeStyle = {
  color: "#a78bfa",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.2,
};

const modeBadgeStyle = {
  padding: "8px 13px",
  borderRadius: 999,
  background: "#312e81",
  color: "#ddd6fe",
  fontWeight: 900,
};

const teachingGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1fr) minmax(320px, 0.9fr)",
  gap: 18,
};

const tryPanelStyle = {
  padding: 22,
  borderRadius: 18,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const panelEyebrowStyle = {
  color: "#22c55e",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const mutedStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const waitingStyle = {
  marginTop: 16,
  padding: 15,
  borderRadius: 12,
  border:
    "1px dashed #475569",
  background: "#020617",
  color: "#94a3b8",
};

const controlsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const controlCardStyle = {
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const controlTitleStyle = {
  fontSize: 13,
  fontWeight: 800,
  color: "#cbd5e1",
};

const valueStyle = {
  margin: "7px 0 10px",
  fontSize: 22,
  fontWeight: 900,
  color: "#f8fafc",
};

const controlHelpStyle = {
  marginTop: 8,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5,
};

const selectStyle = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  borderRadius: 9,
  border:
    "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};

const predictionStyle = {
  marginTop: 18,
  paddingTop: 18,
  borderTop:
    "1px solid #334155",
};

const quickGuideStyle = {
  padding: 20,
  borderRadius: 18,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const guideGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
  marginTop: 14,
};

const guideCardStyle = {
  padding: 14,
  borderRadius: 11,
  background: "#020617",
  border:
    "1px solid #1e293b",
};