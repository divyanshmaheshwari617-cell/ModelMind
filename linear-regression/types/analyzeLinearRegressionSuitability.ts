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
  targetColumn: string,
  imputationMethod: "mean" | "median" | "knn" = "median"
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

  if (featureNumericRatio === 0 || numericFeatureCount < 2) {
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

  // Use observations with valid target values to
  // determine the available feature X values.
  // This visual lab does not have a train/test split.
  const eligibleRows = rows.filter(
    (row) => convertToNumber(row[targetColumn]) !== null
  );

  const observedX = eligibleRows
    .map((row) => convertToNumber(row[featureColumn]))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  const meanX = observedX.length
    ? observedX.reduce((sum, x) => sum + x, 0) /
      observedX.length
    : null;

  const middle = Math.floor(observedX.length / 2);

  const medianX = !observedX.length
    ? null
    : observedX.length % 2
      ? observedX[middle]
      : (observedX[middle - 1] + observedX[middle]) / 2;

  // KNN estimates X using other numeric columns.
  // Target Y is never used as a KNN predictor.
  const auxiliaries = Object.keys(rows[0] ?? {}).filter(
    (name) =>
      name !== featureColumn &&
      name !== targetColumn &&
      eligibleRows.filter(
        (row) => convertToNumber(row[name]) !== null
      ).length >= 3
  );

  const donors = eligibleRows.filter(
    (row) =>
      convertToNumber(row[featureColumn]) !== null
  );

  const predictMissingX = (
    row: DatasetRow
  ): number | null => {
    const neighbors = donors.flatMap((donor) => {
      let squaredDistance = 0;
      let compared = 0;

      for (const name of auxiliaries) {
        const a = convertToNumber(row[name]);
        const b = convertToNumber(donor[name]);

        if (a === null || b === null) continue;

        const values = eligibleRows
          .map((r) => convertToNumber(r[name]))
          .filter(
            (v): v is number => v !== null
          );

        const span =
          Math.max(...values) - Math.min(...values);

        const difference = (a - b) / (span || 1);

        squaredDistance += difference * difference;
        compared++;
      }

      const x = convertToNumber(
        donor[featureColumn]
      );

      return compared > 0 && x !== null
        ? [{
            x,
            distance: Math.sqrt(
              squaredDistance / compared
            ),
          }]
        : [];
    }).sort(
      (a, b) => a.distance - b.distance
    );

    if (neighbors.length < 2) return null;

    const closest = neighbors.slice(
      0,
      Math.min(3, neighbors.length)
    );

    const exact = closest.filter(
      (item) => item.distance === 0
    );

    if (exact.length) {
      return exact.reduce(
        (sum, item) => sum + item.x,
        0
      ) / exact.length;
    }

    const weights = closest.map(
      (item) =>
        1 / Math.max(item.distance, 1e-9)
    );

    const totalWeight = weights.reduce(
      (sum, weight) => sum + weight,
      0
    );

    const estimate = closest.reduce(
      (sum, item, index) =>
        sum + item.x * weights[index],
      0
    ) / totalWeight;

    return Number.isFinite(estimate)
      ? estimate
      : null;
  };

  const usableData: NumericDataPoint[] = [];
  let imputedFeatureRows = 0;

  for (const row of rows) {
    const y = convertToNumber(
      row[targetColumn]
    );

    if (y === null) continue;

    const originalX = convertToNumber(
      row[featureColumn]
    );

    let x = originalX;

    if (x === null) {
      x = imputationMethod === "mean"
        ? meanX
        : imputationMethod === "median"
          ? medianX
          : predictMissingX(row);

      if (x === null || !Number.isFinite(x)) {
        messages.push({
          type: "error",
          title: "Imputation unavailable",
          message:
            imputationMethod === "knn"
              ? "KNN cannot estimate all missing X values. " +
                "Provide other numeric feature columns " +
                "with comparable donor observations, " +
                "or choose Mean or Median."
              : "No valid numeric X values are " +
                "available for imputation.",
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

      imputedFeatureRows++;
    }

    usableData.push({ x, y });
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

  if (imputedFeatureRows > 0) {
    const description =
      imputationMethod === "mean"
        ? `mean (${meanX})`
        : imputationMethod === "median"
          ? `median (${medianX})`
          : "model-based KNN estimates";

    messages.push({
      type: "warning",
      title: "Missing feature values replaced",
      message:
        `${imputedFeatureRows} observation(s) had ` +
        "missing, infinite, or non-numeric X values. " +
        `Replaced using ${description}. ` +
        "Valid Y values were preserved.",
    });
  }

  if (removedRows > 0) {
    const removedPercent =
      (removedRows / rows.length) * 100;

    messages.push({
      type: "warning",
      title: "Rows with invalid targets excluded",
      message:
        `${removedRows} row(s) (${removedPercent.toFixed(
          1
        )}%) could not be used because their target Y ` +
        "was missing or non-numeric.",
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