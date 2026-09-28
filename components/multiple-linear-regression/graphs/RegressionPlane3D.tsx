import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import type {
  NumericRow,
  TrainedMultipleRegressionModel,
} from "../types/dataset";

interface RegressionPlane3DProps {
  rows: NumericRow[];
  model: TrainedMultipleRegressionModel;
}

const GRID_SIZE = 18;

type LearningStep = 0 | 1 | 2 | 3;

interface ManualParameters {
  intercept: number;
  firstCoefficient: number;
  secondCoefficient: number;
}

export default function RegressionPlane3D({
  rows,
  model,
}: RegressionPlane3DProps) {
  const availableFeatures =
    model.featureNames;

  const [xFeature, setXFeature] =
    useState(
      availableFeatures[0] ?? "",
    );

  const [yFeature, setYFeature] =
    useState(
      availableFeatures[1] ??
        availableFeatures[0] ??
        "",
    );

  const [showPredictedPoints, setShowPredictedPoints] =
    useState(true);

  const [showResidualLines, setShowResidualLines] =
    useState(true);

  const [learningStep, setLearningStep] =
    useState<LearningStep>(0);

  const [autoPlay, setAutoPlay] =
    useState(false);

  const [manualMode, setManualMode] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Feature means
  |--------------------------------------------------------------------------
  |
  | Features that are not displayed on the two horizontal axes are held
  | at their mean values. This gives us a 3D slice of the full regression
  | hyperplane.
  |
  */

  const featureMeans = useMemo(() => {
    const result: Record<string, number> =
      {};

    for (const feature of model.featureNames) {
      const values = rows
        .map((row) => row[feature])
        .filter(Number.isFinite);

      result[feature] =
        values.length === 0
          ? 0
          : values.reduce(
              (total, value) =>
                total + value,
              0,
            ) / values.length;
    }

    return result;
  }, [rows, model.featureNames]);

  /*
  |--------------------------------------------------------------------------
  | Trained coefficients for selected axes
  |--------------------------------------------------------------------------
  */

  const trainedXCoefficient =
    model.coefficients[xFeature] ?? 0;

  const trainedYCoefficient =
    model.coefficients[yFeature] ?? 0;

  /*
  |--------------------------------------------------------------------------
  | Manual parameters
  |--------------------------------------------------------------------------
  */

  const [manualParameters, setManualParameters] =
    useState<ManualParameters>(() => ({
      intercept: model.intercept,
      firstCoefficient:
        model.coefficients[
          availableFeatures[0] ?? ""
        ] ?? 0,
      secondCoefficient:
        model.coefficients[
          availableFeatures[1] ?? ""
        ] ?? 0,
    }));

  /*
  |--------------------------------------------------------------------------
  | Reset controls when selected features change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setManualParameters({
      intercept: model.intercept,
      firstCoefficient:
        model.coefficients[xFeature] ?? 0,
      secondCoefficient:
        model.coefficients[yFeature] ?? 0,
    });

    setLearningStep(0);
    setManualMode(false);
    setAutoPlay(false);
  }, [
    xFeature,
    yFeature,
    model,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Autoplay
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const timer = window.setInterval(() => {
      setLearningStep((current) => {
        if (current >= 3) {
          setAutoPlay(false);
          return 3;
        }

        return (current + 1) as LearningStep;
      });
    }, 1800);

    return () =>
      window.clearInterval(timer);
  }, [autoPlay]);

  /*
  |--------------------------------------------------------------------------
  | Selected feature ranges
  |--------------------------------------------------------------------------
  */

  const ranges = useMemo(() => {
    const xValues = rows
      .map((row) => row[xFeature])
      .filter(Number.isFinite);

    const yValues = rows
      .map((row) => row[yFeature])
      .filter(Number.isFinite);

    if (
      xValues.length === 0 ||
      yValues.length === 0
    ) {
      return null;
    }

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xSpan = xMax - xMin || 1;
    const ySpan = yMax - yMin || 1;

    return {
      xMin: xMin - xSpan * 0.05,
      xMax: xMax + xSpan * 0.05,
      yMin: yMin - ySpan * 0.05,
      yMax: yMax + ySpan * 0.05,
    };
  }, [
    rows,
    xFeature,
    yFeature,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Coefficients currently being visualized
  |--------------------------------------------------------------------------
  |
  | Step 0: intercept only
  | Step 1: intercept + first slope
  | Step 2: intercept + first slope + second slope
  | Step 3: complete trained model
  |
  */

  const visualParameters = useMemo(() => {
    if (manualMode) {
      return {
        intercept:
          manualParameters.intercept,

        xCoefficient:
          manualParameters.firstCoefficient,

        yCoefficient:
          manualParameters.secondCoefficient,

        includeOtherFeatures: true,
      };
    }

    if (learningStep === 0) {
      return {
        intercept: model.intercept,
        xCoefficient: 0,
        yCoefficient: 0,
        includeOtherFeatures: false,
      };
    }

    if (learningStep === 1) {
      return {
        intercept: model.intercept,
        xCoefficient:
          trainedXCoefficient,
        yCoefficient: 0,
        includeOtherFeatures: false,
      };
    }

    if (learningStep === 2) {
      return {
        intercept: model.intercept,
        xCoefficient:
          trainedXCoefficient,
        yCoefficient:
          trainedYCoefficient,
        includeOtherFeatures: false,
      };
    }

    return {
      intercept: model.intercept,
      xCoefficient:
        trainedXCoefficient,
      yCoefficient:
        trainedYCoefficient,
      includeOtherFeatures: true,
    };
  }, [
    learningStep,
    manualMode,
    manualParameters,
    model.intercept,
    trainedXCoefficient,
    trainedYCoefficient,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Prediction using current teaching/manual plane
  |--------------------------------------------------------------------------
  */

  function predictCurrentPlane(
    row: NumericRow,
  ): number {
    let prediction =
      visualParameters.intercept;

    prediction +=
      visualParameters.xCoefficient *
      (row[xFeature] ?? 0);

    prediction +=
      visualParameters.yCoefficient *
      (row[yFeature] ?? 0);

    if (
      visualParameters.includeOtherFeatures
    ) {
      for (const feature of model.featureNames) {
        if (
          feature === xFeature ||
          feature === yFeature
        ) {
          continue;
        }

        prediction +=
          (model.coefficients[feature] ??
            0) *
          (row[feature] ??
            featureMeans[feature] ??
            0);
      }
    }

    return prediction;
  }

  /*
  |--------------------------------------------------------------------------
  | Regression plane
  |--------------------------------------------------------------------------
  */

  const plane = useMemo(() => {
    if (
      !ranges ||
      !xFeature ||
      !yFeature
    ) {
      return null;
    }

    const xGrid: number[] = [];
    const yGrid: number[] = [];

    for (
      let index = 0;
      index < GRID_SIZE;
      index++
    ) {
      const fraction =
        index / (GRID_SIZE - 1);

      xGrid.push(
        ranges.xMin +
          fraction *
            (ranges.xMax -
              ranges.xMin),
      );

      yGrid.push(
        ranges.yMin +
          fraction *
            (ranges.yMax -
              ranges.yMin),
      );
    }

    const zGrid: number[][] = [];

    for (const yValue of yGrid) {
      const rowValues: number[] = [];

      for (const xValue of xGrid) {
        let prediction =
          visualParameters.intercept;

        prediction +=
          visualParameters.xCoefficient *
          xValue;

        prediction +=
          visualParameters.yCoefficient *
          yValue;

        if (
          visualParameters.includeOtherFeatures
        ) {
          for (const feature of model.featureNames) {
            if (
              feature === xFeature ||
              feature === yFeature
            ) {
              continue;
            }

            prediction +=
              (model.coefficients[
                feature
              ] ?? 0) *
              (featureMeans[feature] ??
                0);
          }
        }

        rowValues.push(prediction);
      }

      zGrid.push(rowValues);
    }

    return {
      xGrid,
      yGrid,
      zGrid,
    };
  }, [
    ranges,
    xFeature,
    yFeature,
    visualParameters,
    featureMeans,
    model.featureNames,
    model.coefficients,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Actual observations + current predictions
  |--------------------------------------------------------------------------
  */

  const observations = useMemo(() => {
    return rows
      .map((row, index) => {
        const x = row[xFeature];
        const y = row[yFeature];

        const actual =
          row[model.targetName];

        if (
          !Number.isFinite(x) ||
          !Number.isFinite(y) ||
          !Number.isFinite(actual)
        ) {
          return null;
        }

        const predicted =
          predictCurrentPlane(row);

        return {
          index,
          x,
          y,
          actual,
          predicted,
          residual:
            actual - predicted,
        };
      })
      .filter(
        (
          observation,
        ): observation is NonNullable<
          typeof observation
        > => observation !== null,
      );
  }, [
    rows,
    model,
    xFeature,
    yFeature,
    visualParameters,
    featureMeans,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Live metrics
  |--------------------------------------------------------------------------
  */

  const liveMetrics = useMemo(() => {
    if (observations.length === 0) {
      return {
        mse: 0,
        rmse: 0,
        r2: 0,
      };
    }

    const mse =
      observations.reduce(
        (total, point) =>
          total +
          point.residual *
            point.residual,
        0,
      ) / observations.length;

    const rmse = Math.sqrt(mse);

    const meanActual =
      observations.reduce(
        (total, point) =>
          total + point.actual,
        0,
      ) / observations.length;

    const ssResidual =
      observations.reduce(
        (total, point) =>
          total +
          point.residual *
            point.residual,
        0,
      );

    const ssTotal =
      observations.reduce(
        (total, point) => {
          const difference =
            point.actual -
            meanActual;

          return (
            total +
            difference * difference
          );
        },
        0,
      );

    const r2 =
      ssTotal === 0
        ? 1
        : 1 -
          ssResidual / ssTotal;

    return {
      mse,
      rmse,
      r2,
    };
  }, [observations]);

  /*
  |--------------------------------------------------------------------------
  | Residual line coordinates
  |--------------------------------------------------------------------------
  */

  const residualCoordinates =
    useMemo(() => {
      const x: Array<number | null> =
        [];

      const y: Array<number | null> =
        [];

      const z: Array<number | null> =
        [];

      for (const point of observations) {
        x.push(
          point.x,
          point.x,
          null,
        );

        y.push(
          point.y,
          point.y,
          null,
        );

        z.push(
          point.actual,
          point.predicted,
          null,
        );
      }

      return {
        x,
        y,
        z,
      };
    }, [observations]);

  /*
  |--------------------------------------------------------------------------
  | Slider ranges
  |--------------------------------------------------------------------------
  */

  const interceptScale =
    Math.max(
      Math.abs(model.intercept),
      1,
    );

  const xCoefficientScale =
    Math.max(
      Math.abs(
        trainedXCoefficient,
      ),
      0.01,
    );

  const yCoefficientScale =
    Math.max(
      Math.abs(
        trainedYCoefficient,
      ),
      0.01,
    );

  /*
  |--------------------------------------------------------------------------
  | Invalid state
  |--------------------------------------------------------------------------
  */

  if (availableFeatures.length < 2) {
    return (
      <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
        <h3 className="font-bold text-amber-300">
          3D visualization requires at
          least two features
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Multiple Linear Regression
          needs at least two selected
          input variables before the
          regression plane can be
          visualized.
        </p>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Step content
  |--------------------------------------------------------------------------
  */

  const stepInformation =
    getStepInformation(
      learningStep,
      xFeature,
      yFeature,
    );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Interactive Model Geometry
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          How Is the Regression Plane
          Formed?
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Build the Multiple Linear
          Regression plane one
          coefficient at a time. Watch
          how the intercept moves the
          surface and how each
          coefficient tilts it.
        </p>
      </div>

      {/* FEATURE SELECTORS */}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <FeatureSelector
          label="Feature 1 · X₁"
          value={xFeature}
          features={availableFeatures}
          disabledFeature={yFeature}
          onChange={setXFeature}
        />

        <FeatureSelector
          label="Feature 2 · X₂"
          value={yFeature}
          features={availableFeatures}
          disabledFeature={xFeature}
          onChange={setYFeature}
        />
      </div>

      {/* HIGH DIMENSION EXPLANATION */}

      {availableFeatures.length > 2 && (
        <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="font-semibold text-blue-300">
            This is a 3D slice of a
            higher-dimensional model
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            We display{" "}
            <strong>{xFeature}</strong>{" "}
            and{" "}
            <strong>{yFeature}</strong>.
            The remaining features are
            held at their dataset mean
            values when the complete
            trained plane is displayed.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {availableFeatures
              .filter(
                (feature) =>
                  feature !== xFeature &&
                  feature !== yFeature,
              )
              .map((feature) => (
                <span
                  key={feature}
                  className="rounded-lg border border-blue-500/20 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-300"
                >
                  {feature} ={" "}
                  {formatNumber(
                    featureMeans[
                      feature
                    ] ?? 0,
                  )}{" "}
                  (mean)
                </span>
              ))}
          </div>
        </div>
      )}

      {/* STEP PROGRESS */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <StepButton
            number={1}
            title="Intercept"
            active={
              learningStep === 0 &&
              !manualMode
            }
            completed={
              learningStep > 0 &&
              !manualMode
            }
            onClick={() => {
              setManualMode(false);
              setLearningStep(0);
              setAutoPlay(false);
            }}
          />

          <StepButton
            number={2}
            title={`Add ${xFeature}`}
            active={
              learningStep === 1 &&
              !manualMode
            }
            completed={
              learningStep > 1 &&
              !manualMode
            }
            onClick={() => {
              setManualMode(false);
              setLearningStep(1);
              setAutoPlay(false);
            }}
          />

          <StepButton
            number={3}
            title={`Add ${yFeature}`}
            active={
              learningStep === 2 &&
              !manualMode
            }
            completed={
              learningStep > 2 &&
              !manualMode
            }
            onClick={() => {
              setManualMode(false);
              setLearningStep(2);
              setAutoPlay(false);
            }}
          />

          <StepButton
            number={4}
            title="Best Fit"
            active={
              learningStep === 3 &&
              !manualMode
            }
            completed={false}
            onClick={() => {
              setManualMode(false);
              setLearningStep(3);
              setAutoPlay(false);
            }}
          />
        </div>
      </div>

      {/* CURRENT STEP EXPLANATION */}

      <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              {manualMode
                ? "Manual Experiment"
                : `Step ${
                    learningStep + 1
                  } of 4`}
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              {manualMode
                ? "Move the plane yourself"
                : stepInformation.title}
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {manualMode
                ? "Change the intercept and slopes below. Watch the plane move and observe how the model error changes."
                : stepInformation.description}
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            {manualMode
              ? "You control b₀, b₁ and b₂"
              : stepInformation.effect}
          </div>
        </div>
      </div>

      {/* LIVE EQUATION */}

      <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
          Current Plane Equation
        </p>

        <p className="mt-3 break-words font-mono text-sm leading-7 text-slate-100 sm:text-base">
          ŷ ={" "}
          {formatNumber(
            visualParameters.intercept,
          )}

          <EquationTerm
            coefficient={
              visualParameters.xCoefficient
            }
            feature={xFeature}
          />

          <EquationTerm
            coefficient={
              visualParameters.yCoefficient
            }
            feature={yFeature}
          />

          {visualParameters.includeOtherFeatures &&
            model.featureNames
              .filter(
                (feature) =>
                  feature !== xFeature &&
                  feature !== yFeature,
              )
              .map((feature) => (
                <EquationTerm
                  key={feature}
                  coefficient={
                    model.coefficients[
                      feature
                    ] ?? 0
                  }
                  feature={feature}
                />
              ))}
        </p>
      </div>

      {/* LIVE METRICS */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="MSE"
          value={formatNumber(
            liveMetrics.mse,
          )}
          explanation="Lower is better"
        />

        <MetricCard
          label="RMSE"
          value={formatNumber(
            liveMetrics.rmse,
          )}
          explanation="Typical prediction error"
        />

        <MetricCard
          label="R²"
          value={formatNumber(
            liveMetrics.r2,
          )}
          explanation="Higher is generally better"
        />
      </div>

      {/* NAVIGATION */}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={
            learningStep === 0 ||
            manualMode
          }
          onClick={() => {
            setAutoPlay(false);

            setLearningStep(
              (current) =>
                Math.max(
                  0,
                  current - 1,
                ) as LearningStep,
            );
          }}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous Step
        </button>

        <button
          type="button"
          disabled={
            learningStep === 3 ||
            manualMode
          }
          onClick={() => {
            setAutoPlay(false);

            setLearningStep(
              (current) =>
                Math.min(
                  3,
                  current + 1,
                ) as LearningStep,
            );
          }}
          className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next Step →
        </button>

        <button
          type="button"
          onClick={() => {
            setManualMode(false);
            setLearningStep(0);
            setAutoPlay(true);
          }}
          className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
        >
          {autoPlay
            ? "Auto Playing..."
            : "▶ Auto Play"}
        </button>

        <button
          type="button"
          onClick={() => {
            setAutoPlay(false);
            setManualMode(false);
            setLearningStep(3);
          }}
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Show Best Fit
        </button>

        <button
          type="button"
          onClick={() => {
            setAutoPlay(false);
            setManualMode(false);
            setLearningStep(0);

            setManualParameters({
              intercept:
                model.intercept,
              firstCoefficient:
                trainedXCoefficient,
              secondCoefficient:
                trainedYCoefficient,
            });
          }}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-slate-500"
        >
          Reset
        </button>
      </div>

      {/* MANUAL COEFFICIENT PLAYGROUND */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">
              Plane Playground
            </p>

            <h3 className="mt-2 text-lg font-bold text-white">
              Change the intercept and
              slopes yourself
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Moving a slider switches
              the graph into manual mode.
              Compare your plane with the
              trained best-fit plane.
            </p>
          </div>

          {manualMode && (
            <span className="w-fit rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-bold text-fuchsia-300">
              MANUAL MODE
            </span>
          )}
        </div>

        <div className="mt-5 space-y-5">
          <ParameterSlider
            label="b₀ · Intercept"
            value={
              manualParameters.intercept
            }
            trainedValue={
              model.intercept
            }
            minimum={
              model.intercept -
              interceptScale * 2
            }
            maximum={
              model.intercept +
              interceptScale * 2
            }
            step={
              Math.max(
                interceptScale / 100,
                0.001,
              )
            }
            explanation="Moves the entire plane vertically."
            onChange={(value) => {
              setAutoPlay(false);
              setManualMode(true);

              setManualParameters(
                (current) => ({
                  ...current,
                  intercept: value,
                }),
              );
            }}
          />

          <ParameterSlider
            label={`b₁ · ${xFeature}`}
            value={
              manualParameters.firstCoefficient
            }
            trainedValue={
              trainedXCoefficient
            }
            minimum={
              trainedXCoefficient -
              xCoefficientScale * 3
            }
            maximum={
              trainedXCoefficient +
              xCoefficientScale * 3
            }
            step={
              Math.max(
                xCoefficientScale /
                  100,
                0.000001,
              )
            }
            explanation={`Tilts the plane along the ${xFeature} direction.`}
            onChange={(value) => {
              setAutoPlay(false);
              setManualMode(true);

              setManualParameters(
                (current) => ({
                  ...current,
                  firstCoefficient:
                    value,
                }),
              );
            }}
          />

          <ParameterSlider
            label={`b₂ · ${yFeature}`}
            value={
              manualParameters.secondCoefficient
            }
            trainedValue={
              trainedYCoefficient
            }
            minimum={
              trainedYCoefficient -
              yCoefficientScale * 3
            }
            maximum={
              trainedYCoefficient +
              yCoefficientScale * 3
            }
            step={
              Math.max(
                yCoefficientScale /
                  100,
                0.000001,
              )
            }
            explanation={`Tilts the plane along the ${yFeature} direction.`}
            onChange={(value) => {
              setAutoPlay(false);
              setManualMode(true);

              setManualParameters(
                (current) => ({
                  ...current,
                  secondCoefficient:
                    value,
                }),
              );
            }}
          />
        </div>
      </div>

      {/* DISPLAY CONTROLS */}

      <div className="mt-5 flex flex-wrap gap-3">
        <ToggleButton
          active={showPredictedPoints}
          label="Predicted Points"
          onClick={() =>
            setShowPredictedPoints(
              (current) => !current,
            )
          }
        />

        <ToggleButton
          active={showResidualLines}
          label="Residual Lines"
          onClick={() =>
            setShowResidualLines(
              (current) => !current,
            )
          }
        />
      </div>

      {/* 3D GRAPH */}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-white">
        {plane && (
          <Plot
            data={[
              {
                type: "surface",
                x: plane.xGrid,
                y: plane.yGrid,
                z: plane.zGrid,
                name:
                  manualMode
                    ? "Manual Plane"
                    : learningStep === 3
                      ? "Best-Fit Plane"
                      : "Learning Plane",
                opacity: 0.62,
                showscale: false,
                hovertemplate:
                  `${xFeature}: %{x:.3f}` +
                  `<br>${yFeature}: %{y:.3f}` +
                  `<br>Predicted ${model.targetName}: %{z:.3f}` +
                  "<extra>Regression Plane</extra>",
              },

              {
                type: "scatter3d",
                mode: "markers",
                name: "Actual Values",
                x: observations.map(
                  (point) => point.x,
                ),
                y: observations.map(
                  (point) => point.y,
                ),
                z: observations.map(
                  (point) =>
                    point.actual,
                ),
                marker: {
                  size: 5,
                },
                customdata:
                  observations.map(
                    (point) => [
                      point.predicted,
                      point.residual,
                    ],
                  ),
                hovertemplate:
                  `${xFeature}: %{x:.3f}` +
                  `<br>${yFeature}: %{y:.3f}` +
                  `<br>Actual ${model.targetName}: %{z:.3f}` +
                  "<br>Current prediction: %{customdata[0]:.3f}" +
                  "<br>Residual: %{customdata[1]:.3f}" +
                  "<extra>Actual Observation</extra>",
              },

              ...(showPredictedPoints
                ? [
                    {
                      type:
                        "scatter3d" as const,
                      mode:
                        "markers" as const,
                      name:
                        "Predicted Values",
                      x: observations.map(
                        (point) =>
                          point.x,
                      ),
                      y: observations.map(
                        (point) =>
                          point.y,
                      ),
                      z: observations.map(
                        (point) =>
                          point.predicted,
                      ),
                      marker: {
                        size: 4,
                        symbol:
                          "diamond" as const,
                      },
                      hovertemplate:
                        `${xFeature}: %{x:.3f}` +
                        `<br>${yFeature}: %{y:.3f}` +
                        `<br>Prediction: %{z:.3f}` +
                        "<extra>Current Prediction</extra>",
                    },
                  ]
                : []),

              ...(showResidualLines
                ? [
                    {
                      type:
                        "scatter3d" as const,
                      mode:
                        "lines" as const,
                      name: "Residuals",
                      x:
                        residualCoordinates.x,
                      y:
                        residualCoordinates.y,
                      z:
                        residualCoordinates.z,
                      line: {
                        width: 2,
                      },
                      hoverinfo:
                        "skip" as const,
                      showlegend: true,
                    },
                  ]
                : []),
            ]}
            layout={{
              autosize: true,
              height: 620,

              margin: {
                l: 0,
                r: 0,
                t: 40,
                b: 0,
              },

              paper_bgcolor:
                "rgba(0,0,0,0)",

              plot_bgcolor:
                "rgba(0,0,0,0)",

              scene: {
                xaxis: {
                  title: {
                    text: xFeature,
                  },
                },

                yaxis: {
                  title: {
                    text: yFeature,
                  },
                },

                zaxis: {
                  title: {
                    text:
                      model.targetName,
                  },
                },

                camera: {
                  eye: {
                    x: 1.45,
                    y: 1.45,
                    z: 1.1,
                  },
                },
              },

              legend: {
                orientation: "h",
                x: 0,
                y: 1.08,
              },
            }}
            config={{
              responsive: true,
              displaylogo: false,
              scrollZoom: true,
            }}
            style={{
              width: "100%",
              height: "620px",
            }}
            useResizeHandler
          />
        )}
      </div>

      {/* EDUCATIONAL CARDS */}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ExplanationCard
          title="b₀ · Intercept"
          text="Changing the intercept shifts the entire regression plane upward or downward without changing its tilt."
        />

        <ExplanationCard
          title={`b₁ · ${xFeature}`}
          text={`Changing this coefficient tilts the plane along the ${xFeature} direction.`}
        />

        <ExplanationCard
          title={`b₂ · ${yFeature}`}
          text={`Changing this coefficient tilts the plane along the ${yFeature} direction.`}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-bold text-white">
          What should you notice?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Start at Step 1. The surface is
          flat because only the intercept
          is active. Add{" "}
          <strong className="text-slate-200">
            {xFeature}
          </strong>{" "}
          and the plane tilts in one
          direction. Add{" "}
          <strong className="text-slate-200">
            {yFeature}
          </strong>{" "}
          and it can tilt in another
          direction. Finally, compare
          this with the complete trained
          model. Use the sliders to
          deliberately move away from
          the best fit and watch MSE and
          RMSE change.
        </p>
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Step information
|--------------------------------------------------------------------------
*/

function getStepInformation(
  step: LearningStep,
  xFeature: string,
  yFeature: string,
) {
  if (step === 0) {
    return {
      title:
        "Start with the intercept",
      description:
        "Only b₀ is active. Both feature coefficients are zero, so every input receives the same prediction.",
      effect:
        "Result → flat horizontal plane",
    };
  }

  if (step === 1) {
    return {
      title: `Add ${xFeature}`,
      description: `Now b₁ is activated. Predictions can change as ${xFeature} changes, so the flat surface begins to tilt.`,
      effect: `Result → tilt along ${xFeature}`,
    };
  }

  if (step === 2) {
    return {
      title: `Add ${yFeature}`,
      description: `Now b₂ is activated too. The model can respond to both ${xFeature} and ${yFeature}.`,
      effect:
        "Result → plane can tilt in two directions",
    };
  }

  return {
    title:
      "Complete trained best-fit model",
    description:
      "The complete fitted model is now active. Any additional selected features contribute while being represented through this 3D slice.",
    effect:
      "Result → trained regression surface",
  };
}

/*
|--------------------------------------------------------------------------
| Feature selector
|--------------------------------------------------------------------------
*/

function FeatureSelector({
  label,
  value,
  features,
  disabledFeature,
  onChange,
}: {
  label: string;
  value: string;
  features: string[];
  disabledFeature: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-500"
      >
        {features.map((feature) => (
          <option
            key={feature}
            value={feature}
            disabled={
              feature ===
              disabledFeature
            }
          >
            {feature}
          </option>
        ))}
      </select>
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| Step button
|--------------------------------------------------------------------------
*/

function StepButton({
  number,
  title,
  active,
  completed,
  onClick,
}: {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-left transition",

        active
          ? "border-cyan-500/50 bg-cyan-500/10"
          : completed
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-slate-800 bg-slate-950/60 hover:border-slate-700",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black",

            active
              ? "bg-cyan-500 text-slate-950"
              : completed
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-slate-800 text-slate-400",
          ].join(" ")}
        >
          {completed ? "✓" : number}
        </div>

        <span
          className={[
            "truncate text-sm font-bold",

            active
              ? "text-cyan-300"
              : "text-slate-300",
          ].join(" ")}
        >
          {title}
        </span>
      </div>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Parameter slider
|--------------------------------------------------------------------------
*/

function ParameterSlider({
  label,
  value,
  trainedValue,
  minimum,
  maximum,
  step,
  explanation,
  onChange,
}: {
  label: string;
  value: number;
  trainedValue: number;
  minimum: number;
  maximum: number;
  step: number;
  explanation: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-slate-200">
            {label}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {explanation}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-sm font-bold text-fuchsia-300">
            {formatNumber(value)}
          </p>

          <p className="text-xs text-slate-600">
            trained ={" "}
            {formatNumber(
              trainedValue,
            )}
          </p>
        </div>
      </div>

      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value),
          )
        }
        className="mt-4 w-full accent-fuchsia-500"
      />

      <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-600">
        <span>
          {formatNumber(minimum)}
        </span>

        <span>
          {formatNumber(maximum)}
        </span>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Metric card
|--------------------------------------------------------------------------
*/

function MetricCard({
  label,
  value,
  explanation,
}: {
  label: string;
  value: string;
  explanation: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-mono text-xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {explanation}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Equation term
|--------------------------------------------------------------------------
*/

function EquationTerm({
  coefficient,
  feature,
}: {
  coefficient: number;
  feature: string;
}) {
  const sign =
    coefficient >= 0 ? " + " : " - ";

  return (
    <span>
      {sign}
      {formatNumber(
        Math.abs(coefficient),
      )}
      ({feature})
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Toggle
|--------------------------------------------------------------------------
*/

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-4 py-2 text-sm font-semibold transition",

        active
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600",
      ].join(" ")}
    >
      {active ? "✓ " : ""}
      {label}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Explanation card
|--------------------------------------------------------------------------
*/

function ExplanationCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="font-bold text-slate-200">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatNumber(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const absolute = Math.abs(value);

  if (
    absolute >= 100000 ||
    (absolute > 0 &&
      absolute < 0.001)
  ) {
    return value.toExponential(3);
  }

  return value.toFixed(3);
}