import {
  useMemo,
  useState,
} from "react";

import MulticlassDatasetAnalyzer from "./dataset/MulticlassDatasetAnalyzer";
import MulticlassControls from "./controls/MulticlassControls";
import SoftmaxVisualizer from "./softmax/SoftmaxVisualizer";
import TrainingSummary from "./training/TrainingSummary";
import MulticlassMetricsVisualizer from "./metrics/MulticlassMetricsVisualizer";
import MulticlassROCVisualizer from "./roc/MulticlassROCVisualizer";
import MulticlassPredictionExplorer from "./prediction/MulticlassPredictionExplorer";
import MulticlassDecisionVisualizer from "./decision-boundary/MulticlassDecisionVisualizer";
import MulticlassTrainingAnimation from "./training/MulticlassTrainingAnimation";
import MulticlassCoefficientVisualizer from "./coefficients/MulticlassCoefficientVisualizer";
import MulticlassLearningDashboard from "./explanations/MulticlassLearningDashboard";

import type {
  LearningLevel,
  MulticlassRow,
} from "./types/multiclassLogisticRegression";

import type {
  RawDatasetRow,
} from "./preprocessing/preprocessingMath";

import {
  getClasses,
  splitDataset,
  trainMulticlassLogisticRegression,
} from "./utils/multiclassMath";

const DEMO_RAW_ROWS: RawDatasetRow[] = [
  {
    sepal_length: 5.1,
    sepal_width: 3.5,
    petal_length: 1.4,
    petal_width: 0.2,
    species: "Setosa",
  },
  {
    sepal_length: 4.9,
    sepal_width: 3.0,
    petal_length: 1.4,
    petal_width: 0.2,
    species: "Setosa",
  },
  {
    sepal_length: 5.0,
    sepal_width: 3.4,
    petal_length: 1.5,
    petal_width: 0.2,
    species: "Setosa",
  },
  {
    sepal_length: 5.4,
    sepal_width: 3.9,
    petal_length: 1.7,
    petal_width: 0.4,
    species: "Setosa",
  },
  {
    sepal_length: 4.6,
    sepal_width: 3.4,
    petal_length: 1.4,
    petal_width: 0.3,
    species: "Setosa",
  },
  {
    sepal_length: 5.2,
    sepal_width: 3.5,
    petal_length: 1.5,
    petal_width: 0.2,
    species: "Setosa",
  },

  {
    sepal_length: 7.0,
    sepal_width: 3.2,
    petal_length: 4.7,
    petal_width: 1.4,
    species: "Versicolor",
  },
  {
    sepal_length: 6.4,
    sepal_width: 3.2,
    petal_length: 4.5,
    petal_width: 1.5,
    species: "Versicolor",
  },
  {
    sepal_length: 6.9,
    sepal_width: 3.1,
    petal_length: 4.9,
    petal_width: 1.5,
    species: "Versicolor",
  },
  {
    sepal_length: 5.5,
    sepal_width: 2.3,
    petal_length: 4.0,
    petal_width: 1.3,
    species: "Versicolor",
  },
  {
    sepal_length: 6.5,
    sepal_width: 2.8,
    petal_length: 4.6,
    petal_width: 1.5,
    species: "Versicolor",
  },
  {
    sepal_length: 5.7,
    sepal_width: 2.8,
    petal_length: 4.5,
    petal_width: 1.3,
    species: "Versicolor",
  },

  {
    sepal_length: 6.3,
    sepal_width: 3.3,
    petal_length: 6.0,
    petal_width: 2.5,
    species: "Virginica",
  },
  {
    sepal_length: 5.8,
    sepal_width: 2.7,
    petal_length: 5.1,
    petal_width: 1.9,
    species: "Virginica",
  },
  {
    sepal_length: 7.1,
    sepal_width: 3.0,
    petal_length: 5.9,
    petal_width: 2.1,
    species: "Virginica",
  },
  {
    sepal_length: 6.3,
    sepal_width: 2.9,
    petal_length: 5.6,
    petal_width: 1.8,
    species: "Virginica",
  },
  {
    sepal_length: 6.5,
    sepal_width: 3.0,
    petal_length: 5.8,
    petal_width: 2.2,
    species: "Virginica",
  },
  {
    sepal_length: 7.6,
    sepal_width: 3.0,
    petal_length: 6.6,
    petal_width: 2.1,
    species: "Virginica",
  },
];

const INITIAL_ROWS: MulticlassRow[] =
  DEMO_RAW_ROWS.map((row) => ({
    features: {
      sepal_length:
        Number(row.sepal_length),

      sepal_width:
        Number(row.sepal_width),

      petal_length:
        Number(row.petal_length),

      petal_width:
        Number(row.petal_width),
    },

    target:
      String(row.species),
  }));

export default function MulticlassLogisticRegressionVisualizer() {
  const [
    rows,
    setRows,
  ] =
    useState<MulticlassRow[]>(
      INITIAL_ROWS
    );

  const [
    features,
    setFeatures,
  ] = useState<string[]>([
    "sepal_length",
    "sepal_width",
    "petal_length",
    "petal_width",
  ]);

  const [
    target,
    setTarget,
  ] =
    useState("species");

  const [
    learningLevel,
    setLearningLevel,
  ] =
    useState<LearningLevel>(
      "basic"
    );

  const [
    learningRate,
    setLearningRate,
  ] =
    useState(0.08);

  const [
    iterations,
    setIterations,
  ] =
    useState(400);

  const [
    trainRatio,
    setTrainRatio,
  ] =
    useState(0.75);

  const [
    regularizationStrength,
    setRegularizationStrength,
  ] =
    useState(0);

  const classes =
    useMemo(
      () =>
        getClasses(rows),
      [rows]
    );

  const split =
    useMemo(
      () =>
        splitDataset(
          rows,
          trainRatio
        ),
      [
        rows,
        trainRatio,
      ]
    );

  const training =
    useMemo(() => {
      try {
        const result =
          trainMulticlassLogisticRegression(
            split.trainRows,
            split.testRows,
            features,
            target,
            {
              learningRate,
              iterations,
              regularizationStrength,
            }
          );

        return {
          ...result,
          error: "",
        };
      } catch (error) {
        return {
          model: null,
          history: [],
          error:
            error instanceof Error
              ? error.message
              : "Unable to train the model.",
        };
      }
    }, [
      split,
      features,
      target,
      learningRate,
      iterations,
      regularizationStrength,
    ]);

  function useDataset(
    nextRows: MulticlassRow[],
    nextFeatures: string[],
    nextTarget: string
  ) {
    setRows(nextRows);
    setFeatures(
      nextFeatures
    );
    setTarget(
      nextTarget
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">
            MODELMIND VISUAL ML LAB
          </span>

          <h1>
            Multiclass Logistic
            Regression
          </h1>

          <p>
            See how a classifier
            creates one score for
            every class, converts
            those scores into
            probabilities with
            Softmax, and predicts
            the class with the
            highest probability.
          </p>
        </div>

        <div className="hero-badge">
          Softmax Classification
        </div>
      </header>

      <div className="learning-path">
        <span>Dataset</span>
        <b>→</b>

        <span>Features</span>
        <b>→</b>

        <span>
          Standardization
        </span>
        <b>→</b>

        <span>
          Class Logits
        </span>
        <b>→</b>

        <span>Softmax</span>
        <b>→</b>

        <span>
          Probabilities
        </span>
        <b>→</b>

        <span>Argmax</span>
        <b>→</b>

        <span>
          Predicted Class
        </span>
      </div>

      <MulticlassDatasetAnalyzer
        demoRows={
          DEMO_RAW_ROWS
        }
        onUseDataset={
          useDataset
        }
      />

      <MulticlassControls
        learningLevel={
          learningLevel
        }
        onLearningLevelChange={
          setLearningLevel
        }

        learningRate={
          learningRate
        }
        onLearningRateChange={
          setLearningRate
        }

        iterations={
          iterations
        }
        onIterationsChange={
          setIterations
        }

        trainRatio={
          trainRatio
        }
        onTrainRatioChange={
          setTrainRatio
        }

        regularizationStrength={
          regularizationStrength
        }
        onRegularizationStrengthChange={
          setRegularizationStrength
        }
      />

      <SoftmaxVisualizer
        classes={classes}
      />

      {training.error && (
        <section className="panel">
          <span className="eyebrow">
            MODEL STATUS
          </span>

          <h2>
            Training could not
            complete
          </h2>

          <div className="warning-box">
            {training.error}
          </div>
        </section>
      )}

      {training.model && (
        <>
          <TrainingSummary
  model={training.model}
  trainRows={split.trainRows.length}
  testRows={split.testRows.length}
/>

<MulticlassDecisionVisualizer
  rows={rows}
  features={features}
  classes={training.model.classes}
  scalers={training.model.scalers}
  history={training.history}
/>

<MulticlassTrainingAnimation
  model={training.model}
/>

<MulticlassCoefficientVisualizer
  model={training.model}
/>

<MulticlassMetricsVisualizer
  model={training.model}
/>

<MulticlassROCVisualizer
  model={training.model}
/>

<MulticlassPredictionExplorer
  model={training.model}
/>

<MulticlassLearningDashboard
  model={training.model}
  learningLevel={learningLevel}
/>

          <MulticlassMetricsVisualizer
            model={
              training.model
            }
          />

          <MulticlassROCVisualizer
            model={
              training.model
            }
          />

          <MulticlassPredictionExplorer
            model={
              training.model
            }
          />
        </>
      )}

      <section className="panel">
        <span className="eyebrow">
          LEARNING CHECKPOINT
        </span>

        <h2>
          What is happening?
        </h2>

        <div className="info-box">
          <strong>
            1. Linear scores:
          </strong>{" "}
          the model calculates one
          logit for every class.
          <br /><br />

          <strong>
            2. Softmax:
          </strong>{" "}
          all logits are converted
          into probabilities that
          sum to 1.
          <br /><br />

          <strong>
            3. Argmax:
          </strong>{" "}
          the class with the highest
          probability becomes the
          prediction.
          <br /><br />

          <strong>
            4. Cross-entropy:
          </strong>{" "}
          training penalizes the
          model when it gives low
          probability to the correct
          class.
        </div>
      </section>
    </main>
  );
}