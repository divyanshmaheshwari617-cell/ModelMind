import { useState } from "react";

type LearningLevel =
  | "basic"
  | "medium"
  | "advanced";

export default function MultipleRegressionLearningGuide() {
  const [level, setLevel] =
    useState<LearningLevel>("basic");

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Learn Before You Visualize
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Multiple Linear Regression
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Learn the same model at three depths.
          Start with intuition, then move toward
          interpretation and mathematics.
        </p>
      </div>

      {/* LEVEL SELECTOR */}

      <div className="mt-5 inline-flex flex-wrap rounded-2xl border border-slate-800 bg-slate-900 p-1">
        <LevelButton
          active={level === "basic"}
          onClick={() => setLevel("basic")}
        >
          Basic
        </LevelButton>

        <LevelButton
          active={level === "medium"}
          onClick={() => setLevel("medium")}
        >
          Medium
        </LevelButton>

        <LevelButton
          active={level === "advanced"}
          onClick={() => setLevel("advanced")}
        >
          Advanced
        </LevelButton>
      </div>

      {level === "basic" && <BasicLevel />}

      {level === "medium" && <MediumLevel />}

      {level === "advanced" && <AdvancedLevel />}
    </section>
  );
}

function BasicLevel() {
  return (
    <div className="mt-6 space-y-5">
      <LearningBlock
        number="01"
        title="What problem does it solve?"
      >
        Multiple Linear Regression predicts one
        continuous numerical target using two or
        more input features.
      </LearningBlock>

      <ExampleBox />

      <LearningBlock
        number="02"
        title="How is it different from Simple Linear Regression?"
      >
        Simple Linear Regression uses one input
        feature. Multiple Linear Regression uses
        several input features at the same time.
      </LearningBlock>

      <Comparison />

      <LearningBlock
        number="03"
        title="What does the model learn?"
      >
        The model learns an intercept and one
        coefficient for every selected feature.
        These numbers are combined to produce a
        prediction.
      </LearningBlock>

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Core Idea
        </p>

        <p className="mt-3 font-mono text-lg font-bold text-white">
          Prediction = Starting value + Feature
          effects
        </p>
      </div>

      <LearningBlock
        number="04"
        title="Example intuition"
      >
        When predicting house price, Area,
        Bedrooms and Age may all contain useful
        information. Multiple Linear Regression
        estimates their linear effects together
        rather than building a separate model for
        each feature.
      </LearningBlock>
    </div>
  );
}

function MediumLevel() {
  return (
    <div className="mt-6 space-y-5">
      <LearningBlock
        number="01"
        title="The regression equation"
      >
        The prediction is constructed from an
        intercept plus the coefficient-weighted
        value of every selected feature.
      </LearningBlock>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <p className="font-mono text-lg font-black text-white">
          ŷ = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Definition
            symbol="ŷ"
            text="Predicted target"
          />

          <Definition
            symbol="b₀"
            text="Intercept"
          />

          <Definition
            symbol="bᵢ"
            text="Coefficient of feature i"
          />

          <Definition
            symbol="xᵢ"
            text="Value of feature i"
          />
        </div>
      </div>

      <LearningBlock
        number="02"
        title="Holding other variables constant"
      >
        A coefficient is interpreted while the
        other predictors in the fitted equation
        are held constant. This is one of the most
        important ideas in Multiple Linear
        Regression.
      </LearningBlock>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="font-bold text-emerald-300">
          Example
        </p>

        <p className="mt-2 text-sm leading-7 text-slate-300">
          Suppose the coefficient for Area is 120.
          Holding Bedrooms, Age and the other
          included predictors constant, increasing
          Area by one unit is associated with an
          increase of 120 units in the predicted
          target.
        </p>
      </div>

      <LearningBlock
        number="03"
        title="Residuals"
      >
        The model will usually not predict every
        observation exactly. The difference
        between the actual and predicted value is
        called the residual.
      </LearningBlock>

      <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-5">
        <p className="font-mono font-bold text-white">
          Residual = Actual − Predicted
        </p>
      </div>

      <LearningBlock
        number="04"
        title="How do we evaluate it?"
      >
        Metrics such as MSE, RMSE, MAE and R²
        summarize different aspects of prediction
        error and model fit. They should be used
        together with diagnostic plots.
      </LearningBlock>
    </div>
  );
}

function AdvancedLevel() {
  return (
    <div className="mt-6 space-y-5">
      <LearningBlock
        number="01"
        title="Matrix representation"
      >
        Multiple Linear Regression can represent
        all observations and coefficients using
        matrices.
      </LearningBlock>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
        <p className="font-mono text-xl font-black text-white">
          y = Xβ + ε
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Definition
            symbol="y"
            text="Observed target vector"
          />

          <Definition
            symbol="X"
            text="Design matrix"
          />

          <Definition
            symbol="β"
            text="Coefficient vector"
          />

          <Definition
            symbol="ε"
            text="Error vector"
          />
        </div>
      </div>

      <LearningBlock
        number="02"
        title="Ordinary Least Squares"
      >
        Ordinary Least Squares chooses
        coefficients that minimize the sum of
        squared residuals.
      </LearningBlock>

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="font-mono text-lg font-black text-white">
          minimize Σ(yᵢ − ŷᵢ)²
        </p>
      </div>

      <LearningBlock
        number="03"
        title="Normal equation"
      >
        When the required matrix inverse exists,
        the Ordinary Least Squares coefficients can
        be expressed using the normal equation.
      </LearningBlock>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="whitespace-nowrap font-mono text-lg font-black text-white">
          β̂ = (XᵀX)⁻¹Xᵀy
        </p>
      </div>

      <LearningBlock
        number="04"
        title="Multicollinearity"
      >
        When predictors are strongly linearly
        related to each other, separating their
        individual coefficient effects can become
        difficult. Coefficients may become unstable
        or sensitive to changes in the data.
      </LearningBlock>

      <LearningBlock
        number="05"
        title="Geometry"
      >
        With two predictors, the fitted model can
        be visualized as a plane. With more
        predictors, the fitted relationship is a
        hyperplane in a higher-dimensional space.
      </LearningBlock>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <p className="font-bold text-amber-300">
          Why ModelMind shows only two X features
          in the 3D view
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          A normal 3D display can show two feature
          axes and one target axis. When the model
          contains additional predictors, the 3D
          visualization displays a slice of the
          higher-dimensional fitted model while
          holding the remaining features at fixed
          values.
        </p>
      </div>

      <LearningBlock
        number="06"
        title="Prediction is not causation"
      >
        A regression coefficient describes the
        fitted conditional association in this
        model. It does not by itself prove that
        changing a feature will cause the target
        to change.
      </LearningBlock>
    </div>
  );
}

function ExampleBox() {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
      <p className="font-bold text-emerald-300">
        House Price Example
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ExampleItem
          label="X₁"
          value="Area"
        />

        <ExampleItem
          label="X₂"
          value="Bedrooms"
        />

        <ExampleItem
          label="X₃"
          value="Age"
        />

        <ExampleItem
          label="Y"
          value="House Price"
        />
      </div>

      <p className="mt-4 font-mono text-sm leading-7 text-slate-200">
        House Price = b₀ + b₁(Area) +
        b₂(Bedrooms) + b₃(Age)
      </p>
    </div>
  );
}

function Comparison() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Simple Linear Regression
        </p>

        <p className="mt-3 font-mono font-bold text-white">
          ŷ = b₀ + b₁x
        </p>

        <p className="mt-2 text-sm text-slate-400">
          One input feature
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Multiple Linear Regression
        </p>

        <p className="mt-3 font-mono font-bold text-white">
          ŷ = b₀ + b₁x₁ + ... + bₙxₙ
        </p>

        <p className="mt-2 text-sm text-slate-300">
          Two or more input features
        </p>
      </div>
    </div>
  );
}

function LearningBlock({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-xs font-black text-cyan-300">
          {number}
        </div>

        <div>
          <h3 className="font-bold text-white">
            {title}
          </h3>

          <div className="mt-2 text-sm leading-7 text-slate-400">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Definition({
  symbol,
  text,
}: {
  symbol: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <p className="font-mono text-lg font-black text-cyan-300">
        {symbol}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  );
}

function ExampleItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-500/10 bg-slate-950/40 p-3">
      <span className="font-mono font-bold text-emerald-300">
        {label}
      </span>

      <span className="ml-3 text-sm text-slate-300">
        {value}
      </span>
    </div>
  );
}

function LevelButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-5 py-2.5 text-sm font-bold transition",
        active
          ? "bg-cyan-500 text-slate-950"
          : "text-slate-400 hover:bg-slate-800 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}