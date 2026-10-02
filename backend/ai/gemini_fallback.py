import json
import traceback

from google import genai
from google.genai import errors
from google.genai import types
from pydantic import BaseModel, Field


MODEL_NAME = "gemini-3.8-flash"


class GeminiDebugOutput(BaseModel):
    title: str = Field(
        description=(
            "Short human-friendly title "
            "for the programming error."
        )
    )

    explanation: str = Field(
        description=(
            "Clear explanation of what happened."
        )
    )

    why: str = Field(
        description=(
            "Technical root cause of the error."
        )
    )

    how_to_fix: str = Field(
        description=(
            "Clear instructions for correcting "
            "the problem."
        )
    )

    suggestions: list[str] = Field(
        default_factory=list,
        description=(
            "Possible diagnostic or correction "
            "approaches. Include useful Python "
            "code when appropriate."
        ),
    )

    fixed_code: str = Field(
        default="",
        description=(
            "Complete corrected code only when "
            "there is one clearly safe correction. "
            "Otherwise return an empty string."
        ),
    )

    changes: str = Field(
        default="",
        description=(
            "Explanation of the proposed code "
            "change or useful diagnostic."
        ),
    )


def _learning_instruction(
    level: str,
) -> str:
    normalized = level.strip().lower()

    if normalized == "advanced":
        return (
            "The learner selected Advanced. "
            "Explain relevant library behavior, "
            "shapes, dtypes, APIs, numerical "
            "concerns, ML methodology, data "
            "leakage, device issues, or production "
            "implications when relevant."
        )

    if normalized == "medium":
        return (
            "The learner selected Medium. "
            "Explain both the immediate cause "
            "and the important Python or library "
            "concept behind it."
        )

    return (
        "The learner selected Basic. Use "
        "beginner-friendly language, explain "
        "technical terms simply, and give small "
        "understandable steps."
    )


def analyze_with_gemini(
    *,
    api_key: str,
    code: str,
    traceback: str,
    action: str,
    level: str,
) -> dict:
    """
    Advanced fallback for errors that ModelMind's
    deterministic local engine could not
    confidently handle.
    """

    key = api_key.strip()

    if not key:
        raise ValueError(
            "Gemini API key is required."
        )

    if len(code) > 50000:
        raise ValueError(
            "Code is too large for Gemini fallback."
        )

    if len(traceback) > 20000:
        raise ValueError(
            "Traceback is too large for "
            "Gemini fallback."
        )

    requested_action = (
        action
        if action in {"explain", "fix"}
        else "explain"
    )

    client = genai.Client(
        api_key=key
    )

    prompt = f"""
You are the advanced fallback debugger inside an educational
ML coding platform named ModelMind.

ModelMind already tried deterministic local error rules and
could not confidently resolve this error.

Your job is to analyze ONLY the supplied Python code and
traceback.

IMPORTANT RULES:

1. Do not claim that code was executed.
2. Do not invent variable values, dataframe columns, shapes,
   files, package versions, devices, or runtime state that
   are not supported by the supplied evidence.
3. Clearly distinguish facts visible in the traceback/code
   from likely causes.
4. Never silently change the student's code.
5. If several corrections are possible, leave fixed_code
   empty and provide guided alternatives in suggestions.
6. Only populate fixed_code when one correction is strongly
   supported and does not require guessing the student's
   intention.
7. If fixed_code is populated, return the COMPLETE corrected
   cell, not only a fragment.
8. Preserve the student's overall approach whenever possible.
9. Do not include Markdown fences in fixed_code.
10. Suggestions may contain short Python diagnostic examples.
11. This is an educational debugger, so explain why the
    error occurred.
12. Do not expose or mention the API key.
13. Do not tell the user that you ran, tested, or verified
    code unless explicitly shown in the supplied traceback.
14. Requested debugger action: {requested_action}.

LEARNING LEVEL:
{_learning_instruction(level)}

STUDENT CODE:
---------------- MODEL INPUT CODE ----------------
{code}
---------------- END MODEL INPUT CODE ------------

PYTHON TRACEBACK:
---------------- TRACEBACK ------------------------
{traceback}
---------------- END TRACEBACK --------------------

Return a structured debugging result.
""".strip()

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiDebugOutput,
                temperature=0.2,
            ),
        )

    except errors.APIError as error:
        print(
            "\n========== GEMINI API ERROR =========="
        )
        print(
            f"Code: {error.code}"
        )
        print(
            f"Message: {error.message}"
        )
        print(
            "========== END GEMINI API ERROR ==========\n"
        )

        raise RuntimeError(
            "Gemini request failed."
        ) from error

    except Exception as error:
        print(
            "\n========== GEMINI PROVIDER ERROR =========="
        )
        print(
            f"Type: {type(error).__name__}"
        )
        print(
            f"Message: {str(error)}"
        )
        print(
            "========== END GEMINI PROVIDER ERROR ==========\n"
        )

        raise RuntimeError(
            "Gemini request failed."
        ) from error

    except Exception as error:
        print(
            "\n"
            "========== GEMINI PROVIDER ERROR "
            "=========="
        )

        traceback_module = traceback

        traceback_module.print_exception(
            type(error),
            error,
            error.__traceback__,
        )

        print(
            "========== END GEMINI PROVIDER ERROR "
            "==========\n"
        )

        raise RuntimeError(
            "Gemini request failed."
        ) from error

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    try:
        parsed = json.loads(
            response.text
        )

        output = GeminiDebugOutput(
            **parsed
        )

    except Exception as error:
        print(
            "\n"
            "========== GEMINI PARSING ERROR "
            "=========="
        )

        traceback.print_exception(
            type(error),
            error,
            error.__traceback__,
        )

        print(
            "========== END GEMINI PARSING ERROR "
            "==========\n"
        )

        raise RuntimeError(
            "Gemini returned an invalid "
            "structured response."
        ) from error

    return {
        "handled": True,
        "confidence": 0.75,
        "error_type": "AIAnalyzedError",
        "title": output.title,
        "line_number": None,
        "failing_line": "",
        "explanation": output.explanation,
        "why": output.why,
        "how_to_fix": output.how_to_fix,
        "suggestions": output.suggestions,
        "fixed_code": output.fixed_code,
        "changes": output.changes,
        "source": "gemini",
        "model": MODEL_NAME,
    }