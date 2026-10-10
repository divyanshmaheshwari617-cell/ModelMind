
"""
ModelMind Boosting Learning Diagnostics

Provides real post-training educational diagnostics for:

1. AdaBoost learner weights and training errors
2. Gradient Boosting regression residual evolution
3. Gradient Boosting classification probability/loss evolution

All values are derived from fitted scikit-learn estimators.
No retraining or fabricated metrics.
"""

import numpy as np

from sklearn.metrics import (
    accuracy_score,
    log_loss,
    mean_absolute_error,
    mean_squared_error,
)


def safe_number(value):
    """Convert non-finite numbers to JSON-safe None."""
    try:
        number = float(value)
        return number if np.isfinite(number) else None
    except (TypeError, ValueError):
        return None


def safe_list(values, limit=40):
    """Return JSON-safe numerical previews."""
    array = np.asarray(values).ravel()[:limit]
    return [safe_number(value) for value in array]


def build_adaboost_diagnostics(pipeline):
    """
    Extract the actual fitted AdaBoost estimator weights
    and estimator training errors.

    These are model-level estimator statistics, not
    individual sample-weight histories.
    """

    model = pipeline.named_steps["model"]

    estimators = getattr(model, "estimators_", [])
    weights = getattr(model, "estimator_weights_", [])
    errors = getattr(model, "estimator_errors_", [])

    learner_count = len(estimators)

    learners = []

    for index in range(learner_count):
        weight = (
            safe_number(weights[index])
            if index < len(weights)
            else None
        )

        error = (
            safe_number(errors[index])
            if index < len(errors)
            else None
        )

        learners.append({
            "stage": index + 1,
            "estimator_weight": weight,
            "estimator_error": error,
        })

    return {
        "type": "adaboost",
        "learner_count": learner_count,
        "learners": learners,
        "note": (
            "Estimator weights describe the influence of "
            "fitted learners. Estimator errors are the "
            "values recorded by scikit-learn during fitting. "
            "These are not individual training sample weights."
        ),
    }


def build_gradient_regression_diagnostics(
    pipeline,
    X_train,
    y_train,
):
    """
    Calculate actual regression residuals at each
    fitted Gradient Boosting stage.

    Residual = true target - predicted target
    """

    model = pipeline.named_steps["model"]
    imputer = pipeline.named_steps["imputer"]

    transformed = imputer.transform(X_train)

    actual = np.asarray(
        y_train,
        dtype=float,
    )

    stages = []

    for stage, prediction in enumerate(
        model.staged_predict(transformed),
        start=1,
    ):
        predicted = np.asarray(
            prediction,
            dtype=float,
        )

        residuals = actual - predicted

        stages.append({
            "stage": stage,
            "mae": safe_number(
                mean_absolute_error(actual, predicted)
            ),
            "rmse": safe_number(
                np.sqrt(
                    mean_squared_error(
                        actual,
                        predicted,
                    )
                )
            ),
            "mean_absolute_residual": safe_number(
                np.mean(np.abs(residuals))
            ),
            "true_values": safe_list(actual),
            "predicted_values": safe_list(predicted),
            "residuals": safe_list(residuals),
        })

    return {
        "type": "gradient_boosting_regression",
        "stage_count": len(stages),
        "stages": stages,
        "note": (
            "Residuals are calculated after each fitted "
            "boosting stage. For squared-error regression, "
            "residuals are the negative loss gradients that "
            "guide subsequent learners."
        ),
    }


def build_gradient_classification_diagnostics(
    pipeline,
    X_train,
    y_train,
):
    """
    Calculate actual stage classification performance,
    probabilities and multiclass log loss.

    Supports binary and multiclass classification.
    """

    model = pipeline.named_steps["model"]
    imputer = pipeline.named_steps["imputer"]

    transformed = imputer.transform(X_train)

    actual = np.asarray(
        y_train,
        dtype=int,
    )

    classes = np.asarray(model.classes_)

    stages = []

    probability_iterator = model.staged_predict_proba(
        transformed
    )

    for stage, probabilities in enumerate(
        probability_iterator,
        start=1,
    ):
        probabilities = np.asarray(
            probabilities,
            dtype=float,
        )

        predicted_indices = np.argmax(
            probabilities,
            axis=1,
        )

        predicted = classes[predicted_indices]

        accuracy = accuracy_score(
            actual,
            predicted,
        )

        loss = log_loss(
            actual,
            probabilities,
            labels=classes,
        )

        class_positions = {
            int(class_label): index
            for index, class_label in enumerate(classes)
        }

        actual_positions = np.array(
            [class_positions[int(value)] for value in actual],
            dtype=int,
        )

        true_class_probabilities = probabilities[
            np.arange(len(actual)),
            actual_positions,
        ]

        probability_errors = (
            1.0 - true_class_probabilities
        )

        stages.append({
            "stage": stage,
            "accuracy": safe_number(accuracy),
            "log_loss": safe_number(loss),
            "mean_probability_error": safe_number(
                np.mean(probability_errors)
            ),
            "true_labels": safe_list(actual),
            "predicted_labels": safe_list(predicted),
            "true_class_probabilities": safe_list(
                true_class_probabilities
            ),
            "probability_errors": safe_list(
                probability_errors
            ),
        })

    return {
        "type": "gradient_boosting_classification",
        "stage_count": len(stages),
        "stages": stages,
        "note": (
            "Classification Gradient Boosting optimizes "
            "a differentiable loss. True-class probability "
            "errors shown here are educational diagnostics, "
            "not the exact per-class negative gradients "
            "used internally by the estimator."
        ),
    }


def build_learning_diagnostics(
    task,
    model_name,
    pipeline,
    X_train,
    y_train,
):
    """
    Main entry point.

    The existing ModelMind training endpoint can call
    this without altering any other model behavior.
    """

    if model_name == "single_tree":
        return {
            "type": "single_tree",
            "note": (
                "A standalone Decision Tree is not "
                "a sequential boosting ensemble."
            ),
        }

    if model_name == "adaboost":
        return build_adaboost_diagnostics(
            pipeline
        )

    if model_name == "gradient_boosting":
        if task == "regression":
            return build_gradient_regression_diagnostics(
                pipeline,
                X_train,
                y_train,
            )

        return build_gradient_classification_diagnostics(
            pipeline,
            X_train,
            y_train,
        )

    return {
        "type": "unsupported",
        "note": "No diagnostics available.",
    }
