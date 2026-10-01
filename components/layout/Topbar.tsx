"use client";

import {
  LearningLevel,
  LEARNING_LEVELS,
} from "@/types/learning";

interface TopbarProps {
  learningLevel: LearningLevel;

  onLearningLevelChange: (
    level: LearningLevel
  ) => void;
}

export default function Topbar({
  learningLevel,
  onLearningLevelChange,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <div className="breadcrumb">
          Workspace <span>/</span> Notebook
        </div>

        <h2>Untitled ML Project</h2>
      </div>

      <div className="topbarActions">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px",
            border:
              "1px solid rgba(255,255,255,0.10)",
            borderRadius: "9px",
            background:
              "rgba(255,255,255,0.035)",
          }}
        >
          {LEARNING_LEVELS.map((level) => {
            const active =
              learningLevel === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() =>
                  onLearningLevelChange(level)
                }
                title={`Use ${level} learning level`}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  background: active
                    ? "rgba(114,226,138,0.15)"
                    : "transparent",
                  color: active
                    ? "#72e28a"
                    : "inherit",
                  fontSize: "11px",
                  fontWeight: active
                    ? 700
                    : 500,
                  opacity: active ? 1 : 0.6,
                  transition:
                    "all 0.15s ease",
                }}
              >
                {level}
              </button>
            );
          })}
        </div>

        <div className="runtimeStatus">
          <span className="statusDot" />
          Runtime ready
        </div>

        <button className="secondaryButton">
          Share
        </button>

        <button className="upgradeButton">
          Upgrade
        </button>

        <div className="avatar">
          D
        </div>
      </div>
    </header>
  );
}