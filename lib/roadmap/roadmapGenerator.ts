import type {
  LearningLevel,
  ActivityType,
  PersonalizedRoadmapData,
  RoadmapActivity,
  RoadmapAssignment,
  RoadmapDay,
  RoadmapProfile,
  RoadmapProject,
  RoadmapQuiz,
  RoadmapQuizQuestion,
  RoadmapStatus,
  RoadmapTopic,
  RoadmapWeek,
  SkillAssessment,
  TopicDifficulty,
} from "../../types/roadmap";

import {
  getRoadmapTemplate,
  type RoadmapTemplate,
} from "../../data/roadmap/roadmapTemplates";

import {
  getSkillById,
  type CurriculumSkill,
} from "../../data/roadmap/skills";

import {
  getAssignmentsForSkill,
  type CurriculumAssignment,
} from "../../data/roadmap/assignments";

import {
  getQuestionsForSkill,
  type AssessmentQuestion,
} from "../../data/roadmap/quizzes";

import {
  getProjectById,
  type CurriculumProject,
} from "../../data/roadmap/projects";


// =========================================================
// GENERATOR TYPES
// =========================================================

export interface RoadmapGenerationOptions {
  profile: RoadmapProfile;

  assessments?: SkillAssessment[];

  strongSkillIds?: string[];

  weakSkillIds?: string[];

  completedSkillIds?: string[];

  startDate?: string;
}


export interface RoadmapWorkloadAnalysis {
  requestedMinutes: number;

  estimatedCurriculumMinutes: number;

  differenceMinutes: number;

  realistic: boolean;

  recommendedMinutesPerDay: number;

  recommendedWeeks: number;
}


export interface RoadmapGenerationResult {
  roadmap: PersonalizedRoadmapData;

  workload: RoadmapWorkloadAnalysis;

  includedSkillIds: string[];

  skippedSkillIds: string[];

  revisionSkillIds: string[];

  extensionSkillIds: string[];

  extensionProjectIds: string[];

  warnings: string[];
}


// =========================================================
// CONSTANTS
// =========================================================

const DAYS_PER_WEEK = 7;

const STRONG_MASTERY_THRESHOLD = 85;

const GOOD_MASTERY_THRESHOLD = 70;

const REVISION_ACTIVITY_MINUTES = 20;

const WEEKLY_REVIEW_MINUTES = 30;


// =========================================================
// GENERAL HELPERS
// =========================================================

function createId(
  prefix: string,
  ...parts: Array<string | number>
): string {
  const normalized = parts
    .map((part) =>
      String(part)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .filter(Boolean)
    .join("-");

  return normalized
    ? `${prefix}-${normalized}`
    : prefix;
}


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


function uniqueStrings(
  values: string[]
): string[] {
  return [...new Set(values)];
}


function getAssessmentMap(
  assessments: SkillAssessment[]
): Map<string, SkillAssessment> {
  return new Map(
    assessments.map((assessment) => [
      assessment.skillId,
      assessment,
    ])
  );
}


// =========================================================
// SKILL SELECTION
// =========================================================

type ProfilePriority =
  RoadmapProfile["priorities"][number];


// ---------------------------------------------------------
// PRIORITY -> CURRICULUM SKILLS
//
// These are not separate lessons.
// They reference the existing 57-skill curriculum.
//
// A priority can therefore expand a goal template using
// lessons that already exist in ModelMind.
// ---------------------------------------------------------

const PRIORITY_SKILL_PATHS: Record<
  ProfilePriority,
  string[]
> = {
  python: [
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",
    "python-error-handling",
    "python-oop",
    "python-advanced",
  ],

  "data-analysis": [
    "numpy-foundation",
    "pandas-foundation",
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",
    "advanced-data-cleaning",
    "advanced-eda",
  ],

  mathematics: [
    "statistics-foundation",
    "ml-foundations",
    "gradient-descent",
    "bias-variance",
  ],

  "ml-models": [
    "ml-foundations",
    "linear-regression",
    "logistic-regression",
    "knn",
    "naive-bayes",
    "decision-tree",
    "random-forest",
    "svm",
    "kmeans",
  ],

  preprocessing: [
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",
    "outlier-handling",
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "feature-engineering",
    "feature-selection",
  ],

  visualization: [
    "data-visualization",
    "eda-foundation",
    "advanced-eda",
  ],

  evaluation: [
    "train-test-evaluation",
    "data-leakage",
    "bias-variance",
    "cross-validation",
    "hyperparameter-tuning",
    "learning-curves",
    "advanced-classification-evaluation",
    "calibration-thresholding",
    "imbalanced-learning",
    "model-selection",
  ],

  projects: [
    "python-for-data",
    "pandas-foundation",
    "basic-data-cleaning",
    "eda-foundation",
    "data-leakage",
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "feature-engineering",
    "cross-validation",
    "model-selection",
    "experiment-tracking",
    "complete-ml-workflow",
  ],

  "advanced-ml": [
    "pca",
    "ensemble-learning",
    "bagging",
    "boosting-foundations",
    "gradient-boosting",
    "xgboost",
    "voting-stacking",
    "hyperparameter-tuning",
    "learning-curves",
    "advanced-classification-evaluation",
    "calibration-thresholding",
    "imbalanced-learning",
    "model-selection",
    "model-interpretability",
    "shap-explainability",
    "experiment-tracking",
    "complete-ml-workflow",
  ],
};


// ---------------------------------------------------------
// KNOWLEDGE-BASED EMPHASIS
//
// These paths do NOT mean:
// "the learner already knows this, so skip it".
//
// They mean:
// "make sure the generated curriculum contains the
// appropriate depth for this learner".
//
// Actual skipping remains controlled by:
// - diagnostic assessment
// - strongSkillIds
// - completedSkillIds
// ---------------------------------------------------------

function getPythonProfileSkills(
  profile: RoadmapProfile
): string[] {
  switch (profile.pythonLevel) {
    case "none":
      return [
        "python-basics",
        "python-data-structures",
        "python-functions",
      ];

    case "basic":
      return [
        "python-basics",
        "python-data-structures",
        "python-functions",
        "python-for-data",
        "python-error-handling",
      ];

    case "intermediate":
      return [
        "python-for-data",
        "python-error-handling",
        "python-oop",
        "numpy-foundation",
        "pandas-foundation",
      ];

    case "advanced":
      return [
        "python-oop",
        "python-advanced",
        "numpy-foundation",
        "pandas-foundation",
      ];

    default:
      return [];
  }
}


function getMathProfileSkills(
  profile: RoadmapProfile
): string[] {
  switch (profile.mathLevel) {
    case "none":
    case "basic":
      return [
        "statistics-foundation",
        "ml-foundations",
        "gradient-descent",
        "bias-variance",
      ];

    case "intermediate":
      return [
        "statistics-foundation",
        "gradient-descent",
        "bias-variance",
        "train-test-evaluation",
      ];

    case "advanced":
      return [
        "gradient-descent",
        "bias-variance",
        "learning-curves",
        "calibration-thresholding",
      ];

    default:
      return [];
  }
}


function getMLProfileSkills(
  profile: RoadmapProfile
): string[] {
  switch (profile.mlLevel) {
    case "none":
      return [
        "ml-foundations",
        "train-test-evaluation",
        "linear-regression",
        "logistic-regression",
        "decision-tree",
      ];

    case "basic":
      return [
        "ml-foundations",
        "train-test-evaluation",
        "linear-regression",
        "logistic-regression",
        "knn",
        "naive-bayes",
        "decision-tree",
        "random-forest",
        "kmeans",
      ];

    case "intermediate":
      return [
        "data-leakage",
        "bias-variance",
        "regularization",
        "svm",
        "pca",
        "cross-validation",
        "ensemble-learning",
        "gradient-boosting",
        "hyperparameter-tuning",
        "model-selection",
      ];

    case "advanced":
      return [
        "advanced-preprocessing",
        "pipeline-column-transformer",
        "feature-engineering",
        "feature-selection",
        "pca",
        "ensemble-learning",
        "bagging",
        "boosting-foundations",
        "gradient-boosting",
        "xgboost",
        "voting-stacking",
        "cross-validation",
        "hyperparameter-tuning",
        "learning-curves",
        "advanced-classification-evaluation",
        "calibration-thresholding",
        "imbalanced-learning",
        "model-selection",
        "model-interpretability",
        "shap-explainability",
        "experiment-tracking",
        "complete-ml-workflow",
      ];

    default:
      return [];
  }
}


// ---------------------------------------------------------
// LEVEL-BASED EXTENSION DEPTH
//
// Beginner:
// stay close to the goal template.
//
// Intermediate:
// include relevant template extensions.
//
// Advanced:
// include the full extension path supplied by the
// selected goal template.
// ---------------------------------------------------------

function getLevelExtensionSkillIds(
  template: RoadmapTemplate,
  profile: RoadmapProfile
): string[] {
  const extensionPath =
    template.extensionSkillPath ?? [];

  if (extensionPath.length === 0) {
    return [];
  }

  if (profile.level === "advanced") {
    return extensionPath;
  }

  if (profile.level === "intermediate") {
    return extensionPath.filter(
      (skillId) =>
        [
          "python-oop",
          "advanced-data-cleaning",
          "advanced-eda",
          "feature-engineering",
          "feature-selection",
          "pca",
          "ensemble-learning",
          "boosting-foundations",
          "gradient-boosting",
          "xgboost",
          "cross-validation",
          "hyperparameter-tuning",
          "learning-curves",
          "advanced-classification-evaluation",
          "imbalanced-learning",
          "model-selection",
          "model-interpretability",
          "complete-ml-workflow",
        ].includes(skillId)
    );
  }

  return [];
}


// ---------------------------------------------------------
// PRIORITY SKILLS
// ---------------------------------------------------------

function getPrioritySkillIds(
  profile: RoadmapProfile
): string[] {
  return profile.priorities.flatMap(
    (priority) =>
      PRIORITY_SKILL_PATHS[
        priority
      ] ?? []
  );
}


// ---------------------------------------------------------
// UNIQUE SKILL IDS
// ---------------------------------------------------------

function uniqueSkillIds(
  skillIds: string[]
): string[] {
  return Array.from(
    new Set(skillIds)
  );
}


// ---------------------------------------------------------
// BUILD PERSONALIZED SKILL PATH
//
// Ordering rule:
//
// 1. Goal template remains the backbone.
// 2. Knowledge-specific additions follow.
// 3. Level extensions follow.
// 4. Explicit learner priorities follow.
//
// This preserves the carefully designed template ordering
// while allowing personalization to expand it.
// ---------------------------------------------------------

function buildPersonalizedSkillPath(
  template: RoadmapTemplate,
  profile: RoadmapProfile
): string[] {
  const basePath =
    template.skillPath;

  const pythonSkills =
    getPythonProfileSkills(
      profile
    );

  const mathSkills =
    getMathProfileSkills(
      profile
    );

  const mlSkills =
    getMLProfileSkills(
      profile
    );

  const levelExtensions =
    getLevelExtensionSkillIds(
      template,
      profile
    );

  const prioritySkills =
    getPrioritySkillIds(
      profile
    );

  return uniqueSkillIds([
    ...basePath,

    ...pythonSkills,

    ...mathSkills,

    ...mlSkills,

    ...levelExtensions,

    ...prioritySkills,
  ]);
}


// ---------------------------------------------------------
// RESOLVE CORE TEMPLATE SKILLS
// ---------------------------------------------------------

function resolveTemplateSkills(
  template: RoadmapTemplate
): CurriculumSkill[] {
  return template.skillPath
    .map((skillId) =>
      getSkillById(skillId)
    )
    .filter(
      (
        skill
      ): skill is CurriculumSkill =>
        skill !== undefined
    );
}


// ---------------------------------------------------------
// RESOLVE PERSONALIZED SKILLS
// ---------------------------------------------------------

function resolvePersonalizedSkills(
  template: RoadmapTemplate,
  profile: RoadmapProfile
): CurriculumSkill[] {
  return buildPersonalizedSkillPath(
    template,
    profile
  )
    .map((skillId) =>
      getSkillById(skillId)
    )
    .filter(
      (
        skill
      ): skill is CurriculumSkill =>
        skill !== undefined
    );
}


// ---------------------------------------------------------
// TEMPLATE EXTENSION HELPERS
//
// Keep these because the rest of the generator uses them
// for extension reporting/recommendations.
// ---------------------------------------------------------

function resolveExtensionSkills(
  template: RoadmapTemplate
): CurriculumSkill[] {
  return (
    template.extensionSkillPath ?? []
  )
    .map((skillId) =>
      getSkillById(skillId)
    )
    .filter(
      (
        skill
      ): skill is CurriculumSkill =>
        skill !== undefined
    );
}


function getExtensionSkillIds(
  template: RoadmapTemplate
): string[] {
  return resolveExtensionSkills(
    template
  ).map(
    (skill) => skill.id
  );
}


// ---------------------------------------------------------
// SKIP LOGIC
//
// Evidence from the diagnostic/completion system is used
// for skipping.
//
// Self-reported profile level does NOT automatically skip
// a topic.
// ---------------------------------------------------------

function shouldSkipSkill(
  skillId: string,
  assessmentMap:
    Map<string, SkillAssessment>,
  strongSkillIds: Set<string>,
  completedSkillIds: Set<string>
): boolean {
  if (
    completedSkillIds.has(
      skillId
    )
  ) {
    return true;
  }

  if (
    strongSkillIds.has(
      skillId
    )
  ) {
    return true;
  }

  const assessment =
    assessmentMap.get(
      skillId
    );

  if (!assessment) {
    return false;
  }

  return (
    assessment.mastery
      .overallScore >=
    STRONG_MASTERY_THRESHOLD
  );
}


// ---------------------------------------------------------
// REVISION LOGIC
// ---------------------------------------------------------

function shouldReviseSkill(
  skillId: string,
  assessmentMap:
    Map<string, SkillAssessment>,
  weakSkillIds: Set<string>
): boolean {
  if (
    weakSkillIds.has(
      skillId
    )
  ) {
    return true;
  }

  const assessment =
    assessmentMap.get(
      skillId
    );

  if (!assessment) {
    return false;
  }

  return (
    assessment.mastery
      .overallScore <
    GOOD_MASTERY_THRESHOLD
  );
}


// ---------------------------------------------------------
// FINAL PERSONALIZED SELECTION
// ---------------------------------------------------------

function selectSkillsForRoadmap(
  template: RoadmapTemplate,
  profile: RoadmapProfile,
  assessments: SkillAssessment[],
  strongSkillIds: string[],
  weakSkillIds: string[],
  completedSkillIds: string[]
): {
  included: CurriculumSkill[];
  skipped: string[];
  revision: string[];
} {
  const skills =
    resolvePersonalizedSkills(
      template,
      profile
    );

  const assessmentMap =
    getAssessmentMap(
      assessments
    );

  const strongSet =
    new Set(
      strongSkillIds
    );

  const weakSet =
    new Set(
      weakSkillIds
    );

  const completedSet =
    new Set(
      completedSkillIds
    );

  const included:
    CurriculumSkill[] = [];

  const skipped:
    string[] = [];

  const revision:
    string[] = [];


  for (
    const skill of skills
  ) {
    if (
      shouldSkipSkill(
        skill.id,
        assessmentMap,
        strongSet,
        completedSet
      )
    ) {
      skipped.push(
        skill.id
      );

      continue;
    }


    included.push(
      skill
    );


    if (
      shouldReviseSkill(
        skill.id,
        assessmentMap,
        weakSet
      )
    ) {
      revision.push(
        skill.id
      );
    }
  }


  return {
    included,
    skipped,
    revision,
  };
}

// =========================================================
// ACTIVITY GENERATION
// =========================================================

function distributeMinutes(
  totalMinutes: number,
  weights: number[]
): number[] {
  if (weights.length === 0) {
    return [];
  }

  const safeTotal =
    Math.max(totalMinutes, weights.length);

  const weightTotal =
    weights.reduce(
      (total, weight) =>
        total + weight,
      0
    );

  const result = weights.map(
    (weight) =>
      Math.max(
        1,
        Math.floor(
          safeTotal *
            (weight / weightTotal)
        )
      )
  );

  let assigned =
    result.reduce(
      (total, minutes) =>
        total + minutes,
      0
    );

  let index = 0;

  while (assigned < safeTotal) {
    result[index % result.length] += 1;

    assigned += 1;

    index += 1;
  }

  return result;
}


function getActivityTypesForSkill(
  skill: CurriculumSkill
): ActivityType[] {
  return [
    "concept",
    "visualization",
    "coding",
    "practice",
  ];
}


function getActivityTitle(
  type: ActivityType,
  skillName: string
): string {
  switch (type) {
    case "concept":
      return `Learn ${skillName}`;

    case "visualization":
      return `Visualize ${skillName}`;

    case "coding":
      return `Code ${skillName}`;

    case "practice":
      return `Practice ${skillName}`;

    case "assignment":
      return `${skillName} Assignment`;

    case "quiz":
      return `${skillName} Quiz`;

    case "revision":
      return `Revise ${skillName}`;

    case "project":
      return `${skillName} Project`;

    default:
      return skillName;
  }
}
function getCoreDepthMultiplier(
  curriculumMode: RoadmapTemplate["curriculumMode"],
  level: LearningLevel
): number {
  if (curriculumMode === "academic") {
    if (level === "beginner") return 0.6;
    if (level === "intermediate") return 0.65;
    return 0.7;
  }

  if (curriculumMode === "practical") {
    if (level === "beginner") return 0.65;
    if (level === "intermediate") return 0.7;
    return 0.75;
  }

  // Industry
  if (level === "beginner") return 0.7;
  if (level === "intermediate") return 0.75;
  return 0.8;
}

function createSkillActivities(
  skill: CurriculumSkill,
  revision: boolean,
  curriculumMode: RoadmapTemplate["curriculumMode"],
  level: LearningLevel
): RoadmapActivity[] {
  const activityTypes =
    getActivityTypesForSkill(skill);

  const weights =
    activityTypes.map((type) => {
      switch (type) {
        case "concept":
          return 30;

        case "visualization":
          return 15;

        case "coding":
          return 35;

        case "practice":
          return 20;

        default:
          return 10;
      }
    });

  const depthMultiplier =
    getCoreDepthMultiplier(
      curriculumMode,
      level
    );

  const adjustedSkillMinutes =
    Math.max(
      activityTypes.length * 10,
      Math.round(
        skill.estimatedMinutes *
          depthMultiplier
      )
    );

  const minutes =
    distributeMinutes(
      adjustedSkillMinutes,
      weights
    );

  const activities =
    activityTypes.map(
      (type, index) => ({
        id: createId(
          "activity",
          skill.id,
          type
        ),

        title: getActivityTitle(
          type,
          skill.name
        ),

        type,

        estimatedMinutes:
          minutes[index],

        completed: false,
      })
    );

  if (revision) {
    activities.push({
      id: createId(
        "activity",
        skill.id,
        "revision"
      ),

      title:
        `Targeted revision: ${skill.name}`,

      type: "revision",

      estimatedMinutes:
        REVISION_ACTIVITY_MINUTES,

      completed: false,
    });
  }

  return activities;
}

// =========================================================
// TOPIC GENERATION
// =========================================================

function getInitialTopicStatus(
  _topicIndex: number
): RoadmapStatus {
  return "available";
}


function convertSkillToTopic(
  skill: CurriculumSkill,
  topicIndex: number,
  revision: boolean,
  curriculumMode: RoadmapTemplate["curriculumMode"],
  level: LearningLevel
): RoadmapTopic {
  const activities =
  createSkillActivities(
    skill,
    revision,
    curriculumMode,
    level
  );

  const estimatedMinutes =
    activities.reduce(
      (total, activity) =>
        total +
        activity.estimatedMinutes,
      0
    );

  return {
    id: skill.id,

    title: skill.name,

    description: skill.description,

    category: skill.category,

    difficulty: skill.difficulty,

    prerequisites: [
      ...skill.prerequisites,
    ],

    activities,

    estimatedMinutes,

    masteryScore: 0,

    status:
      revision
        ? "revision"
        : getInitialTopicStatus(
            topicIndex
          ),
  };
}


// =========================================================
// ASSIGNMENT CONVERSION
// =========================================================

function convertAssignment(
  assignment: CurriculumAssignment
): RoadmapAssignment {
  return {
    id: assignment.id,

    title: assignment.title,

    description:
      assignment.description,

    topicIds: [
      assignment.skillId,
    ],

    difficulty:
      assignment.difficulty,

    estimatedMinutes:
      assignment.estimatedMinutes,

    instructions:
      assignment.tasks.map(
        (task, index) =>
          `${index + 1}. ${task.title}: ${task.description}`
      ),

    hints: [
      ...assignment.hints,
    ],

    completed: false,
  };
}


function getAssignmentForSkill(
  skillId: string,
  profile: RoadmapProfile
): RoadmapAssignment | undefined {
  const assignments =
    getAssignmentsForSkill(skillId);

  if (assignments.length === 0) {
    return undefined;
  }

  const levelMatch =
    assignments.find(
      (assignment) =>
        assignment.levels.includes(
          profile.level
        )
    );

  return convertAssignment(
    levelMatch ??
      assignments[0]
  );
}


// =========================================================
// QUIZ CONVERSION
// =========================================================

function convertQuestion(
  question: AssessmentQuestion
): RoadmapQuizQuestion {
  return {
    id: question.id,

    question:
      question.question,

    options: [
      ...question.options,
    ],

    correctAnswer:
      question.correctAnswer,

    explanation:
      question.explanation,
  };
}


function getQuizForSkill(
  skillId: string,
  profile: RoadmapProfile
): RoadmapQuiz | undefined {
  const questions =
    getQuestionsForSkill(skillId);

  if (questions.length === 0) {
    return undefined;
  }

  const allowedQuestions =
    questions.filter(
      (question) => {
        if (
          profile.level ===
          "advanced"
        ) {
          return true;
        }

        if (
          profile.level ===
          "intermediate"
        ) {
          return (
            question.level !==
            "advanced"
          );
        }

        return (
          question.level ===
          "beginner"
        );
      }
    );

  const selectedQuestions =
    allowedQuestions.length > 0
      ? allowedQuestions
      : questions;

  return {
    id: createId(
      "quiz",
      skillId
    ),

    title: `${skillId
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ")} Checkpoint`,

    topicIds: [
      skillId,
    ],

    questions:
      selectedQuestions.map(
        convertQuestion
      ),

    completed: false,
  };
}


// =========================================================
// DAILY SCHEDULING
// =========================================================
//
// IMPORTANT:
//
// A normal learning topic is kept together as one complete
// learning experience:
//
// Learn
//   ↓
// Visualize
//   ↓
// Code
//   ↓
// Practice
//
// We intentionally DO NOT split those four stages into
// separate calendar days.
//
// minutesPerDay is still used by workload analysis and
// personalization, but it must not destroy the pedagogical
// structure of a lesson.
//
// One curriculum skill therefore becomes one primary
// learning day.
//
// Revision remains attached to the same topic when required.
//
// Assignment and quiz are attached later by
// attachAssessmentsToDays().
// =========================================================


function cloneActivity(
  activity: RoadmapActivity
): RoadmapActivity {
  return {
    ...activity,

    completedProblemIds:
      activity.completedProblemIds
        ? [
            ...activity.completedProblemIds,
          ]
        : undefined,
  };
}


// =========================================================
// CLONE COMPLETE TOPIC
// =========================================================

function cloneCompleteTopic(
  topic: RoadmapTopic
): RoadmapTopic {
  const activities =
    topic.activities.map(
      cloneActivity
    );

  return {
    ...topic,

    prerequisites: [
      ...topic.prerequisites,
    ],

    activities,

    estimatedMinutes:
      activities.reduce(
        (
          total,
          activity
        ) =>
          total +
          activity.estimatedMinutes,
        0
      ),
  };
}


// =========================================================
// CREATE ONE COMPLETE LEARNING DAY
// =========================================================

function createTopicLearningDay(
  topic: RoadmapTopic,
  dayNumber: number
): RoadmapDay {
  const completeTopic =
    cloneCompleteTopic(topic);

  return {
    id: createId(
      "day",
      dayNumber
    ),

    dayNumber,

    title:
      completeTopic.title,

    topics: [
      completeTopic,
    ],

    estimatedMinutes:
      completeTopic.estimatedMinutes,

    completed: false,

    isRevisionDay:
      completeTopic.status ===
      "revision",
  };
}


// =========================================================
// CREATE LEARNING DAYS
// =========================================================

function createLearningDays(
  topics: RoadmapTopic[],
  _profile: RoadmapProfile
): RoadmapDay[] {
  /*
   * Do not pack individual activities into days.
   *
   * Previously:
   *
   * Linear Regression
   *   Learn       -> Day 1
   *   Visualize   -> Day 1
   *   Code        -> Day 2
   *   Practice    -> Day 2
   *
   * That made the Day Workspace inconsistent because a day
   * could contain only one or two stages.
   *
   * Now:
   *
   * Day 1 — Linear Regression
   *   Learn
   *   Visualize
   *   Code
   *   Practice
   *
   * Day 2 — Logistic Regression
   *   Learn
   *   Visualize
   *   Code
   *   Practice
   *
   * Assignment and Quiz are attached afterwards.
   */

  return topics.map(
    (
      topic,
      index
    ) =>
      createTopicLearningDay(
        topic,
        index + 1
      )
  );
}


// =========================================================
// ASSIGNMENT + QUIZ PLACEMENT
// =========================================================

function findLastDayForSkill(
  days: RoadmapDay[],
  skillId: string
): RoadmapDay | undefined {
  for (
    let index =
      days.length - 1;
    index >= 0;
    index -= 1
  ) {
    const found =
      days[index].topics.some(
        (topic) =>
          topic.id === skillId
      );

    if (found) {
      return days[index];
    }
  }

  return undefined;
}


function attachAssessmentsToDays(
  days: RoadmapDay[],
  skills: CurriculumSkill[],
  profile: RoadmapProfile
): void {
  for (const skill of skills) {
    const skillDay =
      findLastDayForSkill(
        days,
        skill.id
      );

    if (!skillDay) {
      continue;
    }

    const assignment =
      getAssignmentForSkill(
        skill.id,
        profile
      );

    const quiz =
      getQuizForSkill(
        skill.id,
        profile
      );

    if (!assignment && !quiz) {
      continue;
    }

    /*
     * Keep the checkpoint on the final
     * learning day of the skill.
     *
     * We intentionally do NOT create a
     * separate Practice day here.
     *
     * This prevents assignments and quizzes
     * from unnecessarily increasing the
     * roadmap's calendar length.
     *
     * estimatedMinutes is still maintained
     * internally for workload analysis.
     */
    const targetDay =
      skillDay;

    const quizMinutes =
      quiz
        ? Math.max(
            10,
            quiz.questions.length * 3
          )
        : 0;

    if (
      assignment &&
      !targetDay.assignment
    ) {
      targetDay.assignment =
        assignment;

      targetDay.estimatedMinutes +=
        assignment.estimatedMinutes;
    }

    if (
      quiz &&
      !targetDay.quiz
    ) {
      targetDay.quiz =
        quiz;

      targetDay.estimatedMinutes +=
        quizMinutes;
    }
  }
}
// =========================================================
// WEEKLY REVISION
// =========================================================

function createWeeklyReviewDay(
  dayNumber: number,
  weekNumber: number,
  weekTopics: RoadmapTopic[]
): RoadmapDay {
  const uniqueTopics =
    Array.from(
      new Map(
        weekTopics.map(
          (topic) => [
            topic.id,
            topic,
          ]
        )
      ).values()
    );

  const reviewTopic: RoadmapTopic = {
    id: createId(
      "weekly-review-topic",
      weekNumber
    ),

    title:
      `Week ${weekNumber} Review`,

    description:
      "Review the week's concepts, coding work, mistakes and weak areas before continuing.",

    category:
      "Weekly Review",

    difficulty:
      "basic",

    prerequisites:
      uniqueTopics.map(
        (topic) => topic.id
      ),

    activities: [
      {
        id: createId(
          "weekly-review",
          weekNumber
        ),

        title:
          "Review concepts and mistakes",

        type: "revision",

        estimatedMinutes:
          WEEKLY_REVIEW_MINUTES,

        completed: false,
      },
    ],

    estimatedMinutes:
      WEEKLY_REVIEW_MINUTES,

    masteryScore: 0,

    status: "revision",
  };

  return {
    id: createId(
      "day",
      dayNumber
    ),

    dayNumber,

    title:
      `Week ${weekNumber} Review`,

    topics: [
      reviewTopic,
    ],

    estimatedMinutes:
      WEEKLY_REVIEW_MINUTES,

    completed: false,

    isRevisionDay: true,
  };
}


// =========================================================
// WEEK GENERATION
// =========================================================

function groupDaysIntoWeeks(
  learningDays: RoadmapDay[],
  profile: RoadmapProfile
): RoadmapWeek[] {
  const weeks: RoadmapWeek[] = [];

  if (learningDays.length === 0) {
    return weeks;
  }

  const requestedWeeks = Math.max(
    1,
    profile.durationWeeks
  );

  /*
   * A normal ModelMind week contains:
   *
   *   6 complete learning days
   *   1 weekly review day
   *
   * We intentionally NEVER split a topic's
   * Learn / Visualize / Code / Practice activities
   * across multiple days.
   *
   * durationWeeks is treated as the learner's target,
   * not as permission to delete curriculum.
   *
   * If more learning days are required than fit inside
   * the requested duration, additional weeks are created.
   * The workload system can then warn the learner that
   * the selected curriculum needs more time.
   */

  const LEARNING_DAYS_PER_WEEK = 6;

  const requiredWeeks = Math.ceil(
    learningDays.length /
      LEARNING_DAYS_PER_WEEK
  );

  const totalWeeks = Math.max(
    requestedWeeks,
    requiredWeeks
  );

  let dayCursor = 0;
  let globalDayNumber = 1;

  for (
    let weekNumber = 1;
    weekNumber <= totalWeeks;
    weekNumber += 1
  ) {
    const weekLearningDays =
      learningDays.slice(
        dayCursor,
        dayCursor +
          LEARNING_DAYS_PER_WEEK
      );

    /*
     * Do not generate artificial empty weeks after
     * the curriculum has finished.
     *
     * durationWeeks remains the target duration,
     * while the actual roadmap reflects real content.
     */
    if (
      weekLearningDays.length === 0
    ) {
      break;
    }

    const normalizedDays =
      weekLearningDays.map(
        (day) => {
          const dayNumber =
            globalDayNumber;

          globalDayNumber += 1;

          return {
            ...day,

            id: createId(
              "day",
              dayNumber
            ),

            dayNumber,
          };
        }
      );

    const weekTopics =
      normalizedDays.flatMap(
        (day) => day.topics
      );

    /*
     * Add a review/checkpoint after every
     * completed learning week.
     *
     * The final partial week also receives a review
     * because consolidating the final topics is useful.
     */
    if (weekTopics.length > 0) {
      normalizedDays.push(
        createWeeklyReviewDay(
          globalDayNumber,
          weekNumber,
          weekTopics
        )
      );

      globalDayNumber += 1;
    }

    const uniqueNames =
      uniqueStrings(
        weekTopics.map(
          (topic) => topic.title
        )
      );

    const isFinalWeek =
      dayCursor +
        LEARNING_DAYS_PER_WEEK >=
      learningDays.length;

    weeks.push({
      id: createId(
        "week",
        weekNumber
      ),

      weekNumber,

      title:
        uniqueNames.length > 0
          ? `Week ${weekNumber}: ${uniqueNames
              .slice(0, 2)
              .join(" & ")}`
          : `Week ${weekNumber}`,

      description:
        uniqueNames.length > 0
          ? isFinalWeek
            ? `Complete your roadmap with ${uniqueNames.join(
                ", "
              )}, then consolidate your learning in the final review.`
            : `Focus on ${uniqueNames.join(
                ", "
              )}, then reinforce the week's learning with a review.`
          : "Continue your personalized learning plan.",

      days: normalizedDays,

      completed: false,
    });

    dayCursor +=
      LEARNING_DAYS_PER_WEEK;
  }

  return weeks;
}


// =========================================================
// PROJECT GENERATION
// =========================================================

function convertProject(
  project: CurriculumProject
): RoadmapProject {
  return {
    id: project.id,

    title: project.title,

    description:
      project.description,

    difficulty:
      project.difficulty,

    requiredSkills: [
      ...project.requiredSkills,
    ],

    objectives: [
      ...project.objectives,
    ],

    estimatedMinutes:
      project.estimatedMinutes,

    completed: false,
  };
}


function resolveProjects(
  template: RoadmapTemplate
): RoadmapProject[] {
  return template.projectIds
    .map((projectId) =>
      getProjectById(projectId)
    )
    .filter(
      (
        project
      ): project is CurriculumProject =>
        project !== undefined
    )
    .map(convertProject);
}

function resolveExtensionProjects(
  template: RoadmapTemplate
): RoadmapProject[] {
  return (
    template.extensionProjectIds ?? []
  )
    .map((projectId) =>
      getProjectById(projectId)
    )
    .filter(
      (
        project
      ): project is CurriculumProject =>
        project !== undefined
    )
    .map(convertProject);
}

// =========================================================
// WORKLOAD CALCULATION
// =========================================================

function calculateRoadmapMinutes(
  topics: RoadmapTopic[],
  projects: RoadmapProject[]
): number {
  const topicMinutes =
    topics.reduce(
      (total, topic) =>
        total +
        topic.estimatedMinutes,
      0
    );

  const projectMinutes =
    projects.reduce(
      (total, project) =>
        total +
        project.estimatedMinutes,
      0
    );

  return (
    topicMinutes +
    projectMinutes
  );
}


function calculateWorkload(
  profile: RoadmapProfile,
  estimatedCurriculumMinutes: number
): RoadmapWorkloadAnalysis {
  const requestedMinutes =
    profile.minutesPerDay *
    DAYS_PER_WEEK *
    profile.durationWeeks;

  const realistic =
    requestedMinutes >=
    estimatedCurriculumMinutes;

  const totalAvailableDays =
    Math.max(
      1,
      profile.durationWeeks *
        DAYS_PER_WEEK
    );

  const recommendedMinutesPerDay =
    Math.ceil(
      estimatedCurriculumMinutes /
        totalAvailableDays
    );

  const weeklyCapacity =
    Math.max(
      1,
      profile.minutesPerDay *
        DAYS_PER_WEEK
    );

  const recommendedWeeks =
    Math.max(
      1,
      Math.ceil(
        estimatedCurriculumMinutes /
          weeklyCapacity
      )
    );

  return {
    requestedMinutes,

    estimatedCurriculumMinutes,

    differenceMinutes:
      requestedMinutes -
      estimatedCurriculumMinutes,

    realistic,

    recommendedMinutesPerDay,

    recommendedWeeks,
  };
}


// =========================================================
// WARNINGS
// =========================================================

function buildWarnings(
  profile: RoadmapProfile,
  template: RoadmapTemplate,
  workload: RoadmapWorkloadAnalysis,
  missingSkillIds: string[]
): string[] {
  const warnings: string[] = [];

  if (!workload.realistic) {
    warnings.push(
      `Your selected schedule provides ${workload.requestedMinutes} minutes, while the current roadmap is estimated to require about ${workload.estimatedCurriculumMinutes} minutes. Consider approximately ${workload.recommendedMinutesPerDay} minutes per day or around ${workload.recommendedWeeks} weeks.`
    );
  }

  if (
    profile.minutesPerDay <
    template.minimumMinutesPerDay
  ) {
    warnings.push(
      `The ${template.name} normally recommends at least ${template.minimumMinutesPerDay} minutes per day. Your current setting is ${profile.minutesPerDay} minutes per day.`
    );
  }

  if (missingSkillIds.length > 0) {
    warnings.push(
      `Some template skills were not found in the curriculum database: ${missingSkillIds.join(
        ", "
      )}.`
    );
  }

  return warnings;
}


// =========================================================
// VALIDATION
// =========================================================

function validateProfile(
  profile: RoadmapProfile
): void {
  if (
    !Number.isFinite(
      profile.minutesPerDay
    ) ||
    profile.minutesPerDay <= 0
  ) {
    throw new Error(
      "minutesPerDay must be greater than 0."
    );
  }

  if (
    !Number.isFinite(
      profile.durationWeeks
    ) ||
    profile.durationWeeks <= 0
  ) {
    throw new Error(
      "durationWeeks must be greater than 0."
    );
  }
}


// =========================================================
// MAIN GENERATOR
// =========================================================

export function generatePersonalizedRoadmap(
  options: RoadmapGenerationOptions
): RoadmapGenerationResult {
  validateProfile(
    options.profile
  );

  const profile = {
    ...options.profile,
  };

  const assessments =
    options.assessments ?? [];

  const strongSkillIds =
    options.strongSkillIds ?? [];

  const weakSkillIds =
    options.weakSkillIds ?? [];

  const completedSkillIds =
    options.completedSkillIds ?? [];

  const template =
    getRoadmapTemplate(
      profile.goal
    );

  const templateSkills =
    resolveTemplateSkills(
      template
    );

  const resolvedTemplateIds =
    new Set(
      templateSkills.map(
        (skill) => skill.id
      )
    );

  const missingSkillIds =
    template.skillPath.filter(
      (skillId) =>
        !resolvedTemplateIds.has(
          skillId
        )
    );

  const selection =
  selectSkillsForRoadmap(
    template,
    profile,
    assessments,
    strongSkillIds,
    weakSkillIds,
    completedSkillIds
  );

  const revisionSet =
    new Set(
      selection.revision
    );

  const topics =
  selection.included.map(
    (skill, index) =>
      convertSkillToTopic(
        skill,
        index,
        revisionSet.has(skill.id),
        template.curriculumMode,
        profile.level
      )
  );

  const learningDays =
    createLearningDays(
      topics,
      profile
    );

  attachAssessmentsToDays(
    learningDays,
    selection.included,
    profile
  );

  const weeks =
  groupDaysIntoWeeks(
    learningDays,
    profile
  );

  const projects =
    resolveProjects(
      template
    );
      const extensionSkills =
    resolveExtensionSkills(
      template
    );

  const extensionProjects =
    resolveExtensionProjects(
      template
    );

  const estimatedCurriculumMinutes =
    calculateRoadmapMinutes(
      topics,
      projects
    );

  const workload =
    calculateWorkload(
      profile,
      estimatedCurriculumMinutes
    );

  const warnings =
    buildWarnings(
      profile,
      template,
      workload,
      missingSkillIds
    );

  const totalDays =
    weeks.reduce(
      (total, week) =>
        total +
        week.days.length,
      0
    );

  const now =
    new Date().toISOString();

  const roadmap:
    PersonalizedRoadmapData = {
      id: createId(
        "roadmap",
        profile.goal,
        Date.now()
      ),

      name:
        profile.goal === "custom" &&
        profile.customGoal
          ? profile.customGoal
          : template.name,

      profile,

      weeks,

      projects,

      assessments: [
        ...assessments,
      ],
      weakTopics: [],

      overallProgress: 0,

      currentDay:
        totalDays > 0
          ? 1
          : 0,

      totalDays,

      createdAt:
        options.startDate ??
        now,

      updatedAt: now,
    };

  return {
    roadmap,

    workload,

    includedSkillIds:
      selection.included.map(
        (skill) => skill.id
      ),

    skippedSkillIds:
      selection.skipped,

        revisionSkillIds:
      selection.revision,

    extensionSkillIds:
      extensionSkills.map(
        (skill) => skill.id
      ),

    extensionProjectIds:
      extensionProjects.map(
        (project) => project.id
      ),

    warnings,
  };
}


// =========================================================
// SIMPLE GENERATOR
// Useful when assessment has not been completed yet.
// =========================================================

export function generateRoadmapFromProfile(
  profile: RoadmapProfile
): PersonalizedRoadmapData {
  return generatePersonalizedRoadmap({
    profile,
  }).roadmap;
}


// =========================================================
// ROADMAP SUMMARY
// =========================================================

export function getRoadmapSummary(
  roadmap: PersonalizedRoadmapData
): {
  weeks: number;
  days: number;
  topics: number;
  projects: number;
  estimatedMinutes: number;
} {
  const topics =
    roadmap.weeks.flatMap(
      (week) =>
        week.days.flatMap(
          (day) =>
            day.topics
        )
    );

  const uniqueTopics =
    new Map<
      string,
      RoadmapTopic
    >();

  for (const topic of topics) {
    uniqueTopics.set(
      topic.id,
      topic
    );
  }

  const learningMinutes =
    roadmap.weeks.reduce(
      (weekTotal, week) =>
        weekTotal +
        week.days.reduce(
          (dayTotal, day) =>
            dayTotal +
            day.estimatedMinutes,
          0
        ),
      0
    );

  const projectMinutes =
    roadmap.projects.reduce(
      (total, project) =>
        total +
        project.estimatedMinutes,
      0
    );

  return {
    weeks:
      roadmap.weeks.length,

    days:
      roadmap.totalDays,

    topics:
      uniqueTopics.size,

    projects:
      roadmap.projects.length,

    estimatedMinutes:
      learningMinutes +
      projectMinutes,
  };
}