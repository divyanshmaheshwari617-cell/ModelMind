"use client";

import type {
  WeakTopicRecord,
} from "../../types/roadmap";


interface RoadmapWeakTopicsPanelProps {
  weakTopics: WeakTopicRecord[];

  onOpenTopic?: (
    dayNumber: number
  ) => void;
}


function getStatusLabel(
  topic: WeakTopicRecord
): string {
  if (
    topic.status === "recovered"
  ) {
    return "Recovered";
  }

  if (
    topic.status ===
    "needs-practice"
  ) {
    return "Needs Practice";
  }

  return "Relearn";
}


function getImprovement(
  topic: WeakTopicRecord
): number {
  return (
    topic.latestScore -
    topic.initialScore
  );
}


export default function RoadmapWeakTopicsPanel({
  weakTopics,
  onOpenTopic,
}: RoadmapWeakTopicsPanelProps) {
  const activeTopics =
    weakTopics.filter(
      (topic) =>
        topic.status !==
        "recovered"
    );

  const recoveredTopics =
    weakTopics.filter(
      (topic) =>
        topic.status ===
        "recovered"
    );

  /*
   * Do not show an empty panel before
   * ModelMind has detected any weak topic.
   */
  if (weakTopics.length === 0) {
    return null;
  }

  return (
    <section className="roadmap-weak-topics-panel">
      <header className="roadmap-weak-topics-panel-header">
        <div>
          <span className="roadmap-section-label">
            ADAPTIVE LEARNING
          </span>

          <h2>
            Weak Topics
          </h2>

          <p>
            ModelMind uses your checkpoint
            performance to identify topics
            that need additional attention.
          </p>
        </div>

        <div className="roadmap-weak-topics-count">
          <strong>
            {activeTopics.length}
          </strong>

          <span>
            {activeTopics.length === 1
              ? "topic needs attention"
              : "topics need attention"}
          </span>
        </div>
      </header>

      {activeTopics.length > 0 && (
        <div className="roadmap-weak-topics-group">
          <div className="roadmap-weak-topics-group-title">
            <h3>
              Needs Attention
            </h3>

            <span>
              Score below 70%
            </span>
          </div>

          <div className="roadmap-weak-topics-grid">
            {activeTopics.map(
              (topic) => (
                <article
                  key={topic.id}
                  className={[
                    "roadmap-weak-topic-card",
                    `roadmap-weak-topic-card-${topic.status}`,
                  ].join(" ")}
                >
                  <div className="roadmap-weak-topic-card-top">
                    <div>
                      <span className="roadmap-weak-topic-card-status">
                        {getStatusLabel(
                          topic
                        )}
                      </span>

                      <h4>
                        {topic.topicTitle}
                      </h4>

                      <p>
                        Day{" "}
                        {topic.dayNumber}
                      </p>
                    </div>

                    <div className="roadmap-weak-topic-card-score">
                      <strong>
                        {topic.latestScore}%
                      </strong>

                      <span>
                        mastery
                      </span>
                    </div>
                  </div>

                  <div className="roadmap-weak-topic-card-details">
                    <div>
                      <span>
                        Initial
                      </span>

                      <strong>
                        {topic.initialScore}%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Best
                      </span>

                      <strong>
                        {topic.bestScore}%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Attempts
                      </span>

                      <strong>
                        {topic.attempts.length}
                      </strong>
                    </div>
                  </div>

                  <div className="roadmap-weak-topic-card-message">
                    {topic.status ===
                    "relearn" ? (
                      <p>
                        Core understanding
                        needs reinforcement.
                        Revisit the lesson,
                        visualization, code,
                        and practice before
                        retrying the
                        checkpoint.
                      </p>
                    ) : (
                      <p>
                        You are close to the
                        recovery threshold.
                        Focus on the areas
                        you missed and
                        practice again.
                      </p>
                    )}
                  </div>

                  {onOpenTopic && (
                    <button
                      type="button"
                      className="day-complete-button"
                      onClick={() =>
                        onOpenTopic(
                          topic.dayNumber
                        )
                      }
                    >
                      {topic.recoveryStarted
                        ? "Continue Recovery →"
                        : "Start Recovery →"}
                    </button>
                  )}
                </article>
              )
            )}
          </div>
        </div>
      )}

      {recoveredTopics.length > 0 && (
        <div className="roadmap-weak-topics-group">
          <div className="roadmap-weak-topics-group-title">
            <h3>
              Recovered
            </h3>

            <span>
              Mastery restored
            </span>
          </div>

          <div className="roadmap-weak-topics-grid">
            {recoveredTopics.map(
              (topic) => {
                const improvement =
                  getImprovement(
                    topic
                  );

                return (
                  <article
                    key={topic.id}
                    className="roadmap-weak-topic-card roadmap-weak-topic-card-recovered"
                  >
                    <div className="roadmap-weak-topic-card-top">
                      <div>
                        <span className="roadmap-weak-topic-card-status">
                          ✓ Recovered
                        </span>

                        <h4>
                          {topic.topicTitle}
                        </h4>

                        <p>
                          Day{" "}
                          {topic.dayNumber}
                        </p>
                      </div>

                      <div className="roadmap-weak-topic-card-score">
                        <strong>
                          {topic.latestScore}%
                        </strong>

                        <span>
                          mastery
                        </span>
                      </div>
                    </div>

                    <div className="roadmap-weak-topic-card-details">
                      <div>
                        <span>
                          Started
                        </span>

                        <strong>
                          {topic.initialScore}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Best
                        </span>

                        <strong>
                          {topic.bestScore}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Improvement
                        </span>

                        <strong>
                          {improvement >= 0
                            ? "+"
                            : ""}
                          {improvement}%
                        </strong>
                      </div>
                    </div>

                    <div className="roadmap-weak-topic-recovered-message">
                      <strong>
                        Recovery complete
                      </strong>

                      <p>
                        You reached the
                        required mastery
                        threshold. Keep this
                        topic strong during
                        future review.
                      </p>
                    </div>

                    {onOpenTopic && (
                      <button
                        type="button"
                        className="day-complete-button"
                        onClick={() =>
                          onOpenTopic(
                            topic.dayNumber
                          )
                        }
                      >
                        Review Topic →
                      </button>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </div>
      )}
    </section>
  );
}