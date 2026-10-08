
import numpy as np

from backend.ml.preprocessing import (
    NumericImputer,
    PreprocessingConfig,
    ColumnImputation,
)


def test_training_only_median():
    train = np.array([
        [10.0],
        [20.0],
        [np.nan],
        [30.0],
    ])

    test = np.array([
        [np.nan],
        [10000.0],
    ])

    imputer = NumericImputer(
        feature_names=["age"],
        config=PreprocessingConfig(
            default_strategy="median"
        ),
    )

    imputer.fit(train)

    transformed = imputer.transform(test)

    assert transformed[0, 0] == 20.0
    assert transformed[1, 0] == 10000.0
    assert imputer.statistics_["age"]["fill_value"] == 20.0


def test_constant_strategy():
    train = np.array([
        [1.0],
        [np.nan],
        [3.0],
    ])

    imputer = NumericImputer(
        feature_names=["experience"],
        config=PreprocessingConfig(
            feature_strategies={
                "experience": ColumnImputation(
                    method="constant",
                    fill_value=0,
                )
            }
        ),
    )

    imputer.fit(train)

    result = imputer.transform(train)

    assert result[1, 0] == 0.0


def test_multiple_features():
    train = np.array([
        [10.0, 100.0],
        [20.0, np.nan],
        [np.nan, 300.0],
    ])

    imputer = NumericImputer(
        feature_names=["age", "salary"],
        config=PreprocessingConfig(
            default_strategy="mean"
        ),
    )

    result = imputer.fit_transform(train)

    assert result[2, 0] == 15.0
    assert result[1, 1] == 200.0


if __name__ == "__main__":
    test_training_only_median()
    test_constant_strategy()
    test_multiple_features()

    print("ALL PREPROCESSING TESTS PASSED")
