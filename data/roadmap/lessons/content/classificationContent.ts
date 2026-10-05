import type { DeepLessonRegistry } from "./lessonContentTypes";

export const classificationContent: DeepLessonRegistry = {
  // =========================================================
  // LOGISTIC REGRESSION
  // Existing ModelMind lab — CONNECT LATER
  // =========================================================

  "logistic-regression": {
    overview:
      "Logistic Regression is a supervised classification algorithm that models the probability of a class. Despite its name, it is primarily used for classification. It combines a linear score with the sigmoid function to produce values between 0 and 1, which can then be converted into class predictions using a decision threshold.",

    objectives: [
      "Understand binary classification.",
      "Understand the linear score used by Logistic Regression.",
      "Understand the sigmoid function.",
      "Interpret predicted probabilities.",
      "Understand decision thresholds.",
      "Understand log-odds and coefficients.",
      "Understand binary cross-entropy or log loss.",
      "Understand L1 and L2 regularization.",
      "Train Logistic Regression using sklearn.",
      "Use predict and predict_proba correctly.",
      "Evaluate classification beyond accuracy.",
    ],

    sections: [
      {
        id: "logistic-classification",
        title: "Classification and Logistic Regression",

        explanation: [
          "Classification predicts discrete categories rather than continuous numerical quantities.",
          "Binary classification contains two target classes, such as spam/not-spam, fraud/not-fraud or readmitted/not-readmitted.",
          "Logistic Regression estimates a probability-like score for the positive class.",
          "A decision threshold converts the probability into a final class prediction.",
        ],

        intuition: [
          "Instead of asking how large the output should be, Logistic Regression asks how strongly the evidence supports one class over another.",
        ],

        importantPoints: [
          "Logistic Regression is a classification algorithm.",
          "Binary targets commonly use labels 0 and 1.",
          "The model can output probabilities.",
          "Probability and final class prediction are different concepts.",
        ],
      },

      {
        id: "logistic-linear-score",
        title: "The Linear Score",

        explanation: [
          "Logistic Regression first computes a linear combination of the input features.",
          "For multiple features, z = b0 + b1*x1 + b2*x2 + ... + bn*xn.",
          "Unlike Linear Regression, this raw score is not directly treated as the final prediction.",
          "The score is passed through the sigmoid function.",
        ],

        intuition: [
          "The linear score combines evidence from the features. The sigmoid then converts that unrestricted score into a bounded probability-like value.",
        ],

        importantPoints: [
          "The linear score can range from negative infinity to positive infinity.",
          "Each feature contributes through its coefficient.",
          "The sigmoid transforms the score.",
        ],
      },

      {
        id: "logistic-sigmoid",
        title: "Sigmoid Function",

        explanation: [
          "The sigmoid function is sigmoid(z) = 1 / (1 + exp(-z)).",
          "Its output lies between 0 and 1.",
          "When z = 0, sigmoid(z) = 0.5.",
          "Large positive z values produce probabilities close to 1.",
          "Large negative z values produce probabilities close to 0.",
        ],

        intuition: [
          "The sigmoid smoothly squeezes any real-valued model score into the probability interval.",
        ],

        importantPoints: [
          "sigmoid(0) = 0.5.",
          "Large positive scores approach 1.",
          "Large negative scores approach 0.",
          "The function is smooth and differentiable.",
        ],
      },

      {
        id: "logistic-threshold",
        title: "Probability and Decision Threshold",

        explanation: [
          "A probability does not automatically determine the final class until a threshold is chosen.",
          "A common default threshold is 0.5.",
          "At threshold 0.5, probabilities greater than or equal to the threshold are commonly assigned to the positive class.",
          "The best operational threshold depends on the costs of false positives and false negatives.",
          "Changing the threshold changes precision, recall, sensitivity and specificity.",
        ],

        intuition: [
          "The model estimates risk. The threshold represents the decision rule applied to that risk.",
        ],

        importantPoints: [
          "0.5 is common but not universally optimal.",
          "Lower thresholds generally predict more positives.",
          "Higher thresholds generally predict fewer positives.",
          "Threshold choice should reflect the problem objective.",
        ],
      },

      {
        id: "logistic-logodds",
        title: "Odds, Log-Odds and Coefficients",

        explanation: [
          "If p is the probability of the positive class, odds are p / (1 - p).",
          "Log-odds are log(p / (1 - p)).",
          "Logistic Regression models log-odds as a linear function of the features.",
          "A one-unit increase in a feature changes the log-odds by its coefficient when other included features remain fixed.",
          "Exponentiating a coefficient gives the associated multiplicative change in odds under the fitted model.",
        ],

        intuition: [
          "The probability relationship is curved, but the model makes the log-odds linear in the features.",
        ],

        importantPoints: [
          "Positive coefficients increase fitted log-odds.",
          "Negative coefficients decrease fitted log-odds.",
          "exp(coefficient) can be interpreted as an odds ratio under the model.",
          "Association should not automatically be interpreted as causation.",
        ],
      },

      {
        id: "logistic-loss",
        title: "Log Loss",

        explanation: [
          "Classification training needs an objective appropriate for probabilities.",
          "Logistic Regression is commonly trained by minimizing log loss, also called binary cross-entropy for binary classification.",
          "Correct confident predictions receive low loss.",
          "Confidently incorrect predictions receive a large penalty.",
          "This encourages useful probability estimates rather than only correct class labels.",
        ],

        intuition: [
          "Predicting 0.51 for a positive example and predicting 0.99 are both correct at threshold 0.5, but they do not express the same confidence. Log loss captures this difference.",
        ],

        importantPoints: [
          "Log loss evaluates predicted probabilities.",
          "Confident wrong predictions are penalized strongly.",
          "Lower log loss is better.",
        ],
      },

      {
        id: "logistic-regularization",
        title: "Regularization in Logistic Regression",

        explanation: [
          "Logistic Regression can overfit when the feature space is large or noisy.",
          "Regularization discourages unnecessarily large coefficients.",
          "L2 regularization is commonly used by default in sklearn LogisticRegression.",
          "L1 regularization can encourage sparse coefficient solutions.",
          "In sklearn LogisticRegression, C is the inverse of regularization strength.",
        ],

        intuition: [
          "Regularization asks the classifier to explain the classes without relying on excessively extreme coefficients.",
        ],

        importantPoints: [
          "Smaller C means stronger regularization.",
          "L2 shrinks coefficients.",
          "L1 can produce zero coefficients.",
          "Scaling is often useful before regularized Logistic Regression.",
        ],
      },
    ],

    visualization: {
      type: "model-lab",
      visualizationId: "logistic-regression",
      title: "Logistic Regression Model Lab",
      description:
        "Connect later to the existing ModelMind Logistic Regression Lab for sigmoid, probability, threshold and decision-boundary exploration.",
    },

    codeExamples: [
      {
        id: "logistic-code",
        title: "Complete Logistic Regression Workflow",
        description:
          "Train Logistic Regression and evaluate both classes and probabilities.",
        language: "python",

        code: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(
    return_X_y=True
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

model = Pipeline([
    (
        "scaler",
        StandardScaler()
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=2000
        )
    )
])

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

probabilities = model.predict_proba(
    X_test
)[:, 1]

print(
    "Accuracy:",
    accuracy_score(
        y_test,
        predictions
    )
)

print(
    "Confusion matrix:"
)

print(
    confusion_matrix(
        y_test,
        predictions
    )
)

print(
    classification_report(
        y_test,
        predictions
    )
)

print(
    "ROC-AUC:",
    roc_auc_score(
        y_test,
        probabilities
    )
)`,

        explanation: [
          "Stratification helps preserve class proportions in the split.",
          "StandardScaler is fitted inside the Pipeline.",
          "predict returns class labels.",
          "predict_proba returns estimated class probabilities.",
          "The second probability column corresponds to class 1 for this binary classifier.",
          "ROC-AUC uses scores or probabilities rather than hard class predictions.",
        ],

        commonMistakes: [
          "Calling Logistic Regression a regression algorithm because of its name.",
          "Using predict when probabilities are required.",
          "Assuming 0.5 is always the best threshold.",
          "Evaluating imbalanced data using accuracy alone.",
        ],
      },
    ],

    practice: [
      {
        id: "logistic-practice-1",
        title: "Sigmoid at Zero",
        type: "concept",
        difficulty: "basic",
        question:
          "What probability does the sigmoid function produce when the linear score z is 0?",
        instructions: [
          "Substitute z = 0 into the sigmoid equation.",
        ],
        hints: [
          "exp(0) = 1.",
        ],
        explanation:
          "sigmoid(0) = 1 / (1 + 1) = 0.5.",
      },

      {
        id: "logistic-practice-2",
        title: "Threshold Decision",
        type: "concept",
        difficulty: "basic",
        question:
          "A model predicts probability 0.72 for class 1. What class is predicted using threshold 0.5?",
        instructions: [
          "Compare the probability with the threshold.",
        ],
        hints: [
          "0.72 is greater than 0.5.",
        ],
        explanation:
          "The observation is classified as class 1.",
      },

      {
        id: "logistic-practice-3",
        title: "Changing Threshold",
        type: "analysis",
        difficulty: "medium",
        question:
          "What generally happens to the number of positive predictions if the classification threshold is reduced from 0.5 to 0.3?",
        instructions: [
          "Consider which probabilities now qualify as positive.",
        ],
        hints: [
          "More observations exceed 0.3 than 0.5.",
        ],
        explanation:
          "The model generally predicts more observations as positive, which often increases recall while potentially reducing precision.",
      },

      {
        id: "logistic-practice-4",
        title: "C Parameter",
        type: "concept",
        difficulty: "medium",
        question:
          "In sklearn LogisticRegression, does decreasing C generally make regularization stronger or weaker?",
        instructions: [
          "Remember that C is inverse regularization strength.",
        ],
        hints: [
          "Smaller inverse strength means stronger regularization.",
        ],
        explanation:
          "Decreasing C generally makes regularization stronger.",
      },

      {
        id: "logistic-practice-5",
        title: "Medical Threshold",
        type: "analysis",
        difficulty: "advanced",
        question:
          "In a screening system where missing a serious disease is extremely costly, why might a threshold below 0.5 be considered?",
        instructions: [
          "Connect the threshold with false negatives and recall.",
        ],
        hints: [
          "A lower threshold identifies more observations as positive.",
        ],
        explanation:
          "A lower threshold can increase sensitivity or recall and reduce false negatives, although it may also increase false positives.",
      },

      {
        id: "logistic-practice-6",
        title: "Probability vs Prediction",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Explain the difference between predict() and predict_proba() for LogisticRegression.",
        instructions: [
          "Distinguish hard decisions from estimated probabilities.",
        ],
        hints: [
          "One returns labels and the other returns probabilities for classes.",
        ],
        explanation:
          "predict() returns final class labels according to the classifier's decision rule, while predict_proba() returns estimated probabilities for each class.",
      },
    ],

    keyTakeaways: [
      "Logistic Regression is a classification algorithm.",
      "It combines a linear score with the sigmoid function.",
      "The sigmoid produces values between 0 and 1.",
      "Thresholds convert probabilities into class decisions.",
      "Threshold choice affects false positives and false negatives.",
      "Log loss is a probability-based training objective.",
      "Regularization controls coefficient complexity.",
      "predict and predict_proba serve different purposes.",
    ],
  },


  // =========================================================
  // K-NEAREST NEIGHBORS
  // Existing ModelMind lab — CONNECT LATER
  // =========================================================

  "knn": {
    overview:
      "K-Nearest Neighbors is a supervised learning algorithm that predicts an observation using nearby training examples. KNN is intuitive and powerful for understanding distance, neighborhoods, decision boundaries, feature scaling and the bias-variance trade-off.",

    objectives: [
      "Understand instance-based learning.",
      "Understand nearest neighbors.",
      "Understand Euclidean distance.",
      "Understand the role of k.",
      "Understand majority voting.",
      "Understand distance weighting.",
      "Understand why feature scaling is critical.",
      "Understand KNN decision boundaries.",
      "Tune k using validation.",
      "Recognize computational limitations.",
    ],

    sections: [
      {
        id: "knn-introduction",
        title: "How KNN Learns",

        explanation: [
          "KNN stores the training observations rather than fitting a conventional parametric equation.",
          "When a new observation arrives, the algorithm measures its distance from training observations.",
          "It selects the k closest examples.",
          "For classification, their labels vote on the predicted class.",
        ],

        intuition: [
          "A new observation is classified according to the labels of the examples most similar to it.",
        ],

        importantPoints: [
          "KNN is instance-based.",
          "Prediction depends on stored training examples.",
          "Distance defines similarity.",
          "k controls neighborhood size.",
        ],
      },

      {
        id: "knn-distance",
        title: "Distance",

        explanation: [
          "Euclidean distance is a common KNN distance metric.",
          "For two-dimensional points, distance = sqrt((x1-x2)^2 + (y1-y2)^2).",
          "Features with larger numerical scales can dominate this calculation.",
          "The choice of distance metric changes the meaning of neighborhood similarity.",
        ],

        intuition: [
          "KNN assumes observations close in feature space are likely to have similar outputs.",
        ],

        importantPoints: [
          "Distance defines neighbors.",
          "Euclidean distance is common.",
          "Feature representation strongly affects distance.",
        ],
      },

      {
        id: "knn-k",
        title: "Choosing k",

        explanation: [
          "A very small k creates highly local predictions.",
          "k = 1 can be extremely sensitive to individual observations and noise.",
          "Larger k produces smoother decision boundaries.",
          "If k becomes too large, local class structure can be lost.",
          "k should be selected using validation or cross-validation.",
        ],

        intuition: [
          "Small neighborhoods react strongly to local detail. Large neighborhoods average over more of the dataset.",
        ],

        importantPoints: [
          "Small k usually means lower bias and higher variance.",
          "Large k usually means higher bias and lower variance.",
          "Choose k using validation.",
        ],
      },

      {
        id: "knn-scaling",
        title: "Why Scaling Matters",

        explanation: [
          "KNN compares observations using distance.",
          "If salary ranges from 20,000 to 2,000,000 while age ranges from 18 to 70, salary can dominate Euclidean distance.",
          "Standardization or another appropriate scaling method is therefore commonly required.",
          "The scaler must be fitted using training data only.",
        ],

        intuition: [
          "A measurement should not dominate the neighborhood merely because its unit produces larger numbers.",
        ],

        importantPoints: [
          "KNN is highly scale-sensitive.",
          "Use scaling inside a Pipeline.",
          "Do not fit the scaler globally before evaluation.",
        ],
      },

      {
        id: "knn-computation",
        title: "Computational Characteristics",

        explanation: [
          "KNN has relatively little conventional model-fitting work.",
          "Prediction can be expensive because distances to many stored observations may need to be calculated.",
          "Memory requirements can also be large because training data is retained.",
          "Performance can degrade in very high-dimensional spaces due to the curse of dimensionality.",
        ],

        intuition: [
          "KNN postpones much of its work until prediction time.",
        ],

        importantPoints: [
          "Training is relatively simple.",
          "Prediction can be expensive.",
          "High dimensionality can make distance less informative.",
        ],
      },
            {
        id: "knn-lazy-learning",
        title: "Lazy Learning and Instance-Based Learning",

        explanation: [
          "KNN is called an instance-based learning algorithm because predictions are made directly from stored training examples.",
          "It is also commonly described as a lazy learner because it performs relatively little conventional parameter estimation during model fitting.",
          "Instead of learning coefficients, tree rules or support-vector weights, KNN retains the training observations.",
          "Most of the computational work is postponed until a new observation must be predicted.",
          "At prediction time, KNN searches for nearby stored observations and uses their targets to construct the prediction.",
        ],

        intuition: [
          "KNN does not study the training set and write a compact formula before the exam.",
          "It effectively keeps the examples available and consults the most similar ones whenever a new question arrives.",
        ],

        importantPoints: [
          "KNN is instance-based.",
          "KNN is commonly called a lazy learner.",
          "Training is relatively lightweight.",
          "Prediction performs substantial work.",
          "Training observations must be retained.",
        ],
      },

      {
        id: "knn-classification-regression",
        title: "KNN Classification vs KNN Regression",

        explanation: [
          "KNN can solve both classification and regression problems.",
          "KNeighborsClassifier predicts categorical targets using the labels of nearby observations.",
          "With uniform weighting, classification commonly uses the most frequent class among the selected neighbors.",
          "KNeighborsRegressor predicts continuous targets using the numerical target values of nearby observations.",
          "With uniform weighting, regression commonly averages the targets of the selected neighbors.",
          "Distance weighting can modify both procedures so that closer neighbors contribute more strongly.",
        ],

        intuition: [
          "Classification asks nearby observations which class should win.",
          "Regression asks nearby observations what numerical value should be predicted.",
        ],

        importantPoints: [
          "KNeighborsClassifier handles classification.",
          "KNeighborsRegressor handles regression.",
          "Classification aggregates class labels.",
          "Regression aggregates numerical targets.",
          "Both depend on neighborhood geometry.",
        ],
      },

      {
        id: "knn-euclidean",
        title: "Euclidean Distance",

        explanation: [
          "Euclidean distance is the ordinary straight-line distance between points in feature space.",
          "For two observations x and z, it is the square root of the sum of squared coordinate differences.",
          "In two dimensions this corresponds directly to the Pythagorean distance formula.",
          "Because differences are squared, large coordinate differences can strongly influence the result.",
          "Euclidean distance corresponds to Minkowski distance with p=2.",
        ],

        intuition: [
          "Imagine stretching a straight measuring tape directly from one observation to another.",
        ],

        importantPoints: [
          "Straight-line distance.",
          "Minkowski p=2.",
          "Sensitive to feature scale.",
          "Common KNN distance metric.",
        ],
      },

      {
        id: "knn-manhattan",
        title: "Manhattan Distance",

        explanation: [
          "Manhattan distance sums the absolute differences between feature coordinates.",
          "It is also known as L1 distance.",
          "It corresponds to Minkowski distance with p=1.",
          "Unlike Euclidean distance, it does not square coordinate differences.",
          "Its geometry resembles movement through a grid where travel occurs along coordinate directions.",
        ],

        intuition: [
          "Imagine moving through city blocks where you travel horizontally and vertically rather than directly through buildings.",
        ],

        importantPoints: [
          "Also called L1 distance.",
          "Minkowski p=1.",
          "Uses absolute coordinate differences.",
          "Produces different neighborhood geometry from Euclidean distance.",
        ],
      },

      {
        id: "knn-minkowski",
        title: "Minkowski Distance",

        explanation: [
          "Minkowski distance is a general distance family controlled by the parameter p.",
          "When p=1, it becomes Manhattan distance.",
          "When p=2, it becomes Euclidean distance.",
          "Changing p changes the geometry used to determine which observations count as nearest neighbors.",
          "In sklearn KNN estimators, p is relevant when the selected metric uses Minkowski distance.",
        ],

        intuition: [
          "Minkowski distance provides one family that can smoothly change the shape of the neighborhood geometry.",
        ],

        importantPoints: [
          "p=1 gives Manhattan distance.",
          "p=2 gives Euclidean distance.",
          "p changes neighborhood geometry.",
          "p should only be interpreted when the selected metric actually uses it.",
        ],
      },

      {
        id: "knn-chebyshev",
        title: "Chebyshev Distance",

        explanation: [
          "Chebyshev distance measures the largest absolute coordinate difference between two observations.",
          "Instead of summing differences across dimensions, it focuses on the dimension with the greatest separation.",
          "This creates a different neighborhood shape from Euclidean and Manhattan distance.",
          "Whether it is appropriate depends on the meaning of the features and the application.",
        ],

        intuition: [
          "Two observations are considered as far apart as their single largest coordinate disagreement.",
        ],

        importantPoints: [
          "Uses maximum coordinate difference.",
          "Creates different neighborhood geometry.",
          "Metric choice should reflect the problem.",
        ],
      },

      {
        id: "knn-distance-choice",
        title: "Choosing a Distance Metric",

        explanation: [
          "The distance metric defines what KNN means by similarity.",
          "Euclidean distance is a strong baseline for many continuous numerical problems after appropriate scaling.",
          "Manhattan distance can be useful when absolute coordinate differences better represent the application.",
          "Other metrics may be appropriate for specialized feature representations.",
          "A metric should not be selected only because it produces the highest training score.",
          "Metric selection should combine domain meaning with validation performance.",
        ],

        intuition: [
          "Changing the metric changes which observations the model believes are similar, so it can change the prediction even when k stays identical.",
        ],

        importantPoints: [
          "Distance metric defines similarity.",
          "Metric choice affects neighbors.",
          "Feature representation and metric must make sense together.",
          "Use validation.",
        ],
      },

      {
        id: "knn-neighborhood-example",
        title: "KNN Prediction Step by Step",

        explanation: [
          "First, store the training observations and their targets.",
          "Second, receive a new observation that requires prediction.",
          "Third, calculate its distance to candidate training observations.",
          "Fourth, identify the k observations with the smallest distances.",
          "Fifth, aggregate their targets using the configured classification or regression rule.",
          "Finally, return the resulting prediction.",
        ],

        intuition: [
          "Find the nearest examples, then let those examples determine the answer.",
        ],

        importantPoints: [
          "Calculate distances.",
          "Sort or search for nearest observations.",
          "Select k neighbors.",
          "Aggregate neighbor targets.",
          "Return prediction.",
        ],
      },

      {
        id: "knn-k-bias-variance",
        title: "k and the Bias-Variance Trade-Off",

        explanation: [
          "The number of neighbors is one of the most important KNN hyperparameters.",
          "A very small k creates highly flexible local predictions.",
          "With k=1, individual noisy observations can directly control predictions in their neighborhoods.",
          "This generally corresponds to low bias but high variance.",
          "Increasing k averages information across a larger neighborhood.",
          "This usually smooths the decision function, reducing variance while increasing bias.",
          "An excessively large k can ignore useful local structure and underfit.",
        ],

        intuition: [
          "Small k listens to a few nearby voices very strongly.",
          "Large k asks a much larger crowd and produces a smoother answer.",
        ],

        importantPoints: [
          "Small k generally means lower bias and higher variance.",
          "Large k generally means higher bias and lower variance.",
          "Very small k can overfit.",
          "Very large k can underfit.",
          "Select k through validation.",
        ],
      },

      {
        id: "knn-decision-boundary",
        title: "KNN Decision Boundaries",

        explanation: [
          "KNN does not learn one explicit global boundary equation.",
          "Its classification boundary emerges from how training observations are distributed through feature space.",
          "Small values of k can produce highly irregular local boundaries.",
          "Larger values of k generally create smoother boundaries.",
          "Changing feature scaling or the distance metric can reshape the boundary because neighborhood relationships change.",
        ],

        intuition: [
          "Imagine every region of feature space asking which training labels dominate its local neighborhood.",
        ],

        importantPoints: [
          "Boundary is data-driven.",
          "Small k creates flexible local boundaries.",
          "Large k usually smooths boundaries.",
          "Scaling and metric choice can alter the boundary.",
        ],
      },

      {
        id: "knn-uniform-weights",
        title: "Uniform Neighbor Weighting",

        explanation: [
          "With uniform weighting, every selected neighbor contributes equally to the prediction.",
          "In classification, each neighbor receives the same voting influence.",
          "In regression, each selected target receives equal influence in the ordinary average.",
          "Uniform weighting is simple and often provides a useful baseline.",
        ],

        intuition: [
          "Once an observation enters the neighborhood, treat its opinion as equally important as every other selected neighbor.",
        ],

        importantPoints: [
          "All selected neighbors have equal influence.",
          "Simple baseline.",
          "Does not distinguish very close from barely selected neighbors.",
        ],
      },

      {
        id: "knn-distance-weights",
        title: "Distance-Weighted KNN",

        explanation: [
          "Distance weighting gives closer neighbors greater influence than more distant selected neighbors.",
          "In sklearn, weights='distance' applies inverse-distance-style weighting.",
          "This can preserve local information even when k is moderately large.",
          "Distance weighting can help when nearby observations are more trustworthy than neighbors near the edge of the neighborhood.",
          "It can also increase sensitivity to extremely close observations.",
        ],

        intuition: [
          "A neighbor standing one step away should usually have more influence than a neighbor near the outer edge of the selected neighborhood.",
        ],

        importantPoints: [
          "Closer neighbors receive more influence.",
          "weights='distance' enables distance weighting.",
          "Can change both classification and regression behavior.",
          "Should be validated.",
        ],
      },

      {
        id: "knn-n-neighbors-parameter",
        title: "n_neighbors",

        explanation: [
          "n_neighbors specifies how many nearest training observations participate in prediction.",
          "It directly controls neighborhood size.",
          "Smaller values create more local and flexible predictions.",
          "Larger values create broader and smoother predictions.",
          "Its effect is closely connected to the bias-variance trade-off.",
        ],

        intuition: [
          "n_neighbors determines how many nearby examples the model is allowed to consult.",
        ],

        importantPoints: [
          "Core KNN hyperparameter.",
          "Small values increase locality.",
          "Large values increase smoothing.",
          "Tune with validation.",
        ],
      },

      {
        id: "knn-weights-parameter",
        title: "weights",

        explanation: [
          "weights determines how selected neighbors contribute to predictions.",
          "weights='uniform' gives equal influence to each selected neighbor.",
          "weights='distance' gives closer neighbors greater influence.",
          "A callable weighting function can also be used in appropriate advanced cases.",
          "The best choice depends on how rapidly target similarity changes with distance.",
        ],

        intuition: [
          "weights decides whether every neighbor gets one equal vote or nearby neighbors speak more loudly.",
        ],

        importantPoints: [
          "uniform gives equal influence.",
          "distance emphasizes closer neighbors.",
          "Weighting changes prediction behavior without changing which observations are stored.",
        ],
      },

      {
        id: "knn-algorithm-parameter",
        title: "algorithm",

        explanation: [
          "algorithm controls the neighbor-search strategy used by sklearn KNN estimators.",
          "Common choices include auto, ball_tree, kd_tree and brute.",
          "brute performs direct distance comparisons.",
          "KD-tree and Ball-tree structures can accelerate neighbor search for suitable datasets.",
          "auto allows sklearn to choose an appropriate strategy based on the fitted data and estimator configuration.",
          "The best search strategy depends on sample size, dimensionality, metric and data structure.",
        ],

        intuition: [
          "The prediction rule stays KNN, but algorithm changes how efficiently the model finds the nearest observations.",
        ],

        importantPoints: [
          "auto chooses automatically.",
          "brute performs direct search.",
          "kd_tree and ball_tree use search structures.",
          "Primarily affects computational behavior.",
        ],
      },

      {
        id: "knn-kd-tree",
        title: "KD-Tree Neighbor Search",

        explanation: [
          "A KD-tree recursively partitions feature space using coordinate-based splits.",
          "This can reduce the number of distance comparisons needed for nearest-neighbor queries.",
          "KD-trees can be effective in relatively low-dimensional numerical spaces.",
          "Their advantage often decreases as dimensionality grows.",
          "Not every metric or dataset configuration is compatible with KD-tree search.",
        ],

        intuition: [
          "Organize the feature space into searchable regions so the model does not need to inspect every stored observation.",
        ],

        importantPoints: [
          "Spatial search structure.",
          "Can accelerate low-dimensional neighbor search.",
          "Performance degrades in high dimensions.",
          "Metric compatibility matters.",
        ],
      },

      {
        id: "knn-ball-tree",
        title: "Ball-Tree Neighbor Search",

        explanation: [
          "A Ball-tree organizes observations into nested regions represented by metric-space balls.",
          "It supports a broader collection of distance metrics than KD-tree in many implementations.",
          "It can improve neighbor-search efficiency for suitable datasets.",
          "Its performance still depends strongly on dimensionality, data distribution and metric.",
        ],

        intuition: [
          "Group nearby observations into nested neighborhoods so large irrelevant regions can sometimes be skipped during search.",
        ],

        importantPoints: [
          "Alternative spatial search structure.",
          "Useful with supported metrics.",
          "Efficiency depends on dataset geometry.",
        ],
      },

      {
        id: "knn-brute-force",
        title: "Brute-Force Neighbor Search",

        explanation: [
          "Brute-force KNN computes distances directly between a query and stored training observations.",
          "It avoids the overhead of constructing specialized spatial search trees.",
          "For small datasets or high-dimensional data, brute-force search can sometimes be competitive.",
          "Its prediction cost grows with the number of stored observations.",
        ],

        intuition: [
          "Measure the query against everyone and then keep the closest results.",
        ],

        importantPoints: [
          "Simple direct search.",
          "No spatial tree required.",
          "Can be competitive in some high-dimensional settings.",
          "Prediction cost grows with dataset size.",
        ],
      },

      {
        id: "knn-leaf-size",
        title: "leaf_size",

        explanation: [
          "leaf_size affects the internal behavior of Ball-tree and KD-tree neighbor search.",
          "It can influence tree construction cost, query speed and memory usage.",
          "It does not directly change the statistical definition of nearest-neighbor prediction.",
          "Its effect is therefore primarily computational.",
        ],

        intuition: [
          "leaf_size changes how finely the search structure divides stored observations.",
        ],

        importantPoints: [
          "Relevant to Ball-tree and KD-tree search.",
          "Can affect speed and memory.",
          "Not a direct bias-variance control.",
        ],
      },

      {
        id: "knn-p-parameter",
        title: "p",

        explanation: [
          "p controls the power parameter of Minkowski distance when that metric is used.",
          "p=1 corresponds to Manhattan distance.",
          "p=2 corresponds to Euclidean distance.",
          "Other valid values create different Minkowski geometries.",
          "Changing p is meaningful only when the selected metric uses this parameter.",
        ],

        intuition: [
          "p changes the shape of the distance geometry used to define neighborhoods.",
        ],

        importantPoints: [
          "p=1 gives Manhattan.",
          "p=2 gives Euclidean.",
          "Relevant to Minkowski-style distance.",
          "Do not tune p when the chosen metric ignores it.",
        ],
      },

      {
        id: "knn-metric-parameter",
        title: "metric",

        explanation: [
          "metric determines how distance between observations is calculated.",
          "The default KNN configuration commonly uses Minkowski distance.",
          "Different metrics create different neighborhood relationships.",
          "Metric choice must be compatible with the feature representation and search algorithm.",
          "Custom callable metrics are possible in advanced settings but can affect computational performance.",
        ],

        intuition: [
          "metric defines the ruler used to decide which observations are close.",
        ],

        importantPoints: [
          "Defines similarity geometry.",
          "Interacts with p.",
          "Interacts with search algorithm.",
          "Choose using domain meaning and validation.",
        ],
      },

      {
        id: "knn-metric-params",
        title: "metric_params",

        explanation: [
          "metric_params provides additional keyword arguments required by certain distance metrics.",
          "It is only useful when the selected metric accepts additional configuration.",
          "It should not be treated as an independent model-capacity hyperparameter.",
          "Its meaning depends entirely on the configured metric.",
        ],

        intuition: [
          "Some specialized rulers require additional settings, and metric_params supplies those settings.",
        ],

        importantPoints: [
          "Metric-specific configuration.",
          "Meaning depends on metric.",
          "Do not tune it without understanding the selected distance function.",
        ],
      },

      {
        id: "knn-n-jobs",
        title: "n_jobs",

        explanation: [
          "n_jobs controls parallel computation for supported neighbor-search operations.",
          "Using multiple processors can accelerate suitable prediction or neighbor-query workloads.",
          "It changes computational execution rather than the statistical definition of KNN.",
        ],

        intuition: [
          "Use multiple workers to help perform neighbor-search work.",
        ],

        importantPoints: [
          "Computational parameter.",
          "Can improve runtime.",
          "Does not directly change overfitting.",
        ],
      },

      {
        id: "knn-curse-dimensionality",
        title: "Curse of Dimensionality in Depth",

        explanation: [
          "KNN depends on meaningful differences between near and far observations.",
          "As dimensionality grows, the volume of feature space grows rapidly.",
          "Training observations become increasingly sparse relative to that volume.",
          "Distances can become less discriminative because nearest and farthest observations may become relatively similar.",
          "Irrelevant dimensions add noise to distance calculations.",
          "This can make local neighborhoods much less meaningful.",
        ],

        intuition: [
          "In two dimensions, nearby points are easy to find.",
          "In hundreds of dimensions, almost everything can feel far away and the meaning of 'nearest' becomes weaker.",
        ],

        importantPoints: [
          "High dimensionality weakens distance quality.",
          "Data becomes sparse.",
          "Irrelevant features are especially harmful.",
          "Feature selection or dimensionality reduction can help.",
        ],
      },

      {
        id: "knn-irrelevant-features",
        title: "Effect of Irrelevant Features",

        explanation: [
          "Every feature participating in the distance calculation can influence which observations are considered neighbors.",
          "An irrelevant feature adds distance variation without adding useful target information.",
          "With many irrelevant features, meaningful similarity can become obscured.",
          "Feature selection can therefore be especially valuable for KNN.",
        ],

        intuition: [
          "If similarity is measured using many meaningless properties, genuinely similar observations may stop looking close.",
        ],

        importantPoints: [
          "Irrelevant features distort distance.",
          "KNN can benefit from feature selection.",
          "More features are not automatically better.",
        ],
      },

      {
        id: "knn-missing-values",
        title: "Missing Values",

        explanation: [
          "Standard distance calculations generally require usable feature values.",
          "Missing values therefore need deliberate treatment unless the selected implementation and metric explicitly support them.",
          "Imputation should be fitted using training data only.",
          "The imputation strategy can change distances and therefore change neighborhoods.",
          "A leakage-safe Pipeline is useful when combining imputation, scaling and KNN.",
        ],

        intuition: [
          "If a coordinate is missing, ordinary geometric distance cannot be interpreted normally until the missing information is handled.",
        ],

        importantPoints: [
          "Handle missing values deliberately.",
          "Imputation affects neighborhoods.",
          "Fit preprocessing on training data only.",
          "Pipeline helps prevent leakage.",
        ],
      },

      {
        id: "knn-categorical-features",
        title: "Categorical Features",

        explanation: [
          "Ordinary Euclidean distance is not naturally meaningful for arbitrary category labels.",
          "Encoding categories as integers does not automatically make numerical distances between those codes meaningful.",
          "The feature representation and distance metric should reflect actual category similarity.",
          "For mixed numerical and categorical data, specialized preprocessing or distance approaches may be necessary.",
        ],

        intuition: [
          "If red=0, blue=1 and green=2, it does not automatically mean green is twice as far from red as blue is.",
        ],

        importantPoints: [
          "Integer category codes can create false geometry.",
          "Representation must match the metric.",
          "Treat categorical similarity deliberately.",
        ],
      },

      {
        id: "knn-ties",
        title: "Ties and Ambiguous Neighborhoods",

        explanation: [
          "Classification neighborhoods can contain competing classes with similar support.",
          "Ties are especially possible for some choices of k and class structure.",
          "Estimator implementations use deterministic rules to resolve applicable ties, but relying on accidental tie behavior is poor model design.",
          "Using an appropriate k, distance weighting and validation can reduce sensitivity to ambiguous neighborhoods.",
        ],

        intuition: [
          "Sometimes the nearest neighborhood does not clearly agree on one class.",
        ],

        importantPoints: [
          "Ties can occur.",
          "Neighborhood design affects ambiguity.",
          "Distance weighting can change voting influence.",
          "Do not rely on arbitrary tie outcomes.",
        ],
      },

      {
        id: "knn-class-imbalance",
        title: "KNN and Class Imbalance",

        explanation: [
          "In an imbalanced dataset, majority-class observations can dominate local neighborhoods.",
          "A minority observation may therefore be surrounded by more majority examples simply because the majority class is much more common.",
          "Overall accuracy can hide poor minority-class performance.",
          "Distance weighting, resampling strategies, metric learning or alternative models may be considered depending on the problem.",
          "Evaluation should include class-sensitive metrics such as precision, recall, F1 score and the confusion matrix.",
        ],

        intuition: [
          "If one class fills most of the map, local voting can favor it even near important minority regions.",
        ],

        importantPoints: [
          "Class imbalance affects local voting.",
          "Accuracy alone may mislead.",
          "Inspect minority-class metrics.",
          "Validate mitigation strategies carefully.",
        ],
      },

      {
        id: "knn-training-complexity",
        title: "Training Complexity",

        explanation: [
          "KNN performs relatively little conventional model fitting.",
          "The estimator mainly validates, organizes and stores training observations.",
          "If KD-tree or Ball-tree search is used, building the search structure adds preprocessing cost.",
          "Compared with many optimization-based models, fitting can still be relatively inexpensive.",
        ],

        intuition: [
          "KNN saves much of its effort for later instead of learning a complex equation during fit.",
        ],

        importantPoints: [
          "Fit is often relatively cheap.",
          "Search structures may add construction cost.",
          "Low fitting cost does not imply low prediction cost.",
        ],
      },

      {
        id: "knn-prediction-complexity",
        title: "Prediction Complexity",

        explanation: [
          "Prediction requires finding nearest training observations for each query.",
          "With brute-force search, this can require distance calculations against many or all stored training observations.",
          "Prediction therefore becomes increasingly expensive as the training dataset grows.",
          "KD-tree and Ball-tree can accelerate queries in suitable settings.",
          "High dimensionality can reduce the effectiveness of such search structures.",
        ],

        intuition: [
          "Every new prediction requires searching the stored experience for the closest examples.",
        ],

        importantPoints: [
          "Prediction can be expensive.",
          "Cost grows with stored data.",
          "Search structures can help.",
          "High dimensionality remains challenging.",
        ],
      },

      {
        id: "knn-memory",
        title: "Memory Requirements",

        explanation: [
          "KNN needs access to training observations during prediction.",
          "Large training datasets can therefore require substantial memory.",
          "Search structures can introduce additional storage overhead.",
          "This differs from models that compress training information into a relatively small set of learned coefficients.",
        ],

        intuition: [
          "KNN remembers the examples instead of summarizing everything into a small formula.",
        ],

        importantPoints: [
          "Training data must remain available.",
          "Large datasets increase memory use.",
          "Search indexes can add memory overhead.",
        ],
      },

      {
        id: "knn-probabilities",
        title: "Class Probability Estimates",

        explanation: [
          "KNeighborsClassifier can estimate class probabilities from the selected neighborhood.",
          "With uniform weighting, probability estimates reflect the proportion of selected neighbors belonging to each class.",
          "With distance weighting, closer neighbors contribute more strongly.",
          "Small neighborhoods can produce coarse or unstable probability estimates.",
          "Probability calibration should be evaluated separately when reliable confidence estimates are important.",
        ],

        intuition: [
          "If four of five equally weighted neighbors belong to one class, the local neighborhood strongly supports that class.",
        ],

        importantPoints: [
          "Probabilities come from neighborhood class support.",
          "Weighting affects probabilities.",
          "Small k can create unstable confidence estimates.",
        ],
      },

      {
        id: "knn-regression-deep",
        title: "KNN Regression in Depth",

        explanation: [
          "KNeighborsRegressor predicts continuous numerical targets from nearby training observations.",
          "With uniform weights, the prediction is commonly the mean target value among the selected neighbors.",
          "With distance weighting, closer neighbors contribute more strongly to the predicted value.",
          "Small k can produce highly variable local predictions.",
          "Large k creates smoother regression functions.",
          "KNN regression generally predicts through local interpolation rather than learning a global equation.",
        ],

        intuition: [
          "To estimate the value for a new observation, inspect similar observations and average what happened to them.",
        ],

        importantPoints: [
          "Continuous-target prediction.",
          "Local averaging.",
          "Distance weighting is available.",
          "k controls smoothness.",
        ],
      },

      {
        id: "knn-regression-extrapolation",
        title: "KNN and Extrapolation",

        explanation: [
          "KNN regression is fundamentally based on observed neighboring targets.",
          "It is therefore generally weak at extrapolating far beyond regions represented in the training data.",
          "A query far outside the training distribution still receives predictions based on the nearest stored observations.",
          "Those observations may actually be very far away in absolute terms.",
          "Distance-to-neighbor diagnostics can therefore be useful for detecting unfamiliar queries.",
        ],

        intuition: [
          "KNN can interpolate among known neighborhoods, but it has no learned global trend telling it what should happen far beyond everything it has seen.",
        ],

        importantPoints: [
          "Strongly local model.",
          "Poor natural extrapolation.",
          "Out-of-distribution queries can still receive predictions.",
          "Neighbor distances can provide useful diagnostics.",
        ],
      },

      {
        id: "knn-preprocessing",
        title: "KNN Preprocessing Workflow",

        explanation: [
          "Split the dataset before fitting preprocessing transformations.",
          "Handle missing values using training-derived statistics when necessary.",
          "Encode features in a way that creates meaningful geometry.",
          "Scale numerical features so that units do not arbitrarily dominate distance.",
          "Consider feature selection or dimensionality reduction when many irrelevant dimensions exist.",
          "Use a Pipeline so preprocessing is repeated safely inside cross-validation.",
        ],

        intuition: [
          "Because KNN is built on geometry, preprocessing effectively defines the world in which the model measures similarity.",
        ],

        importantPoints: [
          "Split first.",
          "Impute safely.",
          "Represent categories meaningfully.",
          "Scale numerical features.",
          "Avoid leakage.",
        ],
      },

      {
        id: "knn-tuning",
        title: "KNN Tuning Strategy",

        explanation: [
          "Start with a leakage-safe preprocessing Pipeline.",
          "Tune n_neighbors across a reasonable range.",
          "Compare uniform and distance weighting.",
          "Compare meaningful distance metrics.",
          "When using Minkowski distance, consider appropriate p values.",
          "Treat algorithm and leaf_size primarily as computational tuning controls.",
          "Use cross-validation rather than the final test set for model selection.",
          "Evaluate both predictive quality and prediction-time cost.",
        ],

        intuition: [
          "Tune what defines the neighborhood first, then tune how efficiently the neighborhood is searched.",
        ],

        importantPoints: [
          "Tune n_neighbors.",
          "Tune weights.",
          "Validate metric choice.",
          "Tune p only when applicable.",
          "Separate statistical tuning from computational tuning.",
          "Keep the test set untouched.",
        ],
      },

      {
        id: "knn-validation-curve",
        title: "Validation Curve for k",

        explanation: [
          "Evaluating validation performance across different values of k reveals the bias-variance trade-off directly.",
          "Very small k may produce strong training performance but weaker validation performance.",
          "Increasing k can initially improve validation performance by reducing variance.",
          "Eventually, excessively large k can reduce validation performance because the model becomes too smooth.",
          "The best k is selected from validation behavior rather than from training accuracy.",
        ],

        intuition: [
          "Move from very local neighborhoods toward broader neighborhoods and watch where generalization becomes strongest.",
        ],

        importantPoints: [
          "Use cross-validation.",
          "Small k may overfit.",
          "Large k may underfit.",
          "Choose based on validation performance.",
        ],
      },

      {
        id: "knn-failure-modes",
        title: "KNN Failure Modes",

        explanation: [
          "Unscaled features can cause one numerical feature to dominate distance.",
          "Too-small k can make predictions highly sensitive to noise.",
          "Too-large k can erase meaningful local structure.",
          "Irrelevant features can corrupt neighborhood relationships.",
          "High dimensionality can make distances less informative.",
          "Class imbalance can distort local voting.",
          "Large datasets can make prediction and memory usage expensive.",
          "Poor feature representation can make the selected metric meaningless.",
        ],

        intuition: [
          "When KNN fails, inspect the geometry before blaming the voting rule.",
        ],

        importantPoints: [
          "Check scaling.",
          "Check k.",
          "Check metric.",
          "Check irrelevant dimensions.",
          "Check class imbalance.",
          "Check computational feasibility.",
        ],
      },

      {
        id: "knn-vs-logistic",
        title: "KNN vs Logistic Regression",

        explanation: [
          "Logistic Regression learns a global parametric decision function.",
          "KNN produces predictions from local training neighborhoods.",
          "Logistic Regression can generalize using learned coefficients without storing every training observation for ordinary prediction.",
          "KNN retains training observations.",
          "KNN can naturally represent highly irregular local boundaries when sufficient data exists.",
          "Logistic Regression is often computationally cheaper at prediction time.",
        ],

        intuition: [
          "Logistic Regression learns one global rule; KNN asks nearby examples each time.",
        ],

        importantPoints: [
          "Global parametric versus local instance-based.",
          "Different prediction costs.",
          "Different memory requirements.",
          "Both benefit from appropriate scaling.",
        ],
      },

      {
        id: "knn-vs-tree",
        title: "KNN vs Decision Tree",

        explanation: [
          "KNN defines predictions through geometric neighborhoods.",
          "Decision Trees define predictions through recursive threshold rules.",
          "KNN is highly sensitive to feature scaling.",
          "Ordinary Decision Trees generally do not require feature scaling for split selection.",
          "Trees learn a structured model during fitting, whereas KNN retains training observations for prediction.",
        ],

        intuition: [
          "KNN asks who lives nearby; a tree asks a sequence of learned yes-or-no questions.",
        ],

        importantPoints: [
          "KNN is distance-based.",
          "Tree is rule-based.",
          "Scaling requirements differ.",
          "Prediction behavior differs.",
        ],
      },

      {
        id: "knn-vs-svm",
        title: "KNN vs SVM",

        explanation: [
          "Both KNN and SVM can depend strongly on feature geometry and therefore often require scaling.",
          "KNN predicts directly from neighboring observations.",
          "SVM learns a margin-based decision function determined especially by support vectors.",
          "KNN training is relatively lightweight but prediction can be expensive.",
          "SVM performs substantial optimization during training.",
          "Kernel SVM and KNN can both produce nonlinear boundaries through very different mechanisms.",
        ],

        intuition: [
          "KNN keeps asking the neighborhood; SVM learns where the separating boundary should be.",
        ],

        importantPoints: [
          "Both are geometry-sensitive.",
          "Both usually benefit from scaling.",
          "Training and prediction costs differ.",
          "Their nonlinear mechanisms differ.",
        ],
      },

      {
        id: "knn-real-world",
        title: "Real-World Applications",

        explanation: [
          "KNN can be useful for similarity-based classification, local regression, simple recommendation-style reasoning, pattern recognition and anomaly-oriented neighborhood analysis.",
          "It is especially valuable as an educational model because its predictions can be explained directly through nearby examples.",
          "Its practical usefulness depends on dataset size, feature dimensionality and whether distance is genuinely meaningful.",
        ],

        intuition: [
          "KNN works best when similar cases really should have similar outcomes.",
        ],

        importantPoints: [
          "Similarity-based prediction.",
          "Classification and regression.",
          "Easy local explanations.",
          "Best when feature-space distance is meaningful.",
        ],
      },

      {
        id: "knn-exam-interview",
        title: "KNN: Exam and Interview Essentials",

        explanation: [
          "Explain why KNN is called a lazy learner.",
          "Explain classification and regression KNN.",
          "Know Euclidean, Manhattan and Minkowski distance.",
          "Explain the role of k.",
          "Explain the bias-variance effect of changing k.",
          "Explain uniform versus distance weighting.",
          "Explain why scaling is critical.",
          "Explain the curse of dimensionality.",
          "Know n_neighbors, weights, algorithm, leaf_size, p, metric, metric_params and n_jobs.",
          "Explain brute-force, KD-tree and Ball-tree search conceptually.",
          "Explain why KNN has low fitting cost but potentially expensive prediction.",
          "Explain why irrelevant features can damage KNN.",
          "Explain why KNN regression is poor at natural extrapolation.",
        ],

        intuition: [
          "A strong KNN answer connects distance, neighborhood size, scaling and dimensionality instead of treating k as the only important idea.",
        ],

        importantPoints: [
          "Lazy learning.",
          "Distance metrics.",
          "k.",
          "Bias-variance.",
          "Scaling.",
          "Weighting.",
          "Curse of dimensionality.",
          "Neighbor-search algorithms.",
          "Computational cost.",
        ],
      },
    ],

    visualization: {
      type: "model-lab",
      visualizationId: "knn",
      title: "KNN Model Lab",
      description:
        "Connect later to the existing ModelMind KNN Lab to explore neighbors, k, scaling and decision boundaries.",
    },

    codeExamples: [
      {
        id: "knn-code",
        title: "KNN with Scaling",
        description:
          "Train KNN correctly using StandardScaler inside a Pipeline.",
        language: "python",

        code: `from sklearn.datasets import load_iris
from sklearn.metrics import (
    accuracy_score,
    classification_report
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_iris(
    return_X_y=True
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

model = Pipeline([
    (
        "scaler",
        StandardScaler()
    ),
    (
        "knn",
        KNeighborsClassifier(
            n_neighbors=5
        )
    )
])

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

print(
    "Accuracy:",
    accuracy_score(
        y_test,
        predictions
    )
)

print(
    classification_report(
        y_test,
        predictions
    )
)`,

        explanation: [
          "StandardScaler prevents large-scale features from dominating distance.",
          "n_neighbors=5 means five nearby training observations participate in prediction.",
          "The Pipeline ensures scaling is learned only from training data.",
        ],

        commonMistakes: [
          "Using raw features with drastically different scales.",
          "Selecting k using test performance.",
          "Assuming larger k is always better.",
          "Ignoring prediction-time cost.",
        ],
      },
    ],

    practice: [
      {
        id: "knn-practice-1",
        title: "Meaning of k",
        type: "concept",
        difficulty: "basic",
        question:
          "What does k represent in KNN classification?",
        instructions: [
          "Think about the neighborhood used for prediction.",
        ],
        hints: [
          "It determines how many nearby training observations vote.",
        ],
        explanation:
          "k is the number of nearest training observations considered when making the prediction.",
      },

      {
        id: "knn-practice-2",
        title: "Majority Vote",
        type: "concept",
        difficulty: "basic",
        question:
          "For k=5, the neighbor labels are [1, 1, 0, 1, 0]. What is the ordinary majority-vote prediction?",
        instructions: [
          "Count labels.",
        ],
        hints: [
          "Class 1 appears three times.",
        ],
        explanation:
          "The prediction is class 1.",
      },

      {
        id: "knn-practice-3",
        title: "Scaling",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why should age and annual income often be scaled before KNN?",
        instructions: [
          "Compare numerical ranges.",
        ],
        hints: [
          "Income may have a much larger numerical magnitude.",
        ],
        explanation:
          "Without scaling, income can dominate distance simply because its numerical values are much larger.",
      },

      {
        id: "knn-practice-4",
        title: "Small k",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can k=1 produce a high-variance classifier?",
        instructions: [
          "Consider sensitivity to individual training observations.",
        ],
        hints: [
          "One noisy neighbor can determine the entire prediction.",
        ],
        explanation:
          "Predictions depend on a single training example, making the boundary highly sensitive to noise and sample variation.",
      },

      {
        id: "knn-practice-5",
        title: "Curse of Dimensionality",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can KNN become less effective when many irrelevant dimensions are added?",
        instructions: [
          "Think about how distances behave in high-dimensional spaces.",
        ],
        hints: [
          "Points can become less meaningfully separated by distance.",
        ],
        explanation:
          "In high-dimensional spaces, distances can become less discriminative and irrelevant dimensions can distort neighborhood relationships.",
      },
    ],

    keyTakeaways: [
      "KNN predicts using nearby training observations.",
      "Distance determines similarity.",
      "k controls the size of the neighborhood.",
      "Small k can produce high variance.",
      "Large k can produce excessive smoothing.",
      "Feature scaling is extremely important.",
      "Prediction can be computationally expensive.",
    ],
  },


  // =========================================================
  // NAIVE BAYES
  // No existing ModelMind lab — ROADMAP-NATIVE LAB
  // =========================================================

  "naive-bayes": {
    overview:
      "Naive Bayes is a family of probabilistic classifiers based on Bayes' theorem. It combines prior class probabilities with evidence from features and makes a simplifying conditional-independence assumption. Despite this strong assumption, Naive Bayes can perform remarkably well, especially for text classification and high-dimensional sparse data.",

    objectives: [
      "Understand conditional probability.",
      "Understand Bayes' theorem.",
      "Understand prior, likelihood and posterior probability.",
      "Understand the Naive Bayes independence assumption.",
      "Understand Gaussian Naive Bayes.",
      "Understand Multinomial Naive Bayes.",
      "Understand Bernoulli Naive Bayes.",
      "Understand smoothing.",
      "Train Naive Bayes using sklearn.",
    ],

    sections: [
      {
        id: "nb-bayes",
        title: "Bayes' Theorem",

        explanation: [
          "Bayes' theorem updates the probability of a hypothesis after observing evidence.",
          "It can be written as P(C|X) = P(X|C)P(C) / P(X).",
          "P(C) is the prior probability of class C.",
          "P(X|C) is the likelihood of observing features X given class C.",
          "P(C|X) is the posterior probability after observing X.",
        ],

        intuition: [
          "Start with what you believed about a class before seeing the features, then update that belief according to how compatible the observed evidence is with that class.",
        ],

        importantPoints: [
          "Prior represents initial class belief.",
          "Likelihood measures compatibility of evidence with a class.",
          "Posterior represents updated belief.",
        ],
      },

      {
        id: "nb-naive",
        title: "The Naive Assumption",

        explanation: [
          "Calculating a full joint feature likelihood can be difficult.",
          "Naive Bayes assumes features are conditionally independent given the class.",
          "This allows the joint likelihood to be represented as a product of individual feature likelihoods.",
          "The assumption is often unrealistic, but the classifier can still work well.",
        ],

        intuition: [
          "The model acts as though each feature contributes evidence independently once the class is known.",
        ],

        importantPoints: [
          "The assumption is conditional independence.",
          "It greatly simplifies probability estimation.",
          "The assumption does not need to be perfectly true for useful classification.",
        ],
      },

      {
        id: "nb-types",
        title: "Major Naive Bayes Variants",

        explanation: [
          "GaussianNB is commonly used when continuous features are modeled using class-conditional Gaussian distributions.",
          "MultinomialNB is widely used with count-like non-negative features such as word counts.",
          "BernoulliNB is useful for binary feature representations such as word-present or word-absent indicators.",
          "The variant should match the feature representation.",
        ],

        intuition: [
          "The Bayes framework remains similar, but different variants make different assumptions about how feature values are generated.",
        ],

        importantPoints: [
          "GaussianNB: continuous Gaussian-like feature modeling.",
          "MultinomialNB: count-based features.",
          "BernoulliNB: binary features.",
        ],
      },

      {
        id: "nb-zero-frequency",
        title: "Zero-Frequency Problem and Smoothing",

        explanation: [
          "If a category or word never appears with a class in training data, its estimated probability can become zero.",
          "Because Naive Bayes multiplies likelihood terms, one zero can make the complete product zero.",
          "Additive smoothing, such as Laplace smoothing, prevents these exact zero estimates.",
          "The alpha parameter controls smoothing in models such as MultinomialNB.",
        ],

        intuition: [
          "A word that was absent from a small training sample should not necessarily make a class mathematically impossible.",
        ],

        importantPoints: [
          "Zero probabilities can dominate probability products.",
          "Smoothing assigns some probability mass to unseen events.",
          "alpha commonly controls additive smoothing.",
        ],
      },

      {
        id: "nb-text",
        title: "Why Naive Bayes Works Well for Text",

        explanation: [
          "Text representations often contain thousands of sparse word features.",
          "Naive Bayes can train and predict efficiently in such high-dimensional spaces.",
          "Word-frequency patterns can provide strong class evidence even when independence assumptions are imperfect.",
          "MultinomialNB is therefore a common baseline for document and spam classification.",
        ],

        intuition: [
          "Certain words can provide strong evidence for a topic or class even if the model simplifies relationships among words.",
        ],

        importantPoints: [
          "Fast training.",
          "Works naturally with sparse representations.",
          "Strong baseline for many text problems.",
        ],
      },
            {
        id: "nb-probability-foundation",
        title: "Probability Foundation for Naive Bayes",

        explanation: [
          "Naive Bayes is easier to understand when probability is viewed as a way of representing uncertainty.",
          "A probability ranges from 0 to 1, where values closer to 1 indicate stronger belief in an event under the probability model.",
          "Joint probability describes two events occurring together.",
          "Conditional probability describes the probability of one event when another event is already known.",
          "Naive Bayes classification is fundamentally a conditional-probability problem because we want the probability of a class after observing feature values.",
          "For example, spam classification asks for the probability that an email is spam given the words observed in that email.",
        ],

        intuition: [
          "Before seeing the features, we have an initial belief about the class.",
          "After seeing the features, we update that belief.",
          "Naive Bayes is therefore a structured belief-updating classifier.",
        ],

        importantPoints: [
          "Probability represents uncertainty.",
          "Conditional probability is central to classification.",
          "Naive Bayes predicts classes after observing evidence.",
          "Bayes' theorem reverses useful conditional relationships.",
        ],
      },

      {
        id: "nb-prior-likelihood-evidence-posterior",
        title: "Prior, Likelihood, Evidence and Posterior",

        explanation: [
          "The prior P(C) represents belief in class C before considering the current feature vector.",
          "The likelihood P(X|C) measures how compatible the observed features X are with class C.",
          "The evidence P(X) represents the overall probability of observing X across possible classes.",
          "The posterior P(C|X) represents the updated probability of class C after observing X.",
          "Bayes' theorem combines these quantities to update class belief.",
          "For classification, the evidence is identical across candidate classes for a fixed observation, so class comparison can often be based on the numerator P(X|C)P(C).",
        ],

        intuition: [
          "Prior = what did I believe before seeing this example?",
          "Likelihood = how well does this example fit this class?",
          "Evidence = how likely is this observation overall?",
          "Posterior = what should I believe after seeing the example?",
        ],

        importantPoints: [
          "Prior comes before the current evidence.",
          "Likelihood is not the same as posterior.",
          "Posterior combines prior belief and observed evidence.",
          "The evidence normalizes posterior probabilities.",
        ],
      },

      {
        id: "nb-bayes-classification",
        title: "How Bayes' Theorem Becomes a Classifier",

        explanation: [
          "Suppose there are several possible classes C1, C2, ..., Ck.",
          "For a new feature vector X, Naive Bayes evaluates the posterior probability associated with each class.",
          "The predicted class is usually the class with the largest posterior probability.",
          "Because P(X) is common to every candidate class for the same observation, it does not change which class has the maximum posterior.",
          "The classifier can therefore compare quantities proportional to P(C)P(X|C).",
          "The naive independence assumption then makes P(X|C) much easier to estimate.",
        ],

        intuition: [
          "Each class competes by combining two things: how common the class already is and how strongly the observed features support it.",
        ],

        importantPoints: [
          "Calculate a score for each candidate class.",
          "Compare posterior probabilities or equivalent proportional scores.",
          "Choose the class with the largest score.",
          "The denominator can be ignored when only the winning class is required.",
        ],
      },

      {
        id: "nb-conditional-independence-deep",
        title: "Conditional Independence in Depth",

        explanation: [
          "The word naive refers to the assumption that features are conditionally independent given the class.",
          "If X1 and X2 are conditionally independent given C, knowing X1 provides no additional information about X2 once C is already known under the model.",
          "With this assumption, a difficult joint likelihood can be decomposed into a product of individual feature likelihoods.",
          "For features X1 through Xn, the class score becomes proportional to P(C) multiplied by P(X1|C), P(X2|C), and so on.",
          "Real features are often correlated, so this assumption is frequently imperfect.",
          "Nevertheless, accurate classification can still occur because obtaining the correct class ranking does not require every probability estimate to be a perfect description of reality.",
        ],

        intuition: [
          "Imagine every feature independently casting a vote of probabilistic evidence after the class has been proposed.",
          "The assumption is simplistic, but the combined votes can still distinguish classes effectively.",
        ],

        importantPoints: [
          "The assumption is conditional independence, not unconditional independence.",
          "Feature dependence does not automatically make Naive Bayes useless.",
          "The assumption makes estimation dramatically simpler.",
          "Highly duplicated or redundant evidence can sometimes distort confidence.",
        ],
      },

      {
        id: "nb-log-probabilities",
        title: "Why Naive Bayes Uses Log Probabilities",

        explanation: [
          "Naive Bayes may multiply many small probabilities together.",
          "When hundreds or thousands of features are involved, the resulting product can become extremely close to zero.",
          "Finite-precision computers can then suffer numerical underflow.",
          "Taking logarithms converts products into sums.",
          "Instead of multiplying many likelihood terms, implementations can add their logarithms.",
          "Because the logarithm is monotonic, maximizing a probability product and maximizing its log value produce the same class ordering.",
        ],

        intuition: [
          "Multiplying thousands of tiny numbers is numerically fragile.",
          "Adding their log probabilities is much more stable.",
        ],

        importantPoints: [
          "Log probabilities improve numerical stability.",
          "Products become sums.",
          "The predicted maximum class is preserved.",
          "Log-space computation is common in probabilistic machine learning.",
        ],
      },

      {
        id: "nb-gaussian",
        title: "Gaussian Naive Bayes in Depth",

        explanation: [
          "GaussianNB is designed for continuous numerical features.",
          "For every class and every feature, the model estimates a mean and variance from the training observations belonging to that class.",
          "It models the class-conditional feature distribution using a Gaussian distribution.",
          "During prediction, an observed feature value receives a likelihood according to the Gaussian distribution estimated for each candidate class.",
          "The feature likelihoods are then combined with the class prior under the Naive Bayes assumption.",
          "GaussianNB does not require the complete dataset to be globally Gaussian. Its modeling assumption concerns each feature's class-conditional distribution.",
        ],

        intuition: [
          "For every class, imagine a bell curve for each numerical feature.",
          "A new value receives stronger evidence for classes whose bell curves consider that value more plausible.",
        ],

        importantPoints: [
          "Best suited to continuous numerical features when the Gaussian assumption is reasonable.",
          "Estimates class-specific means and variances.",
          "Does not use the alpha smoothing parameter from MultinomialNB.",
          "Check class-conditional feature behavior rather than blindly assuming Gaussianity.",
        ],
      },

      {
        id: "nb-gaussian-parameters",
        title: "GaussianNB Parameters",

        explanation: [
          "GaussianNB has its own estimator-specific controls and they should not be mixed with parameters belonging to other Naive Bayes variants.",
          "priors can be used to explicitly provide prior probabilities for the classes.",
          "If priors are not provided, class priors are learned from the training data.",
          "var_smoothing adds a small stability term derived from the largest feature variance to the estimated variances.",
          "This helps prevent numerical problems when a feature variance is extremely small.",
        ],

        intuition: [
          "priors control how much belief each class receives before the current features are considered.",
          "var_smoothing protects Gaussian probability calculations from unstable near-zero variance estimates.",
        ],

        importantPoints: [
          "GaussianNB: priors.",
          "GaussianNB: var_smoothing.",
          "alpha is not a GaussianNB parameter.",
          "Do not mix MultinomialNB smoothing controls into GaussianNB.",
        ],
      },

      {
        id: "nb-multinomial",
        title: "Multinomial Naive Bayes in Depth",

        explanation: [
          "MultinomialNB is commonly used for discrete non-negative count-like features.",
          "A classic example is document classification where each feature represents how many times a word occurs.",
          "It is also commonly used with non-negative TF-IDF representations in practical text-classification pipelines.",
          "The model estimates how strongly different feature counts are associated with each class.",
          "Additive smoothing prevents unseen feature-class combinations from receiving exact zero probability.",
          "MultinomialNB is not intended for arbitrary negative-valued features.",
        ],

        intuition: [
          "For each class, imagine learning which words or count-based events tend to occur frequently.",
          "A new document is classified according to how strongly its observed counts resemble the learned class-specific patterns.",
        ],

        importantPoints: [
          "Designed for non-negative count-like features.",
          "Very common in text classification.",
          "Uses additive smoothing.",
          "Negative arbitrary feature values are inappropriate.",
        ],
      },

      {
        id: "nb-multinomial-parameters",
        title: "MultinomialNB Parameters",

        explanation: [
          "alpha controls additive smoothing.",
          "A larger alpha generally applies stronger smoothing and reduces the influence of rare count patterns.",
          "fit_prior controls whether class prior probabilities are learned from the data.",
          "class_prior can explicitly specify class prior probabilities.",
          "force_alpha controls how very small alpha values are handled in current sklearn implementations.",
          "These parameters belong to MultinomialNB and should not automatically be applied to GaussianNB or every other variant.",
        ],

        intuition: [
          "alpha determines how strongly the model avoids trusting raw zero or extremely rare count observations.",
        ],

        importantPoints: [
          "MultinomialNB: alpha.",
          "MultinomialNB: fit_prior.",
          "MultinomialNB: class_prior.",
          "MultinomialNB: force_alpha.",
          "Tune smoothing with validation rather than assuming one value is universally optimal.",
        ],
      },

      {
        id: "nb-bernoulli",
        title: "Bernoulli Naive Bayes in Depth",

        explanation: [
          "BernoulliNB models binary-valued features.",
          "In text classification, a feature may represent whether a word is present rather than how many times it appears.",
          "This makes absence as well as presence potentially informative.",
          "Continuous or count data can optionally be converted into binary features using a threshold.",
          "BernoulliNB can therefore behave differently from MultinomialNB even when both are used for text.",
        ],

        intuition: [
          "MultinomialNB asks how much of each feature occurred.",
          "BernoulliNB asks whether each feature occurred.",
        ],

        importantPoints: [
          "Designed for binary feature events.",
          "Presence and absence can both influence classification.",
          "Useful for binary document representations.",
          "Do not treat it as identical to MultinomialNB.",
        ],
      },

      {
        id: "nb-bernoulli-parameters",
        title: "BernoulliNB Parameters",

        explanation: [
          "alpha controls additive smoothing for the Bernoulli probability estimates.",
          "binarize specifies the threshold used to convert input features into binary values when automatic binarization is desired.",
          "Setting binarize appropriately depends on whether the input has already been converted into binary features.",
          "fit_prior determines whether class prior probabilities are learned.",
          "class_prior can provide explicit class priors.",
          "force_alpha controls handling of extremely small alpha values in current sklearn implementations.",
        ],

        intuition: [
          "binarize determines the boundary between feature absence and feature presence.",
          "alpha stabilizes probability estimates when some binary events are rare or unseen.",
        ],

        importantPoints: [
          "BernoulliNB: alpha.",
          "BernoulliNB: binarize.",
          "BernoulliNB: fit_prior.",
          "BernoulliNB: class_prior.",
          "BernoulliNB: force_alpha.",
        ],
      },

      {
        id: "nb-complement",
        title: "Complement Naive Bayes",

        explanation: [
          "ComplementNB was designed particularly to address weaknesses of standard Multinomial Naive Bayes on imbalanced text-classification problems.",
          "Instead of estimating feature weights primarily from observations inside a target class, it uses statistics from the complement of that class.",
          "This can produce more balanced feature weights when some classes contain substantially fewer training examples.",
          "ComplementNB still expects non-negative feature representations.",
          "It is especially relevant to document and text classification.",
        ],

        intuition: [
          "Instead of only asking what characterizes this class, ComplementNB also learns from what characterizes everything outside this class.",
        ],

        importantPoints: [
          "Useful particularly for imbalanced text-style classification.",
          "Uses complement-class statistics.",
          "Requires non-negative features.",
          "It is related to MultinomialNB but is not the same estimator.",
        ],
      },

      {
        id: "nb-complement-parameters",
        title: "ComplementNB Parameters",

        explanation: [
          "alpha controls additive smoothing.",
          "fit_prior and class_prior control class-prior behavior.",
          "norm controls whether the learned complement weights are normalized using the second normalization described by the Complement Naive Bayes algorithm.",
          "force_alpha controls handling of extremely small alpha values in current sklearn implementations.",
          "norm is specific to ComplementNB among the commonly used sklearn Naive Bayes variants discussed here.",
        ],

        intuition: [
          "alpha stabilizes counts, while norm changes how complement-derived weights are normalized.",
        ],

        importantPoints: [
          "ComplementNB: alpha.",
          "ComplementNB: fit_prior.",
          "ComplementNB: class_prior.",
          "ComplementNB: norm.",
          "ComplementNB: force_alpha.",
        ],
      },

      {
        id: "nb-categorical",
        title: "Categorical Naive Bayes",

        explanation: [
          "CategoricalNB is designed for features that represent discrete categories.",
          "Each feature is modeled using a categorical distribution conditioned on the class.",
          "For example, a feature may encode weather as one of several discrete categories.",
          "The categories are represented numerically for the estimator, but the numbers represent category identities rather than continuous magnitudes.",
          "CategoricalNB is different from GaussianNB because category codes should not be interpreted as points on a continuous Gaussian scale.",
        ],

        intuition: [
          "For each class, the model learns how frequently each category of each feature occurs.",
        ],

        importantPoints: [
          "Designed for discrete categorical features.",
          "Category values are identities, not continuous measurements.",
          "Categorical encoding must be compatible with estimator requirements.",
          "Do not automatically use GaussianNB just because categories have been encoded as integers.",
        ],
      },

      {
        id: "nb-categorical-parameters",
        title: "CategoricalNB Parameters",

        explanation: [
          "alpha controls additive smoothing for category probabilities.",
          "fit_prior determines whether class priors are learned.",
          "class_prior can explicitly provide class prior probabilities.",
          "min_categories can specify the minimum number of categories expected for each feature.",
          "force_alpha controls handling of very small alpha values in current sklearn implementations.",
          "min_categories is particularly relevant to CategoricalNB and should not be treated as a universal Naive Bayes parameter.",
        ],

        intuition: [
          "min_categories communicates the expected category capacity of features, while alpha prevents unseen category-class combinations from becoming impossible.",
        ],

        importantPoints: [
          "CategoricalNB: alpha.",
          "CategoricalNB: fit_prior.",
          "CategoricalNB: class_prior.",
          "CategoricalNB: min_categories.",
          "CategoricalNB: force_alpha.",
        ],
      },

      {
        id: "nb-variant-selection",
        title: "Choosing the Correct Naive Bayes Variant",

        explanation: [
          "The correct variant depends primarily on how the features are represented.",
          "GaussianNB is a natural candidate for continuous numerical features whose class-conditional distributions are reasonably compatible with Gaussian modeling.",
          "MultinomialNB is suited to non-negative counts and count-like text representations.",
          "BernoulliNB is suited to binary event features.",
          "ComplementNB is particularly useful for non-negative text-style data when class imbalance is important.",
          "CategoricalNB is intended for discrete categorical features.",
          "Variant selection should therefore happen after understanding feature semantics rather than simply trying every estimator blindly.",
        ],

        intuition: [
          "Do not ask 'Which Naive Bayes model is best?' before asking 'What kind of data does each feature represent?'",
        ],

        importantPoints: [
          "Continuous numerical -> consider GaussianNB.",
          "Non-negative counts -> consider MultinomialNB.",
          "Binary events -> consider BernoulliNB.",
          "Imbalanced non-negative text -> consider ComplementNB.",
          "Discrete categories -> consider CategoricalNB.",
        ],
      },

      {
        id: "nb-preprocessing",
        title: "Preprocessing for Naive Bayes",

        explanation: [
          "Preprocessing requirements depend on the selected Naive Bayes variant.",
          "GaussianNB works directly with continuous numerical features.",
          "MultinomialNB and ComplementNB require non-negative feature values.",
          "BernoulliNB expects binary features or applies a binarization threshold when configured to do so.",
          "CategoricalNB expects appropriately encoded discrete categories.",
          "For text problems, CountVectorizer or TF-IDF representations are commonly paired with suitable Naive Bayes variants.",
          "Preprocessing must be fitted using training data only to avoid leakage.",
        ],

        intuition: [
          "Naive Bayes is not one probability model for every possible feature type. The feature representation must match the probability distribution assumed by the chosen variant.",
        ],

        importantPoints: [
          "Match preprocessing to the variant.",
          "Multinomial and Complement inputs must remain non-negative.",
          "Bernoulli representations are binary.",
          "Categorical values require compatible discrete encoding.",
          "Prevent preprocessing leakage.",
        ],
      },

      {
        id: "nb-smoothing-deep",
        title: "Laplace and Additive Smoothing in Depth",

        explanation: [
          "Without smoothing, an unseen discrete feature-class combination may receive probability zero.",
          "Multiplying by that zero can eliminate the entire class likelihood.",
          "Additive smoothing adds a small pseudo-count before probability normalization.",
          "Laplace smoothing commonly refers to additive smoothing with alpha equal to 1.",
          "Values other than 1 produce more general additive smoothing.",
          "Very strong smoothing can wash out meaningful differences between feature frequencies, while insufficient smoothing can leave estimates overly sensitive to sparse counts.",
        ],

        intuition: [
          "Smoothing says that not observing an event in a finite training sample does not prove that the event is impossible.",
        ],

        importantPoints: [
          "Laplace smoothing is a special case of additive smoothing.",
          "alpha controls smoothing strength in applicable variants.",
          "Too little smoothing can make estimates fragile.",
          "Too much smoothing can reduce useful distinctions.",
        ],
      },

      {
        id: "nb-evaluation",
        title: "Evaluating Naive Bayes",

        explanation: [
          "Accuracy can be useful when class frequencies and error costs are reasonably balanced.",
          "For imbalanced classification, precision, recall, F1 score and the confusion matrix can reveal behavior hidden by accuracy.",
          "Probability-based metrics may also matter when posterior estimates are used for downstream decisions.",
          "Naive Bayes can sometimes produce probabilities that are more extreme than warranted because correlated features may contribute duplicated evidence.",
          "Probability calibration should therefore be evaluated when reliable probability estimates are important.",
        ],

        intuition: [
          "A classifier can choose useful classes even when its probability confidence is imperfect.",
        ],

        importantPoints: [
          "Use metrics appropriate to the problem.",
          "Inspect per-class behavior for imbalance.",
          "Classification quality and probability calibration are different properties.",
          "Do not judge every Naive Bayes problem using accuracy alone.",
        ],
      },

      {
        id: "nb-failure-modes",
        title: "Failure Modes and Diagnosis",

        explanation: [
          "Performance can suffer when the selected Naive Bayes variant does not match the feature representation.",
          "Strongly dependent or duplicated features can cause evidence to be effectively counted multiple times.",
          "Very small training datasets can produce unstable probability estimates.",
          "Insufficient smoothing can make rare discrete events overly influential.",
          "Excessive smoothing can remove useful class-specific distinctions.",
          "Severe distribution shift can make learned priors and likelihoods unrepresentative of future data.",
          "Poor probability calibration can matter even when classification accuracy appears acceptable.",
        ],

        intuition: [
          "When Naive Bayes performs poorly, first inspect the probability assumptions and feature representation rather than immediately treating the algorithm as broken.",
        ],

        importantPoints: [
          "Check the selected variant.",
          "Check feature semantics.",
          "Check correlated or duplicated evidence.",
          "Check smoothing.",
          "Check class imbalance.",
          "Check probability calibration when probabilities matter.",
        ],
      },

      {
        id: "nb-comparison",
        title: "Naive Bayes Compared with Other Classifiers",

        explanation: [
          "Naive Bayes is usually extremely fast to train and predict.",
          "Logistic Regression directly learns a discriminative decision function, whereas Naive Bayes models class priors and class-conditional feature distributions.",
          "KNN relies on distances between observations and can become expensive at prediction time.",
          "Decision Trees learn recursive decision rules and can capture interactions without the Naive Bayes independence assumption.",
          "SVMs can create powerful maximum-margin boundaries but usually involve more optimization complexity.",
          "For high-dimensional sparse text, Naive Bayes remains an important lightweight baseline.",
        ],

        intuition: [
          "Naive Bayes wins through simple probability assumptions and efficient estimation rather than through highly flexible decision boundaries.",
        ],

        importantPoints: [
          "Very fast baseline.",
          "Especially attractive for text and sparse data.",
          "Simpler assumptions than many flexible classifiers.",
          "Compare models using validation rather than reputation.",
        ],
      },

      {
        id: "nb-real-world",
        title: "Real-World Naive Bayes Applications",

        explanation: [
          "Spam detection is a classic Naive Bayes application.",
          "Document and topic classification can use word-frequency evidence.",
          "Sentiment classification can use token features as probabilistic evidence.",
          "Simple support-ticket routing can classify messages into categories.",
          "Naive Bayes can also provide a fast baseline for numerical classification when GaussianNB assumptions are reasonable.",
        ],

        intuition: [
          "Naive Bayes is strongest when many individually useful pieces of evidence can be combined efficiently.",
        ],

        importantPoints: [
          "Spam filtering.",
          "Document classification.",
          "Sentiment analysis.",
          "Message routing.",
          "Fast probabilistic baselines.",
        ],
      },

      {
        id: "nb-exam-interview",
        title: "Naive Bayes: Exam and Interview Essentials",

        explanation: [
          "Be able to state Bayes' theorem and explain prior, likelihood, evidence and posterior.",
          "Explain why the algorithm is called naive.",
          "State that the key assumption is conditional independence of features given the class.",
          "Explain the zero-frequency problem and additive or Laplace smoothing.",
          "Know the difference between GaussianNB, MultinomialNB, BernoulliNB, ComplementNB and CategoricalNB.",
          "Explain why log probabilities are useful.",
          "Know why Naive Bayes is effective for many high-dimensional text problems.",
          "Understand that violating conditional independence does not automatically make the classifier useless.",
          "Be able to select a variant based on feature representation.",
        ],

        intuition: [
          "A strong Naive Bayes answer connects probability theory to the actual feature representation used by the classifier.",
        ],

        importantPoints: [
          "Bayes theorem.",
          "Prior, likelihood, evidence and posterior.",
          "Conditional independence.",
          "Variant selection.",
          "Smoothing.",
          "Log-space computation.",
          "Text classification.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "naive-bayes-probability-lab",
      title: "Naive Bayes Probability Lab",
      description:
        "Adjust priors and feature evidence to watch likelihoods combine into posterior class probabilities. Include a zero-frequency and Laplace-smoothing demonstration.",
    },

    codeExamples: [
      {
        id: "gaussian-nb-code",
        title: "Gaussian Naive Bayes",
        description:
          "Train a Gaussian Naive Bayes classifier on numerical features.",
        language: "python",

        code: `from sklearn.datasets import load_iris
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix
)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB

X, y = load_iris(
    return_X_y=True
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

model = GaussianNB()

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

probabilities = model.predict_proba(
    X_test
)

print(
    "Accuracy:",
    accuracy_score(
        y_test,
        predictions
    )
)

print(
    "Confusion matrix:"
)

print(
    confusion_matrix(
        y_test,
        predictions
    )
)

print(
    "First probability vector:",
    probabilities[0]
)`,

        explanation: [
          "GaussianNB estimates class-specific feature distributions.",
          "predict returns class labels.",
          "predict_proba returns posterior probability estimates for the classes.",
        ],

        commonMistakes: [
          "Using a Naive Bayes variant inappropriate for the feature representation.",
          "Assuming the independence assumption is literally true.",
          "Ignoring zero-frequency issues for discrete features.",
        ],
      },
    ],

    practice: [
      {
        id: "nb-practice-1",
        title: "Prior Probability",
        type: "concept",
        difficulty: "basic",
        question:
          "If 80 of 100 training emails are legitimate, what is the empirical prior probability of the legitimate class?",
        instructions: [
          "Divide the class count by the total.",
        ],
        hints: [
          "80 / 100.",
        ],
        explanation:
          "The empirical prior is 0.8.",
      },

      {
        id: "nb-practice-2",
        title: "Posterior Meaning",
        type: "concept",
        difficulty: "basic",
        question:
          "In P(Spam | Words), what does this probability represent?",
        instructions: [
          "Interpret the conditioning.",
        ],
        hints: [
          "It is the probability of the class after observing the words.",
        ],
        explanation:
          "It represents the posterior probability that the message is spam given the observed word features.",
      },

      {
        id: "nb-practice-3",
        title: "Why Naive?",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why is Naive Bayes called naive?",
        instructions: [
          "Identify its simplifying assumption.",
        ],
        hints: [
          "Consider relationships among features given the class.",
        ],
        explanation:
          "It makes the strong simplifying assumption that features are conditionally independent given the class.",
      },

      {
        id: "nb-practice-4",
        title: "Choose a Variant",
        type: "analysis",
        difficulty: "medium",
        question:
          "Which Naive Bayes variant is commonly appropriate for non-negative word-count features?",
        instructions: [
          "Think about document-term count matrices.",
        ],
        hints: [
          "The model's name relates to multinomial counts.",
        ],
        explanation:
          "Multinomial Naive Bayes is commonly used for word-count-like features.",
      },

      {
        id: "nb-practice-5",
        title: "Smoothing",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why is Laplace smoothing useful when a word never appeared with one class in the training data?",
        instructions: [
          "Consider what an estimated probability of zero does to a product.",
        ],
        hints: [
          "One zero likelihood can make the complete product zero.",
        ],
        explanation:
          "Smoothing prevents an unseen feature-class combination from receiving exact zero probability and eliminating the entire class posterior calculation.",
      },

      {
        id: "nb-practice-6",
        title: "Independence Violation",
        type: "analysis",
        difficulty: "advanced",
        question:
          "If two text features are strongly related, must Naive Bayes automatically fail?",
        instructions: [
          "Distinguish an assumption violation from guaranteed uselessness.",
        ],
        hints: [
          "Naive Bayes often works despite imperfect independence.",
        ],
        explanation:
          "No. The conditional-independence assumption can be violated while the classifier still provides useful decision boundaries and strong predictive performance.",
      },
    ],

    keyTakeaways: [
      "Naive Bayes is based on Bayes' theorem.",
      "It combines priors and feature likelihoods.",
      "Its key simplification is conditional feature independence.",
      "Gaussian, Multinomial and Bernoulli variants suit different representations.",
      "Smoothing prevents problematic zero probabilities.",
      "Naive Bayes is especially useful as a fast text-classification baseline.",
    ],
  },


  // =========================================================
  // DECISION TREE
  // Existing ModelMind lab — CONNECT LATER
  // =========================================================

  "decision-tree": {
    overview:
      "A Decision Tree predicts by recursively splitting the feature space into increasingly homogeneous regions. Trees are intuitive, can model nonlinear interactions and require relatively little preprocessing, but unrestricted trees can overfit heavily.",

    objectives: [
      "Understand recursive splitting.",
      "Understand nodes, branches and leaves.",
      "Understand impurity.",
      "Understand Gini impurity.",
      "Understand entropy.",
      "Understand information gain.",
      "Understand tree depth.",
      "Understand overfitting and pruning controls.",
      "Train DecisionTreeClassifier.",
      "Interpret tree predictions carefully.",
    ],

    sections: [
      {
        id: "tree-structure",
        title: "Tree Structure",

        explanation: [
          "The root node contains the initial training observations.",
          "Internal nodes contain feature-based decision rules.",
          "Branches represent outcomes of those decisions.",
          "Leaf nodes produce final predictions.",
          "Training recursively chooses splits that improve class separation according to a criterion.",
        ],

        intuition: [
          "A Decision Tree behaves like a sequence of learned if-else questions.",
        ],

        importantPoints: [
          "Root starts the tree.",
          "Internal nodes contain decisions.",
          "Leaves produce predictions.",
          "Paths represent decision rules.",
        ],
      },

      {
        id: "tree-gini",
        title: "Gini Impurity",

        explanation: [
          "Gini impurity measures class mixing within a node.",
          "For class probabilities p_k, Gini = 1 - sum(p_k²).",
          "A pure node containing only one class has Gini impurity 0.",
          "Training can choose splits that reduce weighted child impurity.",
        ],

        intuition: [
          "A node is pure when its observations overwhelmingly belong to one class.",
        ],

        importantPoints: [
          "Lower impurity means greater class purity.",
          "Pure node Gini is 0.",
          "Gini is a common sklearn classification criterion.",
        ],
      },

      {
        id: "tree-entropy",
        title: "Entropy and Information Gain",

        explanation: [
          "Entropy is another measure of class uncertainty.",
          "For class probabilities p_k, entropy = -sum(p_k log2(p_k)).",
          "A pure node has entropy 0.",
          "Information gain measures the reduction in uncertainty produced by a split.",
        ],

        intuition: [
          "A useful split produces children whose class labels are more predictable than those of the parent node.",
        ],

        importantPoints: [
          "Entropy measures uncertainty.",
          "Pure nodes have entropy 0.",
          "Information gain rewards reductions in uncertainty.",
        ],
      },

      {
        id: "tree-overfit",
        title: "Tree Depth and Overfitting",

        explanation: [
          "An unrestricted tree can repeatedly split until it memorizes small details in the training data.",
          "Deep trees generally have lower bias but higher variance.",
          "Parameters such as max_depth, min_samples_split and min_samples_leaf constrain tree complexity.",
          "These parameters should be selected using validation.",
        ],

        intuition: [
          "A huge decision tree can create a special rule for nearly every training example instead of learning reusable patterns.",
        ],

        importantPoints: [
          "Deep trees can overfit.",
          "Shallow trees can underfit.",
          "Complexity controls should be tuned.",
        ],
      },

      {
        id: "tree-scaling",
        title: "Do Trees Need Scaling?",

        explanation: [
          "Decision Trees choose threshold splits on individual features.",
          "A monotonic rescaling generally changes the numerical threshold but preserves the ordering of observations.",
          "Therefore standardization is usually not required for ordinary tree splitting.",
          "This differs from distance-based algorithms such as KNN.",
        ],

        intuition: [
          "Whether salary is represented in rupees or thousands of rupees, the relative ordering used to split observations remains the same.",
        ],

        importantPoints: [
          "Trees generally do not require StandardScaler.",
          "Scaling does not solve tree overfitting.",
          "Missing values and categorical representation still require deliberate handling depending on implementation.",
        ],
      },
            {
        id: "tree-learning-process",
        title: "How a Decision Tree Learns",

        explanation: [
          "A Decision Tree learns by recursively partitioning the training data.",
          "At a node, the algorithm considers candidate features and candidate split thresholds.",
          "Each candidate split divides the observations into child groups.",
          "The algorithm measures how much the split improves the selected objective.",
          "The best available split according to that objective is selected.",
          "The same process is then repeated independently inside the resulting child nodes.",
          "Recursive splitting continues until a stopping rule prevents additional growth.",
        ],

        intuition: [
          "Imagine playing twenty questions, except the tree learns which question should be asked at every step.",
          "A useful question separates observations into groups that are easier to predict.",
        ],

        importantPoints: [
          "Training is recursive.",
          "Candidate splits are evaluated.",
          "The best available split is selected greedily.",
          "Child nodes are split again.",
          "Stopping conditions control growth.",
        ],
      },

      {
        id: "tree-split-search",
        title: "How the Best Split Is Selected",

        explanation: [
          "For numerical features, a tree can evaluate thresholds that divide observations according to whether a feature value is below or above a candidate threshold.",
          "For every candidate split, the algorithm evaluates the quality of the resulting child nodes.",
          "Classification trees commonly measure reductions in impurity.",
          "Regression trees commonly measure reductions in prediction error or variance-related criteria.",
          "The selected split is locally optimal according to the tree's splitting criterion.",
          "Standard tree-building algorithms are greedy: they do not normally search every possible future tree structure before choosing the current split.",
        ],

        intuition: [
          "At every node, the tree asks: which available question gives me the most useful immediate separation?",
        ],

        importantPoints: [
          "Features and thresholds define candidate splits.",
          "Split quality depends on the criterion.",
          "Training is generally greedy.",
          "A locally best split does not guarantee a globally smallest or globally optimal tree.",
        ],
      },

      {
        id: "tree-weighted-impurity",
        title: "Weighted Child Impurity",

        explanation: [
          "A good classification split should produce child nodes that are purer than the parent.",
          "However, simply comparing child impurity values is not enough because the children may contain different numbers of observations.",
          "Tree algorithms therefore use a weighted combination of child impurities.",
          "A large child contributes more to the combined impurity than a very small child.",
          "The reduction from parent impurity to weighted child impurity measures the usefulness of the split.",
        ],

        intuition: [
          "A split should not look excellent merely because it creates one tiny pure group while leaving almost everyone else mixed.",
        ],

        importantPoints: [
          "Child impurity is weighted by child size.",
          "Useful splits reduce weighted impurity.",
          "Information gain and impurity reduction express closely related split-quality ideas.",
        ],
      },

      {
        id: "tree-gini-example",
        title: "Gini Impurity Step by Step",

        explanation: [
          "For classification, Gini impurity can be written as 1 - sum(p_k squared), where p_k is the proportion of class k in the node.",
          "Consider a binary node containing equal proportions of two classes.",
          "Its Gini impurity is 1 - (0.5 squared + 0.5 squared) = 0.5.",
          "If the node contains only one class, one class probability becomes 1 and the others become 0.",
          "The resulting Gini impurity becomes 0.",
          "A split is attractive when the weighted Gini impurity of the children is substantially below the parent's impurity.",
        ],

        intuition: [
          "Gini asks how mixed the labels are inside a node.",
          "Pure nodes have no class mixing.",
        ],

        importantPoints: [
          "Gini equals 0 for a pure node.",
          "Greater mixing produces greater impurity.",
          "Trees compare weighted impurity before and after splitting.",
        ],
      },

      {
        id: "tree-entropy-deep",
        title: "Entropy and Information Gain in Depth",

        explanation: [
          "Entropy measures uncertainty in the class distribution of a node.",
          "A pure node has zero entropy because its class outcome is completely certain within the training observations reaching that node.",
          "A mixed node has greater entropy.",
          "Information gain measures how much a candidate split reduces entropy.",
          "A split producing substantially purer children therefore has larger information gain.",
          "Gini and entropy often produce similar trees, although their mathematical definitions differ.",
        ],

        intuition: [
          "Entropy asks how surprised we should be about the class label inside a node.",
          "Information gain rewards questions that remove uncertainty.",
        ],

        importantPoints: [
          "Entropy measures uncertainty.",
          "Information gain measures uncertainty reduction.",
          "Pure nodes have entropy 0.",
          "Gini and entropy are different criteria with similar goals.",
        ],
      },

      {
        id: "tree-classification-regression",
        title: "Classification Trees vs Regression Trees",

        explanation: [
          "Decision Trees are not limited to classification.",
          "A classification tree predicts discrete class labels or class probabilities.",
          "Its splits are commonly selected using classification criteria such as Gini impurity or entropy-based criteria.",
          "A regression tree predicts continuous numerical targets.",
          "Regression splits use regression-specific objectives such as squared-error-based criteria.",
          "A regression leaf commonly predicts a value derived from the training targets reaching that leaf.",
          "The overall recursive partitioning idea remains the same.",
        ],

        intuition: [
          "Classification leaves answer 'which class?' while regression leaves answer 'what numerical value?'",
        ],

        importantPoints: [
          "DecisionTreeClassifier handles classification.",
          "DecisionTreeRegressor handles regression.",
          "Their split criteria differ.",
          "Both recursively partition feature space.",
        ],
      },

      {
        id: "tree-regression",
        title: "Decision Tree Regression",

        explanation: [
          "A regression tree divides the feature space into regions whose target values are relatively similar.",
          "Each leaf represents one region.",
          "Predictions are piecewise constant because observations reaching the same leaf generally receive the same leaf prediction.",
          "Deeper regression trees create smaller regions and more flexible prediction functions.",
          "Excessive depth can fit noise and produce high-variance predictions.",
        ],

        intuition: [
          "Imagine dividing a map into regions and assigning one predicted number to each region.",
        ],

        importantPoints: [
          "Regression trees predict continuous values.",
          "Predictions are piecewise constant.",
          "More leaves increase flexibility.",
          "Unrestricted regression trees can overfit.",
        ],
      },

      {
        id: "tree-bias-variance",
        title: "Bias-Variance Behavior of Decision Trees",

        explanation: [
          "A very shallow tree may be unable to represent important patterns and therefore have high bias.",
          "A very deep tree can adapt closely to individual training observations and therefore have high variance.",
          "Increasing tree complexity generally reduces training error.",
          "But reducing training error does not guarantee improved validation performance.",
          "Tree tuning therefore involves finding enough complexity to model the signal without creating excessively unstable rules.",
        ],

        intuition: [
          "A tiny tree asks too few questions.",
          "A huge tree can ask so many questions that it memorizes accidental details.",
        ],

        importantPoints: [
          "Shallow tree: usually higher bias.",
          "Deep tree: usually higher variance.",
          "Validation helps select useful complexity.",
          "Training accuracy alone is insufficient.",
        ],
      },

      {
        id: "tree-max-depth",
        title: "max_depth",

        explanation: [
          "max_depth limits how many levels the tree may grow below the root.",
          "A small max_depth creates a simpler tree with fewer sequential decisions.",
          "Increasing max_depth allows increasingly complex interactions and smaller regions.",
          "Very large or unrestricted depth can lead to overfitting.",
          "The appropriate depth depends on sample size, noise, feature structure and other regularization parameters.",
        ],

        intuition: [
          "max_depth limits how many questions the tree is allowed to ask along a prediction path.",
        ],

        importantPoints: [
          "Smaller depth increases regularization.",
          "Greater depth increases model flexibility.",
          "Too small can underfit.",
          "Too large can overfit.",
        ],
      },

      {
        id: "tree-min-samples-split",
        title: "min_samples_split",

        explanation: [
          "min_samples_split specifies the minimum number of training samples required to consider splitting an internal node.",
          "Increasing it prevents the tree from repeatedly splitting very small groups.",
          "This can reduce model variance and tree complexity.",
          "Setting it too high can stop useful splits and cause underfitting.",
        ],

        intuition: [
          "Do not allow the tree to create another question unless enough training examples have reached the current node.",
        ],

        importantPoints: [
          "Controls whether small nodes may split.",
          "Larger values generally regularize the tree.",
          "Too large can underfit.",
        ],
      },

      {
        id: "tree-min-samples-leaf",
        title: "min_samples_leaf",

        explanation: [
          "min_samples_leaf specifies the minimum number of training samples that must remain in a leaf.",
          "Increasing this parameter prevents leaves representing extremely small groups of observations.",
          "Larger leaves can produce smoother and more stable predictions.",
          "This parameter is often an effective way to reduce overfitting.",
          "An excessively large value can remove useful local structure.",
        ],

        intuition: [
          "A prediction rule supported by one training observation is less trustworthy than a rule supported by a meaningful group.",
        ],

        importantPoints: [
          "Controls minimum leaf support.",
          "Larger leaves generally reduce variance.",
          "Can improve stability.",
          "Too large can underfit.",
        ],
      },

      {
        id: "tree-max-features",
        title: "max_features",

        explanation: [
          "max_features controls how many features are considered when searching for the best split.",
          "Using all features gives each node access to the complete feature set.",
          "Restricting the number introduces additional randomness.",
          "Feature subsampling is especially important in ensemble methods such as Random Forest.",
          "For a single Decision Tree, changing max_features can also alter the learned structure.",
        ],

        intuition: [
          "Instead of allowing every question at every node, max_features can restrict which questions are available.",
        ],

        importantPoints: [
          "Controls candidate feature availability.",
          "Can introduce randomness.",
          "Especially important for Random Forest diversity.",
        ],
      },

      {
        id: "tree-max-leaf-nodes",
        title: "max_leaf_nodes",

        explanation: [
          "max_leaf_nodes limits the total number of leaf nodes in the learned tree.",
          "Because each leaf represents a prediction region, limiting leaves directly limits model complexity.",
          "A smaller value produces a simpler partition of the feature space.",
          "This provides another alternative to controlling complexity solely through max_depth.",
        ],

        intuition: [
          "Instead of limiting how deep the tree may grow, limit how many final answers the tree is allowed to create.",
        ],

        importantPoints: [
          "Limits total leaves.",
          "Controls tree complexity.",
          "Can be tuned as an alternative or complement to depth.",
        ],
      },

      {
        id: "tree-max-samples-leaf-weight",
        title: "min_weight_fraction_leaf",

        explanation: [
          "min_weight_fraction_leaf specifies the minimum weighted fraction of the total sample weight required in a leaf.",
          "It is particularly relevant when training observations use sample weights.",
          "It provides a weight-aware alternative to minimum raw sample-count constraints.",
        ],

        intuition: [
          "When observations have unequal importance, leaf support can be measured by total weight rather than only by number of rows.",
        ],

        importantPoints: [
          "Uses weighted sample mass.",
          "Relevant when sample weights are used.",
          "Different from min_samples_leaf.",
        ],
      },

      {
        id: "tree-min-impurity-decrease",
        title: "min_impurity_decrease",

        explanation: [
          "min_impurity_decrease requires a candidate split to reduce impurity by at least a specified amount before the split is accepted.",
          "Increasing this value prevents weak improvements from creating additional branches.",
          "It therefore acts as a direct complexity-control mechanism.",
          "A value that is too large can reject genuinely useful splits.",
        ],

        intuition: [
          "Only create a new branch when the new question improves the node enough to justify the added complexity.",
        ],

        importantPoints: [
          "Directly controls required split improvement.",
          "Larger values generally produce simpler trees.",
          "Too large can cause underfitting.",
        ],
      },

      {
        id: "tree-criterion",
        title: "criterion",

        explanation: [
          "criterion determines how the quality of a candidate split is measured.",
          "For DecisionTreeClassifier, common criteria include gini, entropy and log_loss.",
          "For DecisionTreeRegressor, available criteria are regression-specific, such as squared_error, friedman_mse, absolute_error and poisson when their assumptions are appropriate.",
          "Classification and regression criteria should not be mixed because they optimize different prediction problems.",
        ],

        intuition: [
          "criterion defines what the tree considers to be a good question.",
        ],

        importantPoints: [
          "Classifier and regressor criteria differ.",
          "gini and entropy are classification criteria.",
          "squared_error is a regression criterion.",
          "Do not mix parameter values between estimator variants.",
        ],
      },

      {
        id: "tree-splitter",
        title: "splitter",

        explanation: [
          "splitter controls the strategy used to select a split at each node.",
          "The best strategy searches for the best available split among the considered features.",
          "The random strategy introduces additional randomness into split selection.",
          "Randomized splitting can change the tree structure even when the training data remains unchanged.",
        ],

        intuition: [
          "The tree can always choose its strongest available question or deliberately introduce randomness into which question is selected.",
        ],

        importantPoints: [
          "best favors the strongest candidate split.",
          "random introduces split-selection randomness.",
          "random_state can matter when randomness is involved.",
        ],
      },

      {
        id: "tree-class-weight",
        title: "class_weight for Classification Trees",

        explanation: [
          "class_weight changes the importance assigned to different target classes during classifier training.",
          "This can be useful when class frequencies are highly imbalanced or when mistakes on some classes are more costly.",
          "The balanced option derives weights inversely related to observed class frequencies.",
          "Class weighting changes the training objective; it does not create new observations.",
          "class_weight belongs to DecisionTreeClassifier and should not be treated as a DecisionTreeRegressor parameter.",
        ],

        intuition: [
          "Tell the classifier that mistakes involving some classes should count more heavily when learning splits.",
        ],

        importantPoints: [
          "Classifier-specific parameter.",
          "Can help address class imbalance.",
          "Changes training importance.",
          "Evaluate with appropriate imbalance-sensitive metrics.",
        ],
      },

      {
        id: "tree-random-state",
        title: "random_state",

        explanation: [
          "Decision Tree training can involve randomness, for example when features are permuted or randomized splitting behavior is used.",
          "random_state controls reproducibility of relevant random choices.",
          "Fixing random_state is useful when comparing experiments.",
          "It does not improve the model merely because a particular integer is chosen.",
        ],

        intuition: [
          "random_state controls repeatability, not intelligence.",
        ],

        importantPoints: [
          "Useful for reproducible experiments.",
          "Does not directly regularize the model.",
          "Do not tune arbitrary random-state numbers as if they were meaningful model capacity parameters.",
        ],
      },

      {
        id: "tree-ccp-alpha",
        title: "Cost-Complexity Pruning and ccp_alpha",

        explanation: [
          "A tree can first grow complex and then be simplified through pruning.",
          "Minimal cost-complexity pruning balances tree fit against the number and complexity of terminal regions.",
          "ccp_alpha controls the strength of cost-complexity pruning in sklearn Decision Trees.",
          "With ccp_alpha equal to zero, no cost-complexity pruning pressure is added through this parameter.",
          "Larger values generally produce more aggressive pruning and simpler trees.",
          "The useful value should be selected using validation rather than by blindly maximizing pruning.",
        ],

        intuition: [
          "Growing the tree asks how much detail can be learned.",
          "Pruning asks which branches are actually worth keeping.",
        ],

        importantPoints: [
          "ccp_alpha controls post-growth cost-complexity pruning.",
          "Larger values generally simplify the tree.",
          "Too much pruning can underfit.",
          "Validate pruning strength.",
        ],
      },

      {
        id: "tree-monotonic-constraints",
        title: "Monotonic Constraints",

        explanation: [
          "Modern sklearn Decision Trees can support monotonic constraints in supported settings through monotonic_cst.",
          "A positive constraint can require the model output to move monotonically upward with a feature, while a negative constraint can require the opposite direction.",
          "A zero constraint leaves the feature unconstrained.",
          "Such constraints are useful only when domain knowledge genuinely justifies a monotonic relationship.",
          "Support and restrictions differ between classification and regression settings, so this parameter should be used deliberately rather than treated as a universal tree control.",
        ],

        intuition: [
          "If domain knowledge says increasing a feature should never decrease the model's response, a monotonic constraint can enforce that directional rule.",
        ],

        importantPoints: [
          "Domain-knowledge constraint.",
          "Not a general-purpose regularization trick.",
          "Check estimator and task support before using it.",
          "Incorrect constraints can damage model quality.",
        ],
      },

      {
        id: "tree-pre-pruning",
        title: "Pre-Pruning",

        explanation: [
          "Pre-pruning limits tree growth while the tree is being constructed.",
          "Parameters such as max_depth, min_samples_split, min_samples_leaf, max_leaf_nodes and min_impurity_decrease can stop unnecessary complexity before it forms.",
          "Pre-pruning reduces computation and can improve generalization.",
          "If restrictions are too aggressive, important structure may never be learned.",
        ],

        intuition: [
          "Stop the tree from growing questionable branches in the first place.",
        ],

        importantPoints: [
          "Occurs during tree growth.",
          "Uses complexity-control parameters.",
          "Can reduce overfitting.",
          "Too aggressive can underfit.",
        ],
      },

      {
        id: "tree-post-pruning",
        title: "Post-Pruning",

        explanation: [
          "Post-pruning simplifies an already grown tree.",
          "The goal is to remove branches whose predictive benefit does not justify their complexity.",
          "Cost-complexity pruning provides a principled approach to this tradeoff.",
          "Pruning can improve interpretability and reduce variance.",
        ],

        intuition: [
          "Grow detailed rules first, then cut away branches that do not earn their complexity.",
        ],

        importantPoints: [
          "Simplifies an existing tree.",
          "Can reduce variance.",
          "Can improve interpretability.",
          "ccp_alpha is an important sklearn pruning control.",
        ],
      },

      {
        id: "tree-feature-importance",
        title: "Feature Importance",

        explanation: [
          "Decision Trees can report impurity-based feature importance.",
          "A feature receives importance when its splits contribute to reductions in the tree's splitting criterion.",
          "The contributions are aggregated across the tree and normalized.",
          "A large impurity-based importance means the tree relied strongly on that feature for its learned splits.",
          "It does not prove that the feature causes the target.",
          "Impurity-based importance can also be biased toward features offering many possible split points.",
        ],

        intuition: [
          "Importance asks how much the tree used a feature to improve its decisions, not whether the feature is scientifically causal.",
        ],

        importantPoints: [
          "Based on impurity reduction.",
          "Not causal evidence.",
          "Can contain structural biases.",
          "Permutation importance can provide a complementary view.",
        ],
      },

      {
        id: "tree-probabilities",
        title: "Class Probabilities in Decision Trees",

        explanation: [
          "For classification, a new observation follows the learned split rules until it reaches a leaf.",
          "Class probability estimates are derived from the class distribution of training samples represented in that leaf, accounting for weighting where applicable.",
          "Very small leaves can therefore produce extreme and unstable probability estimates.",
          "Increasing leaf support can sometimes improve probability stability.",
        ],

        intuition: [
          "The tree's confidence comes from the labels of training observations that ended up in the same final region.",
        ],

        importantPoints: [
          "Leaf composition determines class probabilities.",
          "Tiny leaves can produce unstable probabilities.",
          "Probability quality and class accuracy are different concerns.",
        ],
      },

      {
        id: "tree-missing-categorical",
        title: "Missing Values and Categorical Features",

        explanation: [
          "Tree algorithms conceptually work well with threshold-based partitioning, but actual support for missing and categorical values depends on the implementation.",
          "Do not assume every Decision Tree implementation accepts arbitrary missing values or raw strings.",
          "Categorical features may require encoding when using estimators that expect numerical input.",
          "Encoding strategy should preserve the intended semantics as much as possible.",
          "Preprocessing must be fitted using training data only to avoid leakage.",
        ],

        intuition: [
          "Trees require less scaling, but that does not mean they require no data preparation.",
        ],

        importantPoints: [
          "Scaling and data preparation are different issues.",
          "Check implementation-specific missing-value support.",
          "Raw categorical strings may require encoding.",
          "Prevent preprocessing leakage.",
        ],
      },

      {
        id: "tree-complexity",
        title: "Computational Complexity and Tree Size",

        explanation: [
          "Training cost depends on the number of observations, features, candidate splits and final tree structure.",
          "Prediction is usually efficient because an observation follows only one path from root to leaf.",
          "A deeper tree requires more sequential decisions during prediction.",
          "Large unrestricted trees consume more memory because they contain more nodes.",
          "Complexity controls can therefore affect both generalization and computational cost.",
        ],

        intuition: [
          "Training must discover the questions; prediction only needs to follow the learned questions.",
        ],

        importantPoints: [
          "Training is more expensive than following one prediction path.",
          "Deeper trees require more nodes and memory.",
          "Regularization can also reduce computational complexity.",
        ],
      },

      {
        id: "tree-tuning",
        title: "Decision Tree Tuning Strategy",

        explanation: [
          "Begin with a validation strategy appropriate for the dataset.",
          "Inspect whether the baseline tree is severely overfitting by comparing training and validation performance.",
          "Tune major complexity controls such as max_depth and min_samples_leaf.",
          "Consider min_samples_split, max_leaf_nodes and min_impurity_decrease when additional control is useful.",
          "For classification, evaluate criterion and class_weight when relevant.",
          "Consider cost-complexity pruning through ccp_alpha.",
          "Do not tune every parameter simultaneously without understanding what behavior each parameter controls.",
        ],

        intuition: [
          "Tune the tree by controlling how easily it can create increasingly specific rules.",
        ],

        importantPoints: [
          "Use validation.",
          "Control depth and leaf size first.",
          "Diagnose overfitting before increasing complexity.",
          "Consider pruning.",
          "Use task-appropriate metrics.",
        ],
      },

      {
        id: "tree-failure-modes",
        title: "Decision Tree Failure Modes",

        explanation: [
          "A tree that performs almost perfectly on training data but poorly on validation data is probably too complex.",
          "A tree that performs poorly on both training and validation data may be too constrained or lack informative features.",
          "Very small leaves can create unstable rules.",
          "Minor changes in the training sample can produce substantially different trees because individual trees have high variance.",
          "Class imbalance can cause majority classes to dominate learned splits.",
          "Impurity-based feature importance can be misinterpreted.",
        ],

        intuition: [
          "When a tree fails, inspect its size, leaf support, training-validation gap and class behavior before blindly changing parameters.",
        ],

        importantPoints: [
          "Large train-validation gap suggests overfitting.",
          "Poor performance everywhere can suggest underfitting.",
          "Individual trees can be unstable.",
          "Inspect class imbalance.",
          "Do not overinterpret feature importance.",
        ],
      },

      {
        id: "tree-interpretability",
        title: "Interpreting Decision Trees",

        explanation: [
          "A Decision Tree can often be inspected as explicit if-else rules.",
          "A prediction path identifies which feature conditions were applied to one observation.",
          "Small trees can therefore be highly interpretable.",
          "Very large trees become difficult to understand despite still being technically representable as rules.",
          "Interpretability also does not guarantee causal correctness.",
        ],

        intuition: [
          "A small tree can explain a prediction by showing exactly which questions were answered on the route to the leaf.",
        ],

        importantPoints: [
          "Prediction paths are inspectable.",
          "Small trees are easier to interpret.",
          "Large trees lose practical interpretability.",
          "Interpretation is not causation.",
        ],
      },

      {
        id: "tree-comparison",
        title: "Decision Tree Compared with Other Models",

        explanation: [
          "Unlike Linear and Logistic Regression, Decision Trees naturally model nonlinear threshold interactions without manually creating polynomial terms.",
          "Unlike KNN and SVM with distance-sensitive kernels, ordinary tree splitting generally does not require feature standardization.",
          "Unlike Naive Bayes, trees do not require conditional feature independence.",
          "A single Decision Tree is usually easier to interpret than Random Forest or Gradient Boosting.",
          "However, individual trees commonly have higher variance than tree ensembles.",
        ],

        intuition: [
          "Decision Trees trade some predictive stability for flexible rules and interpretability.",
        ],

        importantPoints: [
          "Naturally nonlinear.",
          "Little need for feature scaling.",
          "No Naive Bayes independence assumption.",
          "More interpretable than many ensembles.",
          "Higher variance than Random Forest.",
        ],
      },

      {
        id: "tree-real-world",
        title: "Real-World Applications",

        explanation: [
          "Decision Trees can be used for customer classification, risk segmentation, medical decision support, churn modeling and rule-oriented business problems.",
          "They are especially attractive when stakeholders need understandable decision rules.",
          "For high-stakes applications, interpretability does not remove the need for careful validation, fairness analysis and domain review.",
        ],

        intuition: [
          "Trees are useful when both prediction and understandable decision paths matter.",
        ],

        importantPoints: [
          "Classification and regression.",
          "Rule-oriented decision systems.",
          "Risk and customer segmentation.",
          "Interpretability can be useful for communication.",
        ],
      },

      {
        id: "tree-exam-interview",
        title: "Decision Tree: Exam and Interview Essentials",

        explanation: [
          "Be able to explain root nodes, internal nodes, branches and leaves.",
          "Explain recursive splitting and greedy split selection.",
          "Know Gini impurity, entropy and information gain.",
          "Explain why deep trees tend to overfit.",
          "Understand the difference between classification and regression trees.",
          "Know the effects of max_depth, min_samples_split and min_samples_leaf.",
          "Explain pre-pruning and post-pruning.",
          "Know the purpose of ccp_alpha.",
          "Explain why scaling is usually unnecessary.",
          "Explain impurity-based feature importance and why it is not causal evidence.",
          "Explain the bias-variance behavior of shallow and deep trees.",
          "Be able to compare a Decision Tree with Random Forest.",
        ],

        intuition: [
          "A strong Decision Tree answer should connect how the tree chooses questions with how complexity controls affect generalization.",
        ],

        importantPoints: [
          "Recursive partitioning.",
          "Gini and entropy.",
          "Greedy splitting.",
          "Classification vs regression.",
          "Depth and leaf controls.",
          "Pruning.",
          "Bias versus variance.",
          "Feature importance.",
        ],
      },
            {
        id: "rf-bagging-deep",
        title: "Bagging: The Foundation of Random Forest",

        explanation: [
          "Random Forest belongs to the broader family of bagging-based ensemble methods.",
          "Bagging stands for Bootstrap Aggregating.",
          "The bootstrap step creates multiple training datasets by sampling the original training set with replacement.",
          "A separate Decision Tree is trained on each sampled dataset.",
          "The aggregation step combines predictions from the resulting trees.",
          "For regression, aggregation is typically averaging.",
          "For classification, Random Forest combines class-probability information across trees to produce the final prediction.",
          "The main statistical purpose of bagging is to reduce the variance of unstable base learners such as deep Decision Trees.",
        ],

        intuition: [
          "Instead of trusting one tree trained on one particular version of the data, train many trees on slightly different versions and combine what they learned.",
        ],

        importantPoints: [
          "Bagging means Bootstrap Aggregating.",
          "Bootstrap sampling creates different training sets.",
          "Aggregation combines predictions.",
          "Bagging primarily reduces variance.",
          "Decision Trees are particularly suitable because individual trees are high-variance learners.",
        ],
      },

      {
        id: "rf-bootstrap-mathematics",
        title: "Bootstrap Sampling in Depth",

        explanation: [
          "Suppose the original training dataset contains n observations.",
          "A standard bootstrap sample also contains n draws, but the draws are performed with replacement.",
          "Because sampling uses replacement, one observation can appear multiple times while another may not appear at all.",
          "For large n, a bootstrap sample contains roughly 63.2 percent unique observations on average.",
          "The remaining observations are approximately 36.8 percent out-of-bag for that particular tree.",
          "Different trees receive different bootstrap samples, creating one important source of ensemble diversity.",
        ],

        intuition: [
          "Every tree receives a remix of the original training data rather than a completely separate dataset.",
        ],

        importantPoints: [
          "Bootstrap sampling uses replacement.",
          "The bootstrap sample can contain duplicates.",
          "Some observations are excluded from each tree.",
          "Excluded observations become out-of-bag observations for that tree.",
          "Bootstrap variation helps create tree diversity.",
        ],
      },

      {
        id: "rf-oob",
        title: "Out-of-Bag Samples and OOB Evaluation",

        explanation: [
          "Because each bootstrap sample leaves some training observations unused, those observations can act as validation observations for that particular tree.",
          "These unused observations are called out-of-bag observations.",
          "For each training observation, predictions can be collected from trees for which that observation was out-of-bag.",
          "Those predictions can be aggregated to produce an out-of-bag estimate of predictive performance.",
          "OOB evaluation provides a convenient internal validation estimate when bootstrap sampling is enabled.",
          "It does not automatically replace careful cross-validation in every modeling situation.",
        ],

        intuition: [
          "Every tree leaves some training rows behind. Instead of wasting them, use those rows to test that tree.",
        ],

        importantPoints: [
          "OOB observations were not used to fit the corresponding tree.",
          "OOB predictions can estimate generalization performance.",
          "oob_score enables OOB scoring in supported Random Forest settings.",
          "OOB evaluation depends on bootstrap sampling.",
        ],
      },

      {
        id: "rf-diversity",
        title: "Why Tree Diversity Matters",

        explanation: [
          "Averaging identical trees would provide almost no variance-reduction benefit.",
          "Random Forest therefore deliberately tries to make its trees different.",
          "Bootstrap sampling changes the observations available to each tree.",
          "Random feature subsets change which predictors can compete at each split.",
          "These mechanisms reduce correlation among the trees.",
          "An effective forest needs individual trees that contain useful predictive signal while not making exactly the same errors.",
        ],

        intuition: [
          "A committee is more useful when its members have learned from somewhat different experiences instead of copying the same opinion.",
        ],

        importantPoints: [
          "Diversity is fundamental to ensemble improvement.",
          "Bootstrap sampling creates data diversity.",
          "Feature subsampling creates feature diversity.",
          "Highly correlated trees reduce the benefit of averaging.",
        ],
      },

      {
        id: "rf-correlation",
        title: "Tree Correlation and Variance Reduction",

        explanation: [
          "A Random Forest reduces variance by averaging predictions from many trees.",
          "The benefit is strongest when the trees are individually useful but their errors are not perfectly correlated.",
          "If every tree makes nearly the same error, averaging cannot remove that common error.",
          "Random feature selection is therefore not simply random noise; it is a mechanism for reducing dependence among trees.",
          "max_features plays an important role in controlling this tradeoff.",
        ],

        intuition: [
          "Ten people repeating the same mistake are not much better than one person making that mistake.",
          "Different useful perspectives allow errors to cancel more effectively.",
        ],

        importantPoints: [
          "Aggregation reduces variance.",
          "Lower tree correlation improves the benefit of aggregation.",
          "max_features influences tree correlation.",
          "Diversity should not come at the cost of making every tree useless.",
        ],
      },

      {
        id: "rf-classification-regression",
        title: "Random Forest Classification vs Regression",

        explanation: [
          "RandomForestClassifier predicts categorical targets.",
          "Its trees produce class information that is aggregated across the ensemble.",
          "RandomForestRegressor predicts continuous numerical targets.",
          "Regression predictions are obtained by aggregating numerical predictions from individual trees, typically through averaging.",
          "Both variants use the same central ideas of randomized trees and aggregation.",
          "However, classification-only parameters and criteria should not be mixed with regression-only behavior.",
        ],

        intuition: [
          "Classification combines many tree opinions about classes, while regression combines many numerical estimates.",
        ],

        importantPoints: [
          "RandomForestClassifier handles classification.",
          "RandomForestRegressor handles regression.",
          "Both use many randomized Decision Trees.",
          "Their criteria and some parameters differ.",
        ],
      },

      {
        id: "rf-n-estimators",
        title: "n_estimators",

        explanation: [
          "n_estimators controls the number of trees in the forest.",
          "Increasing the number of trees usually makes the ensemble prediction more stable.",
          "Unlike increasing the depth of one tree, adding more trees does not normally increase model flexibility in the same way.",
          "After enough trees have been added, predictive improvements may become very small.",
          "Training time, prediction time and memory usage continue to increase as more trees are added.",
        ],

        intuition: [
          "Ask more independent members of the committee until additional opinions stop changing the combined answer very much.",
        ],

        importantPoints: [
          "More trees usually improve stability.",
          "Returns eventually diminish.",
          "More trees increase computation.",
          "n_estimators is different from tree-depth complexity.",
        ],
      },

      {
        id: "rf-max-features-deep",
        title: "max_features",

        explanation: [
          "max_features controls how many candidate features are considered when searching for a split.",
          "Using fewer features increases randomness among trees.",
          "This can reduce correlation and strengthen the ensemble effect.",
          "If too few useful features are available at each split, individual trees may become weaker.",
          "If too many features are always available, trees can become more similar.",
          "The best value balances individual tree quality against ensemble diversity.",
        ],

        intuition: [
          "Do not let every tree always choose from every possible question, or the trees may repeatedly learn the same structure.",
        ],

        importantPoints: [
          "Smaller max_features generally increases diversity.",
          "Larger max_features can strengthen individual split selection.",
          "The best value balances strength and correlation.",
          "Its defaults and appropriate choices can differ between classifier and regressor contexts.",
        ],
      },

      {
        id: "rf-tree-complexity",
        title: "Complexity of Individual Trees",

        explanation: [
          "Random Forest does not remove the importance of Decision Tree complexity controls.",
          "max_depth limits tree depth.",
          "min_samples_split controls whether small internal nodes can split.",
          "min_samples_leaf controls minimum leaf support.",
          "max_leaf_nodes limits the number of terminal regions.",
          "min_impurity_decrease can prevent weak splits.",
          "ccp_alpha can introduce cost-complexity pruning.",
          "These controls determine how flexible each individual tree can become.",
        ],

        intuition: [
          "Random Forest decides both how many trees to grow and how complicated each tree is allowed to become.",
        ],

        importantPoints: [
          "Forest size and tree complexity are different dimensions.",
          "Deep trees can still be high variance individually.",
          "Leaf-size controls can improve stability.",
          "Tree controls should be validated.",
        ],
      },

      {
        id: "rf-bootstrap-parameter",
        title: "bootstrap",

        explanation: [
          "bootstrap controls whether individual trees are trained using bootstrap samples.",
          "When bootstrap is enabled, each tree receives a sample drawn with replacement.",
          "When it is disabled, the standard bootstrap mechanism is not used.",
          "Out-of-bag evaluation requires the bootstrap mechanism.",
          "Changing bootstrap behavior changes one of the main sources of diversity in the forest.",
        ],

        intuition: [
          "bootstrap decides whether every tree receives a resampled version of the training set.",
        ],

        importantPoints: [
          "Controls bootstrap sampling.",
          "Affects training-data diversity.",
          "OOB evaluation requires bootstrap sampling.",
        ],
      },

      {
        id: "rf-max-samples",
        title: "max_samples",

        explanation: [
          "When bootstrap sampling is enabled, max_samples controls how many training observations are drawn to fit each tree.",
          "It can be specified as an integer count or an appropriate fraction depending on the estimator API.",
          "Using fewer observations per tree can increase diversity and reduce per-tree computation.",
          "Using too little data can weaken individual trees.",
        ],

        intuition: [
          "Instead of giving every tree a bootstrap sample as large as the complete dataset, control how much training data each tree receives.",
        ],

        importantPoints: [
          "Works with bootstrap sampling.",
          "Controls per-tree sample size.",
          "Can influence diversity and computation.",
          "Too little data can weaken base trees.",
        ],
      },

      {
        id: "rf-oob-score-parameter",
        title: "oob_score",

        explanation: [
          "oob_score enables evaluation using out-of-bag observations when bootstrap sampling is active.",
          "The estimator aggregates predictions for training observations from trees that did not train on those observations.",
          "This produces an internal estimate of predictive performance.",
          "The exact scoring behavior depends on the estimator and configured scoring options.",
        ],

        intuition: [
          "Use each tree's unseen bootstrap leftovers as internal validation data.",
        ],

        importantPoints: [
          "Requires bootstrap sampling.",
          "Provides an internal validation estimate.",
          "Useful for diagnostics.",
          "Does not automatically make external evaluation unnecessary.",
        ],
      },

      {
        id: "rf-n-jobs",
        title: "n_jobs",

        explanation: [
          "Individual trees can often be trained and evaluated independently.",
          "This makes Random Forest naturally suitable for parallel computation.",
          "n_jobs controls how many CPU jobs are used for supported fitting, prediction or related operations.",
          "Using multiple cores can substantially reduce runtime.",
          "This parameter changes computational execution rather than the statistical meaning of the forest.",
        ],

        intuition: [
          "Different workers can grow different trees at the same time.",
        ],

        importantPoints: [
          "Controls parallelism.",
          "Can reduce runtime.",
          "Does not directly control overfitting.",
          "n_jobs=-1 commonly requests use of available processors in sklearn.",
        ],
      },

      {
        id: "rf-random-state",
        title: "random_state",

        explanation: [
          "Random Forest intentionally contains randomness from sampling and feature selection.",
          "random_state controls reproducibility of relevant random operations.",
          "Using the same random state makes experiments easier to reproduce.",
          "The numerical value itself is not a meaningful model-capacity setting.",
        ],

        intuition: [
          "random_state lets you replay the same randomized forest construction.",
        ],

        importantPoints: [
          "Controls reproducibility.",
          "Important for repeatable experiments.",
          "Do not tune random-state numbers as if they were ordinary hyperparameters.",
        ],
      },

      {
        id: "rf-warm-start",
        title: "warm_start",

        explanation: [
          "warm_start can allow an existing fitted forest to be reused when adding additional estimators under supported usage.",
          "This can be useful when incrementally increasing the number of trees during experimentation.",
          "It should not be confused with online learning from arbitrary new streaming observations.",
          "The estimator's warm-start rules must be respected when changing parameters between fits.",
        ],

        intuition: [
          "Instead of throwing away the existing forest when adding more trees, continue from the trees already built.",
        ],

        importantPoints: [
          "Can reuse existing fitted estimators when adding trees.",
          "Not the same as general online learning.",
          "Use according to estimator constraints.",
        ],
      },

      {
        id: "rf-verbose",
        title: "verbose",

        explanation: [
          "verbose controls how much progress information the estimator reports during supported operations.",
          "It is useful for monitoring computational execution during large training jobs.",
          "It does not change the statistical model being learned.",
        ],

        intuition: [
          "verbose changes how much the training process talks to you, not what it learns.",
        ],

        importantPoints: [
          "Monitoring parameter.",
          "Does not affect predictive capacity.",
          "Useful for long-running jobs.",
        ],
      },

      {
        id: "rf-class-weight",
        title: "class_weight in RandomForestClassifier",

        explanation: [
          "class_weight changes the importance assigned to classes during classifier training.",
          "It can be useful for imbalanced classification.",
          "The balanced strategy derives weights from class frequencies.",
          "Random Forest classification can also support forest-specific weighting behavior such as balanced_subsample in supported sklearn versions.",
          "class_weight is a classifier concept and should not be presented as a RandomForestRegressor parameter.",
        ],

        intuition: [
          "Make errors involving minority or important classes count more strongly during classifier training.",
        ],

        importantPoints: [
          "Classifier-specific.",
          "Useful for class imbalance.",
          "Changes training weights rather than generating new data.",
          "Evaluate with precision, recall, F1 and other appropriate metrics.",
        ],
      },

      {
        id: "rf-criterion",
        title: "criterion",

        explanation: [
          "criterion determines how individual Decision Trees measure split quality.",
          "RandomForestClassifier uses classification criteria.",
          "RandomForestRegressor uses regression criteria.",
          "Because the forest consists of trees, this parameter controls the objective used inside each base tree.",
          "Classifier and regressor criterion values must not be mixed.",
        ],

        intuition: [
          "Every tree needs a rule for deciding which split is best, and criterion defines that rule.",
        ],

        importantPoints: [
          "Controls base-tree split quality.",
          "Classifier and regressor values differ.",
          "Do not mix classification and regression criteria.",
        ],
      },

      {
        id: "rf-ccp-alpha",
        title: "ccp_alpha",

        explanation: [
          "ccp_alpha controls minimal cost-complexity pruning of individual trees.",
          "Increasing it generally produces more strongly pruned trees.",
          "Pruning individual trees changes their complexity before their predictions are aggregated.",
          "The useful value depends on the dataset and should be validated.",
        ],

        intuition: [
          "Simplify each member of the forest before relying on the combined committee.",
        ],

        importantPoints: [
          "Controls pruning of base trees.",
          "Larger values generally simplify trees.",
          "Can affect bias and variance.",
        ],
      },

      {
        id: "rf-monotonic",
        title: "Monotonic Constraints",

        explanation: [
          "Current sklearn Random Forest estimators can expose monotonic constraints in supported settings.",
          "These constraints can enforce directional relationships between selected features and model output.",
          "They should be used only when justified by reliable domain knowledge.",
          "Support and restrictions differ by estimator and prediction setting.",
          "This parameter should therefore not be treated as universally applicable to every Random Forest task.",
        ],

        intuition: [
          "A domain rule can require the forest's response to move only in a specified direction as a feature increases.",
        ],

        importantPoints: [
          "Domain-knowledge constraint.",
          "Not universally applicable.",
          "Check estimator support.",
          "Incorrect constraints can hurt predictive performance.",
        ],
      },

      {
        id: "rf-bias-variance",
        title: "Bias-Variance Behavior",

        explanation: [
          "Deep individual Decision Trees usually have relatively low bias but high variance.",
          "Random Forest primarily attacks the variance problem by averaging many diverse trees.",
          "Averaging does not automatically remove systematic bias shared by all trees.",
          "Very restrictive tree settings can still make the forest underfit.",
          "The final bias-variance behavior therefore depends on both base-tree complexity and ensemble diversity.",
        ],

        intuition: [
          "Random Forest stabilizes unstable trees, but it cannot magically recover patterns that every tree is prevented from learning.",
        ],

        importantPoints: [
          "Primary benefit is variance reduction.",
          "Base-tree complexity still matters.",
          "Over-regularized trees can create ensemble underfitting.",
          "Correlated trees limit variance reduction.",
        ],
      },

      {
        id: "rf-feature-importance",
        title: "Impurity-Based Feature Importance",

        explanation: [
          "Random Forest aggregates impurity-based feature importance information across its trees.",
          "Features receiving large total impurity reductions can receive high importance values.",
          "These values indicate how the fitted forest used features.",
          "They do not prove causal relationships.",
          "Impurity-based importance can favor features with many possible split points or other structural advantages.",
        ],

        intuition: [
          "Feature importance tells us what the forest relied on, not what scientifically caused the outcome.",
        ],

        importantPoints: [
          "Aggregated across trees.",
          "Based on impurity reduction.",
          "Not causal evidence.",
          "Can contain bias.",
        ],
      },

      {
        id: "rf-permutation-importance",
        title: "Permutation Importance",

        explanation: [
          "Permutation importance evaluates how model performance changes when one feature's values are randomly shuffled.",
          "Shuffling breaks the relationship between that feature and the target while leaving the fitted model unchanged.",
          "A large performance drop suggests the model relied strongly on that feature.",
          "Permutation importance can complement impurity-based importance.",
          "Strongly correlated features can complicate interpretation because another correlated feature may substitute for the shuffled one.",
        ],

        intuition: [
          "Break one feature and see how much the forest suffers.",
        ],

        importantPoints: [
          "Model-agnostic interpretation method.",
          "Measures performance degradation after shuffling.",
          "Can complement impurity importance.",
          "Correlation complicates interpretation.",
        ],
      },

      {
        id: "rf-probabilities",
        title: "Random Forest Class Probabilities",

        explanation: [
          "RandomForestClassifier can produce class-probability estimates.",
          "Individual trees estimate class probabilities from their terminal leaves.",
          "The forest combines probability estimates across trees.",
          "Averaging across trees generally creates more stable probabilities than relying on one highly variable tree.",
          "Probability calibration should still be evaluated when accurate confidence estimates are important.",
        ],

        intuition: [
          "Instead of asking only which class each tree chooses, combine how strongly the trees support each class.",
        ],

        importantPoints: [
          "Classifier can output probabilities.",
          "Probabilities are aggregated across trees.",
          "Calibration and classification accuracy are different properties.",
        ],
      },

      {
        id: "rf-preprocessing",
        title: "Random Forest Preprocessing",

        explanation: [
          "Like ordinary Decision Trees, Random Forest generally does not require standardization purely for split selection.",
          "Threshold-based trees depend mainly on feature ordering rather than Euclidean distance.",
          "However, missing values, categorical representations and data quality still require deliberate handling according to estimator support.",
          "Preprocessing must remain leakage-safe.",
        ],

        intuition: [
          "No scaling requirement does not mean no preprocessing requirement.",
        ],

        importantPoints: [
          "StandardScaler is usually unnecessary for ordinary forest splitting.",
          "Handle missing values deliberately.",
          "Handle categorical data according to estimator requirements.",
          "Avoid preprocessing leakage.",
        ],
      },

      {
        id: "rf-computation",
        title: "Computational Behavior",

        explanation: [
          "Training many trees requires more computation and memory than training one Decision Tree.",
          "However, individual trees can often be trained independently, making Random Forest highly parallelizable.",
          "Prediction requires collecting results from many trees.",
          "Increasing n_estimators increases training, prediction and storage costs.",
          "Limiting tree depth, sample size or other complexity controls can reduce computational requirements.",
        ],

        intuition: [
          "A forest gains stability by doing the work of many trees.",
        ],

        importantPoints: [
          "More trees cost more computation.",
          "Trees can be parallelized.",
          "n_jobs controls parallel execution.",
          "Tree size affects memory.",
        ],
      },

      {
        id: "rf-tuning",
        title: "Random Forest Tuning Strategy",

        explanation: [
          "Start with a strong baseline and a validation strategy appropriate for the problem.",
          "Choose enough trees for stable validation performance.",
          "Tune max_features because it strongly affects tree diversity.",
          "Tune max_depth and min_samples_leaf when the individual trees are too complex or too constrained.",
          "Consider min_samples_split and max_leaf_nodes when additional complexity control is needed.",
          "For imbalanced classification, evaluate class_weight and appropriate metrics.",
          "Use OOB evaluation as an additional diagnostic when bootstrap sampling is enabled.",
          "Avoid tuning every parameter blindly.",
        ],

        intuition: [
          "Tune Random Forest along three major axes: number of trees, complexity of each tree and diversity among trees.",
        ],

        importantPoints: [
          "n_estimators controls ensemble size.",
          "max_features strongly affects diversity.",
          "Tree parameters control base-learner complexity.",
          "Use validation.",
          "OOB can provide an additional estimate.",
        ],
      },

      {
        id: "rf-failure-modes",
        title: "Random Forest Failure Modes",

        explanation: [
          "Random Forest can still overfit when trees are excessively complex relative to the available data, especially in noisy settings.",
          "Highly correlated trees reduce the benefit of aggregation.",
          "Severe class imbalance can produce weak minority-class behavior even when overall accuracy looks high.",
          "Too few trees can create unstable ensemble estimates.",
          "Very restrictive trees can cause underfitting.",
          "Impurity-based feature importance can be misleading when interpreted carelessly.",
          "Large forests can become computationally expensive.",
        ],

        intuition: [
          "A forest is powerful, but it still depends on having enough useful, diverse trees and appropriate evaluation.",
        ],

        importantPoints: [
          "Check class-specific metrics.",
          "Check tree complexity.",
          "Check ensemble size.",
          "Check diversity.",
          "Check computation.",
          "Interpret feature importance cautiously.",
        ],
      },

      {
        id: "rf-vs-tree",
        title: "Random Forest vs Decision Tree",

        explanation: [
          "A single Decision Tree is usually easier to visualize and explain.",
          "A Random Forest sacrifices much of that direct interpretability to gain predictive stability.",
          "Individual trees can have high variance.",
          "Random Forest reduces this variance through diversification and aggregation.",
          "A single tree trains and predicts with less total computation.",
          "The best choice depends on whether interpretability, stability, computational cost or predictive performance is most important.",
        ],

        intuition: [
          "Decision Tree gives you one understandable expert. Random Forest gives you a committee whose combined answer is usually more stable.",
        ],

        importantPoints: [
          "Tree: more directly interpretable.",
          "Forest: generally more stable.",
          "Forest reduces variance.",
          "Forest costs more computation.",
        ],
      },

      {
        id: "rf-vs-extra-trees",
        title: "Random Forest vs Extra Trees",

        explanation: [
          "Random Forest and Extra Trees are both ensembles of randomized Decision Trees.",
          "Random Forest commonly combines bootstrap sampling with random feature subsets.",
          "Extra Trees introduces additional randomness into how split thresholds are selected.",
          "This extra randomness can reduce variance further but may change bias.",
          "Their relative performance depends on the dataset and should be compared through validation.",
        ],

        intuition: [
          "Random Forest randomizes which data and features trees see; Extra Trees pushes split randomness even further.",
        ],

        importantPoints: [
          "Both are randomized tree ensembles.",
          "Extra Trees uses more randomized split selection.",
          "Bias-variance behavior can differ.",
          "Compare empirically.",
        ],
      },

      {
        id: "rf-vs-boosting",
        title: "Random Forest vs Gradient Boosting",

        explanation: [
          "Random Forest primarily builds trees independently and combines them through bagging-style aggregation.",
          "Gradient Boosting builds trees sequentially, where later learners focus on correcting the current ensemble's errors.",
          "Random Forest primarily targets variance reduction.",
          "Boosting can strongly reduce bias and build highly accurate predictive models but is usually more sequential and sensitive to tuning.",
          "Neither method is universally superior.",
        ],

        intuition: [
          "Random Forest asks many independent trees and averages them.",
          "Boosting builds a team where each new member learns from what the existing team still gets wrong.",
        ],

        importantPoints: [
          "Random Forest: parallel randomized trees.",
          "Boosting: sequential corrective learners.",
          "Forest strongly targets variance.",
          "Boosting has different tuning and computational behavior.",
        ],
      },

      {
        id: "rf-real-world",
        title: "Real-World Applications",

        explanation: [
          "Random Forest can be used for credit-risk modeling, customer churn, medical classification, fraud screening, environmental prediction and many tabular-data problems.",
          "It is especially useful as a strong baseline when nonlinear interactions are expected.",
          "It can handle mixed predictive structures without requiring manual interaction features.",
          "For high-stakes applications, strong predictive performance must still be accompanied by careful validation, fairness analysis and domain review.",
        ],

        intuition: [
          "Random Forest is a versatile general-purpose model for structured tabular data.",
        ],

        importantPoints: [
          "Classification and regression.",
          "Strong tabular-data baseline.",
          "Captures nonlinear interactions.",
          "Relatively little scaling preprocessing.",
        ],
      },

      {
        id: "rf-exam-interview",
        title: "Random Forest: Exam and Interview Essentials",

        explanation: [
          "Explain why a single Decision Tree has high variance.",
          "Define bagging and bootstrap sampling.",
          "Explain why bootstrap sampling uses replacement.",
          "Explain random feature selection.",
          "Explain why reducing correlation between trees helps.",
          "Know classification and regression aggregation.",
          "Explain out-of-bag observations and OOB evaluation.",
          "Know the roles of n_estimators, max_features, max_depth and min_samples_leaf.",
          "Explain why Random Forest generally reduces variance.",
          "Explain why feature importance does not imply causality.",
          "Compare Random Forest with a single Decision Tree.",
          "Compare bagging with boosting.",
        ],

        intuition: [
          "A strong Random Forest explanation should connect bootstrap diversity, feature randomness and aggregation directly to variance reduction.",
        ],

        importantPoints: [
          "Bagging.",
          "Bootstrap sampling.",
          "Feature randomness.",
          "Tree diversity.",
          "Variance reduction.",
          "OOB evaluation.",
          "Hyperparameter tuning.",
          "Feature importance.",
        ],
      },
    ],

    visualization: {
      type: "model-lab",
      visualizationId: "decision-tree",
      title: "Decision Tree Model Lab",
      description:
        "Connect later to the existing ModelMind Decision Tree Lab for interactive split, Gini, entropy, depth and boundary exploration.",
    },

    codeExamples: [
      {
        id: "tree-code",
        title: "Decision Tree Classification",
        description:
          "Train a controlled Decision Tree and inspect feature importance.",
        language: "python",

        code: `from sklearn.datasets import load_breast_cancer
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(
    return_X_y=True
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

model = DecisionTreeClassifier(
    criterion="gini",
    max_depth=4,
    min_samples_leaf=5,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

print(
    classification_report(
        y_test,
        predictions
    )
)

print(
    "Tree depth:",
    model.get_depth()
)

print(
    "Leaves:",
    model.get_n_leaves()
)

print(
    "Feature importances:",
    model.feature_importances_
)`,

        explanation: [
          "max_depth limits the number of splitting levels.",
          "min_samples_leaf prevents extremely small leaves.",
          "Feature importance summarizes impurity reduction attributed to features but should not be treated as causal evidence.",
        ],

        commonMistakes: [
          "Growing an unrestricted tree and reporting training accuracy.",
          "Assuming feature importance proves causality.",
          "Scaling solely because every model is assumed to need it.",
        ],
      },
    ],

    practice: [
      {
        id: "tree-practice-1",
        title: "Pure Node",
        type: "concept",
        difficulty: "basic",
        question:
          "What is the Gini impurity of a node containing only one class?",
        instructions: [
          "Think about complete purity.",
        ],
        hints: [
          "There is no class mixing.",
        ],
        explanation:
          "The Gini impurity is 0.",
      },

      {
        id: "tree-practice-2",
        title: "Tree Components",
        type: "concept",
        difficulty: "basic",
        question:
          "Which part of a Decision Tree normally produces the final prediction?",
        instructions: [
          "Think about the end of a decision path.",
        ],
        hints: [
          "The terminal node.",
        ],
        explanation:
          "A leaf node normally produces the final prediction.",
      },

      {
        id: "tree-practice-3",
        title: "Deep Tree",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can increasing max_depth too much lead to overfitting?",
        instructions: [
          "Consider increasingly specific rules.",
        ],
        hints: [
          "The tree can model noise and tiny groups.",
        ],
        explanation:
          "A deep tree can create highly specific splits that capture training noise rather than generalizable structure.",
      },

      {
        id: "tree-practice-4",
        title: "Scaling",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why does an ordinary Decision Tree generally require less feature scaling than KNN?",
        instructions: [
          "Compare threshold splits with distance calculations.",
        ],
        hints: [
          "Trees primarily use feature ordering for threshold decisions.",
        ],
        explanation:
          "Trees make threshold-based decisions on individual features, whereas KNN directly combines feature magnitudes in distance calculations.",
      },

      {
        id: "tree-practice-5",
        title: "Information Gain",
        type: "analysis",
        difficulty: "advanced",
        question:
          "What does a high information gain from a candidate split indicate?",
        instructions: [
          "Compare parent and child uncertainty.",
        ],
        hints: [
          "The child nodes are substantially more certain or pure.",
        ],
        explanation:
          "It indicates that the split substantially reduces class uncertainty relative to the parent node.",
      },
    ],

    keyTakeaways: [
      "Decision Trees learn recursive feature-based rules.",
      "Leaves generate predictions.",
      "Gini and entropy measure class impurity or uncertainty.",
      "Deep trees can overfit strongly.",
      "Complexity controls improve generalization.",
      "Trees usually require less scaling than distance-based models.",
    ],
  },


  // =========================================================
  // RANDOM FOREST
  // Existing ModelMind lab — CONNECT LATER
  // =========================================================

  "random-forest": {
    overview:
      "Random Forest is an ensemble of Decision Trees designed primarily to reduce the high variance of individual trees. It combines bootstrap sampling, randomized feature selection and aggregation to produce a more stable predictor.",

    objectives: [
      "Understand ensemble learning.",
      "Understand bootstrap sampling.",
      "Understand bagging.",
      "Understand random feature subsets.",
      "Understand majority voting.",
      "Understand why forests reduce variance.",
      "Understand important Random Forest hyperparameters.",
      "Understand out-of-bag evaluation.",
      "Interpret feature importance cautiously.",
    ],

    sections: [
      {
        id: "rf-motivation",
        title: "Why Combine Trees?",

        explanation: [
          "A single Decision Tree can change substantially when the training sample changes.",
          "This means trees can have high variance.",
          "Random Forest trains many different trees and combines their predictions.",
          "Averaging or voting across diverse models can produce a more stable result.",
        ],

        intuition: [
          "Instead of trusting one highly variable decision maker, ask many somewhat different decision makers and aggregate their judgments.",
        ],

        importantPoints: [
          "Random Forest is an ensemble method.",
          "Its base estimators are Decision Trees.",
          "Aggregation helps reduce variance.",
        ],
      },

      {
        id: "rf-bootstrap",
        title: "Bootstrap Sampling",

        explanation: [
          "Each tree is commonly trained using a bootstrap sample of the training dataset.",
          "Bootstrap sampling draws observations with replacement.",
          "Some observations may appear multiple times in a tree's sample.",
          "Some training observations are left out of that tree's bootstrap sample.",
        ],

        intuition: [
          "Each tree receives a slightly different version of the training data.",
        ],

        importantPoints: [
          "Sampling is performed with replacement.",
          "Bootstrap datasets create diversity among trees.",
          "Unused observations can support out-of-bag evaluation.",
        ],
      },

      {
        id: "rf-feature-randomness",
        title: "Random Feature Selection",

        explanation: [
          "Random Forest introduces additional randomness by considering only a subset of features at candidate splits.",
          "This reduces the tendency for every tree to make similar decisions based on the same dominant predictors.",
          "Lower correlation among useful trees makes aggregation more effective.",
        ],

        intuition: [
          "If every tree were identical, averaging them would add little value. Random feature subsets encourage different trees to learn different structures.",
        ],

        importantPoints: [
          "Feature randomness increases diversity.",
          "Diversity helps reduce ensemble variance.",
          "max_features controls this behavior.",
        ],
      },

      {
        id: "rf-voting",
        title: "Forest Prediction",

        explanation: [
          "For classification, individual trees produce class predictions or class probabilities.",
          "The forest aggregates information across trees.",
          "For regression, predictions are commonly averaged.",
          "The combined predictor is usually more stable than one deep tree.",
        ],

        intuition: [
          "Individual trees may make different errors. Aggregation can cancel some of those errors.",
        ],

        importantPoints: [
          "Classification uses aggregated tree decisions.",
          "Regression commonly averages tree outputs.",
          "More trees generally stabilize estimates but increase computation.",
        ],
      },

      {
        id: "rf-hyperparameters",
        title: "Important Hyperparameters",

        explanation: [
          "n_estimators controls the number of trees.",
          "max_depth limits individual tree depth.",
          "max_features controls the number of candidate features considered at splits.",
          "min_samples_leaf controls minimum leaf size.",
          "class_weight can help modify the cost assigned to classes in imbalanced classification.",
        ],

        intuition: [
          "Forest performance depends both on how individual trees behave and on how diverse those trees are.",
        ],

        importantPoints: [
          "n_estimators affects ensemble size.",
          "max_depth affects tree complexity.",
          "max_features affects diversity.",
          "Tune using validation.",
        ],
      },
    ],

    visualization: {
      type: "model-lab",
      visualizationId: "random-forest",
      title: "Random Forest Model Lab",
      description:
        "Connect later to the existing ModelMind Random Forest Lab for bootstrap samples, tree diversity, voting and ensemble-boundary visualization.",
    },

    codeExamples: [
      {
        id: "rf-code",
        title: "Random Forest Classification",
        description:
          "Train and evaluate a Random Forest classifier.",
        language: "python",

        code: `from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(
    return_X_y=True
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_leaf=2,
    max_features="sqrt",
    random_state=42,
    n_jobs=-1
)

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

print(
    classification_report(
        y_test,
        predictions
    )
)

print(
    "Feature importances:",
    model.feature_importances_
)`,

        explanation: [
          "n_estimators=300 creates 300 trees.",
          "max_features='sqrt' introduces feature randomness at splits.",
          "min_samples_leaf limits very small terminal groups.",
          "n_jobs=-1 allows available CPU cores to be used.",
        ],

        commonMistakes: [
          "Assuming Random Forest cannot overfit.",
          "Treating impurity-based feature importance as causal evidence.",
          "Using the test set for hyperparameter tuning.",
        ],
      },
    ],

    practice: [
      {
        id: "rf-practice-1",
        title: "Forest Base Model",
        type: "concept",
        difficulty: "basic",
        question:
          "What type of model is used as the base estimator in a standard Random Forest?",
        instructions: [
          "Recall the name of the individual models in the ensemble.",
        ],
        hints: [
          "A forest contains many trees.",
        ],
        explanation:
          "Decision Trees are the base estimators.",
      },

      {
        id: "rf-practice-2",
        title: "Bootstrap",
        type: "concept",
        difficulty: "basic",
        question:
          "Does bootstrap sampling draw training observations with or without replacement?",
        instructions: [
          "Recall whether the same observation can appear more than once.",
        ],
        hints: [
          "Duplicates are possible.",
        ],
        explanation:
          "Bootstrap sampling draws with replacement.",
      },

      {
        id: "rf-practice-3",
        title: "Why Random Features?",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why does Random Forest consider random feature subsets at splits?",
        instructions: [
          "Think about correlation between trees.",
        ],
        hints: [
          "Identical trees provide little ensemble benefit.",
        ],
        explanation:
          "Random feature subsets encourage tree diversity and reduce correlation between trees, making aggregation more effective at reducing variance.",
      },

      {
        id: "rf-practice-4",
        title: "More Trees",
        type: "analysis",
        difficulty: "medium",
        question:
          "What is one major cost of greatly increasing n_estimators?",
        instructions: [
          "Think about computation.",
        ],
        hints: [
          "Every additional tree must be trained and used for prediction.",
        ],
        explanation:
          "Training, prediction and memory costs generally increase as more trees are added.",
      },

      {
        id: "rf-practice-5",
        title: "Forest vs Single Tree",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why is a Random Forest generally less variable than a single deep Decision Tree?",
        instructions: [
          "Connect diversity with aggregation.",
        ],
        hints: [
          "Errors from different trees can partially average out.",
        ],
        explanation:
          "The forest aggregates predictions from many diverse trees, reducing sensitivity to the particular structure learned by any one training sample.",
      },
    ],

    keyTakeaways: [
      "Random Forest combines many Decision Trees.",
      "Bootstrap sampling gives trees different training samples.",
      "Random feature subsets increase tree diversity.",
      "Aggregation reduces variance.",
      "Random Forest still requires hyperparameter validation.",
      "Feature importance must be interpreted carefully.",
    ],
  },


  // =========================================================
  // SUPPORT VECTOR MACHINE
  // Existing ModelMind lab — CONNECT LATER
  // =========================================================

  "svm": {
    overview:
      "Support Vector Machines classify data by finding a separating decision boundary with a large margin between classes. SVMs introduce important concepts including hyperplanes, support vectors, soft margins, the C parameter and kernel methods for nonlinear decision boundaries.",

    objectives: [
      "Understand hyperplanes.",
      "Understand classification margins.",
      "Understand support vectors.",
      "Understand hard and soft margins.",
      "Understand the C parameter.",
      "Understand kernels.",
      "Understand the RBF kernel and gamma.",
      "Understand why feature scaling matters.",
      "Train SVC using sklearn.",
    ],

    sections: [
      {
        id: "svm-hyperplane",
        title: "Hyperplanes",

        explanation: [
          "A linear classifier separates classes using a decision boundary.",
          "In two dimensions the boundary is a line.",
          "In three dimensions it is a plane.",
          "In higher dimensions the general term is hyperplane.",
          "Many hyperplanes may separate perfectly separable training data.",
        ],

        intuition: [
          "SVM does not merely ask for a separating boundary; it searches for one with a favorable margin.",
        ],

        importantPoints: [
          "A hyperplane is a decision boundary.",
          "Several boundaries may classify training data correctly.",
          "SVM considers margin when choosing the boundary.",
        ],
      },

      {
        id: "svm-margin",
        title: "Maximum Margin",

        explanation: [
          "The margin describes the separation between the decision boundary and nearby critical training observations.",
          "SVM seeks a boundary with a large margin under its optimization objective.",
          "A larger margin can produce a more robust separator when the assumptions are appropriate.",
        ],

        intuition: [
          "Instead of drawing a line barely squeezing between the classes, SVM attempts to create a wider corridor between them.",
        ],

        importantPoints: [
          "Margin is central to SVM.",
          "Nearby observations influence the optimal boundary most strongly.",
        ],
      },

      {
        id: "svm-support-vectors",
        title: "Support Vectors",

        explanation: [
          "Support vectors are training observations that play a direct role in defining the SVM decision boundary.",
          "They lie on or inside the margin depending on the soft-margin solution.",
          "Moving non-support-vector observations slightly may not change the fitted boundary.",
          "Moving support vectors can change it substantially.",
        ],

        intuition: [
          "The critical points closest to the boundary support the position of the separating hyperplane.",
        ],

        importantPoints: [
          "Support vectors determine the boundary.",
          "Not every training point contributes equally.",
          "Support vectors can be inspected after fitting.",
        ],
      },

      {
        id: "svm-c",
        title: "Soft Margin and C",

        explanation: [
          "Real data is often not perfectly separable.",
          "Soft-margin SVM allows some margin violations or classification errors.",
          "C controls the trade-off between margin size and penalties for violations.",
          "Large C places stronger emphasis on avoiding training violations.",
          "Small C allows more violations in exchange for stronger regularization and potentially a wider margin.",
        ],

        intuition: [
          "C controls how severely the model reacts when training observations violate the desired separation.",
        ],

        importantPoints: [
          "Large C means weaker regularization.",
          "Small C means stronger regularization.",
          "C should be tuned using validation.",
        ],
      },

      {
        id: "svm-kernel",
        title: "Kernel Trick",

        explanation: [
          "Some datasets cannot be separated effectively with a straight hyperplane in the original feature space.",
          "Kernel methods allow SVMs to represent nonlinear decision boundaries.",
          "The RBF kernel is a common nonlinear kernel.",
          "The kernel trick evaluates similarities corresponding to richer feature spaces without explicitly constructing all transformed coordinates.",
        ],

        intuition: [
          "A pattern that overlaps in the original representation may become separable when viewed through a richer notion of similarity.",
        ],

        importantPoints: [
          "Linear kernel creates linear boundaries.",
          "RBF supports nonlinear boundaries.",
          "Kernel choice affects model flexibility and computation.",
        ],
      },

      {
        id: "svm-gamma",
        title: "Gamma in the RBF Kernel",

        explanation: [
          "Gamma controls how quickly similarity decreases as observations move apart under the RBF kernel.",
          "Large gamma creates highly local influence and can produce complex boundaries.",
          "Small gamma creates broader influence and smoother boundaries.",
          "C and gamma interact and should commonly be tuned together.",
        ],

        intuition: [
          "Gamma controls how far the influence of each training observation reaches through the RBF similarity.",
        ],

        importantPoints: [
          "High gamma can produce complex local boundaries.",
          "Low gamma creates smoother influence.",
          "Tune gamma and C using cross-validation.",
        ],
      },

      {
        id: "svm-scaling",
        title: "Why Scaling Is Important",

        explanation: [
          "SVM decisions depend strongly on distances and dot products.",
          "Features with much larger numerical ranges can dominate these calculations.",
          "Standardization is therefore commonly important.",
          "The scaler should be fitted inside a Pipeline.",
        ],

        intuition: [
          "The geometry of the feature space is central to SVM, so arbitrary unit differences can change the geometry the algorithm sees.",
        ],

        importantPoints: [
          "SVM is scale-sensitive.",
          "StandardScaler is commonly used.",
          "Scaling must remain leakage-safe.",
        ],
      },
            {
        id: "svm-geometric-intuition",
        title: "Geometric Intuition of SVM",

        explanation: [
          "Support Vector Machines are fundamentally geometric models.",
          "Each training observation is represented as a point in feature space.",
          "A linear SVM searches for a hyperplane that separates classes while maintaining a favorable margin.",
          "The orientation of the hyperplane is determined by its weight vector.",
          "The intercept shifts the hyperplane through feature space.",
          "The closest important training observations constrain how wide the margin can become.",
          "Those critical observations become support vectors.",
        ],

        intuition: [
          "Imagine two groups standing on opposite sides of a road.",
          "SVM tries to build the widest possible road between them rather than merely drawing any line that separates them.",
        ],

        importantPoints: [
          "SVM is strongly connected to geometry.",
          "The weight vector controls hyperplane orientation.",
          "The intercept controls its position.",
          "Support vectors constrain the margin.",
        ],
      },

      {
        id: "svm-equation",
        title: "Equation of the Hyperplane",

        explanation: [
          "For a linear SVM, the decision function can be written using w dot x + b.",
          "The vector w contains the learned feature weights.",
          "x represents an input observation.",
          "b is the intercept.",
          "The decision boundary itself occurs where w dot x + b = 0.",
          "The sign of the decision function determines which side of the hyperplane an observation lies on.",
          "The magnitude of the decision function is related to position relative to the boundary, although geometric distance requires normalization by the magnitude of w.",
        ],

        intuition: [
          "The hyperplane equation acts like a signed geometric test: one sign means one side of the boundary and the opposite sign means the other side.",
        ],

        importantPoints: [
          "Linear decision function: w dot x + b.",
          "Boundary occurs at zero.",
          "w determines orientation.",
          "b shifts the boundary.",
        ],
      },

      {
        id: "svm-functional-geometric-margin",
        title: "Functional Margin vs Geometric Margin",

        explanation: [
          "The functional margin is related to the raw signed decision value y times (w dot x + b).",
          "However, multiplying both w and b by the same positive constant changes the functional margin without changing the actual hyperplane.",
          "The geometric margin removes this scale ambiguity by normalizing using the magnitude of w.",
          "The geometric margin therefore corresponds more directly to actual distance from the separating hyperplane.",
          "Maximum-margin SVM optimization can be formulated so that maximizing the margin becomes related to minimizing the squared norm of w under classification constraints.",
        ],

        intuition: [
          "A useful margin should represent actual geometric separation, not become artificially larger just because all coefficients were multiplied by the same number.",
        ],

        importantPoints: [
          "Functional margin depends on parameter scaling.",
          "Geometric margin corrects for the scale of w.",
          "Maximum-margin optimization is connected to minimizing the norm of w.",
        ],
      },

      {
        id: "svm-hard-margin",
        title: "Hard-Margin SVM",

        explanation: [
          "Hard-margin SVM assumes the training observations are linearly separable in the chosen feature space.",
          "It searches for a separating hyperplane while allowing no margin violations.",
          "The approach can work conceptually when classes are perfectly separable and the data contains no problematic noise.",
          "Real datasets commonly contain overlap, noise or outliers, making strict hard-margin separation impractical.",
          "This motivates soft-margin SVM.",
        ],

        intuition: [
          "Hard margin says every training observation must obey the separation rule with no exceptions.",
        ],

        importantPoints: [
          "Requires separability under the chosen representation.",
          "Allows no violations.",
          "Can be highly sensitive to outliers.",
          "Soft-margin SVM is more practical for noisy data.",
        ],
      },

      {
        id: "svm-soft-margin-deep",
        title: "Soft Margin and Slack Variables",

        explanation: [
          "Soft-margin SVM allows observations to violate the ideal margin constraints.",
          "Slack variables represent the amount of violation associated with training observations.",
          "Some observations may lie inside the margin while others may even appear on the wrong side of the decision boundary.",
          "The optimization objective balances a wide margin against penalties for these violations.",
          "The C hyperparameter controls the relative importance assigned to violation penalties.",
        ],

        intuition: [
          "Instead of demanding a perfect road with nobody entering it, soft-margin SVM allows some violations when enforcing perfection would create a poor boundary.",
        ],

        importantPoints: [
          "Slack variables quantify margin violations.",
          "Soft margin tolerates imperfect separation.",
          "C controls the penalty trade-off.",
          "This improves practicality on noisy datasets.",
        ],
      },

      {
        id: "svm-c-deep",
        title: "C in Depth",

        explanation: [
          "C controls the strength of the penalty assigned to margin violations in common SVM formulations.",
          "A large C places strong emphasis on correctly handling training observations and penalizing violations.",
          "This can encourage a narrower margin and a more training-sensitive decision boundary.",
          "A small C accepts more violations in exchange for stronger regularization and potentially a wider margin.",
          "The best C depends on the feature representation, scaling, noise and kernel.",
          "C should be selected using validation rather than training accuracy.",
        ],

        intuition: [
          "Large C says: violations are expensive.",
          "Small C says: some violations are acceptable if they buy a simpler, wider-margin solution.",
        ],

        importantPoints: [
          "Large C means weaker regularization.",
          "Small C means stronger regularization.",
          "Large C can increase overfitting risk.",
          "Very small C can underfit.",
          "C interacts with kernel settings.",
        ],
      },

      {
        id: "svm-hinge-loss",
        title: "Hinge Loss",

        explanation: [
          "Hinge loss is closely associated with linear soft-margin SVM classification.",
          "For a binary label y in {-1, +1}, a common hinge-loss expression is max(0, 1 - y f(x)).",
          "Observations correctly classified with sufficient margin receive zero hinge loss.",
          "Observations inside the margin or incorrectly classified receive positive loss.",
          "The SVM objective combines margin-related regularization with penalties associated with such violations.",
        ],

        intuition: [
          "SVM does not only ask whether a prediction is correct. It also asks whether the prediction is correct with enough margin.",
        ],

        importantPoints: [
          "Correct predictions can still incur hinge loss if their margin is insufficient.",
          "Sufficiently confident correctly separated observations can have zero hinge loss.",
          "Hinge loss connects classification errors with margin violations.",
        ],
      },

      {
        id: "svm-primal-dual",
        title: "Primal and Dual Intuition",

        explanation: [
          "SVM optimization can be expressed in primal and dual forms.",
          "The primal formulation works directly with model parameters such as the weight vector.",
          "The dual formulation expresses the solution through coefficients associated with training observations.",
          "Only observations with relevant non-zero dual coefficients become support vectors in the fitted solution.",
          "The dual formulation is especially important for kernel SVMs because feature-space inner products can be replaced by kernel evaluations.",
        ],

        intuition: [
          "The primal view asks which hyperplane parameters should be learned.",
          "The dual view asks which training observations should support that hyperplane and how strongly.",
        ],

        importantPoints: [
          "Primal and dual are two views of the optimization problem.",
          "Support vectors emerge naturally in the dual representation.",
          "The dual formulation enables the kernel trick.",
        ],
      },

      {
        id: "svm-kernel-trick-deep",
        title: "Kernel Trick in Depth",

        explanation: [
          "Some nonlinear patterns become linearly separable after transformation into a richer feature space.",
          "Explicitly constructing a very high-dimensional transformed feature representation can be expensive.",
          "Kernel functions allow the SVM to compute inner products corresponding to such transformed spaces without explicitly constructing every transformed coordinate.",
          "This is known as the kernel trick.",
          "The learned classifier can therefore represent nonlinear boundaries in the original input space.",
        ],

        intuition: [
          "Instead of physically rebuilding the dataset in a huge transformed space, the kernel lets the algorithm calculate the similarity it would have obtained there.",
        ],

        importantPoints: [
          "Kernels represent implicit feature transformations.",
          "The transformed coordinates do not always need to be explicitly constructed.",
          "Kernel choice controls the notion of similarity.",
          "Nonlinear kernels can create nonlinear decision boundaries.",
        ],
      },

      {
        id: "svm-linear-kernel",
        title: "Linear Kernel",

        explanation: [
          "The linear kernel uses an ordinary inner product between feature vectors.",
          "It produces a linear decision boundary in the original feature representation.",
          "Linear SVMs can work extremely well on high-dimensional sparse problems such as text classification.",
          "A linear kernel is usually computationally simpler than nonlinear kernels.",
          "A nonlinear kernel should not be chosen automatically when a linear boundary already generalizes well.",
        ],

        intuition: [
          "Use the original feature geometry without bending the decision boundary.",
        ],

        importantPoints: [
          "Produces a linear boundary.",
          "Useful for many high-dimensional problems.",
          "Often cheaper than nonlinear kernels.",
          "Always consider a linear baseline.",
        ],
      },

      {
        id: "svm-polynomial-kernel",
        title: "Polynomial Kernel",

        explanation: [
          "The polynomial kernel allows interactions corresponding to polynomial relationships between observations.",
          "degree controls the polynomial degree.",
          "gamma scales the contribution of the inner product in the kernel expression.",
          "coef0 controls the influence of the independent constant term.",
          "Higher degrees can create increasingly flexible boundaries but may also increase overfitting and computational difficulty.",
        ],

        intuition: [
          "The polynomial kernel allows the classifier to reason through combinations and powers of feature relationships without explicitly creating every polynomial feature.",
        ],

        importantPoints: [
          "degree matters for the polynomial kernel.",
          "gamma also affects polynomial-kernel behavior.",
          "coef0 influences polynomial and sigmoid kernels.",
          "High degree can create excessive complexity.",
        ],
      },

      {
        id: "svm-rbf-kernel",
        title: "RBF Kernel in Depth",

        explanation: [
          "The Radial Basis Function kernel measures similarity according to distance between observations.",
          "Nearby observations can have strong kernel similarity while distant observations have weaker similarity.",
          "The RBF kernel can produce highly flexible nonlinear decision boundaries.",
          "gamma determines how rapidly similarity decreases with distance.",
          "Because distance is central to the RBF kernel, feature scaling is particularly important.",
        ],

        intuition: [
          "Each training observation influences a neighborhood around itself, and gamma determines how wide that neighborhood is.",
        ],

        importantPoints: [
          "RBF is a nonlinear kernel.",
          "Distance strongly affects similarity.",
          "gamma controls locality.",
          "Scaling is important.",
        ],
      },

      {
        id: "svm-sigmoid-kernel",
        title: "Sigmoid Kernel",

        explanation: [
          "The sigmoid kernel uses a similarity function related in form to neural activation functions.",
          "Its behavior depends on gamma and coef0.",
          "It is available in SVC but is less commonly the default practical choice than linear or RBF kernels.",
          "Its suitability should be evaluated empirically rather than assumed.",
        ],

        intuition: [
          "The sigmoid kernel applies a nonlinear similarity transformation with a shape reminiscent of neural activation behavior.",
        ],

        importantPoints: [
          "Nonlinear kernel option.",
          "Uses gamma and coef0.",
          "Should be validated empirically.",
        ],
      },

      {
        id: "svm-gamma-deep",
        title: "Gamma in Depth",

        explanation: [
          "gamma controls the scale of influence in kernels such as RBF.",
          "A large gamma makes influence highly local.",
          "This allows the boundary to react strongly to nearby observations and can produce very complex shapes.",
          "A small gamma spreads influence over larger regions and tends to produce smoother boundaries.",
          "C and gamma interact strongly.",
          "A high C combined with high gamma can produce an especially flexible boundary and substantial overfitting risk.",
        ],

        intuition: [
          "Gamma controls the radius of attention around observations.",
          "Large gamma means narrow attention; small gamma means broad attention.",
        ],

        importantPoints: [
          "High gamma increases locality.",
          "Low gamma smooths influence.",
          "Very high gamma can overfit.",
          "Tune C and gamma together.",
        ],
      },

      {
        id: "svm-degree",
        title: "degree",

        explanation: [
          "degree controls the polynomial degree when kernel='poly'.",
          "It does not control the RBF kernel.",
          "Increasing degree allows higher-order nonlinear relationships.",
          "Large degrees can make the decision boundary excessively complex.",
          "The useful degree should be selected through validation.",
        ],

        intuition: [
          "degree determines how complicated the polynomial relationship is allowed to become.",
        ],

        importantPoints: [
          "Relevant to polynomial kernel.",
          "Not an RBF tuning parameter.",
          "Higher values increase polynomial flexibility.",
        ],
      },

      {
        id: "svm-coef0",
        title: "coef0",

        explanation: [
          "coef0 is an independent constant term used by polynomial and sigmoid kernels.",
          "It changes the balance between higher-order and lower-order contributions in those kernel functions.",
          "It is not an important parameter for the RBF kernel.",
          "It should therefore only be tuned when using a kernel for which it actually participates.",
        ],

        intuition: [
          "coef0 shifts how the polynomial or sigmoid similarity calculation balances its components.",
        ],

        importantPoints: [
          "Relevant to polynomial and sigmoid kernels.",
          "Not relevant to RBF behavior.",
          "Do not tune parameters that the selected kernel does not use.",
        ],
      },

      {
        id: "svm-kernel-parameter",
        title: "kernel",

        explanation: [
          "kernel determines the similarity function used by SVC.",
          "Common choices include linear, poly, rbf and sigmoid.",
          "A callable kernel can also be supplied in appropriate advanced use cases.",
          "Kernel selection changes the family of decision boundaries the model can represent.",
          "The kernel should be chosen through problem understanding and validation.",
        ],

        intuition: [
          "kernel decides what kind of geometry the SVM uses when comparing observations.",
        ],

        importantPoints: [
          "linear for linear geometry.",
          "poly for polynomial relationships.",
          "rbf for flexible distance-based nonlinear boundaries.",
          "sigmoid is another nonlinear option.",
        ],
      },

      {
        id: "svm-class-weight",
        title: "class_weight in SVC",

        explanation: [
          "class_weight changes the relative penalty associated with mistakes on different classes.",
          "It is useful when class frequencies are imbalanced or error costs differ.",
          "class_weight='balanced' derives weights inversely related to class frequencies.",
          "Class weighting changes the optimization penalties rather than creating synthetic observations.",
        ],

        intuition: [
          "Tell the SVM that violating the separation requirements for some classes should be more expensive.",
        ],

        importantPoints: [
          "Useful for imbalanced classification.",
          "Changes class-specific penalties.",
          "Evaluate with imbalance-sensitive metrics.",
        ],
      },

      {
        id: "svm-probability",
        title: "probability",

        explanation: [
          "Standard SVC decision scores are not automatically calibrated probabilities.",
          "Setting probability=True enables probability estimates through additional internal fitting work.",
          "This increases training cost.",
          "Probability estimation should only be enabled when probabilities are actually required.",
          "Probability quality should be evaluated separately from classification accuracy.",
        ],

        intuition: [
          "Distance from the margin is a decision score, not automatically a trustworthy probability.",
        ],

        importantPoints: [
          "probability=True adds computational cost.",
          "Decision scores and probabilities are different.",
          "Evaluate calibration when probabilities matter.",
        ],
      },

      {
        id: "svm-shrinking",
        title: "shrinking",

        explanation: [
          "SVC can use a shrinking heuristic during optimization.",
          "The heuristic attempts to temporarily ignore variables that are unlikely to affect the current solution significantly.",
          "This can improve optimization efficiency on some datasets.",
          "It is primarily a solver-behavior parameter rather than a direct model-capacity control.",
        ],

        intuition: [
          "Temporarily stop spending computation on candidates that currently appear unlikely to matter.",
        ],

        importantPoints: [
          "Optimization-related parameter.",
          "Can affect fitting efficiency.",
          "Not a direct regularization parameter.",
        ],
      },

      {
        id: "svm-tol",
        title: "tol",

        explanation: [
          "tol specifies the tolerance used by the stopping criterion.",
          "A smaller tolerance generally requires the optimizer to satisfy a stricter convergence condition.",
          "This can increase computation.",
          "A larger tolerance can stop optimization earlier.",
          "tol affects optimization precision rather than directly controlling decision-boundary flexibility.",
        ],

        intuition: [
          "tol decides how close is close enough before optimization stops.",
        ],

        importantPoints: [
          "Controls stopping tolerance.",
          "Smaller values can increase computation.",
          "Not the same as C or gamma.",
        ],
      },

      {
        id: "svm-max-iter",
        title: "max_iter",

        explanation: [
          "max_iter limits the number of solver iterations when a finite limit is specified.",
          "It can protect against unexpectedly long fitting processes.",
          "Stopping because the iteration limit was reached can indicate that optimization has not fully converged.",
          "Convergence warnings should be investigated rather than silently ignored.",
        ],

        intuition: [
          "max_iter is a safety limit on how long the optimization process may continue.",
        ],

        importantPoints: [
          "Limits optimization iterations.",
          "Premature stopping can hurt convergence.",
          "Investigate convergence warnings.",
        ],
      },

      {
        id: "svm-cache-size",
        title: "cache_size",

        explanation: [
          "Kernel SVM training repeatedly uses kernel calculations.",
          "cache_size controls memory allocated to the kernel cache in SVC.",
          "A larger cache can improve fitting speed when sufficient memory is available.",
          "This parameter primarily affects computational performance rather than statistical model capacity.",
        ],

        intuition: [
          "Store more previously computed kernel information so the solver does not need to repeatedly recompute it.",
        ],

        importantPoints: [
          "Computational parameter.",
          "Measured in memory allocation.",
          "Can affect fitting speed.",
          "Does not directly control overfitting.",
        ],
      },

      {
        id: "svm-decision-function-shape",
        title: "decision_function_shape",

        explanation: [
          "SVC internally handles multiclass problems using pairwise binary classification machinery.",
          "decision_function_shape controls the shape of the exposed multiclass decision function.",
          "Common exposed behavior includes one-vs-rest-shaped outputs even though the underlying SVC training uses one-vs-one decomposition.",
          "This parameter affects how multiclass decision scores are represented rather than changing the core binary margin idea.",
        ],

        intuition: [
          "Multiclass SVM combines several binary separation problems, and this setting controls how the resulting decision scores are presented.",
        ],

        importantPoints: [
          "Relevant to multiclass SVC.",
          "SVC internally uses pairwise classifiers.",
          "Do not confuse output score shape with the underlying training decomposition.",
        ],
      },

      {
        id: "svm-break-ties",
        title: "break_ties",

        explanation: [
          "In supported multiclass SVC settings, break_ties can use decision-function confidence information to resolve tied class votes.",
          "This requires additional computational work.",
          "It is only relevant under appropriate multiclass decision-function configurations.",
        ],

        intuition: [
          "When multiple classes receive the same vote count, use additional decision information to choose between them.",
        ],

        importantPoints: [
          "Multiclass-specific behavior.",
          "Can add computation.",
          "Not a general regularization parameter.",
        ],
      },

      {
        id: "svm-random-state",
        title: "random_state",

        explanation: [
          "SVC is largely deterministic for its core optimization, but random_state is relevant to specific randomized behavior such as probability-estimation procedures.",
          "It should therefore not be treated as a primary SVM complexity hyperparameter.",
          "Its main role is reproducibility when the enabled estimator behavior uses randomness.",
        ],

        intuition: [
          "Use random_state to reproduce relevant random procedures, not to make the margin inherently better.",
        ],

        importantPoints: [
          "Reproducibility-related.",
          "Not a direct capacity control.",
          "Only affects estimator behavior that actually uses randomness.",
        ],
      },

      {
        id: "svm-svc-vs-linear-svc",
        title: "SVC vs LinearSVC",

        explanation: [
          "SVC supports kernel methods and can create nonlinear decision boundaries.",
          "LinearSVC is specialized for linear Support Vector classification.",
          "LinearSVC uses a different underlying optimization implementation and scales more effectively to many large linear problems.",
          "For high-dimensional sparse datasets, LinearSVC can be substantially more practical than kernel SVC.",
          "The estimators do not expose exactly the same API or parameter set.",
        ],

        intuition: [
          "Use SVC when kernel flexibility matters; consider LinearSVC when the desired boundary is linear and scale is important.",
        ],

        importantPoints: [
          "SVC supports kernels.",
          "LinearSVC is linear-only.",
          "LinearSVC can scale better to large linear problems.",
          "Do not assume their parameters are identical.",
        ],
      },

      {
        id: "svm-svr",
        title: "Support Vector Regression (SVR)",

        explanation: [
          "Support Vector principles can also be used for regression.",
          "SVR attempts to fit a function while tolerating prediction errors within an epsilon-wide tube.",
          "Errors inside the epsilon tube can receive no penalty under epsilon-insensitive loss.",
          "Observations outside the tube influence the regression solution more strongly.",
          "C controls the penalty for deviations beyond the tolerated region.",
          "Kernel methods allow nonlinear SVR relationships.",
        ],

        intuition: [
          "Instead of forcing every prediction onto the target exactly, SVR creates a tolerance tube and focuses on errors that escape outside it.",
        ],

        importantPoints: [
          "SVR predicts continuous targets.",
          "epsilon controls the tolerance tube.",
          "C controls violation penalties.",
          "Kernels allow nonlinear regression.",
        ],
      },

      {
        id: "svm-svr-epsilon",
        title: "epsilon in SVR",

        explanation: [
          "epsilon defines the width of the epsilon-insensitive region around the regression function.",
          "Prediction errors smaller than epsilon can be ignored by the epsilon-insensitive loss.",
          "A larger epsilon tolerates larger deviations before they are penalized.",
          "A smaller epsilon attempts to fit targets more closely and can increase the number of support vectors.",
          "epsilon is an SVR parameter and should not be presented as an SVC classification parameter.",
        ],

        intuition: [
          "epsilon defines how much regression error the model is willing to forgive.",
        ],

        importantPoints: [
          "SVR-specific parameter.",
          "Controls tolerance around the regression function.",
          "Larger epsilon ignores larger errors.",
          "Do not mix it into SVC classification parameters.",
        ],
      },

      {
        id: "svm-svr-parameters",
        title: "Important SVR Parameters",

        explanation: [
          "SVR uses C to control penalties for deviations outside the tolerated region.",
          "epsilon controls the width of the epsilon-insensitive tube.",
          "kernel determines the similarity function.",
          "gamma affects applicable kernels such as RBF.",
          "degree and coef0 matter only for kernels that use them.",
          "tol and max_iter affect optimization stopping behavior.",
          "SVR parameters should be interpreted in the regression context rather than copied blindly from SVC.",
        ],

        intuition: [
          "SVR combines margin-style regularization with a regression-specific tolerance tube.",
        ],

        importantPoints: [
          "C controls violation penalty.",
          "epsilon is regression-specific.",
          "kernel controls linear versus nonlinear relationships.",
          "gamma matters for applicable kernels.",
        ],
      },

      {
        id: "svm-multiclass",
        title: "Multiclass SVM",

        explanation: [
          "The fundamental SVM formulation is naturally binary.",
          "Multiclass classification therefore combines multiple binary classification problems.",
          "SVC uses one-vs-one training internally.",
          "Other linear SVM implementations can use different multiclass strategies.",
          "Understanding the estimator's multiclass strategy is important when interpreting decision scores and computational cost.",
        ],

        intuition: [
          "For more than two classes, solve several smaller separation problems and combine their results.",
        ],

        importantPoints: [
          "Core SVM is binary.",
          "SVC internally uses one-vs-one.",
          "Multiclass strategy affects computation and score interpretation.",
        ],
      },

      {
        id: "svm-scaling-deep",
        title: "Feature Scaling in Depth",

        explanation: [
          "SVM is sensitive to feature scale because inner products, distances and margins depend on feature geometry.",
          "If one feature ranges from 0 to 1 while another ranges from 0 to one million, the second feature can dominate geometric calculations.",
          "StandardScaler is therefore commonly used for numerical SVM features.",
          "The scaler must be fitted only on training data.",
          "A Pipeline is an effective way to ensure scaling remains leakage-safe during cross-validation and final fitting.",
        ],

        intuition: [
          "Changing feature units can reshape the geometric world in which SVM searches for a margin.",
        ],

        importantPoints: [
          "Scaling is usually important.",
          "Fit scalers on training data only.",
          "Use Pipeline for leakage-safe validation.",
          "Scaling can change the optimal C and gamma.",
        ],
      },

      {
        id: "svm-bias-variance",
        title: "Bias-Variance Behavior",

        explanation: [
          "SVM flexibility depends strongly on C, kernel choice and kernel-specific parameters.",
          "A very restrictive linear model or very small C can underfit complex structure.",
          "A highly flexible nonlinear kernel with aggressive C and gamma settings can overfit.",
          "The useful configuration balances margin regularization against boundary flexibility.",
          "Validation curves can help diagnose this trade-off.",
        ],

        intuition: [
          "Control both how much the SVM bends and how strongly it tries to satisfy individual training observations.",
        ],

        importantPoints: [
          "Small C increases regularization.",
          "Large C reduces regularization.",
          "Kernel controls boundary family.",
          "Gamma strongly affects RBF flexibility.",
        ],
      },

      {
        id: "svm-complexity",
        title: "Computational Complexity",

        explanation: [
          "Kernel SVMs can become computationally expensive as the number of training observations grows.",
          "Training requires solving an optimization problem involving relationships among observations.",
          "Memory requirements can also become substantial because kernel calculations must be managed.",
          "Prediction cost depends partly on the number of support vectors.",
          "Linear SVM implementations are often more practical for very large high-dimensional datasets.",
        ],

        intuition: [
          "Kernel SVM gets its flexibility by reasoning about relationships among training observations, and that becomes expensive when there are very many observations.",
        ],

        importantPoints: [
          "Kernel SVM may scale poorly to huge datasets.",
          "Number of support vectors affects prediction cost.",
          "LinearSVC can be preferable for large linear problems.",
          "cache_size can affect fitting performance.",
        ],
      },

      {
        id: "svm-class-imbalance",
        title: "SVM and Class Imbalance",

        explanation: [
          "Overall accuracy can hide weak minority-class performance.",
          "class_weight can assign different penalties to different classes.",
          "The balanced strategy can derive weights from class frequencies.",
          "Evaluation should include metrics such as precision, recall, F1 score and the confusion matrix when imbalance matters.",
          "Decision thresholds and probability calibration may require additional consideration depending on the application.",
        ],

        intuition: [
          "If one class is rare, make mistakes involving that class matter appropriately during optimization and evaluation.",
        ],

        importantPoints: [
          "Use class_weight when appropriate.",
          "Do not rely only on accuracy.",
          "Inspect class-specific metrics.",
        ],
      },

      {
        id: "svm-tuning",
        title: "SVM Tuning Strategy",

        explanation: [
          "Begin with leakage-safe feature scaling.",
          "Try a linear baseline before assuming nonlinear structure is necessary.",
          "For RBF SVC, C and gamma are the central hyperparameters to tune together.",
          "Search values across logarithmic ranges rather than only tiny linear changes.",
          "For polynomial kernels, also consider degree and coef0 when relevant.",
          "Use cross-validation on training data.",
          "Keep the final test set untouched until model selection is complete.",
        ],

        intuition: [
          "First choose the geometry, then tune how strongly the model follows the data and how local its influence should be.",
        ],

        importantPoints: [
          "Scale first.",
          "Validate kernel choice.",
          "Tune C and gamma jointly for RBF.",
          "Use cross-validation.",
          "Never tune on the test set.",
        ],
      },

      {
        id: "svm-failure-modes",
        title: "SVM Failure Modes",

        explanation: [
          "Unscaled features can distort margins and kernel similarities.",
          "Very large C can make the model excessively sensitive to training observations.",
          "Very small C can create excessive regularization.",
          "Very large gamma with RBF can produce highly localized overfitting.",
          "Very small gamma can make the boundary too smooth.",
          "Kernel SVM can become impractical on extremely large datasets.",
          "Enabling probability estimation unnecessarily increases fitting cost.",
          "Poor kernel selection can create either underfitting or unnecessary complexity.",
        ],

        intuition: [
          "Most SVM problems can be investigated through geometry, scaling, C, kernel choice, gamma and dataset size.",
        ],

        importantPoints: [
          "Check scaling.",
          "Check C.",
          "Check gamma.",
          "Check kernel.",
          "Check convergence.",
          "Check computational feasibility.",
        ],
      },

      {
        id: "svm-vs-logistic",
        title: "SVM vs Logistic Regression",

        explanation: [
          "Logistic Regression models class probability through a logistic decision function.",
          "Linear SVM focuses on maximizing margin under its classification objective.",
          "Both can create linear decision boundaries.",
          "Logistic Regression naturally provides probability estimates.",
          "SVM decision scores are margin-based and probability estimation requires additional work.",
          "Kernel SVM can represent nonlinear boundaries without manually constructing explicit nonlinear features.",
        ],

        intuition: [
          "Logistic Regression asks for a probabilistic linear separator; linear SVM asks for a margin-oriented linear separator.",
        ],

        importantPoints: [
          "Both can be linear classifiers.",
          "Their loss functions differ.",
          "Probability behavior differs.",
          "Kernel SVM adds nonlinear flexibility.",
        ],
      },

      {
        id: "svm-vs-knn",
        title: "SVM vs KNN",

        explanation: [
          "KNN stores training observations and predicts from nearby neighbors.",
          "SVM learns a decision function determined especially by support vectors.",
          "Both are sensitive to feature scaling.",
          "KNN can have inexpensive training but expensive prediction.",
          "SVM performs substantial optimization during training and prediction depends on the learned support-vector representation.",
        ],

        intuition: [
          "KNN asks nearby examples every time a prediction is needed; SVM learns a separating boundary beforehand.",
        ],

        importantPoints: [
          "Both require careful scaling.",
          "KNN is neighbor-based.",
          "SVM is margin-based.",
          "Their training and prediction costs differ.",
        ],
      },

      {
        id: "svm-vs-tree",
        title: "SVM vs Decision Tree",

        explanation: [
          "SVM uses geometric margins and similarity functions.",
          "Decision Trees use recursive threshold rules.",
          "SVM usually benefits strongly from scaling.",
          "Ordinary Decision Trees generally do not require feature scaling.",
          "Trees can be easier to interpret as explicit rules.",
          "Kernel SVM can produce powerful smooth nonlinear boundaries.",
        ],

        intuition: [
          "SVM thinks geometrically; a Decision Tree thinks through a sequence of threshold questions.",
        ],

        importantPoints: [
          "Different modeling assumptions.",
          "Different preprocessing requirements.",
          "Trees are usually more directly interpretable.",
          "SVM can be powerful in high-dimensional spaces.",
        ],
      },

      {
        id: "svm-real-world",
        title: "Real-World Applications",

        explanation: [
          "SVMs have been used for text classification, image-related classification, bioinformatics, handwriting recognition and many medium-sized high-dimensional classification problems.",
          "Linear SVMs are especially useful for sparse text representations.",
          "Kernel SVMs are useful when nonlinear geometry is important and the dataset size remains computationally manageable.",
          "SVR extends the same family of ideas to continuous-target prediction.",
        ],

        intuition: [
          "SVM is particularly attractive when the geometry of the feature space contains a strong separating structure.",
        ],

        importantPoints: [
          "Text classification.",
          "High-dimensional classification.",
          "Nonlinear kernel classification.",
          "SVR for regression.",
        ],
      },

      {
        id: "svm-exam-interview",
        title: "SVM: Exam and Interview Essentials",

        explanation: [
          "Define a hyperplane and maximum margin.",
          "Explain what support vectors are.",
          "Explain hard margin versus soft margin.",
          "Explain the effect of C.",
          "Explain hinge loss.",
          "Explain the kernel trick.",
          "Differentiate linear, polynomial and RBF kernels.",
          "Explain the effect of gamma.",
          "Explain why scaling matters.",
          "Explain SVC versus LinearSVC.",
          "Explain SVR and epsilon.",
          "Know that SVC internally uses a one-vs-one strategy for multiclass training.",
          "Explain why kernel SVM can become expensive on very large datasets.",
        ],

        intuition: [
          "A strong SVM answer connects geometry, margin, support vectors, regularization and kernels rather than memorizing parameter definitions separately.",
        ],

        importantPoints: [
          "Hyperplane.",
          "Maximum margin.",
          "Support vectors.",
          "C.",
          "Hinge loss.",
          "Kernel trick.",
          "Gamma.",
          "Scaling.",
          "SVC vs LinearSVC.",
          "SVR.",
        ],
      },
    ],

    visualization: {
      type: "model-lab",
      visualizationId: "svm",
      title: "Support Vector Machine Lab",
      description:
        "Connect later to the existing ModelMind SVM Lab to explore margins, support vectors, C, kernels, gamma and nonlinear decision boundaries.",
    },

    codeExamples: [
      {
        id: "svm-code",
        title: "RBF SVM Classification",
        description:
          "Train an RBF SVM with leakage-safe feature scaling.",
        language: "python",

        code: `from sklearn.datasets import load_breast_cancer
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = load_breast_cancer(
    return_X_y=True
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

model = Pipeline([
    (
        "scaler",
        StandardScaler()
    ),
    (
        "svm",
        SVC(
            kernel="rbf",
            C=1.0,
            gamma="scale",
            probability=True
        )
    )
])

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

probabilities = model.predict_proba(
    X_test
)[:, 1]

print(
    classification_report(
        y_test,
        predictions
    )
)

print(
    "First probabilities:",
    probabilities[:5]
)`,

        explanation: [
          "StandardScaler is fitted within the Pipeline.",
          "kernel='rbf' enables a nonlinear decision boundary.",
          "C controls regularization and violation penalties.",
          "gamma controls the RBF influence scale.",
          "probability=True enables probability estimates but adds computational work.",
        ],

        commonMistakes: [
          "Using unscaled features with dramatically different ranges.",
          "Tuning C and gamma on the final test set.",
          "Assuming a nonlinear kernel is always superior.",
          "Enabling probability estimates when they are unnecessary and ignoring the extra cost.",
        ],
      },
    ],

    practice: [
      {
        id: "svm-practice-1",
        title: "Decision Boundary",
        type: "concept",
        difficulty: "basic",
        question:
          "What is the general name for the separating boundary used by a linear SVM in higher-dimensional space?",
        instructions: [
          "Recall the geometry term.",
        ],
        hints: [
          "In 2D it appears as a line.",
        ],
        explanation:
          "It is called a hyperplane.",
      },

      {
        id: "svm-practice-2",
        title: "Support Vectors",
        type: "concept",
        difficulty: "basic",
        question:
          "Which training observations are especially important in defining the SVM boundary?",
        instructions: [
          "Recall the algorithm's name for the critical points.",
        ],
        hints: [
          "They support the margin.",
        ],
        explanation:
          "Support vectors are especially important in defining the fitted boundary.",
      },

      {
        id: "svm-practice-3",
        title: "C Parameter",
        type: "analysis",
        difficulty: "medium",
        question:
          "Does a very large C generally impose stronger or weaker regularization in SVC?",
        instructions: [
          "Think about how heavily margin violations are penalized.",
        ],
        hints: [
          "Large C strongly penalizes violations.",
        ],
        explanation:
          "A large C generally corresponds to weaker regularization because the model places stronger emphasis on fitting training observations with fewer violations.",
      },

      {
        id: "svm-practice-4",
        title: "RBF Gamma",
        type: "analysis",
        difficulty: "medium",
        question:
          "What kind of boundary can very large gamma encourage in an RBF SVM?",
        instructions: [
          "Think about highly local influence.",
        ],
        hints: [
          "Each observation affects a smaller neighborhood.",
        ],
        explanation:
          "Very large gamma can encourage highly localized and complex boundaries, increasing overfitting risk.",
      },

      {
        id: "svm-practice-5",
        title: "Scaling",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can feature scaling substantially change an SVM model?",
        instructions: [
          "Think about geometric distances and inner products.",
        ],
        hints: [
          "Large-scale dimensions can dominate geometry.",
        ],
        explanation:
          "SVM depends on the geometry of the feature space. Features with larger numerical scales can dominate distance or similarity calculations unless the representation is appropriately scaled.",
      },

      {
        id: "svm-practice-6",
        title: "Kernel Choice",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why should you not automatically choose an RBF kernel over a linear kernel?",
        instructions: [
          "Consider complexity, data size and validation.",
        ],
        hints: [
          "More flexible does not automatically mean better generalization.",
        ],
        explanation:
          "A linear boundary may already generalize well, can be easier and cheaper to fit, and may be preferable for some high-dimensional datasets. Kernel choice should be validated.",
      },
    ],

    keyTakeaways: [
      "SVM searches for a separating hyperplane with a favorable margin.",
      "Support vectors play a direct role in defining the boundary.",
      "C controls the soft-margin regularization trade-off.",
      "Kernel methods enable nonlinear boundaries.",
      "RBF gamma controls locality of influence.",
      "SVM is strongly affected by feature scaling.",
      "C, gamma and kernel choice should be validated.",
    ],
  },
};


