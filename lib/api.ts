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
  | "Medium"
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
/* =========================================================
   ML MISTAKE DETECTOR
   ========================================================= */

export type MLMistakeSeverity =
  | "critical"
  | "high"
  | "warning"
  | "info";

export interface MLMistakeFinding {
  id: string;
  severity: MLMistakeSeverity;
  confidence: number;
  category: string;
  title: string;
  what_happened: string;
  why_it_matters: string;
  recommendation: string;
  code_example: string;
  line_number: number | null;
  learning_level: string;
  evidence: string;
  safe_to_apply: boolean;
  source: string;
}

export interface MLMistakeResult {
  handled: boolean;
  source: string;
  engine: string;
  level: string;
  parse_success: boolean;
  findings: MLMistakeFinding[];
  finding_count: number;
}

export async function analyzeMLMistakes(
  code: string,
  level: ExplanationLevel = "Basic"
): Promise<MLMistakeResult> {
  const response = await fetch(
    `${API_URL}/ai/ml-check`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        code,
        level,
      }),
    }
  );

  if (!response.ok) {
    let message =
      "ModelMind could not check this ML code.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Backend did not return JSON.
    }

    throw new Error(message);
  }

  return response.json();
}
/* =========================================================
   MODELMIND CODE EXPLAINER
   ========================================================= */

export interface CodeExplanationStep {
  line_number: number | null;
  code: string;
  title: string;
  explanation: string;
}

export interface CodeExplanationConcept {
  title: string;
  explanation: string;
  line_number: number | null;
}

export interface CodeExplanationVariable {
  name: string;
  line_number: number | null;
  assigned_from: string;
  explanation: string;
}

export interface CodeExplanationLibrary {
  name: string;
  imported_as: string;
  line_number: number | null;
  explanation: string;
}

export interface CodeExplanationMLFlow {
  stage: string;
  explanation: string;
  line_number: number | null;
}

export interface CodeExplanationNote {
  title: string;
  explanation: string;
}

export interface CodeExplanationWarning {
  title: string;
  message: string;
}

export interface CodeExplanationResult {
  handled: boolean;

  source: string;

  engine: string;

  level: string;

  parse_success: boolean;

  summary: string;

  purpose: string;

  steps: CodeExplanationStep[];

  concepts: CodeExplanationConcept[];

  variables: CodeExplanationVariable[];

  libraries: CodeExplanationLibrary[];

  ml_flow: CodeExplanationMLFlow[];

  advanced_notes: CodeExplanationNote[];

  warnings: CodeExplanationWarning[];

  confidence: number;
}

export async function explainPythonCode(
  code: string,
  level: ExplanationLevel = "Basic"
): Promise<CodeExplanationResult> {
  const response = await fetch(
    `${API_URL}/ai/explain-code`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        code,
        level,
      }),
    }
  );

  if (!response.ok) {
    let message =
      "ModelMind could not explain this code.";

    try {
      const errorData =
        await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Backend did not return JSON.
    }

    throw new Error(message);
  }

  return response.json();
}
/* =========================================================
   SMART PREPROCESSING ADVISOR
   ========================================================= */

export interface PreprocessingRecommendation {
  feature: string;

  feature_type:
    | "numerical"
    | "categorical";

  dtype: string | null;

  missing_count: number;
  missing_percentage: number;

  missing_severity:
    | "none"
    | "low"
    | "moderate"
    | "high"
    | "very_high";

  unique_count: number;

  skewness?: number;

  distribution_shape?: string | null;

  outlier_count?: number;
  outlier_percentage?: number;

  unique_ratio?: number;

  imputation_strategy: string;

  imputation_reason?: string | null;

  scaling_strategy?: string;
  scaling_reason?: string | null;

  transformation_strategy?: string;
  transformation_reason?: string | null;

  recommended_action: string;
  explanation: string;
  example_code: string;

  warnings: string[];
}


export interface PreprocessingSafety {
  dataset_modified: boolean;
  automatic_apply: boolean;
  message: string;
}


export interface PreprocessingAdvisorResult {
  handled: boolean;

  source: string;

  engine: string;

  level:
    | "basic"
    | "medium"
    | "advanced";

  filename: string;

  rows: number;
  columns: number;

  numerical_features: number;
  categorical_features: number;

  total_missing_values: number;

  duplicate_rows: number;

  feature_warning_count: number;

  dataset_warnings: string[];

  recommendations:
    PreprocessingRecommendation[];

  safety: PreprocessingSafety;
}


export async function getPreprocessingAdvice(
  sessionId: string,
  filename: string,
  level: ExplanationLevel = "Basic"
): Promise<PreprocessingAdvisorResult> {
  const encodedFilename =
    encodeURIComponent(filename);

  const encodedLevel =
    encodeURIComponent(level);

  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/dataset/${encodedFilename}/preprocessing?level=${encodedLevel}`
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Smart preprocessing analysis failed."
    );
  }

  return response.json();
}
// ============================================================
// PREPROCESSING PREVIEW
// ============================================================

export interface PreprocessingPreviewStatistics {
  missing_count: number;
  missing_percentage: number;

  // Numerical statistics
  mean?: number | null;
  median?: number | null;
  std?: number | null;
  min?: number | null;
  max?: number | null;

  // Categorical statistics
  unique_count?: number;
  most_frequent_value?: string | number | boolean | null;
}

export interface PreprocessingPreviewSide {
  sample: Array<string | number | boolean | null>;
  statistics: PreprocessingPreviewStatistics;
}

export interface PreprocessingPreviewSafety {
  preview_only: boolean;
  dataset_modified: boolean;
  written_to_disk: boolean;
  message: string;
}

export interface PreprocessingPreviewResult {
  handled: boolean;
  source: string;
  engine: string;

  filename: string;

  feature: string;

  feature_type:
    | "numerical"
    | "categorical";

  strategy: string;

  fill_value:
    | string
    | number
    | boolean
    | null;

  changed_count: number;

  explanation: string;

  before: PreprocessingPreviewSide;
  after: PreprocessingPreviewSide;

  safety: PreprocessingPreviewSafety;
}


export async function previewPreprocessing(
  sessionId: string,
  filename: string,
  feature: string,
  strategy: string
): Promise<PreprocessingPreviewResult> {

  const encodedFilename =
    encodeURIComponent(filename);

  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/dataset/${encodedFilename}/preprocessing/preview`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        feature,
        strategy,
      }),
    }
  );

  if (!response.ok) {

    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Preprocessing preview failed."
    );
  }

  return response.json();
}
// ============================================================
// PREPROCESSING APPLY + UNDO
// ============================================================

export interface PreprocessingApplyResult {
  handled: boolean;
  source: string;
  engine: string;

  filename: string;
  feature: string;
  strategy: string;

  fill_value?: string | number | boolean | null;

  applied: boolean;
  changed_count: number;

  missing_before?: number;
  missing_after?: number;

  backup_created?: boolean;
  backup_filename?: string;

  message: string;

  dataset?: unknown;
}


export interface PreprocessingUndoResult {
  handled: boolean;
  source: string;
  engine: string;

  filename: string;

  restored: boolean;

  backup_filename: string;

  message: string;

  dataset?: unknown;
}


export async function applyPreprocessing(
  sessionId: string,
  filename: string,
  feature: string,
  strategy: string
): Promise<PreprocessingApplyResult> {

  const encodedFilename =
    encodeURIComponent(filename);

  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/dataset/${encodedFilename}/preprocessing/apply`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        feature,
        strategy,
      }),
    }
  );

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Applying preprocessing failed."
    );
  }

  return response.json();
}


export async function undoPreprocessing(
  sessionId: string,
  filename: string
): Promise<PreprocessingUndoResult> {

  const encodedFilename =
    encodeURIComponent(filename);

  const response = await fetch(
    `${API_URL}/runtime/${sessionId}/dataset/${encodedFilename}/preprocessing/undo`,
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
        "Undo preprocessing failed."
    );
  }

  return response.json();
}