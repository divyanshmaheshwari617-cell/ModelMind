import type {
  LearningLevel,
} from "../types/multiclassLogisticRegression";

interface Props {
  learningLevel: LearningLevel;
  onLearningLevelChange:
    (value: LearningLevel) => void;

  learningRate: number;
  onLearningRateChange:
    (value: number) => void;

  iterations: number;
  onIterationsChange:
    (value: number) => void;

  trainRatio: number;
  onTrainRatioChange:
    (value: number) => void;

  regularizationStrength: number;
  onRegularizationStrengthChange:
    (value: number) => void;
}

export default function MulticlassControls({
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
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            TRAINING CONTROLS
          </span>

          <h2>
            Configure Multinomial Logistic Regression
          </h2>
        </div>

        <span className="value-pill">
          Softmax
        </span>
      </div>

      <div className="control-grid">
        <label className="control-card">
          <span>Learning depth</span>

          <select
            value={learningLevel}
            onChange={(event) =>
              onLearningLevelChange(
                event.target.value as LearningLevel
              )
            }
          >
            <option value="basic">
              Basic
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="advanced">
              Advanced
            </option>
          </select>

          <small>
            Controls how deeply concepts are explained.
          </small>
        </label>

        <label className="control-card">
          <span>Learning rate</span>

          <strong>
            {learningRate.toFixed(3)}
          </strong>

          <input
            type="range"
            min={0.005}
            max={0.3}
            step={0.005}
            value={learningRate}
            onChange={(event) =>
              onLearningRateChange(
                Number(event.target.value)
              )
            }
          />

          <small>
            Controls the size of each gradient-descent update.
          </small>
        </label>

        <label className="control-card">
          <span>Iterations</span>

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
                Number(event.target.value)
              )
            }
          />

          <small>
            Number of optimization steps.
          </small>
        </label>

        <label className="control-card">
          <span>Training data</span>

          <strong>
            {(trainRatio * 100).toFixed(0)}%
          </strong>

          <input
            type="range"
            min={0.6}
            max={0.9}
            step={0.05}
            value={trainRatio}
            onChange={(event) =>
              onTrainRatioChange(
                Number(event.target.value)
              )
            }
          />

          <small>
            Remaining samples are used for testing.
          </small>
        </label>

        <label className="control-card">
          <span>L2 regularization λ</span>

          <strong>
            {regularizationStrength.toFixed(3)}
          </strong>

          <input
            type="range"
            min={0}
            max={0.5}
            step={0.005}
            value={regularizationStrength}
            onChange={(event) =>
              onRegularizationStrengthChange(
                Number(event.target.value)
              )
            }
          />

          <small>
            Penalizes very large coefficients.
          </small>
        </label>
      </div>
    </section>
  );
}