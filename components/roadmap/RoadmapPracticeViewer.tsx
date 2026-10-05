"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  LessonPracticeProblem,
} from "../../types/roadmap";

interface RoadmapPracticeViewerProps {
  problems: LessonPracticeProblem[];

  practiceCompleted?: boolean;

  completedProblemIds?: string[];

  onProblemComplete?: (
    problemId: string
  ) => void;

  onPracticeComplete?: () => void;
}

export default function RoadmapPracticeViewer({
  problems,
  practiceCompleted = false,
  completedProblemIds = [],
  onProblemComplete,
  onPracticeComplete,
}: RoadmapPracticeViewerProps) {
  const [
    activeProblemIndex,
    setActiveProblemIndex,
  ] = useState(0);

  const [
    visibleHintCount,
    setVisibleHintCount,
  ] = useState(0);

  const [
    showSolution,
    setShowSolution,
  ] = useState(false);

  /*
   * Local state makes the UI respond immediately.
   *
   * completedProblemIds from the roadmap remains
   * the persistent source that survives refresh.
   */
  const [
    localCompletedProblemIds,
    setLocalCompletedProblemIds,
  ] = useState<string[]>(
    completedProblemIds
  );

  /*
   * Whenever persisted roadmap progress changes,
   * synchronize it back into the viewer.
   */
  useEffect(() => {
  if (practiceCompleted) {
    setLocalCompletedProblemIds(
      problems.map(
        (problem) => problem.id
      )
    );

    return;
  }

  /*
   * Merge persisted progress into local progress.
   *
   * Do NOT replace local state with the incoming array.
   * A parent re-render can temporarily provide an older
   * completedProblemIds value while the roadmap update is
   * propagating.
   *
   * Merging prevents a freshly completed problem from
   * disappearing back to 0/5.
   */
  setLocalCompletedProblemIds(
    (currentIds) =>
      Array.from(
        new Set([
          ...currentIds,
          ...completedProblemIds,
        ])
      )
  );
}, [
  completedProblemIds,
  practiceCompleted,
  problems,
]);

  /*
   * Make sure the active index is valid if a
   * different lesson/practice set is loaded.
   */
  useEffect(() => {
    setActiveProblemIndex(
      (current) =>
        Math.min(
          current,
          Math.max(
            problems.length - 1,
            0
          )
        )
    );
  }, [problems.length]);

  /*
   * Reset problem-specific UI whenever the learner
   * moves to another problem.
   */
  useEffect(() => {
    setVisibleHintCount(0);
    setShowSolution(false);
  }, [activeProblemIndex]);

  const activeProblem =
    problems[activeProblemIndex];

  const completedSet =
    useMemo(
      () =>
        new Set(
          localCompletedProblemIds
        ),
      [localCompletedProblemIds]
    );

  if (
    problems.length === 0 ||
    !activeProblem
  ) {
    return (
      <section className="practice-workspace">
        <div className="lesson-empty-state">
          No practice problems have been
          added for this lesson yet.
        </div>
      </section>
    );
  }

  const hints =
    activeProblem.hints ?? [];

  const isCompleted =
    practiceCompleted ||
    completedSet.has(
      activeProblem.id
    );

  const completedCount =
    practiceCompleted
      ? problems.length
      : problems.filter(
          (problem) =>
            completedSet.has(
              problem.id
            )
        ).length;

  const completedPercentage =
    problems.length > 0
      ? Math.round(
          (completedCount /
            problems.length) *
            100
        )
      : 0;

  const revealNextHint = () => {
    setVisibleHintCount(
      (current) =>
        Math.min(
          current + 1,
          hints.length
        )
    );
  };

  const markProblemCompleted =
    () => {
      
      if (isCompleted) {
        return;
      }

      /*
       * Update UI immediately.
       */
      const updatedIds =
        Array.from(
          new Set([
            ...localCompletedProblemIds,
            activeProblem.id,
          ])
        );

      setLocalCompletedProblemIds(
        updatedIds
      );

      /*
       * Persist this exact problem through:
       *
       * PracticeViewer
       * -> LessonViewer
       * -> DayWorkspace
       * -> roadmapProgress
       * -> roadmap state
       * -> localStorage
       */
      onProblemComplete?.(
        activeProblem.id
      );

      /*
       * When every problem has been completed,
       * also complete the overall Practice activity.
       */
      const allCompleted =
        problems.every(
          (problem) =>
            updatedIds.includes(
              problem.id
            )
        );

      if (allCompleted) {
        onPracticeComplete?.();
      }
    };

  const goToPreviousProblem =
    () => {
      setActiveProblemIndex(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );
    };

  const goToNextProblem = () => {
    setActiveProblemIndex(
      (current) =>
        Math.min(
          current + 1,
          problems.length - 1
        )
    );
  };

  return (
    <section className="practice-workspace">
      <header className="practice-header">
        <div>
          <span className="roadmap-section-label">
            PRACTICE
          </span>

          <h3>
            Apply what you learned
          </h3>

          <p>
            Solve each problem yourself
            before revealing the solution.
            Use hints gradually when you
            need help.
          </p>
        </div>

        <div className="practice-progress">
          <div className="practice-progress-meta">
            <span>
              Practice progress
            </span>

            <strong>
              {completedCount}/
              {problems.length}
            </strong>
          </div>

          <div className="practice-progress-track">
            <div
              className="practice-progress-fill"
              style={{
                width:
                  `${completedPercentage}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className="practice-layout">
        <aside className="practice-problem-navigation">
          <div className="practice-navigation-heading">
            <span>
              PROBLEMS
            </span>

            <strong>
              {problems.length}
            </strong>
          </div>

          <div className="practice-problem-list">
            {problems.map(
              (problem, index) => {
                const completed =
                  practiceCompleted ||
                  completedSet.has(
                    problem.id
                  );

                return (
                  <button
                    key={problem.id}
                    type="button"
                    className={
                      index ===
                      activeProblemIndex
                        ? "practice-problem-button practice-problem-button-active"
                        : "practice-problem-button"
                    }
                    onClick={() =>
                      setActiveProblemIndex(
                        index
                      )
                    }
                  >
                    <span className="practice-problem-number">
                      {completed
                        ? "✓"
                        : String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                    </span>

                    <span className="practice-problem-button-content">
                      <strong>
                        {
                          problem.title
                        }
                      </strong>

                      <small>
                        {
                          problem.difficulty
                        }
                      </small>
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </aside>

        <article className="practice-problem-panel">
          <header className="practice-problem-header">
            <div className="practice-badges">
              <span
                className={`practice-difficulty practice-difficulty-${activeProblem.difficulty}`}
              >
                {
                  activeProblem.difficulty
                }
              </span>

              <span className="practice-type">
                {activeProblem.type}
              </span>

              {isCompleted && (
                <span className="practice-completed-badge">
                  ✓ Completed
                </span>
              )}
            </div>

            <span className="practice-problem-counter">
              PROBLEM{" "}
              {activeProblemIndex + 1}{" "}
              OF {problems.length}
            </span>

            <h3>
              {activeProblem.title}
            </h3>
          </header>

          <section className="practice-question">
            <span className="practice-section-label">
              YOUR TASK
            </span>

            <p>
              {
                activeProblem.question
              }
            </p>
          </section>

          {activeProblem.instructions &&
            activeProblem.instructions
              .length > 0 && (
              <section className="practice-instructions">
                <span className="practice-section-label">
                  REQUIREMENTS
                </span>

                <div className="practice-instruction-list">
                  {activeProblem.instructions.map(
                    (
                      instruction,
                      index
                    ) => (
                      <div
                        key={`${activeProblem.id}-instruction-${index}`}
                        className="practice-instruction"
                      >
                        <span>
                          {index + 1}
                        </span>

                        <p>
                          {instruction}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          {activeProblem.starterCode && (
            <section className="practice-starter-code">
              <div className="practice-block-heading">
                <span className="practice-section-label">
                  STARTER CODE
                </span>

                <p>
                  Start from this code and
                  complete the task.
                </p>
              </div>

              <div className="practice-code-block">
                <div className="practice-code-toolbar">
                  <span>
                    Python
                  </span>

                  <span>
                    Starter
                  </span>
                </div>

                <pre>
                  <code>
                    {
                      activeProblem.starterCode
                    }
                  </code>
                </pre>
              </div>
            </section>
          )}

          <section className="practice-answer-workspace">
            <div>
              <span className="practice-section-label">
                YOUR WORKSPACE
              </span>

              <h4>
                Solve it before checking
                the answer
              </h4>

              <p>
                During ModelMind
                integration, this area will
                connect to the existing
                notebook/runtime so you can
                write and execute your
                solution here.
              </p>
            </div>

            <div className="practice-answer-placeholder">
              <span>
                CODE WORKSPACE
              </span>

              <p>
                Your editable ModelMind
                notebook cell will appear
                here after integration.
              </p>
            </div>
          </section>

          {hints.length > 0 && (
            <section className="practice-hints">
              <div className="practice-hints-header">
                <div>
                  <span className="practice-section-label">
                    PROGRESSIVE HINTS
                  </span>

                  <h4>
                    Need a little help?
                  </h4>
                </div>

                {visibleHintCount <
                  hints.length && (
                  <button
                    type="button"
                    onClick={
                      revealNextHint
                    }
                    className="practice-hint-button"
                  >
                    Reveal hint{" "}
                    {visibleHintCount +
                      1}
                  </button>
                )}
              </div>

              {visibleHintCount === 0 ? (
                <div className="practice-hint-empty">
                  Try solving the problem
                  yourself first. Reveal a
                  hint only when you need
                  one.
                </div>
              ) : (
                <div className="practice-hint-list">
                  {hints
                    .slice(
                      0,
                      visibleHintCount
                    )
                    .map(
                      (
                        hint,
                        index
                      ) => (
                        <div
                          key={`${activeProblem.id}-hint-${index}`}
                          className="practice-hint-card"
                        >
                          <span>
                            HINT{" "}
                            {index + 1}
                          </span>

                          <p>
                            {hint}
                          </p>
                        </div>
                      )
                    )}
                </div>
              )}
            </section>
          )}

          <section className="practice-solution-section">
            <div className="practice-solution-header">
              <div>
                <span className="practice-section-label">
                  SOLUTION
                </span>

                <h4>
                  Check your approach
                </h4>
              </div>

              {!showSolution && (
                <button
                  type="button"
                  className="practice-solution-button"
                  onClick={() =>
                    setShowSolution(true)
                  }
                >
                  Reveal solution
                </button>
              )}
            </div>

            {!showSolution ? (
              <div className="practice-solution-locked">
                The solution is hidden so
                you can attempt the problem
                first.
              </div>
            ) : (
              <div className="practice-solution-content">
                {activeProblem.solution ? (
                  <div className="practice-code-block practice-solution-code">
                    <div className="practice-code-toolbar">
                      <span>
                        Python
                      </span>

                      <span>
                        Solution
                      </span>
                    </div>

                    <pre>
                      <code>
                        {
                          activeProblem.solution
                        }
                      </code>
                    </pre>
                  </div>
                ) : (
                  <div className="lesson-empty-state">
                    A reference solution
                    has not been added for
                    this problem yet.
                  </div>
                )}

                {activeProblem.explanation && (
                  <div className="practice-solution-explanation">
                    <strong>
                      Why this works
                    </strong>

                    <p>
                      {
                        activeProblem.explanation
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          <footer className="practice-problem-footer">
            <button
              type="button"
              className="practice-navigation-button"
              disabled={
                activeProblemIndex === 0
              }
              onClick={
                goToPreviousProblem
              }
            >
              ← Previous
            </button>

            <button
              type="button"
              className={
                isCompleted
                  ? "practice-complete-button practice-complete-button-done"
                  : "practice-complete-button"
              }
              disabled={isCompleted}
              onClick={
                markProblemCompleted
              }
            >
              {isCompleted
                ? "✓ Problem Completed"
                : "Mark as Complete"}
            </button>

            <button
              type="button"
              className="practice-navigation-button practice-navigation-button-primary"
              disabled={
                activeProblemIndex ===
                problems.length - 1
              }
              onClick={
                goToNextProblem
              }
            >
              Next →
            </button>
          </footer>
        </article>
      </div>
    </section>
  );
}
