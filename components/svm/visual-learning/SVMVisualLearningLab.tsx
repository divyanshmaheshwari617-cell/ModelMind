import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useSVM,
} from "../context/SVMContext";
import {
  getLearningSteps,
} from "./learningSteps";
import SVMPlaybackControls
  from "./SVMPlaybackControls";
import SVMStepExplanation
  from "./SVMStepExplanation";
import SVM3DScene
  from "./SVM3DScene";
import SVMLiveControlPanel
  from "./SVMLiveControlPanel";
import "./SVMVisualLearningLab.css";
export default function SVMVisualLearningLab() {
  const {
    state,
    setLearningStep,
    setPlaying,
  } = useSVM();
  const [
    viewMode,
    setViewMode,
  ] = useState<
    "2d" | "3d"
  >("2d");
  const steps =
    useMemo(
      () =>
        getLearningSteps(
          state.task
        ),
      [state.task]
    );
  const safeStep =
    Math.min(
      Math.max(
        state.learningStep,
        1
      ),
      steps.length
    );
  const currentStep =
    steps[safeStep - 1];
  const progress =
    steps.length > 1
      ? ((safeStep - 1) /
          (steps.length - 1)) *
        100
      : 100;
  useEffect(() => {
    if (!state.playing) {
      return;
    }
    const timer =
      window.setTimeout(
        () => {
          if (
            safeStep >=
            steps.length
          ) {
            setPlaying(false);
            return;
          }
          setLearningStep(
            safeStep + 1
          );
        },
        4500
      );
    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    state.playing,
    safeStep,
    steps.length,
    setLearningStep,
    setPlaying,
  ]);
  function previous() {
    setPlaying(false);
    setLearningStep(
      Math.max(
        1,
        safeStep - 1
      )
    );
  }
  function next() {
    setPlaying(false);
    setLearningStep(
      Math.min(
        steps.length,
        safeStep + 1
      )
    );
  }
  function restart() {
    setPlaying(false);
    setLearningStep(1);
  }
  function togglePlay() {
    if (
      safeStep >=
        steps.length &&
      !state.playing
    ) {
      setLearningStep(1);
      setPlaying(true);
      return;
    }
    setPlaying(
      !state.playing
    );
  }
  function selectStep(
    stepId: number
  ) {
    setPlaying(false);
    setLearningStep(
      stepId
    );
  }
  return (
    <section className="visual-learning-lab premium-svm-learning">
      <div className="visual-learning-heading">
        <div>
          <div className="visual-kicker">
            MODEL MIND · INTERACTIVE SVM
          </div>
          <h2>
            {state.task ===
            "classification"
              ? "Watch SVC Learn"
              : "Watch SVR Learn"}
          </h2>
          <p>
            Press Play and watch every
            stage appear in sequence.
            Pause anywhere, switch
            between 2D and 3D, rotate
            the scene and change SVM
            parameters live.
          </p>
          <div className="learning-heading-badges">
            <span>
              {state.task ===
              "classification"
                ? "SVC"
                : "SVR"}
            </span>
            <span>
              {
                state.parameters
                  .kernel
              }{" "}
              kernel
            </span>
            <span>
              {viewMode.toUpperCase()}
            </span>
            {state.playing && (
              <span className="playing-badge">
                <i />
                PLAYING
              </span>
            )}
          </div>
        </div>
        <div className="lesson-status premium-status">
          <span>
            ACTIVE DATASET
          </span>
          <strong>
            {state.dataset?.name ??
              "Built-in lesson"}
          </strong>
          <small>
            {state.dataset
              ?.rows.length ?? 0}{" "}
            observations ·{" "}
            {state.dataset
              ?.featureColumns
              .length ?? 0}{" "}
            features
          </small>
          <div className="lesson-progress-value">
            <strong>
              {Math.round(
                progress
              )}
              %
            </strong>
            <span>
              lesson progress
            </span>
          </div>
        </div>
      </div>
      <div className="lesson-progress-track">
        <div
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>
      <div className="learning-step-strip premium-step-strip">
        {steps.map(
          (step) => {
            const current =
              step.id ===
              safeStep;
            const completed =
              step.id <
              safeStep;
            return (
              <button
                key={step.id}
                type="button"
                className={
                  current
                    ? "current"
                    : completed
                      ? "completed"
                      : ""
                }
                onClick={() =>
                  selectStep(
                    step.id
                  )
                }
              >
                <div className="step-orb">
                  {completed
                    ? "✓"
                    : step.id}
                </div>
                <small>
                  {
                    step.shortTitle
                  }
                </small>
                {current && (
                  <i className="current-step-pulse" />
                )}
              </button>
            );
          }
        )}
      </div>
      <div className="current-step-hero">
        <div>
          <span>
            STEP {safeStep} OF{" "}
            {steps.length}
          </span>
          <h3>
            {
              currentStep.title
            }
          </h3>
        </div>
        <div className="current-step-mode">
          <span>
            CURRENT SPACE
          </span>
          <strong>
            {safeStep >= 9
              ? "Kernel / transformed space"
              : "Original feature space"}
          </strong>
        </div>
      </div>
        <div className="playback-card">
          <div className="playback-card-heading">
            <div>
              <span>
                LESSON PLAYER
              </span>
              <strong>
                {state.playing
                  ? "Learning animation running"
                  : "Explore at your own pace"}
              </strong>
            </div>
            <div>
              {safeStep}/
              {steps.length}
            </div>
          </div>
          <SVMPlaybackControls
            currentStep={
              safeStep
            }
            totalSteps={
              steps.length
            }
            playing={
              state.playing
            }
            onPrevious={
              previous
            }
            onNext={next}
            onPlayPause={
              togglePlay
            }
            onRestart={
              restart
            }
          />
        </div>

      <div className="learning-workspace premium-learning-workspace">
        <div className="visual-stage premium-visual-stage">
          <div className="visual-stage-toolbar">
            <div>
              <span>
                LIVE SVM VISUALIZATION
              </span>
              <strong>
                {
                  currentStep.title
                }
              </strong>
            </div>
            <div className="view-mode-switch premium-view-switch">
              <button
                type="button"
                className={
                  viewMode ===
                  "2d"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setViewMode(
                    "2d"
                  )
                }
              >
                <span>
                  ◫
                </span>
                2D
              </button>
              <button
                type="button"
                className={
                  viewMode ===
                  "3d"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setViewMode(
                    "3d"
                  )
                }
              >
                <span>
                  ◈
                </span>
                3D
              </button>
            </div>
          </div>
          <div className="visual-stage-meta">
            <div>
              <span>
                STEP
              </span>
              <strong>
                {safeStep}/
                {steps.length}
              </strong>
            </div>
            <div>
              <span>
                VIEW
              </span>
              <strong>
                {viewMode.toUpperCase()}
              </strong>
            </div>
            <div>
              <span>
                KERNEL
              </span>
              <strong>
                {
                  state.parameters
                    .kernel
                }
              </strong>
            </div>
            <div>
              <span>
                C
              </span>
              <strong>
                {
                  state.parameters.C
                }
              </strong>
            </div>
            {state.task ===
              "regression" && (
              <div>
                <span>
                  ε
                </span>
                <strong>
                  {
                    state
                      .parameters
                      .epsilon
                  }
                </strong>
              </div>
            )}
          </div>
          <SVM3DScene
            step={safeStep}
            viewMode={viewMode}
          />
          <div className="visual-help-bar">
            <span>
              {viewMode ===
              "3d"
                ? "Drag to rotate · Scroll to zoom · Drag axes to explore"
                : "Hover points for details · Change parameters live"}
            </span>
            <strong>
              {
                currentStep.shortTitle
              }
            </strong>
          </div>
        </div>
        <SVMLiveControlPanel
          step={safeStep}
          viewMode={viewMode}
        />
      </div>
      <div className="learning-bottom-grid">
        <SVMStepExplanation
          step={currentStep}
        />
      </div>
    </section>
  );
}
