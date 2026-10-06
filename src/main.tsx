import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import "./preview.css";

import MulticlassLogisticRegressionVisualizer
  from "../components/multiclass-logistic-regression/MulticlassLogisticRegressionVisualizer";

createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <MulticlassLogisticRegressionVisualizer />
  </StrictMode>
);