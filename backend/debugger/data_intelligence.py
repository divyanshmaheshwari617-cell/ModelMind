import math
import re
from collections import Counter
from typing import Any


# ============================================================
# PUBLIC ENTRY POINT
# ============================================================

def analyze_data_problem(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:
    """
    Detect common Pandas / dataset problems that ModelMind can explain
    deterministically without sending the error to an AI model.

    This function does not modify the user's dataset.
    It returns recommendations only.
    """

    level = normalize_level(level)

    handlers = (
        analyze_pandas_key_error,
        analyze_numeric_conversion_error,
        analyze_missing_value_error,
        analyze_infinite_value_error,
        analyze_empty_dataset_error,
        analyze_csv_error,
    )

    for handler in handlers:
        result = handler(
            error_type=error_type,
            message=message,
            code=code,
            level=level,
        )

        if result is not None:
            return result

    return None


# ============================================================
# LEVEL
# ============================================================

def normalize_level(level: str | None) -> str:
    value = (level or "basic").strip().lower()

    if value in {"medium", "intermediate"}:
        return "medium"

    if value in {"advanced", "expert"}:
        return "advanced"

    return "basic"


# ============================================================
# COMMON RESULT
# ============================================================

def make_result(
    *,
    problem: str,
    explanation: str,
    why: str,
    recommendation: str,
    code_example: str,
    level: str,
    confidence: float,
    category: str = "data",
    warnings: list[str] | None = None,
) -> dict:

    return {
        "handled": True,
        "source": "modelmind-local",
        "category": category,
        "problem": problem,
        "level": level,
        "confidence": confidence,
        "explanation": explanation,
        "why": why,
        "recommendation": recommendation,
        "code_example": code_example,
        "warnings": warnings or [],
        "safe_to_apply": False,
    }


# ============================================================
# PANDAS KEY / COLUMN ERROR
# ============================================================

def analyze_pandas_key_error(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:

    if error_type != "KeyError":
        return None

    column = extract_quoted_value(message)

    if level == "basic":
        explanation = (
            "Pandas cannot find the column or key you requested."
        )

        why = (
            f'The requested name appears to be "{column}". '
            if column
            else ""
        ) + (
            "The spelling, capitalization or spaces may not match "
            "the real column name."
        )

        recommendation = (
            "Print the DataFrame columns first, then use the exact "
            "column name."
        )

        code_example = (
            "print(df.columns)\n"
            "\n"
            "# Then use the exact column name\n"
            'print(df["Age"])'
        )

    elif level == "medium":
        explanation = (
            "Pandas raised a KeyError because the requested label "
            "does not exist in the DataFrame index or columns."
        )

        why = (
            f'The missing label appears to be "{column}". '
            if column
            else ""
        ) + (
            "Common causes are capitalization differences, leading "
            "or trailing whitespace, or selecting a column that was "
            "renamed or removed earlier."
        )

        recommendation = (
            "Inspect the schema and compare normalized names before "
            "changing the code."
        )

        code_example = (
            "print(df.columns.tolist())\n"
            "\n"
            "# Inspect hidden spaces\n"
            "for column in df.columns:\n"
            "    print(repr(column))"
        )

    else:
        explanation = (
            "A DataFrame label lookup failed because the requested "
            "schema element is absent from the current DataFrame."
        )

        why = (
            f'The unresolved label appears to be "{column}". '
            if column
            else ""
        ) + (
            "This may indicate schema drift, an upstream rename, "
            "feature-selection mismatch or unnormalized external data."
        )

        recommendation = (
            "Validate the input schema explicitly before the modeling "
            "pipeline consumes the DataFrame."
        )

        code_example = (
            'required_columns = {"Age", "Income", "Target"}\n'
            "missing_columns = required_columns - set(df.columns)\n"
            "\n"
            "if missing_columns:\n"
            "    raise ValueError(\n"
            '        f"Missing required columns: {sorted(missing_columns)}"\n'
            "    )"
        )

    return make_result(
        problem="DataFrame column not found",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.96,
        category="pandas",
    )


# ============================================================
# STRING -> NUMBER / CATEGORICAL CONVERSION
# ============================================================

def analyze_numeric_conversion_error(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:

    lower = message.lower()

    patterns = (
        "could not convert string to float",
        "could not convert string to numeric",
        "invalid literal for int",
    )

    if error_type not in {"ValueError", "TypeError"}:
        return None

    if not any(pattern in lower for pattern in patterns):
        return None

    bad_value = extract_quoted_value(message)

    if level == "basic":
        explanation = (
            "Your code expected a number, but it found text instead."
        )

        why = (
            f'The value "{bad_value}" is text. '
            if bad_value
            else "At least one value is text. "
        ) + (
            "A mathematical operation or machine-learning model cannot "
            "use that value directly as a number."
        )

        recommendation = (
            "First check which columns contain text. If the text is a "
            "category such as Male/Female or Yes/No, encode it instead "
            "of forcing it into a float."
        )

        code_example = (
            "print(df.dtypes)\n"
            "\n"
            "# Example for a categorical column\n"
            'df = pd.get_dummies(df, columns=["Gender"])'
        )

    elif level == "medium":
        explanation = (
            "A numerical operation received categorical or malformed "
            "text data."
        )

        why = (
            f'The problematic value appears to be "{bad_value}". '
            if bad_value
            else ""
        ) + (
            "Numeric-looking strings can be converted, but genuine "
            "categories require an encoding strategy."
        )

        recommendation = (
            "Separate numerical conversion from categorical encoding. "
            "Use pd.to_numeric for numeric text and OneHotEncoder or "
            "another appropriate encoder for categorical features."
        )

        code_example = (
            "# Numeric text\n"
            'df["Age"] = pd.to_numeric(df["Age"], errors="coerce")\n'
            "\n"
            "# Categorical features\n"
            'df = pd.get_dummies(df, columns=["Gender"], dtype=int)'
        )

    else:
        explanation = (
            "The feature matrix contains a value that violates the "
            "numerical dtype contract expected by the downstream "
            "estimator or transformation."
        )

        why = (
            f'The observed value appears to be "{bad_value}". '
            if bad_value
            else ""
        ) + (
            "This usually means heterogeneous feature types reached a "
            "numerical estimator without a fitted preprocessing pipeline."
        )

        recommendation = (
            "Separate numerical and categorical columns and transform "
            "them with a ColumnTransformer inside a Pipeline."
        )

        code_example = (
            "from sklearn.compose import ColumnTransformer\n"
            "from sklearn.preprocessing import OneHotEncoder, StandardScaler\n"
            "from sklearn.pipeline import Pipeline\n"
            "\n"
            'numeric_features = ["Age", "Income"]\n'
            'categorical_features = ["Gender"]\n'
            "\n"
            "preprocessor = ColumnTransformer(\n"
            "    transformers=[\n"
            '        ("num", StandardScaler(), numeric_features),\n'
            '        ("cat", OneHotEncoder(handle_unknown="ignore"), '
            "categorical_features),\n"
            "    ]\n"
            ")"
        )

    return make_result(
        problem="Text found where numeric data was expected",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.97,
        category="preprocessing",
    )


# ============================================================
# MISSING VALUES / NAN
# ============================================================

def analyze_missing_value_error(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:

    lower = message.lower()

    indicators = (
        "input contains nan",
        "contains nan",
        "nan values",
        "missing values",
        "contains missing",
    )

    if not any(indicator in lower for indicator in indicators):
        return None

    if level == "basic":
        explanation = (
            "Your dataset contains missing values. Some rows do not "
            "have a value for one or more features."
        )

        why = (
            "Many machine-learning operations cannot work directly "
            "with empty numerical values."
        )

        recommendation = (
            "Check which columns contain missing values. For a simple "
            "numerical example, fill them using the median."
        )

        code_example = (
            "print(df.isnull().sum())\n"
            "\n"
            "# Simple beginner-friendly example\n"
            'df["Age"] = df["Age"].fillna(df["Age"].median())'
        )

        warnings = [
            "Choose the fill strategy according to the meaning of the feature.",
        ]

    elif level == "medium":
        explanation = (
            "Missing values were detected in data being passed to an "
            "operation that expects complete input."
        )

        why = (
            "The appropriate imputation strategy depends on feature "
            "type, distribution, skewness and outliers."
        )

        recommendation = (
            "Measure missingness and inspect each feature. Mean can suit "
            "roughly symmetric numerical data; median is more robust to "
            "skew/outliers; mode can suit categorical features."
        )

        code_example = (
            "missing = df.isnull().sum()\n"
            "print(missing[missing > 0])\n"
            "\n"
            'print(df["Income"].skew())\n'
            "\n"
            "# Example when the feature is skewed\n"
            'df["Income"] = df["Income"].fillna(\n'
            '    df["Income"].median()\n'
            ")"
        )

        warnings = [
            "Do not select mean/median/mode only because it is convenient.",
            "Inspect the distribution and feature meaning first.",
        ]

    else:
        explanation = (
            "Missing observations reached a transformation or estimator "
            "that does not accept them in the current configuration."
        )

        why = (
            "For evaluated ML workflows, preprocessing should be learned "
            "from training data only. Fitting imputation statistics on "
            "the full dataset can leak information from validation/test "
            "data."
        )

        recommendation = (
            "Use SimpleImputer inside a Pipeline or ColumnTransformer. "
            "Split the data first; fit preprocessing on X_train and only "
            "transform X_test."
        )

        code_example = (
            "from sklearn.model_selection import train_test_split\n"
            "from sklearn.impute import SimpleImputer\n"
            "from sklearn.pipeline import Pipeline\n"
            "\n"
            "X_train, X_test, y_train, y_test = train_test_split(\n"
            "    X,\n"
            "    y,\n"
            "    test_size=0.2,\n"
            "    random_state=42,\n"
            ")\n"
            "\n"
            "preprocessing = Pipeline(\n"
            "    steps=[\n"
            '        ("imputer", SimpleImputer(strategy="median")),\n'
            "    ]\n"
            ")\n"
            "\n"
            "X_train_processed = preprocessing.fit_transform(X_train)\n"
            "X_test_processed = preprocessing.transform(X_test)"
        )

        warnings = [
            "Do not fit the imputer separately on the test set.",
            "Do not fit imputation statistics on the full dataset before splitting.",
        ]

    return make_result(
        problem="Missing values detected",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.98,
        category="preprocessing",
        warnings=warnings,
    )


# ============================================================
# INFINITE VALUES
# ============================================================

def analyze_infinite_value_error(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:

    lower = message.lower()

    if not (
        "infinity" in lower
        or "infinite" in lower
        or "inf" in lower and "value" in lower
    ):
        return None

    if level == "basic":
        explanation = (
            "Your dataset contains an infinite value such as inf or -inf."
        )

        why = (
            "This can happen after operations such as division by a very "
            "small value or division by zero."
        )

        recommendation = (
            "Find the infinite values before training the model."
        )

        code_example = (
            "import numpy as np\n"
            "\n"
            "print(np.isinf(df.select_dtypes(include='number')).sum())"
        )

    elif level == "medium":
        explanation = (
            "One or more numerical features contain positive or negative "
            "infinity, which the downstream operation cannot process."
        )

        why = (
            "Infinite values commonly originate from ratios, logarithms "
            "or transformations with invalid domains."
        )

        recommendation = (
            "Identify the transformation that created infinity rather "
            "than immediately replacing every infinite value."
        )

        code_example = (
            "import numpy as np\n"
            "\n"
            "numeric = df.select_dtypes(include='number')\n"
            "print(np.isinf(numeric).sum())\n"
            "\n"
            "# Inspect the source calculation before deciding how to handle it"
        )

    else:
        explanation = (
            "Non-finite feature values violate the numerical input "
            "contract of the downstream estimator."
        )

        why = (
            "The root cause may be an unstable feature transformation, "
            "zero denominator, overflow or invalid mathematical domain."
        )

        recommendation = (
            "Trace the non-finite values back to their generating "
            "transformation, validate its domain and handle the condition "
            "before the modeling pipeline."
        )

        code_example = (
            "import numpy as np\n"
            "\n"
            "numeric = df.select_dtypes(include='number')\n"
            "finite_mask = np.isfinite(numeric)\n"
            "\n"
            "problem_counts = (~finite_mask).sum()\n"
            "print(problem_counts[problem_counts > 0])"
        )

    return make_result(
        problem="Infinite values detected",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.95,
        category="preprocessing",
    )


# ============================================================
# EMPTY DATASET
# ============================================================

def analyze_empty_dataset_error(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:

    lower = message.lower()

    indicators = (
        "0 sample",
        "0 samples",
        "zero samples",
        "empty data",
        "empty dataset",
        "found array with 0",
    )

    if not any(indicator in lower for indicator in indicators):
        return None

    if level == "basic":
        explanation = (
            "The model received an empty dataset."
        )

        why = (
            "There are no rows available for this operation. A filter "
            "or earlier preprocessing step may have removed everything."
        )

        recommendation = (
            "Print the dataset shape before training."
        )

        code_example = (
            "print(df.shape)\n"
            "print(df.head())"
        )

    elif level == "medium":
        explanation = (
            "The estimator received zero usable samples."
        )

        why = (
            "Filtering, dropna, train/test slicing or preprocessing may "
            "have produced an empty DataFrame or feature matrix."
        )

        recommendation = (
            "Inspect the shape after each major preprocessing operation "
            "to identify where the rows disappear."
        )

        code_example = (
            'print("Original:", df.shape)\n'
            "\n"
            "# After each preprocessing step\n"
            'print("After preprocessing:", X.shape)'
        )

    else:
        explanation = (
            "The training or transformation stage received a feature "
            "matrix with zero observations."
        )

        why = (
            "An upstream data-selection invariant has been violated."
        )

        recommendation = (
            "Add explicit dataset-size validation at pipeline boundaries "
            "and inspect filtering/splitting logic."
        )

        code_example = (
            "if len(X_train) == 0:\n"
            "    raise ValueError(\n"
            '        "Training dataset is empty after preprocessing."\n'
            "    )"
        )

    return make_result(
        problem="Empty dataset",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.96,
        category="dataset",
    )


# ============================================================
# CSV / PARSER PROBLEMS
# ============================================================

def analyze_csv_error(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:

    lower = message.lower()

    looks_like_csv = (
        "parsererror" in lower
        or "error tokenizing data" in lower
        or "expected" in lower and "fields in line" in lower
    )

    if not looks_like_csv:
        return None

    if level == "basic":
        explanation = (
            "Pandas is having trouble reading the CSV file."
        )

        why = (
            "Some rows may have a different number of values, or the "
            "file may use a different separator."
        )

        recommendation = (
            "Check the CSV file and confirm whether values are separated "
            "by commas, semicolons or another character."
        )

        code_example = (
            'df = pd.read_csv("data.csv")\n'
            "\n"
            "# If the file uses semicolons:\n"
            'df = pd.read_csv("data.csv", sep=";")'
        )

    elif level == "medium":
        explanation = (
            "The CSV parser found inconsistent field structure."
        )

        why = (
            "Possible causes include the wrong delimiter, malformed "
            "quoted text or rows containing different field counts."
        )

        recommendation = (
            "Inspect the raw rows around the parser error before deciding "
            "whether to change delimiter or parser options."
        )

        code_example = (
            'df = pd.read_csv("data.csv", sep=",")\n'
            "\n"
            "print(df.head())\n"
            "print(df.columns.tolist())"
        )

    else:
        explanation = (
            "The delimited-text parser could not reconcile the input "
            "records with the inferred or configured CSV schema."
        )

        why = (
            "The source may contain delimiter inconsistencies, quoting "
            "problems, encoding issues or malformed records."
        )

        recommendation = (
            "Validate the source format and parser configuration rather "
            "than suppressing malformed rows by default."
        )

        code_example = (
            "import pandas as pd\n"
            "\n"
            'df = pd.read_csv(\n'
            '    "data.csv",\n'
            '    sep=",",\n'
            '    encoding="utf-8",\n'
            ")\n"
            "\n"
            "print(df.info())"
        )

    return make_result(
        problem="CSV parsing problem",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.90,
        category="pandas",
    )


# ============================================================
# DATASET PROFILING HELPERS
# Used later by Dataset X-Ray / Preprocessing Advisor
# ============================================================

def summarize_numeric_values(
    values: list[Any],
) -> dict:

    clean = []

    for value in values:
        if value is None:
            continue

        try:
            numeric = float(value)
        except (TypeError, ValueError):
            continue

        if math.isfinite(numeric):
            clean.append(numeric)

    if not clean:
        return {
            "count": 0,
            "mean": None,
            "median": None,
            "minimum": None,
            "maximum": None,
            "skewness": None,
        }

    ordered = sorted(clean)
    count = len(ordered)

    mean_value = sum(ordered) / count

    if count % 2 == 1:
        median_value = ordered[count // 2]
    else:
        median_value = (
            ordered[count // 2 - 1]
            + ordered[count // 2]
        ) / 2

    variance = (
        sum(
            (value - mean_value) ** 2
            for value in ordered
        )
        / count
    )

    std = math.sqrt(variance)

    if std == 0:
        skewness = 0.0
    else:
        skewness = (
            sum(
                ((value - mean_value) / std) ** 3
                for value in ordered
            )
            / count
        )

    return {
        "count": count,
        "mean": mean_value,
        "median": median_value,
        "minimum": ordered[0],
        "maximum": ordered[-1],
        "skewness": skewness,
    }


def recommend_numeric_imputation(
    values: list[Any],
    level: str = "basic",
) -> dict:

    level = normalize_level(level)

    stats = summarize_numeric_values(values)

    if stats["count"] == 0:
        return {
            "strategy": None,
            "reason": "No usable numerical values were found.",
            "level": level,
        }

    skewness = stats["skewness"] or 0.0

    if abs(skewness) >= 1.0:
        strategy = "median"
        reason = (
            "The numerical distribution is strongly skewed, so the "
            "median is more resistant to extreme values."
        )
    else:
        strategy = "mean"
        reason = (
            "The numerical distribution is not strongly skewed, so "
            "mean imputation can be considered."
        )

    if level == "basic":
        implementation = (
            f'df["column"] = df["column"].fillna('
            f'df["column"].{strategy}())'
        )

    elif level == "medium":
        implementation = (
            f'# Distribution-aware recommendation: {strategy}\n'
            f'df["column"] = df["column"].fillna('
            f'df["column"].{strategy}())'
        )

    else:
        implementation = (
            "from sklearn.impute import SimpleImputer\n"
            "\n"
            f'imputer = SimpleImputer(strategy="{strategy}")\n'
            "X_train_processed = imputer.fit_transform(X_train)\n"
            "X_test_processed = imputer.transform(X_test)"
        )

    return {
        "strategy": strategy,
        "reason": reason,
        "level": level,
        "statistics": stats,
        "implementation": implementation,
    }


def recommend_categorical_imputation(
    values: list[Any],
    level: str = "basic",
) -> dict:

    level = normalize_level(level)

    clean = [
        value
        for value in values
        if value is not None
        and str(value).strip() != ""
    ]

    if not clean:
        return {
            "strategy": None,
            "reason": "No usable categorical values were found.",
            "level": level,
        }

    counts = Counter(
        str(value)
        for value in clean
    )

    mode_value, mode_count = counts.most_common(1)[0]

    if level == "advanced":
        implementation = (
            "from sklearn.impute import SimpleImputer\n"
            "\n"
            'imputer = SimpleImputer(strategy="most_frequent")\n'
            "X_train_processed = imputer.fit_transform(X_train)\n"
            "X_test_processed = imputer.transform(X_test)"
        )

    else:
        implementation = (
            'df["column"] = df["column"].fillna('
            'df["column"].mode()[0])'
        )

    return {
        "strategy": "most_frequent",
        "mode": mode_value,
        "mode_count": mode_count,
        "reason": (
            "Categorical features cannot use a numerical mean or median. "
            "The most frequent category is a simple imputation option."
        ),
        "level": level,
        "implementation": implementation,
    }


# ============================================================
# SMALL PARSING HELPERS
# ============================================================

def extract_quoted_value(
    message: str,
) -> str | None:

    patterns = (
        r"'([^']+)'",
        r'"([^"]+)"',
    )

    for pattern in patterns:
        match = re.search(
            pattern,
            message,
        )

        if match:
            return match.group(1)

    return None