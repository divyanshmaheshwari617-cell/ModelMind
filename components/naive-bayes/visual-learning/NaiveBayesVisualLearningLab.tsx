import {
  useEffect,
  useState,
} from "react";

import ProbabilityVisualizer from "../probability/ProbabilityVisualizer";
import BayesTheoremVisualizer from "../probability/BayesTheoremVisualizer";
import PosteriorCalculator from "../probability/PosteriorCalculator";

import NBPlaybackControls from "./NBPlaybackControls";
import NBStepExplanation from "./NBStepExplanation";

import {
  naiveBayesLearningSteps,
} from "./learningSteps";

import {
  gaussianStudentDataset,
} from "./defaultDatasets";

export default function NaiveBayesVisualLearningLab() {
  const [currentStep, setCurrentStep] =
    useState(1);

  const [playing, setPlaying] =
    useState(false);

  const totalSteps =
    naiveBayesLearningSteps.length;

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setCurrentStep(
            (previous) => {
              if (
                previous >=
                totalSteps
              ) {
                setPlaying(
                  false
                );

                return previous;
              }

              return (
                previous + 1
              );
            }
          );
        },
        3500
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    playing,
    totalSteps,
  ]);

  const step =
    naiveBayesLearningSteps[
      currentStep - 1
    ];

  const dataset =
    gaussianStudentDataset;

  function previous() {
    setPlaying(false);

    setCurrentStep(
      (stepNumber) =>
        Math.max(
          1,
          stepNumber - 1
        )
    );
  }

  function next() {
    setPlaying(false);

    setCurrentStep(
      (stepNumber) =>
        Math.min(
          totalSteps,
          stepNumber + 1
        )
    );
  }

  function reset() {
    setPlaying(false);
    setCurrentStep(1);
  }

  return (
    <section style={pageStyle}>
      <div style={heroStyle}>
        <div style={eyebrowStyle}>
          MODEL MIND • VISUAL LEARNING
        </div>

        <h1 style={titleStyle}>
          Learn Naive Bayes Step by Step
        </h1>

        <p style={subtitleStyle}>
          Follow one meaningful student example from
          raw observations all the way to a Naive
          Bayes prediction. No hidden probability
          jumps.
        </p>

        <div style={storyStyle}>
          <span>📚 Student data</span>
          <span>→</span>
          <span>🎲 Probability</span>
          <span>→</span>
          <span>🧠 Bayes</span>
          <span>→</span>
          <span>🔮 Prediction</span>
        </div>
      </div>

      <NBPlaybackControls
        currentStep={currentStep}
        totalSteps={totalSteps}
        playing={playing}
        onPrevious={previous}
        onNext={next}
        onTogglePlay={() => {
          if (
            currentStep ===
              totalSteps &&
            !playing
          ) {
            setCurrentStep(1);
          }

          setPlaying(
            (value) =>
              !value
          );
        }}
        onReset={reset}
        onSelectStep={(
          selectedStep
        ) => {
          setPlaying(false);

          setCurrentStep(
            selectedStep
          );
        }}
      />

      <NBStepExplanation
        step={step}
      />

      <DataStory
        step={currentStep}
      />

      <ProbabilityVisualizer
        rows={dataset.rows}
        step={currentStep}
      />

      <BayesTheoremVisualizer
        step={currentStep}
      />

      <PosteriorCalculator
        rows={dataset.rows}
        features={
          dataset.features
        }
        step={currentStep}
      />
    </section>
  );
}

function DataStory({
  step,
}: {
  step: number;
}) {
  const dataset =
    gaussianStudentDataset;

  if (step > 3) {
    return null;
  }

  return (
    <section style={dataCardStyle}>
      <div style={eyebrowStyle}>
        DEFAULT LEARNING DATASET
      </div>

      <h3 style={{ margin: "5px 0 8px" }}>
        Each row represents one student
      </h3>

      <p style={smallTextStyle}>
        We use a simple student-performance example
        first so every probability has a real
        meaning.
      </p>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>
                Student
              </th>

              {dataset.features.map(
                (feature) => (
                  <th
                    key={feature}
                    style={cellStyle}
                  >
                    {feature}
                  </th>
                )
              )}

              <th style={targetCellStyle}>
                Result
              </th>
            </tr>
          </thead>

          <tbody>
            {dataset.rows.map(
              (row) => (
                <tr key={row.id}>
                  <td style={cellStyle}>
                    Student {row.id}
                  </td>

                  {dataset.features.map(
                    (feature) => (
                      <td
                        key={feature}
                        style={cellStyle}
                      >
                        {String(
                          row.features[
                            feature
                          ]
                        )}
                      </td>
                    )
                  )}

                  <td style={targetCellStyle}>
                    {row.target}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const pageStyle = {
  display: "grid",
  gap: 14,
};

const heroStyle = {
  padding: 22,
  borderRadius: 20,
  background:
    "linear-gradient(135deg, #111827, #1e1b4b)",
  border: "1px solid #4c1d95",
};

const eyebrowStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const titleStyle = {
  margin: "6px 0 8px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  maxWidth: 760,
  lineHeight: 1.7,
};

const storyStyle = {
  display: "flex",
  gap: 9,
  flexWrap: "wrap" as const,
  marginTop: 14,
  color: "#e2e8f0",
  fontWeight: 700,
};

const dataCardStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const smallTextStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const tableWrapperStyle = {
  overflowX: "auto" as const,
  marginTop: 12,
};

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse" as const,
  minWidth: 650,
};

const cellStyle = {
  padding: 9,
  borderBottom:
    "1px solid #1e293b",
  textAlign: "left" as const,
  color: "#cbd5e1",
  fontSize: 13,
};

const targetCellStyle = {
  ...cellStyle,
  color: "#c4b5fd",
  fontWeight: 800,
};