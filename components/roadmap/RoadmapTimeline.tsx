"use client";

import type {
  RoadmapDay,
  RoadmapWeek,
} from "../../types/roadmap";

import RoadmapDayCard from "./RoadmapDayCard";

interface RoadmapTimelineProps {
  weeks: RoadmapWeek[];
  currentDay?: number;
  onDaySelect?: (
    day: RoadmapDay
  ) => void;
}

export default function RoadmapTimeline({
  weeks,
  currentDay = 1,
  onDaySelect,
}: RoadmapTimelineProps) {
  if (weeks.length === 0) {
    return (
      <section className="roadmap-timeline">
        <div className="roadmap-empty">
          <h2>
            Your roadmap is being prepared
          </h2>

          <p>
            Complete your learning profile
            to generate your personalized
            roadmap.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="roadmap-timeline">
      <div className="roadmap-timeline-header">
        <div>
          <p className="roadmap-eyebrow">
            PERSONALIZED LEARNING PATH
          </p>

          <h2>
            Your Roadmap
          </h2>

          <p className="roadmap-timeline-description">
            Follow your roadmap one day
            at a time. Learn, code,
            practice and complete
            checkpoints as you progress.
          </p>
        </div>
      </div>

      <div className="roadmap-weeks">
        {weeks.map((week) => (
          <section
            key={week.id}
            className="roadmap-week"
          >
            <div className="roadmap-week-header">
              <div className="roadmap-week-number">
                Week {week.weekNumber}
              </div>

              <div>
                <h3>
                  {week.title}
                </h3>

                {week.description && (
                  <p>
                    {week.description}
                  </p>
                )}
              </div>
            </div>

            <div className="roadmap-days">
              {week.days.map(
                (day) => (
                  <RoadmapDayCard
                    key={day.id}
                    day={day}
                    currentDay={
                      currentDay
                    }
                    onSelect={
                      onDaySelect
                    }
                  />
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}