import type {
  SVMTask,
} from "../types/svm";

export type SVMVisualStep = {
  id: number;

  title: string;

  shortTitle: string;

  explanation: string;

  focus: string;

  formula?: string;
};

export const svcLearningSteps: SVMVisualStep[] = [
  {
    id: 1,
    shortTitle: "Data",
    title: "Meet the Data",
    explanation:
      "We start with two groups of observations. Our goal is to teach the machine how to separate Class A from Class B.",
    focus:
      "For now, ignore equations. Just look at where the two classes are located.",
  },

  {
    id: 2,
    shortTitle: "Separator",
    title: "Can We Separate Them?",
    explanation:
      "Many different boundaries might separate these two groups. SVM does not simply stop after finding the first separator.",
    focus:
      "Watch a candidate separating plane appear between the classes.",
  },

  {
    id: 3,
    shortTitle: "Hyperplane",
    title: "Meet the Hyperplane",
    explanation:
      "The central SVM decision boundary is called a hyperplane. In two-feature classification it can be represented by a line, while the visual learning scene displays it as a plane in 3D.",
    focus:
      "Points on opposite sides of the hyperplane receive different class predictions.",
    formula:
      "wᵀx + b = 0",
  },

  {
    id: 4,
    shortTitle: "Best Boundary",
    title: "Which Boundary Is Best?",
    explanation:
      "SVM searches for a boundary that creates a large separation from the closest observations rather than merely separating the training data.",
    focus:
      "Watch the candidate boundary move toward the maximum-margin solution.",
  },

  {
    id: 5,
    shortTitle: "Margin",
    title: "Create the Margin",
    explanation:
      "The margin is the gap around the decision boundary. A wider margin generally gives the classifier more room between the two classes.",
    focus:
      "The two additional planes show the positive and negative margin boundaries.",
    formula:
      "Margin width = 2 / ||w||",
  },

  {
    id: 6,
    shortTitle: "Support Vectors",
    title: "Meet the Support Vectors",
    explanation:
      "The closest influential training observations are called support vectors. They help determine the position of the SVM boundary.",
    focus:
      "Only now do we highlight the important points with rings.",
  },

  {
    id: 7,
    shortTitle: "C",
    title: "Hard vs Soft Margin",
    explanation:
      "Real datasets are not always perfectly separable. The C parameter controls how strongly the model penalizes margin violations.",
    focus:
      "Lower C allows more violations. Higher C penalizes them more strongly.",
  },

  {
    id: 8,
    shortTitle: "Kernel",
    title: "The Kernel Trick",
    explanation:
      "When a straight boundary cannot separate the data, kernels let SVM model nonlinear relationships through similarity in a transformed feature space.",
    focus:
      "Compare Linear, RBF and Polynomial behavior and inspect the transformed 3D view.",
    formula:
      "K(x,z) = φ(x)ᵀφ(z)",
  },

  {
    id: 9,
    shortTitle: "Prediction",
    title: "Make a Prediction",
    explanation:
      "After training, a new observation is placed relative to the learned decision boundary and assigned to a class.",
    focus:
      "Move the query point and see how its position changes the prediction.",
  },
];

export const svrLearningSteps: SVMVisualStep[] = [
  {
    id: 1,
    shortTitle: "Data",
    title: "Meet the Regression Data",
    explanation:
      "SVR works with a continuous numerical target. We begin with a small set of observations so the relationship is easy to see.",
    focus:
      "Look at the overall direction of the points before introducing the model.",
  },

  {
    id: 2,
    shortTitle: "Function",
    title: "Learn a Prediction Function",
    explanation:
      "Instead of separating classes, Support Vector Regression learns a function that predicts a numerical value.",
    focus:
      "Watch the prediction function appear through the data.",
  },

  {
    id: 3,
    shortTitle: "Epsilon",
    title: "Create the ε-Tube",
    explanation:
      "SVR creates a tolerance region around the prediction function. This region is called the epsilon-insensitive tube.",
    focus:
      "The upper and lower boundaries are separated from the prediction function by ε.",
    formula:
      "|y - ŷ| ≤ ε",
  },

  {
    id: 4,
    shortTitle: "Inside",
    title: "Points Inside the Tube",
    explanation:
      "Prediction errors inside the epsilon tube receive no epsilon-insensitive penalty.",
    focus:
      "Notice which observations already fall inside the tolerance region.",
  },

  {
    id: 5,
    shortTitle: "Outside",
    title: "Points Outside the Tube",
    explanation:
      "Observations outside the tube contribute to epsilon-insensitive loss.",
    focus:
      "Now focus on the observations whose residuals extend beyond the tube.",
    formula:
      "Lε = max(0, |y - ŷ| - ε)",
  },

  {
    id: 6,
    shortTitle: "Support Vectors",
    title: "SVR Support Vectors",
    explanation:
      "Important observations on or outside the epsilon boundary influence the learned SVR solution.",
    focus:
      "The influential observations are highlighted only at this step.",
  },

  {
    id: 7,
    shortTitle: "ε & C",
    title: "Control ε and C",
    explanation:
      "Epsilon changes the tolerance width while C changes how strongly deviations outside the tube are penalized.",
    focus:
      "Experiment with both parameters and watch the model respond.",
  },

  {
    id: 8,
    shortTitle: "Kernel",
    title: "Nonlinear SVR",
    explanation:
      "Kernel SVR can model curved relationships when a straight regression function is not sufficient.",
    focus:
      "Compare Linear, RBF and Polynomial kernels.",
  },

  {
    id: 9,
    shortTitle: "Prediction",
    title: "Predict a New Value",
    explanation:
      "The trained SVR model can now estimate the target for a new feature value.",
    focus:
      "Move the query value and inspect the predicted target and epsilon interval.",
  },
];

export function getLearningSteps(
  task: SVMTask
): SVMVisualStep[] {
  return task === "classification"
    ? svcLearningSteps
    : svrLearningSteps;
}