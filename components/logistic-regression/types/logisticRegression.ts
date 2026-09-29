export type NumericRow =
  Record<string, number>;

export type LearningLevel =
  | "basic"
  | "medium"
  | "advanced";

export interface DatasetSplit {
  trainRows: NumericRow[];
  testRows: NumericRow[];
}

export interface FeatureScaler {
  feature: string;
  mean: number;
  std: number;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1: number;

  tp: number;
  tn: number;
  fp: number;
  fn: number;

  logLoss: number;
  auc: number;
}

export interface LogisticPrediction {
  actual: number;
  probability: number;
  predicted: number;
  score: number;
}

export interface LogisticModel {
  features: string[];
  target: string;

  intercept: number;

  coefficients:
    Record<string, number>;

  scalers: FeatureScaler[];

  threshold: number;

  trainPredictions:
    LogisticPrediction[];

  testPredictions:
    LogisticPrediction[];

  trainMetrics:
    ClassificationMetrics;

  testMetrics:
    ClassificationMetrics;

  iterations: number;

  learningRate: number;

  regularizationStrength: number;

  lossHistory: number[];
}

export interface ROCPoint {
  threshold: number;
  fpr: number;
  tpr: number;
}

export interface TrainingSnapshot {
  iteration: number;

  intercept: number;

  coefficients:
    Record<string, number>;

  loss: number;

  accuracy: number;
}

export interface CoefficientInterpretation {
  feature: string;
  coefficient: number;
  oddsRatio: number;
  direction:
    | "increases"
    | "decreases"
    | "neutral";
}

export interface DatasetAnalysis {
  rowCount: number;

  numericColumns: string[];

  missingValues:
    Record<string, number>;

  uniqueValues:
    Record<string, number>;

  warnings: string[];
}