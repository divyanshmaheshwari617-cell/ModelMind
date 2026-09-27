"use client";

import { NotebookCellType } from "@/types/notebook";

interface Props {
  cell: NotebookCellType;
  index: number;
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
    </div>
  );
}