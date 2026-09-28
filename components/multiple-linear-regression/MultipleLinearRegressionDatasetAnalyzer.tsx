import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";

import type {
  MultipleRegressionSuitabilityResult,
  NumericRow,
} from "./types/dataset";

import { analyzeMultipleRegressionSuitability } from "./types/analyzeMultipleRegressionSuitability";

import PreprocessingPanel from "./preprocessing/PreprocessingPanel";

import {
  isMissingValue,
  type RawDatasetRow,
} from "./preprocessing/preprocessingMath";

interface DatasetAnalyzerProps {
  onUseDataset: (
    rows: NumericRow[],
    featureNames: string[],
    targetName: string,
  ) => void;
}

interface ParsedDataset {
  fileName: string;
  headers: string[];
  rows: RawDatasetRow[];
}

const EMPTY_SUITABILITY: MultipleRegressionSuitabilityResult = {
  level: "unsuitable",
  messages: [],
};

export default function MultipleLinearRegressionDatasetAnalyzer({
  onUseDataset,
}: DatasetAnalyzerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Uploaded raw dataset
  |--------------------------------------------------------------------------
  */

  const [dataset, setDataset] =
    useState<ParsedDataset | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Dataset after preprocessing
  |--------------------------------------------------------------------------
  |
  | null means the student has not passed the preprocessing stage yet.
  |
  */

  const [processedRows, setProcessedRows] =
    useState<RawDatasetRow[] | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Regression selections
  |--------------------------------------------------------------------------
  */

  const [selectedFeatures, setSelectedFeatures] =
    useState<string[]>([]);

  const [targetName, setTargetName] =
    useState("");

  const [parseError, setParseError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Detect numerical columns AFTER preprocessing
  |--------------------------------------------------------------------------
  */

  const numericColumns = useMemo(() => {
    if (!processedRows || processedRows.length === 0) {
      return [];
    }

    if (!dataset) {
      return [];
    }

    return dataset.headers.filter((header) => {
      let numericCount = 0;
      let availableCount = 0;

      for (const row of processedRows) {
        const rawValue =
          row[header]?.trim() ?? "";

        if (isMissingValue(rawValue)) {
          continue;
        }

        availableCount++;

        const value = Number(rawValue);

        if (Number.isFinite(value)) {
          numericCount++;
        }
      }

      return (
        availableCount > 0 &&
        numericCount === availableCount
      );
    });
  }, [dataset, processedRows]);

  /*
  |--------------------------------------------------------------------------
  | Convert processed data to NumericRow
  |--------------------------------------------------------------------------
  |
  | Only numerical columns are converted.
  |
  */

  const numericRows = useMemo<NumericRow[]>(() => {
    if (!processedRows) {
      return [];
    }

    return processedRows.map((row) => {
      const numericRow: NumericRow = {};

      for (const column of numericColumns) {
        const rawValue =
          row[column]?.trim() ?? "";

        numericRow[column] =
          isMissingValue(rawValue)
            ? Number.NaN
            : Number(rawValue);
      }

      return numericRow;
    });
  }, [processedRows, numericColumns]);

  /*
  |--------------------------------------------------------------------------
  | Suitability analysis
  |--------------------------------------------------------------------------
  */

  const suitability = useMemo(() => {
    if (
      !processedRows ||
      !targetName ||
      selectedFeatures.length < 2
    ) {
      return EMPTY_SUITABILITY;
    }

    return analyzeMultipleRegressionSuitability(
      numericRows,
      selectedFeatures,
      targetName,
    );
  }, [
    processedRows,
    numericRows,
    selectedFeatures,
    targetName,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CSV upload
  |--------------------------------------------------------------------------
  */

  function handleFile(file: File) {
    setParseError("");

    setDataset(null);
    setProcessedRows(null);

    setSelectedFeatures([]);
    setTargetName("");

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,

      transformHeader: (header) =>
        header.trim(),

      complete: (result) => {
        /*
         * Parsing completely failed.
         */

        if (
          result.errors.length > 0 &&
          result.data.length === 0
        ) {
          setParseError(
            result.errors[0]?.message ??
              "Unable to read this CSV file.",
          );

          return;
        }

        const headers =
          result.meta.fields?.filter(
            (header) =>
              header.trim() !== "",
          ) ?? [];

        if (headers.length === 0) {
          setParseError(
            "No column headers were found in the CSV file.",
          );

          return;
        }

        if (result.data.length === 0) {
          setParseError(
            "The CSV file contains no data rows.",
          );

          return;
        }

        /*
         * Important:
         *
         * We DO NOT reject missing values here.
         *
         * The raw strings are intentionally preserved
         * so ModelMind can analyze them first.
         */

        const cleanedRows: RawDatasetRow[] =
          result.data.map((row) => {
            const cleanedRow: RawDatasetRow = {};

            for (const header of headers) {
              cleanedRow[header] =
                row[header]?.trim() ?? "";
            }

            return cleanedRow;
          });

        setDataset({
          fileName: file.name,
          headers,
          rows: cleanedRows,
        });
      },

      error: (error) => {
        setParseError(error.message);
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Preprocessing completed
  |--------------------------------------------------------------------------
  */

  function handleProcessedDataset(
    rows: RawDatasetRow[],
  ) {
    if (!dataset) {
      return;
    }

    /*
     * Determine which columns are numerical
     * in the processed dataset.
     */

    const availableNumericColumns =
      dataset.headers.filter((header) => {
        let numericCount = 0;
        let availableCount = 0;

        for (const row of rows) {
          const rawValue =
            row[header]?.trim() ?? "";

          if (isMissingValue(rawValue)) {
            continue;
          }

          availableCount++;

          const value = Number(rawValue);

          if (Number.isFinite(value)) {
            numericCount++;
          }
        }

        return (
          availableCount > 0 &&
          numericCount === availableCount
        );
      });

    /*
     * Multiple Linear Regression needs:
     *
     * 2+ X columns
     * 1 Y column
     */

    if (availableNumericColumns.length < 3) {
      setParseError(
        "After preprocessing, Multiple Linear Regression needs at least three numerical columns: at least two input features and one target.",
      );

      return;
    }

    setParseError("");

    setProcessedRows(rows);

    /*
     * Friendly defaults:
     *
     * last numerical column = target
     * first two other numerical columns = X
     */

    const defaultTarget =
      availableNumericColumns[
        availableNumericColumns.length - 1
      ];

    const defaultFeatures =
      availableNumericColumns
        .filter(
          (column) =>
            column !== defaultTarget,
        )
        .slice(0, 2);

    setTargetName(defaultTarget);

    setSelectedFeatures(
      defaultFeatures,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | X feature selection
  |--------------------------------------------------------------------------
  */

  function toggleFeature(
    feature: string,
  ) {
    setSelectedFeatures(
      (current) => {
        if (
          current.includes(feature)
        ) {
          return current.filter(
            (item) =>
              item !== feature,
          );
        }

        return [
          ...current,
          feature,
        ];
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Y target selection
  |--------------------------------------------------------------------------
  */

  function changeTarget(
    nextTarget: string,
  ) {
    setTargetName(nextTarget);

    /*
     * A variable cannot be both X and Y.
     */

    setSelectedFeatures(
      (current) =>
        current.filter(
          (feature) =>
            feature !== nextTarget,
        ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Send final dataset to regression visualizer
  |--------------------------------------------------------------------------
  */

  function useDataset() {
    if (
      !dataset ||
      !processedRows ||
      !targetName ||
      selectedFeatures.length < 2 ||
      suitability.level ===
        "unsuitable"
    ) {
      return;
    }

    onUseDataset(
      numericRows,
      selectedFeatures,
      targetName,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Clear everything
  |--------------------------------------------------------------------------
  */

  function clearDataset() {
    setDataset(null);

    setProcessedRows(null);

    setSelectedFeatures([]);

    setTargetName("");

    setParseError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const canUseDataset =
    dataset !== null &&
    processedRows !== null &&
    selectedFeatures.length >= 2 &&
    targetName !== "" &&
    suitability.level !==
      "unsuitable";

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
            Dataset Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Train with your own CSV
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Upload a dataset. ModelMind first
            checks data quality and missing
            values, then lets you select
            multiple numerical X features and
            one continuous Y target.
          </p>
        </div>

        {dataset && (
          <button
            type="button"
            onClick={clearDataset}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Clear dataset
          </button>
        )}
      </div>

      {/* UPLOAD */}

      {!dataset && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
            ↑
          </div>

          <h3 className="mt-4 font-semibold text-white">
            Upload CSV dataset
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Missing values are allowed.
            ModelMind will inspect them before
            regression training.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (file) {
                handleFile(file);
              }
            }}
          />

          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Choose CSV
          </button>
        </div>
      )}

      {/* ERRORS */}

      {parseError && (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="font-semibold text-red-300">
            Dataset cannot be prepared
          </p>

          <p className="mt-1 text-sm leading-6 text-red-200/80">
            {parseError}
          </p>
        </div>
      )}

      {/* RAW DATASET INFORMATION */}

      {dataset && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DatasetStat
              label="File"
              value={
                dataset.fileName
              }
            />

            <DatasetStat
              label="Rows"
              value={String(
                dataset.rows.length,
              )}
            />

            <DatasetStat
              label="Columns"
              value={String(
                dataset.headers.length,
              )}
            />

            <DatasetStat
              label="Stage"
              value={
                processedRows
                  ? "Ready for regression"
                  : "Preprocessing"
              }
            />
          </div>

          {/* PREPROCESSING GATE */}

          {!processedRows && (
            <PreprocessingPanel
              rows={dataset.rows}
              columns={
                dataset.headers
              }
              onProcessedDataset={
                handleProcessedDataset
              }
            />
          )}

          {/* REGRESSION CONFIGURATION */}

          {processedRows && (
            <>
              <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                  Data Quality Passed
                </p>

                <h3 className="mt-2 text-lg font-bold text-white">
                  Now configure the regression
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Preprocessing is complete.
                  Choose at least two numerical
                  input features and one target.
                </p>
              </section>

              <div className="grid gap-5 xl:grid-cols-2">
                {/* X FEATURES */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Input variables
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-white">
                    Select X features
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Multiple Linear Regression
                    uses two or more numerical
                    input features.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {numericColumns.map(
                      (column) => {
                        const disabled =
                          column ===
                          targetName;

                        const checked =
                          selectedFeatures.includes(
                            column,
                          );

                        return (
                          <label
                            key={
                              column
                            }
                            className={[
                              "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition",

                              checked
                                ? "border-blue-500/50 bg-blue-500/10"
                                : "border-slate-800 bg-slate-950/50",

                              disabled
                                ? "cursor-not-allowed opacity-40"
                                : "hover:border-slate-600",
                            ].join(
                              " ",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={
                                checked
                              }
                              disabled={
                                disabled
                              }
                              onChange={() =>
                                toggleFeature(
                                  column,
                                )
                              }
                              className="h-4 w-4 accent-blue-600"
                            />

                            <span className="truncate text-sm font-medium text-slate-200">
                              {
                                column
                              }
                            </span>
                          </label>
                        );
                      },
                    )}
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Selected:{" "}
                    {
                      selectedFeatures.length
                    }{" "}
                    features
                  </p>
                </div>

                {/* Y TARGET */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Output variable
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-white">
                    Select Y target
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Choose the numerical
                    continuous value the model
                    should predict.
                  </p>

                  <select
                    value={
                      targetName
                    }
                    onChange={(
                      event,
                    ) =>
                      changeTarget(
                        event.target
                          .value,
                      )
                    }
                    className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  >
                    <option value="">
                      Select target
                    </option>

                    {numericColumns.map(
                      (column) => (
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
                      ),
                    )}
                  </select>

                  {targetName && (
                    <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
                        Current equation
                        structure
                      </p>

                      <p className="mt-2 break-words font-mono text-sm leading-6 text-slate-200">
                        {targetName} =
                        b₀
                        {selectedFeatures.map(
                          (
                            feature,
                            index,
                          ) =>
                            ` + b${index + 1}(${feature})`,
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SUITABILITY */}

              <SuitabilityReport
                result={
                  suitability
                }
              />

              {/* PREVIEW */}

              <DatasetPreview
                rows={
                  processedRows
                }
                columns={[
                  ...selectedFeatures,

                  ...(targetName
                    ? [
                        targetName,
                      ]
                    : []),
                ]}
              />

              {/* FINAL BUTTON */}

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    Ready to explore
                    the model?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    ModelMind will train
                    Multiple Linear
                    Regression using the
                    processed dataset and
                    your selected
                    variables.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    !canUseDataset
                  }
                  onClick={
                    useDataset
                  }
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Use This Dataset
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Dataset stat
|--------------------------------------------------------------------------
*/

function DatasetStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className="mt-2 truncate text-sm font-semibold text-slate-100"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Suitability report
|--------------------------------------------------------------------------
*/

function SuitabilityReport({
  result,
}: {
  result: MultipleRegressionSuitabilityResult;
}) {
  if (
    result.messages.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="font-semibold text-slate-300">
          Select at least two X
          features and one Y target
          to analyze the dataset.
        </p>
      </div>
    );
  }

  const styles =
    result.level === "suitable"
      ? {
          container:
            "border-emerald-500/30 bg-emerald-500/10",

          badge:
            "bg-emerald-500/15 text-emerald-300",

          title:
            "Dataset looks suitable",
        }
      : result.level ===
          "warning"
        ? {
            container:
              "border-amber-500/30 bg-amber-500/10",

            badge:
              "bg-amber-500/15 text-amber-300",

            title:
              "Dataset can be used with warnings",
          }
        : {
            container:
              "border-red-500/30 bg-red-500/10",

            badge:
              "bg-red-500/15 text-red-300",

            title:
              "Dataset is not suitable yet",
          };

  return (
    <div
      className={`rounded-2xl border p-5 ${styles.container}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${styles.badge}`}
        >
          {result.level}
        </span>

        <h3 className="font-bold text-white">
          {styles.title}
        </h3>
      </div>

      <div className="mt-4 space-y-2">
        {result.messages.map(
          (message, index) => (
            <div
              key={`${message.message}-${index}`}
              className="flex gap-3 rounded-xl bg-slate-950/30 p-3"
            >
              <span className="mt-0.5">
                {message.type ===
                "error"
                  ? "✕"
                  : message.type ===
                      "warning"
                    ? "!"
                    : "✓"}
              </span>

              <p className="text-sm leading-6 text-slate-200">
                {
                  message.message
                }
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Dataset preview
|--------------------------------------------------------------------------
*/

function DatasetPreview({
  rows,
  columns,
}: {
  rows: RawDatasetRow[];
  columns: string[];
}) {
  const uniqueColumns = [
    ...new Set(columns),
  ];

  if (
    uniqueColumns.length === 0
  ) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 p-5">
        <h3 className="font-bold text-white">
          Processed dataset preview
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Showing the first five
          rows for the currently
          selected variables.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/70">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-500">
                #
              </th>

              {uniqueColumns.map(
                (column) => (
                  <th
                    key={
                      column
                    }
                    className="whitespace-nowrap px-4 py-3 font-semibold text-slate-300"
                  >
                    {
                      column
                    }
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {rows
              .slice(0, 5)
              .map(
                (
                  row,
                  rowIndex,
                ) => (
                  <tr
                    key={
                      rowIndex
                    }
                    className="border-t border-slate-800/80"
                  >
                    <td className="px-4 py-3 text-slate-600">
                      {rowIndex +
                        1}
                    </td>

                    {uniqueColumns.map(
                      (
                        column,
                      ) => (
                        <td
                          key={
                            column
                          }
                          className="whitespace-nowrap px-4 py-3 text-slate-300"
                        >
                          {isMissingValue(
                            row[
                              column
                            ],
                          )
                            ? "—"
                            : row[
                                column
                              ]}
                        </td>
                      ),
                    )}
                  </tr>
                ),
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}