export type ExperimentTask =
  | "classification"
  | "regression"
  | "clustering"
  | "unknown";

export type ExperimentStatus =
  | "completed"
  | "failed";

export interface ExperimentMetric {
  name: string;
  value: number;
}

export interface ModelMindExperiment {
  id: string;

  projectId: string;

  name: string;
  modelName: string;

  task: ExperimentTask;

  parameters: Record<
    string,
    string | number | boolean | null
  >;

  metrics: ExperimentMetric[];

  trainingTimeMs: number | null;

  status: ExperimentStatus;

  notes: string;

  createdAt: string;
}

export interface ExperimentStore {
  version: number;
  experiments: ModelMindExperiment[];
}