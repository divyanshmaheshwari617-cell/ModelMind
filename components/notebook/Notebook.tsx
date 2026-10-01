"use client";

import { useEffect, useState } from "react";

import NotebookCell from "./NotebookCell";
import NotebookToolbar from "./NotebookToolbar";
import DatasetXRay from "@/components/dataset/DatasetXRay";

import { NotebookCellType } from "@/types/notebook";

import {
  executePython,
  uploadRuntimeFile,
  UploadResult,
  analyzeMLMistakes,
} from "@/lib/api";

interface Props {
  runtimeId: string | null;

  runtimeStatus:
    | "connecting"
    | "ready"
    | "error";

  onAIAction: (
    action: string,
    cell: NotebookCellType
  ) => void;
}

interface AcceptFixEvent {
  cellId: string;
  correctedCode: string;
  runAfterAccept: boolean;
}

export default function Notebook({
  runtimeId,
  runtimeStatus,
  onAIAction,
}: Props) {
  const [cells, setCells] =
    useState<NotebookCellType[]>([
      {
        id: "1",
        type: "code",
        content:
          '# Cell 1\nx = 100\nprint("x created:", x)',
        output: "",
        error: "",
        isRunning: false,
      },

      {
        id: "2",
        type: "code",
        content:
          '# Cell 2\nprint("x from Cell 1:", x)',
        output: "",
        error: "",
        isRunning: false,
      },
    ]);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadedFile, setUploadedFile] =
    useState<UploadResult | null>(null);

  const [uploadError, setUploadError] =
    useState("");
  const [showXRay, setShowXRay] =
  useState(false);
  const [showPreview, setShowPreview] =
    useState(false);

  function addCell(
    type: "code" | "markdown"
  ) {
    const newCell: NotebookCellType = {
      id: crypto.randomUUID(),
      type,
      content: "",
      output: "",
      error: "",
      isRunning: false,
    };

    setCells((previous) => [
      ...previous,
      newCell,
    ]);
  }

  function updateCell(
    id: string,
    value: string
  ) {
    setCells((previous) =>
      previous.map((cell) =>
        cell.id === id
          ? {
              ...cell,
              content: value,
            }
          : cell
      )
    );
  }

  function deleteCell(id: string) {
    setCells((previous) =>
      previous.filter(
        (cell) => cell.id !== id
      )
    );
  }

async function executeCell(
  id: string,
  code: string,
  analysisCode: string = code
) {
  if (!runtimeId) {
    setCells((previous) =>
      previous.map((cell) =>
        cell.id === id
          ? {
              ...cell,
              isRunning: false,
              error:
                "ModelMind runtime is not ready yet.",
              mlAnalysis: null,
              mlAnalysisError: "",
            }
          : cell
      )
    );

    return;
  }

  setCells((previous) =>
    previous.map((cell) =>
      cell.id === id
        ? {
            ...cell,
            isRunning: true,
            output: "",
            error: "",
            mlAnalysis: null,
            mlAnalysisError: "",
          }
        : cell
    )
  );

  try {
    const result =
      await executePython(
        runtimeId,
        code
      );

    /*
     * Runtime errors continue through the
     * existing ModelMind Error Intelligence
     * workflow.
     *
     * ML methodology analysis only runs when
     * Python execution succeeds.
     */
    if (!result.success) {
      setCells((previous) =>
        previous.map((cell) =>
          cell.id === id
            ? {
                ...cell,
                isRunning: false,

                output: [
                  result.output,
                  result.stderr,
                ]
                  .filter(Boolean)
                  .join("\n"),

                error: result.error,

                mlAnalysis: null,
                mlAnalysisError: "",
              }
            : cell
        )
      );

      return;
    }

    /*
     * Preserve successful Python output
     * immediately.
     */
    setCells((previous) =>
      previous.map((cell) =>
        cell.id === id
          ? {
              ...cell,
              isRunning: false,

              output: [
                result.output,
                result.stderr,
              ]
                .filter(Boolean)
                .join("\n"),

              error: "",
            }
          : cell
      )
    );

    /*
     * Run ModelMind's deterministic
     * ML Mistake Detector.
     *
     * A failure in educational analysis
     * must NEVER turn successful Python
     * execution into a notebook error.
     */
    try {
      const mlAnalysis =
  await analyzeMLMistakes(
    analysisCode,
    "Basic"
  );

      setCells((previous) =>
        previous.map((cell) =>
          cell.id === id
            ? {
                ...cell,
                mlAnalysis,
                mlAnalysisError: "",
              }
            : cell
        )
      );
    } catch (analysisError) {
      setCells((previous) =>
        previous.map((cell) =>
          cell.id === id
            ? {
                ...cell,
                mlAnalysis: null,
                mlAnalysisError:
                  analysisError instanceof Error
                    ? analysisError.message
                    : "ML analysis failed.",
              }
            : cell
        )
      );
    }
  } catch (error) {
    setCells((previous) =>
      previous.map((cell) =>
        cell.id === id
          ? {
              ...cell,
              isRunning: false,
              output: "",
              error:
                error instanceof Error
                  ? error.message
                  : "Runtime request failed.",
              mlAnalysis: null,
              mlAnalysisError: "",
            }
          : cell
      )
    );
  }
}
  async function runCell(id: string) {
  const selectedIndex =
    cells.findIndex(
      (cell) => cell.id === id
    );

  if (selectedIndex === -1) {
    return;
  }

  const selected =
    cells[selectedIndex];

  if (selected.type !== "code") {
    return;
  }

  if (!selected.content.trim()) {
    return;
  }

  /*
   * Build notebook context ONLY for static
   * ModelMind analysis.
   *
   * We include code cells from the beginning
   * of the notebook through the current cell.
   *
   * This code is NOT executed again.
   */
  const analysisCode =
    cells
      .slice(0, selectedIndex + 1)
      .filter(
        (cell) =>
          cell.type === "code" &&
          cell.content.trim()
      )
      .map(
        (cell, index) =>
          `# ===== ModelMind Cell ${index + 1} =====\n${cell.content}`
      )
      .join("\n\n");

  /*
   * Execute ONLY the selected cell.
   *
   * analysisCode is used exclusively by the
   * static ML Mistake Detector.
   */
  await executeCell(
    selected.id,
    selected.content,
    analysisCode
  );
}

  async function runAllCells() {
  if (!runtimeId) return;

  const accumulatedCode: string[] = [];

  for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];

    if (
      cell.type !== "code" ||
      !cell.content.trim()
    ) {
      continue;
    }

    accumulatedCode.push(
      `# ===== ModelMind Cell ${index + 1} =====\n${cell.content}`
    );

    const analysisCode =
      accumulatedCode.join("\n\n");

    await executeCell(
      cell.id,
      cell.content,
      analysisCode
    );
  }
}

  function clearOutputs() {
  setCells((previous) =>
    previous.map((cell) => ({
      ...cell,
      output: "",
      error: "",
      isRunning: false,
      mlAnalysis: null,
      mlAnalysisError: "",
    }))
  );
}

  /* ======================================================
     NOTEBOOK FILE / DATASET UPLOAD
     ====================================================== */

  async function handleUploadFile(
    file: File
  ) {
    if (!runtimeId) {
      setUploadError(
        "Python runtime is not ready."
      );

      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadedFile(null);
    setShowPreview(false);
    setShowXRay(false);

    try {
      const result =
        await uploadRuntimeFile(
          runtimeId,
          file
        );

      setUploadedFile(result);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "File upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  }

  /* ======================================================
     INSERT DATASET LOAD CODE
     ====================================================== */

  function insertLoadCode() {
    if (!uploadedFile) return;

    const filename =
      uploadedFile.filename;

    const extension =
      filename
        .split(".")
        .pop()
        ?.toLowerCase();

    let code = "";

    if (extension === "csv") {
      code =
`import pandas as pd

df = pd.read_csv("${filename}")

print("Dataset shape:", df.shape)
df.head()`;
    } else if (
      extension === "xlsx" ||
      extension === "xls"
    ) {
      code =
`import pandas as pd

df = pd.read_excel("${filename}")

print("Dataset shape:", df.shape)
df.head()`;
    } else if (
      extension === "json"
    ) {
      code =
`import pandas as pd

df = pd.read_json("${filename}")

print("Dataset shape:", df.shape)
df.head()`;
    } else {
      code =
`# Uploaded file:
# ${filename}`;
    }

    const newCell: NotebookCellType = {
      id: crypto.randomUUID(),
      type: "code",
      content: code,
      output: "",
      error: "",
      isRunning: false,
    };

    setCells((previous) => [
      ...previous,
      newCell,
    ]);
  }

  /* ======================================================
     ACCEPT FIX EVENT
     ====================================================== */

  useEffect(() => {
    async function acceptFix(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<AcceptFixEvent>;

      const {
        cellId,
        correctedCode,
        runAfterAccept,
      } = customEvent.detail;

      setCells((previous) =>
        previous.map((cell) =>
          cell.id === cellId
            ? {
                ...cell,
                content:
                  correctedCode,
                output: "",
                error: "",
              }
            : cell
        )
      );

      if (runAfterAccept) {
  const selectedIndex =
    cells.findIndex(
      (cell) => cell.id === cellId
    );

  const analysisCode =
    cells
      .slice(
        0,
        selectedIndex >= 0
          ? selectedIndex + 1
          : cells.length
      )
      .filter(
        (cell) =>
          cell.type === "code" &&
          cell.content.trim()
      )
      .map((cell) =>
        cell.id === cellId
          ? correctedCode
          : cell.content
      )
      .join("\n\n");

  await executeCell(
    cellId,
    correctedCode,
    analysisCode || correctedCode
  );
}
    }

    window.addEventListener(
      "modelmind-accept-fix",
      acceptFix
    );

    return () => {
      window.removeEventListener(
        "modelmind-accept-fix",
        acceptFix
      );
    };
  }, [runtimeId]);

  return (
    <section className="notebookSection">

      {/* ==================================================
          NOTEBOOK HEADER
          ================================================== */}

      <div className="notebookHeading">
        <div>
          <span className="fileType">
            NOTEBOOK
          </span>

          <h3>
            modelmind.ipynb
          </h3>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            className="savedStatus"
            style={{
              color:
                runtimeStatus ===
                "ready"
                  ? "#72e28a"
                  : runtimeStatus ===
                    "error"
                  ? "#ff7272"
                  : "#e5c76b",
            }}
          >
            ●{" "}

            {runtimeStatus ===
            "ready"
              ? "Runtime ready"
              : runtimeStatus ===
                "error"
              ? "Runtime offline"
              : "Connecting runtime"}
          </span>

          <span className="savedStatus">
            ● Saved
          </span>
        </div>
      </div>

      {/* ==================================================
          NOTEBOOK TOOLBAR
          ================================================== */}

      <NotebookToolbar
        onAddCode={() =>
          addCell("code")
        }

        onAddText={() =>
          addCell("markdown")
        }

        onRunAll={
          runAllCells
        }

        onClearOutputs={
          clearOutputs
        }

        onUploadFile={
          handleUploadFile
        }

        isUploading={
          isUploading
        }

        runtimeReady={
          runtimeStatus ===
            "ready" &&
          runtimeId !== null
        }
      />

      {/* ==================================================
          UPLOADED DATASET CARD
          ================================================== */}

      {uploadedFile && (
        <div
          style={{
            margin: "14px 20px 0",
            border:
              "1px solid rgba(114, 226, 138, 0.25)",
            borderRadius: "12px",
            background:
              "rgba(114, 226, 138, 0.05)",
            overflow: "hidden",
          }}
        >

          {/* Dataset header */}

          <div
            style={{
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "5px",
                  }}
                >
                  ✓{" "}
                  {uploadedFile.filename}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.7,
                  }}
                >
                  File uploaded to this
                  notebook runtime
                </div>
              </div>

              {uploadedFile.dataset && (
                <div
                  style={{
                    fontSize: "13px",
                    padding:
                      "6px 10px",
                    borderRadius: "7px",
                    background:
                      "rgba(255,255,255,0.06)",
                  }}
                >
                  <strong>
                    {
                      uploadedFile
                        .dataset.rows
                    }
                  </strong>

                  {" × "}

                  <strong>
                    {
                      uploadedFile
                        .dataset.columns
                    }
                  </strong>
                </div>
              )}
            </div>

            {/* Dataset actions */}

            {uploadedFile.dataset && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowPreview(
                      (previous) =>
                        !previous
                    )
                  }
                  style={{
                    padding:
                      "7px 12px",
                    borderRadius: "7px",
                    border:
                      "1px solid rgba(255,255,255,0.14)",
                    background:
                      "rgba(255,255,255,0.06)",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {showPreview
                    ? "Hide Preview"
                    : "Preview Dataset"}
                </button>

                <button
                  type="button"
                  onClick={
                    insertLoadCode
                  }
                  style={{
                    padding:
                      "7px 12px",
                    borderRadius: "7px",
                    border:
                      "1px solid rgba(114,226,138,0.30)",
                    background:
                      "rgba(114,226,138,0.10)",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  + Insert Load Code
                </button>

<button
  type="button"
  onClick={() =>
    setShowXRay(
      (previous) => !previous
    )
  }
  style={{
    padding: "7px 12px",
    borderRadius: "7px",
    border:
      showXRay
        ? "1px solid rgba(100,160,255,0.35)"
        : "1px solid rgba(255,255,255,0.14)",
    background:
      showXRay
        ? "rgba(100,160,255,0.12)"
        : "rgba(255,255,255,0.06)",
    color: "inherit",
    cursor: "pointer",
  }}
>
  {showXRay
    ? "Hide Dataset X-Ray"
    : "Dataset X-Ray"}
</button>                
              </div>
            )}
          </div>

          {/* ==================================================
              DATASET PREVIEW
              ================================================== */}

          {showPreview &&
            uploadedFile.dataset && (
              <div
                style={{
                  borderTop:
                    "1px solid rgba(255,255,255,0.08)",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  Dataset Preview
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.6,
                    marginBottom:
                      "12px",
                  }}
                >
                  Showing the first{" "}
                  {
                    uploadedFile
                      .dataset.preview
                      .length
                  }{" "}
                  rows
                </div>

                <div
                  style={{
                    overflowX: "auto",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      fontSize: "12px",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    <thead>
                      <tr>
                        {uploadedFile
                          .dataset
                          .column_names
                          .map(
                            (
                              column
                            ) => (
                              <th
                                key={
                                  column
                                }
                                style={{
                                  textAlign:
                                    "left",
                                  padding:
                                    "9px 12px",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.10)",
                                  background:
                                    "rgba(255,255,255,0.04)",
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  column
                                }
                              </th>
                            )
                          )}
                      </tr>
                    </thead>

                    <tbody>
                      {uploadedFile
                        .dataset
                        .preview
                        .map(
                          (
                            row,
                            rowIndex
                          ) => (
                            <tr
                              key={
                                rowIndex
                              }
                            >
                              {uploadedFile
                                .dataset!
                                .column_names
                                .map(
                                  (
                                    column
                                  ) => {
                                    const value =
                                      row[
                                        column
                                      ];

                                    return (
                                      <td
                                        key={
                                          column
                                        }
                                        style={{
                                          padding:
                                            "9px 12px",
                                          borderBottom:
                                            "1px solid rgba(255,255,255,0.05)",
                                          opacity:
                                            value ===
                                              null ||
                                            value ===
                                              undefined
                                              ? 0.45
                                              : 0.85,
                                        }}
                                      >
                                        {value ===
                                          null ||
                                        value ===
                                          undefined
                                          ? "null"
                                          : String(
                                              value
                                            )}
                                      </td>
                                    );
                                  }
                                )}
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    flexWrap: "wrap",
                    marginTop: "12px",
                    fontSize: "12px",
                    opacity: 0.65,
                  }}
                >
                  <span>
                    {
                      uploadedFile
                        .dataset
                        .numeric_columns
                        .length
                    }{" "}
                    numerical
                  </span>

                  <span>
                    {
                      uploadedFile
                        .dataset
                        .categorical_columns
                        .length
                    }{" "}
                    categorical
                  </span>

                  <span>
                    {
                      uploadedFile
                        .dataset
                        .total_missing_values
                    }{" "}
                    missing values
                  </span>
                </div>
              </div>
            )}
        </div>
      )}
      {/* ==================================================
    DATASET X-RAY
    ================================================== */}

{showXRay &&
  uploadedFile?.dataset && (
    <DatasetXRay
  dataset={uploadedFile.dataset}
  runtimeId={runtimeId!}
  filename={uploadedFile.filename}
  onClose={() =>
    setShowXRay(false)
  }
/>
  )}
      {/* ==================================================
          UPLOAD ERROR
          ================================================== */}

      {uploadError && (
        <div
          style={{
            margin: "14px 20px 0",
            padding: "12px 16px",
            border:
              "1px solid rgba(255, 90, 90, 0.3)",
            borderRadius: "10px",
            background:
              "rgba(255, 90, 90, 0.06)",
            color: "#ff8b8b",
            fontSize: "13px",
          }}
        >
          {uploadError}
        </div>
      )}

      {/* ==================================================
          NOTEBOOK CELLS
          ================================================== */}

      <div className="cellsContainer">

        {cells.map(
          (cell, index) => (
            <NotebookCell
              key={cell.id}
              cell={cell}
              index={index}
              onChange={
                updateCell
              }
              onDelete={
                deleteCell
              }
              onRun={runCell}
              onAIAction={
                onAIAction
              }
            />
          )
        )}

        <button
          className="addCellBottom"
          onClick={() =>
            addCell("code")
          }
        >
          + Add code cell
        </button>

      </div>
    </section>
  );
}