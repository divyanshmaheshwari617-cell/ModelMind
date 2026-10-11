
import json
import math
import sys

import numpy as np
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def create_dataset(task, count=120):
    rows = []

    for i in range(count):
        x = ((i * 37) % 127) / 13 - 4.5
        y = ((i * 53 + 11) % 131) / 13 - 4.5

        if task == "classification":
            target = int(x * x + y * y > 13)
        else:
            target = (
                2.5 * x
                + 0.8 * y * y
                + math.sin(x)
            )

        rows.append({
            "feature_1": x,
            "feature_2": y,
            "target": target,
        })

    return rows


def test_training(task):
    print(f"\nTesting {task.upper()}...")

    payload = {
        "task": task,
        "rows": create_dataset(task),
        "features": ["feature_1", "feature_2"],
        "target": "target",
        "test_size": 0.25,
        "knn_neighbors": 3,
        "forest_estimators": 10,
        "max_depth": 4,
        "stacking_cv": 3,
        "stacking_passthrough": False,
        "voting_weights": [1, 2, 1],
        "missing_strategy": "median",
        "grid_resolution": 15,
        "random_state": 42,
    }

    response = client.post(
        "/api/voting-stacking/train",
        json=payload,
    )

    if response.status_code != 200:
        print(
            "Training failed:",
            response.status_code,
            response.text[:3000],
        )
        sys.exit(1)

    result = response.json()

    assert result["success"] is True
    assert result["task"] == task

    required_models = (
        [
            "linear",
            "knn",
            "random_forest",
            "hard_voting",
            "soft_voting",
            "stacking",
        ]
        if task == "classification"
        else [
            "linear",
            "knn",
            "random_forest",
            "voting",
            "stacking",
        ]
    )

    for name in required_models:
        assert name in result["models"]

        model = result["models"][name]

        assert "train" in model["metrics"]
        assert "test" in model["metrics"]

        surface = model["visualization"]
        assert surface is not None

        assert len(surface["x_values"]) == 15
        assert len(surface["y_values"]) == 15
        assert len(surface["z_values"]) == 15
        assert len(surface["z_values"][0]) == 15

        if task == "classification":
            assert (
                model["metrics"]["test"]["accuracy"]
                is not None
            )
        else:
            assert (
                model["metrics"]["test"]["rmse"]
                is not None
            )

        print(
            f"PASS: {name} "
            f"metrics and prediction surface"
        )

    explanation = result["ensemble_explanation"]

    assert explanation["observations"]
    assert explanation["meta_feature_count"] > 0

    for observation in explanation["observations"]:
        assert "base_predictions" in observation
        assert "stacking_prediction" in observation
        assert "stacking_meta_features" in observation

    print("PASS: Ensemble prediction explanations")

    importance = result["feature_importance"]
    assert importance["models"]

    for model_name, model in importance["models"].items():
        assert len(model["features"]) == 2

        for feature in model["features"]:
            assert "importance_mean" in feature
            assert "importance_std" in feature

        print(f"PASS: {model_name} permutation importance")

    print(f"\n{task.upper()} PASSED")
    print(
        "Stacking test metrics:",
        json.dumps(
            result["models"]["stacking"]["metrics"]["test"],
            indent=2,
        ),
    )


def main():
    health = client.get("/health")
    assert health.status_code == 200
    print("PASS: Health endpoint")

    models = client.get("/api/voting-stacking/models")
    assert models.status_code == 200
    print("PASS: Available models endpoint")

    test_training("classification")
    test_training("regression")

    print("\nALL BACKEND TESTS PASSED")


if __name__ == "__main__":
    main()
