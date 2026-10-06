export type LearningLevel =
  | "Basic"
  | "Medium"
  | "Advanced";

export type ParameterControlType =
  | "slider"
  | "select"
  | "number";

export type ParameterDefinition = {
  id: string;
  name: string;

  level: LearningLevel;

  controlType: ParameterControlType;

  description: string;
  whatItControls: string;

  lowValueEffect: string;
  highValueEffect: string;

  visualizationEffect: string;

  min?: number;
  max?: number;
  step?: number;

  defaultValue:
    | number
    | string;

  options?: string[];
};

export type ModelParameterRegistry = {
  modelId: string;
  modelName: string;

  parameters: ParameterDefinition[];
};

/*
========================================================
GRADIENT DESCENT
========================================================
*/

const gradientDescentParameters: ParameterDefinition[] = [
  {
    id: "learningRate",

    name: "Learning Rate",

    level: "Basic",

    controlType: "slider",

    description:
      "The learning rate controls how large a step Gradient Descent takes while moving toward the minimum loss.",

    whatItControls:
      "It controls how much the model changes its weight and bias during each Gradient Descent update.",

    lowValueEffect:
      "A very small learning rate usually moves safely toward the minimum, but training can become very slow.",

    highValueEffect:
      "A very large learning rate can overshoot the minimum, oscillate around it, or even make training diverge.",

    visualizationEffect:
      "ModelMind will animate the optimization point moving across the loss surface. Small values create short steps while large values create bigger jumps.",

    min: 0.001,
    max: 0.1,
    step: 0.001,

    defaultValue: 0.01,
  },

  {
    id: "iterations",

    name: "Number of Iterations",

    level: "Basic",

    controlType: "slider",

    description:
      "Iterations represent how many times Gradient Descent is allowed to update the model parameters.",

    whatItControls:
      "Every iteration calculates the current gradient and updates the weight and bias.",

    lowValueEffect:
      "Too few iterations can stop training before Gradient Descent reaches a good solution.",

    highValueEffect:
      "More iterations give the optimizer more opportunities to approach the minimum, although improvements eventually become very small.",

    visualizationEffect:
      "ModelMind will show each optimization step and the loss after every iteration.",

    min: 10,
    max: 500,
    step: 10,

    defaultValue: 100,
  },

  {
    id: "initialWeight",

    name: "Initial Weight",

    level: "Medium",

    controlType: "slider",

    description:
      "The initial weight is the starting value of the slope of the regression line before Gradient Descent begins.",

    whatItControls:
      "It determines the initial slope of the model and the starting position on the optimization surface.",

    lowValueEffect:
      "A smaller starting weight produces a flatter or negatively sloped initial regression line depending on its value.",

    highValueEffect:
      "A larger starting weight produces a steeper initial regression line.",

    visualizationEffect:
      "Changing this value moves the starting point of Gradient Descent and immediately changes the initial regression line.",

    min: -3,
    max: 5,
    step: 0.1,

    defaultValue: 0,
  },

  {
    id: "initialBias",

    name: "Initial Bias",

    level: "Medium",

    controlType: "slider",

    description:
      "The initial bias is the starting intercept of the regression line.",

    whatItControls:
      "Bias controls the vertical position of the regression line.",

    lowValueEffect:
      "A smaller bias moves the initial regression line downward.",

    highValueEffect:
      "A larger bias moves the initial regression line upward.",

    visualizationEffect:
      "ModelMind will vertically move the regression line when the starting bias changes.",

    min: -10,
    max: 10,
    step: 0.1,

    defaultValue: 0,
  },

  {
    id: "batchSize",

    name: "Batch Size",

    level: "Medium",

    controlType: "slider",

    description:
      "Batch size controls how many training examples are used to calculate a gradient update.",

    whatItControls:
      "It determines how much of the dataset contributes to each parameter update.",

    lowValueEffect:
      "Small batches produce more frequent and potentially noisier updates.",

    highValueEffect:
      "Large batches produce smoother gradient estimates but require more samples for each update.",

    visualizationEffect:
      "ModelMind will highlight which training samples are being used during each optimization step.",

    min: 1,
    max: 32,
    step: 1,

    defaultValue: 8,
  },

  {
    id: "gradientType",

    name: "Gradient Descent Type",

    level: "Basic",

    controlType: "select",

    description:
      "Gradient Descent can calculate parameter updates using the complete dataset, one sample, or a small batch of samples.",

    whatItControls:
      "It determines how training samples are selected for each gradient update.",

    lowValueEffect:
      "Different Gradient Descent types have different stability and computational behavior.",

    highValueEffect:
      "This is a categorical parameter rather than a low-to-high numerical parameter.",

    visualizationEffect:
      "ModelMind will animate different optimization paths so Batch, Stochastic, and Mini-Batch Gradient Descent can be compared visually.",

    defaultValue:
      "Batch Gradient Descent",

    options: [
      "Batch Gradient Descent",
      "Stochastic Gradient Descent",
      "Mini-Batch Gradient Descent",
    ],
  },

  {
    id: "lossFunction",

    name: "Loss Function",

    level: "Advanced",

    controlType: "select",

    description:
      "The loss function measures how far the model predictions are from the expected values.",

    whatItControls:
      "Gradient Descent tries to find parameter values that minimize this function.",

    lowValueEffect:
      "A lower loss indicates that the model predictions are closer to the training targets.",

    highValueEffect:
      "A higher loss indicates larger prediction errors.",

    visualizationEffect:
      "ModelMind will visualize the loss curve and optimization surface generated by the selected objective.",

    defaultValue:
      "Mean Squared Error",

    options: [
      "Mean Squared Error",
      "Mean Absolute Error",
    ],
  },
];

/*
========================================================
MODEL PARAMETER REGISTRY

More models will be added here:
- Linear Regression
- Logistic Regression
- KNN
- Decision Tree
- Random Forest
- SVM
- Naive Bayes
- K-Means
- PCA
- Ridge
- Lasso
- AdaBoost
- Gradient Boosting
========================================================
*/

export const modelParameterRegistry: ModelParameterRegistry[] =
  [
    {
      modelId:
        "gradient-descent",

      modelName:
        "Gradient Descent",

      parameters:
        gradientDescentParameters,
    },
  ];

/*
========================================================
HELPER FUNCTIONS
========================================================
*/

export function getModelParameters(
  modelId: string
) {
  return (
    modelParameterRegistry.find(
      (model) =>
        model.modelId ===
        modelId
    )?.parameters ?? []
  );
}

export function getParameter(
  modelId: string,
  parameterId: string
) {
  return getModelParameters(
    modelId
  ).find(
    (parameter) =>
      parameter.id ===
      parameterId
  );
}

export function getParametersByLevel(
  modelId: string,
  level: LearningLevel
) {
  const parameters =
    getModelParameters(modelId);

  if (level === "Advanced") {
    return parameters;
  }

  if (level === "Medium") {
    return parameters.filter(
      (parameter) =>
        parameter.level ===
          "Basic" ||
        parameter.level ===
          "Medium"
    );
  }

  return parameters.filter(
    (parameter) =>
      parameter.level ===
      "Basic"
  );
}