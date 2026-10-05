import { lessonRegistry } from "./data/roadmap/lessons/lessonRegistry";
import { curriculumSkills } from "./data/roadmap/skills";
let passed = 0;
let failed = 0;
const warnings: string[] = [];

function pass() {
  passed++;
}

function fail(message: string) {
  failed++;
  console.error(`❌ ${message}`);
}

function check(condition: boolean, message: string) {
  if (condition) {
    pass();
  } else {
    fail(message);
  }
}

console.log("\n==========================================");
console.log("MODELMIND FINAL ROADMAP INTEGRITY QA");
console.log("==========================================\n");

/* -------------------------------------------------------
   1. LESSON REGISTRY
------------------------------------------------------- */

console.log("[1/7] Checking lesson registry...");

check(
  lessonRegistry.length > 0,
  "Lesson registry is empty."
);

const lessonIds = new Set<string>();
const lessonSkillIds = new Set<string>();

for (const lesson of lessonRegistry) {
  check(
    Boolean(lesson.id),
    `Lesson without id: ${lesson.title}`
  );

  check(
    Boolean(lesson.skillId),
    `Lesson without skillId: ${lesson.title}`
  );

  if (lessonIds.has(lesson.id)) {
    fail(`Duplicate lesson id: ${lesson.id}`);
  } else {
    lessonIds.add(lesson.id);
    pass();
  }

  if (lessonSkillIds.has(lesson.skillId)) {
    fail(`Duplicate lesson skillId: ${lesson.skillId}`);
  } else {
    lessonSkillIds.add(lesson.skillId);
    pass();
  }
}

console.log(`✓ ${lessonRegistry.length} lessons inspected\n`);

/* -------------------------------------------------------
   2. SECTION INTEGRITY
------------------------------------------------------- */

console.log("[2/7] Checking lesson sections...");

let sectionCount = 0;

for (const lesson of lessonRegistry) {
  check(
    Array.isArray(lesson.sections),
    `${lesson.skillId}: sections is not an array`
  );

  check(
    lesson.sections.length > 0,
    `${lesson.skillId}: has no lesson sections`
  );

  const localIds = new Set<string>();

  for (const section of lesson.sections) {
    sectionCount++;

    check(
      Boolean(section.id),
      `${lesson.skillId}: section without id`
    );

    check(
      Boolean(section.title?.trim()),
      `${lesson.skillId}/${section.id}: empty title`
    );

    check(
      Array.isArray(section.explanation) &&
        section.explanation.length > 0,
      `${lesson.skillId}/${section.id}: missing explanation`
    );

    check(
      section.explanation.every(
        (paragraph) =>
          typeof paragraph === "string" &&
          paragraph.trim().length > 0
      ),
      `${lesson.skillId}/${section.id}: contains empty explanation paragraph`
    );

    if (localIds.has(section.id)) {
      fail(
        `${lesson.skillId}: duplicate section id "${section.id}"`
      );
    } else {
      localIds.add(section.id);
      pass();
    }
  }
}

console.log(`✓ ${sectionCount} sections inspected\n`);

/* -------------------------------------------------------
   3. MODEL LESSON COVERAGE
------------------------------------------------------- */

console.log("[3/7] Checking ML model lesson coverage...");

const expectedModels = [
  "linear-regression",
  "gradient-descent",
  "polynomial-regression",
  "regularization",

  "logistic-regression",
  "knn",
  "naive-bayes",
  "decision-tree",
  "random-forest",
  "svm",

  "kmeans",
  "clustering-evaluation",
  "pca",

  "ensemble-learning",
  "bagging",
  "boosting-foundations",
  "gradient-boosting",
  "xgboost",
  "voting-stacking",
];

for (const skillId of expectedModels) {
  const lesson = lessonRegistry.find(
    (item) => item.skillId === skillId
  );

  check(
    Boolean(lesson),
    `Expected model lesson missing: ${skillId}`
  );

  if (!lesson) {
    continue;
  }

  check(
    lesson.sections.length > 0,
    `${skillId}: model has no sections`
  );

  if (!lesson.modelDeepDive) {
    warnings.push(
      `${skillId}: modelDeepDive is not configured.`
    );
  }
}

console.log(
  `✓ ${expectedModels.length} expected model lessons checked\n`
);

/* -------------------------------------------------------
   4. DEEP-DIVE CONTENT
------------------------------------------------------- */

console.log("[4/7] Checking model deep-dive integrity...");

let deepDiveCount = 0;

for (const lesson of lessonRegistry) {
  const deepDive = lesson.modelDeepDive;

  if (!deepDive) {
    continue;
  }

  deepDiveCount++;

  check(
    Boolean(deepDive.modelFamily?.trim()),
    `${lesson.skillId}: empty model family`
  );

  check(
    Array.isArray(deepDive.problemTypes) &&
      deepDive.problemTypes.length > 0,
    `${lesson.skillId}: missing problem types`
  );

  check(
    Array.isArray(deepDive.motivation) &&
      deepDive.motivation.length > 0,
    `${lesson.skillId}: missing motivation`
  );

  check(
    Array.isArray(deepDive.intuition) &&
      deepDive.intuition.length > 0,
    `${lesson.skillId}: missing intuition`
  );

  check(
    Array.isArray(deepDive.trainingProcess) &&
      deepDive.trainingProcess.length > 0,
    `${lesson.skillId}: missing training process`
  );

  check(
    Array.isArray(deepDive.parameters),
    `${lesson.skillId}: parameters is invalid`
  );

  check(
    Array.isArray(deepDive.advantages) &&
      deepDive.advantages.length > 0,
    `${lesson.skillId}: missing advantages`
  );

  check(
    Array.isArray(deepDive.limitations) &&
      deepDive.limitations.length > 0,
    `${lesson.skillId}: missing limitations`
  );

  check(
    Array.isArray(deepDive.whenToUse) &&
      deepDive.whenToUse.length > 0,
    `${lesson.skillId}: missing whenToUse`
  );

  check(
    Array.isArray(deepDive.whenNotToUse) &&
      deepDive.whenNotToUse.length > 0,
    `${lesson.skillId}: missing whenNotToUse`
  );
}

console.log(
  `✓ ${deepDiveCount} deep-dive lessons inspected\n`
);

/* -------------------------------------------------------
   5. CODE + PRACTICE DATA
------------------------------------------------------- */

console.log("[5/7] Checking Code and Practice stages...");

for (const lesson of lessonRegistry) {
  check(
    Array.isArray(lesson.codeExamples),
    `${lesson.skillId}: codeExamples is invalid`
  );

  check(
    Array.isArray(lesson.practice),
    `${lesson.skillId}: practice is invalid`
  );

  const codeIds = new Set<string>();

  for (const example of lesson.codeExamples) {
    check(
      Boolean(example.id),
      `${lesson.skillId}: code example without id`
    );

    if (codeIds.has(example.id)) {
      fail(
        `${lesson.skillId}: duplicate code example id ${example.id}`
      );
    } else {
      codeIds.add(example.id);
      pass();
    }
  }

  const practiceIds = new Set<string>();

  for (const problem of lesson.practice) {
    check(
      Boolean(problem.id),
      `${lesson.skillId}: practice problem without id`
    );

    if (practiceIds.has(problem.id)) {
      fail(
        `${lesson.skillId}: duplicate practice id ${problem.id}`
      );
    } else {
      practiceIds.add(problem.id);
      pass();
    }
  }
}

console.log("✓ Code and Practice structures checked\n");

/* -------------------------------------------------------
   6. SKILL → LESSON CONNECTION
------------------------------------------------------- */

console.log("[6/7] Checking skill/lesson connections...");

const skillIds = new Set(
  curriculumSkills.map((skill) => skill.id)
);

for (const lesson of lessonRegistry) {
  check(
    skillIds.has(lesson.skillId),
    `Lesson references unknown skill: ${lesson.skillId}`
  );
}

for (const modelId of expectedModels) {
  check(
    skillIds.has(modelId),
    `Expected model missing from skills registry: ${modelId}`
  );
}

console.log("✓ Skill connections checked\n");

/* -------------------------------------------------------
   7. FINAL SANITY
------------------------------------------------------- */

console.log("[7/7] Running final sanity checks...");

check(
  lessonRegistry.every(
    (lesson) =>
      lesson.sections.length > 0
  ),
  "One or more lessons have zero sections."
);

check(
  expectedModels.every(
    (modelId) =>
      lessonRegistry.some(
        (lesson) =>
          lesson.skillId === modelId
      )
  ),
  "One or more required model lessons are missing."
);

console.log("✓ Final sanity checks completed\n");

/* -------------------------------------------------------
   REPORT
------------------------------------------------------- */

console.log("==========================================");
console.log("FINAL ROADMAP INTEGRITY REPORT");
console.log("==========================================");
console.log(`Lessons:            ${lessonRegistry.length}`);
console.log(`Sections:           ${sectionCount}`);
console.log(`Model deep-dives:   ${deepDiveCount}`);
console.log(`Checks passed:      ${passed}`);
console.log(`Checks failed:      ${failed}`);
console.log(`Warnings:           ${warnings.length}`);

if (warnings.length > 0) {
  console.log("\nWARNINGS");
  console.log("------------------------------------------");

  warnings.forEach((warning, index) => {
    console.log(`${index + 1}. ${warning}`);
  });
}

console.log("\n==========================================");

if (failed === 0) {
  console.log("FINAL RESULT: ✅ INTEGRITY QA PASSED");
} else {
  console.log(
    `FINAL RESULT: ❌ ${failed} INTEGRITY CHECK(S) FAILED`
  );
  process.exitCode = 1;
}

console.log("==========================================\n");