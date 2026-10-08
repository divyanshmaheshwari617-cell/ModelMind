import type {
  SVMKernel,
} from "../types/svm";

export type KernelParameters = {
  gamma: number;
  degree: number;
  coef0: number;
};

export type KernelDefinition = {
  id: SVMKernel;

  name: string;

  shortName: string;

  description: string;

  formula: string;

  sklearnSupported: boolean;

  requiresGamma: boolean;

  requiresDegree: boolean;

  requiresCoef0: boolean;
};

export const kernelDefinitions:
  KernelDefinition[] = [
    {
      id: "linear",

      name: "Linear Kernel",

      shortName: "Linear",

      description:
        "Creates a linear decision boundary and is useful when classes are approximately linearly separable.",

      formula:
        "K(x, z) = x · z",

      sklearnSupported: true,

      requiresGamma: false,

      requiresDegree: false,

      requiresCoef0: false,
    },

    {
      id: "polynomial",

      name: "Polynomial Kernel",

      shortName: "Polynomial",

      description:
        "Models curved relationships using polynomial combinations of the original features.",

      formula:
        "K(x, z) = (gamma(x · z) + coef0)^degree",

      sklearnSupported: true,

      requiresGamma: true,

      requiresDegree: true,

      requiresCoef0: true,
    },

    {
      id: "rbf",

      name: "RBF / Gaussian Kernel",

      shortName: "RBF",

      description:
        "Creates flexible nonlinear boundaries based on the distance between observations.",

      formula:
        "K(x, z) = exp(-gamma ||x - z||²)",

      sklearnSupported: true,

      requiresGamma: true,

      requiresDegree: false,

      requiresCoef0: false,
    },

    {
      id: "sigmoid",

      name: "Sigmoid Kernel",

      shortName: "Sigmoid",

      description:
        "Uses a hyperbolic tangent transformation and behaves similarly to a neural activation function.",

      formula:
        "K(x, z) = tanh(gamma(x · z) + coef0)",

      sklearnSupported: true,

      requiresGamma: true,

      requiresDegree: false,

      requiresCoef0: true,
    },

    {
      id: "laplacian",

      name: "Laplacian Kernel",

      shortName: "Laplacian",

      description:
        "A distance-based custom kernel using exponential decay based on L1 distance.",

      formula:
        "K(x, z) = exp(-gamma ||x - z||₁)",

      sklearnSupported: false,

      requiresGamma: true,

      requiresDegree: false,

      requiresCoef0: false,
    },

    {
      id: "chi-square",

      name: "Chi-Square Kernel",

      shortName: "Chi-Square",

      description:
        "Useful for comparing non-negative histogram-like feature representations.",

      formula:
        "K(x, z) = exp(-gamma Σ((xᵢ-zᵢ)²/(xᵢ+zᵢ)))",

      sklearnSupported: false,

      requiresGamma: true,

      requiresDegree: false,

      requiresCoef0: false,
    },

    {
      id: "custom",

      name: "Custom Kernel Playground",

      shortName: "Custom",

      description:
        "Educational mode for experimenting with custom feature similarity and kernel transformations.",

      formula:
        "K(x, z) = custom(x, z)",

      sklearnSupported: false,

      requiresGamma: true,

      requiresDegree: true,

      requiresCoef0: true,
    },
  ];

export function dotProduct(
  a: number[],
  b: number[]
) {
  const length =
    Math.min(
      a.length,
      b.length
    );

  let total = 0;

  for (
    let i = 0;
    i < length;
    i += 1
  ) {
    total +=
      a[i] * b[i];
  }

  return total;
}

export function squaredDistance(
  a: number[],
  b: number[]
) {
  const length =
    Math.min(
      a.length,
      b.length
    );

  let total = 0;

  for (
    let i = 0;
    i < length;
    i += 1
  ) {
    const difference =
      a[i] - b[i];

    total +=
      difference *
      difference;
  }

  return total;
}

export function l1Distance(
  a: number[],
  b: number[]
) {
  const length =
    Math.min(
      a.length,
      b.length
    );

  let total = 0;

  for (
    let i = 0;
    i < length;
    i += 1
  ) {
    total += Math.abs(
      a[i] - b[i]
    );
  }

  return total;
}

function chiSquareDistance(
  a: number[],
  b: number[]
) {
  const length =
    Math.min(
      a.length,
      b.length
    );

  let total = 0;

  for (
    let i = 0;
    i < length;
    i += 1
  ) {
    const denominator =
      a[i] + b[i];

    if (
      Math.abs(denominator) <
      1e-12
    ) {
      continue;
    }

    const difference =
      a[i] - b[i];

    total +=
      (difference *
        difference) /
      denominator;
  }

  return total;
}

export function calculateKernel(
  kernel: SVMKernel,
  x: number[],
  z: number[],
  parameters: KernelParameters
) {
  const {
    gamma,
    degree,
    coef0,
  } = parameters;

  const dot =
    dotProduct(x, z);

  switch (kernel) {
    case "linear":
      return dot;

    case "polynomial":
      return Math.pow(
        gamma * dot +
          coef0,
        degree
      );

    case "rbf":
      return Math.exp(
        -gamma *
          squaredDistance(
            x,
            z
          )
      );

    case "sigmoid":
      return Math.tanh(
        gamma * dot +
          coef0
      );

    case "laplacian":
      return Math.exp(
        -gamma *
          l1Distance(
            x,
            z
          )
      );

    case "chi-square":
      return Math.exp(
        -gamma *
          chiSquareDistance(
            x,
            z
          )
      );

    case "custom":
      return (
        dot +
        gamma *
          squaredDistance(
            x,
            z
          ) +
        coef0
      );

    default:
      return dot;
  }
}

export function getKernelDefinition(
  kernel: SVMKernel
) {
  return (
    kernelDefinitions.find(
      (definition) =>
        definition.id ===
        kernel
    ) ??
    kernelDefinitions[0]
  );
}