
export type Regularization = "none" | "ridge" | "lasso";

export type ImputationMethod =
  | "mean"
  | "median"
  | "most_frequent"
  | "constant"
  | "drop";

export interface ColumnImputation {
  method: ImputationMethod;
  fill_value?: number | null;
}

export interface PreprocessingConfig {
  feature_strategies: Record<string, ColumnImputation>;
  default_strategy: "mean" | "median" | "most_frequent";
}

export type DatasetRow = Record<string, string | number | null>;

export interface TrainingRequest {
  rows: DatasetRow[];
  features: string[];
  target: string;
  degree: number;
  regularization: Regularization;
  alpha: number;
  test_size: number;
  random_state: number;
  interaction_only: boolean;
  standardize: boolean;
  preprocessing?: PreprocessingConfig;
}

export interface RegressionMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number | null;
}

export interface PredictionRecord {
  split: "train" | "test";
  features: Record<string, number | null>;
  actual: number;
  predicted: number;
  residual: number;
}

export interface TrainingResponse {
  status: string;

  model: {
    degree: number;
    regularization: Regularization;
    alpha: number;
    standardize: boolean;
    interaction_only: boolean;
  };

  dataset: {
    total_rows: number;
    valid_rows: number;
    dropped_rows: number;
    training_rows: number;
    testing_rows: number;
  };

  metrics: {
    train: RegressionMetrics;
    test: RegressionMetrics;
  };

  polynomial: {
    feature_count: number;
    feature_names: string[];
    coefficients: number[];
    intercept: number;
    coefficient_space: string;
  };

  predictions: PredictionRecord[];

  preprocessing?: {
    missing_target_rows_dropped: number;
    missing_feature_rows_dropped: number;
    missing_feature_counts: Record<string, number>;
    training_statistics: Record<
      string,
      {
        method: string;
        fill_value: number;
        training_missing_count: number;
      }
    >;
    leakage_safe: boolean;
  };

  warnings?: string[];
}

export interface CurveResponse extends TrainingResponse {
  curve: {
    x: number;
    y: number;
  }[];

  curve_context?: {
    x_feature: string;
    fixed_features: Record<string, number>;
  };
}

export interface SurfaceResponse extends TrainingResponse {
  surface: {
    x_feature: string;
    y_feature: string;
    x: number[];
    y: number[];
    z: number[][];
    observed_points: {
      x: number;
      y: number;
      z: number;
    }[];
    fixed_features: Record<string, number>;
  };
}

export interface CurveRequest extends TrainingRequest {
  x_feature?: string;
  fixed_features?: Record<string, number>;
  grid_size?: number;
}

export interface SurfaceRequest extends TrainingRequest {
  x_feature: string;
  y_feature: string;
  grid_size: number;
  fixed_features?: Record<string, number>;
}

export interface DegreeSearchRequest
  extends Omit<TrainingRequest, "degree"> {
  min_degree: number;
  max_degree: number;
  cv_folds: number;
}

export interface DegreeSearchRecord {
  degree: number;
  feature_count: number;
  mean_validation_rmse: number;
  std_validation_rmse: number;
  mean_training_rmse?: number;
  status: "success" | "skipped" | "failed";
  reason?: string;
}

export interface DegreeSearchResponse {
  status: string;
  best_degree: number | null;
  selection_metric: "validation_rmse";
  results: DegreeSearchRecord[];
  explanation?: string;
  warnings?: string[];
}

export interface NewPredictionRequest {
  training: TrainingRequest;
  inputs: Record<string, number | null>[];
}

export interface NewPredictionRecord {
  inputs: Record<string, number | null>;
  predicted: number;
  polynomial_terms?: Record<string, number>;
  term_contributions?: Record<string, number>;
}

export interface NewPredictionResponse {
  status: string;
  target: string;
  degree: number;
  predictions: NewPredictionRecord[];
  warnings?: string[];
}

const API_URL =
  process.env.NEXT_PUBLIC_POLYNOMIAL_API_URL ??
  "http://127.0.0.1:8001";

async function postJSON<T>(
  endpoint: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new Error(
      "Cannot connect to the ModelMind Python backend. " +
        "Make sure FastAPI is running on port 8001."
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const error: {
        detail?: string | { msg?: string }[];
      } = await response.json();

      if (typeof error.detail === "string") {
        message = error.detail;
      } else if (Array.isArray(error.detail)) {
        message = error.detail
          .map((item) => item.msg ?? "Invalid input")
          .join("; ");
      }
    } catch {
      // Preserve the HTTP error message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function trainPolynomial(
  request: TrainingRequest,
  signal?: AbortSignal
): Promise<TrainingResponse> {
  return postJSON<TrainingResponse>(
    "/api/polynomial/train",
    request,
    signal
  );
}

export function getPolynomialCurve(
  request: CurveRequest,
  signal?: AbortSignal
): Promise<CurveResponse> {
  return postJSON<CurveResponse>(
    "/api/polynomial/curve",
    request,
    signal
  );
}

export function getPolynomialSurface(
  request: SurfaceRequest,
  signal?: AbortSignal
): Promise<SurfaceResponse> {
  return postJSON<SurfaceResponse>(
    "/api/polynomial/surface",
    request,
    signal
  );
}

export function findBestPolynomialDegree(
  request: DegreeSearchRequest,
  signal?: AbortSignal
): Promise<DegreeSearchResponse> {
  return postJSON<DegreeSearchResponse>(
    "/api/polynomial/best-degree",
    request,
    signal
  );
}

export function predictPolynomialValues(
  request: NewPredictionRequest,
  signal?: AbortSignal
): Promise<NewPredictionResponse> {
  return postJSON<NewPredictionResponse>(
    "/api/polynomial/predict",
    request,
    signal
  );
}
