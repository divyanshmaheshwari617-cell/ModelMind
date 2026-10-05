import type {
  LearningLevel,
  PersonalizedRoadmapData,
  RoadmapProfile,
  SkillAssessment,
} from "../../types/roadmap";

import type {
  AssessmentQuestion,
} from "../../data/roadmap/quizzes";

import {
  buildInitialAssessment,
  evaluateAssessment,
  type AssessmentAnswer,
  type RoadmapAssessmentResult,
} from "./roadmapAssessment";

import {
  generatePersonalizedRoadmap,
  getRoadmapSummary,
  type RoadmapGenerationResult,
} from "./roadmapGenerator";

import {
  createSkillAssessment,
  getStrongSkillIds,
  getWeakSkillIds,
  type MasteryInput,
} from "./roadmapMastery";


// =========================================================
// ENGINE TYPES
// =========================================================

export interface RoadmapEngineSession {
  profile: RoadmapProfile;

  assessmentQuestions: AssessmentQuestion[];

  diagnosticResult?: RoadmapAssessmentResult;

  roadmap?: PersonalizedRoadmapData;

  generationResult?: RoadmapGenerationResult;
}


export interface RoadmapEngineResult {
  roadmap: PersonalizedRoadmapData;

  generation: RoadmapGenerationResult;

  diagnostic?: RoadmapAssessmentResult;
}


export interface LearnerAnalysis {
  selectedLevel: LearningLevel;

  recommendedLevel?: LearningLevel;

  assessmentPercentage?: number;

  strongSkillIds: string[];

  weakSkillIds: string[];

  completedSkillIds: string[];

  assessmentCount: number;
}


// =========================================================
// PROFILE VALIDATION
// =========================================================

export function validateRoadmapProfile(
  profile: RoadmapProfile
): string[] {
  const errors: string[] = [];

  if (
    !Number.isFinite(
      profile.minutesPerDay
    ) ||
    profile.minutesPerDay <= 0
  ) {
    errors.push(
      "Daily study time must be greater than 0 minutes."
    );
  }

  if (
    !Number.isFinite(
      profile.durationWeeks
    ) ||
    profile.durationWeeks <= 0
  ) {
    errors.push(
      "Roadmap duration must be greater than 0 weeks."
    );
  }

  if (
    profile.goal === "custom" &&
    !profile.customGoal?.trim()
  ) {
    errors.push(
      "A custom learning goal is required when the roadmap goal is custom."
    );
  }

  return errors;
}


// =========================================================
// CREATE ENGINE SESSION
// =========================================================

export function createRoadmapSession(
  profile: RoadmapProfile
): RoadmapEngineSession {
  const errors =
    validateRoadmapProfile(
      profile
    );

  if (errors.length > 0) {
    throw new Error(
      errors.join(" ")
    );
  }

  const assessmentQuestions =
    buildInitialAssessment(
      profile.level
    );

  return {
    profile: {
      ...profile,
    },

    assessmentQuestions,
  };
}


// =========================================================
// RUN INITIAL DIAGNOSTIC
// =========================================================

export function runDiagnosticAssessment(
  session: RoadmapEngineSession,
  answers: AssessmentAnswer[]
): RoadmapEngineSession {
  const diagnosticResult =
    evaluateAssessment(
      session.assessmentQuestions,
      answers
    );

  return {
    ...session,

    diagnosticResult,
  };
}


// =========================================================
// DIAGNOSTIC -> SKILL ASSESSMENTS
// =========================================================

function diagnosticToSkillAssessments(
  result: RoadmapAssessmentResult
): SkillAssessment[] {
  const now =
    new Date().toISOString();

  return result.skillResults.map(
    (skillResult) => {
      const score =
        skillResult.percentage;

      return {
        skillId:
          skillResult.skillId,

        score,

        mastery: {
          conceptScore: score,

          codingScore: 0,

          assignmentScore: 0,

          quizScore: score,

          debuggingScore: 0,

          overallScore: score,
        },

        assessedAt: now,
      };
    }
  );
}


// =========================================================
// LEARNER ANALYSIS
// =========================================================

export function analyzeLearner(
  profile: RoadmapProfile,
  diagnostic?: RoadmapAssessmentResult,
  assessments: SkillAssessment[] = [],
  completedSkillIds: string[] = []
): LearnerAnalysis {
  const diagnosticStrong =
    diagnostic?.strongSkillIds ?? [];

  const diagnosticWeak =
    diagnostic?.weakSkillIds ?? [];

  const masteryStrong =
    getStrongSkillIds(
      assessments
    );

  const masteryWeak =
    getWeakSkillIds(
      assessments
    );

  return {
    selectedLevel:
      profile.level,

    recommendedLevel:
      diagnostic
        ?.recommendedStartingLevel,

    assessmentPercentage:
      diagnostic?.percentage,

    strongSkillIds: [
      ...new Set([
        ...diagnosticStrong,
        ...masteryStrong,
      ]),
    ],

    weakSkillIds: [
      ...new Set([
        ...diagnosticWeak,
        ...masteryWeak,
      ]),
    ],

    completedSkillIds: [
      ...new Set(
        completedSkillIds
      ),
    ],

    assessmentCount:
      assessments.length,
  };
}


// =========================================================
// GENERATE FROM SESSION
// =========================================================

export function generateRoadmapForSession(
  session: RoadmapEngineSession,
  existingAssessments: SkillAssessment[] = [],
  completedSkillIds: string[] = []
): RoadmapEngineSession {
  const diagnosticAssessments =
    session.diagnosticResult
      ? diagnosticToSkillAssessments(
          session.diagnosticResult
        )
      : [];

  const allAssessments =
    mergeSkillAssessments(
      diagnosticAssessments,
      existingAssessments
    );

  const analysis =
    analyzeLearner(
      session.profile,
      session.diagnosticResult,
      allAssessments,
      completedSkillIds
    );

  const generationResult =
    generatePersonalizedRoadmap({
      profile:
        session.profile,

      assessments:
        allAssessments,

      strongSkillIds:
        analysis.strongSkillIds,

      weakSkillIds:
        analysis.weakSkillIds,

      completedSkillIds:
        analysis.completedSkillIds,
    });

  return {
    ...session,

    roadmap:
      generationResult.roadmap,

    generationResult,
  };
}


// =========================================================
// ONE-SHOT ROADMAP CREATION
// =========================================================

export function createPersonalizedRoadmap(
  profile: RoadmapProfile,
  answers?: AssessmentAnswer[],
  existingAssessments: SkillAssessment[] = [],
  completedSkillIds: string[] = []
): RoadmapEngineResult {
  let session =
    createRoadmapSession(
      profile
    );

  if (answers) {
    session =
      runDiagnosticAssessment(
        session,
        answers
      );
  }

  session =
    generateRoadmapForSession(
      session,
      existingAssessments,
      completedSkillIds
    );

  if (
    !session.roadmap ||
    !session.generationResult
  ) {
    throw new Error(
      "Roadmap generation failed."
    );
  }

  return {
    roadmap:
      session.roadmap,

    generation:
      session.generationResult,

    diagnostic:
      session.diagnosticResult,
  };
}


// =========================================================
// ADD / UPDATE MASTERY
// =========================================================

export function recordSkillMastery(
  roadmap: PersonalizedRoadmapData,
  skillId: string,
  input: MasteryInput
): PersonalizedRoadmapData {
  const newAssessment =
    createSkillAssessment(
      skillId,
      input
    );

  const existingIndex =
    roadmap.assessments.findIndex(
      (assessment) =>
        assessment.skillId ===
        skillId
    );

  const assessments = [
    ...roadmap.assessments,
  ];

  if (existingIndex >= 0) {
    assessments[
      existingIndex
    ] = newAssessment;
  } else {
    assessments.push(
      newAssessment
    );
  }

  return {
    ...roadmap,

    assessments,

    updatedAt:
      new Date().toISOString(),
  };
}


// =========================================================
// MERGE ASSESSMENTS
// Later assessments override older assessments.
// =========================================================

export function mergeSkillAssessments(
  ...groups: SkillAssessment[][]
): SkillAssessment[] {
  const map =
    new Map<
      string,
      SkillAssessment
    >();

  for (const group of groups) {
    for (
      const assessment
      of group
    ) {
      const existing =
        map.get(
          assessment.skillId
        );

      if (!existing) {
        map.set(
          assessment.skillId,
          assessment
        );

        continue;
      }

      const existingTime =
        new Date(
          existing.assessedAt
        ).getTime();

      const candidateTime =
        new Date(
          assessment.assessedAt
        ).getTime();

      if (
        candidateTime >=
        existingTime
      ) {
        map.set(
          assessment.skillId,
          assessment
        );
      }
    }
  }

  return [
    ...map.values(),
  ];
}


// =========================================================
// ROADMAP LOOKUPS
// =========================================================

export function getCurrentRoadmapDay(
  roadmap: PersonalizedRoadmapData
) {
  for (const week of roadmap.weeks) {
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


export function getRoadmapDay(
  roadmap: PersonalizedRoadmapData,
  dayNumber: number
) {
  for (const week of roadmap.weeks) {
    const day =
      week.days.find(
        (candidate) =>
          candidate.dayNumber ===
          dayNumber
      );

    if (day) {
      return day;
    }
  }

  return undefined;
}


// =========================================================
// ROADMAP STATISTICS
// =========================================================

export function getRoadmapEngineSummary(
  roadmap: PersonalizedRoadmapData
) {
  const summary =
    getRoadmapSummary(
      roadmap
    );

  const completedDays =
    roadmap.weeks.reduce(
      (total, week) =>
        total +
        week.days.filter(
          (day) =>
            day.completed
        ).length,
      0
    );

  const totalAssessments =
    roadmap.assessments.length;

  const strongSkills =
    getStrongSkillIds(
      roadmap.assessments
    );

  const weakSkills =
    getWeakSkillIds(
      roadmap.assessments
    );

  return {
    ...summary,

    completedDays,

    remainingDays:
      Math.max(
        0,
        roadmap.totalDays -
          completedDays
      ),

    totalAssessments,

    strongSkills,

    weakSkills,

    overallProgress:
      roadmap.overallProgress,
  };
}


// =========================================================
// CAN LEARNER MOVE FORWARD?
// =========================================================

export function canContinueRoadmap(
  roadmap: PersonalizedRoadmapData
): boolean {
  if (
    roadmap.totalDays === 0
  ) {
    return false;
  }

  if (
    roadmap.overallProgress >= 100
  ) {
    return false;
  }

  return (
    roadmap.currentDay <=
    roadmap.totalDays
  );
}