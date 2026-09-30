import {
  useMemo,
  useState,
} from "react";

import Papa from "papaparse";

import type {
  SVMRow,
  SVMTask,
} from "../types/svm";

import MissingValueAnalyzer from "../preprocessing/MissingValueAnalyzer";

import ScalingAnalyzer from "../preprocessing/ScalingAnalyzer";

import {
  analyzeColumns,
  prepareDataset,
  type ImputationMethod,
  type RawDatasetRow,
} from "../preprocessing/preprocessingMath";

type Props = {
  onUseDataset?: (
    rows: SVMRow[],
    featureColumns: string[],
    targetColumn: string,
    task: SVMTask,
    scalingEnabled: boolean
  ) => void;
};

const classificationDataset:
  RawDatasetRow[] = [
  {
    StudyHours: 1,
    Attendance: 45,
    Result: "Fail",
  },
  {
    StudyHours: 1.5,
    Attendance: 50,
    Result: "Fail",
  },
  {
    StudyHours: 2,
    Attendance: 52,
    Result: "Fail",
  },
  {
    StudyHours: 2.5,
    Attendance: 58,
    Result: "Fail",
  },
  {
    StudyHours: 3,
    Attendance: 60,
    Result: "Fail",
  },
  {
    StudyHours: 3.5,
    Attendance: 64,
    Result: "Fail",
  },
  {
    StudyHours: 4,
    Attendance: 68,
    Result: "Fail",
  },
  {
    StudyHours: 4.5,
    Attendance: 72,
    Result: "Pass",
  },
  {
    StudyHours: 5,
    Attendance: 75,
    Result: "Pass",
  },
  {
    StudyHours: 5.5,
    Attendance: 78,
    Result: "Pass",
  },
  {
    StudyHours: 6,
    Attendance: 80,
    Result: "Pass",
  },
  {
    StudyHours: 6.5,
    Attendance: 83,
    Result: "Pass",
  },
  {
    StudyHours: 7,
    Attendance: 86,
    Result: "Pass",
  },
  {
    StudyHours: 7.5,
    Attendance: 88,
    Result: "Pass",
  },
  {
    StudyHours: 8,
    Attendance: 92,
    Result: "Pass",
  },
  {
    StudyHours: 9,
    Attendance: 96,
    Result: "Pass",
  },
];

const regressionDataset:
  RawDatasetRow[] = [
  {
    StudyHours: 1,
    Attendance: 48,
    Score: 35,
  },
  {
    StudyHours: 1.5,
    Attendance: 52,
    Score: 39,
  },
  {
    StudyHours: 2,
    Attendance: 55,
    Score: 43,
  },
  {
    StudyHours: 2.5,
    Attendance: 58,
    Score: 46,
  },
  {
    StudyHours: 3,
    Attendance: 62,
    Score: 51,
  },
  {
    StudyHours: 3.5,
    Attendance: 65,
    Score: 55,
  },
  {
    StudyHours: 4,
    Attendance: 68,
    Score: 59,
  },
  {
    StudyHours: 4.5,
    Attendance: 71,
    Score: 63,
  },
  {
    StudyHours: 5,
    Attendance: 75,
    Score: 68,
  },
  {
    StudyHours: 5.5,
    Attendance: 78,
    Score: 72,
  },
  {
    StudyHours: 6,
    Attendance: 81,
    Score: 76,
  },
  {
    StudyHours: 6.5,
    Attendance: 84,
    Score: 80,
  },
  {
    StudyHours: 7,
    Attendance: 87,
    Score: 84,
  },
  {
    StudyHours: 8,
    Attendance: 92,
    Score: 91,
  },
  {
    StudyHours: 9,
    Attendance: 96,
    Score: 96,
  },
];

function getColumns(
  rows: RawDatasetRow[]
): string[] {
  if (rows.length === 0) {
    return [];
  }

  return Object.keys(
    rows[0]
  );
}

function isNumericColumn(
  rows: RawDatasetRow[],
  column: string
): boolean {
  const valid =
    rows
      .map(
        (row) =>
          row[column]
      )
      .filter(
        (value) =>
          value !== null &&
          value !==
            undefined &&
          String(value).trim() !==
            ""
      );

  if (valid.length === 0) {
    return false;
  }

  return valid.every(
    (value) =>
      Number.isFinite(
        Number(value)
      )
  );
}

export default function SVMDatasetAnalyzer({
  onUseDataset,
}: Props) {
  const [
    rawRows,
    setRawRows,
  ] = useState<
    RawDatasetRow[]
  >([]);

  const [
    task,
    setTask,
  ] =
    useState<SVMTask>(
      "classification"
    );

  const [
    featureColumns,
    setFeatureColumns,
  ] = useState<string[]>(
    []
  );

  const [
    targetColumn,
    setTargetColumn,
  ] = useState("");

  const [
    methods,
    setMethods,
  ] = useState<
    Record<
      string,
      ImputationMethod
    >
  >({});

  const [
    scalingEnabled,
    setScalingEnabled,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  const columns =
    useMemo(
      () =>
        getColumns(
          rawRows
        ),
      [rawRows]
    );

  const numericColumns =
    useMemo(
      () =>
        columns.filter(
          (column) =>
            isNumericColumn(
              rawRows,
              column
            )
        ),
      [columns, rawRows]
    );

  const analyses =
    useMemo(
      () =>
        analyzeColumns(
          rawRows,
          featureColumns
        ),
      [
        rawRows,
        featureColumns,
      ]
    );

  const prepared =
    useMemo(
      () =>
        prepareDataset(
          rawRows,
          featureColumns,
          targetColumn,
          methods
        ),
      [
        rawRows,
        featureColumns,
        targetColumn,
        methods,
      ]
    );

  function loadDataset(
    rows: RawDatasetRow[],
    preferredTask: SVMTask
  ) {
    const nextColumns =
      getColumns(rows);

    const nextTarget =
      nextColumns[
        nextColumns.length -
          1
      ] ?? "";

    const nextFeatures =
      nextColumns
        .filter(
          (column) =>
            column !==
              nextTarget &&
            isNumericColumn(
              rows,
              column
            )
        )
        .slice(0, 2);

    setRawRows(rows);
    setTask(
      preferredTask
    );

    setTargetColumn(
      nextTarget
    );

    setFeatureColumns(
      nextFeatures
    );

    setMethods({});

    setScalingEnabled(
      true
    );

    setMessage(
      `${rows.length} rows loaded.`
    );
  }

  function handleFile(
    file: File
  ) {
    Papa.parse<
      RawDatasetRow
    >(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,

      complete: (
        results
      ) => {
        const rows =
          results.data.filter(
            (row) =>
              Object.values(
                row
              ).some(
                (value) =>
                  value !==
                    null &&
                  value !==
                    undefined &&
                  String(
                    value
                  ).trim() !==
                    ""
              )
          );

        if (
          rows.length === 0
        ) {
          setMessage(
            "No usable CSV rows were found."
          );
          return;
        }

        loadDataset(
          rows,
          task
        );
      },

      error: () => {
        setMessage(
          "The CSV file could not be read."
        );
      },
    });
  }

  function toggleFeature(
    column: string
  ) {
    setFeatureColumns(
      (previous) => {
        if (
          previous.includes(
            column
          )
        ) {
          return previous.filter(
            (feature) =>
              feature !==
              column
          );
        }

        return [
          ...previous,
          column,
        ];
      }
    );
  }

  function handleMethodChange(
    column: string,
    method: ImputationMethod
  ) {
    setMethods(
      (previous) => ({
        ...previous,
        [column]:
          method,
      })
    );
  }

  function useDataset() {
    if (
      rawRows.length === 0
    ) {
      setMessage(
        "Load a dataset first."
      );
      return;
    }

    if (
      featureColumns.length ===
      0
    ) {
      setMessage(
        "Select at least one numeric feature."
      );
      return;
    }

    if (!targetColumn) {
      setMessage(
        "Select a target column."
      );
      return;
    }

    if (
      featureColumns.includes(
        targetColumn
      )
    ) {
      setMessage(
        "The target cannot also be used as a feature."
      );
      return;
    }

    if (
      prepared.rows.length <
      4
    ) {
      setMessage(
        "Too few usable rows remain after preprocessing."
      );
      return;
    }

    if (
      task ===
      "regression"
    ) {
      const numericTargets =
        prepared.rows.filter(
          (row) =>
            Number.isFinite(
              Number(
                row.target
              )
            )
        );

      if (
        numericTargets.length !==
        prepared.rows.length
      ) {
        setMessage(
          "SVR requires a numeric target."
        );
        return;
      }
    }

    if (
      task ===
      "classification"
    ) {
      const classes =
        new Set(
          prepared.rows.map(
            (row) =>
              String(
                row.target
              )
          )
        );

      if (
        classes.size !== 2
      ) {
        setMessage(
          "This SVM classification lab currently teaches binary SVC, so select a target with exactly two classes."
        );
        return;
      }
    }

    onUseDataset?.(
      prepared.rows,
      featureColumns,
      targetColumn,
      task,
      scalingEnabled
    );

    setMessage(
      `Dataset ready: ${prepared.rows.length} usable rows, ${prepared.imputedValues} imputed values, ${prepared.removedRows} removed rows.`
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <section
        style={{
          border:
            "1px solid #334155",
          borderRadius: 16,
          padding: 20,
          background:
            "#0f172a",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          SVM Dataset Analyzer
        </h2>

        <p
          style={{
            color:
              "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          Load your own CSV or
          use a small educational
          dataset. Select the
          features and target
          before sending the data
          into the SVM
          visualizations.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() =>
              loadDataset(
                classificationDataset,
                "classification"
              )
            }
          >
            Classification Dataset
          </button>

          <button
            type="button"
            onClick={() =>
              loadDataset(
                regressionDataset,
                "regression"
              )
            }
          >
            Regression Dataset
          </button>

          <label
            style={{
              border:
                "1px solid #475569",
              padding:
                "8px 12px",
              borderRadius: 8,
              cursor:
                "pointer",
            }}
          >
            Upload CSV

            <input
              type="file"
              accept=".csv,text/csv"
              style={{
                display:
                  "none",
              }}
              onChange={(
                event
              ) => {
                const file =
                  event
                    .target
                    .files?.[0];

                if (file) {
                  handleFile(
                    file
                  );
                }

                event.target.value =
                  "";
              }}
            />
          </label>
        </div>

        {message && (
          <p
            style={{
              marginTop: 14,
              color:
                "#93c5fd",
            }}
          >
            {message}
          </p>
        )}
      </section>

      {rawRows.length > 0 && (
        <>
          <section
            style={{
              border:
                "1px solid #334155",
              borderRadius: 16,
              padding: 20,
              background:
                "#0f172a",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              Configure Dataset
            </h3>

            <div
              style={{
                display:
                  "grid",
                gap: 16,
              }}
            >
              <label>
                Task
                <select
                  value={task}
                  onChange={(
                    event
                  ) =>
                    setTask(
                      event
                        .target
                        .value as SVMTask
                    )
                  }
                  style={{
                    display:
                      "block",
                    marginTop: 6,
                  }}
                >
                  <option value="classification">
                    Classification
                    (SVC)
                  </option>

                  <option value="regression">
                    Regression
                    (SVR)
                  </option>
                </select>
              </label>

              <div>
                <strong>
                  Numeric Features
                </strong>

                <div
                  style={{
                    display:
                      "flex",
                    flexWrap:
                      "wrap",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  {numericColumns
                    .filter(
                      (
                        column
                      ) =>
                        column !==
                        targetColumn
                    )
                    .map(
                      (
                        column
                      ) => (
                        <label
                          key={
                            column
                          }
                          style={{
                            display:
                              "flex",
                            gap: 6,
                            alignItems:
                              "center",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={featureColumns.includes(
                              column
                            )}
                            onChange={() =>
                              toggleFeature(
                                column
                              )
                            }
                          />

                          {
                            column
                          }
                        </label>
                      )
                    )}
                </div>
              </div>

              <label>
                Target

                <select
                  value={
                    targetColumn
                  }
                  onChange={(
                    event
                  ) => {
                    const nextTarget =
                      event
                        .target
                        .value;

                    setTargetColumn(
                      nextTarget
                    );

                    setFeatureColumns(
                      (
                        previous
                      ) =>
                        previous.filter(
                          (
                            feature
                          ) =>
                            feature !==
                            nextTarget
                        )
                    );
                  }}
                  style={{
                    display:
                      "block",
                    marginTop: 6,
                  }}
                >
                  {columns.map(
                    (
                      column
                    ) => (
                      <option
                        key={
                          column
                        }
                        value={
                          column
                        }
                      >
                        {
                          column
                        }
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          </section>

          <MissingValueAnalyzer
            analyses={
              analyses
            }
            methods={
              methods
            }
            onMethodChange={
              handleMethodChange
            }
          />

          <ScalingAnalyzer
            rows={
              prepared.rows
            }
            featureColumns={
              featureColumns
            }
            enabled={
              scalingEnabled
            }
            onEnabledChange={
              setScalingEnabled
            }
          />

          <section
            style={{
              border:
                "1px solid #334155",
              borderRadius: 16,
              padding: 20,
              background:
                "#0f172a",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              Preprocessing Result
            </h3>

            <p>
              Original rows:{" "}
              <strong>
                {
                  rawRows.length
                }
              </strong>
            </p>

            <p>
              Final usable rows:{" "}
              <strong>
                {
                  prepared
                    .rows
                    .length
                }
              </strong>
            </p>

            <p>
              Imputed values:{" "}
              <strong>
                {
                  prepared
                    .imputedValues
                }
              </strong>
            </p>

            <p>
              Removed rows:{" "}
              <strong>
                {
                  prepared
                    .removedRows
                }
              </strong>
            </p>

            <p>
              Scaling:{" "}
              <strong>
                {scalingEnabled
                  ? "ON"
                  : "OFF"}
              </strong>
            </p>

            <button
              type="button"
              onClick={
                useDataset
              }
            >
              Use Dataset in SVM Lab
            </button>
          </section>
        </>
      )}
    </div>
  );
}