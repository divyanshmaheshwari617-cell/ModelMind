
"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";

import {
  ensembleDatasets,
  type EnsembleTask,
} from "@/lib/datasets/ensembleDatasets";

export type MissingValueStrategy =
  | "mean"
  | "median"
  | "most_frequent"
  | "drop";

export interface UploadedEnsembleDataset {
  id: string;
  name: string;
  columns: string[];
  numericColumns: string[];
  rows: Record<string, string | number | null>[];
  rowCount: number;
}

export interface EnsembleDatasetSelection {
  datasetId: string;
  uploadedDataset: UploadedEnsembleDataset | null;
  task: EnsembleTask;
  features: string[];
  target: string;
  missingStrategy: MissingValueStrategy;
}

interface Props {
  value: EnsembleDatasetSelection;
  onChange: (selection: EnsembleDatasetSelection) => void;
}

type DataRow = Record<string, string | number | null>;

const fieldClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500";

const subPanelClass =
  "rounded-xl border border-slate-800 bg-slate-950/75 p-4";

export const initialEnsembleDatasetSelection:
  EnsembleDatasetSelection = {
    datasetId: "moons",
    uploadedDataset: null,
    task: "classification",
    features: ["x1", "x2"],
    target: "target",
    missingStrategy: "median",
  };

function parseCSV(text: string): string[][] {
  const content = text.replace(/^\uFEFF/, "");
  const records: string[][] = [];

  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if (
      !inQuotes &&
      (char === "\n" || char === "\r")
    ) {
      if (char === "\r" && content[i + 1] === "\n") {
        i++;
      }

      currentRow.push(currentCell.trim());
      currentCell = "";

      if (currentRow.some((cell) => cell !== "")) {
        records.push(currentRow);
      }

      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (inQuotes) {
    throw new Error(
      "Invalid CSV: an opening quotation mark was not closed.",
    );
  }

  currentRow.push(currentCell.trim());

  if (currentRow.some((cell) => cell !== "")) {
    records.push(currentRow);
  }

  return records;
}

function isMissing(value: string): boolean {
  return ["", "na", "n/a", "null", "none", "nan", "?"]
    .includes(value.trim().toLowerCase());
}

function parseUploadedDataset(
  content: string,
  filename: string,
): UploadedEnsembleDataset {
  const records = parseCSV(content);

  if (records.length < 3) {
    throw new Error(
      "Upload a CSV with column headers and at least two rows.",
    );
  }

  const columns = records[0].map(
    (value, index) =>
      value.trim() || `column_${index + 1}`,
  );

  if (new Set(columns).size !== columns.length) {
    throw new Error(
      "CSV column names must be unique.",
    );
  }

  const rawRows = records.slice(1);

  for (const [index, row] of rawRows.entries()) {
    if (row.length !== columns.length) {
      throw new Error(
        `CSV row ${index + 2} contains ${row.length} columns; expected ${columns.length}.`,
      );
    }
  }

  const numericColumns = columns.filter((_, index) =>
    rawRows.every((row) => {
      const raw = row[index];
      return (
        isMissing(raw) ||
        (raw.trim().length > 0 &&
          Number.isFinite(Number(raw)))
      );
    }),
  );

  const numericSet = new Set(numericColumns);

  const rows: DataRow[] = rawRows.map((rawRow) => {
    const row: DataRow = {};

    columns.forEach((column, index) => {
      const raw = rawRow[index];

      if (isMissing(raw)) {
        row[column] = null;
      } else if (numericSet.has(column)) {
        row[column] = Number(raw);
      } else {
        row[column] = raw;
      }
    });

    return row;
  });

  if (numericColumns.length < 2) {
    throw new Error(
      "The CSV needs at least two numeric columns: an input feature and a target.",
    );
  }

  return {
    id: `upload-${Date.now()}`,
    name: filename,
    columns,
    numericColumns,
    rows,
    rowCount: rows.length,
  };
}

function formatCell(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "Missing";
  }

  if (typeof value === "number") {
    return Number(value.toPrecision(6)).toString();
  }

  return value;
}

export default function EnsembleDatasetManager({
  value,
  onChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewLimit, setPreviewLimit] = useState(8);

  const builtinDatasets = useMemo(
    () =>
      ensembleDatasets.filter(
        (dataset) => dataset.task === value.task,
      ),
    [value.task],
  );

  const selectedBuiltin =
    ensembleDatasets.find(
      (dataset) => dataset.id === value.datasetId,
    ) ?? ensembleDatasets[0];

  const uploaded = value.uploadedDataset;

  const datasetName =
    uploaded?.name ?? selectedBuiltin.name;

  const columns = uploaded
    ? uploaded.columns
    : [...selectedBuiltin.features, selectedBuiltin.target];

  const numericColumns = uploaded
    ? uploaded.numericColumns
    : columns;

  const rows: DataRow[] =
    uploaded?.rows ?? selectedBuiltin.rows;

  const availableFeatures = numericColumns.filter(
    (column) => column !== value.target,
  );

  const selectedFeatures = value.features.filter(
    (feature) => availableFeatures.includes(feature),
  );

  const missingCounts = useMemo(
    () =>
      numericColumns.map((column) => {
        const values = rows
          .map((row) => row[column])
          .filter(
            (item): item is number =>
              typeof item === "number" &&
              Number.isFinite(item),
          );

        const total = values.reduce(
          (sum, item) => sum + item,
          0,
        );

        return {
          column,
          missing: rows.length - values.length,
          mean:
            values.length > 0
              ? total / values.length
              : null,
        };
      }),
    [numericColumns, rows],
  );

  function chooseBuiltin(datasetId: string) {
    const dataset = ensembleDatasets.find(
      (item) => item.id === datasetId,
    );

    if (!dataset) return;

    onChange({
      datasetId: dataset.id,
      uploadedDataset: null,
      task: dataset.task,
      features: [...dataset.features],
      target: dataset.target,
      missingStrategy: value.missingStrategy,
    });

    setError("");
    setPreviewLimit(8);
  }

  function chooseTask(task: EnsembleTask) {
    const dataset = ensembleDatasets.find(
      (item) => item.task === task,
    );

    if (!dataset) return;

    onChange({
      datasetId: dataset.id,
      uploadedDataset: null,
      task,
      features: [...dataset.features],
      target: dataset.target,
      missingStrategy: value.missingStrategy,
    });

    setError("");
    setPreviewLimit(8);
  }

  async function handleUpload(file: File) {
    setError("");
    setIsUploading(true);

    try {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("Please choose a .csv file.");
      }

      if (file.size > 15 * 1024 * 1024) {
        throw new Error(
          "Maximum supported CSV size is 15 MB.",
        );
      }

      const content = await file.text();

      const parsed = parseUploadedDataset(
        content,
        file.name,
      );

      const target =
        parsed.numericColumns[
          parsed.numericColumns.length - 1
        ];

      const features = parsed.numericColumns
        .filter((column) => column !== target)
        .slice(0, 8);

      onChange({
        ...value,
        uploadedDataset: parsed,
        features,
        target,
      });

      setPreviewLimit(8);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The CSV could not be read.",
      );
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function resetDataset() {
    const dataset =
      builtinDatasets.find(
        (item) => item.id === value.datasetId,
      ) ??
      builtinDatasets[0] ??
      ensembleDatasets[0];

    chooseBuiltin(dataset.id);
  }

  function changeTarget(target: string) {
    let features = selectedFeatures.filter(
      (feature) => feature !== target,
    );

    if (features.length === 0) {
      features = numericColumns
        .filter((column) => column !== target)
        .slice(0, 2);
    }

    onChange({
      ...value,
      target,
      features,
    });
  }

  function toggleFeature(feature: string) {
    if (selectedFeatures.includes(feature)) {
      onChange({
        ...value,
        features: selectedFeatures.filter(
          (item) => item !== feature,
        ),
      });

      return;
    }

    if (selectedFeatures.length >= 8) {
      return;
    }

    onChange({
      ...value,
      features: [...selectedFeatures, feature],
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Database
          size={19}
          className="text-sky-400"
        />

        <h2 className="font-semibold text-white">
          Dataset Studio
        </h2>
      </div>

      <div>
        <label
          htmlFor="ensemble-task"
          className="mb-2 block text-sm text-slate-300"
        >
          Machine Learning Task
        </label>

        <select
          id="ensemble-task"
          value={value.task}
          onChange={(event) =>
            chooseTask(
              event.target.value as EnsembleTask,
            )
          }
          className={fieldClass}
        >
          <option value="classification">
            Classification
          </option>

          <option value="regression">
            Regression
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="ensemble-dataset"
          className="mb-2 block text-sm text-slate-300"
        >
          Built-in Dataset
        </label>

        <select
          id="ensemble-dataset"
          value={
            builtinDatasets.some(
              (dataset) =>
                dataset.id === value.datasetId,
            )
              ? value.datasetId
              : builtinDatasets[0]?.id ?? ""
          }
          onChange={(event) =>
            chooseBuiltin(event.target.value)
          }
          className={fieldClass}
        >
          {builtinDatasets.map((dataset) => (
            <option
              key={dataset.id}
              value={dataset.id}
            >
              {dataset.name}
            </option>
          ))}
        </select>

        {!uploaded && (
          <p className="mt-3 text-xs leading-6 text-slate-400">
            {selectedBuiltin.description}
          </p>
        )}
      </div>

      <section className={subPanelClass}>
        <div className="flex items-center gap-2">
          <FileSpreadsheet
            size={17}
            className="text-violet-400"
          />

          <h3 className="text-sm font-semibold text-white">
            Upload CSV
          </h3>
        </div>

        <p className="mt-2 text-xs leading-6 text-slate-400">
          Upload your dataset and choose the input
          features and target. Numeric columns are
          detected automatically.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void handleUpload(file);
            }
          }}
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-500/50 bg-violet-500/10 px-4 py-4 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50"
        >
          <Upload size={17} />

          {isUploading
            ? "Reading CSV..."
            : "Choose CSV File"}
        </button>

        {uploaded && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 size={15} />
                CSV loaded
              </p>

              <p className="mt-2 break-all text-xs text-slate-300">
                {uploaded.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {uploaded.rowCount} rows ·{" "}
                {uploaded.numericColumns.length} numeric columns
              </p>
            </div>

            <button
              type="button"
              title="Remove uploaded CSV"
              onClick={resetDataset}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 text-xs leading-6 text-rose-400"
          >
            <AlertTriangle
              size={15}
              className="mt-1 shrink-0"
            />

            {error}
          </p>
        )}
      </section>

      <section className={subPanelClass}>
        <h3 className="text-sm font-semibold text-white">
          Features and Target
        </h3>

        <label className="mt-4 block text-xs text-slate-400">
          Target Column
        </label>

        <select
          value={value.target}
          onChange={(event) =>
            changeTarget(event.target.value)
          }
          className={`mt-2 ${fieldClass}`}
        >
          {numericColumns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>

        <p className="mt-5 text-xs font-semibold text-slate-300">
          Input Features
        </p>

        <div className="mt-3 space-y-3">
          {availableFeatures.map((feature) => (
            <label
              key={feature}
              className="flex items-center gap-3 text-sm text-slate-300"
            >
              <input
                type="checkbox"
                checked={selectedFeatures.includes(
                  feature,
                )}
                disabled={
                  !selectedFeatures.includes(feature) &&
                  selectedFeatures.length >= 8
                }
                onChange={() =>
                  toggleFeature(feature)
                }
                className="accent-violet-500"
              />

              <span className="break-all">
                {feature}
              </span>
            </label>
          ))}
        </div>

        <p className="mt-4 text-xs text-violet-300">
          {selectedFeatures.length} feature(s) selected
        </p>

        {selectedFeatures.length === 0 && (
          <p className="mt-2 text-xs text-amber-300">
            Select at least one input feature.
          </p>
        )}
      </section>

      <section className={subPanelClass}>
        <h3 className="text-sm font-semibold text-white">
          Missing Values
        </h3>

        <select
          value={value.missingStrategy}
          onChange={(event) =>
            onChange({
              ...value,
              missingStrategy: event.target
                .value as MissingValueStrategy,
            })
          }
          className={`mt-3 ${fieldClass}`}
        >
          <option value="median">
            Median Imputation
          </option>

          <option value="mean">
            Mean Imputation
          </option>

          <option value="most_frequent">
            Most Frequent Imputation
          </option>

          <option value="drop">
            Drop Incomplete Rows
          </option>
        </select>

        <p className="mt-3 text-xs leading-6 text-slate-400">
          Imputation will be fitted using the training
          split only when model training is connected.
        </p>
      </section>

      <section className={subPanelClass}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">
            Dataset Summary
          </h3>

          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            {rows.length} rows
          </span>
        </div>

        <p className="mt-3 break-words text-sm font-semibold text-white">
          {datasetName}
        </p>

        <p className="mt-3 text-xs text-slate-400">
          Task: {value.task}
        </p>

        <p className="mt-1 break-words text-xs text-slate-400">
          Features:{" "}
          {selectedFeatures.join(", ") || "None"}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Target: {value.target}
        </p>

        <button
          type="button"
          onClick={resetDataset}
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-800"
        >
          <RotateCcw size={14} />
          Reset Dataset
        </button>
      </section>

      <section className={subPanelClass}>
        <h3 className="text-sm font-semibold text-white">
          Data Preview
        </h3>

        <p className="mt-2 text-xs text-slate-400">
          Displaying {Math.min(previewLimit, rows.length)}
          {" "}of {rows.length} rows.
        </p>

        <div className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-slate-800">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-slate-900 text-slate-400">
              <tr>
                <th className="border-b border-slate-800 px-3 py-3">
                  #
                </th>

                {columns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap border-b border-slate-800 px-3 py-3"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.slice(0, previewLimit).map(
                (row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-800/60"
                  >
                    <td className="px-3 py-2 text-slate-500">
                      {index + 1}
                    </td>

                    {columns.map((column) => (
                      <td
                        key={column}
                        className="whitespace-nowrap px-3 py-2 text-slate-300"
                      >
                        {formatCell(row[column])}
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {previewLimit < rows.length && (
          <button
            type="button"
            onClick={() =>
              setPreviewLimit((current) =>
                Math.min(current + 12, rows.length),
              )
            }
            className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:border-violet-500"
          >
            Show More Rows
          </button>
        )}
      </section>

      <section className={subPanelClass}>
        <h3 className="text-sm font-semibold text-white">
          Numeric Column Statistics
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3">Column</th>
                <th className="pb-3">Missing</th>
                <th className="pb-3">Mean</th>
              </tr>
            </thead>

            <tbody>
              {missingCounts.map((item) => (
                <tr
                  key={item.column}
                  className="border-t border-slate-800"
                >
                  <td className="py-3 pr-3 text-slate-200">
                    {item.column}
                  </td>

                  <td className="py-3 pr-3 text-slate-400">
                    {item.missing}
                  </td>

                  <td className="py-3 text-slate-300">
                    {item.mean === null
                      ? "—"
                      : formatCell(item.mean)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
