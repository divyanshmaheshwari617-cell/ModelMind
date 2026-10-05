"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  PersonalizedRoadmapData,
  RoadmapDay,
} from "../../types/roadmap";

import RoadmapTimeline from "./RoadmapTimeline";
import RoadmapDayWorkspace from "./RoadmapDayWorkspace";
import RoadmapWeakTopicsPanel from "./RoadmapWeakTopicsPanel";
interface PersonalizedRoadmapProps {
  roadmap: PersonalizedRoadmapData;

  onRoadmapChange: (
    roadmap: PersonalizedRoadmapData
  ) => void;
}

export default function PersonalizedRoadmap({
  roadmap,
  onRoadmapChange,
}: PersonalizedRoadmapProps) {
  const [
    selectedDayNumber,
    setSelectedDayNumber,
  ] = useState<number | null>(
    null
  );

  const allDays = useMemo(
    () =>
      roadmap.weeks.flatMap(
        (week) => week.days
      ),
    [roadmap.weeks]
  );

  const learningDays =
    useMemo(
      () =>
        allDays.filter(
          (day) =>
            !day.isRevisionDay
        ),
      [allDays]
    );

  const completedDays =
    useMemo(
      () =>
        allDays.filter(
          (day) =>
            day.completed
        ),
      [allDays]
    );

  const completedLearningDays =
    useMemo(
      () =>
        learningDays.filter(
          (day) =>
            day.completed
        ),
      [learningDays]
    );

  const totalProgressDays =
    allDays.length;

  const completedDayCount =
    completedDays.length;

  const remainingDayCount =
    Math.max(
      totalProgressDays -
        completedDayCount,
      0
    );

  const overallProgress =
    totalProgressDays > 0
      ? Math.round(
          (
            completedDayCount /
            totalProgressDays
          ) * 100
        )
      : 0;

  const latestCompletedDay =
    useMemo(() => {
      if (
        completedDays.length ===
        0
      ) {
        return null;
      }

      return [...completedDays]
        .sort(
          (a, b) =>
            b.dayNumber -
            a.dayNumber
        )[0];
    }, [completedDays]);

  const currentDay =
    roadmap.currentDay > 0
      ? roadmap.currentDay
      : 1;

  const activeDay =
    allDays.find(
      (day) =>
        day.dayNumber ===
        (
          selectedDayNumber ??
          currentDay
        )
    ) ??
    allDays[0] ??
    null;

  function scrollToWorkspace() {
    window.requestAnimationFrame(
      () => {
        document
          .querySelector(
            ".day-workspace"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }
    );
  }

  function handleDaySelect(
    day: RoadmapDay
  ) {
    setSelectedDayNumber(
      day.dayNumber
    );

    scrollToWorkspace();
  }

  /*
   * Used by the bottom
   * "Continue to next day" action.
   *
   * Future days remain freely clickable.
   * Completion never locks navigation.
   */
  function handleContinueToDay(
    dayNumber: number
  ) {
    const nextDay =
      allDays.find(
        (day) =>
          day.dayNumber ===
          dayNumber
      );

    if (!nextDay) {
      return;
    }

    setSelectedDayNumber(
      nextDay.dayNumber
    );

    scrollToWorkspace();
  }

  return (
    <main className="personalized-roadmap">
      <header className="roadmap-hero">
        <div>
          <p className="roadmap-eyebrow">
            MODELMIND LEARNING PATH
          </p>

          <h1>
            {roadmap.name}
          </h1>

          <p className="roadmap-hero-description">
            A personalized learning
            path built around your
            goal, current level and
            progress.
          </p>
        </div>

        <div className="roadmap-hero-stats">
          <div className="roadmap-stat">
            <span className="roadmap-stat-value">
              {
                roadmap.weeks
                  .length
              }
            </span>

            <span className="roadmap-stat-label">
              Weeks
            </span>
          </div>

          <div className="roadmap-stat">
            <span className="roadmap-stat-value">
              {
                roadmap.totalDays
              }
            </span>

            <span className="roadmap-stat-label">
              Days
            </span>
          </div>

          <div className="roadmap-stat">
            <span className="roadmap-stat-value">
              {
                roadmap.projects
                  .length
              }
            </span>

            <span className="roadmap-stat-label">
              Projects
            </span>
          </div>
        </div>
      </header>

      <section className="roadmap-overall-progress">
        <div className="roadmap-overall-progress-header">
          <div>
            <p className="roadmap-eyebrow">
              YOUR PROGRESS
            </p>

            <h2>
              Overall Progress
            </h2>

            <p className="roadmap-overall-progress-description">
              Your completed days and
              learning progress are
              saved automatically.
            </p>
          </div>

          <div className="roadmap-overall-progress-percentage">
            {overallProgress}%
          </div>
        </div>

        <div className="roadmap-overall-progress-track">
          <div
            className="roadmap-overall-progress-fill"
            style={{
              width: `${overallProgress}%`,
            }}
          />
        </div>

        <div className="roadmap-overall-progress-stats">
          <div className="roadmap-progress-summary-card">
            <strong>
              {completedDayCount}
            </strong>

            <span>
              Completed Days
            </span>
          </div>

          <div className="roadmap-progress-summary-card">
            <strong>
              {remainingDayCount}
            </strong>

            <span>
              Days Remaining
            </span>
          </div>

          <div className="roadmap-progress-summary-card">
            <strong>
              {
                completedLearningDays.length
              }
              /
              {
                learningDays.length
              }
            </strong>

            <span>
              Learning Days
            </span>
          </div>

          <div className="roadmap-progress-summary-card roadmap-progress-summary-latest">
            <strong>
              {latestCompletedDay
                ? `Day ${latestCompletedDay.dayNumber}`
                : "Not yet"}
            </strong>

            <span>
              Latest Completed
            </span>
          </div>
        </div>

        {latestCompletedDay && (
          <button
            type="button"
            className="roadmap-latest-completed"
            onClick={() =>
              handleDaySelect(
                latestCompletedDay
              )
            }
          >
            <span className="roadmap-latest-completed-icon">
              ✓
            </span>

            <span>
              <strong>
                Latest achievement
              </strong>

              <small>
                Day{" "}
                {
                  latestCompletedDay.dayNumber
                }
                {" · "}
                {
                  latestCompletedDay.title
                }
              </small>
            </span>

            <span className="roadmap-latest-completed-action">
              Review →
            </span>
          </button>
        )}
      </section>
      <RoadmapWeakTopicsPanel
  weakTopics={roadmap.weakTopics}
  onOpenTopic={handleContinueToDay}
/>
      {activeDay && (
        <RoadmapDayWorkspace
          key={
            activeDay.dayNumber
          }
          day={activeDay}
          currentDay={
            currentDay
          }
          roadmap={roadmap}
          onRoadmapChange={
            onRoadmapChange
          }
          onContinueToDay={
            handleContinueToDay
          }
        />
      )}

      <section className="roadmap-plan-section">
        <div className="roadmap-section-heading">
          <p className="roadmap-eyebrow">
            DAY-BY-DAY PLAN
          </p>

          <h2>
            Your Learning Plan
          </h2>

          <p>
            Completed days are marked
            clearly. You can still
            open any completed or
            upcoming day whenever you
            want.
          </p>
        </div>

        <RoadmapTimeline
          weeks={roadmap.weeks}
          currentDay={
            currentDay
          }
          onDaySelect={
            handleDaySelect
          }
        />
      </section>

      {roadmap.projects.length >
        0 && (
        <section className="roadmap-projects-section">
          <div className="roadmap-section-heading">
            <p className="roadmap-eyebrow">
              BUILD WITH WHAT YOU
              LEARN
            </p>

            <h2>
              Projects
            </h2>

            <p>
              Apply your skills
              through progressively
              more complete
              machine-learning
              projects.
            </p>
          </div>

          <div className="roadmap-project-grid">
            {roadmap.projects.map(
              (
                project,
                index
              ) => (
                <article
                  key={
                    project.id
                  }
                  className="roadmap-project-preview"
                >
                  <span className="roadmap-project-number">
                    Project{" "}
                    {index + 1}
                  </span>

                  <h3>
                    {
                      project.title
                    }
                  </h3>

                  <p>
                    {
                      project.description
                    }
                  </p>

                  <div className="roadmap-project-skills">
                    {project.requiredSkills.map(
                      (
                        skill
                      ) => (
                        <span
                          key={
                            skill
                          }
                        >
                          {
                            skill
                          }
                        </span>
                      )
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        </section>
      )}
    </main>
  );
}