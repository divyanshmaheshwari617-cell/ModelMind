// import type {
//   DeepLessonRegistry,
// } from "./lessonContentTypes";


// // =========================================================
// // MACHINE-LEARNING MODEL DEEP CONTENT
// // =========================================================
// //
// // IMPORTANT:
// //
// // This file contains EDUCATIONAL CONTENT ONLY.
// //
// // It does NOT contain:
// //
// // - learner progress
// // - completion state
// // - quiz state
// // - assignment state
// // - weak-topic state
// // - persistence state
// //
// // Existing ModelMind Model Labs are NOT connected here.
// // They will be integrated separately later.
// // =========================================================


// export const mlModelContent:
//   DeepLessonRegistry = {

//   // =======================================================
//   // LINEAR REGRESSION
//   // =======================================================

//   "linear-regression": {
//     contentDepth: "expert",

//     overview:
//       "Linear Regression is one of the most important supervised machine-learning algorithms for predicting continuous numerical values. It models the relationship between input features and a numerical target by learning coefficients that describe how changes in the features are associated with changes in the prediction. Although the model is mathematically simple, understanding it deeply introduces many ideas that appear throughout machine learning: parameters, loss functions, optimization, residuals, generalization, regularization, assumptions, feature scaling, multicollinearity, bias and variance.",

//     objectives: [
//       "Understand what regression problems are and when Linear Regression is appropriate.",
//       "Build an intuitive understanding of a best-fit line and hyperplane.",
//       "Understand features, targets, coefficients and intercepts.",
//       "Understand simple and multiple Linear Regression.",
//       "Understand how predictions are generated.",
//       "Understand residuals and prediction errors.",
//       "Understand Mean Squared Error and related regression losses.",
//       "Understand how model parameters are learned.",
//       "Understand ordinary least squares.",
//       "Understand the relationship between Linear Regression and Gradient Descent.",
//       "Understand the important assumptions behind Linear Regression.",
//       "Recognize underfitting and overfitting.",
//       "Understand the bias-variance behavior of Linear Regression.",
//       "Understand multicollinearity and its effect on coefficients.",
//       "Understand the important LinearRegression parameters in scikit-learn.",
//       "Understand when feature scaling is and is not required.",
//       "Evaluate regression models using appropriate metrics.",
//       "Diagnose common Linear Regression problems.",
//       "Compare Linear Regression with regularized and non-linear models.",
//       "Apply Linear Regression correctly in practical ML workflows.",
//     ],

//     modelDeepDive: {
//       modelFamily:
//         "Linear Models / Regression",

//       problemTypes: [
//         "Supervised learning",
//         "Regression",
//         "Continuous-value prediction",
//       ],

//       depth: "expert",

//       // =====================================================
//       // WHY THE MODEL EXISTS
//       // =====================================================

//       motivation: [
//         "Many real-world machine-learning problems require predicting a numerical quantity rather than a category.",
//         "Examples include predicting house prices, sales, temperature, demand, delivery time, energy consumption and medical costs.",
//         "Linear Regression provides one of the simplest ways to describe how one or more input variables relate to a continuous target.",
//         "It provides a strong baseline because it is fast, interpretable and mathematically well understood.",
//         "Understanding Linear Regression is important even when more advanced models will eventually be used because concepts such as coefficients, residuals, loss functions, regularization and optimization appear throughout machine learning.",
//       ],

//       // =====================================================
//       // INTUITION
//       // =====================================================

//       intuition: [
//         "Imagine plotting house size on the x-axis and house price on the y-axis. The observations may not lie perfectly on one line, but there may be a general upward trend.",
//         "Linear Regression tries to place a line through the observations so that the line represents the overall relationship between house size and price.",
//         "The model does not attempt to pass through every training point. Instead, it tries to find parameters that make the overall prediction error as small as possible.",
//         "With one feature, the model can be visualized as a straight line.",
//         "With two features, the model represents a plane.",
//         "With many features, it represents a hyperplane in a higher-dimensional feature space.",
//         "Each feature receives a coefficient. The coefficient determines how strongly that feature contributes to the prediction.",
//         "The intercept provides the baseline prediction when all feature values are zero.",
//       ],

//       mentalModel: [
//         "Think of Linear Regression as a weighted calculator.",
//         "Every feature contributes some amount to the final prediction.",
//         "The model learns how much weight should be assigned to each feature.",
//         "A positive coefficient pushes the prediction upward when the feature increases.",
//         "A negative coefficient pushes the prediction downward when the feature increases.",
//         "A coefficient close to zero means the feature contributes little linearly after accounting for the other included features.",
//         "The final prediction is the sum of all weighted feature contributions plus the intercept.",
//       ],

//       // =====================================================
//       // TRAINING PROCESS
//       // =====================================================

//       trainingProcess: [
//         {
//           id: "linear-regression-training-1",
//           step: 1,
//           title: "Prepare features and target",
//           explanation:
//             "Separate the independent input variables X from the continuous target variable y.",
//           intuition:
//             "The model needs to know which columns provide information and which value it is trying to predict.",
//           importantPoints: [
//             "The target should be numerical for ordinary regression.",
//             "Categorical predictors usually require suitable encoding.",
//             "Avoid including information that would not be available when making a real prediction.",
//             "Check for data leakage before training.",
//           ],
//         },

//         {
//           id: "linear-regression-training-2",
//           step: 2,
//           title: "Define the linear prediction function",
//           explanation:
//             "The model assumes that the prediction can be represented as a weighted combination of the input features plus an intercept.",
//           mathematics:
//             "ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₚxₚ",
//           intuition:
//             "Each feature contributes its value multiplied by a learned coefficient.",
//           importantPoints: [
//             "β₀ is the intercept.",
//             "β₁ ... βₚ are model coefficients.",
//             "x₁ ... xₚ are feature values.",
//             "ŷ is the predicted target.",
//           ],
//         },

//         {
//           id: "linear-regression-training-3",
//           step: 3,
//           title: "Generate predictions",
//           explanation:
//             "Using an initial or candidate set of coefficients, calculate a predicted value for each training observation.",
//           intuition:
//             "The current line or hyperplane makes a guess for every training example.",
//         },

//         {
//           id: "linear-regression-training-4",
//           step: 4,
//           title: "Calculate residuals",
//           explanation:
//             "Measure the difference between every actual target value and its corresponding prediction.",
//           mathematics:
//             "eᵢ = yᵢ - ŷᵢ",
//           intuition:
//             "A residual tells us how far the prediction missed the actual observation.",
//           importantPoints: [
//             "Positive residual: the model predicted too low.",
//             "Negative residual: the model predicted too high.",
//             "Residuals are central to regression diagnostics.",
//           ],
//         },

//         {
//           id: "linear-regression-training-5",
//           step: 5,
//           title: "Measure total error",
//           explanation:
//             "Combine the individual prediction errors into an objective that can be minimized.",
//           mathematics:
//             "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",
//           intuition:
//             "Squaring prevents positive and negative errors from cancelling and penalizes large errors more strongly.",
//         },

//         {
//           id: "linear-regression-training-6",
//           step: 6,
//           title: "Find the best coefficients",
//           explanation:
//             "Ordinary Least Squares selects coefficients that minimize the sum of squared residuals.",
//           mathematics:
//             "minimize Σ(yᵢ - ŷᵢ)²",
//           intuition:
//             "Move the line or hyperplane until the squared prediction errors are as small as possible.",
//           importantPoints: [
//             "Classical least squares can be solved using linear algebra.",
//             "Optimization approaches such as Gradient Descent can also estimate linear-model coefficients.",
//             "scikit-learn LinearRegression uses a least-squares solver rather than exposing a learning-rate parameter.",
//           ],
//         },

//         {
//           id: "linear-regression-training-7",
//           step: 7,
//           title: "Evaluate on unseen data",
//           explanation:
//             "After fitting the model on training data, evaluate it on validation or test data that was not used to estimate the coefficients.",
//           intuition:
//             "A useful model should predict new observations rather than merely describe its training data.",
//           importantPoints: [
//             "Use regression metrics.",
//             "Compare training and validation performance.",
//             "Inspect residual patterns.",
//             "Compare against a simple baseline.",
//           ],
//         },
//       ],

//       // =====================================================
//       // PREDICTION PROCESS
//       // =====================================================

//       predictionProcess: [
//         {
//           id: "linear-regression-prediction-1",
//           step: 1,
//           title: "Receive a new feature vector",
//           explanation:
//             "The trained model receives the feature values for a new observation.",
//         },
//         {
//           id: "linear-regression-prediction-2",
//           step: 2,
//           title: "Multiply features by coefficients",
//           explanation:
//             "Each feature value is multiplied by the coefficient learned during training.",
//           mathematics:
//             "β₁x₁ + β₂x₂ + ... + βₚxₚ",
//         },
//         {
//           id: "linear-regression-prediction-3",
//           step: 3,
//           title: "Add the intercept",
//           explanation:
//             "The intercept is added to the weighted sum of features.",
//           mathematics:
//             "ŷ = β₀ + Σβⱼxⱼ",
//         },
//         {
//           id: "linear-regression-prediction-4",
//           step: 4,
//           title: "Return numerical prediction",
//           explanation:
//             "The result becomes the predicted continuous target value.",
//         },
//       ],

//       // =====================================================
//       // MATHEMATICS
//       // =====================================================

//       mathematics: [
//         {
//           title:
//             "Simple Linear Regression",
//           explanation:
//             "With one input feature, Linear Regression models the target using a straight line.",
//           formula:
//             "ŷ = β₀ + β₁x",
//           variables: [
//             {
//               symbol: "ŷ",
//               meaning:
//                 "Predicted target value",
//             },
//             {
//               symbol: "β₀",
//               meaning:
//                 "Intercept",
//             },
//             {
//               symbol: "β₁",
//               meaning:
//                 "Coefficient or slope",
//             },
//             {
//               symbol: "x",
//               meaning:
//                 "Input feature",
//             },
//           ],
//           example:
//             "If price = 50,000 + 4,000 × bedrooms, then a three-bedroom property receives a prediction of 62,000.",
//         },

//         {
//           title:
//             "Multiple Linear Regression",
//           explanation:
//             "With several input features, the prediction becomes a weighted sum of all feature values.",
//           formula:
//             "ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₚxₚ",
//           variables: [
//             {
//               symbol: "p",
//               meaning:
//                 "Number of input features",
//             },
//             {
//               symbol: "βⱼ",
//               meaning:
//                 "Coefficient associated with feature j",
//             },
//           ],
//         },

//         {
//           title:
//             "Residual",
//           explanation:
//             "A residual measures the difference between an observed target and its fitted prediction.",
//           formula:
//             "eᵢ = yᵢ - ŷᵢ",
//           variables: [
//             {
//               symbol: "eᵢ",
//               meaning:
//                 "Residual for observation i",
//             },
//             {
//               symbol: "yᵢ",
//               meaning:
//                 "Actual target",
//             },
//             {
//               symbol: "ŷᵢ",
//               meaning:
//                 "Predicted target",
//             },
//           ],
//         },

//         {
//           title:
//             "Mean Squared Error",
//           explanation:
//             "MSE averages squared prediction errors and is closely connected with ordinary least-squares regression.",
//           formula:
//             "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",
//           variables: [
//             {
//               symbol: "n",
//               meaning:
//                 "Number of observations",
//             },
//           ],
//         },

//         {
//           title:
//             "Matrix Form",
//           explanation:
//             "Multiple Linear Regression can be written compactly using matrix notation.",
//           formula:
//             "ŷ = Xβ",
//           variables: [
//             {
//               symbol: "X",
//               meaning:
//                 "Design matrix containing features",
//             },
//             {
//               symbol: "β",
//               meaning:
//                 "Vector of coefficients",
//             },
//             {
//               symbol: "ŷ",
//               meaning:
//                 "Vector of predictions",
//             },
//           ],
//         },

//         {
//           title:
//             "Ordinary Least Squares Solution",
//           explanation:
//             "When the required matrix conditions hold, the least-squares coefficient solution can be expressed using the normal-equation form. Numerical libraries generally use more stable computational techniques rather than explicitly calculating a matrix inverse.",
//           formula:
//             "β̂ = (XᵀX)⁻¹Xᵀy",
//           variables: [
//             {
//               symbol: "Xᵀ",
//               meaning:
//                 "Transpose of the design matrix",
//             },
//             {
//               symbol: "β̂",
//               meaning:
//                 "Estimated coefficient vector",
//             },
//           ],
//         },
//       ],

//       // =====================================================
//       // OBJECTIVE FUNCTION
//       // =====================================================

//       objectiveFunctions: [
//         {
//           name:
//             "Residual Sum of Squares / Ordinary Least Squares",

//           purpose:
//             "Find coefficients that minimize squared prediction errors on the training observations.",

//           intuition: [
//             "Every incorrect prediction creates an error.",
//             "The errors are squared so that negative and positive errors cannot cancel.",
//             "Squaring also makes large errors contribute more strongly.",
//             "The best-fitting coefficients are those producing the smallest total squared residual.",
//           ],

//           formula:
//             "RSS = Σ(yᵢ - ŷᵢ)²",

//           variables: [
//             {
//               symbol: "yᵢ",
//               meaning:
//                 "Actual target value",
//             },
//             {
//               symbol: "ŷᵢ",
//               meaning:
//                 "Predicted target value",
//             },
//           ],

//           explanation: [
//             "Ordinary Linear Regression does not directly penalize large coefficient values.",
//             "Ridge and Lasso extend this idea by adding regularization penalties.",
//           ],

//           optimizationGoal:
//             "minimize",

//           practicalMeaning: [
//             "The model searches for the linear relationship that produces the smallest squared training residuals.",
//             "Because errors are squared, extreme residuals can strongly influence the fitted model.",
//           ],
//         },
//       ],

//       // =====================================================
//       // ASSUMPTIONS
//       // =====================================================

//       assumptions: [
//         {
//           id: "lr-assumption-linearity",
//           title:
//             "Linearity in parameters / appropriate functional form",
//           explanation:
//             "The expected target should be adequately represented by the chosen linear combination of predictors, possibly after suitable transformations or engineered terms.",
//           whyItMatters:
//             "If the true relationship contains important non-linear structure that the model does not represent, systematic prediction errors may remain.",
//           violationEffect:
//             "Residual plots may show curves or structured patterns and predictive performance may be poor.",
//           howToCheck: [
//             "Plot residuals against fitted values.",
//             "Inspect feature-target relationships.",
//             "Use partial or component-residual diagnostics when appropriate.",
//           ],
//           remedies: [
//             "Transform features.",
//             "Add polynomial or interaction terms when justified.",
//             "Use a model capable of representing non-linear relationships.",
//           ],
//         },

//         {
//           id: "lr-assumption-independent-errors",
//           title:
//             "Independent errors",
//           explanation:
//             "Regression errors should not contain strong dependence that the model ignores.",
//           whyItMatters:
//             "Dependence can make classical uncertainty estimates unreliable and may indicate missing temporal, grouped or spatial structure.",
//           howToCheck: [
//             "Inspect residuals in observation or time order.",
//             "Consider autocorrelation diagnostics for time-dependent data.",
//             "Understand whether observations are naturally grouped.",
//           ],
//           remedies: [
//             "Add relevant temporal or grouped structure.",
//             "Use methods designed for correlated observations when inference is required.",
//           ],
//         },

//         {
//           id: "lr-assumption-homoscedasticity",
//           title:
//             "Constant error variance",
//           explanation:
//             "Classical linear-model inference commonly assumes that the variance of the error is approximately constant across predictor or fitted-value ranges.",
//           whyItMatters:
//             "Strong heteroscedasticity can make standard-error estimates and inferential conclusions unreliable.",
//           violationEffect:
//             "Residual spread may increase or decrease as fitted values change.",
//           howToCheck: [
//             "Residual-versus-fitted plot.",
//             "Inspect whether residual spread forms a funnel pattern.",
//           ],
//           remedies: [
//             "Transform the target where appropriate.",
//             "Use heteroscedasticity-robust inference when statistical inference is the goal.",
//             "Investigate missing predictors or changing variance structure.",
//           ],
//         },

//         {
//           id: "lr-assumption-normal-errors",
//           title:
//             "Normality of errors for classical inference",
//           explanation:
//             "Normally distributed errors are not required simply to compute ordinary least-squares predictions, but normality becomes important for some small-sample statistical inference procedures.",
//           whyItMatters:
//             "Confidence intervals and hypothesis tests based on classical assumptions may become less reliable when error distributions are severely non-normal, especially in small samples.",
//           howToCheck: [
//             "Inspect residual histogram.",
//             "Inspect a Q-Q plot.",
//           ],
//           remedies: [
//             "Investigate outliers.",
//             "Consider transformations.",
//             "Use robust or resampling-based inference when appropriate.",
//           ],
//         },

//         {
//           id: "lr-assumption-multicollinearity",
//           title:
//             "No severe multicollinearity for stable coefficient interpretation",
//           explanation:
//             "Predictors should not be so strongly linearly related that their individual effects become difficult to estimate reliably.",
//           whyItMatters:
//             "Strong multicollinearity can make coefficients unstable and inflate uncertainty even when predictions remain acceptable.",
//           violationEffect:
//             "Coefficient signs or magnitudes may change substantially with small data changes.",
//           howToCheck: [
//             "Correlation analysis.",
//             "Variance Inflation Factor when appropriate.",
//             "Inspect coefficient stability.",
//           ],
//           remedies: [
//             "Remove redundant predictors when justified.",
//             "Combine correlated variables.",
//             "Use regularization such as Ridge.",
//           ],
//         },
//       ],

//       // =====================================================
//       // PARAMETERS
//       // =====================================================

//       parameters: [
//         {
//           id: "lr-fit-intercept",
//           name: "fit_intercept",
//           displayName:
//             "Fit Intercept",
//           category:
//             "implementation",

//           description:
//             "Controls whether scikit-learn LinearRegression estimates an intercept term.",

//           intuition:
//             "The intercept lets the fitted hyperplane shift away from the origin. Setting it to false forces the fitted relationship through the origin.",

//           defaultValue: "true",

//           acceptedValues:
//             "true or false",

//           mathematicalMeaning:
//             "When enabled, the model estimates β₀ in ŷ = β₀ + Σβⱼxⱼ.",

//           lowValueEffect: [
//             "false removes the independently fitted intercept.",
//             "The fitted relationship is constrained to pass through the origin in feature space.",
//           ],

//           highValueEffect: [
//             "true allows the model to estimate an intercept.",
//           ],

//           biasEffect:
//             "Incorrectly forcing the intercept to zero can introduce substantial bias when the true relationship does not pass through the origin.",

//           varianceEffect:
//             "Usually not treated as a primary bias-variance tuning parameter.",

//           overfittingEffect:
//             "Estimating one intercept generally contributes negligible complexity compared with inappropriate feature design.",

//           underfittingEffect:
//             "Setting false without a valid reason can make the model systematically underfit.",

//           computationalEffect:
//             "Negligible practical difference for ordinary datasets.",

//           whenToIncrease: [
//             "This is Boolean, so it is not increased numerically.",
//           ],

//           whenToDecrease: [
//             "Set to false only when the problem formulation genuinely requires zero intercept or the data have already been centered in a way consistent with the model.",
//           ],

//           whenToTune: [
//             "Rarely a normal hyperparameter-search target.",
//           ],

//           whenNotToTune: [
//             "Do not blindly include it in GridSearchCV.",
//             "Keep true for most ordinary regression problems.",
//           ],

//           tuningStrategy: [
//             "Choose from domain and preprocessing knowledge rather than generic hyperparameter optimization.",
//           ],

//           recommendedValues: [
//             "Usually true.",
//           ],

//           commonMistakes: [
//             "Setting fit_intercept=false simply because features were standardized.",
//             "Assuming standardization always makes a zero-intercept model appropriate.",
//           ],

//           examNotes: [
//             "The intercept represents the predicted baseline when all features are zero.",
//           ],

//           interviewNotes: [
//             "Be able to explain why forcing a regression through the origin can change all estimated coefficients.",
//           ],
//         },

//         {
//           id: "lr-copy-x",
//           name: "copy_X",
//           displayName:
//             "Copy X",
//           category:
//             "implementation",

//           description:
//             "Controls whether the feature matrix may be copied during fitting.",

//           intuition:
//             "This is primarily an implementation and memory-behavior option rather than a model-complexity hyperparameter.",

//           defaultValue: "true",

//           acceptedValues:
//             "true or false",

//           computationalEffect:
//             "Changing copying behavior may affect memory usage in some workflows but does not create a more expressive regression model.",

//           memoryEffect:
//             "Disabling copying can potentially reduce additional memory use but should be done only when mutation behavior is understood.",

//           whenToTune: [
//             "Only for specialized memory-sensitive implementations.",
//           ],

//           whenNotToTune: [
//             "Do not treat copy_X as a predictive-performance hyperparameter.",
//           ],

//           recommendedValues: [
//             "Keep the default unless there is a specific memory or data-handling reason.",
//           ],

//           commonMistakes: [
//             "Including copy_X in hyperparameter optimization expecting accuracy improvements.",
//           ],
//         },

//         {
//   id: "lr-tol",

//   name: "tol",

//   displayName:
//     "Numerical Solver Tolerance",

//   category:
//     "optimization",

//   description:
//     "Controls the numerical tolerance used by LinearRegression when the underlying solving path supports a tolerance criterion. It controls numerical convergence or precision rather than model complexity.",

//   intuition:
//     "Think of tol as telling the numerical solver how precisely it should solve the least-squares problem. A smaller tolerance asks for a stricter numerical solution, while a larger tolerance may permit the solver to stop with a less precise solution. It is not a regularization parameter and normally should not be treated like an accuracy-tuning knob.",

//   defaultValue:
//     "1e-6 in current scikit-learn LinearRegression",

//   acceptedValues:
//     "Non-negative floating-point value.",

//   mathematicalMeaning:
//     "tol affects numerical stopping or precision criteria in applicable LinearRegression solver paths. It does not add a term such as λ||β||² or λ||β||₁ to the least-squares objective.",

//   lowValueEffect: [
//     "Requests stricter numerical precision where the active solver uses tol.",
//     "May require additional numerical work.",
//     "Does not automatically improve validation performance.",
//     "Does not reduce statistical bias in the same way that changing model structure might.",
//   ],

//   highValueEffect: [
//     "Allows a looser numerical solution where tolerance is used.",
//     "May reduce numerical work.",
//     "An excessively loose value may reduce numerical solution accuracy.",
//   ],

//   biasEffect:
//     "tol is fundamentally a numerical optimization parameter, not a statistical bias-control parameter. Reasonable changes should not be interpreted like regularization changes.",

//   varianceEffect:
//     "tol does not directly control model variance in the way Ridge or Lasso regularization does.",

//   overfittingEffect:
//     "Lowering tol is not a valid strategy for solving overfitting.",

//   underfittingEffect:
//     "Increasing tol excessively could theoretically leave a less accurate numerical solution, but normal underfitting should be diagnosed through model structure, features and validation rather than tol.",

//   computationalEffect:
//     "A stricter tolerance can require more numerical work in solver paths where tolerance controls convergence.",

//   memoryEffect:
//     "Usually not a major memory-control parameter.",

//   whenToIncrease: [
//     "When numerical precision is unnecessarily strict for the workload.",
//     "When solver cost matters and a slightly looser numerical solution is acceptable.",
//   ],

//   whenToDecrease: [
//     "When numerical diagnostics suggest that greater solver precision is actually required.",
//     "When working with a problem where the relevant least-squares solver is sensitive to its stopping tolerance.",
//   ],

//   whenToTune: [
//     "When numerical convergence or solver precision is genuinely relevant.",
//     "When working with data/solver paths where tol affects the least-squares computation.",
//   ],

//   whenNotToTune: [
//     "Do not use tol as the first parameter to optimize for predictive performance.",
//     "Do not decrease tol merely because validation R² is poor.",
//     "Do not use tol to address overfitting.",
//     "Do not confuse it with Ridge alpha, Lasso alpha or another regularization-strength parameter.",
//   ],

//   tuningStrategy: [
//     "Keep the default for ordinary use.",
//     "First diagnose data quality, conditioning and feature representation.",
//     "Only change tolerance when there is a numerical reason.",
//     "Evaluate whether the change materially affects coefficients or predictions before keeping it.",
//   ],

//   recommendedValues: [
//     "Start with the library default.",
//     "Change only when numerical behavior provides a reason.",
//   ],

//   interactions: [
//     {
//       parameter:
//         "data representation",
//       explanation:
//         "Numerical conditioning and sparse/dense representation can affect which solving path is used and how numerical precision matters.",
//     },

//     {
//       parameter:
//         "positive",
//       explanation:
//         "Enabling coefficient positivity changes the optimization problem and solving behavior; tol should still not be interpreted as regularization.",
//     },
//   ],

//   commonMistakes: [
//     "Thinking smaller tol always means a better ML model.",
//     "Using tol to fight overfitting.",
//     "Calling tol a regularization parameter.",
//     "Assuming numerical convergence and generalization are the same thing.",
//   ],

//   examNotes: [
//     "tol is a numerical solver tolerance.",
//     "It does not control regularization strength.",
//     "A smaller tolerance generally requests greater numerical precision where applicable.",
//   ],

//   interviewNotes: [
//     "If asked whether reducing tol improves accuracy, explain the difference between numerical optimization accuracy and predictive generalization.",
//     "Know that LinearRegression does not expose learning_rate or epochs like gradient-descent estimators.",
//   ],
// },

//         {
//           id: "lr-n-jobs",
//           name: "n_jobs",
//           displayName:
//             "Parallel Jobs",
//           category:
//             "performance",

//           description:
//             "Controls parallel computation in situations where scikit-learn can benefit from parallel fitting.",

//           intuition:
//             "This changes computational execution rather than the mathematical hypothesis represented by the fitted model.",

//           defaultValue: "None",

//           acceptedValues:
//             "None, -1, or a positive integer depending on joblib conventions.",

//           computationalEffect:
//             "Can improve fitting speed only in supported cases; ordinary single-target dense regression may see little or no benefit.",

//           memoryEffect:
//             "Additional parallel work can increase resource usage.",

//           whenToIncrease: [
//             "For supported workloads where multiple CPU cores can actually accelerate fitting.",
//           ],

//           whenNotToTune: [
//             "Do not include n_jobs in a predictive hyperparameter search.",
//           ],

//           recommendedValues: [
//             "None for default behavior.",
//             "-1 when appropriate and full available parallelism is desired.",
//           ],

//           commonMistakes: [
//             "Expecting n_jobs=-1 to improve model accuracy.",
//             "Assuming every LinearRegression workload scales with CPU count.",
//           ],
//         },

//         {
//           id: "lr-positive",
//           name: "positive",
//           displayName:
//             "Positive Coefficients Constraint",
//           category:
//             "core",

//           description:
//             "When enabled in supported dense-data usage, constrains learned coefficients to be non-negative.",

//           intuition:
//             "The model is forbidden from assigning a negative contribution to any feature coefficient.",

//           defaultValue: "false",

//           acceptedValues:
//             "true or false",

//           mathematicalMeaning:
//             "Adds the constraint βⱼ ≥ 0 for fitted coefficients.",

//           lowValueEffect: [
//             "false allows both positive and negative coefficients.",
//           ],

//           highValueEffect: [
//             "true restricts the coefficient search space to non-negative values.",
//           ],

//           biasEffect:
//             "The constraint can increase bias if genuinely negative relationships exist, but may encode valuable domain knowledge when negative coefficients are impossible or undesirable.",

//           varianceEffect:
//             "Constraining the parameter space can sometimes stabilize the solution, although it is not the same as Ridge or Lasso regularization.",

//           underfittingEffect:
//             "Can underfit when the target truly decreases with some predictors.",

//           whenToIncrease: [
//             "Enable when domain knowledge requires non-negative coefficients.",
//           ],

//           whenToDecrease: [
//             "Disable when both positive and negative feature effects are plausible.",
//           ],

//           whenToTune: [
//             "Usually choose from domain constraints rather than generic search.",
//           ],

//           whenNotToTune: [
//             "Do not enable merely because some fitted coefficients look surprising.",
//           ],

//           commonMistakes: [
//             "Using positive=true to hide data-quality or multicollinearity problems.",
//             "Assuming every feature should logically have a positive coefficient.",
//           ],

//           interviewNotes: [
//             "Explain that coefficient constraints encode prior structural knowledge but can increase bias if the constraint is wrong.",
//           ],
//         },
//       ],

//       // =====================================================
//       // DATA REQUIREMENTS
//       // =====================================================

//       dataRequirements: {
//         scaling: {
//           required: false,
//           explanation:
//             "Ordinary unregularized Linear Regression can be fitted without feature scaling. However, scaling can improve numerical conditioning, make coefficient magnitudes easier to compare in some contexts, and becomes especially important when Linear Regression is optimized iteratively or when regularization is introduced.",
//         },

//         categoricalFeatures: {
//           supportedDirectly: false,
//           explanation:
//             "Standard LinearRegression expects numerical feature representations.",
//           recommendations: [
//             "One-hot encode nominal categorical variables.",
//             "Use meaningful ordinal encoding only when an actual order exists.",
//             "Avoid assigning arbitrary integer codes to nominal categories because this introduces an artificial numeric relationship.",
//           ],
//         },

//         missingValues: {
//           supportedDirectly: false,
//           explanation:
//             "Ordinary scikit-learn LinearRegression does not accept arbitrary NaN feature values as normal training input.",
//           recommendations: [
//             "Investigate why values are missing.",
//             "Impute using a train-fitted preprocessing strategy when appropriate.",
//             "Consider missing indicators when missingness itself may contain useful information.",
//           ],
//         },

//         outliers: {
//           sensitivity: "high",
//           explanation:
//             "Squared-error fitting gives large residuals disproportionate influence, so extreme observations can strongly change the fitted coefficients.",
//           recommendations: [
//             "Investigate influential observations.",
//             "Do not automatically delete every outlier.",
//             "Distinguish data errors from legitimate extreme observations.",
//             "Consider robust alternatives when extreme values dominate the fit.",
//           ],
//         },

//         imbalance: {
//           sensitivity: "low",
//           explanation:
//             "Class imbalance is a classification concept and is not directly applicable to ordinary continuous-target Linear Regression. However, uneven representation across important target ranges or subpopulations can still affect model quality.",
//           recommendations: [
//             "Inspect the target distribution.",
//             "Check performance across important subgroups and target ranges.",
//           ],
//         },

//         featureDistribution: [
//           "Predictors do not individually need to follow a normal distribution for ordinary least-squares prediction.",
//           "Strong skewness may still reveal transformations or influential observations worth investigating.",
//           "For classical inference, assumptions concern the error structure more directly than the marginal normality of every feature.",
//         ],

//         sampleSizeConsiderations: [
//           "The number of observations should be sufficient relative to the number of parameters being estimated.",
//           "Very small datasets can produce unstable coefficients.",
//           "As dimensionality approaches or exceeds sample size, ordinary least-squares estimation becomes increasingly problematic and regularization may be preferable.",
//         ],

//         dimensionalityConsiderations: [
//           "Large numbers of correlated features can create unstable coefficient estimates.",
//           "High-dimensional data often benefit from regularization or dimensionality reduction.",
//           "Adding irrelevant features can increase variance and reduce interpretability.",
//         ],
//       },

//       // =====================================================
//       // BIAS / VARIANCE
//       // =====================================================

//       biasVariance: {
//         bias: "medium",
//         variance: "low",

//         explanation: [
//           "A basic Linear Regression model is relatively constrained because it represents a linear relationship in the supplied features.",
//           "If the real relationship is strongly non-linear and the feature representation does not capture that structure, bias can be high.",
//           "Compared with flexible models such as deep trees, ordinary Linear Regression often has lower variance.",
//           "Variance can nevertheless increase with many predictors, severe multicollinearity, small datasets or noisy feature engineering.",
//         ],

//         underfittingCauses: [
//           "Important non-linear relationships.",
//           "Missing relevant predictors.",
//           "Missing interactions.",
//           "Overly simplistic feature representation.",
//         ],

//         overfittingCauses: [
//           "Too many irrelevant predictors relative to dataset size.",
//           "High-dimensional feature expansion.",
//           "Strong multicollinearity.",
//           "Fitting noise through excessive engineered terms.",
//         ],

//         reduceUnderfitting: [
//           "Engineer justified transformations.",
//           "Add useful interaction terms.",
//           "Add relevant predictors.",
//           "Consider polynomial or non-linear models.",
//         ],

//         reduceOverfitting: [
//           "Remove unjustified features.",
//           "Use cross-validation.",
//           "Use Ridge, Lasso or Elastic Net regularization.",
//           "Increase training data when possible.",
//         ],
//       },

//       // =====================================================
//       // COMPLEXITY
//       // =====================================================

//       complexity: {
//         training:
//           "Depends on the least-squares solver, number of samples n and number of features p. Dense least-squares solutions are generally efficient for ordinary tabular problems but become more expensive as dimensionality grows.",

//         prediction:
//           "Approximately O(p) per observation because prediction is primarily a dot product between p feature values and p coefficients.",

//         memory:
//           "Primarily depends on storing the dataset and linear-algebra structures required by the solver.",

//         explanation: [
//           "Prediction is extremely fast compared with many non-linear ensemble models.",
//           "Training is usually practical for standard tabular datasets.",
//           "Very high-dimensional or sparse settings may require specialized linear estimators or solvers.",
//         ],

//         scalabilityNotes: [
//           "Linear models are generally attractive when low-latency prediction is important.",
//           "For extremely large datasets, stochastic optimization variants such as SGDRegressor may be useful.",
//         ],
//       },

//       // =====================================================
//       // ADVANTAGES
//       // =====================================================

//       advantages: [
//         "Simple to understand.",
//         "Fast to train on ordinary datasets.",
//         "Very fast prediction.",
//         "Highly interpretable when features are appropriately constructed.",
//         "Provides a strong regression baseline.",
//         "Coefficients provide information about linear feature effects conditional on the included model.",
//         "Well-established mathematical theory.",
//         "Useful foundation for understanding regularization and generalized linear models.",
//       ],

//       limitations: [
//         "Cannot automatically represent complex non-linear relationships.",
//         "Can be strongly influenced by outliers.",
//         "Coefficient interpretation can become unstable under severe multicollinearity.",
//         "Requires numerical feature representations.",
//         "Ordinary LinearRegression does not automatically perform feature selection.",
//         "Can underfit complicated real-world relationships.",
//         "Extrapolation outside the observed feature range can be unreliable.",
//         "Association represented by coefficients does not automatically imply causation.",
//       ],

//       whenToUse: [
//         "The target is continuous.",
//         "A roughly linear or linearly representable relationship is plausible.",
//         "Interpretability matters.",
//         "A fast baseline is needed.",
//         "Prediction latency must be very low.",
//         "You want to understand feature-effect direction before moving to more complex models.",
//       ],

//       whenNotToUse: [
//         "The target is categorical.",
//         "The relationship is strongly non-linear and suitable feature transformations are unavailable.",
//         "The data contain influential extreme values that cannot be handled appropriately.",
//         "Complex interactions dominate and must be learned automatically.",
//         "The primary goal requires a model naturally suited to another data structure such as images or raw text.",
//       ],

//       // =====================================================
//       // EVALUATION
//       // =====================================================

//       evaluation: {
//         problemType: "regression",

//         recommendedMetrics: [
//           {
//             metric: "MAE",
//             why:
//               "Measures the average absolute prediction error in the original target units.",
//             caution:
//               "Does not penalize very large errors as strongly as squared-error metrics.",
//           },
//           {
//             metric: "MSE",
//             why:
//               "Penalizes large prediction errors more strongly and aligns closely with least-squares training.",
//             caution:
//               "Its squared units can make interpretation less intuitive.",
//           },
//           {
//             metric: "RMSE",
//             why:
//               "Returns squared-error performance to the target's original units.",
//             caution:
//               "Can be strongly influenced by large errors.",
//           },
//           {
//             metric: "R²",
//             why:
//               "Measures improvement relative to a constant mean-prediction baseline in terms of explained variation.",
//             caution:
//               "A high R² does not prove causality or guarantee that assumptions are satisfied.",
//           },
//         ],

//         validationStrategy: [
//           "Keep an untouched test set for final evaluation when data size allows.",
//           "Use cross-validation for more reliable model comparison.",
//           "Use time-aware splitting rather than random splitting for temporal prediction problems.",
//         ],

//         diagnosticChecks: [
//           "Compare training and validation metrics.",
//           "Plot residuals against predictions.",
//           "Inspect residual distribution.",
//           "Check for systematic residual patterns.",
//           "Inspect unusually influential observations.",
//           "Check coefficient stability when multicollinearity is suspected.",
//         ],

//         misleadingMetrics: [
//           "Do not judge a regression model using classification accuracy.",
//           "Do not rely only on R².",
//           "Do not compare raw MAE/RMSE values across targets with completely different scales without context.",
//         ],
//       },

//       // =====================================================
//       // TUNING
//       // =====================================================

//       tuning: {
//         strategy: [
//           "LinearRegression itself has very few predictive hyperparameters.",
//           "Spend more effort on data quality, leakage prevention, feature representation and validation.",
//           "Inspect whether the relationship is sufficiently linear.",
//           "Investigate residuals.",
//           "If overfitting or unstable coefficients are a concern, compare Ridge, Lasso and Elastic Net rather than searching arbitrary LinearRegression settings.",
//         ],

//         tuneFirst: [
//           "Feature representation.",
//           "Relevant transformations.",
//           "Feature selection decisions.",
//           "Whether regularization is required.",
//         ],

//         tuneLater: [
//           "Specialized solver-related settings when they are actually relevant.",
//         ],

//         searchSpaceTips: [
//           "Do not create a large GridSearchCV merely because other models have many hyperparameters.",
//           "For linear models, model-family choice and regularization strength are usually more important than implementation flags.",
//         ],

//         parameterInteractions: [
//           "fit_intercept interacts with centering and the mathematical meaning of the feature representation.",
//           "positive constrains coefficient signs and can significantly change the optimum.",
//           "Feature scaling becomes particularly important when moving from ordinary LinearRegression to regularized models.",
//         ],

//         practicalWorkflow: [
//           "Build a clean baseline LinearRegression.",
//           "Evaluate with cross-validation.",
//           "Inspect residuals.",
//           "Inspect coefficient stability.",
//           "Check multicollinearity.",
//           "Engineer justified features.",
//           "Compare regularized linear models.",
//           "Compare against suitable non-linear baselines.",
//         ],
//       },

//       // =====================================================
//       // COMPARISONS
//       // =====================================================

//       comparisons: [
//         {
//           model: "Ridge Regression",
//           relationship:
//             "Regularized linear model",
//           similarities: [
//             "Both make linear predictions.",
//             "Both estimate feature coefficients.",
//           ],
//           differences: [
//             "Ridge adds an L2 penalty to coefficient magnitude.",
//             "Ridge is often more stable when predictors are strongly correlated.",
//           ],
//           preferCurrentWhen: [
//             "A simple unregularized baseline is desired.",
//             "Coefficient shrinkage is unnecessary.",
//           ],
//           preferOtherWhen: [
//             "Multicollinearity or high variance is a concern.",
//             "Many predictors require coefficient shrinkage.",
//           ],
//           examTip:
//             "Linear Regression minimizes prediction error; Ridge additionally penalizes squared coefficient magnitude.",
//         },

//         {
//           model: "Lasso Regression",
//           relationship:
//             "Sparse regularized linear model",
//           similarities: [
//             "Both produce linear predictions.",
//           ],
//           differences: [
//             "Lasso adds an L1 penalty.",
//             "Lasso can drive some coefficients exactly to zero.",
//           ],
//           preferOtherWhen: [
//             "A sparse linear model or embedded feature selection is useful.",
//           ],
//         },

//         {
//           model: "Decision Tree Regression",
//           relationship:
//             "Non-linear regression alternative",
//           similarities: [
//             "Both can predict continuous targets.",
//           ],
//           differences: [
//             "Decision trees learn piecewise decision regions.",
//             "Trees automatically capture many non-linear relationships and interactions.",
//             "Linear Regression extrapolates according to its fitted linear function.",
//           ],
//           preferCurrentWhen: [
//             "Interpretability through coefficients matters.",
//             "The relationship is approximately linear.",
//           ],
//           preferOtherWhen: [
//             "Strong non-linearities and interactions dominate.",
//           ],
//         },
//       ],

//       // =====================================================
//       // FAILURE MODES
//       // =====================================================

//       failureModes: [
//         {
//           id: "lr-failure-nonlinearity",
//           symptom:
//             "Residual plot shows a curved pattern.",
//           likelyCauses: [
//             "Important non-linear relationship.",
//             "Missing transformation.",
//             "Missing interaction.",
//           ],
//           diagnosis: [
//             "Plot residuals against fitted values.",
//             "Inspect feature-target relationships.",
//           ],
//           fixes: [
//             "Transform features.",
//             "Add justified polynomial or interaction terms.",
//             "Try an appropriate non-linear model.",
//           ],
//         },

//         {
//           id: "lr-failure-outliers",
//           symptom:
//             "A few observations strongly change the fitted line.",
//           likelyCauses: [
//             "Extreme residuals.",
//             "High-leverage observations.",
//             "Data-entry errors.",
//           ],
//           diagnosis: [
//             "Inspect scatter plots.",
//             "Inspect residuals.",
//             "Investigate influential observations.",
//           ],
//           fixes: [
//             "Correct invalid data.",
//             "Investigate legitimate extremes.",
//             "Consider robust regression when appropriate.",
//           ],
//         },

//         {
//           id: "lr-failure-multicollinearity",
//           symptom:
//             "Coefficients change dramatically across data splits or have unexpected signs.",
//           likelyCauses: [
//             "Highly correlated predictors.",
//             "Redundant features.",
//           ],
//           diagnosis: [
//             "Inspect feature correlations.",
//             "Check VIF when appropriate.",
//             "Compare coefficient stability across folds.",
//           ],
//           fixes: [
//             "Remove redundant predictors when justified.",
//             "Combine related predictors.",
//             "Use Ridge regularization.",
//           ],
//         },

//         {
//           id: "lr-failure-leakage",
//           symptom:
//             "Validation performance appears unrealistically excellent.",
//           likelyCauses: [
//             "Target leakage.",
//             "Preprocessing fitted before the data split.",
//             "Future information included in features.",
//           ],
//           diagnosis: [
//             "Audit every feature.",
//             "Inspect preprocessing order.",
//             "Recreate validation using a leakage-safe pipeline.",
//           ],
//           fixes: [
//             "Remove leaked features.",
//             "Fit data-dependent preprocessing only on training folds.",
//             "Use Pipeline where appropriate.",
//           ],
//         },
//       ],

//       // =====================================================
//       // REAL-WORLD APPLICATIONS
//       // =====================================================

//       realWorldApplications: [
//         {
//           title:
//             "House Price Baseline",
//           domain:
//             "Real Estate",
//           problem:
//             "Predict property price from size, room count and other numerical/encoded characteristics.",
//           whyModelFits:
//             "Provides an interpretable baseline and allows inspection of approximate linear feature effects.",
//           limitations: [
//             "Real property markets often contain strong non-linearities, location interactions and threshold effects.",
//           ],
//         },

//         {
//           title:
//             "Sales Forecasting Baseline",
//           domain:
//             "Business",
//           problem:
//             "Estimate sales from advertising spend, price and other explanatory variables.",
//           whyModelFits:
//             "Useful for understanding approximate directional relationships and establishing a baseline.",
//           limitations: [
//             "Temporal dependence, seasonality and non-linear responses may require richer models.",
//           ],
//         },

//         {
//           title:
//             "Energy Consumption Estimation",
//           domain:
//             "Energy",
//           problem:
//             "Estimate numerical energy usage from environmental and operational variables.",
//           whyModelFits:
//             "Useful when relationships are sufficiently linear or transformed into a suitable representation.",
//         },
//       ],

//       // =====================================================
//       // INTERVIEW
//       // =====================================================

//       interviewQuestions: [
//         {
//           question:
//             "What does Linear Regression actually learn?",
//           shortAnswer:
//             "It learns an intercept and feature coefficients that minimize a least-squares objective.",
//           deepAnswer: [
//             "The coefficients define a linear prediction function.",
//             "Each coefficient describes the fitted change in prediction associated with a unit change in that feature while the other included predictors are held fixed, subject to the model specification.",
//             "Ordinary least squares chooses coefficients minimizing the sum of squared residuals.",
//           ],
//         },

//         {
//           question:
//             "Why are residuals squared?",
//           shortAnswer:
//             "Squaring prevents cancellation between positive and negative residuals and gives larger errors more influence.",
//           followUpQuestions: [
//             "How does this affect sensitivity to outliers?",
//             "How does MAE differ from MSE?",
//           ],
//         },

//         {
//           question:
//             "Does Linear Regression require normally distributed features?",
//           shortAnswer:
//             "No. Predictor variables themselves do not need to be normally distributed for ordinary least-squares prediction.",
//           deepAnswer: [
//             "Normality assumptions are more closely connected with the error distribution for certain classical inferential procedures.",
//             "Predictive modeling and statistical inference should not be confused.",
//           ],
//         },

//         {
//           question:
//             "Why can multicollinearity be a problem?",
//           shortAnswer:
//             "It can make individual coefficient estimates unstable and difficult to interpret.",
//           deepAnswer: [
//             "Correlated predictors provide overlapping information.",
//             "Many combinations of coefficients may produce similar predictions.",
//             "Prediction can remain reasonable even while individual coefficients become unstable.",
//           ],
//         },

//         {
//           question:
//             "Does Linear Regression require feature scaling?",
//           shortAnswer:
//             "Not necessarily for ordinary unregularized least squares, but scaling can improve numerical behavior and becomes important for regularized or gradient-based variants.",
//         },
//       ],

//       // =====================================================
//       // EXAM NOTES
//       // =====================================================

//       examNotes: [
//         {
//           title:
//             "Core definition",
//           points: [
//             "Linear Regression is a supervised learning algorithm used primarily for continuous numerical prediction.",
//             "It models the target as a linear combination of input features.",
//           ],
//           formula:
//             "ŷ = β₀ + β₁x₁ + ... + βₚxₚ",
//           commonQuestion:
//             "Explain Linear Regression and its working.",
//         },

//         {
//           title:
//             "Cost function",
//           points: [
//             "Ordinary least squares minimizes squared residual error.",
//             "Squaring prevents positive and negative errors from cancelling.",
//             "Large errors receive greater penalty.",
//           ],
//           formula:
//             "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",
//           commonQuestion:
//             "Why is Mean Squared Error used in Linear Regression?",
//         },

//         {
//           title:
//             "Important terminology",
//           points: [
//             "Feature: independent input variable.",
//             "Target: numerical value being predicted.",
//             "Coefficient: learned weight associated with a feature.",
//             "Intercept: baseline component of prediction.",
//             "Residual: difference between actual and predicted value.",
//           ],
//         },

//         {
//           title:
//             "Important assumptions",
//           points: [
//             "Appropriate linear functional form.",
//             "Independent error structure when assumed by the analysis.",
//             "Approximately constant error variance for classical inference.",
//             "No severe multicollinearity when stable coefficient interpretation is important.",
//             "Normal error assumptions matter mainly for certain inferential procedures rather than merely computing predictions.",
//           ],
//           commonQuestion:
//             "State and explain the assumptions of Linear Regression.",
//         },
//       ],
//     },

//     // =====================================================
//     // TOP-LEVEL SUPPORTING CONTENT
//     // =====================================================

//     assumptions: [
//       {
//         id: "linear-regression-top-assumption",
//         title:
//           "Linear model suitability",
//         explanation:
//           "Linear Regression works best when the chosen feature representation can adequately describe the systematic relationship with a linear prediction function.",
//         whyItMatters:
//           "A model that cannot represent the underlying structure will systematically underfit.",
//         howToCheck: [
//           "Inspect residual plots.",
//           "Compare against justified non-linear alternatives.",
//         ],
//       },
//     ],

//     realWorldApplications: [
//       {
//         title:
//           "Numerical prediction baseline",
//         domain:
//           "General Machine Learning",
//         problem:
//           "Create a fast and interpretable baseline for a continuous prediction task.",
//         whyModelFits:
//           "Linear Regression is simple, efficient and provides an important reference point before more complex models are introduced.",
//       },
//     ],

//     interviewQuestions: [
//       {
//         question:
//           "What is the difference between a parameter and a hyperparameter in Linear Regression?",
//         shortAnswer:
//           "Coefficients and the intercept are learned model parameters, while configuration choices such as fit_intercept are hyperparameters supplied before fitting.",
//       },
//     ],

//     examNotes: [
//       {
//         title:
//           "Linear Regression quick revision",
//         points: [
//           "Supervised regression algorithm.",
//           "Predicts continuous numerical values.",
//           "Learns coefficients and usually an intercept.",
//           "Ordinary least squares minimizes squared residuals.",
//           "Evaluate with regression metrics such as MAE, MSE, RMSE and R².",
//         ],
//       },
//     ],
//   },
// };


import type {

  DeepLessonRegistry,

} from "./lessonContentTypes";





// =========================================================

// MACHINE-LEARNING MODEL DEEP CONTENT

// =========================================================

//

// IMPORTANT:

//

// This file contains EDUCATIONAL CONTENT ONLY.

//

// It does NOT contain:

//

// - learner progress

// - completion state

// - quiz state

// - assignment state

// - weak-topic state

// - persistence state

//

// Existing ModelMind Model Labs are NOT connected here.

// They will be integrated separately later.

// =========================================================





export const mlModelContent:

  DeepLessonRegistry = {



  // =======================================================

  // LINEAR REGRESSION

  // =======================================================



  "linear-regression": {

    contentDepth: "expert",



    overview:

      "Linear Regression is one of the most important supervised machine-learning algorithms for predicting continuous numerical values. It models the relationship between input features and a numerical target by learning coefficients that describe how changes in the features are associated with changes in the prediction. Although the model is mathematically simple, understanding it deeply introduces many ideas that appear throughout machine learning: parameters, loss functions, optimization, residuals, generalization, regularization, assumptions, feature scaling, multicollinearity, bias and variance.",



    objectives: [

      "Understand what regression problems are and when Linear Regression is appropriate.",

      "Build an intuitive understanding of a best-fit line and hyperplane.",

      "Understand features, targets, coefficients and intercepts.",

      "Understand simple and multiple Linear Regression.",

      "Understand how predictions are generated.",

      "Understand residuals and prediction errors.",

      "Understand Mean Squared Error and related regression losses.",

      "Understand how model parameters are learned.",

      "Understand ordinary least squares.",

      "Understand the relationship between Linear Regression and Gradient Descent.",

      "Understand the important assumptions behind Linear Regression.",

      "Recognize underfitting and overfitting.",

      "Understand the bias-variance behavior of Linear Regression.",

      "Understand multicollinearity and its effect on coefficients.",

      "Understand the important LinearRegression parameters in scikit-learn.",

      "Understand when feature scaling is and is not required.",

      "Evaluate regression models using appropriate metrics.",

      "Diagnose common Linear Regression problems.",

      "Compare Linear Regression with regularized and non-linear models.",

      "Apply Linear Regression correctly in practical ML workflows.",

    ],



    modelDeepDive: {

      modelFamily:

        "Linear Models / Regression",



      problemTypes: [

        "Supervised learning",

        "Regression",

        "Continuous-value prediction",

      ],



      depth: "expert",



      // =====================================================

      // WHY THE MODEL EXISTS

      // =====================================================



      motivation: [

        "Many real-world machine-learning problems require predicting a numerical quantity rather than a category.",

        "Examples include predicting house prices, sales, temperature, demand, delivery time, energy consumption and medical costs.",

        "Linear Regression provides one of the simplest ways to describe how one or more input variables relate to a continuous target.",

        "It provides a strong baseline because it is fast, interpretable and mathematically well understood.",

        "Understanding Linear Regression is important even when more advanced models will eventually be used because concepts such as coefficients, residuals, loss functions, regularization and optimization appear throughout machine learning.",

      ],



      // =====================================================

      // INTUITION

      // =====================================================



      intuition: [

        "Imagine plotting house size on the x-axis and house price on the y-axis. The observations may not lie perfectly on one line, but there may be a general upward trend.",

        "Linear Regression tries to place a line through the observations so that the line represents the overall relationship between house size and price.",

        "The model does not attempt to pass through every training point. Instead, it tries to find parameters that make the overall prediction error as small as possible.",

        "With one feature, the model can be visualized as a straight line.",

        "With two features, the model represents a plane.",

        "With many features, it represents a hyperplane in a higher-dimensional feature space.",

        "Each feature receives a coefficient. The coefficient determines how strongly that feature contributes to the prediction.",

        "The intercept provides the baseline prediction when all feature values are zero.",

      ],



      mentalModel: [

        "Think of Linear Regression as a weighted calculator.",

        "Every feature contributes some amount to the final prediction.",

        "The model learns how much weight should be assigned to each feature.",

        "A positive coefficient pushes the prediction upward when the feature increases.",

        "A negative coefficient pushes the prediction downward when the feature increases.",

        "A coefficient close to zero means the feature contributes little linearly after accounting for the other included features.",

        "The final prediction is the sum of all weighted feature contributions plus the intercept.",

      ],



      // =====================================================

      // TRAINING PROCESS

      // =====================================================



      trainingProcess: [

        {

          id: "linear-regression-training-1",

          step: 1,

          title: "Prepare features and target",

          explanation:

            "Separate the independent input variables X from the continuous target variable y.",

          intuition:

            "The model needs to know which columns provide information and which value it is trying to predict.",

          importantPoints: [

            "The target should be numerical for ordinary regression.",

            "Categorical predictors usually require suitable encoding.",

            "Avoid including information that would not be available when making a real prediction.",

            "Check for data leakage before training.",

          ],

        },



        {

          id: "linear-regression-training-2",

          step: 2,

          title: "Define the linear prediction function",

          explanation:

            "The model assumes that the prediction can be represented as a weighted combination of the input features plus an intercept.",

          mathematics:

            "ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₚxₚ",

          intuition:

            "Each feature contributes its value multiplied by a learned coefficient.",

          importantPoints: [

            "β₀ is the intercept.",

            "β₁ ... βₚ are model coefficients.",

            "x₁ ... xₚ are feature values.",

            "ŷ is the predicted target.",

          ],

        },



        {

          id: "linear-regression-training-3",

          step: 3,

          title: "Generate predictions",

          explanation:

            "Using an initial or candidate set of coefficients, calculate a predicted value for each training observation.",

          intuition:

            "The current line or hyperplane makes a guess for every training example.",

        },



        {

          id: "linear-regression-training-4",

          step: 4,

          title: "Calculate residuals",

          explanation:

            "Measure the difference between every actual target value and its corresponding prediction.",

          mathematics:

            "eᵢ = yᵢ - ŷᵢ",

          intuition:

            "A residual tells us how far the prediction missed the actual observation.",

          importantPoints: [

            "Positive residual: the model predicted too low.",

            "Negative residual: the model predicted too high.",

            "Residuals are central to regression diagnostics.",

          ],

        },



        {

          id: "linear-regression-training-5",

          step: 5,

          title: "Measure total error",

          explanation:

            "Combine the individual prediction errors into an objective that can be minimized.",

          mathematics:

            "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",

          intuition:

            "Squaring prevents positive and negative errors from cancelling and penalizes large errors more strongly.",

        },



        {

          id: "linear-regression-training-6",

          step: 6,

          title: "Find the best coefficients",

          explanation:

            "Ordinary Least Squares selects coefficients that minimize the sum of squared residuals.",

          mathematics:

            "minimize Σ(yᵢ - ŷᵢ)²",

          intuition:

            "Move the line or hyperplane until the squared prediction errors are as small as possible.",

          importantPoints: [

            "Classical least squares can be solved using linear algebra.",

            "Optimization approaches such as Gradient Descent can also estimate linear-model coefficients.",

            "scikit-learn LinearRegression uses a least-squares solver rather than exposing a learning-rate parameter.",

          ],

        },



        {

          id: "linear-regression-training-7",

          step: 7,

          title: "Evaluate on unseen data",

          explanation:

            "After fitting the model on training data, evaluate it on validation or test data that was not used to estimate the coefficients.",

          intuition:

            "A useful model should predict new observations rather than merely describe its training data.",

          importantPoints: [

            "Use regression metrics.",

            "Compare training and validation performance.",

            "Inspect residual patterns.",

            "Compare against a simple baseline.",

          ],

        },

      ],



      // =====================================================

      // PREDICTION PROCESS

      // =====================================================



      predictionProcess: [

        {

          id: "linear-regression-prediction-1",

          step: 1,

          title: "Receive a new feature vector",

          explanation:

            "The trained model receives the feature values for a new observation.",

        },

        {

          id: "linear-regression-prediction-2",

          step: 2,

          title: "Multiply features by coefficients",

          explanation:

            "Each feature value is multiplied by the coefficient learned during training.",

          mathematics:

            "β₁x₁ + β₂x₂ + ... + βₚxₚ",

        },

        {

          id: "linear-regression-prediction-3",

          step: 3,

          title: "Add the intercept",

          explanation:

            "The intercept is added to the weighted sum of features.",

          mathematics:

            "ŷ = β₀ + Σβⱼxⱼ",

        },

        {

          id: "linear-regression-prediction-4",

          step: 4,

          title: "Return numerical prediction",

          explanation:

            "The result becomes the predicted continuous target value.",

        },

      ],



      // =====================================================

      // MATHEMATICS

      // =====================================================



      mathematics: [

        {

          title:

            "Simple Linear Regression",

          explanation:

            "With one input feature, Linear Regression models the target using a straight line.",

          formula:

            "ŷ = β₀ + β₁x",

          variables: [

            {

              symbol: "ŷ",

              meaning:

                "Predicted target value",

            },

            {

              symbol: "β₀",

              meaning:

                "Intercept",

            },

            {

              symbol: "β₁",

              meaning:

                "Coefficient or slope",

            },

            {

              symbol: "x",

              meaning:

                "Input feature",

            },

          ],

          example:

            "If price = 50,000 + 4,000 × bedrooms, then a three-bedroom property receives a prediction of 62,000.",

        },



        {

          title:

            "Multiple Linear Regression",

          explanation:

            "With several input features, the prediction becomes a weighted sum of all feature values.",

          formula:

            "ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₚxₚ",

          variables: [

            {

              symbol: "p",

              meaning:

                "Number of input features",

            },

            {

              symbol: "βⱼ",

              meaning:

                "Coefficient associated with feature j",

            },

          ],

        },



        {

          title:

            "Residual",

          explanation:

            "A residual measures the difference between an observed target and its fitted prediction.",

          formula:

            "eᵢ = yᵢ - ŷᵢ",

          variables: [

            {

              symbol: "eᵢ",

              meaning:

                "Residual for observation i",

            },

            {

              symbol: "yᵢ",

              meaning:

                "Actual target",

            },

            {

              symbol: "ŷᵢ",

              meaning:

                "Predicted target",

            },

          ],

        },



        {

          title:

            "Mean Squared Error",

          explanation:

            "MSE averages squared prediction errors and is closely connected with ordinary least-squares regression.",

          formula:

            "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",

          variables: [

            {

              symbol: "n",

              meaning:

                "Number of observations",

            },

          ],

        },



        {

          title:

            "Matrix Form",

          explanation:

            "Multiple Linear Regression can be written compactly using matrix notation.",

          formula:

            "ŷ = Xβ",

          variables: [

            {

              symbol: "X",

              meaning:

                "Design matrix containing features",

            },

            {

              symbol: "β",

              meaning:

                "Vector of coefficients",

            },

            {

              symbol: "ŷ",

              meaning:

                "Vector of predictions",

            },

          ],

        },



        {

          title:

            "Ordinary Least Squares Solution",

          explanation:

            "When the required matrix conditions hold, the least-squares coefficient solution can be expressed using the normal-equation form. Numerical libraries generally use more stable computational techniques rather than explicitly calculating a matrix inverse.",

          formula:

            "β̂ = (XᵀX)⁻¹Xᵀy",

          variables: [

            {

              symbol: "Xᵀ",

              meaning:

                "Transpose of the design matrix",

            },

            {

              symbol: "β̂",

              meaning:

                "Estimated coefficient vector",

            },

          ],

        },

      ],



      // =====================================================

      // OBJECTIVE FUNCTION

      // =====================================================



      objectiveFunctions: [

        {

          name:

            "Residual Sum of Squares / Ordinary Least Squares",



          purpose:

            "Find coefficients that minimize squared prediction errors on the training observations.",



          intuition: [

            "Every incorrect prediction creates an error.",

            "The errors are squared so that negative and positive errors cannot cancel.",

            "Squaring also makes large errors contribute more strongly.",

            "The best-fitting coefficients are those producing the smallest total squared residual.",

          ],



          formula:

            "RSS = Σ(yᵢ - ŷᵢ)²",



          variables: [

            {

              symbol: "yᵢ",

              meaning:

                "Actual target value",

            },

            {

              symbol: "ŷᵢ",

              meaning:

                "Predicted target value",

            },

          ],



          explanation: [

            "Ordinary Linear Regression does not directly penalize large coefficient values.",

            "Ridge and Lasso extend this idea by adding regularization penalties.",

          ],



          optimizationGoal:

            "minimize",



          practicalMeaning: [

            "The model searches for the linear relationship that produces the smallest squared training residuals.",

            "Because errors are squared, extreme residuals can strongly influence the fitted model.",

          ],

        },

      ],



      // =====================================================

      // ASSUMPTIONS

      // =====================================================



      assumptions: [

        {

          id: "lr-assumption-linearity",

          title:

            "Linearity in parameters / appropriate functional form",

          explanation:

            "The expected target should be adequately represented by the chosen linear combination of predictors, possibly after suitable transformations or engineered terms.",

          whyItMatters:

            "If the true relationship contains important non-linear structure that the model does not represent, systematic prediction errors may remain.",

          violationEffect:

            "Residual plots may show curves or structured patterns and predictive performance may be poor.",

          howToCheck: [

            "Plot residuals against fitted values.",

            "Inspect feature-target relationships.",

            "Use partial or component-residual diagnostics when appropriate.",

          ],

          remedies: [

            "Transform features.",

            "Add polynomial or interaction terms when justified.",

            "Use a model capable of representing non-linear relationships.",

          ],

        },



        {

          id: "lr-assumption-independent-errors",

          title:

            "Independent errors",

          explanation:

            "Regression errors should not contain strong dependence that the model ignores.",

          whyItMatters:

            "Dependence can make classical uncertainty estimates unreliable and may indicate missing temporal, grouped or spatial structure.",

          howToCheck: [

            "Inspect residuals in observation or time order.",

            "Consider autocorrelation diagnostics for time-dependent data.",

            "Understand whether observations are naturally grouped.",

          ],

          remedies: [

            "Add relevant temporal or grouped structure.",

            "Use methods designed for correlated observations when inference is required.",

          ],

        },



        {

          id: "lr-assumption-homoscedasticity",

          title:

            "Constant error variance",

          explanation:

            "Classical linear-model inference commonly assumes that the variance of the error is approximately constant across predictor or fitted-value ranges.",

          whyItMatters:

            "Strong heteroscedasticity can make standard-error estimates and inferential conclusions unreliable.",

          violationEffect:

            "Residual spread may increase or decrease as fitted values change.",

          howToCheck: [

            "Residual-versus-fitted plot.",

            "Inspect whether residual spread forms a funnel pattern.",

          ],

          remedies: [

            "Transform the target where appropriate.",

            "Use heteroscedasticity-robust inference when statistical inference is the goal.",

            "Investigate missing predictors or changing variance structure.",

          ],

        },



        {

          id: "lr-assumption-normal-errors",

          title:

            "Normality of errors for classical inference",

          explanation:

            "Normally distributed errors are not required simply to compute ordinary least-squares predictions, but normality becomes important for some small-sample statistical inference procedures.",

          whyItMatters:

            "Confidence intervals and hypothesis tests based on classical assumptions may become less reliable when error distributions are severely non-normal, especially in small samples.",

          howToCheck: [

            "Inspect residual histogram.",

            "Inspect a Q-Q plot.",

          ],

          remedies: [

            "Investigate outliers.",

            "Consider transformations.",

            "Use robust or resampling-based inference when appropriate.",

          ],

        },



        {

          id: "lr-assumption-multicollinearity",

          title:

            "No severe multicollinearity for stable coefficient interpretation",

          explanation:

            "Predictors should not be so strongly linearly related that their individual effects become difficult to estimate reliably.",

          whyItMatters:

            "Strong multicollinearity can make coefficients unstable and inflate uncertainty even when predictions remain acceptable.",

          violationEffect:

            "Coefficient signs or magnitudes may change substantially with small data changes.",

          howToCheck: [

            "Correlation analysis.",

            "Variance Inflation Factor when appropriate.",

            "Inspect coefficient stability.",

          ],

          remedies: [

            "Remove redundant predictors when justified.",

            "Combine correlated variables.",

            "Use regularization such as Ridge.",

          ],

        },

      ],



      // =====================================================

      // PARAMETERS

      // =====================================================



      parameters: [
        {
          id: "lr-fit-intercept",
          name: "fit_intercept",
          displayName: "Fit Intercept",
          category: "implementation",
          description: "Controls whether LinearRegression estimates an intercept term in addition to the feature coefficients. For most ordinary regression problems this should remain enabled.",
          intuition: "Imagine fitting a straight line to points on a graph. With fit_intercept=true, the line is free to move vertically until it finds the best-fitting position. With fit_intercept=false, the fitted relationship is constrained so that the prediction has no independently learned constant offset.",
          defaultValue: "true",
          acceptedValues: "true or false",
          mathematicalMeaning: "true: ŷ = β₀ + β₁x₁ + ... + βₚxₚ. false: ŷ = β₁x₁ + ... + βₚxₚ, so there is no independently estimated β₀ term.",
          lowValueEffect: ["fit_intercept=false removes the independently estimated intercept.", "The model loses one degree of freedom.", "The fitted relationship is constrained by the zero-intercept formulation.", "If a non-zero intercept is actually required, all feature coefficients may shift in an attempt to compensate."],
          highValueEffect: ["fit_intercept=true allows the model to estimate β₀.", "The fitted line, plane or hyperplane can shift away from the zero-intercept constraint.", "This is appropriate for most ordinary regression problems."],
          biasEffect: "Incorrectly forcing the intercept to zero can create substantial systematic bias. Keeping an unnecessary intercept generally adds only one parameter and is usually much less damaging than incorrectly removing a required intercept.",
          varianceEffect: "Estimating one additional intercept usually has a very small effect on variance compared with feature count, multicollinearity and dataset size.",
          overfittingEffect: "fit_intercept=true is rarely an important source of overfitting by itself because it adds only a constant term.",
          underfittingEffect: "fit_intercept=false can cause strong underfitting when the true relationship requires a non-zero baseline.",
          computationalEffect: "The computational difference is normally negligible.",
          memoryEffect: "The memory difference is negligible for practical ML workloads.",
          whenToIncrease: ["This is Boolean, so it is enabled rather than numerically increased.", "Use true for most ordinary regression problems.", "Use true whenever the target may have a non-zero baseline after accounting for the feature representation."],
          whenToDecrease: ["Set false only when the mathematical or domain formulation genuinely requires no independently estimated intercept.", "A carefully designed preprocessing/formulation may sometimes justify disabling it, but this should be intentional."],
          whenToTune: ["Rarely include this in generic hyperparameter optimization.", "Compare true and false only when both formulations make genuine mathematical sense for the problem."],
          whenNotToTune: ["Do not blindly put fit_intercept in GridSearchCV.", "Do not set it false merely because StandardScaler was used.", "Do not assume feature standardization automatically means the fitted regression should have zero intercept."],
          tuningStrategy: ["Start with true.", "Ask whether a zero-intercept model is scientifically or mathematically justified.", "If false is plausible, compare the formulations using validation and residual diagnostics.", "Inspect whether forcing zero causes systematic prediction errors."],
          recommendedValues: ["true for most applications.", "false only with a clear mathematical, preprocessing or domain justification."],
          interactions: [
            { parameter: "feature centering", explanation: "Centering changes the numerical interpretation of the intercept, but does not automatically justify removing it." },
            { parameter: "feature scaling", explanation: "Scaling feature magnitudes is different from deciding whether the model should contain an intercept." },
            { parameter: "positive", explanation: "positive constrains feature coefficients, while fit_intercept separately determines whether an intercept is estimated." },
          ],
          commonMistakes: ["Setting fit_intercept=false simply because the features were standardized.", "Assuming the intercept must always have an obvious real-world interpretation.", "Thinking removing the intercept is a normal method for reducing overfitting.", "Forcing the model through the zero-intercept formulation without domain justification."],
          examNotes: ["The intercept is the constant β₀ in the regression equation.", "fit_intercept=true allows β₀ to be estimated.", "fit_intercept=false removes the independently estimated intercept.", "Forcing an incorrect zero intercept can bias the fitted coefficients."],
          interviewNotes: ["Be able to explain why forcing a regression through the origin can change every coefficient.", "Know the difference between feature scaling/centering and removing the intercept.", "If asked whether StandardScaler means fit_intercept should be false, the general answer is no."],
        },
        {
          id: "lr-copy-x",
          name: "copy_X",
          displayName: "Copy Feature Matrix",
          category: "implementation",
          description: "Controls whether LinearRegression is allowed to work with a copy of the input feature matrix X rather than necessarily preserving the original object untouched during internal fitting operations.",
          intuition: "Imagine X as your original notebook containing the training data. copy_X=true lets the estimator make its own working copy when needed. copy_X=false says that avoiding an extra copy is acceptable, which can reduce copying overhead but means you should understand the estimator's data-handling behavior.",
          defaultValue: "true",
          acceptedValues: "true or false",
          mathematicalMeaning: "copy_X does not change the regression hypothesis ŷ = β₀ + Xβ and does not add any term to the least-squares objective.",
          lowValueEffect: ["copy_X=false may avoid an additional copy of the feature matrix in some workflows.", "Can be useful when memory management is important.", "Does not make the statistical model simpler."],
          highValueEffect: ["copy_X=true prioritizes preserving the original feature matrix from in-place modification by the estimator.", "This is the normal and safer default for most users."],
          biasEffect: "No intended statistical bias effect.", varianceEffect: "No intended statistical variance effect.", overfittingEffect: "Does not control overfitting.", underfittingEffect: "Does not control underfitting.",
          computationalEffect: "Copying a very large matrix can add data-copying overhead. For ordinary datasets the effect is usually not important compared with the actual least-squares computation.",
          memoryEffect: "copy_X=true may require additional memory for a copy of X. copy_X=false can reduce copying in some situations, although actual memory behavior also depends on input representation and solver operations.",
          whenToIncrease: ["This is Boolean rather than numeric.", "Keep true when preserving the original input data is more important than minimizing copying."],
          whenToDecrease: ["Consider false only in specialized memory-sensitive workflows.", "Use false only when you understand the consequences of allowing the input data to be handled without the normal copy guarantee."],
          whenToTune: ["Normally never tune this for predictive performance.", "Consider it only for engineering, memory or data-handling requirements."],
          whenNotToTune: ["Do not put copy_X into GridSearchCV expecting MAE, RMSE or R² improvements.", "Do not change it when you are trying to solve underfitting or overfitting."],
          tuningStrategy: ["Keep true during normal model development.", "Only benchmark false when memory copying is a demonstrated bottleneck.", "Verify the surrounding data pipeline before relying on no-copy behavior."],
          recommendedValues: ["true for normal use.", "false only for carefully controlled memory-sensitive workflows."],
          interactions: [{ parameter: "input matrix size", explanation: "The practical memory impact becomes more relevant as X becomes very large." }, { parameter: "preprocessing pipeline", explanation: "Other preprocessing steps may already allocate transformed arrays, so changing copy_X does not necessarily eliminate the major memory costs of the full pipeline." }],
          commonMistakes: ["Treating copy_X as a predictive hyperparameter.", "Expecting copy_X=false to improve model accuracy.", "Disabling copying without understanding data mutation and memory behavior.", "Spending time tuning copy_X while ignoring feature quality and validation."],
          examNotes: ["copy_X is an implementation/memory-related setting.", "It does not change the mathematical Linear Regression model.", "It should not normally be optimized for predictive performance."],
          interviewNotes: ["Classify copy_X as an engineering parameter rather than a model-complexity parameter.", "Explain that not every constructor parameter is a meaningful predictive hyperparameter."],
        },




        {

  id: "lr-tol",



  name: "tol",



  displayName:

    "Numerical Solver Tolerance",



  category:

    "optimization",



  description:

    "Controls the numerical tolerance used by LinearRegression when the underlying solving path supports a tolerance criterion. It controls numerical convergence or precision rather than model complexity.",



  intuition:

    "Think of tol as telling the numerical solver how precisely it should solve the least-squares problem. A smaller tolerance asks for a stricter numerical solution, while a larger tolerance may permit the solver to stop with a less precise solution. It is not a regularization parameter and normally should not be treated like an accuracy-tuning knob.",



  defaultValue:

    "1e-6 in current scikit-learn LinearRegression",



  acceptedValues:

    "Non-negative floating-point value.",



  mathematicalMeaning:

    "tol affects numerical stopping or precision criteria in applicable LinearRegression solver paths. It does not add a term such as λ||β||² or λ||β||₁ to the least-squares objective.",



  lowValueEffect: [

    "Requests stricter numerical precision where the active solver uses tol.",

    "May require additional numerical work.",

    "Does not automatically improve validation performance.",

    "Does not reduce statistical bias in the same way that changing model structure might.",

  ],



  highValueEffect: [

    "Allows a looser numerical solution where tolerance is used.",

    "May reduce numerical work.",

    "An excessively loose value may reduce numerical solution accuracy.",

  ],



  biasEffect:

    "tol is fundamentally a numerical optimization parameter, not a statistical bias-control parameter. Reasonable changes should not be interpreted like regularization changes.",



  varianceEffect:

    "tol does not directly control model variance in the way Ridge or Lasso regularization does.",



  overfittingEffect:

    "Lowering tol is not a valid strategy for solving overfitting.",



  underfittingEffect:

    "Increasing tol excessively could theoretically leave a less accurate numerical solution, but normal underfitting should be diagnosed through model structure, features and validation rather than tol.",



  computationalEffect:

    "A stricter tolerance can require more numerical work in solver paths where tolerance controls convergence.",



  memoryEffect:

    "Usually not a major memory-control parameter.",



  whenToIncrease: [

    "When numerical precision is unnecessarily strict for the workload.",

    "When solver cost matters and a slightly looser numerical solution is acceptable.",

  ],



  whenToDecrease: [

    "When numerical diagnostics suggest that greater solver precision is actually required.",

    "When working with a problem where the relevant least-squares solver is sensitive to its stopping tolerance.",

  ],



  whenToTune: [

    "When numerical convergence or solver precision is genuinely relevant.",

    "When working with data/solver paths where tol affects the least-squares computation.",

  ],



  whenNotToTune: [

    "Do not use tol as the first parameter to optimize for predictive performance.",

    "Do not decrease tol merely because validation R² is poor.",

    "Do not use tol to address overfitting.",

    "Do not confuse it with Ridge alpha, Lasso alpha or another regularization-strength parameter.",

  ],



  tuningStrategy: [

    "Keep the default for ordinary use.",

    "First diagnose data quality, conditioning and feature representation.",

    "Only change tolerance when there is a numerical reason.",

    "Evaluate whether the change materially affects coefficients or predictions before keeping it.",

  ],



  recommendedValues: [

    "Start with the library default.",

    "Change only when numerical behavior provides a reason.",

  ],



  interactions: [

    {

      parameter:

        "data representation",

      explanation:

        "Numerical conditioning and sparse/dense representation can affect which solving path is used and how numerical precision matters.",

    },



    {

      parameter:

        "positive",

      explanation:

        "Enabling coefficient positivity changes the optimization problem and solving behavior; tol should still not be interpreted as regularization.",

    },

  ],



  commonMistakes: [

    "Thinking smaller tol always means a better ML model.",

    "Using tol to fight overfitting.",

    "Calling tol a regularization parameter.",

    "Assuming numerical convergence and generalization are the same thing.",

  ],



  examNotes: [

    "tol is a numerical solver tolerance.",

    "It does not control regularization strength.",

    "A smaller tolerance generally requests greater numerical precision where applicable.",

  ],



  interviewNotes: [

    "If asked whether reducing tol improves accuracy, explain the difference between numerical optimization accuracy and predictive generalization.",

    "Know that LinearRegression does not expose learning_rate or epochs like gradient-descent estimators.",

  ],

},
        {
          id: "lr-n-jobs",
          name: "n_jobs",
          displayName: "Number of Parallel Jobs",
          category: "performance",
          description: "Controls the amount of parallel computation used by LinearRegression in fitting situations where its implementation can benefit from parallel work.",
          intuition: "n_jobs is about how many workers may help perform supported computations. It changes how the computation is executed, not the regression equation the model is trying to learn.",
          defaultValue: "None",
          acceptedValues: "None, -1, or an integer according to the parallel-execution conventions used by scikit-learn/joblib.",
          mathematicalMeaning: "n_jobs does not change ŷ = β₀ + Xβ and does not change the ordinary least-squares objective. It is a computational execution setting.",
          lowValueEffect: ["Using fewer workers can reduce parallel overhead and resource usage.", "A single-worker configuration may be sufficient for workloads that do not benefit from parallel fitting."],
          highValueEffect: ["Using more workers may reduce fitting time in supported workloads.", "More workers can also increase CPU and memory pressure.", "Increasing parallelism does not guarantee proportional speedup."],
          biasEffect: "No intended effect on statistical bias.", varianceEffect: "No intended effect on statistical variance.", overfittingEffect: "Does not control overfitting.", underfittingEffect: "Does not control underfitting.",
          computationalEffect: "Can improve fitting speed only when the particular LinearRegression workload supports useful parallel execution. Many ordinary single-target dense problems may see little or no benefit.",
          memoryEffect: "Parallel execution can increase total resource usage because multiple workers or parallel operations may require additional working memory.",
          whenToIncrease: ["When the workload is one of the cases that can benefit from LinearRegression parallelism.", "When multiple CPU cores are available and fitting time is a meaningful bottleneck."],
          whenToDecrease: ["When parallel execution causes excessive CPU or memory pressure.", "When overhead is greater than the speed benefit.", "When the surrounding application must share computational resources."],
          whenToTune: ["Tune only for computational throughput or resource management.", "Benchmark it when training performance matters and the workload supports parallelism."],
          whenNotToTune: ["Do not optimize n_jobs for validation accuracy.", "Do not expect n_jobs=-1 to improve R².", "Do not assume every LinearRegression fit becomes faster with more workers."],
          tuningStrategy: ["Start with None.", "Measure actual fitting time before changing it.", "If the workload supports parallelism, compare a reasonable worker count with -1.", "Monitor CPU usage, memory usage and wall-clock training time.", "Choose the smallest resource level that provides the required throughput."],
          recommendedValues: ["None for normal default behavior.", "-1 when using all available processors is appropriate and the workload benefits from it.", "A fixed positive integer when computational resources need to be controlled."],
          interactions: [{ parameter: "number of targets", explanation: "Parallel fitting is more useful in certain multi-target situations than in ordinary single-target dense regression." }, { parameter: "positive", explanation: "The computational path used with constrained coefficients can differ from ordinary unconstrained dense least squares, affecting when parallelism is useful." }, { parameter: "hardware", explanation: "The real benefit depends on available CPU resources, memory bandwidth and the surrounding workload." }],
          commonMistakes: ["Thinking n_jobs=-1 makes the model statistically better.", "Assuming twice as many CPU cores always means twice the fitting speed.", "Including n_jobs in a predictive GridSearchCV parameter grid.", "Ignoring memory and CPU contention."],
          examNotes: ["n_jobs controls computational parallelism, not model complexity.", "Changing n_jobs should not be presented as a method for reducing prediction error."],
          interviewNotes: ["Know the difference between computational parameters and predictive hyperparameters.", "If asked why n_jobs=-1 may not speed up ordinary Linear Regression, explain that parallelism only helps supported computational paths and also introduces overhead."],
        },




        {

          id: "lr-positive",

          name: "positive",

          displayName:

            "Positive Coefficients Constraint",

          category:

            "core",



          description:

            "When enabled in supported dense-data usage, constrains learned coefficients to be non-negative.",



          intuition:

            "The model is forbidden from assigning a negative contribution to any feature coefficient.",



          defaultValue: "false",



          acceptedValues:

            "true or false",



          mathematicalMeaning:

            "Adds the constraint βⱼ ≥ 0 for fitted coefficients.",



          lowValueEffect: [

            "false allows both positive and negative coefficients.",

          ],



          highValueEffect: [

            "true restricts the coefficient search space to non-negative values.",

          ],



          biasEffect:

            "The constraint can increase bias if genuinely negative relationships exist, but may encode valuable domain knowledge when negative coefficients are impossible or undesirable.",



          varianceEffect:

            "Constraining the parameter space can sometimes stabilize the solution, although it is not the same as Ridge or Lasso regularization.",



          underfittingEffect:

            "Can underfit when the target truly decreases with some predictors.",



          whenToIncrease: [

            "Enable when domain knowledge requires non-negative coefficients.",

          ],



          whenToDecrease: [

            "Disable when both positive and negative feature effects are plausible.",

          ],



          whenToTune: [

            "Usually choose from domain constraints rather than generic search.",

          ],



          whenNotToTune: [

            "Do not enable merely because some fitted coefficients look surprising.",

          ],



          commonMistakes: [

            "Using positive=true to hide data-quality or multicollinearity problems.",

            "Assuming every feature should logically have a positive coefficient.",

          ],



          interviewNotes: [

            "Explain that coefficient constraints encode prior structural knowledge but can increase bias if the constraint is wrong.",

          ],

        },

      ],



      // =====================================================

      // DATA REQUIREMENTS

      // =====================================================



      dataRequirements: {

        scaling: {

          required: false,

          explanation:

            "Ordinary unregularized Linear Regression can be fitted without feature scaling. However, scaling can improve numerical conditioning, make coefficient magnitudes easier to compare in some contexts, and becomes especially important when Linear Regression is optimized iteratively or when regularization is introduced.",

        },



        categoricalFeatures: {

          supportedDirectly: false,

          explanation:

            "Standard LinearRegression expects numerical feature representations.",

          recommendations: [

            "One-hot encode nominal categorical variables.",

            "Use meaningful ordinal encoding only when an actual order exists.",

            "Avoid assigning arbitrary integer codes to nominal categories because this introduces an artificial numeric relationship.",

          ],

        },



        missingValues: {

          supportedDirectly: false,

          explanation:

            "Ordinary scikit-learn LinearRegression does not accept arbitrary NaN feature values as normal training input.",

          recommendations: [

            "Investigate why values are missing.",

            "Impute using a train-fitted preprocessing strategy when appropriate.",

            "Consider missing indicators when missingness itself may contain useful information.",

          ],

        },



        outliers: {

          sensitivity: "high",

          explanation:

            "Squared-error fitting gives large residuals disproportionate influence, so extreme observations can strongly change the fitted coefficients.",

          recommendations: [

            "Investigate influential observations.",

            "Do not automatically delete every outlier.",

            "Distinguish data errors from legitimate extreme observations.",

            "Consider robust alternatives when extreme values dominate the fit.",

          ],

        },



        imbalance: {

          sensitivity: "low",

          explanation:

            "Class imbalance is a classification concept and is not directly applicable to ordinary continuous-target Linear Regression. However, uneven representation across important target ranges or subpopulations can still affect model quality.",

          recommendations: [

            "Inspect the target distribution.",

            "Check performance across important subgroups and target ranges.",

          ],

        },



        featureDistribution: [

          "Predictors do not individually need to follow a normal distribution for ordinary least-squares prediction.",

          "Strong skewness may still reveal transformations or influential observations worth investigating.",

          "For classical inference, assumptions concern the error structure more directly than the marginal normality of every feature.",

        ],



        sampleSizeConsiderations: [

          "The number of observations should be sufficient relative to the number of parameters being estimated.",

          "Very small datasets can produce unstable coefficients.",

          "As dimensionality approaches or exceeds sample size, ordinary least-squares estimation becomes increasingly problematic and regularization may be preferable.",

        ],



        dimensionalityConsiderations: [

          "Large numbers of correlated features can create unstable coefficient estimates.",

          "High-dimensional data often benefit from regularization or dimensionality reduction.",

          "Adding irrelevant features can increase variance and reduce interpretability.",

        ],

      },



      // =====================================================

      // BIAS / VARIANCE

      // =====================================================



      biasVariance: {

        bias: "medium",

        variance: "low",



        explanation: [

          "A basic Linear Regression model is relatively constrained because it represents a linear relationship in the supplied features.",

          "If the real relationship is strongly non-linear and the feature representation does not capture that structure, bias can be high.",

          "Compared with flexible models such as deep trees, ordinary Linear Regression often has lower variance.",

          "Variance can nevertheless increase with many predictors, severe multicollinearity, small datasets or noisy feature engineering.",

        ],



        underfittingCauses: [

          "Important non-linear relationships.",

          "Missing relevant predictors.",

          "Missing interactions.",

          "Overly simplistic feature representation.",

        ],



        overfittingCauses: [

          "Too many irrelevant predictors relative to dataset size.",

          "High-dimensional feature expansion.",

          "Strong multicollinearity.",

          "Fitting noise through excessive engineered terms.",

        ],



        reduceUnderfitting: [

          "Engineer justified transformations.",

          "Add useful interaction terms.",

          "Add relevant predictors.",

          "Consider polynomial or non-linear models.",

        ],



        reduceOverfitting: [

          "Remove unjustified features.",

          "Use cross-validation.",

          "Use Ridge, Lasso or Elastic Net regularization.",

          "Increase training data when possible.",

        ],

      },



      // =====================================================

      // COMPLEXITY

      // =====================================================



      complexity: {

        training:

          "Depends on the least-squares solver, number of samples n and number of features p. Dense least-squares solutions are generally efficient for ordinary tabular problems but become more expensive as dimensionality grows.",



        prediction:

          "Approximately O(p) per observation because prediction is primarily a dot product between p feature values and p coefficients.",



        memory:

          "Primarily depends on storing the dataset and linear-algebra structures required by the solver.",



        explanation: [

          "Prediction is extremely fast compared with many non-linear ensemble models.",

          "Training is usually practical for standard tabular datasets.",

          "Very high-dimensional or sparse settings may require specialized linear estimators or solvers.",

        ],



        scalabilityNotes: [

          "Linear models are generally attractive when low-latency prediction is important.",

          "For extremely large datasets, stochastic optimization variants such as SGDRegressor may be useful.",

        ],

      },



      // =====================================================

      // ADVANTAGES

      // =====================================================



      advantages: [

        "Simple to understand.",

        "Fast to train on ordinary datasets.",

        "Very fast prediction.",

        "Highly interpretable when features are appropriately constructed.",

        "Provides a strong regression baseline.",

        "Coefficients provide information about linear feature effects conditional on the included model.",

        "Well-established mathematical theory.",

        "Useful foundation for understanding regularization and generalized linear models.",

      ],



      limitations: [

        "Cannot automatically represent complex non-linear relationships.",

        "Can be strongly influenced by outliers.",

        "Coefficient interpretation can become unstable under severe multicollinearity.",

        "Requires numerical feature representations.",

        "Ordinary LinearRegression does not automatically perform feature selection.",

        "Can underfit complicated real-world relationships.",

        "Extrapolation outside the observed feature range can be unreliable.",

        "Association represented by coefficients does not automatically imply causation.",

      ],



      whenToUse: [

        "The target is continuous.",

        "A roughly linear or linearly representable relationship is plausible.",

        "Interpretability matters.",

        "A fast baseline is needed.",

        "Prediction latency must be very low.",

        "You want to understand feature-effect direction before moving to more complex models.",

      ],



      whenNotToUse: [

        "The target is categorical.",

        "The relationship is strongly non-linear and suitable feature transformations are unavailable.",

        "The data contain influential extreme values that cannot be handled appropriately.",

        "Complex interactions dominate and must be learned automatically.",

        "The primary goal requires a model naturally suited to another data structure such as images or raw text.",

      ],



      // =====================================================

      // EVALUATION

      // =====================================================



      evaluation: {

        problemType: "regression",



        recommendedMetrics: [

          {

            metric: "MAE",

            why:

              "Measures the average absolute prediction error in the original target units.",

            caution:

              "Does not penalize very large errors as strongly as squared-error metrics.",

          },

          {

            metric: "MSE",

            why:

              "Penalizes large prediction errors more strongly and aligns closely with least-squares training.",

            caution:

              "Its squared units can make interpretation less intuitive.",

          },

          {

            metric: "RMSE",

            why:

              "Returns squared-error performance to the target's original units.",

            caution:

              "Can be strongly influenced by large errors.",

          },

          {

            metric: "R²",

            why:

              "Measures improvement relative to a constant mean-prediction baseline in terms of explained variation.",

            caution:

              "A high R² does not prove causality or guarantee that assumptions are satisfied.",

          },

        ],



        validationStrategy: [

          "Keep an untouched test set for final evaluation when data size allows.",

          "Use cross-validation for more reliable model comparison.",

          "Use time-aware splitting rather than random splitting for temporal prediction problems.",

        ],



        diagnosticChecks: [

          "Compare training and validation metrics.",

          "Plot residuals against predictions.",

          "Inspect residual distribution.",

          "Check for systematic residual patterns.",

          "Inspect unusually influential observations.",

          "Check coefficient stability when multicollinearity is suspected.",

        ],



        misleadingMetrics: [

          "Do not judge a regression model using classification accuracy.",

          "Do not rely only on R².",

          "Do not compare raw MAE/RMSE values across targets with completely different scales without context.",

        ],

      },



      // =====================================================

      // TUNING

      // =====================================================



      tuning: {

        strategy: [

          "LinearRegression itself has very few predictive hyperparameters.",

          "Spend more effort on data quality, leakage prevention, feature representation and validation.",

          "Inspect whether the relationship is sufficiently linear.",

          "Investigate residuals.",

          "If overfitting or unstable coefficients are a concern, compare Ridge, Lasso and Elastic Net rather than searching arbitrary LinearRegression settings.",

        ],



        tuneFirst: [

          "Feature representation.",

          "Relevant transformations.",

          "Feature selection decisions.",

          "Whether regularization is required.",

        ],



        tuneLater: [

          "Specialized solver-related settings when they are actually relevant.",

        ],



        searchSpaceTips: [

          "Do not create a large GridSearchCV merely because other models have many hyperparameters.",

          "For linear models, model-family choice and regularization strength are usually more important than implementation flags.",

        ],



        parameterInteractions: [

          "fit_intercept interacts with centering and the mathematical meaning of the feature representation.",

          "positive constrains coefficient signs and can significantly change the optimum.",

          "Feature scaling becomes particularly important when moving from ordinary LinearRegression to regularized models.",

        ],



        practicalWorkflow: [

          "Build a clean baseline LinearRegression.",

          "Evaluate with cross-validation.",

          "Inspect residuals.",

          "Inspect coefficient stability.",

          "Check multicollinearity.",

          "Engineer justified features.",

          "Compare regularized linear models.",

          "Compare against suitable non-linear baselines.",

        ],

      },



      // =====================================================

      // COMPARISONS

      // =====================================================



      comparisons: [

        {

          model: "Ridge Regression",

          relationship:

            "Regularized linear model",

          similarities: [

            "Both make linear predictions.",

            "Both estimate feature coefficients.",

          ],

          differences: [

            "Ridge adds an L2 penalty to coefficient magnitude.",

            "Ridge is often more stable when predictors are strongly correlated.",

          ],

          preferCurrentWhen: [

            "A simple unregularized baseline is desired.",

            "Coefficient shrinkage is unnecessary.",

          ],

          preferOtherWhen: [

            "Multicollinearity or high variance is a concern.",

            "Many predictors require coefficient shrinkage.",

          ],

          examTip:

            "Linear Regression minimizes prediction error; Ridge additionally penalizes squared coefficient magnitude.",

        },



        {

          model: "Lasso Regression",

          relationship:

            "Sparse regularized linear model",

          similarities: [

            "Both produce linear predictions.",

          ],

          differences: [

            "Lasso adds an L1 penalty.",

            "Lasso can drive some coefficients exactly to zero.",

          ],

          preferOtherWhen: [

            "A sparse linear model or embedded feature selection is useful.",

          ],

        },



        {

          model: "Decision Tree Regression",

          relationship:

            "Non-linear regression alternative",

          similarities: [

            "Both can predict continuous targets.",

          ],

          differences: [

            "Decision trees learn piecewise decision regions.",

            "Trees automatically capture many non-linear relationships and interactions.",

            "Linear Regression extrapolates according to its fitted linear function.",

          ],

          preferCurrentWhen: [

            "Interpretability through coefficients matters.",

            "The relationship is approximately linear.",

          ],

          preferOtherWhen: [

            "Strong non-linearities and interactions dominate.",

          ],

        },

      ],



      // =====================================================

      // FAILURE MODES

      // =====================================================



      failureModes: [

        {

          id: "lr-failure-nonlinearity",

          symptom:

            "Residual plot shows a curved pattern.",

          likelyCauses: [

            "Important non-linear relationship.",

            "Missing transformation.",

            "Missing interaction.",

          ],

          diagnosis: [

            "Plot residuals against fitted values.",

            "Inspect feature-target relationships.",

          ],

          fixes: [

            "Transform features.",

            "Add justified polynomial or interaction terms.",

            "Try an appropriate non-linear model.",

          ],

        },



        {

          id: "lr-failure-outliers",

          symptom:

            "A few observations strongly change the fitted line.",

          likelyCauses: [

            "Extreme residuals.",

            "High-leverage observations.",

            "Data-entry errors.",

          ],

          diagnosis: [

            "Inspect scatter plots.",

            "Inspect residuals.",

            "Investigate influential observations.",

          ],

          fixes: [

            "Correct invalid data.",

            "Investigate legitimate extremes.",

            "Consider robust regression when appropriate.",

          ],

        },



        {

          id: "lr-failure-multicollinearity",

          symptom:

            "Coefficients change dramatically across data splits or have unexpected signs.",

          likelyCauses: [

            "Highly correlated predictors.",

            "Redundant features.",

          ],

          diagnosis: [

            "Inspect feature correlations.",

            "Check VIF when appropriate.",

            "Compare coefficient stability across folds.",

          ],

          fixes: [

            "Remove redundant predictors when justified.",

            "Combine related predictors.",

            "Use Ridge regularization.",

          ],

        },



        {

          id: "lr-failure-leakage",

          symptom:

            "Validation performance appears unrealistically excellent.",

          likelyCauses: [

            "Target leakage.",

            "Preprocessing fitted before the data split.",

            "Future information included in features.",

          ],

          diagnosis: [

            "Audit every feature.",

            "Inspect preprocessing order.",

            "Recreate validation using a leakage-safe pipeline.",

          ],

          fixes: [

            "Remove leaked features.",

            "Fit data-dependent preprocessing only on training folds.",

            "Use Pipeline where appropriate.",

          ],

        },

      ],



      // =====================================================

      // REAL-WORLD APPLICATIONS

      // =====================================================



      realWorldApplications: [

        {

          title:

            "House Price Baseline",

          domain:

            "Real Estate",

          problem:

            "Predict property price from size, room count and other numerical/encoded characteristics.",

          whyModelFits:

            "Provides an interpretable baseline and allows inspection of approximate linear feature effects.",

          limitations: [

            "Real property markets often contain strong non-linearities, location interactions and threshold effects.",

          ],

        },



        {

          title:

            "Sales Forecasting Baseline",

          domain:

            "Business",

          problem:

            "Estimate sales from advertising spend, price and other explanatory variables.",

          whyModelFits:

            "Useful for understanding approximate directional relationships and establishing a baseline.",

          limitations: [

            "Temporal dependence, seasonality and non-linear responses may require richer models.",

          ],

        },



        {

          title:

            "Energy Consumption Estimation",

          domain:

            "Energy",

          problem:

            "Estimate numerical energy usage from environmental and operational variables.",

          whyModelFits:

            "Useful when relationships are sufficiently linear or transformed into a suitable representation.",

        },

      ],



      // =====================================================

      // INTERVIEW

      // =====================================================



      interviewQuestions: [

        {

          question:

            "What does Linear Regression actually learn?",

          shortAnswer:

            "It learns an intercept and feature coefficients that minimize a least-squares objective.",

          deepAnswer: [

            "The coefficients define a linear prediction function.",

            "Each coefficient describes the fitted change in prediction associated with a unit change in that feature while the other included predictors are held fixed, subject to the model specification.",

            "Ordinary least squares chooses coefficients minimizing the sum of squared residuals.",

          ],

        },



        {

          question:

            "Why are residuals squared?",

          shortAnswer:

            "Squaring prevents cancellation between positive and negative residuals and gives larger errors more influence.",

          followUpQuestions: [

            "How does this affect sensitivity to outliers?",

            "How does MAE differ from MSE?",

          ],

        },



        {

          question:

            "Does Linear Regression require normally distributed features?",

          shortAnswer:

            "No. Predictor variables themselves do not need to be normally distributed for ordinary least-squares prediction.",

          deepAnswer: [

            "Normality assumptions are more closely connected with the error distribution for certain classical inferential procedures.",

            "Predictive modeling and statistical inference should not be confused.",

          ],

        },



        {

          question:

            "Why can multicollinearity be a problem?",

          shortAnswer:

            "It can make individual coefficient estimates unstable and difficult to interpret.",

          deepAnswer: [

            "Correlated predictors provide overlapping information.",

            "Many combinations of coefficients may produce similar predictions.",

            "Prediction can remain reasonable even while individual coefficients become unstable.",

          ],

        },



        {

          question:

            "Does Linear Regression require feature scaling?",

          shortAnswer:

            "Not necessarily for ordinary unregularized least squares, but scaling can improve numerical behavior and becomes important for regularized or gradient-based variants.",

        },

      ],



      // =====================================================

      // EXAM NOTES

      // =====================================================



      examNotes: [

        {

          title:

            "Core definition",

          points: [

            "Linear Regression is a supervised learning algorithm used primarily for continuous numerical prediction.",

            "It models the target as a linear combination of input features.",

          ],

          formula:

            "ŷ = β₀ + β₁x₁ + ... + βₚxₚ",

          commonQuestion:

            "Explain Linear Regression and its working.",

        },



        {

          title:

            "Cost function",

          points: [

            "Ordinary least squares minimizes squared residual error.",

            "Squaring prevents positive and negative errors from cancelling.",

            "Large errors receive greater penalty.",

          ],

          formula:

            "MSE = (1/n) Σ(yᵢ - ŷᵢ)²",

          commonQuestion:

            "Why is Mean Squared Error used in Linear Regression?",

        },



        {

          title:

            "Important terminology",

          points: [

            "Feature: independent input variable.",

            "Target: numerical value being predicted.",

            "Coefficient: learned weight associated with a feature.",

            "Intercept: baseline component of prediction.",

            "Residual: difference between actual and predicted value.",

          ],

        },



        {

          title:

            "Important assumptions",

          points: [

            "Appropriate linear functional form.",

            "Independent error structure when assumed by the analysis.",

            "Approximately constant error variance for classical inference.",

            "No severe multicollinearity when stable coefficient interpretation is important.",

            "Normal error assumptions matter mainly for certain inferential procedures rather than merely computing predictions.",

          ],

          commonQuestion:

            "State and explain the assumptions of Linear Regression.",

        },

      ],

    },



    // =====================================================

    // TOP-LEVEL SUPPORTING CONTENT

    // =====================================================



    assumptions: [

      {

        id: "linear-regression-top-assumption",

        title:

          "Linear model suitability",

        explanation:

          "Linear Regression works best when the chosen feature representation can adequately describe the systematic relationship with a linear prediction function.",

        whyItMatters:

          "A model that cannot represent the underlying structure will systematically underfit.",

        howToCheck: [

          "Inspect residual plots.",

          "Compare against justified non-linear alternatives.",

        ],

      },

    ],



    realWorldApplications: [

      {

        title:

          "Numerical prediction baseline",

        domain:

          "General Machine Learning",

        problem:

          "Create a fast and interpretable baseline for a continuous prediction task.",

        whyModelFits:

          "Linear Regression is simple, efficient and provides an important reference point before more complex models are introduced.",

      },

    ],



    interviewQuestions: [

      {

        question:

          "What is the difference between a parameter and a hyperparameter in Linear Regression?",

        shortAnswer:

          "Coefficients and the intercept are learned model parameters, while configuration choices such as fit_intercept are hyperparameters supplied before fitting.",

      },

    ],



    examNotes: [

      {

        title:

          "Linear Regression quick revision",

        points: [

          "Supervised regression algorithm.",

          "Predicts continuous numerical values.",

          "Learns coefficients and usually an intercept.",

          "Ordinary least squares minimizes squared residuals.",

          "Evaluate with regression metrics such as MAE, MSE, RMSE and R².",

        ],

      },

    ],

  },

};