import React from "react";
import ReactDOM from "react-dom/client";

import LinearRegressionLab from "../components/linear-regression/LinearRegressionLab";

import "./preview.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <LinearRegressionLab />
      </div>
    </main>
  </React.StrictMode>
);