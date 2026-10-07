export type KNNTask = "classification" | "regression";

export type DistanceMetric =
  | "euclidean"
  | "manhattan"
  | "minkowski";

export type WeightingMethod =
  | "uniform"
  | "distance";

export type LearningLevel =
  | "basic"
  | "medium"
  | "advanced";

export interface KNNRow {
  features: number[];
  target: string | number;
}

export interface FeatureScaler {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface DatasetSplit {
  train: KNNRow[];
  test: KNNRow[];
}

export interface Neighbor {
  row: KNNRow;
  distance: number;
  index: number;
  rank: number;
  weight: number;
}

export interface ClassificationVote {
  classLabel: string | number;
  votes: number;
  weightedVotes: number;
  percentage: number;
}

export interface ClassificationPrediction {
  predictedClass: string | number;
  neighbors: Neighbor[];
  votes: ClassificationVote[];
}

export interface RegressionPrediction {
  predictedValue: number;
  neighbors: Neighbor[];
}

export interface ClassificationTestPrediction {
  actual: string | number;
  predicted: string | number;
}

export interface RegressionTestPrediction {
  actual: number;
  predicted: number;
}

export interface ClassificationMetrics {
  accuracy: number;
  confusionMatrix: number[][];
  classes: Array<string | number>;

  perClass: Array<{
    classLabel: string | number;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;

  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
}

export interface RegressionMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface KOptimizationPoint {
  k: number;
  score: number;
}

export interface KNNOptions {
  k: number;
  task: KNNTask;
  distanceMetric: DistanceMetric;
  weighting: WeightingMethod;
  minkowskiP?: number;
  scaleFeatures?: boolean;
}