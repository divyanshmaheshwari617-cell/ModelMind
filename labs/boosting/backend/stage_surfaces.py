
import numpy as np
import pandas as pd


def build_stage_surfaces(
    pipeline,
    X_train,
    visualization,
    progression,
):
    """
    Generate real 2D prediction surfaces for saved
    scikit-learn boosting stages.

    Uses fitted staged_predict() methods.
    Does not retrain the model or fabricate predictions.

    Additional features are held at training medians.
    """

    if not visualization or not progression:
        return []

    model = pipeline.named_steps["model"]
    imputer = pipeline.named_steps["imputer"]

    if not hasattr(model, "staged_predict"):
        return []

    x_name = visualization["x_feature"]
    y_name = visualization["y_feature"]

    xs = np.asarray(
        visualization["x_values"],
        dtype=float,
    )
    ys = np.asarray(
        visualization["y_values"],
        dtype=float,
    )

    if xs.size < 2 or ys.size < 2:
        return []

    if (
        x_name not in X_train.columns
        or y_name not in X_train.columns
    ):
        return []

    xx, yy = np.meshgrid(xs, ys)

    features = list(X_train.columns)

    baseline = X_train.median(
        numeric_only=True
    ).reindex(features)

    grid = pd.DataFrame(
        np.tile(
            baseline.to_numpy(dtype=float),
            (xx.size, 1),
        ),
        columns=features,
    )

    grid[x_name] = xx.ravel()
    grid[y_name] = yy.ravel()

    transformed = imputer.transform(grid)

    wanted_stages = {
        int(item["stage"])
        for item in progression
    }

    if not wanted_stages:
        return []

    last_stage = max(wanted_stages)

    surfaces = []

    for stage, predictions in enumerate(
        model.staged_predict(transformed),
        start=1,
    ):
        if stage in wanted_stages:
            values = np.asarray(
                predictions,
                dtype=float,
            )

            if values.size != xx.size:
                raise ValueError(
                    "Staged prediction grid size mismatch."
                )

            if not np.all(np.isfinite(values)):
                raise ValueError(
                    "Staged prediction grid contains "
                    "non-finite values."
                )

            surfaces.append({
                "stage": stage,
                "x_values": xs.tolist(),
                "y_values": ys.tolist(),
                "z_values": values.reshape(
                    len(ys),
                    len(xs),
                ).tolist(),
            })

        if stage >= last_stage:
            break

    return surfaces
