
"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

type LearningLevel = "basic" | "medium" | "advanced";

interface Props {
  degree?: number;
  regularization?: "none" | "ridge" | "lasso";
  featureName?: string;
  targetName?: string;
  datasetName?: string;
}

interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  basic: string[];
  medium: string[];
  advanced: string[];
}

const lessons: Lesson[] = [
  {
    id: "intuition",
    title: "Why Polynomial Regression?",
    subtitle: "Understand why straight lines are not always enough.",
    basic: [
      "Linear regression fits a straight line through data.",
      "Many real-world relationships are curved. For example, the relationship between speed and braking distance is often nonlinear.",
      "Polynomial regression allows a linear model to fit curves by introducing powers of input features.",
      "A degree-2 polynomial can form a parabola, while higher degrees can represent more complex shapes.",
    ],
    medium: [
      "Polynomial regression uses feature engineering to transform x into x, x², x³, and additional powers.",
      "The transformed features are passed into a linear regression model.",
      "Although the relationship is nonlinear in x, the model remains linear in its coefficients.",
      "The degree determines the maximum power of the input variable and controls model flexibility.",
    ],
    advanced: [
      "Polynomial regression is linear regression applied to a nonlinear basis expansion.",
      "For one feature, the polynomial basis is φ(x) = [1, x, x², ..., xᵈ].",
      "The model is ŷ = θᵀφ(x), where θ contains the intercept and polynomial coefficients.",
      "Higher degrees increase the hypothesis space and may reduce training bias while increasing variance.",
      "Polynomial expansion can cause ill-conditioned design matrices, especially with high-degree or poorly scaled features.",
    ],
  },
  {
    id: "features",
    title: "Polynomial Feature Expansion",
    subtitle: "See how ordinary inputs become polynomial features.",
    basic: [
      "Suppose a dataset contains an input x = 3.",
      "For degree 1, the model uses x = 3.",
      "For degree 2, it also uses x² = 9.",
      "For degree 3, it additionally uses x³ = 27.",
      "These extra features allow the model to learn curved patterns.",
    ],
    medium: [
      "PolynomialFeatures from scikit-learn automatically creates powers and interaction terms.",
      "For one input x and degree 3, the expanded representation is [1, x, x², x³].",
      "For two inputs x₁ and x₂ with degree 2, the expansion includes x₁, x₂, x₁², x₁x₂, and x₂².",
      "The interaction term x₁x₂ allows the effect of one feature to depend on the other.",
    ],
    advanced: [
      "For n original features and maximum degree d, the number of polynomial terms including bias is C(n+d, d).",
      "For two features and degree 3, the expansion contains 10 terms including the bias.",
      "PolynomialFeatures(interaction_only=True) excludes repeated powers such as x₁².",
      "The transformed feature matrix can become very large as the number of original features and degree increase.",
      "Regularization and feature scaling are especially important when polynomial expansion creates many correlated features.",
    ],
  },
  {
    id: "training",
    title: "How the Model Learns",
    subtitle: "Follow the training process step by step.",
    basic: [
      "Step 1: Read the input features and target values.",
      "Step 2: Convert the inputs into polynomial features.",
      "Step 3: Find coefficients that produce predictions close to the actual targets.",
      "Step 4: Calculate the difference between predictions and actual values.",
      "Step 5: Evaluate the fitted model on data that was not used for training.",
    ],
    medium: [
      "The training pipeline first splits the dataset into training and testing portions.",
      "Missing feature values are imputed using statistics calculated from the training set only.",
      "PolynomialFeatures expands the input matrix into nonlinear basis features.",
      "LinearRegression, Ridge, or Lasso estimates the coefficients.",
      "Predictions are evaluated using MAE, MSE, RMSE, and R².",
    ],
    advanced: [
      "Ordinary least squares minimizes ||y - Xθ||², where X is the polynomial design matrix.",
      "Ridge minimizes squared error plus α||θ||², normally excluding the intercept from regularization.",
      "Lasso minimizes squared error plus an L1 coefficient penalty, encouraging sparse solutions.",
      "Feature scaling changes the numerical geometry of optimization and the relative effects of regularization.",
      "A fitted model should be evaluated on held-out data or through cross-validation to estimate generalization.",
    ],
  },
  {
    id: "degree",
    title: "Underfitting and Overfitting",
    subtitle: "Understand how polynomial degree changes model complexity.",
    basic: [
      "A model with too little flexibility may fail to capture the real pattern. This is underfitting.",
      "A model with too much flexibility may follow random noise instead of the real pattern. This is overfitting.",
      "A good model captures the main relationship without fitting every random variation.",
      "Increasing degree does not always improve performance on new data.",
    ],
    medium: [
      "Underfitting is commonly associated with high bias.",
      "Overfitting is commonly associated with high variance.",
      "Training error usually decreases or stays the same as model flexibility increases for unregularized nested polynomial models.",
      "Testing error can increase when the model starts fitting noise.",
      "Use cross-validation and test metrics to choose an appropriate degree.",
    ],
    advanced: [
      "Increasing polynomial degree expands the hypothesis class, changing the bias–variance tradeoff.",
      "High-degree Vandermonde matrices can be numerically unstable, particularly with unscaled input ranges.",
      "A low training error is not sufficient evidence of good generalization.",
      "Regularization constrains coefficient magnitudes and can improve performance on unseen samples.",
      "Degree selection should be performed using validation data, not by repeatedly optimizing against the final test set.",
    ],
  },
  {
    id: "regularization",
    title: "OLS, Ridge and Lasso",
    subtitle: "Learn how different regression methods control complexity.",
    basic: [
      "OLS finds coefficients that minimize squared prediction errors.",
      "Ridge discourages very large coefficients.",
      "Lasso can reduce some coefficients to exactly zero.",
      "These methods help you investigate whether a complex polynomial model is overfitting.",
    ],
    medium: [
      "OLS uses no coefficient penalty.",
      "Ridge adds an L2 penalty proportional to the squared magnitude of coefficients.",
      "Lasso adds an L1 penalty proportional to the absolute magnitude of coefficients.",
      "The alpha parameter controls regularization strength.",
      "A larger alpha usually creates stronger coefficient shrinkage, but its effect depends on scaling and the estimator.",
    ],
    advanced: [
      "Ridge regularization often improves stability when polynomial features are strongly correlated.",
      "Lasso can produce sparse models, although correlated polynomial terms may make feature selection unstable.",
      "Regularization strength should be selected using cross-validation.",
      "Comparisons between regularized models are more meaningful when transformed features are consistently scaled.",
      "Scikit-learn's Ridge and Lasso use estimator-specific objective normalizations, so alpha values are not necessarily directly comparable.",
    ],
  },
  {
    id: "evaluation",
    title: "Evaluate Your Polynomial Model",
    subtitle: "Understand the meaning of prediction metrics.",
    basic: [
      "MAE measures the average absolute difference between actual and predicted values.",
      "MSE squares prediction errors before averaging.",
      "RMSE is the square root of MSE and uses the same units as the target.",
      "R² compares prediction performance with a constant mean-based baseline.",
      "A model should perform well on new data, not only the training data.",
    ],
    medium: [
      "MAE = mean(|y - ŷ|).",
      "MSE = mean((y - ŷ)²).",
      "RMSE = √MSE.",
      "R² = 1 - SSE/SST when SST is nonzero.",
      "Large differences between training and testing metrics may indicate overfitting or a distribution mismatch.",
    ],
    advanced: [
      "Squared-error metrics are especially sensitive to large residuals.",
      "R² can be negative on held-out data when predictions are worse than the mean-based baseline.",
      "R² is not generally defined for fewer than two samples or when the target has zero variance without a special convention.",
      "Residual patterns can reveal nonlinearity, heteroscedasticity, or outliers.",
      "Model selection should use validation or cross-validation, while the final test set should remain untouched until final evaluation.",
    ],
  },
];

function FeatureExpansion({
  degree,
  featureName,
}: {
  degree: number;
  featureName: string;
}) {
  const [x, setX] = useState(2);

  const powers = useMemo(
    () =>
      Array.from(
        { length: Math.min(degree, 10) },
        (_, index) => index + 1
      ),
    [degree]
  );

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal
          size={18}
          className="text-violet-400"
        />
        <h4 className="font-semibold text-white">
          Interactive Feature Expansion
        </h4>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        Change the input value to see how the polynomial
        features are calculated. These are illustrative
        values, not predictions from your trained model.
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <label
          htmlFor="polynomial-learning-x"
          className="text-sm text-slate-300"
        >
          Input {featureName}
        </label>

        <span className="rounded-lg bg-violet-500/20 px-3 py-1 font-mono text-violet-300">
          {x}
        </span>
      </div>

      <input
        id="polynomial-learning-x"
        type="range"
        min={-5}
        max={5}
        step={0.5}
        value={x}
        onChange={(event) =>
          setX(Number(event.target.value))
        }
        className="mt-4 w-full accent-violet-500"
      />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {powers.map((power) => (
          <div
            key={power}
            className="rounded-xl border border-slate-700 bg-slate-950 p-3"
          >
            <p className="text-xs text-slate-400">
              {featureName}
              {power > 1 ? `^${power}` : ""}
            </p>

            <p className="mt-2 break-all font-mono text-lg font-semibold text-sky-300">
              {Number(x ** power).toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 4,
                }
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DegreeExplorer() {
  const [selectedDegree, setSelectedDegree] = useState(2);

  const explanation =
    selectedDegree === 1
      ? "Degree 1 produces a straight line and cannot directly model curvature in one input feature."
      : selectedDegree <= 3
        ? "This degree can represent common curved relationships while keeping the number of terms relatively small."
        : selectedDegree <= 6
          ? "This model is more flexible. Compare training and validation errors to check whether the added complexity is useful."
          : "High-degree models can become unstable or overfit. Scaling, regularization and validation are important.";

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
      <h4 className="font-semibold text-white">
        Explore Polynomial Degree
      </h4>

      <p className="mt-2 text-sm text-slate-400">
        Move the slider to understand how the model
        complexity changes.
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm text-slate-300">
          Polynomial degree
        </span>

        <span className="rounded-lg bg-sky-500/20 px-3 py-1 font-semibold text-sky-300">
          {selectedDegree}
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={selectedDegree}
        onChange={(event) =>
          setSelectedDegree(Number(event.target.value))
        }
        aria-label="Explore polynomial degree"
        className="mt-4 w-full accent-sky-500"
      />

      <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Model complexity
        </p>

        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className={`h-3 flex-1 rounded ${
                index < selectedDegree
                  ? "bg-violet-500"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          {explanation}
        </p>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Higher complexity does not automatically mean
        better predictions.
      </p>
    </div>
  );
}

export default function PolynomialLearningStudio({
  degree = 2,
  regularization = "none",
  featureName = "x",
  targetName = "y",
  datasetName = "Current Dataset",
}: Props) {
  const [level, setLevel] =
    useState<LearningLevel>("basic");

  const [lessonIndex, setLessonIndex] = useState(0);

  const [completed, setCompleted] = useState<string[]>(
    []
  );

  const lesson = lessons[lessonIndex];

  const currentContent = lesson[level];

  const isCompleted = completed.includes(lesson.id);

  const progress = Math.round(
    (completed.length / lessons.length) * 100
  );

  function toggleComplete() {
    setCompleted((previous) =>
      previous.includes(lesson.id)
        ? previous.filter(
            (id) => id !== lesson.id
          )
        : [...previous, lesson.id]
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400">
            <BookOpen size={21} />

            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              ModelMind Learning Studio
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Learn Polynomial Regression
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Learn the intuition, mathematics, model
            training and evaluation step by step.
          </p>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-300">
          {progress}% completed
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          ["basic", "medium", "advanced"] as const
        ).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLevel(item)}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium capitalize transition ${
              level === item
                ? "bg-violet-600 text-white"
                : "border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav
          aria-label="Polynomial learning lessons"
          className="space-y-2"
        >
          {lessons.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setLessonIndex(index)
              }
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                lessonIndex === index
                  ? "border-violet-500/50 bg-violet-500/10 text-white"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs">
                {completed.includes(item.id) ? (
                  <CheckCircle2
                    size={15}
                    className="text-emerald-400"
                  />
                ) : (
                  index + 1
                )}
              </span>

              <span>{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 md:p-7">
            <div className="flex items-center gap-2 text-sky-400">
              <BrainCircuit size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Lesson {lessonIndex + 1} of{" "}
                {lessons.length}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-white">
              {lesson.title}
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              {lesson.subtitle}
            </p>

            <div className="mt-6 space-y-4">
              {currentContent.map((paragraph, index) => (
                <div
                  key={`${lesson.id}-${level}-${index}`}
                  className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-semibold text-violet-300">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-7 text-slate-300">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <div className="flex items-center gap-2">
                <Lightbulb
                  size={18}
                  className="text-sky-400"
                />
                <p className="text-sm font-semibold text-sky-300">
                  Connect this to your experiment
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Dataset:{" "}
                <strong>{datasetName}</strong>
                <br />
                Input feature:{" "}
                <strong>{featureName}</strong>
                <br />
                Target:{" "}
                <strong>{targetName}</strong>
                <br />
                Current polynomial degree:{" "}
                <strong>{degree}</strong>
                <br />
                Regression method:{" "}
                <strong>
                  {regularization === "none"
                    ? "Ordinary Least Squares"
                    : regularization === "ridge"
                      ? "Ridge (L2)"
                      : "Lasso (L1)"}
                </strong>
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                These settings are read from your lab.
                The examples in this lesson are
                illustrative rather than calculations
                from the trained dataset.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleComplete}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isCompleted
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                <CheckCircle2 size={17} />
                {isCompleted
                  ? "Completed"
                  : "Mark as completed"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={lessonIndex === 0}
                  onClick={() =>
                    setLessonIndex((index) =>
                      Math.max(0, index - 1)
                    )
                  }
                  className="rounded-xl border border-slate-700 p-2.5 disabled:opacity-40"
                  aria-label="Previous lesson"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  type="button"
                  disabled={
                    lessonIndex === lessons.length - 1
                  }
                  onClick={() =>
                    setLessonIndex((index) =>
                      Math.min(
                        lessons.length - 1,
                        index + 1
                      )
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {lesson.id === "features" && (
            <FeatureExpansion
              degree={degree}
              featureName={featureName}
            />
          )}

          {lesson.id === "degree" && (
            <DegreeExplorer />
          )}

          {lesson.id === "intuition" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={18}
                  className="text-amber-400"
                />

                <h4 className="font-semibold text-white">
                  Key Intuition
                </h4>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Polynomial regression does not
                automatically mean a complicated
                machine-learning algorithm. It is
                linear regression operating on
                transformed input features.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
