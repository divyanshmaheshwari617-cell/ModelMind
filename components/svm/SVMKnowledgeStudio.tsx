import {
  useState,
} from "react";

import SVMMathMode
  from "./theory/SVMMathMode";

import LevelExplanation
  from "./theory/LevelExplanation";

import SklearnCodeGenerator
  from "./code/SklearnCodeGenerator";

import SVMCommonMistakes
  from "./mistakes/SVMCommonMistakes";

import ExperimentHistory
  from "./experiment/ExperimentHistory";

import ExperimentComparison
  from "./experiment/ExperimentComparison";

import SVMLearningDashboard
  from "./dashboard/SVMLearningDashboard";

import "./SVMKnowledgeStudio.css";

type Tab =
  | "dashboard"
  | "explanation"
  | "math"
  | "code"
  | "mistakes"
  | "history"
  | "comparison";

const tabs: {
  id: Tab;
  label: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
  },
  {
    id: "explanation",
    label: "Learn",
  },
  {
    id: "math",
    label: "Math Mode",
  },
  {
    id: "code",
    label: "Python Code",
  },
  {
    id: "mistakes",
    label: "Mistakes",
  },
  {
    id: "history",
    label: "History",
  },
  {
    id: "comparison",
    label: "Compare",
  },
];

export default function SVMKnowledgeStudio() {
  const [activeTab, setActiveTab] =
    useState<Tab>(
      "dashboard"
    );

  return (
    <section className="svm-knowledge-studio">
      <div className="knowledge-studio-heading">
        <span>
          MODEL MIND KNOWLEDGE
        </span>

        <h2>
          Understand SVM,
          Not Just Run It
        </h2>

        <p>
          Move from intuition to
          mathematics, implementation,
          debugging and experiment
          comparison.
        </p>
      </div>

      <div className="knowledge-tabs">
        {tabs.map(
          (tab) => (
            <button
              key={tab.id}
              className={
                activeTab ===
                tab.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  tab.id
                )
              }
            >
              {tab.label}
            </button>
          )
        )}
      </div>

      {activeTab ===
        "dashboard" && (
        <SVMLearningDashboard />
      )}

      {activeTab ===
        "explanation" && (
        <LevelExplanation />
      )}

      {activeTab ===
        "math" && (
        <SVMMathMode />
      )}

      {activeTab ===
        "code" && (
        <SklearnCodeGenerator />
      )}

      {activeTab ===
        "mistakes" && (
        <SVMCommonMistakes />
      )}

      {activeTab ===
        "history" && (
        <ExperimentHistory />
      )}

      {activeTab ===
        "comparison" && (
        <ExperimentComparison />
      )}
    </section>
  );
}