export type NumericRow = Record<string, number>;

export interface MultipleRegressionDataset {
  rows: NumericRow[];
  featureNames: string[];
  targetName: string;
}

export interface RegressionCoefficients {
  intercept: number;
  coefficients: Record<string, number>;
}

export interface RegressionPrediction {
  index: number;
  actual: number;
  predicted: number;
  residual: number;
  squaredError: number;
}

export interface RegressionMetrics {
  mse: number;
  rmse: number;
  r2: number;
  mae: number;
}

export interface FeatureStatistics {
  name: string;
  mean: number;
  standardDeviation: number;
  min: number;
  max: number;
}

export interface StandardizedCoefficient {
  feature: string;
  rawCoefficient: number;
  standardizedCoefficient: number;
  absoluteStandardizedCoefficient: number;
}

export interface FeatureContribution {
  feature: string;
  value: number;
  coefficient: number;
  contribution: number;
}

export interface PredictionBreakdown {
  intercept: number;
  contributions: FeatureContribution[];
  prediction: number;
}

export interface TrainedMultipleRegressionModel {
  featureNames: string[];
  targetName: string;

  intercept: number;
  coefficients: Record<string, number>;

  predictions: RegressionPrediction[];

  metrics: RegressionMetrics;

  standardizedCoefficients: StandardizedCoefficient[];
}

export interface CorrelationPair {
  featureA: string;
  featureB: string;
  correlation: number;
}

export type SuitabilityLevel = "suitable" | "warning" | "unsuitable";

export interface SuitabilityMessage {
  type: "info" | "warning" | "error";
  message: string;
}

export interface MultipleRegressionSuitabilityResult {
  level: SuitabilityLevel;
  messages: SuitabilityMessage[];
}