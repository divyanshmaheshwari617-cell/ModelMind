from __future__ import annotations

import importlib.metadata
import re
import subprocess
import sys
from typing import Any


# ==========================================================
# VERIFIED IMPORT -> PYPI PACKAGE MAPPINGS
# ==========================================================
#
# These mappings are intentionally explicit.
#
# ModelMind may confidently offer one-click installation
# ONLY when the import name appears here.
#
# This prevents:
#
#     import random_unknown_name
#
# from automatically becoming:
#
#     pip install random_unknown_name
#
# which could install the wrong or unsafe package.


VERIFIED_PACKAGE_MAP: dict[str, str] = {
    # Data / scientific Python
    "numpy": "numpy",
    "pandas": "pandas",
    "scipy": "scipy",
    "statsmodels": "statsmodels",

    # Machine learning
    "sklearn": "scikit-learn",
    "xgboost": "xgboost",
    "lightgbm": "lightgbm",
    "catboost": "catboost",
    "imblearn": "imbalanced-learn",

    # Deep learning
    "torch": "torch",
    "tensorflow": "tensorflow",
    "keras": "keras",

    # Visualization
    "matplotlib": "matplotlib",
    "seaborn": "seaborn",
    "plotly": "plotly",

    # Computer vision / images
    "cv2": "opencv-python",
    "PIL": "Pillow",
    "skimage": "scikit-image",

    # Utilities
    "joblib": "joblib",
    "yaml": "PyYAML",
    "bs4": "beautifulsoup4",
    "dateutil": "python-dateutil",
    "dotenv": "python-dotenv",

    # Common data / ML tools
    "openpyxl": "openpyxl",
    "requests": "requests",
    "tqdm": "tqdm",
    "sympy": "sympy",
}


PACKAGE_NAME_PATTERN = re.compile(
    r"^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$"
)

VERSION_PATTERN = re.compile(
    r"^[A-Za-z0-9][A-Za-z0-9.*+!_-]{0,99}$"
)


# ==========================================================
# IMPORT NORMALIZATION
# ==========================================================


def normalize_import_name(
    import_name: str,
) -> str:
    """
    Convert an import path to its top-level module.

    Examples:

        sklearn.model_selection
            -> sklearn

        matplotlib.pyplot
            -> matplotlib

        cv2
            -> cv2
    """

    return (
        import_name
        .strip()
        .split(".")[0]
    )


# ==========================================================
# PACKAGE RESOLUTION
# ==========================================================


def resolve_package_for_import(
    import_name: str,
) -> dict[str, Any]:
    """
    Resolve a Python import to a VERIFIED PyPI package.

    This function intentionally does not assume that an
    unknown import name is also the correct PyPI package.

    Example:

        cv2
            -> opencv-python
            verified=True

        sklearn
            -> scikit-learn
            verified=True

        randomabcxyz
            -> package_name=None
            verified=False
    """

    module_name = normalize_import_name(
        import_name
    )

    if not module_name:
        raise ValueError(
            "Import name is required."
        )

    package_name = VERIFIED_PACKAGE_MAP.get(
        module_name
    )

    if package_name is None:
        return {
            "import_name": module_name,
            "package_name": None,
            "verified": False,
        }

    return {
        "import_name": module_name,
        "package_name": package_name,
        "verified": True,
    }


def package_for_import(
    import_name: str,
) -> str | None:
    """
    Compatibility helper.

    Returns the verified package name or None.
    """

    resolution = resolve_package_for_import(
        import_name
    )

    return resolution["package_name"]


# ==========================================================
# VALIDATION
# ==========================================================


def validate_package_name(
    package_name: str,
) -> str:
    package_name = package_name.strip()

    if not package_name:
        raise ValueError(
            "Package name is required."
        )

    if not PACKAGE_NAME_PATTERN.fullmatch(
        package_name
    ):
        raise ValueError(
            "Invalid package name."
        )

    return package_name


def validate_version(
    version: str | None,
) -> str | None:
    if version is None:
        return None

    version = version.strip()

    if not version:
        return None

    if not VERSION_PATTERN.fullmatch(
        version
    ):
        raise ValueError(
            "Invalid package version."
        )

    return version


# ==========================================================
# INSTALLED PACKAGES
# ==========================================================


def installed_packages() -> list[dict[str, str]]:
    """
    Return packages installed in the exact Python
    environment running the ModelMind backend.
    """

    packages: list[dict[str, str]] = []

    for distribution in (
        importlib.metadata.distributions()
    ):
        try:
            name = (
                distribution.metadata.get(
                    "Name"
                )
                or ""
            ).strip()

            version = (
                distribution.version
                or ""
            ).strip()

            if not name:
                continue

            packages.append(
                {
                    "name": name,
                    "version": version,
                }
            )

        except Exception:
            continue

    packages.sort(
        key=lambda item: item["name"].lower()
    )

    return packages


def find_installed_package(
    package_name: str,
) -> dict[str, Any]:
    package_name = validate_package_name(
        package_name
    )

    try:
        version = importlib.metadata.version(
            package_name
        )

        return {
            "installed": True,
            "package": package_name,
            "version": version,
        }

    except importlib.metadata.PackageNotFoundError:
        return {
            "installed": False,
            "package": package_name,
            "version": None,
        }


# ==========================================================
# IMPORT STATUS
# ==========================================================


def package_status_for_import(
    import_name: str,
) -> dict[str, Any]:
    resolution = resolve_package_for_import(
        import_name
    )

    module_name = resolution[
        "import_name"
    ]

    package_name = resolution[
        "package_name"
    ]

    verified = resolution[
        "verified"
    ]


    # Unknown import.
    #
    # We deliberately do NOT guess a package.
    if not verified or package_name is None:
        return {
            "import_name": module_name,
            "package_name": None,
            "verified": False,
            "installed": False,
            "version": None,
        }


    status = find_installed_package(
        package_name
    )

    return {
        "import_name": module_name,
        "package_name": package_name,
        "verified": True,
        "installed": status["installed"],
        "version": status["version"],
    }


# ==========================================================
# PACKAGE INSTALLATION
# ==========================================================


def install_package(
    package_name: str,
    version: str | None = None,
) -> dict[str, Any]:
    """
    Install a package into the SAME Python environment
    running the ModelMind development backend.

    IMPORTANT:

    Current development:
        backend Python environment

    Production later:
        isolated per-project environment/container
    """

    package_name = validate_package_name(
        package_name
    )

    version = validate_version(version)

    requested_package = package_name

    if version:
        requested_package = (
            f"{package_name}=={version}"
        )


    command = [
        sys.executable,
        "-m",
        "pip",
        "install",
        requested_package,
        "--disable-pip-version-check",
        "--no-input",
    ]


    try:
        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=600,
            shell=False,
        )

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "package": package_name,
            "requested_version": version,
            "version": None,
            "message":
                "Package installation timed out.",
            "stdout": "",
            "stderr":
                "Installation exceeded the "
                "10 minute development limit.",
        }

    except Exception as error:
        return {
            "success": False,
            "package": package_name,
            "requested_version": version,
            "version": None,
            "message":
                "Package installation could not start.",
            "stdout": "",
            "stderr": str(error),
        }


    if process.returncode != 0:
        return {
            "success": False,
            "package": package_name,
            "requested_version": version,
            "version": None,
            "message":
                "Package installation failed.",
            "stdout":
                process.stdout[-8000:],
            "stderr":
                process.stderr[-8000:],
        }


    try:
        installed_version = (
            importlib.metadata.version(
                package_name
            )
        )

    except importlib.metadata.PackageNotFoundError:
        installed_version = None


    return {
        "success": True,
        "package": package_name,
        "requested_version": version,
        "version": installed_version,
        "message":
            f"{package_name} installed successfully.",
        "stdout":
            process.stdout[-8000:],
        "stderr":
            process.stderr[-8000:],
    }