import re


def parse_traceback(traceback: str) -> dict:
    """
    Parse a Python traceback into a stable structure for ModelMind.

    Important:
    Many scientific/ML libraries produce multiline exception messages.
    The parser therefore preserves the complete final exception block
    instead of keeping only the first line.

    Examples:
        ValueError: invalid value

        sklearn.exceptions.NotFittedError: estimator is not fitted

        cv2.error: OpenCV(...)
        > Overload resolution failed:
        > ...

        ValueError: Exception encountered when calling Sequential.call().

        Input 0 of layer "dense" is incompatible with the layer:
        expected axis -1 of input shape to have value 2,
        but received input with shape (2, 3)
    """

    result = {
        "error_type": "PythonError",
        "qualified_error_type": "",
        "message": "",
        "line_number": None,
        "failing_line": "",
    }

    if not traceback:
        return result

    traceback = traceback.replace("\r\n", "\n").replace("\r", "\n")

    # --------------------------------------------------------
    # ERROR TYPE + COMPLETE MESSAGE
    # --------------------------------------------------------
    #
    # Instead of searching only:
    #
    # ValueError: first line
    #
    # we find every exception-looking line and use the LAST one
    # as the beginning of the final exception block.
    #
    # This is important for chained exceptions and library
    # tracebacks.
    #
    # Supports:
    #
    # ValueError: ...
    # sklearn.exceptions.NotFittedError: ...
    # pandas.errors.ParserError: ...
    # numpy.exceptions.AxisError: ...
    # cv2.error: ...
    #
    # ModelMind stores:
    #
    # error_type
    #     NotFittedError
    #
    # qualified_error_type
    #     sklearn.exceptions.NotFittedError
    #

    exception_pattern = re.compile(
        r"^("
        r"(?:[A-Za-z_][A-Za-z0-9_]*\.)*"
        r"[A-Za-z_][A-Za-z0-9_]*"
        r"(?:Error|Exception|Warning|error)"
        r")"
        r":\s*(.*)$",
        re.MULTILINE,
    )

    matches = list(
        exception_pattern.finditer(traceback)
    )

    if matches:
        error_match = matches[-1]

        qualified_error_type = (
            error_match.group(1).strip()
        )

        first_message_line = (
            error_match.group(2).strip()
        )

        # Preserve everything after the final exception line.
        # Libraries such as TensorFlow/Keras and OpenCV frequently
        # place the useful diagnosis on following lines.
        remaining_text = traceback[
            error_match.end():
        ].strip()

        message_parts = []

        if first_message_line:
            message_parts.append(
                first_message_line
            )

        if remaining_text:
            message_parts.append(
                remaining_text
            )

        message = "\n".join(
            message_parts
        ).strip()

        error_type = (
            qualified_error_type
            .split(".")[-1]
        )

        # cv2.error is a real OpenCV exception class.
        # Keep "error" as the error type while preserving the fully
        # qualified name "cv2.error" for library identification.
        result["error_type"] = error_type
        result["qualified_error_type"] = (
            qualified_error_type
        )
        result["message"] = message

    # --------------------------------------------------------
    # FALLBACK ERROR DETECTION
    # --------------------------------------------------------
    #
    # Some native/compiled libraries can format their final error
    # differently. If the strict parser did not find an exception,
    # try a conservative final-line parser.
    #

    if not matches:
        lines = [
            line.strip()
            for line in traceback.splitlines()
            if line.strip()
        ]

        for line in reversed(lines):
            fallback_match = re.match(
                r"^("
                r"(?:[A-Za-z_][A-Za-z0-9_]*\.)*"
                r"[A-Za-z_][A-Za-z0-9_]*"
                r")"
                r":\s*(.+)$",
                line,
            )

            if not fallback_match:
                continue

            qualified_error_type = (
                fallback_match.group(1)
            )

            # Avoid accidentally interpreting ordinary traceback
            # text such as URLs or Windows paths as exception names.
            if not re.fullmatch(
                r"(?:[A-Za-z_][A-Za-z0-9_]*\.)*"
                r"[A-Za-z_][A-Za-z0-9_]*",
                qualified_error_type,
            ):
                continue

            result["qualified_error_type"] = (
                qualified_error_type
            )

            result["error_type"] = (
                qualified_error_type
                .split(".")[-1]
            )

            result["message"] = (
                fallback_match
                .group(2)
                .strip()
            )

            break

    # --------------------------------------------------------
    # LINE NUMBER
    # --------------------------------------------------------
    #
    # Python tracebacks may contain many frames.
    # The final File "...", line N entry is normally the frame
    # closest to the exception.
    #

    line_matches = re.findall(
        r'File ".*?", line (\d+)',
        traceback,
    )

    if line_matches:
        result["line_number"] = int(
            line_matches[-1]
        )

    return result


def get_source_line(
    code: str,
    line_number: int | None,
) -> str:
    """
    Return the source-code line corresponding to the parsed
    traceback line number.
    """

    if not line_number:
        return ""

    lines = code.splitlines()

    if 1 <= line_number <= len(lines):
        return lines[
            line_number - 1
        ].strip()

    return ""