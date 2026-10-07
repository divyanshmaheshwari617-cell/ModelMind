import {
  useMemo,
  useState,
} from "react";

import Papa from "papaparse";

import type {
  KNNRow,
  KNNTask,
} from "../types/knn";

import MissingValueAnalyzer from "../preprocessing/MissingValueAnalyzer";
import ScalingAnalyzer from "../preprocessing/ScalingAnalyzer";

import {
  detectSuggestedTask,
  getClassCounts,
  getColumns,
  getNumericColumns,
  prepareDataset,
  summarizeColumns,
} from "../preprocessing/preprocessingMath";

import type {
  MissingStrategy,
  RawDatasetRow,
} from "../preprocessing/preprocessingMath";

interface Props {
  onUseDataset: (
    rows: KNNRow[],
    featureNames: string[],
    targetName: string,
    task: KNNTask,
    scalingEnabled: boolean,
  ) => void;
}

/* =========================================================
   DEFAULT CLASSIFICATION DATASET
   ---------------------------------------------------------
   Features:
   - StudyHours
   - Attendance

   Target:
   - Result

   Purpose:
   Demonstrates KNN Classification.
========================================================= */

const defaultClassificationRows: RawDatasetRow[] = [
  {
    StudyHours: 1.0,
    Attendance: 42,
    Result: "Fail",
  },
  {
    StudyHours: 1.5,
    Attendance: 48,
    Result: "Fail",
  },
  {
    StudyHours: 2.0,
    Attendance: 52,
    Result: "Fail",
  },
  {
    StudyHours: 2.5,
    Attendance: 58,
    Result: "Fail",
  },
  {
    StudyHours: 3.0,
    Attendance: 61,
    Result: "Fail",
  },
  {
    StudyHours: 3.2,
    Attendance: 65,
    Result: "Fail",
  },
  {
    StudyHours: 3.5,
    Attendance: 67,
    Result: "Pass",
  },
  {
    StudyHours: 4.0,
    Attendance: 70,
    Result: "Pass",
  },
  {
    StudyHours: 4.5,
    Attendance: 74,
    Result: "Pass",
  },
  {
    StudyHours: 5.0,
    Attendance: 78,
    Result: "Pass",
  },
  {
    StudyHours: 5.5,
    Attendance: 81,
    Result: "Pass",
  },
  {
    StudyHours: 6.0,
    Attendance: 85,
    Result: "Pass",
  },
  {
    StudyHours: 6.5,
    Attendance: 87,
    Result: "Pass",
  },
  {
    StudyHours: 7.0,
    Attendance: 90,
    Result: "Pass",
  },
  {
    StudyHours: 7.5,
    Attendance: 93,
    Result: "Pass",
  },
  {
    StudyHours: 8.0,
    Attendance: 96,
    Result: "Pass",
  },
];

/* =========================================================
   DEFAULT REGRESSION DATASET
   ---------------------------------------------------------
   Features:
   - StudyHours
   - Attendance

   Target:
   - Score

   Purpose:
   Demonstrates KNN Regression.
========================================================= */

const defaultRegressionRows: RawDatasetRow[] = [
  {
    StudyHours: 1.0,
    Attendance: 45,
    Score: 35,
  },
  {
    StudyHours: 1.5,
    Attendance: 50,
    Score: 39,
  },
  {
    StudyHours: 2.0,
    Attendance: 54,
    Score: 43,
  },
  {
    StudyHours: 2.5,
    Attendance: 58,
    Score: 47,
  },
  {
    StudyHours: 3.0,
    Attendance: 62,
    Score: 52,
  },
  {
    StudyHours: 3.5,
    Attendance: 66,
    Score: 56,
  },
  {
    StudyHours: 4.0,
    Attendance: 70,
    Score: 61,
  },
  {
    StudyHours: 4.5,
    Attendance: 73,
    Score: 65,
  },
  {
    StudyHours: 5.0,
    Attendance: 77,
    Score: 69,
  },
  {
    StudyHours: 5.5,
    Attendance: 80,
    Score: 73,
  },
  {
    StudyHours: 6.0,
    Attendance: 84,
    Score: 78,
  },
  {
    StudyHours: 6.5,
    Attendance: 87,
    Score: 82,
  },
  {
    StudyHours: 7.0,
    Attendance: 90,
    Score: 86,
  },
  {
    StudyHours: 7.5,
    Attendance: 93,
    Score: 91,
  },
  {
    StudyHours: 8.0,
    Attendance: 96,
    Score: 95,
  },
];

export default function KNNDatasetAnalyzer({
  onUseDataset,
}: Props) {
  /*
   * IMPORTANT:
   *
   * We intentionally start with an empty dataset.
   *
   * This prevents the previous problem where ModelMind
   * automatically processed a demo dataset on startup.
   */
  const [rawRows, setRawRows] =
    useState<RawDatasetRow[]>([]);

  const [targetColumn, setTargetColumn] =
    useState("");

  const [featureColumns, setFeatureColumns] =
    useState<string[]>([]);

  const [task, setTask] =
    useState<KNNTask>("classification");

  const [
    missingStrategy,
    setMissingStrategy,
  ] =
    useState<MissingStrategy>(
      "median",
    );

  const [
    scalingEnabled,
    setScalingEnabled,
  ] =
    useState(true);

  /* =========================================================
     DATASET INFORMATION
  ========================================================= */

  const columns =
    useMemo(
      () =>
        getColumns(
          rawRows,
        ),
      [rawRows],
    );

  const numericColumns =
    useMemo(
      () =>
        getNumericColumns(
          rawRows,
        ),
      [rawRows],
    );

  const summaries =
    useMemo(
      () =>
        summarizeColumns(
          rawRows,
        ),
      [rawRows],
    );

  /* =========================================================
     PREPARE DATASET
  ========================================================= */

  const prepared =
    useMemo(
      () =>
        prepareDataset(
          rawRows,
          featureColumns,
          targetColumn,
          task,
          missingStrategy,
        ),
      [
        rawRows,
        featureColumns,
        targetColumn,
        task,
        missingStrategy,
      ],
    );

  /* =========================================================
     CLASS DISTRIBUTION
  ========================================================= */

  const classCounts =
    useMemo(
      () =>
        task ===
        "classification"
          ? getClassCounts(
              prepared.rows,
            )
          : [],
      [
        prepared.rows,
        task,
      ],
    );

  /* =========================================================
     FEATURE SELECTION
  ========================================================= */

  function toggleFeature(
    column: string,
  ) {
    setFeatureColumns(
      (current) => {
        if (
          current.includes(
            column,
          )
        ) {
          return current.filter(
            (item) =>
              item !== column,
          );
        }

        return [
          ...current,
          column,
        ];
      },
    );
  }

  /* =========================================================
     TARGET CHANGE
  ========================================================= */

  function handleTargetChange(
    column: string,
  ) {
    setTargetColumn(
      column,
    );

    setFeatureColumns(
      (current) =>
        current.filter(
          (feature) =>
            feature !== column,
        ),
    );

    setTask(
      detectSuggestedTask(
        rawRows,
        column,
      ),
    );
  }

  /* =========================================================
     SHARED DATASET LOADER

     This function is used by:
     1. CSV upload
     2. Default Classification Dataset
     3. Default Regression Dataset

     This keeps the behavior consistent.
  ========================================================= */

  function loadDataset(
    rows: RawDatasetRow[],
    preferredTask?: KNNTask,
  ) {
    if (
      rows.length === 0
    ) {
      return;
    }

    const newColumns =
      getColumns(
        rows,
      );

    const newNumeric =
      getNumericColumns(
        rows,
      );

    if (
      newColumns.length === 0
    ) {
      return;
    }

    const suggestedTarget =
      newColumns[
        newColumns.length - 1
      ];

    setRawRows(
      rows,
    );

    setTargetColumn(
      suggestedTarget,
    );

    setFeatureColumns(
      newNumeric
        .filter(
          (column) =>
            column !==
            suggestedTarget,
        )
        .slice(
          0,
          4,
        ),
    );

    setTask(
      preferredTask ??
        detectSuggestedTask(
          rows,
          suggestedTarget,
        ),
    );

    /*
     * Reset preprocessing controls whenever
     * a new dataset is loaded.
     */
    setMissingStrategy(
      "median",
    );

    setScalingEnabled(
      true,
    );
  }

  /* =========================================================
     CSV UPLOAD
  ========================================================= */

  function handleCSV(
    file: File,
  ) {
    Papa.parse<RawDatasetRow>(
      file,
      {
        header: true,

        skipEmptyLines: true,

        dynamicTyping: true,

        complete: (
          results,
        ) => {
          const parsedRows =
            results.data.filter(
              (row) =>
                Object.keys(
                  row,
                ).length >
                0,
            );

          if (
            parsedRows.length ===
            0
          ) {
            return;
          }

          loadDataset(
            parsedRows,
          );
        },
      },
    );
  }

  /* =========================================================
     EMPTY STARTING SCREEN

     No dataset is automatically loaded.

     User can:
     - upload CSV
     - choose classification demo
     - choose regression demo
  ========================================================= */

  if (
    rawRows.length ===
    0
  ) {
    return (
      <section className="knn-dataset-shell">
        <div className="knn-card">
          <div className="knn-section-heading">
            <div>
              <p className="knn-eyebrow">
                DATASET
              </p>

              <h2>
                KNN Dataset Analyzer
              </h2>

              <p className="knn-muted">
                No dataset loaded yet.
                Upload your own CSV or
                choose one of the default
                datasets below.
              </p>
            </div>

            <label className="knn-upload-button">
              Upload CSV

              <input
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(
                  event,
                ) => {
                  const file =
                    event.target
                      .files?.[0];

                  if (
                    file
                  ) {
                    handleCSV(
                      file,
                    );
                  }

                  event.target.value =
                    "";
                }}
              />
            </label>
          </div>

          <div className="knn-info-box">
            Upload your own dataset
            or use a built-in dataset
            to explore KNN immediately.
            Nothing is loaded
            automatically.
          </div>
        </div>

        {/* ===============================================
            DEFAULT DATASETS
        =============================================== */}

        <div className="knn-card">
          <p className="knn-eyebrow">
            DEFAULT DATASETS
          </p>

          <h2>
            Try KNN Instantly
          </h2>

          <p className="knn-muted">
            Choose a classification
            or regression dataset.
            Both go through the same
            preprocessing workflow as
            an uploaded CSV.
          </p>

          <div className="knn-choice-grid">
            {/* CLASSIFICATION */}

            <button
              type="button"
              className="knn-choice"
              onClick={() =>
                loadDataset(
                  defaultClassificationRows,
                  "classification",
                )
              }
            >
              <strong>
                Classification Dataset
              </strong>

              <span>
                StudyHours +
                Attendance →
                Result
                (Pass / Fail)
              </span>
            </button>

            {/* REGRESSION */}

            <button
              type="button"
              className="knn-choice"
              onClick={() =>
                loadDataset(
                  defaultRegressionRows,
                  "regression",
                )
              }
            >
              <strong>
                Regression Dataset
              </strong>

              <span>
                StudyHours +
                Attendance →
                Score
              </span>
            </button>
          </div>

          <div className="knn-info-box">
            <strong>
              Classification:
            </strong>{" "}
            KNN finds nearby
            students and uses
            neighbor voting to
            predict Pass or Fail.
            <br />
            <br />
            <strong>
              Regression:
            </strong>{" "}
            KNN finds nearby
            students and averages
            their scores to predict
            a numerical Score.
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     DATASET VALIDATION
  ========================================================= */

  const canUseDataset =
    prepared.rows.length >
      0 &&
    featureColumns.length >
      0 &&
    targetColumn.length >
      0 &&
    !featureColumns.includes(
      targetColumn,
    ) &&
    prepared.warnings.length ===
      0;

  /* =========================================================
     MAIN DATASET ANALYZER
  ========================================================= */

  return (
    <section className="knn-dataset-shell">
      {/* ===============================================
          DATASET OVERVIEW
      =============================================== */}

      <div className="knn-card">
        <div className="knn-section-heading">
          <div>
            <p className="knn-eyebrow">
              DATASET
            </p>

            <h2>
              KNN Dataset Analyzer
            </h2>

            <p className="knn-muted">
              Dataset loaded successfully.
              You can still upload another
              CSV whenever you want.
            </p>
          </div>

          <label className="knn-upload-button">
            Upload Another CSV

            <input
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(
                event,
              ) => {
                const file =
                  event.target
                    .files?.[0];

                if (
                  file
                ) {
                  handleCSV(
                    file,
                  );
                }

                event.target.value =
                  "";
              }}
            />
          </label>
        </div>

        <div className="knn-stat-grid">
          <div className="knn-stat">
            <span>
              Raw rows
            </span>

            <strong>
              {rawRows.length}
            </strong>
          </div>

          <div className="knn-stat">
            <span>
              Columns
            </span>

            <strong>
              {columns.length}
            </strong>
          </div>

          <div className="knn-stat">
            <span>
              Numeric columns
            </span>

            <strong>
              {
                numericColumns.length
              }
            </strong>
          </div>

          <div className="knn-stat">
            <span>
              Usable rows
            </span>

            <strong>
              {
                prepared.rows.length
              }
            </strong>
          </div>
        </div>
      </div>

      {/* ===============================================
          TASK
      =============================================== */}

      <div className="knn-card">
        <p className="knn-eyebrow">
          TASK
        </p>

        <h2>
          Classification or
          Regression?
        </h2>

        <div className="knn-choice-grid">
          <button
            type="button"
            className={
              task ===
              "classification"
                ? "knn-choice active"
                : "knn-choice"
            }
            onClick={() =>
              setTask(
                "classification",
              )
            }
          >
            <strong>
              Classification
            </strong>

            <span>
              Predict a class or
              category.
            </span>
          </button>

          <button
            type="button"
            className={
              task ===
              "regression"
                ? "knn-choice active"
                : "knn-choice"
            }
            onClick={() =>
              setTask(
                "regression",
              )
            }
          >
            <strong>
              Regression
            </strong>

            <span>
              Predict a continuous
              numerical value.
            </span>
          </button>
        </div>
      </div>

      {/* ===============================================
          TARGET
      =============================================== */}

      <div className="knn-card">
        <p className="knn-eyebrow">
          TARGET
        </p>

        <h2>
          Select Target
        </h2>

        <select
          value={
            targetColumn
          }
          onChange={(
            event,
          ) =>
            handleTargetChange(
              event.target.value,
            )
          }
        >
          {columns.map(
            (column) => (
              <option
                key={
                  column
                }
                value={
                  column
                }
              >
                {column}
              </option>
            ),
          )}
        </select>

        <p className="knn-muted">
          ModelMind automatically
          suggests classification or
          regression when the target
          changes. You can override
          that suggestion above.
        </p>
      </div>

      {/* ===============================================
          FEATURES
      =============================================== */}

      <div className="knn-card">
        <p className="knn-eyebrow">
          FEATURES
        </p>

        <h2>
          Select Numerical Features
        </h2>

        <div className="knn-feature-grid">
          {numericColumns
            .filter(
              (column) =>
                column !==
                targetColumn,
            )
            .map(
              (column) => {
                const selected =
                  featureColumns.includes(
                    column,
                  );

                return (
                  <button
                    type="button"
                    key={
                      column
                    }
                    className={
                      selected
                        ? "knn-feature-chip active"
                        : "knn-feature-chip"
                    }
                    onClick={() =>
                      toggleFeature(
                        column,
                      )
                    }
                  >
                    {selected
                      ? "✓ "
                      : ""}

                    {column}
                  </button>
                );
              },
            )}
        </div>

        <p className="knn-muted">
          {
            featureColumns.length
          }{" "}
          feature
          {featureColumns.length ===
          1
            ? ""
            : "s"}{" "}
          selected
        </p>
      </div>

      {/* ===============================================
          MISSING VALUE ANALYSIS
      =============================================== */}

      <MissingValueAnalyzer
        summaries={
          summaries
        }
        strategy={
          missingStrategy
        }
        onStrategyChange={
          setMissingStrategy
        }
      />

      {/* ===============================================
          FEATURE SCALING
      =============================================== */}

      <ScalingAnalyzer
        rows={
          rawRows
        }
        featureColumns={
          featureColumns
        }
        scalingEnabled={
          scalingEnabled
        }
        onScalingChange={
          setScalingEnabled
        }
      />

      {/* ===============================================
          CLASSIFICATION TARGET HEALTH
      =============================================== */}

      {task ===
        "classification" && (
        <div className="knn-card">
          <p className="knn-eyebrow">
            TARGET HEALTH
          </p>

          <h2>
            Class Distribution
          </h2>

          {classCounts.length >
          0 ? (
            <div className="knn-class-list">
              {classCounts.map(
                (item) => (
                  <div
                    key={String(
                      item.classLabel,
                    )}
                    className="knn-class-row"
                  >
                    <strong>
                      {String(
                        item.classLabel,
                      )}
                    </strong>

                    <div className="knn-class-bar-shell">
                      <div
                        className="knn-class-bar"
                        style={{
                          width: `${Math.max(
                            2,
                            item.percentage,
                          )}%`,
                        }}
                      />
                    </div>

                    <span>
                      {
                        item.count
                      }{" "}
                      (
                      {item.percentage.toFixed(
                        1,
                      )}
                      %)
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="knn-info-box">
              No valid classes
              are currently
              available.
            </div>
          )}
        </div>
      )}

      {/* ===============================================
          PREPROCESSING RESULT
      =============================================== */}

      <div className="knn-card">
        <p className="knn-eyebrow">
          PREPROCESSING RESULT
        </p>

        <h2>
          Dataset Ready Check
        </h2>

        <div className="knn-stat-grid">
          <div className="knn-stat">
            <span>
              Final rows
            </span>

            <strong>
              {
                prepared.rows.length
              }
            </strong>
          </div>

          <div className="knn-stat">
            <span>
              Removed rows
            </span>

            <strong>
              {
                prepared.removedRows
              }
            </strong>
          </div>

          <div className="knn-stat">
            <span>
              Imputed values
            </span>

            <strong>
              {
                prepared.imputedValues
              }
            </strong>
          </div>

          <div className="knn-stat">
            <span>
              Scaling
            </span>

            <strong>
              {scalingEnabled
                ? "ON"
                : "OFF"}
            </strong>
          </div>
        </div>

        {/* WARNINGS */}

        {prepared.warnings.map(
          (warning) => (
            <div
              key={
                warning
              }
              className="knn-warning-box"
            >
              {warning}
            </div>
          ),
        )}

        {/* READY MESSAGE */}

        {canUseDataset && (
          <div className="knn-info-box">
            Dataset is ready for
            KNN. Click{" "}
            <strong>
              Use This Dataset
            </strong>{" "}
            to send the processed
            data to the
            visualization lab.
          </div>
        )}

        {/* USE DATASET */}

        <button
          type="button"
          className="knn-primary-button"
          disabled={
            !canUseDataset
          }
          onClick={() =>
            onUseDataset(
              prepared.rows,
              featureColumns,
              targetColumn,
              task,
              scalingEnabled,
            )
          }
        >
          Use This Dataset
        </button>
      </div>
    </section>
  );
}