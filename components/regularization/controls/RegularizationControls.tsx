import {
  LearningLevel,
  ModelType,
} from "../types/regularization";

interface Props {
  modelType: ModelType;
  alpha: number;
  l1Ratio: number;
  trainRatio: number;
  learningLevel: LearningLevel;

  onModelTypeChange: (value: ModelType) => void;
  onAlphaChange: (value: number) => void;
  onL1RatioChange: (value: number) => void;
  onTrainRatioChange: (value: number) => void;
  onLearningLevelChange: (value: LearningLevel) => void;
}

const modelOptions: {
  value: ModelType;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "linear",
    title: "OLS",
    subtitle: "No regularization",
  },
  {
    value: "ridge",
    title: "Ridge",
    subtitle: "L2 penalty",
  },
  {
    value: "lasso",
    title: "Lasso",
    subtitle: "L1 penalty",
  },
  {
    value: "elastic-net",
    title: "Elastic Net",
    subtitle: "L1 + L2",
  },
];

export default function RegularizationControls({
  modelType,
  alpha,
  l1Ratio,
  trainRatio,
  learningLevel,
  onModelTypeChange,
  onAlphaChange,
  onL1RatioChange,
  onTrainRatioChange,
  onLearningLevelChange,
}: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">EXPERIMENT CONTROLS</span>
          <h2>Control the regularization experiment</h2>
        </div>
      </div>

      <h3>Learning depth</h3>

      <div className="button-row">
        {(["basic", "medium", "advanced"] as LearningLevel[]).map(
          (level) => (
            <button
              key={level}
              className={
                learningLevel === level
                  ? "choice-button active"
                  : "choice-button"
              }
              onClick={() => onLearningLevelChange(level)}
            >
              {level[0].toUpperCase() + level.slice(1)}
            </button>
          )
        )}
      </div>

      <h3>Model</h3>

      <div className="model-choice-grid">
        {modelOptions.map((option) => (
          <button
            key={option.value}
            className={
              modelType === option.value
                ? "model-choice active"
                : "model-choice"
            }
            onClick={() => onModelTypeChange(option.value)}
          >
            <strong>{option.title}</strong>
            <span>{option.subtitle}</span>
          </button>
        ))}
      </div>

      <div className="control-block">
        <div className="slider-heading">
          <div>
            <strong>α (regularization strength)</strong>
            <p>
              Larger α places more pressure on the coefficients.
            </p>
          </div>

          <span className="value-pill">{alpha.toFixed(2)}</span>
        </div>

        <input
          type="range"
          min="0"
          max="25"
          step="0.05"
          value={alpha}
          disabled={modelType === "linear"}
          onChange={(event) =>
            onAlphaChange(Number(event.target.value))
          }
        />

        <div className="range-labels">
          <span>0 — OLS-like</span>
          <span>25 — strong penalty</span>
        </div>
      </div>

      {modelType === "elastic-net" && (
        <div className="control-block">
          <div className="slider-heading">
            <div>
              <strong>Elastic Net L1 ratio</strong>
              <p>
                0 behaves more like Ridge; 1 behaves more like Lasso.
              </p>
            </div>

            <span className="value-pill">
              {l1Ratio.toFixed(2)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={l1Ratio}
            onChange={(event) =>
              onL1RatioChange(Number(event.target.value))
            }
          />

          <div className="range-labels">
            <span>More L2</span>
            <span>More L1</span>
          </div>
        </div>
      )}

      <div className="control-block">
        <div className="slider-heading">
          <div>
            <strong>Training data</strong>
            <p>
              Keep part of the dataset unseen so we can detect
              overfitting.
            </p>
          </div>

          <span className="value-pill">
            {(trainRatio * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0.5"
          max="0.9"
          step="0.05"
          value={trainRatio}
          onChange={(event) =>
            onTrainRatioChange(Number(event.target.value))
          }
        />

        <div className="range-labels">
          <span>50% train</span>
          <span>90% train</span>
        </div>
      </div>
    </section>
  );
}