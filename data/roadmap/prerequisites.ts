export const prerequisiteGraph: Record<
  string,
  string[]
> = {
  // =====================================================
  // PYTHON
  // =====================================================

  "python-basics": [],

  "python-data-structures": [
    "python-basics",
  ],

  "python-functions": [
    "python-basics",
    "python-data-structures",
  ],

  "python-for-data": [
    "python-data-structures",
    "python-functions",
  ],

  "python-error-handling": [
    "python-functions",
  ],

  "python-oop": [
    "python-functions",
  ],

  "python-advanced": [
    "python-for-data",
    "python-error-handling",
    "python-oop",
  ],

  // =====================================================
  // NUMPY + PANDAS
  // =====================================================

  "numpy-foundation": [
    "python-data-structures",
    "python-functions",
  ],

  "pandas-foundation": [
    "python-data-structures",
    "python-functions",
  ],

  // =====================================================
  // DATA CLEANING + EDA
  // =====================================================

  "basic-data-cleaning": [
    "pandas-foundation",
  ],

  "eda-foundation": [
    "pandas-foundation",
    "basic-data-cleaning",
  ],

  "data-visualization": [
    "pandas-foundation",
    "eda-foundation",
  ],

  "statistics-foundation": [
    "numpy-foundation",
  ],

  "advanced-data-cleaning": [
    "basic-data-cleaning",
    "eda-foundation",
  ],

  "advanced-eda": [
    "eda-foundation",
    "data-visualization",
    "statistics-foundation",
  ],

  // =====================================================
  // MACHINE LEARNING FOUNDATION
  // =====================================================

  "ml-foundations": [
    "pandas-foundation",
    "statistics-foundation",
  ],

  "train-test-evaluation": [
    "ml-foundations",
  ],

  // =====================================================
  // SUPERVISED LEARNING
  // =====================================================

  "linear-regression": [
    "ml-foundations",
    "train-test-evaluation",
  ],

  "logistic-regression": [
    "ml-foundations",
    "train-test-evaluation",
  ],

  "knn": [
    "train-test-evaluation",
  ],

  "naive-bayes": [
    "statistics-foundation",
    "ml-foundations",
  ],

  "decision-tree": [
    "ml-foundations",
    "train-test-evaluation",
  ],

  "random-forest": [
    "decision-tree",
  ],

  "svm": [
    "logistic-regression",
    "train-test-evaluation",
  ],

  // =====================================================
  // UNSUPERVISED LEARNING
  // =====================================================

  "kmeans": [
    "numpy-foundation",
    "eda-foundation",
    "ml-foundations",
  ],

  "pca": [
    "numpy-foundation",
    "statistics-foundation",
    "advanced-eda",
  ],

  // =====================================================
  // PREPROCESSING + FEATURE ENGINEERING
  // =====================================================

  "advanced-preprocessing": [
    "advanced-data-cleaning",
    "ml-foundations",
  ],

  "feature-engineering": [
    "advanced-data-cleaning",
    "advanced-eda",
    "ml-foundations",
  ],

  // =====================================================
  // VALIDATION
  // =====================================================

  "cross-validation": [
    "train-test-evaluation",
  ],

  // =====================================================
  // BOOSTING
  // =====================================================

  "gradient-boosting": [
    "decision-tree",
    "random-forest",
  ],

  "xgboost": [
    "gradient-boosting",
  ],

  // =====================================================
  // MODEL IMPROVEMENT
  // =====================================================

  "hyperparameter-tuning": [
    "cross-validation",
  ],

  "advanced-classification-evaluation": [
    "logistic-regression",
  ],

  "imbalanced-learning": [
    "advanced-classification-evaluation",
  ],

  // =====================================================
  // MODEL UNDERSTANDING
  // =====================================================

  "model-interpretability": [
    "random-forest",
    "advanced-eda",
  ],

  // =====================================================
  // ML ENGINEERING
  // =====================================================

  "experiment-tracking": [
    "hyperparameter-tuning",
  ],
};


export function getPrerequisites(
  skillId: string
): string[] {
  return prerequisiteGraph[
    skillId
  ] ?? [];
}


export function hasPrerequisites(
  skillId: string
): boolean {
  return (
    getPrerequisites(
      skillId
    ).length > 0
  );
}


export function arePrerequisitesCompleted(
  skillId: string,
  completedSkillIds: string[]
): boolean {
  const prerequisites =
    getPrerequisites(
      skillId
    );

  return prerequisites.every(
    (prerequisite) =>
      completedSkillIds.includes(
        prerequisite
      )
  );
}