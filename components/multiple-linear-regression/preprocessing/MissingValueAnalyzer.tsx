import { useMemo, useState } from "react";

import {
  analyzeDatasetPreprocessing,
  applyMissingValueStrategy,
  missingSeverityLabel,
  skewnessLabel,
  strategyLabel,
  type MissingValueStrategy,
  type RawDatasetRow,
} from "./preprocessingMath";

interface MissingValueAnalyzerProps {
  rows: RawDatasetRow[];
  columns: string[];

  onApplyPreprocessing: (
    processedRows: RawDatasetRow[],
  ) => void;
}

interface AppliedAction {
  column: string;
  strategy: MissingValueStrategy;
  fillValue: string | number | null;
  beforeMissingCount: number;
  afterMissingCount: number;
  removedRows: number;
}

export default function MissingValueAnalyzer({
  rows,
  columns,
  onApplyPreprocessing,
}: MissingValueAnalyzerProps) {
  const [workingRows, setWorkingRows] =
    useState<RawDatasetRow[]>(rows);

  const [selectedStrategies, setSelectedStrategies] =
    useState<Record<string, MissingValueStrategy>>({});

  const [appliedActions, setAppliedActions] =
    useState<AppliedAction[]>([]);

  const analysis = useMemo(
    () =>
      analyzeDatasetPreprocessing(
        workingRows,
        columns,
      ),
    [workingRows, columns],
  );

  const originalAnalysis = useMemo(
    () =>
      analyzeDatasetPreprocessing(
        rows,
        columns,
      ),
    [rows, columns],
  );

  const columnsWithMissingValues =
    analysis.analyses.filter(
      (column) => column.missingCount > 0,
    );

  function getSelectedStrategy(
    column: string,
    recommendedStrategy: MissingValueStrategy | null,
  ): MissingValueStrategy {
    return (
      selectedStrategies[column] ??
      recommendedStrategy ??
      "keep"
    );
  }

  function changeStrategy(
    column: string,
    strategy: MissingValueStrategy,
  ) {
    setSelectedStrategies((current) => ({
      ...current,
      [column]: strategy,
    }));
  }

  function applyStrategy(
    column: string,
    recommendedStrategy: MissingValueStrategy | null,
  ) {
    const strategy =
      getSelectedStrategy(
        column,
        recommendedStrategy,
      );

    const result =
      applyMissingValueStrategy(
        workingRows,
        column,
        strategy,
      );

    setWorkingRows(result.rows);

    setAppliedActions((current) => [
      ...current.filter(
        (action) =>
          action.column !== column,
      ),
      {
        column,
        strategy,
        fillValue: result.fillValue,
        beforeMissingCount:
          result.beforeMissingCount,
        afterMissingCount:
          result.afterMissingCount,
        removedRows:
          result.removedRows,
      },
    ]);
  }

  function applyAllRecommended() {
    let nextRows = [...workingRows];

    const newActions: AppliedAction[] = [];

    for (const columnAnalysis of analysis.analyses) {
      if (
        columnAnalysis.missingCount === 0 ||
        !columnAnalysis.recommendedStrategy
      ) {
        continue;
      }

      const strategy =
        getSelectedStrategy(
          columnAnalysis.column,
          columnAnalysis.recommendedStrategy,
        );

      if (strategy === "keep") {
        continue;
      }

      const result =
        applyMissingValueStrategy(
          nextRows,
          columnAnalysis.column,
          strategy,
        );

      nextRows = result.rows;

      newActions.push({
        column:
          columnAnalysis.column,

        strategy,

        fillValue:
          result.fillValue,

        beforeMissingCount:
          result.beforeMissingCount,

        afterMissingCount:
          result.afterMissingCount,

        removedRows:
          result.removedRows,
      });
    }

    setWorkingRows(nextRows);

    setAppliedActions((current) => {
      const updated = [...current];

      for (const action of newActions) {
        const index =
          updated.findIndex(
            (item) =>
              item.column ===
              action.column,
          );

        if (index >= 0) {
          updated[index] = action;
        } else {
          updated.push(action);
        }
      }

      return updated;
    });
  }

  function resetPreprocessing() {
    setWorkingRows(rows);
    setSelectedStrategies({});
    setAppliedActions([]);
  }

  function finishPreprocessing() {
    onApplyPreprocessing(
      workingRows,
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">
            Preprocessing Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Missing Values & Distribution Health
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            ModelMind analyzes missing values and the
            shape of numerical distributions before
            recommending an imputation strategy.
            Nothing is filled automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={resetPreprocessing}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
        >
          Reset
        </button>
      </div>

      {/* DATASET HEALTH */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HealthCard
          label="Rows"
          value={String(
            workingRows.length,
          )}
        />

        <HealthCard
          label="Columns"
          value={String(
            analysis.totalColumns,
          )}
        />

        <HealthCard
          label="Missing cells"
          value={String(
            analysis.totalMissingCells,
          )}
        />

        <HealthCard
          label="Columns affected"
          value={String(
            analysis.columnsWithMissingValues,
          )}
        />
      </div>

      {/* GLOBAL WARNING */}

      {analysis.totalMissingCells > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <p className="font-bold text-amber-300">
            Missing data detected
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-100/80">
            ModelMind found{" "}
            {analysis.totalMissingCells} missing
            values across{" "}
            {
              analysis.columnsWithMissingValues
            }{" "}
            columns. Review the recommendations
            below before training.
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="font-bold text-emerald-300">
            ✓ No unresolved missing values
          </p>

          <p className="mt-2 text-sm text-emerald-100/80">
            The current working dataset contains
            no detected missing values.
          </p>
        </div>
      )}

      {/* COLUMN ANALYSIS */}

      <div className="mt-6 space-y-4">
        {originalAnalysis.analyses.map(
          (originalColumn) => {
            const currentColumn =
              analysis.analyses.find(
                (item) =>
                  item.column ===
                  originalColumn.column,
              );

            if (!currentColumn) {
              return null;
            }

            const action =
              appliedActions.find(
                (item) =>
                  item.column ===
                  currentColumn.column,
              );

            const selectedStrategy =
              getSelectedStrategy(
                currentColumn.column,
                originalColumn.recommendedStrategy,
              );

            return (
              <div
                key={currentColumn.column}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                {/* COLUMN TITLE */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {currentColumn.column}
                      </h3>

                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {currentColumn.kind}
                      </span>

                      {originalColumn.missingCount >
                        0 && (
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            severityStyle(
                              originalColumn.missingSeverity,
                            ),
                          ].join(" ")}
                        >
                          {missingSeverityLabel(
                            originalColumn.missingSeverity,
                          )}{" "}
                          missingness
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {
                        originalColumn.missingCount
                      }{" "}
                      missing of{" "}
                      {
                        originalColumn.totalRows
                      }{" "}
                      rows (
                      {originalColumn.missingPercentage.toFixed(
                        2,
                      )}
                      %)
                    </p>
                  </div>

                  {currentColumn.missingCount ===
                    0 && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      ✓ Resolved
                    </span>
                  )}
                </div>

                {/* NUMERIC STATISTICS */}

                {originalColumn.kind ===
                  "numeric" && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Statistic
                      label="Mean"
                      value={formatValue(
                        originalColumn.mean,
                      )}
                    />

                    <Statistic
                      label="Median"
                      value={formatValue(
                        originalColumn.median,
                      )}
                    />

                    <Statistic
                      label="Most Frequent"
                      value={formatValue(
                        originalColumn.mode,
                      )}
                    />

                    <Statistic
                      label="Skewness"
                      value={formatValue(
                        originalColumn.skewness,
                      )}
                    />

                    <Statistic
                      label="Distribution"
                      value={skewnessLabel(
                        originalColumn.skewnessLevel,
                      )}
                    />
                  </div>
                )}

                {/* CATEGORICAL STATISTICS */}

                {originalColumn.kind ===
                  "categorical" && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Statistic
                      label="Unique values"
                      value={String(
                        originalColumn.uniqueCount,
                      )}
                    />

                    <Statistic
                      label="Most Frequent"
                      value={formatValue(
                        originalColumn.mode,
                      )}
                    />
                  </div>
                )}

                {/* WARNING */}

                {originalColumn.warning && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm font-semibold text-red-300">
                      ⚠ High missing-data warning
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-200/80">
                      {
                        originalColumn.warning
                      }
                    </p>
                  </div>
                )}

                {/* RECOMMENDATION */}

                {originalColumn.missingCount >
                  0 && (
                  <>
                    <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                        ModelMind Recommendation
                      </p>

                      <p className="mt-2 font-semibold text-white">
                        {originalColumn.recommendedStrategy
                          ? strategyLabel(
                              originalColumn.recommendedStrategy,
                            )
                          : "Review manually"}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {
                          originalColumn.recommendationReason
                        }
                      </p>

                      {originalColumn.kind ===
                        "numeric" &&
                        originalColumn.skewness !==
                          null && (
                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            Skewness ={" "}
                            {originalColumn.skewness.toFixed(
                              3,
                            )}{" "}
                            →{" "}
                            {skewnessLabel(
                              originalColumn.skewnessLevel,
                            )}
                          </p>
                        )}
                    </div>

                    {/* STRATEGY SELECTION */}

                    {currentColumn.missingCount >
                      0 && (
                      <div className="mt-5">
                        <p className="text-sm font-bold text-slate-200">
                          Choose how to handle
                          missing values
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                          {availableStrategies(
                            originalColumn.kind,
                          ).map(
                            (strategy) => (
                              <label
                                key={
                                  strategy
                                }
                                className={[
                                  "cursor-pointer rounded-xl border p-3 transition",
                                  selectedStrategy ===
                                  strategy
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-slate-800 bg-slate-950/50 hover:border-slate-600",
                                ].join(
                                  " ",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`strategy-${currentColumn.column}`}
                                    checked={
                                      selectedStrategy ===
                                      strategy
                                    }
                                    onChange={() =>
                                      changeStrategy(
                                        currentColumn.column,
                                        strategy,
                                      )
                                    }
                                    className="accent-blue-600"
                                  />

                                  <span className="text-sm font-semibold text-slate-200">
                                    {strategyLabel(
                                      strategy,
                                    )}
                                  </span>
                                </div>

                                {strategy ===
                                  originalColumn.recommendedStrategy && (
                                  <p className="mt-2 text-xs font-semibold text-emerald-400">
                                    Recommended
                                  </p>
                                )}

                                <StrategyValue
                                  strategy={
                                    strategy
                                  }
                                  column={
                                    originalColumn
                                  }
                                />
                              </label>
                            ),
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            applyStrategy(
                              currentColumn.column,
                              originalColumn.recommendedStrategy,
                            )
                          }
                          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
                        >
                          Apply to{" "}
                          {
                            currentColumn.column
                          }
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* BEFORE / AFTER */}

                {action && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Before
                      </p>

                      <p className="mt-2 text-lg font-bold text-white">
                        {
                          action.beforeMissingCount
                        }{" "}
                        missing
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        After
                      </p>

                      <p className="mt-2 text-lg font-bold text-emerald-300">
                        {
                          action.afterMissingCount
                        }{" "}
                        missing
                      </p>

                      {action.fillValue !==
                        null && (
                        <p className="mt-1 text-xs text-slate-400">
                          Filled using{" "}
                          {strategyLabel(
                            action.strategy,
                          )}
                          :{" "}
                          {formatValue(
                            action.fillValue,
                          )}
                        </p>
                      )}

                      {action.removedRows >
                        0 && (
                        <p className="mt-1 text-xs text-slate-400">
                          {
                            action.removedRows
                          }{" "}
                          rows removed
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* ACTIONS */}

      {columnsWithMissingValues.length >
        0 && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-white">
                Apply selected strategies
              </p>

              <p className="mt-1 text-sm text-slate-400">
                ModelMind will apply your
                selected strategy to each
                unresolved column.
              </p>
            </div>

            <button
              type="button"
              onClick={
                applyAllRecommended
              }
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
            >
              Apply Selected to All
            </button>
          </div>
        </div>
      )}

      {/* FINAL RESULT */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-white">
              Preprocessing result
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Current dataset:{" "}
              {workingRows.length} rows ·{" "}
              {analysis.totalMissingCells}{" "}
              unresolved missing values.
            </p>
          </div>

          <button
            type="button"
            onClick={
              finishPreprocessing
            }
            disabled={
              analysis.totalMissingCells >
              0
            }
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Use Processed Dataset
          </button>
        </div>

        {analysis.totalMissingCells >
          0 && (
          <p className="mt-3 text-xs text-amber-300">
            Resolve the remaining missing
            values before continuing to model
            training.
          </p>
        )}
      </div>
    </section>
  );
}

function HealthCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function Statistic({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p
        className="mt-2 truncate text-sm font-bold text-slate-200"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function StrategyValue({
  strategy,
  column,
}: {
  strategy: MissingValueStrategy;
  column: {
    mean: number | null;
    median: number | null;
    mode: string | number | null;
  };
}) {
  let value: string | null =
    null;

  if (
    strategy === "mean" &&
    column.mean !== null
  ) {
    value = formatValue(
      column.mean,
    );
  }

  if (
    strategy === "median" &&
    column.median !== null
  ) {
    value = formatValue(
      column.median,
    );
  }

  if (
    strategy ===
      "most_frequent" &&
    column.mode !== null
  ) {
    value = formatValue(
      column.mode,
    );
  }

  if (!value) {
    return null;
  }

  return (
    <p className="mt-2 truncate font-mono text-xs text-slate-500">
      Value: {value}
    </p>
  );
}

function availableStrategies(
  kind: "numeric" | "categorical",
): MissingValueStrategy[] {
  if (kind === "numeric") {
    return [
      "mean",
      "median",
      "most_frequent",
      "drop_rows",
      "keep",
    ];
  }

  return [
    "most_frequent",
    "drop_rows",
    "keep",
  ];
}

function severityStyle(
  severity:
    | "none"
    | "low"
    | "moderate"
    | "high"
    | "very_high",
): string {
  switch (severity) {
    case "none":
      return "bg-emerald-500/10 text-emerald-300";

    case "low":
      return "bg-blue-500/10 text-blue-300";

    case "moderate":
      return "bg-amber-500/10 text-amber-300";

    case "high":
      return "bg-orange-500/10 text-orange-300";

    case "very_high":
      return "bg-red-500/10 text-red-300";
  }
}

function formatValue(
  value:
    | string
    | number
    | null,
): string {
  if (value === null) {
    return "—";
  }

  if (
    typeof value === "number"
  ) {
    if (
      !Number.isFinite(value)
    ) {
      return "—";
    }

    if (
      Math.abs(value) >=
        100000 ||
      (Math.abs(value) > 0 &&
        Math.abs(value) < 0.001)
    ) {
      return value.toExponential(
        3,
      );
    }

    return value.toFixed(3);
  }

  return value;
}