"use client";
import {
  useState,
} from "react";

import type {
  ActivityType,
  PersonalizedRoadmapData,
  RoadmapDay,
} from "../../types/roadmap";
import {
  recordWeakTopicCheckpoint,
  startWeakTopicRecovery,
} from "../../lib/roadmap/roadmapWeakTopics";

import {
  getLessonBySkillId,
} from "../../data/roadmap/lessons/lessonRegistry";

import {
  completeAssignment,
  completeQuiz,
  getDayProgress,
  setAssignmentTaskCompletion,
  setActivityCompletion,
  setPracticeProblemCompletion,

} from "../../lib/roadmap/roadmapProgress";

import RoadmapAssignment from "./RoadmapAssignment";
import RoadmapLessonViewer from "./RoadmapLessonViewer";
import RoadmapQuiz from "./RoadmapQuiz";
import RoadmapWeakTopicRecovery from "./RoadmapWeakTopicRecovery";

interface RoadmapDayWorkspaceProps {
  day: RoadmapDay;

  currentDay: number;

  roadmap: PersonalizedRoadmapData;

  onRoadmapChange: (
    roadmap: PersonalizedRoadmapData
  ) => void;

  onContinueToDay: (
    dayNumber: number
  ) => void;
}

export default function RoadmapDayWorkspace({
  day,
  currentDay,
  roadmap,
  onRoadmapChange,
  onContinueToDay,
}: RoadmapDayWorkspaceProps) {
    const [latestCheckpointScore, setLatestCheckpointScore] =
    useState<number | null>(
      day.quiz?.completed
        ? day.quiz.score ?? null
        : null
    );
  /*
   * Always resolve the selected day from the latest
   * roadmap state.
   *
   * This prevents us from rendering an old copy of
   * the day after progress changes.
   */
  const liveDay =
    roadmap.weeks
      .flatMap(
        (week) => week.days
      )
      .find(
        (roadmapDay) =>
          roadmapDay.id === day.id
      ) ?? day;

  const isCompleted =
    liveDay.completed;

  const isCurrent =
    liveDay.dayNumber ===
    currentDay;

  const status =
    isCompleted
      ? "Completed"
      : isCurrent
        ? "Current"
        : "Upcoming";

  const totalSections =
    liveDay.topics.length +
    (liveDay.assignment ? 1 : 0) +
    (liveDay.quiz ? 1 : 0);

  const dayProgress =
    getDayProgress(
      liveDay
    );

  /*
   * Get activities belonging to one topic
   * and one learning stage.
   */
  function getDayTopicActivities(
    topicId: string,
    type: ActivityType
  ) {
    const topic =
      liveDay.topics.find(
        (candidate) =>
          candidate.id === topicId
      );

    if (!topic) {
      return [];
    }

    return topic.activities.filter(
      (activity) =>
        activity.type === type
    );
  }

  /*
   * Complete one entire learning stage.
   *
   * A skill can contain more than one activity
   * part, therefore every matching activity
   * is completed.
   */
  function completeDayTopicActivityType(
    topicId: string,
    type: ActivityType
  ) {
    const activities =
      getDayTopicActivities(
        topicId,
        type
      );

    if (
      activities.length === 0
    ) {
      return;
    }

    let updatedRoadmap =
      roadmap;

    for (
      const activity
      of activities
    ) {
      if (
        !activity.completed
      ) {
        updatedRoadmap =
          setActivityCompletion(
            updatedRoadmap,
            activity.id,
            true
          );
      }
    }

    onRoadmapChange(
      updatedRoadmap
    );
  }

  function handleLearnComplete(
    topicId: string
  ) {
    completeDayTopicActivityType(
      topicId,
      "concept"
    );
  }

  function handleVisualizeComplete(
    topicId: string
  ) {
    completeDayTopicActivityType(
      topicId,
      "visualization"
    );
  }

  function handleCodeComplete(
    topicId: string
  ) {
    completeDayTopicActivityType(
      topicId,
      "coding"
    );
  }
  function handleReviewComplete(
  topicId: string
) {
  completeDayTopicActivityType(
    topicId,
    "revision"
  );
}

  /*
   * Complete the overall Practice stage.
   *
   * RoadmapPracticeViewer calls this after
   * every problem has been completed.
   */
  function handlePracticeComplete(
    topicId: string
  ) {
    completeDayTopicActivityType(
      topicId,
      "practice"
    );
  }

  /*
   * Persist an individual practice problem.
   *
   * Example:
   *
   * completedProblemIds:
   *
   * []
   *
   * becomes
   *
   * ["problem-1"]
   *
   * then
   *
   * ["problem-1", "problem-2"]
   *
   * etc.
   */
  function handlePracticeProblemComplete(
    topicId: string,
    problemId: string
  ) {
    const practiceActivities =
      getDayTopicActivities(
        topicId,
        "practice"
      );

    if (
      practiceActivities.length === 0
    ) {
      return;
    }

    let updatedRoadmap =
      roadmap;

    for (
      const activity
      of practiceActivities
    ) {
      updatedRoadmap =
        setPracticeProblemCompletion(
          updatedRoadmap,
          activity.id,
          problemId,
          true
        );
    }

    onRoadmapChange(
      updatedRoadmap
    );
  }
  function handleAssignmentTaskChange(
  assignmentId: string,
  taskIndex: number,
  completed: boolean
) {
  const updatedRoadmap =
    setAssignmentTaskCompletion(
      roadmap,
      assignmentId,
      taskIndex,
      completed
    );

  onRoadmapChange(
    updatedRoadmap
  );
}
  function handleAssignmentComplete(
    assignmentId: string,
    score?: number
  ) {
    const updatedRoadmap =
      completeAssignment(
        roadmap,
        assignmentId,
        score
      );

    onRoadmapChange(
      updatedRoadmap
    );
  }
  function handleQuizComplete(
  quizId: string,
  score: number
) {
  let updatedRoadmap =
    completeQuiz(
      roadmap,
      quizId,
      score
    );

  /*
   * Use the checkpoint's topicIds as
   * the source of truth.
   *
   * A failed checkpoint should not be
   * ignored just because the roadmap
   * day contains multiple topics.
   */
  const quiz =
    liveDay.quiz;

  const checkpointTopics =
    quiz
      ? liveDay.topics.filter(
          (topic) =>
            quiz.topicIds.includes(
              topic.id
            )
        )
      : [];

  /*
   * If topicIds are unavailable or do
   * not match for any reason, fall back
   * to the day's topics.
   */
  const topicsToEvaluate =
    checkpointTopics.length > 0
      ? checkpointTopics
      : liveDay.topics;

  for (
    const topic
    of topicsToEvaluate
  ) {
    updatedRoadmap =
      recordWeakTopicCheckpoint(
        updatedRoadmap,
        {
          skillId:
            topic.id,

          topicTitle:
            topic.title,

          dayId:
            liveDay.id,

          dayNumber:
            liveDay.dayNumber,

          score,
        }
      );
  }

  setLatestCheckpointScore(
    score
  );

  onRoadmapChange(
    updatedRoadmap
  );
}
function handleStartWeakTopicRecovery(
  skillId: string
) {
  const updatedRoadmap =
    startWeakTopicRecovery(
      roadmap,
      skillId
    );

  onRoadmapChange(
    updatedRoadmap
  );
}
  return (
    <section className="day-workspace">
      {/* ============================= */}
      {/* DAY HEADER */}
      {/* ============================= */}

      <header className="day-workspace-header">
        <div>
          <div className="day-workspace-meta">
            <span className="day-workspace-number">
              DAY {liveDay.dayNumber}
            </span>

            <span
              className={`day-workspace-status day-workspace-status-${status.toLowerCase()}`}
            >
              {status}
            </span>
          </div>

          <h2 className="day-workspace-title">
            {liveDay.title}
          </h2>

          <p className="day-workspace-description">
            Learn the concepts,
            understand the intuition,
            study examples, visualize
            the ideas, understand the
            code, practise what you
            learned and complete the
            checkpoint for this day.
          </p>
        </div>

        <div className="day-workspace-progress-card">
          <span className="day-workspace-progress-label">
            DAY PROGRESS
          </span>

          <strong>
            {Math.round(
              dayProgress.percentage
            )}
            %
          </strong>

          <div className="day-workspace-progress-track">
            <div
              className="day-workspace-progress-fill"
              style={{
                width:
                  `${dayProgress.percentage}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* ============================= */}
      {/* DAY OVERVIEW */}
      {/* ============================= */}

      <div className="day-workspace-overview">
        <div className="day-workspace-overview-card">
          <span>
            Topics
          </span>

          <strong>
            {
              liveDay.topics
                .length
            }
          </strong>
        </div>

        <div className="day-workspace-overview-card">
          <span>
            Learning sections
          </span>

          <strong>
            {totalSections}
          </strong>
        </div>

        <div className="day-workspace-overview-card">
          <span>
            Status
          </span>

          <strong>
            {status}
          </strong>
        </div>
      </div>

      {/* ============================= */}
      {/* TODAY'S GOALS */}
      {/* ============================= */}

      <section className="day-workspace-mastery">
        <div className="day-workspace-section-heading">
          <span className="roadmap-section-label">
            TODAY&apos;S GOAL
          </span>

          <h3>
            What you will master
          </h3>

          <p>
            By the end of this day,
            you should understand and
            be able to apply the
            following topics.
          </p>
        </div>

        <div className="day-workspace-mastery-grid">
          {liveDay.topics.map(
            (
              topic,
              index
            ) => (
              <article
                key={
                  topic.id
                }
                className="day-workspace-mastery-card"
              >
                <span className="day-workspace-mastery-number">
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <div>
                  <h4>
                    {
                      topic.title
                    }
                  </h4>

                  <p>
                    {
                      topic.description
                    }
                  </p>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {/* ============================= */}
      {/* LEARNING WORKSPACE */}
      {/* ============================= */}

      <section className="day-learning-path">
        <div className="day-workspace-section-heading">
          <span className="roadmap-section-label">
            LEARNING WORKSPACE
          </span>

          <h3>
            Learn everything for
            Day{" "}
            {liveDay.dayNumber}
          </h3>

          <p>
            Each topic contains the
            complete lesson,
            intuition, examples,
            visualization, code and
            practice directly inside
            ModelMind.
          </p>
        </div>

        <div className="day-learning-topic-list">
          {liveDay.topics.map(
            (
              topic,
              topicIndex
            ) => {
              const lesson =
                getLessonBySkillId(
                  topic.id
                );

              /*
               * Resolve every stage from the
               * current roadmap state.
               */
              const conceptActivities =
                getDayTopicActivities(
                  topic.id,
                  "concept"
                );

              const visualizationActivities =
                getDayTopicActivities(
                  topic.id,
                  "visualization"
                );

              const codingActivities =
                getDayTopicActivities(
                  topic.id,
                  "coding"
                );

              const practiceActivities =
                getDayTopicActivities(
                  topic.id,
                  "practice"
                );

              const hasLearn =
                conceptActivities.length >
                0;

              const hasVisualize =
                visualizationActivities
                  .length > 0;

              const hasCode =
                codingActivities.length >
                0;

              const hasPractice =
                practiceActivities.length >
                0;

              /*
               * Stage completion.
               */
              const learnCompleted =
                hasLearn &&
                conceptActivities.every(
                  (activity) =>
                    activity.completed
                );

              const visualizeCompleted =
                hasVisualize &&
                visualizationActivities.every(
                  (activity) =>
                    activity.completed
                );

              const codeCompleted =
                hasCode &&
                codingActivities.every(
                  (activity) =>
                    activity.completed
                );

              const practiceCompleted =
                hasPractice &&
                practiceActivities.every(
                  (activity) =>
                    activity.completed
                );

              /*
               * IMPORTANT:
               *
               * Individual practice completion
               * is stored on RoadmapActivity.
               *
               * There can be multiple practice
               * activity parts, therefore merge
               * all IDs and remove duplicates.
               */
              const completedPracticeProblemIds =
                Array.from(
                  new Set(
                    practiceActivities.flatMap(
                      (activity) =>
                        activity.completedProblemIds ??
                        []
                    )
                  )
                );

              return (
                <article
                  key={
                    topic.id
                  }
                  className="day-learning-topic"
                >
                  {/* ============================= */}
                  {/* TOPIC HEADER */}
                  {/* ============================= */}

                  <header className="day-learning-topic-header">
                    <div className="day-learning-topic-index">
                      {
                        topicIndex +
                        1
                      }
                    </div>

                    <div>
                      <span className="day-learning-topic-label">
                        TOPIC{" "}
                        {
                          topicIndex +
                          1
                        }
                      </span>

                      <h3>
                        {
                          topic.title
                        }
                      </h3>

                      <p>
                        {lesson
                          ?.overview ??
                          topic.description}
                      </p>
                    </div>
                  </header>

                  {/* ============================= */}
                  {/* FOUR LEARNING STAGES */}
                  {/* ============================= */}

                  <div className="day-learning-stage-grid">
                    {/* LEARN */}

                    <div className="day-learning-stage">
                      <span>
                        01
                      </span>

                      <strong>
                        Learn
                      </strong>

                      <p>
                        {lesson
                          ? `${lesson.sections.length} detailed learning sections`
                          : "Detailed concept and intuition."}
                      </p>

                      {hasLearn &&
                        learnCompleted && (
                          <small>
                            Completed
                          </small>
                        )}
                    </div>

                    {/* VISUALIZE */}

                    <div className="day-learning-stage">
                      <span>
                        02
                      </span>

                      <strong>
                        Visualize
                      </strong>

                      <p>
                        {lesson
                          ?.visualization
                          ? lesson
                              .visualization
                              .title
                          : "Understand the idea visually."}
                      </p>

                      {hasVisualize &&
                        visualizeCompleted && (
                          <small>
                            Completed
                          </small>
                        )}
                    </div>

                    {/* CODE */}

                    <div className="day-learning-stage">
                      <span>
                        03
                      </span>

                      <strong>
                        Code
                      </strong>

                      <p>
                        {lesson
                          ? `${lesson.codeExamples.length} guided code example${
                              lesson
                                .codeExamples
                                .length ===
                              1
                                ? ""
                                : "s"
                            }`
                          : "Learn how the concept is implemented."}
                      </p>

                      {hasCode &&
                        codeCompleted && (
                          <small>
                            Completed
                          </small>
                        )}
                    </div>

                    {/* PRACTICE */}

                    <div className="day-learning-stage">
                      <span>
                        04
                      </span>

                      <strong>
                        Practice
                      </strong>

                      <p>
                        {lesson
                          ? `${lesson.practice.length} practice problem${
                              lesson
                                .practice
                                .length ===
                              1
                                ? ""
                                : "s"
                            }`
                          : "Apply what you have learned."}
                      </p>

                      {hasPractice &&
                        practiceCompleted && (
                          <small>
                            Completed
                          </small>
                        )}
                    </div>
                  </div>

                  {/* ============================= */}
                  {/* DEEP LESSON */}
                  {/* ============================= */}

                  {lesson &&
                    hasLearn && (
                      <RoadmapLessonViewer
                        key={
                          lesson.id
                        }
                        lesson={
                          lesson
                        }
                        learnCompleted={
                          learnCompleted
                        }
                        visualizeCompleted={
                          visualizeCompleted
                        }
                        codeCompleted={
                          codeCompleted
                        }
                        practiceCompleted={
                          practiceCompleted
                        }
                        completedPracticeProblemIds={
                          completedPracticeProblemIds
                        }
                        onLearnComplete={() =>
                          handleLearnComplete(
                            topic.id
                          )
                        }
                        onVisualizeComplete={() =>
                          handleVisualizeComplete(
                            topic.id
                          )
                        }
                        onCodeComplete={() =>
                          handleCodeComplete(
                            topic.id
                          )
                        }
                        onPracticeProblemComplete={(
                          problemId
                        ) =>
                          handlePracticeProblemComplete(
                            topic.id,
                            problemId
                          )
                        }
                        onPracticeComplete={() =>
                          handlePracticeComplete(
                            topic.id
                          )
                        }
                      />
                    )}
                  {topic.activities.some(
  (activity) =>
    activity.type === "revision"
) && (
  <section className="roadmap-review-stage">
    <div className="roadmap-review-stage-header">
      <div>
        <span className="day-learning-subheading">
          REVIEW
        </span>

        <h3>
          Review what you learned
        </h3>

        <p>
          Revisit the important concepts,
          mistakes and key ideas from this
          topic before completing the day.
        </p>
      </div>

      <span className="roadmap-review-badge">
        Revision
      </span>
    </div>

    <div className="roadmap-review-items">
      {topic.activities
        .filter(
          (activity) =>
            activity.type ===
            "revision"
        )
        .map(
          (activity) => (
            <div
              key={activity.id}
              className="roadmap-review-item"
            >
              <div>
                <strong>
                  {activity.title}
                </strong>

                <span>
                  {activity.completed
                    ? "Review completed"
                    : "Review required"}
                </span>
              </div>

              <span
                className={
                  activity.completed
                    ? "roadmap-review-item-status roadmap-review-item-status-completed"
                    : "roadmap-review-item-status"
                }
              >
                {activity.completed
                  ? "✓ Done"
                  : "Pending"}
              </span>
            </div>
          )
        )}
    </div>

    <div className="lesson-stage-completion">
      <button
        type="button"
        className="day-complete-button"
        disabled={topic.activities
          .filter(
            (activity) =>
              activity.type ===
              "revision"
          )
          .every(
            (activity) =>
              activity.completed
          )}
        onClick={() =>
          handleReviewComplete(
            topic.id
          )
        }
      >
        {topic.activities
          .filter(
            (activity) =>
              activity.type ===
              "revision"
          )
          .every(
            (activity) =>
              activity.completed
          )
          ? "Review Completed ✓"
          : "Complete Review"}
      </button>
    </div>
  </section>
)}

                  {/* ============================= */}
                  {/* ACTIVITY STATUS */}
                  {/* ============================= */}

                  {topic.activities
                    .length >
                    0 && (
                    <div className="day-learning-activities">
                      <span className="day-learning-subheading">
                        ACTIVITIES
                      </span>

                      {topic.activities.map(
                        (
                          activity
                        ) => (
                          <div
                            key={
                              activity.id
                            }
                            className="day-learning-activity"
                          >
                            <div>
                              <strong>
                                {
                                  activity.title
                                }
                              </strong>

                              <span>
                                {
                                  activity.type
                                }
                              </span>
                            </div>

                            <strong>
                              {activity.completed
                                ? "Done"
                                : "Pending"}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </article>
              );
            }
          )}
        </div>
      </section>

      {/* ============================= */}
      {/* ASSIGNMENT */}
      {/* ============================= */}

      {liveDay.assignment && (
        <RoadmapAssignment
        
          assignment={
            liveDay.assignment
          }
          onTaskChange={(
  taskIndex,
  completed
) =>
  handleAssignmentTaskChange(
    liveDay.assignment!.id,
    taskIndex,
    completed
  )
}
          onComplete={(
            score
          ) =>
            handleAssignmentComplete(
              liveDay
                .assignment!
                .id,
              score
            )
          }
        />
      )}

      {/* ============================= */}
      {/* QUIZ */}
      {/* ============================= */}

      {liveDay.quiz && (() => {
  /*
   * Find every weak-topic record connected
   * to this checkpoint.
   */
  const checkpointTopicIds =
    liveDay.quiz.topicIds;

  const checkpointWeakTopics =
    roadmap.weakTopics.filter(
      (weakTopic) =>
        checkpointTopicIds.includes(
          weakTopic.skillId
        )
    );

  /*
   * Retry becomes available only after the
   * learner explicitly starts recovery.
   *
   * Recovered topics do not need another
   * recovery retry.
   */
  const allowRecoveryRetry =
    checkpointWeakTopics.some(
      (weakTopic) =>
        weakTopic.recoveryStarted &&
        weakTopic.status !==
          "recovered"
    );

  return (
    <RoadmapQuiz
      quiz={liveDay.quiz}
      allowRetry={
        allowRecoveryRetry
      }
      onComplete={(
        score
      ) =>
        handleQuizComplete(
          liveDay.quiz!.id,
          score
        )
      }
    />
  );
})()}
      {/* ============================= */}
{/* WEAK TOPIC RECOVERY */}
{/* ============================= */}

{(() => {
  const dayTopicIds =
    new Set(
      liveDay.topics.map(
        (topic) => topic.id
      )
    );

  const dayWeakTopics =
    roadmap.weakTopics.filter(
      (weakTopic) =>
        dayTopicIds.has(
          weakTopic.skillId
        )
    );

  if (
    dayWeakTopics.length === 0
  ) {
    return null;
  }

  return (
    <section className="day-weak-topic-recovery-list">
      {dayWeakTopics.map(
        (weakTopic) => (
          <RoadmapWeakTopicRecovery
            key={
              weakTopic.id
            }
            topicId={
              weakTopic.skillId
            }
            topicTitle={
              weakTopic.topicTitle
            }
            score={
              weakTopic.latestScore
            }
            previousScore={
              weakTopic.attempts.length >
              1
                ? weakTopic.attempts[
                    weakTopic.attempts
                      .length - 2
                  ].score
                : undefined
            }
            recovered={
              weakTopic.status ===
              "recovered"
            }
            onStartRecovery={
              weakTopic.status !==
                "recovered" &&
              !weakTopic.recoveryStarted
                ? () =>
                    handleStartWeakTopicRecovery(
                      weakTopic.skillId
                    )
                : undefined
            }
          />
        )
      )}
    </section>
  );
})()}

      {/* ============================= */}
      {/* DAY COMPLETION */}
      {/* ============================= */}

      <footer className="day-workspace-footer">
        <div>
          <span className="roadmap-section-label">
            DAY{" "}
            {liveDay.dayNumber}
          </span>

          <h3>
            {dayProgress.completed
              ? "Day completed"
              : "Finish when you're ready"}
          </h3>

          <p>
            {dayProgress.completed
              ? liveDay.dayNumber <
                roadmap.totalDays
                ? `Great. Your work for Day ${liveDay.dayNumber} is complete. You can continue to Day ${
                    liveDay.dayNumber +
                    1
                  }.`
                : "You have completed the learning work for this roadmap day."
              : "Complete the learning activities, assignment and checkpoint. Other roadmap days remain available whenever you want to open them."}
          </p>
        </div>

        <button
          type="button"
          className="day-complete-button"
          disabled={
            !dayProgress.completed
          }
          onClick={() => {
            if (
              dayProgress.completed &&
              liveDay.dayNumber <
                roadmap.totalDays
            ) {
              onContinueToDay(
                liveDay.dayNumber +
                  1
              );
            }
          }}
        >
          {dayProgress.completed
            ? liveDay.dayNumber <
              roadmap.totalDays
              ? `Day ${liveDay.dayNumber} Completed - Continue to Day ${
                  liveDay.dayNumber +
                  1
                }`
              : `Day ${liveDay.dayNumber} Completed`
            : `${Math.round(
                dayProgress.percentage
              )}% Complete`}
        </button>
      </footer>
    </section>
  );
}

