import type {
  LearningLevel,
  RoadmapGoal,
} from "../../types/roadmap";

export type CurriculumMode =
  | "academic"
  | "practical"
  | "industry";

export interface RoadmapTemplate {
  id: string;
  name: string;
  description: string;
  goal: RoadmapGoal;
  recommendedLevel: LearningLevel;
  curriculumMode: CurriculumMode;
  recommendedWeeks: number;
  minimumMinutesPerDay: number;
  skillPath: string[];
  extensionSkillPath?: string[];
  projectIds: string[];
  extensionProjectIds?: string[];
  focusAreas: string[];
}


// =========================================================
// COLLEGE / ACADEMIC
// =========================================================

const collegeTemplate: RoadmapTemplate = {
  id: "college-academic",

  name: "College ML Roadmap",

  description:
    "A structured academic machine-learning path covering Python, data analysis, preprocessing, core machine-learning algorithms, evaluation, labs, exams and viva preparation.",

  goal: "college",

  recommendedLevel: "beginner",

  curriculumMode: "academic",

  recommendedWeeks: 8,

  minimumMinutesPerDay: 60,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",

    // Data libraries
    "numpy-foundation",
    "pandas-foundation",

    // Data understanding
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",

    // Statistics + ML foundations
    "statistics-foundation",
    "ml-foundations",
    "gradient-descent",
    "train-test-evaluation",
    "bias-variance",

    // Essential preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",

    // Regression
    "linear-regression",
    "polynomial-regression",
    "regularization",

    // Classification
    "logistic-regression",
    "knn",
    "naive-bayes",
    "decision-tree",
    "random-forest",
    "svm",

    // Unsupervised learning
    "kmeans",
    "clustering-evaluation",
  ],

  projectIds: [
    "student-performance-analyzer",
    "house-price-predictor",
    "college-ml-final-project",
  ],

  focusAreas: [
    "Python fundamentals",
    "NumPy",
    "Pandas",
    "Data cleaning",
    "Exploratory data analysis",
    "Matplotlib",
    "Seaborn",
    "Statistics",
    "ML foundations",
    "Bias and variance",
    "Missing values",
    "Categorical encoding",
    "Feature scaling",
    "Regression",
    "Classification",
    "Clustering",
    "Model evaluation",
    "Exam preparation",
    "Viva preparation",
    "Model labs",
  ],
};


// =========================================================
// ML ENGINEER
// =========================================================

const mlEngineerTemplate: RoadmapTemplate = {
  id: "ml-engineer",

  name: "ML Engineer Roadmap",

  description:
    "An industry-oriented machine-learning engineering path covering Python, data preparation, leakage prevention, preprocessing pipelines, classical ML, ensemble learning, validation, tuning, explainability and reproducible experimentation.",

  goal: "ml-engineer",

  recommendedLevel: "intermediate",

  curriculumMode: "industry",

  recommendedWeeks: 8,

  minimumMinutesPerDay: 90,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",
    "python-error-handling",

    // Data
    "numpy-foundation",
    "pandas-foundation",

    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",

    // ML foundations
    "statistics-foundation",
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "data-leakage",
    "bias-variance",

    // Preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",
    "outlier-handling",

    // Regression
    "linear-regression",
    "polynomial-regression",
    "regularization",

    // Classification
    "logistic-regression",
    "knn",
    "naive-bayes",
    "decision-tree",
    "random-forest",
    "svm",

    // Unsupervised learning
    "kmeans",
    "clustering-evaluation",

    // Engineering foundations
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "cross-validation",
  ],

  extensionSkillPath: [
    // Advanced Python
    "python-oop",
    "python-advanced",

    // Advanced data
    "advanced-data-cleaning",
    "advanced-eda",

    // Feature engineering
    "feature-engineering",
    "feature-selection",

    // Dimensionality reduction
    "pca",

    // Ensemble learning
    "ensemble-learning",
    "bagging",
    "boosting-foundations",
    "gradient-boosting",
    "xgboost",
    "voting-stacking",

    // Evaluation + optimization
    "hyperparameter-tuning",
    "learning-curves",
    "advanced-classification-evaluation",
    "calibration-thresholding",
    "imbalanced-learning",
    "model-selection",

    // Explainability
    "model-interpretability",
    "shap-explainability",

    // Engineering workflow
    "experiment-tracking",
    "complete-ml-workflow",
  ],

  projectIds: [
    "student-performance-analyzer",
    "customer-churn-predictor",
  ],

  extensionProjectIds: [
    "production-ml-pipeline",
  ],

  focusAreas: [
    "Advanced Python for ML",
    "NumPy and Pandas",
    "Data quality",
    "EDA",
    "Data leakage prevention",
    "Missing-value handling",
    "Categorical encoding",
    "Feature scaling",
    "Outlier handling",
    "Reusable preprocessing",
    "Pipeline",
    "ColumnTransformer",
    "SimpleImputer",
    "Feature engineering",
    "Feature selection",
    "Classical machine learning",
    "Clustering",
    "PCA",
    "Cross-validation",
    "Ensemble learning",
    "Bagging",
    "Boosting",
    "Gradient Boosting",
    "XGBoost",
    "Voting and stacking",
    "Hyperparameter tuning",
    "Learning curves",
    "Imbalanced learning",
    "Probability calibration",
    "Model selection",
    "Model interpretability",
    "SHAP",
    "Experiment tracking",
    "Reproducibility",
    "End-to-end ML workflows",
  ],
};


// =========================================================
// DATA SCIENTIST
// =========================================================

const dataScientistTemplate: RoadmapTemplate = {
  id: "data-scientist",

  name: "Data Scientist Roadmap",

  description:
    "A comprehensive data-science roadmap covering Python, statistics, data cleaning, EDA, preprocessing, supervised and unsupervised learning, ensembles, evaluation, feature engineering and explainability.",

  goal: "data-scientist",

  recommendedLevel: "intermediate",

  curriculumMode: "practical",

  recommendedWeeks: 8,

  minimumMinutesPerDay: 90,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",
    "python-error-handling",

    // Data libraries
    "numpy-foundation",
    "pandas-foundation",

    // Data preparation
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",
    "advanced-data-cleaning",

    // Statistics + advanced EDA
    "statistics-foundation",
    "advanced-eda",

    // ML foundations
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "data-leakage",
    "bias-variance",

    // Preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",
    "outlier-handling",

    // Regression
    "linear-regression",
    "polynomial-regression",
    "regularization",

    // Classification
    "logistic-regression",
    "knn",
    "naive-bayes",
    "decision-tree",
    "random-forest",
    "svm",

    // Unsupervised learning
    "kmeans",
    "clustering-evaluation",
    "pca",

    // Feature preparation
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "feature-engineering",
    "feature-selection",

    // Validation
    "cross-validation",

    // Ensemble learning
    "ensemble-learning",
    "bagging",
    "boosting-foundations",
    "gradient-boosting",
    "xgboost",
    "voting-stacking",

    // Evaluation + improvement
    "hyperparameter-tuning",
    "learning-curves",
    "advanced-classification-evaluation",
    "calibration-thresholding",
    "imbalanced-learning",
    "model-selection",

    // Explainability
    "model-interpretability",
    "shap-explainability",
  ],

  projectIds: [
    "student-performance-analyzer",
    "house-price-predictor",
    "customer-churn-predictor",
  ],

  focusAreas: [
    "Python for data science",
    "NumPy",
    "Pandas",
    "Data cleaning",
    "Data quality",
    "EDA",
    "Matplotlib",
    "Seaborn",
    "Statistics",
    "Data leakage",
    "Bias and variance",
    "Preprocessing",
    "Feature engineering",
    "Feature selection",
    "Regression",
    "Classification",
    "Clustering",
    "PCA",
    "Ensemble learning",
    "Gradient Boosting",
    "XGBoost",
    "Cross-validation",
    "Hyperparameter tuning",
    "Learning curves",
    "Model selection",
    "Advanced evaluation",
    "Imbalanced datasets",
    "Probability calibration",
    "Model interpretability",
    "SHAP",
    "Communicating insights",
  ],
};


// =========================================================
// DATA ANALYST
// =========================================================

const dataAnalystTemplate: RoadmapTemplate = {
  id: "data-analyst",

  name: "Data Analyst Roadmap",

  description:
    "A data-analysis focused path emphasizing Python, NumPy, Pandas, data cleaning, exploratory analysis, statistics, visualization and introductory clustering.",

  goal: "data-analyst",

  recommendedLevel: "beginner",

  curriculumMode: "practical",

  recommendedWeeks: 7,

  minimumMinutesPerDay: 60,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",

    // Data libraries
    "numpy-foundation",
    "pandas-foundation",

    // Cleaning + EDA
    "basic-data-cleaning",
    "missing-value-handling",
    "eda-foundation",
    "data-visualization",

    // Statistics
    "statistics-foundation",

    // Advanced analysis
    "advanced-data-cleaning",
    "outlier-handling",
    "advanced-eda",

    // Introductory ML
"ml-foundations",
"kmeans",
"clustering-evaluation",
  ],

  projectIds: [
    "student-performance-analyzer",
    "data-analysis-project",
  ],

  focusAreas: [
    "Python for data analysis",
    "NumPy",
    "Pandas",
    "Data cleaning",
    "Missing-value analysis",
    "Outlier analysis",
    "Data exploration",
    "Matplotlib",
    "Seaborn",
    "Statistics",
    "Correlation analysis",
    "K-Means clustering",
    "Finding insights",
    "Communicating observations",
  ],
};


// =========================================================
// AI ENGINEER
// =========================================================

const aiEngineerTemplate: RoadmapTemplate = {
  id: "ai-engineer",

  name: "AI Engineer Foundation Roadmap",

  description:
    "Build strong Python, data, classical machine-learning and ML-engineering foundations before progressing into broader AI engineering.",

  goal: "ai-engineer",

  recommendedLevel: "intermediate",

  curriculumMode: "industry",

  recommendedWeeks: 8,

  minimumMinutesPerDay: 90,

  skillPath: [
    // Python engineering
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",
    "python-error-handling",
    "python-oop",
    "python-advanced",

    // Data
    "numpy-foundation",
    "pandas-foundation",
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",
    "advanced-data-cleaning",
    "statistics-foundation",
    "advanced-eda",

    // ML foundations
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "data-leakage",
    "bias-variance",

    // Preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",
    "outlier-handling",

    // Regression
    "linear-regression",
    "polynomial-regression",
    "regularization",

    // Classification
    "logistic-regression",
    "knn",
    "naive-bayes",
    "decision-tree",
    "random-forest",
    "svm",

    // Unsupervised ML
    "kmeans",
    "clustering-evaluation",
    "pca",

    // Feature engineering + preprocessing
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "feature-engineering",
    "feature-selection",

    // Validation
    "cross-validation",

    // Ensembles
    "ensemble-learning",
    "bagging",
    "boosting-foundations",
    "gradient-boosting",
    "xgboost",
    "voting-stacking",

    // Evaluation + optimization
    "hyperparameter-tuning",
    "learning-curves",
    "advanced-classification-evaluation",
    "calibration-thresholding",
    "imbalanced-learning",
    "model-selection",

    // Explainability
    "model-interpretability",
    "shap-explainability",

    // Engineering
    "experiment-tracking",
    "complete-ml-workflow",
  ],

  projectIds: [
    "customer-churn-predictor",
    "production-ml-pipeline",
  ],

  focusAreas: [
    "Advanced Python",
    "NumPy",
    "Pandas",
    "Data understanding",
    "EDA",
    "Statistics",
    "Data leakage prevention",
    "Strong ML foundations",
    "Classical ML algorithms",
    "Unsupervised learning",
    "PCA",
    "Feature engineering",
    "Feature selection",
    "Pipeline",
    "ColumnTransformer",
    "Cross-validation",
    "Ensemble learning",
    "Gradient Boosting",
    "XGBoost",
    "Hyperparameter tuning",
    "Advanced evaluation",
    "Model selection",
    "Model interpretation",
    "SHAP",
    "Experiment tracking",
    "Engineering practices",
    "Reproducibility",
    "Complete ML workflow",
  ],
};


// =========================================================
// DEEP LEARNING PREPARATION
// =========================================================

const deepLearningTemplate: RoadmapTemplate = {
  id: "deep-learning",

  name: "Deep Learning Preparation Roadmap",

  description:
    "Build Python, numerical, data, statistical and machine-learning foundations required before entering deep learning.",

  goal: "deep-learning",

  recommendedLevel: "intermediate",

  curriculumMode: "industry",

  recommendedWeeks: 8,

  minimumMinutesPerDay: 90,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",
    "python-error-handling",
    "python-oop",

    // Numerical computing
    "numpy-foundation",
    "pandas-foundation",

    // Data
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",

    // Statistics
    "statistics-foundation",

    // ML foundations
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "data-leakage",
    "bias-variance",

    // Preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",

    // Classical models
    "linear-regression",
    "logistic-regression",
    "knn",
    "svm",

    // Dimensionality reduction
    "pca",

    // Reliable preprocessing/evaluation
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "cross-validation",
  ],

  projectIds: [
    "ml-foundation-project",
  ],

  focusAreas: [
    "Python",
    "NumPy",
    "Numerical computing",
    "Pandas",
    "Data preparation",
    "EDA",
    "Statistics",
    "ML fundamentals",
    "Data leakage",
    "Bias and variance",
    "Feature scaling",
    "Regression",
    "Classification",
    "SVM",
    "PCA",
    "Preprocessing pipelines",
    "Optimization intuition",
    "Model evaluation",
  ],
};


// =========================================================
// PLACEMENT
// =========================================================

const placementTemplate: RoadmapTemplate = {
  id: "placement",

  name: "ML Placement Preparation",

  description:
    "A placement-oriented roadmap balancing Python, data handling, ML concepts, common algorithms, preprocessing, evaluation, coding and interview-style revision.",

  goal: "placement",

  recommendedLevel: "intermediate",

  curriculumMode: "practical",

  recommendedWeeks: 7,

  minimumMinutesPerDay: 75,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",

    // Data
    "numpy-foundation",
    "pandas-foundation",
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",

    // Statistics
    "statistics-foundation",

    // ML foundation
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "bias-variance",

    // Basic preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",

    // Common interview algorithms
    "linear-regression",
    "logistic-regression",
    "knn",
    "naive-bayes",
    "decision-tree",
    "random-forest",
    "svm",

    // Unsupervised
    "kmeans",

    // Practical ML
    "advanced-preprocessing",
    "cross-validation",
  ],

  projectIds: [
    "house-price-predictor",
    "customer-churn-predictor",
  ],

  focusAreas: [
    "Python interview preparation",
    "NumPy and Pandas",
    "Data handling",
    "EDA",
    "Bias and variance",
    "Preprocessing",
    "Linear regression",
    "Logistic regression",
    "KNN",
    "Naive Bayes",
    "Decision trees",
    "Random forests",
    "SVM",
    "K-Means",
    "Cross-validation",
    "Common ML interview questions",
    "Coding",
    "Model evaluation",
    "Project explanation",
  ],
};


// =========================================================
// HACKATHON
// =========================================================

const hackathonTemplate: RoadmapTemplate = {
  id: "hackathon",

  name: "ML Hackathon Roadmap",

  description:
    "A project-oriented path focused on quickly understanding datasets, preventing leakage, building reliable preprocessing, creating strong baselines, engineering features and improving models systematically.",

  goal: "hackathon",

  recommendedLevel: "intermediate",

  curriculumMode: "practical",

  recommendedWeeks: 6,

  minimumMinutesPerDay: 90,

  skillPath: [
    // Python + data
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",

    "numpy-foundation",
    "pandas-foundation",

    // Dataset understanding
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",
    "advanced-data-cleaning",
    "statistics-foundation",
    "advanced-eda",

    // ML foundations
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "data-leakage",

    // Preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",
    "outlier-handling",

    // Baseline models
    "logistic-regression",
    "decision-tree",
    "random-forest",

    // Feature work
    "feature-engineering",
    "feature-selection",

    // Ensembles
    "ensemble-learning",
    "boosting-foundations",
    "gradient-boosting",
    "xgboost",

    // Reliable engineering/evaluation
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "cross-validation",
    "hyperparameter-tuning",
    "advanced-classification-evaluation",
    "imbalanced-learning",
    "model-selection",
  ],

  projectIds: [
    "hackathon-baseline-project",
    "customer-churn-predictor",
  ],

  focusAreas: [
    "Fast dataset understanding",
    "Pandas",
    "Data cleaning",
    "EDA",
    "Data leakage prevention",
    "Missing values",
    "Categorical encoding",
    "Feature scaling",
    "Feature engineering",
    "Feature selection",
    "Baseline models",
    "Random Forest",
    "Ensemble learning",
    "Gradient Boosting",
    "XGBoost",
    "Pipeline",
    "ColumnTransformer",
    "Cross-validation",
    "Hyperparameter tuning",
    "Imbalanced datasets",
    "Model comparison",
    "Model selection",
    "Presentation",
  ],
};


// =========================================================
// PROJECT-BASED LEARNING
// =========================================================

const projectTemplate: RoadmapTemplate = {
  id: "project",

  name: "Project-Based ML Roadmap",

  description:
    "Learn machine learning by progressively building increasingly complete projects from raw data through preprocessing, modeling, evaluation, improvement and interpretation.",

  goal: "project",

  recommendedLevel: "beginner",

  curriculumMode: "practical",

  recommendedWeeks: 8,

  minimumMinutesPerDay: 75,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",

    // Data
    "numpy-foundation",
    "pandas-foundation",

    // Analysis
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",
    "statistics-foundation",

    // ML foundations
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "data-leakage",
    "bias-variance",

    // Preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",

    // Core algorithms
    "linear-regression",
    "polynomial-regression",
    "regularization",
    "logistic-regression",
    "knn",
    "decision-tree",
    "random-forest",

    // Real-world data work
    "advanced-data-cleaning",
    "advanced-eda",
    "advanced-preprocessing",
    "pipeline-column-transformer",
    "feature-engineering",

    // Validation
    "cross-validation",

    // Advanced models
    "ensemble-learning",
    "gradient-boosting",
    "xgboost",

    // Improvement
    "hyperparameter-tuning",
    "model-selection",

    // Interpretation
    "model-interpretability",

    // Final workflow
    "complete-ml-workflow",
  ],

  projectIds: [
    "student-performance-analyzer",
    "house-price-predictor",
    "customer-churn-predictor",
    "end-to-end-ml-project",
  ],

  focusAreas: [
    "Learning by building",
    "Python",
    "NumPy",
    "Pandas",
    "Dataset understanding",
    "Data cleaning",
    "EDA",
    "Visualization",
    "Statistics",
    "Leakage prevention",
    "Preprocessing",
    "Pipeline",
    "ColumnTransformer",
    "Feature engineering",
    "Model training",
    "Model comparison",
    "Ensemble learning",
    "Gradient Boosting",
    "XGBoost",
    "Cross-validation",
    "Hyperparameter tuning",
    "Model selection",
    "Model interpretation",
    "Complete ML workflow",
    "Project explanation",
  ],
};


// =========================================================
// CUSTOM
// =========================================================

const customTemplate: RoadmapTemplate = {
  id: "custom",

  name: "Custom ML Roadmap",

  description:
    "A flexible machine-learning roadmap that can be adapted to the learner's objective, existing knowledge, assessment results and preferred depth.",

  goal: "custom",

  recommendedLevel: "beginner",

  curriculumMode: "practical",

  recommendedWeeks: 8,

  minimumMinutesPerDay: 60,

  skillPath: [
    // Python
    "python-basics",
    "python-data-structures",
    "python-functions",
    "python-for-data",

    // Data
    "numpy-foundation",
    "pandas-foundation",

    // Data understanding
    "basic-data-cleaning",
    "eda-foundation",
    "data-visualization",

    // Statistics
    "statistics-foundation",

    // ML foundations
    "ml-foundations",
    "gradient-descent",

    "train-test-evaluation",
    "bias-variance",

    // Essential preprocessing
    "missing-value-handling",
    "categorical-encoding",
    "feature-scaling",

    // Essential algorithms
    "linear-regression",
    "logistic-regression",
    "knn",
    "decision-tree",
    "random-forest",

    // Introductory unsupervised ML
    "kmeans",
  ],

  extensionSkillPath: [
    "python-oop",
    "python-advanced",

    "data-leakage",
    "outlier-handling",

    "polynomial-regression",
    "regularization",

    "naive-bayes",
    "svm",

    "advanced-data-cleaning",
    "advanced-eda",

    "clustering-evaluation",
    "pca",

    "advanced-preprocessing",
    "pipeline-column-transformer",

    "feature-engineering",
    "feature-selection",

    "cross-validation",

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

  projectIds: [
    "custom-final-project",
  ],

  focusAreas: [
    "Personalized learning",
    "Python",
    "NumPy",
    "Pandas",
    "Data analysis",
    "Data cleaning",
    "EDA",
    "Visualization",
    "Statistics",
    "Preprocessing",
    "Core ML knowledge",
    "Regression",
    "Classification",
    "Tree-based models",
    "Clustering",
    "Practice",
    "Projects",
    "Advanced ML extensions",
  ],
};


// =========================================================
// ALL TEMPLATES
// =========================================================

export const roadmapTemplates: RoadmapTemplate[] = [
  collegeTemplate,
  mlEngineerTemplate,
  dataScientistTemplate,
  dataAnalystTemplate,
  aiEngineerTemplate,
  deepLearningTemplate,
  placementTemplate,
  hackathonTemplate,
  projectTemplate,
  customTemplate,
];


// =========================================================
// HELPERS
// =========================================================

export function getRoadmapTemplate(
  goal: RoadmapGoal
): RoadmapTemplate {
  return (
    roadmapTemplates.find(
      (template) =>
        template.goal === goal
    ) ?? customTemplate
  );
}


export function getRecommendedWeeks(
  goal: RoadmapGoal
): number {
  return getRoadmapTemplate(
    goal
  ).recommendedWeeks;
}


export function getRecommendedMinutesPerDay(
  goal: RoadmapGoal
): number {
  return getRoadmapTemplate(
    goal
  ).minimumMinutesPerDay;
}