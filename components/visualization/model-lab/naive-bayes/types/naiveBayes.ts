export type NaiveBayesVariant =
  | "gaussian"
  | "multinomial"
  | "bernoulli";

export type LearningLevel =
  | "basic"
  | "medium"
  | "advanced";

export type NBValue =
  | string
  | number
  | null;

export type NBRow = {
  id: number;
  features: Record<string, NBValue>;
  target: string;
};

export type NumericSummary = {
  mean: number;
  variance: number;
  stdDev: number;
};

export type GaussianFeatureStatistics = {
  feature: string;
  classLabel: string;
  mean: number;
  variance: number;
  stdDev: number;
};

export type ClassPrior = {
  classLabel: string;
  count: number;
  probability: number;
};

export type FeatureLikelihood = {
  feature: string;
  value: number;
  classLabel: string;
  likelihood: number;
};

export type ClassPredictionScore = {
  classLabel: string;

  prior: number;

  likelihoods: FeatureLikelihood[];

  logPrior: number;

  logLikelihood: number;

  logPosteriorScore: number;

  posteriorProbability: number;
};

export type NaiveBayesPrediction = {
  predictedClass: string;

  classScores: ClassPredictionScore[];
};

export type ConfusionMatrix = {
  labels: string[];
  matrix: number[][];
};

export type ClassificationMetrics = {
  accuracy: number;

  precision: number;

  recall: number;

  f1: number;

  confusionMatrix: ConfusionMatrix;
};

export type DatasetSplit = {
  train: NBRow[];
  test: NBRow[];
};

export type GaussianNBModel = {
  variant: "gaussian";

  classes: string[];

  features: string[];

  priors: Record<string, number>;

  statistics: Record<
    string,
    Record<
      string,
      NumericSummary
    >
  >;
};

export type MultinomialNBModel = {
  variant: "multinomial";

  classes: string[];

  features: string[];

  priors: Record<string, number>;

  featureCounts: Record<
    string,
    Record<string, number>
  >;

  classFeatureTotals: Record<
    string,
    number
  >;

  alpha: number;
};

export type BernoulliNBModel = {
  variant: "bernoulli";

  classes: string[];

  features: string[];

  priors: Record<string, number>;

  featureProbabilities: Record<
    string,
    Record<string, number>
  >;

  alpha: number;
};

export type NaiveBayesModel =
  | GaussianNBModel
  | MultinomialNBModel
  | BernoulliNBModel;