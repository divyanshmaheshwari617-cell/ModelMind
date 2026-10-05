import type {
  LessonContent,
} from "../../../types/roadmap";

import {
  createCurriculumLessons,
} from "./lessonFactory";

// =========================================================
// GENERATED CURRICULUM LESSONS
// =========================================================
//
// lessonFactory already resolves:
//
// curriculum skill
//        ↓
// deepLessonRegistry
//        ↓
// deep lesson content
//        ↓
// fallback content only when deep content is unavailable
//
// Deep-content coverage is currently 100%, therefore this
// registry should use the generated curriculum lessons as
// the single source of truth.
//
// The older pythonLessons registry is intentionally not
// merged here because it would override the newer deep
// Python curriculum content.
// =========================================================

export const lessonRegistry:
  LessonContent[] =
  createCurriculumLessons();

// =========================================================
// LOOKUP
// =========================================================

export function getLessonBySkillId(
  skillId: string
): LessonContent | undefined {
  return lessonRegistry.find(
    (lesson) =>
      lesson.skillId === skillId
  );
}

// =========================================================
// HELPERS
// =========================================================

export function hasLessonForSkill(
  skillId: string
): boolean {
  return lessonRegistry.some(
    (lesson) =>
      lesson.skillId === skillId
  );
}

export function getLessonById(
  lessonId: string
): LessonContent | undefined {
  return lessonRegistry.find(
    (lesson) =>
      lesson.id === lessonId
  );
}

export function getAllLessons():
  LessonContent[] {
  return lessonRegistry;
}