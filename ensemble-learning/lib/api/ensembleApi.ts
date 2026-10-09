
import type {
  EnsembleTask,
} from "@/lib/datasets/ensembleDatasets";

import type {
  EnsembleDatasetSelection,
  MissingValueStrategy,
} from "@/components/dataset/EnsembleDatasetManager";

export type EnsembleModel =
  | "bagging"
  | "random-forest"
  | "adaboost"
  | "gradient-boosting"
  | "voting"
  | "stacking";

export interface EnsembleTrainingOptions {
  model: EnsembleModel;
  nEstimators: number;
  maxDepth: number;
  learningRate: number;
  testSize: number;
  randomState?: number;
  xFeature?: string;
  yFeature?: string;
  gridResolution?: number;
}

export interface EnsembleTrainRequest {
  rows: Record<string, string | number | null>[];
  features: string[];
  target: string;
  task: EnsembleTask;
  model: EnsembleModel;
  n_estimators: number;
  max_depth: number;
  learning_rate: number;
  test_size: number;
  random_state: number;
  missing_strategy: MissingValueStrategy;
  x_feature: string | null;
  y_feature: string | null;
  grid_resolution: number;
}

export interface ClassificationMetrics {
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  confusion_matrix: number[][];
  class_labels: number[];
}

export interface RegressionMetrics {
  r2: number | null;
  mae: number | null;
  rmse: number | null;
}

export type EnsembleMetrics =
  | ClassificationMetrics
  | RegressionMetrics;

export interface EnsemblePlotPoint {
  x: number | null;
  y?: number | null;
  actual: number | null;
  predicted?: number | null;
}

export interface EnsembleVisualization {
  type:
    | "curve"
    | "decision-surface"
    | "regression-surface";

  x_feature: string;
  y_feature: string | null;
  x_values: number[];
  y_values: number[];
  predictions?: number[];
  z_values?: number[][];
  shape: number[];
  train_points: EnsemblePlotPoint[];
  test_points: EnsemblePlotPoint[];
  other_feature_values?: Record<string, number | null>;
}

export interface EnsembleTrainingStage {
  stage: number;
  metrics: EnsembleMetrics;
  is_exact_model_stage: boolean;
  prediction_preview: {
    actual: number;
    predicted: number;
  }[];
}

export interface EnsembleTrainingProgression {
  algorithm: EnsembleModel;
  progression_type:
    | "boosting-stages"
    | "cumulative-learners"
    | "final-model";
  total_stages: number;
  stages: EnsembleTrainingStage[];
  description: string;
}


export interface EnsembleTrainingResponse {
  success: boolean;
  task: EnsembleTask;
  model: EnsembleModel;
  training_progression?: EnsembleTrainingProgression;

  dataset: {
    total_rows: number;
    valid_rows: number;
    train_rows: number;
    test_rows: number;
    features: string[];
    target: string;
  };

  parameters: {
    n_estimators: number;
    max_depth: number;
    learning_rate: number;
    test_size: number;
    random_state: number;
    missing_strategy: MissingValueStrategy;
  };

  metrics: {
    train: EnsembleMetrics;
    test: EnsembleMetrics;
  };

  feature_importances:
    | {
        feature: string;
        importance: number | null;
      }[]
    | null;

  visualization: EnsembleVisualization;

  predictions: {
    actual: number;
    predicted: number;
  }[];
}

export interface EnsembleApiError {
  detail?: string | {
    loc?: (string | number)[];
    msg?: string;
    type?: string;
  }[];
  message?: string;
}

const API_URL = (
  process.env.NEXT_PUBLIC_ENSEMBLE_API_URL?.trim() ||
  "http://127.0.0.1:8002"
).replace(/\/+$/, "");

function formatApiError(
  data: EnsembleApiError | null,
  status: number,
): string {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => {
        const location = item.loc?.join(".") || "Request";
        return `${location}: ${item.msg || "Invalid value"}`;
      })
      .join("; ");
  }

  return (
    data?.message ||
    `The Ensemble API returned HTTP ${status}.`
  );
}

async function requestApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        cache: "no-store",
      },
    );
  } catch {
    throw new Error(
      "Cannot connect to the ModelMind Ensemble Python backend. " +
      "Make sure FastAPI is running on port 8002.",
    );
  }

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => null) as EnsembleApiError | null;

    throw new Error(
      formatApiError(payload, response.status),
    );
  }

  return response.json() as Promise<T>;
}

export function buildEnsembleTrainingRequest(
  selection: EnsembleDatasetSelection,
  rows: Record<string, string | number | null>[],
  options: EnsembleTrainingOptions,
): EnsembleTrainRequest {
  const features = selection.features.filter(
    (feature) =>
      feature !== selection.target,
  );

  if (features.length < 1) {
    throw new Error(
      "Select at least one input feature.",
    );
  }

  if (features.length > 8) {
    throw new Error(
      "Select no more than eight input features.",
    );
  }

  if (!selection.target) {
    throw new Error(
      "Select a target column.",
    );
  }

  if (rows.length < 20) {
    throw new Error(
      "At least 20 dataset rows are required for training.",
    );
  }

  const xFeature =
    options.xFeature &&
    features.includes(options.xFeature)
      ? options.xFeature
      : features[0];

  const yFeature =
    options.yFeature &&
    features.includes(options.yFeature) &&
    options.yFeature !== xFeature
      ? options.yFeature
      : features.find(
          (feature) => feature !== xFeature,
        ) ?? null;

  return {
    rows,
    features,
    target: selection.target,
    task: selection.task,
    model: options.model,
    n_estimators: options.nEstimators,
    max_depth: options.maxDepth,
    learning_rate: options.learningRate,
    test_size: options.testSize,
    random_state: options.randomState ?? 42,
    missing_strategy: selection.missingStrategy,
    x_feature: xFeature,
    y_feature: yFeature,
    grid_resolution: options.gridResolution ?? 35,
  };
}

export async function trainEnsemble(
  payload: EnsembleTrainRequest,
  signal?: AbortSignal,
): Promise<EnsembleTrainingResponse> {
  return requestApi<EnsembleTrainingResponse>(
    "/api/ensemble/train",
    {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    },
  );
}

export async function getEnsembleHealth(): Promise<{
  status: string;
  service: string;
}> {
  return requestApi("/health");
}

export async function getEnsembleModels(): Promise<{
  models: EnsembleModel[];
  tasks: EnsembleTask[];
}> {
  return requestApi("/api/ensemble/models");
}

export function isClassificationMetrics(
  metrics: EnsembleMetrics,
): metrics is ClassificationMetrics {
  return "accuracy" in metrics;
}

export function isRegressionMetrics(
  metrics: EnsembleMetrics,
): metrics is RegressionMetrics {
  return "r2" in metrics;
}
