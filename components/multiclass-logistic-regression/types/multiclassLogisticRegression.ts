export type LearningLevel =
  | "basic"
  | "medium"
  | "advanced";

export type NumericRow = {
  [key: string]: number;
};

export type ClassLabel =
  | string
  | number;

export interface MulticlassRow {
  features: NumericRow;
  target: ClassLabel;
}

export interface FeatureScaler {
  feature: string;
  mean: number;
  std: number;
}

export interface DatasetSplit {
  trainRows: MulticlassRow[];
  testRows: MulticlassRow[];
}

export interface ClassParameters {
  classLabel: ClassLabel;
  intercept: number;
  coefficients: {
    [feature: string]: number;
  };
}

export interface ClassProbability {
  classLabel: ClassLabel;
  probability: number;
}

export interface MulticlassPrediction {
  actual: ClassLabel;
  predicted: ClassLabel;

  probabilities:
    ClassProbability[];

  logits: {
    classLabel: ClassLabel;
    score: number;
  }[];
}

export interface TrainingSnapshot {
  iteration: number;

  classParameters:
    ClassParameters[];

  loss: number;
  accuracy: number;
}

export interface MulticlassModel {
  features: string[];
  target: string;

  classes: ClassLabel[];

  scalers: FeatureScaler[];

  classParameters:
    ClassParameters[];

  trainPredictions:
    MulticlassPrediction[];

  testPredictions:
    MulticlassPrediction[];

  trainLoss: number;
  testLoss: number;

  trainAccuracy: number;
  testAccuracy: number;
}

export interface TrainingOptions {
  learningRate: number;
  iterations: number;

  regularizationStrength?: number;
}

export interface TrainingResult {
  model: MulticlassModel;

  history:
    TrainingSnapshot[];
}

export interface ConfusionMatrixResult {
  classes: ClassLabel[];

  matrix: number[][];
}

export interface PerClassMetrics {
  classLabel: ClassLabel;

  truePositive: number;
  falsePositive: number;
  falseNegative: number;
  trueNegative: number;

  precision: number;
  recall: number;
  f1: number;
  specificity: number;

  support: number;
}

export interface MulticlassMetrics {
  accuracy: number;

  macroPrecision: number;
  macroRecall: number;
  macroF1: number;

  weightedPrecision: number;
  weightedRecall: number;
  weightedF1: number;

  perClass:
    PerClassMetrics[];
}

export interface MulticlassROCPoint {
  threshold: number;

  fpr: number;
  tpr: number;
}

export interface ClassROC {
  classLabel: ClassLabel;

  points:
    MulticlassROCPoint[];

  auc: number;
}