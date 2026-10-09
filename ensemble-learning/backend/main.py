
from __future__ import annotations

from typing import Any, Literal
import math

import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sklearn.ensemble import (
    AdaBoostClassifier,
    AdaBoostRegressor,
    BaggingClassifier,
    BaggingRegressor,
    GradientBoostingClassifier,
    GradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
    StackingClassifier,
    StackingRegressor,
    VotingClassifier,
    VotingRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import (
    DecisionTreeClassifier,
    DecisionTreeRegressor,
)
from sklearn.neighbors import (
    KNeighborsClassifier,
    KNeighborsRegressor,
)


app = FastAPI(
    title="ModelMind Ensemble Learning API",
    version="1.0.0",
    description=(
        "Real ensemble model training, evaluation, "
        "and visualization data."
    ),
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://modelmind-ensemble-web.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


ModelName = Literal[
    "bagging",
    "random-forest",
    "adaboost",
    "gradient-boosting",
    "voting",
    "stacking",
]

TaskName = Literal["classification", "regression"]

MissingStrategy = Literal[
    "mean",
    "median",
    "most_frequent",
    "drop",
]


class TrainingRequest(BaseModel):
    rows: list[dict[str, Any]]
    features: list[str]
    target: str

    task: TaskName = "classification"
    model: ModelName = "random-forest"

    n_estimators: int = Field(
        default=50, ge=5, le=200
    )
    max_depth: int = Field(
        default=5, ge=1, le=20
    )
    learning_rate: float = Field(
        default=0.1, gt=0, le=1
    )
    test_size: float = Field(
        default=0.2, ge=0.1, le=0.4
    )
    random_state: int = 42

    missing_strategy: MissingStrategy = "median"

    # Two selected features control the plot axes.
    # Other features are fixed at training-set medians.
    x_feature: str | None = None
    y_feature: str | None = None

    grid_resolution: int = Field(
        default=35, ge=15, le=55
    )


def finite_number(value: Any) -> float | None:
    if value is None:
        return None

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    if not math.isfinite(number):
        return None

    return number


def safe_float(value: Any) -> float | None:
    number = finite_number(value)
    return None if number is None else float(number)


def to_python_number(value: Any) -> int | float:
    number = float(value)

    if not math.isfinite(number):
        raise ValueError("Non-finite numeric result.")

    if number.is_integer():
        return int(number)

    return number


def make_estimator(request: TrainingRequest):
    task = request.task
    model = request.model

    n = request.n_estimators
    depth = request.max_depth
    rate = request.learning_rate
    seed = request.random_state

    if task == "classification":
        def tree():
            return DecisionTreeClassifier(
                max_depth=depth,
                random_state=seed,
            )

        if model == "bagging":
            return BaggingClassifier(
                estimator=tree(),
                n_estimators=n,
                random_state=seed,
                n_jobs=-1,
            )

        if model == "random-forest":
            return RandomForestClassifier(
                n_estimators=n,
                max_depth=depth,
                random_state=seed,
                n_jobs=-1,
            )

        if model == "adaboost":
            return AdaBoostClassifier(
                estimator=DecisionTreeClassifier(
                    max_depth=min(depth, 3),
                    random_state=seed,
                ),
                n_estimators=n,
                learning_rate=rate,
                random_state=seed,
            )

        if model == "gradient-boosting":
            return GradientBoostingClassifier(
                n_estimators=n,
                max_depth=depth,
                learning_rate=rate,
                random_state=seed,
            )

        estimators = [
            ("tree", tree()),
            (
                "forest",
                RandomForestClassifier(
                    n_estimators=40,
                    max_depth=depth,
                    random_state=seed,
                    n_jobs=-1,
                ),
            ),
            (
                "knn",
                KNeighborsClassifier(n_neighbors=5),
            ),
        ]

        if model == "voting":
            return VotingClassifier(
                estimators=estimators,
                voting="soft",
            )

        return StackingClassifier(
            estimators=estimators,
            final_estimator=LogisticRegression(
                max_iter=1000
            ),
            cv=3,
            n_jobs=-1,
        )

    def reg_tree():
        return DecisionTreeRegressor(
            max_depth=depth,
            random_state=seed,
        )

    if model == "bagging":
        return BaggingRegressor(
            estimator=reg_tree(),
            n_estimators=n,
            random_state=seed,
            n_jobs=-1,
        )

    if model == "random-forest":
        return RandomForestRegressor(
            n_estimators=n,
            max_depth=depth,
            random_state=seed,
            n_jobs=-1,
        )

    if model == "adaboost":
        return AdaBoostRegressor(
            estimator=DecisionTreeRegressor(
                max_depth=min(depth, 4),
                random_state=seed,
            ),
            n_estimators=n,
            learning_rate=rate,
            random_state=seed,
        )

    if model == "gradient-boosting":
        return GradientBoostingRegressor(
            n_estimators=n,
            max_depth=depth,
            learning_rate=rate,
            random_state=seed,
        )

    estimators = [
        ("tree", reg_tree()),
        (
            "forest",
            RandomForestRegressor(
                n_estimators=40,
                max_depth=depth,
                random_state=seed,
                n_jobs=-1,
            ),
        ),
        (
            "knn",
            KNeighborsRegressor(n_neighbors=5),
        ),
    ]

    if model == "voting":
        return VotingRegressor(
            estimators=estimators,
        )

    return StackingRegressor(
        estimators=estimators,
        final_estimator=Ridge(),
        cv=3,
        n_jobs=-1,
    )


def build_pipeline(request: TrainingRequest):
    if request.missing_strategy == "drop":
        strategy = "median"
    else:
        strategy = request.missing_strategy

    return Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy=strategy),
            ),
            (
                "scaler",
                StandardScaler(),
            ),
            (
                "model",
                make_estimator(request),
            ),
        ]
    )


def prepare_data(request: TrainingRequest):
    if len(request.rows) < 20:
        raise ValueError(
            "At least 20 dataset rows are required."
        )

    if not request.features:
        raise ValueError(
            "Select at least one input feature."
        )

    if len(request.features) > 8:
        raise ValueError(
            "A maximum of 8 input features is supported."
        )

    if len(set(request.features)) != len(request.features):
        raise ValueError(
            "Input feature names must be unique."
        )

    if request.target in request.features:
        raise ValueError(
            "The target cannot also be an input feature."
        )

    frame = pd.DataFrame(request.rows)

    required = request.features + [request.target]

    missing = [
        column
        for column in required
        if column not in frame.columns
    ]

    if missing:
        raise ValueError(
            f"Missing dataset columns: {missing}"
        )

    numeric = frame[required].copy()

    for column in required:
        numeric[column] = pd.to_numeric(
            numeric[column],
            errors="coerce",
        )

    numeric = numeric.replace(
        [np.inf, -np.inf],
        np.nan,
    )

    # A missing target cannot be imputed safely here.
    numeric = numeric.dropna(
        subset=[request.target]
    )

    if request.missing_strategy == "drop":
        numeric = numeric.dropna(
            subset=request.features
        )

    if len(numeric) < 20:
        raise ValueError(
            "At least 20 valid rows must remain after cleaning."
        )

    for feature in request.features:
        if numeric[feature].notna().sum() == 0:
            raise ValueError(
                f"Feature '{feature}' contains no valid numbers."
            )

    X = numeric[request.features]
    y = numeric[request.target]

    if request.task == "classification":
        unique = np.unique(y.to_numpy())

        if len(unique) < 2:
            raise ValueError(
                "Classification requires at least 2 classes."
            )

        if len(unique) > 30:
            raise ValueError(
                "Classification supports up to 30 classes."
            )

        # A stratified split requires enough members of
        # every class in both training and test sets.
        class_counts = y.value_counts()

        if class_counts.min() < 3:
            raise ValueError(
                "Every class needs at least 3 valid rows."
            )

        number_of_classes = len(unique)
        test_count = math.ceil(
            len(y) * request.test_size
        )
        train_count = len(y) - test_count

        if (
            test_count < number_of_classes
            or train_count < number_of_classes
        ):
            raise ValueError(
                "The train/test split is too small "
                "for the number of classes."
            )

        stratify = y

    else:
        if y.nunique() < 2:
            raise ValueError(
                "Regression targets must have "
                "at least two distinct values."
            )

        stratify = None

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=request.test_size,
            random_state=request.random_state,
            stratify=stratify,
        )
    )

    if request.model == "stacking" and (
        request.task == "classification"
    ):
        if y_train.value_counts().min() < 3:
            raise ValueError(
                "Stacking requires at least 3 training "
                "examples per class for cross-validation."
            )

    if request.model in ["voting", "stacking"]:
        if len(X_train) < 8:
            raise ValueError(
                "Voting and stacking require "
                "more training examples."
            )

    return (
        X_train,
        X_test,
        y_train,
        y_test,
        numeric,
    )


def calculate_metrics(
    request: TrainingRequest,
    y_true,
    y_pred,
):
    if request.task == "classification":
        labels = sorted(
            set(y_true.tolist()) |
            set(np.asarray(y_pred).tolist())
        )

        return {
            "accuracy": safe_float(
                accuracy_score(y_true, y_pred)
            ),
            "precision": safe_float(
                precision_score(
                    y_true,
                    y_pred,
                    average="weighted",
                    zero_division=0,
                )
            ),
            "recall": safe_float(
                recall_score(
                    y_true,
                    y_pred,
                    average="weighted",
                    zero_division=0,
                )
            ),
            "f1": safe_float(
                f1_score(
                    y_true,
                    y_pred,
                    average="weighted",
                    zero_division=0,
                )
            ),
            "confusion_matrix": confusion_matrix(
                y_true,
                y_pred,
                labels=labels,
            ).tolist(),
            "class_labels": [
                to_python_number(label)
                for label in labels
            ],
        }

    return {
        "r2": safe_float(
            r2_score(y_true, y_pred)
        ),
        "mae": safe_float(
            mean_absolute_error(y_true, y_pred)
        ),
        "rmse": safe_float(
            math.sqrt(
                mean_squared_error(y_true, y_pred)
            )
        ),
    }


def make_visualization(
    request: TrainingRequest,
    pipeline,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train,
    y_test,
    predictions,
):
    x_name = request.x_feature or request.features[0]

    if x_name not in request.features:
        raise ValueError(
            "The X-axis must be a selected input feature."
        )

    y_name = request.y_feature

    if y_name is not None:
        if y_name not in request.features:
            raise ValueError(
                "The Y-axis must be a selected input feature."
            )

        if y_name == x_name:
            raise ValueError(
                "The X and Y axes must use different features."
            )

    # If two features exist, choose the second by default.
    if (
        y_name is None
        and len(request.features) >= 2
    ):
        y_name = next(
            feature
            for feature in request.features
            if feature != x_name
        )

    resolution = request.grid_resolution

    # Only the training set is used to define
    # representative values for other features.
    reference = X_train.median().fillna(0)

    def axis_values(feature: str):
        series = X_train[feature].dropna()

        low = float(series.min())
        high = float(series.max())

        padding = max(
            (high - low) * 0.08,
            0.001,
        )

        return np.linspace(
            low - padding,
            high + padding,
            resolution,
        )

    x_values = axis_values(x_name)

    if y_name is None:
        grid = pd.DataFrame(
            [
                reference.to_dict()
                for _ in range(resolution)
            ],
            columns=request.features,
        )

        grid[x_name] = x_values

        surface_predictions = pipeline.predict(grid)

        return {
            "type": "curve",
            "x_feature": x_name,
            "y_feature": None,
            "x_values": x_values.tolist(),
            "y_values": [],
            "predictions": [
                to_python_number(value)
                for value in surface_predictions
            ],
            "shape": [resolution],
            "train_points": make_points(
                X_train, y_train, None,
                x_name, None
            ),
            "test_points": make_points(
                X_test, y_test,
                predictions, x_name, None
            ),
        }

    y_values = axis_values(y_name)

    xx, yy = np.meshgrid(
        x_values,
        y_values,
    )

    grid_size = xx.size

    grid = pd.DataFrame(
        [
            reference.to_dict()
            for _ in range(grid_size)
        ],
        columns=request.features,
    )

    grid[x_name] = xx.ravel()
    grid[y_name] = yy.ravel()

    surface_predictions = pipeline.predict(grid)

    z_values = np.asarray(
        surface_predictions,
        dtype=float,
    ).reshape(
        resolution,
        resolution,
    )

    return {
        "type": (
            "decision-surface"
            if request.task == "classification"
            else "regression-surface"
        ),
        "x_feature": x_name,
        "y_feature": y_name,
        "x_values": x_values.tolist(),
        "y_values": y_values.tolist(),
        "z_values": z_values.tolist(),
        "shape": [resolution, resolution],
        "train_points": make_points(
            X_train,
            y_train,
            None,
            x_name,
            y_name,
        ),
        "test_points": make_points(
            X_test,
            y_test,
            predictions,
            x_name,
            y_name,
        ),
        "other_feature_values": {
            feature: safe_float(reference[feature])
            for feature in request.features
            if feature not in [x_name, y_name]
        },
    }


def make_points(
    X: pd.DataFrame,
    y,
    predictions,
    x_name: str,
    y_name: str | None,
):
    output = []

    X_reset = X.reset_index(drop=True)
    y_reset = np.asarray(y)

    if predictions is not None:
        predicted = np.asarray(predictions)
    else:
        predicted = None

    for index in range(len(X_reset)):
        point = {
            "x": safe_float(
                X_reset.iloc[index][x_name]
            ),
            "actual": safe_float(
                y_reset[index]
            ),
        }

        if y_name is not None:
            point["y"] = safe_float(
                X_reset.iloc[index][y_name]
            )

        if predicted is not None:
            point["predicted"] = safe_float(
                predicted[index]
            )

        output.append(point)

    return output


def generate_training_progression(
    request: TrainingRequest,
    pipeline,
    X_test: pd.DataFrame,
    y_test,
):
    """
    Generate checkpoints from fitted ensemble learners.

    - AdaBoost / Gradient Boosting:
      Exact staged predictions from scikit-learn.
    - Bagging / Random Forest:
      Cumulative individual-learner predictions.
      Intermediate classification snapshots use
      majority voting as an educational preview.
    - Voting / Stacking:
      Final-model checkpoint only, because their
      fitted estimators are not sequential stages.
    """

    model = pipeline.named_steps["model"]
    transformed = pipeline[:-1].transform(X_test)

    actual = np.asarray(y_test)
    max_checkpoints = 12
    preview_limit = 50

    def checkpoint_numbers(total: int) -> list[int]:
        if total <= 0:
            return []

        count = min(total, max_checkpoints)

        numbers = np.geomspace(
            1,
            total,
            num=count,
        )

        checkpoints = sorted({
            int(round(number))
            for number in numbers
        })

        return sorted(set(
            [1, *checkpoints, total]
        ))

    def make_stage(
        index: int,
        predictions,
        exact: bool,
    ):
        values = np.asarray(predictions)

        metrics = calculate_metrics(
            request,
            y_test,
            values,
        )

        return {
            "stage": index,
            "metrics": metrics,
            "is_exact_model_stage": exact,
            "prediction_preview": [
                {
                    "actual": to_python_number(a),
                    "predicted": to_python_number(p),
                }
                for a, p in zip(
                    actual[:preview_limit],
                    values[:preview_limit],
                )
            ],
        }

    stages = []

    # --------------------------------------
    # Sequential boosting algorithms
    # --------------------------------------

    if request.model in [
        "adaboost",
        "gradient-boosting",
    ]:
        if not hasattr(model, "staged_predict"):
            raise ValueError(
                "This scikit-learn version does not "
                "support staged predictions for "
                f"{request.model}."
            )

        total = len(model.estimators_)
        checkpoints = set(
            checkpoint_numbers(total)
        )

        for stage_index, prediction in enumerate(
            model.staged_predict(transformed),
            start=1,
        ):
            if stage_index in checkpoints:
                stages.append(
                    make_stage(
                        stage_index,
                        prediction,
                        exact=True,
                    )
                )

        if not stages:
            raise ValueError(
                "No boosting stages were produced."
            )

        # The final checkpoint must represent the
        # exact fitted model's final prediction.
        stages[-1] = make_stage(
            total,
            model.predict(transformed),
            exact=True,
        )

        return {
            "algorithm": request.model,
            "progression_type": "boosting-stages",
            "total_stages": total,
            "stages": stages,
            "description": (
                "Exact sequential boosting predictions "
                "at selected fitted training stages."
            ),
        }

    # --------------------------------------
    # Bagging and Random Forest
    # --------------------------------------

    if request.model in [
        "bagging",
        "random-forest",
    ]:
        estimators = model.estimators_
        total = len(estimators)

        checkpoints = set(
            checkpoint_numbers(total)
        )

        individual_predictions = []

        for index, estimator in enumerate(
            estimators,
            start=1,
        ):
            if request.model == "bagging":
                # Bagging may give each estimator
                # a subset of the input features.
                feature_indices = (
                    model.estimators_features_[index - 1]
                )

                estimator_input = transformed[
                    :, feature_indices
                ]
            else:
                estimator_input = transformed

            prediction = np.asarray(
                estimator.predict(estimator_input)
            )

            individual_predictions.append(prediction)

            if index not in checkpoints:
                continue

            combined = np.stack(
                individual_predictions,
                axis=0,
            )

            if request.task == "regression":
                cumulative_prediction = np.mean(
                    combined,
                    axis=0,
                )
                exact = True
            else:
                # Intermediate classification uses
                # a transparent majority-vote view.
                # The full sklearn ensemble can use
                # probability aggregation instead.
                labels = np.asarray(model.classes_)

                counts = np.stack(
                    [
                        np.sum(
                            combined == label,
                            axis=0,
                        )
                        for label in labels
                    ],
                    axis=0,
                )

                cumulative_prediction = labels[
                    np.argmax(counts, axis=0)
                ]

                exact = False

            if index == total:
                cumulative_prediction = (
                    model.predict(transformed)
                )
                exact = True

            stages.append(
                make_stage(
                    index,
                    cumulative_prediction,
                    exact=exact,
                )
            )

        return {
            "algorithm": request.model,
            "progression_type": "cumulative-learners",
            "total_stages": total,
            "stages": stages,
            "description": (
                "Predictions from progressively more "
                "fitted learners. Intermediate "
                "classification checkpoints use "
                "majority voting; the final "
                "checkpoint uses the exact model."
            ),
        }

    # --------------------------------------
    # Voting / Stacking
    # --------------------------------------

    # These are combination architectures,
    # not boosting-style sequential stages.
    final_prediction = model.predict(transformed)

    return {
        "algorithm": request.model,
        "progression_type": "final-model",
        "total_stages": 1,
        "stages": [
            make_stage(
                1,
                final_prediction,
                exact=True,
            )
        ],
        "description": (
            "Voting and stacking are represented "
            "by their fitted final prediction. "
            "Base-learner breakdowns will be "
            "implemented separately."
        ),
    }

def attach_stage_visualizations(
    request: TrainingRequest,
    pipeline,
    X_train: pd.DataFrame,
    visualization: dict,
    progression: dict,
):
    """
    Add real spatial predictions to training checkpoints.

    Uses the already fitted pipeline and ensemble.
    Preserves the existing metrics and prediction previews.

    Each checkpoint receives a 'visualization' object:
      - predictions: 1D prediction curve
      - z_values: 2D spatial prediction grid

    For bagging / random forest classification,
    intermediate grids use the same majority-vote
    aggregation as the existing checkpoint metrics.
    """

    stages = progression.get("stages", [])
    if not stages:
        return progression

    x_name = visualization["x_feature"]
    y_name = visualization.get("y_feature")
    x_values = np.asarray(
        visualization["x_values"],
        dtype=float,
    )
    y_values = np.asarray(
        visualization.get("y_values", []),
        dtype=float,
    )

    if len(x_values) == 0:
        return progression

    # Keep remaining input features at representative
    # values from the training dataset.
    reference = X_train.median().fillna(0)

    two_features = (
        y_name is not None
        and len(y_values) > 0
    )

    if two_features:
        xx, yy = np.meshgrid(x_values, y_values)

        grid = pd.DataFrame(
            np.tile(
                reference.to_numpy(dtype=float),
                (xx.size, 1),
            ),
            columns=request.features,
        )

        grid[x_name] = xx.ravel()
        grid[y_name] = yy.ravel()

        shape = (len(y_values), len(x_values))
    else:
        grid = pd.DataFrame(
            np.tile(
                reference.to_numpy(dtype=float),
                (len(x_values), 1),
            ),
            columns=request.features,
        )

        grid[x_name] = x_values
        shape = (len(x_values),)

    transformed = pipeline[:-1].transform(grid)
    fitted_model = pipeline.named_steps["model"]

    checkpoint_numbers = {
        stage["stage"] for stage in stages
    }

    stage_predictions = {}

    # --------------------------------------------------
    # 1. Sequential boosting
    # --------------------------------------------------

    if request.model in ("adaboost", "gradient-boosting"):
        for index, prediction in enumerate(
            fitted_model.staged_predict(transformed),
            start=1,
        ):
            if index in checkpoint_numbers:
                stage_predictions[index] = np.asarray(
                    prediction
                ).copy()

    # --------------------------------------------------
    # 2. Cumulative bagging / random forest learners
    # --------------------------------------------------

    elif request.model in ("bagging", "random-forest"):
        estimators = fitted_model.estimators_
        total = len(estimators)

        if request.task == "regression":
            running_sum = np.zeros(
                len(grid),
                dtype=float,
            )
        else:
            labels = np.asarray(
                fitted_model.classes_
            )

            vote_counts = np.zeros(
                (len(labels), len(grid)),
                dtype=np.int32,
            )

        for index, estimator in enumerate(
            estimators,
            start=1,
        ):
            if request.model == "bagging":
                indices = fitted_model.estimators_features_[
                    index - 1
                ]
                estimator_input = transformed[:, indices]
            else:
                estimator_input = transformed

            prediction = np.asarray(
                estimator.predict(estimator_input)
            )

            if request.task == "regression":
                running_sum += prediction.astype(float)
            else:
                for class_index, label in enumerate(labels):
                    vote_counts[class_index] += (
                        prediction == label
                    )

            if index not in checkpoint_numbers:
                continue

            if index == total:
                # Always use the exact final sklearn
                # prediction at the last checkpoint.
                combined = fitted_model.predict(
                    transformed
                )
            elif request.task == "regression":
                combined = running_sum / index
            else:
                # Matches the intermediate majority
                # voting used for stage metrics.
                combined = labels[
                    np.argmax(vote_counts, axis=0)
                ]

            stage_predictions[index] = np.asarray(
                combined
            ).copy()

    # --------------------------------------------------
    # 3. Voting / stacking final fitted prediction
    # --------------------------------------------------

    else:
        final_prediction = np.asarray(
            fitted_model.predict(transformed)
        )

        for index in checkpoint_numbers:
            stage_predictions[index] = final_prediction.copy()

    # --------------------------------------------------
    # 4. Attach spatial predictions to each checkpoint
    # --------------------------------------------------

    for stage in stages:
        stage_number = stage["stage"]

        prediction = stage_predictions.get(
            stage_number
        )

        if prediction is None:
            raise ValueError(
                "Missing visualization predictions for "
                f"checkpoint {stage_number}."
            )

        values = np.asarray(
            prediction,
            dtype=float,
        ).reshape(shape)

        if not np.isfinite(values).all():
            raise ValueError(
                "Non-finite checkpoint predictions."
            )

        if two_features:
            stage["visualization"] = {
                "type": visualization["type"],
                "x_feature": x_name,
                "y_feature": y_name,
                "x_values": x_values.tolist(),
                "y_values": y_values.tolist(),
                "z_values": values.tolist(),
                "shape": list(shape),
            }
        else:
            stage["visualization"] = {
                "type": "curve",
                "x_feature": x_name,
                "y_feature": None,
                "x_values": x_values.tolist(),
                "y_values": [],
                "predictions": values.ravel().tolist(),
                "shape": list(shape),
            }

    return progression

@app.get("/")
def root():
    return {
        "service": "ModelMind Ensemble Learning API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ensemble-learning",
    }


@app.get("/api/ensemble/models")
def available_models():
    return {
        "models": [
            "bagging",
            "random-forest",
            "adaboost",
            "gradient-boosting",
            "voting",
            "stacking",
        ],
        "tasks": [
            "classification",
            "regression",
        ],
    }


@app.post("/api/ensemble/train")
def train_ensemble(request: TrainingRequest):
    try:
        (
            X_train,
            X_test,
            y_train,
            y_test,
            cleaned,
        ) = prepare_data(request)

        pipeline = build_pipeline(request)

        pipeline.fit(
            X_train,
            y_train,
        )

        train_predictions = pipeline.predict(X_train)
        test_predictions = pipeline.predict(X_test)
        
        training_progression = generate_training_progression(
            request,
            pipeline,
            X_test,
            y_test,
        )


        train_metrics = calculate_metrics(
            request,
            y_train,
            train_predictions,
        )

        test_metrics = calculate_metrics(
            request,
            y_test,
            test_predictions,
        )

        visualization = make_visualization(
            request,
            pipeline,
            X_train,
            X_test,
            y_train,
            y_test,
            test_predictions,
        )
        
        training_progression = attach_stage_visualizations(
            request,
            pipeline,
            X_train,
            visualization,
            training_progression,
        )


        fitted_model = pipeline.named_steps["model"]

        feature_importances = None

        if hasattr(fitted_model, "feature_importances_"):
            values = fitted_model.feature_importances_

            feature_importances = [
                {
                    "feature": feature,
                    "importance": safe_float(importance),
                }
                for feature, importance in zip(
                    request.features,
                    values,
                )
            ]

        return {
            "success": True,
            "training_progression": training_progression,
            "task": request.task,
            "model": request.model,
            "dataset": {
                "total_rows": len(request.rows),
                "valid_rows": len(cleaned),
                "train_rows": len(X_train),
                "test_rows": len(X_test),
                "features": request.features,
                "target": request.target,
            },
            "parameters": {
                "n_estimators": request.n_estimators,
                "max_depth": request.max_depth,
                "learning_rate": request.learning_rate,
                "test_size": request.test_size,
                "random_state": request.random_state,
                "missing_strategy": request.missing_strategy,
            },
            "metrics": {
                "train": train_metrics,
                "test": test_metrics,
            },
            "feature_importances": feature_importances,
            "visualization": visualization,
            "predictions": [
                {
                    "actual": to_python_number(actual),
                    "predicted": to_python_number(predicted),
                }
                for actual, predicted in zip(
                    y_test,
                    test_predictions,
                )
            ],
        }

    except HTTPException:
        raise

    except (
        ValueError,
        TypeError,
        KeyError,
    ) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

# ============================================================
# MODELMIND ENSEMBLE OVERVIEW — MODEL COMPARISON API
# ============================================================

class OverviewCompareRequest(TrainingRequest):
    """
    Reuses the existing dataset and preprocessing settings.

    The overview comparison always uses:
    - Decision Tree as the single model
    - Random Forest as the ensemble

    The inherited 'model' field is ignored here because
    this experiment intentionally compares fixed model types.
    """
    pass


def build_overview_single_model(
    request: OverviewCompareRequest,
):
    """
    Training-only preprocessing followed by one decision tree.
    Matches the preprocessing used by the ensemble pipeline.
    """

    strategy = (
        "median"
        if request.missing_strategy == "drop"
        else request.missing_strategy
    )

    if request.task == "classification":
        estimator = DecisionTreeClassifier(
            max_depth=request.max_depth,
            random_state=request.random_state,
        )
    else:
        estimator = DecisionTreeRegressor(
            max_depth=request.max_depth,
            random_state=request.random_state,
        )

    return Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy=strategy),
            ),
            (
                "scaler",
                StandardScaler(),
            ),
            (
                "model",
                estimator,
            ),
        ]
    )


def overview_prediction_comparison(
    request: OverviewCompareRequest,
    y_test,
    single_predictions,
    ensemble_predictions,
):
    """
    Describe agreement and disagreement on held-out rows.
    """

    actual = np.asarray(y_test)
    single = np.asarray(single_predictions)
    ensemble = np.asarray(ensemble_predictions)

    examples = []

    for index in range(min(len(actual), 60)):
        examples.append(
            {
                "actual": to_python_number(actual[index]),
                "single": to_python_number(single[index]),
                "ensemble": to_python_number(ensemble[index]),
            }
        )

    if request.task == "classification":
        agrees = single == ensemble

        single_correct = single == actual
        ensemble_correct = ensemble == actual

        both_correct = int(
            np.sum(single_correct & ensemble_correct)
        )

        single_only_correct = int(
            np.sum(single_correct & ~ensemble_correct)
        )

        ensemble_only_correct = int(
            np.sum(~single_correct & ensemble_correct)
        )

        both_wrong = int(
            np.sum(~single_correct & ~ensemble_correct)
        )

        return {
            "comparison_type": "classification",
            "test_rows": len(actual),
            "agreement_rate": safe_float(
                np.mean(agrees)
            ),
            "disagreement_rate": safe_float(
                np.mean(~agrees)
            ),
            "both_correct": both_correct,
            "single_only_correct": single_only_correct,
            "ensemble_only_correct": ensemble_only_correct,
            "both_wrong": both_wrong,
            "prediction_examples": examples,
        }

    differences = np.abs(single - ensemble)

    single_errors = np.abs(actual - single)
    ensemble_errors = np.abs(actual - ensemble)

    return {
        "comparison_type": "regression",
        "test_rows": len(actual),
        "mean_prediction_difference": safe_float(
            np.mean(differences)
        ),
        "max_prediction_difference": safe_float(
            np.max(differences)
        ),
        "single_mean_absolute_error": safe_float(
            np.mean(single_errors)
        ),
        "ensemble_mean_absolute_error": safe_float(
            np.mean(ensemble_errors)
        ),
        "ensemble_better_rows": int(
            np.sum(ensemble_errors < single_errors)
        ),
        "single_better_rows": int(
            np.sum(single_errors < ensemble_errors)
        ),
        "equal_error_rows": int(
            np.sum(
                np.isclose(
                    single_errors,
                    ensemble_errors,
                    rtol=1e-9,
                    atol=1e-9,
                )
            )
        ),
        "prediction_examples": examples,
    }


@app.post("/api/ensemble/overview/compare")
def compare_single_vs_ensemble(
    request: OverviewCompareRequest,
):
    """
    Compare one decision tree against a random forest.

    Both use:
      - The same input dataset
      - The same train/test split
      - The same selected features
      - The same missing-value strategy
      - The same tree-depth limit

    Preprocessing is fitted independently using
    training data only, preventing test-data leakage.
    """

    try:
        (
            X_train,
            X_test,
            y_train,
            y_test,
            cleaned,
        ) = prepare_data(request)

        # --------------------------------------------
        # 1. Build single decision tree
        # --------------------------------------------

        single_pipeline = build_overview_single_model(
            request
        )

        # --------------------------------------------
        # 2. Build Random Forest ensemble
        # --------------------------------------------

        ensemble_request = request.model_copy(
            update={
                "model": "random-forest",
            }
        )

        ensemble_pipeline = build_pipeline(
            ensemble_request
        )

        # --------------------------------------------
        # 3. Fit both models on identical training rows
        # --------------------------------------------

        single_pipeline.fit(
            X_train,
            y_train,
        )

        ensemble_pipeline.fit(
            X_train,
            y_train,
        )

        # --------------------------------------------
        # 4. Generate predictions
        # --------------------------------------------

        single_train_pred = single_pipeline.predict(
            X_train
        )

        single_test_pred = single_pipeline.predict(
            X_test
        )

        ensemble_train_pred = ensemble_pipeline.predict(
            X_train
        )

        ensemble_test_pred = ensemble_pipeline.predict(
            X_test
        )

        # --------------------------------------------
        # 5. Calculate train and test metrics
        # --------------------------------------------

        single_train_metrics = calculate_metrics(
            request,
            y_train,
            single_train_pred,
        )

        single_test_metrics = calculate_metrics(
            request,
            y_test,
            single_test_pred,
        )

        ensemble_train_metrics = calculate_metrics(
            request,
            y_train,
            ensemble_train_pred,
        )

        ensemble_test_metrics = calculate_metrics(
            request,
            y_test,
            ensemble_test_pred,
        )

        # --------------------------------------------
        # 6. Produce real 2D/3D prediction grids
        # --------------------------------------------

        single_visualization = make_visualization(
            request,
            single_pipeline,
            X_train,
            X_test,
            y_train,
            y_test,
            single_test_pred,
        )

        ensemble_visualization = make_visualization(
            request,
            ensemble_pipeline,
            X_train,
            X_test,
            y_train,
            y_test,
            ensemble_test_pred,
        )

        # --------------------------------------------
        # 7. Compare test predictions
        # --------------------------------------------

        agreement = overview_prediction_comparison(
            request,
            y_test,
            single_test_pred,
            ensemble_test_pred,
        )

        return {
            "success": True,
            "experiment": "single-vs-ensemble",
            "task": request.task,

            "dataset": {
                "total_rows": len(request.rows),
                "valid_rows": len(cleaned),
                "train_rows": len(X_train),
                "test_rows": len(X_test),
                "features": request.features,
                "target": request.target,
            },

            "parameters": {
                "max_depth": request.max_depth,
                "n_estimators": request.n_estimators,
                "test_size": request.test_size,
                "random_state": request.random_state,
                "missing_strategy": request.missing_strategy,
            },

            "single_model": {
                "name": "Decision Tree",
                "type": "decision-tree",
                "metrics": {
                    "train": single_train_metrics,
                    "test": single_test_metrics,
                },
                "visualization": single_visualization,
            },

            "ensemble_model": {
                "name": "Random Forest Ensemble",
                "type": "random-forest",
                "metrics": {
                    "train": ensemble_train_metrics,
                    "test": ensemble_test_metrics,
                },
                "visualization": ensemble_visualization,
            },

            "prediction_comparison": agreement,

            "explanation": (
                "Both models are evaluated on the "
                "same held-out test examples. "
                "Compare their test metrics to determine "
                "whether ensembling helped on this dataset. "
                "Better performance is not guaranteed."
            ),
        }

    except HTTPException:
        raise

    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

