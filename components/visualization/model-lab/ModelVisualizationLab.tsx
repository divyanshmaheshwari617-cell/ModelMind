"use client";

import {
  useState,
} from "react";

import GradientDescentVisualizer from "./gradient-descent/GradientDescentVisualizer";

/*
========================================================
MODEL TYPES
========================================================
*/

type ModelCategory =
  | "Optimization"
  | "Regression"
  | "Classification"
  | "Clustering"
  | "Dimensionality Reduction";

type ModelStatus =
  | "available"
  | "coming-soon";

type ModelDefinition = {
  id: string;

  name: string;

  shortName: string;

  category: ModelCategory;

  description: string;

  status: ModelStatus;

  parameters: string[];
};

/*
========================================================
MODEL REGISTRY

Temporary UI registry.

Later this will be moved/connected to:
config/modelRegistry.ts
========================================================
*/

const models: ModelDefinition[] = [
  {
    id: "gradient-descent",

    name: "Gradient Descent",

    shortName: "GD",

    category: "Optimization",

    description:
      "Watch a Linear Regression model learn by updating weight and bias step by step.",

    status: "available",

    parameters: [
      "Learning Rate",
      "Iterations",
      "Initial Weight",
      "Initial Bias",
      "Batch Size",
      "GD Type",
      "Loss Function",
    ],
  },

  {
    id: "linear-regression",

    name: "Linear Regression",

    shortName: "LR",

    category: "Regression",

    description:
      "Explore how slope, intercept and optimization affect the fitted regression line.",

    status: "coming-soon",

    parameters: [
      "Coefficient",
      "Intercept",
      "Regularization",
    ],
  },

  {
    id: "logistic-regression",

    name: "Logistic Regression",

    shortName: "LOG",

    category: "Classification",

    description:
      "Explore sigmoid probabilities, classification thresholds and regularization.",

    status: "coming-soon",

    parameters: [
      "C",
      "Penalty",
      "Threshold",
    ],
  },

  {
    id: "knn",

    name: "K-Nearest Neighbors",

    shortName: "KNN",

    category: "Classification",

    description:
      "See neighborhoods, voting and decision boundaries change as K changes.",

    status: "coming-soon",

    parameters: [
      "n_neighbors",
      "weights",
      "metric",
      "p",
    ],
  },

  {
    id: "decision-tree",

    name: "Decision Tree",

    shortName: "DT",

    category: "Classification",

    description:
      "Watch the tree grow and understand how depth and split rules change complexity.",

    status: "coming-soon",

    parameters: [
      "max_depth",
      "min_samples_split",
      "min_samples_leaf",
      "criterion",
    ],
  },

  {
    id: "random-forest",

    name: "Random Forest",

    shortName: "RF",

    category: "Classification",

    description:
      "Visualize multiple trees combining their predictions into one ensemble decision.",

    status: "coming-soon",

    parameters: [
      "n_estimators",
      "max_depth",
      "max_features",
      "min_samples_leaf",
    ],
  },

  {
    id: "svm",

    name: "Support Vector Machine",

    shortName: "SVM",

    category: "Classification",

    description:
      "See support vectors, margins and nonlinear decision boundaries change.",

    status: "coming-soon",

    parameters: [
      "C",
      "kernel",
      "gamma",
      "degree",
    ],
  },

  {
    id: "naive-bayes",

    name: "Naive Bayes",

    shortName: "NB",

    category: "Classification",

    description:
      "Explore class distributions and how probabilities create predictions.",

    status: "coming-soon",

    parameters: [
      "var_smoothing",
    ],
  },

  {
    id: "kmeans",

    name: "K-Means",

    shortName: "KM",

    category: "Clustering",

    description:
      "Watch centroids move and data points change clusters until convergence.",

    status: "coming-soon",

    parameters: [
      "n_clusters",
      "init",
      "max_iter",
    ],
  },

  {
    id: "pca",

    name: "PCA",

    shortName: "PCA",

    category:
      "Dimensionality Reduction",

    description:
      "See principal directions rotate and data project into fewer dimensions.",

    status: "coming-soon",

    parameters: [
      "n_components",
    ],
  },

  {
    id: "gradient-boosting",

    name: "Gradient Boosting",

    shortName: "GB",

    category: "Classification",

    description:
      "See weak learners sequentially correct errors made by previous learners.",

    status: "coming-soon",

    parameters: [
      "n_estimators",
      "learning_rate",
      "max_depth",
    ],
  },

  {
    id: "adaboost",

    name: "AdaBoost",

    shortName: "ADA",

    category: "Classification",

    description:
      "Watch incorrectly classified samples receive greater importance across learners.",

    status: "coming-soon",

    parameters: [
      "n_estimators",
      "learning_rate",
    ],
  },
];

/*
========================================================
CATEGORIES
========================================================
*/

const categories = [
  "All",
  "Optimization",
  "Regression",
  "Classification",
  "Clustering",
  "Dimensionality Reduction",
] as const;

type CategoryFilter =
  (typeof categories)[number];

/*
========================================================
MAIN COMPONENT
========================================================
*/

export default function ModelVisualizationLab() {
  const [
    selectedModelId,
    setSelectedModelId,
  ] = useState(
    "gradient-descent"
  );

  const [
    category,
    setCategory,
  ] =
    useState<CategoryFilter>(
      "All"
    );

  const [
    showLibrary,
    setShowLibrary,
  ] = useState(false);

  const selectedModel =
    models.find(
      (model) =>
        model.id ===
        selectedModelId
    ) ?? models[0];

  const filteredModels =
    category === "All"
      ? models
      : models.filter(
          (model) =>
            model.category ===
            category
        );

  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <div className="space-y-6">
      {/* LAB HEADER */}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                ModelMind Learning Lab
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-zinc-100 md:text-3xl">
                Model Visualization Lab
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                Learn machine
                learning by changing
                parameters and
                watching what
                physically changes
                inside the algorithm.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowLibrary(
                  (previous) =>
                    !previous
                )
              }
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              {showLibrary
                ? "Hide Models"
                : "Explore Models"}
            </button>
          </div>

          {/* CURRENT MODEL */}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              Current Model
            </span>

            <span className="text-sm font-semibold text-zinc-100">
              {
                selectedModel.name
              }
            </span>

            <span className="text-zinc-700">
              •
            </span>

            <span className="text-xs text-zinc-500">
              {
                selectedModel.category
              }
            </span>
          </div>
        </div>

        {/* LEARNING FLOW */}

        <div className="border-t border-zinc-800 bg-zinc-900/30 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <FlowItem>
              Select Model
            </FlowItem>

            <Arrow />

            <FlowItem>
              Select Parameter
            </FlowItem>

            <Arrow />

            <FlowItem>
              Change Value
            </FlowItem>

            <Arrow />

            <FlowItem>
              Watch Animation
            </FlowItem>

            <Arrow />

            <FlowItem>
              Understand Effect
            </FlowItem>
          </div>
        </div>
      </div>

      {/* MODEL LIBRARY */}

      {showLibrary && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Model Library
            </p>

            <h2 className="mt-2 text-lg font-semibold text-zinc-100">
              Choose an Algorithm
            </h2>

            {/* CATEGORY FILTER */}

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setCategory(
                        item
                      )
                    }
                    className={[
                      "rounded-lg border px-3 py-2 text-xs transition",
                      category ===
                      item
                        ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300",
                    ].join(
                      " "
                    )}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {/* MODEL CARDS */}

          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredModels.map(
              (model) => {
                const selected =
                  model.id ===
                  selectedModelId;

                const available =
                  model.status ===
                  "available";

                return (
                  <button
                    key={
                      model.id
                    }
                    type="button"
                    disabled={
                      !available
                    }
                    onClick={() => {
                      if (
                        available
                      ) {
                        setSelectedModelId(
                          model.id
                        );

                        setShowLibrary(
                          false
                        );
                      }
                    }}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-zinc-500 bg-zinc-800"
                        : "border-zinc-800 bg-zinc-900/30",
                      available
                        ? "hover:border-zinc-600 hover:bg-zinc-900"
                        : "cursor-not-allowed opacity-60",
                    ].join(
                      " "
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 font-mono text-xs font-semibold text-zinc-300">
                        {
                          model.shortName
                        }
                      </div>

                      <StatusBadge
                        available={
                          available
                        }
                      />
                    </div>

                    <h3 className="mt-4 font-semibold text-zinc-100">
                      {
                        model.name
                      }
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      {
                        model.description
                      }
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {model.parameters
                        .slice(
                          0,
                          4
                        )
                        .map(
                          (
                            parameter
                          ) => (
                            <span
                              key={
                                parameter
                              }
                              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[10px] text-zinc-500"
                            >
                              {
                                parameter
                              }
                            </span>
                          )
                        )}

                      {model
                        .parameters
                        .length >
                        4 && (
                        <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-500">
                          +
                          {model
                            .parameters
                            .length -
                            4}{" "}
                          more
                        </span>
                      )}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ACTIVE MODEL */}

      {selectedModelId ===
        "gradient-descent" && (
        <GradientDescentVisualizer />
      )}

      {/* FUTURE MODEL FALLBACK */}

      {selectedModel.status ===
        "coming-soon" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <p className="text-sm font-semibold text-zinc-200">
            {
              selectedModel.name
            }
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            This visualization
            module is being added
            to the ModelMind model
            engine.
          </p>
        </div>
      )}
    </div>
  );
}

/*
========================================================
STATUS
========================================================
*/

function StatusBadge({
  available,
}: {
  available: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        available
          ? "border-emerald-900 bg-emerald-950/40 text-emerald-400"
          : "border-zinc-800 bg-zinc-900 text-zinc-600",
      ].join(" ")}
    >
      {available
        ? "Available"
        : "Coming Soon"}
    </span>
  );
}

/*
========================================================
FLOW
========================================================
*/

function FlowItem({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
      {children}
    </span>
  );
}

function Arrow() {
  return (
    <span className="text-zinc-700">
      →
    </span>
  );
}