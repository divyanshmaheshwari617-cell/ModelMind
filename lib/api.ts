const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

/* =========================================================
   MODELMIND PERSISTENT RUNTIME
   ========================================================= */

export interface RuntimeResult {
  session_id: string;
  status: string;
}

export async function createRuntime(): Promise<RuntimeResult> {
  const response = await fetch(
    `${API_URL}/runtime`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Could not create ModelMind runtime."
    );
  }

  return response.json();
}

/* =========================================================
   PYTHON EXECUTION
   ========================================================= */

export interface ExecutionResult {
  success: boolean;

  execution_count: number;

  output: string;

  stderr: string;

  error: string;
}

export async function executePython(
  sessionId: string,
  code: string
): Promise<ExecutionResult> {
  try {
    const response = await fetch(
      `${API_URL}/execute`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          session_id: sessionId,
          code: code,
        }),
      }
    );

    if (!response.ok) {
      let message =
        "Could not connect to the ModelMind Python Runtime.";

      try {
        const errorData =
          await response.json();

        if (errorData.detail) {
          message =
            errorData.detail;
        }
      } catch {
        // Backend response was not JSON.
      }

      throw new Error(message);
    }

    const data: ExecutionResult =
      await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "ModelMind Python Runtime is unavailable."
    );
  }
}

/* =========================================================
   MODELMIND DEBUGGER TYPES
   ========================================================= */

export type ExplanationLevel =
  | "Basic"
  | "Intermediate"
  | "Advanced";

export type DebugAction =
  | "explain"
  | "fix";

export interface AIErrorResult {
  /*
   * True when ModelMind's local
   * debugger understands the error.
   */
  handled: boolean;

  /*
   * Confidence between 0 and 1.
   */
  confidence: number;

  /*
   * Python error type.
   *
   * Example:
   * TypeError
   * NameError
   * SyntaxError
   */
  error_type: string;

  /*
   * Human-friendly error title.
   */
  title: string;

  /*
   * Python-reported line number.
   */
  line_number: number | null;

  /*
   * Source line that caused
   * the problem.
   */
  failing_line: string;

  /*
   * Educational explanation.
   */
  explanation: string;

  /*
   * Root cause.
   */
  why: string;

  /*
   * Instructions for fixing it.
   */
  how_to_fix: string;

  /*
   * Complete corrected code
   * when ModelMind can generate
   * a confident fix.
   */
  fixed_code: string;

  /*
   * Explanation of the changes.
   */
  changes: string;

  /*
   * Analysis source.
   *
   * modelmind-local
   * fallback-required
   * gemini (later)
   */
  source: string;
}

/* =========================================================
   DEBUG REQUEST
   ========================================================= */

export async function analyzePythonError(
  code: string,
  traceback: string,
  action: DebugAction,
  level: ExplanationLevel
): Promise<AIErrorResult> {
  try {
    const response = await fetch(
      `${API_URL}/ai/error`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          code,
          traceback,
          action,
          level,
        }),
      }
    );

    if (!response.ok) {
      let message =
        "ModelMind could not analyze this error.";

      try {
        const errorData =
          await response.json();

        if (errorData.detail) {
          message =
            errorData.detail;
        }
      } catch {
        // Backend did not return JSON.
      }

      throw new Error(message);
    }

    const data: AIErrorResult =
      await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "ModelMind Debugger is currently unavailable."
    );
  }
}

/* =========================================================
   DEBUGGER HELPER FUNCTIONS
   ========================================================= */

export function confidenceToPercentage(
  confidence: number
): number {
  return Math.round(
    confidence * 100
  );
}

export function getDebuggerSourceName(
  source: string
): string {
  switch (source) {
    case "modelmind-local":
      return "ModelMind Error Engine";

    case "gemini":
      return "ModelMind AI";

    case "fallback-required":
      return "Advanced analysis required";

    default:
      return "ModelMind Debugger";
  }
}

export function requiresAIFallback(
  result: AIErrorResult
): boolean {
  return (
    !result.handled ||
    result.confidence < 0.7
  );
}

export function hasSuggestedFix(
  result: AIErrorResult
): boolean {
  return (
    typeof result.fixed_code ===
      "string" &&
    result.fixed_code
      .trim()
      .length > 0
  );
}

/* =========================================================
   DATASET INTELLIGENCE TYPES
   ========================================================= */

export interface DatasetAnalysis {
  supported: boolean;

  filename: string;

  rows: number;

  columns: number;

  column_names: string[];

  numeric_columns: string[];

  categorical_columns: string[];

  missing_values:
    Record<string, number>;

  total_missing_values: number;

  duplicate_rows: number;

  likely_id_columns: string[];

  dtypes:
    Record<string, string>;

  preview:
    Record<string, unknown>[];
}

/* =========================================================
   NOTEBOOK FILE UPLOAD
   ========================================================= */

export interface UploadResult {
  success: boolean;

  filename: string;

  size: number;

  dataset?: DatasetAnalysis;

  dataset_error?: string;
}

export async function uploadRuntimeFile(
  sessionId: string,
  file: File
): Promise<UploadResult> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/files`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "File upload failed."
    );
  }

  return response.json();
}

/* =========================================================
   RUNTIME FILE LIST
   ========================================================= */

export interface RuntimeFile {
  name: string;

  size: number;

  extension: string;
}

export async function getRuntimeFiles(
  sessionId: string
): Promise<RuntimeFile[]> {
  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/files`
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Could not load runtime files."
    );
  }

  const data =
    await response.json();

  return data.files;
}

/* =========================================================
   DATASET ANALYSIS
   ========================================================= */

export async function getDatasetAnalysis(
  sessionId: string,
  filename: string
): Promise<DatasetAnalysis> {
  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/dataset/${encodeURIComponent(
      filename
    )}`
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Dataset analysis failed."
    );
  }

  return response.json();
}

/* =========================================================
   FULL TARGET ANALYSIS
   ========================================================= */

export interface TargetClassDistribution {
  value: string;
  count: number;
  percentage: number;
}

export interface TargetAnalysis {
  target: string;

  task:
    | "classification"
    | "regression"
    | "unknown";

  task_type: string;

  dtype: string;

  is_numeric: boolean;

  total_rows: number;

  non_null_count: number;

  missing_count: number;

  unique_count: number;

  class_distribution?: TargetClassDistribution[];

  largest_class_percentage?: number;

  smallest_class_percentage?: number;

  imbalance_ratio?: number | null;

  imbalance_level?: string;

  minimum?: number;

  maximum?: number;

  mean?: number;

  median?: number;

  standard_deviation?: number;

  /* =====================================================
     TARGET HEALTH
     ===================================================== */

  q1?: number;

  q3?: number;

  iqr?: number;

  lower_outlier_bound?: number;

  upper_outlier_bound?: number;

  outlier_count?: number;

  outlier_percentage?: number;

  skewness?: number;

  distribution_shape?:
    | "approximately_symmetric"
    | "right_skewed"
    | "strongly_right_skewed"
    | "left_skewed"
    | "strongly_left_skewed";

  negative_count?: number;

  zero_count?: number;

  missing_percentage?: number;
}

/* =========================================================
   REQUEST TARGET ANALYSIS
   ========================================================= */

export async function analyzeDatasetTarget(
  sessionId: string,
  filename: string,
  targetColumn: string
): Promise<TargetAnalysis> {
  const encodedFilename =
    encodeURIComponent(filename);

  const encodedTarget =
    encodeURIComponent(targetColumn);

  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/dataset/${encodedFilename}/target/${encodedTarget}`
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Target analysis failed."
    );
  }

  return response.json();
}

/* =========================================================
   FEATURE ANALYSIS
   ========================================================= */

export interface FeatureCategoryDistribution {
  value: string;
  count: number;
  percentage: number;
}

export interface FeatureAnalysis {
  feature: string;

  dtype: string;

  is_numeric: boolean;

  feature_type?:
    | "numerical"
    | "categorical";

  total_rows: number;

  non_null_count: number;

  missing_count: number;

  missing_percentage: number;

  unique_count: number;

  /* =============================================
     NUMERICAL FEATURE STATISTICS
     ============================================= */

  minimum?: number;

  maximum?: number;

  mean?: number;

  median?: number;

  standard_deviation?: number;

  q1?: number;

  q3?: number;

  iqr?: number;

  lower_outlier_bound?: number;

  upper_outlier_bound?: number;

  outlier_count?: number;

  outlier_percentage?: number;

  skewness?: number;

  distribution_shape?:
    | "approximately_symmetric"
    | "right_skewed"
    | "strongly_right_skewed"
    | "left_skewed"
    | "strongly_left_skewed";

  negative_count?: number;

  zero_count?: number;

  /* =============================================
     HISTOGRAM DATA
     ============================================= */

  histogram_counts?: number[];

  histogram_edges?: number[];

  kde_x?: number[];
  kde_y?: number[];

  /* =============================================
     CATEGORICAL FEATURE
     ============================================= */

  category_distribution?:
    FeatureCategoryDistribution[];

  /* =============================================
     PREPROCESSING ADVISOR
     ============================================= */

  imputation_strategy?:
    | "none"
    | "mean"
    | "median"
    | "most_frequent_or_unknown";

  imputation_reason?: string;

  scaling_strategy?:
    | "standard"
    | "robust"
    | "inspect_after_transform";

  scaling_reason?: string;

  transformation_strategy?:
    | "none"
    | "log1p_candidate"
    | "power_transform_candidate";

  transformation_reason?: string;
}

/* =========================================================
   GET FEATURE ANALYSIS
   ========================================================= */

export async function analyzeDatasetFeature(
  sessionId: string,
  filename: string,
  featureColumn: string
): Promise<FeatureAnalysis> {
  const encodedFilename =
    encodeURIComponent(filename);

  const encodedFeature =
    encodeURIComponent(featureColumn);

  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/dataset/${encodedFilename}/feature/${encodedFeature}`
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Feature analysis failed."
    );
  }

  return response.json();
}