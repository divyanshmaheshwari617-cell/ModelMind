import type {
  FeatureScaler,
  SVMRow,
} from "../types/svm";

export type RawDatasetRow = Record<
  string,
  string | number | null
>;

export type ImputationMethod =
  | "none"
  | "mean"
  | "median"
  | "most-frequent"
  | "remove";

export interface ColumnAnalysis {
  column: string;
  total: number;
  missing: number;
  missingPercentage: number;
  numeric: boolean;
  mean: number | null;
  median: number | null;
  mode: string | number | null;
  skewness: number | null;
  recommendedMethod: ImputationMethod;
}

export interface PreparedDataset {
  rows: SVMRow[];
  removedRows: number;
  imputedValues: number;
}

export function isMissingValue(
  value: unknown
): boolean {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value === "number"
  ) {
    return !Number.isFinite(value);
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return (
    normalized === "" ||
    normalized === "na" ||
    normalized === "n/a" ||
    normalized === "nan" ||
    normalized === "null" ||
    normalized === "none" ||
    normalized === "undefined" ||
    normalized === "?"
  );
}

export function toFiniteNumber(
  value: unknown
): number | null {
  if (isMissingValue(value)) {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(
          String(value).trim()
        );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function getMedian(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted =
    [...values].sort(
      (first, second) =>
        first - second
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

export function getMode(
  values: Array<string | number>
): string | number | null {
  if (values.length === 0) {
    return null;
  }

  const frequencies = new Map<
    string,
    {
      value: string | number;
      count: number;
    }
  >();

  for (const value of values) {
    const key = String(value);

    const existing =
      frequencies.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      frequencies.set(key, {
        value,
        count: 1,
      });
    }
  }

  let bestValue:
    | string
    | number
    | null = null;

  let bestCount = 0;

  for (const entry of frequencies.values()) {
    if (entry.count > bestCount) {
      bestCount = entry.count;
      bestValue = entry.value;
    }
  }

  return bestValue;
}

export function calculateSkewness(
  values: number[]
): number {
  if (values.length < 3) {
    return 0;
  }

  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length;

  const variance =
    values.reduce(
      (sum, value) => {
        const difference =
          value - average;

        return (
          sum +
          difference *
            difference
        );
      },
      0
    ) / values.length;

  const std =
    Math.sqrt(variance);

  if (std === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => {
        return (
          sum +
          Math.pow(
            (value -
              average) /
              std,
            3
          )
        );
      },
      0
    ) / values.length
  );
}

export function analyzeColumn(
  rows: RawDatasetRow[],
  column: string
): ColumnAnalysis {
  const values =
    rows.map(
      (row) => row[column]
    );

  const validValues =
    values.filter(
      (value) =>
        !isMissingValue(
          value
        )
    );

  const numericValues =
    validValues
      .map(toFiniteNumber)
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  const numeric =
    validValues.length > 0 &&
    numericValues.length ===
      validValues.length;

  const missing =
    values.length -
    validValues.length;

  const missingPercentage =
    values.length > 0
      ? (missing /
          values.length) *
        100
      : 0;

  const average =
    numeric &&
    numericValues.length > 0
      ? numericValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        numericValues.length
      : null;

  const median =
    numeric &&
    numericValues.length > 0
      ? getMedian(
          numericValues
        )
      : null;

  const mode =
    getMode(
      validValues.map(
        (value) =>
          typeof value ===
          "number"
            ? value
            : String(value)
      )
    );

  const skewness =
    numeric
      ? calculateSkewness(
          numericValues
        )
      : null;

  let recommendedMethod:
    ImputationMethod =
      "none";

  if (missing > 0) {
    if (
      missingPercentage >=
      40
    ) {
      recommendedMethod =
        "remove";
    } else if (!numeric) {
      recommendedMethod =
        "most-frequent";
    } else if (
      Math.abs(
        skewness ?? 0
      ) > 1
    ) {
      recommendedMethod =
        "median";
    } else {
      recommendedMethod =
        "mean";
    }
  }

  return {
    column,
    total: values.length,
    missing,
    missingPercentage,
    numeric,
    mean: average,
    median,
    mode,
    skewness,
    recommendedMethod,
  };
}

export function analyzeColumns(
  rows: RawDatasetRow[],
  columns: string[]
): ColumnAnalysis[] {
  return columns.map(
    (column) =>
      analyzeColumn(
        rows,
        column
      )
  );
}

export function calculateImputationValue(
  rows: RawDatasetRow[],
  column: string,
  method: ImputationMethod
): string | number | null {
  const validValues =
    rows
      .map(
        (row) =>
          row[column]
      )
      .filter(
        (value) =>
          !isMissingValue(
            value
          )
      );

  if (
    validValues.length === 0
  ) {
    return null;
  }

  if (
    method ===
    "most-frequent"
  ) {
    return getMode(
      validValues.map(
        (value) =>
          typeof value ===
          "number"
            ? value
            : String(value)
      )
    );
  }

  const numericValues =
    validValues
      .map(toFiniteNumber)
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  if (
    numericValues.length !==
    validValues.length
  ) {
    return null;
  }

  if (method === "mean") {
    return (
      numericValues.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      numericValues.length
    );
  }

  if (
    method === "median"
  ) {
    return getMedian(
      numericValues
    );
  }

  return null;
}

export function prepareDataset(
  rawRows: RawDatasetRow[],
  featureColumns: string[],
  targetColumn: string,
  methods: Record<
    string,
    ImputationMethod
  >
): PreparedDataset {
  let removedRows = 0;
  let imputedValues = 0;

  const imputationValues =
    new Map<
      string,
      string | number | null
    >();

  featureColumns.forEach(
    (column) => {
      const method =
        methods[column] ??
        "none";

      imputationValues.set(
        column,
        calculateImputationValue(
          rawRows,
          column,
          method
        )
      );
    }
  );

  const prepared: SVMRow[] =
    [];

  rawRows.forEach(
    (rawRow, rowIndex) => {
      if (
        isMissingValue(
          rawRow[
            targetColumn
          ]
        )
      ) {
        removedRows += 1;
        return;
      }

      const features:
        number[] = [];

      let removeRow = false;

      for (
        const column of
        featureColumns
      ) {
        const original =
          rawRow[column];

        let value =
          toFiniteNumber(
            original
          );

        if (value === null) {
          const method =
            methods[column] ??
            "none";

          if (
            method ===
            "remove" ||
            method ===
            "none"
          ) {
            removeRow = true;
            break;
          }

          const replacement =
            imputationValues.get(
              column
            );

          const numericReplacement =
            toFiniteNumber(
              replacement
            );

          if (
            numericReplacement ===
            null
          ) {
            removeRow = true;
            break;
          }

          value =
            numericReplacement;

          imputedValues += 1;
        }

        features.push(value);
      }

      if (removeRow) {
        removedRows += 1;
        return;
      }

      const target =
        rawRow[targetColumn];

      prepared.push({
        id: rowIndex,
        features,
        target:
          typeof target ===
          "number"
            ? target
            : String(target),
      });
    }
  );

  return {
    rows: prepared,
    removedRows,
    imputedValues,
  };
}

export function createFeatureScalers(
  rows: SVMRow[]
): FeatureScaler[] {
  if (rows.length === 0) {
    return [];
  }

  const featureCount =
    rows[0].features.length;

  return Array.from(
    {
      length:
        featureCount,
    },
    (_, featureIndex) => {
      const values =
        rows.map(
          (row) =>
            row.features[
              featureIndex
            ]
        );

      const average =
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length;

      const variance =
        values.reduce(
          (sum, value) => {
            const difference =
              value -
              average;

            return (
              sum +
              difference *
                difference
            );
          },
          0
        ) / values.length;

      const std =
        Math.sqrt(
          variance
        );

      return {
        mean: average,
        std:
          std > 1e-9
            ? std
            : 1,
      };
    }
  );
}

export function scaleRows(
  rows: SVMRow[],
  scalers: FeatureScaler[]
): SVMRow[] {
  return rows.map(
    (row) => ({
      ...row,
      features:
        row.features.map(
          (
            value,
            featureIndex
          ) => {
            const scaler =
              scalers[
                featureIndex
              ];

            if (!scaler) {
              return value;
            }

            return (
              (value -
                scaler.mean) /
              scaler.std
            );
          }
        ),
    })
  );
}