import React from "react";
import ReactDOM from "react-dom/client";

import RegularizationVisualizer from "../components/regularization/RegularizationVisualizer";

import "./preview.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <RegularizationVisualizer />
  </React.StrictMode>
);