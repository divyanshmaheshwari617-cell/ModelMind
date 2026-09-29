import {
  LearningLevel,
} from "../types/logisticRegression";

interface Props {
  learningLevel:
    LearningLevel;

  onLearningLevelChange: (
    value: LearningLevel
  ) => void;

  learningRate: number;

  onLearningRateChange: (
    value: number
  ) => void;

  iterations: number;

  onIterationsChange: (
    value: number
  ) => void;

  trainRatio: number;

  onTrainRatioChange: (
    value: number
  ) => void;

  regularizationStrength:
    number;

  onRegularizationStrengthChange: (
    value: number
  ) => void;
}

export default function LogisticControls({
  learningLevel,
  onLearningLevelChange,
  learningRate,
  onLearningRateChange,
  iterations,
  onIterationsChange,
  trainRatio,
  onTrainRatioChange,
  regularizationStrength,
  onRegularizationStrengthChange,
}: Props) {
  return (
    <section className="panel">
      <span className="eyebrow">
        MODEL CONTROLS
      </span>

      <h2>
        Train Logistic Regression
      </h2>

      <div className="sub-panel">
        <h3>
          Learning depth
        </h3>

        <div className="feature-chip-row">
          {(
            [
              "basic",
              "medium",
              "advanced",
            ] as LearningLevel[]
          ).map((level) => (
            <button
              type="button"
              key={level}
              className={
                learningLevel ===
                level
                  ? "target-chip"
                  : "feature-chip"
              }
              onClick={() =>
                onLearningLevelChange(
                  level
                )
              }
            >
              {level
                .charAt(0)
                .toUpperCase() +
                level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="control-grid">
        <label className="control-card">
          <span>
            Learning rate
          </span>

          <strong>
            {learningRate.toFixed(
              3
            )}
          </strong>

          <input
            type="range"
            min={0.005}
            max={0.3}
            step={0.005}
            value={learningRate}
            onChange={(event) =>
              onLearningRateChange(
                Number(
                  event.target
                    .value
                )
              )
            }
          />

          <small>
            Controls how large each
            gradient-descent update
            is.
          </small>
        </label>

        <label className="control-card">
          <span>
            Training iterations
          </span>

          <strong>
            {iterations}
          </strong>

          <input
            type="range"
            min={50}
            max={1000}
            step={25}
            value={iterations}
            onChange={(event) =>
              onIterationsChange(
                Number(
                  event.target
                    .value
                )
              )
            }
          />

          <small>
            Number of optimization
            steps.
          </small>
        </label>

        <label className="control-card">
          <span>
            Train split
          </span>

          <strong>
            {(
              trainRatio * 100
            ).toFixed(0)}
            %
          </strong>

          <input
            type="range"
            min={0.5}
            max={0.9}
            step={0.05}
            value={trainRatio}
            onChange={(event) =>
              onTrainRatioChange(
                Number(
                  event.target
                    .value
                )
              )
            }
          />

          <small>
            Remaining rows become
            test data.
          </small>
        </label>

        <label className="control-card">
          <span>
            L2 regularization
          </span>

          <strong>
            {regularizationStrength.toFixed(
              3
            )}
          </strong>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={
              regularizationStrength
            }
            onChange={(event) =>
              onRegularizationStrengthChange(
                Number(
                  event.target
                    .value
                )
              )
            }
          />

          <small>
            Penalizes large
            coefficients. 0 means no
            regularization.
          </small>
        </label>
      </div>
    </section>
  );
}