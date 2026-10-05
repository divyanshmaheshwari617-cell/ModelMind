import type {
  DeepLessonRegistry,
} from "../lessonContentTypes";

// =========================================================
// LINEAR MODEL FAMILY — EXPERT EDUCATIONAL CONTENT
// =========================================================
//
// Contains:
//
// 1. Polynomial Regression
// 2. Regularization
//    - Ridge Regression
//    - Lasso Regression
//    - Elastic Net
// 3. Logistic Regression
//
// Linear Regression is intentionally NOT duplicated here.
// It already exists in mlModelContent.ts.
//
// EDUCATIONAL CONTENT ONLY.
// No progress / persistence / completion state.
// No Model Lab integration.
// =========================================================

export const linearModelsContent: DeepLessonRegistry = {
  // =======================================================
  // POLYNOMIAL REGRESSION
  // =======================================================

  "polynomial-regression": {
    contentDepth: "expert",

    overview:
      "Polynomial Regression extends ordinary Linear Regression so that curved relationships can be represented. Instead of abandoning the linear-model framework, it creates transformed features such as x², x³ and interaction terms and then fits a linear model to those features. The model is therefore nonlinear with respect to the original input variables while remaining linear in its learned coefficients.",

    objectives: [
      "Understand why ordinary Linear Regression may underfit curved relationships.",
      "Understand polynomial feature expansion.",
      "Understand why Polynomial Regression remains linear in its coefficients.",
      "Understand polynomial degree.",
      "Understand interaction terms.",
      "Understand the polynomial design matrix.",
      "Understand how increasing degree changes model capacity.",
      "Recognize polynomial underfitting and overfitting.",
      "Understand why high-degree polynomial models can become unstable.",
      "Understand the importance of scaling.",
      "Understand the relationship between Polynomial Regression and regularization.",
      "Use PolynomialFeatures correctly.",
      "Build Polynomial Regression using a Pipeline.",
      "Select polynomial degree using validation rather than training error.",
      "Understand interpolation and dangerous extrapolation.",
    ],

    sections: [
      {
        id: "poly-problem",
        title: "Why Do We Need Polynomial Regression?",

        explanation: [
          "Ordinary Linear Regression assumes that the expected target can be represented as a linear combination of the supplied features.",
          "Sometimes the real relationship between a feature and target is curved.",
          "A straight line may systematically miss such structure even when the dataset contains a strong predictable pattern.",
          "Polynomial Regression addresses this problem by creating nonlinear transformations of the original features.",
          "A linear estimator can then learn coefficients for those transformed features.",
        ],

        intuition: [
          "Imagine trying to fit a straight ruler through points arranged like a U-shaped curve.",
          "Changing the slope and intercept cannot make the ruler bend.",
          "Polynomial features give the model additional directions such as x² and x³ that allow the fitted function to curve.",
        ],

        importantPoints: [
          "Polynomial Regression is useful when a relationship is curved but can be represented reasonably with polynomial terms.",
          "It is not automatically better than Linear Regression.",
          "Increasing polynomial degree increases flexibility and therefore overfitting risk.",
        ],
      },

      {
        id: "poly-basic-equation",
        title: "From a Straight Line to a Polynomial",

        explanation: [
          "Simple Linear Regression with one feature uses an intercept and one coefficient.",
          "Polynomial Regression augments the representation with powers of the original feature.",
          "A degree-two model can contain x and x².",
          "A degree-three model can contain x, x² and x³.",
          "The coefficients multiplying these transformed features are still learned linearly.",
        ],

        mathematics: {
          title: "Polynomial Regression Equation",

          explanation:
            "A one-feature polynomial model of degree d can be written as a weighted sum of powers of x.",

          formula:
            "ŷ = β₀ + β₁x + β₂x² + ... + β_d x^d",

          variables: [
            {
              symbol: "ŷ",
              meaning: "predicted target",
            },
            {
              symbol: "β₀",
              meaning: "intercept",
            },
            {
              symbol: "βⱼ",
              meaning:
                "coefficient for the corresponding polynomial feature",
            },
            {
              symbol: "d",
              meaning: "polynomial degree",
            },
          ],
        },

        importantPoints: [
          "The prediction is nonlinear in x.",
          "The model remains linear in β₀, β₁, ..., β_d.",
          "This distinction is important in exams and interviews.",
        ],
      },

      {
        id: "poly-feature-expansion",
        title: "Polynomial Feature Expansion",

        explanation: [
          "Polynomial Regression is commonly implemented as a feature-engineering step followed by a linear estimator.",
          "For one feature x, degree two may produce x and x².",
          "For multiple features, polynomial expansion can also create interaction terms.",
          "For example, features x₁ and x₂ can produce x₁², x₁x₂ and x₂².",
          "The expanded feature matrix is then supplied to a regression estimator.",
        ],

        examples: [
          {
            id: "poly-expansion-example",
            title: "Two Features with Degree Two",
            explanation:
              "Starting from x₁ and x₂, a degree-two polynomial expansion can include x₁, x₂, x₁², x₁x₂ and x₂².",
            importantPoints: [
              "x₁x₂ represents an interaction.",
              "The number of generated features can increase quickly.",
            ],
          },
        ],
      },

      {
        id: "poly-degree",
        title: "Polynomial Degree",

        explanation: [
          "Degree is one of the most important choices in Polynomial Regression.",
          "Degree one corresponds to an ordinary linear relationship.",
          "Degree two allows quadratic curvature.",
          "Higher degrees allow increasingly complex shapes.",
          "Training error will often decrease as degree increases because the model becomes more flexible.",
          "Validation error does not necessarily decrease.",
          "After some point, additional flexibility may model noise rather than generalizable structure.",
        ],

        intuition: [
          "Degree controls how much the fitted curve is allowed to bend.",
          "Too little flexibility misses real structure.",
          "Too much flexibility can chase individual training observations.",
        ],

        importantPoints: [
          "Low degree can cause high bias.",
          "Very high degree can cause high variance.",
          "Choose degree using validation or cross-validation.",
        ],
      },

      {
        id: "poly-interactions",
        title: "Interaction Terms",

        explanation: [
          "An interaction term represents the combined effect of multiple features.",
          "For example, x₁x₂ allows the effect associated with one feature to depend on the value of another.",
          "Polynomial feature generators can create both powers and interactions.",
          "Interactions can be useful even when very high individual powers are unnecessary.",
        ],

        mathematics: {
          title: "Two-Feature Quadratic Model",

          explanation:
            "A degree-two model with two features can include individual powers and a cross-feature interaction.",

          formula:
            "ŷ = β₀ + β₁x₁ + β₂x₂ + β₃x₁² + β₄x₁x₂ + β₅x₂²",
        },
      },

      {
        id: "poly-overfitting",
        title: "Why High-Degree Polynomial Models Overfit",

        explanation: [
          "Polynomial expansion increases the number of available features.",
          "Higher-degree features allow increasingly complicated fitted functions.",
          "With limited data, a sufficiently flexible polynomial can closely follow noise.",
          "The resulting model can have extremely low training error while performing poorly on unseen observations.",
          "Large polynomial powers can also produce numerical instability.",
        ],

        intuition: [
          "A useful curve follows the broad pattern of the data.",
          "An overfit curve twists unnecessarily to pass close to individual training points.",
        ],

        importantPoints: [
          "More polynomial features do not guarantee better generalization.",
          "Cross-validation is important when choosing degree.",
          "Regularization can control coefficient growth.",
        ],
      },

      {
        id: "poly-scaling",
        title: "Scaling and Numerical Stability",

        explanation: [
          "Polynomial powers can greatly magnify differences in numerical scale.",
          "For example, if x is large, x³ or x⁵ can become extremely large.",
          "This can produce poorly conditioned feature matrices and unstable optimization.",
          "Scaling can therefore become particularly important when polynomial expansion is combined with regularized or iterative linear estimators.",
          "Preprocessing should be learned from training data only.",
        ],
      },

      {
        id: "poly-extrapolation",
        title: "Interpolation vs Extrapolation",

        explanation: [
          "Polynomial models can fit observed ranges very well while behaving unpredictably outside those ranges.",
          "High-order polynomial terms grow rapidly as input magnitude increases.",
          "A curve that appears sensible inside the training range can explode outside it.",
          "Polynomial Regression should therefore be used cautiously for extrapolation.",
        ],

        importantPoints: [
          "Good interpolation does not imply safe extrapolation.",
          "Always inspect the domain in which predictions will be used.",
        ],
      },
    ],

    modelDeepDive: {
      modelFamily: "Linear Models / Basis Expansion",

      problemTypes: [
        "regression",
      ],

      depth: "expert",

      motivation: [
        "Ordinary linear features cannot directly represent many curved relationships.",
        "Polynomial basis expansion adds nonlinear representations while preserving a linear coefficient model.",
        "It provides an interpretable bridge between simple Linear Regression and more flexible nonlinear models.",
      ],

      intuition: [
        "Do not bend the linear estimator itself; transform the coordinate system by creating powers and interactions.",
        "The estimator then combines those transformed features linearly.",
        "Degree determines how flexible the resulting function can become.",
      ],

      mentalModel: [
        "Start with original features.",
        "Create powers and interactions.",
        "Treat those generated columns as ordinary input features.",
        "Fit a linear regression model.",
        "Transform future observations in exactly the same way before prediction.",
      ],

      trainingProcess: [
        {
          id: "poly-train-1",
          step: 1,
          title: "Choose Polynomial Degree",
          explanation:
            "Select a candidate maximum degree for polynomial expansion.",
          importantPoints: [
            "Degree controls model flexibility.",
            "It should ultimately be validated.",
          ],
        },

        {
          id: "poly-train-2",
          step: 2,
          title: "Generate Polynomial Features",
          explanation:
            "Create powers and interaction terms from the original features.",
        },

        {
          id: "poly-train-3",
          step: 3,
          title: "Optionally Scale",
          explanation:
            "Apply appropriate scaling when required by the downstream estimator or numerical behavior.",
        },

        {
          id: "poly-train-4",
          step: 4,
          title: "Fit Linear Coefficients",
          explanation:
            "Fit a regression estimator to the expanded design matrix.",
        },

        {
          id: "poly-train-5",
          step: 5,
          title: "Validate Complexity",
          explanation:
            "Compare candidate degrees using unseen validation data or cross-validation.",
        },
      ],

      predictionProcess: [
        {
          id: "poly-predict-1",
          step: 1,
          title: "Receive New Features",
          explanation:
            "Take a new observation in the original feature space.",
        },

        {
          id: "poly-predict-2",
          step: 2,
          title: "Apply Identical Expansion",
          explanation:
            "Generate the same polynomial columns created during training.",
        },

        {
          id: "poly-predict-3",
          step: 3,
          title: "Calculate Linear Combination",
          explanation:
            "Apply the learned coefficients to the transformed features.",
        },
      ],

      mathematics: [
        {
          title: "Polynomial Basis Model",
          explanation:
            "Polynomial Regression is linear in its coefficients even though the prediction is nonlinear in the original feature.",
          formula:
            "ŷ = β₀ + β₁x + β₂x² + ... + β_d x^d",
        },
      ],

      objectiveFunctions: [
        {
          name: "Mean Squared Error",
          purpose:
            "Measure squared prediction error for the regression model.",
          intuition: [
            "Large residuals receive a larger penalty because errors are squared.",
          ],
          formula:
            "MSE = (1/n) Σᵢ(yᵢ - ŷᵢ)²",
          optimizationGoal: "minimize",
        },
      ],

      assumptions: [
        {
          id: "poly-assumption-form",
          title: "Suitable Polynomial Representation",
          explanation:
            "The relationship should be representable reasonably within the chosen polynomial basis over the region of interest.",
          violationEffect:
            "A polynomial may still systematically miss the true structure.",
          remedies: [
            "Try alternative feature transformations.",
            "Consider splines or other nonlinear models.",
            "Inspect residual patterns.",
          ],
        },

        {
          id: "poly-assumption-regression",
          title: "Regression Error Assumptions",
          explanation:
            "Classical statistical inference inherits assumptions similar to Linear Regression regarding residual structure.",
          whyItMatters:
            "Violations affect interpretation and inference even when predictive performance remains usable.",
        },
      ],

      parameters: [
        {
          id: "poly-degree",
          name: "degree",
          displayName: "Polynomial Degree",
          category: "core",

          description:
            "Maximum polynomial degree generated by PolynomialFeatures.",

          intuition:
            "Controls how complex the transformed feature space can become.",

          defaultValue:
            "2 in PolynomialFeatures",

          acceptedValues:
            "Non-negative integer or supported degree range, depending on library version.",

          lowValueEffect: [
            "Fewer generated features.",
            "Simpler fitted curves.",
            "Lower variance.",
            "Greater underfitting risk.",
          ],

          highValueEffect: [
            "More polynomial and interaction features.",
            "More flexible curves.",
            "Rapidly increasing dimensionality.",
            "Higher overfitting and numerical-instability risk.",
          ],

          biasEffect:
            "Increasing degree usually reduces representational bias.",

          varianceEffect:
            "Increasing degree can substantially increase variance.",

          overfittingEffect:
            "Very high degree can fit noise.",

          underfittingEffect:
            "Very low degree may fail to represent genuine curvature.",

          computationalEffect:
            "Higher degree can dramatically increase generated feature count and training cost.",

          memoryEffect:
            "Higher degree can create a much larger transformed matrix.",

          whenToIncrease: [
            "Residuals show systematic curvature.",
            "Training and validation performance both indicate underfitting.",
          ],

          whenToDecrease: [
            "Large train-validation performance gap.",
            "Highly oscillatory fitted curve.",
            "Numerical instability.",
          ],

          whenToTune: [
            "Whenever Polynomial Regression is being considered as a serious predictive model.",
          ],

          tuningStrategy: [
            "Compare a small sequence of plausible degrees using cross-validation.",
            "Do not select degree using training error alone.",
            "Consider regularization for larger feature expansions.",
          ],

          recommendedValues: [
            "Begin with low degrees such as 2 or 3 unless domain knowledge justifies greater complexity.",
          ],

          commonMistakes: [
            "Assuming a larger degree is automatically better.",
            "Selecting degree using training performance.",
          ],

          examNotes: [
            "Degree controls maximum polynomial power.",
            "Higher degree increases model flexibility.",
          ],
        },

        {
          id: "poly-interaction-only",
          name: "interaction_only",
          displayName: "Interaction Only",
          category: "implementation",

          description:
            "Controls whether PolynomialFeatures excludes pure higher powers and generates only interaction products between distinct input features.",

          intuition:
            "Useful when combined feature interactions matter but powers such as x² are not desired.",

          defaultValue: "False",

          acceptedValues: "True or False",

          lowValueEffect: [
            "False permits both powers and interactions.",
          ],

          highValueEffect: [
            "True restricts expansion to interaction-style products.",
          ],

          computationalEffect:
            "Enabling it can reduce the number of generated features relative to full polynomial expansion.",

          whenToTune: [
            "When domain knowledge suggests interactions without meaningful self-powers.",
          ],
        },

        {
          id: "poly-include-bias",
          name: "include_bias",
          displayName: "Include Bias Column",
          category: "implementation",

          description:
            "Controls whether PolynomialFeatures generates a constant column.",

          intuition:
            "The constant column acts like an explicit degree-zero polynomial feature.",

          defaultValue: "True",

          acceptedValues: "True or False",

          commonMistakes: [
            "Confusing this generated constant feature with every estimator's own intercept behavior.",
          ],
        },
      ],

      dataRequirements: {
        scaling: {
          required: false,
          explanation:
            "Polynomial expansion itself does not mathematically require scaling, but generated powers can differ enormously in magnitude. Scaling is especially useful with regularization or iterative optimization.",
        },

        categoricalFeatures: {
          supportedDirectly: false,
          explanation:
            "Ordinary polynomial expansion is primarily intended for numerical feature representations.",
          recommendations: [
            "Encode categorical information appropriately.",
            "Do not blindly generate meaningless polynomial powers of arbitrary category codes.",
          ],
        },

        missingValues: {
          supportedDirectly: false,
          explanation:
            "Typical polynomial-regression pipelines require missing values to be handled before expansion and estimation.",
          recommendations: [
            "Impute using a leakage-safe pipeline.",
          ],
        },

        outliers: {
          sensitivity: "high",
          explanation:
            "Polynomial powers can amplify the influence of extreme feature values, while squared regression losses also emphasize large residuals.",
          recommendations: [
            "Inspect unusual observations carefully.",
            "Avoid automatically deleting legitimate extremes.",
          ],
        },

        imbalance: {
          sensitivity: "low",
          explanation:
            "Class imbalance is not a standard regression concept.",
        },

        dimensionalityConsiderations: [
          "Polynomial expansion can cause combinatorial growth in feature count.",
          "High original dimensionality plus high degree can become impractical.",
        ],
      },

      biasVariance: {
        bias: "depends",
        variance: "depends",

        explanation: [
          "Low-degree polynomial models can have high bias.",
          "High-degree polynomial models can have high variance.",
          "Degree therefore directly participates in the bias-variance tradeoff.",
        ],

        underfittingCauses: [
          "Degree too low.",
          "Missing useful interaction structure.",
        ],

        overfittingCauses: [
          "Degree too high.",
          "Small dataset with many generated features.",
          "No regularization when coefficients become unstable.",
        ],

        reduceUnderfitting: [
          "Increase degree carefully.",
          "Add meaningful interactions.",
        ],

        reduceOverfitting: [
          "Reduce degree.",
          "Use regularization.",
          "Collect more representative data.",
        ],
      },

      complexity: {
        training:
          "Depends strongly on the number of generated polynomial features and the downstream regression solver.",
        prediction:
          "Requires polynomial transformation followed by a linear combination.",
        memory:
          "Can grow rapidly because polynomial expansion creates additional columns.",
        scalabilityNotes: [
          "High degree with many original features can cause feature explosion.",
        ],
      },

      advantages: [
        "Captures curved relationships while retaining linear coefficient estimation.",
        "Easy conceptual extension of Linear Regression.",
        "Can model feature interactions.",
        "Often interpretable at low degree.",
      ],

      limitations: [
        "Feature count can grow rapidly.",
        "High-degree models can overfit strongly.",
        "Can be numerically unstable.",
        "Extrapolation can be dangerous.",
        "Polynomial structure may be inappropriate for complex real relationships.",
      ],

      whenToUse: [
        "The relationship appears smoothly curved.",
        "A simple interpretable nonlinear extension is desired.",
        "The number of original features is manageable.",
      ],

      whenNotToUse: [
        "Extremely high-dimensional feature spaces where expansion becomes impractical.",
        "Problems requiring reliable long-range extrapolation without strong domain justification.",
        "Relationships better represented by other model families.",
      ],

      evaluation: {
        problemType: "regression",

        recommendedMetrics: [
          {
            metric: "MAE",
            why:
              "Provides average absolute error in target units.",
          },
          {
            metric: "RMSE",
            why:
              "Penalizes larger residuals more strongly.",
          },
          {
            metric: "R²",
            why:
              "Summarizes explained variance relative to a mean baseline.",
          },
        ],

        validationStrategy: [
          "Compare polynomial degrees using cross-validation.",
          "Keep preprocessing inside a Pipeline.",
        ],

        diagnosticChecks: [
          "Inspect residuals.",
          "Compare training and validation error.",
          "Inspect the fitted curve where visualization is possible.",
          "Check extrapolation behavior.",
        ],
      },

      tuning: {
        strategy: [
          "Tune degree first.",
          "If expansion causes overfitting, evaluate regularization.",
          "Validate the entire preprocessing-and-model pipeline.",
        ],

        tuneFirst: [
          "degree",
        ],

        tuneLater: [
          "regularization strength in the downstream estimator",
        ],

        practicalWorkflow: [
          "Start with Linear Regression baseline.",
          "Try degree two.",
          "Compare cross-validation performance.",
          "Increase degree only when justified.",
          "Inspect train-validation gap.",
          "Add regularization if complexity becomes unstable.",
        ],
      },

      comparisons: [
        {
          model: "Linear Regression",
          relationship:
            "Polynomial Regression extends the feature representation used by a linear model.",

          similarities: [
            "Both remain linear in learned coefficients.",
            "Both can use squared-error objectives.",
          ],

          differences: [
            "Polynomial Regression uses powers and interactions.",
            "Polynomial Regression can represent curved relationships.",
          ],

          preferCurrentWhen: [
            "Curvature is genuine and validated.",
          ],

          preferOtherWhen: [
            "The relationship is adequately linear.",
            "Interpretability and simplicity are priorities.",
          ],

          examTip:
            "Polynomial Regression can be nonlinear in input x while still being linear in coefficients.",
        },

        {
          model: "Tree-Based Regression",
          differences: [
            "Trees learn piecewise rules rather than polynomial basis functions.",
            "Trees generally require less explicit scaling.",
          ],

          preferCurrentWhen: [
            "Smooth low-dimensional curvature is expected.",
          ],

          preferOtherWhen: [
            "Complex nonlinear interactions are difficult to specify manually.",
          ],
        },
      ],

      failureModes: [
        {
          id: "poly-failure-underfit",
          symptom:
            "Training and validation errors are both poor and residuals show curved structure.",
          likelyCauses: [
            "Polynomial degree too low.",
          ],
          fixes: [
            "Increase degree carefully.",
            "Add meaningful interaction terms.",
          ],
        },

        {
          id: "poly-failure-overfit",
          symptom:
            "Training performance is excellent but validation performance is poor.",
          likelyCauses: [
            "Polynomial degree too high.",
            "Too many generated features relative to data.",
          ],
          fixes: [
            "Reduce degree.",
            "Apply regularization.",
            "Use cross-validation.",
          ],
        },

        {
          id: "poly-failure-extrapolation",
          symptom:
            "Predictions become extreme outside the observed feature range.",
          likelyCauses: [
            "High-order polynomial terms dominate outside the training range.",
          ],
          fixes: [
            "Avoid unsupported extrapolation.",
            "Use domain constraints or a more suitable model.",
          ],
        },
      ],

      realWorldApplications: [
        {
          title: "Calibration Curves",
          domain: "Engineering",
          problem:
            "Represent moderate smooth curvature between an input measurement and response.",
          whyModelFits:
            "Low-degree polynomial terms can capture smooth departures from linearity.",
          limitations: [
            "Extrapolation beyond calibration range can be unsafe.",
          ],
        },

        {
          title: "Growth Trend Approximation",
          domain: "Analytics",
          problem:
            "Approximate a curved relationship over a bounded observed range.",
          whyModelFits:
            "Polynomial terms provide a simple interpretable nonlinear approximation.",
        },
      ],

      interviewQuestions: [
        {
          question:
            "Is Polynomial Regression a linear or nonlinear model?",
          shortAnswer:
            "It is nonlinear with respect to the original input but linear in its learned coefficients.",
        },

        {
          question:
            "What happens when polynomial degree becomes very high?",
          shortAnswer:
            "Model capacity and feature count increase, often increasing variance, overfitting and numerical instability.",
        },

        {
          question:
            "Why can Polynomial Regression extrapolate badly?",
          shortAnswer:
            "High-order powers can grow rapidly outside the observed input range.",
        },
      ],

      examNotes: [
        {
          title: "Polynomial Regression",
          points: [
            "Extends Linear Regression using powers and interaction terms.",
            "Degree controls complexity.",
            "Higher degree can reduce bias but increase variance.",
            "Still linear in coefficients.",
          ],
          formula:
            "ŷ = β₀ + β₁x + β₂x² + ... + β_d x^d",
          commonQuestion:
            "Explain Polynomial Regression and the effect of polynomial degree.",
        },
      ],
    },

    codeExamples: [
      {
        id: "poly-pipeline",
        title: "Polynomial Regression with Pipeline",

        description:
          "Create polynomial features and fit a linear regression model without manually transforming training and test data separately.",

        language: "python",

        code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

model = Pipeline([
    ("poly", PolynomialFeatures(
        degree=2,
        include_bias=False
    )),
    ("regression", LinearRegression())
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)`,

        explanation: [
          "PolynomialFeatures generates powers and interactions.",
          "LinearRegression learns coefficients for those generated features.",
          "Pipeline guarantees the same transformation is used during prediction.",
        ],

        commonMistakes: [
          "Creating different polynomial transformations for training and test data.",
          "Choosing degree from test-set performance.",
          "Using an unnecessarily large degree.",
        ],
      },

      {
        id: "poly-degree-cv",
        title: "Compare Polynomial Degrees",

        description:
          "Evaluate several polynomial degrees using cross-validation.",

        language: "python",

        code: `from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

for degree in [1, 2, 3, 4, 5]:
    model = Pipeline([
        ("poly", PolynomialFeatures(
            degree=degree,
            include_bias=False
        )),
        ("regression", LinearRegression())
    ])

    scores = cross_val_score(
        model,
        X,
        y,
        cv=5,
        scoring="neg_mean_squared_error"
    )

    mse = -scores.mean()

    print(
        f"Degree {degree}: "
        f"CV MSE = {mse:.3f}"
    )`,

        explanation: [
          "Degree is treated as a model-complexity choice.",
          "Cross-validation estimates generalization more reliably than training error.",
        ],
      },
    ],

    practice: [
      {
        id: "poly-practice-1",
        title: "Why Is It Still Linear?",
        type: "concept",
        difficulty: "medium",
        question:
          "Explain why y = β₀ + β₁x + β₂x² is called a linear model even though the graph can be curved.",
        solution:
          "The model is linear in the unknown coefficients β₀, β₁ and β₂. The input is transformed nonlinearly, but the coefficients enter as a linear combination.",
      },

      {
        id: "poly-practice-2",
        title: "Diagnose Polynomial Overfitting",
        type: "analysis",
        difficulty: "medium",
        question:
          "Degree 12 produces nearly zero training error but much worse validation error than degree 3. What is the likely problem?",
        solution:
          "The degree-12 model is likely overfitting. Prefer the simpler degree if validation performance is better.",
      },

      {
        id: "poly-practice-3",
        title: "Interaction Feature",
        type: "concept",
        difficulty: "medium",
        question:
          "What does the generated feature x₁x₂ represent?",
        solution:
          "It is an interaction term that allows the prediction to depend on the combined values of x₁ and x₂.",
      },
    ],

    commonMistakes: [
      {
        id: "poly-mistake-nonlinear",
        title: "Calling It Nonlinear in Coefficients",
        description:
          "Assuming that the presence of x² makes the coefficient model nonlinear.",
        correction:
          "Polynomial Regression remains linear in its learned coefficients.",
      },

      {
        id: "poly-mistake-degree",
        title: "Using Very High Degree Automatically",
        description:
          "Assuming more polynomial terms always improve the model.",
        correction:
          "Choose degree using validation and monitor overfitting.",
      },

      {
        id: "poly-mistake-test",
        title: "Selecting Degree on the Test Set",
        description:
          "Trying many degrees and selecting the one with best test performance.",
        correction:
          "Use validation/cross-validation for model selection and preserve the test set for final evaluation.",
      },
    ],

    keyTakeaways: [
      "Polynomial Regression creates powers and interactions from original features.",
      "It can model curved relationships.",
      "It remains linear in its coefficients.",
      "Degree controls model flexibility.",
      "High degree can strongly increase variance.",
      "Polynomial expansion can cause feature explosion.",
      "Scaling and regularization become increasingly important as complexity grows.",
      "Choose degree using validation rather than training error.",
      "Polynomial extrapolation can be dangerous.",
    ],
  },

  // =======================================================
  // REGULARIZATION + RIDGE + LASSO + ELASTIC NET
  // =======================================================

  regularization: {
    contentDepth: "expert",

    overview:
      "Regularization controls model complexity by adding a penalty for coefficient magnitude to the training objective. It is especially important when models contain many features, correlated predictors, noisy data or flexible feature transformations. Ridge uses an L2 penalty, Lasso uses an L1 penalty, and Elastic Net combines both. Understanding these methods requires understanding coefficient shrinkage, scaling, the bias-variance tradeoff and the meaning of regularization strength.",

    objectives: [
      "Understand why regularization is needed.",
      "Understand coefficient shrinkage.",
      "Understand the bias-variance tradeoff created by regularization.",
      "Understand L1 regularization.",
      "Understand L2 regularization.",
      "Understand Ridge Regression.",
      "Understand Lasso Regression.",
      "Understand Elastic Net.",
      "Compare Ridge, Lasso and Elastic Net.",
      "Understand why Lasso can create sparse solutions.",
      "Understand why Ridge usually shrinks rather than removes coefficients.",
      "Understand correlated-feature behavior.",
      "Understand why scaling is important before regularization.",
      "Understand alpha.",
      "Understand l1_ratio.",
      "Use cross-validation to choose regularization strength.",
      "Diagnose over-regularization and under-regularization.",
    ],

    sections: [
      {
        id: "reg-why",
        title: "Why Regularization Exists",

        explanation: [
          "A model can fit training data extremely well while failing to generalize.",
          "One reason is that the model may use large or unstable coefficients to explain small details and noise.",
          "Regularization modifies the optimization objective so that fitting error is not the only consideration.",
          "The model is also penalized for coefficient complexity.",
          "This creates pressure toward simpler parameter values.",
        ],

        intuition: [
          "Imagine telling the model: fit the data well, but do not use unnecessarily extreme coefficients to do it.",
          "Regularization introduces a price for coefficient complexity.",
        ],

        importantPoints: [
          "Regularization intentionally adds bias.",
          "The goal is often to reduce variance by more than the added bias hurts performance.",
          "Regularization strength must be selected carefully.",
        ],
      },

      {
        id: "reg-objective",
        title: "Loss Plus Penalty",

        explanation: [
          "Without regularization, training may minimize only prediction loss.",
          "With regularization, the objective combines prediction loss with a coefficient penalty.",
          "The exact penalty determines the behavior of the regularized model.",
        ],

        mathematics: {
          title: "General Regularized Objective",

          explanation:
            "Regularized training balances data fit and parameter complexity.",

          formula:
            "Objective = Prediction Loss + λ × Penalty",

          variables: [
            {
              symbol: "λ",
              meaning: "regularization strength",
            },
          ],
        },

        importantPoints: [
          "Small regularization strength emphasizes data fit.",
          "Large regularization strength emphasizes simpler coefficients.",
        ],
      },

      {
        id: "reg-l2",
        title: "L2 Regularization",

        explanation: [
          "L2 regularization penalizes squared coefficient magnitudes.",
          "Large coefficients receive increasingly strong penalties.",
          "This usually shrinks coefficients toward zero without forcing most of them to become exactly zero.",
          "Ridge Regression is the classic L2-regularized linear regression model.",
        ],

        mathematics: {
          title: "L2 Penalty",

          explanation:
            "The penalty is based on the sum of squared coefficients.",

          formula:
            "L2 = Σⱼ βⱼ²",
        },

        intuition: [
          "L2 asks all coefficients to become more modest.",
          "It usually spreads predictive responsibility across correlated features rather than selecting only one.",
        ],
      },

      {
        id: "reg-l1",
        title: "L1 Regularization",

        explanation: [
          "L1 regularization penalizes absolute coefficient magnitudes.",
          "Its geometry allows some optimized coefficients to become exactly zero.",
          "This creates sparse models.",
          "Lasso Regression is the classic L1-regularized linear regression method.",
        ],

        mathematics: {
          title: "L1 Penalty",
          explanation:
            "The penalty is based on the sum of absolute coefficient values.",
          formula:
            "L1 = Σⱼ |βⱼ|",
        },

        intuition: [
          "L1 can decide that some features are unnecessary and remove their linear contribution entirely by assigning coefficient zero.",
        ],

        importantPoints: [
          "Lasso can perform embedded feature selection.",
          "Zero coefficient does not automatically prove that a feature is scientifically irrelevant.",
        ],
      },

      {
        id: "reg-ridge",
        title: "Ridge Regression",

        explanation: [
          "Ridge Regression combines squared-error regression with an L2 coefficient penalty.",
          "As regularization strength increases, coefficients are pushed toward smaller magnitudes.",
          "Ridge is particularly useful when predictors are correlated or ordinary least-squares coefficients are unstable.",
          "Unlike Lasso, Ridge usually keeps all features in the model with nonzero coefficients.",
        ],

        mathematics: {
          title: "Ridge Objective",
          explanation:
            "Ridge minimizes prediction error together with an L2 penalty.",
          formula:
            "min ||y - Xβ||²₂ + α||β||²₂",
        },
      },

      {
        id: "reg-lasso",
        title: "Lasso Regression",

        explanation: [
          "Lasso adds an L1 penalty to the regression objective.",
          "Increasing the penalty can shrink some coefficients all the way to exactly zero.",
          "This produces a sparse coefficient vector and can make the model easier to interpret.",
          "However, when predictors are strongly correlated, Lasso may select one and suppress others in ways that can be unstable across samples.",
        ],

        mathematics: {
          title: "Lasso Objective",
          explanation:
            "Lasso combines squared prediction error with an L1 penalty.",
          formula:
            "min (1 / (2n)) ||y - Xβ||²₂ + α||β||₁",
        },
      },

      {
        id: "reg-elastic-net",
        title: "Elastic Net",

        explanation: [
          "Elastic Net combines L1 and L2 regularization.",
          "It can create sparse solutions while retaining some of Ridge's stabilizing behavior.",
          "It is especially useful when many predictors are correlated and pure Lasso behaves too aggressively.",
          "Its behavior depends on both overall regularization strength and the L1/L2 mixture.",
        ],

        intuition: [
          "Ridge says shrink coefficients.",
          "Lasso says shrink and possibly eliminate coefficients.",
          "Elastic Net allows both behaviors to contribute.",
        ],
      },

      {
        id: "reg-scaling",
        title: "Why Scaling Matters Before Regularization",

        explanation: [
          "Regularization penalties operate directly on coefficient magnitudes.",
          "Coefficient magnitude depends partly on feature scale.",
          "If one feature is measured in tiny units and another in huge units, their coefficients are not directly comparable.",
          "Without appropriate scaling, the penalty can treat features unfairly.",
          "Standardization is therefore commonly used before Ridge, Lasso and Elastic Net.",
        ],

        importantPoints: [
          "Fit the scaler on training data only.",
          "Pipeline is the safest common implementation.",
        ],
      },

      {
        id: "reg-bias-variance",
        title: "Regularization and Bias-Variance",

        explanation: [
          "Weak regularization allows the model to fit training data more freely.",
          "This can reduce bias but increase variance.",
          "Strong regularization restricts coefficient magnitude.",
          "This can reduce variance but increase bias.",
          "The goal is not maximum shrinkage. The goal is the amount of shrinkage that generalizes best.",
        ],
      },
    ],

    modelDeepDive: {
      modelFamily:
        "Regularized Linear Models — Ridge, Lasso and Elastic Net",

      problemTypes: [
        "regression",
        "regularization",
        "feature selection",
      ],

      depth: "expert",

      motivation: [
        "Ordinary least squares can have high variance when predictors are numerous or strongly correlated.",
        "Flexible models can fit noise using unstable coefficients.",
        "Regularization trades some training flexibility for improved generalization.",
        "Different penalties produce different coefficient behavior.",
      ],

      intuition: [
        "Ridge compresses coefficients.",
        "Lasso compresses coefficients and can eliminate some.",
        "Elastic Net blends the two behaviors.",
      ],

      mentalModel: [
        "Start with prediction loss.",
        "Add a price for coefficient magnitude.",
        "Increase the price to demand simpler coefficients.",
        "Use validation to decide how much simplicity is useful.",
      ],

      trainingProcess: [
        {
          id: "reg-train-1",
          step: 1,
          title: "Prepare Numerical Features",
          explanation:
            "Handle missing values and categorical variables appropriately.",
        },

        {
          id: "reg-train-2",
          step: 2,
          title: "Scale Features",
          explanation:
            "Place numerical features on comparable scales before applying coefficient penalties.",
        },

        {
          id: "reg-train-3",
          step: 3,
          title: "Choose Penalty Family",
          explanation:
            "Use Ridge, Lasso or Elastic Net according to desired coefficient behavior.",
        },

        {
          id: "reg-train-4",
          step: 4,
          title: "Optimize Penalized Objective",
          explanation:
            "Fit coefficients while balancing prediction error and penalty.",
        },

        {
          id: "reg-train-5",
          step: 5,
          title: "Validate Regularization Strength",
          explanation:
            "Use cross-validation to select regularization strength.",
        },
      ],

      predictionProcess: [
        {
          id: "reg-predict-1",
          step: 1,
          title: "Apply Training Preprocessing",
          explanation:
            "Transform new observations using the fitted preprocessing pipeline.",
        },

        {
          id: "reg-predict-2",
          step: 2,
          title: "Linear Prediction",
          explanation:
            "Multiply transformed features by learned regularized coefficients and add the intercept.",
        },
      ],

      mathematics: [
        {
          title: "Ridge",
          explanation:
            "Ridge uses the squared L2 norm of the coefficient vector.",
          formula:
            "||y-Xβ||²₂ + α||β||²₂",
        },

        {
          title: "Lasso",
          explanation:
            "Lasso uses the L1 norm of the coefficient vector.",
          formula:
            "(1/(2n))||y-Xβ||²₂ + α||β||₁",
        },

        {
          title: "Elastic Net",
          explanation:
            "Elastic Net combines L1 and L2 coefficient penalties.",
          formula:
            "(1/(2n))||y-Xβ||²₂ + α·l1_ratio·||β||₁ + 0.5·α·(1-l1_ratio)·||β||²₂",
        },
      ],

      objectiveFunctions: [
        {
          name: "Ridge Objective",
          purpose:
            "Balance squared prediction error with L2 coefficient shrinkage.",
          intuition: [
            "Fit the data while discouraging large coefficients.",
          ],
          formula:
            "||y-Xβ||²₂ + α||β||²₂",
          optimizationGoal: "minimize",
        },

        {
          name: "Lasso Objective",
          purpose:
            "Balance squared prediction error with an L1 sparsity-inducing penalty.",
          intuition: [
            "Fit the data while encouraging a sparse coefficient vector.",
          ],
          formula:
            "(1/(2n))||y-Xβ||²₂ + α||β||₁",
          optimizationGoal: "minimize",
        },

        {
          name: "Elastic Net Objective",
          purpose:
            "Combine L1 sparsity and L2 stabilization.",
          intuition: [
            "Use both coefficient elimination pressure and coefficient shrinkage.",
          ],
          optimizationGoal: "minimize",
        },
      ],

      assumptions: [
        {
          id: "reg-assumption-scaling",
          title: "Comparable Feature Scales",
          explanation:
            "Coefficient penalties are most meaningful when numerical feature scales are appropriately controlled.",
          whyItMatters:
            "Different scales can cause the same coefficient magnitude to represent very different feature effects.",
          remedies: [
            "Use StandardScaler or another justified transformation inside a Pipeline.",
          ],
        },

        {
          id: "reg-assumption-linearity",
          title: "Useful Linear Representation",
          explanation:
            "Regularization controls coefficients but does not automatically create nonlinear relationships.",
          violationEffect:
            "Strong nonlinear structure may remain underfit.",
          remedies: [
            "Engineer nonlinear features.",
            "Use PolynomialFeatures.",
            "Consider nonlinear models.",
          ],
        },
      ],

      parameters: [
        // ---------------------------------------------------
        // RIDGE PARAMETERS
        // ---------------------------------------------------

        {
          id: "ridge-alpha",
          name: "alpha",
          displayName: "Ridge alpha",
          category: "regularization",

          description:
            "Controls L2 regularization strength in Ridge Regression.",

          intuition:
            "Higher alpha charges a larger price for large coefficient magnitudes.",

          defaultValue:
            "1.0 for sklearn Ridge",

          acceptedValues:
            "Non-negative float; some APIs also support per-target arrays.",

          mathematicalMeaning:
            "Multiplier on the L2 coefficient penalty.",

          lowValueEffect: [
            "Closer to ordinary least-squares behavior.",
            "Larger coefficient freedom.",
            "Potentially lower bias.",
            "Potentially higher variance.",
          ],

          highValueEffect: [
            "Stronger coefficient shrinkage.",
            "Usually higher bias.",
            "Usually lower variance.",
            "Extreme values can underfit.",
          ],

          biasEffect:
            "Generally increases as alpha becomes stronger.",

          varianceEffect:
            "Generally decreases as alpha becomes stronger.",

          overfittingEffect:
            "Increasing alpha can reduce overfitting.",

          underfittingEffect:
            "Excessively large alpha can cause underfitting.",

          whenToIncrease: [
            "Training performance is much stronger than validation performance.",
            "Coefficients are unstable or excessively large.",
          ],

          whenToDecrease: [
            "Training and validation performance both indicate underfitting.",
          ],

          whenToTune: [
            "Regularization strength should normally be selected using validation or cross-validation.",
          ],

          tuningStrategy: [
            "Search alpha over a logarithmic range.",
            "Scale numerical features first.",
          ],

          recommendedValues: [
            "Evaluate values across several orders of magnitude rather than only tiny linear increments.",
          ],

          commonMistakes: [
            "Assuming alpha has the same meaning as LogisticRegression C.",
            "Tuning alpha before scaling features.",
          ],
        },

        {
          id: "ridge-fit-intercept",
          name: "fit_intercept",
          displayName: "Ridge fit_intercept",
          category: "implementation",

          description:
            "Controls whether Ridge estimates an intercept.",

          intuition:
            "Allows the fitted hyperplane to shift away from the origin.",

          defaultValue:
            "True for sklearn Ridge",

          acceptedValues:
            "True or False",
        },

        {
          id: "ridge-solver",
          name: "solver",
          displayName: "Ridge solver",
          category: "optimization",

          description:
            "Selects the numerical algorithm used to optimize the Ridge objective.",

          intuition:
            "Different solvers have different suitability for dense, sparse and large datasets.",

          defaultValue:
            "\"auto\" for sklearn Ridge",

          acceptedValues:
            "Supported Ridge solver names such as auto, svd, cholesky, lsqr, sparse_cg, sag, saga or lbfgs depending on library version and configuration.",

          computationalEffect:
            "Solver choice can strongly affect training speed and supported data representations.",

          commonMistakes: [
            "Treating solver as a model-complexity parameter.",
          ],
        },

        {
          id: "ridge-max-iter",
          name: "max_iter",
          displayName: "Ridge max_iter",
          category: "optimization",

          description:
            "Maximum iteration count for Ridge solvers that use iterative optimization.",

          intuition:
            "Provides an upper bound on how long applicable iterative solvers may continue.",

          defaultValue:
            "Solver-dependent / None in sklearn Ridge",

          acceptedValues:
            "Positive integer or None where supported.",

          whenToIncrease: [
            "The selected iterative solver reports failure to converge.",
          ],

          whenNotToTune: [
            "Do not increase it simply to improve model capacity; it is an optimization control.",
          ],
        },

        {
          id: "ridge-tol",
          name: "tol",
          displayName: "Ridge tolerance",
          category: "optimization",

          description:
            "Controls convergence tolerance for Ridge solvers, with exact stopping interpretation depending on the solver.",

          intuition:
            "Smaller tolerance generally requests a stricter convergence condition.",

          defaultValue:
            "1e-4 in current sklearn Ridge",

          computationalEffect:
            "Stricter tolerance can require more optimization work.",
        },

        // ---------------------------------------------------
        // LASSO PARAMETERS
        // ---------------------------------------------------

        {
          id: "lasso-alpha",
          name: "alpha",
          displayName: "Lasso alpha",
          category: "regularization",

          description:
            "Controls L1 regularization strength in Lasso Regression.",

          intuition:
            "Higher alpha creates stronger pressure toward smaller and exactly-zero coefficients.",

          defaultValue:
            "1.0 for sklearn Lasso",

          acceptedValues:
            "Non-negative float.",

          mathematicalMeaning:
            "Multiplier on the L1 coefficient penalty.",

          lowValueEffect: [
            "Weaker shrinkage.",
            "More features tend to retain nonzero coefficients.",
            "Behavior moves toward unregularized least squares.",
          ],

          highValueEffect: [
            "Stronger shrinkage.",
            "More coefficients can become zero.",
            "Model becomes sparser.",
            "Extreme values can underfit.",
          ],

          biasEffect:
            "Usually increases with stronger regularization.",

          varianceEffect:
            "Usually decreases with stronger regularization.",

          overfittingEffect:
            "Can reduce overfitting.",

          underfittingEffect:
            "Very strong L1 regularization can remove useful predictors.",

          whenToIncrease: [
            "Model is overfitting.",
            "A sparser representation is desirable.",
          ],

          whenToDecrease: [
            "Too many useful coefficients are being eliminated.",
            "Model strongly underfits.",
          ],

          tuningStrategy: [
            "Use cross-validation.",
            "Search a logarithmic alpha range.",
            "Inspect both validation performance and number of nonzero coefficients.",
          ],

          commonMistakes: [
            "Interpreting every zero coefficient as proof that the feature has no real-world importance.",
          ],
        },

        {
          id: "lasso-max-iter",
          name: "max_iter",
          displayName: "Lasso max_iter",
          category: "optimization",

          description:
            "Maximum number of coordinate-descent iterations.",

          intuition:
            "Provides more optimization steps when convergence is difficult.",

          defaultValue:
            "1000 for sklearn Lasso",

          acceptedValues:
            "Positive integer.",

          whenToIncrease: [
            "A convergence warning remains after appropriate scaling and reasonable settings.",
          ],
        },

        {
          id: "lasso-tol",
          name: "tol",
          displayName: "Lasso tolerance",
          category: "optimization",

          description:
            "Tolerance involved in determining convergence of the coordinate-descent optimization.",

          intuition:
            "Smaller values generally demand stricter convergence.",

          defaultValue:
            "1e-4 for sklearn Lasso",

          computationalEffect:
            "Stricter convergence can require more iterations.",
        },

        {
          id: "lasso-selection",
          name: "selection",
          displayName: "Lasso coordinate selection",
          category: "optimization",

          description:
            "Controls how coordinates are selected during coordinate-descent updates.",

          intuition:
            "Coordinates can be updated cyclically or selected randomly.",

          defaultValue:
            "\"cyclic\" for sklearn Lasso",

          acceptedValues:
            "\"cyclic\" or \"random\".",
        },

        // ---------------------------------------------------
        // ELASTIC NET PARAMETERS
        // ---------------------------------------------------

        {
          id: "elastic-alpha",
          name: "alpha",
          displayName: "Elastic Net alpha",
          category: "regularization",

          description:
            "Controls overall regularization strength in Elastic Net.",

          intuition:
            "Controls how strongly the combined L1/L2 penalty influences the solution.",

          defaultValue:
            "1.0 for sklearn ElasticNet",

          acceptedValues:
            "Non-negative float.",

          lowValueEffect: [
            "Weak total regularization.",
          ],

          highValueEffect: [
            "Strong total regularization.",
            "Greater shrinkage and possible underfitting.",
          ],

          whenToTune: [
            "Normally tune jointly with l1_ratio.",
          ],
        },

        {
          id: "elastic-l1-ratio",
          name: "l1_ratio",
          displayName: "Elastic Net L1 ratio",
          category: "regularization",

          description:
            "Controls the balance between L1 and L2 penalties in Elastic Net.",

          intuition:
            "Values nearer one behave more like Lasso; values nearer zero emphasize Ridge-like L2 behavior.",

          defaultValue:
            "0.5 for sklearn ElasticNet",

          acceptedValues:
            "Float from 0 to 1.",

          mathematicalMeaning:
            "Controls the relative L1 contribution within the combined Elastic Net penalty.",

          lowValueEffect: [
            "More L2-like behavior.",
            "Less aggressive sparsity.",
          ],

          highValueEffect: [
            "More L1-like behavior.",
            "Greater sparsity pressure.",
          ],

          whenToIncrease: [
            "A sparser model is desirable.",
          ],

          whenToDecrease: [
            "Correlated predictors should be retained more collectively.",
            "Pure L1-style selection is unstable.",
          ],

          tuningStrategy: [
            "Tune together with alpha.",
            "Evaluate predictive performance and coefficient stability.",
          ],

          interactions: [
            {
              parameter: "alpha",
              explanation:
                "alpha controls total penalty strength while l1_ratio controls how that penalty is divided between L1 and L2 behavior.",
            },
          ],
        },

        {
  id: "elastic-max-iter",
  name: "max_iter",
  displayName: "Elastic Net max_iter",
  category: "optimization",

  description:
    "Maximum coordinate-descent iterations for Elastic Net.",

  intuition:
    "Controls the maximum amount of optimization work allowed before the algorithm stops if it has not converged.",

  defaultValue:
    "1000 for sklearn ElasticNet",
},

        {
  id: "elastic-tol",
  name: "tol",
  displayName: "Elastic Net tolerance",
  category: "optimization",

  description:
    "Convergence tolerance used during Elastic Net optimization.",

  intuition:
    "Controls how strict the convergence requirement is; a smaller tolerance generally asks the optimizer to converge more precisely.",

  defaultValue:
    "1e-4 for sklearn ElasticNet",
},

        {
  id: "elastic-selection",
  name: "selection",
  displayName: "Elastic Net coordinate selection",
  category: "optimization",

  description:
    "Controls how coefficients are selected for updating during Elastic Net coordinate-descent optimization.",

  intuition:
    "With cyclic selection, coefficients are updated in a fixed repeated order. With random selection, a coefficient is selected randomly for each update, which can sometimes improve convergence behavior.",

  defaultValue:
    "\"cyclic\" for sklearn ElasticNet",

  acceptedValues:
    "\"cyclic\" or \"random\".",
},
      ],

      dataRequirements: {
        scaling: {
          required: true,
          explanation:
            "Regularization directly penalizes coefficient magnitudes, so numerical features should generally be placed on comparable scales.",
        },

        categoricalFeatures: {
          supportedDirectly: false,
          explanation:
            "Ridge, Lasso and Elastic Net operate on numerical design matrices.",
          recommendations: [
            "Encode categorical features appropriately.",
            "Use ColumnTransformer and Pipeline for mixed data.",
          ],
        },

        missingValues: {
          supportedDirectly: false,
          explanation:
            "Typical sklearn linear estimators require missing-value handling before fitting.",
          recommendations: [
            "Use an imputer inside a Pipeline.",
          ],
        },

        outliers: {
          sensitivity: "high",
          explanation:
            "Squared regression error remains sensitive to large residuals even when coefficient regularization is added.",
        },

        imbalance: {
          sensitivity: "low",
          explanation:
            "Class imbalance is not the standard concern for regression.",
        },

        dimensionalityConsiderations: [
          "Regularization becomes especially valuable as feature count grows.",
          "Lasso can create sparse representations.",
          "Ridge can stabilize solutions when predictors are correlated.",
        ],
      },

      biasVariance: {
        bias: "depends",
        variance: "depends",

        explanation: [
          "Increasing regularization usually increases bias.",
          "Increasing regularization usually reduces variance.",
          "The useful strength is the one that minimizes generalization error rather than training error.",
        ],

        underfittingCauses: [
          "Regularization too strong.",
          "Too many useful coefficients suppressed.",
        ],

        overfittingCauses: [
          "Regularization too weak.",
          "Many noisy features.",
          "High-dimensional flexible representation.",
        ],

        reduceUnderfitting: [
          "Decrease regularization strength.",
        ],

        reduceOverfitting: [
          "Increase regularization strength.",
          "Use cross-validation.",
        ],
      },

      complexity: {
        training:
          "Depends on estimator, number of samples, number of features and optimization solver.",
        prediction:
          "Linear in the number of retained input features for ordinary dense prediction.",
        memory:
          "Generally modest compared with large nonlinear ensembles, although very high-dimensional design matrices can still be expensive.",
      },

      advantages: [
        "Controls overfitting.",
        "Can stabilize coefficients.",
        "Works naturally with linear models.",
        "Ridge handles correlated predictors well.",
        "Lasso can produce sparse models.",
        "Elastic Net combines L1 and L2 strengths.",
      ],

      limitations: [
        "Requires thoughtful scaling.",
        "Adds hyperparameters.",
        "Too much regularization underfits.",
        "Lasso selection can be unstable with strongly correlated predictors.",
        "Regularization does not automatically solve nonlinear relationships.",
      ],

      whenToUse: [
        "Linear models overfit.",
        "Many predictors are present.",
        "Predictors are correlated.",
        "Stable coefficients are desired.",
        "Sparse feature selection is useful.",
      ],

      whenNotToUse: [
        "The fundamental relationship cannot be represented adequately by the available linear features.",
        "A different model family clearly matches the data-generating structure better.",
      ],

      evaluation: {
        problemType: "regression",

        recommendedMetrics: [
          {
            metric: "MAE",
            why:
              "Easy to interpret in target units.",
          },
          {
            metric: "RMSE",
            why:
              "Sensitive to large prediction errors.",
          },
          {
            metric: "R²",
            why:
              "Useful supplementary goodness-of-fit measure.",
          },
        ],

        validationStrategy: [
          "Tune regularization using cross-validation.",
          "Keep scaling inside the validation pipeline.",
        ],

        diagnosticChecks: [
          "Compare train and validation error.",
          "Inspect coefficient magnitudes.",
          "For Lasso, inspect number of zero coefficients.",
          "Check convergence warnings.",
        ],
      },

      tuning: {
        strategy: [
          "Standardize numerical features.",
          "Establish an unregularized or weakly regularized baseline.",
          "Search regularization strength logarithmically.",
          "For Elastic Net, tune alpha and l1_ratio together.",
        ],

        tuneFirst: [
          "alpha",
        ],

        tuneLater: [
          "l1_ratio for Elastic Net",
          "solver-specific optimization settings only when necessary",
        ],

        parameterInteractions: [
          "Elastic Net alpha controls overall penalty strength.",
          "Elastic Net l1_ratio controls L1 versus L2 composition.",
        ],

        practicalWorkflow: [
          "Create leakage-safe preprocessing pipeline.",
          "Fit Ridge baseline.",
          "Cross-validate alpha.",
          "Try Lasso if sparsity is useful.",
          "Try Elastic Net when correlated predictors and sparsity are both important.",
          "Compare generalization performance and coefficient stability.",
        ],
      },

      comparisons: [
        {
          model: "Ridge",
          relationship:
            "L2-regularized linear regression.",
          differences: [
            "Shrinks coefficients but usually does not make them exactly zero.",
          ],
          preferCurrentWhen: [
            "Correlated predictors should remain represented.",
            "Stable coefficient shrinkage is desired.",
          ],
        },

        {
          model: "Lasso",
          relationship:
            "L1-regularized linear regression.",
          differences: [
            "Can create exact zero coefficients.",
            "Produces sparse models.",
          ],
          preferCurrentWhen: [
            "Embedded feature selection is desirable.",
          ],
        },

        {
          model: "Elastic Net",
          relationship:
            "Combines L1 and L2 regularization.",
          differences: [
            "Provides both sparsity and L2-style stabilization.",
          ],
          preferCurrentWhen: [
            "Predictors are correlated and some sparsity is desirable.",
          ],
        },
      ],

      failureModes: [
        {
          id: "reg-failure-weak",
          symptom:
            "Large train-validation gap remains.",
          likelyCauses: [
            "Regularization is too weak.",
          ],
          fixes: [
            "Increase regularization strength.",
            "Validate using cross-validation.",
          ],
        },

        {
          id: "reg-failure-strong",
          symptom:
            "Training and validation performance are both poor.",
          likelyCauses: [
            "Regularization is too strong.",
          ],
          fixes: [
            "Reduce regularization strength.",
          ],
        },

        {
          id: "reg-failure-unscaled",
          symptom:
            "Coefficient shrinkage appears dominated by feature units.",
          likelyCauses: [
            "Features were not appropriately scaled.",
          ],
          fixes: [
            "Standardize numerical features inside a Pipeline.",
          ],
        },
      ],

      realWorldApplications: [
        {
          title: "High-Dimensional Regression",
          domain: "Predictive Analytics",
          problem:
            "Build regression models when many candidate predictors are available.",
          whyModelFits:
            "Regularization controls coefficient complexity and can improve generalization.",
        },

        {
          title: "Correlated Predictors",
          domain: "Scientific Modeling",
          problem:
            "Estimate a stable predictive relationship when measurements are strongly correlated.",
          whyModelFits:
            "Ridge or Elastic Net can stabilize coefficient estimates.",
        },
      ],

      interviewQuestions: [
        {
          question:
            "What is the difference between L1 and L2 regularization?",
          shortAnswer:
            "L1 penalizes absolute coefficient magnitudes and can create exact zeros; L2 penalizes squared magnitudes and generally shrinks coefficients smoothly.",
        },

        {
          question:
            "Why should features be scaled before Ridge or Lasso?",
          shortAnswer:
            "Because the penalty acts on coefficient magnitude, which depends on feature scale.",
        },

        {
          question:
            "When would you prefer Elastic Net over Lasso?",
          shortAnswer:
            "When sparsity is useful but correlated predictors make pure Lasso selection unstable.",
        },

        {
          question:
            "Does stronger regularization always improve a model?",
          shortAnswer:
            "No. Excessive regularization increases bias and can cause underfitting.",
        },
      ],

      examNotes: [
        {
          title: "Ridge Regression",
          points: [
            "Uses L2 regularization.",
            "Shrinks coefficients.",
            "Useful with multicollinearity.",
            "Usually does not create exact zero coefficients.",
          ],
          formula:
            "Loss + αΣβⱼ²",
        },

        {
          title: "Lasso Regression",
          points: [
            "Uses L1 regularization.",
            "Can make coefficients exactly zero.",
            "Can perform embedded feature selection.",
          ],
          formula:
            "Loss + αΣ|βⱼ|",
        },

        {
          title: "Elastic Net",
          points: [
            "Combines L1 and L2.",
            "alpha controls overall strength.",
            "l1_ratio controls penalty mixture.",
          ],
        },
      ],
    },

    codeExamples: [
      {
        id: "ridge-pipeline",
        title: "Ridge Regression",

        description:
          "Scale features and fit Ridge Regression using a Pipeline.",

        language: "python",

        code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge

model = Pipeline([
    ("scaler", StandardScaler()),
    ("ridge", Ridge(alpha=1.0))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)`,

        explanation: [
          "StandardScaler makes numerical feature scales comparable.",
          "Ridge applies L2 regularization.",
          "alpha controls regularization strength.",
        ],
      },

      {
        id: "lasso-pipeline",
        title: "Lasso Regression",

        description:
          "Fit an L1-regularized regression model.",

        language: "python",

        code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Lasso

model = Pipeline([
    ("scaler", StandardScaler()),
    ("lasso", Lasso(
        alpha=0.1,
        max_iter=10000
    ))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)`,

        explanation: [
          "Lasso applies an L1 penalty.",
          "Some coefficients can become exactly zero.",
        ],
      },

      {
        id: "elastic-net-pipeline",
        title: "Elastic Net",

        description:
          "Combine L1 and L2 regularization.",

        language: "python",

        code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import ElasticNet

model = Pipeline([
    ("scaler", StandardScaler()),
    ("elastic", ElasticNet(
        alpha=0.1,
        l1_ratio=0.5,
        max_iter=10000
    ))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)`,

        explanation: [
          "alpha controls overall regularization.",
          "l1_ratio controls the L1/L2 mixture.",
        ],
      },
    ],

    practice: [
      {
        id: "regularization-practice-1",
        title: "Ridge or Lasso?",
        type: "analysis",
        difficulty: "medium",
        question:
          "You have many correlated predictors and want to keep them represented rather than forcing most coefficients to zero. Which method is a natural first choice?",
        solution:
          "Ridge Regression is a natural first choice because L2 regularization tends to shrink correlated coefficients rather than selecting only a sparse subset.",
      },

      {
        id: "regularization-practice-2",
        title: "Feature Selection",
        type: "concept",
        difficulty: "medium",
        question:
          "Why can Lasso act as an embedded feature-selection method?",
        solution:
          "The L1 penalty can drive some optimized coefficients exactly to zero, removing their linear contribution from the fitted model.",
      },

      {
        id: "regularization-practice-3",
        title: "Too Much Regularization",
        type: "analysis",
        difficulty: "medium",
        question:
          "After dramatically increasing regularization strength, both training and validation performance become poor. What happened?",
        solution:
          "The model is likely over-regularized and underfitting. Reduce regularization strength.",
      },

      {
        id: "regularization-practice-4",
        title: "Elastic Net Behavior",
        type: "analysis",
        difficulty: "advanced",
        question:
          "What happens conceptually as Elastic Net l1_ratio moves closer to 1?",
        solution:
          "The penalty becomes more L1-dominated, so the behavior becomes more Lasso-like and sparsity pressure increases.",
      },
    ],

    commonMistakes: [
      {
        id: "reg-mistake-alpha",
        title: "Assuming Larger alpha Is Always Better",
        description:
          "Increasing regularization indefinitely because it reduces model complexity.",
        correction:
          "Excessive regularization creates high bias and underfitting. Select strength using validation.",
      },

      {
        id: "reg-mistake-scaling",
        title: "Regularizing Unscaled Features",
        description:
          "Applying coefficient penalties to features with incomparable numerical scales.",
        correction:
          "Scale numerical features appropriately before regularized linear modeling.",
      },

      {
        id: "reg-mistake-lasso",
        title: "Treating Lasso Zeros as Scientific Proof",
        description:
          "Assuming a zero Lasso coefficient proves that a feature is inherently irrelevant.",
        correction:
          "Lasso selection depends on data, regularization strength and correlations between predictors.",
      },
    ],

    keyTakeaways: [
      "Regularization adds a complexity penalty to the training objective.",
      "Ridge uses L2 regularization.",
      "Lasso uses L1 regularization.",
      "Elastic Net combines L1 and L2.",
      "Ridge usually shrinks coefficients without making them exactly zero.",
      "Lasso can create sparse coefficient vectors.",
      "Elastic Net is useful when correlated predictors and sparsity both matter.",
      "Regularization trades increased bias for reduced variance.",
      "Too much regularization causes underfitting.",
      "Scaling is especially important for coefficient-based regularization.",
      "Choose regularization strength using cross-validation.",
    ],
  },

  // =======================================================
  // LOGISTIC REGRESSION
  // =======================================================

  "logistic-regression": {
    contentDepth: "expert",

    overview:
      "Logistic Regression is a probabilistic linear classification model. It forms a linear score from the input features and converts that score into class probability using the logistic sigmoid for binary classification. Despite the word regression in its name, Logistic Regression is primarily used for classification. Its coefficients have a natural log-odds interpretation, its probability output can be thresholded according to application costs, and regularization is an important part of practical Logistic Regression.",

    objectives: [
      "Understand why Logistic Regression is a classification algorithm.",
      "Understand the linear decision score.",
      "Understand probability, odds and log-odds.",
      "Understand the sigmoid function.",
      "Understand how probabilities become class predictions.",
      "Understand decision thresholds.",
      "Understand binary cross-entropy / log loss.",
      "Understand maximum-likelihood intuition.",
      "Understand Logistic Regression coefficients.",
      "Understand odds ratios.",
      "Understand regularization in Logistic Regression.",
      "Understand the inverse relationship between C and regularization strength.",
      "Understand solver compatibility conceptually.",
      "Understand class_weight.",
      "Understand binary and multiclass Logistic Regression.",
      "Understand why feature scaling can matter.",
      "Evaluate Logistic Regression using appropriate classification metrics.",
      "Understand threshold tuning.",
      "Diagnose underfitting, overfitting and convergence problems.",
    ],

    sections: [
      {
        id: "logistic-why",
        title: "Why Linear Regression Is Not Enough for Classification",

        explanation: [
          "Suppose the target contains two classes such as 0 and 1.",
          "Ordinary Linear Regression can generate predictions below zero or above one.",
          "Those outputs are not naturally constrained probabilities.",
          "Classification also requires reasoning about decision boundaries and class probabilities.",
          "Logistic Regression solves this by applying a logistic transformation to a linear score.",
        ],

        intuition: [
          "First calculate evidence using a weighted sum of features.",
          "Then squeeze that unrestricted score into the interval from zero to one.",
          "Interpret the result as a class probability.",
        ],
      },

      {
        id: "logistic-linear-score",
        title: "The Linear Score",

        explanation: [
          "Logistic Regression begins with the same weighted-sum structure seen in linear models.",
          "Each feature contributes according to its learned coefficient.",
          "The resulting value is often called a logit or linear decision score before probability transformation.",
        ],

        mathematics: {
          title: "Linear Score",

          explanation:
            "Features are combined linearly before applying the logistic function.",

          formula:
            "z = β₀ + β₁x₁ + β₂x₂ + ... + βₚxₚ",

          variables: [
            {
              symbol: "z",
              meaning: "linear score or logit",
            },
            {
              symbol: "βⱼ",
              meaning: "learned coefficient",
            },
          ],
        },
      },

      {
        id: "logistic-sigmoid",
        title: "Sigmoid Function",

        explanation: [
          "The sigmoid function maps any real-valued score to a number between zero and one.",
          "Large positive scores produce probabilities near one.",
          "Large negative scores produce probabilities near zero.",
          "A score of zero maps to probability 0.5.",
        ],

        mathematics: {
          title: "Logistic Sigmoid",

          explanation:
            "The sigmoid transforms the linear score into a probability.",

          formula:
            "σ(z) = 1 / (1 + e^(-z))",

          variables: [
            {
              symbol: "z",
              meaning: "linear score",
            },
            {
              symbol: "σ(z)",
              meaning: "predicted probability for the positive class",
            },
          ],
        },

        importantPoints: [
          "Sigmoid output lies between zero and one.",
          "Sigmoid is monotonic.",
          "Probability 0.5 corresponds to z = 0.",
        ],
      },

      {
        id: "logistic-odds",
        title: "Odds and Log-Odds",

        explanation: [
          "Probability can be converted into odds.",
          "Odds compare the probability of an event with the probability of it not occurring.",
          "Taking the logarithm of odds gives log-odds.",
          "Logistic Regression models log-odds as a linear combination of features.",
        ],

        mathematics: {
          title: "Logit Relationship",

          explanation:
            "The log-odds of the positive class are modeled linearly.",

          formula:
            "log(p / (1-p)) = β₀ + β₁x₁ + ... + βₚxₚ",
        },

        importantPoints: [
          "A one-unit feature increase changes log-odds by its coefficient when other features are fixed.",
          "Exponentiating a coefficient gives an odds-ratio interpretation under the model.",
        ],
      },

      {
        id: "logistic-threshold",
        title: "Probability Is Not the Same as the Final Class",

        explanation: [
          "Logistic Regression first estimates probabilities.",
          "A decision rule then converts probability into a class label.",
          "A threshold of 0.5 is common but not universally optimal.",
          "Changing the threshold changes false-positive and false-negative behavior.",
          "Threshold selection should reflect the actual application and error costs.",
        ],

        intuition: [
          "The model answers how strongly the evidence supports the positive class.",
          "The threshold answers how much evidence is required before taking the positive action.",
        ],

        importantPoints: [
          "Model training and decision policy are related but distinct.",
          "Threshold tuning should use validation data, not the final test set.",
        ],
      },

      {
        id: "logistic-loss",
        title: "Log Loss / Binary Cross-Entropy",

        explanation: [
          "Logistic Regression is trained using a probabilistic objective rather than ordinary squared-error regression.",
          "Correct confident probabilities are rewarded.",
          "Confidently wrong probabilities receive large penalties.",
          "The objective encourages probabilities that agree with observed class labels.",
        ],

        mathematics: {
          title: "Binary Cross-Entropy",

          explanation:
            "For binary classification, log loss measures probability prediction quality.",

          formula:
            "L = -(1/n) Σᵢ [yᵢ log(pᵢ) + (1-yᵢ) log(1-pᵢ)]",
        },
      },

      {
        id: "logistic-boundary",
        title: "Decision Boundary",

        explanation: [
          "Although Logistic Regression outputs nonlinear probabilities through sigmoid, its basic decision boundary is linear in the supplied feature space.",
          "For two features, the boundary can be represented as a line.",
          "For three features, it becomes a plane.",
          "In higher dimensions it becomes a hyperplane.",
          "Nonlinear feature engineering can produce nonlinear boundaries in the original feature space.",
        ],
      },

      {
        id: "logistic-regularization",
        title: "Regularization in Logistic Regression",

        explanation: [
          "Logistic Regression coefficients can overfit, particularly with many features or weakly constrained data.",
          "Regularization penalizes coefficient complexity.",
          "L2 regularization is a common default choice.",
          "L1 regularization can encourage sparse coefficients.",
          "Elastic-Net-style regularization can combine both effects when supported by the selected solver.",
        ],
      },

      {
        id: "logistic-c",
        title: "Understanding C",

        explanation: [
          "In sklearn LogisticRegression, C is conventionally used as an inverse regularization-strength parameter.",
          "This is the opposite direction from alpha used by many Ridge/Lasso-style estimators.",
          "Small C means stronger regularization.",
          "Large C means weaker regularization.",
        ],

        importantPoints: [
          "Never assume alpha and C move regularization in the same direction.",
          "Tune C using validation.",
        ],
      },

      {
        id: "logistic-imbalance",
        title: "Class Imbalance",

        explanation: [
          "Accuracy can become misleading when one class is much more frequent than another.",
          "Logistic Regression can use class weighting so errors from selected classes receive greater training importance.",
          "Threshold adjustment can also change recall and precision.",
          "The correct strategy depends on the real cost of different errors.",
        ],
      },
    ],

    modelDeepDive: {
      modelFamily:
        "Generalized Linear Models / Linear Classification",

      problemTypes: [
        "binary classification",
        "multiclass classification",
        "probability estimation",
      ],

      depth: "expert",

      motivation: [
        "Classification needs outputs that can be interpreted probabilistically.",
        "Linear Regression predictions are not naturally constrained between zero and one.",
        "Logistic Regression combines linear evidence with a probabilistic link function.",
        "It provides a strong interpretable baseline for classification.",
      ],

      intuition: [
        "Features vote through weighted coefficients.",
        "The weighted sum forms a score.",
        "Sigmoid converts the score into probability.",
        "A threshold converts probability into an action or class.",
      ],

      mentalModel: [
        "Calculate evidence.",
        "Convert evidence into probability.",
        "Compare probability with a decision threshold.",
        "Evaluate the resulting errors according to application costs.",
      ],

      trainingProcess: [
        {
          id: "log-train-1",
          step: 1,
          title: "Create Linear Scores",
          explanation:
            "Calculate a weighted combination of input features.",
        },

        {
          id: "log-train-2",
          step: 2,
          title: "Convert Scores to Probabilities",
          explanation:
            "Apply the logistic sigmoid in binary classification.",
        },

        {
          id: "log-train-3",
          step: 3,
          title: "Measure Log Loss",
          explanation:
            "Compare predicted probabilities with observed labels.",
        },

        {
          id: "log-train-4",
          step: 4,
          title: "Optimize Coefficients",
          explanation:
            "Use a compatible numerical solver to reduce the regularized objective.",
        },

        {
          id: "log-train-5",
          step: 5,
          title: "Validate",
          explanation:
            "Evaluate probability quality and classification behavior on unseen data.",
        },
      ],

      predictionProcess: [
        {
          id: "log-predict-1",
          step: 1,
          title: "Calculate Score",
          explanation:
            "Combine feature values with learned coefficients.",
        },

        {
          id: "log-predict-2",
          step: 2,
          title: "Estimate Probability",
          explanation:
            "Convert the score into class probability.",
        },

        {
          id: "log-predict-3",
          step: 3,
          title: "Apply Decision Rule",
          explanation:
            "Convert probability into a class according to the chosen decision policy.",
        },
      ],

      mathematics: [
        {
          title: "Linear Predictor",
          explanation:
            "Logistic Regression first creates a linear score.",
          formula:
            "z = β₀ + βᵀx",
        },

        {
          title: "Sigmoid",
          explanation:
            "Binary probability is obtained through the logistic function.",
          formula:
            "p = 1 / (1 + e^(-z))",
        },

        {
          title: "Log-Odds",
          explanation:
            "Logistic Regression is linear in log-odds.",
          formula:
            "log(p/(1-p)) = β₀ + βᵀx",
        },

        {
          title: "Odds Ratio",
          explanation:
            "Exponentiating a coefficient gives its multiplicative effect on odds for a one-unit feature increase, holding other modeled features fixed.",
          formula:
            "Odds Ratio = e^βⱼ",
        },
      ],

      objectiveFunctions: [
        {
          name: "Binary Log Loss",
          purpose:
            "Measure how well predicted probabilities agree with binary class labels.",

          intuition: [
            "Confident correct predictions have low loss.",
            "Confident incorrect predictions are penalized strongly.",
          ],

          formula:
            "-(1/n)Σ[y log(p) + (1-y)log(1-p)]",

          optimizationGoal: "minimize",

          practicalMeaning: [
            "Training seeks coefficients that assign high probability to observed classes while respecting regularization.",
          ],
        },
      ],

      assumptions: [
        {
          id: "log-assumption-logit",
          title: "Linear Relationship with Log-Odds",
          explanation:
            "Continuous predictors are assumed to relate linearly to the log-odds unless transformations or interactions are introduced.",
          violationEffect:
            "Important nonlinear structure may be missed.",
          howToCheck: [
            "Inspect domain relationships.",
            "Compare models with justified transformations.",
          ],
          remedies: [
            "Add nonlinear transformations.",
            "Add interactions.",
            "Use another classifier when appropriate.",
          ],
        },

        {
          id: "log-assumption-independent",
          title: "Independent Observations",
          explanation:
            "Standard Logistic Regression formulations generally assume observations contribute independently unless dependence is modeled separately.",
          violationEffect:
            "Repeated or grouped measurements can make standard statistical interpretation unreliable.",
        },

        {
          id: "log-assumption-collinearity",
          title: "Manage Severe Multicollinearity",
          explanation:
            "Highly redundant predictors can destabilize coefficient interpretation.",
          remedies: [
            "Use regularization.",
            "Remove unnecessary redundant features.",
            "Interpret coefficients cautiously.",
          ],
        },
      ],

      parameters: [
        {
          id: "logistic-c",
          name: "C",
          displayName: "Inverse Regularization Strength",
          category: "regularization",

          description:
            "Controls inverse regularization strength in sklearn LogisticRegression.",

          intuition:
            "Small C restrains coefficients strongly; large C gives them more freedom.",

          defaultValue:
            "1.0",

          acceptedValues:
            "Positive float.",

          mathematicalMeaning:
            "Inverse-strength control for regularization in the estimator API.",

          lowValueEffect: [
            "Stronger regularization.",
            "Smaller coefficients.",
            "Higher bias risk.",
            "Lower variance tendency.",
          ],

          highValueEffect: [
            "Weaker regularization.",
            "Greater coefficient freedom.",
            "Lower bias tendency.",
            "Higher variance and overfitting risk.",
          ],

          biasEffect:
            "Smaller C generally increases bias.",

          varianceEffect:
            "Smaller C generally reduces variance.",

          overfittingEffect:
            "Very large C can permit overfitting.",

          underfittingEffect:
            "Very small C can over-regularize the model.",

          whenToIncrease: [
            "The model appears over-regularized and underfits.",
          ],

          whenToDecrease: [
            "The model overfits.",
            "Coefficients are unstable.",
          ],

          tuningStrategy: [
            "Search C on a logarithmic scale using cross-validation.",
          ],

          commonMistakes: [
            "Thinking larger C means stronger regularization.",
            "Confusing C with Ridge/Lasso alpha.",
          ],

          examNotes: [
            "C is inverse regularization strength.",
          ],
        },

        {
          id: "logistic-l1-ratio",
          name: "l1_ratio",
          displayName: "L1 Ratio",
          category: "regularization",

          description:
            "Controls the L1/L2 mixture when Elastic-Net-style regularization is used with a compatible configuration.",

          intuition:
            "Higher values create more L1-like behavior; lower values create more L2-like behavior.",

          acceptedValues:
            "Typically a float between 0 and 1 when applicable.",

          lowValueEffect: [
            "More L2-like regularization.",
          ],

          highValueEffect: [
            "More L1-like regularization.",
            "Greater sparsity pressure.",
          ],

          interactions: [
            {
              parameter: "solver",
              explanation:
                "Elastic-Net-style regularization requires solver compatibility.",
            },
          ],
        },

        {
          id: "logistic-solver",
          name: "solver",
          displayName: "Optimization Solver",
          category: "optimization",

          description:
            "Selects the numerical optimization algorithm used to fit Logistic Regression.",

          intuition:
            "Different solvers have different performance characteristics and regularization support.",

          defaultValue:
            "\"lbfgs\" in sklearn LogisticRegression",

          acceptedValues:
            "Supported values include lbfgs, liblinear, newton-cg, newton-cholesky, sag and saga, subject to library version.",

          computationalEffect:
            "Solver choice can substantially affect training speed, convergence and memory usage.",

          interactions: [
            {
              parameter: "l1_ratio / regularization configuration",
              explanation:
                "Not every solver supports every regularization configuration.",
            },
          ],

          commonMistakes: [
            "Changing solver randomly without understanding why.",
            "Using an incompatible regularization/solver combination.",
          ],
        },

        {
          id: "logistic-max-iter",
          name: "max_iter",
          displayName: "Maximum Iterations",
          category: "optimization",

          description:
            "Maximum number of solver iterations allowed during fitting.",

          intuition:
            "Allows more optimization work when the solver has not converged.",

          defaultValue:
            "100",

          acceptedValues:
            "Positive integer.",

          whenToIncrease: [
            "A genuine convergence warning remains after checking scaling and model configuration.",
          ],

          whenNotToTune: [
            "Do not use max_iter as a substitute for model-complexity tuning.",
          ],
        },

        {
          id: "logistic-tol",
          name: "tol",
          displayName: "Convergence Tolerance",
          category: "optimization",

          description:
            "Controls stopping tolerance for optimization.",

          intuition:
            "Smaller values generally demand stricter numerical convergence.",

          defaultValue:
            "1e-4",

          computationalEffect:
            "Stricter tolerance can increase optimization work.",
        },

        {
          id: "logistic-class-weight",
          name: "class_weight",
          displayName: "Class Weight",
          category: "sampling",

          description:
            "Changes the importance assigned to examples from different classes during fitting.",

          intuition:
            "Errors on selected classes can be made more costly to the optimizer.",

          defaultValue:
            "None",

          acceptedValues:
            "None, \"balanced\", or a class-to-weight mapping.",

          whenToTune: [
            "Classes are imbalanced.",
            "False negatives and false positives have asymmetric importance.",
          ],

          commonMistakes: [
            "Using balanced weights automatically without evaluating the resulting precision-recall tradeoff.",
          ],
        },

        {
          id: "logistic-fit-intercept",
          name: "fit_intercept",
          displayName: "Fit Intercept",
          category: "implementation",

          description:
            "Controls whether a constant intercept is included.",

          intuition:
            "Allows the decision boundary to shift rather than being constrained by the origin.",

          defaultValue:
            "True",

          acceptedValues:
            "True or False",
        },

        {
          id: "logistic-intercept-scaling",
          name: "intercept_scaling",
          displayName: "Intercept Scaling",
          category: "implementation",

          description:
            "Special intercept-related scaling control used with specific solver configurations such as liblinear when an intercept is fitted.",

          intuition:
            "Changes the synthetic feature scale associated with the intercept in the relevant implementation.",

          defaultValue:
            "1",

          acceptedValues:
            "Float.",

          whenNotToTune: [
            "Usually leave unchanged unless you specifically understand and require the liblinear intercept behavior.",
          ],
        },

        {
          id: "logistic-dual",
          name: "dual",
          displayName: "Dual Formulation",
          category: "optimization",

          description:
            "Controls use of the dual formulation for supported solver/regularization combinations.",

          intuition:
            "Primal and dual formulations solve related optimization representations with different computational characteristics.",

          defaultValue:
            "False",

          acceptedValues:
            "True or False.",

          whenNotToTune: [
            "Do not treat this as a generic accuracy hyperparameter.",
          ],
        },

        {
          id: "logistic-random-state",
          name: "random_state",
          displayName: "Random State",
          category: "implementation",

          description:
            "Controls applicable randomness for solvers that use randomized behavior.",

          intuition:
            "Helps make stochastic aspects of fitting reproducible.",

          defaultValue:
            "None",

          acceptedValues:
            "Integer, RandomState-like value, or None depending on API.",
        },

        {
          id: "logistic-warm-start",
          name: "warm_start",
          displayName: "Warm Start",
          category: "optimization",

          description:
            "Allows supported fitting procedures to reuse a previous fitted solution as initialization for a subsequent fit.",

          intuition:
            "Can be useful when fitting a sequence of related configurations.",

          defaultValue:
            "False",

          acceptedValues:
            "True or False.",

          whenNotToTune: [
            "It is not a direct model-capacity control.",
          ],
        },
      ],

      dataRequirements: {
        scaling: {
          required: false,
          explanation:
            "The mathematical model does not strictly require standardized features, but scaling is strongly recommended for many solvers and makes regularization more comparable across numerical features.",
        },

        categoricalFeatures: {
          supportedDirectly: false,
          explanation:
            "Standard Logistic Regression requires numerical feature representations.",
          recommendations: [
            "Use appropriate encoding.",
            "Use OneHotEncoder for nominal categories where appropriate.",
          ],
        },

        missingValues: {
          supportedDirectly: false,
          explanation:
            "Missing values normally require preprocessing before sklearn LogisticRegression.",
          recommendations: [
            "Use SimpleImputer inside a Pipeline.",
          ],
        },

        outliers: {
          sensitivity: "medium",
          explanation:
            "Extreme feature values can strongly affect the linear score and coefficient estimates.",
          recommendations: [
            "Inspect unusual observations.",
            "Use robust transformations when justified.",
          ],
        },

        imbalance: {
          sensitivity: "high",
          explanation:
            "Severe class imbalance can make accuracy misleading and affect the learned decision behavior.",
          recommendations: [
            "Use stratified validation.",
            "Inspect precision and recall.",
            "Consider class weights.",
            "Tune decision threshold according to application cost.",
          ],
        },

        dimensionalityConsiderations: [
          "Regularization is especially important with many predictors.",
          "Sparse high-dimensional text representations can work well with suitable solvers.",
        ],
      },

      biasVariance: {
        bias: "depends",
        variance: "depends",

        explanation: [
          "Strong regularization increases bias and generally reduces variance.",
          "Weak regularization provides more coefficient freedom and can increase variance.",
        ],

        underfittingCauses: [
          "Excessive regularization.",
          "Missing nonlinear transformations.",
          "Decision boundary fundamentally too simple.",
        ],

        overfittingCauses: [
          "Very weak regularization.",
          "Many noisy features.",
          "Small dataset.",
        ],

        reduceUnderfitting: [
          "Reduce regularization.",
          "Add justified nonlinear or interaction features.",
          "Consider a more flexible classifier.",
        ],

        reduceOverfitting: [
          "Increase regularization.",
          "Improve feature selection.",
          "Collect more representative data.",
        ],
      },

      complexity: {
        training:
          "Depends on solver, sample count, feature count, sparsity and number of classes.",
        prediction:
          "Typically requires a linear score followed by probability transformation.",
        memory:
          "Generally efficient compared with large tree ensembles, though solver requirements vary.",
      },

      advantages: [
        "Strong classification baseline.",
        "Outputs probabilities.",
        "Fast prediction.",
        "Interpretable coefficients under appropriate conditions.",
        "Supports regularization.",
        "Works well for many high-dimensional problems.",
      ],

      limitations: [
        "Basic decision boundary is linear in supplied features.",
        "Coefficient interpretation becomes difficult with strong multicollinearity.",
        "Requires preprocessing for missing/categorical data.",
        "Probability quality should not be assumed perfect without evaluation.",
      ],

      whenToUse: [
        "A strong interpretable classification baseline is needed.",
        "Probability estimates are useful.",
        "Feature relationships with log-odds are reasonably represented by available features.",
        "High-dimensional sparse classification problems.",
      ],

      whenNotToUse: [
        "The decision structure is highly nonlinear and feature engineering is insufficient.",
        "Complex interactions dominate and interpretability is not worth the linear restriction.",
      ],

      evaluation: {
        problemType: "classification",

        recommendedMetrics: [
          {
            metric: "Accuracy",
            why:
              "Useful when classes and error costs are reasonably balanced.",
            caution:
              "Can be misleading under strong class imbalance.",
          },

          {
            metric: "Precision",
            why:
              "Measures how many predicted positives are actually positive.",
          },

          {
            metric: "Recall",
            why:
              "Measures how many actual positives are detected.",
          },

          {
            metric: "F1",
            why:
              "Balances precision and recall through their harmonic mean.",
          },

          {
            metric: "ROC-AUC",
            why:
              "Evaluates ranking across thresholds.",
          },

          {
            metric: "PR-AUC",
            why:
              "Especially informative when the positive class is rare.",
          },

          {
            metric: "Log Loss",
            why:
              "Evaluates probability predictions rather than only hard labels.",
          },
        ],

        validationStrategy: [
          "Use stratified splitting for classification when appropriate.",
          "Tune regularization inside cross-validation.",
          "Tune decision threshold on validation data when business costs require it.",
        ],

        diagnosticChecks: [
          "Confusion matrix.",
          "Precision-recall tradeoff.",
          "ROC curve.",
          "Probability calibration.",
          "Coefficient magnitude.",
          "Convergence warnings.",
        ],

        misleadingMetrics: [
          "Accuracy alone on highly imbalanced data.",
        ],
      },

      tuning: {
        strategy: [
          "Scale numerical features when appropriate.",
          "Choose a solver compatible with the desired regularization.",
          "Tune C logarithmically.",
          "Tune L1/L2 mixture only when required.",
          "Handle class imbalance separately from threshold policy.",
        ],

        tuneFirst: [
          "C",
        ],

        tuneLater: [
          "l1_ratio when using an Elastic-Net-style configuration",
          "class_weight",
          "solver when computational or compatibility reasons justify it",
        ],

        parameterInteractions: [
          "Small C means stronger regularization.",
          "Solver determines which regularization configurations are supported.",
          "class_weight changes fitting emphasis; threshold changes prediction policy.",
        ],

        practicalWorkflow: [
          "Build a clean preprocessing pipeline.",
          "Fit a regularized baseline.",
          "Inspect classification metrics.",
          "Cross-validate C.",
          "Address imbalance if necessary.",
          "Tune threshold according to application cost.",
          "Evaluate once on untouched test data.",
        ],
      },

      comparisons: [
        {
          model: "Linear Regression",
          relationship:
            "Both create linear combinations of features.",

          similarities: [
            "Both learn coefficients.",
            "Both can be interpreted through feature weights.",
          ],

          differences: [
            "Linear Regression predicts continuous numerical targets.",
            "Logistic Regression predicts class probabilities.",
            "Their objective functions differ.",
          ],

          preferCurrentWhen: [
            "Target is categorical.",
          ],

          preferOtherWhen: [
            "Target is continuous.",
          ],

          examTip:
            "Despite its name, Logistic Regression is primarily a classification algorithm.",
        },

        {
          model: "Decision Tree",
          differences: [
            "Logistic Regression has a linear boundary in supplied feature space.",
            "Decision Trees learn recursive nonlinear partitions.",
          ],

          preferCurrentWhen: [
            "A simple interpretable probabilistic baseline is desired.",
          ],

          preferOtherWhen: [
            "Strong nonlinear threshold interactions dominate.",
          ],
        },

        {
          model: "Naive Bayes",
          differences: [
            "Logistic Regression directly models conditional class probability discriminatively.",
            "Naive Bayes models class-conditional feature distributions using a conditional-independence assumption.",
          ],
        },
      ],

      failureModes: [
        {
          id: "log-failure-convergence",
          symptom:
            "Solver reports failure to converge.",
          likelyCauses: [
            "Poor feature scaling.",
            "Insufficient max_iter.",
            "Difficult optimization configuration.",
          ],
          diagnosis: [
            "Check numerical feature scales.",
            "Inspect solver configuration.",
          ],
          fixes: [
            "Scale features.",
            "Increase max_iter when justified.",
            "Use a suitable solver.",
          ],
        },

        {
          id: "log-failure-nonlinear",
          symptom:
            "Both training and validation performance remain poor despite reasonable regularization.",
          likelyCauses: [
            "Linear decision boundary is too restrictive.",
          ],
          fixes: [
            "Engineer nonlinear features.",
            "Try interaction terms.",
            "Use a nonlinear model.",
          ],
        },

        {
          id: "log-failure-imbalance",
          symptom:
            "High accuracy but very poor minority-class recall.",
          likelyCauses: [
            "Severe class imbalance.",
            "Default decision threshold inappropriate for the application.",
          ],
          fixes: [
            "Inspect confusion matrix and PR metrics.",
            "Evaluate class weighting.",
            "Tune threshold using validation data.",
          ],
        },
      ],

      realWorldApplications: [
        {
          title: "Hospital Readmission Risk",
          domain: "Healthcare",
          problem:
            "Estimate the probability that a patient belongs to a readmission-risk class.",
          whyModelFits:
            "Produces interpretable probability estimates and provides a strong baseline.",
          limitations: [
            "Relationships may be nonlinear.",
            "Clinical error costs require careful threshold selection.",
          ],
        },

        {
          title: "Customer Churn",
          domain: "Business",
          problem:
            "Estimate probability that a customer will leave.",
          whyModelFits:
            "Probability outputs can support prioritized intervention.",
        },

        {
          title: "Credit Default",
          domain: "Finance",
          problem:
            "Estimate probability of default from applicant characteristics.",
          whyModelFits:
            "Provides probabilistic output and relatively interpretable coefficients.",
          limitations: [
            "Fairness, calibration and regulatory considerations require additional analysis.",
          ],
        },
      ],

      interviewQuestions: [
        {
          question:
            "Why is Logistic Regression called regression if it performs classification?",
          shortAnswer:
            "It models the log-odds as a linear regression-like function of the features, but its output is transformed into class probability and used for classification.",
        },

        {
          question:
            "What does the sigmoid function do?",
          shortAnswer:
            "It maps any real-valued linear score to a value between zero and one.",
        },

        {
          question:
            "What does C mean in sklearn LogisticRegression?",
          shortAnswer:
            "C controls inverse regularization strength: smaller C means stronger regularization.",
        },

        {
          question:
            "Why might you change the classification threshold from 0.5?",
          shortAnswer:
            "Because different applications have different costs for false positives and false negatives.",
        },

        {
          question:
            "What is the interpretation of a Logistic Regression coefficient?",
          shortAnswer:
            "Holding other modeled features fixed, a one-unit increase in the feature changes log-odds by the coefficient; exponentiating it gives an odds ratio.",
        },
      ],

      examNotes: [
        {
          title: "Logistic Regression",
          points: [
            "Classification algorithm.",
            "Uses a linear score.",
            "Sigmoid maps score to probability.",
            "Decision threshold converts probability into class.",
          ],
          formula:
            "p = 1 / (1 + e^(-z))",
          commonQuestion:
            "Explain Logistic Regression and the sigmoid function.",
        },

        {
          title: "Log-Odds",
          points: [
            "Logistic Regression models log-odds linearly.",
            "Coefficient represents change in log-odds for a one-unit feature increase, holding other modeled features fixed.",
          ],
          formula:
            "log(p/(1-p)) = β₀ + βᵀx",
        },

        {
          title: "Regularization",
          points: [
            "Regularization controls coefficient complexity.",
            "In sklearn LogisticRegression, smaller C means stronger regularization.",
          ],
        },

        {
          title: "Classification Threshold",
          points: [
            "0.5 is common but not mandatory.",
            "Lower threshold usually increases positive predictions and recall while potentially reducing precision.",
            "Choose threshold according to validation results and application cost.",
          ],
        },
      ],
    },

    codeExamples: [
      {
        id: "logistic-basic",
        title: "Binary Logistic Regression",

        description:
          "Build a scaled Logistic Regression classifier.",

        language: "python",

        code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

model = Pipeline([
    ("scaler", StandardScaler()),
    ("logistic", LogisticRegression(
        C=1.0,
        max_iter=1000,
        random_state=42
    ))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]`,

        explanation: [
          "StandardScaler prepares numerical features for stable optimization.",
          "C controls inverse regularization strength.",
          "predict returns class labels.",
          "predict_proba returns probabilities.",
        ],

        commonMistakes: [
          "Using predict output when probability scores are required.",
          "Assuming C is ordinary regularization strength rather than inverse strength.",
        ],
      },

      {
        id: "logistic-evaluation",
        title: "Evaluate Logistic Regression",

        description:
          "Evaluate hard predictions and probability ranking.",

        language: "python",

        code: `from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    roc_auc_score
)

print(confusion_matrix(
    y_test,
    predictions
))

print(classification_report(
    y_test,
    predictions
))

print(
    "ROC-AUC:",
    roc_auc_score(
        y_test,
        probabilities
    )
)`,

        explanation: [
          "Confusion matrix shows error types.",
          "Classification report includes precision, recall and F1.",
          "ROC-AUC uses probability scores rather than only hard predictions.",
        ],
      },

      {
        id: "logistic-threshold-code",
        title: "Custom Decision Threshold",

        description:
          "Convert predicted probabilities into labels using a custom threshold.",

        language: "python",

        code: `threshold = 0.35

probabilities = model.predict_proba(
    X_test
)[:, 1]

custom_predictions = (
    probabilities >= threshold
).astype(int)`,

        explanation: [
          "Lowering the threshold generally predicts the positive class more frequently.",
          "This often increases recall while potentially increasing false positives.",
          "Threshold selection should be based on validation data and application costs.",
        ],
      },
    ],

    practice: [
      {
        id: "logistic-practice-1",
        title: "Sigmoid at Zero",
        type: "analysis",
        difficulty: "basic",
        question:
          "What probability does the sigmoid produce when z = 0?",
        solution:
          "0.5, because 1 / (1 + e⁰) = 1/2.",
      },

      {
        id: "logistic-practice-2",
        title: "Effect of C",
        type: "concept",
        difficulty: "medium",
        question:
          "If sklearn LogisticRegression C is changed from 10 to 0.01, what happens conceptually to regularization?",
        solution:
          "Regularization becomes much stronger because C is inverse regularization strength.",
      },

      {
        id: "logistic-practice-3",
        title: "Hospital Threshold",
        type: "analysis",
        difficulty: "advanced",
        question:
          "In a high-risk medical screening problem, missing a true positive is very costly. Why might a threshold below 0.5 be considered?",
        solution:
          "A lower threshold predicts the positive class more readily and can increase recall, reducing false negatives, although false positives may increase.",
      },

      {
        id: "logistic-practice-4",
        title: "Diagnose High Accuracy",
        type: "analysis",
        difficulty: "medium",
        question:
          "A dataset contains 98% negative cases. The model has 98% accuracy but zero recall for the positive class. Is this a good classifier?",
        solution:
          "No. Accuracy is misleading because the model fails to detect the minority positive class. Examine recall, precision, PR-AUC and the confusion matrix.",
      },
    ],

    commonMistakes: [
      {
        id: "logistic-mistake-regression",
        title: "Treating Logistic Regression as Continuous Regression",
        description:
          "Assuming Logistic Regression predicts an unrestricted numerical target because its name contains regression.",
        correction:
          "It is primarily a classification model that estimates class probabilities.",
      },

      {
        id: "logistic-mistake-c",
        title: "Misreading C",
        description:
          "Assuming larger C means stronger regularization.",
        correction:
          "C is inverse regularization strength: smaller C means stronger regularization.",
      },

      {
        id: "logistic-mistake-threshold",
        title: "Assuming 0.5 Is Always Optimal",
        description:
          "Using the default threshold regardless of error costs.",
        correction:
          "Evaluate threshold choices using validation data and application-specific costs.",
      },

      {
        id: "logistic-mistake-accuracy",
        title: "Using Accuracy Alone",
        description:
          "Judging an imbalanced classifier only by accuracy.",
        correction:
          "Inspect precision, recall, F1, confusion matrix and appropriate ranking metrics.",
      },

      {
        id: "logistic-mistake-sigmoid",
        title: "Thinking Sigmoid Creates Nonlinear Feature Boundaries",
        description:
          "Assuming sigmoid alone gives the basic model an arbitrarily nonlinear decision boundary.",
        correction:
          "Without nonlinear feature transformations, the basic decision boundary remains linear in the supplied feature space.",
      },
    ],

    keyTakeaways: [
      "Logistic Regression is primarily a classification algorithm.",
      "It first calculates a linear score.",
      "Sigmoid converts the binary score into probability.",
      "Logistic Regression is linear in log-odds.",
      "The classification threshold is a decision-policy choice.",
      "0.5 is common but not universally optimal.",
      "Binary log loss evaluates probability predictions during training.",
      "Regularization controls coefficient complexity.",
      "In sklearn LogisticRegression, smaller C means stronger regularization.",
      "Solver compatibility matters for regularization choices.",
      "Class weighting can help address imbalanced training objectives.",
      "Accuracy alone can be misleading on imbalanced datasets.",
      "Logistic Regression is an important interpretable baseline.",
    ],
  },
};