import shutil
import tempfile
import uuid
from pathlib import Path

from .kernel import PythonKernel


class RuntimeSession:
    def __init__(
        self,
        session_id: str,
        workspace: Path,
    ):
        self.session_id = session_id
        self.workspace = workspace

        self.kernel = PythonKernel(
            workspace=workspace
        )


class RuntimeManager:
    def __init__(self):
        self.sessions: dict[
            str,
            RuntimeSession
        ] = {}

        self.root = (
            Path(tempfile.gettempdir())
            / "modelmind-runtimes"
        )

        self.root.mkdir(
            parents=True,
            exist_ok=True,
        )


    def create_session(
        self,
    ) -> RuntimeSession:

        session_id = str(
            uuid.uuid4()
        )

        workspace = (
            self.root / session_id
        )

        workspace.mkdir(
            parents=True,
            exist_ok=True,
        )

        session = RuntimeSession(
            session_id=session_id,
            workspace=workspace,
        )

        self.sessions[
            session_id
        ] = session

        return session


    def get_session(
        self,
        session_id: str,
    ) -> RuntimeSession | None:

        return self.sessions.get(
            session_id
        )


    def delete_session(
        self,
        session_id: str,
    ) -> bool:

        session = self.sessions.pop(
            session_id,
            None,
        )

        if session is None:
            return False

        if session.workspace.exists():
            shutil.rmtree(
                session.workspace,
                ignore_errors=True,
            )

        return True


runtime_manager = RuntimeManager()