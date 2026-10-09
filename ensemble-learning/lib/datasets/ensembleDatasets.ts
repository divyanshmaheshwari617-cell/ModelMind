
export type EnsembleTask = "classification" | "regression";

export type DatasetRow = Record<string, number>;

export interface EnsembleDataset {
  id: string;
  name: string;
  description: string;
  task: EnsembleTask;
  features: string[];
  target: string;
  rows: DatasetRow[];
  source: "synthetic";
}

function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function gaussian(random: () => number): number {
  const u1 = Math.max(random(), 1e-12);
  const u2 = random();

  return (
    Math.sqrt(-2 * Math.log(u1)) *
    Math.cos(2 * Math.PI * u2)
  );
}

function round(value: number): number {
  return Number(value.toFixed(5));
}

function createDataset(
  id: string,
  name: string,
  description: string,
  task: EnsembleTask,
  rows: DatasetRow[],
  features: string[] = ["x1", "x2"],
  target = "target",
): EnsembleDataset {
  return {
    id,
    name,
    description,
    task,
    features,
    target,
    rows,
    source: "synthetic",
  };
}

// -----------------------------------------
// CLASSIFICATION DATASETS
// -----------------------------------------

function generateMoons(count: number, seed: number) {
  const random = createRandom(seed);
  const rows: DatasetRow[] = [];

  for (let i = 0; i < count; i++) {
    const label = i % 2;
    const angle = random() * Math.PI;

    const noiseX = gaussian(random) * 0.12;
    const noiseY = gaussian(random) * 0.12;

    const x1 =
      label === 0
        ? Math.cos(angle) + noiseX
        : 1 - Math.cos(angle) + noiseX;

    const x2 =
      label === 0
        ? Math.sin(angle) + noiseY
        : -Math.sin(angle) + 0.5 + noiseY;

    rows.push({
      x1: round(x1),
      x2: round(x2),
      target: label,
    });
  }

  return rows;
}

function generateCircles(count: number, seed: number) {
  const random = createRandom(seed);
  const rows: DatasetRow[] = [];

  for (let i = 0; i < count; i++) {
    const label = i % 2;

    const angle = random() * 2 * Math.PI;
    const baseRadius = label === 0 ? 0.8 : 2;

    const radius =
      baseRadius + gaussian(random) * 0.12;

    rows.push({
      x1: round(radius * Math.cos(angle)),
      x2: round(radius * Math.sin(angle)),
      target: label,
    });
  }

  return rows;
}

function generateClusters(count: number, seed: number) {
  const random = createRandom(seed);

  const centers = [
    [-2.2, -1.8],
    [2.2, -1.5],
    [0, 2.3],
  ];

  return Array.from({ length: count }, (_, index) => {
    const label = index % centers.length;
    const [cx, cy] = centers[label];

    return {
      x1: round(cx + gaussian(random) * 0.72),
      x2: round(cy + gaussian(random) * 0.72),
      target: label,
    };
  });
}

function generateXOR(count: number, seed: number) {
  const random = createRandom(seed);

  return Array.from({ length: count }, () => {
    const x1 = random() * 4 - 2;
    const x2 = random() * 4 - 2;

    let label = (x1 >= 0) !== (x2 >= 0) ? 1 : 0;

    // Introduce small amounts of label noise.
    if (random() < 0.03) {
      label = 1 - label;
    }

    return {
      x1: round(x1),
      x2: round(x2),
      target: label,
    };
  });
}

// -----------------------------------------
// REGRESSION DATASETS
// -----------------------------------------

function generateNonlinearRegression(
  count: number,
  seed: number,
) {
  const random = createRandom(seed);

  return Array.from({ length: count }, () => {
    const x1 = random() * 8 - 4;
    const x2 = random() * 8 - 4;

    const noise = gaussian(random) * 0.75;

    const target =
      1.2 * x1 * x1 +
      0.8 * x2 +
      1.5 * Math.sin(x2) +
      noise;

    return {
      x1: round(x1),
      x2: round(x2),
      target: round(target),
    };
  });
}

function generateHousingRegression(
  count: number,
  seed: number,
) {
  const random = createRandom(seed);

  return Array.from({ length: count }, () => {
    const area = 600 + random() * 2600;
    const bedrooms = 1 + Math.floor(random() * 6);

    const areaK = area / 1000;

    const noise = gaussian(random) * 12000;

    const salePrice =
      45000 +
      105000 * areaK +
      16000 * bedrooms +
      12000 * areaK * areaK +
      5000 * areaK * bedrooms +
      noise;

    return {
      Area: round(area),
      Bedrooms: bedrooms,
      SalePrice: round(salePrice),
    };
  });
}

function generateWaveRegression(
  count: number,
  seed: number,
) {
  const random = createRandom(seed);

  return Array.from({ length: count }, () => {
    const x1 = random() * 12 - 6;
    const x2 = random() * 12 - 6;

    const target =
      4 * Math.sin(x1) +
      2.5 * Math.cos(x2 * 0.75) +
      0.25 * x1 * x2 +
      gaussian(random) * 0.6;

    return {
      x1: round(x1),
      x2: round(x2),
      target: round(target),
    };
  });
}

// -----------------------------------------
// EXPORTED DATASETS
// -----------------------------------------

export const ensembleDatasets: EnsembleDataset[] = [
  createDataset(
    "moons",
    "Two Moons Classification",
    "Two interleaving curved classes. Useful for visualizing nonlinear decision boundaries.",
    "classification",
    generateMoons(240, 42),
  ),

  createDataset(
    "circles",
    "Concentric Circles",
    "Inner and outer circular classes. Demonstrates why nonlinear learners outperform simple linear boundaries.",
    "classification",
    generateCircles(240, 73),
  ),

  createDataset(
    "clusters",
    "Three-Class Classification",
    "Three numeric classes arranged in partially overlapping clusters. Useful for multiclass predictions and confusion matrices.",
    "classification",
    generateClusters(240, 101),
  ),

  createDataset(
    "xor",
    "XOR Classification",
    "A nonlinear quadrant pattern that requires interactions between input features.",
    "classification",
    generateXOR(260, 17),
  ),

  createDataset(
    "nonlinear-regression",
    "Nonlinear Regression",
    "A continuous target with quadratic, linear, and sinusoidal components.",
    "regression",
    generateNonlinearRegression(260, 85),
  ),

  createDataset(
    "housing-regression",
    "House Price Prediction",
    "Synthetic house prices generated from Area, Bedrooms, and nonlinear feature interactions.",
    "regression",
    generateHousingRegression(280, 2026),
    ["Area", "Bedrooms"],
    "SalePrice",
  ),

  createDataset(
    "wave-regression",
    "Complex Wave Regression",
    "A challenging continuous surface with sine waves, cosine waves, and interactions.",
    "regression",
    generateWaveRegression(300, 123),
  ),
];

export function getEnsembleDataset(
  id: string,
): EnsembleDataset | undefined {
  return ensembleDatasets.find(
    (dataset) => dataset.id === id,
  );
}

export function getDatasetsByTask(
  task: EnsembleTask,
): EnsembleDataset[] {
  return ensembleDatasets.filter(
    (dataset) => dataset.task === task,
  );
}
