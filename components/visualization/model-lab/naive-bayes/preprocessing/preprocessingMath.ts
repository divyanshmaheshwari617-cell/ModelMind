import type {
  NBRow,
  NBValue,
  NaiveBayesVariant,
} from "../types/naiveBayes";

export type FeatureKind =
  | "continuous"
  | "count"
  | "binary"
  | "categorical"
  | "unknown";

export type MissingFeatureInfo = {
  feature: string;
  missingCount: number;
  missingPercentage: number;
  numericValues: number[];
  mean: number | null;
  median: number | null;
  mode: NBValue;
};

export type ImputationStrategy =
  | "mean"
  | "median"
  | "mode"
  | "zero";

function isMissing(value: NBValue): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" &&
      value.trim() === "")
  );
}

function toNumber(value: NBValue): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function calculateMean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function calculateMedian(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return (
    (sorted[middle - 1] + sorted[middle]) /
    2
  );
}

function calculateMode(values: NBValue[]): NBValue {
  const validValues = values.filter(
    (value) => !isMissing(value)
  );

  if (validValues.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();

  validValues.forEach((value) => {
    const key = String(value);

    counts.set(
      key,
      (counts.get(key) ?? 0) + 1
    );
  });

  let bestKey = String(validValues[0]);
  let bestCount = 0;

  counts.forEach((count, key) => {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  });

  const original = validValues.find(
    (value) => String(value) === bestKey
  );

  return original ?? null;
}

export function analyzeMissingValues(
  rows: NBRow[],
  features: string[]
): MissingFeatureInfo[] {
  return features.map((feature) => {
    const rawValues = rows.map(
      (row) => row.features[feature]
    );

    const missingCount = rawValues.filter(
      isMissing
    ).length;

    const numericValues = rawValues
      .map(toNumber)
      .filter(
        (value): value is number =>
          value !== null
      );

    return {
      feature,

      missingCount,

      missingPercentage:
        rows.length === 0
          ? 0
          : (missingCount / rows.length) * 100,

      numericValues,

      mean: calculateMean(numericValues),

      median: calculateMedian(numericValues),

      mode: calculateMode(rawValues),
    };
  });
}

export function applyImputation(
  rows: NBRow[],
  feature: string,
  strategy: ImputationStrategy
): NBRow[] {
  const analysis = analyzeMissingValues(
    rows,
    [feature]
  )[0];

  if (!analysis) {
    return rows;
  }

  let replacement: NBValue = null;

  if (strategy === "mean") {
    replacement = analysis.mean;
  }

  if (strategy === "median") {
    replacement = analysis.median;
  }

  if (strategy === "mode") {
    replacement = analysis.mode;
  }

  if (strategy === "zero") {
    replacement = 0;
  }

  if (replacement === null) {
    return rows;
  }

  return rows.map((row) => {
    const current = row.features[feature];

    if (!isMissing(current)) {
      return row;
    }

    return {
      ...row,

      features: {
        ...row.features,
        [feature]: replacement,
      },
    };
  });
}

export function detectFeatureKind(
  rows: NBRow[],
  feature: string
): FeatureKind {
  const values = rows
    .map((row) => row.features[feature])
    .filter((value) => !isMissing(value));

  if (values.length === 0) {
    return "unknown";
  }

  const numericValues = values
    .map(toNumber)
    .filter(
      (value): value is number =>
        value !== null
    );

  if (numericValues.length !== values.length) {
    return "categorical";
  }

  const unique = new Set(numericValues);

  const isBinary = numericValues.every(
    (value) => value === 0 || value === 1
  );

  if (isBinary) {
    return "binary";
  }

  const isCount = numericValues.every(
    (value) =>
      value >= 0 &&
      Number.isInteger(value)
  );

  if (isCount && unique.size > 2) {
    return "count";
  }

  return "continuous";
}

export function detectAllFeatureKinds(
  rows: NBRow[],
  features: string[]
): Record<string, FeatureKind> {
  const result: Record<string, FeatureKind> = {};

  features.forEach((feature) => {
    result[feature] = detectFeatureKind(
      rows,
      feature
    );
  });

  return result;
}

export function recommendVariant(
  rows: NBRow[],
  features: string[]
): {
  variant: NaiveBayesVariant;
  reason: string;
} {
  const kinds = Object.values(
    detectAllFeatureKinds(rows, features)
  );

  if (
    kinds.length > 0 &&
    kinds.every((kind) => kind === "binary")
  ) {
    return {
      variant: "bernoulli",
      reason:
        "All selected features are binary (0/1), which matches Bernoulli Naive Bayes.",
    };
  }

  if (
    kinds.length > 0 &&
    kinds.every(
      (kind) =>
        kind === "count" ||
        kind === "binary"
    )
  ) {
    return {
      variant: "multinomial",
      reason:
        "The selected features are non-negative counts/binary frequencies, which fit Multinomial Naive Bayes.",
    };
  }

  return {
    variant: "gaussian",
    reason:
      "The selected features contain continuous numerical values, so Gaussian Naive Bayes is the natural starting point.",
  };
}

export function validateVariantSuitability(
  rows: NBRow[],
  features: string[],
  variant: NaiveBayesVariant
): string[] {
  const warnings: string[] = [];

  const kinds = detectAllFeatureKinds(
    rows,
    features
  );

  const missing = analyzeMissingValues(
    rows,
    features
  );

  missing.forEach((item) => {
    if (item.missingCount > 0) {
      warnings.push(
        `${item.feature} contains ${item.missingCount} missing value(s). Handle them before training.`
      );
    }
  });

  if (variant === "gaussian") {
    Object.entries(kinds).forEach(
      ([feature, kind]) => {
        if (
          kind === "categorical" ||
          kind === "unknown"
        ) {
          warnings.push(
            `${feature} is not a usable continuous numeric feature for Gaussian Naive Bayes.`
          );
        }
      }
    );
  }

  if (variant === "multinomial") {
    Object.entries(kinds).forEach(
      ([feature, kind]) => {
        if (
          kind === "continuous" ||
          kind === "categorical" ||
          kind === "unknown"
        ) {
          warnings.push(
            `${feature} is ${kind}. Multinomial Naive Bayes expects non-negative count/frequency-style features.`
          );
        }

        const hasNegative = rows.some((row) => {
          const value = toNumber(
            row.features[feature]
          );

          return value !== null && value < 0;
        });

        if (hasNegative) {
          warnings.push(
            `${feature} contains negative values, which are not suitable for Multinomial Naive Bayes.`
          );
        }
      }
    );
  }

  if (variant === "bernoulli") {
    Object.entries(kinds).forEach(
      ([feature, kind]) => {
        if (kind !== "binary") {
          warnings.push(
            `${feature} is ${kind}. Bernoulli Naive Bayes is designed for binary 0/1 features.`
          );
        }
      }
    );
  }

  return warnings;
}