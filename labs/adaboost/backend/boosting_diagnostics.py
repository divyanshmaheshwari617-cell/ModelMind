
"""
ModelMind AdaBoost - Per-Round Boosting Diagnostics

Builds educational diagnostics from fitted AdaBoost estimators.

Supports:
- Classification: learner predictions, mistakes and approximate
  SAMME sample-weight reconstruction.
- Regression: learner predictions and absolute errors.
- Classification/regression round metadata.
- Deterministic selection of example training observations.

This module does not refit estimators or modify the trained model.

Important:
Historical sample weights are not stored by scikit-learn's
AdaBoost estimator. Classification weights produced here are
reconstructed from the discrete SAMME update equation; they
must not be represented as recorded training-time weights.
Regression sample weights are not reconstructed because
AdaBoost.R2 involves stochastic weighted resampling.
"""

from __future__ import annotations

import math
from typing import Any

import numpy as np
import pandas as pd


def _safe_number(value: Any) -> float | None:
    """Convert finite numerical values into JSON-safe floats."""
    try:
        number = float(value)
        if math.isfinite(number):
            return number
    except (TypeError, ValueError, OverflowError):
        pass

    return None


def _safe_label(value: Any) -> str:
    """Represent a class label consistently for the frontend."""
    return str(value)


def _select_indices(
    n_samples: int,
    max_samples: int,
    random_state: int,
) -> np.ndarray:
    """Choose reproducible observations for visualization."""
    count = min(n_samples, max_samples)

    if count == n_samples:
        return np.arange(n_samples, dtype=int)

    rng = np.random.default_rng(random_state)

    return np.sort(
        rng.choice(
            n_samples,
            size=count,
            replace=False,
        )
    )


def _select_rounds(
    n_rounds: int,
    max_rounds: int,
) -> set[int]:
    """
    Preserve the first and last round while limiting response size.

    Round indexes are zero-based internally.
    """
    if n_rounds <= max_rounds:
        return set(range(n_rounds))

    positions = np.linspace(
        0,
        n_rounds - 1,
        num=max_rounds,
        dtype=int,
    )

    return set(int(position) for position in positions)


def build_boosting_diagnostics(
    *,
    fitted_model: Any,
    transformed_train: Any,
    raw_train: pd.DataFrame,
    y_train: Any,
    task: str,
    random_state: int = 42,
    max_samples: int = 24,
    max_rounds: int = 80,
    plot_features: list[str] | None = None,
) -> dict[str, Any]:
    """
    Generate compact diagnostics for the AdaBoost lab.

    Parameters
    ----------
    fitted_model:
        Fitted AdaBoostClassifier or AdaBoostRegressor.

    transformed_train:
        The result of calling the fitted preprocessing
        transform on X_train.

    raw_train:
        Original training features, before transformation.

    y_train:
        Training target in the same row order.

    task:
        'classification' or 'regression'.

    plot_features:
        Optional two numeric feature names for sample coordinates.

    Returns
    -------
    Dictionary containing rounds, selected training observations,
    estimator statistics, and weight interpretation metadata.
    """

    if task not in ("classification", "regression"):
        raise ValueError(
            "task must be 'classification' or 'regression'"
        )

    if max_samples < 1 or max_rounds < 1:
        raise ValueError(
            "max_samples and max_rounds must be positive"
        )

    y_array = np.asarray(y_train).reshape(-1)

    n_samples = len(y_array)
    estimators = fitted_model.estimators_
    n_rounds = len(estimators)

    if n_samples == 0:
        raise ValueError("Training data cannot be empty")

    if len(raw_train) != n_samples:
        raise ValueError(
            "raw_train and y_train row counts differ"
        )

    if transformed_train.shape[0] != n_samples:
        raise ValueError(
            "transformed_train and y_train row counts differ"
        )

    chosen_samples = _select_indices(
        n_samples,
        max_samples,
        random_state,
    )

    selected_rounds = _select_rounds(
        n_rounds,
        max_rounds,
    )

    # Initial uniform distribution used for educational
    # classification-weight reconstruction.
    weights = np.full(
        n_samples,
        1.0 / n_samples,
        dtype=float,
    )

    axes = [
        name
        for name in (plot_features or [])
        if name in raw_train.columns
    ][:2]

    sample_metadata = []

    for position in chosen_samples:
        position = int(position)

        coordinates: dict[str, float | None] = {}

        for feature in axes:
            coordinates[feature] = _safe_number(
                raw_train.iloc[position][feature]
            )

        sample_metadata.append(
            {
                "position": position,
                "row_index": str(raw_train.index[position]),
                "actual": (
                    _safe_label(y_array[position])
                    if task == "classification"
                    else _safe_number(y_array[position])
                ),
                "coordinates": coordinates,
            }
        )

    rounds = []

    estimator_weights = np.asarray(
        fitted_model.estimator_weights_,
        dtype=float,
    )

    estimator_errors = np.asarray(
        fitted_model.estimator_errors_,
        dtype=float,
    )

    for estimator_index, estimator in enumerate(estimators):
        predictions = np.asarray(
            estimator.predict(transformed_train)
        ).reshape(-1)

        estimator_weight = float(
            estimator_weights[estimator_index]
        )

        estimator_error = float(
            estimator_errors[estimator_index]
        )

        if task == "classification":
            incorrect = predictions != y_array

            # Store the distribution before this round's
            # mathematical update.
            before = weights.copy()

            # SAMME reweighting:
            # incorrect observations gain exp(alpha) relative
            # to correctly classified observations.
            #
            # We avoid exponential overflow, and do not claim
            # these are exact recorded training weights.
            if estimator_index < n_rounds - 1:
                multiplier = math.exp(
                    min(estimator_weight, 50.0)
                )

                updated = before * np.where(
                    incorrect,
                    multiplier,
                    1.0,
                )

                total = float(updated.sum())

                if math.isfinite(total) and total > 0:
                    weights = updated / total

            after = weights.copy()

        if estimator_index not in selected_rounds:
            continue

        observations = []

        for position in chosen_samples:
            position = int(position)

            actual = y_array[position]
            predicted = predictions[position]

            if task == "classification":
                is_correct = bool(predicted == actual)

                observations.append(
                    {
                        "position": position,
                        "actual": _safe_label(actual),
                        "predicted": _safe_label(predicted),
                        "correct": is_correct,
                        "absolute_error": None,
                        "weight_before": _safe_number(
                            before[position]
                        ),
                        "weight_after": (
                            _safe_number(after[position])
                            if estimator_index < n_rounds - 1
                            else None
                        ),
                    }
                )
            else:
                prediction_number = _safe_number(predicted)
                actual_number = _safe_number(actual)

                absolute_error = (
                    abs(prediction_number - actual_number)
                    if prediction_number is not None
                    and actual_number is not None
                    else None
                )

                observations.append(
                    {
                        "position": position,
                        "actual": actual_number,
                        "predicted": prediction_number,
                        "correct": None,
                        "absolute_error": absolute_error,
                        "weight_before": None,
                        "weight_after": None,
                    }
                )

        if task == "classification":
            accuracy = float(
                np.mean(predictions == y_array)
            )

            mean_abs_error = None
        else:
            accuracy = None

            mean_abs_error = float(
                np.mean(
                    np.abs(
                        predictions.astype(float)
                        - y_array.astype(float)
                    )
                )
            )

        rounds.append(
            {
                "round": estimator_index + 1,
                "estimator_error": _safe_number(
                    estimator_error
                ),
                "estimator_weight": _safe_number(
                    estimator_weight
                ),
                "weak_learner_accuracy": _safe_number(
                    accuracy
                ),
                "weak_learner_mae": _safe_number(
                    mean_abs_error
                ),
                "observations": observations,
            }
        )

    if task == "classification":
        weight_method = "samme_reconstructed"
        weight_note = (
            "Weights are reconstructed from fitted SAMME "
            "estimator predictions and contributions. They "
            "are not recorded historical sample weights."
        )
    else:
        weight_method = "unavailable"
        weight_note = (
            "AdaBoost.R2 uses weighted resampling. Exact "
            "historical sample weights cannot be recovered "
            "from fitted estimators alone."
        )

    return {
        "task": task,
        "total_train_samples": n_samples,
        "total_estimators": n_rounds,
        "returned_rounds": len(rounds),
        "sample_count": len(sample_metadata),
        "weight_method": weight_method,
        "weight_note": weight_note,
        "plot_features": axes,
        "samples": sample_metadata,
        "rounds": rounds,
    }
