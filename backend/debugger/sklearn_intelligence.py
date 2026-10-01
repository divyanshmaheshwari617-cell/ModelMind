import re


# ============================================================
# PUBLIC ENTRY POINT
# ============================================================

def analyze_sklearn_problem(
    *,
    error_type: str,
    message: str,
    code: str,
    level: str,
) -> dict | None:

    level = normalize_level(level)
    lower = message.lower()

    handlers = (
        analyze_not_fitted,
        analyze_inconsistent_samples,
        analyze_feature_count_mismatch,
        analyze_expected_2d,
        analyze_expected_1d,
        analyze_single_class,
        analyze_small_class,
        analyze_unknown_label_type,
        analyze_continuous_target,
        analyze_invalid_parameter,
        analyze_cross_validation_splits,
        analyze_split_size,
        analyze_convergence,
        analyze_undefined_metric,
    )

    for handler in handlers:
        result = handler(
            error_type=error_type,
            message=message,
            lower=lower,
            code=code,
            level=level,
        )

        if result is not None:
            return result

    return None


# ============================================================
# COMMON HELPERS
# ============================================================

def normalize_level(level: str | None) -> str:
    value = (level or "basic").strip().lower()

    if value in {"medium", "intermediate"}:
        return "medium"

    if value in {"advanced", "expert"}:
        return "advanced"

    return "basic"


def result(
    *,
    problem: str,
    explanation: str,
    why: str,
    recommendation: str,
    code_example: str,
    level: str,
    confidence: float = 0.95,
    warnings: list[str] | None = None,
) -> dict:

    return {
        "handled": True,
        "source": "modelmind-local",
        "category": "scikit-learn",
        "problem": problem,
        "level": level,
        "confidence": confidence,
        "explanation": explanation,
        "why": why,
        "recommendation": recommendation,
        "code_example": code_example,
        "warnings": warnings or [],
        "safe_to_apply": False,
    }


# ============================================================
# NOT FITTED
# ============================================================

def analyze_not_fitted(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        error_type.endswith("NotFittedError")
        or "notfittederror" in error_type.lower()
        or "not fitted yet" in lower
        or "is not fitted" in lower
        or "instance is not fitted" in lower
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "You are asking the model to make a prediction before "
            "it has learned from the training data."
        )
        why = (
            "In scikit-learn, fit() teaches the model. predict() "
            "uses what the model learned."
        )
        recommendation = (
            "Call fit() before predict()."
        )
        code_example = (
            "model.fit(X_train, y_train)\n"
            "predictions = model.predict(X_test)"
        )

    elif level == "medium":
        explanation = (
            "The estimator has not been fitted before a method that "
            "requires learned parameters was called."
        )
        why = (
            "Methods such as predict(), transform() and score() usually "
            "depend on attributes learned during fit()."
        )
        recommendation = (
            "Verify the training sequence and ensure the same fitted "
            "estimator is used for evaluation."
        )
        code_example = (
            "model.fit(X_train, y_train)\n"
            "\n"
            "y_pred = model.predict(X_test)\n"
            "score = model.score(X_test, y_test)"
        )

    else:
        explanation = (
            "An estimator method requiring fitted state was called "
            "before the estimator established its learned attributes."
        )
        why = (
            "scikit-learn estimators create fitted attributes during "
            "fit(). A fresh estimator instance or incorrect pipeline "
            "execution can therefore produce this failure."
        )
        recommendation = (
            "Keep preprocessing and the estimator in a Pipeline so "
            "fitted state remains consistent across training and inference."
        )
        code_example = (
            "from sklearn.pipeline import Pipeline\n"
            "from sklearn.preprocessing import StandardScaler\n"
            "from sklearn.linear_model import LogisticRegression\n"
            "\n"
            "pipeline = Pipeline([\n"
            '    ("scaler", StandardScaler()),\n'
            '    ("model", LogisticRegression()),\n'
            "])\n"
            "\n"
            "pipeline.fit(X_train, y_train)\n"
            "y_pred = pipeline.predict(X_test)"
        )

    return result(
        problem="Estimator has not been fitted",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.99,
    )


# ============================================================
# INCONSISTENT SAMPLE COUNTS
# ============================================================

def analyze_inconsistent_samples(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    if "inconsistent numbers of samples" not in lower:
        return None

    numbers = re.findall(r"\d+", message)

    counts = ", ".join(numbers[-2:]) if len(numbers) >= 2 else None

    if level == "basic":
        explanation = (
            "Your features and answers do not contain the same number "
            "of rows."
        )
        why = (
            f"scikit-learn found sample counts such as {counts}. "
            if counts
            else ""
        ) + (
            "Each training row in X needs one matching target value in y."
        )
        recommendation = (
            "Print the lengths of X and y and find where they became different."
        )
        code_example = (
            'print("X rows:", len(X))\n'
            'print("y rows:", len(y))'
        )

    elif level == "medium":
        explanation = (
            "X and y have inconsistent sample counts."
        )
        why = (
            "This often happens when X and y are filtered, dropped or "
            "sliced independently."
        )
        recommendation = (
            "Create X and y from the same cleaned DataFrame so row "
            "alignment is preserved."
        )
        code_example = (
            'clean = df.dropna(subset=["Age", "Income", "Target"])\n'
            "\n"
            'X = clean[["Age", "Income"]]\n'
            'y = clean["Target"]\n'
            "\n"
            "print(X.shape, y.shape)"
        )

    else:
        explanation = (
            "The estimator received feature and target containers with "
            "different numbers of observations."
        )
        why = (
            "Independent filtering or index misalignment can violate "
            "the one-sample-to-one-target invariant."
        )
        recommendation = (
            "Preserve row identity through preprocessing and derive X "
            "and y from the same aligned dataset."
        )
        code_example = (
            'required = ["Age", "Income", "Target"]\n'
            "clean = df[required].dropna().copy()\n"
            "\n"
            'X = clean[["Age", "Income"]]\n'
            'y = clean["Target"]\n'
            "\n"
            "assert len(X) == len(y)"
        )

    return result(
        problem="X and y have different sample counts",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.99,
    )


# ============================================================
# FEATURE COUNT MISMATCH
# ============================================================

def analyze_feature_count_mismatch(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        "features, but" in lower
        and (
            "expecting" in lower
            or "expects" in lower
            or "is expecting" in lower
        )
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "The model was trained with one number of input columns, "
            "but you are now giving it a different number."
        )
        why = (
            "The features used during prediction must match the features "
            "used during training."
        )
        recommendation = (
            "Use the same columns, in the same order, for training "
            "and prediction."
        )
        code_example = (
            'features = ["Age", "Income", "Score"]\n'
            "\n"
            "model.fit(X_train[features], y_train)\n"
            "predictions = model.predict(X_test[features])"
        )

    elif level == "medium":
        explanation = (
            "The prediction feature matrix does not match the feature "
            "dimensionality learned during fit()."
        )
        why = (
            "A column may have been added, removed, encoded differently "
            "or selected in a different order."
        )
        recommendation = (
            "Define one feature schema and reuse it for both train and test data."
        )
        code_example = (
            'features = ["Age", "Income", "Score"]\n'
            "\n"
            "X_train = train_df[features]\n"
            "X_test = test_df[features]\n"
            "\n"
            "model.fit(X_train, y_train)\n"
            "y_pred = model.predict(X_test)"
        )

    else:
        explanation = (
            "Inference input violates the feature-space contract "
            "established during estimator fitting."
        )
        why = (
            "Independent preprocessing can create train/inference schema "
            "drift, especially after categorical encoding."
        )
        recommendation = (
            "Encapsulate preprocessing and estimation in one Pipeline "
            "and preserve named feature transformations."
        )
        code_example = (
            "pipeline.fit(X_train, y_train)\n"
            "\n"
            "# The same fitted preprocessing is automatically reused.\n"
            "y_pred = pipeline.predict(X_test)"
        )

    return result(
        problem="Feature count mismatch",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.98,
    )


# ============================================================
# EXPECTED 2D
# ============================================================

def analyze_expected_2d(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    if not (
        "expected 2d array" in lower
        and "got 1d array" in lower
    ):
        return None

    if level == "basic":
        explanation = (
            "The model expects data arranged as rows and columns, "
            "but it received only one line of values."
        )
        why = (
            "scikit-learn usually expects X to have the shape "
            "(number of samples, number of features)."
        )
        recommendation = (
            "If you have one feature, reshape it into one column."
        )
        code_example = (
            "X = X.reshape(-1, 1)\n"
            "\n"
            'print("New shape:", X.shape)'
        )

    elif level == "medium":
        explanation = (
            "X is one-dimensional, while the estimator expects a "
            "two-dimensional feature matrix."
        )
        why = (
            "A single feature still needs the shape (n_samples, 1)."
        )
        recommendation = (
            "Inspect X.shape. With Pandas, select a DataFrame rather "
            "than a Series when X contains one feature."
        )
        code_example = (
            "# Pandas\n"
            'X = df[["Age"]]\n'
            "\n"
            "# NumPy alternative\n"
            "X = X.reshape(-1, 1)\n"
            "\n"
            "print(X.shape)"
        )

    else:
        explanation = (
            "The estimator's input validation received a rank-1 array "
            "where a rank-2 feature matrix was required."
        )
        why = (
            "The estimator API expects X with shape "
            "(n_samples, n_features)."
        )
        recommendation = (
            "Preserve the two-dimensional feature schema at the data "
            "boundary rather than repeatedly reshaping downstream."
        )
        code_example = (
            'feature_columns = ["Age"]\n'
            "X = df.loc[:, feature_columns]\n"
            "\n"
            "assert X.ndim == 2\n"
            "model.fit(X, y)"
        )

    return result(
        problem="Model expected a 2D feature matrix",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.99,
    )


# ============================================================
# EXPECTED 1D TARGET
# ============================================================

def analyze_expected_1d(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        "y should be a 1d array" in lower
        or "column-vector y was passed" in lower
        or "expected 1d array" in lower and "y" in lower
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "Your target y should normally be one column of answers, "
            "not a table containing an extra dimension."
        )
        why = (
            "Many scikit-learn models expect y to look like "
            "[0, 1, 0, 1] rather than [[0], [1], [0], [1]]."
        )
        recommendation = (
            "Select the target as one Series."
        )
        code_example = (
            'y = df["Target"]\n'
            "\n"
            "print(y.shape)"
        )

    elif level == "medium":
        explanation = (
            "The estimator expects a one-dimensional target vector."
        )
        why = (
            "Selecting df[['Target']] creates a two-dimensional DataFrame, "
            "while df['Target'] creates a Series."
        )
        recommendation = (
            "Use a one-dimensional target unless the estimator explicitly "
            "supports multi-output prediction."
        )
        code_example = (
            'X = df[["Age", "Income"]]\n'
            'y = df["Target"]\n'
            "\n"
            "model.fit(X, y)"
        )

    else:
        explanation = (
            "The target representation does not satisfy the estimator's "
            "expected output dimensionality."
        )
        why = (
            "A shape of (n_samples, 1) and (n_samples,) can represent "
            "similar information but have different estimator semantics."
        )
        recommendation = (
            "Define the target contract explicitly and only flatten y "
            "when the learning task is truly single-output."
        )
        code_example = (
            'y = df.loc[:, "Target"]\n'
            "\n"
            "assert y.ndim == 1\n"
            "model.fit(X, y)"
        )

    return result(
        problem="Target y has the wrong shape",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.96,
    )


# ============================================================
# SINGLE CLASS
# ============================================================

def analyze_single_class(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    indicators = (
        "only one class",
        "needs samples of at least 2 classes",
        "greater than one",
        "at least 2 classes",
    )

    if not any(item in lower for item in indicators):
        return None

    if level == "basic":
        explanation = (
            "Your classification training data contains only one class."
        )
        why = (
            "A classifier needs examples from at least two classes so "
            "it can learn the difference between them."
        )
        recommendation = (
            "Check the target values before training."
        )
        code_example = (
            "print(y.value_counts())\n"
            "print(y.unique())"
        )

    elif level == "medium":
        explanation = (
            "The training target contains insufficient class diversity."
        )
        why = (
            "Filtering or splitting may have left the training subset "
            "with only one class."
        )
        recommendation = (
            "Inspect class counts before and after splitting and use "
            "stratification when appropriate."
        )
        code_example = (
            "print(y.value_counts())\n"
            "\n"
            "X_train, X_test, y_train, y_test = train_test_split(\n"
            "    X,\n"
            "    y,\n"
            "    test_size=0.2,\n"
            "    random_state=42,\n"
            "    stratify=y,\n"
            ")"
        )

    else:
        explanation = (
            "The classifier's optimization problem is undefined because "
            "the training subset does not contain multiple target classes."
        )
        why = (
            "This can result from severe imbalance, filtering, unsuitable "
            "split logic or an incorrectly constructed target."
        )
        recommendation = (
            "Validate class support before splitting and use stratified "
            "resampling only when every class has enough observations."
        )
        code_example = (
            "class_counts = y.value_counts()\n"
            "print(class_counts)\n"
            "\n"
            "if len(class_counts) < 2:\n"
            '    raise ValueError("Classification requires at least two classes.")'
        )

    return result(
        problem="Training data contains only one class",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.98,
    )


# ============================================================
# CLASS TOO SMALL FOR STRATIFICATION
# ============================================================

def analyze_small_class(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    if not (
        "least populated class" in lower
        and "member" in lower
    ):
        return None

    if level == "basic":
        explanation = (
            "One of your classes has too few examples to split safely."
        )
        why = (
            "For example, if a class has only one row, it cannot be "
            "represented properly in both training and testing data."
        )
        recommendation = (
            "Check how many examples belong to each class."
        )
        code_example = (
            "print(y.value_counts())"
        )

    elif level == "medium":
        explanation = (
            "Stratified splitting cannot preserve a class that has too "
            "few observations."
        )
        why = (
            "Every class needs sufficient support for the requested split."
        )
        recommendation = (
            "Inspect class frequencies and reconsider the split or dataset."
        )
        code_example = (
            "class_counts = y.value_counts()\n"
            "print(class_counts)\n"
            "\n"
            'rare_classes = class_counts[class_counts < 2]\n'
            'print("Too small:", rare_classes)'
        )

    else:
        explanation = (
            "The requested stratified partition is infeasible because "
            "at least one target class lacks sufficient support."
        )
        why = (
            "Stratification imposes representation constraints on every "
            "class across the resulting partitions."
        )
        recommendation = (
            "Validate minimum class support before resampling. Do not "
            "silently duplicate observations merely to satisfy the splitter."
        )
        code_example = (
            "class_counts = y.value_counts()\n"
            "\n"
            "if class_counts.min() < 2:\n"
            '    raise ValueError("Insufficient class support for stratification.")'
        )

    return result(
        problem="A class has too few samples",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.98,
    )


# ============================================================
# UNKNOWN LABEL TYPE
# ============================================================

def analyze_unknown_label_type(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    if "unknown label type" not in lower:
        return None

    if level == "basic":
        explanation = (
            "The classifier does not understand the values in your target column."
        )
        why = (
            "Your target may contain an unexpected mixture of values or "
            "may not represent categories correctly."
        )
        recommendation = (
            "Print the target values and check what the model is trying to predict."
        )
        code_example = (
            "print(y.dtype)\n"
            "print(y.unique())"
        )

    elif level == "medium":
        explanation = (
            "scikit-learn cannot interpret the target representation as "
            "a supported classification label type."
        )
        why = (
            "The target may contain mixed types, malformed labels or "
            "continuous values."
        )
        recommendation = (
            "Inspect the target dtype and unique values before deciding "
            "whether this is classification or regression."
        )
        code_example = (
            "print(y.dtype)\n"
            "print(y.nunique())\n"
            "print(y.value_counts(dropna=False))"
        )

    else:
        explanation = (
            "Target-type inference failed because y does not satisfy a "
            "supported classification target representation."
        )
        why = (
            "The target contract may disagree with the selected estimator."
        )
        recommendation = (
            "Determine the statistical learning task from the target "
            "semantics before encoding or coercing y."
        )
        code_example = (
            "from sklearn.utils.multiclass import type_of_target\n"
            "\n"
            "print(type_of_target(y))"
        )

    return result(
        problem="Unsupported classification target",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.94,
    )


# ============================================================
# CONTINUOUS TARGET USED WITH CLASSIFIER
# ============================================================

def analyze_continuous_target(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        "continuous" in lower
        and (
            "target" in lower
            or "classifier" in lower
            or "classification" in lower
        )
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "You appear to be using a classification model for a target "
            "that contains continuous numbers."
        )
        why = (
            "Classification predicts categories such as Pass/Fail. "
            "Regression predicts numerical values such as price or score."
        )
        recommendation = (
            "If the target is a real numerical quantity, use a regression model."
        )
        code_example = (
            "from sklearn.linear_model import LinearRegression\n"
            "\n"
            "model = LinearRegression()\n"
            "model.fit(X_train, y_train)"
        )

    elif level == "medium":
        explanation = (
            "The selected estimator expects categorical class labels, "
            "but y appears continuous."
        )
        why = (
            "The estimator family does not match the target type."
        )
        recommendation = (
            "Determine whether the problem is genuinely classification "
            "or regression before choosing the estimator."
        )
        code_example = (
            "print(y.dtype)\n"
            "print(y.nunique())\n"
            "\n"
            "# Continuous target -> consider a regressor"
        )

    else:
        explanation = (
            "Estimator semantics and target semantics are inconsistent: "
            "a classifier received a continuous target."
        )
        why = (
            "Arbitrarily converting continuous targets into integer labels "
            "would change the learning problem rather than fix it."
        )
        recommendation = (
            "Choose the estimator from the target's real-world semantics. "
            "Only discretize a continuous target when the domain problem "
            "explicitly requires categorical outcomes."
        )
        code_example = (
            "from sklearn.utils.multiclass import type_of_target\n"
            "\n"
            "target_type = type_of_target(y)\n"
            "print(target_type)"
        )

    return result(
        problem="Classifier received a continuous target",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.94,
    )


# ============================================================
# INVALID PARAMETER
# ============================================================

def analyze_invalid_parameter(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        "invalid parameter" in lower
        or "parameter of" in lower and "must be" in lower
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "One of the model settings has an invalid name or value."
        )
        why = (
            "Machine-learning models only accept specific parameters "
            "and allowed values."
        )
        recommendation = (
            "Print the model parameters and check the setting you used."
        )
        code_example = (
            "print(model.get_params())"
        )

    elif level == "medium":
        explanation = (
            "The estimator rejected a hyperparameter name or value."
        )
        why = (
            "The parameter may be misspelled, unsupported by this model "
            "or outside its allowed range."
        )
        recommendation = (
            "Inspect get_params() and validate the parameter before tuning."
        )
        code_example = (
            "params = model.get_params()\n"
            "print(params.keys())"
        )

    else:
        explanation = (
            "Estimator parameter validation failed."
        )
        why = (
            "The configured hyperparameter does not satisfy the estimator's "
            "declared parameter constraints or nested parameter namespace."
        )
        recommendation = (
            "Validate estimator parameters before search. For Pipeline "
            "parameters, remember the step__parameter naming convention."
        )
        code_example = (
            "print(model.get_params(deep=True))\n"
            "\n"
            "# Pipeline example:\n"
            'params = {"model__C": [0.1, 1.0, 10.0]}'
        )

    return result(
        problem="Invalid model parameter",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.93,
    )


# ============================================================
# CROSS-VALIDATION SPLITS
# ============================================================

def analyze_cross_validation_splits(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    if not (
        "n_splits" in lower
        and (
            "greater than" in lower
            or "cannot be greater" in lower
        )
    ):
        return None

    if level == "basic":
        explanation = (
            "You asked for more cross-validation groups than your data can support."
        )
        why = (
            "Each fold needs enough data to create a valid split."
        )
        recommendation = (
            "Use fewer folds or more training examples."
        )
        code_example = (
            "from sklearn.model_selection import cross_val_score\n"
            "\n"
            "scores = cross_val_score(model, X, y, cv=3)"
        )

    elif level == "medium":
        explanation = (
            "The requested number of cross-validation folds exceeds "
            "the available sample or class support."
        )
        why = (
            "Cross-validation needs sufficient observations in each fold."
        )
        recommendation = (
            "Choose cv according to dataset size and, for classification, "
            "the smallest class count."
        )
        code_example = (
            "print(len(X))\n"
            "print(y.value_counts())\n"
            "\n"
            "# Choose cv only after checking available support."
        )

    else:
        explanation = (
            "The requested cross-validation partition violates the "
            "splitter's sample-support constraints."
        )
        why = (
            "For stratified CV, class support can be more restrictive "
            "than total dataset size."
        )
        recommendation = (
            "Derive the fold count from the resampling strategy and "
            "minimum class support rather than using an arbitrary cv value."
        )
        code_example = (
            "minimum_class_support = y.value_counts().min()\n"
            "cv = min(5, int(minimum_class_support))\n"
            "\n"
            'print("Using cv =", cv)'
        )

    return result(
        problem="Too many cross-validation folds",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.96,
    )


# ============================================================
# INVALID TRAIN/TEST SIZE
# ============================================================

def analyze_split_size(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        "test_size" in lower
        or "train_size" in lower
    ) and (
        "should be" in lower
        or "must be" in lower
        or "resulting train set will be empty" in lower
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "The training/testing split size is not valid."
        )
        why = (
            "For example, test_size=0.2 means 20% of the data goes "
            "to the test set."
        )
        recommendation = (
            "Use a valid fraction such as 0.2 for a normal 80/20 split."
        )
        code_example = (
            "X_train, X_test, y_train, y_test = train_test_split(\n"
            "    X,\n"
            "    y,\n"
            "    test_size=0.2,\n"
            "    random_state=42,\n"
            ")"
        )

    elif level == "medium":
        explanation = (
            "train_test_split cannot create the requested partitions."
        )
        why = (
            "The requested fraction or number of samples leaves an "
            "invalid training or test subset."
        )
        recommendation = (
            "Choose train_size/test_size according to the dataset size "
            "and class distribution."
        )
        code_example = (
            "print(len(X))\n"
            "\n"
            "X_train, X_test, y_train, y_test = train_test_split(\n"
            "    X, y, test_size=0.2, random_state=42\n"
            ")"
        )

    else:
        explanation = (
            "The requested holdout configuration violates the splitter's "
            "partition-size constraints."
        )
        why = (
            "A valid split must leave sufficient observations for both "
            "training and evaluation, and stratification may impose "
            "additional class constraints."
        )
        recommendation = (
            "Validate absolute partition sizes and class support before "
            "constructing the holdout."
        )
        code_example = (
            "n_samples = len(X)\n"
            "test_fraction = 0.2\n"
            "expected_test = int(n_samples * test_fraction)\n"
            "\n"
            "print(n_samples, expected_test)"
        )

    return result(
        problem="Invalid train/test split size",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.96,
    )


# ============================================================
# CONVERGENCE WARNING
# ============================================================

def analyze_convergence(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        error_type == "ConvergenceWarning"
        or "failed to converge" in lower
        or "convergencewarning" in lower
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "The model stopped before it fully finished learning."
        )
        why = (
            "It may need more training iterations, or the features may "
            "have very different scales."
        )
        recommendation = (
            "Check feature scaling first, then consider increasing max_iter."
        )
        code_example = (
            "from sklearn.preprocessing import StandardScaler\n"
            "\n"
            "scaler = StandardScaler()\n"
            "X_scaled = scaler.fit_transform(X)"
        )

    elif level == "medium":
        explanation = (
            "The optimization algorithm did not satisfy its convergence "
            "criterion within the allowed iterations."
        )
        why = (
            "Common causes include unscaled features, insufficient "
            "max_iter or difficult optimization geometry."
        )
        recommendation = (
            "Scale the features correctly using training data, inspect "
            "the solver and only then increase max_iter if needed."
        )
        code_example = (
            "scaler = StandardScaler()\n"
            "X_train_scaled = scaler.fit_transform(X_train)\n"
            "X_test_scaled = scaler.transform(X_test)\n"
            "\n"
            "model.set_params(max_iter=1000)"
        )

    else:
        explanation = (
            "The estimator's optimizer terminated before meeting its "
            "configured convergence tolerance."
        )
        why = (
            "Potential causes include poor conditioning, feature-scale "
            "differences, unsuitable solver configuration, regularization "
            "interaction or insufficient iteration budget."
        )
        recommendation = (
            "Use a Pipeline for leakage-safe scaling, inspect solver and "
            "tolerance settings, and treat increasing max_iter as a "
            "diagnostic step rather than an automatic fix."
        )
        code_example = (
            "from sklearn.pipeline import Pipeline\n"
            "from sklearn.preprocessing import StandardScaler\n"
            "from sklearn.linear_model import LogisticRegression\n"
            "\n"
            "pipeline = Pipeline([\n"
            '    ("scaler", StandardScaler()),\n'
            '    ("model", LogisticRegression(max_iter=1000)),\n'
            "])\n"
            "\n"
            "pipeline.fit(X_train, y_train)"
        )

    return result(
        problem="Model did not converge",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.94,
        warnings=[
            "Increasing max_iter alone may hide the real cause.",
        ],
    )


# ============================================================
# UNDEFINED METRIC
# ============================================================

def analyze_undefined_metric(
    *,
    error_type: str,
    message: str,
    lower: str,
    code: str,
    level: str,
) -> dict | None:

    detected = (
        error_type == "UndefinedMetricWarning"
        or "undefinedmetricwarning" in lower
        or "is ill-defined and being set to 0.0" in lower
    )

    if not detected:
        return None

    if level == "basic":
        explanation = (
            "One of your evaluation metrics cannot be calculated properly."
        )
        why = (
            "For example, the model may never predict one of the classes."
        )
        recommendation = (
            "Look at the real and predicted class counts before ignoring "
            "the warning."
        )
        code_example = (
            "print(y_test.value_counts())\n"
            "\n"
            "from collections import Counter\n"
            "print(Counter(y_pred))"
        )

    elif level == "medium":
        explanation = (
            "Precision, recall or F1 is undefined for at least one class."
        )
        why = (
            "The relevant denominator is zero, often because a class "
            "has no predicted samples or no true samples."
        )
        recommendation = (
            "Inspect the confusion matrix and class distribution before "
            "using zero_division to suppress the warning."
        )
        code_example = (
            "from sklearn.metrics import confusion_matrix, classification_report\n"
            "\n"
            "print(confusion_matrix(y_test, y_pred))\n"
            "print(classification_report(y_test, y_pred))"
        )

    else:
        explanation = (
            "A classification metric is mathematically undefined for "
            "one or more labels under the current predictions."
        )
        why = (
            "The warning reflects a zero denominator and can reveal "
            "class imbalance, threshold behavior or complete failure "
            "to predict a class."
        )
        recommendation = (
            "Diagnose per-class support and the confusion matrix before "
            "choosing averaging behavior or zero_division handling."
        )
        code_example = (
            "from sklearn.metrics import classification_report\n"
            "\n"
            "report = classification_report(\n"
            "    y_test,\n"
            "    y_pred,\n"
            "    output_dict=True,\n"
            "    zero_division=0,\n"
            ")\n"
            "\n"
            "print(report)"
        )

    return result(
        problem="Classification metric is undefined",
        explanation=explanation,
        why=why,
        recommendation=recommendation,
        code_example=code_example,
        level=level,
        confidence=0.95,
        warnings=[
            "Do not suppress the warning before understanding why the metric is undefined.",
        ],
    )