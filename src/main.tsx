import React from "react";
import ReactDOM from "react-dom/client";

import NaiveBayesVisualLearningLab from "../components/naive-bayes/visual-learning/NaiveBayesVisualLearningLab";

import GaussianNBLab from "../components/naive-bayes/gaussian/GaussianNBLab";

import MultinomialNBLab from "../components/naive-bayes/multinomial/MultinomialNBLab";

import BernoulliNBLab from "../components/naive-bayes/bernoulli/BernoulliNBLab";

import CustomNaiveBayesLab from "../components/naive-bayes/custom-dataset/CustomNaiveBayesLab";

import NaiveBayesComparison from "../components/naive-bayes/comparison/NaiveBayesComparison";

import NaiveBayesLearningDashboard from "../components/naive-bayes/NaiveBayesLearningDashboard";

import {
  gaussianStudentDataset,
  multinomialEmailDataset,
  bernoulliEmailDataset,
} from "../components/naive-bayes/visual-learning/defaultDatasets";

import "./style.css";

function App() {
  return (
    <main className="modelmind-app">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="modelmind-header">
        <div>
          <div className="modelmind-brand">
            MODELMIND
          </div>

          <h1>
            Naive Bayes Visualization Lab
          </h1>

          <p>
            Learn Naive Bayes from probability fundamentals
            to Gaussian, Multinomial and Bernoulli models.
            Explore predictions visually, compare the three
            variants and test your own dataset.
          </p>
        </div>
      </header>

      {/* ========================================
          PART 1 — CORE LEARNING
      ======================================== */}

      <section className="modelmind-section">
        <NaiveBayesVisualLearningLab />
      </section>

      {/* ========================================
          PART 2 — GAUSSIAN
      ======================================== */}

      <section className="modelmind-divider">
        <div>
          GAUSSIAN NAIVE BAYES LAB
        </div>
      </section>

      <section className="modelmind-section">
        <GaussianNBLab
          rows={
            gaussianStudentDataset.rows
          }
          features={
            gaussianStudentDataset.features
          }
          targetName={
            gaussianStudentDataset.targetName
          }
        />
      </section>

      {/* ========================================
          PART 3 — MULTINOMIAL
      ======================================== */}

      <section className="modelmind-divider">
        <div>
          MULTINOMIAL NAIVE BAYES LAB
        </div>
      </section>

      <section className="modelmind-section">
        <MultinomialNBLab
          rows={
            multinomialEmailDataset.rows
          }
          features={
            multinomialEmailDataset.features
          }
          targetName={
            multinomialEmailDataset.targetName
          }
        />
      </section>

      {/* ========================================
          PART 4 — BERNOULLI
      ======================================== */}

      <section className="modelmind-divider">
        <div>
          BERNOULLI NAIVE BAYES LAB
        </div>
      </section>

      <section className="modelmind-section">
        <BernoulliNBLab
          rows={
            bernoulliEmailDataset.rows
          }
          features={
            bernoulliEmailDataset.features
          }
          targetName={
            bernoulliEmailDataset.targetName
          }
        />
      </section>

      {/* ========================================
          PART 5 — MODEL COMPARISON
      ======================================== */}

      <section className="modelmind-divider">
        <div>
          COMPARE NAIVE BAYES MODELS
        </div>
      </section>

      <section className="modelmind-section">
        <NaiveBayesComparison />
      </section>

      {/* ========================================
          PART 6 — CUSTOM DATASET
      ======================================== */}

      <section className="modelmind-divider">
        <div>
          TRY YOUR OWN DATASET
        </div>
      </section>

      <section className="modelmind-section">
        <CustomNaiveBayesLab />
      </section>

      {/* ========================================
          PART 7 — FINAL LEARNING DASHBOARD
      ======================================== */}

      <section className="modelmind-divider">
        <div>
          WHAT YOU LEARNED
        </div>
      </section>

      <section className="modelmind-section">
        <NaiveBayesLearningDashboard />
      </section>

    </main>
  );
}

ReactDOM.createRoot(
  document.getElementById("app")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);