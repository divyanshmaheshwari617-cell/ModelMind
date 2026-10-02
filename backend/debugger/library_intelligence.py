# import re
# from typing import Callable


# def _level(level: str | None) -> str:
#     value = (level or "basic").strip().lower()
#     if value in {"medium", "intermediate"}:
#         return "medium"
#     if value in {"advanced", "expert"}:
#         return "advanced"
#     return "basic"


# def _result(
#     *,
#     category: str,
#     problem: str,
#     explanation: str,
#     why: str,
#     recommendation: str,
#     code_example: str = "",
#     level: str,
#     confidence: float = 0.94,
#     warnings: list[str] | None = None,
# ) -> dict:
#     return {
#         "handled": True,
#         "source": "modelmind-local",
#         "category": category,
#         "problem": problem,
#         "level": _level(level),
#         "confidence": confidence,
#         "explanation": explanation,
#         "why": why,
#         "recommendation": recommendation,
#         "code_example": code_example,
#         "warnings": warnings or [],
#         "safe_to_apply": False,
#     }


# def _mentions(text: str, *needles: str) -> bool:
#     low = text.lower()
#     return any(n.lower() in low for n in needles)


# def _library_from_context(message: str, code: str) -> str:
#     text = f"{message}\n{code}".lower()
#     checks = (
#         ("numpy", ("numpy", "np.", "ndarray", "ufunc")),
#         ("pandas", ("pandas", "pd.", "dataframe", "series")),
#         ("matplotlib", ("matplotlib", "plt.", "pyplot", "axes.")),
#         ("seaborn", ("seaborn", "sns.")),
#         ("scipy", ("scipy",)),
#         ("statsmodels", ("statsmodels", "sm.", "smf.")),
#         ("xgboost", ("xgboost", "xgb.", "xgbclassifier", "xgbregressor")),
#         ("lightgbm", ("lightgbm", "lgb.", "lgbmclassifier", "lgbmregressor")),
#         ("catboost", ("catboost", "catboostclassifier", "catboostregressor")),
#         ("tensorflow/keras", ("tensorflow", "tf.", "keras", "model.fit(")),
#         ("pytorch", ("torch", "pytorch", "cuda", ".backward(")),
#         ("opencv", ("cv2", "opencv")),
#         ("imbalanced-learn", ("imblearn", "smote", "randomoversampler")),
#         ("joblib/pickle", ("joblib", "pickle", ".pkl", ".joblib")),
#     )
#     for name, tokens in checks:
#         if any(token in text for token in tokens):
#             return name
#     return "python/library"


# def analyze_library_problem(
#     *,
#     error_type: str,
#     message: str,
#     code: str,
#     level: str,
# ) -> dict | None:
#     """Broad deterministic error-family detector for data-science/ML libraries.

#     It intentionally produces guided fixes, not blind code rewrites. Exact,
#     provably safe rewrites remain the responsibility of engine.py.
#     """
#     level = _level(level)
#     text = f"{error_type}: {message}\n{code}"
#     low = text.lower()
#     library = _library_from_context(message, code)

#     handlers: tuple[Callable[[], dict | None], ...] = (
#         lambda: _imports(error_type, message, code, level),
#         lambda: _shape_broadcast(message, library, level),
#         lambda: _axis_dimension(message, library, level),
#         lambda: _dtype_conversion(error_type, message, library, level),
#         lambda: _nan_inf(message, library, level),
#         lambda: _memory(message, library, level),
#         lambda: _device(message, library, level),
#         lambda: _parameter_api(error_type, message, library, level),
#         lambda: _column_plot(message, code, library, level),
#         lambda: _length_mismatch(message, library, level),
#         lambda: _file_serialization(error_type, message, library, level),
#         lambda: _deep_learning_shapes(message, code, library, level),
#         lambda: _autograd(message, code, library, level),
#         lambda: _image_errors(message, code, library, level),
#         lambda: _version_binary(message, library, level),
#     )
#     for handler in handlers:
#         result = handler()
#         if result is not None:
#             return result
#     return None


# def _imports(error_type, message, code, level):
#     low = message.lower()
#     if error_type not in {"ModuleNotFoundError", "ImportError"} and not _mentions(
#         low, "no module named", "cannot import name"
#     ):
#         return None

#     module = ""
#     match = re.search(r"No module named ['\"]([^'\"]+)", message, re.I)
#     if match:
#         module = match.group(1)

#     if "cannot import name" in low:
#         problem = "Import name is unavailable"
#         why = (
#             "The package was found, but the requested symbol is not available "
#             "from that import path. This can be caused by a wrong import path "
#             "or an installed-version/API mismatch."
#         )
#         recommendation = (
#             "Check the library's installed version and the documented import "
#             "path. Do not automatically downgrade or reinstall packages until "
#             "the version mismatch is confirmed."
#         )
#     else:
#         problem = "Python package/module is unavailable"
#         why = (
#             f'Python could not import "{module}". ' if module else
#             "Python could not import the requested module. "
#         ) + "The package may be missing from the current runtime or the import name may be wrong."
#         recommendation = (
#             "Verify the import name first, then install the package into the "
#             "same Python environment used by ModelMind if it is genuinely missing."
#         )

#     return _result(
#         category="environment/import",
#         problem=problem,
#         explanation="The failure happened while Python was resolving an import.",
#         why=why,
#         recommendation=recommendation,
#         code_example=(
#             "import sys\n"
#             'print(sys.executable)\n'
#             "# Then verify the package in this same environment."
#         ),
#         level=level,
#         confidence=0.99,
#         warnings=["Package installation should require an explicit user action."],
#     )


# def _shape_broadcast(message, library, level):
#     if not _mentions(
#         message,
#         "could not be broadcast",
#         "operands could not be broadcast",
#         "shapes",
#         "shape mismatch",
#         "size mismatch",
#         "mat1 and mat2 shapes cannot be multiplied",
#         "incompatible shapes",
#         "dimensions must be equal",
#     ):
#         return None
#     return _result(
#         category=library,
#         problem="Array/tensor shapes are incompatible",
#         explanation="The operation received arrays or tensors whose dimensions do not line up.",
#         why=(
#             "Vectorized numerical and ML operations follow strict shape rules. "
#             "A wrong reshape, feature count, batch dimension, target shape, or matrix multiplication order can cause this."
#         ),
#         recommendation=(
#             "Inspect every participating object's shape immediately before the failing line. "
#             "Fix the data/model shape contract instead of forcing a reshape without understanding the intended dimensions."
#         ),
#         code_example=(
#             'print("X:", getattr(X, "shape", None))\n'
#             'print("y:", getattr(y, "shape", None))'
#         ),
#         level=level,
#         confidence=0.97,
#     )


# def _axis_dimension(message, library, level):
#     if not _mentions(
#         message,
#         "axis", "dimension out of range", "too many indices",
#         "expected 2d array", "expected 1d array", "found array with dim",
#         "too many dimensions", "invalid dimension"
#     ):
#         return None
#     if not _mentions(message, "out of bounds", "out of range", "dimension", "1d", "2d", "indices", "axis"):
#         return None
#     return _result(
#         category=library,
#         problem="Wrong array/tensor dimensionality or axis",
#         explanation="The code is addressing a dimension that the current object does not have, or the API expects a different rank.",
#         why="A 1D vector, 2D feature matrix, image tensor, and batched tensor have different valid axes.",
#         recommendation="Print the shape/rank and compare it with the API's expected input before choosing reshape, squeeze, unsqueeze, ravel, or a different axis.",
#         code_example='print("shape:", getattr(data, "shape", None))',
#         level=level,
#         confidence=0.95,
#     )


# def _dtype_conversion(error_type, message, library, level):
#     if not (
#         error_type in {"TypeError", "ValueError"}
#         and _mentions(
#             message,
#             "could not convert string to float",
#             "cannot convert",
#             "invalid literal",
#             "unsupported dtype",
#             "object dtype",
#             "expected scalar type",
#             "can't convert",
#             "cannot cast",
#             "dtype",
#         )
#     ):
#         return None
#     return _result(
#         category=library,
#         problem="Data type is incompatible with the operation",
#         explanation="The operation expects a different numeric/string/tensor dtype from the value it received.",
#         why="ML libraries often require numeric arrays and some operations require matching dtypes.",
#         recommendation="Inspect dtypes and the unexpected values before converting. Encode categories deliberately and avoid blindly coercing invalid data.",
#         code_example=(
#             'print(getattr(data, "dtypes", getattr(data, "dtype", None)))\n'
#             "# Inspect values before conversion."
#         ),
#         level=level,
#         confidence=0.95,
#     )


# def _nan_inf(message, library, level):
#     if not _mentions(
#         message,
#         "input contains nan", "contains nan", "nan, infinity",
#         "infinity or a value too large", "inf or nan", "non-finite",
#         "finite values", "missing values encoded as nan"
#     ):
#         return None
#     return _result(
#         category=library,
#         problem="NaN or infinite values reached an operation that cannot accept them",
#         explanation="The failing algorithm received missing or non-finite numeric values.",
#         why="NaN/inf can come from missing data, division by zero, logarithms, overflow, merges, or preprocessing.",
#         recommendation="Locate the columns/operations producing NaN or inf. Handle them using a method appropriate for the data and fit learned preprocessing on training data only.",
#         code_example=(
#             "import numpy as np\n"
#             'print("NaN:", np.isnan(X).sum() if np.issubdtype(np.asarray(X).dtype, np.number) else "inspect columns")\n'
#             'print("Finite:", np.isfinite(X).all() if np.issubdtype(np.asarray(X).dtype, np.number) else "inspect columns")'
#         ),
#         level=level,
#         confidence=0.98,
#         warnings=["Do not blindly drop or fill values without considering leakage and meaning."],
#     )


# def _memory(message, library, level):
#     if not _mentions(
#         message, "memoryerror", "out of memory", "cuda out of memory",
#         "unable to allocate", "cannot allocate memory", "resource exhausted"
#     ):
#         return None
#     return _result(
#         category=f"{library}/runtime",
#         problem="Runtime ran out of memory",
#         explanation="The requested operation needs more RAM/VRAM than is currently available.",
#         why="Large datasets, dense copies, oversized batches/models, or repeated tensors/figures can exhaust memory.",
#         recommendation="Reduce batch/data size, avoid unnecessary copies, use suitable dtypes/sparse data, release unused objects, and profile memory before retrying.",
#         code_example="# Inspect shapes, batch size, dtype and unnecessary copies before retrying.",
#         level=level,
#         confidence=0.99,
#         warnings=["ModelMind should not automatically retry an OOM operation unchanged."],
#     )


# def _device(message, library, level):
#     if not _mentions(
#         message, "same device", "expected all tensors to be on the same device",
#         "cpu and cuda", "cuda", "mps"
#     ):
#         return None
#     if library not in {"pytorch", "tensorflow/keras", "python/library"} and "tensor" not in message.lower():
#         return None
#     return _result(
#         category="deep-learning/device",
#         problem="Tensor/model device mismatch",
#         explanation="Objects participating in the operation are not on a compatible compute device.",
#         why="A model may be on GPU while one or more tensors remain on CPU, or the requested accelerator may be unavailable.",
#         recommendation="Choose one device and move the model and every participating tensor to it. Also check accelerator availability.",
#         code_example=(
#             "import torch\n"
#             'device = torch.device("cuda" if torch.cuda.is_available() else "cpu")\n'
#             "model = model.to(device)\n"
#             "X = X.to(device)"
#         ),
#         level=level,
#         confidence=0.98,
#     )


# def _parameter_api(error_type, message, library, level):
#     if not _mentions(
#         message, "unexpected keyword argument", "got an unexpected keyword",
#         "invalid parameter", "unknown parameter", "unexpected argument",
#         "takes no arguments", "missing required positional argument"
#     ):
#         return None
#     return _result(
#         category=f"{library}/api",
#         problem="Function/model parameter does not match the installed API",
#         explanation="The call uses a parameter name or argument pattern the current function/class does not accept.",
#         why="This can be a typo, a parameter for another estimator/function, or a library-version API change.",
#         recommendation="Inspect the function signature and installed library version, then use a parameter supported by that exact API.",
#         code_example=(
#             "import inspect\n"
#             "# Example: print(inspect.signature(your_function_or_class))"
#         ),
#         level=level,
#         confidence=0.97,
#     )


# def _column_plot(message, code, library, level):
#     plot_context = library in {"matplotlib", "seaborn", "pandas"} or _mentions(code, "plt.", "sns.", ".plot(")
#     if not plot_context:
#         return None
#     if not _mentions(message, "could not interpret value", "not found in data", "column", "x and y must", "same first dimension", "must be the same size"):
#         return None
#     return _result(
#         category="visualization",
#         problem="Plot columns or dimensions do not match",
#         explanation="The plotting function cannot find the requested variable or the plotted arrays have incompatible lengths/shapes.",
#         why="A column may be misspelled/not present in data, or x/y/hue data may not describe the same observations.",
#         recommendation="Print the DataFrame columns and the lengths/shapes of plotting inputs, then use existing columns with aligned observations.",
#         code_example=(
#             'print("columns:", list(df.columns))\n'
#             "# Also inspect len(x), len(y), and any hue/style arrays."
#         ),
#         level=level,
#         confidence=0.96,
#     )


# def _length_mismatch(message, library, level):
#     if not _mentions(
#         message, "length mismatch", "length of values", "does not match length of index",
#         "arrays must all be same length", "inconsistent numbers of samples"
#     ):
#         return None
#     return _result(
#         category=library,
#         problem="Related data objects have different lengths",
#         explanation="The operation expects aligned observations, but the supplied containers contain different numbers of items.",
#         why="Independent filtering, dropping missing values, slicing, or assignment can break row alignment.",
#         recommendation="Compare lengths/indexes and derive related objects from the same cleaned/aligned data.",
#         code_example='print(len(X), len(y))\n# For pandas, also inspect X.index and y.index.',
#         level=level,
#         confidence=0.98,
#     )


# def _file_serialization(error_type, message, library, level):
#     if error_type in {"FileNotFoundError", "PermissionError", "EOFError", "UnpicklingError"} or _mentions(
#         message, "no such file or directory", "permission denied", "invalid load key",
#         "pickle data was truncated", "unsupported pickle protocol"
#     ):
#         return _result(
#             category="files/serialization",
#             problem="File path, permission, or serialized model file problem",
#             explanation="Python could not correctly access or deserialize the requested file.",
#             why="The path may be wrong, the file may be unavailable/corrupt, permissions may block access, or it may have been saved with an incompatible format/version.",
#             recommendation="Verify the resolved path and file existence first. For saved models, verify the serializer and important library versions used when the artifact was created.",
#             code_example=(
#                 "from pathlib import Path\n"
#                 "path = Path(your_path)\n"
#                 'print(path.resolve())\n'
#                 'print("exists:", path.exists())'
#             ),
#             level=level,
#             confidence=0.96,
#             warnings=["Never load untrusted pickle/joblib files; deserialization can execute code."],
#         )
#     return None


# def _deep_learning_shapes(message, code, library, level):
#     if library not in {"tensorflow/keras", "pytorch"}:
#         return None
#     if not _mentions(
#         message, "expected input", "expected shape", "input shape", "target size",
#         "target and input", "logits and labels", "rank", "channel"
#     ):
#         return None
#     return _result(
#         category=library,
#         problem="Neural-network input/target shape contract is violated",
#         explanation="The model, layer, or loss function received a tensor shape different from what it expects.",
#         why="Batch, feature, channel, class, or sequence dimensions may be missing, swapped, or encoded incorrectly.",
#         recommendation="Inspect model input/output shapes and one batch of X/y. Match the final layer and target encoding to the selected loss.",
#         code_example=(
#             'print("X shape:", X.shape)\n'
#             'print("y shape:", y.shape)\n'
#             "# Also inspect model input/output shapes."
#         ),
#         level=level,
#         confidence=0.96,
#     )


# def _autograd(message, code, library, level):
#     if library != "pytorch" and "tensor" not in message.lower():
#         return None
#     if not _mentions(
#         message, "does not require grad", "backward through the graph a second time",
#         "inplace operation", "modified by an inplace operation", "requires grad"
#     ):
#         return None
#     return _result(
#         category="pytorch/autograd",
#         problem="PyTorch autograd graph/gradient usage problem",
#         explanation="The backward pass cannot use the current computation graph as written.",
#         why="The graph may have been freed, a tensor may not require gradients, or an in-place operation may have changed a value needed for differentiation.",
#         recommendation="Inspect requires_grad, detach/no_grad usage, repeated backward calls, and in-place operations. Change the training logic only after identifying which case applies.",
#         level=level,
#         confidence=0.97,
#     )


# def _image_errors(message, code, library, level):
#     if library != "opencv":
#         return None
#     if not _mentions(
#         message, "src.empty", "!_src.empty", "assertion failed", "invalid number of channels",
#         "bad number of channels", "size.width", "imread"
#     ):
#         return None
#     return _result(
#         category="opencv",
#         problem="OpenCV image/input is empty or has an unexpected shape/channel format",
#         explanation="An OpenCV operation received an invalid image object or incompatible image dimensions/channels.",
#         why="A common cause is cv2.imread() returning None because the path is wrong, followed by an image operation on that missing image.",
#         recommendation="Verify the file path and check the image immediately after loading. Then inspect image.shape before color/resize/vision operations.",
#         code_example=(
#             "image = cv2.imread(path)\n"
#             "if image is None:\n"
#             '    raise FileNotFoundError(f"Could not read image: {path}")\n'
#             'print("image shape:", image.shape)'
#         ),
#         level=level,
#         confidence=0.97,
#     )


# def _version_binary(message, library, level):
#     if not _mentions(
#         message, "binary incompatibility", "dtype size changed", "undefined symbol",
#         "version", "compiled against", "abi", "cannot import name"
#     ):
#         return None
#     return _result(
#         category="environment/compatibility",
#         problem="Library/version compatibility problem",
#         explanation="Installed packages appear to disagree about an API or compiled binary interface.",
#         why="Scientific Python packages depend on compatible versions of Python, NumPy, compiled extensions, and each other.",
#         recommendation="Record Python/package versions and identify the incompatible pair before changing the environment. Prefer a clean environment with compatible pinned versions.",
#         code_example=(
#             "import sys\n"
#             'print("Python:", sys.version)\n'
#             "# Print the relevant package __version__ values."
#         ),
#         level=level,
#         confidence=0.90,
#         warnings=["Do not automatically upgrade/downgrade a working environment without user approval."],
#     )





import re

from typing import Callable





def _level(level: str | None) -> str:

    value = (level or "basic").strip().lower()

    if value in {"medium", "intermediate"}:

        return "medium"

    if value in {"advanced", "expert"}:

        return "advanced"

    return "basic"





def _result(

    *,

    category: str,

    problem: str,

    explanation: str,

    why: str,

    recommendation: str,

    code_example: str = "",

    level: str,

    confidence: float = 0.94,

    warnings: list[str] | None = None,

) -> dict:

    return {

        "handled": True,

        "source": "modelmind-local",

        "category": category,

        "problem": problem,

        "level": _level(level),

        "confidence": confidence,

        "explanation": explanation,

        "why": why,

        "recommendation": recommendation,

        "code_example": code_example,

        "warnings": warnings or [],

        "safe_to_apply": False,

    }





def _mentions(text: str, *needles: str) -> bool:

    low = text.lower()

    return any(n.lower() in low for n in needles)





def _library_from_context(message: str, code: str) -> str:

    text = f"{message}\n{code}".lower()

    checks = (

        ("numpy", ("numpy", "np.", "ndarray", "ufunc")),

        ("pandas", ("pandas", "pd.", "dataframe", "series")),

        ("matplotlib", ("matplotlib", "plt.", "pyplot", "axes.")),

        ("seaborn", ("seaborn", "sns.")),

        ("scipy", ("scipy",)),

        ("statsmodels", ("statsmodels", "sm.", "smf.")),

        ("xgboost", ("xgboost", "xgb.", "xgbclassifier", "xgbregressor")),

        ("lightgbm", ("lightgbm", "lgb.", "lgbmclassifier", "lgbmregressor")),

        ("catboost", ("catboost", "catboostclassifier", "catboostregressor")),

        ("tensorflow/keras", ("tensorflow", "tf.", "keras", "model.fit(")),

        ("pytorch", ("torch", "pytorch", "cuda", ".backward(")),

        ("opencv", ("cv2", "opencv")),

        ("imbalanced-learn", ("imblearn", "smote", "randomoversampler")),

        ("joblib/pickle", ("joblib", "pickle", ".pkl", ".joblib")),

    )

    for name, tokens in checks:

        if any(token in text for token in tokens):

            return name

    return "python/library"





def analyze_library_problem(

    *,

    error_type: str,

    message: str,

    code: str,

    level: str,

) -> dict | None:

    """Broad deterministic error-family detector for data-science/ML libraries.



    It intentionally produces guided fixes, not blind code rewrites. Exact,

    provably safe rewrites remain the responsibility of engine.py.

    """

    level = _level(level)

    text = f"{error_type}: {message}\n{code}"

    low = text.lower()

    library = _library_from_context(message, code)



    # High-confidence library-specific rules run before broad families.
    handlers: tuple[Callable[[], dict | None], ...] = (
        lambda: _imports(error_type, message, code, level),
        lambda: _sample_count_mismatch(message, code, library, level),
        lambda: _pytorch_dtype_mismatch(message, code, library, level),
        lambda: _pytorch_shape_mismatch(message, code, library, level),
        lambda: _keras_target_output_mismatch(message, code, library, level),
        lambda: _keras_input_shape_mismatch(message, code, library, level),
        lambda: _opencv_empty_image(message, code, library, level),
        lambda: _autograd(message, code, library, level),
        lambda: _device(message, library, level),
        lambda: _nan_inf(message, library, level),
        lambda: _deep_learning_shapes(message, code, library, level),
        lambda: _shape_broadcast(message, library, level),
        lambda: _axis_dimension(message, library, level),
        lambda: _dtype_conversion(error_type, message, library, level),
        lambda: _memory(message, library, level),
        lambda: _parameter_api(error_type, message, library, level),
        lambda: _column_plot(message, code, library, level),
        lambda: _length_mismatch(message, library, level),
        lambda: _file_serialization(error_type, message, library, level),
        lambda: _image_errors(message, code, library, level),
        lambda: _version_binary(message, library, level),
    )

    for handler in handlers:

        result = handler()

        if result is not None:

            return result

    return None





def _imports(error_type, message, code, level):

    low = message.lower()

    if error_type not in {"ModuleNotFoundError", "ImportError"} and not _mentions(

        low, "no module named", "cannot import name"

    ):

        return None



    module = ""

    match = re.search(r"No module named ['\"]([^'\"]+)", message, re.I)

    if match:

        module = match.group(1)



    if "cannot import name" in low:

        problem = "Import name is unavailable"

        why = (

            "The package was found, but the requested symbol is not available "

            "from that import path. This can be caused by a wrong import path "

            "or an installed-version/API mismatch."

        )

        recommendation = (

            "Check the library's installed version and the documented import "

            "path. Do not automatically downgrade or reinstall packages until "

            "the version mismatch is confirmed."

        )

    else:

        problem = "Python package/module is unavailable"

        why = (

            f'Python could not import "{module}". ' if module else

            "Python could not import the requested module. "

        ) + "The package may be missing from the current runtime or the import name may be wrong."

        recommendation = (

            "Verify the import name first, then install the package into the "

            "same Python environment used by ModelMind if it is genuinely missing."

        )



    return _result(

        category="environment/import",

        problem=problem,

        explanation="The failure happened while Python was resolving an import.",

        why=why,

        recommendation=recommendation,

        code_example=(

            "import sys\n"

            'print(sys.executable)\n'

            "# Then verify the package in this same environment."

        ),

        level=level,

        confidence=0.99,

        warnings=["Package installation should require an explicit user action."],

    )






def _sample_count_mismatch(message, code, library, level):
    low = message.lower()
    matched = _mentions(
        low,
        "inconsistent numbers of samples",
        "endog and exog matrices are different sizes",
        "invalid size for 'label'",
        'invalid size for "label"',
        "different number of samples",
        "different numbers of samples",
    ) or ("n_samples" in low and ("label" in low or "target" in low))
    if not matched:
        return None

    detail = ""
    m = re.search(
        r"invalid size for ['\"]label['\"]:\s*\(?\s*(\d+).*?n_samples\s*:\s*(\d+)",
        message, re.I | re.S,
    )
    if m:
        labels, samples = m.groups()
        detail = f" The traceback reports {samples} input samples but {labels} labels."
    if "endog and exog matrices are different sizes" in low:
        detail += " In Statsmodels, endog is the target and exog is the feature/design matrix."

    return _result(
        category=f"{library}/data-alignment",
        problem="Feature and target sample counts do not match",
        explanation="The model received different numbers of input observations and target observations." + detail,
        why="Supervised learning requires exactly one aligned target for every training observation. Filtering, slicing, dropping rows, or constructing X and y separately can break this alignment.",
        recommendation="Compare the number of observations in X and y and inspect the earlier filtering/splitting steps. Correct the alignment at its source; do not invent a label or arbitrarily delete a row.",
        code_example='print("X samples:", len(X))\nprint("y samples:", len(y))\n# For pandas, also compare X.index and y.index.',
        level=level,
        confidence=0.995,
        warnings=["Guided fix only: ModelMind cannot safely guess which sample or target is missing."],
    )


def _pytorch_dtype_mismatch(message, code, library, level):
    if library != "pytorch":
        return None
    low = message.lower()
    if not _mentions(low, "mat1 and mat2 must have the same dtype", "expected scalar type", "same dtype"):
        return None
    m = re.search(r"same dtype,\s*but got\s+([A-Za-z0-9_]+)\s+and\s+([A-Za-z0-9_]+)", message, re.I)
    detail = f" PyTorch reports {m.group(1)} and {m.group(2)}." if m else ""
    return _result(
        category="pytorch/dtype",
        problem="PyTorch tensor and model dtypes do not match",
        explanation="A PyTorch operation received tensors or parameters with incompatible data types." + detail,
        why="Layers such as nn.Linear normally use floating-point parameters, while tensors created from integer literals commonly become torch.int64 (Long). Those dtypes cannot participate directly in the same matrix operation.",
        recommendation="Inspect the input tensor dtype and model parameter dtype. Convert only when the conversion matches the tensor's meaning; labels, indices, masks, and model features can require different dtypes.",
        code_example='print("input dtype:", X.dtype)\nprint("model dtype:", next(model.parameters()).dtype)\n# For floating-point model features, an intentional conversion may be:\n# X = X.float()',
        level=level,
        confidence=0.995,
        warnings=["Guided fix: do not blindly cast targets, indices, or masks."],
    )


def _pytorch_shape_mismatch(message, code, library, level):
    if library != "pytorch":
        return None
    low = message.lower()
    m = re.search(
        r"size of tensor a\s*\((\d+)\)\s*must match the size of tensor b\s*\((\d+)\)\s*at non-singleton dimension\s*(\d+)",
        message, re.I,
    )
    if not m and not _mentions(low, "mat1 and mat2 shapes cannot be multiplied", "the size of tensor a", "target size"):
        return None
    detail = ""
    if m:
        left, right, dim = m.groups()
        detail = f" At dimension {dim}, the two tensor sizes are {left} and {right}."
    return _result(
        category="pytorch/shape",
        problem="PyTorch tensor shapes are incompatible",
        explanation="The PyTorch operation requires compatible tensor dimensions, but the supplied tensors violate that contract." + detail,
        why="Element-wise operations require equal or broadcast-compatible dimensions, while layers/matrix operations require their feature dimensions to line up.",
        recommendation="Print the shapes immediately before the failing operation and identify batch, feature/class, channel, or sequence dimensions. Correct the data/model contract rather than forcing a reshape.",
        code_example='print("first shape:", predictions.shape)\nprint("second shape:", targets.shape)',
        level=level,
        confidence=0.995,
        warnings=["Guided fix only: reshape, slicing, padding, or correcting the data can each be valid in different tasks."],
    )


def _keras_target_output_mismatch(message, code, library, level):
    if library != "tensorflow/keras":
        return None
    low = message.lower()
    if not (
        "target" in low
        and ("output" in low or "prediction" in low)
        and _mentions(low, "must have the same shape", "received target shape", "target.shape", "prediction shape")
    ):
        return None
    m = re.search(
        r"received target shape\s*[:=]?\s*(\([^)]+\)).*?(?:prediction|output) shape\s*[:=]?\s*(\([^)]+\))",
        message, re.I | re.S,
    )
    detail = f" The traceback reports target shape {m.group(1)} and output shape {m.group(2)}." if m else ""
    return _result(
        category="tensorflow/keras/loss",
        problem="Keras target and model output shapes do not match",
        explanation="The loss function received targets and model predictions with different shapes." + detail,
        why="The final layer defines the prediction shape, while target encoding and the chosen loss define the expected target shape. These must agree.",
        recommendation="Inspect y.shape, model.output_shape, the final layer, and the loss. Choose a target encoding/output/loss combination that matches the learning task rather than reshaping only to silence the error.",
        code_example='print("target shape:", y.shape)\nprint("model output shape:", model.output_shape)\nprint("loss:", model.loss)',
        level=level,
        confidence=0.995,
        warnings=["Guided fix only: changing the final layer, target encoding, or loss changes model semantics."],
    )


def _keras_input_shape_mismatch(message, code, library, level):
    if library != "tensorflow/keras":
        return None
    low = message.lower()
    if not (
        _mentions(low, "incompatible with the layer", "expected axis -1 of input shape", "input 0 of layer")
        and _mentions(low, "expected", "input")
    ):
        return None
    e = re.search(r"expected axis\s+-?1\s+of input shape to have value\s+(\d+)", message, re.I)
    r = re.search(r"(?:inputs=tf\.Tensor\(shape=|input shape[=:]?\s*)(\([^)]+\))", message, re.I)
    detail = ""
    if e:
        detail += f" The layer expects {e.group(1)} features on its final input axis."
    if r:
        detail += f" The received tensor shape is {r.group(1)}."
    return _result(
        category="tensorflow/keras/input-shape",
        problem="Keras model input shape does not match the layer",
        explanation="The tensor passed to the Keras model has a feature/input shape different from what the layer was built to accept." + detail,
        why="A model built with a fixed feature dimension expects training and prediction data to preserve that feature structure and ordering.",
        recommendation="Inspect X.shape and model.input_shape. Verify that preprocessing and feature selection produce the same number and order of features used when the model was built.",
        code_example='print("X shape:", X.shape)\nprint("model input shape:", model.input_shape)',
        level=level,
        confidence=0.995,
        warnings=["Guided fix only: do not drop, pad, or reshape features unless that matches the intended design."],
    )


def _opencv_empty_image(message, code, library, level):
    if library != "opencv":
        return None
    if not _mentions(message, "!_src.empty()", "!_src.empty", "src.empty", "ssize.empty", "!ssize.empty"):
        return None
    return _result(
        category="opencv/image-loading",
        problem="OpenCV received an empty image",
        explanation="The OpenCV operation expected a valid image array, but the source image is empty or None.",
        why="A common cause is cv2.imread(...) failing to load a file and returning None. An earlier image-processing step can also produce an empty source.",
        recommendation="Check the image immediately before the failing OpenCV call. If it came from cv2.imread, verify the resolved path and confirm loading succeeded before cvtColor, resize, or other operations.",
        code_example='print("image is None:", image is None)\nif image is not None:\n    print("image shape:", image.shape)\n# If using cv2.imread(path), also verify the path exists.',
        level=level,
        confidence=0.999,
        warnings=["Guided fix: ModelMind should not invent or silently replace an image path."],
    )



def _shape_broadcast(message, library, level):

    if not _mentions(

        message,

        "could not be broadcast",

        "operands could not be broadcast",

        "shapes",

        "shape mismatch",

        "size mismatch",

        "mat1 and mat2 shapes cannot be multiplied",

        "incompatible shapes",

        "dimensions must be equal",

    ):

        return None

    return _result(

        category=library,

        problem="Array/tensor shapes are incompatible",

        explanation="The operation received arrays or tensors whose dimensions do not line up.",

        why=(

            "Vectorized numerical and ML operations follow strict shape rules. "

            "A wrong reshape, feature count, batch dimension, target shape, or matrix multiplication order can cause this."

        ),

        recommendation=(

            "Inspect every participating object's shape immediately before the failing line. "

            "Fix the data/model shape contract instead of forcing a reshape without understanding the intended dimensions."

        ),

        code_example=(

            'print("X:", getattr(X, "shape", None))\n'

            'print("y:", getattr(y, "shape", None))'

        ),

        level=level,

        confidence=0.97,

    )





def _axis_dimension(message, library, level):

    if not _mentions(

        message,

        "axis", "dimension out of range", "too many indices",

        "expected 2d array", "expected 1d array", "found array with dim",

        "too many dimensions", "invalid dimension"

    ):

        return None

    if not _mentions(message, "out of bounds", "out of range", "dimension", "1d", "2d", "indices", "axis"):

        return None

    return _result(

        category=library,

        problem="Wrong array/tensor dimensionality or axis",

        explanation="The code is addressing a dimension that the current object does not have, or the API expects a different rank.",

        why="A 1D vector, 2D feature matrix, image tensor, and batched tensor have different valid axes.",

        recommendation="Print the shape/rank and compare it with the API's expected input before choosing reshape, squeeze, unsqueeze, ravel, or a different axis.",

        code_example='print("shape:", getattr(data, "shape", None))',

        level=level,

        confidence=0.95,

    )





def _dtype_conversion(error_type, message, library, level):

    if not (

        error_type in {"TypeError", "ValueError", "RuntimeError"}

        and _mentions(

            message,

            "could not convert string to float",

            "cannot convert",

            "invalid literal",

            "unsupported dtype",

            "object dtype",

            "expected scalar type",

            "can't convert",

            "cannot cast",

            "dtype",

        )

    ):

        return None

    return _result(

        category=library,

        problem="Data type is incompatible with the operation",

        explanation="The operation expects a different numeric/string/tensor dtype from the value it received.",

        why="ML libraries often require numeric arrays and some operations require matching dtypes.",

        recommendation="Inspect dtypes and the unexpected values before converting. Encode categories deliberately and avoid blindly coercing invalid data.",

        code_example=(

            'print(getattr(data, "dtypes", getattr(data, "dtype", None)))\n'

            "# Inspect values before conversion."

        ),

        level=level,

        confidence=0.95,

    )





def _nan_inf(message, library, level):

    if not _mentions(

        message,

        "input contains nan", "contains nan", "nan, infinity",

        "infinity or a value too large", "inf or nan", "non-finite",

        "finite values", "missing values encoded as nan"

    ):

        return None

    return _result(

        category=library,

        problem="NaN or infinite values reached an operation that cannot accept them",

        explanation="The failing algorithm received missing or non-finite numeric values.",

        why="NaN/inf can come from missing data, division by zero, logarithms, overflow, merges, or preprocessing.",

        recommendation="Locate the columns/operations producing NaN or inf. Handle them using a method appropriate for the data and fit learned preprocessing on training data only.",

        code_example=(

            "import numpy as np\n"

            'print("NaN:", np.isnan(X).sum() if np.issubdtype(np.asarray(X).dtype, np.number) else "inspect columns")\n'

            'print("Finite:", np.isfinite(X).all() if np.issubdtype(np.asarray(X).dtype, np.number) else "inspect columns")'

        ),

        level=level,

        confidence=0.98,

        warnings=["Do not blindly drop or fill values without considering leakage and meaning."],

    )





def _memory(message, library, level):

    if not _mentions(

        message, "memoryerror", "out of memory", "cuda out of memory",

        "unable to allocate", "cannot allocate memory", "resource exhausted"

    ):

        return None

    return _result(

        category=f"{library}/runtime",

        problem="Runtime ran out of memory",

        explanation="The requested operation needs more RAM/VRAM than is currently available.",

        why="Large datasets, dense copies, oversized batches/models, or repeated tensors/figures can exhaust memory.",

        recommendation="Reduce batch/data size, avoid unnecessary copies, use suitable dtypes/sparse data, release unused objects, and profile memory before retrying.",

        code_example="# Inspect shapes, batch size, dtype and unnecessary copies before retrying.",

        level=level,

        confidence=0.99,

        warnings=["ModelMind should not automatically retry an OOM operation unchanged."],

    )





def _device(message, library, level):

    if not _mentions(

        message, "same device", "expected all tensors to be on the same device",

        "cpu and cuda", "cuda", "mps"

    ):

        return None

    if library not in {"pytorch", "tensorflow/keras", "python/library"} and "tensor" not in message.lower():

        return None

    return _result(

        category="deep-learning/device",

        problem="Tensor/model device mismatch",

        explanation="Objects participating in the operation are not on a compatible compute device.",

        why="A model may be on GPU while one or more tensors remain on CPU, or the requested accelerator may be unavailable.",

        recommendation="Choose one device and move the model and every participating tensor to it. Also check accelerator availability.",

        code_example=(

            "import torch\n"

            'device = torch.device("cuda" if torch.cuda.is_available() else "cpu")\n'

            "model = model.to(device)\n"

            "X = X.to(device)"

        ),

        level=level,

        confidence=0.98,

    )





def _parameter_api(error_type, message, library, level):

    if not _mentions(

        message, "unexpected keyword argument", "got an unexpected keyword",

        "invalid parameter", "unknown parameter", "unexpected argument",

        "takes no arguments", "missing required positional argument"

    ):

        return None

    return _result(

        category=f"{library}/api",

        problem="Function/model parameter does not match the installed API",

        explanation="The call uses a parameter name or argument pattern the current function/class does not accept.",

        why="This can be a typo, a parameter for another estimator/function, or a library-version API change.",

        recommendation="Inspect the function signature and installed library version, then use a parameter supported by that exact API.",

        code_example=(

            "import inspect\n"

            "# Example: print(inspect.signature(your_function_or_class))"

        ),

        level=level,

        confidence=0.97,

    )





def _column_plot(message, code, library, level):

    plot_context = library in {"matplotlib", "seaborn", "pandas"} or _mentions(code, "plt.", "sns.", ".plot(")

    if not plot_context:

        return None

    if not _mentions(message, "could not interpret value", "not found in data", "column", "x and y must", "same first dimension", "must be the same size"):

        return None

    return _result(

        category="visualization",

        problem="Plot columns or dimensions do not match",

        explanation="The plotting function cannot find the requested variable or the plotted arrays have incompatible lengths/shapes.",

        why="A column may be misspelled/not present in data, or x/y/hue data may not describe the same observations.",

        recommendation="Print the DataFrame columns and the lengths/shapes of plotting inputs, then use existing columns with aligned observations.",

        code_example=(

            'print("columns:", list(df.columns))\n'

            "# Also inspect len(x), len(y), and any hue/style arrays."

        ),

        level=level,

        confidence=0.96,

    )





def _length_mismatch(message, library, level):

    if not _mentions(

        message, "length mismatch", "length of values", "does not match length of index",

        "arrays must all be same length", "inconsistent numbers of samples"

    ):

        return None

    return _result(

        category=library,

        problem="Related data objects have different lengths",

        explanation="The operation expects aligned observations, but the supplied containers contain different numbers of items.",

        why="Independent filtering, dropping missing values, slicing, or assignment can break row alignment.",

        recommendation="Compare lengths/indexes and derive related objects from the same cleaned/aligned data.",

        code_example='print(len(X), len(y))\n# For pandas, also inspect X.index and y.index.',

        level=level,

        confidence=0.98,

    )





def _file_serialization(error_type, message, library, level):

    if error_type in {"FileNotFoundError", "PermissionError", "EOFError", "UnpicklingError"} or _mentions(

        message, "no such file or directory", "permission denied", "invalid load key",

        "pickle data was truncated", "unsupported pickle protocol"

    ):

        return _result(

            category="files/serialization",

            problem="File path, permission, or serialized model file problem",

            explanation="Python could not correctly access or deserialize the requested file.",

            why="The path may be wrong, the file may be unavailable/corrupt, permissions may block access, or it may have been saved with an incompatible format/version.",

            recommendation="Verify the resolved path and file existence first. For saved models, verify the serializer and important library versions used when the artifact was created.",

            code_example=(

                "from pathlib import Path\n"

                "path = Path(your_path)\n"

                'print(path.resolve())\n'

                'print("exists:", path.exists())'

            ),

            level=level,

            confidence=0.96,

            warnings=["Never load untrusted pickle/joblib files; deserialization can execute code."],

        )

    return None





def _deep_learning_shapes(message, code, library, level):

    if library not in {"tensorflow/keras", "pytorch"}:

        return None

    if not _mentions(

        message, "expected input", "expected shape", "input shape", "target size",

        "target and input", "logits and labels", "rank", "channel"

    ):

        return None

    return _result(

        category=library,

        problem="Neural-network input/target shape contract is violated",

        explanation="The model, layer, or loss function received a tensor shape different from what it expects.",

        why="Batch, feature, channel, class, or sequence dimensions may be missing, swapped, or encoded incorrectly.",

        recommendation="Inspect model input/output shapes and one batch of X/y. Match the final layer and target encoding to the selected loss.",

        code_example=(

            'print("X shape:", X.shape)\n'

            'print("y shape:", y.shape)\n'

            "# Also inspect model input/output shapes."

        ),

        level=level,

        confidence=0.96,

    )





def _autograd(message, code, library, level):

    if library != "pytorch" and "tensor" not in message.lower():

        return None

    if not _mentions(

        message, "does not require grad", "backward through the graph a second time",

        "inplace operation", "modified by an inplace operation", "requires grad"

    ):

        return None

    return _result(

        category="pytorch/autograd",

        problem="PyTorch autograd graph/gradient usage problem",

        explanation="The backward pass cannot use the current computation graph as written.",

        why="The graph may have been freed, a tensor may not require gradients, or an in-place operation may have changed a value needed for differentiation.",

        recommendation="Inspect requires_grad, detach/no_grad usage, repeated backward calls, and in-place operations. Change the training logic only after identifying which case applies.",

        level=level,

        confidence=0.97,

    )





def _image_errors(message, code, library, level):

    if library != "opencv":

        return None

    if not _mentions(

        message, "src.empty", "!_src.empty", "assertion failed", "invalid number of channels",

        "bad number of channels", "size.width", "imread"

    ):

        return None

    return _result(

        category="opencv",

        problem="OpenCV image/input is empty or has an unexpected shape/channel format",

        explanation="An OpenCV operation received an invalid image object or incompatible image dimensions/channels.",

        why="A common cause is cv2.imread() returning None because the path is wrong, followed by an image operation on that missing image.",

        recommendation="Verify the file path and check the image immediately after loading. Then inspect image.shape before color/resize/vision operations.",

        code_example=(

            "image = cv2.imread(path)\n"

            "if image is None:\n"

            '    raise FileNotFoundError(f"Could not read image: {path}")\n'

            'print("image shape:", image.shape)'

        ),

        level=level,

        confidence=0.97,

    )





def _version_binary(message, library, level):

    if not _mentions(

        message, "binary incompatibility", "dtype size changed", "undefined symbol",

        "version", "compiled against", "abi", "cannot import name"

    ):

        return None

    return _result(

        category="environment/compatibility",

        problem="Library/version compatibility problem",

        explanation="Installed packages appear to disagree about an API or compiled binary interface.",

        why="Scientific Python packages depend on compatible versions of Python, NumPy, compiled extensions, and each other.",

        recommendation="Record Python/package versions and identify the incompatible pair before changing the environment. Prefer a clean environment with compatible pinned versions.",

        code_example=(

            "import sys\n"

            'print("Python:", sys.version)\n'

            "# Print the relevant package __version__ values."

        ),

        level=level,

        confidence=0.90,

        warnings=["Do not automatically upgrade/downgrade a working environment without user approval."],

    )
