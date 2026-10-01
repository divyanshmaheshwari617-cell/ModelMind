from __future__ import annotations

import ast
from typing import Any


VALID_LEVELS = {
    "basic",
    "medium",
    "advanced",
}


LEVEL_ALIASES = {
    "beginner": "basic",
    "basic": "basic",
    "intermediate": "medium",
    "medium": "medium",
    "advanced": "advanced",
    "expert": "advanced",
}


# ============================================================
# PUBLIC API
# ============================================================


def explain_code(
    code: str,
    level: str = "Basic",
) -> dict[str, Any]:
    """
    ModelMind deterministic local Code Explainer.

    This function performs static AST analysis.
    It does NOT execute the user's code.
    """

    normalized_level = normalize_level(level)

    if not code.strip():
        return make_empty_result(
            normalized_level,
            "There is no code to explain.",
        )

    try:
        tree = ast.parse(code)
    except SyntaxError as error:
        return {
            "handled": False,
            "source": "modelmind-local",
            "engine": "code-explainer",
            "level": normalized_level,
            "parse_success": False,
            "summary":
                "ModelMind could not fully explain this code "
                "because Python could not parse it.",
            "purpose": "",
            "steps": [],
            "concepts": [],
            "variables": [],
            "libraries": [],
            "ml_flow": [],
            "advanced_notes": [],
            "warnings": [
                {
                    "title": "Python syntax problem",
                    "message": (
                        f"{error.msg}"
                        + (
                            f" near line {error.lineno}."
                            if error.lineno
                            else "."
                        )
                    ),
                }
            ],
            "confidence": 0.99,
        }

    analyzer = CodeAnalyzer(
        code=code,
        tree=tree,
        level=normalized_level,
    )

    return analyzer.analyze()


# ============================================================
# LEVEL
# ============================================================


def normalize_level(level: str) -> str:
    value = str(level or "").strip().lower()

    return LEVEL_ALIASES.get(
        value,
        "basic",
    )


# ============================================================
# EMPTY RESULT
# ============================================================


def make_empty_result(
    level: str,
    message: str,
) -> dict[str, Any]:
    return {
        "handled": True,
        "source": "modelmind-local",
        "engine": "code-explainer",
        "level": level,
        "parse_success": True,
        "summary": message,
        "purpose": "",
        "steps": [],
        "concepts": [],
        "variables": [],
        "libraries": [],
        "ml_flow": [],
        "advanced_notes": [],
        "warnings": [],
        "confidence": 1.0,
    }


# ============================================================
# CODE ANALYZER
# ============================================================


class CodeAnalyzer:
    def __init__(
        self,
        code: str,
        tree: ast.AST,
        level: str,
    ) -> None:
        self.code = code
        self.tree = tree
        self.level = level

        self.steps: list[dict[str, Any]] = []
        self.concepts: list[dict[str, Any]] = []
        self.variables: list[dict[str, Any]] = []
        self.libraries: list[dict[str, Any]] = []
        self.ml_flow: list[dict[str, Any]] = []
        self.advanced_notes: list[dict[str, Any]] = []
        self.warnings: list[dict[str, Any]] = []

        self._concept_keys: set[str] = set()
        self._library_keys: set[str] = set()
        self._ml_keys: set[str] = set()
        self._advanced_keys: set[str] = set()

        self.has_ml = False
        self.has_pandas = False
        self.has_numpy = False

    # ========================================================
    # MAIN ANALYSIS
    # ========================================================

    def analyze(self) -> dict[str, Any]:
        self._analyze_imports()

        for node in self.tree.body:
            self._analyze_statement(node)

        self._analyze_calls()
        self._add_level_notes()

        return {
            "handled": True,
            "source": "modelmind-local",
            "engine": "code-explainer",
            "level": self.level,
            "parse_success": True,
            "summary": self._build_summary(),
            "purpose": self._build_purpose(),
            "steps": self.steps,
            "concepts": self.concepts,
            "variables": self.variables,
            "libraries": self.libraries,
            "ml_flow": self.ml_flow,
            "advanced_notes": self.advanced_notes,
            "warnings": self.warnings,
            "confidence": self._confidence(),
        }

    # ========================================================
    # IMPORTS
    # ========================================================

    def _analyze_imports(self) -> None:
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    library = alias.name

                    self._add_library(
                        library,
                        alias.asname,
                        node.lineno,
                    )

            elif isinstance(
                node,
                ast.ImportFrom,
            ):
                module = node.module or ""

                names = ", ".join(
                    alias.name
                    for alias in node.names
                )

                self._add_library(
                    module,
                    names,
                    node.lineno,
                )

    def _add_library(
        self,
        library: str,
        alias: str | None,
        line: int,
    ) -> None:
        if not library:
            return

        key = f"{library}:{alias}"

        if key in self._library_keys:
            return

        self._library_keys.add(key)

        lower = library.lower()

        if lower.startswith("pandas"):
            self.has_pandas = True

            explanation = (
                "Pandas is used for working with "
                "tabular data such as CSV files "
                "and DataFrames."
            )

        elif lower.startswith("numpy"):
            self.has_numpy = True

            explanation = (
                "NumPy provides efficient numerical "
                "arrays and mathematical operations."
            )

        elif lower.startswith("sklearn"):
            self.has_ml = True

            explanation = (
                "scikit-learn provides machine-learning "
                "models, preprocessing tools, metrics, "
                "and dataset utilities."
            )

        elif lower.startswith("matplotlib"):
            explanation = (
                "Matplotlib is used to create plots "
                "and data visualizations."
            )

        elif lower.startswith("seaborn"):
            explanation = (
                "Seaborn provides statistical "
                "visualizations built on Matplotlib."
            )

        elif lower.startswith("xgboost"):
            self.has_ml = True

            explanation = (
                "XGBoost provides gradient-boosted "
                "decision-tree models."
            )

        elif lower.startswith("lightgbm"):
            self.has_ml = True

            explanation = (
                "LightGBM provides efficient "
                "gradient-boosted tree models."
            )

        elif lower.startswith("catboost"):
            self.has_ml = True

            explanation = (
                "CatBoost provides gradient boosting "
                "with strong categorical-feature support."
            )

        else:
            explanation = (
                f"The code imports the {library} "
                "Python module."
            )

        self.libraries.append(
            {
                "name": library,
                "imported_as": alias or library,
                "line_number": line,
                "explanation": explanation,
            }
        )

    # ========================================================
    # TOP-LEVEL STATEMENTS
    # ========================================================

    def _analyze_statement(
        self,
        node: ast.stmt,
    ) -> None:
        if isinstance(node, ast.Assign):
            self._analyze_assignment(node)

        elif isinstance(
            node,
            ast.AnnAssign,
        ):
            self._analyze_annotated_assignment(
                node
            )

        elif isinstance(
            node,
            ast.AugAssign,
        ):
            self._add_step(
                node,
                "Update a variable",
                (
                    "This statement updates an "
                    "existing value using an "
                    "arithmetic or logical operation."
                ),
            )

        elif isinstance(
            node,
            ast.Expr,
        ):
            self._analyze_expression(node)

        elif isinstance(
            node,
            ast.FunctionDef,
        ):
            self._analyze_function(node)

        elif isinstance(
            node,
            ast.AsyncFunctionDef,
        ):
            self._add_step(
                node,
                f"Define async function `{node.name}`",
                (
                    "This creates an asynchronous "
                    "function that can perform work "
                    "without blocking other async tasks."
                ),
            )

        elif isinstance(
            node,
            ast.ClassDef,
        ):
            self._analyze_class(node)

        elif isinstance(
            node,
            ast.For,
        ):
            self._analyze_for(node)

        elif isinstance(
            node,
            ast.While,
        ):
            self._add_step(
                node,
                "Repeat while a condition is true",
                (
                    "A while loop repeatedly executes "
                    "its body until its condition "
                    "becomes false."
                ),
            )

        elif isinstance(
            node,
            ast.If,
        ):
            self._add_step(
                node,
                "Make a decision",
                (
                    "The if statement chooses which "
                    "code to run based on a condition."
                ),
            )

        elif isinstance(
            node,
            ast.Try,
        ):
            self._add_step(
                node,
                "Handle possible errors",
                (
                    "The try block runs code that may "
                    "fail, while except blocks can "
                    "handle specific errors."
                ),
            )

        elif isinstance(
            node,
            ast.With,
        ):
            self._add_step(
                node,
                "Use a managed resource",
                (
                    "The with statement manages setup "
                    "and cleanup automatically, commonly "
                    "for files and other resources."
                ),
            )

        elif isinstance(
            node,
            (
                ast.Import,
                ast.ImportFrom,
            ),
        ):
            self._add_step(
                node,
                "Import tools",
                (
                    "This makes functions, classes, "
                    "or modules available to the code."
                ),
            )

    # ========================================================
    # ASSIGNMENTS
    # ========================================================

    def _analyze_assignment(
        self,
        node: ast.Assign,
    ) -> None:
        names: list[str] = []

        for target in node.targets:
            names.extend(
                extract_target_names(target)
            )

        value_text = safe_unparse(
            node.value
        )

        for name in names:
            self.variables.append(
                {
                    "name": name,
                    "line_number": node.lineno,
                    "assigned_from": value_text,
                    "explanation":
                        self._variable_explanation(
                            name,
                            node.value,
                        ),
                }
            )

        title = (
            f"Create `{names[0]}`"
            if len(names) == 1
            else "Assign values"
        )

        self._add_step(
            node,
            title,
            self._assignment_explanation(
                names,
                node.value,
            ),
        )

    def _analyze_annotated_assignment(
        self,
        node: ast.AnnAssign,
    ) -> None:
        names = extract_target_names(
            node.target
        )

        for name in names:
            self.variables.append(
                {
                    "name": name,
                    "line_number": node.lineno,
                    "assigned_from":
                        safe_unparse(node.value)
                        if node.value
                        else "",
                    "explanation":
                        (
                            f"`{name}` is created with "
                            "an explicit type annotation."
                        ),
                }
            )

        self._add_step(
            node,
            "Create a typed variable",
            (
                "This assignment includes a Python "
                "type annotation describing the "
                "expected value type."
            ),
        )

    def _assignment_explanation(
        self,
        names: list[str],
        value: ast.AST,
    ) -> str:
        call_name = get_call_name(value)

        if call_name:
            special = self._call_explanation(
                call_name,
                value,
            )

            if special:
                return special

        if isinstance(
            value,
            ast.Constant,
        ):
            return (
                "This stores a constant value in "
                f"{join_names(names)}."
            )

        if isinstance(
            value,
            (
                ast.List,
                ast.Tuple,
                ast.Set,
                ast.Dict,
            ),
        ):
            return (
                "This creates a Python data "
                f"structure and stores it in "
                f"{join_names(names)}."
            )

        if isinstance(
            value,
            ast.BinOp,
        ):
            return (
                "This calculates a new value from "
                "an expression and stores the result."
            )

        if isinstance(
            value,
            ast.Subscript,
        ):
            return (
                "This selects part of an existing "
                "object, such as a list element or "
                "DataFrame column."
            )

        return (
            "This evaluates the expression on the "
            "right and stores its result."
        )

    def _variable_explanation(
        self,
        name: str,
        value: ast.AST,
    ) -> str:
        lower = name.lower()

        if lower in {
            "x",
            "features",
            "x_train",
            "x_test",
        }:
            return (
                "This variable represents model "
                "input features."
            )

        if lower in {
            "y",
            "target",
            "label",
            "labels",
            "y_train",
            "y_test",
        }:
            return (
                "This variable represents the "
                "prediction target or labels."
            )

        if any(
            word in lower
            for word in (
                "model",
                "classifier",
                "regressor",
                "clf",
            )
        ):
            return (
                "This variable likely stores a "
                "machine-learning model."
            )

        if lower in {
            "pred",
            "prediction",
            "predictions",
            "y_pred",
        }:
            return (
                "This variable stores predictions "
                "produced by a model."
            )

        if lower in {
            "df",
            "data",
            "dataset",
        }:
            return (
                "This variable likely stores the "
                "dataset being analyzed."
            )

        call_name = get_call_name(value)

        if call_name:
            return (
                f"This variable stores the result "
                f"returned by `{call_name}`."
            )

        return (
            "This variable stores a value that can "
            "be reused later in the program."
        )

    # ========================================================
    # EXPRESSIONS
    # ========================================================

    def _analyze_expression(
        self,
        node: ast.Expr,
    ) -> None:
        call_name = get_call_name(
            node.value
        )

        if call_name:
            explanation = (
                self._call_explanation(
                    call_name,
                    node.value,
                )
            )

            self._add_step(
                node,
                f"Call `{call_name}`",
                explanation
                or (
                    f"This executes the "
                    f"`{call_name}` operation."
                ),
            )

            return

        self._add_step(
            node,
            "Evaluate an expression",
            (
                "Python evaluates this expression "
                "for its result or side effect."
            ),
        )

    # ========================================================
    # FUNCTIONS / CLASSES / LOOPS
    # ========================================================

    def _analyze_function(
        self,
        node: ast.FunctionDef,
    ) -> None:
        arguments = [
            argument.arg
            for argument in node.args.args
        ]

        self._add_step(
            node,
            f"Define function `{node.name}`",
            (
                f"This creates a reusable function"
                + (
                    " that receives "
                    + ", ".join(
                        f"`{arg}`"
                        for arg in arguments
                    )
                    if arguments
                    else ""
                )
                + "."
            ),
        )

        self._add_concept(
            f"function:{node.name}",
            "Function",
            (
                "Functions group reusable logic "
                "behind a name and optional inputs."
            ),
            node.lineno,
        )

    def _analyze_class(
        self,
        node: ast.ClassDef,
    ) -> None:
        self._add_step(
            node,
            f"Define class `{node.name}`",
            (
                "This creates a class that can "
                "combine data and behavior into "
                "objects."
            ),
        )

        self._add_concept(
            f"class:{node.name}",
            "Object-oriented programming",
            (
                "A class acts as a blueprint for "
                "creating objects with attributes "
                "and methods."
            ),
            node.lineno,
        )

    def _analyze_for(
        self,
        node: ast.For,
    ) -> None:
        target = safe_unparse(
            node.target
        )

        iterable = safe_unparse(
            node.iter
        )

        self._add_step(
            node,
            "Repeat over data",
            (
                f"The loop assigns each item from "
                f"`{iterable}` to `{target}` and "
                "runs the loop body."
            ),
        )

    # ========================================================
    # ALL FUNCTION CALLS
    # ========================================================

    def _analyze_calls(self) -> None:
        for node in ast.walk(self.tree):
            if not isinstance(
                node,
                ast.Call,
            ):
                continue

            name = get_call_name(node)

            if not name:
                continue

            self._detect_ml_call(
                name,
                node,
            )

            self._detect_data_call(
                name,
                node,
            )

    # ========================================================
    # CALL EXPLANATIONS
    # ========================================================

    def _call_explanation(
        self,
        name: str,
        node: ast.AST,
    ) -> str:
        lower = name.lower()

        if lower == "print":
            return (
                "`print()` displays a value in "
                "the notebook output."
            )

        if lower.endswith(
            "read_csv"
        ):
            self.has_pandas = True

            return (
                "`read_csv()` loads a CSV file "
                "into a Pandas DataFrame."
            )

        if lower.endswith(
            "read_excel"
        ):
            self.has_pandas = True

            return (
                "`read_excel()` loads spreadsheet "
                "data into a Pandas DataFrame."
            )

        if lower.endswith(
            "head"
        ):
            return (
                "`head()` displays the first rows "
                "so you can quickly inspect the data."
            )

        if lower.endswith(
            "describe"
        ):
            return (
                "`describe()` calculates summary "
                "statistics for the dataset."
            )

        if lower.endswith(
            "dropna"
        ):
            return (
                "`dropna()` removes rows or columns "
                "containing missing values."
            )

        if lower.endswith(
            "fillna"
        ):
            return (
                "`fillna()` replaces missing values "
                "with a chosen value or statistic."
            )

        if lower.endswith(
            "fit_transform"
        ):
            self.has_ml = True

            return (
                "`fit_transform()` first learns the "
                "transformation from the supplied data "
                "and then applies that transformation."
            )

        if lower.endswith(".fit"):
            self.has_ml = True

            return self._fit_explanation()

        if lower.endswith(
            ".predict"
        ):
            self.has_ml = True

            return self._predict_explanation()

        if lower.endswith(
            ".transform"
        ):
            self.has_ml = True

            return (
                "`transform()` applies a previously "
                "learned preprocessing transformation "
                "to data."
            )

        if lower.endswith(
            "train_test_split"
        ):
            self.has_ml = True

            return self._split_explanation()

        if lower.endswith(
            "accuracy_score"
        ):
            self.has_ml = True

            return (
                "`accuracy_score()` calculates the "
                "fraction of classification predictions "
                "that are correct."
            )

        if lower.endswith(
            "mean_squared_error"
        ):
            self.has_ml = True

            return (
                "`mean_squared_error()` measures the "
                "average squared difference between "
                "regression predictions and true values."
            )

        if lower.endswith(
            "r2_score"
        ):
            self.has_ml = True

            return (
                "`r2_score()` measures how much of "
                "the target variation is explained "
                "by a regression model."
            )

        if lower.endswith(
            "confusion_matrix"
        ):
            self.has_ml = True

            return (
                "`confusion_matrix()` counts correct "
                "and incorrect predictions for each "
                "classification class."
            )

        if lower.endswith(
            "classification_report"
        ):
            self.has_ml = True

            return (
                "`classification_report()` summarizes "
                "precision, recall, F1-score, and "
                "support for classification."
            )

        if is_model_constructor(name):
            self.has_ml = True

            return (
                f"`{short_name(name)}` creates a "
                "machine-learning model object with "
                "the selected hyperparameters."
            )

        if is_preprocessor_constructor(
            name
        ):
            self.has_ml = True

            return (
                f"`{short_name(name)}` creates a "
                "preprocessing transformer that can "
                "learn parameters from training data."
            )

        return (
            f"`{name}` is called and Python uses "
            "the value it returns."
        )

    # ========================================================
    # ML CALL DETECTION
    # ========================================================

    def _detect_ml_call(
        self,
        name: str,
        node: ast.Call,
    ) -> None:
        lower = name.lower()
        line = getattr(
            node,
            "lineno",
            None,
        )

        if is_model_constructor(name):
            self.has_ml = True

            model_name = short_name(
                name
            )

            self._add_ml_flow(
                f"model:{line}:{model_name}",
                "Model creation",
                (
                    f"`{model_name}` creates the "
                    "estimator that will learn from "
                    "the training data."
                ),
                line,
            )

            self._add_model_concept(
                model_name,
                line,
            )

        if lower.endswith(
            "train_test_split"
        ):
            self.has_ml = True

            self._add_ml_flow(
                f"split:{line}",
                "Train/test split",
                self._split_explanation(),
                line,
            )

        if lower.endswith(
            "fit_transform"
        ):
            self.has_ml = True

            self._add_ml_flow(
                f"fit-transform:{line}",
                "Learn and apply preprocessing",
                (
                    "The transformer learns parameters "
                    "from this data and immediately "
                    "uses them to transform it."
                ),
                line,
            )

        elif lower.endswith(".fit"):
            self.has_ml = True

            self._add_ml_flow(
                f"fit:{line}",
                "Model training",
                self._fit_explanation(),
                line,
            )

        elif lower.endswith(
            ".predict"
        ):
            self.has_ml = True

            self._add_ml_flow(
                f"predict:{line}",
                "Prediction",
                self._predict_explanation(),
                line,
            )

        elif lower.endswith(
            ".transform"
        ):
            self.has_ml = True

            self._add_ml_flow(
                f"transform:{line}",
                "Apply preprocessing",
                (
                    "A transformation learned earlier "
                    "is applied to this data."
                ),
                line,
            )

        metric_names = {
            "accuracy_score",
            "precision_score",
            "recall_score",
            "f1_score",
            "mean_squared_error",
            "mean_absolute_error",
            "r2_score",
            "roc_auc_score",
            "confusion_matrix",
            "classification_report",
        }

        if short_name(
            name
        ).lower() in metric_names:
            self.has_ml = True

            self._add_ml_flow(
                f"metric:{line}:{name}",
                "Model evaluation",
                (
                    f"`{short_name(name)}` evaluates "
                    "the model's predictions using "
                    "a performance metric."
                ),
                line,
            )

    # ========================================================
    # DATA CALL DETECTION
    # ========================================================

    def _detect_data_call(
        self,
        name: str,
        node: ast.Call,
    ) -> None:
        lower = name.lower()
        line = getattr(
            node,
            "lineno",
            None,
        )

        if lower.endswith(
            "read_csv"
        ):
            self.has_pandas = True

            self._add_concept(
                f"csv:{line}",
                "Loading tabular data",
                (
                    "CSV data is converted into a "
                    "DataFrame so rows and columns "
                    "can be analyzed."
                ),
                line,
            )

        if lower.endswith(
            "fillna"
        ):
            self.has_pandas = True

            self._add_concept(
                f"missing:{line}",
                "Missing-value imputation",
                (
                    "Missing values are being replaced "
                    "rather than left as NaN."
                ),
                line,
            )

        if lower.endswith(
            "dropna"
        ):
            self.has_pandas = True

            self._add_concept(
                f"drop-missing:{line}",
                "Missing-value removal",
                (
                    "Rows or columns containing missing "
                    "values are being removed."
                ),
                line,
            )

    # ========================================================
    # LEVEL-SPECIFIC EXPLANATIONS
    # ========================================================

    def _fit_explanation(
        self,
    ) -> str:
        if self.level == "basic":
            return (
                "`.fit()` teaches the model using "
                "the training examples and their "
                "correct answers."
            )

        if self.level == "medium":
            return (
                "`.fit()` estimates the model's "
                "parameters from the supplied training "
                "features and targets."
            )

        return (
            "`.fit()` optimizes or estimates the "
            "estimator's learned parameters from the "
            "training distribution. The exact procedure "
            "depends on the estimator—for example "
            "optimization, tree construction, or "
            "statistical estimation."
        )

    def _predict_explanation(
        self,
    ) -> str:
        if self.level == "basic":
            return (
                "`.predict()` asks the trained model "
                "to produce answers for new input data."
            )

        if self.level == "medium":
            return (
                "`.predict()` applies the fitted model "
                "to feature rows and returns predicted "
                "targets or classes."
            )

        return (
            "`.predict()` performs estimator-specific "
            "inference using parameters learned during "
            "fitting. No model parameters should be "
            "retrained during this step."
        )

    def _split_explanation(
        self,
    ) -> str:
        if self.level == "basic":
            return (
                "`train_test_split()` keeps some data "
                "for learning and some unseen data "
                "for checking the model."
            )

        if self.level == "medium":
            return (
                "`train_test_split()` separates the "
                "dataset into training and test subsets "
                "so performance can be measured on "
                "unseen samples."
            )

        return (
            "`train_test_split()` creates an explicit "
            "generalization boundary between fitting "
            "and evaluation data. Any learned "
            "preprocessing should normally be fitted "
            "only on the training partition."
        )

    # ========================================================
    # MODEL CONCEPTS
    # ========================================================

    def _add_model_concept(
        self,
        model_name: str,
        line: int | None,
    ) -> None:
        explanations = {
            "LinearRegression": {
                "basic":
                    (
                        "Linear Regression learns a "
                        "straight-line relationship "
                        "between features and a "
                        "numerical target."
                    ),
                "medium":
                    (
                        "Linear Regression estimates "
                        "coefficients that minimize "
                        "squared prediction error."
                    ),
                "advanced":
                    (
                        "Ordinary least squares estimates "
                        "coefficients by minimizing the "
                        "residual sum of squares. Its "
                        "behavior depends on linearity, "
                        "multicollinearity, noise, and "
                        "feature conditioning."
                    ),
            },

            "LogisticRegression": {
                "basic":
                    (
                        "Logistic Regression predicts "
                        "the probability of a class."
                    ),
                "medium":
                    (
                        "Logistic Regression models "
                        "class probability using a "
                        "linear decision function passed "
                        "through a logistic link."
                    ),
                "advanced":
                    (
                        "Logistic Regression models "
                        "log-odds as a linear function "
                        "of the features and commonly "
                        "optimizes regularized log loss."
                    ),
            },

            "KNeighborsClassifier": {
                "basic":
                    (
                        "KNN predicts a class by looking "
                        "at nearby training examples."
                    ),
                "medium":
                    (
                        "KNN uses a distance metric to "
                        "find the k nearest training "
                        "samples and votes on the class."
                    ),
                "advanced":
                    (
                        "KNN is a non-parametric, "
                        "instance-based learner whose "
                        "inference cost and neighborhood "
                        "geometry depend strongly on "
                        "feature scaling and dimensionality."
                    ),
            },

            "DecisionTreeClassifier": {
                "basic":
                    (
                        "A Decision Tree repeatedly "
                        "splits data using questions "
                        "about feature values."
                    ),
                "medium":
                    (
                        "A Decision Tree selects feature "
                        "splits that improve class purity."
                    ),
                "advanced":
                    (
                        "Classification trees recursively "
                        "partition feature space using "
                        "impurity criteria such as Gini "
                        "or entropy and are controlled "
                        "through structural regularization."
                    ),
            },

            "RandomForestClassifier": {
                "basic":
                    (
                        "Random Forest combines many "
                        "decision trees and lets them "
                        "vote on the prediction."
                    ),
                "medium":
                    (
                        "Random Forest trains multiple "
                        "trees on randomized samples and "
                        "feature subsets to reduce "
                        "variance."
                    ),
                "advanced":
                    (
                        "Random Forest is a bagged tree "
                        "ensemble using bootstrap sampling "
                        "and random feature selection to "
                        "decorrelate estimators and reduce "
                        "variance."
                    ),
            },

            "SVC": {
                "basic":
                    (
                        "SVM tries to separate classes "
                        "with a boundary that leaves a "
                        "large margin."
                    ),
                "medium":
                    (
                        "SVC finds a maximum-margin "
                        "decision boundary and can use "
                        "kernels for nonlinear separation."
                    ),
                "advanced":
                    (
                        "SVC solves a regularized "
                        "maximum-margin optimization "
                        "problem; kernel functions "
                        "implicitly map samples into "
                        "higher-dimensional feature spaces."
                    ),
            },
        }

        model_info = explanations.get(
            model_name
        )

        if not model_info:
            self._add_concept(
                f"model-concept:{model_name}",
                model_name,
                (
                    f"`{model_name}` is used as a "
                    "machine-learning estimator."
                ),
                line,
            )

            return

        self._add_concept(
            f"model-concept:{model_name}",
            model_name,
            model_info[self.level],
            line,
        )

    # ========================================================
    # LEVEL NOTES
    # ========================================================

    def _add_level_notes(self) -> None:
        if not self.has_ml:
            return

        if self.level == "basic":
            self._add_advanced_note(
                "learning-focus",
                "Learning focus",
                (
                    "Focus on the sequence: prepare "
                    "data → train the model → make "
                    "predictions → evaluate results."
                ),
            )

            return

        if self.level == "medium":
            self._add_advanced_note(
                "medium-generalization",
                "Generalization",
                (
                    "Keep training and evaluation data "
                    "separate so the reported metric "
                    "reflects performance on unseen data."
                ),
            )

            self._add_advanced_note(
                "medium-preprocessing",
                "Preprocessing",
                (
                    "Transformations that learn statistics "
                    "from data should normally be fitted "
                    "using training data only."
                ),
            )

            return

        self._add_advanced_note(
            "advanced-pipeline",
            "Pipeline boundary",
            (
                "For production-grade workflows, learned "
                "preprocessing and the estimator are often "
                "combined in a scikit-learn Pipeline so "
                "cross-validation preserves training-only "
                "fitting boundaries."
            ),
        )

        self._add_advanced_note(
            "advanced-generalization",
            "Generalization",
            (
                "Evaluation quality depends on whether "
                "the held-out data represents the future "
                "distribution and whether information "
                "leaks across the train/test boundary."
            ),
        )

        self._add_advanced_note(
            "advanced-reproducibility",
            "Reproducibility",
            (
                "Randomized splitting, sampling, and "
                "estimators should use controlled random "
                "seeds when reproducible experiments "
                "are required."
            ),
        )

    # ========================================================
    # SUMMARY / PURPOSE
    # ========================================================

    def _build_summary(self) -> str:
        if self.has_ml:
            if self.level == "basic":
                return (
                    "This code is part of a "
                    "machine-learning workflow. "
                    "ModelMind has broken it into "
                    "simple steps so you can see how "
                    "the data moves through the code."
                )

            if self.level == "medium":
                return (
                    "This code contains a "
                    "machine-learning workflow. "
                    "The explanation focuses on data "
                    "flow, preprocessing, model behavior, "
                    "and evaluation."
                )

            return (
                "This code contains a machine-learning "
                "workflow. The explanation covers "
                "estimator behavior, data-flow boundaries, "
                "generalization, preprocessing semantics, "
                "and implementation implications."
            )

        if self.has_pandas:
            return (
                "This code works with tabular data "
                "using Pandas. ModelMind explains how "
                "the dataset is loaded, transformed, "
                "and inspected."
            )

        if self.has_numpy:
            return (
                "This code performs numerical Python "
                "operations using NumPy."
            )

        return (
            "ModelMind parsed this Python code and "
            "identified its main operations, variables, "
            "and programming concepts."
        )

    def _build_purpose(self) -> str:
        call_names = [
            get_call_name(node)
            for node in ast.walk(self.tree)
            if isinstance(
                node,
                ast.Call,
            )
        ]

        call_names = [
            name
            for name in call_names
            if name
        ]

        lower_names = [
            name.lower()
            for name in call_names
        ]

        has_fit = any(
            name.endswith(".fit")
            or name.endswith(
                "fit_transform"
            )
            for name in lower_names
        )

        has_predict = any(
            name.endswith(".predict")
            for name in lower_names
        )

        has_metric = any(
            short_name(name).lower()
            in {
                "accuracy_score",
                "precision_score",
                "recall_score",
                "f1_score",
                "mean_squared_error",
                "mean_absolute_error",
                "r2_score",
                "roc_auc_score",
            }
            for name in call_names
        )

        if (
            has_fit
            and has_predict
            and has_metric
        ):
            return (
                "Train a machine-learning model, "
                "generate predictions, and evaluate "
                "its performance."
            )

        if has_fit and has_predict:
            return (
                "Train a machine-learning model and "
                "use it to make predictions."
            )

        if has_fit:
            return (
                "Prepare or train part of a "
                "machine-learning workflow."
            )

        if self.has_pandas:
            return (
                "Load, inspect, or transform "
                "tabular data."
            )

        return (
            "Execute a sequence of Python "
            "operations."
        )

    def _confidence(self) -> float:
        if self.steps:
            return 0.95

        return 0.75

    # ========================================================
    # RESULT HELPERS
    # ========================================================

    def _add_step(
        self,
        node: ast.AST,
        title: str,
        explanation: str,
    ) -> None:
        self.steps.append(
            {
                "line_number":
                    getattr(
                        node,
                        "lineno",
                        None,
                    ),
                "code":
                    safe_unparse(node),
                "title": title,
                "explanation":
                    explanation,
            }
        )

    def _add_concept(
        self,
        key: str,
        title: str,
        explanation: str,
        line: int | None,
    ) -> None:
        if key in self._concept_keys:
            return

        self._concept_keys.add(key)

        self.concepts.append(
            {
                "title": title,
                "explanation":
                    explanation,
                "line_number": line,
            }
        )

    def _add_ml_flow(
        self,
        key: str,
        stage: str,
        explanation: str,
        line: int | None,
    ) -> None:
        if key in self._ml_keys:
            return

        self._ml_keys.add(key)

        self.ml_flow.append(
            {
                "stage": stage,
                "explanation":
                    explanation,
                "line_number": line,
            }
        )

    def _add_advanced_note(
        self,
        key: str,
        title: str,
        explanation: str,
    ) -> None:
        if key in self._advanced_keys:
            return

        self._advanced_keys.add(key)

        self.advanced_notes.append(
            {
                "title": title,
                "explanation":
                    explanation,
            }
        )


# ============================================================
# AST HELPERS
# ============================================================


def safe_unparse(
    node: ast.AST | None,
) -> str:
    if node is None:
        return ""

    try:
        return ast.unparse(node)
    except Exception:
        return ""


def extract_target_names(
    target: ast.AST,
) -> list[str]:
    if isinstance(
        target,
        ast.Name,
    ):
        return [target.id]

    if isinstance(
        target,
        (
            ast.Tuple,
            ast.List,
        ),
    ):
        names: list[str] = []

        for element in target.elts:
            names.extend(
                extract_target_names(
                    element
                )
            )

        return names

    if isinstance(
        target,
        ast.Attribute,
    ):
        return [
            safe_unparse(target)
        ]

    if isinstance(
        target,
        ast.Subscript,
    ):
        return [
            safe_unparse(target)
        ]

    return []


def get_call_name(
    node: ast.AST | None,
) -> str:
    if not isinstance(
        node,
        ast.Call,
    ):
        return ""

    return get_callable_name(
        node.func
    )


def get_callable_name(
    node: ast.AST,
) -> str:
    if isinstance(
        node,
        ast.Name,
    ):
        return node.id

    if isinstance(
        node,
        ast.Attribute,
    ):
        parent = get_callable_name(
            node.value
        )

        if parent:
            return (
                f"{parent}.{node.attr}"
            )

        return node.attr

    if isinstance(
        node,
        ast.Call,
    ):
        return get_call_name(node)

    return ""


def short_name(
    name: str,
) -> str:
    return name.split(".")[-1]


def join_names(
    names: list[str],
) -> str:
    if not names:
        return "the variable"

    if len(names) == 1:
        return f"`{names[0]}`"

    return ", ".join(
        f"`{name}`"
        for name in names
    )


# ============================================================
# KNOWN ML OBJECTS
# ============================================================


MODEL_CONSTRUCTORS = {
    "LinearRegression",
    "Ridge",
    "Lasso",
    "ElasticNet",

    "LogisticRegression",

    "KNeighborsClassifier",
    "KNeighborsRegressor",

    "SVC",
    "SVR",
    "LinearSVC",

    "GaussianNB",
    "MultinomialNB",
    "BernoulliNB",

    "DecisionTreeClassifier",
    "DecisionTreeRegressor",

    "RandomForestClassifier",
    "RandomForestRegressor",

    "GradientBoostingClassifier",
    "GradientBoostingRegressor",

    "AdaBoostClassifier",
    "AdaBoostRegressor",

    "HistGradientBoostingClassifier",
    "HistGradientBoostingRegressor",

    "MLPClassifier",
    "MLPRegressor",

    "Perceptron",

    "XGBClassifier",
    "XGBRegressor",

    "LGBMClassifier",
    "LGBMRegressor",

    "CatBoostClassifier",
    "CatBoostRegressor",

    "KMeans",
    "DBSCAN",
    "AgglomerativeClustering",

    "PCA",
}


PREPROCESSOR_CONSTRUCTORS = {
    "StandardScaler",
    "MinMaxScaler",
    "RobustScaler",
    "MaxAbsScaler",
    "Normalizer",

    "SimpleImputer",
    "KNNImputer",
    "IterativeImputer",

    "OneHotEncoder",
    "OrdinalEncoder",
    "LabelEncoder",

    "PolynomialFeatures",
    "PowerTransformer",
    "QuantileTransformer",

    "ColumnTransformer",
    "Pipeline",
}


def is_model_constructor(
    name: str,
) -> bool:
    return (
        short_name(name)
        in MODEL_CONSTRUCTORS
    )


def is_preprocessor_constructor(
    name: str,
) -> bool:
    return (
        short_name(name)
        in PREPROCESSOR_CONSTRUCTORS
    )