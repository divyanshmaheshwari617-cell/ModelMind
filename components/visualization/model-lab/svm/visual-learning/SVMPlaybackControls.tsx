type Props = {
  currentStep: number;

  totalSteps: number;

  playing: boolean;

  onPrevious: () => void;

  onNext: () => void;

  onTogglePlay: () => void;

  onReset: () => void;

  onSelectStep: (
    step: number
  ) => void;
};

export default function SVMPlaybackControls({
  currentStep,
  totalSteps,
  playing,
  onPrevious,
  onNext,
  onTogglePlay,
  onReset,
  onSelectStep,
}: Props) {
  return (
    <section style={containerStyle}>
      <div style={controlsStyle}>
        <button
          type="button"
          onClick={onPrevious}
          disabled={
            currentStep === 1
          }
          style={buttonStyle}
        >
          ◀ Previous
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          style={{
            ...buttonStyle,
            ...playButtonStyle,
          }}
        >
          {playing
            ? "❚❚ Pause"
            : "▶ Play"}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={
            currentStep ===
            totalSteps
          }
          style={buttonStyle}
        >
          Next ▶
        </button>

        <button
          type="button"
          onClick={onReset}
          style={buttonStyle}
        >
          ↻ Reset
        </button>
      </div>

      <div style={progressStyle}>
        {Array.from({
          length: totalSteps,
        }).map((_, index) => {
          const step =
            index + 1;

          return (
            <button
              key={step}
              type="button"
              onClick={() =>
                onSelectStep(
                  step
                )
              }
              aria-label={`Go to step ${step}`}
              style={{
                ...dotStyle,

                background:
                  step ===
                  currentStep
                    ? "#8b5cf6"
                    : step <
                        currentStep
                      ? "#475569"
                      : "#1e293b",

                transform:
                  step ===
                  currentStep
                    ? "scale(1.35)"
                    : "scale(1)",
              }}
            />
          );
        })}
      </div>

      <div style={stepStyle}>
        Step {currentStep} of{" "}
        {totalSteps}
      </div>
    </section>
  );
}

const containerStyle = {
  display: "grid",
  gap: 16,
  padding: 18,
  borderRadius: 16,
  background: "#0f172a",
  border:
    "1px solid #334155",
};

const controlsStyle = {
  display: "flex",
  justifyContent:
    "center",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 10,
};

const buttonStyle = {
  padding:
    "10px 16px",
  borderRadius: 10,
  border:
    "1px solid #334155",
  background: "#020617",
  color: "#e2e8f0",
  cursor: "pointer",
  fontWeight: 700,
};

const playButtonStyle = {
  minWidth: 120,
  background: "#6d28d9",
  border:
    "1px solid #8b5cf6",
};

const progressStyle = {
  display: "flex",
  justifyContent:
    "center",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 10,
};

const dotStyle = {
  width: 11,
  height: 11,
  borderRadius: "50%",
  border: "none",
  padding: 0,
  cursor: "pointer",
  transition:
    "all 0.2s ease",
};

const stepStyle = {
  textAlign:
    "center" as const,
  color: "#94a3b8",
  fontSize: 13,
  fontWeight: 700,
};