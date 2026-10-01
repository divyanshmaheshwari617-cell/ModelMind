"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  analyzePythonError,
  explainPythonCode,
  AIErrorResult,
  CodeExplanationResult,
} from "@/lib/api";

import {
  LearningLevel,
} from "@/types/learning";

import {
  NotebookCellType,
} from "@/types/notebook";


interface Props {
  action: string;

  cell: NotebookCellType | null;

  learningLevel: LearningLevel;

  onAcceptFix: (
    cellId: string,
    correctedCode: string,
    runAfterAccept: boolean
  ) => void;
}


interface DiffLine {
  type:
    | "same"
    | "removed"
    | "added";

  text: string;
}


type TutorMode =
  | "code"
  | "explain"
  | "fix"
  | null;


/* =========================================================
   SIMPLE CODE DIFF
   ========================================================= */

function createCodeDiff(
  originalCode: string,
  fixedCode: string
): DiffLine[] {
  const oldLines =
    originalCode.split("\n");

  const newLines =
    fixedCode.split("\n");

  const result: DiffLine[] = [];

  const maximumLength =
    Math.max(
      oldLines.length,
      newLines.length
    );

  for (
    let i = 0;
    i < maximumLength;
    i++
  ) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      if (oldLine !== undefined) {
        result.push({
          type: "same",
          text: oldLine,
        });
      }

      continue;
    }

    if (oldLine !== undefined) {
      result.push({
        type: "removed",
        text: oldLine,
      });
    }

    if (newLine !== undefined) {
      result.push({
        type: "added",
        text: newLine,
      });
    }
  }

  return result;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function AITutor({
  action,
  cell,
  learningLevel,
  onAcceptFix,
}: Props) {
  const [
    result,
    setResult,
  ] =
    useState<AIErrorResult | null>(
      null
    );

  const [
    codeResult,
    setCodeResult,
  ] =
    useState<CodeExplanationResult | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    currentMode,
    setCurrentMode,
  ] =
    useState<TutorMode>(null);


  /* =======================================================
     RESET WHEN CELL CHANGES
     ======================================================= */

  useEffect(() => {
    setResult(null);
    setCodeResult(null);
    setMessage("");
    setCurrentMode(null);
  }, [cell?.id]);


  /* =======================================================
     RESET WHEN GLOBAL LEVEL CHANGES
     ======================================================= */

  useEffect(() => {
    setResult(null);
    setCodeResult(null);

    if (cell) {
      setMessage(
        `Learning level changed to ${learningLevel}. Run the explanation again to use this level.`
      );
    }
  }, [
    learningLevel,
    cell,
  ]);


  /* =======================================================
     NOTEBOOK ACTIONS
     ======================================================= */

  useEffect(() => {
    if (!cell) {
      return;
    }

    if (action === "Explain Code") {
      setCurrentMode("code");
      setResult(null);
      setCodeResult(null);
      setMessage("");

      void requestCodeExplanation();
    }

    if (action === "Explain Error") {
      setCurrentMode("explain");
      setResult(null);
      setCodeResult(null);

      setMessage(
        "Ready to explain this error."
      );
    }

    if (action === "Fix Error") {
      setCurrentMode("fix");
      setResult(null);
      setCodeResult(null);

      setMessage(
        "Ready to generate a safe fix."
      );
    }
  }, [
    action,
    cell,
  ]);


  /* =======================================================
     CODE DIFF
     ======================================================= */

  const diffLines =
    useMemo(() => {
      if (
        !cell ||
        !result?.fixed_code
      ) {
        return [];
      }

      return createCodeDiff(
        cell.content,
        result.fixed_code
      );
    }, [
      cell,
      result,
    ]);


  const changedLineCount =
    useMemo(() => {
      return diffLines.filter(
        (line) =>
          line.type !== "same"
      ).length;
    }, [
      diffLines,
    ]);


  /* =======================================================
     CODE EXPLAINER
     ======================================================= */

  async function requestCodeExplanation() {
    if (!cell) {
      setMessage(
        "Select a notebook cell first."
      );

      return;
    }

    if (!cell.content.trim()) {
      setMessage(
        "This notebook cell is empty."
      );

      return;
    }

    setLoading(true);

    setResult(null);
    setCodeResult(null);

    setMessage("");

    setCurrentMode("code");

    try {
      const response =
        await explainPythonCode(
          cell.content,
          learningLevel
        );

      setCodeResult(response);

      if (!response.handled) {
        setMessage(
          "This code needs deeper analysis than the local Code Explainer currently provides."
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "ModelMind could not explain this code."
      );
    } finally {
      setLoading(false);
    }
  }


  /* =======================================================
     ERROR INTELLIGENCE
     ======================================================= */

  async function requestAI(
    selectedAction:
      | "explain"
      | "fix"
  ) {
    if (!cell) {
      setMessage(
        "Select a notebook cell first."
      );

      return;
    }

    if (!cell.error) {
      setMessage(
        "Run the cell first so ModelMind can inspect the error."
      );

      return;
    }

    setLoading(true);

    setResult(null);
    setCodeResult(null);

    setMessage("");

    setCurrentMode(
      selectedAction
    );

    try {
      const response =
        await analyzePythonError(
          cell.content,
          cell.error,
          selectedAction,
          learningLevel
        );

      setResult(response);

      if (
        selectedAction === "fix" &&
        !response.fixed_code
      ) {
        setMessage(
          response.handled
            ? "ModelMind understands this error, but it cannot safely generate an automatic code change yet."
            : "This error requires advanced analysis. The local engine will not guess a fix."
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "ModelMind could not analyze the error."
      );
    } finally {
      setLoading(false);
    }
  }


  /* =======================================================
     FIX ACTIONS
     ======================================================= */

  function cancelFix() {
    setResult(null);
    setCodeResult(null);

    setCurrentMode(null);

    setMessage(
      "Fix cancelled. Your original code was not changed."
    );
  }


  function acceptFix(
    runAfterAccept: boolean
  ) {
    if (
      !cell ||
      !result?.fixed_code
    ) {
      return;
    }

    onAcceptFix(
      cell.id,
      result.fixed_code,
      runAfterAccept
    );

    setResult(null);
    setCodeResult(null);

    setCurrentMode(null);

    setMessage(
      runAfterAccept
        ? "Fix accepted. Running the corrected code..."
        : "Fix accepted. The notebook cell has been updated."
    );
  }


  /* =======================================================
     UI
     ======================================================= */

  return (
    <aside className="aiPanel">

      {/* HEADER */}

      <div className="aiHeader">
        <div>
          <span className="aiBadge">
            MODELMIND AI
          </span>

          <h3>
            AI Learning Tutor
          </h3>
        </div>
      </div>


      <p className="aiHelp">
        Understand your code, errors,
        and machine-learning workflow.
      </p>


      {/* GLOBAL LEVEL */}

      <div
        style={{
          marginBottom: "14px",
          padding: "10px 12px",

          border:
            "1px solid rgba(114,226,138,0.18)",

          borderRadius: "8px",

          background:
            "rgba(114,226,138,0.05)",

          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",

          gap: "10px",

          fontSize: "12px",
        }}
      >
        <span
          style={{
            opacity: 0.65,
          }}
        >
          Learning level
        </span>

        <strong
          style={{
            color: "#72e28a",
          }}
        >
          {learningLevel}
        </strong>
      </div>


      {/* TOOLS */}

      <div className="aiTools">

        <button
          disabled={
            loading ||
            !cell
          }
          onClick={
            requestCodeExplanation
          }
        >
          <span className="toolIcon">
            &lt;/&gt;
          </span>

          <span>
            <strong>
              Explain Code
            </strong>

            <small>
              Learn what this cell
              is doing.
            </small>
          </span>
        </button>


        <button
          disabled={
            loading ||
            !cell?.error
          }
          onClick={() =>
            requestAI(
              "explain"
            )
          }
        >
          <span className="toolIcon">
            ?
          </span>

          <span>
            <strong>
              Explain Error
            </strong>

            <small>
              Understand why your
              code failed.
            </small>
          </span>
        </button>


        <button
          disabled={
            loading ||
            !cell?.error
          }
          onClick={() =>
            requestAI(
              "fix"
            )
          }
        >
          <span className="toolIcon">
            ✦
          </span>

          <span>
            <strong>
              Fix Error
            </strong>

            <small>
              Preview changes before
              applying them.
            </small>
          </span>
        </button>

      </div>


      {/* SELECTED CELL */}

      {cell && (
        <div className="selectedCellCard">

          <span className="responseLabel">
            SELECTED CELL
          </span>

          <pre className="contextPreview">
            {cell.content}
          </pre>

        </div>
      )}


      {/* LOADING */}

      {loading && (
        <div className="debugLoading">

          <div className="debugLoadingIcon">
            ✦
          </div>

          <div>
            <strong>
              ModelMind is analyzing
              your code
            </strong>

            <p>
              {currentMode === "code"
                ? "Understanding the code structure and ML workflow..."
                : "Reading the traceback and locating the cause..."}
            </p>
          </div>

        </div>
      )}


      {/* MESSAGE */}

      {message &&
        !loading && (
          <div className="aiMessage">
            {message}
          </div>
        )}


      {/* ===================================================
          CODE EXPLANATION RESULT
          =================================================== */}

      {codeResult &&
        currentMode === "code" &&
        !loading && (
          <div className="debugResult">

            <div className="debugResultHeader">

              <div>
                <span className="responseLabel">
                  CODE EXPLANATION
                </span>

                <h3>
                  What this code is doing
                </h3>
              </div>

              <span className="localBadge">
                {codeResult.source ===
                "modelmind-local"
                  ? "LOCAL"
                  : "ADVANCED"}
              </span>

            </div>


            {/* METADATA */}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",

                marginBottom:
                  "14px",

                fontSize: "11px",
                opacity: 0.75,
              }}
            >
              <span>
                Level:{" "}
                <strong
                  style={{
                    color:
                      "#72e28a",
                  }}
                >
                  {learningLevel}
                </strong>
              </span>

              <span>
                •
              </span>

              <span>
                Confidence:{" "}
                {Math.round(
                  codeResult.confidence *
                    100
                )}
                %
              </span>

              <span>
                •
              </span>

              <span>
                {codeResult.source ===
                "modelmind-local"
                  ? "ModelMind Local"
                  : codeResult.source}
              </span>
            </div>


            {/* SUMMARY */}

            <div className="explanationBlock">

              <h4>
                Summary
              </h4>

              <p>
                {codeResult.summary}
              </p>

            </div>


            {/* PURPOSE */}

            {codeResult.purpose && (
              <div className="explanationBlock">

                <h4>
                  Purpose
                </h4>

                <p>
                  {codeResult.purpose}
                </p>

              </div>
            )}


            {/* ML FLOW */}

            {codeResult.ml_flow.length >
              0 && (
              <div className="explanationBlock">

                <h4>
                  Machine-learning flow
                </h4>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {codeResult.ml_flow.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.stage}-${index}`}
                        style={{
                          padding:
                            "10px 12px",

                          border:
                            "1px solid rgba(114,226,138,0.14)",

                          borderRadius:
                            "8px",

                          background:
                            "rgba(114,226,138,0.035)",
                        }}
                      >
                        <strong>
                          {index + 1}.{" "}
                          {item.stage}
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                          }}
                        >
                          {
                            item.explanation
                          }
                        </p>

                        {item.line_number && (
                          <small
                            style={{
                              opacity:
                                0.55,
                            }}
                          >
                            Line{" "}
                            {
                              item.line_number
                            }
                          </small>
                        )}
                      </div>
                    )
                  )}
                </div>

              </div>
            )}


            {/* STEP BY STEP */}

            {codeResult.steps.length >
              0 && (
              <div className="explanationBlock">

                <h4>
                  Step-by-step
                </h4>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {codeResult.steps.map(
                    (
                      step,
                      index
                    ) => (
                      <div
                        key={`${step.line_number}-${index}`}
                        style={{
                          paddingBottom:
                            "10px",

                          borderBottom:
                            "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <strong>
                          {index + 1}.{" "}
                          {step.title}
                        </strong>

                        {step.line_number && (
                          <small
                            style={{
                              marginLeft:
                                "8px",

                              opacity:
                                0.5,
                            }}
                          >
                            Line{" "}
                            {
                              step.line_number
                            }
                          </small>
                        )}

                        {step.code && (
                          <pre
                            className="contextPreview"
                            style={{
                              marginTop:
                                "8px",
                            }}
                          >
                            {step.code}
                          </pre>
                        )}

                        <p>
                          {
                            step.explanation
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>

              </div>
            )}


            {/* CONCEPTS */}

            {codeResult.concepts.length >
              0 && (
              <div className="explanationBlock">

                <h4>
                  Concepts to understand
                </h4>

                {codeResult.concepts.map(
                  (
                    concept,
                    index
                  ) => (
                    <div
                      key={`${concept.title}-${index}`}
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <strong>
                        {
                          concept.title
                        }
                      </strong>

                      <p>
                        {
                          concept.explanation
                        }
                      </p>
                    </div>
                  )
                )}

              </div>
            )}


            {/* VARIABLES */}

            {codeResult.variables.length >
              0 && (
              <div className="explanationBlock">

                <h4>
                  Important variables
                </h4>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {codeResult.variables.map(
                    (
                      variable,
                      index
                    ) => (
                      <div
                        key={`${variable.name}-${index}`}
                      >
                        <code>
                          {
                            variable.name
                          }
                        </code>

                        <p
                          style={{
                            margin:
                              "4px 0",
                          }}
                        >
                          {
                            variable.explanation
                          }
                        </p>

                        {variable.assigned_from && (
                          <small
                            style={{
                              opacity:
                                0.55,
                            }}
                          >
                            From:{" "}
                            {
                              variable.assigned_from
                            }
                          </small>
                        )}
                      </div>
                    )
                  )}
                </div>

              </div>
            )}


            {/* LIBRARIES */}

            {codeResult.libraries.length >
              0 && (
              <div className="explanationBlock">

                <h4>
                  Libraries used
                </h4>

                {codeResult.libraries.map(
                  (
                    library,
                    index
                  ) => (
                    <div
                      key={`${library.name}-${index}`}
                      style={{
                        marginBottom:
                          "10px",
                      }}
                    >
                      <strong>
                        {
                          library.name
                        }
                      </strong>

                      <p>
                        {
                          library.explanation
                        }
                      </p>
                    </div>
                  )
                )}

              </div>
            )}


            {/* ADVANCED / LEARNING NOTES */}

            {codeResult.advanced_notes
              .length > 0 && (
              <div className="explanationBlock">

                <h4>
                  {learningLevel ===
                  "Advanced"
                    ? "Advanced insights"
                    : "Learning notes"}
                </h4>

                {codeResult.advanced_notes.map(
                  (
                    note,
                    index
                  ) => (
                    <div
                      key={`${note.title}-${index}`}
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <strong>
                        {note.title}
                      </strong>

                      <p>
                        {
                          note.explanation
                        }
                      </p>
                    </div>
                  )
                )}

              </div>
            )}


            {/* WARNINGS */}

            {codeResult.warnings.length >
              0 && (
              <div className="explanationBlock">

                <h4>
                  Important notes
                </h4>

                {codeResult.warnings.map(
                  (
                    warning,
                    index
                  ) => (
                    <div
                      key={`${warning.title}-${index}`}
                      style={{
                        marginBottom:
                          "10px",
                      }}
                    >
                      <strong>
                        {
                          warning.title
                        }
                      </strong>

                      <p>
                        {
                          warning.message
                        }
                      </p>
                    </div>
                  )
                )}

              </div>
            )}

          </div>
        )}


      {/* ===================================================
          ERROR EXPLANATION
          =================================================== */}

      {result &&
        currentMode ===
          "explain" && (
          <div className="debugResult">

            <div className="debugResultHeader">

              <div>
                <span className="responseLabel">
                  ERROR DETECTED
                </span>

                <h3>
                  {result.title ||
                    result.error_type}
                </h3>
              </div>

              <span className="localBadge">
                {result.source ===
                "modelmind-local"
                  ? "LOCAL"
                  : "ADVANCED"}
              </span>

            </div>


            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",

                marginBottom:
                  "12px",

                fontSize:
                  "11px",

                opacity: 0.7,
              }}
            >
              <span>
                Explanation level:
              </span>

              <strong
                style={{
                  color:
                    "#72e28a",
                }}
              >
                {learningLevel}
              </strong>
            </div>


            {result.line_number && (
              <div className="errorLocation">

                <span>
                  Line{" "}
                  {result.line_number}
                </span>

                <code>
                  {result.failing_line}
                </code>

              </div>
            )}


            <div className="explanationBlock">

              <h4>
                What happened?
              </h4>

              <p>
                {result.explanation}
              </p>

            </div>


            <div className="explanationBlock">

              <h4>
                Python says
              </h4>

              <p>
                {result.why}
              </p>

            </div>


            <div className="explanationBlock">

              <h4>
                How do I solve it?
              </h4>

              <p>
                {result.how_to_fix}
              </p>

            </div>


            {result.fixed_code && (
              <button
                className="generateFixButton"
                onClick={() =>
                  requestAI(
                    "fix"
                  )
                }
              >
                ✦ Show suggested fix
              </button>
            )}

          </div>
        )}


      {/* ===================================================
          FIX RESULT
          =================================================== */}

      {result &&
        currentMode ===
          "fix" &&
        result.fixed_code && (
          <div className="fixResult">

            <div className="fixResultHeader">

              <div>
                <span className="responseLabel">
                  PROPOSED FIX
                </span>

                <h3>
                  Review changes
                </h3>
              </div>

              <span className="reviewBadge">
                REVIEW
              </span>

            </div>


            <p className="fixDescription">
              ModelMind will not change
              your code until you accept
              this suggestion.
            </p>


            <div className="codeDiff">

              <div className="codeDiffHeader">

                <span>
                  Code changes
                </span>

                <span>
                  {changedLineCount}{" "}
                  change
                  {changedLineCount === 1
                    ? ""
                    : "s"}
                </span>

              </div>


              <div className="diffCode">

                {diffLines.map(
                  (
                    line,
                    index
                  ) => (
                    <div
                      key={`${index}-${line.type}`}
                      className={`diffLine ${
                        line.type ===
                        "removed"
                          ? "diffRemoved"
                          : line.type ===
                              "added"
                            ? "diffAdded"
                            : "diffSame"
                      }`}
                    >
                      <span className="diffSymbol">
                        {line.type ===
                        "removed"
                          ? "−"
                          : line.type ===
                              "added"
                            ? "+"
                            : " "}
                      </span>

                      <code>
                        {line.text ||
                          " "}
                      </code>

                    </div>
                  )
                )}

              </div>

            </div>


            <div className="fixReason">

              <span className="fixReasonIcon">
                ✦
              </span>

              <div>
                <strong>
                  Why this change?
                </strong>

                <p>
                  {result.changes ||
                    result.how_to_fix}
                </p>
              </div>

            </div>


            <div className="fixActionBar">

              <button
                className="cancelFixButton"
                onClick={
                  cancelFix
                }
              >
                Cancel
              </button>


              <button
                className="acceptFixButton"
                onClick={() =>
                  acceptFix(
                    false
                  )
                }
              >
                ✓ Accept Fix
              </button>


              <button
                className="acceptRunButton"
                onClick={() =>
                  acceptFix(
                    true
                  )
                }
              >
                ▶ Accept & Run
              </button>

            </div>


            <p className="fixSafetyText">
              Review AI-generated or
              automated changes before
              accepting them.
            </p>

          </div>
        )}

    </aside>
  );
}