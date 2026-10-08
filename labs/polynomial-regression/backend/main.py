
from __future__ import annotations

from math import comb
from typing import Literal
import warnings

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from sklearn.exceptions import ConvergenceWarning
from sklearn.linear_model import Lasso, LinearRegression, Ridge
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import KFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

from backend.ml.preprocessing import NumericImputer, PreprocessingConfig


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="ModelMind Polynomial Regression API",
    description=(
        "Interactive polynomial regression with multiple features, "
        "leakage-safe preprocessing, visualizations, predictions "
        "and cross-validation."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://modelmind-polynomial-lab.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class TrainingRequest(BaseModel):
    rows: list[dict[str, float | int | str | None]] = Field(
        min_length=5,
        max_length=10000,
    )

    features: list[str] = Field(min_length=1, max_length=8)
    target: str

    degree: int = Field(default=2, ge=1, le=10)
    regularization: Literal["none", "ridge", "lasso"] = "none"

    alpha: float = Field(default=1.0, ge=0, le=100000)
    test_size: float = Field(default=0.2, gt=0.05, lt=0.5)
    random_state: int = Field(default=42, ge=0)

    interaction_only: bool = False
    standardize: bool = True

    preprocessing: PreprocessingConfig = Field(
        default_factory=PreprocessingConfig
    )

    @model_validator(mode="after")
    def validate_request(self):
        if len(set(self.features)) != len(self.features):
            raise ValueError("Feature names must be unique.")

        if not self.target.strip():
            raise ValueError("Target name cannot be empty.")

        if self.target in self.features:
            raise ValueError(
                "Target cannot also be an input feature."
            )

        unknown = (
            set(self.preprocessing.feature_strategies)
            - set(self.features)
        )

        if unknown:
            raise ValueError(
                "Preprocessing contains unknown features: "
                + ", ".join(sorted(unknown))
            )

        return self


class CurveRequest(TrainingRequest):
    x_feature: str | None = None
    fixed_features: dict[str, float] = Field(
        default_factory=dict
    )
    grid_size: int = Field(default=250, ge=20, le=500)

    @model_validator(mode="after")
    def validate_curve(self):
        if (
            self.x_feature is not None
            and self.x_feature not in self.features
        ):
            raise ValueError(
                "2D X-axis must be a selected input feature."
            )

        unknown = set(self.fixed_features) - set(self.features)

        if unknown:
            raise ValueError(
                "Unknown fixed features: "
                + ", ".join(sorted(unknown))
            )

        return self


class SurfaceRequest(TrainingRequest):
    x_feature: str
    y_feature: str
    grid_size: int = Field(default=35, ge=10, le=65)

    fixed_features: dict[str, float] = Field(
        default_factory=dict
    )

    @model_validator(mode="after")
    def validate_surface(self):
        if self.x_feature == self.y_feature:
            raise ValueError(
                "3D axes must use different features."
            )

        if (
            self.x_feature not in self.features
            or self.y_feature not in self.features
        ):
            raise ValueError(
                "Both 3D axes must be selected model features."
            )

        unknown = set(self.fixed_features) - set(self.features)

        if unknown:
            raise ValueError(
                "Unknown fixed features: "
                + ", ".join(sorted(unknown))
            )

        return self


class DegreeSearchRequest(TrainingRequest):
    min_degree: int = Field(default=1, ge=1, le=10)
    max_degree: int = Field(default=10, ge=1, le=10)
    cv_folds: int = Field(default=5, ge=2, le=10)

    @model_validator(mode="after")
    def validate_degree_range(self):
        if self.min_degree > self.max_degree:
            raise ValueError(
                "Minimum degree cannot exceed maximum degree."
            )

        return self


class NewPredictionRequest(BaseModel):
    training: TrainingRequest
    inputs: list[dict[str, float | None]] = Field(
        min_length=1,
        max_length=100,
    )


# ============================================================
# DATA PARSING
# ============================================================

MISSING_MARKERS = {
    "",
    "na",
    "n/a",
    "null",
    "nan",
    "none",
    "?",
}


def parse_number(value, column: str):
    if value is None:
        return np.nan

    if isinstance(value, str):
        value = value.strip()

        if value.lower() in MISSING_MARKERS:
            return np.nan

    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError):
        raise HTTPException(
            status_code=422,
            detail=(
                f"Column '{column}' contains a non-numeric "
                f"value: {str(value)[:60]}"
            ),
        )

    if not np.isfinite(number):
        raise HTTPException(
            status_code=422,
            detail=(
                f"Column '{column}' contains an infinite "
                "or invalid numeric value."
            ),
        )

    return number


def prepare_data(request: TrainingRequest):
    X_rows = []
    y_rows = []

    missing_target_rows = 0
    missing_feature_counts = {
        feature: 0 for feature in request.features
    }

    for row in request.rows:
        target = parse_number(
            row.get(request.target),
            request.target,
        )

        if np.isnan(target):
            missing_target_rows += 1
            continue

        feature_values = []

        for name in request.features:
            value = parse_number(row.get(name), name)

            if np.isnan(value):
                missing_feature_counts[name] += 1

            feature_values.append(value)

        X_rows.append(feature_values)
        y_rows.append(target)

    if len(X_rows) < 5:
        raise HTTPException(
            status_code=422,
            detail=(
                "At least five rows with valid target "
                "values are required."
            ),
        )

    X = np.asarray(X_rows, dtype=float)
    y = np.asarray(y_rows, dtype=float)

    return (
        X,
        y,
        missing_target_rows,
        missing_feature_counts,
    )


def apply_drop_strategies(
    request: TrainingRequest,
    X: np.ndarray,
    y: np.ndarray,
):
    drop_features = [
        name
        for name, strategy in (
            request.preprocessing.feature_strategies.items()
        )
        if strategy.method == "drop"
    ]

    if not drop_features:
        return X, y, 0

    indices = [
        request.features.index(name)
        for name in drop_features
    ]

    keep = ~np.isnan(X[:, indices]).any(axis=1)

    dropped = int(np.count_nonzero(~keep))

    return X[keep], y[keep], dropped


def prepare_training_data(request: TrainingRequest):
    (
        X,
        y,
        missing_target_rows,
        missing_feature_counts,
    ) = prepare_data(request)

    X, y, dropped_feature_rows = apply_drop_strategies(
        request,
        X,
        y,
    )

    if len(X) < 5:
        raise HTTPException(
            status_code=422,
            detail=(
                "Too few rows remain after removing "
                "missing targets and selected feature rows."
            ),
        )

    return {
        "X": X,
        "y": y,
        "missing_target_rows": missing_target_rows,
        "missing_feature_counts": missing_feature_counts,
        "dropped_feature_rows": dropped_feature_rows,
    }


# ============================================================
# POLYNOMIAL COMPLEXITY
# ============================================================

MAX_POLYNOMIAL_TERMS = 500


def polynomial_feature_count(
    feature_count: int,
    degree: int,
    interaction_only: bool,
):
    if interaction_only:
        return sum(
            comb(feature_count, k)
            for k in range(
                1,
                min(degree, feature_count) + 1,
            )
        )

    return comb(
        feature_count + degree,
        degree,
    ) - 1


def check_complexity(request: TrainingRequest):
    count = polynomial_feature_count(
        len(request.features),
        request.degree,
        request.interaction_only,
    )

    if count > MAX_POLYNOMIAL_TERMS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Selected settings generate {count} "
                f"polynomial features. The limit is "
                f"{MAX_POLYNOMIAL_TERMS}. "
                "Reduce degree or feature count."
            ),
        )

    return count


# ============================================================
# MODEL PIPELINE
# ============================================================

def build_pipeline(request: TrainingRequest):
    if request.regularization == "ridge":
        estimator = Ridge(
            alpha=request.alpha,
            max_iter=10000,
        )

    elif request.regularization == "lasso":
        estimator = Lasso(
            alpha=request.alpha,
            max_iter=20000,
            tol=1e-4,
        )

    else:
        estimator = LinearRegression()

    steps = [
        (
            "imputer",
            NumericImputer(
                feature_names=request.features,
                config=request.preprocessing,
            ),
        ),
        (
            "polynomial",
            PolynomialFeatures(
                degree=request.degree,
                include_bias=False,
                interaction_only=request.interaction_only,
            ),
        ),
    ]

    if request.standardize:
        steps.append(
            ("scaler", StandardScaler())
        )

    steps.append(
        ("regressor", estimator)
    )

    return Pipeline(steps)


def fit_pipeline(
    pipeline: Pipeline,
    X: np.ndarray,
    y: np.ndarray,
):
    try:
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter(
                "always",
                ConvergenceWarning,
            )

            pipeline.fit(X, y)

        warning_messages = [
            str(item.message)
            for item in caught
            if issubclass(
                item.category,
                ConvergenceWarning,
            )
        ]

    except (
        ValueError,
        OverflowError,
        FloatingPointError,
        np.linalg.LinAlgError,
    ) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Model training failed: {exc}",
        ) from exc

    return warning_messages


# ============================================================
# METRICS
# ============================================================

def ensure_finite(values, label: str):
    if not np.all(np.isfinite(values)):
        raise HTTPException(
            status_code=422,
            detail=(
                f"{label} contains non-finite values. "
                "Try reducing polynomial degree, "
                "scaling features, or using Ridge."
            ),
        )


def calculate_metrics(actual, predicted):
    mse = float(
        mean_squared_error(actual, predicted)
    )

    return {
        "mae": float(
            mean_absolute_error(actual, predicted)
        ),
        "mse": mse,
        "rmse": float(np.sqrt(mse)),
        "r2": (
            float(r2_score(actual, predicted))
            if len(actual) >= 2
            and not np.all(actual == actual[0])
            else None
        ),
    }


# ============================================================
# EQUATION AND COEFFICIENT HELPERS
# ============================================================

def get_equation_details(
    pipeline: Pipeline,
    feature_names: list[str],
    target: str,
):
    polynomial = pipeline.named_steps["polynomial"]
    regressor = pipeline.named_steps["regressor"]

    names = polynomial.get_feature_names_out(
        feature_names
    ).tolist()

    fitted_coefficients = np.asarray(
        regressor.coef_,
        dtype=float,
    ).ravel()

    fitted_intercept = float(
        regressor.intercept_
    )

    # Convert standardized polynomial coefficients
    # back into raw polynomial-feature space.
    #
    # This makes the displayed equation directly usable
    # after the original-input imputation step.
    if "scaler" in pipeline.named_steps:
        scaler = pipeline.named_steps["scaler"]

        scales = np.asarray(
            scaler.scale_,
            dtype=float,
        )

        means = np.asarray(
            scaler.mean_,
            dtype=float,
        )

        raw_coefficients = (
            fitted_coefficients / scales
        )

        raw_intercept = float(
            fitted_intercept
            - np.dot(raw_coefficients, means)
        )

    else:
        raw_coefficients = fitted_coefficients.copy()
        raw_intercept = fitted_intercept

    ensure_finite(
        raw_coefficients,
        "Equation coefficients",
    )

    ensure_finite(
        np.asarray([raw_intercept]),
        "Equation intercept",
    )

    equation_parts = [
        f"{target} = {raw_intercept:.6g}"
    ]

    terms = []

    for name, coefficient in zip(
        names,
        raw_coefficients,
    ):
        coefficient = float(coefficient)

        sign = "+" if coefficient >= 0 else "-"

        equation_parts.append(
            f"{sign} {abs(coefficient):.6g} × {name}"
        )

        terms.append({
            "name": name,
            "coefficient": coefficient,
        })

    return {
        "feature_names": names,
        "coefficients": raw_coefficients.tolist(),
        "intercept": raw_intercept,
        "coefficient_space": "raw polynomial features",
        "equation": " ".join(equation_parts),
        "terms": terms,
    }


def explain_prediction(
    pipeline: Pipeline,
    X: np.ndarray,
    feature_names: list[str],
    target: str,
):
    equation = get_equation_details(
        pipeline,
        feature_names,
        target,
    )

    imputer = pipeline.named_steps["imputer"]
    polynomial = pipeline.named_steps["polynomial"]

    filled = imputer.transform(X)

    transformed = polynomial.transform(filled)

    coefficients = np.asarray(
        equation["coefficients"],
        dtype=float,
    )

    contributions = (
        transformed * coefficients.reshape(1, -1)
    )

    predictions = pipeline.predict(X)

    ensure_finite(
        predictions,
        "New predictions",
    )

    records = []

    for row_index, row in enumerate(filled):
        polynomial_values = {
            name: float(value)
            for name, value in zip(
                equation["feature_names"],
                transformed[row_index],
            )
        }

        term_contributions = {
            name: float(value)
            for name, value in zip(
                equation["feature_names"],
                contributions[row_index],
            )
        }

        reconstructed = float(
            equation["intercept"]
            + np.sum(contributions[row_index])
        )

        predicted = float(predictions[row_index])

        if not np.isclose(
            reconstructed,
            predicted,
            rtol=1e-5,
            atol=1e-5,
        ):
            raise HTTPException(
                status_code=422,
                detail=(
                    "Prediction explanation does not match "
                    "the fitted model."
                ),
            )

        records.append({
            "inputs": {
                name: (
                    None
                    if np.isnan(X[row_index, index])
                    else float(X[row_index, index])
                )
                for index, name in enumerate(
                    feature_names
                )
            },
            "imputed_inputs": {
                name: float(value)
                for name, value in zip(
                    feature_names,
                    row,
                )
            },
            "predicted": predicted,
            "intercept": float(
                equation["intercept"]
            ),
            "polynomial_terms": polynomial_values,
            "term_contributions": term_contributions,
        })

    return records


# ============================================================
# MAIN TRAINING ENGINE
# ============================================================

def fit_model(request: TrainingRequest):
    polynomial_count = check_complexity(request)

    data = prepare_training_data(request)

    X = data["X"]
    y = data["y"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=request.test_size,
        random_state=request.random_state,
    )

    if len(X_train) < 2 or len(X_test) < 2:
        raise HTTPException(
            status_code=422,
            detail=(
                "Train and test sets must contain "
                "at least two rows each."
            ),
        )

    pipeline = build_pipeline(request)

    training_warnings = fit_pipeline(
        pipeline,
        X_train,
        y_train,
    )

    train_predictions = pipeline.predict(X_train)
    test_predictions = pipeline.predict(X_test)

    ensure_finite(
        train_predictions,
        "Training predictions",
    )

    ensure_finite(
        test_predictions,
        "Testing predictions",
    )

    imputer = pipeline.named_steps["imputer"]

    equation = get_equation_details(
        pipeline,
        request.features,
        request.target,
    )

    records = []

    for split, features, actual, predicted in [
        (
            "train",
            X_train,
            y_train,
            train_predictions,
        ),
        (
            "test",
            X_test,
            y_test,
            test_predictions,
        ),
    ]:
        for row, truth, estimate in zip(
            features,
            actual,
            predicted,
        ):
            records.append({
                "split": split,
                "features": {
                    name: (
                        None
                        if np.isnan(value)
                        else float(value)
                    )
                    for name, value in zip(
                        request.features,
                        row,
                    )
                },
                "actual": float(truth),
                "predicted": float(estimate),
                "residual": float(
                    truth - estimate
                ),
            })

    response = {
        "status": "success",
        "model": {
            "degree": request.degree,
            "regularization": request.regularization,
            "alpha": request.alpha,
            "standardize": request.standardize,
            "interaction_only": request.interaction_only,
        },
        "dataset": {
            "total_rows": len(request.rows),
            "valid_rows": len(X),
            "dropped_rows": (
                data["missing_target_rows"]
                + data["dropped_feature_rows"]
            ),
            "training_rows": len(X_train),
            "testing_rows": len(X_test),
        },
        "metrics": {
            "train": calculate_metrics(
                y_train,
                train_predictions,
            ),
            "test": calculate_metrics(
                y_test,
                test_predictions,
            ),
        },
        "polynomial": {
            "feature_count": polynomial_count,
            "feature_names": equation["feature_names"],
            "coefficients": equation["coefficients"],
            "intercept": equation["intercept"],
            "coefficient_space": equation["coefficient_space"],
            "equation": equation["equation"],
            "terms": equation["terms"],
        },
        "predictions": records,
        "preprocessing": {
            "missing_target_rows_dropped": (
                data["missing_target_rows"]
            ),
            "missing_feature_rows_dropped": (
                data["dropped_feature_rows"]
            ),
            "missing_feature_counts": (
                data["missing_feature_counts"]
            ),
            "training_statistics": imputer.statistics_,
            "leakage_safe": True,
        },
        "warnings": training_warnings,
    }

    return {
        "pipeline": pipeline,
        "X": X,
        "y": y,
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "response": response,
    }


# ============================================================
# VISUALIZATION HELPERS
# ============================================================

def get_fixed_values(
    request: TrainingRequest,
    pipeline: Pipeline,
    X: np.ndarray,
    overrides: dict[str, float] | None = None,
):
    imputer = pipeline.named_steps["imputer"]

    filled_X = imputer.transform(X)

    fixed = np.median(
        filled_X,
        axis=0,
    ).astype(float)

    overrides = overrides or {}

    for name, value in overrides.items():
        if name not in request.features:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown fixed feature: {name}",
            )

        parsed = parse_number(value, name)

        if not np.isfinite(parsed):
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Fixed value for '{name}' "
                    "must be finite."
                ),
            )

        index = request.features.index(name)
        fixed[index] = parsed

    return filled_X, fixed


# ============================================================
# HEALTH ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {
        "project": "ModelMind Polynomial Regression",
        "status": "running",
        "version": "2.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "polynomial-regression",
    }


# ============================================================
# TRAIN MODEL
# ============================================================

@app.post("/api/polynomial/train")
def train_polynomial(request: TrainingRequest):
    return fit_model(request)["response"]


# ============================================================
# INTERACTIVE 2D CURVE
# ============================================================

@app.post("/api/polynomial/curve")
def polynomial_curve(request: CurveRequest):
    result = fit_model(request)

    X = result["X"]
    pipeline = result["pipeline"]

    x_feature = (
        request.x_feature
        if request.x_feature is not None
        else request.features[0]
    )

    x_index = request.features.index(x_feature)

    filled_X, fixed = get_fixed_values(
        request,
        pipeline,
        X,
        request.fixed_features,
    )

    observed = filled_X[:, x_index]

    x_values = np.linspace(
        float(np.min(observed)),
        float(np.max(observed)),
        request.grid_size,
    )

    grid = np.tile(
        fixed,
        (len(x_values), 1),
    )

    grid[:, x_index] = x_values

    predicted = pipeline.predict(grid)

    ensure_finite(
        predicted,
        "Curve predictions",
    )

    return {
        **result["response"],
        "curve": [
            {
                "x": float(x),
                "y": float(y),
            }
            for x, y in zip(
                x_values,
                predicted,
            )
        ],
        "curve_context": {
            "x_feature": x_feature,
            "fixed_features": {
                name: float(fixed[index])
                for index, name in enumerate(
                    request.features
                )
                if index != x_index
            },
        },
    }


# ============================================================
# INTERACTIVE 3D SURFACE
# ============================================================

@app.post("/api/polynomial/surface")
def polynomial_surface(request: SurfaceRequest):
    if len(request.features) < 2:
        raise HTTPException(
            status_code=422,
            detail=(
                "3D visualization requires at least "
                "two selected input features."
            ),
        )

    result = fit_model(request)

    X = result["X"]
    y = result["y"]
    pipeline = result["pipeline"]

    x_index = request.features.index(
        request.x_feature
    )

    y_index = request.features.index(
        request.y_feature
    )

    filled_X, fixed = get_fixed_values(
        request,
        pipeline,
        X,
        request.fixed_features,
    )

    x_values = np.linspace(
        float(np.min(filled_X[:, x_index])),
        float(np.max(filled_X[:, x_index])),
        request.grid_size,
    )

    y_values = np.linspace(
        float(np.min(filled_X[:, y_index])),
        float(np.max(filled_X[:, y_index])),
        request.grid_size,
    )

    xx, yy = np.meshgrid(
        x_values,
        y_values,
    )

    grid = np.tile(
        fixed,
        (xx.size, 1),
    )

    grid[:, x_index] = xx.ravel()
    grid[:, y_index] = yy.ravel()

    predicted = pipeline.predict(grid)

    ensure_finite(
        predicted,
        "Surface predictions",
    )

    zz = predicted.reshape(xx.shape)

    return {
        **result["response"],
        "surface": {
            "x_feature": request.x_feature,
            "y_feature": request.y_feature,
            "x": x_values.tolist(),
            "y": y_values.tolist(),
            "z": zz.tolist(),
            "observed_points": [
                {
                    "x": float(row[x_index]),
                    "y": float(row[y_index]),
                    "z": float(target),
                }
                for row, target in zip(
                    filled_X,
                    y,
                )
            ],
            "fixed_features": {
                name: float(fixed[index])
                for index, name in enumerate(
                    request.features
                )
                if index not in (
                    x_index,
                    y_index,
                )
            },
        },
    }


# ============================================================
# BEST DEGREE FINDER
# ============================================================

@app.post("/api/polynomial/best-degree")
def find_best_degree(request: DegreeSearchRequest):
    data = prepare_training_data(request)

    X = data["X"]
    y = data["y"]

    # Keep the final test set out of model selection.
    X_train, _, y_train, _ = train_test_split(
        X,
        y,
        test_size=request.test_size,
        random_state=request.random_state,
    )

    folds = min(
        request.cv_folds,
        len(X_train),
    )

    if folds < 2:
        raise HTTPException(
            status_code=422,
            detail=(
                "Not enough training samples "
                "for cross-validation."
            ),
        )

    kfold = KFold(
        n_splits=folds,
        shuffle=True,
        random_state=request.random_state,
    )

    results = []

    best_degree = None
    best_rmse = float("inf")

    for degree in range(
        request.min_degree,
        request.max_degree + 1,
    ):
        feature_count = polynomial_feature_count(
            len(request.features),
            degree,
            request.interaction_only,
        )

        if feature_count > MAX_POLYNOMIAL_TERMS:
            results.append({
                "degree": degree,
                "feature_count": feature_count,
                "mean_validation_rmse": 0.0,
                "std_validation_rmse": 0.0,
                "status": "skipped",
                "reason": (
                    f"Generates {feature_count} terms; "
                    f"limit is {MAX_POLYNOMIAL_TERMS}."
                ),
            })
            continue

        degree_request = request.model_copy(
            update={"degree": degree}
        )

        validation_errors = []
        training_errors = []

        failure_reason = None

        for train_index, validation_index in kfold.split(
            X_train
        ):
            fold_X_train = X_train[train_index]
            fold_y_train = y_train[train_index]

            fold_X_val = X_train[validation_index]
            fold_y_val = y_train[validation_index]

            pipeline = build_pipeline(degree_request)

            try:
                fit_pipeline(
                    pipeline,
                    fold_X_train,
                    fold_y_train,
                )

                train_pred = pipeline.predict(
                    fold_X_train
                )

                val_pred = pipeline.predict(
                    fold_X_val
                )

                ensure_finite(
                    train_pred,
                    "Cross-validation training predictions",
                )

                ensure_finite(
                    val_pred,
                    "Cross-validation predictions",
                )

                train_rmse = float(
                    np.sqrt(
                        mean_squared_error(
                            fold_y_train,
                            train_pred,
                        )
                    )
                )

                val_rmse = float(
                    np.sqrt(
                        mean_squared_error(
                            fold_y_val,
                            val_pred,
                        )
                    )
                )

                training_errors.append(train_rmse)
                validation_errors.append(val_rmse)

            except (HTTPException, ValueError) as exc:
                failure_reason = (
                    exc.detail
                    if isinstance(exc, HTTPException)
                    else str(exc)
                )
                break

        if failure_reason is not None:
            results.append({
                "degree": degree,
                "feature_count": feature_count,
                "mean_validation_rmse": 0.0,
                "std_validation_rmse": 0.0,
                "status": "failed",
                "reason": str(failure_reason),
            })
            continue

        mean_validation = float(
            np.mean(validation_errors)
        )

        std_validation = float(
            np.std(validation_errors)
        )

        mean_training = float(
            np.mean(training_errors)
        )

        results.append({
            "degree": degree,
            "feature_count": feature_count,
            "mean_validation_rmse": mean_validation,
            "std_validation_rmse": std_validation,
            "mean_training_rmse": mean_training,
            "status": "success",
        })

        if mean_validation < best_rmse:
            best_rmse = mean_validation
            best_degree = degree

    return {
        "status": (
            "success"
            if best_degree is not None
            else "no_valid_degree"
        ),
        "best_degree": best_degree,
        "selection_metric": "validation_rmse",
        "results": results,
        "explanation": (
            (
                f"Degree {best_degree} has the lowest "
                "mean cross-validation RMSE among "
                "successfully evaluated candidates. "
                "The final test set was not used "
                "to select this degree."
            )
            if best_degree is not None
            else (
                "No candidate degree could be "
                "evaluated successfully."
            )
        ),
        "warnings": [
            (
                "Cross-validation uses the training "
                "portion only. The selected degree "
                "should be evaluated on the untouched "
                "test set afterward."
            )
        ],
    }


# ============================================================
# PREDICT NEW USER INPUTS
# ============================================================

@app.post("/api/polynomial/predict")
def predict_polynomial_values(
    request: NewPredictionRequest,
):
    training = request.training

    result = fit_model(training)

    pipeline = result["pipeline"]

    X_rows = []

    for input_row in request.inputs:
        unknown = set(input_row) - set(
            training.features
        )

        if unknown:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Prediction contains unknown features: "
                    + ", ".join(sorted(unknown))
                ),
            )

        values = []

        for feature in training.features:
            value = parse_number(
                input_row.get(feature),
                feature,
            )

            values.append(value)

        X_rows.append(values)

    X_new = np.asarray(
        X_rows,
        dtype=float,
    )

    predictions = explain_prediction(
        pipeline,
        X_new,
        training.features,
        training.target,
    )

    return {
        "status": "success",
        "target": training.target,
        "degree": training.degree,
        "predictions": predictions,
        "warnings": (
            result["response"].get("warnings", [])
        ),
    }
