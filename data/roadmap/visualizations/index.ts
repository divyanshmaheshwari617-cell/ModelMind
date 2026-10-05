import {
  nativeVisualizationContentRegistry,
} from "./nativeVisualizationContent";

import {
  advancedVisualizationContentRegistry,
} from "./advancedVisualizationContent";

import type {
  NativeVisualizationContent,
} from "./nativeVisualizationContent";

export type {
  NativeVisualizationContent,
  NativeVisualizationFamily,
  VisualizationConcept,
  VisualizationFormula,
  VisualizationObservation,
  VisualizationChallenge,
} from "./nativeVisualizationContent";

export const visualizationContentRegistry:
  Record<string, NativeVisualizationContent> = {
    ...nativeVisualizationContentRegistry,
    ...advancedVisualizationContentRegistry,
  };

export function getVisualizationContent(
  visualizationId?: string
): NativeVisualizationContent | undefined {
  if (!visualizationId) {
    return undefined;
  }

  return visualizationContentRegistry[
    visualizationId
  ];
}

export function hasVisualizationContent(
  visualizationId?: string
): boolean {
  if (!visualizationId) {
    return false;
  }

  return Boolean(
    visualizationContentRegistry[
      visualizationId
    ]
  );
}

export function getAllVisualizationContent():
  NativeVisualizationContent[] {
  return Object.values(
    visualizationContentRegistry
  );
}