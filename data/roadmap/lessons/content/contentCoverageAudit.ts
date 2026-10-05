import {
  curriculumSkills,
} from "../../skills";

import {
  deepLessonRegistry,
} from "./index";


// =========================================================
// CONTENT COVERAGE AUDIT
// =========================================================

export interface ContentCoverageResult {
  totalSkills: number;
  deepContentSkills: number;
  missingDeepContentSkills: string[];
  unknownDeepContentKeys: string[];
  coveragePercentage: number;
}


// =========================================================
// RUN COVERAGE AUDIT
// =========================================================

export function auditDeepLessonCoverage():
  ContentCoverageResult {

  const curriculumIds = new Set(
    curriculumSkills.map(
      (skill) => skill.id
    )
  );

  const deepContentIds = new Set(
    Object.keys(
      deepLessonRegistry
    )
  );


  // -------------------------------------------------------
  // CURRICULUM SKILLS WITHOUT DEEP CONTENT
  // -------------------------------------------------------

  const missingDeepContentSkills =
    curriculumSkills
      .filter(
        (skill) =>
          !deepContentIds.has(
            skill.id
          )
      )
      .map(
        (skill) => skill.id
      );


  // -------------------------------------------------------
  // DEEP CONTENT WITHOUT A CURRICULUM SKILL
  // -------------------------------------------------------

  const unknownDeepContentKeys =
    [...deepContentIds]
      .filter(
        (skillId) =>
          !curriculumIds.has(
            skillId
          )
      );


  // -------------------------------------------------------
  // COVERAGE
  // -------------------------------------------------------

  const deepContentSkills =
    curriculumSkills.length -
    missingDeepContentSkills.length;

  const coveragePercentage =
    curriculumSkills.length === 0
      ? 100
      : Number(
          (
            (
              deepContentSkills /
              curriculumSkills.length
            ) *
            100
          ).toFixed(2)
        );


  return {
    totalSkills:
      curriculumSkills.length,

    deepContentSkills,

    missingDeepContentSkills,

    unknownDeepContentKeys,

    coveragePercentage,
  };
}


// =========================================================
// HUMAN-READABLE REPORT
// =========================================================

export function getDeepLessonCoverageReport():
  string {

  const result =
    auditDeepLessonCoverage();

  const lines: string[] = [
    "",
    "========================================",
    "MODELMIND DEEP CONTENT COVERAGE",
    "========================================",
    "",
    `Total curriculum skills: ${result.totalSkills}`,
    `Deep-content skills: ${result.deepContentSkills}`,
    `Coverage: ${result.coveragePercentage}%`,
    "",
  ];


  // -------------------------------------------------------
  // MISSING
  // -------------------------------------------------------

  if (
    result
      .missingDeepContentSkills
      .length === 0
  ) {
    lines.push(
      "✓ Every curriculum skill has deep content."
    );
  } else {
    lines.push(
      "MISSING DEEP CONTENT:"
    );

    result
      .missingDeepContentSkills
      .forEach(
        (skillId) => {
          lines.push(
            `  - ${skillId}`
          );
        }
      );
  }


  lines.push("");


  // -------------------------------------------------------
  // UNKNOWN CONTENT KEYS
  // -------------------------------------------------------

  if (
    result
      .unknownDeepContentKeys
      .length === 0
  ) {
    lines.push(
      "✓ No orphan deep-content entries."
    );
  } else {
    lines.push(
      "DEEP CONTENT WITHOUT CURRICULUM SKILL:"
    );

    result
      .unknownDeepContentKeys
      .forEach(
        (skillId) => {
          lines.push(
            `  - ${skillId}`
          );
        }
      );
  }


  lines.push("");
  lines.push(
    "========================================"
  );
  lines.push("");


  return lines.join(
    "\n"
  );
}