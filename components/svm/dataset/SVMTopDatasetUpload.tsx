import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  useSVM,
} from "../context/SVMContext";

import {
  analyzeColumns,
  createActiveDataset,
  getColumns,
  getNumericColumns,
} from "./datasetUtils";

import {
  parseCSVFile,
} from "./csvParser";

import type {
  SVMTask,
} from "../types/svm";

import "./SVMTopDatasetUpload.css";

export default function SVMTopDatasetUpload() {
  const {
    state,
    setDataset,
  } = useSVM();

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFile(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result =
        await parseCSVFile(
          file
        );

      if (
        result.rows.length ===
        0
      ) {
        setMessage(
          "CSV contains no usable rows."
        );

        return;
      }

      const columns =
        getColumns(
          result.rows
        );

      const numericColumns =
        getNumericColumns(
          result.rows
        );

      if (
        columns.length < 2
      ) {
        setMessage(
          "CSV needs at least one feature column and one target column."
        );

        return;
      }

      /*
       * ===================================================
       * DEFAULT TARGET
       * ===================================================
       *
       * Initially use final CSV column.
       * Dataset Studio can change it.
       */

      const targetColumn =
        columns[
          columns.length - 1
        ];

      /*
       * ===================================================
       * FEATURES
       * ===================================================
       *
       * ONLY numeric columns are used
       * by SVM visualization.
       *
       * We keep up to 3 initially.
       *
       * 1 feature:
       *   2D learning still works.
       *
       * 2 features:
       *   X/Y real features.
       *   3D can use decision/kernel Z.
       *
       * 3+ features:
       *   X/Y/Z use actual selected
       *   dataset features.
       */

      const featureColumns =
        numericColumns
          .filter(
            (column) =>
              column !==
              targetColumn
          )
          .slice(
            0,
            3
          );

      if (
        featureColumns.length ===
        0
      ) {
        setMessage(
          "No numeric feature columns were found. SVM visualization requires at least one numeric feature."
        );

        return;
      }

      /*
       * ===================================================
       * TASK INFERENCE
       * ===================================================
       */

      const targetValues =
        result.rows
          .map(
            (row) =>
              row[
                targetColumn
              ]
          )
          .filter(
            (value) =>
              value !==
                undefined &&
              value !==
                null &&
              String(
                value
              ).trim() !==
                ""
          );

      const uniqueTargets =
        new Set(
          targetValues.map(
            String
          )
        );

      const targetAnalysis =
        analyzeColumns(
          result.rows
        ).find(
          (column) =>
            column.name ===
            targetColumn
        );

      const targetIsNumeric =
        targetAnalysis?.type ===
        "numeric";

      /*
       * Classification:
       * - categorical target
       * OR
       * - small number of unique values
       *
       * Regression:
       * - numeric target
       * - many unique values
       */

      let inferredTask:
        SVMTask;

      if (!targetIsNumeric) {
        inferredTask =
          "classification";
      } else {
        const uniqueCount =
          uniqueTargets.size;

        const threshold =
          Math.max(
            12,
            Math.round(
              result.rows.length *
                0.12
            )
          );

        inferredTask =
          uniqueCount <=
          threshold
            ? "classification"
            : "regression";
      }

      /*
       * ===================================================
       * CREATE ACTIVE CSV DATASET
       * ===================================================
       */

      const dataset =
        createActiveDataset(
          file.name.replace(
            /\.csv$/i,
            ""
          ),

          result.rows,

          featureColumns,

          targetColumn,

          inferredTask,

          true,

          "uploaded"
        );

      /*
       * THIS SINGLE CALL MAKES
       * THE CSV THE CENTRAL DATASET.
       *
       * Visual Learning
       * Kernel Lab
       * Learning Labs
       * Experiment
       * Prediction
       * Dashboard
       *
       * all read from state.dataset.
       */

      setDataset(
        dataset
      );

      setMessage(
        `✓ ${dataset.name} activated — ${dataset.rows.length} rows, ${dataset.featureColumns.length} selected numeric feature${dataset.featureColumns.length === 1 ? "" : "s"}, target "${dataset.targetColumn}", ${dataset.task === "classification" ? "SVC" : "SVR"} mode. All SVM labs now use this CSV.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload CSV."
      );
    } finally {
      setLoading(false);
    }
  }

  const isUploaded =
    state.dataset?.source ===
    "uploaded";

  return (
    <section className="top-dataset-upload">
      <div className="top-upload-copy">
        <span>
          DATA SOURCE
        </span>

        <h3>
          {isUploaded
            ? "Your CSV Is Active"
            : "ModelMind Showcase Dataset"}
        </h3>

        <p>
          {isUploaded
            ? "Every SVM visualization, parameter lab, experiment and prediction now uses your uploaded dataset."
            : "Explore the complete SVM lab immediately with the built-in showcase, or upload a CSV to replace it everywhere."}
        </p>
      </div>

      <div className="top-upload-actions">
        <input
          ref={inputRef}
          className="hidden-dataset-input"
          type="file"
          accept=".csv,text/csv"
          onChange={
            handleFile
          }
        />

        <button
          type="button"
          className="top-upload-button"
          onClick={
            openPicker
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Analyzing CSV..."
            : isUploaded
              ? "↻ Replace CSV"
              : "↑ Upload CSV Dataset"}
        </button>

        <div className="top-upload-current">
          <span>
            Active Dataset
          </span>

          <strong>
            {state.dataset?.name ??
              "No dataset"}
          </strong>
        </div>
      </div>

      {state.dataset && (
        <div className="top-upload-message">
          {state.dataset.source ===
          "uploaded"
            ? "CSV MODE • "
            : "SHOWCASE MODE • "}

          {
            state.dataset.rows
              .length
          }{" "}
          rows •{" "}
          {
            state.dataset
              .featureColumns
              .length
          }{" "}
          features • target:{" "}
          {
            state.dataset
              .targetColumn
          }{" "}
          •{" "}
          {state.dataset.task ===
          "classification"
            ? "SVC"
            : "SVR"}
        </div>
      )}

      {message && (
        <div className="top-upload-message">
          {message}
        </div>
      )}
    </section>
  );
}