
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Task, TrainResult } from "@/lib/types";

type Level = "basic" | "intermediate" | "advanced";

interface Props {
  task: Task;
  stage: number;
  result: TrainResult | null;
  learningRate?: number;
}

const panel: CSSProperties = {
  background: "#111d31",
  border: "1px solid #293953",
  borderRadius: 16,
  padding: 20,
};

const muted: CSSProperties = {
  color: "#a7b7d0",
  lineHeight: 1.8,
};

const tabStyle = (active: boolean): CSSProperties => ({
  padding: "10px 16px",
  background: active ? "#7555ee" : "#192841",
  color: "#ffffff",
  border: "1px solid #344765",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: active ? 700 : 500,
});

const formulaStyle: CSSProperties = {
  padding: "15px 18px",
  borderRadius: 10,
  background: "#091528",
  border: "1px solid #304566",
  color: "#8ee5d9",
  fontFamily: "monospace",
  overflowX: "auto",
  lineHeight: 1.8,
};

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={{ ...panel, marginTop: 16 }}>
      <h3 style={{ marginTop: 0, color: "#f1f5ff" }}>
        {title}
      </h3>
      <div style={muted}>{children}</div>
    </section>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return <div style={formulaStyle}>{children}</div>;
}

function WeightBar({
  name,
  value,
  color,
}: {
  name: string;
  value: number;
  color: string;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span>{name}</span>
        <strong>{(value * 100).toFixed(2)}%</strong>
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 20,
          background: "#25344c",
          overflow: "hidden",
          marginTop: 7,
        }}
      >
        <div
          style={{
            width: `${Math.min(100, value * 100)}%`,
            height: "100%",
            background: color,
            borderRadius: 20,
            transition: "width 250ms ease",
          }}
        />
      </div>
    </div>
  );
}

export default function AdaBoostTheoryStudio({
  task,
  stage,
  result,
  learningRate = 1,
}: Props) {
  const [level, setLevel] = useState<Level>("basic");
  const [error, setError] = useState(0.2);
  const [demoRate, setDemoRate] = useState(1);
  const [classCount, setClassCount] = useState(2);
  const [round, setRound] = useState<"before" | "after">(
    "before"
  );

  const example = useMemo(() => {
    // Illustrative SAMME classification example:
    // one incorrectly classified observation and four correct ones.
    const before = [
      error,
      ...Array(4).fill((1 - error) / 4),
    ] as number[];

    const alpha =
      demoRate *
      (Math.log((1 - error) / error) +
        Math.log(classCount - 1));

    // SAMME: incorrectly classified sample gets exp(alpha).
    const unnormalized = before.map((weight, index) =>
      index === 0 ? weight * Math.exp(alpha) : weight
    );

    const total = unnormalized.reduce(
      (sum, weight) => sum + weight,
      0
    );

    return {
      alpha,
      before,
      after: unnormalized.map((weight) => weight / total),
    };
  }, [error, demoRate, classCount]);

  const current = result?.stages[
    Math.min(
      Math.max(stage, 0),
      Math.max(0, result.stages.length - 1)
    )
  ];

  const selectedWeights =
    round === "before" ? example.before : example.after;

  return (
    <div style={{ color: "#e6eeff" }}>
      <div
        style={{
          ...panel,
          background:
            "linear-gradient(125deg,#17243e,#241b49)",
        }}
      >
        <div
          style={{
            color: "#8ee5d9",
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          MODELMIND LEARNING LAB
        </div>

        <h2 style={{ fontSize: 27, marginBottom: 8 }}>
          AdaBoost Theory & Mathematics Studio
        </h2>

        <p style={muted}>
          Understand how individual weak learners form an
          ensemble, how errors influence training, and how
          hyperparameters affect predictions.
        </p>

        <div
          style={{
            display: "flex",
            gap: 9,
            flexWrap: "wrap",
            marginTop: 18,
          }}
        >
          {(["basic", "intermediate", "advanced"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                style={tabStyle(level === item)}
                onClick={() => setLevel(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {level === "basic" && (
        <>
          <Block title="1. What is AdaBoost?">
            <p>
              AdaBoost stands for Adaptive Boosting. Instead of
              relying on one large model, it trains several smaller
              models sequentially and combines their predictions.
            </p>
            <p>
              Each new weak learner concentrates more on examples
              that were difficult for earlier learners.
            </p>
          </Block>

          <Block title="2. What is a weak learner?">
            <p>
              A weak learner is usually a small Decision Tree.
              A Decision Stump is a tree with maximum depth 1.
            </p>
            <Formula>
              Decision Stump → Boosting Round → Updated Weights
              → Next Stump
            </Formula>
            <p>
              The strength of AdaBoost comes from combining
              multiple learners, not from making each learner
              individually perfect.
            </p>
          </Block>

          <Block title="3. AdaBoost vs Bagging">
            <p>
              <strong>Bagging:</strong> Trains learners independently
              on resampled data and combines their predictions.
            </p>
            <p>
              <strong>AdaBoost:</strong> Trains learners sequentially,
              changing sample importance based on previous errors.
            </p>
            <p>
              Bagging commonly reduces variance. Boosting can
              reduce bias but may become sensitive to mislabeled
              examples or outliers.
            </p>
          </Block>

          <Block title="4. Classification vs Regression">
            <p>
              <strong>AdaBoost Classifier:</strong> Combines weighted
              votes from weak classifiers.
            </p>
            <p>
              <strong>AdaBoost.R2:</strong> Fits successive
              regressors with error-dependent sample weights and
              combines their predictions using a weighted median.
            </p>
            <p>
              Your selected task: <strong>{task}</strong>.
            </p>
          </Block>
        </>
      )}

      {level === "intermediate" && (
        <>
          <Block title="1. The training process">
            <ol style={{ paddingLeft: 23 }}>
              <li>Give training observations initial weights.</li>
              <li>Train a weak estimator using those weights.</li>
              <li>Measure its weighted training error.</li>
              <li>Compute its contribution to the ensemble.</li>
              <li>Update the training sample weights.</li>
              <li>Repeat until stopping criteria are met.</li>
            </ol>
            <p>
              The weighting and aggregation rules differ between
              classification and regression.
            </p>
          </Block>

          <Block title="2. Understanding hyperparameters">
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <strong>n_estimators</strong>
                <p>
                  Maximum number of weak learners. Too few can
                  underfit. More learners cost additional training
                  time and are not guaranteed to generalize better.
                </p>
              </div>

              <div>
                <strong>learning_rate</strong>
                <p>
                  Controls estimator contributions. Small values
                  can require more boosting rounds.
                </p>
              </div>

              <div>
                <strong>max_depth</strong>
                <p>
                  Controls the complexity of each Decision Tree.
                  Depth 1 creates stumps; greater depth can learn
                  interactions but may overfit.
                </p>
              </div>

              <div>
                <strong>min_samples_leaf</strong>
                <p>
                  Sets the minimum samples in a leaf. Increasing
                  it can smooth tree predictions.
                </p>
              </div>

              <div>
                <strong>test_size</strong>
                <p>
                  Determines the fraction of data reserved for
                  evaluation. Keep test data separate from
                  preprocessing fitting and model selection.
                </p>
              </div>
            </div>
          </Block>

          <Block title="3. Detecting overfitting">
            <p>
              Compare training and testing performance at each
              boosting stage.
            </p>
            <p>
              For classification, compare accuracy and F1.
              For regression, compare R², MAE and RMSE.
            </p>
            <p>
              Increasing training performance with worsening
              test performance can indicate overfitting.
            </p>
          </Block>
        </>
      )}

      {level === "advanced" && (
        <>
          <Block title="1. Weighted classification error">
            <p>
              SAMME classification considers the weight of each
              incorrectly classified training observation.
            </p>
            <Formula>
              ε = Σ(wᵢ × I[yᵢ ≠ h(xᵢ)]) / Σwᵢ
            </Formula>
            <p>
              Here, ε is weighted error, wᵢ is sample importance,
              and I is 1 when a prediction is wrong.
            </p>
          </Block>

          <Block title="2. Estimator contribution">
            <p>
              For the discrete SAMME algorithm with K classes:
            </p>
            <Formula>
              α = learning_rate ×
              [ln((1 − ε) / ε) + ln(K − 1)]
            </Formula>
            <p>
              For binary classification, K = 2 and ln(K − 1)
              equals zero.
            </p>
            <p>
              A smaller weighted error generally produces a
              larger estimator contribution. The expression
              applies to SAMME, not AdaBoost.R2.
            </p>
          </Block>

          <Block title="3. Updating training weights">
            <Formula>
              wᵢ(new) ∝ wᵢ(old) × exp(α × I[wrong])
            </Formula>
            <p>
              Weights are subsequently normalized. Under the
              SAMME update, incorrectly classified observations
              gain importance relative to correct observations.
            </p>
          </Block>

          <Block title="4. AdaBoost.R2 regression">
            <p>
              Regression uses a different boosting mechanism:
              normalized prediction errors determine how sample
              importance changes between fitted regressors.
            </p>
            <p>
              The regression loss can be linear, square, or
              exponential. The final output is obtained through
              a weighted median of the fitted regressors.
            </p>
            <p>
              Do not apply the SAMME classification equation to
              regression estimator weights.
            </p>
          </Block>

          <Block title="5. Missing data and leakage">
            <p>
              Numeric columns can use mean, median, mode, or
              constant imputation. Categorical columns normally
              use most frequent or constant filling.
            </p>
            <p>
              Imputers and encoders must be fitted on training
              data only and then applied to the testing data.
            </p>
            <p>
              The 2D/3D chart of a model with many features is
              a selected-feature slice, with other features
              fixed at representative values.
            </p>
          </Block>
        </>
      )}

      <Block title="Interactive classification weight calculator">
        <p>
          Explore the discrete SAMME calculation using five
          illustrative observations. Exactly one observation
          is incorrectly classified in this example.
        </p>

        {task === "regression" && (
          <p style={{ color: "#fbbf7b" }}>
            This calculator illustrates classification only.
            Your current regression model uses AdaBoost.R2.
          </p>
        )}

        <label style={{ display: "block", marginTop: 16 }}>
          Weighted classification error:{" "}
          <strong>{error.toFixed(2)}</strong>
          <input
            type="range"
            min="0.05"
            max="0.49"
            step="0.01"
            value={error}
            onChange={(event) => {
              setError(Number(event.target.value));
              setRound("before");
            }}
            style={{ width: "100%", marginTop: 9 }}
          />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          Learning rate:{" "}
          <strong>{demoRate.toFixed(2)}</strong>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={demoRate}
            onChange={(event) => {
              setDemoRate(Number(event.target.value));
              setRound("before");
            }}
            style={{ width: "100%", marginTop: 9 }}
          />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          Number of classes
          <select
            value={classCount}
            onChange={(event) => {
              setClassCount(Number(event.target.value));
              setRound("before");
            }}
            style={{
              display: "block",
              marginTop: 8,
              padding: 9,
              background: "#182741",
              color: "white",
              borderRadius: 8,
            }}
          >
            {[2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count} classes
              </option>
            ))}
          </select>
        </label>

        <div style={{ marginTop: 20 }}>
          <Formula>
            Estimator weight α = {example.alpha.toFixed(4)}
          </Formula>
        </div>

        <div
          style={{
            display: "flex",
            gap: 9,
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          <button
            type="button"
            style={tabStyle(round === "before")}
            onClick={() => setRound("before")}
          >
            Before update
          </button>

          <button
            type="button"
            style={tabStyle(round === "after")}
            onClick={() => setRound("after")}
          >
            After update
          </button>
        </div>

        {selectedWeights.map((weight, index) => (
          <WeightBar
            key={index}
            name={`Sample ${index + 1}${
              index === 0 ? " — Incorrect" : " — Correct"
            }`}
            value={weight}
            color={index === 0 ? "#fb7185" : "#54d6c2"}
          />
        ))}

        <p style={{ ...muted, marginTop: 18 }}>
          The red sample represents the incorrectly classified
          observation. Click "After update" to see how its
          normalized importance changes relative to the
          correctly classified samples.
        </p>

        <p style={muted}>
          This is an educational five-sample calculation,
          not a reconstruction of the uploaded dataset's
          individual training weights.
        </p>
      </Block>

      <Block title="Your trained AdaBoost model">
        {!result || !current ? (
          <p>
            Train an AdaBoost model to display its fitted
            boosting-round statistics here.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(145px,1fr))",
                gap: 12,
              }}
            >
              <div style={panel}>
                <div style={muted}>Current round</div>
                <h3>{current.round}</h3>
              </div>

              <div style={panel}>
                <div style={muted}>Estimator error</div>
                <h3>{current.error.toFixed(4)}</h3>
              </div>

              <div style={panel}>
                <div style={muted}>Estimator weight</div>
                <h3>{current.weight.toFixed(4)}</h3>
              </div>

              <div style={panel}>
                <div style={muted}>Fitted estimators</div>
                <h3>{result.actual_estimators}</h3>
              </div>
            </div>

            <p style={{ marginTop: 16 }}>
              The statistics above come from your actual
              trained model. Use the existing stage-playback
              controls to examine different boosting rounds.
            </p>

            <p>
              Selected learning rate:{" "}
              <strong>{learningRate.toFixed(2)}</strong>
            </p>

            <p>
              These statistics show what happened during
              fitting. They do not by themselves prove that
              the model generalizes well.
            </p>
          </>
        )}
      </Block>
    </div>
  );
}
