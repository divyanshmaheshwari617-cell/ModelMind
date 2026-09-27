import re


def parse_traceback(traceback: str) -> dict:
    result = {
        "error_type": "PythonError",
        "message": "",
        "line_number": None,
        "failing_line": "",
    }

    if not traceback:
        return result

    # Example:
    # TypeError: can only concatenate str ...
    error_match = re.search(
        r"^([A-Za-z_][A-Za-z0-9_]*(?:Error|Exception)):\s*(.*)$",
        traceback,
        re.MULTILINE,
    )

    if error_match:
        result["error_type"] = error_match.group(1)
        result["message"] = error_match.group(2).strip()

    # Find traceback line numbers.
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