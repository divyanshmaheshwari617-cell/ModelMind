import type {
  SVMLearningStep,
} from "./learningSteps";

type Props = {
  step: SVMLearningStep;
};

export default function SVMStepExplanation({
  step,
}: Props) {
  return (
    <aside className="step-explanation">
      <div className="step-number">
        STEP {step.id}
      </div>

      <h3>
        {step.title}
      </h3>

      <p>
        {step.description}
      </p>

      <div className="step-focus">
        <span>
          Current Focus
        </span>

        <strong>
          {step.focus.replace(
            "-",
            " "
          )}
        </strong>
      </div>
    </aside>
  );
}