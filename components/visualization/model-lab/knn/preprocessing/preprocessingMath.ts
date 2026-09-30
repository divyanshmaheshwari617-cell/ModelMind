import type {
  KNNRow,
  KNNTask,
} from "../types/knn";

export type MissingStrategy =
  | "median"
  | "mean"
  | "most-frequent"
  | "drop";

export interface RawDatasetRow {
  [column: string]: unknown;
}

export interface ColumnSummary {
  name: string;

  totalCount: number;
  missingCount: number;
  missingPercentage: number;

  numericCount: number;
  textCount: number;

  uniqueCount: number;

  isNumeric: boolean;

  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;

  mostFrequent: string | number | null;
}

export interface PreparedDatasetResult {
  rows: KNNRow[];

  removedRows: number;

  imputedValues: number;

  warnings: string[];
}

export function isMissing(
  value: unknown,
): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return true;
  }

  return false;
}

export function toNumber(
  value: unknown,
): number | null {
  if (isMissing(value)) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function getColumns(
  rows: RawDatasetRow[],
): string[] {
  const columns = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((column) => {
      columns.add(column);
    });
  });

  return Array.from(columns);
}

export function mean(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

export function median(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const middle = Math.floor(
    sorted.length / 2,
  );

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}

export function mostFrequentValue(
  values: Array<string | number>,
): string | number | null {
  if (values.length === 0) {
    return null;
  }

  const frequencies = new Map<
    string | number,
    number
  >();

  values.forEach((value) => {
    frequencies.set(
      value,
      (frequencies.get(value) ?? 0) + 1,
    );
  });

  let bestValue:
    | string
    | number
    | null = null;

  let bestCount = -1;

  frequencies.forEach(
    (count, value) => {
      if (count > bestCount) {
        bestCount = count;
        bestValue = value;
      }
    },
  );

  return bestValue;
}

export function summarizeColumn(
  rows: RawDatasetRow[],
  column: string,
): ColumnSummary {
  const values = rows.map(
    (row) => row[column],
  );

  const validValues = values.filter(
    (value) => !isMissing(value),
  );

  const numericValues = validValues
    .map(toNumber)
    .filter(
      (value): value is number =>
        value !== null,
    );

  const textValues = validValues.filter(
    (value) => toNumber(value) === null,
  );

  const isNumericColumn =
    validValues.length > 0 &&
    numericValues.length ===
      validValues.length;

  const normalizedValues =
    validValues.map((value) => {
      const numeric = toNumber(value);

      if (numeric !== null) {
        return numeric;
      }

      return String(value);
    });

  const missingCount =
    values.length - validValues.length;

  return {
    name: column,

    totalCount: values.length,

    missingCount,

    missingPercentage:
      values.length === 0
        ? 0
        : (missingCount /
            values.length) *
          100,

    numericCount:
      numericValues.length,

    textCount: textValues.length,

    uniqueCount: new Set(
      normalizedValues,
    ).size,

    isNumeric: isNumericColumn,

    mean:
      numericValues.length === 0
        ? null
        : mean(numericValues),

    median:
      numericValues.length === 0
        ? null
        : median(numericValues),

    min:
      numericValues.length === 0
        ? null
        : Math.min(...numericValues),

    max:
      numericValues.length === 0
        ? null
        : Math.max(...numericValues),

    mostFrequent:
      mostFrequentValue(
        normalizedValues,
      ),
  };
}

export function summarizeColumns(
  rows: RawDatasetRow[],
): ColumnSummary[] {
  return getColumns(rows).map(
    (column) =>
      summarizeColumn(
        rows,
        column,
      ),
  );
}

export function getNumericColumns(
  rows: RawDatasetRow[],
): string[] {
  return summarizeColumns(rows)
    .filter(
      (summary) =>
        summary.isNumeric,
    )
    .map(
      (summary) => summary.name,
    );
}

export function getUniqueValues(
  rows: RawDatasetRow[],
  column: string,
): Array<string | number> {
  const values = rows
    .map((row) => row[column])
    .filter(
      (value) => !isMissing(value),
    )
    .map((value) => {
      const numeric = toNumber(value);

      return numeric !== null
        ? numeric
        : String(value);
    });

  return Array.from(
    new Set(values),
  );
}

export function detectSuggestedTask(
  rows: RawDatasetRow[],
  targetColumn: string,
): KNNTask {
  const summary =
    summarizeColumn(
      rows,
      targetColumn,
    );

  if (!summary.isNumeric) {
    return "classification";
  }

  const uniqueRatio =
    summary.totalCount === 0
      ? 0
      : summary.uniqueCount /
        summary.totalCount;

  if (
    summary.uniqueCount <= 10 &&
    uniqueRatio <= 0.2
  ) {
    return "classification";
  }

  return "regression";
}

function replacementValue(
  rows: RawDatasetRow[],
  column: string,
  strategy: MissingStrategy,
): number | string | null {
  const validValues = rows
    .map((row) => row[column])
    .filter(
      (value) => !isMissing(value),
    );

  if (
    strategy ===
    "most-frequent"
  ) {
    const normalized =
      validValues.map((value) => {
        const numeric =
          toNumber(value);

        return numeric !== null
          ? numeric
          : String(value);
      });

    return mostFrequentValue(
      normalized,
    );
  }

  const numericValues =
    validValues
      .map(toNumber)
      .filter(
        (value): value is number =>
          value !== null,
      );

  if (
    numericValues.length === 0
  ) {
    return null;
  }

  if (strategy === "mean") {
    return mean(numericValues);
  }

  return median(numericValues);
}

export function prepareDataset(
  rawRows: RawDatasetRow[],
  featureColumns: string[],
  targetColumn: string,
  task: KNNTask,
  missingStrategy: MissingStrategy,
): PreparedDatasetResult {
  const warnings: string[] = [];

  const preparedRows: KNNRow[] = [];

  let removedRows = 0;
  let imputedValues = 0;

  const featureReplacement =
    new Map<string, number>();

  featureColumns.forEach(
    (column) => {
      const replacement =
        replacementValue(
          rawRows,
          column,
          missingStrategy,
        );

      if (
        typeof replacement ===
        "number"
      ) {
        featureReplacement.set(
          column,
          replacement,
        );
      }
    },
  );

  rawRows.forEach((rawRow) => {
    /*
      Never impute the target.

      If the target is missing,
      that row cannot be used for
      supervised KNN.
    */
    if (
      isMissing(
        rawRow[targetColumn],
      )
    ) {
      removedRows += 1;
      return;
    }

    const features: number[] = [];

    let invalidRow = false;

    featureColumns.forEach(
      (column) => {
        const rawValue =
          rawRow[column];

        let numericValue =
          toNumber(rawValue);

        if (
          numericValue === null
        ) {
          if (
            missingStrategy ===
            "drop"
          ) {
            invalidRow = true;
            return;
          }

          const replacement =
            featureReplacement.get(
              column,
            );

          if (
            replacement ===
            undefined
          ) {
            invalidRow = true;
            return;
          }

          numericValue =
            replacement;

          imputedValues += 1;
        }

        features.push(
          numericValue,
        );
      },
    );

    if (invalidRow) {
      removedRows += 1;
      return;
    }

    let target:
      | string
      | number;

    if (task === "regression") {
      const numericTarget =
        toNumber(
          rawRow[targetColumn],
        );

      if (
        numericTarget === null
      ) {
        removedRows += 1;
        return;
      }

      target = numericTarget;
    } else {
      const numericTarget =
        toNumber(
          rawRow[targetColumn],
        );

      target =
        numericTarget !== null
          ? numericTarget
          : String(
              rawRow[
                targetColumn
              ],
            );
    }

    preparedRows.push({
      features,
      target,
    });
  });

  if (
    preparedRows.length === 0
  ) {
    warnings.push(
      "No usable rows remain after preprocessing.",
    );
  }

  if (
    featureColumns.length === 0
  ) {
    warnings.push(
      "Select at least one numeric feature.",
    );
  }

  if (
    task ===
    "classification"
  ) {
    const classCount =
      new Set(
        preparedRows.map(
          (row) => row.target,
        ),
      ).size;

    if (classCount < 2) {
      warnings.push(
        "KNN classification requires at least two target classes.",
      );
    }
  }

  return {
    rows: preparedRows,
    removedRows,
    imputedValues,
    warnings,
  };
}

export function getClassCounts(
  rows: KNNRow[],
): Array<{
  classLabel: string | number;
  count: number;
  percentage: number;
}> {
  const counts = new Map<
    string | number,
    number
  >();

  rows.forEach((row) => {
    counts.set(
      row.target,
      (counts.get(
        row.target,
      ) ?? 0) + 1,
    );
  });

  return Array.from(
    counts.entries(),
  )
    .map(
      ([classLabel, count]) => ({
        classLabel,
        count,

        percentage:
          rows.length === 0
            ? 0
            : (count /
                rows.length) *
              100,
      }),
    )
    .sort(
      (a, b) =>
        b.count - a.count,
    );
}

export function getFeatureRanges(
  rows: RawDatasetRow[],
  featureColumns: string[],
): Array<{
  feature: string;
  min: number;
  max: number;
  range: number;
}> {
  return featureColumns.map(
    (feature) => {
      const values = rows
        .map(
          (row) =>
            toNumber(
              row[feature],
            ),
        )
        .filter(
          (
            value,
          ): value is number =>
            value !== null,
        );

      if (
        values.length === 0
      ) {
        return {
          feature,
          min: 0,
          max: 0,
          range: 0,
        };
      }

      const min = Math.min(
        ...values,
      );

      const max = Math.max(
        ...values,
      );

      return {
        feature,
        min,
        max,
        range: max - min,
      };
    },
  );
}

export function shouldRecommendScaling(
  rows: RawDatasetRow[],
  featureColumns: string[],
): boolean {
  const ranges =
    getFeatureRanges(
      rows,
      featureColumns,
    )
      .map(
        (item) => item.range,
      )
      .filter(
        (range) => range > 0,
      );

  if (ranges.length < 2) {
    return false;
  }

  const smallest =
    Math.min(...ranges);

  const largest =
    Math.max(...ranges);

  if (smallest === 0) {
    return false;
  }

  return (
    largest / smallest >= 10
  );
}