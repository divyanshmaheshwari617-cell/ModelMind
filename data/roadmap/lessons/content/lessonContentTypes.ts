import type {
  LessonContent,
  LessonPracticeProblem,
} from "../../../../types/roadmap";


// =========================================================
// DEEP LESSON CONTENT
// =========================================================
//
// IMPORTANT:
//
// This interface contains EDUCATIONAL CONTENT ONLY.
//
// It must not contain:
//
// - learner progress
// - activity completion
// - practice completion state
// - assignment state
// - quiz state
// - weak-topic state
// - roadmap persistence state
//
// All new advanced fields reuse the canonical LessonContent
// types from types/roadmap.ts so that we do not duplicate
// model-content type definitions.
// =========================================================

export interface DeepLessonContent {
  overview?: string;

  objectives?: string[];

  sections?:
    LessonContent["sections"];

  codeExamples?:
    LessonContent["codeExamples"];

  practice?:
    LessonPracticeProblem[];

  commonMistakes?:
    LessonContent["commonMistakes"];

  keyTakeaways?: string[];

  visualization?:
    LessonContent["visualization"];


  // =======================================================
  // ADVANCED EDUCATIONAL CONTENT
  // =======================================================

  /*
   * Overall intended depth of the lesson.
   *
   * Examples:
   * foundation
   * detailed
   * deep
   * expert
   */
  contentDepth?:
    LessonContent["contentDepth"];


  /*
   * Maximum-depth ML model content.
   *
   * Contains:
   * - motivation
   * - intuition
   * - training process
   * - prediction process
   * - mathematics
   * - objective functions
   * - assumptions
   * - parameters
   * - data requirements
   * - bias / variance
   * - complexity
   * - tuning
   * - comparisons
   * - failure modes
   * - applications
   * - interview questions
   * - exam notes
   *
   * It contains NO learner progress.
   */
  modelDeepDive?:
    LessonContent["modelDeepDive"];


  /*
   * Useful for both ML-model lessons and
   * non-model lessons where assumptions matter.
   */
  assumptions?:
    LessonContent["assumptions"];


  /*
   * Real-world use cases for the concept.
   */
  realWorldApplications?:
    LessonContent[
      "realWorldApplications"
    ];


  /*
   * Interview-oriented conceptual questions.
   */
  interviewQuestions?:
    LessonContent[
      "interviewQuestions"
    ];


  /*
   * College/exam-oriented revision content.
   */
  examNotes?:
    LessonContent["examNotes"];
}


// =========================================================
// MASTER DEEP-LESSON REGISTRY TYPE
// =========================================================

export type DeepLessonRegistry = Record<
  string,
  DeepLessonContent
>;