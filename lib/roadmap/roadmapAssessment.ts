import {
  assessmentQuestions,
  getQuestionsForLevel,
} from "../../data/roadmap/quizzes";

import type {
  AssessmentQuestion,
} from "../../data/roadmap/quizzes";

import type {
  LearningLevel,
} from "../../types/roadmap";


// =========================================================
// ANSWER FROM USER
// =========================================================

export interface AssessmentAnswer {
  questionId: string;

  selectedAnswer: number;
}


// =========================================================
// RESULT FOR ONE SKILL
// =========================================================

export interface SkillAssessmentResult {
  skillId: string;

  earnedPoints: number;

  totalPoints: number;

  percentage: number;

  status:
    | "strong"
    | "good"
    | "needs-practice"
    | "relearn";
}


// =========================================================
// COMPLETE ASSESSMENT RESULT
// =========================================================

export interface RoadmapAssessmentResult {
  totalEarnedPoints: number;

  totalPossiblePoints: number;

  percentage: number;

  skillResults: SkillAssessmentResult[];

  strongSkillIds: string[];

  weakSkillIds: string[];

  recommendedStartingLevel:
    LearningLevel;
}


// =========================================================
// SCORE → STATUS
// =========================================================

export function getMasteryStatus(
  percentage: number
): SkillAssessmentResult["status"] {
  if (percentage >= 85) {
    return "strong";
  }

  if (percentage >= 70) {
    return "good";
  }

  if (percentage >= 50) {
    return "needs-practice";
  }

  return "relearn";
}


// =========================================================
// QUESTIONS FOR INITIAL ASSESSMENT
// =========================================================

export function buildInitialAssessment(
  selfReportedLevel: LearningLevel
): AssessmentQuestion[] {
  return getQuestionsForLevel(
    selfReportedLevel
  );
}


// =========================================================
// ASSESS ONE SKILL
// =========================================================

function assessSkill(
  skillId: string,
  questions: AssessmentQuestion[],
  answers: AssessmentAnswer[]
): SkillAssessmentResult {
  const skillQuestions =
    questions.filter(
      (question) =>
        question.skillId === skillId
    );

  const totalPoints =
    skillQuestions.reduce(
      (total, question) =>
        total + question.points,
      0
    );

  let earnedPoints = 0;

  for (const question of skillQuestions) {
    const answer = answers.find(
      (candidate) =>
        candidate.questionId ===
        question.id
    );

    if (
      answer &&
      answer.selectedAnswer ===
        question.correctAnswer
    ) {
      earnedPoints += question.points;
    }
  }

  const percentage =
    totalPoints === 0
      ? 0
      : Math.round(
          (earnedPoints /
            totalPoints) *
            100
        );

  return {
    skillId,

    earnedPoints,

    totalPoints,

    percentage,

    status:
      getMasteryStatus(percentage),
  };
}


// =========================================================
// DETERMINE RECOMMENDED STARTING LEVEL
// =========================================================

export function determineRecommendedLevel(
  percentage: number
): LearningLevel {
  if (percentage >= 85) {
    return "advanced";
  }

  if (percentage >= 60) {
    return "intermediate";
  }

  return "beginner";
}


// =========================================================
// COMPLETE ASSESSMENT
// =========================================================

export function evaluateAssessment(
  questions: AssessmentQuestion[],
  answers: AssessmentAnswer[]
): RoadmapAssessmentResult {
  const skillIds = Array.from(
    new Set(
      questions.map(
        (question) =>
          question.skillId
      )
    )
  );

  const skillResults =
    skillIds.map((skillId) =>
      assessSkill(
        skillId,
        questions,
        answers
      )
    );

  const totalPossiblePoints =
    questions.reduce(
      (total, question) =>
        total + question.points,
      0
    );

  let totalEarnedPoints = 0;

  for (const question of questions) {
    const answer = answers.find(
      (candidate) =>
        candidate.questionId ===
        question.id
    );

    if (
      answer &&
      answer.selectedAnswer ===
        question.correctAnswer
    ) {
      totalEarnedPoints +=
        question.points;
    }
  }

  const percentage =
    totalPossiblePoints === 0
      ? 0
      : Math.round(
          (totalEarnedPoints /
            totalPossiblePoints) *
            100
        );

  const strongSkillIds =
    skillResults
      .filter(
        (result) =>
          result.status ===
            "strong" ||
          result.status ===
            "good"
      )
      .map(
        (result) =>
          result.skillId
      );

  const weakSkillIds =
    skillResults
      .filter(
        (result) =>
          result.status ===
            "needs-practice" ||
          result.status ===
            "relearn"
      )
      .map(
        (result) =>
          result.skillId
      );

  return {
    totalEarnedPoints,

    totalPossiblePoints,

    percentage,

    skillResults,

    strongSkillIds,

    weakSkillIds,

    recommendedStartingLevel:
      determineRecommendedLevel(
        percentage
      ),
  };
}


// =========================================================
// QUICK HELPER FOR ALL QUESTIONS
// Useful during development/testing.
// =========================================================

export function getAllAssessmentQuestions():
  AssessmentQuestion[] {
  return assessmentQuestions;
}