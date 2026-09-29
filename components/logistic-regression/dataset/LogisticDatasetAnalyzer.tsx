import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";

import {
  NumericRow,
} from "../types/logisticRegression";

import {
  RawRow,
  MissingStrategy,
  preprocessDataset,
  validateBinaryTarget,
  analyzeClassBalance,
} from "../preprocessing/preprocessingMath";

interface Props {
  onUseDataset: (
    rows: NumericRow[],
    features: string[],
    target: string
  ) => void;
}

const DEMO_ROWS: RawRow[] = [
  { age: 22, study_hours: 1.2, attendance: 52, passed: 0 },
  { age: 21, study_hours: 1.8, attendance: 58, passed: 0 },
  { age: 23, study_hours: 2.1, attendance: 61, passed: 0 },
  { age: 20, study_hours: 2.4, attendance: 64, passed: 0 },
  { age: 24, study_hours: 2.8, attendance: 67, passed: 0 },
  { age: 22, study_hours: 3.0, attendance: 69, passed: 0 },
  { age: 25, study_hours: 3.3, attendance: 70, passed: 0 },
  { age: 21, study_hours: 3.5, attendance: 72, passed: 0 },
  { age: 23, study_hours: 3.7, attendance: 73, passed: 0 },
  { age: 24, study_hours: 4.0, attendance: 74, passed: 0 },

  { age: 20, study_hours: 4.2, attendance: 76, passed: 1 },
  { age: 22, study_hours: 4.5, attendance: 78, passed: 1 },
  { age: 21, study_hours: 4.8, attendance: 80, passed: 1 },
  { age: 25, study_hours: 5.0, attendance: 81, passed: 1 },
  { age: 23, study_hours: 5.2, attendance: 83, passed: 1 },
  { age: 24, study_hours: 5.5, attendance: 84, passed: 1 },
  { age: 22, study_hours: 5.8, attendance: 86, passed: 1 },
  { age: 20, study_hours: 6.0, attendance: 88, passed: 1 },
  { age: 25, study_hours: 6.4, attendance: 90, passed: 1 },
  { age: 23, study_hours: 6.8, attendance: 92, passed: 1 },
  { age: 21, study_hours: 7.1, attendance: 93, passed: 1 },
  { age: 24, study_hours: 7.5, attendance: 95, passed: 1 },
  { age: 22, study_hours: 7.8, attendance: 96, passed: 1 },
  { age: 25, study_hours: 8.1, attendance: 97, passed: 1 },
];

export default function LogisticDatasetAnalyzer({
  onUseDataset,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [rawRows, setRawRows] =
    useState<RawRow[]>(DEMO_ROWS);

  const [fileName, setFileName] =
    useState("Demo Student Dataset");

  const [strategy, setStrategy] =
    useState<MissingStrategy>("median");

  const [target, setTarget] =
    useState("passed");

  const [features, setFeatures] =
    useState<string[]>([
      "study_hours",
      "attendance",
    ]);

  const result = useMemo(
    () =>
      preprocessDataset(
        rawRows,
        strategy
      ),
    [rawRows, strategy]
  );

  const numericColumns =
    result.analysis.numericColumns;

  const targetValidation =
    useMemo(
      () =>
        target
          ? validateBinaryTarget(
              result.rows,
              target
            )
          : {
              valid: false,
              classes: [],
              message:
                "Select a target.",
            },
      [result.rows, target]
    );

  const balance =
    useMemo(
      () =>
        targetValidation.valid
          ? analyzeClassBalance(
              result.rows,
              target
            )
          : null,
      [
        result.rows,
        target,
        targetValidation.valid,
      ]
    );

  function restoreDemo() {
    setRawRows(DEMO_ROWS);
    setFileName(
      "Demo Student Dataset"
    );
    setStrategy("median");
    setTarget("passed");
    setFeatures([
      "study_hours",
      "attendance",
    ]);
  }

  function handleFile(
    file: File
  ) {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        const rows =
          results.data.filter(
            (row) =>
              Object.keys(row).length >
              0
          );

        setRawRows(rows);
        setFileName(file.name);

        const processed =
          preprocessDataset(
            rows,
            strategy
          );

        const columns =
          processed.analysis
            .numericColumns;

        /*
         * Prefer a binary numeric
         * column as the target.
         */
        const binaryTarget =
          columns.find(
            (column) => {
              const values =
                Array.from(
                  new Set(
                    processed.rows.map(
                      (row) =>
                        row[column]
                    )
                  )
                );

              return (
                values.length === 2 &&
                values.includes(0) &&
                values.includes(1)
              );
            }
          );

        const nextTarget =
          binaryTarget ??
          columns[
            columns.length - 1
          ] ??
          "";

        setTarget(nextTarget);

        setFeatures(
          columns
            .filter(
              (column) =>
                column !==
                nextTarget
            )
            .slice(0, 4)
        );
      },
    });
  }

  function toggleFeature(
    feature: string
  ) {
    setFeatures(
      (current) =>
        current.includes(feature)
          ? current.filter(
              (item) =>
                item !== feature
            )
          : [
              ...current,
              feature,
            ]
    );
  }

  function changeTarget(
    nextTarget: string
  ) {
    setTarget(nextTarget);

    setFeatures(
      (current) =>
        current.filter(
          (feature) =>
            feature !== nextTarget
        )
    );
  }

  const canUse =
    result.rows.length > 0 &&
    features.length > 0 &&
    targetValidation.valid;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            DATASET LAB
          </span>

          <h2>
            Prepare a binary
            classification dataset
          </h2>
        </div>

        <span className="value-pill">
          {result.rows.length} rows
        </span>
      </div>

      <p className="muted">
        Upload a CSV or use the demo
        dataset. Logistic Regression
        requires a binary target.
        This lab currently expects
        the two classes to be encoded
        as 0 and 1.
      </p>

      <div className="toolbar-row">
        <button
          type="button"
          className="primary-button"
          onClick={() =>
            inputRef.current?.click()
          }
        >
          Upload CSV
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={restoreDemo}
        >
          Restore Demo
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(event) => {
            const file =
              event.target.files?.[0];

            if (file) {
              handleFile(file);
            }

            event.currentTarget.value =
              "";
          }}
        />
      </div>

      <div className="info-box">
        <strong>
          Current dataset:
        </strong>{" "}
        {fileName}
      </div>

      <div className="control-grid">
        <label className="control-card">
          <span>
            Missing-value strategy
          </span>

          <select
            value={strategy}
            onChange={(event) =>
              setStrategy(
                event.target
                  .value as MissingStrategy
              )
            }
          >
            <option value="median">
              Median imputation
            </option>

            <option value="mean">
              Mean imputation
            </option>

            <option value="drop">
              Drop incomplete rows
            </option>
          </select>

          <small>
            Applied only after you
            choose this strategy.
          </small>
        </label>

        <label className="control-card">
          <span>
            Binary target
          </span>

          <select
            value={target}
            onChange={(event) =>
              changeTarget(
                event.target.value
              )
            }
          >
            <option value="">
              Select target
            </option>

            {numericColumns.map(
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

          <small>
            Target must contain
            exactly 0 and 1.
          </small>
        </label>
      </div>

      <div className="sub-panel">
        <h3>
          Feature selection
        </h3>

        <div className="feature-chip-row">
          {numericColumns
            .filter(
              (column) =>
                column !== target
            )
            .map((column) => {
              const selected =
                features.includes(
                  column
                );

              return (
                <button
                  key={column}
                  type="button"
                  className={
                    selected
                      ? "target-chip"
                      : "feature-chip"
                  }
                  onClick={() =>
                    toggleFeature(
                      column
                    )
                  }
                >
                  {selected
                    ? "✓ "
                    : ""}
                  {column}
                </button>
              );
            })}
        </div>

        <p className="muted">
          Selected:{" "}
          {features.length > 0
            ? features.join(", ")
            : "none"}
        </p>
      </div>

      <div className="sub-panel">
        <h3>
          Dataset diagnostics
        </h3>

        <div className="metric-grid">
          <div className="metric-card">
            <span>Rows</span>
            <strong>
              {result.rows.length}
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Numeric columns
            </span>
            <strong>
              {
                numericColumns.length
              }
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Features selected
            </span>
            <strong>
              {features.length}
            </strong>
          </div>

          <div className="metric-card">
            <span>
              Target classes
            </span>
            <strong>
              {targetValidation
                .classes.length || 0}
            </strong>
          </div>
        </div>

        <div
          className={
            targetValidation.valid
              ? "success-box"
              : "warning-box"
          }
        >
          {
            targetValidation.message
          }
        </div>

        {balance && (
          <>
            <div className="class-balance">
              <div>
                <span>
                  Class 0
                </span>
                <strong>
                  {balance.class0}
                </strong>
                <small>
                  {(
                    balance.class0Ratio *
                    100
                  ).toFixed(1)}
                  %
                </small>
              </div>

              <div>
                <span>
                  Class 1
                </span>
                <strong>
                  {balance.class1}
                </strong>
                <small>
                  {(
                    balance.class1Ratio *
                    100
                  ).toFixed(1)}
                  %
                </small>
              </div>
            </div>

            {balance.warning && (
              <div className="warning-box">
                {balance.warning}
              </div>
            )}
          </>
        )}

        {result.analysis.warnings
          .slice(0, 6)
          .map(
            (warning, index) => (
              <p
                className="muted"
                key={`${warning}-${index}`}
              >
                • {warning}
              </p>
            )
          )}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {numericColumns.map(
                (column) => (
                  <th key={column}>
                    {column}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {result.rows
              .slice(0, 8)
              .map(
                (row, index) => (
                  <tr key={index}>
                    {numericColumns.map(
                      (column) => (
                        <td
                          key={
                            column
                          }
                        >
                          {Number(
                            row[
                              column
                            ]
                          ).toFixed(
                            2
                          )}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="primary-button wide-button"
        disabled={!canUse}
        onClick={() =>
          onUseDataset(
            result.rows,
            features,
            target
          )
        }
      >
        Use This Dataset
      </button>
    </section>
  );
}