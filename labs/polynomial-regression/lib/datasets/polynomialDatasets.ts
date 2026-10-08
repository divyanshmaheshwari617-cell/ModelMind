
export interface PolynomialDataPoint {
  x: number;
  y: number;
}

export interface BuiltinPolynomialDataset {
  id: string;
  name: string;
  description: string;

  // Existing 2D compatibility.
  points: PolynomialDataPoint[];

  // Optional multi-feature dataset support.
  // Existing single-feature datasets work unchanged.
  rows?: Record<string, number>[];
  features?: string[];
  target?: string;
}

function randomGenerator(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function generateDataset(
  count: number,
  minX: number,
  maxX: number,
  seed: number,
  equation: (x: number) => number,
  noise: number,
): PolynomialDataPoint[] {
  const random = randomGenerator(seed);

  return Array.from({ length: count }, (_, i) => {
    const x = minX + (i / (count - 1)) * (maxX - minX);
    const y = equation(x) + (random() - 0.5) * noise;

    return {
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
    };
  });
}

function generateHousingDataset(
  count: number,
  seed: number,
): Record<string, number>[] {
  const random = randomGenerator(seed);

  return Array.from({ length: count }, (_, i) => {
    const area =
      600 + (i / (count - 1)) * 2600 +
      (random() - 0.5) * 100;

    // Keep bedroom counts realistic while allowing
    // different bedroom counts at similar property sizes.
    const bedrooms = 1 + Math.floor(random() * 6);

    const normalizedArea = area / 1000;

    const salePrice =
      40000 +
      105000 * normalizedArea +
      18000 * bedrooms +
      14000 * normalizedArea ** 2 +
      6500 * normalizedArea * bedrooms -
      1200 * bedrooms ** 2 +
      (random() - 0.5) * 25000;

    return {
      Area: Number(area.toFixed(2)),
      Bedrooms: bedrooms,
      SalePrice: Number(salePrice.toFixed(2)),
    };
  });
}

function generateAgricultureDataset(
  count: number,
  seed: number,
): Record<string, number>[] {
  const random = randomGenerator(seed);

  return Array.from({ length: count }, (_, i) => {
    const temperature =
      12 + (i / (count - 1)) * 28 +
      (random() - 0.5) * 1.5;

    const humidity = 25 + random() * 65;

    const centeredTemperature = temperature - 26;
    const centeredHumidity = humidity - 65;

    const cropYield =
      9 -
      0.022 * centeredTemperature ** 2 -
      0.0012 * centeredHumidity ** 2 +
      0.0025 * centeredTemperature * centeredHumidity +
      (random() - 0.5) * 0.8;

    return {
      Temperature: Number(temperature.toFixed(2)),
      Humidity: Number(humidity.toFixed(2)),
      CropYield: Number(Math.max(0.2, cropYield).toFixed(4)),
    };
  });
}

function createMultiFeatureDataset(
  id: string,
  name: string,
  description: string,
  rows: Record<string, number>[],
  features: string[],
  target: string,
): BuiltinPolynomialDataset {
  const firstFeature = features[0];

  return {
    id,
    name,
    description,
    rows,
    features,
    target,

    // Preserve compatibility with the existing dataset
    // manager and 2D plotting code.
    points: rows.map((row) => ({
      x: row[firstFeature],
      y: row[target],
    })),
  };
}

export const polynomialDatasets: BuiltinPolynomialDataset[] = [
  {
    id: "quadratic",
    name: "Quadratic Growth",
    description:
      "Explore a second-degree relationship with moderate noise.",
    points: generateDataset(
      65,
      -5,
      5,
      42,
      (x) => 1.5 * x * x - 2 * x + 4,
      8,
    ),
  },
  {
    id: "cubic",
    name: "Cubic Relationship",
    description:
      "Observe how a third-degree polynomial captures changing curvature.",
    points: generateDataset(
      75,
      -4,
      4,
      73,
      (x) => 0.8 * x ** 3 - 2 * x ** 2 + 3 * x + 5,
      10,
    ),
  },
  {
    id: "nonlinear",
    name: "Complex Nonlinear Pattern",
    description:
      "Experiment with model complexity on a smooth nonlinear signal.",
    points: generateDataset(
      90,
      -6,
      6,
      101,
      (x) => 5 * Math.sin(x) + 0.35 * x * x,
      4,
    ),
  },
  {
    id: "overfitting",
    name: "Overfitting Challenge",
    description:
      "A small noisy dataset designed to demonstrate high-degree overfitting.",
    points: generateDataset(
      16,
      -3,
      3,
      19,
      (x) => 2 * x * x + x + 3,
      13,
    ),
  },

  // NEW: Genuine two-input polynomial regression datasets.

  createMultiFeatureDataset(
    "housing-3d",
    "House Price — 3D Polynomial Surface",
    "Explore how Area and Bedrooms jointly affect SalePrice using a nonlinear polynomial regression surface. Synthetic educational data.",
    generateHousingDataset(100, 2026),
    ["Area", "Bedrooms"],
    "SalePrice",
  ),

  createMultiFeatureDataset(
    "agriculture-3d",
    "Crop Yield — 3D Polynomial Surface",
    "Explore the nonlinear relationship between Temperature, Humidity, and CropYield. Synthetic educational data.",
    generateAgricultureDataset(110, 804),
    ["Temperature", "Humidity"],
    "CropYield",
  ),
];

export function getPolynomialDataset(id: string) {
  return polynomialDatasets.find(
    (dataset) => dataset.id === id,
  );
}
