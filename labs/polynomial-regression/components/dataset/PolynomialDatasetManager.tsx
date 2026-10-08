
"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";

import {
  polynomialDatasets,
  type PolynomialDataPoint,
} from "@/lib/datasets/polynomialDatasets";

import type {
  ColumnImputation,
  ImputationMethod,
  PreprocessingConfig,
} from "@/lib/api/polynomialApi";

export interface UploadedDataset {
  name: string;
  rows: Record<string, unknown>[];
  numericColumns: string[];
  categoricalColumns: string[];
  missingCounts: Record<string, number>;
  preprocessing?: PreprocessingConfig;
}

interface Props {
  datasetId: string;
  onDatasetChange: (id: string) => void;
  onUpload: (dataset: UploadedDataset) => void;
  uploadedDataset: UploadedDataset | null;
  selectedFeature: string;
  selectedTarget: string;
  onFeatureChange: (feature: string) => void;
  onTargetChange: (target: string) => void;
  onClearUpload: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ROWS = 10000;

const MISSING_MARKERS = new Set([
  "",
  "na",
  "n/a",
  "null",
  "nan",
  "none",
  "?",
]);

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === "number") {
    return !Number.isFinite(value);
  }

  return (
    typeof value === "string" &&
    MISSING_MARKERS.has(value.trim().toLowerCase())
  );
}

function analyzeColumns(rows: Record<string, unknown>[]) {
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const missingCounts: Record<string, number> = {};

  for (const column of Object.keys(rows[0] ?? {})) {
    const observed = rows
      .map((row) => row[column])
      .filter((value) => !isMissing(value));

    missingCounts[column] = rows.length - observed.length;

    const numeric =
      observed.length > 0 &&
      observed.every(
        (value) =>
          String(value).trim() !== "" &&
          Number.isFinite(Number(value))
      );

    if (numeric) {
      numericColumns.push(column);
    } else {
      categoricalColumns.push(column);
    }
  }

  return {
    numericColumns,
    categoricalColumns,
    missingCounts,
  };
}

export function getUploadedPoints(
  dataset: UploadedDataset,
  feature: string,
  target: string
): PolynomialDataPoint[] {
  if (!feature || !target || feature === target) {
    return [];
  }

  return dataset.rows.flatMap((row) => {
    const rawX = row[feature];
    const rawY = row[target];

    if (isMissing(rawX) || isMissing(rawY)) {
      return [];
    }

    const x = Number(rawX);
    const y = Number(rawY);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return [];
    }

    return [{ x, y }];
  });
}

function initialStrategies(
  dataset: UploadedDataset
): Record<string, ColumnImputation> {
  const result: Record<string, ColumnImputation> = {};

  for (const [column, count] of Object.entries(
    dataset.missingCounts
  )) {
    if (count > 0) {
      result[column] = {
        method: "median",
        fill_value: null,
      };
    }
  }

  return result;
}

export default function PolynomialDatasetManager({
  datasetId,
  onDatasetChange,
  onUpload,
  uploadedDataset,
  selectedFeature,
  selectedTarget,
  onFeatureChange,
  onTargetChange,
  onClearUpload,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingDataset, setPendingDataset] =
    useState<UploadedDataset | null>(null);

  const [strategies, setStrategies] = useState<
    Record<string, ColumnImputation>
  >({});

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFile(file: File) {
    setError(null);
    setSuccess(null);
    setPendingDataset(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Maximum supported file size is 10 MB.");
      return;
    }

    setLoading(true);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      worker: false,

      complete: (result) => {
        setLoading(false);

        if (result.errors.length > 0) {
          setError(
            `CSV parsing failed: ${result.errors[0].message}`
          );
          return;
        }

        const rows = result.data;
        const columns = result.meta.fields ?? [];

        if (rows.length < 3 || rows.length > MAX_ROWS) {
          setError(
            "CSV must contain between 3 and 10,000 rows."
          );
          return;
        }

        if (columns.length < 2) {
          setError("At least two columns are required.");
          return;
        }

        if (
          columns.some((column) => !column.trim()) ||
          new Set(columns).size !== columns.length
        ) {
          setError(
            "Column headers must be nonempty and unique."
          );
          return;
        }

        const info = analyzeColumns(rows);

        if (info.numericColumns.length < 2) {
          setError(
            "At least two numeric columns are required for regression. " +
              "Categorical encoding is not yet supported."
          );
          return;
        }

        const dataset: UploadedDataset = {
          name: file.name,
          rows,
          ...info,
        };

        const totalMissing = Object.values(
          info.missingCounts
        ).reduce((sum, count) => sum + count, 0);

        if (totalMissing === 0) {
          onUpload(dataset);
          setSuccess("Dataset uploaded successfully.");
          return;
        }

        setStrategies(initialStrategies(dataset));
        setPendingDataset(dataset);
      },

      error: (parseError) => {
        setLoading(false);
        setError(parseError.message);
      },
    });
  }

  function updateStrategy(
    column: string,
    method: ImputationMethod
  ) {
    setStrategies((previous) => ({
      ...previous,
      [column]: {
        method,
        fill_value:
          method === "constant"
            ? previous[column]?.fill_value ?? null
            : null,
      },
    }));
  }

  function applyMissingValues() {
    if (!pendingDataset) return;

    setError(null);

    const featureStrategies: Record<
      string,
      ColumnImputation
    > = {};

    for (const [column, count] of Object.entries(
      pendingDataset.missingCounts
    )) {
      if (count === 0) continue;

      const strategy = strategies[column];

      if (!strategy) {
        setError(`Select a strategy for ${column}.`);
        return;
      }

      if (
        strategy.method === "constant" &&
        (strategy.fill_value === null ||
          strategy.fill_value === undefined ||
          !Number.isFinite(strategy.fill_value))
      ) {
        setError(
          `${column}: enter a valid numeric constant.`
        );
        return;
      }

      featureStrategies[column] = strategy;
    }

    const preprocessing: PreprocessingConfig = {
      feature_strategies: featureStrategies,
      default_strategy: "median",
    };

    // IMPORTANT:
    // Keep original CSV rows unchanged.
    // The backend handles imputation after train/test split.
    onUpload({
      ...pendingDataset,
      preprocessing,
    });

    const totalMissing = Object.values(
      pendingDataset.missingCounts
    ).reduce((sum, count) => sum + count, 0);

    setPendingDataset(null);
    setSuccess(
      `${totalMissing} missing cells reviewed. ` +
        "Strategies saved. Python will apply feature " +
        "imputation during training."
    );
  }

  const displayedDataset =
    uploadedDataset ?? pendingDataset;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Database size={19} className="text-sky-400" />
        <h2 className="font-semibold text-white">
          Dataset Studio
        </h2>
      </div>

      {!displayedDataset && (
        <>
          <div>
            <label
              htmlFor="dataset"
              className="mb-2 block text-sm text-slate-400"
            >
              Built-in dataset
            </label>

            <select
              id="dataset"
              value={datasetId}
              onChange={(event) =>
                onDatasetChange(event.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
            >
              {polynomialDatasets.map((dataset) => (
                <option
                  key={dataset.id}
                  value={dataset.id}
                >
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-5 text-center">
            <Upload
              size={25}
              className="mx-auto text-violet-400"
            />

            <p className="mt-3 text-sm font-medium">
              Upload your own dataset
            </p>

            <p className="mt-2 text-xs text-slate-400">
              CSV · Maximum 10 MB · 10,000 rows
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) handleFile(file);

                event.target.value = "";
              }}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Choose CSV"}
            </button>
          </div>
        </>
      )}

      {pendingDataset && (
        <div className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={20}
              className="shrink-0 text-amber-400"
            />

            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                Missing Values Detected
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Choose how each column should be
                handled. Python will calculate replacement
                values from training data only.
              </p>
            </div>
          </div>

          {Object.entries(
            pendingDataset.missingCounts
          )
            .filter(([, count]) => count > 0)
            .map(([column, count]) => {
              const numeric =
                pendingDataset.numericColumns.includes(
                  column
                );

              const strategy = strategies[column];

              return (
                <div
                  key={column}
                  className="rounded-xl border border-slate-700 bg-slate-950 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="break-all text-sm font-medium">
                      {column}
                    </span>

                    <span className="shrink-0 text-xs text-amber-300">
                      {count} missing
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {numeric
                      ? "Numeric column"
                      : "Categorical / unsupported column"}
                  </p>

                  <select
                    aria-label={`Missing value strategy for ${column}`}
                    value={strategy?.method ?? "median"}
                    onChange={(event) =>
                      updateStrategy(
                        column,
                        event.target
                          .value as ImputationMethod
                      )
                    }
                    className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm"
                  >
                    {numeric && (
                      <>
                        <option value="mean">
                          Mean (average)
                        </option>

                        <option value="median">
                          Median (middle value)
                        </option>

                        <option value="most_frequent">
                          Mode (most frequent)
                        </option>

                        <option value="constant">
                          Fill with a constant
                        </option>
                      </>
                    )}

                    <option value="drop">
                      Drop incomplete rows
                    </option>
                  </select>

                  {strategy?.method === "constant" && (
                    <input
                      aria-label={`Constant value for ${column}`}
                      type="number"
                      value={
                        strategy.fill_value ?? ""
                      }
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        setStrategies((previous) => ({
                          ...previous,
                          [column]: {
                            method: "constant",
                            fill_value:
                              value.trim() === ""
                                ? null
                                : Number(value),
                          },
                        }));
                      }}
                      placeholder="Enter numeric replacement"
                      className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm"
                    />
                  )}
                </div>
              );
            })}

          <p className="text-xs leading-5 text-amber-200/80">
            Missing target values are dropped during
            supervised training. Numeric feature values
            are handled using the selected strategies.
            Forward and backward fill require a separate
            ordered-data workflow and are not supported
            in this version.
          </p>

          <button
            type="button"
            onClick={applyMissingValues}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Apply Missing-Value Strategies
          </button>

          <button
            type="button"
            onClick={() => {
              setPendingDataset(null);
              setStrategies({});
              setError(null);
            }}
            className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
          >
            Cancel upload
          </button>
        </div>
      )}

      {uploadedDataset && (
        <>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <FileSpreadsheet
                  size={22}
                  className="text-emerald-400"
                />

                <p className="mt-2 break-all text-sm font-semibold">
                  {uploadedDataset.name}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {uploadedDataset.rows.length} rows ·{" "}
                  {uploadedDataset.numericColumns.length}{" "}
                  numeric columns
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClearUpload();
                  setSuccess(null);
                  setError(null);
                }}
                aria-label="Remove uploaded dataset"
                className="rounded-lg p-2 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="feature"
                className="mb-2 block text-sm text-slate-400"
              >
                Input feature (X)
              </label>

              <select
                id="feature"
                value={selectedFeature}
                onChange={(event) =>
                  onFeatureChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
              >
                {uploadedDataset.numericColumns
                  .filter(
                    (column) =>
                      column !== selectedTarget
                  )
                  .map((column) => (
                    <option
                      key={column}
                      value={column}
                    >
                      {column}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="target"
                className="mb-2 block text-sm text-slate-400"
              >
                Target variable (Y)
              </label>

              <select
                id="target"
                value={selectedTarget}
                onChange={(event) =>
                  onTargetChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
              >
                {uploadedDataset.numericColumns
                  .filter(
                    (column) =>
                      column !== selectedFeature
                  )
                  .map((column) => (
                    <option
                      key={column}
                      value={column}
                    >
                      {column}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Column information
            </p>

            <div className="max-h-44 space-y-2 overflow-y-auto">
              {Object.keys(
                uploadedDataset.rows[0] ?? {}
              ).map((column) => (
                <div
                  key={column}
                  className="flex justify-between gap-2 text-xs"
                >
                  <span className="truncate text-slate-300">
                    {column}
                  </span>

                  <span className="shrink-0 text-slate-500">
                    {uploadedDataset.missingCounts[column]}{" "}
                    originally missing
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  {Object.keys(
                    uploadedDataset.rows[0] ?? {}
                  )
                    .slice(0, 4)
                    .map((column) => (
                      <th
                        key={column}
                        className="p-2"
                      >
                        {column}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {uploadedDataset.rows
                  .slice(0, 5)
                  .map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-800"
                    >
                      {Object.keys(
                        uploadedDataset.rows[0] ?? {}
                      )
                        .slice(0, 4)
                        .map((column) => (
                          <td
                            key={column}
                            className="p-2 text-slate-300"
                          >
                            {isMissing(row[column])
                              ? "—"
                              : String(row[column])}
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {uploadedDataset.preprocessing && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
              <p className="text-xs font-medium text-sky-300">
                Preprocessing configured
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Missing feature values will be processed
                by the Python backend during training.
              </p>
            </div>
          )}
        </>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-300"
        >
          <CheckCircle2
            size={17}
            className="shrink-0"
          />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-300"
        >
          <AlertTriangle
            size={17}
            className="shrink-0"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
