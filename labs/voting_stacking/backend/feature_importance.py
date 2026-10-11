
"""
ModelMind Voting & Stacking
Real held-out permutation feature importance.

Importance is computed as:
    baseline score - score after shuffling a feature

Classification: weighted F1 (higher is better)
Regression: negative RMSE (higher is better)

Negative importances are retained because shuffling
a feature can sometimes improve test performance.
"""

import numpy as np
from sklearn.inspection import permutation_importance


def calculate_feature_importance(
    models,
    X_test,
    y_test,
    task,
    random_state=42,
):
    if task == "classification":
        selected_names = [
            "linear",
            "random_forest",
            "soft_voting",
            "stacking",
        ]
        scoring = "f1_weighted"
        metric_label = "Weighted F1"
    else:
        selected_names = [
            "linear",
            "random_forest",
            "voting",
            "stacking",
        ]
        scoring = "neg_root_mean_squared_error"
        metric_label = "Negative RMSE"

    # Limit work to keep interactive training responsive.
    # Sampling test rows is reproducible.
    if len(X_test) > 200:
        rng = np.random.default_rng(random_state)
        indices = np.sort(
            rng.choice(
                len(X_test),
                size=200,
                replace=False,
            )
        )
        X_evaluation = X_test.iloc[indices]
        y_evaluation = np.asarray(y_test)[indices]
    else:
        X_evaluation = X_test
        y_evaluation = np.asarray(y_test)

    results = {}

    for model_name in selected_names:
        model = models.get(model_name)

        if model is None:
            continue

        importance = permutation_importance(
            estimator=model,
            X=X_evaluation,
            y=y_evaluation,
            scoring=scoring,
            n_repeats=3,
            random_state=random_state,
            n_jobs=1,
        )

        features = []

        for index, feature in enumerate(X_test.columns):
            mean = float(
                importance.importances_mean[index]
            )
            std = float(
                importance.importances_std[index]
            )

            features.append({
                "feature": str(feature),
                "importance_mean": (
                    mean if np.isfinite(mean) else None
                ),
                "importance_std": (
                    std if np.isfinite(std) else None
                ),
                "repetitions": 3,
            })

        features.sort(
            key=lambda item: (
                item["importance_mean"]
                if item["importance_mean"] is not None
                else float("-inf")
            ),
            reverse=True,
        )

        results[model_name] = {
            "model": model_name,
            "metric": metric_label,
            "evaluation_rows": len(X_evaluation),
            "features": features,
        }

    return {
        "method": "held_out_permutation_importance",
        "metric": metric_label,
        "models": results,
        "note": (
            "Importance measures the change in held-out "
            "performance after shuffling one input feature. "
            "It is model-dependent, not a causal effect, "
            "and can be misleading for correlated features. "
            "Negative values are possible."
        ),
    }
