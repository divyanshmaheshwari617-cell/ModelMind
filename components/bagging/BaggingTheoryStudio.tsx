
"use client";

import { useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Database,
  Info,
  Layers3,
  Lightbulb,
  Sigma,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type Level = "basic" | "intermediate" | "advanced";

type Topic = {
  id: string;
  title: string;
  basic: string;
  intermediate: string;
  advanced: string;
  example: string;
  takeaway: string;
  formula?: string;
};

const topics: Topic[] = [
  {
    id: "introduction",
    title: "What Is Bagging?",
    basic:
      "Bagging means Bootstrap Aggregating. Instead of training one model, we train many models on different randomly selected samples and combine their predictions.",
    intermediate:
      "Bagging is an ensemble learning method that trains base estimators on independently generated resamples of the training dataset. The predictions are aggregated to improve stability and potentially reduce variance.",
    advanced:
      "Given a training dataset D and bootstrap datasets D₁*, ..., Dₘ*, we fit estimators f₁, ..., fₘ. Their outputs are aggregated to obtain F(x). Averaging reduces variance most effectively when learner errors are not perfectly correlated.",
    example:
      "Suppose one decision tree predicts a house price of 50 lakh, another predicts 54 lakh, and a third predicts 52 lakh. Their average is 52 lakh.",
    takeaway:
      "Bagging is especially useful for unstable learners, such as deep decision trees.",
    formula: "F(x) = (f₁(x) + f₂(x) + ... + fₘ(x)) / m",
  },
  {
    id: "bootstrap",
    title: "Bootstrap Sampling With Replacement",
    basic:
      "Imagine a dataset containing 100 students. We randomly select students 100 times, putting each selected student back before the next draw. Some students appear more than once, while others are never selected.",
    intermediate:
      "A conventional bootstrap sample contains N draws from N observations, independently sampled with replacement. Every original observation can appear zero, one, or multiple times.",
    advanced:
      "The probability an observation is omitted in one draw is 1−1/N. After N independent draws, its probability of never being selected is (1−1/N)^N, which approaches e⁻¹ ≈ 0.3679 as N grows.",
    example:
      "Original rows: [1, 2, 3, 4, 5]. One possible bootstrap sample is [2, 2, 5, 1, 5]. Rows 3 and 4 are out-of-bag.",
    takeaway:
      "Repeated observations and missing observations are expected outcomes of bootstrap sampling.",
    formula: "P(row is OOB) = (1 − 1/N)^N ≈ 0.368",
  },
  {
    id: "training",
    title: "Training Multiple Base Learners",
    basic:
      "Each sampled dataset trains its own model. Because the training samples differ, the models may learn slightly different patterns.",
    intermediate:
      "Each base estimator is fitted on its own bootstrap sample. Bagging typically fits estimators independently, allowing parallel training. Its base estimator may be a decision tree or another compatible model.",
    advanced:
      "Bagging constructs a distribution of fitted prediction functions induced by resampling the training data. The ensemble approximates the expectation of predictions over this empirical resampling distribution.",
    example:
      "Tree A trains on bootstrap sample A, Tree B trains on sample B, and Tree C trains on sample C. Each produces its own prediction.",
    takeaway:
      "Bagging primarily changes the training sample for each learner rather than sequentially correcting earlier learners.",
  },
  {
    id: "aggregation",
    title: "Combining Predictions",
    basic:
      "For numbers, the models' predictions can be averaged. For categories, the models can vote for the predicted class.",
    intermediate:
      "In regression, Bagging generally averages numeric predictions. In classification, combining class probabilities and choosing the class with the highest average probability can differ from majority voting over predicted labels.",
    advanced:
      "For regression, F(x) = m⁻¹Σfᵢ(x). For probabilistic classification, aggregated probabilities can be calculated as p̄(c|x) = m⁻¹Σpᵢ(c|x), followed by argmax over classes. Decision aggregation and probability aggregation are not always equivalent.",
    example:
      "Regression: 20, 25, and 24 average to 23. Classification: three predicted classes A, A, B give A by hard majority voting.",
    takeaway:
      "The aggregation rule must match the prediction task and estimator behavior.",
    formula: "Regression: F(x) = Σfᵢ(x) / m",
  },
  {
    id: "oob",
    title: "Out-of-Bag Evaluation",
    basic:
      "Some training observations are not selected for a particular learner. We can use those left-out observations to evaluate that learner without using the same observations it trained on.",
    intermediate:
      "For each training observation, OOB estimation combines predictions from only the base learners that did not include that observation in their bootstrap training samples.",
    advanced:
      "OOB evaluation reuses the resampling structure to estimate generalization. With too few estimators, some observations may receive no OOB predictions, making the estimate unreliable. OOB scoring requires row bootstrap sampling in scikit-learn's Bagging estimators.",
    example:
      "If observation 7 was absent from the training samples of Trees 2, 5, and 8, those trees can contribute predictions to its OOB estimate.",
    takeaway:
      "OOB evaluation is useful but should not completely replace independent test-set evaluation.",
  },
  {
    id: "variance",
    title: "Why Bagging Can Reduce Variance",
    basic:
      "A deep decision tree can change a lot if a few training examples change. Bagging averages multiple versions, making the overall prediction potentially more stable.",
    intermediate:
      "Averaging predictions reduces variance when individual errors are sufficiently diverse. It does not automatically eliminate bias, and adding more estimators eventually gives diminishing returns.",
    advanced:
      "If m estimators have equal variance σ² and common pairwise correlation ρ, the variance of their arithmetic mean is σ²[ρ+(1−ρ)/m]. The correlation term determines how much averaging can improve stability under these assumptions.",
    example:
      "Three highly variable trees may disagree on borderline cases. Their aggregated prediction can be less sensitive to particular training samples.",
    takeaway:
      "Bagging often helps high-variance models, but improvements depend on base-model quality and error dependence.",
    formula: "Var(mean) = σ²[ρ + (1 − ρ)/m]",
  },
  {
    id: "parameters",
    title: "Important Bagging Hyperparameters",
    basic:
      "You can change how many models are trained, how many rows each model receives, how many features it uses, and how complex each tree can become.",
    intermediate:
      "n_estimators controls the number of base models. max_samples and max_features control training subsets. bootstrap and bootstrap_features enable replacement sampling for rows and features. max_depth controls the base decision tree.",
    advanced:
      "The effective sample size and feature subspace influence individual learner strength and correlation. Increasing n_estimators usually raises training and inference cost. Bootstrap row sampling is required for scikit-learn OOB scoring. Tree depth changes the bias–variance behavior of each fitted base estimator.",
    example:
      "Try 10 versus 100 estimators while keeping the dataset and random seed fixed. Compare held-out metrics, OOB score, prediction surfaces, and computational cost.",
    takeaway:
      "Tune parameters using appropriate validation procedures rather than maximizing model complexity.",
  },
  {
    id: "evaluation",
    title: "Evaluating Bagging Performance",
    basic:
      "After training, we need to see whether Bagging actually predicts better than one model.",
    intermediate:
      "Compare single-model and Bagging performance on the same train/test split. Classification metrics include accuracy, precision, recall, and F1. Regression metrics include R², MAE, and RMSE.",
    advanced:
      "Reliable evaluation should use leakage-safe preprocessing, consistent splits, appropriate metrics, and preferably repeated validation or cross-validation. OOB scores and independent held-out metrics answer related but different evaluation questions.",
    example:
      "If a single tree has 0.82 test accuracy and Bagging has 0.87, Bagging performs better on that split. The observed difference alone does not establish superiority on every dataset.",
    takeaway:
      "Actual held-out performance matters more than simply increasing the number of learners.",
  },
  {
    id: "limitations",
    title: "Advantages, Limitations, and Applications",
    basic:
      "Bagging can improve stability and reduce sensitivity to noisy training samples. However, many models take more resources than one, and Bagging will not solve every prediction problem.",
    intermediate:
      "Advantages include parallelizable fitting, potential variance reduction, and built-in OOB assessment with bootstrap sampling. Limitations include computational cost, reduced interpretability, and limited benefits for consistently biased learners.",
    advanced:
      "Bagging is not guaranteed to lower test error. Correlated base estimators restrict variance reduction. Data leakage, temporal dependence, class imbalance, poorly selected features, and distribution shifts still require proper treatment.",
    example:
      "Bagging can be evaluated for customer churn, medical risk, demand forecasting, or financial predictions, provided application-specific validation is performed.",
    takeaway:
      "Bagging is a useful ensemble strategy, not a universal replacement for a well-chosen single model.",
  },
];

const parameterRows = [
  ["n_estimators", "Number of fitted base learners"],
  ["max_samples", "Fraction or number of training rows used by each learner"],
  ["max_features", "Fraction or number of input features available to each learner"],
  ["bootstrap", "Sample training observations with replacement"],
  ["bootstrap_features", "Sample feature indices with replacement"],
  ["max_depth", "Maximum depth of each decision tree base learner"],
  ["oob_score", "Calculate an out-of-bag score when row bootstrap is enabled"],
  ["random_state", "Control reproducibility of random sampling"],
];

const panel =
  "rounded-2xl border border-slate-800 bg-slate-900/85 p-5 md:p-6";

export default function BaggingTheoryStudio() {
  const [level, setLevel] = useState<Level>("basic");
  const [openTopic, setOpenTopic] = useState("introduction");
  const [showParameters, setShowParameters] = useState(true);

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-7 md:p-9">
        <div className="flex items-center gap-2 text-violet-300">
          <Sparkles size={19} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ModelMind · Detailed Bagging Education
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Bagging Theory & Mathematical Intuition
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
          Learn bootstrap sampling, independent base learners,
          prediction aggregation, out-of-bag evaluation,
          bias–variance theory, hyperparameters, and practical
          limitations through progressive explanations.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["basic", "intermediate", "advanced"] as const).map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLevel(option)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold capitalize transition ${
                  level === option
                    ? "bg-violet-600 text-white"
                    : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-violet-400"
                }`}
              >
                {option}
              </button>
            ),
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className={panel}>
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <BookOpen size={21} className="text-violet-300" />
            Guided Bagging Lessons
          </h3>

          <div className="mt-6 space-y-3">
            {topics.map((topic, index) => {
              const expanded = openTopic === topic.id;

              return (
                <article
                  key={topic.id}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenTopic(expanded ? "" : topic.id)
                    }
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <span className="rounded-lg bg-violet-500/15 px-3 py-2 font-mono text-xs text-violet-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="flex-1 text-sm font-semibold">
                      {topic.title}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expanded && (
                    <div className="space-y-5 border-t border-slate-800 p-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
                          {level} explanation
                        </p>

                        <p className="mt-3 text-sm leading-8 text-slate-300">
                          {topic[level]}
                        </p>
                      </div>

                      {topic.formula && (
                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                          <p className="flex items-center gap-2 text-xs font-bold text-violet-300">
                            <Sigma size={17} />
                            Mathematical Intuition
                          </p>
                          <p className="mt-3 overflow-x-auto font-mono text-sm leading-7 text-slate-100">
                            {topic.formula}
                          </p>
                        </div>
                      )}

                      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-sky-300">
                          <Lightbulb size={17} />
                          Example
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {topic.example}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="text-sm font-semibold text-emerald-300">
                          Key Takeaway
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {topic.takeaway}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <section className={panel}>
            <h3 className="flex items-center gap-2 font-bold">
              <Layers3 size={19} className="text-violet-300" />
              How Bagging Works
            </h3>

            <div className="mt-5 space-y-3">
              {[
                "Start with training data",
                "Generate bootstrap samples",
                "Fit independent base learners",
                "Combine model predictions",
                "Evaluate on unseen observations",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 font-mono text-xs text-violet-300">
                    {index + 1}
                  </span>
                  <span className="text-xs leading-6 text-slate-300">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className={panel}>
            <h3 className="flex items-center gap-2 font-bold">
              <BrainCircuit size={19} className="text-sky-300" />
              Bagging vs Single Tree
            </h3>

            <p className="mt-4 text-sm leading-8 text-slate-300">
              A single decision tree learns one fitted
              structure. Bagging trains multiple trees
              on resampled datasets and combines their
              predictions, potentially reducing sensitivity
              to the training sample.
            </p>

            <p className="mt-4 text-xs leading-7 text-slate-400">
              Use the Training Studio to compare actual
              fitted predictions and metrics.
            </p>
          </section>

          <section className={panel}>
            <h3 className="flex items-center gap-2 font-bold">
              <Database size={19} className="text-emerald-300" />
              Important Distinction
            </h3>

            <p className="mt-4 text-sm leading-8 text-slate-300">
              Bagging is a general ensemble technique.
              Random Forest adds further tree-specific
              randomness, commonly through feature
              selection at splits. A Bagging ensemble
              of decision trees is not automatically
              identical to a Random Forest.
            </p>
          </section>
        </aside>
      </div>

      <section className={panel}>
        <button
          type="button"
          onClick={() => setShowParameters((previous) => !previous)}
          aria-expanded={showParameters}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <SlidersHorizontal size={20} className="text-violet-300" />
            Bagging Hyperparameter Reference
          </h3>
          <ChevronDown
            size={19}
            className={`transition-transform ${
              showParameters ? "rotate-180" : ""
            }`}
          />
        </button>

        {showParameters && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="p-3">Parameter</th>
                  <th className="p-3">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {parameterRows.map(([name, explanation]) => (
                  <tr
                    key={name}
                    className="border-t border-slate-800"
                  >
                    <td className="p-3 font-mono text-violet-300">
                      {name}
                    </td>
                    <td className="p-3 leading-7 text-slate-300">
                      {explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-slate-500">
          <Info size={16} className="mt-1 shrink-0" />
          These explanations describe general Bagging concepts
          and scikit-learn parameters. The interactive controls
          available in your Training Studio depend on the
          backend configuration.
        </p>
      </section>
    </div>
  );
}
