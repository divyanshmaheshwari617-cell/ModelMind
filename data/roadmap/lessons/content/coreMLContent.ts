import type { DeepLessonRegistry } from "./lessonContentTypes";

export const coreMLContent: DeepLessonRegistry = {
  // =========================================================
  // ML FOUNDATIONS
  // =========================================================

  "ml-foundations": {
    overview:
      "Machine learning is the process of learning useful patterns from data so that a system can make predictions or decisions on new observations. This lesson builds the mental model required for every algorithm that follows: features, targets, training, inference, supervised learning, unsupervised learning, generalization and the complete ML workflow.",

    objectives: [
      "Explain what machine learning actually learns from data.",
      "Differentiate features, targets, samples and predictions.",
      "Differentiate supervised and unsupervised learning.",
      "Recognize regression, classification and clustering problems.",
      "Explain training, inference and generalization.",
      "Understand the basic end-to-end ML workflow.",
    ],

    sections: [
      {
        id: "ml-foundations-what-is-ml",
        title: "What Machine Learning Really Means",

        explanation: [
          "Traditional programming usually starts with explicitly written rules. Data and those rules are processed to produce an output.",
          "Machine learning changes this relationship. Instead of manually writing every decision rule, we provide examples and allow an algorithm to estimate patterns or parameters from those examples.",
          "The result of training is a model. The model represents relationships learned from the training data.",
          "The purpose is not to memorize the training dataset. The important goal is generalization: performing well on new observations that were not used to train the model.",
        ],

        intuition: [
          "Imagine teaching someone to identify expensive houses. Instead of giving thousands of exact rules, you show examples containing area, location, rooms and selling price.",
          "Over time the learner discovers relationships between those inputs and prices. Machine learning follows the same broad idea mathematically.",
        ],

        importantPoints: [
          "Data contains examples.",
          "Algorithms search for useful patterns.",
          "Training produces a model.",
          "Inference uses the trained model on new data.",
          "Generalization matters more than memorization.",
        ],
      },

      {
        id: "ml-foundations-features-targets",
        title: "Samples, Features and Targets",

        explanation: [
          "A dataset normally contains rows and columns. A row usually represents one observation or sample.",
          "Features are the input variables supplied to a model. They describe the observation.",
          "The target is the quantity that a supervised-learning model attempts to predict.",
          "For a house-price problem, area, number of rooms and age may be features while price is the target.",
          "Not every column should automatically become a feature. IDs, leaked information and post-outcome variables can make a model misleading.",
        ],

        intuition: [
          "Think of features as clues and the target as the answer we want the model to learn to predict.",
        ],

        importantPoints: [
          "Rows usually represent observations.",
          "Features are model inputs.",
          "The target is the prediction objective.",
          "Feature selection requires reasoning, not just selecting every column.",
        ],
      },

      {
        id: "ml-foundations-supervised",
        title: "Supervised Learning",

        explanation: [
          "Supervised learning uses training examples where the desired output is already known.",
          "The algorithm compares its predictions with known targets and adjusts itself to reduce prediction error.",
          "Two major supervised-learning problem families are regression and classification.",
          "Regression predicts numerical quantities such as price, demand or temperature.",
          "Classification predicts categories such as spam versus not spam, disease versus no disease, or customer churn versus retention.",
        ],

        intuition: [
          "Supervised learning is similar to practicing with an answer key. The learner can compare its answer with the correct answer and improve.",
        ],

        importantPoints: [
          "Supervised datasets contain targets.",
          "Regression predicts numerical values.",
          "Classification predicts classes or class probabilities.",
        ],
      },

      {
        id: "ml-foundations-unsupervised",
        title: "Unsupervised Learning",

        explanation: [
          "Unsupervised learning works without a conventional labeled target.",
          "Instead of learning a direct mapping from inputs to known outputs, the algorithm attempts to discover structure in the input data.",
          "Clustering groups similar observations. Dimensionality-reduction methods create smaller representations that preserve important information.",
          "K-Means and PCA are important examples that appear later in the roadmap.",
        ],

        intuition: [
          "Imagine receiving customer data without being told which customer belongs to which group. An unsupervised algorithm can search for naturally occurring patterns or groups.",
        ],

        importantPoints: [
          "There is usually no labeled prediction target.",
          "Clustering searches for groups.",
          "Dimensionality reduction searches for compact representations.",
        ],
      },

      {
        id: "ml-foundations-workflow",
        title: "The Machine-Learning Workflow",

        explanation: [
          "A good ML project starts with a clearly defined problem and target rather than immediately selecting an algorithm.",
          "The data is then inspected, cleaned and explored.",
          "Training and evaluation data must be separated carefully so that evaluation remains trustworthy.",
          "Preprocessing and feature engineering prepare information for the model.",
          "A baseline model provides a reference point.",
          "Candidate models are trained, validated and improved.",
          "The final model is evaluated using metrics that match the real objective.",
          "Error analysis and interpretation help determine why the model succeeds or fails.",
        ],

        intuition: [
          "Machine learning is a pipeline of decisions. The algorithm is only one component of the complete system.",
        ],

        importantPoints: [
          "Problem definition comes before model selection.",
          "Evaluation must be designed before extensive tuning.",
          "Preprocessing must avoid leakage.",
          "A baseline provides context.",
          "Metrics should match the actual objective.",
        ],
      },
    ],

    codeExamples: [
      {
        id: "ml-foundations-first-workflow",
        title: "Your First Complete ML Workflow",
        description:
          "Train a simple classifier while observing the major stages of a supervised-learning workflow.",
        language: "python",

        code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# 1. Load a dataset
data = load_iris()

# Features
X = data.data

# Target
y = data.target

print("Feature matrix:", X.shape)
print("Target vector:", y.shape)

# 2. Separate training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# 3. Create the model
model = LogisticRegression(max_iter=500)

# 4. Learn from training data
model.fit(X_train, y_train)

# 5. Predict unseen test observations
predictions = model.predict(X_test)

# 6. Evaluate
accuracy = accuracy_score(y_test, predictions)

print("Accuracy:", accuracy)

# 7. Predict one observation
sample = X_test[:1]
prediction = model.predict(sample)

print("Sample:", sample)
print("Predicted class:", prediction[0])`,

        explanation: [
          "X contains the model inputs while y contains the target.",
          "train_test_split creates separate training and testing sets.",
          "fit() is the training stage: the model learns from X_train and y_train.",
          "predict() performs inference.",
          "The test data is used to estimate performance on observations the model did not train on.",
          "Accuracy is useful for this simple demonstration, but later lessons explain why one metric is not appropriate for every problem.",
        ],

        commonMistakes: [
          "Training and evaluating on exactly the same observations.",
          "Using the test set repeatedly while tuning the model.",
          "Confusing features with the target.",
          "Choosing a metric without considering the actual problem.",
        ],
      },
    ],

    practice: [
      {
        id: "ml-foundations-practice-1",
        title: "Identify the ML Problem",
        type: "concept",
        difficulty: "basic",

        question:
          "A hospital wants to predict whether a patient will be readmitted within 30 days. What kind of machine-learning problem is this?",

        instructions: [
          "Identify whether the problem is supervised or unsupervised.",
          "Identify whether it is regression, classification or clustering.",
          "State a possible target.",
          "Give three possible features.",
        ],

        hints: [
          "The desired output has two possible states.",
          "The hospital has historical outcomes.",
        ],

        explanation:
          "This is supervised binary classification. The target could be readmitted within 30 days: yes or no. Features could include age, diagnosis information, previous admissions, length of stay or relevant clinical measurements.",
      },

      {
        id: "ml-foundations-practice-2",
        title: "Features vs Target",
        type: "analysis",
        difficulty: "basic",

        question:
          "For a house-price prediction system, classify area, bedrooms, location, house age and selling price as features or target.",

        instructions: [
          "Identify the prediction objective.",
          "Separate model inputs from the desired output.",
          "Explain why the target should not be included in X.",
        ],

        hints: [
          "The system is trying to estimate selling price.",
        ],

        explanation:
          "Area, bedrooms, location and house age are candidate features. Selling price is the target. Including the target itself as an input would make evaluation meaningless and is a direct form of leakage.",
      },

      {
        id: "ml-foundations-practice-3",
        title: "Find the Workflow Error",
        type: "analysis",
        difficulty: "medium",

        question:
          "A student trains a model using the complete dataset and then reports accuracy on that same complete dataset. What is wrong with this evaluation?",

        instructions: [
          "Explain what information the model has already seen.",
          "Explain why training accuracy is not enough.",
          "Describe a better evaluation strategy.",
        ],

        hints: [
          "The evaluation observations are not unseen.",
          "Think about generalization.",
        ],

        explanation:
          "The model is being evaluated on observations it already used for training. This measures training fit rather than reliable generalization. A separate validation/test strategy should be used.",
      },

      {
        id: "ml-foundations-practice-4",
        title: "Supervised or Unsupervised?",
        type: "concept",
        difficulty: "basic",

        question:
          "A retailer has customer behavior data but no predefined customer categories. It wants to discover natural customer groups. Which ML family fits the task?",

        instructions: [
          "Identify whether labels are available.",
          "Name the broad learning type.",
          "Name one suitable algorithm that appears later in ModelMind.",
        ],

        hints: [
          "There is no predefined target category.",
        ],

        explanation:
          "This is an unsupervised-learning problem. Clustering is appropriate, and K-Means is one possible algorithm.",
      },

      {
        id: "ml-foundations-practice-5",
        title: "Design a Mini ML Workflow",
        type: "analysis",
        difficulty: "medium",

        question:
          "You receive a dataset for predicting whether customers will leave a subscription service. Describe the major steps you would perform before claiming that your model works well.",

        instructions: [
          "Start with the problem and target.",
          "Include data inspection and splitting.",
          "Include preprocessing and a baseline.",
          "Include evaluation.",
          "Mention one way leakage could occur.",
        ],

        hints: [
          "Do not start your answer with hyperparameter tuning.",
          "Think about information that would not be available when a real prediction is made.",
        ],

        explanation:
          "A strong workflow defines churn and the prediction horizon, inspects and cleans data, separates evaluation data, fits preprocessing only using training information, establishes a baseline, trains candidate models, validates them with suitable metrics, performs error analysis and finally evaluates the selected approach on untouched test data.",
      },
    ],

    commonMistakes: [
      {
        id: "ml-foundations-mistake-1",
        title: "Thinking ML means choosing an algorithm",
        description:
          "A project may jump directly to Random Forest, XGBoost or another model without defining the problem and evaluation strategy.",
        correction:
          "Start with the prediction objective, target, data availability and evaluation metric.",
      },

      {
        id: "ml-foundations-mistake-2",
        title: "Training accuracy equals model quality",
        description:
          "High performance on observations used during training does not prove that the model generalizes.",
        correction:
          "Evaluate using properly separated validation or test observations.",
      },

      {
        id: "ml-foundations-mistake-3",
        title: "Every column is automatically a feature",
        description:
          "Identifiers, leaked outcomes and post-event information can create invalid models.",
        correction:
          "Ask whether each feature would genuinely be available when the prediction is made.",
      },
    ],

    keyTakeaways: [
      "Machine learning learns patterns or parameters from data.",
      "Features are inputs and the target is the desired prediction.",
      "Regression predicts numerical values while classification predicts classes or probabilities.",
      "Unsupervised learning discovers structure without a conventional labeled target.",
      "Training and inference are different stages.",
      "Generalization to unseen data is the central objective.",
      "The algorithm is only one component of an end-to-end ML workflow.",
    ],

    visualization: {
      type: "native",
      visualizationId: "ml-foundations-workflow-explorer",
      title: "Machine Learning Workflow Explorer",
      description:
        "Interactively follow data through problem definition, features and target, train/test separation, preprocessing, training, prediction and evaluation.",
    },
  },

  // =========================================================
  // TRAIN / TEST / EVALUATION
  // =========================================================

  "train-test-evaluation": {
    overview:
      "Reliable machine learning requires measuring performance on data that was not used to fit the model. This lesson explains train, validation and test sets, random splitting, stratification, reproducibility, evaluation metrics and the role of a truly untouched final test set.",

    objectives: [
      "Explain why training performance is not enough.",
      "Differentiate training, validation and test data.",
      "Use train_test_split correctly.",
      "Explain random_state and stratification.",
      "Choose evaluation metrics according to the task.",
      "Avoid using the test set as part of model development.",
    ],

    sections: [
      {
        id: "train-test-purpose",
        title: "Why We Split Data",

        explanation: [
          "A model can fit its training observations very well while performing poorly on new observations.",
          "If the same data is used for both learning and evaluation, the resulting score is usually optimistic.",
          "A holdout set creates observations that simulate future unseen data.",
          "The goal is to estimate generalization rather than memorization.",
        ],

        intuition: [
          "An exam is useful because the questions are not exactly the same examples a student memorized during practice.",
        ],

        importantPoints: [
          "Training data teaches the model.",
          "Evaluation data tests generalization.",
          "Evaluation observations should not influence training.",
        ],
      },

      {
        id: "train-validation-test",
        title: "Train, Validation and Test Sets",

        explanation: [
          "The training set is used to fit model parameters.",
          "The validation set is used during model development to compare alternatives and tune decisions.",
          "The test set should represent a final unbiased evaluation after the major development decisions are complete.",
          "For smaller datasets, cross-validation often replaces a single fixed validation split while a final test set can remain untouched.",
        ],

        intuition: [
          "Training is study material, validation is a mock exam used to improve, and the test set is the final exam.",
        ],

        importantPoints: [
          "Do not repeatedly optimize decisions using the final test set.",
          "Validation supports model development.",
          "Test evaluation should happen after selection.",
        ],
      },

      {
        id: "train-test-stratification",
        title: "Stratification and Reproducibility",

        explanation: [
          "Random splitting can accidentally create different class proportions in training and test sets, especially when classes are limited or imbalanced.",
          "Stratification attempts to preserve target class proportions across splits.",
          "random_state controls the pseudo-random split so an experiment can be reproduced.",
          "A fixed random_state does not magically make a model better; it makes the particular experiment repeatable.",
        ],

        intuition: [
          "If a dataset contains 90% class A and 10% class B, a useful split should normally preserve roughly that distribution.",
        ],

        importantPoints: [
          "Use stratification for many classification problems.",
          "Reproducibility is important when comparing experiments.",
          "One lucky split should not be treated as proof of model quality.",
        ],
      },

      {
        id: "train-test-metrics",
        title: "Evaluation Metrics",

        explanation: [
          "Regression and classification require different evaluation metrics.",
          "Regression metrics include MAE, MSE, RMSE and R².",
          "Classification metrics include accuracy, precision, recall, F1 score, ROC-AUC and others.",
          "Metric selection depends on the real-world objective and error costs.",
          "For imbalanced classification, accuracy alone can be misleading.",
        ],

        intuition: [
          "A medical screening system and a spam filter may care about very different mistakes even if both are classification problems.",
        ],

        importantPoints: [
          "Metrics encode what good performance means.",
          "Use metrics appropriate to the task.",
          "Consider the cost of false positives and false negatives.",
        ],
      },
    ],

    codeExamples: [
      {
        id: "train-test-evaluation-code",
        title: "Train/Test Split and Classification Evaluation",
        description:
          "Create a stratified split and evaluate predictions using multiple classification metrics.",
        language: "python",

        code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

data = load_breast_cancer()

X = data.data
y = data.target

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

model = LogisticRegression(
    max_iter=5000
)

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
    "Precision:",
    precision_score(
        y_test,
        predictions
    )
)

print(
    "Recall:",
    recall_score(
        y_test,
        predictions
    )
)

print(
    "F1:",
    f1_score(
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
)`,

        explanation: [
          "stratify=y asks the split to preserve class proportions.",
          "random_state=42 makes this split reproducible.",
          "The model is fitted only on X_train and y_train.",
          "Metrics are calculated from predictions on X_test.",
          "Multiple metrics reveal different aspects of classification performance.",
        ],

        commonMistakes: [
          "Scaling the complete dataset before creating the split.",
          "Training on X_test.",
          "Repeatedly tuning the model based on final test performance.",
          "Reporting accuracy without examining class imbalance or error costs.",
        ],
      },
    ],

    practice: [
      {
        id: "train-test-practice-1",
        title: "Why Not Evaluate on Training Data?",
        type: "concept",
        difficulty: "basic",
        question:
          "Why can training accuracy give an overly optimistic impression of model quality?",
        instructions: [
          "Explain what the model has already seen.",
          "Mention generalization.",
        ],
        hints: [
          "The model parameters were optimized using the training observations.",
        ],
        explanation:
          "Training performance measures fit on data that influenced the model. It therefore does not provide an independent estimate of performance on new observations.",
      },

      {
        id: "train-test-practice-2",
        title: "Validation vs Test",
        type: "analysis",
        difficulty: "medium",
        question:
          "You compare 20 model configurations and select the one with the highest test-set accuracy. Why is the test score no longer a clean final estimate?",
        instructions: [
          "Explain how the test set influenced model selection.",
          "Describe where model selection should occur instead.",
        ],
        hints: [
          "Information can leak through decisions, not only through feature columns.",
        ],
        explanation:
          "Repeatedly selecting configurations according to test performance indirectly tunes the workflow to that test set. Model selection should use training/validation procedures or cross-validation, leaving final test data untouched.",
      },

      {
        id: "train-test-practice-3",
        title: "When to Stratify",
        type: "analysis",
        difficulty: "medium",
        question:
          "A binary dataset contains 950 negative and 50 positive examples. Why could a plain random split be risky?",
        instructions: [
          "Discuss class proportions.",
          "Explain how stratification helps.",
        ],
        hints: [
          "The positive class is relatively rare.",
        ],
        explanation:
          "A random split can create uneven proportions of the rare class. Stratification helps preserve the class distribution across training and testing sets.",
      },

      {
        id: "train-test-practice-4",
        title: "Choose a Metric",
        type: "analysis",
        difficulty: "medium",
        question:
          "In a disease-screening task, missing a truly sick patient is considered much more costly than sending a healthy patient for additional testing. Which error deserves special attention?",
        instructions: [
          "Identify the relevant false prediction.",
          "Connect it with recall.",
        ],
        hints: [
          "A sick patient incorrectly predicted healthy is a false negative.",
        ],
        explanation:
          "False negatives deserve special attention. Recall measures how many actual positive cases are successfully identified, although the final metric strategy should reflect the full clinical objective.",
      },

      {
        id: "train-test-practice-5",
        title: "Spot the Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "A student standardizes all rows using StandardScaler and only afterward performs train_test_split. What is the problem?",
        instructions: [
          "Think about how the scaler learns its mean and standard deviation.",
          "Explain the safer order.",
        ],
        hints: [
          "The scaler has already inspected future test observations.",
        ],
        explanation:
          "The scaler parameters were estimated using the complete dataset, so information from test observations influenced preprocessing. Split first, then fit preprocessing using training data only.",
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "train-validation-test-explorer",
      title: "Train / Validation / Test Explorer",
      description:
        "Interactively move observations between training, validation and test sets and observe how leakage and class imbalance affect evaluation.",
    },

    keyTakeaways: [
      "Evaluation should estimate performance on unseen data.",
      "Training data fits parameters while validation data supports model development.",
      "The final test set should not guide repeated tuning decisions.",
      "Stratification can preserve class proportions.",
      "random_state improves reproducibility.",
      "Metric selection depends on the task and error costs.",
    ],
  },

  // =========================================================
  // DATA LEAKAGE
  // =========================================================

  "data-leakage": {
    overview:
      "Data leakage occurs when model development uses information that would not legitimately be available when predictions are made. Leakage can produce excellent validation scores while creating a model that fails in the real world.",

    objectives: [
      "Define data leakage precisely.",
      "Recognize target, preprocessing and temporal leakage.",
      "Explain why fitting transformations before splitting is dangerous.",
      "Use train-only fitting and pipelines to reduce leakage.",
      "Identify subtle leakage in feature engineering and model selection.",
    ],

    sections: [
      {
        id: "data-leakage-definition",
        title: "What Is Data Leakage?",

        explanation: [
          "Leakage occurs when information enters model training or model development that would not legitimately be available at prediction time.",
          "The leaked information can come directly from the target, from future events, from evaluation data or from transformations fitted using data that should have remained unseen.",
          "Leakage often makes validation metrics look unusually strong.",
          "The danger is that the evaluation no longer represents the real prediction environment.",
        ],

        intuition: [
          "Leakage is similar to seeing part of the answer sheet before taking an exam.",
        ],

        importantPoints: [
          "Leakage produces misleading evaluation.",
          "Leakage is not limited to directly including the target.",
          "Ask whether information would exist at prediction time.",
        ],
      },

      {
        id: "data-leakage-target",
        title: "Target Leakage",

        explanation: [
          "Target leakage occurs when an input feature contains information strongly connected to the target because it was created after or as a consequence of the outcome.",
          "For example, using a treatment prescribed after a diagnosis to predict that same diagnosis can leak outcome information.",
          "Identifiers or status fields can also encode the target indirectly.",
        ],

        intuition: [
          "If you want to predict whether a customer will cancel tomorrow, a field created after cancellation cannot legitimately be used.",
        ],

        importantPoints: [
          "Check when every feature becomes available.",
          "Post-outcome variables are especially suspicious.",
          "Very high performance should trigger leakage investigation.",
        ],
      },

      {
        id: "data-leakage-preprocessing",
        title: "Preprocessing Leakage",

        explanation: [
          "Many preprocessing operations learn statistics from data.",
          "StandardScaler learns means and standard deviations.",
          "SimpleImputer may learn medians or most-frequent values.",
          "Feature-selection procedures learn which features appear useful.",
          "If these operations are fitted using the complete dataset before evaluation splitting, test information influences the training workflow.",
          "The safer pattern is split first, then fit preprocessing only on training data.",
        ],

        intuition: [
          "Even though a scaler does not use target labels directly, it can still reveal information about the distribution of unseen evaluation observations.",
        ],

        importantPoints: [
          "Split before fitting learned preprocessing.",
          "Fit transformers using training data.",
          "Transform validation/test data using already-fitted transformers.",
          "Pipeline makes this workflow easier to enforce.",
        ],
      },

      {
        id: "data-leakage-cross-validation",
        title: "Leakage During Cross-Validation",

        explanation: [
          "Cross-validation does not automatically prevent leakage.",
          "If preprocessing or feature selection is performed on the complete dataset before cross-validation, every fold can indirectly contain information from its validation portion.",
          "Placing learned preprocessing inside a scikit-learn Pipeline allows each training fold to fit its own preprocessing parameters.",
        ],

        intuition: [
          "Every cross-validation fold should behave like a miniature train/validation experiment.",
        ],

        importantPoints: [
          "Preprocessing belongs inside the CV workflow.",
          "Feature selection can leak too.",
          "Pipelines make fold-specific fitting possible.",
        ],
      },

      {
        id: "data-leakage-temporal",
        title: "Temporal Leakage",

        explanation: [
          "Time-dependent problems require special care because ordinary random splitting can allow future information to influence predictions about the past.",
          "Features calculated using future observations are invalid for real-time prediction.",
          "Time-aware splitting should respect the chronological structure of the problem.",
        ],

        intuition: [
          "A forecasting system cannot use tomorrow's measurements to predict today.",
        ],

        importantPoints: [
          "Respect time order.",
          "Check feature timestamps.",
          "Use only information available before the prediction point.",
        ],
      },
    ],

    codeExamples: [
      {
        id: "data-leakage-pipeline-example",
        title: "Unsafe vs Leakage-Resistant Preprocessing",
        description:
          "Compare preprocessing before splitting with preprocessing placed inside a Pipeline.",
        language: "python",

        code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

data = load_breast_cancer()

X = data.data
y = data.target

# --------------------------------------------------
# BAD PATTERN
# --------------------------------------------------
# The scaler sees the entire dataset before the split.

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

X_train_bad, X_test_bad, y_train_bad, y_test_bad = train_test_split(
    X_scaled,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# --------------------------------------------------
# BETTER PATTERN
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

pipeline = Pipeline([
    (
        "scaler",
        StandardScaler()
    ),
    (
        "model",
        LogisticRegression(
            max_iter=5000
        )
    )
])

pipeline.fit(
    X_train,
    y_train
)

predictions = pipeline.predict(
    X_test
)

print(
    "Accuracy:",
    accuracy_score(
        y_test,
        predictions
    )
)`,

        explanation: [
          "The bad pattern calls fit_transform on all observations before splitting.",
          "The better pattern splits raw data first.",
          "Pipeline fits StandardScaler using only X_train when pipeline.fit is called.",
          "When pipeline.predict receives X_test, the already-fitted scaler transforms the test observations without relearning its statistics.",
        ],

        commonMistakes: [
          "Calling fit_transform on the entire dataset.",
          "Selecting features using the entire dataset before cross-validation.",
          "Using future information in time-dependent prediction.",
          "Assuming leakage only occurs when the target column is included in X.",
        ],
      },
    ],

    practice: [
      {
        id: "data-leakage-practice-1",
        title: "Hospital Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "You want to predict patient readmission at the moment of discharge. A feature records whether the patient attended a follow-up appointment two weeks later. Can it be used?",
        instructions: [
          "Consider the exact prediction time.",
          "Explain whether the feature exists then.",
        ],
        hints: [
          "The appointment occurs after discharge.",
        ],
        explanation:
          "No. The future follow-up outcome is not available at discharge and therefore leaks future information into the prediction.",
      },

      {
        id: "data-leakage-practice-2",
        title: "Scaler Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why is scaler.fit_transform(X) before train_test_split unsafe?",
        instructions: [
          "Explain what fit learns.",
          "Identify which observations influence those learned values.",
        ],
        hints: [
          "StandardScaler estimates distribution statistics.",
        ],
        explanation:
          "The scaler learns statistics from all observations, including those later treated as test data. Test information therefore influences training preprocessing.",
      },

      {
        id: "data-leakage-practice-3",
        title: "Feature Selection Leakage",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A student selects the 20 features most correlated with the target using the complete dataset and then runs cross-validation. Is the CV estimate trustworthy?",
        instructions: [
          "Explain how validation folds influenced feature selection.",
          "Describe the safer design.",
        ],
        hints: [
          "Feature selection itself is a learned operation.",
        ],
        explanation:
          "The estimate is optimistic because every validation fold influenced the global feature-selection step. Feature selection should occur inside the cross-validation pipeline.",
      },

      {
        id: "data-leakage-practice-4",
        title: "Temporal Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "A model predicts tomorrow's demand but one feature uses a seven-day average calculated with centered rolling windows that include future days. What is wrong?",
        instructions: [
          "Identify what the rolling calculation contains.",
          "Explain how to make the feature causal.",
        ],
        hints: [
          "Centered windows can include observations after the prediction time.",
        ],
        explanation:
          "The feature contains future demand information. Historical rolling features should be constructed only from observations available before the prediction point.",
      },

      {
        id: "data-leakage-practice-5",
        title: "Design a Safe Pipeline",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Your dataset contains missing numerical values, categorical variables and a classification target. Describe a leakage-resistant evaluation workflow.",
        instructions: [
          "Split before learned preprocessing.",
          "Include imputation and encoding.",
          "Mention Pipeline and ColumnTransformer.",
          "Mention validation or cross-validation.",
        ],
        hints: [
          "All learned transformations should be fitted only using the training portion of each evaluation split.",
        ],
        explanation:
          "Split raw data first. Create numerical and categorical preprocessing pipelines, combine them with ColumnTransformer, attach the estimator in a Pipeline and evaluate that entire pipeline using validation or cross-validation. The final test set remains untouched until final evaluation.",
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "data-leakage-simulator",
      title: "Data Leakage Simulator",
      description:
        "Compare safe and unsafe workflows and visually observe how test information can leak through scaling, imputation, feature selection and time-dependent features.",
    },

    keyTakeaways: [
      "Leakage means using information that would not legitimately be available to the model.",
      "Leakage can occur through features, time, preprocessing, feature selection and evaluation decisions.",
      "Split raw data before fitting learned preprocessing.",
      "Fit transformations using training data only.",
      "Pipelines help prevent leakage during cross-validation.",
      "Always ask when a feature becomes available relative to prediction time.",
    ],
  },

  // =========================================================
  // BIAS / VARIANCE
  // =========================================================

  "bias-variance": {
    overview:
      "Bias and variance provide a framework for understanding why models underfit or overfit. Instead of blindly increasing model complexity, this lesson teaches you to diagnose training and validation behavior and choose improvements based on evidence.",

    objectives: [
      "Differentiate bias and variance.",
      "Recognize underfitting and overfitting.",
      "Interpret training and validation errors together.",
      "Explain how model complexity affects generalization.",
      "Choose strategies for high-bias and high-variance situations.",
    ],

    sections: [
      {
        id: "bias-variance-underfitting",
        title: "Underfitting and High Bias",

        explanation: [
          "Underfitting occurs when a model is too limited to capture important structure in the data.",
          "Both training and validation performance are often poor.",
          "This situation is associated with high bias: the model makes overly restrictive assumptions.",
          "Possible remedies include using more informative features, increasing model flexibility or reducing excessive regularization.",
        ],

        intuition: [
          "Trying to represent a strongly curved relationship with a straight line can create systematic error.",
        ],

        importantPoints: [
          "Poor training performance is a key warning sign.",
          "More training data alone may not solve severe underfitting.",
          "Increasing useful model capacity can help.",
        ],
      },

      {
        id: "bias-variance-overfitting",
        title: "Overfitting and High Variance",

        explanation: [
          "Overfitting occurs when a model adapts too strongly to peculiarities or noise in the training data.",
          "Training performance may be excellent while validation performance is significantly worse.",
          "This behavior is associated with high variance.",
          "Possible remedies include regularization, simpler models, more useful training data, pruning or controlling model complexity.",
        ],

        intuition: [
          "A student who memorizes exact practice answers without understanding the concept may fail when the exam questions change.",
        ],

        importantPoints: [
          "A large train-validation gap can indicate overfitting.",
          "Perfect training performance is not automatically desirable.",
          "Generalization matters more than training fit.",
        ],
      },

      {
        id: "bias-variance-complexity",
        title: "Model Complexity",

        explanation: [
          "As model flexibility increases, training error often decreases.",
          "Validation error may initially improve because the model captures real structure.",
          "Beyond some point, additional flexibility can begin fitting noise and validation performance may deteriorate.",
          "The useful complexity level depends on the dataset, features, noise and regularization.",
        ],

        intuition: [
          "A model should be flexible enough to learn real patterns but not so flexible that every accidental fluctuation becomes a rule.",
        ],

        importantPoints: [
          "More complex is not automatically better.",
          "Training and validation behavior should be interpreted together.",
          "Cross-validation gives a more stable view than one lucky split.",
        ],
      },

      {
        id: "bias-variance-solutions",
        title: "How to Respond",

        explanation: [
          "High bias suggests increasing useful model capacity, improving features or reducing excessive constraints.",
          "High variance suggests stronger regularization, lower complexity, more useful data or variance-reducing ensemble approaches.",
          "Learning curves help distinguish these patterns.",
          "The correct intervention depends on diagnosis rather than a universal recipe.",
        ],

        intuition: [
          "Model improvement is similar to debugging: first identify the failure mode, then apply the appropriate fix.",
        ],

        importantPoints: [
          "Diagnose before tuning.",
          "Different failure modes require different interventions.",
          "Learning curves are powerful diagnostic tools.",
        ],
      },
    ],

    codeExamples: [
      {
        id: "bias-variance-polynomial-example",
        title: "Observe Underfitting and Overfitting",
        description:
          "Compare polynomial models of different complexity.",
        language: "python",

        code: `import numpy as np
import matplotlib.pyplot as plt

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

rng = np.random.RandomState(42)

X = np.linspace(
    -3,
    3,
    120
).reshape(-1, 1)

y = (
    0.5 * X[:, 0] ** 2
    + X[:, 0]
    + rng.normal(
        0,
        1.2,
        len(X)
    )
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.30,
    random_state=42
)

for degree in [1, 2, 15]:
    model = Pipeline([
        (
            "poly",
            PolynomialFeatures(
                degree=degree,
                include_bias=False
            )
        ),
        (
            "model",
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

    train_mse = mean_squared_error(
        y_train,
        train_predictions
    )

    test_mse = mean_squared_error(
        y_test,
        test_predictions
    )

    print(
        f"Degree {degree}: "
        f"train MSE={train_mse:.3f}, "
        f"test MSE={test_mse:.3f}"
    )`,

        explanation: [
          "Degree 1 may be too simple for the curved relationship and can underfit.",
          "Degree 2 matches the broad structure of the generated data.",
          "A very high degree has enough flexibility to follow noise and may create a larger train-test gap.",
          "The exact scores depend on the sample, but the diagnostic idea is to compare training and evaluation behavior.",
        ],

        commonMistakes: [
          "Calling every low score overfitting.",
          "Looking only at validation performance without checking training performance.",
          "Assuming a more complex model always improves generalization.",
          "Tuning repeatedly on the final test set.",
        ],
      },
    ],

    practice: [
      {
        id: "bias-variance-practice-1",
        title: "Diagnose High Bias",
        type: "analysis",
        difficulty: "medium",
        question:
          "A model achieves 61% training accuracy and 59% validation accuracy. What broad failure pattern might this suggest?",
        instructions: [
          "Compare both scores.",
          "Do not focus only on the gap.",
        ],
        hints: [
          "Both scores are relatively poor and close together.",
        ],
        explanation:
          "This pattern can indicate underfitting/high bias because the model performs poorly even on training data and validation performance is similarly poor.",
      },

      {
        id: "bias-variance-practice-2",
        title: "Diagnose High Variance",
        type: "analysis",
        difficulty: "medium",
        question:
          "A model achieves 99% training accuracy and 78% validation accuracy. What should you investigate?",
        instructions: [
          "Compare training and validation performance.",
          "Name at least two possible responses.",
        ],
        hints: [
          "There is a substantial generalization gap.",
        ],
        explanation:
          "The pattern suggests possible overfitting/high variance. Useful responses may include regularization, reducing model complexity, obtaining more useful data or using validation diagnostics.",
      },

      {
        id: "bias-variance-practice-3",
        title: "More Data?",
        type: "concept",
        difficulty: "medium",
        question:
          "Why might adding more training examples help a high-variance model more than a severely high-bias model?",
        instructions: [
          "Connect variance with sensitivity to the particular training sample.",
        ],
        hints: [
          "A severely underfit model may remain too simple even with more observations.",
        ],
        explanation:
          "Additional representative data can reduce a model's sensitivity to peculiarities of one training sample. But if the model class is fundamentally too restrictive, simply adding data may not remove the systematic high-bias error.",
      },

      {
        id: "bias-variance-practice-4",
        title: "Complexity Decision",
        type: "analysis",
        difficulty: "medium",
        question:
          "As tree depth increases, training error keeps falling but cross-validation error begins increasing after depth 7. What does this tell you?",
        instructions: [
          "Interpret both curves.",
          "Explain why maximum depth is a hyperparameter.",
        ],
        hints: [
          "The deeper tree continues fitting training observations.",
        ],
        explanation:
          "Beyond the useful complexity region, deeper trees appear to fit training-specific patterns without improving generalization. Maximum depth controls the bias-variance trade-off.",
      },

      {
        id: "bias-variance-practice-5",
        title: "Choose an Intervention",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A highly regularized linear model performs poorly on both training and validation data for a clearly nonlinear problem. Suggest a reasoned improvement strategy.",
        instructions: [
          "Identify the likely failure mode.",
          "Discuss model capacity and regularization.",
        ],
        hints: [
          "The current hypothesis may be too restrictive.",
        ],
        explanation:
          "The pattern suggests high bias. Reasonable experiments include reducing excessive regularization, engineering nonlinear features or trying a model capable of representing nonlinear relationships, while validating each change properly.",
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "bias-variance-complexity-explorer",
      title: "Bias–Variance Explorer",
      description:
        "Change model complexity and observe training error, validation error, underfitting and overfitting interactively.",
    },

    keyTakeaways: [
      "High bias is associated with underfitting.",
      "High variance is associated with overfitting.",
      "Training and validation performance must be interpreted together.",
      "More complexity is not automatically better.",
      "Different failure modes require different interventions.",
      "Learning and validation curves can guide model improvement.",
    ],
  },
};