import type {
  PersonalizedRoadmapData,
  RoadmapActivity,
  RoadmapDay,
  RoadmapProject,
  RoadmapTopic,
  RoadmapWeek,
} from "../../types/roadmap";


// =========================================================
// PROGRESS TYPES
// =========================================================

export interface RoadmapProgressSummary {
  totalDays: number;

  completedDays: number;

  totalTopics: number;

  completedTopics: number;

  totalActivities: number;

  completedActivities: number;

  totalAssignments: number;

  completedAssignments: number;

  totalQuizzes: number;

  completedQuizzes: number;

  totalProjects: number;

  completedProjects: number;

  overallProgress: number;
}


export interface DayProgress {
  dayNumber: number;

  completedActivities: number;

  totalActivities: number;

  assignmentCompleted: boolean;

  quizCompleted: boolean;

  completed: boolean;

  percentage: number;
}


// =========================================================
// GENERAL HELPERS
// =========================================================

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}


function roundProgress(
  value: number
): number {
  return (
    Math.round(value * 100) /
    100
  );
}


// =========================================================
// ACTIVITY COMPLETION
// =========================================================

export function setActivityCompletion(
  roadmap: PersonalizedRoadmapData,
  activityId: string,
  completed: boolean
): PersonalizedRoadmapData {
  const weeks =
    roadmap.weeks.map(
      (week) => ({
        ...week,

        days:
          week.days.map(
            (day) => ({
              ...day,

              topics:
                day.topics.map(
                  (topic) => ({
                    ...topic,

                    activities:
                      topic.activities.map(
                        (activity) =>
                          activity.id ===
                          activityId
                            ? {
                                ...activity,
                                completed,
                              }
                            : activity
                      ),
                  })
                ),
            })
          ),
      })
    );

  return recalculateRoadmapProgress({
    ...roadmap,

    weeks,

    updatedAt:
      new Date().toISOString(),
  });
}
export function setPracticeProblemCompletion(
  roadmap: PersonalizedRoadmapData,
  activityId: string,
  problemId: string,
  completed: boolean
): PersonalizedRoadmapData {
  const updatedWeeks = roadmap.weeks.map((week) => ({
    ...week,

    days: week.days.map((day) => ({
      ...day,

      topics: day.topics.map((topic) => ({
        ...topic,

        activities: topic.activities.map((activity) => {
          if (activity.id !== activityId) {
            return activity;
          }

          const currentIds =
            activity.completedProblemIds ?? [];

          const updatedIds = completed
            ? Array.from(
                new Set([
                  ...currentIds,
                  problemId,
                ])
              )
            : currentIds.filter(
                (id) => id !== problemId
              );

          return {
            ...activity,
            completedProblemIds: updatedIds,
          };
        }),
      })),
    })),
  }));

  return recalculateRoadmapProgress({
    ...roadmap,
    weeks: updatedWeeks,
    updatedAt: new Date().toISOString(),
  });
}


export function completeActivity(
  roadmap: PersonalizedRoadmapData,
  activityId: string
): PersonalizedRoadmapData {
  return setActivityCompletion(
    roadmap,
    activityId,
    true
  );
}


export function uncompleteActivity(
  roadmap: PersonalizedRoadmapData,
  activityId: string
): PersonalizedRoadmapData {
  return setActivityCompletion(
    roadmap,
    activityId,
    false
  );
}


// =========================================================
// ASSIGNMENT COMPLETION
// =========================================================
export function setAssignmentTaskCompletion(
  roadmap: PersonalizedRoadmapData,
  assignmentId: string,
  taskIndex: number,
  completed: boolean
): PersonalizedRoadmapData {
  const weeks =
    roadmap.weeks.map(
      (week) => ({
        ...week,

        days:
          week.days.map(
            (day) => {
              if (
                day.assignment?.id !==
                assignmentId
              ) {
                return day;
              }

              const currentIndexes =
                day.assignment
                  .completedTaskIndexes ??
                [];

              const updatedIndexes =
                completed
                  ? Array.from(
                      new Set([
                        ...currentIndexes,
                        taskIndex,
                      ])
                    ).sort(
                      (a, b) =>
                        a - b
                    )
                  : currentIndexes.filter(
                      (index) =>
                        index !==
                        taskIndex
                    );

              return {
                ...day,

                assignment: {
                  ...day.assignment,

                  completedTaskIndexes:
                    updatedIndexes,
                },
              };
            }
          ),
      })
    );

  return recalculateRoadmapProgress({
    ...roadmap,

    weeks,

    updatedAt:
      new Date().toISOString(),
  });
}
export function completeAssignment(
  roadmap: PersonalizedRoadmapData,
  assignmentId: string,
  score?: number
): PersonalizedRoadmapData {
  const weeks =
    roadmap.weeks.map(
      (week) => ({
        ...week,

        days:
          week.days.map(
            (day) => {
              if (
                day.assignment?.id !==
                assignmentId
              ) {
                return day;
              }

              return {
                ...day,

                assignment: {
                  ...day.assignment,

                  completed: true,

                  score:
                    score === undefined
                      ? day.assignment.score
                      : clamp(
                          score,
                          0,
                          100
                        ),
                },
              };
            }
          ),
      })
    );

  return recalculateRoadmapProgress({
    ...roadmap,

    weeks,

    updatedAt:
      new Date().toISOString(),
  });
}


// =========================================================
// QUIZ COMPLETION
// =========================================================

export function completeQuiz(
  roadmap: PersonalizedRoadmapData,
  quizId: string,
  score: number
): PersonalizedRoadmapData {
  const weeks =
    roadmap.weeks.map(
      (week) => ({
        ...week,

        days:
          week.days.map(
            (day) => {
              if (
                day.quiz?.id !==
                quizId
              ) {
                return day;
              }

              return {
                ...day,

                quiz: {
                  ...day.quiz,

                  completed: true,

                  score: clamp(
                    score,
                    0,
                    100
                  ),
                },
              };
            }
          ),
      })
    );

  return recalculateRoadmapProgress({
    ...roadmap,

    weeks,

    updatedAt:
      new Date().toISOString(),
  });
}


// =========================================================
// PROJECT COMPLETION
// =========================================================

export function completeProject(
  roadmap: PersonalizedRoadmapData,
  projectId: string,
  score?: number
): PersonalizedRoadmapData {
  const projects =
    roadmap.projects.map(
      (project) =>
        project.id === projectId
          ? {
              ...project,

              completed: true,

              score:
                score === undefined
                  ? project.score
                  : clamp(
                      score,
                      0,
                      100
                    ),
            }
          : project
    );

  return recalculateRoadmapProgress({
    ...roadmap,

    projects,

    updatedAt:
      new Date().toISOString(),
  });
}


// =========================================================
// TOPIC COMPLETION
// =========================================================

export function isTopicCompleted(
  topic: RoadmapTopic
): boolean {
  if (
    topic.activities.length === 0
  ) {
    return false;
  }

  return topic.activities.every(
    (activity) =>
      activity.completed
  );
}


function updateTopicStatuses(
  weeks: RoadmapWeek[]
): RoadmapWeek[] {
  return weeks.map(
    (week) => ({
      ...week,

      days: week.days.map(
        (day) => ({
          ...day,

          topics:
            day.topics.map(
              (topic) => {
                const completed =
                  isTopicCompleted(
                    topic
                  );

                return {
                  ...topic,

                  status: completed
                    ? "completed"
                    : topic.status ===
                        "revision"
                      ? "revision"
                      : "available",
                };
              }
            ),
        })
      ),
    })
  );
}


// =========================================================
// DAY COMPLETION
// =========================================================

export function isDayCompleted(
  day: RoadmapDay
): boolean {
  const activities =
    day.topics.flatMap(
      (topic) =>
        topic.activities
    );

  const activitiesCompleted =
    activities.length === 0
      ? true
      : activities.every(
          (activity) =>
            activity.completed
        );

  const assignmentCompleted =
    !day.assignment ||
    day.assignment.completed;

  const quizCompleted =
    !day.quiz ||
    day.quiz.completed;

  return (
    activitiesCompleted &&
    assignmentCompleted &&
    quizCompleted
  );
}


function updateDayCompletion(
  weeks: RoadmapWeek[]
): RoadmapWeek[] {
  return weeks.map(
    (week) => {
      const days =
        week.days.map(
          (day) => ({
            ...day,

            completed:
              isDayCompleted(
                day
              ),
          })
        );

      return {
        ...week,

        days,

        completed:
          days.length > 0 &&
          days.every(
            (day) =>
              day.completed
          ),
      };
    }
  );
}


// =========================================================
// DAY PROGRESS
// =========================================================

export function getDayProgress(
  day: RoadmapDay
): DayProgress {
  const activities =
    day.topics.flatMap(
      (topic) =>
        topic.activities
    );

  const totalActivities =
    activities.length;

  const completedActivities =
    activities.filter(
      (activity) =>
        activity.completed
    ).length;

  let totalItems =
    totalActivities;

  let completedItems =
    completedActivities;

  if (day.assignment) {
    totalItems += 1;

    if (
      day.assignment.completed
    ) {
      completedItems += 1;
    }
  }

  if (day.quiz) {
    totalItems += 1;

    if (day.quiz.completed) {
      completedItems += 1;
    }
  }

  const percentage =
    totalItems === 0
      ? 0
      : roundProgress(
          (completedItems /
            totalItems) *
            100
        );

  return {
    dayNumber:
      day.dayNumber,

    completedActivities,

    totalActivities,

    assignmentCompleted:
      !day.assignment ||
      day.assignment.completed,

    quizCompleted:
      !day.quiz ||
      day.quiz.completed,

    completed:
      isDayCompleted(day),

    percentage,
  };
}


// =========================================================
// CURRENT DAY
// =========================================================

export function calculateCurrentDay(
  roadmap: PersonalizedRoadmapData
): number {
  const days =
    roadmap.weeks.flatMap(
      (week) => week.days
    );

  if (days.length === 0) {
    return 0;
  }

  const firstIncomplete =
    days.find(
      (day) =>
        !day.completed
    );

  if (firstIncomplete) {
    return firstIncomplete.dayNumber;
  }

  return roadmap.totalDays;
}


// =========================================================
// PROGRESS SUMMARY
// =========================================================

export function getRoadmapProgressSummary(
  roadmap: PersonalizedRoadmapData
): RoadmapProgressSummary {
  const days =
    roadmap.weeks.flatMap(
      (week) => week.days
    );

  const topics =
    days.flatMap(
      (day) => day.topics
    );

  const activities =
    topics.flatMap(
      (topic) =>
        topic.activities
    );

  const assignments =
    days
      .map(
        (day) =>
          day.assignment
      )
      .filter(
        (
          assignment
        ): assignment is NonNullable<
          typeof assignment
        > =>
          assignment !==
          undefined
      );

  const quizzes =
    days
      .map(
        (day) => day.quiz
      )
      .filter(
        (
          quiz
        ): quiz is NonNullable<
          typeof quiz
        > =>
          quiz !== undefined
      );

  const totalDays =
    days.length;

  const completedDays =
    days.filter(
      (day) =>
        day.completed
    ).length;

  const totalTopics =
    topics.length;

  const completedTopics =
    topics.filter(
      isTopicCompleted
    ).length;

  const totalActivities =
    activities.length;

  const completedActivities =
    activities.filter(
      (activity) =>
        activity.completed
    ).length;

  const totalAssignments =
    assignments.length;

  const completedAssignments =
    assignments.filter(
      (assignment) =>
        assignment.completed
    ).length;

  const totalQuizzes =
    quizzes.length;

  const completedQuizzes =
    quizzes.filter(
      (quiz) =>
        quiz.completed
    ).length;

  const totalProjects =
    roadmap.projects.length;

  const completedProjects =
    roadmap.projects.filter(
      (project) =>
        project.completed
    ).length;

  /*
   * Overall progress is based on real
   * learner work rather than day count.
   *
   * Every activity, assignment, quiz
   * and project counts as one progress
   * unit.
   */

  const totalProgressItems =
    totalActivities +
    totalAssignments +
    totalQuizzes +
    totalProjects;

  const completedProgressItems =
    completedActivities +
    completedAssignments +
    completedQuizzes +
    completedProjects;

  const overallProgress =
    totalProgressItems === 0
      ? 0
      : roundProgress(
          (completedProgressItems /
            totalProgressItems) *
            100
        );

  return {
    totalDays,

    completedDays,

    totalTopics,

    completedTopics,

    totalActivities,

    completedActivities,

    totalAssignments,

    completedAssignments,

    totalQuizzes,

    completedQuizzes,

    totalProjects,

    completedProjects,

    overallProgress,
  };
}


// =========================================================
// RECALCULATE COMPLETE ROADMAP
// =========================================================

export function recalculateRoadmapProgress(
  roadmap: PersonalizedRoadmapData
): PersonalizedRoadmapData {
  const withTopicStatuses =
    updateTopicStatuses(
      roadmap.weeks
    );

  const weeks =
    updateDayCompletion(
      withTopicStatuses
    );

  const temporaryRoadmap: PersonalizedRoadmapData =
    {
      ...roadmap,

      weeks,
    };

  const summary =
    getRoadmapProgressSummary(
      temporaryRoadmap
    );

  const currentDay =
    calculateCurrentDay(
      temporaryRoadmap
    );

  return {
    ...temporaryRoadmap,

    overallProgress:
      summary.overallProgress,

    currentDay,

    updatedAt:
      new Date().toISOString(),
  };
}


// =========================================================
// MANUALLY COMPLETE ALL ACTIVITIES IN A DAY
// Useful for testing and future UI.
// =========================================================

export function completeDayActivities(
  roadmap: PersonalizedRoadmapData,
  dayNumber: number
): PersonalizedRoadmapData {
  const weeks =
    roadmap.weeks.map(
      (week) => ({
        ...week,

        days:
          week.days.map(
            (day) => {
              if (
                day.dayNumber !==
                dayNumber
              ) {
                return day;
              }

              return {
                ...day,

                topics:
                  day.topics.map(
                    (topic) => ({
                      ...topic,

                      activities:
                        topic.activities.map(
                          (activity) => ({
                            ...activity,

                            completed: true,
                          })
                        ),
                    })
                  ),
              };
            }
          ),
      })
    );

  return recalculateRoadmapProgress({
    ...roadmap,

    weeks,
  });
}


// =========================================================
// LOOKUPS
// =========================================================

export function getActivityById(
  roadmap: PersonalizedRoadmapData,
  activityId: string
): RoadmapActivity | undefined {
  for (
    const week
    of roadmap.weeks
  ) {
    for (
      const day
      of week.days
    ) {
      for (
        const topic
        of day.topics
      ) {
        const activity =
          topic.activities.find(
            (candidate) =>
              candidate.id ===
              activityId
          );

        if (activity) {
          return activity;
        }
      }
    }
  }

  return undefined;
}


export function getProjectByRoadmapId(
  roadmap: PersonalizedRoadmapData,
  projectId: string
): RoadmapProject | undefined {
  return roadmap.projects.find(
    (project) =>
      project.id ===
      projectId
  );
}


// =========================================================
// ROADMAP COMPLETION
// =========================================================

export function isRoadmapCompleted(
  roadmap: PersonalizedRoadmapData
): boolean {
  const summary =
    getRoadmapProgressSummary(
      roadmap
    );

  if (
    summary.totalDays === 0
  ) {
    return false;
  }

  return (
    summary.overallProgress >=
    100
  );
}