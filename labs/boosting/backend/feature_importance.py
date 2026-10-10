
"""
ModelMind Boosting - Feature Importance Engine

Supports:
    - Decision Tree Classification
    - Decision Tree Regression
    - AdaBoost Classification
    - AdaBoost Regression
    - Gradient Boosting Classification
    - Gradient Boosting Regression

Provides:
    1. Native tree-based feature importance
    2. Held-out permutation importance
    3. Feature ranking
    4. Model-specific interpretations
    5. Warnings about importance limitations

All numerical importance values are calculated from
the actual fitted scikit-learn models.

This file does not retrain the models.
"""

import numpy as np
import pandas as pd

from sklearn.inspection import permutation_importance


# ============================================================
# SAFE NUMERIC UTILITIES
# ============================================================

def safe_number(value):
    try:
        number = float(value)

        if np.isfinite(number):
            return number

    except (TypeError, ValueError, OverflowError):
        pass

    return None


def safe_array(values):
    return [
        safe_number(value)
        for value in values
    ]


# ============================================================
# MODEL EXPLANATIONS
# ============================================================

def get_model_explanation(model_name):

    explanations = {
        "single_tree": {
            "name": "Single Decision Tree",
            "description": (
                "A Decision Tree selects features when "
                "splitting observations into branches."
            ),
            "native_meaning": (
                "Native importance summarizes weighted "
                "impurity reduction across tree splits."
            ),
            "interpretation": (
                "Features receiving greater native "
                "importance were more influential in "
                "the fitted tree's impurity reductions."
            ),
        },

        "adaboost": {
            "name": "AdaBoost",
            "description": (
                "AdaBoost combines sequentially fitted "
                "weak learners."
            ),
            "native_meaning": (
                "Native importance, where supported, "
                "aggregates the feature importances "
                "of fitted weak learners using their "
                "estimator weights."
            ),
            "interpretation": (
                "A higher native score means that a "
                "feature contributed more to the "
                "weighted tree-based importance "
                "reported by the fitted ensemble."
            ),
        },

        "gradient_boosting": {
            "name": "Gradient Boosting",
            "description": (
                "Gradient Boosting adds trees "
                "sequentially to reduce the "
                "training loss."
            ),
            "native_meaning": (
                "Native importance aggregates "
                "impurity reductions attributed "
                "to features in the fitted trees."
            ),
            "interpretation": (
                "Features with higher scores "
                "contributed more to the fitted "
                "ensemble's tree-split importance."
            ),
        },
    }

    return explanations.get(
        model_name,
        {
            "name": model_name,
            "description": "Fitted machine learning model.",
            "native_meaning": (
                "Native feature importance "
                "may not be available."
            ),
            "interpretation": (
                "Review the permutation importance "
                "for a model-agnostic interpretation."
            ),
        },
    )


# ============================================================
# NATIVE FEATURE IMPORTANCE
# ============================================================

def calculate_native_importance(
    pipeline,
    feature_names,
):
    """
    Read feature_importances_ from a fitted estimator.

    No fake default scores are returned.
    """

    model = pipeline.named_steps["model"]

    if not hasattr(model, "feature_importances_"):
        return {
            "available": False,
            "scores": [],
            "reason": (
                "The fitted estimator does not expose "
                "native feature_importances_."
            ),
        }

    try:
        values = np.asarray(
            model.feature_importances_,
            dtype=float,
        ).ravel()

    except (ValueError, TypeError, AttributeError) as exc:
        return {
            "available": False,
            "scores": [],
            "reason": str(exc),
        }

    if len(values) != len(feature_names):
        return {
            "available": False,
            "scores": [],
            "reason": (
                "Importance vector length does not "
                "match the selected feature count."
            ),
        }

    if not np.all(np.isfinite(values)):
        return {
            "available": False,
            "scores": [],
            "reason": (
                "Native importance contains "
                "non-finite values."
            ),
        }

    entries = []

    for name, value in zip(feature_names, values):
        entries.append({
            "feature": str(name),
            "importance": safe_number(value),
        })

    entries.sort(
        key=lambda item: item["importance"],
        reverse=True,
    )

    for index, item in enumerate(entries):
        item["rank"] = index + 1

    total = float(np.sum(values))

    return {
        "available": True,
        "scores": entries,
        "total_importance": safe_number(total),
        "reason": None,
    }


# ============================================================
# PERMUTATION IMPORTANCE
# ============================================================

def calculate_permutation_importance(
    pipeline,
    X_test,
    y_test,
    feature_names,
    task,
    random_state=42,
    max_rows=500,
    n_repeats=3,
):
    """
    Permutation importance on held-out test data.

    One feature is shuffled at a time while the
    trained pipeline and other features stay fixed.

    Classification scoring: accuracy
    Regression scoring: R2

    This measures reduction in model score,
    not a percentage contribution.
    """

    if task not in ("classification", "regression"):
        raise ValueError(
            "Unsupported task for permutation importance."
        )

    scorer = (
        "accuracy"
        if task == "classification"
        else "r2"
    )

    # Work on the held-out observations only.
    X_eval = X_test.loc[
        :,
        feature_names,
    ].copy()

    y_eval = np.asarray(y_test)

    # Keep calculations bounded on large CSV datasets.
    if len(X_eval) > max_rows:

        generator = np.random.default_rng(
            random_state
        )

        selected = np.sort(
            generator.choice(
                len(X_eval),
                size=max_rows,
                replace=False,
            )
        )

        X_eval = X_eval.iloc[selected].copy()
        y_eval = y_eval[selected]

    if len(X_eval) < 2:
        return {
            "available": False,
            "reason": (
                "At least two held-out rows are "
                "required for permutation importance."
            ),
            "scores": [],
            "scoring": scorer,
            "evaluated_rows": int(len(X_eval)),
        }

    try:

        result = permutation_importance(
            estimator=pipeline,
            X=X_eval,
            y=y_eval,
            scoring=scorer,
            n_repeats=n_repeats,
            random_state=random_state,
            n_jobs=1,
        )

    except (ValueError, TypeError) as exc:

        return {
            "available": False,
            "reason": str(exc),
            "scores": [],
            "scoring": scorer,
            "evaluated_rows": int(len(X_eval)),
        }

    averages = np.asarray(
        result.importances_mean,
        dtype=float,
    )

    deviations = np.asarray(
        result.importances_std,
        dtype=float,
    )

    entries = []

    for index, name in enumerate(feature_names):

        entries.append({
            "feature": str(name),
            "importance": safe_number(
                averages[index]
            ),
            "std": safe_number(
                deviations[index]
            ),
        })

    entries.sort(
        key=lambda item: (
            float("-inf")
            if item["importance"] is None
            else item["importance"]
        ),
        reverse=True,
    )

    for index, item in enumerate(entries):
        item["rank"] = index + 1

    return {
        "available": True,
        "scores": entries,
        "scoring": scorer,
        "evaluated_rows": int(len(X_eval)),
        "repeats": int(n_repeats),
        "reason": None,
    }


# ============================================================
# SUMMARY GENERATION
# ============================================================

def generate_feature_summary(
    native,
    permutation,
    model_name,
    task,
):
    """
    Create interpretations grounded in actual
    computed feature-importance values.
    """

    model_info = get_model_explanation(
        model_name
    )

    native_scores = (
        native.get("scores", [])
        if native.get("available")
        else []
    )

    permutation_scores = (
        permutation.get("scores", [])
        if permutation.get("available")
        else []
    )

    top_native = (
        native_scores[0]["feature"]
        if native_scores
        else None
    )

    top_permutation = (
        permutation_scores[0]["feature"]
        if permutation_scores
        else None
    )

    statements = []

    if top_native:
        statements.append(
            f"{top_native} has the highest native "
            f"feature-importance score for "
            f"{model_info['name']}."
        )

    if top_permutation:
        score = permutation_scores[0][
            "importance"
        ]

        if score is not None and score > 0:
            statements.append(
                f"{top_permutation} caused the largest "
                f"average decrease in held-out "
                f"performance when permuted."
            )

        elif score is not None:
            statements.append(
                "No feature caused a positive average "
                "performance decrease under the "
                "current permutation experiment."
            )

    if (
        top_native
        and top_permutation
        and top_native != top_permutation
    ):
        statements.append(
            "Native and permutation rankings differ. "
            "This is possible because they measure "
            "different properties of the fitted model."
        )

    statements.append(
        "Feature importance indicates model behavior, "
        "not causal influence."
    )

    statements.append(
        "Correlated or redundant features can make "
        "permutation importance difficult to interpret."
    )

    if task == "regression":
        statements.append(
            "Negative permutation importance means "
            "shuffling a feature improved the measured "
            "R2 score in this evaluation."
        )

    return {
        "top_native_feature": top_native,
        "top_permutation_feature": top_permutation,
        "statements": statements,
        "model_description": (
            model_info["description"]
        ),
        "native_meaning": (
            model_info["native_meaning"]
        ),
        "interpretation": (
            model_info["interpretation"]
        ),
    }


# ============================================================
# PUBLIC ENGINE FUNCTION
# ============================================================

def build_feature_importance(
    task,
    model_name,
    pipeline,
    X_test,
    y_test,
    feature_names,
    random_state=42,
):
    """
    Called after training each fitted model.

    Returns a JSON-compatible feature-importance
    explanation containing actual sklearn values.

    Does not alter the model, training parameters,
    train/test split, or existing visualizations.
    """

    names = list(feature_names)

    if not names:
        return {
            "available": False,
            "reason": "No features were selected.",
        }

    native = calculate_native_importance(
        pipeline=pipeline,
        feature_names=names,
    )

    permutation = calculate_permutation_importance(
        pipeline=pipeline,
        X_test=X_test,
        y_test=y_test,
        feature_names=names,
        task=task,
        random_state=random_state,
    )

    summary = generate_feature_summary(
        native=native,
        permutation=permutation,
        model_name=model_name,
        task=task,
    )

    return {
        "available": (
            native["available"]
            or permutation["available"]
        ),
        "model": model_name,
        "task": task,
        "feature_count": len(names),
        "features": names,
        "native": native,
        "permutation": permutation,
        "summary": summary,
    }
