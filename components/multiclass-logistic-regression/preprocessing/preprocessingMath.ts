import type {
  ClassLabel,
  MulticlassRow,
  NumericRow,
} from "../types/multiclassLogisticRegression";
export type MissingStrategy =
  | "median"
  | "mean"
  | "drop";

export interface RawDatasetRow {
  [key: string]:
    | string
    | number
    | null
    | undefined;
}

export interface ColumnSummary {
  column: string;
  numeric: boolean;
  missing: number;
  unique: number;
}

function isMissing(
  value:
    | string
    | number
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    return (
      trimmed === "" ||
      trimmed.toLowerCase() ===
        "nan" ||
      trimmed.toLowerCase() ===
        "null" ||
      trimmed.toLowerCase() ===
        "undefined"
    );
  }

  return !Number.isFinite(value);
}

function toNumber(
  value:
    | string
    | number
    | null
    | undefined
) {
  if (isMissing(value)) {
    return null;
  }

  const converted =
    Number(value);

  return Number.isFinite(
    converted
  )
    ? converted
    : null;
}

export function getColumns(
  rows: RawDatasetRow[]
) {
  if (rows.length === 0) {
    return [];
  }

  const columns =
    new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach(
      (column) =>
        columns.add(column)
    );
  });

  return Array.from(columns);
}

export function summarizeColumns(
  rows: RawDatasetRow[]
): ColumnSummary[] {
  const columns =
    getColumns(rows);

  return columns.map(
    (column) => {
      const values =
        rows.map(
          (row) =>
            row[column]
        );

      const present =
        values.filter(
          (value) =>
            !isMissing(value)
        );

      const numeric =
        present.length > 0 &&
        present.every(
          (value) =>
            toNumber(value) !==
            null
        );

      const unique =
        new Set(
          present.map(
            (value) =>
              String(value)
          )
        ).size;

      return {
        column,
        numeric,
        missing:
          values.length -
          present.length,
        unique,
      };
    }
  );
}

export function getNumericColumns(
  rows: RawDatasetRow[]
) {
  return summarizeColumns(
    rows
  )
    .filter(
      (summary) =>
        summary.numeric
    )
    .map(
      (summary) =>
        summary.column
    );
}

export function getTargetClasses(
  rows: RawDatasetRow[],
  target: string
): ClassLabel[] {
  const classes:
    ClassLabel[] = [];

  rows.forEach((row) => {
    const value =
      row[target];

    if (isMissing(value)) {
      return;
    }

    const label =
      typeof value === "number"
        ? value
        : String(value).trim();

    const exists =
      classes.some(
        (current) =>
          String(current) ===
          String(label)
      );

    if (!exists) {
      classes.push(label);
    }
  });

  return classes;
}

function mean(
  values: number[]
) {
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
) {
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

function replacementValue(
  rows: RawDatasetRow[],
  feature: string,
  strategy:
    Exclude<
      MissingStrategy,
      "drop"
    >
) {
  const values =
    rows
      .map(
        (row) =>
          toNumber(
            row[feature]
          )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  return strategy ===
    "mean"
    ? mean(values)
    : median(values);
}

export function prepareDataset(
  rows: RawDatasetRow[],
  features: string[],
  target: string,
  strategy: MissingStrategy
): MulticlassRow[] {
  if (
    features.length === 0 ||
    !target
  ) {
    return [];
  }

  const replacements:
    NumericRow = {};

  if (
    strategy !== "drop"
  ) {
    features.forEach(
      (feature) => {
        replacements[
          feature
        ] =
          replacementValue(
            rows,
            feature,
            strategy
          );
      }
    );
  }

  const prepared:
    MulticlassRow[] = [];

  rows.forEach((row) => {
    const rawTarget =
      row[target];

    // Never invent/impute
    // classification labels.
    if (
      isMissing(rawTarget)
    ) {
      return;
    }

    const targetLabel:
      ClassLabel =
        typeof rawTarget ===
        "number"
          ? rawTarget
          : String(
              rawTarget
            ).trim();

    const featureValues:
      NumericRow = {};

    let valid = true;

    features.forEach(
      (feature) => {
        const converted =
          toNumber(
            row[feature]
          );

        if (
          converted !== null
        ) {
          featureValues[
            feature
          ] = converted;
          return;
        }

        if (
          strategy === "drop"
        ) {
          valid = false;
          return;
        }

        featureValues[
          feature
        ] =
          replacements[
            feature
          ];
      }
    );

    if (valid) {
      prepared.push({
        features:
          featureValues,
        target:
          targetLabel,
      });
    }
  });

  return prepared;
}

export function classCounts(
  rows: MulticlassRow[]
) {
  const counts =
    new Map<
      string,
      {
        label: ClassLabel;
        count: number;
      }
    >();

  rows.forEach((row) => {
    const key =
      String(row.target);

    const current =
      counts.get(key);

    if (current) {
      current.count += 1;
    } else {
      counts.set(key, {
        label: row.target,
        count: 1,
      });
    }
  });

  return Array.from(
    counts.values()
  );
}