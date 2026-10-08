
from __future__ import annotations

from collections import Counter
from typing import Literal

import numpy as np
from pydantic import BaseModel, Field
from sklearn.base import BaseEstimator, TransformerMixin


ImputationMethod = Literal[
    "mean",
    "median",
    "most_frequent",
    "constant",
    "drop",
]


class ColumnImputation(BaseModel):
    method: ImputationMethod = "median"
    fill_value: float | None = None


class PreprocessingConfig(BaseModel):
    feature_strategies: dict[str, ColumnImputation] = Field(
        default_factory=dict
    )
    default_strategy: Literal[
        "mean",
        "median",
        "most_frequent",
    ] = "median"


class NumericImputer(BaseEstimator, TransformerMixin):
    """
    Learns missing-value replacements from training data.

    During transform, applies the same replacements to
    validation, test, and prediction datasets.
    """

    def __init__(
        self,
        feature_names: list[str],
        config: PreprocessingConfig | None = None,
    ):
        self.feature_names = feature_names
        self.config = config

    def fit(self, X, y=None):
        data = np.asarray(X, dtype=float)

        if data.ndim != 2:
            raise ValueError("Expected a 2D feature matrix.")

        if data.shape[1] != len(self.feature_names):
            raise ValueError(
                "Feature count does not match feature names."
            )

        config = self.config or PreprocessingConfig()

        self.fill_values_ = []
        self.statistics_ = {}

        for index, name in enumerate(self.feature_names):
            values = data[:, index]
            observed = values[np.isfinite(values)]

            strategy = config.feature_strategies.get(name)

            if strategy is None:
                method = config.default_strategy
                constant = None
            else:
                method = strategy.method
                constant = strategy.fill_value

            if method == "drop":
                raise ValueError(
                    f"{name}: row dropping must happen before fitting."
                )

            if method == "constant":
                if constant is None or not np.isfinite(constant):
                    raise ValueError(
                        f"{name}: provide a finite constant."
                    )

                replacement = float(constant)

            elif len(observed) == 0:
                raise ValueError(
                    f"{name}: no observed values in training data. "
                    "Choose a constant or remove the feature."
                )

            elif method == "mean":
                replacement = float(np.mean(observed))

            elif method == "median":
                replacement = float(np.median(observed))

            elif method == "most_frequent":
                counts = Counter(observed.tolist())
                replacement = float(
                    sorted(
                        counts.items(),
                        key=lambda item: (-item[1], item[0]),
                    )[0][0]
                )

            else:
                raise ValueError(
                    f"Unsupported imputation method: {method}"
                )

            self.fill_values_.append(replacement)

            self.statistics_[name] = {
                "method": method,
                "fill_value": replacement,
                "training_missing_count": int(
                    np.isnan(values).sum()
                ),
            }

        self.fill_values_ = np.asarray(
            self.fill_values_,
            dtype=float,
        )

        return self

    def transform(self, X):
        if not hasattr(self, "fill_values_"):
            raise ValueError("Imputer must be fitted first.")

        data = np.asarray(X, dtype=float).copy()

        if data.ndim != 2:
            raise ValueError("Expected a 2D feature matrix.")

        if data.shape[1] != len(self.fill_values_):
            raise ValueError("Unexpected number of features.")

        for index, replacement in enumerate(self.fill_values_):
            missing = np.isnan(data[:, index])
            data[missing, index] = replacement

        if not np.all(np.isfinite(data)):
            raise ValueError(
                "Imputation produced invalid numeric values."
            )

        return data
