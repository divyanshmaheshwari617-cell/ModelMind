"use client";

import { NotebookCellType } from "@/types/notebook";
import MissingPackageAssistant from "./MissingPackageAssistant";

interface Props {

  cell: NotebookCellType;
  index: number;
  runtimeId: string | null;
  runtimeReady: boolean;
  onChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onRun: (id: string) => void;
  onAIAction: (
    action: string,
    cell: NotebookCellType
  ) => void;
}

export default function NotebookCell({
  cell,
  index,
  runtimeId,
  runtimeReady,
  onChange,
  onDelete,
  onRun,
  onAIAction,
}: Props) {
  return (
    <div className="cell">
      <div className="cellHeader">
        <div className="cellNumber">
          [{index + 1}]
        </div>

        <div className="cellType">
          {cell.type === "code" ? "Python" : "Text"}
        </div>

        <div className="cellActions">
          {cell.type === "code" && (
            <>
              <button
                onClick={() =>
                  onAIAction("Explain Code", cell)
                }
              >
                Explain
              </button>

              <button
                onClick={() =>
                  onAIAction("Visualize", cell)
                }
              >
                Visualize
              </button>
            </>
          )}

          <button
            className="deleteButton"
            onClick={() => onDelete(cell.id)}
          >
            ×
          </button>
        </div>
      </div>

      <div className="cellBody">
        {cell.type === "code" && (
          <button
            className="runButton"
            onClick={() => onRun(cell.id)}
          >
            {cell.isRunning ? "■" : "▶"}
          </button>
        )}

        <textarea
          className={
            cell.type === "code"
              ? "codeEditor"
              : "textEditor"
          }
          value={cell.content}
          placeholder={
            cell.type === "code"
              ? "Write Python code..."
              : "Write notes..."
          }
          onChange={(event) =>
            onChange(cell.id, event.target.value)
          }
          spellCheck={false}
        />
      </div>

      {(cell.output || cell.error) && (
        <div
          className={
            cell.error
              ? "cellOutput errorOutput"
              : "cellOutput"
          }
        >
          <div className="outputLabel">
            {cell.error ? "ERROR" : "OUTPUT"}
          </div>

          <pre>{cell.error || cell.output}</pre>
          {cell.error && (
  <MissingPackageAssistant
    runtimeId={runtimeId}
    runtimeReady={runtimeReady}
    traceback={cell.error}
    onRunAgain={() =>
      onRun(cell.id)
    }
  />
)}

          {cell.error && (
            <div className="errorActions">
              <button
                onClick={() =>
                  onAIAction("Explain Error", cell)
                }
              >
                Explain error
              </button>

              <button
                onClick={() =>
                  onAIAction("Fix Error", cell)
                }
              >
                Fix error
              </button>
            </div>
          )}
        </div>
      )}
      {cell.mlAnalysis &&
  cell.mlAnalysis.finding_count > 0 && (
    <div
      style={{
        marginTop: "10px",
        padding: "14px",
        border:
          "1px solid rgba(255, 190, 90, 0.25)",
        borderRadius: "10px",
        background:
          "rgba(255, 190, 90, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            ModelMind ML Check
          </div>

          <div
            style={{
              fontSize: "12px",
              opacity: 0.65,
              marginTop: "3px",
            }}
          >
            {
              cell.mlAnalysis
                .finding_count
            }{" "}
            methodology{" "}
            {cell.mlAnalysis
              .finding_count === 1
              ? "issue"
              : "issues"}{" "}
            detected
          </div>
        </div>

        <span
          style={{
            fontSize: "11px",
            padding: "4px 8px",
            borderRadius: "999px",
            background:
              "rgba(114,226,138,0.10)",
            border:
              "1px solid rgba(114,226,138,0.20)",
          }}
        >
          ModelMind Local
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {cell.mlAnalysis.findings.map(
          (finding) => (
            <details
              key={finding.id}
              style={{
                border:
                  "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                background:
                  "rgba(255,255,255,0.025)",
                overflow: "hidden",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  padding: "11px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    textTransform:
                      "uppercase",
                    fontSize: "10px",
                    padding:
                      "3px 6px",
                    borderRadius:
                      "5px",
                    background:
                      finding.severity ===
                      "critical"
                        ? "rgba(255,80,80,0.18)"
                        : finding.severity ===
                          "high"
                        ? "rgba(255,150,70,0.16)"
                        : finding.severity ===
                          "warning"
                        ? "rgba(255,200,80,0.14)"
                        : "rgba(100,160,255,0.14)",
                  }}
                >
                  {finding.severity}
                </span>

                <span>
                  {finding.title}
                </span>

                {finding.line_number && (
                  <span
                    style={{
                      opacity: 0.5,
                      fontSize: "11px",
                      marginLeft: "auto",
                    }}
                  >
                    Line{" "}
                    {finding.line_number}
                  </span>
                )}
              </summary>

              <div
                style={{
                  padding:
                    "0 12px 12px",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  <strong>
                    What happened
                  </strong>

                  <div
                    style={{
                      opacity: 0.8,
                      marginTop: "3px",
                    }}
                  >
                    {
                      finding.what_happened
                    }
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <strong>
                    Why it matters
                  </strong>

                  <div
                    style={{
                      opacity: 0.8,
                      marginTop: "3px",
                    }}
                  >
                    {
                      finding.why_it_matters
                    }
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <strong>
                    Recommended approach
                  </strong>

                  <div
                    style={{
                      opacity: 0.8,
                      marginTop: "3px",
                    }}
                  >
                    {
                      finding.recommendation
                    }
                  </div>
                </div>

                {finding.code_example && (
                  <div
                    style={{
                      marginTop: "10px",
                    }}
                  >
                    <strong>
                      Example
                    </strong>

                    <pre
                      style={{
                        marginTop: "6px",
                        padding: "10px",
                        overflowX: "auto",
                        borderRadius: "7px",
                        background:
                          "rgba(0,0,0,0.25)",
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {
                        finding.code_example
                      }
                    </pre>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "10px",
                    opacity: 0.55,
                    fontSize: "11px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    Confidence:{" "}
                    {Math.round(
                      finding.confidence *
                        100
                    )}
                    %
                  </span>

                  <span>
                    Level:{" "}
                    {
                      finding.learning_level
                    }
                  </span>

                  <span>
                    Source: Local
                  </span>
                </div>
              </div>
            </details>
          )
        )}
      </div>
    </div>
  )}

{cell.mlAnalysis &&
  cell.mlAnalysis.finding_count === 0 &&
  !cell.error && (
    <div
      style={{
        marginTop: "10px",
        padding: "9px 12px",
        border:
          "1px solid rgba(114,226,138,0.18)",
        borderRadius: "8px",
        background:
          "rgba(114,226,138,0.04)",
        fontSize: "12px",
        opacity: 0.75,
      }}
    >
      ✓ ModelMind ML Check — no methodology
      issues detected
    </div>
  )}

{cell.mlAnalysisError &&
  !cell.error && (
    <div
      style={{
        marginTop: "10px",
        fontSize: "11px",
        opacity: 0.5,
      }}
    >
      ML Check unavailable:{" "}
      {cell.mlAnalysisError}
    </div>
  )}
    </div>
  );
}