import type {
  RoadmapGoal,
  TopicDifficulty,
} from "../../types/roadmap";

export interface CurriculumProject {
  id: string;
  title: string;
  description: string;

  difficulty: TopicDifficulty;

  recommendedGoals: RoadmapGoal[];

  requiredSkills: string[];

  estimatedMinutes: number;

  objectives: string[];

  tasks: string[];

  deliverables: string[];

  bonusTasks?: string[];
}


// =========================================================
// 1. STUDENT PERFORMANCE ANALYZER
// =========================================================

const studentPerformanceAnalyzer: CurriculumProject = {
  id: "student-performance-analyzer",

  title: "Student Performance Analyzer",

  description:
    "Analyze a student dataset using Python, Pandas, NumPy and visualization to discover patterns in academic performance.",

  difficulty: "basic",

  recommendedGoals: [
    "college",
    "data-scientist",
    "data-analyst",
    "placement",
    "project",
    "custom",
  ],

  requiredSkills: [
    "python-basics",
    "numpy-foundation",
    "pandas-foundation",
    "basic-data-cleaning",
    "data-visualization",
  ],

  estimatedMinutes: 240,

  objectives: [
    "Practice loading and inspecting datasets",
    "Handle basic missing values",
    "Perform descriptive analysis",
    "Use filtering and grouping",
    "Create useful visualizations",
    "Explain observations from data",
  ],

  tasks: [
    "Load the student dataset using Pandas.",
    "Display the first 10 rows.",
    "Inspect column names and data types.",
    "Check for missing values.",
    "Handle missing values using an appropriate basic strategy.",
    "Calculate average marks.",
    "Find students scoring above 80.",
    "Group students by department or category.",
    "Create at least three useful visualizations.",
    "Write five observations based on the analysis.",
  ],

  deliverables: [
    "Completed notebook",
    "Cleaned dataset analysis",
    "At least three visualizations",
    "Five written observations",
  ],

  bonusTasks: [
    "Create a new performance category column.",
    "Compare average performance between groups.",
  ],
};


// =========================================================
// 2. HOUSE PRICE PREDICTOR
// =========================================================

const housePricePredictor: CurriculumProject = {
  id: "house-price-predictor",

  title: "House Price Predictor",

  description:
    "Build a regression model that predicts house prices from property features.",

  difficulty: "intermediate",

  recommendedGoals: [
    "college",
    "ml-engineer",
    "data-scientist",
    "placement",
    "project",
    "custom",
  ],

  requiredSkills: [
    "pandas-foundation",
    "data-visualization",
    "statistics-foundation",
    "ml-foundations",
    "train-test-evaluation",
    "linear-regression",
  ],

  estimatedMinutes: 360,

  objectives: [
    "Understand a regression problem",
    "Explore relationships between features",
    "Prepare features and target",
    "Train a regression model",
    "Generate predictions",
    "Evaluate regression performance",
  ],

  tasks: [
    "Load and inspect the housing dataset.",
    "Identify the target variable.",
    "Explore important numerical features.",
    "Check missing values.",
    "Create useful exploratory visualizations.",
    "Separate features and target.",
    "Create training and testing sets.",
    "Train a Linear Regression model.",
    "Generate predictions on the test set.",
    "Calculate Mean Squared Error.",
    "Calculate R squared.",
    "Explain what the evaluation results mean.",
  ],

  deliverables: [
    "Regression notebook",
    "EDA visualizations",
    "Trained regression model",
    "Evaluation results",
    "Short model-performance explanation",
  ],

  bonusTasks: [
    "Compare predicted prices with actual prices visually.",
    "Investigate which features appear most related to price.",
  ],
};


// =========================================================
// 3. CUSTOMER CHURN PREDICTOR
// =========================================================

const customerChurnPredictor: CurriculumProject = {
  id: "customer-churn-predictor",

  title: "Customer Churn Predictor",

  description:
    "Build and evaluate a classification model that predicts whether a customer is likely to leave a service.",

  difficulty: "intermediate",

  recommendedGoals: [
    "ml-engineer",
    "data-scientist",
    "ai-engineer",
    "placement",
    "hackathon",
    "project",
    "custom",
  ],

  requiredSkills: [
    "pandas-foundation",
    "ml-foundations",
    "train-test-evaluation",
    "logistic-regression",
  ],

  estimatedMinutes: 420,

  objectives: [
    "Understand binary classification",
    "Prepare numerical and categorical features",
    "Train a classification model",
    "Evaluate classification performance",
    "Understand false positives and false negatives",
  ],

  tasks: [
    "Load and inspect the customer dataset.",
    "Identify the churn target.",
    "Analyze class distribution.",
    "Inspect numerical and categorical features.",
    "Handle missing values.",
    "Encode categorical variables.",
    "Create training and testing sets.",
    "Train a Logistic Regression model.",
    "Generate predictions.",
    "Calculate accuracy.",
    "Create a confusion matrix.",
    "Calculate precision, recall and F1 score.",
    "Explain false positives and false negatives in the churn problem.",
  ],

  deliverables: [
    "Classification notebook",
    "Prepared dataset",
    "Trained classification model",
    "Confusion matrix",
    "Classification metrics",
    "Business interpretation",
  ],

  bonusTasks: [
    "Compare Logistic Regression with a Decision Tree.",
    "Investigate which errors would be more expensive for the business.",
  ],
};


// =========================================================
// 4. COLLEGE FINAL ML PROJECT
// =========================================================

const collegeMLFinalProject: CurriculumProject = {
  id: "college-ml-final-project",

  title: "College ML Final Project",

  description:
    "Complete an end-to-end academic machine-learning project using concepts commonly required in college labs, exams and viva.",

  difficulty: "intermediate",

  recommendedGoals: [
    "college",
  ],

  requiredSkills: [
    "basic-data-cleaning",
    "data-visualization",
    "ml-foundations",
    "train-test-evaluation",
    "linear-regression",
    "logistic-regression",
    "decision-tree",
  ],

  estimatedMinutes: 480,

  objectives: [
    "Apply the complete academic ML workflow",
    "Explain each major code step",
    "Compare multiple models",
    "Prepare for project viva questions",
  ],

  tasks: [
    "Select a suitable dataset.",
    "Define the problem statement.",
    "Load and inspect the dataset.",
    "Perform basic data cleaning.",
    "Perform exploratory data analysis.",
    "Prepare features and target.",
    "Split the dataset.",
    "Train at least two suitable models.",
    "Evaluate both models.",
    "Compare their metrics.",
    "Write a conclusion.",
    "Prepare ten viva questions about the project.",
  ],

  deliverables: [
    "Complete notebook",
    "Problem statement",
    "EDA",
    "Two trained models",
    "Model comparison",
    "Conclusion",
    "Viva preparation notes",
  ],
};


// =========================================================
// 5. DATA ANALYSIS PROJECT
// =========================================================

const dataAnalysisProject: CurriculumProject = {
  id: "data-analysis-project",

  title: "Exploratory Data Analysis Project",

  description:
    "Perform a structured exploratory analysis and communicate meaningful observations from a real dataset.",

  difficulty: "intermediate",

  recommendedGoals: [
    "data-analyst",
    "data-scientist",
    "project",
    "custom",
  ],

  requiredSkills: [
    "pandas-foundation",
    "basic-data-cleaning",
    "data-visualization",
    "statistics-foundation",
  ],

  estimatedMinutes: 360,

  objectives: [
    "Clean a real dataset",
    "Ask useful analytical questions",
    "Use statistics and visualization",
    "Communicate evidence-based observations",
  ],

  tasks: [
    "Choose a dataset.",
    "Define five analytical questions.",
    "Inspect and clean the dataset.",
    "Calculate descriptive statistics.",
    "Create at least five useful visualizations.",
    "Answer each analytical question using the data.",
    "Summarize the most important findings.",
  ],

  deliverables: [
    "Analysis notebook",
    "Five analytical questions",
    "Five or more visualizations",
    "Written findings",
  ],
};


// =========================================================
// 6. PRODUCTION-STYLE ML PIPELINE
// =========================================================

const productionMLPipeline: CurriculumProject = {
  id: "production-ml-pipeline",

  title: "Production-Style ML Pipeline",

  description:
    "Build a reusable machine-learning workflow using modern scikit-learn preprocessing and pipeline APIs.",

  difficulty: "advanced",

  recommendedGoals: [
    "ml-engineer",
    "ai-engineer",
    "data-scientist",
    "project",
    "custom",
  ],

  requiredSkills: [
    "advanced-preprocessing",
    "cross-validation",
    "hyperparameter-tuning",
    "advanced-classification-evaluation",
  ],

  estimatedMinutes: 600,

  objectives: [
    "Build reusable preprocessing",
    "Prevent common data leakage",
    "Combine preprocessing and modeling",
    "Evaluate with cross-validation",
    "Tune hyperparameters",
    "Create a reproducible workflow",
  ],

  tasks: [
    "Choose a mixed numerical and categorical dataset.",
    "Separate features and target before preprocessing.",
    "Identify numerical and categorical columns.",
    "Create a numerical preprocessing pipeline.",
    "Use SimpleImputer for missing numerical values.",
    "Use StandardScaler where appropriate.",
    "Create a categorical preprocessing pipeline.",
    "Use SimpleImputer for missing categorical values.",
    "Use OneHotEncoder for categorical features.",
    "Combine transformations using ColumnTransformer.",
    "Combine preprocessing and model using Pipeline.",
    "Evaluate the pipeline using cross-validation.",
    "Create a hyperparameter search space.",
    "Tune the model using GridSearchCV or RandomizedSearchCV.",
    "Evaluate the selected configuration on the test set.",
    "Document how the pipeline helps reduce leakage risk.",
  ],

  deliverables: [
    "Complete Pipeline implementation",
    "ColumnTransformer configuration",
    "Cross-validation results",
    "Hyperparameter tuning results",
    "Final test evaluation",
    "Short reproducibility explanation",
  ],

  bonusTasks: [
    "Compare two model families using the same preprocessing pipeline.",
    "Track both experiments in ModelMind.",
  ],
};


// =========================================================
// 7. ML FOUNDATION PROJECT
// =========================================================

const mlFoundationProject: CurriculumProject = {
  id: "ml-foundation-project",

  title: "ML Foundations Project",

  description:
    "Demonstrate the core machine-learning foundations required before moving toward deep learning.",

  difficulty: "intermediate",

  recommendedGoals: [
    "deep-learning",
    "ai-engineer",
  ],

  requiredSkills: [
    "numpy-foundation",
    "statistics-foundation",
    "ml-foundations",
    "train-test-evaluation",
    "linear-regression",
    "logistic-regression",
  ],

  estimatedMinutes: 420,

  objectives: [
    "Demonstrate numerical data handling",
    "Understand supervised learning",
    "Train regression and classification models",
    "Interpret model evaluation",
  ],

  tasks: [
    "Select one regression dataset.",
    "Train and evaluate a regression model.",
    "Select one classification dataset.",
    "Train and evaluate a classification model.",
    "Compare the evaluation approaches.",
    "Explain overfitting and generalization using the projects.",
  ],

  deliverables: [
    "Regression experiment",
    "Classification experiment",
    "Evaluation comparison",
    "Written learning summary",
  ],
};


// =========================================================
// 8. HACKATHON BASELINE PROJECT
// =========================================================

const hackathonBaselineProject: CurriculumProject = {
  id: "hackathon-baseline-project",

  title: "Rapid ML Baseline Challenge",

  description:
    "Practice converting an unfamiliar dataset into a reliable machine-learning baseline under limited time.",

  difficulty: "intermediate",

  recommendedGoals: [
    "hackathon",
    "project",
  ],

  requiredSkills: [
    "pandas-foundation",
    "data-visualization",
    "ml-foundations",
    "train-test-evaluation",
  ],

  estimatedMinutes: 300,

  objectives: [
    "Understand unfamiliar datasets quickly",
    "Choose an appropriate evaluation metric",
    "Create a baseline model",
    "Identify the next useful experiment",
  ],

  tasks: [
    "Inspect an unfamiliar dataset.",
    "Identify the target and problem type.",
    "Check missing values and class distribution.",
    "Choose an evaluation metric.",
    "Create a simple baseline.",
    "Evaluate the baseline.",
    "Identify three possible improvements.",
    "Implement one improvement.",
    "Compare the results.",
  ],

  deliverables: [
    "Baseline notebook",
    "Metric justification",
    "Baseline result",
    "Improved experiment",
    "Short comparison",
  ],
};


// =========================================================
// 9. END-TO-END ML PROJECT
// =========================================================

const endToEndMLProject: CurriculumProject = {
  id: "end-to-end-ml-project",

  title: "End-to-End Machine Learning Project",

  description:
    "Bring data understanding, preprocessing, modeling and evaluation together in one complete project.",

  difficulty: "advanced",

  recommendedGoals: [
    "ml-engineer",
    "data-scientist",
    "ai-engineer",
    "project",
    "custom",
  ],

  requiredSkills: [
    "pandas-foundation",
    "data-visualization",
    "statistics-foundation",
    "ml-foundations",
    "advanced-preprocessing",
    "cross-validation",
  ],

  estimatedMinutes: 720,

  objectives: [
    "Solve an ML problem from beginning to end",
    "Make justified modeling decisions",
    "Create a reusable workflow",
    "Evaluate results critically",
  ],

  tasks: [
    "Choose a real-world dataset.",
    "Define the problem and success metric.",
    "Perform data quality analysis.",
    "Perform exploratory data analysis.",
    "Create preprocessing logic.",
    "Build a baseline model.",
    "Evaluate the baseline.",
    "Build at least one alternative model.",
    "Use cross-validation.",
    "Improve the model systematically.",
    "Perform final test evaluation.",
    "Document limitations and possible improvements.",
  ],

  deliverables: [
    "Complete ML notebook",
    "EDA",
    "Preprocessing workflow",
    "Baseline model",
    "Alternative model",
    "Evaluation comparison",
    "Final conclusion",
  ],
};


// =========================================================
// 10. CUSTOM FINAL PROJECT
// =========================================================

const customFinalProject: CurriculumProject = {
  id: "custom-final-project",

  title: "Personalized Final ML Project",

  description:
    "Apply the skills from the personalized roadmap to a problem selected by the learner.",

  difficulty: "intermediate",

  recommendedGoals: [
    "custom",
  ],

  requiredSkills: [
    "ml-foundations",
    "train-test-evaluation",
  ],

  estimatedMinutes: 480,

  objectives: [
    "Apply learned concepts independently",
    "Build a complete ML workflow",
    "Explain technical decisions",
  ],

  tasks: [
    "Choose a problem.",
    "Select a dataset.",
    "Define the target.",
    "Prepare the data.",
    "Train a baseline model.",
    "Evaluate the model.",
    "Improve at least one part of the workflow.",
    "Explain the final results.",
  ],

  deliverables: [
    "Complete notebook",
    "Model evaluation",
    "Improvement experiment",
    "Final explanation",
  ],
};


// =========================================================
// PROJECT DATABASE
// =========================================================

export const curriculumProjects: CurriculumProject[] = [
  studentPerformanceAnalyzer,
  housePricePredictor,
  customerChurnPredictor,
  collegeMLFinalProject,
  dataAnalysisProject,
  productionMLPipeline,
  mlFoundationProject,
  hackathonBaselineProject,
  endToEndMLProject,
  customFinalProject,
];


// =========================================================
// HELPERS
// =========================================================

export function getProjectById(
  projectId: string
): CurriculumProject | undefined {
  return curriculumProjects.find(
    (project) => project.id === projectId
  );
}


export function getProjectsForGoal(
  goal: RoadmapGoal
): CurriculumProject[] {
  return curriculumProjects.filter(
    (project) =>
      project.recommendedGoals.includes(goal)
  );
}