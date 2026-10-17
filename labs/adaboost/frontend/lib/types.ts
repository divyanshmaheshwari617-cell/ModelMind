
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
};


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
  weight_method: "samme_reconstructed" | "unavailable";
  weight_note: string;
  plot_features: string[];
  samples: BoostingSample[];
  rounds: BoostingDiagnosticRound[];
};

export type TrainResult = {
  task: Task;
  target: string;
  features: string[];

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
