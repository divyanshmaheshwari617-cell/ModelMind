"use client";

import { useRef } from "react";

interface Props {
  onAddCode: () => void;
  onAddText: () => void;
  onRunAll: () => void;
  onClearOutputs: () => void;

  onUploadFile: (file: File) => void;

  isUploading?: boolean;
  runtimeReady?: boolean;
}

export default function NotebookToolbar({
  onAddCode,
  onAddText,
  onRunAll,
  onClearOutputs,
  onUploadFile,
  isUploading = false,
  runtimeReady = false,
}: Props) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  function openFilePicker() {
    if (!runtimeReady || isUploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onUploadFile(file);

    // Allows selecting the same file again later.
    event.target.value = "";
  }

  return (
    <div className="notebookToolbar">
      <div className="toolbarLeft">

        <button
          onClick={onAddCode}
          type="button"
        >
          + Code
        </button>

        <button
          onClick={onAddText}
          type="button"
        >
          + Text
        </button>

        {/* =========================================
            NOTEBOOK FILE / DATASET UPLOAD
            ========================================= */}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileChange}

          accept={[
            ".csv",
            ".xlsx",
            ".xls",
            ".json",
            ".txt",
            ".tsv",
            ".parquet",
            ".png",
            ".jpg",
            ".jpeg",
            ".npy",
            ".npz",
          ].join(",")}
        />

        <button
          type="button"
          onClick={openFilePicker}
          disabled={
            !runtimeReady ||
            isUploading
          }
          title={
            !runtimeReady
              ? "Wait for the runtime to connect"
              : "Upload dataset or file"
          }
          className="uploadNotebookButton"
        >
          {isUploading
            ? "Uploading..."
            : "↑ Upload"}
        </button>

        <div className="toolbarDivider" />

        <button
          onClick={onRunAll}
          type="button"
          disabled={!runtimeReady}
        >
          ▶ Run all
        </button>

        <button
          onClick={onClearOutputs}
          type="button"
        >
          Clear outputs
        </button>
      </div>

      <div className="toolbarRight">
        <span
          className={
            runtimeReady
              ? "runtimeToolbarReady"
              : "runtimeToolbarConnecting"
          }
        >
          <span className="runtimeDot">
            ●
          </span>

          {runtimeReady
            ? "Python"
            : "Connecting"}
        </span>
      </div>
    </div>
  );
}