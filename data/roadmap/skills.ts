import type {
  LearningLevel,
  RoadmapGoal,
  TopicDifficulty,
} from "../../types/roadmap";

export interface CurriculumSkill {
  id: string;
  name: string;
  category: string;
  description: string;

  difficulty: TopicDifficulty;

  prerequisites: string[];

  estimatedMinutes: number;

  goals: RoadmapGoal[];

  levels: LearningLevel[];

  concepts: string[];

  tools: string[];

  outcomes: string[];
}

export const curriculumSkills: CurriculumSkill[] = [
  // =====================================================
  // PYTHON FOUNDATION
  // =====================================================

  {
    id: "python-basics",
    name: "Python Fundamentals",
    category: "Python",
    description:
      "Learn the Python foundations required before starting machine learning.",

    difficulty: "basic",

    prerequisites: [],

    estimatedMinutes: 240,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
    ],

    concepts: [
      "Variables",
      "Data types",
      "Operators",
      "Conditions",
      "Loops",
      "Functions",
      "Lists",
      "Tuples",
      "Sets",
      "Dictionaries",
    ],

    tools: [
      "Python",
    ],

    outcomes: [
      "Write basic Python programs",
      "Use conditions and loops",
      "Create reusable functions",
      "Work with Python collections",
    ],
  },
    // =====================================================
  // PYTHON DATA STRUCTURES
  // =====================================================

  {
    id: "python-data-structures",
    name: "Python Data Structures",
    category: "Python",
    description:
      "Learn how Python collections are used to organize and manipulate data before working with machine-learning libraries.",

    difficulty: "basic",

    prerequisites: [
      "python-basics",
    ],

    estimatedMinutes: 240,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
    ],

    concepts: [
      "Lists",
      "List indexing",
      "List slicing",
      "List methods",
      "Tuples",
      "Sets",
      "Dictionaries",
      "Dictionary keys and values",
      "Nested collections",
      "Iterating through collections",
    ],

    tools: [
      "list",
      "tuple",
      "set",
      "dict",
    ],

    outcomes: [
      "Choose suitable Python data structures",
      "Store and retrieve structured information",
      "Iterate through collections",
      "Manipulate lists and dictionaries",
      "Prepare for tabular and numerical data libraries",
    ],
  },


  // =====================================================
  // PYTHON FUNCTIONS
  // =====================================================

  {
    id: "python-functions",
    name: "Functions and Reusable Python",
    category: "Python",
    description:
      "Learn to organize Python programs using reusable functions instead of repeating code.",

    difficulty: "basic",

    prerequisites: [
      "python-basics",
      "python-data-structures",
    ],

    estimatedMinutes: 210,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
    ],

    concepts: [
      "Defining functions",
      "Function parameters",
      "Arguments",
      "Return values",
      "Default parameters",
      "Keyword arguments",
      "Variable scope",
      "Reusable code",
    ],

    tools: [
      "def",
      "return",
    ],

    outcomes: [
      "Create reusable Python functions",
      "Pass data into functions",
      "Return processed results",
      "Reduce repeated code",
      "Organize ML preprocessing logic into functions",
    ],
  },


  // =====================================================
  // PYTHON FOR DATA WORK
  // =====================================================

  {
    id: "python-for-data",
    name: "Python for Data Work",
    category: "Python",
    description:
      "Learn Python features frequently used when preparing, transforming and exploring data.",

    difficulty: "intermediate",

    prerequisites: [
      "python-data-structures",
      "python-functions",
    ],

    estimatedMinutes: 240,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "List comprehensions",
      "Dictionary comprehensions",
      "enumerate",
      "zip",
      "lambda functions",
      "Sorting with keys",
      "File handling",
      "Working with paths",
      "Data transformation patterns",
    ],

    tools: [
      "enumerate",
      "zip",
      "lambda",
      "open",
      "sorted",
    ],

    outcomes: [
      "Write concise data-processing code",
      "Iterate through related data safely",
      "Read and write basic files",
      "Transform Python collections efficiently",
      "Understand Python patterns used by ML code",
    ],
  },


  // =====================================================
  // PYTHON ERROR HANDLING AND DEBUGGING
  // =====================================================

  {
    id: "python-error-handling",
    name: "Python Errors and Debugging",
    category: "Python",
    description:
      "Learn how to understand Python errors, handle expected failures and debug code systematically.",

    difficulty: "intermediate",

    prerequisites: [
      "python-functions",
    ],

    estimatedMinutes: 180,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Syntax errors",
      "Runtime errors",
      "Logical errors",
      "Reading tracebacks",
      "try and except",
      "else",
      "finally",
      "Raising exceptions",
      "Debugging strategy",
    ],

    tools: [
      "try",
      "except",
      "else",
      "finally",
      "raise",
    ],

    outcomes: [
      "Identify common Python error types",
      "Read useful information from tracebacks",
      "Handle expected exceptions",
      "Debug code systematically",
      "Understand errors produced by ML libraries",
    ],
  },


  // =====================================================
  // PYTHON OOP
  // =====================================================

  {
    id: "python-oop",
    name: "Object-Oriented Python for ML",
    category: "Python",
    description:
      "Learn the object-oriented concepts needed to understand Python libraries and build reusable ML components.",

    difficulty: "intermediate",

    prerequisites: [
      "python-functions",
    ],

    estimatedMinutes: 240,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "deep-learning",
      "placement",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Classes",
      "Objects",
      "Attributes",
      "Methods",
      "__init__",
      "self",
      "Basic inheritance",
      "Encapsulation",
      "Reusable components",
    ],

    tools: [
      "class",
      "__init__",
      "self",
      "super",
    ],

    outcomes: [
      "Create Python classes",
      "Understand objects and methods",
      "Understand object-oriented library APIs",
      "Build reusable components",
      "Better understand scikit-learn estimator objects",
    ],
  },


  // =====================================================
  // ADVANCED PYTHON FOR ML
  // =====================================================

  {
    id: "python-advanced",
    name: "Advanced Python for ML Engineering",
    category: "Python",
    description:
      "Learn Python practices for creating cleaner, reusable and maintainable machine-learning projects.",

    difficulty: "advanced",

    prerequisites: [
      "python-for-data",
      "python-error-handling",
      "python-oop",
    ],

    estimatedMinutes: 360,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "deep-learning",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "advanced",
    ],

    concepts: [
      "Modules",
      "Packages",
      "Imports",
      "Virtual environments",
      "Dependency management",
      "Type hints",
      "Iterators",
      "Generators",
      "Decorators",
      "Reusable project structure",
      "Configuration",
      "Random seeds",
      "Reproducible Python code",
    ],

    tools: [
      "venv",
      "pip",
      "typing",
      "yield",
      "requirements.txt",
    ],

    outcomes: [
      "Organize larger Python projects",
      "Manage project dependencies",
      "Write typed reusable functions",
      "Understand generators and decorators",
      "Create maintainable ML code",
      "Build more reproducible ML projects",
    ],
  },

  // =====================================================
  // NUMPY
  // =====================================================

    {
    id: "numpy-foundation",

    name: "NumPy Fundamentals",

    category: "Data Foundations",

    description:
      "Master NumPy for numerical computing, multidimensional arrays, vectorized operations, broadcasting, indexing and efficient data manipulation used throughout machine learning.",

    difficulty: "basic",

    prerequisites: [
      "python-data-structures",
      "python-functions",
    ],

    estimatedMinutes: 360,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Why NumPy is used",
      "Python lists vs NumPy arrays",

      "Creating NumPy arrays",
      "1D arrays",
      "2D arrays",
      "Multidimensional arrays",

      "Array dimensions",
      "Array shape",
      "Array size",
      "Array data types",
      "Changing data types",

      "arange",
      "linspace",
      "zeros",
      "ones",
      "full",
      "identity matrices",

      "Indexing",
      "Negative indexing",
      "Slicing",
      "Multidimensional indexing",
      "Multidimensional slicing",

      "Boolean masking",
      "Conditional selection",

      "Reshaping arrays",
      "Flattening arrays",
      "Transpose",

      "Concatenating arrays",
      "Stacking arrays",
      "Splitting arrays",

      "Element-wise operations",
      "Vectorized operations",

      "Broadcasting",
      "Broadcasting rules",

      "Aggregation",
      "sum",
      "mean",
      "median",
      "min",
      "max",
      "standard deviation",
      "variance",

      "Axis operations",
      "Row-wise operations",
      "Column-wise operations",

      "Sorting arrays",
      "Finding unique values",

      "argmin",
      "argmax",
      "where",

      "Random numbers",
      "Random sampling",
      "Random seeds",

      "Array copies",
      "Array views",

      "NaN values in numerical arrays",

      "Basic linear algebra",
      "Dot product",
      "Matrix multiplication",

      "NumPy performance intuition",
      "Why vectorization is faster than Python loops",

      "Using NumPy in machine-learning workflows",
    ],

    tools: [
      "numpy",
      "np.array",
      "np.arange",
      "np.linspace",
      "np.zeros",
      "np.ones",
      "np.full",
      "np.eye",
      "reshape",
      "flatten",
      "ravel",
      "transpose",
      "concatenate",
      "stack",
      "hstack",
      "vstack",
      "split",
      "where",
      "unique",
      "sort",
      "argmin",
      "argmax",
      "sum",
      "mean",
      "median",
      "std",
      "var",
      "min",
      "max",
      "np.random",
      "dot",
      "matmul",
    ],

    outcomes: [
      "Explain why NumPy is important for machine learning",
      "Create one-dimensional and multidimensional arrays",
      "Inspect array dimensions, shapes, sizes and data types",
      "Select data using indexing, slicing and boolean masks",
      "Reshape, flatten and transpose arrays",
      "Combine and split arrays",
      "Perform efficient vectorized calculations",
      "Understand and apply broadcasting",
      "Calculate statistics across complete arrays or selected axes",
      "Generate reproducible random numerical data",
      "Understand copies and views",
      "Perform basic matrix and vector operations",
      "Replace common Python loops with NumPy operations",
      "Use NumPy confidently when preparing data for machine learning",
    ],
  },

  // =====================================================
  // PANDAS FOUNDATION
  // =====================================================

    {
    id: "pandas-foundation",

    name: "Pandas Fundamentals",

    category: "Data Handling",

    description:
      "Master Pandas for loading, inspecting, selecting, transforming, combining, summarizing and preparing real-world tabular datasets for data analysis and machine learning.",

    difficulty: "basic",

    prerequisites: [
      "python-data-structures",
      "python-functions",
    ],

    estimatedMinutes: 480,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Why Pandas is used",
      "Pandas vs NumPy",

      "Series",
      "Creating Series",
      "Series index",
      "Series values",

      "DataFrame",
      "Creating DataFrames",
      "Rows and columns",
      "DataFrame index",

      "Loading datasets",
      "Reading CSV files",
      "Reading Excel files",
      "Reading JSON data",

      "Dataset shape",
      "Column names",
      "Data types",
      "Dataset dimensions",

      "head",
      "tail",
      "sample",
      "info",
      "describe",

      "Selecting columns",
      "Selecting multiple columns",

      "loc",
      "iloc",
      "Row selection",
      "Column selection",

      "Boolean filtering",
      "Multiple filtering conditions",
      "and conditions",
      "or conditions",
      "isin",
      "between",
      "query",

      "Sorting values",
      "Sorting by multiple columns",
      "Sorting indexes",

      "Creating new columns",
      "Updating columns",
      "Renaming columns",
      "Dropping columns",
      "Dropping rows",

      "Unique values",
      "Number of unique values",
      "Value counts",

      "Missing-value inspection",
      "isna",
      "notna",

      "Duplicate inspection",
      "duplicated",

      "Changing data types",
      "astype",
      "Numeric conversion",

      "String operations",
      "String cleaning",
      "String replacement",
      "String contains",

      "apply",
      "map",
      "replace",

      "Aggregation",
      "sum",
      "mean",
      "median",
      "min",
      "max",
      "count",
      "standard deviation",

      "groupby",
      "Single-column grouping",
      "Multiple-column grouping",
      "Grouped aggregation",
      "agg",

      "Cross-tabulation",
      "crosstab",

      "Pivot tables",
      "pivot",
      "pivot_table",

      "Combining datasets",
      "concat",

      "Merging datasets",
      "merge",
      "Inner join",
      "Left join",
      "Right join",
      "Outer join",

      "DataFrame joins",

      "Working with dates",
      "Datetime conversion",
      "Extracting year",
      "Extracting month",
      "Extracting day",

      "Categorical columns",
      "Numerical columns",

      "Resetting indexes",
      "Setting indexes",

      "Copying DataFrames",

      "Basic correlation analysis",

      "Exporting datasets",
      "Saving CSV files",

      "Method chaining",

      "Avoiding accidental DataFrame modification",

      "Using Pandas in an ML workflow",
    ],

    tools: [
      "pandas",
      "pd.Series",
      "pd.DataFrame",

      "read_csv",
      "read_excel",
      "read_json",

      "head",
      "tail",
      "sample",
      "info",
      "describe",

      "loc",
      "iloc",
      "query",

      "isin",
      "between",

      "sort_values",
      "sort_index",

      "rename",
      "drop",

      "unique",
      "nunique",
      "value_counts",

      "isna",
      "notna",
      "duplicated",

      "astype",
      "to_numeric",
      "to_datetime",

      "apply",
      "map",
      "replace",

      "groupby",
      "agg",

      "crosstab",
      "pivot",
      "pivot_table",

      "concat",
      "merge",
      "join",

      "reset_index",
      "set_index",

      "corr",

      "to_csv",
    ],

    outcomes: [
      "Explain why Pandas is important in data science and machine learning",
      "Create and manipulate Series and DataFrames",
      "Load CSV, Excel and JSON datasets",
      "Inspect unfamiliar datasets systematically",
      "Understand rows, columns, indexes and data types",
      "Select rows and columns using loc and iloc",
      "Filter datasets using simple and compound conditions",
      "Sort datasets using one or multiple columns",
      "Create, update, rename and remove columns",
      "Inspect unique values and category frequencies",
      "Identify missing values and duplicate records",
      "Convert columns to appropriate data types",
      "Clean and manipulate text columns",
      "Transform columns using apply, map and replace",
      "Calculate useful summary statistics",
      "Group and aggregate datasets",
      "Create cross-tabulations and pivot tables",
      "Combine datasets using concat",
      "Merge datasets using common join strategies",
      "Work with datetime columns",
      "Distinguish categorical and numerical features",
      "Manage DataFrame indexes",
      "Perform basic correlation analysis",
      "Export cleaned or transformed datasets",
      "Use Pandas confidently in EDA and machine-learning workflows",
    ],
  },

  // =====================================================
  // COLLEGE-STYLE DATA CLEANING
  // =====================================================

    {
    id: "basic-data-cleaning",

    name: "Basic Data Cleaning",

    category: "Preprocessing",

    description:
      "Learn how to inspect, diagnose and clean common data-quality problems using Pandas and beginner-friendly preprocessing techniques before exploratory analysis and machine learning.",

    difficulty: "basic",

    prerequisites: [
      "pandas-foundation",
    ],

    estimatedMinutes: 360,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "What is data cleaning",
      "Why data cleaning matters",
      "Raw data vs clean data",
      "Common data-quality problems",

      "Inspecting dataset shape",
      "Inspecting column names",
      "Inspecting data types",
      "Inspecting summary statistics",

      "Missing values",
      "Why missing values occur",
      "Detecting missing values",
      "Counting missing values",
      "Missing-value percentages",

      "Dropping missing values",
      "Dropping rows with missing values",
      "Dropping columns with excessive missing data",

      "Filling missing values",
      "Mean imputation",
      "Median imputation",
      "Mode imputation",
      "Constant-value imputation",

      "Choosing between mean and median",
      "Choosing appropriate missing-value strategies",

      "Duplicate records",
      "Detecting duplicates",
      "Counting duplicates",
      "Removing duplicates",

      "Data types",
      "Incorrect data types",
      "Converting data types",
      "Numeric conversion",
      "Datetime conversion",

      "Invalid values",
      "Impossible values",
      "Unexpected values",

      "Categorical values",
      "Inspecting categories",
      "Inconsistent categories",
      "Category spelling problems",
      "Whitespace problems",
      "Case inconsistencies",

      "String cleaning",
      "Removing unnecessary whitespace",
      "Standardizing text case",
      "Replacing incorrect values",

      "Renaming columns",
      "Cleaning column names",

      "Outliers",
      "What is an outlier",
      "Basic outlier inspection",
      "Outliers using summary statistics",
      "Outliers using box plots",

      "Categorical encoding",
      "Why categorical data needs encoding",
      "Label encoding",
      "One-hot encoding",
      "get_dummies",

      "Feature scaling",
      "Why scaling is needed",
      "Standardization",
      "StandardScaler",

      "Cleaning numerical features",
      "Cleaning categorical features",

      "Checking the dataset after cleaning",

      "Comparing data before and after cleaning",

      "Basic data-cleaning workflow",

      "Documenting cleaning decisions",

      "Preparing clean data for EDA",

      "Preparing clean data for machine learning",
    ],

    tools: [
      "pandas",

      "shape",
      "info",
      "describe",

      "isnull",
      "isna",
      "notnull",
      "notna",

      "sum",

      "dropna",
      "fillna",

      "duplicated",
      "drop_duplicates",

      "astype",
      "to_numeric",
      "to_datetime",

      "unique",
      "nunique",
      "value_counts",

      "str.strip",
      "str.lower",
      "str.upper",
      "replace",

      "rename",

      "mean",
      "median",
      "mode",

      "LabelEncoder",
      "get_dummies",

      "StandardScaler",
    ],

    outcomes: [
      "Explain why data cleaning is required before analysis and modeling",

      "Inspect a raw dataset for common data-quality problems",

      "Identify missing values and calculate their frequency",

      "Choose simple strategies for handling missing values",

      "Use mean, median, mode and constant-value filling appropriately",

      "Detect and remove duplicate records",

      "Identify incorrect column data types",

      "Convert columns to appropriate numerical and datetime types",

      "Identify invalid and inconsistent values",

      "Inspect categorical values for inconsistencies",

      "Clean common text and category problems",

      "Standardize column names and categorical values",

      "Recognize potential outliers",

      "Understand when unusual observations require further investigation",

      "Encode simple categorical variables",

      "Understand the difference between label encoding and one-hot encoding",

      "Understand why numerical features may require scaling",

      "Apply basic standardization using StandardScaler",

      "Validate a dataset after cleaning",

      "Document important cleaning decisions",

      "Build a simple end-to-end data-cleaning workflow",

      "Prepare a dataset for exploratory data analysis",

      "Prepare a basic clean dataset for machine-learning models",
    ],
  },
    // =====================================================
  // EXPLORATORY DATA ANALYSIS
  // =====================================================

    {
    id: "eda-foundation",

    name: "Exploratory Data Analysis",

    category: "Data Analysis",

    description:
      "Learn a systematic exploratory data analysis workflow for understanding unfamiliar datasets, discovering patterns, investigating data quality, studying feature relationships and forming evidence-based hypotheses before machine-learning modeling.",

    difficulty: "intermediate",

    prerequisites: [
      "pandas-foundation",
      "basic-data-cleaning",
    ],

    estimatedMinutes: 480,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "What is exploratory data analysis",
      "Why EDA is important",
      "EDA before machine learning",
      "EDA workflow",

      "Understanding the problem statement",
      "Understanding the dataset context",
      "Identifying the target variable",

      "Dataset shape",
      "Number of rows",
      "Number of columns",
      "Column inspection",
      "Data types",
      "Dataset schema",

      "Numerical features",
      "Categorical features",
      "Datetime features",
      "Target features",

      "Summary statistics",
      "Count",
      "Mean",
      "Median",
      "Standard deviation",
      "Minimum",
      "Maximum",
      "Quartiles",

      "Missing-value analysis",
      "Missing-value counts",
      "Missing-value percentages",
      "Missing-value patterns",

      "Duplicate analysis",

      "Cardinality analysis",
      "Unique-value analysis",

      "Univariate analysis",
      "Numerical univariate analysis",
      "Categorical univariate analysis",

      "Frequency distributions",
      "Value counts",

      "Distribution analysis",
      "Normal distributions",
      "Skewed distributions",
      "Symmetric distributions",

      "Central tendency",
      "Spread",
      "Range",
      "Variance",
      "Standard deviation",
      "Interquartile range",

      "Outlier inspection",
      "Potential outliers",
      "Outliers using quartiles",
      "Outliers using box plots",

      "Bivariate analysis",
      "Numerical vs numerical analysis",
      "Categorical vs numerical analysis",
      "Categorical vs categorical analysis",

      "Scatter relationships",
      "Grouped statistics",
      "Cross-tabulation",

      "Correlation analysis",
      "Positive correlation",
      "Negative correlation",
      "Weak correlation",
      "Strong correlation",

      "Correlation matrix",
      "Correlation heatmap",

      "Correlation does not imply causation",

      "Feature-target analysis",
      "Numerical feature vs target",
      "Categorical feature vs target",

      "Regression target analysis",
      "Classification target analysis",

      "Class distribution",
      "Basic class imbalance awareness",

      "Comparing groups",
      "Segment analysis",

      "Relationship patterns",
      "Linear relationships",
      "Non-linear relationship awareness",

      "Potential redundant features",

      "Potential data leakage awareness",

      "Unexpected patterns",
      "Suspicious values",
      "Data-quality observations",

      "Creating EDA questions",
      "Creating hypotheses from data",
      "Testing simple hypotheses",

      "Recording EDA observations",

      "Turning observations into insights",

      "EDA-driven cleaning decisions",
      "EDA-driven preprocessing decisions",
      "EDA-driven feature ideas",
      "EDA-driven modeling questions",

      "Creating an EDA summary",

      "Complete beginner EDA workflow",
    ],

    tools: [
      "pandas",
      "numpy",

      "shape",
      "columns",
      "dtypes",

      "head",
      "tail",
      "sample",

      "info",
      "describe",

      "isnull",
      "isna",

      "duplicated",

      "unique",
      "nunique",
      "value_counts",

      "mean",
      "median",
      "std",
      "var",
      "quantile",

      "groupby",
      "agg",
      "crosstab",

      "corr",

      "matplotlib",
      "seaborn",

      "histplot",
      "countplot",
      "boxplot",
      "scatterplot",
      "heatmap",
    ],

    outcomes: [
      "Explain the purpose of exploratory data analysis",

      "Follow a structured EDA process on an unfamiliar dataset",

      "Understand the problem and identify the target variable",

      "Inspect dataset size, schema, columns and data types",

      "Separate numerical, categorical and target features",

      "Calculate and interpret descriptive statistics",

      "Analyze missing values and duplicate records",

      "Inspect feature cardinality and unique values",

      "Perform univariate analysis",

      "Analyze numerical feature distributions",

      "Analyze categorical feature frequencies",

      "Recognize skewed and unusual distributions",

      "Identify potential outliers",

      "Perform basic bivariate analysis",

      "Compare numerical and categorical variables",

      "Analyze relationships between numerical features",

      "Interpret correlation direction and strength",

      "Understand that correlation does not prove causation",

      "Analyze relationships between features and the target",

      "Inspect classification class distributions",

      "Compare groups and segments",

      "Recognize possible redundant features",

      "Recognize basic signs of potential data leakage",

      "Create useful questions and hypotheses from data",

      "Turn EDA observations into actionable insights",

      "Use EDA findings to guide data cleaning",

      "Use EDA findings to guide preprocessing",

      "Generate initial feature-engineering ideas",

      "Prepare an EDA summary before modeling",

      "Perform an end-to-end exploratory analysis independently",
    ],
  },


  // =====================================================
  // ADVANCED DATA CLEANING
  // =====================================================

    {
    id: "advanced-data-cleaning",

    name: "Advanced Data Cleaning",

    category: "Preprocessing",

    description:
      "Learn systematic, reproducible and leakage-aware techniques for cleaning complex real-world datasets and preparing reliable data for machine-learning workflows.",

    difficulty: "advanced",

    prerequisites: [
      "basic-data-cleaning",
      "eda-foundation",
    ],

    estimatedMinutes: 540,

    goals: [
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Real-world data-quality problems",
      "Systematic data-quality assessment",

      "Missing-value patterns",
      "Missing completely at random awareness",
      "Missing-value mechanism awareness",

      "Missing-value percentages",
      "Missing-value strategy selection",

      "Dropping vs imputing",

      "Numerical imputation",
      "Mean imputation",
      "Median imputation",
      "Constant imputation",

      "Categorical imputation",
      "Mode imputation",
      "Missing-category creation",

      "SimpleImputer",
      "Imputation strategy selection",

      "Missing indicators",

      "Duplicate interpretation",
      "Exact duplicates",
      "Potential semantic duplicates",

      "Invalid values",
      "Impossible values",
      "Range validation",
      "Domain validation",

      "Data-type validation",
      "Safe numeric conversion",
      "Datetime validation",

      "Inconsistent categories",
      "Category normalization",
      "Whitespace normalization",
      "Case normalization",

      "Rare categories",
      "Rare-category detection",
      "Grouping rare categories",

      "High-cardinality categorical features",

      "Outlier detection",
      "Statistical outliers",
      "Domain-based outliers",

      "IQR method",
      "Lower and upper fences",

      "Z-score awareness",

      "Outlier investigation",
      "Outlier removal",
      "Outlier capping",
      "Winsorization awareness",

      "When not to remove outliers",

      "Skewed distributions",
      "Positive skew",
      "Negative skew",

      "Log transformations",
      "Square-root transformations",
      "Transformation selection",

      "Feature scaling decisions",
      "Standardization",
      "Normalization awareness",
      "Robust scaling awareness",

      "Categorical encoding decisions",
      "Ordinal vs nominal categories",
      "Label encoding limitations",
      "One-hot encoding",

      "Cleaning numerical features",
      "Cleaning categorical features",
      "Cleaning datetime features",

      "Feature consistency",

      "Training and testing data separation",

      "Fitting preprocessing only on training data",

      "Data leakage",
      "Preprocessing leakage",
      "Target leakage",

      "Why cleaning before train-test splitting can be dangerous",

      "Train-safe transformations",

      "Reproducible preprocessing",

      "Cleaning functions",
      "Reusable cleaning workflows",

      "Data-quality validation after cleaning",

      "Schema validation awareness",

      "Before-and-after comparisons",

      "Documenting cleaning decisions",

      "Preparing data for ColumnTransformer",
      "Preparing data for Pipeline",

      "Production-style cleaning mindset",
    ],

    tools: [
      "pandas",
      "numpy",

      "SimpleImputer",

      "isna",
      "notna",
      "fillna",
      "dropna",

      "duplicated",
      "drop_duplicates",

      "astype",
      "to_numeric",
      "to_datetime",

      "replace",

      "str.strip",
      "str.lower",
      "str.upper",

      "unique",
      "nunique",
      "value_counts",

      "quantile",
      "IQR",

      "clip",

      "numpy.log1p",
      "numpy.sqrt",

      "StandardScaler",
      "RobustScaler",

      "OneHotEncoder",

      "train_test_split",

      "scikit-learn",
    ],

    outcomes: [
      "Perform a systematic data-quality assessment",

      "Analyze patterns of missing data",

      "Choose suitable missing-value strategies",

      "Impute numerical and categorical features appropriately",

      "Use SimpleImputer for reproducible imputation",

      "Distinguish simple duplicates from potentially meaningful repeated records",

      "Detect invalid and impossible values",

      "Validate numerical ranges and column data types",

      "Standardize inconsistent categorical values",

      "Identify and manage rare categories",

      "Recognize problems caused by high-cardinality features",

      "Detect potential outliers using statistical and domain-based methods",

      "Apply the IQR method correctly",

      "Decide whether an outlier should be retained, capped or removed",

      "Recognize skewed numerical distributions",

      "Apply appropriate transformations to skewed features",

      "Choose suitable scaling strategies",

      "Choose suitable encoding strategies for categorical variables",

      "Clean numerical, categorical and datetime features appropriately",

      "Explain preprocessing leakage",

      "Explain target leakage",

      "Fit data-dependent preprocessing using training data only",

      "Avoid contaminating validation and test datasets",

      "Build reusable cleaning workflows",

      "Validate data quality after preprocessing",

      "Document cleaning decisions",

      "Prepare clean features for ColumnTransformer and Pipeline",

      "Apply a production-oriented approach to data cleaning",
    ],
  },


  // =====================================================
  // ADVANCED EXPLORATORY DATA ANALYSIS
  // =====================================================

    {
    id: "advanced-eda",

    name: "Advanced Exploratory Data Analysis",

    category: "Data Analysis",

    description:
      "Perform deep target-aware, multivariate and modeling-oriented exploratory analysis to discover complex relationships, data risks, feature interactions and opportunities for preprocessing and feature engineering.",

    difficulty: "advanced",

    prerequisites: [
      "eda-foundation",
      "data-visualization",
      "statistics-foundation",
    ],

    estimatedMinutes: 600,

    goals: [
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Purpose of advanced EDA",
      "EDA as a modeling decision process",

      "Target-aware EDA",
      "Understanding target behavior",
      "Target distribution",

      "Classification target analysis",
      "Regression target analysis",

      "Class distribution",
      "Class imbalance",
      "Majority class",
      "Minority class",

      "Feature-target relationships",

      "Numerical feature vs numerical target",
      "Numerical feature vs categorical target",
      "Categorical feature vs numerical target",
      "Categorical feature vs categorical target",

      "Grouped target statistics",

      "Multivariate analysis",
      "Relationships among multiple variables",

      "Pairwise relationships",
      "Pair plots",

      "Correlation analysis",
      "Pearson correlation awareness",
      "Spearman correlation awareness",

      "Positive correlation",
      "Negative correlation",
      "Correlation strength",

      "Correlation versus causation",

      "Correlation matrices",
      "Correlation heatmaps",

      "Multicollinearity",
      "Highly correlated predictors",
      "Redundant features",
      "Multicollinearity consequences",

      "Variance Inflation Factor awareness",

      "Distribution analysis",
      "Distribution shape",

      "Skewness",
      "Positive skew",
      "Negative skew",

      "Kurtosis awareness",

      "Transformations suggested by EDA",

      "Outlier analysis",
      "Outlier influence",
      "Global outliers",
      "Group-specific outliers",

      "Distinguishing errors from legitimate extreme observations",

      "Feature interactions",
      "Interaction effects",

      "Conditional relationships",

      "Segment analysis",
      "Group comparisons",
      "Subpopulation analysis",

      "Categorical cardinality",
      "Rare categories",
      "High-cardinality features",

      "Category-target relationships",

      "Cross-tabulation",

      "Temporal pattern awareness",
      "Datetime trends",
      "Seasonality awareness",

      "Missingness as information",
      "Missing-value patterns",
      "Missingness vs target",

      "Data leakage detection",
      "Target leakage indicators",
      "Suspiciously predictive features",

      "Post-outcome variables",
      "Future-information leakage",

      "Train-test contamination awareness",

      "Feature redundancy",

      "Near-constant features",
      "Low-variance features",

      "Potential feature engineering opportunities",

      "Ratio features",
      "Interaction features",
      "Binned features",
      "Aggregated features",
      "Datetime-derived features",

      "Log-transform candidates",

      "EDA-driven scaling decisions",
      "EDA-driven encoding decisions",
      "EDA-driven imputation decisions",

      "EDA-driven feature selection",

      "EDA-driven model selection hypotheses",

      "Linear vs non-linear relationship awareness",

      "Model assumption awareness",

      "Regression assumptions awareness",
      "Classification considerations",

      "Dataset shift awareness",

      "Comparing training and test distributions",

      "Population differences",

      "Statistical vs practical significance awareness",

      "Avoiding overinterpretation",

      "Confounding awareness",

      "Sampling bias awareness",

      "Data collection bias awareness",

      "Turning plots into evidence",

      "Turning evidence into hypotheses",

      "Testing hypotheses using grouped analysis",

      "Prioritizing important findings",

      "Documenting EDA findings",

      "Creating an EDA report",

      "Creating preprocessing recommendations",

      "Creating feature-engineering recommendations",

      "Creating modeling recommendations",

      "Complete advanced EDA workflow",
    ],

    tools: [
      "pandas",
      "numpy",

      "matplotlib",
      "seaborn",

      "describe",
      "value_counts",

      "groupby",
      "agg",
      "crosstab",

      "corr",
      "cov",

      "quantile",

      "skew",
      "kurt",

      "histplot",
      "kdeplot",
      "countplot",

      "boxplot",
      "violinplot",

      "scatterplot",
      "lineplot",

      "heatmap",
      "pairplot",

      "pivot_table",
    ],

    outcomes: [
      "Explain how advanced EDA supports machine-learning decisions",

      "Perform target-aware exploratory analysis",

      "Analyze classification and regression targets appropriately",

      "Investigate relationships between features and targets",

      "Perform multivariate analysis",

      "Analyze pairwise relationships among features",

      "Interpret correlation matrices and heatmaps",

      "Distinguish correlation from causal conclusions",

      "Recognize highly correlated and potentially redundant features",

      "Explain the practical problem of multicollinearity",

      "Analyze skewness and unusual distributions",

      "Identify transformations suggested by EDA",

      "Investigate outliers instead of automatically removing them",

      "Discover feature interactions",

      "Perform segment and subgroup analysis",

      "Identify rare and high-cardinality categories",

      "Recognize class imbalance",

      "Analyze missingness as a potential source of information",

      "Recognize potential target leakage",

      "Recognize future-information leakage",

      "Identify suspiciously predictive variables",

      "Recognize near-constant and low-information features",

      "Generate feature-engineering ideas from EDA",

      "Use EDA to guide scaling, encoding and imputation choices",

      "Use EDA to guide feature selection",

      "Form model-selection hypotheses from observed relationships",

      "Recognize linear and non-linear patterns",

      "Compare distributions across datasets or data splits",

      "Recognize potential dataset shift",

      "Avoid overinterpreting correlations and visual patterns",

      "Recognize possible sampling and collection bias",

      "Turn exploratory plots into evidence-based conclusions",

      "Prioritize important findings",

      "Create a structured advanced EDA report",

      "Produce preprocessing recommendations from EDA",

      "Produce feature-engineering recommendations from EDA",

      "Produce initial modeling recommendations from EDA",

      "Perform an end-to-end advanced exploratory analysis independently",
    ],
  },

  // =====================================================
  // VISUALIZATION
  // =====================================================

    {
    id: "data-visualization",

    name: "Data Visualization with Matplotlib and Seaborn",

    category: "Data Analysis",

    description:
      "Learn how to explore and communicate data using Matplotlib and Seaborn, choose appropriate charts, customize visualizations and interpret patterns that matter for data analysis and machine learning.",

    difficulty: "basic",

    prerequisites: [
      "pandas-foundation",
      "eda-foundation",
    ],

    estimatedMinutes: 480,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Why data visualization matters",
      "Visualization in exploratory data analysis",
      "Visualization for communicating insights",

      "Matplotlib fundamentals",
      "pyplot",
      "Figure",
      "Axes",
      "Figure vs Axes",

      "Creating a basic plot",

      "Line plots",
      "When to use line plots",
      "Multiple lines",

      "Bar charts",
      "Vertical bar charts",
      "Horizontal bar charts",
      "Comparing categories",

      "Histograms",
      "Histogram bins",
      "Understanding distributions",

      "Scatter plots",
      "Relationships between numerical variables",

      "Box plots",
      "Quartiles",
      "Median",
      "Potential outliers",

      "Pie charts",
      "When pie charts are appropriate",
      "Limitations of pie charts",

      "Plot titles",
      "X-axis labels",
      "Y-axis labels",
      "Legends",

      "Axis limits",
      "Ticks",
      "Grid",

      "Figure size",

      "Subplots",
      "Multiple visualizations in one figure",

      "Seaborn fundamentals",
      "Matplotlib vs Seaborn",

      "histplot",
      "countplot",
      "barplot",
      "scatterplot",
      "lineplot",
      "boxplot",

      "violinplot",

      "Distribution visualization",
      "KDE visualization",

      "Categorical visualization",

      "Relationship visualization",

      "Correlation heatmaps",
      "Correlation matrices",

      "pairplot",
      "Pairwise relationships",

      "Hue",
      "Visualizing categories using hue",

      "Comparing distributions across categories",

      "Feature distribution visualization",

      "Target distribution visualization",

      "Feature-target visualization",

      "Classification visualization",
      "Regression visualization",

      "Visualizing missing data patterns",

      "Visualizing outliers",

      "Visualizing skewness",

      "Choosing the correct chart",

      "Numerical vs numerical visualization",
      "Categorical vs numerical visualization",
      "Categorical vs categorical visualization",

      "Univariate visualization",
      "Bivariate visualization",
      "Multivariate visualization",

      "Avoiding misleading visualizations",

      "Truncated axes",
      "Inappropriate chart selection",
      "Overcrowded plots",
      "Too many categories",
      "Misleading scales",

      "Readable visualization design",

      "Turning plots into observations",
      "Turning observations into insights",

      "Visualization workflow for EDA",

      "Visualization before machine learning",
    ],

    tools: [
      "matplotlib",
      "matplotlib.pyplot",
      "seaborn",

      "plt.figure",
      "plt.subplots",

      "plt.plot",
      "plt.bar",
      "plt.barh",
      "plt.hist",
      "plt.scatter",
      "plt.boxplot",
      "plt.pie",

      "plt.title",
      "plt.xlabel",
      "plt.ylabel",
      "plt.legend",
      "plt.grid",
      "plt.xlim",
      "plt.ylim",
      "plt.xticks",
      "plt.yticks",
      "plt.tight_layout",
      "plt.show",

      "sns.histplot",
      "sns.countplot",
      "sns.barplot",
      "sns.scatterplot",
      "sns.lineplot",
      "sns.boxplot",
      "sns.violinplot",
      "sns.kdeplot",
      "sns.heatmap",
      "sns.pairplot",
    ],

    outcomes: [
      "Explain why visualization is important in data analysis and machine learning",

      "Understand the Matplotlib Figure and Axes model",

      "Create line, bar, histogram, scatter and box plots",

      "Choose appropriate plots for different types of variables",

      "Customize titles, labels, legends, grids and figure sizes",

      "Create and organize multiple plots using subplots",

      "Use Seaborn for statistical data visualization",

      "Create distribution plots using histograms and KDE",

      "Visualize categorical feature frequencies",

      "Compare numerical distributions across categories",

      "Visualize relationships between numerical variables",

      "Create and interpret correlation heatmaps",

      "Use pairplots to inspect multiple feature relationships",

      "Use hue to visualize additional categorical information",

      "Visualize target distributions",

      "Visualize feature-target relationships",

      "Identify potential outliers visually",

      "Recognize skewed distributions visually",

      "Select charts for numerical, categorical and mixed-variable analysis",

      "Perform univariate, bivariate and basic multivariate visualization",

      "Recognize misleading or poorly designed visualizations",

      "Create readable and useful exploratory plots",

      "Translate visual patterns into meaningful observations",

      "Use visualization as part of a structured EDA workflow",
    ],
  },

  // =====================================================
  // STATISTICS
  // =====================================================

  {
    id: "statistics-foundation",
    name: "Statistics for Machine Learning",
    category: "Mathematics",
    description:
      "Learn statistical concepts required to understand datasets and machine-learning models.",

    difficulty: "intermediate",

    prerequisites: [
      "numpy-foundation",
    ],

    estimatedMinutes: 420,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "deep-learning",
      "placement",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Mean",
      "Median",
      "Mode",
      "Variance",
      "Standard deviation",
      "Probability",
      "Distributions",
      "Correlation",
      "Covariance",
    ],

    tools: [
      "numpy",
      "pandas",
    ],

    outcomes: [
      "Understand descriptive statistics",
      "Interpret distributions",
      "Understand correlation",
      "Use statistics when analyzing datasets",
    ],
  },

  // =====================================================
  // MACHINE LEARNING FUNDAMENTALS
  // =====================================================

  {
    id: "ml-foundations",
    name: "Machine Learning Fundamentals",
    category: "Machine Learning",
    description:
      "Understand how machine-learning problems, datasets and model training work.",

    difficulty: "basic",

    prerequisites: [
      "pandas-foundation",
      "statistics-foundation",
    ],

    estimatedMinutes: 300,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Supervised learning",
      "Unsupervised learning",
      "Features",
      "Target variables",
      "Training data",
      "Testing data",
      "Overfitting",
      "Underfitting",
      "Bias",
      "Variance",
    ],

    tools: [
      "scikit-learn",
    ],

    outcomes: [
      "Identify ML problem types",
      "Separate features and targets",
      "Understand model training",
      "Understand generalization",
    ],
  },

  // =====================================================
  // TRAIN TEST SPLIT
  // =====================================================

  {
    id: "train-test-evaluation",
    name: "Train/Test Split and Evaluation",
    category: "Machine Learning",
    description:
      "Learn how to correctly separate training and testing data and evaluate predictions.",

    difficulty: "basic",

    prerequisites: [
      "ml-foundations",
    ],

    estimatedMinutes: 240,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Training set",
      "Testing set",
      "Random state",
      "Evaluation",
      "Generalization",
    ],

    tools: [
      "train_test_split",
    ],

    outcomes: [
      "Split datasets correctly",
      "Train models on training data",
      "Evaluate models using unseen data",
    ],
  },
    // =====================================================
  // GRADIENT DESCENT
  // =====================================================

  {
    id: "gradient-descent",

    name: "Gradient Descent",

    category: "Machine Learning Mathematics",

    description:
      "Understand how machine-learning models minimize loss by iteratively updating parameters in the direction that reduces prediction error.",

    difficulty: "intermediate",

    prerequisites: [
      "statistics-foundation",
      "ml-foundations",
      "train-test-evaluation",
    ],

    estimatedMinutes: 360,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "deep-learning",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Optimization in machine learning",
      "Model parameters",
      "Loss functions",
      "Cost functions",
      "Objective functions",

      "Why machine-learning models need optimization",

      "Gradient descent intuition",
      "Loss surface",
      "Parameter space",
      "Direction of steepest increase",
      "Direction of steepest decrease",

      "Gradient",
      "Partial derivatives",
      "Derivative intuition",
      "Slope intuition",

      "Gradient descent update rule",

      "Current parameter value",
      "Gradient of the loss",
      "Learning rate",

      "Parameter update",

      "Learning rate intuition",
      "Small learning rate",
      "Large learning rate",
      "Appropriate learning rate",

      "Convergence",
      "Convergence behavior",
      "Stopping criteria",

      "Iterations",
      "Epochs",

      "Local minima",
      "Global minima",
      "Saddle points",

      "Convex loss functions",
      "Non-convex loss functions",

      "Gradient descent for Linear Regression",

      "Mean Squared Error",
      "MSE loss surface",

      "Updating regression coefficients",
      "Updating intercept",

      "Batch Gradient Descent",
      "Stochastic Gradient Descent",
      "Mini-Batch Gradient Descent",

      "Batch size",

      "Advantages of Batch Gradient Descent",
      "Advantages of Stochastic Gradient Descent",
      "Advantages of Mini-Batch Gradient Descent",

      "Noise in gradient updates",

      "Feature scaling and optimization",

      "Why scaling affects Gradient Descent",
      "Poorly scaled loss surfaces",
      "Faster convergence after scaling",

      "Standardization before optimization",

      "Initialization of parameters",

      "Zero initialization",
      "Random initialization awareness",

      "Optimization trajectory",

      "Learning curves",
      "Loss vs iteration",

      "Detecting convergence problems",

      "Oscillation",
      "Divergence",
      "Slow convergence",

      "Learning-rate tuning",

      "Gradient descent vs analytical solutions",

      "Normal equation awareness",

      "Gradient descent in Logistic Regression",

      "Gradient descent in neural networks",

      "Relationship between backpropagation and Gradient Descent",

      "Regularization and optimization",

      "Gradient Descent with L1 regularization awareness",
      "Gradient Descent with L2 regularization awareness",

      "Early stopping awareness",

      "Common Gradient Descent mistakes",

      "Using an excessively large learning rate",
      "Using an excessively small learning rate",
      "Ignoring feature scaling",
      "Stopping optimization too early",
      "Running unnecessary iterations",

      "Visual interpretation of optimization",

      "One-dimensional loss surface",
      "Two-dimensional loss surface",
      "Three-dimensional loss surface",

      "Optimization path on a loss surface",

      "Practical Gradient Descent workflow",
    ],

    tools: [
      "Python",
      "NumPy",
      "matplotlib",
      "StandardScaler",
      "SGDRegressor",
      "SGDClassifier",
    ],

    outcomes: [
      "Explain why optimization is required in machine learning",

      "Explain the relationship between model parameters and a loss function",

      "Understand Gradient Descent intuitively",

      "Explain what a gradient represents",

      "Interpret the direction and magnitude of a gradient",

      "Understand the Gradient Descent parameter-update rule",

      "Explain the role of the learning rate",

      "Recognize learning rates that are too small or too large",

      "Explain convergence",

      "Interpret loss-versus-iteration curves",

      "Understand local minima, global minima and saddle points",

      "Distinguish convex and non-convex optimization problems",

      "Apply Gradient Descent to a simple Linear Regression problem",

      "Understand how weights and intercepts are updated",

      "Implement basic Gradient Descent using NumPy",

      "Differentiate Batch, Stochastic and Mini-Batch Gradient Descent",

      "Explain the advantages and disadvantages of each Gradient Descent variant",

      "Explain why feature scaling can improve optimization",

      "Recognize oscillation, divergence and slow convergence",

      "Tune a learning rate experimentally",

      "Understand the relationship between Gradient Descent and Linear Regression",

      "Understand how Gradient Descent is used in Logistic Regression",

      "Understand why Gradient Descent becomes important for neural networks",

      "Connect Gradient Descent with later deep-learning optimization concepts",

      "Use SGDRegressor and SGDClassifier at a conceptual level",

      "Visualize an optimization path on a loss surface",

      "Diagnose common Gradient Descent problems",

      "Choose sensible optimization settings for basic machine-learning problems",
    ],
  },

  // =====================================================
  // LINEAR REGRESSION
  // =====================================================

  {
    id: "linear-regression",
    name: "Linear Regression",
    category: "Regression",
    description:
      "Learn how linear regression models relationships between numerical variables.",

    difficulty: "basic",

    prerequisites: [
      "ml-foundations",
      "train-test-evaluation",
    ],

    estimatedMinutes: 300,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Regression",
      "Best-fit line",
      "Coefficients",
      "Intercept",
      "Residuals",
      "Mean squared error",
      "R squared",
    ],

    tools: [
      "LinearRegression",
      "mean_squared_error",
      "r2_score",
    ],

    outcomes: [
      "Train a regression model",
      "Generate predictions",
      "Evaluate regression performance",
    ],
  },

  // =====================================================
  // LOGISTIC REGRESSION
  // =====================================================

  {
    id: "logistic-regression",
    name: "Logistic Regression",
    category: "Classification",
    description:
      "Learn binary classification using logistic regression.",

    difficulty: "intermediate",

    prerequisites: [
      "ml-foundations",
      "train-test-evaluation",
    ],

    estimatedMinutes: 330,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Classification",
      "Probability",
      "Sigmoid function",
      "Decision threshold",
      "Confusion matrix",
      "Accuracy",
      "Precision",
      "Recall",
      "F1 score",
    ],

    tools: [
      "LogisticRegression",
      "accuracy_score",
      "confusion_matrix",
      "classification_report",
    ],

    outcomes: [
      "Train a classification model",
      "Interpret classification predictions",
      "Evaluate classification performance",
    ],
  },

  // =====================================================
  // DECISION TREE
  // =====================================================

  {
    id: "decision-tree",
    name: "Decision Trees",
    category: "Machine Learning",
    description:
      "Understand tree-based models, splitting and feature decisions.",

    difficulty: "intermediate",

    prerequisites: [
      "ml-foundations",
    ],

    estimatedMinutes: 360,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Decision nodes",
      "Leaf nodes",
      "Entropy",
      "Gini impurity",
      "Information gain",
      "Tree depth",
      "Overfitting",
    ],

    tools: [
      "DecisionTreeClassifier",
      "DecisionTreeRegressor",
    ],

    outcomes: [
      "Understand tree splitting",
      "Train decision-tree models",
      "Control tree complexity",
    ],
  },

  // =====================================================
  // RANDOM FOREST
  // =====================================================

  {
    id: "random-forest",
    name: "Random Forest",
    category: "Ensemble Learning",
    description:
      "Learn how multiple decision trees can be combined into an ensemble.",

    difficulty: "intermediate",

    prerequisites: [
      "decision-tree",
    ],

    estimatedMinutes: 330,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Ensemble learning",
      "Bagging",
      "Bootstrap sampling",
      "Random feature selection",
      "Feature importance",
    ],

    tools: [
      "RandomForestClassifier",
      "RandomForestRegressor",
    ],

    outcomes: [
      "Understand ensemble learning",
      "Train random forests",
      "Compare trees with forests",
    ],
  },
    // =====================================================
  // K-NEAREST NEIGHBORS
  // =====================================================

  {
    id: "knn",
    name: "K-Nearest Neighbors",
    category: "Supervised Learning",
    description:
      "Learn instance-based learning using nearby data points for classification and regression.",

    difficulty: "intermediate",

    prerequisites: [
      "train-test-evaluation",
    ],

    estimatedMinutes: 300,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Nearest neighbors",
      "Distance metrics",
      "Euclidean distance",
      "Choosing K",
      "Decision boundaries",
      "Feature scaling",
      "Curse of dimensionality",
      "Classification vs regression",
    ],

    tools: [
      "KNeighborsClassifier",
      "KNeighborsRegressor",
      "StandardScaler",
    ],

    outcomes: [
      "Understand distance-based learning",
      "Train KNN models",
      "Choose useful values of K",
      "Understand why feature scaling matters",
      "Recognize limitations of KNN",
    ],
  },

  // =====================================================
  // NAIVE BAYES
  // =====================================================

  {
    id: "naive-bayes",
    name: "Naive Bayes",
    category: "Supervised Learning",
    description:
      "Learn probabilistic classification using Bayes' theorem and conditional probabilities.",

    difficulty: "intermediate",

    prerequisites: [
      "statistics-foundation",
      "ml-foundations",
    ],

    estimatedMinutes: 300,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Bayes theorem",
      "Prior probability",
      "Likelihood",
      "Posterior probability",
      "Conditional probability",
      "Conditional independence assumption",
      "Gaussian Naive Bayes",
      "Multinomial Naive Bayes",
    ],

    tools: [
      "GaussianNB",
      "MultinomialNB",
    ],

    outcomes: [
      "Understand probabilistic classification",
      "Apply Bayes theorem to classification",
      "Train Naive Bayes models",
      "Choose appropriate Naive Bayes variants",
    ],
  },

  // =====================================================
  // SUPPORT VECTOR MACHINES
  // =====================================================

  {
    id: "svm",
    name: "Support Vector Machines",
    category: "Supervised Learning",
    description:
      "Learn maximum-margin classification, support vectors and kernel-based decision boundaries.",

    difficulty: "advanced",

    prerequisites: [
      "logistic-regression",
      "train-test-evaluation",
    ],

    estimatedMinutes: 420,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Separating hyperplane",
      "Maximum margin",
      "Support vectors",
      "Hard margin",
      "Soft margin",
      "C parameter",
      "Kernel trick",
      "Linear kernel",
      "RBF kernel",
      "Gamma",
      "Feature scaling",
    ],

    tools: [
      "SVC",
      "SVR",
      "StandardScaler",
    ],

    outcomes: [
      "Understand maximum-margin learning",
      "Explain support vectors",
      "Train SVM classifiers",
      "Understand kernels",
      "Tune C and gamma",
      "Recognize when SVM is appropriate",
    ],
  },

  // =====================================================
  // K-MEANS CLUSTERING
  // =====================================================

  {
    id: "kmeans",
    name: "K-Means Clustering",
    category: "Unsupervised Learning",
    description:
      "Discover groups in unlabeled data using centroid-based clustering.",

    difficulty: "intermediate",

    prerequisites: [
      "numpy-foundation",
      "eda-foundation",
      "ml-foundations",
    ],

    estimatedMinutes: 360,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "data-analyst",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Supervised vs unsupervised learning",
      "Clusters",
      "Centroids",
      "Cluster assignment",
      "Centroid updates",
      "Inertia",
      "Elbow method",
      "Silhouette score",
      "Feature scaling",
      "Initialization",
    ],

    tools: [
      "KMeans",
      "silhouette_score",
      "StandardScaler",
    ],

    outcomes: [
      "Understand clustering",
      "Train K-Means models",
      "Interpret cluster assignments",
      "Estimate useful cluster counts",
      "Evaluate clustering quality",
    ],
  },

  // =====================================================
  // PCA
  // =====================================================

  {
    id: "pca",
    name: "Principal Component Analysis",
    category: "Dimensionality Reduction",
    description:
      "Reduce high-dimensional datasets while preserving important variation in the data.",

    difficulty: "advanced",

    prerequisites: [
      "numpy-foundation",
      "statistics-foundation",
      "advanced-eda",
    ],

    estimatedMinutes: 360,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Dimensionality reduction",
      "Variance",
      "Principal components",
      "Explained variance",
      "Feature projection",
      "Feature scaling before PCA",
      "Information preservation",
      "Visualization of high-dimensional data",
    ],

    tools: [
      "PCA",
      "StandardScaler",
    ],

    outcomes: [
      "Understand dimensionality reduction",
      "Apply PCA",
      "Interpret explained variance",
      "Choose numbers of components",
      "Visualize reduced-dimensional data",
    ],
  },

  // =====================================================
  // GRADIENT BOOSTING
  // =====================================================

  {
    id: "gradient-boosting",
    name: "Gradient Boosting",
    category: "Ensemble Learning",
    description:
      "Learn boosting by sequentially combining weak learners to correct previous prediction errors.",

    difficulty: "advanced",

    prerequisites: [
      "decision-tree",
      "random-forest",
    ],

    estimatedMinutes: 420,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Boosting",
      "Weak learners",
      "Sequential learning",
      "Residual correction",
      "Learning rate",
      "Number of estimators",
      "Tree depth",
      "Bias-variance tradeoff",
    ],

    tools: [
      "GradientBoostingClassifier",
      "GradientBoostingRegressor",
    ],

    outcomes: [
      "Understand boosting",
      "Compare bagging and boosting",
      "Train gradient boosting models",
      "Understand learning rate and estimator tradeoffs",
    ],
  },

  // =====================================================
  // XGBOOST
  // =====================================================

  {
    id: "xgboost",
    name: "XGBoost",
    category: "Ensemble Learning",
    description:
      "Learn practical gradient-boosted decision trees using XGBoost and understand the parameters that control model complexity.",

    difficulty: "advanced",

    prerequisites: [
      "gradient-boosting",
      "cross-validation",
    ],

    estimatedMinutes: 480,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "placement",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Gradient boosted trees",
      "Regularization",
      "Learning rate",
      "Tree depth",
      "Number of estimators",
      "Subsampling",
      "Column sampling",
      "Overfitting control",
      "Feature importance",
    ],

    tools: [
      "XGBClassifier",
      "XGBRegressor",
    ],

    outcomes: [
      "Understand how XGBoost extends boosting",
      "Train XGBoost models",
      "Tune important XGBoost parameters",
      "Control model complexity",
      "Compare XGBoost with random forests",
    ],
  },

  // =====================================================
  // FEATURE ENGINEERING
  // =====================================================

  {
    id: "feature-engineering",
    name: "Feature Engineering",
    category: "Data Preparation",
    description:
      "Create, transform and select useful features that help machine-learning models learn better representations.",

    difficulty: "advanced",

    prerequisites: [
      "advanced-data-cleaning",
      "advanced-eda",
      "ml-foundations",
    ],

    estimatedMinutes: 420,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Feature creation",
      "Feature transformation",
      "Interaction features",
      "Binning",
      "Log transformations",
      "Date and time features",
      "Categorical features",
      "Feature selection",
      "Redundant features",
      "Data leakage",
    ],

    tools: [
      "Pandas",
      "NumPy",
      "PolynomialFeatures",
      "SelectKBest",
    ],

    outcomes: [
      "Create meaningful features",
      "Transform skewed variables",
      "Identify redundant features",
      "Avoid leakage during feature engineering",
      "Evaluate whether engineered features improve a model",
    ],
  },

  // =====================================================
  // IMBALANCED DATA
  // =====================================================

  {
    id: "imbalanced-learning",
    name: "Learning with Imbalanced Data",
    category: "Model Improvement",
    description:
      "Learn how to train and evaluate classifiers when one class is much less common than another.",

    difficulty: "advanced",

    prerequisites: [
      "advanced-classification-evaluation",
    ],

    estimatedMinutes: 360,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Class imbalance",
      "Majority class",
      "Minority class",
      "Why accuracy can mislead",
      "Precision",
      "Recall",
      "F1 score",
      "PR-AUC",
      "Class weights",
      "Resampling concepts",
      "Decision thresholds",
    ],

    tools: [
      "class_weight",
      "precision_recall_curve",
      "classification_report",
    ],

    outcomes: [
      "Recognize class imbalance",
      "Choose appropriate evaluation metrics",
      "Use class weighting",
      "Understand resampling strategies",
      "Tune classification thresholds",
    ],
  },

  // =====================================================
  // MODEL INTERPRETABILITY
  // =====================================================

  {
    id: "model-interpretability",
    name: "Model Interpretability",
    category: "Model Understanding",
    description:
      "Understand why a model makes predictions and communicate important model behavior.",

    difficulty: "advanced",

    prerequisites: [
      "random-forest",
      "advanced-eda",
    ],

    estimatedMinutes: 360,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Global interpretation",
      "Local interpretation",
      "Feature importance",
      "Permutation importance",
      "Partial dependence",
      "Prediction explanations",
      "Correlation vs importance",
      "Interpretation limitations",
    ],

    tools: [
      "permutation_importance",
      "PartialDependenceDisplay",
    ],

    outcomes: [
      "Interpret model behavior",
      "Calculate permutation importance",
      "Explain important model features",
      "Recognize limitations of feature importance",
    ],
  },


  // =====================================================
  // ADVANCED PREPROCESSING
  // =====================================================

  {
    id: "advanced-preprocessing",
    name: "Production-Style Preprocessing",
    category: "Preprocessing",
    description:
      "Build reusable and leakage-resistant preprocessing workflows.",

    difficulty: "advanced",

    prerequisites: [
      "pandas-foundation",
      "ml-foundations",
    ],

    estimatedMinutes: 480,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "deep-learning",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Reusable preprocessing",
      "Numerical preprocessing",
      "Categorical preprocessing",
      "Missing-value strategies",
      "Data leakage",
      "Training-time transformations",
      "Inference-time transformations",
    ],

    tools: [
      "SimpleImputer",
      "OneHotEncoder",
      "StandardScaler",
      "ColumnTransformer",
      "Pipeline",
    ],

    outcomes: [
      "Build reusable preprocessing pipelines",
      "Apply different transformations to different columns",
      "Reduce preprocessing leakage",
      "Combine preprocessing and model training",
    ],
  },

  // =====================================================
  // CROSS VALIDATION
  // =====================================================

  {
    id: "cross-validation",
    name: "Cross-Validation",
    category: "Model Evaluation",
    description:
      "Evaluate models across multiple data splits rather than relying on one split.",

    difficulty: "advanced",

    prerequisites: [
      "train-test-evaluation",
    ],

    estimatedMinutes: 300,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "deep-learning",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "K-fold cross-validation",
      "Validation scores",
      "Stratification",
      "Model stability",
    ],

    tools: [
      "cross_val_score",
      "KFold",
      "StratifiedKFold",
    ],

    outcomes: [
      "Evaluate models across multiple splits",
      "Interpret validation variability",
      "Choose appropriate validation strategies",
    ],
  },

  // =====================================================
  // HYPERPARAMETER TUNING
  // =====================================================

  {
    id: "hyperparameter-tuning",
    name: "Hyperparameter Tuning",
    category: "Model Improvement",
    description:
      "Systematically search for useful model configurations.",

    difficulty: "advanced",

    prerequisites: [
      "cross-validation",
    ],

    estimatedMinutes: 420,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Parameters vs hyperparameters",
      "Search spaces",
      "Grid search",
      "Random search",
      "Cross-validated tuning",
      "Overfitting during tuning",
    ],

    tools: [
      "GridSearchCV",
      "RandomizedSearchCV",
    ],

    outcomes: [
      "Define hyperparameter search spaces",
      "Tune models systematically",
      "Compare candidate configurations",
    ],
  },

  // =====================================================
  // ADVANCED CLASSIFICATION EVALUATION
  // =====================================================

  {
    id: "advanced-classification-evaluation",
    name: "Advanced Classification Evaluation",
    category: "Model Evaluation",
    description:
      "Evaluate classifiers beyond accuracy and understand decision thresholds.",

    difficulty: "advanced",

    prerequisites: [
      "logistic-regression",
    ],

    estimatedMinutes: 360,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "ROC curve",
      "ROC-AUC",
      "Precision-recall tradeoff",
      "Class imbalance",
      "Decision thresholds",
      "False positive cost",
      "False negative cost",
    ],

    tools: [
      "roc_auc_score",
      "roc_curve",
      "precision_recall_curve",
    ],

    outcomes: [
      "Evaluate models beyond accuracy",
      "Understand threshold tradeoffs",
      "Choose metrics based on the problem",
    ],
  },

  // =====================================================
  // EXPERIMENTATION
  // =====================================================

  {
    id: "experiment-tracking",
    name: "ML Experimentation and Reproducibility",
    category: "ML Engineering",
    description:
      "Learn how to compare experiments and reproduce machine-learning results.",

    difficulty: "advanced",

    prerequisites: [
      "hyperparameter-tuning",
    ],

    estimatedMinutes: 360,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "advanced",
    ],

    concepts: [
      "Experiment configuration",
      "Metric tracking",
      "Random seeds",
      "Reproducibility",
      "Model comparison",
      "Experiment history",
    ],

    tools: [
      "ModelMind Experiments",
    ],

    outcomes: [
      "Track model experiments",
      "Compare configurations",
      "Reproduce previous results",
      "Document modeling decisions",
    ],
  },
    // =====================================================
  // DATA LEAKAGE
  // =====================================================

  {
    id: "data-leakage",
    name: "Data Leakage & Leakage Prevention",
    category: "ML Foundations",
    description:
      "Understand how information can accidentally leak from validation or test data into training and produce misleading model performance.",

    difficulty: "intermediate",

    prerequisites: [
      "ml-foundations",
      "train-test-evaluation",
    ],

    estimatedMinutes: 180,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Target leakage",
      "Train-test contamination",
      "Preprocessing leakage",
      "Feature leakage",
      "Temporal leakage",
      "Leakage during feature engineering",
      "Leakage during imputation",
      "Leakage during scaling",
      "Leakage during feature selection",
      "Leakage during cross-validation",
      "Safe preprocessing workflow",
    ],

    tools: [
      "train_test_split",
      "Pipeline",
      "ColumnTransformer",
      "cross_val_score",
    ],

    outcomes: [
      "Identify common forms of data leakage",
      "Explain why leakage creates unrealistic evaluation scores",
      "Separate training and evaluation information correctly",
      "Use pipelines to reduce preprocessing leakage",
    ],
  },

  // =====================================================
  // BIAS-VARIANCE
  // =====================================================

  {
    id: "bias-variance",
    name: "Bias, Variance, Underfitting & Overfitting",
    category: "ML Foundations",
    description:
      "Understand model complexity, underfitting, overfitting and the bias-variance trade-off.",

    difficulty: "intermediate",

    prerequisites: [
      "ml-foundations",
      "train-test-evaluation",
    ],

    estimatedMinutes: 210,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Bias",
      "Variance",
      "Underfitting",
      "Overfitting",
      "Model complexity",
      "Training error",
      "Validation error",
      "Generalization",
      "Bias-variance trade-off",
      "Regularization intuition",
    ],

    tools: [
      "learning_curve",
      "validation_curve",
      "Matplotlib",
      "scikit-learn",
    ],

    outcomes: [
      "Differentiate underfitting and overfitting",
      "Interpret training and validation performance together",
      "Explain the bias-variance trade-off",
      "Choose appropriate strategies for improving generalization",
    ],
  },

  // =====================================================
  // FEATURE SCALING
  // =====================================================

  {
    id: "feature-scaling",
    name: "Feature Scaling & Numerical Transformations",
    category: "Preprocessing",
    description:
      "Learn when numerical features require scaling and how different scaling strategies affect machine-learning models.",

    difficulty: "intermediate",

    prerequisites: [
      "pandas-foundation",
      "ml-foundations",
    ],

    estimatedMinutes: 210,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Feature scale",
      "Standardization",
      "Normalization",
      "Min-max scaling",
      "Robust scaling",
      "Mean and standard deviation",
      "Effect of outliers",
      "Distance-based models",
      "Gradient-based models",
      "Models that usually do not require scaling",
      "Fit on training data only",
    ],

    tools: [
      "StandardScaler",
      "MinMaxScaler",
      "RobustScaler",
      "Pipeline",
    ],

    outcomes: [
      "Explain why feature scaling is needed",
      "Choose an appropriate scaling strategy",
      "Identify models sensitive to feature scale",
      "Apply scaling without leaking test information",
    ],
  },

  // =====================================================
  // CATEGORICAL ENCODING
  // =====================================================

  {
    id: "categorical-encoding",
    name: "Categorical Encoding",
    category: "Preprocessing",
    description:
      "Transform categorical variables into representations that machine-learning algorithms can use correctly.",

    difficulty: "intermediate",

    prerequisites: [
      "pandas-foundation",
      "ml-foundations",
    ],

    estimatedMinutes: 240,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Categorical features",
      "Nominal variables",
      "Ordinal variables",
      "Label encoding",
      "Ordinal encoding",
      "One-hot encoding",
      "Dummy variables",
      "Unknown categories",
      "High-cardinality features",
      "Encoding leakage",
    ],

    tools: [
      "OneHotEncoder",
      "OrdinalEncoder",
      "LabelEncoder",
      "ColumnTransformer",
      "Pandas",
    ],

    outcomes: [
      "Distinguish nominal and ordinal categories",
      "Choose an appropriate encoding strategy",
      "Avoid introducing artificial ordering",
      "Handle unseen categories safely",
    ],
  },

  // =====================================================
  // MISSING VALUE HANDLING
  // =====================================================

  {
    id: "missing-value-handling",
    name: "Missing Values & Imputation",
    category: "Preprocessing",
    description:
      "Understand missing data and build reliable imputation strategies for numerical and categorical features.",

    difficulty: "intermediate",

    prerequisites: [
      "basic-data-cleaning",
      "pandas-foundation",
    ],

    estimatedMinutes: 240,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "beginner",
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Missing values",
      "Missing-data patterns",
      "Dropping missing observations",
      "Mean imputation",
      "Median imputation",
      "Mode imputation",
      "Constant-value imputation",
      "Missing indicators",
      "Imputation leakage",
      "Train-only fitting",
    ],

    tools: [
      "isna",
      "fillna",
      "SimpleImputer",
      "MissingIndicator",
      "Pipeline",
    ],

    outcomes: [
      "Detect missing values",
      "Choose an appropriate missing-value strategy",
      "Use SimpleImputer correctly",
      "Prevent information leakage during imputation",
    ],
  },

  // =====================================================
  // OUTLIER HANDLING
  // =====================================================

  {
    id: "outlier-handling",
    name: "Outliers & Robust Preprocessing",
    category: "Preprocessing",
    description:
      "Detect, investigate and appropriately handle unusual observations without blindly deleting useful data.",

    difficulty: "intermediate",

    prerequisites: [
      "statistics-foundation",
      "eda-foundation",
    ],

    estimatedMinutes: 210,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Outliers",
      "Extreme values",
      "IQR method",
      "Z-score intuition",
      "Box plots",
      "Domain-valid extremes",
      "Measurement errors",
      "Capping and clipping",
      "Transformations",
      "Robust statistics",
      "Effect of outliers on models",
    ],

    tools: [
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "RobustScaler",
    ],

    outcomes: [
      "Detect potential outliers",
      "Distinguish unusual observations from data errors",
      "Explain how outliers affect different models",
      "Choose appropriate outlier-handling strategies",
    ],
  },

  // =====================================================
  // POLYNOMIAL REGRESSION
  // =====================================================

  {
    id: "polynomial-regression",
    name: "Polynomial Regression",
    category: "Regression",
    description:
      "Extend linear regression with polynomial features to model nonlinear relationships.",

    difficulty: "intermediate",

    prerequisites: [
      "linear-regression",
    ],

    estimatedMinutes: 210,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Nonlinear relationships",
      "Polynomial features",
      "Degree",
      "Feature expansion",
      "Interaction terms",
      "Curve fitting",
      "Overfitting with high-degree polynomials",
      "Model complexity",
    ],

    tools: [
      "PolynomialFeatures",
      "LinearRegression",
      "Pipeline",
      "Matplotlib",
    ],

    outcomes: [
      "Explain polynomial regression",
      "Generate polynomial features",
      "Control polynomial model complexity",
      "Recognize overfitting caused by excessive polynomial degree",
    ],
  },

  // =====================================================
  // REGULARIZATION
  // =====================================================

  {
    id: "regularization",
    name: "Regularization: Ridge, Lasso & Elastic Net",
    category: "Model Improvement",
    description:
      "Control model complexity using penalties that constrain model coefficients.",

    difficulty: "intermediate",

    prerequisites: [
      "linear-regression",
      "bias-variance",
    ],

    estimatedMinutes: 270,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Regularization",
      "L1 penalty",
      "L2 penalty",
      "Ridge regression",
      "Lasso regression",
      "Elastic Net",
      "Coefficient shrinkage",
      "Regularization strength",
      "Feature selection effect of Lasso",
      "Bias-variance relationship",
    ],

    tools: [
      "Ridge",
      "Lasso",
      "ElasticNet",
      "StandardScaler",
      "Pipeline",
    ],

    outcomes: [
      "Explain why regularization is useful",
      "Differentiate L1 and L2 penalties",
      "Use Ridge, Lasso and Elastic Net",
      "Interpret the effect of regularization strength",
    ],
  },

  // =====================================================
  // FEATURE SELECTION
  // =====================================================

  {
    id: "feature-selection",
    name: "Feature Selection",
    category: "Feature Engineering",
    description:
      "Select useful predictors while reducing unnecessary complexity, noise and redundant information.",

    difficulty: "advanced",

    prerequisites: [
      "feature-engineering",
      "cross-validation",
    ],

    estimatedMinutes: 270,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Filter methods",
      "Wrapper methods",
      "Embedded methods",
      "Variance threshold",
      "Univariate selection",
      "Recursive feature elimination",
      "Model-based selection",
      "Feature importance",
      "Feature-selection leakage",
      "Feature selection inside cross-validation",
    ],

    tools: [
      "VarianceThreshold",
      "SelectKBest",
      "RFE",
      "SelectFromModel",
      "Pipeline",
    ],

    outcomes: [
      "Compare major feature-selection approaches",
      "Select useful features systematically",
      "Perform feature selection without leakage",
      "Evaluate whether feature selection improves generalization",
    ],
  },

  // =====================================================
  // ENSEMBLE LEARNING
  // =====================================================

  {
    id: "ensemble-learning",
    name: "Ensemble Learning",
    category: "Ensemble Methods",
    description:
      "Understand how multiple models can be combined to create stronger and more stable predictions.",

    difficulty: "intermediate",

    prerequisites: [
      "decision-tree",
      "train-test-evaluation",
    ],

    estimatedMinutes: 210,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Ensemble learning",
      "Base learners",
      "Diversity",
      "Bagging",
      "Boosting",
      "Voting",
      "Stacking",
      "Variance reduction",
      "Bias reduction",
    ],

    tools: [
      "VotingClassifier",
      "VotingRegressor",
      "StackingClassifier",
      "StackingRegressor",
    ],

    outcomes: [
      "Explain why ensembles can outperform individual models",
      "Differentiate bagging, boosting, voting and stacking",
      "Choose an ensemble strategy for a problem",
      "Understand the role of model diversity",
    ],
  },

  // =====================================================
  // BAGGING
  // =====================================================

  {
    id: "bagging",
    name: "Bagging & Bootstrap Aggregation",
    category: "Ensemble Methods",
    description:
      "Learn how bootstrap sampling and prediction aggregation can reduce model variance.",

    difficulty: "intermediate",

    prerequisites: [
      "ensemble-learning",
      "decision-tree",
    ],

    estimatedMinutes: 180,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Bootstrap sampling",
      "Sampling with replacement",
      "Base estimators",
      "Parallel learners",
      "Prediction aggregation",
      "Majority voting",
      "Averaging",
      "Variance reduction",
      "Out-of-bag samples",
    ],

    tools: [
      "BaggingClassifier",
      "BaggingRegressor",
      "RandomForestClassifier",
      "RandomForestRegressor",
    ],

    outcomes: [
      "Explain bootstrap aggregation",
      "Understand how bagging reduces variance",
      "Build bagging classifiers and regressors",
      "Connect bagging with Random Forest",
    ],
  },

  // =====================================================
  // BOOSTING FOUNDATIONS
  // =====================================================

  {
    id: "boosting-foundations",
    name: "Boosting Foundations",
    category: "Ensemble Methods",
    description:
      "Understand sequential ensemble learning where later learners focus on weaknesses of earlier learners.",

    difficulty: "advanced",

    prerequisites: [
      "ensemble-learning",
      "decision-tree",
    ],

    estimatedMinutes: 240,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Sequential learning",
      "Weak learners",
      "Residual correction",
      "Sample weighting",
      "Learning rate",
      "Number of estimators",
      "AdaBoost intuition",
      "Gradient boosting intuition",
      "Overfitting control",
    ],

    tools: [
      "AdaBoostClassifier",
      "AdaBoostRegressor",
      "GradientBoostingClassifier",
      "GradientBoostingRegressor",
    ],

    outcomes: [
      "Explain the central idea of boosting",
      "Differentiate boosting from bagging",
      "Understand weak learners and sequential correction",
      "Prepare for Gradient Boosting and XGBoost",
    ],
  },

  // =====================================================
  // VOTING AND STACKING
  // =====================================================

  {
    id: "voting-stacking",
    name: "Voting & Stacking Ensembles",
    category: "Ensemble Methods",
    description:
      "Combine predictions from different models using voting, averaging and stacked generalization.",

    difficulty: "advanced",

    prerequisites: [
      "ensemble-learning",
      "cross-validation",
    ],

    estimatedMinutes: 240,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "advanced",
    ],

    concepts: [
      "Hard voting",
      "Soft voting",
      "Prediction averaging",
      "Model diversity",
      "Meta learner",
      "Stacking",
      "Out-of-fold predictions",
      "Leakage-safe stacking",
    ],

    tools: [
      "VotingClassifier",
      "VotingRegressor",
      "StackingClassifier",
      "StackingRegressor",
    ],

    outcomes: [
      "Build voting ensembles",
      "Explain stacked generalization",
      "Understand the role of a meta learner",
      "Avoid leakage while generating stacking features",
    ],
  },

  // =====================================================
  // CLUSTERING EVALUATION
  // =====================================================

  {
    id: "clustering-evaluation",
    name: "Clustering Evaluation",
    category: "Unsupervised Learning",
    description:
      "Evaluate clustering quality when ordinary supervised-learning accuracy is unavailable.",

    difficulty: "intermediate",

    prerequisites: [
      "kmeans",
    ],

    estimatedMinutes: 180,

    goals: [
      "college",
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Inertia",
      "Within-cluster variation",
      "Elbow method",
      "Silhouette score",
      "Cluster separation",
      "Cluster cohesion",
      "Choosing number of clusters",
      "Limitations of clustering metrics",
    ],

    tools: [
      "silhouette_score",
      "KMeans",
      "Matplotlib",
    ],

    outcomes: [
      "Evaluate K-Means clustering",
      "Use the elbow method carefully",
      "Interpret silhouette scores",
      "Recognize limitations of internal clustering metrics",
    ],
  },

  // =====================================================
  // LEARNING CURVES
  // =====================================================

  {
    id: "learning-curves",
    name: "Learning & Validation Curves",
    category: "Model Evaluation",
    description:
      "Diagnose model behavior by studying performance as training size and hyperparameters change.",

    difficulty: "advanced",

    prerequisites: [
      "bias-variance",
      "cross-validation",
    ],

    estimatedMinutes: 210,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Learning curves",
      "Training score",
      "Validation score",
      "Training-set size",
      "Validation curves",
      "Underfitting diagnosis",
      "Overfitting diagnosis",
      "Hyperparameter sensitivity",
    ],

    tools: [
      "learning_curve",
      "validation_curve",
      "Matplotlib",
      "cross-validation",
    ],

    outcomes: [
      "Interpret learning curves",
      "Diagnose high bias and high variance",
      "Interpret validation curves",
      "Use diagnostic evidence to guide model improvement",
    ],
  },

  // =====================================================
  // MODEL SELECTION
  // =====================================================

  {
    id: "model-selection",
    name: "Model Selection & Fair Comparison",
    category: "Model Evaluation",
    description:
      "Compare candidate models fairly using consistent validation procedures, metrics and preprocessing.",

    difficulty: "advanced",

    prerequisites: [
      "cross-validation",
      "hyperparameter-tuning",
    ],

    estimatedMinutes: 240,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "advanced",
    ],

    concepts: [
      "Baseline models",
      "Candidate models",
      "Fair comparison",
      "Consistent preprocessing",
      "Cross-validation comparison",
      "Metric selection",
      "Model complexity",
      "Validation uncertainty",
      "Final test evaluation",
      "Avoiding test-set tuning",
    ],

    tools: [
      "Pipeline",
      "cross_validate",
      "GridSearchCV",
      "RandomizedSearchCV",
    ],

    outcomes: [
      "Compare models fairly",
      "Choose metrics based on problem goals",
      "Keep the final test set isolated",
      "Justify model selection using validation evidence",
    ],
  },

  // =====================================================
  // CALIBRATION AND THRESHOLDING
  // =====================================================

  {
    id: "calibration-thresholding",
    name: "Probability Calibration & Decision Thresholds",
    category: "Model Evaluation",
    description:
      "Move beyond default classification thresholds by understanding probabilities, calibration and decision costs.",

    difficulty: "advanced",

    prerequisites: [
      "logistic-regression",
      "advanced-classification-evaluation",
    ],

    estimatedMinutes: 270,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "advanced",
    ],

    concepts: [
      "Predicted probability",
      "Decision threshold",
      "Threshold trade-offs",
      "Precision-recall trade-off",
      "False-positive cost",
      "False-negative cost",
      "Probability calibration",
      "Calibration curve",
      "Brier score",
      "Threshold selection using validation data",
    ],

    tools: [
      "predict_proba",
      "precision_recall_curve",
      "CalibrationDisplay",
      "CalibratedClassifierCV",
      "brier_score_loss",
    ],

    outcomes: [
      "Explain why 0.5 is not always the correct threshold",
      "Analyze threshold trade-offs",
      "Evaluate probability calibration",
      "Select thresholds using validation objectives rather than test data",
    ],
  },

  // =====================================================
  // SHAP EXPLAINABILITY
  // =====================================================

  {
    id: "shap-explainability",
    name: "SHAP & Advanced Model Explainability",
    category: "Interpretability",
    description:
      "Study local and global prediction explanations using SHAP-style feature attribution.",

    difficulty: "advanced",

    prerequisites: [
      "model-interpretability",
    ],

    estimatedMinutes: 270,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "advanced",
    ],

    concepts: [
      "Local explanations",
      "Global explanations",
      "Feature attribution",
      "SHAP values",
      "Baseline prediction",
      "Positive contribution",
      "Negative contribution",
      "Summary plots",
      "Dependence plots",
      "Interpretation limitations",
      "Correlation and causal limitations",
    ],

    tools: [
      "SHAP",
      "TreeExplainer",
      "summary_plot",
      "waterfall plot",
    ],

    outcomes: [
      "Interpret feature-attribution explanations",
      "Differentiate local and global explanations",
      "Explain individual model predictions",
      "Recognize that feature attribution does not establish causality",
    ],
  },

  // =====================================================
  // COMPLETE PIPELINE + COLUMN TRANSFORMER WORKFLOW
  // =====================================================

  {
    id: "pipeline-column-transformer",
    name: "Pipeline, ColumnTransformer & End-to-End Preprocessing",
    category: "ML Engineering",
    description:
      "Build complete scikit-learn workflows that combine numerical preprocessing, categorical preprocessing and model training.",

    difficulty: "advanced",

    prerequisites: [
      "missing-value-handling",
      "categorical-encoding",
      "feature-scaling",
      "advanced-preprocessing",
    ],

    estimatedMinutes: 360,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "intermediate",
      "advanced",
    ],

    concepts: [
      "Pipeline",
      "ColumnTransformer",
      "Numerical feature pipeline",
      "Categorical feature pipeline",
      "SimpleImputer",
      "StandardScaler",
      "OneHotEncoder",
      "Named transformers",
      "Remainder columns",
      "Fit and transform lifecycle",
      "Preprocessing during prediction",
      "Pipeline parameters",
      "Pipeline with cross-validation",
      "Pipeline with GridSearchCV",
      "Leakage-resistant workflow",
    ],

    tools: [
      "Pipeline",
      "make_pipeline",
      "ColumnTransformer",
      "make_column_transformer",
      "SimpleImputer",
      "StandardScaler",
      "OneHotEncoder",
      "GridSearchCV",
    ],

    outcomes: [
      "Build separate numerical and categorical preprocessing branches",
      "Combine transformations with ColumnTransformer",
      "Combine preprocessing and a model using Pipeline",
      "Tune pipeline parameters using GridSearchCV",
      "Apply identical transformations during training and inference",
      "Build leakage-resistant end-to-end ML workflows",
    ],
  },

  // =====================================================
  // COMPLETE ML WORKFLOW
  // =====================================================

  {
    id: "complete-ml-workflow",
    name: "Complete Machine-Learning Workflow",
    category: "ML Engineering",
    description:
      "Combine problem framing, data validation, preprocessing, modeling, evaluation, tuning, interpretation and reproducibility into one complete project workflow.",

    difficulty: "advanced",

    prerequisites: [
      "pipeline-column-transformer",
      "model-selection",
      "model-interpretability",
      "experiment-tracking",
    ],

    estimatedMinutes: 480,

    goals: [
      "ml-engineer",
      "data-scientist",
      "ai-engineer",
      "hackathon",
      "project",
      "custom",
    ],

    levels: [
      "advanced",
    ],

    concepts: [
      "Problem framing",
      "Target definition",
      "Dataset understanding",
      "Data validation",
      "EDA",
      "Train-validation-test strategy",
      "Baseline model",
      "Preprocessing pipeline",
      "Feature engineering",
      "Candidate models",
      "Cross-validation",
      "Hyperparameter tuning",
      "Model selection",
      "Final test evaluation",
      "Error analysis",
      "Interpretability",
      "Experiment tracking",
      "Reproducibility",
      "Inference workflow",
      "Limitations and reporting",
    ],

    tools: [
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "scikit-learn",
      "Pipeline",
      "ColumnTransformer",
      "GridSearchCV",
      "RandomizedSearchCV",
      "MLflow-style experiment tracking",
    ],

    outcomes: [
      "Design an end-to-end machine-learning workflow",
      "Prevent common forms of data leakage",
      "Build reusable preprocessing and modeling pipelines",
      "Compare and tune models fairly",
      "Evaluate the final model on untouched test data",
      "Interpret errors and predictions",
      "Document experiments and limitations",
      "Create a portfolio-ready machine-learning project",
    ],
  },
];


// =========================================================
// HELPER FUNCTIONS
// =====================================================

export function getSkillById(
  skillId: string
): CurriculumSkill | undefined {
  return curriculumSkills.find(
    (skill) => skill.id === skillId
  );
}


export function getSkillsForGoal(
  goal: RoadmapGoal
): CurriculumSkill[] {
  return curriculumSkills.filter(
    (skill) => skill.goals.includes(goal)
  );
}


export function getSkillsForLevel(
  level: LearningLevel
): CurriculumSkill[] {
  return curriculumSkills.filter(
    (skill) => skill.levels.includes(level)
  );
}


export function getSkillsForProfile(
  goal: RoadmapGoal,
  level: LearningLevel
): CurriculumSkill[] {
  return curriculumSkills.filter(
    (skill) =>
      skill.goals.includes(goal) &&
      skill.levels.includes(level)
  );
}