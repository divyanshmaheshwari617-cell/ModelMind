import React from "react";
import ReactDOM from "react-dom/client";

import LogisticRegressionVisualizer from "../components/logistic-regression/LogisticRegressionVisualizer";

import "./preview.css";

ReactDOM.createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <React.StrictMode>
    <LogisticRegressionVisualizer />
  </React.StrictMode>
);