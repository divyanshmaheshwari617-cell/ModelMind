import type { DeepLessonRegistry } from "./lessonContentTypes";

export const preprocessingContent: DeepLessonRegistry = {

  // =========================================================
  // MISSING VALUE HANDLING
  // =========================================================

  "missing-value-handling": {
    overview:
      "Missing-value handling is not simply about filling blank cells. Missing data changes what information is available to a machine-learning model and can introduce bias if handled incorrectly. A strong workflow first investigates why values are missing, then chooses a strategy that is appropriate for the feature, model and data-generating process.",

    objectives: [
      "Understand why missing values occur.",
      "Measure missingness correctly.",
      "Distinguish deletion from imputation.",
      "Understand mean, median, mode and constant imputation.",
      "Understand missing indicators.",
      "Use SimpleImputer.",
      "Prevent leakage during imputation.",
      "Choose strategies according to feature type and distribution.",
    ],

    sections: [
      {
        id: "missing-understanding",
        title: "Understanding Missing Data",

        explanation: [
          "Missing values represent unavailable information rather than ordinary numerical values.",
          "They can occur because data was not collected, sensors failed, users skipped fields, systems were merged incorrectly or the value was genuinely unavailable.",
          "Before choosing a treatment, measure both the count and percentage of missing observations.",
          "The pattern of missingness can matter as much as the amount of missingness.",
        ],

        intuition: [
          "A missing value is information about what we do not know. Filling it blindly can create information that never existed.",
        ],

        importantPoints: [
          "Inspect missingness before modifying data.",
          "Measure both counts and percentages.",
          "Investigate whether missingness is concentrated in particular groups.",
          "Do not automatically replace missing values with zero.",
        ],
      },

      {
        id: "missing-deletion",
        title: "Deletion Strategies",

        explanation: [
          "Rows containing missing values can sometimes be removed when missingness is rare and enough observations remain.",
          "Columns can sometimes be removed when they contain extremely little usable information and are not important to the problem.",
          "Deletion reduces the amount of training data.",
          "If missingness is systematic, deleting incomplete observations can change the population represented by the dataset.",
        ],

        intuition: [
          "Deleting missing data is equivalent to saying those observations should contribute nothing to learning. That decision needs justification.",
        ],

        importantPoints: [
          "Deletion is not automatically wrong.",
          "Consider how much information will be lost.",
          "Investigate whether deleted observations differ systematically.",
        ],
      },

      {
        id: "missing-imputation",
        title: "Imputation Strategies",

        explanation: [
          "Imputation replaces missing observations using a defined strategy.",
          "Mean imputation uses the arithmetic average and can be affected strongly by extreme values.",
          "Median imputation is more resistant to extreme values and can work well for skewed numerical variables.",
          "Mode or most-frequent imputation is commonly used for categorical variables.",
          "Constant-value imputation can introduce an explicit category such as 'Unknown'.",
          "No imputation method can recover information that was never observed.",
        ],

        intuition: [
          "Imputation creates a reasonable placeholder so the model can process the observation, but the placeholder should not be mistaken for a real measurement.",
        ],

        importantPoints: [
          "Mean is sensitive to outliers.",
          "Median is robust to extreme magnitudes.",
          "Most-frequent strategies are useful for categories.",
          "Constant categories can explicitly represent missingness.",
        ],
      },

      {
        id: "missing-indicator",
        title: "Missing Indicators",

        explanation: [
          "Sometimes whether a value is missing may itself contain predictive information.",
          "A binary missing indicator records whether the original observation was absent.",
          "SimpleImputer supports add_indicator=True for this purpose.",
          "Missing indicators should be treated as modeling features and validated rather than assumed to be useful.",
        ],

        intuition: [
          "The model may benefit from knowing both the imputed value and the fact that the original value was unavailable.",
        ],

        importantPoints: [
          "Missingness can sometimes carry signal.",
          "Indicators preserve information about original absence.",
          "Validate whether indicators improve generalization.",
        ],
      },

      {
        id: "missing-leakage",
        title: "Imputation and Data Leakage",

        explanation: [
          "Statistics used for imputation must be learned from training data only.",
          "Calculating a median using the entire dataset allows information from validation or test observations to influence training preprocessing.",
          "The correct workflow splits the data first, fits the imputer on training data and then applies the learned transformation to validation and test data.",
          "Pipelines automate this behavior correctly during cross-validation.",
        ],

        intuition: [
          "The test set represents unseen future data. Training preprocessing should not be allowed to study it.",
        ],

        importantPoints: [
          "Split before learned preprocessing.",
          "Fit imputers on training data only.",
          "Transform test data using training-derived statistics.",
          "Pipelines reduce accidental leakage.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "missing-value-imputation-lab",
      title: "Missing Value Imputation Lab",
      description:
        "Change missing-value patterns and compare deletion, mean, median, most-frequent and missing-indicator strategies while observing how distributions change.",
    },

    codeExamples: [
      {
        id: "missing-simple-imputer",
        title: "Leakage-Safe Imputation",
        description:
          "Fit an imputer only on training data and apply it to unseen test data.",
        language: "python",

        code: `import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer

df = pd.DataFrame({
    "age": [
        20, 21, np.nan, 24,
        26, np.nan, 30, 32
    ],
    "salary": [
        25000, 28000, 30000, np.nan,
        42000, 45000, np.nan, 60000
    ],
    "target": [
        0, 0, 0, 1,
        1, 1, 1, 1
    ]
})

X = df[
    [
        "age",
        "salary"
    ]
]

y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42
)

imputer = SimpleImputer(
    strategy="median"
)

X_train_imputed = imputer.fit_transform(
    X_train
)

X_test_imputed = imputer.transform(
    X_test
)

print(
    "Learned medians:",
    imputer.statistics_
)

print(
    X_train_imputed
)

print(
    X_test_imputed
)`,

        explanation: [
          "The train/test split happens before the imputer learns any statistics.",
          "fit_transform learns medians from X_train and transforms X_train.",
          "transform applies those same learned medians to X_test.",
          "Calling fit_transform separately on X_test would be incorrect because test statistics would influence preprocessing.",
        ],

        commonMistakes: [
          "Imputing the entire dataset before splitting.",
          "Using zero without considering its meaning.",
          "Calling fit_transform on test data.",
          "Assuming imputation recreates the missing information.",
        ],
      },
    ],

    practice: [
      {
        id: "missing-practice-1",
        title: "Mean or Median?",
        type: "analysis",
        difficulty: "basic",
        question:
          "A salary feature is strongly right-skewed because a few executives earn extremely high salaries. Would mean or median imputation generally be more resistant to these extreme values?",
        instructions: [
          "Consider which statistic is affected less by extreme observations.",
        ],
        hints: [
          "Median depends on ordering rather than magnitude.",
        ],
        explanation:
          "Median imputation is more resistant to extreme salaries than mean imputation.",
      },

      {
        id: "missing-practice-2",
        title: "Categorical Missingness",
        type: "analysis",
        difficulty: "basic",
        question:
          "A city column contains missing values. Give two reasonable simple imputation strategies.",
        instructions: [
          "Consider most-frequent and explicit missing categories.",
        ],
        hints: [
          "One strategy estimates a common category; another preserves missingness explicitly.",
        ],
        explanation:
          "Possible strategies include most-frequent imputation or replacing missing values with an explicit category such as 'Unknown'.",
      },

      {
        id: "missing-practice-3",
        title: "Find the Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "A student calculates the median of every feature on the complete dataset, fills missing values, and only then performs train_test_split. What is wrong?",
        instructions: [
          "Explain which data influenced preprocessing.",
        ],
        hints: [
          "The future test observations contributed to the medians.",
        ],
        explanation:
          "The preprocessing contains data leakage because test-set information influenced the imputation statistics.",
      },

      {
        id: "missing-practice-4",
        title: "SimpleImputer",
        type: "coding",
        difficulty: "medium",
        question:
          "Create a SimpleImputer that replaces missing categorical values with the most frequent category.",
        instructions: [
          "Use strategy='most_frequent'.",
        ],
        hints: [
          "SimpleImputer(strategy='most_frequent')",
        ],
        explanation:
          "SimpleImputer(strategy='most_frequent') creates the required transformer.",
      },

      {
        id: "missing-practice-5",
        title: "Missing Indicator",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why might adding a missing-value indicator improve a model even after the missing value itself has been imputed?",
        instructions: [
          "Think about information lost by replacing the missing cell.",
        ],
        hints: [
          "After imputation, the model may no longer know which observations were originally missing.",
        ],
        explanation:
          "The indicator preserves whether the value was originally absent, which can contain predictive information in some datasets.",
      },
    ],

    keyTakeaways: [
      "Missing-value handling begins with investigation.",
      "Deletion can remove useful or systematically different observations.",
      "Imputation strategies depend on feature type and distribution.",
      "Median is more resistant to extreme values than mean.",
      "Missing indicators can preserve missingness information.",
      "Imputation must be learned from training data only.",
      "SimpleImputer integrates naturally with sklearn pipelines.",
    ],
  },


  // =========================================================
  // OUTLIER HANDLING
  // =========================================================

  "outlier-handling": {
    overview:
      "Outliers are observations that differ substantially from most other observations. They can represent data-entry mistakes, measurement failures, rare but genuine events or important edge cases. Outlier handling therefore requires investigation rather than automatic deletion.",

    objectives: [
      "Understand what an outlier is.",
      "Distinguish errors from legitimate rare observations.",
      "Use IQR-based detection.",
      "Understand z-score reasoning.",
      "Recognize model sensitivity to extreme values.",
      "Understand clipping and transformation.",
      "Prevent inappropriate automatic deletion.",
    ],

    sections: [
      {
        id: "outlier-definition",
        title: "What Is an Outlier?",

        explanation: [
          "An outlier is an observation that appears unusually distant from much of the data according to some definition.",
          "Being unusual does not mean being incorrect.",
          "A fraudulent transaction, rare disease or unusually valuable customer may be exactly the observation the model needs to understand.",
          "Outlier analysis should therefore combine statistics with domain knowledge.",
        ],

        intuition: [
          "An outlier is a warning to investigate, not an instruction to delete.",
        ],

        importantPoints: [
          "Rare does not mean wrong.",
          "Use domain knowledge.",
          "Understand the data-generation process.",
        ],
      },

      {
        id: "outlier-iqr",
        title: "IQR Method",

        explanation: [
          "The interquartile range is Q3 - Q1.",
          "A common heuristic flags observations below Q1 - 1.5 × IQR or above Q3 + 1.5 × IQR.",
          "The rule is useful for exploration but does not prove that flagged values are invalid.",
          "Highly skewed distributions can naturally produce many observations beyond these limits.",
        ],

        intuition: [
          "The IQR method defines an expected central region using the middle half of the data and identifies observations far beyond that region.",
        ],

        importantPoints: [
          "IQR = Q3 - Q1.",
          "1.5 × IQR is a heuristic.",
          "Flagged observations require interpretation.",
        ],
      },

      {
        id: "outlier-zscore",
        title: "Z-Score Reasoning",

        explanation: [
          "A z-score measures how many standard deviations an observation lies from the mean.",
          "Large absolute z-scores can indicate unusual observations.",
          "Mean and standard deviation themselves are sensitive to extreme values.",
          "Z-score thresholds are most meaningful when the distribution and context justify their use.",
        ],

        intuition: [
          "A z-score expresses distance from the mean using standard deviation as the unit.",
        ],

        importantPoints: [
          "z = (x - mean) / standard deviation.",
          "Large absolute values indicate greater distance from the mean.",
          "Do not apply fixed thresholds mechanically.",
        ],
      },

      {
        id: "outlier-treatment",
        title: "Outlier Treatment",

        explanation: [
          "Possible responses include correcting verified data errors, retaining legitimate observations, transforming skewed features, clipping extreme values or using robust models.",
          "Deletion should have a defensible reason.",
          "Treatment can change the target population represented by the dataset.",
          "Any thresholds learned from data should be estimated using training data only.",
        ],

        intuition: [
          "The correct treatment depends on why the observation is extreme.",
        ],

        importantPoints: [
          "Correct confirmed errors.",
          "Keep legitimate rare observations when relevant.",
          "Consider robust transformations or models.",
          "Validate treatment choices.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "outlier-detection-lab",
      title: "Outlier Detection Lab",
      description:
        "Move extreme observations and compare box plots, IQR limits, z-scores and the effect of outliers on mean, median and model fits.",
    },

    codeExamples: [
      {
        id: "outlier-iqr-code",
        title: "Detect Outliers with IQR",
        description:
          "Flag unusual observations without automatically deleting them.",
        language: "python",

        code: `import pandas as pd

df = pd.DataFrame({
    "salary": [
        25000,
        28000,
        30000,
        32000,
        35000,
        38000,
        40000,
        250000
    ]
})

q1 = df["salary"].quantile(0.25)
q3 = df["salary"].quantile(0.75)

iqr = q3 - q1

lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr

outlier_mask = (
    (df["salary"] < lower_bound)
    |
    (df["salary"] > upper_bound)
)

outliers = df[outlier_mask]

print(
    "Q1:",
    q1
)

print(
    "Q3:",
    q3
)

print(
    "IQR:",
    iqr
)

print(
    "Potential outliers:"
)

print(outliers)`,

        explanation: [
          "Q1 and Q3 describe the central half of the salary distribution.",
          "The IQR determines heuristic lower and upper limits.",
          "The Boolean mask flags observations outside those limits.",
          "The code deliberately does not delete the flagged observations.",
        ],

        commonMistakes: [
          "Automatically dropping every IQR-flagged row.",
          "Using outlier rules without domain context.",
          "Calculating thresholds from the full dataset before evaluation.",
        ],
      },
    ],

    practice: [
      {
        id: "outlier-practice-1",
        title: "Rare or Wrong?",
        type: "analysis",
        difficulty: "basic",
        question:
          "A transaction dataset contains one purchase worth ₹10 lakh while most are below ₹20,000. Should the observation automatically be deleted?",
        instructions: [
          "Consider whether it may be a legitimate event.",
        ],
        hints: [
          "Unusual magnitude alone does not prove an error.",
        ],
        explanation:
          "No. It should be investigated. It may be a data error, but it may also be a legitimate high-value transaction.",
      },

      {
        id: "outlier-practice-2",
        title: "Calculate IQR",
        type: "concept",
        difficulty: "basic",
        question:
          "If Q1 = 20 and Q3 = 40, what is the IQR?",
        instructions: [
          "Use Q3 - Q1.",
        ],
        hints: [
          "40 - 20.",
        ],
        explanation:
          "The IQR is 20.",
      },

      {
        id: "outlier-practice-3",
        title: "Upper IQR Limit",
        type: "concept",
        difficulty: "medium",
        question:
          "If Q1 = 20, Q3 = 40 and IQR = 20, calculate the common 1.5×IQR upper boundary.",
        instructions: [
          "Use Q3 + 1.5 × IQR.",
        ],
        hints: [
          "40 + 30.",
        ],
        explanation:
          "The upper boundary is 70.",
      },

      {
        id: "outlier-practice-4",
        title: "Model Sensitivity",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can a single extreme observation strongly influence ordinary linear regression?",
        instructions: [
          "Think about squared residuals.",
        ],
        hints: [
          "Large errors become even larger when squared.",
        ],
        explanation:
          "Ordinary least squares minimizes squared errors, so observations with very large residuals can contribute disproportionately to the objective.",
      },

      {
        id: "outlier-practice-5",
        title: "Training-Only Threshold",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why should an outlier threshold derived from quantiles usually be learned from training data rather than the complete dataset?",
        instructions: [
          "Connect this to evaluation leakage.",
        ],
        hints: [
          "Test observations should not influence learned preprocessing decisions.",
        ],
        explanation:
          "Using full-dataset quantiles lets evaluation observations influence preprocessing thresholds, making the evaluation less independent.",
      },
    ],

    keyTakeaways: [
      "Outliers are unusual observations, not automatically errors.",
      "IQR and z-scores are detection tools rather than deletion rules.",
      "Domain knowledge is essential.",
      "Different models have different sensitivity to extreme values.",
      "Treatment should preserve meaningful rare cases.",
      "Data-derived thresholds should be learned without test leakage.",
    ],
  },


  // =========================================================
  // FEATURE SCALING
  // =========================================================

  "feature-scaling": {
    overview:
      "Feature scaling transforms numerical features so their magnitudes become more comparable. It is especially important for distance-based models and optimization-based models because large numerical scales can dominate distances or gradient updates even when those features are not inherently more important.",

    objectives: [
      "Understand why feature scale matters.",
      "Understand StandardScaler.",
      "Understand MinMaxScaler.",
      "Know which models are scale-sensitive.",
      "Know which models generally need less scaling.",
      "Prevent scaling leakage.",
      "Apply scalers correctly with sklearn.",
    ],

    sections: [
      {
        id: "scaling-problem",
        title: "Why Scale Features?",

        explanation: [
          "Features can use very different numerical units.",
          "Age may range from 18 to 70 while annual salary may range from tens of thousands to millions.",
          "Distance-based algorithms can become dominated by the larger numerical scale.",
          "Gradient-based optimization can also behave poorly when feature scales differ greatly.",
        ],

        intuition: [
          "A larger unit does not mean a feature is more important, but an algorithm may accidentally treat it that way.",
        ],

        importantPoints: [
          "Scaling changes representation, not underlying information.",
          "KNN and SVM are commonly scale-sensitive.",
          "Many optimization-based linear models benefit from scaling.",
        ],
      },

      {
        id: "standard-scaler",
        title: "Standardization",

        explanation: [
          "StandardScaler subtracts the training mean and divides by the training standard deviation.",
          "The transformed training feature therefore has approximately zero mean and unit standard deviation when variance is nonzero.",
          "Standardization does not force values into a fixed interval.",
          "Extreme values can influence the mean and standard deviation.",
        ],

        intuition: [
          "Standardization expresses values in terms of their distance from the feature mean measured in standard-deviation units.",
        ],

        importantPoints: [
          "z = (x - mean) / standard deviation.",
          "Standardized values can be negative.",
          "Values are not restricted to -1 and 1.",
        ],
      },

      {
        id: "minmax-scaler",
        title: "Min-Max Scaling",

        explanation: [
          "MinMaxScaler linearly maps training values into a chosen range, commonly 0 to 1.",
          "It preserves relative ordering.",
          "Extreme training values determine the scaling range.",
          "Future observations outside the training range can transform to values outside the requested interval unless clipping is used.",
        ],

        intuition: [
          "Min-max scaling asks where a value lies relative to the observed training minimum and maximum.",
        ],

        importantPoints: [
          "Common range is 0 to 1.",
          "Sensitive to extreme minimum and maximum values.",
          "Test values can fall outside the training range.",
        ],
      },

      {
        id: "scaling-models",
        title: "Which Models Need Scaling?",

        explanation: [
          "KNN uses distances directly, making feature scale highly important.",
          "SVMs commonly depend on distances or dot products and generally benefit from scaling.",
          "Logistic regression and regularized linear models often benefit from scaling for optimization and regularization behavior.",
          "Tree-based models split features by thresholds and generally do not require scaling for the same reason.",
        ],

        intuition: [
          "If the algorithm compares geometric distances or optimizes coefficients across features, scale often matters.",
        ],

        importantPoints: [
          "KNN: scaling is important.",
          "SVM: scaling is usually important.",
          "Regularized linear models: scaling is often important.",
          "Decision trees and random forests generally do not require it.",
        ],
      },

      {
        id: "scaling-leakage",
        title: "Scaling Without Leakage",

        explanation: [
          "The scaler must learn mean, standard deviation, minimum or maximum from training data only.",
          "Calling fit on the complete dataset leaks evaluation information.",
          "After fitting on training data, use transform on validation and test data.",
          "Pipeline automates this correctly during cross-validation.",
        ],

        intuition: [
          "Even apparently harmless summary statistics are information about the test set.",
        ],

        importantPoints: [
          "Fit on training data.",
          "Transform validation/test data.",
          "Prefer Pipeline for repeatable ML workflows.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "feature-scaling-distance-lab",
      title: "Feature Scaling Lab",
      description:
        "Compare raw, standardized and min-max scaled features while observing how scaling changes distances, KNN neighborhoods and optimization geometry.",
    },

    codeExamples: [
      {
        id: "scaling-code",
        title: "StandardScaler Correctly",
        description:
          "Scale training and test features without leaking test statistics.",
        language: "python",

        code: `import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

df = pd.DataFrame({
    "age": [
        20, 22, 25, 28,
        32, 36, 40, 45
    ],
    "salary": [
        25000, 30000, 42000, 50000,
        65000, 80000, 95000, 120000
    ],
    "target": [
        0, 0, 0, 0,
        1, 1, 1, 1
    ]
})

X = df[
    [
        "age",
        "salary"
    ]
]

y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42
)

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(
    X_train
)

X_test_scaled = scaler.transform(
    X_test
)

print(
    "Training means:",
    scaler.mean_
)

print(
    X_train_scaled
)

print(
    X_test_scaled
)`,

        explanation: [
          "StandardScaler learns its statistics from X_train.",
          "fit_transform performs learning and transformation on training data.",
          "transform applies the same representation to X_test.",
          "The test set is never used to fit the scaler.",
        ],

        commonMistakes: [
          "Scaling before train_test_split.",
          "Calling fit_transform independently on test data.",
          "Assuming every model requires scaling.",
          "Assuming StandardScaler restricts values to 0–1.",
        ],
      },
    ],

    practice: [
      {
        id: "scaling-practice-1",
        title: "KNN Scale Problem",
        type: "analysis",
        difficulty: "basic",
        question:
          "Why might salary dominate age when Euclidean distance is used on raw features?",
        instructions: [
          "Compare their numerical magnitudes.",
        ],
        hints: [
          "Salary differences may be tens of thousands while age differences are tens.",
        ],
        explanation:
          "The salary dimension can contribute far more to the distance simply because its numerical scale is much larger.",
      },

      {
        id: "scaling-practice-2",
        title: "StandardScaler Formula",
        type: "concept",
        difficulty: "basic",
        question:
          "If x = 70, training mean = 50 and standard deviation = 10, what is the standardized value?",
        instructions: [
          "Use (x - mean) / std.",
        ],
        hints: [
          "(70 - 50) / 10.",
        ],
        explanation:
          "The standardized value is 2.",
      },

      {
        id: "scaling-practice-3",
        title: "Tree Scaling",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why does a decision tree generally care less about feature scaling than KNN?",
        instructions: [
          "Compare threshold splitting with distance calculation.",
        ],
        hints: [
          "Trees split according to ordering and thresholds.",
        ],
        explanation:
          "A monotonic rescaling changes numerical thresholds but generally preserves the ordering used for tree splits, while KNN distances depend directly on feature magnitudes.",
      },

      {
        id: "scaling-practice-4",
        title: "Find Scaling Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "A StandardScaler is fitted before train_test_split. Explain the problem.",
        instructions: [
          "Identify what statistics the scaler learned.",
        ],
        hints: [
          "Its mean and standard deviation used future test observations.",
        ],
        explanation:
          "The scaler learned statistics from the eventual test set, causing data leakage.",
      },

      {
        id: "scaling-practice-5",
        title: "Min-Max Surprise",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A MinMaxScaler fitted on training values from 0 to 100 receives a test value of 120. Must its transformed value remain below 1?",
        instructions: [
          "Use the training range.",
        ],
        hints: [
          "The test value exceeds the maximum seen during fitting.",
        ],
        explanation:
          "No. Without clipping, a value above the training maximum can transform to a value greater than 1.",
      },
    ],

    keyTakeaways: [
      "Feature scale can strongly affect distance-based models.",
      "StandardScaler uses training mean and standard deviation.",
      "MinMaxScaler uses training minimum and maximum.",
      "KNN and SVM are strongly scale-sensitive.",
      "Tree models generally require less scaling.",
      "Scalers must be fitted on training data only.",
    ],
  },


  // =========================================================
  // CATEGORICAL ENCODING
  // =========================================================

  "categorical-encoding": {
    overview:
      "Most machine-learning algorithms require numerical input, but many datasets contain categories such as city, branch, product type or occupation. Encoding converts categories into numerical representations while preserving the correct meaning of the feature.",

    objectives: [
      "Understand why categorical encoding is required.",
      "Differentiate nominal and ordinal categories.",
      "Understand one-hot encoding.",
      "Understand ordinal encoding.",
      "Recognize the danger of arbitrary integer labels.",
      "Handle unknown categories.",
      "Use OneHotEncoder correctly.",
      "Prevent encoding leakage.",
    ],

    sections: [
      {
        id: "encoding-types",
        title: "Nominal vs Ordinal Categories",

        explanation: [
          "Nominal categories have no meaningful order, such as city or blood group.",
          "Ordinal categories have a meaningful order, such as low, medium and high.",
          "The encoding strategy should preserve this distinction.",
          "Assigning arbitrary integers to nominal categories can create false numerical relationships.",
        ],

        intuition: [
          "If Delhi=1 and Mumbai=2, the number 2 does not mean Mumbai is twice Delhi or greater than Delhi.",
        ],

        importantPoints: [
          "Nominal means no inherent order.",
          "Ordinal means meaningful order.",
          "Encoding should reflect feature semantics.",
        ],
      },

      {
        id: "encoding-onehot",
        title: "One-Hot Encoding",

        explanation: [
          "One-hot encoding creates indicator columns representing categories.",
          "A city feature containing Agra, Delhi and Mumbai can become three binary columns.",
          "This avoids imposing an artificial ranking among nominal categories.",
          "High-cardinality features can create many columns.",
        ],

        intuition: [
          "Instead of assigning each category a magnitude, one-hot encoding records category membership.",
        ],

        importantPoints: [
          "Useful for nominal features.",
          "Does not impose arbitrary order.",
          "Can increase dimensionality.",
        ],
      },

      {
        id: "encoding-ordinal",
        title: "Ordinal Encoding",

        explanation: [
          "Ordinal encoding maps ordered categories to ordered numerical values.",
          "For example, low, medium and high might map to 0, 1 and 2.",
          "The order should come from domain meaning rather than alphabetical order.",
          "The numerical spacing may still imply relationships that some models interpret quantitatively.",
        ],

        intuition: [
          "Ordinal encoding preserves rank, but the numbers are still a representation rather than guaranteed equal distances between categories.",
        ],

        importantPoints: [
          "Use only when meaningful order exists.",
          "Specify category order explicitly.",
          "Do not infer order from spelling.",
        ],
      },

      {
        id: "encoding-unknown",
        title: "Unknown Categories",

        explanation: [
          "Production or test data can contain categories not seen during training.",
          "OneHotEncoder supports handle_unknown='ignore'.",
          "This prevents transformation from failing when unseen categories appear.",
          "Unknown-category behavior should be deliberately designed.",
        ],

        intuition: [
          "A model deployed tomorrow may encounter a city or product category that did not appear in yesterday's training data.",
        ],

        importantPoints: [
          "Expect unseen categories.",
          "Use robust transformation settings.",
          "Fit encoders on training data only.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "categorical-encoding-lab",
      title: "Categorical Encoding Lab",
      description:
        "Convert nominal and ordinal features using multiple encoding strategies and observe the geometry and dimensionality created by each representation.",
    },

    codeExamples: [
      {
        id: "encoding-code",
        title: "OneHotEncoder",
        description:
          "Encode nominal categories while handling unseen categories.",
        language: "python",

        code: `import pandas as pd

from sklearn.preprocessing import OneHotEncoder

train = pd.DataFrame({
    "city": [
        "Agra",
        "Delhi",
        "Mumbai",
        "Agra"
    ]
})

test = pd.DataFrame({
    "city": [
        "Delhi",
        "Jaipur"
    ]
})

encoder = OneHotEncoder(
    handle_unknown="ignore",
    sparse_output=False
)

train_encoded = encoder.fit_transform(
    train[
        ["city"]
    ]
)

test_encoded = encoder.transform(
    test[
        ["city"]
    ]
)

print(
    encoder.get_feature_names_out(
        ["city"]
    )
)

print(
    train_encoded
)

print(
    test_encoded
)`,

        explanation: [
          "The encoder learns category vocabulary from training data.",
          "Each known category becomes an output feature.",
          "Jaipur was not present during training.",
          "handle_unknown='ignore' prevents the transformation from crashing when Jaipur appears.",
        ],

        commonMistakes: [
          "Using arbitrary integer labels for nominal categories.",
          "Fitting an encoder separately on train and test data.",
          "Ignoring unknown-category behavior.",
        ],
      },
    ],

    practice: [
      {
        id: "encoding-practice-1",
        title: "Nominal or Ordinal?",
        type: "concept",
        difficulty: "basic",
        question:
          "Is education level 'School, Bachelor, Master, PhD' nominal or ordinal?",
        instructions: [
          "Consider whether a meaningful progression exists.",
        ],
        hints: [
          "The categories have a natural ordering.",
        ],
        explanation:
          "It is generally treated as ordinal because the categories represent an ordered educational progression.",
      },

      {
        id: "encoding-practice-2",
        title: "City Encoding",
        type: "analysis",
        difficulty: "basic",
        question:
          "Why is mapping Agra=1, Delhi=2 and Mumbai=3 potentially problematic?",
        instructions: [
          "Consider what numerical order implies.",
        ],
        hints: [
          "Cities do not naturally have greater-than relationships.",
        ],
        explanation:
          "The integers impose an artificial ordering and numerical spacing that does not represent the meaning of the cities.",
      },

      {
        id: "encoding-practice-3",
        title: "One-Hot Dimensions",
        type: "concept",
        difficulty: "medium",
        question:
          "A nominal feature has five observed categories. With ordinary one-hot encoding and no dropped category, how many indicator columns are created?",
        instructions: [
          "Create one indicator per category.",
        ],
        hints: [
          "There are five categories.",
        ],
        explanation:
          "Five indicator columns are created.",
      },

      {
        id: "encoding-practice-4",
        title: "Unknown Category",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can handle_unknown='ignore' be useful for deployed models?",
        instructions: [
          "Think about future categorical values.",
        ],
        hints: [
          "Production data may contain unseen categories.",
        ],
        explanation:
          "It allows the encoder to transform observations containing categories not present during training instead of raising an error.",
      },

      {
        id: "encoding-practice-5",
        title: "High Cardinality",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why might one-hot encoding a customer_id feature containing one unique value per customer be a poor idea?",
        instructions: [
          "Consider dimensionality and generalization.",
        ],
        hints: [
          "The feature can create almost one column per observation.",
        ],
        explanation:
          "It creates extremely high dimensionality and usually represents identity rather than a reusable pattern for unseen customers.",
      },
    ],

    keyTakeaways: [
      "Categorical variables require meaningful numerical representations.",
      "Nominal and ordinal categories are different.",
      "One-hot encoding avoids artificial ordering.",
      "Ordinal encoding should use a meaningful predefined order.",
      "High-cardinality features require care.",
      "Encoders must be fitted using training data only.",
      "Production workflows must handle unseen categories.",
    ],
  },


  // =========================================================
  // FEATURE ENGINEERING
  // =========================================================

  "feature-engineering": {
    overview:
      "Feature engineering creates useful representations from existing information. Good features can expose relationships that are difficult for a model to discover directly, while poor features can introduce noise, redundancy or leakage. Feature engineering combines domain knowledge, statistical reasoning and validation.",

    objectives: [
      "Understand the purpose of feature engineering.",
      "Create ratio and interaction features.",
      "Extract useful date features.",
      "Understand transformations.",
      "Create polynomial features conceptually.",
      "Avoid target leakage.",
      "Validate engineered features rather than assuming usefulness.",
    ],

    sections: [
      {
        id: "feature-engineering-purpose",
        title: "Why Engineer Features?",

        explanation: [
          "Raw variables are not always the most useful representation for a learning algorithm.",
          "Domain knowledge can suggest combinations that better represent the underlying process.",
          "Feature engineering can expose nonlinear or interaction relationships.",
          "Every engineered feature should be evaluated using validation rather than assumed to improve performance.",
        ],

        intuition: [
          "Sometimes the information already exists in the dataset but is expressed in a form that makes the useful pattern difficult to see.",
        ],

        importantPoints: [
          "Use domain knowledge.",
          "Avoid unnecessary complexity.",
          "Validate every important feature.",
          "Prevent leakage.",
        ],
      },

      {
        id: "feature-engineering-ratios",
        title: "Ratios and Interactions",

        explanation: [
          "Ratios can represent relationships between two quantities.",
          "Examples include debt-to-income ratio, price-per-unit and clicks-per-impression.",
          "Interaction features represent combined effects between variables.",
          "Ratios require careful handling of zero or near-zero denominators.",
        ],

        intuition: [
          "Absolute income and debt are useful, but debt relative to income may describe financial burden more directly.",
        ],

        importantPoints: [
          "Ratios can encode domain meaning.",
          "Protect against division by zero.",
          "Interactions should have a plausible reason.",
        ],
      },

      {
        id: "feature-engineering-date",
        title: "Date and Time Features",

        explanation: [
          "Raw timestamps can often be decomposed into useful components.",
          "Examples include year, month, day of week, hour and elapsed time.",
          "Cyclical variables such as hour of day may need representations that respect their circular nature.",
          "Future information must not be extracted accidentally.",
        ],

        intuition: [
          "A timestamp contains multiple forms of information about when an event occurred.",
        ],

        importantPoints: [
          "Extract meaningful calendar components.",
          "Consider cyclical structure.",
          "Do not use information unavailable at prediction time.",
        ],
      },

      {
        id: "feature-engineering-polynomial",
        title: "Polynomial and Interaction Features",

        explanation: [
          "Polynomial features can allow linear models to represent curved relationships.",
          "For one feature x, additional terms might include x² and x³.",
          "Interactions such as x1 × x2 can represent combined effects.",
          "Higher-degree expansions can increase dimensionality rapidly and may increase overfitting.",
        ],

        intuition: [
          "The model can remain linear in its coefficients while operating on nonlinear transformations of the original inputs.",
        ],

        importantPoints: [
          "Polynomial features increase model flexibility.",
          "Higher degree increases complexity.",
          "Scaling and regularization may become important.",
        ],
      },

      {
        id: "feature-engineering-leakage",
        title: "Feature Engineering and Leakage",

        explanation: [
          "A feature is invalid if it uses information unavailable at the moment a real prediction would be made.",
          "Post-outcome fields can produce excellent validation scores while making the model unusable.",
          "Aggregations and target-derived features require special care.",
          "Always ask when and how each feature becomes available.",
        ],

        intuition: [
          "A prediction model should not secretly know part of the future answer.",
        ],

        importantPoints: [
          "Check feature availability time.",
          "Avoid post-outcome information.",
          "Validate aggregation procedures carefully.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "feature-engineering-playground",
      title: "Feature Engineering Playground",
      description:
        "Create ratios, interactions and polynomial features and observe how different representations change relationships visible to a model.",
    },

    codeExamples: [
      {
        id: "feature-engineering-code",
        title: "Create Domain Features",
        description:
          "Create ratios and date-based features using Pandas.",
        language: "python",

        code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "income": [
        50000,
        70000,
        90000
    ],
    "debt": [
        10000,
        35000,
        18000
    ],
    "signup_date": [
        "2026-01-05",
        "2026-03-12",
        "2026-07-21"
    ]
})

# ---------------------------------------
# Ratio feature
# ---------------------------------------

df["debt_income_ratio"] = (
    df["debt"]
    /
    df["income"].replace(
        0,
        np.nan
    )
)

# ---------------------------------------
# Date features
# ---------------------------------------

df["signup_date"] = pd.to_datetime(
    df["signup_date"]
)

df["signup_month"] = (
    df["signup_date"].dt.month
)

df["signup_dayofweek"] = (
    df["signup_date"].dt.dayofweek
)

# ---------------------------------------
# Interaction feature
# ---------------------------------------

df["income_debt_interaction"] = (
    df["income"]
    *
    df["debt"]
)

print(df)`,

        explanation: [
          "The debt-to-income ratio expresses debt relative to available income.",
          "Replacing zero income with NaN avoids direct division by zero.",
          "Datetime parsing allows extraction of calendar components.",
          "The interaction feature represents the combined magnitude of income and debt.",
          "Whether any of these features improve prediction must be validated.",
        ],

        commonMistakes: [
          "Creating hundreds of features without validation.",
          "Using future information.",
          "Dividing by zero.",
          "Assuming engineered features always improve performance.",
        ],
      },
    ],

    practice: [
      {
        id: "feature-engineering-practice-1",
        title: "Create a Ratio",
        type: "coding",
        difficulty: "basic",
        question:
          "Create a price_per_item feature from total_price and quantity.",
        instructions: [
          "Handle zero quantity safely.",
        ],
        hints: [
          "Divide total_price by quantity after protecting zero denominators.",
        ],
        explanation:
          "A typical implementation uses df['total_price'] / df['quantity'].replace(0, np.nan).",
      },

      {
        id: "feature-engineering-practice-2",
        title: "Date Feature",
        type: "analysis",
        difficulty: "basic",
        question:
          "Give three potentially useful features that can be extracted from a transaction timestamp.",
        instructions: [
          "Think about calendar and time structure.",
        ],
        hints: [
          "Hour, day of week and month are examples.",
        ],
        explanation:
          "Examples include hour of day, day of week, month, weekend indicator or elapsed time from another meaningful event.",
      },

      {
        id: "feature-engineering-practice-3",
        title: "Leakage Feature",
        type: "analysis",
        difficulty: "medium",
        question:
          "You are predicting whether a patient will be readmitted within 30 days. Is a field recorded after the 30-day outcome window appropriate as a predictor?",
        instructions: [
          "Consider availability at prediction time.",
        ],
        hints: [
          "The feature comes from the future relative to the prediction.",
        ],
        explanation:
          "No. It contains information unavailable at prediction time and would introduce target leakage.",
      },

      {
        id: "feature-engineering-practice-4",
        title: "Polynomial Flexibility",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can adding x² help linear regression model a curved relationship?",
        instructions: [
          "Distinguish linearity in parameters from linearity in original x.",
        ],
        hints: [
          "The model can assign a coefficient to the transformed feature x².",
        ],
        explanation:
          "Adding x² gives the model a nonlinear basis feature while the prediction remains a linear combination of learned coefficients.",
      },

      {
        id: "feature-engineering-practice-5",
        title: "Too Many Features",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why can generating every possible interaction among hundreds of features be harmful?",
        instructions: [
          "Discuss dimensionality, noise and overfitting.",
        ],
        hints: [
          "The feature space can grow extremely quickly.",
        ],
        explanation:
          "It can create enormous dimensionality, increase computation, introduce noisy relationships and increase overfitting risk.",
      },
    ],

    keyTakeaways: [
      "Feature engineering changes representation rather than creating magical new information.",
      "Domain knowledge can produce powerful features.",
      "Ratios and interactions can expose meaningful relationships.",
      "Dates contain useful temporal structure.",
      "Polynomial features increase flexibility.",
      "Engineered features must be validated.",
      "Prediction-time availability must always be checked to prevent leakage.",
    ],
  },


  // =========================================================
  // FEATURE SELECTION
  // =========================================================

  "feature-selection": {
    overview:
      "Feature selection chooses a useful subset of available predictors. The objective is not simply to use fewer columns; it is to reduce irrelevant or redundant information while preserving generalizable signal, interpretability and computational efficiency.",

    objectives: [
      "Understand why feature selection is useful.",
      "Distinguish filter, wrapper and embedded methods.",
      "Use simple variance and statistical filtering carefully.",
      "Understand recursive feature elimination conceptually.",
      "Understand model-based selection.",
      "Prevent feature-selection leakage.",
      "Evaluate selected features through validation.",
    ],

    sections: [
      {
        id: "selection-purpose",
        title: "Why Select Features?",

        explanation: [
          "Irrelevant features can add noise and computational cost.",
          "Redundant features can make interpretation difficult.",
          "High-dimensional feature spaces can increase overfitting risk.",
          "Feature selection can simplify models and sometimes improve generalization.",
          "Removing information can also hurt performance, so selection must be validated.",
        ],

        intuition: [
          "More information is useful only when that information helps the model generalize.",
        ],

        importantPoints: [
          "Fewer features can improve simplicity.",
          "Selection is not automatically beneficial.",
          "Validate performance after selection.",
        ],
      },

      {
        id: "selection-filter",
        title: "Filter Methods",

        explanation: [
          "Filter methods evaluate features using statistics independently of the final predictive model or with limited model dependence.",
          "Examples include variance thresholds, correlation-based screening and statistical association tests.",
          "They are often computationally efficient.",
          "Simple filters can miss interactions between features.",
        ],

        intuition: [
          "Filter methods screen features before asking a full model to use them.",
        ],

        importantPoints: [
          "Fast and simple.",
          "May miss feature interactions.",
          "Thresholds require justification.",
        ],
      },

      {
        id: "selection-wrapper",
        title: "Wrapper Methods",

        explanation: [
          "Wrapper methods evaluate subsets using predictive model performance.",
          "Recursive Feature Elimination repeatedly fits a model and removes features according to an importance criterion.",
          "Wrapper methods can be computationally expensive.",
          "Selection must happen inside the validation procedure to avoid optimistic estimates.",
        ],

        intuition: [
          "Wrapper methods ask the model which subset works better rather than judging features only through standalone statistics.",
        ],

        importantPoints: [
          "Uses model performance.",
          "Can be expensive.",
          "Must be nested inside validation correctly.",
        ],
      },

      {
        id: "selection-embedded",
        title: "Embedded Methods",

        explanation: [
          "Embedded methods perform selection as part of model training.",
          "L1 regularization can drive some coefficients to exactly zero.",
          "Tree-based models can produce feature-importance measures, although these measures require careful interpretation.",
          "Model-based selection depends on the assumptions and behavior of the chosen model.",
        ],

        intuition: [
          "The model itself participates in deciding which features matter.",
        ],

        importantPoints: [
          "L1 regularization can produce sparse coefficients.",
          "Tree importance is not a universal measure of truth.",
          "Different models may select different features.",
        ],
      },

      {
        id: "selection-leakage",
        title: "Feature Selection Leakage",

        explanation: [
          "Feature selection uses information from data and therefore must be treated as a learned preprocessing step.",
          "Selecting features using the entire dataset before cross-validation leaks validation information.",
          "Selection should occur inside a Pipeline so every validation fold learns its feature subset from the corresponding training fold.",
        ],

        intuition: [
          "Choosing the best features after seeing all labels is already learning from the validation data.",
        ],

        importantPoints: [
          "Selection belongs inside validation.",
          "Use Pipeline.",
          "Never report performance from data that influenced feature selection.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "feature-selection-lab",
      title: "Feature Selection Lab",
      description:
        "Add informative, redundant and noisy features and observe how filter, wrapper and embedded selection methods change the feature set and validation performance.",
    },

    codeExamples: [
      {
        id: "feature-selection-code",
        title: "Feature Selection Inside a Pipeline",
        description:
          "Use SelectKBest without leaking validation labels.",
        language: "python",

        code: `from sklearn.datasets import load_breast_cancer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(
    return_X_y=True
)

pipeline = Pipeline([
    (
        "selector",
        SelectKBest(
            score_func=f_classif,
            k=10
        )
    ),
    (
        "scaler",
        StandardScaler()
    ),
    (
        "model",
        LogisticRegression(
            max_iter=2000
        )
    )
])

scores = cross_val_score(
    pipeline,
    X,
    y,
    cv=5,
    scoring="accuracy"
)

print(
    scores
)

print(
    scores.mean()
)`,

        explanation: [
          "SelectKBest is inside the Pipeline.",
          "During cross-validation, feature selection is fitted only on each training fold.",
          "StandardScaler is also fitted independently inside each training fold.",
          "The validation fold remains unseen by both preprocessing steps.",
        ],

        commonMistakes: [
          "Selecting features on the full dataset before cross-validation.",
          "Assuming feature importance proves causality.",
          "Removing correlated features without considering the model or objective.",
        ],
      },
    ],

    practice: [
      {
        id: "feature-selection-practice-1",
        title: "Why Select?",
        type: "analysis",
        difficulty: "basic",
        question:
          "Give three reasons why feature selection might be useful.",
        instructions: [
          "Think about generalization, computation and interpretation.",
        ],
        hints: [
          "Noise and redundancy matter.",
        ],
        explanation:
          "Feature selection can reduce noise, computational cost and complexity while improving interpretability and sometimes generalization.",
      },

      {
        id: "feature-selection-practice-2",
        title: "Method Type",
        type: "concept",
        difficulty: "medium",
        question:
          "Is Recursive Feature Elimination primarily a filter, wrapper or embedded method?",
        instructions: [
          "Consider whether it repeatedly evaluates a model.",
        ],
        hints: [
          "It fits a model while eliminating features.",
        ],
        explanation:
          "RFE is generally classified as a wrapper method.",
      },

      {
        id: "feature-selection-practice-3",
        title: "L1 Selection",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why can L1 regularization act as a feature-selection mechanism?",
        instructions: [
          "Think about what can happen to coefficients.",
        ],
        hints: [
          "Some coefficients can become exactly zero.",
        ],
        explanation:
          "L1 regularization can shrink some learned coefficients exactly to zero, effectively excluding those features from the linear prediction.",
      },

      {
        id: "feature-selection-practice-4",
        title: "Selection Leakage",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why is selecting the top 20 features using all labels before 5-fold cross-validation incorrect?",
        instructions: [
          "Identify how validation labels influenced the feature subset.",
        ],
        hints: [
          "Every validation fold helped choose the features.",
        ],
        explanation:
          "The feature-selection process already used information from observations later treated as validation data, producing optimistic evaluation.",
      },

      {
        id: "feature-selection-practice-5",
        title: "Selection Trade-Off",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A 100-feature model scores 0.901 while a 12-feature model scores 0.899 consistently. Why might the smaller model still be attractive?",
        instructions: [
          "Consider complexity, latency and interpretability.",
        ],
        hints: [
          "Performance is almost identical.",
        ],
        explanation:
          "The smaller model may be easier to interpret, faster to train and serve, cheaper to collect features for, and potentially more robust while sacrificing very little measured performance.",
      },
    ],

    keyTakeaways: [
      "Feature selection removes unnecessary or redundant predictors.",
      "Filter methods are generally fast.",
      "Wrapper methods evaluate subsets through models.",
      "Embedded methods perform selection during training.",
      "L1 regularization can create sparse models.",
      "Selection must happen inside validation to prevent leakage.",
      "The selected feature set should be judged by generalization and practical value.",
    ],
  },


  // =========================================================
  // ADVANCED PREPROCESSING
  // =========================================================

  "advanced-preprocessing": {
    overview:
      "Advanced preprocessing organizes multiple transformations into a reliable machine-learning workflow. Numerical and categorical columns often require different transformations, and those transformations must be learned only from training data. Scikit-learn's ColumnTransformer and Pipeline make this process reproducible and leakage-resistant.",

    objectives: [
      "Separate numerical and categorical preprocessing.",
      "Use SimpleImputer.",
      "Use StandardScaler.",
      "Use OneHotEncoder.",
      "Use ColumnTransformer.",
      "Use Pipeline.",
      "Understand fit and transform semantics.",
      "Prevent preprocessing leakage.",
      "Prepare preprocessing for cross-validation and tuning.",
    ],

    sections: [
      {
        id: "advanced-preprocessing-branches",
        title: "Different Columns Need Different Transformations",

        explanation: [
          "Numerical features may require imputation and scaling.",
          "Categorical features may require imputation and encoding.",
          "Applying the same operation to every column is often inappropriate.",
          "ColumnTransformer allows different transformation pipelines to operate on different feature subsets.",
        ],

        intuition: [
          "A salary column and a city column contain fundamentally different kinds of information and should not be processed identically.",
        ],

        importantPoints: [
          "Identify numerical columns.",
          "Identify categorical columns.",
          "Design preprocessing according to feature semantics.",
        ],
      },

      {
        id: "advanced-preprocessing-column-transformer",
        title: "ColumnTransformer",

        explanation: [
          "ColumnTransformer applies specified transformers to selected columns.",
          "A numerical pipeline can contain median imputation followed by scaling.",
          "A categorical pipeline can contain most-frequent imputation followed by one-hot encoding.",
          "The transformed outputs are combined into a model-ready feature matrix.",
        ],

        intuition: [
          "ColumnTransformer acts as a preprocessing router that sends different columns through different transformation paths.",
        ],

        importantPoints: [
          "Numerical and categorical branches can be independent.",
          "The transformed branches are recombined automatically.",
          "Column selection should be explicit and reproducible.",
        ],
      },

      {
        id: "advanced-preprocessing-pipeline",
        title: "Pipeline",

        explanation: [
          "Pipeline chains preprocessing and model training into one estimator.",
          "Calling fit on the Pipeline fits each learned preprocessing step and finally the model.",
          "Calling predict automatically applies the same transformations before prediction.",
          "This reduces the risk of forgetting or inconsistently applying preprocessing.",
        ],

        intuition: [
          "A Pipeline turns many manual steps into one reproducible machine-learning object.",
        ],

        importantPoints: [
          "One fit call trains the workflow.",
          "One predict call applies preprocessing and prediction.",
          "Pipeline improves reproducibility.",
        ],
      },

      {
        id: "advanced-preprocessing-cv",
        title: "Preprocessing During Cross-Validation",

        explanation: [
          "Cross-validation repeatedly creates training and validation folds.",
          "Every learned preprocessing step must be refitted using only the training portion of each fold.",
          "A Pipeline ensures imputers, scalers, encoders and selectors are refitted correctly inside every fold.",
          "Preprocessing the full dataset before cross-validation invalidates this separation.",
        ],

        intuition: [
          "Each validation fold must behave like unseen data from the perspective of every learned step.",
        ],

        importantPoints: [
          "Put learned preprocessing inside Pipeline.",
          "Cross-validate the complete Pipeline.",
          "Do not cross-validate an already globally transformed dataset.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "advanced-preprocessing-flow-lab",
      title: "Preprocessing Flow Builder",
      description:
        "Build numerical and categorical preprocessing branches visually, route them through ColumnTransformer, connect a model and inspect where leakage occurs when steps are placed incorrectly.",
    },

    codeExamples: [
      {
        id: "advanced-preprocessing-code",
        title: "Complete Mixed-Data Preprocessing",
        description:
          "Build separate numerical and categorical preprocessing pipelines.",
        language: "python",

        code: `import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.DataFrame({
    "age": [
        20, 22, None, 27,
        30, 35, 40, 45
    ],
    "income": [
        25000, 30000, 35000, None,
        50000, 65000, 80000, 100000
    ],
    "city": [
        "Agra", "Delhi", "Agra", None,
        "Mumbai", "Delhi", "Agra", "Mumbai"
    ],
    "target": [
        0, 0, 0, 0,
        1, 1, 1, 1
    ]
})

X = df.drop(
    columns="target"
)

y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

numeric_features = [
    "age",
    "income"
]

categorical_features = [
    "city"
]

numeric_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(
            strategy="median"
        )
    ),
    (
        "scaler",
        StandardScaler()
    )
])

categorical_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(
            strategy="most_frequent"
        )
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

model = Pipeline([
    (
        "preprocessor",
        preprocessor
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
    predictions
)

print(
    probabilities
)`,

        explanation: [
          "Numerical features receive median imputation and standardization.",
          "Categorical features receive most-frequent imputation and one-hot encoding.",
          "ColumnTransformer combines both branches.",
          "Pipeline connects the complete preprocessor to LogisticRegression.",
          "model.fit learns preprocessing statistics and model parameters using training data only.",
          "model.predict automatically applies exactly the same preprocessing to X_test.",
        ],

        commonMistakes: [
          "Manually preprocessing train and test with different logic.",
          "Fitting encoders on test data.",
          "Scaling categorical strings.",
          "Applying preprocessing before splitting.",
        ],
      },
    ],

    practice: [
      {
        id: "advanced-preprocessing-practice-1",
        title: "Route the Columns",
        type: "analysis",
        difficulty: "basic",
        question:
          "A dataset contains age, salary, city and occupation. Which should normally enter the numerical branch and which the categorical branch?",
        instructions: [
          "Classify features according to representation.",
        ],
        hints: [
          "Age and salary are numerical.",
        ],
        explanation:
          "Age and salary normally enter the numerical branch, while city and occupation enter the categorical branch.",
      },

      {
        id: "advanced-preprocessing-practice-2",
        title: "Why ColumnTransformer?",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why not apply StandardScaler directly to every column in a mixed numerical/categorical dataset?",
        instructions: [
          "Consider what scaling requires.",
        ],
        hints: [
          "Raw category strings are not continuous numerical measurements.",
        ],
        explanation:
          "Different feature types require different transformations. ColumnTransformer routes each subset through an appropriate preprocessing branch.",
      },

      {
        id: "advanced-preprocessing-practice-3",
        title: "Pipeline Prediction",
        type: "concept",
        difficulty: "medium",
        question:
          "After fitting a Pipeline containing preprocessing and a classifier, should you manually scale X_test before calling pipeline.predict(X_test)?",
        instructions: [
          "Consider what Pipeline.predict already does.",
        ],
        hints: [
          "The Pipeline contains the scaler.",
        ],
        explanation:
          "No. The Pipeline automatically applies its fitted preprocessing steps before the classifier.",
      },

      {
        id: "advanced-preprocessing-practice-4",
        title: "Cross-Validation Safety",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why is cross_val_score(pipeline, X, y, cv=5) safer than scaling X globally and then calling cross_val_score(model, X_scaled, y, cv=5)?",
        instructions: [
          "Think about what each validation fold influences.",
        ],
        hints: [
          "The globally fitted scaler has already seen every fold.",
        ],
        explanation:
          "When the Pipeline is cross-validated, the scaler is fitted only on each training fold. Global scaling lets validation-fold information influence the transformation.",
      },

      {
        id: "advanced-preprocessing-practice-5",
        title: "Unknown City",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A production row contains a city not observed during training. Which setting in OneHotEncoder can prevent the Pipeline from failing?",
        instructions: [
          "Recall unknown-category handling.",
        ],
        hints: [
          "Use handle_unknown.",
        ],
        explanation:
          "OneHotEncoder(handle_unknown='ignore') allows unseen categories to be transformed without raising an error.",
      },
    ],

    keyTakeaways: [
      "Different feature types need different preprocessing.",
      "ColumnTransformer routes feature subsets through appropriate transformations.",
      "Pipeline combines preprocessing and modeling.",
      "Learned preprocessing must be fitted only on training data.",
      "Pipelines are especially important during cross-validation.",
      "A fitted Pipeline provides a single consistent prediction workflow.",
    ],
  },


  // =========================================================
  // PIPELINE + COLUMN TRANSFORMER
  // =========================================================

  "pipeline-column-transformer": {
    overview:
      "A production-quality sklearn workflow should treat preprocessing and modeling as one reproducible object. Pipeline and ColumnTransformer provide this architecture. They prevent many forms of data leakage, make cross-validation reliable, allow preprocessing parameters to participate in hyperparameter tuning and guarantee that inference follows the same transformations used during training.",

    objectives: [
      "Design an end-to-end sklearn preprocessing architecture.",
      "Understand Pipeline internals.",
      "Understand ColumnTransformer internals.",
      "Build numerical and categorical branches.",
      "Prevent leakage during cross-validation.",
      "Tune nested parameters.",
      "Inspect pipeline parameters.",
      "Use pipelines for inference.",
      "Understand why reproducibility depends on pipeline design.",
    ],

    sections: [
      {
        id: "pipeline-architecture",
        title: "End-to-End Architecture",

        explanation: [
          "A robust workflow begins by splitting raw data before fitting learned transformations.",
          "Numerical and categorical columns are routed through separate preprocessing branches.",
          "ColumnTransformer combines the transformed features.",
          "Pipeline connects that combined representation to the machine-learning model.",
          "Cross-validation and tuning operate on the entire Pipeline rather than on manually transformed data.",
        ],

        intuition: [
          "The Pipeline is the complete recipe that converts a raw observation into a prediction.",
        ],

        importantPoints: [
          "Raw data enters the Pipeline.",
          "Preprocessing happens inside the Pipeline.",
          "The model receives transformed features.",
          "Evaluation should operate on the complete workflow.",
        ],
      },

      {
        id: "pipeline-fit-transform",
        title: "fit, transform and predict",

        explanation: [
          "fit learns parameters from training data.",
          "For SimpleImputer this may be medians or most-frequent categories.",
          "For StandardScaler it includes means and standard deviations.",
          "For OneHotEncoder it includes category vocabularies.",
          "For the final estimator it includes model parameters.",
          "predict applies fitted preprocessing before producing model outputs.",
        ],

        intuition: [
          "Training learns the recipe parameters; inference reuses them without relearning from the new observation.",
        ],

        importantPoints: [
          "fit learns.",
          "transform applies learned preprocessing.",
          "predict applies preprocessing plus the model.",
          "Never refit on individual production observations.",
        ],
      },

      {
        id: "pipeline-cv",
        title: "Pipeline + Cross-Validation",

        explanation: [
          "During k-fold cross-validation, each fold becomes validation data once.",
          "The Pipeline is refitted independently on the remaining training folds.",
          "Therefore imputation, scaling, encoding, selection and modeling are learned without seeing that fold.",
          "This is one of the most important reasons to use Pipeline.",
        ],

        intuition: [
          "Every validation fold gets a fair simulation of being unseen data.",
        ],

        importantPoints: [
          "Cross-validate the complete Pipeline.",
          "Do not globally fit preprocessing first.",
          "Every fold gets independent learned preprocessing.",
        ],
      },

      {
        id: "pipeline-tuning",
        title: "Hyperparameter Tuning Through Pipeline",

        explanation: [
          "Pipeline parameters can be addressed using step_name__parameter_name syntax.",
          "For example classifier__C refers to parameter C inside the classifier step.",
          "Nested preprocessing parameters can also be tuned.",
          "GridSearchCV or RandomizedSearchCV can therefore evaluate complete preprocessing-model configurations.",
        ],

        intuition: [
          "The best model may depend on the preprocessing choices, so the entire workflow can be tuned together.",
        ],

        importantPoints: [
          "Use double underscore syntax.",
          "Tune the complete workflow.",
          "Keep validation leakage-resistant.",
        ],
      },

      {
        id: "pipeline-production",
        title: "Training and Inference Consistency",

        explanation: [
          "A common production failure occurs when training and inference use different preprocessing code.",
          "A fitted Pipeline stores the exact learned preprocessing objects alongside the model.",
          "The same object can be serialized and reused for future predictions.",
          "Schema validation and versioning remain important even when a Pipeline is used.",
        ],

        intuition: [
          "The model and its preprocessing are one system, not two unrelated pieces of code.",
        ],

        importantPoints: [
          "Persist preprocessing with the model.",
          "Keep feature schema consistent.",
          "Version the complete workflow.",
        ],
      },
    ],

    visualization: {
      type: "native",
      visualizationId: "pipeline-column-transformer-builder",
      title: "Pipeline & ColumnTransformer Lab",
      description:
        "Interactively build a complete preprocessing graph, move transformations inside or outside the Pipeline, run simulated cross-validation and observe exactly where leakage occurs.",
    },

    codeExamples: [
      {
        id: "pipeline-full-code",
        title: "Production-Style sklearn Pipeline",
        description:
          "Build, cross-validate and tune a complete mixed-data classification workflow.",
        language: "python",

        code: `import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import (
    GridSearchCV,
    train_test_split
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler
)

df = pd.DataFrame({
    "age": [
        20, 22, 24, 26,
        28, 32, 36, 40,
        44, 48, 52, 56
    ],
    "income": [
        25000, 30000, None, 38000,
        42000, 50000, 62000, None,
        80000, 95000, 110000, 130000
    ],
    "city": [
        "Agra", "Delhi", "Agra", "Mumbai",
        "Delhi", None, "Agra", "Mumbai",
        "Delhi", "Agra", "Mumbai", "Delhi"
    ],
    "target": [
        0, 0, 0, 0,
        0, 0, 1, 1,
        1, 1, 1, 1
    ]
})

X = df.drop(
    columns="target"
)

y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

numeric_features = [
    "age",
    "income"
]

categorical_features = [
    "city"
]

numeric_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(
            strategy="median"
        )
    ),
    (
        "scaler",
        StandardScaler()
    )
])

categorical_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(
            strategy="most_frequent"
        )
    ),
    (
        "onehot",
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
        "classifier",
        LogisticRegression(
            max_iter=2000
        )
    )
])

parameter_grid = {
    "classifier__C": [
        0.1,
        1.0,
        10.0
    ]
}

search = GridSearchCV(
    estimator=pipeline,
    param_grid=parameter_grid,
    cv=3,
    scoring="accuracy"
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
    "Test score:",
    search.score(
        X_test,
        y_test
    )
)

predictions = search.predict(
    X_test
)

print(
    predictions
)`,

        explanation: [
          "The raw training DataFrame is passed directly to GridSearchCV.",
          "Each cross-validation split independently fits its imputers, scaler, encoder and classifier.",
          "The numerical and categorical branches are managed by ColumnTransformer.",
          "classifier__C addresses C inside the classifier Pipeline step.",
          "The held-out test set remains untouched until final evaluation.",
          "The fitted search object can predict directly from raw rows with the same feature schema.",
        ],

        commonMistakes: [
          "Tuning a model after preprocessing the entire dataset globally.",
          "Using different preprocessing code during inference.",
          "Forgetting handle_unknown for categorical production data.",
          "Using the final test set repeatedly while selecting models.",
        ],
      },
    ],

    practice: [
      {
        id: "pipeline-practice-1",
        title: "Order the Workflow",
        type: "analysis",
        difficulty: "basic",
        question:
          "Place these in a safe order: scaling, train/test split, model training.",
        instructions: [
          "Prevent test information from entering scaling.",
        ],
        hints: [
          "Split must happen before fitting the scaler.",
        ],
        explanation:
          "A safe order is train/test split → fit scaling on training data → model training using transformed training data. Pipeline automates the learned preprocessing portion.",
      },

      {
        id: "pipeline-practice-2",
        title: "Double Underscore",
        type: "coding",
        difficulty: "medium",
        question:
          "A Pipeline step is named 'model' and contains RandomForestClassifier. How would you refer to its n_estimators parameter in a GridSearchCV parameter dictionary?",
        instructions: [
          "Use step__parameter syntax.",
        ],
        hints: [
          "model + double underscore + n_estimators.",
        ],
        explanation:
          "Use 'model__n_estimators'.",
      },

      {
        id: "pipeline-practice-3",
        title: "CV Leakage",
        type: "analysis",
        difficulty: "medium",
        question:
          "Why is fitting SimpleImputer once on all X before cross-validation a problem?",
        instructions: [
          "Consider validation folds.",
        ],
        hints: [
          "Their values influenced the imputation statistics.",
        ],
        explanation:
          "Every validation fold contributes to the globally learned imputation statistics, so validation data is no longer fully unseen.",
      },

      {
        id: "pipeline-practice-4",
        title: "Inference Consistency",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Why is saving only the final classifier but not its fitted preprocessing objects dangerous?",
        instructions: [
          "Think about the representation expected by the classifier.",
        ],
        hints: [
          "The model was trained on transformed features.",
        ],
        explanation:
          "Future data may be transformed differently or not at all. The classifier expects exactly the feature representation produced by its fitted preprocessing workflow.",
      },

      {
        id: "pipeline-practice-5",
        title: "Design the Branches",
        type: "analysis",
        difficulty: "advanced",
        question:
          "Design a preprocessing architecture for age, salary, city, occupation and target churn.",
        instructions: [
          "Separate numerical and categorical features.",
          "Include missing-value handling.",
          "Include encoding and scaling.",
        ],
        hints: [
          "Use two preprocessing branches and combine them.",
        ],
        explanation:
          "A strong design uses median imputation plus scaling for age/salary, categorical imputation plus OneHotEncoder for city/occupation, combines both with ColumnTransformer and connects the result to the classifier through Pipeline.",
      },

      {
        id: "pipeline-practice-6",
        title: "Full Leakage Audit",
        type: "analysis",
        difficulty: "advanced",
        question:
          "A workflow performs median imputation, scaling, feature selection, train_test_split, GridSearchCV and final evaluation—in that order. Identify the main problem and redesign it.",
        instructions: [
          "Determine which learned operations occurred before the split.",
        ],
        hints: [
          "Imputation, scaling and feature selection all learn from data.",
        ],
        explanation:
          "The workflow leaks information because learned preprocessing occurred before splitting. Split first, place imputation, scaling and feature selection inside a Pipeline, tune that Pipeline on training data, then evaluate the selected workflow once on the untouched test set.",
      },
    ],

    commonMistakes: [
      {
        id: "pipeline-mistake-1",
        title: "Preprocessing before splitting",
        description:
          "Learned statistics from the complete dataset leak evaluation information.",
        correction:
          "Split raw data first and fit learned transformations through a Pipeline.",
      },

      {
        id: "pipeline-mistake-2",
        title: "Manual train/test preprocessing",
        description:
          "Separate code paths can create inconsistent transformations.",
        correction:
          "Use one fitted Pipeline for training and inference.",
      },

      {
        id: "pipeline-mistake-3",
        title: "Cross-validating transformed data",
        description:
          "If transformations were fitted globally, cross-validation is already contaminated.",
        correction:
          "Pass the complete Pipeline to cross-validation.",
      },
    ],

    keyTakeaways: [
      "Preprocessing and the model form one ML system.",
      "ColumnTransformer manages heterogeneous feature types.",
      "Pipeline chains preprocessing and prediction.",
      "Every learned preprocessing step must respect training boundaries.",
      "Cross-validation should operate on the complete Pipeline.",
      "GridSearchCV can tune nested Pipeline parameters.",
      "Training and inference must use the same fitted transformations.",
      "Pipeline design is central to reproducible, leakage-resistant machine learning.",
    ],
  },
};