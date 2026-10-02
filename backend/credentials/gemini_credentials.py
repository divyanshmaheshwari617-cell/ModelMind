from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

from google import genai


# ============================================================
# MODELMIND GEMINI CREDENTIAL STORAGE
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

SECRETS_DIR = BACKEND_DIR / ".modelmind"

CREDENTIAL_FILE = (
    SECRETS_DIR / "gemini_credentials.json"
)

MODEL_NAME = "gemini-3.8-flash"


# ============================================================
# INTERNAL HELPERS
# ============================================================

def _ensure_secret_directory() -> None:
    SECRETS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


def _read_credentials() -> dict:
    if not CREDENTIAL_FILE.exists():
        return {}

    try:
        with CREDENTIAL_FILE.open(
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

        if isinstance(data, dict):
            return data

        return {}

    except (
        OSError,
        json.JSONDecodeError,
    ):
        return {}


# ============================================================
# GET SAVED KEY
# ============================================================

def get_gemini_api_key() -> Optional[str]:
    data = _read_credentials()

    api_key = data.get(
        "gemini_api_key",
        "",
    )

    if not isinstance(api_key, str):
        return None

    api_key = api_key.strip()

    if not api_key:
        return None

    return api_key


# ============================================================
# CONNECTION STATUS
# ============================================================

def has_gemini_api_key() -> bool:
    return (
        get_gemini_api_key()
        is not None
    )


def get_gemini_status() -> dict:
    connected = has_gemini_api_key()

    return {
        "connected": connected,
        "provider": "gemini",
        "model": MODEL_NAME,
    }


# ============================================================
# VALIDATE KEY
# ============================================================

def validate_gemini_api_key(
    api_key: str,
) -> tuple[bool, str]:
    clean_key = api_key.strip()

    if not clean_key:
        return (
            False,
            "Enter a Gemini API key.",
        )

    try:
        client = genai.Client(
            api_key=clean_key,
        )

        response = (
            client.models.generate_content(
                model=MODEL_NAME,
                contents=(
                    "Reply with exactly: "
                    "MODELMIND_CONNECTED"
                ),
            )
        )

        text = (
            response.text or ""
        ).strip()

        if not text:
            return (
                False,
                "Gemini returned an empty response.",
            )

        return (
            True,
            "Gemini connected successfully.",
        )

    except Exception:
        # Do not expose the API key or raw
        # provider exception to the frontend.
        return (
            False,
            (
                "Gemini connection failed. "
                "Check the API key and try again."
            ),
        )


# ============================================================
# SAVE KEY
# ============================================================

def save_gemini_api_key(
    api_key: str,
) -> dict:
    clean_key = api_key.strip()

    valid, message = (
        validate_gemini_api_key(
            clean_key
        )
    )

    if not valid:
        return {
            "success": False,
            "connected": False,
            "message": message,
        }

    _ensure_secret_directory()

    data = {
        "gemini_api_key": clean_key,
    }

    temporary_file = (
        CREDENTIAL_FILE.with_suffix(
            ".tmp"
        )
    )

    try:
        with temporary_file.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                data,
                file,
                indent=2,
            )

        os.replace(
            temporary_file,
            CREDENTIAL_FILE,
        )

    finally:
        if temporary_file.exists():
            try:
                temporary_file.unlink()
            except OSError:
                pass

    return {
        "success": True,
        "connected": True,
        "message": (
            "Gemini connected successfully."
        ),
    }


# ============================================================
# REMOVE KEY
# ============================================================

def remove_gemini_api_key() -> dict:
    try:
        if CREDENTIAL_FILE.exists():
            CREDENTIAL_FILE.unlink()

    except OSError:
        return {
            "success": False,
            "connected": (
                has_gemini_api_key()
            ),
            "message": (
                "Could not remove the "
                "Gemini connection."
            ),
        }

    return {
        "success": True,
        "connected": False,
        "message": (
            "Gemini connection removed."
        ),
    }