import { useMemo, useState } from "react";
import Papa from "papaparse";

import { NumericRow } from "../types/regularization";
import {
  RawRow,
  analyzeColumns,
  preprocessNumericDataset,
} from "../preprocessing/preprocessingMath";

interface Props {
  demoRows: NumericRow[];
  demoFeatures: string[];
  demoTarget: string;

  onUseDataset: (
    rows: NumericRow[],
    features: string[],
    target: string
  ) => void;
}

export default function RegularizationDatasetAnalyzer({
  demoRows,
  demoFeatures,
  demoTarget,
  onUseDataset,
}: Props) {
  const [rawRows, setRawRows] = useState<RawRow[]>(
    demoRows as RawRow[]
  );

  const [sourceName, setSourceName] = useState("Built-in demo dataset");

  const [strategy, setStrategy] = useState<
    "drop" | "mean" | "median"
  >("median");

  const [selectedFeatures, setSelectedFeatures] =
    useState<string[]>(demoFeatures);

  const [target, setTarget] = useState(demoTarget);

  const analyses = useMemo(
    () => analyzeColumns(rawRows),
    [rawRows]
  );

  const processed = useMemo(
    () => preprocessNumericDataset(rawRows, strategy),
    [rawRows, strategy]
  );

  const usableColumns = analyses
    .filter((column) => column.numeric && !column.constant)
    .map((column) => column.column);

  function toggleFeature(feature: string) {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature]
    );
  }

  function loadDemo() {
    setRawRows(demoRows as RawRow[]);
    setSourceName("Built-in demo dataset");
    setSelectedFeatures(demoFeatures);
    setTarget(demoTarget);
    setStrategy("median");
  }

  function handleFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (result) => {
        const rows = result.data as RawRow[];

        setRawRows(rows);
        setSourceName(file.name);

        const analysis = analyzeColumns(rows);

        const numeric = analysis
          .filter((column) => column.numeric && !column.constant)
          .map((column) => column.column);

        if (numeric.length >= 2) {
          const nextTarget = numeric[numeric.length - 1];

          setTarget(nextTarget);
          setSelectedFeatures(
            numeric.filter((column) => column !== nextTarget)
          );
        } else {
          setTarget("");
          setSelectedFeatures([]);
        }
      },
    });
  }

  const validFeatures = selectedFeatures.filter(
    (feature) => feature !== target
  );

  const canUse =
    processed.rows.length >= 5 &&
    validFeatures.length >= 1 &&
    Boolean(target);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">DATASET LAB</span>
          <h2>Choose the data used by every regularization model</h2>
        </div>

        <button className="secondary-button" onClick={loadDemo}>
          Restore Demo
        </button>
      </div>

      <p className="muted">
        OLS, Ridge, Lasso and Elastic Net will use the same processed
        dataset and train/test split so their behavior can be compared
        fairly.
      </p>

      <div className="upload-zone">
        <strong>{sourceName}</strong>

        <label className="upload-button">
          Upload CSV
          <input
            hidden
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>

      <div className="three-column-grid">
        <div className="mini-card">
          <span>Rows</span>
          <strong>{rawRows.length}</strong>
        </div>

        <div className="mini-card">
          <span>Numeric columns</span>
          <strong>
            {analyses.filter((column) => column.numeric).length}
          </strong>
        </div>

        <div className="mini-card">
          <span>Usable after preprocessing</span>
          <strong>{processed.rows.length}</strong>
        </div>
      </div>

      <h3>Missing-value strategy</h3>

      <div className="button-row">
        {(["median", "mean", "drop"] as const).map((value) => (
          <button
            key={value}
            className={
              strategy === value
                ? "choice-button active"
                : "choice-button"
            }
            onClick={() => setStrategy(value)}
          >
            {value === "median"
              ? "Median Imputation"
              : value === "mean"
              ? "Mean Imputation"
              : "Drop Incomplete Rows"}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Missing</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Unique</th>
            </tr>
          </thead>

          <tbody>
            {analyses.map((column) => (
              <tr key={column.column}>
                <td>{column.column}</td>
                <td>{column.numeric ? "Numeric" : "Non-numeric"}</td>
                <td>
                  {column.missingCount} (
                  {column.missingPercent.toFixed(1)}%)
                </td>
                <td>
                  {column.mean === null
                    ? "—"
                    : column.mean.toFixed(3)}
                </td>
                <td>
                  {column.median === null
                    ? "—"
                    : column.median.toFixed(3)}
                </td>
                <td>{column.uniqueCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Select target</h3>

      <select
        value={target}
        onChange={(event) => {
          const nextTarget = event.target.value;

          setTarget(nextTarget);

          setSelectedFeatures((current) =>
            current.filter((feature) => feature !== nextTarget)
          );
        }}
      >
        <option value="">Select target</option>

        {usableColumns.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>

      <h3>Select input features</h3>

      <div className="feature-grid">
        {usableColumns
          .filter((column) => column !== target)
          .map((column) => (
            <label className="feature-option" key={column}>
              <input
                type="checkbox"
                checked={selectedFeatures.includes(column)}
                onChange={() => toggleFeature(column)}
              />

              <span>{column}</span>
            </label>
          ))}
      </div>

      {processed.removedRows > 0 && (
        <div className="warning-box">
          {processed.removedRows} rows were removed by the selected
          preprocessing strategy.
        </div>
      )}

      {processed.warnings.map((warning) => (
        <div className="warning-box" key={warning}>
          {warning}
        </div>
      ))}

      <button
        className="primary-button"
        disabled={!canUse}
        onClick={() =>
          onUseDataset(processed.rows, validFeatures, target)
        }
      >
        Use This Dataset
      </button>
    </section>
  );
}