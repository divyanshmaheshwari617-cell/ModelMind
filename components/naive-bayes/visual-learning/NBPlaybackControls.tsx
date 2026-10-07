type Props = {
  currentStep: number;
  totalSteps: number;
  playing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSelectStep: (step: number) => void;
};

export default function NBPlaybackControls({
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
      <div style={buttonRowStyle}>
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentStep === 1}
          style={{
            ...secondaryButtonStyle,
            opacity: currentStep === 1 ? 0.45 : 1,
          }}
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          style={playButtonStyle}
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={currentStep === totalSteps}
          style={{
            ...secondaryButtonStyle,
            opacity:
              currentStep === totalSteps ? 0.45 : 1,
          }}
        >
          Next →
        </button>

        <button
          type="button"
          onClick={onReset}
          style={secondaryButtonStyle}
        >
          ↻ Reset
        </button>
      </div>

      <div style={stepsStyle}>
        {Array.from(
          { length: totalSteps },
          (_, index) => index + 1
        ).map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onSelectStep(step)}
            style={{
              ...stepButtonStyle,

              background:
                step === currentStep
                  ? "#8b5cf6"
                  : step < currentStep
                    ? "#312e81"
                    : "#020617",

              borderColor:
                step <= currentStep
                  ? "#8b5cf6"
                  : "#334155",
            }}
          >
            {step}
          </button>
        ))}
      </div>

      <div style={progressTextStyle}>
        Step {currentStep} of {totalSteps}
      </div>
    </section>
  );
}

const containerStyle = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#0f172a",
};

const buttonRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  justifyContent: "center",
};

const secondaryButtonStyle = {
  padding: "9px 13px",
  borderRadius: 9,
  border: "1px solid #475569",
  background: "#020617",
  color: "#e2e8f0",
  cursor: "pointer",
  fontWeight: 700,
};

const playButtonStyle = {
  ...secondaryButtonStyle,
  background: "#7c3aed",
  border: "1px solid #8b5cf6",
  color: "white",
};

const stepsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 7,
  flexWrap: "wrap" as const,
  marginTop: 13,
};

const stepButtonStyle = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "1px solid #334155",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const progressTextStyle = {
  marginTop: 9,
  textAlign: "center" as const,
  color: "#94a3b8",
  fontSize: 12,
};