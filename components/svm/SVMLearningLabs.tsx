import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSVM,
} from "./context/SVMContext";

import HyperplaneExplorer
  from "./hyperplane/HyperplaneExplorer";

import MarginVisualizer
  from "./hyperplane/MarginVisualizer";

import SupportVectorExplorer
  from "./hyperplane/SupportVectorExplorer";

import CVisualizer
  from "./optimization/CVisualizer";

import GammaVisualizer
  from "./optimization/GammaVisualizer";

import EpsilonVisualizer
  from "./optimization/EpsilonVisualizer";

import KernelTransformation3D
  from "./kernels/KernelTransformation3D";

import KernelComparison
  from "./kernels/KernelComparison";

import "./SVMLearningLabs.css";

type Lab =
  | "hyperplane"
  | "margin"
  | "support"
  | "c"
  | "gamma"
  | "kernel3d"
  | "comparison"
  | "epsilon";

type LabDefinition = {
  id: Lab;
  name: string;
  shortName: string;
  description: string;
  classification: boolean;
  regression: boolean;
};

const LABS: LabDefinition[] = [
  {
    id: "hyperplane",
    name: "Hyperplane Explorer",
    shortName: "Hyperplane",
    description:
      "Understand the separating decision boundary and how SVM divides the feature space.",
    classification: true,
    regression: false,
  },
  {
    id: "margin",
    name: "Margin Visualizer",
    shortName: "Margin",
    description:
      "See the maximum-margin idea and how distance from the boundary affects the classifier.",
    classification: true,
    regression: false,
  },
  {
    id: "support",
    name: "Support Vector Explorer",
    shortName: "Support Vectors",
    description:
      "Identify the observations closest to the decision boundary and understand why they matter.",
    classification: true,
    regression: false,
  },
  {
    id: "c",
    name: "C Parameter Lab",
    shortName: "C",
    description:
      "Change C and observe the educational soft-margin trade-off between tolerance and stricter fitting.",
    classification: true,
    regression: true,
  },
  {
    id: "gamma",
    name: "Gamma Visualizer",
    shortName: "Gamma",
    description:
      "Explore how gamma changes the locality and influence radius of nonlinear kernels.",
    classification: true,
    regression: true,
  },
  {
    id: "kernel3d",
    name: "Kernel Trick 3D",
    shortName: "Kernel 3D",
    description:
      "Rotate the transformed feature space and compare how the selected kernel changes geometry.",
    classification: true,
    regression: true,
  },
  {
    id: "comparison",
    name: "Kernel Comparison",
    shortName: "Compare Kernels",
    description:
      "Compare Linear, Polynomial, RBF, Sigmoid and educational custom kernels using the active dataset.",
    classification: true,
    regression: true,
  },
  {
    id: "epsilon",
    name: "SVR Epsilon Lab",
    shortName: "Epsilon",
    description:
      "Change epsilon and observe how the regression tolerance tube becomes wider or narrower.",
    classification: false,
    regression: true,
  },
];

export default function SVMLearningLabs() {
  const {
    state,
  } = useSVM();

  const [
    activeLab,
    setActiveLab,
  ] =
    useState<Lab>(
      state.task ===
        "regression"
        ? "epsilon"
        : "hyperplane"
    );

  const availableLabs =
    useMemo(
      () =>
        LABS.filter(
          (lab) =>
            state.task ===
            "classification"
              ? lab.classification
              : lab.regression
        ),
      [state.task]
    );

  useEffect(() => {
    const stillAvailable =
      availableLabs.some(
        (lab) =>
          lab.id === activeLab
      );

    if (stillAvailable) {
      return;
    }

    setActiveLab(
      state.task ===
        "regression"
        ? "epsilon"
        : "hyperplane"
    );
  }, [
    state.task,
    activeLab,
    availableLabs,
  ]);

  const activeDefinition =
    availableLabs.find(
      (lab) =>
        lab.id === activeLab
    ) ??
    availableLabs[0];

  const datasetName =
    state.dataset?.name ??
    "No active dataset";

  const featureCount =
    state.dataset
      ?.featureColumns
      .length ?? 0;

  const rowCount =
    state.dataset
      ?.rows
      .length ?? 0;

  const kernelName =
    state.parameters.kernel
      .replace("-", " ")
      .toUpperCase();

  const gammaRelevant =
    [
      "rbf",
      "polynomial",
      "sigmoid",
      "laplacian",
      "chi-square",
      "custom",
    ].includes(
      state.parameters.kernel
    );

  return (
    <section className="svm-learning-labs">
      <div className="learning-labs-heading">
        <span>
          INTERACTIVE SVM LABS
        </span>

        <h2>
          Explore Every Important
          SVM Concept
        </h2>

        <p>
          Every lab below uses the
          same active ModelMind SVM
          state. Change the dataset,
          task, kernel or parameters
          and the applicable learning
          labs stay synchronized.
        </p>
      </div>

      <div className="learning-lab-live-state">
        <div>
          <span>
            TASK
          </span>

          <strong>
            {state.task ===
            "classification"
              ? "SVC"
              : "SVR"}
          </strong>
        </div>

        <div>
          <span>
            DATASET
          </span>

          <strong>
            {datasetName}
          </strong>
        </div>

        <div>
          <span>
            DATA
          </span>

          <strong>
            {rowCount} rows ·{" "}
            {featureCount} features
          </strong>
        </div>

        <div>
          <span>
            KERNEL
          </span>

          <strong>
            {kernelName}
          </strong>
        </div>

        <div>
          <span>
            C
          </span>

          <strong>
            {state.parameters.C.toFixed(
              2
            )}
          </strong>
        </div>

        {gammaRelevant && (
          <div>
            <span>
              GAMMA
            </span>

            <strong>
              {state.parameters.gamma.toFixed(
                3
              )}
            </strong>
          </div>
        )}

        {state.task ===
          "regression" && (
          <div>
            <span>
              EPSILON
            </span>

            <strong>
              {state.parameters.epsilon.toFixed(
                3
              )}
            </strong>
          </div>
        )}

        <div>
          <span>
            SCALING
          </span>

          <strong>
            {state.dataset
              ?.scalingEnabled
              ? "ON"
              : "OFF"}
          </strong>
        </div>
      </div>

      <div className="learning-lab-tabs">
        {availableLabs.map(
          (lab) => (
            <button
              key={lab.id}
              type="button"
              className={
                activeLab ===
                lab.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveLab(
                  lab.id
                )
              }
              title={
                lab.description
              }
            >
              {lab.shortName}
            </button>
          )
        )}
      </div>

      {activeDefinition && (
        <div className="learning-lab-context">
          <div>
            <span>
              ACTIVE LAB
            </span>

            <h3>
              {
                activeDefinition.name
              }
            </h3>

            <p>
              {
                activeDefinition.description
              }
            </p>
          </div>

          <div className="learning-lab-context-badges">
            <span>
              {
                state.parameters.kernel
              }{" "}
              kernel
            </span>

            <span>
              C ={" "}
              {state.parameters.C.toFixed(
                2
              )}
            </span>

            {gammaRelevant && (
              <span>
                γ ={" "}
                {state.parameters.gamma.toFixed(
                  3
                )}
              </span>
            )}

            {state.task ===
              "regression" && (
              <span>
                ε ={" "}
                {state.parameters.epsilon.toFixed(
                  3
                )}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="learning-lab-content">
        {activeLab ===
          "hyperplane" && (
          <HyperplaneExplorer />
        )}

        {activeLab ===
          "margin" && (
          <MarginVisualizer />
        )}

        {activeLab ===
          "support" && (
          <SupportVectorExplorer />
        )}

        {activeLab ===
          "c" && (
          <CVisualizer />
        )}

        {activeLab ===
          "gamma" && (
          <GammaVisualizer />
        )}

        {activeLab ===
          "kernel3d" && (
          <KernelTransformation3D />
        )}

        {activeLab ===
          "comparison" && (
          <KernelComparison />
        )}

        {activeLab ===
          "epsilon" && (
          <EpsilonVisualizer />
        )}
      </div>

      <div className="learning-lab-truth">
        <strong>
          ModelMind Learning Mode
        </strong>

        <span>
          These interactive labs are
          educational visualizations.
          They explain how SVM
          parameters affect geometry
          and predictions; they are
          not presented as the exact
          optimization path used
          internally by scikit-learn.
        </span>
      </div>
    </section>
  );
}