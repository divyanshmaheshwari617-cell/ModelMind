
"use client";

import { useMemo, useState } from "react";
import {
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  Search,
} from "lucide-react";

type DataRow = Record<string, string | number | null>;

type PredictionSet = {
  actual: (number | null)[];
  predicted: (number | null)[];
};

type Result = {
  task: "classification" | "regression";
  dataset: {
    class_labels: string[] | null;
    features: string[];
    target: string;
    valid_rows: number;
    train_rows: number;
    test_rows: number;
  };
  models: Record<
    string,
    {
      name: string;
      metrics: {
        train: Record<string, unknown>;
        test: Record<string, unknown>;
      };
      predictions: PredictionSet;
    }
  >;
};

type Props = {
  rows: DataRow[];
  result: Result | null;
};

function csvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  // Prevent spreadsheet formula injection on export.
  const protectedText =
    /^[\s]*[=+\-@\t\r]/.test(text) &&
    typeof value === "string"
      ? "'" + text
      : text;

  return `"${protectedText.replace(/"/g, '""')}"`;
}

function toCSV(
  headers: string[],
  rows: unknown[][],
): string {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) =>
      row.map(csvCell).join(","),
    ),
  ].join("\r\n");
}

function downloadFile(
  filename: string,
  content: string,
  mime: string,
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  const text = String(value);
  return text.length > 60
    ? `${text.slice(0, 57)}...`
    : text || "—";
}

function missing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    String(value).trim().toLowerCase() === "nan"
  );
}

export default function VotingStackingDataStudio({
  rows,
  result,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const columns = useMemo(
    () => (rows.length ? Object.keys(rows[0]) : []),
    [rows],
  );

  const previewRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) =>
      columns.some((column) =>
        String(row[column] ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [rows, search, columns]);

  const pageSize = 10;
  const pageCount = Math.max(
    1,
    Math.ceil(previewRows.length / pageSize),
  );
  const currentPage = Math.min(page, pageCount - 1);

  const visibleRows = previewRows.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const columnSummary = useMemo(
    () =>
      columns.map((name) => {
        const values = rows.map((row) => row[name]);
        const usable = values.filter(
          (value) => !missing(value),
        );

        const numeric =
          usable.length > 0 &&
          usable.every((value) =>
            Number.isFinite(Number(value)),
          );

        return {
          name,
          type: numeric ? "Numeric" : "Text / mixed",
          missingCount:
            values.length - usable.length,
          uniqueCount: new Set(
            usable.map(String),
          ).size,
        };
      }),
    [rows, columns],
  );

  function exportPredictions() {
    if (!result) return;

    const names = Object.keys(result.models);

    const count = Math.max(
      0,
      ...names.map(
        (name) =>
          result.models[name].predictions.predicted.length,
      ),
    );

    const actualValues =
      result.models[names[0]]?.predictions.actual ?? [];

    const headers = [
      "test_sample_index",
      "actual",
      ...names.map((name) => `${name}_prediction`),
    ];

    const data = Array.from(
      { length: count },
      (_, index) => {
        const actual = actualValues[index];

        const decode = (value: number | null | undefined) => {
          if (value == null) return "";

          if (
            result.task === "classification" &&
            result.dataset.class_labels
          ) {
            return (
              result.dataset.class_labels[value] ??
              String(value)
            );
          }

          return value;
        };

        return [
          index + 1,
          decode(actual),
          ...names.map((name) =>
            decode(
              result.models[name].predictions
                .predicted[index],
            ),
          ),
        ];
      },
    );

    downloadFile(
      "voting_stacking_predictions.csv",
      toCSV(headers, data),
      "text/csv;charset=utf-8",
    );
  }

  function exportMetrics() {
    if (!result) return;

    const records = Object.entries(result.models).flatMap(
      ([name, model]) =>
        (["train", "test"] as const).map(
          (split) => ({
            model: name,
            split,
            metrics: model.metrics[split],
          }),
        ),
    );

    const keys = Array.from(
      new Set(
        records.flatMap((record) =>
          Object.keys(record.metrics),
        ),
      ),
    );

    const headers = ["model", "split", ...keys];

    const data = records.map((record) => [
      record.model,
      record.split,
      ...keys.map((key) => {
        const value = record.metrics[key];

        return Array.isArray(value)
          ? JSON.stringify(value)
          : value ?? "";
      }),
    ]);

    downloadFile(
      "voting_stacking_metrics.csv",
      toCSV(headers, data),
      "text/csv;charset=utf-8",
    );
  }

  function exportJSON() {
    if (!result) return;

    downloadFile(
      "voting_stacking_results.json",
      JSON.stringify(result, null, 2),
      "application/json",
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-7">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <Database size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Data Analysis
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Dataset & Results Studio
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Explore the loaded dataset, examine missing
          values, and export results from real trained
          Voting and Stacking models.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Dataset rows", rows.length],
          ["Dataset columns", columns.length],
          [
            "Missing cells",
            columnSummary.reduce(
              (sum, item) => sum + item.missingCount,
              0,
            ),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <p className="text-xs text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-300">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0b1426] p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Search size={19} className="text-sky-300" />
          Dataset Preview
        </h3>

        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search loaded rows..."
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-violet-500"
        />

        <div className="mt-5 max-h-[430px] overflow-auto">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead className="sticky top-0 bg-[#172139] text-slate-200">
              <tr>
                <th className="p-3">#</th>
                {columns.map((name) => (
                  <th key={name} className="p-3">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row, index) => (
                <tr
                  key={`${currentPage}-${index}`}
                  className="border-t border-slate-800"
                >
                  <td className="p-3 text-slate-500">
                    {currentPage * pageSize + index + 1}
                  </td>

                  {columns.map((name) => (
                    <td
                      key={name}
                      className="max-w-48 break-words p-3 text-slate-300"
                    >
                      {formatValue(row[name])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {visibleRows.length === 0 && (
            <p className="p-5 text-sm text-slate-400">
              No matching observations.
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Page {currentPage + 1} of {pageCount}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() =>
                setPage((value) => Math.max(0, value - 1))
              }
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={currentPage >= pageCount - 1}
              onClick={() =>
                setPage((value) =>
                  Math.min(pageCount - 1, value + 1),
                )
              }
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0b1426] p-5">
        <h3 className="text-lg font-bold">
          Column Summary
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="p-3">Column</th>
                <th className="p-3">Detected type</th>
                <th className="p-3">Missing</th>
                <th className="p-3">Unique</th>
              </tr>
            </thead>

            <tbody>
              {columnSummary.map((item) => (
                <tr
                  key={item.name}
                  className="border-t border-slate-800"
                >
                  <td className="break-all p-3">
                    {item.name}
                  </td>
                  <td className="p-3 text-sky-300">
                    {item.type}
                  </td>
                  <td className="p-3">
                    {item.missingCount}
                  </td>
                  <td className="p-3">
                    {item.uniqueCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Download
              size={19}
              className="text-emerald-300"
            />
            Export Trained Results
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            Download test predictions, train/test
            evaluation metrics, or the complete
            training response as JSON.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportPredictions}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500"
            >
              <FileSpreadsheet size={17} />
              Predictions CSV
            </button>

            <button
              type="button"
              onClick={exportMetrics}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold hover:border-violet-500"
            >
              <FileSpreadsheet size={17} />
              Metrics CSV
            </button>

            <button
              type="button"
              onClick={exportJSON}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold hover:border-violet-500"
            >
              <FileJson size={17} />
              Full Results JSON
            </button>
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-400">
            Prediction CSV contains up to the first
            50 held-out test predictions per fitted
            model, as provided by the backend.
            The full JSON includes available
            prediction surfaces, importance scores,
            metrics and explanations. Exported
            predictions are not linked to original
            CSV row identifiers.
          </p>
        </div>
      )}
    </section>
  );
}
