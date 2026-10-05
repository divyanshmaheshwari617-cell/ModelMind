import type {
  DeepLessonContent,
  DeepLessonRegistry,
} from "./lessonContentTypes";

import {
  regressionContent,
} from "./regressionContent";

import {
  mlModelContent,
} from "./mlModelContent";

import {
  classificationContent,
} from "./classificationContent";

import {
  coreMLContent,
} from "./coreMLContent";

import {
  preprocessingContent,
} from "./preprocessingContent";

import {
  pythonDataContent,
} from "./pythonDataContent";

import {
  dataAnalysisContent,
} from "./dataAnalysisContent";

import {
  unsupervisedContent,
} from "./unsupervisedContent";

import {
  ensembleContent,
} from "./ensembleContent";

import {
  evaluationAdvancedContent,
} from "./evaluationAdvancedContent";


// =========================================================
// NEW LINEAR-MODEL CONTENT
// =========================================================
//
// ADDED ONLY.
// Contains:
// - Polynomial Regression
// - Regularization
// - Ridge Regression
// - Lasso Regression
// - Elastic Net
// - Logistic Regression
//
// Existing Linear Regression remains inside mlModelContent.
// =========================================================

import {
  linearModelsContent,
} from "./ml/linearModelsContent";


// =========================================================
// MASTER DEEP-LESSON REGISTRY
// =========================================================

export const deepLessonRegistry: DeepLessonRegistry = {
  ...pythonDataContent,
  ...dataAnalysisContent,
  ...preprocessingContent,
  ...coreMLContent,
  ...regressionContent,
  ...classificationContent,
  ...unsupervisedContent,
  ...ensembleContent,
  ...evaluationAdvancedContent,

  // =======================================================
  // NEW LINEAR-MODEL CONTENT
  // =======================================================
  //
  // Adds:
  // - Polynomial Regression
  // - Regularization
  // - Ridge
  // - Lasso
  // - Elastic Net
  // - Logistic Regression
  //
  // This is placed BEFORE mlModelContent intentionally.
  // =======================================================

  ...linearModelsContent,

  // =======================================================
  // MAXIMUM-DEPTH ML MODEL CONTENT
  // =======================================================
  //
  // KEEP THIS LAST.
  //
  // Existing model-specific expert content such as the
  // completed Linear Regression entry remains the final
  // override for duplicate skill IDs.
  //
  // DO NOT move this above linearModelsContent.
  // =======================================================

  ...mlModelContent,
};


// =========================================================
// GET CONTENT FOR ONE SKILL
// =========================================================

export function getDeepLessonContent(
  skillId: string
): DeepLessonContent | undefined {
  return deepLessonRegistry[skillId];
}


// =========================================================
// CHECK WHETHER CUSTOM DEEP CONTENT EXISTS
// =========================================================

export function hasDeepLessonContent(
  skillId: string
): boolean {
  return Boolean(
    deepLessonRegistry[skillId]
  );
}