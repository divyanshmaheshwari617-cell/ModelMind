import { useMemo, useState } from "react";

import RegularizationDatasetAnalyzer from "./dataset/RegularizationDatasetAnalyzer";

import RegularizationControls from "./controls/RegularizationControls";
import NewValuePredictor from "./controls/NewValuePredictor";

import OverfittingVisualizer from "./overfitting/OverfittingVisualizer";

import RegularizationMetrics from "./metrics/RegularizationMetrics";

import CoefficientShrinkageGraph from "./graphs/CoefficientShrinkageGraph";
import CoefficientPathGraph from "./graphs/CoefficientPathGraph";
import TrainTestErrorGraph from "./graphs/TrainTestErrorGraph";
import RegularizationPenaltyGraph from "./graphs/RegularizationPenaltyGraph";
import ModelComparisonGraph from "./graphs/ModelComparisonGraph";

import RegressionSurface3D from "./graphs/RegressionSurface3D";
import RegularizationLossSurface3D from "./graphs/RegularizationLossSurface3D";
import RegularizationTrainingAnimation from "./animation/RegularizationTrainingAnimation";

import ModelComparisonDashboard from "./comparison/ModelComparisonDashboard";

import RegularizationLearningGuide from "./explanations/RegularizationLearningGuide";
import L1L2Explanation from "./explanations/L1L2Explanation";
import BiasVarianceExplanation from "./explanations/BiasVarianceExplanation";
import L1L2Geometry from "./graphs/L1L2Geometry";

import FitComplexityVisualizer from "./overfitting/FitComplexityVisualizer";

import RegularizationMathWalkthrough from "./explanations/RegularizationMathWalkthrough";

import RegularizationAssumptions from "./explanations/RegularizationAssumptions";

import PreprocessingAdvisor from "./preprocessing/PreprocessingAdvisor";

import {
  LearningLevel,
  ModelType,
  NumericRow,
} from "./types/regularization";

import {
  generateCoefficientPath,
  splitDataset,
  trainRegularizedModel,
} from "./utils/regularizationMath";

const demoRows: NumericRow[] = [
  {
    area: 700,
    bedrooms: 1,
    age: 22,
    distance: 12,
    house_price: 98,
  },
  {
    area: 780,
    bedrooms: 2,
    age: 19,
    distance: 11,
    house_price: 111,
  },
  {
    area: 850,
    bedrooms: 2,
    age: 18,
    distance: 10,
    house_price: 128,
  },
  {
    area: 920,
    bedrooms: 2,
    age: 14,
    distance: 9,
    house_price: 142,
  },
  {
    area: 1000,
    bedrooms: 3,
    age: 17,
    distance: 10,
    house_price: 151,
  },
  {
    area: 1050,
    bedrooms: 3,
    age: 16,
    distance: 8,
    house_price: 158,
  },
  {
    area: 1150,
    bedrooms: 3,
    age: 11,
    distance: 8,
    house_price: 176,
  },
  {
    area: 1250,
    bedrooms: 3,
    age: 9,
    distance: 7,
    house_price: 191,
  },
  {
    area: 1350,
    bedrooms: 3,
    age: 7,
    distance: 7,
    house_price: 207,
  },
  {
    area: 1450,
    bedrooms: 4,
    age: 12,
    distance: 6,
    house_price: 218,
  },
  {
    area: 1550,
    bedrooms: 3,
    age: 5,
    distance: 6,
    house_price: 234,
  },
  {
    area: 1650,
    bedrooms: 4,
    age: 8,
    distance: 5,
    house_price: 249,
  },
  {
    area: 1750,
    bedrooms: 4,
    age: 4,
    distance: 5,
    house_price: 267,
  },
  {
    area: 1900,
    bedrooms: 4,
    age: 6,
    distance: 4,
    house_price: 286,
  },
  {
    area: 2050,
    bedrooms: 5,
    age: 3,
    distance: 4,
    house_price: 309,
  },
  {
    area: 2200,
    bedrooms: 4,
    age: 2,
    distance: 3,
    house_price: 326,
  },
  {
    area: 2350,
    bedrooms: 5,
    age: 5,
    distance: 3,
    house_price: 344,
  },
  {
    area: 2500,
    bedrooms: 5,
    age: 1,
    distance: 2,
    house_price: 371,
  },
  {
    area: 2650,
    bedrooms: 5,
    age: 2,
    distance: 2,
    house_price: 389,
  },
  {
    area: 2800,
    bedrooms: 6,
    age: 1,
    distance: 1,
    house_price: 414,
  },
];

const demoFeatures = [
  "area",
  "bedrooms",
  "age",
  "distance",
];

const demoTarget = "house_price";

function displayModelName(
  modelType: ModelType
): string {
  if (modelType === "linear") {
    return "OLS Linear Regression";
  }

  if (modelType === "ridge") {
    return "Ridge Regression";
  }

  if (modelType === "lasso") {
    return "Lasso Regression";
  }

  return "Elastic Net";
}

export default function RegularizationVisualizer() {
  const [rows, setRows] =
    useState<NumericRow[]>(demoRows);

  const [features, setFeatures] =
    useState<string[]>(demoFeatures);

  const [target, setTarget] =
    useState(demoTarget);

  const [modelType, setModelType] =
    useState<ModelType>("ridge");

  const [alpha, setAlpha] =
    useState(1);

  const [l1Ratio, setL1Ratio] =
    useState(0.5);

  const [trainRatio, setTrainRatio] =
    useState(0.8);

  const [
    learningLevel,
    setLearningLevel,
  ] =
    useState<LearningLevel>("basic");

  const split = useMemo(
    () =>
      splitDataset(
        rows,
        trainRatio
      ),
    [rows, trainRatio]
  );

  const models = useMemo(() => {
    try {
      const linear =
        trainRegularizedModel(
          split.trainRows,
          split.testRows,
          features,
          target,
          "linear",
          0,
          l1Ratio
        );

      const ridge =
        trainRegularizedModel(
          split.trainRows,
          split.testRows,
          features,
          target,
          "ridge",
          alpha,
          l1Ratio
        );

      const lasso =
        trainRegularizedModel(
          split.trainRows,
          split.testRows,
          features,
          target,
          "lasso",
          alpha,
          l1Ratio
        );

      const elasticNet =
        trainRegularizedModel(
          split.trainRows,
          split.testRows,
          features,
          target,
          "elastic-net",
          alpha,
          l1Ratio
        );

      return {
        linear,
        ridge,
        lasso,
        elasticNet,
        error: "",
      };
    } catch (error) {
      return {
        linear: null,
        ridge: null,
        lasso: null,
        elasticNet: null,

        error:
          error instanceof Error
            ? error.message
            : "Unable to train the models.",
      };
    }
  }, [
    split,
    features,
    target,
    alpha,
    l1Ratio,
  ]);

  const selectedModel =
    useMemo(() => {
      if (
        modelType === "linear"
      ) {
        return models.linear;
      }

      if (
        modelType === "ridge"
      ) {
        return models.ridge;
      }

      if (
        modelType === "lasso"
      ) {
        return models.lasso;
      }

      return models.elasticNet;
    }, [modelType, models]);

  const coefficientPath =
    useMemo(() => {
      if (
        modelType === "linear" ||
        split.trainRows.length ===
          0 ||
        features.length === 0
      ) {
        return [];
      }

      try {
        return generateCoefficientPath(
          split.trainRows,
          split.testRows,
          features,
          target,
          modelType,
          l1Ratio
        );
      } catch {
        return [];
      }
    }, [
      modelType,
      split,
      features,
      target,
      l1Ratio,
    ]);

  function useDataset(
    nextRows: NumericRow[],
    nextFeatures: string[],
    nextTarget: string
  ) {
    setRows(nextRows);
    setFeatures(nextFeatures);
    setTarget(nextTarget);
  }

  const allModels =
    models.linear &&
    models.ridge &&
    models.lasso &&
    models.elasticNet
      ? [
          models.linear,
          models.ridge,
          models.lasso,
          models.elasticNet,
        ]
      : [];

  return (
    <main className="app-shell">
      <RegularizationLearningGuide
        level={learningLevel}
      />

      <RegularizationDatasetAnalyzer
        demoRows={demoRows}
        demoFeatures={demoFeatures}
        demoTarget={demoTarget}
        onUseDataset={useDataset}
      />

      <RegularizationControls
        modelType={modelType}
        alpha={alpha}
        l1Ratio={l1Ratio}
        trainRatio={trainRatio}
        learningLevel={
          learningLevel
        }
        onModelTypeChange={
          setModelType
        }
        onAlphaChange={setAlpha}
        onL1RatioChange={
          setL1Ratio
        }
        onTrainRatioChange={
          setTrainRatio
        }
        onLearningLevelChange={
          setLearningLevel
        }
      />

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              ACTIVE EXPERIMENT
            </span>

            <h2>
              {displayModelName(
                modelType
              )}
            </h2>
          </div>

          <span className="value-pill">
            {rows.length} rows
          </span>
        </div>

        <div className="three-column-grid">
          <div className="mini-card">
            <span>Features</span>
            <strong>
              {features.length}
            </strong>
          </div>

          <div className="mini-card">
            <span>
              Training rows
            </span>

            <strong>
              {
                split.trainRows
                  .length
              }
            </strong>
          </div>

          <div className="mini-card">
            <span>Test rows</span>

            <strong>
              {
                split.testRows
                  .length
              }
            </strong>
          </div>
        </div>

        <div className="feature-chip-row">
          {features.map(
            (feature) => (
              <span
                className="feature-chip"
                key={feature}
              >
                {feature}
              </span>
            )
          )}

          <span className="target-chip">
            Target: {target}
          </span>
        </div>
      </section>

      {models.error && (
        <section className="panel">
          <div className="error-box">
            {models.error}
          </div>
        </section>
      )}

      {selectedModel &&
        models.linear &&
        models.ridge &&
        models.lasso &&
        models.elasticNet && (
          <>
            <OverfittingVisualizer
              linearModel={
                models.linear
              }
              selectedModel={
                selectedModel
              }
            />

            <RegularizationMetrics
  model={selectedModel}
/>
<PreprocessingAdvisor
  rows={split.trainRows}
  features={features}
/>

<FitComplexityVisualizer />

<RegularizationMathWalkthrough
  model={selectedModel}
/>

<RegularizationTrainingAnimation
  key={`training-animation-${modelType}-${target}-${features.join("-")}-${alpha}-${l1Ratio}`}
  trainRows={split.trainRows}
  model={selectedModel}
/>

<RegressionSurface3D
              key={`regression-${modelType}-${features.join("-")}`}
              rows={rows}
              model={selectedModel}
            />

            <RegularizationLossSurface3D
              key={`loss-${modelType}-${features.join("-")}`}
              trainRows={
                split.trainRows
              }
              model={selectedModel}
            />

            <CoefficientShrinkageGraph
              linearModel={
                models.linear
              }
              selectedModel={
                selectedModel
              }
            />

            {modelType !==
              "linear" &&
              coefficientPath.length >
                0 && (
                <CoefficientPathGraph
                  paths={
                    coefficientPath
                  }
                  features={
                    features
                  }
                />
              )}

            <RegularizationPenaltyGraph
              model={selectedModel}
            />

            <BiasVarianceExplanation
              model={selectedModel}
            />

            <L1L2Explanation />
            <L1L2Geometry
  model={selectedModel}
/>

<RegularizationAssumptions
  model={selectedModel}
/>

            <TrainTestErrorGraph
              models={allModels}
            />

            <ModelComparisonGraph
              linear={models.linear}
              ridge={models.ridge}
              lasso={models.lasso}
              elasticNet={
                models.elasticNet
              }
            />

            <ModelComparisonDashboard
              models={allModels}
            />

            <NewValuePredictor
              key={`${modelType}-${target}-${features.join("-")}`}
              model={selectedModel}
            />

            <section className="completion-panel">
              <span className="eyebrow">
                LEARNING CHECKPOINT
              </span>

              <h2>
                Follow the complete
                regularization story
              </h2>

              <div className="learning-flow">
                <span>
                  Overfitting
                </span>

                <strong>→</strong>

                <span>
                  Penalty
                </span>

                <strong>→</strong>

                <span>
                  3D Loss Surface
                </span>

                <strong>→</strong>

                <span>
                  Coefficient
                  Shrinkage
                </span>

                <strong>→</strong>

                <span>
                  Bias / Variance
                </span>

                <strong>→</strong>

                <span>
                  Generalization
                </span>
              </div>

              <p>
                Change α, switch
                between Ridge, Lasso
                and Elastic Net, rotate
                the 3D surfaces, and
                observe how
                regularization changes
                the coefficients and
                unseen test
                performance.
              </p>
            </section>
          </>
        )}
    </main>
  );
}