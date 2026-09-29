import { NumericRow } from "../types/regularization";

export interface RawRow {
  [key: string]: string | number | null | undefined;
}

export interface ColumnAnalysis {
  column: string;
  numeric: boolean;
  missingCount: number;
  missingPercent: number;
  mean: number | null;
  median: number | null;
  std: number | null;
  min: number | null;
  max: number | null;
  uniqueCount: number;
  constant: boolean;
}

export interface PreprocessingResult {
  rows: NumericRow[];
  columns: ColumnAnalysis[];
  numericColumns: string[];
  removedRows: number;
  warnings: string[];
}

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  const text = String(value).trim().toLowerCase();

  return (
    text === "" ||
    text === "na" ||
    text === "n/a" ||
    text === "null" ||
    text === "undefined" ||
    text === "nan"
  );
}

function toFiniteNumber(value: unknown): number | null {
  if (isMissing(value)) return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function std(values: number[], valueMean: number): number {
  if (values.length === 0) return 0;

  const variance =
    values.reduce(
      (sum, value) => sum + Math.pow(value - valueMean, 2),
      0
    ) / values.length;

  return Math.sqrt(variance);
}

export function analyzeColumns(rows: RawRow[]): ColumnAnalysis[] {
  if (rows.length === 0) return [];

  const columnSet = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((column) => columnSet.add(column));
  });

  return Array.from(columnSet).map((column) => {
    const rawValues = rows.map((row) => row[column]);

    const missingCount = rawValues.filter(isMissing).length;

    const availableValues = rawValues.filter((value) => !isMissing(value));

    const numericValues = availableValues
      .map(toFiniteNumber)
      .filter((value): value is number => value !== null);

    const numeric =
      availableValues.length > 0 &&
      numericValues.length === availableValues.length;

    if (!numeric) {
      return {
        column,
        numeric: false,
        missingCount,
        missingPercent: (missingCount / rows.length) * 100,
        mean: null,
        median: null,
        std: null,
        min: null,
        max: null,
        uniqueCount: new Set(availableValues.map(String)).size,
        constant: new Set(availableValues.map(String)).size <= 1,
      };
    }

    const valueMean = mean(numericValues);

    return {
      column,
      numeric: true,
      missingCount,
      missingPercent: (missingCount / rows.length) * 100,
      mean: valueMean,
      median: median(numericValues),
      std: std(numericValues, valueMean),
      min: numericValues.length ? Math.min(...numericValues) : null,
      max: numericValues.length ? Math.max(...numericValues) : null,
      uniqueCount: new Set(numericValues).size,
      constant: new Set(numericValues).size <= 1,
    };
  });
}

export function preprocessNumericDataset(
  rows: RawRow[],
  strategy: "drop" | "mean" | "median" = "median"
): PreprocessingResult {
  const columns = analyzeColumns(rows);

  const numericColumns = columns
    .filter((column) => column.numeric)
    .map((column) => column.column);

  const warnings: string[] = [];

  if (numericColumns.length < 2) {
    warnings.push(
      "The dataset needs at least two usable numeric columns for regression."
    );
  }

  columns
    .filter((column) => column.constant)
    .forEach((column) => {
      warnings.push(
        `${column.column} is constant and should not be used as a regression feature.`
      );
    });

  let removedRows = 0;

  const processedRows: NumericRow[] = [];

  rows.forEach((row) => {
    const result: NumericRow = {};
    let shouldDrop = false;

    numericColumns.forEach((columnName) => {
      const analysis = columns.find(
        (column) => column.column === columnName
      );

      const parsed = toFiniteNumber(row[columnName]);

      if (parsed !== null) {
        result[columnName] = parsed;
        return;
      }

      if (strategy === "drop") {
        shouldDrop = true;
        return;
      }

      if (strategy === "mean") {
        result[columnName] = analysis?.mean ?? 0;
        return;
      }

      result[columnName] = analysis?.median ?? 0;
    });

    if (shouldDrop) {
      removedRows += 1;
    } else {
      processedRows.push(result);
    }
  });

  return {
    rows: processedRows,
    columns,
    numericColumns,
    removedRows,
    warnings,
  };
}