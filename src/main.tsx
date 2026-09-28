import React from "react";
import ReactDOM from "react-dom/client";

import MultipleLinearRegressionVisualizer from "../components/multiple-linear-regression/MultipleLinearRegressionVisualizer";

import "./preview.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MultipleLinearRegressionVisualizer />
  </React.StrictMode>,
);