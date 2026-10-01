import ast
import re
from copy import deepcopy

from .parser import parse_traceback, get_source_line
from .error_rules import (
    get_error_rule,
    normalize_level,
)
from .data_intelligence import analyze_data_problem
from .sklearn_intelligence import analyze_sklearn_problem
from .sklearn_intelligence import analyze_sklearn_problem
# ============================================================
# MAIN MODELMIND ERROR ENGINE
# ============================================================

def analyze_error(
    code: str,
    traceback: str,
    level: str = "Basic",
) -> dict:

    learning_level = normalize_level(level)

    parsed = parse_traceback(traceback)

    error_type = parsed["error_type"]
    message = parsed["message"]
    line_number = parsed["line_number"]

    failing_line = get_source_line(
        code,
        line_number,
    )

    rule = get_error_rule(
        error_type,
        message,
        learning_level,
    )
    data_problem = analyze_data_problem(
        error_type=error_type,
        message=message,
        code=code,
        level=learning_level,
    )

    if data_problem is not None:
        return {
            **data_problem,
            "error_type": error_type,
            "line_number": line_number,
            "failing_line": failing_line,
            "fixed_code": "",
            "changes": "",
        }

    sklearn_problem = analyze_sklearn_problem(
        error_type=error_type,
        message=message,
        code=code,
        level=learning_level,
    )

    if sklearn_problem is not None:
        return {
            **sklearn_problem,
            "error_type": error_type,
            "line_number": line_number,
            "failing_line": failing_line,
            "fixed_code": "",
            "changes": "",
        }

    # ----------------------------------------
    # UNKNOWN ERROR -> FUTURE GEMINI FALLBACK
    # ----------------------------------------

    if rule is None:
        return {
            "handled": False,
            "confidence": 0.20,
            "source": "fallback-required",
            "level": learning_level,
            "error_type": error_type,
            "title": "Python or library error",
            "line_number": line_number,
            "failing_line": failing_line,
            "explanation": unknown_error_explanation(
                learning_level,
            ),
            "why": message,
            "how_to_fix": unknown_error_guidance(
                learning_level,
            ),
            "suggestions": [],
            "fixed_code": "",
            "changes": "",
            "safe_to_apply": False,
        }

    # --------------------------------------------------------
    # LOCAL EXPLANATION
    # --------------------------------------------------------

    result = {
        "handled": True,
        "confidence": 0.90,
        "source": "modelmind-local",
        "level": learning_level,
        "error_type": error_type,
        "title": rule["title"],
        "line_number": line_number,
        "failing_line": failing_line,
        "explanation": rule["explanation"],
        "why": build_why(
            error_type=error_type,
            message=message,
            failing_line=failing_line,
            level=learning_level,
        ),
        "how_to_fix": build_fix_guidance(
            error_type=error_type,
            message=message,
            level=learning_level,
        ),
        "suggestions": build_level_suggestions(
            error_type=error_type,
            message=message,
            level=learning_level,
        ),
        "fixed_code": "",
        "changes": "",
        "safe_to_apply": False,
    }

    # --------------------------------------------------------
    # TRY A DETERMINISTIC SAFE FIX
    # --------------------------------------------------------

    fix = generate_safe_fix(
        code=code,
        error_type=error_type,
        message=message,
        line_number=line_number,
        level=learning_level,
    )

    if fix is not None:
        result["fixed_code"] = fix["code"]
        result["changes"] = fix["changes"]
        result["how_to_fix"] = fix["how_to_fix"]
        result["confidence"] = fix["confidence"]
        result["safe_to_apply"] = fix.get(
            "safe_to_apply",
            False,
        )

    return result


# ============================================================
# UNKNOWN ERROR
# ============================================================

def unknown_error_explanation(
    level: str,
) -> str:

    if level == "basic":
        return (
            "ModelMind found an error, but this error is not yet "
            "covered by the local beginner error engine."
        )

    if level == "medium":
        return (
            "ModelMind parsed the error, but the local rule engine "
            "does not yet have a reliable explanation for this "
            "specific Python or library error."
        )

    return (
        "The traceback was parsed successfully, but ModelMind does "
        "not currently have a sufficiently high-confidence local "
        "rule for this exception. It should be escalated to the "
        "AI fallback rather than generating a speculative fix."
    )


def unknown_error_guidance(
    level: str,
) -> str:

    if level == "basic":
        return (
            "Read the final error message and check the highlighted "
            "line. ModelMind can send this error to the AI helper "
            "for a deeper explanation."
        )

    if level == "medium":
        return (
            "Inspect the final traceback message, the failing line "
            "and the values used by that line. AI analysis can be "
            "used when the deterministic engine cannot classify it."
        )

    return (
        "Preserve the traceback, source context and relevant runtime "
        "state for deeper analysis. ModelMind should use AI fallback "
        "only because deterministic confidence is currently low."
    )


# ============================================================
# WHY DID THIS HAPPEN?
# ============================================================

def build_why(
    error_type: str,
    message: str,
    failing_line: str,
    level: str,
) -> str:

    context = ""

    if failing_line:
        context = f' The failing line is: "{failing_line}".'

    if level == "basic":
        if message:
            return (
                f"Python reported: {message}."
                f"{context}"
            )

        return (
            "Python stopped because this line could not be "
            "executed successfully."
            f"{context}"
        )

    if level == "medium":
        if message:
            return (
                f"The runtime raised {error_type} with the message "
                f'"{message}".{context}'
            )

        return (
            f"The runtime raised {error_type}.{context}"
        )

    if message:
        return (
            f"Python raised {error_type} during execution. "
            f'The runtime message is "{message}".{context}'
        )

    return (
        f"Python raised {error_type} during runtime evaluation."
        f"{context}"
    )


# ============================================================
# LEVEL-AWARE FIX GUIDANCE
# ============================================================

def build_fix_guidance(
    error_type: str,
    message: str,
    level: str,
) -> str:

    guides = {
        "SyntaxError": {
            "basic": (
                "Check this line and the line above it for missing "
                "quotes, brackets, commas or a colon."
            ),
            "medium": (
                "Inspect delimiters and statement structure around "
                "the reported line. The actual syntax mistake may "
                "appear immediately before the highlighted location."
            ),
            "advanced": (
                "Inspect the parser location plus the preceding "
                "statement for unmatched delimiters or malformed "
                "grammar. Avoid rewriting unrelated code."
            ),
        },

        "IndentationError": {
            "basic": (
                "Make sure lines inside if, for, while, function and "
                "class blocks use the same indentation."
            ),
            "medium": (
                "Normalize the affected block to four spaces per "
                "indentation level."
            ),
            "advanced": (
                "Normalize the suite to a consistent four-space "
                "indentation policy and remove mixed indentation."
            ),
        },

        "TabError": {
            "basic": (
                "Use spaces for indentation instead of mixing tabs "
                "and spaces."
            ),
            "medium": (
                "Convert indentation in the affected block to four "
                "spaces per level."
            ),
            "advanced": (
                "Normalize indentation characters across the file "
                "and configure the editor to insert spaces."
            ),
        },

        "TypeError": {
            "basic": (
                "Check what kind of values you are using. For example, "
                "text and numbers may need to be converted before they "
                "can be used together."
            ),
            "medium": (
                "Inspect the runtime types of the operands or arguments. "
                "Convert values only when the conversion matches the "
                "meaning of the data."
            ),
            "advanced": (
                "Inspect the operand types and the API's expected "
                "protocol. Prefer explicit validation at the data "
                "boundary rather than broad implicit coercion."
            ),
        },

        "NameError": {
            "basic": (
                "Check the spelling of the variable and make sure you "
                "ran the cell that creates it."
            ),
            "medium": (
                "Verify the identifier spelling, scope and notebook "
                "execution order."
            ),
            "advanced": (
                "Inspect LEGB scope resolution and notebook state. "
                "Restarted kernels and out-of-order cell execution can "
                "invalidate previously defined names."
            ),
        },

        "UnboundLocalError": {
            "basic": (
                "Give the variable a value before trying to use it "
                "inside the function."
            ),
            "medium": (
                "Check every branch in the function and make sure the "
                "local variable is assigned before it is read."
            ),
            "advanced": (
                "Review local binding semantics and control-flow paths. "
                "If global or nonlocal state is intentional, declare it "
                "explicitly; otherwise initialize the local value."
            ),
        },

        "ValueError": {
            "basic": (
                "Check the actual value being passed to this operation. "
                "The value may need cleaning or conversion."
            ),
            "medium": (
                "Inspect the value, shape and valid range expected by "
                "the function before applying a conversion."
            ),
            "advanced": (
                "Validate semantic constraints at the boundary: allowed "
                "values, dimensions, missing values, dtypes and library "
                "specific invariants."
            ),
        },

        "IndexError": {
            "basic": (
                "Check how many items are present before accessing that "
                "position."
            ),
            "medium": (
                "Inspect len(...) or the array shape and ensure the "
                "requested index is within bounds."
            ),
            "advanced": (
                "Validate sequence or tensor dimensions before indexing, "
                "especially after filtering, reshaping or splitting data."
            ),
        },

        "KeyError": {
            "basic": (
                "Check the spelling of the key or column name. With "
                "Pandas, print df.columns to see the available columns."
            ),
            "medium": (
                "Inspect available keys or DataFrame columns, including "
                "capitalization and hidden leading/trailing spaces."
            ),
            "advanced": (
                "Validate the input schema before feature selection. "
                "Normalize column names only when doing so is an explicit "
                "part of the preprocessing contract."
            ),
        },

        "AttributeError": {
            "basic": (
                "Check what object you are using and whether that object "
                "really has this function or property."
            ),
            "medium": (
                "Inspect type(object) and verify the method in the "
                "library documentation."
            ),
            "advanced": (
                "Inspect the runtime type, inheritance/API surface and "
                "library version before changing the call."
            ),
        },

        "ZeroDivisionError": {
            "basic": (
                "Check whether the number below the division sign can "
                "be zero before dividing."
            ),
            "medium": (
                "Handle the zero-denominator case explicitly based on "
                "what zero means in your program."
            ),
            "advanced": (
                "Define domain behavior for a zero denominator instead "
                "of silently substituting an arbitrary value."
            ),
        },

        "ModuleNotFoundError": {
            "basic": (
                "Check the library name. If it is correct, install the "
                "package in the notebook environment."
            ),
            "medium": (
                "Verify the import name and whether the package is "
                "installed in the same Python environment used by "
                "ModelMind."
            ),
            "advanced": (
                "Inspect sys.executable, sys.path, environment isolation "
                "and the difference between the distribution name and "
                "the Python import name."
            ),
        },

        "ImportError": {
            "basic": (
                "Check the name you are importing from the library."
            ),
            "medium": (
                "Verify that the requested function or class exists in "
                "the installed version of the package."
            ),
            "advanced": (
                "Inspect package versions, circular-import possibilities "
                "and public API changes."
            ),
        },

        "FileNotFoundError": {
            "basic": (
                "Check the filename and make sure the file was uploaded "
                "to the notebook."
            ),
            "medium": (
                "Check the relative path and the current notebook "
                "workspace before reading the file."
            ),
            "advanced": (
                "Inspect the runtime working directory and resolve the "
                "path deliberately rather than depending on an assumed "
                "process location."
            ),
        },

        "NotADirectoryError": {
            "basic": (
                "Check the path. One part that should be a folder is "
                "actually a file."
            ),
            "medium": (
                "Inspect each path component and make sure directory "
                "operations receive a directory."
            ),
            "advanced": (
                "Validate filesystem path types before traversal or "
                "directory-specific operations."
            ),
        },

        "IsADirectoryError": {
            "basic": (
                "Choose a file instead of a folder."
            ),
            "medium": (
                "Check that the path points to the intended file rather "
                "than its containing directory."
            ),
            "advanced": (
                "Validate the filesystem entry type before opening it "
                "with file-specific operations."
            ),
        },

        "OverflowError": {
            "basic": (
                "The calculation became too large. Check the values used "
                "in the calculation."
            ),
            "medium": (
                "Rescale the inputs or use a numerically safer "
                "calculation when possible."
            ),
            "advanced": (
                "Use numerically stable formulations, appropriate dtypes "
                "or log-space computation when the algorithm permits it."
            ),
        },

        "MemoryError": {
            "basic": (
                "The operation is using too much memory. Try working "
                "with less data at one time."
            ),
            "medium": (
                "Reduce unnecessary copies, select only required columns "
                "or process the dataset in chunks."
            ),
            "advanced": (
                "Profile memory use, optimize dtypes and intermediate "
                "allocations, and consider chunked, sparse or streaming "
                "processing."
            ),
        },
    }

    error_guides = guides.get(error_type)

    if not error_guides:
        return (
            "Inspect the failing line and the values involved in "
            "the operation."
        )

    return error_guides[level]


# ============================================================
# LEVEL-AWARE SUGGESTIONS
# ============================================================

def build_level_suggestions(
    error_type: str,
    message: str,
    level: str,
) -> list[str]:

    suggestions = []

    if level == "basic":
        suggestions.append(
            "Focus on the highlighted line first."
        )
        suggestions.append(
            "Check variable names, values and simple spelling mistakes."
        )

    elif level == "medium":
        suggestions.append(
            "Inspect the failing line together with the input values "
            "and their data types."
        )
        suggestions.append(
            "Check the operation's expected input format before "
            "changing the code."
        )

    else:
        suggestions.append(
            "Inspect the traceback, runtime types and relevant library "
            "contract before applying a fix."
        )
        suggestions.append(
            "Prefer a root-cause correction over suppressing or broadly "
            "catching the exception."
        )

    if error_type == "KeyError":
        if level == "basic":
            suggestions.append(
                "For Pandas, try print(df.columns) to see the real "
                "column names."
            )
        elif level == "medium":
            suggestions.append(
                "Inspect df.columns.tolist() and check whitespace and "
                "capitalization."
            )
        else:
            suggestions.append(
                "Validate the DataFrame schema before the modeling "
                "pipeline consumes it."
            )

    if error_type == "ModuleNotFoundError":
        if level == "basic":
            suggestions.append(
                "Make sure the package is installed before importing it."
            )
        elif level == "medium":
            suggestions.append(
                "Confirm that installation and execution use the same "
                "Python environment."
            )
        else:
            suggestions.append(
                "Compare sys.executable and sys.path with the package "
                "installation location."
            )

    if error_type == "FileNotFoundError":
        suggestions.append(
            "Check the notebook's uploaded files and workspace path."
        )

    if error_type == "NameError":
        suggestions.append(
            "In a notebook, make sure the defining cell ran before "
            "this cell."
        )

    return suggestions


# ============================================================
# SAFE FIX CONTROLLER
# ============================================================

def generate_safe_fix(
    code: str,
    error_type: str,
    message: str,
    line_number: int | None,
    level: str,
) -> dict | None:

    if error_type == "TypeError":

        fix = fix_type_error(
            code=code,
            message=message,
            line_number=line_number,
            level=level,
        )

        if fix:
            return fix

    # We deliberately explain these locally without blindly rewriting.
    if error_type in {
        "ZeroDivisionError",
        "KeyError",
        "ValueError",
        "FileNotFoundError",
        "ModuleNotFoundError",
        "ImportError",
    }:
        return None

    return None


# ============================================================
# TYPE ERROR FIXER
# ============================================================

def fix_type_error(
    code: str,
    message: str,
    line_number: int | None,
    level: str,
) -> dict | None:

    if not line_number:
        return None

    try:
        tree = ast.parse(code)
    except SyntaxError:
        return None

    variable_types = discover_simple_types(tree)

    target_node = find_node_at_line(
        tree,
        line_number,
    )

    if target_node is None:
        return None

    candidate = find_incompatible_addition(
        target_node,
        variable_types,
    )

    if candidate is None:
        return None

    left_type = candidate["left_type"]
    right_type = candidate["right_type"]

    if (
        left_type in {
            "numeric_string",
            "numeric_float_string",
        }
        and right_type in {
            "int",
            "float",
        }
    ):
        return create_numeric_conversion_fix(
            code=code,
            tree=tree,
            target=candidate["node"],
            convert_side="left",
            source_type=left_type,
            level=level,
        )

    if (
        right_type in {
            "numeric_string",
            "numeric_float_string",
        }
        and left_type in {
            "int",
            "float",
        }
    ):
        return create_numeric_conversion_fix(
            code=code,
            tree=tree,
            target=candidate["node"],
            convert_side="right",
            source_type=right_type,
            level=level,
        )

    return None


# ============================================================
# DISCOVER SIMPLE VARIABLE TYPES
# ============================================================

def discover_simple_types(
    tree: ast.AST,
) -> dict:

    variable_types = {}

    for node in ast.walk(tree):

        if not isinstance(node, ast.Assign):
            continue

        if len(node.targets) != 1:
            continue

        target = node.targets[0]

        if not isinstance(target, ast.Name):
            continue

        detected = detect_literal_type(
            node.value,
        )

        if detected:
            variable_types[target.id] = detected

    return variable_types


# ============================================================
# DETECT LITERAL TYPES
# ============================================================

def detect_literal_type(
    node: ast.AST,
) -> str | None:

    if not isinstance(node, ast.Constant):
        return None

    value = node.value

    if isinstance(value, bool):
        return "bool"

    if isinstance(value, int):
        return "int"

    if isinstance(value, float):
        return "float"

    if isinstance(value, str):

        stripped = value.strip()

        try:
            int(stripped)
            return "numeric_string"

        except ValueError:
            pass

        try:
            float(stripped)
            return "numeric_float_string"

        except ValueError:
            return "str"

    return None


# ============================================================
# DETERMINE EXPRESSION TYPE
# ============================================================

def infer_expression_type(
    node: ast.AST,
    variable_types: dict,
) -> str | None:

    literal_type = detect_literal_type(
        node,
    )

    if literal_type:
        return literal_type

    if isinstance(node, ast.Name):
        return variable_types.get(
            node.id,
        )

    return None


# ============================================================
# FIND NODE ON FAILING LINE
# ============================================================

def find_node_at_line(
    tree: ast.AST,
    line_number: int,
) -> ast.AST | None:

    candidates = []

    for node in ast.walk(tree):

        node_line = getattr(
            node,
            "lineno",
            None,
        )

        end_line = getattr(
            node,
            "end_lineno",
            node_line,
        )

        if (
            node_line is not None
            and end_line is not None
            and node_line <= line_number <= end_line
        ):
            candidates.append(node)

    if not candidates:
        return None

    candidates.sort(
        key=lambda item: (
            getattr(
                item,
                "lineno",
                0,
            ),
            -getattr(
                item,
                "end_lineno",
                0,
            ),
        )
    )

    return candidates[0]


# ============================================================
# FIND INCOMPATIBLE +
# ============================================================

def find_incompatible_addition(
    node: ast.AST,
    variable_types: dict,
) -> dict | None:

    for child in ast.walk(node):

        if not isinstance(
            child,
            ast.BinOp,
        ):
            continue

        if not isinstance(
            child.op,
            ast.Add,
        ):
            continue

        left_type = infer_expression_type(
            child.left,
            variable_types,
        )

        right_type = infer_expression_type(
            child.right,
            variable_types,
        )

        if not left_type or not right_type:
            continue

        incompatible = (
            (
                left_type in {
                    "numeric_string",
                    "numeric_float_string",
                    "str",
                }
                and right_type in {
                    "int",
                    "float",
                }
            )
            or
            (
                right_type in {
                    "numeric_string",
                    "numeric_float_string",
                    "str",
                }
                and left_type in {
                    "int",
                    "float",
                }
            )
        )

        if incompatible:
            return {
                "node": child,
                "left_type": left_type,
                "right_type": right_type,
            }

    return None


# ============================================================
# AST TRANSFORMER
# ============================================================

class NumericConversionTransformer(
    ast.NodeTransformer
):

    def __init__(
        self,
        target_node: ast.BinOp,
        convert_side: str,
        converter: str,
    ):
        self.target_node = target_node
        self.convert_side = convert_side
        self.converter = converter
        self.changed = False

    def visit_BinOp(
        self,
        node: ast.BinOp,
    ):

        self.generic_visit(node)

        if (
            node.lineno
            != self.target_node.lineno
        ):
            return node

        if (
            node.col_offset
            != self.target_node.col_offset
        ):
            return node

        if not isinstance(
            node.op,
            ast.Add,
        ):
            return node

        conversion = ast.Call(
            func=ast.Name(
                id=self.converter,
                ctx=ast.Load(),
            ),
            args=[],
            keywords=[],
        )

        if self.convert_side == "left":
            conversion.args = [node.left]
            node.left = conversion

        else:
            conversion.args = [node.right]
            node.right = conversion

        self.changed = True

        return node


# ============================================================
# CREATE SAFE NUMERIC CONVERSION FIX
# ============================================================

def create_numeric_conversion_fix(
    code: str,
    tree: ast.AST,
    target: ast.BinOp,
    convert_side: str,
    source_type: str,
    level: str,
) -> dict | None:

    converter = (
        "float"
        if source_type == "numeric_float_string"
        else "int"
    )

    copied_tree = deepcopy(
        tree,
    )

    transformer = NumericConversionTransformer(
        target_node=target,
        convert_side=convert_side,
        converter=converter,
    )

    transformed = transformer.visit(
        copied_tree,
    )

    ast.fix_missing_locations(
        transformed,
    )

    if not transformer.changed:
        return None

    try:
        fixed_code = ast.unparse(
            transformed,
        )

    except Exception:
        return None

    if level == "basic":
        changes = (
            f"ModelMind converts the numeric text to a {converter} "
            "before doing the calculation."
        )

        how_to_fix = (
            f"Use {converter}(...) to turn numeric text into a number "
            "before arithmetic."
        )

    elif level == "medium":
        changes = (
            f"ModelMind detected numeric text being combined with a "
            f"number and added an explicit {converter}(...) conversion."
        )

        how_to_fix = (
            "Convert the value at the point where its intended numeric "
            "meaning is clear. Avoid converting arbitrary text."
        )

    else:
        changes = (
            f"ModelMind inserted an explicit {converter}(...) coercion "
            "for a statically detectable numeric-string operand."
        )

        how_to_fix = (
            "Prefer validating and converting numeric text at the input "
            "boundary. This local rewrite is safe only because the value "
            "is statically identifiable as numeric text."
        )

    return {
        "code": fixed_code,
        "changes": changes,
        "how_to_fix": how_to_fix,
        "confidence": 0.96,
        "safe_to_apply": True,
    }