import { useEffect, useMemo, useState } from "react";

import MissingValueAnalyzer from "./MissingValueAnalyzer";

import {
  analyzeDatasetPreprocessing,
  type RawDatasetRow,
} from "./preprocessingMath";

interface PreprocessingPanelProps {
  rows: RawDatasetRow[];
  columns: string[];

  onProcessedDataset: (
    rows: RawDatasetRow[],
  ) => void;
}

export default function PreprocessingPanel({
  rows,
  columns,
  onProcessedDataset,
}: PreprocessingPanelProps) {
  const [processedRows, setProcessedRows] =
    useState<RawDatasetRow[] | null>(null);

  useEffect(() => {
    setProcessedRows(null);
  }, [rows]);

  const originalAnalysis = useMemo(
    () =>
      analyzeDatasetPreprocessing(
        rows,
        columns,
      ),
    [rows, columns],
  );

  const processedAnalysis = useMemo(() => {
    if (!processedRows) {
      return null;
    }

    return analyzeDatasetPreprocessing(
      processedRows,
      columns,
    );
  }, [processedRows, columns]);

  const hasMissingValues =
    originalAnalysis.totalMissingCells > 0;

  /*
  |--------------------------------------------------------------------------
  | Dataset already clean
  |--------------------------------------------------------------------------
  */

  if (!hasMissingValues) {
    return (
      <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
          Preprocessing Check
        </p>

        <h2 className="mt-2 text-xl font-bold text-white">
          No missing values detected
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          ModelMind checked {rows.length} rows and{" "}
          {columns.length} columns. No missing values
          need to be filled before feature and target
          selection.
        </p>

        <button
          type="button"
          onClick={() => onProcessedDataset(rows)}
          className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          Continue With Clean Dataset
        </button>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Missing values detected
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
          Data Quality Gate
        </p>

        <h2 className="mt-2 text-xl font-bold text-white">
          Preprocessing required before training
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Your dataset contains{" "}
          <strong className="text-amber-300">
            {originalAnalysis.totalMissingCells}
          </strong>{" "}
          missing values across{" "}
          <strong className="text-amber-300">
            {originalAnalysis.columnsWithMissingValues}
          </strong>{" "}
          columns.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Rows"
            value={String(originalAnalysis.totalRows)}
          />

          <SummaryCard
            label="Columns"
            value={String(originalAnalysis.totalColumns)}
          />

          <SummaryCard
            label="Missing Cells"
            value={String(
              originalAnalysis.totalMissingCells,
            )}
          />

          <SummaryCard
            label="Affected Columns"
            value={String(
              originalAnalysis.columnsWithMissingValues,
            )}
          />
        </div>
      </section>

      <MissingValueAnalyzer
        rows={rows}
        columns={columns}
        onApplyPreprocessing={(nextRows) => {
          setProcessedRows(nextRows);
        }}
      />

      {processedRows &&
        processedAnalysis &&
        processedAnalysis.totalMissingCells === 0 && (
          <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Preprocessing Complete
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Dataset is ready for X/Y selection
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Original Rows"
                value={String(rows.length)}
              />

              <SummaryCard
                label="Processed Rows"
                value={String(processedRows.length)}
              />

              <SummaryCard
                label="Missing Remaining"
                value="0"
              />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              Your preprocessing choices have been applied
              to a working copy of the dataset. The original
              uploaded data has not been overwritten.
            </p>

            <button
              type="button"
              onClick={() =>
                onProcessedDataset(processedRows)
              }
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              Continue With Processed Dataset
            </button>
          </section>
        )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>
    </div>
  );
}