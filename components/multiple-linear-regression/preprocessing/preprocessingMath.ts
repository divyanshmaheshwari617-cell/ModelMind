export type MissingValueStrategy =
  | "mean"
  | "median"
  | "most_frequent"
  | "drop_rows"
  | "keep";

export type ColumnKind =
  | "numeric"
  | "categorical";

export type MissingSeverity =
  | "none"
  | "low"
  | "moderate"
  | "high"
  | "very_high";

export type SkewnessLevel =
  | "approximately_symmetric"
  | "moderately_skewed"
  | "highly_skewed"
  | "not_applicable";

export interface RawDatasetRow {
  [column: string]: string;
}

export interface ColumnPreprocessingAnalysis {
  column: string;

  kind: ColumnKind;

  totalRows: number;
  missingCount: number;
  missingPercentage: number;
  missingSeverity: MissingSeverity;

  nonMissingCount: number;
  uniqueCount: number;

  mean: number | null;
  median: number | null;
  mode: string | number | null;

  standardDeviation: number | null;
  skewness: number | null;
  skewnessLevel: SkewnessLevel;

  recommendedStrategy: MissingValueStrategy | null;
  recommendationReason: string;

  warning: string | null;
}

export interface DatasetPreprocessingAnalysis {
  totalRows: number;
  totalColumns: number;

  totalMissingCells: number;
  columnsWithMissingValues: number;

  analyses: ColumnPreprocessingAnalysis[];
}

export interface ImputationResult {
  rows: RawDatasetRow[];

  column: string;
  strategy: MissingValueStrategy;

  beforeMissingCount: number;
  afterMissingCount: number;

  fillValue: string | number | null;

  removedRows: number;
}

/*
|--------------------------------------------------------------------------
| Missing-value detection
|--------------------------------------------------------------------------
*/

export function isMissingValue(
  value: unknown,
): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  const text = String(value).trim();

  if (text === "") {
    return true;
  }

  const normalized = text.toLowerCase();

  return (
    normalized === "na" ||
    normalized === "n/a" ||
    normalized === "nan" ||
    normalized === "null" ||
    normalized === "none" ||
    normalized === "missing"
  );
}

/*
|--------------------------------------------------------------------------
| Numeric detection
|--------------------------------------------------------------------------
*/

export function isNumericValue(
  value: unknown,
): boolean {
  if (isMissingValue(value)) {
    return false;
  }

  const numberValue = Number(String(value).trim());

  return Number.isFinite(numberValue);
}

export function detectColumnKind(
  values: unknown[],
): ColumnKind {
  const availableValues = values.filter(
    (value) => !isMissingValue(value),
  );

  if (availableValues.length === 0) {
    return "categorical";
  }

  const numericCount = availableValues.filter(
    isNumericValue,
  ).length;

  /*
   * A column is considered numeric only when all
   * available values can safely be converted to numbers.
   */
  return numericCount === availableValues.length
    ? "numeric"
    : "categorical";
}

/*
|--------------------------------------------------------------------------
| Basic statistics
|--------------------------------------------------------------------------
*/

export function calculateMean(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0,
    ) / values.length
  );
}

export function calculateMedian(
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

export function calculateMode(
  values: Array<string | number>,
): string | number | null {
  if (values.length === 0) {
    return null;
  }

  const counts = new Map<
    string,
    {
      count: number;
      originalValue: string | number;
    }
  >();

  for (const value of values) {
    const key = String(value);

    const current = counts.get(key);

    if (current) {
      current.count++;
    } else {
      counts.set(key, {
        count: 1,
        originalValue: value,
      });
    }
  }

  let best:
    | {
        count: number;
        originalValue: string | number;
      }
    | null = null;

  for (const item of counts.values()) {
    if (
      best === null ||
      item.count > best.count
    ) {
      best = item;
    }
  }

  return best?.originalValue ?? null;
}

export function calculateStandardDeviation(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = calculateMean(values);

  const variance =
    values.reduce(
      (total, value) =>
        total +
        Math.pow(value - mean, 2),
      0,
    ) / values.length;

  return Math.sqrt(variance);
}

/*
|--------------------------------------------------------------------------
| Skewness
|--------------------------------------------------------------------------
|
| We use the adjusted Fisher-Pearson sample skewness.
|
| Interpretation used by ModelMind:
|
| |skew| < 0.5
|     approximately symmetric
|
| 0.5 <= |skew| < 1
|     moderately skewed
|
| |skew| >= 1
|     highly skewed
|
*/

export function calculateSkewness(
  values: number[],
): number {
  const n = values.length;

  if (n < 3) {
    return 0;
  }

  const mean = calculateMean(values);

  const standardDeviation =
    calculateStandardDeviation(values);

  if (standardDeviation === 0) {
    return 0;
  }

  let standardizedCubeSum = 0;

  for (const value of values) {
    standardizedCubeSum += Math.pow(
      (value - mean) /
        standardDeviation,
      3,
    );
  }

  const populationSkew =
    standardizedCubeSum / n;

  /*
   * Small-sample adjustment.
   */
  return (
    (Math.sqrt(n * (n - 1)) /
      (n - 2)) *
    populationSkew
  );
}

export function classifySkewness(
  skewness: number,
): SkewnessLevel {
  const absolute =
    Math.abs(skewness);

  if (absolute < 0.5) {
    return "approximately_symmetric";
  }

  if (absolute < 1) {
    return "moderately_skewed";
  }

  return "highly_skewed";
}

/*
|--------------------------------------------------------------------------
| Missing-value severity
|--------------------------------------------------------------------------
*/

export function classifyMissingSeverity(
  percentage: number,
): MissingSeverity {
  if (percentage === 0) {
    return "none";
  }

  if (percentage <= 5) {
    return "low";
  }

  if (percentage <= 20) {
    return "moderate";
  }

  if (percentage <= 40) {
    return "high";
  }

  return "very_high";
}

/*
|--------------------------------------------------------------------------
| Recommendation engine
|--------------------------------------------------------------------------
*/

function recommendNumericStrategy(
  missingPercentage: number,
  skewness: number,
): {
  strategy: MissingValueStrategy;
  reason: string;
} {
  /*
   * Very large amounts of missing data deserve
   * investigation instead of blindly filling them.
   */
  if (missingPercentage > 40) {
    return {
      strategy: "median",
      reason:
        "The feature has a very high amount of missing data. Median is shown as a robust imputation option, but you should first investigate whether this feature should be retained at all.",
    };
  }

  const absoluteSkewness =
    Math.abs(skewness);

  if (absoluteSkewness >= 0.5) {
    return {
      strategy: "median",
      reason:
        "The numerical distribution is skewed. Median is less affected by extreme values than mean.",
    };
  }

  return {
    strategy: "mean",
    reason:
      "The numerical distribution is reasonably symmetric, so mean imputation is a simple educational choice.",
  };
}

function recommendCategoricalStrategy(
  missingPercentage: number,
): {
  strategy: MissingValueStrategy;
  reason: string;
} {
  if (missingPercentage > 40) {
    return {
      strategy: "most_frequent",
      reason:
        "The column has a very high amount of missing data. Mode imputation is available, but the feature should be investigated before relying on it.",
    };
  }

  return {
    strategy: "most_frequent",
    reason:
      "This is a categorical column, so the most frequent category is a simple imputation option.",
  };
}

/*
|--------------------------------------------------------------------------
| Analyze one column
|--------------------------------------------------------------------------
*/

export function analyzeColumn(
  rows: RawDatasetRow[],
  column: string,
): ColumnPreprocessingAnalysis {
  const values = rows.map(
    (row) => row[column],
  );

  const totalRows = rows.length;

  const missingCount =
    values.filter(
      isMissingValue,
    ).length;

  const missingPercentage =
    totalRows === 0
      ? 0
      : (missingCount / totalRows) * 100;

  const availableValues =
    values.filter(
      (value) =>
        !isMissingValue(value),
    );

  const kind =
    detectColumnKind(values);

  const uniqueCount =
    new Set(
      availableValues.map(
        (value) =>
          String(value).trim(),
      ),
    ).size;

  if (kind === "numeric") {
    const numericValues =
      availableValues
        .map((value) =>
          Number(
            String(value).trim(),
          ),
        )
        .filter(Number.isFinite);

    const mean =
      numericValues.length > 0
        ? calculateMean(
            numericValues,
          )
        : null;

    const median =
      numericValues.length > 0
        ? calculateMedian(
            numericValues,
          )
        : null;

    const mode =
      calculateMode(
        numericValues,
      );

    const standardDeviation =
      numericValues.length > 0
        ? calculateStandardDeviation(
            numericValues,
          )
        : null;

    const skewness =
      numericValues.length >= 3
        ? calculateSkewness(
            numericValues,
          )
        : 0;

    const skewnessLevel =
      classifySkewness(
        skewness,
      );

    const recommendation =
      missingCount > 0
        ? recommendNumericStrategy(
            missingPercentage,
            skewness,
          )
        : null;

    return {
      column,
      kind,

      totalRows,
      missingCount,
      missingPercentage,
      missingSeverity:
        classifyMissingSeverity(
          missingPercentage,
        ),

      nonMissingCount:
        availableValues.length,

      uniqueCount,

      mean,
      median,
      mode,

      standardDeviation,
      skewness,
      skewnessLevel,

      recommendedStrategy:
        recommendation?.strategy ??
        null,

      recommendationReason:
        recommendation?.reason ??
        "No missing values were detected in this column.",

      warning:
        missingPercentage > 40
          ? "More than 40% of this column is missing. Imputation may substantially change the feature."
          : null,
    };
  }

  const mode =
    calculateMode(
      availableValues.map(
        (value) =>
          String(value).trim(),
      ),
    );

  const recommendation =
    missingCount > 0
      ? recommendCategoricalStrategy(
          missingPercentage,
        )
      : null;

  return {
    column,
    kind,

    totalRows,
    missingCount,
    missingPercentage,
    missingSeverity:
      classifyMissingSeverity(
        missingPercentage,
      ),

    nonMissingCount:
      availableValues.length,

    uniqueCount,

    mean: null,
    median: null,
    mode,

    standardDeviation: null,
    skewness: null,
    skewnessLevel:
      "not_applicable",

    recommendedStrategy:
      recommendation?.strategy ??
      null,

    recommendationReason:
      recommendation?.reason ??
      "No missing values were detected in this column.",

    warning:
      missingPercentage > 40
        ? "More than 40% of this column is missing. Consider whether this feature contains enough information to keep."
        : null,
  };
}

/*
|--------------------------------------------------------------------------
| Analyze complete dataset
|--------------------------------------------------------------------------
*/

export function analyzeDatasetPreprocessing(
  rows: RawDatasetRow[],
  columns: string[],
): DatasetPreprocessingAnalysis {
  const analyses =
    columns.map((column) =>
      analyzeColumn(
        rows,
        column,
      ),
    );

  const totalMissingCells =
    analyses.reduce(
      (total, analysis) =>
        total +
        analysis.missingCount,
      0,
    );

  const columnsWithMissingValues =
    analyses.filter(
      (analysis) =>
        analysis.missingCount > 0,
    ).length;

  return {
    totalRows: rows.length,
    totalColumns:
      columns.length,

    totalMissingCells,
    columnsWithMissingValues,

    analyses,
  };
}

/*
|--------------------------------------------------------------------------
| Apply missing-value strategy
|--------------------------------------------------------------------------
|
| This function never changes the original rows.
|
*/

export function applyMissingValueStrategy(
  rows: RawDatasetRow[],
  column: string,
  strategy: MissingValueStrategy,
): ImputationResult {
  const copiedRows =
    rows.map((row) => ({
      ...row,
    }));

  const analysis =
    analyzeColumn(
      copiedRows,
      column,
    );

  const beforeMissingCount =
    analysis.missingCount;

  if (
    beforeMissingCount === 0
  ) {
    return {
      rows: copiedRows,
      column,
      strategy,
      beforeMissingCount: 0,
      afterMissingCount: 0,
      fillValue: null,
      removedRows: 0,
    };
  }

  /*
   * Keep missing values unchanged.
   */
  if (strategy === "keep") {
    return {
      rows: copiedRows,
      column,
      strategy,
      beforeMissingCount,
      afterMissingCount:
        beforeMissingCount,
      fillValue: null,
      removedRows: 0,
    };
  }

  /*
   * Remove rows containing missing values
   * in this specific column.
   */
  if (strategy === "drop_rows") {
    const filteredRows =
      copiedRows.filter(
        (row) =>
          !isMissingValue(
            row[column],
          ),
      );

    return {
      rows: filteredRows,
      column,
      strategy,
      beforeMissingCount,
      afterMissingCount: 0,
      fillValue: null,
      removedRows:
        copiedRows.length -
        filteredRows.length,
    };
  }

  let fillValue:
    | string
    | number
    | null = null;

  if (strategy === "mean") {
    if (
      analysis.kind !==
        "numeric" ||
      analysis.mean === null
    ) {
      throw new Error(
        `Mean imputation cannot be applied to "${column}".`,
      );
    }

    fillValue =
      analysis.mean;
  }

  if (strategy === "median") {
    if (
      analysis.kind !==
        "numeric" ||
      analysis.median === null
    ) {
      throw new Error(
        `Median imputation cannot be applied to "${column}".`,
      );
    }

    fillValue =
      analysis.median;
  }

  if (
    strategy ===
    "most_frequent"
  ) {
    if (
      analysis.mode === null
    ) {
      throw new Error(
        `Most-frequent imputation cannot be applied to "${column}".`,
      );
    }

    fillValue =
      analysis.mode;
  }

  if (fillValue === null) {
    throw new Error(
      `Unable to determine a fill value for "${column}".`,
    );
  }

  const updatedRows =
    copiedRows.map((row) => {
      if (
        !isMissingValue(
          row[column],
        )
      ) {
        return row;
      }

      return {
        ...row,
        [column]:
          String(fillValue),
      };
    });

  const afterMissingCount =
    updatedRows.filter(
      (row) =>
        isMissingValue(
          row[column],
        ),
    ).length;

  return {
    rows: updatedRows,
    column,
    strategy,
    beforeMissingCount,
    afterMissingCount,
    fillValue,
    removedRows: 0,
  };
}

/*
|--------------------------------------------------------------------------
| Human-readable helpers
|--------------------------------------------------------------------------
*/

export function strategyLabel(
  strategy: MissingValueStrategy,
): string {
  switch (strategy) {
    case "mean":
      return "Mean";

    case "median":
      return "Median";

    case "most_frequent":
      return "Most Frequent";

    case "drop_rows":
      return "Drop Rows";

    case "keep":
      return "Keep Missing";
  }
}

export function skewnessLabel(
  level: SkewnessLevel,
): string {
  switch (level) {
    case "approximately_symmetric":
      return "Approximately symmetric";

    case "moderately_skewed":
      return "Moderately skewed";

    case "highly_skewed":
      return "Highly skewed";

    case "not_applicable":
      return "Not applicable";
  }
}

export function missingSeverityLabel(
  severity: MissingSeverity,
): string {
  switch (severity) {
    case "none":
      return "No missing values";

    case "low":
      return "Low";

    case "moderate":
      return "Moderate";

    case "high":
      return "High";

    case "very_high":
      return "Very high";
  }
}