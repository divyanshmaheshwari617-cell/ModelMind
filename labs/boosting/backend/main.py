
import os
import warnings

import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sklearn.tree import (
    DecisionTreeClassifier,
    DecisionTreeRegressor,
)
from sklearn.ensemble import (
    AdaBoostClassifier,
    AdaBoostRegressor,
    GradientBoostingClassifier,
    GradientBoostingRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    r2_score,
    mean_absolute_error,
    mean_squared_error,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

try:
    from .stage_surfaces import build_stage_surfaces
    from .learning_diagnostics import build_learning_diagnostics
    from .feature_importance import build_feature_importance
except ImportError:
    from stage_surfaces import build_stage_surfaces
    from learning_diagnostics import build_learning_diagnostics
    from feature_importance import build_feature_importance


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="ModelMind Boosting API",
    version="1.2.0",
    description=(
        "Real AdaBoost and Gradient Boosting experiments "
        "with stage playback, diagnostic visualizations "
        "and fitted feature importance"
    ),
)


# ============================================================
# CORS
# ============================================================

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

frontend_url = os.getenv(
    "BOOSTING_FRONTEND_URL", ""
).strip().rstrip("/")

if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


# ============================================================
# REQUEST SCHEMA
# ============================================================

class TrainRequest(BaseModel):
    task: str = "classification"

    rows: list[dict] = Field(min_length=12)
    features: list[str] = Field(min_length=1)
    target: str

    missing_strategy: str = "median"

    n_estimators: int = Field(
        default=30,
        ge=2,
        le=150,
    )

    learning_rate: float = Field(
        default=0.1,
        gt=0,
        le=2,
    )

    max_depth: int = Field(
        default=3,
        ge=1,
        le=12,
    )

    subsample: float = Field(
        default=1.0,
        gt=0,
        le=1,
    )

    test_size: float = Field(
        default=0.25,
        ge=0.1,
        le=0.4,
    )

    random_state: int = 42

    grid_resolution: int = Field(
        default=35,
        ge=15,
        le=55,
    )


# ============================================================
# METRICS
# ============================================================

def finite(value):
    value = float(value)
    return value if np.isfinite(value) else None


def numeric_metrics(task, actual, predicted):

    if task == "classification":

        precision, recall, f1, _ = (
            precision_recall_fscore_support(
                actual,
                predicted,
                average="weighted",
                zero_division=0,
            )
        )

        return {
            "accuracy": finite(
                accuracy_score(actual, predicted)
            ),
            "precision": finite(precision),
            "recall": finite(recall),
            "f1": finite(f1),
            "confusion_matrix": confusion_matrix(
                actual,
                predicted,
            ).tolist(),
        }

    return {
        "r2": (
            finite(r2_score(actual, predicted))
            if len(actual) >= 2
            else None
        ),
        "mae": finite(
            mean_absolute_error(actual, predicted)
        ),
        "rmse": finite(
            np.sqrt(
                mean_squared_error(actual, predicted)
            )
        ),
    }


# ============================================================
# DATA PREPARATION
# ============================================================

def prepare_dataset(req):

    if req.task not in (
        "classification",
        "regression",
    ):
        raise ValueError(
            "Task must be classification or regression."
        )

    if req.missing_strategy not in (
        "mean",
        "median",
        "most_frequent",
    ):
        raise ValueError(
            "Invalid missing-value strategy."
        )

    if len(set(req.features)) != len(req.features):
        raise ValueError(
            "Feature names must be unique."
        )

    if req.target in req.features:
        raise ValueError(
            "The target cannot also be a feature."
        )

    frame = pd.DataFrame(req.rows)

    required = req.features + [req.target]

    missing_columns = [
        name
        for name in required
        if name not in frame.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing columns: "
            + ", ".join(missing_columns)
        )

    X = frame[req.features].copy()

    for name in req.features:
        X[name] = pd.to_numeric(
            X[name],
            errors="coerce",
        ).replace(
            [np.inf, -np.inf],
            np.nan,
        )

    target = frame[req.target]

    if req.task == "regression":
        y = pd.to_numeric(
            target,
            errors="coerce",
        ).replace(
            [np.inf, -np.inf],
            np.nan,
        )

    else:
        y = (
            target.where(
                target.notna(),
                np.nan,
            )
            .astype("string")
            .str.strip()
        )
        y = y.replace("", pd.NA)

    valid = y.notna()

    X = X.loc[valid].reset_index(drop=True)
    y = y.loc[valid].reset_index(drop=True)

    if len(X) < 12:
        raise ValueError(
            "At least 12 rows with valid targets are required."
        )

    empty_features = [
        name
        for name in req.features
        if X[name].notna().sum() == 0
    ]

    if empty_features:
        raise ValueError(
            "These numeric features have no usable values: "
            + ", ".join(empty_features)
        )

    class_labels = None

    if req.task == "classification":

        encoder = LabelEncoder()

        y = encoder.fit_transform(
            y.astype(str)
        )

        class_labels = encoder.classes_.tolist()

        if len(class_labels) < 2:
            raise ValueError(
                "Classification requires at least two classes."
            )

        counts = np.bincount(y)

        test_rows = int(
            np.ceil(len(y) * req.test_size)
        )
        train_rows = len(y) - test_rows

        stratify = (
            y
            if (
                counts.min() >= 2
                and test_rows >= len(counts)
                and train_rows >= len(counts)
            )
            else None
        )

    else:
        y = y.to_numpy(dtype=float)
        stratify = None

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=req.test_size,
            random_state=req.random_state,
            stratify=stratify,
        )
    )

    train_empty_features = [
        name
        for name in req.features
        if X_train[name].notna().sum() == 0
    ]

    if train_empty_features:
        raise ValueError(
            "These features contain no usable training values: "
            + ", ".join(train_empty_features)
        )

    if req.task == "classification":

        all_classes = np.unique(y)
        training_classes = np.unique(y_train)

        if len(training_classes) != len(all_classes):
            raise ValueError(
                "Some target classes are absent from the "
                "training split. Add more examples of rare "
                "classes or adjust the test size."
            )

    return (
        X_train,
        X_test,
        y_train,
        y_test,
        class_labels,
        len(X),
    )


# ============================================================
# MODEL CREATION
# ============================================================

def make_models(req):

    seed = req.random_state
    depth = req.max_depth

    if req.task == "classification":

        single = DecisionTreeClassifier(
            max_depth=depth,
            random_state=seed,
        )

        ada = AdaBoostClassifier(
            estimator=DecisionTreeClassifier(
                max_depth=1,
                random_state=seed,
            ),
            n_estimators=req.n_estimators,
            learning_rate=req.learning_rate,
            random_state=seed,
        )

        gradient = GradientBoostingClassifier(
            n_estimators=req.n_estimators,
            learning_rate=req.learning_rate,
            max_depth=depth,
            subsample=req.subsample,
            random_state=seed,
        )

    else:

        single = DecisionTreeRegressor(
            max_depth=depth,
            random_state=seed,
        )

        ada = AdaBoostRegressor(
            estimator=DecisionTreeRegressor(
                max_depth=depth,
                random_state=seed,
            ),
            n_estimators=req.n_estimators,
            learning_rate=req.learning_rate,
            random_state=seed,
        )

        gradient = GradientBoostingRegressor(
            n_estimators=req.n_estimators,
            learning_rate=req.learning_rate,
            max_depth=depth,
            subsample=req.subsample,
            random_state=seed,
        )

    return {
        "single_tree": single,
        "adaboost": ada,
        "gradient_boosting": gradient,
    }


# ============================================================
# MODEL PERFORMANCE
# ============================================================

def get_model_metrics(
    task,
    pipeline,
    X_train,
    X_test,
    y_train,
    y_test,
):

    return {
        "train": numeric_metrics(
            task,
            y_train,
            pipeline.predict(X_train),
        ),
        "test": numeric_metrics(
            task,
            y_test,
            pipeline.predict(X_test),
        ),
    }


# ============================================================
# FINAL 2D / 3D SURFACE
# ============================================================

def create_surface(
    req,
    pipeline,
    X_train,
    X_test,
    y_train,
    y_test,
):

    if len(req.features) < 2:
        return None

    x_name, y_name = req.features[:2]

    baseline = X_train.median(
        numeric_only=True
    ).reindex(req.features)

    def axis_values(name):

        values = (
            X_train[name]
            .dropna()
            .to_numpy(dtype=float)
        )

        lower, upper = np.percentile(
            values,
            [2, 98],
        )

        if lower == upper:
            lower -= 1
            upper += 1

        padding = max(
            (upper - lower) * 0.1,
            1e-6,
        )

        return np.linspace(
            lower - padding,
            upper + padding,
            req.grid_resolution,
        )

    xs = axis_values(x_name)
    ys = axis_values(y_name)

    xx, yy = np.meshgrid(xs, ys)

    grid = pd.DataFrame(
        np.tile(
            baseline.to_numpy(dtype=float),
            (xx.size, 1),
        ),
        columns=req.features,
    )

    grid[x_name] = xx.ravel()
    grid[y_name] = yy.ravel()

    predictions = pipeline.predict(grid)

    def point_preview(data, labels):

        subset = data.iloc[:160]
        actual = np.asarray(labels)[:160]

        return [
            {
                "x": (
                    finite(row[x_name])
                    if pd.notna(row[x_name])
                    else None
                ),
                "y": (
                    finite(row[y_name])
                    if pd.notna(row[y_name])
                    else None
                ),
                "actual": finite(actual[i]),
            }
            for i, (_, row) in enumerate(
                subset.iterrows()
            )
        ]

    return {
        "x_feature": x_name,
        "y_feature": y_name,
        "x_values": xs.tolist(),
        "y_values": ys.tolist(),
        "z_values": (
            np.asarray(
                predictions,
                dtype=float,
            )
            .reshape(len(ys), len(xs))
            .tolist()
        ),
        "train_points": point_preview(
            X_train,
            y_train,
        ),
        "test_points": point_preview(
            X_test,
            y_test,
        ),
        "fixed_features": {
            name: (
                finite(baseline[name])
                if pd.notna(baseline[name])
                else None
            )
            for name in req.features[2:]
        },
    }


# ============================================================
# FITTED BOOSTING STAGE METRICS
# ============================================================

def make_progression(
    req,
    pipeline,
    X_test,
    y_test,
):

    model = pipeline.named_steps["model"]
    imputer = pipeline.named_steps["imputer"]

    if not hasattr(model, "staged_predict"):
        return []

    transformed = imputer.transform(X_test)
    actual = np.asarray(y_test)

    progression = []

    for stage, predicted in enumerate(
        model.staged_predict(transformed),
        start=1,
    ):

        predicted = np.asarray(predicted)

        progression.append({
            "stage": stage,
            "metrics": numeric_metrics(
                req.task,
                actual,
                predicted,
            ),
            "predictions": [
                finite(value)
                for value in predicted[:30]
            ],
        })

    if len(progression) > 20:

        indices = np.linspace(
            0,
            len(progression) - 1,
            20,
        ).astype(int)

        progression = [
            progression[i]
            for i in indices
        ]

    return progression


# ============================================================
# API ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "name": "ModelMind Boosting API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "port": int(
            os.getenv("PORT", "8004")
        ),
    }


@app.get("/api/boosting/models")
def models():
    return {
        "models": [
            "single_tree",
            "adaboost",
            "gradient_boosting",
        ],
        "tasks": [
            "classification",
            "regression",
        ],
        "visualizations": [
            "2d_prediction_contours",
            "3d_prediction_surfaces",
            "stage_metrics",
            "stage_prediction_surfaces",
            "adaboost_learner_diagnostics",
            "gradient_boosting_learning_diagnostics",
            "native_feature_importance",
            "permutation_feature_importance",
        ],
    }


# ============================================================
# MAIN TRAINING ENDPOINT
# ============================================================

@app.post("/api/boosting/train")
def train(req: TrainRequest):

    try:

        (
            X_train,
            X_test,
            y_train,
            y_test,
            class_labels,
            valid_rows,
        ) = prepare_dataset(req)

        model_specs = make_models(req)
        results = {}

        with warnings.catch_warnings(
            record=True
        ) as caught:

            warnings.simplefilter("always")

            for name, estimator in model_specs.items():

                pipeline = Pipeline([
                    (
                        "imputer",
                        SimpleImputer(
                            strategy=req.missing_strategy
                        ),
                    ),
                    ("model", estimator),
                ])

                pipeline.fit(X_train, y_train)

                model_metrics = get_model_metrics(
                    req.task,
                    pipeline,
                    X_train,
                    X_test,
                    y_train,
                    y_test,
                )

                model_visualization = create_surface(
                    req,
                    pipeline,
                    X_train,
                    X_test,
                    y_train,
                    y_test,
                )

                model_progression = (
                    make_progression(
                        req,
                        pipeline,
                        X_test,
                        y_test,
                    )
                    if name != "single_tree"
                    else []
                )

                model_stage_surfaces = (
                    build_stage_surfaces(
                        pipeline,
                        X_train,
                        model_visualization,
                        model_progression,
                    )
                    if name != "single_tree"
                    else []
                )

                model_diagnostics = (
                    build_learning_diagnostics(
                        task=req.task,
                        model_name=name,
                        pipeline=pipeline,
                        X_train=X_train,
                        y_train=y_train,
                    )
                )

                # NEW: Real native and permutation
                # feature importance for all models.
                model_feature_importance = (
                    build_feature_importance(
                        task=req.task,
                        model_name=name,
                        pipeline=pipeline,
                        X_test=X_test,
                        y_test=y_test,
                        feature_names=req.features,
                        random_state=req.random_state,
                    )
                )

                fitted_model = pipeline.named_steps[
                    "model"
                ]

                if name == "single_tree":
                    fitted_count = 1

                elif name == "adaboost":
                    fitted_count = len(
                        fitted_model.estimators_
                    )

                else:
                    fitted_count = int(
                        fitted_model.n_estimators_
                    )

                results[name] = {
                    "name": name,
                    "metrics": model_metrics,
                    "visualization": model_visualization,
                    "training_progression": model_progression,
                    "stage_surfaces": model_stage_surfaces,
                    "learning_diagnostics": model_diagnostics,
                    "feature_importance": model_feature_importance,
                    "fitted_estimators": fitted_count,
                }

        alerts = list(dict.fromkeys(
            str(item.message)
            for item in caught
        ))

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
                "class_labels": class_labels,
            },
            "models": results,
            "warnings": alerts,
        }

    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
