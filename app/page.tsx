"use client";

import { useEffect, useState } from "react";

import Sidebar, {
  Workspace,
} from "@/components/layout/Sidebar";

import Topbar from "@/components/layout/Topbar";
import Notebook from "@/components/notebook/Notebook";
import AITutor from "@/components/ai/AITutor";

import { NotebookCellType } from "@/types/notebook";
import { createRuntime } from "@/lib/api";


export default function Home() {
  // =========================================================
  // WORKSPACE STATE
  // =========================================================

  const [
    activeWorkspace,
    setActiveWorkspace,
  ] = useState<Workspace>("Notebook");


  // =========================================================
  // RUNTIME STATE
  // =========================================================

  const [
    runtimeId,
    setRuntimeId,
  ] = useState<string | null>(null);

  const [
    runtimeStatus,
    setRuntimeStatus,
  ] = useState<
    "connecting" | "ready" | "error"
  >("connecting");


  // =========================================================
  // AI TUTOR STATE
  // =========================================================

  const [
    aiAction,
    setAIAction,
  ] = useState("");

  const [
    selectedCell,
    setSelectedCell,
  ] =
    useState<NotebookCellType | null>(
      null
    );


  // =========================================================
  // START MODELMIND PYTHON RUNTIME
  // =========================================================

  useEffect(() => {
    async function startRuntime() {
      try {
        setRuntimeStatus(
          "connecting"
        );

        const result =
          await createRuntime();

        setRuntimeId(
          result.session_id
        );

        setRuntimeStatus(
          "ready"
        );

        console.log(
          "ModelMind runtime ready:",
          result.session_id
        );
      } catch (error) {
        console.error(
          "Runtime connection failed:",
          error
        );

        setRuntimeId(null);

        setRuntimeStatus(
          "error"
        );
      }
    }

    startRuntime();
  }, []);


  // =========================================================
  // AI ACTION
  // =========================================================

  function handleAIAction(
    action: string,
    cell: NotebookCellType
  ) {
    setAIAction(action);
    setSelectedCell(cell);
  }


  // =========================================================
  // ACCEPT AI FIX
  // =========================================================

  function handleAcceptFix(
    cellId: string,
    correctedCode: string,
    runAfterAccept: boolean
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "modelmind-accept-fix",
        {
          detail: {
            cellId,
            correctedCode,
            runAfterAccept,
          },
        }
      )
    );
  }


  // =========================================================
  // WORKSPACE CONTENT
  // =========================================================

  function renderWorkspace() {
    // =======================================================
    // NOTEBOOK
    // =======================================================

    if (
      activeWorkspace ===
      "Notebook"
    ) {
      return (
        <>
          <Notebook
            runtimeId={runtimeId}
            runtimeStatus={
              runtimeStatus
            }
            onAIAction={
              handleAIAction
            }
          />

          <AITutor
            action={aiAction}
            cell={selectedCell}
            onAcceptFix={
              handleAcceptFix
            }
          />
        </>
      );
    }


    // =======================================================
    // VIDEO LEARNING
    // =======================================================

    // =======================================================
// VIDEO LEARNING
// =======================================================

if (
  activeWorkspace ===
  "Video Learning"
) {
  return (
    <ComingSoon
      icon="▶"
      title="Video Learning"
      description={
        "Educational Video Learning module will be connected here."
      }
    />
  );
}


    // =======================================================
    // HYPERPARAMETER LAB
    // =======================================================

    if (
      activeWorkspace ===
      "Hyperparameter Lab"
    ) {
      return (
        <ComingSoon
          icon="◫"
          title="Hyperparameter Lab"
          description={
            "Interactive hyperparameter tuning and 3D model-performance visualization will be built here."
          }
        />
      );
    }


    // =======================================================
    // DATASETS
    // =======================================================

    if (
      activeWorkspace ===
      "Datasets"
    ) {
      return (
        <ComingSoon
          icon="◫"
          title="Datasets"
          description={
            "Dataset management will be available here. Dataset upload remains inside the notebook."
          }
        />
      );
    }


    // =======================================================
    // DATASET INTELLIGENCE
    // =======================================================

    if (
      activeWorkspace ===
      "Dataset Intelligence"
    ) {
      return (
        <ComingSoon
          icon="◈"
          title="Dataset Intelligence"
          description={
            "Dataset X-Ray, Target Analyzer and Feature Analyzer are currently available through the notebook."
          }
        />
      );
    }


    // =======================================================
    // VISUAL ML
    // =======================================================

    if (
      activeWorkspace ===
      "Visual ML"
    ) {
      return (
        <ComingSoon
          icon="◉"
          title="Visual ML"
          description={
            "Interactive machine-learning model visualizations will be available here."
          }
        />
      );
    }


    // =======================================================
    // LEARN
    // =======================================================

    if (
      activeWorkspace ===
      "Learn"
    ) {
      return (
        <ComingSoon
          icon="◇"
          title="Learn"
          description={
            "Learn Python, NumPy, Pandas, Matplotlib, Seaborn and machine learning step by step."
          }
        />
      );
    }


    // =======================================================
    // ROADMAP
    // =======================================================

    if (
      activeWorkspace ===
      "Roadmap"
    ) {
      return (
        <ComingSoon
          icon="↗"
          title="Learning Roadmap"
          description={
            "Your personalized day-by-day machine-learning learning path will appear here."
          }
        />
      );
    }


    // =======================================================
    // EXPERIMENTS
    // =======================================================

    if (
      activeWorkspace ===
      "Experiments"
    ) {
      return (
        <ComingSoon
          icon="▤"
          title="Experiments"
          description={
            "Saved models, experiments, metrics and comparisons will appear here."
          }
        />
      );
    }


    // =======================================================
    // DASHBOARD
    // =======================================================

    return (
      <ComingSoon
        icon="M"
        title="ModelMind Dashboard"
        description={
          "Your recent notebooks, learning progress, datasets and experiments will appear here."
        }
      />
    );
  }


  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="appShell">
      <Sidebar
        activeWorkspace={
          activeWorkspace
        }
        onWorkspaceChange={
          setActiveWorkspace
        }
      />

      <section className="mainArea">
        <Topbar />

        <div className="workspace">
          {renderWorkspace()}
        </div>
      </section>
    </main>
  );
}


// =============================================================
// COMING SOON PLACEHOLDER
// =============================================================

interface ComingSoonProps {
  icon: string;
  title: string;
  description: string;
}


function ComingSoon({
  icon,
  title,
  description,
}: ComingSoonProps) {
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          padding: "40px",
          borderRadius: "16px",
          border:
            "1px solid rgba(255,255,255,0.08)",
          background:
            "rgba(255,255,255,0.02)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "34px",
          }}
        >
          {icon}
        </div>

        <h2
          style={{
            marginTop: "14px",
            marginBottom: "10px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: 0,
            opacity: 0.65,
            lineHeight: 1.7,
            fontSize: "12px",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}