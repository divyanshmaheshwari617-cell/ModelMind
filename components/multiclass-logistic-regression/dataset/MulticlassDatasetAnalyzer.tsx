import {
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import Papa from "papaparse";
import Plot from "react-plotly.js";

import type {
  MulticlassRow,
} from "../types/multiclassLogisticRegression";

import {
  classCounts,
  getNumericColumns,
  getTargetClasses,
  prepareDataset,
  summarizeColumns,
} from "../preprocessing/preprocessingMath";

import type {
  MissingStrategy,
  RawDatasetRow,
} from "../preprocessing/preprocessingMath";

interface Props {
  demoRows: RawDatasetRow[];

  onUseDataset: (
    rows: MulticlassRow[],
    features: string[],
    target: string
  ) => void;
}

export default function MulticlassDatasetAnalyzer({
  demoRows,
  onUseDataset,
}: Props) {
  const [
    rawRows,
    setRawRows,
  ] =
    useState<
      RawDatasetRow[]
    >(demoRows);

  const [
    datasetName,
    setDatasetName,
  ] = useState(
    "ModelMind Demo Dataset"
  );

  const numericColumns =
    useMemo(
      () =>
        getNumericColumns(
          rawRows
        ),
      [rawRows]
    );

  const allColumns =
    useMemo(
      () =>
        summarizeColumns(
          rawRows
        ),
      [rawRows]
    );

  const [
    target,
    setTarget,
  ] = useState(
    "species"
  );

  const [
    features,
    setFeatures,
  ] = useState<string[]>([
    "sepal_length",
    "sepal_width",
    "petal_length",
    "petal_width",
  ]);

  const [
    strategy,
    setStrategy,
  ] =
    useState<MissingStrategy>(
      "median"
    );

  const classes =
    useMemo(
      () =>
        getTargetClasses(
          rawRows,
          target
        ),
      [
        rawRows,
        target,
      ]
    );

  const preparedRows =
    useMemo(
      () =>
        prepareDataset(
          rawRows,
          features,
          target,
          strategy
        ),
      [
        rawRows,
        features,
        target,
        strategy,
      ]
    );

  const distribution =
    useMemo(
      () =>
        classCounts(
          preparedRows
        ),
      [preparedRows]
    );

  const validMulticlass =
    classes.length >= 3;

  function resetSelections(
    nextRows:
      RawDatasetRow[]
  ) {
    const summaries =
      summarizeColumns(
        nextRows
      );

    const numeric =
      summaries
        .filter(
          (column) =>
            column.numeric
        )
        .map(
          (column) =>
            column.column
        );

    /*
     * Prefer a non-numeric
     * low-cardinality column
     * as target.
     */
    const preferredTarget =
      summaries.find(
        (column) =>
          !column.numeric &&
          column.unique >= 3 &&
          column.unique <=
            Math.max(
              20,
              nextRows.length /
                2
            )
      )?.column;

    /*
     * Otherwise use a
     * low-cardinality column.
     */
    const fallbackTarget =
      summaries.find(
        (column) =>
          column.unique >= 3 &&
          column.unique <=
            Math.max(
              20,
              nextRows.length /
                2
            )
      )?.column;

    const nextTarget =
      preferredTarget ??
      fallbackTarget ??
      summaries[
        summaries.length - 1
      ]?.column ??
      "";

    const nextFeatures =
      numeric
        .filter(
          (column) =>
            column !==
            nextTarget
        )
        .slice(0, 6);

    setTarget(
      nextTarget
    );

    setFeatures(
      nextFeatures
    );
  }

  function handleFile(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    Papa.parse<
      RawDatasetRow
    >(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,

      complete: (
        result
      ) => {
        const cleanRows =
          result.data.filter(
            (row) =>
              Object.keys(row)
                .length > 0
          );

        setRawRows(
          cleanRows
        );

        setDatasetName(
          file.name
        );

        resetSelections(
          cleanRows
        );
      },
    });
  }

  function toggleFeature(
    feature: string
  ) {
    setFeatures(
      (current) => {
        if (
          current.includes(
            feature
          )
        ) {
          return current.filter(
            (item) =>
              item !== feature
          );
        }

        return [
          ...current,
          feature,
        ];
      }
    );
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            DATASET
          </span>

          <h2>
            Multiclass Dataset
            Analyzer
          </h2>
        </div>

        <span className="value-pill">
          {rawRows.length} rows
        </span>
      </div>

      <p className="muted">
        Upload a CSV containing
        numerical input features and
        a target with three or more
        classes. Text class names
        such as Setosa, Versicolor
        and Virginica are supported.
      </p>

      <div className="control-grid">
        <label className="control-card">
          <span>
            Upload CSV
          </span>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={
              handleFile
            }
          />

          <small>
            Current:{" "}
            {datasetName}
          </small>
        </label>

        <label className="control-card">
          <span>
            Target column
          </span>

          <select
            value={target}
            onChange={(
              event
            ) => {
              const next =
                event.target
                  .value;

              setTarget(next);

              setFeatures(
                (current) =>
                  current.filter(
                    (feature) =>
                      feature !==
                      next
                  )
              );
            }}
          >
            {allColumns.map(
              (column) => (
                <option
                  key={
                    column.column
                  }
                  value={
                    column.column
                  }
                >
                  {column.column}
                </option>
              )
            )}
          </select>

          <small>
            Detected classes:{" "}
            {classes.length}
          </small>
        </label>

        <label className="control-card">
          <span>
            Missing values
          </span>

          <select
            value={
              strategy
            }
            onChange={(
              event
            ) =>
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
            Target labels are never
            imputed.
          </small>
        </label>
      </div>

      <div className="sub-panel">
        <h3>
          Numerical Features
        </h3>

        <div className="feature-chip-row">
          {numericColumns
            .filter(
              (column) =>
                column !==
                target
            )
            .map(
              (column) => (
                <button
                  type="button"
                  key={column}
                  className={
                    features.includes(
                      column
                    )
                      ? "target-chip"
                      : "feature-chip"
                  }
                  onClick={() =>
                    toggleFeature(
                      column
                    )
                  }
                >
                  {column}
                </button>
              )
            )}
        </div>

        <p className="muted">
          Selected:{" "}
          {features.length ===
          0
            ? "none"
            : features.join(
                ", "
              )}
        </p>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Raw rows
          </span>

          <strong>
            {rawRows.length}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Prepared rows
          </span>

          <strong>
            {
              preparedRows.length
            }
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Features
          </span>

          <strong>
            {features.length}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Classes
          </span>

          <strong>
            {classes.length}
          </strong>
        </div>
      </div>

      {!validMulticlass && (
        <div className="warning-box">
          Multiclass Logistic
          Regression requires at
          least 3 different target
          classes. The selected
          target currently contains{" "}
          {classes.length}.
        </div>
      )}

      {features.length ===
        0 && (
        <div className="warning-box">
          Select at least one
          numerical feature.
        </div>
      )}

      {distribution.length >
        0 && (
        <div className="sub-panel">
          <h3>
            Class Distribution
          </h3>

          <Plot
            data={[
              {
                type: "bar",

                x:
                  distribution.map(
                    (item) =>
                      String(
                        item.label
                      )
                  ),

                y:
                  distribution.map(
                    (item) =>
                      item.count
                  ),

                hovertemplate:
                  "Class: %{x}" +
                  "<br>Samples: %{y}" +
                  "<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,
              height: 360,

              margin: {
                l: 60,
                r: 20,
                t: 20,
                b: 60,
              },

              xaxis: {
                title: {
                  text:
                    "Target Class",
                },
              },

              yaxis: {
                title: {
                  text:
                    "Number of Samples",
                },
              },

              paper_bgcolor:
                "transparent",

              plot_bgcolor:
                "transparent",
            }}
            useResizeHandler
            style={{
              width: "100%",
            }}
            config={{
              responsive: true,
              displaylogo:
                false,
            }}
          />
        </div>
      )}

      <div className="sub-panel">
        <h3>
          Detected Classes
        </h3>

        <div className="feature-chip-row">
          {classes.map(
            (
              classLabel,
              index
            ) => (
              <span
                className="feature-chip"
                key={`${String(
                  classLabel
                )}-${index}`}
              >
                {String(
                  classLabel
                )}
              </span>
            )
          )}
        </div>
      </div>

      <div className="sub-panel">
        <h3>
          Column Diagnostics
        </h3>

        <div
          style={{
            overflowX:
              "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th>
                  Column
                </th>

                <th>
                  Type
                </th>

                <th>
                  Missing
                </th>

                <th>
                  Unique
                </th>
              </tr>
            </thead>

            <tbody>
              {allColumns.map(
                (column) => (
                  <tr
                    key={
                      column.column
                    }
                  >
                    <td>
                      {
                        column.column
                      }
                    </td>

                    <td>
                      {column.numeric
                        ? "Numeric"
                        : "Categorical"}
                    </td>

                    <td>
                      {
                        column.missing
                      }
                    </td>

                    <td>
                      {
                        column.unique
                      }
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="button"
        className="primary-button"
        disabled={
          !validMulticlass ||
          features.length ===
            0 ||
          preparedRows.length <
            classes.length
        }
        onClick={() =>
          onUseDataset(
            preparedRows,
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