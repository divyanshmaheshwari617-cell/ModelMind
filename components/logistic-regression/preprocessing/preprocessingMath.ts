import {
  DatasetAnalysis,
  NumericRow,
} from "../types/logisticRegression";

export type RawRow =
  Record<
    string,
    string | number | null | undefined
  >;

export type MissingStrategy =
  | "median"
  | "mean"
  | "drop";

export interface PreprocessingResult {
  rows: NumericRow[];
  analysis: DatasetAnalysis;
}

function isMissing(
  value:
    | string
    | number
    | null
    | undefined
): boolean {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return [
    "",
    "na",
    "n/a",
    "null",
    "undefined",
    "nan",
    "?",
  ].includes(normalized);
}

function toNumber(
  value:
    | string
    | number
    | null
    | undefined
): number | null {
  if (isMissing(value)) {
    return null;
  }

  const numeric =
    Number(value);

  return Number.isFinite(
    numeric
  )
    ? numeric
    : null;
}

function mean(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

function median(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 === 0
  ) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}

export function analyzeDataset(
  rawRows: RawRow[]
): DatasetAnalysis {
  if (
    rawRows.length === 0
  ) {
    return {
      rowCount: 0,
      numericColumns: [],
      missingValues: {},
      uniqueValues: {},
      warnings: [
        "Dataset is empty.",
      ],
    };
  }

  const columns =
    Array.from(
      new Set(
        rawRows.flatMap(
          (row) =>
            Object.keys(row)
        )
      )
    );

  const numericColumns:
    string[] = [];

  const missingValues:
    Record<string, number> =
      {};

  const uniqueValues:
    Record<string, number> =
      {};

  const warnings:
    string[] = [];

  for (
    const column of columns
  ) {
    const values =
      rawRows.map(
        (row) =>
          row[column]
      );

    const missingCount =
      values.filter(
        isMissing
      ).length;

    missingValues[
      column
    ] = missingCount;

    const nonMissing =
      values.filter(
        (value) =>
          !isMissing(value)
      );

    const numericValues =
      nonMissing
        .map(toNumber)
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );

    if (
      nonMissing.length > 0 &&
      numericValues.length ===
        nonMissing.length
    ) {
      numericColumns.push(
        column
      );
    }

    uniqueValues[
      column
    ] =
      new Set(
        nonMissing.map(
          (value) =>
            String(value)
        )
      ).size;

    if (
      missingCount > 0
    ) {
      warnings.push(
        `${column} contains ${missingCount} missing value${
          missingCount === 1
            ? ""
            : "s"
        }.`
      );
    }
  }

  if (
    rawRows.length < 20
  ) {
    warnings.push(
      "The dataset is small. Evaluation metrics may be unstable."
    );
  }

  return {
    rowCount:
      rawRows.length,

    numericColumns,

    missingValues,

    uniqueValues,

    warnings,
  };
}

export function preprocessDataset(
  rawRows: RawRow[],
  strategy:
    MissingStrategy =
      "median"
): PreprocessingResult {
  const analysis =
    analyzeDataset(
      rawRows
    );

  const numericColumns =
    analysis.numericColumns;

  if (
    numericColumns.length === 0
  ) {
    return {
      rows: [],
      analysis,
    };
  }

  const replacementValues:
    Record<string, number> =
      {};

  for (
    const column
      of numericColumns
  ) {
    const values =
      rawRows
        .map(
          (row) =>
            toNumber(
              row[column]
            )
        )
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );

    replacementValues[
      column
    ] =
      strategy === "mean"
        ? mean(values)
        : median(values);
  }

  const rows:
    NumericRow[] = [];

  for (
    const rawRow of rawRows
  ) {
    const row:
      NumericRow = {};

    let shouldDrop =
      false;

    for (
      const column
        of numericColumns
    ) {
      const value =
        toNumber(
          rawRow[column]
        );

      if (
        value === null
      ) {
        if (
          strategy ===
          "drop"
        ) {
          shouldDrop =
            true;
          break;
        }

        row[column] =
          replacementValues[
            column
          ];
      } else {
        row[column] =
          value;
      }
    }

    if (!shouldDrop) {
      rows.push(row);
    }
  }

  return {
    rows,
    analysis,
  };
}

export function validateBinaryTarget(
  rows: NumericRow[],
  target: string
): {
  valid: boolean;
  classes: number[];
  message: string;
} {
  const classes =
    Array.from(
      new Set(
        rows.map(
          (row) =>
            Number(
              row[target]
            )
        )
      )
    ).sort(
      (a, b) => a - b
    );

  if (
    classes.length !== 2
  ) {
    return {
      valid: false,
      classes,

      message:
        `Target "${target}" must contain exactly two classes. Found ${classes.length}.`,
    };
  }

  if (
    classes[0] !== 0 ||
    classes[1] !== 1
  ) {
    return {
      valid: false,
      classes,

      message:
        `Target "${target}" is binary but must currently be encoded as 0 and 1.`,
    };
  }

  return {
    valid: true,
    classes,

    message:
      "Binary target is valid for Logistic Regression.",
  };
}

export function analyzeClassBalance(
  rows: NumericRow[],
  target: string
) {
  let class0 = 0;
  let class1 = 0;

  for (
    const row of rows
  ) {
    if (
      row[target] === 1
    ) {
      class1++;
    } else if (
      row[target] === 0
    ) {
      class0++;
    }
  }

  const total =
    class0 + class1;

  const class0Ratio =
    total === 0
      ? 0
      : class0 / total;

  const class1Ratio =
    total === 0
      ? 0
      : class1 / total;

  const minorityRatio =
    Math.min(
      class0Ratio,
      class1Ratio
    );

  let warning = "";

  if (
    total > 0 &&
    minorityRatio < 0.1
  ) {
    warning =
      "Severe class imbalance detected. Accuracy alone may be misleading.";
  } else if (
    total > 0 &&
    minorityRatio < 0.25
  ) {
    warning =
      "Moderate class imbalance detected. Pay attention to precision, recall, F1 and ROC-AUC.";
  }

  return {
    class0,
    class1,
    class0Ratio,
    class1Ratio,
    minorityRatio,
    warning,
  };
}