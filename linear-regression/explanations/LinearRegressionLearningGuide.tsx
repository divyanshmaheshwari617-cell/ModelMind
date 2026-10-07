"use client";

import { useState } from "react";

type LearningLevel =
  | "basic"
  | "medium"
  | "advanced";

export default function LinearRegressionLearningGuide() {
  const [level, setLevel] =
    useState<LearningLevel>("basic");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Learn the Model
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Linear Regression at your level
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose how deeply you want ModelMind to explain the
          model.
        </p>
      </div>

      <div className="mt-5 inline-flex rounded-xl bg-slate-100 p-1">
        {(
          [
            ["basic", "Basic"],
            ["medium", "Medium"],
            ["advanced", "Advanced"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setLevel(value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              level === value
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {level === "basic" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-blue-50 p-5">
            <h3 className="font-bold text-blue-900">
              What is Linear Regression?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              Linear Regression tries to draw a straight line
              through data so that the line can be used to predict
              a numerical value.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="font-bold text-slate-900">
                Slope
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The slope tells us how much the prediction changes
                when X increases by one unit.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="font-bold text-slate-900">
                Intercept
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The intercept tells us the model&apos;s prediction
                when X equals zero.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-bold text-emerald-900">
              Main idea
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              A good regression line keeps its predictions close
              to the actual data points.
            </p>
          </div>
        </div>
      )}

      {level === "medium" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-purple-50 p-5">
            <h3 className="font-bold text-purple-900">
              Model equation
            </h3>

            <p className="mt-2 font-mono text-lg font-bold text-slate-800">
              ŷ = mx + b
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              The model chooses parameters m and b. Each input X
              is transformed into a prediction ŷ.
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-5">
            <h3 className="font-bold text-orange-900">
              Residual
            </h3>

            <p className="mt-2 font-mono text-sm text-slate-800">
              residual = y − ŷ
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              A residual measures how far the prediction is from
              the actual observation.
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-5">
            <h3 className="font-bold text-blue-900">
              Objective
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              Ordinary Least Squares chooses parameters that
              minimize the sum of squared residuals. MSE expresses
              the average squared error.
            </p>
          </div>

          <div className="rounded-xl bg-cyan-50 p-5">
            <h3 className="font-bold text-cyan-900">
              Evaluation
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              MSE and RMSE measure prediction error. R² compares
              the regression model with a baseline that predicts
              the mean target value.
            </p>
          </div>
        </div>
      )}

      {level === "advanced" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-slate-900 p-5 text-white">
            <h3 className="font-bold">
              Ordinary Least Squares
            </h3>

            <p className="mt-3 font-mono text-sm text-slate-200">
              m = Σ[(xi − x̄)(yi − ȳ)] /
              Σ[(xi − x̄)²]
            </p>

            <p className="mt-2 font-mono text-sm text-slate-200">
              b = ȳ − mx̄
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900">
              Core assumptions
            </h3>

            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p>
                <strong>Linearity:</strong> the conditional mean of
                the target is modeled as a linear function of the
                predictors.
              </p>

              <p>
                <strong>Independent errors:</strong> residuals
                should not exhibit dependence that the model
                ignores.
              </p>

              <p>
                <strong>Homoscedasticity:</strong> the variance of
                the errors is assumed to remain roughly constant
                across fitted values when standard OLS inference is
                used.
              </p>

              <p>
                <strong>Normal errors:</strong> normality is mainly
                relevant for classical small-sample confidence
                intervals and hypothesis tests; it is not required
                simply to compute OLS predictions.
              </p>

              <p>
                <strong>No perfect multicollinearity:</strong> in
                multiple regression, predictors should not be exact
                linear combinations of one another.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-900">
              Important limitation
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              A high R² does not prove causation, does not guarantee
              good predictions on unseen data, and does not by
              itself show that the linear model is appropriate.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-bold text-blue-900">
              From one feature to many
            </h3>

            <p className="mt-2 font-mono text-sm text-slate-800">
              ŷ = b + w₁x₁ + w₂x₂ + ... + wₚxₚ
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              The same idea extends to multiple features. Instead
              of learning one slope, the model learns a coefficient
              for each feature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}