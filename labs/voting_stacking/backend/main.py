
import os
import warnings

import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sklearn.ensemble import (
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
from sklearn.neighbors import (
    KNeighborsClassifier,
    KNeighborsRegressor,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

from feature_importance import calculate_feature_importance


# ============================================================
# FASTAPI CONFIGURATION
# ============================================================

app = FastAPI(
    title="ModelMind Voting & Stacking API",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

frontend_url = os.getenv(
    "VOTING_STACKING_FRONTEND_URL", ""
).strip().rstrip("/")

if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST STRUCTURE
# ============================================================

class TrainRequest(BaseModel):
    task: str = "classification"

    rows: list[dict] = Field(
        min_length=20,
        max_length=20000,
    )

    features: list[str] = Field(min_length=1)
    target: str

    test_size: float = Field(
        default=0.25,
        ge=0.1,
        le=0.4,
    )

    missing_strategy: str = "median"

    knn_neighbors: int = Field(
        default=5,
        ge=1,
        le=30,
    )

    forest_estimators: int = Field(
        default=40,
        ge=5,
        le=150,
    )

    max_depth: int = Field(
        default=5,
        ge=1,
        le=20,
    )

    stacking_cv: int = Field(
        default=3,
        ge=2,
        le=5,
    )

    stacking_passthrough: bool = False

    voting_weights: list[float] = Field(
        default_factory=lambda: [1.0, 1.0, 1.0],
        min_length=3,
        max_length=3,
    )

    random_state: int = 42

    grid_resolution: int = Field(
        default=35,
        ge=15,
        le=55,
    )


def safe_number(value):
    try:
        number = float(value)
        return number if np.isfinite(number) else None
    except (TypeError, ValueError, OverflowError):
        return None


def safe_list(values):
    return [safe_number(value) for value in values]


# ============================================================
# DATASET PREPARATION
# ============================================================

def prepare_data(req):
    if req.task not in ("classification", "regression"):
        raise ValueError("Unsupported task.")

    if req.missing_strategy not in (
        "mean", "median", "most_frequent"
    ):
        raise ValueError("Unsupported missing-value strategy.")

    if len(set(req.features)) != len(req.features):
        raise ValueError("Feature names must be unique.")

    if req.target in req.features:
        raise ValueError(
            "Target cannot also be an input feature."
        )

    if not all(
        np.isfinite(weight) and weight >= 0
        for weight in req.voting_weights
    ):
        raise ValueError(
            "Voting weights must be finite and nonnegative."
        )

    if sum(req.voting_weights) <= 0:
        raise ValueError(
            "At least one voting weight must be positive."
        )

    frame = pd.DataFrame(req.rows)

    required = req.features + [req.target]
    missing = [
        column for column in required
        if column not in frame.columns
    ]

    if missing:
        raise ValueError(
            "Missing columns: " + ", ".join(missing)
        )

    X = frame[req.features].copy()

    for feature in req.features:
        X[feature] = pd.to_numeric(
            X[feature], errors="coerce"
        ).replace(
            [np.inf, -np.inf], np.nan
        )

    if req.task == "regression":
        y = pd.to_numeric(
            frame[req.target],
            errors="coerce",
        ).replace(
            [np.inf, -np.inf], np.nan
        )
        valid = y.notna()
    else:
        y = frame[req.target].astype("string").str.strip()
        valid = y.notna() & (y != "")

    X = X.loc[valid].reset_index(drop=True)
    y = y.loc[valid].reset_index(drop=True)

    if len(X) < 20:
        raise ValueError(
            "At least 20 rows with valid targets are required."
        )

    empty_features = [
        feature for feature in req.features
        if X[feature].notna().sum() == 0
    ]

    if empty_features:
        raise ValueError(
            "Selected numeric features contain no values: "
            + ", ".join(empty_features)
        )

    class_labels = None
    stratify = None

    if req.task == "classification":
        encoder = LabelEncoder()
        y = encoder.fit_transform(y.astype(str))
        class_labels = [
            str(label) for label in encoder.classes_
        ]

        counts = np.bincount(y)
        if len(counts) < 2:
            raise ValueError(
                "Classification needs at least two classes."
            )

        if min(counts) < 2:
            raise ValueError(
                "Each class needs at least two rows."
            )

        stratify = y
    else:
        y = y.to_numpy(dtype=float)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=req.test_size,
        random_state=req.random_state,
        stratify=stratify,
    )

    if any(
        X_train[col].notna().sum() == 0
        for col in req.features
    ):
        raise ValueError(
            "A selected feature is entirely missing "
            "in the training split."
        )

    # Stacking internally performs cross-validation.
    # KNN must have enough training examples in each fold.
    minimum_fold_train_size = (
        len(X_train)
        - int(np.ceil(len(X_train) / req.stacking_cv))
    )

    if req.knn_neighbors > minimum_fold_train_size:
        raise ValueError(
            "Reduce KNN neighbors or stacking folds: "
            "a stacking training fold contains fewer "
            "samples than the selected neighbor count."
        )

    if req.task == "classification":
        train_counts = np.bincount(
            y_train,
            minlength=len(class_labels),
        )

        if min(train_counts) < req.stacking_cv:
            raise ValueError(
                "Not enough training rows per class "
                "for the selected stacking CV folds."
            )

        if len(X_test) < len(class_labels):
            raise ValueError(
                "Test split is too small for all classes."
            )

    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "class_labels": class_labels,
        "valid_rows": len(X),
    }


# ============================================================
# BASE MODEL FACTORY
# ============================================================

def create_estimators(req):
    if req.task == "classification":
        linear = LogisticRegression(
            max_iter=2000,
            random_state=req.random_state,
        )
        knn = KNeighborsClassifier(
            n_neighbors=req.knn_neighbors,
        )
        forest = RandomForestClassifier(
            n_estimators=req.forest_estimators,
            max_depth=req.max_depth,
            random_state=req.random_state,
            n_jobs=1,
        )
    else:
        linear = Ridge(alpha=1.0)
        knn = KNeighborsRegressor(
            n_neighbors=req.knn_neighbors,
        )
        forest = RandomForestRegressor(
            n_estimators=req.forest_estimators,
            max_depth=req.max_depth,
            random_state=req.random_state,
            n_jobs=1,
        )

    def pipeline(model, scale):
        steps = [
            (
                "imputer",
                SimpleImputer(
                    strategy=req.missing_strategy,
                ),
            ),
        ]

        if scale:
            steps.append(
                ("scaler", StandardScaler())
            )

        steps.append(("model", model))
        return Pipeline(steps)

    return [
        ("linear", pipeline(linear, True)),
        ("knn", pipeline(knn, True)),
        ("random_forest", pipeline(forest, False)),
    ]


def create_models(req):
    # Each fitted model receives its own estimators.
    bases = dict(create_estimators(req))

    models = {
        "linear": bases["linear"],
        "knn": bases["knn"],
        "random_forest": bases["random_forest"],
    }

    if req.task == "classification":
        models["hard_voting"] = VotingClassifier(
            estimators=create_estimators(req),
            voting="hard",
            weights=req.voting_weights,
            n_jobs=1,
        )

        models["soft_voting"] = VotingClassifier(
            estimators=create_estimators(req),
            voting="soft",
            weights=req.voting_weights,
            n_jobs=1,
        )

        models["stacking"] = StackingClassifier(
            estimators=create_estimators(req),
            final_estimator=Pipeline([
                (
                    "imputer",
                    SimpleImputer(
                        strategy=req.missing_strategy,
                    ),
                ),
                (
                    "scaler",
                    StandardScaler(),
                ),
                (
                    "logistic",
                    LogisticRegression(
                        max_iter=2000,
                        random_state=req.random_state,
                    ),
                ),
            ]),
            cv=req.stacking_cv,
            stack_method="predict_proba",
            passthrough=req.stacking_passthrough,
            n_jobs=1,
        )
    else:
        models["voting"] = VotingRegressor(
            estimators=create_estimators(req),
            weights=req.voting_weights,
            n_jobs=1,
        )

        models["stacking"] = StackingRegressor(
            estimators=create_estimators(req),
            final_estimator=Pipeline([
                (
                    "imputer",
                    SimpleImputer(
                        strategy=req.missing_strategy,
                    ),
                ),
                (
                    "scaler",
                    StandardScaler(),
                ),
                (
                    "ridge",
                    Ridge(alpha=1.0),
                ),
            ]),
            cv=req.stacking_cv,
            passthrough=req.stacking_passthrough,
            n_jobs=1,
        )
    return models


# ============================================================
# REAL EVALUATION METRICS
# ============================================================

def calculate_metrics(task, actual, predicted, class_count):
    if task == "classification":
        return {
            "accuracy": safe_number(
                accuracy_score(actual, predicted)
            ),
            "precision": safe_number(
                precision_score(
                    actual, predicted,
                    average="weighted",
                    zero_division=0,
                )
            ),
            "recall": safe_number(
                recall_score(
                    actual, predicted,
                    average="weighted",
                    zero_division=0,
                )
            ),
            "f1": safe_number(
                f1_score(
                    actual, predicted,
                    average="weighted",
                    zero_division=0,
                )
            ),
            "confusion_matrix": confusion_matrix(
                actual, predicted,
                labels=list(range(class_count)),
            ).tolist(),
        }

    return {
        "r2": safe_number(
            r2_score(actual, predicted)
        ),
        "mae": safe_number(
            mean_absolute_error(actual, predicted)
        ),
        "rmse": safe_number(
            np.sqrt(
                mean_squared_error(actual, predicted)
            )
        ),
    }


# ============================================================
# 2D / 3D PREDICTION SURFACES
# ============================================================

def create_surface(
    req, model,
    X_train, X_test,
    y_train, y_test,
):
    if len(req.features) < 2:
        return None

    x_feature, y_feature = req.features[:2]

    medians = X_train.median(
        numeric_only=True
    ).reindex(req.features)

    def make_axis(name):
        values = X_train[name].dropna().to_numpy()

        low, high = np.percentile(values, [2, 98])

        if low == high:
            low -= 1
            high += 1

        padding = max((high - low) * 0.1, 1e-6)

        return np.linspace(
            low - padding,
            high + padding,
            req.grid_resolution,
        )

    xs = make_axis(x_feature)
    ys = make_axis(y_feature)

    xx, yy = np.meshgrid(xs, ys)

    grid = pd.DataFrame(
        np.tile(
            medians.to_numpy(dtype=float),
            (xx.size, 1),
        ),
        columns=req.features,
    )

    grid[x_feature] = xx.ravel()
    grid[y_feature] = yy.ravel()

    predictions = np.asarray(
        model.predict(grid),
        dtype=float,
    )

    def make_points(features, targets):
        samples = features.iloc[:150]

        return [
            {
                "x": safe_number(row[x_feature]),
                "y": safe_number(row[y_feature]),
                "actual": safe_number(
                    np.asarray(targets)[index]
                ),
            }
            for index, (_, row)
            in enumerate(samples.iterrows())
        ]

    return {
        "x_feature": x_feature,
        "y_feature": y_feature,
        "x_values": safe_list(xs),
        "y_values": safe_list(ys),
        "z_values": predictions.reshape(
            len(ys), len(xs)
        ).tolist(),
        "train_points": make_points(
            X_train, y_train
        ),
        "test_points": make_points(
            X_test, y_test
        ),
        "fixed_features": {
            name: safe_number(medians[name])
            for name in req.features[2:]
        },
        "note": (
            "Prediction surface uses the first two "
            "features; other input features are fixed "
            "at their training medians."
        ),
    }


# ============================================================
# VOTING AND STACKING EXPLANATIONS
# ============================================================

def create_explanations(
    req, models, X_test, y_test
):
    samples = X_test.iloc[:12]
    actual = np.asarray(y_test)[:12]

    base_names = [
        "linear", "knn", "random_forest"
    ]

    base_predictions = {
        name: np.asarray(
            models[name].predict(samples)
        )
        for name in base_names
    }

    voting_key = (
        "hard_voting"
        if req.task == "classification"
        else "voting"
    )

    voting_predictions = models[
        voting_key
    ].predict(samples)

    stacking_predictions = models[
        "stacking"
    ].predict(samples)

    stacking_meta = np.asarray(
        models["stacking"].transform(samples),
        dtype=float,
    )

    if req.task == "classification":
        soft_predictions = models[
            "soft_voting"
        ].predict(samples)

        soft_probabilities = models[
            "soft_voting"
        ].predict_proba(samples)

    observations = []

    for index in range(len(samples)):
        observation = {
            "index": index,
            "actual": safe_number(actual[index]),
            "base_predictions": {
                name: safe_number(
                    base_predictions[name][index]
                )
                for name in base_names
            },
            "voting_prediction": safe_number(
                voting_predictions[index]
            ),
            "stacking_prediction": safe_number(
                stacking_predictions[index]
            ),
            "stacking_meta_features": safe_list(
                stacking_meta[index]
            ),
        }

        if req.task == "classification":
            observation[
                "soft_voting_prediction"
            ] = safe_number(
                soft_predictions[index]
            )

            observation[
                "soft_voting_probabilities"
            ] = safe_list(
                soft_probabilities[index]
            )

        observations.append(observation)

    return {
        "method": "actual_fitted_predictions",
        "base_model_names": base_names,
        "weights": req.voting_weights,
        "meta_feature_count": int(
            stacking_meta.shape[1]
        ),
        "observations": observations,
        "note": (
            "The meta-feature vectors are obtained "
            "from the fitted stacking model on held-out "
            "test observations. During stacking training, "
            "scikit-learn generates out-of-fold "
            "predictions to train the meta-learner."
        ),
    }


# ============================================================
# API ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "name": "ModelMind Voting & Stacking API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "lab": "voting_stacking",
    }


@app.get("/api/voting-stacking/models")
def available_models():
    return {
        "classification": [
            "linear",
            "knn",
            "random_forest",
            "hard_voting",
            "soft_voting",
            "stacking",
        ],
        "regression": [
            "linear",
            "knn",
            "random_forest",
            "voting",
            "stacking",
        ],
    }


@app.post("/api/voting-stacking/train")
def train(req: TrainRequest):
    try:
        data = prepare_data(req)

        X_train = data["X_train"]
        X_test = data["X_test"]
        y_train = data["y_train"]
        y_test = data["y_test"]

        models = create_models(req)

        results = {}
        fitted_models = {}

        class_count = (
            len(data["class_labels"])
            if data["class_labels"] is not None
            else 0
        )

        with warnings.catch_warnings(record=True) as captured:
            warnings.simplefilter("always")

            for name, model in models.items():
                model.fit(X_train, y_train)
                fitted_models[name] = model

                train_pred = model.predict(X_train)
                test_pred = model.predict(X_test)

                results[name] = {
                    "name": name,
                    "metrics": {
                        "train": calculate_metrics(
                            req.task,
                            y_train,
                            train_pred,
                            class_count,
                        ),
                        "test": calculate_metrics(
                            req.task,
                            y_test,
                            test_pred,
                            class_count,
                        ),
                    },
                    "visualization": create_surface(
                        req,
                        model,
                        X_train,
                        X_test,
                        y_train,
                        y_test,
                    ),
                    "predictions": {
                        "actual": safe_list(
                            np.asarray(y_test)[:50]
                        ),
                        "predicted": safe_list(
                            np.asarray(test_pred)[:50]
                        ),
                    },
                }

            explanation = create_explanations(
                req,
                fitted_models,
                X_test,
                y_test,
            )

            feature_importance = (
                calculate_feature_importance(
                    models=fitted_models,
                    X_test=X_test,
                    y_test=y_test,
                    task=req.task,
                    random_state=req.random_state,
                )
            )

        return {
            "success": True,
            "task": req.task,
            "dataset": {
                "total_rows": len(req.rows),
                "valid_rows": data["valid_rows"],
                "train_rows": len(X_train),
                "test_rows": len(X_test),
                "features": req.features,
                "target": req.target,
                "class_labels": data["class_labels"],
            },
            "configuration": {
                "knn_neighbors": req.knn_neighbors,
                "forest_estimators": req.forest_estimators,
                "max_depth": req.max_depth,
                "stacking_cv": req.stacking_cv,
                "stacking_passthrough": (
                    req.stacking_passthrough
                ),
                "voting_weights": req.voting_weights,
                "missing_strategy": req.missing_strategy,
                "test_size": req.test_size,
                "random_state": req.random_state,
            },
            "models": results,
            "ensemble_explanation": explanation,
            "feature_importance": feature_importance,
            "warnings": list(
                dict.fromkeys(
                    str(w.message) for w in captured
                )
            ),
        }

    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
