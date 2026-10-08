export type SVMTask =
  | "classification"
  | "regression";

export type SVMKernel =
  | "linear"
  | "polynomial"
  | "rbf"
  | "sigmoid"
  | "laplacian"
  | "chi-square"
  | "custom";

export type LearningLevel =
  | "basic"
  | "intermediate"
  | "advanced";

export type SVMTarget =
  | string
  | number;

export type SVMRow = {
  id: string;
  features: number[];
  target: SVMTarget;
  original?: Record<string, unknown>;
};

export type ActiveSVMDataset = {
  name: string;
  rows: SVMRow[];

  featureColumns: string[];
  targetColumn: string;

  task: SVMTask;
  scalingEnabled: boolean;

  source:
  | "builtin"
  | "uploaded"
  | "generated";
};

export type SVMParameters = {
  C: number;

  kernel: SVMKernel;

  gamma: number;

  degree: number;

  coef0: number;

  epsilon: number;

  classWeight:
    | "none"
    | "balanced";
};

export type SVMQueryPoint = {
  values: number[];
};

export type SVMExperimentResult = {
  id: string;

  task: SVMTask;
  kernel: SVMKernel;

  parameters: SVMParameters;

  createdAt: number;

  metrics: Record<
    string,
    number
  >;
};

export type SVMVisualizationMode =
  | "learning"
  | "hyperplane"
  | "margin"
  | "support-vectors"
  | "kernel"
  | "prediction";

export type SVMState = {
  dataset: ActiveSVMDataset | null;

  task: SVMTask;

  level: LearningLevel;

  parameters: SVMParameters;

  queryPoint: SVMQueryPoint;

  learningStep: number;

  playing: boolean;

  visualizationMode:
    SVMVisualizationMode;

  experiments:
    SVMExperimentResult[];
};