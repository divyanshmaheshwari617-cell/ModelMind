
"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  Code2,
  GitBranch,
  Info,
  Layers3,
  Lightbulb,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingDown,
  Workflow,
} from "lucide-react";

type Level = "basic" | "intermediate" | "advanced";
type Algorithm = "adaboost" | "gradient";
type Task = "classification" | "regression";

const card =
  "rounded-2xl border border-slate-800 bg-[#111c30] p-5 md:p-6";

const levels: { id: Level; label: string }[] = [
  { id: "basic", label: "Basic" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const algorithmInfo = {
  adaboost: {
    name: "AdaBoost",
    subtitle: "Adaptive Boosting",
    description:
      "Combines sequential weak learners, adjusting attention toward observations that earlier learners find difficult.",
    emphasis: "Sample weighting and learner contribution",
  },
  gradient: {
    name: "Gradient Boosting",
    subtitle: "Gradient-based additive learning",
    description:
      "Builds a prediction function stage by stage, fitting each new learner in the direction that reduces a chosen loss.",
    emphasis: "Loss gradients and successive corrections",
  },
};

const settings = [
  {
    name: "n_estimators",
    scope: "AdaBoost and Gradient Boosting",
    meaning: "Maximum number of boosting stages or estimators.",
    decrease:
      "Usually faster training, but may underfit.",
    increase:
      "More learning capacity and computation; overfitting is possible.",
    experiment:
      "Try 5, 20, 50, and 100. Compare held-out performance and stage curves.",
  },
  {
    name: "learning_rate",
    scope: "AdaBoost and Gradient Boosting",
    meaning:
      "Controls the contribution or influence assigned to successive learners.",
    decrease:
      "Smaller updates; often needs more estimators.",
    increase:
      "Larger contributions; may fit quickly but can generalize poorly.",
    experiment:
      "Try 0.05, 0.1, 0.3, and 1 with the same dataset.",
  },
  {
    name: "max_depth",
    scope:
      "Single Tree, Gradient Boosting, AdaBoost regression",
    meaning:
      "Maximum depth of the underlying decision trees.",
    decrease:
      "Simpler decision regions and reduced tree complexity.",
    increase:
      "Captures more complex interactions, with increased overfitting risk.",
    experiment:
      "Try depth 1, 2, 3, and 6 and compare train/test results.",
  },
  {
    name: "subsample",
    scope: "Gradient Boosting",
    meaning:
      "Fraction of training observations sampled for each boosting stage.",
    decrease:
      "Introduces stochasticity and may reduce variance.",
    increase:
      "At 1.0, each stage trains on the full training sample.",
    experiment:
      "Compare 0.6, 0.8, and 1.0 with the same random seed.",
  },
  {
    name: "test_size",
    scope: "Evaluation",
    meaning:
      "Proportion of data held aside from model training for evaluation.",
    decrease:
      "More training data but fewer observations for evaluation.",
    increase:
      "Larger held-out evaluation set but less training data.",
    experiment:
      "Keep the split fixed when comparing model settings.",
  },
  {
    name: "missing_strategy",
    scope: "Data preprocessing",
    meaning:
      "How numeric missing feature values are replaced using training-data statistics.",
    decrease: "Median: robust to extreme values.",
    increase:
      "Mean: arithmetic average. Most frequent: the most common value.",
    experiment:
      "Try the available strategies on a CSV containing missing numeric values.",
  },
];

const learningContent: Record<
  Level,
  {
    heading: string;
    introduction: string;
    sections: {
      title: string;
      explanation: string;
      example: string;
    }[];
  }
> = {
  basic: {
    heading: "Boosting from the beginning",
    introduction:
      "Boosting is an ensemble learning technique. Instead of trusting one decision tree, we combine several smaller learners. They are trained sequentially so later learners improve upon earlier ones.",
    sections: [
      {
        title: "What is a weak learner?",
        explanation:
          "A weak learner is a relatively simple model. A shallow decision tree is a common example. A weak learner does not need to solve the entire problem by itself.",
        example:
          "One shallow tree may split a dataset by Feature 1, but fail to describe a curved decision boundary.",
      },
      {
        title: "Why train models sequentially?",
        explanation:
          "The next learner is trained with knowledge of the current ensemble. The goal is to improve the overall prediction instead of simply training unrelated trees.",
        example:
          "In a regression problem, an early model might predict values that are too low. Later learners can add corrections.",
      },
      {
        title: "What makes AdaBoost different?",
        explanation:
          "AdaBoost changes the relative importance of observations during fitting. The learner-training procedure pays attention to cases that the current sequence of learners handles poorly.",
        example:
          "If several points are misclassified, later classifiers may train with greater weight on those observations.",
      },
      {
        title: "What makes Gradient Boosting different?",
        explanation:
          "Gradient Boosting improves a prediction function by following a loss-reducing direction. For squared-error regression, the new trees learn corrections related to residuals.",
        example:
          "If a house costs 200 and the current model predicts 170, the residual is +30.",
      },
    ],
  },
  intermediate: {
    heading: "Understand the learning mechanism",
    introduction:
      "Boosting creates an additive ensemble, but AdaBoost and Gradient Boosting use different mechanisms to determine the next learner and its contribution.",
    sections: [
      {
        title: "Sequential ensemble construction",
        explanation:
          "Each stage contributes a fitted estimator to an existing ensemble. The order matters because later estimators depend on the current training process.",
        example:
          "Inspect the stage-1 and stage-20 model surfaces. Their prediction regions can differ substantially.",
      },
      {
        title: "AdaBoost learner errors and weights",
        explanation:
          "For the classic binary AdaBoost derivation, weighted classification error determines a learner coefficient. scikit-learn's fitted estimator weights and errors are exposed in our diagnostics.",
        example:
          "A learner with lower weighted error may receive greater influence, subject to the algorithm's precise formulation.",
      },
      {
        title: "Gradient Boosting residual corrections",
        explanation:
          "For squared-error regression, fitting negative gradients corresponds to fitting residuals. Each additional learner contributes a scaled correction to the existing model.",
        example:
          "A prediction of 6 for an actual value of 10 has residual +4. A new learner can provide a positive correction.",
      },
      {
        title: "Bias, variance, and overfitting",
        explanation:
          "Adding estimators and increasing tree depth can improve training fit, but held-out performance may eventually stop improving. Learning rate, depth, and subsampling influence this balance.",
        example:
          "A training error curve may keep falling while test accuracy stops improving.",
      },
    ],
  },
  advanced: {
    heading: "Mathematics, optimization and diagnostics",
    introduction:
      "At the advanced level, treat Boosting as a sequential optimization procedure. Understand the training objective, learner fitting, estimator contribution, and evaluation limitations.",
    sections: [
      {
        title: "Additive function optimization",
        explanation:
          "Gradient Boosting constructs a function by adding new learners that approximately follow the negative gradient of a differentiable loss with respect to current predictions.",
        example:
          "The gradient direction depends on the loss: squared error, logistic loss, and other objectives create different learning signals.",
      },
      {
        title: "AdaBoost's exponential-loss perspective",
        explanation:
          "The classical binary AdaBoost algorithm can be interpreted in terms of forward stagewise optimization of exponential loss. The fitted weak learner and its coefficient jointly modify the ensemble.",
        example:
          "Sample reweighting and estimator coefficients arise from the binary classification formulation, rather than ordinary residual fitting.",
      },
      {
        title: "Shrinkage and regularization",
        explanation:
          "A smaller learning rate reduces each Gradient Boosting update. Tree depth limits weak-learner complexity, and subsampling can add stochastic regularization.",
        example:
          "Compare 100 stages at learning rate 0.1 against 20 stages at learning rate 0.5. More stages do not automatically guarantee a better test score.",
      },
      {
        title: "Interpretation of prediction surfaces",
        explanation:
          "A two-dimensional prediction surface is a slice of a potentially higher-dimensional model. Other numeric features are held fixed at their training medians.",
        example:
          "A boundary seen with features A and B fixed at particular values may change if feature C changes.",
      },
      {
        title: "Data leakage and honest validation",
        explanation:
          "Feature imputation statistics must be fitted on training data. Comparing model performance requires a common split, and repeated tuning on the test set can lead to optimistic conclusions.",
        example:
          "Use a validation set or cross-validation for serious hyperparameter selection, then reserve a final test set.",
      },
    ],
  },
};

function LearningLevels() {
  const [level, setLevel] = useState<Level>("basic");
  const content = learningContent[level];

  return (
    <section id="learning-levels" className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-violet-300">
          <BookOpen size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Structured Learning
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          Learn Boosting at Your Level
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Choose a difficulty level. Each level adds more
          detail while building on the same core ideas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {levels.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLevel(item.id)}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              level === item.id
                ? "bg-violet-600 text-white"
                : "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={card}>
        <h3 className="text-xl font-bold">{content.heading}</h3>
        <p className="mt-3 text-sm leading-8 text-slate-300">
          {content.introduction}
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {content.sections.map((section, index) => (
            <article
              key={section.title}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-5"
            >
              <span className="text-xs font-bold text-violet-300">
                CONCEPT {String(index + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-3 text-lg font-bold">
                {section.title}
              </h4>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {section.explanation}
              </p>
              <div className="mt-4 rounded-lg border border-sky-500/15 bg-sky-500/5 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <Lightbulb size={14} />
                  Example
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {section.example}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {level === "advanced" && (
        <div className={card}>
          <div className="flex items-center gap-2">
            <Code2 size={19} className="text-emerald-300" />
            <h3 className="text-lg font-bold">
              Core Mathematical Relationships
            </h3>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                name: "Additive Gradient Boosting",
                expression: "Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)",
                detail:
                  "Each stage adds a learning-rate-scaled learner to the existing prediction function.",
              },
              {
                name: "Negative Gradient",
                expression: "rᵢₘ = −∂L(yᵢ, F(xᵢ)) / ∂F(xᵢ)",
                detail:
                  "The fitted learner approximates the negative loss gradient at the current predictions.",
              },
              {
                name: "Squared-Error Residual",
                expression: "rᵢ = yᵢ − ŷᵢ",
                detail:
                  "For half squared-error loss, the negative gradient is the ordinary residual.",
              },
              {
                name: "Classical Binary AdaBoost",
                expression: "αₘ = ½ ln((1 − εₘ) / εₘ)",
                detail:
                  "The classical binary AdaBoost learner coefficient depends on weighted error εₘ. This is a theoretical formula, not a universal formula for every AdaBoost implementation or task.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-5"
              >
                <p className="text-xs text-violet-300">
                  {item.name}
                </p>
                <div className="mt-3 overflow-x-auto font-mono text-sm font-bold text-white">
                  {item.expression}
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-400">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function AlgorithmComparison() {
  const [selected, setSelected] =
    useState<Algorithm>("adaboost");

  const active = algorithmInfo[selected];

  return (
    <section id="algorithm-comparison" className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-emerald-300">
          <GitBranch size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Algorithm Explorer
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          AdaBoost vs Gradient Boosting
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["adaboost", algorithmInfo.adaboost],
            ["gradient", algorithmInfo.gradient],
          ] as const
        ).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            className={`rounded-2xl border p-6 text-left transition ${
              selected === key
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-800 bg-[#111c30] hover:border-slate-600"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-violet-300">
              {item.subtitle}
            </span>
            <h3 className="mt-3 text-xl font-bold">
              {item.name}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {item.description}
            </p>
          </button>
        ))}
      </div>

      <div className={card}>
        <h3 className="text-lg font-bold">{active.name}</h3>
        <p className="mt-2 text-sm text-sky-300">
          Key mechanism: {active.emphasis}
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {(
            selected === "adaboost"
              ? [
                  "Initialize observation weights",
                  "Fit a weak learner",
                  "Evaluate errors and update weighting",
                  "Add the learner to the ensemble",
                ]
              : [
                  "Initialize ensemble predictions",
                  "Calculate loss gradients",
                  "Fit a tree to correction targets",
                  "Update the ensemble prediction",
                ]
          ).map((step, index) => (
            <div
              key={step}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/20 font-bold text-violet-300">
                  {index + 1}
                </span>
                {index < 3 && (
                  <ArrowRight
                    size={16}
                    className="text-slate-500"
                  />
                )}
              </div>
              <p className="text-sm leading-6 text-slate-300">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="p-3">Property</th>
              <th className="p-3">AdaBoost</th>
              <th className="p-3">Gradient Boosting</th>
            </tr>
          </thead>
          <tbody className="text-slate-400">
            {[
              [
                "Core mechanism",
                "Adaptive observation weighting",
                "Loss-gradient-based corrections",
              ],
              [
                "Learner influence",
                "Algorithm-specific estimator weights",
                "Scaled additive learner updates",
              ],
              [
                "Classification",
                "Yes",
                "Yes",
              ],
              [
                "Regression",
                "Yes, with AdaBoost.R2",
                "Yes",
              ],
              [
                "Common trees",
                "Decision stumps for classification",
                "Shallow regression trees",
              ],
              [
                "Lab diagnostics",
                "Estimator weights and errors",
                "Residuals, probability errors, loss",
              ],
              [
                "Subsample control",
                "Not used by this lab's AdaBoost",
                "Supported",
              ],
            ].map(([name, ada, gradient]) => (
              <tr
                key={name}
                className="border-b border-slate-800/80"
              >
                <td className="p-3 font-medium text-slate-200">
                  {name}
                </td>
                <td className="p-3">{ada}</td>
                <td className="p-3">{gradient}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ConceptSimulator() {
  const [algorithm, setAlgorithm] =
    useState<Algorithm>("adaboost");
  const [round, setRound] = useState(0);
  const [learningRate, setLearningRate] =
    useState(0.35);

  const observations = useMemo(
    () => [
      { id: "A", actual: 3, initial: 1.2, difficult: false },
      { id: "B", actual: 8, initial: 3.5, difficult: true },
      { id: "C", actual: 5, initial: 2.2, difficult: false },
      { id: "D", actual: 11, initial: 5.0, difficult: true },
      { id: "E", actual: 6, initial: 4.1, difficult: false },
      { id: "F", actual: 10, initial: 7.0, difficult: true },
    ],
    [],
  );

  // A transparent, simplified teaching demonstration.
  // This is NOT fitted scikit-learn data.
  const weights = observations.map((item) =>
    item.difficult
      ? Math.pow(1.55, round)
      : Math.pow(0.8, round),
  );
  const weightTotal =
    weights.reduce((sum, value) => sum + value, 0) || 1;

  const predictions = observations.map((item) => {
    const fraction =
      1 - Math.pow(1 - learningRate, round);

    return (
      item.initial +
      (item.actual - item.initial) * fraction
    );
  });

  function changeAlgorithm(value: Algorithm) {
    setAlgorithm(value);
    setRound(0);
  }

  return (
    <section id="concept-simulator" className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-sky-300">
          <Sparkles size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Interactive Intuition
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          Understand the Learning Process
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Explore a simplified learning illustration before
          examining the real fitted-model diagnostics above.
          The values in this teaching demonstration are
          illustrative, not predictions from your dataset.
        </p>
      </div>

      <div className={card}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => changeAlgorithm("adaboost")}
            className={`rounded-xl px-4 py-3 text-sm font-bold ${
              algorithm === "adaboost"
                ? "bg-violet-600"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            AdaBoost Illustration
          </button>
          <button
            type="button"
            onClick={() => changeAlgorithm("gradient")}
            className={`rounded-xl px-4 py-3 text-sm font-bold ${
              algorithm === "gradient"
                ? "bg-violet-600"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Regression Correction Illustration
          </button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Conceptual learning round
              </p>
              <p className="mt-2 text-3xl font-bold text-violet-300">
                {round} / 8
              </p>
              <input
                type="range"
                min={0}
                max={8}
                value={round}
                onChange={(event) =>
                  setRound(Number(event.target.value))
                }
                className="mt-5 w-full accent-violet-500"
                aria-label="Conceptual learning round"
              />
            </div>

            {algorithm === "gradient" && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <label className="flex justify-between text-xs text-slate-300">
                  Learning rate
                  <strong className="text-violet-300">
                    {learningRate.toFixed(2)}
                  </strong>
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  value={learningRate}
                  onChange={(event) =>
                    setLearningRate(Number(event.target.value))
                  }
                  className="mt-4 w-full accent-violet-500"
                />
              </div>
            )}

            <div className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <Info size={15} />
                What to observe
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {algorithm === "adaboost"
                  ? "The difficult observations become visually more prominent as the conceptual weight distribution changes."
                  : "The predicted values move toward their targets as successive simplified corrections are added."}
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-5">
            {algorithm === "adaboost" ? (
              <>
                <h3 className="text-lg font-bold">
                  Illustrative Sample Importance
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Bar width represents normalized illustrative
                  weight. These are not actual AdaBoost
                  sample-weight histories.
                </p>

                <div className="mt-6 space-y-5">
                  {observations.map((item, index) => {
                    const relative =
                      weights[index] / weightTotal;

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[45px_minmax(0,1fr)_62px] items-center gap-3"
                      >
                        <span className="font-mono text-sm text-slate-300">
                          {item.id}
                        </span>
                        <div className="h-7 overflow-hidden rounded-lg bg-slate-800">
                          <div
                            className={`h-full rounded-lg transition-all duration-300 ${
                              item.difficult
                                ? "bg-orange-400"
                                : "bg-violet-500"
                            }`}
                            style={{
                              width: `${relative * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-right font-mono text-xs text-slate-300">
                          {(relative * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-6 text-xs leading-6 text-slate-500">
                  Orange: illustrative difficult observations.
                  Violet: illustrative easier observations.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">
                  Illustrative Residual Correction
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Residual = actual value − current prediction.
                </p>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[400px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="p-3">Sample</th>
                        <th className="p-3">Actual</th>
                        <th className="p-3">Prediction</th>
                        <th className="p-3">Residual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((item, index) => {
                        const residual =
                          item.actual - predictions[index];

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-slate-800"
                          >
                            <td className="p-3">{item.id}</td>
                            <td className="p-3 font-mono">
                              {item.actual.toFixed(2)}
                            </td>
                            <td className="p-3 font-mono text-sky-300">
                              {predictions[index].toFixed(2)}
                            </td>
                            <td className="p-3 font-mono text-orange-300">
                              {residual.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HyperparameterGuide() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="parameter-guide" className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-orange-300">
          <SlidersHorizontal size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Experiment Controls
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          Hyperparameter Laboratory Guide
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Understand what each control changes before
          experimenting with real model training.
        </p>
      </div>

      <div className="space-y-3">
        {settings.map((item, index) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-xl border border-slate-800 bg-[#111c30]"
          >
            <button
              type="button"
              onClick={() =>
                setOpenIndex(openIndex === index ? -1 : index)
              }
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
            >
              <div>
                <h3 className="font-mono font-bold text-violet-300">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {item.scope}
                </p>
              </div>
              <span className="text-xl text-slate-400">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>

            {openIndex === index && (
              <div className="border-t border-slate-800 p-5">
                <p className="text-sm leading-7 text-slate-300">
                  {item.meaning}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-xs font-bold text-sky-300">
                      Lower / first option
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {item.decrease}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-xs font-bold text-orange-300">
                      Higher / second option
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {item.increase}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
                  <Target
                    size={17}
                    className="mt-1 shrink-0 text-emerald-300"
                  />
                  <p className="text-sm leading-7 text-slate-300">
                    <strong className="text-emerald-300">
                      Try in the lab:
                    </strong>{" "}
                    {item.experiment}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function PracticalGuide() {
  const [task, setTask] = useState<Task>("classification");

  const steps = [
    {
      title: "Choose your dataset",
      detail:
        "Start with Circles or XOR for classification, or Wave or Nonlinear for regression. You may also upload a CSV.",
    },
    {
      title: "Select inputs and target",
      detail:
        "Choose numeric input features and the output column. Two or more numeric features are required for prediction surfaces.",
    },
    {
      title: "Set the training controls",
      detail:
        "Start with 30 estimators, learning rate 0.1, tree depth 3, and subsample 1.",
    },
    {
      title: "Train and compare",
      detail:
        "Run the Decision Tree, AdaBoost, and Gradient Boosting on the same held-out split.",
    },
    {
      title: "Explore 2D and 3D",
      detail:
        "Inspect the prediction regions, training points, and held-out test points.",
    },
    {
      title: "Play the boosting stages",
      detail:
        "Move between fitted checkpoints to see how the selected ensemble's prediction surface changes.",
    },
    {
      title: "Interpret learning diagnostics",
      detail:
        "Inspect actual estimator weights/errors for AdaBoost, or residual/loss changes for Gradient Boosting.",
    },
    {
      title: "Change one control and retrain",
      detail:
        "Compare results fairly. Focus on held-out performance rather than assuming more stages are always better.",
    },
  ];

  return (
    <section id="experiment-guide" className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-emerald-300">
          <Workflow size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Practical Workflow
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          Your Complete Experiment Guide
        </h2>
      </div>

      <div className={`${card} space-y-4`}>
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex items-start gap-4 border-b border-slate-800 pb-4 last:border-none last:pb-0"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 font-bold text-violet-300">
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className={card}>
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <TrendingDown
            size={19}
            className="text-sky-300"
          />
          How to Evaluate Your Results
        </h3>

        <div className="mt-5 flex gap-2">
          {(["classification", "regression"] as const).map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTask(option)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold capitalize ${
                  task === option
                    ? "bg-violet-600"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {option}
              </button>
            ),
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(task === "classification"
            ? [
                {
                  name: "Accuracy",
                  meaning:
                    "Fraction of held-out predictions that are correct.",
                },
                {
                  name: "Precision",
                  meaning:
                    "How often predicted classes are correct. This lab reports a class-frequency-weighted average.",
                },
                {
                  name: "Recall",
                  meaning:
                    "How much of each true class is recovered, using a weighted average.",
                },
                {
                  name: "F1 Score",
                  meaning:
                    "A weighted harmonic-mean summary of precision and recall.",
                },
              ]
            : [
                {
                  name: "R²",
                  meaning:
                    "Compares prediction error against a constant-mean baseline. Higher is usually better; values may be negative.",
                },
                {
                  name: "MAE",
                  meaning:
                    "Mean absolute prediction error, in the target's original units. Lower is better.",
                },
                {
                  name: "RMSE",
                  meaning:
                    "Root mean squared error, which penalizes larger mistakes more strongly. Lower is better.",
                },
                {
                  name: "Residual",
                  meaning:
                    "Actual target minus predicted target. Residual patterns reveal remaining modeling errors.",
                },
              ]
          ).map((metric) => (
            <div
              key={metric.name}
              className="rounded-xl bg-slate-950 p-4"
            >
              <p className="font-bold text-violet-300">
                {metric.name}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {metric.meaning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommonQuestions() {
  const questions = [
    {
      question: "Does a larger number of trees always improve accuracy?",
      answer:
        "No. More stages provide more learning capacity, but test performance may stop improving or worsen. Compare held-out metrics.",
    },
    {
      question: "Why can a tree and Boosting draw different boundaries?",
      answer:
        "A standalone tree partitions space using one tree structure. Boosting combines multiple sequential contributions, creating a different prediction function.",
    },
    {
      question: "Why does AdaBoost sometimes fit fewer trees than requested?",
      answer:
        "AdaBoost can terminate early depending on the fitted weak learners and task. The lab displays the actual number of fitted estimators.",
    },
    {
      question: "Are the displayed two-dimensional surfaces the complete model?",
      answer:
        "Only when the model has exactly two input features. With additional features, the surface is a slice evaluated at fixed values for the other features.",
    },
    {
      question: "What happens when the CSV contains missing values?",
      answer:
        "The numeric feature imputer is fitted on the training split and then applied to evaluation data and prediction grids. Rows with missing target values are excluded.",
    },
    {
      question: "Are all the educational illustrations real model results?",
      answer:
        "No. The experiment graphs, fitted-model playback, and diagnostics use actual scikit-learn results. The separate Concept Simulator is explicitly illustrative.",
    },
  ];

  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-sky-300">
          <CircleHelp size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Questions & Clarifications
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">
          Common Questions
        </h2>
      </div>

      <div className="space-y-3">
        {questions.map((item, index) => (
          <div
            key={item.question}
            className="rounded-xl border border-slate-800 bg-[#111c30]"
          >
            <button
              type="button"
              onClick={() =>
                setOpen(open === index ? -1 : index)
              }
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="font-semibold">
                {item.question}
              </span>
              <span className="text-xl text-violet-300">
                {open === index ? "−" : "+"}
              </span>
            </button>
            {open === index && (
              <p className="border-t border-slate-800 p-5 text-sm leading-7 text-slate-300">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BoostingTheoryStudio() {
  return (
    <div className="space-y-16 text-white">
      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-[#111c30] to-[#080d19] p-7 md:p-9">
        <div className="flex items-center gap-2 text-violet-300">
          <BrainCircuit size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Theory and Practice
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Understand Every Step of Boosting
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Learn the intuition, algorithms, mathematics,
          parameters, evaluation techniques, and practical
          experimentation workflow of AdaBoost and
          Gradient Boosting.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
          {[
            "Three learning levels",
            "Algorithm comparison",
            "Interactive concepts",
            "Hyperparameters",
            "Practical workflow",
          ].map((name) => (
            <span
              key={name}
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <CheckCircle2
                size={14}
                className="text-emerald-300"
              />
              {name}
            </span>
          ))}
        </div>
      </div>

      <LearningLevels />
      <AlgorithmComparison />
      <ConceptSimulator />
      <HyperparameterGuide />
      <PracticalGuide />
      <CommonQuestions />

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-center gap-2 text-emerald-300">
          <Layers3 size={20} />
          <h3 className="text-lg font-bold">
            Ready for the Real Experiment?
          </h3>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Return to the training studio, choose a dataset,
          train all three models, inspect their prediction
          surfaces, and replay their fitted learning stages.
        </p>
        <a
          href="#training-studio"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500"
        >
          Go to Training Studio
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
