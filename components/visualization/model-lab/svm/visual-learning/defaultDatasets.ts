import type {
  SVMRow,
} from "../types/svm";

export const defaultSVCVisualRows: SVMRow[] = [
  {
    id: 1,
    features: [1.0, 1.2],
    target: "Class A",
  },
  {
    id: 2,
    features: [1.4, 1.8],
    target: "Class A",
  },
  {
    id: 3,
    features: [1.8, 1.3],
    target: "Class A",
  },
  {
    id: 4,
    features: [2.0, 2.1],
    target: "Class A",
  },
  {
    id: 5,
    features: [2.3, 1.7],
    target: "Class A",
  },

  {
    id: 6,
    features: [4.1, 4.0],
    target: "Class B",
  },
  {
    id: 7,
    features: [4.6, 4.4],
    target: "Class B",
  },
  {
    id: 8,
    features: [5.0, 3.8],
    target: "Class B",
  },
  {
    id: 9,
    features: [4.2, 5.0],
    target: "Class B",
  },
  {
    id: 10,
    features: [5.2, 4.7],
    target: "Class B",
  },
];

export const defaultSVRVisualRows: SVMRow[] = [
  {
    id: 1,
    features: [1],
    target: 2.1,
  },
  {
    id: 2,
    features: [2],
    target: 3.0,
  },
  {
    id: 3,
    features: [3],
    target: 3.8,
  },
  {
    id: 4,
    features: [4],
    target: 5.2,
  },
  {
    id: 5,
    features: [5],
    target: 5.8,
  },
  {
    id: 6,
    features: [6],
    target: 7.1,
  },
  {
    id: 7,
    features: [7],
    target: 7.7,
  },
  {
    id: 8,
    features: [8],
    target: 9.0,
  },
  {
    id: 9,
    features: [9],
    target: 9.6,
  },
  {
    id: 10,
    features: [10],
    target: 11.0,
  },
];

export const defaultSVCFeatureNames = [
  "Feature 1",
  "Feature 2",
];

export const defaultSVRFeatureNames = [
  "Feature 1",
];