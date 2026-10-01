export type CellType =
  | "code"
  | "markdown";

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

export interface MLMistakeAnalysis {
  handled: boolean;

  source: string;

  engine: string;

  level: string;

  parse_success: boolean;

  findings: MLMistakeFinding[];

  finding_count: number;
}

export interface NotebookCellType {
  id: string;

  type: CellType;

  content: string;

  output?: string;

  error?: string;

  isRunning?: boolean;

  mlAnalysis?: MLMistakeAnalysis | null;

  mlAnalysisError?: string;
}