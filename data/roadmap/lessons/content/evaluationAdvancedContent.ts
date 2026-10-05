import type { DeepLessonRegistry } from "./lessonContentTypes";

export const evaluationAdvancedContent: DeepLessonRegistry = {
  // =========================================================
  // 1. CROSS VALIDATION
  // =========================================================
  "cross-validation": {
    overview:
      "Cross-validation evaluates how well a machine-learning workflow generalizes by repeatedly training and validating it on different partitions of the available training data. It provides a more reliable view of model performance than relying on a single train/validation split and is central to model comparison, hyperparameter tuning and leakage-safe experimentation.",

    objectives: [
      "Understand why a single validation split can be unstable.",
      "Understand K-Fold Cross-Validation.",
      "Understand Stratified K-Fold.",
      "Understand repeated cross-validation.",
      "Understand time-series validation.",
      "Interpret mean and variation across fold scores.",
      "Use sklearn cross_val_score and cross_validate.",
      "Understand why preprocessing must occur inside each fold.",
      "Prevent leakage during cross-validation.",
    ],

    sections: [
      {
        id: "cv-purpose",
        title: "Why Cross-Validation?",
        explanation: [
          "A model evaluated on one train/validation split can receive an unusually high or low score depending on which observations entered the validation set.",
          "Cross-validation evaluates the model across multiple partitions.",
          "Each observation can contribute to validation while remaining excluded from the corresponding training fold.",
          "This gives a more complete view of generalization behavior."
        ],
        intuition: [
          "Instead of judging a student from one question, evaluate performance across several different sets of questions."
        ],
        importantPoints: [
          "Cross-validation reduces dependence on one validation split.",
          "It produces multiple performance estimates.",
          "The final test set should still remain separate."
        ]
      },

      {
        id: "cv-kfold",
        title: "K-Fold Cross-Validation",
        explanation: [
          "K-Fold divides the available training data into K approximately equal folds.",
          "The model trains on K-1 folds and validates on the remaining fold.",
          "The process repeats until every fold has served as validation once.",
          "For 5-fold cross-validation, five models are fitted."
        ],
        intuition: [
          "Five-fold CV gives every section of the training data one opportunity to act as unseen validation data."
        ],
        importantPoints: [
          "K controls the number of folds.",
          "Each fold becomes validation once.",
          "The final result is usually summarized using the fold scores."
        ]
      },

      {
        id: "cv-stratified",
        title: "Stratified K-Fold",
        explanation: [
          "For classification, ordinary random folds may contain different class proportions.",
          "Stratified K-Fold attempts to preserve approximately similar target-class proportions across folds.",
          "This is particularly useful when classes are imbalanced."
        ],
        intuition: [
          "If the full dataset contains 10% positive cases, each fold should ideally contain roughly the same proportion."
        ],
        importantPoints: [
          "Stratification is especially relevant for classification.",
          "It preserves target distribution approximately.",
          "It does not solve class imbalance by itself."
        ]
      },

      {
        id: "cv-scores",
        title: "Mean Score and Score Variation",
        explanation: [
          "Cross-validation produces one score per validation fold.",
          "The mean summarizes average performance.",
          "The variation between fold scores provides information about stability.",
          "A high mean with highly unstable fold performance deserves further investigation."
        ],
        intuition: [
          "Two models can have the same average score while one behaves consistently and the other performs very differently across data subsets."
        ],
        importantPoints: [
          "Do not inspect only the mean.",
          "Fold variation can reveal instability.",
          "Report the evaluation metric clearly."
        ]
      },

      {
        id: "cv-pipeline",
        title: "Cross-Validation with Pipelines",
        explanation: [
          "Preprocessing must be fitted separately inside each training fold.",
          "If scaling, imputation, feature selection or PCA is performed before cross-validation, validation-fold information can influence training transformations.",
          "A sklearn Pipeline ensures preprocessing is refitted inside every fold."
        ],
        intuition: [
          "Each validation fold must behave like genuinely unseen data."
        ],
        importantPoints: [
          "Pipeline prevents many preprocessing leakage errors.",
          "Fit transformations only on each training fold.",
          "Evaluate the entire workflow rather than only the final estimator."
        ]
      },

      {
        id: "cv-time",
        title: "Time-Series Cross-Validation",
        explanation: [
          "Ordinary random K-Fold is often inappropriate for time-ordered prediction problems.",
          "Training on future observations and validating on the past can create unrealistic evaluation.",
          "TimeSeriesSplit preserves temporal ordering by training on earlier observations and validating on later observations."
        ],
        intuition: [
          "A forecasting system should never learn tomorrow's information before predicting yesterday."
        ],
        importantPoints: [
          "Respect temporal order.",
          "Do not randomly shuffle time-series observations without justification.",
          "Validation design must match deployment conditions."
        ]
      },
            {
        id: "cv-holdout-vs-cross-validation",
        title: "Holdout Validation vs Cross-Validation",
        explanation: [
          "A holdout strategy creates one training subset and one validation subset.",
          "It is simple and computationally inexpensive, but the result can depend strongly on which observations happen to enter the validation set.",
          "Cross-validation repeats training and validation across several partitions of the available training data.",
          "This produces several validation scores instead of one.",
          "Cross-validation is especially useful when the dataset is not large enough to comfortably sacrifice a large permanent validation subset."
        ],
        intuition: [
          "Holdout gives the model one practice exam. Cross-validation gives it several different practice exams."
        ],
        importantPoints: [
          "Holdout is cheaper.",
          "Cross-validation provides multiple estimates.",
          "Neither replaces the final untouched test set."
        ]
      },

      {
        id: "cv-kfold-step-by-step",
        title: "K-Fold Step by Step",
        explanation: [
          "First divide the available training data into K folds.",
          "During round one, fold one becomes validation while the remaining K-1 folds are used for training.",
          "During round two, fold two becomes validation and the other folds are used for training.",
          "Continue until every fold has served as validation exactly once.",
          "A fresh estimator is fitted for each round.",
          "The K validation scores are then summarized."
        ],
        intuition: [
          "Every fold takes one turn sitting outside the classroom while the model studies the other folds."
        ],
        importantPoints: [
          "K rounds.",
          "K fitted models.",
          "Every fold validates once.",
          "Models are refitted between folds."
        ]
      },

      {
        id: "cv-kfold-mathematics",
        title: "K-Fold Mathematics",
        explanation: [
          "Suppose a dataset contains n observations and K folds of approximately equal size.",
          "Each validation fold contains roughly n/K observations.",
          "Each training fold contains roughly n(K-1)/K observations.",
          "If s_i is the validation score from fold i, the ordinary mean CV score is the arithmetic mean of the K fold scores.",
          "The variability of the fold scores can also be summarized using their standard deviation."
        ],
        intuition: [
          "K-Fold repeatedly trains on most of the data while reserving a different fraction for validation."
        ],
        importantPoints: [
          "Validation fraction is approximately 1/K.",
          "Training fraction is approximately (K-1)/K.",
          "Mean summarizes average fold performance.",
          "Variation describes stability across folds."
        ]
      },

      {
        id: "cv-k-choice",
        title: "Choosing the Number of Folds",
        explanation: [
          "The number of folds changes both the training-set size inside each round and the computational cost.",
          "With larger K, each model trains on a larger fraction of the available data.",
          "However, more folds require more model fits.",
          "Five-fold and ten-fold cross-validation are common general-purpose choices, but they are not universal rules.",
          "Dataset size, class frequency, groups, temporal structure and computational cost should influence the decision."
        ],
        intuition: [
          "More folds give each model more training data, but they also require running the training process more times."
        ],
        importantPoints: [
          "K is a validation-design choice.",
          "Larger K increases fitting cost.",
          "Choose K according to the data and task."
        ]
      },

      {
        id: "cv-bias-variance-estimate",
        title: "Bias and Variability of CV Estimates",
        explanation: [
          "Validation design influences the statistical behavior of the resulting performance estimate.",
          "Using fewer folds means each fitted model trains on less data than the final model may eventually use.",
          "Using many folds reduces that training-size difference but can make validation folds small.",
          "Fold scores are also not independent because their training sets overlap.",
          "The choice of K therefore represents a practical statistical and computational trade-off."
        ],
        intuition: [
          "Changing K changes both how much each model studies and how large each individual exam is."
        ],
        importantPoints: [
          "CV design affects the estimate.",
          "Fold scores share overlapping training data.",
          "There is no universally optimal K."
        ]
      },

      {
        id: "cv-kfold-shuffle",
        title: "KFold: shuffle",
        explanation: [
          "The shuffle option controls whether observations are shuffled before they are divided into folds.",
          "Shuffling can be useful when the original row order contains arbitrary structure that should not define the folds.",
          "When shuffle is false, the existing observation order contributes directly to fold construction.",
          "Shuffling is inappropriate when temporal ordering itself must be preserved."
        ],
        intuition: [
          "Shuffle the deck before dividing it only when the order of the cards is not meaningful."
        ],
        importantPoints: [
          "Changes fold construction.",
          "Useful for many unordered datasets.",
          "Do not blindly shuffle time-dependent observations."
        ]
      },

      {
        id: "cv-kfold-random-state",
        title: "KFold: random_state",
        explanation: [
          "When shuffling is enabled, random_state can make the shuffled fold assignment reproducible.",
          "Using the same seed helps reproduce experiments.",
          "random_state does not improve model quality by itself.",
          "Repeatedly trying seeds and reporting only the most favorable result creates misleading evaluation."
        ],
        intuition: [
          "Fix the shuffle so another run can create the same folds."
        ],
        importantPoints: [
          "Reproducibility control.",
          "Relevant when randomness is used.",
          "Do not optimize the seed."
        ]
      },

      {
        id: "cv-stratification-deep",
        title: "Stratification in Classification",
        explanation: [
          "Classification folds can become unrepresentative when class proportions differ strongly between partitions.",
          "StratifiedKFold attempts to preserve approximately the same class distribution in each fold.",
          "This is especially useful when a minority class contains relatively few observations.",
          "Stratification improves fold composition but does not create new minority observations and does not solve the underlying imbalance problem."
        ],
        intuition: [
          "If positive cases are rare, distribute them across the exams instead of accidentally placing most of them in only one exam."
        ],
        importantPoints: [
          "Classification-oriented splitting.",
          "Approximately preserves class ratios.",
          "Does not itself rebalance the dataset."
        ]
      },

      {
        id: "cv-stratified-parameters",
        title: "StratifiedKFold Parameters",
        explanation: [
          "n_splits controls the number of folds.",
          "shuffle determines whether samples within the class-preserving splitting process are shuffled before fold construction.",
          "random_state controls reproducibility when shuffle is enabled.",
          "These parameters control validation partitioning rather than the predictive model itself."
        ],
        intuition: [
          "Choose how many stratified exams to create and whether their row assignment should be randomized reproducibly."
        ],
        importantPoints: [
          "n_splits.",
          "shuffle.",
          "random_state when shuffling.",
          "These belong to the splitter, not the model."
        ]
      },

      {
        id: "cv-repeated-kfold",
        title: "Repeated K-Fold",
        explanation: [
          "RepeatedKFold performs K-Fold cross-validation multiple times with different randomized partitions.",
          "This produces more validation scores and can reveal how sensitive evaluation is to a particular fold assignment.",
          "The computational cost increases approximately with the number of repeats.",
          "Repeated evaluation is most meaningful when random repartitioning is appropriate for the data."
        ],
        intuition: [
          "Do not run only one set of K exams; reshuffle and run another set to see whether the conclusion remains similar."
        ],
        importantPoints: [
          "Repeats K-Fold.",
          "Produces more performance estimates.",
          "Increases computation."
        ]
      },

      {
        id: "cv-repeated-stratified",
        title: "Repeated Stratified K-Fold",
        explanation: [
          "RepeatedStratifiedKFold combines repeated cross-validation with approximate preservation of class proportions.",
          "It is useful for classification when both class representation and sensitivity to fold assignment matter.",
          "Each repetition creates another stratified partitioning.",
          "The increased number of fits must be considered when models are expensive."
        ],
        intuition: [
          "Repeat several balanced sets of classification exams instead of relying on one balanced split pattern."
        ],
        importantPoints: [
          "Classification-oriented repeated CV.",
          "Maintains approximate class proportions.",
          "More repeats mean more computation."
        ]
      },

      {
        id: "cv-repeated-parameters",
        title: "Repeated CV Parameters",
        explanation: [
          "RepeatedKFold and RepeatedStratifiedKFold use n_splits to control folds per repetition.",
          "n_repeats controls how many complete CV repetitions are performed.",
          "random_state can make randomized repetitions reproducible.",
          "Total validation rounds are approximately n_splits multiplied by n_repeats."
        ],
        intuition: [
          "Five folds repeated three times produce fifteen validation rounds."
        ],
        importantPoints: [
          "n_splits controls folds.",
          "n_repeats controls repetitions.",
          "random_state controls reproducibility.",
          "Cost grows with folds × repeats."
        ]
      },

      {
        id: "cv-group-problem",
        title: "Why Group-Aware Cross-Validation Exists",
        explanation: [
          "Some datasets contain several observations from the same underlying entity.",
          "Examples include repeated measurements from one patient, multiple transactions from one customer, several images from one person or measurements from the same machine.",
          "Ordinary K-Fold can place observations from the same entity into both training and validation folds.",
          "This can produce optimistic evaluation because the validation observations are not truly independent from training."
        ],
        intuition: [
          "Seeing one record from a patient can make another record from that same patient much less unseen."
        ],
        importantPoints: [
          "Related observations can leak across folds.",
          "Identify natural groups before choosing CV.",
          "Group-aware splitting can provide more realistic evaluation."
        ]
      },

      {
        id: "cv-groupkfold",
        title: "GroupKFold",
        explanation: [
          "GroupKFold keeps observations belonging to the same group together.",
          "A group appearing in a validation fold is therefore excluded from that fold's training partition.",
          "This is useful when generalization to unseen groups is the real deployment objective.",
          "The groups array identifies which observations belong together."
        ],
        intuition: [
          "All records from one person stay on one side of a fold boundary."
        ],
        importantPoints: [
          "Prevents group overlap between train and validation.",
          "Requires group labels.",
          "Useful for entity-level generalization."
        ]
      },

      {
        id: "cv-stratified-group",
        title: "StratifiedGroupKFold",
        explanation: [
          "Some classification problems require both group separation and approximately balanced class distributions.",
          "StratifiedGroupKFold attempts to preserve class proportions while also keeping each group entirely within one side of a split.",
          "These two goals can conflict when groups are large or have very different class compositions.",
          "The resulting balance may therefore be approximate rather than perfect."
        ],
        intuition: [
          "Keep every patient together while also trying to distribute positive and negative cases sensibly across folds."
        ],
        importantPoints: [
          "Combines group separation with stratification.",
          "Useful for grouped classification.",
          "Perfect balance may be impossible."
        ]
      },

      {
        id: "cv-group-vs-stratified",
        title: "GroupKFold vs StratifiedKFold",
        explanation: [
          "StratifiedKFold focuses on preserving class proportions.",
          "GroupKFold focuses on preventing groups from appearing in both training and validation.",
          "They solve different validation problems.",
          "When both constraints matter, a splitter designed for grouped stratification may be appropriate."
        ],
        intuition: [
          "One splitter protects class balance; the other protects entity independence."
        ],
        importantPoints: [
          "Stratification and grouping are different requirements.",
          "Choose according to the leakage structure of the data."
        ]
      },

      {
        id: "cv-leave-one-out",
        title: "Leave-One-Out Cross-Validation",
        explanation: [
          "Leave-One-Out Cross-Validation uses one observation as validation and all remaining observations as training.",
          "For n observations, this produces n model fits.",
          "Each model trains on almost the entire dataset.",
          "However, the method can be computationally expensive and individual validation outcomes can be highly variable because each validation set contains only one observation."
        ],
        intuition: [
          "Give every individual observation its own turn as the complete validation set."
        ],
        importantPoints: [
          "n observations produce n validation rounds.",
          "Very expensive for large datasets.",
          "Tiny validation folds can create high variability."
        ]
      },

      {
        id: "cv-loo-vs-kfold",
        title: "Leave-One-Out vs K-Fold",
        explanation: [
          "Leave-One-Out maximizes the training-set size used in each round.",
          "Ordinary K-Fold uses larger validation partitions and requires fewer fits.",
          "Leave-One-Out is not automatically more reliable simply because it uses more training data.",
          "K-Fold is usually more computationally practical for ordinary machine-learning workflows."
        ],
        intuition: [
          "Using almost every row for training sounds attractive, but testing on only one row at a time has its own statistical and computational costs."
        ],
        importantPoints: [
          "LOO uses maximum training size.",
          "K-Fold uses fewer fits.",
          "More folds are not automatically better."
        ]
      },

      {
        id: "cv-time-series-deep",
        title: "TimeSeriesSplit Step by Step",
        explanation: [
          "TimeSeriesSplit creates training and validation partitions that respect observation order.",
          "Training sets generally contain earlier observations while validation sets contain later observations.",
          "Across successive splits, the training window commonly expands forward through time.",
          "This more closely resembles forecasting where only historical information is available when future predictions are made."
        ],
        intuition: [
          "Train on the past, validate on the future, then move forward and repeat."
        ],
        importantPoints: [
          "Chronology is preserved.",
          "Future observations do not train models evaluated on earlier observations.",
          "Useful for ordered forecasting-style problems."
        ]
      },

      {
        id: "cv-time-series-parameters",
        title: "TimeSeriesSplit Parameters",
        explanation: [
          "n_splits controls the number of train-validation splits.",
          "test_size can control the size of each validation window in supported configurations.",
          "max_train_size can limit the size of the historical training window.",
          "gap can exclude observations between the end of training and beginning of validation.",
          "These controls should reflect how the model will actually be used."
        ],
        intuition: [
          "Decide how many historical simulations to run, how much future data to test on, how much history to retain and whether a safety gap is needed."
        ],
        importantPoints: [
          "n_splits.",
          "test_size.",
          "max_train_size.",
          "gap.",
          "Design around deployment."
        ]
      },

      {
        id: "cv-time-gap",
        title: "Why a Temporal Gap Can Matter",
        explanation: [
          "In some datasets, observations immediately before and after a split are strongly related.",
          "Features may also use rolling or lagged information that makes near-boundary observations unusually dependent.",
          "A gap can remove observations between training and validation to reduce this contamination risk.",
          "The appropriate gap depends on how the features and real prediction horizon are defined."
        ],
        intuition: [
          "Leave a buffer zone between what the model studied and what it is tested on."
        ],
        importantPoints: [
          "Useful for temporal dependence.",
          "Feature engineering determines required gap.",
          "Match real deployment conditions."
        ]
      },

      {
        id: "cv-cross-val-score",
        title: "cross_val_score",
        explanation: [
          "cross_val_score provides a convenient interface for evaluating one scoring metric across cross-validation splits.",
          "It returns one score for each validation fold.",
          "The scores can then be summarized using their mean, standard deviation and other diagnostics.",
          "The cv argument controls the splitting strategy and scoring selects the evaluation metric."
        ],
        intuition: [
          "Run the same workflow through several exams and collect one selected score from each exam."
        ],
        importantPoints: [
          "Convenient single-metric evaluation.",
          "Returns fold scores.",
          "Works with explicit CV splitters."
        ]
      },

      {
        id: "cv-cross-validate",
        title: "cross_validate",
        explanation: [
          "cross_validate is more flexible than cross_val_score.",
          "It can evaluate multiple metrics in one call.",
          "It can return fit and scoring times.",
          "It can optionally return training scores and fitted estimators.",
          "This makes it useful when evaluation requires more detailed diagnostics."
        ],
        intuition: [
          "cross_val_score gives a scoreboard; cross_validate can give a richer report from every fold."
        ],
        importantPoints: [
          "Supports multiple metrics.",
          "Provides timing information.",
          "Can expose additional fold-level diagnostics."
        ]
      },

      {
        id: "cv-cross-validate-return-train",
        title: "return_train_score",
        explanation: [
          "When return_train_score is enabled in cross_validate, training scores are recorded alongside validation scores.",
          "Comparing training and validation behavior can help diagnose underfitting and overfitting.",
          "Training scores should not be used as the primary estimate of generalization.",
          "The validation scores remain the relevant out-of-fold performance measurements."
        ],
        intuition: [
          "Training scores explain how well the model learned what it saw; validation scores tell how well it handled what it did not see."
        ],
        importantPoints: [
          "Useful for diagnosis.",
          "Can reveal train-validation gaps.",
          "Do not report training score as generalization performance."
        ]
      },

      {
        id: "cv-multiple-metrics",
        title: "Multiple Metrics in Cross-Validation",
        explanation: [
          "A single metric may hide important model behavior.",
          "cross_validate can evaluate several metrics across exactly the same folds.",
          "For classification this can include precision, recall, F1, ROC-AUC and other appropriate metrics.",
          "For regression, MAE, RMSE-related scoring and R² can describe different aspects of error.",
          "Metric selection should follow the real-world objective."
        ],
        intuition: [
          "Evaluate every candidate on the same exams but inspect several dimensions of performance."
        ],
        importantPoints: [
          "Same folds can support multiple metrics.",
          "Metrics answer different questions.",
          "Choose metrics according to cost and objective."
        ]
      },

      {
        id: "cv-scoring-direction",
        title: "Understanding sklearn Scorer Direction",
        explanation: [
          "sklearn's model-selection APIs generally follow a convention in which larger scorer values are considered better.",
          "For loss quantities that are naturally minimized, sklearn commonly exposes negative scorer forms.",
          "For example, a negative error scorer may return a value closer to zero when performance improves.",
          "Users should understand the scorer convention before interpreting CV results."
        ],
        intuition: [
          "sklearn turns some losses around so every competition can still follow the rule that larger scores win."
        ],
        importantPoints: [
          "Higher scorer values are generally treated as better.",
          "Some loss scorers are negated.",
          "Interpret scorer names carefully."
        ]
      },

      {
        id: "cv-mean-standard-deviation",
        title: "Interpreting Mean ± Standard Deviation",
        explanation: [
          "The mean CV score summarizes average validation performance.",
          "The standard deviation summarizes how much scores differed across folds.",
          "A high mean with large variation can indicate sensitivity to which observations are used for training and validation.",
          "Two models with very similar means should not automatically be treated as meaningfully different when fold variation is substantial."
        ],
        intuition: [
          "Average performance tells how good the model usually is; variation tells how dependable that average is across different data subsets."
        ],
        importantPoints: [
          "Report mean and variation.",
          "Do not overinterpret tiny mean differences.",
          "Investigate unstable folds."
        ]
      },

      {
        id: "cv-fold-level-diagnosis",
        title: "Diagnosing Individual Folds",
        explanation: [
          "Large fold-to-fold differences deserve investigation.",
          "One fold may contain a different class distribution, unusual groups, outliers or a shifted feature distribution.",
          "A poor fold does not automatically mean it should be deleted.",
          "Instead, understand whether the fold reveals a genuine weakness that could also appear after deployment."
        ],
        intuition: [
          "A difficult exam may reveal an important weakness rather than being a bad exam."
        ],
        importantPoints: [
          "Inspect difficult folds.",
          "Do not cherry-pick favorable folds.",
          "Look for meaningful distribution differences."
        ]
      },

      {
        id: "cv-preprocessing-deep",
        title: "What Must Stay Inside the CV Pipeline?",
        explanation: [
          "Any transformation that learns information from data should normally be fitted inside each training fold.",
          "Examples include scaling, imputation, feature selection, PCA and many learned encoders.",
          "Fitting these transformations globally before CV allows validation-fold information to influence the training workflow.",
          "A Pipeline keeps the transformation and estimator inside one fold-aware object."
        ],
        intuition: [
          "Anything that learns from the dataset must study only the current training fold."
        ],
        importantPoints: [
          "Scaling inside CV.",
          "Imputation inside CV.",
          "Feature selection inside CV.",
          "PCA inside CV.",
          "Learned preprocessing inside CV."
        ]
      },

      {
        id: "cv-feature-selection-leakage",
        title: "Feature Selection Leakage",
        explanation: [
          "Selecting features using the entire dataset before cross-validation is a common leakage error.",
          "The selection procedure has already inspected the future validation folds.",
          "Feature selection should be included inside the Pipeline so it is fitted separately for each training fold.",
          "The same principle applies even when the final estimator itself never directly sees the validation targets during fitting."
        ],
        intuition: [
          "The model can receive leaked answers indirectly through features chosen using the complete dataset."
        ],
        importantPoints: [
          "Feature selection is learned preprocessing.",
          "Keep it inside Pipeline.",
          "Leakage can happen before estimator.fit."
        ]
      },

      {
        id: "cv-resampling-leakage",
        title: "Resampling and Cross-Validation",
        explanation: [
          "When class-imbalance resampling is used, it must not allow validation observations to influence synthetic or resampled training data.",
          "Resampling should occur only within the training portion of each validation split using an appropriate leakage-safe workflow.",
          "Performing oversampling before cross-validation can place highly related or duplicated information across training and validation.",
          "The validation fold should retain the natural evaluation distribution unless the deployment objective requires something different."
        ],
        intuition: [
          "Create extra training examples only after the validation fold has been hidden."
        ],
        importantPoints: [
          "Do not oversample before CV.",
          "Resample training folds only.",
          "Keep validation independent."
        ]
      },

      {
        id: "cv-final-test-set",
        title: "Cross-Validation Does Not Replace the Test Set",
        explanation: [
          "Cross-validation is commonly used during development for model comparison, feature decisions and hyperparameter tuning.",
          "Because development decisions react to CV results, the workflow can gradually adapt to the validation process.",
          "A final untouched test set provides a more independent evaluation after development choices have been completed.",
          "Repeatedly checking the test set destroys that independence."
        ],
        intuition: [
          "Cross-validation is for practice and selection; the untouched test set is the final exam."
        ],
        importantPoints: [
          "Use CV during development.",
          "Keep test data isolated.",
          "Evaluate test data after selection."
        ]
      },

      {
        id: "cv-model-comparison",
        title: "Fair Model Comparison with Cross-Validation",
        explanation: [
          "Models should be compared using the same validation strategy whenever possible.",
          "Using identical folds reduces unnecessary differences caused by evaluating models on different subsets.",
          "Each model should include its required preprocessing inside its own leakage-safe workflow.",
          "The comparison metric should match the actual problem objective."
        ],
        intuition: [
          "Two students should take the same exams if their scores are going to be compared."
        ],
        importantPoints: [
          "Use consistent folds.",
          "Use consistent metrics.",
          "Keep model-specific preprocessing inside each workflow."
        ]
      },

      {
        id: "cv-nested-introduction",
        title: "Nested Cross-Validation",
        explanation: [
          "Cross-validation used for hyperparameter selection is itself part of the model-selection process.",
          "Nested cross-validation adds an outer validation loop around that selection procedure.",
          "The inner loop selects hyperparameters using only the outer-training data.",
          "The outer fold evaluates the complete selected workflow on data that did not participate in inner selection.",
          "This provides a more independent estimate of the performance of the entire selection procedure."
        ],
        intuition: [
          "An inner exam chooses the best configuration; an outer exam evaluates whether that choosing process generalizes."
        ],
        importantPoints: [
          "Inner loop selects.",
          "Outer loop evaluates.",
          "Useful for reducing model-selection optimism."
        ]
      },

      {
        id: "cv-nested-cost",
        title: "Nested CV Computational Cost",
        explanation: [
          "Nested cross-validation can require many model fits.",
          "If the outer loop has r folds, the inner loop has k folds and m candidate configurations are evaluated, the inner-search cost is roughly r × k × m fits before additional refits are considered.",
          "This can become expensive for large datasets or expensive estimators.",
          "Nested CV should therefore be used when its stronger evaluation design justifies the computational cost."
        ],
        intuition: [
          "Every outer fold contains another complete model-selection experiment."
        ],
        importantPoints: [
          "Statistically useful.",
          "Computationally expensive.",
          "Estimate fit counts before running."
        ]
      },

      {
        id: "cv-small-datasets",
        title: "Cross-Validation on Small Datasets",
        explanation: [
          "Cross-validation is especially valuable when data is limited because observations can contribute to both training and validation across different rounds.",
          "However, very small datasets can still produce unstable estimates.",
          "Rare classes can make some splitting strategies difficult.",
          "Repeated CV may help characterize sensitivity to partitioning, but it cannot create information that is absent from the dataset."
        ],
        intuition: [
          "Cross-validation reuses limited data efficiently, but it cannot manufacture evidence that was never collected."
        ],
        importantPoints: [
          "Useful with limited data.",
          "Small samples remain uncertain.",
          "Repeated CV does not replace more data."
        ]
      },

      {
        id: "cv-large-datasets",
        title: "Cross-Validation on Large Datasets",
        explanation: [
          "When datasets are extremely large, a single well-designed validation split may already contain enough observations for a stable estimate.",
          "Full K-Fold cross-validation can then be unnecessarily expensive.",
          "The appropriate evaluation strategy depends on both statistical uncertainty and computational budget.",
          "Cross-validation should be used because it improves decision quality, not simply because it is conventional."
        ],
        intuition: [
          "When one exam already contains millions of representative questions, repeating it ten times may add little value relative to the cost."
        ],
        importantPoints: [
          "CV is not mandatory for every dataset.",
          "Consider statistical and computational efficiency.",
          "Validation design should serve the problem."
        ]
      },

      {
        id: "cv-computational-cost",
        title: "Computational Cost of Cross-Validation",
        explanation: [
          "K-Fold requires approximately K estimator fits.",
          "Repeated K-Fold multiplies that by the number of repetitions.",
          "Hyperparameter search multiplies it again by the number of candidate configurations.",
          "Nested cross-validation adds another outer-loop multiplier.",
          "Pipeline transformations are also refitted within these workflows."
        ],
        intuition: [
          "Cross-validation does not evaluate one trained model repeatedly; it repeatedly trains new models."
        ],
        importantPoints: [
          "K folds means roughly K fits.",
          "Repeats multiply fits.",
          "Tuning multiplies fits.",
          "Nested CV multiplies cost further."
        ]
      },

      {
        id: "cv-parallelism",
        title: "Parallel Cross-Validation",
        explanation: [
          "Many fold evaluations are independent and can be executed in parallel through APIs that expose n_jobs.",
          "Parallel execution can reduce wall-clock time.",
          "It increases simultaneous CPU and memory usage.",
          "Nested parallelism can become inefficient when both the CV utility and the estimator independently use many workers."
        ],
        intuition: [
          "Several exams can be run at the same time, but every simultaneous exam still consumes resources."
        ],
        importantPoints: [
          "Can reduce elapsed time.",
          "Does not reduce total work.",
          "Watch memory and nested parallelism."
        ]
      },

      {
        id: "cv-random-seed-mistake",
        title: "Do Not Search for a Lucky Fold Seed",
        explanation: [
          "Changing random_state changes randomized fold assignments.",
          "Repeatedly trying seeds until a favorable CV score appears effectively tunes the evaluation split.",
          "This produces optimistic conclusions.",
          "If sensitivity to partitioning is important, use a principled repeated-validation strategy rather than cherry-picking a seed."
        ],
        intuition: [
          "Do not keep reshuffling the exam until the model receives the questions it likes."
        ],
        importantPoints: [
          "Seeds are reproducibility controls.",
          "Do not optimize validation partitions.",
          "Use repeated CV for principled sensitivity analysis."
        ]
      },

      {
        id: "cv-failure-diagnosis",
        title: "Cross-Validation Failure Diagnosis",
        explanation: [
          "Large fold variation can indicate small sample size, heterogeneous populations, group leakage risk, distribution shift or unstable modeling.",
          "Unexpectedly high scores can indicate leakage.",
          "Very low scores across every fold may indicate weak features, preprocessing problems or model mismatch.",
          "Fit failures can indicate invalid data, estimator constraints or problematic preprocessing.",
          "The validation design itself should always be questioned when results look unrealistic."
        ],
        intuition: [
          "Cross-validation is not just a score generator; unusual fold behavior is diagnostic information."
        ],
        importantPoints: [
          "Investigate unstable folds.",
          "Investigate suspiciously high scores.",
          "Inspect fit failures.",
          "Validate the validation strategy."
        ]
      },

      {
        id: "cv-strategy-selection",
        title: "Choosing the Correct CV Strategy",
        explanation: [
          "For ordinary independent regression data, K-Fold is a common starting point.",
          "For ordinary classification data, StratifiedKFold is commonly useful.",
          "For repeated measurements or related entities, group-aware splitting may be required.",
          "For time-dependent prediction, chronological splitting is required.",
          "For limited independent data, repeated CV may help characterize partition sensitivity.",
          "The correct splitter follows the data-generating process and deployment scenario."
        ],
        intuition: [
          "Do not ask which cross-validation method is best in general. Ask which method best simulates the unseen data the deployed model will face."
        ],
        importantPoints: [
          "Independent data: K-Fold.",
          "Classification: consider stratification.",
          "Grouped data: group-aware CV.",
          "Time data: time-aware CV.",
          "Match deployment."
        ]
      },

      {
        id: "cv-exam-interview",
        title: "Cross-Validation: Exam and Interview Essentials",
        explanation: [
          "Define cross-validation and explain why it is used.",
          "Explain K-Fold step by step.",
          "Calculate training and validation proportions for K-Fold.",
          "Differentiate KFold and StratifiedKFold.",
          "Explain RepeatedKFold and RepeatedStratifiedKFold.",
          "Explain GroupKFold and why group leakage occurs.",
          "Explain Leave-One-Out.",
          "Explain TimeSeriesSplit.",
          "Explain cross_val_score versus cross_validate.",
          "Explain mean and standard deviation of fold scores.",
          "Explain preprocessing leakage.",
          "Explain why Pipeline belongs inside CV.",
          "Explain nested cross-validation.",
          "Explain why the final test set remains untouched."
        ],
        intuition: [
          "A complete answer connects the splitter to the structure of the data rather than treating cross-validation as simply choosing K=5."
        ],
        importantPoints: [
          "K-Fold.",
          "Stratification.",
          "Groups.",
          "Time.",
          "Leakage.",
          "Pipeline.",
          "Nested CV.",
          "Test isolation."
        ]
      },
      
    ],

    visualization: {
      type: "native",
      visualizationId: "cross-validation-fold-explorer",
      title: "Cross-Validation Fold Explorer",
      description:
        "Interactively compare train/test split, K-Fold, Stratified K-Fold and TimeSeriesSplit while watching observations move between training and validation folds."
    },

    codeExamples: [
      {
        id: "cv-pipeline-code",
        title: "Leakage-Safe Cross-Validation",
        description:
          "Evaluate scaling and Logistic Regression together inside a Pipeline.",
        language: "python",
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)

model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "classifier",
        LogisticRegression(max_iter=2000)
    )
])

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

results = cross_validate(
    model,
    X,
    y,
    cv=cv,
    scoring=[
        "accuracy",
        "precision",
        "recall",
        "f1",
        "roc_auc"
    ]
)

for metric in [
    "test_accuracy",
    "test_precision",
    "test_recall",
    "test_f1",
    "test_roc_auc"
]:
    scores = results[metric]

    print(
        metric,
        "mean:",
        scores.mean(),
        "std:",
        scores.std()
    )`,
        explanation: [
          "StandardScaler is fitted independently inside every training fold.",
          "StratifiedKFold preserves class proportions approximately.",
          "cross_validate can evaluate several metrics simultaneously.",
          "Mean and standard deviation summarize performance and stability."
        ],
        commonMistakes: [
          "Scaling the full dataset before cross-validation.",
          "Using ordinary random CV for time-dependent data.",
          "Reporting only the best fold."
        ]
      }
    ],

    practice: [
      {
        id: "cv-practice-1",
        title: "Five-Fold CV",
        type: "concept",
        difficulty: "basic",
        question:
          "How many validation rounds occur in 5-fold cross-validation?",
        instructions: ["Think about how often each fold becomes validation."],
        hints: ["Each of five folds is validation once."],
        explanation:
          "There are five validation rounds."
      },
      {
        id: "cv-practice-2",
        title: "Stratification",
        type: "concept",
        difficulty: "medium",
        question:
          "Why is StratifiedKFold commonly preferred for classification?",
        instructions: ["Think about target proportions."],
        hints: ["Each fold should represent the classes."],
        explanation:
          "It approximately preserves class proportions across folds, producing more representative validation partitions."
      },
      {
        id: "cv-practice-3",
        title: "Pipeline Leakage",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why is scaling X before calling cross_val_score potentially a leakage problem?",
        instructions: ["Think about how scaler parameters were calculated."],
        hints: ["Validation observations influenced mean and standard deviation."],
        explanation:
          "The scaler would learn statistics from observations that later act as validation data. Putting scaling inside Pipeline ensures it is fitted only on each training fold."
      },
      {
        id: "cv-practice-4",
        title: "Fold Variation",
        type: "analysis",
        difficulty: "medium",
        question:
          "What can large differences between fold scores indicate?",
        instructions: ["Think model stability and dataset variation."],
        hints: ["Performance depends strongly on the selected subset."],
        explanation:
          "Large variation can indicate model instability, small datasets, heterogeneous data or problematic splitting."
      },
      {
        id: "cv-practice-5",
        title: "Time Series",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can shuffled K-Fold produce unrealistic results for forecasting?",
        instructions: ["Consider chronological information."],
        hints: ["Future data may enter training folds."],
        explanation:
          "Random splitting can allow future observations to influence a model evaluated on earlier observations, violating the real forecasting scenario."
      }
    ],

    commonMistakes: [
      {
        id: "cv-mistake-1",
        title: "Preprocessing before CV",
        description:
          "Global preprocessing leaks validation-fold information.",
        correction:
          "Place learned preprocessing inside Pipeline."
      },
      {
        id: "cv-mistake-2",
        title: "Using the test set during CV decisions",
        description:
          "Repeated test feedback contaminates final evaluation.",
        correction:
          "Use CV on training data and preserve the final test set."
      }
    ],

    keyTakeaways: [
      "Cross-validation evaluates models across multiple partitions.",
      "K-Fold provides K validation scores.",
      "Stratification is useful for classification.",
      "Fold variation matters alongside mean performance.",
      "Preprocessing should occur inside each fold.",
      "Time-dependent problems require time-aware validation.",
      "The final test set remains separate from model selection."
    ]
  },

  // =========================================================
  // 2. HYPERPARAMETER TUNING
  // =========================================================
  "hyperparameter-tuning": {
    overview:
      "Hyperparameter tuning systematically searches for model settings that generalize well. Unlike learned parameters such as regression coefficients, hyperparameters are configured before fitting. Reliable tuning combines a clearly defined search space, cross-validation, an appropriate evaluation metric and leakage-safe pipelines.",

    objectives: [
      "Differentiate parameters and hyperparameters.",
      "Understand Grid Search.",
      "Understand Random Search.",
      "Understand search spaces.",
      "Understand cross-validation during tuning.",
      "Tune Pipeline parameters.",
      "Understand double-underscore parameter syntax.",
      "Choose appropriate scoring metrics.",
      "Avoid test-set tuning.",
      "Understand computational trade-offs."
    ],

    sections: [
      {
        id: "tuning-parameter",
        title: "Parameters vs Hyperparameters",
        explanation: [
          "Model parameters are learned from training data.",
          "Examples include linear-regression coefficients and fitted tree split values.",
          "Hyperparameters are configuration choices supplied to the learning algorithm.",
          "Examples include K in KNN, max_depth in Decision Trees and C in Logistic Regression."
        ],
        intuition: [
          "Parameters are learned by the model. Hyperparameters control how learning happens."
        ],
        importantPoints: [
          "Do not confuse fitted parameters with configuration settings.",
          "Hyperparameters influence model complexity and learning behavior."
        ]
      },

      {
        id: "tuning-grid",
        title: "Grid Search",
        explanation: [
          "Grid Search evaluates every specified combination of candidate hyperparameter values.",
          "For each combination, cross-validation estimates performance.",
          "The configuration with the best selected validation metric is retained.",
          "Grid Search can become expensive as dimensions and candidate values increase."
        ],
        intuition: [
          "Grid Search systematically checks every location on a predefined parameter grid."
        ],
        importantPoints: [
          "Grid Search is exhaustive over the specified grid.",
          "Large grids can become computationally expensive.",
          "The grid should contain meaningful candidate ranges."
        ]
      },

      {
        id: "tuning-random",
        title: "Random Search",
        explanation: [
          "Random Search samples a specified number of hyperparameter combinations.",
          "It can explore larger parameter spaces without testing every combination.",
          "This is especially useful when only some hyperparameters strongly influence performance."
        ],
        intuition: [
          "Instead of checking every point on a huge map, sample promising locations across the map."
        ],
        importantPoints: [
          "Random Search controls search cost through n_iter.",
          "It can explore more distinct values than a small rigid grid.",
          "It does not guarantee evaluation of every combination."
        ]
      },

      {
        id: "tuning-metric",
        title: "Choosing the Tuning Metric",
        explanation: [
          "The best hyperparameters depend on the optimization metric.",
          "Accuracy, F1, ROC-AUC, average precision, MAE and RMSE reward different behavior.",
          "The scoring metric should reflect the real problem objective."
        ],
        intuition: [
          "A model optimized for recall may not be the same model selected when optimizing precision."
        ],
        importantPoints: [
          "Define the metric before searching.",
          "Metric selection is part of problem formulation.",
          "Do not automatically use accuracy."
        ]
      },

      {
        id: "tuning-pipeline",
        title: "Tuning a Pipeline",
        explanation: [
          "GridSearchCV and RandomizedSearchCV can tune parameters inside Pipeline steps.",
          "The syntax step__parameter identifies the nested hyperparameter.",
          "For example classifier__C tunes C inside a pipeline step named classifier.",
          "This allows preprocessing and model tuning to remain leakage-safe."
        ],
        intuition: [
          "The search should evaluate the complete machine-learning workflow, not a model detached from its preprocessing."
        ],
        importantPoints: [
          "Use double underscores for nested parameters.",
          "Search the complete Pipeline.",
          "Cross-validation refits transformations for each candidate and fold."
        ]
      },
            {
        id: "tuning-search-space",
        title: "Designing a Hyperparameter Search Space",
        explanation: [
          "A search algorithm can only evaluate configurations contained in or sampled from the search space you define.",
          "A poor search space can make an excellent search algorithm ineffective.",
          "Candidate ranges should be based on parameter meaning, model behavior, computational budget and prior experiments.",
          "Some parameters are best explored on a linear scale while others are naturally searched across orders of magnitude.",
          "Conditional parameter relationships must also be respected."
        ],
        intuition: [
          "Hyperparameter tuning is not asking the computer to find magic values everywhere. You first define the region in which it is allowed to search."
        ],
        importantPoints: [
          "Search-space design matters.",
          "Use meaningful ranges.",
          "Respect parameter applicability.",
          "Do not create huge blind spaces."
        ]
      },

      {
        id: "tuning-linear-log-space",
        title: "Linear Scale vs Logarithmic Scale",
        explanation: [
          "Some hyperparameters vary meaningfully through approximately equal numerical increments.",
          "Others can change model behavior across several orders of magnitude.",
          "Regularization parameters such as C or alpha are often explored using logarithmically spaced candidate values.",
          "For example, values such as 0.001, 0.01, 0.1, 1, 10 and 100 explore multiplicative changes more effectively than a narrow arithmetic sequence."
        ],
        intuition: [
          "When a useful value might be 0.001 or 100, searching 1, 2, 3, 4 and 5 explores the wrong geometry."
        ],
        importantPoints: [
          "Match the search scale to parameter behavior.",
          "Log spacing is useful for many positive scale parameters.",
          "Not every parameter requires logarithmic search."
        ]
      },

      {
        id: "tuning-grid-combinations",
        title: "Grid Search Combination Mathematics",
        explanation: [
          "GridSearchCV evaluates the Cartesian product of the candidate values in a parameter grid.",
          "If one parameter has a candidate count a and another has b candidates, there are a × b combinations.",
          "With additional parameters, multiply all candidate counts.",
          "If CV uses k folds, the search requires approximately combinations × k model fits, before considering optional refitting.",
          "Pipeline preprocessing is also repeatedly fitted inside those model fits."
        ],
        intuition: [
          "Every additional grid dimension multiplies the number of experiments."
        ],
        importantPoints: [
          "Grid cost grows multiplicatively.",
          "CV multiplies search cost again.",
          "Large grids can become expensive very quickly."
        ]
      },

      {
        id: "tuning-gridsearchcv",
        title: "GridSearchCV",
        explanation: [
          "GridSearchCV combines exhaustive grid evaluation with cross-validation.",
          "For each candidate configuration, the estimator is evaluated across the configured validation folds.",
          "Fold scores are aggregated according to the selected scoring metric.",
          "The best candidate is selected according to the search configuration.",
          "When refit is enabled, the selected configuration is fitted again using the available training data passed to the search."
        ],
        intuition: [
          "GridSearchCV runs a controlled tournament in which every configuration in the grid takes the same cross-validation exam."
        ],
        importantPoints: [
          "Exhaustive over the supplied grid.",
          "Uses CV for candidate comparison.",
          "Can refit the selected configuration."
        ]
      },

      {
        id: "tuning-param-grid",
        title: "GridSearchCV: param_grid",
        explanation: [
          "param_grid defines the candidate hyperparameter values evaluated by GridSearchCV.",
          "Dictionary keys identify estimator parameters.",
          "Pipeline parameters use step__parameter syntax.",
          "A list of dictionaries can represent separate valid search regions when parameter combinations have conditional applicability.",
          "Only combinations represented by the supplied grid are evaluated."
        ],
        intuition: [
          "param_grid is the experiment menu from which GridSearchCV generates all requested combinations."
        ],
        importantPoints: [
          "Defines the exhaustive search region.",
          "Supports nested Pipeline parameters.",
          "Can represent multiple conditional grids."
        ]
      },

      {
        id: "tuning-randomizedsearchcv",
        title: "RandomizedSearchCV",
        explanation: [
          "RandomizedSearchCV samples a limited number of parameter configurations rather than exhaustively evaluating every combination.",
          "Candidate values can come from lists or compatible statistical distributions.",
          "The number of sampled configurations is controlled by n_iter.",
          "This can make Random Search much more practical for large or continuous search spaces.",
          "Randomized Search does not guarantee that every possible configuration will be evaluated."
        ],
        intuition: [
          "Instead of visiting every house in a huge city, randomly inspect a carefully chosen number of locations across the city."
        ],
        importantPoints: [
          "Samples configurations.",
          "Useful for large spaces.",
          "Supports distributions.",
          "Budget controlled through n_iter."
        ]
      },

      {
        id: "tuning-param-distributions",
        title: "RandomizedSearchCV: param_distributions",
        explanation: [
          "param_distributions defines the search space from which RandomizedSearchCV samples.",
          "Entries can contain finite candidate lists or compatible distribution objects.",
          "Distributions are useful when a hyperparameter is naturally continuous or spans a large range.",
          "The chosen distribution strongly affects which parts of the parameter space receive search effort."
        ],
        intuition: [
          "Instead of listing every possible value, describe how candidate values should be sampled."
        ],
        importantPoints: [
          "Defines Randomized Search sampling space.",
          "Can use lists or distributions.",
          "Distribution choice matters."
        ]
      },

      {
        id: "tuning-n-iter",
        title: "RandomizedSearchCV: n_iter",
        explanation: [
          "n_iter controls how many parameter settings RandomizedSearchCV samples.",
          "Increasing n_iter explores more configurations but increases computational cost.",
          "A small n_iter can miss promising regions.",
          "A very large n_iter can remove much of the computational advantage over exhaustive search.",
          "The correct budget depends on search-space size and available resources."
        ],
        intuition: [
          "n_iter is the number of experiment tickets you can afford to spend."
        ],
        importantPoints: [
          "Direct search-budget control.",
          "Higher means broader exploration.",
          "Higher also means more model fits."
        ]
      },

      {
        id: "tuning-random-state",
        title: "RandomizedSearchCV: random_state",
        explanation: [
          "random_state can make randomized candidate sampling reproducible.",
          "Using the same search space and seed helps reproduce sampled configurations.",
          "It is an experimental reproducibility control rather than a model-complexity hyperparameter.",
          "Seeds should not be repeatedly searched merely to obtain a lucky validation result."
        ],
        intuition: [
          "Fix the random draw so the same randomized experiment can be repeated."
        ],
        importantPoints: [
          "Reproducibility control.",
          "Relevant to randomized search.",
          "Do not optimize the seed."
        ]
      },

      {
        id: "tuning-grid-vs-random",
        title: "Grid Search vs Random Search",
        explanation: [
          "Grid Search is useful when the search space is relatively small and meaningful candidate values are known.",
          "Random Search is attractive when there are many parameters, continuous ranges or a limited computational budget.",
          "Grid Search spends experiments on every Cartesian-product combination.",
          "Random Search can explore more distinct values of influential parameters under the same budget.",
          "Neither method guarantees that the globally best possible hyperparameter configuration has been found."
        ],
        intuition: [
          "Grid Search is exhaustive inside a small box. Random Search can explore a much larger box using a fixed number of attempts."
        ],
        importantPoints: [
          "Grid is exhaustive over specified candidates.",
          "Random Search is budget-oriented.",
          "Search-space quality remains critical."
        ]
      },

      {
        id: "tuning-cv-parameter",
        title: "Search CV: cv",
        explanation: [
          "cv controls how candidate configurations are evaluated across training and validation partitions.",
          "An integer can request a default fold strategy, while explicit splitter objects provide greater control.",
          "Classification, grouped observations and time-ordered observations may require different CV strategies.",
          "The search procedure repeatedly uses these folds for candidate evaluation.",
          "The final untouched test set remains outside this process."
        ],
        intuition: [
          "cv defines the exam papers on which every candidate hyperparameter configuration is judged."
        ],
        importantPoints: [
          "Controls validation splitting.",
          "Must respect dataset structure.",
          "Not the final test evaluation."
        ]
      },

      {
        id: "tuning-scoring-parameter",
        title: "Search CV: scoring",
        explanation: [
          "scoring determines how candidate configurations are compared.",
          "The chosen metric can change which hyperparameters are considered best.",
          "Classification examples include accuracy, F1, ROC-AUC and average precision.",
          "Regression examples include MAE- and squared-error-based scorers.",
          "Metric direction and sklearn scorer conventions should be understood when interpreting results."
        ],
        intuition: [
          "The winner of a competition depends on what the competition awards points for."
        ],
        importantPoints: [
          "Metric defines candidate ranking.",
          "Choose according to the real objective.",
          "Do not default blindly to accuracy."
        ]
      },

      {
        id: "tuning-multi-metric",
        title: "Multi-Metric Hyperparameter Search",
        explanation: [
          "Search procedures can evaluate multiple scoring metrics in one experiment.",
          "This is useful when model behavior cannot be represented by one number.",
          "For example, a classifier may be evaluated using ROC-AUC, recall and precision.",
          "When multiple metrics are supplied, the refit strategy must identify how the final selected estimator should be chosen when refitting is requested.",
          "Secondary metrics remain useful for diagnosing trade-offs."
        ],
        intuition: [
          "One candidate may rank best for recall while another ranks best for precision, so inspect more than one scoreboard."
        ],
        importantPoints: [
          "Supports multiple metrics.",
          "Selection rule still matters.",
          "Inspect trade-offs."
        ]
      },

      {
        id: "tuning-refit",
        title: "Search CV: refit",
        explanation: [
          "refit controls whether and how the selected configuration is fitted again after cross-validation search.",
          "With a single metric, refit=True ordinarily refits the best candidate on the full data supplied to the search.",
          "With multiple metrics, a scorer name can be used to identify which metric determines the refitted estimator.",
          "Refitting produces best_estimator_ for convenient downstream prediction in ordinary workflows."
        ],
        intuition: [
          "Cross-validation chooses the winning recipe; refit cooks one final model from that recipe using the available search-training data."
        ],
        importantPoints: [
          "Controls post-search fitting.",
          "Important with multi-metric searches.",
          "Provides a selected fitted estimator."
        ]
      },

      {
        id: "tuning-n-jobs",
        title: "Search CV: n_jobs",
        explanation: [
          "n_jobs controls supported parallel execution of independent search fits.",
          "Hyperparameter searches can contain many independent candidate-fold combinations and therefore benefit strongly from parallelism.",
          "Using more workers can reduce elapsed time but increase CPU and memory pressure.",
          "Nested parallelism can occur when the underlying estimator also uses multiple workers."
        ],
        intuition: [
          "Many candidate exams can be graded simultaneously, provided enough hardware is available."
        ],
        importantPoints: [
          "Computational parameter.",
          "Can reduce runtime.",
          "Watch CPU and memory use.",
          "Watch nested parallelism."
        ]
      },

      {
        id: "tuning-pre-dispatch",
        title: "Search CV: pre_dispatch",
        explanation: [
          "pre_dispatch can limit how many parallel jobs are dispatched ahead of execution.",
          "It can help manage memory pressure when individual model fits are expensive.",
          "It does not change which hyperparameter configuration is statistically preferred.",
          "This is an execution-resource control rather than a model hyperparameter."
        ],
        intuition: [
          "Do not queue too many expensive experiments at once when memory is limited."
        ],
        importantPoints: [
          "Resource-management control.",
          "Useful with expensive parallel searches.",
          "Does not regularize the model."
        ]
      },

      {
        id: "tuning-return-train-score",
        title: "Search CV: return_train_score",
        explanation: [
          "return_train_score controls whether training scores are also recorded in cv_results_.",
          "Training scores can help diagnose whether candidate configurations are underfitting or overfitting.",
          "Recording them can add computational and result-storage overhead.",
          "They should be used diagnostically rather than as the primary selection target."
        ],
        intuition: [
          "Validation scores tell who generalizes; training scores can help explain why candidates behave differently."
        ],
        importantPoints: [
          "Diagnostic option.",
          "Useful for bias-variance analysis.",
          "Selection should remain validation-driven."
        ]
      },

      {
        id: "tuning-error-score",
        title: "Search CV: error_score",
        explanation: [
          "Some candidate configurations can fail during fitting because a parameter combination is invalid or numerically problematic.",
          "error_score controls how search procedures handle fit failures.",
          "A numerical value can assign a score to failed fits while raise can propagate the exception.",
          "Fit failures should be investigated rather than silently ignored."
        ],
        intuition: [
          "Decide whether a broken experiment should stop the tournament or receive a failure score."
        ],
        importantPoints: [
          "Search robustness control.",
          "Inspect fit warnings.",
          "Invalid search spaces should be corrected."
        ]
      },

      {
        id: "tuning-verbose",
        title: "Search CV: verbose",
        explanation: [
          "verbose controls the amount of progress information printed while a search runs.",
          "It can help monitor long experiments and understand how many fits are being executed.",
          "It does not affect model quality or candidate selection."
        ],
        intuition: [
          "Change how much the search tells you while it works."
        ],
        importantPoints: [
          "Logging control.",
          "Useful for long searches.",
          "No statistical effect."
        ]
      },

      {
        id: "tuning-best-params",
        title: "best_params_",
        explanation: [
          "best_params_ stores the hyperparameter configuration selected according to the search's ranking and refit logic.",
          "It describes the winning configuration among the candidates actually evaluated.",
          "It does not prove that the values are globally optimal outside the defined search space.",
          "The result should be interpreted together with validation scores and search-space boundaries."
        ],
        intuition: [
          "best_params_ means best among the experiments you ran, not best among every possible configuration in existence."
        ],
        importantPoints: [
          "Selected candidate configuration.",
          "Search-space dependent.",
          "Not proof of global optimality."
        ]
      },

      {
        id: "tuning-best-score",
        title: "best_score_",
        explanation: [
          "best_score_ summarizes the cross-validation score associated with the selected candidate under compatible search configurations.",
          "It is a model-selection estimate and can be optimistic when many configurations have been compared.",
          "It should not replace final evaluation on untouched test data.",
          "For rigorous performance estimation after extensive tuning, nested cross-validation can be useful."
        ],
        intuition: [
          "The winner's tournament score is useful for selection, but it is not the same as an untouched final exam score."
        ],
        importantPoints: [
          "CV selection score.",
          "Can contain selection optimism.",
          "Not final test performance."
        ]
      },

      {
        id: "tuning-best-estimator",
        title: "best_estimator_",
        explanation: [
          "When refitting is enabled, best_estimator_ provides the selected fitted workflow.",
          "For Pipeline searches, this can be the complete fitted preprocessing-plus-model pipeline.",
          "It can be used directly for prediction on new data.",
          "Its final test performance should still be measured only on data kept outside tuning."
        ],
        intuition: [
          "After the tournament, best_estimator_ is the fitted version of the selected winning workflow."
        ],
        importantPoints: [
          "Available with compatible refit settings.",
          "Can represent the full Pipeline.",
          "Evaluate on untouched test data."
        ]
      },

      {
        id: "tuning-cv-results",
        title: "Understanding cv_results_",
        explanation: [
          "cv_results_ contains detailed results for evaluated candidate configurations.",
          "It can include parameter values, mean validation scores, score variability, ranks, fit times and score times.",
          "When requested, training scores can also be available.",
          "Analyzing cv_results_ is more informative than looking only at the single winning candidate.",
          "It can reveal flat regions, unstable candidates and computationally expensive configurations."
        ],
        intuition: [
          "best_params_ tells you who won; cv_results_ lets you inspect the entire tournament."
        ],
        importantPoints: [
          "Contains candidate-level diagnostics.",
          "Inspect score variability.",
          "Inspect runtime.",
          "Useful for narrowing future searches."
        ]
      },

      {
        id: "tuning-mean-std",
        title: "Mean CV Score and Standard Deviation",
        explanation: [
          "Mean cross-validation score summarizes average candidate performance across folds.",
          "Standard deviation describes how much performance varied across those folds.",
          "A tiny mean-score difference can be less convincing when fold-to-fold variation is large.",
          "Model selection should therefore consider stability rather than blindly ranking candidates by many decimal places."
        ],
        intuition: [
          "A candidate scoring 0.901 ± 0.050 is not automatically meaningfully better than one scoring 0.899 ± 0.010."
        ],
        importantPoints: [
          "Inspect both average and variability.",
          "Small score differences may not be meaningful.",
          "Stable generalization matters."
        ]
      },

      {
        id: "tuning-selection-bias",
        title: "Model-Selection Bias",
        explanation: [
          "When many configurations are evaluated, some candidates can appear strong partly because of random validation variation.",
          "Selecting the maximum observed CV score introduces model-selection optimism.",
          "The more aggressively experiments are repeated against the same validation process, the more the development process can adapt to it.",
          "An untouched test set or nested cross-validation provides a more independent estimate."
        ],
        intuition: [
          "If you take enough attempts at the same exam, eventually one attempt may look unusually good partly by luck."
        ],
        importantPoints: [
          "Search itself can overfit validation.",
          "More experiments increase selection risk.",
          "Independent final evaluation matters."
        ]
      },

      {
        id: "tuning-nested-cv",
        title: "Nested Cross-Validation for Tuning",
        explanation: [
          "Nested cross-validation separates hyperparameter selection from performance estimation.",
          "The inner loop performs model selection or hyperparameter tuning using only the outer-training portion.",
          "The outer loop evaluates the complete selected workflow on an outer validation fold that was not used for inner selection.",
          "Repeating this across outer folds estimates the performance of the entire model-selection procedure.",
          "Nested CV is computationally expensive because each outer fold contains its own inner search."
        ],
        intuition: [
          "An inner competition chooses the model; an outer exam evaluates whether the whole competition process generalizes."
        ],
        importantPoints: [
          "Inner loop selects.",
          "Outer loop evaluates.",
          "Reduces selection bias in performance estimation.",
          "Computationally expensive."
        ]
      },

      {
        id: "tuning-nested-cost",
        title: "Nested CV Computational Cost",
        explanation: [
          "Suppose a search evaluates m candidate configurations using k inner folds and the outer evaluation uses r folds.",
          "The inner-search fitting cost alone is approximately m × k × r fits, before refits and final models are considered.",
          "This makes nested CV substantially more expensive than a single GridSearchCV.",
          "The stronger performance estimate must therefore be balanced against computational resources."
        ],
        intuition: [
          "Every outer fold runs its own complete tuning tournament."
        ],
        importantPoints: [
          "Nested CV multiplies search cost.",
          "Budget experiments deliberately.",
          "Use when unbiased procedure evaluation is important."
        ]
      },

      {
        id: "tuning-preprocessing-leakage",
        title: "Preprocessing Leakage During Tuning",
        explanation: [
          "Scaling, imputation, feature selection, dimensionality reduction and learned encoding can leak information when fitted before cross-validation.",
          "These transformations should normally be placed inside a Pipeline.",
          "For every fold and candidate, the transformation is then fitted only on that fold's training partition.",
          "This makes the validation fold genuinely unseen by both preprocessing and the estimator."
        ],
        intuition: [
          "The validation fold must be hidden from the scaler, imputer and feature selector, not just hidden from the final model."
        ],
        importantPoints: [
          "Pipeline learned preprocessing.",
          "Fit transformations inside folds.",
          "Prevent indirect leakage."
        ]
      },

      {
        id: "tuning-feature-selection-leakage",
        title: "Feature Selection Must Also Be Tuned Inside CV",
        explanation: [
          "Feature selection is a learned preprocessing operation because it uses data to decide which variables to retain.",
          "Selecting features once using the complete dataset before GridSearchCV leaks validation information.",
          "Feature selectors should be included inside the Pipeline when they are part of the modeling workflow.",
          "Their own hyperparameters can then be tuned using nested Pipeline syntax."
        ],
        intuition: [
          "Choosing the best features after seeing every row has already revealed information from future validation folds."
        ],
        importantPoints: [
          "Feature selection can leak.",
          "Place selectors inside Pipeline.",
          "Tune selector parameters with step__parameter."
        ]
      },

      {
        id: "tuning-conditional-spaces",
        title: "Conditional Hyperparameter Spaces",
        explanation: [
          "Not every hyperparameter is valid under every estimator configuration.",
          "For example, solver, penalty and regularization combinations in some estimators have compatibility constraints.",
          "Search spaces should represent only valid or meaningful combinations where possible.",
          "GridSearchCV can use separate dictionaries to represent different compatible parameter regions.",
          "Blind Cartesian products can waste computation on invalid candidates."
        ],
        intuition: [
          "Some settings belong together and others cannot legally coexist."
        ],
        importantPoints: [
          "Respect estimator constraints.",
          "Avoid invalid combinations.",
          "Use separate search regions when appropriate."
        ]
      },

      {
        id: "tuning-pipeline-nested",
        title: "Deep Pipeline Parameter Paths",
        explanation: [
          "The double-underscore syntax can address parameters nested inside composite sklearn estimators.",
          "A simple Pipeline might use model__C.",
          "More complex workflows can expose deeper parameter paths through named steps and nested transformers.",
          "Calling get_params().keys() on an estimator can help inspect available parameter names.",
          "Parameter paths must match the actual estimator structure."
        ],
        intuition: [
          "Double underscores act like an address telling sklearn exactly which component owns the parameter."
        ],
        importantPoints: [
          "Nested estimators expose nested parameter names.",
          "Names must match the actual Pipeline.",
          "get_params can help inspect valid paths."
        ]
      },

      {
        id: "tuning-coarse-to-fine",
        title: "Coarse-to-Fine Search",
        explanation: [
          "A practical strategy is to begin with a broad search over plausible parameter ranges.",
          "The results can reveal promising regions.",
          "A second narrower search can then examine those regions more precisely.",
          "This can be more efficient than starting with an enormous high-resolution grid.",
          "The refinement process must still use proper validation and preserve the final test set."
        ],
        intuition: [
          "First find the promising neighborhood, then inspect the streets inside that neighborhood."
        ],
        importantPoints: [
          "Broad search first.",
          "Refine promising regions.",
          "Avoid giant high-resolution grids."
        ]
      },

      {
        id: "tuning-search-boundaries",
        title: "When the Best Value Lies on a Search Boundary",
        explanation: [
          "If the selected hyperparameter repeatedly lies at the minimum or maximum value in the search space, the useful region may extend beyond the current boundary.",
          "This does not automatically mean the range must be expanded because model behavior and validation stability still matter.",
          "Boundary results are nevertheless an important diagnostic when designing the next search.",
          "cv_results_ can help determine whether performance is still trending toward the boundary."
        ],
        intuition: [
          "If the winner is standing at the edge of the map, the interesting territory may continue beyond the map."
        ],
        importantPoints: [
          "Inspect boundary winners.",
          "Use score trends.",
          "Expand deliberately, not automatically."
        ]
      },

      {
        id: "tuning-flat-region",
        title: "Flat Hyperparameter Regions",
        explanation: [
          "Several configurations can produce nearly indistinguishable validation performance.",
          "In that situation, choosing the numerically highest score may exaggerate meaningless noise.",
          "A simpler, faster or more stable configuration can be preferable when performance is effectively tied.",
          "Operational requirements should therefore be considered alongside validation scores."
        ],
        intuition: [
          "If many settings perform almost the same, choose the one that makes the system easier and safer to operate."
        ],
        importantPoints: [
          "Do not overinterpret tiny differences.",
          "Consider simplicity and runtime.",
          "Inspect uncertainty."
        ]
      },

      {
        id: "tuning-training-validation-diagnosis",
        title: "Using Train and Validation Scores During Tuning",
        explanation: [
          "Poor training and validation performance can indicate insufficient model capacity or inappropriate features.",
          "Very strong training performance with substantially weaker validation performance suggests excessive effective capacity.",
          "Hyperparameter tuning should therefore be connected to bias-variance diagnosis rather than treated as blind score optimization.",
          "return_train_score can provide useful diagnostics in supported search workflows."
        ],
        intuition: [
          "The score tells which candidate won; the training-validation relationship helps explain why candidates behave as they do."
        ],
        importantPoints: [
          "Connect tuning to bias and variance.",
          "Use training scores diagnostically.",
          "Do not optimize training score."
        ]
      },

      {
        id: "tuning-test-set-isolation",
        title: "The Test Set Must Stay Outside Tuning",
        explanation: [
          "Hyperparameters should not be changed in response to final test-set results.",
          "Repeated test evaluation causes development decisions to adapt to that test set.",
          "The test set then stops representing independent unseen performance.",
          "Use training-set validation or cross-validation for tuning and evaluate the test set after the workflow has been selected."
        ],
        intuition: [
          "If you keep looking at the final exam while changing your answers, it is no longer a final exam."
        ],
        importantPoints: [
          "Never tune on test performance.",
          "Keep test data independent.",
          "Evaluate after selection."
        ]
      },

      {
        id: "tuning-time-series",
        title: "Hyperparameter Tuning for Time-Series Data",
        explanation: [
          "Random K-Fold-style splitting can be inappropriate when observations are time ordered.",
          "Validation should preserve temporal direction so training does not use future observations to predict the past.",
          "TimeSeriesSplit or a domain-specific temporal validation strategy can be supplied to search procedures.",
          "Preprocessing must also be fitted only using the permitted historical training portion."
        ],
        intuition: [
          "A forecasting model should never study tomorrow before being tested on today."
        ],
        importantPoints: [
          "Respect temporal order.",
          "Use appropriate temporal CV.",
          "Prevent future leakage."
        ]
      },

      {
        id: "tuning-grouped-data",
        title: "Hyperparameter Tuning with Grouped Data",
        explanation: [
          "Observations from the same patient, customer, device, location or other entity may be statistically related.",
          "If related groups appear in both training and validation folds, performance can be overly optimistic.",
          "Group-aware splitters can keep related observations together.",
          "The grouping strategy must be passed consistently through the validation and tuning workflow."
        ],
        intuition: [
          "Do not let the model train on one record from a person and then pretend another record from the same person is fully unseen."
        ],
        importantPoints: [
          "Respect group boundaries.",
          "Avoid entity leakage.",
          "Use group-aware CV where required."
        ]
      },

      {
        id: "tuning-class-imbalance",
        title: "Tuning with Imbalanced Classification",
        explanation: [
          "Accuracy can select poor configurations when the majority class dominates.",
          "Metrics such as recall, F1, ROC-AUC or average precision may be more appropriate depending on the actual objective.",
          "Resampling or other learned preprocessing should occur inside the validation workflow rather than before splitting.",
          "Threshold selection is conceptually separate from choosing estimator hyperparameters."
        ],
        intuition: [
          "A search can optimize exactly the wrong behavior if the scoring metric rewards the wrong thing."
        ],
        importantPoints: [
          "Choose class-sensitive metrics.",
          "Prevent resampling leakage.",
          "Separate model tuning from threshold decisions."
        ]
      },

      {
        id: "tuning-computation",
        title: "Computational Complexity of Tuning",
        explanation: [
          "Search cost depends on the number of candidate configurations, CV folds and cost of fitting the underlying workflow.",
          "Grid Search can grow combinatorially as candidate lists are multiplied.",
          "Random Search provides direct control over the number of sampled configurations.",
          "Nested CV multiplies the cost further.",
          "Parallelism reduces elapsed time but does not remove the underlying computational work."
        ],
        intuition: [
          "Hyperparameter tuning trains the model many times, not once."
        ],
        importantPoints: [
          "Estimate fit count before searching.",
          "Use computational budgets.",
          "Parallelism is not free."
        ]
      },

      {
        id: "tuning-failure-diagnosis",
        title: "Hyperparameter Search Failure Diagnosis",
        explanation: [
          "If every candidate performs poorly, the problem may be data quality, feature representation, leakage-safe preprocessing or model-family mismatch rather than insufficient tuning.",
          "If many fits fail, inspect parameter compatibility and error messages.",
          "If the best configuration sits on a boundary, reconsider the search range.",
          "If CV scores vary strongly between folds, investigate dataset instability or splitting strategy.",
          "If training scores are excellent while validation scores are poor, focus on regularization and effective capacity."
        ],
        intuition: [
          "A failed tuning experiment is often telling you something about the workflow, not merely asking for a larger search."
        ],
        importantPoints: [
          "Inspect fit failures.",
          "Inspect boundaries.",
          "Inspect fold variability.",
          "Inspect train-validation gaps."
        ]
      },

      {
        id: "tuning-when-not-to-tune",
        title: "When Not to Perform Extensive Tuning",
        explanation: [
          "Extensive tuning is not useful when the data pipeline is still incorrect or leaking.",
          "It is also wasteful when the model does not beat a simple baseline.",
          "Very small datasets may not support reliable discrimination between many configurations.",
          "Operational constraints may make large complex models unacceptable regardless of validation score.",
          "A strong default model plus good features can sometimes be preferable to a massive search."
        ],
        intuition: [
          "Do not polish hyperparameters before proving that the underlying machine-learning workflow is sound."
        ],
        importantPoints: [
          "Fix data problems first.",
          "Establish baselines first.",
          "Consider whether tuning is worth the cost."
        ]
      },

      {
        id: "tuning-exam-interview",
        title: "Hyperparameter Tuning: Exam and Interview Essentials",
        explanation: [
          "Differentiate model parameters and hyperparameters.",
          "Explain Grid Search and Random Search.",
          "Explain why Random Search can be efficient in high-dimensional spaces.",
          "Calculate Grid Search fit counts.",
          "Explain search spaces and logarithmic ranges.",
          "Explain GridSearchCV and RandomizedSearchCV.",
          "Explain param_grid, param_distributions and n_iter.",
          "Explain scoring, cv, refit and n_jobs.",
          "Explain best_params_, best_score_, best_estimator_ and cv_results_.",
          "Explain Pipeline double-underscore syntax.",
          "Explain preprocessing leakage during tuning.",
          "Explain model-selection bias.",
          "Explain nested cross-validation.",
          "Explain why the final test set must remain outside tuning."
        ],
        intuition: [
          "A strong answer treats tuning as a complete validation experiment rather than simply calling GridSearchCV."
        ],
        importantPoints: [
          "Search space.",
          "Cross-validation.",
          "Scoring.",
          "Pipeline.",
          "Leakage.",
          "Nested CV.",
          "Test isolation."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "hyperparameter-search-explorer",
      title: "Hyperparameter Search Lab",
      description:
        "Explore Grid Search and Random Search over interactive parameter spaces and visualize validation scores, search cost and overfitting regions."
    },

    codeExamples: [
      {
        id: "grid-search-pipeline",
        title: "GridSearchCV with Pipeline",
        description:
          "Tune Logistic Regression without leaking scaling information.",
        language: "python",
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    (
        "classifier",
        LogisticRegression(max_iter=2000)
    )
])

param_grid = {
    "classifier__C": [
        0.01,
        0.1,
        1.0,
        10.0
    ]
}

search = GridSearchCV(
    pipeline,
    param_grid=param_grid,
    scoring="roc_auc",
    cv=5,
    n_jobs=-1
)

search.fit(
    X_train,
    y_train
)

print(
    "Best parameters:",
    search.best_params_
)

print(
    "Best CV score:",
    search.best_score_
)

print(
    "Final test accuracy:",
    search.best_estimator_.score(
        X_test,
        y_test
    )
)`,
        explanation: [
          "The scaler is fitted inside every search fold.",
          "classifier__C refers to C inside the classifier Pipeline step.",
          "The search uses only training data.",
          "The test set is evaluated after tuning."
        ],
        commonMistakes: [
          "Tuning directly on the test set.",
          "Creating an enormous grid without reason.",
          "Performing preprocessing before GridSearchCV."
        ]
      }
    ],

    practice: [
      {
        id: "tuning-practice-1",
        title: "Parameter or Hyperparameter",
        type: "concept",
        difficulty: "basic",
        question:
          "Is max_depth in DecisionTreeClassifier a parameter learned from the training samples or a hyperparameter configured by the user?",
        instructions: ["Think before model fitting."],
        hints: ["You pass max_depth to the constructor."],
        explanation:
          "max_depth is a hyperparameter."
      },
      {
        id: "tuning-practice-2",
        title: "Grid Search Cost",
        type: "analysis",
        difficulty: "medium",
        question:
          "A grid contains 4 values of C, 3 values of penalty and uses 5-fold CV. Ignoring refits, how many model fits are required?",
        instructions: ["Multiply combinations by folds."],
        hints: ["4 × 3 × 5."],
        explanation:
          "There are 12 parameter combinations and five folds, producing 60 fits."
      },
      {
        id: "tuning-practice-3",
        title: "Double Underscore",
        type: "concept",
        difficulty: "medium",
        question:
          "What does classifier__C mean in a Pipeline parameter grid?",
        instructions: ["Separate step name from parameter name."],
        hints: ["classifier is the Pipeline step."],
        explanation:
          "It refers to hyperparameter C of the estimator stored in the Pipeline step named classifier."
      },
      {
        id: "tuning-practice-4",
        title: "Test Set",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why should test-set performance not be used to select hyperparameters?",
        instructions: ["Think final evaluation independence."],
        hints: ["Selection adapts the model to the test results."],
        explanation:
          "Using test results for hyperparameter decisions leaks information from the test set into model selection and biases the final evaluation."
      },
      {
        id: "tuning-practice-5",
        title: "Random Search",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can RandomizedSearchCV be useful when the hyperparameter space is very large?",
        instructions: ["Compare exhaustive search cost."],
        hints: ["It evaluates only n_iter samples."],
        explanation:
          "Random Search explores a limited number of sampled configurations, allowing broader parameter ranges under a fixed computational budget."
      }
    ],

    commonMistakes: [
      {
        id: "tuning-mistake-1",
        title: "Tuning on test data",
        description:
          "The final evaluation becomes contaminated.",
        correction:
          "Tune using training-set cross-validation."
      },
      {
        id: "tuning-mistake-2",
        title: "Huge blind search spaces",
        description:
          "Search cost grows rapidly.",
        correction:
          "Use informed ranges and staged experimentation."
      }
    ],

    keyTakeaways: [
      "Hyperparameters control learning behavior.",
      "Grid Search evaluates every specified combination.",
      "Random Search samples combinations.",
      "Cross-validation should drive model selection.",
      "Pipeline parameters use step__parameter syntax.",
      "The tuning metric should match the real objective.",
      "The final test set must remain outside tuning."
    ]
  },

  // =========================================================
  // 3. ADVANCED CLASSIFICATION EVALUATION
  // =========================================================
  "advanced-classification-evaluation": {
    overview:
      "Classification evaluation goes far beyond accuracy. A complete evaluation considers the confusion matrix, precision, recall, specificity, F1, probability scores, ROC curves, ROC-AUC, Precision-Recall curves and the consequences of false positives and false negatives.",

    objectives: [
      "Understand confusion matrices.",
      "Understand TP, TN, FP and FN.",
      "Calculate precision and recall.",
      "Understand specificity.",
      "Understand F1 score.",
      "Understand ROC curves.",
      "Understand ROC-AUC.",
      "Understand Precision-Recall curves.",
      "Understand average precision.",
      "Select metrics based on error costs.",
      "Evaluate probability scores separately from thresholds."
    ],

    sections: [
      {
        id: "metrics-confusion",
        title: "Confusion Matrix",
        explanation: [
          "A confusion matrix compares actual and predicted classes.",
          "True positives are correctly predicted positives.",
          "True negatives are correctly predicted negatives.",
          "False positives are negative cases incorrectly predicted positive.",
          "False negatives are positive cases incorrectly predicted negative."
        ],
        intuition: [
          "The confusion matrix tells us not only how many predictions were wrong, but exactly what type of mistake occurred."
        ],
        importantPoints: [
          "FP and FN can have very different real-world costs.",
          "Always identify which class is considered positive."
        ]
      },

      {
        id: "metrics-precision-recall",
        title: "Precision and Recall",
        explanation: [
          "Precision measures the fraction of predicted positives that are actually positive.",
          "Precision = TP / (TP + FP).",
          "Recall measures the fraction of actual positives detected.",
          "Recall = TP / (TP + FN).",
          "Improving one can sometimes reduce the other depending on the threshold."
        ],
        intuition: [
          "Precision asks: when I raise an alarm, how often am I correct?",
          "Recall asks: of all real cases, how many did I detect?"
        ],
        importantPoints: [
          "High false positives reduce precision.",
          "High false negatives reduce recall.",
          "Metric importance depends on the application."
        ]
      },

      {
        id: "metrics-specificity",
        title: "Specificity",
        explanation: [
          "Specificity measures the fraction of actual negatives correctly identified.",
          "Specificity = TN / (TN + FP).",
          "It complements recall or sensitivity by describing performance on the negative class."
        ],
        intuition: [
          "Recall asks how well positives are detected. Specificity asks how well negatives are rejected."
        ],
        importantPoints: [
          "Specificity focuses on actual negatives.",
          "False positives reduce specificity."
        ]
      },

      {
        id: "metrics-f1",
        title: "F1 Score",
        explanation: [
          "F1 is the harmonic mean of precision and recall.",
          "F1 = 2 × precision × recall / (precision + recall).",
          "It becomes high only when both precision and recall are reasonably strong."
        ],
        intuition: [
          "F1 penalizes a model that performs very well on precision but very poorly on recall, or vice versa."
        ],
        importantPoints: [
          "F1 ignores true negatives directly.",
          "It is not automatically the correct metric for every imbalanced problem."
        ]
      },

      {
        id: "metrics-roc",
        title: "ROC Curve and ROC-AUC",
        explanation: [
          "The ROC curve evaluates a classifier across many thresholds.",
          "Its vertical axis is true-positive rate, which is recall.",
          "Its horizontal axis is false-positive rate.",
          "ROC-AUC summarizes ranking performance across thresholds.",
          "An AUC near 1 indicates strong ranking separation, while an AUC around 0.5 resembles random ranking for a balanced binary interpretation."
        ],
        intuition: [
          "ROC asks how sensitivity and false-alarm rate change as the decision threshold moves."
        ],
        importantPoints: [
          "ROC uses probability or decision scores.",
          "ROC-AUC is threshold-independent in the sense that it summarizes many thresholds.",
          "AUC does not choose the operational threshold for you."
        ]
      },

      {
        id: "metrics-pr",
        title: "Precision-Recall Curve",
        explanation: [
          "The Precision-Recall curve shows precision and recall across thresholds.",
          "It is often particularly informative when the positive class is rare.",
          "Average Precision summarizes the precision-recall relationship."
        ],
        intuition: [
          "When positive cases are rare, we often care directly about how many alerts are correct and how many real positives are found."
        ],
        importantPoints: [
          "PR analysis focuses strongly on the positive class.",
          "Class prevalence affects precision.",
          "Compare metrics in the context of the actual dataset."
        ]
      },
            {
        id: "metrics-evaluation-pipeline",
        title: "The Classification Evaluation Pipeline",
        explanation: [
          "A classifier often produces a continuous score before producing a final class label.",
          "That score may be a predicted probability or a decision-function value depending on the estimator.",
          "A decision threshold converts the continuous score into a predicted class.",
          "Predicted classes create TP, TN, FP and FN counts.",
          "Those counts create threshold-dependent metrics such as precision, recall, specificity and F1.",
          "Continuous scores can also be evaluated directly using ranking-oriented metrics such as ROC-AUC and Average Precision."
        ],
        intuition: [
          "Think of classification evaluation as a chain: model score -> threshold -> predicted class -> confusion matrix -> threshold-dependent metrics."
        ],
        importantPoints: [
          "Scores and hard predictions are different.",
          "Thresholds convert scores into classes.",
          "Confusion-matrix metrics depend on the selected threshold.",
          "Ranking metrics can evaluate continuous scores across thresholds."
        ]
      },

      {
        id: "metrics-confusion-matrix-layout",
        title: "Reading a Confusion Matrix Correctly",
        explanation: [
          "A binary confusion matrix contains four possible prediction outcomes: true negative, false positive, false negative and true positive.",
          "True and false describe whether the prediction was correct.",
          "Positive and negative refer to the predicted or actual class relationship used by the metric definition.",
          "The meaning of positive must be established before interpreting precision, recall, specificity or error costs.",
          "Different libraries may display axes with different labels, so always verify which axis represents actual values and which represents predictions."
        ],
        intuition: [
          "First ask what actually happened, then ask what the model predicted."
        ],
        importantPoints: [
          "TP: actual positive, predicted positive.",
          "TN: actual negative, predicted negative.",
          "FP: actual negative, predicted positive.",
          "FN: actual positive, predicted negative."
        ]
      },

      {
        id: "metrics-confusion-total",
        title: "Confusion Matrix and Total Observations",
        explanation: [
          "Every binary-classification observation belongs to exactly one of TP, TN, FP or FN.",
          "Therefore the total number of evaluated observations is TP + TN + FP + FN.",
          "Many common classification metrics are ratios formed from different subsets of these four counts.",
          "Understanding which denominator a metric uses is often more important than memorizing its name."
        ],
        intuition: [
          "The four confusion-matrix cells partition the entire evaluated dataset."
        ],
        importantPoints: [
          "N = TP + TN + FP + FN.",
          "Metrics use different denominators.",
          "Denominators reveal what question each metric answers."
        ]
      },

      {
        id: "metrics-accuracy",
        title: "Accuracy",
        explanation: [
          "Accuracy measures the fraction of all predictions that are correct.",
          "Accuracy = (TP + TN) / (TP + TN + FP + FN).",
          "It treats correct positive and correct negative predictions equally.",
          "Accuracy can be informative when classes and error costs are reasonably balanced.",
          "It can be highly misleading when one class dominates the dataset."
        ],
        intuition: [
          "Out of every prediction the model made, what fraction was correct?"
        ],
        importantPoints: [
          "Uses all four confusion-matrix cells.",
          "Easy to interpret.",
          "Can hide minority-class failure."
        ]
      },

      {
        id: "metrics-error-rate",
        title: "Error Rate",
        explanation: [
          "Error rate measures the fraction of predictions that are incorrect.",
          "Error Rate = (FP + FN) / (TP + TN + FP + FN).",
          "For ordinary binary accuracy, error rate equals 1 - accuracy.",
          "It combines false positives and false negatives even when those errors have very different consequences."
        ],
        intuition: [
          "Accuracy counts successes; error rate counts failures."
        ],
        importantPoints: [
          "Error Rate = 1 - Accuracy.",
          "Combines FP and FN.",
          "Does not represent unequal error costs."
        ]
      },

      {
        id: "metrics-accuracy-imbalance",
        title: "Why Accuracy Can Fail on Imbalanced Data",
        explanation: [
          "Suppose 99% of observations belong to the negative class.",
          "A classifier that predicts negative for every observation can achieve approximately 99% accuracy.",
          "However, its recall for the positive class is zero because it detects none of the positive observations.",
          "This demonstrates why accuracy must be interpreted together with class distribution and error costs."
        ],
        intuition: [
          "A model can win the accuracy game simply by always choosing the majority class."
        ],
        importantPoints: [
          "High accuracy does not guarantee useful minority detection.",
          "Always inspect class distribution.",
          "Use class-sensitive metrics when appropriate."
        ]
      },

      {
        id: "metrics-precision-deep",
        title: "Precision in Depth",
        explanation: [
          "Precision = TP / (TP + FP).",
          "Its denominator contains all observations predicted positive.",
          "Precision therefore measures the reliability of positive predictions.",
          "False positives directly reduce precision.",
          "Precision is important when acting on a positive prediction is expensive or disruptive."
        ],
        intuition: [
          "When the model says positive, how much should I trust that alert?"
        ],
        importantPoints: [
          "Denominator: predicted positives.",
          "FP reduces precision.",
          "Useful when false alarms are costly."
        ]
      },

      {
        id: "metrics-recall-deep",
        title: "Recall / Sensitivity / True Positive Rate",
        explanation: [
          "Recall = TP / (TP + FN).",
          "Its denominator contains all actual positive observations.",
          "Recall measures how much of the positive class was successfully detected.",
          "False negatives directly reduce recall.",
          "Recall is also called sensitivity or true positive rate in many contexts."
        ],
        intuition: [
          "Of everything that really was positive, how much did the model find?"
        ],
        importantPoints: [
          "Denominator: actual positives.",
          "FN reduces recall.",
          "Recall = Sensitivity = TPR."
        ]
      },

      {
        id: "metrics-specificity-deep",
        title: "Specificity / True Negative Rate",
        explanation: [
          "Specificity = TN / (TN + FP).",
          "Its denominator contains all actual negative observations.",
          "Specificity measures how effectively the classifier rejects negative cases.",
          "False positives reduce specificity.",
          "Specificity is also called the true negative rate."
        ],
        intuition: [
          "Of everything that really was negative, how much did the model correctly reject?"
        ],
        importantPoints: [
          "Denominator: actual negatives.",
          "FP reduces specificity.",
          "Specificity = TNR."
        ]
      },

      {
        id: "metrics-fpr",
        title: "False Positive Rate",
        explanation: [
          "False Positive Rate = FP / (FP + TN).",
          "It measures the fraction of actual negatives incorrectly classified as positive.",
          "Because specificity = TN / (TN + FP), FPR equals 1 - specificity.",
          "False Positive Rate forms the horizontal axis of the ROC curve."
        ],
        intuition: [
          "Among real negatives, how many false alarms did the model create?"
        ],
        importantPoints: [
          "FPR = FP / (FP + TN).",
          "FPR = 1 - Specificity.",
          "ROC horizontal axis."
        ]
      },

      {
        id: "metrics-fnr",
        title: "False Negative Rate",
        explanation: [
          "False Negative Rate = FN / (FN + TP).",
          "It measures the fraction of actual positives missed by the classifier.",
          "Because recall = TP / (TP + FN), FNR equals 1 - recall.",
          "FNR can be particularly important when missing a positive case has serious consequences."
        ],
        intuition: [
          "Among real positive cases, how many did the model fail to detect?"
        ],
        importantPoints: [
          "FNR = FN / (FN + TP).",
          "FNR = 1 - Recall.",
          "Useful when missed positives are costly."
        ]
      },

      {
        id: "metrics-npv",
        title: "Negative Predictive Value",
        explanation: [
          "Negative Predictive Value measures the reliability of negative predictions.",
          "NPV = TN / (TN + FN).",
          "Its denominator contains observations predicted negative.",
          "It complements precision by asking a similar reliability question for negative predictions.",
          "Like precision, NPV can depend strongly on class prevalence."
        ],
        intuition: [
          "When the model says negative, how often is that prediction actually correct?"
        ],
        importantPoints: [
          "NPV = TN / (TN + FN).",
          "Uses predicted negatives.",
          "Affected by prevalence."
        ]
      },

      {
        id: "metrics-balanced-accuracy",
        title: "Balanced Accuracy",
        explanation: [
          "Balanced accuracy gives equal importance to performance on the positive and negative classes.",
          "For binary classification it is commonly expressed as the average of sensitivity and specificity.",
          "Balanced Accuracy = (Recall + Specificity) / 2.",
          "It can be more informative than ordinary accuracy when class frequencies are unequal."
        ],
        intuition: [
          "Instead of allowing the majority class to dominate the score, grade positive and negative detection equally."
        ],
        importantPoints: [
          "Balances class-wise detection.",
          "Useful with imbalance.",
          "Does not encode application-specific error costs."
        ]
      },

      {
        id: "metrics-f1-math",
        title: "F1 Score Mathematics",
        explanation: [
          "F1 is the harmonic mean of precision and recall.",
          "F1 = 2PR / (P + R), where P is precision and R is recall.",
          "Using confusion-matrix counts, F1 can also be written as 2TP / (2TP + FP + FN).",
          "The harmonic mean strongly penalizes situations where either precision or recall is low.",
          "True negatives do not appear directly in the F1 formula."
        ],
        intuition: [
          "F1 becomes strong only when both alert reliability and positive-case detection are strong."
        ],
        importantPoints: [
          "Balances precision and recall.",
          "Harmonic mean.",
          "Does not directly use TN."
        ]
      },

      {
        id: "metrics-fbeta",
        title: "F-Beta Score",
        explanation: [
          "F-beta generalizes F1 by allowing precision and recall to receive different relative emphasis.",
          "F-beta = (1 + beta^2)PR / (beta^2 P + R).",
          "beta = 1 produces F1.",
          "beta greater than 1 places greater emphasis on recall.",
          "beta less than 1 places greater emphasis on precision."
        ],
        intuition: [
          "F1 treats precision and recall symmetrically; F-beta lets the application decide which one deserves more emphasis."
        ],
        importantPoints: [
          "beta = 1 gives F1.",
          "beta > 1 emphasizes recall.",
          "beta < 1 emphasizes precision."
        ]
      },

      {
        id: "metrics-precision-recall-tradeoff",
        title: "Precision-Recall Trade-Off",
        explanation: [
          "Changing the decision threshold changes which observations are predicted positive.",
          "Lowering the threshold usually predicts more observations as positive.",
          "This often increases recall because fewer positive cases are missed.",
          "However, additional false positives can reduce precision.",
          "Raising the threshold often produces the opposite behavior."
        ],
        intuition: [
          "A more sensitive alarm catches more real events but may also ring more often when nothing is wrong."
        ],
        importantPoints: [
          "Threshold controls the trade-off.",
          "Lower threshold often raises recall.",
          "Higher threshold can improve precision.",
          "Exact behavior depends on score distributions."
        ]
      },

      {
        id: "metrics-threshold",
        title: "Decision Thresholds",
        explanation: [
          "Many binary classifiers produce a continuous score before a class decision is made.",
          "A threshold determines which scores become positive predictions.",
          "The commonly used probability threshold of 0.5 is a convention for some classifiers, not a universal optimum.",
          "The correct operating threshold depends on error costs, class prevalence, calibration and operational constraints."
        ],
        intuition: [
          "The model produces confidence-like evidence; the threshold decides how much evidence is required before taking positive action."
        ],
        importantPoints: [
          "Threshold is an operational decision.",
          "0.5 is not universally optimal.",
          "Threshold selection should follow real costs."
        ]
      },

      {
        id: "metrics-threshold-confusion",
        title: "How Threshold Movement Changes the Confusion Matrix",
        explanation: [
          "Lowering a binary decision threshold usually increases the number of predicted positives.",
          "True positives can increase because more actual positives are captured.",
          "False positives can also increase because more actual negatives cross the threshold.",
          "Raising the threshold usually decreases predicted positives, often reducing both TP and FP.",
          "All threshold-dependent metrics therefore move as the confusion-matrix counts change."
        ],
        intuition: [
          "Move the threshold and observations physically move between the positive and negative prediction columns of the confusion matrix."
        ],
        importantPoints: [
          "Threshold changes TP, FP, TN and FN.",
          "Precision, recall, specificity and F1 therefore change.",
          "Threshold tuning is a decision problem."
        ]
      },

      {
        id: "metrics-score-vs-label",
        title: "Continuous Scores vs Hard Labels",
        explanation: [
          "Hard labels contain only the final class decision.",
          "Continuous scores preserve information about relative confidence or ranking.",
          "Two observations can both be predicted positive while having very different scores.",
          "ROC and Precision-Recall analysis use this richer score information to study behavior across many thresholds."
        ],
        intuition: [
          "A hard label says yes or no. A continuous score says how strongly the model leans toward yes."
        ],
        importantPoints: [
          "Hard labels discard ranking information.",
          "Continuous scores enable threshold analysis.",
          "Use the appropriate representation for each metric."
        ]
      },

      {
        id: "metrics-predict-proba-decision-function",
        title: "predict_proba vs decision_function",
        explanation: [
          "Some sklearn classifiers expose predict_proba and return class probability estimates.",
          "Other classifiers may expose decision_function scores.",
          "Ranking metrics such as ROC-AUC can often operate on suitable continuous decision scores even when calibrated probabilities are unavailable.",
          "Decision-function values should not automatically be interpreted as probabilities.",
          "Estimator documentation should be checked before interpreting score semantics."
        ],
        intuition: [
          "Both can rank observations, but only a genuine probability estimate should be interpreted directly as probability."
        ],
        importantPoints: [
          "Probability and decision score are different concepts.",
          "Both may support ranking evaluation.",
          "Do not interpret arbitrary decision scores as probabilities."
        ]
      },

      {
        id: "metrics-roc-construction",
        title: "How the ROC Curve Is Constructed",
        explanation: [
          "Begin with continuous classification scores.",
          "Consider a sequence of decision thresholds.",
          "At each threshold, calculate true positive rate and false positive rate.",
          "Plot FPR on the horizontal axis and TPR on the vertical axis.",
          "Connecting these operating points creates the ROC curve."
        ],
        intuition: [
          "Sweep the threshold from strict to permissive and record how detection and false alarms change."
        ],
        importantPoints: [
          "X-axis: FPR.",
          "Y-axis: TPR / Recall.",
          "Each point corresponds to threshold behavior."
        ]
      },

      {
        id: "metrics-roc-ideal",
        title: "Interpreting the ROC Curve",
        explanation: [
          "A useful ROC curve tends to rise toward high true-positive rates while maintaining relatively low false-positive rates.",
          "The diagonal reference represents random-like ranking behavior in the ordinary binary interpretation.",
          "Curves closer to the upper-left region generally indicate stronger discrimination.",
          "The operationally useful region depends on how much false-positive rate the application can tolerate."
        ],
        intuition: [
          "The ideal classifier climbs upward quickly before moving far to the right."
        ],
        importantPoints: [
          "Upper-left behavior is desirable.",
          "Application constraints determine relevant ROC regions.",
          "The curve does not itself choose a threshold."
        ]
      },

      {
        id: "metrics-roc-auc",
        title: "ROC-AUC in Depth",
        explanation: [
          "ROC-AUC summarizes the area under the ROC curve.",
          "It evaluates ranking discrimination across thresholds rather than performance at one fixed operating threshold.",
          "A higher ROC-AUC generally indicates that positive observations tend to receive higher scores than negative observations.",
          "ROC-AUC does not tell you whether probability estimates are calibrated.",
          "It also does not directly encode application-specific false-positive and false-negative costs."
        ],
        intuition: [
          "ROC-AUC asks whether the model tends to rank positive cases above negative cases."
        ],
        importantPoints: [
          "Ranking metric.",
          "Threshold-summary metric.",
          "Not a calibration metric.",
          "Not a direct business-cost metric."
        ]
      },

      {
        id: "metrics-auc-ranking",
        title: "Probability Interpretation of ROC-AUC",
        explanation: [
          "ROC-AUC has a useful ranking interpretation.",
          "Conceptually, it corresponds to the probability that a randomly selected positive observation receives a higher score than a randomly selected negative observation, with tie handling included in the formal definition.",
          "This explains why ROC-AUC depends on ordering rather than on one selected threshold.",
          "A model can therefore have good ROC-AUC while still using a poor operational threshold."
        ],
        intuition: [
          "Randomly choose one positive and one negative case. How often does the model rank the positive case higher?"
        ],
        importantPoints: [
          "AUC measures ranking discrimination.",
          "Good AUC does not guarantee a good chosen threshold.",
          "Good AUC does not guarantee calibrated probabilities."
        ]
      },

      {
        id: "metrics-roc-imbalance",
        title: "ROC-AUC and Class Imbalance",
        explanation: [
          "ROC-AUC can remain numerically strong even when operational precision is poor on a highly imbalanced dataset.",
          "False-positive rate divides false positives by all actual negatives.",
          "When negatives are extremely numerous, a seemingly small FPR can still correspond to many false-positive alerts.",
          "For rare-positive problems, Precision-Recall analysis can therefore provide an important complementary view."
        ],
        intuition: [
          "A tiny false-positive percentage can still mean thousands of false alarms when the negative population is enormous."
        ],
        importantPoints: [
          "ROC-AUC remains useful for ranking.",
          "Inspect PR behavior for rare positives.",
          "Translate rates into actual operational counts."
        ]
      },

      {
        id: "metrics-pr-construction",
        title: "How the Precision-Recall Curve Is Constructed",
        explanation: [
          "The Precision-Recall curve is generated by varying the classification threshold.",
          "For each threshold, precision and recall are calculated.",
          "Recall is typically shown on the horizontal axis and precision on the vertical axis.",
          "The curve therefore visualizes the trade-off between positive-case coverage and positive-prediction reliability."
        ],
        intuition: [
          "Sweep the threshold and record how many real positives are found and how trustworthy the positive alerts remain."
        ],
        importantPoints: [
          "Threshold-sweep curve.",
          "Focuses strongly on positive-class behavior.",
          "Useful with rare positives."
        ]
      },

      {
        id: "metrics-average-precision",
        title: "Average Precision",
        explanation: [
          "Average Precision summarizes the Precision-Recall relationship into one score.",
          "It is based on precision values obtained as recall changes across thresholds.",
          "It is commonly used as a ranking-oriented summary for imbalanced classification.",
          "Average Precision should not be casually treated as identical to every numerical method of computing geometric area under a PR curve."
        ],
        intuition: [
          "Average Precision compresses the model's precision-recall ranking behavior into one summary value."
        ],
        importantPoints: [
          "PR-oriented summary.",
          "Useful for rare-positive ranking problems.",
          "Not the same concept as fixed-threshold precision."
        ]
      },

      {
        id: "metrics-pr-baseline",
        title: "Precision-Recall Baseline and Prevalence",
        explanation: [
          "Precision depends on the prevalence of the positive class.",
          "For a random ranking, the expected precision level is related to the fraction of positives in the evaluated dataset.",
          "A PR curve should therefore be interpreted relative to class prevalence.",
          "PR scores from datasets with very different prevalence should not be compared without context."
        ],
        intuition: [
          "When positives are extremely rare, even a useful classifier operates in a much harder precision environment."
        ],
        importantPoints: [
          "Precision depends on prevalence.",
          "PR interpretation requires class context.",
          "Dataset shifts can change operational precision."
        ]
      },

      {
        id: "metrics-roc-vs-pr",
        title: "ROC Curve vs Precision-Recall Curve",
        explanation: [
          "ROC analysis studies true-positive rate against false-positive rate.",
          "Precision-Recall analysis studies positive prediction reliability against positive-case coverage.",
          "ROC is useful for understanding class discrimination across thresholds.",
          "PR analysis is often especially revealing when the positive class is rare and false-positive volume matters.",
          "The two curves provide complementary rather than mutually exclusive information."
        ],
        intuition: [
          "ROC asks about separation between positives and negatives; PR asks whether positive alerts remain useful while positives are recovered."
        ],
        importantPoints: [
          "ROC: TPR vs FPR.",
          "PR: Precision vs Recall.",
          "Use both when they answer important operational questions."
        ]
      },

      {
        id: "metrics-log-loss",
        title: "Log Loss / Cross-Entropy Evaluation",
        explanation: [
          "Log loss evaluates predicted probabilities rather than only final class labels.",
          "For binary classification, confident probability assigned to the wrong class receives a large penalty.",
          "A model predicting 0.99 for an event that does not occur is penalized more strongly than a model predicting 0.55.",
          "Lower log loss is better.",
          "Log loss therefore evaluates aspects of probabilistic prediction that accuracy and ROC-AUC do not directly measure."
        ],
        intuition: [
          "Being confidently wrong should hurt more than being uncertain and wrong."
        ],
        importantPoints: [
          "Probability-sensitive metric.",
          "Lower is better.",
          "Penalizes confident errors strongly."
        ]
      },

      {
        id: "metrics-log-loss-math",
        title: "Binary Log Loss Mathematics",
        explanation: [
          "For one binary observation with target y and predicted positive probability p, log loss is -(y log(p) + (1-y) log(1-p)).",
          "Dataset log loss averages this quantity across observations.",
          "Correct confident probabilities produce small loss.",
          "Incorrect confident probabilities produce large loss.",
          "Predicted probabilities must be valid probability values."
        ],
        intuition: [
          "The logarithm makes extreme confidence expensive when the prediction is wrong."
        ],
        importantPoints: [
          "Uses probabilities.",
          "Lower is better.",
          "Sensitive to confidence."
        ]
      },

      {
        id: "metrics-brier-score",
        title: "Brier Score",
        explanation: [
          "For binary probabilistic classification, the Brier score measures squared error between predicted probabilities and actual binary outcomes.",
          "Conceptually, it averages (p - y)^2 across observations.",
          "Lower values indicate smaller probability error.",
          "Unlike ROC-AUC, the Brier score is sensitive to the numerical probability values rather than only their ranking.",
          "Its interpretation is connected to probabilistic accuracy and calibration."
        ],
        intuition: [
          "If the model says 0.9, compare that probability numerically with whether the event actually occurred."
        ],
        importantPoints: [
          "Probability-sensitive.",
          "Lower is better.",
          "Different from ranking metrics."
        ]
      },

      {
        id: "metrics-discrimination-vs-calibration",
        title: "Discrimination vs Calibration",
        explanation: [
          "Discrimination describes how effectively the model separates or ranks classes.",
          "ROC-AUC is primarily a discrimination or ranking metric.",
          "Calibration asks whether predicted probability values correspond to observed event frequencies.",
          "A model can rank observations correctly while producing poorly calibrated probabilities.",
          "Conversely, probability calibration and ranking quality answer different questions."
        ],
        intuition: [
          "One question is whether the model orders risk correctly; another is whether 80% really means roughly an 80% event rate."
        ],
        importantPoints: [
          "ROC-AUC measures ranking discrimination.",
          "Calibration evaluates probability meaning.",
          "Do not treat them as interchangeable."
        ]
      },

      {
        id: "metrics-calibration-bridge",
        title: "Bridge to Probability Calibration",
        explanation: [
          "When predicted probabilities drive medical risk, financial risk, resource allocation or threshold decisions, their numerical reliability matters.",
          "Calibration curves compare predicted probability levels with observed outcome frequencies.",
          "Probability calibration will be studied separately because it requires its own diagnostics and methods.",
          "The important evaluation principle here is that a strong classification ranking score does not guarantee trustworthy probabilities."
        ],
        intuition: [
          "A model can know who is riskier without knowing exactly how risky each person is."
        ],
        importantPoints: [
          "Ranking and calibration differ.",
          "Probability quality matters for decisions.",
          "Calibration deserves separate evaluation."
        ]
      },

      {
        id: "metrics-cost-sensitive",
        title: "Cost-Sensitive Evaluation",
        explanation: [
          "Real applications rarely assign identical consequences to every error.",
          "A false negative can be more expensive than a false positive in disease screening.",
          "A false positive can be extremely expensive in other systems where positive predictions trigger costly intervention.",
          "Metric selection and threshold selection should therefore reflect the consequences of each error type."
        ],
        intuition: [
          "The most important mistake is determined by the real-world decision, not by the metric name."
        ],
        importantPoints: [
          "FP and FN can have unequal costs.",
          "Choose metrics from domain objectives.",
          "Thresholds should reflect operational consequences."
        ]
      },

      {
        id: "metrics-expected-cost",
        title: "Expected Classification Cost",
        explanation: [
          "When approximate monetary or operational costs are known, errors can be translated into an expected cost framework.",
          "A simple binary cost expression can combine the number of false positives multiplied by false-positive cost and false negatives multiplied by false-negative cost.",
          "Additional costs or benefits can be incorporated when the application requires them.",
          "The threshold producing the best business outcome may differ from the threshold maximizing F1 or accuracy."
        ],
        intuition: [
          "Instead of asking which threshold has the prettiest metric, ask which threshold creates the best real decision outcome."
        ],
        importantPoints: [
          "Metrics are proxies for consequences.",
          "Explicit costs can guide thresholds.",
          "Best business threshold may not maximize F1."
        ]
      },

      {
        id: "metrics-medical-cost-example",
        title: "False Negatives vs False Positives: Medical Example",
        explanation: [
          "In a screening problem, a false negative means an affected patient is missed.",
          "A false positive means an unaffected patient is flagged for further investigation.",
          "If missing disease is substantially more harmful than additional screening, recall may receive greater emphasis.",
          "This does not mean false positives should be ignored because excessive false alarms can overwhelm clinical resources."
        ],
        intuition: [
          "Catch as many dangerous cases as possible while keeping the follow-up burden manageable."
        ],
        importantPoints: [
          "High FN cost can favor recall.",
          "FP still consumes resources.",
          "Operational capacity matters."
        ]
      },

      {
        id: "metrics-threshold-cost",
        title: "Threshold Selection from Error Costs",
        explanation: [
          "A lower threshold usually detects more positives but also creates more positive predictions overall.",
          "A higher threshold usually reduces positive predictions.",
          "The preferred threshold depends on the relative cost of missed positives, false alarms and interventions.",
          "Threshold selection should be performed using validation data or an appropriate validation procedure rather than the final test set."
        ],
        intuition: [
          "The threshold is where statistical prediction becomes a real-world policy."
        ],
        importantPoints: [
          "Threshold follows costs.",
          "Tune threshold on validation data.",
          "Keep the final test set independent."
        ]
      },

      {
        id: "metrics-threshold-leakage",
        title: "Threshold Selection Can Also Overfit",
        explanation: [
          "Trying many thresholds and selecting the best one on a dataset is a form of model-selection activity.",
          "Selecting a threshold directly on final test performance leaks test information into the decision process.",
          "Threshold selection should therefore occur on validation data, cross-validation predictions or another development-only procedure.",
          "The final test set should evaluate the complete model-plus-threshold policy."
        ],
        intuition: [
          "If you choose the passing mark after seeing the final exam answers, the exam is no longer independent."
        ],
        importantPoints: [
          "Threshold tuning is part of development.",
          "Do not tune on the test set.",
          "Evaluate the final operating policy once."
        ]
      },

      {
        id: "metrics-multiclass-confusion",
        title: "Multiclass Confusion Matrix",
        explanation: [
          "For C classes, the confusion matrix becomes a C by C table.",
          "Diagonal cells represent correct predictions.",
          "Off-diagonal cells show which classes are confused with one another.",
          "The matrix therefore reveals error structure that overall accuracy cannot show.",
          "Large off-diagonal values can identify specific class pairs requiring better features or more representative data."
        ],
        intuition: [
          "Instead of only asking how many mistakes occurred, inspect exactly which class is being mistaken for which other class."
        ],
        importantPoints: [
          "Diagonal means correct.",
          "Off-diagonal means confusion.",
          "Useful for diagnosing class-specific errors."
        ]
      },

      {
        id: "metrics-one-vs-rest",
        title: "One-vs-Rest View of Multiclass Metrics",
        explanation: [
          "Precision, recall and related binary metrics can be computed for each class by treating that class as positive and the remaining classes as negative.",
          "This produces one metric value per class.",
          "Those class-wise values can then be summarized using averaging strategies.",
          "Per-class scores should still be inspected because averages can hide weak classes."
        ],
        intuition: [
          "Give each class one turn as the positive class and evaluate it against everything else."
        ],
        importantPoints: [
          "Produces per-class metrics.",
          "Supports multiclass precision and recall.",
          "Inspect individual classes as well as averages."
        ]
      },

      {
        id: "metrics-macro-average",
        title: "Macro Averaging",
        explanation: [
          "Macro averaging calculates the metric independently for each class and then takes the unweighted mean.",
          "Every class therefore contributes equally regardless of how many observations it contains.",
          "Macro metrics are useful when minority-class performance should matter as much as majority-class performance.",
          "A poor rare-class score can substantially lower the macro average."
        ],
        intuition: [
          "Give every class one equal vote in the final metric."
        ],
        importantPoints: [
          "Equal class weighting.",
          "Highlights minority-class weakness.",
          "Independent of class support weighting."
        ]
      },

      {
        id: "metrics-weighted-average",
        title: "Weighted Averaging",
        explanation: [
          "Weighted averaging calculates a metric for each class and weights each class by its support.",
          "Support is the number of true observations belonging to that class.",
          "Large classes therefore contribute more strongly to the final weighted score.",
          "Weighted averages can hide weak minority-class behavior if majority classes dominate the dataset."
        ],
        intuition: [
          "Classes with more observations receive more voting power in the final average."
        ],
        importantPoints: [
          "Weighted by class support.",
          "Reflects dataset frequency.",
          "Inspect minority classes separately."
        ]
      },

      {
        id: "metrics-micro-average",
        title: "Micro Averaging",
        explanation: [
          "Micro averaging aggregates the underlying TP, FP and FN contributions across classes before computing the metric.",
          "It therefore emphasizes overall instance-level decisions rather than giving each class equal influence.",
          "In ordinary single-label multiclass classification, micro precision, micro recall and micro F1 have close relationships with overall accuracy.",
          "Its behavior differs in multilabel settings."
        ],
        intuition: [
          "Pool the class-level decisions into one large collection before calculating the metric."
        ],
        importantPoints: [
          "Aggregates counts globally.",
          "Different from averaging per-class metrics.",
          "Interpret according to task structure."
        ]
      },

      {
        id: "metrics-average-comparison",
        title: "Macro vs Micro vs Weighted",
        explanation: [
          "Macro asks how well the model performs on the average class when every class is equally important.",
          "Weighted asks how well it performs when class contribution follows dataset support.",
          "Micro aggregates decisions globally.",
          "Large differences between macro and weighted scores often indicate unequal performance across common and rare classes.",
          "No averaging method is universally best."
        ],
        intuition: [
          "Macro is class democracy, weighted follows population size, and micro pools all decisions."
        ],
        importantPoints: [
          "Macro: equal classes.",
          "Weighted: support-weighted classes.",
          "Micro: globally aggregated counts.",
          "Choose according to the evaluation objective."
        ]
      },

      {
        id: "metrics-support",
        title: "Support in classification_report",
        explanation: [
          "Support is the number of actual observations belonging to each class.",
          "It is not itself a quality metric.",
          "Support provides context for interpreting class-specific precision, recall and F1.",
          "A metric estimated from very few observations can be less stable than one estimated from many observations."
        ],
        intuition: [
          "A score of 100% based on two examples carries different evidence from 100% based on ten thousand examples."
        ],
        importantPoints: [
          "Support = number of true samples per class.",
          "Provides metric context.",
          "Small support can create unstable estimates."
        ]
      },

      {
        id: "metrics-zero-division",
        title: "Undefined Precision and Recall",
        explanation: [
          "Some metrics become mathematically undefined when their denominator is zero.",
          "For example, precision is undefined if a classifier predicts no positive observations.",
          "Evaluation libraries provide behavior for handling these cases, but the underlying reason should not be ignored.",
          "An undefined metric often reveals an important failure mode in model behavior."
        ],
        intuition: [
          "If the model never raises a positive alarm, asking how accurate its positive alarms are has no ordinary denominator."
        ],
        importantPoints: [
          "Check denominator conditions.",
          "Do not hide undefined metrics blindly.",
          "Investigate why the model produced the condition."
        ]
      },

      {
        id: "metrics-sklearn-average",
        title: "sklearn Metric Parameter: average",
        explanation: [
          "Several sklearn classification metrics expose an average parameter for multiclass or multilabel summarization.",
          "Common strategies include binary, micro, macro, weighted and samples where supported by the metric and target type.",
          "The correct option depends on whether the problem is binary, multiclass or multilabel and on how class importance should be represented.",
          "Metric documentation should be checked because supported averaging options differ across functions."
        ],
        intuition: [
          "average tells sklearn how separate class-level results should be combined."
        ],
        importantPoints: [
          "Metric-specific parameter.",
          "Controls multiclass or multilabel summarization.",
          "Not a model hyperparameter."
        ]
      },

      {
        id: "metrics-sklearn-pos-label",
        title: "sklearn Metric Parameter: pos_label",
        explanation: [
          "Binary classification metrics need to know which label represents the positive class.",
          "pos_label identifies that class in compatible sklearn metrics.",
          "Incorrect positive-class specification can reverse the interpretation of precision, recall and related metrics.",
          "Always define the positive event according to the real application."
        ],
        intuition: [
          "Before measuring positive-case performance, tell the metric which class actually means positive."
        ],
        importantPoints: [
          "Binary metric configuration.",
          "Positive class must match domain meaning.",
          "Not a model-training parameter."
        ]
      },

      {
        id: "metrics-sklearn-sample-weight",
        title: "sklearn Metric Parameter: sample_weight",
        explanation: [
          "Many sklearn metrics support sample_weight to assign different contribution weights to observations.",
          "This changes the evaluation calculation rather than retraining the estimator.",
          "Weights should represent a justified evaluation objective rather than being chosen merely to improve a reported score.",
          "Metric weighting and estimator training weights are related ideas but are not automatically the same operation."
        ],
        intuition: [
          "Tell the evaluator that some observations count more heavily in the final score."
        ],
        importantPoints: [
          "Evaluation weighting.",
          "Does not itself retrain the model.",
          "Use only with justified weighting logic."
        ]
      },

      {
        id: "metrics-sklearn-labels",
        title: "sklearn Metric Parameter: labels",
        explanation: [
          "Some classification metric functions allow explicit control over which class labels are included and their ordering.",
          "This can be useful when a stable reporting order is required or when evaluating a selected subset of classes.",
          "Changing included labels changes the meaning of some aggregated metrics.",
          "The reporting configuration should therefore be documented."
        ],
        intuition: [
          "Control which classes appear in the evaluation report and in what order."
        ],
        importantPoints: [
          "Evaluation/reporting parameter.",
          "Can affect aggregated results.",
          "Document label selection."
        ]
      },

      {
        id: "metrics-multiclass-roc",
        title: "ROC-AUC for Multiclass Classification",
        explanation: [
          "ROC-AUC can be extended beyond binary classification using multiclass strategies.",
          "Common approaches compare classes using one-vs-rest or one-vs-one constructions.",
          "Class-level AUC values then require an averaging strategy.",
          "The exact configuration should be reported because different multiclass definitions answer different questions."
        ],
        intuition: [
          "Binary ROC has one positive-vs-negative problem; multiclass ROC must define how several classes are compared."
        ],
        importantPoints: [
          "Requires multiclass strategy.",
          "Requires averaging interpretation.",
          "Report the evaluation configuration."
        ]
      },

      {
        id: "metrics-multilabel",
        title: "Multilabel Classification Evaluation",
        explanation: [
          "In multilabel classification, one observation can belong to several labels simultaneously.",
          "This differs fundamentally from ordinary multiclass classification where one observation normally belongs to one class.",
          "Micro, macro, weighted and samples-based averaging can answer different questions in multilabel evaluation.",
          "Subset accuracy is extremely strict because it requires the complete predicted label set to match exactly."
        ],
        intuition: [
          "Multiclass chooses one category; multilabel can attach several tags to the same observation."
        ],
        importantPoints: [
          "Multiclass and multilabel are different tasks.",
          "Averaging strategy matters.",
          "Exact-match accuracy can be very strict."
        ]
      },

      {
        id: "metrics-hamming-loss",
        title: "Hamming Loss",
        explanation: [
          "Hamming loss is useful in multilabel settings.",
          "It measures the fraction of individual label assignments that are incorrect.",
          "Unlike subset accuracy, it gives partial credit when some labels for an observation are correct and others are wrong.",
          "Lower Hamming loss is better."
        ],
        intuition: [
          "Judge every individual label decision instead of requiring the entire set of labels to be perfectly correct."
        ],
        importantPoints: [
          "Multilabel-oriented metric.",
          "Lower is better.",
          "Less strict than exact-match accuracy."
        ]
      },

      {
        id: "metrics-ranking-vs-probability",
        title: "Ranking Metrics vs Probability Metrics",
        explanation: [
          "ROC-AUC and Average Precision primarily evaluate ranking behavior.",
          "Log loss and Brier score evaluate the numerical quality of probability predictions.",
          "Accuracy, precision, recall, specificity and F1 evaluate decisions after a threshold has produced class labels.",
          "These metric families answer different questions and should not be substituted blindly."
        ],
        intuition: [
          "Ask separately: did the model rank cases correctly, were its probabilities meaningful, and did its final decisions work?"
        ],
        importantPoints: [
          "Ranking metrics.",
          "Probability-quality metrics.",
          "Threshold-dependent decision metrics.",
          "Use metrics according to the question."
        ]
      },

      {
        id: "metrics-evaluation-workflow",
        title: "Complete Classification Evaluation Workflow",
        explanation: [
          "Begin by defining the positive event and real costs of false positives and false negatives.",
          "Inspect class distribution.",
          "Evaluate the confusion matrix at a meaningful operating threshold.",
          "Inspect precision, recall, specificity, F1 and class-wise metrics.",
          "Evaluate ranking with ROC-AUC and Precision-Recall analysis when continuous scores are available.",
          "Evaluate probability quality when probabilities will drive decisions.",
          "Select thresholds using validation data.",
          "Perform final evaluation on untouched test data."
        ],
        intuition: [
          "Start from the decision problem, then choose metrics—not the other way around."
        ],
        importantPoints: [
          "Define costs.",
          "Inspect classes.",
          "Evaluate decisions.",
          "Evaluate ranking.",
          "Evaluate probabilities when needed.",
          "Protect the test set."
        ]
      },

      {
        id: "metrics-diagnostic-high-accuracy-low-recall",
        title: "Diagnosis: High Accuracy but Low Recall",
        explanation: [
          "This pattern often appears when the positive class is rare.",
          "The model correctly predicts many negative observations, producing high overall accuracy.",
          "However, many positive observations become false negatives.",
          "Inspect class distribution, confusion matrix, threshold, model capacity and training objective."
        ],
        intuition: [
          "The model looks successful because negatives are easy and numerous while the important positives are being missed."
        ],
        importantPoints: [
          "Do not trust accuracy alone.",
          "Inspect FN count.",
          "Inspect threshold and imbalance."
        ]
      },

      {
        id: "metrics-diagnostic-high-recall-low-precision",
        title: "Diagnosis: High Recall but Low Precision",
        explanation: [
          "High recall with low precision means most positive cases are detected but many predicted positives are false alarms.",
          "This can occur when the threshold is permissive.",
          "It can also reflect poor class separation.",
          "Whether this behavior is acceptable depends on the cost and capacity associated with false positives."
        ],
        intuition: [
          "The alarm catches almost every real event because it rings very often."
        ],
        importantPoints: [
          "Many FP can reduce precision.",
          "Inspect threshold.",
          "Consider false-positive cost."
        ]
      },

      {
        id: "metrics-diagnostic-high-precision-low-recall",
        title: "Diagnosis: High Precision but Low Recall",
        explanation: [
          "High precision with low recall means positive predictions are usually correct but many real positives are missed.",
          "This can occur when the threshold is strict.",
          "It may be desirable when false positives are extremely costly.",
          "It is dangerous when missed positives carry the larger cost."
        ],
        intuition: [
          "The model raises an alarm only when very confident, so its alarms are reliable but many real events pass unnoticed."
        ],
        importantPoints: [
          "Many FN reduce recall.",
          "Strict thresholds can produce this pattern.",
          "Interpret using application costs."
        ]
      },

      {
        id: "metrics-diagnostic-good-auc-bad-threshold",
        title: "Diagnosis: Good ROC-AUC but Poor Classification",
        explanation: [
          "A classifier can have strong ranking performance while producing poor hard predictions at the current threshold.",
          "ROC-AUC evaluates ranking across thresholds, whereas accuracy, precision and recall evaluate a specific operating decision.",
          "Inspect the score distributions and choose a threshold using validation data and domain costs.",
          "Do not conclude that a strong AUC automatically means the deployed classifier is well configured."
        ],
        intuition: [
          "The model may order cases correctly but draw the decision line in the wrong place."
        ],
        importantPoints: [
          "Ranking and threshold decisions differ.",
          "Inspect operating threshold.",
          "Tune threshold without test leakage."
        ]
      },

      {
        id: "metrics-diagnostic-good-ranking-bad-calibration",
        title: "Diagnosis: Good Ranking but Poor Probabilities",
        explanation: [
          "A model can rank positive cases above negative cases while systematically overestimating or underestimating probabilities.",
          "ROC-AUC may remain strong because the ordering is preserved.",
          "Probability-sensitive metrics and calibration diagnostics can reveal the problem.",
          "This matters when probabilities are interpreted as actual risk."
        ],
        intuition: [
          "The model knows who is riskier but exaggerates or understates how risky they are."
        ],
        importantPoints: [
          "AUC does not guarantee calibration.",
          "Inspect probability quality separately.",
          "Important for risk-based decisions."
        ]
      },

      {
        id: "metrics-common-traps",
        title: "Common Evaluation Traps",
        explanation: [
          "Reporting only accuracy on an imbalanced dataset.",
          "Calculating ranking metrics from hard labels when continuous scores are available.",
          "Selecting thresholds on the final test set.",
          "Ignoring which class is defined as positive.",
          "Comparing metrics computed on different datasets without considering prevalence.",
          "Reporting only aggregate multiclass scores while hiding weak individual classes.",
          "Assuming high ROC-AUC means calibrated probabilities."
        ],
        intuition: [
          "Most evaluation mistakes come from answering the wrong question with the wrong metric."
        ],
        importantPoints: [
          "Match metric to objective.",
          "Protect the test set.",
          "Inspect class-wise behavior.",
          "Separate ranking, probability quality and decisions."
        ]
      },

      {
        id: "metrics-exam-formulas",
        title: "Essential Classification Metric Formulas",
        explanation: [
          "Accuracy = (TP + TN) / (TP + TN + FP + FN).",
          "Precision = TP / (TP + FP).",
          "Recall or Sensitivity = TP / (TP + FN).",
          "Specificity = TN / (TN + FP).",
          "FPR = FP / (FP + TN).",
          "FNR = FN / (FN + TP).",
          "F1 = 2 × Precision × Recall / (Precision + Recall).",
          "Balanced Accuracy = (Sensitivity + Specificity) / 2."
        ],
        intuition: [
          "Instead of memorizing blindly, identify the denominator: predicted positives, actual positives, actual negatives or all observations."
        ],
        importantPoints: [
          "Know TP, TN, FP and FN first.",
          "Then derive the metric from the question being asked."
        ]
      },

      {
        id: "metrics-exam-interview",
        title: "Classification Evaluation: Exam and Interview Essentials",
        explanation: [
          "Draw and explain a confusion matrix.",
          "Define TP, TN, FP and FN.",
          "Calculate accuracy, precision, recall, specificity and F1.",
          "Explain false-positive rate and false-negative rate.",
          "Explain why accuracy can fail on imbalanced data.",
          "Explain precision-recall trade-offs.",
          "Explain how thresholds change confusion-matrix metrics.",
          "Explain ROC and ROC-AUC.",
          "Explain the ranking interpretation of ROC-AUC.",
          "Explain Precision-Recall curves and Average Precision.",
          "Differentiate ROC analysis and PR analysis.",
          "Differentiate discrimination and calibration.",
          "Explain log loss and Brier score.",
          "Explain macro, micro and weighted averaging.",
          "Explain multiclass and multilabel evaluation.",
          "Choose metrics from false-positive and false-negative costs."
        ],
        intuition: [
          "A strong answer explains what each metric measures, what information it ignores and when it should be used."
        ],
        importantPoints: [
          "Confusion matrix.",
          "Thresholds.",
          "Imbalance.",
          "ROC-AUC.",
          "Precision-Recall.",
          "Probability quality.",
          "Multiclass averaging.",
          "Error costs."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "classification-metrics-explorer",
      title: "Classification Metrics Lab",
      description:
        "Move the classification threshold and watch the confusion matrix, precision, recall, specificity, F1, ROC and Precision-Recall curves update in real time."
    },

    codeExamples: [
      {
        id: "advanced-metrics-code",
        title: "Complete Binary Classification Evaluation",
        description:
          "Evaluate hard predictions and probability ranking.",
        language: "python",
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "classifier",
        LogisticRegression(max_iter=2000)
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
)

print(
    "Average Precision:",
    average_precision_score(
        y_test,
        probabilities
    )
)`,
        explanation: [
          "Hard predictions produce the confusion matrix and threshold-dependent metrics.",
          "Probability scores are used for ROC-AUC and Average Precision.",
          "A complete evaluation considers multiple views of model behavior."
        ],
        commonMistakes: [
          "Using only accuracy.",
          "Computing ROC-AUC from hard labels when probability scores are available.",
          "Ignoring false-negative and false-positive costs."
        ]
      }
    ],

    practice: [
      {
        id: "metrics-practice-1",
        title: "False Negative",
        type: "concept",
        difficulty: "basic",
        question:
          "A patient has a disease but the model predicts no disease. What type of error is this?",
        instructions: ["Compare actual positive with predicted negative."],
        hints: ["The positive case was missed."],
        explanation:
          "It is a false negative."
      },
      {
        id: "metrics-practice-2",
        title: "Recall",
        type: "concept",
        difficulty: "medium",
        question:
          "Which metric directly measures how many actual positive cases were detected?",
        instructions: ["Think TP and FN."],
        hints: ["TP / (TP + FN)."],
        explanation:
          "Recall."
      },
      {
        id: "metrics-practice-3",
        title: "Precision",
        type: "concept",
        difficulty: "medium",
        question:
          "Which metric asks how many predicted positive cases were actually positive?",
        instructions: ["Think TP and FP."],
        hints: ["TP / (TP + FP)."],
        explanation:
          "Precision."
      },
      {
        id: "metrics-practice-4",
        title: "ROC-AUC",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why should ROC-AUC normally be calculated using probability or decision scores instead of already-thresholded predictions?",
        instructions: ["Think about evaluating many thresholds."],
        hints: ["Hard labels contain far less ranking information."],
        explanation:
          "ROC-AUC evaluates ranking behavior across thresholds, so continuous scores preserve the ordering information required for meaningful analysis."
      },
      {
        id: "metrics-practice-5",
        title: "Rare Positives",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can Precision-Recall analysis be especially useful when positive cases are rare?",
        instructions: ["Think about positive predictions and detection."],
        hints: ["Precision and recall focus directly on positive-class performance."],
        explanation:
          "Precision and recall directly expose the trade-off between false alarms and detected positive cases without true negatives dominating the summary."
      }
    ],

    commonMistakes: [
      {
        id: "metrics-mistake-1",
        title: "Accuracy-only evaluation",
        description:
          "Accuracy can hide poor minority-class behavior.",
        correction:
          "Inspect class-sensitive metrics and the confusion matrix."
      },
      {
        id: "metrics-mistake-2",
        title: "Metric without context",
        description:
          "A numerical score does not define the real cost of errors.",
        correction:
          "Choose metrics based on domain objectives and consequences."
      }
    ],

    keyTakeaways: [
      "Confusion matrices reveal error types.",
      "Precision penalizes false positives.",
      "Recall penalizes false negatives.",
      "Specificity evaluates negative-class detection.",
      "F1 balances precision and recall.",
      "ROC and PR curves evaluate threshold behavior.",
      "Metric selection must reflect the actual problem."
    ]
  },

  // =========================================================
  // 4. LEARNING CURVES
  // =========================================================
  "learning-curves": {
    overview:
      "Learning curves plot training and validation performance as the amount of training data changes. They are powerful diagnostic tools for identifying high bias, high variance, data scarcity and whether collecting additional data is likely to help.",

    objectives: [
      "Understand training curves and validation curves.",
      "Diagnose underfitting.",
      "Diagnose overfitting.",
      "Connect learning curves to bias and variance.",
      "Estimate whether more training data may help.",
      "Use sklearn learning_curve."
    ],

    sections: [
      {
        id: "lc-concept",
        title: "What Is a Learning Curve?",
        explanation: [
          "A learning curve evaluates model performance at different training-set sizes.",
          "For each size, the model is trained and evaluated using cross-validation.",
          "Training and validation scores are plotted together."
        ],
        intuition: [
          "We watch how a model learns as it receives progressively more examples."
        ],
        importantPoints: [
          "The x-axis commonly represents training-set size.",
          "Training and validation performance are compared."
        ]
      },

      {
        id: "lc-high-bias",
        title: "High Bias Pattern",
        explanation: [
          "When both training and validation performance are poor and relatively close, the model may be underfitting.",
          "Adding substantially more data may provide limited benefit if model capacity or features are the main limitation."
        ],
        intuition: [
          "The model performs poorly even on the examples it already saw."
        ],
        importantPoints: [
          "Poor training performance is an important underfitting signal.",
          "Consider better features or a more suitable model."
        ]
      },

      {
        id: "lc-high-variance",
        title: "High Variance Pattern",
        explanation: [
          "A large gap between strong training performance and weaker validation performance can indicate overfitting.",
          "More data, stronger regularization or reduced model complexity may help."
        ],
        intuition: [
          "The model understands its training examples much better than unseen examples."
        ],
        importantPoints: [
          "Training-validation gaps matter.",
          "Additional data can sometimes reduce variance."
        ]
      },

      {
        id: "lc-more-data",
        title: "Will More Data Help?",
        explanation: [
          "Learning curves can indicate whether validation performance is still improving as training size increases.",
          "If validation performance continues rising, more representative data may help.",
          "If both curves have plateaued at poor performance, additional data alone may not solve the issue."
        ],
        intuition: [
          "The curve tells us whether the model still appears to benefit from additional examples."
        ],
        importantPoints: [
          "Learning curves guide data-collection decisions.",
          "They are diagnostic rather than absolute guarantees."
        ]
      },
            {
        id: "lc-training-validation-curves",
        title: "Training Curve vs Validation Curve",
        explanation: [
          "A learning-curve experiment produces separate performance measurements for the training subsets and validation folds.",
          "The training curve shows performance on observations used to fit the model.",
          "The validation curve shows performance on observations excluded from fitting in each cross-validation round.",
          "The relationship between these two curves is usually more informative than either curve alone.",
          "Their absolute level, gap, slope and plateau all provide diagnostic information."
        ],
        intuition: [
          "The training curve shows how well the model handles familiar examples, while the validation curve shows how well its learning transfers to unseen examples."
        ],
        importantPoints: [
          "Inspect both curves together.",
          "Training score alone cannot measure generalization.",
          "Gap and plateau both matter."
        ]
      },

      {
        id: "lc-construction-step-by-step",
        title: "How a Learning Curve Is Constructed",
        explanation: [
          "First choose several training-set sizes.",
          "For each size, cross-validation creates training and validation partitions.",
          "Only the requested amount of training data is used to fit the estimator for that point.",
          "The fitted estimator is scored on its training subset and corresponding validation fold.",
          "This process is repeated across folds.",
          "The fold scores are aggregated for each training size.",
          "Repeating the process across all requested sizes creates the learning curves."
        ],
        intuition: [
          "Give the model a small amount of data, test it, give it more data, test it again, and continue while keeping evaluation leakage-safe."
        ],
        importantPoints: [
          "Multiple training sizes.",
          "Cross-validation at every size.",
          "Fresh fitting is required.",
          "Aggregate fold results."
        ]
      },

      {
        id: "lc-mathematical-view",
        title: "Mathematical View of Learning Curves",
        explanation: [
          "Let m represent the number of training observations used at a particular learning-curve point.",
          "For each m, cross-validation produces training scores and validation scores.",
          "The mean training score can be represented as a function of training size, S_train(m).",
          "The mean validation score can similarly be represented as S_val(m).",
          "The difference between these quantities provides one view of the generalization gap.",
          "Their behavior as m increases helps diagnose whether the limitation is related to bias, variance or data quantity."
        ],
        intuition: [
          "Instead of treating model performance as one number, learning curves study performance as a function of how much data the model receives."
        ],
        importantPoints: [
          "Performance depends on training size.",
          "Study S_train(m) and S_val(m).",
          "Gap behavior is diagnostic."
        ]
      },

      {
        id: "lc-generalization-gap",
        title: "The Generalization Gap",
        explanation: [
          "The generalization gap is the difference between training and validation performance.",
          "A large persistent gap often indicates that the estimator fits its training observations substantially better than unseen observations.",
          "A small gap is not automatically good because both scores could be poor.",
          "Gap size must therefore be interpreted together with the absolute performance level."
        ],
        intuition: [
          "A small gap between two bad scores is still bad."
        ],
        importantPoints: [
          "Large gap can indicate variance.",
          "Small gap does not guarantee a good model.",
          "Inspect score level and gap together."
        ]
      },

      {
        id: "lc-healthy-pattern",
        title: "Healthy Learning-Curve Pattern",
        explanation: [
          "A healthy learning curve generally shows strong validation performance with a manageable training-validation gap.",
          "As training size increases, validation performance often improves and the gap can narrow.",
          "Eventually both curves may begin to stabilize.",
          "The exact shape depends on the estimator, metric, noise level and dataset.",
          "There is no single perfect visual shape that applies to every machine-learning problem."
        ],
        intuition: [
          "The model should learn useful structure from additional data and transfer that learning to unseen observations."
        ],
        importantPoints: [
          "Strong validation performance matters.",
          "Reasonable generalization gap.",
          "Look for stabilization.",
          "Interpret relative to the task."
        ]
      },

      {
        id: "lc-high-bias-deep",
        title: "High Bias / Underfitting in Depth",
        explanation: [
          "High bias occurs when the model or representation is too limited to capture important structure in the data.",
          "Training performance itself remains unsatisfactory.",
          "Validation performance is also poor and may be relatively close to training performance.",
          "Because the model cannot adequately fit the available training observations, simply collecting much more data may provide limited improvement.",
          "The better intervention may involve richer features, reduced regularization or a more suitable model family."
        ],
        intuition: [
          "The student is performing badly even on the material already studied, so giving the same student more books may not solve the fundamental learning limitation."
        ],
        importantPoints: [
          "Poor training performance is central.",
          "Validation is also poor.",
          "More data alone may not fix high bias."
        ]
      },

      {
        id: "lc-high-bias-solutions",
        title: "What to Try When Learning Curves Show High Bias",
        explanation: [
          "Consider whether important predictive features are missing.",
          "Consider a model with greater appropriate capacity.",
          "If regularization is excessively strong, reducing it may allow the model to fit useful structure.",
          "Inspect preprocessing and target construction for information loss.",
          "Verify that the selected metric and task formulation are appropriate.",
          "Do not automatically increase complexity without validating the new model."
        ],
        intuition: [
          "If the model cannot learn the training data sufficiently, improve what it can learn or how it represents the problem."
        ],
        importantPoints: [
          "Improve features.",
          "Consider appropriate additional capacity.",
          "Review regularization.",
          "Check the complete pipeline."
        ]
      },

      {
        id: "lc-high-variance-deep",
        title: "High Variance / Overfitting in Depth",
        explanation: [
          "High variance commonly appears when training performance is strong but validation performance is substantially weaker.",
          "The estimator has learned patterns that transfer poorly to unseen observations.",
          "A persistent training-validation gap is an important signal.",
          "As training size increases, the gap may narrow if additional representative data stabilizes the estimator.",
          "Regularization, reduced effective complexity and better feature design may also improve generalization."
        ],
        intuition: [
          "The model remembers its practice questions extremely well but struggles when the wording changes."
        ],
        importantPoints: [
          "Strong training score.",
          "Weaker validation score.",
          "Persistent gap suggests variance.",
          "More representative data may help."
        ]
      },

      {
        id: "lc-high-variance-solutions",
        title: "What to Try When Learning Curves Show High Variance",
        explanation: [
          "Collect additional representative training data when feasible.",
          "Increase appropriate regularization.",
          "Reduce unnecessary model complexity.",
          "Remove unstable or noisy features when justified.",
          "Use model-specific variance-control mechanisms.",
          "Check whether the apparent gap is caused by leakage, distribution mismatch or an inappropriate validation design before changing the model."
        ],
        intuition: [
          "Reduce the model's ability to memorize accidental details or expose it to enough representative examples that those details become less influential."
        ],
        importantPoints: [
          "More data can help.",
          "Regularization can help.",
          "Complexity reduction can help.",
          "Validate the diagnosis first."
        ]
      },

      {
        id: "lc-bias-variance-comparison",
        title: "High Bias vs High Variance",
        explanation: [
          "High bias is characterized primarily by inadequate training performance.",
          "High variance is characterized by a substantial difference between training and validation performance.",
          "A model can exhibit elements of both problems.",
          "Learning curves help distinguish whether effort should focus on increasing learnable structure, improving generalization or collecting additional data."
        ],
        intuition: [
          "Bias means the model cannot learn enough; variance means it learns the training data much better than it generalizes."
        ],
        importantPoints: [
          "Bias: training performance poor.",
          "Variance: training-validation gap large.",
          "Diagnosis determines the next intervention."
        ]
      },

      {
        id: "lc-more-data-deep",
        title: "When More Data Is Likely to Help",
        explanation: [
          "Additional data is promising when validation performance continues improving as training size increases.",
          "A remaining training-validation gap can indicate that more representative examples may reduce variance.",
          "The new observations should represent the same population the deployed model will encounter.",
          "Simply duplicating existing observations does not provide the same information as collecting genuinely informative examples."
        ],
        intuition: [
          "More data helps when the curve still shows the model learning useful generalizable information from additional examples."
        ],
        importantPoints: [
          "Validation curve still improving.",
          "Representative new data matters.",
          "More rows are useful only when they add information."
        ]
      },

      {
        id: "lc-more-data-not-help",
        title: "When More Data May Not Help Much",
        explanation: [
          "If training and validation performance have converged at an unsatisfactory level, model bias may be the main limitation.",
          "If validation performance has clearly plateaued, additional observations from the same distribution may provide diminishing returns.",
          "Missing predictive features cannot necessarily be repaired by simply collecting more rows with the same weak variables.",
          "Label noise or incorrect problem formulation can also limit performance regardless of dataset size."
        ],
        intuition: [
          "More examples of insufficient information remain insufficient information."
        ],
        importantPoints: [
          "Poor converged curves suggest bias.",
          "Plateaus indicate diminishing returns.",
          "Feature and label quality still matter."
        ]
      },

      {
        id: "lc-plateau",
        title: "Understanding Learning-Curve Plateaus",
        explanation: [
          "A plateau occurs when additional training examples produce little further change in performance.",
          "A high validation plateau may indicate that the current workflow is already performing strongly.",
          "A low plateau can indicate model bias, insufficient features, irreducible noise or another limitation.",
          "The cause cannot be determined from the plateau alone.",
          "Training performance, validation performance and domain context must be examined together."
        ],
        intuition: [
          "The curve has stopped moving, but you still need to determine whether it stopped because the model succeeded or because it reached a limitation."
        ],
        importantPoints: [
          "Plateau does not automatically mean failure.",
          "Inspect plateau level.",
          "Diagnose the limiting factor."
        ]
      },

      {
        id: "lc-data-quality",
        title: "Data Quality and Learning Curves",
        explanation: [
          "Learning curves assume that additional observations provide useful information.",
          "Poor labels, duplicated records, corrupted features or severe measurement noise can distort curve behavior.",
          "A larger low-quality dataset is not automatically better than a smaller reliable dataset.",
          "Unexpected curve shapes should therefore trigger inspection of data quality as well as model behavior."
        ],
        intuition: [
          "Giving the model more incorrect textbooks does not necessarily improve learning."
        ],
        importantPoints: [
          "Quantity and quality differ.",
          "Inspect labels and duplicates.",
          "Noise can limit achievable performance."
        ]
      },

      {
        id: "lc-representative-data",
        title: "Representative Data Matters More Than Raw Quantity",
        explanation: [
          "New training observations are most useful when they represent the conditions the model will encounter after deployment.",
          "Adding large amounts of data from an already overrepresented subgroup may provide less benefit than collecting examples from weakly represented regions.",
          "Learning curves describe quantity effects within the available distribution but do not guarantee robustness to future distribution shift."
        ],
        intuition: [
          "Ten thousand more examples of what the model already understands may help less than a smaller number of examples from situations it currently fails on."
        ],
        importantPoints: [
          "Representation matters.",
          "Coverage matters.",
          "Learning curves do not eliminate distribution shift."
        ]
      },

      {
        id: "lc-noise-floor",
        title: "Noise and the Performance Ceiling",
        explanation: [
          "Some prediction problems contain irreducible uncertainty.",
          "Measurement noise, ambiguous labels or genuinely unpredictable outcomes can prevent validation performance from becoming perfect.",
          "Learning curves may approach a stable ceiling even as more data is added.",
          "A performance plateau should therefore be interpreted relative to the achievable signal in the problem."
        ],
        intuition: [
          "No amount of studying can perfectly predict information that is genuinely random or incorrectly recorded."
        ],
        importantPoints: [
          "Perfect performance may be impossible.",
          "Noise creates practical limits.",
          "Interpret plateaus using domain knowledge."
        ]
      },

      {
        id: "lc-model-complexity",
        title: "Model Complexity and Learning Curves",
        explanation: [
          "Model complexity influences the relationship between training and validation performance.",
          "A model with insufficient effective capacity may show high bias.",
          "A highly flexible model may achieve excellent training performance while producing a larger validation gap.",
          "The correct complexity is the one that captures useful structure while generalizing well.",
          "Learning curves help diagnose complexity but do not directly identify the exact best hyperparameter values."
        ],
        intuition: [
          "Too simple cannot learn the pattern; too flexible may learn the pattern plus accidental noise."
        ],
        importantPoints: [
          "Complexity influences bias and variance.",
          "Learning curves diagnose behavior.",
          "Hyperparameter tuning selects specific settings."
        ]
      },

      {
        id: "lc-regularization",
        title: "Regularization and Learning Curves",
        explanation: [
          "Regularization limits effective model flexibility.",
          "Stronger regularization can reduce variance but may increase bias.",
          "If a model strongly overfits, appropriate regularization may reduce the training-validation gap.",
          "If regularization becomes excessive, both training and validation performance can deteriorate.",
          "The exact regularization parameter depends on the estimator being used."
        ],
        intuition: [
          "Regularization prevents the model from fitting every detail, but too much restraint prevents it from learning important structure."
        ],
        importantPoints: [
          "Regularization controls effective capacity.",
          "Can trade variance for bias.",
          "Parameters remain model-specific."
        ]
      },

      {
        id: "lc-feature-engineering",
        title: "Feature Engineering and Learning Curves",
        explanation: [
          "A poor representation can create high bias even when the underlying model is capable.",
          "Adding informative features can improve both training and validation performance.",
          "Adding noisy or unstable features can increase variance.",
          "Feature engineering decisions should therefore be evaluated using leakage-safe validation."
        ],
        intuition: [
          "Sometimes the learner is capable, but the information provided to it does not describe the problem well enough."
        ],
        importantPoints: [
          "Features affect bias and variance.",
          "More features are not automatically better.",
          "Validate feature changes."
        ]
      },

      {
        id: "lc-metric-direction",
        title: "Metric Direction in Learning Curves",
        explanation: [
          "Learning curves can be constructed using many sklearn scorers.",
          "Some scorers are naturally interpreted as larger-is-better quantities.",
          "Loss-based sklearn scorers may be represented using negative values so that larger scorer values still correspond to better performance.",
          "Curve interpretation must therefore account for the selected scoring convention.",
          "A curve moving upward is only meaningful after understanding what the scorer represents."
        ],
        intuition: [
          "Before deciding whether the curve improved, understand which direction means better performance."
        ],
        importantPoints: [
          "Know the scoring metric.",
          "Some losses are negated by sklearn.",
          "Do not interpret curve direction blindly."
        ]
      },

      {
        id: "lc-classification-regression",
        title: "Learning Curves for Classification and Regression",
        explanation: [
          "Learning curves are not limited to classification.",
          "Classification curves can use metrics such as accuracy, F1, ROC-AUC or other appropriate scorers.",
          "Regression curves can use R² or error-based scorers.",
          "The diagnostic principle remains the same: compare training and validation behavior as training size changes.",
          "The selected metric should match the real modeling objective."
        ],
        intuition: [
          "The curve framework stays the same even when the definition of good performance changes."
        ],
        importantPoints: [
          "Works for classification.",
          "Works for regression.",
          "Metric choice remains task-specific."
        ]
      },

      {
        id: "lc-cross-validation-role",
        title: "Why Cross-Validation Is Used Inside Learning Curves",
        explanation: [
          "One training-validation split could produce a misleading curve because the result may depend on one fortunate or unfortunate partition.",
          "Cross-validation evaluates each requested training size across several partitions.",
          "This produces multiple training and validation scores for each size.",
          "Their mean and variability provide a more informative view of learning behavior."
        ],
        intuition: [
          "Do not judge how learning changes from only one sequence of practice exams."
        ],
        importantPoints: [
          "CV improves robustness.",
          "Each size receives multiple scores.",
          "Inspect variability as well as mean."
        ]
      },

      {
        id: "lc-fold-variability",
        title: "Variability Around Learning Curves",
        explanation: [
          "Mean training and validation scores hide fold-to-fold variability.",
          "Standard deviation or another uncertainty summary can be displayed around each curve.",
          "Large variability can indicate sensitivity to the particular observations used for training and validation.",
          "This can occur with small datasets, heterogeneous populations, rare classes or unstable models."
        ],
        intuition: [
          "A thick uncertainty band means the model's apparent performance changes considerably depending on which data it receives."
        ],
        importantPoints: [
          "Do not plot means alone when variability matters.",
          "Large spread deserves investigation.",
          "Small datasets can create unstable curves."
        ]
      },

      {
        id: "lc-confidence-caution",
        title: "Learning-Curve Error Bands Are Not Automatically Confidence Intervals",
        explanation: [
          "Plotting mean plus or minus one standard deviation across folds is a useful variability visualization.",
          "It should not automatically be described as a formal confidence interval.",
          "Cross-validation fold scores are not fully independent because training sets overlap.",
          "Statistical uncertainty claims require an appropriate method and assumptions."
        ],
        intuition: [
          "A shaded region can show variability without proving a precise probability statement about the true performance."
        ],
        importantPoints: [
          "Standard deviation is descriptive.",
          "CV folds overlap.",
          "Avoid unsupported confidence claims."
        ]
      },

      {
        id: "lc-learning-curve-api",
        title: "sklearn learning_curve()",
        explanation: [
          "sklearn.model_selection.learning_curve evaluates an estimator across several training-set sizes.",
          "It returns the actual training sizes used together with arrays of training and validation scores.",
          "Cross-validation controls how the available data is partitioned.",
          "The estimator is repeatedly cloned and fitted rather than one fitted model simply being rescored."
        ],
        intuition: [
          "learning_curve automates the repeated fit-score experiment required to build the diagnostic curves."
        ],
        importantPoints: [
          "Returns training sizes.",
          "Returns training scores.",
          "Returns validation scores.",
          "Performs repeated fitting."
        ]
      },

      {
        id: "lc-train-sizes",
        title: "learning_curve Parameter: train_sizes",
        explanation: [
          "train_sizes controls the training-set sizes evaluated by learning_curve.",
          "Values can represent relative fractions or absolute numbers according to the API's accepted format.",
          "Using several sizes reveals how performance changes as data increases.",
          "Very few sizes can hide important curve shape, while unnecessarily many sizes increase computation."
        ],
        intuition: [
          "train_sizes chooses the checkpoints at which you stop adding data and measure learning."
        ],
        importantPoints: [
          "Controls x-axis sampling.",
          "Can describe relative or absolute training sizes.",
          "More points increase computation."
        ]
      },

      {
        id: "lc-cv-parameter",
        title: "learning_curve Parameter: cv",
        explanation: [
          "cv controls the cross-validation strategy used at every requested training size.",
          "An integer can request a default splitting strategy, while explicit splitter objects provide greater control.",
          "Classification, grouped data and time-dependent data may require specialized validation strategies.",
          "The splitter should reflect how unseen data will appear in the real application."
        ],
        intuition: [
          "cv defines the exams used at every point on the learning curve."
        ],
        importantPoints: [
          "Validation-design parameter.",
          "Use appropriate splitters.",
          "Does not control model complexity."
        ]
      },

      {
        id: "lc-scoring-parameter",
        title: "learning_curve Parameter: scoring",
        explanation: [
          "scoring determines the metric used to measure training and validation performance.",
          "Different metrics can produce different curve interpretations.",
          "Accuracy may hide minority-class weakness, while another metric may expose it.",
          "Regression and classification require task-appropriate scoring choices.",
          "The scorer should match the real objective."
        ],
        intuition: [
          "The same learning process can look different depending on what you choose to grade."
        ],
        importantPoints: [
          "Metric determines curve meaning.",
          "Choose scoring from the application objective.",
          "Interpret scorer direction correctly."
        ]
      },

      {
        id: "lc-shuffle-parameter",
        title: "learning_curve Parameter: shuffle",
        explanation: [
          "shuffle controls whether training data is shuffled before taking subsets of increasing size.",
          "This can help when the existing row order would otherwise make early training subsets systematically unrepresentative.",
          "Shuffling should not be used blindly when observation order carries temporal or structural meaning.",
          "The cross-validation splitter and training-subset construction should both respect the dataset structure."
        ],
        intuition: [
          "If the first 10% of rows are unusual, a small learning-curve point can become misleading unless subset construction is appropriate."
        ],
        importantPoints: [
          "Affects training-subset construction.",
          "Useful for arbitrary row ordering.",
          "Respect time and group structure."
        ]
      },

      {
        id: "lc-random-state",
        title: "learning_curve Parameter: random_state",
        explanation: [
          "random_state controls reproducibility of applicable randomized behavior when learning_curve shuffling is enabled.",
          "It allows the same shuffled training subsets to be reproduced.",
          "It is an experimental reproducibility control rather than a model-quality parameter.",
          "Do not repeatedly search random seeds to obtain a visually favorable curve."
        ],
        intuition: [
          "Fix the random subset ordering so the experiment can be repeated."
        ],
        importantPoints: [
          "Reproducibility control.",
          "Relevant with applicable shuffling.",
          "Do not optimize the seed."
        ]
      },

      {
        id: "lc-n-jobs",
        title: "learning_curve Parameter: n_jobs",
        explanation: [
          "n_jobs controls supported parallel execution of learning-curve fits.",
          "Learning curves can require many independent estimator fits because several training sizes and CV folds are evaluated.",
          "Parallelism can reduce elapsed time.",
          "It can also increase CPU and memory pressure, especially when the estimator itself is parallel."
        ],
        intuition: [
          "Several training-size experiments can run simultaneously when hardware permits."
        ],
        importantPoints: [
          "Computational parameter.",
          "Can reduce runtime.",
          "Watch memory and nested parallelism."
        ]
      },

      {
        id: "lc-return-times",
        title: "return_times and Scalability Analysis",
        explanation: [
          "learning_curve can optionally return fit-time and score-time information in supported sklearn versions.",
          "Fit time across increasing training sizes provides useful information about computational scalability.",
          "A model may have attractive predictive performance but become too expensive as dataset size grows.",
          "Runtime should therefore be considered alongside statistical performance for production systems."
        ],
        intuition: [
          "A learning curve can reveal not only whether the model learns better with more data, but also how expensive that learning becomes."
        ],
        importantPoints: [
          "Fit time measures training cost.",
          "Score time measures evaluation or prediction-related cost.",
          "Scalability matters in deployment."
        ]
      },

      {
        id: "lc-fit-time-curve",
        title: "Fit-Time Curve",
        explanation: [
          "Fit time can be plotted against training-set size.",
          "The resulting curve shows how training cost grows as more observations are used.",
          "Different algorithms can have very different scalability patterns.",
          "This can influence model selection when retraining must occur frequently or compute resources are limited."
        ],
        intuition: [
          "Two models with similar accuracy may differ dramatically in how quickly training cost grows."
        ],
        importantPoints: [
          "Training cost depends on dataset size.",
          "Useful for scalability decisions.",
          "Performance is not the only selection criterion."
        ]
      },

      {
        id: "lc-score-time",
        title: "Score-Time Analysis",
        explanation: [
          "Score-time measurements provide information about the computational cost of evaluating the estimator.",
          "Depending on the estimator and scoring metric, this can reflect prediction and metric-computation work.",
          "For latency-sensitive applications, prediction-related cost may be as important as training cost.",
          "Timing results should be measured under representative hardware and workload conditions."
        ],
        intuition: [
          "A model that trains once but predicts millions of times may need prediction efficiency more than training efficiency."
        ],
        importantPoints: [
          "Evaluation cost can matter.",
          "Deployment workload determines importance.",
          "Benchmark under representative conditions."
        ]
      },

      {
        id: "lc-exploit-incremental-learning",
        title: "Incremental Learning and exploit_incremental_learning",
        explanation: [
          "Some estimators support incremental fitting through partial_fit.",
          "learning_curve can optionally exploit incremental learning for compatible estimators.",
          "This can avoid completely retraining from scratch for every larger training subset.",
          "The option applies only when the estimator supports the required incremental-learning behavior.",
          "It is a computational optimization rather than a change to the conceptual purpose of the learning curve."
        ],
        intuition: [
          "Instead of restarting the student's education from zero whenever more examples are added, continue training from what was already learned when the estimator supports it."
        ],
        importantPoints: [
          "Requires compatible incremental estimator.",
          "Can improve computational efficiency.",
          "Does not apply to every model."
        ]
      },

      {
        id: "lc-groups",
        title: "Groups and Structured Validation",
        explanation: [
          "When observations belong to related groups, learning-curve validation must respect those groups.",
          "The CV splitter should prevent inappropriate overlap between related training and validation observations.",
          "Group information must be supplied through the validation workflow according to the sklearn API being used.",
          "Otherwise learning curves can appear artificially strong because of group leakage."
        ],
        intuition: [
          "A learning curve is only trustworthy if every point uses a trustworthy validation strategy."
        ],
        importantPoints: [
          "Respect groups.",
          "Prevent entity leakage.",
          "Validation design still applies at every training size."
        ]
      },

      {
        id: "lc-time-series-caution",
        title: "Learning Curves for Time-Dependent Data",
        explanation: [
          "Ordinary randomized learning-curve construction can be inappropriate for time-dependent prediction.",
          "Training observations should precede the validation observations when the deployment problem predicts the future from the past.",
          "Training-size increases should preserve chronological meaning.",
          "The exact design may require a custom time-aware validation workflow rather than blindly applying ordinary shuffled learning curves."
        ],
        intuition: [
          "When studying forecasting, increasing the training set should mean giving the model more history, not giving it random pieces of the future."
        ],
        importantPoints: [
          "Preserve chronology.",
          "Avoid future leakage.",
          "Use time-aware validation."
        ]
      },

      {
        id: "lc-pipeline",
        title: "Learning Curves with Pipelines",
        explanation: [
          "Learned preprocessing should remain inside a Pipeline when generating learning curves.",
          "For each fold and training size, preprocessing is then fitted only on the corresponding training observations.",
          "Scaling, imputation, feature selection and other learned transformations can otherwise leak validation information.",
          "The complete preprocessing-plus-model workflow should be evaluated together."
        ],
        intuition: [
          "At every point on the curve, both the preprocessing and the model must learn only from the data available at that point."
        ],
        importantPoints: [
          "Use leakage-safe Pipeline.",
          "Refit preprocessing at every experiment.",
          "Evaluate the complete workflow."
        ]
      },

      {
        id: "lc-small-dataset",
        title: "Learning Curves with Small Datasets",
        explanation: [
          "Learning curves from very small datasets can be noisy.",
          "The smallest training subsets may contain too few observations or too few examples of rare classes for reliable fitting.",
          "Cross-validation variability can therefore be large.",
          "Interpret small-data curves cautiously and inspect uncertainty across folds."
        ],
        intuition: [
          "It is difficult to infer a smooth learning pattern when every training-size change adds only a handful of examples."
        ],
        importantPoints: [
          "Small curves can be unstable.",
          "Rare classes create additional difficulty.",
          "Inspect fold variability."
        ]
      },

      {
        id: "lc-large-dataset",
        title: "Learning Curves with Large Datasets",
        explanation: [
          "Full learning curves can be computationally expensive on very large datasets.",
          "A carefully selected set of training sizes can provide sufficient diagnostic information without evaluating dozens of points.",
          "The largest training sizes are often the most expensive.",
          "Parallelism, incremental estimators and representative subsampling can sometimes reduce experimental cost when used correctly."
        ],
        intuition: [
          "You do not need to measure performance after every additional row to understand the overall learning trend."
        ],
        importantPoints: [
          "Choose informative train sizes.",
          "Avoid unnecessary points.",
          "Consider computational budget."
        ]
      },

      {
        id: "lc-training-score-falls",
        title: "Why Training Performance Can Decrease with More Data",
        explanation: [
          "A model can fit a very small training subset extremely well because there are few examples to satisfy.",
          "As additional and more diverse observations are added, perfectly fitting every example becomes harder.",
          "Training performance may therefore decrease toward a more realistic level.",
          "This behavior can be normal and should be interpreted together with validation improvement."
        ],
        intuition: [
          "It is easier to memorize ten questions perfectly than ten thousand diverse questions."
        ],
        importantPoints: [
          "Training score can decrease as data grows.",
          "This is not automatically a problem.",
          "Inspect validation behavior."
        ]
      },

      {
        id: "lc-validation-score-rises",
        title: "Why Validation Performance Can Improve with More Data",
        explanation: [
          "With very little training data, the fitted model can depend strongly on accidental patterns in the small sample.",
          "As more representative observations are added, parameter estimates and learned structure can become more stable.",
          "Validation performance can therefore improve.",
          "Eventually improvements may diminish as the workflow approaches its practical performance ceiling."
        ],
        intuition: [
          "More representative experience helps the model distinguish real patterns from accidents in a tiny sample."
        ],
        importantPoints: [
          "More data can stabilize learning.",
          "Validation can rise with sample size.",
          "Improvement may eventually plateau."
        ]
      },

      {
        id: "lc-nonmonotonic-curves",
        title: "Why Learning Curves Are Not Always Smooth",
        explanation: [
          "Real learning curves can fluctuate rather than changing monotonically.",
          "Different training subsets contain different observations.",
          "Cross-validation variability, optimization randomness, rare classes and noisy labels can create local rises and falls.",
          "The overall trend is usually more important than expecting every successive point to improve."
        ],
        intuition: [
          "Learning from real data is noisy; adding one batch of difficult examples can temporarily make the score look worse."
        ],
        importantPoints: [
          "Curves need not be monotonic.",
          "Inspect trends rather than individual wiggles.",
          "Use variability information."
        ]
      },

      {
        id: "lc-data-order",
        title: "Training-Subset Order Can Matter",
        explanation: [
          "Learning-curve points use subsets of the available training data.",
          "If rows are ordered by class, time, source or another systematic factor, early subsets can be unrepresentative.",
          "Appropriate shuffling can help for ordinary independent data.",
          "For structured data such as time series, however, the ordering may be meaningful and must be preserved."
        ],
        intuition: [
          "If the first part of the dataset contains only one type of example, the smallest training-size points do not represent the real task."
        ],
        importantPoints: [
          "Inspect row ordering.",
          "Shuffle only when appropriate.",
          "Respect structured data."
        ]
      },

      {
        id: "lc-distribution-shift",
        title: "Learning Curves Do Not Diagnose Every Distribution Shift",
        explanation: [
          "Traditional learning curves usually evaluate subsets drawn from the currently available dataset.",
          "They can show how performance changes with more data from that distribution.",
          "They do not automatically reveal how the model will behave if deployment data follows a substantially different distribution.",
          "Temporal holdouts, geographic holdouts or other domain-specific validation designs may be required."
        ],
        intuition: [
          "Learning more examples from today's world does not automatically prove the model will work in a different future world."
        ],
        importantPoints: [
          "Learning curves study sample-size effects.",
          "Distribution shift requires appropriate validation.",
          "Deployment context matters."
        ]
      },

      {
        id: "lc-data-collection-decision",
        title: "Using Learning Curves for Data-Collection Decisions",
        explanation: [
          "Learning curves can help estimate whether collecting additional labeled observations is likely to provide value.",
          "If validation performance is still improving meaningfully near the largest available training size, additional representative data may be worthwhile.",
          "If performance has clearly plateaued, investment may be better directed toward features, labels, model design or problem formulation.",
          "The cost of acquiring data should be compared with the expected performance benefit."
        ],
        intuition: [
          "Use the curve to decide whether the next engineering dollar should buy more data or improve something else."
        ],
        importantPoints: [
          "Connect curves to resource allocation.",
          "More data has acquisition cost.",
          "Plateaus can redirect engineering effort."
        ]
      },

      {
        id: "lc-model-comparison",
        title: "Comparing Models with Learning Curves",
        explanation: [
          "Two models with similar current validation scores can have very different learning trajectories.",
          "One model may already have plateaued while another is still improving as data increases.",
          "A more complex model may perform worse with small data but become stronger with larger datasets.",
          "Learning curves therefore provide information that a single cross-validation score cannot."
        ],
        intuition: [
          "Do not compare only where two models are today; inspect how their performance changes as data grows."
        ],
        importantPoints: [
          "Trajectory matters.",
          "Models can scale differently with data.",
          "One score hides sample-size behavior."
        ]
      },

      {
        id: "lc-vs-validation-curve",
        title: "Learning Curve vs Validation Curve",
        explanation: [
          "A learning curve varies the amount of training data while keeping the modeling setup otherwise conceptually fixed.",
          "A validation curve varies a model hyperparameter while studying training and validation performance.",
          "Learning curves diagnose how performance changes with data quantity.",
          "Validation curves diagnose how performance changes with a selected hyperparameter.",
          "The two tools answer different diagnostic questions."
        ],
        intuition: [
          "Learning curve: what happens when I add data? Validation curve: what happens when I change a model setting?"
        ],
        importantPoints: [
          "Learning curve varies data size.",
          "Validation curve varies a hyperparameter.",
          "Do not confuse the two."
        ]
      },

      {
        id: "lc-vs-training-history",
        title: "Learning Curve vs Training-Loss History",
        explanation: [
          "In some contexts, the phrase learning curve is also informally used for training and validation loss across optimization epochs.",
          "sklearn's learning_curve utility instead studies performance across different training-set sizes.",
          "These are different diagnostics.",
          "Epoch-based curves diagnose optimization and training progression, while sample-size learning curves diagnose data quantity and generalization behavior."
        ],
        intuition: [
          "One asks what happens as training continues; the other asks what happens as the dataset grows."
        ],
        importantPoints: [
          "Epoch curves and sample-size curves differ.",
          "Know which x-axis is being used.",
          "Interpret diagnostics accordingly."
        ]
      },

      {
        id: "lc-failure-diagnosis",
        title: "Learning-Curve Failure Diagnosis",
        explanation: [
          "If both curves are low, investigate bias, weak features, excessive regularization or task formulation.",
          "If the gap remains large, investigate variance, insufficient representative data and excessive effective complexity.",
          "If fold variability is very large, inspect sample size, class distribution, groups and heterogeneous populations.",
          "If scores are suspiciously high, investigate leakage.",
          "If curves behave strangely only at small sizes, inspect class representation and training-subset construction."
        ],
        intuition: [
          "The curve shape is a symptom; use it to determine which part of the machine-learning system should be investigated next."
        ],
        importantPoints: [
          "Low-low: investigate bias.",
          "Large gap: investigate variance.",
          "Large spread: investigate instability.",
          "Unrealistic scores: investigate leakage."
        ]
      },

      {
        id: "lc-complete-workflow",
        title: "Complete Learning-Curve Diagnostic Workflow",
        explanation: [
          "Choose a meaningful evaluation metric.",
          "Choose a validation strategy that matches the data structure.",
          "Place learned preprocessing inside a Pipeline.",
          "Select informative training sizes.",
          "Generate training and validation scores across folds.",
          "Plot mean performance and useful variability summaries.",
          "Inspect absolute score level, gap, slope and plateau.",
          "Diagnose bias, variance and data scarcity.",
          "Choose the next intervention based on that diagnosis."
        ],
        intuition: [
          "A learning curve should end with an engineering decision, not just a graph."
        ],
        importantPoints: [
          "Metric.",
          "Validation.",
          "Pipeline.",
          "Training sizes.",
          "Gap.",
          "Slope.",
          "Plateau.",
          "Action."
        ]
      },

      {
        id: "lc-exam-patterns",
        title: "Learning-Curve Patterns to Recognize in Exams",
        explanation: [
          "Low training score plus low validation score commonly indicates high bias or underfitting.",
          "High training score plus much lower validation score commonly indicates high variance or overfitting.",
          "A validation curve still improving at the largest training size suggests more representative data may help.",
          "Training and validation curves converging at a poor level suggests that more data alone may provide limited benefit.",
          "A narrowing generalization gap as data increases can indicate improving generalization."
        ],
        intuition: [
          "Learn the reasoning behind the patterns instead of memorizing graph shapes without interpretation."
        ],
        importantPoints: [
          "Low-low: bias.",
          "Large gap: variance.",
          "Validation still rising: more data may help.",
          "Poor plateau: investigate model or features."
        ]
      },

      {
        id: "lc-exam-interview",
        title: "Learning Curves: Exam and Interview Essentials",
        explanation: [
          "Define a learning curve.",
          "Explain its x-axis and y-axis.",
          "Differentiate training and validation curves.",
          "Explain high-bias and high-variance patterns.",
          "Explain the generalization gap.",
          "Explain when more data is likely to help.",
          "Explain why more data does not always fix underfitting.",
          "Explain how regularization changes bias and variance.",
          "Explain why cross-validation is used.",
          "Explain train_sizes, cv, scoring, shuffle, random_state and n_jobs.",
          "Explain fit-time scalability.",
          "Differentiate learning curves and validation curves.",
          "Differentiate sample-size curves and epoch-based training histories."
        ],
        intuition: [
          "A strong answer connects the graph shape to a concrete next action for improving the machine-learning workflow."
        ],
        importantPoints: [
          "Bias.",
          "Variance.",
          "Data quantity.",
          "Generalization gap.",
          "Plateau.",
          "sklearn API.",
          "Diagnostic action."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "learning-curve-diagnostic-lab",
      title: "Learning Curve Diagnostic Lab",
      description:
        "Manipulate model complexity, noise and dataset size to observe underfitting, overfitting and healthy learning-curve patterns."
    },

    codeExamples: [
      {
        id: "learning-curve-code",
        title: "Generate a Learning Curve",
        description:
          "Measure training and validation performance across dataset sizes.",
        language: "python",
        code: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import learning_curve
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)

model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "classifier",
        LogisticRegression(max_iter=2000)
    )
])

train_sizes, train_scores, validation_scores = learning_curve(
    model,
    X,
    y,
    cv=5,
    scoring="accuracy",
    train_sizes=np.linspace(
        0.1,
        1.0,
        8
    ),
    n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
validation_mean = validation_scores.mean(axis=1)

for size, train_score, validation_score in zip(
    train_sizes,
    train_mean,
    validation_mean
):
    print(
        size,
        train_score,
        validation_score
    )`,
        explanation: [
          "The estimator is evaluated at multiple training sizes.",
          "Each size uses cross-validation.",
          "Comparing training and validation scores helps diagnose model behavior."
        ],
        commonMistakes: [
          "Interpreting one point instead of the curve.",
          "Ignoring metric direction.",
          "Assuming more data always fixes underfitting."
        ]
      }
    ],

    practice: [
      {
        id: "lc-practice-1",
        title: "Large Gap",
        type: "analysis",
        difficulty: "medium",
        question:
          "Training accuracy is 99% while validation accuracy is 78%. What problem might this suggest?",
        instructions: ["Compare training and validation."],
        hints: ["The model performs much better on seen data."],
        explanation:
          "It can indicate high variance or overfitting."
      },
      {
        id: "lc-practice-2",
        title: "Both Low",
        type: "analysis",
        difficulty: "medium",
        question:
          "Training and validation performance are both poor and close together. What does this commonly suggest?",
        instructions: ["Think bias."],
        hints: ["The model cannot even fit training data well."],
        explanation:
          "It commonly suggests underfitting or high bias."
      },
      {
        id: "lc-practice-3",
        title: "More Data",
        type: "analysis",
        difficulty: "advanced",
        question:
          "When does a learning curve suggest that collecting more data may be useful?",
        instructions: ["Observe validation performance as sample size grows."],
        hints: ["It is still improving and a generalization gap remains."],
        explanation:
          "If validation performance continues improving with additional training examples, more representative data may provide further benefit."
      }
    ],

    keyTakeaways: [
      "Learning curves compare training and validation behavior across dataset sizes.",
      "Both curves poor can indicate high bias.",
      "A large generalization gap can indicate high variance.",
      "Learning curves help decide whether more data may help.",
      "They are valuable debugging tools."
    ]
  },

  // =========================================================
  // 5. MODEL SELECTION
  // =========================================================
  "model-selection": {
    overview:
      "Model selection is the disciplined process of comparing candidate machine-learning workflows using consistent validation, metrics, preprocessing and experimental conditions. The goal is not simply to choose the most complicated model, but to identify a model that satisfies predictive, operational and interpretability requirements without contaminating the final test evaluation.",

    objectives: [
      "Build strong baselines.",
      "Compare candidate models fairly.",
      "Use consistent cross-validation.",
      "Use suitable evaluation metrics.",
      "Understand nested model-selection concerns.",
      "Consider complexity, latency and interpretability.",
      "Preserve an untouched test set.",
      "Avoid leaderboard-style overfitting."
    ],

    sections: [
      {
        id: "selection-baseline",
        title: "Start with a Baseline",
        explanation: [
          "A baseline provides a reference level of performance.",
          "Classification baselines can include majority-class or simple linear models.",
          "Regression baselines can include predicting the target mean or median.",
          "Complex models should demonstrate meaningful improvement over appropriate baselines."
        ],
        intuition: [
          "You cannot know whether a sophisticated model is useful without knowing what a simple approach achieves."
        ],
        importantPoints: [
          "Always establish a baseline.",
          "A baseline can reveal surprisingly easy or difficult problems."
        ]
      },

      {
        id: "selection-fair",
        title: "Fair Comparison",
        explanation: [
          "Candidate models should be evaluated using the same folds and metric when possible.",
          "Preprocessing appropriate to each model should be encapsulated in its workflow.",
          "Comparing scores from different splits can create misleading conclusions."
        ],
        intuition: [
          "Models should take the same exam before their scores are compared."
        ],
        importantPoints: [
          "Use consistent data splits.",
          "Use consistent metrics.",
          "Compare complete workflows."
        ]
      },

      {
        id: "selection-not-score",
        title: "Performance Is Not the Only Constraint",
        explanation: [
          "Production models may also need low latency, low memory use, explainability, robustness or simple maintenance.",
          "A tiny metric improvement may not justify a large increase in operational complexity."
        ],
        intuition: [
          "The highest validation score is not useful if the system cannot meet the application's requirements."
        ],
        importantPoints: [
          "Consider operational constraints.",
          "Consider interpretability requirements.",
          "Measure complexity against actual benefit."
        ]
      },

      {
        id: "selection-test",
        title: "Final Test Evaluation",
        explanation: [
          "The test set should be used after model selection and tuning decisions are complete.",
          "Repeatedly checking test performance during development turns the test set into another validation set.",
          "This can produce an optimistically biased final estimate."
        ],
        intuition: [
          "The final exam cannot remain a final exam if you repeatedly see its answers while studying."
        ],
        importantPoints: [
          "Preserve test independence.",
          "Do not tune against test results.",
          "Report final performance only after selection."
        ]
      },
            {
        id: "selection-vs-evaluation",
        title: "Model Selection vs Model Evaluation",
        explanation: [
          "Model selection chooses between candidate workflows using development data.",
          "Model evaluation estimates the performance of the already selected workflow on unseen data.",
          "Using the same data repeatedly for both purposes produces optimistic estimates.",
          "Validation data supports selection; the final test set supports final evaluation."
        ],
        intuition: [
          "Practice exams help you choose how to prepare. The final exam measures the result after those choices are finished."
        ],
        importantPoints: [
          "Selection and final evaluation are different stages.",
          "Validation supports decisions.",
          "Test data should remain independent."
        ]
      },

      {
        id: "selection-complete-workflow",
        title: "Select Complete ML Workflows",
        explanation: [
          "A candidate should include all learned preprocessing together with its estimator.",
          "Scaling, imputation, feature selection and transformations can affect model performance.",
          "Comparing only estimator objects while preprocessing differs outside validation can create unfair or leaky comparisons.",
          "Pipeline-based evaluation keeps each candidate workflow self-contained."
        ],
        intuition: [
          "Compare complete machines, not engines removed from the systems that make them work."
        ],
        importantPoints: [
          "Compare preprocessing plus model.",
          "Use leakage-safe Pipelines.",
          "Evaluate what will actually be deployed."
        ]
      },

      {
        id: "selection-candidate-families",
        title: "Choosing Candidate Model Families",
        explanation: [
          "Candidate models should represent reasonable hypotheses about the structure of the problem.",
          "Linear models provide strong simple baselines when relationships are approximately linear.",
          "Tree-based models can capture nonlinear interactions without requiring feature scaling.",
          "Distance-based and kernel methods can be useful when their assumptions and computational requirements fit the dataset.",
          "Candidate selection should be purposeful rather than testing every available algorithm."
        ],
        intuition: [
          "Model selection begins by choosing sensible competitors, not by blindly running every algorithm."
        ],
        importantPoints: [
          "Start with reasonable families.",
          "Include a strong simple baseline.",
          "Use data characteristics to guide candidates."
        ]
      },

      {
        id: "selection-metric",
        title: "Choose the Selection Metric First",
        explanation: [
          "The metric determines what model selection considers better.",
          "Accuracy may be inappropriate for severe class imbalance.",
          "Recall may be important when false negatives are costly.",
          "Precision may matter when false positives trigger expensive actions.",
          "Regression problems may require MAE, RMSE, R² or another domain-relevant objective."
        ],
        intuition: [
          "Changing the grading rule can change which model wins."
        ],
        importantPoints: [
          "Metric follows the problem objective.",
          "Do not choose metrics after seeing which model wins.",
          "Consider error costs."
        ]
      },

      {
        id: "selection-multiple-metrics",
        title: "Model Selection with Multiple Metrics",
        explanation: [
          "Real systems often have more than one important requirement.",
          "Models can be compared using several metrics while one primary metric guides final selection.",
          "Secondary metrics reveal trade-offs that a single score can hide.",
          "A model should not automatically be selected by averaging unrelated metrics without a justified decision rule."
        ],
        intuition: [
          "A student may be evaluated on accuracy, speed and consistency rather than one mark alone."
        ],
        importantPoints: [
          "Define a primary objective.",
          "Inspect secondary metrics.",
          "Understand trade-offs."
        ]
      },

      {
        id: "selection-cv-mean-std",
        title: "Mean Performance and Stability",
        explanation: [
          "Cross-validation produces multiple validation scores rather than one number.",
          "The mean summarizes average validation performance.",
          "The standard deviation describes variation across folds.",
          "A slightly higher mean may not be compelling when the estimate is highly unstable.",
          "Fold-level results should therefore be considered alongside averages."
        ],
        intuition: [
          "A model that scores consistently well can be preferable to one whose performance swings dramatically between validation sets."
        ],
        importantPoints: [
          "Inspect mean score.",
          "Inspect fold variability.",
          "Do not rank models from one split."
        ]
      },

      {
        id: "selection-same-folds",
        title: "Why the Same Folds Matter",
        explanation: [
          "Different validation folds can have different difficulty.",
          "Evaluating candidates on the same folds makes comparisons more controlled.",
          "Score differences are then less likely to be caused simply by different validation observations.",
          "The validation strategy must still match the real data structure."
        ],
        intuition: [
          "Every candidate should sit the same exam."
        ],
        importantPoints: [
          "Use consistent folds.",
          "Reduce comparison noise.",
          "Respect groups, time and stratification."
        ]
      },

      {
        id: "selection-tuning-interaction",
        title: "Model Selection and Hyperparameter Tuning",
        explanation: [
          "Comparing one default configuration of each model does not necessarily compare the best reasonable versions of those model families.",
          "Important candidates may require hyperparameter tuning.",
          "However, extensive tuning itself increases selection pressure on validation results.",
          "The tuning budget should therefore be fair and computationally justified."
        ],
        intuition: [
          "Do not compare one candidate after intensive preparation with another candidate using only its default settings."
        ],
        importantPoints: [
          "Tuning affects comparison fairness.",
          "Use reasonable search budgets.",
          "Validation is part of the selection process."
        ]
      },

      {
        id: "selection-nested-cv",
        title: "Nested Cross-Validation for Model Selection",
        explanation: [
          "When hyperparameter tuning and performance estimation use the same cross-validation results, performance can become optimistically biased.",
          "Nested cross-validation separates these roles.",
          "The inner loop performs model or hyperparameter selection.",
          "The outer loop evaluates the complete selection procedure on unseen folds.",
          "Nested CV is especially useful when data is limited and an unbiased estimate of a tuning procedure is important."
        ],
        intuition: [
          "Use one set of practice exams to choose the strategy and another outer exam to evaluate the strategy-selection process."
        ],
        importantPoints: [
          "Inner loop selects.",
          "Outer loop evaluates.",
          "Reduces selection bias."
        ]
      },

      {
        id: "selection-multiple-comparisons",
        title: "Trying Many Models Can Overfit Validation",
        explanation: [
          "Every candidate model is another opportunity to obtain a favorable validation score partly by chance.",
          "Testing hundreds of alternatives and selecting the highest score can overfit the validation process.",
          "This phenomenon is sometimes described as selection bias or multiple-comparison pressure.",
          "A final independent evaluation becomes increasingly important as experimentation grows."
        ],
        intuition: [
          "If enough people repeatedly roll dice, someone eventually gets an impressive result by luck."
        ],
        importantPoints: [
          "Validation can be overfit.",
          "More experiments increase selection pressure.",
          "Protect final evaluation."
        ]
      },

      {
        id: "selection-bias-variance",
        title: "Bias-Variance Considerations",
        explanation: [
          "A simple model may underfit because of high bias.",
          "A highly flexible model may fit training data extremely well but generalize poorly because of high variance.",
          "Model selection should therefore compare validation behavior rather than training performance.",
          "Learning curves and cross-validation can help diagnose these patterns."
        ],
        intuition: [
          "The best model is not the one that memorizes training data most successfully."
        ],
        importantPoints: [
          "Training score is insufficient.",
          "Consider generalization.",
          "Use learning-curve diagnostics when needed."
        ]
      },

      {
        id: "selection-data-characteristics",
        title: "Data Characteristics Influence Model Choice",
        explanation: [
          "Dataset size, dimensionality, sparsity, feature types, missing values and class distribution influence which models are practical.",
          "Some algorithms scale poorly with very large numbers of observations.",
          "Some models are naturally effective on sparse high-dimensional features.",
          "Others may require careful preprocessing or substantial computational resources."
        ],
        intuition: [
          "The best vehicle depends on the road."
        ],
        importantPoints: [
          "Consider rows and features.",
          "Consider sparsity and feature types.",
          "Consider computational scalability."
        ]
      },

      {
        id: "selection-interpretability",
        title: "Interpretability as a Selection Constraint",
        explanation: [
          "Some applications require predictions to be explainable to users, regulators, clinicians or engineers.",
          "A small predictive gain from a complex model may not justify losing required interpretability.",
          "Interpretability requirements should be defined before final model selection whenever possible."
        ],
        intuition: [
          "A model can be statistically strong yet unsuitable if nobody can justify the decisions it makes."
        ],
        importantPoints: [
          "Interpretability can be mandatory.",
          "Performance is not the only objective.",
          "Requirements depend on deployment context."
        ]
      },

      {
        id: "selection-computation",
        title: "Training Cost, Inference Cost and Memory",
        explanation: [
          "Training cost determines how expensive experimentation and retraining will be.",
          "Inference latency determines how quickly predictions can be produced.",
          "Throughput determines how many predictions can be processed over time.",
          "Memory requirements influence deployment hardware.",
          "These operational characteristics can eliminate otherwise accurate models."
        ],
        intuition: [
          "A model that requires one minute per prediction cannot serve an application requiring millisecond responses."
        ],
        importantPoints: [
          "Measure training cost.",
          "Measure inference latency.",
          "Consider throughput and memory."
        ]
      },

      {
        id: "selection-robustness",
        title: "Robustness and Stability",
        explanation: [
          "A selected model should behave reliably under realistic variation in inputs.",
          "Small validation-score advantages may be less valuable than robustness across folds, subgroups or expected operating conditions.",
          "Robustness testing can include subgroup analysis, perturbation tests and evaluation on meaningful external or temporal holdouts when available."
        ],
        intuition: [
          "Choose a model that works reliably, not one that wins only under one favorable test."
        ],
        importantPoints: [
          "Inspect stability.",
          "Evaluate important subgroups.",
          "Use realistic holdouts when possible."
        ]
      },

      {
        id: "selection-probability-needs",
        title: "Probability Quality Can Affect Model Selection",
        explanation: [
          "Some applications need only class rankings or labels, while others rely on predicted probabilities.",
          "When probability estimates drive risk decisions, calibration can become an important model-selection consideration.",
          "A model with excellent ranking performance may still produce poor probability estimates.",
          "Calibration should therefore be evaluated separately when probabilities matter."
        ],
        intuition: [
          "Knowing who is riskier is different from correctly estimating how risky they are."
        ],
        importantPoints: [
          "Ranking and probability quality differ.",
          "Calibration can matter.",
          "Selection criteria depend on downstream use."
        ]
      },

      {
        id: "selection-threshold",
        title: "Threshold Requirements and Model Selection",
        explanation: [
          "Binary classifiers often produce scores before a threshold converts them into decisions.",
          "Two models with similar ROC-AUC can behave differently at the operating region that matters to the application.",
          "Model comparison should therefore consider relevant threshold-dependent metrics when deployment uses a specific decision policy.",
          "Threshold selection must remain part of development rather than final test tuning."
        ],
        intuition: [
          "A model should be judged where the system will actually operate, not only by a global summary score."
        ],
        importantPoints: [
          "Consider operating thresholds.",
          "Global metrics may hide local behavior.",
          "Do not tune thresholds on test data."
        ]
      },

      {
        id: "selection-deployment",
        title: "Deployment and Maintenance Constraints",
        explanation: [
          "Production models require monitoring, versioning, retraining and debugging.",
          "Models with difficult dependencies or expensive infrastructure can increase maintenance burden.",
          "A slightly simpler model may provide better overall system value when predictive performance is similar.",
          "Selection should consider the complete lifecycle rather than only initial experimentation."
        ],
        intuition: [
          "The winning model must survive production, not merely a notebook."
        ],
        importantPoints: [
          "Consider maintenance.",
          "Consider retraining.",
          "Consider infrastructure.",
          "Optimize system value."
        ]
      },

      {
        id: "selection-complete-process",
        title: "Complete Model Selection Workflow",
        explanation: [
          "Define the prediction objective and deployment constraints.",
          "Create a meaningful baseline.",
          "Choose suitable candidate model families.",
          "Build leakage-safe preprocessing-model Pipelines.",
          "Choose metrics before comparing results.",
          "Use a validation strategy appropriate for the data.",
          "Tune important candidates fairly.",
          "Compare predictive performance, variability and operational constraints.",
          "Select the final workflow.",
          "Evaluate it once on the untouched test set."
        ],
        intuition: [
          "Model selection is a controlled engineering process, not a competition to find the largest validation score."
        ],
        importantPoints: [
          "Objective.",
          "Baseline.",
          "Candidates.",
          "Pipeline.",
          "Validation.",
          "Tuning.",
          "Operational constraints.",
          "Final test."
        ]
      },

      {
        id: "selection-exam-interview",
        title: "Model Selection: Exam and Interview Essentials",
        explanation: [
          "Explain why a baseline is necessary.",
          "Differentiate model selection and final model evaluation.",
          "Explain why candidate models should use consistent validation folds.",
          "Explain why preprocessing belongs inside Pipelines.",
          "Explain how metric choice can change the selected model.",
          "Explain the role of hyperparameter tuning.",
          "Explain nested cross-validation.",
          "Explain why trying many models can overfit validation.",
          "Explain why training accuracy should not select the final model.",
          "Explain predictive performance versus latency, memory and interpretability.",
          "Explain why the final test set must remain untouched."
        ],
        intuition: [
          "A strong answer explains both statistical fairness and real deployment constraints."
        ],
        importantPoints: [
          "Baseline.",
          "Fair validation.",
          "Metrics.",
          "Nested CV.",
          "Selection bias.",
          "Operational requirements.",
          "Test independence."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "model-selection-comparison-lab",
      title: "Model Selection Lab",
      description:
        "Compare baseline, linear, distance-based, tree and ensemble models using identical folds, multiple metrics, complexity and inference-cost indicators."
    },

    codeExamples: [
      {
        id: "model-selection-code",
        title: "Compare Candidate Pipelines",
        description:
          "Evaluate several classifiers with the same cross-validation strategy.",
        language: "python",
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)

models = {
    "logistic": Pipeline([
        ("scaler", StandardScaler()),
        (
            "model",
            LogisticRegression(max_iter=2000)
        )
    ]),

    "knn": Pipeline([
        ("scaler", StandardScaler()),
        (
            "model",
            KNeighborsClassifier(n_neighbors=7)
        )
    ]),

    "random_forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42
    )
}

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

for name, model in models.items():
    scores = cross_val_score(
        model,
        X,
        y,
        cv=cv,
        scoring="roc_auc"
    )

    print(
        name,
        scores.mean(),
        scores.std()
    )`,
        explanation: [
          "Every model uses the same folds and metric.",
          "Scale-sensitive models receive scaling inside their Pipeline.",
          "Mean and standard deviation provide performance and stability information."
        ],
        commonMistakes: [
          "Comparing models evaluated on different splits.",
          "Selecting a model from training performance.",
          "Ignoring operational requirements."
        ]
      }
    ],

    practice: [
      {
        id: "selection-practice-1",
        title: "Baseline",
        type: "concept",
        difficulty: "basic",
        question:
          "Why should a baseline model be created before testing highly complex models?",
        instructions: ["Think reference point."],
        hints: ["You need to measure improvement."],
        explanation:
          "A baseline establishes how much value the more complex approach actually adds."
      },
      {
        id: "selection-practice-2",
        title: "Fair Comparison",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why should candidate models preferably use the same cross-validation folds?",
        instructions: ["Think fairness."],
        hints: ["Different folds can have different difficulty."],
        explanation:
          "Using the same folds reduces the chance that score differences are caused by different validation samples rather than the models."
      },
      {
        id: "selection-practice-3",
        title: "Complexity",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Model A scores 0.921 and Model B scores 0.922 but B requires ten times the inference cost. What additional question should be considered before deployment?",
        instructions: ["Do not look only at score."],
        hints: ["Ask whether the improvement is operationally meaningful."],
        explanation:
          "The team should determine whether the small validated performance gain justifies the additional latency, cost, maintenance and complexity."
      }
    ],

    keyTakeaways: [
      "Start with a baseline.",
      "Compare models under consistent conditions.",
      "Select metrics based on the problem.",
      "Evaluate complete preprocessing-model workflows.",
      "Operational requirements matter.",
      "Keep the final test set untouched until selection is complete."
    ]
  },

  // =========================================================
  // 6. CALIBRATION AND THRESHOLDING
  // =========================================================
  "calibration-thresholding": {
    overview:
      "Classification models often produce scores or probabilities before converting them into class labels. Calibration asks whether predicted probabilities correspond to observed frequencies, while threshold selection determines the operating point used to turn those scores into decisions. Both are essential when prediction costs differ or probabilities drive real decisions.",

    objectives: [
      "Understand predicted probabilities.",
      "Understand decision thresholds.",
      "Understand probability calibration.",
      "Understand calibration curves.",
      "Understand Brier score.",
      "Understand precision-recall threshold trade-offs.",
      "Choose thresholds using domain costs.",
      "Avoid tuning thresholds on the final test set."
    ],

    sections: [
      {
        id: "threshold-default",
        title: "The Decision Threshold",
        explanation: [
          "Binary classifiers often convert a positive-class probability into a class prediction.",
          "A threshold of 0.5 is common but is not universally optimal.",
          "Changing the threshold changes false positives and false negatives."
        ],
        intuition: [
          "A probability model produces a risk estimate. The threshold determines when that risk becomes an action."
        ],
        importantPoints: [
          "0.5 is a convention, not a universal law.",
          "Threshold selection should reflect application objectives."
        ]
      },

      {
        id: "threshold-tradeoff",
        title: "Threshold Trade-Off",
        explanation: [
          "Lowering the positive threshold generally predicts more positives.",
          "This can increase recall but also increase false positives.",
          "Raising the threshold generally predicts fewer positives.",
          "This can improve precision in some settings but increase false negatives."
        ],
        intuition: [
          "A sensitive alarm catches more true events but may also create more false alarms."
        ],
        importantPoints: [
          "Threshold changes the confusion matrix.",
          "Threshold selection is a decision problem."
        ]
      },

      {
        id: "calibration-concept",
        title: "Probability Calibration",
        explanation: [
          "A calibrated model's probability estimates correspond reasonably to observed frequencies.",
          "Among observations predicted around 0.8, roughly 80% should be positive in an ideally calibrated setting.",
          "A model can rank observations well while still producing poorly calibrated probabilities."
        ],
        intuition: [
          "A weather system that repeatedly predicts 70% rain should see rain on roughly 70% of those occasions."
        ],
        importantPoints: [
          "Ranking and calibration are different properties.",
          "High ROC-AUC does not guarantee calibrated probabilities."
        ]
      },

      {
        id: "calibration-curve",
        title: "Calibration Curves",
        explanation: [
          "Calibration curves group predictions into probability ranges.",
          "For each range, predicted probability is compared with observed positive frequency.",
          "Large deviations from the diagonal indicate miscalibration."
        ],
        intuition: [
          "The graph checks whether predicted confidence matches reality."
        ],
        importantPoints: [
          "Calibration curves are visual diagnostics.",
          "Sample size affects curve reliability."
        ]
      },

      {
        id: "calibration-brier",
        title: "Brier Score",
        explanation: [
          "The Brier score measures squared error between predicted probabilities and binary outcomes.",
          "Lower values indicate better probability predictions under this metric.",
          "It reflects aspects of both discrimination and calibration and should be interpreted in context."
        ],
        intuition: [
          "Probabilities are treated as numerical predictions and compared with outcomes 0 and 1."
        ],
        importantPoints: [
          "Brier score evaluates probability quality.",
          "Lower is better."
        ]
      },
            {
        id: "calibration-score-probability-label",
        title: "Score → Probability → Threshold → Decision",
        explanation: [
          "Classification systems can produce several different forms of output.",
          "Some estimators produce raw decision scores.",
          "Some estimators produce probability estimates.",
          "A decision threshold converts an appropriate continuous output into a final class decision.",
          "These outputs should not be treated as interchangeable."
        ],
        intuition: [
          "The model first expresses evidence or risk. The threshold converts that evidence into an action."
        ],
        importantPoints: [
          "Scores, probabilities and labels are different.",
          "Thresholding produces decisions.",
          "Calibration concerns probability meaning."
        ]
      },

      {
        id: "calibration-discrimination",
        title: "Discrimination vs Calibration",
        explanation: [
          "Discrimination measures how effectively a model separates or ranks classes.",
          "Calibration measures whether predicted probabilities correspond to observed frequencies.",
          "A model can have excellent discrimination but poor calibration.",
          "A monotonic transformation of model scores can preserve ranking while substantially changing probability values.",
          "Therefore ROC-AUC and calibration answer different questions."
        ],
        intuition: [
          "A model can correctly know who is riskier without correctly knowing how risky each person is."
        ],
        importantPoints: [
          "Discrimination concerns ordering.",
          "Calibration concerns probability reliability.",
          "High ROC-AUC does not guarantee calibration."
        ]
      },

      {
        id: "calibration-perfect",
        title: "What Perfect Calibration Means",
        explanation: [
          "Suppose a model assigns probability approximately 0.8 to a large collection of observations.",
          "If the model is perfectly calibrated around that probability level, approximately 80% of those observations should actually belong to the positive class.",
          "The same interpretation applies across other probability levels.",
          "Calibration is therefore a population-level relationship between predictions and observed frequencies."
        ],
        intuition: [
          "When the model repeatedly says 80%, reality should produce the event roughly eight times out of ten."
        ],
        importantPoints: [
          "Calibration is frequency-based.",
          "It requires many observations for reliable assessment.",
          "Individual outcomes do not prove calibration."
        ]
      },

      {
        id: "calibration-overconfidence",
        title: "Overconfident Predictions",
        explanation: [
          "A model is overconfident when its predicted probabilities are more extreme than observed frequencies justify.",
          "For example, observations receiving probabilities around 0.9 may become positive substantially less than 90% of the time.",
          "Overconfidence can make risk-based decisions unreliable even when class ranking remains strong."
        ],
        intuition: [
          "The model sounds more certain than reality supports."
        ],
        importantPoints: [
          "Extreme probabilities can be misleading.",
          "Ranking can remain good.",
          "Probability reliability matters for decisions."
        ]
      },

      {
        id: "calibration-underconfidence",
        title: "Underconfident Predictions",
        explanation: [
          "A model is underconfident when its probabilities remain too close to the middle compared with observed event frequencies.",
          "Predictions may rank observations correctly while failing to express the true strength of risk differences.",
          "Underconfidence can reduce the usefulness of probabilities in downstream decision systems."
        ],
        intuition: [
          "The model knows which cases are safer and riskier but refuses to express enough confidence."
        ],
        importantPoints: [
          "Underconfidence differs from poor ranking.",
          "Probability scale matters.",
          "Calibration diagnostics can reveal the problem."
        ]
      },

      {
        id: "calibration-curve-deep",
        title: "Reliability Diagram / Calibration Curve",
        explanation: [
          "A calibration curve groups predicted probabilities into bins.",
          "For each bin, the average predicted probability is compared with the observed fraction of positives.",
          "The resulting points form a reliability diagram.",
          "Perfect calibration lies near the diagonal where predicted probability equals observed frequency.",
          "Systematic deviations reveal overconfidence or underconfidence."
        ],
        intuition: [
          "Ask whether predictions that say 20%, 50% and 80% actually occur approximately 20%, 50% and 80% of the time."
        ],
        importantPoints: [
          "Compare predicted and observed probability.",
          "Diagonal indicates ideal calibration.",
          "Deviation reveals miscalibration."
        ]
      },

      {
        id: "calibration-binning",
        title: "Calibration Curve Binning",
        explanation: [
          "Calibration curves estimate observed frequency within groups of predictions.",
          "The number and construction of bins affect the appearance of the curve.",
          "Too few bins can hide local calibration problems.",
          "Too many bins can create noisy estimates when each bin contains few observations.",
          "Calibration plots should therefore be interpreted together with sample counts."
        ],
        intuition: [
          "Very large buckets hide detail; extremely small buckets contain too little evidence."
        ],
        importantPoints: [
          "Binning affects diagnostics.",
          "Sample size per bin matters.",
          "Do not overinterpret noisy bins."
        ]
      },

      {
        id: "calibration-uniform-quantile",
        title: "Uniform vs Quantile Calibration Bins",
        explanation: [
          "Uniform binning divides the probability range into equal-width intervals.",
          "Quantile binning attempts to place similar numbers of observations into bins.",
          "Uniform bins preserve equal probability widths but can leave some bins nearly empty.",
          "Quantile bins can provide more balanced sample counts but have unequal probability widths.",
          "The appropriate strategy depends on the score distribution and diagnostic goal."
        ],
        intuition: [
          "You can divide the probability ruler into equal distances or divide observations into similarly sized groups."
        ],
        importantPoints: [
          "Uniform: equal probability width.",
          "Quantile: approximately equal sample counts.",
          "Both have trade-offs."
        ]
      },

      {
        id: "calibration-brier-math",
        title: "Brier Score Mathematics",
        explanation: [
          "For binary classification, the Brier score is the mean squared difference between predicted positive-class probability and the binary outcome.",
          "For observations i = 1 to N, a common binary form is mean((p_i - y_i)^2).",
          "Correct confident probabilities produce small error.",
          "Incorrect confident probabilities produce large error.",
          "Lower Brier score indicates better probabilistic predictions under this metric."
        ],
        intuition: [
          "Treat the probability itself as a numerical prediction and compare it with the actual outcome 0 or 1."
        ],
        importantPoints: [
          "Probability-sensitive.",
          "Lower is better.",
          "Different from ROC-AUC."
        ]
      },

      {
        id: "calibration-log-loss",
        title: "Log Loss and Probability Quality",
        explanation: [
          "Log loss is another probability-sensitive classification metric.",
          "It strongly penalizes assigning very high probability to an outcome that turns out to be wrong.",
          "Brier score uses squared probability error while log loss uses a logarithmic penalty.",
          "Both provide information that hard-label metrics cannot."
        ],
        intuition: [
          "Being confidently wrong should cost more than being uncertain and wrong."
        ],
        importantPoints: [
          "Uses probabilities.",
          "Confident errors are costly.",
          "Complements calibration diagnostics."
        ]
      },

      {
        id: "calibration-shift",
        title: "Calibration Can Change After Distribution Shift",
        explanation: [
          "Calibration measured on historical validation data is not guaranteed to remain valid after deployment.",
          "Changes in class prevalence, population characteristics, sensors or user behavior can alter the relationship between probabilities and outcomes.",
          "Probability-based systems should therefore monitor calibration after deployment when outcomes eventually become available."
        ],
        intuition: [
          "A trustworthy risk scale today may become inaccurate when the population changes."
        ],
        importantPoints: [
          "Calibration is distribution-dependent.",
          "Deployment monitoring matters.",
          "Recalibration may become necessary."
        ]
      },

      {
        id: "calibration-prevalence",
        title: "Class Prevalence and Probability Interpretation",
        explanation: [
          "The underlying frequency of the positive event influences probability predictions and their operational meaning.",
          "A substantial change in prevalence can damage calibration even when ranking remains useful.",
          "This is particularly important in fraud, disease, failure and rare-event systems."
        ],
        intuition: [
          "If the world becomes much more or less risky, yesterday's probability scale may no longer describe today's risk."
        ],
        importantPoints: [
          "Prevalence matters.",
          "Ranking and calibration can respond differently to shift.",
          "Monitor probability behavior."
        ]
      },

      {
        id: "calibration-method-purpose",
        title: "Why Probability Calibration Methods Exist",
        explanation: [
          "Some classifiers produce scores or probabilities that rank observations well but are not sufficiently calibrated.",
          "Calibration methods learn a mapping from model outputs to improved probability estimates.",
          "The mapping must be learned from data that was not used to directly fit the underlying estimator in a leakage-prone way.",
          "Calibration should be validated rather than assumed to improve every model."
        ],
        intuition: [
          "Keep the model's useful ordering but repair the ruler used to express risk."
        ],
        importantPoints: [
          "Calibration transforms model outputs.",
          "Requires proper validation.",
          "Does not guarantee improved ranking."
        ]
      },

      {
        id: "calibration-sigmoid",
        title: "Sigmoid / Platt-Style Calibration",
        explanation: [
          "Sigmoid calibration fits a parametric sigmoid-shaped mapping from classifier scores to calibrated probabilities.",
          "It is relatively constrained compared with non-parametric alternatives.",
          "Its lower flexibility can be useful when calibration data is limited.",
          "It may be insufficient when the true calibration relationship has a more complex shape."
        ],
        intuition: [
          "Fit a smooth S-shaped correction between model confidence and observed probability."
        ],
        importantPoints: [
          "Parametric calibration.",
          "Relatively constrained.",
          "Can work with smaller calibration datasets."
        ]
      },

      {
        id: "calibration-isotonic",
        title: "Isotonic Calibration",
        explanation: [
          "Isotonic calibration learns a non-decreasing mapping from scores to probabilities.",
          "It is more flexible than sigmoid calibration.",
          "Greater flexibility can model complex calibration relationships.",
          "However, it generally requires more calibration data and can overfit when data is limited."
        ],
        intuition: [
          "Learn a flexible staircase-like correction while preserving score ordering."
        ],
        importantPoints: [
          "Non-parametric.",
          "More flexible.",
          "Requires sufficient calibration data."
        ]
      },

      {
        id: "calibration-sigmoid-vs-isotonic",
        title: "Sigmoid vs Isotonic Calibration",
        explanation: [
          "Sigmoid calibration makes stronger shape assumptions and has lower flexibility.",
          "Isotonic calibration can learn more complicated monotonic relationships.",
          "With limited data, sigmoid calibration can be more stable.",
          "With sufficient calibration data and complex miscalibration, isotonic calibration may be useful.",
          "The choice should be validated rather than selected from a universal rule."
        ],
        intuition: [
          "Choose between a simple smooth correction and a more flexible correction based on available evidence."
        ],
        importantPoints: [
          "Sigmoid: constrained.",
          "Isotonic: flexible.",
          "Validate the choice."
        ]
      },

      {
        id: "calibration-calibrated-classifier",
        title: "sklearn CalibratedClassifierCV",
        explanation: [
          "CalibratedClassifierCV provides probability calibration for classifiers using cross-validation-based procedures.",
          "It can apply supported calibration methods such as sigmoid or isotonic.",
          "Cross-validation helps separate calibration fitting from the predictions used to estimate calibration behavior.",
          "Its configuration should be chosen according to dataset size, estimator behavior and validation requirements."
        ],
        intuition: [
          "Use out-of-sample-style predictions to learn how the classifier's confidence should be translated into probability."
        ],
        importantPoints: [
          "Calibration wrapper.",
          "Supports calibration methods.",
          "Uses validation structure."
        ]
      },

      {
        id: "calibration-method-parameter",
        title: "CalibratedClassifierCV Parameter: method",
        explanation: [
          "method controls the calibration mapping used by CalibratedClassifierCV.",
          "Common choices include sigmoid and isotonic.",
          "The parameter changes probability calibration behavior rather than the underlying model family's predictive structure.",
          "Calibration performance should be evaluated on appropriate unseen data."
        ],
        intuition: [
          "method chooses the shape of the probability correction."
        ],
        importantPoints: [
          "Calibration-specific parameter.",
          "Sigmoid and isotonic have different flexibility.",
          "Not an underlying estimator hyperparameter."
        ]
      },

      {
        id: "calibration-cv-parameter",
        title: "CalibratedClassifierCV Parameter: cv",
        explanation: [
          "cv controls the validation strategy involved in calibration.",
          "The split strategy should respect class balance, groups, time and other structural constraints where relevant.",
          "Calibration is vulnerable to the same validation-design mistakes as other model-selection procedures.",
          "The exact supported behavior depends on the sklearn version and configuration."
        ],
        intuition: [
          "Probability correction must be learned using a trustworthy exam structure."
        ],
        importantPoints: [
          "Calibration-validation parameter.",
          "Respect data structure.",
          "Prevent leakage."
        ]
      },

      {
        id: "threshold-math",
        title: "Decision Threshold Mathematics",
        explanation: [
          "Let p(x) represent the model's estimated probability of the positive class.",
          "For a threshold t, predict positive when p(x) is at least t and negative otherwise.",
          "Changing t changes which observations become positive predictions.",
          "This changes TP, FP, TN and FN and therefore changes threshold-dependent metrics."
        ],
        intuition: [
          "The probability stays the same; moving the cutoff changes the action."
        ],
        importantPoints: [
          "Threshold creates labels.",
          "Threshold changes the confusion matrix.",
          "Probability estimation and decision policy are separate."
        ]
      },

      {
        id: "threshold-lower",
        title: "What Happens When the Threshold Is Lowered?",
        explanation: [
          "Lowering the threshold generally increases the number of positive predictions.",
          "True positives can increase because more real positives are detected.",
          "False positives can also increase because more negatives cross the threshold.",
          "Recall often increases while precision may decrease.",
          "The exact magnitude depends on the score distributions."
        ],
        intuition: [
          "Make the alarm easier to trigger and it catches more events but can also create more false alarms."
        ],
        importantPoints: [
          "More predicted positives.",
          "Recall often rises.",
          "False positives can rise."
        ]
      },

      {
        id: "threshold-higher",
        title: "What Happens When the Threshold Is Raised?",
        explanation: [
          "Raising the threshold generally decreases the number of positive predictions.",
          "False positives can decrease.",
          "True positives can also decrease because some real positives no longer reach the threshold.",
          "Precision may improve while recall can decline.",
          "Whether this is desirable depends on the application."
        ],
        intuition: [
          "Require stronger evidence before raising an alarm."
        ],
        importantPoints: [
          "Fewer predicted positives.",
          "Recall can fall.",
          "False positives can fall."
        ]
      },

      {
        id: "threshold-not-05",
        title: "Why 0.5 Is Not Automatically Optimal",
        explanation: [
          "A threshold of 0.5 is a common default when binary probabilities are converted into classes.",
          "It does not automatically minimize business cost, maximize F1, achieve a recall target or satisfy operational constraints.",
          "The appropriate threshold depends on the decision problem.",
          "Probability calibration also affects how meaningful a numerical threshold is."
        ],
        intuition: [
          "0.5 is a default cutoff, not a law of machine learning."
        ],
        importantPoints: [
          "Threshold depends on objective.",
          "0.5 may be inappropriate.",
          "Calibration affects probability interpretation."
        ]
      },

      {
        id: "threshold-cost-sensitive",
        title: "Thresholds from False-Positive and False-Negative Costs",
        explanation: [
          "Applications can assign very different costs to false positives and false negatives.",
          "When false negatives are especially harmful, a lower threshold may be justified to increase sensitivity.",
          "When false positives are extremely expensive, a stricter threshold may be appropriate.",
          "The decision should consider real costs rather than optimizing a metric without context."
        ],
        intuition: [
          "Move the threshold toward the kind of mistake the system can better afford."
        ],
        importantPoints: [
          "Error costs drive policy.",
          "FN-heavy costs can favor recall.",
          "FP-heavy costs can favor precision or specificity."
        ]
      },

      {
        id: "threshold-expected-cost",
        title: "Expected Cost of a Threshold",
        explanation: [
          "For a candidate threshold, the confusion matrix can be converted into an application-specific cost.",
          "A simple form combines FP multiplied by the cost of a false positive and FN multiplied by the cost of a false negative.",
          "More detailed systems can include intervention cost, true-positive benefit and other consequences.",
          "The preferred threshold can then be selected according to the decision objective."
        ],
        intuition: [
          "Translate prediction mistakes into the units the organization actually cares about."
        ],
        importantPoints: [
          "Thresholds can optimize explicit cost.",
          "Metrics are often proxies for cost.",
          "Define costs carefully."
        ]
      },

      {
        id: "threshold-constraint",
        title: "Threshold Selection Under Constraints",
        explanation: [
          "Some systems need to satisfy a minimum recall, maximum false-positive rate or limited intervention capacity.",
          "Threshold selection can be formulated around these constraints.",
          "For example, choose the highest precision threshold that still achieves the required recall.",
          "Operational constraints often provide a clearer decision rule than maximizing a generic metric."
        ],
        intuition: [
          "Instead of asking for the best score, ask for the best system that satisfies the real requirement."
        ],
        importantPoints: [
          "Thresholds can enforce requirements.",
          "Recall or FPR targets may matter.",
          "Capacity constraints can matter."
        ]
      },

      {
        id: "threshold-f1",
        title: "Choosing a Threshold Using F1",
        explanation: [
          "A validation set can be used to calculate F1 across candidate thresholds.",
          "The threshold maximizing validation F1 can be selected when F1 appropriately represents the application objective.",
          "This is not universally optimal because F1 gives a particular balance to precision and recall and ignores true negatives directly.",
          "Threshold selection must still remain separate from final test evaluation."
        ],
        intuition: [
          "Optimize F1 only when the trade-off represented by F1 is actually the trade-off you want."
        ],
        importantPoints: [
          "F1-based thresholding is possible.",
          "F1 is not universally appropriate.",
          "Use validation data."
        ]
      },

      {
        id: "threshold-pr-curve",
        title: "Threshold Selection from Precision-Recall Behavior",
        explanation: [
          "Precision and recall can be calculated across many thresholds.",
          "This allows engineers to inspect how much precision must be sacrificed to achieve a desired recall level.",
          "Precision-Recall analysis is particularly useful when positive events are rare.",
          "The selected operating point should reflect application requirements."
        ],
        intuition: [
          "Use the curve as a menu of possible precision-recall trade-offs."
        ],
        importantPoints: [
          "PR behavior supports threshold decisions.",
          "Useful with rare positives.",
          "Select from domain requirements."
        ]
      },

      {
        id: "threshold-roc",
        title: "Threshold Selection from ROC Behavior",
        explanation: [
          "Every point on an ROC curve corresponds to threshold-dependent true-positive and false-positive rates.",
          "The relevant operating region depends on how much false-positive rate the application can tolerate.",
          "Selecting a threshold solely because it is geometrically attractive on an ROC plot can be inappropriate if real costs are known.",
          "ROC analysis should support rather than replace domain reasoning."
        ],
        intuition: [
          "The ROC curve shows available operating points; the application decides which point is useful."
        ],
        importantPoints: [
          "ROC points correspond to thresholds.",
          "Relevant regions depend on constraints.",
          "Costs remain important."
        ]
      },

      {
        id: "threshold-validation",
        title: "Tune Thresholds on Validation Data",
        explanation: [
          "Threshold selection is part of model development.",
          "Trying several thresholds and choosing the best one uses information from the data being evaluated.",
          "Therefore threshold optimization should use validation data, cross-validation predictions or another development-only procedure.",
          "The final test set should evaluate the already selected model-and-threshold policy."
        ],
        intuition: [
          "Choosing the cutoff after seeing final exam results would make the final exam part of training."
        ],
        importantPoints: [
          "Threshold tuning is model selection.",
          "Use development data.",
          "Protect the final test set."
        ]
      },

      {
        id: "threshold-oof",
        title: "Out-of-Fold Predictions for Threshold Selection",
        explanation: [
          "Cross-validation can generate predictions for observations while each observation is excluded from the model that predicts it.",
          "These out-of-fold predictions can provide a development set of scores for threshold analysis.",
          "The approach uses training data efficiently while reducing direct in-sample optimism.",
          "After selecting the policy, the final estimator can be refit according to the intended workflow."
        ],
        intuition: [
          "Give every training observation a prediction from a model that did not study that observation."
        ],
        importantPoints: [
          "Useful with limited data.",
          "Avoid in-sample threshold tuning.",
          "Still preserve final test independence."
        ]
      },

      {
        id: "threshold-test-leakage",
        title: "Test-Set Threshold Leakage",
        explanation: [
          "Selecting a threshold because it performs best on the test set contaminates the final evaluation.",
          "The reported test score then reflects both threshold selection and evaluation.",
          "Repeated test-set inspection can create substantial optimism.",
          "The test set should be used only after calibration and threshold decisions are finalized."
        ],
        intuition: [
          "The test set stops being unseen the moment it influences the cutoff."
        ],
        importantPoints: [
          "Never optimize threshold on test data.",
          "Threshold is part of the final workflow.",
          "Evaluate once after selection."
        ]
      },

      {
        id: "threshold-calibration-relation",
        title: "Calibration and Thresholding Are Related but Different",
        explanation: [
          "Calibration determines whether probability values have reliable numerical meaning.",
          "Thresholding determines how those values are converted into decisions.",
          "A model can use a threshold successfully even when its probabilities are not perfectly calibrated if the threshold is validated empirically.",
          "However, calibrated probabilities make probability-based risk interpretation and cost-sensitive decisions more meaningful."
        ],
        intuition: [
          "Calibration fixes the ruler; thresholding chooses where on the ruler action begins."
        ],
        importantPoints: [
          "Calibration concerns probabilities.",
          "Thresholding concerns decisions.",
          "Do not confuse the two."
        ]
      },

      {
        id: "threshold-ranking-relation",
        title: "Ranking Can Stay the Same After Calibration",
        explanation: [
          "Many calibration mappings are monotonic and therefore preserve much of the original score ordering.",
          "A model's ROC-AUC can remain similar even while probability calibration changes substantially.",
          "This demonstrates again why ranking metrics and probability-quality metrics should be evaluated separately."
        ],
        intuition: [
          "You can change the numbers written on a ruler while preserving who ranks above whom."
        ],
        importantPoints: [
          "Ranking and probability scale differ.",
          "Calibration may preserve ordering.",
          "Evaluate both properties."
        ]
      },

      {
        id: "calibration-small-data",
        title: "Calibration with Limited Data",
        explanation: [
          "Calibration requires enough observations to estimate the relationship between scores and outcomes.",
          "With very small calibration datasets, flexible methods can fit noise.",
          "Calibration curves also become unstable because probability bins contain few observations.",
          "Cross-validation and simpler calibration mappings can be valuable when data is limited."
        ],
        intuition: [
          "You cannot reliably determine whether 80% predictions really occur 80% of the time from only a handful of cases."
        ],
        importantPoints: [
          "Calibration needs data.",
          "Flexible methods can overfit.",
          "Inspect sample sizes."
        ]
      },

      {
        id: "calibration-multiclass",
        title: "Calibration in Multiclass Classification",
        explanation: [
          "Multiclass probability calibration is more complex because predictions form a probability distribution across several classes.",
          "Each class's probability behavior can require inspection.",
          "Probability values must remain coherent across classes.",
          "Evaluation should use methods appropriate for multiclass probability predictions rather than blindly applying binary interpretations."
        ],
        intuition: [
          "Instead of calibrating one positive probability, the model distributes confidence across several possible outcomes."
        ],
        importantPoints: [
          "Multiclass calibration differs from binary calibration.",
          "Inspect class-specific behavior.",
          "Use appropriate metrics."
        ]
      },

      {
        id: "calibration-model-behavior",
        title: "Different Models Have Different Calibration Behavior",
        explanation: [
          "Different classifier families can produce probability estimates with different calibration characteristics.",
          "Strong ranking performance does not imply that one model family will automatically produce superior probability estimates.",
          "Calibration quality should therefore be measured rather than assumed from the algorithm name."
        ],
        intuition: [
          "Two models can order risk similarly while using very different probability scales."
        ],
        importantPoints: [
          "Calibration is empirical.",
          "Do not assume from model family.",
          "Measure probability quality."
        ]
      },

      {
        id: "calibration-workflow",
        title: "Complete Calibration Workflow",
        explanation: [
          "Train a candidate classifier using leakage-safe validation.",
          "Obtain probability or continuous score predictions on appropriate unseen development observations.",
          "Evaluate discrimination separately from probability quality.",
          "Inspect calibration curves and probability-sensitive metrics.",
          "Apply calibration when justified.",
          "Re-evaluate calibrated probabilities.",
          "Select the operating threshold from application requirements.",
          "Evaluate the finalized workflow on untouched test data."
        ],
        intuition: [
          "First make probability estimates trustworthy, then decide how those probabilities should trigger actions."
        ],
        importantPoints: [
          "Train.",
          "Measure discrimination.",
          "Measure calibration.",
          "Calibrate if needed.",
          "Choose threshold.",
          "Final test."
        ]
      },

      {
        id: "calibration-diagnosis-good-auc",
        title: "Diagnosis: High ROC-AUC but Poor Calibration",
        explanation: [
          "This pattern means the model ranks positive and negative observations effectively but its numerical probabilities do not correspond well to observed frequencies.",
          "Changing the classification threshold alone does not repair the probability scale.",
          "Inspect calibration curves, Brier score and other probability diagnostics.",
          "Calibration may be appropriate if probabilities are operationally important."
        ],
        intuition: [
          "The ordering is good but the risk ruler is wrong."
        ],
        importantPoints: [
          "Ranking can remain strong.",
          "Probability estimates can still be unreliable.",
          "Consider calibration."
        ]
      },

      {
        id: "calibration-diagnosis-threshold",
        title: "Diagnosis: Good Probabilities but Poor Decisions",
        explanation: [
          "A model can produce useful probability estimates while using an unsuitable decision threshold.",
          "The resulting precision, recall or cost can therefore be poor.",
          "Inspect the operating threshold and application error costs before changing the underlying model.",
          "A threshold problem and a model-quality problem are not the same."
        ],
        intuition: [
          "The risk estimate may be correct while the rule deciding when to act is wrong."
        ],
        importantPoints: [
          "Inspect threshold separately.",
          "Do not retrain unnecessarily.",
          "Connect decisions to costs."
        ]
      },

      {
        id: "calibration-common-mistakes",
        title: "Common Calibration and Thresholding Mistakes",
        explanation: [
          "Assuming probability 0.9 automatically means approximately 90% empirical risk.",
          "Assuming high ROC-AUC means probabilities are calibrated.",
          "Using 0.5 without considering the application.",
          "Selecting the threshold on the final test set.",
          "Fitting calibration in a leakage-prone way.",
          "Using extremely flexible calibration with too little data.",
          "Ignoring distribution shift after deployment."
        ],
        intuition: [
          "Most mistakes come from confusing ranking, probability estimation and decision policy."
        ],
        importantPoints: [
          "Separate ranking.",
          "Separate calibration.",
          "Separate threshold policy.",
          "Protect evaluation data."
        ]
      },

      {
        id: "calibration-real-world",
        title: "Real-World Calibration and Threshold Examples",
        explanation: [
          "Medical risk models may require probabilities that clinicians can interpret as meaningful risk.",
          "Fraud systems may lower thresholds when missing fraud is expensive but must manage investigation capacity.",
          "Credit systems may use calibrated default probabilities in expected-loss calculations.",
          "Predictive-maintenance systems may select thresholds according to the relative cost of unnecessary inspection and equipment failure."
        ],
        intuition: [
          "Probability quality tells you the risk; threshold policy tells you what to do about that risk."
        ],
        importantPoints: [
          "Healthcare.",
          "Fraud.",
          "Credit risk.",
          "Predictive maintenance."
        ]
      },

      {
        id: "calibration-exam-interview",
        title: "Calibration & Thresholding: Exam and Interview Essentials",
        explanation: [
          "Differentiate scores, probabilities and labels.",
          "Define probability calibration.",
          "Explain perfect calibration.",
          "Differentiate discrimination and calibration.",
          "Explain calibration curves.",
          "Explain Brier score.",
          "Explain sigmoid calibration.",
          "Explain isotonic calibration.",
          "Compare sigmoid and isotonic methods.",
          "Explain why 0.5 is not universally optimal.",
          "Explain how lowering and raising thresholds affect errors.",
          "Explain cost-sensitive threshold selection.",
          "Explain why threshold tuning must not use final test data.",
          "Explain the relationship between calibration and thresholding."
        ],
        intuition: [
          "A complete answer separates three questions: how observations are ranked, whether probabilities are trustworthy, and where the system should act."
        ],
        importantPoints: [
          "Discrimination.",
          "Calibration.",
          "Brier score.",
          "Sigmoid.",
          "Isotonic.",
          "Threshold.",
          "Costs.",
          "Leakage."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "calibration-threshold-explorer",
      title: "Calibration & Threshold Lab",
      description:
        "Move the classification threshold and observe precision, recall, F1, false positives and false negatives while comparing predicted probabilities with calibration curves."
    },

    codeExamples: [
      {
        id: "threshold-code",
        title: "Custom Classification Threshold",
        description:
          "Convert predicted probabilities into labels using a custom threshold.",
        language: "python",
        code: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "classifier",
        LogisticRegression(max_iter=2000)
    )
])

model.fit(
    X_train,
    y_train
)

probabilities = model.predict_proba(
    X_test
)[:, 1]

threshold = 0.35

predictions = (
    probabilities >= threshold
).astype(int)

print(
    classification_report(
        y_test,
        predictions
    )
)`,
        explanation: [
          "predict_proba returns positive-class probability estimates.",
          "The custom threshold converts probabilities into class decisions.",
          "Changing the threshold changes precision and recall."
        ],
        commonMistakes: [
          "Choosing the threshold using the final test set.",
          "Assuming 0.5 is always optimal.",
          "Confusing calibration with discrimination."
        ]
      }
    ],

    practice: [
      {
        id: "threshold-practice-1",
        title: "Lower Threshold",
        type: "analysis",
        difficulty: "medium",
        question:
          "What generally happens to the number of positive predictions when the threshold is lowered?",
        instructions: ["Think about how easy it becomes to predict positive."],
        hints: ["More probabilities exceed the threshold."],
        explanation:
          "The number of positive predictions generally increases."
      },
      {
        id: "threshold-practice-2",
        title: "Calibration",
        type: "concept",
        difficulty: "medium",
        question:
          "What would good calibration mean for predictions near probability 0.8?",
        instructions: ["Think observed frequency."],
        hints: ["Around 80% should be positive."],
        explanation:
          "Among many observations receiving probabilities near 0.8, roughly 80% should be positive."
      },
      {
        id: "threshold-practice-3",
        title: "ROC-AUC vs Calibration",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Can a classifier have strong ROC-AUC but poor probability calibration?",
        instructions: ["Separate ranking from probability accuracy."],
        hints: ["They measure different properties."],
        explanation:
          "Yes. A model can rank positive cases above negative cases very well while producing probabilities that do not correspond accurately to observed frequencies."
      }
    ],

    keyTakeaways: [
      "Probabilities and class decisions are different outputs.",
      "Decision thresholds control operational trade-offs.",
      "0.5 is not universally optimal.",
      "Calibration measures probability reliability.",
      "ROC-AUC and calibration measure different properties.",
      "Threshold selection must remain separate from final test evaluation."
    ]
  },

  // =========================================================
  // 7. IMBALANCED LEARNING
  // =========================================================
  "imbalanced-learning": {
    overview:
      "Imbalanced learning addresses classification problems where one class occurs much less frequently than another. In these settings, accuracy can become misleading and careful metric selection, stratification, class weighting, resampling and leakage-safe validation become essential.",

    objectives: [
      "Recognize class imbalance.",
      "Understand why accuracy can mislead.",
      "Use precision, recall, F1, ROC-AUC and PR metrics.",
      "Understand class weighting.",
      "Understand oversampling and undersampling.",
      "Understand SMOTE conceptually.",
      "Prevent resampling leakage.",
      "Use stratified validation.",
      "Choose strategies based on real error costs."
    ],

    sections: [
      {
        id: "imbalance-problem",
        title: "What Is Class Imbalance?",
        explanation: [
          "Class imbalance occurs when target classes have substantially different frequencies.",
          "Fraud, disease detection and failure prediction commonly contain rare positive events.",
          "A model can achieve high accuracy by mostly predicting the majority class."
        ],
        intuition: [
          "If only 1% of transactions are fraud, predicting 'not fraud' for everything gives 99% accuracy while detecting no fraud."
        ],
        importantPoints: [
          "Accuracy can be misleading.",
          "Minority-class behavior must be evaluated explicitly."
        ]
      },

      {
        id: "imbalance-metrics",
        title: "Metrics for Imbalanced Problems",
        explanation: [
          "Precision measures the reliability of positive predictions.",
          "Recall measures how many minority positive cases are detected.",
          "F1 summarizes precision and recall.",
          "Precision-Recall curves can be particularly informative for rare positive classes.",
          "The correct metric depends on the application."
        ],
        intuition: [
          "For rare events, the important question is often whether we can find them without creating an unacceptable number of false alarms."
        ],
        importantPoints: [
          "Do not automatically optimize accuracy.",
          "Use metrics that reflect real error costs."
        ]
      },

      {
        id: "imbalance-weight",
        title: "Class Weighting",
        explanation: [
          "Some algorithms allow minority-class mistakes to receive greater weight.",
          "For example, class_weight='balanced' adjusts weights inversely according to class frequencies in compatible sklearn estimators.",
          "Class weighting changes the learning objective without creating synthetic samples."
        ],
        intuition: [
          "Mistakes on rare examples can be made more expensive during training."
        ],
        importantPoints: [
          "Class weighting is often a strong first strategy.",
          "It does not physically rebalance the dataset."
        ]
      },

      {
        id: "imbalance-resampling",
        title: "Over- and Under-Sampling",
        explanation: [
          "Oversampling increases minority representation.",
          "Undersampling reduces majority representation.",
          "Random oversampling can duplicate minority examples.",
          "Random undersampling can discard useful majority information."
        ],
        intuition: [
          "Resampling changes what the learner sees during training."
        ],
        importantPoints: [
          "Oversampling and undersampling have different trade-offs.",
          "Resampling should only affect training data."
        ]
      },

      {
        id: "imbalance-smote",
        title: "SMOTE Intuition",
        explanation: [
          "SMOTE creates synthetic minority examples using relationships between nearby minority observations.",
          "It does not simply copy existing rows.",
          "Synthetic samples should be generated only from training data.",
          "SMOTE is not automatically appropriate for every feature representation."
        ],
        intuition: [
          "Instead of duplicating a minority point, SMOTE creates new points between related minority observations."
        ],
        importantPoints: [
          "SMOTE is a synthetic oversampling technique.",
          "Apply it only inside training folds.",
          "Validate whether it actually improves the relevant metric."
        ]
      },

      {
        id: "imbalance-leakage",
        title: "Resampling Leakage",
        explanation: [
          "Resampling the full dataset before train/test splitting contaminates evaluation.",
          "Synthetic or duplicated information can influence both training and validation data.",
          "Resampling should occur only after splitting and inside each cross-validation training fold."
        ],
        intuition: [
          "Validation data must remain untouched by training-data generation."
        ],
        importantPoints: [
          "Never oversample before the split.",
          "Use imbalanced-learn Pipeline for fold-safe resampling workflows."
        ]
      },
            {
        id: "imbalance-ratio",
        title: "Measuring the Degree of Class Imbalance",
        explanation: [
          "Class imbalance should be quantified rather than described only as balanced or imbalanced.",
          "For binary classification, the class ratio compares the number of majority observations with the number of minority observations.",
          "A dataset containing 9900 negatives and 100 positives has approximately a 99:1 class ratio.",
          "The practical difficulty of imbalance depends not only on this ratio but also on sample size, class overlap, noise and the cost of errors."
        ],
        intuition: [
          "A 10:1 imbalance with thousands of minority examples can be easier than a 10:1 imbalance containing only ten minority examples."
        ],
        importantPoints: [
          "Measure class frequencies.",
          "Ratio alone does not determine difficulty.",
          "Minority sample count also matters."
        ]
      },

      {
        id: "imbalance-accuracy-math",
        title: "Why Accuracy Can Fail Mathematically",
        explanation: [
          "Accuracy equals the number of correct predictions divided by the total number of observations.",
          "If 99% of observations belong to the majority class, predicting that class for every observation produces 99% accuracy.",
          "However, minority recall becomes zero because no minority observation is detected.",
          "This demonstrates why aggregate accuracy can hide catastrophic minority-class performance."
        ],
        intuition: [
          "A metric dominated by the majority class can reward a model that completely ignores the event we care about."
        ],
        importantPoints: [
          "High accuracy can coexist with zero minority recall.",
          "Always inspect class-specific behavior.",
          "Metric choice depends on the objective."
        ]
      },

      {
        id: "imbalance-confusion-matrix",
        title: "Confusion Matrix Under Class Imbalance",
        explanation: [
          "The confusion matrix separates predictions into true positives, false positives, true negatives and false negatives.",
          "For rare positive events, the true-negative count can become extremely large simply because negatives dominate the dataset.",
          "This can make overall accuracy look excellent even when false negatives are unacceptable.",
          "The confusion matrix therefore provides essential context for threshold-dependent metrics."
        ],
        intuition: [
          "Do not allow thousands of easy majority examples to hide the few rare examples the model misses."
        ],
        importantPoints: [
          "Inspect TP, FP, TN and FN.",
          "Large TN counts can dominate accuracy.",
          "Connect errors to real costs."
        ]
      },

      {
        id: "imbalance-precision-recall-math",
        title: "Precision and Recall Mathematics",
        explanation: [
          "Precision is TP divided by TP plus FP.",
          "Recall is TP divided by TP plus FN.",
          "Precision asks how trustworthy positive predictions are.",
          "Recall asks how many actual positives are detected.",
          "These metrics expose behavior that overall accuracy can hide."
        ],
        intuition: [
          "Precision asks whether alarms are usually correct. Recall asks whether important events are being found."
        ],
        importantPoints: [
          "Precision = TP / (TP + FP).",
          "Recall = TP / (TP + FN).",
          "The correct trade-off depends on error costs."
        ]
      },

      {
        id: "imbalance-specificity",
        title: "Specificity",
        explanation: [
          "Specificity measures the proportion of actual negatives correctly identified.",
          "It is TN divided by TN plus FP.",
          "Recall for the positive class and specificity for the negative class provide complementary views of class-specific performance.",
          "Specificity can be important when false positives create significant operational cost."
        ],
        intuition: [
          "Recall asks how well we catch positives; specificity asks how well we correctly leave negatives alone."
        ],
        importantPoints: [
          "Specificity = TN / (TN + FP).",
          "Measures negative-class detection.",
          "Useful alongside recall."
        ]
      },

      {
        id: "imbalance-f1-math",
        title: "F1 Score",
        explanation: [
          "F1 is the harmonic mean of precision and recall.",
          "Its binary form is 2 multiplied by precision multiplied by recall divided by precision plus recall.",
          "The harmonic mean penalizes situations where one of the two metrics is very poor.",
          "F1 can be useful when both precision and recall matter, but it does not directly include true negatives."
        ],
        intuition: [
          "A model cannot obtain a strong F1 score merely by making precision excellent while recall collapses."
        ],
        importantPoints: [
          "Balances precision and recall.",
          "Ignores true negatives directly.",
          "Not universally the best metric."
        ]
      },

      {
        id: "imbalance-fbeta",
        title: "F-beta Score",
        explanation: [
          "F-beta generalizes F1 by allowing recall and precision to receive different emphasis.",
          "Values of beta greater than 1 place greater emphasis on recall.",
          "Values below 1 place greater emphasis on precision.",
          "The choice of beta should reflect application costs rather than arbitrary preference."
        ],
        intuition: [
          "F-beta lets the application decide whether missing positives or generating false alarms deserves more attention."
        ],
        importantPoints: [
          "beta > 1 emphasizes recall.",
          "beta < 1 emphasizes precision.",
          "Choose beta from domain requirements."
        ]
      },

      {
        id: "imbalance-balanced-accuracy",
        title: "Balanced Accuracy",
        explanation: [
          "Balanced accuracy gives class-specific recall more equal influence than ordinary accuracy.",
          "For binary classification it can be viewed as the average of sensitivity and specificity.",
          "It is useful when majority-class dominance makes ordinary accuracy misleading.",
          "It still does not replace analysis of the complete confusion matrix."
        ],
        intuition: [
          "Give each class a fairer voice instead of allowing the largest class to dominate the score."
        ],
        importantPoints: [
          "Useful under imbalance.",
          "Balances class-level recall behavior.",
          "Still inspect class-specific metrics."
        ]
      },

      {
        id: "imbalance-roc-caution",
        title: "ROC-AUC Under Severe Imbalance",
        explanation: [
          "ROC-AUC measures ranking performance across thresholds using true-positive rate and false-positive rate.",
          "It remains useful under many imbalanced settings.",
          "However, when negatives massively outnumber positives, a seemingly small false-positive rate can still correspond to a very large number of false positives.",
          "ROC-AUC should therefore not be interpreted without considering the deployment problem."
        ],
        intuition: [
          "One percent of a million negatives is still ten thousand false alarms."
        ],
        importantPoints: [
          "ROC-AUC measures ranking.",
          "False-positive rate can hide large absolute counts.",
          "Use application context."
        ]
      },

      {
        id: "imbalance-pr-curve",
        title: "Precision-Recall Curves",
        explanation: [
          "A Precision-Recall curve shows precision and recall across decision thresholds.",
          "It focuses directly on positive predictions and positive-class detection.",
          "This often makes it highly informative when the positive class is rare.",
          "The curve reveals the cost in precision required to achieve additional recall."
        ],
        intuition: [
          "See how many more rare events can be caught before false alarms become unacceptable."
        ],
        importantPoints: [
          "Useful for rare positive events.",
          "Shows precision-recall trade-off.",
          "Threshold-dependent behavior."
        ]
      },

      {
        id: "imbalance-average-precision",
        title: "Average Precision and PR-AUC",
        explanation: [
          "Average Precision summarizes precision-recall behavior across thresholds using a weighted summary based on recall changes.",
          "It is commonly used to summarize ranking quality when positive events are rare.",
          "Different implementations or numerical integration conventions can produce quantities described informally as PR-AUC, so metric definitions should be reported clearly.",
          "The baseline level of precision is strongly influenced by positive-class prevalence."
        ],
        intuition: [
          "Summarize how effectively high-ranked predictions remain precise while recovering more positives."
        ],
        importantPoints: [
          "Useful for rare-event ranking.",
          "Report metric definition clearly.",
          "Prevalence influences interpretation."
        ]
      },

      {
        id: "imbalance-pr-baseline",
        title: "Why PR Metrics Depend on Prevalence",
        explanation: [
          "Precision depends directly on the proportion of positives in the evaluated population.",
          "When positives become rarer, maintaining high precision becomes more difficult.",
          "PR curves and Average Precision therefore depend on class prevalence more directly than ROC-AUC.",
          "Comparisons across datasets with different prevalence require care."
        ],
        intuition: [
          "Finding one rare positive among thousands of negatives creates a different precision problem than finding one positive among two observations."
        ],
        importantPoints: [
          "Precision depends on prevalence.",
          "Dataset prevalence matters.",
          "Avoid careless cross-dataset comparisons."
        ]
      },

      {
        id: "imbalance-stratification",
        title: "Stratified Splitting",
        explanation: [
          "Stratified splitting attempts to preserve class proportions across train and validation partitions.",
          "This is particularly useful when minority observations are scarce.",
          "Without stratification, some folds can accidentally contain too few minority observations for meaningful evaluation.",
          "Stratification does not solve imbalance itself; it improves evaluation design."
        ],
        intuition: [
          "Make sure every exam contains a meaningful representation of the rare class."
        ],
        importantPoints: [
          "Preserves approximate class ratios.",
          "Important for rare classes.",
          "Evaluation technique, not a balancing method."
        ]
      },

      {
        id: "imbalance-stratified-cv",
        title: "Stratified Cross-Validation",
        explanation: [
          "StratifiedKFold is commonly used for imbalanced classification when observations are otherwise independent.",
          "Each fold attempts to preserve class proportions.",
          "This reduces the chance that one validation fold contains almost no minority observations.",
          "Grouped or temporal datasets may require different splitters even when classes are imbalanced."
        ],
        intuition: [
          "Balance the representation of the rare class across exams without violating the structure of the dataset."
        ],
        importantPoints: [
          "Useful for ordinary imbalanced classification.",
          "Not appropriate when group or time constraints are ignored.",
          "Validation design comes first."
        ]
      },

      {
        id: "imbalance-class-weight-math",
        title: "How Class Weighting Changes Learning",
        explanation: [
          "Many supervised objectives can assign different importance to observations or classes.",
          "Increasing minority-class weight makes errors involving those observations contribute more strongly to the training objective.",
          "This can shift the fitted decision boundary toward improved minority detection.",
          "The exact mathematical effect depends on the estimator and its loss function."
        ],
        intuition: [
          "Tell the optimizer that getting a rare example wrong is more expensive."
        ],
        importantPoints: [
          "Changes objective importance.",
          "Does not create observations.",
          "Estimator support varies."
        ]
      },

      {
        id: "imbalance-balanced-weight",
        title: "class_weight='balanced'",
        explanation: [
          "Compatible sklearn estimators can support class_weight='balanced'.",
          "The balanced heuristic assigns class weights inversely related to class frequency.",
          "Rare classes therefore receive larger weights than common classes.",
          "This provides a useful baseline but does not guarantee the optimal application-specific cost ratio."
        ],
        intuition: [
          "Automatically increase the importance of classes that appear less often."
        ],
        importantPoints: [
          "Frequency-based heuristic.",
          "Supported only by compatible estimators.",
          "Validate against application metrics."
        ]
      },

      {
        id: "imbalance-custom-class-weight",
        title: "Custom Class Weights",
        explanation: [
          "When domain costs are known, explicit class weights can sometimes represent those priorities better than an automatic frequency heuristic.",
          "Increasing positive-class weight generally encourages the model to treat positive errors as more costly.",
          "Very aggressive weights can create excessive false positives.",
          "Weights should therefore be selected using validation data and meaningful metrics."
        ],
        intuition: [
          "Choose how expensive each class's mistakes should be instead of relying only on frequency."
        ],
        importantPoints: [
          "Can encode asymmetric priorities.",
          "Higher minority weight can increase sensitivity.",
          "Tune with validation."
        ]
      },

      {
        id: "imbalance-sample-weight",
        title: "Sample Weights",
        explanation: [
          "Some estimators and metrics support weights for individual observations.",
          "Sample weighting is more flexible than assigning one weight to an entire class.",
          "Weights can represent observation importance, sampling design or application-specific costs when methodologically justified.",
          "Estimator and metric support must be checked explicitly."
        ],
        intuition: [
          "Instead of saying every positive is equally important, assign importance at the individual-example level."
        ],
        importantPoints: [
          "Observation-level weighting.",
          "More flexible than class weights.",
          "Support depends on estimator and API."
        ]
      },

      {
        id: "imbalance-random-over",
        title: "Random Oversampling",
        explanation: [
          "Random oversampling increases minority representation by sampling existing minority observations with replacement.",
          "It does not create new feature combinations.",
          "The method is simple and can be effective.",
          "However, repeatedly presenting the same minority observations can increase overfitting risk for some models."
        ],
        intuition: [
          "Show the learner rare examples more often."
        ],
        importantPoints: [
          "Duplicates existing minority observations.",
          "Simple baseline.",
          "Can increase overfitting risk."
        ]
      },

      {
        id: "imbalance-random-over-params",
        title: "RandomOverSampler Parameters",
        explanation: [
          "sampling_strategy controls the desired resampling relationship according to the sampler's supported API.",
          "random_state controls reproducibility of random sampling.",
          "Some library versions can provide additional sampler-specific controls.",
          "These are resampling parameters and should not be confused with estimator hyperparameters."
        ],
        intuition: [
          "Choose how much oversampling to perform and make the random procedure reproducible."
        ],
        importantPoints: [
          "sampling_strategy controls resampling target.",
          "random_state controls reproducibility.",
          "Sampler parameters are separate from model parameters."
        ]
      },

      {
        id: "imbalance-random-under",
        title: "Random Undersampling",
        explanation: [
          "Random undersampling reduces majority representation by discarding majority observations.",
          "It can substantially reduce training cost when the majority class is extremely large.",
          "However, useful majority information can be lost.",
          "The trade-off becomes especially important when the original dataset is not large."
        ],
        intuition: [
          "Instead of repeating rare examples, show the learner fewer common examples."
        ],
        importantPoints: [
          "Reduces majority data.",
          "Can improve computational efficiency.",
          "May discard useful information."
        ]
      },

      {
        id: "imbalance-random-under-params",
        title: "RandomUnderSampler Parameters",
        explanation: [
          "sampling_strategy controls the desired class sampling relationship according to the sampler API.",
          "random_state controls reproducibility when random selection is involved.",
          "Replacement-related behavior can be sampler-specific.",
          "These controls determine the resampling process rather than the predictive estimator itself."
        ],
        intuition: [
          "Choose how much majority data to keep and how the subset is sampled."
        ],
        importantPoints: [
          "sampling_strategy is central.",
          "random_state supports reproducibility.",
          "Do not mix sampler and estimator parameters."
        ]
      },

      {
        id: "imbalance-over-vs-under",
        title: "Oversampling vs Undersampling",
        explanation: [
          "Oversampling preserves majority information but increases the effective training-set size.",
          "Undersampling reduces computational cost but discards majority observations.",
          "Oversampling can increase overfitting risk when examples are duplicated.",
          "The better strategy depends on dataset size, minority sample count, estimator and application."
        ],
        intuition: [
          "Either increase the rare signal or reduce the common signal."
        ],
        importantPoints: [
          "Different information trade-offs.",
          "Different computational trade-offs.",
          "Validate empirically."
        ]
      },

      {
        id: "imbalance-smote-math",
        title: "How SMOTE Generates Synthetic Samples",
        explanation: [
          "SMOTE selects a minority observation and one of its minority neighbors.",
          "A synthetic point is generated along the line segment between the two observations.",
          "A simplified form is x_new = x_i + lambda * (x_neighbor - x_i), where lambda is between 0 and 1.",
          "The generated point is therefore an interpolation rather than an exact duplicate."
        ],
        intuition: [
          "Choose two nearby minority examples and create a new example somewhere between them."
        ],
        importantPoints: [
          "Uses minority neighbors.",
          "Creates interpolated observations.",
          "Not simple duplication."
        ]
      },

      {
        id: "imbalance-smote-sampling-strategy",
        title: "SMOTE Parameter: sampling_strategy",
        explanation: [
          "sampling_strategy controls which classes are resampled and the desired resampling amount according to the imbalanced-learn API.",
          "The appropriate setting depends on whether the task is binary or multiclass.",
          "Forcing exact class equality is not automatically optimal.",
          "The resampling amount should be treated as a validation decision."
        ],
        intuition: [
          "Choose how far to move the training distribution toward greater minority representation."
        ],
        importantPoints: [
          "Controls resampling amount.",
          "Behavior depends on task and API.",
          "Full balance is not always necessary."
        ]
      },

      {
        id: "imbalance-smote-k-neighbors",
        title: "SMOTE Parameter: k_neighbors",
        explanation: [
          "k_neighbors controls the neighborhood used to construct synthetic minority observations.",
          "A smaller neighborhood emphasizes very local minority structure.",
          "A larger neighborhood uses broader minority relationships.",
          "The value must also be feasible given the number of minority observations available within each training fold."
        ],
        intuition: [
          "Choose how many nearby minority examples SMOTE can use when deciding where synthetic points may be created."
        ],
        importantPoints: [
          "Neighborhood parameter.",
          "Affects synthetic geometry.",
          "Minority sample count constrains valid values."
        ]
      },

      {
        id: "imbalance-smote-random-state",
        title: "SMOTE Parameter: random_state",
        explanation: [
          "random_state controls reproducibility of applicable random choices during synthetic sample generation.",
          "Fixing it helps reproduce experiments.",
          "It should not be repeatedly searched merely to obtain a favorable validation result."
        ],
        intuition: [
          "Reproduce the same synthetic sampling experiment."
        ],
        importantPoints: [
          "Reproducibility parameter.",
          "Not a model-complexity parameter.",
          "Do not optimize random seeds."
        ]
      },

      {
        id: "imbalance-smote-scaling",
        title: "SMOTE and Feature Scaling",
        explanation: [
          "SMOTE relies on neighborhood relationships.",
          "When numeric features have very different scales, large-scale features can dominate distance calculations.",
          "Appropriate scaling can therefore matter before neighborhood-based synthetic generation.",
          "The exact preprocessing order must remain leakage-safe inside the training workflow."
        ],
        intuition: [
          "If distance determines neighbors, the units used to measure distance matter."
        ],
        importantPoints: [
          "SMOTE is distance-based.",
          "Feature scale can affect neighbors.",
          "Keep preprocessing fold-safe."
        ]
      },

      {
        id: "imbalance-smote-boundary",
        title: "SMOTE Can Create Difficult Synthetic Points",
        explanation: [
          "SMOTE assumes that interpolation between selected minority neighbors creates meaningful minority observations.",
          "When classes overlap strongly, synthetic observations can be generated near ambiguous or inappropriate regions.",
          "Noisy minority observations can also influence synthetic generation.",
          "SMOTE should therefore be validated rather than applied automatically."
        ],
        intuition: [
          "Drawing a point between two minority examples is useful only when the space between them genuinely represents that class."
        ],
        importantPoints: [
          "Class overlap matters.",
          "Noise matters.",
          "Synthetic data is not automatically valid."
        ]
      },

      {
        id: "imbalance-smote-categorical",
        title: "SMOTE and Categorical Features",
        explanation: [
          "Ordinary numeric interpolation is not naturally meaningful for arbitrary categorical values.",
          "Datasets containing categorical features may require methods designed for mixed or categorical representations.",
          "One-hot encoded spaces can also create synthetic combinations whose interpretation deserves care.",
          "Resampling strategy should match feature semantics."
        ],
        intuition: [
          "You cannot always create a meaningful category by mathematically averaging two category codes."
        ],
        importantPoints: [
          "Feature type matters.",
          "Ordinary SMOTE is not universally appropriate.",
          "Use feature-aware methods."
        ]
      },

      {
        id: "imbalance-smote-variants",
        title: "SMOTE Family: Important Variants",
        explanation: [
          "Borderline-SMOTE focuses synthetic generation around minority observations near difficult decision boundaries.",
          "ADASYN adaptively generates more synthetic observations in regions considered harder to learn.",
          "SMOTENC is designed for datasets containing both continuous and categorical features.",
          "SMOTEN targets categorical-feature settings.",
          "These techniques make different assumptions and should not be treated as universally superior to ordinary SMOTE."
        ],
        intuition: [
          "Different synthetic samplers decide differently where new minority examples should be created."
        ],
        importantPoints: [
          "Variants solve different problems.",
          "Feature representation matters.",
          "Validate against simpler baselines."
        ]
      },

      {
        id: "imbalance-cleaning-methods",
        title: "Cleaning-Based Resampling",
        explanation: [
          "Some imbalance techniques remove observations near overlapping or noisy class boundaries.",
          "Tomek Links and Edited Nearest Neighbours are examples of approaches used for dataset cleaning.",
          "They can be combined with oversampling in some workflows.",
          "Cleaning methods change the training distribution and therefore must also remain inside training folds."
        ],
        intuition: [
          "Instead of only adding rare examples, clean ambiguous training regions that may confuse the classifier."
        ],
        importantPoints: [
          "Can remove ambiguous observations.",
          "May complement oversampling.",
          "Apply only to training data."
        ]
      },

      {
        id: "imbalance-smoteenn-smotetomek",
        title: "Combined Resampling Strategies",
        explanation: [
          "Techniques such as SMOTEENN and SMOTETomek combine synthetic oversampling with cleaning operations.",
          "The goal is to increase minority representation while also reducing problematic boundary observations.",
          "Combined methods introduce additional complexity and should be compared against simpler class weighting or sampling baselines."
        ],
        intuition: [
          "Add minority examples, then clean parts of the resulting training space."
        ],
        importantPoints: [
          "Combines generation and cleaning.",
          "More complex than basic SMOTE.",
          "Benchmark against simpler methods."
        ]
      },

      {
        id: "imbalance-pipeline-order",
        title: "Correct Resampling Pipeline",
        explanation: [
          "The dataset should first be separated according to the intended validation design.",
          "Within each training fold, learned preprocessing and resampling should be fitted only using training observations.",
          "The predictive estimator is then trained on the transformed and resampled training data.",
          "Validation observations are transformed using training-fitted preprocessing but must not be resampled as if they were training examples."
        ],
        intuition: [
          "Generate training data only from training data."
        ],
        importantPoints: [
          "Split first.",
          "Resample training folds only.",
          "Leave validation distribution untouched."
        ]
      },

      {
        id: "imbalance-imblearn-pipeline",
        title: "Why imbalanced-learn Pipeline Is Important",
        explanation: [
          "A resampler behaves differently from an ordinary sklearn transformer because it changes both X and y during fitting.",
          "imbalanced-learn provides Pipeline support designed to integrate samplers with preprocessing and estimators.",
          "This allows cross-validation to execute resampling separately inside each training fold.",
          "Using the correct pipeline abstraction reduces leakage risk."
        ],
        intuition: [
          "The pipeline must understand that a resampler changes the training examples themselves."
        ],
        importantPoints: [
          "Use sampler-aware Pipeline.",
          "Supports fold-safe resampling.",
          "Do not resample globally before CV."
        ]
      },

      {
        id: "imbalance-threshold",
        title: "Class Imbalance and Decision Thresholds",
        explanation: [
          "Training strategy and decision threshold are separate controls.",
          "A classifier may rank rare positives effectively but use a default threshold that produces insufficient recall.",
          "Threshold tuning can adjust the precision-recall trade-off without necessarily retraining the underlying estimator.",
          "Threshold selection should use validation data and real error costs."
        ],
        intuition: [
          "The model may know which observations are risky while the decision cutoff is simply too strict."
        ],
        importantPoints: [
          "Training and thresholding differ.",
          "Tune thresholds on development data.",
          "Connect threshold to costs."
        ]
      },

      {
        id: "imbalance-cost-sensitive",
        title: "Cost-Sensitive Learning",
        explanation: [
          "Imbalanced frequency and asymmetric error cost are related but not identical concepts.",
          "A rare class is not automatically the more costly class to misclassify.",
          "Cost-sensitive learning explicitly gives different consequences to different errors.",
          "Class weights, sample weights and decision thresholds are among the mechanisms that can reflect asymmetric priorities."
        ],
        intuition: [
          "Frequency tells us how often something occurs; cost tells us how painful a mistake is."
        ],
        importantPoints: [
          "Imbalance does not equal cost.",
          "Use domain-specific error consequences.",
          "Optimize the decision objective."
        ]
      },

      {
        id: "imbalance-ensemble",
        title: "Ensemble Strategies for Imbalanced Data",
        explanation: [
          "Ensemble methods can combine imbalance handling with multiple learners.",
          "Balanced Random Forest-style approaches can construct trees using class-balanced sampling strategies.",
          "EasyEnsemble-style methods can train ensembles using multiple majority-class subsets.",
          "These approaches attempt to use ensemble diversity while reducing majority dominance.",
          "Their specific parameters belong to their corresponding algorithms and should be tuned separately."
        ],
        intuition: [
          "Instead of discarding one majority subset permanently, different learners can see different balanced views of the data."
        ],
        importantPoints: [
          "Sampling can be integrated with ensembles.",
          "Can preserve more majority information across learners.",
          "Benchmark against simpler strategies."
        ]
      },

      {
        id: "imbalance-xgboost-note",
        title: "Imbalance Controls in Specific Models",
        explanation: [
          "Some model families provide their own mechanisms for handling class imbalance.",
          "For example, XGBoost can use scale_pos_weight for binary imbalance.",
          "Compatible sklearn estimators may support class_weight.",
          "These parameters belong to their respective models and should not be assumed to exist in unrelated estimators.",
          "The correct mechanism must therefore be chosen from the actual estimator API."
        ],
        intuition: [
          "Different models provide different knobs; never copy an imbalance parameter from one algorithm into another."
        ],
        importantPoints: [
          "Parameters are model-specific.",
          "Check estimator API.",
          "Do not mix class_weight and scale_pos_weight across unrelated models."
        ]
      },

      {
        id: "imbalance-anomaly",
        title: "Extreme Imbalance and Anomaly Detection",
        explanation: [
          "When positive events are extraordinarily rare, ordinary supervised classification may become difficult because very few positive examples are available.",
          "In some problems, anomaly-detection or novelty-detection formulations may be considered.",
          "These approaches make different assumptions from supervised imbalanced classification.",
          "They should not automatically replace classification when reliable labeled minority examples exist."
        ],
        intuition: [
          "When examples of the rare event are almost unavailable, learning what normal looks like can sometimes become part of the strategy."
        ],
        importantPoints: [
          "Extreme rarity changes the problem.",
          "Anomaly detection is a different formulation.",
          "Choose based on available labels and assumptions."
        ]
      },

      {
        id: "imbalance-multiclass",
        title: "Multiclass Imbalance",
        explanation: [
          "Imbalance can involve more than one minority class.",
          "One class may dominate while several smaller classes have different frequencies.",
          "Macro, weighted and per-class metrics become especially important.",
          "Resampling strategies must specify which classes are modified and by how much.",
          "A single binary-style minority-majority interpretation may be insufficient."
        ],
        intuition: [
          "Instead of one rare class, imagine several classes each receiving very different amounts of training data."
        ],
        importantPoints: [
          "Inspect every class.",
          "Use multiclass-aware metrics.",
          "Resampling strategy becomes more complex."
        ]
      },

      {
        id: "imbalance-macro-weighted",
        title: "Macro vs Weighted Metrics",
        explanation: [
          "Macro averaging computes a metric independently for each class and then gives classes equal weight.",
          "Weighted averaging also computes class-specific metrics but weights them according to class support.",
          "Weighted averages can therefore be dominated by majority classes.",
          "Macro metrics can expose poor minority performance more strongly."
        ],
        intuition: [
          "Macro gives every class one vote; weighted averaging gives larger classes more voting power."
        ],
        importantPoints: [
          "Macro treats classes equally.",
          "Weighted reflects support.",
          "Report per-class metrics when important."
        ]
      },

      {
        id: "imbalance-micro",
        title: "Micro Averaging",
        explanation: [
          "Micro averaging aggregates contributions from all classes before calculating the metric.",
          "It therefore gives more influence to classes contributing more observations.",
          "In heavily imbalanced multiclass problems, micro metrics can hide weak performance on rare classes.",
          "Macro and per-class results often provide important additional context."
        ],
        intuition: [
          "Micro averaging counts individual decisions globally, so large classes naturally dominate."
        ],
        importantPoints: [
          "Aggregates globally.",
          "Can hide minority weakness.",
          "Compare with macro and per-class metrics."
        ]
      },

      {
        id: "imbalance-small-minority",
        title: "Very Small Minority Classes",
        explanation: [
          "When the minority class contains very few observations, both training and evaluation become unstable.",
          "Cross-validation folds may contain only a handful of minority examples.",
          "SMOTE neighborhood settings can become infeasible.",
          "Metric estimates can have high variance.",
          "Collecting additional genuine minority observations can be more valuable than sophisticated resampling."
        ],
        intuition: [
          "Synthetic methods cannot fully replace missing real evidence."
        ],
        importantPoints: [
          "Small minority counts create instability.",
          "Sampler parameters may become infeasible.",
          "Real data collection can be crucial."
        ]
      },

      {
        id: "imbalance-label-noise",
        title: "Label Noise Is Especially Dangerous",
        explanation: [
          "Rare classes contain relatively few observations, so incorrectly labeled minority examples can have disproportionate influence.",
          "Oversampling can duplicate noisy observations.",
          "SMOTE can generate synthetic observations around mislabeled minority points.",
          "Data-quality review is therefore especially important before aggressive resampling."
        ],
        intuition: [
          "If a rare example is wrong and you copy or interpolate around it, you amplify the mistake."
        ],
        importantPoints: [
          "Inspect minority labels.",
          "Resampling can amplify noise.",
          "Data quality comes before complexity."
        ]
      },

      {
        id: "imbalance-overlap",
        title: "Class Overlap vs Class Imbalance",
        explanation: [
          "A dataset can be imbalanced yet easy if classes are well separated.",
          "A moderately imbalanced dataset can be extremely difficult if classes overlap heavily.",
          "Resampling cannot automatically create information that separates inherently overlapping classes.",
          "Difficulty therefore depends on geometry and noise as well as frequency."
        ],
        intuition: [
          "Rare does not always mean difficult, and balanced does not always mean easy."
        ],
        importantPoints: [
          "Frequency is only one factor.",
          "Class overlap matters.",
          "Inspect feature separability."
        ]
      },

      {
        id: "imbalance-prevalence-shift",
        title: "Prevalence Shift After Deployment",
        explanation: [
          "The proportion of positive events can change after deployment.",
          "This can substantially change precision even if conditional model behavior remains similar.",
          "Thresholds and calibrated probabilities may therefore require monitoring.",
          "Production evaluation should track both class prevalence and operational metrics."
        ],
        intuition: [
          "A fraud detector deployed during a fraud surge operates in a different prevalence environment than during training."
        ],
        importantPoints: [
          "Monitor class ratios.",
          "Precision can change with prevalence.",
          "Revisit thresholds when necessary."
        ]
      },

      {
        id: "imbalance-probability-calibration",
        title: "Imbalance and Probability Calibration",
        explanation: [
          "Resampling changes the class distribution seen during training.",
          "This can influence the probability estimates produced by some models.",
          "A model trained on artificially balanced data should not automatically be assumed to output probabilities matching real-world prevalence.",
          "When probabilities are operationally important, calibration should be evaluated on data representing the intended population."
        ],
        intuition: [
          "Changing the training world's class ratio can change the model's idea of how common an event is."
        ],
        importantPoints: [
          "Resampling can affect probability interpretation.",
          "Evaluate calibration.",
          "Use representative validation data."
        ]
      },

      {
        id: "imbalance-baseline",
        title: "Always Build an Imbalance-Aware Baseline",
        explanation: [
          "Begin with a simple leakage-safe model and meaningful metrics.",
          "Compare class weighting, threshold tuning and resampling against this baseline.",
          "Complex synthetic methods should demonstrate measurable improvement rather than being included automatically.",
          "The simplest strategy satisfying the operational objective is often preferable."
        ],
        intuition: [
          "Do not use SMOTE merely because the dataset is imbalanced."
        ],
        importantPoints: [
          "Start simple.",
          "Measure improvement.",
          "Complexity must earn its place."
        ]
      },

      {
        id: "imbalance-comparison-workflow",
        title: "How to Compare Imbalance Strategies Fairly",
        explanation: [
          "Use the same cross-validation splits for candidate strategies.",
          "Keep preprocessing inside leakage-safe Pipelines.",
          "Apply resampling only within training folds.",
          "Evaluate all candidates using the same application-relevant metrics.",
          "Compare score means, variability, confusion matrices and operational consequences.",
          "Keep the final test set untouched."
        ],
        intuition: [
          "Every imbalance strategy should sit the same exam."
        ],
        importantPoints: [
          "Same folds.",
          "Same metrics.",
          "Fold-safe resampling.",
          "Final test independence."
        ]
      },

      {
        id: "imbalance-tuning",
        title: "What Should Be Tuned?",
        explanation: [
          "Possible development decisions include class weights, resampling amount, sampler neighborhood settings, model hyperparameters and decision threshold.",
          "These controls should not all be treated as belonging to the same algorithm.",
          "Sampler parameters configure data generation or selection.",
          "Estimator parameters configure the predictive model.",
          "Threshold parameters configure the final decision policy."
        ],
        intuition: [
          "There are three different systems to tune: the training data, the model and the decision rule."
        ],
        importantPoints: [
          "Sampler parameters.",
          "Estimator parameters.",
          "Threshold policy.",
          "Keep their roles separate."
        ]
      },

      {
        id: "imbalance-grid-search",
        title: "Joint Tuning with a Resampling Pipeline",
        explanation: [
          "A sampler and estimator can be placed inside an imbalanced-learn Pipeline.",
          "Cross-validation search can then evaluate sampler and estimator settings without resampling validation folds.",
          "Pipeline parameter paths keep sampler parameters separate from estimator parameters.",
          "The search metric should reflect the actual imbalanced-learning objective."
        ],
        intuition: [
          "Tune the entire training workflow while keeping every validation fold untouched."
        ],
        importantPoints: [
          "Use sampler-aware Pipeline.",
          "Tune inside CV.",
          "Choose an imbalance-appropriate scorer."
        ]
      },

      {
        id: "imbalance-computation",
        title: "Computational Trade-offs",
        explanation: [
          "Oversampling increases the number of training observations and can increase fitting time and memory use.",
          "Undersampling decreases training size and can make expensive models faster.",
          "Synthetic neighborhood-based methods add their own computation.",
          "The statistical benefit should be considered together with training cost."
        ],
        intuition: [
          "Balancing the data also changes how much data the algorithm must process."
        ],
        importantPoints: [
          "Oversampling can increase cost.",
          "Undersampling can reduce cost.",
          "Synthetic sampling adds computation."
        ]
      },

      {
        id: "imbalance-real-world-fraud",
        title: "Example: Fraud Detection",
        explanation: [
          "Fraud transactions can represent a tiny fraction of all transactions.",
          "A majority-only model can therefore achieve extremely high accuracy while providing no fraud-detection value.",
          "Recall measures detected fraud while precision indicates how many alerts are actually fraudulent.",
          "Threshold selection must also consider investigator capacity and the cost of missed fraud."
        ],
        intuition: [
          "The system needs useful alerts, not impressive accuracy."
        ],
        importantPoints: [
          "Rare positives.",
          "Precision-recall trade-off.",
          "Operational capacity matters."
        ]
      },

      {
        id: "imbalance-real-world-medical",
        title: "Example: Medical Screening",
        explanation: [
          "A serious disease may be rare in a screening population.",
          "Missing a positive patient can carry much greater cost than performing an additional follow-up test.",
          "This can make recall or sensitivity especially important.",
          "However, extremely low precision can overwhelm healthcare resources and create unnecessary interventions.",
          "The appropriate operating point must reflect clinical consequences."
        ],
        intuition: [
          "Catch dangerous cases while keeping unnecessary follow-ups manageable."
        ],
        importantPoints: [
          "False-negative cost can be high.",
          "False positives still matter.",
          "Clinical context determines threshold."
        ]
      },

      {
        id: "imbalance-real-world-failure",
        title: "Example: Equipment Failure Prediction",
        explanation: [
          "Failures may be rare compared with normal machine operation.",
          "Missing an impending failure can cause expensive downtime.",
          "Too many false alarms can also create unnecessary maintenance.",
          "The useful model therefore balances detection against intervention cost."
        ],
        intuition: [
          "A warning system is useful only when it catches failures without constantly stopping healthy machines."
        ],
        importantPoints: [
          "Rare-event prediction.",
          "Asymmetric costs.",
          "Threshold policy matters."
        ]
      },

      {
        id: "imbalance-failure-diagnosis",
        title: "Imbalanced Learning Failure Diagnosis",
        explanation: [
          "High accuracy with very low minority recall suggests majority-class dominance.",
          "High recall with extremely poor precision suggests excessive false alarms.",
          "Excellent cross-validation but weak test performance can indicate leakage or distribution mismatch.",
          "SMOTE performing poorly can indicate overlap, noise, unsuitable feature representation or inappropriate neighborhood settings.",
          "Unstable metrics can indicate too few minority observations."
        ],
        intuition: [
          "The metric pattern tells you which part of the imbalance workflow should be investigated."
        ],
        importantPoints: [
          "Diagnose from multiple metrics.",
          "Inspect leakage.",
          "Inspect minority sample count.",
          "Inspect data geometry."
        ]
      },

      {
        id: "imbalance-common-mistakes-deep",
        title: "Common Imbalanced-Learning Mistakes",
        explanation: [
          "Using accuracy as the only metric.",
          "Resampling before train-test splitting.",
          "Resampling validation or test data.",
          "Applying SMOTE automatically to every imbalanced dataset.",
          "Ignoring feature scaling for distance-based synthetic sampling.",
          "Using ordinary SMOTE blindly with inappropriate categorical representations.",
          "Assuming a 50:50 training distribution is always optimal.",
          "Ignoring threshold tuning.",
          "Confusing class frequency with error cost.",
          "Reporting only one aggregate metric."
        ],
        intuition: [
          "Imbalance requires a complete evaluation strategy, not one magic resampling algorithm."
        ],
        importantPoints: [
          "Metric.",
          "Leakage.",
          "Sampling.",
          "Feature representation.",
          "Threshold.",
          "Cost."
        ]
      },

      {
        id: "imbalance-complete-workflow",
        title: "Complete Imbalanced Learning Workflow",
        explanation: [
          "Measure class frequencies and minority sample count.",
          "Understand false-positive and false-negative costs.",
          "Choose a leakage-safe validation strategy.",
          "Build a simple baseline.",
          "Evaluate confusion matrices and relevant class-specific metrics.",
          "Try class weighting when supported.",
          "Evaluate threshold adjustment.",
          "Evaluate simple over- or under-sampling when justified.",
          "Evaluate SMOTE or specialized samplers only when feature geometry supports them.",
          "Keep all learned preprocessing and resampling inside training folds.",
          "Compare strategies on identical validation splits.",
          "Evaluate the finalized workflow once on untouched test data."
        ],
        intuition: [
          "Start from the decision problem, not from SMOTE."
        ],
        importantPoints: [
          "Measure.",
          "Choose metrics.",
          "Validate safely.",
          "Start simple.",
          "Compare strategies.",
          "Tune threshold.",
          "Final test."
        ]
      },

      {
        id: "imbalance-exam-interview",
        title: "Imbalanced Learning: Exam and Interview Essentials",
        explanation: [
          "Define class imbalance.",
          "Explain why accuracy can fail.",
          "Explain precision, recall, specificity, F1 and balanced accuracy.",
          "Explain ROC-AUC versus Precision-Recall analysis.",
          "Explain class weighting.",
          "Compare oversampling and undersampling.",
          "Explain SMOTE mathematically and intuitively.",
          "Explain sampling_strategy and k_neighbors.",
          "Explain why SMOTE can fail with overlap or noise.",
          "Explain resampling leakage.",
          "Explain why resampling belongs inside training folds.",
          "Explain stratified validation.",
          "Explain cost-sensitive learning.",
          "Explain threshold tuning.",
          "Explain multiclass imbalance.",
          "Explain why class prevalence affects precision.",
          "Describe a complete leakage-safe imbalanced-learning workflow."
        ],
        intuition: [
          "A strong answer connects rare-class frequency, error costs, training strategy, validation design and decision threshold."
        ],
        importantPoints: [
          "Metrics.",
          "Class weights.",
          "Sampling.",
          "SMOTE.",
          "Leakage.",
          "Threshold.",
          "Costs.",
          "Validation."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "imbalanced-learning-resampling-lab",
      title: "Imbalanced Learning Lab",
      description:
        "Change class ratios and compare accuracy, precision, recall, PR curves, class weighting, random resampling and synthetic oversampling."
    },

    codeExamples: [
      {
        id: "imbalance-weight-code",
        title: "Class-Weighted Logistic Regression",
        description:
          "Give minority-class errors additional importance.",
        language: "python",
        code: `from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = make_classification(
    n_samples=5000,
    n_features=20,
    weights=[
        0.95,
        0.05
    ],
    random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "classifier",
        LogisticRegression(
            class_weight="balanced",
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

print(
    classification_report(
        y_test,
        predictions
    )
)`,
        explanation: [
          "The synthetic dataset contains a minority class.",
          "Stratified splitting preserves target proportions.",
          "class_weight='balanced' increases the influence of minority-class errors."
        ],
        commonMistakes: [
          "Evaluating only accuracy.",
          "Oversampling before splitting.",
          "Assuming balancing always improves every metric."
        ]
      }
    ],

    practice: [
      {
        id: "imbalance-practice-1",
        title: "99% Accuracy",
        type: "analysis",
        difficulty: "basic",
        question:
          "Why can 99% accuracy be useless when only 1% of observations are positive?",
        instructions: ["Consider predicting the majority class always."],
        hints: ["The model could miss every positive."],
        explanation:
          "A majority-only classifier would achieve 99% accuracy while having zero recall for the positive class."
      },
      {
        id: "imbalance-practice-2",
        title: "Class Weight",
        type: "concept",
        difficulty: "medium",
        question:
          "Does class weighting necessarily create additional minority observations?",
        instructions: ["Separate objective weighting from resampling."],
        hints: ["The dataset can remain unchanged."],
        explanation:
          "No. Class weighting changes the importance of errors during optimization without necessarily changing the number of observations."
      },
      {
        id: "imbalance-practice-3",
        title: "SMOTE Leakage",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why should SMOTE not be applied to the entire dataset before train/test splitting?",
        instructions: ["Think evaluation independence."],
        hints: ["Synthetic training information can involve future validation/test observations."],
        explanation:
          "Generating synthetic observations before splitting allows information from eventual evaluation observations to influence training-data construction, contaminating the evaluation."
      }
    ],

    keyTakeaways: [
      "Class imbalance can make accuracy misleading.",
      "Precision and recall expose minority-class behavior.",
      "Class weighting changes training importance.",
      "Oversampling and undersampling modify training distribution.",
      "SMOTE creates synthetic minority observations.",
      "Resampling must occur only inside training data.",
      "Validation strategy and metric selection are essential."
    ]
  },

  // =========================================================
  // 8. MODEL INTERPRETABILITY
  // =========================================================
  "model-interpretability": {
    overview:
      "Model interpretability helps humans understand how predictive systems use features and why predictions change. Interpretation can be global or local and can use model-specific or model-agnostic methods. Feature importance, coefficients, permutation importance, partial dependence and local explanation methods each answer different questions.",

    objectives: [
      "Understand global and local explanations.",
      "Interpret linear-model coefficients carefully.",
      "Understand tree feature importance.",
      "Understand permutation importance.",
      "Understand partial dependence conceptually.",
      "Recognize correlation and causality limitations.",
      "Avoid overclaiming explanations."
    ],

    sections: [
      {
        id: "interpret-global-local",
        title: "Global vs Local Interpretability",
        explanation: [
          "Global interpretation describes overall model behavior.",
          "Local interpretation explains an individual prediction.",
          "The two can answer different questions and should not be confused."
        ],
        intuition: [
          "Global asks how the model behaves generally. Local asks why this specific case received this prediction."
        ],
        importantPoints: [
          "Global and local explanations are different.",
          "Choose the explanation method based on the question."
        ]
      },

      {
        id: "interpret-linear",
        title: "Linear Model Coefficients",
        explanation: [
          "Linear-model coefficients describe changes in the model output associated with features under the model's representation.",
          "Coefficient magnitude depends on feature scale.",
          "Correlated features can complicate interpretation.",
          "A coefficient is not automatically evidence of causality."
        ],
        intuition: [
          "The model describes associations used for prediction, not necessarily real-world cause and effect."
        ],
        importantPoints: [
          "Feature scaling affects coefficient magnitude.",
          "Correlation can destabilize interpretation.",
          "Prediction does not establish causation."
        ]
      },

      {
        id: "interpret-tree",
        title: "Tree Feature Importance",
        explanation: [
          "Tree models can provide impurity-based feature importance.",
          "These values summarize how features contributed to impurity reduction across fitted trees.",
          "They can be biased toward certain feature structures and should not be treated as universal truth."
        ],
        intuition: [
          "Importance tells us how useful a feature was to the fitted model, not whether the feature causes the target."
        ],
        importantPoints: [
          "Feature importance is model-dependent.",
          "High importance is not causal evidence."
        ]
      },

      {
        id: "interpret-permutation",
        title: "Permutation Importance",
        explanation: [
          "Permutation importance measures how model performance changes when one feature's values are shuffled.",
          "If shuffling a feature substantially damages performance, the fitted model depends on information from that feature.",
          "Strongly correlated features can complicate this interpretation because one feature may substitute for another."
        ],
        intuition: [
          "Break one feature and observe how much the model suffers."
        ],
        importantPoints: [
          "Permutation importance is model-agnostic.",
          "Evaluate it on appropriate held-out data.",
          "Correlation can distribute importance across related features."
        ]
      },

      {
        id: "interpret-causality",
        title: "Interpretation Is Not Causality",
        explanation: [
          "Machine-learning explanations describe the fitted predictive model.",
          "They do not prove that changing a feature would cause the target to change.",
          "Causal conclusions require stronger assumptions and experimental or causal methods."
        ],
        intuition: [
          "A model can rely strongly on an umbrella feature when predicting rain without umbrellas causing rain."
        ],
        importantPoints: [
          "Prediction and causation are different.",
          "Do not present feature importance as causal effect."
        ]
      },
            {
        id: "interpret-why",
        title: "Why Model Interpretability Matters",
        explanation: [
          "Predictive performance answers whether a model predicts well, while interpretability investigates how the fitted model reaches its predictions.",
          "Interpretability can support debugging, trust, scientific investigation, feature validation, regulatory review and communication with stakeholders.",
          "The required level of explanation depends on the application.",
          "A low-risk recommendation system and a high-stakes clinical model may require very different explanation standards."
        ],
        intuition: [
          "Accuracy tells us whether the machine works; interpretation helps us inspect what the machine learned."
        ],
        importantPoints: [
          "Interpretability has multiple purposes.",
          "Explanation requirements are application-specific.",
          "Interpretability does not replace predictive evaluation."
        ]
      },

      {
        id: "interpret-intrinsic-posthoc",
        title: "Intrinsic vs Post-hoc Interpretability",
        explanation: [
          "Some models are relatively interpretable from their fitted structure, such as small decision trees or appropriately specified linear models.",
          "This is often called intrinsic interpretability.",
          "Post-hoc interpretation methods analyze an already fitted model after training.",
          "Permutation importance, partial dependence and SHAP-style methods are examples of post-hoc approaches.",
          "A post-hoc explanation describes aspects of model behavior but does not make the underlying model intrinsically simple."
        ],
        intuition: [
          "One machine can be transparent by design; another can require diagnostic tools to inspect it afterward."
        ],
        importantPoints: [
          "Intrinsic and post-hoc interpretation differ.",
          "Post-hoc explanation does not simplify the original model.",
          "Choose methods according to the question."
        ]
      },

      {
        id: "interpret-model-specific-agnostic",
        title: "Model-Specific vs Model-Agnostic Methods",
        explanation: [
          "Model-specific methods exploit the internal structure of a particular model family.",
          "Linear coefficients and tree impurity importance are model-specific examples.",
          "Model-agnostic methods can operate on many estimators by examining inputs and predictions.",
          "Permutation importance and many local explanation approaches are model-agnostic.",
          "Model-agnostic flexibility can come with additional computational cost or approximation."
        ],
        intuition: [
          "Some explanations open the machine and inspect its parts; others study the machine only through its inputs and outputs."
        ],
        importantPoints: [
          "Model-specific methods use internal structure.",
          "Model-agnostic methods work across model families.",
          "Each approach has trade-offs."
        ]
      },

      {
        id: "interpret-global-deep",
        title: "Global Interpretation",
        explanation: [
          "Global interpretation studies the overall behavior of a fitted model across many observations.",
          "Typical questions include which features the model relies on, how predictions change as a feature changes and which interactions appear important.",
          "Global explanations summarize behavior and can hide important differences between individual observations or subgroups."
        ],
        intuition: [
          "Global interpretation asks for the model's overall strategy."
        ],
        importantPoints: [
          "Describes broad behavior.",
          "Useful for model understanding.",
          "Can hide local variation."
        ]
      },

      {
        id: "interpret-local-deep",
        title: "Local Interpretation",
        explanation: [
          "Local interpretation studies one prediction or a small region of the input space.",
          "It asks why a particular observation received its prediction.",
          "A feature that is globally important may contribute little to one specific prediction.",
          "Likewise, a globally weak feature can sometimes matter strongly for a particular case."
        ],
        intuition: [
          "Global asks what the model usually does; local asks what happened here."
        ],
        importantPoints: [
          "Explains individual predictions.",
          "Local and global importance can differ.",
          "Do not generalize one local explanation to the whole model."
        ]
      },

      {
        id: "interpret-linear-equation",
        title: "Linear Models as Interpretable Functions",
        explanation: [
          "A linear model commonly represents prediction using a weighted combination of features plus an intercept.",
          "For regression, a simplified form is y_hat = b0 + b1*x1 + ... + bp*xp.",
          "Holding other modeled features fixed, a one-unit increase in xj changes the predicted output by coefficient bj.",
          "The interpretation depends on feature representation, preprocessing and model specification."
        ],
        intuition: [
          "Each feature contributes through a learned weight, but the meaning of one unit depends on how that feature was encoded."
        ],
        importantPoints: [
          "Coefficients belong to the model representation.",
          "Units matter.",
          "Preprocessing affects interpretation."
        ]
      },

      {
        id: "interpret-coefficient-sign",
        title: "Coefficient Sign",
        explanation: [
          "A positive linear-regression coefficient means the fitted prediction increases as that feature increases while modeled alternatives are held fixed.",
          "A negative coefficient means the fitted prediction decreases.",
          "For logistic regression, coefficients operate on the model's log-odds scale rather than directly representing probability changes.",
          "Coefficient signs describe the fitted predictive relationship, not causal effects."
        ],
        intuition: [
          "The sign shows the direction the fitted model pushes its output."
        ],
        importantPoints: [
          "Positive and negative signs indicate modeled direction.",
          "Logistic coefficients act on log-odds.",
          "Association is not causation."
        ]
      },

      {
        id: "interpret-logistic-odds",
        title: "Logistic Regression Coefficients and Odds Ratios",
        explanation: [
          "In binary logistic regression, a coefficient represents change in log-odds associated with a one-unit feature increase under the fitted model.",
          "Exponentiating a coefficient gives an odds ratio.",
          "An odds ratio above 1 corresponds to increasing modeled odds, while below 1 corresponds to decreasing modeled odds.",
          "Interpretation still depends on scaling, encoding, correlated predictors and model specification."
        ],
        intuition: [
          "Logistic coefficients change odds multiplicatively after exponentiation."
        ],
        importantPoints: [
          "Coefficient operates on log-odds.",
          "exp(coefficient) gives an odds ratio.",
          "Do not confuse odds with probability."
        ]
      },

      {
        id: "interpret-scaling",
        title: "Why Feature Scaling Changes Coefficient Magnitudes",
        explanation: [
          "Coefficient magnitude depends on the unit used for a feature.",
          "A feature measured in meters and the same feature measured in millimeters require different numerical coefficients.",
          "Standardization changes the feature scale and therefore changes coefficient magnitude.",
          "Comparing raw coefficient magnitudes across differently scaled features can therefore be misleading."
        ],
        intuition: [
          "Changing the ruler changes the numerical weight even when the underlying relationship is similar."
        ],
        importantPoints: [
          "Magnitude depends on units.",
          "Scaling affects coefficients.",
          "Compare coefficients carefully."
        ]
      },

      {
        id: "interpret-onehot",
        title: "Interpreting Encoded Categorical Features",
        explanation: [
          "Categorical variables are often represented using indicator or one-hot features.",
          "The meaning of a coefficient then depends on the reference representation and encoding scheme.",
          "Individual encoded columns should be interpreted as parts of the original categorical feature rather than unrelated variables.",
          "Preprocessing metadata is therefore important for human-readable explanations."
        ],
        intuition: [
          "The model sees encoded columns, while the user thinks in terms of the original category."
        ],
        importantPoints: [
          "Encoding affects interpretation.",
          "Reference categories matter.",
          "Map transformed features back to original meaning."
        ]
      },

      {
        id: "interpret-correlation",
        title: "Correlated Features Complicate Interpretation",
        explanation: [
          "When multiple features contain similar information, a model can distribute predictive responsibility across them.",
          "Linear coefficients can become unstable or change substantially when correlated predictors are added or removed.",
          "Permutation importance can underestimate a feature when another correlated feature can substitute for it.",
          "Feature importance should therefore be interpreted in the context of correlation structure."
        ],
        intuition: [
          "When two students can perform the same job, removing one may not hurt because the other substitutes for them."
        ],
        importantPoints: [
          "Correlation redistributes apparent importance.",
          "Importance can be unstable.",
          "Inspect related features together."
        ]
      },

      {
        id: "interpret-tree-importance-math",
        title: "Impurity-Based Tree Importance",
        explanation: [
          "Decision trees choose splits that reduce an impurity or error criterion.",
          "Impurity-based feature importance aggregates the weighted reduction associated with splits using each feature.",
          "Random forests aggregate this information across many trees.",
          "A high value means the fitted trees frequently obtained useful impurity reduction from that feature.",
          "It does not mean the feature causes the target."
        ],
        intuition: [
          "Measure how much each feature helped the trees create cleaner child nodes."
        ],
        importantPoints: [
          "Based on fitted tree splits.",
          "Model-specific.",
          "Not causal evidence."
        ]
      },

      {
        id: "interpret-tree-bias",
        title: "Limitations of Impurity Feature Importance",
        explanation: [
          "Impurity-based importance can favor features offering many possible split points.",
          "High-cardinality or continuous features can therefore receive misleadingly large importance in some settings.",
          "Training-derived importance can also reflect patterns that do not generalize.",
          "Held-out permutation importance provides a useful complementary diagnostic."
        ],
        intuition: [
          "A feature with more opportunities to split can receive more chances to look useful."
        ],
        importantPoints: [
          "Importance can be biased.",
          "High cardinality deserves caution.",
          "Compare with held-out methods."
        ]
      },

      {
        id: "interpret-permutation-algorithm",
        title: "Permutation Importance Step by Step",
        explanation: [
          "First measure the fitted model's baseline score on an evaluation dataset.",
          "Then shuffle one feature while leaving other columns unchanged.",
          "Measure model performance again.",
          "The decrease in performance estimates how strongly the fitted model relied on information in that feature.",
          "Repeating the shuffle reduces dependence on one random permutation."
        ],
        intuition: [
          "Break one column, keep the rest intact and measure how much predictive ability disappears."
        ],
        importantPoints: [
          "Measure baseline.",
          "Shuffle one feature.",
          "Measure score drop.",
          "Repeat for stability."
        ]
      },

      {
        id: "interpret-permutation-heldout",
        title: "Why Permutation Importance Should Use Held-Out Data",
        explanation: [
          "Permutation importance computed on training data describes dependence relative to training performance.",
          "An overfit model may rely strongly on features that do not generalize.",
          "Computing importance on appropriate validation or test-like held-out data better describes features supporting generalizable predictive performance.",
          "The evaluation set must still be used according to the broader model-selection protocol."
        ],
        intuition: [
          "Ask which features help on unseen questions, not only which features helped memorize practice questions."
        ],
        importantPoints: [
          "Held-out importance is often more informative.",
          "Training importance can reflect overfitting.",
          "Protect final evaluation procedures."
        ]
      },

      {
        id: "interpret-permutation-scoring",
        title: "Permutation Importance Depends on the Metric",
        explanation: [
          "Permutation importance measures the decrease in a chosen evaluation score.",
          "A feature can appear more important for one metric than another.",
          "For example, a feature supporting minority-class recall may matter differently under recall than under accuracy.",
          "The scoring metric should therefore reflect the actual prediction objective."
        ],
        intuition: [
          "Importance means important for achieving a particular goal."
        ],
        importantPoints: [
          "Importance is metric-dependent.",
          "Choose meaningful scoring.",
          "Do not treat importance as universal."
        ]
      },

      {
        id: "interpret-permutation-params",
        title: "sklearn permutation_importance Controls",
        explanation: [
          "n_repeats controls how many random permutations are evaluated for each feature.",
          "scoring controls the metric used to measure performance decrease.",
          "random_state controls reproducibility of the permutations.",
          "n_jobs controls supported parallel computation.",
          "max_samples can limit the number of observations used per repeat in supported versions, trading computation against estimation precision.",
          "These configure the interpretation procedure, not the predictive model."
        ],
        intuition: [
          "Choose how often to break each feature, how to grade the damage and how much computation to spend."
        ],
        importantPoints: [
          "n_repeats affects stability and cost.",
          "scoring defines importance meaning.",
          "Interpretation parameters are not model hyperparameters."
        ]
      },

      {
        id: "interpret-pdp",
        title: "Partial Dependence Plot",
        explanation: [
          "Partial dependence estimates how model predictions change as one or more selected features vary while averaging over the distribution of other observed features.",
          "It provides a global view of the fitted model's response.",
          "Nonlinear shapes, plateaus and interactions can become visible.",
          "Partial dependence describes model behavior rather than causal effects."
        ],
        intuition: [
          "Move one feature through different values and average what the model predicts across the dataset."
        ],
        importantPoints: [
          "Global model-behavior tool.",
          "Can reveal nonlinear response.",
          "Not causal."
        ]
      },

      {
        id: "interpret-pdp-math",
        title: "Partial Dependence Intuition Mathematically",
        explanation: [
          "For a selected feature value, partial dependence replaces or evaluates that feature at the chosen value across observations.",
          "Predictions are generated while the remaining features retain their observed values.",
          "Those predictions are averaged.",
          "Repeating this across a grid produces the partial-dependence relationship."
        ],
        intuition: [
          "Ask what the model would predict on average if everyone were evaluated at the same selected feature value."
        ],
        importantPoints: [
          "Evaluate over a feature grid.",
          "Average predictions.",
          "Other observed features provide the background distribution."
        ]
      },

      {
        id: "interpret-pdp-correlation",
        title: "Partial Dependence and Correlated Features",
        explanation: [
          "Partial dependence can evaluate combinations of feature values that are rare or unrealistic when features are strongly correlated.",
          "This can make the resulting curve difficult to interpret.",
          "Feature dependence should therefore be inspected before making strong claims from PDPs.",
          "Alternative explanation methods can sometimes provide complementary views."
        ],
        intuition: [
          "Changing one feature while pretending its strongly related partner stayed unchanged can create unrealistic examples."
        ],
        importantPoints: [
          "Correlation can create unrealistic combinations.",
          "PDP assumes meaningful intervention-like feature grids only for model inspection.",
          "Interpret carefully."
        ]
      },

      {
        id: "interpret-ice",
        title: "Individual Conditional Expectation (ICE)",
        explanation: [
          "ICE plots show how predictions for individual observations change as a selected feature varies.",
          "Unlike partial dependence, which averages behavior, ICE preserves individual trajectories.",
          "Different trajectories can reveal heterogeneous model responses or interactions.",
          "A PDP can hide this variation because averaging compresses many curves into one."
        ],
        intuition: [
          "PDP shows the class average; ICE shows each student's individual path."
        ],
        importantPoints: [
          "Local trajectories across feature values.",
          "Can reveal heterogeneity.",
          "Complements PDP."
        ]
      },

      {
        id: "interpret-pdp-vs-ice",
        title: "PDP vs ICE",
        explanation: [
          "PDP summarizes average model response.",
          "ICE displays observation-level response curves.",
          "If ICE curves are similar, the PDP can provide a representative summary.",
          "If ICE curves differ substantially, the average PDP may hide important interactions or subgroup behavior."
        ],
        intuition: [
          "Average behavior is informative only when individual behavior is not radically different."
        ],
        importantPoints: [
          "PDP is averaged.",
          "ICE is individual.",
          "Use both when heterogeneity matters."
        ]
      },

      {
        id: "interpret-local-surrogate",
        title: "Local Surrogate Explanations",
        explanation: [
          "A local surrogate approximates a complex model near one prediction using a simpler interpretable model.",
          "The surrogate explains the approximation, not the entire original model.",
          "Explanation quality depends on how the local neighborhood is constructed and how faithfully the surrogate matches the original model there.",
          "LIME is a well-known example of this general idea."
        ],
        intuition: [
          "Build a small simple map around one location instead of trying to simplify the entire world."
        ],
        importantPoints: [
          "Local approximation.",
          "Fidelity matters.",
          "Do not treat local surrogate coefficients as global truth."
        ]
      },

      {
        id: "interpret-lime",
        title: "LIME Concept",
        explanation: [
          "LIME perturbs observations around a target instance, obtains predictions from the original model and fits an interpretable local surrogate weighted toward the target neighborhood.",
          "The resulting explanation describes which local features influenced the surrogate approximation.",
          "Results can depend on perturbation strategy, representation and neighborhood definition.",
          "LIME explanations should therefore be treated as approximate local diagnostics."
        ],
        intuition: [
          "Probe the black box around one example and fit a simpler explanation to what it does nearby."
        ],
        importantPoints: [
          "Model-agnostic.",
          "Local.",
          "Approximate.",
          "Sensitive to neighborhood construction."
        ]
      },

      {
        id: "interpret-counterfactual",
        title: "Counterfactual Explanations",
        explanation: [
          "A counterfactual asks what feature changes could alter a model's prediction to a desired outcome.",
          "For example, what minimal feasible changes would move an application from rejected to accepted according to the model?",
          "Useful counterfactuals should respect feasibility, immutable features and realistic relationships between variables.",
          "A mathematical change that fools the model is not automatically a valid real-world action."
        ],
        intuition: [
          "Instead of asking only why the prediction happened, ask what would need to be different for the model to decide differently."
        ],
        importantPoints: [
          "Action-oriented explanation.",
          "Feasibility matters.",
          "Respect immutable features."
        ]
      },

      {
        id: "interpret-interactions",
        title: "Feature Interactions",
        explanation: [
          "A feature interaction occurs when the effect of one feature on model predictions depends on another feature.",
          "Tree ensembles and other nonlinear models can learn complex interactions.",
          "Simple one-feature importance scores do not fully describe such behavior.",
          "PDP, ICE, SHAP interaction methods and domain-specific analyses can help investigate interactions."
        ],
        intuition: [
          "The importance of temperature may depend on humidity rather than acting independently."
        ],
        importantPoints: [
          "Effects can depend on other features.",
          "Single-feature summaries can be incomplete.",
          "Inspect interactions when relevant."
        ]
      },

      {
        id: "interpret-direction-vs-importance",
        title: "Importance Does Not Tell Direction",
        explanation: [
          "A feature-importance score often tells how strongly the model relies on a feature but not whether larger values increase or decrease predictions.",
          "Permutation importance is a clear example.",
          "Directional behavior requires additional tools such as coefficients, PDP, ICE or suitable local contribution methods.",
          "Do not infer direction from an importance magnitude alone."
        ],
        intuition: [
          "Knowing that a feature matters does not tell you which way it pushes the prediction."
        ],
        importantPoints: [
          "Importance and direction differ.",
          "Use the correct explanation tool.",
          "Avoid unsupported conclusions."
        ]
      },

      {
        id: "interpret-importance-not-causal",
        title: "Feature Importance Is Not Causal Importance",
        explanation: [
          "Predictive importance measures how the fitted model uses available information.",
          "A feature can be highly predictive because it is correlated with the true causal mechanism.",
          "Removing or changing that feature in the real world may not change the outcome.",
          "Causal claims require causal assumptions, experiments or dedicated causal-inference methods."
        ],
        intuition: [
          "An umbrella predicts rain but opening an umbrella does not cause rain."
        ],
        importantPoints: [
          "Prediction is association.",
          "Importance is model-dependent.",
          "Causality requires stronger evidence."
        ]
      },

      {
        id: "interpret-leakage",
        title: "Interpretability as a Leakage Detector",
        explanation: [
          "Unexpectedly dominant features can reveal data leakage.",
          "For example, a post-outcome variable may appear extremely important because it directly contains information unavailable at prediction time.",
          "Interpretation can therefore support debugging.",
          "However, a plausible-looking importance profile does not prove that leakage is absent."
        ],
        intuition: [
          "If the model relies on a feature it should never know at prediction time, interpretation can expose the mistake."
        ],
        importantPoints: [
          "Useful for debugging.",
          "Can reveal suspicious features.",
          "Does not replace leakage audits."
        ]
      },

      {
        id: "interpret-subgroups",
        title: "Interpretability Across Subgroups",
        explanation: [
          "Global explanations can hide different model behavior across important subgroups.",
          "Feature importance, response curves or error patterns can be compared across relevant groups when methodologically appropriate.",
          "Differences deserve investigation because they may reflect population structure, sampling differences, proxy variables or model instability.",
          "Interpretation should be combined with subgroup performance evaluation."
        ],
        intuition: [
          "An average explanation can hide that the model behaves differently for different populations."
        ],
        importantPoints: [
          "Inspect important subgroups.",
          "Combine explanation with performance.",
          "Investigate differences carefully."
        ]
      },

      {
        id: "interpret-stability",
        title: "Explanation Stability",
        explanation: [
          "An explanation can change when the training sample, random seed or fitted model changes.",
          "Highly unstable explanations should not be presented as fixed truths about the data-generating process.",
          "Stability can be investigated by refitting models or repeating interpretation across validation folds.",
          "Predictive stability and explanation stability are related but distinct properties."
        ],
        intuition: [
          "If the explanation changes completely every time the model is retrained, confidence in that explanation should be limited."
        ],
        importantPoints: [
          "Explanations can be unstable.",
          "Repeat analysis when important.",
          "Avoid overclaiming."
        ]
      },

      {
        id: "interpret-data-vs-model",
        title: "Explaining the Model Is Not Explaining the Dataset",
        explanation: [
          "Interpretation methods usually explain behavior of a fitted predictive model.",
          "The model can contain bias, regularization effects, approximation error and sampling artifacts.",
          "Therefore model explanations should not automatically be presented as universal truths about the underlying population.",
          "Exploratory data analysis and domain knowledge remain necessary."
        ],
        intuition: [
          "An explanation tells you what this trained machine learned, not necessarily how nature works."
        ],
        importantPoints: [
          "Model and reality differ.",
          "Training data shapes explanations.",
          "Use domain context."
        ]
      },

      {
        id: "interpret-preprocessing",
        title: "Interpretation After Preprocessing",
        explanation: [
          "Models frequently operate on transformed features rather than raw columns.",
          "Scaling, one-hot encoding, polynomial features, dimensionality reduction and feature selection can change explanation meaning.",
          "Interpretation systems should preserve mappings between transformed model inputs and human-readable source features.",
          "Otherwise explanations can become technically correct but practically unusable."
        ],
        intuition: [
          "Explain concepts in the language the user understands, not only in the internal representation used by the model."
        ],
        importantPoints: [
          "Track feature transformations.",
          "Map explanations back when possible.",
          "Pipeline context matters."
        ]
      },

      {
        id: "interpret-pca-caution",
        title: "Interpretability After PCA",
        explanation: [
          "PCA transforms original features into principal components.",
          "A downstream model then operates on combinations of original variables rather than directly on the original features.",
          "Interpreting model importance at the component level requires examining PCA loadings to understand which original features contribute to each component.",
          "Dimensionality reduction can therefore trade direct feature interpretability for compact representation."
        ],
        intuition: [
          "The model may say component 2 matters, but humans still need to know what component 2 represents."
        ],
        importantPoints: [
          "Components are transformed features.",
          "Use loadings for interpretation.",
          "Dimensionality reduction can reduce direct interpretability."
        ]
      },

      {
        id: "interpret-explanation-fidelity",
        title: "Explanation Fidelity",
        explanation: [
          "Fidelity describes how accurately an explanation represents the behavior of the original model.",
          "Exact model-specific explanations can have high fidelity to the fitted structure.",
          "Approximate local surrogate methods may sacrifice fidelity for simplicity.",
          "An explanation that is easy to understand but poorly matches the model can be misleading."
        ],
        intuition: [
          "A simple explanation is useful only if it actually describes what the model is doing."
        ],
        importantPoints: [
          "Simplicity and fidelity can trade off.",
          "Approximate explanations need validation.",
          "Do not prioritize appearance over correctness."
        ]
      },

      {
        id: "interpret-human-use",
        title: "Interpretability for Different Audiences",
        explanation: [
          "Data scientists may need technical debugging information.",
          "Domain experts may need feature-level reasoning.",
          "End users may need concise decision explanations.",
          "Auditors may require reproducible evidence about model behavior.",
          "The same explanation format is not optimal for every audience."
        ],
        intuition: [
          "Explain the same machine differently to its engineer, operator and customer."
        ],
        importantPoints: [
          "Audience matters.",
          "Purpose determines explanation.",
          "Technical detail should match the user."
        ]
      },

      {
        id: "interpret-method-selection",
        title: "Choosing an Interpretation Method",
        explanation: [
          "Use coefficients when the fitted linear representation and units support meaningful interpretation.",
          "Use tree importance for a quick model-specific summary but understand its biases.",
          "Use permutation importance to measure held-out predictive dependence.",
          "Use PDP for average response shapes.",
          "Use ICE when individual response heterogeneity matters.",
          "Use local or SHAP-style methods when individual prediction contributions are required."
        ],
        intuition: [
          "There is no universal explanation tool because different tools answer different questions."
        ],
        importantPoints: [
          "Start from the question.",
          "Match method to model and audience.",
          "Use complementary methods when necessary."
        ]
      },

      {
        id: "interpret-complete-workflow",
        title: "Complete Model Interpretation Workflow",
        explanation: [
          "First verify that the model has acceptable predictive performance.",
          "Define whether the explanation question is global or local.",
          "Choose a method appropriate for the estimator and question.",
          "Use appropriate held-out data where required.",
          "Inspect correlated features and preprocessing.",
          "Check explanation stability.",
          "Compare complementary interpretation methods.",
          "Validate findings with domain knowledge.",
          "Avoid causal claims unless causal evidence exists."
        ],
        intuition: [
          "Interpret a trustworthy model using a trustworthy explanation method, then communicate only what the evidence supports."
        ],
        importantPoints: [
          "Validate model first.",
          "Define explanation goal.",
          "Choose method.",
          "Check limitations.",
          "Communicate carefully."
        ]
      },

      {
        id: "interpret-common-mistakes",
        title: "Common Interpretability Mistakes",
        explanation: [
          "Treating feature importance as causality.",
          "Comparing coefficients without considering scale.",
          "Ignoring correlated predictors.",
          "Using training-only importance to make generalization claims.",
          "Assuming importance gives effect direction.",
          "Treating one local explanation as global behavior.",
          "Ignoring preprocessing transformations.",
          "Using unrealistic PDP combinations.",
          "Presenting unstable explanations as facts."
        ],
        intuition: [
          "An explanation can look convincing while answering a different question from the one you intended."
        ],
        importantPoints: [
          "Causality.",
          "Scale.",
          "Correlation.",
          "Generalization.",
          "Direction.",
          "Stability."
        ]
      },

      {
        id: "interpret-exam-interview",
        title: "Model Interpretability: Exam and Interview Essentials",
        explanation: [
          "Differentiate global and local interpretation.",
          "Differentiate intrinsic and post-hoc interpretability.",
          "Differentiate model-specific and model-agnostic methods.",
          "Explain linear coefficients and logistic odds ratios.",
          "Explain why scaling affects coefficient magnitude.",
          "Explain tree impurity importance and its limitations.",
          "Explain permutation importance step by step.",
          "Explain why correlation complicates importance.",
          "Explain PDP and ICE.",
          "Differentiate PDP and ICE.",
          "Explain local surrogate methods conceptually.",
          "Explain counterfactual explanations.",
          "Explain why predictive importance is not causality.",
          "Explain explanation fidelity and stability."
        ],
        intuition: [
          "A strong answer states what an interpretation method measures, what question it answers and what conclusions it cannot support."
        ],
        importantPoints: [
          "Global/local.",
          "Intrinsic/post-hoc.",
          "Coefficients.",
          "Tree importance.",
          "Permutation.",
          "PDP/ICE.",
          "Local explanations.",
          "Causality."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "model-interpretability-lab",
      title: "Model Interpretability Lab",
      description:
        "Compare coefficients, tree importance and permutation importance while exploring how scaling and correlated features change interpretation."
    },

    codeExamples: [
      {
        id: "permutation-importance-code",
        title: "Permutation Importance",
        description:
          "Measure how validation performance changes when features are shuffled.",
        language: "python",
        code: `from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

data = load_breast_cancer()

X = data.data
y = data.target

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

result = permutation_importance(
    model,
    X_test,
    y_test,
    n_repeats=10,
    random_state=42,
    scoring="accuracy"
)

importance = sorted(
    zip(
        data.feature_names,
        result.importances_mean
    ),
    key=lambda item: item[1],
    reverse=True
)

for feature, score in importance[:10]:
    print(
        feature,
        score
    )`,
        explanation: [
          "The model is fitted only on training data.",
          "Feature values are shuffled in held-out test data.",
          "Performance degradation estimates model dependence on each feature."
        ],
        commonMistakes: [
          "Calling feature importance causal.",
          "Calculating interpretation only on training data.",
          "Ignoring correlated features."
        ]
      }
    ],

    practice: [
      {
        id: "interpret-practice-1",
        title: "Global or Local",
        type: "concept",
        difficulty: "basic",
        question:
          "Does explaining one customer's prediction represent global or local interpretability?",
        instructions: ["Think individual prediction."],
        hints: ["One observation."],
        explanation:
          "It is local interpretability."
      },
      {
        id: "interpret-practice-2",
        title: "Permutation",
        type: "concept",
        difficulty: "medium",
        question:
          "What does permutation importance do to a feature?",
        instructions: ["Think destroying its useful relationship."],
        hints: ["Its values are shuffled."],
        explanation:
          "It shuffles the feature values and measures the resulting change in model performance."
      },
      {
        id: "interpret-practice-3",
        title: "Causality",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why does high feature importance not prove that the feature causes the target?",
        instructions: ["Separate prediction from intervention."],
        hints: ["Associations can arise from correlation and confounding."],
        explanation:
          "Importance describes how the fitted predictive model uses a feature. It does not establish what would happen under a real intervention on that feature."
      }
    ],

    keyTakeaways: [
      "Interpretability can be global or local.",
      "Different methods answer different explanation questions.",
      "Coefficients depend on representation and scale.",
      "Permutation importance measures performance dependence.",
      "Correlated features complicate interpretation.",
      "Feature importance is not causal evidence."
    ]
  },

  // =========================================================
  // 9. SHAP EXPLAINABILITY
  // =========================================================
  "shap-explainability": {
    overview:
      "SHAP is a model-explanation framework based on Shapley-value ideas from cooperative game theory. It assigns feature contributions to predictions relative to a reference or expected prediction. SHAP can provide local explanations and aggregate global views, but explanations remain descriptions of the fitted model rather than proof of causality.",

    objectives: [
      "Understand the intuition behind Shapley values.",
      "Understand SHAP feature contributions.",
      "Understand base values.",
      "Understand local SHAP explanations.",
      "Understand global SHAP summaries.",
      "Interpret positive and negative contributions.",
      "Recognize computational and causal limitations."
    ],

    sections: [
      {
        id: "shap-game",
        title: "Shapley Value Intuition",
        explanation: [
          "Shapley values originate from cooperative game theory.",
          "The idea is to distribute an outcome among contributors according to their marginal contributions across possible coalitions.",
          "SHAP adapts this idea to model features."
        ],
        intuition: [
          "If several players contributed to a team result, Shapley values provide a principled way to allocate credit among them."
        ],
        importantPoints: [
          "Features act like contributors.",
          "Contributions are evaluated relative to a reference prediction."
        ]
      },

      {
        id: "shap-local",
        title: "Local Explanation",
        explanation: [
          "For an individual observation, SHAP assigns a contribution value to each feature.",
          "Positive and negative values move the model output away from the reference in opposite directions.",
          "Together the contributions explain the difference between the reference output and the prediction under the SHAP formulation."
        ],
        intuition: [
          "Start from the model's reference prediction and observe how each feature pushes the output."
        ],
        importantPoints: [
          "SHAP can explain individual predictions.",
          "Contribution direction depends on the model-output representation."
        ]
      },

      {
        id: "shap-global",
        title: "Global SHAP Analysis",
        explanation: [
          "SHAP values can be aggregated across many observations.",
          "Mean absolute SHAP values can summarize how strongly features influence predictions overall.",
          "Summary visualizations can also show direction and distribution of effects."
        ],
        intuition: [
          "Local explanations can be combined to understand recurring model behavior across the dataset."
        ],
        importantPoints: [
          "Global SHAP summaries aggregate local explanations.",
          "Magnitude and direction provide different information."
        ]
      },

      {
        id: "shap-limitations",
        title: "Important Limitations",
        explanation: [
          "SHAP explanations describe a fitted model.",
          "They do not establish causal relationships.",
          "Correlated features can complicate attribution.",
          "Computation can be expensive for some model and explainer combinations."
        ],
        intuition: [
          "A mathematically detailed explanation of a model can still reflect biases or relationships learned from problematic data."
        ],
        importantPoints: [
          "SHAP is not causal inference.",
          "Explanations inherit limitations of the model and data.",
          "Correlated features require careful interpretation."
        ]
      },
            {
        id: "shap-problem",
        title: "What Problem Does SHAP Solve?",
        explanation: [
          "Complex models can produce accurate predictions without making it obvious which features contributed to an individual output.",
          "SHAP provides a systematic attribution framework that assigns contribution values to features.",
          "These contributions explain the fitted model relative to a reference output.",
          "SHAP is especially useful when both local explanations and aggregated global interpretation are required."
        ],
        intuition: [
          "The model gives the final score; SHAP attempts to divide the difference from a baseline among the features."
        ],
        importantPoints: [
          "SHAP is an attribution framework.",
          "It explains fitted model outputs.",
          "It supports local and global analysis."
        ]
      },

      {
        id: "shap-coalitions",
        title: "Features as Players and Coalitions",
        explanation: [
          "In cooperative game theory, players form coalitions and jointly produce value.",
          "For SHAP intuition, features are treated like players.",
          "A coalition represents a subset of features considered available.",
          "The contribution of one feature depends on how much value it adds when joining different possible coalitions."
        ],
        intuition: [
          "Do not judge one team member from only one team combination; examine what they contribute across many possible groups."
        ],
        importantPoints: [
          "Feature = player.",
          "Feature subset = coalition.",
          "Marginal contribution depends on coalition."
        ]
      },

      {
        id: "shap-marginal-contribution",
        title: "Marginal Contribution",
        explanation: [
          "Suppose S is a coalition that does not contain feature i.",
          "The marginal contribution of feature i compares the value obtained with feature i included against the value without it.",
          "Conceptually this is v(S union {i}) - v(S).",
          "Shapley values combine such marginal contributions across possible coalitions."
        ],
        intuition: [
          "Measure how much extra value a player adds when joining many different teams."
        ],
        importantPoints: [
          "Contribution is comparative.",
          "It depends on context.",
          "Shapley values average across coalition contexts."
        ]
      },

      {
        id: "shap-formula",
        title: "Shapley Value Mathematics",
        explanation: [
          "For feature i, the Shapley value is a weighted average of its marginal contribution across subsets that do not contain i.",
          "A standard expression is phi_i = sum over S of [|S|!(M-|S|-1)! / M!] * [v(S union {i}) - v(S)].",
          "M is the number of features.",
          "The factorial weight ensures coalition sizes receive the allocation required by the Shapley framework."
        ],
        intuition: [
          "Average the feature's contribution over every possible order in which features could join the prediction."
        ],
        importantPoints: [
          "Uses marginal contributions.",
          "Considers many feature coalitions.",
          "Exact computation can become expensive."
        ]
      },

      {
        id: "shap-permutation-view",
        title: "Permutation Interpretation of Shapley Values",
        explanation: [
          "Shapley values can also be understood by considering possible orders in which features enter a coalition.",
          "For each ordering, measure how much the feature changes the value when it arrives.",
          "Average that marginal contribution across all possible orderings.",
          "This interpretation helps explain why exact generic Shapley computation becomes difficult as feature count grows."
        ],
        intuition: [
          "Let every feature enter the team in every possible order and average the credit it receives when it joins."
        ],
        importantPoints: [
          "Equivalent intuitive view.",
          "Number of permutations grows rapidly.",
          "Motivates specialized or approximate algorithms."
        ]
      },

      {
        id: "shap-properties",
        title: "Important Shapley Properties",
        explanation: [
          "Shapley values are attractive because they satisfy principled allocation properties from cooperative game theory.",
          "Efficiency allocates the difference between the explained output and reference across feature contributions.",
          "Symmetry treats equivalent contributors equivalently under the game definition.",
          "A feature contributing nothing across coalitions receives no attributed contribution under the corresponding dummy property.",
          "Additivity provides consistent allocation behavior when games are combined."
        ],
        intuition: [
          "The credit-allocation system follows explicit mathematical fairness rules rather than an arbitrary importance formula."
        ],
        importantPoints: [
          "Efficiency.",
          "Symmetry.",
          "Dummy/null-player idea.",
          "Additivity."
        ]
      },

      {
        id: "shap-base-value",
        title: "Base Value / Expected Value",
        explanation: [
          "SHAP explanations begin from a reference output commonly called the base value or expected value.",
          "Feature contributions then move the explanation from that reference toward the model output for the observation.",
          "The exact interpretation of the reference depends on the explainer, model output and background distribution."
        ],
        intuition: [
          "Start from what the model predicts before focusing on this observation's specific feature information."
        ],
        importantPoints: [
          "Reference prediction.",
          "Contributions are relative to it.",
          "Background data influences its interpretation."
        ]
      },

      {
        id: "shap-local-additivity",
        title: "Local Additivity",
        explanation: [
          "A central SHAP explanation relationship is that the explained model output can be represented as a reference value plus feature contributions.",
          "Conceptually, f(x) = base value + sum of SHAP contributions when expressed in the relevant explainer output space.",
          "This makes local explanations naturally additive.",
          "The output space must be understood before interpreting contribution magnitudes."
        ],
        intuition: [
          "Baseline plus all feature pushes reconstructs the explained model output."
        ],
        importantPoints: [
          "Base plus contributions.",
          "Local additive explanation.",
          "Output representation matters."
        ]
      },

      {
        id: "shap-positive-negative",
        title: "Positive and Negative SHAP Contributions",
        explanation: [
          "A positive SHAP value pushes the explained model output above its reference in the corresponding output representation.",
          "A negative value pushes it in the opposite direction.",
          "The sign is relative to the reference and selected output, not a universal statement that a feature is good or bad.",
          "A feature can also have different contribution signs for different observations."
        ],
        intuition: [
          "One feature pushes this prediction one way while another pulls it back."
        ],
        importantPoints: [
          "Sign gives local direction.",
          "Direction is relative to the reference.",
          "A feature's sign can vary across observations."
        ]
      },

      {
        id: "shap-magnitude",
        title: "SHAP Magnitude",
        explanation: [
          "The absolute SHAP value measures the magnitude of an attributed local contribution.",
          "Large absolute values indicate that the feature strongly moves the explained output away from the reference for that observation.",
          "Magnitude should not be confused with causality or with the raw magnitude of the feature value."
        ],
        intuition: [
          "The SHAP value measures the strength of the feature's push, not how numerically large the feature itself is."
        ],
        importantPoints: [
          "Absolute value measures contribution magnitude.",
          "Feature value and SHAP value differ.",
          "Large contribution is not causal evidence."
        ]
      },

      {
        id: "shap-output-space",
        title: "Understand the Explained Output Space",
        explanation: [
          "SHAP contribution values must be interpreted in the output space used by the explainer.",
          "Depending on model and explainer configuration, this may correspond to raw model output, margins, transformed outputs or probabilities.",
          "A contribution of 0.5 therefore should not automatically be interpreted as a 50 percentage-point probability increase.",
          "Always inspect the explainer's model-output semantics."
        ],
        intuition: [
          "Before reading the numbers, know what units the explanation ruler uses."
        ],
        importantPoints: [
          "Output units matter.",
          "Raw score and probability are different.",
          "Never assume contribution units."
        ]
      },

      {
        id: "shap-background",
        title: "Background / Reference Data",
        explanation: [
          "Many SHAP explainers require or benefit from background data representing the reference distribution.",
          "The background affects what it means for a feature to be absent or marginalized in the explanation.",
          "Poorly chosen background data can produce explanations that answer an unintended comparison question.",
          "Background data should therefore represent the explanation context appropriately."
        ],
        intuition: [
          "An explanation always compares the observation against some idea of normal or reference behavior."
        ],
        importantPoints: [
          "Background defines context.",
          "Reference choice affects explanations.",
          "Use representative data."
        ]
      },

      {
        id: "shap-background-size",
        title: "Background Dataset Size",
        explanation: [
          "Large background datasets can increase computational cost.",
          "Very small or unrepresentative background sets can poorly represent the desired reference distribution.",
          "Practical workflows often use a representative subset or summary of training data when appropriate.",
          "The trade-off is between computational efficiency and faithful reference representation."
        ],
        intuition: [
          "Use enough reference examples to represent normal behavior without making every explanation unnecessarily expensive."
        ],
        importantPoints: [
          "Background size affects cost.",
          "Representativeness matters.",
          "Use deliberate sampling."
        ]
      },

      {
        id: "shap-explainer",
        title: "shap.Explainer",
        explanation: [
          "shap.Explainer provides a high-level interface that can select an appropriate explanation algorithm when possible.",
          "The selected strategy depends on the model, masker or background information and supplied configuration.",
          "Using the general interface does not remove the need to understand which algorithm and output representation are actually being used."
        ],
        intuition: [
          "The high-level API chooses a suitable explanation engine, but you still need to understand the engine."
        ],
        importantPoints: [
          "High-level interface.",
          "Can dispatch to suitable algorithms.",
          "Inspect explainer behavior."
        ]
      },

      {
        id: "shap-tree",
        title: "TreeSHAP",
        explanation: [
          "TreeSHAP exploits the structure of decision trees to compute SHAP-style attributions efficiently for tree-based models.",
          "It is commonly used with decision trees, random forests and gradient-boosted tree models supported by SHAP.",
          "Specialized tree algorithms can be dramatically more efficient than generic coalition enumeration."
        ],
        intuition: [
          "Instead of treating a tree as an unknown black box, use its branch structure to calculate contributions efficiently."
        ],
        importantPoints: [
          "Designed for tree models.",
          "Uses tree structure.",
          "Usually more efficient than generic methods."
        ]
      },

      {
        id: "shap-linear",
        title: "Linear SHAP Explanations",
        explanation: [
          "Linear models have structure that can support specialized SHAP explanation methods.",
          "The relationship between coefficients, feature values, background distribution and dependence assumptions determines attribution.",
          "SHAP explanations for linear models provide a contribution-based perspective rather than simply reporting coefficients."
        ],
        intuition: [
          "Coefficients describe the model globally; SHAP asks how those learned relationships contribute to this prediction relative to a reference."
        ],
        importantPoints: [
          "Specialized for linear structure.",
          "Different from raw coefficient inspection.",
          "Reference distribution matters."
        ]
      },

      {
        id: "shap-kernel",
        title: "KernelSHAP",
        explanation: [
          "KernelSHAP is a model-agnostic approach that approximates Shapley-style explanations using specially weighted regression over sampled feature coalitions.",
          "Because it does not exploit a specific model's internal structure, it can work with many prediction functions.",
          "The flexibility comes with potentially high computational cost.",
          "Approximation quality depends on the sampling and explanation setup."
        ],
        intuition: [
          "Probe many versions of the input with different feature information available, then estimate each feature's contribution."
        ],
        importantPoints: [
          "Model-agnostic.",
          "Approximate.",
          "Can be computationally expensive."
        ]
      },

      {
        id: "shap-permutation-explainer",
        title: "Permutation-Based SHAP Explanation",
        explanation: [
          "Permutation-based explainers estimate contributions by evaluating feature orderings or permutations.",
          "They can provide model-agnostic explanation behavior for suitable prediction functions.",
          "Computation grows with feature count, number of evaluated permutations and dataset size.",
          "Approximation budget therefore affects runtime and stability."
        ],
        intuition: [
          "Estimate credit by observing what happens as features enter the prediction in different orders."
        ],
        importantPoints: [
          "Model-agnostic strategy.",
          "Uses feature ordering ideas.",
          "Computation can be substantial."
        ]
      },

      {
        id: "shap-explainer-choice",
        title: "Choosing a SHAP Explainer",
        explanation: [
          "Use model-specific explainers when they correctly support the estimator and explanation objective because they can exploit model structure.",
          "Use model-agnostic approaches when a specialized method is unavailable or inappropriate.",
          "Consider computational cost, background assumptions, output space and approximation requirements.",
          "The fastest explainer is not automatically the most appropriate explanation."
        ],
        intuition: [
          "Choose the explanation algorithm according to the machine you are explaining and the question you need answered."
        ],
        importantPoints: [
          "Model type matters.",
          "Explanation objective matters.",
          "Cost and assumptions matter."
        ]
      },

      {
        id: "shap-explanation-object",
        title: "The SHAP Explanation Object",
        explanation: [
          "Modern SHAP workflows commonly return Explanation objects containing attribution values and related metadata.",
          "Depending on the task, these can include feature data, base values, feature names and output information.",
          "Understanding array dimensions is particularly important for classification and multiclass outputs."
        ],
        intuition: [
          "The explanation contains more than contribution numbers; it also stores the context required to interpret them."
        ],
        importantPoints: [
          "Inspect values.",
          "Inspect base values.",
          "Inspect feature and output dimensions."
        ]
      },

      {
        id: "shap-waterfall",
        title: "Waterfall Plot",
        explanation: [
          "A waterfall plot is designed for local explanation.",
          "It begins from the base value and displays how important feature contributions move the output toward the final explained prediction.",
          "Positive and negative contributions are visually separated.",
          "It is useful when explaining one observation to a technical or domain audience."
        ],
        intuition: [
          "Watch the prediction travel from its baseline to the final value one important feature contribution at a time."
        ],
        importantPoints: [
          "Local explanation.",
          "Shows base-to-prediction movement.",
          "Displays direction and magnitude."
        ]
      },

      {
        id: "shap-force",
        title: "Force Plot",
        explanation: [
          "Force plots visualize features pushing a prediction in opposing directions relative to a reference.",
          "They can provide an intuitive local representation of competing feature contributions.",
          "For large datasets or many features, other summary visualizations may be easier to interpret."
        ],
        intuition: [
          "Imagine features pulling the prediction left and right from its baseline."
        ],
        importantPoints: [
          "Primarily useful for local contribution views.",
          "Shows opposing forces.",
          "Can become visually dense."
        ]
      },

      {
        id: "shap-bar",
        title: "SHAP Bar Plot",
        explanation: [
          "A SHAP bar plot can summarize contribution magnitudes.",
          "For global interpretation, features are often ranked using aggregated absolute SHAP values.",
          "Because absolute values remove sign, the bar plot emphasizes overall contribution strength rather than directional behavior."
        ],
        intuition: [
          "Rank features by how strongly they tend to move predictions, regardless of direction."
        ],
        importantPoints: [
          "Good global magnitude summary.",
          "Absolute contribution removes direction.",
          "Not causal importance."
        ]
      },

      {
        id: "shap-beeswarm",
        title: "SHAP Beeswarm Plot",
        explanation: [
          "A beeswarm plot displays SHAP contributions for many observations and features.",
          "Features are commonly ordered by global contribution magnitude.",
          "Each point represents an observation's contribution for that feature.",
          "Point position shows contribution direction and magnitude, while color can represent the original feature value.",
          "This allows importance, direction and distribution to be inspected simultaneously."
        ],
        intuition: [
          "See not only which features matter, but how their high and low values push predictions across many observations."
        ],
        importantPoints: [
          "Global summary of local values.",
          "Shows distribution.",
          "Can reveal direction patterns."
        ]
      },

      {
        id: "shap-beeswarm-reading",
        title: "How to Read a Beeswarm Plot",
        explanation: [
          "Horizontal position indicates SHAP contribution.",
          "Points to opposite sides of zero push the explained output in opposite directions.",
          "Feature-value color helps reveal whether high or low values are associated with particular contribution directions.",
          "Wide horizontal spread indicates that the feature can strongly influence some predictions.",
          "Mixed patterns can indicate nonlinear effects or interactions."
        ],
        intuition: [
          "Read each row as a map of how that feature behaves across the population."
        ],
        importantPoints: [
          "Position = contribution.",
          "Color = feature value when configured.",
          "Spread = contribution variability."
        ]
      },

      {
        id: "shap-dependence",
        title: "SHAP Dependence / Scatter Plot",
        explanation: [
          "A SHAP dependence-style plot relates a feature's observed value to its SHAP contribution across observations.",
          "It can reveal nonlinear relationships, thresholds, saturation and interaction patterns in model behavior.",
          "Coloring by another feature can help investigate interactions.",
          "The plot describes the fitted model, not a causal dose-response curve."
        ],
        intuition: [
          "Ask how the model's contribution from one feature changes as that feature's value changes."
        ],
        importantPoints: [
          "Shows value-contribution relationship.",
          "Can reveal nonlinearity.",
          "Not causal."
        ]
      },

      {
        id: "shap-interactions",
        title: "SHAP Interaction Values",
        explanation: [
          "Some SHAP methods for supported models can decompose contributions into main effects and pairwise interaction effects.",
          "An interaction indicates that the contribution associated with one feature depends on another feature.",
          "Interaction analysis can reveal structure hidden by one-dimensional importance rankings.",
          "The number of feature pairs can make interaction analysis computationally and visually expensive."
        ],
        intuition: [
          "Two features may matter together in a way that neither feature explains alone."
        ],
        importantPoints: [
          "Captures pairwise interaction structure.",
          "Useful for nonlinear models.",
          "Can be expensive."
        ]
      },

      {
        id: "shap-global-importance",
        title: "Mean Absolute SHAP Importance",
        explanation: [
          "A common global SHAP importance measure averages absolute SHAP contributions across observations.",
          "For feature j, this can be viewed conceptually as mean(|phi_j|).",
          "Large values mean the feature frequently produces large contribution magnitudes.",
          "Because the sign is removed, this does not describe whether the feature generally raises or lowers predictions."
        ],
        intuition: [
          "Measure how strongly each feature tends to push predictions, regardless of which direction."
        ],
        importantPoints: [
          "Aggregates local contributions.",
          "Uses absolute magnitude.",
          "Does not directly show direction."
        ]
      },

      {
        id: "shap-global-vs-permutation",
        title: "SHAP Importance vs Permutation Importance",
        explanation: [
          "Permutation importance measures how predictive performance changes when feature information is disrupted.",
          "Global SHAP importance aggregates attribution magnitudes from model outputs.",
          "They therefore answer related but different questions.",
          "Features can receive different rankings because the methods use different definitions of importance."
        ],
        intuition: [
          "One asks how much performance breaks when a feature is damaged; the other asks how much output contribution is attributed to that feature."
        ],
        importantPoints: [
          "Different importance definitions.",
          "Different rankings can be legitimate.",
          "Use complementary methods."
        ]
      },

      {
        id: "shap-correlation-deep",
        title: "Correlated Features and Attribution",
        explanation: [
          "Correlated features share overlapping information.",
          "Attribution methods must decide how credit should be distributed when multiple features can represent similar predictive information.",
          "Different feature-dependence assumptions can therefore produce different SHAP attributions.",
          "A low contribution for one correlated feature does not necessarily mean the underlying information is unimportant."
        ],
        intuition: [
          "When two teammates can perform the same job, assigning individual credit becomes ambiguous."
        ],
        importantPoints: [
          "Correlation complicates credit allocation.",
          "Dependence assumptions matter.",
          "Interpret related features together."
        ]
      },

      {
        id: "shap-interventional-conditional",
        title: "Feature Dependence Assumptions",
        explanation: [
          "SHAP-style explanations require a definition of what happens when feature information is considered absent.",
          "Interventional-style approaches break dependencies according to a specified background distribution.",
          "Conditional-style reasoning attempts to account for statistical dependence between observed features.",
          "These approaches answer different attribution questions and can produce different values."
        ],
        intuition: [
          "Removing one feature is ambiguous when other features strongly predict what its value would have been."
        ],
        importantPoints: [
          "Missing-feature semantics matter.",
          "Dependence assumptions affect attribution.",
          "Interpretation requires knowing the explanation setup."
        ]
      },

      {
        id: "shap-classification",
        title: "SHAP for Binary Classification",
        explanation: [
          "Binary classifiers can expose different output representations such as margins, raw scores or probabilities.",
          "SHAP values must be interpreted according to the representation being explained.",
          "For some tree-classification configurations, contributions may naturally correspond to a raw model scale rather than direct probability-point changes.",
          "Always verify the output semantics before communicating explanations."
        ],
        intuition: [
          "A contribution of +1 means nothing until you know whether the model is speaking in raw score, log-odds or another unit."
        ],
        importantPoints: [
          "Classification output space matters.",
          "Do not automatically interpret contributions as probabilities.",
          "Check explainer configuration."
        ]
      },

      {
        id: "shap-multiclass",
        title: "SHAP for Multiclass Models",
        explanation: [
          "Multiclass models can require separate contribution information for multiple outputs or classes.",
          "A feature may push one class output upward while affecting another differently.",
          "Explanation arrays can therefore include an additional output dimension.",
          "The class being explained must be made explicit."
        ],
        intuition: [
          "A feature can support class A relative to the model's reference while not supporting class B in the same way."
        ],
        importantPoints: [
          "Multiple outputs.",
          "Inspect array dimensions.",
          "Specify the explained class."
        ]
      },

      {
        id: "shap-regression",
        title: "SHAP for Regression",
        explanation: [
          "For regression, SHAP contributions explain movement from a reference prediction toward the model's continuous output.",
          "When the model output is directly in target units, contribution units can often be interpreted more naturally.",
          "Transformations of the target or model output still need to be considered."
        ],
        intuition: [
          "Explain how features move the prediction from an average-like reference toward the final numerical estimate."
        ],
        importantPoints: [
          "Continuous-output explanation.",
          "Units depend on model output.",
          "Target transformations matter."
        ]
      },

      {
        id: "shap-pipeline",
        title: "SHAP with Preprocessing Pipelines",
        explanation: [
          "The fitted estimator may receive scaled, encoded or otherwise transformed features rather than raw application columns.",
          "SHAP explanations therefore need to align with the representation actually consumed by the model.",
          "One-hot encoding can expand one original feature into several model inputs.",
          "Human-facing explanations may require mapping transformed features back to their original semantic meaning."
        ],
        intuition: [
          "Explain the features the model actually used, then translate them back into language the user understands."
        ],
        importantPoints: [
          "Preprocessing affects explanation space.",
          "Feature names must remain aligned.",
          "Human-readable mapping matters."
        ]
      },

      {
        id: "shap-onehot",
        title: "SHAP with One-Hot Encoded Features",
        explanation: [
          "One categorical variable can become many indicator columns after encoding.",
          "SHAP may assign separate contributions to those transformed columns.",
          "For some communication tasks, contributions may need to be grouped carefully back to the original categorical concept.",
          "Any aggregation should preserve the semantics of the explanation rather than blindly summing unrelated transformed features."
        ],
        intuition: [
          "The model sees several binary switches where the user sees one category."
        ],
        importantPoints: [
          "Encoded columns can receive separate attributions.",
          "Track original feature mapping.",
          "Aggregate carefully."
        ]
      },

      {
        id: "shap-pca",
        title: "SHAP After PCA",
        explanation: [
          "If a model is trained on principal components, SHAP naturally explains contributions of those components to the downstream model output.",
          "Connecting component contributions back to original features requires considering PCA loadings and the transformation itself.",
          "Direct attribution to original features is therefore less straightforward."
        ],
        intuition: [
          "The explanation may tell you that component 3 matters, but understanding component 3 requires inspecting how original features formed it."
        ],
        importantPoints: [
          "Explanation follows model inputs.",
          "PCA reduces direct feature interpretability.",
          "Loadings provide additional context."
        ]
      },

      {
        id: "shap-training-test",
        title: "Which Data Should Be Explained?",
        explanation: [
          "Explaining only training observations can reveal what the fitted model learned on data it already saw.",
          "Explaining held-out observations is often more informative for understanding generalization behavior.",
          "Production observations can reveal behavior under the actual deployment distribution.",
          "The appropriate dataset depends on the explanation objective."
        ],
        intuition: [
          "Ask whether you want to explain memorized behavior, unseen behavior or real production behavior."
        ],
        importantPoints: [
          "Dataset choice matters.",
          "Held-out explanations support generalization analysis.",
          "Production explanations support monitoring."
        ]
      },

      {
        id: "shap-errors",
        title: "Explain Errors, Not Only Correct Predictions",
        explanation: [
          "SHAP can be particularly useful for investigating false positives, false negatives and large regression errors.",
          "Comparing explanations for correct and incorrect predictions can reveal problematic feature reliance.",
          "Error explanations can expose leakage, proxies, spurious correlations or missing predictive information."
        ],
        intuition: [
          "The most useful explanation is often why the model failed."
        ],
        importantPoints: [
          "Inspect mistakes.",
          "Compare error groups.",
          "Use explanation for debugging."
        ]
      },

      {
        id: "shap-leakage",
        title: "SHAP as a Leakage Diagnostic",
        explanation: [
          "A suspicious feature with consistently dominant SHAP contributions can indicate possible leakage.",
          "For example, a variable created after the target event may make predictions artificially easy.",
          "SHAP does not automatically identify leakage, but it can reveal unexpected model dependence that deserves investigation."
        ],
        intuition: [
          "If the model keeps relying on information it should never possess, the explanation can expose the clue."
        ],
        importantPoints: [
          "Useful debugging signal.",
          "Investigate suspicious features.",
          "Still perform explicit leakage audits."
        ]
      },

      {
        id: "shap-spurious",
        title: "Spurious Correlations",
        explanation: [
          "SHAP faithfully explains predictive relationships used by the fitted model, including undesirable ones.",
          "A large contribution can therefore reveal that the model relies on a spurious proxy.",
          "The mathematical correctness of an explanation does not make the learned relationship desirable or valid for deployment."
        ],
        intuition: [
          "SHAP can accurately explain a bad reason."
        ],
        importantPoints: [
          "Explanation quality does not guarantee model quality.",
          "Inspect domain plausibility.",
          "Validate suspicious relationships."
        ]
      },

      {
        id: "shap-causality-deep",
        title: "Why SHAP Is Not Causal Inference",
        explanation: [
          "SHAP decomposes behavior of a predictive model according to an attribution framework.",
          "The model itself is usually trained on observational associations.",
          "A positive SHAP value therefore does not mean that intervening to increase that feature will increase the real-world outcome.",
          "Causal effects require causal assumptions, identification strategies, experiments or appropriate causal methods."
        ],
        intuition: [
          "Explaining why a model predicts rain from umbrellas does not mean opening umbrellas creates rain."
        ],
        importantPoints: [
          "Prediction is not intervention.",
          "Attribution is not causality.",
          "Avoid causal language."
        ]
      },

      {
        id: "shap-stability",
        title: "SHAP Explanation Stability",
        explanation: [
          "SHAP explanations can change when the fitted model changes.",
          "Retraining with different samples or random seeds can therefore change feature contributions.",
          "Approximate explainers can also introduce estimation variability.",
          "Important explanation claims should be checked for stability when decisions depend heavily on them."
        ],
        intuition: [
          "If retraining changes the explanation completely, do not present one explanation as permanent truth."
        ],
        importantPoints: [
          "Model instability affects explanations.",
          "Approximation can add variability.",
          "Check robustness."
        ]
      },

      {
        id: "shap-computation",
        title: "Computational Complexity",
        explanation: [
          "Naively evaluating all feature coalitions becomes infeasible as feature count grows.",
          "The number of subsets grows exponentially.",
          "Specialized methods such as TreeSHAP exploit model structure, while model-agnostic approaches often approximate the full computation.",
          "Dataset size, feature count and explanation count all influence runtime."
        ],
        intuition: [
          "With many features, there are far too many possible teams to evaluate exactly one by one."
        ],
        importantPoints: [
          "Exact generic computation is expensive.",
          "Specialized algorithms improve efficiency.",
          "Approximation trades computation for precision."
        ]
      },

      {
        id: "shap-sampling",
        title: "Explain Representative Samples",
        explanation: [
          "Global SHAP analysis does not always require explaining every available observation.",
          "A representative sample can substantially reduce computation.",
          "Sampling should preserve the populations and rare cases important to the explanation objective.",
          "For imbalanced problems, random sampling that removes most minority observations can produce an incomplete global view."
        ],
        intuition: [
          "Explain enough representative cases to understand the model without wasting computation on redundant examples."
        ],
        importantPoints: [
          "Sampling reduces cost.",
          "Representativeness matters.",
          "Preserve important subgroups."
        ]
      },

      {
        id: "shap-global-subgroups",
        title: "SHAP Across Subgroups",
        explanation: [
          "Aggregating SHAP values across the entire dataset can hide subgroup-specific behavior.",
          "Separate summaries can be created for meaningful populations when scientifically or operationally justified.",
          "Differences may reveal model interactions, distribution differences, proxy behavior or instability.",
          "Explanation differences should be combined with subgroup performance evaluation."
        ],
        intuition: [
          "The model's average reasoning can hide very different reasoning for different groups."
        ],
        importantPoints: [
          "Global averages can hide heterogeneity.",
          "Compare meaningful subgroups.",
          "Combine explanations with performance metrics."
        ]
      },

      {
        id: "shap-time",
        title: "SHAP Under Distribution Shift",
        explanation: [
          "Feature contribution distributions can change when production data shifts.",
          "Monitoring aggregated SHAP behavior can sometimes help reveal changes in how the model is operating.",
          "A shift in SHAP values can arise from input-distribution changes, model updates or changing feature relationships.",
          "SHAP monitoring complements rather than replaces standard data and performance monitoring."
        ],
        intuition: [
          "If the model suddenly starts relying on different features, something about the operating environment may have changed."
        ],
        importantPoints: [
          "Explanations can support monitoring.",
          "Investigate attribution shifts.",
          "Still monitor data and performance directly."
        ]
      },

      {
        id: "shap-vs-pdp",
        title: "SHAP vs Partial Dependence",
        explanation: [
          "Partial dependence summarizes average model response as selected feature values vary.",
          "SHAP assigns contributions to individual predictions and can aggregate them globally.",
          "PDP is especially useful for average response shape, while SHAP provides additive attribution views.",
          "Both methods have limitations under correlated features."
        ],
        intuition: [
          "PDP asks how predictions behave as a feature changes; SHAP asks how much credit that feature receives for particular predictions."
        ],
        importantPoints: [
          "Different explanation questions.",
          "PDP emphasizes response shape.",
          "SHAP emphasizes attribution."
        ]
      },

      {
        id: "shap-vs-lime",
        title: "SHAP vs LIME",
        explanation: [
          "LIME commonly fits a simple surrogate around one observation using locally weighted perturbations.",
          "SHAP is built around Shapley-style feature attribution principles.",
          "Both can provide local explanations, but their mathematical objectives and assumptions differ.",
          "Neither should be treated as causal evidence."
        ],
        intuition: [
          "LIME approximates the model locally; SHAP allocates model-output contribution according to its attribution framework."
        ],
        importantPoints: [
          "Both support local explanation.",
          "Different mathematical foundations.",
          "Both require careful interpretation."
        ]
      },

      {
        id: "shap-vs-coefficients",
        title: "SHAP vs Model Coefficients",
        explanation: [
          "A coefficient is a learned model parameter describing the model's functional relationship under its representation.",
          "A SHAP value is an attribution for a particular prediction relative to a reference.",
          "One coefficient can therefore correspond to many different local SHAP contributions across observations.",
          "The two quantities should not be used interchangeably."
        ],
        intuition: [
          "The coefficient is part of the machine; the SHAP value describes this feature's contribution for this case."
        ],
        importantPoints: [
          "Coefficient = model parameter.",
          "SHAP = attribution.",
          "Global parameter and local contribution differ."
        ]
      },

      {
        id: "shap-vs-tree-importance",
        title: "SHAP vs Tree Feature Importance",
        explanation: [
          "Tree impurity importance aggregates how much features reduce split criteria during fitting.",
          "SHAP attributes model outputs to features for observations.",
          "SHAP can provide local direction and magnitude, whereas standard impurity importance is a global magnitude summary.",
          "Different methods can produce different rankings because they define importance differently."
        ],
        intuition: [
          "One measures how trees used features while growing; the other allocates prediction output among features."
        ],
        importantPoints: [
          "Different definitions.",
          "SHAP supports local explanations.",
          "Do not expect identical rankings."
        ]
      },

      {
        id: "shap-debugging-workflow",
        title: "SHAP for Model Debugging",
        explanation: [
          "Inspect global contribution patterns for unexpected dominant features.",
          "Inspect false positives and false negatives locally.",
          "Compare correct and incorrect prediction explanations.",
          "Investigate suspicious proxies, leakage and feature interactions.",
          "Validate discoveries using raw data, domain knowledge and conventional evaluation."
        ],
        intuition: [
          "Use explanations as diagnostic evidence, then verify the suspected problem independently."
        ],
        importantPoints: [
          "Global inspection.",
          "Error inspection.",
          "Leakage investigation.",
          "Independent validation."
        ]
      },

      {
        id: "shap-real-world",
        title: "Real-World SHAP Applications",
        explanation: [
          "Credit-risk teams can inspect which modeled factors contributed to risk predictions.",
          "Healthcare researchers can investigate which variables drive model risk scores while avoiding causal claims.",
          "Fraud teams can inspect why individual transactions receive high-risk scores.",
          "Predictive-maintenance teams can identify sensor contributions associated with model warnings.",
          "Model-development teams can use SHAP for debugging and stakeholder communication."
        ],
        intuition: [
          "SHAP is most useful when model output must be investigated at both individual and population levels."
        ],
        importantPoints: [
          "Credit.",
          "Healthcare.",
          "Fraud.",
          "Maintenance.",
          "Debugging."
        ]
      },

      {
        id: "shap-workflow",
        title: "Complete SHAP Workflow",
        explanation: [
          "First verify that the predictive model itself is valid.",
          "Define whether the explanation objective is local, global or diagnostic.",
          "Choose an explainer appropriate for the model.",
          "Choose suitable background or reference data.",
          "Confirm the model-output representation being explained.",
          "Generate explanations on representative observations.",
          "Use local plots for individual predictions.",
          "Aggregate SHAP values for global analysis.",
          "Inspect correlated features, interactions and subgroups.",
          "Validate suspicious findings using domain knowledge and independent analysis.",
          "Communicate attribution without making unsupported causal claims."
        ],
        intuition: [
          "Explain a validated model with a suitable reference, then verify what the explanation appears to reveal."
        ],
        importantPoints: [
          "Validate model.",
          "Choose explainer.",
          "Choose reference.",
          "Check output space.",
          "Explain.",
          "Aggregate.",
          "Validate interpretation."
        ]
      },

      {
        id: "shap-common-mistakes",
        title: "Common SHAP Mistakes",
        explanation: [
          "Calling SHAP values causal effects.",
          "Ignoring the base value.",
          "Assuming contributions are always probability-point changes.",
          "Using an unrepresentative background dataset.",
          "Ignoring correlated features.",
          "Explaining transformed columns without mapping them to meaningful features.",
          "Treating mean absolute SHAP importance as directional.",
          "Explaining only training observations.",
          "Ignoring unstable explanations.",
          "Assuming a sophisticated explanation can rescue a poor predictive model."
        ],
        intuition: [
          "SHAP is mathematically powerful, but incorrect interpretation can still produce confident nonsense."
        ],
        importantPoints: [
          "Reference.",
          "Output units.",
          "Correlation.",
          "Preprocessing.",
          "Stability.",
          "Causality."
        ]
      },

      {
        id: "shap-exam-formulas",
        title: "SHAP Formulas to Remember",
        explanation: [
          "Marginal contribution: v(S union {i}) - v(S).",
          "Shapley value: weighted average of marginal contributions across coalitions.",
          "Local additive idea: explained output = base value + sum of feature contributions.",
          "Global magnitude summary: mean absolute SHAP contribution across observations."
        ],
        intuition: [
          "Remember the chain: coalition → marginal contribution → weighted allocation → local additive explanation."
        ],
        importantPoints: [
          "Marginal contribution.",
          "Shapley weighting.",
          "Base plus contributions.",
          "Mean absolute SHAP."
        ]
      },

      {
        id: "shap-exam-interview",
        title: "SHAP: Exam and Interview Essentials",
        explanation: [
          "Explain Shapley-value intuition using players and coalitions.",
          "Define marginal contribution.",
          "Explain why contributions are averaged across coalitions.",
          "Define the SHAP base value.",
          "Explain local additivity.",
          "Interpret positive, negative and absolute SHAP values.",
          "Differentiate local and global SHAP.",
          "Explain mean absolute SHAP importance.",
          "Explain TreeSHAP, LinearSHAP and KernelSHAP conceptually.",
          "Explain waterfall, beeswarm and dependence plots.",
          "Explain why correlated features complicate attribution.",
          "Explain why output representation matters in classification.",
          "Explain how preprocessing affects SHAP.",
          "Compare SHAP with permutation importance, PDP and LIME.",
          "Explain computational complexity.",
          "Explain why SHAP is not causal inference."
        ],
        intuition: [
          "A strong SHAP answer explains the mathematics, reference prediction, visualization, computational trade-offs and interpretation limitations."
        ],
        importantPoints: [
          "Shapley values.",
          "Coalitions.",
          "Base value.",
          "Local additivity.",
          "Explainers.",
          "Plots.",
          "Correlation.",
          "Causality."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "shap-contribution-lab",
      title: "SHAP Explainability Lab",
      description:
        "Select individual predictions and watch features push the model output away from its base value, then aggregate explanations into global importance and summary views."
    },

    codeExamples: [
      {
        id: "shap-tree-code",
        title: "SHAP with a Tree Model",
        description:
          "Generate SHAP values for a Random Forest.",
        language: "python",
        code: `import shap
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

data = load_breast_cancer()

X_train, X_test, y_train, y_test = train_test_split(
    data.data,
    data.target,
    test_size=0.2,
    random_state=42,
    stratify=data.target
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

explainer = shap.Explainer(
    model,
    X_train
)

shap_values = explainer(
    X_test[:20]
)

print(
    shap_values.shape
)`,
        explanation: [
          "The model is trained before creating explanations.",
          "shap.Explainer chooses an appropriate explanation strategy when possible.",
          "The resulting explanation object contains feature-contribution information."
        ],
        commonMistakes: [
          "Calling SHAP values causal effects.",
          "Ignoring correlated features.",
          "Explaining a poor model as though explanation quality fixes prediction quality."
        ]
      }
    ],

    practice: [
      {
        id: "shap-practice-1",
        title: "Local Contribution",
        type: "concept",
        difficulty: "medium",
        question:
          "What does a SHAP value represent conceptually for one feature and one prediction?",
        instructions: ["Think contribution relative to a reference."],
        hints: ["The feature pushes the model output."],
        explanation:
          "It represents that feature's attributed contribution to moving the model output away from a reference prediction under the SHAP framework."
      },
      {
        id: "shap-practice-2",
        title: "Global SHAP",
        type: "concept",
        difficulty: "medium",
        question:
          "How can local SHAP explanations contribute to global interpretation?",
        instructions: ["Think aggregation."],
        hints: ["Summarize contributions across many rows."],
        explanation:
          "SHAP values can be aggregated across observations, for example using mean absolute contributions, to summarize overall model dependence."
      },
      {
        id: "shap-practice-3",
        title: "Causal Claim",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A feature has a large positive SHAP contribution. Can we conclude that increasing that feature will cause the real-world outcome to increase?",
        instructions: ["Separate model explanation and causal inference."],
        hints: ["SHAP explains model behavior."],
        explanation:
          "No. SHAP describes how the fitted model used the feature for that prediction; it does not establish a causal effect in the real world."
      }
    ],

    keyTakeaways: [
      "SHAP uses Shapley-value ideas to attribute model outputs.",
      "It supports local and global explanations.",
      "Contributions are relative to a reference prediction.",
      "Global summaries aggregate local behavior.",
      "SHAP explains models rather than proving causality.",
      "Data quality and feature correlation still matter."
    ]
  },

  // =========================================================
  // 10. EXPERIMENT TRACKING
  // =========================================================
  "experiment-tracking": {
    overview:
      "Machine-learning development is an experimental process. Experiment tracking records datasets, feature configurations, preprocessing, models, hyperparameters, metrics, random seeds and artifacts so results can be compared and reproduced rather than depending on memory or scattered notebooks.",

    objectives: [
      "Understand why ML experiments must be tracked.",
      "Record model configuration.",
      "Record metrics.",
      "Track dataset and feature versions.",
      "Track random seeds.",
      "Store artifacts.",
      "Compare experiments fairly.",
      "Understand reproducibility."
    ],

    sections: [
      {
        id: "tracking-problem",
        title: "Why Track Experiments?",
        explanation: [
          "ML projects can quickly produce dozens or hundreds of model runs.",
          "Without systematic tracking, it becomes difficult to remember which preprocessing, features and parameters produced a result.",
          "Experiment tracking turns development into an auditable process."
        ],
        intuition: [
          "A score such as 94% is nearly useless if nobody can reproduce the exact experiment that created it."
        ],
        importantPoints: [
          "Track more than final scores.",
          "Configuration and data context are essential."
        ]
      },

      {
        id: "tracking-what",
        title: "What Should Be Tracked?",
        explanation: [
          "Useful records include dataset version, split strategy, preprocessing, feature set, estimator, hyperparameters, random seeds and metrics.",
          "Artifacts such as plots, confusion matrices and serialized models can also be stored."
        ],
        intuition: [
          "The experiment record should contain enough information to explain what was actually run."
        ],
        importantPoints: [
          "Track inputs, configuration and outputs.",
          "Track evaluation methodology.",
          "Track reproducibility information."
        ]
      },

      {
        id: "tracking-repro",
        title: "Reproducibility",
        explanation: [
          "Random seeds help reproduce stochastic operations but do not guarantee complete reproducibility across every hardware and software environment.",
          "Library versions and data versions can also influence results.",
          "Reproducible ML requires controlling the complete experimental environment."
        ],
        intuition: [
          "The same code can behave differently when the data or software environment changes."
        ],
        importantPoints: [
          "Record software dependencies.",
          "Version data where possible.",
          "Use deterministic seeds where appropriate."
        ]
      },

      {
        id: "tracking-comparison",
        title: "Experiment Comparison",
        explanation: [
          "Experiments should be compared using consistent metrics and validation procedures.",
          "A higher score from a different split is not necessarily a fair improvement.",
          "Tracking systems should make methodological differences visible."
        ],
        intuition: [
          "A leaderboard is meaningful only when experiments took comparable tests."
        ],
        importantPoints: [
          "Compare like with like.",
          "Store split and validation information.",
          "Do not optimize blindly for one metric."
        ]
      },
            {
        id: "tracking-run-anatomy",
        title: "Anatomy of an ML Experiment Run",
        explanation: [
          "An experiment is a controlled attempt to answer a modeling question.",
          "A run is one concrete execution of that experiment using a specific data version, preprocessing configuration, model configuration and evaluation procedure.",
          "A useful run record connects its inputs, configuration, outputs and artifacts.",
          "Without this context, a metric is only an isolated number."
        ],
        intuition: [
          "An experiment is the investigation; a run is one attempt performed under precisely recorded conditions."
        ],
        importantPoints: [
          "Experiment and run are related but distinct.",
          "Each run needs context.",
          "Runs should be comparable and reproducible."
        ]
      },

      {
        id: "tracking-question",
        title: "Start Every Experiment with a Question",
        explanation: [
          "Experiments should test explicit hypotheses rather than randomly changing parameters.",
          "Examples include whether scaling improves an SVM, whether a new feature improves recall, or whether a deeper tree improves validation performance.",
          "A clear question makes experiment results easier to interpret.",
          "Changing many unrelated components simultaneously makes it difficult to determine what caused a performance difference."
        ],
        intuition: [
          "Treat ML development like science: change something for a reason and measure what happened."
        ],
        importantPoints: [
          "Define a hypothesis.",
          "Change deliberately.",
          "Measure the consequence."
        ]
      },

      {
        id: "tracking-inputs",
        title: "Track Experiment Inputs",
        explanation: [
          "Experiment inputs include the dataset version, feature definitions, target definition, split identifiers and preprocessing configuration.",
          "They can also include external resources such as embeddings, lookup tables or pretrained components.",
          "Input lineage makes it possible to understand exactly what information entered a run."
        ],
        intuition: [
          "Before asking what the model produced, record exactly what was fed into it."
        ],
        importantPoints: [
          "Track data.",
          "Track features.",
          "Track preprocessing.",
          "Track external dependencies."
        ]
      },

      {
        id: "tracking-parameters",
        title: "Parameters vs Hyperparameters vs Run Configuration",
        explanation: [
          "Model parameters are learned during fitting, such as linear coefficients or tree split structures.",
          "Hyperparameters are configured before or around fitting, such as regularization strength, tree depth or number of estimators.",
          "Run configuration is broader and can include preprocessing choices, validation strategy, random seeds and feature selection.",
          "Experiment tracking should distinguish these concepts."
        ],
        intuition: [
          "Some values are learned by the model, some are chosen for the model, and others configure the surrounding experiment."
        ],
        importantPoints: [
          "Parameters are learned.",
          "Hyperparameters are configured.",
          "Run configuration is broader."
        ]
      },

      {
        id: "tracking-metrics-deep",
        title: "Track More Than One Metric",
        explanation: [
          "A single metric rarely describes all relevant model behavior.",
          "Classification experiments may track ROC-AUC, precision, recall, F1, PR-AUC, log loss or calibration metrics depending on the problem.",
          "Regression experiments may track MAE, RMSE, R-squared and subgroup errors.",
          "Operational metrics such as latency or model size can also matter."
        ],
        intuition: [
          "One score gives one view of the model; production decisions usually require several views."
        ],
        importantPoints: [
          "Track decision-relevant metrics.",
          "Include operational metrics when relevant.",
          "Do not optimize blindly for one number."
        ]
      },

      {
        id: "tracking-training-validation",
        title: "Separate Training, Validation and Test Metrics",
        explanation: [
          "Training performance describes fit to data used during optimization.",
          "Validation performance supports development decisions.",
          "Final test performance estimates generalization after the workflow has been selected.",
          "These metrics must be labeled separately because they answer different questions."
        ],
        intuition: [
          "A practice score, mock-exam score and final-exam score should never be recorded as though they were equivalent."
        ],
        importantPoints: [
          "Label metric source.",
          "Training and validation are different.",
          "Protect test-set independence."
        ]
      },

      {
        id: "tracking-folds",
        title: "Track Cross-Validation Results Properly",
        explanation: [
          "When cross-validation is used, record individual fold scores in addition to their mean.",
          "Standard deviation or other dispersion summaries help reveal instability.",
          "A run with slightly higher mean performance but much larger fold variation may not always be preferable.",
          "The exact cross-validation splitter and its configuration should also be recorded."
        ],
        intuition: [
          "Do not record only the average exam score when the individual exam results reveal serious inconsistency."
        ],
        importantPoints: [
          "Store fold scores.",
          "Store mean and variability.",
          "Record CV strategy."
        ]
      },

      {
        id: "tracking-artifacts",
        title: "Experiment Artifacts",
        explanation: [
          "Artifacts are files or objects produced during an experiment.",
          "Examples include confusion matrices, ROC curves, PR curves, feature-importance plots, SHAP plots, learning curves, serialized pipelines and reports.",
          "Artifacts preserve evidence that cannot be represented adequately by scalar metrics alone."
        ],
        intuition: [
          "Metrics summarize the run; artifacts preserve the evidence behind the summary."
        ],
        importantPoints: [
          "Store important plots.",
          "Store reports.",
          "Store fitted workflows when appropriate."
        ]
      },

      {
        id: "tracking-model-artifact",
        title: "Track the Complete Fitted Workflow",
        explanation: [
          "Saving only the final estimator can be insufficient when preprocessing is required.",
          "A fitted Pipeline can preserve imputation, encoding, scaling, feature transformations and the estimator together.",
          "The artifact should correspond to the exact configuration represented by the tracked run."
        ],
        intuition: [
          "Save the entire machine, not only its final component."
        ],
        importantPoints: [
          "Preprocessing is part of the model workflow.",
          "Keep artifacts aligned with runs.",
          "Avoid training-serving mismatch."
        ]
      },

      {
        id: "tracking-data-version",
        title: "Dataset Versioning",
        explanation: [
          "Changing data can change model results even when code and hyperparameters remain identical.",
          "A reproducible run should therefore identify the exact dataset snapshot or version used.",
          "Useful metadata can include source, extraction date, schema version, row counts and a version identifier.",
          "Sensitive data should be tracked according to privacy and governance requirements rather than copied carelessly."
        ],
        intuition: [
          "The same recipe does not reproduce the same dish if the ingredients changed."
        ],
        importantPoints: [
          "Version data.",
          "Track schema.",
          "Respect governance and privacy."
        ]
      },

      {
        id: "tracking-feature-version",
        title: "Feature Versioning",
        explanation: [
          "Feature definitions can evolve independently of raw data.",
          "A feature such as customer_age_days may change if its calculation logic changes.",
          "Experiment records should therefore identify feature-generation logic or code versions.",
          "This is especially important when features are produced by reusable pipelines or feature stores."
        ],
        intuition: [
          "A column can keep the same name while its meaning changes."
        ],
        importantPoints: [
          "Version feature logic.",
          "Track semantic changes.",
          "Do not rely only on column names."
        ]
      },

      {
        id: "tracking-code-version",
        title: "Code Versioning",
        explanation: [
          "A run should ideally be linked to the code version that produced it.",
          "A Git commit hash is a common way to identify a precise repository state.",
          "Uncommitted local changes can reduce reproducibility because the recorded commit may not represent the executed code.",
          "Code versioning connects experimental evidence to implementation."
        ],
        intuition: [
          "To reproduce yesterday's model, you need yesterday's code rather than today's edited version."
        ],
        importantPoints: [
          "Track code revision.",
          "Prefer clean reproducible states.",
          "Connect runs to implementation."
        ]
      },

      {
        id: "tracking-environment",
        title: "Environment and Dependency Tracking",
        explanation: [
          "Library versions can affect algorithms, defaults, numerical behavior and serialization compatibility.",
          "Python version and important package versions should therefore be recorded.",
          "For demanding workloads, operating system, accelerator and hardware information may also matter.",
          "Environment files or container definitions can improve reproducibility."
        ],
        intuition: [
          "Code alone is not the whole experiment; the environment executing the code is part of it."
        ],
        importantPoints: [
          "Track Python and dependencies.",
          "Record relevant hardware.",
          "Preserve environment configuration."
        ]
      },

      {
        id: "tracking-seeds-deep",
        title: "Random Seeds and Determinism",
        explanation: [
          "Random seeds can control operations such as data splitting, initialization, sampling and stochastic algorithms.",
          "Every relevant source of randomness may need its own controlled state.",
          "A fixed seed improves repeatability but does not guarantee bit-for-bit determinism across every library, hardware platform or parallel implementation.",
          "Reproducibility claims should therefore be realistic."
        ],
        intuition: [
          "A seed helps replay random choices, but the entire computing environment can still influence execution."
        ],
        importantPoints: [
          "Track relevant seeds.",
          "Seed does not guarantee universal determinism.",
          "Record environment too."
        ]
      },

      {
        id: "tracking-lineage",
        title: "Experiment Lineage",
        explanation: [
          "Lineage connects a model result to the data, features, code, configuration and parent experiments that produced it.",
          "It answers questions such as where this model came from and what changed from the previous version.",
          "Good lineage is essential for debugging, auditing and production maintenance."
        ],
        intuition: [
          "Build a family tree for every important model."
        ],
        importantPoints: [
          "Connect artifacts to their origins.",
          "Record meaningful parent-child relationships.",
          "Support auditing."
        ]
      },

      {
        id: "tracking-naming",
        title: "Experiment Naming and Organization",
        explanation: [
          "Consistent naming makes large experiment collections easier to search.",
          "Names should communicate the project or experiment purpose without attempting to encode every parameter.",
          "Structured fields and tags are better than extremely long filenames for storing metadata."
        ],
        intuition: [
          "Use names for identity and metadata fields for detail."
        ],
        importantPoints: [
          "Use consistent naming.",
          "Avoid metadata-filled filenames.",
          "Organize experiments by purpose."
        ]
      },

      {
        id: "tracking-tags",
        title: "Tags and Metadata",
        explanation: [
          "Tags can record properties such as baseline, candidate, production, ablation, feature-test or failed-run.",
          "Additional metadata can identify owner, ticket, dataset, branch or experiment objective.",
          "Structured metadata makes experiments searchable and easier to compare."
        ],
        intuition: [
          "Tags turn a pile of runs into an organized experimental history."
        ],
        importantPoints: [
          "Use searchable metadata.",
          "Record experiment purpose.",
          "Support collaboration."
        ]
      },

      {
        id: "tracking-failed",
        title: "Track Failed Experiments",
        explanation: [
          "Failed runs contain valuable information.",
          "They can show which ideas were attempted, which configurations were unstable and which approaches should not be repeated.",
          "Deleting every poor result creates survivorship bias in the experimental history.",
          "Failures should be labeled rather than silently discarded."
        ],
        intuition: [
          "Knowing what did not work prevents the team from repeatedly making the same mistake."
        ],
        importantPoints: [
          "Keep meaningful failures.",
          "Record failure reasons.",
          "Avoid survivorship bias."
        ]
      },

      {
        id: "tracking-ablation",
        title: "Ablation Experiments",
        explanation: [
          "An ablation experiment removes or changes one component to estimate its contribution to the overall system.",
          "Examples include removing a feature group, disabling scaling or replacing a complex model with a baseline.",
          "Ablations are easier to interpret when other experimental conditions remain fixed."
        ],
        intuition: [
          "Remove one component and observe what performance is lost."
        ],
        importantPoints: [
          "Change one meaningful component.",
          "Keep comparison conditions consistent.",
          "Measure contribution empirically."
        ]
      },

      {
        id: "tracking-one-change",
        title: "Controlled Experimentation",
        explanation: [
          "Changing data cleaning, features, model family, hyperparameters and validation simultaneously makes attribution difficult.",
          "Controlled experiments isolate important changes when possible.",
          "Not every experiment can vary only one dimension, but differences should always be documented clearly."
        ],
        intuition: [
          "If five things change and performance improves, you do not know which change helped."
        ],
        importantPoints: [
          "Control changes.",
          "Document unavoidable differences.",
          "Make conclusions traceable."
        ]
      },

      {
        id: "tracking-fair-comparison",
        title: "Fair Model Comparison",
        explanation: [
          "Candidate models should be evaluated using equivalent data partitions, preprocessing rules and metrics whenever the comparison objective permits.",
          "Comparing the best fold of one model with the average CV score of another is invalid.",
          "Compute budget and tuning effort should also be considered when claiming one algorithm dominates another."
        ],
        intuition: [
          "Models should take the same exam under comparable preparation rules."
        ],
        importantPoints: [
          "Same evaluation protocol.",
          "Same metric definition.",
          "Report tuning effort."
        ]
      },

      {
        id: "tracking-leakage",
        title: "Experiment Tracking and Leakage Detection",
        explanation: [
          "Detailed tracking can expose suspicious methodological differences between runs.",
          "A sudden performance jump after preprocessing outside the Pipeline or after adding a post-outcome feature should trigger investigation.",
          "Tracking cannot automatically prevent leakage, but it makes the development history auditable."
        ],
        intuition: [
          "A clear experimental history makes suspicious improvements easier to investigate."
        ],
        importantPoints: [
          "Audit unusual gains.",
          "Record preprocessing location.",
          "Track feature changes."
        ]
      },

      {
        id: "tracking-mlflow-concepts",
        title: "MLflow-Style Tracking Concepts",
        explanation: [
          "Experiment-tracking platforms commonly organize work into experiments containing multiple runs.",
          "Each run can record parameters, metrics, tags and artifacts.",
          "Tracking systems can provide searchable dashboards and run comparison.",
          "The important educational concept is the tracking structure rather than dependence on one specific tool."
        ],
        intuition: [
          "Think of a searchable laboratory notebook where every model run records what went in and what came out."
        ],
        importantPoints: [
          "Experiment.",
          "Run.",
          "Parameters.",
          "Metrics.",
          "Artifacts.",
          "Tags."
        ]
      },

      {
        id: "tracking-registry",
        title: "Tracking vs Model Registry",
        explanation: [
          "Experiment tracking records development runs and evidence.",
          "A model registry focuses on managing important model artifacts and their lifecycle.",
          "Registry concepts can include model versions, aliases or deployment status depending on the platform.",
          "A selected tracked run can become the source of a registered model."
        ],
        intuition: [
          "Tracking is the laboratory notebook; the registry is the controlled catalog of models considered important enough to manage."
        ],
        importantPoints: [
          "Tracking and registry have different roles.",
          "Preserve model provenance.",
          "Connect selected models back to runs."
        ]
      },

      {
        id: "tracking-production-link",
        title: "Link Production Models Back to Experiments",
        explanation: [
          "A deployed model should be traceable to the experiment that produced it.",
          "Teams should be able to identify its data version, code revision, parameters, metrics and artifacts.",
          "This traceability makes incidents and regressions easier to investigate."
        ],
        intuition: [
          "When production fails, you should be able to trace the model back to its exact birth certificate."
        ],
        importantPoints: [
          "Maintain provenance.",
          "Support rollback and debugging.",
          "Connect deployment to evidence."
        ]
      },

      {
        id: "tracking-collaboration",
        title: "Experiment Tracking for Teams",
        explanation: [
          "Shared tracking reduces duplicated work and undocumented notebook experiments.",
          "Team members can inspect previous runs before starting new experiments.",
          "Consistent metadata and naming conventions make collaboration substantially easier.",
          "Important conclusions should be documented alongside numerical results."
        ],
        intuition: [
          "The experiment history should remain understandable even when the original author is unavailable."
        ],
        importantPoints: [
          "Shared visibility.",
          "Consistent conventions.",
          "Document conclusions."
        ]
      },

      {
        id: "tracking-cost",
        title: "Track Computational Cost",
        explanation: [
          "Two models with similar predictive performance may require very different training or inference resources.",
          "Useful tracking fields can include training duration, inference latency, memory use and hardware.",
          "These measurements help distinguish statistically better models from practically better models."
        ],
        intuition: [
          "A tiny accuracy improvement may not justify ten times the compute cost."
        ],
        importantPoints: [
          "Track runtime.",
          "Track resource requirements.",
          "Consider cost during selection."
        ]
      },

      {
        id: "tracking-checkpoints",
        title: "Checkpoints During Long Experiments",
        explanation: [
          "Long-running training processes can periodically save model state or intermediate artifacts.",
          "Checkpoints can reduce lost work after interruptions and support inspection of training progress.",
          "Checkpoint behavior depends on the model and training framework and should not be confused with final experiment tracking."
        ],
        intuition: [
          "Save progress during a long journey rather than relying only on the final destination."
        ],
        importantPoints: [
          "Useful for expensive training.",
          "Supports recovery.",
          "Final run metadata is still required."
        ]
      },

      {
        id: "tracking-security",
        title: "Privacy and Security in Experiment Tracking",
        explanation: [
          "Tracking systems should not casually store passwords, API keys, access tokens or sensitive personal data.",
          "Artifacts and logs can accidentally expose information if unrestricted raw samples are stored.",
          "Metadata design should follow organizational privacy, security and governance requirements."
        ],
        intuition: [
          "A detailed laboratory notebook should not become a place where secrets are leaked."
        ],
        importantPoints: [
          "Never log credentials.",
          "Protect sensitive data.",
          "Apply access controls where required."
        ]
      },

      {
        id: "tracking-workflow",
        title: "Complete Experiment Tracking Workflow",
        explanation: [
          "Define the experiment question.",
          "Identify the dataset and feature versions.",
          "Record code and environment versions.",
          "Record preprocessing, model and hyperparameters.",
          "Record split and validation strategy.",
          "Record random seeds.",
          "Run the experiment.",
          "Store fold-level and aggregate metrics.",
          "Store useful artifacts.",
          "Record runtime and relevant resource information.",
          "Compare against controlled baselines.",
          "Document the conclusion.",
          "Link selected artifacts to downstream model lifecycle systems."
        ],
        intuition: [
          "Every important result should answer what was tested, how it was tested, what happened and whether someone else can reproduce it."
        ],
        importantPoints: [
          "Question.",
          "Inputs.",
          "Configuration.",
          "Evaluation.",
          "Artifacts.",
          "Conclusion.",
          "Lineage."
        ]
      },

      {
        id: "tracking-mistakes",
        title: "Common Experiment Tracking Mistakes",
        explanation: [
          "Tracking only the best run.",
          "Recording metrics without validation context.",
          "Forgetting dataset versions.",
          "Ignoring preprocessing configuration.",
          "Recording a Git commit while executing uncommitted code.",
          "Assuming a random seed guarantees universal determinism.",
          "Comparing runs from different splits as though they were identical.",
          "Deleting failed experiments.",
          "Logging credentials or sensitive data.",
          "Deploying an artifact that cannot be traced to its experiment."
        ],
        intuition: [
          "Experiment tracking fails when numbers are stored but their scientific context is lost."
        ],
        importantPoints: [
          "Context.",
          "Versions.",
          "Fair comparison.",
          "Security.",
          "Traceability."
        ]
      },

      {
        id: "tracking-exam-interview",
        title: "Experiment Tracking: Exam and Interview Essentials",
        explanation: [
          "Define experiment tracking and explain why it matters.",
          "Differentiate experiment and run.",
          "Differentiate parameters, hyperparameters, metrics and artifacts.",
          "Explain why data, code and environment versions matter.",
          "Explain why random seeds do not guarantee complete reproducibility.",
          "Explain experiment lineage.",
          "Explain why failed experiments should be tracked.",
          "Explain ablation experiments.",
          "Explain fair run comparison.",
          "Differentiate experiment tracking and a model registry.",
          "Explain how tracking supports production traceability."
        ],
        intuition: [
          "A strong answer describes experiment tracking as the reproducible evidence system surrounding ML development."
        ],
        importantPoints: [
          "Runs.",
          "Metrics.",
          "Artifacts.",
          "Versions.",
          "Reproducibility.",
          "Lineage.",
          "Registry."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "experiment-tracking-dashboard",
      title: "Experiment Tracking Lab",
      description:
        "Create simulated ML runs and compare models, parameters, datasets, metrics, validation strategies and artifacts in an experiment dashboard."
    },

    codeExamples: [
      {
        id: "simple-tracking-code",
        title: "Simple Experiment Record",
        description:
          "Store reproducible experiment metadata without requiring an external tracking service.",
        language: "python",
        code: `import json
from datetime import datetime

experiment = {
    "experiment_name": "logistic_baseline_v1",
    "created_at": datetime.now().isoformat(),
    "dataset_version": "customers_v3",
    "random_state": 42,
    "validation": {
        "method": "StratifiedKFold",
        "folds": 5
    },
    "preprocessing": [
        "SimpleImputer",
        "StandardScaler"
    ],
    "model": "LogisticRegression",
    "hyperparameters": {
        "C": 1.0,
        "max_iter": 2000
    },
    "metrics": {
        "roc_auc_mean": 0.91,
        "f1_mean": 0.84
    }
}

with open(
    "experiment.json",
    "w"
) as file:
    json.dump(
        experiment,
        file,
        indent=2
    )`,
        explanation: [
          "The example records experiment configuration and results together.",
          "Real tracking platforms automate and extend this process.",
          "The principle is to make each result reproducible and comparable."
        ],
        commonMistakes: [
          "Recording only the best score.",
          "Not recording dataset versions.",
          "Changing several experimental dimensions without documenting them."
        ]
      }
    ],

    practice: [
      {
        id: "tracking-practice-1",
        title: "Missing Context",
        type: "analysis",
        difficulty: "basic",
        question:
          "Why is recording only 'accuracy = 94%' insufficient?",
        instructions: ["Think reproducibility."],
        hints: ["Which data, split, model and parameters produced it?"],
        explanation:
          "Without dataset, validation, preprocessing, model and configuration information, the result cannot be reliably reproduced or compared."
      },
      {
        id: "tracking-practice-2",
        title: "Random State",
        type: "concept",
        difficulty: "medium",
        question:
          "Why should random seeds often be recorded?",
        instructions: ["Think stochastic operations."],
        hints: ["Splits and algorithms may use randomness."],
        explanation:
          "Recording seeds helps reproduce randomized splits, initialization and sampling behavior."
      },
      {
        id: "tracking-practice-3",
        title: "Fair Comparison",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Experiment A uses one easy validation split and Experiment B uses 5-fold CV. Can their scores automatically be treated as directly comparable?",
        instructions: ["Think evaluation methodology."],
        hints: ["The tests are different."],
        explanation:
          "No. Differences in validation methodology can influence the scores, so experiment comparisons must account for how performance was measured."
      }
    ],

    keyTakeaways: [
      "ML development should be treated as experimentation.",
      "Track data, preprocessing, models, parameters and metrics.",
      "Track validation methodology.",
      "Record random seeds and software context.",
      "Store useful artifacts.",
      "Reproducibility is a core ML engineering requirement."
    ]
  },

  // =========================================================
  // 11. COMPLETE ML WORKFLOW
  // =========================================================
  "complete-ml-workflow": {
    overview:
      "A complete machine-learning workflow is much larger than model.fit(). Reliable ML begins with problem formulation and data validation, continues through exploratory analysis, leakage-safe splitting, preprocessing, feature engineering, baseline modeling, cross-validation, tuning and model selection, and finishes with final evaluation, interpretation, reproducibility and inference design.",

    objectives: [
      "Understand the complete end-to-end ML lifecycle.",
      "Frame ML problems correctly.",
      "Validate data before modeling.",
      "Perform EDA without leaking target information.",
      "Create train/validation/test strategies.",
      "Build preprocessing pipelines.",
      "Establish baselines.",
      "Compare candidate models.",
      "Use cross-validation.",
      "Tune hyperparameters.",
      "Perform error analysis.",
      "Interpret models.",
      "Track experiments.",
      "Prepare reproducible inference workflows."
    ],

    sections: [
      {
        id: "workflow-problem",
        title: "1. Problem Formulation",
        explanation: [
          "Start by defining the decision the model will support.",
          "Identify the target variable.",
          "Determine whether the task is classification, regression, clustering or another ML problem.",
          "Define the evaluation metric before extensive experimentation.",
          "Identify the real costs of different errors."
        ],
        intuition: [
          "A technically excellent model solving the wrong problem has little value."
        ],
        importantPoints: [
          "Define target and prediction unit.",
          "Define metric.",
          "Define constraints and error costs."
        ]
      },

      {
        id: "workflow-data",
        title: "2. Data Understanding and Validation",
        explanation: [
          "Inspect dataset shape, feature types, missing values, duplicates, impossible values and target quality.",
          "Understand how observations were collected.",
          "Look for features that would not be available at prediction time.",
          "Identify possible leakage before model training."
        ],
        intuition: [
          "Most serious ML failures begin before the algorithm is selected."
        ],
        importantPoints: [
          "Validate schema and data quality.",
          "Understand feature availability.",
          "Investigate leakage early."
        ]
      },

      {
        id: "workflow-split",
        title: "3. Design the Evaluation Split",
        explanation: [
          "Choose the splitting strategy based on how the model will be used.",
          "Random stratified splits may work for ordinary classification.",
          "Grouped observations may require group-aware splitting.",
          "Temporal problems require chronological splitting.",
          "Preserve a final test set."
        ],
        intuition: [
          "The validation setup should simulate the future environment in which the model will operate."
        ],
        importantPoints: [
          "Split design is part of model design.",
          "Prevent entity and temporal leakage.",
          "Keep test data outside development."
        ]
      },

      {
        id: "workflow-eda",
        title: "4. EDA and Data Cleaning",
        explanation: [
          "Explore feature distributions, missingness, relationships and suspicious values.",
          "Use EDA to form hypotheses rather than to repeatedly optimize against the final test set.",
          "Document cleaning decisions."
        ],
        intuition: [
          "EDA helps understand what the dataset actually represents before algorithms are trusted."
        ],
        importantPoints: [
          "Understand distributions.",
          "Investigate missingness and outliers.",
          "Document assumptions."
        ]
      },

      {
        id: "workflow-baseline",
        title: "5. Build a Baseline",
        explanation: [
          "Create a simple reference model.",
          "A baseline verifies that the pipeline works and establishes minimum useful performance.",
          "Complex models should demonstrate improvement over this reference."
        ],
        intuition: [
          "Do not start with the most complicated model before knowing whether a simple one already solves the problem."
        ],
        importantPoints: [
          "Start simple.",
          "Measure improvement.",
          "Debug the workflow using the baseline."
        ]
      },

      {
        id: "workflow-preprocessing",
        title: "6. Build the Preprocessing Pipeline",
        explanation: [
          "Separate numerical and categorical feature transformations.",
          "Handle missing values.",
          "Encode categorical features.",
          "Scale numerical features where required.",
          "Use ColumnTransformer and Pipeline so transformations are learned from training data only."
        ],
        intuition: [
          "The preprocessing logic is part of the model and must travel with it."
        ],
        importantPoints: [
          "Use Pipeline.",
          "Use ColumnTransformer for heterogeneous features.",
          "Prevent leakage."
        ]
      },

      {
        id: "workflow-feature",
        title: "7. Feature Engineering",
        explanation: [
          "Create features using domain knowledge and valid information available at prediction time.",
          "Examples include ratios, date components, aggregates and interactions.",
          "Every engineered feature should be checked for leakage."
        ],
        intuition: [
          "Better representation can be more valuable than a more complicated algorithm."
        ],
        importantPoints: [
          "Use domain knowledge.",
          "Avoid future information.",
          "Validate feature usefulness."
        ]
      },

      {
        id: "workflow-models",
        title: "8. Candidate Models",
        explanation: [
          "Evaluate several reasonable model families.",
          "Linear models provide strong interpretable baselines.",
          "Tree ensembles capture nonlinear interactions.",
          "Distance-based and kernel methods can be useful for appropriate feature spaces.",
          "Use consistent validation for comparison."
        ],
        intuition: [
          "Different model families make different assumptions about the data."
        ],
        importantPoints: [
          "Do not assume one algorithm is universally best.",
          "Compare models fairly."
        ]
      },

      {
        id: "workflow-cv",
        title: "9. Cross-Validation",
        explanation: [
          "Use cross-validation on training data to estimate generalization.",
          "Evaluate the entire Pipeline.",
          "Inspect both average score and fold variation."
        ],
        intuition: [
          "A good model should perform consistently across reasonable subsets of the training data."
        ],
        importantPoints: [
          "Cross-validate complete workflows.",
          "Use appropriate splitters.",
          "Inspect stability."
        ]
      },

      {
        id: "workflow-tuning",
        title: "10. Hyperparameter Tuning",
        explanation: [
          "Tune only after establishing useful baselines.",
          "Choose informed search spaces.",
          "Optimize a metric aligned with the problem.",
          "Keep the test set outside the tuning process."
        ],
        intuition: [
          "Tuning should refine a promising workflow rather than rescue a fundamentally poor experiment."
        ],
        importantPoints: [
          "Tune on training CV.",
          "Avoid huge blind searches.",
          "Track experiments."
        ]
      },

      {
        id: "workflow-selection",
        title: "11. Model Selection",
        explanation: [
          "Compare candidate workflows using consistent evidence.",
          "Consider predictive performance, stability, inference cost, interpretability and maintenance.",
          "Select the model before final test evaluation."
        ],
        intuition: [
          "The chosen model must satisfy the whole application, not merely one score."
        ],
        importantPoints: [
          "Consider operational constraints.",
          "Do not select from test-set results."
        ]
      },

      {
        id: "workflow-error",
        title: "12. Error Analysis",
        explanation: [
          "Inspect false positives, false negatives and large regression errors.",
          "Look for recurring subgroups or data-quality issues.",
          "Use errors to form hypotheses for the next experiment."
        ],
        intuition: [
          "Aggregate metrics tell you how much the model fails. Error analysis helps reveal how it fails."
        ],
        importantPoints: [
          "Inspect individual errors.",
          "Search for systematic failure patterns.",
          "Do not hide difficult subgroups inside averages."
        ]
      },

      {
        id: "workflow-final",
        title: "13. Final Test Evaluation",
        explanation: [
          "After model selection is complete, evaluate the selected workflow on the untouched test set.",
          "Report relevant metrics and uncertainty where appropriate.",
          "Do not continue tuning against the test results."
        ],
        intuition: [
          "The final test is the closest available simulation of genuinely unseen performance."
        ],
        importantPoints: [
          "Use the test set once the workflow is fixed.",
          "Report metrics honestly.",
          "Do not hide unfavorable results."
        ]
      },

      {
        id: "workflow-interpret",
        title: "14. Interpretation and Limitations",
        explanation: [
          "Understand which features influence predictions.",
          "Inspect global and local explanations where appropriate.",
          "Document where the model should not be trusted.",
          "Do not turn predictive explanations into unsupported causal claims."
        ],
        intuition: [
          "A production model needs documented boundaries, not only a score."
        ],
        importantPoints: [
          "Explain model behavior.",
          "Document limitations.",
          "Avoid causal overclaiming."
        ]
      },

      {
        id: "workflow-track",
        title: "15. Reproducibility and Experiment Tracking",
        explanation: [
          "Record dataset versions, code versions, hyperparameters, validation strategy, random seeds and metrics.",
          "Save the final fitted workflow and environment information.",
          "Make important experiments reproducible."
        ],
        intuition: [
          "A model result that cannot be recreated cannot be reliably maintained."
        ],
        importantPoints: [
          "Track experiments.",
          "Version code and data.",
          "Record dependencies."
        ]
      },

      {
        id: "workflow-inference",
        title: "16. Inference Workflow",
        explanation: [
          "The same preprocessing used during training must be applied during inference.",
          "Saving a Pipeline reduces training-serving mismatch.",
          "Input schemas should be validated before prediction.",
          "Production systems should monitor data and model behavior over time."
        ],
        intuition: [
          "Training and production must speak the same feature language."
        ],
        importantPoints: [
          "Deploy preprocessing with the model.",
          "Validate input schema.",
          "Prepare for monitoring and future retraining."
        ]
      },
            {
        id: "workflow-business-objective",
        title: "17. Translate the Real Problem into an ML Objective",
        explanation: [
          "A business or scientific problem is not automatically an ML problem.",
          "First identify the decision that must improve and determine whether prediction can actually support that decision.",
          "Define who consumes the prediction, when it is produced and what action follows.",
          "A model should have a clear operational purpose before optimization begins."
        ],
        intuition: [
          "Do not build a prediction merely because a target column exists."
        ],
        importantPoints: [
          "Start from the decision.",
          "Define prediction timing.",
          "Define downstream action."
        ]
      },

      {
        id: "workflow-success",
        title: "18. Define Success Criteria",
        explanation: [
          "Technical metrics should be connected to application outcomes.",
          "Success criteria can include predictive quality, latency, interpretability, reliability, cost and operational constraints.",
          "A minimum acceptable baseline should be defined where possible.",
          "Different stakeholders may value different types of errors."
        ],
        intuition: [
          "Know what winning means before training models."
        ],
        importantPoints: [
          "Define technical success.",
          "Define operational success.",
          "Define constraints."
        ]
      },

      {
        id: "workflow-unit",
        title: "19. Define the Prediction Unit",
        explanation: [
          "Specify exactly what one row represents.",
          "It might represent one patient encounter, customer, transaction, machine-hour or image.",
          "Ambiguity about the prediction unit can cause duplicate entities, invalid splitting and leakage.",
          "The unit should align with how predictions will be generated in production."
        ],
        intuition: [
          "Before modeling rows, know what each row actually means."
        ],
        importantPoints: [
          "Define observation unit.",
          "Check repeated entities.",
          "Align with inference."
        ]
      },

      {
        id: "workflow-target",
        title: "20. Target Definition and Label Quality",
        explanation: [
          "The target must represent the outcome the application actually cares about.",
          "Labels can contain measurement error, inconsistent definitions or missing outcomes.",
          "A model cannot reliably learn a concept that the labels themselves represent poorly.",
          "Target construction should be documented and versioned."
        ],
        intuition: [
          "The model learns from the answers you provide; unreliable answers produce unreliable supervision."
        ],
        importantPoints: [
          "Validate target meaning.",
          "Inspect label quality.",
          "Version target logic."
        ]
      },

      {
        id: "workflow-prediction-time",
        title: "21. Define the Prediction-Time Boundary",
        explanation: [
          "For every feature, ask whether its value would truly exist at the moment the prediction is made.",
          "Features created after the outcome or after the decision point cause temporal leakage.",
          "The prediction-time boundary provides a powerful way to audit feature validity."
        ],
        intuition: [
          "Freeze time at the moment of prediction and remove everything the model could not know yet."
        ],
        importantPoints: [
          "Feature availability is time-dependent.",
          "Prevent future-information leakage.",
          "Audit every feature."
        ]
      },

      {
        id: "workflow-data-source",
        title: "22. Understand Data Generation",
        explanation: [
          "Study where each feature originates and how it is measured.",
          "Collection processes can create selection bias, missingness patterns and measurement artifacts.",
          "A predictive pattern may reflect how data was collected rather than the phenomenon of interest.",
          "Domain experts are often essential for understanding these mechanisms."
        ],
        intuition: [
          "Data is produced by a process; understand that process before trusting patterns."
        ],
        importantPoints: [
          "Understand collection.",
          "Identify measurement bias.",
          "Use domain knowledge."
        ]
      },

      {
        id: "workflow-schema",
        title: "23. Data Schema Validation",
        explanation: [
          "Validate column names, types, ranges, categories and required fields.",
          "Check uniqueness constraints and identifiers.",
          "Schema assumptions used during training should later become inference-time validation rules.",
          "Silent schema changes can break models even when code still executes."
        ],
        intuition: [
          "Validate the shape and meaning of incoming data before trusting its values."
        ],
        importantPoints: [
          "Types.",
          "Ranges.",
          "Categories.",
          "Required columns."
        ]
      },

      {
        id: "workflow-duplicates",
        title: "24. Duplicates and Entity Leakage",
        explanation: [
          "Duplicate or near-duplicate observations can inflate evaluation scores if related rows appear across training and validation sets.",
          "Repeated entities can create a similar problem even when rows are not identical.",
          "Group-aware splitting may be necessary when multiple observations belong to the same entity."
        ],
        intuition: [
          "A model should not receive nearly the same question during training and validation."
        ],
        importantPoints: [
          "Inspect duplicates.",
          "Identify repeated entities.",
          "Use group-aware splitting when required."
        ]
      },

      {
        id: "workflow-missing",
        title: "25. Missing-Value Analysis",
        explanation: [
          "Measure missingness by feature and relevant subgroup.",
          "Investigate whether missingness reflects random absence, data-collection processes or meaningful operational behavior.",
          "Choose imputation methods based on feature meaning and model requirements.",
          "Imputation statistics must be learned from training data only."
        ],
        intuition: [
          "Missing values can be both a data-quality problem and information about the process that created the data."
        ],
        importantPoints: [
          "Measure missingness.",
          "Understand why values are missing.",
          "Fit imputers inside the training workflow."
        ]
      },

      {
        id: "workflow-outliers",
        title: "26. Outlier Investigation",
        explanation: [
          "Outliers can represent valid rare events, measurement errors or data-entry mistakes.",
          "Do not remove observations merely because they are numerically unusual.",
          "Investigate their origin and consider model sensitivity.",
          "Any clipping or transformation rule should be learned without leaking validation or test information."
        ],
        intuition: [
          "An unusual observation may be the most important example in the dataset."
        ],
        importantPoints: [
          "Investigate before removing.",
          "Distinguish error from rarity.",
          "Avoid leakage in transformations."
        ]
      },

      {
        id: "workflow-eda-target",
        title: "27. Target-Aware EDA Without Test Leakage",
        explanation: [
          "Relationships between features and target are useful for understanding predictive structure.",
          "However, repeated exploration of the final test set gradually turns it into development data.",
          "Detailed target-aware analysis should primarily use training data after the evaluation split has been designed."
        ],
        intuition: [
          "Explore deeply, but do not study the answers from the final exam."
        ],
        importantPoints: [
          "EDA can influence modeling.",
          "Protect final test data.",
          "Use training data for development."
        ]
      },

      {
        id: "workflow-distributions",
        title: "28. Analyze Feature Distributions",
        explanation: [
          "Inspect numerical distributions, categorical frequencies, skewness, ranges and rare categories.",
          "Distribution analysis guides transformations, scaling and data-quality investigation.",
          "Compare important distributions across splits to identify suspicious differences."
        ],
        intuition: [
          "Understand the shape of the input space before choosing how algorithms should process it."
        ],
        importantPoints: [
          "Numerical distributions.",
          "Category frequencies.",
          "Split differences."
        ]
      },

      {
        id: "workflow-split-random",
        title: "29. Random and Stratified Splitting",
        explanation: [
          "Random splitting can be suitable when observations are approximately independent and identically distributed.",
          "For classification, stratification can preserve class proportions across splits.",
          "Neither approach protects against temporal or entity leakage when those structures exist."
        ],
        intuition: [
          "Random splitting works only when randomly mixing observations represents the future task."
        ],
        importantPoints: [
          "Check independence assumptions.",
          "Use stratification when appropriate.",
          "Do not use random splitting blindly."
        ]
      },

      {
        id: "workflow-split-group",
        title: "30. Group-Aware Splitting",
        explanation: [
          "When multiple observations belong to the same patient, customer, machine or other entity, ordinary random splitting can leak entity-specific information.",
          "Group-aware splitting keeps related observations together.",
          "The grouping variable should represent the dependency that must not cross evaluation boundaries."
        ],
        intuition: [
          "Do not train on one visit from a patient and pretend another visit from the same patient is completely unseen."
        ],
        importantPoints: [
          "Identify dependent observations.",
          "Keep groups separated.",
          "Match deployment conditions."
        ]
      },

      {
        id: "workflow-split-time",
        title: "31. Temporal Splitting",
        explanation: [
          "When predicting future events from historical data, training should generally precede validation and test periods in time.",
          "Randomly mixing future observations into training can create unrealistic evaluation.",
          "Temporal gaps may also be required when labels or features overlap across time windows."
        ],
        intuition: [
          "To simulate tomorrow, train on yesterday rather than secretly borrowing information from tomorrow."
        ],
        importantPoints: [
          "Preserve chronology.",
          "Prevent future leakage.",
          "Consider temporal gaps."
        ]
      },

      {
        id: "workflow-test-lock",
        title: "32. Lock the Final Test Set",
        explanation: [
          "The final test set should remain outside routine model development.",
          "Model families, features, hyperparameters and thresholds should normally be selected without repeatedly consulting final test performance.",
          "Repeated test-driven decisions create test-set overfitting."
        ],
        intuition: [
          "The final exam stops being a fair exam once you repeatedly study its answers."
        ],
        importantPoints: [
          "Protect independence.",
          "Do not tune on test results.",
          "Use validation or CV for decisions."
        ]
      },

      {
        id: "workflow-preprocessing-fit",
        title: "33. Fit Preprocessing Only on Training Data",
        explanation: [
          "Imputation values, scaling statistics, category encodings and feature-selection rules can all learn information from data.",
          "If fitted before splitting, information from validation or test observations can influence training.",
          "Pipelines ensure transformations are refitted correctly within cross-validation folds."
        ],
        intuition: [
          "Even preprocessing can accidentally look at the answers."
        ],
        importantPoints: [
          "Transformers learn parameters.",
          "Fit inside folds.",
          "Use Pipeline."
        ]
      },

      {
        id: "workflow-column-transformer",
        title: "34. ColumnTransformer Design",
        explanation: [
          "Different feature types often require different preprocessing branches.",
          "Numerical features may require imputation and scaling while categorical features may require imputation and encoding.",
          "ColumnTransformer combines these branches into one reproducible transformation graph.",
          "The resulting transformer can be placed inside a Pipeline with the estimator."
        ],
        intuition: [
          "Send each feature type through the preparation process designed for it, then recombine the outputs."
        ],
        importantPoints: [
          "Separate feature branches.",
          "Combine reproducibly.",
          "Integrate with Pipeline."
        ]
      },

      {
        id: "workflow-baseline-types",
        title: "35. Baselines: Dummy, Simple and Domain",
        explanation: [
          "A dummy baseline establishes performance achievable with trivial prediction rules.",
          "A simple statistical or linear model provides a stronger modeling baseline.",
          "Domain heuristics can provide another useful reference when an existing rule-based process already exists.",
          "A sophisticated model should justify its complexity by outperforming meaningful baselines."
        ],
        intuition: [
          "Before celebrating an ML model, prove it beats doing almost nothing and beats the obvious simple approach."
        ],
        importantPoints: [
          "Dummy baseline.",
          "Simple model baseline.",
          "Domain baseline."
        ]
      },

      {
        id: "workflow-feature-engineering-deep",
        title: "36. Feature Engineering Safely",
        explanation: [
          "Feature engineering can encode domain knowledge into useful model inputs.",
          "Transformations must use only information available at prediction time.",
          "Aggregated historical features require careful time windows so future events do not leak backward.",
          "Feature usefulness should be validated empirically."
        ],
        intuition: [
          "A powerful feature is valuable only if production can actually calculate it at prediction time."
        ],
        importantPoints: [
          "Use domain knowledge.",
          "Respect time boundaries.",
          "Validate improvements."
        ]
      },

      {
        id: "workflow-feature-selection",
        title: "37. Feature Selection Inside Validation",
        explanation: [
          "Feature selection is itself a data-dependent learning step.",
          "Selecting features using the full dataset before cross-validation leaks validation information.",
          "When feature selection is part of the modeling process, it should occur inside the cross-validated Pipeline."
        ],
        intuition: [
          "Choosing which questions matter after seeing every exam answer leaks information just like model fitting."
        ],
        importantPoints: [
          "Feature selection can leak.",
          "Place it inside Pipeline.",
          "Validate selected features."
        ]
      },

      {
        id: "workflow-model-family",
        title: "38. Select Candidate Model Families Intelligently",
        explanation: [
          "Choose model families based on dataset size, feature structure, nonlinear relationships, interpretability needs and computational constraints.",
          "Linear models offer strong baselines and interpretability.",
          "Tree ensembles handle nonlinear tabular interactions effectively.",
          "Distance and kernel methods have different scaling and dimensionality requirements.",
          "Candidate selection should be reasoned rather than fashionable."
        ],
        intuition: [
          "Choose tools based on the problem rather than choosing the newest tool first."
        ],
        importantPoints: [
          "Consider assumptions.",
          "Consider data structure.",
          "Consider operational constraints."
        ]
      },

      {
        id: "workflow-cv-strategy",
        title: "39. Match Cross-Validation to the Data",
        explanation: [
          "KFold, StratifiedKFold, GroupKFold and TimeSeriesSplit represent different assumptions.",
          "The cross-validation strategy should reproduce important dependencies of the deployment setting.",
          "A mathematically valid splitter can still be operationally invalid for the problem."
        ],
        intuition: [
          "Cross-validation should simulate repeated versions of the real future test."
        ],
        importantPoints: [
          "Choose splitter deliberately.",
          "Preserve groups or chronology.",
          "Match deployment."
        ]
      },

      {
        id: "workflow-metrics",
        title: "40. Select Metrics from Error Costs",
        explanation: [
          "Metrics should reflect the consequences of model decisions.",
          "Accuracy can be misleading for imbalanced classification.",
          "Precision, recall, F1, PR-AUC, ROC-AUC, log loss and calibration answer different questions.",
          "Regression metrics such as MAE and RMSE emphasize errors differently.",
          "The primary metric should be chosen before large-scale tuning where possible."
        ],
        intuition: [
          "Choose the scoreboard according to what mistakes actually cost."
        ],
        importantPoints: [
          "Metric follows objective.",
          "Imbalance affects metric choice.",
          "Different metrics answer different questions."
        ]
      },

      {
        id: "workflow-imbalance",
        title: "41. Handle Class Imbalance Correctly",
        explanation: [
          "Begin by selecting suitable metrics and stratified evaluation.",
          "Consider class weights, threshold adjustment or resampling when appropriate.",
          "Any learned or synthetic resampling procedure must be restricted to training folds.",
          "Evaluate whether improvements help the class and error type that actually matter."
        ],
        intuition: [
          "Do not fix imbalance by contaminating validation data or by optimizing a metric that hides minority failure."
        ],
        importantPoints: [
          "Use suitable metrics.",
          "Resample training only.",
          "Evaluate minority performance."
        ]
      },

      {
        id: "workflow-tuning-space",
        title: "42. Design Hyperparameter Search Spaces",
        explanation: [
          "Search spaces should reflect how model parameters affect behavior.",
          "Parameters spanning orders of magnitude are often better searched on logarithmic scales.",
          "Conditional parameters should be searched only where they apply.",
          "Extremely broad blind grids can waste large amounts of computation."
        ],
        intuition: [
          "Search where good answers are plausible instead of checking every imaginable combination."
        ],
        importantPoints: [
          "Use informed ranges.",
          "Use appropriate scales.",
          "Respect conditional parameters."
        ]
      },

      {
        id: "workflow-tuning-method",
        title: "43. Grid Search, Random Search and Smarter Search",
        explanation: [
          "Grid search evaluates predefined combinations exhaustively.",
          "Random search samples configurations and can explore large spaces more efficiently.",
          "More advanced optimization frameworks can allocate search effort adaptively.",
          "Regardless of search algorithm, evaluation methodology and test-set isolation remain essential."
        ],
        intuition: [
          "Changing how configurations are searched does not change the rules of fair evaluation."
        ],
        importantPoints: [
          "Grid is systematic.",
          "Random search can cover broad spaces efficiently.",
          "Search method does not prevent leakage."
        ]
      },

      {
        id: "workflow-selection-deep",
        title: "44. Model Selection Is Multi-Objective",
        explanation: [
          "The highest validation score is not always the best deployable model.",
          "Selection can consider score, variability, calibration, interpretability, latency, memory, training cost and maintenance burden.",
          "Prefer the simplest model that satisfies the application's actual requirements when performance differences are negligible."
        ],
        intuition: [
          "Choose the best complete solution, not merely the highest leaderboard number."
        ],
        importantPoints: [
          "Performance.",
          "Stability.",
          "Interpretability.",
          "Cost.",
          "Maintainability."
        ]
      },

      {
        id: "workflow-threshold",
        title: "45. Decision Threshold Selection",
        explanation: [
          "Probability-producing classifiers still require a decision threshold when converting scores into class decisions.",
          "The default threshold may not minimize real application cost.",
          "Thresholds should be selected using validation evidence rather than the final test set.",
          "Changing the threshold changes precision, recall, false-positive rate and false-negative rate."
        ],
        intuition: [
          "Training determines the scoring model; threshold selection determines where the final decision boundary is placed."
        ],
        importantPoints: [
          "Threshold is a decision parameter.",
          "Tune on validation data.",
          "Use error costs."
        ]
      },

      {
        id: "workflow-calibration",
        title: "46. Probability Calibration",
        explanation: [
          "A classifier can rank observations well while producing poorly calibrated probabilities.",
          "Calibration asks whether predicted probabilities correspond to observed event frequencies.",
          "Calibration is important when probabilities themselves drive decisions.",
          "Calibration procedures must be fitted without contaminating final evaluation data."
        ],
        intuition: [
          "If a model repeatedly says 80%, roughly 80% of comparable cases should occur when probabilities are well calibrated."
        ],
        importantPoints: [
          "Ranking and calibration differ.",
          "Probability quality can matter.",
          "Calibrate without leakage."
        ]
      },

      {
        id: "workflow-error-analysis-deep",
        title: "47. Structured Error Analysis",
        explanation: [
          "Create groups of important failures rather than inspecting only random examples.",
          "For classification, investigate false positives and false negatives separately.",
          "For regression, inspect large residuals and systematic underprediction or overprediction.",
          "Compare errors across subgroups, feature ranges and data-quality conditions."
        ],
        intuition: [
          "Turn mistakes into categories that can generate the next engineering hypothesis."
        ],
        importantPoints: [
          "Categorize failures.",
          "Inspect subgroups.",
          "Generate hypotheses."
        ]
      },

      {
        id: "workflow-learning-curves",
        title: "48. Diagnose Bias and Variance",
        explanation: [
          "Learning curves can help distinguish high bias from high variance.",
          "Poor training and validation performance can suggest underfitting.",
          "Strong training performance with substantially weaker validation performance can suggest overfitting.",
          "The diagnosis guides whether to change complexity, regularization, features or data quantity."
        ],
        intuition: [
          "Do not prescribe more data or a more complex model before diagnosing the failure."
        ],
        importantPoints: [
          "Diagnose before changing.",
          "Bias and variance require different remedies.",
          "Use learning curves."
        ]
      },

      {
        id: "workflow-interpretability",
        title: "49. Interpret the Selected Model",
        explanation: [
          "Use interpretation methods appropriate for the selected estimator and application.",
          "Global interpretation can reveal broad feature dependence.",
          "Local methods can investigate individual decisions.",
          "SHAP, permutation importance, coefficients, tree importance, PDP and ICE answer different explanation questions.",
          "Predictive explanations must not be presented as causal evidence."
        ],
        intuition: [
          "Understand how the chosen model behaves before trusting it in important decisions."
        ],
        importantPoints: [
          "Global and local explanation.",
          "Match method to question.",
          "Avoid causal overclaiming."
        ]
      },

      {
        id: "workflow-subgroups",
        title: "50. Subgroup Evaluation",
        explanation: [
          "Aggregate performance can hide severe failures in important subgroups.",
          "Evaluate relevant groups when justified by the application and available data.",
          "Check both sample size and uncertainty because very small groups can produce unstable estimates.",
          "Subgroup analysis should be planned carefully rather than used for unsupported conclusions."
        ],
        intuition: [
          "A good average can hide a model that performs badly for a smaller population."
        ],
        importantPoints: [
          "Inspect meaningful subgroups.",
          "Consider sample size.",
          "Report uncertainty."
        ]
      },

      {
        id: "workflow-robustness",
        title: "51. Robustness Testing",
        explanation: [
          "Test how the model behaves under plausible variation in inputs.",
          "Inspect sensitivity to missing values, rare categories, measurement noise and distribution changes where relevant.",
          "Robustness testing helps identify assumptions that normal validation metrics may not expose."
        ],
        intuition: [
          "A model should not collapse when realistic imperfections appear."
        ],
        importantPoints: [
          "Test realistic perturbations.",
          "Investigate edge cases.",
          "Document failure boundaries."
        ]
      },

      {
        id: "workflow-final-protocol",
        title: "52. Freeze the Workflow Before Final Testing",
        explanation: [
          "Before final test evaluation, freeze preprocessing, feature logic, model family, hyperparameters, threshold and other development decisions.",
          "Then evaluate the complete frozen workflow on untouched test data.",
          "This preserves the interpretation of the test result as an independent evaluation."
        ],
        intuition: [
          "Finish studying before opening the final exam."
        ],
        importantPoints: [
          "Freeze decisions.",
          "Evaluate once appropriately.",
          "Do not tune afterward using the same test."
        ]
      },

      {
        id: "workflow-final-report",
        title: "53. Report Final Performance Completely",
        explanation: [
          "Report the primary metric and relevant secondary metrics.",
          "Include confusion matrices or error distributions when useful.",
          "Document the test population, sample size, threshold and evaluation protocol.",
          "Report known limitations and uncertainty rather than presenting one score without context."
        ],
        intuition: [
          "A trustworthy result explains what was measured, on whom and under which conditions."
        ],
        importantPoints: [
          "Report context.",
          "Report limitations.",
          "Avoid selective reporting."
        ]
      },

      {
        id: "workflow-reproducibility",
        title: "54. Package Reproducibility Evidence",
        explanation: [
          "Record data version, code revision, environment, random seeds, preprocessing, hyperparameters and evaluation configuration.",
          "Store the final fitted Pipeline and relevant reports.",
          "Link the final model artifact back to its experiment.",
          "Another qualified developer should be able to understand how the result was produced."
        ],
        intuition: [
          "A final model should come with a technical birth certificate."
        ],
        importantPoints: [
          "Data.",
          "Code.",
          "Environment.",
          "Configuration.",
          "Artifacts."
        ]
      },

      {
        id: "workflow-serialization",
        title: "55. Serialize the Complete Inference Pipeline",
        explanation: [
          "The production artifact should preserve transformations required by the estimator.",
          "Saving only the final classifier or regressor can cause training-serving mismatch.",
          "Serialization compatibility and library versions should be managed deliberately.",
          "Artifacts from untrusted sources should not be loaded blindly."
        ],
        intuition: [
          "Production needs the same transformation machine that training used."
        ],
        importantPoints: [
          "Save complete workflow.",
          "Track versions.",
          "Treat serialized artifacts securely."
        ]
      },

      {
        id: "workflow-inference-schema",
        title: "56. Validate Production Inputs",
        explanation: [
          "Production systems should verify required columns, data types, valid ranges and categories before prediction.",
          "Unexpected schema changes should produce clear errors or controlled handling rather than silent corruption.",
          "Input validation forms a boundary between external data and the model."
        ],
        intuition: [
          "Do not allow malformed inputs to silently flow into a trained model."
        ],
        importantPoints: [
          "Validate schema.",
          "Handle unexpected values.",
          "Fail safely."
        ]
      },

      {
        id: "workflow-batch-online",
        title: "57. Batch vs Online Inference",
        explanation: [
          "Batch inference produces predictions for groups of observations periodically.",
          "Online inference serves predictions on demand, often under stricter latency constraints.",
          "The appropriate design depends on freshness requirements, scale, cost and application architecture.",
          "Model choice can therefore be constrained by inference mode."
        ],
        intuition: [
          "Some predictions can wait for a nightly job; others must arrive while the user is waiting."
        ],
        importantPoints: [
          "Batch and online differ.",
          "Latency requirements matter.",
          "Architecture affects model selection."
        ]
      },

      {
        id: "workflow-training-serving",
        title: "58. Prevent Training-Serving Skew",
        explanation: [
          "Training-serving skew occurs when production features or transformations differ from those used during training.",
          "Using shared transformation logic and complete Pipelines reduces this risk.",
          "Feature definitions should remain consistent across offline and online systems."
        ],
        intuition: [
          "The deployed model must receive the same language of features it learned during training."
        ],
        importantPoints: [
          "Share transformation logic.",
          "Version features.",
          "Monitor consistency."
        ]
      },

      {
        id: "workflow-monitor-input",
        title: "59. Monitor Input Data",
        explanation: [
          "Monitor missingness, ranges, category frequencies and important feature distributions.",
          "Schema failures and sudden distribution changes can indicate broken upstream systems.",
          "Input monitoring can detect problems before labels become available."
        ],
        intuition: [
          "Watch what enters the model, not only what comes out."
        ],
        importantPoints: [
          "Schema.",
          "Missingness.",
          "Distributions.",
          "Categories."
        ]
      },

      {
        id: "workflow-drift",
        title: "60. Data Drift and Concept Drift",
        explanation: [
          "Data drift refers broadly to changes in input distributions.",
          "Concept drift refers to changes in the relationship between inputs and the target.",
          "Input drift does not always imply performance degradation, and performance degradation can occur without obvious marginal feature drift.",
          "Monitoring should therefore combine data signals with outcome-based performance when labels become available."
        ],
        intuition: [
          "The world can change in what cases arrive, in how outcomes behave, or both."
        ],
        importantPoints: [
          "Data drift.",
          "Concept drift.",
          "Monitor actual performance."
        ]
      },

      {
        id: "workflow-monitor-predictions",
        title: "61. Monitor Prediction Behavior",
        explanation: [
          "Track prediction distributions, score distributions and class rates where appropriate.",
          "Sudden shifts can indicate data changes, pipeline failures or genuine population changes.",
          "Prediction monitoring is diagnostic and should be interpreted with input and outcome information."
        ],
        intuition: [
          "If the model suddenly predicts positive ten times more often, investigate why."
        ],
        importantPoints: [
          "Monitor outputs.",
          "Investigate sudden shifts.",
          "Combine with other signals."
        ]
      },

      {
        id: "workflow-monitor-performance",
        title: "62. Monitor Real Performance",
        explanation: [
          "When ground-truth labels become available, calculate production performance using metrics aligned with the original objective.",
          "Compare performance over time and across important subgroups.",
          "Account for label delay when designing monitoring systems."
        ],
        intuition: [
          "The ultimate question is not whether inputs changed but whether the model still works."
        ],
        importantPoints: [
          "Monitor target metrics.",
          "Handle delayed labels.",
          "Inspect subgroups."
        ]
      },

      {
        id: "workflow-monitor-calibration",
        title: "63. Monitor Calibration and Threshold Behavior",
        explanation: [
          "Probability calibration can deteriorate as deployment conditions change.",
          "A fixed decision threshold can also become inappropriate if class prevalence or costs change.",
          "Production monitoring should therefore evaluate probability quality and decision outcomes when they matter."
        ],
        intuition: [
          "Even if ranking remains useful, the meaning of a predicted 80% can change over time."
        ],
        importantPoints: [
          "Calibration can drift.",
          "Threshold effectiveness can change.",
          "Monitor decision outcomes."
        ]
      },

      {
        id: "workflow-retraining",
        title: "64. Retraining Strategy",
        explanation: [
          "Retraining can occur on a schedule, after enough new labeled data arrives or when monitoring identifies meaningful degradation.",
          "Retraining should not automatically replace the production model.",
          "The new candidate should pass the same validation, comparison and governance requirements as other model versions."
        ],
        intuition: [
          "Newer is not automatically better."
        ],
        importantPoints: [
          "Define retraining triggers.",
          "Validate new candidates.",
          "Compare against current production model."
        ]
      },

      {
        id: "workflow-champion",
        title: "65. Champion-Challenger Evaluation",
        explanation: [
          "The currently deployed model can be treated as the champion.",
          "New candidate models act as challengers.",
          "Challengers should demonstrate meaningful improvement under fair evaluation before replacement.",
          "This creates a disciplined path for model evolution."
        ],
        intuition: [
          "A new model earns production by defeating the existing model under the right tests."
        ],
        importantPoints: [
          "Keep a production reference.",
          "Evaluate challengers fairly.",
          "Require meaningful improvement."
        ]
      },

      {
        id: "workflow-rollback",
        title: "66. Rollback Planning",
        explanation: [
          "Production deployments should have a strategy for reverting to a previous reliable model when serious problems appear.",
          "Model versioning and artifact provenance support rollback.",
          "A deployment process without a recovery path increases operational risk."
        ],
        intuition: [
          "Know how to return to the last safe version before deploying the next one."
        ],
        importantPoints: [
          "Version models.",
          "Preserve previous artifacts.",
          "Plan recovery."
        ]
      },

      {
        id: "workflow-documentation",
        title: "67. Model Documentation",
        explanation: [
          "Document intended use, training data context, metrics, limitations, important assumptions and known failure modes.",
          "Document preprocessing and feature requirements.",
          "Documentation supports users, reviewers and future maintainers."
        ],
        intuition: [
          "The model should remain understandable after its original developer leaves the project."
        ],
        importantPoints: [
          "Intended use.",
          "Metrics.",
          "Limitations.",
          "Feature requirements."
        ]
      },

      {
        id: "workflow-governance",
        title: "68. Privacy, Security and Governance",
        explanation: [
          "ML workflows may involve sensitive or regulated data.",
          "Access controls, data minimization, secure storage and appropriate retention can be required.",
          "Secrets such as API keys must not be embedded in datasets, notebooks or experiment logs.",
          "Governance requirements should be considered throughout the lifecycle rather than added only at deployment."
        ],
        intuition: [
          "A technically good model is not production-ready if the workflow handles data irresponsibly."
        ],
        importantPoints: [
          "Protect sensitive data.",
          "Protect credentials.",
          "Follow applicable governance requirements."
        ]
      },

      {
        id: "workflow-cost",
        title: "69. Cost and Performance Engineering",
        explanation: [
          "Measure training time, inference latency, throughput, memory use and infrastructure requirements where relevant.",
          "A small metric improvement may not justify a major increase in operational cost.",
          "Optimization should consider the complete system rather than predictive score alone."
        ],
        intuition: [
          "The best model on a notebook may not be the best model to operate every day."
        ],
        importantPoints: [
          "Training cost.",
          "Inference cost.",
          "Latency.",
          "Memory."
        ]
      },

      {
        id: "workflow-feedback",
        title: "70. Feedback Loops",
        explanation: [
          "Model predictions can influence the data collected later.",
          "For example, recommendations affect what users click, and fraud blocking affects which transactions complete.",
          "These feedback loops can change future training data and complicate evaluation.",
          "Production ML should consider how model decisions alter the environment."
        ],
        intuition: [
          "Once deployed, the model can become part of the system that generates its future data."
        ],
        importantPoints: [
          "Predictions can affect future data.",
          "Watch selection effects.",
          "Account for feedback loops."
        ]
      },

      {
        id: "workflow-lifecycle-loop",
        title: "71. ML Is a Lifecycle, Not a Straight Line",
        explanation: [
          "The workflow is iterative.",
          "Error analysis can lead back to data collection.",
          "Monitoring can trigger retraining.",
          "Interpretability can expose feature problems.",
          "Production failures can change problem formulation itself.",
          "The goal is controlled iteration rather than a one-time sequence of modeling steps."
        ],
        intuition: [
          "Production ML is a loop of learning, validation, deployment and observation."
        ],
        importantPoints: [
          "Iterate deliberately.",
          "Use evidence to decide what to revisit.",
          "Maintain experiment history."
        ]
      },

      {
        id: "workflow-complete-checklist",
        title: "72. End-to-End ML Checklist",
        explanation: [
          "Define the decision, target, prediction unit and success criteria.",
          "Understand data generation and prediction-time availability.",
          "Validate schema, labels, missingness, duplicates and outliers.",
          "Design leakage-safe train, validation and test partitions.",
          "Perform EDA primarily on development data.",
          "Build reproducible preprocessing.",
          "Establish meaningful baselines.",
          "Engineer and select features safely.",
          "Compare suitable model families.",
          "Use appropriate cross-validation and metrics.",
          "Tune promising workflows.",
          "Handle imbalance, calibration and thresholds where required.",
          "Perform structured error analysis.",
          "Interpret the selected model.",
          "Freeze the workflow and evaluate the final test set.",
          "Track data, code, environment and artifacts.",
          "Deploy the complete inference workflow.",
          "Validate production inputs.",
          "Monitor data, predictions and performance.",
          "Retrain and replace models only after controlled evaluation."
        ],
        intuition: [
          "Reliable ML comes from getting the entire lifecycle right rather than maximizing sophistication at one step."
        ],
        importantPoints: [
          "Problem.",
          "Data.",
          "Evaluation.",
          "Pipeline.",
          "Models.",
          "Testing.",
          "Deployment.",
          "Monitoring."
        ]
      },

      {
        id: "workflow-exam-scenario",
        title: "73. How to Answer an End-to-End ML Exam Question",
        explanation: [
          "Start with problem and target definition.",
          "Explain data cleaning and EDA.",
          "Describe leakage-safe splitting.",
          "Explain preprocessing using Pipeline.",
          "Establish a baseline.",
          "Compare suitable models.",
          "Use cross-validation.",
          "Tune hyperparameters using training data.",
          "Evaluate with problem-appropriate metrics.",
          "Perform error analysis and interpretation.",
          "Use the untouched test set for final evaluation.",
          "Finish with reproducibility, deployment and monitoring."
        ],
        intuition: [
          "A complete answer follows the lifecycle instead of jumping directly from dataset to algorithm."
        ],
        importantPoints: [
          "Correct order matters.",
          "Mention leakage prevention.",
          "Mention final test isolation.",
          "Mention deployment and monitoring."
        ]
      },

      {
        id: "workflow-interview",
        title: "74. Complete ML Workflow: Interview Essentials",
        explanation: [
          "Be able to design an ML project from an ambiguous problem statement.",
          "Explain how you prevent data leakage.",
          "Explain how you choose a split strategy.",
          "Explain why preprocessing belongs inside Pipeline.",
          "Explain baseline selection.",
          "Explain model-family comparison.",
          "Explain metric selection.",
          "Explain cross-validation and tuning.",
          "Explain threshold selection and calibration.",
          "Explain error analysis.",
          "Explain model interpretation and SHAP.",
          "Explain final test-set isolation.",
          "Explain experiment tracking and reproducibility.",
          "Explain training-serving skew.",
          "Explain data drift and concept drift.",
          "Explain production monitoring and retraining.",
          "Explain why model selection is multi-objective."
        ],
        intuition: [
          "Strong ML engineering interviews test whether you can build a reliable system, not merely call fit()."
        ],
        importantPoints: [
          "Leakage.",
          "Evaluation.",
          "Pipelines.",
          "Tuning.",
          "Interpretability.",
          "Deployment.",
          "Monitoring."
        ]
      },

      {
        id: "workflow-final-mental-model",
        title: "75. The Final Mental Model",
        explanation: [
          "Machine learning is a disciplined process for converting data into decisions under uncertainty.",
          "The algorithm is only one component.",
          "Reliable performance depends on correct problem framing, representative data, leakage-safe evaluation, reproducible preprocessing, appropriate modeling, honest testing and continuous production monitoring.",
          "A simpler model inside a correct workflow is usually more valuable than a sophisticated model inside a flawed workflow."
        ],
        intuition: [
          "ModelMind's core lesson: do not learn only how to train models; learn how to build trustworthy machine-learning systems."
        ],
        importantPoints: [
          "Problem before algorithm.",
          "Evaluation before optimization.",
          "Pipeline before deployment.",
          "Monitoring after deployment.",
          "Trust the complete process."
        ]
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "complete-ml-workflow-lab",
      title: "End-to-End ML Workflow Lab",
      description:
        "Navigate an interactive ML lifecycle from raw dataset and problem framing through splitting, EDA, preprocessing, model comparison, CV, tuning, error analysis, interpretation, final testing and inference."
    },

    codeExamples: [
      {
        id: "complete-workflow-code",
        title: "End-to-End sklearn Workflow",
        description:
          "Build a mixed-feature preprocessing and classification Pipeline with cross-validated tuning.",
        language: "python",
        code: `import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    roc_auc_score
)
from sklearn.model_selection import (
    GridSearchCV,
    train_test_split
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler
)

# Example:
# df = pd.read_csv("data.csv")

target_column = "target"

X = df.drop(
    columns=[target_column]
)

y = df[target_column]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

numeric_features = X_train.select_dtypes(
    include="number"
).columns.tolist()

categorical_features = X_train.select_dtypes(
    exclude="number"
).columns.tolist()

numeric_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="median")
    ),
    (
        "scaler",
        StandardScaler()
    )
])

categorical_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="most_frequent")
    ),
    (
        "encoder",
        OneHotEncoder(
            handle_unknown="ignore"
        )
    )
])

preprocessor = ColumnTransformer([
    (
        "numeric",
        numeric_pipeline,
        numeric_features
    ),
    (
        "categorical",
        categorical_pipeline,
        categorical_features
    )
])

pipeline = Pipeline([
    (
        "preprocessor",
        preprocessor
    ),
    (
        "model",
        LogisticRegression(
            max_iter=2000
        )
    )
])

param_grid = {
    "model__C": [
        0.01,
        0.1,
        1.0,
        10.0
    ]
}

search = GridSearchCV(
    pipeline,
    param_grid=param_grid,
    scoring="roc_auc",
    cv=5,
    n_jobs=-1
)

search.fit(
    X_train,
    y_train
)

best_model = search.best_estimator_

predictions = best_model.predict(
    X_test
)

probabilities = best_model.predict_proba(
    X_test
)[:, 1]

print(
    "Best parameters:",
    search.best_params_
)

print(
    classification_report(
        y_test,
        predictions
    )
)

print(
    "Final ROC-AUC:",
    roc_auc_score(
        y_test,
        probabilities
    )
)`,
        explanation: [
          "The test set is separated before preprocessing is learned.",
          "Numerical and categorical features receive separate transformations.",
          "SimpleImputer handles missing values.",
          "StandardScaler transforms numerical features.",
          "OneHotEncoder handles categorical variables.",
          "ColumnTransformer combines the feature branches.",
          "Pipeline combines preprocessing and the model.",
          "GridSearchCV performs leakage-safe cross-validated tuning.",
          "The final test set is evaluated only after model selection."
        ],
        commonMistakes: [
          "Cleaning or scaling the full dataset before splitting.",
          "Selecting hyperparameters using test performance.",
          "Forgetting handle_unknown for production categorical values.",
          "Saving only the estimator but not preprocessing.",
          "Treating a high score as sufficient evidence for deployment."
        ]
      }
    ],

    practice: [
      {
        id: "workflow-practice-1",
        title: "First Step",
        type: "concept",
        difficulty: "basic",
        question:
          "Should an ML project begin by choosing XGBoost or by defining the problem and evaluation objective?",
        instructions: ["Think about what determines whether a model is useful."],
        hints: ["Algorithm choice comes later."],
        explanation:
          "The project should begin with problem formulation, target definition, constraints and evaluation objectives."
      },
      {
        id: "workflow-practice-2",
        title: "Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why should SimpleImputer and StandardScaler usually be inside the Pipeline?",
        instructions: ["Think cross-validation and unseen data."],
        hints: ["Their fitted statistics must come only from training observations."],
        explanation:
          "Keeping them inside Pipeline ensures imputation and scaling statistics are learned only from the appropriate training partition during fitting and cross-validation."
      },
      {
        id: "workflow-practice-3",
        title: "Model Selection",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why should several reasonable model families be compared rather than assuming the most advanced algorithm is best?",
        instructions: ["Think dataset dependence."],
        hints: ["Algorithms make different assumptions."],
        explanation:
          "Performance depends on the dataset, representation and objective. Simpler models can equal or outperform more complicated models and may offer better interpretability or efficiency."
      },
      {
        id: "workflow-practice-4",
        title: "Error Analysis",
        type: "analysis",
        difficulty: "advanced",
        question:
          "What can error analysis reveal that a single ROC-AUC value cannot?",
        instructions: ["Think individual failures."],
        hints: ["Look for subgroups and recurring patterns."],
        explanation:
          "Error analysis can reveal systematic failure modes, problematic subgroups, data-quality issues and feature gaps hidden by aggregate metrics."
      },
      {
        id: "workflow-practice-5",
        title: "Production Preprocessing",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why is saving only the fitted classifier often insufficient for deployment?",
        instructions: ["Think about raw production inputs."],
        hints: ["The model expects the same representation used during training."],
        explanation:
          "Production inputs must receive the identical fitted imputation, encoding, scaling and feature transformations used during training. Saving the complete Pipeline preserves this workflow."
      },
      {
        id: "workflow-practice-6",
        title: "Final Test",
        type: "analysis",
        difficulty: "advanced",
        question:
          "After seeing disappointing final test performance, why is repeatedly tuning against that same test set problematic?",
        instructions: ["Think independence."],
        hints: ["The test set starts influencing development."],
        explanation:
          "Repeatedly adapting the model based on test performance makes the test set part of the model-selection process, so it no longer provides an independent estimate of generalization."
      }
    ],

    commonMistakes: [
      {
        id: "workflow-mistake-1",
        title: "Starting with the algorithm",
        description:
          "Model choice is only one stage of the ML lifecycle.",
        correction:
          "Start with problem formulation and data understanding."
      },
      {
        id: "workflow-mistake-2",
        title: "Global preprocessing",
        description:
          "Transformations learned from all data create leakage.",
        correction:
          "Use Pipeline and fit transformations on training data only."
      },
      {
        id: "workflow-mistake-3",
        title: "Repeated test evaluation",
        description:
          "The test set becomes part of model development.",
        correction:
          "Use validation/CV for decisions and reserve final test evaluation."
      },
      {
        id: "workflow-mistake-4",
        title: "Ignoring deployment representation",
        description:
          "Training and production transformations can diverge.",
        correction:
          "Deploy the complete preprocessing-model Pipeline."
      }
    ],

    keyTakeaways: [
      "Machine learning begins with problem formulation, not model selection.",
      "Data quality and leakage checks come before sophisticated algorithms.",
      "Evaluation design must match deployment conditions.",
      "Use Pipeline and ColumnTransformer for reproducible preprocessing.",
      "Establish baselines before tuning.",
      "Cross-validation supports reliable comparison.",
      "Tune using training data rather than the final test set.",
      "Perform error analysis after aggregate evaluation.",
      "Interpret predictions without making unsupported causal claims.",
      "Track experiments and dependencies.",
      "Deploy preprocessing and model together.",
      "A complete ML system is much more than model.fit()."
    ]
  }
};