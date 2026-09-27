import {
  DatasetRow,
  LinearRegressionSuitabilityResult,
  NumericDataPoint,
  SuitabilityMessage,
} from "./dataset";

function convertToNumber(
  value: string | number | null
): number | null {
  if (value === null) {
    return null;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed === "") {
      return null;
    }

    const converted = Number(trimmed);

    if (Number.isFinite(converted)) {
      return converted;
    }
  }

  return null;
}

function calculateCorrelation(
  data: NumericDataPoint[]
): number | null {
  if (data.length < 2) {
    return null;
  }

  const meanX =
    data.reduce(
      (sum, point) => sum + point.x,
      0
    ) / data.length;

  const meanY =
    data.reduce(
      (sum, point) => sum + point.y,
      0
    ) / data.length;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (const point of data) {
    const dx = point.x - meanX;
    const dy = point.y - meanY;

    numerator += dx * dy;
    denominatorX += dx * dx;
    denominatorY += dy * dy;
  }

  const denominator = Math.sqrt(
    denominatorX * denominatorY
  );

  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function countUnique(
  values: Array<string | number | null>
) {
  return new Set(
    values
      .filter(
        (value) =>
          value !== null &&
          String(value).trim() !== ""
      )
      .map((value) =>
        String(value).trim().toLowerCase()
      )
  ).size;
}

export function analyzeLinearRegressionSuitability(
  rows: DatasetRow[],
  featureColumn: string,
  targetColumn: string
): LinearRegressionSuitabilityResult {
  const messages: SuitabilityMessage[] = [];

  if (featureColumn === targetColumn) {
    return {
      status: "not-suitable",
      usableData: [],
      totalRows: rows.length,
      usableRows: 0,
      removedRows: rows.length,
      correlation: null,
      messages: [
        {
          type: "error",
          title: "Feature and target are the same",
          message:
            "Choose different columns for X and Y.",
        },
      ],
    };
  }

  const rawFeatureValues = rows.map(
    (row) => row[featureColumn]
  );

  const rawTargetValues = rows.map(
    (row) => row[targetColumn]
  );

  const numericTargetCount =
    rawTargetValues.filter(
      (value) =>
        convertToNumber(value) !== null
    ).length;

  const numericFeatureCount =
    rawFeatureValues.filter(
      (value) =>
        convertToNumber(value) !== null
    ).length;

  const targetNumericRatio =
    rows.length === 0
      ? 0
      : numericTargetCount / rows.length;

  const featureNumericRatio =
    rows.length === 0
      ? 0
      : numericFeatureCount / rows.length;

  const targetUniqueCount =
    countUnique(rawTargetValues);

  /*
   * HARD TARGET CHECK
   *
   * Ordinary Linear Regression needs a numerical
   * target for this learning lab.
   */

  if (targetNumericRatio < 0.8) {
    messages.push({
      type: "error",
      title: "Target is not continuous numerical data",
      message:
        `The selected target "${targetColumn}" contains mostly ` +
        "non-numeric values. Ordinary Linear Regression is not " +
        "appropriate for a categorical target. If the target " +
        "represents classes, explore a classification model such " +
        "as Logistic Regression instead.",
    });

    return {
      status: "not-suitable",
      usableData: [],
      totalRows: rows.length,
      usableRows: 0,
      removedRows: rows.length,
      correlation: null,
      messages,
    };
  }

  /*
   * A numeric-looking target with only two distinct values
   * often represents binary classes such as 0 and 1.
   */

  if (
    targetUniqueCount === 2 &&
    rows.length >= 4
  ) {
    messages.push({
      type: "error",
      title: "Target appears to be binary",
      message:
        `The target "${targetColumn}" has only two distinct values. ` +
        "It may represent a binary classification problem rather " +
        "than a continuous regression target. Logistic Regression " +
        "is usually the model family to investigate for a binary target.",
    });

    return {
      status: "not-suitable",
      usableData: [],
      totalRows: rows.length,
      usableRows: 0,
      removedRows: rows.length,
      correlation: null,
      messages,
    };
  }

  if (featureNumericRatio < 0.8) {
    messages.push({
      type: "error",
      title: "Selected feature is not numerical",
      message:
        `The selected feature "${featureColumn}" contains mostly ` +
        "non-numeric values. This one-feature visual Linear " +
        "Regression lab currently requires a numerical X feature.",
    });

    return {
      status: "not-suitable",
      usableData: [],
      totalRows: rows.length,
      usableRows: 0,
      removedRows: rows.length,
      correlation: null,
      messages,
    };
  }

  /*
   * BUILD CLEAN X/Y PAIRS
   */

  const usableData: NumericDataPoint[] = [];

  for (const row of rows) {
    const x = convertToNumber(
      row[featureColumn]
    );

    const y = convertToNumber(
      row[targetColumn]
    );

    if (x !== null && y !== null) {
      usableData.push({
        x,
        y,
      });
    }
  }

  const removedRows =
    rows.length - usableData.length;

  if (usableData.length < 3) {
    messages.push({
      type: "error",
      title: "Not enough usable observations",
      message:
        "At least three valid numerical X/Y observations are " +
        "required for this Linear Regression learning lab.",
    });

    return {
      status: "not-suitable",
      usableData,
      totalRows: rows.length,
      usableRows: usableData.length,
      removedRows,
      correlation: null,
      messages,
    };
  }

  const uniqueX = new Set(
    usableData.map((point) => point.x)
  );

  if (uniqueX.size < 2) {
    messages.push({
      type: "error",
      title: "Feature has no useful variation",
      message:
        `The selected feature "${featureColumn}" does not contain ` +
        "enough distinct numerical values to estimate a regression slope.",
    });

    return {
      status: "not-suitable",
      usableData,
      totalRows: rows.length,
      usableRows: usableData.length,
      removedRows,
      correlation: null,
      messages,
    };
  }

  /*
   * WARNINGS
   */

  if (removedRows > 0) {
    const removedPercent =
      (removedRows / rows.length) * 100;

    messages.push({
      type: "warning",
      title: "Some rows cannot be used",
      message:
        `${removedRows} row(s) (${removedPercent.toFixed(
          1
        )}%) contain missing or non-numeric X/Y values and ` +
        "would be excluded from this visualization.",
    });
  }

  const correlation =
    calculateCorrelation(usableData);

  if (correlation === null) {
    messages.push({
      type: "warning",
      title: "Correlation could not be estimated",
      message:
        "The selected values do not contain enough variation to " +
        "calculate a meaningful Pearson correlation.",
    });
  } else {
    const absoluteCorrelation =
      Math.abs(correlation);

    if (absoluteCorrelation < 0.3) {
      messages.push({
        type: "warning",
        title: "Weak linear association",
        message:
          `Pearson correlation is ${correlation.toFixed(
            3
          )}. The selected X and Y show little linear association. ` +
          "A straight-line model may have limited predictive value. " +
          "Inspect the graph and consider other relationships or models.",
      });
    } else {
      messages.push({
        type: "success",
        title: "Linear association detected",
        message:
          `Pearson correlation is ${correlation.toFixed(
            3
          )}. This supports exploring a straight-line relationship, ` +
          "although correlation alone does not prove that Linear " +
          "Regression is the best model.",
      });
    }
  }

  /*
   * SIMPLE OUTLIER SCREEN USING IQR
   */

  const yValues = usableData
    .map((point) => point.y)
    .sort((a, b) => a - b);

  const percentile = (
    values: number[],
    p: number
  ) => {
    const index =
      (values.length - 1) * p;

    const lower =
      Math.floor(index);

    const upper =
      Math.ceil(index);

    if (lower === upper) {
      return values[lower];
    }

    const weight =
      index - lower;

    return (
      values[lower] *
        (1 - weight) +
      values[upper] *
        weight
    );
  };

  const q1 =
    percentile(yValues, 0.25);

  const q3 =
    percentile(yValues, 0.75);

  const iqr = q3 - q1;

  if (iqr > 0) {
    const lowerBound =
      q1 - 1.5 * iqr;

    const upperBound =
      q3 + 1.5 * iqr;

    const outlierCount =
      usableData.filter(
        (point) =>
          point.y < lowerBound ||
          point.y > upperBound
      ).length;

    if (outlierCount > 0) {
      messages.push({
        type: "warning",
        title: "Potential target outliers detected",
        message:
          `${outlierCount} observation(s) fall outside the usual ` +
          "1.5×IQR range for the target. Outliers can strongly " +
          "influence an Ordinary Least Squares regression line.",
      });
    }
  }

  const hasWarning =
    messages.some(
      (message) =>
        message.type === "warning"
    );

  if (!hasWarning) {
    messages.push({
      type: "success",
      title: "No obvious compatibility problem detected",
      message:
        "The selected columns can be explored with this Linear " +
        "Regression lab. Model performance and residual behavior " +
        "should still be evaluated before drawing conclusions.",
    });
  }

  return {
    status: hasWarning
      ? "warning"
      : "suitable",

    usableData,

    totalRows: rows.length,
    usableRows: usableData.length,
    removedRows,

    correlation,

    messages,
  };
}