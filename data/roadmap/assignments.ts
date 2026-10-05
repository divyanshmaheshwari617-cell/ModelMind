import type {
  LearningLevel,
  TopicDifficulty,
} from "../../types/roadmap";

export type AssignmentTaskType =
  | "concept"
  | "coding"
  | "debugging"
  | "analysis"
  | "experiment";

export interface AssignmentTask {
  id: string;

  title: string;

  description: string;

  type: AssignmentTaskType;

  points: number;

  starterCode?: string;

  expectedConcepts: string[];
}

export interface CurriculumAssignment {
  id: string;

  title: string;

  description: string;

  skillId: string;

  difficulty: TopicDifficulty;

  levels: LearningLevel[];

  estimatedMinutes: number;

  tasks: AssignmentTask[];

  hints: string[];

  learningObjectives: string[];

  passingScore: number;
}


// =========================================================
// PANDAS — BASIC
// =========================================================

const pandasBasicAssignment: CurriculumAssignment = {
  id: "pandas-basic-assignment",

  title: "Student Dataset Analysis",

  description:
    "Practice loading, inspecting, filtering and summarizing a dataset using Pandas.",

  skillId: "pandas-foundation",

  difficulty: "basic",

  levels: [
    "beginner",
  ],

  estimatedMinutes: 45,

  learningObjectives: [
    "Load CSV data",
    "Inspect a DataFrame",
    "Select columns",
    "Filter rows",
    "Calculate basic statistics",
  ],

  tasks: [
    {
      id: "pandas-basic-1",

      title: "Load the dataset",

      description:
        "Load students.csv into a Pandas DataFrame and display the first 10 rows.",

      type: "coding",

      points: 15,

      starterCode:
`import pandas as pd

# Load the dataset here
`,

      expectedConcepts: [
        "read_csv",
        "head",
      ],
    },

    {
      id: "pandas-basic-2",

      title: "Inspect missing values",

      description:
        "Find the number of missing values in each column.",

      type: "coding",

      points: 15,

      expectedConcepts: [
        "isnull",
        "sum",
      ],
    },

    {
      id: "pandas-basic-3",

      title: "Calculate average marks",

      description:
        "Calculate the average value of the Marks column.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "mean",
        "column selection",
      ],
    },

    {
      id: "pandas-basic-4",

      title: "Filter high-performing students",

      description:
        "Display students whose marks are greater than 80.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "boolean filtering",
      ],
    },

    {
      id: "pandas-basic-5",

      title: "Explain your findings",

      description:
        "Write two observations based on the dataset.",

      type: "analysis",

      points: 30,

      expectedConcepts: [
        "data interpretation",
      ],
    },
  ],

  hints: [
    "Start by inspecting the DataFrame with head().",
    "Use isnull() before trying to handle missing values.",
    "A condition inside square brackets can be used to filter rows.",
  ],

  passingScore: 70,
};


// =========================================================
// BASIC DATA CLEANING
// College-style preprocessing
// =========================================================

const basicCleaningAssignment: CurriculumAssignment = {
  id: "basic-cleaning-assignment",

  title: "Clean a Messy Student Dataset",

  description:
    "Practice direct Pandas preprocessing techniques before moving to reusable ML pipelines.",

  skillId: "basic-data-cleaning",

  difficulty: "basic",

  levels: [
    "beginner",
    "intermediate",
  ],

  estimatedMinutes: 60,

  learningObjectives: [
    "Detect missing values",
    "Fill numerical missing values",
    "Handle categorical data",
    "Remove duplicate rows",
  ],

  tasks: [
    {
      id: "cleaning-1",

      title: "Find missing values",

      description:
        "Display the number of missing values in every column.",

      type: "coding",

      points: 15,

      expectedConcepts: [
        "isnull",
        "sum",
      ],
    },

    {
      id: "cleaning-2",

      title: "Fill missing age values",

      description:
        "Replace missing Age values using the mean age.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "fillna",
        "mean",
      ],
    },

    {
      id: "cleaning-3",

      title: "Remove duplicates",

      description:
        "Check for and remove duplicate rows.",

      type: "coding",

      points: 15,

      expectedConcepts: [
        "duplicated",
        "drop_duplicates",
      ],
    },

    {
      id: "cleaning-4",

      title: "Encode a category",

      description:
        "Convert a categorical column into numerical form using a basic encoding technique.",

      type: "coding",

      points: 25,

      expectedConcepts: [
        "LabelEncoder",
        "get_dummies",
      ],
    },

    {
      id: "cleaning-5",

      title: "Explain preprocessing",

      description:
        "Explain why machine-learning models often require preprocessing.",

      type: "concept",

      points: 25,

      expectedConcepts: [
        "missing data",
        "categorical data",
        "model input",
      ],
    },
  ],

  hints: [
    "First determine which columns actually contain missing values.",
    "For a numerical column, think about mean or median replacement.",
    "Categorical text normally needs to be represented numerically before many ML models can use it.",
  ],

  passingScore: 70,
};


// =========================================================
// LINEAR REGRESSION
// =========================================================

const linearRegressionAssignment: CurriculumAssignment = {
  id: "linear-regression-assignment",

  title: "Build Your First Regression Model",

  description:
    "Train and evaluate a Linear Regression model on a small regression dataset.",

  skillId: "linear-regression",

  difficulty: "basic",

  levels: [
    "beginner",
    "intermediate",
  ],

  estimatedMinutes: 75,

  learningObjectives: [
    "Prepare regression features",
    "Train LinearRegression",
    "Generate predictions",
    "Evaluate regression output",
  ],

  tasks: [
    {
      id: "linear-1",

      title: "Prepare X and y",

      description:
        "Separate the feature columns from the numerical target.",

      type: "coding",

      points: 15,

      expectedConcepts: [
        "features",
        "target",
      ],
    },

    {
      id: "linear-2",

      title: "Split the dataset",

      description:
        "Create training and testing datasets.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "train_test_split",
      ],
    },

    {
      id: "linear-3",

      title: "Train the model",

      description:
        "Create and fit a LinearRegression model.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "LinearRegression",
        "fit",
      ],
    },

    {
      id: "linear-4",

      title: "Evaluate predictions",

      description:
        "Generate test predictions and calculate MSE and R squared.",

      type: "coding",

      points: 25,

      expectedConcepts: [
        "predict",
        "mean_squared_error",
        "r2_score",
      ],
    },

    {
      id: "linear-5",

      title: "Interpret the model",

      description:
        "Explain what the evaluation results tell you about the model.",

      type: "analysis",

      points: 20,

      expectedConcepts: [
        "model evaluation",
        "regression performance",
      ],
    },
  ],

  hints: [
    "X normally contains the input features and y contains the value you want to predict.",
    "Fit only on the training data.",
    "Evaluation should be performed using data the model did not train on.",
  ],

  passingScore: 70,
};


// =========================================================
// LOGISTIC REGRESSION
// =========================================================

const logisticRegressionAssignment: CurriculumAssignment = {
  id: "logistic-regression-assignment",

  title: "Customer Purchase Classifier",

  description:
    "Build a binary classification model and interpret its mistakes.",

  skillId: "logistic-regression",

  difficulty: "intermediate",

  levels: [
    "beginner",
    "intermediate",
    "advanced",
  ],

  estimatedMinutes: 90,

  learningObjectives: [
    "Train Logistic Regression",
    "Generate class predictions",
    "Use classification metrics",
    "Understand false positives and false negatives",
  ],

  tasks: [
    {
      id: "logistic-1",

      title: "Build the classifier",

      description:
        "Train a LogisticRegression model using the provided training data.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "LogisticRegression",
        "fit",
      ],
    },

    {
      id: "logistic-2",

      title: "Generate predictions",

      description:
        "Predict the target for the test dataset.",

      type: "coding",

      points: 15,

      expectedConcepts: [
        "predict",
      ],
    },

    {
      id: "logistic-3",

      title: "Evaluate classification",

      description:
        "Calculate accuracy and create a confusion matrix.",

      type: "coding",

      points: 25,

      expectedConcepts: [
        "accuracy_score",
        "confusion_matrix",
      ],
    },

    {
      id: "logistic-4",

      title: "Analyze errors",

      description:
        "Explain false positives and false negatives for this prediction problem.",

      type: "analysis",

      points: 25,

      expectedConcepts: [
        "false positive",
        "false negative",
      ],
    },

    {
      id: "logistic-5",

      title: "Debug the workflow",

      description:
        "Explain why evaluating the model on the same data used for training can give a misleading result.",

      type: "debugging",

      points: 15,

      expectedConcepts: [
        "generalization",
        "training data",
        "test data",
      ],
    },
  ],

  hints: [
    "Classification predicts categories rather than continuous numerical values.",
    "A confusion matrix separates different kinds of correct and incorrect predictions.",
    "Think about whether the model has already seen the data being used for evaluation.",
  ],

  passingScore: 70,
};


// =========================================================
// DECISION TREE
// =========================================================

const decisionTreeAssignment: CurriculumAssignment = {
  id: "decision-tree-assignment",

  title: "Understand and Control a Decision Tree",

  description:
    "Train a decision tree and investigate how tree depth affects model behavior.",

  skillId: "decision-tree",

  difficulty: "intermediate",

  levels: [
    "beginner",
    "intermediate",
    "advanced",
  ],

  estimatedMinutes: 90,

  learningObjectives: [
    "Train a decision tree",
    "Understand splitting",
    "Investigate max_depth",
    "Recognize overfitting",
  ],

  tasks: [
    {
      id: "tree-1",

      title: "Train a decision tree",

      description:
        "Create and train a DecisionTreeClassifier.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "DecisionTreeClassifier",
        "fit",
      ],
    },

    {
      id: "tree-2",

      title: "Compare tree depth",

      description:
        "Train trees with different max_depth values and compare their results.",

      type: "experiment",

      points: 30,

      expectedConcepts: [
        "max_depth",
        "model complexity",
      ],
    },

    {
      id: "tree-3",

      title: "Explain entropy",

      description:
        "Explain what entropy represents in a decision tree.",

      type: "concept",

      points: 20,

      expectedConcepts: [
        "entropy",
        "impurity",
      ],
    },

    {
      id: "tree-4",

      title: "Analyze overfitting",

      description:
        "Explain why an extremely deep tree may perform very well on training data but worse on unseen data.",

      type: "analysis",

      points: 30,

      expectedConcepts: [
        "overfitting",
        "generalization",
      ],
    },
  ],

  hints: [
    "Tree depth controls how many levels of decisions the model can create.",
    "More complexity is not always better.",
    "Compare training and testing behavior rather than looking at only one score.",
  ],

  passingScore: 70,
};


// =========================================================
// ADVANCED PREPROCESSING
// =========================================================

const advancedPreprocessingAssignment: CurriculumAssignment = {
  id: "advanced-preprocessing-assignment",

  title: "Build a Reusable Preprocessing Pipeline",

  description:
    "Transform a mixed dataset using SimpleImputer, OneHotEncoder, ColumnTransformer and Pipeline.",

  skillId: "advanced-preprocessing",

  difficulty: "advanced",

  levels: [
    "intermediate",
    "advanced",
  ],

  estimatedMinutes: 120,

  learningObjectives: [
    "Separate numerical and categorical preprocessing",
    "Use SimpleImputer",
    "Use OneHotEncoder",
    "Use ColumnTransformer",
    "Build a Pipeline",
    "Understand leakage prevention",
  ],

  tasks: [
    {
      id: "advanced-preprocessing-1",

      title: "Identify column types",

      description:
        "Separate numerical and categorical feature names.",

      type: "analysis",

      points: 10,

      expectedConcepts: [
        "numerical features",
        "categorical features",
      ],
    },

    {
      id: "advanced-preprocessing-2",

      title: "Numerical pipeline",

      description:
        "Create a numerical Pipeline using SimpleImputer and StandardScaler.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "Pipeline",
        "SimpleImputer",
        "StandardScaler",
      ],
    },

    {
      id: "advanced-preprocessing-3",

      title: "Categorical pipeline",

      description:
        "Create a categorical Pipeline using SimpleImputer and OneHotEncoder.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "Pipeline",
        "SimpleImputer",
        "OneHotEncoder",
      ],
    },

    {
      id: "advanced-preprocessing-4",

      title: "Combine transformations",

      description:
        "Use ColumnTransformer to apply the correct preprocessing to each column group.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "ColumnTransformer",
      ],
    },

    {
      id: "advanced-preprocessing-5",

      title: "Create model pipeline",

      description:
        "Combine the preprocessor and a machine-learning model into one Pipeline.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "Pipeline",
        "preprocessing",
        "model",
      ],
    },

    {
      id: "advanced-preprocessing-6",

      title: "Explain leakage",

      description:
        "Explain how fitting preprocessing only through the training workflow helps reduce data leakage.",

      type: "analysis",

      points: 10,

      expectedConcepts: [
        "data leakage",
        "training data",
        "test data",
      ],
    },
  ],

  hints: [
    "Do not preprocess the entire dataset before creating the train/test split.",
    "Numerical and categorical columns often need different transformations.",
    "ColumnTransformer can route different column groups through different transformations.",
    "A Pipeline can combine preprocessing and model training into one workflow.",
  ],

  passingScore: 75,
};


// =========================================================
// CROSS VALIDATION
// =========================================================

const crossValidationAssignment: CurriculumAssignment = {
  id: "cross-validation-assignment",

  title: "Evaluate Beyond One Train/Test Split",

  description:
    "Use cross-validation to investigate whether model performance is stable across different subsets of data.",

  skillId: "cross-validation",

  difficulty: "advanced",

  levels: [
    "intermediate",
    "advanced",
  ],

  estimatedMinutes: 75,

  learningObjectives: [
    "Use cross-validation",
    "Interpret fold scores",
    "Understand model stability",
  ],

  tasks: [
    {
      id: "cv-1",

      title: "Run cross-validation",

      description:
        "Evaluate a model using cross_val_score.",

      type: "coding",

      points: 30,

      expectedConcepts: [
        "cross_val_score",
      ],
    },

    {
      id: "cv-2",

      title: "Inspect fold results",

      description:
        "Display the score from every fold and calculate the mean score.",

      type: "coding",

      points: 25,

      expectedConcepts: [
        "fold scores",
        "mean",
      ],
    },

    {
      id: "cv-3",

      title: "Analyze stability",

      description:
        "Explain what large differences between fold scores might indicate.",

      type: "analysis",

      points: 25,

      expectedConcepts: [
        "variance",
        "model stability",
      ],
    },

    {
      id: "cv-4",

      title: "Compare evaluation strategies",

      description:
        "Explain one advantage of cross-validation over relying only on a single train/test split.",

      type: "concept",

      points: 20,

      expectedConcepts: [
        "cross-validation",
        "evaluation reliability",
      ],
    },
  ],

  hints: [
    "Cross-validation evaluates the model multiple times.",
    "Look at both the average and the variation between scores.",
    "A single train/test split can sometimes be unusually easy or difficult.",
  ],

  passingScore: 75,
};


// =========================================================
// HYPERPARAMETER TUNING
// =========================================================

const tuningAssignment: CurriculumAssignment = {
  id: "hyperparameter-tuning-assignment",

  title: "Tune a Machine Learning Model",

  description:
    "Create a search space and systematically compare model configurations.",

  skillId: "hyperparameter-tuning",

  difficulty: "advanced",

  levels: [
    "intermediate",
    "advanced",
  ],

  estimatedMinutes: 120,

  learningObjectives: [
    "Understand hyperparameters",
    "Create search spaces",
    "Use GridSearchCV or RandomizedSearchCV",
    "Interpret tuning results",
  ],

  tasks: [
    {
      id: "tuning-1",

      title: "Choose hyperparameters",

      description:
        "Identify at least two useful hyperparameters for the selected model.",

      type: "analysis",

      points: 15,

      expectedConcepts: [
        "hyperparameters",
      ],
    },

    {
      id: "tuning-2",

      title: "Create a search space",

      description:
        "Define multiple candidate values for each selected hyperparameter.",

      type: "coding",

      points: 20,

      expectedConcepts: [
        "parameter grid",
        "search space",
      ],
    },

    {
      id: "tuning-3",

      title: "Run the search",

      description:
        "Use GridSearchCV or RandomizedSearchCV to evaluate configurations.",

      type: "coding",

      points: 30,

      expectedConcepts: [
        "GridSearchCV",
        "RandomizedSearchCV",
        "cross-validation",
      ],
    },

    {
      id: "tuning-4",

      title: "Inspect the result",

      description:
        "Report the selected parameters and validation score.",

      type: "analysis",

      points: 15,

      expectedConcepts: [
        "best_params_",
        "best_score_",
      ],
    },

    {
      id: "tuning-5",

      title: "Final evaluation",

      description:
        "Explain why the untouched test set should still be used after tuning.",

      type: "concept",

      points: 20,

      expectedConcepts: [
        "test set",
        "generalization",
        "selection bias",
      ],
    },
  ],

  hints: [
    "Model parameters learned from data are different from hyperparameters chosen before training.",
    "The search should evaluate configurations using validation logic rather than the final test set.",
    "Keep the final test set separate from model-selection decisions.",
  ],

  passingScore: 75,
};
// =========================================================
// PYTHON FUNDAMENTALS
// =========================================================

const pythonBasicsAssignment: CurriculumAssignment = {
  id: "python-basics-assignment",
  title: "Python Fundamentals Challenge",
  description:
    "Practice variables, input, conditions, loops and basic problem solving using Python.",
  skillId: "python-basics",
  difficulty: "basic",
  levels: ["beginner"],
  estimatedMinutes: 60,

  learningObjectives: [
    "Use variables and Python data types",
    "Write conditional statements",
    "Use loops",
    "Translate simple problems into Python code",
  ],

  tasks: [
    {
      id: "python-basics-1",
      title: "Student result calculator",
      description:
        "Create variables for a student's name and three subject marks. Calculate and display the average.",
      type: "coding",
      points: 20,
      expectedConcepts: ["variables", "numbers", "arithmetic"],
    },
    {
      id: "python-basics-2",
      title: "Pass or fail",
      description:
        "Use an if/else statement to print Pass when the average is at least 40 and Fail otherwise.",
      type: "coding",
      points: 20,
      expectedConcepts: ["if", "else", "comparison"],
    },
    {
      id: "python-basics-3",
      title: "Print marks using a loop",
      description:
        "Store several marks and print every mark using a loop.",
      type: "coding",
      points: 20,
      expectedConcepts: ["for loop", "iteration"],
    },
    {
      id: "python-basics-4",
      title: "Debug the condition",
      description:
        "A program uses if marks = 80:. Identify the problem and explain the correction.",
      type: "debugging",
      points: 20,
      expectedConcepts: ["assignment", "comparison", "syntax"],
    },
    {
      id: "python-basics-5",
      title: "Explain the workflow",
      description:
        "Explain how variables, conditions and loops solve different parts of a program.",
      type: "concept",
      points: 20,
      expectedConcepts: ["variables", "conditions", "loops"],
    },
  ],

  hints: [
    "Start by identifying what information the program needs to store.",
    "A comparison uses == rather than =.",
    "Use a loop when the same operation must be repeated.",
  ],

  passingScore: 70,
};


// =========================================================
// PYTHON DATA STRUCTURES
// =========================================================

const pythonDataStructuresAssignment: CurriculumAssignment = {
  id: "python-data-structures-assignment",
  title: "Work with Python Collections",
  description:
    "Use lists, tuples, dictionaries and sets to organize and analyze data.",
  skillId: "python-data-structures",
  difficulty: "basic",
  levels: ["beginner", "intermediate"],
  estimatedMinutes: 75,

  learningObjectives: [
    "Choose suitable Python data structures",
    "Manipulate lists",
    "Use dictionaries",
    "Use sets for uniqueness",
  ],

  tasks: [
    {
      id: "python-ds-1",
      title: "Analyze marks",
      description:
        "Store student marks in a list and calculate the minimum, maximum and average.",
      type: "coding",
      points: 25,
      expectedConcepts: ["list", "min", "max", "sum", "len"],
    },
    {
      id: "python-ds-2",
      title: "Create a student dictionary",
      description:
        "Represent a student using a dictionary containing name, age and marks.",
      type: "coding",
      points: 20,
      expectedConcepts: ["dictionary", "key", "value"],
    },
    {
      id: "python-ds-3",
      title: "Find unique categories",
      description:
        "Given a list containing repeated course names, use a set to find unique courses.",
      type: "coding",
      points: 20,
      expectedConcepts: ["set", "uniqueness"],
    },
    {
      id: "python-ds-4",
      title: "Choose the right structure",
      description:
        "Explain when you would choose a list, tuple, dictionary or set.",
      type: "analysis",
      points: 35,
      expectedConcepts: ["list", "tuple", "dictionary", "set"],
    },
  ],

  hints: [
    "Lists are useful for ordered collections.",
    "A dictionary represents information using key-value pairs.",
    "Sets automatically keep unique values.",
  ],

  passingScore: 70,
};


// =========================================================
// PYTHON FUNCTIONS
// =========================================================

const pythonFunctionsAssignment: CurriculumAssignment = {
  id: "python-functions-assignment",
  title: "Build Reusable Python Functions",
  description:
    "Turn repeated logic into reusable functions and understand parameters and return values.",
  skillId: "python-functions",
  difficulty: "basic",
  levels: ["beginner", "intermediate"],
  estimatedMinutes: 75,

  learningObjectives: [
    "Define functions",
    "Use parameters",
    "Return values",
    "Break programs into reusable components",
  ],

  tasks: [
    {
      id: "python-functions-1",
      title: "Average function",
      description:
        "Write a function that accepts a list of marks and returns their average.",
      type: "coding",
      points: 25,
      expectedConcepts: ["def", "parameter", "return"],
    },
    {
      id: "python-functions-2",
      title: "Classification function",
      description:
        "Create a function that accepts a mark and returns Pass or Fail.",
      type: "coding",
      points: 20,
      expectedConcepts: ["function", "condition", "return"],
    },
    {
      id: "python-functions-3",
      title: "Debug a missing return",
      description:
        "Investigate a function that calculates a value but returns None. Explain and correct the problem.",
      type: "debugging",
      points: 25,
      expectedConcepts: ["return", "None", "function output"],
    },
    {
      id: "python-functions-4",
      title: "Why functions?",
      description:
        "Explain why reusable functions become important in larger data-science and ML programs.",
      type: "concept",
      points: 30,
      expectedConcepts: ["reusability", "modularity", "maintainability"],
    },
  ],

  hints: [
    "A function does not automatically return its calculated value.",
    "Parameters allow the same logic to work with different input.",
    "Look for repeated code that could become a function.",
  ],

  passingScore: 70,
};


// =========================================================
// PYTHON FOR DATA
// =========================================================

const pythonForDataAssignment: CurriculumAssignment = {
  id: "python-for-data-assignment",
  title: "Prepare Raw Records with Python",
  description:
    "Use Python techniques to transform raw records before moving into dedicated data libraries.",
  skillId: "python-for-data",
  difficulty: "intermediate",
  levels: ["intermediate", "advanced"],
  estimatedMinutes: 90,

  learningObjectives: [
    "Transform collections",
    "Filter records",
    "Use comprehensions",
    "Prepare structured data",
  ],

  tasks: [
    {
      id: "python-data-1",
      title: "Filter valid values",
      description:
        "Given a collection containing valid and invalid scores, create a new collection containing only scores from 0 to 100.",
      type: "coding",
      points: 25,
      expectedConcepts: ["filtering", "conditions", "collections"],
    },
    {
      id: "python-data-2",
      title: "Transform values",
      description:
        "Use a list comprehension to convert a list of temperatures from Celsius to Fahrenheit.",
      type: "coding",
      points: 20,
      expectedConcepts: ["list comprehension", "transformation"],
    },
    {
      id: "python-data-3",
      title: "Analyze records",
      description:
        "Given a list of student dictionaries, identify students above the class average.",
      type: "analysis",
      points: 30,
      expectedConcepts: ["nested structures", "aggregation", "filtering"],
    },
    {
      id: "python-data-4",
      title: "Improve repetitive code",
      description:
        "Refactor repetitive data-processing code into a cleaner reusable workflow.",
      type: "debugging",
      points: 25,
      expectedConcepts: ["refactoring", "functions", "reusability"],
    },
  ],

  hints: [
    "Separate filtering from transformation.",
    "Comprehensions are useful for concise transformations.",
    "Calculate the aggregate before filtering against it.",
  ],

  passingScore: 70,
};


// =========================================================
// PYTHON ERROR HANDLING
// =========================================================

const pythonErrorHandlingAssignment: CurriculumAssignment = {
  id: "python-error-handling-assignment",
  title: "Build Safer Python Programs",
  description:
    "Diagnose errors and use exception handling without hiding programming mistakes.",
  skillId: "python-error-handling",
  difficulty: "intermediate",
  levels: ["intermediate", "advanced"],
  estimatedMinutes: 75,

  learningObjectives: [
    "Understand common exceptions",
    "Use try and except",
    "Handle expected failures",
    "Debug errors systematically",
  ],

  tasks: [
    {
      id: "python-errors-1",
      title: "Identify exceptions",
      description:
        "Explain the likely cause of NameError, TypeError, ValueError and KeyError.",
      type: "concept",
      points: 25,
      expectedConcepts: ["NameError", "TypeError", "ValueError", "KeyError"],
    },
    {
      id: "python-errors-2",
      title: "Safe number conversion",
      description:
        "Write code that attempts to convert user input to an integer and handles invalid input.",
      type: "coding",
      points: 25,
      expectedConcepts: ["try", "except", "ValueError"],
    },
    {
      id: "python-errors-3",
      title: "Debug dictionary access",
      description:
        "Fix code that fails when a requested dictionary key does not exist.",
      type: "debugging",
      points: 25,
      expectedConcepts: ["KeyError", "dictionary access", "get"],
    },
    {
      id: "python-errors-4",
      title: "Avoid broad exception handling",
      description:
        "Explain why catching every exception without inspecting it can make debugging harder.",
      type: "analysis",
      points: 25,
      expectedConcepts: ["specific exceptions", "debugging", "error visibility"],
    },
  ],

  hints: [
    "Read the exception type before changing code.",
    "Catch errors you expect and know how to handle.",
    "Exception handling should not hide unrelated programming bugs.",
  ],

  passingScore: 70,
};


// =========================================================
// PYTHON OOP
// =========================================================

const pythonOOPAssignment: CurriculumAssignment = {
  id: "python-oop-assignment",
  title: "Model an ML Experiment with OOP",
  description:
    "Use classes and objects to organize reusable machine-learning experiment information.",
  skillId: "python-oop",
  difficulty: "intermediate",
  levels: ["intermediate", "advanced"],
  estimatedMinutes: 90,

  learningObjectives: [
    "Create classes",
    "Use constructors",
    "Create instance attributes",
    "Write methods",
    "Understand OOP usefulness in ML systems",
  ],

  tasks: [
    {
      id: "python-oop-1",
      title: "Create an experiment class",
      description:
        "Create an MLExperiment class containing model_name and accuracy attributes.",
      type: "coding",
      points: 25,
      expectedConcepts: ["class", "__init__", "self"],
    },
    {
      id: "python-oop-2",
      title: "Add behavior",
      description:
        "Add a method that displays the experiment summary.",
      type: "coding",
      points: 20,
      expectedConcepts: ["method", "self", "instance attributes"],
    },
    {
      id: "python-oop-3",
      title: "Create multiple experiments",
      description:
        "Create multiple objects representing different model experiments and compare their accuracy.",
      type: "coding",
      points: 25,
      expectedConcepts: ["objects", "instances", "comparison"],
    },
    {
      id: "python-oop-4",
      title: "Connect OOP to ML",
      description:
        "Explain how classes can help organize datasets, models, experiments or reusable ML components.",
      type: "analysis",
      points: 30,
      expectedConcepts: ["encapsulation", "organization", "reusability"],
    },
  ],

  hints: [
    "__init__ initializes a new object.",
    "Use self to access information belonging to the current object.",
    "Think about an object as one experiment with its own state.",
  ],

  passingScore: 70,
};


// =========================================================
// ADVANCED PYTHON
// =========================================================

const pythonAdvancedAssignment: CurriculumAssignment = {
  id: "python-advanced-assignment",
  title: "Structure a Reusable ML Python Project",
  description:
    "Apply advanced Python engineering practices to organize reusable and reproducible ML code.",
  skillId: "python-advanced",
  difficulty: "advanced",
  levels: ["advanced"],
  estimatedMinutes: 120,

  learningObjectives: [
    "Organize Python modules",
    "Use type hints",
    "Understand environments",
    "Use generators where appropriate",
    "Design maintainable ML code",
  ],

  tasks: [
    {
      id: "python-advanced-1",
      title: "Split responsibilities",
      description:
        "Design a project structure separating data loading, preprocessing, model training and evaluation.",
      type: "analysis",
      points: 25,
      expectedConcepts: ["modules", "packages", "separation of concerns"],
    },
    {
      id: "python-advanced-2",
      title: "Add type hints",
      description:
        "Add useful type hints to a small set of data-processing functions.",
      type: "coding",
      points: 20,
      expectedConcepts: ["type hints", "function annotations"],
    },
    {
      id: "python-advanced-3",
      title: "Process lazily",
      description:
        "Create a generator that yields records one at a time and explain when this can be useful.",
      type: "coding",
      points: 25,
      expectedConcepts: ["yield", "generator", "memory"],
    },
    {
      id: "python-advanced-4",
      title: "Reproducible environment",
      description:
        "Explain why virtual environments and dependency files matter when sharing an ML project.",
      type: "concept",
      points: 30,
      expectedConcepts: ["virtual environment", "dependencies", "reproducibility"],
    },
  ],

  hints: [
    "Separate code by responsibility rather than putting everything in one file.",
    "Type hints communicate expected inputs and outputs.",
    "Generators do not need to construct the entire sequence in memory.",
  ],

  passingScore: 75,
};
// =========================================================
// EDA FOUNDATION
// =========================================================

const edaFoundationAssignment: CurriculumAssignment = {
  id: "eda-foundation-assignment",
  title: "Explore an Unknown Dataset",
  description:
    "Perform structured exploratory data analysis and turn observations into useful conclusions.",
  skillId: "eda-foundation",
  difficulty: "intermediate",
  levels: ["beginner", "intermediate"],
  estimatedMinutes: 120,

  learningObjectives: [
    "Inspect dataset structure",
    "Analyze distributions",
    "Compare variables",
    "Investigate target behavior",
    "Form data-driven hypotheses",
  ],

  tasks: [
    {
      id: "eda-foundation-1",
      title: "Understand the dataset",
      description:
        "Inspect shape, columns, data types, summary statistics and missing values.",
      type: "coding",
      points: 20,
      expectedConcepts: ["shape", "info", "describe", "isnull"],
    },
    {
      id: "eda-foundation-2",
      title: "Analyze one variable",
      description:
        "Choose one numerical and one categorical feature and analyze their distributions.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["univariate analysis", "distribution", "value_counts"],
    },
    {
      id: "eda-foundation-3",
      title: "Compare variables",
      description:
        "Investigate a meaningful relationship between two variables and explain what you observe.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["bivariate analysis", "relationship"],
    },
    {
      id: "eda-foundation-4",
      title: "Investigate the target",
      description:
        "Analyze the target variable and determine whether its distribution may create modeling concerns.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["target analysis", "class distribution"],
    },
    {
      id: "eda-foundation-5",
      title: "Write EDA conclusions",
      description:
        "Write at least four findings and two hypotheses that should influence later preprocessing or modeling.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["insights", "hypothesis", "preprocessing decisions"],
    },
  ],

  hints: [
    "Begin with structure before creating plots.",
    "Do not report only numbers; explain what they mean.",
    "Ask whether each observation could influence preprocessing or modeling.",
  ],

  passingScore: 70,
};


// =========================================================
// DATA VISUALIZATION
// =========================================================

const dataVisualizationAssignment: CurriculumAssignment = {
  id: "data-visualization-assignment",
  title: "Tell the Dataset Story Visually",
  description:
    "Use Matplotlib and Seaborn to select appropriate plots and communicate useful observations.",
  skillId: "data-visualization",
  difficulty: "intermediate",
  levels: ["beginner", "intermediate", "advanced"],
  estimatedMinutes: 105,

  learningObjectives: [
    "Create Matplotlib plots",
    "Create Seaborn plots",
    "Choose appropriate visualizations",
    "Interpret graphs rather than only producing them",
  ],

  tasks: [
    {
      id: "visualization-1",
      title: "Numerical distribution",
      description:
        "Create a histogram for a numerical feature and explain its distribution.",
      type: "coding",
      points: 20,
      expectedConcepts: ["histogram", "distribution", "matplotlib"],
    },
    {
      id: "visualization-2",
      title: "Detect possible outliers",
      description:
        "Create a box plot and identify any observations that deserve further investigation.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["boxplot", "outliers"],
    },
    {
      id: "visualization-3",
      title: "Compare categories",
      description:
        "Use an appropriate Seaborn categorical plot and explain the comparison.",
      type: "coding",
      points: 20,
      expectedConcepts: ["seaborn", "countplot", "categorical analysis"],
    },
    {
      id: "visualization-4",
      title: "Analyze relationships",
      description:
        "Create a scatter plot for two numerical variables and describe their relationship.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["scatterplot", "relationship", "correlation intuition"],
    },
    {
      id: "visualization-5",
      title: "Choose the right graph",
      description:
        "Explain why different analytical questions require different visualization types.",
      type: "concept",
      points: 20,
      expectedConcepts: ["plot selection", "communication", "interpretation"],
    },
  ],

  hints: [
    "Choose the graph based on the question you want to answer.",
    "A histogram is useful for numerical distributions.",
    "Creating a plot is not enough; interpret what the plot shows.",
  ],

  passingScore: 70,
};


// =========================================================
// ADVANCED DATA CLEANING
// =========================================================

const advancedDataCleaningAssignment: CurriculumAssignment = {
  id: "advanced-data-cleaning-assignment",
  title: "Diagnose and Repair a Realistic Dataset",
  description:
    "Make justified cleaning decisions for missing data, invalid values, inconsistent categories, outliers and skewed features.",
  skillId: "advanced-data-cleaning",
  difficulty: "advanced",
  levels: ["intermediate", "advanced"],
  estimatedMinutes: 150,

  learningObjectives: [
    "Choose cleaning strategies based on data",
    "Use SimpleImputer",
    "Detect inconsistent values",
    "Investigate outliers",
    "Prevent leakage",
  ],

  tasks: [
    {
      id: "advanced-cleaning-1",
      title: "Create a quality report",
      description:
        "Identify missing values, duplicate rows, suspicious categories, invalid ranges and incorrect data types.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["data quality", "missingness", "duplicates", "validation"],
    },
    {
      id: "advanced-cleaning-2",
      title: "Choose imputation strategies",
      description:
        "Select suitable missing-value strategies for numerical and categorical features and justify each decision.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["imputation strategy", "mean", "median", "mode"],
    },
    {
      id: "advanced-cleaning-3",
      title: "Implement imputation",
      description:
        "Use SimpleImputer to implement appropriate numerical and categorical imputation.",
      type: "coding",
      points: 20,
      expectedConcepts: ["SimpleImputer", "fit", "transform"],
    },
    {
      id: "advanced-cleaning-4",
      title: "Investigate outliers",
      description:
        "Use IQR or another justified method to identify unusual observations and decide whether they should be retained, transformed or removed.",
      type: "experiment",
      points: 20,
      expectedConcepts: ["IQR", "outlier treatment", "domain reasoning"],
    },
    {
      id: "advanced-cleaning-5",
      title: "Prevent leakage",
      description:
        "Explain which cleaning operations must learn their parameters only from training data and why.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["data leakage", "training data", "fitted preprocessing"],
    },
  ],

  hints: [
    "Do not automatically delete every unusual observation.",
    "The median can be more robust when a numerical feature is strongly skewed.",
    "Any preprocessing step that learns information from data can potentially leak test information.",
  ],

  passingScore: 75,
};


// =========================================================
// ADVANCED EDA
// =========================================================

const advancedEDAAssignment: CurriculumAssignment = {
  id: "advanced-eda-assignment",
  title: "EDA for Modeling Decisions",
  description:
    "Perform target-aware and multivariate EDA and translate findings into concrete modeling decisions.",
  skillId: "advanced-eda",
  difficulty: "advanced",
  levels: ["intermediate", "advanced"],
  estimatedMinutes: 150,

  learningObjectives: [
    "Perform target-aware EDA",
    "Investigate multivariate relationships",
    "Recognize multicollinearity",
    "Detect imbalance and rare categories",
    "Identify possible leakage",
    "Turn EDA findings into modeling hypotheses",
  ],

  tasks: [
    {
      id: "advanced-eda-1",
      title: "Target-aware analysis",
      description:
        "Compare important features against the target and identify patterns associated with different target outcomes.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["target-aware EDA", "feature-target relationship"],
    },
    {
      id: "advanced-eda-2",
      title: "Correlation investigation",
      description:
        "Create and interpret a correlation matrix while explaining why correlation alone does not establish causation.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["correlation", "heatmap", "causation"],
    },
    {
      id: "advanced-eda-3",
      title: "Check feature redundancy",
      description:
        "Identify strongly related features that may indicate multicollinearity or redundant information.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["multicollinearity", "redundancy"],
    },
    {
      id: "advanced-eda-4",
      title: "Inspect imbalance and cardinality",
      description:
        "Investigate target imbalance, rare categories and high-cardinality categorical features.",
      type: "analysis",
      points: 20,
      expectedConcepts: ["class imbalance", "rare categories", "cardinality"],
    },
    {
      id: "advanced-eda-5",
      title: "Create modeling hypotheses",
      description:
        "Produce at least four specific preprocessing, feature-engineering or modeling decisions supported by your EDA.",
      type: "experiment",
      points: 20,
      expectedConcepts: [
        "feature engineering",
        "preprocessing decisions",
        "model hypothesis",
      ],
    },
  ],

  hints: [
    "Ask how feature behavior changes across target groups.",
    "Strong correlation does not by itself prove a causal relationship.",
    "EDA should influence what you do next rather than end with a collection of plots.",
  ],

  passingScore: 75,
};

// =========================================================
// ASSIGNMENT DATABASE
// =========================================================

export const curriculumAssignments: CurriculumAssignment[] = [
  // Python
  pythonBasicsAssignment,
  pythonDataStructuresAssignment,
  pythonFunctionsAssignment,
  pythonForDataAssignment,
  pythonErrorHandlingAssignment,
  pythonOOPAssignment,
  pythonAdvancedAssignment,

  // Data
  pandasBasicAssignment,
  basicCleaningAssignment,
  edaFoundationAssignment,
  dataVisualizationAssignment,
  advancedDataCleaningAssignment,
  advancedEDAAssignment,

  // Machine Learning
  linearRegressionAssignment,
  logisticRegressionAssignment,
  decisionTreeAssignment,
  advancedPreprocessingAssignment,
  crossValidationAssignment,
  tuningAssignment,
];


// =========================================================
// HELPERS
// =========================================================

export function getAssignmentById(
  assignmentId: string
): CurriculumAssignment | undefined {
  return curriculumAssignments.find(
    (assignment) =>
      assignment.id === assignmentId
  );
}


export function getAssignmentsForSkill(
  skillId: string
): CurriculumAssignment[] {
  return curriculumAssignments.filter(
    (assignment) =>
      assignment.skillId === skillId
  );
}


export function getAssignmentsForLevel(
  level: LearningLevel
): CurriculumAssignment[] {
  return curriculumAssignments.filter(
    (assignment) =>
      assignment.levels.includes(level)
  );
}


export function getAssignmentForSkillAndLevel(
  skillId: string,
  level: LearningLevel
): CurriculumAssignment | undefined {
  return curriculumAssignments.find(
    (assignment) =>
      assignment.skillId === skillId &&
      assignment.levels.includes(level)
  );
}


export function getAssignmentTotalPoints(
  assignment: CurriculumAssignment
): number {
  return assignment.tasks.reduce(
    (total, task) =>
      total + task.points,
    0
  );
}
