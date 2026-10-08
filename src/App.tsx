import "./App.css";
import SVMDatasetStudio
  from "../components/svm/dataset/SVMDatasetStudio";
  import SVMTopDatasetUpload
  from "../components/svm/dataset/SVMTopDatasetUpload";

import {
  useSVM,
} from "../components/svm/context/SVMContext";
import SVMVisualLearningLab
  from "../components/svm/visual-learning/SVMVisualLearningLab";
import KernelLab from "../components/svm/kernels/KernelLab";
import SVMLearningLabs
  from "../components/svm/SVMLearningLabs";
import SVMExperimentLab
  from "../components/svm/experiment/SVMExperimentLab";

import LiveSVMPrediction
  from "../components/svm/prediction/LiveSVMPrediction";
import SVMKnowledgeStudio
  from "../components/svm/SVMKnowledgeStudio";

function App() {
  const {
    state,
    setTask,
    setLevel,
  } = useSVM();

  return (
    <main className="app">
      <section className="hero">
        <div className="eyebrow">
          MODELMIND • SVM LAB
        </div>

        <h1>
          Support Vector Machine
        </h1>

        <p>
          Learn SVM visually,
          experiment with its
          parameters, upload real
          datasets, train SVC and SVR,
          and understand what the
          model is doing.
        </p>

        <div className="controls">
          <button
            className={
              state.task ===
              "classification"
                ? "active"
                : ""
            }
            onClick={() =>
              setTask(
                "classification"
              )
            }
          >
            SVC Classification
          </button>

          <button
            className={
              state.task ===
              "regression"
                ? "active"
                : ""
            }
            onClick={() =>
              setTask(
                "regression"
              )
            }
          >
            SVR Regression
          </button>
        </div>

        <div className="controls">
          {(
            [
              "basic",
              "intermediate",
              "advanced",
            ] as const
          ).map((level) => (
            <button
              key={level}
              className={
                state.level ===
                level
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLevel(level)
              }
            >
              {level}
            </button>
          ))}
        </div>
      </section>
      <SVMTopDatasetUpload />


      <section className="architecture">
        <h2>
          Complete SVM Learning Lab
        </h2>

        <div className="grid">
          <Card
            number="01"
            title="Visual Learning"
            text="Watch SVM construct the decision boundary step by step."
          />

          <Card
            number="02"
            title="Dataset Studio"
            text="Upload CSV data and choose features and target."
          />

          <Card
            number="03"
            title="3D SVM"
            text="Explore data, margins, hyperplanes and support vectors."
          />

          <Card
            number="04"
            title="Kernel Lab"
            text="Understand Linear, Polynomial and RBF kernels visually."
          />

          <Card
            number="05"
            title="Parameter Lab"
            text="Experiment with C, gamma, degree and epsilon."
          />

          <Card
            number="06"
            title="Model Experiment"
            text="Train SVC or SVR and evaluate the complete model."
          />

          <Card
            number="07"
            title="Live Prediction"
            text="Move a query point and watch the model predict."
          />

          <Card
            number="08"
            title="Code + Mathematics"
            text="Connect each visualization to sklearn code and SVM mathematics."
          />
        </div>
      </section>
      <SVMVisualLearningLab />

<SVMLearningLabs />

<KernelLab />

<SVMDatasetStudio />

<SVMExperimentLab />

<LiveSVMPrediction />

<SVMKnowledgeStudio />


      <section className="status">
        <strong>
          Central Lab State
        </strong>

        <span>
          Task: {state.task}
        </span>

        <span>
          Level: {state.level}
        </span>

        <span>
          Kernel: {
            state.parameters.kernel
          }
        </span>

        <span>
          Dataset:{" "}
          {state.dataset?.name ??
            "Built-in lesson"}
        </span>
      </section>
    </main>
  );
}

type CardProps = {
  number: string;
  title: string;
  text: string;
};

function Card({
  number,
  title,
  text,
}: CardProps) {
  return (
    <article className="card">
      <span>{number}</span>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

export default App;