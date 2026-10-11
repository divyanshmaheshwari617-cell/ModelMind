
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  GitMerge,
  Info,
  Layers3,
  Lightbulb,
  Network,
  Scale,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

type Level = "basic" | "intermediate" | "advanced";

const levels: {
  id: Level;
  title: string;
  description: string;
}[] = [
  {
    id: "basic",
    title: "Basic",
    description: "Build intuition from examples",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Understand calculations and workflow",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Study validation, leakage and trade-offs",
  },
];

const panel =
  "rounded-2xl border border-slate-800 bg-[#0b1426] p-5 md:p-6";

const baseModels = [
  {
    name: "Linear Model",
    short: "Linear",
    color: "#38bdf8",
    role: "Learns a linear relationship or decision boundary.",
  },
  {
    name: "K-Nearest Neighbors",
    short: "KNN",
    color: "#a78bfa",
    role: "Predicts using nearby observations.",
  },
  {
    name: "Random Forest",
    short: "Forest",
    color: "#34d399",
    role: "Combines many decision trees.",
  },
];

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold text-white">
        {title}
      </h3>

      {description && (
        <p className="mt-3 text-sm leading-7 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function Formula({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 text-center font-mono text-sm leading-8 text-violet-200">
      {children}
    </div>
  );
}

function ConceptCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-5">
      <h4 className="font-bold text-violet-200">
        {title}
      </h4>

      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
        {children}
      </div>
    </div>
  );
}

function FlowDiagram({
  stacking,
}: {
  stacking: boolean;
}) {
  return (
    <div className={`${panel} space-y-4`}>
      <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">
        Conceptual architecture
      </p>

      <div className="mx-auto max-w-sm rounded-xl border border-slate-700 bg-slate-950 p-4 text-center font-semibold">
        Input Dataset
      </div>

      <ArrowDown
        className="mx-auto text-violet-300"
        size={24}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {baseModels.map((model) => (
          <div
            key={model.name}
            className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-center"
          >
            <span
              className="mx-auto block h-3 w-3 rounded-full"
              style={{ backgroundColor: model.color }}
            />

            <p className="mt-3 font-semibold">
              {model.name}
            </p>

            <p className="mt-2 text-xs leading-6 text-slate-400">
              {model.role}
            </p>
          </div>
        ))}
      </div>

      <ArrowDown
        className="mx-auto text-violet-300"
        size={24}
      />

      <div className="mx-auto max-w-xl rounded-xl border border-violet-500/30 bg-violet-500/10 p-5 text-center">
        <h4 className="font-bold">
          {stacking
            ? "Meta-Feature Vector"
            : "Voting Aggregation"}
        </h4>

        <p className="mt-2 text-xs leading-6 text-slate-300">
          {stacking
            ? "Base predictions or probabilities become inputs to a trained second-level model."
            : "Combine predicted labels, probabilities, or numeric outputs using fixed weights."}
        </p>
      </div>

      {stacking && (
        <>
          <ArrowDown
            className="mx-auto text-violet-300"
            size={24}
          />

          <div className="mx-auto max-w-sm rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-center">
            <BrainCircuit
              size={22}
              className="mx-auto text-sky-300"
            />

            <p className="mt-2 font-semibold">
              Trained Meta-Learner
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Learns how to combine base predictions
            </p>
          </div>
        </>
      )}

      <ArrowDown
        className="mx-auto text-emerald-300"
        size={24}
      />

      <div className="mx-auto max-w-sm rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center font-bold text-emerald-300">
        Final Ensemble Prediction
      </div>
    </div>
  );
}

function VotingCalculator() {
  const [predictions, setPredictions] = useState([
    1, 0, 1,
  ]);

  const [weights, setWeights] = useState([
    1, 1, 1,
  ]);

  const votes = useMemo(() => {
    let zero = 0;
    let one = 0;

    predictions.forEach((value, index) => {
      if (value === 0) {
        zero += weights[index];
      } else {
        one += weights[index];
      }
    });

    return {
      zero,
      one,
      winner: one > zero ? 1 : 0,
    };
  }, [predictions, weights]);

  return (
    <div className={panel}>
      <div className="flex items-center gap-2">
        <SlidersHorizontal
          size={19}
          className="text-violet-300"
        />

        <h3 className="text-lg font-bold">
          Interactive Hard Voting
        </h3>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        Educational example: change each model&apos;s
        predicted class and voting weight. See how the
        final weighted majority changes.
      </p>

      <div className="mt-5 space-y-4">
        {baseModels.map((model, index) => (
          <div
            key={model.name}
            className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 md:grid-cols-[1fr_120px_1fr]"
          >
            <div>
              <p className="font-semibold">
                {model.name}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Example base learner
              </p>
            </div>

            <label className="text-xs text-slate-400">
              Predicted class

              <select
                value={predictions[index]}
                onChange={(event) => {
                  const next = [...predictions];
                  next[index] = Number(
                    event.target.value,
                  );
                  setPredictions(next);
                }}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-[#0e1729] p-2 text-sm text-white"
              >
                <option value={0}>Class 0</option>
                <option value={1}>Class 1</option>
              </select>
            </label>

            <label className="text-xs text-slate-400">
              Weight: {weights[index].toFixed(1)}

              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={weights[index]}
                onChange={(event) => {
                  const next = [...weights];
                  next[index] = Number(
                    event.target.value,
                  );
                  setWeights(next);
                }}
                className="mt-4 w-full accent-violet-500"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Class 0 votes", votes.zero.toFixed(1)],
          ["Class 1 votes", votes.one.toFixed(1)],
          [
            "Winning class",
            weights.some((weight) => weight > 0)
              ? `Class ${votes.winner}`
              : "No active weights",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-center"
          >
            <p className="text-xs text-slate-400">
              {label}
            </p>

            <p className="mt-2 text-xl font-bold text-violet-300">
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-400">
        In a weighted tie, scikit-learn&apos;s hard voting
        selects the lowest encoded class. At least one
        positive weight is required for a valid ensemble.
      </p>
    </div>
  );
}

function SoftVotingCalculator() {
  const [probabilities, setProbabilities] = useState([
    0.8, 0.3, 0.7,
  ]);

  const [weights, setWeights] = useState([
    1, 1, 1,
  ]);

  const total = weights.reduce(
    (sum, value) => sum + value,
    0,
  );

  const combined =
    total > 0
      ? probabilities.reduce(
          (sum, value, index) =>
            sum + value * weights[index],
          0,
        ) / total
      : null;

  return (
    <div className={panel}>
      <SectionHeading
        title="Interactive Soft Voting"
        description="Educational example: adjust each learner's probability for Class 1 and its voting weight."
      />

      <div className="mt-5 space-y-5">
        {baseModels.map((model, index) => (
          <div key={model.name}>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>{model.name}</span>
              <span className="font-mono text-sky-300">
                P(Class 1) ={" "}
                {probabilities[index].toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={probabilities[index]}
              onChange={(event) => {
                const next = [...probabilities];
                next[index] = Number(
                  event.target.value,
                );
                setProbabilities(next);
              }}
              className="mt-3 w-full accent-sky-500"
            />

            <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
              <span>Weight: {weights[index]}</span>

              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={weights[index]}
                onChange={(event) => {
                  const next = [...weights];
                  next[index] = Number(
                    event.target.value,
                  );
                  setWeights(next);
                }}
                className="flex-1 accent-violet-500"
              />
            </div>
          </div>
        ))}
      </div>

      <Formula>
        P(Class 1) = Σ(weight × probability)
        {" "}÷ Σ(weight)
      </Formula>

      <div className="mt-5 rounded-xl border border-sky-500/25 bg-sky-500/5 p-5 text-center">
        <p className="text-xs text-slate-400">
          Weighted ensemble probability
        </p>

        <p className="mt-2 text-3xl font-bold text-sky-300">
          {combined === null
            ? "N/A"
            : combined.toFixed(4)}
        </p>

        <p className="mt-3 text-sm text-slate-300">
          {combined === null
            ? "Assign a positive weight to at least one model."
            : `Predicted class: ${
                combined > 0.5 ? 1 : 0
              }`}
        </p>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-400">
        This is a two-class illustration. A tie at
        0.5 selects Class 0 when class indices are 0
        and 1. In actual multiclass voting, every
        class-probability vector is combined.
        Probability quality and calibration matter.
      </p>
    </div>
  );
}

function RegressionCalculator() {
  const [values, setValues] = useState([
    42, 55, 48,
  ]);

  const [weights, setWeights] = useState([
    1, 1, 1,
  ]);

  const totalWeight = weights.reduce(
    (sum, value) => sum + value,
    0,
  );

  const average =
    totalWeight > 0
      ? values.reduce(
          (sum, value, index) =>
            sum + value * weights[index],
          0,
        ) / totalWeight
      : null;

  return (
    <div className={panel}>
      <SectionHeading
        title="Weighted Voting Regression"
        description="Educational example: change three numeric predictions and see their weighted average."
      />

      <div className="mt-5 space-y-4">
        {baseModels.map((model, index) => (
          <div
            key={model.name}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <p className="font-semibold">
              {model.name}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="text-xs text-slate-400">
                Prediction

                <input
                  type="number"
                  value={values[index]}
                  onChange={(event) => {
                    const next = [...values];
                    const parsed = Number(
                      event.target.value,
                    );

                    next[index] = Number.isFinite(parsed)
                      ? parsed
                      : 0;

                    setValues(next);
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-[#0e1729] p-2 text-sm text-white"
                />
              </label>

              <label className="text-xs text-slate-400">
                Weight: {weights[index]}

                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={weights[index]}
                  onChange={(event) => {
                    const next = [...weights];
                    next[index] = Number(
                      event.target.value,
                    );
                    setWeights(next);
                  }}
                  className="mt-4 w-full accent-violet-500"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <Formula>
        Prediction = Σ(weight × prediction)
        {" "}÷ Σ(weight)
      </Formula>

      <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5 text-center">
        <p className="text-xs text-slate-400">
          Combined regression prediction
        </p>

        <p className="mt-2 text-3xl font-bold text-emerald-300">
          {average === null
            ? "N/A"
            : average.toFixed(4)}
        </p>
      </div>
    </div>
  );
}

function BasicTheory() {
  return (
    <div className="space-y-6">
      <section className={panel}>
        <SectionHeading
          title="1. What Is Ensemble Learning?"
          description="Ensemble learning combines multiple machine learning models to produce one prediction."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ConceptCard title="Diversity">
            <p>
              Different algorithms can learn different
              patterns from the same training dataset.
            </p>
          </ConceptCard>

          <ConceptCard title="Combination">
            <p>
              An ensemble combines predictions rather
              than relying entirely on one algorithm.
            </p>
          </ConceptCard>

          <ConceptCard title="Generalization">
            <p>
              Combining complementary models can improve
              performance, although improvement is not
              guaranteed.
            </p>
          </ConceptCard>
        </div>
      </section>

      <section>
        <SectionHeading
          title="2. Voting: Fixed Combination"
          description="Voting combines the predictions of already-fitted models using a specified rule."
        />

        <div className="mt-5">
          <FlowDiagram stacking={false} />
        </div>
      </section>

      <VotingCalculator />

      <section>
        <SectionHeading
          title="3. Stacking: Learned Combination"
          description="Stacking uses another model to learn from the predictions of its base learners."
        />

        <div className="mt-5">
          <FlowDiagram stacking />
        </div>
      </section>

      <section className={panel}>
        <SectionHeading
          title="4. Voting vs Stacking"
        />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="p-3">Property</th>
                <th className="p-3">Voting</th>
                <th className="p-3">Stacking</th>
              </tr>
            </thead>

            <tbody>
              {[
                [
                  "Combination",
                  "Fixed aggregation rule",
                  "Trained meta-learner",
                ],
                [
                  "Extra training",
                  "No meta-model",
                  "Meta-model must be fitted",
                ],
                [
                  "Inputs",
                  "Labels or probabilities",
                  "Predictions or probabilities",
                ],
                [
                  "Complexity",
                  "Usually lower",
                  "Usually higher",
                ],
                [
                  "Main risk",
                  "Poor or redundant members",
                  "Leakage and overfitting",
                ],
              ].map((entry) => (
                <tr
                  key={entry[0]}
                  className="border-b border-slate-800"
                >
                  {entry.map((value, index) => (
                    <td
                      key={index}
                      className="p-3 text-slate-300"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function IntermediateTheory() {
  return (
    <div className="space-y-6">
      <section className={panel}>
        <SectionHeading
          title="1. Hard Voting Mathematics"
          description="Each classifier predicts a class label. The ensemble chooses the class with the highest weighted vote count."
        />

        <Formula>
          Predicted class = argmax over c
          {" "}Σ [weightᵢ × I(modelᵢ predicts c)]
        </Formula>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          I(·) equals 1 when a model predicts the
          class being counted and 0 otherwise.
          Uniform weights produce ordinary majority
          voting. Nonuniform weights produce weighted
          majority voting.
        </p>
      </section>

      <SoftVotingCalculator />

      <RegressionCalculator />

      <section className={panel}>
        <SectionHeading
          title="2. How Stacking Trains"
          description="A correct stacking workflow must produce suitable training examples for its second-level model."
        />

        <div className="mt-5 space-y-3">
          {[
            {
              title: "Step 1: Split the dataset",
              detail:
                "Keep the final test data outside model training and tuning.",
            },
            {
              title: "Step 2: Create cross-validation folds",
              detail:
                "Partition training observations into folds.",
            },
            {
              title: "Step 3: Generate out-of-fold predictions",
              detail:
                "Train base learners on the other folds and predict each held-out fold.",
            },
            {
              title: "Step 4: Train the meta-learner",
              detail:
                "Use the out-of-fold predictions as meta-features.",
            },
            {
              title: "Step 5: Refit base learners",
              detail:
                "Fit base learners on the full training split for future predictions.",
            },
            {
              title: "Step 6: Evaluate on the test split",
              detail:
                "Pass test observations through the fitted base learners and meta-learner.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 font-bold text-violet-300">
                {index + 1}
              </span>

              <div>
                <h4 className="font-bold">
                  {item.title}
                </h4>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={panel}>
        <SectionHeading
          title="3. What Are Meta-Features?"
          description="Meta-features are new inputs generated by base learners and passed into the stacking final estimator."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ConceptCard title="Regression">
            <p>
              Each base regressor contributes a numeric
              prediction. With three base models and
              no passthrough, the meta-learner receives
              three prediction features.
            </p>
          </ConceptCard>

          <ConceptCard title="Classification">
            <p>
              The current lab uses predicted class
              probabilities. With binary classes,
              scikit-learn keeps one probability column
              per base model. For multiclass tasks,
              it normally keeps one column per class
              per base model.
            </p>
          </ConceptCard>
        </div>

        <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
          <p className="text-sm leading-7 text-slate-300">
            <strong>Passthrough:</strong> When enabled,
            the original selected features are appended
            to the prediction-based meta-features.
            This allows the final model to use both
            original inputs and base predictions.
          </p>
        </div>
      </section>
    </div>
  );
}

function AdvancedTheory() {
  return (
    <div className="space-y-6">
      <section className={panel}>
        <SectionHeading
          title="1. The Data Leakage Problem"
          description="A stacking meta-learner must not be trained on misleading base-model predictions obtained from the same observations used to fit those base models."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-5">
            <div className="flex items-center gap-2 text-rose-300">
              <ShieldAlert size={20} />
              <h4 className="font-bold">
                Risky approach
              </h4>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Fit base learners on all training rows,
              predict those same rows, then train the
              meta-model using potentially overfitted
              in-sample predictions.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 size={20} />
              <h4 className="font-bold">
                Out-of-fold approach
              </h4>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Train on K−1 folds and predict the
              remaining fold. Repeat until every
              training example has out-of-fold base
              predictions for meta-learning.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Out-of-fold training helps reduce stacking
          leakage, but the full preprocessing pipeline
          must also respect fold boundaries. Our
          backend puts imputation and scaling inside
          scikit-learn pipelines so these operations
          are refitted within stacking folds.
        </p>
      </section>

      <section className={panel}>
        <SectionHeading
          title="2. Important Hyperparameters"
          description="Understand which controls affect each part of the fitted ensemble."
        />

        <div className="mt-5 space-y-3">
          {[
            {
              name: "Voting weights",
              effect:
                "Change relative influence of base learners in voting. They do not directly control the stacking meta-learner.",
            },
            {
              name: "KNN neighbors",
              effect:
                "Smaller values can fit local patterns more closely; larger values smooth predictions.",
            },
            {
              name: "Forest estimators",
              effect:
                "Control the number of trees inside the Random Forest base learner, not the number of ensemble members.",
            },
            {
              name: "Forest max depth",
              effect:
                "Constrains tree complexity and influences bias, variance, and training cost.",
            },
            {
              name: "Stacking CV folds",
              effect:
                "Determine how out-of-fold predictions are produced during meta-learner training.",
            },
            {
              name: "Stacking passthrough",
              effect:
                "Adds original feature values to the meta-learner input alongside base predictions.",
            },
            {
              name: "Missing-value strategy",
              effect:
                "Controls how missing numeric feature values are imputed inside the model pipelines.",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="font-bold text-violet-200">
                {item.name}
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                {item.effect}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={panel}>
        <SectionHeading
          title="3. When Ensembles May Not Help"
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ConceptCard title="Highly correlated errors">
            <p>
              If every base model makes similar errors,
              combining them may provide little benefit.
            </p>
          </ConceptCard>

          <ConceptCard title="Weak probability calibration">
            <p>
              Soft Voting depends on probability values.
              Poor calibration can hurt probability
              averaging even when classification
              accuracy appears reasonable.
            </p>
          </ConceptCard>

          <ConceptCard title="Small datasets">
            <p>
              A complex stacking meta-learner can be
              unstable when few training samples are
              available.
            </p>
          </ConceptCard>

          <ConceptCard title="More computation">
            <p>
              Stacking fits models repeatedly during
              cross-validation, increasing training
              time and memory consumption.
            </p>
          </ConceptCard>
        </div>
      </section>

      <section className={panel}>
        <SectionHeading
          title="4. Sound Model Comparison"
        />

        <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
          <p>
            <strong>Use identical splits:</strong>{" "}
            Compare individual models and ensembles
            on the same untouched test observations.
          </p>

          <p>
            <strong>Tune separately:</strong>{" "}
            Use validation data or cross-validation
            to choose hyperparameters. Do not repeatedly
            optimize using the final test score.
          </p>

          <p>
            <strong>Choose suitable metrics:</strong>{" "}
            Classification can use accuracy, precision,
            recall, F1 and confusion matrices.
            Regression can use MAE, RMSE and R².
          </p>

          <p>
            <strong>Consider class imbalance:</strong>{" "}
            Accuracy alone may conceal weak performance
            on rare classes.
          </p>

          <p>
            <strong>Understand stacking CV:</strong>{" "}
            Cross-validation inside Stacking is used
            to generate training data for its
            meta-learner. It is not, by itself,
            a complete external model-selection
            evaluation.
          </p>
        </div>
      </section>

      <section className={panel}>
        <SectionHeading
          title="5. The Models Used in This Lab"
        />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="p-3">Role</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Regression</th>
              </tr>
            </thead>

            <tbody>
              {[
                [
                  "Base learner 1",
                  "Logistic Regression",
                  "Ridge Regression",
                ],
                [
                  "Base learner 2",
                  "KNN Classifier",
                  "KNN Regressor",
                ],
                [
                  "Base learner 3",
                  "Random Forest Classifier",
                  "Random Forest Regressor",
                ],
                [
                  "Voting",
                  "Hard and Soft Voting",
                  "Weighted Voting Regressor",
                ],
                [
                  "Stacking final estimator",
                  "Logistic Regression",
                  "Ridge Regression",
                ],
              ].map((row) => (
                <tr
                  key={row[0]}
                  className="border-b border-slate-800"
                >
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className="p-3 text-slate-300"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function VotingStackingTheoryStudio() {
  const [level, setLevel] =
    useState<Level>("basic");

  const current = levels.find(
    (item) => item.id === level,
  );

  return (
    <section className="space-y-6 rounded-3xl border border-violet-500/25 bg-[#0e1729] p-5 text-white md:p-8">
      <header>
        <div className="flex items-center gap-2 text-violet-300">
          <BookOpen size={20} />

          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Learning Studio
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Voting & Stacking — Complete Theory
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Learn ensemble intuition, underlying
          mathematics, correct training workflows,
          validation principles, and practical
          hyperparameters at your own level.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {levels.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLevel(item.id)}
            className={`rounded-xl border p-4 text-left transition ${
              level === item.id
                ? "border-violet-400 bg-violet-600/20"
                : "border-slate-800 bg-slate-950 hover:border-violet-500/50"
            }`}
          >
            <p className="font-bold">
              {item.title}
            </p>

            <p className="mt-2 text-xs leading-6 text-slate-400">
              {item.description}
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-violet-300">
        {level === "basic" && <Lightbulb size={18} />}
        {level === "intermediate" && <Scale size={18} />}
        {level === "advanced" && <Network size={18} />}

        <span className="font-semibold">
          {current?.title} learning level
        </span>
      </div>

      {level === "basic" && <BasicTheory />}
      {level === "intermediate" && <IntermediateTheory />}
      {level === "advanced" && <AdvancedTheory />}

      <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <Info
          size={18}
          className="mt-1 shrink-0 text-sky-300"
        />

        <p className="text-xs leading-7 text-slate-300">
          The sliders and calculators in this theory
          section demonstrate concepts using illustrative
          values. Actual model training and fitted
          prediction explanations are available in the
          Training, Voting Decision, and Stacking
          Meta-Learner Studios.
        </p>
      </div>
    </section>
  );
}
