
from __future__ import annotations
import os
import warnings
from typing import Any, Literal

import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sklearn.ensemble import (
    BaggingClassifier,
    BaggingRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.tree import (
    DecisionTreeClassifier,
    DecisionTreeRegressor,
)
try:
    from .runtime_surface_playback import build_surface_playback
except ImportError:
    from runtime_surface_playback import build_surface_playback

app = FastAPI(
    title="ModelMind Bagging Lab API",
    version="1.0.0",
)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

render_frontend_url = os.getenv(
    "BAGGING_FRONTEND_URL", ""
).strip().rstrip("/")

if render_frontend_url:
    allowed_origins.append(render_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TrainRequest(BaseModel):
    task: Literal["classification", "regression"]
    rows: list[dict[str, Any]]
    features: list[str]
    target: str

    missing_strategy: Literal[
        "mean", "median", "most_frequent", "drop"
    ] = "median"

    n_estimators: int = Field(default=30, ge=2, le=300)
    max_depth: int = Field(default=5, ge=1, le=30)

    max_samples: float = Field(default=1.0, gt=0, le=1)
    max_features: float = Field(default=1.0, gt=0, le=1)

    bootstrap: bool = True
    bootstrap_features: bool = False

    test_size: float = Field(default=0.2, ge=0.1, le=0.4)
    random_state: int = 42

    grid_resolution: int = Field(
        default=35, ge=15, le=70
    )


def native(value):
    if isinstance(value, np.generic):
        return value.item()
    return value


def numeric(value):
    result = float(value)
    return result if np.isfinite(result) else None


def metrics(task, actual, predicted):
    if task == "classification":
        precision, recall, f1, _ = (
            precision_recall_fscore_support(
                actual,
                predicted,
                average="weighted",
                zero_division=0,
            )
        )

        labels = np.unique(
            np.concatenate([actual, predicted])
        )

        return {
            "accuracy": numeric(
                accuracy_score(actual, predicted)
            ),
            "precision": numeric(precision),
            "recall": numeric(recall),
            "f1": numeric(f1),
            "confusion_matrix": confusion_matrix(
                actual, predicted, labels=labels
            ).tolist(),
            "class_labels": [
                native(v) for v in labels
            ],
        }

    rmse = np.sqrt(
        mean_squared_error(actual, predicted)
    )

    return {
        "r2": numeric(r2_score(actual, predicted)),
        "mae": numeric(
            mean_absolute_error(actual, predicted)
        ),
        "rmse": numeric(rmse),
    }


def prepare_data(req: TrainRequest):
    if not req.rows:
        raise ValueError("The dataset is empty.")

    if not req.features or len(req.features) > 12:
        raise ValueError("Select 1 to 12 input features.")

    if len(set(req.features)) != len(req.features):
        raise ValueError("Duplicate features are not allowed.")

    if req.target in req.features:
        raise ValueError(
            "The target cannot also be an input feature."
        )

    data = pd.DataFrame(req.rows)
    required = req.features + [req.target]

    missing_columns = [
        name for name in required
        if name not in data.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns: {missing_columns}"
        )

    data = data[required].copy()

    for column in required:
        data[column] = pd.to_numeric(
            data[column], errors="coerce"
        )
        data[column] = data[column].replace(
            [np.inf, -np.inf], np.nan
        )

    data = data.dropna(subset=[req.target])

    if req.missing_strategy == "drop":
        data = data.dropna(subset=req.features)

    if len(data) < 20:
        raise ValueError(
            "At least 20 valid dataset rows are required."
        )

    for feature in req.features:
        if data[feature].notna().sum() == 0:
            raise ValueError(
                f"Feature '{feature}' has no valid values."
            )

    X = data[req.features]
    y = data[req.target]

    if req.task == "classification":
        if y.nunique() < 2:
            raise ValueError(
                "Classification requires at least two classes."
            )

        if y.nunique() > 20:
            raise ValueError(
                "Select a categorical numeric target "
                "with at most 20 distinct classes."
            )

    stratify = None

    if req.task == "classification":
        counts = y.value_counts()
        n_test = int(np.ceil(len(y) * req.test_size))
        n_train = len(y) - n_test

        if (
            counts.min() >= 2
            and n_test >= len(counts)
            and n_train >= len(counts)
        ):
            stratify = y

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=req.test_size,
            random_state=req.random_state,
            stratify=stratify,
        )
    )

    if (
        req.task == "classification"
        and y_train.nunique() < 2
    ):
        raise ValueError(
            "The training split contains fewer than "
            "two classes. Choose another split or dataset."
        )

    return (
        X_train,
        X_test,
        y_train,
        y_test,
        len(data),
    )


def base_tree(req):
    if req.task == "classification":
        return DecisionTreeClassifier(
            max_depth=req.max_depth,
            random_state=req.random_state,
        )

    return DecisionTreeRegressor(
        max_depth=req.max_depth,
        random_state=req.random_state,
    )


def build_models(req):
    strategy = (
        "median"
        if req.missing_strategy == "drop"
        else req.missing_strategy
    )

    single = Pipeline([
        ("imputer", SimpleImputer(strategy=strategy)),
        ("model", base_tree(req)),
    ])

    bagger_type = (
        BaggingClassifier
        if req.task == "classification"
        else BaggingRegressor
    )

    bagger = bagger_type(
        estimator=base_tree(req),
        n_estimators=req.n_estimators,
        max_samples=req.max_samples,
        max_features=req.max_features,
        bootstrap=req.bootstrap,
        bootstrap_features=req.bootstrap_features,
        oob_score=req.bootstrap,
        random_state=req.random_state,
        n_jobs=-1,
    )

    ensemble = Pipeline([
        ("imputer", SimpleImputer(strategy=strategy)),
        ("model", bagger),
    ])

    return single, ensemble


def plot_points(req, X, y, predictions, limit=400):
    points = []

    for index in range(min(len(X), limit)):
        row = X.iloc[index]
        points.append({
            "x": numeric(row.iloc[0])
                 if pd.notna(row.iloc[0]) else None,
            "y": (
                numeric(row.iloc[1])
                if len(req.features) > 1
                and pd.notna(row.iloc[1])
                else None
            ),
            "actual": native(y.iloc[index]),
            "predicted": native(predictions[index]),
        })

    return points


def visualization(
    req, model, X_train, X_test,
    y_train, y_test, predictions,
):
    resolution = req.grid_resolution
    first = req.features[0]

    bounds = {}

    for name in req.features[:2]:
        values = pd.concat([
            X_train[name], X_test[name]
        ]).dropna().to_numpy(dtype=float)

        low, high = np.min(values), np.max(values)
        padding = max((high - low) * 0.1, 0.5)

        bounds[name] = (
            float(low - padding),
            float(high + padding),
        )

    x_values = np.linspace(
        *bounds[first], resolution
    )

    train_medians = (
        X_train.median(numeric_only=True)
        .reindex(req.features)
        .fillna(0.0)
    )

    second = (
        req.features[1]
        if len(req.features) > 1
        else None
    )

    grid = []
    y_values = []

    if second:
        y_values = np.linspace(
            *bounds[second], resolution
        )

        for y_value in y_values:
            for x_value in x_values:
                row = train_medians.to_dict()
                row[first] = float(x_value)
                row[second] = float(y_value)
                grid.append(row)
    else:
        for x_value in x_values:
            row = train_medians.to_dict()
            row[first] = float(x_value)
            grid.append(row)

    grid_frame = pd.DataFrame(grid)[req.features]

    predicted = model.predict(grid_frame)
    values = [native(x) for x in predicted]

    if second:
        z_values = np.asarray(values).reshape(
            resolution, resolution
        ).tolist()
        curve = None
        shape = [resolution, resolution]
    else:
        z_values = None
        curve = values
        shape = [resolution]

    return {
        "type": (
            "decision-surface"
            if req.task == "classification" and second
            else "regression-surface"
            if second
            else "prediction-curve"
        ),
        "x_feature": first,
        "y_feature": second,
        "x_values": x_values.tolist(),
        "y_values": y_values.tolist(),
        "z_values": z_values,
        "predictions": curve,
        "shape": shape,
        "train_points": plot_points(
            req, X_train, y_train,
            model.predict(X_train),
        ),
        "test_points": plot_points(
            req, X_test, y_test, predictions
        ),
        "other_features": {
            name: numeric(train_medians[name])
            for name in req.features[2:]
        },
    }


def build_training_progression(
    req: TrainRequest,
    fitted_bagging,
    X_test,
    y_test,
):
    """
    Build playback checkpoints from actual fitted
    Bagging estimators, not simulated predictions.

    Handles estimators trained on feature subsets.
    """
    imputer = fitted_bagging.named_steps["imputer"]
    bagger = fitted_bagging.named_steps["model"]

    transformed = imputer.transform(X_test)
    estimators = bagger.estimators_
    feature_indices = bagger.estimators_features_

    count = len(estimators)

    checkpoints = sorted(set(
        np.linspace(
            1,
            count,
            min(count, 20),
            dtype=int,
        ).tolist()
    ))

    progression = []

    for stage_count in checkpoints:
        individual = []

        for estimator, features in zip(
            estimators[:stage_count],
            feature_indices[:stage_count],
        ):
            prediction = estimator.predict(
                transformed[:, features]
            )
            individual.append(prediction)

        predictions = np.asarray(individual)

        if req.task == "regression":
            combined = predictions.astype(float).mean(axis=0)

        else:
            labels = np.unique(predictions)

            votes = np.stack([
                np.sum(predictions == label, axis=0)
                for label in labels
            ])

            combined = labels[
                np.argmax(votes, axis=0)
            ]

        progression.append({
            "stage": int(stage_count),
            "total_learners": int(count),
            "metrics": metrics(
                req.task,
                np.asarray(y_test),
                combined,
            ),
            "predictions": [
                native(value)
                for value in combined[:30]
            ],
        })

    return progression

# ============================================================
# MODELMIND BAGGING — FITTED LEARNER DIVERSITY
# ============================================================

def build_learner_diversity(
    req: TrainRequest,
    ensemble_pipeline,
    X_test,
):
    """
    Analyze real fitted Bagging base learners.

    Classification:
      - Pairwise prediction disagreement
      - Individual agreement with final ensemble

    Regression:
      - Pairwise prediction correlation
      - Individual prediction differences

    Uses up to 12 fitted learners for visualization.
    """

    imputer = ensemble_pipeline.named_steps["imputer"]
    bagger = ensemble_pipeline.named_steps["model"]

    transformed = imputer.transform(X_test)
    final_predictions = bagger.predict(transformed)

    total_learners = len(bagger.estimators_)
    inspected_count = min(total_learners, 12)

    selected_estimators = bagger.estimators_[
        :inspected_count
    ]

    selected_features = bagger.estimators_features_[
        :inspected_count
    ]

    predictions = []

    for estimator, feature_indices in zip(
        selected_estimators,
        selected_features,
    ):
        individual = estimator.predict(
            transformed[:, feature_indices]
        )

        predictions.append(np.asarray(individual))

    if not predictions:
        return {
            "total_learners": total_learners,
            "inspected_learners": 0,
            "learners": [],
            "pairwise": [],
            "average_diversity": None,
        }

    pairwise = []
    diversity_values = []

    for i in range(inspected_count):
        for j in range(i + 1, inspected_count):

            first = predictions[i]
            second = predictions[j]

            if req.task == "classification":
                diversity = float(
                    np.mean(first != second)
                )

                pairwise.append({
                    "learner_a": i + 1,
                    "learner_b": j + 1,
                    "disagreement_rate": numeric(
                        diversity
                    ),
                    "correlation": None,
                })

            else:
                first = first.astype(float)
                second = second.astype(float)

                # Normalized average absolute difference.
                scale = float(
                    np.std(final_predictions)
                )

                scale = max(scale, 1e-12)

                diversity = float(
                    np.mean(
                        np.abs(first - second)
                    ) / scale
                )

                if (
                    np.std(first) > 1e-12
                    and np.std(second) > 1e-12
                ):
                    correlation = numeric(
                        np.corrcoef(
                            first,
                            second
                        )[0, 1]
                    )
                else:
                    correlation = None

                pairwise.append({
                    "learner_a": i + 1,
                    "learner_b": j + 1,
                    "disagreement_rate": None,
                    "correlation": correlation,
                    "normalized_difference": numeric(
                        diversity
                    ),
                })

            diversity_values.append(diversity)

    learner_details = []

    for index, individual in enumerate(predictions):

        if req.task == "classification":
            agreement = numeric(
                np.mean(
                    individual == final_predictions
                )
            )

            difference = None

        else:
            agreement = None

            difference = numeric(
                np.mean(
                    np.abs(
                        individual.astype(float)
                        - final_predictions.astype(float)
                    )
                )
            )

        learner_details.append({
            "learner": index + 1,
            "agreement_with_ensemble": agreement,
            "mean_absolute_difference": difference,
            "predictions": [
                native(value)
                for value in individual[:50]
            ],
        })

    return {
        "task": req.task,
        "total_learners": total_learners,
        "inspected_learners": inspected_count,
        "test_rows": len(X_test),
        "learners": learner_details,
        "pairwise": pairwise,
        "average_diversity": (
            numeric(np.mean(diversity_values))
            if diversity_values else None
        ),
        "diversity_metric": (
            "classification_disagreement_rate"
            if req.task == "classification"
            else "normalized_mean_absolute_difference"
        ),
        "ensemble_predictions": [
            native(value)
            for value in final_predictions[:50]
        ],
    }


@app.get("/")
def root():
    return {
        "application": "ModelMind Bagging Lab",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "ok", "port": 8003}


@app.get("/api/bagging/models")
def available_models():
    return {
        "tasks": ["classification", "regression"],
        "models": [
            "Decision Tree",
            "Bagging Classifier",
            "Bagging Regressor",
        ],
        "features": [
            "bootstrap_sampling",
            "out_of_bag_evaluation",
            "single_vs_bagging",
            "learner_diversity",
            "2d_prediction_grids",
            "3d_prediction_surfaces",
        ],
    }


@app.post("/api/bagging/train")
def train_bagging(req: TrainRequest):
    try:
        (
            X_train, X_test,
            y_train, y_test, valid_rows
        ) = prepare_data(req)

        single, ensemble = build_models(req)

        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always")

            single.fit(X_train, y_train)
            ensemble.fit(X_train, y_train)

        single_train = single.predict(X_train)
        single_test = single.predict(X_test)

        bagging_train = ensemble.predict(X_train)
        bagging_test = ensemble.predict(X_test)
        

        fitted = ensemble.named_steps["model"]
        learner_diversity = build_learner_diversity(
    req,
    ensemble,
    X_test,
)
        training_progression = build_training_progression(
    req,
    ensemble,
    X_test,
    y_test,
)

        # Actual bootstrap indices created by sklearn.
        bootstrap_previews = []

        for i, indices in enumerate(
            fitted.estimators_samples_[:10]
        ):
            indices = np.asarray(indices)

            bootstrap_previews.append({
                "learner": i + 1,
                "sample_indices": indices[:100].tolist(),
                "sample_count": int(len(indices)),
                "unique_count": int(
                    len(np.unique(indices))
                ),
                "oob_count": int(
                    len(X_train) - len(np.unique(indices))
                ),
            })

        comparison = {
            "test_rows": int(len(y_test)),
        }

        if req.task == "classification":
            same = single_test == bagging_test
            comparison.update({
                "agreement_rate": numeric(np.mean(same)),
                "disagreement_rate": numeric(np.mean(~same)),
                "ensemble_only_correct": int(np.sum(
                    (bagging_test == y_test.to_numpy())
                    & (single_test != y_test.to_numpy())
                )),
                "single_only_correct": int(np.sum(
                    (single_test == y_test.to_numpy())
                    & (bagging_test != y_test.to_numpy())
                )),
            })
        else:
            single_error = np.abs(
                single_test - y_test.to_numpy()
            )
            ensemble_error = np.abs(
                bagging_test - y_test.to_numpy()
            )

            comparison.update({
                "ensemble_better_rows": int(
                    np.sum(ensemble_error < single_error)
                ),
                "single_better_rows": int(
                    np.sum(single_error < ensemble_error)
                ),
                "mean_prediction_difference": numeric(
                    np.mean(np.abs(
                        bagging_test - single_test
                    ))
                ),
            })
                # Real prediction grids for both fitted models.
        single_visualization = visualization(
            req,
            single,
            X_train,
            X_test,
            y_train,
            y_test,
            single_test,
        )

        bagging_visualization = visualization(
            req,
            ensemble,
            X_train,
            X_test,
            y_train,
            y_test,
            bagging_test,
        )

        # Generate prediction surfaces for Replay checkpoints.
        surface_playback = build_surface_playback(
            ensemble_pipeline=ensemble,
            X_train=X_train,
            visualization=bagging_visualization,
            training_progression=training_progression,
            task=req.task,
        )

        return {
            "success": True,
            "task": req.task,
            
            "dataset": {
                "total_rows": len(req.rows),
                "valid_rows": valid_rows,
                "train_rows": len(X_train),
                "test_rows": len(X_test),
                "features": req.features,
                "target": req.target,
            },
            "parameters": req.model_dump(
                exclude={"rows"}
            ),
            "single_model": {
                "name": "Single Decision Tree",
                "train_metrics": metrics(
                    req.task, y_train, single_train
                ),
                "test_metrics": metrics(
                    req.task, y_test, single_test
                ),
                "visualization": single_visualization,
            },
            "bagging_model": {
                "name": (
                    "Bagging Classifier"
                    if req.task == "classification"
                    else "Bagging Regressor"
                ),
                "train_metrics": metrics(
                    req.task, y_train, bagging_train
                ),
                "test_metrics": metrics(
                    req.task, y_test, bagging_test
                ),
                "oob_score": (
                    numeric(fitted.oob_score_)
                    if req.bootstrap
                    else None
                ),
                "visualization": bagging_visualization,
            },
            "bootstrap_previews": bootstrap_previews,
            "training_progression": training_progression,
            "surface_playback": surface_playback,
            "prediction_comparison": comparison,
            "learner_diversity": learner_diversity,
            "warnings": list(dict.fromkeys(
                str(item.message) for item in caught
            )),
        }

    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
