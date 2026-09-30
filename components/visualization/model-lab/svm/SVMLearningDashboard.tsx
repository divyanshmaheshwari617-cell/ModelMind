import {
  useState,
} from "react";

import type {
  LearningLevel,
  SVMTask,
} from "./types/svm";

import SVMExplanation from "./explanations/SVMExplanation";

type Props = {
  task: SVMTask;
};

export default function SVMLearningDashboard({
  task,
}: Props) {
  const [level, setLevel] =
    useState<LearningLevel>(
      "basic"
    );

  return (
    <section
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            LEARNING MODE
          </div>

          <h2
            style={{
              margin:
                "6px 0 0",
            }}
          >
            Learn SVM Step by Step
          </h2>

          <p
            style={{
              color:
                "#94a3b8",
              lineHeight: 1.6,
              marginBottom: 0,
            }}
          >
            Change the explanation
            depth without changing
            your dataset or model
            experiment.
          </p>
        </div>

        <div style={buttonGroupStyle}>
          <LevelButton
            active={
              level === "basic"
            }
            onClick={() =>
              setLevel(
                "basic"
              )
            }
          >
            Basic
          </LevelButton>

          <LevelButton
            active={
              level === "medium"
            }
            onClick={() =>
              setLevel(
                "medium"
              )
            }
          >
            Medium
          </LevelButton>

          <LevelButton
            active={
              level ===
              "advanced"
            }
            onClick={() =>
              setLevel(
                "advanced"
              )
            }
          >
            Advanced
          </LevelButton>
        </div>
      </div>

      <SVMExplanation
        level={level}
        task={task}
      />

      <section style={roadmapStyle}>
        <h3
          style={{
            marginTop: 0,
          }}
        >
          Learning Roadmap
        </h3>

        <div style={gridStyle}>
          {task ===
          "classification" ? (
            <>
              <RoadmapCard
                number="01"
                title="Dataset"
                text="Choose numerical features and a binary target."
              />

              <RoadmapCard
                number="02"
                title="Scaling"
                text="Understand why feature scale changes SVM geometry."
              />

              <RoadmapCard
                number="03"
                title="Hyperplane"
                text="See how the decision boundary separates classes."
              />

              <RoadmapCard
                number="04"
                title="Margin"
                text="Understand the maximum-margin idea."
              />

              <RoadmapCard
                number="05"
                title="Support Vectors"
                text="Identify the influential observations."
              />

              <RoadmapCard
                number="06"
                title="C"
                text="Explore soft-margin regularization."
              />

              <RoadmapCard
                number="07"
                title="Kernels"
                text="Move from linear to nonlinear boundaries."
              />

              <RoadmapCard
                number="08"
                title="Evaluate"
                text="Inspect confusion matrix, accuracy, precision, recall and F1."
              />
            </>
          ) : (
            <>
              <RoadmapCard
                number="01"
                title="Dataset"
                text="Choose numerical features and a numerical target."
              />

              <RoadmapCard
                number="02"
                title="Scaling"
                text="Prepare comparable feature geometry."
              />

              <RoadmapCard
                number="03"
                title="Regression Function"
                text="See how SVR predicts continuous values."
              />

              <RoadmapCard
                number="04"
                title="ε-Tube"
                text="Explore the no-penalty tolerance region."
              />

              <RoadmapCard
                number="05"
                title="Support Vectors"
                text="See which observations influence the learned solution."
              />

              <RoadmapCard
                number="06"
                title="C + ε"
                text="Control violation penalty and tube width."
              />

              <RoadmapCard
                number="07"
                title="Kernels"
                text="Model nonlinear regression relationships."
              />

              <RoadmapCard
                number="08"
                title="Evaluate"
                text="Inspect MSE, RMSE, MAE and R²."
              />
            </>
          )}
        </div>
      </section>
    </section>
  );
}

function LevelButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border:
          active
            ? "1px solid #8b5cf6"
            : "1px solid #334155",
        background:
          active
            ? "#6d28d9"
            : "#020617",
        color: "#f8fafc",
        padding:
          "10px 15px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

function RoadmapCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={numberStyle}>
        {number}
      </div>

      <strong>
        {title}
      </strong>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.55,
          marginBottom: 0,
          fontSize: 14,
        }}
      >
        {text}
      </p>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 16,
  padding: 20,
  borderRadius: 18,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const eyebrowStyle = {
  color: "#a78bfa",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 1.4,
};

const buttonGroupStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 8,
};

const roadmapStyle = {
  padding: 20,
  borderRadius: 18,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const cardStyle = {
  padding: 15,
  borderRadius: 12,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const numberStyle = {
  color: "#8b5cf6",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 8,
};