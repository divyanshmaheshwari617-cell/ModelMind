"use client";

import type {
  ActivityType,
  RoadmapDay,
} from "../../types/roadmap";

interface RoadmapDayCardProps {
  day: RoadmapDay;
  currentDay?: number;
  onSelect?: (day: RoadmapDay) => void;
}

type DayState =
  | "completed"
  | "current"
  | "upcoming";

interface DayActivityChip {
  key: string;
  label: string;
  visible: boolean;
  completed: boolean;
}

function getDayState(
  day: RoadmapDay,
  currentDay: number
): DayState {
  if (day.completed) {
    return "completed";
  }

  if (day.dayNumber === currentDay) {
    return "current";
  }

  return "upcoming";
}

function getActivitiesByType(
  day: RoadmapDay,
  type: ActivityType
) {
  return day.topics.flatMap(
    (topic) =>
      topic.activities.filter(
        (activity) =>
          activity.type === type
      )
  );
}

function getActivityState(
  day: RoadmapDay,
  type: ActivityType
): {
  visible: boolean;
  completed: boolean;
} {
  const activities =
    getActivitiesByType(
      day,
      type
    );

  return {
    visible:
      activities.length > 0,

    completed:
      activities.length > 0 &&
      activities.every(
        (activity) =>
          activity.completed
      ),
  };
}

export default function RoadmapDayCard({
  day,
  currentDay = 1,
  onSelect,
}: RoadmapDayCardProps) {
  const state =
    getDayState(
      day,
      currentDay
    );

  const concept =
    getActivityState(
      day,
      "concept"
    );

  const visualization =
    getActivityState(
      day,
      "visualization"
    );

  const coding =
    getActivityState(
      day,
      "coding"
    );

  const practice =
    getActivityState(
      day,
      "practice"
    );

  const revision =
    getActivityState(
      day,
      "revision"
    );

  const assignmentVisible =
    Boolean(day.assignment);

  const assignmentCompleted =
    Boolean(
      day.assignment?.completed
    );

  const quizVisible =
    Boolean(day.quiz);

  const quizCompleted =
    Boolean(
      day.quiz?.completed
    );

  const chips:
    DayActivityChip[] = [
      {
        key: "learn",
        label: "Learn",
        visible:
          concept.visible,
        completed:
          concept.completed,
      },
      {
        key: "visualize",
        label: "Visualize",
        visible:
          visualization.visible,
        completed:
          visualization.completed,
      },
      {
        key: "code",
        label: "Code",
        visible:
          coding.visible,
        completed:
          coding.completed,
      },
      {
        key: "practice",
        label: "Practice",
        visible:
          practice.visible,
        completed:
          practice.completed,
      },
      {
        key: "assignment",
        label: "Assignment",
        visible:
          assignmentVisible,
        completed:
          assignmentCompleted,
      },
      {
        key: "quiz",
        label: "Quiz",
        visible:
          quizVisible,
        completed:
          quizCompleted,
      },
      {
        key: "review",
        label: "Review",
        visible:
          day.isRevisionDay ||
          revision.visible,
        completed:
          day.completed ||
          revision.completed,
      },
    ];

  const visibleChips =
    chips.filter(
      (chip) => chip.visible
    );

  const completedItems =
    visibleChips.filter(
      (chip) => chip.completed
    ).length;

  const totalItems =
    visibleChips.length;

  const itemProgress =
    totalItems > 0
      ? Math.round(
          (
            completedItems /
            totalItems
          ) * 100
        )
      : day.completed
        ? 100
        : 0;

  return (
    <button
      type="button"
      className={[
        "roadmap-day-card",
        `roadmap-day-${state}`,
        day.isRevisionDay
          ? "roadmap-day-review"
          : "",
        day.completed
          ? "roadmap-day-card-complete"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() =>
        onSelect?.(day)
      }
    >
      <div className="roadmap-day-top">
        <span className="roadmap-day-number">
          {day.completed && (
            <span
              className="roadmap-day-check"
              aria-hidden="true"
            >
              ✓
            </span>
          )}

          Day {day.dayNumber}
        </span>

        <span
          className={[
            "roadmap-day-status",
            `roadmap-day-status-${state}`,
          ].join(" ")}
        >
          {state ===
            "completed" &&
            "✓ Completed"}

          {state ===
            "current" &&
            "Current"}

          {state ===
            "upcoming" &&
            "Upcoming"}
        </span>
      </div>

      <h4 className="roadmap-day-title">
        {day.title}
      </h4>

      {day.topics.length >
        0 && (
        <div className="roadmap-day-topics">
          {day.topics.map(
            (topic) => (
              <span
                key={topic.id}
                className="roadmap-topic-chip"
              >
                {topic.title}
              </span>
            )
          )}
        </div>
      )}

      <div className="roadmap-day-content">
        {visibleChips.map(
          (chip) => (
            <span
              key={chip.key}
              className={
                chip.completed
                  ? "roadmap-day-content-chip roadmap-day-content-chip-completed"
                  : "roadmap-day-content-chip"
              }
            >
              {chip.completed &&
                "✓ "}

              {chip.label}
            </span>
          )
        )}
      </div>

      {totalItems > 0 && (
        <div className="roadmap-day-mini-progress">
          <div className="roadmap-day-mini-progress-top">
            <span>
              {completedItems}/
              {totalItems} complete
            </span>

            <strong>
              {itemProgress}%
            </strong>
          </div>

          <div className="roadmap-day-mini-progress-track">
            <span
              className="roadmap-day-mini-progress-fill"
              style={{
                width: `${itemProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="roadmap-day-footer">
        {state ===
          "completed" && (
          <span className="roadmap-day-footer-completed">
            ✓ Day Completed
          </span>
        )}

        {state ===
          "current" && (
          <span>
            Continue learning →
          </span>
        )}

        {state ===
          "upcoming" && (
          <span>
            Open day →
          </span>
        )}
      </div>
    </button>
  );
}