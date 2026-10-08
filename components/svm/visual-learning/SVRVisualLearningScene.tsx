import { useMemo } from "react";



import Plot from "react-plotly.js";



import type { Data, Layout } from "plotly.js";







import { useSVM } from "../context/SVMContext";



import { calculateKernel } from "../kernels/kernelMath";

import {

  prepareVisualizationRows,

  transformQueryForDataset,

} from "../dataset/datasetUtils";







type Props = {



  step: number;



  viewMode: "2d" | "3d";



};







type Linear1DModel = {



  intercept: number;



  slope: number;



};







type PlaneModel = {



  intercept: number;



  xWeight: number;



  yWeight: number;



};







const EPS = 1e-9;







const COLORS = {



  purple: "#8b5cf6",



  cyan: "#22d3ee",



  pink: "#f472b6",



  yellow: "#facc15",



  orange: "#fb923c",



  green: "#22c55e",



  white: "#f8fafc",



  slate: "#64748b",



};







function finite(value: number, fallback = 0) {



  return Number.isFinite(value) ? value : fallback;



}







function mean(values: number[]) {



  if (values.length === 0) return 0;







  return (



    values.reduce((sum, value) => sum + value, 0) /



    values.length



  );



}







function rangeOf(values: number[]) {



  const safe = values.filter(Number.isFinite);







  if (safe.length === 0) {



    return {



      min: -1,



      max: 1,



      span: 2,



      padding: 0.2,



    };



  }







  const min = Math.min(...safe);



  const max = Math.max(...safe);



  const span = Math.max(max - min, 1e-6);







  return {



    min,



    max,



    span,



    padding: Math.max(span * 0.12, 0.1),



  };



}







function linspace(



  start: number,



  end: number,



  count = 70



) {



  if (count <= 1) return [start];







  return Array.from(



    { length: count },



    (_, index) =>



      start +



      (index / Math.max(count - 1, 1)) *



        (end - start)



  );



}







function fitLinear1D(



  xs: number[],



  ys: number[]



): Linear1DModel {



  if (xs.length === 0 || ys.length === 0) {



    return {



      intercept: 0,



      slope: 0,



    };



  }







  const meanX = mean(xs);



  const meanY = mean(ys);







  let numerator = 0;



  let denominator = 0;







  xs.forEach((x, index) => {



    numerator +=



      (x - meanX) *



      ((ys[index] ?? meanY) - meanY);







    denominator += (x - meanX) ** 2;



  });







  const slope =



    Math.abs(denominator) < 1e-12



      ? 0



      : numerator / denominator;







  return {



    slope,



    intercept: meanY - slope * meanX,



  };



}







function solve3x3(



  matrix: number[][],



  vector: number[]



) {



  const augmented = matrix.map(



    (row, index) => [



      ...row,



      vector[index] ?? 0,



    ]



  );







  for (



    let column = 0;



    column < 3;



    column += 1



  ) {



    let pivot = column;







    for (



      let row = column + 1;



      row < 3;



      row += 1



    ) {



      if (



        Math.abs(



          augmented[row]?.[column] ?? 0



        ) >



        Math.abs(



          augmented[pivot]?.[column] ?? 0



        )



      ) {



        pivot = row;



      }



    }







    [augmented[column], augmented[pivot]] = [



      augmented[pivot],



      augmented[column],



    ];







    const divisor =



      augmented[column]?.[column] ?? 0;







    if (Math.abs(divisor) < 1e-10) {



      return null;



    }







    for (



      let j = column;



      j < 4;



      j += 1



    ) {



      augmented[column][j] /= divisor;



    }







    for (



      let row = 0;



      row < 3;



      row += 1



    ) {



      if (row === column) continue;







      const factor =



        augmented[row]?.[column] ?? 0;







      for (



        let j = column;



        j < 4;



        j += 1



      ) {



        augmented[row][j] -=



          factor * augmented[column][j];



      }



    }



  }







  return [



    augmented[0][3],



    augmented[1][3],



    augmented[2][3],



  ];



}







function fitPlane(



  xs: number[],



  ys: number[],



  targets: number[]



): PlaneModel {



  const n = xs.length;







  if (n === 0) {



    return {



      intercept: 0,



      xWeight: 0,



      yWeight: 0,



    };



  }







  const sumX = xs.reduce(



    (sum, value) => sum + value,



    0



  );







  const sumY = ys.reduce(



    (sum, value) => sum + value,



    0



  );







  const sumT = targets.reduce(



    (sum, value) => sum + value,



    0



  );







  const sumXX = xs.reduce(



    (sum, value) => sum + value * value,



    0



  );







  const sumYY = ys.reduce(



    (sum, value) => sum + value * value,



    0



  );







  const sumXY = xs.reduce(



    (sum, value, index) =>



      sum + value * (ys[index] ?? 0),



    0



  );







  const sumXT = xs.reduce(



    (sum, value, index) =>



      sum + value * (targets[index] ?? 0),



    0



  );







  const sumYT = ys.reduce(



    (sum, value, index) =>



      sum + value * (targets[index] ?? 0),



    0



  );







  const solution = solve3x3(



    [



      [n, sumX, sumY],



      [sumX, sumXX, sumXY],



      [sumY, sumXY, sumYY],



    ],



    [sumT, sumXT, sumYT]



  );







  if (!solution) {



    return {



      intercept: sumT / n,



      xWeight: 0,



      yWeight: 0,



    };



  }







  return {



    intercept: solution[0],



    xWeight: solution[1],



    yWeight: solution[2],



  };



}







function normalizeValues(values: number[]) {



  const safe = values.filter(Number.isFinite);







  if (safe.length === 0) {



    return values.map(() => 0);



  }







  const min = Math.min(...safe);



  const max = Math.max(...safe);



  const span = Math.max(max - min, EPS);







  return values.map(



    (value) =>



      ((finite(value) - min) / span) * 2 - 1



  );



}







export default function SVRVisualLearningScene({



  step,



  viewMode,



}: Props) {



  const { state, setQueryPoint } = useSVM();







  const rawRows =

    state.dataset?.rows ?? [];



  const scalingEnabled =

    state.dataset?.scalingEnabled ?? false;



  const preparedDataset = useMemo(

    () =>

      prepareVisualizationRows(

        rawRows,

        scalingEnabled

      ),

    [rawRows, scalingEnabled]

  );



  const rows = preparedDataset.rows;







  const features =



    state.dataset?.featureColumns ?? [



      "Feature 1",



      "Feature 2",



    ];







  const targetName =



    state.dataset?.targetColumn ?? "Target";







  const validRows = useMemo(



    () =>



      rows.filter(



        (row) =>



          Number.isFinite(Number(row.target)) &&



          Number.isFinite(



            row.features[0] ?? Number.NaN



          )



      ),



    [rows]



  );







  const xs = useMemo(



    () =>



      validRows.map(



        (row) => row.features[0] ?? 0



      ),



    [validRows]



  );







  const featureYs = useMemo(



    () =>



      validRows.map(



        (row) => row.features[1] ?? 0



      ),



    [validRows]



  );







  const targets = useMemo(



    () =>



      validRows.map((row) =>



        Number(row.target)



      ),



    [validRows]



  );







  const xRange = useMemo(



    () => rangeOf(xs),



    [xs]



  );







  const featureYRange = useMemo(



    () => rangeOf(featureYs),



    [featureYs]



  );







  const targetRange = useMemo(



    () => rangeOf(targets),



    [targets]



  );



  const rawValidRows = useMemo(

    () =>

      rawRows.filter(

        (row) =>

          Number.isFinite(Number(row.target)) &&

          Number.isFinite(row.features[0] ?? Number.NaN)

      ),

    [rawRows]

  );



  const rawXs = useMemo(

    () => rawValidRows.map((row) => row.features[0] ?? 0),

    [rawValidRows]

  );



  const rawFeatureYs = useMemo(

    () => rawValidRows.map((row) => row.features[1] ?? 0),

    [rawValidRows]

  );



  const rawXRange = useMemo(

    () => rangeOf(rawXs),

    [rawXs]

  );



  const rawFeatureYRange = useMemo(

    () => rangeOf(rawFeatureYs),

    [rawFeatureYs]

  );







  const linearModel = useMemo(



    () => fitLinear1D(xs, targets),



    [xs, targets]



  );







  const planeModel = useMemo(



    () =>



      fitPlane(



        xs,



        featureYs,



        targets



      ),



    [xs, featureYs, targets]



  );







  const epsilon = Math.max(



    state.parameters.epsilon,



    0



  );







  const C = Math.max(



    state.parameters.C,



    0.01



  );







  const gamma = Math.max(



    state.parameters.gamma,



    0.0001



  );







  const degree = Math.max(



    1,



    Math.round(state.parameters.degree)



  );







  const coef0 = state.parameters.coef0;







  /*



   * -----------------------------------------------------



   * KERNEL REPRESENTATION



   * -----------------------------------------------------



   * We use a feature-only kernel similarity coordinate



   * relative to a reference observation.



   *



   * This allows kernel / gamma / degree / coef0 to visibly



   * affect the learning visualization without leaking the



   * regression target into the transformation.



   *



   * It is educational and is not claimed to be sklearn's



   * complete hidden feature map.



   */







  const kernelRaw = useMemo(() => {



    if (validRows.length === 0) {



      return [];



    }







    const reference =



      validRows[0].features;







    return validRows.map((row) =>



      finite(



        calculateKernel(



          state.parameters.kernel,



          row.features,



          reference,



          {



            gamma,



            degree,



            coef0,



          }



        )



      )



    );



  }, [



    validRows,



    state.parameters.kernel,



    gamma,



    degree,



    coef0,



  ]);







  const kernelCoordinates = useMemo(



    () => normalizeValues(kernelRaw),



    [kernelRaw]



  );







  /*



   * -----------------------------------------------------



   * EDUCATIONAL KERNEL REGRESSION VISUAL MODEL



   * -----------------------------------------------------



   *



   * This is NOT presented as a browser implementation



   * of sklearn SVR.



   *



   * It gives the learner a reactive nonlinear regression



   * surface driven by the selected kernel parameters.



   */







  const kernelPredict = (



    queryFeatures: number[]



  ) => {



    if (validRows.length === 0) {



      return 0;



    }







    const similarities =



      validRows.map((row) =>



        finite(



          calculateKernel(



            state.parameters.kernel,



            queryFeatures,



            row.features,



            {



              gamma,



              degree,



              coef0,



            }



          )



        )



      );







    const minimum =



      Math.min(...similarities);







    /*



     * Convert arbitrary kernel values to positive



     * educational influence weights.



     */



    const positiveWeights =



      similarities.map(



        (similarity) =>



          Math.max(



            similarity - minimum + 0.001,



            0.001



          )



      );







    const totalWeight =



      positiveWeights.reduce(



        (sum, weight) =>



          sum + weight,



        0



      );







    const weightedPrediction =



      positiveWeights.reduce(



        (sum, weight, index) =>



          sum +



          weight *



            (targets[index] ?? 0),



        0



      ) / Math.max(totalWeight, EPS);







    /*



     * C visibly controls how strongly the visual model



     * follows the local kernel estimate.



     *



     * Low C  -> smoother / more regularized.



     * High C -> follows local structure more strongly.



     */



    const cInfluence =



      C / (C + 1);







    const globalMean = mean(targets);







    return (



      globalMean * (1 - cInfluence) +



      weightedPrediction * cInfluence



    );



  };







  const linearPredictions =



    useMemo(



      () =>



        xs.map(



          (x) =>



            linearModel.intercept +



            linearModel.slope * x



        ),



      [xs, linearModel]



    );







  const linearResiduals =



    useMemo(



      () =>



        targets.map(



          (target, index) =>



            target -



            (linearPredictions[index] ?? 0)



        ),



      [targets, linearPredictions]



    );







  const outsideIndexes =



    useMemo(



      () =>



        linearResiduals



          .map((residual, index) => ({



            residual,



            index,



          }))



          .filter(



            ({ residual }) =>



              Math.abs(residual) > epsilon



          )



          .map(({ index }) => index),



      [linearResiduals, epsilon]



    );







  const supportIndexes =



    useMemo(() => {



      const tolerance = Math.max(



        targetRange.span * 0.035,



        epsilon * 0.25,



        0.01



      );







      return linearResiduals



        .map((residual, index) => ({



          residual,



          index,



        }))



        .filter(



          ({ residual }) =>



            Math.abs(



              Math.abs(residual) - epsilon



            ) <= tolerance ||



            Math.abs(residual) > epsilon



        )



        .map(({ index }) => index);



    }, [



      linearResiduals,



      epsilon,



      targetRange.span,



    ]);







  /*
   * Full-feature kernel grid baseline.
   * 2D varies feature 0 while every hidden feature stays at
   * its model-space mean. 3D varies features 0 and 1 while
   * feature 2+ stay at their model-space means.
   */
  const featureMeans = useMemo(() => {
    const rowFeatureCount = validRows.reduce(
      (maximum, row) => Math.max(maximum, row.features.length),
      0
    );
    const count = Math.max(features.length, rowFeatureCount, 2);
    return Array.from({ length: count }, (_, featureIndex) =>
      mean(validRows.map((row) => row.features[featureIndex] ?? 0))
    );
  }, [validRows, features.length]);

  const buildKernelQuery = (overrides: Record<number, number>) =>
    featureMeans.map((value, featureIndex) =>
      overrides[featureIndex] ?? value
    );

  const queryEvaluation = useMemo(() => {

    const rawQuery = state.queryPoint.values;



    const modelQuery = transformQueryForDataset(

      rawQuery,

      rawRows,

      scalingEnabled

    );



    const queryFeatures = Array.from(

      { length: Math.max(features.length, 2) },

      (_, featureIndex) => {

        const explicitValue = modelQuery[featureIndex];



        if (Number.isFinite(explicitValue)) {

          return explicitValue;

        }



        return mean(

          validRows.map(

            (row) => row.features[featureIndex] ?? 0

          )

        );

      }

    );



    return {

      rawQuery,

      modelQuery,

      queryFeatures,

      prediction: kernelPredict(queryFeatures),

    };

  }, [

    state.queryPoint.values,

    rawRows,

    scalingEnabled,

    features.length,

    validRows,

    state.parameters.kernel,

    gamma,

    degree,

    coef0,

    C,

    targets,

  ]);



  const traces = useMemo<Data[]>(() => {



    if (validRows.length === 0) {



      return [];



    }







    const result: Data[] = [];







    const xStart =



      xRange.min - xRange.padding;







    const xEnd =



      xRange.max + xRange.padding;







    const xLine = linspace(



      xStart,



      xEnd,



      90



    );







    /*



     * =====================================================



     * 2D SVR



     * =====================================================



     */







    if (viewMode === "2d") {



      result.push({



        type: "scatter",



        mode: "markers",



        name:



          step === 1



            ? "Raw observations"



            : "Training observations",



        x: xs,



        y: targets,



        marker: {



          size: step === 1 ? 11 : 10,



          color:



            step === 1



              ? COLORS.slate



              : targets,



          colorscale: "Viridis",



          showscale: step >= 2,



          line: {



            width: 1,



            color: "#e2e8f0",



          },



        },



        text: targets.map(



          (target) =>



            `${targetName}: ${target.toFixed(



              3



            )}`



        ),



        hovertemplate:



          `${features[0] ?? "X"}: %{x:.3f}<br>` +



          `${targetName}: %{y:.3f}` +



          "<extra></extra>",



      } as Data);







      /*



       * STEP 2



       * Continuous relationship.



       */



      if (step === 2) {



        result.push({



          type: "scatter",



          mode: "lines",



          name: "Observed trend",



          x: xLine,



          y: xLine.map(



            (x) =>



              linearModel.intercept +



              linearModel.slope * x



          ),



          line: {



            width: 3,



            dash: "dot",



            color: COLORS.cyan,



          },



          opacity: 0.75,



        } as Data);



      }







      /*



       * STEP 3



       * Candidate functions.



       */



      if (step === 3) {



        const offsets = [



          -0.55,



          -0.2,



          0.25,



          0.55,



        ];







        offsets.forEach(



          (offset, index) => {



            const candidateSlope =



              linearModel.slope +



              offset *



                Math.max(



                  Math.abs(



                    linearModel.slope



                  ),



                  (targetRange.span /



                    Math.max(



                      xRange.span,



                      1



                    )) *



                    0.4



                );







            const candidateIntercept =



              linearModel.intercept +



              (index - 1.5) *



                targetRange.span *



                0.06;







            result.push({



              type: "scatter",



              mode: "lines",



              name: `Candidate ${



                index + 1



              }`,



              x: xLine,



              y: xLine.map(



                (x) =>



                  candidateIntercept +



                  candidateSlope * x



              ),



              line: {



                width: 2.5,



                dash:



                  index % 2 === 0



                    ? "dot"



                    : "dash",



              },



              opacity: 0.72,



            } as Data);



          }



        );



      }







      const useKernelFinal =



        step === 10 ||



        step === 11;







      const showFit =



        step === 4 ||



        step === 5 ||



        step === 6 ||



        step === 7 ||



        step === 8 ||



        useKernelFinal;







      const fitValues = useKernelFinal



        ? xLine.map((x) =>
            kernelPredict(
              buildKernelQuery({ 0: x })
            )
          )



        : step === 8



          ? xLine.map((x) => {



              const cAdjustment =



                Math.min(



                  1.35,



                  0.65 +



                    Math.log10(C + 1) *



                      0.25



                );







              return (



                linearModel.intercept +



                linearModel.slope *



                  cAdjustment *



                  x



              );



            })



          : xLine.map(



              (x) =>



                linearModel.intercept +



                linearModel.slope * x



            );







      if (showFit) {



        result.push({



          type: "scatter",



          mode: "lines",



          name: useKernelFinal



            ? "Final SVR function"



            : "Selected regression function",



          x: xLine,



          y: fitValues,



          line: {



            width: 5,



            color: COLORS.purple,



          },



          hovertemplate:



            useKernelFinal



              ? `${state.parameters.kernel} visual regression model<extra></extra>`



              : "Selected regression function<extra></extra>",



        } as Data);



      }







      /*



       * STEP 5 onward



       * Epsilon tube.



       */



      const showTube =



        step === 5 ||



        step === 6 ||



        step === 7 ||



        step === 8 ||



        step === 10 ||



        step === 11;







      if (showTube) {



        const center = fitValues;







        result.push({



          type: "scatter",



          mode: "lines",



          name: "+ ε",



          x: xLine,



          y: center.map(



            (value) =>



              value + epsilon



          ),



          line: {



            width: 2.5,



            dash: "dash",



            color: COLORS.cyan,



          },



        } as Data);







        result.push({



          type: "scatter",



          mode: "lines",



          name: "- ε",



          x: xLine,



          y: center.map(



            (value) =>



              value - epsilon



          ),



          line: {



            width: 2.5,



            dash: "dash",



            color: COLORS.pink,



          },



          fill: "tonexty",



          fillcolor:



            "rgba(139,92,246,0.12)",



        } as Data);



      }







      /*



       * STEP 6



       * Inside vs outside epsilon.



       */



      if (



        step === 6 ||



        step === 8



      ) {



        const inside =



          validRows



            .map((_row, index) => index)



            .filter(



              (index) =>



                !outsideIndexes.includes(



                  index



                )



            );







        result.push({



          type: "scatter",



          mode: "markers",



          name: "Inside ε",



          x: inside.map(



            (index) => xs[index]



          ),



          y: inside.map(



            (index) => targets[index]



          ),



          marker: {



            size: 14,



            symbol: "circle-open",



            line: {



              width: 4,



              color: COLORS.green,



            },



          },



        } as Data);







        result.push({



          type: "scatter",



          mode: "markers",



          name: "Outside ε",



          x: outsideIndexes.map(



            (index) => xs[index]



          ),



          y: outsideIndexes.map(



            (index) => targets[index]



          ),



          marker: {



            size: 16,



            symbol: "x",



            color: COLORS.orange,



          },



        } as Data);



      }







      /*



       * STEP 7 / 10



       * Support vectors.



       */



      if (



        step === 7 ||



        step === 10



      ) {



        result.push({



          type: "scatter",



          mode: "markers",



          name: "SVR Support Vectors",



          x: supportIndexes.map(



            (index) => xs[index]



          ),



          y: supportIndexes.map(



            (index) => targets[index]



          ),



          marker: {



            size: 21,



            symbol: "circle-open",



            line: {



              width: 5,



              color: COLORS.white,



            },



          },



          hovertemplate:



            "SVR support-vector candidate" +



            "<extra></extra>",



        } as Data);



      }







      /*



       * STEP 8



       * C penalty.



       */



      if (step === 8) {



        result.push({



          type: "scatter",



          mode: "markers",



          name: "Penalized errors",



          x: outsideIndexes.map(



            (index) => xs[index]



          ),



          y: outsideIndexes.map(



            (index) => targets[index]



          ),



          marker: {



            size: Math.min(



              24,



              11 +



                Math.log10(C + 1) * 6



            ),



            symbol: "diamond-open",



            line: {



              width: 4,



              color: COLORS.orange,



            },



          },



          hovertemplate:



            `Outside ε<br>` +



            `C = ${C.toFixed(2)}` +



            "<extra></extra>",



        } as Data);



      }







      /*



       * STEP 9



       * REAL PARAMETER-REACTIVE EDUCATIONAL



       * KERNEL REPRESENTATION.



       */



      if (step === 9) {



        result.push({



          type: "scatter",



          mode: "markers",



          name: "Kernel representation",



          x: xs,



          y: kernelCoordinates,



          marker: {



            size: 14,



            color: targets,



            colorscale: "Viridis",



            showscale: true,



            line: {



              width: 2,



              color: COLORS.white,



            },



          },



          text: targets.map(



            (target) =>



              `Original target: ${target.toFixed(



                3



              )}`



          ),



          hovertemplate:



            `${features[0] ?? "Feature"}: %{x:.3f}<br>` +



            "Kernel coordinate: %{y:.3f}<br>" +



            "%{text}<extra></extra>",



        } as Data);







        /*



         * Vertical guides show movement from



         * original baseline to transformed coordinate.



         */



        xs.forEach((x, index) => {



          result.push({



            type: "scatter",



            mode: "lines",



            name: "Kernel lift",



            showlegend: index === 0,



            x: [x, x],



            y: [



              0,



              kernelCoordinates[index] ?? 0,



            ],



            line: {



              width: 1.5,



              color: COLORS.slate,



            },



            opacity: 0.4,



            hoverinfo: "skip",



          } as Data);



        });



      }







      /*



       * STEP 11



       * Continuous prediction.



       */



      if (step === 11) {

        const queryX =

          queryEvaluation.modelQuery[0] ??

          xRange.min;



        const prediction =

          queryEvaluation.prediction;







        result.push({



          type: "scatter",



          mode: "markers+text",



          name: "SVR Prediction",



          x: [queryX],



          y: [prediction],



          text: [



            `ŷ = ${prediction.toFixed(



              3



            )}`,



          ],



          textposition: "top center",



          marker: {



            size: 20,



            symbol: "diamond",



            color: COLORS.yellow,



            line: {



              width: 4,



              color: COLORS.white,



            },



          },



          hovertemplate:



            `Prediction: ${prediction.toFixed(



              4



            )}<br>` +



            `Kernel: ${state.parameters.kernel}` +



            "<extra></extra>",



        } as Data);



      }







      return result;



    }







    /*



     * =====================================================



     * 3D SVR



     * X1 × X2 × Target



     * =====================================================



     */







    result.push({



      type: "scatter3d",



      mode: "markers",



      name:



        step === 1



          ? "Raw observations"



          : "Training observations",



      x: xs,



      y: featureYs,



      z:



        step === 9



          ? kernelCoordinates



          : targets,



      marker: {



        size: 6,



        color:



          step === 1



            ? COLORS.slate



            : targets,



        colorscale: "Viridis",



        showscale: step >= 2,



        colorbar:



          step >= 2



            ? {



                title: {



                  text: targetName,



                },



              }



            : undefined,



        line: {



          width: 1,



          color: "#e2e8f0",



        },



      },



      hovertemplate:



        `${features[0] ?? "X1"}: %{x:.3f}<br>` +



        `${features[1] ?? "X2"}: %{y:.3f}<br>` +



        `${



          step === 9



            ? "Kernel coordinate"



            : targetName



        }: %{z:.3f}` +



        "<extra></extra>",



    } as Data);







    const yStart =



      featureYRange.min -



      featureYRange.padding;







    const yEnd =



      featureYRange.max +



      featureYRange.padding;







    const xGrid = linspace(



      xStart,



      xEnd,



      28



    );







    const yGrid = linspace(



      yStart,



      yEnd,



      28



    );







    const linearSurface =



      yGrid.map((y) =>



        xGrid.map(



          (x) =>



            planeModel.intercept +



            planeModel.xWeight * x +



            planeModel.yWeight * y



        )



      );







    const kernelSurface =
      yGrid.map((y) =>
        xGrid.map((x) =>
          kernelPredict(
            buildKernelQuery({
              0: x,
              1: y,
            })
          )
        )
      );







    /*



     * STEP 2



     * Trend surface.



     */



    if (step === 2) {



      result.push({



        type: "surface",



        name: "Observed trend surface",



        x: xGrid,



        y: yGrid,



        z: linearSurface,



        showscale: false,



        opacity: 0.32,



        colorscale: [



          [0, COLORS.cyan],



          [1, COLORS.cyan],



        ],



        hovertemplate:



          "Observed trend surface" +



          "<extra></extra>",



      } as Data);



    }







    /*



     * STEP 3



     * Candidate surfaces.



     */



    if (step === 3) {



      [-0.35, -0.12, 0.18, 0.38].forEach(



        (offset, index) => {



          const candidate =



            yGrid.map((y) =>



              xGrid.map(



                (x) =>



                  planeModel.intercept +



                  planeModel.xWeight *



                    (1 + offset) *



                    x +



                  planeModel.yWeight *



                    (1 - offset) *



                    y +



                  offset *



                    targetRange.span *



                    0.18



              )



            );







          result.push({



            type: "surface",



            name: `Candidate ${



              index + 1



            }`,



            x: xGrid,



            y: yGrid,



            z: candidate,



            showscale: false,



            opacity: 0.2,



          } as Data);



        }



      );



    }







    const useKernelFinal =



      step === 10 ||



      step === 11;







    const showSurface =



      step === 4 ||



      step === 5 ||



      step === 6 ||



      step === 7 ||



      step === 8 ||



      useKernelFinal;







    const activeSurface =



      useKernelFinal



        ? kernelSurface



        : step === 8



          ? linearSurface.map((row) =>



              row.map((value) => {



                const globalMean =



                  mean(targets);







                const influence =



                  C / (C + 1);







                return (



                  globalMean *



                    (1 - influence) +



                  value * influence



                );



              })



            )



          : linearSurface;







    if (showSurface) {



      result.push({



        type: "surface",



        name: useKernelFinal



          ? "Final SVR Surface"



          : "Selected SVR Surface",



        x: xGrid,



        y: yGrid,



        z: activeSurface,



        showscale: false,



        opacity: 0.68,



        colorscale: [



          [0, COLORS.purple],



          [1, COLORS.purple],



        ],



        hovertemplate:



          useKernelFinal



            ? `${state.parameters.kernel} visual regression surface<extra></extra>`



            : "Selected regression surface<extra></extra>",



      } as Data);



    }







    /*



     * Epsilon tube surfaces.



     */



    const showTube =



      step === 5 ||



      step === 6 ||



      step === 7 ||



      step === 8 ||



      step === 10 ||



      step === 11;







    if (showTube) {



      const upper =



        activeSurface.map((row) =>



          row.map(



            (value) =>



              value + epsilon



          )



        );







      const lower =



        activeSurface.map((row) =>



          row.map(



            (value) =>



              value - epsilon



          )



        );







      result.push({



        type: "surface",



        name: "+ ε Surface",



        x: xGrid,



        y: yGrid,



        z: upper,



        showscale: false,



        opacity: 0.18,



        colorscale: [



          [0, COLORS.cyan],



          [1, COLORS.cyan],



        ],



        hovertemplate:



          `+ ε = ${epsilon.toFixed(3)}` +



          "<extra></extra>",



      } as Data);







      result.push({



        type: "surface",



        name: "- ε Surface",



        x: xGrid,



        y: yGrid,



        z: lower,



        showscale: false,



        opacity: 0.18,



        colorscale: [



          [0, COLORS.pink],



          [1, COLORS.pink],



        ],



        hovertemplate:



          `- ε = ${epsilon.toFixed(3)}` +



          "<extra></extra>",



      } as Data);



    }







    const planePredictions =



      validRows.map(



        (row) =>



          planeModel.intercept +



          planeModel.xWeight *



            (row.features[0] ?? 0) +



          planeModel.yWeight *



            (row.features[1] ?? 0)



      );







    const planeResiduals =



      targets.map(



        (target, index) =>



          target -



          (planePredictions[index] ?? 0)



      );







    const outside3D =



      planeResiduals



        .map((residual, index) => ({



          residual,



          index,



        }))



        .filter(



          ({ residual }) =>



            Math.abs(residual) > epsilon



        )



        .map(({ index }) => index);







    /*



     * STEP 6 / 8



     * Outside epsilon points.



     */



    if (



      step === 6 ||



      step === 8



    ) {



      result.push({



        type: "scatter3d",



        mode: "markers",



        name:



          step === 8



            ? "Penalized errors"



            : "Outside ε",



        x: outside3D.map(



          (index) => xs[index]



        ),



        y: outside3D.map(



          (index) => featureYs[index]



        ),



        z: outside3D.map(



          (index) => targets[index]



        ),



        marker: {



          size:



            step === 8



              ? Math.min(



                  13,



                  7 +



                    Math.log10(C + 1) *



                      3



                )



              : 9,



          symbol: "diamond",



          color: COLORS.orange,



        },



        hovertemplate:



          step === 8



            ? `Outside ε<br>C = ${C.toFixed(



                2



              )}<extra></extra>`



            : "Outside ε<extra></extra>",



      } as Data);



    }







    /*



     * STEP 7 / 10



     * Support vectors.



     */



    if (



      step === 7 ||



      step === 10



    ) {



      const tolerance = Math.max(



        epsilon * 0.25,



        targetRange.span * 0.035,



        0.01



      );







      const support3D =



        planeResiduals



          .map((residual, index) => ({



            residual,



            index,



          }))



          .filter(



            ({ residual }) =>



              Math.abs(



                Math.abs(residual) -



                  epsilon



              ) <= tolerance ||



              Math.abs(residual) >



                epsilon



          )



          .map(({ index }) => index);







      result.push({



        type: "scatter3d",



        mode: "markers",



        name: "SVR Support Vectors",



        x: support3D.map(



          (index) => xs[index]



        ),



        y: support3D.map(



          (index) => featureYs[index]



        ),



        z: support3D.map(



          (index) => targets[index]



        ),



        marker: {



          size: 11,



          symbol: "circle",



          color: "rgba(0,0,0,0)",



          line: {



            width: 6,



            color: COLORS.white,



          },



        },



        hovertemplate:



          "SVR support-vector candidate" +



          "<extra></extra>",



      } as Data);



    }







    /*



     * STEP 9



     * Parameter-reactive kernel transformation.



     */



    if (step === 9) {



      /*



       * Baseline plane shows where the observations



       * started before being lifted.



       */



      result.push({



        type: "surface",



        name: "Original feature plane",



        x: xGrid,



        y: yGrid,



        z: yGrid.map(() =>



          xGrid.map(() => 0)



        ),



        showscale: false,



        opacity: 0.1,



        colorscale: [



          [0, COLORS.slate],



          [1, COLORS.slate],



        ],



        hoverinfo: "skip",



      } as Data);







      xs.forEach((x, index) => {



        result.push({



          type: "scatter3d",



          mode: "lines",



          name: "Kernel lift",



          showlegend: index === 0,



          x: [x, x],



          y: [



            featureYs[index] ?? 0,



            featureYs[index] ?? 0,



          ],



          z: [



            0,



            kernelCoordinates[index] ??



              0,



          ],



          line: {



            width: 2,



            color: COLORS.slate,



          },



          opacity: 0.48,



          hoverinfo: "skip",



        } as Data);



      });



    }







    /*



     * STEP 11



     * Continuous prediction.



     */



    if (step === 11) {

      const queryX =

        queryEvaluation.modelQuery[0] ??

        xRange.min;



      const queryY =

        queryEvaluation.modelQuery[1] ??

        featureYRange.min;



      const prediction =

        queryEvaluation.prediction;







      result.push({



        type: "scatter3d",



        mode: "markers+text",



        name: "SVR Prediction",



        x: [queryX],



        y: [queryY],



        z: [prediction],



        text: [



          `ŷ = ${prediction.toFixed(



            3



          )}`,



        ],



        textposition: "top center",



        marker: {



          size: 12,



          symbol: "diamond",



          color: COLORS.yellow,



          line: {



            width: 4,



            color: COLORS.white,



          },



        },



        hovertemplate:



          `Prediction: ${prediction.toFixed(



            4



          )}<br>` +



          `Kernel: ${state.parameters.kernel}` +



          "<extra></extra>",



      } as Data);



    }







    return result;



  }, [



    validRows,



    viewMode,



    step,



    xs,



    featureYs,



    targets,



    xRange,



    featureYRange,



    targetRange,



    linearModel,



    planeModel,



    linearPredictions,



    outsideIndexes,



    supportIndexes,



    epsilon,



    C,



    gamma,



    degree,



    coef0,



    kernelCoordinates,



    features,



    targetName,



    state.parameters.kernel,



    state.queryPoint.values,



    rawRows,

    scalingEnabled,

    queryEvaluation,
    featureMeans,

  ]);







  const titles = [



    "",



    "Raw Regression Observations",



    "Continuous Target Relationship",



    "Candidate Regression Functions",



    "Selected Regression Function",



    "Epsilon-Insensitive Tube",



    "Inside vs Outside Epsilon",



    "SVR Support Vectors",



    "C and Error Penalty",



    "Kernel Transformation",



    "Final SVR Model",



    "Continuous Prediction",



  ];







  const layout =



    useMemo<Partial<Layout>>(



      () => ({



        autosize: true,



        height: 600,







        margin: {



          l: 62,



          r: 30,



          t: 62,



          b: 72,



        },







        paper_bgcolor: "#020617",



        plot_bgcolor: "#020617",







        font: {



          color: "#cbd5e1",



          family:



            "Inter, ui-sans-serif, system-ui, sans-serif",



        },







        title: {



          text:



            titles[step] ??



            "SVR Visual Learning",



          font: {



            size: 19,



            color: "#f8fafc",



          },



        },







        xaxis: {



          title: {



            text:



              features[0] ??



              "Feature 1",



          },



          gridcolor: "#1e293b",



          zerolinecolor: "#334155",



        },







        yaxis: {



          title: {



            text:



              step === 9



                ? `${state.parameters.kernel} kernel coordinate`



                : targetName,



          },



          gridcolor: "#1e293b",



          zerolinecolor: "#334155",



          range:



            step === 9



              ? [-1.2, 1.2]



              : undefined,



        },







        scene: {



          bgcolor: "#020617",







          xaxis: {



            title: {



              text:



                features[0] ??



                "Feature 1",



            },



            gridcolor: "#1e293b",



            backgroundcolor:



              "#020617",



            showbackground: true,



          },







          yaxis: {



            title: {



              text:



                features[1] ??



                "Feature 2",



            },



            gridcolor: "#1e293b",



            backgroundcolor:



              "#020617",



            showbackground: true,



          },







          zaxis: {



            title: {



              text:



                step === 9



                  ? `${state.parameters.kernel} Kernel Coordinate`



                  : targetName,



            },



            gridcolor: "#1e293b",



            backgroundcolor:



              "#020617",



            showbackground: true,



          },







          camera: {



            eye: {



              x: 1.55,



              y: 1.55,



              z: 1.2,



            },



          },







          aspectmode: "auto",



        },







        legend: {



          orientation: "h",



          x: 0,



          y: -0.18,



          bgcolor:



            "rgba(2,6,23,0.55)",



          bordercolor: "#1e293b",



          borderwidth: 1,



        },







        hovermode: "closest",







        transition: {



          duration: 350,



          easing: "cubic-in-out",



        },







        uirevision:



          viewMode === "3d"



            ? "preserve-svr-camera"



            : undefined,



      }),



      [



        step,



        features,



        targetName,



        state.parameters.kernel,



        viewMode,



      ]



    );







  if (validRows.length === 0) {



    return (



      <div className="svm-empty-scene">



        <strong>



          Regression data is required.



        </strong>







        <p>



          Use the default SVR showcase



          dataset or upload a CSV with a



          numeric target.



        </p>



      </div>



    );



  }







  const queryX =

    state.queryPoint.values[0] ??

    rawXRange.min;



  const queryY =

    state.queryPoint.values[1] ??

    rawFeatureYRange.min;



  const prediction =

    queryEvaluation.prediction;



  return (



    <div className="svm-plot-shell">



      <div className="dimension-explanation">



        <span>



          {viewMode === "2d"



            ? step === 9



              ? "2D KERNEL REPRESENTATION"



              : "2D SVR SPACE"



            : step === 9



              ? "3D KERNEL REPRESENTATION"



              : "3D SVR SPACE"}



        </span>







        <strong>



          Step {step} / 11 ·{" "}



          {state.parameters.kernel.toUpperCase()}



        </strong>



        <small>

          {scalingEnabled

            ? "Standardized model space"

            : "Raw feature space"}

        </small>



      </div>







      {step === 5 && (



        <div className="kernel-step-banner">



          <span>EPSILON TUBE</span>







          <strong>



            ε = {epsilon.toFixed(3)}



          </strong>







          <small>



            Change ε and the tube widens



            or narrows immediately.



          </small>



        </div>



      )}







      {step === 6 && (



        <div className="kernel-step-banner">



          <span>



            EPSILON CLASSIFICATION



          </span>







          <strong>



            Inside vs Outside ε



          </strong>







          <small>



            Orange observations exceed



            the epsilon-insensitive tube.



          </small>



        </div>



      )}







      {step === 7 && (



        <div className="kernel-step-banner">



          <span>SUPPORT VECTORS</span>







          <strong>



            Influential observations



          </strong>







          <small>



            Points on or outside the



            epsilon tube are highlighted



            as educational SVR support



            vector candidates.



          </small>



        </div>



      )}







      {step === 8 && (



        <div className="kernel-step-banner">



          <span>ERROR PENALTY</span>







          <strong>



            C = {C.toFixed(2)}



          </strong>







          <small>



            Increase C and the visual



            model follows local structure



            more strongly; decrease C for



            a smoother regularized view.



          </small>



        </div>



      )}







      {step === 9 && (



        <div className="kernel-transform-banner">



          <span>



            KERNEL TRANSFORMATION



          </span>







          <strong>



            {state.parameters.kernel.toUpperCase()}



          </strong>







          <small>



            γ = {gamma.toFixed(3)} ·



            degree = {degree} · coef0 ={" "}



            {coef0.toFixed(2)}



          </small>







          <small>



            Change applicable parameters



            and the feature-only kernel



            representation updates live.



            This teaches kernel intuition



            and does not claim to display



            sklearn's full implicit



            feature map.



          </small>



        </div>



      )}







      {step === 10 && (



        <div className="kernel-transform-banner">



          <span>FINAL SVR MODEL</span>







          <strong>



            {state.parameters.kernel.toUpperCase()}{" "}



            regression surface



          </strong>







          <small>



            C, ε and applicable kernel



            parameters now affect the



            final educational regression



            visualization.



          </small>



        </div>



      )}







      {step === 11 && (



        <div className="kernel-step-banner">



          <span>LIVE PREDICTION</span>







          <strong>



            ŷ = {prediction.toFixed(3)}



          </strong>







          <small>



            Move the query point below to



            update the continuous



            prediction.



          </small>



        </div>



      )}







      <Plot



        data={traces}



        layout={layout}



        config={{



          responsive: true,



          displaylogo: false,



          scrollZoom: true,



          doubleClick: "reset+autosize",



          modeBarButtonsToRemove: [



            "lasso2d",



            "select2d",



          ],



        }}



        useResizeHandler



        style={{



          width: "100%",



          height: "100%",



        }}



      />







      {step === 11 && (



        <div className="query-controls">



          <strong>



            Move the SVR query point



          </strong>







          <label>



            <span>



              {features[0] ?? "X"}:{" "}



              {queryX.toFixed(3)}



            </span>







            <input



              type="range"



              min={



                xRange.min -



                xRange.padding



              }



              max={



                xRange.max +



                xRange.padding



              }



              step={Math.max(



                rawXRange.span / 120,



                0.01



              )}



              value={queryX}



              onChange={(event) => {



                const values = [



                  ...state.queryPoint.values,



                ];







                values[0] = Number(



                  event.target.value



                );







                setQueryPoint({



                  values,



                });



              }}



            />



          </label>







          {viewMode === "3d" && (



            <label>



              <span>



                {features[1] ?? "Y"}:{" "}



                {queryY.toFixed(3)}



              </span>







              <input



                type="range"



                min={



                  featureYRange.min -



                  featureYRange.padding



                }



                max={



                  featureYRange.max +



                  featureYRange.padding



                }



                step={Math.max(



                  featureYRange.span /



                    120,



                  0.01



                )}



                value={queryY}



                onChange={(event) => {



                  const values = [



                    ...state.queryPoint



                      .values,



                  ];







                  values[1] = Number(



                    event.target.value



                  );







                  setQueryPoint({



                    values,



                  });



                }}



              />



            </label>



          )}







          <div className="query-result">



            <span>



              Continuous Prediction



            </span>







            <strong>



              ŷ = {prediction.toFixed(3)}



            </strong>







            <small>



              Kernel:{" "}



              {state.parameters.kernel}



            </small>



          </div>



        </div>



      )}



    </div>



  );



}