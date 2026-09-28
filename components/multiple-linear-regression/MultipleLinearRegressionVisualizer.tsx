import { useMemo, useState } from "react";

import MultipleLinearRegressionDatasetAnalyzer from "./MultipleLinearRegressionDatasetAnalyzer";

import MultipleRegressionLearningGuide from "./explanations/MultipleRegressionLearningGuide";
import EquationExplanation from "./explanations/EquationExplanation";
import CoefficientExplanation from "./explanations/CoefficientExplanation";
import MulticollinearityExplanation from "./explanations/MulticollinearityExplanation";
import AssumptionsExplanation from "./explanations/AssumptionsExplanation";
import NewValuePredictor from "./explanations/NewValuePredictor";

import RegressionPlane3D from "./graphs/RegressionPlane3D";
import ActualVsPredictedGraph from "./graphs/ActualVsPredictedGraph";
import ResidualPlot from "./graphs/ResidualPlot";
import CoefficientComparison from "./graphs/CoefficientComparison";
import FeatureContributionGraph from "./graphs/FeatureContributionGraph";

import RegressionMetrics from "./metrics/RegressionMetrics";
import CoefficientControls from "./controls/CoefficientControls";

import type { NumericRow } from "./types/dataset";

import {
  trainMultipleLinearRegression,
} from "./utils/regressionMath";

/*
|--------------------------------------------------------------------------
| Built-in educational dataset
|--------------------------------------------------------------------------
|
| Target:
| house_price
|
| Features:
| area
| bedrooms
| age
|
*/

const DEMO_DATA: NumericRow[] = [
  { area: 850, bedrooms: 2, age: 18, house_price: 128 },
  { area: 920, bedrooms: 2, age: 14, house_price: 142 },
  { area: 1050, bedrooms: 3, age: 16, house_price: 158 },
  { area: 1150, bedrooms: 3, age: 11, house_price: 176 },
  { area: 1250, bedrooms: 3, age: 9, house_price: 191 },
  { area: 1350, bedrooms: 3, age: 7, house_price: 207 },
  { area: 1450, bedrooms: 4, age: 12, house_price: 218 },
  { area: 1550, bedrooms: 3, age: 5, house_price: 234 },
  { area: 1650, bedrooms: 4, age: 8, house_price: 249 },
  { area: 1750, bedrooms: 4, age: 4, house_price: 267 },
  { area: 1900, bedrooms: 4, age: 6, house_price: 286 },
  { area: 2050, bedrooms: 5, age: 3, house_price: 309 },
  { area: 2200, bedrooms: 4, age: 2, house_price: 326 },
  { area: 2350, bedrooms: 5, age: 5, house_price: 344 },
  { area: 2500, bedrooms: 5, age: 1, house_price: 371 },
];

const DEMO_FEATURES = [
  "area",
  "bedrooms",
  "age",
];

const DEMO_TARGET = "house_price";

interface ActiveDataset {
  rows: NumericRow[];
  featureNames: string[];
  targetName: string;
  source: "demo" | "uploaded";
}

export default function MultipleLinearRegressionVisualizer() {
  /*
  |--------------------------------------------------------------------------
  | Active dataset
  |--------------------------------------------------------------------------
  */

  const [activeDataset, setActiveDataset] =
    useState<ActiveDataset>({
      rows: DEMO_DATA,
      featureNames: DEMO_FEATURES,
      targetName: DEMO_TARGET,
      source: "demo",
    });

  /*
  |--------------------------------------------------------------------------
  | Train model
  |--------------------------------------------------------------------------
  */

  const trainingResult = useMemo(() => {
    try {
      const model =
        trainMultipleLinearRegression(
          activeDataset.rows,
          activeDataset.featureNames,
          activeDataset.targetName,
        );

      return {
        model,
        error: "",
      };
    } catch (error) {
      return {
        model: null,
        error:
          error instanceof Error
            ? error.message
            : "The regression model could not be trained.",
      };
    }
  }, [activeDataset]);

  const trainedModel =
    trainingResult.model;

  /*
  |--------------------------------------------------------------------------
  | Dataset switching
  |--------------------------------------------------------------------------
  */

  function useUploadedDataset(
    rows: NumericRow[],
    featureNames: string[],
    targetName: string,
  ) {
    setActiveDataset({
      rows,
      featureNames,
      targetName,
      source: "uploaded",
    });
  }

  function useDemoDataset() {
    setActiveDataset({
      rows: DEMO_DATA,
      featureNames: DEMO_FEATURES,
      targetName: DEMO_TARGET,
      source: "demo",
    });
  }

  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-7 lg:p-10">

        {/* ================================================================
            PAGE HEADER
        ================================================================= */}

        <header className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                ModelMind · Regression Lab
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Multiple Linear Regression
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-slate-400">
                Learn how several input
                features work together to
                predict one continuous
                target. Explore the
                equation, coefficients,
                predictions, residuals,
                feature contributions,
                multicollinearity and the
                geometry of the fitted
                regression model.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Core equation
              </p>

              <p className="mt-2 font-mono text-sm text-white sm:text-base">
                ŷ = b₀ + b₁x₁ + b₂x₂
                + ... + bₙxₙ
              </p>
            </div>
          </div>
        </header>

        {/* ================================================================
            STEP 1 — LEARN
        ================================================================= */}

        <MultipleRegressionLearningGuide />

        {/* ================================================================
            STEP 2 — DATASET + PREPROCESSING
        ================================================================= */}

        <MultipleLinearRegressionDatasetAnalyzer
          onUseDataset={
            useUploadedDataset
          }
        />

        {/* ================================================================
            ACTIVE TRAINING DATA
        ================================================================= */}

        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Active Training Data
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                {activeDataset.source ===
                "demo"
                  ? "Built-in house-price example"
                  : "Uploaded dataset"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This is the dataset
                currently being used to
                train and visualize the
                Multiple Linear Regression
                model.
              </p>
            </div>

            {activeDataset.source ===
              "uploaded" && (
              <button
                type="button"
                onClick={useDemoDataset}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Restore Demo Dataset
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DatasetMetric
              label="Samples"
              value={String(
                activeDataset.rows.length,
              )}
            />

            <DatasetMetric
              label="Features"
              value={String(
                activeDataset
                  .featureNames.length,
              )}
            />

            <DatasetMetric
              label="Target"
              value={
                activeDataset.targetName
              }
            />

            <DatasetMetric
              label="Source"
              value={
                activeDataset.source ===
                "demo"
                  ? "Demo"
                  : "CSV Upload"
              }
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected equation
            </p>

            <p className="mt-3 break-words font-mono text-sm leading-7 text-slate-200">
              {activeDataset.targetName}
              {" = b₀"}

              {activeDataset.featureNames.map(
                (feature, index) => (
                  <span key={feature}>
                    {" + "}
                    b{index + 1}(
                    {feature})
                  </span>
                ),
              )}
            </p>
          </div>
        </section>

        {/* ================================================================
            TRAINING ERROR
        ================================================================= */}

        {trainingResult.error && (
          <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-bold text-red-300">
              Model could not be trained
            </p>

            <p className="mt-2 text-sm leading-6 text-red-200/80">
              {trainingResult.error}
            </p>
          </section>
        )}

        {/* ================================================================
            TRAINED MODEL EXPERIENCE
        ================================================================= */}

        {trainedModel && (
          <>
            {/* ============================================================
                STEP 3 — UNDERSTAND THE EQUATION
            ============================================================= */}

            <EquationExplanation
              model={trainedModel}
            />

            {/* ============================================================
                STEP 4 — MODEL PERFORMANCE
            ============================================================= */}

            <RegressionMetrics
              model={trainedModel}
            />

            {/* ============================================================
                STEP 5 — 3D GEOMETRY
            ============================================================= */}

            <RegressionPlane3D
              rows={activeDataset.rows}
              model={trainedModel}
            />

            {/* ============================================================
                STEP 6 — ACTUAL VS PREDICTED
            ============================================================= */}

            <ActualVsPredictedGraph
              model={trainedModel}
            />

            {/* ============================================================
                STEP 7 — RESIDUAL DIAGNOSTICS
            ============================================================= */}

            <ResidualPlot
              model={trainedModel}
            />

            {/* ============================================================
                STEP 8 — COEFFICIENT MEANING
            ============================================================= */}

            <CoefficientExplanation
              model={trainedModel}
            />

            {/* ============================================================
                STEP 9 — COEFFICIENT COMPARISON
            ============================================================= */}

            <CoefficientComparison
              model={trainedModel}
            />

            {/* ============================================================
                STEP 10 — FEATURE CONTRIBUTIONS
            ============================================================= */}

            <FeatureContributionGraph
              rows={activeDataset.rows}
              model={trainedModel}
            />

            {/* ============================================================
                STEP 11 — MULTICOLLINEARITY
            ============================================================= */}

            <MulticollinearityExplanation
              rows={activeDataset.rows}
              model={trainedModel}
            />

            {/* ============================================================
                STEP 12 — ASSUMPTIONS
            ============================================================= */}

            <AssumptionsExplanation />

            {/* ============================================================
                STEP 13 — PREDICT NEW VALUES
            ============================================================= */}

            <NewValuePredictor
              key={`predictor-${activeDataset.source}-${activeDataset.targetName}-${activeDataset.featureNames.join("-")}`}
              model={trainedModel}
            />

            {/* ============================================================
                STEP 14 — COEFFICIENT PLAYGROUND
            ============================================================= */}

            <CoefficientControls
              key={`controls-${activeDataset.source}-${activeDataset.targetName}-${activeDataset.featureNames.join("-")}`}
              rows={activeDataset.rows}
              model={trainedModel}
            />

            {/* ============================================================
                COMPLETION
            ============================================================= */}

            <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
                Learning Flow Complete
              </p>

              <h2 className="mt-3 text-2xl font-black text-white">
                You have explored the
                complete Multiple Linear
                Regression pipeline.
              </h2>

              <p className="mt-3 max-w-4xl leading-7 text-slate-400">
                You started with the
                dataset, prepared the
                values, selected multiple
                predictors, trained the
                model, interpreted its
                coefficients, inspected
                errors and residuals,
                explored the regression
                geometry, investigated
                multicollinearity and used
                the fitted equation to
                make new predictions.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <CompletionItem text="Dataset & preprocessing" />
                <CompletionItem text="Model equation" />
                <CompletionItem text="Metrics & residuals" />
                <CompletionItem text="Coefficient interpretation" />
                <CompletionItem text="3D regression geometry" />
                <CompletionItem text="Feature contributions" />
                <CompletionItem text="Multicollinearity" />
                <CompletionItem text="New predictions" />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Small reusable UI components
|--------------------------------------------------------------------------
*/

function DatasetMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className="mt-2 truncate font-semibold text-slate-100"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function CompletionItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-black text-emerald-400">
        ✓
      </div>

      <span className="text-sm font-semibold text-slate-300">
        {text}
      </span>
    </div>
  );
}