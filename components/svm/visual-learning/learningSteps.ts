import type {
  SVMTask,
} from "../types/svm";

export type SVMLearningStep = {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  focus:
    | "data"
    | "classes"
    | "boundary"
    | "margin"
    | "support-vectors"
    | "parameter"
    | "kernel"
    | "transformation"
    | "prediction";
};

const classificationSteps:
  SVMLearningStep[] = [
    {
      id: 1,
      title: "Observe the Raw Data",
      shortTitle: "Raw Data",
      description:
        "Start with the selected feature space. Each point represents one observation from the active dataset.",
      focus: "data",
    },
    {
      id: 2,
      title: "Identify the Classes",
      shortTitle: "Classes",
      description:
        "SVC learns from labeled observations. Colors separate the target classes that the model must distinguish.",
      focus: "classes",
    },
    {
      id: 3,
      title: "Explore Candidate Hyperplanes",
      shortTitle: "Candidates",
      description:
        "Several boundaries may separate the classes. SVM does not simply choose any separating boundary.",
      focus: "boundary",
    },
    {
      id: 4,
      title: "Choose the Maximum-Margin Hyperplane",
      shortTitle: "Best Boundary",
      description:
        "SVM searches for a decision boundary that creates the strongest separation between the classes.",
      focus: "boundary",
    },
    {
      id: 5,
      title: "Reveal the Margin",
      shortTitle: "Margin",
      description:
        "The margin is the region around the decision boundary. A larger useful margin generally improves separation.",
      focus: "margin",
    },
    {
      id: 6,
      title: "Find the Support Vectors",
      shortTitle: "Support Vectors",
      description:
        "The observations closest to the margin are the most influential points for positioning the SVM boundary.",
      focus: "support-vectors",
    },
    {
      id: 7,
      title: "Experiment with C",
      shortTitle: "C Parameter",
      description:
        "C controls the trade-off between a wider margin and penalizing classification violations.",
      focus: "parameter",
    },
    {
      id: 8,
      title: "Apply a Kernel",
      shortTitle: "Kernel",
      description:
        "When a straight boundary is insufficient, a kernel changes how similarity between observations is represented.",
      focus: "kernel",
    },
    {
      id: 9,
      title: "Transform the Feature Space",
      shortTitle: "3D Transform",
      description:
        "The kernel view reveals how nonlinear structure can become easier to separate in a transformed feature space.",
      focus: "transformation",
    },
    {
      id: 10,
      title: "Construct the Decision Boundary",
      shortTitle: "Decision",
      description:
        "The selected kernel and parameters determine the final decision function used for classification.",
      focus: "boundary",
    },
    {
      id: 11,
      title: "Predict a New Observation",
      shortTitle: "Prediction",
      description:
        "Move a query point through the feature space and inspect which side of the learned decision function it occupies.",
      focus: "prediction",
    },
  ];

const regressionSteps:
  SVMLearningStep[] = [
    {
      id: 1,
      title: "Observe the Regression Data",
      shortTitle: "Raw Data",
      description:
        "Each observation contains selected input features and a continuous target value.",
      focus: "data",
    },
    {
      id: 2,
      title: "Understand the SVR Goal",
      shortTitle: "SVR Goal",
      description:
        "SVR searches for a function that predicts continuous values while tolerating a controlled amount of error.",
      focus: "classes",
    },
    {
      id: 3,
      title: "Explore Candidate Functions",
      shortTitle: "Candidates",
      description:
        "Different functions can approximate the observations. SVR balances model simplicity and prediction error.",
      focus: "boundary",
    },
    {
      id: 4,
      title: "Build the Prediction Function",
      shortTitle: "Function",
      description:
        "The central regression function represents the model prediction across the selected feature space.",
      focus: "boundary",
    },
    {
      id: 5,
      title: "Reveal the Epsilon Tube",
      shortTitle: "ε-Tube",
      description:
        "Errors inside the epsilon-insensitive region are tolerated without the same penalty as larger violations.",
      focus: "margin",
    },
    {
      id: 6,
      title: "Identify Violations",
      shortTitle: "Violations",
      description:
        "Observations outside the epsilon tube contribute to the SVR optimization penalty.",
      focus: "margin",
    },
    {
      id: 7,
      title: "Find SVR Support Vectors",
      shortTitle: "Support Vectors",
      description:
        "Support vectors are the observations that meaningfully influence the learned regression function.",
      focus: "support-vectors",
    },
    {
      id: 8,
      title: "Experiment with C and Epsilon",
      shortTitle: "C + ε",
      description:
        "C controls the penalty for violations while epsilon controls the width of the insensitive tube.",
      focus: "parameter",
    },
    {
      id: 9,
      title: "Apply a Regression Kernel",
      shortTitle: "Kernel",
      description:
        "Kernel functions allow SVR to learn nonlinear relationships in the data.",
      focus: "kernel",
    },
    {
      id: 10,
      title: "Inspect the Final Regression Surface",
      shortTitle: "Final Model",
      description:
        "The final function combines the selected kernel and parameters to estimate the continuous target.",
      focus: "transformation",
    },
    {
      id: 11,
      title: "Predict a New Value",
      shortTitle: "Prediction",
      description:
        "Move a query observation and inspect the continuous value predicted by the SVR model.",
      focus: "prediction",
    },
  ];

export function getLearningSteps(
  task: SVMTask
) {
  return task === "classification"
    ? classificationSteps
    : regressionSteps;
}