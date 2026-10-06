import {
  useMemo,
  useState,
} from "react";

import LogisticDatasetAnalyzer from "./dataset/LogisticDatasetAnalyzer";
import LogisticControls from "./controls/LogisticControls";
import SigmoidVisualizer from "./sigmoid/SigmoidVisualizer";
import TrainingSummary from "./training/TrainingSummary";

import ThresholdExplorer from "./threshold/ThresholdExplorer";
import ROCLossVisualizer from "./roc/ROCLossVisualizer";
import DecisionBoundaryVisualizer from "./decision-boundary/DecisionBoundaryVisualizer";
import TrainingAnimation from "./training/TrainingAnimation";
import PredictionAndCoefficients from "./prediction/PredictionAndCoefficients";
import LogisticLearningDashboard from "./explanations/LogisticLearningDashboard";

import {
  LearningLevel,
  NumericRow,
} from "./types/logisticRegression";

import {
  splitDataset,
  trainLogisticRegression,
} from "./utils/logisticMath";

const INITIAL_ROWS: NumericRow[] = [
  {
    age: 22,
    study_hours: 1.2,
    attendance: 52,
    passed: 0,
  },
  {
    age: 21,
    study_hours: 1.8,
    attendance: 58,
    passed: 0,
  },
  {
    age: 23,
    study_hours: 2.1,
    attendance: 61,
    passed: 0,
  },
  {
    age: 20,
    study_hours: 2.4,
    attendance: 64,
    passed: 0,
  },
  {
    age: 24,
    study_hours: 2.8,
    attendance: 67,
    passed: 0,
  },
  {
    age: 22,
    study_hours: 3.0,
    attendance: 69,
    passed: 0,
  },
  {
    age: 25,
    study_hours: 3.3,
    attendance: 70,
    passed: 0,
  },
  {
    age: 21,
    study_hours: 3.5,
    attendance: 72,
    passed: 0,
  },
  {
    age: 23,
    study_hours: 3.7,
    attendance: 73,
    passed: 0,
  },
  {
    age: 24,
    study_hours: 4.0,
    attendance: 74,
    passed: 0,
  },
  {
    age: 20,
    study_hours: 4.2,
    attendance: 76,
    passed: 1,
  },
  {
    age: 22,
    study_hours: 4.5,
    attendance: 78,
    passed: 1,
  },
  {
    age: 21,
    study_hours: 4.8,
    attendance: 80,
    passed: 1,
  },
  {
    age: 25,
    study_hours: 5.0,
    attendance: 81,
    passed: 1,
  },
  {
    age: 23,
    study_hours: 5.2,
    attendance: 83,
    passed: 1,
  },
  {
    age: 24,
    study_hours: 5.5,
    attendance: 84,
    passed: 1,
  },
  {
    age: 22,
    study_hours: 5.8,
    attendance: 86,
    passed: 1,
  },
  {
    age: 20,
    study_hours: 6.0,
    attendance: 88,
    passed: 1,
  },
  {
    age: 25,
    study_hours: 6.4,
    attendance: 90,
    passed: 1,
  },
  {
    age: 23,
    study_hours: 6.8,
    attendance: 92,
    passed: 1,
  },
  {
    age: 21,
    study_hours: 7.1,
    attendance: 93,
    passed: 1,
  },
  {
    age: 24,
    study_hours: 7.5,
    attendance: 95,
    passed: 1,
  },
  {
    age: 22,
    study_hours: 7.8,
    attendance: 96,
    passed: 1,
  },
  {
    age: 25,
    study_hours: 8.1,
    attendance: 97,
    passed: 1,
  },
];

export default function LogisticRegressionVisualizer() {
  const [rows, setRows] =
    useState<NumericRow[]>(
      INITIAL_ROWS
    );

  const [features, setFeatures] =
    useState<string[]>([
      "study_hours",
      "attendance",
    ]);

  const [target, setTarget] =
    useState("passed");

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
  ] = useState(0.08);

  const [
    iterations,
    setIterations,
  ] = useState(350);

  const [
    trainRatio,
    setTrainRatio,
  ] = useState(0.8);

  const [
    regularizationStrength,
    setRegularizationStrength,
  ] = useState(0);

  const [
    threshold,
    setThreshold,
  ] = useState(0.5);

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
          trainLogisticRegression(
            split.trainRows,
            split.testRows,
            features,
            target,
            {
              learningRate,
              iterations,
              threshold: 0.5,
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
              : "Unable to train Logistic Regression.",
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
    nextRows: NumericRow[],
    nextFeatures: string[],
    nextTarget: string
  ) {
    setRows(nextRows);
    setFeatures(nextFeatures);
    setTarget(nextTarget);
    setThreshold(0.5);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">
            MODELMIND VISUAL ML LAB
          </span>

          <h1>
            Logistic Regression
          </h1>

          <p>
            See how Logistic
            Regression learns to
            separate two classes,
            converts scores into
            probabilities, and turns
            those probabilities into
            classification decisions.
          </p>
        </div>

        <div className="hero-badge">
          Classification
        </div>
      </header>

      <div className="learning-path">
        <span>Dataset</span>
        <b>→</b>

        <span>
          Standardization
        </span>
        <b>→</b>

        <span>
          Linear Score
        </span>
        <b>→</b>

        <span>Sigmoid</span>
        <b>→</b>

        <span>
          Probability
        </span>
        <b>→</b>

        <span>
          Decision Plane
        </span>
        <b>→</b>

        <span>
          Threshold
        </span>
        <b>→</b>

        <span>Class</span>
        <b>→</b>

        <span>Metrics</span>
      </div>

      <LogisticDatasetAnalyzer
        onUseDataset={
          useDataset
        }
      />

      <LogisticControls
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

      <SigmoidVisualizer />

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
            model={
              training.model
            }
            trainRows={
              split.trainRows.length
            }
            testRows={
              split.testRows.length
            }
          />

          <DecisionBoundaryVisualizer
            model={
              training.model
            }
            rows={rows}
            history={
              training.history
            }
            threshold={
              threshold
            }
          />

          <TrainingAnimation
            history={
              training.history
            }
          />

          <ThresholdExplorer
            predictions={
              training.model
                .testPredictions
            }
            threshold={
              threshold
            }
            onThresholdChange={
              setThreshold
            }
          />

          <ROCLossVisualizer
            predictions={
              training.model
                .testPredictions
            }
          />

          <PredictionAndCoefficients
            model={
              training.model
            }
            threshold={
              threshold
            }
          />

          <LogisticLearningDashboard
            model={
              training.model
            }
            learningLevel={
              learningLevel
            }
          />
        </>
      )}
    </main>
  );
}