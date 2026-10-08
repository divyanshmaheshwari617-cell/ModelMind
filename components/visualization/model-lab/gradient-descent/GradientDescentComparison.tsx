"use client";



import {

  useEffect,

  useMemo,

  useState,

} from "react";



import RegressionAnimation, {

  type RegressionPoint,

} from "./RegressionAnimation";

import ComparisonLossCurve from "./ComparisonLossCurve";

import ComparisonLossSurface from "./ComparisonLossSurface";

import GradientDescent3DSurface from "./GradientDescent3DSurface";



/*

========================================================

TYPES

========================================================

*/



export type ComparisonMethod =

  | "Batch"

  | "SGD"

  | "Mini-Batch";



type ComparisonMode =

  | ComparisonMethod

  | "Compare All";



type MethodState = {

  weight: number;

  bias: number;



  iteration: number;



  lossHistory: number[];



  path: {

    weight: number;

    bias: number;

    loss: number;

  }[];



  activeIndexes: number[];



  status:

    | "Ready"

    | "Running"

    | "Completed";

};



type GradientDescentComparisonProps = {

  data: RegressionPoint[];



  learningRate: number;



  maxIterations: number;



  initialWeight: number;



  initialBias: number;



  batchSize: number;



  lossFunction: string;

};



/*

========================================================

METHOD INFORMATION

========================================================

*/



const METHOD_INFO = {

  Batch: {

    fullName:

      "Batch Gradient Descent",



    shortDescription:

      "Uses the complete training dataset to calculate every gradient update.",



    sampleRule:

      "All training samples are used for each update.",



    behavior:

      "Because every update sees the complete dataset, the optimization path is generally smoother and more stable.",



    advantage:

      "Stable gradient direction and smooth loss behavior.",



    limitation:

      "Each update becomes more computationally expensive as the dataset becomes very large.",



    watch:

      "Watch all samples participate together and notice how the regression parameters usually move along a smoother path.",



    badge:

      "ALL SAMPLES",

  },



  SGD: {

    fullName:

      "Stochastic Gradient Descent",



    shortDescription:

      "Uses one training sample to calculate each gradient update.",



    sampleRule:

      "Only one training sample contributes to each update.",



    behavior:

      "Different samples can push the parameters in different directions, so the optimization path is usually noisier.",



    advantage:

      "Very frequent parameter updates and low computation per individual update.",



    limitation:

      "The optimization path can fluctuate or bounce around because each update depends on one sample.",



    watch:

      "Watch one sample become active at a time and notice how weight, bias and loss can fluctuate between updates.",



    badge:

      "1 SAMPLE",

  },



  "Mini-Batch": {

    fullName:

      "Mini-Batch Gradient Descent",



    shortDescription:

      "Uses a small group of training samples for each gradient update.",



    sampleRule:

      "A subset of the training dataset contributes to each update.",



    behavior:

      "It combines information from several samples while still updating more frequently than full Batch Gradient Descent.",



    advantage:

      "Balances update efficiency with a more stable gradient than single-sample SGD.",



    limitation:

      "Batch size becomes another parameter that affects training behavior.",



    watch:

      "Watch a small group of samples participate together. Its path often appears between Batch GD's smooth behavior and SGD's noisy behavior.",



    badge:

      "SMALL BATCH",

  },

} as const;



const METHODS: ComparisonMethod[] = [

  "Batch",

  "SGD",

  "Mini-Batch",

];



/*

========================================================

MAIN COMPONENT

========================================================

*/



export default function GradientDescentComparison({

  data,

  learningRate,

  maxIterations,

  initialWeight,

  initialBias,

  batchSize,

  lossFunction,

}: GradientDescentComparisonProps) {

  const [

    mode,

    setMode,

  ] =

    useState<ComparisonMode>(

      "Batch"

    );



  const [

    isPlaying,

    setIsPlaying,

  ] = useState(false);



  const [

    speed,

    setSpeed,

  ] = useState(1);

  const featureScaling = useMemo(() => {

  if (data.length === 0) {

    return {

      mean: 0,

      scale: 1,

      scaledData: [] as RegressionPoint[],

    };

  }



  let mean = 0;

  let m2 = 0;



  for (let i = 0; i < data.length; i++) {

    const x = data[i].x;

    const delta = x - mean;



    mean += delta / (i + 1);

    m2 += delta * (x - mean);

  }



  const variance = m2 / data.length;

  const standardDeviation = Math.sqrt(variance);



  const scale =

    Number.isFinite(standardDeviation) &&

    standardDeviation > 0

      ? standardDeviation

      : 1;



  const scaledData = data.map((point) => ({

    ...point,

    x: (point.x - mean) / scale,

  }));



  return {

    mean,

    scale,

    scaledData,

  };

}, [data]);



  const initialLoss =

    useMemo(

      () =>

        calculateLoss(

          data,

          initialWeight,

          initialBias,

          lossFunction

        ),

      [

        data,

        initialWeight,

        initialBias,

        lossFunction,

      ]

    );



  /*

  ========================================================

  INDEPENDENT METHOD STATES

  ========================================================

  */



  const [

    states,

    setStates,

  ] = useState<

    Record<

      ComparisonMethod,

      MethodState

    >

  >(() =>

    createInitialStates(

      initialWeight,

      initialBias,

      initialLoss

    )

  );



  /*

  ========================================================

  RESET WHEN SHARED EXPERIMENT SETTINGS CHANGE

  ========================================================

  */



  useEffect(() => {

    setIsPlaying(false);



    setStates(

      createInitialStates(

        initialWeight,

        initialBias,

        initialLoss

      )

    );

  }, [

    learningRate,

    maxIterations,

    initialWeight,

    initialBias,

    batchSize,

    lossFunction,

    initialLoss,

  ]);



  /*

  ========================================================

  STEP ONE METHOD

  ========================================================

  */



  function stepMethod(

    method: ComparisonMethod,

    state: MethodState

  ): MethodState {

    if (

      state.iteration >=

      maxIterations

    ) {

      return {

        ...state,

        status: "Completed",

        activeIndexes: [],

      };

    }



    const indexes =

      chooseIndexes(

        method,

        state.iteration,

        data.length,

        batchSize

      );



    const { mean, scale, scaledData } = featureScaling;

    // Optimize with standardized X while retaining original-coordinate
    // parameters for the regression and loss-surface visualizations.
    const scaledWeight = state.weight * scale;
    const scaledBias = state.bias + state.weight * mean;

    const selectedData =
      method === "Batch"
        ? scaledData
        : indexes.map((index) => scaledData[index]);

    const gradient = calculateGradient(
      selectedData,
      scaledWeight,
      scaledBias,
      lossFunction
    );

    const newScaledWeight =
      scaledWeight - learningRate * gradient.weightGradient;
    const newScaledBias =
      scaledBias - learningRate * gradient.biasGradient;

    const newWeight = newScaledWeight / scale;
    const newBias = newScaledBias - newWeight * mean;

    const newLoss =

      calculateLoss(

        data,

        newWeight,

        newBias,

        lossFunction

      );



    const newIteration =

      state.iteration + 1;



    return {

      weight: newWeight,



      bias: newBias,



      iteration:

        newIteration,



      lossHistory: [

        ...state.lossHistory,

        newLoss,

      ],



      path: [

        ...state.path,

        {

          weight:

            newWeight,



          bias:

            newBias,



          loss:

            newLoss,

        },

      ],



      activeIndexes:

        indexes,



      status:

        newIteration >=

        maxIterations

          ? "Completed"

          : "Running",

    };

  }



  /*

  ========================================================

  STEP CURRENT MODE

  ========================================================

  */



  function performStep() {

    setStates(

      (previous) => {

        const next = {

          ...previous,

        };



        if (

          mode ===

          "Compare All"

        ) {

          for (

            const method of METHODS

          ) {

            next[method] =

              stepMethod(

                method,

                previous[

                  method

                ]

              );

          }



          return next;

        }



        next[mode] =

          stepMethod(

            mode,

            previous[mode]

          );



        return next;

      }

    );

  }



  /*

  ========================================================

  CHECK WHETHER CURRENT MODE FINISHED

  ========================================================

  */



  const finished =

    useMemo(() => {

      if (

        mode ===

        "Compare All"

      ) {

        return METHODS.every(

          (method) =>

            states[method]

              .iteration >=

            maxIterations

        );

      }



      return (

        states[mode]

          .iteration >=

        maxIterations

      );

    }, [

      mode,

      states,

      maxIterations,

    ]);



  /*

  ========================================================

  PLAY LOOP

  ========================================================

  */



  
useEffect(() => {
  if (!isPlaying || finished) {
    return;
  }

  const delay = Math.max(50, 500 / speed);

  const timer = window.setTimeout(() => {
    console.log("[GD Play] Timer fired");
    performStep();
  }, delay);

  return () => {
    window.clearTimeout(timer);
  };
});




  /*

  ========================================================

  RESET

  ========================================================

  */



  function reset() {

    setIsPlaying(false);



    setStates(

      createInitialStates(

        initialWeight,

        initialBias,

        initialLoss

      )

    );

  }



  /*

  ========================================================

  MODE CHANGE

  ========================================================

  */



  function changeMode(

    nextMode: ComparisonMode

  ) {

    setIsPlaying(false);



    setMode(nextMode);

  }



  /*

  ========================================================

  RENDER

  ========================================================

  */



  return (

    <div className="space-y-6">

      {/* TITLE */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">

          Gradient Descent Lab

        </p>



        <h2 className="mt-2 text-2xl font-semibold text-zinc-100">

          Learn & Compare Gradient

          Descent Types

        </h2>



        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">

          Train the same Linear

          Regression model using

          three different

          optimization strategies

          and compare how their

          parameter updates behave.

        </p>



        {/* IMPORTANT DISTINCTION */}



        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">

          <p className="text-sm font-semibold text-zinc-200">

            Important concept

          </p>



          <p className="mt-2 text-sm leading-6 text-zinc-400">

            Batch GD, SGD and

            Mini-Batch GD are not

            three different

            prediction models.

            The model here is{" "}

            <strong className="text-zinc-200">

              Linear Regression

            </strong>

            . These are different

            strategies for

            optimizing its weight

            and bias.

          </p>

        </div>

      </div>



      {/* MODE SELECTOR */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

          Visualization Mode

        </p>



        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {METHODS.map(

            (method) => (

              <ModeButton

                key={

                  method

                }

                active={

                  mode ===

                  method

                }

                title={

                  METHOD_INFO[

                    method

                  ].fullName

                }

                subtitle={

                  METHOD_INFO[

                    method

                  ].badge

                }

                onClick={() =>

                  changeMode(

                    method

                  )

                }

              />

            )

          )}



          <ModeButton

            active={

              mode ===

              "Compare All"

            }

            title="Compare All"

            subtitle="SIDE BY SIDE"

            onClick={() =>

              changeMode(

                "Compare All"

              )

            }

          />

        </div>

      </div>



      {/* FAIR COMPARISON SETTINGS */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

          Experiment Conditions

        </p>



        <p className="mt-2 text-sm text-zinc-400">

          The methods use the same

          experiment settings so

          their behavior can be

          compared.

        </p>



        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          <Setting

            label="Dataset"

            value={`${data.length} samples`}

          />



          <Setting

            label="Learning Rate"

            value={

              learningRate

            }

          />



          <Setting

            label="Initial Weight"

            value={

              initialWeight

            }

          />



          <Setting

            label="Initial Bias"

            value={

              initialBias

            }

          />



          <Setting

            label="Iterations"

            value={

              maxIterations

            }

          />



          <Setting

            label="Loss"

            value={

              lossFunction

            }

          />

        </div>

      </div>



      {/* CONTROLS */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

        <div className="flex flex-wrap items-center justify-between gap-5">

          <div>

            <p className="text-sm font-semibold text-zinc-200">

              Animation Controls

            </p>



            <p className="mt-1 text-xs text-zinc-500">

              Run one update at a

              time or animate the

              complete experiment.

            </p>

          </div>



          <div className="flex flex-wrap gap-2">

            <button

              type="button"

              onClick={() =>

                setIsPlaying(

                  (previous) =>

                    !previous

                )

              }

              disabled={

                finished

              }

              className="rounded-xl bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"

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

                finished

              }

              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"

            >

              Next Step

            </button>



            <button

              type="button"

              onClick={

                reset

              }

              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300"

            >

              Reset All

            </button>

          </div>

        </div>



        <div className="mt-5 max-w-sm">

          <div className="flex items-center justify-between text-xs">

            <span className="text-zinc-500">

              Animation Speed

            </span>



            <span className="font-mono text-zinc-300">

              {speed}x

            </span>

          </div>



          <input

            className="mt-2 w-full accent-zinc-200"

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

          />

        </div>

      </div>



      {/* INDIVIDUAL METHOD */}



{mode !== "Compare All" && (

  <SingleMethodView

    method={mode}

    state={states[mode]}

    data={data}

    totalSamples={data.length}

    batchSize={batchSize}

    initialLoss={initialLoss}

    lossFunction={lossFunction}

  />

)}



      {/* COMPARE ALL */}



      {mode ===

        "Compare All" && (

        <CompareAllView

  data={data}

  states={states}

  totalSamples={data.length}

  batchSize={batchSize}

  initialLoss={initialLoss}

  maxIterations={maxIterations}

  lossFunction={lossFunction}

/>

      )}

    </div>

  );

}



/*

========================================================

SINGLE METHOD VIEW

========================================================

*/



function SingleMethodView({

  method,

  state,

  data,

  totalSamples,

  batchSize,

  initialLoss,

  lossFunction,

}: {

  method: ComparisonMethod;



  state: MethodState;



  data: RegressionPoint[];



  totalSamples: number;



  batchSize: number;



  initialLoss: number;



  lossFunction: string;

}) {

  const info =

    METHOD_INFO[method];



  const samplesPerUpdate =

    getSamplesPerUpdate(

      method,

      totalSamples,

      batchSize

    );



  const currentLoss =

    state.lossHistory[

      state.lossHistory.length -

        1

    ];



  const reduction =

    calculateReduction(

      initialLoss,

      currentLoss

    );



  return (

    <>

      {/* THEORY */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

              Learn the Method

            </p>



            <h3 className="mt-2 text-xl font-semibold text-zinc-100">

              {

                info.fullName

              }

            </h3>



            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">

              {

                info.shortDescription

              }

            </p>

          </div>



          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300">

            {info.badge}

          </span>

        </div>



        <div className="mt-5 grid gap-3 md:grid-cols-2">

          <Explanation

            title="How are samples used?"

            text={

              info.sampleRule

            }

          />



          <Explanation

            title="Optimization behavior"

            text={

              info.behavior

            }

          />



          <Explanation

            title="Advantage"

            text={

              info.advantage

            }

          />



          <Explanation

            title="Limitation"

            text={

              info.limitation

            }

          />

        </div>



        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">

          <p className="text-sm font-semibold text-zinc-200">

            What should I watch?

          </p>



          <p className="mt-2 text-sm leading-6 text-zinc-400">

            {info.watch}

          </p>

        </div>

      </div>



      {/* ACTIVE SAMPLES */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <p className="text-sm font-semibold text-zinc-200">

              Current Gradient

              Calculation

            </p>



            <p className="mt-1 text-xs text-zinc-500">

              Highlighted samples

              contributed to the

              latest update.

            </p>

          </div>



          <span className="font-mono text-xs text-zinc-400">

            {

              samplesPerUpdate

            }{" "}

            sample

            {samplesPerUpdate ===

            1

              ? ""

              : "s"}{" "}

            / update

          </span>

        </div>



        <div className="mt-5 flex flex-wrap gap-3">

          {Array.from(

            {

              length:

                totalSamples,

            },

            (_, index) => {

              const active =

                state.activeIndexes.includes(-1) ||

state.activeIndexes.includes(index)



              return (

                <div

                  key={index}

                  className={[

                    "flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs transition",

                    active

                      ? "scale-110 border-amber-400 bg-amber-400/10 text-amber-300"

                      : "border-zinc-800 bg-zinc-900 text-zinc-600",

                  ].join(

                    " "

                  )}

                >

                  {index + 1}

                </div>

              );

            }

          )}

        </div>

      </div>

      <GradientDescent3DSurface

  data={data}

  paths={[

    {

      id: method,

      name: info.fullName,

      shortName:

        method === "Batch"

          ? "Batch GD"

          : method === "SGD"

            ? "SGD"

            : "Mini-Batch GD",

      color:

        method === "Batch"

          ? "#38bdf8"

          : method === "SGD"

            ? "#f59e0b"

            : "#a78bfa",

      path: state.path,

    },

  ]}

  lossFunction={lossFunction}

  title={`${info.fullName} — 3D Loss Surface`}

  description={

    method === "Batch"

      ? "Watch Batch Gradient Descent move down the 3D loss surface. Because every update uses all training samples, its optimization path is usually comparatively smooth."

      : method === "SGD"

        ? "Watch Stochastic Gradient Descent move through the 3D loss surface. Because each update uses one training sample, the optimization path can move in noisier directions."

        : "Watch Mini-Batch Gradient Descent move through the 3D loss surface. Each update uses a small group of samples, producing behavior between Batch GD and SGD."

  }

/>



      {/* RESULT */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

          Individual Result

        </p>



        <h3 className="mt-2 text-lg font-semibold text-zinc-100">

          {info.fullName} Result

        </h3>



        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <Result

            label="Weight"

            value={formatNumber(

              state.weight

            )}

          />



          <Result

            label="Bias"

            value={formatNumber(

              state.bias

            )}

          />



          <Result

            label="Current Loss"

            value={formatNumber(

              currentLoss

            )}

          />



          <Result

            label="Iterations"

            value={

              state.iteration

            }

          />



          <Result

            label="Loss Reduction"

            value={`${reduction.toFixed(

              2

            )}%`}

          />



          <Result

            label="Status"

            value={

              state.status

            }

          />

        </div>

      </div>

    </>

  );

}



/*

========================================================

COMPARE ALL

========================================================

*/



function CompareAllView({

  data,

  states,

  totalSamples,

  batchSize,

  initialLoss,

  maxIterations,

  lossFunction,

}: {

  data: RegressionPoint[];



  states: Record<

    ComparisonMethod,

    MethodState

  >;



  totalSamples: number;



  batchSize: number;



  initialLoss: number;



  maxIterations: number;



  lossFunction: string;

}) {

  return (

    <div className="space-y-6">

    {/* =====================================================

    SIDE-BY-SIDE LIVE REGRESSION ANIMATIONS

===================================================== */}



<div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

  <div>

    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

      Live Training Comparison

    </p>



    <h3 className="mt-2 text-lg font-semibold text-zinc-100">

      Watch All Three Methods Train

      Simultaneously

    </h3>



    <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">

      The dataset, starting weight,

      starting bias, learning rate

      and loss function are the

      same. The highlighted samples

      show which observations are

      being used to calculate the

      current gradient update.

    </p>

  </div>



  <div className="mt-6 grid gap-5 xl:grid-cols-3">

    {/* BATCH */}



    <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">

      <div className="mb-4">

        <div className="flex items-center justify-between gap-3">

          <h4 className="font-semibold text-zinc-100">

            Batch GD

          </h4>



          <span className="rounded-full border border-zinc-700 px-2.5 py-1 font-mono text-[10px] text-zinc-400">

            ALL SAMPLES

          </span>

        </div>



        <p className="mt-2 text-xs leading-5 text-zinc-500">

          Every training point

          contributes to each

          gradient update.

        </p>

      </div>



      <RegressionAnimation

        data={data}

        weight={

          states.Batch.weight

        }

        bias={

          states.Batch.bias

        }

        showResiduals={true}

        activeIndexes={

          states.Batch

            .activeIndexes

        }

      />



      <LiveMethodStatus

        state={

          states.Batch

        }

        samples={`${totalSamples}/${totalSamples}`}

        behavior="Usually smoother updates"

      />

    </div>



    {/* SGD */}



    <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">

      <div className="mb-4">

        <div className="flex items-center justify-between gap-3">

          <h4 className="font-semibold text-zinc-100">

            SGD

          </h4>



          <span className="rounded-full border border-zinc-700 px-2.5 py-1 font-mono text-[10px] text-zinc-400">

            1 SAMPLE

          </span>

        </div>



        <p className="mt-2 text-xs leading-5 text-zinc-500">

          One training point

          contributes to each

          gradient update.

        </p>

      </div>



      <RegressionAnimation

        data={data}

        weight={

          states.SGD.weight

        }

        bias={

          states.SGD.bias

        }

        showResiduals={true}

        activeIndexes={

          states.SGD

            .activeIndexes

        }

      />



      <LiveMethodStatus

        state={

          states.SGD

        }

        samples="1"

        behavior="Usually noisier updates"

      />

    </div>



    {/* MINI-BATCH */}



    <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">

      <div className="mb-4">

        <div className="flex items-center justify-between gap-3">

          <h4 className="font-semibold text-zinc-100">

            Mini-Batch GD

          </h4>



          <span className="rounded-full border border-zinc-700 px-2.5 py-1 font-mono text-[10px] text-zinc-400">

            SMALL GROUP

          </span>

        </div>



        <p className="mt-2 text-xs leading-5 text-zinc-500">

          A small group of training

          points contributes to

          each update.

        </p>

      </div>



      <RegressionAnimation

        data={data}

        weight={

          states[

            "Mini-Batch"

          ].weight

        }

        bias={

          states[

            "Mini-Batch"

          ].bias

        }

        showResiduals={true}

        activeIndexes={

          states[

            "Mini-Batch"

          ].activeIndexes

        }

      />



      <LiveMethodStatus

        state={

          states[

            "Mini-Batch"

          ]

        }

        samples={`${Math.min(

          Math.max(

            1,

            batchSize

          ),

          totalSamples

        )}`}

        behavior="Usually intermediate behavior"

      />

    </div>

  </div>

</div>

      {/* THREE METHOD CARDS */}



      <div className="grid gap-4 xl:grid-cols-3">

        {METHODS.map(

          (method) => {

            const info =

              METHOD_INFO[

                method

              ];



            const state =

              states[method];



            const loss =

              state.lossHistory[

                state

                  .lossHistory

                  .length - 1

              ];



            return (

              <div

                key={

                  method

                }

                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"

              >

                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">

                  {

                    info.badge

                  }

                </p>



                <h3 className="mt-2 font-semibold text-zinc-100">

                  {

                    info.fullName

                  }

                </h3>



                <p className="mt-2 min-h-[60px] text-xs leading-5 text-zinc-500">

                  {

                    info.shortDescription

                  }

                </p>



                {/* ACTIVE POINTS */}



                <div className="mt-4 flex flex-wrap gap-1.5">

                  {Array.from(

                    {

                      length:

                        totalSamples,

                    },

                    (

                      _,

                      index

                    ) => {

                      const active =

                        state.activeIndexes.includes(-1) ||

state.activeIndexes.includes(index)



                      return (

                        <span

                          key={

                            index

                          }

                          className={[

                            "h-4 w-4 rounded-full border",

                            active

                              ? "border-amber-400 bg-amber-400"

                              : "border-zinc-700 bg-zinc-900",

                          ].join(

                            " "

                          )}

                        />

                      );

                    }

                  )}

                </div>



                <div className="mt-5 grid grid-cols-2 gap-2">

                  <MiniMetric

                    label="Iteration"

                    value={

                      state.iteration

                    }

                  />



                  <MiniMetric

                    label="Loss"

                    value={formatNumber(

                      loss

                    )}

                  />



                  <MiniMetric

                    label="Weight"

                    value={formatNumber(

                      state.weight

                    )}

                  />



                  <MiniMetric

                    label="Bias"

                    value={formatNumber(

                      state.bias

                    )}

                  />

                </div>

              </div>

            );

          }

        )}

      </div>



      {/* COMPARISON TABLE */}

      {/* =====================================================

    COMBINED LOSS CURVE

===================================================== */}



<ComparisonLossCurve

  batchLoss={

    states.Batch.lossHistory

  }

  sgdLoss={

    states.SGD.lossHistory

  }

  miniBatchLoss={

    states["Mini-Batch"]

      .lossHistory

  }

  maxIterations={

    Math.max(

      states.Batch.iteration,

      states.SGD.iteration,

      states["Mini-Batch"]

        .iteration,

      1

    )

  }

/>

{/* SHARED OPTIMIZATION LANDSCAPE */}

<GradientDescent3DSurface

  data={data}

  paths={[

    {

      id: "batch",

      name:

        "Batch Gradient Descent",

      shortName: "Batch GD",

      color: "#38bdf8",

      path: states.Batch.path,

    },

    {

      id: "sgd",

      name:

        "Stochastic Gradient Descent",

      shortName: "SGD",

      color: "#f59e0b",

      path: states.SGD.path,

    },

    {

      id: "mini-batch",

      name:

        "Mini-Batch Gradient Descent",

      shortName:

        "Mini-Batch GD",

      color: "#a78bfa",

      path:

        states["Mini-Batch"]

          .path,

    },

  ]}

  lossFunction={lossFunction}

  title="Batch vs SGD vs Mini-Batch — 3D Loss Surface"

  description="All three optimization strategies are shown on the same weight-bias-loss surface. Compare how their different sampling strategies produce different routes toward a lower-loss region."

/>

<ComparisonLossSurface

  data={data}

  batchPath={states.Batch.path}

  sgdPath={states.SGD.path}

  miniBatchPath={

    states["Mini-Batch"].path

  }

  lossFunction={lossFunction}

/>



      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-5">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

            Result Comparison

          </p>



          <h3 className="mt-2 text-lg font-semibold text-zinc-100">

            Same Model, Different

            Optimization Strategy

          </h3>

        </div>



        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px] text-left text-sm">

            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500">

              <tr>

                <th className="px-5 py-4">

                  Metric

                </th>



                <th className="px-5 py-4">

                  Batch GD

                </th>



                <th className="px-5 py-4">

                  SGD

                </th>



                <th className="px-5 py-4">

                  Mini-Batch

                </th>

              </tr>

            </thead>



            <tbody className="divide-y divide-zinc-800">

              <ComparisonRow

                label="Samples / Update"

                batch={

                  totalSamples

                }

                sgd={1}

                mini={Math.min(

                  Math.max(

                    1,

                    batchSize

                  ),

                  totalSamples

                )}

              />



              <ComparisonRow

                label="Final Weight"

                batch={formatNumber(

                  states.Batch

                    .weight

                )}

                sgd={formatNumber(

                  states.SGD

                    .weight

                )}

                mini={formatNumber(

                  states[

                    "Mini-Batch"

                  ].weight

                )}

              />



              <ComparisonRow

                label="Final Bias"

                batch={formatNumber(

                  states.Batch

                    .bias

                )}

                sgd={formatNumber(

                  states.SGD

                    .bias

                )}

                mini={formatNumber(

                  states[

                    "Mini-Batch"

                  ].bias

                )}

              />



              <ComparisonRow

                label="Current Loss"

                batch={formatNumber(

                  getCurrentLoss(

                    states.Batch

                  )

                )}

                sgd={formatNumber(

                  getCurrentLoss(

                    states.SGD

                  )

                )}

                mini={formatNumber(

                  getCurrentLoss(

                    states[

                      "Mini-Batch"

                    ]

                  )

                )}

              />



              <ComparisonRow

                label="Loss Reduction"

                batch={`${calculateReduction(

                  initialLoss,

                  getCurrentLoss(

                    states.Batch

                  )

                ).toFixed(

                  2

                )}%`}

                sgd={`${calculateReduction(

                  initialLoss,

                  getCurrentLoss(

                    states.SGD

                  )

                ).toFixed(

                  2

                )}%`}

                mini={`${calculateReduction(

                  initialLoss,

                  getCurrentLoss(

                    states[

                      "Mini-Batch"

                    ]

                  )

                ).toFixed(

                  2

                )}%`}

              />



              <ComparisonRow

                label="Observed Path Style"

                batch="Usually smoother"

                sgd="Usually noisier"

                mini="Intermediate"

              />

            </tbody>

          </table>

        </div>

      </div>



      {/* WHY DIFFERENT */}



      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

          Understand the Difference

        </p>



        <h3 className="mt-2 text-lg font-semibold text-zinc-100">

          Why can the results and

          paths look different?

        </h3>



        <div className="mt-5 flex flex-wrap items-center gap-2">

          <FlowBox>

            Same Linear Regression

          </FlowBox>



          <Arrow />



          <FlowBox>

            Different samples used

            per update

          </FlowBox>



          <Arrow />



          <FlowBox>

            Different gradient

          </FlowBox>



          <Arrow />



          <FlowBox>

            Different parameter

            movement

          </FlowBox>



          <Arrow />



          <FlowBox>

            Different optimization

            path

          </FlowBox>

        </div>



        <div className="mt-5 grid gap-3 md:grid-cols-3">

          <Explanation

            title="Batch GD"

            text="Uses all samples for each gradient calculation, so individual sample noise is averaged together."

          />



          <Explanation

            title="SGD"

            text="Uses one sample per update, so each sample can temporarily push the parameters in a different direction."

          />



          <Explanation

            title="Mini-Batch GD"

            text="Uses several samples together, reducing some single-sample noise while keeping updates relatively frequent."

          />

        </div>



        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">

          <p className="text-sm leading-6 text-zinc-400">

            The comparison is meant

            to show the trade-offs

            between the methods.

            A method should not be

            treated as universally

            superior only because

            it produces the lowest

            value in one small

            experiment.

          </p>

        </div>

      </div>

    </div>

  );

}



/*

========================================================

INITIAL STATE

========================================================

*/



function createInitialStates(

  weight: number,

  bias: number,

  loss: number

): Record<

  ComparisonMethod,

  MethodState

> {

  function create():

    MethodState {

    return {

      weight,



      bias,



      iteration: 0,



      lossHistory: [

        loss,

      ],



      path: [

        {

          weight,

          bias,

          loss,

        },

      ],



      activeIndexes: [],



      status: "Ready",

    };

  }



  return {

    Batch: create(),



    SGD: create(),



    "Mini-Batch":

      create(),

  };

}



/*

========================================================

SELECT SAMPLES

========================================================

*/



function chooseIndexes(

  method: ComparisonMethod,

  iteration: number,

  totalSamples: number,

  batchSize: number

) {

  if (

    totalSamples === 0

  ) {

    return [];

  }



  if (method === "Batch") {

  return [-1];

}



  if (

    method === "SGD"

  ) {

    return [

      iteration %

        totalSamples,

    ];

  }



  const safeBatchSize =

    Math.min(

      Math.max(

        1,

        batchSize

      ),

      totalSamples

    );



  const start =

    (iteration *

      safeBatchSize) %

    totalSamples;



  return Array.from(

    {

      length:

        safeBatchSize,

    },

    (_, offset) =>

      (start + offset) %

      totalSamples

  );

}



/*

========================================================

SAMPLES PER UPDATE

========================================================

*/



function getSamplesPerUpdate(

  method: ComparisonMethod,

  totalSamples: number,

  batchSize: number

) {

  if (

    method === "Batch"

  ) {

    return totalSamples;

  }



  if (

    method === "SGD"

  ) {

    return 1;

  }



  return Math.min(

    Math.max(

      1,

      batchSize

    ),

    totalSamples

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



  for (const point of data) {

    const prediction =

      weight * point.x +

      bias;



    const error =

      prediction -

      point.y;



    if (

      lossFunction ===

      "Mean Absolute Error"

    ) {

      total +=

        Math.abs(error);

    } else {

      total +=

        error * error;

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



  let weightGradient = 0;



  let biasGradient = 0;



  if (

    lossFunction ===

    "Mean Absolute Error"

  ) {

    for (const point of data) {

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



  for (const point of data) {

    const prediction =

      weight * point.x +

      bias;



    const error =

      prediction -

      point.y;



    weightGradient +=

      error * point.x;



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

HELPERS

========================================================

*/



function getCurrentLoss(

  state: MethodState

) {

  return (

    state.lossHistory[

      state.lossHistory

        .length - 1

    ] ?? 0

  );

}



function calculateReduction(

  initialLoss: number,

  currentLoss: number

) {

  if (

    initialLoss === 0

  ) {

    return 0;

  }



  return (

    ((initialLoss -

      currentLoss) /

      initialLoss) *

    100

  );

}



function formatNumber(

  value: number

) {

  if (

    !Number.isFinite(value)

  ) {

    return "∞";

  }



  if (

    Math.abs(value) >

    100000

  ) {

    return value.toExponential(

      3

    );

  }



  if (

    Math.abs(value) <

      0.0001 &&

    value !== 0

  ) {

    return value.toExponential(

      3

    );

  }



  return value.toFixed(5);

}



/*

========================================================

UI COMPONENTS

========================================================

*/

function LiveMethodStatus({

  state,

  samples,

  behavior,

}: {

  state: MethodState;



  samples: string;



  behavior: string;

}) {

  const loss =

    state.lossHistory[

      state.lossHistory.length - 1

    ] ?? 0;



  return (

    <div className="mt-4 space-y-3">

      <div className="grid grid-cols-2 gap-2">

        <MiniMetric

          label="Iteration"

          value={state.iteration}

        />



        <MiniMetric

          label="Current Loss"

          value={formatNumber(

            loss

          )}

        />



        <MiniMetric

          label="Weight"

          value={formatNumber(

            state.weight

          )}

        />



        <MiniMetric

          label="Bias"

          value={formatNumber(

            state.bias

          )}

        />

      </div>



      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">

        <p className="text-[10px] uppercase tracking-wide text-zinc-600">

          Samples used / update

        </p>



        <p className="mt-1 font-mono text-xs text-zinc-300">

          {samples}

        </p>

      </div>



      <p className="text-xs leading-5 text-zinc-500">

        {behavior}

      </p>

    </div>

  );

}



function ModeButton({

  active,

  title,

  subtitle,

  onClick,

}: {

  active: boolean;



  title: string;



  subtitle: string;



  onClick: () => void;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={[

        "rounded-xl border p-4 text-left transition",

        active

          ? "border-zinc-500 bg-zinc-800"

          : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900",

      ].join(" ")}

    >

      <p className="text-sm font-semibold text-zinc-100">

        {title}

      </p>



      <p className="mt-1 font-mono text-[10px] text-zinc-500">

        {subtitle}

      </p>

    </button>

  );

}



function Setting({

  label,

  value,

}: {

  label: string;



  value:

    | string

    | number;

}) {

  return (

    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">

      <p className="text-xs text-zinc-500">

        {label}

      </p>



      <p className="mt-1 break-all font-mono text-xs font-semibold text-zinc-200">

        {value}

      </p>

    </div>

  );

}



function Result({

  label,

  value,

}: {

  label: string;



  value:

    | string

    | number;

}) {

  return (

    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">

      <p className="text-xs text-zinc-500">

        {label}

      </p>



      <p className="mt-2 break-all font-mono text-sm font-semibold text-zinc-100">

        {value}

      </p>

    </div>

  );

}



function MiniMetric({

  label,

  value,

}: {

  label: string;



  value:

    | string

    | number;

}) {

  return (

    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">

      <p className="text-[10px] text-zinc-600">

        {label}

      </p>



      <p className="mt-1 break-all font-mono text-xs text-zinc-300">

        {value}

      </p>

    </div>

  );

}



function Explanation({

  title,

  text,

}: {

  title: string;



  text: string;

}) {

  return (

    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">

      <p className="text-sm font-semibold text-zinc-200">

        {title}

      </p>



      <p className="mt-2 text-sm leading-6 text-zinc-500">

        {text}

      </p>

    </div>

  );

}



function ComparisonRow({

  label,

  batch,

  sgd,

  mini,

}: {

  label: string;



  batch:

    | string

    | number;



  sgd:

    | string

    | number;



  mini:

    | string

    | number;

}) {

  return (

    <tr>

      <td className="px-5 py-4 font-medium text-zinc-300">

        {label}

      </td>



      <td className="px-5 py-4 font-mono text-zinc-400">

        {batch}

      </td>



      <td className="px-5 py-4 font-mono text-zinc-400">

        {sgd}

      </td>



      <td className="px-5 py-4 font-mono text-zinc-400">

        {mini}

      </td>

    </tr>

  );

}



function FlowBox({

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
