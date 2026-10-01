export type LearningLevel =
  | "Basic"
  | "Medium"
  | "Advanced";

export const LEARNING_LEVELS: LearningLevel[] = [
  "Basic",
  "Medium",
  "Advanced",
];

export const DEFAULT_LEARNING_LEVEL: LearningLevel =
  "Basic";

export const LEARNING_LEVEL_STORAGE_KEY =
  "modelmind-learning-level";

export function isLearningLevel(
  value: string | null
): value is LearningLevel {
  return (
    value === "Basic" ||
    value === "Medium" ||
    value === "Advanced"
  );
}