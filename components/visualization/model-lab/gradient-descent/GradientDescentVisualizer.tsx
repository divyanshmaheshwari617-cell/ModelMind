"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getParametersByLevel,
  getParameter,
  type LearningLevel,
} from "../config/parameterRegistry";

import GradientDescentControls from "./GradientDescentControls";
import ParameterExplanation from "./ParameterExplanation";

import RegressionAnimation, {
  type RegressionPoint,
} from "./RegressionAnimation";

import LossCurve from "./LossCurve";
import LossSurface from "./LossSurface";

import GradientDescentTypes, {
  type GradientDescentType,
} from "./GradientDescentTypes";

import GradientDescentComparison from "./GradientDescentComparison";
import GradientDirectionExplanation from "./GradientDirectionExplanation";
import GradientDescentDatasetAnalyzer from "./GradientDescentDatasetAnalyzer";

/*
========================================================
DEMO DATASET
========================================================
*/

const DEMO_DATA: RegressionPoint[] = [
  { x: 1, y: 2.3 },
  { x: 2, y: 4.2 },
  { x: 3, y: 5.7 },
  { x: 4, y: 8.2 },
  { x: 5, y: 9.8 },
  { x: 6, y: 12.1 },
  { x: 7, y: 13.7 },
  { x: 8, y: 16.2 },
  { x: 9, y: 17.8 },
  { x: 10, y: 20.3 },
];

type ParameterValue =
  | string
  | number;

type ParameterValues = Record<
  string,
  ParameterValue
>;

type TrainingSnapshot = {
  iteration: number;

  weight: number;

  bias: number;

  loss: number;

  weightGradient: number;

  biasGradient: number;

  activeIndexes: number[];
};

/*
========================================================
INITIAL VALUES
========================================================
*/

const INITIAL_VALUES: ParameterValues = {
  learningRate: 0.01,

  iterations: 100,

  initialWeight: 0,

  initialBias: 0,

  batchSize: 8,

  gradientType:
    "Batch Gradient Descent",

  lossFunction:
    "Mean Squared Error",
};

/*
========================================================
MAIN COMPONENT
========================================================
*/

export default function GradientDescentVisualizer() {
  /*
  --------------------------------------------------------
  DATASET STATE
  --------------------------------------------------------
  */

  const [
    uploadedDataset,
    setUploadedDataset,
  ] = useState<
    RegressionPoint[] | null
  >(null);

  const [
    featureName,
    setFeatureName,
  ] = useState("X");

  const [
    targetName,
    setTargetName,
  ] = useState("Y");

  /*
  If the student has uploaded a valid dataset,
  use it.

  Otherwise use the original demo dataset.
  */

  const data =
    uploadedDataset ??
    DEMO_DATA;

  /*
  --------------------------------------------------------
  LEARNING LEVEL
  --------------------------------------------------------
  */

  const [
    learningLevel,
    setLearningLevel,
  ] =
    useState<LearningLevel>(
      "Basic"
    );

  /*
  --------------------------------------------------------
  PARAMETER VALUES
  --------------------------------------------------------
  */

  const [
    values,
    setValues,
  ] =
    useState<ParameterValues>(
      INITIAL_VALUES
    );

  const [
    selectedParameterId,
    setSelectedParameterId,
  ] = useState(
    "learningRate"
  );

  /*
  --------------------------------------------------------
  TRAINING STATE
  --------------------------------------------------------
  */

  const [
    weight,
    setWeight,
  ] = useState(
    Number(
      INITIAL_VALUES.initialWeight
    )
  );

  const [
    bias,
    setBias,
  ] = useState(
    Number(
      INITIAL_VALUES.initialBias
    )
  );

  const [
    iteration,
    setIteration,
  ] = useState(0);

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    speed,
    setSpeed,
  ] = useState(1);

  const [
    activeIndexes,
    setActiveIndexes,
  ] = useState<number[]>([]);

  const [
    history,
    setHistory,
  ] = useState<
    TrainingSnapshot[]
  >([]);

  /*
  --------------------------------------------------------
  AVAILABLE PARAMETERS
  --------------------------------------------------------
  */

  const parameters =
    useMemo(
      () =>
        getParametersByLevel(
          "gradient-descent",
          learningLevel
        ),
      [learningLevel]
    );

  const selectedParameter =
    getParameter(
      "gradient-descent",
      selectedParameterId
    );

  /*
  --------------------------------------------------------
  CURRENT PARAMETER VALUES
  --------------------------------------------------------
  */

  const learningRate =
    Number(
      values.learningRate ??
        0.01
    );

  const maxIterations =
    Number(
      values.iterations ??
        100
    );

  const initialWeight =
    Number(
      values.initialWeight ??
        0
    );

  const initialBias =
    Number(
      values.initialBias ??
        0
    );

  const batchSize =
    Number(
      values.batchSize ??
        8
    );

  const gradientType =
    String(
      values.gradientType ??
        "Batch Gradient Descent"
    ) as GradientDescentType;

  const lossFunction =
    String(
      values.lossFunction ??
        "Mean Squared Error"
    );

  /*
  --------------------------------------------------------
  CURRENT LOSS
  --------------------------------------------------------
  */

  const currentLoss =
    useMemo(
      () =>
        calculateLoss(
          data,
          weight,
          bias,
          lossFunction
        ),
      [
        data,
        weight,
        bias,
        lossFunction,
      ]
    );

  /*
  --------------------------------------------------------
  LOSS HISTORY
  --------------------------------------------------------
  */

  const lossHistory =
    useMemo(() => {
      const initialLoss =
        calculateLoss(
          data,
          initialWeight,
          initialBias,
          lossFunction
        );

      return [
        initialLoss,

        ...history.map(
          (snapshot) =>
            snapshot.loss
        ),
      ];
    }, [
      data,
      history,
      initialWeight,
      initialBias,
      lossFunction,
    ]);

  /*
  ========================================================
  SELECT SAMPLES FOR CURRENT UPDATE
  ========================================================
  */

  const chooseActiveIndexes =
    useCallback(() => {
      /*
      Batch Gradient Descent
      */

      if (
        gradientType ===
        "Batch Gradient Descent"
      ) {
        return data.map(
          (_, index) =>
            index
        );
      }

      /*
      Stochastic Gradient Descent

      Use one sample per update.
      */

      if (
        gradientType ===
        "Stochastic Gradient Descent"
      ) {
        return [
          iteration %
            data.length,
        ];
      }

      /*
      Mini-Batch Gradient Descent
      */

      const safeBatchSize =
        Math.min(
          Math.max(
            1,
            batchSize
          ),
          data.length
        );

      const start =
        (iteration *
          safeBatchSize) %
        data.length;

      const indexes: number[] =
        [];

      for (
        let i = 0;
        i < safeBatchSize;
        i++
      ) {
        indexes.push(
          (start + i) %
            data.length
        );
      }

      return indexes;
    }, [
      data,
      gradientType,
      iteration,
      batchSize,
    ]);

  /*
  ========================================================
  ONE GRADIENT DESCENT STEP
  ========================================================
  */

  const performStep =
    useCallback(() => {
      if (
        iteration >=
        maxIterations
      ) {
        setIsPlaying(false);

        return;
      }

      if (
        data.length === 0
      ) {
        setIsPlaying(false);

        return;
      }

      const indexes =
        chooseActiveIndexes();

      const selectedData =
        indexes.map(
          (index) =>
            data[index]
        );

      const gradients =
        calculateGradient(
          selectedData,
          weight,
          bias,
          lossFunction
        );

      const newWeight =
        weight -
        learningRate *
          gradients.weightGradient;

      const newBias =
        bias -
        learningRate *
          gradients.biasGradient;

      /*
      Displayed loss is calculated
      using the complete active dataset.
      */

      const newLoss =
        calculateLoss(
          data,
          newWeight,
          newBias,
          lossFunction
        );

      const snapshot:
        TrainingSnapshot = {
          iteration:
            iteration + 1,

          weight:
            newWeight,

          bias:
            newBias,

          loss:
            newLoss,

          weightGradient:
            gradients.weightGradient,

          biasGradient:
            gradients.biasGradient,

          activeIndexes:
            indexes,
        };

      setActiveIndexes(
        indexes
      );

      setWeight(
        newWeight
      );

      setBias(
        newBias
      );

      setIteration(
        (previous) =>
          previous + 1
      );

      setHistory(
        (previous) => [
          ...previous,
          snapshot,
        ]
      );
    }, [
      data,
      iteration,
      maxIterations,
      chooseActiveIndexes,
      weight,
      bias,
      learningRate,
      lossFunction,
    ]);

  /*
  ========================================================
  PLAY LOOP
  ========================================================
  */

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (
      iteration >=
      maxIterations
    ) {
      setIsPlaying(false);

      return;
    }

    const delay =
      Math.max(
        40,
        450 / speed
      );

    const timer =
      window.setTimeout(
        () => {
          performStep();
        },
        delay
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    isPlaying,
    iteration,
    maxIterations,
    performStep,
    speed,
  ]);

  /*
  ========================================================
  RESET TRAINING
  ========================================================
  */

  const resetTraining =
    useCallback(() => {
      setIsPlaying(false);

      setWeight(
        initialWeight
      );

      setBias(
        initialBias
      );

      setIteration(0);

      setHistory([]);

      setActiveIndexes([]);
    }, [
      initialWeight,
      initialBias,
    ]);

  /*
  ========================================================
  PREVIOUS STEP
  ========================================================
  */

  function previousStep() {
    if (
      history.length === 0
    ) {
      return;
    }

    setIsPlaying(false);

    const newHistory =
      history.slice(
        0,
        -1
      );

    const previous =
      newHistory[
        newHistory.length -
          1
      ];

    if (!previous) {
      setWeight(
        initialWeight
      );

      setBias(
        initialBias
      );

      setIteration(0);

      setActiveIndexes(
        []
      );

      setHistory([]);

      return;
    }

    setWeight(
      previous.weight
    );

    setBias(
      previous.bias
    );

    setIteration(
      previous.iteration
    );

    setActiveIndexes(
      previous.activeIndexes
    );

    setHistory(
      newHistory
    );
  }

  /*
  ========================================================
  PARAMETER VALUE CHANGE
  ========================================================
  */

  function handleValueChange(
    parameterId: string,
    value: ParameterValue
  ) {
    setValues(
      (previous) => ({
        ...previous,

        [parameterId]:
          value,
      })
    );

    /*
    Starting weight/bias changes
    where optimization begins.
    */

    if (
      parameterId ===
        "initialWeight" ||
      parameterId ===
        "initialBias"
    ) {
      setIsPlaying(false);

      setIteration(0);

      setHistory([]);

      setActiveIndexes([]);

      if (
        parameterId ===
        "initialWeight"
      ) {
        setWeight(
          Number(value)
        );

        setBias(
          initialBias
        );
      }

      if (
        parameterId ===
        "initialBias"
      ) {
        setBias(
          Number(value)
        );

        setWeight(
          initialWeight
        );
      }
    }
  }

  /*
  ========================================================
  CHANGE LEARNING LEVEL
  ========================================================
  */

  function handleLevelChange(
    level: LearningLevel
  ) {
    setLearningLevel(
      level
    );

    const nextParameters =
      getParametersByLevel(
        "gradient-descent",
        level
      );

    const selectedStillExists =
      nextParameters.some(
        (parameter) =>
          parameter.id ===
          selectedParameterId
      );

    if (
      !selectedStillExists &&
      nextParameters.length >
        0
    ) {
      setSelectedParameterId(
        nextParameters[0].id
      );
    }
  }

  /*
  ========================================================
  CHANGE GRADIENT DESCENT TYPE
  ========================================================
  */

  function handleTypeChange(
    type: GradientDescentType
  ) {
    setValues(
      (previous) => ({
        ...previous,

        gradientType:
          type,
      })
    );

    setSelectedParameterId(
      "gradientType"
    );

    setIsPlaying(false);

    setActiveIndexes([]);

    setIteration(0);

    setHistory([]);

    setWeight(
      initialWeight
    );

    setBias(
      initialBias
    );
  }

  /*
  ========================================================
  USE UPLOADED DATASET
  ========================================================
  */

  function useUploadedDataset(
    nextData: RegressionPoint[],
    nextFeatureName: string,
    nextTargetName: string
  ) {
    setIsPlaying(false);

    setUploadedDataset(
      nextData
    );

    setFeatureName(
      nextFeatureName
    );

    setTargetName(
      nextTargetName
    );

    /*
    Start the new dataset from the
    configured initial parameters.
    */

    setWeight(
      initialWeight
    );

    setBias(
      initialBias
    );

    setIteration(0);

    setHistory([]);

    setActiveIndexes([]);
  }

  /*
  ========================================================
  RETURN TO DEMO DATASET
  ========================================================
  */

  function useDemoDataset() {
    setIsPlaying(false);

    setUploadedDataset(null);

    setFeatureName("X");

    setTargetName("Y");

    setWeight(
      initialWeight
    );

    setBias(
      initialBias
    );

    setIteration(0);

    setHistory([]);

    setActiveIndexes([]);
  }

  /*
  ========================================================
  OPTIMIZATION PATH FOR LOSS SURFACE
  ========================================================
  */

  const optimizationHistory =
    useMemo(
      () => [
        {
          weight:
            initialWeight,

          bias:
            initialBias,

          loss:
            calculateLoss(
              data,
              initialWeight,
              initialBias,
              lossFunction
            ),
        },

        ...history.map(
          (snapshot) => ({
            weight:
              snapshot.weight,

            bias:
              snapshot.bias,

            loss:
              snapshot.loss,
          })
        ),
      ],
      [
        data,
        history,
        initialWeight,
        initialBias,
        lossFunction,
      ]
    );

  /*
  ========================================================
  CURRENT GRADIENT
  ========================================================
  */

  const currentGradientData =
    useMemo(() => {
      if (
        data.length === 0
      ) {
        return {
          weightGradient: 0,
          biasGradient: 0,
        };
      }

      let indexes:
        number[] = [];

      if (
        gradientType ===
        "Batch Gradient Descent"
      ) {
        indexes =
          data.map(
            (_, index) =>
              index
          );
      } else if (
        gradientType ===
        "Stochastic Gradient Descent"
      ) {
        indexes = [
          iteration %
            data.length,
        ];
      } else {
        const safeBatchSize =
          Math.min(
            Math.max(
              1,
              batchSize
            ),
            data.length
          );

        const start =
          (iteration *
            safeBatchSize) %
          data.length;

        indexes =
          Array.from(
            {
              length:
                safeBatchSize,
            },
            (_, index) =>
              (start +
                index) %
              data.length
          );
      }

      const selectedData =
        indexes.map(
          (index) =>
            data[index]
        );

      return calculateGradient(
        selectedData,
        weight,
        bias,
        lossFunction
      );
    }, [
      data,
      gradientType,
      iteration,
      batchSize,
      weight,
      bias,
      lossFunction,
    ]);

  const currentWeightGradient =
    currentGradientData
      .weightGradient;

  const currentBiasGradient =
    currentGradientData
      .biasGradient;

  /*
  ========================================================
  UI
  ========================================================
  */

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          ModelMind
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-zinc-100 md:text-3xl">
          Gradient Descent
          Visualizer
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
          See how a Linear
          Regression model learns.
          Change parameters,
          inspect gradients and
          watch weight, bias and
          loss update step by step.
        </p>
      </div>

      {/* DATASET ANALYZER */}

      <GradientDescentDatasetAnalyzer
        onUseDataset={
          useUploadedDataset
        }
        onUseDemo={
          useDemoDataset
        }
        activeFeatureName={
          featureName
        }
        activeTargetName={
          targetName
        }
        activeSampleCount={
          data.length
        }
        usingUploadedDataset={
          uploadedDataset !== null
        }
      />

      {/* ACTIVE DATASET */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Active Training Data
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <DatasetMetric
            label="Feature X"
            value={featureName}
          />

          <DatasetMetric
            label="Target Y"
            value={targetName}
          />

          <DatasetMetric
            label="Samples"
            value={String(
              data.length
            )}
          />
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Gradient Descent is
          currently optimizing the
          model using{" "}
          <strong className="text-zinc-200">
            {featureName}
          </strong>{" "}
          as X and{" "}
          <strong className="text-zinc-200">
            {targetName}
          </strong>{" "}
          as Y.
        </p>
      </div>

      {/* PARAMETER AREA */}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <GradientDescentControls
          parameters={
            parameters
          }
          selectedParameterId={
            selectedParameterId
          }
          onParameterChange={
            setSelectedParameterId
          }
          values={
            values
          }
          onValueChange={
            handleValueChange
          }
          learningLevel={
            learningLevel
          }
          onLearningLevelChange={
            handleLevelChange
          }
        />

        {selectedParameter ? (
          <ParameterExplanation
            parameter={
              selectedParameter
            }
          />
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500">
            Select a parameter
            to see its explanation.
          </div>
        )}
      </div>

      {/* GRADIENT DIRECTION */}

      <GradientDirectionExplanation
        weightGradient={
          currentWeightGradient
        }
        biasGradient={
          currentBiasGradient
        }
        learningRate={
          learningRate
        }
        weight={
          weight
        }
        bias={
          bias
        }
      />

      {/* ANIMATION CONTROLS */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Training Animation
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Control Gradient
              Descent one update
              at a time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                previousStep
              }
              disabled={
                history.length ===
                0
              }
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setIsPlaying(
                  (previous) =>
                    !previous
                )
              }
              disabled={
                iteration >=
                maxIterations
              }
              className="rounded-xl bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPlaying
                ? "Pause"
                : "▶ Play"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(
                  false
                );

                performStep();
              }}
              disabled={
                iteration >=
                maxIterations
              }
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next Step →
            </button>

            <button
              type="button"
              onClick={
                resetTraining
              }
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
            >
              Reset
            </button>
          </div>
        </div>

        {/* SPEED */}

        <div className="mt-5 max-w-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Animation Speed
            </span>

            <span className="font-mono text-xs text-zinc-300">
              {speed}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={speed}
            onChange={(
              event
            ) =>
              setSpeed(
                Number(
                  event.target
                    .value
                )
              )
            }
            className="w-full cursor-pointer accent-zinc-200"
          />
        </div>
      </div>

      {/* LIVE TRAINING VALUES */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric
          label="Iteration"
          value={`${iteration}/${maxIterations}`}
        />

        <Metric
          label="Weight"
          value={formatValue(
            weight
          )}
        />

        <Metric
          label="Bias"
          value={formatValue(
            bias
          )}
        />

        <Metric
          label="Loss"
          value={formatValue(
            currentLoss
          )}
        />

        <Metric
          label="∂Loss / ∂Weight"
          value={formatValue(
            currentWeightGradient
          )}
        />

        <Metric
          label="∂Loss / ∂Bias"
          value={formatValue(
            currentBiasGradient
          )}
        />
      </div>

      {/* MODEL ANIMATION */}

<div className="mx-auto w-full max-w-5xl">
  <RegressionAnimation
    data={
      data
    }
    weight={
      weight
    }
    bias={
      bias
    }
    activeIndexes={
      activeIndexes
    }
  />
</div>

      {/* LOSS CURVE */}

      <LossCurve
        lossHistory={
          lossHistory
        }
        currentIteration={
          iteration
        }
        maxIterations={
          maxIterations
        }
      />

      {/* LOSS SURFACE */}

      <LossSurface
        data={
          data
        }
        weight={
          weight
        }
        bias={
          bias
        }
        history={
          optimizationHistory
        }
        lossFunction={
          lossFunction
        }
      />

      {/* GRADIENT DESCENT TYPES */}

      <GradientDescentTypes
        selectedType={
          gradientType
        }
        onTypeChange={
          handleTypeChange
        }
        totalSamples={
          data.length
        }
        batchSize={
          batchSize
        }
        activeIndexes={
          activeIndexes
        }
      />

      {/* LEARNING PROCESS */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          What happened in this
          step?
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ProcessBox>
            Select training
            samples
          </ProcessBox>

          <Arrow />

          <ProcessBox>
            ŷ = wx + b
          </ProcessBox>

          <Arrow />

          <ProcessBox>
            Calculate error
          </ProcessBox>

          <Arrow />

          <ProcessBox>
            Calculate gradient
          </ProcessBox>

          <Arrow />

          <ProcessBox>
            w = w − α∇w
          </ProcessBox>

          <Arrow />

          <ProcessBox>
            b = b − α∇b
          </ProcessBox>

          <Arrow />

          <ProcessBox>
            Loss changes
          </ProcessBox>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-sm leading-7 text-zinc-400">
            The current learning
            rate is{" "}

            <strong className="text-zinc-200">
              {learningRate}
            </strong>

            . Gradient Descent
            calculates the
            direction in which
            weight and bias should
            move, then multiplies
            that gradient by the
            learning rate to decide
            the size of the update.
          </p>
        </div>
      </div>

      {/* METHOD COMPARISON */}

      <GradientDescentComparison
        data={
          data
        }
        learningRate={
          learningRate
        }
        maxIterations={
          maxIterations
        }
        initialWeight={
          initialWeight
        }
        initialBias={
          initialBias
        }
        batchSize={
          batchSize
        }
        lossFunction={
          lossFunction
        }
      />
    </div>
  );
}

/*
========================================================
LOSS
========================================================
*/

function calculateLoss(
  data: RegressionPoint[],
  weight: number,
  bias: number,
  lossFunction: string
) {
  if (
    data.length === 0
  ) {
    return 0;
  }

  let total = 0;

  for (
    const point of data
  ) {
    const prediction =
      weight *
        point.x +
      bias;

    const error =
      prediction -
      point.y;

    if (
      lossFunction ===
      "Mean Absolute Error"
    ) {
      total +=
        Math.abs(
          error
        );
    } else {
      total +=
        error *
        error;
    }
  }

  return (
    total /
    data.length
  );
}

/*
========================================================
GRADIENT
========================================================
*/

function calculateGradient(
  data: RegressionPoint[],
  weight: number,
  bias: number,
  lossFunction: string
) {
  if (
    data.length === 0
  ) {
    return {
      weightGradient: 0,
      biasGradient: 0,
    };
  }

  let weightGradient =
    0;

  let biasGradient =
    0;

  /*
  --------------------------------------------------------
  MAE SUBGRADIENT
  --------------------------------------------------------
  */

  if (
    lossFunction ===
    "Mean Absolute Error"
  ) {
    for (
      const point of data
    ) {
      const prediction =
        weight *
          point.x +
        bias;

      const error =
        prediction -
        point.y;

      const sign =
        error > 0
          ? 1
          : error < 0
            ? -1
            : 0;

      weightGradient +=
        sign *
        point.x;

      biasGradient +=
        sign;
    }

    return {
      weightGradient:
        weightGradient /
        data.length,

      biasGradient:
        biasGradient /
        data.length,
    };
  }

  /*
  --------------------------------------------------------
  MSE GRADIENT
  --------------------------------------------------------
  */

  for (
    const point of data
  ) {
    const prediction =
      weight *
        point.x +
      bias;

    const error =
      prediction -
      point.y;

    weightGradient +=
      error *
      point.x;

    biasGradient +=
      error;
  }

  return {
    weightGradient:
      (2 /
        data.length) *
      weightGradient,

    biasGradient:
      (2 /
        data.length) *
      biasGradient,
  };
}

/*
========================================================
METRIC CARD
========================================================
*/

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 break-all font-mono text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

/*
========================================================
DATASET METRIC CARD
========================================================
*/

function DatasetMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-zinc-100">
        {value}
      </p>
    </div>
  );
}

/*
========================================================
PROCESS UI
========================================================
*/

function ProcessBox({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-zinc-600">
      →
    </span>
  );
}

/*
========================================================
NUMBER FORMAT
========================================================
*/

function formatValue(
  value: number
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return "∞";
  }

  if (
    Math.abs(
      value
    ) > 100000
  ) {
    return value.toExponential(
      3
    );
  }

  if (
    Math.abs(
      value
    ) <
      0.0001 &&
    value !== 0
  ) {
    return value.toExponential(
      3
    );
  }

  return value.toFixed(
    5
  );
}