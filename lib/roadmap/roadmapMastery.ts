import type {
  MasteryBreakdown,
  SkillAssessment,
} from "../../types/roadmap";


// =========================================================
// MASTERY TYPES
// =========================================================

export type MasteryStatus =
  | "strong"
  | "good"
  | "needs-practice"
  | "relearn";


export interface MasteryInput {
  conceptScore?: number;

  codingScore?: number;

  assignmentScore?: number;

  quizScore?: number;

  debuggingScore?: number;
}


export interface MasteryWeights {
  concept: number;

  coding: number;

  assignment: number;

  quiz: number;

  debugging: number;
}


export interface MasteryResult {
  breakdown: MasteryBreakdown;

  status: MasteryStatus;

  passed: boolean;

  weakestAreas: MasteryArea[];

  strongestAreas: MasteryArea[];

  recommendation: string;
}


export type MasteryArea =
  | "concept"
  | "coding"
  | "assignment"
  | "quiz"
  | "debugging";


// =========================================================
// DEFAULT WEIGHTS
// =========================================================

export const DEFAULT_MASTERY_WEIGHTS: MasteryWeights = {
  concept: 0.2,

  coding: 0.3,

  assignment: 0.2,

  quiz: 0.15,

  debugging: 0.15,
};


// =========================================================
// THRESHOLDS
// =========================================================

export const STRONG_MASTERY_SCORE = 85;

export const GOOD_MASTERY_SCORE = 70;

export const PRACTICE_MASTERY_SCORE = 50;


// =========================================================
// HELPERS
// =========================================================

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, score)
  );
}


function normalizeWeights(
  weights: MasteryWeights
): MasteryWeights {
  const total =
    weights.concept +
    weights.coding +
    weights.assignment +
    weights.quiz +
    weights.debugging;

  if (total <= 0) {
    return DEFAULT_MASTERY_WEIGHTS;
  }

  return {
    concept:
      weights.concept / total,

    coding:
      weights.coding / total,

    assignment:
      weights.assignment / total,

    quiz:
      weights.quiz / total,

    debugging:
      weights.debugging / total,
  };
}


// =========================================================
// STATUS
// =========================================================

export function getMasteryStatus(
  score: number
): MasteryStatus {
  const safeScore =
    clampScore(score);

  if (
    safeScore >=
    STRONG_MASTERY_SCORE
  ) {
    return "strong";
  }

  if (
    safeScore >=
    GOOD_MASTERY_SCORE
  ) {
    return "good";
  }

  if (
    safeScore >=
    PRACTICE_MASTERY_SCORE
  ) {
    return "needs-practice";
  }

  return "relearn";
}


// =========================================================
// MASTERY CALCULATION
// =========================================================

export function calculateMastery(
  input: MasteryInput,
  weights: MasteryWeights =
    DEFAULT_MASTERY_WEIGHTS
): MasteryBreakdown {
  const normalizedWeights =
    normalizeWeights(weights);

  const conceptScore =
    clampScore(
      input.conceptScore ?? 0
    );

  const codingScore =
    clampScore(
      input.codingScore ?? 0
    );

  const assignmentScore =
    clampScore(
      input.assignmentScore ?? 0
    );

  const quizScore =
    clampScore(
      input.quizScore ?? 0
    );

  const debuggingScore =
    clampScore(
      input.debuggingScore ?? 0
    );

  const overallScore =
    conceptScore *
      normalizedWeights.concept +
    codingScore *
      normalizedWeights.coding +
    assignmentScore *
      normalizedWeights.assignment +
    quizScore *
      normalizedWeights.quiz +
    debuggingScore *
      normalizedWeights.debugging;

  return {
    conceptScore,

    codingScore,

    assignmentScore,

    quizScore,

    debuggingScore,

    overallScore:
      Math.round(
        overallScore * 100
      ) / 100,
  };
}


// =========================================================
// AREA ANALYSIS
// =========================================================

function getAreaScores(
  mastery: MasteryBreakdown
): Array<{
  area: MasteryArea;
  score: number;
}> {
  return [
    {
      area: "concept",
      score:
        mastery.conceptScore,
    },

    {
      area: "coding",
      score:
        mastery.codingScore,
    },

    {
      area: "assignment",
      score:
        mastery.assignmentScore,
    },

    {
      area: "quiz",
      score:
        mastery.quizScore,
    },

    {
      area: "debugging",
      score:
        mastery.debuggingScore,
    },
  ];
}


export function getWeakestAreas(
  mastery: MasteryBreakdown,
  count = 2
): MasteryArea[] {
  return getAreaScores(mastery)
    .sort(
      (a, b) =>
        a.score - b.score
    )
    .slice(
      0,
      Math.max(0, count)
    )
    .map(
      (item) => item.area
    );
}


export function getStrongestAreas(
  mastery: MasteryBreakdown,
  count = 2
): MasteryArea[] {
  return getAreaScores(mastery)
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(
      0,
      Math.max(0, count)
    )
    .map(
      (item) => item.area
    );
}


// =========================================================
// RECOMMENDATION
// =========================================================

export function getMasteryRecommendation(
  mastery: MasteryBreakdown
): string {
  const status =
    getMasteryStatus(
      mastery.overallScore
    );

  const weakest =
    getWeakestAreas(
      mastery,
      2
    );

  if (status === "strong") {
    return (
      "Strong mastery. Continue to the next skill while keeping short revision checkpoints."
    );
  }

  if (status === "good") {
    return (
      `Good understanding. Continue, but add short practice for ${weakest.join(
        " and "
      )}.`
    );
  }

  if (
    status ===
    "needs-practice"
  ) {
    return (
      `More practice is recommended before progressing. Focus on ${weakest.join(
        " and "
      )}.`
    );
  }

  return (
    `Relearn the core concept and complete guided practice before progressing. Prioritize ${weakest.join(
      " and "
    )}.`
  );
}


// =========================================================
// COMPLETE MASTERY RESULT
// =========================================================

export function evaluateMastery(
  input: MasteryInput,
  weights?: MasteryWeights
): MasteryResult {
  const breakdown =
    calculateMastery(
      input,
      weights
    );

  const status =
    getMasteryStatus(
      breakdown.overallScore
    );

  return {
    breakdown,

    status,

    passed:
      breakdown.overallScore >=
      GOOD_MASTERY_SCORE,

    weakestAreas:
      getWeakestAreas(
        breakdown
      ),

    strongestAreas:
      getStrongestAreas(
        breakdown
      ),

    recommendation:
      getMasteryRecommendation(
        breakdown
      ),
  };
}


// =========================================================
// SKILL ASSESSMENT
// =========================================================

export function createSkillAssessment(
  skillId: string,
  input: MasteryInput,
  weights?: MasteryWeights
): SkillAssessment {
  const result =
    evaluateMastery(
      input,
      weights
    );

  return {
    skillId,

    score:
      result.breakdown
        .overallScore,

    mastery:
      result.breakdown,

    assessedAt:
      new Date().toISOString(),
  };
}


// =========================================================
// UPDATE EXISTING ASSESSMENT
// =========================================================

export function updateSkillAssessment(
  assessment: SkillAssessment,
  input: MasteryInput,
  weights?: MasteryWeights
): SkillAssessment {
  const result =
    evaluateMastery(
      input,
      weights
    );

  return {
    ...assessment,

    score:
      result.breakdown
        .overallScore,

    mastery:
      result.breakdown,

    assessedAt:
      new Date().toISOString(),
  };
}


// =========================================================
// ASSESSMENT LOOKUP
// =========================================================

export function getSkillAssessment(
  assessments: SkillAssessment[],
  skillId: string
): SkillAssessment | undefined {
  return assessments.find(
    (assessment) =>
      assessment.skillId ===
      skillId
  );
}


// =========================================================
// STRONG / WEAK SKILL HELPERS
// =========================================================

export function getStrongSkillIds(
  assessments: SkillAssessment[]
): string[] {
  return assessments
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


export function getWeakSkillIds(
  assessments: SkillAssessment[]
): string[] {
  return assessments
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


// =========================================================
// PROGRESSION DECISION
// =========================================================

export function canProgressFromSkill(
  assessment:
    | SkillAssessment
    | undefined
): boolean {
  if (!assessment) {
    return false;
  }

  return (
    assessment.mastery
      .overallScore >=
    GOOD_MASTERY_SCORE
  );
}


export function needsSkillRevision(
  assessment:
    | SkillAssessment
    | undefined
): boolean {
  if (!assessment) {
    return true;
  }

  return (
    assessment.mastery
      .overallScore <
    GOOD_MASTERY_SCORE
  );
}