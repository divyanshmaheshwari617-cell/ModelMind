import re


def parse_traceback(traceback: str) -> dict:
    result = {
        "error_type": "PythonError",
        "qualified_error_type": "",
        "message": "",
        "line_number": None,
        "failing_line": "",
    }

    if not traceback:
        return result

    # --------------------------------------------------------
    # ERROR TYPE + MESSAGE
    # --------------------------------------------------------
    #
    # Supports normal Python exceptions:
    #
    # ValueError: invalid value
    #
    # And qualified library exceptions:
    #
    # sklearn.exceptions.NotFittedError: estimator is not fitted
    # pandas.errors.ParserError: ...
    # numpy.exceptions.AxisError: ...
    #
    # ModelMind stores:
    #
    # error_type            -> NotFittedError
    # qualified_error_type  -> sklearn.exceptions.NotFittedError
    #

    error_match = re.search(
        r"^((?:[A-Za-z_][A-Za-z0-9_]*\.)*"
        r"[A-Za-z_][A-Za-z0-9_]*"
        r"(?:Error|Exception|Warning)):\s*(.*)$",
        traceback,
        re.MULTILINE,
    )

    if error_match:
        qualified_error_type = error_match.group(1)
        message = error_match.group(2).strip()

        error_type = qualified_error_type.split(".")[-1]

        result["error_type"] = error_type
        result["qualified_error_type"] = qualified_error_type
        result["message"] = message

    # --------------------------------------------------------
    # LINE NUMBER
    # --------------------------------------------------------

    line_matches = re.findall(
        r'File ".*?", line (\d+)',
        traceback,
    )

    if line_matches:
        result["line_number"] = int(line_matches[-1])

    return result


def get_source_line(
    code: str,
    line_number: int | None,
) -> str:

    if not line_number:
        return ""

    lines = code.splitlines()

    if 1 <= line_number <= len(lines):
        return lines[line_number - 1].strip()

    return ""