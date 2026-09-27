"use client";

import { useEffect, useMemo, useState } from "react";

import {
  analyzePythonError,
  AIErrorResult,
  ExplanationLevel,
} from "@/lib/api";

import { NotebookCellType } from "@/types/notebook";

interface Props {
  action: string;

  cell: NotebookCellType | null;

  onAcceptFix: (
    cellId: string,
    correctedCode: string,
    runAfterAccept: boolean
  ) => void;
}

interface DiffLine {
  type: "same" | "removed" | "added";
  text: string;
}

/*
 * Simple line-by-line diff.
 *
 * For our current ModelMind prototype this gives us:
 *
 * unchanged -> normal
 * old       -> red
 * new       -> green
 *
 * Later we can replace this with a more advanced
 * character-level diff engine.
 */
function createCodeDiff(
  originalCode: string,
  fixedCode: string
): DiffLine[] {
  const oldLines = originalCode.split("\n");
  const newLines = fixedCode.split("\n");

  const result: DiffLine[] = [];

  const maximumLength = Math.max(
    oldLines.length,
    newLines.length
  );

  for (let i = 0; i < maximumLength; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    /*
     * Same line.
     */
    if (oldLine === newLine) {
      if (oldLine !== undefined) {
        result.push({
          type: "same",
          text: oldLine,
        });
      }

      continue;
    }

    /*
     * Existing line changed/removed.
     */
    if (oldLine !== undefined) {
      result.push({
        type: "removed",
        text: oldLine,
      });
    }

    /*
     * New line changed/added.
     */
    if (newLine !== undefined) {
      result.push({
        type: "added",
        text: newLine,
      });
    }
  }

  return result;
}

export default function AITutor({
  action,
  cell,
  onAcceptFix,
}: Props) {
  const [level, setLevel] =
    useState<ExplanationLevel>("Basic");

  const [result, setResult] =
    useState<AIErrorResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [currentMode, setCurrentMode] =
    useState<"explain" | "fix" | null>(null);

  /*
   * Reset the previous analysis whenever
   * another notebook cell is selected.
   */
  useEffect(() => {
    setResult(null);
    setMessage("");
    setCurrentMode(null);
  }, [cell?.id]);

  /*
   * When the user clicks Explain Error / Fix Error
   * underneath a notebook cell, remember which
   * operation they want.
   */
  useEffect(() => {
    if (action === "Explain Error") {
      setCurrentMode("explain");
      setResult(null);
      setMessage(
        "Ready to explain this error."
      );
    }

    if (action === "Fix Error") {
      setCurrentMode("fix");
      setResult(null);
      setMessage(
        "Ready to generate a safe fix."
      );
    }
  }, [action, cell]);

  /*
   * Build red/green code preview.
   */
  const diffLines = useMemo(() => {
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
  }, [cell, result]);

  const changedLineCount = useMemo(() => {
    return diffLines.filter(
      (line) => line.type !== "same"
    ).length;
  }, [diffLines]);

  async function requestAI(
    selectedAction: "explain" | "fix"
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
    setMessage("");
    setCurrentMode(selectedAction);

    try {
      const response =
        await analyzePythonError(
          cell.content,
          cell.error,
          selectedAction,
          level
        );

      setResult(response);

      /*
       * Local debugger understands the error
       * but cannot safely rewrite it.
       */
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

  function cancelFix() {
    setResult(null);
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
    setCurrentMode(null);

    setMessage(
      runAfterAccept
        ? "Fix accepted. Running the corrected code..."
        : "Fix accepted. The notebook cell has been updated."
    );
  }

  return (
    <aside className="aiPanel">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="aiHeader">
        <div>
          <span className="aiBadge">
            MODELMIND AI
          </span>

          <h3>
            AI Debugging Tutor
          </h3>
        </div>
      </div>

      <p className="aiHelp">
        Understand the problem before changing
        your code.
      </p>

      {/* ===================================================
          LEVEL
          =================================================== */}

      <div className="levelSelector">
        {(
          [
            "Basic",
            "Intermediate",
            "Advanced",
          ] as ExplanationLevel[]
        ).map((item) => (
          <button
            key={item}
            className={
              level === item
                ? "levelActive"
                : ""
            }
            onClick={() =>
              setLevel(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      {/* ===================================================
          TOOLS
          =================================================== */}

      <div className="aiTools">
        <button
          disabled={
            loading ||
            !cell?.error
          }
          onClick={() =>
            requestAI("explain")
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
              Understand why your code failed.
            </small>
          </span>
        </button>

        <button
          disabled={
            loading ||
            !cell?.error
          }
          onClick={() =>
            requestAI("fix")
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
              Preview changes before applying them.
            </small>
          </span>
        </button>
      </div>

      {/* ===================================================
          SELECTED CELL
          =================================================== */}

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

      {/* ===================================================
          LOADING
          =================================================== */}

      {loading && (
        <div className="debugLoading">
          <div className="debugLoadingIcon">
            ✦
          </div>

          <div>
            <strong>
              ModelMind is analyzing your code
            </strong>

            <p>
              Reading the traceback and locating
              the cause...
            </p>
          </div>
        </div>
      )}

      {/* ===================================================
          MESSAGE
          =================================================== */}

      {message && !loading && (
        <div className="aiMessage">
          {message}
        </div>
      )}

      {/* ===================================================
          EXPLANATION RESULT
          =================================================== */}

      {result &&
        currentMode === "explain" && (
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

            {result.line_number && (
              <div className="errorLocation">
                <span>
                  Line {result.line_number}
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
                  requestAI("fix")
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
        currentMode === "fix" &&
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
              ModelMind will not change your code
              until you accept this suggestion.
            </p>

            {/* =============================================
                RED / GREEN DIFF
                ============================================= */}

            <div className="codeDiff">
              <div className="codeDiffHeader">
                <span>
                  Code changes
                </span>

                <span>
                  {changedLineCount} change
                  {changedLineCount === 1
                    ? ""
                    : "s"}
                </span>
              </div>

              <div className="diffCode">
                {diffLines.map(
                  (line, index) => (
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

            {/* =============================================
                WHY
                ============================================= */}

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

            {/* =============================================
                ACTIONS
                ============================================= */}

            <div className="fixActionBar">
              <button
                className="cancelFixButton"
                onClick={cancelFix}
              >
                Cancel
              </button>

              <button
                className="acceptFixButton"
                onClick={() =>
                  acceptFix(false)
                }
              >
                ✓ Accept Fix
              </button>

              <button
                className="acceptRunButton"
                onClick={() =>
                  acceptFix(true)
                }
              >
                ▶ Accept & Run
              </button>
            </div>

            <p className="fixSafetyText">
              Review AI-generated or automated
              changes before accepting them.
            </p>
          </div>
        )}
    </aside>
  );
}