type Props = {
  currentStep: number;
  totalSteps: number;
  playing: boolean;

  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onRestart: () => void;
};

export default function SVMPlaybackControls({
  currentStep,
  totalSteps,
  playing,
  onPrevious,
  onNext,
  onPlayPause,
  onRestart,
}: Props) {
  const progress =
    totalSteps > 1
      ? ((currentStep - 1) /
          (totalSteps - 1)) *
        100
      : 100;

  return (
    <div className="svm-playback premium-playback">
      <button
        type="button"
        className="secondary-playback-button"
        onClick={onRestart}
      >
        <span>
          ↺
        </span>
        Restart
      </button>

      <button
        type="button"
        className="secondary-playback-button"
        onClick={onPrevious}
        disabled={
          currentStep <= 1
        }
      >
        <span>
          ←
        </span>
        Previous
      </button>

      <button
        type="button"
        className={
          playing
            ? "play-button playing"
            : "play-button"
        }
        onClick={onPlayPause}
      >
        <span className="play-icon">
          {playing
            ? "Ⅱ"
            : "▶"}
        </span>

        {playing
          ? "Pause"
          : "Play Lesson"}
      </button>

      <button
        type="button"
        className="secondary-playback-button"
        onClick={onNext}
        disabled={
          currentStep >=
          totalSteps
        }
      >
        Next
        <span>
          →
        </span>
      </button>

      <div className="playback-progress">
        <strong>
          {currentStep}
        </strong>

        <span>
          /
        </span>

        <span>
          {totalSteps}
        </span>
      </div>

      <div className="playback-mini-progress">
        <div
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}