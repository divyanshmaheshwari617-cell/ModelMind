from pathlib import Path
from typing import Any

import pandas as pd

from intelligence.dataset import (
    analyze_feature,
    load_dataset,
)


VALID_LEVELS = {
    "basic": "basic",
    "medium": "medium",
    "advanced": "advanced",
}


def normalize_level(level: str) -> str:
    return VALID_LEVELS.get(
        str(level).strip().lower(),
        "basic",
    )


def _round(value: float) -> float:
    return round(float(value), 4)


def _is_likely_id(
    column: str,
    unique_count: int,
    non_null_count: int,
) -> bool:
    name = str(column).lower()

    name_based = (
        name == "id"
        or name.endswith("_id")
        or name.startswith("id_")
    )

    unique_ratio = (
        unique_count / non_null_count
        if non_null_count > 0
        else 0
    )

    return bool(
        name_based
        or (
            non_null_count >= 20
            and unique_ratio >= 0.98
        )
    )


def _missing_severity(
    percentage: float,
) -> str:
    if percentage == 0:
        return "none"

    if percentage < 5:
        return "low"

    if percentage < 20:
        return "moderate"

    if percentage < 50:
        return "high"

    return "very_high"


def _numeric_recommendation(
    analysis: dict[str, Any],
    level: str,
) -> dict[str, Any]:

    feature = str(
        analysis["feature"]
    )

    missing_count = int(
        analysis.get(
            "missing_count",
            0,
        )
    )

    missing_percentage = float(
        analysis.get(
            "missing_percentage",
            0,
        )
    )

    skewness = float(
        analysis.get(
            "skewness",
            0,
        )
    )

    outlier_count = int(
        analysis.get(
            "outlier_count",
            0,
        )
    )

    outlier_percentage = float(
        analysis.get(
            "outlier_percentage",
            0,
        )
    )

    unique_count = int(
        analysis.get(
            "unique_count",
            0,
        )
    )

    non_null_count = int(
        analysis.get(
            "non_null_count",
            0,
        )
    )

    imputation = str(
        analysis.get(
            "imputation_strategy",
            "none",
        )
    )

    scaling = str(
        analysis.get(
            "scaling_strategy",
            "model_dependent",
        )
    )

    transformation = str(
        analysis.get(
            "transformation_strategy",
            "none",
        )
    )

    warnings: list[str] = []

    if unique_count <= 1:
        warnings.append(
            "This feature is constant or nearly empty "
            "and may provide little predictive information."
        )

    if _is_likely_id(
        feature,
        unique_count,
        non_null_count,
    ):
        warnings.append(
            "This column behaves like an identifier. "
            "Review it before using it as a model feature."
        )

    if missing_percentage >= 50:
        warnings.append(
            "More than half of this feature is missing. "
            "Consider whether the feature should be kept "
            "before choosing an imputation strategy."
        )

    if level == "basic":
        if imputation == "mean":
            missing_action = (
                "Fill missing values with the mean."
            )
            missing_code = (
                f'df["{feature}"] = '
                f'df["{feature}"].fillna('
                f'df["{feature}"].mean())'
            )

        elif imputation == "median":
            missing_action = (
                "Fill missing values with the median."
            )
            missing_code = (
                f'df["{feature}"] = '
                f'df["{feature}"].fillna('
                f'df["{feature}"].median())'
            )

        else:
            missing_action = (
                "No missing-value filling is currently required."
            )
            missing_code = (
                f'# No missing-value filling is required '
                f'for {feature}'
            )

        explanation = (
            "ModelMind uses the shape of the numerical "
            "feature and the presence of extreme values "
            "to choose a simple starting strategy."
        )

    elif level == "medium":
        if imputation == "mean":
            missing_action = (
                "Use mean imputation because the feature "
                "is reasonably symmetric and has limited "
                "outlier evidence."
            )

            missing_code = (
                f'mean_value = df["{feature}"].mean()\n'
                f'df["{feature}"] = '
                f'df["{feature}"].fillna(mean_value)'
            )

        elif imputation == "median":
            missing_action = (
                "Use median imputation because skewness "
                "or outliers make the median more robust."
            )

            missing_code = (
                f'median_value = df["{feature}"].median()\n'
                f'df["{feature}"] = '
                f'df["{feature}"].fillna(median_value)'
            )

        else:
            missing_action = (
                "No numerical imputation is currently needed."
            )
            missing_code = (
                f'# {feature} currently has no missing values'
            )

        explanation = (
            f"Skewness = {_round(skewness)} and "
            f"IQR outliers = {outlier_count} "
            f"({_round(outlier_percentage)}%). "
            "These statistics are used when choosing "
            "between mean and median imputation."
        )

    else:
        strategy = (
            "mean"
            if imputation == "mean"
            else "median"
        )

        if imputation == "none":
            missing_action = (
                "No imputer is currently required for "
                "this feature."
            )

            missing_code = (
                f'# No imputer is required for {feature}'
            )

        else:
            missing_action = (
                f'Use SimpleImputer(strategy="{strategy}") '
                "inside a preprocessing pipeline. Fit the "
                "pipeline using training data only."
            )

            missing_code = (
                "from sklearn.impute import SimpleImputer\n\n"
                f'imputer = SimpleImputer(strategy="{strategy}")\n'
                f'X_train[["{feature}"]] = '
                "imputer.fit_transform("
                f'X_train[["{feature}"]])\n'
                f'X_test[["{feature}"]] = '
                "imputer.transform("
                f'X_test[["{feature}"]])'
            )

        explanation = (
            f"Skewness = {_round(skewness)}, "
            f"outlier rate = "
            f"{_round(outlier_percentage)}%. "
            "For production ML, learned preprocessing "
            "should be fitted only on training data and "
            "then reused for validation/test data."
        )

    return {
        "feature": feature,
        "feature_type": "numerical",
        "dtype": analysis.get("dtype"),
        "missing_count": missing_count,
        "missing_percentage":
            _round(missing_percentage),
        "missing_severity":
            _missing_severity(
                missing_percentage
            ),
        "unique_count": unique_count,
        "skewness": _round(skewness),
        "distribution_shape":
            analysis.get(
                "distribution_shape"
            ),
        "outlier_count": outlier_count,
        "outlier_percentage":
            _round(outlier_percentage),
        "imputation_strategy":
            imputation,
        "imputation_reason":
            analysis.get(
                "imputation_reason"
            ),
        "scaling_strategy":
            scaling,
        "scaling_reason":
            analysis.get(
                "scaling_reason"
            ),
        "transformation_strategy":
            transformation,
        "transformation_reason":
            analysis.get(
                "transformation_reason"
            ),
        "recommended_action":
            missing_action,
        "explanation": explanation,
        "example_code": missing_code,
        "warnings": warnings,
    }


def _categorical_recommendation(
    analysis: dict[str, Any],
    level: str,
) -> dict[str, Any]:

    feature = str(
        analysis["feature"]
    )

    missing_count = int(
        analysis.get(
            "missing_count",
            0,
        )
    )

    missing_percentage = float(
        analysis.get(
            "missing_percentage",
            0,
        )
    )

    unique_count = int(
        analysis.get(
            "unique_count",
            0,
        )
    )

    non_null_count = int(
        analysis.get(
            "non_null_count",
            0,
        )
    )

    unique_ratio = (
        unique_count / non_null_count
        if non_null_count > 0
        else 0
    )

    warnings: list[str] = []

    likely_id = _is_likely_id(
        feature,
        unique_count,
        non_null_count,
    )

    if likely_id:
        warnings.append(
            "This categorical feature behaves like an "
            "identifier. Encoding identifiers can create "
            "misleading patterns."
        )

    if unique_count <= 1:
        warnings.append(
            "This feature has one or fewer observed "
            "categories and may not provide useful "
            "predictive information."
        )

    if unique_count >= 50 or (
        unique_count >= 20
        and unique_ratio >= 0.5
    ):
        warnings.append(
            "This feature has high cardinality. "
            "One-hot encoding may create many columns."
        )

    if missing_percentage >= 50:
        warnings.append(
            "More than half of this feature is missing. "
            "Review whether the feature is useful before "
            "automatically filling the missing values."
        )

    if missing_count == 0:
        imputation_strategy = "none"

    else:
        imputation_strategy = (
            "most_frequent_or_unknown"
        )

    if level == "basic":
        if missing_count > 0:
            action = (
                "Fill missing categories with the most "
                "frequent value, or use 'Unknown' when "
                "missingness has its own meaning."
            )

            code = (
                f'df["{feature}"] = '
                f'df["{feature}"].fillna('
                f'df["{feature}"].mode()[0])'
            )

        else:
            action = (
                "No missing-value filling is currently required."
            )

            code = (
                f'# No missing-value filling is required '
                f'for {feature}'
            )

        explanation = (
            "Categorical features contain groups or labels. "
            "Missing categories need a meaningful category "
            "before many ML models can use the feature."
        )

    elif level == "medium":
        if missing_count > 0:
            action = (
                "Compare most-frequent imputation with an "
                "explicit 'Unknown' category. Choose based "
                "on what a missing value means in this dataset."
            )

            code = (
                f'mode_value = df["{feature}"].mode()[0]\n'
                f'df["{feature}"] = '
                f'df["{feature}"].fillna(mode_value)'
            )

        else:
            action = (
                "No categorical imputation is currently needed."
            )

            code = (
                f'# {feature} currently has no missing values'
            )

        explanation = (
            f"The feature contains {unique_count} observed "
            f"categories and {_round(missing_percentage)}% "
            "missing values. Cardinality and the meaning of "
            "missingness should influence preprocessing."
        )

    else:
        if missing_count > 0:
            action = (
                "Use SimpleImputer inside a categorical "
                "ColumnTransformer/Pipeline. Fit preprocessing "
                "using training data only."
            )

            code = (
                "from sklearn.impute import SimpleImputer\n"
                "from sklearn.preprocessing import OneHotEncoder\n"
                "from sklearn.pipeline import Pipeline\n\n"
                "categorical_pipeline = Pipeline([\n"
                '    ("imputer", SimpleImputer('
                'strategy="most_frequent")),\n'
                '    ("encoder", OneHotEncoder('
                'handle_unknown="ignore")),\n'
                "])"
            )

        else:
            action = (
                "No imputation is needed. If encoding is "
                "required, keep it inside the training "
                "preprocessing pipeline."
            )

            code = (
                "from sklearn.preprocessing import OneHotEncoder\n\n"
                "encoder = OneHotEncoder("
                'handle_unknown="ignore")'
            )

        explanation = (
            f"Cardinality = {unique_count}; unique ratio = "
            f"{_round(unique_ratio)}. Advanced preprocessing "
            "should keep imputation and encoding inside a "
            "pipeline to preserve the train/test boundary."
        )

    return {
        "feature": feature,
        "feature_type": "categorical",
        "dtype": analysis.get("dtype"),
        "missing_count": missing_count,
        "missing_percentage":
            _round(missing_percentage),
        "missing_severity":
            _missing_severity(
                missing_percentage
            ),
        "unique_count": unique_count,
        "unique_ratio":
            _round(unique_ratio),
        "imputation_strategy":
            imputation_strategy,
        "recommended_action":
            action,
        "explanation": explanation,
        "example_code": code,
        "warnings": warnings,
    }


def analyze_preprocessing(
    path: Path,
    level: str = "Basic",
) -> dict[str, Any]:

    normalized_level = normalize_level(
        level
    )

    df = load_dataset(path)

    rows = int(df.shape[0])
    columns = int(df.shape[1])

    duplicate_rows = int(
        df.duplicated().sum()
    )

    total_missing = int(
        df.isnull().sum().sum()
    )

    recommendations: list[
        dict[str, Any]
    ] = []

    numerical_count = 0
    categorical_count = 0
    warning_count = 0

    for column in df.columns:
        feature_analysis = (
            analyze_feature(
                path,
                str(column),
            )
        )

        if feature_analysis.get(
            "is_numeric"
        ):
            numerical_count += 1

            recommendation = (
                _numeric_recommendation(
                    feature_analysis,
                    normalized_level,
                )
            )

        else:
            categorical_count += 1

            recommendation = (
                _categorical_recommendation(
                    feature_analysis,
                    normalized_level,
                )
            )

        warning_count += len(
            recommendation["warnings"]
        )

        recommendations.append(
            recommendation
        )

    dataset_warnings: list[str] = []

    if duplicate_rows > 0:
        dataset_warnings.append(
            f"{duplicate_rows} duplicate rows were "
            "detected. Review whether they represent "
            "real repeated observations before removing them."
        )

    if rows == 0:
        dataset_warnings.append(
            "The dataset contains no rows."
        )

    if columns == 0:
        dataset_warnings.append(
            "The dataset contains no columns."
        )

    return {
        "handled": True,
        "source": "modelmind-local",
        "engine": "preprocessing-advisor",
        "level": normalized_level,
        "filename": path.name,
        "rows": rows,
        "columns": columns,
        "numerical_features":
            numerical_count,
        "categorical_features":
            categorical_count,
        "total_missing_values":
            total_missing,
        "duplicate_rows":
            duplicate_rows,
        "feature_warning_count":
            warning_count,
        "dataset_warnings":
            dataset_warnings,
        "recommendations":
            recommendations,
        "safety": {
            "dataset_modified": False,
            "automatic_apply": False,
            "message": (
                "ModelMind generated recommendations only. "
                "The dataset was not modified."
            ),
        },
    }