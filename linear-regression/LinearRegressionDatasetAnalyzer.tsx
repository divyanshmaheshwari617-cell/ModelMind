"use client";

import {
  ChangeEvent,
  useMemo,
  useState,
} from "react";

import Papa from "papaparse";

import {
  DatasetRow,
  NumericDataPoint,
} from "./types/dataset";

import {
  analyzeLinearRegressionSuitability,
} from "./types/analyzeLinearRegressionSuitability";

type LinearRegressionDatasetAnalyzerProps = {
  onUseDataset: (
    data: NumericDataPoint[],
    featureName: string,
    targetName: string
  ) => void;
};

export default function LinearRegressionDatasetAnalyzer({
  onUseDataset,
}: LinearRegressionDatasetAnalyzerProps) {
  const [fileName, setFileName] =
    useState("");

  const [rows, setRows] =
    useState<DatasetRow[]>([]);

  const [columns, setColumns] =
    useState<string[]>([]);

  const [featureColumn, setFeatureColumn] =
    useState("");

  const [targetColumn, setTargetColumn] =
    useState("");

  const [parseError, setParseError] =
    useState("");

  const analysis = useMemo(() => {
    if (
      rows.length === 0 ||
      !featureColumn ||
      !targetColumn
    ) {
      return null;
    }

    return analyzeLinearRegressionSuitability(
      rows,
      featureColumn,
      targetColumn
    );
  }, [
    rows,
    featureColumn,
    targetColumn,
  ]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setParseError("");
    setRows([]);
    setColumns([]);
    setFeatureColumn("");
    setTargetColumn("");
    setFileName(file.name);

    Papa.parse<Record<string, unknown>>(
      file,
      {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,

        complete: (result) => {
          if (
            result.errors.length > 0
          ) {
            setParseError(
              result.errors
                .slice(0, 3)
                .map(
                  (error) =>
                    error.message
                )
                .join(" ")
            );
          }

          const fields =
            result.meta.fields ?? [];

          const cleanedRows: DatasetRow[] =
            result.data.map(
              (row) => {
                const cleaned: DatasetRow =
                  {};

                for (const field of fields) {
                  const value =
                    row[field];

                  if (
                    typeof value ===
                      "number" ||
                    typeof value ===
                      "string" ||
                    value === null
                  ) {
                    cleaned[field] =
                      value;
                  } else {
                    cleaned[field] =
                      value == null
                        ? null
                        : String(
                            value
                          );
                  }
                }

                return cleaned;
              }
            );

          setColumns(fields);
          setRows(cleanedRows);

          if (fields.length >= 2) {
            setFeatureColumn(
              fields[0]
            );

            setTargetColumn(
              fields[1]
            );
          }
        },

        error: (error) => {
          setParseError(
            error.message
          );
        },
      }
    );
  };

  const statusLabel =
    analysis?.status === "suitable"
      ? "Suitable to Explore"
      : analysis?.status ===
          "warning"
        ? "Suitable With Warnings"
        : analysis?.status ===
            "not-suitable"
          ? "Not Appropriate"
          : "";

  const statusClasses =
    analysis?.status === "suitable"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : analysis?.status ===
          "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Dataset Intelligence
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Is Linear Regression appropriate
          for your dataset?
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Upload a CSV, choose one feature X
          and a target Y, and ModelMind will
          check basic compatibility before
          allowing the data into the Linear
          Regression visual lab.
        </p>
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
        <label className="block cursor-pointer">
          <span className="text-sm font-bold text-slate-800">
            Upload CSV Dataset
          </span>

          <p className="mt-1 text-xs text-slate-500">
            The standalone LR preview accepts
            CSV files. During the final ModelMind
            merge, the central Dataset X-Ray can
            provide this data directly.
          </p>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={
              handleFileChange
            }
            className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
          />
        </label>

        {fileName && (
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loaded: {fileName}
          </p>
        )}

        {parseError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {parseError}
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="feature-column"
                className="text-sm font-bold text-slate-700"
              >
                Feature X
              </label>

              <select
                id="feature-column"
                value={featureColumn}
                onChange={(event) =>
                  setFeatureColumn(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
              >
                {columns.map(
                  (column) => (
                    <option
                      key={column}
                      value={column}
                    >
                      {column}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="target-column"
                className="text-sm font-bold text-slate-700"
              >
                Target Y
              </label>

              <select
                id="target-column"
                value={targetColumn}
                onChange={(event) =>
                  setTargetColumn(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
              >
                {columns.map(
                  (column) => (
                    <option
                      key={column}
                      value={column}
                    >
                      {column}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {analysis && (
            <div className="mt-6">
              <div
                className={`rounded-xl border p-5 ${statusClasses}`}
              >
                <p className="text-xs font-bold uppercase tracking-wider">
                  Linear Regression
                  Suitability
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {statusLabel}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs opacity-70">
                      Dataset rows
                    </p>

                    <p className="text-lg font-bold">
                      {
                        analysis.totalRows
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-70">
                      Usable rows
                    </p>

                    <p className="text-lg font-bold">
                      {
                        analysis.usableRows
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-70">
                      Correlation
                    </p>

                    <p className="text-lg font-bold">
                      {analysis.correlation ===
                      null
                        ? "N/A"
                        : analysis.correlation.toFixed(
                            3
                          )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {analysis.messages.map(
                  (message, index) => {
                    const classes =
                      message.type ===
                      "success"
                        ? "border-emerald-200 bg-emerald-50"
                        : message.type ===
                            "warning"
                          ? "border-amber-200 bg-amber-50"
                          : "border-red-200 bg-red-50";

                    return (
                      <div
                        key={`${message.title}-${index}`}
                        className={`rounded-xl border p-4 ${classes}`}
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {
                            message.title
                          }
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          {
                            message.message
                          }
                        </p>
                      </div>
                    );
                  }
                )}
              </div>

              {analysis.status !==
                "not-suitable" && (
                <button
                  type="button"
                  onClick={() =>
                    onUseDataset(
                      analysis.usableData,
                      featureColumn,
                      targetColumn
                    )
                  }
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Use Dataset in Linear
                  Regression Lab
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}