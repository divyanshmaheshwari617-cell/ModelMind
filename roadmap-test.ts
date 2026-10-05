import {
  createPersonalizedRoadmap,
} from "./lib/roadmap/roadmapEngine";

import type {
  ActivityType,
  KnowledgeLevel,
  LearningLevel,
  LearningPriority,
  PersonalizedRoadmapData,
  RoadmapGoal,
  RoadmapProfile,
} from "./types/roadmap";


// =========================================================
// MODELMIND PERSONALISED ROADMAP
// AUTOMATED QA SUITE
// =========================================================
//
// Tests:
//
// 1. Every core profile combination
// 2. Every goal
// 3. Every overall level
// 4. Every Python knowledge level
// 5. Every Math knowledge level
// 6. Every ML knowledge level
// 7. Every individual priority
// 8. Multiple-priority combinations
// 9. Workload variations
// 10. Duration variations
// 11. Roadmap structural integrity
// 12. Week / Day / Topic integrity
// 13. Activity integrity
// 14. Assignment integrity
// 15. Quiz integrity
// 16. Revision-day integrity
// 17. Duplicate ID detection
// 18. Personalization sensitivity
// 19. Strong-skill skipping
// 20. Weak-skill revision
// 21. Completed-skill skipping
//
// IMPORTANT:
//
// Model Labs are NOT integrated here.
// This test only verifies roadmap generation.
// =========================================================


// =========================================================
// TEST VALUES
// =========================================================

const GOALS: RoadmapGoal[] = [
  "college",
  "ml-engineer",
  "data-scientist",
  "data-analyst",
  "ai-engineer",
  "deep-learning",
  "placement",
  "hackathon",
  "project",
  "custom",
];


const LEVELS: LearningLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];


const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  "none",
  "basic",
  "intermediate",
  "advanced",
];


const PRIORITIES: LearningPriority[] = [
  "python",
  "data-analysis",
  "mathematics",
  "ml-models",
  "preprocessing",
  "visualization",
  "evaluation",
  "projects",
  "advanced-ml",
];


const VALID_ACTIVITY_TYPES: ActivityType[] = [
  "concept",
  "visualization",
  "coding",
  "practice",
  "assignment",
  "quiz",
  "revision",
  "project",
];


// =========================================================
// QA COUNTERS
// =========================================================

let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

let generatedProfiles = 0;
let generationFailures = 0;

const failureMessages: string[] = [];
const warningMessages: string[] = [];


// =========================================================
// ASSERTION HELPERS
// =========================================================

function pass(): void {
  passedChecks += 1;
}


function fail(
  message: string
): void {
  failedChecks += 1;

  if (
    failureMessages.length < 100
  ) {
    failureMessages.push(message);
  }
}


function warn(
  message: string
): void {
  warnings += 1;

  if (
    warningMessages.length < 100
  ) {
    warningMessages.push(message);
  }
}


function assert(
  condition: boolean,
  message: string
): void {
  if (condition) {
    pass();
  } else {
    fail(message);
  }
}


// =========================================================
// PROFILE LABEL
// =========================================================

function profileLabel(
  profile: RoadmapProfile
): string {
  return [
    profile.goal,
    profile.level,
    `python=${profile.pythonLevel}`,
    `math=${profile.mathLevel}`,
    `ml=${profile.mlLevel}`,
    `priority=${
      profile.priorities.join(",") ||
      "none"
    }`,
    `${profile.minutesPerDay}min`,
    `${profile.durationWeeks}weeks`,
  ].join(" | ");
}


// =========================================================
// GET ALL DAYS
// =========================================================

function getAllDays(
  roadmap: PersonalizedRoadmapData
) {
  return roadmap.weeks.flatMap(
    (week) => week.days
  );
}


// =========================================================
// GET LEARNING DAYS
// =========================================================

function getLearningDays(
  roadmap: PersonalizedRoadmapData
) {
  return getAllDays(
    roadmap
  ).filter(
    (day) =>
      !day.isRevisionDay
  );
}


// =========================================================
// GET ALL TOPICS
// =========================================================

function getAllTopics(
  roadmap: PersonalizedRoadmapData
) {
  return getAllDays(
    roadmap
  ).flatMap(
    (day) => day.topics
  );
}


// =========================================================
// CORE ROADMAP STRUCTURAL VALIDATION
// =========================================================

function validateRoadmapStructure(
  roadmap: PersonalizedRoadmapData,
  profile: RoadmapProfile
): void {
  const label =
    profileLabel(profile);

  assert(
    roadmap.id.trim().length > 0,
    `${label}: roadmap ID is empty`
  );

  assert(
    roadmap.name.trim().length > 0,
    `${label}: roadmap name is empty`
  );

  assert(
    roadmap.weeks.length > 0,
    `${label}: roadmap has no weeks`
  );

  assert(
    roadmap.totalDays > 0,
    `${label}: roadmap has no days`
  );

  assert(
    roadmap.currentDay >= 1,
    `${label}: invalid current day`
  );

  assert(
    roadmap.overallProgress === 0,
    `${label}: new roadmap progress should start at 0`
  );

  assert(
    roadmap.profile.goal ===
      profile.goal,
    `${label}: goal was not preserved`
  );

  assert(
    roadmap.profile.level ===
      profile.level,
    `${label}: level was not preserved`
  );

  assert(
    roadmap.profile.pythonLevel ===
      profile.pythonLevel,
    `${label}: Python level was not preserved`
  );

  assert(
    roadmap.profile.mathLevel ===
      profile.mathLevel,
    `${label}: Math level was not preserved`
  );

  assert(
    roadmap.profile.mlLevel ===
      profile.mlLevel,
    `${label}: ML level was not preserved`
  );

  assert(
    roadmap.profile.minutesPerDay ===
      profile.minutesPerDay,
    `${label}: minutes/day was not preserved`
  );

  assert(
    roadmap.profile.durationWeeks ===
      profile.durationWeeks,
    `${label}: duration was not preserved`
  );


  const days =
    getAllDays(roadmap);

  assert(
    roadmap.totalDays ===
      days.length,
    `${label}: totalDays does not match actual day count`
  );


  const dayNumbers =
    days.map(
      (day) => day.dayNumber
    );

  const uniqueDayNumbers =
    new Set(dayNumbers);

  assert(
    uniqueDayNumbers.size ===
      dayNumbers.length,
    `${label}: duplicate day numbers detected`
  );


  for (
    let index = 0;
    index < dayNumbers.length;
    index += 1
  ) {
    assert(
      dayNumbers[index] ===
        index + 1,
      `${label}: day numbering is not sequential at index ${index}`
    );
  }
}


// =========================================================
// WEEK VALIDATION
// =========================================================

function validateWeeks(
  roadmap: PersonalizedRoadmapData,
  profile: RoadmapProfile
): void {
  const label =
    profileLabel(profile);

  const weekIds = new Set<string>();


  roadmap.weeks.forEach(
    (week, index) => {
      assert(
        week.id.trim().length > 0,
        `${label}: Week ${index + 1} has empty ID`
      );

      assert(
        !weekIds.has(week.id),
        `${label}: duplicate week ID ${week.id}`
      );

      weekIds.add(week.id);


      assert(
        week.weekNumber ===
          index + 1,
        `${label}: invalid week numbering`
      );


      assert(
        week.title.trim().length > 0,
        `${label}: Week ${week.weekNumber} has empty title`
      );


      assert(
        week.days.length > 0,
        `${label}: Week ${week.weekNumber} is empty`
      );


      const learningDays =
        week.days.filter(
          (day) =>
            !day.isRevisionDay
        );


      assert(
        learningDays.length > 0,
        `${label}: Week ${week.weekNumber} contains no learning days`
      );


      assert(
        learningDays.length <= 6,
        `${label}: Week ${week.weekNumber} contains more than 6 learning days`
      );


      const reviewDays =
        week.days.filter(
          (day) =>
            day.isRevisionDay
        );


      assert(
        reviewDays.length >= 1,
        `${label}: Week ${week.weekNumber} has no review day`
      );
    }
  );
}


// =========================================================
// DAY VALIDATION
// =========================================================

function validateDays(
  roadmap: PersonalizedRoadmapData,
  profile: RoadmapProfile
): void {
  const label =
    profileLabel(profile);

  const days =
    getAllDays(roadmap);

  const dayIds =
    new Set<string>();


  for (const day of days) {
    assert(
      day.id.trim().length > 0,
      `${label}: Day ${day.dayNumber} has empty ID`
    );


    assert(
      !dayIds.has(day.id),
      `${label}: duplicate day ID ${day.id}`
    );

    dayIds.add(day.id);


    assert(
      day.title.trim().length > 0,
      `${label}: Day ${day.dayNumber} has empty title`
    );


    assert(
      day.topics.length > 0,
      `${label}: Day ${day.dayNumber} has no topics`
    );


    assert(
      day.estimatedMinutes > 0,
      `${label}: Day ${day.dayNumber} has invalid estimated minutes`
    );


    if (!day.isRevisionDay) {
      assert(
        day.topics.length === 1,
        `${label}: learning Day ${day.dayNumber} should contain exactly one primary topic`
      );
    }


    if (day.isRevisionDay) {
      const revisionActivity =
        day.topics.some(
          (topic) =>
            topic.activities.some(
              (activity) =>
                activity.type ===
                "revision"
            )
        );


      assert(
        revisionActivity,
        `${label}: revision Day ${day.dayNumber} has no revision activity`
      );
    }


    if (day.assignment) {
      assert(
        day.assignment.id.trim()
          .length > 0,
        `${label}: Day ${day.dayNumber} assignment has empty ID`
      );


      assert(
        day.assignment.title.trim()
          .length > 0,
        `${label}: Day ${day.dayNumber} assignment has empty title`
      );


      assert(
        day.assignment.topicIds
          .length > 0,
        `${label}: Day ${day.dayNumber} assignment has no topic references`
      );
    }


    if (day.quiz) {
      assert(
        day.quiz.id.trim()
          .length > 0,
        `${label}: Day ${day.dayNumber} quiz has empty ID`
      );


      assert(
        day.quiz.questions.length >
          0,
        `${label}: Day ${day.dayNumber} quiz contains no questions`
      );


      for (
        const question
        of day.quiz.questions
      ) {
        assert(
          question.options.length >
            1,
          `${label}: quiz question ${question.id} has insufficient options`
        );


        assert(
          question.correctAnswer >=
            0 &&
            question.correctAnswer <
              question.options.length,
          `${label}: quiz question ${question.id} has invalid correctAnswer`
        );
      }
    }
  }
}


// =========================================================
// TOPIC + ACTIVITY VALIDATION
// =========================================================

function validateTopicsAndActivities(
  roadmap: PersonalizedRoadmapData,
  profile: RoadmapProfile
): void {
  const label =
    profileLabel(profile);

  const learningDays =
    getLearningDays(roadmap);

  const activityIds =
    new Set<string>();


  for (
    const day
    of learningDays
  ) {
    for (
      const topic
      of day.topics
    ) {
      assert(
        topic.id.trim().length > 0,
        `${label}: empty topic ID on Day ${day.dayNumber}`
      );


      assert(
        topic.title.trim().length >
          0,
        `${label}: ${topic.id} has empty title`
      );


      assert(
        topic.activities.length > 0,
        `${label}: ${topic.id} has no activities`
      );


      assert(
        topic.estimatedMinutes > 0,
        `${label}: ${topic.id} has invalid estimated minutes`
      );


      const types =
        topic.activities.map(
          (activity) =>
            activity.type
        );


      for (
        const requiredType
        of [
          "concept",
          "visualization",
          "coding",
          "practice",
        ] as ActivityType[]
      ) {
        assert(
          types.includes(
            requiredType
          ),
          `${label}: ${topic.id} missing ${requiredType} activity`
        );
      }


      for (
        const activity
        of topic.activities
      ) {
        assert(
          activity.id.trim()
            .length > 0,
          `${label}: ${topic.id} contains activity with empty ID`
        );


        assert(
          !activityIds.has(
            activity.id
          ),
          `${label}: duplicate activity ID ${activity.id}`
        );

        activityIds.add(
          activity.id
        );


        assert(
          VALID_ACTIVITY_TYPES.includes(
            activity.type
          ),
          `${label}: invalid activity type ${activity.type}`
        );


        assert(
          activity.title.trim()
            .length > 0,
          `${label}: ${activity.id} has empty title`
        );


        assert(
          activity.estimatedMinutes >
            0,
          `${label}: ${activity.id} has invalid estimated minutes`
        );


        assert(
          activity.completed ===
            false,
          `${label}: new activity ${activity.id} should not start completed`
        );
      }
    }
  }
}


// =========================================================
// GENERATION RESULT VALIDATION
// =========================================================

function validateGenerationResult(
  result:
    ReturnType<
      typeof createPersonalizedRoadmap
    >,
  profile: RoadmapProfile
): void {
  const label =
    profileLabel(profile);


  assert(
    result.generation
      .includedSkillIds.length > 0,
    `${label}: no included skills`
  );


  const included =
    new Set(
      result.generation
        .includedSkillIds
    );


  assert(
    included.size ===
      result.generation
        .includedSkillIds.length,
    `${label}: duplicate included skill IDs`
  );


  const skipped =
    new Set(
      result.generation
        .skippedSkillIds
    );


  for (
    const skillId
    of skipped
  ) {
    assert(
      !included.has(skillId),
      `${label}: ${skillId} is both included and skipped`
    );
  }


  for (
    const skillId
    of result.generation
      .revisionSkillIds
  ) {
    assert(
      included.has(skillId),
      `${label}: revision skill ${skillId} is not included`
    );
  }


  assert(
    result.generation.workload
      .requestedMinutes ===
      profile.minutesPerDay *
        7 *
        profile.durationWeeks,
    `${label}: requested workload calculation is incorrect`
  );


  assert(
    result.generation.workload
      .estimatedCurriculumMinutes >
      0,
    `${label}: estimated curriculum minutes must be positive`
  );


  assert(
    result.generation.workload
      .recommendedMinutesPerDay >
      0,
    `${label}: recommended minutes/day invalid`
  );


  assert(
    result.generation.workload
      .recommendedWeeks > 0,
    `${label}: recommended weeks invalid`
  );
}


// =========================================================
// COMPLETE PROFILE VALIDATION
// =========================================================

function validateGeneratedProfile(
  profile: RoadmapProfile
): ReturnType<
  typeof createPersonalizedRoadmap
> | null {
  try {
    const result =
      createPersonalizedRoadmap(
        profile
      );

    generatedProfiles += 1;

    validateRoadmapStructure(
      result.roadmap,
      profile
    );

    validateWeeks(
      result.roadmap,
      profile
    );

    validateDays(
      result.roadmap,
      profile
    );

    validateTopicsAndActivities(
      result.roadmap,
      profile
    );

    validateGenerationResult(
      result,
      profile
    );

    return result;
  } catch (error) {
    generationFailures += 1;

    fail(
      `${profileLabel(
        profile
      )}: generation threw ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );

    return null;
  }
}


// =========================================================
// TEST 1
// EXHAUSTIVE CORE MATRIX
//
// 10 goals
// × 3 overall levels
// × 4 Python levels
// × 4 Math levels
// × 4 ML levels
//
// = 1,920 combinations
// =========================================================

console.log(
  "\nMODELMIND ROADMAP AUTOMATED QA"
);

console.log(
  "========================================"
);

console.log(
  "\n[1/8] Testing 1,920 core personalization combinations..."
);


for (
  const goal
  of GOALS
) {
  for (
    const level
    of LEVELS
  ) {
    for (
      const pythonLevel
      of KNOWLEDGE_LEVELS
    ) {
      for (
        const mathLevel
        of KNOWLEDGE_LEVELS
      ) {
        for (
          const mlLevel
          of KNOWLEDGE_LEVELS
        ) {
          const profile:
            RoadmapProfile = {
              goal,

              level,

              pythonLevel,

              mathLevel,

              mlLevel,

              priorities: [],

              minutesPerDay: 60,

              durationWeeks: 8,

              ...(goal === "custom"
                ? {
                    customGoal:
                      "Custom Machine Learning Goal",
                  }
                : {}),
            };


          validateGeneratedProfile(
            profile
          );
        }
      }
    }
  }
}


console.log(
  `✓ Core matrix completed: ${generatedProfiles} profiles generated`
);


// =========================================================
// TEST 2
// EVERY PRIORITY INDIVIDUALLY
// =========================================================

console.log(
  "\n[2/8] Testing all learning priorities..."
);


const priorityBaseProfile:
  RoadmapProfile = {
    goal: "ml-engineer",

    level: "intermediate",

    pythonLevel:
      "intermediate",

    mathLevel:
      "intermediate",

    mlLevel:
      "intermediate",

    priorities: [],

    minutesPerDay: 60,

    durationWeeks: 8,
  };


const priorityBaseline =
  createPersonalizedRoadmap(
    priorityBaseProfile
  );


for (
  const priority
  of PRIORITIES
) {
  const result =
    validateGeneratedProfile({
      ...priorityBaseProfile,

      priorities: [
        priority,
      ],
    });


  if (!result) {
    continue;
  }


  const baselineSkills =
    new Set(
      priorityBaseline.generation
        .includedSkillIds
    );


  const prioritySkills =
    result.generation
      .includedSkillIds;


  const addedSkills =
    prioritySkills.filter(
      (skillId) =>
        !baselineSkills.has(
          skillId
        )
    );


  if (
    addedSkills.length === 0
  ) {
    warn(
      `Priority "${priority}" produced no additional skill for the intermediate ML Engineer baseline. This may be valid if its skills were already present.`
    );
  } else {
    pass();
  }
}


console.log(
  "✓ Individual priority testing completed"
);


// =========================================================
// TEST 3
// MULTIPLE PRIORITIES
// =========================================================

console.log(
  "\n[3/8] Testing multi-priority profiles..."
);


const priorityCombinations:
  LearningPriority[][] = [
    [
      "python",
      "ml-models",
    ],

    [
      "preprocessing",
      "evaluation",
    ],

    [
      "projects",
      "advanced-ml",
    ],

    [
      "data-analysis",
      "visualization",
      "mathematics",
    ],

    [
      "python",
      "data-analysis",
      "mathematics",
      "ml-models",
      "preprocessing",
      "visualization",
      "evaluation",
      "projects",
      "advanced-ml",
    ],
  ];


for (
  const priorities
  of priorityCombinations
) {
  validateGeneratedProfile({
    ...priorityBaseProfile,

    priorities,
  });
}


console.log(
  "✓ Multi-priority testing completed"
);


// =========================================================
// TEST 4
// PERSONALIZATION SENSITIVITY
// =========================================================

console.log(
  "\n[4/8] Testing personalization sensitivity..."
);


function skillSignature(
  profile: RoadmapProfile
): string {
  const result =
    createPersonalizedRoadmap(
      profile
    );

  return result.generation
    .includedSkillIds
    .join("|");
}


const sensitivityBase:
  RoadmapProfile = {
    goal: "ml-engineer",

    level: "beginner",

    pythonLevel: "none",

    mathLevel: "none",

    mlLevel: "none",

    priorities: [],

    minutesPerDay: 60,

    durationWeeks: 8,
  };


// ---------------------------------------------------------
// Python sensitivity
// ---------------------------------------------------------

const pythonSignatures =
  KNOWLEDGE_LEVELS.map(
    (pythonLevel) =>
      skillSignature({
        ...sensitivityBase,

        pythonLevel,
      })
  );


assert(
  new Set(
    pythonSignatures
  ).size > 1,
  "Changing Python knowledge level never changes the generated skill path"
);


// ---------------------------------------------------------
// Math sensitivity
// ---------------------------------------------------------

const mathSignatures =
  KNOWLEDGE_LEVELS.map(
    (mathLevel) =>
      skillSignature({
        ...sensitivityBase,

        mathLevel,
      })
  );


assert(
  new Set(
    mathSignatures
  ).size > 1,
  "Changing Math knowledge level never changes the generated skill path"
);


// ---------------------------------------------------------
// ML sensitivity
// ---------------------------------------------------------

const mlSignatures =
  KNOWLEDGE_LEVELS.map(
    (mlLevel) =>
      skillSignature({
        ...sensitivityBase,

        mlLevel,
      })
  );


assert(
  new Set(
    mlSignatures
  ).size > 1,
  "Changing ML knowledge level never changes the generated skill path"
);


// ---------------------------------------------------------
// Overall level sensitivity
// ---------------------------------------------------------

const levelSignatures =
  LEVELS.map(
    (level) =>
      skillSignature({
        ...sensitivityBase,

        level,
      })
  );


assert(
  new Set(
    levelSignatures
  ).size > 1,
  "Changing overall learner level never changes the generated skill path"
);


// ---------------------------------------------------------
// Goal sensitivity
// ---------------------------------------------------------

const goalSignatures =
  GOALS.map(
    (goal) =>
      skillSignature({
        ...sensitivityBase,

        goal,

        ...(goal === "custom"
          ? {
              customGoal:
                "Custom Machine Learning Goal",
            }
          : {}),
      })
  );


assert(
  new Set(
    goalSignatures
  ).size > 1,
  "Changing learning goal never changes the generated skill path"
);


console.log(
  "✓ Personalization sensitivity completed"
);


// =========================================================
// TEST 5
// EXPECTED KNOWLEDGE DIFFERENCES
// =========================================================

console.log(
  "\n[5/8] Testing expected level-specific curriculum..."
);


function hasSkill(
  profile: RoadmapProfile,
  skillId: string
): boolean {
  return createPersonalizedRoadmap(
    profile
  ).generation.includedSkillIds
    .includes(skillId);
}


const beginnerProfile:
  RoadmapProfile = {
    goal: "college",

    level: "beginner",

    pythonLevel: "none",

    mathLevel: "none",

    mlLevel: "none",

    priorities: [
      "python",
      "ml-models",
    ],

    minutesPerDay: 60,

    durationWeeks: 8,
  };


assert(
  hasSkill(
    beginnerProfile,
    "python-basics"
  ),
  "Beginner with Python=None does not receive python-basics"
);


assert(
  hasSkill(
    beginnerProfile,
    "ml-foundations"
  ),
  "Beginner with ML=None does not receive ml-foundations"
);


assert(
  hasSkill(
    beginnerProfile,
    "linear-regression"
  ),
  "Beginner ML roadmap does not include linear-regression"
);


const advancedProfile:
  RoadmapProfile = {
    goal: "ml-engineer",

    level: "advanced",

    pythonLevel: "advanced",

    mathLevel: "advanced",

    mlLevel: "advanced",

    priorities: [
      "advanced-ml",
      "evaluation",
      "projects",
    ],

    minutesPerDay: 90,

    durationWeeks: 8,
  };


const advancedResult =
  createPersonalizedRoadmap(
    advancedProfile
  );


const advancedSkills =
  new Set(
    advancedResult.generation
      .includedSkillIds
  );


const expectedAdvancedSkills = [
  "advanced-preprocessing",
  "pipeline-column-transformer",
  "feature-engineering",
  "pca",
  "ensemble-learning",
  "gradient-boosting",
  "xgboost",
  "cross-validation",
  "hyperparameter-tuning",
  "model-selection",
  "model-interpretability",
  "complete-ml-workflow",
];


for (
  const skillId
  of expectedAdvancedSkills
) {
  assert(
    advancedSkills.has(
      skillId
    ),
    `Advanced ML Engineer missing expected skill: ${skillId}`
  );
}


console.log(
  "✓ Expected curriculum differences completed"
);


// =========================================================
// TEST 6
// SKIP + REVISION PERSONALIZATION
// =========================================================

console.log(
  "\n[6/8] Testing skip/revision evidence logic..."
);


const evidenceProfile:
  RoadmapProfile = {
    goal: "college",

    level: "beginner",

    pythonLevel: "basic",

    mathLevel: "basic",

    mlLevel: "basic",

    priorities: [
      "python",
      "ml-models",
    ],

    minutesPerDay: 60,

    durationWeeks: 8,
  };


// ---------------------------------------------------------
// Completed skill should be skipped
// ---------------------------------------------------------

const completedResult =
  createPersonalizedRoadmap(
    evidenceProfile,
    undefined,
    [],
    [
      "python-basics",
    ]
  );


assert(
  completedResult.generation
    .skippedSkillIds
    .includes(
      "python-basics"
    ),
  "Completed skill python-basics was not skipped"
);


assert(
  !completedResult.generation
    .includedSkillIds
    .includes(
      "python-basics"
    ),
  "Completed skill python-basics remained included"
);


// ---------------------------------------------------------
// Strong skill should be skipped through mastery evidence
// ---------------------------------------------------------

const strongAssessment = {
  skillId:
    "linear-regression",

  score: 95,

  mastery: {
    conceptScore: 95,
    codingScore: 95,
    assignmentScore: 95,
    quizScore: 95,
    debuggingScore: 95,
    overallScore: 95,
  },

  assessedAt:
    new Date().toISOString(),
};


const strongResult =
  createPersonalizedRoadmap(
    evidenceProfile,
    undefined,
    [
      strongAssessment,
    ]
  );


assert(
  strongResult.generation
    .skippedSkillIds
    .includes(
      "linear-regression"
    ),
  "Strong mastery skill linear-regression was not skipped"
);


// ---------------------------------------------------------
// Weak skill should become revision
// ---------------------------------------------------------

const weakAssessment = {
  skillId:
    "logistic-regression",

  score: 40,

  mastery: {
    conceptScore: 40,
    codingScore: 40,
    assignmentScore: 40,
    quizScore: 40,
    debuggingScore: 40,
    overallScore: 40,
  },

  assessedAt:
    new Date().toISOString(),
};


const weakResult =
  createPersonalizedRoadmap(
    evidenceProfile,
    undefined,
    [
      weakAssessment,
    ]
  );


assert(
  weakResult.generation
    .revisionSkillIds
    .includes(
      "logistic-regression"
    ),
  "Weak mastery skill logistic-regression was not marked for revision"
);


const weakTopic =
  getAllDays(
    weakResult.roadmap
  )
    .flatMap(
      (day) =>
        day.topics
    )
    .find(
      (topic) =>
        topic.id ===
        "logistic-regression"
    );


assert(
  Boolean(
    weakTopic?.activities.some(
      (activity) =>
        activity.type ===
        "revision"
    )
  ),
  "Weak logistic-regression topic has no revision activity"
);


console.log(
  "✓ Skip/revision evidence testing completed"
);


// =========================================================
// TEST 7
// WORKLOAD + DURATION
// =========================================================

console.log(
  "\n[7/8] Testing workload and duration boundaries..."
);


const timeValues = [
  15,
  30,
  60,
  90,
  120,
  180,
];


const durationValues = [
  1,
  4,
  6,
  8,
  12,
];


for (
  const minutesPerDay
  of timeValues
) {
  for (
    const durationWeeks
    of durationValues
  ) {
    const profile:
      RoadmapProfile = {
        goal:
          "ml-engineer",

        level:
          "intermediate",

        pythonLevel:
          "intermediate",

        mathLevel:
          "intermediate",

        mlLevel:
          "intermediate",

        priorities: [
          "evaluation",
        ],

        minutesPerDay,

        durationWeeks,
      };


    const result =
      validateGeneratedProfile(
        profile
      );


    if (!result) {
      continue;
    }


    assert(
      result.generation.workload
        .requestedMinutes ===
        minutesPerDay *
          7 *
          durationWeeks,
      `Incorrect workload capacity for ${minutesPerDay} min/day × ${durationWeeks} weeks`
    );


    if (
      result.generation.workload
        .realistic
    ) {
      assert(
        result.generation.workload
          .requestedMinutes >=
          result.generation.workload
            .estimatedCurriculumMinutes,
        "Workload marked realistic despite insufficient capacity"
      );
    } else {
      assert(
        result.generation.workload
          .requestedMinutes <
          result.generation.workload
            .estimatedCurriculumMinutes,
        "Workload marked unrealistic despite sufficient capacity"
      );
    }
  }
}


console.log(
  "✓ Workload/duration testing completed"
);


// =========================================================
// TEST 8
// FINAL CROSS-PROFILE SANITY
// =========================================================

console.log(
  "\n[8/8] Running final cross-profile sanity checks..."
);


const beginnerResult =
  createPersonalizedRoadmap(
    beginnerProfile
  );


const finalAdvancedResult =
  createPersonalizedRoadmap(
    advancedProfile
  );


assert(
  beginnerResult.generation
    .includedSkillIds.join("|") !==
    finalAdvancedResult.generation
      .includedSkillIds.join("|"),
  "Beginner College and Advanced ML Engineer generated identical skill paths"
);


assert(
  finalAdvancedResult.generation
    .includedSkillIds
    .includes("xgboost"),
  "Advanced ML Engineer path does not contain XGBoost"
);


assert(
  finalAdvancedResult.generation
    .includedSkillIds
    .includes(
      "hyperparameter-tuning"
    ),
  "Advanced ML Engineer path does not contain hyperparameter tuning"
);


assert(
  finalAdvancedResult.generation
    .includedSkillIds
    .includes(
      "model-interpretability"
    ),
  "Advanced ML Engineer path does not contain model interpretability"
);


console.log(
  "✓ Final sanity checks completed"
);


// =========================================================
// FINAL REPORT
// =========================================================

console.log(
  "\n========================================"
);

console.log(
  "MODELMIND ROADMAP QA REPORT"
);

console.log(
  "========================================"
);


console.log(
  `Profiles generated:     ${generatedProfiles}`
);

console.log(
  `Generation failures:    ${generationFailures}`
);

console.log(
  `Checks passed:          ${passedChecks}`
);

console.log(
  `Checks failed:          ${failedChecks}`
);

console.log(
  `Warnings:               ${warnings}`
);


// =========================================================
// FAILURE DETAILS
// =========================================================

if (
  failureMessages.length > 0
) {
  console.log(
    "\nFAILURES"
  );

  console.log(
    "----------------------------------------"
  );

  failureMessages.forEach(
    (
      message,
      index
    ) => {
      console.log(
        `${index + 1}. ${message}`
      );
    }
  );


  if (
    failedChecks >
    failureMessages.length
  ) {
    console.log(
      `...and ${
        failedChecks -
        failureMessages.length
      } additional failures.`
    );
  }
}


// =========================================================
// WARNING DETAILS
// =========================================================

if (
  warningMessages.length > 0
) {
  console.log(
    "\nWARNINGS"
  );

  console.log(
    "----------------------------------------"
  );

  warningMessages.forEach(
    (
      message,
      index
    ) => {
      console.log(
        `${index + 1}. ${message}`
      );
    }
  );


  if (
    warnings >
    warningMessages.length
  ) {
    console.log(
      `...and ${
        warnings -
        warningMessages.length
      } additional warnings.`
    );
  }
}


// =========================================================
// FINAL RESULT
// =========================================================

console.log(
  "\n========================================"
);


if (
  failedChecks === 0 &&
  generationFailures === 0
) {
  console.log(
    "FINAL RESULT: ✅ ROADMAP QA PASSED"
  );

  if (warnings > 0) {
    console.log(
      `QA passed with ${warnings} warning(s) requiring review.`
    );
  }
} else {
  console.log(
    "FINAL RESULT: ❌ ROADMAP QA FAILED"
  );

  console.log(
    "Fix the failures above before deployment."
  );
}


console.log(
  "========================================\n"
);


// =========================================================
// CI / TERMINAL EXIT CODE
// =========================================================

if (
  failedChecks > 0 ||
  generationFailures > 0
) {
  process.exitCode = 1;
}