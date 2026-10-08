import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useSVM,
} from "../context/SVMContext";
import type {
  SVMTask,
} from "../types/svm";
import {
  builtInDatasets,
  type RawDatasetRow,
} from "./defaultDatasets";
import {
  analyzeColumns,
  createActiveDataset,
  getColumns,
  getNumericColumns,
  getTargetSummary,
} from "./datasetUtils";
import "./SVMDatasetStudio.css";
type DatasetSource =
  | "builtin"
  | "uploaded"
  | "generated";
const AUTO_Z = "__AUTO_KERNEL_SPACE__";
function getPreferredTarget(
  rows: RawDatasetRow[],
  task: SVMTask
) {
  const columns = getColumns(rows);
  if (task === "classification") {
    if (columns.includes("Class")) {
      return "Class";
    }
  } else {
    if (columns.includes("Score")) {
      return "Score";
    }
  }
  return columns[
    columns.length - 1
  ] ?? "";
}
function getDefaultFeatures(
  rows: RawDatasetRow[],
  target: string
) {
  return getNumericColumns(rows)
    .filter(
      (column) =>
        column !== target
    )
    .slice(0, 3);
}
export default function SVMDatasetStudio() {
  const {
    state,
    setDataset,
  } = useSVM();
  const initialDataset =
    builtInDatasets[0];
  const initialTarget =
    getPreferredTarget(
      initialDataset.rows,
      initialDataset.task
    );
  const initialFeatures =
    getDefaultFeatures(
      initialDataset.rows,
      initialTarget
    );
  const [
    datasetName,
    setDatasetName,
  ] = useState(
    initialDataset.name
  );
  const [
    rawRows,
    setRawRows,
  ] = useState<RawDatasetRow[]>(
    initialDataset.rows
  );
  const [
    source,
    setSource,
  ] = useState<DatasetSource>(
    "builtin"
  );
  const [
    task,
    setTask,
  ] = useState<SVMTask>(
    initialDataset.task
  );
  const [
    targetColumn,
    setTargetColumn,
  ] = useState(
    initialTarget
  );
  const [
    xFeature,
    setXFeature,
  ] = useState(
    initialFeatures[0] ?? ""
  );
  const [
    yFeature,
    setYFeature,
  ] = useState(
    initialFeatures[1] ?? ""
  );
  const [
    zFeature,
    setZFeature,
  ] = useState(
    initialFeatures[2] ??
      AUTO_Z
  );
  const [
    extraFeatures,
    setExtraFeatures,
  ] = useState<string[]>(
    initialFeatures.slice(3)
  );
  const [
    scalingEnabled,
    setScalingEnabled,
  ] = useState(true);
  const [
    csvErrors,
    setCsvErrors,
  ] = useState<string[]>([]);
  const [
    activationMessage,
    setActivationMessage,
  ] = useState("");
  /*
   * =====================================================
   * SYNC DATASET STUDIO WITH GLOBAL ACTIVE DATASET
   * =====================================================
   * A dataset can become active from the top CSV uploader
   * or another ModelMind control. Mirror that global state
   * here so Dataset Studio never keeps showing stale
   * built-in rows after a CSV has already been activated.
   */
  useEffect(() => {
    const active = state.dataset;

    if (!active || active.rows.length === 0) {
      return;
    }

    const synchronizedRows: RawDatasetRow[] =
      active.rows.map((row) => {
        if (row.original) {
          return {
            ...row.original,
          } as RawDatasetRow;
        }

        const reconstructed: RawDatasetRow = {};

        active.featureColumns.forEach(
          (feature, featureIndex) => {
            reconstructed[feature] =
              row.features[featureIndex] ?? "";
          }
        );

        reconstructed[active.targetColumn] =
          row.target;

        return reconstructed;
      });

    const activeFeatures =
      active.featureColumns.filter(
        (feature) =>
          feature !== active.targetColumn
      );

    setDatasetName(active.name);
    setRawRows(synchronizedRows);
    setSource(active.source);
    setTask(active.task);
    setTargetColumn(active.targetColumn);

    setXFeature(
      activeFeatures[0] ?? ""
    );

    setYFeature(
      activeFeatures[1] ??
        activeFeatures[0] ??
        ""
    );

    setZFeature(
      activeFeatures[2] ??
        AUTO_Z
    );

    setExtraFeatures(
      activeFeatures.slice(3)
    );

    setScalingEnabled(
      active.scalingEnabled
    );

    setCsvErrors([]);
    setActivationMessage("");
  }, [state.dataset]);

  /*
   * =====================================================
   * DATASET ANALYSIS
   * =====================================================
   */
  const columns =
    useMemo(
      () =>
        getColumns(rawRows),
      [rawRows]
    );
  const analysis =
    useMemo(
      () =>
        analyzeColumns(rawRows),
      [rawRows]
    );
  const numericColumns =
    useMemo(
      () =>
        getNumericColumns(
          rawRows
        ),
      [rawRows]
    );
  const availableFeatures =
    useMemo(
      () =>
        numericColumns.filter(
          (column) =>
            column !==
            targetColumn
        ),
      [
        numericColumns,
        targetColumn,
      ]
    );
  const targetSummary =
    useMemo(
      () =>
        targetColumn
          ? getTargetSummary(
              rawRows,
              targetColumn
            )
          : [],
      [
        rawRows,
        targetColumn,
      ]
    );
  const missingTotal =
    useMemo(
      () =>
        analysis.reduce(
          (
            sum,
            column
          ) =>
            sum +
            column.missingCount,
          0
        ),
      [analysis]
    );
  /*
   * =====================================================
   * FINAL ORDER USED BY ENTIRE SVM LAB
   *
   * features[0] = X
   * features[1] = Y
   * features[2] = Z when selected
   * remaining = extra model features
   * =====================================================
   */
  const selectedFeatures =
    useMemo(() => {
      const result: string[] = [];
      const add = (
        feature: string
      ) => {
        if (
          feature &&
          feature !== AUTO_Z &&
          availableFeatures.includes(
            feature
          ) &&
          !result.includes(
            feature
          )
        ) {
          result.push(feature);
        }
      };
      add(xFeature);
      add(yFeature);
      add(zFeature);
      extraFeatures.forEach(
        add
      );
      return result;
    }, [
      xFeature,
      yFeature,
      zFeature,
      extraFeatures,
      availableFeatures,
    ]);
  /*
   * =====================================================
   * KEEP FEATURE SELECTION VALID
   * =====================================================
   */
  useEffect(() => {
    if (
      availableFeatures.length ===
      0
    ) {
      setXFeature("");
      setYFeature("");
      setZFeature(AUTO_Z);
      setExtraFeatures([]);
      return;
    }
    setXFeature(
      (current) =>
        availableFeatures.includes(
          current
        )
          ? current
          : availableFeatures[0] ??
            ""
    );
    setYFeature(
      (current) => {
        if (
          availableFeatures.includes(
            current
          )
        ) {
          return current;
        }
        return (
          availableFeatures.find(
            (feature) =>
              feature !==
              xFeature
          ) ??
          availableFeatures[0] ??
          ""
        );
      }
    );
    setZFeature(
      (current) => {
        if (
          current === AUTO_Z
        ) {
          return current;
        }
        return availableFeatures.includes(
          current
        )
          ? current
          : AUTO_Z;
      }
    );
    setExtraFeatures(
      (current) =>
        current.filter(
          (feature) =>
            availableFeatures.includes(
              feature
            )
        )
    );
  }, [
    availableFeatures,
    xFeature,
  ]);
  /*
   * =====================================================
   * LOAD BUILT-IN DATASET
   * =====================================================
   */
  function loadBuiltInDataset(
    datasetId: string
  ) {
    const dataset =
      builtInDatasets.find(
        (item) =>
          item.id ===
          datasetId
      );
    if (!dataset) {
      return;
    }
    const preferredTarget =
      getPreferredTarget(
        dataset.rows,
        dataset.task
      );
    const preferredFeatures =
      getDefaultFeatures(
        dataset.rows,
        preferredTarget
      );
    setDatasetName(
      dataset.name
    );
    setRawRows(
      dataset.rows
    );
    setSource(
      "builtin"
    );
    setTask(
      dataset.task
    );
    setTargetColumn(
      preferredTarget
    );
    setXFeature(
      preferredFeatures[0] ??
        ""
    );
    setYFeature(
      preferredFeatures[1] ??
        ""
    );
    setZFeature(
      preferredFeatures[2] ??
        AUTO_Z
    );
    setExtraFeatures([]);
    setScalingEnabled(true);
    setCsvErrors([]);
    setActivationMessage("");
  }
  /*
   * =====================================================
   * TARGET CHANGE
   * =====================================================
   */
  function changeTarget(
    target: string
  ) {
    setTargetColumn(
      target
    );
    const nextAvailable =
      numericColumns.filter(
        (column) =>
          column !== target
      );
    setXFeature(
      nextAvailable[0] ?? ""
    );
    setYFeature(
      nextAvailable[1] ??
        nextAvailable[0] ??
        ""
    );
    setZFeature(
      nextAvailable[2] ??
        AUTO_Z
    );
    setExtraFeatures([]);
    setActivationMessage("");
  }
  /*
   * =====================================================
   * EXTRA MODEL FEATURES
   * =====================================================
   */
  function toggleExtraFeature(
    feature: string
  ) {
    if (
      feature === xFeature ||
      feature === yFeature ||
      feature === zFeature
    ) {
      return;
    }
    setExtraFeatures(
      (current) =>
        current.includes(
          feature
        )
          ? current.filter(
              (item) =>
                item !==
                feature
            )
          : [
              ...current,
              feature,
            ]
    );
    setActivationMessage("");
  }
  /*
   * =====================================================
   * ACTIVATE DATASET
   * =====================================================
   */
  function activateDataset() {
    if (!targetColumn) {
      setActivationMessage(
        "Select a target column."
      );
      return;
    }
    if (!xFeature) {
      setActivationMessage(
        "Select an X feature."
      );
      return;
    }
    if (!yFeature) {
      setActivationMessage(
        "Select a Y feature."
      );
      return;
    }
    if (
      xFeature === yFeature
    ) {
      setActivationMessage(
        "X and Y must use different features."
      );
      return;
    }
    if (
      zFeature !== AUTO_Z &&
      (
        zFeature ===
          xFeature ||
        zFeature ===
          yFeature
      )
    ) {
      setActivationMessage(
        "Z must use a different feature from X and Y."
      );
      return;
    }
    if (
      selectedFeatures.length <
      2
    ) {
      setActivationMessage(
        "Select at least two numeric features."
      );
      return;
    }
    if (
      task ===
        "classification" &&
      targetSummary.length < 2
    ) {
      setActivationMessage(
        "Classification requires at least two target classes."
      );
      return;
    }
    if (
      task === "regression"
    ) {
      const targetAnalysis =
        analysis.find(
          (column) =>
            column.name ===
            targetColumn
        );
      if (
        targetAnalysis?.type !==
        "numeric"
      ) {
        setActivationMessage(
          "SVR requires a numeric target column."
        );
        return;
      }
    }
    const dataset =
      createActiveDataset(
        datasetName,
        rawRows,
        selectedFeatures,
        targetColumn,
        task,
        scalingEnabled,
        source
      );
    setDataset(dataset);
    setActivationMessage(
      `${dataset.name} is now active across the complete SVM Lab.`
    );
  }
  const zLabel =
    zFeature === AUTO_Z
      ? "Auto decision / kernel space"
      : zFeature;
  return (
    <section className="dataset-studio">
      <div className="dataset-heading">
        <div>
          <div className="dataset-kicker">
            DATASET STUDIO
          </div>
          <h2>
            Control the complete
            SVM learning dataset
          </h2>
          <p>
            Choose a showcase
            dataset or configure your
            uploaded CSV. Explicitly
            assign the target and the
            X, Y and Z visualization
            dimensions before sending
            one shared dataset to every
            SVM learning module.
          </p>
        </div>
        <div className="active-dataset-badge">
          <span>
            ACTIVE DATASET
          </span>
          <strong>
            {state.dataset?.name ??
              "None"}
          </strong>
          <small>
            {state.dataset
              ? `${state.dataset.rows.length} rows · ${state.dataset.featureColumns.length} features`
              : "No dataset"}
          </small>
        </div>
      </div>
      {/* ================================================
          BUILT-IN SHOWCASE DATASETS
          ================================================ */}
      <div className="dataset-source-grid">
        {builtInDatasets.map(
          (dataset) => (
            <button
              key={dataset.id}
              type="button"
              className={
                source ===
                  "builtin" &&
                datasetName ===
                  dataset.name
                  ? "dataset-source-card selected"
                  : "dataset-source-card"
              }
              onClick={() =>
                loadBuiltInDataset(
                  dataset.id
                )
              }
            >
              <span>
                {dataset.task ===
                "classification"
                  ? "SVC"
                  : "SVR"}
              </span>
              <strong>
                {dataset.name}
              </strong>
              <small>
                {
                  dataset.description
                }
              </small>
            </button>
          )
        )}
      </div>
      {/* ================================================
          SUMMARY
          ================================================ */}
      <div className="dataset-summary-grid">
        <SummaryCard
          label="Rows"
          value={
            rawRows.length
          }
        />
        <SummaryCard
          label="Columns"
          value={
            columns.length
          }
        />
        <SummaryCard
          label="Numeric"
          value={
            numericColumns.length
          }
        />
        <SummaryCard
          label="Missing"
          value={
            missingTotal
          }
        />
        <SummaryCard
          label="Model Features"
          value={
            selectedFeatures.length
          }
        />
        <SummaryCard
          label="Task"
          value={
            task ===
            "classification"
              ? "SVC"
              : "SVR"
          }
        />
      </div>
      {/* ================================================
          CONFIGURATION
          ================================================ */}
      <div className="dataset-config-grid">
        <div className="dataset-panel">
          <div className="dataset-panel-heading">
            <div>
              <span className="dataset-panel-kicker">
                MODEL INPUT
              </span>
              <h3>
                Experiment Setup
              </h3>
            </div>
            <span className="dataset-source-pill">
              {source ===
              "uploaded"
                ? "YOUR CSV"
                : "SHOWCASE"}
            </span>
          </div>
          <label className="field-label">
            SVM Task
          </label>
          <div className="task-switch">
            <button
              type="button"
              className={
                task ===
                "classification"
                  ? "selected"
                  : ""
              }
              onClick={() => {
                setTask(
                  "classification"
                );
                setActivationMessage(
                  ""
                );
              }}
            >
              <span>SVC</span>
              Classification
            </button>
            <button
              type="button"
              className={
                task ===
                "regression"
                  ? "selected"
                  : ""
              }
              onClick={() => {
                setTask(
                  "regression"
                );
                setActivationMessage(
                  ""
                );
              }}
            >
              <span>SVR</span>
              Regression
            </button>
          </div>
          <label className="field-label">
            Target Column
          </label>
          <select
            value={
              targetColumn
            }
            onChange={(
              event
            ) =>
              changeTarget(
                event.target.value
              )
            }
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
          <div className="dataset-selection-divider">
            <span>
              VISUALIZATION AXES
            </span>
            <p>
              X and Y are required.
              Z can use a real third
              feature or ModelMind can
              generate meaningful
              decision/kernel space.
            </p>
          </div>
          <div className="axis-selector-grid">
            <AxisSelector
              axis="X"
              value={
                xFeature
              }
              features={
                availableFeatures
              }
              disabledFeatures={[
                yFeature,
                zFeature ===
                AUTO_Z
                  ? ""
                  : zFeature,
              ]}
              onChange={(
                feature
              ) => {
                setXFeature(
                  feature
                );
                setExtraFeatures(
                  (current) =>
                    current.filter(
                      (item) =>
                        item !==
                        feature
                    )
                );
                setActivationMessage(
                  ""
                );
              }}
            />
            <AxisSelector
              axis="Y"
              value={
                yFeature
              }
              features={
                availableFeatures
              }
              disabledFeatures={[
                xFeature,
                zFeature ===
                AUTO_Z
                  ? ""
                  : zFeature,
              ]}
              onChange={(
                feature
              ) => {
                setYFeature(
                  feature
                );
                setExtraFeatures(
                  (current) =>
                    current.filter(
                      (item) =>
                        item !==
                        feature
                    )
                );
                setActivationMessage(
                  ""
                );
              }}
            />
            <div className="axis-selector axis-z">
              <div className="axis-selector-heading">
                <span className="axis-chip">
                  Z
                </span>
                <div>
                  <strong>
                    3D Axis
                  </strong>
                  <small>
                    Optional
                  </small>
                </div>
              </div>
              <select
                value={
                  zFeature
                }
                onChange={(
                  event
                ) => {
                  const value =
                    event.target
                      .value;
                  setZFeature(
                    value
                  );
                  if (
                    value !==
                    AUTO_Z
                  ) {
                    setExtraFeatures(
                      (current) =>
                        current.filter(
                          (item) =>
                            item !==
                            value
                        )
                    );
                  }
                  setActivationMessage(
                    ""
                  );
                }}
              >
                <option
                  value={
                    AUTO_Z
                  }
                >
                  Auto Decision /
                  Kernel Space
                </option>
                {availableFeatures.map(
                  (feature) => (
                    <option
                      key={
                        feature
                      }
                      value={
                        feature
                      }
                      disabled={
                        feature ===
                          xFeature ||
                        feature ===
                          yFeature
                      }
                    >
                      {feature}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="visualization-map">
            <div>
              <span>X</span>
              <strong>
                {xFeature ||
                  "Not selected"}
              </strong>
            </div>
            <div>
              <span>Y</span>
              <strong>
                {yFeature ||
                  "Not selected"}
              </strong>
            </div>
            <div>
              <span>Z</span>
              <strong>
                {zLabel}
              </strong>
            </div>
          </div>
          {/* ============================================
              EXTRA FEATURES
              ============================================ */}
          <div className="dataset-selection-divider">
            <span>
              EXTRA MODEL FEATURES
            </span>
            <p>
              Optional additional
              numeric features can still
              participate in kernel and
              experiment calculations
              without becoming the main
              visual axes.
            </p>
          </div>
          <div className="feature-list">
            {availableFeatures
              .filter(
                (feature) =>
                  feature !==
                    xFeature &&
                  feature !==
                    yFeature &&
                  feature !==
                    zFeature
              )
              .map(
                (feature) => (
                  <label
                    key={
                      feature
                    }
                    className="feature-option"
                  >
                    <input
                      type="checkbox"
                      checked={extraFeatures.includes(
                        feature
                      )}
                      onChange={() =>
                        toggleExtraFeature(
                          feature
                        )
                      }
                    />
                    <span>
                      {feature}
                    </span>
                  </label>
                )
              )}
            {availableFeatures.filter(
              (feature) =>
                feature !==
                  xFeature &&
                feature !==
                  yFeature &&
                feature !==
                  zFeature
            ).length ===
              0 && (
              <p className="muted">
                No additional
                numeric features are
                available.
              </p>
            )}
          </div>
          {/* ============================================
              FEATURE ORDER
              ============================================ */}
          <div className="selected-feature-order">
            <strong>
              Shared feature order
            </strong>
            <p>
              1. X ={" "}
              {xFeature ||
                "—"}
            </p>
            <p>
              2. Y ={" "}
              {yFeature ||
                "—"}
            </p>
            <p>
              3. Z ={" "}
              {zLabel}
            </p>
            {extraFeatures.length >
              0 && (
              <p>
                Extra ={" "}
                {extraFeatures.join(
                  ", "
                )}
              </p>
            )}
          </div>
          {/* ============================================
              SCALING
              ============================================ */}
          <label className="scaling-toggle">
            <input
              type="checkbox"
              checked={
                scalingEnabled
              }
              onChange={(
                event
              ) =>
                setScalingEnabled(
                  event.target
                    .checked
                )
              }
            />
            <div>
              <strong>
                Standardize Features
              </strong>
              <small>
                Recommended for SVM
                because feature scale
                directly influences
                distances, margins and
                kernel calculations.
              </small>
            </div>
            <span
              className={
                scalingEnabled
                  ? "scaling-status enabled"
                  : "scaling-status"
              }
            >
              {scalingEnabled
                ? "ON"
                : "OFF"}
            </span>
          </label>
          {/* ============================================
              ACTIVE CONFIG PREVIEW
              ============================================ */}
          <div className="dataset-config-preview">
            <span>
              READY CONFIGURATION
            </span>
            <div>
              <strong>
                {task ===
                "classification"
                  ? "SVC"
                  : "SVR"}
              </strong>
              <small>
                Task
              </small>
            </div>
            <div>
              <strong>
                {
                  selectedFeatures.length
                }
              </strong>
              <small>
                Features
              </small>
            </div>
            <div>
              <strong>
                {scalingEnabled
                  ? "Scaled"
                  : "Raw"}
              </strong>
              <small>
                Input
              </small>
            </div>
          </div>
          <button
            type="button"
            className="activate-dataset"
            onClick={
              activateDataset
            }
          >
            <span>
              Use Dataset in
              SVM Lab
            </span>
            <small>
              Apply to Visual
              Learning, Kernels,
              Experiments &
              Prediction
            </small>
          </button>
          {activationMessage && (
            <div
              className={
                activationMessage.includes(
                  "active across"
                )
                  ? "activation-message success"
                  : "activation-message"
              }
            >
              {
                activationMessage
              }
            </div>
          )}
        </div>
        {/* ==============================================
            COLUMN ANALYSIS
            ============================================== */}
        <div className="dataset-panel">
          <div className="dataset-panel-heading">
            <div>
              <span className="dataset-panel-kicker">
                DATA PROFILE
              </span>
              <h3>
                Column Analysis
              </h3>
            </div>
          </div>
          <div className="column-table-wrap">
            <table className="column-table">
              <thead>
                <tr>
                  <th>
                    Column
                  </th>
                  <th>
                    Role
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
                  <th>
                    Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.map(
                  (column) => {
                    const role =
                      column.name ===
                      targetColumn
                        ? "Target"
                        : column.name ===
                            xFeature
                          ? "X"
                          : column.name ===
                              yFeature
                            ? "Y"
                            : column.name ===
                                zFeature
                              ? "Z"
                              : extraFeatures.includes(
                                    column.name
                                  )
                                ? "Extra"
                                : "—";
                    return (
                      <tr
                        key={
                          column.name
                        }
                      >
                        <td>
                          {
                            column.name
                          }
                        </td>
                        <td>
                          <span
                            className={`column-role role-${role
                              .toLowerCase()
                              .replace(
                                "—",
                                "none"
                              )}`}
                          >
                            {role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`type-pill ${column.type}`}
                          >
                            {
                              column.type
                            }
                          </span>
                        </td>
                        <td>
                          {
                            column.missingCount
                          }
                        </td>
                        <td>
                          {
                            column.uniqueCount
                          }
                        </td>
                        <td>
                          {column.type ===
                          "numeric"
                            ? `${formatNumber(
                                column.minimum
                              )} → ${formatNumber(
                                column.maximum
                              )}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ================================================
          TARGET + QUALITY
          ================================================ */}
      <div className="dataset-config-grid">
        <div className="dataset-panel">
          <div className="dataset-panel-heading">
            <div>
              <span className="dataset-panel-kicker">
                TARGET
              </span>
              <h3>
                Target Distribution
              </h3>
            </div>
            <span className="dataset-target-chip">
              {targetColumn ||
                "None"}
            </span>
          </div>
          {targetSummary.length >
          0 ? (
            <div className="target-bars">
              {targetSummary
                .slice(0, 12)
                .map(
                  (item) => {
                    const maximum =
                      Math.max(
                        ...targetSummary.map(
                          (
                            entry
                          ) =>
                            entry.count
                        )
                      );
                    const width =
                      maximum > 0
                        ? (
                            item.count /
                            maximum
                          ) * 100
                        : 0;
                    return (
                      <div
                        key={
                          item.value
                        }
                        className="target-row"
                      >
                        <div className="target-label">
                          <span>
                            {
                              item.value
                            }
                          </span>
                          <strong>
                            {
                              item.count
                            }
                          </strong>
                        </div>
                        <div className="target-track">
                          <div
                            className="target-fill"
                            style={{
                              width:
                                `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          ) : (
            <p className="muted">
              Select a target
              column to inspect its
              distribution.
            </p>
          )}
        </div>
        <div className="dataset-panel">
          <div className="dataset-panel-heading">
            <div>
              <span className="dataset-panel-kicker">
                PREPROCESSING
              </span>
              <h3>
                Data Quality
              </h3>
            </div>
          </div>
          <div className="quality-item">
            <span>
              Missing values
            </span>
            <strong>
              {missingTotal}
            </strong>
          </div>
          <div className="quality-item">
            <span>
              Numeric columns
            </span>
            <strong>
              {
                numericColumns.length
              }
            </strong>
          </div>
          <div className="quality-item">
            <span>
              Model features
            </span>
            <strong>
              {
                selectedFeatures.length
              }
            </strong>
          </div>
          <div className="quality-item">
            <span>
              Visualization
            </span>
            <strong>
              {zFeature ===
              AUTO_Z
                ? "2D + Kernel 3D"
                : "True X/Y/Z"}
            </strong>
          </div>
          <div className="quality-item">
            <span>
              Scaling
            </span>
            <strong>
              {scalingEnabled
                ? "Enabled"
                : "Disabled"}
            </strong>
          </div>
          <div className="quality-item">
            <span>
              Source
            </span>
            <strong>
              {source}
            </strong>
          </div>
          {missingTotal > 0 && (
            <div className="dataset-quality-note">
              <strong>
                Missing values
                detected
              </strong>
              <p>
                ModelMind's dataset
                conversion uses the
                existing numeric
                missing-value handling
                before the shared SVM
                dataset is activated.
              </p>
            </div>
          )}
          {csvErrors.length >
            0 && (
            <div className="csv-warning">
              <strong>
                CSV warnings
              </strong>
              {csvErrors
                .slice(0, 5)
                .map(
                  (
                    error,
                    index
                  ) => (
                    <p
                      key={`${error}-${index}`}
                    >
                      {error}
                    </p>
                  )
                )}
            </div>
          )}
        </div>
      </div>
      {/* ================================================
          DATASET PREVIEW
          ================================================ */}
      <div className="dataset-panel">
        <div className="preview-heading">
          <div>
            <span className="dataset-panel-kicker">
              RAW DATA
            </span>
            <h3>
              Dataset Preview
            </h3>
            <p>
              Showing the first{" "}
              {Math.min(
                rawRows.length,
                8
              )}{" "}
              rows.
            </p>
          </div>
          <div className="preview-chip-group">
            <span className="dataset-name-chip">
              {datasetName}
            </span>
            <span className="dataset-name-chip secondary">
              {source ===
              "uploaded"
                ? "CSV"
                : "BUILT-IN"}
            </span>
          </div>
        </div>
        <div className="preview-table-wrap">
          <table className="preview-table">
            <thead>
              <tr>
                {columns.map(
                  (column) => (
                    <th
                      key={
                        column
                      }
                    >
                      <div className="preview-column-heading">
                        <span>
                          {column}
                        </span>
                        {column ===
                          targetColumn && (
                          <small>
                            TARGET
                          </small>
                        )}
                        {column ===
                          xFeature && (
                          <small>
                            X
                          </small>
                        )}
                        {column ===
                          yFeature && (
                          <small>
                            Y
                          </small>
                        )}
                        {column ===
                          zFeature && (
                          <small>
                            Z
                          </small>
                        )}
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rawRows
                .slice(0, 8)
                .map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      {columns.map(
                        (
                          column
                        ) => (
                          <td
                            key={
                              column
                            }
                          >
                            {String(
                              row[
                                column
                              ] ??
                                "—"
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
      </div>
      {/* ================================================
          CURRENT GLOBAL DATASET
          ================================================ */}
      {state.dataset && (
        <div className="global-dataset-summary">
          <div>
            <span>
              CURRENT GLOBAL
              SVM DATASET
            </span>
            <h3>
              {
                state.dataset
                  .name
              }
            </h3>
            <p>
              Every downstream
              ModelMind SVM module
              reads this shared
              dataset.
            </p>
          </div>
          <div className="global-dataset-flow">
            <span>
              Dataset Studio
            </span>
            <b>→</b>
            <span>
              Visual Learning
            </span>
            <b>→</b>
            <span>
              Kernel Labs
            </span>
            <b>→</b>
            <span>
              Experiments
            </span>
            <b>→</b>
            <span>
              Prediction
            </span>
          </div>
          <div className="global-dataset-details">
            <div>
              <span>
                Task
              </span>
              <strong>
                {state.dataset
                  .task ===
                "classification"
                  ? "SVC"
                  : "SVR"}
              </strong>
            </div>
            <div>
              <span>
                Target
              </span>
              <strong>
                {
                  state.dataset
                    .targetColumn
                }
              </strong>
            </div>
            <div>
              <span>
                X
              </span>
              <strong>
                {state.dataset
                  .featureColumns[
                  0
                ] ?? "—"}
              </strong>
            </div>
            <div>
              <span>
                Y
              </span>
              <strong>
                {state.dataset
                  .featureColumns[
                  1
                ] ?? "—"}
              </strong>
            </div>
            <div>
              <span>
                Z
              </span>
              <strong>
                {state.dataset
                  .featureColumns[
                  2
                ] ??
                  "Kernel Space"}
              </strong>
            </div>
            <div>
              <span>
                Scaling
              </span>
              <strong>
                {state.dataset
                  .scalingEnabled
                  ? "ON"
                  : "OFF"}
              </strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
type AxisSelectorProps = {
  axis: "X" | "Y";
  value: string;
  features: string[];
  disabledFeatures: string[];
  onChange: (
    value: string
  ) => void;
};
function AxisSelector({
  axis,
  value,
  features,
  disabledFeatures,
  onChange,
}: AxisSelectorProps) {
  return (
    <div
      className={`axis-selector axis-${axis.toLowerCase()}`}
    >
      <div className="axis-selector-heading">
        <span className="axis-chip">
          {axis}
        </span>
        <div>
          <strong>
            {axis} Axis
          </strong>
          <small>
            Required
          </small>
        </div>
      </div>
      <select
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
      >
        {features.map(
          (feature) => (
            <option
              key={
                feature
              }
              value={
                feature
              }
              disabled={disabledFeatures.includes(
                feature
              )}
            >
              {feature}
            </option>
          )
        )}
      </select>
    </div>
  );
}
function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="dataset-summary-card">
      <span>
        {label}
      </span>
      <strong>
        {value}
      </strong>
    </div>
  );
}
function formatNumber(
  value?: number
) {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }
  return Number(
    value.toFixed(3)
  ).toString();
}
