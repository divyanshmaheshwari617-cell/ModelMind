from fastapi import (
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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

app = FastAPI(
    title="ModelMind Backend",
    version="0.3.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
class MLMistakeRequest(BaseModel):
    code: str
    level: str = "Basic"
class CodeExplainRequest(BaseModel):
    code: str = Field(max_length=50000)
    level: str = "Basic"


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
@app.post("/ai/error")
def debug_error(
    request: DebugRequest,
):

    result = analyze_error(
        code=request.code,
        traceback=request.traceback,
        level=request.level,
    )

    result["source"] = (
        "modelmind-local"
        if result["handled"]
        else "fallback-required"
    )

    return result
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