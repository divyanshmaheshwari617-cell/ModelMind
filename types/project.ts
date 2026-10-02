import { NotebookCellType } from "@/types/notebook";

export const MODELMIND_PROJECT_VERSION = 1;

export interface ModelMindProject {
  version: number;

  id: string;
  name: string;

  createdAt: string;
  updatedAt: string;

  cells: NotebookCellType[];

  uploadedFiles: SavedProjectFile[];

  experimentIds: string[];
}

export interface SavedProjectFile {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStore {
  version: number;
  activeProjectId: string | null;
  projects: ModelMindProject[];
}