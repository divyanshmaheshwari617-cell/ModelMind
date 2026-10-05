import type { DeepLessonRegistry } from "./lessonContentTypes";

export const dataAnalysisContent: DeepLessonRegistry = {
  // =========================================================
  // BASIC DATA CLEANING
  // =========================================================

  "basic-data-cleaning": {
    overview:
      "Real-world datasets are rarely ready for machine learning. They may contain missing values, duplicate rows, incorrect data types, inconsistent categories, impossible values and formatting problems. Data cleaning is the systematic process of identifying these issues, understanding why they occurred and correcting them without destroying useful information.",

    objectives: [
      "Explain why data cleaning is necessary.",
      "Inspect dataset quality before modifying data.",
      "Detect missing values.",
      "Detect and remove duplicates appropriately.",
      "Correct incorrect data types.",
      "Standardize inconsistent categorical values.",
      "Validate numerical ranges.",
      "Understand why blindly dropping rows is dangerous.",
      "Build a basic reproducible cleaning workflow.",
    ],

    sections: [
      {
        id: "basic-cleaning-quality",
        title: "What Makes Data Dirty?",

        explanation: [
          "Dirty data is data whose representation does not correctly or consistently describe the real observations.",
          "Problems can include missing values, duplicated observations, impossible values, incorrect types, inconsistent spelling, whitespace and mixed units.",
          "Cleaning should begin with investigation rather than immediate deletion.",
          "A suspicious value is not automatically incorrect. Domain context determines whether a value is valid.",
          "Cleaning decisions can affect model behavior, so they should be documented and reproducible.",
        ],

        intuition: [
          "A model learns from the information you provide. If the dataset contains inconsistent or incorrect information, the model can learn those problems as if they were genuine patterns.",
        ],

        importantPoints: [
          "Inspect before modifying.",
          "Understand why a value is suspicious.",
          "Use domain knowledge where possible.",
          "Document cleaning decisions.",
          "Preserve raw data separately.",
        ],
      },

      {
        id: "basic-cleaning-missing",
        title: "Missing Values",

        explanation: [
          "Missing values represent information that was not recorded or is unavailable.",
          "In Pandas, missing values are commonly represented using NaN or related missing-value representations.",
          "isna() and isnull() can detect missing values.",
          "Missing-value counts should be examined by column and often as percentages.",
          "The correct response depends on why values are missing, how much data is missing and what the column represents.",
          "Possible strategies include removing observations, removing unusable features or imputing values.",
        ],

        intuition: [
          "A blank value is not merely an empty cell. It represents missing information, and the reason for that absence can itself matter.",
        ],

        importantPoints: [
          "Measure missingness before choosing a strategy.",
          "Do not automatically replace every missing number with zero.",
          "Do not automatically drop every row containing a missing value.",
          "Imputation should later be fitted using training data only.",
        ],
      },

      {
        id: "basic-cleaning-duplicates",
        title: "Duplicate Records",

        explanation: [
          "Duplicate rows may occur because of repeated data entry, merging errors or repeated measurements.",
          "duplicated() identifies repeated rows according to selected columns.",
          "drop_duplicates() removes duplicates.",
          "However, identical-looking rows are not always accidental duplicates.",
          "Two customers can legitimately have identical age, city and purchase amount, so duplicate decisions should use appropriate identifying information.",
        ],

        intuition: [
          "Duplicate removal should answer whether these rows represent the same real event, not merely whether their displayed values look similar.",
        ],

        importantPoints: [
          "Investigate why duplicates exist.",
          "Use meaningful subsets of columns when appropriate.",
          "Do not delete legitimate repeated observations.",
        ],
      },

      {
        id: "basic-cleaning-types",
        title: "Incorrect Data Types",

        explanation: [
          "A column may contain numbers but still be stored as text.",
          "Dates may initially appear as ordinary strings.",
          "Incorrect types can prevent numerical operations, sorting and statistical analysis.",
          "astype(), pd.to_numeric() and pd.to_datetime() are common conversion tools.",
          "Conversion failures should be inspected rather than silently ignored.",
        ],

        intuition: [
          "The displayed value and the way a computer represents that value are different things.",
        ],

        importantPoints: [
          "Inspect dtypes.",
          "Convert numerical text deliberately.",
          "Parse dates using datetime tools.",
          "Investigate values that fail conversion.",
        ],
      },

      {
        id: "basic-cleaning-categories",
        title: "Inconsistent Categories",

        explanation: [
          "Categorical values may represent the same concept using different spellings or formatting.",
          "Examples include Delhi, delhi, DELHI and ' Delhi '.",
          "String normalization may include trimming whitespace and standardizing case.",
          "Mapping known variants to canonical values can improve consistency.",
          "Category normalization should not accidentally merge genuinely different concepts.",
        ],

        intuition: [
          "A human may understand that AIML and aiml refer to the same category, while software initially sees two different strings.",
        ],

        importantPoints: [
          "Inspect unique values.",
          "Trim unwanted whitespace.",
          "Standardize case when appropriate.",
          "Use explicit mappings for known variants.",
        ],
      },

      {
        id: "basic-cleaning-validation",
        title: "Range and Rule Validation",

        explanation: [
          "Some values may have the correct type but still be logically impossible.",
          "A negative age or attendance above 100 percent may indicate a data-quality problem.",
          "Validation rules should come from domain constraints.",
          "Suspicious observations should be investigated before deciding whether to correct, remove or retain them.",
        ],

        intuition: [
          "A value can be syntactically valid while being semantically impossible.",
        ],

        importantPoints: [
          "Use domain-based validation rules.",
          "Inspect suspicious rows.",
          "Avoid arbitrary corrections without evidence.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "data-cleaning-quality-explorer",
      title: "Data Cleaning Explorer",
      description:
        "Inspect a deliberately messy dataset and interactively detect missing values, duplicates, invalid types, inconsistent categories and suspicious ranges.",
    },

    codeExamples: [
      {
        id: "basic-cleaning-code",
        title: "Clean a Messy Student Dataset",
        description:
          "Inspect and clean common real-world data-quality problems with Pandas.",
        language: "python",

        code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name": [
        " Aarav",
        "Riya",
        "Riya",
        "Kabir",
        "Meera "
    ],
    "age": [
        "20",
        "21",
        "21",
        "unknown",
        "19"
    ],
    "branch": [
        "AIML",
        "cse",
        "cse",
        "AIml",
        " CSE "
    ],
    "marks": [
        82,
        91,
        91,
        np.nan,
        105
    ]
})

# ---------------------------------------
# 1. Inspect before cleaning
# ---------------------------------------

print(df)

print(df.info())

print(
    df.isna().sum()
)

print(
    "Duplicate rows:",
    df.duplicated().sum()
)

# ---------------------------------------
# 2. Standardize text
# ---------------------------------------

df["name"] = (
    df["name"]
    .str.strip()
)

df["branch"] = (
    df["branch"]
    .str.strip()
    .str.upper()
)

# ---------------------------------------
# 3. Convert age safely
# ---------------------------------------

df["age"] = pd.to_numeric(
    df["age"],
    errors="coerce"
)

# ---------------------------------------
# 4. Remove exact duplicates
# ---------------------------------------

df = df.drop_duplicates()

# ---------------------------------------
# 5. Detect suspicious marks
# ---------------------------------------

invalid_marks = (
    (df["marks"] < 0)
    |
    (df["marks"] > 100)
)

print(
    "Suspicious rows:"
)

print(
    df[invalid_marks]
)

# ---------------------------------------
# 6. Inspect final result
# ---------------------------------------

print(df)

print(
    df.isna().sum()
)`,

        explanation: [
          "The raw dataset is inspected before any modifications are made.",
          "str.strip removes unwanted surrounding whitespace.",
          "str.upper standardizes category capitalization.",
          "pd.to_numeric with errors='coerce' converts invalid numerical text into missing values so it can be investigated.",
          "drop_duplicates removes exact duplicate rows.",
          "The marks rule identifies values outside the expected 0–100 range rather than silently changing them.",
          "The remaining missing and suspicious values still require a deliberate treatment decision.",
        ],

        commonMistakes: [
          "Calling dropna() immediately without measuring missingness.",
          "Replacing invalid values with arbitrary numbers.",
          "Removing rows merely because they look unusual.",
          "Cleaning the only copy of the raw dataset.",
        ],
      },
    ],

    practice: [
      {
        id: "basic-cleaning-practice-1",
        title: "Measure Missingness",
        type: "coding",
        difficulty: "basic",
        question:
          "Write Pandas code to calculate the number of missing values in every column.",
        instructions: [
          "Use isna().",
          "Aggregate column-wise.",
        ],
        hints: [
          "df.isna().sum() is the standard pattern.",
        ],
        explanation:
          "df.isna().sum() produces the missing-value count for each column.",
      },

      {
        id: "basic-cleaning-practice-2",
        title: "Normalize Categories",
        type: "coding",
        difficulty: "basic",
        question:
          "A city column contains ' Agra', 'agra', 'AGRA ' and 'Delhi'. Show a basic way to standardize whitespace and case.",
        instructions: [
          "Use Pandas string methods.",
        ],
        hints: [
          "Combine str.strip() and str.title() or str.upper().",
        ],
        explanation:
          "For example, df['city'] = df['city'].str.strip().str.title() would convert the Agra variants into a consistent representation.",
      },

      {
        id: "basic-cleaning-practice-3",
        title: "Duplicate Reasoning",
        type: "analysis",
        difficulty: "medium",
        question:
          "Two rows have exactly the same age, city and salary. Is that enough evidence to delete one as a duplicate?",
        instructions: [
          "Distinguish identical attributes from identical real entities.",
        ],
        hints: [
          "Different people can share these values.",
        ],
        explanation:
          "No. The rows may represent different people. Duplicate detection should use appropriate identifying fields or knowledge about what one row represents.",
      },

      {
        id: "basic-cleaning-practice-4",
        title: "Find Impossible Values",
        type: "coding",
        difficulty: "medium",
        question:
          "Write a Boolean filter finding rows where attendance is below 0 or above 100.",
        instructions: [
          "Combine two conditions.",
        ],
        hints: [
          "Use | between the conditions.",
        ],
        explanation:
          "df[(df['attendance'] < 0) | (df['attendance'] > 100)] identifies values outside the valid range.",
      },

      {
        id: "basic-cleaning-practice-5",
        title: "Design a Cleaning Order",
        type: "analysis",
        difficulty: "medium",
        question:
          "You receive an unfamiliar CSV. Describe the steps you would perform before deleting or imputing any observations.",
        instructions: [
          "Begin with structural inspection.",
          "Include missingness, duplicates, types, categories and ranges.",
        ],
        hints: [
          "Cleaning should start with understanding.",
        ],
        explanation:
          "A strong workflow inspects shape, columns, types, sample rows, missingness, duplicate patterns, category values and numerical distributions before selecting cleaning actions.",
      },
    ],

    commonMistakes: [
      {
        id: "basic-cleaning-mistake-1",
        title: "Dropping everything incomplete",
        description:
          "Calling dropna() without understanding the amount or reason for missingness can discard valuable observations.",
        correction:
          "Measure and investigate missingness before choosing deletion or imputation.",
      },

      {
        id: "basic-cleaning-mistake-2",
        title: "Replacing missing values with zero",
        description:
          "Zero may be a genuine measurement and can therefore change the meaning of the data.",
        correction:
          "Choose treatment according to the variable and missingness mechanism.",
      },

      {
        id: "basic-cleaning-mistake-3",
        title: "Treating every unusual value as an error",
        description:
          "Rare observations may be genuine.",
        correction:
          "Use domain rules and investigation before modifying unusual observations.",
      },
    ],

    keyTakeaways: [
      "Data cleaning starts with inspection.",
      "Missing values require deliberate treatment.",
      "Duplicates must be interpreted according to what one row represents.",
      "Incorrect types can hide data-quality problems.",
      "Categorical values often require normalization.",
      "Validation rules help detect impossible values.",
      "Never modify suspicious data without understanding the reason.",
    ],
  },


  // =========================================================
  // ADVANCED DATA CLEANING
  // =========================================================

  "advanced-data-cleaning": {
    overview:
      "Advanced cleaning moves beyond obvious missing cells and duplicate rows. It investigates missingness patterns, schema violations, inconsistent units, malformed values, rare categories, cross-column contradictions and reproducible validation rules. The objective is not to make a dataset look perfect but to make its meaning reliable.",

    objectives: [
      "Build explicit data-quality rules.",
      "Analyze missingness patterns.",
      "Detect cross-column inconsistencies.",
      "Recognize unit and formatting problems.",
      "Handle malformed values safely.",
      "Analyze rare categories.",
      "Avoid train-test contamination during cleaning.",
      "Create reproducible cleaning functions.",
      "Produce data-quality reports.",
    ],

    sections: [
      {
        id: "advanced-cleaning-schema",
        title: "Schema and Data Contracts",

        explanation: [
          "A schema describes the expected structure of a dataset.",
          "It can define required columns, expected types, valid ranges and allowed categories.",
          "Explicit expectations make data-quality failures easier to detect.",
          "Production ML systems benefit from validating incoming data before predictions or training begin.",
        ],

        intuition: [
          "A schema acts like a contract describing what valid data should look like.",
        ],

        importantPoints: [
          "Validate required columns.",
          "Validate expected types.",
          "Validate ranges and categories.",
          "Fail clearly when critical assumptions are violated.",
        ],
      },

      {
        id: "advanced-cleaning-missing-patterns",
        title: "Missingness Patterns",

        explanation: [
          "Missing values should be analyzed as patterns rather than only independent cell counts.",
          "Some columns may become missing together because they originate from the same process.",
          "Missingness may correlate with the target or another subgroup.",
          "A missing indicator can sometimes preserve useful information, but it must be justified carefully.",
          "Statistical terminology often distinguishes MCAR, MAR and MNAR mechanisms, although identifying the true mechanism from observed data alone can be difficult.",
        ],

        intuition: [
          "Sometimes the fact that information is missing tells you something about how the data was collected.",
        ],

        importantPoints: [
          "Study missingness by row and column.",
          "Check whether missingness is concentrated in groups.",
          "Do not assume missingness is random.",
          "Avoid making causal claims from missingness patterns alone.",
        ],
      },

      {
        id: "advanced-cleaning-cross-column",
        title: "Cross-Column Validation",

        explanation: [
          "Individual values can appear valid while combinations of values are impossible.",
          "For example, discharge_date earlier than admission_date violates a temporal rule.",
          "total_price may conflict with quantity multiplied by unit_price.",
          "Cross-column checks are often more powerful than simple range checks.",
        ],

        intuition: [
          "Data validity is sometimes defined by relationships between fields rather than by one field independently.",
        ],

        importantPoints: [
          "Validate logical relationships.",
          "Validate date ordering.",
          "Validate calculated totals when possible.",
        ],
      },

      {
        id: "advanced-cleaning-units",
        title: "Units and Representation",

        explanation: [
          "Datasets may combine measurements expressed in different units.",
          "A height column mixing centimeters and meters can create extreme-looking values that are actually representation errors.",
          "Currency, temperature and date formats can have similar issues.",
          "Unit standardization should happen before statistical interpretation.",
        ],

        intuition: [
          "Numbers cannot be compared meaningfully unless they represent quantities using compatible units.",
        ],

        importantPoints: [
          "Record units explicitly.",
          "Standardize units.",
          "Do not treat unit errors as ordinary outliers.",
        ],
      },

      {
        id: "advanced-cleaning-reproducibility",
        title: "Reproducible Cleaning Pipelines",

        explanation: [
          "Manual spreadsheet edits are difficult to reproduce and audit.",
          "Cleaning operations should preferably be encoded as functions or pipeline steps.",
          "Raw data should remain unchanged.",
          "Every transformation should have a reason and ideally be testable.",
          "Transformations that learn statistics from data should later be incorporated into training-only preprocessing pipelines.",
        ],

        intuition: [
          "If you cannot repeat the cleaning process on tomorrow's data, you do not yet have a reliable workflow.",
        ],

        importantPoints: [
          "Preserve raw data.",
          "Automate repeatable rules.",
          "Document assumptions.",
          "Separate deterministic cleaning from learned preprocessing.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "advanced-data-quality-dashboard",
      title: "Data Quality Diagnostic Lab",
      description:
        "Explore missingness patterns, schema violations, cross-column contradictions, unit problems and category distributions through an interactive quality dashboard.",
    },

    codeExamples: [
      {
        id: "advanced-cleaning-code",
        title: "Build a Data Quality Report",
        description:
          "Create reusable validation logic instead of manually inspecting every issue.",
        language: "python",

        code: `import pandas as pd

def data_quality_report(df):
    report = {}

    report["shape"] = df.shape

    report["missing_count"] = (
        df.isna().sum().to_dict()
    )

    report["missing_percent"] = (
        df.isna().mean()
        .mul(100)
        .round(2)
        .to_dict()
    )

    report["duplicate_rows"] = int(
        df.duplicated().sum()
    )

    report["dtypes"] = {
        column: str(dtype)
        for column, dtype
        in df.dtypes.items()
    }

    return report


def validate_student_data(df):
    issues = {}

    if "age" in df.columns:
        issues["invalid_age"] = int(
            (
                (df["age"] < 0)
                |
                (df["age"] > 120)
            ).sum()
        )

    if "marks" in df.columns:
        issues["invalid_marks"] = int(
            (
                (df["marks"] < 0)
                |
                (df["marks"] > 100)
            ).sum()
        )

    return issues


df = pd.DataFrame({
    "age": [20, 21, -4, 150],
    "marks": [80, 92, 101, 76]
})

print(
    data_quality_report(df)
)

print(
    validate_student_data(df)
)`,

        explanation: [
          "The quality report separates measurement from modification.",
          "Missing percentages make columns easier to compare.",
          "Validation rules are encoded explicitly.",
          "The functions can be rerun whenever new data arrives.",
          "This approach is more reproducible than manual editing.",
        ],

        commonMistakes: [
          "Combining measurement and destructive cleaning in one opaque step.",
          "Hard-coding unexplained thresholds.",
          "Failing to preserve the original dataset.",
          "Applying training-derived statistics globally before splitting.",
        ],
      },
    ],

    practice: [
      {
        id: "advanced-cleaning-practice-1",
        title: "Cross-Column Validation",
        type: "coding",
        difficulty: "medium",
        question:
          "Write a Pandas condition identifying rows where discharge_date occurs before admission_date.",
        instructions: [
          "Convert both columns to datetime first.",
          "Compare the resulting datetime columns.",
        ],
        hints: [
          "Use pd.to_datetime before comparison.",
        ],
        explanation:
          "After parsing both columns, df[df['discharge_date'] < df['admission_date']] identifies inconsistent date ordering.",
      },

      {
        id: "advanced-cleaning-practice-2",
        title: "Missingness Pattern",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Income is missing much more frequently for one customer group than others. Why should you investigate this before simple median imputation?",
        instructions: [
          "Discuss collection process and subgroup information.",
        ],
        hints: [
          "The missingness itself may not be random.",
        ],
        explanation:
          "The pattern may reflect the collection process or subgroup behavior. Simple global imputation could hide meaningful structure or introduce bias.",
      },

      {
        id: "advanced-cleaning-practice-3",
        title: "Unit Error or Outlier?",
        type: "analysis",
        difficulty: "medium",
        question:
          "Most heights are between 150 and 190, but several values are 1.72 and 1.81. What should you investigate before removing them as outliers?",
        instructions: [
          "Think about measurement units.",
        ],
        hints: [
          "Centimeters and meters may have been mixed.",
        ],
        explanation:
          "The values may be valid heights represented in meters while other rows use centimeters. Unit consistency should be checked before outlier treatment.",
      },

      {
        id: "advanced-cleaning-practice-4",
        title: "Create a Quality Metric",
        type: "coding",
        difficulty: "medium",
        question:
          "Calculate the percentage of missing observations for every DataFrame column.",
        instructions: [
          "Use the Boolean mean property.",
        ],
        hints: [
          "df.isna().mean() gives proportions.",
        ],
        explanation:
          "df.isna().mean() * 100 produces missing percentages by column.",
      },

      {
        id: "advanced-cleaning-practice-5",
        title: "Production Data Validation",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A deployed model expects columns age, income and city. New inference data arrives without income. What should the system do?",
        instructions: [
          "Discuss schema validation.",
          "Differentiate a missing column from missing values inside an existing column.",
        ],
        hints: [
          "The expected feature schema has changed.",
        ],
        explanation:
          "The system should detect the schema violation before prediction. Depending on the contract, it should fail clearly or invoke an explicitly designed fallback rather than silently producing an unreliable prediction.",
      },
    ],

    keyTakeaways: [
      "Advanced cleaning validates meaning, not just formatting.",
      "Schemas make data expectations explicit.",
      "Missingness patterns can contain important information.",
      "Cross-column rules detect errors that single-column checks miss.",
      "Units must be standardized before interpretation.",
      "Cleaning workflows should be reproducible and auditable.",
      "Learned preprocessing must remain leakage-resistant.",
    ],
  },


  // =========================================================
  // EDA FOUNDATION
  // =========================================================

  "eda-foundation": {
    overview:
      "Exploratory Data Analysis is the structured process of understanding a dataset before serious modeling. EDA investigates distributions, relationships, missingness, unusual observations and potential data-quality problems while helping generate hypotheses for later modeling.",

    objectives: [
      "Explain the purpose of EDA.",
      "Perform structural dataset inspection.",
      "Calculate descriptive statistics.",
      "Analyze numerical distributions.",
      "Analyze categorical distributions.",
      "Investigate relationships between variables.",
      "Use correlation carefully.",
      "Detect suspicious patterns and observations.",
      "Translate EDA findings into modeling decisions.",
    ],

    sections: [
      {
        id: "eda-purpose",
        title: "Why EDA Comes Before Modeling",

        explanation: [
          "EDA helps determine what the dataset actually contains rather than what we assume it contains.",
          "It can reveal missingness, incorrect types, skewed variables, rare categories, class imbalance and suspicious relationships.",
          "EDA helps formulate questions that guide preprocessing and modeling.",
          "It should not become an endless search for visually interesting patterns with no connection to the problem.",
        ],

        intuition: [
          "EDA is the investigation stage of a data project.",
        ],

        importantPoints: [
          "Understand before modeling.",
          "Connect analysis with the problem objective.",
          "Record important observations.",
          "Avoid turning exploratory associations into unsupported causal claims.",
        ],
      },

      {
        id: "eda-univariate",
        title: "Univariate Analysis",

        explanation: [
          "Univariate analysis studies one variable at a time.",
          "Numerical variables can be summarized using count, mean, median, quantiles, standard deviation, minimum and maximum.",
          "Histograms and box plots help reveal distribution shape.",
          "Categorical variables can be summarized using counts and proportions.",
          "Rare categories and highly skewed numerical variables may affect later preprocessing.",
        ],

        intuition: [
          "Before asking how variables interact, understand each variable independently.",
        ],

        importantPoints: [
          "Inspect center and spread.",
          "Inspect distribution shape.",
          "Inspect category frequencies.",
          "Look for impossible or suspicious values.",
        ],
      },

      {
        id: "eda-bivariate",
        title: "Bivariate Analysis",

        explanation: [
          "Bivariate analysis studies relationships between two variables.",
          "Scatter plots are useful for pairs of numerical variables.",
          "Box plots can compare numerical distributions across categories.",
          "Cross-tabulations can compare categorical variables.",
          "The appropriate technique depends on the variable types.",
        ],

        intuition: [
          "Bivariate analysis asks how one variable behaves as another variable changes.",
        ],

        importantPoints: [
          "Match analysis to variable types.",
          "Look for nonlinear patterns as well as linear ones.",
          "Inspect groups rather than relying only on global summaries.",
        ],
      },

      {
        id: "eda-correlation",
        title: "Correlation",

        explanation: [
          "Correlation summarizes the strength and direction of certain relationships between variables.",
          "Pearson correlation primarily captures linear association.",
          "A correlation near zero does not prove that two variables are unrelated because nonlinear relationships can exist.",
          "Correlation does not establish causation.",
          "Highly correlated predictors may matter for some modeling and interpretation workflows.",
        ],

        intuition: [
          "Correlation compresses one aspect of a relationship into a number, so it should complement rather than replace visualization.",
        ],

        importantPoints: [
          "Correlation is not causation.",
          "Pearson correlation focuses on linear association.",
          "Visualize relationships.",
          "Be cautious with outliers.",
        ],
      },

      {
        id: "eda-target",
        title: "Target-Aware EDA",

        explanation: [
          "In supervised learning, the target deserves dedicated analysis.",
          "Classification targets should be checked for class balance.",
          "Regression targets should be inspected for distribution, extreme values and transformation needs.",
          "Feature-target relationships can help reveal useful signals or suspicious leakage.",
          "EDA must avoid using future or unavailable information simply because it correlates strongly with the target.",
        ],

        intuition: [
          "The target defines what the model is trying to learn, so understanding it is central to EDA.",
        ],

        importantPoints: [
          "Inspect target distribution.",
          "Check class imbalance.",
          "Investigate suspiciously strong predictors.",
          "Consider leakage.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "eda-interactive-dashboard",
      title: "Interactive EDA Lab",
      description:
        "Select columns and explore distributions, summary statistics, category frequencies, scatter plots, box plots and correlations interactively.",
    },

    codeExamples: [
      {
        id: "eda-foundation-code",
        title: "A Practical EDA Workflow",
        description:
          "Perform structured exploration on a tabular dataset.",
        language: "python",

        code: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "age": [
        20, 21, 22, 20,
        24, 25, 23, 22
    ],
    "hours_studied": [
        2, 4, 5, 3,
        7, 8, 6, 5
    ],
    "marks": [
        55, 62, 71, 58,
        85, 91, 78, 74
    ],
    "branch": [
        "AIML", "CSE", "AIML", "CSE",
        "AIML", "CSE", "AIML", "CSE"
    ]
})

# ---------------------------------------
# Structure
# ---------------------------------------

print(
    "Shape:",
    df.shape
)

print(
    df.dtypes
)

print(
    df.isna().sum()
)

# ---------------------------------------
# Numerical summaries
# ---------------------------------------

print(
    df.describe()
)

# ---------------------------------------
# Categorical frequencies
# ---------------------------------------

print(
    df["branch"]
    .value_counts()
)

# ---------------------------------------
# Correlation
# ---------------------------------------

print(
    df[
        [
            "age",
            "hours_studied",
            "marks"
        ]
    ].corr()
)

# ---------------------------------------
# Distribution
# ---------------------------------------

df["marks"].hist(
    bins=5
)

plt.xlabel("Marks")
plt.ylabel("Frequency")
plt.title("Marks Distribution")
plt.show()

# ---------------------------------------
# Relationship
# ---------------------------------------

plt.scatter(
    df["hours_studied"],
    df["marks"]
)

plt.xlabel(
    "Hours Studied"
)

plt.ylabel(
    "Marks"
)

plt.title(
    "Study Time vs Marks"
)

plt.show()`,

        explanation: [
          "EDA begins with dataset structure and missingness.",
          "describe provides numerical summaries.",
          "value_counts reveals category frequency.",
          "corr provides a numerical summary of linear relationships.",
          "The histogram shows the target distribution.",
          "The scatter plot reveals the relationship between study time and marks.",
          "Plots and statistics should be interpreted together.",
        ],

        commonMistakes: [
          "Creating dozens of plots without a question.",
          "Interpreting correlation as causation.",
          "Ignoring missing values before interpreting summaries.",
          "Ignoring target leakage.",
        ],
      },
    ],

    practice: [
      {
        id: "eda-practice-1",
        title: "First Five Checks",
        type: "analysis",
        difficulty: "basic",
        question:
          "You receive a new DataFrame. Name five things you would inspect before training a model.",
        instructions: [
          "Include structure, types and quality.",
        ],
        hints: [
          "Think shape, sample rows, dtypes, missingness and distributions.",
        ],
        explanation:
          "A strong answer includes shape, sample records, column names/types, missingness, duplicates and numerical/categorical distributions.",
      },

      {
        id: "eda-practice-2",
        title: "Categorical Distribution",
        type: "coding",
        difficulty: "basic",
        question:
          "Write Pandas code to inspect the number of observations in every value of the target column.",
        instructions: [
          "Use value_counts.",
        ],
        hints: [
          "df['target'].value_counts()",
        ],
        explanation:
          "value_counts() provides class or category frequencies.",
      },

      {
        id: "eda-practice-3",
        title: "Correlation Trap",
        type: "analysis",
        difficulty: "medium",
        question:
          "Two variables have Pearson correlation close to zero. Can you conclude there is no relationship between them?",
        instructions: [
          "Discuss nonlinear relationships.",
        ],
        hints: [
          "Pearson correlation summarizes linear association.",
        ],
        explanation:
          "No. A strong nonlinear relationship can have weak Pearson correlation. Visualization and other analysis may reveal structure the coefficient misses.",
      },

      {
        id: "eda-practice-4",
        title: "Classification Target",
        type: "analysis",
        difficulty: "medium",
        question:
          "A target contains 980 negative examples and 20 positive examples. What important modeling issue has EDA revealed?",
        instructions: [
          "Calculate the broad proportions mentally.",
          "Connect the finding to evaluation.",
        ],
        hints: [
          "The classes are highly imbalanced.",
        ],
        explanation:
          "EDA has revealed severe class imbalance. Accuracy alone may become misleading, and stratification, suitable metrics and later imbalance strategies deserve attention.",
      },

      {
        id: "eda-practice-5",
        title: "Suspicious Predictor",
        type: "analysis",
        difficulty: "advanced",
        question:
          "One feature has almost perfect correlation with the target. Why should you investigate rather than immediately celebrate?",
        instructions: [
          "Consider leakage and data-generation timing.",
        ],
        hints: [
          "Very strong signals can sometimes encode the answer.",
        ],
        explanation:
          "The feature may genuinely be powerful, but it may also contain target leakage, post-outcome information or an encoded target. Its meaning and availability at prediction time must be verified.",
      },
    ],

    keyTakeaways: [
      "EDA is structured investigation before modeling.",
      "Univariate analysis studies individual variables.",
      "Bivariate analysis studies relationships.",
      "Correlation is useful but limited.",
      "Correlation does not establish causation.",
      "Target analysis can reveal imbalance and leakage.",
      "EDA findings should guide preprocessing and modeling decisions.",
    ],
  },


  // =========================================================
  // ADVANCED EDA
  // =========================================================

  "advanced-eda": {
    overview:
      "Advanced EDA moves from simple plots to systematic investigation of interactions, subgroup behavior, nonlinear relationships, skewness, multicollinearity, target leakage and data drift. The objective is to discover structure that changes modeling decisions while avoiding misleading conclusions.",

    objectives: [
      "Perform multivariate analysis.",
      "Investigate interactions and subgroup effects.",
      "Analyze skewed distributions.",
      "Understand transformations conceptually.",
      "Investigate multicollinearity.",
      "Detect possible leakage through EDA.",
      "Compare train and test distributions.",
      "Recognize Simpson's paradox and aggregation traps.",
      "Create modeling hypotheses from EDA.",
    ],

    sections: [
      {
        id: "advanced-eda-multivariate",
        title: "Multivariate Relationships",

        explanation: [
          "Relationships can change when additional variables are considered.",
          "A global relationship may disappear or reverse within subgroups.",
          "Color, faceting and grouped summaries can reveal interactions.",
          "Multivariate EDA helps identify whether a model may need interaction terms or nonlinear structure.",
        ],

        intuition: [
          "The relationship between two variables may depend on a third variable.",
        ],

        importantPoints: [
          "Inspect important subgroups.",
          "Do not rely only on global averages.",
          "Search for plausible interactions.",
        ],
      },

      {
        id: "advanced-eda-skew",
        title: "Skewness and Transformations",

        explanation: [
          "Some numerical variables have long asymmetric tails.",
          "Highly skewed variables can make averages less representative and may affect certain models.",
          "Logarithmic or related transformations can sometimes create a more useful representation.",
          "Transformations must respect the variable's domain and should not be applied mechanically.",
        ],

        intuition: [
          "A few extremely large values can stretch a distribution and dominate its scale.",
        ],

        importantPoints: [
          "Inspect distributions visually.",
          "Compare mean and median.",
          "Use transformations only when meaningful.",
          "Remember to apply transformations consistently during inference.",
        ],
      },

      {
        id: "advanced-eda-multicollinearity",
        title: "Multicollinearity",

        explanation: [
          "Predictor variables can carry strongly overlapping information.",
          "This can make linear-model coefficient estimates unstable or difficult to interpret.",
          "A correlation matrix can reveal pairwise relationships, although multicollinearity is broader than pairwise correlation alone.",
          "Feature selection, regularization or domain-driven redesign may help depending on the objective.",
        ],

        intuition: [
          "If two features tell almost the same story, a linear model may struggle to determine how much responsibility each one deserves.",
        ],

        importantPoints: [
          "Check strongly related predictors.",
          "Distinguish predictive performance from coefficient interpretability.",
          "Regularization can help stabilize some models.",
        ],
      },

      {
        id: "advanced-eda-train-test",
        title: "Train/Test Distribution Differences",

        explanation: [
          "Evaluation assumes that validation or test data meaningfully represents the environment in which the model will operate.",
          "Large distribution differences between training and evaluation data can indicate sampling problems, temporal drift or dataset construction issues.",
          "Comparing distributions can reveal whether a random split is appropriate.",
          "Time-dependent datasets often require chronological evaluation.",
        ],

        intuition: [
          "A model trained in one environment may fail when the environment changes.",
        ],

        importantPoints: [
          "Compare feature distributions.",
          "Check category frequencies.",
          "Consider time and sampling processes.",
          "Do not automatically shuffle temporal data.",
        ],
      },

      {
        id: "advanced-eda-simpson",
        title: "Aggregation Traps and Simpson's Paradox",

        explanation: [
          "An overall trend can differ from trends observed within important subgroups.",
          "This can occur when group sizes or confounding variables differ.",
          "Aggregated summaries can therefore hide important structure.",
          "EDA should compare overall and subgroup behavior when domain context suggests relevant groups.",
        ],

        intuition: [
          "Combining groups can change the apparent relationship because the groups contribute observations in different proportions.",
        ],

        importantPoints: [
          "Inspect subgroup relationships.",
          "Do not rely only on aggregated statistics.",
          "Association does not automatically reveal causal mechanisms.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "advanced-eda-multivariate-lab",
      title: "Advanced EDA Lab",
      description:
        "Explore subgroup relationships, skewness, transformations, multicollinearity and train/test distribution shifts interactively.",
    },

    codeExamples: [
      {
        id: "advanced-eda-code",
        title: "Advanced Distribution and Relationship Analysis",
        description:
          "Inspect skewness, correlation and subgroup summaries.",
        language: "python",

        code: `import numpy as np
import pandas as pd

df = pd.DataFrame({
    "income": [
        25000, 28000, 31000,
        35000, 42000, 50000,
        65000, 90000, 250000
    ],
    "experience": [
        1, 2, 2, 3, 5,
        6, 8, 10, 15
    ],
    "age": [
        21, 23, 24, 25, 28,
        30, 34, 38, 45
    ],
    "department": [
        "A", "A", "B",
        "A", "B", "B",
        "A", "B", "A"
    ]
})

# ---------------------------------------
# Skewness
# ---------------------------------------

print(
    "Income skew:",
    df["income"].skew()
)

df["log_income"] = np.log1p(
    df["income"]
)

print(
    "Log-income skew:",
    df["log_income"].skew()
)

# ---------------------------------------
# Correlations
# ---------------------------------------

print(
    df[
        [
            "income",
            "experience",
            "age"
        ]
    ].corr()
)

# ---------------------------------------
# Group summaries
# ---------------------------------------

summary = (
    df
    .groupby("department")
    .agg(
        mean_income=(
            "income",
            "mean"
        ),
        median_income=(
            "income",
            "median"
        ),
        count=(
            "income",
            "size"
        )
    )
)

print(summary)`,

        explanation: [
          "skew quantifies one aspect of distribution asymmetry.",
          "log1p is useful when zero values are possible and a log-style transformation is appropriate.",
          "The correlation matrix reveals overlapping linear relationships among numerical features.",
          "Grouped means and medians can reveal subgroup differences.",
          "The extreme income value demonstrates why mean and median can tell different stories.",
        ],

        commonMistakes: [
          "Applying log transforms to every skewed variable automatically.",
          "Removing every extreme value.",
          "Treating correlations as causal evidence.",
          "Ignoring subgroup structure.",
        ],
      },
    ],

    practice: [
      {
        id: "advanced-eda-practice-1",
        title: "Mean vs Median",
        type: "analysis",
        difficulty: "medium",
        question:
          "A salary distribution contains a few extremely high salaries. Why might median better represent a typical employee than mean?",
        instructions: [
          "Discuss sensitivity to extreme values.",
        ],
        hints: [
          "The mean uses the magnitude of every value.",
        ],
        explanation:
          "Extremely high values can pull the mean upward substantially, while the median depends on ordering and is more resistant to extreme magnitudes.",
      },

      {
        id: "advanced-eda-practice-2",
        title: "Redundant Predictors",
        type: "analysis",
        difficulty: "medium",
        question:
          "Two predictors have correlation 0.99. Should one always be deleted?",
        instructions: [
          "Discuss model type and objective.",
        ],
        hints: [
          "Prediction and interpretation have different concerns.",
        ],
        explanation:
          "Not automatically. Strong redundancy may affect coefficient stability and interpretation in some models, but the correct decision depends on model family, domain meaning and validation results.",
      },

      {
        id: "advanced-eda-practice-3",
        title: "Distribution Shift",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Training customers have average age 28 while production customers now average 52 with a visibly different distribution. Why is this important?",
        instructions: [
          "Discuss generalization.",
          "Mention distribution shift.",
        ],
        hints: [
          "Production observations differ from training observations.",
        ],
        explanation:
          "The model is being applied to a population different from its training distribution. Performance estimates from the original data may no longer represent current production behavior.",
      },

      {
        id: "advanced-eda-practice-4",
        title: "Subgroup Reversal",
        type: "analysis",
        difficulty: "advanced",
        question:
          "An overall dataset shows treatment A with a higher success rate, but treatment B has a higher success rate inside each severity group. What should you investigate?",
        instructions: [
          "Discuss aggregation and group composition.",
        ],
        hints: [
          "This resembles Simpson's paradox.",
        ],
        explanation:
          "Investigate severity-group composition and aggregation effects. Different group proportions can reverse an overall association relative to subgroup associations.",
      },

      {
        id: "advanced-eda-practice-5",
        title: "EDA to Modeling Decision",
        type: "analysis",
        difficulty: "advanced",
        question:
          "EDA reveals a curved relationship between one feature and a regression target. Give three modeling responses you could investigate.",
        instructions: [
          "Think beyond ordinary linear regression.",
        ],
        hints: [
          "Feature transformations and nonlinear models are possibilities.",
        ],
        explanation:
          "Reasonable experiments include polynomial or transformed features, spline-like representations where appropriate, or nonlinear model families such as trees, with choices validated rather than assumed.",
      },
    ],

    keyTakeaways: [
      "Important relationships can depend on other variables.",
      "Skewness affects how distributions should be summarized.",
      "Transformations should have a reason.",
      "Multicollinearity can affect interpretation and model stability.",
      "Train and production distributions should be compared.",
      "Aggregated relationships can hide subgroup behavior.",
      "Advanced EDA should produce testable modeling hypotheses.",
    ],
  },


  // =========================================================
  // DATA VISUALIZATION
  // =========================================================

  "data-visualization": {
    overview:
      "Data visualization converts numerical and categorical information into visual structure that humans can inspect quickly. Good visualization is not decoration: it is a reasoning tool for understanding distributions, comparisons, relationships, uncertainty and model behavior. This lesson covers Matplotlib and Seaborn while emphasizing how to choose the right chart for the question.",

    objectives: [
      "Explain why visualization is important in data science.",
      "Understand Matplotlib figure and axes concepts.",
      "Create line, bar, scatter, histogram and box plots.",
      "Use Seaborn for statistical visualizations.",
      "Choose plots according to variable types.",
      "Create correlation heatmaps.",
      "Avoid misleading axes and visual encodings.",
      "Design readable analytical charts.",
    ],

    sections: [
      {
        id: "visualization-question",
        title: "Start with the Analytical Question",

        explanation: [
          "A visualization should answer a question.",
          "Different chart types represent different relationships.",
          "Histograms show numerical distributions.",
          "Bar charts compare categories.",
          "Scatter plots show relationships between numerical variables.",
          "Box plots compare numerical distributions and reveal spread and unusual observations.",
          "Line charts are especially useful when order, often time, matters.",
        ],

        intuition: [
          "Choose a chart based on the relationship you want the viewer to see.",
        ],

        importantPoints: [
          "Distribution → histogram.",
          "Category comparison → bar chart.",
          "Numerical relationship → scatter plot.",
          "Group distributions → box plot.",
          "Ordered trend → line chart.",
        ],
      },

      {
        id: "visualization-matplotlib",
        title: "Matplotlib Foundations",

        explanation: [
          "Matplotlib is a foundational Python plotting library.",
          "A Figure is the overall drawing container.",
          "Axes are the actual plotting areas containing data, labels and titles.",
          "Using fig, ax = plt.subplots() provides explicit control and scales better than relying entirely on global plotting state.",
          "Labels and titles should communicate what values mean.",
        ],

        intuition: [
          "The figure is the canvas while an axes object is one plotting region on that canvas.",
        ],

        importantPoints: [
          "Use clear axis labels.",
          "Use meaningful titles.",
          "Avoid unnecessary visual clutter.",
          "Use explicit axes objects in reusable code.",
        ],
      },

      {
        id: "visualization-seaborn",
        title: "Seaborn",

        explanation: [
          "Seaborn builds on Matplotlib and provides convenient statistical visualization functions.",
          "It integrates naturally with Pandas DataFrames.",
          "Functions such as histplot, scatterplot, boxplot and heatmap reduce plotting boilerplate.",
          "Parameters such as hue can encode additional categorical information.",
          "Seaborn does not remove the need to understand what a chart means.",
        ],

        intuition: [
          "Seaborn provides higher-level statistical plotting tools while Matplotlib remains the underlying visualization foundation.",
        ],

        importantPoints: [
          "Seaborn works naturally with DataFrames.",
          "hue can represent groups.",
          "Choose visual encodings intentionally.",
        ],
      },

      {
        id: "visualization-heatmap",
        title: "Correlation Heatmaps",

        explanation: [
          "A heatmap can display a correlation matrix using a visual encoding.",
          "It helps identify groups of strongly associated numerical variables.",
          "A heatmap does not establish causation.",
          "Large heatmaps can become unreadable and should be limited to relevant variables.",
        ],

        intuition: [
          "The heatmap turns a numerical matrix into a visual pattern that is faster to scan.",
        ],

        importantPoints: [
          "Interpret the numerical scale.",
          "Do not infer causation.",
          "Use relevant variables.",
        ],
      },

      {
        id: "visualization-misleading",
        title: "Avoid Misleading Visualizations",

        explanation: [
          "Truncated axes can exaggerate differences.",
          "Three-dimensional effects can distort perception.",
          "Too many colors or categories can make plots unreadable.",
          "Charts should show units and meaningful labels.",
          "Visual design should make comparisons easier rather than manipulate perception.",
        ],

        intuition: [
          "A good analytical chart makes the data easier to understand without changing the story through visual tricks.",
        ],

        importantPoints: [
          "Check axis ranges.",
          "Label units.",
          "Avoid unnecessary 3D effects.",
          "Use consistent scales when comparing plots.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "chart-selection-playground",
      title: "Visualization Playground",
      description:
        "Select variable types and analytical questions, then compare histograms, bar charts, scatter plots, box plots and heatmaps interactively.",
    },

    codeExamples: [
      {
        id: "visualization-matplotlib-code",
        title: "Matplotlib Analytical Plots",
        description:
          "Create clean distribution and relationship plots.",
        language: "python",

        code: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "hours": [
        1, 2, 3, 4,
        5, 6, 7, 8
    ],
    "marks": [
        45, 52, 58, 67,
        72, 79, 85, 91
    ]
})

fig, ax = plt.subplots()

ax.scatter(
    df["hours"],
    df["marks"]
)

ax.set_xlabel(
    "Hours Studied"
)

ax.set_ylabel(
    "Marks"
)

ax.set_title(
    "Study Time vs Marks"
)

plt.show()


fig, ax = plt.subplots()

ax.hist(
    df["marks"],
    bins=5
)

ax.set_xlabel(
    "Marks"
)

ax.set_ylabel(
    "Frequency"
)

ax.set_title(
    "Marks Distribution"
)

plt.show()`,

        explanation: [
          "The scatter plot examines a relationship between two numerical variables.",
          "The histogram examines one numerical distribution.",
          "Explicit axes objects make labels and plot configuration clear.",
          "The chosen chart follows the analytical question.",
        ],

        commonMistakes: [
          "Using a line chart for unordered categories without reason.",
          "Leaving axes unlabeled.",
          "Creating visually attractive plots that answer no analytical question.",
        ],
      },

      {
        id: "visualization-seaborn-code",
        title: "Seaborn Statistical Visualization",
        description:
          "Use Seaborn for grouped distributions and correlation analysis.",
        language: "python",

        code: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "hours": [
        2, 3, 4, 5,
        6, 7, 8, 4
    ],
    "marks": [
        50, 58, 65, 72,
        78, 85, 91, 63
    ],
    "branch": [
        "AIML", "AIML",
        "CSE", "CSE",
        "AIML", "CSE",
        "AIML", "CSE"
    ]
})

sns.scatterplot(
    data=df,
    x="hours",
    y="marks",
    hue="branch"
)

plt.title(
    "Study Time vs Marks by Branch"
)

plt.show()


numeric_df = df[
    [
        "hours",
        "marks"
    ]
]

correlation = (
    numeric_df.corr()
)

sns.heatmap(
    correlation,
    annot=True
)

plt.title(
    "Correlation Matrix"
)

plt.show()`,

        explanation: [
          "Seaborn accepts DataFrame column names directly.",
          "hue adds a categorical grouping dimension.",
          "The heatmap visualizes the numerical correlation matrix.",
          "annot=True displays correlation values as well as visual shading.",
        ],

        commonMistakes: [
          "Adding too many hue categories.",
          "Interpreting heatmap intensity without checking values.",
          "Treating correlation as causal evidence.",
        ],
      },
    ],

    practice: [
      {
        id: "visualization-practice-1",
        title: "Choose the Chart",
        type: "concept",
        difficulty: "basic",
        question:
          "Which chart would you first choose to inspect the distribution of student marks?",
        instructions: [
          "Choose a chart for one numerical variable.",
        ],
        hints: [
          "You want to see frequency across value ranges.",
        ],
        explanation:
          "A histogram is a natural first choice for examining the distribution of one numerical variable.",
      },

      {
        id: "visualization-practice-2",
        title: "Numerical Relationship",
        type: "concept",
        difficulty: "basic",
        question:
          "Which chart is appropriate for examining the relationship between height and weight?",
        instructions: [
          "Both variables are numerical.",
        ],
        hints: [
          "Each observation can become one point.",
        ],
        explanation:
          "A scatter plot is appropriate for exploring the relationship between two numerical variables.",
      },

      {
        id: "visualization-practice-3",
        title: "Group Comparison",
        type: "analysis",
        difficulty: "medium",
        question:
          "You want to compare salary distributions across four departments. Why may a box plot be more informative than comparing only four means?",
        instructions: [
          "Discuss spread and unusual observations.",
        ],
        hints: [
          "A mean compresses each group to one number.",
        ],
        explanation:
          "A box plot reveals center, spread and potentially unusual observations, while a mean alone hides distribution shape.",
      },

      {
        id: "visualization-practice-4",
        title: "Misleading Axis",
        type: "analysis",
        difficulty: "medium",
        question:
          "Two bars represent values 98 and 100, but the y-axis begins at 97. Why might the visual difference appear misleadingly large?",
        instructions: [
          "Discuss axis truncation.",
        ],
        hints: [
          "Only a very narrow range is displayed.",
        ],
        explanation:
          "The truncated axis visually magnifies a small absolute difference. Whether truncation is appropriate depends on context, but it must not mislead the viewer about magnitude.",
      },

      {
        id: "visualization-practice-5",
        title: "Build an EDA Plot Set",
        type: "analysis",
        difficulty: "medium",
        question:
          "For a dataset containing age, salary, department and churn, choose four plots that answer different useful EDA questions.",
        instructions: [
          "Include distribution, categorical frequency and relationships.",
        ],
        hints: [
          "Do not choose plots merely because they look different.",
        ],
        explanation:
          "Examples include a histogram for age, box plot of salary by department, bar/count plot for churn and scatter plot or grouped distribution for meaningful numerical relationships.",
      },
    ],

    keyTakeaways: [
      "Visualization is an analytical tool.",
      "Chart choice depends on the question and variable types.",
      "Matplotlib provides low-level plotting control.",
      "Seaborn provides convenient statistical visualizations.",
      "Histograms show distributions.",
      "Scatter plots show numerical relationships.",
      "Box plots support group-distribution comparison.",
      "Heatmaps can summarize correlation matrices.",
      "Good visualizations communicate rather than distort.",
    ],
  },


  // =========================================================
  // STATISTICS FOUNDATION
  // =========================================================

  "statistics-foundation": {
    overview:
      "Statistics provides the language for describing data, measuring variability, reasoning about uncertainty and interpreting relationships. Machine learning relies heavily on statistical thinking even when libraries hide the underlying calculations.",

    objectives: [
      "Differentiate population and sample.",
      "Calculate and interpret mean, median and mode.",
      "Understand variance and standard deviation.",
      "Understand quantiles and IQR.",
      "Interpret distributions.",
      "Understand probability fundamentals.",
      "Understand covariance and correlation.",
      "Understand sampling intuition.",
      "Understand confidence intervals conceptually.",
      "Understand hypothesis testing conceptually.",
      "Avoid common statistical interpretation errors.",
    ],

    sections: [
      {
        id: "statistics-population-sample",
        title: "Population and Sample",

        explanation: [
          "A population is the complete collection about which we want to reason.",
          "A sample is a subset of observations from that population.",
          "Machine-learning datasets are often samples from a larger future population.",
          "If the sample is systematically unrepresentative, even sophisticated models may generalize poorly.",
        ],

        intuition: [
          "We usually cannot observe every future case, so we learn from a sample and hope it represents the broader population.",
        ],

        importantPoints: [
          "Population is the broader group of interest.",
          "Sample is the observed subset.",
          "Sampling quality affects conclusions.",
        ],
      },

      {
        id: "statistics-central-tendency",
        title: "Mean, Median and Mode",

        explanation: [
          "The mean is the arithmetic average.",
          "The median is the middle value after sorting.",
          "The mode is the most frequent value.",
          "The mean is sensitive to extreme values.",
          "The median is more resistant to extreme magnitudes.",
          "The most useful summary depends on the distribution and variable meaning.",
        ],

        intuition: [
          "Measures of central tendency attempt to describe a typical or central location, but they define typical in different ways.",
        ],

        importantPoints: [
          "Mean uses every magnitude.",
          "Median depends on ordering.",
          "Mode describes frequency.",
          "Inspect distributions before choosing a summary.",
        ],
      },

      {
        id: "statistics-variance",
        title: "Variance and Standard Deviation",

        explanation: [
          "Measures of center do not describe how spread out observations are.",
          "Variance measures average squared deviation from the mean according to its chosen population or sample formula.",
          "Standard deviation is the square root of variance.",
          "Standard deviation returns to the original measurement units, making it easier to interpret than variance.",
          "Spread matters because two datasets can have the same mean but very different variability.",
        ],

        intuition: [
          "Variance and standard deviation describe how far values tend to spread around their center.",
        ],

        importantPoints: [
          "Variance uses squared deviations.",
          "Standard deviation is in the original units.",
          "Center and spread should be interpreted together.",
        ],
      },

      {
        id: "statistics-quantiles",
        title: "Quantiles and IQR",

        explanation: [
          "Quantiles divide ordered observations according to position.",
          "The median is the 50th percentile.",
          "Q1 is commonly the 25th percentile and Q3 the 75th percentile.",
          "The interquartile range is Q3 - Q1.",
          "IQR summarizes the spread of the central half of the data and is relatively resistant to extreme values.",
        ],

        intuition: [
          "Quantiles describe where observations sit after the data is ordered.",
        ],

        importantPoints: [
          "IQR = Q3 - Q1.",
          "Quantiles are useful for skewed distributions.",
          "IQR-based outlier rules are heuristics, not proof that a point is invalid.",
        ],
      },

      {
        id: "statistics-probability",
        title: "Probability Foundations",

        explanation: [
          "Probability represents uncertainty using values from 0 to 1.",
          "Conditional probability describes the probability of an event given information about another event.",
          "Independence means that knowing one event does not change the probability of another under the relevant definition.",
          "Conditional probability becomes especially important for Naive Bayes and classification reasoning.",
        ],

        intuition: [
          "Probability provides a numerical language for uncertainty.",
        ],

        importantPoints: [
          "Probabilities range from 0 to 1.",
          "Conditional probability incorporates known information.",
          "Independence is a specific mathematical property.",
        ],
      },

      {
        id: "statistics-correlation",
        title: "Covariance and Correlation",

        explanation: [
          "Covariance indicates whether two variables tend to move together.",
          "Its magnitude depends on measurement scales.",
          "Correlation standardizes this relationship, commonly into a range from -1 to 1 for Pearson correlation.",
          "Positive correlation indicates variables tend to move in the same direction, while negative correlation indicates opposite direction.",
          "Correlation does not imply causation.",
        ],

        intuition: [
          "Correlation asks whether larger values of one variable tend to appear with larger or smaller values of another.",
        ],

        importantPoints: [
          "Correlation has direction and magnitude.",
          "Pearson correlation focuses on linear relationships.",
          "Outliers can strongly influence correlation.",
          "Correlation is not causation.",
        ],
      },

      {
        id: "statistics-sampling",
        title: "Sampling and Uncertainty",

        explanation: [
          "Statistics calculated from a sample vary from sample to sample.",
          "This sampling variability means a sample estimate should not be treated as an exact population truth.",
          "Larger representative samples often provide more stable estimates.",
          "Biased sampling cannot necessarily be fixed simply by collecting more observations from the same biased process.",
        ],

        intuition: [
          "If you repeatedly sample from the same population, you will not obtain exactly the same mean every time.",
        ],

        importantPoints: [
          "Sample statistics contain uncertainty.",
          "Representativeness matters.",
          "More biased data is still biased data.",
        ],
      },

      {
        id: "statistics-confidence",
        title: "Confidence Intervals",

        explanation: [
          "A confidence interval provides a range constructed by a statistical procedure designed to capture an unknown population parameter at a stated long-run rate under its assumptions.",
          "A 95% confidence interval does not mean there is a 95% probability that a fixed parameter lies inside one already-computed frequentist interval.",
          "The interval width depends on variability, sample size and the procedure used.",
          "Confidence intervals provide more information than a point estimate alone.",
        ],

        intuition: [
          "A point estimate gives one number; an interval communicates uncertainty around the estimation procedure.",
        ],

        importantPoints: [
          "Intervals communicate uncertainty.",
          "Interpret confidence levels carefully.",
          "Assumptions matter.",
        ],
      },

      {
        id: "statistics-hypothesis",
        title: "Hypothesis Testing",

        explanation: [
          "Hypothesis testing provides a framework for comparing observed data with a null hypothesis.",
          "A p-value measures how compatible the observed result, or something more extreme according to the test statistic, is with the null model under the test assumptions.",
          "A p-value is not the probability that the null hypothesis is true.",
          "Statistical significance does not automatically imply practical importance.",
          "Effect sizes and confidence intervals often provide important additional context.",
        ],

        intuition: [
          "A hypothesis test asks whether the observed evidence would be surprising under a specified null model.",
        ],

        importantPoints: [
          "Define hypotheses before interpreting results.",
          "p-value is not P(null hypothesis is true).",
          "Statistical significance and practical significance differ.",
          "Check assumptions.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "statistics-distribution-sampling-lab",
      title: "Statistics and Sampling Lab",
      description:
        "Manipulate distributions, outliers, sample sizes and repeated samples to observe changes in mean, median, variance, correlation and sampling uncertainty.",
    },

    codeExamples: [
      {
        id: "statistics-code-1",
        title: "Descriptive Statistics with NumPy and Pandas",
        description:
          "Calculate center, spread and quantiles.",
        language: "python",

        code: `import numpy as np
import pandas as pd

values = np.array([
    10,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    100
])

print(
    "Mean:",
    np.mean(values)
)

print(
    "Median:",
    np.median(values)
)

print(
    "Variance:",
    np.var(values)
)

print(
    "Standard deviation:",
    np.std(values)
)

q1 = np.percentile(
    values,
    25
)

q3 = np.percentile(
    values,
    75
)

iqr = q3 - q1

print(
    "Q1:",
    q1
)

print(
    "Q3:",
    q3
)

print(
    "IQR:",
    iqr
)

series = pd.Series(values)

print(
    series.describe()
)`,

        explanation: [
          "The extreme value 100 pulls the mean upward.",
          "The median is more resistant to that extreme value.",
          "Variance and standard deviation quantify spread.",
          "Q1 and Q3 define the interquartile range.",
          "describe provides several useful descriptive statistics together.",
        ],

        commonMistakes: [
          "Reporting only the mean for highly skewed data.",
          "Treating every IQR-flagged observation as invalid.",
          "Confusing variance and standard deviation.",
        ],
      },

      {
        id: "statistics-code-2",
        title: "Correlation Experiment",
        description:
          "Compare linear correlation under different relationships.",
        language: "python",

        code: `import numpy as np

x = np.array([
    -3, -2, -1,
    0,
    1, 2, 3
])

linear_y = (
    2 * x + 1
)

nonlinear_y = (
    x ** 2
)

linear_corr = np.corrcoef(
    x,
    linear_y
)[0, 1]

nonlinear_corr = np.corrcoef(
    x,
    nonlinear_y
)[0, 1]

print(
    "Linear correlation:",
    linear_corr
)

print(
    "Nonlinear correlation:",
    nonlinear_corr
)`,

        explanation: [
          "The linear relationship produces correlation near 1.",
          "The symmetric quadratic relationship can have correlation near zero despite a deterministic relationship.",
          "This demonstrates why correlation alone cannot describe every relationship.",
        ],

        commonMistakes: [
          "Concluding that correlation near zero means no relationship.",
          "Assuming correlation proves causation.",
        ],
      },
    ],

    practice: [
      {
        id: "statistics-practice-1",
        title: "Mean vs Median",
        type: "analysis",
        difficulty: "basic",
        question:
          "For salaries [25, 28, 30, 31, 300] thousand, which is more representative of a typical salary: mean or median?",
        instructions: [
          "Consider the extreme value.",
        ],
        hints: [
          "300 is far larger than the other observations.",
        ],
        explanation:
          "The median is often more representative of the typical salary here because the extreme value strongly pulls the mean upward.",
      },

      {
        id: "statistics-practice-2",
        title: "Same Mean, Different Spread",
        type: "analysis",
        difficulty: "medium",
        question:
          "Dataset A and Dataset B have the same mean, but B has much larger standard deviation. What does this tell you?",
        instructions: [
          "Interpret spread separately from center.",
        ],
        hints: [
          "The observations in B vary more around the mean.",
        ],
        explanation:
          "The datasets share the same central average but B is more dispersed.",
      },

      {
        id: "statistics-practice-3",
        title: "Correlation Reasoning",
        type: "analysis",
        difficulty: "medium",
        question:
          "If Pearson correlation between x and y is 0, does that prove x contains no information about y?",
        instructions: [
          "Discuss nonlinear structure.",
        ],
        hints: [
          "Consider y = x² over a symmetric range.",
        ],
        explanation:
          "No. Pearson correlation can be zero even when a strong nonlinear relationship exists.",
      },

      {
        id: "statistics-practice-4",
        title: "Probability",
        type: "concept",
        difficulty: "medium",
        question:
          "If 30 of 100 historical customers churned, what is the empirical churn proportion?",
        instructions: [
          "Divide the event count by total observations.",
        ],
        hints: [
          "30 / 100.",
        ],
        explanation:
          "The empirical proportion is 0.30, or 30%. It is an observed sample proportion, not a guarantee about future customers.",
      },

      {
        id: "statistics-practice-5",
        title: "Interpret a p-value",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A test returns p = 0.03. Is it correct to say there is a 3% probability that the null hypothesis is true?",
        instructions: [
          "Explain what a p-value conditions on.",
        ],
        hints: [
          "The calculation assumes the null model when assessing the observed statistic.",
        ],
        explanation:
          "No. A frequentist p-value is not the probability that the null hypothesis is true. It describes the extremeness of the observed result under the null model and test assumptions.",
      },

      {
        id: "statistics-practice-6",
        title: "Sampling Bias",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A university surveys only students in the library to estimate average daily study time for all students. What problem may arise?",
        instructions: [
          "Consider whether the sample is representative.",
        ],
        hints: [
          "Library users may systematically differ from other students.",
        ],
        explanation:
          "The sampling process may be biased because students present in the library may study differently from the full student population.",
      },
    ],

    commonMistakes: [
      {
        id: "statistics-mistake-1",
        title: "Correlation means causation",
        description:
          "An association between variables does not establish that changing one causes changes in the other.",
        correction:
          "Treat correlation as association and consider design, confounding and domain evidence before causal claims.",
      },

      {
        id: "statistics-mistake-2",
        title: "Mean is always the best average",
        description:
          "The mean can be strongly affected by skewness and extreme observations.",
        correction:
          "Inspect the distribution and compare appropriate summaries.",
      },

      {
        id: "statistics-mistake-3",
        title: "p-value is probability the null is true",
        description:
          "This is a common but incorrect interpretation.",
        correction:
          "Interpret the p-value under the null model and assumptions rather than as a posterior probability of the hypothesis.",
      },
    ],

    keyTakeaways: [
      "Samples are used to reason about broader populations.",
      "Mean, median and mode describe center differently.",
      "Variance and standard deviation describe spread.",
      "Quantiles describe positions in ordered data.",
      "Probability provides a language for uncertainty.",
      "Correlation summarizes association, not causation.",
      "Sampling introduces uncertainty.",
      "Confidence intervals communicate uncertainty around estimation procedures.",
      "Hypothesis tests require careful interpretation.",
      "Statistical reasoning is foundational to machine learning.",
    ],
  },
};