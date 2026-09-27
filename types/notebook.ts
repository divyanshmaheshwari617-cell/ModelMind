export type CellType = "code" | "markdown";

export interface NotebookCellType {
  id: string;
  type: CellType;
  content: string;
  output?: string;
  error?: string;
  isRunning?: boolean;
}