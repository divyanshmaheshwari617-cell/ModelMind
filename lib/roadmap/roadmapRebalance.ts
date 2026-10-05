import type {
  PersonalizedRoadmapData,
  RoadmapActivity,
  RoadmapDay,
  RoadmapTopic,
  RoadmapWeek,
  SkillAssessment,
} from "../../types/roadmap";

import {
  GOOD_MASTERY_SCORE,
} from "./roadmapMastery";

import {
  recalculateRoadmapProgress,
} from "./roadmapProgress";


// =========================================================
// TYPES
// =========================================================

export interface RebalanceOptions {
  missedDayNumbers?: number[];

  weakSkillIds?: string[];

  assessments?: SkillAssessment[];

  minutesPerDay?: number;

  addRevisionForWeakSkills?: boolean;
}


export interface RebalanceResult {
  roadmap: PersonalizedRoadmapData;

  movedActivities: number;

  insertedRevisionActivities: number;

  addedDays: number;

  weakSkillIds: string[];

  warnings: string[];
}


interface PendingActivity {
  topic: RoadmapTopic;

  activity: RoadmapActivity;
}


// =========================================================
// HELPERS
// =========================================================

function createId(
  prefix: string,
  ...parts: Array<string | number>
): string {
  const normalized =
    parts
      .map((part) =>
        String(part)
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          )
      )
      .filter(Boolean)
      .join("-");

  return normalized
    ? `${prefix}-${normalized}`
    : prefix;
}


function uniqueStrings(
  values: string[]
): string[] {
  return [
    ...new Set(values),
  ];
}


function cloneActivity(
  activity: RoadmapActivity
): RoadmapActivity {
  return {
    ...activity,
  };
}


function cloneTopic(
  topic: RoadmapTopic
): RoadmapTopic {
  return {
    ...topic,

    prerequisites: [
      ...topic.prerequisites,
    ],

    activities:
      topic.activities.map(
        cloneActivity
      ),
  };
}


function cloneDay(
  day: RoadmapDay
): RoadmapDay {
  return {
    ...day,

    topics:
      day.topics.map(
        cloneTopic
      ),

    assignment:
      day.assignment
        ? {
            ...day.assignment,

            topicIds: [
              ...day.assignment
                .topicIds,
            ],

            instructions: [
              ...day.assignment
                .instructions,
            ],

            hints: [
              ...day.assignment
                .hints,
            ],
          }
        : undefined,

    quiz:
      day.quiz
        ? {
            ...day.quiz,

            topicIds: [
              ...day.quiz.topicIds,
            ],

            questions:
              day.quiz.questions.map(
                (question) => ({
                  ...question,

                  options: [
                    ...question.options,
                  ],
                })
              ),
          }
        : undefined,
  };
}


function cloneWeek(
  week: RoadmapWeek
): RoadmapWeek {
  return {
    ...week,

    days:
      week.days.map(
        cloneDay
      ),
  };
}


// =========================================================
// WEAK SKILL DETECTION
// =========================================================

export function getWeakSkillsForRebalance(
  roadmap: PersonalizedRoadmapData,
  explicitWeakSkillIds: string[] = [],
  assessments: SkillAssessment[] = []
): string[] {
  const combinedAssessments = [
    ...roadmap.assessments,
    ...assessments,
  ];

  const weakFromAssessment =
    combinedAssessments
      .filter(
        (assessment) =>
          assessment.mastery
            .overallScore <
          GOOD_MASTERY_SCORE
      )
      .map(
        (assessment) =>
          assessment.skillId
      );

  return uniqueStrings([
    ...explicitWeakSkillIds,
    ...weakFromAssessment,
  ]);
}


// =========================================================
// MISSED DAY DETECTION
// =========================================================

export function getMissedDays(
  roadmap: PersonalizedRoadmapData,
  missedDayNumbers: number[]
): RoadmapDay[] {
  const missedSet =
    new Set(
      missedDayNumbers
    );

  return roadmap.weeks
    .flatMap(
      (week) => week.days
    )
    .filter(
      (day) =>
        missedSet.has(
          day.dayNumber
        ) &&
        !day.completed
    );
}


// =========================================================
// PENDING WORK
// =========================================================

function collectPendingActivities(
  days: RoadmapDay[]
): PendingActivity[] {
  const pending:
    PendingActivity[] = [];

  for (const day of days) {
    for (
      const topic
      of day.topics
    ) {
      for (
        const activity
        of topic.activities
      ) {
        if (
          !activity.completed
        ) {
          pending.push({
            topic,
            activity,
          });
        }
      }
    }
  }

  return pending;
}


// =========================================================
// REMOVE UNFINISHED ACTIVITIES FROM MISSED DAYS
// =========================================================

function clearPendingActivitiesFromDays(
  weeks: RoadmapWeek[],
  missedDayNumbers: Set<number>
): RoadmapWeek[] {
  return weeks.map(
    (week) => ({
      ...week,

      days:
        week.days.map(
          (day) => {
            if (
              !missedDayNumbers.has(
                day.dayNumber
              ) ||
              day.completed
            ) {
              return day;
            }

            return {
              ...day,

              topics:
                day.topics
                  .map(
                    (topic) => ({
                      ...topic,

                      activities:
                        topic.activities.filter(
                          (activity) =>
                            activity.completed
                        ),
                    })
                  )
                  .filter(
                    (topic) =>
                      topic.activities
                        .length > 0
                  ),
            };
          }
        ),
    })
  );
}


// =========================================================
// REVISION ACTIVITIES
// =========================================================

function createRevisionActivity(
  skillId: string,
  skillName: string
): RoadmapActivity {
  return {
    id: createId(
      "rebalance-revision",
      skillId,
      Date.now()
    ),

    title:
      `Targeted revision: ${skillName}`,

    type: "revision",

    estimatedMinutes: 20,

    completed: false,
  };
}


function findTopicForSkill(
  roadmap: PersonalizedRoadmapData,
  skillId: string
): RoadmapTopic | undefined {
  for (
    const week
    of roadmap.weeks
  ) {
    for (
      const day
      of week.days
    ) {
      const topic =
        day.topics.find(
          (candidate) =>
            candidate.id ===
            skillId
        );

      if (topic) {
        return topic;
      }
    }
  }

  return undefined;
}


function createRevisionPendingWork(
  roadmap: PersonalizedRoadmapData,
  weakSkillIds: string[]
): PendingActivity[] {
  const result:
    PendingActivity[] = [];

  for (
    const skillId
    of weakSkillIds
  ) {
    const sourceTopic =
      findTopicForSkill(
        roadmap,
        skillId
      );

    if (!sourceTopic) {
      continue;
    }

    const activity =
      createRevisionActivity(
        skillId,
        sourceTopic.title
      );

    result.push({
      topic: {
        ...cloneTopic(
          sourceTopic
        ),

        status: "revision",

        activities: [
          activity,
        ],

        estimatedMinutes:
          activity.estimatedMinutes,
      },

      activity,
    });
  }

  return result;
}


// =========================================================
// DAY CAPACITY
// =========================================================

function getDayUsedMinutes(
  day: RoadmapDay
): number {
  const activityMinutes =
    day.topics.reduce(
      (topicTotal, topic) =>
        topicTotal +
        topic.activities.reduce(
          (
            activityTotal,
            activity
          ) =>
            activityTotal +
            activity
              .estimatedMinutes,
          0
        ),
      0
    );

  const assignmentMinutes =
    day.assignment
      ? day.assignment
          .estimatedMinutes
      : 0;

  const quizMinutes =
    day.quiz
      ? Math.max(
          10,
          day.quiz.questions.length *
            3
        )
      : 0;

  return (
    activityMinutes +
    assignmentMinutes +
    quizMinutes
  );
}


// =========================================================
// ADD ACTIVITY TO DAY
// =========================================================

function addPendingActivityToDay(
  day: RoadmapDay,
  pending: PendingActivity
): RoadmapDay {
  const topics = [
    ...day.topics,
  ];

  const topicIndex =
    topics.findIndex(
      (topic) =>
        topic.id ===
        pending.topic.id
    );

  if (topicIndex >= 0) {
    const topic =
      topics[topicIndex];

    topics[topicIndex] = {
      ...topic,

      activities: [
        ...topic.activities,
        cloneActivity(
          pending.activity
        ),
      ],

      estimatedMinutes:
        topic.estimatedMinutes +
        pending.activity
          .estimatedMinutes,
    };
  } else {
    topics.push({
      ...cloneTopic(
        pending.topic
      ),

      activities: [
        cloneActivity(
          pending.activity
        ),
      ],

      estimatedMinutes:
        pending.activity
          .estimatedMinutes,
    });
  }

  return {
    ...day,

    topics,

    estimatedMinutes:
      getDayUsedMinutes({
        ...day,
        topics,
      }),

    completed: false,
  };
}


// =========================================================
// CREATE EXTRA DAY
// =========================================================

function createExtraDay(
  dayNumber: number,
  pending: PendingActivity
): RoadmapDay {
  const topic: RoadmapTopic = {
    ...cloneTopic(
      pending.topic
    ),

    activities: [
      cloneActivity(
        pending.activity
      ),
    ],

    estimatedMinutes:
      pending.activity
        .estimatedMinutes,

    status:
      pending.activity.type ===
      "revision"
        ? "revision"
        : "available",
  };

  return {
    id: createId(
      "day",
      dayNumber
    ),

    dayNumber,

    title:
      pending.activity.type ===
      "revision"
        ? `Revision: ${topic.title}`
        : topic.title,

    topics: [
      topic,
    ],

    estimatedMinutes:
      pending.activity
        .estimatedMinutes,

    completed: false,

    isRevisionDay:
      pending.activity.type ===
      "revision",
  };
}


// =========================================================
// FLATTEN / REBUILD DAYS
// =========================================================

function flattenDays(
  weeks: RoadmapWeek[]
): RoadmapDay[] {
  return weeks.flatMap(
    (week) =>
      week.days.map(
        cloneDay
      )
  );
}


function rebuildWeeks(
  days: RoadmapDay[]
): RoadmapWeek[] {
  const normalizedDays =
    days.map(
      (day, index) => ({
        ...day,

        id: createId(
          "day",
          index + 1
        ),

        dayNumber:
          index + 1,
      })
    );

  const weeks:
    RoadmapWeek[] = [];

  for (
    let index = 0;
    index <
    normalizedDays.length;
    index += 7
  ) {
    const weekNumber =
      Math.floor(
        index / 7
      ) + 1;

    const weekDays =
      normalizedDays.slice(
        index,
        index + 7
      );

    const topicNames =
      uniqueStrings(
        weekDays.flatMap(
          (day) =>
            day.topics.map(
              (topic) =>
                topic.title
            )
        )
      );

    weeks.push({
      id: createId(
        "week",
        weekNumber
      ),

      weekNumber,

      title:
        topicNames.length > 0
          ? `Week ${weekNumber}: ${topicNames
              .slice(0, 2)
              .join(" & ")}`
          : `Week ${weekNumber}`,

      description:
        topicNames.length > 0
          ? `Continue with ${topicNames.join(
              ", "
            )}.`
          : "Continue your personalized learning plan.",

      days:
        weekDays,

      completed:
        weekDays.length > 0 &&
        weekDays.every(
          (day) =>
            day.completed
        ),
    });
  }

  return weeks;
}


// =========================================================
// DISTRIBUTE PENDING WORK
// =========================================================

function distributePendingWork(
  days: RoadmapDay[],
  pendingWork: PendingActivity[],
  startDayNumber: number,
  minutesPerDay: number
): {
  days: RoadmapDay[];
  addedDays: number;
  movedActivities: number;
} {
  const result =
    days.map(
      cloneDay
    );

  let addedDays = 0;

  let movedActivities = 0;

  for (
    const pending
    of pendingWork
  ) {
    let placed = false;

    for (
      let index = 0;
      index <
      result.length;
      index += 1
    ) {
      const day =
        result[index];

      if (
        day.dayNumber <
        startDayNumber
      ) {
        continue;
      }

      if (day.completed) {
        continue;
      }

      const usedMinutes =
        getDayUsedMinutes(day);

      const remainingCapacity =
        minutesPerDay -
        usedMinutes;

      if (
        remainingCapacity >=
        pending.activity
          .estimatedMinutes
      ) {
        result[index] =
          addPendingActivityToDay(
            day,
            pending
          );

        placed = true;

        movedActivities += 1;

        break;
      }
    }

    if (!placed) {
      const nextDayNumber =
        result.length + 1;

      result.push(
        createExtraDay(
          nextDayNumber,
          pending
        )
      );

      addedDays += 1;

      movedActivities += 1;
    }
  }

  return {
    days: result,

    addedDays,

    movedActivities,
  };
}


// =========================================================
// MAIN REBALANCE
// =========================================================

export function rebalanceRoadmap(
  roadmap: PersonalizedRoadmapData,
  options: RebalanceOptions = {}
): RebalanceResult {
  const minutesPerDay =
    Math.max(
      1,
      options.minutesPerDay ??
        roadmap.profile
          .minutesPerDay
    );

  const missedDayNumbers =
    uniqueStrings(
      (
        options.missedDayNumbers ??
        []
      ).map(String)
    ).map(Number);

  const missedDays =
    getMissedDays(
      roadmap,
      missedDayNumbers
    );

  const pendingFromMissedDays =
    collectPendingActivities(
      missedDays
    );

  const weakSkillIds =
    getWeakSkillsForRebalance(
      roadmap,
      options.weakSkillIds,
      options.assessments
    );

  const revisionWork =
    options.addRevisionForWeakSkills ===
    false
      ? []
      : createRevisionPendingWork(
          roadmap,
          weakSkillIds
        );

  const clonedWeeks =
    roadmap.weeks.map(
      cloneWeek
    );

  const clearedWeeks =
    clearPendingActivitiesFromDays(
      clonedWeeks,
      new Set(
        missedDayNumbers
      )
    );

  const days =
    flattenDays(
      clearedWeeks
    );

  const firstAffectedDay =
    missedDayNumbers.length > 0
      ? Math.min(
          ...missedDayNumbers
        )
      : Math.max(
          1,
          roadmap.currentDay
        );

  const pendingWork = [
    ...pendingFromMissedDays,
    ...revisionWork,
  ];

  const distribution =
    distributePendingWork(
      days,
      pendingWork,
      firstAffectedDay,
      minutesPerDay
    );

  const rebuiltWeeks =
    rebuildWeeks(
      distribution.days
    );

  const totalDays =
    rebuiltWeeks.reduce(
      (total, week) =>
        total +
        week.days.length,
      0
    );

  let updatedRoadmap:
    PersonalizedRoadmapData = {
      ...roadmap,

      weeks:
        rebuiltWeeks,

      totalDays,

      updatedAt:
        new Date().toISOString(),
    };

  updatedRoadmap =
    recalculateRoadmapProgress(
      updatedRoadmap
    );

  const warnings: string[] = [];

  if (
    missedDayNumbers.length > 0 &&
    pendingFromMissedDays.length ===
      0
  ) {
    warnings.push(
      "No unfinished activities were found in the selected missed days."
    );
  }

  if (
    distribution.addedDays > 0
  ) {
    warnings.push(
      `${distribution.addedDays} additional learning day(s) were added so unfinished work would not be compressed into overloaded days.`
    );
  }

  if (
    weakSkillIds.length > 0 &&
    revisionWork.length > 0
  ) {
    warnings.push(
      `Targeted revision was added for ${weakSkillIds.length} weak skill(s).`
    );
  }

  return {
    roadmap:
      updatedRoadmap,

    movedActivities:
      distribution.movedActivities,

    insertedRevisionActivities:
      revisionWork.length,

    addedDays:
      distribution.addedDays,

    weakSkillIds,

    warnings,
  };
}


// =========================================================
// MISSED-DAY SHORTCUT
// =========================================================

export function rebalanceMissedDays(
  roadmap: PersonalizedRoadmapData,
  missedDayNumbers: number[]
): RebalanceResult {
  return rebalanceRoadmap(
    roadmap,
    {
      missedDayNumbers,
    }
  );
}


// =========================================================
// MASTERY-BASED REBALANCE
// =========================================================

export function rebalanceForWeakSkills(
  roadmap: PersonalizedRoadmapData,
  weakSkillIds: string[]
): RebalanceResult {
  return rebalanceRoadmap(
    roadmap,
    {
      weakSkillIds,

      addRevisionForWeakSkills:
        true,
    }
  );
}


// =========================================================
// DETECT OVERLOADED DAYS
// =========================================================

export function getOverloadedDays(
  roadmap: PersonalizedRoadmapData,
  minutesPerDay =
    roadmap.profile.minutesPerDay
): RoadmapDay[] {
  return roadmap.weeks
    .flatMap(
      (week) => week.days
    )
    .filter(
      (day) =>
        getDayUsedMinutes(day) >
        minutesPerDay
    );
}


// =========================================================
// REBALANCE STATUS
// =========================================================

export function needsRoadmapRebalance(
  roadmap: PersonalizedRoadmapData
): boolean {
  const overloaded =
    getOverloadedDays(
      roadmap
    );

  const weakSkills =
    getWeakSkillsForRebalance(
      roadmap
    );

  return (
    overloaded.length > 0 ||
    weakSkills.length > 0
  );
}