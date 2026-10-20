
export type LabCategory =
  | "Regression"
  | "Classification"
  | "Ensembles"
  | "Neural Networks"
  | "Unsupervised"
  | "Optimization";

export interface MLLab {
  id: string;
  title: string;
  category: LabCategory;
  description: string;
  url: string;
  skillIds: string[];
}

// =========================================================
// ALL MODELMIND LABS
// All 24 existing labs and their URLs are preserved.
// =========================================================

export const mlLabs: MLLab[] = [
  // =======================================================
  // REGRESSION
  // =======================================================
  {
    id: "simple-linear-regression",
    title: "Simple Linear Regression",
    category: "Regression",
    description:
      "Explore the relationship between one input feature and a continuous target.",
    url: "https://modelmind-linear-regression.onrender.com/",
    skillIds: ["linear-regression", "simple-linear-regression"],
  },
  {
    id: "multiple-linear-regression",
    title: "Multiple Linear Regression",
    category: "Regression",
    description:
      "Understand regression using multiple input features.",
    url: "https://modelmind-multiple-linear-regression-7ehl.onrender.com/",
    skillIds: ["multiple-linear-regression"],
  },
  {
    id: "polynomial-regression",
    title: "Polynomial Regression",
    category: "Regression",
    description:
      "Explore nonlinear regression, polynomial degree, curve fitting, underfitting and overfitting.",
    url: "https://modelmind-polynomial-frontend-v2.onrender.com/",
    skillIds: ["polynomial-regression"],
  },
  {
    id: "regularization",
    title: "Regularization (Ridge, Lasso & Elastic Net)",
    category: "Regression",
    description:
      "Visualize Ridge, Lasso and Elastic Net regularization, coefficient shrinkage, overfitting and regularization strength.",
    url: "https://modelmind-regularization.onrender.com/",
    skillIds: ["regularization"],
  },

  // =======================================================
  // CLASSIFICATION
  // =======================================================
  {
    id: "binary-logistic-regression",
    title: "Binary Logistic Regression",
    category: "Classification",
    description:
      "Explore probability predictions for two-class classification.",
    url: "https://modelmind-logistic-regression-lab.onrender.com/",
    skillIds: ["logistic-regression", "binary-logistic-regression"],
  },
  {
    id: "multiclass-logistic-regression",
    title: "Multiclass Logistic Regression",
    category: "Classification",
    description:
      "Explore classification across three or more classes.",
    url: "https://multiclass-logistic-regression.onrender.com/",
    skillIds: ["multiclass-logistic-regression"],
  },
  {
  id: "decision-tree",
  title: "Decision Tree Visualization",
  category: "Classification",
  description:
    "Explore decision tree splitting, entropy, Gini impurity, information gain, and tree-based predictions.",
  url: "https://decision-tree-studio.onrender.com/",
  skillIds: ["decision-tree"],
},
  {
    id: "knn",
    title: "K-Nearest Neighbors (KNN)",
    category: "Classification",
    description:
      "Explore neighbor selection, distances and predictions.",
    url: "https://modelmind-knn-lab.onrender.com",
    skillIds: ["knn", "k-nearest-neighbors"],
  },
  {
    id: "naive-bayes",
    title: "Naive Bayes",
    category: "Classification",
    description:
      "Explore probabilistic classification and Bayes' theorem.",
    url: "https://modelmind-naive-bayes.onrender.com/",
    skillIds: ["naive-bayes"],
  },
  {
    id: "svm",
    title: "Support Vector Machine (SVM)",
    category: "Classification",
    description:
      "Explore margins, support vectors and decision boundaries.",
    url: "https://modelmind-svm.onrender.com/",
    skillIds: ["svm", "support-vector-machine"],
  },

  // =======================================================
  // ENSEMBLE LEARNING
  // =======================================================
  {
    id: "ensemble-learning",
    title: "Ensemble Learning Studio",
    category: "Ensembles",
    description:
      "Compare individual machine learning models with ensemble methods using interactive visualizations and evaluation metrics.",
    url: "https://modelmind-ensemble-lab-2026.onrender.com/",
    skillIds: ["ensemble-learning"],
  },
  {
    id: "bagging",
    title: "Bagging Studio",
    category: "Ensembles",
    description:
      "Explore bootstrap sampling, parallel estimators, variance reduction and bagging-based predictions.",
    url: "https://modelmind-bagging-studio-2026.onrender.com/",
    skillIds: ["bagging"],
  },
  {
    id: "random-forest",
    title: "Random Forest",
    category: "Ensembles",
    description:
      "Understand how multiple decision trees combine predictions.",
    url: "https://random-forest-explorer.onrender.com/",
    skillIds: ["random-forest"],
  },
  {
    id: "boosting-studio",
    title: "Boosting Studio",
    category: "Ensembles",
    description:
      "Explore sequential ensemble learning, weak learners, boosting methods and iterative model improvement.",
    url: "https://modelmind-boosting-frontend.onrender.com/",
    skillIds: [
      "boosting-foundations",
      "boosting",
      "adaboost",
      "gradient-boosting",
    ],
  },
  {
    id: "gradient-boosting",
    title: "Gradient Boosting",
    category: "Ensembles",
    description:
      "Explore sequential ensemble learning and error correction.",
    url: "https://gradient-boosting-frontend.onrender.com/",
    skillIds: ["gradient-boosting"],
  },
  {
    id: "xgboost",
    title: "XGBoost",
    category: "Ensembles",
    description:
      "Explore regularized gradient-boosted trees.",
    url: "https://xgboost-y5q7.onrender.com/",
    skillIds: ["xgboost"],
  },
  {
    id: "catboost",
    title: "CatBoost",
    category: "Ensembles",
    description:
      "Explore boosted trees and categorical feature handling.",
    url: "https://catboost-lab.onrender.com/",
    skillIds: ["catboost"],
  },
  {
    id: "lightgbm",
    title: "LightGBM",
    category: "Ensembles",
    description:
      "Explore efficient gradient boosting with decision trees.",
    url: "https://lightgbm-viz.onrender.com/",
    skillIds: ["lightgbm"],
  },
  {
    id: "voting-stacking",
    title: "Voting & Stacking Studio",
    category: "Ensembles",
    description:
      "Explore hard voting, soft voting, stacking ensembles and meta-model predictions.",
    url: "https://modelmind-voting-stacking.onrender.com/",
    skillIds: ["voting-stacking", "voting", "stacking"],
  },

  // =======================================================
  // NEURAL NETWORKS
  // =======================================================
  {
    id: "perceptron",
    title: "Perceptron",
    category: "Neural Networks",
    description:
      "Explore a single artificial neuron and its learning rule.",
    url: "https://all-visualizations.onrender.com/",
    skillIds: ["perceptron"],
  },
  {
    id: "mlp",
    title: "Multilayer Perceptron (MLP)",
    category: "Neural Networks",
    description:
      "Explore layers, activations and neural network predictions.",
    url: "https://mlp-5svl.onrender.com/",
    skillIds: ["mlp", "multilayer-perceptron"],
  },

  // =======================================================
  // UNSUPERVISED LEARNING
  // =======================================================
  {
    id: "k-means",
    title: "K-Means Clustering",
    category: "Unsupervised",
    description:
      "Explore centroids, cluster assignments and iterations.",
    url: "https://k-means-o9np.onrender.com/",
    skillIds: ["k-means", "kmeans"],
  },
  {
    id: "clustering-studio",
    title: "Clustering Visualization Studio",
    category: "Unsupervised",
    description:
      "Explore clustering algorithms, cluster structures, distance relationships and unsupervised learning visualizations.",
    url: "https://cluster-visualization.onrender.com/",
    skillIds: [
      "clustering",
      "clustering-evaluation",
      "k-means",
      "hierarchical-clustering",
      "dbscan",
    ],
  },
  {
    id: "pca",
    title: "Principal Component Analysis (PCA)",
    category: "Unsupervised",
    description:
      "Explore dimensionality reduction and principal components.",
    url: "https://pca-matrix-studio.onrender.com/",
    skillIds: ["pca"],
  },

  // =======================================================
  // OPTIMIZATION
  // =======================================================
  {
    id: "gradient-descent",
    title: "Gradient Descent",
    category: "Optimization",
    description:
      "Explore learning rates, optimization paths and convergence.",
    url: "https://modelmind-gradient-descent-static-2026.onrender.com/",
    skillIds: ["gradient-descent"],
  },
];

// =========================================================
// NORMALIZATION
// =========================================================

function normalizeTopic(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// =========================================================
// TOPIC ALIASES
//
// Existing aliases preserved.
// Expanded mappings allow multiple labs per roadmap topic.
// =========================================================

const topicToLab: Record<string, string[]> = {
  // Regularization
  "regularization": ["regularization"],
  "ridge regression": ["regularization"],
  "lasso regression": ["regularization"],
  "elastic net": ["regularization"],
  "ridge": ["regularization"],
  "lasso": ["regularization"],

  // Linear Regression
  "simple linear regression": ["simple-linear-regression"],
  "multiple linear regression": ["multiple-linear-regression"],
  "multivariate linear regression": ["multiple-linear-regression"],

  "linear regression": [
    "simple-linear-regression",
    "multiple-linear-regression",
  ],

  "polynomial regression": ["polynomial-regression"],

  // Logistic Regression
  "binary logistic regression": ["binary-logistic-regression"],
  "multiclass logistic regression": ["multiclass-logistic-regression"],
  "multinomial logistic regression": ["multiclass-logistic-regression"],

  "logistic regression": [
    "binary-logistic-regression",
    "multiclass-logistic-regression",
  ],

  // Classification
"decision tree": ["decision-tree"],
"decision tree classifier": ["decision-tree"],
"decision trees": ["decision-tree"],

"knn": ["knn"],
  "k nearest neighbors": ["knn"],
  "k nearest neighbours": ["knn"],
  "naive bayes": ["naive-bayes"],
  "svm": ["svm"],
  "support vector machine": ["svm"],
  "support vector machines": ["svm"],

  // Ensemble Learning
  "ensemble learning": [
    "ensemble-learning",
    "bagging",
    "boosting-studio",
    "voting-stacking",
    "catboost",
    "lightgbm",
  ],

  "bagging": ["bagging"],

  "random forest": [
    "random-forest",
    "bagging",
  ],

  // Boosting
  "boosting": ["boosting-studio"],
  "boosting foundations": ["boosting-studio"],
  "adaboost": ["boosting-studio"],

  "gradient boosting": [
    "gradient-boosting",
    "boosting-studio",
    "catboost",
    "lightgbm",
  ],

  "xgboost": ["xgboost"],
  "catboost": ["catboost"],
  "lightgbm": ["lightgbm"],

  // Voting and Stacking
  "voting stacking": ["voting-stacking"],
  "voting": ["voting-stacking"],
  "stacking": ["voting-stacking"],

  // Neural Networks
  "perceptron": ["perceptron"],
  "mlp": ["mlp"],
  "multilayer perceptron": ["mlp"],
  "multi layer perceptron": ["mlp"],

  // Unsupervised Learning
  "k means": [
    "k-means",
    "clustering-studio",
  ],

  "k means clustering": [
    "k-means",
    "clustering-studio",
  ],

  "clustering": ["clustering-studio"],
  "clustering evaluation": ["clustering-studio"],
  "hierarchical clustering": ["clustering-studio"],
  "dbscan": ["clustering-studio"],

  // Dimensionality Reduction
  "pca": ["pca"],
  "principal component analysis": ["pca"],

  // Optimization
  "gradient descent": ["gradient-descent"],
};

// =========================================================
// GET LABS FOR ROADMAP SKILL
//
// Preserves existing behavior:
// - Exact topic title mapping takes priority.
// - Skill ID mapping is used next.
// - Exact skillIds fallback.
// - Supports multiple relevant labs.
// =========================================================

export function getLabsForSkill(
  skillId: string,
  topicTitle?: string
): MLLab[] {
  const normalizedId = normalizeTopic(skillId);
  const normalizedTitle = normalizeTopic(topicTitle ?? "");

  const titleMatches = topicToLab[normalizedTitle];
  const idMatches = topicToLab[normalizedId];

  const mappedIds = titleMatches ?? idMatches;

  if (mappedIds) {
    return mappedIds
      .map((labId) =>
        mlLabs.find((lab) => lab.id === labId)
      )
      .filter((lab): lab is MLLab => lab !== undefined);
  }

  return mlLabs.filter((lab) =>
    lab.skillIds.some(
      (id) => normalizeTopic(id) === normalizedId
    )
  );
}

// =========================================================
// GET ALL LABS FOR EXPLORE / LABS GALLERY
// =========================================================

export function getAllLabs(): MLLab[] {
  return mlLabs;
}

// =========================================================
// GET LAB BY ID
// =========================================================

export function getLabById(
  labId: string
): MLLab | undefined {
  return mlLabs.find((lab) => lab.id === labId);
}

// =========================================================
// GET LABS BY CATEGORY
// =========================================================

export function getLabsByCategory(
  category: LabCategory
): MLLab[] {
  return mlLabs.filter(
    (lab) => lab.category === category
  );
}
