import type {
  PersonalizedRoadmapData,
  WeakTopicRecord,
  WeakTopicRecoveryStatus,
} from "../../types/roadmap";


// =========================================================
// CONSTANTS
// =========================================================

export const WEAK_TOPIC_THRESHOLD = 70;

export const STRONG_TOPIC_THRESHOLD = 85;


// =========================================================
// SCORE HELPERS
// =========================================================

function clampScore(
  score: number
): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}


export function isWeakTopicScore(
  score: number
): boolean {
  return (
    clampScore(score) <
    WEAK_TOPIC_THRESHOLD
  );
}


export function getWeakTopicStatus(
  score: number
): WeakTopicRecoveryStatus {
  const normalizedScore =
    clampScore(score);

  if (
    normalizedScore >=
    WEAK_TOPIC_THRESHOLD
  ) {
    return "recovered";
  }

  if (normalizedScore >= 50) {
    return "needs-practice";
  }

  return "relearn";
}


// =========================================================
// FIND HELPERS
// =========================================================

export function findWeakTopic(
  roadmap: PersonalizedRoadmapData,
  skillId: string
): WeakTopicRecord | undefined {
  return roadmap.weakTopics.find(
    (topic) =>
      topic.skillId === skillId
  );
}


export function getActiveWeakTopics(
  roadmap: PersonalizedRoadmapData
): WeakTopicRecord[] {
  return roadmap.weakTopics.filter(
    (topic) =>
      topic.status !== "recovered"
  );
}


export function getRecoveredWeakTopics(
  roadmap: PersonalizedRoadmapData
): WeakTopicRecord[] {
  return roadmap.weakTopics.filter(
    (topic) =>
      topic.status === "recovered"
  );
}


// =========================================================
// RECORD CHECKPOINT RESULT
// =========================================================

export function recordWeakTopicCheckpoint(
  roadmap: PersonalizedRoadmapData,
  options: {
    skillId: string;
    topicTitle: string;
    dayId: string;
    dayNumber: number;
    score: number;
  }
): PersonalizedRoadmapData {
  const score =
    clampScore(options.score);

  const now =
    new Date().toISOString();

  const existingIndex =
    roadmap.weakTopics.findIndex(
      (topic) =>
        topic.skillId ===
        options.skillId
    );

  /*
   * No existing weak-topic record.
   *
   * Scores >= 70 should not create one.
   */
  if (existingIndex === -1) {
    if (
      score >=
      WEAK_TOPIC_THRESHOLD
    ) {
      return roadmap;
    }

    const weakTopic:
      WeakTopicRecord = {
        id: `weak-${options.skillId}`,

        skillId:
          options.skillId,

        topicTitle:
          options.topicTitle,

        dayId:
          options.dayId,

        dayNumber:
          options.dayNumber,

        initialScore:
          score,

        latestScore:
          score,

        bestScore:
          score,

        status:
          getWeakTopicStatus(
            score
          ),

        weakAreas: [
          "quiz",
        ],

        attempts: [
          {
            score,
            attemptedAt:
              now,
          },
        ],

        recoveryStarted:
          false,

        createdAt:
          now,

        updatedAt:
          now,
      };

    return {
      ...roadmap,

      weakTopics: [
        ...roadmap.weakTopics,
        weakTopic,
      ],

      updatedAt:
        now,
    };
  }

  /*
   * Existing record means this is another
   * checkpoint/recovery attempt.
   */
  const existing =
    roadmap.weakTopics[
      existingIndex
    ];

  const status =
    getWeakTopicStatus(score);

  const updated:
    WeakTopicRecord = {
      ...existing,

      topicTitle:
        options.topicTitle,

      dayId:
        options.dayId,

      dayNumber:
        options.dayNumber,

      latestScore:
        score,

      bestScore:
        Math.max(
          existing.bestScore,
          score
        ),

      status,

      attempts: [
        ...existing.attempts,
        {
          score,
          attemptedAt:
            now,
        },
      ],

      recoveredAt:
        status === "recovered"
          ? now
          : undefined,

      updatedAt:
        now,
  };

  const weakTopics =
    [...roadmap.weakTopics];

  weakTopics[
    existingIndex
  ] = updated;

  return {
    ...roadmap,

    weakTopics,

    updatedAt:
      now,
  };
}


// =========================================================
// START RECOVERY
// =========================================================

export function startWeakTopicRecovery(
  roadmap: PersonalizedRoadmapData,
  skillId: string
): PersonalizedRoadmapData {
  const now =
    new Date().toISOString();

  const weakTopics =
    roadmap.weakTopics.map(
      (topic) => {
        if (
          topic.skillId !== skillId ||
          topic.status ===
            "recovered"
        ) {
          return topic;
        }

        return {
          ...topic,

          recoveryStarted:
            true,

          recoveryStartedAt:
            topic.recoveryStartedAt ??
            now,

          updatedAt:
            now,
        };
      }
    );

  return {
    ...roadmap,

    weakTopics,

    updatedAt:
      now,
  };
}


// =========================================================
// RECOVERY STATE
// =========================================================

export function hasActiveWeakTopic(
  roadmap: PersonalizedRoadmapData,
  skillId: string
): boolean {
  return roadmap.weakTopics.some(
    (topic) =>
      topic.skillId === skillId &&
      topic.status !==
        "recovered"
  );
}


export function hasRecoveredWeakTopic(
  roadmap: PersonalizedRoadmapData,
  skillId: string
): boolean {
  return roadmap.weakTopics.some(
    (topic) =>
      topic.skillId === skillId &&
      topic.status ===
        "recovered"
  );
}