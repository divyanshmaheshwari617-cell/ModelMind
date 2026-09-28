import type {
  MultipleRegressionSuitabilityResult,
  NumericRow,
  SuitabilityMessage,
} from "./dataset";

import {
  calculateFeatureCorrelations,
  standardDeviation,
} from "../utils/regressionMath";

export function analyzeMultipleRegressionSuitability(
  rows: NumericRow[],
  featureNames: string[],
  targetName: string,
): MultipleRegressionSuitabilityResult {
  const messages: SuitabilityMessage[] = [];

  if (rows.length === 0) {
    return {
      level: "unsuitable",
      messages: [
        {
          type: "error",
          message: "The dataset contains no usable numerical rows.",
        },
      ],
    };
  }

  if (featureNames.length < 2) {
    messages.push({
      type: "error",
      message:
        "Select at least two input features for Multiple Linear Regression.",
    });
  }

  if (!targetName) {
    messages.push({
      type: "error",
      message: "Select one numerical target variable.",
    });
  }

  if (featureNames.includes(targetName)) {
    messages.push({
      type: "error",
      message:
        "The target variable cannot also be used as an input feature.",
    });
  }

  if (rows.length <= featureNames.length + 1) {
    messages.push({
      type: "error",
      message:
        "There are too few observations for the number of selected features.",
    });
  } else if (rows.length < (featureNames.length + 1) * 5) {
    messages.push({
      type: "warning",
      message:
        "The dataset is relatively small compared with the number of selected features. Results may be unstable.",
    });
  }

  for (const feature of featureNames) {
    const values = rows
      .map((row) => row[feature])
      .filter(Number.isFinite);

    if (values.length !== rows.length) {
      messages.push({
        type: "error",
        message: `"${feature}" contains missing or non-numerical values.`,
      });

      continue;
    }

    if (standardDeviation(values) === 0) {
      messages.push({
        type: "error",
        message: `"${feature}" is constant and cannot explain changes in the target.`,
      });
    }
  }

  if (targetName) {
    const targetValues = rows
      .map((row) => row[targetName])
      .filter(Number.isFinite);

    if (targetValues.length !== rows.length) {
      messages.push({
        type: "error",
        message: `"${targetName}" contains missing or non-numerical values.`,
      });
    } else if (standardDeviation(targetValues) === 0) {
      messages.push({
        type: "error",
        message: `The target "${targetName}" is constant. Regression requires a target that varies.`,
      });
    }

    const uniqueTargetValues = new Set(targetValues);

    if (
      targetValues.length > 0 &&
      uniqueTargetValues.size === 2 &&
      [...uniqueTargetValues].every(
        (value) => value === 0 || value === 1,
      )
    ) {
      messages.push({
        type: "warning",
        message:
          "The target contains only 0 and 1. This may represent a classification problem, where Logistic Regression is usually more appropriate.",
      });
    }
  }

  if (featureNames.length >= 2) {
    const correlations = calculateFeatureCorrelations(
      rows,
      featureNames,
    );

    for (const pair of correlations) {
      const absoluteCorrelation = Math.abs(pair.correlation);

      if (absoluteCorrelation >= 0.98) {
        messages.push({
          type: "warning",
          message: `"${pair.featureA}" and "${pair.featureB}" are extremely correlated (r = ${pair.correlation.toFixed(
            3,
          )}). This can cause severe multicollinearity.`,
        });
      } else if (absoluteCorrelation >= 0.85) {
        messages.push({
          type: "warning",
          message: `"${pair.featureA}" and "${pair.featureB}" are strongly correlated (r = ${pair.correlation.toFixed(
            3,
          )}). Check for multicollinearity.`,
        });
      }
    }
  }

  const hasError = messages.some(
    (message) => message.type === "error",
  );

  const hasWarning = messages.some(
    (message) => message.type === "warning",
  );

  if (!hasError && !hasWarning) {
    messages.push({
      type: "info",
      message:
        "The selected numerical features and target can be used to demonstrate Multiple Linear Regression.",
    });
  }

  return {
    level: hasError
      ? "unsuitable"
      : hasWarning
        ? "warning"
        : "suitable",
    messages,
  };
}