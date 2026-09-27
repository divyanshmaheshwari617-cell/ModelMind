from pathlib import Path
import re


def safe_filename(
    filename: str,
) -> str:

    name = Path(filename).name

    name = re.sub(
        r"[^A-Za-z0-9._\- ]",
        "_",
        name,
    )

    if not name:
        name = "uploaded_file"

    return name


def list_workspace_files(
    workspace: Path,
) -> list[dict]:

    files = []

    for path in sorted(
        workspace.iterdir()
    ):

        if not path.is_file():
            continue

        files.append(
            {
                "name": path.name,
                "size": path.stat().st_size,
                "extension": path.suffix.lower(),
            }
        )

    return files