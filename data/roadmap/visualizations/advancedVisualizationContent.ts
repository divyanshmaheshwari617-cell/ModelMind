import type {
  NativeVisualizationContent,
} from "./nativeVisualizationContent";

/* =========================================================
   ML FOUNDATIONS
   ========================================================= */

const mlFoundations: NativeVisualizationContent = {
  id: "ml-foundations-workflow-explorer",
  family: "workflow",

  title: "Machine Learning Workflow Explorer",

  subtitle:
    "Follow a machine-learning problem from raw data and target definition to evaluation and deployment-ready predictions.",

  concept:
    "Machine learning is not only model.fit(). A complete ML workflow includes problem definition, data preparation, splitting, preprocessing, training, validation, evaluation and reproducible inference.",

  whyItMatters:
    "Many ML failures happen outside the algorithm itself. Incorrect targets, leakage, inconsistent preprocessing and weak evaluation can invalidate an otherwise sophisticated model.",

  learningObjectives: [
    "Understand the complete supervised ML workflow.",
    "Differentiate features and target.",
    "Understand training versus inference.",
    "Recognize where preprocessing belongs.",
    "Understand why evaluation must use unseen data.",
    "Recognize reproducibility as part of ML engineering.",
  ],

  concepts: [
    {
      title: "Features",
      explanation:
        "Features are the input variables available to the model when it makes a prediction.",
    },
    {
      title: "Target",
      explanation:
        "The target is the outcome the supervised model is trained to predict.",
    },
    {
      title: "Training",
      explanation:
        "Training estimates model parameters from examples in the training data.",
    },
    {
      title: "Inference",
      explanation:
        "Inference applies the fitted workflow to new observations.",
    },
  ],

  observations: [
    {
      title: "The algorithm is only one stage",
      description:
        "A model can be mathematically correct while the overall ML experiment is invalid because of leakage or poor evaluation.",
    },
    {
      title: "Training and inference must match",
      description:
        "New observations must receive transformations compatible with those learned during training.",
    },
    {
      title: "Evaluation is part of design",
      description:
        "The metric and validation strategy should reflect the actual problem rather than being selected after seeing convenient results.",
    },
  ],

  commonMistakes: [
    "Training before clearly defining the target.",
    "Evaluating on the same examples used for fitting.",
    "Applying different preprocessing during training and prediction.",
    "Treating accuracy as the correct metric for every problem.",
    "Changing the test set repeatedly during experimentation.",
  ],

  challenges: [
    {
      question:
        "Why should the target be defined before choosing an ML algorithm?",
      hint:
        "The target determines what the model is actually learning.",
      answer:
        "The prediction objective determines the task, data availability, suitable metrics and eventually which model families make sense.",
    },
    {
      question:
        "Why is preprocessing part of the ML workflow rather than a completely separate preparation step?",
      hint:
        "Some preprocessing operations learn parameters from data.",
      answer:
        "Transformations such as imputation, scaling and encoding learn information from training data and must be reproduced consistently for validation and inference.",
    },
  ],

  keyInsight:
    "A trustworthy ML system is an end-to-end workflow, not just a fitted algorithm.",
};

const trainValidationTest: NativeVisualizationContent = {
  id: "train-validation-test-explorer",
  family: "evaluation",

  title: "Train, Validation & Test Split Explorer",

  subtitle:
    "Move observations between train, validation and test sets and understand what each split is allowed to influence.",

  concept:
    "Dataset splitting separates learning, model-development decisions and final evaluation so performance can be estimated on observations that did not influence fitting.",

  whyItMatters:
    "Without separation, a model can appear excellent because it has already seen the examples or because model choices were repeatedly optimized against them.",

  learningObjectives: [
    "Understand the training set.",
    "Understand validation data.",
    "Understand the final test set.",
    "Recognize test-set contamination.",
    "Understand stratification conceptually.",
    "Understand random-state reproducibility.",
  ],

  concepts: [
    {
      title: "Training set",
      explanation:
        "Used to fit model parameters and learned preprocessing.",
    },
    {
      title: "Validation set",
      explanation:
        "Used during development to compare configurations and make model-selection decisions.",
    },
    {
      title: "Test set",
      explanation:
        "Held back for final evaluation and should not repeatedly influence development decisions.",
    },
    {
      title: "Stratification",
      explanation:
        "For classification, stratification can help preserve class proportions across splits.",
    },
  ],

  observations: [
    {
      title: "More training data is not the only goal",
      description:
        "Keeping every observation for training leaves no independent evidence of generalization.",
    },
    {
      title: "The test set has a special role",
      description:
        "Repeatedly using test performance to choose models effectively turns the test set into validation data.",
    },
  ],

  commonMistakes: [
    "Training on the complete dataset before splitting.",
    "Repeatedly choosing models based on test performance.",
    "Ignoring severe class imbalance during splitting.",
    "Allowing duplicate or related records to appear across splits when that violates independence.",
  ],

  challenges: [
    {
      question:
        "You try 30 models and choose the one with the highest test accuracy. What happened?",
      hint:
        "The test set influenced model selection.",
      answer:
        "The test set was effectively used as validation data, so its final performance estimate is no longer fully independent.",
    },
  ],

  keyInsight:
    "A split is not merely dividing rows; it defines which information is allowed to influence each stage of model development.",
};

const dataLeakage: NativeVisualizationContent = {
  id: "data-leakage-simulator",
  family: "workflow",

  title: "Data Leakage Simulator",

  subtitle:
    "Switch leakage sources on and off and see why validation performance can become unrealistically high.",

  concept:
    "Data leakage occurs when training uses information that would not legitimately be available when predictions are made.",

  whyItMatters:
    "Leakage can produce spectacular validation scores while creating a model that fails in real use. It is one of the most dangerous ML workflow errors.",

  learningObjectives: [
    "Understand preprocessing leakage.",
    "Understand target leakage.",
    "Understand temporal leakage.",
    "Recognize duplicate/group leakage.",
    "Design leakage-safe validation.",
  ],

  concepts: [
    {
      title: "Preprocessing leakage",
      explanation:
        "Statistics or transformations are learned using observations that belong to validation or test data.",
    },
    {
      title: "Target leakage",
      explanation:
        "A feature directly or indirectly contains information about the outcome that would not be available at prediction time.",
    },
    {
      title: "Temporal leakage",
      explanation:
        "Future information is accidentally used to predict the past.",
    },
    {
      title: "Group leakage",
      explanation:
        "Highly related observations from the same entity can appear in both training and evaluation sets.",
    },
  ],

  observations: [
    {
      title: "Leakage often improves metrics",
      description:
        "That is precisely why leakage can be difficult to notice—the result may look better rather than obviously broken.",
    },
    {
      title: "Ask an availability question",
      description:
        "For every feature, ask whether this information genuinely exists at the exact moment the prediction must be made.",
    },
  ],

  commonMistakes: [
    "Scaling before the train/test split.",
    "Using post-outcome variables as predictors.",
    "Randomly splitting time-series data when future records can influence past predictions.",
    "Allowing the same person's near-duplicate observations into both training and validation.",
  ],

  challenges: [
    {
      question:
        "A hospital readmission model uses a variable recorded after the patient was readmitted. What is wrong?",
      hint:
        "Would that value exist when the original prediction was required?",
      answer:
        "It is target/temporal leakage because the feature contains future outcome information unavailable at prediction time.",
    },
    {
      question:
        "Why can fitting StandardScaler before cross-validation leak information?",
      hint:
        "Mean and standard deviation are learned from data.",
      answer:
        "Validation-fold values influence the scaling statistics used on the training fold. The scaler should be fitted independently inside each training fold.",
    },
  ],

  keyInsight:
    "If information would not exist at prediction time, the model must not learn from it.",
};

const biasVariance: NativeVisualizationContent = {
  id: "bias-variance-complexity-explorer",
  family: "statistics",

  title: "Bias–Variance & Complexity Explorer",

  subtitle:
    "Increase model complexity and observe underfitting, useful fit and overfitting conceptually.",

  concept:
    "Model complexity affects how strongly a model can adapt to training data. Too little flexibility can underfit, while excessive flexibility can capture noise and generalize poorly.",

  whyItMatters:
    "Understanding this trade-off helps explain regularization, learning curves, model selection and why the lowest training error is not automatically the best model.",

  learningObjectives: [
    "Understand underfitting.",
    "Understand overfitting.",
    "Understand bias conceptually.",
    "Understand variance conceptually.",
    "Compare training and validation behavior.",
  ],

  concepts: [
    {
      title: "High bias",
      explanation:
        "The model is too constrained to capture important structure, producing systematic error.",
    },
    {
      title: "High variance",
      explanation:
        "The model reacts strongly to details of the training sample and may generalize poorly.",
    },
    {
      title: "Generalization",
      explanation:
        "The objective is strong performance on unseen data rather than memorization of the training set.",
    },
  ],

  observations: [
    {
      title: "Training error can keep falling",
      description:
        "Increasing flexibility can continue improving training fit even after validation performance begins to worsen.",
    },
    {
      title: "Complexity is relative",
      description:
        "Whether a model is too simple depends on the structure and amount of available data.",
    },
  ],

  commonMistakes: [
    "Choosing the model with the lowest training error.",
    "Assuming a more complex model is automatically superior.",
    "Treating overfitting as something visible from training accuracy alone.",
  ],

  challenges: [
    {
      question:
        "Training accuracy is 100% but validation accuracy is 72%. What should you investigate?",
      hint:
        "Compare performance on seen and unseen data.",
      answer:
        "Potential overfitting/high variance, while also checking for split quality and distribution differences.",
    },
  ],

  keyInsight:
    "The goal is not to fit the training set as closely as possible; it is to learn structure that survives contact with unseen data.",
};

/* =========================================================
   CROSS-VALIDATION + SEARCH
   ========================================================= */

const crossValidation: NativeVisualizationContent = {
  id: "cross-validation-fold-explorer",
  family: "evaluation",

  title: "Cross-Validation Fold Explorer",

  subtitle:
    "Rotate validation folds and watch every observation participate in training and validation roles.",

  concept:
    "K-fold cross-validation partitions training data into K subsets. Each subset becomes validation data once while the remaining subsets are used for fitting.",

  whyItMatters:
    "A single validation split can be unusually easy or difficult. Cross-validation gives a more stable view of model performance across multiple partitions.",

  learningObjectives: [
    "Understand K folds.",
    "Understand fold rotation.",
    "Interpret mean CV score.",
    "Interpret score variability.",
    "Understand stratified CV.",
    "Understand preprocessing inside CV.",
  ],

  formulas: [
    {
      name: "Mean cross-validation score",
      formula: "CVmean = (s₁ + s₂ + ... + sₖ) / k",
      explanation:
        "Average the evaluation score across all K validation folds.",
    },
  ],

  concepts: [
    {
      title: "Fold",
      explanation:
        "A fold is one partition of the available training data.",
    },
    {
      title: "Validation rotation",
      explanation:
        "Each fold is held out in turn while the remaining folds train the workflow.",
    },
    {
      title: "Score variability",
      explanation:
        "Differences among fold scores provide information about performance stability.",
    },
  ],

  observations: [
    {
      title: "K models are fitted",
      description:
        "Five-fold CV does not fit one model; it repeats the fitting procedure five times.",
    },
    {
      title: "Preprocessing repeats too",
      description:
        "When preprocessing is inside a Pipeline, each fold learns its own preprocessing parameters.",
    },
    {
      title: "CV does not replace the final test set",
      description:
        "Cross-validation is generally used for development/model selection while an untouched test set can remain for final evaluation.",
    },
  ],

  commonMistakes: [
    "Preprocessing all data before cross-validation.",
    "Reporting only the best fold.",
    "Using ordinary KFold when class distribution requires stratification.",
    "Treating CV scores as independent production guarantees.",
  ],

  challenges: [
    {
      question:
        "In 5-fold CV, how many times does each observation act as validation data?",
      hint:
        "Every fold becomes validation once.",
      answer:
        "Once.",
    },
    {
      question:
        "Why inspect standard deviation across fold scores?",
      hint:
        "The average does not show stability.",
      answer:
        "Large variation can indicate that performance depends strongly on which observations happen to be in the validation fold.",
    },
  ],

  keyInsight:
    "Cross-validation evaluates the training procedure repeatedly, not merely the final model once.",
};

const hyperparameterSearch: NativeVisualizationContent = {
  id: "hyperparameter-search-explorer",
  family: "evaluation",

  title: "Hyperparameter Search Explorer",

  subtitle:
    "Explore a search space and compare parameter configurations without touching the final test set.",

  concept:
    "Hyperparameters control model behavior but are not directly learned as ordinary model parameters. Search methods evaluate candidate configurations using validation procedures such as cross-validation.",

  whyItMatters:
    "Choosing hyperparameters based on training performance encourages overfitting, while choosing them from the final test set contaminates evaluation.",

  learningObjectives: [
    "Differentiate parameters and hyperparameters.",
    "Understand GridSearchCV.",
    "Understand RandomizedSearchCV.",
    "Interpret cross-validation search scores.",
    "Understand nested pipeline parameter names.",
    "Keep the final test set separate.",
  ],

  concepts: [
    {
      title: "Parameter",
      explanation:
        "A parameter is learned during fitting, such as a regression coefficient.",
    },
    {
      title: "Hyperparameter",
      explanation:
        "A hyperparameter configures the learning process or model structure.",
    },
    {
      title: "Grid search",
      explanation:
        "Grid search evaluates specified combinations from a discrete parameter grid.",
    },
    {
      title: "Randomized search",
      explanation:
        "Randomized search samples a chosen number of parameter combinations from specified distributions or candidate sets.",
    },
  ],

  observations: [
    {
      title: "Search multiplies training work",
      description:
        "Each candidate may require several cross-validation fits.",
    },
    {
      title: "Search space quality matters",
      description:
        "A huge poorly chosen search space can waste computation without improving the experiment.",
    },
  ],

  commonMistakes: [
    "Selecting hyperparameters from test-set results.",
    "Searching meaningless parameter ranges.",
    "Forgetting preprocessing parameters can also be tuned inside a Pipeline.",
    "Assuming the best CV score is guaranteed production performance.",
  ],

  challenges: [
    {
      question:
        "Why shouldn't you choose C for an SVM by repeatedly checking final test accuracy?",
      hint:
        "What role should the test set play?",
      answer:
        "Because the test set would influence model selection. C should be selected using training/validation procedures such as cross-validation.",
    },
  ],

  keyInsight:
    "Hyperparameter tuning belongs inside model development; the final test set should remain outside the search loop.",
};

/* =========================================================
   CLASSIFICATION EVALUATION
   ========================================================= */

const classificationMetrics: NativeVisualizationContent = {
  id: "classification-metrics-explorer",
  family: "evaluation",

  title: "Classification Metrics Explorer",

  subtitle:
    "Manipulate TP, TN, FP and FN and watch accuracy, precision, recall, specificity and F1 change.",

  concept:
    "Classification metrics summarize different consequences of prediction errors. No single metric answers every decision problem.",

  whyItMatters:
    "Accuracy can hide dangerous behavior when classes are imbalanced or when false positives and false negatives have different costs.",

  learningObjectives: [
    "Understand the confusion matrix.",
    "Calculate accuracy.",
    "Calculate precision.",
    "Calculate recall.",
    "Understand specificity.",
    "Understand F1 score.",
    "Choose metrics based on error costs.",
  ],

  formulas: [
    {
      name: "Accuracy",
      formula: "(TP + TN) / (TP + TN + FP + FN)",
      explanation:
        "Fraction of all predictions that are correct.",
    },
    {
      name: "Precision",
      formula: "TP / (TP + FP)",
      explanation:
        "Among predicted positives, the fraction that are truly positive.",
    },
    {
      name: "Recall",
      formula: "TP / (TP + FN)",
      explanation:
        "Among actual positives, the fraction correctly detected.",
    },
    {
      name: "Specificity",
      formula: "TN / (TN + FP)",
      explanation:
        "Among actual negatives, the fraction correctly identified.",
    },
    {
      name: "F1",
      formula: "2 × Precision × Recall / (Precision + Recall)",
      explanation:
        "Harmonic mean of precision and recall.",
    },
  ],

  concepts: [
    {
      title: "False positive",
      explanation:
        "The model predicts positive for an actually negative example.",
    },
    {
      title: "False negative",
      explanation:
        "The model predicts negative for an actually positive example.",
    },
    {
      title: "Metric trade-off",
      explanation:
        "Changing the decision threshold can alter false-positive and false-negative rates.",
    },
  ],

  observations: [
    {
      title: "Accuracy can mislead",
      description:
        "Predicting the majority class can produce high accuracy while completely failing to identify the minority class.",
    },
    {
      title: "Error cost determines importance",
      description:
        "Medical screening and spam filtering can value false negatives and false positives very differently.",
    },
  ],

  commonMistakes: [
    "Using accuracy for every classification problem.",
    "Confusing precision with recall.",
    "Reporting F1 without understanding the underlying error trade-off.",
    "Evaluating only hard predictions when probability quality matters.",
  ],

  challenges: [
    {
      question:
        "A disease-screening system should avoid missing sick patients. Which error is especially important?",
      hint:
        "A sick patient predicted healthy is what type of error?",
      answer:
        "False negatives are especially important, so recall/sensitivity is a key metric to examine.",
    },
    {
      question:
        "A classifier predicts 990 negatives and 10 positives in a dataset with 99% negatives. Why can accuracy be misleading?",
      hint:
        "A majority-class strategy may already score highly.",
      answer:
        "High accuracy may largely reflect class imbalance rather than useful detection of the positive class.",
    },
  ],

  keyInsight:
    "Choose classification metrics from the real cost of mistakes, not from whichever metric produces the largest number.",
};

const learningCurves: NativeVisualizationContent = {
  id: "learning-curve-diagnostic-lab",
  family: "evaluation",

  title: "Learning Curve Diagnostic Lab",

  subtitle:
    "Increase training-set size and compare training and validation performance.",

  concept:
    "A learning curve plots model performance as the amount of training data changes, helping diagnose whether additional data or changes in model capacity may help.",

  whyItMatters:
    "Learning curves can distinguish patterns consistent with underfitting from patterns consistent with overfitting and help guide the next experiment.",

  learningObjectives: [
    "Read training curves.",
    "Read validation curves.",
    "Recognize high-bias patterns.",
    "Recognize high-variance patterns.",
    "Reason about whether more data may help.",
  ],

  concepts: [
    {
      title: "Training curve",
      explanation:
        "Shows performance on the observations used to fit the model.",
    },
    {
      title: "Validation curve",
      explanation:
        "Shows performance on held-out observations as training size increases.",
    },
    {
      title: "Generalization gap",
      explanation:
        "The difference between training and validation performance can reveal instability or overfitting patterns.",
    },
  ],

  observations: [
    {
      title: "Large gap can indicate variance",
      description:
        "Very strong training performance with weaker validation performance can be consistent with overfitting.",
    },
    {
      title: "Both weak can indicate bias",
      description:
        "If training and validation performance are both poor and close together, the model may be too limited for the structure.",
    },
  ],

  commonMistakes: [
    "Looking only at the final point.",
    "Assuming more data fixes every problem.",
    "Comparing training loss with validation accuracy directly.",
  ],

  challenges: [
    {
      question:
        "Training and validation scores are both low and nearly identical. What pattern should you investigate?",
      hint:
        "There is little generalization gap.",
      answer:
        "Potential underfitting/high bias.",
    },
  ],

  keyInsight:
    "Learning curves help decide whether your next move should involve more data, different capacity, stronger regularization or better features.",
};

const modelSelection: NativeVisualizationContent = {
  id: "model-selection-comparison-lab",
  family: "evaluation",

  title: "Model Selection Comparison Lab",

  subtitle:
    "Compare candidate models across validation score, stability, complexity and inference considerations.",

  concept:
    "Model selection chooses among candidate workflows using evidence from validation rather than training fit alone.",

  whyItMatters:
    "The model with the largest single validation score is not automatically the most appropriate system. Stability, interpretability, latency and operational constraints can matter too.",

  learningObjectives: [
    "Compare cross-validation results.",
    "Consider score variability.",
    "Compare model complexity.",
    "Consider inference constraints.",
    "Separate selection from final testing.",
  ],

  concepts: [
    {
      title: "Validation performance",
      explanation:
        "Candidate workflows should be compared using a consistent evaluation protocol.",
    },
    {
      title: "Stability",
      explanation:
        "A slightly higher mean score with extremely unstable folds may deserve investigation.",
    },
    {
      title: "Operational constraints",
      explanation:
        "Latency, memory, explainability and retraining cost can affect deployment suitability.",
    },
  ],

  observations: [
    {
      title: "One number is incomplete",
      description:
        "Mean score alone does not describe variability or operational behavior.",
    },
    {
      title: "Selection is problem-specific",
      description:
        "Different applications prioritize different combinations of predictive and operational properties.",
    },
  ],

  commonMistakes: [
    "Selecting based on training accuracy.",
    "Choosing from the final test set.",
    "Ignoring cross-validation variance.",
    "Ignoring deployment constraints.",
  ],

  challenges: [
    {
      question:
        "Two models score 0.912 and 0.913 mean CV accuracy. What else should you inspect before choosing?",
      hint:
        "The difference is tiny.",
      answer:
        "Fold variability, relevant task metrics, complexity, inference cost, interpretability and whether the difference is practically meaningful.",
    },
  ],

  keyInsight:
    "Model selection is evidence-based comparison under the constraints of the real problem.",
};

const calibrationThreshold: NativeVisualizationContent = {
  id: "calibration-threshold-explorer",
  family: "evaluation",

  title: "Probability Calibration & Threshold Explorer",

  subtitle:
    "Move the decision threshold and distinguish probability quality from classification decisions.",

  concept:
    "A probabilistic classifier can produce scores or probabilities, while a decision threshold converts those values into class labels. Calibration asks whether predicted probabilities correspond to observed frequencies.",

  whyItMatters:
    "Many real systems need risk estimates rather than only class labels. A 0.8 predicted probability should have meaningful interpretation if decisions depend on risk.",

  learningObjectives: [
    "Understand predicted probability.",
    "Understand decision thresholds.",
    "Understand calibration.",
    "Explore precision/recall trade-offs.",
    "Separate ranking quality from probability quality.",
  ],

  concepts: [
    {
      title: "Threshold",
      explanation:
        "The threshold determines which probability scores become positive predictions.",
    },
    {
      title: "Calibration",
      explanation:
        "A well-calibrated probability of approximately 0.8 should correspond to an event frequency near 80% among similar predictions.",
    },
    {
      title: "Threshold trade-off",
      explanation:
        "Lowering a positive-class threshold often increases recall while potentially increasing false positives.",
    },
  ],

  observations: [
    {
      title: "0.5 is not sacred",
      description:
        "The appropriate decision threshold depends on error costs and operational objectives.",
    },
    {
      title: "Classification and probability are different",
      description:
        "Two systems can produce similar class labels while having very different probability quality.",
    },
  ],

  commonMistakes: [
    "Assuming 0.5 is always the correct threshold.",
    "Treating uncalibrated scores as reliable probabilities.",
    "Selecting thresholds using the final test set.",
  ],

  challenges: [
    {
      question:
        "What usually happens to recall when the positive threshold is lowered?",
      hint:
        "More observations become positive predictions.",
      answer:
        "Recall often increases because fewer actual positives are missed, although false positives may also increase.",
    },
  ],

  keyInsight:
    "The model produces evidence; the threshold converts that evidence into a decision.",
};

const imbalancedLearning: NativeVisualizationContent = {
  id: "imbalanced-learning-resampling-lab",
  family: "evaluation",

  title: "Imbalanced Learning & Resampling Lab",

  subtitle:
    "Change class ratios and compare majority accuracy, class weighting and resampling concepts.",

  concept:
    "Class imbalance occurs when some target classes are much less frequent than others. The challenge is not imbalance itself but whether the model learns useful behavior for the important classes.",

  whyItMatters:
    "Fraud, disease and failure prediction often involve rare positive cases. Accuracy can look excellent even when the model ignores those cases.",

  learningObjectives: [
    "Recognize class imbalance.",
    "Understand majority baselines.",
    "Understand class weighting.",
    "Understand oversampling and undersampling conceptually.",
    "Choose suitable evaluation metrics.",
  ],

  concepts: [
    {
      title: "Majority baseline",
      explanation:
        "Always predicting the majority class establishes a simple baseline that can expose misleading accuracy.",
    },
    {
      title: "Class weighting",
      explanation:
        "Some algorithms can assign greater loss weight to underrepresented classes.",
    },
    {
      title: "Resampling",
      explanation:
        "Training data can be rebalanced by changing the representation of classes, but resampling must be applied only to training data.",
    },
  ],

  observations: [
    {
      title: "Accuracy can remain high",
      description:
        "A classifier can achieve 99% accuracy on a 99:1 dataset while detecting none of the rare class.",
    },
    {
      title: "Resampling belongs inside validation",
      description:
        "Oversampling before the split can duplicate information into validation data and cause leakage.",
    },
  ],

  commonMistakes: [
    "Judging imbalanced classification using accuracy alone.",
    "Oversampling before splitting.",
    "Assuming a 50:50 training distribution is always required.",
    "Ignoring probability threshold selection.",
  ],

  challenges: [
    {
      question:
        "A fraud dataset contains 0.5% fraud. A model gets 99.5% accuracy by predicting 'not fraud' every time. Is that useful?",
      hint:
        "Check minority-class detection.",
      answer:
        "No for fraud detection. The accuracy matches the majority baseline while recall for fraud is zero.",
    },
  ],

  keyInsight:
    "With imbalance, ask whether the model identifies the important minority behavior—not whether the overall accuracy looks large.",
};

/* =========================================================
   INTERPRETABILITY
   ========================================================= */

const interpretability: NativeVisualizationContent = {
  id: "model-interpretability-lab",
  family: "evaluation",

  title: "Model Interpretability Lab",

  subtitle:
    "Separate global model behavior from explanations of individual predictions.",

  concept:
    "Interpretability methods help humans inspect how features relate to model predictions, either across the model globally or for a particular observation locally.",

  whyItMatters:
    "Understanding model behavior can support debugging, validation, stakeholder communication and investigation of unexpected predictions.",

  learningObjectives: [
    "Differentiate global and local explanations.",
    "Understand feature importance conceptually.",
    "Recognize interpretation limitations.",
    "Avoid causal conclusions from predictive explanations.",
    "Use explanations as diagnostic evidence.",
  ],

  concepts: [
    {
      title: "Global explanation",
      explanation:
        "Describes broad behavior across many predictions.",
    },
    {
      title: "Local explanation",
      explanation:
        "Describes factors associated with one particular prediction.",
    },
    {
      title: "Feature importance",
      explanation:
        "Importance indicates model reliance under a particular method; it does not automatically establish causal influence.",
    },
  ],

  observations: [
    {
      title: "Importance is method-dependent",
      description:
        "Different explanation methods can measure different notions of importance.",
    },
    {
      title: "Correlated features complicate interpretation",
      description:
        "Predictive information can be shared among related variables.",
    },
  ],

  commonMistakes: [
    "Treating feature importance as causation.",
    "Assuming explanation methods reveal the true real-world mechanism.",
    "Ignoring correlated features.",
    "Using interpretability only after deployment instead of during debugging.",
  ],

  challenges: [
    {
      question:
        "A feature is highly important to a prediction model. Does that prove changing the feature will cause the target to change?",
      hint:
        "Prediction and causation are different questions.",
      answer:
        "No. Predictive importance does not establish a causal relationship.",
    },
  ],

  keyInsight:
    "Interpretability explains aspects of model behavior; it does not automatically explain the causal structure of the world.",
};

const shapContribution: NativeVisualizationContent = {
  id: "shap-contribution-lab",
  family: "evaluation",

  title: "SHAP Contribution Explorer",

  subtitle:
    "Build a prediction from a baseline plus positive and negative feature contributions.",

  concept:
    "SHAP-based explanations attribute a model prediction to feature contributions relative to a baseline under a game-theoretic framework.",

  whyItMatters:
    "Contribution views can help inspect why one prediction differs from a reference expectation, especially for complex models.",

  learningObjectives: [
    "Understand baseline prediction.",
    "Understand positive contributions.",
    "Understand negative contributions.",
    "Understand local explanation.",
    "Recognize limitations with dependence and causality.",
  ],

  formulas: [
    {
      name: "Additive explanation intuition",
      formula:
        "prediction ≈ baseline + Σ feature contributions",
      explanation:
        "For an additive SHAP explanation, contributions combine with the expected model output to reconstruct the explained output in the relevant model-output space.",
    },
  ],

  concepts: [
    {
      title: "Baseline",
      explanation:
        "A reference model output from which feature contributions move the explained prediction.",
    },
    {
      title: "Positive contribution",
      explanation:
        "Pushes the model output above the reference in the displayed output space.",
    },
    {
      title: "Negative contribution",
      explanation:
        "Pushes the model output below the reference.",
    },
  ],

  observations: [
    {
      title: "SHAP is local by default",
      description:
        "A contribution explanation describes a particular prediction; aggregating many explanations can reveal broader patterns.",
    },
    {
      title: "Contribution is not causation",
      description:
        "A feature's contribution to a prediction does not prove that intervening on that feature causes the outcome.",
    },
  ],

  commonMistakes: [
    "Calling SHAP values causal effects.",
    "Ignoring the chosen background/reference distribution.",
    "Comparing contributions without checking the model-output scale.",
  ],

  challenges: [
    {
      question:
        "If the baseline is 0.40 and contributions sum to +0.15 in a directly additive probability-space example, what is the explained value?",
      hint:
        "Add the contributions to the baseline.",
      answer:
        "0.55 in that simplified additive example.",
    },
  ],

  keyInsight:
    "SHAP decomposes model output into contributions relative to a reference; it does not turn prediction into causal explanation.",
};

/* =========================================================
   EXPERIMENTS + COMPLETE WORKFLOW
   ========================================================= */

const experimentTracking: NativeVisualizationContent = {
  id: "experiment-tracking-dashboard",
  family: "workflow",

  title: "ML Experiment Tracking Dashboard",

  subtitle:
    "Compare runs by dataset version, features, preprocessing, parameters, metrics and notes.",

  concept:
    "Experiment tracking records the conditions and results of ML runs so improvements can be reproduced and compared reliably.",

  whyItMatters:
    "Without experiment records, it becomes difficult to know why a metric changed, which dataset was used or how to reproduce a promising model.",

  learningObjectives: [
    "Understand an experiment run.",
    "Track parameters.",
    "Track metrics.",
    "Track dataset/code context.",
    "Compare experiments systematically.",
    "Recognize reproducibility requirements.",
  ],

  concepts: [
    {
      title: "Run",
      explanation:
        "One execution of an experiment with a particular configuration.",
    },
    {
      title: "Parameters",
      explanation:
        "Record settings such as hyperparameters and preprocessing choices.",
    },
    {
      title: "Metrics",
      explanation:
        "Record comparable evaluation results using a consistent validation protocol.",
    },
    {
      title: "Artifacts",
      explanation:
        "Models, plots, reports and other outputs can be associated with an experiment.",
    },
  ],

  observations: [
    {
      title: "A metric without context is weak evidence",
      description:
        "An accuracy value is difficult to interpret if you do not know the dataset version, split and preprocessing used.",
    },
    {
      title: "Reproducibility accelerates progress",
      description:
        "Good records prevent teams from repeatedly rediscovering old configurations.",
    },
  ],

  commonMistakes: [
    "Recording only the best experiment.",
    "Changing several things at once without documenting them.",
    "Comparing metrics from different validation protocols as if they were equivalent.",
    "Failing to record data versions.",
  ],

  challenges: [
    {
      question:
        "Two experiments report F1 = 0.82, but one used a different test split. Can the values be compared directly?",
      hint:
        "Were they evaluated under the same conditions?",
      answer:
        "Not necessarily. Reliable comparison requires compatible data and evaluation protocols.",
    },
  ],

  keyInsight:
    "An ML experiment is useful only when you can explain exactly what changed and reproduce the result.",
};

const completeWorkflow: NativeVisualizationContent = {
  id: "complete-ml-workflow-lab",
  family: "workflow",

  title: "Complete Machine Learning Workflow Lab",

  subtitle:
    "Assemble everything from problem definition and EDA through Pipeline, cross-validation, tuning, final testing and monitoring.",

  concept:
    "A complete ML workflow coordinates data understanding, leakage-safe preprocessing, model development, evaluation and reproducibility into one disciplined process.",

  whyItMatters:
    "Individual ML concepts become valuable when they work together correctly. This lab connects the entire roadmap into one end-to-end mental model.",

  learningObjectives: [
    "Define the ML objective.",
    "Inspect and validate data.",
    "Create leakage-safe splits.",
    "Build preprocessing pipelines.",
    "Cross-validate candidate workflows.",
    "Tune hyperparameters.",
    "Evaluate once on final test data.",
    "Record and communicate experiments.",
    "Prepare consistent inference behavior.",
  ],

  concepts: [
    {
      title: "Problem definition",
      explanation:
        "Specify the prediction target, prediction time, available features and success criteria.",
    },
    {
      title: "Data understanding",
      explanation:
        "Validate schema, quality, distributions and potential leakage before modeling.",
    },
    {
      title: "Pipeline",
      explanation:
        "Package learned preprocessing and estimation into a reproducible workflow.",
    },
    {
      title: "Validation",
      explanation:
        "Use cross-validation or an appropriate validation strategy for development decisions.",
    },
    {
      title: "Final evaluation",
      explanation:
        "Use untouched test data after development decisions have been made.",
    },
    {
      title: "Inference",
      explanation:
        "Apply the exact fitted transformation/model workflow to future observations.",
    },
  ],

  observations: [
    {
      title: "Order is essential",
      description:
        "Splitting after learned preprocessing is fundamentally different from splitting before learned preprocessing.",
    },
    {
      title: "Every learned transformation is part of training",
      description:
        "Imputers, scalers, encoders, selectors and models all learn information and should respect validation boundaries.",
    },
    {
      title: "Final testing is intentionally boring",
      description:
        "By the time the final test set is used, major modeling decisions should already be complete.",
    },
  ],

  commonMistakes: [
    "Starting with an algorithm before defining the prediction problem.",
    "Using the test set during repeated development.",
    "Performing learned preprocessing outside validation.",
    "Reporting a metric without a baseline.",
    "Failing to preserve the fitted preprocessing workflow for inference.",
  ],

  challenges: [
    {
      question:
        "Place these in a safe order: scaling, train/test split, final test evaluation, cross-validation.",
      hint:
        "The test set must not influence learned scaling parameters.",
      answer:
        "Train/test split → scaling inside the training/CV pipeline → cross-validation/model development → final test evaluation.",
    },
    {
      question:
        "Why should the same Pipeline used during training be retained for inference?",
      hint:
        "Think about feature representation.",
      answer:
        "Future observations must receive the exact transformations learned during training before they are passed to the fitted estimator.",
    },
  ],

  keyInsight:
    "Professional ML is the discipline of keeping every transformation, decision and evaluation inside the correct information boundary.",
};
const clusteringEvaluation: NativeVisualizationContent = {
  id: "clustering-evaluation-lab",

  family: "evaluation",

  title: "Clustering Evaluation Lab",

  subtitle:
    "Evaluate unsupervised clusters using cohesion, separation, silhouette score and cluster structure without relying on ordinary classification accuracy.",

  concept:
    "Clustering is usually an unsupervised task, so true class labels may not exist. Instead of asking how many labels were predicted correctly, clustering evaluation examines whether observations within the same cluster are similar and whether different clusters are well separated.",

  whyItMatters:
    "A clustering algorithm will often produce clusters even when the structure is weak. Evaluation helps determine whether those clusters represent meaningful organization or are merely an artifact of the algorithm and its settings.",

  learningObjectives: [
    "Understand why classification accuracy is usually inappropriate for unlabeled clustering.",
    "Understand intra-cluster cohesion.",
    "Understand inter-cluster separation.",
    "Understand silhouette score.",
    "Interpret silhouette values.",
    "Compare candidate numbers of clusters.",
    "Recognize limitations of clustering metrics.",
  ],

  concepts: [
    {
      title: "Cohesion",
      explanation:
        "Cohesion describes how closely observations within the same cluster are grouped together. Strong clusters generally have small within-cluster distances.",
    },
    {
      title: "Separation",
      explanation:
        "Separation describes how distinct one cluster is from other clusters. Good clustering generally places different groups sufficiently far apart.",
    },
    {
      title: "Silhouette score",
      explanation:
        "The silhouette score compares how close an observation is to its own cluster with how close it is to the nearest alternative cluster.",
    },
    {
      title: "Internal evaluation",
      explanation:
        "Internal metrics evaluate cluster structure using the data and assignments themselves rather than requiring external class labels.",
    },
    {
      title: "External evaluation",
      explanation:
        "If trustworthy reference labels happen to exist, external metrics can compare the discovered grouping with those labels, although clustering itself may still pursue a different structure.",
    },
  ],

  formulas: [
    {
      name: "Silhouette coefficient",
      formula: "s(i) = (b(i) - a(i)) / max(a(i), b(i))",
      explanation:
        "a(i) is the average distance from observation i to other observations in its own cluster. b(i) is the smallest average distance from i to observations in another cluster.",
    },
  ],

  observations: [
    {
      title: "Silhouette near +1",
      description:
        "The observation is much closer to its own cluster than to neighboring clusters, indicating strong separation.",
    },
    {
      title: "Silhouette near 0",
      description:
        "The observation lies close to a boundary between clusters or the groups overlap substantially.",
    },
    {
      title: "Negative silhouette",
      description:
        "The observation may be closer on average to another cluster than to the cluster to which it was assigned.",
    },
    {
      title: "The highest metric is not the entire story",
      description:
        "Cluster usefulness also depends on stability, domain meaning, cluster sizes and the geometry of the data.",
    },
  ],

  commonMistakes: [
    "Using classification accuracy when no meaningful ground-truth labels exist.",
    "Selecting the number of clusters from one metric without inspecting the resulting structure.",
    "Assuming a high silhouette score proves the clusters have real-world meaning.",
    "Ignoring feature scaling when clustering depends on distance.",
    "Evaluating clusters without considering highly unequal cluster sizes.",
    "Assuming every dataset naturally contains well-separated clusters.",
  ],

  challenges: [
    {
      question:
        "Cluster solution A has an average silhouette score of 0.72 while solution B has 0.18. What does that suggest?",
      hint:
        "Think about cohesion and separation.",
      answer:
        "Solution A shows substantially stronger internal cohesion/separation according to silhouette analysis. That does not by itself prove that A is more meaningful for the real-world objective.",
    },
    {
      question:
        "What does a negative silhouette value for one observation suggest?",
      hint:
        "Compare its distance to its assigned cluster with its distance to another cluster.",
      answer:
        "The observation may fit a neighboring cluster better than its current assigned cluster.",
    },
    {
      question:
        "Why can feature scaling affect clustering evaluation?",
      hint:
        "Many clustering methods and internal metrics depend on distance.",
      answer:
        "A feature with a much larger numerical scale can dominate distance calculations, changing both cluster assignments and evaluation values.",
    },
    {
      question:
        "Why shouldn't you automatically choose the largest possible silhouette score?",
      hint:
        "Think beyond one mathematical metric.",
      answer:
        "The resulting clusters should also be stable, interpretable, appropriately sized and useful for the actual problem.",
    },
  ],

  keyInsight:
    "Clustering evaluation asks whether the discovered groups are internally coherent and externally separated, but mathematical separation alone does not guarantee real-world meaning.",
};

/* =========================================================
   ADVANCED REGISTRY
   ========================================================= */

export const advancedVisualizationContentRegistry:
  Record<string, NativeVisualizationContent> = {
    [mlFoundations.id]:
      mlFoundations,

    [trainValidationTest.id]:
      trainValidationTest,

    [dataLeakage.id]:
      dataLeakage,

    [biasVariance.id]:
      biasVariance,

    [crossValidation.id]:
      crossValidation,

    [hyperparameterSearch.id]:
      hyperparameterSearch,

    [classificationMetrics.id]:
      classificationMetrics,
    [clusteringEvaluation.id]:
      clusteringEvaluation,

    [learningCurves.id]:
      learningCurves,

    [modelSelection.id]:
      modelSelection,

    [calibrationThreshold.id]:
      calibrationThreshold,

    [imbalancedLearning.id]:
      imbalancedLearning,

    [interpretability.id]:
      interpretability,

    [shapContribution.id]:
      shapContribution,

    [experimentTracking.id]:
      experimentTracking,

    [completeWorkflow.id]:
      completeWorkflow,
  };

export function getAdvancedVisualizationContent(
  visualizationId?: string
): NativeVisualizationContent | undefined {
  if (!visualizationId) {
    return undefined;
  }

  return advancedVisualizationContentRegistry[
    visualizationId
  ];
}

export function getAllAdvancedVisualizationContent():
  NativeVisualizationContent[] {
  return Object.values(
    advancedVisualizationContentRegistry
  );
}