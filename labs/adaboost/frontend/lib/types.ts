
export type MissingStrategy =
  | "mean"
  | "median"
  | "most_frequent"
  | "constant"
  | "drop";

export type Task = "classification" | "regression";

export type DataRow = Record<string, string | number | null>;

export type DataSet = {
  name: string;
  rows: DataRow[];
  columns: string[];
  target: string;
  features: string[];
  task: Task;
};

export type MetricSet = Record<string, number | null>;

export type Stage = {
  round: number;
  train: MetricSet;
  test: MetricSet;
  weight: number;
  error: number;
};

export type PredictionRecord = {
  index: number;
  actual: string | number;
  predicted: string | number;
  correct: boolean | null;
};

export type FeatureImportance = {
  feature: string;
  value: number;
};

/**
 * Prediction surface produced by an already-trained
 * AdaBoost model.
 *
 * X and Y are numeric input features.
 * Z always represents the model prediction:
 *
 * - Regression: predicted target value.
 * - Binary classification: positive-class probability.
 * - Multiclass classification: predicted class index.
 *
 * Changing X/Y does not require model retraining.
 */
export type SurfaceData = {
  x: number[];
  y: number[];
  z: number[][];

  points: {
    x: number;
    y: number;
    label: string | number;
  }[];

  mode: string;

  feature_x: string;
  feature_y: string;

  fixed_features: Record<string, string | number>;

  /**
   * Human-readable Z-axis label returned by the new
   * dynamic surface endpoint.
   *
   * Optional for compatibility with existing surfaces.
   */
  target_axis?: string;
};

/**
 * Request a new visualization from a fitted model.
 *
 * POST /api/surface
 *
 * This endpoint performs prediction only.
 * It does not fit AdaBoost again.
 */
export type SurfaceRequest = {
  session_id: string;
  feature_x: string;
  feature_y: string;
};

/**
 * Returned from POST /api/surface.
 */
export type SurfaceResponse = SurfaceData;

/**
 * Boosting diagnostics sample metadata.
 */
export type BoostingSample = {
  position: number;
  row_index: string;
  actual: string | number | null;
  coordinates: Record<string, number | null>;
};

export type BoostingObservation = {
  position: number;
  actual: string | number | null;
  predicted: string | number | null;
  correct: boolean | null;
  absolute_error: number | null;
  weight_before: number | null;
  weight_after: number | null;
};

export type BoostingDiagnosticRound = {
  round: number;
  estimator_error: number | null;
  estimator_weight: number | null;
  weak_learner_accuracy: number | null;
  weak_learner_mae: number | null;
  observations: BoostingObservation[];
};

export type BoostingDiagnostics = {
  task: Task;

  total_train_samples: number;
  total_estimators: number;
  returned_rounds: number;
  sample_count: number;

  weight_method:
    | "samme_reconstructed"
    | "unavailable";

  weight_note: string;

  plot_features: string[];

  samples: BoostingSample[];
  rounds: BoostingDiagnosticRound[];
};

/**
 * Main training API response.
 *
 * The new backend returns session_id and numeric_features
 * in addition to the original response fields.
 */
export type TrainResult = {
  task: Task;
  target: string;
  features: string[];

  /**
   * Identifies the fitted model stored temporarily
   * on the FastAPI backend.
   *
   * Used when requesting different visualization axes.
   */
  session_id?: string;

  /**
   * Numeric input features available for the
   * visualization X/Y selectors.
   */
  numeric_features?: string[];

  rows: {
    total: number;
    usable: number;
    train: number;
    test: number;
  };

  classes: string[];

  metrics: {
    train: MetricSet;
    test: MetricSet;
    baseline: MetricSet | null;
  };

  stages: Stage[];

  actual_estimators: number;

  boosting_diagnostics?: BoostingDiagnostics;

  importance: FeatureImportance[];

  predictions: PredictionRecord[];

  confusion_matrix: number[][] | null;

  /**
   * Initial prediction surface returned during training.
   */
  surface: SurfaceData | null;

  preprocessing: {
    numeric: string[];
    categorical: string[];

    missing_cells: number;
    dropped_target_rows: number;
    dropped_feature_rows?: number;

    missing_strategy?: string;
    categorical_missing_strategy?: string;

    feature_strategies?: Record<string, string>;

    numeric_missing: Record<string, number>;
    categorical_missing: Record<string, number>;
  };

  hyperparameters: Record<string, unknown>;
};

/**
 * AdaBoost training request.
 *
 * plot_features still specifies the initial X/Y pair.
 * Subsequent axis changes use SurfaceRequest.
 */
export type TrainConfig = {
  rows: DataRow[];
  features: string[];
  target: string;
  task: Task;

  n_estimators: number;
  learning_rate: number;
  max_depth: number;
  min_samples_leaf: number;

  loss: "linear" | "square" | "exponential";

  test_size: number;
  random_state: number;
  compare_baseline: boolean;

  plot_features?: string[];

  missing_strategy?: MissingStrategy;
  missing_fill_value?: number;

  categorical_missing_strategy?:
    | "most_frequent"
    | "constant"
    | "drop";

  categorical_fill_value?: string;

  feature_strategies?: Record<string, MissingStrategy>;
};
