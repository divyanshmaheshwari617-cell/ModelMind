import io
import os
import traceback
from contextlib import redirect_stdout, redirect_stderr
from pathlib import Path


class PythonKernel:
    def __init__(self, workspace: Path):
        self.workspace = workspace

        # This dictionary is preserved between cell executions.
        # That gives ModelMind persistent variables/imports.
        self.namespace = {
            "__name__": "__main__",
        }

        self.execution_count = 0


    def execute(self, code: str) -> dict:
        self.execution_count += 1

        stdout_buffer = io.StringIO()
        stderr_buffer = io.StringIO()

        try:
            compiled = compile(
                code,
                "<modelmind-cell>",
                "exec",
            )

            old_directory = os.getcwd()

            try:
                # Uploaded files become available using:
                #
                # pd.read_csv("students.csv")
                #
                os.chdir(self.workspace)

                with (
                    redirect_stdout(stdout_buffer),
                    redirect_stderr(stderr_buffer),
                ):
                    exec(
                        compiled,
                        self.namespace,
                        self.namespace,
                    )

            finally:
                os.chdir(old_directory)

            return {
                "success": True,
                "execution_count": self.execution_count,
                "output": stdout_buffer.getvalue(),
                "stderr": stderr_buffer.getvalue(),
                "error": "",
            }

        except Exception:
            return {
                "success": False,
                "execution_count": self.execution_count,
                "output": stdout_buffer.getvalue(),
                "stderr": stderr_buffer.getvalue(),
                "error": traceback.format_exc(),
            }


    def variables(self) -> list[dict]:
        result = []

        for name, value in self.namespace.items():

            if name.startswith("__"):
                continue

            try:
                preview = repr(value)

                if len(preview) > 200:
                    preview = (
                        preview[:200] + "..."
                    )

                result.append(
                    {
                        "name": name,
                        "type": type(value).__name__,
                        "preview": preview,
                    }
                )

            except Exception:
                result.append(
                    {
                        "name": name,
                        "type": type(value).__name__,
                        "preview": "<unavailable>",
                    }
                )

        return result