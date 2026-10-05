import type { DeepLessonRegistry } from "./lessonContentTypes";

export const regressionContent: DeepLessonRegistry = {
  // =========================================================
  // LINEAR REGRESSION
  // Existing ModelMind lab: CONNECT LATER
  // =========================================================

  "linear-regression": {
    overview:
      "Linear Regression is one of the most important supervised machine-learning algorithms. It predicts a continuous target by learning a linear relationship between input features and the output. Beyond prediction, it introduces foundational ideas such as coefficients, intercepts, residuals, loss functions, optimization, assumptions, overfitting and model evaluation.",

    objectives: [
      "Understand regression problems and continuous targets.",
      "Understand the equation of simple and multiple linear regression.",
      "Interpret slope, intercept and coefficients.",
      "Understand predictions and residuals.",
      "Understand Mean Squared Error.",
      "Understand ordinary least squares.",
      "Connect linear regression with gradient descent.",
      "Evaluate regression using MAE, MSE, RMSE and R².",
      "Understand important linear-regression assumptions.",
      "Recognize underfitting, overfitting and common implementation mistakes.",
    ],

    sections: [
      {
        id: "linear-regression-problem",
        title: "What Is a Regression Problem?",

        explanation: [
          "Supervised learning problems can broadly involve predicting categories or numerical quantities.",
          "Regression is used when the target is continuous or numerical.",
          "Examples include predicting house prices, temperature, sales, fuel consumption, delivery time and medical costs.",
          "Linear Regression attempts to describe the target as a linear combination of input features.",
        ],

        intuition: [
          "Imagine plotting house size against house price. If larger houses generally cost more, a line can summarize the overall relationship.",
        ],

        importantPoints: [
          "Regression predicts numerical quantities.",
          "Linear Regression is supervised learning.",
          "The model learns from feature-target pairs.",
          "The relationship is linear in the learned coefficients.",
        ],
      },

      {
        id: "linear-regression-equation",
        title: "Simple Linear Regression",

        explanation: [
          "With one input feature, Linear Regression is commonly written as y_hat = b0 + b1*x.",
          "y_hat represents the predicted target.",
          "b0 is the intercept.",
          "b1 is the coefficient or slope.",
          "x is the input feature.",
          "Training determines the values of b0 and b1 that best fit the training observations according to the optimization objective.",
        ],

        intuition: [
          "The intercept determines where the line begins when x is zero, while the slope controls how quickly the prediction changes as x changes.",
        ],

        importantPoints: [
          "Prediction: y_hat = b0 + b1*x.",
          "b0 is the intercept.",
          "b1 is the slope.",
          "Positive slope indicates an increasing relationship.",
          "Negative slope indicates a decreasing relationship.",
        ],
      },

      {
        id: "linear-regression-multiple",
        title: "Multiple Linear Regression",

        explanation: [
          "Real datasets usually contain several features.",
          "Multiple Linear Regression extends the model to y_hat = b0 + b1*x1 + b2*x2 + ... + bn*xn.",
          "Each feature receives its own coefficient.",
          "A coefficient describes the model's change in prediction associated with a one-unit increase in that feature while the other included features are held constant.",
          "Coefficient interpretation depends on feature representation and model assumptions.",
        ],

        intuition: [
          "Instead of predicting house price only from area, the model can simultaneously use area, bedrooms, age and other features.",
        ],

        importantPoints: [
          "One coefficient is learned per input feature.",
          "Coefficient signs indicate the direction of the fitted relationship.",
          "Coefficient magnitudes depend on feature units and scale.",
          "Correlation between predictors can make coefficient interpretation unstable.",
        ],
      },

      {
        id: "linear-regression-residuals",
        title: "Predictions and Residuals",

        explanation: [
          "The difference between an observed target and its prediction is called a residual.",
          "A common definition is residual = y - y_hat.",
          "Residuals help diagnose where and how the model makes errors.",
          "A strong model should not show obvious systematic structure in residuals when its assumptions are appropriate.",
        ],

        intuition: [
          "The fitted line represents the model's expectation. The vertical gap between an observed point and the fitted prediction is its residual.",
        ],

        importantPoints: [
          "Residual = actual - predicted.",
          "Residuals can be positive or negative.",
          "Residual analysis is useful for model diagnostics.",
          "Patterns in residuals can reveal model misspecification.",
        ],
      },

      {
        id: "linear-regression-loss",
        title: "Mean Squared Error and Least Squares",

        explanation: [
          "A model needs an objective that measures prediction error.",
          "Squared error for one observation is (y - y_hat)^2.",
          "Mean Squared Error averages squared errors across observations.",
          "Ordinary least squares chooses coefficients that minimize the sum of squared residuals.",
          "Squaring prevents positive and negative errors from cancelling and penalizes large errors more strongly.",
        ],

        intuition: [
          "Imagine moving the regression line until the total squared vertical error between observations and predictions becomes as small as possible.",
        ],

        importantPoints: [
          "MSE is always non-negative.",
          "Large residuals receive stronger penalties because of squaring.",
          "Least squares is sensitive to extreme target errors.",
          "Lower training error alone does not guarantee better generalization.",
        ],
      },

      {
        id: "linear-regression-assumptions",
        title: "Important Linear Regression Assumptions",

        explanation: [
          "Classical Linear Regression inference relies on assumptions about the relationship and residual behavior.",
          "The target is assumed to be linearly related to the predictors in the specified model form.",
          "Residual variance is ideally approximately constant across fitted values, a property called homoscedasticity.",
          "Observations or errors should satisfy the independence assumptions appropriate to the data-generating process.",
          "Strong multicollinearity can make coefficient estimates unstable.",
          "Normality of residuals is particularly relevant to some classical statistical inference procedures, not as a universal requirement for producing predictions.",
        ],

        intuition: [
          "A straight-line model works best when the structure in the data can reasonably be represented by that form.",
        ],

        importantPoints: [
          "Check linearity.",
          "Inspect residual patterns.",
          "Watch for heteroscedasticity.",
          "Investigate multicollinearity.",
          "Do not confuse assumptions needed for inference with absolute requirements for prediction.",
        ],
      },

      {
        id: "linear-regression-metrics",
        title: "Regression Evaluation Metrics",

        explanation: [
          "MAE calculates the average absolute prediction error.",
          "MSE calculates the average squared prediction error.",
          "RMSE is the square root of MSE and therefore has the same units as the target.",
          "R² describes how much of the target variance is explained relative to a baseline that predicts the target mean.",
          "R² can be negative on unseen data when predictions are worse than that baseline.",
        ],

        intuition: [
          "Different metrics answer different questions. MAE describes typical absolute error, while RMSE reacts more strongly to large errors.",
        ],

        importantPoints: [
          "MAE is relatively less sensitive to extreme errors than MSE.",
          "RMSE uses the target's units.",
          "Higher R² is generally better when comparisons are otherwise appropriate.",
          "R² is not the same as prediction accuracy.",
          "Evaluate on unseen data.",
        ],
      },
    ],

    visualization: {
      type: "model-lab",
      visualizationId: "linear-regression",
      title: "Linear Regression Model Lab",
      description:
        "Open the existing ModelMind Linear Regression Lab to interact with slope, intercept, residuals, loss and fitted regression lines.",
    },

    codeExamples: [
      {
        id: "linear-regression-sklearn",
        title: "Linear Regression with Scikit-Learn",
        description:
          "Train and evaluate a simple regression model using a leakage-safe train/test split.",
        language: "python",

        code: `import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from sklearn.model_selection import train_test_split

X = np.array([
    [500],
    [650],
    [800],
    [950],
    [1100],
    [1250],
    [1400],
    [1600],
    [1800],
    [2000]
])

y = np.array([
    25,
    31,
    38,
    43,
    50,
    57,
    63,
    72,
    80,
    91
])

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = LinearRegression()

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

mae = mean_absolute_error(
    y_test,
    predictions
)

mse = mean_squared_error(
    y_test,
    predictions
)

rmse = np.sqrt(mse)

r2 = r2_score(
    y_test,
    predictions
)

print(
    "Intercept:",
    model.intercept_
)

print(
    "Coefficient:",
    model.coef_
)

print(
    "Predictions:",
    predictions
)

print(
    "MAE:",
    mae
)

print(
    "MSE:",
    mse
)

print(
    "RMSE:",
    rmse
)

print(
    "R2:",
    r2
)`,

        explanation: [
          "X contains the predictor and y contains the continuous target.",
          "train_test_split creates independent training and test subsets.",
          "LinearRegression.fit learns the intercept and coefficient from training observations.",
          "predict generates estimates for unseen test observations.",
          "MAE, MSE, RMSE and R² describe different aspects of predictive performance.",
        ],

        commonMistakes: [
          "Evaluating only on training data.",
          "Confusing regression with classification.",
          "Interpreting R² as classification accuracy.",
          "Ignoring residual patterns.",
          "Assuming correlation automatically proves causation.",
        ],
      },

      {
        id: "linear-regression-from-scratch",
        title: "Simple Linear Regression from Scratch",
        description:
          "Calculate the slope and intercept analytically for one feature.",
        language: "python",

        code: `import numpy as np

x = np.array([
    1,
    2,
    3,
    4,
    5
], dtype=float)

y = np.array([
    2,
    4,
    5,
    4,
    5
], dtype=float)

x_mean = np.mean(x)
y_mean = np.mean(y)

numerator = np.sum(
    (x - x_mean)
    *
    (y - y_mean)
)

denominator = np.sum(
    (x - x_mean) ** 2
)

slope = numerator / denominator

intercept = (
    y_mean
    -
    slope * x_mean
)

predictions = (
    intercept
    +
    slope * x
)

print(
    "Slope:",
    slope
)

print(
    "Intercept:",
    intercept
)

print(
    "Predictions:",
    predictions
)`,

        explanation: [
          "The slope measures how x and y vary together relative to the variation in x.",
          "The intercept is chosen so the fitted line passes through the point defined by the feature mean and target mean.",
          "This closed-form reasoning is useful for understanding simple one-dimensional least-squares regression.",
        ],

        commonMistakes: [
          "Using this simple formula directly for arbitrary multi-feature problems.",
          "Dividing by zero when x has no variation.",
          "Confusing the analytical solution with gradient descent.",
        ],
      },
    ],

    practice: [
      {
        id: "linear-practice-1",
        title: "Regression or Classification?",
        type: "concept",
        difficulty: "basic",
        question:
          "You need to predict tomorrow's electricity consumption in kWh. Is this primarily a regression or classification problem?",
        instructions: [
          "Identify the type of target.",
        ],
        hints: [
          "The output is a numerical quantity.",
        ],
        explanation:
          "It is a regression problem because electricity consumption is a continuous numerical target.",
      },

      {
        id: "linear-practice-2",
        title: "Use the Equation",
        type: "concept",
        difficulty: "basic",
        question:
          "A model is y_hat = 10 + 4x. What does it predict when x = 5?",
        instructions: [
          "Substitute x into the equation.",
        ],
        hints: [
          "10 + 4 × 5.",
        ],
        explanation:
          "The prediction is 30.",
      },

      {
        id: "linear-practice-3",
        title: "Interpret the Slope",
        type: "analysis",
        difficulty: "medium",
        question:
          "A house-price model has an area coefficient of 0.06 when area is measured in square feet and price is measured in thousands of rupees. Interpret the coefficient carefully.",
        instructions: [
          "State the units.",
          "Assume other included features remain fixed.",
        ],
        hints: [
          "A one-square-foot increase changes the fitted prediction by 0.06 thousand rupees.",
        ],
        explanation:
          "Holding other included predictors fixed, one additional square foot is associated in the fitted model with an increase of 0.06 thousand rupees in predicted price. This is an association in the model, not automatically a causal effect.",
      },

      {
        id: "linear-practice-4",
        title: "Residual Calculation",
        type: "concept",
        difficulty: "medium",
        question:
          "The actual target is 80 and the prediction is 72. Using residual = actual - predicted, calculate the residual.",
        instructions: [
          "Subtract predicted from actual.",
        ],
        hints: [
          "80 - 72.",
        ],
        explanation:
          "The residual is 8.",
      },

      {
        id: "linear-practice-5",
        title: "MAE vs RMSE",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Two models have similar typical errors, but one occasionally produces extremely large mistakes. Which metric, MAE or RMSE, will generally react more strongly to those extreme errors?",
        instructions: [
          "Think about squared errors.",
        ],
        hints: [
          "RMSE is derived from squared residuals.",
        ],
        explanation:
          "RMSE generally reacts more strongly because large errors are squared before averaging.",
      },

      {
        id: "linear-practice-6",
        title: "Residual Diagnosis",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A residual plot shows a strong U-shaped pattern. What might this suggest about the fitted linear model?",
        instructions: [
          "Think about whether a straight-line relationship captures the pattern.",
        ],
        hints: [
          "Systematic curvature remains in the errors.",
        ],
        explanation:
          "It suggests that the linear specification may be missing nonlinear structure. A transformed or nonlinear representation may be more appropriate.",
      },
    ],

    commonMistakes: [
      {
        id: "linear-mistake-1",
        title: "R² equals accuracy",
        description:
          "R² is sometimes incorrectly described as classification-style accuracy.",
        correction:
          "Treat R² as a regression goodness-of-fit metric relative to a mean-prediction baseline.",
      },

      {
        id: "linear-mistake-2",
        title: "Correlation means causation",
        description:
          "A fitted coefficient represents an association under the model, not automatic causal evidence.",
        correction:
          "Use causal language only when the study design and assumptions justify it.",
      },

      {
        id: "linear-mistake-3",
        title: "Ignoring residuals",
        description:
          "A single headline metric can hide systematic modeling problems.",
        correction:
          "Inspect residual behavior alongside quantitative evaluation metrics.",
      },
    ],

    keyTakeaways: [
      "Linear Regression predicts continuous numerical targets.",
      "The model learns an intercept and feature coefficients.",
      "Residuals measure differences between actual and predicted values.",
      "Ordinary least squares minimizes squared residuals.",
      "MAE, MSE, RMSE and R² describe different aspects of performance.",
      "Residual analysis helps diagnose model problems.",
      "Coefficient interpretation depends on units and model context.",
      "A simple linear relationship may underfit nonlinear data.",
    ],
  },


  // =========================================================
  // GRADIENT DESCENT
  // Existing ModelMind lab: CONNECT LATER
  // NOTE:
  // Keep this lesson here. If gradient-descent has not yet been
  // added to skills.ts, add the skill later before scheduling it.
  // =========================================================

  "gradient-descent": {
    overview:
      "Gradient Descent is a general optimization algorithm used to minimize a loss function. Instead of directly calculating the best model parameters, it repeatedly measures how the loss changes with respect to those parameters and moves them in the direction that reduces the loss.",

    objectives: [
      "Understand optimization in machine learning.",
      "Understand parameters and loss functions.",
      "Understand gradients intuitively.",
      "Understand the Gradient Descent update rule.",
      "Understand learning rate.",
      "Recognize convergence and divergence.",
      "Understand batch, stochastic and mini-batch Gradient Descent.",
      "Connect Gradient Descent to Linear Regression.",
      "Understand the effect of feature scaling on optimization.",
    ],

    sections: [
      {
        id: "gd-optimization",
        title: "Optimization in Machine Learning",

        explanation: [
          "Training many machine-learning models can be viewed as an optimization problem.",
          "The model contains parameters such as weights and biases.",
          "A loss function measures how poorly the current parameters fit the training data.",
          "Optimization searches for parameter values that reduce this loss.",
        ],

        intuition: [
          "Imagine standing somewhere on a landscape where height represents loss. Training means finding a lower point on that landscape.",
        ],

        importantPoints: [
          "Parameters are learned during training.",
          "Loss measures model error according to an objective.",
          "Optimization adjusts parameters.",
        ],
      },

      {
        id: "gd-gradient",
        title: "What Is a Gradient?",

        explanation: [
          "A derivative measures how a function changes as one variable changes.",
          "For several parameters, the gradient contains partial derivatives with respect to each parameter.",
          "The gradient points in the direction of steepest local increase.",
          "Gradient Descent therefore moves in the negative-gradient direction to reduce the objective locally.",
        ],

        intuition: [
          "If the gradient points uphill, moving in the opposite direction takes us downhill.",
        ],

        importantPoints: [
          "Gradient describes local change.",
          "The gradient has one component per parameter.",
          "Gradient Descent moves opposite the gradient.",
        ],
      },

      {
        id: "gd-update",
        title: "Gradient Descent Update Rule",

        explanation: [
          "The basic update is parameter_new = parameter_old - learning_rate × gradient.",
          "The gradient determines direction and local sensitivity.",
          "The learning rate controls step size.",
          "The process repeats until a stopping criterion is reached.",
        ],

        intuition: [
          "The gradient tells us which direction slopes upward; the learning rate decides how large a downhill step to take.",
        ],

        importantPoints: [
          "Subtract the gradient.",
          "Learning rate controls step size.",
          "Updates occur repeatedly.",
        ],
      },

      {
        id: "gd-learning-rate",
        title: "Learning Rate",

        explanation: [
          "A learning rate that is too small can make training very slow.",
          "A learning rate that is too large can overshoot useful regions and may cause oscillation or divergence.",
          "A suitable learning rate allows stable progress toward lower loss.",
          "The best learning-rate behavior depends on the optimization problem.",
        ],

        intuition: [
          "Tiny downhill steps are safe but slow. Huge jumps can repeatedly cross the valley or escape it entirely.",
        ],

        importantPoints: [
          "Too small can be slow.",
          "Too large can be unstable.",
          "Monitor the loss during optimization.",
        ],
      },

      {
        id: "gd-types",
        title: "Batch, Stochastic and Mini-Batch Gradient Descent",

        explanation: [
          "Batch Gradient Descent computes an update using the full training dataset.",
          "Stochastic Gradient Descent updates using one training observation at a time.",
          "Mini-batch Gradient Descent uses a subset of observations for each update.",
          "Mini-batches are widely used in large-scale machine learning and deep learning.",
        ],

        intuition: [
          "The methods differ mainly in how much training data is consulted before each parameter update.",
        ],

        importantPoints: [
          "Batch uses all training observations per update.",
          "SGD uses one observation per update.",
          "Mini-batch uses a subset.",
          "Stochastic updates are noisier but can be computationally efficient.",
        ],
      },

      {
        id: "gd-scaling",
        title: "Feature Scaling and Gradient Descent",

        explanation: [
          "When features have very different scales, the optimization surface can become poorly conditioned.",
          "Gradient Descent may then move inefficiently across elongated contours.",
          "Standardizing numerical features can often make optimization more stable and efficient.",
        ],

        intuition: [
          "Instead of descending a narrow stretched valley by zig-zagging, scaling can make the landscape easier to navigate.",
        ],

        importantPoints: [
          "Feature scale can affect optimization speed.",
          "Scaling is especially useful for many gradient-based models.",
          "Scaling must still be fitted without data leakage.",
        ],
      },      {
        id: "gd-loss-surface",
        title: "Loss Surface and Parameter Space",

        explanation: [
          "Gradient Descent does not directly search through predictions. It searches through model parameter values.",
          "Every possible combination of parameters corresponds to a point in parameter space.",
          "The loss function assigns a loss value to each point in that parameter space.",
          "If a model has two trainable parameters, we can imagine the loss as a three-dimensional surface where the horizontal axes represent the parameters and height represents loss.",
          "Training means moving through this parameter space toward parameter combinations that produce lower loss.",
          "For models with many parameters, the surface cannot be directly visualized, but the same mathematical idea still applies.",
        ],

        intuition: [
          "Imagine a mountain landscape. Your horizontal position represents the current parameter values and your height represents model error.",
          "Gradient Descent repeatedly asks: which nearby direction goes downhill fastest?",
        ],

        importantPoints: [
          "Parameter space contains possible model parameter values.",
          "The loss surface maps parameters to loss.",
          "Gradient Descent follows local slope information.",
          "Real machine-learning models can have very high-dimensional loss surfaces.",
        ],
      },

      {
        id: "gd-derivatives",
        title: "Derivatives, Partial Derivatives and the Gradient Vector",

        explanation: [
          "A derivative describes how a function changes when one variable changes.",
          "Machine-learning models usually contain multiple trainable parameters, so we calculate a partial derivative for each parameter.",
          "A partial derivative measures how the loss changes with respect to one parameter while considering the other parameters as fixed for that local calculation.",
          "All partial derivatives are collected into a gradient vector.",
          "If the parameters are theta_1, theta_2, ..., theta_n, then the gradient contains dJ/dtheta_1, dJ/dtheta_2, ..., dJ/dtheta_n.",
          "The gradient therefore contains both direction and local sensitivity information for the optimization problem.",
        ],

        intuition: [
          "With one parameter there is one slope.",
          "With many parameters there are many slopes at the same time.",
          "The gradient packages those slopes into one vector that tells the optimizer how the loss locally changes.",
        ],

        importantPoints: [
          "Derivative: change with respect to one variable.",
          "Partial derivative: change with respect to one parameter in a multivariable function.",
          "Gradient: vector containing all relevant partial derivatives.",
          "Gradient Descent moves opposite the gradient.",
        ],
      },

      {
        id: "gd-mathematics",
        title: "Mathematics of the Gradient Descent Update",

        explanation: [
          "The general Gradient Descent update can be written as theta_new = theta_old - alpha * gradient(J(theta)).",
          "Theta represents the trainable parameters.",
          "J(theta) represents the objective or loss function.",
          "The gradient describes how the objective locally changes with respect to the parameters.",
          "Alpha is the learning rate.",
          "Because the gradient points toward steepest local increase, subtracting it produces a step toward local decrease.",
          "This update is repeated until the optimization process satisfies a stopping condition.",
        ],

        intuition: [
          "Direction comes from the gradient.",
          "Step size comes from the learning rate.",
          "The new parameter value is simply the old value moved slightly downhill.",
        ],

        importantPoints: [
          "theta represents parameters.",
          "J represents the objective.",
          "alpha represents learning rate.",
          "The negative sign creates descent rather than ascent.",
          "Gradient Descent is iterative.",
        ],
      },

      {
        id: "gd-epochs-iterations",
        title: "Iterations, Updates and Epochs",

        explanation: [
          "An update occurs whenever Gradient Descent changes the model parameters.",
          "An iteration commonly refers to one optimization step, although exact terminology can vary by library.",
          "An epoch means one complete pass through the training dataset.",
          "For Batch Gradient Descent, one full-dataset gradient calculation typically produces one update per epoch.",
          "For SGD, many parameter updates can occur during one epoch because observations are processed individually.",
          "For mini-batch Gradient Descent, the number of updates per epoch is approximately the number of training observations divided by the batch size.",
        ],

        intuition: [
          "An epoch asks whether the optimizer has seen the entire training dataset once.",
          "An update asks whether the parameters have changed once.",
          "These are not always the same thing.",
        ],

        importantPoints: [
          "Epoch and update are different concepts.",
          "Batch GD usually performs relatively few expensive updates.",
          "SGD performs many inexpensive noisy updates.",
          "Mini-batch GD lies between the two.",
        ],
      },

      {
        id: "gd-batch",
        title: "Batch Gradient Descent in Depth",

        explanation: [
          "Batch Gradient Descent calculates the gradient using the entire training dataset before updating the parameters.",
          "Because every training observation contributes to each update, the calculated gradient is deterministic for a fixed dataset and fixed parameters.",
          "Its loss trajectory is generally smoother than stochastic methods.",
          "The disadvantage is that every update can become computationally expensive when the dataset is very large.",
          "The full training data must be processed before another parameter update is produced.",
        ],

        intuition: [
          "Before taking one step downhill, Batch Gradient Descent asks every training example for its opinion about the direction.",
        ],

        importantPoints: [
          "Uses the complete training set per gradient calculation.",
          "Produces relatively stable gradient estimates.",
          "Can be expensive for large datasets.",
          "Works naturally with vectorized numerical computation.",
        ],
      },

      {
        id: "gd-sgd",
        title: "Stochastic Gradient Descent (SGD) in Depth",

        explanation: [
          "Stochastic Gradient Descent estimates the gradient from one training observation at a time.",
          "The parameters can therefore be updated after every observation.",
          "Individual observations provide noisy estimates of the full-dataset gradient.",
          "This noise makes the optimization path fluctuate rather than move smoothly.",
          "The noisy movement can sometimes help optimization move away from unfavorable local structures or flat regions.",
          "Training examples are commonly shuffled between epochs so the optimizer does not repeatedly encounter observations in exactly the same order.",
        ],

        intuition: [
          "Instead of asking the entire dataset which way to move, SGD asks one observation and immediately takes a step.",
          "That makes the path fast and reactive but noisy.",
        ],

        importantPoints: [
          "One observation contributes to each stochastic update.",
          "Updates are frequent.",
          "The optimization path is noisy.",
          "Shuffling training observations is usually important.",
          "Learning-rate behavior strongly affects SGD convergence.",
        ],
      },

      {
        id: "gd-mini-batch",
        title: "Mini-Batch Gradient Descent in Depth",

        explanation: [
          "Mini-batch Gradient Descent calculates each gradient from a small subset of the training observations.",
          "The batch size determines how many observations contribute to one gradient estimate.",
          "Mini-batches reduce some of the noise of pure SGD while avoiding the cost of processing the complete dataset for every update.",
          "Mini-batch operations can also make efficient use of vectorized CPU and accelerator hardware.",
          "For this reason, mini-batch optimization is extremely common in large-scale machine learning and neural-network training.",
        ],

        intuition: [
          "Mini-batch Gradient Descent asks a small committee of training examples before taking each step.",
          "The committee gives a more stable opinion than one observation without requiring the entire dataset.",
        ],

        importantPoints: [
          "Uses a subset of observations per update.",
          "Batch size controls the subset size.",
          "Balances gradient stability and update frequency.",
          "Widely used in deep learning.",
        ],
      },

      {
        id: "gd-types-comparison",
        title: "Batch vs SGD vs Mini-Batch Gradient Descent",

        explanation: [
          "Batch Gradient Descent uses all observations for each gradient calculation.",
          "SGD uses one observation for each stochastic gradient estimate.",
          "Mini-batch Gradient Descent uses a small subset.",
          "Batch gradients are generally more stable but each update is more expensive.",
          "SGD updates are cheap and frequent but noisy.",
          "Mini-batches provide a practical compromise between computational efficiency and gradient stability.",
          "There is no universally best variant; dataset size, hardware, objective geometry and model architecture influence the choice.",
        ],

        intuition: [
          "Batch = ask everyone before moving.",
          "SGD = ask one person and move immediately.",
          "Mini-batch = ask a small group and then move.",
        ],

        importantPoints: [
          "Batch: stable but potentially expensive.",
          "SGD: frequent and noisy.",
          "Mini-batch: practical compromise.",
          "Batch size changes both optimization behavior and computational characteristics.",
        ],
      },

      {
        id: "gd-convergence",
        title: "Convergence and Stopping Criteria",

        explanation: [
          "Convergence means the optimization process has reached a state where further updates produce little meaningful improvement according to the chosen criterion.",
          "Gradient Descent should not necessarily run forever.",
          "Training may stop after a maximum number of iterations or epochs.",
          "It may also stop when the improvement in loss becomes smaller than a tolerance.",
          "Another criterion can examine whether the magnitude of the gradient or parameter change has become sufficiently small.",
          "In practical machine learning, validation performance may also be monitored through early stopping when appropriate.",
        ],

        intuition: [
          "When every additional downhill step becomes extremely small and the loss barely improves, continuing optimization may provide little benefit.",
        ],

        importantPoints: [
          "Maximum iterations prevent endless training.",
          "Tolerance can detect very small improvement.",
          "Gradient magnitude can provide convergence information.",
          "Validation-based early stopping is different from simply minimizing training loss.",
        ],
      },

      {
        id: "gd-convexity",
        title: "Convex and Non-Convex Optimization",

        explanation: [
          "A convex objective has a structure where any local minimum is also a global minimum.",
          "Ordinary least-squares Linear Regression produces a convex quadratic objective with respect to its coefficients.",
          "Non-convex objectives can contain more complicated geometry including multiple local structures and saddle points.",
          "Deep neural networks generally involve non-convex optimization.",
          "Gradient-based optimization remains useful in non-convex settings even though reaching a mathematically guaranteed global minimum is generally more difficult.",
        ],

        intuition: [
          "A simple convex bowl has one bottom region.",
          "A complicated non-convex landscape can contain valleys, ridges, flat regions and saddle-like structures.",
        ],

        importantPoints: [
          "Convexity gives useful optimization guarantees.",
          "Linear Regression with MSE is a classic convex example.",
          "Neural-network optimization is generally non-convex.",
          "Gradient Descent uses local information regardless of the global shape.",
        ],
      },

      {
        id: "gd-minima-saddles",
        title: "Local Minima, Global Minima and Saddle Points",

        explanation: [
          "A global minimum has the lowest objective value over the entire considered parameter space.",
          "A local minimum is lower than nearby points but may not be the lowest point globally.",
          "A saddle point can have zero or small gradient while behaving like a minimum along some directions and a maximum along others.",
          "Small gradients therefore do not automatically prove that the globally best parameter configuration has been found.",
          "The importance of these structures depends heavily on the objective being optimized.",
        ],

        intuition: [
          "A local minimum is a small valley.",
          "A global minimum is the deepest valley.",
          "A saddle point resembles a mountain pass: downhill in one direction and uphill in another.",
        ],

        importantPoints: [
          "Local and global minima are different.",
          "Zero gradient does not always imply a minimum.",
          "Saddle points matter especially in high-dimensional optimization.",
        ],
      },

      {
        id: "gd-initialization",
        title: "Parameter Initialization",

        explanation: [
          "Gradient Descent requires starting parameter values.",
          "For simple convex problems, different reasonable initializations may still converge toward the same optimum.",
          "For non-convex models, initialization can influence the optimization path and final solution.",
          "Initialization also interacts with gradient magnitude, activation behavior and numerical stability in neural networks.",
          "The appropriate initialization strategy therefore depends on the model.",
        ],

        intuition: [
          "Gradient Descent must begin somewhere on the landscape.",
          "On a simple bowl the starting location may mostly affect travel time, while on a complicated landscape it can affect which region is reached.",
        ],

        importantPoints: [
          "Optimization needs an initial parameter state.",
          "Initialization is less problematic for simple convex objectives.",
          "Initialization can matter substantially for non-convex models.",
        ],
      },

      {
        id: "gd-learning-rate-schedules",
        title: "Learning-Rate Schedules",

        explanation: [
          "A fixed learning rate uses the same step-size multiplier throughout training.",
          "A learning-rate schedule changes the learning rate as optimization progresses.",
          "A common idea is to begin with larger steps and reduce the learning rate later so the optimizer can make finer adjustments.",
          "Schedules can be based on time, epochs, performance plateaus or other rules.",
          "Adaptive optimizers used in deep learning go further by adjusting effective update behavior using information from previous gradients.",
        ],

        intuition: [
          "Take larger steps when far from the destination and smaller steps when trying to settle into a useful region.",
        ],

        importantPoints: [
          "Learning rate does not have to remain constant.",
          "Decay can improve late-stage stability.",
          "Schedules and adaptive optimizers are related to, but not identical with, basic Gradient Descent.",
        ],
      },

      {
        id: "gd-failure-diagnosis",
        title: "Diagnosing Gradient Descent Problems",

        explanation: [
          "If loss rapidly increases or becomes numerically unstable, the learning rate may be too large or the data may have numerical scaling problems.",
          "If loss decreases extremely slowly, the learning rate may be too small, the features may be poorly scaled, or the objective may be poorly conditioned.",
          "Repeated oscillation can indicate steps that are too aggressive along one or more directions.",
          "A nearly flat loss curve does not always mean successful convergence; gradients can also become extremely small in problematic regions.",
          "Monitoring training and validation curves helps distinguish optimization problems from generalization problems.",
        ],

        intuition: [
          "The loss curve is like a dashboard for the optimizer: its shape provides clues about what the training process is doing.",
        ],

        importantPoints: [
          "Increasing loss can indicate divergence.",
          "Slow loss reduction can indicate tiny steps or poor conditioning.",
          "Oscillation can indicate overly aggressive updates.",
          "Optimization failure and overfitting are different problems.",
        ],
      },

      {
        id: "gd-linear-regression",
        title: "Gradient Descent for Linear Regression",

        explanation: [
          "Linear Regression can be trained by minimizing Mean Squared Error.",
          "The gradients of MSE with respect to the coefficients and intercept tell us how those parameters should change.",
          "Gradient Descent repeatedly updates the coefficients and intercept until the objective sufficiently decreases.",
          "Linear Regression also has analytical least-squares solutions, so Gradient Descent is not the only way to train it.",
          "Gradient-based training becomes especially useful as we move toward models and optimization settings where a convenient direct solution is unavailable or undesirable.",
        ],

        intuition: [
          "The line begins with imperfect slope and intercept values and repeatedly adjusts them according to how those values contribute to prediction error.",
        ],

        importantPoints: [
          "MSE is commonly used for Linear Regression.",
          "Weights and intercept are trainable parameters.",
          "Ordinary least squares also has analytical solution methods.",
          "Gradient Descent provides an iterative alternative.",
        ],
      },

      {
        id: "gd-logistic-regression",
        title: "Gradient Descent and Logistic Regression",

        explanation: [
          "Logistic Regression is commonly trained by optimizing a log-loss or negative log-likelihood objective rather than Mean Squared Error.",
          "The coefficients still receive gradient-based updates.",
          "The optimization principle remains the same: calculate how the objective changes with respect to parameters and update them toward lower loss.",
          "This demonstrates that Gradient Descent is a general optimization idea rather than an algorithm restricted to Linear Regression.",
        ],

        intuition: [
          "The model changes, the loss changes, but the downhill optimization idea remains.",
        ],

        importantPoints: [
          "Gradient Descent is not specific to regression with MSE.",
          "Logistic Regression commonly uses log loss.",
          "Different models produce different objective functions and gradients.",
        ],
      },

      {
        id: "gd-regularization",
        title: "Gradient Descent and Regularization",

        explanation: [
          "Regularization can be incorporated into an optimization objective by adding a penalty term.",
          "With L2 regularization, the objective contains a penalty related to squared coefficient magnitude.",
          "The gradient then includes the effect of both prediction loss and the regularization penalty.",
          "L1 regularization introduces absolute-value penalties and requires care because the objective is not differentiable at zero in the ordinary derivative sense.",
          "Optimization methods can therefore differ depending on the form of regularization.",
        ],

        intuition: [
          "The optimizer is no longer asked only to fit the data. It is asked to balance fitting the data with the penalty imposed on model complexity.",
        ],

        importantPoints: [
          "Regularization changes the optimization objective.",
          "L2 contributes a smooth coefficient penalty.",
          "L1 has special optimization considerations around zero.",
          "Do not confuse the regularization strength with the Gradient Descent learning rate.",
        ],
      },

      {
        id: "gd-neural-networks",
        title: "Gradient Descent, Backpropagation and Neural Networks",

        explanation: [
          "Neural networks can contain thousands, millions or billions of trainable parameters.",
          "Backpropagation efficiently computes gradients of the loss with respect to those parameters by applying the chain rule through the network.",
          "An optimizer then uses those gradients to update the parameters.",
          "Backpropagation and Gradient Descent therefore play different roles: backpropagation calculates gradients, while the optimization algorithm decides how those gradients are used to update parameters.",
          "Mini-batch optimization is especially common in neural-network training.",
        ],

        intuition: [
          "Backpropagation answers 'how did each parameter contribute to the error?'",
          "The optimizer answers 'given those gradients, how should the parameters change?'",
        ],

        importantPoints: [
          "Backpropagation computes gradients.",
          "Optimization uses gradients.",
          "They are related but not the same process.",
          "Mini-batches are common in deep learning.",
        ],
      },

      {
        id: "gd-practical-workflow",
        title: "Practical Gradient Descent Workflow",

        explanation: [
          "Start by defining the model and objective function.",
          "Prepare the training data and scale numerical features when the model and optimization method benefit from it.",
          "Initialize the trainable parameters.",
          "Choose an optimization variant and initial learning-rate strategy.",
          "Calculate predictions and loss.",
          "Calculate gradients.",
          "Update parameters.",
          "Track the objective and relevant validation metrics.",
          "Diagnose divergence, oscillation, slow progress and overfitting separately.",
          "Stop according to an appropriate convergence or training criterion.",
        ],

        intuition: [
          "Gradient Descent is best understood as a repeated feedback loop: predict, measure error, calculate direction, update, and inspect what happened.",
        ],

        importantPoints: [
          "Optimization should be monitored rather than treated as a black box.",
          "Scaling and learning rate can strongly affect convergence.",
          "Training loss and validation performance answer different questions.",
          "Optimization quality and generalization quality are not the same thing.",
        ],
      },

      {
        id: "gd-exam-interview",
        title: "Gradient Descent: Exam and Interview Essentials",

        explanation: [
          "Be able to define Gradient Descent as an iterative optimization algorithm for minimizing an objective function.",
          "Know the update rule and the roles of the gradient and learning rate.",
          "Be able to distinguish Batch, Stochastic and Mini-Batch Gradient Descent.",
          "Explain why feature scaling can improve convergence.",
          "Explain what happens when the learning rate is too small or too large.",
          "Know the difference between an epoch and a parameter update.",
          "Understand local minima, global minima, saddle points and convexity at an intuitive level.",
          "Be able to explain the relationship between Gradient Descent and Linear Regression, Logistic Regression and neural networks.",
          "Know that backpropagation computes gradients while an optimizer uses them.",
        ],

        intuition: [
          "A strong answer should explain both the formula and the behavior of the algorithm.",
        ],

        importantPoints: [
          "Gradient points toward local increase.",
          "Gradient Descent moves in the negative-gradient direction.",
          "Learning rate controls step size.",
          "Batch size controls how much data contributes to each gradient estimate.",
          "Convergence does not automatically mean good generalization.",
        ],
      },
    ],

    visualization: {
      type: "model-lab",
      visualizationId: "gradient-descent",
      title: "Gradient Descent 3D Surface Lab",
      description:
        "Connect to the existing ModelMind Gradient Descent Lab to explore loss surfaces, parameter paths, learning rates and convergence behavior.",
    },

    codeExamples: [
      {
        id: "gd-from-scratch",
        title: "Linear Regression with Gradient Descent",
        description:
          "Learn a slope and intercept by repeatedly minimizing Mean Squared Error.",
        language: "python",

        code: `import numpy as np

x = np.array([
    1,
    2,
    3,
    4,
    5
], dtype=float)

y = np.array([
    3,
    5,
    7,
    9,
    11
], dtype=float)

weight = 0.0
bias = 0.0

learning_rate = 0.01
epochs = 2000

n = len(x)

for epoch in range(epochs):
    predictions = (
        weight * x
        +
        bias
    )

    errors = (
        predictions
        -
        y
    )

    loss = np.mean(
        errors ** 2
    )

    d_weight = (
        2 / n
    ) * np.sum(
        errors * x
    )

    d_bias = (
        2 / n
    ) * np.sum(
        errors
    )

    weight = (
        weight
        -
        learning_rate * d_weight
    )

    bias = (
        bias
        -
        learning_rate * d_bias
    )

    if epoch % 400 == 0:
        print(
            epoch,
            loss
        )

print(
    "Weight:",
    weight
)

print(
    "Bias:",
    bias
)`,

        explanation: [
          "The model begins with weight and bias equal to zero.",
          "Predictions are calculated using the current parameters.",
          "MSE measures the current error.",
          "The derivatives describe how the loss changes with respect to weight and bias.",
          "Each parameter moves opposite its derivative.",
          "Repeated updates should approach the relationship y ≈ 2x + 1 for this dataset.",
        ],

        commonMistakes: [
          "Adding the gradient instead of subtracting it.",
          "Using an excessively large learning rate.",
          "Forgetting to update parameters inside the loop.",
          "Assuming every optimization problem has one simple global minimum.",
        ],
      },
    ],

    practice: [
      {
        id: "gd-practice-1",
        title: "Update Direction",
        type: "concept",
        difficulty: "basic",
        question:
          "If a parameter is 10, the gradient is +2 and the learning rate is 0.1, what is the next parameter value?",
        instructions: [
          "Use parameter - learning_rate × gradient.",
        ],
        hints: [
          "10 - 0.1 × 2.",
        ],
        explanation:
          "The updated parameter is 9.8.",
      },

      {
        id: "gd-practice-2",
        title: "Large Learning Rate",
        type: "analysis",
        difficulty: "basic",
        question:
          "What can happen if the learning rate is much too large?",
        instructions: [
          "Think about overshooting.",
        ],
        hints: [
          "Loss may oscillate or increase.",
        ],
        explanation:
          "The optimizer may repeatedly overshoot lower-loss regions, causing unstable oscillation or divergence.",
      },

      {
        id: "gd-practice-3",
        title: "Negative Gradient",
        type: "concept",
        difficulty: "medium",
        question:
          "If the gradient of the loss with respect to a parameter is negative, does Gradient Descent increase or decrease that parameter in the next update, assuming a positive learning rate?",
        instructions: [
          "Apply parameter_new = parameter_old - learning_rate × gradient.",
        ],
        hints: [
          "Subtracting a negative number adds.",
        ],
        explanation:
          "The parameter increases because subtracting a negative gradient produces a positive change.",
      },

      {
        id: "gd-practice-4",
        title: "Batch vs SGD",
        type: "analysis",
        difficulty: "medium",
        question:
          "What is the main difference between batch Gradient Descent and stochastic Gradient Descent?",
        instructions: [
          "Compare the number of observations used for each update.",
        ],
        hints: [
          "Full dataset versus one observation.",
        ],
        explanation:
          "Batch Gradient Descent uses the full training set for each update, whereas stochastic Gradient Descent uses one observation for each update.",
      },

      {
        id: "gd-practice-5",
        title: "Scaling and Optimization",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can standardizing features improve Gradient Descent convergence?",
        instructions: [
          "Think about the geometry of the loss surface.",
        ],
        hints: [
          "Very different feature scales can create elongated contours.",
        ],
        explanation:
          "Scaling can improve the conditioning of the optimization problem, reducing inefficient zig-zagging and allowing more balanced parameter updates.",
      },

      {
        id: "gd-practice-6",
        title: "Loss Monitoring",
        type: "analysis",
        difficulty: "advanced",
        question:
          "During training, the loss begins at 40, falls to 15, then starts growing rapidly to 200 and 900. What is one likely optimization problem?",
        instructions: [
          "Connect the pattern to the learning rate.",
        ],
        hints: [
          "The optimizer may be taking unstable steps.",
        ],
        explanation:
          "One likely cause is an excessively large learning rate causing the optimization process to diverge.",
      },
    ],

    keyTakeaways: [
      "Gradient Descent minimizes an objective through repeated parameter updates.",
      "The gradient points toward local increase, so Gradient Descent moves in the opposite direction.",
      "Learning rate controls update size.",
      "Large learning rates can diverge and tiny ones can converge slowly.",
      "Batch, stochastic and mini-batch methods use different amounts of data per update.",
      "Feature scaling can improve optimization behavior.",
      "Gradient Descent connects mathematical optimization directly to model training.",
    ],
  },


  // =========================================================
  // POLYNOMIAL REGRESSION
  // Roadmap-native visualization
  // =========================================================

  "polynomial-regression": {
    overview:
      "Polynomial Regression extends linear models by creating nonlinear transformations of the input features, such as x² or x³. The resulting model can represent curved relationships while remaining linear in its learned coefficients. This makes Polynomial Regression an excellent way to understand model flexibility, feature transformation, underfitting and overfitting.",

    objectives: [
      "Understand why ordinary linear regression can underfit curved relationships.",
      "Understand polynomial features.",
      "Understand polynomial degree.",
      "Understand why Polynomial Regression is still linear in its coefficients.",
      "Build Polynomial Regression with PolynomialFeatures.",
      "Understand underfitting and overfitting.",
      "Use validation to choose model complexity.",
      "Understand the interaction between polynomial expansion and regularization.",
    ],

    sections: [
      {
        id: "polynomial-motivation",
        title: "Why Polynomial Regression?",

        explanation: [
          "Some relationships are systematic but not straight lines.",
          "A simple linear model may underfit these relationships.",
          "Polynomial feature expansion creates additional features such as x², x³ and interactions.",
          "A linear estimator can then fit coefficients to those transformed features.",
        ],

        intuition: [
          "Instead of forcing one straight line through a curve, we give the model curved building blocks from which it can construct a better fit.",
        ],

        importantPoints: [
          "Polynomial features increase flexibility.",
          "The original estimator can still be linear.",
          "Higher flexibility can reduce underfitting but increase overfitting.",
        ],
      },

      {
        id: "polynomial-equation",
        title: "Polynomial Model",

        explanation: [
          "A degree-two one-feature model can be written as y_hat = b0 + b1*x + b2*x².",
          "A degree-three model additionally includes x³.",
          "The prediction is nonlinear with respect to the original feature x.",
          "It remains linear with respect to the learned coefficients b0, b1, b2 and so on.",
        ],

        intuition: [
          "The word linear in linear model refers to how coefficients enter the model, not necessarily to a straight-line relationship in the original raw feature.",
        ],

        importantPoints: [
          "Degree 1 corresponds to an ordinary linear feature representation.",
          "Degree 2 adds squared terms.",
          "Degree 3 adds cubic terms.",
          "Multiple features can also create interaction terms.",
        ],
      },

      {
        id: "polynomial-degree",
        title: "Degree and Model Complexity",

        explanation: [
          "Low-degree models may be too simple and underfit.",
          "Moderate degrees may capture useful nonlinear structure.",
          "Very high-degree models can fit noise and become unstable.",
          "Training error often decreases as flexibility increases, but validation error may eventually increase.",
        ],

        intuition: [
          "A flexible curve can pass through more training points, but following every training fluctuation does not mean it learned the underlying pattern.",
        ],

        importantPoints: [
          "Degree controls flexibility.",
          "Training performance alone should not choose degree.",
          "Use validation or cross-validation.",
        ],
      },

      {
        id: "polynomial-dimensionality",
        title: "Feature Explosion",

        explanation: [
          "Polynomial expansion can generate many transformed features.",
          "With multiple original variables, interactions and powers can cause dimensionality to grow quickly.",
          "This increases computational cost and overfitting risk.",
          "Regularization becomes particularly useful in high-dimensional polynomial models.",
        ],

        intuition: [
          "Every additional degree gives the model more mathematical building blocks, but too many blocks can make the model unnecessarily complex.",
        ],

        importantPoints: [
          "Feature count can grow rapidly.",
          "High degrees can become computationally expensive.",
          "Regularization can help control complexity.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "polynomial-regression-degree-lab",
      title: "Polynomial Degree Explorer",
      description:
        "Change polynomial degree and noise, then compare the fitted curve, training error and validation error to see underfitting and overfitting emerge.",
    },

    codeExamples: [
      {
        id: "polynomial-regression-code",
        title: "Polynomial Regression with Pipeline",
        description:
          "Generate polynomial features and fit them through a reproducible sklearn Pipeline.",
        language: "python",

        code: `import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures

rng = np.random.default_rng(
    42
)

X = np.linspace(
    -3,
    3,
    120
).reshape(
    -1,
    1
)

noise = rng.normal(
    0,
    1.5,
    size=len(X)
)

y = (
    2
    +
    1.5 * X[:, 0]
    +
    2.2 * X[:, 0] ** 2
    +
    noise
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42
)

model = Pipeline([
    (
        "polynomial",
        PolynomialFeatures(
            degree=2,
            include_bias=False
        )
    ),
    (
        "regression",
        LinearRegression()
    )
])

model.fit(
    X_train,
    y_train
)

train_predictions = model.predict(
    X_train
)

test_predictions = model.predict(
    X_test
)

train_rmse = np.sqrt(
    mean_squared_error(
        y_train,
        train_predictions
    )
)

test_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        test_predictions
    )
)

print(
    "Train RMSE:",
    train_rmse
)

print(
    "Test RMSE:",
    test_rmse
)`,

        explanation: [
          "PolynomialFeatures creates nonlinear transformations from the raw feature.",
          "include_bias=False avoids adding a duplicate constant column when the regression estimator already learns an intercept.",
          "LinearRegression fits coefficients to the transformed feature matrix.",
          "Training and test RMSE allow us to compare fit and generalization.",
        ],

        commonMistakes: [
          "Choosing degree using test-set performance.",
          "Using very high degrees without validation.",
          "Assuming Polynomial Regression is a completely different estimator from linear regression.",
          "Ignoring the rapid growth in transformed feature count.",
        ],
      },
    ],

    practice: [
      {
        id: "polynomial-practice-1",
        title: "Degree Two Features",
        type: "concept",
        difficulty: "basic",
        question:
          "For one raw feature x, which new power term is introduced by a degree-two polynomial representation?",
        instructions: [
          "Think about powers up to degree 2.",
        ],
        hints: [
          "The additional term is x squared.",
        ],
        explanation:
          "A degree-two representation includes x and x², ignoring the optional bias term.",
      },

      {
        id: "polynomial-practice-2",
        title: "Why Still Linear?",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can y_hat = b0 + b1*x + b2*x² still be described as a linear model?",
        instructions: [
          "Focus on the learned coefficients.",
        ],
        hints: [
          "The coefficients are not multiplied together or raised to powers.",
        ],
        explanation:
          "The model is linear in the learned coefficients b0, b1 and b2 even though it is nonlinear in the original feature x.",
      },

      {
        id: "polynomial-practice-3",
        title: "Underfitting",
        type: "analysis",
        difficulty: "medium",
        question:
          "A degree-one model performs poorly on both training and validation data for a clearly curved relationship. What problem is likely occurring?",
        instructions: [
          "Compare model flexibility with data structure.",
        ],
        hints: [
          "The model may be too simple.",
        ],
        explanation:
          "The model is likely underfitting because its representation is too simple to capture the curved relationship.",
      },

      {
        id: "polynomial-practice-4",
        title: "High Degree",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A degree-15 model has almost zero training error but much worse validation error than a degree-3 model. What does this suggest?",
        instructions: [
          "Compare training and validation performance.",
        ],
        hints: [
          "The model may be following training noise.",
        ],
        explanation:
          "It suggests overfitting. The high-degree model has enough flexibility to fit training noise that does not generalize.",
      },

      {
        id: "polynomial-practice-5",
        title: "Choosing Degree",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why should polynomial degree be chosen using validation or cross-validation rather than the final test set?",
        instructions: [
          "Think about the purpose of the test set.",
        ],
        hints: [
          "The test set should estimate final generalization after model choices are complete.",
        ],
        explanation:
          "Using the test set to choose degree turns it into model-selection data and makes the final performance estimate optimistically biased.",
      },
    ],

    commonMistakes: [
      {
        id: "polynomial-mistake-1",
        title: "Higher degree is always better",
        description:
          "Greater flexibility can reduce training error while harming generalization.",
        correction:
          "Choose complexity through validation and consider regularization.",
      },

      {
        id: "polynomial-mistake-2",
        title: "Selecting degree on test data",
        description:
          "Repeatedly comparing degrees on the final test set leaks model-selection decisions into evaluation.",
        correction:
          "Use training/validation or cross-validation for degree selection.",
      },
    ],

    keyTakeaways: [
      "Polynomial Regression models nonlinear relationships using transformed features.",
      "The model remains linear in its coefficients.",
      "Polynomial degree controls flexibility.",
      "Low complexity can underfit.",
      "Excessive complexity can overfit.",
      "Polynomial expansion can dramatically increase feature count.",
      "Validation and regularization help control complexity.",
    ],
  },


  // =========================================================
  // REGULARIZATION
  // Roadmap-native visualization
  // =========================================================

  "regularization": {
    overview:
      "Regularization controls model complexity by adding a penalty for large coefficients to the training objective. Ridge, Lasso and Elastic Net are foundational techniques for improving stability and reducing overfitting in linear models, especially when the feature space is large or predictors are correlated.",

    objectives: [
      "Understand why regularization is used.",
      "Understand the bias-variance trade-off created by regularization.",
      "Understand Ridge or L2 regularization.",
      "Understand Lasso or L1 regularization.",
      "Understand Elastic Net.",
      "Understand the regularization-strength parameter.",
      "Understand why scaling matters before regularization.",
      "Connect L1 regularization with sparse coefficients.",
      "Tune regularization using cross-validation.",
    ],

    sections: [
      {
        id: "regularization-motivation",
        title: "Why Regularize a Model?",

        explanation: [
          "A highly flexible model can fit training observations extremely well while performing poorly on unseen data.",
          "Large or unstable coefficients can be a symptom of excessive sensitivity to training data.",
          "Regularization adds a complexity penalty to the optimization objective.",
          "The model must therefore balance fitting the data against keeping coefficients controlled.",
        ],

        intuition: [
          "Instead of rewarding the model only for fitting training data, we also charge it for becoming unnecessarily extreme.",
        ],

        importantPoints: [
          "Regularization can reduce overfitting.",
          "It intentionally introduces some bias.",
          "The goal is better generalization rather than minimum training error.",
        ],
      },

      {
        id: "ridge",
        title: "Ridge Regression — L2 Regularization",

        explanation: [
          "Ridge Regression adds a penalty related to the sum of squared coefficient magnitudes.",
          "In simplified form, objective = data loss + alpha × sum(coefficient²).",
          "The penalty encourages coefficients to shrink toward zero.",
          "Ridge usually does not force ordinary coefficients exactly to zero.",
          "It can be useful when many predictors contribute some signal or when predictors are correlated.",
        ],

        intuition: [
          "Ridge asks the model to spread responsibility without allowing coefficients to become unnecessarily large.",
        ],

        importantPoints: [
          "Ridge uses an L2 penalty.",
          "Coefficients are generally shrunk rather than eliminated.",
          "alpha controls penalty strength in sklearn Ridge.",
        ],
      },

      {
        id: "lasso",
        title: "Lasso Regression — L1 Regularization",

        explanation: [
          "Lasso adds a penalty related to the sum of absolute coefficient magnitudes.",
          "In simplified form, objective = data loss + alpha × sum(abs(coefficient)).",
          "L1 regularization can drive some coefficients exactly to zero.",
          "This gives Lasso a feature-selection-like behavior.",
          "When predictors are strongly correlated, the selected sparse solution can be unstable across samples.",
        ],

        intuition: [
          "Lasso can decide that some features are not worth paying a coefficient penalty for and effectively remove them.",
        ],

        importantPoints: [
          "Lasso uses an L1 penalty.",
          "Some coefficients can become exactly zero.",
          "Lasso can produce sparse models.",
          "Sparse does not automatically mean causally important.",
        ],
      },

      {
        id: "elastic-net",
        title: "Elastic Net",

        explanation: [
          "Elastic Net combines L1 and L2 regularization.",
          "It can provide sparsity while retaining some of Ridge's behavior with correlated features.",
          "Its behavior is controlled by overall regularization strength and the balance between L1 and L2 penalties.",
        ],

        intuition: [
          "Elastic Net combines the coefficient-shrinking behavior of Ridge with the sparsity-producing behavior of Lasso.",
        ],

        importantPoints: [
          "Combines L1 and L2 penalties.",
          "Useful when both shrinkage and sparsity are desirable.",
          "Requires tuning multiple regularization choices.",
        ],
      },

      {
        id: "regularization-alpha",
        title: "Regularization Strength",

        explanation: [
          "In sklearn Ridge and Lasso, alpha controls the regularization strength.",
          "A very small alpha makes the model behave more like an unregularized model.",
          "A large alpha imposes stronger coefficient shrinkage.",
          "Excessive regularization can create underfitting.",
          "Alpha should therefore be selected using validation or cross-validation.",
        ],

        intuition: [
          "Regularization is a complexity dial. Turning it up too little may allow overfitting; turning it up too much may suppress useful signal.",
        ],

        importantPoints: [
          "Small alpha means weaker regularization.",
          "Large alpha means stronger regularization.",
          "Choose alpha using validation.",
        ],
      },

      {
        id: "regularization-scaling",
        title: "Why Scaling Matters",

        explanation: [
          "Regularization penalizes coefficient magnitudes.",
          "If features use very different units, coefficient sizes are not directly comparable.",
          "Standardizing numerical features before regularized linear models often makes the penalty behave more consistently across features.",
          "The scaler should be inside the Pipeline to prevent leakage.",
        ],

        intuition: [
          "A coefficient's numerical size partly depends on the units of its feature. Scaling puts features on more comparable numerical footing before coefficient penalties are applied.",
        ],

        importantPoints: [
          "Scale-sensitive penalties should be paired with appropriate feature scaling.",
          "Fit scaling only on training data.",
          "Use Pipeline during cross-validation.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "regularization-coefficient-lab",
      title: "Regularization Coefficient Lab",
      description:
        "Change alpha and compare unregularized, Ridge, Lasso and Elastic Net coefficient paths while observing training and validation error.",
    },

    codeExamples: [
      {
        id: "ridge-lasso-code",
        title: "Compare Linear, Ridge and Lasso",
        description:
          "Compare coefficient behavior using a leakage-safe Pipeline.",
        language: "python",

        code: `import numpy as np

from sklearn.datasets import make_regression
from sklearn.linear_model import (
    Lasso,
    LinearRegression,
    Ridge
)
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = make_regression(
    n_samples=300,
    n_features=12,
    n_informative=5,
    noise=20,
    random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42
)

models = {
    "Linear": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "model",
            LinearRegression()
        )
    ]),

    "Ridge": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "model",
            Ridge(
                alpha=1.0
            )
        )
    ]),

    "Lasso": Pipeline([
        (
            "scaler",
            StandardScaler()
        ),
        (
            "model",
            Lasso(
                alpha=1.0,
                max_iter=10000
            )
        )
    ])
}

for name, pipeline in models.items():
    pipeline.fit(
        X_train,
        y_train
    )

    predictions = pipeline.predict(
        X_test
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            predictions
        )
    )

    coefficients = (
        pipeline
        .named_steps["model"]
        .coef_
    )

    print(
        name
    )

    print(
        "RMSE:",
        rmse
    )

    print(
        "Coefficients:",
        coefficients
    )

    print(
        "Zero coefficients:",
        np.sum(
            np.isclose(
                coefficients,
                0.0
            )
        )
    )

    print()`,

        explanation: [
          "StandardScaler is placed inside every Pipeline so scaling is learned from training data.",
          "LinearRegression provides an unregularized baseline.",
          "Ridge applies L2 coefficient shrinkage.",
          "Lasso applies L1 regularization and may produce zero coefficients.",
          "Test RMSE compares generalization while coefficient values reveal the effect of regularization.",
        ],

        commonMistakes: [
          "Comparing regularized coefficients across unscaled features without considering units.",
          "Choosing alpha using final test performance.",
          "Assuming every zero Lasso coefficient proves that a feature is useless.",
          "Assuming stronger regularization always improves generalization.",
        ],
      },

      {
        id: "regularization-cv-code",
        title: "Tune Ridge Regularization",
        description:
          "Choose alpha through cross-validation rather than the final test set.",
        language: "python",

        code: `import numpy as np

from sklearn.datasets import make_regression
from sklearn.linear_model import Ridge
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = make_regression(
    n_samples=250,
    n_features=10,
    noise=25,
    random_state=42
)

pipeline = Pipeline([
    (
        "scaler",
        StandardScaler()
    ),
    (
        "ridge",
        Ridge()
    )
])

parameter_grid = {
    "ridge__alpha": [
        0.001,
        0.01,
        0.1,
        1.0,
        10.0,
        100.0
    ]
}

search = GridSearchCV(
    estimator=pipeline,
    param_grid=parameter_grid,
    scoring="neg_root_mean_squared_error",
    cv=5
)

search.fit(
    X,
    y
)

print(
    "Best alpha:",
    search.best_params_
)

print(
    "Best CV RMSE:",
    -search.best_score_
)`,

        explanation: [
          "The scaler and Ridge estimator are evaluated as one Pipeline.",
          "Each cross-validation fold fits its own scaler.",
          "ridge__alpha uses sklearn's nested Pipeline parameter syntax.",
          "The negative scoring convention is converted back to positive RMSE for easier interpretation.",
        ],

        commonMistakes: [
          "Scaling globally before GridSearchCV.",
          "Tuning alpha on the final test set.",
          "Forgetting the Pipeline step prefix in parameter names.",
        ],
      },
    ],

    practice: [
      {
        id: "regularization-practice-1",
        title: "Purpose of Regularization",
        type: "concept",
        difficulty: "basic",
        question:
          "What is the main purpose of regularization in predictive modeling?",
        instructions: [
          "Think about complexity and generalization.",
        ],
        hints: [
          "It discourages overly complex parameter values.",
        ],
        explanation:
          "Regularization penalizes model complexity, often reducing variance and improving generalization when an unregularized model overfits.",
      },

      {
        id: "regularization-practice-2",
        title: "Ridge or Lasso?",
        type: "concept",
        difficulty: "basic",
        question:
          "Which method is more directly associated with driving some coefficients exactly to zero: Ridge or Lasso?",
        instructions: [
          "Recall L1 versus L2.",
        ],
        hints: [
          "L1 regularization encourages sparsity.",
        ],
        explanation:
          "Lasso is more directly associated with coefficients becoming exactly zero.",
      },

      {
        id: "regularization-practice-3",
        title: "Large Alpha",
        type: "analysis",
        difficulty: "medium",
        question:
          "What can happen if Ridge alpha is made excessively large?",
        instructions: [
          "Think about coefficient shrinkage and model flexibility.",
        ],
        hints: [
          "Useful relationships can be suppressed.",
        ],
        explanation:
          "The coefficients may be shrunk too strongly, increasing bias and causing underfitting.",
      },

      {
        id: "regularization-practice-4",
        title: "Why Scale?",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why is feature scaling particularly relevant before Ridge or Lasso?",
        instructions: [
          "Think about how coefficient magnitudes depend on feature units.",
        ],
        hints: [
          "The penalty is applied to coefficients.",
        ],
        explanation:
          "Without scaling, coefficient magnitudes partly reflect feature units, so the regularization penalty may affect features unevenly for reasons unrelated to predictive importance.",
      },

      {
        id: "regularization-practice-5",
        title: "Bias-Variance Trade-Off",
        type: "analysis",
        difficulty: "advanced",
        question:
          "How can regularization improve validation performance even when it makes training performance slightly worse?",
        instructions: [
          "Connect the answer to variance and overfitting.",
        ],
        hints: [
          "A slightly more biased model can be less sensitive to training noise.",
        ],
        explanation:
          "Regularization can sacrifice some training fit by increasing bias while reducing variance. If the unregularized model was overfitting, this trade-off can improve performance on unseen data.",
      },

      {
        id: "regularization-practice-6",
        title: "Lasso Interpretation",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Lasso sets a feature's coefficient to zero. Does that prove the feature has no relationship with the target?",
        instructions: [
          "Consider correlated predictors and model dependence.",
        ],
        hints: [
          "Selection depends on the data, penalty and other available predictors.",
        ],
        explanation:
          "No. A zero coefficient means the penalized fitted model did not retain that feature under the current data and hyperparameters. Correlated features or different regularization strengths can produce different selections.",
      },
    ],

    commonMistakes: [
      {
        id: "regularization-mistake-1",
        title: "Regularization always helps",
        description:
          "Strong regularization can create excessive bias and underfitting.",
        correction:
          "Tune regularization strength using validation or cross-validation.",
      },

      {
        id: "regularization-mistake-2",
        title: "Ignoring feature scale",
        description:
          "Coefficient penalties can behave inconsistently when feature units differ greatly.",
        correction:
          "Use appropriate scaling inside a leakage-safe Pipeline.",
      },

      {
        id: "regularization-mistake-3",
        title: "Lasso proves feature importance",
        description:
          "Sparse selection depends on the fitted model, data and correlations.",
        correction:
          "Treat Lasso selection as model-dependent evidence, not universal truth.",
      },
    ],

    keyTakeaways: [
      "Regularization adds a complexity penalty to model training.",
      "Ridge uses L2 regularization and generally shrinks coefficients.",
      "Lasso uses L1 regularization and can create sparse solutions.",
      "Elastic Net combines L1 and L2 behavior.",
      "Regularization trades some bias for potentially lower variance.",
      "Excessive regularization can underfit.",
      "Scaling is important for fair coefficient penalization.",
      "Regularization strength should be selected through validation.",
    ],
  },
};