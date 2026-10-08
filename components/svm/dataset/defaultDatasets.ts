export type RawDatasetRow =
  Record<string, string | number>;

export type BuiltInDataset = {
  id: string;
  name: string;
  description: string;
  task: "classification" | "regression";
  rows: RawDatasetRow[];
};

/*
 * =========================================================
 * DEFAULT MODELMIND SVC SHOWCASE
 * =========================================================
 *
 * This is intentionally nonlinear.
 *
 * X1 + X2:
 *   Excellent for showing why a straight line may fail.
 *
 * RadialFeature:
 *   Gives the 3D visualization a meaningful third feature.
 *
 * This makes the dataset useful for:
 * - Raw data
 * - Class visualization
 * - Candidate hyperplanes
 * - Margins
 * - Support vectors
 * - C
 * - Linear vs nonlinear kernels
 * - Gamma
 * - Polynomial degree
 * - Kernel transformation
 * - 2D
 * - 3D
 * - Prediction
 */

export const showcaseClassificationRows:
  RawDatasetRow[] = [
    // -------------------------
    // INNER CLASS
    // -------------------------

    {
      X1: 0.15,
      X2: 0.2,
      RadialFeature: 0.25,
      Class: "Inner",
    },
    {
      X1: -0.25,
      X2: 0.15,
      RadialFeature: 0.29,
      Class: "Inner",
    },
    {
      X1: 0.35,
      X2: -0.15,
      RadialFeature: 0.38,
      Class: "Inner",
    },
    {
      X1: -0.2,
      X2: -0.35,
      RadialFeature: 0.4,
      Class: "Inner",
    },
    {
      X1: 0.45,
      X2: 0.25,
      RadialFeature: 0.51,
      Class: "Inner",
    },
    {
      X1: -0.5,
      X2: 0.2,
      RadialFeature: 0.54,
      Class: "Inner",
    },
    {
      X1: 0.25,
      X2: -0.55,
      RadialFeature: 0.6,
      Class: "Inner",
    },
    {
      X1: -0.4,
      X2: -0.45,
      RadialFeature: 0.6,
      Class: "Inner",
    },
    {
      X1: 0.65,
      X2: 0.1,
      RadialFeature: 0.66,
      Class: "Inner",
    },
    {
      X1: -0.1,
      X2: 0.7,
      RadialFeature: 0.71,
      Class: "Inner",
    },
    {
      X1: 0.55,
      X2: -0.55,
      RadialFeature: 0.78,
      Class: "Inner",
    },
    {
      X1: -0.7,
      X2: -0.25,
      RadialFeature: 0.74,
      Class: "Inner",
    },

    // -------------------------
    // OUTER CLASS
    // -------------------------

    {
      X1: 1.75,
      X2: 0.15,
      RadialFeature: 1.76,
      Class: "Outer",
    },
    {
      X1: -1.8,
      X2: 0.25,
      RadialFeature: 1.82,
      Class: "Outer",
    },
    {
      X1: 0.15,
      X2: 1.9,
      RadialFeature: 1.91,
      Class: "Outer",
    },
    {
      X1: -0.25,
      X2: -1.85,
      RadialFeature: 1.87,
      Class: "Outer",
    },
    {
      X1: 1.45,
      X2: 1.35,
      RadialFeature: 1.98,
      Class: "Outer",
    },
    {
      X1: -1.5,
      X2: 1.4,
      RadialFeature: 2.05,
      Class: "Outer",
    },
    {
      X1: 1.55,
      X2: -1.45,
      RadialFeature: 2.12,
      Class: "Outer",
    },
    {
      X1: -1.6,
      X2: -1.5,
      RadialFeature: 2.19,
      Class: "Outer",
    },
    {
      X1: 2.2,
      X2: 0.55,
      RadialFeature: 2.27,
      Class: "Outer",
    },
    {
      X1: -2.15,
      X2: 0.65,
      RadialFeature: 2.25,
      Class: "Outer",
    },
    {
      X1: 0.6,
      X2: 2.25,
      RadialFeature: 2.33,
      Class: "Outer",
    },
    {
      X1: -0.55,
      X2: -2.2,
      RadialFeature: 2.27,
      Class: "Outer",
    },

    // -------------------------
    // NEAR-BOUNDARY POINTS
    // useful for C / margin /
    // support-vector teaching
    // -------------------------

    {
      X1: 0.95,
      X2: 0.55,
      RadialFeature: 1.1,
      Class: "Inner",
    },
    {
      X1: -0.9,
      X2: 0.65,
      RadialFeature: 1.11,
      Class: "Inner",
    },
    {
      X1: 1.15,
      X2: 0.7,
      RadialFeature: 1.35,
      Class: "Outer",
    },
    {
      X1: -1.1,
      X2: -0.75,
      RadialFeature: 1.33,
      Class: "Outer",
    },
  ];

/*
 * =========================================================
 * LINEAR CLASSIFICATION
 * =========================================================
 */

export const linearClassificationRows:
  RawDatasetRow[] = [
    {
      Feature1: 1,
      Feature2: 1.2,
      Feature3: 0.8,
      Class: "A",
    },
    {
      Feature1: 1.3,
      Feature2: 1.5,
      Feature3: 1.1,
      Class: "A",
    },
    {
      Feature1: 1.6,
      Feature2: 1.1,
      Feature3: 1.4,
      Class: "A",
    },
    {
      Feature1: 1.9,
      Feature2: 1.8,
      Feature3: 1.3,
      Class: "A",
    },
    {
      Feature1: 2.1,
      Feature2: 1.4,
      Feature3: 1.7,
      Class: "A",
    },

    {
      Feature1: 4,
      Feature2: 4.2,
      Feature3: 3.8,
      Class: "B",
    },
    {
      Feature1: 4.4,
      Feature2: 3.9,
      Feature3: 4.1,
      Class: "B",
    },
    {
      Feature1: 4.8,
      Feature2: 4.6,
      Feature3: 4.4,
      Class: "B",
    },
    {
      Feature1: 5.1,
      Feature2: 4.3,
      Feature3: 4.8,
      Class: "B",
    },
    {
      Feature1: 5.4,
      Feature2: 5,
      Feature3: 5.2,
      Class: "B",
    },
  ];

/*
 * =========================================================
 * XOR DATASET
 * =========================================================
 */

export const xorClassificationRows:
  RawDatasetRow[] = [
    {
      X1: -2.4,
      X2: -2.1,
      Height: 1,
      Class: "A",
    },
    {
      X1: -1.7,
      X2: -1.4,
      Height: 1.3,
      Class: "A",
    },
    {
      X1: 1.5,
      X2: 1.8,
      Height: 1.1,
      Class: "A",
    },
    {
      X1: 2.3,
      X2: 2.1,
      Height: 1.5,
      Class: "A",
    },

    {
      X1: -2.2,
      X2: 2,
      Height: 3.5,
      Class: "B",
    },
    {
      X1: -1.5,
      X2: 1.4,
      Height: 3.1,
      Class: "B",
    },
    {
      X1: 1.4,
      X2: -1.6,
      Height: 3.3,
      Class: "B",
    },
    {
      X1: 2.2,
      X2: -2.3,
      Height: 3.8,
      Class: "B",
    },
  ];

/*
 * =========================================================
 * CIRCULAR DATASET
 * =========================================================
 */

export const circleClassificationRows:
  RawDatasetRow[] = [
    {
      X: 0.1,
      Y: 0.2,
      RadiusFeature: 0.22,
      Class: "Inner",
    },
    {
      X: -0.3,
      Y: 0.1,
      RadiusFeature: 0.32,
      Class: "Inner",
    },
    {
      X: 0.4,
      Y: -0.2,
      RadiusFeature: 0.45,
      Class: "Inner",
    },
    {
      X: -0.2,
      Y: -0.4,
      RadiusFeature: 0.45,
      Class: "Inner",
    },
    {
      X: 0.5,
      Y: 0.3,
      RadiusFeature: 0.58,
      Class: "Inner",
    },

    {
      X: 2.4,
      Y: 0.3,
      RadiusFeature: 2.42,
      Class: "Outer",
    },
    {
      X: -2.2,
      Y: 0.6,
      RadiusFeature: 2.28,
      Class: "Outer",
    },
    {
      X: 0.4,
      Y: 2.5,
      RadiusFeature: 2.53,
      Class: "Outer",
    },
    {
      X: -0.5,
      Y: -2.4,
      RadiusFeature: 2.45,
      Class: "Outer",
    },
    {
      X: 1.8,
      Y: 1.7,
      RadiusFeature: 2.48,
      Class: "Outer",
    },
  ];

/*
 * =========================================================
 * DEFAULT SVR SHOWCASE
 * =========================================================
 *
 * 3 real numeric features.
 * Continuous target.
 * Slight nonlinear behavior so kernels,
 * C, gamma and epsilon have something
 * meaningful to demonstrate.
 */

export const regressionRows:
  RawDatasetRow[] = [
    {
      Hours: 1,
      Experience: 1.1,
      Difficulty: 4.8,
      Score: 18,
    },
    {
      Hours: 1.5,
      Experience: 1.4,
      Difficulty: 4.6,
      Score: 23,
    },
    {
      Hours: 2,
      Experience: 1.7,
      Difficulty: 4.4,
      Score: 28,
    },
    {
      Hours: 2.5,
      Experience: 1.9,
      Difficulty: 4.1,
      Score: 31,
    },
    {
      Hours: 3,
      Experience: 2.2,
      Difficulty: 3.9,
      Score: 37,
    },
    {
      Hours: 3.5,
      Experience: 2.5,
      Difficulty: 3.7,
      Score: 41,
    },
    {
      Hours: 4,
      Experience: 2.7,
      Difficulty: 3.5,
      Score: 46,
    },
    {
      Hours: 4.5,
      Experience: 3,
      Difficulty: 3.3,
      Score: 51,
    },
    {
      Hours: 5,
      Experience: 3.2,
      Difficulty: 3,
      Score: 57,
    },
    {
      Hours: 5.5,
      Experience: 3.5,
      Difficulty: 2.9,
      Score: 60,
    },
    {
      Hours: 6,
      Experience: 3.7,
      Difficulty: 2.7,
      Score: 66,
    },
    {
      Hours: 6.5,
      Experience: 3.9,
      Difficulty: 2.5,
      Score: 69,
    },
    {
      Hours: 7,
      Experience: 4.1,
      Difficulty: 2.3,
      Score: 75,
    },
    {
      Hours: 7.5,
      Experience: 4.3,
      Difficulty: 2.2,
      Score: 78,
    },
    {
      Hours: 8,
      Experience: 4.5,
      Difficulty: 2,
      Score: 83,
    },
    {
      Hours: 8.5,
      Experience: 4.6,
      Difficulty: 1.9,
      Score: 85,
    },
    {
      Hours: 9,
      Experience: 4.8,
      Difficulty: 1.7,
      Score: 90,
    },
    {
      Hours: 9.5,
      Experience: 4.9,
      Difficulty: 1.6,
      Score: 92,
    },
    {
      Hours: 10,
      Experience: 5,
      Difficulty: 1.4,
      Score: 96,
    },

    /*
     * Slight deviations intentionally
     * included so epsilon/support-vector
     * visualization is visible.
     */
    {
      Hours: 3.8,
      Experience: 1.8,
      Difficulty: 4.2,
      Score: 34,
    },
    {
      Hours: 6.2,
      Experience: 2.9,
      Difficulty: 3.4,
      Score: 59,
    },
    {
      Hours: 8.2,
      Experience: 3.6,
      Difficulty: 2.8,
      Score: 76,
    },
  ];

/*
 * =========================================================
 * BUILT-IN DATASETS
 * =========================================================
 */

export const builtInDatasets:
  BuiltInDataset[] = [
    {
      id: "svm-showcase",
      name: "ModelMind SVM Showcase",
      description:
        "Default nonlinear three-feature dataset designed to demonstrate the complete SVC learning journey, including margins, support vectors, C, kernels, gamma, transformations, 2D, 3D and prediction.",
      task: "classification",
      rows:
        showcaseClassificationRows,
    },

    {
      id: "linear-classification",
      name: "Linear Classification",
      description:
        "Two clearly separated classes for learning linear SVM, margins and support vectors.",
      task: "classification",
      rows:
        linearClassificationRows,
    },

    {
      id: "xor-classification",
      name: "XOR Nonlinear",
      description:
        "A nonlinear classification problem useful for comparing Linear, Polynomial and RBF kernels.",
      task: "classification",
      rows:
        xorClassificationRows,
    },

    {
      id: "circle-classification",
      name: "Circular Classes",
      description:
        "Inner and outer classes designed to demonstrate nonlinear kernel boundaries.",
      task: "classification",
      rows:
        circleClassificationRows,
    },

    {
      id: "svr-regression",
      name: "ModelMind SVR Showcase",
      description:
        "Three-feature continuous-target dataset for regression surfaces, epsilon tubes, support vectors, C, kernels and prediction.",
      task: "regression",
      rows:
        regressionRows,
    },
  ];