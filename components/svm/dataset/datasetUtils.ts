import type {
  ActiveSVMDataset,
  SVMRow,
  SVMTask,
} from "../types/svm";

import type {
  RawDatasetRow,
} from "./defaultDatasets";

export type ColumnType =
  | "numeric"
  | "categorical";

export type ColumnAnalysis = {
  name: string;
  type: ColumnType;
  missingCount: number;
  uniqueCount: number;
  minimum?: number;
  maximum?: number;
  mean?: number;
};

export function getColumns(
  rows: RawDatasetRow[]
) {
  if (rows.length === 0) {
    return [];
  }

  const columns = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach(
      (column) => {
        columns.add(column);
      }
    );
  });

  return Array.from(columns);
}

function isMissing(
  value: unknown
) {
  return (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  );
}

export function isNumericColumn(
  rows: RawDatasetRow[],
  column: string
) {
  const presentValues =
    rows
      .map((row) => row[column])
      .filter(
        (value) =>
          !isMissing(value)
      );

  if (
    presentValues.length === 0
  ) {
    return false;
  }

  return presentValues.every(
    (value) => {
      const number =
        Number(value);

      return Number.isFinite(
        number
      );
    }
  );
}

export function analyzeColumns(
  rows: RawDatasetRow[]
): ColumnAnalysis[] {
  return getColumns(rows).map(
    (column) => {
      const values =
        rows.map(
          (row) => row[column]
        );

      const missingCount =
        values.filter(
          isMissing
        ).length;

      const presentValues =
        values.filter(
          (value) =>
            !isMissing(value)
        );

      const uniqueCount =
        new Set(
          presentValues.map(
            String
          )
        ).size;

      const numeric =
        isNumericColumn(
          rows,
          column
        );

      if (!numeric) {
        return {
          name: column,
          type: "categorical",
          missingCount,
          uniqueCount,
        };
      }

      const numbers =
        presentValues.map(
          Number
        );

      const minimum =
        Math.min(...numbers);

      const maximum =
        Math.max(...numbers);

      const mean =
        numbers.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / numbers.length;

      return {
        name: column,
        type: "numeric",
        missingCount,
        uniqueCount,
        minimum,
        maximum,
        mean,
      };
    }
  );
}

export function getNumericColumns(
  rows: RawDatasetRow[]
) {
  return analyzeColumns(rows)
    .filter(
      (column) =>
        column.type ===
        "numeric"
    )
    .map(
      (column) =>
        column.name
    );
}

export function getCategoricalColumns(
  rows: RawDatasetRow[]
) {
  return analyzeColumns(rows)
    .filter(
      (column) =>
        column.type ===
        "categorical"
    )
    .map(
      (column) =>
        column.name
    );
}

function columnMean(
  rows: RawDatasetRow[],
  column: string
) {
  const numbers =
    rows
      .map((row) =>
        Number(row[column])
      )
      .filter(
        Number.isFinite
      );

  if (numbers.length === 0) {
    return 0;
  }

  return (
    numbers.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / numbers.length
  );
}

export function convertToSVMRows(
  rows: RawDatasetRow[],
  featureColumns: string[],
  targetColumn: string
): SVMRow[] {
  const means =
    Object.fromEntries(
      featureColumns.map(
        (column) => [
          column,
          columnMean(
            rows,
            column
          ),
        ]
      )
    );

  return rows
    .filter(
      (row) =>
        !isMissing(
          row[targetColumn]
        )
    )
    .map(
      (row, index) => {
        const features =
          featureColumns.map(
            (column) => {
              const value =
                Number(
                  row[column]
                );

              return Number.isFinite(
                value
              )
                ? value
                : means[column];
            }
          );

        return {
          id: `row-${index}`,
          features,
          target:
            row[targetColumn],
          original: {
            ...row,
          },
        };
      }
    );
}

export function createActiveDataset(
  name: string,
  rawRows: RawDatasetRow[],
  featureColumns: string[],
  targetColumn: string,
  task: SVMTask,
  scalingEnabled: boolean,
  source:
  | "builtin"
  | "uploaded"
  | "generated"
): ActiveSVMDataset {
  return {
    name,

    rows:
      convertToSVMRows(
        rawRows,
        featureColumns,
        targetColumn
      ),

    featureColumns,

    targetColumn,

    task,

    scalingEnabled,

    source,
  };
}

export function standardizeFeatures(
  rows: SVMRow[]
): SVMRow[] {
  if (rows.length === 0) {
    return [];
  }

  const stats =
    getFeatureScalingStats(
      rows
    );

  return rows.map(
    (row) => ({
      ...row,

      features:
        transformFeatureValues(
          row.features,
          stats
        ),
    })
  );
}
export type FeatureScalingStats = {
  means: number[];
  standardDeviations: number[];
};

export function getFeatureScalingStats(
  rows: SVMRow[]
): FeatureScalingStats {
  if (rows.length === 0) {
    return {
      means: [],
      standardDeviations: [],
    };
  }

  const featureCount =
    Math.max(
      ...rows.map(
        (row) =>
          row.features.length
      )
    );

  const means =
    Array.from(
      {
        length: featureCount,
      },
      (_, featureIndex) => {
        const values =
          rows
            .map(
              (row) =>
                row.features[
                  featureIndex
                ]
            )
            .filter(
              Number.isFinite
            );

        if (
          values.length === 0
        ) {
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
    );

  const standardDeviations =
    means.map(
      (
        mean,
        featureIndex
      ) => {
        const values =
          rows
            .map(
              (row) =>
                row.features[
                  featureIndex
                ]
            )
            .filter(
              Number.isFinite
            );

        if (
          values.length === 0
        ) {
          return 1;
        }

        const variance =
          values.reduce(
            (
              sum,
              value
            ) => {
              const difference =
                value - mean;

              return (
                sum +
                difference *
                  difference
              );
            },
            0
          ) / values.length;

        const standardDeviation =
          Math.sqrt(
            variance
          );

        return (
          standardDeviation ||
          1
        );
      }
    );

  return {
    means,
    standardDeviations,
  };
}

export function transformFeatureValues(
  values: number[],
  stats: FeatureScalingStats
): number[] {
  return values.map(
    (
      value,
      featureIndex
    ) => {
      const mean =
        stats.means[
          featureIndex
        ] ?? 0;

      const standardDeviation =
        stats.standardDeviations[
          featureIndex
        ] ?? 1;

      return (
        value - mean
      ) / standardDeviation;
    }
  );
}

export function inverseTransformFeatureValues(
  values: number[],
  stats: FeatureScalingStats
): number[] {
  return values.map(
    (
      value,
      featureIndex
    ) => {
      const mean =
        stats.means[
          featureIndex
        ] ?? 0;

      const standardDeviation =
        stats.standardDeviations[
          featureIndex
        ] ?? 1;

      return (
        value *
          standardDeviation +
        mean
      );
    }
  );
}

export function prepareVisualizationRows(
  rows: SVMRow[],
  scalingEnabled: boolean
): {
  rows: SVMRow[];
  stats: FeatureScalingStats;
} {
  const stats =
    getFeatureScalingStats(
      rows
    );

  if (!scalingEnabled) {
    return {
      rows,
      stats,
    };
  }

  return {
    rows:
      rows.map(
        (row) => ({
          ...row,

          features:
            transformFeatureValues(
              row.features,
              stats
            ),
        })
      ),

    stats,
  };
}

export function transformQueryForDataset(
  values: number[],
  rows: SVMRow[],
  scalingEnabled: boolean
): number[] {
  if (!scalingEnabled) {
    return [...values];
  }

  const stats =
    getFeatureScalingStats(
      rows
    );

  return transformFeatureValues(
    values,
    stats
  );
}

export function getTargetSummary(
  rows: RawDatasetRow[],
  targetColumn: string
) {
  const counts =
    new Map<string, number>();

  rows.forEach((row) => {
    const value =
      row[targetColumn];

    if (isMissing(value)) {
      return;
    }

    const key =
      String(value);

    counts.set(
      key,
      (counts.get(key) ?? 0) +
        1
    );
  });

  return Array.from(
    counts.entries()
  )
    .map(
      ([value, count]) => ({
        value,
        count,
      })
    )
    .sort(
      (a, b) =>
        b.count - a.count
    );
}