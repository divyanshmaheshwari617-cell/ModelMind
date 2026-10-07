import type {
  ClassificationMetrics,
  ClassificationPrediction,
  ClassificationTestPrediction,
  DatasetSplit,
  DistanceMetric,
  FeatureScaler,
  KNNRow,
  Neighbor,
  RegressionMetrics,
  RegressionPrediction,
  RegressionTestPrediction,
  WeightingMethod,
} from "../types/knn";

const EPSILON = 1e-9;

export function mean(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const avg = mean(values);

  const variance =
    values.reduce((sum, value) => {
      const difference = value - avg;
      return sum + difference * difference;
    }, 0) / values.length;

  return Math.sqrt(variance);
}

export function getClasses(
  rows: KNNRow[],
): Array<string | number> {
  return Array.from(
    new Set(rows.map((row) => row.target)),
  );
}

export function createScalers(
  rows: KNNRow[],
): FeatureScaler[] {
  if (rows.length === 0) return [];

  const featureCount = rows[0].features.length;

  return Array.from(
    { length: featureCount },
    (_, featureIndex) => {
      const values = rows.map(
        (row) => row.features[featureIndex],
      );

      const avg = mean(values);
      const std = standardDeviation(values);

      return {
        mean: avg,
        std: std === 0 ? 1 : std,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    },
  );
}

export function standardizeFeatures(
  features: number[],
  scalers: FeatureScaler[],
): number[] {
  return features.map((value, index) => {
    const scaler = scalers[index];

    if (!scaler) return value;

    return (value - scaler.mean) / scaler.std;
  });
}

export function standardizeRows(
  rows: KNNRow[],
  scalers: FeatureScaler[],
): KNNRow[] {
  return rows.map((row) => ({
    ...row,
    features: standardizeFeatures(
      row.features,
      scalers,
    ),
  }));
}

export function euclideanDistance(
  first: number[],
  second: number[],
): number {
  const sum = first.reduce((total, value, index) => {
    const difference = value - second[index];

    return total + difference * difference;
  }, 0);

  return Math.sqrt(sum);
}

export function manhattanDistance(
  first: number[],
  second: number[],
): number {
  return first.reduce((total, value, index) => {
    return total + Math.abs(value - second[index]);
  }, 0);
}

export function minkowskiDistance(
  first: number[],
  second: number[],
  p = 3,
): number {
  const safeP = Math.max(1, p);

  const sum = first.reduce((total, value, index) => {
    return (
      total +
      Math.pow(
        Math.abs(value - second[index]),
        safeP,
      )
    );
  }, 0);

  return Math.pow(sum, 1 / safeP);
}

export function calculateDistance(
  first: number[],
  second: number[],
  metric: DistanceMetric,
  minkowskiP = 3,
): number {
  switch (metric) {
    case "manhattan":
      return manhattanDistance(first, second);

    case "minkowski":
      return minkowskiDistance(
        first,
        second,
        minkowskiP,
      );

    case "euclidean":
    default:
      return euclideanDistance(first, second);
  }
}

function calculateWeight(
  distance: number,
  weighting: WeightingMethod,
): number {
  if (weighting === "uniform") {
    return 1;
  }

  return 1 / Math.max(distance, EPSILON);
}

export function findNearestNeighbors(
  trainingRows: KNNRow[],
  queryFeatures: number[],
  k: number,
  metric: DistanceMetric,
  weighting: WeightingMethod,
  minkowskiP = 3,
): Neighbor[] {
  if (trainingRows.length === 0) {
    return [];
  }

  const safeK = Math.max(
    1,
    Math.min(
      Math.floor(k),
      trainingRows.length,
    ),
  );

  return trainingRows
    .map((row, index) => {
      const distance = calculateDistance(
        row.features,
        queryFeatures,
        metric,
        minkowskiP,
      );

      return {
        row,
        distance,
        index,
        rank: 0,
        weight: calculateWeight(
          distance,
          weighting,
        ),
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, safeK)
    .map((neighbor, index) => ({
      ...neighbor,
      rank: index + 1,
    }));
}

export function predictClassification(
  trainingRows: KNNRow[],
  queryFeatures: number[],
  k: number,
  metric: DistanceMetric,
  weighting: WeightingMethod,
  minkowskiP = 3,
): ClassificationPrediction {
  const neighbors = findNearestNeighbors(
    trainingRows,
    queryFeatures,
    k,
    metric,
    weighting,
    minkowskiP,
  );

  if (neighbors.length === 0) {
    throw new Error(
      "KNN classification requires training data.",
    );
  }

  const voteMap = new Map<
    string | number,
    {
      votes: number;
      weightedVotes: number;
      nearestDistance: number;
    }
  >();

  neighbors.forEach((neighbor) => {
    const classLabel = neighbor.row.target;

    const existing = voteMap.get(classLabel) ?? {
      votes: 0,
      weightedVotes: 0,
      nearestDistance: Number.POSITIVE_INFINITY,
    };

    existing.votes += 1;
    existing.weightedVotes += neighbor.weight;

    existing.nearestDistance = Math.min(
      existing.nearestDistance,
      neighbor.distance,
    );

    voteMap.set(classLabel, existing);
  });

  const totalWeightedVotes = Array.from(
    voteMap.values(),
  ).reduce(
    (sum, value) => sum + value.weightedVotes,
    0,
  );

  const votes = Array.from(
    voteMap.entries(),
  )
    .map(([classLabel, value]) => ({
      classLabel,
      votes: value.votes,
      weightedVotes: value.weightedVotes,
      percentage:
        weighting === "distance"
          ? totalWeightedVotes === 0
            ? 0
            : (value.weightedVotes /
                totalWeightedVotes) *
              100
          : (value.votes / neighbors.length) * 100,
      nearestDistance: value.nearestDistance,
    }))
    .sort((a, b) => {
      const firstScore =
        weighting === "distance"
          ? a.weightedVotes
          : a.votes;

      const secondScore =
        weighting === "distance"
          ? b.weightedVotes
          : b.votes;

      if (secondScore !== firstScore) {
        return secondScore - firstScore;
      }

      return (
        a.nearestDistance -
        b.nearestDistance
      );
    });

  return {
    predictedClass: votes[0].classLabel,
    neighbors,
    votes: votes.map(
      ({
        classLabel,
        votes,
        weightedVotes,
        percentage,
      }) => ({
        classLabel,
        votes,
        weightedVotes,
        percentage,
      }),
    ),
  };
}

export function predictRegression(
  trainingRows: KNNRow[],
  queryFeatures: number[],
  k: number,
  metric: DistanceMetric,
  weighting: WeightingMethod,
  minkowskiP = 3,
): RegressionPrediction {
  const neighbors = findNearestNeighbors(
    trainingRows,
    queryFeatures,
    k,
    metric,
    weighting,
    minkowskiP,
  );

  if (neighbors.length === 0) {
    throw new Error(
      "KNN regression requires training data.",
    );
  }

  const numericNeighbors = neighbors.filter(
    (neighbor) =>
      typeof neighbor.row.target === "number",
  );

  if (numericNeighbors.length !== neighbors.length) {
    throw new Error(
      "KNN regression requires a numeric target.",
    );
  }

  let predictedValue = 0;

  if (weighting === "uniform") {
    predictedValue = mean(
      numericNeighbors.map(
        (neighbor) =>
          neighbor.row.target as number,
      ),
    );
  } else {
    const totalWeight = numericNeighbors.reduce(
      (sum, neighbor) =>
        sum + neighbor.weight,
      0,
    );

    predictedValue =
      numericNeighbors.reduce(
        (sum, neighbor) =>
          sum +
          (neighbor.row.target as number) *
            neighbor.weight,
        0,
      ) / Math.max(totalWeight, EPSILON);
  }

  return {
    predictedValue,
    neighbors,
  };
}

/*
 * Deterministic shuffle
 *
 * Why deterministic?
 * ------------------
 * A normal random shuffle would produce a different train/test split
 * every time the page reloads.
 *
 * For an educational visualization lab we want:
 *
 * 1. shuffled data
 * 2. reproducible results
 * 3. stable metrics
 * 4. stable Optimal-K graphs
 *
 * This function therefore uses a small seeded pseudo-random generator.
 */
function deterministicShuffle<T>(
  values: T[],
  seed = 42,
): T[] {
  const shuffled = [
    ...values,
  ];

  let state =
    seed >>> 0;

  function random() {
    state =
      (
        Math.imul(
          state,
          1664525,
        ) +
        1013904223
      ) >>> 0;

    return (
      state /
      4294967296
    );
  }

  for (
    let i =
      shuffled.length - 1;
    i > 0;
    i -= 1
  ) {
    const j =
      Math.floor(
        random() *
          (i + 1),
      );

    [
      shuffled[i],
      shuffled[j],
    ] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}


/*
 * Classification split
 *
 * We use a STRATIFIED split:
 *
 * 1. separate rows by class
 * 2. shuffle each class deterministically
 * 3. place approximately trainRatio of each class in training
 * 4. place the remainder in testing
 *
 * This prevents a dataset ordered by class from producing
 * a misleading train/test split.
 */
export function splitClassificationDataset(
  rows: KNNRow[],
  trainRatio = 0.8,
): DatasetSplit {
  const ratio =
    Math.min(
      0.95,
      Math.max(
        0.5,
        trainRatio,
      ),
    );

  const classes =
    getClasses(rows);

  const train: KNNRow[] =
    [];

  const test: KNNRow[] =
    [];

  classes.forEach(
    (
      classLabel,
      classIndex,
    ) => {
      const classRows =
        rows.filter(
          (row) =>
            row.target ===
            classLabel,
        );

      /*
       * Use a different deterministic
       * seed for every class.
       */
      const shuffledClassRows =
        deterministicShuffle(
          classRows,
          42 +
            classIndex *
              997,
        );

      /*
       * If a class contains only one
       * example, we cannot place that
       * class in both train and test.
       *
       * Keep it in training so the KNN
       * model at least knows that class.
       */
      if (
        shuffledClassRows.length ===
        1
      ) {
        train.push(
          shuffledClassRows[0],
        );

        return;
      }

      const requestedTrainCount =
        Math.round(
          shuffledClassRows.length *
            ratio,
        );

      /*
       * Guarantee at least:
       *
       * 1 row in training
       * 1 row in testing
       *
       * whenever a class has >= 2 rows.
       */
      const trainCount =
        Math.max(
          1,
          Math.min(
            shuffledClassRows.length -
              1,
            requestedTrainCount,
          ),
        );

      train.push(
        ...shuffledClassRows.slice(
          0,
          trainCount,
        ),
      );

      test.push(
        ...shuffledClassRows.slice(
          trainCount,
        ),
      );
    },
  );

  /*
   * Shuffle the final train/test arrays
   * as well so they are not grouped by
   * class.
   */
  return {
    train:
      deterministicShuffle(
        train,
        2026,
      ),

    test:
      deterministicShuffle(
        test,
        2027,
      ),
  };
}


/*
 * Regression split
 *
 * Regression does not have classes to
 * stratify in the same way classification
 * does.
 *
 * The important thing is that we should
 * NOT simply take:
 *
 * first 75% -> train
 * last 25%  -> test
 *
 * because uploaded CSV files are often
 * sorted by target or another feature.
 *
 * Instead we deterministically shuffle
 * the rows first.
 */
export function splitRegressionDataset(
  rows: KNNRow[],
  trainRatio = 0.8,
): DatasetSplit {
  const ratio =
    Math.min(
      0.95,
      Math.max(
        0.5,
        trainRatio,
      ),
    );

  if (
    rows.length <= 1
  ) {
    return {
      train: [
        ...rows,
      ],

      test: [],
    };
  }

  const shuffledRows =
    deterministicShuffle(
      rows,
      42,
    );

  const trainCount =
    Math.max(
      1,
      Math.min(
        shuffledRows.length -
          1,
        Math.round(
          shuffledRows.length *
            ratio,
        ),
      ),
    );

  return {
    train:
      shuffledRows.slice(
        0,
        trainCount,
      ),

    test:
      shuffledRows.slice(
        trainCount,
      ),
  };
}

export function evaluateClassification(
  trainingRows: KNNRow[],
  testRows: KNNRow[],
  k: number,
  metric: DistanceMetric,
  weighting: WeightingMethod,
  minkowskiP = 3,
): {
  predictions: ClassificationTestPrediction[];
  metrics: ClassificationMetrics;
} {
  const predictions =
    testRows.map((row) => {
      const prediction =
        predictClassification(
          trainingRows,
          row.features,
          k,
          metric,
          weighting,
          minkowskiP,
        );

      return {
        actual: row.target,
        predicted:
          prediction.predictedClass,
      };
    });

  const classes = Array.from(
    new Set([
      ...trainingRows.map((row) => row.target),
      ...testRows.map((row) => row.target),
    ]),
  );

  const confusionMatrix = classes.map(() =>
    classes.map(() => 0),
  );

  predictions.forEach((prediction) => {
    const actualIndex = classes.indexOf(
      prediction.actual,
    );

    const predictedIndex = classes.indexOf(
      prediction.predicted,
    );

    if (
      actualIndex >= 0 &&
      predictedIndex >= 0
    ) {
      confusionMatrix[actualIndex][
        predictedIndex
      ] += 1;
    }
  });

  const correct = predictions.filter(
    (prediction) =>
      prediction.actual ===
      prediction.predicted,
  ).length;

  const accuracy =
    predictions.length === 0
      ? 0
      : correct / predictions.length;

  const perClass = classes.map(
    (classLabel, classIndex) => {
      const tp =
        confusionMatrix[classIndex][
          classIndex
        ];

      const fp = confusionMatrix.reduce(
        (sum, row, rowIndex) =>
          rowIndex === classIndex
            ? sum
            : sum + row[classIndex],
        0,
      );

      const fn = confusionMatrix[
        classIndex
      ].reduce(
        (sum, value, columnIndex) =>
          columnIndex === classIndex
            ? sum
            : sum + value,
        0,
      );

      const support = confusionMatrix[
        classIndex
      ].reduce(
        (sum, value) => sum + value,
        0,
      );

      const precision =
        tp + fp === 0
          ? 0
          : tp / (tp + fp);

      const recall =
        tp + fn === 0
          ? 0
          : tp / (tp + fn);

      const f1 =
        precision + recall === 0
          ? 0
          : (2 * precision * recall) /
            (precision + recall);

      return {
        classLabel,
        precision,
        recall,
        f1,
        support,
      };
    },
  );

  return {
    predictions,

    metrics: {
      accuracy,
      confusionMatrix,
      classes,
      perClass,

      macroPrecision: mean(
        perClass.map(
          (item) => item.precision,
        ),
      ),

      macroRecall: mean(
        perClass.map(
          (item) => item.recall,
        ),
      ),

      macroF1: mean(
        perClass.map((item) => item.f1),
      ),
    },
  };
}

export function evaluateRegression(
  trainingRows: KNNRow[],
  testRows: KNNRow[],
  k: number,
  metric: DistanceMetric,
  weighting: WeightingMethod,
  minkowskiP = 3,
): {
  predictions: RegressionTestPrediction[];
  metrics: RegressionMetrics;
} {
  const predictions =
    testRows.map((row) => {
      if (typeof row.target !== "number") {
        throw new Error(
          "Regression evaluation requires numeric targets.",
        );
      }

      const prediction =
        predictRegression(
          trainingRows,
          row.features,
          k,
          metric,
          weighting,
          minkowskiP,
        );

      return {
        actual: row.target,
        predicted:
          prediction.predictedValue,
      };
    });

  if (predictions.length === 0) {
    return {
      predictions: [],
      metrics: {
        mse: 0,
        rmse: 0,
        mae: 0,
        r2: 0,
      },
    };
  }

  const mse = mean(
    predictions.map((prediction) => {
      const error =
        prediction.actual -
        prediction.predicted;

      return error * error;
    }),
  );

  const mae = mean(
    predictions.map((prediction) =>
      Math.abs(
        prediction.actual -
          prediction.predicted,
      ),
    ),
  );

  const actualMean = mean(
    predictions.map(
      (prediction) => prediction.actual,
    ),
  );

  const ssResidual = predictions.reduce(
    (sum, prediction) => {
      const error =
        prediction.actual -
        prediction.predicted;

      return sum + error * error;
    },
    0,
  );

  const ssTotal = predictions.reduce(
    (sum, prediction) => {
      const difference =
        prediction.actual - actualMean;

      return (
        sum + difference * difference
      );
    },
    0,
  );

  const r2 =
    ssTotal === 0
      ? 0
      : 1 - ssResidual / ssTotal;

  return {
    predictions,

    metrics: {
      mse,
      rmse: Math.sqrt(mse),
      mae,
      r2,
    },
  };
}

export function findBestKClassification(
  trainingRows: KNNRow[],
  validationRows: KNNRow[],
  maxK: number,
  metric: DistanceMetric,
  weighting: WeightingMethod,
  minkowskiP = 3,
): Array<{
  k: number;
  score: number;
}> {
  const limit = Math.max(
    1,
    Math.min(
      Math.floor(maxK),
      trainingRows.length,
    ),
  );

  const results: Array<{
    k: number;
    score: number;
  }> = [];

  for (let k = 1; k <= limit; k += 1) {
    const evaluation =
      evaluateClassification(
        trainingRows,
        validationRows,
        k,
        metric,
        weighting,
        minkowskiP,
      );

    results.push({
      k,
      score:
        evaluation.metrics.accuracy,
    });
  }

  return results;
}

export function findBestKRegression(
  trainingRows: KNNRow[],
  validationRows: KNNRow[],
  maxK: number,
  metric: DistanceMetric,
  weighting: WeightingMethod,
  minkowskiP = 3,
): Array<{
  k: number;
  score: number;
}> {
  const limit = Math.max(
    1,
    Math.min(
      Math.floor(maxK),
      trainingRows.length,
    ),
  );

  const results: Array<{
    k: number;
    score: number;
  }> = [];

  for (let k = 1; k <= limit; k += 1) {
    const evaluation =
      evaluateRegression(
        trainingRows,
        validationRows,
        k,
        metric,
        weighting,
        minkowskiP,
      );

    results.push({
      k,
      score:
        evaluation.metrics.rmse,
    });
  }

  return results;
}