import {
  useState,
} from "react";

import type {
  SVMRow,
  SVMTask,
} from "./types/svm";

import SVMVisualLearningLab from "./visual-learning/SVMVisualLearningLab";
import SVMDatasetAnalyzer from "./dataset/SVMDatasetAnalyzer";
import SVMClassificationLab from "./classification/SVMClassificationLab";
import SVMRegressionLab from "./regression/SVMRegressionLab";
import SVMLearningDashboard from "./SVMLearningDashboard";

type ActiveDataset = {
  rows: SVMRow[];
  featureColumns: string[];
  targetColumn: string;
  task: SVMTask;
  scalingEnabled: boolean;
};

export default function SVMVisualizer() {
  const [
    activeDataset,
    setActiveDataset,
  ] =
    useState<ActiveDataset | null>(
      null
    );

  const [
    showDatasetLab,
    setShowDatasetLab,
  ] = useState(false);

  function handleUseDataset(
    rows: SVMRow[],
    featureColumns: string[],
    targetColumn: string,
    task: SVMTask,
    scalingEnabled: boolean
  ) {
    setActiveDataset({
      rows,
      featureColumns,
      targetColumn,
      task,
      scalingEnabled,
    });
  }

  return (
    <main style={pageStyle}>
      <section style={introStyle}>
        <div style={badgeStyle}>
          MODELMIND • SVM LAB
        </div>

        <h1 style={titleStyle}>
          Support Vector Machine
        </h1>

        <p style={introTextStyle}>
          First understand SVM
          visually using a small
          built-in dataset. Then
          experiment with your own
          dataset and evaluate the
          complete model.
        </p>

        <div style={flowStyle}>
          <FlowItem
            number="1"
            text="Learn visually"
          />

          <FlowArrow />

          <FlowItem
            number="2"
            text="Experiment"
          />

          <FlowArrow />

          <FlowItem
            number="3"
            text="Upload data"
          />

          <FlowArrow />

          <FlowItem
            number="4"
            text="Train & evaluate"
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <div>
            <div style={sectionNumberStyle}>
              PART 1
            </div>

            <h2 style={sectionTitleStyle}>
              Learn SVM Visually
            </h2>

            <p style={sectionTextStyle}>
              Start here. Press Play
              and watch SVM build
              itself one concept at
              a time.
            </p>
          </div>

          <div style={recommendedStyle}>
            START HERE
          </div>
        </div>

        <SVMVisualLearningLab />
      </section>

      <section style={datasetSectionStyle}>
        <div style={sectionHeadingStyle}>
          <div>
            <div style={sectionNumberStyle}>
              PART 2
            </div>

            <h2 style={sectionTitleStyle}>
              Try Your Own Dataset
            </h2>

            <p style={sectionTextStyle}>
              Once the visual lesson
              makes sense, load the
              built-in analysis
              dataset or upload your
              own CSV.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowDatasetLab(
                (current) =>
                  !current
              )
            }
            style={datasetButtonStyle}
          >
            {showDatasetLab
              ? "Hide Dataset Lab"
              : "Open Dataset Lab"}
          </button>
        </div>

        {!showDatasetLab && (
          <div style={collapsedStyle}>
            <div style={collapsedIconStyle}>
              CSV
            </div>

            <div>
              <strong>
                Dataset analysis is
                optional while
                learning.
              </strong>

              <p style={collapsedTextStyle}>
                Open this section
                when you are ready
                to choose features,
                inspect missing
                values, enable
                scaling, or upload a
                CSV.
              </p>
            </div>
          </div>
        )}

        {showDatasetLab && (
          <SVMDatasetAnalyzer
            onUseDataset={
              handleUseDataset
            }
          />
        )}
      </section>

      {activeDataset && (
        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <div>
              <div style={sectionNumberStyle}>
                PART 3
              </div>

              <h2 style={sectionTitleStyle}>
                Full Model Experiment
              </h2>

              <p style={sectionTextStyle}>
                Now use the selected
                dataset with the
                complete SVC or SVR
                experiment.
              </p>
            </div>

            <div style={activeStyle}>
              ACTIVE DATASET
            </div>
          </div>

          <div style={summaryStyle}>
            <SummaryItem
              label="Task"
              value={
                activeDataset.task ===
                "classification"
                  ? "SVC Classification"
                  : "SVR Regression"
              }
            />

            <SummaryItem
              label="Rows"
              value={String(
                activeDataset.rows
                  .length
              )}
            />

            <SummaryItem
              label="Features"
              value={activeDataset.featureColumns.join(
                ", "
              )}
            />

            <SummaryItem
              label="Target"
              value={
                activeDataset.targetColumn
              }
            />

            <SummaryItem
              label="Scaling"
              value={
                activeDataset.scalingEnabled
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </div>

          <div style={dashboardGapStyle}>
            <SVMLearningDashboard
              task={
                activeDataset.task
              }
            />
          </div>

          <div style={dashboardGapStyle}>
            {activeDataset.task ===
            "classification" ? (
              <SVMClassificationLab
                rows={
                  activeDataset.rows
                }
                featureNames={
                  activeDataset.featureColumns
                }
                scalingEnabled={
                  activeDataset.scalingEnabled
                }
              />
            ) : (
              <SVMRegressionLab
                rows={
                  activeDataset.rows
                }
                featureNames={
                  activeDataset.featureColumns
                }
                scalingEnabled={
                  activeDataset.scalingEnabled
                }
              />
            )}
          </div>
        </section>
      )}

      <footer style={footerStyle}>
        ModelMind — See what your
        machine-learning code is
        thinking.
      </footer>
    </main>
  );
}

function FlowItem({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div style={flowItemStyle}>
      <span style={flowNumberStyle}>
        {number}
      </span>

      <span>{text}</span>
    </div>
  );
}

function FlowArrow() {
  return (
    <span style={flowArrowStyle}>
      →
    </span>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={summaryItemStyle}>
      <div style={summaryLabelStyle}>
        {label}
      </div>

      <div style={summaryValueStyle}>
        {value}
      </div>
    </div>
  );
}

const pageStyle = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "30px 22px 70px",
  color: "#e2e8f0",
};

const introStyle = {
  padding: "30px 28px",
  borderRadius: 24,
  border:
    "1px solid #334155",
  background:
    "linear-gradient(135deg, #020617 0%, #0f172a 52%, #1e1b4b 100%)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "7px 11px",
  borderRadius: 999,
  background: "#312e81",
  color: "#ddd6fe",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const titleStyle = {
  margin: "15px 0 12px",
  fontSize:
    "clamp(38px, 6vw, 70px)",
  lineHeight: 1,
};

const introTextStyle = {
  maxWidth: 780,
  color: "#94a3b8",
  lineHeight: 1.7,
  fontSize: 17,
};

const flowStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 10,
  marginTop: 22,
};

const flowItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 12px",
  borderRadius: 999,
  background: "#020617",
  border:
    "1px solid #334155",
  fontSize: 13,
  fontWeight: 700,
};

const flowNumberStyle = {
  display: "grid",
  placeItems: "center",
  width: 23,
  height: 23,
  borderRadius: "50%",
  background: "#6d28d9",
  color: "#ffffff",
  fontSize: 11,
};

const flowArrowStyle = {
  color: "#64748b",
  fontWeight: 900,
};

const sectionStyle = {
  marginTop: 26,
};

const datasetSectionStyle = {
  marginTop: 34,
  padding: 22,
  borderRadius: 20,
  border:
    "1px solid #334155",
  background: "#0f172a",
};

const sectionHeadingStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 16,
  marginBottom: 18,
};

const sectionNumberStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const sectionTitleStyle = {
  margin: "6px 0 6px",
  fontSize: 28,
};

const sectionTextStyle = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.6,
};

const recommendedStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#14532d",
  color: "#bbf7d0",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1,
};

const activeStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#312e81",
  color: "#ddd6fe",
  fontSize: 11,
  fontWeight: 900,
};

const datasetButtonStyle = {
  padding: "11px 16px",
  borderRadius: 10,
  border:
    "1px solid #8b5cf6",
  background: "#6d28d9",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 800,
};

const collapsedStyle = {
  display: "flex",
  alignItems: "center",
  gap: 15,
  padding: 18,
  borderRadius: 14,
  background: "#020617",
  border:
    "1px dashed #475569",
};

const collapsedIconStyle = {
  display: "grid",
  placeItems: "center",
  minWidth: 52,
  height: 52,
  borderRadius: 12,
  background: "#172554",
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
};

const collapsedTextStyle = {
  margin: "5px 0 0",
  color: "#94a3b8",
  lineHeight: 1.55,
};

const summaryStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  padding: 16,
  borderRadius: 14,
  background: "#0f172a",
  border:
    "1px solid #334155",
};

const summaryItemStyle = {
  padding: 12,
  borderRadius: 10,
  background: "#020617",
};

const summaryLabelStyle = {
  color: "#64748b",
  fontSize: 10,
  fontWeight: 900,
  textTransform:
    "uppercase" as const,
  letterSpacing: 1,
};

const summaryValueStyle = {
  marginTop: 5,
  color: "#f8fafc",
  fontWeight: 800,
  overflowWrap:
    "anywhere" as const,
};

const dashboardGapStyle = {
  marginTop: 18,
};

const footerStyle = {
  marginTop: 42,
  paddingTop: 22,
  borderTop:
    "1px solid #1e293b",
  color: "#64748b",
  textAlign:
    "center" as const,
  fontSize: 13,
};