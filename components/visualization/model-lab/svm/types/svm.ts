export type SVMTask =
  | "classification"
  | "regression";

export type SVMKernel =
  | "linear"
  | "rbf"
  | "polynomial";

export type LearningLevel =
  | "basic"
  | "medium"
  | "advanced";

export type FeatureScalingMethod =
  | "none"
  | "standard";

export type SVMValue =
  | number
  | string
  | null;

export interface SVMRow {
  id: number;
  features: number[];
  target: SVMValue;
}

export interface FeatureScaler {
  mean: number;
  std: number;
}

export interface DatasetSplit {
  train: SVMRow[];
  test: SVMRow[];
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Hyperplane2D {
  w1: number;
  w2: number;
  bias: number;
}

export interface MarginLines2D {
  decision: Hyperplane2D;
  positive: Hyperplane2D;
  negative: Hyperplane2D;
  marginWidth: number;
}

export interface SVMOptions {
  task: SVMTask;
  kernel: SVMKernel;

  C: number;
  gamma: number;
  degree: number;

  epsilon: number;

  scaling: FeatureScalingMethod;
}

export interface BinaryClassificationPoint {
  row: SVMRow;
  label: -1 | 1;
}

export interface DecisionScore {
  row: SVMRow;
  score: number;
  predictedLabel: -1 | 1;
}

export interface SupportVectorInfo {
  row: SVMRow;
  label: -1 | 1;
  functionalMargin: number;
  geometricDistance: number;
  isSupportVector: boolean;
  violatesMargin: boolean;
  misclassified: boolean;
}

export interface ClassificationPrediction {
  predictedLabel: -1 | 1;
  score: number;
}

export interface RegressionPrediction {
  predictedValue: number;
  residual: number;
  insideEpsilonTube: boolean;
}

export interface ConfusionMatrix {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;

  confusionMatrix: ConfusionMatrix;
}

export interface RegressionMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface KernelResult {
  linear: number;
  rbf: number;
  polynomial: number;
}

export interface KernelComparisonPoint {
  first: number[];
  second: number[];
  result: KernelResult;
}

export interface CParameterExplanation {
  C: number;
  regularizationStrength: number;
  marginPreference: string;
  errorTolerance: string;
  overfittingRisk: string;
}

export interface GammaExplanation {
  gamma: number;
  influenceRadius: string;
  boundaryComplexity: string;
  overfittingRisk: string;
}

export interface EpsilonTubePoint {
  actual: number;
  predicted: number;

  upper: number;
  lower: number;

  residual: number;
  absoluteResidual: number;

  insideTube: boolean;
  epsilonLoss: number;
}

export interface SVMClassificationEvaluation {
  actual: (-1 | 1)[];
  predicted: (-1 | 1)[];
  scores: number[];

  metrics: ClassificationMetrics;
}

export interface SVMRegressionEvaluation {
  actual: number[];
  predicted: number[];

  metrics: RegressionMetrics;
}