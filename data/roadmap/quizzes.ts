import type {
  LearningLevel,
  TopicDifficulty,
} from "../../types/roadmap";

export interface AssessmentQuestion {
  id: string;

  skillId: string;

  level: LearningLevel;

  difficulty: TopicDifficulty;

  question: string;

  options: string[];

  correctAnswer: number;

  explanation: string;

  points: number;
}


// =========================================================
// PYTHON
// =========================================================

const pythonQuestions: AssessmentQuestion[] = [
  // ---------------------------------------------------------
  // PYTHON BASICS
  // ---------------------------------------------------------

  {
    id: "python-basics-q1",
    skillId: "python-basics",
    level: "beginner",
    difficulty: "basic",
    question:
      "Which operator checks whether two Python values are equal?",
    options: [
      "=",
      "==",
      "!=",
      ":=",
    ],
    correctAnswer: 1,
    explanation:
      "== compares two values for equality, while = performs assignment.",
    points: 10,
  },

  {
    id: "python-basics-q2",
    skillId: "python-basics",
    level: "beginner",
    difficulty: "basic",
    question:
      "Which Python statement is used to make a decision based on a condition?",
    options: [
      "if",
      "import",
      "def",
      "return",
    ],
    correctAnswer: 0,
    explanation:
      "An if statement executes code conditionally.",
    points: 10,
  },

  // ---------------------------------------------------------
  // DATA STRUCTURES
  // ---------------------------------------------------------

  {
    id: "python-data-structures-q1",
    skillId: "python-data-structures",
    level: "beginner",
    difficulty: "basic",
    question:
      "Which Python data structure stores key-value pairs?",
    options: [
      "List",
      "Tuple",
      "Dictionary",
      "Set",
    ],
    correctAnswer: 2,
    explanation:
      "A dictionary stores information as key-value pairs.",
    points: 10,
  },

  {
    id: "python-data-structures-q2",
    skillId: "python-data-structures",
    level: "beginner",
    difficulty: "basic",
    question:
      "Which collection is useful when you want unique values?",
    options: [
      "List",
      "Set",
      "String",
      "Tuple only",
    ],
    correctAnswer: 1,
    explanation:
      "A set stores unique elements.",
    points: 10,
  },

  // ---------------------------------------------------------
  // FUNCTIONS
  // ---------------------------------------------------------

  {
    id: "python-functions-q1",
    skillId: "python-functions",
    level: "beginner",
    difficulty: "basic",
    question:
      "What is the main purpose of a Python function?",
    options: [
      "Only to print output",
      "To create reusable blocks of logic",
      "Only to create variables",
      "To install libraries",
    ],
    correctAnswer: 1,
    explanation:
      "Functions package reusable logic that can be called when needed.",
    points: 10,
  },

  {
    id: "python-functions-q2",
    skillId: "python-functions",
    level: "beginner",
    difficulty: "basic",
    question:
      "What does return normally do inside a Python function?",
    options: [
      "Deletes the function",
      "Sends a value back to the caller",
      "Imports a package",
      "Creates a loop",
    ],
    correctAnswer: 1,
    explanation:
      "return sends a result from the function back to the code that called it.",
    points: 10,
  },

  // ---------------------------------------------------------
  // PYTHON FOR DATA
  // ---------------------------------------------------------

  {
    id: "python-for-data-q1",
    skillId: "python-for-data",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "What is a list comprehension primarily useful for?",
    options: [
      "Creating or transforming a collection concisely",
      "Installing Python",
      "Training every ML model",
      "Opening a database automatically",
    ],
    correctAnswer: 0,
    explanation:
      "List comprehensions provide a concise way to create lists using iteration and optional conditions.",
    points: 10,
  },

  {
    id: "python-for-data-q2",
    skillId: "python-for-data",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "You have a list of scores and want only values greater than 50. What operation are you performing?",
    options: [
      "Filtering",
      "Inheritance",
      "Compilation",
      "Serialization",
    ],
    correctAnswer: 0,
    explanation:
      "Selecting values that satisfy a condition is filtering.",
    points: 10,
  },

  // ---------------------------------------------------------
  // ERROR HANDLING
  // ---------------------------------------------------------

  {
    id: "python-error-q1",
    skillId: "python-error-handling",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "Which exception commonly occurs when int() receives text such as 'hello'?",
    options: [
      "ValueError",
      "ImportError",
      "KeyError",
      "IndexError",
    ],
    correctAnswer: 0,
    explanation:
      "int('hello') cannot convert that string into an integer and raises ValueError.",
    points: 10,
  },

  {
    id: "python-error-q2",
    skillId: "python-error-handling",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "Why is catching a specific exception generally better than silently catching every exception?",
    options: [
      "It makes Python execute without a CPU",
      "It helps handle expected failures without hiding unrelated bugs",
      "It prevents all errors permanently",
      "It automatically fixes incorrect code",
    ],
    correctAnswer: 1,
    explanation:
      "Specific exception handling makes expected failures manageable while allowing unrelated problems to remain visible.",
    points: 10,
  },

  // ---------------------------------------------------------
  // OOP
  // ---------------------------------------------------------

  {
    id: "python-oop-q1",
    skillId: "python-oop",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "What does __init__ commonly do in a Python class?",
    options: [
      "Initializes a new object's state",
      "Deletes every object",
      "Imports NumPy",
      "Runs cross-validation",
    ],
    correctAnswer: 0,
    explanation:
      "__init__ is commonly used to initialize instance attributes when an object is created.",
    points: 10,
  },

  {
    id: "python-oop-q2",
    skillId: "python-oop",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "Inside an instance method, what does self normally refer to?",
    options: [
      "The current object",
      "The Python interpreter",
      "The imported library",
      "Every object simultaneously",
    ],
    correctAnswer: 0,
    explanation:
      "self refers to the current instance on which the method is operating.",
    points: 10,
  },

  // ---------------------------------------------------------
  // ADVANCED PYTHON
  // ---------------------------------------------------------

  {
    id: "python-advanced-q1",
    skillId: "python-advanced",
    level: "advanced",
    difficulty: "advanced",
    question:
      "What is an important benefit of using a Python virtual environment for an ML project?",
    options: [
      "It isolates project dependencies",
      "It guarantees perfect model accuracy",
      "It replaces Git",
      "It automatically cleans datasets",
    ],
    correctAnswer: 0,
    explanation:
      "Virtual environments help isolate dependencies between projects.",
    points: 10,
  },

  {
    id: "python-advanced-q2",
    skillId: "python-advanced",
    level: "advanced",
    difficulty: "advanced",
    question:
      "What is a key characteristic of a Python generator?",
    options: [
      "It can yield values lazily instead of constructing the entire sequence at once",
      "It can only contain strings",
      "It automatically trains models",
      "It cannot be iterated",
    ],
    correctAnswer: 0,
    explanation:
      "Generators yield values as needed, which can reduce memory usage for large sequences.",
    points: 10,
  },
];


// =========================================================
// NUMPY
// =========================================================

const numpyQuestions: AssessmentQuestion[] = [
  {
    id: "numpy-q1",

    skillId: "numpy-foundation",

    level: "beginner",

    difficulty: "basic",

    question:
      "Which attribute tells you the dimensions of a NumPy array?",

    options: [
      "array.type",
      "array.shape",
      "array.columns",
      "array.keys",
    ],

    correctAnswer: 1,

    explanation:
      "The shape attribute describes the size of each array dimension.",

    points: 10,
  },

  {
    id: "numpy-q2",

    skillId: "numpy-foundation",

    level: "intermediate",

    difficulty: "intermediate",

    question:
      "Why are NumPy vectorized operations commonly preferred over manually looping through every element?",

    options: [
      "They always use less memory",
      "They are generally more efficient and concise",
      "Python loops cannot process numbers",
      "They automatically train ML models",
    ],

    correctAnswer: 1,

    explanation:
      "NumPy performs many numerical operations using optimized vectorized implementations.",

    points: 10,
  },
];


// =========================================================
// PANDAS
// =========================================================

const pandasQuestions: AssessmentQuestion[] = [
  {
    id: "pandas-q1",

    skillId: "pandas-foundation",

    level: "beginner",

    difficulty: "basic",

    question:
      "Which Pandas function is commonly used to load a CSV file?",

    options: [
      "pd.open_csv()",
      "pd.read_csv()",
      "pd.load_csv()",
      "pd.csv()",
    ],

    correctAnswer: 1,

    explanation:
      "pd.read_csv() loads CSV data into a Pandas DataFrame.",

    points: 10,
  },

  {
    id: "pandas-q2",

    skillId: "pandas-foundation",

    level: "beginner",

    difficulty: "basic",

    question:
      "Which expression can count missing values in each DataFrame column?",

    options: [
      "df.empty()",
      "df.isnull().sum()",
      "df.describe().null()",
      "df.dropna().countnull()",
    ],

    correctAnswer: 1,

    explanation:
      "isnull() identifies missing entries and sum() counts them column-wise.",

    points: 10,
  },
];


// =========================================================
// BASIC PREPROCESSING
// =========================================================

const basicPreprocessingQuestions: AssessmentQuestion[] = [
  {
    id: "basic-preprocessing-q1",

    skillId: "basic-data-cleaning",

    level: "beginner",

    difficulty: "basic",

    question:
      "Which Pandas method can directly replace missing values?",

    options: [
      "fillna()",
      "predict()",
      "fit()",
      "groupby()",
    ],

    correctAnswer: 0,

    explanation:
      "fillna() can replace missing values using a chosen value or strategy.",

    points: 10,
  },

  {
    id: "basic-preprocessing-q2",

    skillId: "basic-data-cleaning",

    level: "intermediate",

    difficulty: "intermediate",

    question:
      "Why may categorical text such as Delhi, Mumbai and Pune require encoding before being passed to many machine-learning models?",

    options: [
      "Models can only use CSV files",
      "Many models require numerical feature representations",
      "Encoding removes every missing value",
      "Encoding automatically balances the dataset",
    ],

    correctAnswer: 1,

    explanation:
      "Many ML estimators expect numerical feature representations rather than raw category strings.",

    points: 10,
  },
];
// =========================================================
// EDA FOUNDATION
// =========================================================

const edaQuestions: AssessmentQuestion[] = [
  {
    id: "eda-q1",
    skillId: "eda-foundation",
    level: "beginner",
    difficulty: "basic",
    question:
      "Which Pandas method provides summary statistics such as count, mean, standard deviation and quartiles for numerical columns?",
    options: [
      "describe()",
      "predict()",
      "fit()",
      "compile()",
    ],
    correctAnswer: 0,
    explanation:
      "describe() provides useful descriptive statistics for numerical DataFrame columns.",
    points: 10,
  },

  {
    id: "eda-q2",
    skillId: "eda-foundation",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "What is the main purpose of exploratory data analysis?",
    options: [
      "Only to create attractive graphs",
      "To understand structure, distributions, relationships and potential data problems before modeling",
      "To guarantee high model accuracy",
      "To replace preprocessing completely",
    ],
    correctAnswer: 1,
    explanation:
      "EDA helps understand the dataset and discover patterns or problems that influence later decisions.",
    points: 10,
  },
];


// =========================================================
// DATA VISUALIZATION
// =========================================================

const visualizationQuestions: AssessmentQuestion[] = [
  {
    id: "visualization-q1",
    skillId: "data-visualization",
    level: "beginner",
    difficulty: "basic",
    question:
      "Which plot is commonly useful for examining the distribution of one numerical feature?",
    options: [
      "Histogram",
      "Pie chart only",
      "Database table",
      "Confusion matrix",
    ],
    correctAnswer: 0,
    explanation:
      "A histogram shows how numerical observations are distributed across ranges.",
    points: 10,
  },

  {
    id: "visualization-q2",
    skillId: "data-visualization",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "Which visualization is useful for examining the relationship between two numerical variables?",
    options: [
      "Scatter plot",
      "Count plot",
      "Text box",
      "File explorer",
    ],
    correctAnswer: 0,
    explanation:
      "A scatter plot displays paired numerical observations and helps reveal relationships or patterns.",
    points: 10,
  },

  {
    id: "visualization-q3",
    skillId: "data-visualization",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "Why might a box plot be useful during EDA?",
    options: [
      "It can reveal distribution spread and potential outliers",
      "It automatically removes missing values",
      "It trains a classifier",
      "It converts categories into numbers",
    ],
    correctAnswer: 0,
    explanation:
      "Box plots summarize distributions and can highlight potentially unusual observations.",
    points: 10,
  },
];


// =========================================================
// ADVANCED DATA CLEANING
// =========================================================

const advancedCleaningQuestions: AssessmentQuestion[] = [
  {
    id: "advanced-cleaning-q1",
    skillId: "advanced-data-cleaning",
    level: "intermediate",
    difficulty: "intermediate",
    question:
      "Why might median imputation be preferred to mean imputation for a heavily skewed numerical feature?",
    options: [
      "The median is generally less influenced by extreme values",
      "The median always increases accuracy",
      "Mean cannot be calculated in Python",
      "Median automatically removes duplicates",
    ],
    correctAnswer: 0,
    explanation:
      "The median is more robust to extreme values than the mean.",
    points: 10,
  },

  {
    id: "advanced-cleaning-q2",
    skillId: "advanced-data-cleaning",
    level: "advanced",
    difficulty: "advanced",
    question:
      "Why can fitting an imputer on the complete dataset before the train/test split cause a problem?",
    options: [
      "Information from the test data can influence preprocessing",
      "The CSV file becomes too small",
      "Python cannot use an imputer before splitting",
      "It automatically causes underfitting",
    ],
    correctAnswer: 0,
    explanation:
      "Learning preprocessing statistics from the full dataset allows information from the test set to influence the training workflow, creating leakage.",
    points: 10,
  },
];


// =========================================================
// ADVANCED EDA
// =========================================================

const advancedEDAQuestions: AssessmentQuestion[] = [
  {
    id: "advanced-eda-q1",
    skillId: "advanced-eda",
    level: "advanced",
    difficulty: "advanced",
    question:
      "Two features have a very strong correlation. What should you conclude?",
    options: [
      "One definitely causes the other",
      "They have a strong statistical relationship that deserves investigation, but correlation alone does not prove causation",
      "Both features must immediately be deleted",
      "The model will definitely achieve perfect accuracy",
    ],
    correctAnswer: 1,
    explanation:
      "Correlation indicates association, not proof of causation.",
    points: 10,
  },

  {
    id: "advanced-eda-q2",
    skillId: "advanced-eda",
    level: "advanced",
    difficulty: "advanced",
    question:
      "A feature almost perfectly reveals the target but would not actually be available when making a real prediction. What should you investigate?",
    options: [
      "Possible target leakage",
      "Only the plot color",
      "Python indentation",
      "Whether the CSV has a header",
    ],
    correctAnswer: 0,
    explanation:
      "A feature containing information unavailable at prediction time may create target leakage.",
    points: 10,
  },

  {
    id: "advanced-eda-q3",
    skillId: "advanced-eda",
    level: "advanced",
    difficulty: "advanced",
    question:
      "Why should class distribution be inspected before evaluating a classifier?",
    options: [
      "Strong imbalance can make some metrics such as accuracy misleading when viewed alone",
      "Class distribution changes Python syntax",
      "It removes the need for a test set",
      "It automatically chooses the model",
    ],
    correctAnswer: 0,
    explanation:
      "With severe class imbalance, high accuracy can occur even when the minority class is predicted poorly.",
    points: 10,
  },
];

// =========================================================
// ML FOUNDATIONS
// =========================================================

const mlFoundationQuestions: AssessmentQuestion[] = [
  {
    id: "ml-q1",

    skillId: "ml-foundations",

    level: "beginner",

    difficulty: "basic",

    question:
      "In supervised learning, what is the target variable?",

    options: [
      "The value the model tries to predict",
      "The Python library being used",
      "The number of rows",
      "The training algorithm name",
    ],

    correctAnswer: 0,

    explanation:
      "The target is the output the supervised model learns to predict.",

    points: 10,
  },

  {
    id: "ml-q2",

    skillId: "ml-foundations",

    level: "intermediate",

    difficulty: "intermediate",

    question:
      "A model performs extremely well on training data but poorly on unseen data. What is the most likely problem?",

    options: [
      "Underfitting",
      "Overfitting",
      "Encoding",
      "Normalization",
    ],

    correctAnswer: 1,

    explanation:
      "Overfitting occurs when a model learns the training data too specifically and fails to generalize well.",

    points: 10,
  },
];


// =========================================================
// TRAIN / TEST
// =========================================================

const evaluationQuestions: AssessmentQuestion[] = [
  {
    id: "evaluation-q1",

    skillId: "train-test-evaluation",

    level: "beginner",

    difficulty: "basic",

    question:
      "Why do we keep a test set separate from the training data?",

    options: [
      "To make the dataset larger",
      "To evaluate performance on unseen data",
      "To remove every outlier",
      "To encode categorical variables",
    ],

    correctAnswer: 1,

    explanation:
      "A separate test set provides evidence of how the trained model behaves on unseen examples.",

    points: 10,
  },
];


// =========================================================
// LOGISTIC REGRESSION
// =========================================================

const logisticQuestions: AssessmentQuestion[] = [
  {
    id: "logistic-q1",

    skillId: "logistic-regression",

    level: "intermediate",

    difficulty: "intermediate",

    question:
      "Logistic Regression is commonly used for which type of problem?",

    options: [
      "Classification",
      "Sorting",
      "Database indexing",
      "Image resizing",
    ],

    correctAnswer: 0,

    explanation:
      "Logistic Regression is commonly used as a classification model.",

    points: 10,
  },

  {
    id: "logistic-q2",

    skillId: "advanced-classification-evaluation",

    level: "advanced",

    difficulty: "advanced",

    question:
      "If false negatives are especially costly, which metric often deserves close attention?",

    options: [
      "Recall",
      "File size",
      "Training row count",
      "Number of features only",
    ],

    correctAnswer: 0,

    explanation:
      "Recall measures how many actual positive cases were successfully identified.",

    points: 10,
  },
];


// =========================================================
// DECISION TREES
// =========================================================

const treeQuestions: AssessmentQuestion[] = [
  {
    id: "tree-q1",

    skillId: "decision-tree",

    level: "intermediate",

    difficulty: "intermediate",

    question:
      "What does max_depth control in a decision tree?",

    options: [
      "Maximum number of dataset columns",
      "Maximum depth of the tree",
      "Maximum number of CSV files",
      "Maximum number of predictions",
    ],

    correctAnswer: 1,

    explanation:
      "max_depth limits how many levels the tree may grow.",

    points: 10,
  },

  {
    id: "tree-q2",

    skillId: "random-forest",

    level: "intermediate",

    difficulty: "intermediate",

    question:
      "A Random Forest primarily combines multiple:",

    options: [
      "Decision trees",
      "CSV files",
      "Linear equations only",
      "Databases",
    ],

    correctAnswer: 0,

    explanation:
      "Random Forest is an ensemble built from multiple decision trees.",

    points: 10,
  },
];


// =========================================================
// ADVANCED PREPROCESSING
// =========================================================

const advancedPreprocessingQuestions: AssessmentQuestion[] = [
  {
    id: "advanced-preprocessing-q1",

    skillId: "advanced-preprocessing",

    level: "advanced",

    difficulty: "advanced",

    question:
      "What is the main purpose of ColumnTransformer?",

    options: [
      "Apply different transformations to different groups of columns",
      "Automatically choose the best ML model",
      "Download datasets",
      "Replace cross-validation",
    ],

    correctAnswer: 0,

    explanation:
      "ColumnTransformer allows different preprocessing operations to be applied to selected column groups.",

    points: 10,
  },

  {
    id: "advanced-preprocessing-q2",

    skillId: "advanced-preprocessing",

    level: "advanced",

    difficulty: "advanced",

    question:
      "Why is a scikit-learn Pipeline useful?",

    options: [
      "It connects preprocessing and model steps into a repeatable workflow",
      "It converts Python into Java",
      "It removes the need for evaluation",
      "It guarantees perfect accuracy",
    ],

    correctAnswer: 0,

    explanation:
      "Pipeline chains transformations and an estimator so the workflow can be fitted and applied consistently.",

    points: 10,
  },
];


// =========================================================
// CROSS VALIDATION
// =========================================================

const crossValidationQuestions: AssessmentQuestion[] = [
  {
    id: "cv-q1",

    skillId: "cross-validation",

    level: "advanced",

    difficulty: "advanced",

    question:
      "What is a major reason for using cross-validation?",

    options: [
      "Evaluate performance across multiple data splits",
      "Increase the number of features automatically",
      "Convert classification into regression",
      "Remove all preprocessing",
    ],

    correctAnswer: 0,

    explanation:
      "Cross-validation provides performance measurements across multiple training and validation splits.",

    points: 10,
  },
];


// =========================================================
// HYPERPARAMETER TUNING
// =========================================================

const tuningQuestions: AssessmentQuestion[] = [
  {
    id: "tuning-q1",

    skillId: "hyperparameter-tuning",

    level: "advanced",

    difficulty: "advanced",

    question:
      "What does GridSearchCV primarily do?",

    options: [
      "Systematically evaluates specified hyperparameter combinations using cross-validation",
      "Cleans every dataset automatically",
      "Creates new training examples",
      "Replaces the test set",
    ],

    correctAnswer: 0,

    explanation:
      "GridSearchCV evaluates combinations from a specified parameter grid using cross-validation.",

    points: 10,
  },
];


// =========================================================
// COMPLETE QUESTION BANK
// =========================================================

export const assessmentQuestions: AssessmentQuestion[] = [
  // Python
  ...pythonQuestions,

  // Data foundations
  ...numpyQuestions,
  ...pandasQuestions,

  // Cleaning + EDA
  ...basicPreprocessingQuestions,
  ...edaQuestions,
  ...visualizationQuestions,
  ...advancedCleaningQuestions,
  ...advancedEDAQuestions,

  // Machine Learning
  ...mlFoundationQuestions,
  ...evaluationQuestions,
  ...logisticQuestions,
  ...treeQuestions,
  ...advancedPreprocessingQuestions,
  ...crossValidationQuestions,
  ...tuningQuestions,
];

// =========================================================
// HELPERS
// =========================================================

export function getQuestionsForLevel(
  level: LearningLevel
): AssessmentQuestion[] {
  if (level === "advanced") {
    return assessmentQuestions;
  }

  if (level === "intermediate") {
    return assessmentQuestions.filter(
      (question) =>
        question.level !== "advanced"
    );
  }

  return assessmentQuestions.filter(
    (question) =>
      question.level === "beginner"
  );
}


export function getQuestionsForSkill(
  skillId: string
): AssessmentQuestion[] {
  return assessmentQuestions.filter(
    (question) =>
      question.skillId === skillId
  );
}