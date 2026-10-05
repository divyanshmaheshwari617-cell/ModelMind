"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  RoadmapAssignment as RoadmapAssignmentData,
} from "../../types/roadmap";

interface RoadmapAssignmentProps {
  assignment: RoadmapAssignmentData;

  onTaskChange: (
    taskIndex: number,
    completed: boolean
  ) => void;

  onComplete: (
    score?: number
  ) => void;
}

export default function RoadmapAssignment({
  assignment,
  onTaskChange,
  onComplete,
}: RoadmapAssignmentProps) {
  const [showHints, setShowHints] =
    useState(false);

  /*
   * IMPORTANT:
   *
   * Assignment task progress no longer lives
   * in temporary React state.
   *
   * It comes directly from the roadmap so
   * saveRoadmap() can persist it.
   */
  const checkedTasks =
    assignment.completed
      ? assignment.instructions.map(
          (_, index) => index
        )
      : assignment
          .completedTaskIndexes ??
        [];

  const totalTasks =
    assignment.instructions.length;

  const completedTasks =
    assignment.completed
      ? totalTasks
      : checkedTasks.length;

  const allTasksCompleted =
    totalTasks === 0 ||
    completedTasks === totalTasks;

  const progress = useMemo(() => {
    if (assignment.completed) {
      return 100;
    }

    if (totalTasks === 0) {
      return 100;
    }

    return Math.round(
      (completedTasks /
        totalTasks) *
        100
    );
  }, [
    assignment.completed,
    completedTasks,
    totalTasks,
  ]);

  const toggleTask = (
    index: number
  ) => {
    if (assignment.completed) {
      return;
    }

    const currentlyChecked =
      checkedTasks.includes(index);

    onTaskChange(
      index,
      !currentlyChecked
    );
  };

  return (
    <section className="roadmap-assignment-workspace">
      <header className="roadmap-assignment-header">
        <div className="roadmap-assignment-heading">
          <div className="roadmap-assignment-heading-top">
            <span className="roadmap-section-label">
              ASSIGNMENT
            </span>

            {assignment.completed && (
              <span className="roadmap-assignment-completed-badge">
                Completed ✓
              </span>
            )}
          </div>

          <h3>
            {assignment.title}
          </h3>

          <p>
            {assignment.description}
          </p>
        </div>

        <div className="roadmap-assignment-progress-summary">
          <strong>
            {progress}%
          </strong>

          <span>
            {completedTasks}/
            {totalTasks} tasks
          </span>
        </div>
      </header>

      <div className="roadmap-assignment-progress">
        <div className="roadmap-assignment-progress-meta">
          <span>
            Assignment progress
          </span>

          <strong>
            {assignment.completed
              ? "Complete"
              : `${completedTasks} of ${totalTasks}`}
          </strong>
        </div>

        <div className="roadmap-assignment-progress-track">
          <div
            className="roadmap-assignment-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="roadmap-assignment-task-heading">
        <div>
          <span className="roadmap-section-label">
            YOUR TASKS
          </span>

          <h4>
            Complete every step
          </h4>

          <p>
            Work through each task in
            order. Mark a task complete
            when you have finished it.
          </p>
        </div>

        <span className="roadmap-assignment-task-count">
          {completedTasks}/
          {totalTasks}
        </span>
      </div>

      <div className="roadmap-assignment-task-list">
        {assignment.instructions.map(
          (
            instruction,
            index
          ) => {
            const checked =
              assignment.completed ||
              checkedTasks.includes(
                index
              );

            return (
              <button
                key={`${assignment.id}-${index}`}
                type="button"
                className={
                  checked
                    ? "roadmap-assignment-task roadmap-assignment-task-complete"
                    : "roadmap-assignment-task"
                }
                disabled={
                  assignment.completed
                }
                onClick={() =>
                  toggleTask(index)
                }
              >
                <span className="roadmap-assignment-task-number">
                  {checked
                    ? "✓"
                    : String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                </span>

                <div className="roadmap-assignment-task-content">
                  <span className="roadmap-assignment-task-label">
                    Task{" "}
                    {index + 1}
                  </span>

                  <p>
                    {instruction}
                  </p>
                </div>

                <span className="roadmap-assignment-task-status">
                  {checked
                    ? "Done"
                    : "Mark done"}
                </span>
              </button>
            );
          }
        )}
      </div>

      {assignment.hints.length >
        0 && (
        <div className="roadmap-assignment-hints">
          <div className="roadmap-assignment-hints-header">
            <div>
              <span className="roadmap-section-label">
                STUCK?
              </span>

              <h4>
                Assignment hints
              </h4>

              <p>
                Try solving the
                assignment yourself
                first. Reveal these
                hints only when you
                need some direction.
              </p>
            </div>

            <button
              type="button"
              className="roadmap-assignment-hint-toggle"
              onClick={() =>
                setShowHints(
                  (current) =>
                    !current
                )
              }
            >
              {showHints
                ? "Hide hints"
                : "Reveal hints"}
            </button>
          </div>

          {showHints && (
            <div className="roadmap-assignment-hint-list">
              {assignment.hints.map(
                (
                  hint,
                  index
                ) => (
                  <article
                    key={`${assignment.id}-hint-${index}`}
                    className="roadmap-assignment-hint-card"
                  >
                    <span>
                      {index + 1}
                    </span>

                    <div>
                      <strong>
                        Hint{" "}
                        {index + 1}
                      </strong>

                      <p>
                        {hint}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      )}

      <footer className="roadmap-assignment-footer">
        <div>
          <span className="roadmap-section-label">
            {assignment.completed
              ? "ASSIGNMENT COMPLETE"
              : allTasksCompleted
                ? "READY TO FINISH"
                : "KEEP GOING"}
          </span>

          <h4>
            {assignment.completed
              ? "Assignment completed"
              : allTasksCompleted
                ? "All tasks are complete"
                : `${totalTasks - completedTasks} ${
                    totalTasks -
                      completedTasks ===
                    1
                      ? "task"
                      : "tasks"
                  } remaining`}
          </h4>

          <p>
            {assignment.completed
              ? "Your assignment completion has been recorded in your roadmap progress."
              : allTasksCompleted
                ? "Finish the assignment to record this learning milestone."
                : "Complete every task before finishing the assignment."}
          </p>
        </div>

        <button
          type="button"
          className="roadmap-assignment-complete-button"
          disabled={
            assignment.completed ||
            !allTasksCompleted
          }
          onClick={() =>
            onComplete(100)
          }
        >
          {assignment.completed
            ? "Completed ✓"
            : allTasksCompleted
              ? "Complete Assignment →"
              : `${completedTasks}/${totalTasks} completed`}
        </button>
      </footer>
    </section>
  );
}