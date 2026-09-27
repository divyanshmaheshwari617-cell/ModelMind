"use client";

import { useState } from "react";

import LinearRegressionDatasetAnalyzer from "./LinearRegressionDatasetAnalyzer";
import LinearRegressionVisualizer from "./LinearRegressionVisualizer";

import {
  NumericDataPoint,
} from "./types/dataset";

export default function LinearRegressionLab() {
  const [dataset, setDataset] =
    useState<NumericDataPoint[] | null>(
      null
    );

  const [featureName, setFeatureName] =
    useState("X");

  const [targetName, setTargetName] =
    useState("Y");

  const handleUseDataset = (
    data: NumericDataPoint[],
    feature: string,
    target: string
  ) => {
    setDataset(data);
    setFeatureName(feature);
    setTargetName(target);
  };

  const resetToDemo = () => {
    setDataset(null);
    setFeatureName("X");
    setTargetName("Y");
  };

  return (
    <div className="space-y-6">
      <LinearRegressionDatasetAnalyzer
        onUseDataset={
          handleUseDataset
        }
      />

      {dataset && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Active Dataset
              </p>

              <p className="mt-1 font-bold text-slate-900">
                X = {featureName}
                {" • "}
                Y = {targetName}
                {" • "}
                {dataset.length} usable
                observations
              </p>
            </div>

            <button
              type="button"
              onClick={resetToDemo}
              className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700"
            >
              Return to Demo Dataset
            </button>
          </div>
        </div>
      )}

      <LinearRegressionVisualizer
        externalDataset={
          dataset ?? undefined
        }
        featureName={
          featureName
        }
        targetName={
          targetName
        }
      />
    </div>
  );
}