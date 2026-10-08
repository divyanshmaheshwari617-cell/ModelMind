
export type RegularizationType =
  | "none"
  | "ridge"
  | "lasso";

export type LearningLevel =
  | "basic"
  | "intermediate"
  | "advanced";

export type VisualizationMode =
  | "2d"
  | "3d";

export interface DatasetColumn {
  name: string;
  type: "numeric" | "categorical";
  missingCount: number;
  uniqueCount: number;
}

export interface DatasetInfo {
  id: string;
  name: string;
  source: "builtin" | "uploaded";
  rowCount: number;
  columns: DatasetColumn[];
  preview: Record<string, unknown>[];
}

export interface PolynomialParameters {
  degree: number;
  regularization: RegularizationType;
  alpha: number;
  testSize: number;
  randomState: number;
  includeBias: boolean;
  interactionOnly: boolean;
  standardize: boolean;
}

export interface FeatureSelection {
  target: string;
  features: string[];
  xAxis: string;
  yAxis?: string;
}

export interface RegressionMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
}

export interface PredictionPoint {
  actual: number;
  predicted: number;
  residual: number;
  split: "train" | "test";
  features: Record<string, number>;
}

export interface SurfacePoint {
  x: number;
  y: number;
  z: number;
}

export interface PolynomialModelResult {
  modelId: string;
  parameters: PolynomialParameters;
  trainMetrics: RegressionMetrics;
  testMetrics: RegressionMetrics;
  predictions: PredictionPoint[];
  coefficients: number[];
  intercept: number;
  generatedFeatureNames: string[];
  polynomialFeatureCount: number;
  trainingSamples: number;
  testingSamples: number;
}

export interface PolynomialExperiment {
  id: string;
  name: string;
  createdAt: string;
  datasetName: string;
  selectedFeatures: string[];
  result: PolynomialModelResult;
}

export interface PolynomialLabState {
  dataset: DatasetInfo | null;
  parameters: PolynomialParameters;
  featureSelection: FeatureSelection;
  visualizationMode: VisualizationMode;
  learningLevel: LearningLevel;
  result: PolynomialModelResult | null;
  experiments: PolynomialExperiment[];
  isTraining: boolean;
  error: string | null;
}

export const DEFAULT_POLYNOMIAL_PARAMETERS:
  PolynomialParameters = {
    degree: 2,
    regularization: "none",
    alpha: 1,
    testSize: 0.2,
    randomState: 42,
    includeBias: false,
    interactionOnly: false,
    standardize: true,
  };
