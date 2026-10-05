import type {
  LessonContent,
  LessonPracticeProblem,
  PracticeDifficulty,
} from "../../../types/roadmap";

import {
  curriculumSkills,
  type CurriculumSkill,
} from "../skills";

import {
  getDeepLessonContent,
} from "./content";


// =========================================================
// EXISTING MODELMIND MODEL LABS
// =========================================================
//
// IMPORTANT:
//
// These labs already exist in the main ModelMind project.
//
// Roadmap does NOT rebuild them.
//
// During final ModelMind integration we will connect these
// lesson visualization entries to their actual Model Lab
// routes/components.
// =========================================================

const MODEL_LAB_SKILLS = new Set([
  // Optimization / regression models
  "gradient-descent",
  "linear-regression",
  "polynomial-regression",
  "regularization",

  // Classification models
  "logistic-regression",
  "knn",
  "naive-bayes",
  "decision-tree",
  "random-forest",
  "svm",

  // Unsupervised / dimensionality-reduction models
  "kmeans",
  "pca",

  // Ensemble models
  "ensemble-learning",
  "bagging",
  "boosting-foundations",
  "gradient-boosting",
  "xgboost",
  "voting-stacking",
]);


// =========================================================
// PRACTICE DIFFICULTY
// =========================================================

function getPracticeDifficulty(
  skill: CurriculumSkill
): PracticeDifficulty {
  if (skill.difficulty === "advanced") {
    return "advanced";
  }

  if (
    skill.difficulty ===
    "intermediate"
  ) {
    return "medium";
  }

  return "basic";
}


// =========================================================
// FALLBACK LESSON SECTIONS
// =========================================================
//
// These are only used when a topic does not yet have a
// dedicated deep-content pack.
//
// As we complete the curriculum, more and more skills will
// use their handcrafted content instead.
// =========================================================

function createFallbackSections(
  skill: CurriculumSkill
): LessonContent["sections"] {
  const concepts =
    skill.concepts.length > 0
      ? skill.concepts
      : [skill.name];

  return concepts.map(
    (concept, index) => ({
      id: `${skill.id}-section-${
        index + 1
      }`,

      title: concept,

      explanation: [
        `${concept} is one of the core ideas you need to understand in ${skill.name}.`,

        `The purpose of this section is to understand what ${concept} means, why it matters, when it is used, and how it connects with the broader ${skill.category.toLowerCase()} workflow.`,

        `Do not treat ${concept} as an isolated definition. Connect it with the input data, the operation being performed, and the result produced by that operation.`,

        `After learning the concept, you should be able to explain it without relying only on memorized syntax.`,
      ],

      intuition: [
        `Think of ${concept} as one component of the complete ${skill.name} workflow.`,

        `Understanding why this component exists makes it easier to decide when and how to use it in a real project.`,
      ],

      importantPoints: [
        `Understand the purpose of ${concept}.`,

        `Know where ${concept} appears in a practical workflow.`,

        `Understand its input and expected output.`,

        `Recognize common situations where ${concept} may be used incorrectly.`,

        `Practice applying the concept instead of memorizing its name.`,
      ],
    })
  );
}


// =========================================================
// FALLBACK CODE
// =========================================================

function createFallbackCodeExamples(
  skill: CurriculumSkill
): LessonContent["codeExamples"] {
  const tools =
    skill.tools.length > 0
      ? skill.tools
      : ["Python"];

  const toolsText =
    tools.join(", ");

  return [
    {
      id: `${skill.id}-guided-code`,

      title:
        `${skill.name} Guided Example`,

      description:
        `A guided starting point for implementing ${skill.name}.`,

      language: "python",

      code:
`# ${skill.name}
# ModelMind guided implementation

# Important tools:
# ${toolsText}

# --------------------------------------------------
# 1. Understand the input
# --------------------------------------------------

# Identify the data or values required by this topic.


# --------------------------------------------------
# 2. Apply the concept
# --------------------------------------------------

# Implement ${skill.name} using the appropriate
# Python or machine-learning tools.


# --------------------------------------------------
# 3. Inspect the result
# --------------------------------------------------

# Never assume the operation worked correctly.
# Inspect intermediate and final outputs.

print("${skill.name} practice")`,

      explanation: [
        `This example provides the basic implementation structure for ${skill.name}.`,

        `Important tools associated with this topic include: ${toolsText}.`,

        `The first step should always be understanding the input rather than immediately writing syntax.`,

        `The implementation stage applies the concept using the appropriate tool.`,

        `The final stage inspects the result so that mistakes are discovered before the workflow continues.`,
      ],

      commonMistakes: [
        "Copying code without understanding what each operation does.",

        "Using a library function before understanding why the operation is required.",

        "Skipping intermediate output checks.",

        "Assuming code that executes without an exception is automatically correct.",
      ],
    },
  ];
}


// =========================================================
// FALLBACK PRACTICE
// =========================================================

function createFallbackPractice(
  skill: CurriculumSkill
): LessonPracticeProblem[] {
  const difficulty =
    getPracticeDifficulty(skill);

  const concepts =
    skill.concepts.slice(
      0,
      5
    );

  const practice:
    LessonPracticeProblem[] = [];

  practice.push({
    id: `${skill.id}-practice-1`,

    title:
      `Explain ${skill.name}`,

    type: "concept",

    difficulty,

    question:
      `Explain ${skill.name} in your own words. What problem does it solve and why is it useful?`,

    instructions: [
      "State the main purpose of the topic.",

      "Explain where it appears in a practical workflow.",

      "Give at least one realistic example.",

      "Avoid answering with only a memorized definition.",
    ],

    hints: [
      skill.description,

      `Think about how this topic connects to ${skill.category}.`,
    ],

    explanation:
      `A strong answer explains what ${skill.name} does, why it exists, where it belongs in a workflow and when it should be used.`,
  });


  if (
    concepts.length > 0
  ) {
    practice.push({
      id: `${skill.id}-practice-2`,

      title:
        "Connect the concepts",

      type: "analysis",

      difficulty,

      question:
        `Explain how these concepts work together inside ${skill.name}: ${concepts.join(
          ", "
        )}.`,

      instructions: [
        "Do not only define each term independently.",

        "Explain relationships between the concepts.",

        "Describe the order in which they may appear.",

        "Explain what information moves between the steps.",
      ],

      hints: [
        `Start with ${concepts[0]}.`,

        "Think about the input and output of each step.",
      ],

      explanation:
        `The goal is to understand ${skill.name} as a connected system rather than as isolated definitions.`,
    });
  }


  practice.push({
    id: `${skill.id}-practice-3`,

    title:
      "Practical decision",

    type: "analysis",

    difficulty,

    question:
      `Imagine you are using ${skill.name} in a real data or machine-learning project. What decisions should you make before applying it?`,

    instructions: [
      "Identify the required input.",

      "Explain at least two decisions you need to make.",

      "Identify one possible mistake.",

      "Explain how you would verify the result.",
    ],

    hints: [
      "Think about the objective before choosing a technique.",

      "Consider assumptions and invalid inputs.",
    ],

    explanation:
      "The goal is to move from remembering terminology to making practical decisions.",
  });


  practice.push({
    id: `${skill.id}-practice-4`,

    title:
      "Find the mistake",

    type: "analysis",

    difficulty,

    question:
      `Describe one realistic way a beginner could use ${skill.name} incorrectly and explain how you would correct the mistake.`,

    instructions: [
      "Give a specific mistake.",

      "Explain why it is incorrect.",

      "Give the corrected approach.",
    ],

    hints: [
      "Think about inputs, assumptions, data preparation or evaluation.",
    ],

    explanation:
      `Understanding failure cases is an important part of mastering ${skill.name}.`,
  });


  practice.push({
    id: `${skill.id}-practice-5`,

    title:
      "Build a mini workflow",

    type: "analysis",

    difficulty,

    question:
      `Design a small practical workflow that uses ${skill.name}.`,

    instructions: [
      "State the problem.",

      "Describe the input.",

      "Explain the major steps.",

      "Describe the expected output.",

      "Explain how you would check whether the result is useful.",
    ],

    hints: [
      "Think from problem definition to evaluation.",

      `Use the concepts covered in ${skill.name}.`,
    ],

    explanation:
      `A strong answer places ${skill.name} inside a complete problem-solving workflow rather than treating it as an isolated operation.`,
  });


  return practice;
}


// =========================================================
// FALLBACK COMMON MISTAKES
// =========================================================

function createFallbackCommonMistakes(
  skill: CurriculumSkill
): LessonContent["commonMistakes"] {
  const toolNames =
    skill.tools
      .slice(0, 4)
      .join(", ");

  return [
    {
      id: `${skill.id}-mistake-1`,

      title:
        "Memorizing without understanding",

      description:
        `A learner may memorize terminology from ${skill.name} without understanding when or why the concepts should be used.`,

      correction:
        "Connect every concept with its practical purpose, input, output and example.",
    },

    {
      id: `${skill.id}-mistake-2`,

      title:
        "Skipping intermediate checks",

      description:
        "Several operations may be performed without inspecting intermediate results.",

      correction:
        "Inspect important intermediate values, shapes, distributions, predictions or transformations before continuing.",
    },

    {
      id: `${skill.id}-mistake-3`,

      title:
        "Using tools mechanically",

      description:
        toolNames.length > 0
          ? `Knowing the syntax of ${toolNames} does not automatically mean the underlying concept is understood.`
          : `Knowing syntax does not automatically mean ${skill.name} is understood.`,

      correction:
        "Understand the problem first and then select the appropriate tool.",
    },
  ];
}


// =========================================================
// NEXT TOPIC
// =========================================================

function getNextTopics(
  skillId: string
): string[] {
  const index =
    curriculumSkills.findIndex(
      (skill) =>
        skill.id === skillId
    );

  if (
    index < 0 ||
    index >=
      curriculumSkills.length - 1
  ) {
    return [];
  }

  return [
    curriculumSkills[
      index + 1
    ].id,
  ];
}


// =========================================================
// VISUALIZATION / MODEL LAB
// =========================================================

function createVisualization(
  skill: CurriculumSkill
): LessonContent["visualization"] {
  if (
    MODEL_LAB_SKILLS.has(
      skill.id
    )
  ) {
    return {
      type: "model-lab",

      labId: skill.id,

      title:
        `${skill.name} Model Lab`,

      description:
        `Explore ${skill.name} interactively using the existing ModelMind Model Lab. The roadmap will connect to this lab during final integration with the main ModelMind platform.`,
    };
  }

  return {
    type: "native",

    visualizationId:
      `${skill.id}-visualization`,

    title:
      `${skill.name} Visual Explorer`,

    description:
      `Use a roadmap-native interactive visualization to understand the important ideas and workflow behind ${skill.name}.`,
  };
}


// =========================================================
// CREATE ONE LESSON
// =========================================================

export function createLessonFromSkill(
  skill: CurriculumSkill
): LessonContent {
  const deepContent =
    getDeepLessonContent(
      skill.id
    );

  const defaultVisualization =
    createVisualization(skill);

  return {
    id:
      `lesson-${skill.id}`,

    skillId:
      skill.id,

    title:
      skill.name,

    subtitle:
      skill.description,

    overview:
      deepContent?.overview ??
      `${skill.description} This ModelMind lesson takes you from core ideas through visualization, implementation and practice so that you understand the topic instead of only memorizing it.`,

    objectives:
      deepContent?.objectives ??
      (
        skill.outcomes.length > 0
          ? [...skill.outcomes]
          : [
              `Understand ${skill.name}.`,
              `Apply ${skill.name} in practice.`,
            ]
      ),

    prerequisites:
      [...skill.prerequisites],

    sections:
      deepContent?.sections ??
      createFallbackSections(
        skill
      ),

    visualization:
  MODEL_LAB_SKILLS.has(skill.id)
    ? defaultVisualization
    : deepContent?.visualization ??
      defaultVisualization,
    codeExamples:
      deepContent?.codeExamples ??
      createFallbackCodeExamples(
        skill
      ),

    practice:
      deepContent?.practice ??
      createFallbackPractice(
        skill
      ),

    commonMistakes:
      deepContent?.commonMistakes ??
      createFallbackCommonMistakes(
        skill
      ),

    keyTakeaways:
      deepContent?.keyTakeaways ??
      (
        skill.outcomes.length > 0
          ? [...skill.outcomes]
          : [
              `Understand the purpose of ${skill.name}.`,
              `Know when ${skill.name} should be used.`,
              `Apply ${skill.name} correctly in practical work.`,
            ]
      ),

        // =====================================================
    // ADVANCED EDUCATIONAL CONTENT
    //
    // Content only.
    // No learner progress or completion state is stored
    // or modified here.
    // =====================================================

    contentDepth:
      deepContent?.contentDepth,

    modelDeepDive:
      deepContent?.modelDeepDive,

    assumptions:
      deepContent?.assumptions,

    realWorldApplications:
      deepContent?.realWorldApplications,

    interviewQuestions:
      deepContent?.interviewQuestions,

    examNotes:
      deepContent?.examNotes,

    nextTopics:
      getNextTopics(
        skill.id
      ),
  };
}


// =========================================================
// GENERATE ALL CURRICULUM LESSONS
// =========================================================

export function createCurriculumLessons():
  LessonContent[] {
  return curriculumSkills.map(
    (skill) =>
      createLessonFromSkill(
        skill
      )
  );
}