"use client";

interface RoadmapWeakTopicRecoveryProps {
  topicId: string;

  topicTitle: string;

  score: number;

  recovered?: boolean;

  previousScore?: number;

  onStartRecovery?: () => void;
}

type RecoveryStatus =
  | "strong"
  | "good"
  | "needs-practice"
  | "relearn";

function getRecoveryStatus(
  score: number
): RecoveryStatus {
  if (score >= 85) {
    return "strong";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 50) {
    return "needs-practice";
  }

  return "relearn";
}

function getStatusTitle(
  status: RecoveryStatus
): string {
  switch (status) {
    case "strong":
      return "Strong mastery";

    case "good":
      return "Good understanding";

    case "needs-practice":
      return "Needs targeted practice";

    case "relearn":
      return "Relearning recommended";
  }
}

function getStatusDescription(
  status: RecoveryStatus
): string {
  switch (status) {
    case "strong":
      return "You demonstrated strong understanding of this topic.";

    case "good":
      return "You understand this topic well enough to continue.";

    case "needs-practice":
      return "You understand part of this topic, but targeted practice will help strengthen the weak areas.";

    case "relearn":
      return "Your checkpoint indicates that the core ideas should be reviewed before moving forward.";
  }
}

export default function RoadmapWeakTopicRecovery({
  topicId,
  topicTitle,
  score,
  recovered = false,
  previousScore,
  onStartRecovery,
}: RoadmapWeakTopicRecoveryProps) {
  const status =
    getRecoveryStatus(score);

  const weak =
    score < 70;

  const improvement =
    previousScore !== undefined
      ? score - previousScore
      : undefined;

  /*
   * A score >= 70 does not need a recovery
   * workflow unless we are displaying a
   * previously weak topic that has recovered.
   */
  if (!weak && !recovered) {
    return null;
  }

  if (recovered) {
    return (
      <section
        className="roadmap-weak-topic-recovery roadmap-weak-topic-recovered"
        data-topic-id={topicId}
      >
        <header className="roadmap-weak-topic-header">
          <div>
            <span className="roadmap-section-label">
              TOPIC RECOVERED
            </span>

            <h3>
              {topicTitle}
            </h3>

            <p>
              Your new checkpoint result
              shows that you have recovered
              this weak topic.
            </p>
          </div>

          <span className="roadmap-weak-topic-score">
            {score}%
          </span>
        </header>

        <div className="roadmap-weak-topic-improvement">
          {previousScore !== undefined && (
            <>
              <div>
                <span>
                  Previous mastery
                </span>

                <strong>
                  {previousScore}%
                </strong>
              </div>

              <div>
                <span>
                  Current mastery
                </span>

                <strong>
                  {score}%
                </strong>
              </div>

              <div>
                <span>
                  Improvement
                </span>

                <strong>
                  {improvement !== undefined &&
                  improvement >= 0
                    ? "+"
                    : ""}
                  {improvement ?? 0}%
                </strong>
              </div>
            </>
          )}
        </div>

        <div className="roadmap-weak-topic-success">
          <strong>
            ✓ Recovery complete
          </strong>

          <p>
            You can continue with the
            roadmap. Revisit this topic
            later during weekly review to
            keep the concept strong.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={[
        "roadmap-weak-topic-recovery",
        `roadmap-weak-topic-${status}`,
      ].join(" ")}
      data-topic-id={topicId}
    >
      <header className="roadmap-weak-topic-header">
        <div>
          <span className="roadmap-section-label">
            WEAK TOPIC DETECTED
          </span>

          <h3>
            {topicTitle}
          </h3>

          <p>
            ModelMind detected that this
            topic needs additional attention
            before you rely on it in later
            machine-learning concepts.
          </p>
        </div>

        <div className="roadmap-weak-topic-score-block">
          <strong>
            {score}%
          </strong>

          <span>
            Checkpoint mastery
          </span>
        </div>
      </header>

      <div className="roadmap-weak-topic-status">
        <span>
          RECOVERY STATUS
        </span>

        <strong>
          {getStatusTitle(status)}
        </strong>

        <p>
          {getStatusDescription(status)}
        </p>
      </div>

      <div className="roadmap-weak-topic-plan">
        <span className="roadmap-section-label">
          RECOMMENDED RECOVERY
        </span>

        <h4>
          What you should do next
        </h4>

        {status === "relearn" ? (
          <ol>
            <li>
              Revisit the core concept and
              intuition for {topicTitle}.
            </li>

            <li>
              Study the visualization again
              and connect it with the
              underlying concept.
            </li>

            <li>
              Review the guided code example
              step by step.
            </li>

            <li>
              Repeat the practice problems,
              especially the ones you found
              difficult.
            </li>

            <li>
              Review the explanations for
              incorrect checkpoint answers.
            </li>

            <li>
              Retry the checkpoint after
              relearning the topic.
            </li>
          </ol>
        ) : (
          <ol>
            <li>
              Review the checkpoint
              explanations for your
              incorrect answers.
            </li>

            <li>
              Revisit the parts of
              {` ${topicTitle} `}
              that were unclear.
            </li>

            <li>
              Complete another targeted
              practice round.
            </li>

            <li>
              Retry the checkpoint and aim
              for at least 70%.
            </li>
          </ol>
        )}
      </div>

      {onStartRecovery && (
        <div className="roadmap-weak-topic-actions">
          <button
            type="button"
            className="day-complete-button"
            onClick={onStartRecovery}
          >
            Start Weak Topic Recovery →
          </button>
        </div>
      )}
    </section>
  );
}