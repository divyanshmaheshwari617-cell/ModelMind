import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import "./index.css";

import App from "./App";

import {
  SVMProvider,
} from "../components/svm/context/SVMContext";

createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <SVMProvider>
      <App />
    </SVMProvider>
  </StrictMode>
);