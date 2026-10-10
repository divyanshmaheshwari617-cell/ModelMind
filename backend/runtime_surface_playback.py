
import numpy as np
import pandas as pd


def build_surface_playback(
    ensemble_pipeline,
    X_train,
    visualization,
    training_progression,
    task,
):
    """
    Build REAL fitted ensemble prediction surfaces
    for previously calculated playback checkpoints.

    Does not retrain models.
    Does not modify fitted estimators.
    Does not generate fabricated surfaces.

    Supports:
      - Regression
      - Classification
      - Two visualized numeric features
      - Additional numeric features fixed at train medians
      - Bootstrap feature subsets
      - Class probability aggregation
    """

    if not training_progression:
        return []

    x_feature = visualization.get("x_feature")
    y_feature = visualization.get("y_feature")

    x_values = visualization.get("x_values") or []
    y_values = visualization.get("y_values") or []

    if not x_feature or not y_feature:
        return []

    if len(x_values) < 2 or len(y_values) < 2:
        return []

    if not isinstance(X_train, pd.DataFrame):
        return []

    if x_feature not in X_train.columns:
        return []

    if y_feature not in X_train.columns:
        return []

    imputer = ensemble_pipeline.named_steps["imputer"]
    bagger = ensemble_pipeline.named_steps["model"]

    total_estimators = len(bagger.estimators_)

    if total_estimators == 0:
        return []

    # Reuse backend-provided visualization coordinates.
    # Cap resolution to keep playback lightweight.
    xs = np.asarray(x_values, dtype=float)
    ys = np.asarray(y_values, dtype=float)

    if len(xs) > 45:
        positions = np.linspace(
            0, len(xs) - 1, 45
        ).astype(int)
        xs = xs[positions]

    if len(ys) > 45:
        positions = np.linspace(
            0, len(ys) - 1, 45
        ).astype(int)
        ys = ys[positions]

    xx, yy = np.meshgrid(xs, ys)

    # Match the training feature order.
    features = list(X_train.columns)

    baselines = X_train.median(
        numeric_only=True
    ).reindex(features)

    grid = pd.DataFrame(
        np.tile(
            baselines.to_numpy(dtype=float),
            (xx.size, 1),
        ),
        columns=features,
    )

    grid[x_feature] = xx.ravel()
    grid[y_feature] = yy.ravel()

    transformed = np.asarray(
        imputer.transform(grid)
    )

    checkpoints = []
    seen = set()

    for item in training_progression:
        count = int(item["total_learners"])

        count = max(
            1,
            min(count, total_estimators),
        )

        if count not in seen:
            seen.add(count)
            checkpoints.append(count)

    if not checkpoints:
        return []

    maximum = max(checkpoints)
    output = []

    # Incremental accumulation allows checkpoints
    # to reuse predictions from earlier learners.
    regression_sum = None
    classification_sum = None

    global_classes = (
        np.asarray(bagger.classes_)
        if task == "classification"
        else None
    )

    for index in range(maximum):

        estimator = bagger.estimators_[index]

        selected_features = (
            bagger.estimators_features_[index]
        )

        learner_input = transformed[
            :, selected_features
        ]

        if task == "regression":

            prediction = np.asarray(
                estimator.predict(learner_input),
                dtype=float,
            )

            if regression_sum is None:
                regression_sum = np.zeros_like(
                    prediction,
                    dtype=float,
                )

            regression_sum += prediction

        else:

            class_count = len(global_classes)

            probabilities = np.zeros(
                (len(grid), class_count),
                dtype=float,
            )

            if hasattr(estimator, "predict_proba"):

                learner_probabilities = (
                    estimator.predict_proba(
                        learner_input
                    )
                )

                for local_index, class_label in enumerate(
                    estimator.classes_
                ):
                    matches = np.flatnonzero(
                        global_classes == class_label
                    )

                    if matches.size:
                        probabilities[
                            :, matches[0]
                        ] = learner_probabilities[
                            :, local_index
                        ]

            else:

                predicted = estimator.predict(
                    learner_input
                )

                for class_index, class_label in enumerate(
                    global_classes
                ):
                    probabilities[
                        :, class_index
                    ] = (
                        predicted == class_label
                    ).astype(float)

            if classification_sum is None:
                classification_sum = np.zeros_like(
                    probabilities
                )

            classification_sum += probabilities

        count = index + 1

        if count not in seen:
            continue

        if task == "regression":
            values = regression_sum / count

        else:
            averaged_probabilities = (
                classification_sum / count
            )

            # Numeric indices represent classes
            # on the Plotly height/color axis.
            values = np.argmax(
                averaged_probabilities,
                axis=1,
            ).astype(float)

        output.append({
            "total_learners": count,
            "x_values": xs.tolist(),
            "y_values": ys.tolist(),
            "z_values": values.reshape(
                len(ys),
                len(xs),
            ).tolist(),
        })

    return output
