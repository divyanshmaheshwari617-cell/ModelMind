
"""
ModelMind AdaBoost - Dynamic Prediction Surface API.

Allows X/Y plot axes to change without refitting AdaBoost.

The fitted model is held temporarily in server memory.
Sessions expire automatically and are not persistent.
"""

from __future__ import annotations

import secrets
import threading
import time

from collections import OrderedDict
from dataclasses import dataclass
from typing import Any, Literal

import numpy as np
import pandas as pd

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(prefix="/api", tags=["Dynamic Surfaces"])

SESSION_TTL_SECONDS = 3600
MAX_SESSIONS = 12
GRID_SIZE = 31

_lock = threading.RLock()


@dataclass
class SurfaceSession:
    pipeline: Any
    X_train: pd.DataFrame
    y_train: np.ndarray
    task: str
    numeric_features: list[str]
    classes: list[str]
    created_at: float
    expires_at: float


_sessions: OrderedDict[str, SurfaceSession] = OrderedDict()


class SurfaceRequest(BaseModel):
    session_id: str = Field(min_length=10, max_length=200)
    feature_x: str
    feature_y: str


def _cleanup_sessions() -> None:
    """Remove expired sessions while holding the lock."""

    now = time.monotonic()

    expired = [
        key
        for key, session in _sessions.items()
        if session.expires_at <= now
    ]

    for key in expired:
        _sessions.pop(key, None)

    while len(_sessions) > MAX_SESSIONS:
        _sessions.popitem(last=False)


def create_surface_session(
    *,
    pipeline: Any,
    X_train: pd.DataFrame,
    y_train: Any,
    task: Literal["classification", "regression"],
    numeric_features: list[str],
    classes: list[str],
) -> str:
    """
    Store an already-fitted AdaBoost pipeline.

    This function DOES NOT call fit().
    """

    session_id = secrets.token_urlsafe(32)
    now = time.monotonic()

    session = SurfaceSession(
        pipeline=pipeline,
        X_train=X_train.copy(deep=True),
        y_train=np.asarray(y_train).copy(),
        task=task,
        numeric_features=list(numeric_features),
        classes=[str(c) for c in classes],
        created_at=now,
        expires_at=now + SESSION_TTL_SECONDS,
    )

    with _lock:
        _cleanup_sessions()
        _sessions[session_id] = session
        _cleanup_sessions()

    return session_id


def _get_session(session_id: str) -> SurfaceSession:
    with _lock:
        _cleanup_sessions()

        session = _sessions.get(session_id)

        if session is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Model session not found or expired. "
                    "Please train the model again."
                ),
            )

        # Refresh session lifetime on use.
        session.expires_at = (
            time.monotonic() + SESSION_TTL_SECONDS
        )

        _sessions.move_to_end(session_id)

        return session


def _finite_range(
    series: pd.Series,
) -> tuple[float, float]:

    values = pd.to_numeric(
        series,
        errors="coerce",
    ).to_numpy(dtype=float)

    values = values[np.isfinite(values)]

    if len(values) == 0:
        raise HTTPException(
            status_code=422,
            detail=(
                "The selected feature has no finite "
                "numeric values."
            ),
        )

    low, high = np.percentile(
        values,
        [2, 98],
    )

    low = float(low)
    high = float(high)

    if low == high:
        padding = max(
            abs(low) * 0.1,
            0.5,
        )

    else:
        padding = max(
            (high - low) * 0.1,
            0.01,
        )

    return low - padding, high + padding


def _create_anchor(
    session: SurfaceSession,
) -> dict[str, Any]:

    anchor: dict[str, Any] = {}

    for column in session.X_train.columns:

        values = session.X_train[column].dropna()

        if column in session.numeric_features:
            numeric = pd.to_numeric(
                values,
                errors="coerce",
            )

            numeric = numeric[
                np.isfinite(numeric)
            ]

            anchor[column] = (
                float(numeric.median())
                if len(numeric)
                else 0.0
            )

        else:
            modes = values.mode()

            anchor[column] = (
                str(modes.iloc[0])
                if len(modes)
                else "missing"
            )

    return anchor


def _make_surface(
    session: SurfaceSession,
    feature_x: str,
    feature_y: str,
) -> dict[str, Any]:

    if feature_x == feature_y:
        raise HTTPException(
            status_code=422,
            detail="X and Y must be different features.",
        )

    for feature in (feature_x, feature_y):
        if feature not in session.numeric_features:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"'{feature}' must be a numeric "
                    "input feature used during training."
                ),
            )

    x_min, x_max = _finite_range(
        session.X_train[feature_x]
    )

    y_min, y_max = _finite_range(
        session.X_train[feature_y]
    )

    xx = np.linspace(
        x_min,
        x_max,
        GRID_SIZE,
    )

    yy = np.linspace(
        y_min,
        y_max,
        GRID_SIZE,
    )

    gx, gy = np.meshgrid(xx, yy)

    anchor = _create_anchor(session)

    grid = pd.DataFrame(
        [anchor.copy() for _ in range(gx.size)],
        columns=session.X_train.columns,
    )

    grid[feature_x] = gx.ravel()
    grid[feature_y] = gy.ravel()

    # This is prediction only. No model fitting.
    if session.task == "classification":

        if len(session.classes) == 2:
            probabilities = (
                session.pipeline.predict_proba(grid)
            )

            predictions = probabilities[:, 1]

            mode = "probability"

        else:
            predicted_labels = (
                session.pipeline.predict(grid)
            )

            class_lookup = {
                label: index
                for index, label in enumerate(session.classes)
            }

            predictions = np.array(
                [
                    class_lookup[str(label)]
                    for label in predicted_labels
                ],
                dtype=float,
            )

            mode = "class_index"

    else:
        predictions = np.asarray(
            session.pipeline.predict(grid),
            dtype=float,
        )

        mode = "prediction"

    z = predictions.reshape(
        GRID_SIZE,
        GRID_SIZE,
    )

    if not np.all(np.isfinite(z)):
        raise HTTPException(
            status_code=422,
            detail=(
                "The model returned non-finite "
                "surface predictions."
            ),
        )

    points = []

    for index in range(
        min(len(session.X_train), 400)
    ):
        row = session.X_train.iloc[index]

        x = row[feature_x]
        y = row[feature_y]

        if pd.isna(x) or pd.isna(y):
            continue

        x = float(x)
        y = float(y)

        if not (
            np.isfinite(x) and np.isfinite(y)
        ):
            continue

        actual = session.y_train[index]

        if isinstance(actual, np.generic):
            actual = actual.item()

        points.append({
            "x": x,
            "y": y,
            "label": (
                str(actual)
                if session.task == "classification"
                else float(actual)
            ),
        })

    return {
        "x": xx.tolist(),
        "y": yy.tolist(),
        "z": z.tolist(),
        "points": points,
        "mode": mode,
        "feature_x": feature_x,
        "feature_y": feature_y,
        "fixed_features": {
            key: value
            for key, value in anchor.items()
            if key not in (feature_x, feature_y)
        },
        "target_axis": (
            "Positive-class probability"
            if mode == "probability"
            else "Predicted class index"
            if mode == "class_index"
            else "Predicted target"
        ),
    }


@router.post("/surface")
def get_dynamic_surface(
    request: SurfaceRequest,
):
    """
    Calculate another X/Y surface from a fitted model.

    This endpoint never calls model.fit().
    """

    session = _get_session(
        request.session_id
    )

    return _make_surface(
        session=session,
        feature_x=request.feature_x,
        feature_y=request.feature_y,
    )
