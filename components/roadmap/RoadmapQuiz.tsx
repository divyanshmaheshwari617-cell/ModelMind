// "use client";

// import {
//   useMemo,
//   useState,
// } from "react";

// import type {
//   RoadmapQuiz as RoadmapQuizData,
// } from "../../types/roadmap";

// interface RoadmapQuizProps {
//   quiz: RoadmapQuizData;

//   onComplete: (
//     score: number
//   ) => void;

//   allowRetry?: boolean;
// }

// export default function RoadmapQuiz({
//   quiz,
//   onComplete,
//   allowRetry = false,
// }: RoadmapQuizProps) {
//     const [answers, setAnswers] =
//     useState<Record<string, number>>(
//       {}
//     );

//   const [submitted, setSubmitted] =
//     useState(quiz.completed);
//   const [retrying, setRetrying] =
//   useState(false);
//   const isReviewingResult =
//   !retrying &&
//   (quiz.completed || submitted);

//   const totalQuestions =
//     quiz.questions.length;

//   const answeredCount =
//     Object.keys(answers).length;

//   const allAnswered =
//     totalQuestions === 0 ||
//     answeredCount ===
//       totalQuestions;

//   const progress = useMemo(() => {
//     if (isReviewingResult) {
//   return 100;
// }

//     if (totalQuestions === 0) {
//       return 100;
//     }

//     return Math.round(
//       (answeredCount /
//         totalQuestions) *
//         100
//     );
//   }, [
//     answeredCount,
//     isReviewingResult,
//     totalQuestions,
//   ]);

//   const calculateScore = () => {
//     if (totalQuestions === 0) {
//       return 100;
//     }

//     const correct =
//       quiz.questions.filter(
//         (question) =>
//           answers[question.id] ===
//           question.correctAnswer
//       ).length;

//     return Math.round(
//       (correct /
//         totalQuestions) *
//         100
//     );
//   };

//   const score =
//   retrying
//     ? 0
//     : submitted &&
//         !quiz.completed
//       ? calculateScore()
//       : quiz.score ?? 0;

//   const correctAnswers =
//   submitted &&
//   !quiz.completed &&
//   !retrying
//     ? quiz.questions.filter(
//         (question) =>
//           answers[
//             question.id
//           ] ===
//           question.correctAnswer
//       ).length
//     : Math.round(
//         (score / 100) *
//           totalQuestions
//       );

//   const submitQuiz = () => {
//     if (!allAnswered) {
//       return;
//     }

//     const finalScore =
//       calculateScore();

//     setSubmitted(true);
// setRetrying(false);

// onComplete(finalScore);
//   };
//   const startRetry = () => {
//   setAnswers({});
//   setSubmitted(false);
//   setRetrying(true);
// };


//   const handleAnswer = (
//     questionId: string,
//     optionIndex: number
//   ) => {
//     if (
//       submitted ||
//       quiz.completed
//     ) {
//       return;
//     }

//     setAnswers(
//       (current) => ({
//         ...current,
//         [questionId]:
//           optionIndex,
//       })
//     );
//   };

//   return (
//     <section className="roadmap-quiz-workspace">
//       {/* ================================
//           CHECKPOINT HEADER
//          ================================ */}

//       <header className="roadmap-quiz-header">
//         <div className="roadmap-quiz-heading">
//           <div className="roadmap-quiz-heading-top">
//             <span className="roadmap-section-label">
//               CHECKPOINT
//             </span>

//             {(quiz.completed ||
//               submitted) && (
//               <span className="roadmap-quiz-completed-badge">
//                 Reviewed ✓
//               </span>
//             )}
//           </div>

//           <h3>
//             {quiz.title}
//           </h3>

//           <p>
//             Test your understanding
//             before moving forward.
//             Answer every question,
//             submit the checkpoint,
//             then review each
//             explanation.
//           </p>
//         </div>

//         <div className="roadmap-quiz-progress-summary">
//           <strong>
//             {quiz.completed ||
//             submitted
//               ? `${score}%`
//               : `${answeredCount}/${totalQuestions}`}
//           </strong>

//           <span>
//             {quiz.completed ||
//             submitted
//               ? "Checkpoint score"
//               : "Questions answered"}
//           </span>
//         </div>
//       </header>

//       {/* ================================
//           PROGRESS
//          ================================ */}

//       <div className="roadmap-quiz-progress">
//         <div className="roadmap-quiz-progress-meta">
//           <span>
//             Checkpoint progress
//           </span>

//           <strong>
//             {quiz.completed ||
//             submitted
//               ? "Review complete"
//               : `${answeredCount} of ${totalQuestions}`}
//           </strong>
//         </div>

//         <div className="roadmap-quiz-progress-track">
//           <div
//             className="roadmap-quiz-progress-fill"
//             style={{
//               width: `${progress}%`,
//             }}
//           />
//         </div>
//       </div>

//       {/* ================================
//           QUESTIONS
//          ================================ */}

//       <div className="roadmap-quiz-question-list">
//         {quiz.questions.map(
//           (
//             question,
//             questionIndex
//           ) => {
//             const selectedAnswer =
//               answers[
//                 question.id
//               ];

//             const questionAnswered =
//               selectedAnswer !==
//               undefined;

//             const questionCorrect =
//               selectedAnswer ===
//               question.correctAnswer;

//             return (
//               <article
//                 key={
//                   question.id
//                 }
//                 className="roadmap-quiz-question"
//               >
//                 <header className="roadmap-quiz-question-header">
//                   <div>
//                     <span className="roadmap-quiz-question-number">
//                       {String(
//                         questionIndex +
//                           1
//                       ).padStart(
//                         2,
//                         "0"
//                       )}
//                     </span>

//                     <span className="roadmap-section-label">
//                       QUESTION{" "}
//                       {questionIndex +
//                         1}
//                     </span>
//                   </div>

//                   {!submitted &&
//                     !quiz.completed &&
//                     questionAnswered && (
//                       <span className="roadmap-quiz-answered-badge">
//                         Answered ✓
//                       </span>
//                     )}

//                   {(submitted ||
//                     quiz.completed) &&
//                     questionAnswered && (
//                       <span
//                         className={
//                           questionCorrect
//                             ? "roadmap-quiz-review-badge roadmap-quiz-review-correct"
//                             : "roadmap-quiz-review-badge roadmap-quiz-review-wrong"
//                         }
//                       >
//                         {questionCorrect
//                           ? "Correct ✓"
//                           : "Review"}
//                       </span>
//                     )}
//                 </header>

//                 <h4>
//                   {
//                     question.question
//                   }
//                 </h4>

//                 <div className="roadmap-quiz-options">
//                   {question.options.map(
//                     (
//                       option,
//                       optionIndex
//                     ) => {
//                       const selected =
//                         selectedAnswer ===
//                         optionIndex;

//                       const correct =
//                         optionIndex ===
//                         question.correctAnswer;

//                       let className =
//                         "roadmap-quiz-option";

//                       if (
//                         submitted ||
//                         quiz.completed
//                       ) {
//                         if (correct) {
//                           className +=
//                             " roadmap-quiz-option-correct";
//                         } else if (
//                           selected
//                         ) {
//                           className +=
//                             " roadmap-quiz-option-wrong";
//                         }
//                       } else if (
//                         selected
//                       ) {
//                         className +=
//                           " roadmap-quiz-option-selected";
//                       }

//                       return (
//                         <button
//                           key={`${question.id}-${optionIndex}`}
//                           type="button"
//                           className={
//                             className
//                           }
//                           disabled={
//                             submitted ||
//                             quiz.completed
//                           }
//                           onClick={() =>
//                             handleAnswer(
//                               question.id,
//                               optionIndex
//                             )
//                           }
//                         >
//                           <span className="roadmap-quiz-option-letter">
//                             {String.fromCharCode(
//                               65 +
//                                 optionIndex
//                             )}
//                           </span>

//                           <span className="roadmap-quiz-option-text">
//                             {option}
//                           </span>

//                           <span className="roadmap-quiz-option-indicator">
//                             {submitted ||
//                             quiz.completed
//                               ? correct
//                                 ? "✓"
//                                 : selected
//                                   ? "×"
//                                   : ""
//                               : selected
//                                 ? "●"
//                                 : ""}
//                           </span>
//                         </button>
//                       );
//                     }
//                   )}
//                 </div>

//                 {(submitted ||
//                   quiz.completed) && (
//                   <div className="roadmap-quiz-explanation">
//                     <div className="roadmap-quiz-explanation-icon">
//                       i
//                     </div>

//                     <div>
//                       <strong>
//                         Explanation
//                       </strong>

//                       <p>
//                         {
//                           question.explanation
//                         }
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </article>
//             );
//           }
//         )}
//       </div>

//       {/* ================================
//           SUBMIT
//          ================================ */}

//       {!quiz.completed &&
//         !submitted && (
//           <footer className="roadmap-quiz-footer">
//             <div>
//               <span className="roadmap-section-label">
//                 {allAnswered
//                   ? "READY TO SUBMIT"
//                   : "CHECKPOINT PROGRESS"}
//               </span>

//               <h4>
//                 {allAnswered
//                   ? "All questions answered"
//                   : `${
//                       totalQuestions -
//                       answeredCount
//                     } ${
//                       totalQuestions -
//                         answeredCount ===
//                       1
//                         ? "question"
//                         : "questions"
//                     } remaining`}
//               </h4>

//               <p>
//                 {allAnswered
//                   ? "Submit your answers to see your score and detailed explanations."
//                   : "Answer every question before submitting your checkpoint."}
//               </p>
//             </div>

//             <button
//               type="button"
//               className="roadmap-quiz-submit-button"
//               disabled={
//                 !allAnswered
//               }
//               onClick={
//                 submitQuiz
//               }
//             >
//               {allAnswered
//                 ? "Submit Checkpoint →"
//                 : `${answeredCount}/${totalQuestions} answered`}
//             </button>
//           </footer>
//         )}

//       {/* ================================
//           RESULT
//          ================================ */}

//       {(submitted ||
//         quiz.completed) && (
//         <section className="roadmap-quiz-result">
//           <div className="roadmap-quiz-result-score">
//             <span>
//               YOUR SCORE
//             </span>

//             <strong>
//               {score}%
//             </strong>
//           </div>

//           <div className="roadmap-quiz-result-content">
//             <span className="roadmap-section-label">
//               CHECKPOINT COMPLETE
//             </span>

//             <h4>
//               {score >= 80
//                 ? "Strong understanding"
//                 : score >= 60
//                   ? "Good progress"
//                   : "Review recommended"}
//             </h4>

//             <p>
//               You answered{" "}
//               <strong>
//                 {correctAnswers}
//               </strong>{" "}
//               out of{" "}
//               <strong>
//                 {totalQuestions}
//               </strong>{" "}
//               questions correctly.
//               Review the explanations
//               above before continuing.
//             </p>
//           </div>

//           <div className="roadmap-quiz-result-status">
//             <span>
//               Completed
//             </span>

//             <strong>
//               ✓
//             </strong>
//           </div>
//         </section>
//       )}
//     </section>
//   );
// }


"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  RoadmapQuiz as RoadmapQuizData,
} from "../../types/roadmap";

interface RoadmapQuizProps {
  quiz: RoadmapQuizData;

  onComplete: (
    score: number
  ) => void;

  allowRetry?: boolean;
}

export default function RoadmapQuiz({
  quiz,
  onComplete,
  allowRetry = false,
}: RoadmapQuizProps) {
  const [answers, setAnswers] =
    useState<Record<string, number>>(
      {}
    );

  const [submitted, setSubmitted] =
    useState(quiz.completed);

  const [retrying, setRetrying] =
    useState(false);

  /*
   * We are reviewing a finished result when:
   *
   * 1. This is not an active retry.
   * 2. The persisted quiz is completed
   *    OR this local attempt was submitted.
   */
  const isReviewingResult =
    !retrying &&
    (quiz.completed || submitted);

  const totalQuestions =
    quiz.questions.length;

  const answeredCount =
    Object.keys(answers).length;

  const allAnswered =
    totalQuestions === 0 ||
    answeredCount ===
      totalQuestions;

  /*
   * During a retry, progress starts again
   * from 0 and follows answered questions.
   */
  const progress = useMemo(() => {
    if (isReviewingResult) {
      return 100;
    }

    if (totalQuestions === 0) {
      return 100;
    }

    return Math.round(
      (answeredCount /
        totalQuestions) *
        100
    );
  }, [
    answeredCount,
    isReviewingResult,
    totalQuestions,
  ]);

  /*
   * Calculate the score of the answers
   * currently selected in this component.
   */
  const calculateScore = () => {
    if (totalQuestions === 0) {
      return 100;
    }

    const correct =
      quiz.questions.filter(
        (question) =>
          answers[
            question.id
          ] ===
          question.correctAnswer
      ).length;

    return Math.round(
      (correct /
        totalQuestions) *
        100
    );
  };

  /*
   * Displayed result score.
   *
   * For an already persisted checkpoint,
   * use quiz.score.
   *
   * For a newly submitted first attempt,
   * calculate it from local answers.
   */
  const score =
    submitted &&
    !quiz.completed &&
    !retrying
      ? calculateScore()
      : quiz.score ?? 0;

  /*
   * Number of correct answers shown in
   * the result card.
   *
   * A persisted quiz stores only the score,
   * so the count is reconstructed from it.
   */
  const correctAnswers =
    submitted &&
    !quiz.completed &&
    !retrying
      ? quiz.questions.filter(
          (question) =>
            answers[
              question.id
            ] ===
            question.correctAnswer
        ).length
      : Math.round(
          (score / 100) *
            totalQuestions
        );

  /*
   * Submit either:
   *
   * - the original checkpoint
   * - or a recovery retry
   *
   * The parent receives the new score and
   * records it in the roadmap.
   */
  const submitQuiz = () => {
    if (!allAnswered) {
      return;
    }

    const finalScore =
      calculateScore();

    setSubmitted(true);
    setRetrying(false);

    onComplete(finalScore);
  };

  /*
   * Start a clean recovery attempt.
   *
   * We intentionally keep the persisted
   * previous quiz score in the roadmap.
   * Only local answers are reset.
   */
  const startRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setRetrying(true);
  };

  const handleAnswer = (
    questionId: string,
    optionIndex: number
  ) => {
    /*
     * Normal completed checkpoints cannot
     * be edited.
     *
     * A recovery retry explicitly unlocks
     * the questions.
     */
    if (
      submitted ||
      (quiz.completed &&
        !retrying)
    ) {
      return;
    }

    setAnswers(
      (current) => ({
        ...current,
        [questionId]:
          optionIndex,
      })
    );
  };

  return (
    <section className="roadmap-quiz-workspace">
      {/* ================================ */}
      {/* CHECKPOINT HEADER */}
      {/* ================================ */}

      <header className="roadmap-quiz-header">
        <div className="roadmap-quiz-heading">
          <div className="roadmap-quiz-heading-top">
            <span className="roadmap-section-label">
              {retrying
                ? "RECOVERY CHECKPOINT"
                : "CHECKPOINT"}
            </span>

            {isReviewingResult && (
              <span className="roadmap-quiz-completed-badge">
                Reviewed ✓
              </span>
            )}

            {retrying && (
              <span className="roadmap-quiz-answered-badge">
                Recovery attempt
              </span>
            )}
          </div>

          <h3>
            {quiz.title}
          </h3>

          <p>
            {retrying
              ? "Test the topic again after reviewing the concepts. Answer every question and submit your recovery checkpoint."
              : "Test your understanding before moving forward. Answer every question, submit the checkpoint, then review each explanation."}
          </p>
        </div>

        <div className="roadmap-quiz-progress-summary">
          <strong>
            {isReviewingResult
              ? `${score}%`
              : `${answeredCount}/${totalQuestions}`}
          </strong>

          <span>
            {isReviewingResult
              ? "Checkpoint score"
              : retrying
                ? "Recovery questions answered"
                : "Questions answered"}
          </span>
        </div>
      </header>

      {/* ================================ */}
      {/* PROGRESS */}
      {/* ================================ */}

      <div className="roadmap-quiz-progress">
        <div className="roadmap-quiz-progress-meta">
          <span>
            {retrying
              ? "Recovery progress"
              : "Checkpoint progress"}
          </span>

          <strong>
            {isReviewingResult
              ? "Review complete"
              : `${answeredCount} of ${totalQuestions}`}
          </strong>
        </div>

        <div className="roadmap-quiz-progress-track">
          <div
            className="roadmap-quiz-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* ================================ */}
      {/* QUESTIONS */}
      {/* ================================ */}

      <div className="roadmap-quiz-question-list">
        {quiz.questions.map(
          (
            question,
            questionIndex
          ) => {
            const selectedAnswer =
              answers[
                question.id
              ];

            const questionAnswered =
              selectedAnswer !==
              undefined;

            const questionCorrect =
              selectedAnswer ===
              question.correctAnswer;

            return (
              <article
                key={
                  question.id
                }
                className="roadmap-quiz-question"
              >
                <header className="roadmap-quiz-question-header">
                  <div>
                    <span className="roadmap-quiz-question-number">
                      {String(
                        questionIndex +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <span className="roadmap-section-label">
                      QUESTION{" "}
                      {questionIndex +
                        1}
                    </span>
                  </div>

                  {!isReviewingResult &&
                    questionAnswered && (
                      <span className="roadmap-quiz-answered-badge">
                        Answered ✓
                      </span>
                    )}

                  {isReviewingResult &&
                    questionAnswered && (
                      <span
                        className={
                          questionCorrect
                            ? "roadmap-quiz-review-badge roadmap-quiz-review-correct"
                            : "roadmap-quiz-review-badge roadmap-quiz-review-wrong"
                        }
                      >
                        {questionCorrect
                          ? "Correct ✓"
                          : "Review"}
                      </span>
                    )}
                </header>

                <h4>
                  {
                    question.question
                  }
                </h4>

                <div className="roadmap-quiz-options">
                  {question.options.map(
                    (
                      option,
                      optionIndex
                    ) => {
                      const selected =
                        selectedAnswer ===
                        optionIndex;

                      const correct =
                        optionIndex ===
                        question.correctAnswer;

                      let className =
                        "roadmap-quiz-option";

                      if (
                        isReviewingResult
                      ) {
                        if (correct) {
                          className +=
                            " roadmap-quiz-option-correct";
                        } else if (
                          selected
                        ) {
                          className +=
                            " roadmap-quiz-option-wrong";
                        }
                      } else if (
                        selected
                      ) {
                        className +=
                          " roadmap-quiz-option-selected";
                      }

                      return (
                        <button
                          key={`${question.id}-${optionIndex}`}
                          type="button"
                          className={
                            className
                          }
                          disabled={
                            submitted ||
                            (quiz.completed &&
                              !retrying)
                          }
                          onClick={() =>
                            handleAnswer(
                              question.id,
                              optionIndex
                            )
                          }
                        >
                          <span className="roadmap-quiz-option-letter">
                            {String.fromCharCode(
                              65 +
                                optionIndex
                            )}
                          </span>

                          <span className="roadmap-quiz-option-text">
                            {option}
                          </span>

                          <span className="roadmap-quiz-option-indicator">
                            {isReviewingResult
                              ? correct
                                ? "✓"
                                : selected
                                  ? "×"
                                  : ""
                              : selected
                                ? "●"
                                : ""}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                {isReviewingResult && (
                  <div className="roadmap-quiz-explanation">
                    <div className="roadmap-quiz-explanation-icon">
                      i
                    </div>

                    <div>
                      <strong>
                        Explanation
                      </strong>

                      <p>
                        {
                          question.explanation
                        }
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          }
        )}
      </div>

      {/* ================================ */}
      {/* SUBMIT */}
      {/* ================================ */}

      {(!quiz.completed ||
        retrying) &&
        !submitted && (
          <footer className="roadmap-quiz-footer">
            <div>
              <span className="roadmap-section-label">
                {allAnswered
                  ? retrying
                    ? "READY TO RETEST"
                    : "READY TO SUBMIT"
                  : retrying
                    ? "RECOVERY PROGRESS"
                    : "CHECKPOINT PROGRESS"}
              </span>

              <h4>
                {allAnswered
                  ? retrying
                    ? "Recovery checkpoint ready"
                    : "All questions answered"
                  : `${
                      totalQuestions -
                      answeredCount
                    } ${
                      totalQuestions -
                        answeredCount ===
                      1
                        ? "question"
                        : "questions"
                    } remaining`}
              </h4>

              <p>
                {allAnswered
                  ? retrying
                    ? "Submit this recovery attempt to compare it with your previous checkpoint score."
                    : "Submit your answers to see your score and detailed explanations."
                  : "Answer every question before submitting your checkpoint."}
              </p>
            </div>

            <button
              type="button"
              className="roadmap-quiz-submit-button"
              disabled={
                !allAnswered
              }
              onClick={
                submitQuiz
              }
            >
              {allAnswered
                ? retrying
                  ? "Submit Recovery Checkpoint →"
                  : "Submit Checkpoint →"
                : `${answeredCount}/${totalQuestions} answered`}
            </button>
          </footer>
        )}

      {/* ================================ */}
      {/* RESULT */}
      {/* ================================ */}

      {isReviewingResult && (
        <section className="roadmap-quiz-result">
          <div className="roadmap-quiz-result-score">
            <span>
              YOUR SCORE
            </span>

            <strong>
              {score}%
            </strong>
          </div>

          <div className="roadmap-quiz-result-content">
            <span className="roadmap-section-label">
              CHECKPOINT COMPLETE
            </span>

            <h4>
              {score >= 85
                ? "Strong understanding"
                : score >= 70
                  ? "Good understanding"
                  : score >= 50
                    ? "More practice recommended"
                    : "Relearning recommended"}
            </h4>

            <p>
              You answered{" "}
              <strong>
                {correctAnswers}
              </strong>{" "}
              out of{" "}
              <strong>
                {totalQuestions}
              </strong>{" "}
              questions correctly.
              {score < 70
                ? " Review the explanations and recovery material before retrying."
                : " You are ready to continue."}
            </p>
          </div>

          <div className="roadmap-quiz-result-status">
            <span>
              {score >= 70
                ? "Completed"
                : "Needs recovery"}
            </span>

            <strong>
              {score >= 70
                ? "✓"
                : "!"}
            </strong>
          </div>
        </section>
      )}

      {/* ================================ */}
      {/* RECOVERY RETRY */}
      {/* ================================ */}

      {allowRetry &&
        quiz.completed &&
        !retrying &&
        !submitted &&
        (quiz.score ?? 0) <
          70 && (
          <section className="roadmap-quiz-retry">
            <div>
              <span className="roadmap-section-label">
                WEAK TOPIC RECOVERY
              </span>

              <h4>
                Ready to test this
                topic again?
              </h4>

              <p>
                Review the topic first,
                then retry the checkpoint.
                Your next score will be
                stored as another recovery
                attempt.
              </p>
            </div>

            <button
              type="button"
              className="roadmap-quiz-submit-button"
              onClick={
                startRetry
              }
            >
              Retry Checkpoint →
            </button>
          </section>
        )}
    </section>
  );
}