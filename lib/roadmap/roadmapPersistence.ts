import type {
  PersonalizedRoadmapData,
  RoadmapProfile,
} from "../../types/roadmap";


// =========================================================
// STORAGE KEYS
// =========================================================

const ROADMAP_STORAGE_KEY =
  "modelmind-personalized-roadmap";

const PROFILE_STORAGE_KEY =
  "modelmind-roadmap-profile";


// =========================================================
// STORAGE SCHEMA VERSION
//
// Increment this whenever the persisted roadmap structure
// changes in a way that makes older generated roadmaps
// incompatible with the current application.
//
// Version 3 represents:
// - personalized Python / Math / ML knowledge levels
// - learner priorities
// - current complete-topic-per-day scheduler
// - per-problem practice progress
// - persistent weak-topic recovery records
// =========================================================

const ROADMAP_STORAGE_VERSION = 3;


// =========================================================
// STORAGE ENVELOPES
// =========================================================

interface StoredRoadmapEnvelope {
  version: number;
  roadmap: PersonalizedRoadmapData;
}

interface StoredProfileEnvelope {
  version: number;
  profile: RoadmapProfile;
}


// =========================================================
// ENVIRONMENT CHECK
// =========================================================

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !==
      "undefined"
  );
}


// =========================================================
// SAFE JSON PARSING
// =========================================================

function safeParse<T>(
  value: string | null
): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}


// =========================================================
// BASIC HELPERS
// =========================================================

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}


function isStringArray(
  value: unknown
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string"
    )
  );
}


// =========================================================
// PROFILE VALUE VALIDATION
// =========================================================

const VALID_GOALS = new Set([
  "college",
  "ml-engineer",
  "data-scientist",
  "data-analyst",
  "ai-engineer",
  "deep-learning",
  "placement",
  "hackathon",
  "project",
  "custom",
]);


const VALID_LEVELS = new Set([
  "beginner",
  "intermediate",
  "advanced",
]);


const VALID_KNOWLEDGE_LEVELS =
  new Set([
    "none",
    "basic",
    "intermediate",
    "advanced",
  ]);


const VALID_PRIORITIES = new Set([
  "python",
  "data-analysis",
  "mathematics",
  "ml-models",
  "preprocessing",
  "visualization",
  "evaluation",
  "projects",
  "advanced-ml",
]);


// =========================================================
// PROFILE VALIDATION
// =========================================================

function isValidProfile(
  value: unknown
): value is RoadmapProfile {
  if (!isObject(value)) {
    return false;
  }

  const profile =
    value as Partial<RoadmapProfile>;

  if (
    typeof profile.goal !==
      "string" ||
    !VALID_GOALS.has(
      profile.goal
    )
  ) {
    return false;
  }

  if (
    typeof profile.level !==
      "string" ||
    !VALID_LEVELS.has(
      profile.level
    )
  ) {
    return false;
  }

  if (
    typeof profile.pythonLevel !==
      "string" ||
    !VALID_KNOWLEDGE_LEVELS.has(
      profile.pythonLevel
    )
  ) {
    return false;
  }

  if (
    typeof profile.mathLevel !==
      "string" ||
    !VALID_KNOWLEDGE_LEVELS.has(
      profile.mathLevel
    )
  ) {
    return false;
  }

  if (
    typeof profile.mlLevel !==
      "string" ||
    !VALID_KNOWLEDGE_LEVELS.has(
      profile.mlLevel
    )
  ) {
    return false;
  }

  if (
    !isStringArray(
      profile.priorities
    ) ||
    profile.priorities.some(
      (priority) =>
        !VALID_PRIORITIES.has(
          priority
        )
    )
  ) {
    return false;
  }

  if (
    typeof profile.minutesPerDay !==
      "number" ||
    !Number.isFinite(
      profile.minutesPerDay
    ) ||
    profile.minutesPerDay <= 0
  ) {
    return false;
  }

  if (
    typeof profile.durationWeeks !==
      "number" ||
    !Number.isFinite(
      profile.durationWeeks
    ) ||
    profile.durationWeeks <= 0
  ) {
    return false;
  }

  if (
    profile.customGoal !==
      undefined &&
    typeof profile.customGoal !==
      "string"
  ) {
    return false;
  }

  return true;
}


// =========================================================
// ACTIVITY VALIDATION
//
// This specifically protects the structure involved in
// activity completion and Practice persistence.
// =========================================================

function hasValidActivities(
  roadmap: PersonalizedRoadmapData
): boolean {
  for (const week of roadmap.weeks) {
    if (
      !week ||
      !Array.isArray(week.days)
    ) {
      return false;
    }

    for (const day of week.days) {
      if (
        !day ||
        !Array.isArray(day.topics)
      ) {
        return false;
      }

      for (
        const topic of day.topics
      ) {
        if (
          !topic ||
          !Array.isArray(
            topic.activities
          )
        ) {
          return false;
        }

        for (
          const activity of
            topic.activities
        ) {
          if (
            !activity ||
            typeof activity.id !==
              "string" ||
            typeof activity.title !==
              "string" ||
            typeof activity.type !==
              "string" ||
            typeof activity.completed !==
              "boolean"
          ) {
            return false;
          }

          if (
            activity.completedProblemIds !==
              undefined &&
            !isStringArray(
              activity.completedProblemIds
            )
          ) {
            return false;
          }
        }
      }
    }
  }

  return true;
}
// =========================================================
// WEAK TOPIC VALIDATION
// =========================================================

const VALID_WEAK_TOPIC_STATUSES =
  new Set([
    "needs-practice",
    "relearn",
    "recovered",
  ]);


const VALID_WEAK_AREAS =
  new Set([
    "concept",
    "coding",
    "assignment",
    "quiz",
    "debugging",
  ]);


function hasValidWeakTopics(
  value: unknown
): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  for (const weakTopic of value) {
    if (!isObject(weakTopic)) {
      return false;
    }

    if (
      typeof weakTopic.id !== "string" ||
      typeof weakTopic.skillId !== "string" ||
      typeof weakTopic.topicTitle !== "string" ||
      typeof weakTopic.dayId !== "string" ||
      typeof weakTopic.dayNumber !== "number" ||
      !Number.isFinite(weakTopic.dayNumber) ||
      typeof weakTopic.initialScore !== "number" ||
      !Number.isFinite(weakTopic.initialScore) ||
      typeof weakTopic.latestScore !== "number" ||
      !Number.isFinite(weakTopic.latestScore) ||
      typeof weakTopic.bestScore !== "number" ||
      !Number.isFinite(weakTopic.bestScore) ||
      typeof weakTopic.status !== "string" ||
      !VALID_WEAK_TOPIC_STATUSES.has(
        weakTopic.status
      ) ||
      !Array.isArray(weakTopic.weakAreas) ||
      weakTopic.weakAreas.some(
        (area) =>
          typeof area !== "string" ||
          !VALID_WEAK_AREAS.has(area)
      ) ||
      !Array.isArray(weakTopic.attempts) ||
      typeof weakTopic.recoveryStarted !==
        "boolean" ||
      typeof weakTopic.createdAt !== "string" ||
      typeof weakTopic.updatedAt !== "string"
    ) {
      return false;
    }

    for (const attempt of weakTopic.attempts) {
      if (
        !isObject(attempt) ||
        typeof attempt.score !== "number" ||
        !Number.isFinite(attempt.score) ||
        typeof attempt.attemptedAt !== "string"
      ) {
        return false;
      }
    }

    if (
      weakTopic.recoveryStartedAt !== undefined &&
      typeof weakTopic.recoveryStartedAt !==
        "string"
    ) {
      return false;
    }

    if (
      weakTopic.recoveredAt !== undefined &&
      typeof weakTopic.recoveredAt !== "string"
    ) {
      return false;
    }
  }

  return true;
}


// =========================================================
// ROADMAP VALIDATION
// =========================================================

function isValidRoadmap(
  value: unknown
): value is PersonalizedRoadmapData {
  if (!isObject(value)) {
    return false;
  }

  const roadmap =
    value as Partial<PersonalizedRoadmapData>;

  if (
    typeof roadmap.id !==
      "string" ||
    typeof roadmap.name !==
      "string"
  ) {
    return false;
  }

  if (
    !isValidProfile(
      roadmap.profile
    )
  ) {
    return false;
  }

  if (
  !Array.isArray(
    roadmap.weeks
  ) ||
  !Array.isArray(
    roadmap.projects
  ) ||
  !Array.isArray(
    roadmap.assessments
  ) ||
  !hasValidWeakTopics(
    roadmap.weakTopics
  )
) {
  return false;
}

  if (
    typeof roadmap.overallProgress !==
      "number" ||
    !Number.isFinite(
      roadmap.overallProgress
    )
  ) {
    return false;
  }

  if (
    typeof roadmap.currentDay !==
      "number" ||
    !Number.isFinite(
      roadmap.currentDay
    )
  ) {
    return false;
  }

  if (
    typeof roadmap.totalDays !==
      "number" ||
    !Number.isFinite(
      roadmap.totalDays
    )
  ) {
    return false;
  }

  return hasValidActivities(
    roadmap as PersonalizedRoadmapData
  );
}


// =========================================================
// ENVELOPE VALIDATION
// =========================================================
function migrateRoadmapEnvelope(
  value: unknown
): StoredRoadmapEnvelope | null {
  if (!isObject(value)) {
    return null;
  }

  /*
   * Already current.
   */
  if (
    value.version ===
    ROADMAP_STORAGE_VERSION
  ) {
    if (
      isValidRoadmap(
        value.roadmap
      )
    ) {
      return value as unknown as StoredRoadmapEnvelope;
    }

    return null;
  }

  /*
   * Version 2 → Version 3
   *
   * Preserve ALL existing learner progress.
   * The only new field is weakTopics.
   */
  if (
    value.version === 2 &&
    isObject(value.roadmap)
  ) {
    const migratedRoadmap = {
      ...value.roadmap,

      weakTopics: [],
    };

    if (
      !isValidRoadmap(
        migratedRoadmap
      )
    ) {
      return null;
    }

    return {
      version:
        ROADMAP_STORAGE_VERSION,

      roadmap:
        migratedRoadmap,
    };
  }

  return null;
}
function isValidRoadmapEnvelope(
  value: unknown
): value is StoredRoadmapEnvelope {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.version ===
      ROADMAP_STORAGE_VERSION &&
    isValidRoadmap(
      value.roadmap
    )
  );
}


function isValidProfileEnvelope(
  value: unknown
): value is StoredProfileEnvelope {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.version ===
      ROADMAP_STORAGE_VERSION &&
    isValidProfile(
      value.profile
    )
  );
}


// =========================================================
// SAVE ROADMAP
// =========================================================

export function saveRoadmap(
  roadmap: PersonalizedRoadmapData
): boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    const updatedRoadmap:
      PersonalizedRoadmapData = {
      ...roadmap,

      updatedAt:
        new Date().toISOString(),
    };


    const stored:
      StoredRoadmapEnvelope = {
      version:
        ROADMAP_STORAGE_VERSION,

      roadmap:
        updatedRoadmap,
    };


    window.localStorage.setItem(
      ROADMAP_STORAGE_KEY,
      JSON.stringify(stored)
    );

    return true;
  } catch {
    return false;
  }
}


// =========================================================
// LOAD ROADMAP
//
// Old/unversioned or incompatible roadmaps are removed.
// The profile is NOT removed here, because it may still
// be independently valid.
// =========================================================

export function loadRoadmap():
  PersonalizedRoadmapData | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        ROADMAP_STORAGE_KEY
      );


    if (!raw) {
      return null;
    }


    const parsed =
      safeParse<unknown>(raw);


    const migrated =
  migrateRoadmapEnvelope(
    parsed
  );

if (!migrated) {
  window.localStorage.removeItem(
    ROADMAP_STORAGE_KEY
  );

  return null;
}

/*
 * If an older valid roadmap was migrated,
 * immediately save the new v3 envelope.
 */
if (
  isObject(parsed) &&
  parsed.version !==
    ROADMAP_STORAGE_VERSION
) {
  window.localStorage.setItem(
    ROADMAP_STORAGE_KEY,
    JSON.stringify(
      migrated
    )
  );
}

return migrated.roadmap;
  } catch {
    return null;
  }
}


// =========================================================
// DELETE ROADMAP
// =========================================================

export function deleteRoadmap(): boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(
      ROADMAP_STORAGE_KEY
    );

    return true;
  } catch {
    return false;
  }
}


// =========================================================
// ROADMAP EXISTS
//
// Only a valid current-version roadmap counts as saved.
// =========================================================

export function hasSavedRoadmap(): boolean {
  return loadRoadmap() !== null;
}


// =========================================================
// SAVE PROFILE
// =========================================================

export function saveRoadmapProfile(
  profile: RoadmapProfile
): boolean {
  if (!canUseStorage()) {
    return false;
  }


  if (!isValidProfile(profile)) {
    return false;
  }


  try {
    const stored:
      StoredProfileEnvelope = {
      version:
        ROADMAP_STORAGE_VERSION,

      profile,
    };


    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(stored)
    );

    return true;
  } catch {
    return false;
  }
}


// =========================================================
// LOAD PROFILE
//
// Old profiles are intentionally rejected because the
// current onboarding requires Python, Math, ML and
// priority information.
// =========================================================

export function loadRoadmapProfile():
  RoadmapProfile | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        PROFILE_STORAGE_KEY
      );


    if (!raw) {
      return null;
    }


    const parsed =
      safeParse<unknown>(raw);


    if (
      !isValidProfileEnvelope(
        parsed
      )
    ) {
      window.localStorage.removeItem(
        PROFILE_STORAGE_KEY
      );

      return null;
    }


    return parsed.profile;
  } catch {
    return null;
  }
}


// =========================================================
// DELETE PROFILE
// =========================================================

export function deleteRoadmapProfile():
  boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(
      PROFILE_STORAGE_KEY
    );

    return true;
  } catch {
    return false;
  }
}


// =========================================================
// CLEAR ALL ROADMAP DATA
// =========================================================

export function clearRoadmapStorage():
  boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(
      ROADMAP_STORAGE_KEY
    );

    window.localStorage.removeItem(
      PROFILE_STORAGE_KEY
    );

    return true;
  } catch {
    return false;
  }
}


// =========================================================
// EXPORT ROADMAP
//
// Export remains the roadmap itself rather than the
// browser-storage envelope.
// =========================================================

export function exportRoadmap(
  roadmap: PersonalizedRoadmapData
): string {
  return JSON.stringify(
    roadmap,
    null,
    2
  );
}


// =========================================================
// IMPORT ROADMAP
//
// Imports are validated against the CURRENT roadmap
// structure before they can be saved.
// =========================================================

export function importRoadmap(
  json: string
): PersonalizedRoadmapData | null {
  const parsed =
    safeParse<unknown>(json);

  if (!isValidRoadmap(parsed)) {
    return null;
  }

  return parsed;
}


// =========================================================
// SAVE IMPORTED ROADMAP
// =========================================================

export function importAndSaveRoadmap(
  json: string
): PersonalizedRoadmapData | null {
  const roadmap =
    importRoadmap(json);

  if (!roadmap) {
    return null;
  }

  const saved =
    saveRoadmap(roadmap);

  return saved
    ? roadmap
    : null;
}


// =========================================================
// STORAGE INFORMATION
// =========================================================

export function getRoadmapStorageInfo(): {
  hasRoadmap: boolean;
  hasProfile: boolean;
} {
  if (!canUseStorage()) {
    return {
      hasRoadmap: false,
      hasProfile: false,
    };
  }

  return {
    hasRoadmap:
      loadRoadmap() !== null,

    hasProfile:
      loadRoadmapProfile() !==
      null,
  };
}