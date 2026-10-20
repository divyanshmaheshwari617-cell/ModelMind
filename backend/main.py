import os
import secrets
import time
from pathlib import Path
from urllib.parse import urlencode, urlsplit, urlunsplit

from fastapi import (
    FastAPI,
    File,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from jupyter_core.paths import jupyter_data_dir
from jupyter_server.serverapp import list_running_servers
from pydantic import BaseModel, Field
from runtime.packages import (
    installed_packages,
    package_status_for_import,
    install_package,
)
from ai.gemini_fallback import analyze_with_gemini

from debugger.engine import analyze_error
from runtime.manager import runtime_manager
from runtime.files import (
    safe_filename,
    list_workspace_files,
)
from intelligence.dataset import (
    analyze_dataset,
    analyze_target,
    analyze_feature,
)
from debugger.ml_mistake_detector import analyze_ml_mistakes
from debugger.code_explainer import explain_code
from intelligence.preprocessing_advisor import (
    analyze_preprocessing,
)
from intelligence.preprocessing_preview import (
    preview_preprocessing,
)
from intelligence.preprocessing_apply import (
    apply_preprocessing,
    undo_preprocessing,
)
app = FastAPI(
    title="ModelMind Backend",
    version="0.3.0",
)
pending_jupyter_launches: dict[str, float] = {}

try:
    jupyter_port = int(os.environ.get("MODELMIND_JUPYTER_PORT", "8899"))
except ValueError as error:
    raise ValueError("MODELMIND_JUPYTER_PORT must be a valid TCP port.") from error
if jupyter_port < 1 or jupyter_port > 65535:
    raise ValueError("MODELMIND_JUPYTER_PORT must be a valid TCP port.")

configured_origins = os.environ.get("MODELMIND_WEB_ORIGINS") or None
if configured_origins is not None:
    allowed_web_origins = [
        origin.strip().rstrip("/")
        for origin in configured_origins.split(",")
        if origin.strip()
    ]
    if not allowed_web_origins:
        raise ValueError("MODELMIND_WEB_ORIGINS must contain at least one website origin.")
else:
    allowed_web_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

for origin in allowed_web_origins:
    parsed_origin = urlsplit(origin)
    if (
        parsed_origin.scheme not in {"http", "https"}
        or not parsed_origin.netloc
        or parsed_origin.path
        or parsed_origin.query
        or parsed_origin.fragment
        or parsed_origin.username
        or parsed_origin.password
        or "*" in origin
    ):
        raise ValueError(
            "MODELMIND_WEB_ORIGINS must contain comma-separated HTTP(S) origins without paths or wildcards."
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_web_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def enforce_local_web_origin(request, call_next):
    origin = request.headers.get("origin")
    is_capability_navigation = (
        request.method == "GET" and request.url.path == "/jupyter/open"
    )
    if (
        not is_capability_navigation
        and origin is not None
        and origin not in allowed_web_origins
    ):
        return JSONResponse(
            status_code=403,
            content={"detail": "This website is not allowed to use the local ModelMind runtime."},
        )
    return await call_next(request)


# ==========================================
# REQUEST MODELS
# ==========================================

class RuntimeExecuteRequest(BaseModel):
    session_id: str
    code: str = Field(max_length=50000)


class DebugRequest(BaseModel):
    code: str = Field(max_length=50000)
    traceback: str = Field(max_length=20000)
    action: str = "explain"
    level: str = "Basic"
class GeminiDebugRequest(BaseModel):
    api_key: str = Field(
        min_length=1,
        max_length=500
    )

    code: str = Field(
        max_length=50000
    )

    traceback: str = Field(
        max_length=20000
    )

    action: str = "explain"

    level: str = "Basic"
class PackageInstallRequest(BaseModel):
    package: str
    version: str | None = None
class MLMistakeRequest(BaseModel):
    code: str
    level: str = "Basic"
class CodeExplainRequest(BaseModel):
    code: str = Field(max_length=50000)
    level: str = "Basic"
    
class PreprocessingPreviewRequest(BaseModel):
    feature: str
    strategy: str
    
class PreprocessingApplyRequest(BaseModel):
    feature: str
    strategy: str


# ==========================================
# BASIC API
# ==========================================

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "ModelMind Backend",
        "runtime": "v2",
        "debugger": "local",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "runtime": "v2",
    }


@app.post("/jupyter/prepare")
def prepare_jupyter(request: Request):
    if request.headers.get("origin") not in allowed_web_origins:
        return JSONResponse(
            status_code=403,
            content={"detail": "This website is not allowed to open the local notebook."},
        )

    now = time.monotonic()
    for launch_id, expires_at in list(pending_jupyter_launches.items()):
        if expires_at <= now:
            del pending_jupyter_launches[launch_id]

    launch_id = secrets.token_urlsafe(32)
    pending_jupyter_launches[launch_id] = now + 60
    return {"launch_id": launch_id}


@app.get("/jupyter/open")
def open_jupyter(
    launch_id: str | None = Query(default=None, min_length=32, max_length=128),
):
    if launch_id is None:
        return HTMLResponse(
            status_code=403,
            content=(
                "<!doctype html><html><head><title>Notebook link required</title>"
                "</head><body><h1>Open Notebook from ModelMind</h1>"
                "<p>Return to ModelMind and choose Open Notebook to create a secure link.</p>"
                "</body></html>"
            ),
        )
    expires_at = pending_jupyter_launches.pop(launch_id, None)
    if expires_at is None or expires_at <= time.monotonic():
        return HTMLResponse(
            status_code=403,
            content=(
                "<!doctype html><html><head><title>Notebook link expired</title>"
                "</head><body><h1>This notebook link has expired</h1>"
                "<p>Return to ModelMind and choose Open Notebook again.</p></body></html>"
            ),
        )

    runtime_directories = dict.fromkeys(
        directory
        for directory in (
            os.environ.get("JUPYTER_RUNTIME_DIR"),
            str(Path(__file__).resolve().parents[2] / ".jupyter_runtime"),
            str(Path(jupyter_data_dir()) / "runtime"),
        )
        if directory
    )
    for runtime_directory in runtime_directories:
        for server in list_running_servers(runtime_dir=runtime_directory):
            server_url = server.get("url")
            if not isinstance(server_url, str):
                continue

            try:
                parsed_url = urlsplit(server_url)
                port = int(server.get("port", parsed_url.port or 0))
            except (TypeError, ValueError):
                continue
            if (
                parsed_url.scheme != "http"
                or parsed_url.hostname not in {"127.0.0.1", "localhost"}
                or port != jupyter_port
            ):
                continue

            token = server.get("token")
            password_enabled = server.get("password") is True

            base_url = server.get("base_url")
            if not isinstance(base_url, str) or not base_url.startswith("/"):
                base_url = parsed_url.path or "/"
            lab_path = f"{base_url.rstrip('/')}/lab/"

            if isinstance(token, str) and token:
                query = urlencode({"token": token})
            elif password_enabled:
                query = ""
            else:
                query = ""

            launch_url = urlunsplit(
                ("http", f"127.0.0.1:{port}", lab_path, query, "")
            )
            return RedirectResponse(launch_url, status_code=303)

    return HTMLResponse(
        status_code=503,
        content=(
            "<!doctype html><html><head><title>ModelMind Notebook is not running</title>"
            "</head><body><h1>ModelMind Notebook is not running</h1>"
            "<p>Start the ModelMind companion on this computer, keep it running, "
            "and then choose Open Notebook again.</p></body></html>"
        ),
    )


# ==========================================
# PERSISTENT NOTEBOOK RUNTIME
# ==========================================

@app.post("/runtime")
def create_runtime():

    session = runtime_manager.create_session()

    return {
        "session_id": session.session_id,
        "status": "ready",
    }


@app.delete("/runtime/{session_id}")
def delete_runtime(
    session_id: str,
):

    deleted = runtime_manager.delete_session(
        session_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    return {
        "status": "deleted",
    }

# ==========================================
# PACKAGE / ENVIRONMENT MANAGER
# ==========================================


@app.get(
    "/runtime/{session_id}/packages"
)
def get_installed_packages(
    session_id: str,
):
    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    packages = installed_packages()

    return {
        "success": True,
        "count": len(packages),
        "packages": packages,
    }


@app.get(
    "/runtime/{session_id}/packages/status/{import_name}"
)
def get_package_status(
    session_id: str,
    import_name: str,
):
    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    try:
        return {
            "success": True,
            **package_status_for_import(
                import_name
            ),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@app.post(
    "/runtime/{session_id}/packages/install"
)
def install_runtime_package(
    session_id: str,
    request: PackageInstallRequest,
):
    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    try:
        result = install_package(
            package_name=request.package,
            version=request.version,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result,
        )

    return result
# ==========================================
# EXECUTE NOTEBOOK CELL
# ==========================================

@app.post("/execute")
def execute_code(
    request: RuntimeExecuteRequest,
):

    session = runtime_manager.get_session(
        request.session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Runtime session not found."
            ),
        )

    return session.kernel.execute(
        request.code
    )


# ==========================================
# RUNTIME VARIABLES
# ==========================================

@app.get(
    "/runtime/{session_id}/variables"
)
def get_variables(
    session_id: str,
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    return {
        "variables":
            session.kernel.variables()
    }


# ==========================================
# NOTEBOOK FILE / DATASET UPLOAD
# ==========================================

@app.post(
    "/runtime/{session_id}/files"
)
async def upload_file(
    session_id: str,
    file: UploadFile = File(...),
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    filename = safe_filename(
        file.filename or "uploaded_file"
    )

    destination = (
        session.workspace / filename
    )

    content = await file.read()

    # 50 MB development limit
    if len(content) > (
        50 * 1024 * 1024
    ):
        raise HTTPException(
            status_code=413,
            detail=(
                "File exceeds the "
                "50 MB development limit."
            ),
        )

    destination.write_bytes(content)

    response = {
        "success": True,
        "filename": filename,
        "size": len(content),
    }

    # Automatically inspect datasets
    if destination.suffix.lower() in {
        ".csv",
        ".xlsx",
        ".xls",
        ".json",
    }:

        try:
            response["dataset"] = (
                analyze_dataset(
                    destination
                )
            )

        except Exception as error:
            response["dataset_error"] = (
                str(error)
            )

    return response


# ==========================================
# LIST NOTEBOOK FILES
# ==========================================

@app.get(
    "/runtime/{session_id}/files"
)
def get_files(
    session_id: str,
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    return {
        "files":
            list_workspace_files(
                session.workspace
            )
    }


# ==========================================
# DATASET INTELLIGENCE
# ==========================================

@app.get(
    "/runtime/{session_id}/dataset/{filename}"
)
def dataset_intelligence(
    session_id: str,
    filename: str,
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    safe_name = safe_filename(
        filename
    )

    path = (
        session.workspace / safe_name
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    try:
        return analyze_dataset(path)

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# =========================================================
# TARGET ANALYSIS
# =========================================================

@app.get(
    "/runtime/{session_id}/dataset/{filename}/target/{target_column}"
)
def target_intelligence(
    session_id: str,
    filename: str,
    target_column: str,
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    safe_name = safe_filename(
        filename
    )

    path = (
        session.workspace /
        safe_name
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    try:
        return analyze_target(
            path,
            target_column,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Target analysis failed: "
                f"{str(error)}"
            ),
        )


# ==========================================
# MODELMIND ERROR DEBUGGER
# ==========================================

# =========================================================
# FEATURE INTELLIGENCE
# =========================================================

@app.get(
    "/runtime/{session_id}/dataset/{filename}/feature/{feature_column}"
)
def feature_intelligence(
    session_id: str,
    filename: str,
    feature_column: str,
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    safe_name = safe_filename(
        filename
    )

    path = (
        session.workspace
        / safe_name
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    try:
        return analyze_feature(
            path,
            feature_column,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Feature analysis failed: "
                f"{str(error)}"
            ),
        )
# =========================================================
# SMART PREPROCESSING ADVISOR
# =========================================================

@app.get(
    "/runtime/{session_id}/dataset/{filename}/preprocessing"
)
def preprocessing_intelligence(
    session_id: str,
    filename: str,
    level: str = "Basic",
):
    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    safe_name = safe_filename(
        filename
    )

    path = (
        session.workspace
        / safe_name
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    try:
        return analyze_preprocessing(
            path=path,
            level=level,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Preprocessing analysis failed: "
                f"{str(error)}"
            ),
        )
        
# =========================================================
# PREPROCESSING PREVIEW
# =========================================================


@app.post(
    "/runtime/{session_id}/dataset/{filename}/preprocessing/preview"
)
def preprocessing_preview(
    session_id: str,
    filename: str,
    request: PreprocessingPreviewRequest,
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    safe_name = safe_filename(
        filename
    )

    path = (
        session.workspace
        / safe_name
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    try:
        return preview_preprocessing(
            path=path,
            feature=request.feature,
            strategy=request.strategy,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Preprocessing preview failed: "
                f"{str(error)}"
            ),
        )
# =========================================================
# APPLY PREPROCESSING
# =========================================================


@app.post(
    "/runtime/{session_id}/dataset/{filename}/preprocessing/apply"
)
def preprocessing_apply(
    session_id: str,
    filename: str,
    request: PreprocessingApplyRequest,
):

    session = runtime_manager.get_session(
        session_id
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Runtime not found.",
        )

    safe_name = safe_filename(
        filename
    )

    path = (
        session.workspace
        / safe_name
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    try:
        result = apply_preprocessing(
            path=path,
            feature=request.feature,
            strategy=request.strategy,
        )

        # Return fresh dataset intelligence so
        # the frontend can refresh immediately.
        result["dataset"] = (
            analyze_dataset(path)
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Applying preprocessing failed: "
                f"{str(error)}"
            ),
        )
# =========================================================
# ML MISTAKE DETECTOR
# =========================================================

@app.post("/ai/ml-check")
def check_ml_mistakes(
    request: MLMistakeRequest,
):
    return analyze_ml_mistakes(
        code=request.code,
        level=request.level,
    )

# =========================================================
# MODELMIND ERROR INTELLIGENCE
# =========================================================

@app.post("/ai/error")
def debug_error(
    request: DebugRequest,
):
    """
    Run ModelMind's local Error Intelligence first.

    Gemini is NOT called from this endpoint.

    The frontend uses the returned handled/confidence
    values to decide whether advanced fallback is needed.
    """

    result = analyze_error(
        code=request.code,
        traceback=request.traceback,
        level=request.level,
    )

    confidence = float(
        result.get("confidence", 0.0)
    )

    handled = bool(
        result.get("handled", False)
    )

    needs_fallback = (
        not handled
        or confidence < 0.70
    )

    result["source"] = (
        "fallback-required"
        if needs_fallback
        else "modelmind-local"
    )

    result["requires_ai_fallback"] = (
        needs_fallback
    )

    return result


# =========================================================
# GEMINI CONNECTION STATUS
# =========================================================

@app.get("/ai/gemini/status")
def gemini_connection_status():
    from credentials.gemini_credentials import (
        get_gemini_status,
    )

    return get_gemini_status()


# =========================================================
# CONNECT GEMINI
# =========================================================

class GeminiConnectRequest(BaseModel):
    api_key: str = Field(
        min_length=1,
        max_length=500,
    )


@app.post("/ai/gemini/connect")
def connect_gemini(
    request: GeminiConnectRequest,
):
    from credentials.gemini_credentials import (
        save_gemini_api_key,
    )

    result = save_gemini_api_key(
        request.api_key
    )

    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"],
        )

    return result


# =========================================================
# DISCONNECT GEMINI
# =========================================================

@app.delete("/ai/gemini/disconnect")
def disconnect_gemini():
    from credentials.gemini_credentials import (
        remove_gemini_api_key,
    )

    result = remove_gemini_api_key()

    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result["message"],
        )

    return result


# =========================================================
# GEMINI ADVANCED ERROR FALLBACK
# =========================================================

@app.post("/ai/gemini/error")
def debug_error_with_gemini(
    request: DebugRequest,
):
    """
    Gemini is allowed ONLY when ModelMind's local
    Error Intelligence is not confident enough.

    The saved API key is loaded on the backend.
    It is never returned to the frontend.
    """

    # -----------------------------------------------------
    # Always ask ModelMind local intelligence FIRST.
    # -----------------------------------------------------

    local_result = analyze_error(
        code=request.code,
        traceback=request.traceback,
        level=request.level,
    )

    handled = bool(
        local_result.get(
            "handled",
            False,
        )
    )

    confidence = float(
        local_result.get(
            "confidence",
            0.0,
        )
    )

    # -----------------------------------------------------
    # HARD CONFIDENCE GATE
    #
    # Gemini must NOT be used when the local engine
    # understands the error with >= 70% confidence.
    # -----------------------------------------------------

    if (
        handled
        and confidence >= 0.70
    ):
        local_result["source"] = (
            "modelmind-local"
        )

        local_result[
            "requires_ai_fallback"
        ] = False

        return local_result

    # -----------------------------------------------------
    # Only low-confidence/unhandled errors reach here.
    # -----------------------------------------------------

    from credentials.gemini_credentials import (
        get_gemini_api_key,
    )

    api_key = get_gemini_api_key()

    if not api_key:
        raise HTTPException(
            status_code=428,
            detail=(
                "Gemini is not connected. "
                "Connect your Gemini API key once "
                "before using advanced analysis."
            ),
        )

    try:
        result = analyze_with_gemini(
            api_key=api_key,
            code=request.code,
            traceback=request.traceback,
            action=request.action,
            level=request.level,
        )

        result["source"] = "gemini"
        result[
            "requires_ai_fallback"
        ] = False

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except RuntimeError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Gemini could not analyze this "
                "error right now."
            ),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Gemini advanced analysis failed."
            ),
        )
# ==========================================
# CODE EXPLAINER
# ==========================================

@app.post("/ai/explain-code")
def explain_python_code(
    request: CodeExplainRequest,
):
    try:
        return explain_code(
            code=request.code,
            level=request.level,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "ModelMind Code Explainer failed: "
                f"{str(error)}"
            ),
        )