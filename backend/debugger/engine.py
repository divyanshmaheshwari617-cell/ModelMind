import ast
from copy import deepcopy

from .parser import parse_traceback, get_source_line
from .error_rules import get_error_rule


# ============================================================
# MAIN MODELMIND ERROR ENGINE
# ============================================================

def analyze_error(
    code: str,
    traceback: str,
    level: str = "Basic",
) -> dict:

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
        level,
    )

    # --------------------------------------------------------
    # UNKNOWN ERROR
    # --------------------------------------------------------

    if rule is None:
        return {
            "handled": False,
            "confidence": 0.20,
            "error_type": error_type,
            "title": "Python Error",
            "line_number": line_number,
            "failing_line": failing_line,
            "explanation": (
                "ModelMind detected the Python error, "
                "but the local engine does not yet have "
                "a high-confidence explanation for it."
            ),
            "why": message,
            "how_to_fix": (
                "This error requires more advanced analysis."
            ),
            "fixed_code": "",
            "changes": "",
        }

    # --------------------------------------------------------
    # DEFAULT RESULT
    # --------------------------------------------------------

    result = {
        "handled": True,
        "confidence": 0.90,
        "error_type": error_type,
        "title": rule["title"],
        "line_number": line_number,
        "failing_line": failing_line,
        "explanation": rule["explanation"],
        "why": message,
        "how_to_fix": build_fix_guidance(
            error_type,
            message,
        ),
        "fixed_code": "",
        "changes": "",
    }

    # --------------------------------------------------------
    # TRY TO GENERATE SAFE FIX
    # --------------------------------------------------------

    fix = generate_safe_fix(
        code=code,
        error_type=error_type,
        message=message,
        line_number=line_number,
    )

    if fix is not None:

        result["fixed_code"] = fix["code"]

        result["changes"] = fix["changes"]

        result["how_to_fix"] = fix["how_to_fix"]

        result["confidence"] = fix["confidence"]

    return result


# ============================================================
# FIX GUIDANCE
# ============================================================

def build_fix_guidance(
    error_type: str,
    message: str,
) -> str:

    if error_type == "TypeError":
        return (
            "Check the types of the values involved in "
            "the operation. Values should only be "
            "converted when the conversion matches the "
            "intended meaning of the program."
        )

    if error_type == "NameError":
        return (
            "Check that the variable is spelled correctly "
            "and has been defined before it is used."
        )

    if error_type == "ValueError":
        return (
            "Check the value being passed to the operation. "
            "Its type may be correct while its actual value "
            "is invalid."
        )

    if error_type == "IndexError":
        return (
            "Check the length of the sequence and make sure "
            "the requested index exists."
        )

    if error_type == "KeyError":
        return (
            "Check whether the dictionary key exists before "
            "accessing it."
        )

    if error_type == "AttributeError":
        return (
            "Check the object's type and verify that the "
            "requested attribute or method exists."
        )

    if error_type == "ZeroDivisionError":
        return (
            "Check the denominator before performing "
            "division."
        )

    if error_type == "ModuleNotFoundError":
        return (
            "Check the module name and whether the required "
            "package is installed."
        )

    if error_type == "FileNotFoundError":
        return (
            "Check the file name, path and current working "
            "directory."
        )

    return (
        "Inspect the failing line and the values involved "
        "in the operation."
    )


# ============================================================
# SAFE FIX CONTROLLER
# ============================================================

def generate_safe_fix(
    code: str,
    error_type: str,
    message: str,
    line_number: int | None,
) -> dict | None:

    if error_type == "TypeError":

        fix = fix_type_error(
            code,
            message,
            line_number,
        )

        if fix:
            return fix

    if error_type == "ZeroDivisionError":

        fix = fix_zero_division(
            code,
            line_number,
        )

        if fix:
            return fix

    return None


# ============================================================
# TYPE ERROR FIXER
# ============================================================

def fix_type_error(
    code: str,
    message: str,
    line_number: int | None,
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

    # --------------------------------------------------------
    # CASE:
    #
    # string variable + integer
    #
    # age = "20"
    # print(age + 5)
    # --------------------------------------------------------

    if (
        left_type == "numeric_string"
        and right_type in {"int", "float"}
    ):

        return create_numeric_conversion_fix(
            code=code,
            tree=tree,
            target=candidate["node"],
            convert_side="left",
        )

    # --------------------------------------------------------
    # CASE:
    #
    # integer + numeric string variable
    # --------------------------------------------------------

    if (
        right_type == "numeric_string"
        and left_type in {"int", "float"}
    ):

        return create_numeric_conversion_fix(
            code=code,
            tree=tree,
            target=candidate["node"],
            convert_side="right",
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

        value = node.value

        detected = detect_literal_type(value)

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

    literal_type = detect_literal_type(node)

    if literal_type:
        return literal_type

    if isinstance(node, ast.Name):
        return variable_types.get(node.id)

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

    # Return the broadest statement/expression
    # containing the failing line.

    candidates.sort(
        key=lambda item: (
            getattr(item, "lineno", 0),
            -getattr(item, "end_lineno", 0),
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

        if not isinstance(child, ast.BinOp):
            continue

        if not isinstance(child.op, ast.Add):
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
    ):
        self.target_node = target_node
        self.convert_side = convert_side
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

        if self.convert_side == "left":

            node.left = ast.Call(
                func=ast.Name(
                    id="int",
                    ctx=ast.Load(),
                ),
                args=[node.left],
                keywords=[],
            )

        else:

            node.right = ast.Call(
                func=ast.Name(
                    id="int",
                    ctx=ast.Load(),
                ),
                args=[node.right],
                keywords=[],
            )

        self.changed = True

        return node


# ============================================================
# CREATE FIXED CODE
# ============================================================

def create_numeric_conversion_fix(
    code: str,
    tree: ast.AST,
    target: ast.BinOp,
    convert_side: str,
) -> dict | None:

    copied_tree = deepcopy(tree)

    transformer = (
        NumericConversionTransformer(
            target_node=target,
            convert_side=convert_side,
        )
    )

    transformed = transformer.visit(
        copied_tree
    )

    ast.fix_missing_locations(
        transformed
    )

    if not transformer.changed:
        return None

    try:
        fixed_code = ast.unparse(
            transformed
        )
    except Exception:
        return None

    return {
        "code": fixed_code,

        "changes": (
            "ModelMind detected a numeric string "
            "being used with a number. It converts "
            "the numeric string to an integer before "
            "performing arithmetic."
        ),

        "how_to_fix": (
            "Convert the numeric string to a number "
            "before performing arithmetic. "
            "For example, int(\"20\") becomes 20."
        ),

        "confidence": 0.96,
    }


# ============================================================
# ZERO DIVISION
# ============================================================

def fix_zero_division(
    code: str,
    line_number: int | None,
) -> dict | None:

    # We explain ZeroDivisionError locally,
    # but we intentionally do not rewrite the
    # program automatically because the correct
    # behavior depends on the program's intent.

    return None