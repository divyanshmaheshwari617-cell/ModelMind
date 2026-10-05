import type {
  PersonalizedRoadmapData,
  RoadmapDay,
  SkillAssessment,
} from "../../types/roadmap";

import {
  GOOD_MASTERY_SCORE,
  STRONG_MASTERY_SCORE,
  getMasteryStatus,
  getWeakestAreas,
  type MasteryArea,
  type MasteryStatus,
} from "./roadmapMastery";

import {
  getRoadmapProgressSummary,
} from "./roadmapProgress";


// =========================================================
// RECOMMENDATION TYPES
// =========================================================

export type RecommendationType =
  | "continue"
  | "revision"
  | "practice"
  | "relearn"
  | "challenge"
  | "project"
  | "catch-up"
  | "complete";


export type RecommendationPriority =
  | "low"
  | "medium"
  | "high";


export interface RoadmapRecommendation {
  id: string;

  type: RecommendationType;

  priority: RecommendationPriority;

  title: string;

  message: string;

  skillId?: string;

  dayNumber?: number;

  actionLabel?: string;
}


export interface SkillRecommendation {
  skillId: string;

  score: number;

  status: MasteryStatus;

  weakestAreas: MasteryArea[];

  recommendation: RoadmapRecommendation;
}


export interface RoadmapRecommendationSummary {
  primaryRecommendation:
    RoadmapRecommendation;

  recommendations:
    RoadmapRecommendation[];

  skillRecommendations:
    SkillRecommendation[];

  weakSkillIds: string[];

  strongSkillIds: string[];

  currentDay?: RoadmapDay;

  readyForAdvancedWork: boolean;
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


function uniqueRecommendations(
  recommendations:
    RoadmapRecommendation[]
): RoadmapRecommendation[] {
  const map =
    new Map<
      string,
      RoadmapRecommendation
    >();

  for (
    const recommendation
    of recommendations
  ) {
    map.set(
      recommendation.id,
      recommendation
    );
  }

  return [
    ...map.values(),
  ];
}


// =========================================================
// CURRENT DAY
// =========================================================

export function getCurrentRecommendedDay(
  roadmap: PersonalizedRoadmapData
): RoadmapDay | undefined {
  for (
    const week
    of roadmap.weeks
  ) {
    const day =
      week.days.find(
        (candidate) =>
          candidate.dayNumber ===
          roadmap.currentDay
      );

    if (day) {
      return day;
    }
  }

  return undefined;
}


// =========================================================
// SKILL RECOMMENDATION
// =========================================================

export function getSkillRecommendation(
  assessment: SkillAssessment
): SkillRecommendation {
  const score =
    assessment.mastery
      .overallScore;

  const status =
    getMasteryStatus(score);

  const weakestAreas =
    getWeakestAreas(
      assessment.mastery,
      2
    );

  let recommendation:
    RoadmapRecommendation;

  if (status === "strong") {
    recommendation = {
      id: createId(
        "recommendation",
        assessment.skillId,
        "challenge"
      ),

      type: "challenge",

      priority: "low",

      title:
        "Ready for harder work",

      message:
        `Your mastery of ${assessment.skillId} is strong. Continue forward and use more challenging practice instead of repeating basic material.`,

      skillId:
        assessment.skillId,

      actionLabel:
        "Continue",
    };
  } else if (
    status === "good"
  ) {
    recommendation = {
      id: createId(
        "recommendation",
        assessment.skillId,
        "continue"
      ),

      type: "continue",

      priority: "low",

      title:
        "Continue with short practice",

      message:
        `Your understanding of ${assessment.skillId} is good. Continue to the next material, but keep short practice for ${weakestAreas.join(
          " and "
        )}.`,

      skillId:
        assessment.skillId,

      actionLabel:
        "Continue Learning",
    };
  } else if (
    status ===
    "needs-practice"
  ) {
    recommendation = {
      id: createId(
        "recommendation",
        assessment.skillId,
        "practice"
      ),

      type: "practice",

      priority: "medium",

      title:
        "Extra practice recommended",

      message:
        `Your ${assessment.skillId} mastery needs more practice. Focus especially on ${weakestAreas.join(
          " and "
        )} before moving too far ahead.`,

      skillId:
        assessment.skillId,

      actionLabel:
        "Practice Skill",
    };
  } else {
    recommendation = {
      id: createId(
        "recommendation",
        assessment.skillId,
        "relearn"
      ),

      type: "relearn",

      priority: "high",

      title:
        "Relearn this skill",

      message:
        `Your current mastery of ${assessment.skillId} is below the progression threshold. Review the core concept, then retry coding and practice with emphasis on ${weakestAreas.join(
          " and "
        )}.`,

      skillId:
        assessment.skillId,

      actionLabel:
        "Start Revision",
    };
  }

  return {
    skillId:
      assessment.skillId,

    score,

    status,

    weakestAreas,

    recommendation,
  };
}


// =========================================================
// ALL SKILL RECOMMENDATIONS
// =========================================================

export function getSkillRecommendations(
  roadmap: PersonalizedRoadmapData
): SkillRecommendation[] {
  return roadmap.assessments.map(
    getSkillRecommendation
  );
}


// =========================================================
// WEAK / STRONG SKILLS
// =========================================================

export function getRecommendedWeakSkillIds(
  roadmap: PersonalizedRoadmapData
): string[] {
  return roadmap.assessments
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
}


export function getRecommendedStrongSkillIds(
  roadmap: PersonalizedRoadmapData
): string[] {
  return roadmap.assessments
    .filter(
      (assessment) =>
        assessment.mastery
          .overallScore >=
        STRONG_MASTERY_SCORE
    )
    .map(
      (assessment) =>
        assessment.skillId
    );
}


// =========================================================
// ADVANCED READINESS
// =========================================================

export function isReadyForAdvancedWork(
  roadmap: PersonalizedRoadmapData
): boolean {
  if (
    roadmap.assessments.length ===
    0
  ) {
    return false;
  }

  const scores =
    roadmap.assessments.map(
      (assessment) =>
        assessment.mastery
          .overallScore
    );

  const average =
    scores.reduce(
      (total, score) =>
        total + score,
      0
    ) / scores.length;

  const weakSkills =
    scores.filter(
      (score) =>
        score <
        GOOD_MASTERY_SCORE
    );

  return (
    average >=
      STRONG_MASTERY_SCORE &&
    weakSkills.length === 0
  );
}


// =========================================================
// CATCH-UP RECOMMENDATION
// =========================================================

function getCatchUpRecommendation(
  roadmap: PersonalizedRoadmapData
): RoadmapRecommendation | null {
  const currentDay =
    getCurrentRecommendedDay(
      roadmap
    );

  if (!currentDay) {
    return null;
  }

  if (
    currentDay.estimatedMinutes <=
    roadmap.profile.minutesPerDay
  ) {
    return null;
  }

  return {
    id: createId(
      "recommendation",
      "catch-up",
      currentDay.dayNumber
    ),

    type: "catch-up",

    priority: "medium",

    title:
      "Today's workload is high",

    message:
      `Day ${currentDay.dayNumber} is estimated at ${currentDay.estimatedMinutes} minutes, while your daily target is ${roadmap.profile.minutesPerDay} minutes. Consider rebalancing the remaining plan rather than rushing the work.`,

    dayNumber:
      currentDay.dayNumber,

    actionLabel:
      "Rebalance Plan",
  };
}


// =========================================================
// PROJECT RECOMMENDATION
// =========================================================

function getProjectRecommendation(
  roadmap: PersonalizedRoadmapData
): RoadmapRecommendation | null {
  const incompleteProject =
    roadmap.projects.find(
      (project) =>
        !project.completed &&
        project.requiredSkills.every(
          (skillId) => {
            const assessment =
              roadmap.assessments.find(
                (candidate) =>
                  candidate.skillId ===
                  skillId
              );

            return (
              assessment !==
                undefined &&
              assessment.mastery
                .overallScore >=
                GOOD_MASTERY_SCORE
            );
          }
        )
    );

  if (!incompleteProject) {
    return null;
  }

  return {
    id: createId(
      "recommendation",
      "project",
      incompleteProject.id
    ),

    type: "project",

    priority: "medium",

    title:
      "Ready for project practice",

    message:
      `Your prerequisite mastery is sufficient to start ${incompleteProject.title}. Use the project to combine multiple skills in a practical workflow.`,

    actionLabel:
      "Start Project",
  };
}


// =========================================================
// COMPLETION RECOMMENDATION
// =========================================================

function getCompletionRecommendation(
  roadmap: PersonalizedRoadmapData
): RoadmapRecommendation | null {
  const progress =
    getRoadmapProgressSummary(
      roadmap
    );

  if (
    progress.overallProgress <
    100
  ) {
    return null;
  }

  return {
    id: createId(
      "recommendation",
      "roadmap",
      "complete"
    ),

    type: "complete",

    priority: "low",

    title:
      "Roadmap completed",

    message:
      "You have completed the planned roadmap work. Review your mastery results and decide whether to deepen weak areas, start a larger project, or move to more advanced material.",

    actionLabel:
      "Review Mastery",
  };
}


// =========================================================
// NORMAL CONTINUE RECOMMENDATION
// =========================================================

function getContinueRecommendation(
  roadmap: PersonalizedRoadmapData
): RoadmapRecommendation {
  const currentDay =
    getCurrentRecommendedDay(
      roadmap
    );

  if (!currentDay) {
    return {
      id: createId(
        "recommendation",
        "continue"
      ),

      type: "continue",

      priority: "low",

      title:
        "Continue your roadmap",

      message:
        "Continue with the next available learning activity.",

      actionLabel:
        "Continue Learning",
    };
  }

  return {
    id: createId(
      "recommendation",
      "day",
      currentDay.dayNumber
    ),

    type: currentDay.isRevisionDay
      ? "revision"
      : "continue",

    priority:
      currentDay.isRevisionDay
        ? "medium"
        : "low",

    title:
      currentDay.isRevisionDay
        ? "Revision is recommended"
        : `Continue Day ${currentDay.dayNumber}`,

    message:
      currentDay.isRevisionDay
        ? `Day ${currentDay.dayNumber} is focused on revision. Complete it before moving forward so weak concepts do not accumulate.`
        : `Continue with ${currentDay.title}. Complete the learning, coding and practice activities before moving forward.`,

    dayNumber:
      currentDay.dayNumber,

    actionLabel:
      currentDay.isRevisionDay
        ? "Start Revision"
        : "Continue Learning",
  };
}


// =========================================================
// PRIMARY RECOMMENDATION
// =========================================================

function choosePrimaryRecommendation(
  recommendations:
    RoadmapRecommendation[]
): RoadmapRecommendation {
  const priorityOrder:
    Record<
      RecommendationPriority,
      number
    > = {
      high: 3,
      medium: 2,
      low: 1,
    };

  return [
    ...recommendations,
  ].sort(
    (a, b) =>
      priorityOrder[b.priority] -
      priorityOrder[a.priority]
  )[0];
}


// =========================================================
// COMPLETE ROADMAP RECOMMENDATIONS
// =========================================================

export function generateRoadmapRecommendations(
  roadmap: PersonalizedRoadmapData
): RoadmapRecommendationSummary {
  const skillRecommendations =
    getSkillRecommendations(
      roadmap
    );

  const weakSkillIds =
    getRecommendedWeakSkillIds(
      roadmap
    );

  const strongSkillIds =
    getRecommendedStrongSkillIds(
      roadmap
    );

  const recommendations:
    RoadmapRecommendation[] = [];

  const completion =
    getCompletionRecommendation(
      roadmap
    );

  if (completion) {
    recommendations.push(
      completion
    );
  }

  for (
    const skillRecommendation
    of skillRecommendations
  ) {
    if (
      skillRecommendation.status ===
        "relearn" ||
      skillRecommendation.status ===
        "needs-practice"
    ) {
      recommendations.push(
        skillRecommendation
          .recommendation
      );
    }
  }

  const catchUp =
    getCatchUpRecommendation(
      roadmap
    );

  if (catchUp) {
    recommendations.push(
      catchUp
    );
  }

  const project =
    getProjectRecommendation(
      roadmap
    );

  if (project) {
    recommendations.push(
      project
    );
  }

  if (!completion) {
    recommendations.push(
      getContinueRecommendation(
        roadmap
      )
    );
  }

  const unique =
    uniqueRecommendations(
      recommendations
    );

  /*
   * There should always be at least
   * one recommendation because the
   * normal continue recommendation is
   * added for unfinished roadmaps.
   */

  const primaryRecommendation =
    choosePrimaryRecommendation(
      unique
    );

  return {
    primaryRecommendation,

    recommendations: unique,

    skillRecommendations,

    weakSkillIds,

    strongSkillIds,

    currentDay:
      getCurrentRecommendedDay(
        roadmap
      ),

    readyForAdvancedWork:
      isReadyForAdvancedWork(
        roadmap
      ),
  };
}