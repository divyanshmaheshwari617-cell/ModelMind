export type NumericRow = Record<string, number>;

export type ModelType =
  | "linear"
  | "ridge"
  | "lasso"
  | "elastic-net";

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

export interface RegressionMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface ModelCoefficients {
  intercept: number;
  coefficients: Record<string, number>;
}

export interface RegressionPrediction {
  actual: number;
  predicted: number;
  residual: number;
}

export interface TrainedRegularizationModel {
  modelType: ModelType;

  features: string[];
  target: string;

  alpha: number;
  l1Ratio: number;

  intercept: number;
  coefficients: Record<string, number>;

  scalers: FeatureScaler[];
  targetMean: number;

  trainPredictions: RegressionPrediction[];
  testPredictions: RegressionPrediction[];

  trainMetrics: RegressionMetrics;
  testMetrics: RegressionMetrics;

  penalty: number;
  objectiveValue: number;

  iterations: number;
}

export interface CoefficientPathPoint {
  alpha: number;
  coefficients: Record<string, number>;
}

export interface FeatureCoefficientComparison {
  feature: string;

  linear: number;
  ridge: number;
  lasso: number;
  elasticNet: number;
}

export interface ModelComparison {
  modelType: ModelType;

  trainMetrics: RegressionMetrics;
  testMetrics: RegressionMetrics;

  coefficientMagnitude: number;
  zeroCoefficients: number;

  penalty: number;
}

export interface DatasetAnalysis {
  rowCount: number;
  featureCount: number;

  missingValues: Record<string, number>;
  numericColumns: string[];
  constantColumns: string[];

  warnings: string[];
}