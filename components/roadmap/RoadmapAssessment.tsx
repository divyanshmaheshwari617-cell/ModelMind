"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  LearningLevel,
} from "../../types/roadmap";

import type {
  AssessmentQuestion,
} from "../../data/roadmap/quizzes";

import {
  buildInitialAssessment,
  evaluateAssessment,
} from "../../lib/roadmap/roadmapAssessment";

import type {
  AssessmentAnswer,
  RoadmapAssessmentResult,
} from "../../lib/roadmap/roadmapAssessment";

interface RoadmapAssessmentProps {
  level: LearningLevel;

  onComplete: (
    result: RoadmapAssessmentResult
  ) => void;

  onBack?: () => void;
}

export default function RoadmapAssessment({
  level,
  onComplete,
  onBack,
}: RoadmapAssessmentProps) {
  const questions =
    useMemo<AssessmentQuestion[]>(
      () =>
        buildInitialAssessment(
          level
        ),
      [level]
    );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<AssessmentAnswer[]>([]);

  const currentQuestion =
    questions[currentIndex];

  const currentAnswer =
    currentQuestion
      ? answers.find(
          (answer) =>
            answer.questionId ===
            currentQuestion.id
        )
      : undefined;

  const answeredCount =
    answers.length;

  const isLastQuestion =
    currentIndex ===
    questions.length - 1;

  const canContinue =
    currentAnswer !== undefined;

  function selectAnswer(
    answerIndex: number
  ) {
    if (!currentQuestion) {
      return;
    }

    setAnswers(
      (currentAnswers) => {
        const existing =
          currentAnswers.find(
            (answer) =>
              answer.questionId ===
              currentQuestion.id
          );

        if (existing) {
          return currentAnswers.map(
            (answer) =>
              answer.questionId ===
              currentQuestion.id
                ? {
                    ...answer,
                    selectedAnswer:
                      answerIndex,
                  }
                : answer
          );
        }

        return [
          ...currentAnswers,
          {
            questionId:
              currentQuestion.id,

            selectedAnswer:
              answerIndex,
          },
        ];
      }
    );
  }

  function goNext() {
    if (!canContinue) {
      return;
    }

    if (isLastQuestion) {
      const result =
        evaluateAssessment(
          questions,
          answers
        );

      onComplete(result);

      return;
    }

    setCurrentIndex(
      (index) => index + 1
    );
  }

  function goPrevious() {
    if (currentIndex === 0) {
      onBack?.();

      return;
    }

    setCurrentIndex(
      (index) =>
        Math.max(index - 1, 0)
    );
  }

  if (questions.length === 0) {
    return (
      <section className="roadmap-assessment">
        <div className="roadmap-empty">
          <h2>
            No assessment questions
            available
          </h2>

          <p>
            Continue with your selected
            learning level.
          </p>
        </div>
      </section>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const progress =
    Math.round(
      ((currentIndex + 1) /
        questions.length) *
        100
    );

  return (
    <main className="roadmap-assessment">
      <header className="roadmap-assessment-header">
        <div>
          <p className="roadmap-eyebrow">
            SKILL DIAGNOSTIC
          </p>

          <h1>
            Let&apos;s find your
            starting point
          </h1>

          <p>
            Answer these questions so
            ModelMind can avoid repeating
            skills you already understand
            and strengthen areas that need
            more practice.
          </p>
        </div>

        <div className="roadmap-assessment-count">
          Question{" "}
          {currentIndex + 1} of{" "}
          {questions.length}
        </div>
      </header>

      <div className="roadmap-assessment-progress">
        <div
          className="roadmap-assessment-progress-bar"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <section className="roadmap-question-card">
        <div className="roadmap-question-meta">
          <span>
            {
              currentQuestion.skillId
                .replaceAll("-", " ")
            }
          </span>

          <span>
            {
              currentQuestion.difficulty
            }
          </span>
        </div>

        <h2>
          {currentQuestion.question}
        </h2>

        <div className="roadmap-answer-grid">
          {currentQuestion.options.map(
            (option, index) => {
              const selected =
                currentAnswer
                  ?.selectedAnswer ===
                index;

              return (
                <button
                  key={`${currentQuestion.id}-${index}`}
                  type="button"
                  className={[
                    "roadmap-answer-option",
                    selected
                      ? "selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    selectAnswer(
                      index
                    )
                  }
                >
                  <span className="roadmap-answer-letter">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span>
                    {option}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </section>

      <footer className="roadmap-assessment-footer">
        <div className="roadmap-assessment-status">
          {answeredCount} of{" "}
          {questions.length} answered
        </div>

        <div className="roadmap-assessment-actions">
          <button
            type="button"
            className="roadmap-secondary-button"
            onClick={goPrevious}
          >
            ← Back
          </button>

          <button
            type="button"
            className="roadmap-primary-button"
            disabled={!canContinue}
            onClick={goNext}
          >
            {isLastQuestion
              ? "Finish Assessment →"
              : "Next Question →"}
          </button>
        </div>
      </footer>
    </main>
  );
}