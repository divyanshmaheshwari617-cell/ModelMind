"use client";

import {
  useState,
} from "react";

import type {
  KnowledgeLevel,
  LearningLevel,
  LearningPriority,
  RoadmapGoal,
  RoadmapProfile,
} from "../../types/roadmap";


interface RoadmapOnboardingProps {
  onComplete: (
    profile: RoadmapProfile
  ) => void;
}


interface GoalOption {
  value: RoadmapGoal;
  title: string;
  description: string;
}


interface LevelOption {
  value: LearningLevel;
  title: string;
  description: string;
}


interface KnowledgeOption {
  value: KnowledgeLevel;
  title: string;
  description: string;
}


interface PriorityOption {
  value: LearningPriority;
  title: string;
  description: string;
}


const goalOptions: GoalOption[] = [
  {
    value: "college",
    title: "College & Exams",
    description:
      "Master ML fundamentals, practical coding and the concepts commonly required in coursework and examinations.",
  },
  {
    value: "ml-engineer",
    title: "ML Engineer",
    description:
      "Build practical skills in preprocessing, modeling, evaluation, pipelines and end-to-end ML workflows.",
  },
  {
    value: "data-scientist",
    title: "Data Scientist",
    description:
      "Develop statistics, EDA, feature engineering, machine learning and data-driven problem-solving skills.",
  },
  {
    value: "data-analyst",
    title: "Data Analyst",
    description:
      "Focus on Python, NumPy, Pandas, cleaning, EDA, visualization and statistical analysis.",
  },
  {
    value: "ai-engineer",
    title: "AI Engineer",
    description:
      "Build strong machine-learning foundations before progressing into broader AI systems.",
  },
  {
    value: "deep-learning",
    title: "Deep Learning",
    description:
      "Build the Python, mathematics and ML foundations required before studying neural networks deeply.",
  },
  {
    value: "placement",
    title: "Placement Preparation",
    description:
      "Strengthen ML theory, implementation, interview concepts, evaluation and project confidence.",
  },
  {
    value: "hackathon",
    title: "Hackathon",
    description:
      "Prioritize practical preprocessing, model building, evaluation and rapid end-to-end experimentation.",
  },
  {
    value: "project",
    title: "Build Projects",
    description:
      "Learn concepts through practical workflows and progressively more complete machine-learning projects.",
  },
  {
    value: "custom",
    title: "Custom Goal",
    description:
      "Describe your own objective and let ModelMind personalize the learning path around it.",
  },
];


const levelOptions: LevelOption[] = [
  {
    value: "beginner",
    title: "Beginner",
    description:
      "I am starting ML and need concepts explained from the foundations.",
  },
  {
    value: "intermediate",
    title: "Intermediate",
    description:
      "I understand the basics and want stronger implementation, evaluation and practical ML skills.",
  },
  {
    value: "advanced",
    title: "Advanced",
    description:
      "I understand core ML and want advanced workflows, tuning, ensembles and interpretability.",
  },
];


const knowledgeOptions: KnowledgeOption[] = [
  {
    value: "none",
    title: "New",
    description:
      "I have little or no experience yet.",
  },
  {
    value: "basic",
    title: "Basic",
    description:
      "I understand introductory concepts but still need guidance.",
  },
  {
    value: "intermediate",
    title: "Intermediate",
    description:
      "I can work independently with common concepts.",
  },
  {
    value: "advanced",
    title: "Advanced",
    description:
      "I am comfortable with deeper concepts and practical applications.",
  },
];


const priorityOptions: PriorityOption[] = [
  {
    value: "python",
    title: "Python",
    description:
      "Python fundamentals and programming confidence.",
  },
  {
    value: "data-analysis",
    title: "Data Analysis & EDA",
    description:
      "Pandas, cleaning, exploration and data understanding.",
  },
  {
    value: "mathematics",
    title: "Math & Statistics",
    description:
      "Statistics and mathematical intuition behind ML.",
  },
  {
    value: "ml-models",
    title: "ML Models",
    description:
      "Understand and implement important machine-learning algorithms.",
  },
  {
    value: "preprocessing",
    title: "Preprocessing",
    description:
      "Missing values, scaling, encoding, features and pipelines.",
  },
  {
    value: "visualization",
    title: "Visualization",
    description:
      "Learn concepts through interactive and data visualizations.",
  },
  {
    value: "evaluation",
    title: "Model Evaluation",
    description:
      "Metrics, validation, tuning and model-selection skills.",
  },
  {
    value: "projects",
    title: "Projects",
    description:
      "Emphasize practical end-to-end ML work.",
  },
  {
    value: "advanced-ml",
    title: "Advanced ML",
    description:
      "Ensembles, XGBoost, interpretability and advanced workflows.",
  },
];


export default function RoadmapOnboarding({
  onComplete,
}: RoadmapOnboardingProps) {
  const [step, setStep] =
    useState(1);

  const [goal, setGoal] =
    useState<RoadmapGoal>(
      "college"
    );

  const [level, setLevel] =
    useState<LearningLevel>(
      "beginner"
    );

  const [pythonLevel, setPythonLevel] =
    useState<KnowledgeLevel>(
      "basic"
    );

  const [mathLevel, setMathLevel] =
    useState<KnowledgeLevel>(
      "basic"
    );

  const [mlLevel, setMlLevel] =
    useState<KnowledgeLevel>(
      "none"
    );

  const [priorities, setPriorities] =
    useState<LearningPriority[]>([
      "ml-models",
      "preprocessing",
    ]);

  const [
    durationWeeks,
    setDurationWeeks,
  ] = useState(8);

  const [
    minutesPerDay,
    setMinutesPerDay,
  ] = useState(60);

  const [
    customGoal,
    setCustomGoal,
  ] = useState("");


  const TOTAL_STEPS = 5;


  function goNext() {
    setStep((current) =>
      Math.min(
        current + 1,
        TOTAL_STEPS
      )
    );
  }


  function goBack() {
    setStep((current) =>
      Math.max(
        current - 1,
        1
      )
    );
  }


  function togglePriority(
    priority: LearningPriority
  ) {
    setPriorities(
      (current) => {
        if (
          current.includes(
            priority
          )
        ) {
          return current.filter(
            (item) =>
              item !== priority
          );
        }

        return [
          ...current,
          priority,
        ];
      }
    );
  }


  function createProfile() {
    if (
      goal === "custom" &&
      !customGoal.trim()
    ) {
      return;
    }

    const profile: RoadmapProfile = {
      goal,
      level,

      pythonLevel,
      mathLevel,
      mlLevel,

      priorities,

      durationWeeks,
      minutesPerDay,

      customGoal:
        goal === "custom"
          ? customGoal.trim()
          : undefined,
    };

    onComplete(profile);
  }


  function renderKnowledgeSelector(
    title: string,
    description: string,
    value: KnowledgeLevel,
    onChange: (
      level: KnowledgeLevel
    ) => void
  ) {
    return (
      <div className="roadmap-knowledge-section">
        <div className="roadmap-knowledge-heading">
          <h3>
            {title}
          </h3>

          <p>
            {description}
          </p>
        </div>

        <div className="roadmap-level-grid">
          {knowledgeOptions.map(
            (option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  "roadmap-option-card",
                  value ===
                  option.value
                    ? "selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onChange(
                    option.value
                  )
                }
              >
                <h3>
                  {option.title}
                </h3>

                <p>
                  {
                    option.description
                  }
                </p>

                <span>
                  {value ===
                  option.value
                    ? "Selected"
                    : "Choose"}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    );
  }


  return (
    <main className="roadmap-onboarding">
      <header className="roadmap-onboarding-header">
        <p className="roadmap-eyebrow">
          PERSONALIZED ROADMAP
        </p>

        <h1>
          Build your ML learning path
        </h1>

        <p>
          Tell ModelMind what you already
          know, what you want to achieve
          and what you want to focus on.
          Your diagnostic assessment will
          refine the roadmap further.
        </p>

        <div className="roadmap-step-indicator">
          {Array.from(
            {
              length:
                TOTAL_STEPS,
            },
            (_, index) => {
              const number =
                index + 1;

              return (
                <div
                  key={
                    number
                  }
                  className="roadmap-step-indicator-item"
                >
                  <span
                    className={
                      step >=
                      number
                        ? "active"
                        : ""
                    }
                  >
                    {number}
                  </span>

                  {number <
                    TOTAL_STEPS && (
                    <div />
                  )}
                </div>
              );
            }
          )}
        </div>
      </header>


      {/* ================================================= */}
      {/* STEP 1 - GOAL */}
      {/* ================================================= */}

      {step === 1 && (
        <section className="roadmap-onboarding-step">
          <div className="roadmap-step-heading">
            <span>
              STEP 1 OF 5
            </span>

            <h2>
              What do you want to achieve?
            </h2>

            <p>
              Your goal determines which
              parts of machine learning
              receive the greatest emphasis.
            </p>
          </div>

          <div className="roadmap-option-grid">
            {goalOptions.map(
              (option) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  className={[
                    "roadmap-option-card",
                    goal ===
                    option.value
                      ? "selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setGoal(
                      option.value
                    )
                  }
                >
                  <h3>
                    {
                      option.title
                    }
                  </h3>

                  <p>
                    {
                      option.description
                    }
                  </p>

                  <span>
                    {goal ===
                    option.value
                      ? "Selected"
                      : "Choose"}
                  </span>
                </button>
              )
            )}
          </div>

          {goal ===
            "custom" && (
            <div className="roadmap-custom-goal">
              <label htmlFor="custom-roadmap-goal">
                Describe your goal
              </label>

              <textarea
                id="custom-roadmap-goal"
                value={
                  customGoal
                }
                onChange={(
                  event
                ) =>
                  setCustomGoal(
                    event.target
                      .value
                  )
                }
                placeholder="Example: I want to build enough ML knowledge to create an end-to-end healthcare prediction project."
                rows={4}
              />
            </div>
          )}

          <div className="roadmap-onboarding-actions">
            <button
              type="button"
              className="roadmap-primary-button"
              disabled={
                goal ===
                  "custom" &&
                !customGoal.trim()
              }
              onClick={
                goNext
              }
            >
              Continue
            </button>
          </div>
        </section>
      )}


      {/* ================================================= */}
      {/* STEP 2 - OVERALL LEVEL */}
      {/* ================================================= */}

      {step === 2 && (
        <section className="roadmap-onboarding-step">
          <div className="roadmap-step-heading">
            <span>
              STEP 2 OF 5
            </span>

            <h2>
              What is your overall level?
            </h2>

            <p>
              Choose the option that best
              describes your current ML
              learning stage.
            </p>
          </div>

          <div className="roadmap-level-grid">
            {levelOptions.map(
              (option) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  className={[
                    "roadmap-option-card",
                    level ===
                    option.value
                      ? "selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setLevel(
                      option.value
                    )
                  }
                >
                  <h3>
                    {
                      option.title
                    }
                  </h3>

                  <p>
                    {
                      option.description
                    }
                  </p>

                  <span>
                    {level ===
                    option.value
                      ? "Selected"
                      : "Choose"}
                  </span>
                </button>
              )
            )}
          </div>

          <div className="roadmap-onboarding-actions">
            <button
              type="button"
              className="roadmap-secondary-button"
              onClick={
                goBack
              }
            >
              Back
            </button>

            <button
              type="button"
              className="roadmap-primary-button"
              onClick={
                goNext
              }
            >
              Continue
            </button>
          </div>
        </section>
      )}


      {/* ================================================= */}
      {/* STEP 3 - KNOWLEDGE PROFILE */}
      {/* ================================================= */}

      {step === 3 && (
        <section className="roadmap-onboarding-step">
          <div className="roadmap-step-heading">
            <span>
              STEP 3 OF 5
            </span>

            <h2>
              Tell us what you already know
            </h2>

            <p>
              These separate skill levels
              help ModelMind avoid treating
              all learners at the same
              overall level identically.
            </p>
          </div>

          {renderKnowledgeSelector(
            "Python",
            "How comfortable are you with Python programming?",
            pythonLevel,
            setPythonLevel
          )}

          {renderKnowledgeSelector(
            "Math & Statistics",
            "How comfortable are you with statistics and mathematical concepts used in ML?",
            mathLevel,
            setMathLevel
          )}

          {renderKnowledgeSelector(
            "Machine Learning",
            "How comfortable are you with ML concepts, models and evaluation?",
            mlLevel,
            setMlLevel
          )}

          <div className="roadmap-onboarding-actions">
            <button
              type="button"
              className="roadmap-secondary-button"
              onClick={
                goBack
              }
            >
              Back
            </button>

            <button
              type="button"
              className="roadmap-primary-button"
              onClick={
                goNext
              }
            >
              Continue
            </button>
          </div>
        </section>
      )}


      {/* ================================================= */}
      {/* STEP 4 - PRIORITIES */}
      {/* ================================================= */}

      {step === 4 && (
        <section className="roadmap-onboarding-step">
          <div className="roadmap-step-heading">
            <span>
              STEP 4 OF 5
            </span>

            <h2>
              What do you want to focus on?
            </h2>

            <p>
              Choose any areas you want
              ModelMind to emphasize in
              addition to your main goal.
            </p>
          </div>

          <div className="roadmap-option-grid">
            {priorityOptions.map(
              (option) => {
                const selected =
                  priorities.includes(
                    option.value
                  );

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    className={[
                      "roadmap-option-card",
                      selected
                        ? "selected"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(" ")}
                    onClick={() =>
                      togglePriority(
                        option.value
                      )
                    }
                  >
                    <h3>
                      {
                        option.title
                      }
                    </h3>

                    <p>
                      {
                        option.description
                      }
                    </p>

                    <span>
                      {selected
                        ? "Selected"
                        : "Add priority"}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div className="roadmap-onboarding-actions">
            <button
              type="button"
              className="roadmap-secondary-button"
              onClick={
                goBack
              }
            >
              Back
            </button>

            <button
              type="button"
              className="roadmap-primary-button"
              onClick={
                goNext
              }
            >
              Continue
            </button>
          </div>
        </section>
      )}


      {/* ================================================= */}
      {/* STEP 5 - PACE + SUMMARY */}
      {/* ================================================= */}

      {step === 5 && (
        <section className="roadmap-onboarding-step">
          <div className="roadmap-step-heading">
            <span>
              STEP 5 OF 5
            </span>

            <h2>
              Choose your roadmap pace
            </h2>

            <p>
              Choose your target duration
              and learning intensity.
              ModelMind uses these values
              internally when balancing
              your roadmap.
            </p>
          </div>

          <div className="roadmap-pace-section">
            <div className="roadmap-field">
              <label htmlFor="roadmap-duration">
                Target duration
              </label>

              <select
                id="roadmap-duration"
                value={
                  durationWeeks
                }
                onChange={(
                  event
                ) =>
                  setDurationWeeks(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              >
                <option value={6}>
                  6 weeks
                </option>

                <option value={7}>
                  7 weeks
                </option>

                <option value={8}>
                  8 weeks
                </option>
              </select>
            </div>

            <div className="roadmap-field">
              <label htmlFor="roadmap-pace">
                Learning pace
              </label>

              <select
                id="roadmap-pace"
                value={
                  minutesPerDay
                }
                onChange={(
                  event
                ) =>
                  setMinutesPerDay(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              >
                <option value={45}>
                  Light
                </option>

                <option value={60}>
                  Balanced
                </option>

                <option value={90}>
                  Focused
                </option>

                <option value={120}>
                  Intensive
                </option>
              </select>

              <p className="roadmap-field-help">
                Learning pace is used
                internally for workload
                balancing. Your roadmap
                remains organized by days
                rather than displaying
                study minutes everywhere.
              </p>
            </div>
          </div>

          <div className="roadmap-profile-summary">
            <span>
              YOUR PERSONALIZED PLAN
            </span>

            <h3>
              {
                goalOptions.find(
                  (option) =>
                    option.value ===
                    goal
                )?.title
              }
            </h3>

            <p>
              {
                levelOptions.find(
                  (option) =>
                    option.value ===
                    level
                )?.title
              }{" "}
              learning path -{" "}
              {durationWeeks}-week
              target
            </p>

            <div className="roadmap-profile-summary-grid">
              <div>
                <strong>
                  Python
                </strong>

                <span>
                  {
                    pythonLevel
                  }
                </span>
              </div>

              <div>
                <strong>
                  Math & Statistics
                </strong>

                <span>
                  {
                    mathLevel
                  }
                </span>
              </div>

              <div>
                <strong>
                  Machine Learning
                </strong>

                <span>
                  {
                    mlLevel
                  }
                </span>
              </div>
            </div>

            {priorities.length >
              0 && (
              <div className="roadmap-profile-priorities">
                <strong>
                  Priorities
                </strong>

                <p>
                  {priorities
                    .map(
                      (
                        priority
                      ) =>
                        priorityOptions.find(
                          (
                            option
                          ) =>
                            option.value ===
                            priority
                        )?.title ??
                        priority
                    )
                    .join(", ")}
                </p>
              </div>
            )}

            {goal ===
              "custom" &&
              customGoal && (
                <p>
                  {customGoal}
                </p>
              )}
          </div>

          <div className="roadmap-onboarding-actions">
            <button
              type="button"
              className="roadmap-secondary-button"
              onClick={
                goBack
              }
            >
              Back
            </button>

            <button
              type="button"
              className="roadmap-primary-button"
              onClick={
                createProfile
              }
            >
              Continue to Assessment
            </button>
          </div>
        </section>
      )}
    </main>
  );
}