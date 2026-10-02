"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface Props {
  projectName: string;

  saveStatus:
    | "saved"
    | "saving"
    | "error";

  runtimeReady: boolean;

  onRename: (name: string) => void;

  onNewNotebook: () => void;

  onSaveAs: () => void;

  onOpenRecent: () => void;

  onClearNotebook: () => void;
}

export default function NotebookHeader({
  projectName,
  saveStatus,
  runtimeReady,
  onRename,
  onNewNotebook,
  onSaveAs,
  onOpenRecent,
  onClearNotebook,
}: Props) {
  const [editing, setEditing] =
    useState(false);

  const [name, setName] =
    useState(projectName);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(projectName);
  }, [projectName]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function finishRename() {
    const nextName =
      name.trim() ||
      "Untitled Notebook";

    setName(nextName);
    onRename(nextName);
    setEditing(false);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: "16px",
        padding: "12px 20px",
        borderBottom:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (previous) =>
                  !previous
              )
            }
          >
            File ▾
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                zIndex: 50,
                top: "38px",
                left: 0,
                width: "190px",
                padding: "8px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                background: "#11141a",
                boxShadow:
                  "0 12px 35px rgba(0,0,0,0.35)",
              }}
            >
              <MenuButton
                label="New Notebook"
                onClick={() => {
                  setMenuOpen(false);
                  onNewNotebook();
                }}
              />

              <MenuButton
                label="Open Recent"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenRecent();
                }}
              />

              <MenuButton
                label="Rename"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
              />

              <MenuButton
                label="Save As"
                onClick={() => {
                  setMenuOpen(false);
                  onSaveAs();
                }}
              />

              <div
                style={{
                  height: "1px",
                  background:
                    "rgba(255,255,255,0.08)",
                  margin: "6px 0",
                }}
              />

              <MenuButton
                label="Clear Notebook"
                onClick={() => {
                  setMenuOpen(false);
                  onClearNotebook();
                }}
                danger
              />
            </div>
          )}
        </div>

        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            onBlur={finishRename}
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                finishRename();
              }

              if (
                event.key === "Escape"
              ) {
                setName(projectName);
                setEditing(false);
              }
            }}
            style={{
              minWidth: "260px",
              padding: "7px 10px",
              borderRadius: "8px",
              border:
                "1px solid rgba(255,255,255,0.14)",
              background:
                "rgba(255,255,255,0.04)",
              color: "inherit",
              fontWeight: 600,
            }}
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() =>
              setEditing(true)
            }
            onClick={() =>
              setEditing(true)
            }
            title="Rename notebook"
            style={{
              border: "none",
              background:
                "transparent",
              color: "inherit",
              padding: 0,
              fontWeight: 600,
              fontSize: "14px",
              cursor: "text",
              overflow: "hidden",
              textOverflow:
                "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "420px",
            }}
          >
            {projectName}
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: "11px",
          opacity: 0.75,
        }}
      >
        <span>
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "error"
              ? "Save failed"
              : "Saved ✓"}
        </span>

        <span>
          {runtimeReady
            ? "Python ●"
            : "Python ○"}
        </span>
      </div>
    </div>
  );
}

interface MenuButtonProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuButton({
  label,
  onClick,
  danger = false,
}: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "9px 10px",
        border: "none",
        borderRadius: "7px",
        background:
          "transparent",
        color: danger
          ? "#ff8b8b"
          : "inherit",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}