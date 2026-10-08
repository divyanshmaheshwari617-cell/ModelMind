import { useMemo } from "react";



import Plot from "react-plotly.js";



import type { Data, Layout } from "plotly.js";







import SVRVisualLearningScene from "./SVRVisualLearningScene";



import { useSVM } from "../context/SVMContext";



import { calculateKernel } from "../kernels/kernelMath";



import {



  prepareVisualizationRows,



  transformQueryForDataset,



} from "../dataset/datasetUtils";



import {



  getRange,



  getUniqueTargets,



  toPlotPoints,



} from "../utils/visualization";



import {



  boundaryY,



  buildEducationalBoundary,



  signedScore,



} from "./visualModel";







type Props = {



  step: number;



  viewMode: "2d" | "3d";



};







const CLASS_COLORS = [



  "#22d3ee",



  "#f472b6",



  "#facc15",



  "#4ade80",



  "#fb923c",



  "#a78bfa",



];







const EPS = 1e-9;







function linspace(min: number, max: number, count = 70) {



  if (count <= 1) return [min];







  return Array.from(



    { length: count },



    (_, index) =>



      min + ((max - min) * index) / (count - 1)



  );



}







function finite(value: number, fallback = 0) {



  return Number.isFinite(value) ? value : fallback;



}

function getKernelLearningMessage(
  kernel: string,
  gamma: number,
  degree: number,
  coef0: number
) {
  switch (kernel) {
    case "linear":
      return "Linear kernel: the similarity geometry remains plane-like, so no nonlinear lifting is required.";
    case "polynomial":
      return `Polynomial kernel: degree ${degree} controls curvature and coef0 ${coef0.toFixed(2)} shifts the polynomial interaction.`;
    case "rbf":
      return `RBF / Gaussian kernel: gamma ${gamma.toFixed(3)} controls locality. Higher gamma creates tighter similarity hills.`;
    case "sigmoid":
      return `Sigmoid kernel: gamma ${gamma.toFixed(3)} and coef0 ${coef0.toFixed(2)} create a saturating tanh-style surface.`;
    case "laplacian":
      return `Laplacian educational kernel: gamma ${gamma.toFixed(3)} controls a sharp distance-based similarity decay.`;
    case "chi-square":
      return "Chi-Square educational kernel: intended for non-negative or histogram-like features; the surface shows similarity in that representation.";
    case "custom":
      return "Custom educational kernel: this surface follows the custom kernel rule implemented in ModelMind.";
    default:
      return "Changing the selected kernel changes the 3D similarity geometry immediately.";
  }
}








function normalizeKernelValue(



  value: number,



  values: number[]



) {



  const finiteValues = values.filter(Number.isFinite);







  if (finiteValues.length === 0) return 0;







  const min = Math.min(...finiteValues);



  const max = Math.max(...finiteValues);



  const span = Math.max(max - min, EPS);







  return ((value - min) / span) * 2 - 1;



}







function SVCScene({ step, viewMode }: Props) {



  const { state, setQueryPoint } = useSVM();







  const rawRows =



  state.dataset?.rows ?? [];







const scalingEnabled =



  state.dataset?.scalingEnabled ??



  false;







const preparedDataset =



  useMemo(



    () =>



      prepareVisualizationRows(



        rawRows,



        scalingEnabled



      ),



    [



      rawRows,



      scalingEnabled,



    ]



  );







const rows =



  preparedDataset.rows;







  const features =



    state.dataset?.featureColumns ?? [



      "Feature 1",



      "Feature 2",



      "Feature 3",



    ];







  const points = useMemo(



    () => toPlotPoints(rows),



    [rows]



  );



  const rawPoints = useMemo(

    () => toPlotPoints(rawRows),

    [rawRows]

  );







  const targets = useMemo(



    () => getUniqueTargets(rows),



    [rows]



  );







  const xRange = useMemo(



    () => getRange(points.map((point) => point.x)),



    [points]



  );







  const yRange = useMemo(



    () => getRange(points.map((point) => point.y)),



    [points]



  );



  const rawXRange = useMemo(

    () => getRange(rawPoints.map((point) => point.x)),

    [rawPoints]

  );



  const rawYRange = useMemo(

    () => getRange(rawPoints.map((point) => point.y)),

    [rawPoints]

  );







  const boundary = useMemo(



    () => buildEducationalBoundary(rows),



    [rows]



  );







  const hasThirdFeature =



    (state.dataset?.featureColumns.length ?? 0) >= 3;







  const safeC = Math.max(0.01, state.parameters.C);







  /*



   * Educational C visualization:



   * low C  -> wider soft-margin tolerance



   * high C -> narrower violation tolerance



   *



   * This is intentionally not presented as an exact



   * browser implementation of sklearn SVC optimization.



   */



  const cScale = Math.max(



    0.35,



    Math.min(2.5, 1 / Math.sqrt(safeC))



  );







  const effectiveMargin =



    (boundary?.margin ?? 1) * cScale;







  const decisionScores = useMemo(() => {



    if (!boundary) return [];







    return rows.map((row) =>



      signedScore(



        boundary,



        row.features[0] ?? 0,



        row.features[1] ?? 0



      )



    );



  }, [rows, boundary]);







  /*



   * Kernel similarity coordinate.



   *



   * This is an educational coordinate relative to a



   * reference observation. It is NOT claimed to be



   * sklearn's complete implicit feature map.



   */



  const transformedRaw = useMemo(() => {



    if (rows.length === 0) return [];







    const reference = rows[0].features;







    return rows.map((row) =>



      finite(



        calculateKernel(



          state.parameters.kernel,



          row.features,



          reference,



          {



            gamma: state.parameters.gamma,



            degree: state.parameters.degree,



            coef0: state.parameters.coef0,



          }



        )



      )



    );



  }, [



    rows,



    state.parameters.kernel,



    state.parameters.gamma,



    state.parameters.degree,



    state.parameters.coef0,



  ]);







  const transformedZ = useMemo(



    () =>



      transformedRaw.map((value) =>



        normalizeKernelValue(value, transformedRaw)



      ),



    [transformedRaw]



  );







  /*
   * Live 3D kernel geometry.
   * X/Y are the active model-space features.
   * Z is normalized similarity to the first observation.
   */
  const kernelSurface = useMemo(() => {
    if (rows.length === 0) {
      return {
        x: [] as number[],
        y: [] as number[],
        z: [] as number[][],
      };
    }

    const reference = rows[0]?.features ?? [];

    const gridX = linspace(
      xRange.min - xRange.padding,
      xRange.max + xRange.padding,
      34
    );

    const gridY = linspace(
      yRange.min - yRange.padding,
      yRange.max + yRange.padding,
      34
    );

    const featureCount = Math.max(
      reference.length,
      features.length,
      2
    );

    const featureMeans = Array.from(
      { length: featureCount },
      (_, featureIndex) => {
        const values = rows
          .map((row) => row.features[featureIndex])
          .filter(Number.isFinite);

        if (values.length === 0) return 0;

        return (
          values.reduce(
            (sum, value) => sum + value,
            0
          ) / values.length
        );
      }
    );

    const rawGrid = gridY.map((y) =>
      gridX.map((x) => {
        const sample = Array.from(
          { length: featureCount },
          (_, featureIndex) => {
            if (featureIndex === 0) return x;
            if (featureIndex === 1) return y;

            return (
              featureMeans[featureIndex] ??
              reference[featureIndex] ??
              0
            );
          }
        );

        return finite(
          calculateKernel(
            state.parameters.kernel,
            sample,
            reference,
            {
              gamma: state.parameters.gamma,
              degree: state.parameters.degree,
              coef0: state.parameters.coef0,
            }
          )
        );
      })
    );

    const flattened = rawGrid.flat();

    return {
      x: gridX,
      y: gridY,
      z: rawGrid.map((row) =>
        row.map((value) =>
          normalizeKernelValue(
            value,
            flattened
          )
        )
      ),
    };
  }, [
    rows,
    features.length,
    xRange,
    yRange,
    state.parameters.kernel,
    state.parameters.gamma,
    state.parameters.degree,
    state.parameters.coef0,
  ]);

  const kernelLearningMessage = useMemo(
    () =>
      getKernelLearningMessage(
        state.parameters.kernel,
        state.parameters.gamma,
        state.parameters.degree,
        state.parameters.coef0
      ),
    [
      state.parameters.kernel,
      state.parameters.gamma,
      state.parameters.degree,
      state.parameters.coef0,
    ]
  );

  const showClasses = step >= 2;



  const showCandidates = step === 3;







  const showBoundary =



    step === 4 ||



    step === 5 ||



    step === 6 ||



    step === 7 ||



    step === 10 ||



    step === 11;







  const showMargins =



    step === 5 ||



    step === 6 ||



    step === 7;







  const showSupportVectors =



    step === 6 ||



    step === 7 ||



    step === 10;







  const showC = step === 7;



  const showKernel = step === 8;



  const showTransform = step === 9;



  const showFinal = step === 10;



  const showQuery = step === 11;







  const supportIndexes = useMemo(() => {



    if (!boundary) return [];







    return boundary.supportVectorIndexes;



  }, [boundary]);







  const violationIndexes = useMemo(() => {



    if (!boundary) return [];







    return decisionScores



      .map((score, index) => ({



        index,



        distance: Math.abs(score),



      }))



      .filter(



        ({ distance }) =>



          distance < effectiveMargin



      )



      .map(({ index }) => index);



  }, [



    boundary,



    decisionScores,



    effectiveMargin,



  ]);







  /*

   * Shared live-query evaluation.

   * Educational kernel classifier: not sklearn SVC optimization.

   */

  const queryEvaluation = useMemo(() => {

    const rawQuery = state.queryPoint.values;



    const modelQuery = transformQueryForDataset(

      rawQuery,

      rawRows,

      scalingEnabled

    );



    if (rows.length === 0 || targets.length === 0) {

      return {

        rawQuery,

        modelQuery,

        prediction: "Class",

        score: 0,

        confidence: 0,

        classScores: [] as Array<{

          target: string;

          score: number;

        }>,

      };

    }



    const totalRows = Math.max(rows.length, 1);

    const classCount = Math.max(targets.length, 1);

    const cStrength = safeC / (safeC + 1);



    const classScores = targets

      .map((target) => {

        const classRows = rows.filter(

          (row) => String(row.target) === target

        );



        if (classRows.length === 0) {

          return {

            target,

            score: Number.NEGATIVE_INFINITY,

          };

        }



        const similarities = classRows.map((row) =>

          finite(

            calculateKernel(

              state.parameters.kernel,

              modelQuery,

              row.features,

              {

                gamma: state.parameters.gamma,

                degree: state.parameters.degree,

                coef0: state.parameters.coef0,

              }

            )

          )

        );



        const averageSimilarity =

          similarities.reduce(

            (sum, value) => sum + value,

            0

          ) / similarities.length;



        const prior =

          classRows.length / totalRows;



        const classWeight =

          state.parameters.classWeight === "balanced"

            ? totalRows /

              (classCount * classRows.length)

            : 1;



        const blendedScore =

          (

            (1 - cStrength) * prior +

            cStrength * averageSimilarity

          ) * classWeight;



        return {

          target,

          score: finite(blendedScore),

        };

      })

      .sort((a, b) => b.score - a.score);



    const best = classScores[0];

    const second = classScores[1];



    const score =

      best && second

        ? best.score - second.score

        : best?.score ?? 0;



    const denominator =

      Math.abs(best?.score ?? 0) +

      Math.abs(second?.score ?? 0) +

      EPS;



    const confidence =

      best && second

        ? Math.min(

            1,

            Math.abs(score) / denominator

          )

        : 1;



    return {

      rawQuery,

      modelQuery,

      prediction:

        best?.target ??

        targets[0] ??

        "Class",

      score: finite(score),

      confidence: finite(confidence),

      classScores,

    };

  }, [

    state.queryPoint.values,

    state.parameters.kernel,

    state.parameters.gamma,

    state.parameters.degree,

    state.parameters.coef0,

    state.parameters.classWeight,

    rawRows,

    rows,

    scalingEnabled,

    targets,

    safeC,

  ]);



  const traces = useMemo<Data[]>(() => {



    if (rows.length === 0 || points.length === 0) {



      return [];



    }







    const result: Data[] = [];







    /*



     * =====================================================



     * STEP 1 / STEP 2



     * DATA + CLASS REVEAL



     * =====================================================



     */







    const groups = showClasses ? targets : ["Data"];







    groups.forEach((target, targetIndex) => {



      const indexes = points



        .map((point, index) => ({



          point,



          index,



        }))



        .filter(



          ({ point }) =>



            !showClasses ||



            String(point.target) === target



        );







      const xs = indexes.map(({ point }) => point.x);



      const ys = indexes.map(({ point }) => point.y);







      const zs = indexes.map(



        ({ point, index }) => {



          if (showTransform || showFinal) {



            return transformedZ[index] ?? 0;



          }







          if (hasThirdFeature) {



            return point.z;



          }







          return decisionScores[index] ?? 0;



        }



      );







      const color = showClasses



        ? CLASS_COLORS[



            targetIndex % CLASS_COLORS.length



          ]



        : "#64748b";







      if (viewMode === "3d") {



        result.push({



          type: "scatter3d",



          mode: "markers",



          name: showClasses



            ? target



            : "Raw observations",



          x: xs,



          y: ys,



          z: zs,



          marker: {



            size: 7,



            color,



            opacity: 0.92,



            line: {



              width: 1,



              color: "#e2e8f0",



            },



          },



          text: indexes.map(({ point }) =>



            String(point.target)



          ),



          hovertemplate:



            `${features[0] ?? "X"}: %{x:.3f}<br>` +



            `${features[1] ?? "Y"}: %{y:.3f}<br>` +



            `${



              showTransform || showFinal



                ? "Kernel coordinate"



                : hasThirdFeature



                  ? features[2] ?? "Z"



                  : "Decision score"



            }: %{z:.3f}<br>` +



            (showClasses



              ? "Class: %{text}"



              : "Raw observation") +



            "<extra></extra>",



        } as Data);



      } else {



        result.push({



          type: "scatter",



          mode: "markers",



          name: showClasses



            ? target



            : "Raw observations",



          x: xs,



          y: ys,



          marker: {



            size: 12,



            color,



            opacity: 0.94,



            line: {



              width: 1.5,



              color: "#e2e8f0",



            },



          },



          text: indexes.map(({ point }) =>



            String(point.target)



          ),



          hovertemplate:



            `${features[0] ?? "X"}: %{x:.3f}<br>` +



            `${features[1] ?? "Y"}: %{y:.3f}<br>` +



            (showClasses



              ? "Class: %{text}"



              : "Raw observation") +



            "<extra></extra>",



        } as Data);



      }



    });







    if (!boundary) return result;







    const xMin = xRange.min - xRange.padding;



    const xMax = xRange.max + xRange.padding;



    const yMin = yRange.min - yRange.padding;



    const yMax = yRange.max + yRange.padding;







    const xs = linspace(xMin, xMax, 90);







    /*



     * =====================================================



     * STEP 3



     * CANDIDATE HYPERPLANES



     * =====================================================



     */







    if (showCandidates) {



      const offsets = [-1.35, -0.55, 0.55, 1.35];







      if (viewMode === "2d") {



        offsets.forEach((factor, index) => {



          const offset =



            factor * boundary.margin;







          result.push({



            type: "scatter",



            mode: "lines",



            name: `Candidate ${index + 1}`,



            x: xs,



            y: xs.map((x) =>



              boundaryY(boundary, x, offset)



            ),



            line: {



              width: 2.5,



              dash:



                index % 2 === 0



                  ? "dash"



                  : "dot",



              color:



                CLASS_COLORS[



                  (index + 2) %



                    CLASS_COLORS.length



                ],



            },



            opacity: 0.8,



            hovertemplate:



              `Candidate hyperplane ${



                index + 1



              }<extra></extra>`,



          } as Data);



        });



      } else {



        offsets.forEach((factor, index) => {



          const offset =



            factor * boundary.margin;







          const z = [



            [



              signedScore(



                boundary,



                xMin,



                yMin



              ) + offset,



              signedScore(



                boundary,



                xMax,



                yMin



              ) + offset,



            ],



            [



              signedScore(



                boundary,



                xMin,



                yMax



              ) + offset,



              signedScore(



                boundary,



                xMax,



                yMax



              ) + offset,



            ],



          ];







          result.push({



            type: "surface",



            name: `Candidate ${index + 1}`,



            x: [



              [xMin, xMax],



              [xMin, xMax],



            ],



            y: [



              [yMin, yMin],



              [yMax, yMax],



            ],



            z,



            opacity: 0.24,



            showscale: false,



            colorscale: [



              [



                0,



                CLASS_COLORS[



                  (index + 2) %



                    CLASS_COLORS.length



                ],



              ],



              [



                1,



                CLASS_COLORS[



                  (index + 2) %



                    CLASS_COLORS.length



                ],



              ],



            ],



            hovertemplate:



              `Candidate hyperplane ${



                index + 1



              }<extra></extra>`,



          } as Data);



        });



      }



    }







    /*



     * =====================================================



     * STEP 4 / 5 / 6 / 7 / 11



     * SELECTED DECISION BOUNDARY



     * =====================================================



     */







    if (



      showBoundary &&



      !showFinal &&



      viewMode === "2d"



    ) {



      result.push({



        type: "scatter",



        mode: "lines",



        name: "Decision Boundary",



        x: xs,



        y: xs.map((x) =>



          boundaryY(boundary, x)



        ),



        line: {



          width: 5,



          color: "#8b5cf6",



        },



        hovertemplate:



          "Selected maximum-margin separator" +



          "<extra></extra>",



      } as Data);



    }







    if (



      showBoundary &&



      !showFinal &&



      viewMode === "3d"



    ) {



      /*



       * For a two-feature dataset the vertical axis is



       * decision score. For a real three-feature dataset



       * this remains an educational separator overlay.



       */



      const surfaceZ = [



        [



          signedScore(boundary, xMin, yMin),



          signedScore(boundary, xMax, yMin),



        ],



        [



          signedScore(boundary, xMin, yMax),



          signedScore(boundary, xMax, yMax),



        ],



      ];







      result.push({



        type: "surface",



        name: "Decision Surface",



        x: [



          [xMin, xMax],



          [xMin, xMax],



        ],



        y: [



          [yMin, yMin],



          [yMax, yMax],



        ],



        z: surfaceZ,



        showscale: false,



        opacity: 0.58,



        colorscale: [



          [0, "#8b5cf6"],



          [1, "#8b5cf6"],



        ],



        hovertemplate:



          "Educational decision surface" +



          "<extra></extra>",



      } as Data);



    }







    /*



     * =====================================================



     * STEP 5 / 6 / 7



     * MARGINS



     * =====================================================



     */







    if (showMargins) {



      const marginDistance = showC



        ? effectiveMargin



        : boundary.margin;







      const normalLength =



        Math.sqrt(



          boundary.a ** 2 +



            boundary.b ** 2



        ) || 1;







      const algebraicOffset =



        marginDistance * normalLength;







      if (viewMode === "2d") {



        [



          {



            offset: algebraicOffset,



            name: "+ Margin",



            color: "#22d3ee",



          },



          {



            offset: -algebraicOffset,



            name: "- Margin",



            color: "#f472b6",



          },



        ].forEach((margin) => {



          result.push({



            type: "scatter",



            mode: "lines",



            name: margin.name,



            x: xs,



            y: xs.map((x) =>



              boundaryY(



                boundary,



                x,



                margin.offset



              )



            ),



            line: {



              width: 3,



              dash: "dash",



              color: margin.color,



            },



            hovertemplate:



              `${margin.name}<br>` +



              `C = ${safeC.toFixed(2)}` +



              "<extra></extra>",



          } as Data);



        });



      } else {



        const makeMarginSurface = (



          value: number,



          name: string,



          color: string



        ) => {



          result.push({



            type: "surface",



            name,



            x: [



              [xMin, xMax],



              [xMin, xMax],



            ],



            y: [



              [yMin, yMin],



              [yMax, yMax],



            ],



            z: [



              [value, value],



              [value, value],



            ],



            showscale: false,



            opacity: 0.22,



            colorscale: [



              [0, color],



              [1, color],



            ],



            hovertemplate:



              `${name}<br>` +



              `C = ${safeC.toFixed(2)}` +



              "<extra></extra>",



          } as Data);



        };







        makeMarginSurface(



          marginDistance,



          "+ Margin",



          "#22d3ee"



        );







        makeMarginSurface(



          -marginDistance,



          "- Margin",



          "#f472b6"



        );



      }



    }







    /*



     * =====================================================



     * STEP 6 / 7 / 10



     * SUPPORT VECTORS



     * =====================================================



     */







    if (showSupportVectors) {



      const supportPoints = supportIndexes



        .map((index) => ({



          point: points[index],



          index,



        }))



        .filter(({ point }) => Boolean(point));







      if (viewMode === "2d") {



        result.push({



          type: "scatter",



          mode: "markers",



          name: "Support Vectors",



          x: supportPoints.map(



            ({ point }) => point!.x



          ),



          y: supportPoints.map(



            ({ point }) => point!.y



          ),



          marker: {



            size: 22,



            symbol: "circle-open",



            color: "#ffffff",



            line: {



              width: 5,



              color: "#ffffff",



            },



          },



          hovertemplate:



            "Support Vector<extra></extra>",



        } as Data);



      } else {



        result.push({



          type: "scatter3d",



          mode: "markers",



          name: "Support Vectors",



          x: supportPoints.map(



            ({ point }) => point!.x



          ),



          y: supportPoints.map(



            ({ point }) => point!.y



          ),



          z: supportPoints.map(



            ({ point, index }) =>



              showFinal



                ? transformedZ[index] ?? 0



                : hasThirdFeature



                  ? point!.z



                  : decisionScores[index] ?? 0



          ),



          marker: {



            size: 12,



            symbol: "circle",



            color: "rgba(0,0,0,0)",



            line: {



              width: 6,



              color: "#ffffff",



            },



          },



          hovertemplate:



            "Support Vector<extra></extra>",



        } as Data);



      }



    }







    /*



     * =====================================================



     * STEP 7



     * C / SOFT-MARGIN VIOLATIONS



     * =====================================================



     */







    if (showC) {



      if (viewMode === "2d") {



        result.push({



          type: "scatter",



          mode: "markers",



          name: "Soft-margin candidates",



          x: violationIndexes.map(



            (index) => points[index]?.x ?? 0



          ),



          y: violationIndexes.map(



            (index) => points[index]?.y ?? 0



          ),



          marker: {



            size: 20,



            symbol: "x",



            color: "#fb923c",



            line: {



              width: 3,



              color: "#fb923c",



            },



          },



          hovertemplate:



            `Soft-margin candidate<br>` +



            `C = ${safeC.toFixed(2)}<br>` +



            `Tolerance = ${effectiveMargin.toFixed(



              3



            )}` +



            "<extra></extra>",



        } as Data);



      } else {



        result.push({



          type: "scatter3d",



          mode: "markers",



          name: "Soft-margin candidates",



          x: violationIndexes.map(



            (index) => points[index]?.x ?? 0



          ),



          y: violationIndexes.map(



            (index) => points[index]?.y ?? 0



          ),



          z: violationIndexes.map(



            (index) =>



              hasThirdFeature



                ? points[index]?.z ?? 0



                : decisionScores[index] ?? 0



          ),



          marker: {



            size: 10,



            symbol: "diamond",



            color: "#fb923c",



          },



          hovertemplate:



            `Soft-margin candidate<br>` +



            `C = ${safeC.toFixed(2)}<br>` +



            `Tolerance = ${effectiveMargin.toFixed(



              3



            )}` +



            "<extra></extra>",



        } as Data);



      }



    }







        /*
     * =====================================================
     * STEP 8 / 9 / 10
     * LIVE SELECTED-KERNEL GEOMETRY
     * =====================================================
     */

    if (
      viewMode === "3d" &&
      (showKernel || showTransform || showFinal) &&
      kernelSurface.x.length > 0 &&
      kernelSurface.y.length > 0
    ) {
      result.push({
        type: "surface",
        name: `${state.parameters.kernel.toUpperCase()} Kernel Geometry`,
        x: kernelSurface.x,
        y: kernelSurface.y,
        z: kernelSurface.z,
        opacity:
          showTransform
            ? 0.68
            : showFinal
              ? 0.48
              : 0.38,
        showscale: false,
        colorscale: [
          [0, "#0f172a"],
          [0.35, "#1d4ed8"],
          [0.68, "#7c3aed"],
          [1, "#f472b6"],
        ],
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: "#ffffff",
            project: {
              z: true,
            },
          },
        },
        hovertemplate:
          `${state.parameters.kernel.toUpperCase()} kernel surface<br>` +
          `${features[0] ?? "X"}: %{x:.3f}<br>` +
          `${features[1] ?? "Y"}: %{y:.3f}<br>` +
          "Normalized similarity: %{z:.3f}" +
          "<extra></extra>",
      } as Data);
    }

/*



     * =====================================================



     * STEP 8



     * KERNEL RELATIONSHIPS



     * =====================================================



     */







    if (showKernel && rows.length > 1) {



      const referenceIndex = 0;



      const referencePoint =



        points[referenceIndex];



      const referenceFeatures =



        rows[referenceIndex]?.features;







      if (



        referencePoint &&



        referenceFeatures



      ) {



        const relations = rows



          .map((row, index) => {



            if (index === referenceIndex) {



              return null;



            }







            const similarity = finite(



              calculateKernel(



                state.parameters.kernel,



                referenceFeatures,



                row.features,



                {



                  gamma:



                    state.parameters.gamma,



                  degree:



                    state.parameters.degree,



                  coef0:



                    state.parameters.coef0,



                }



              )



            );







            return {



              index,



              similarity,



            };



          })



          .filter(



            (



              relation



            ): relation is {



              index: number;



              similarity: number;



            } => relation !== null



          );







        const maximumSimilarity = Math.max(



          ...relations.map((relation) =>



            Math.abs(relation.similarity)



          ),



          EPS



        );







        if (viewMode === "2d") {



          result.push({



            type: "scatter",



            mode: "markers+text",



            name: "Kernel Reference",



            x: [referencePoint.x],



            y: [referencePoint.y],



            text: ["Reference"],



            textposition: "top center",



            marker: {



              size: 24,



              symbol: "circle-open",



              color: "#ffffff",



              line: {



                width: 5,



                color: "#a78bfa",



              },



            },



            hovertemplate:



              `${state.parameters.kernel} kernel reference` +



              "<extra></extra>",



          } as Data);







          relations.forEach(



            ({ index, similarity }) => {



              const point = points[index];



              if (!point) return;







              const strength = Math.min(



                1,



                Math.abs(similarity) /



                  maximumSimilarity



              );







              result.push({



                type: "scatter",



                mode: "lines",



                name: "Kernel Similarity",



                showlegend: false,



                x: [



                  referencePoint.x,



                  point.x,



                ],



                y: [



                  referencePoint.y,



                  point.y,



                ],



                line: {



                  width: 1 + strength * 8,



                  color:



                    similarity >= 0



                      ? "#a78bfa"



                      : "#fb923c",



                },



                opacity:



                  0.18 + strength * 0.8,



                hovertemplate:



                  `${state.parameters.kernel} similarity: ` +



                  `${similarity.toFixed(4)}` +



                  "<extra></extra>",



              } as Data);



            }



          );



        } else {



          const referenceZ = hasThirdFeature



            ? referencePoint.z



            : decisionScores[



                referenceIndex



              ] ?? 0;







          result.push({



            type: "scatter3d",



            mode: "markers+text",



            name: "Kernel Reference",



            x: [referencePoint.x],



            y: [referencePoint.y],



            z: [referenceZ],



            text: ["Reference"],



            textposition: "top center",



            marker: {



              size: 13,



              color: "#ffffff",



              line: {



                width: 5,



                color: "#a78bfa",



              },



            },



            hovertemplate:



              `${state.parameters.kernel} kernel reference` +



              "<extra></extra>",



          } as Data);







          relations.forEach(



            ({ index, similarity }) => {



              const point = points[index];



              if (!point) return;







              const pointZ = hasThirdFeature



                ? point.z



                : decisionScores[index] ?? 0;







              const strength = Math.min(



                1,



                Math.abs(similarity) /



                  maximumSimilarity



              );







              result.push({



                type: "scatter3d",



                mode: "lines",



                name: "Kernel Similarity",



                showlegend: false,



                x: [



                  referencePoint.x,



                  point.x,



                ],



                y: [



                  referencePoint.y,



                  point.y,



                ],



                z: [referenceZ, pointZ],



                line: {



                  width: 1 + strength * 8,



                  color:



                    similarity >= 0



                      ? "#a78bfa"



                      : "#fb923c",



                },



                opacity:



                  0.18 + strength * 0.8,



                hovertemplate:



                  `${state.parameters.kernel} similarity: ` +



                  `${similarity.toFixed(4)}` +



                  "<extra></extra>",



              } as Data);



            }



          );



        }



      }



    }







    /*



     * =====================================================



     * STEP 9



     * KERNEL TRANSFORMATION



     * =====================================================



     */







    if (showTransform) {



      if (viewMode === "2d") {



        /*



         * 2D projection of the transformed coordinate.



         * X remains Feature 1 and Y becomes the selected



         * kernel-similarity coordinate.



         */



        targets.forEach(



          (target, targetIndex) => {



            const indexes = rows



              .map((row, index) => ({



                row,



                index,



              }))



              .filter(



                ({ row }) =>



                  String(row.target) === target



              );







            result.push({



              type: "scatter",



              mode: "markers",



              name: `${target} transformed`,



              x: indexes.map(



                ({ index }) =>



                  points[index]?.x ?? 0



              ),



              y: indexes.map(



                ({ index }) =>



                  transformedZ[index] ?? 0



              ),



              marker: {



                size: 14,



                color:



                  CLASS_COLORS[



                    targetIndex %



                      CLASS_COLORS.length



                  ],



                line: {



                  width: 2,



                  color: "#ffffff",



                },



              },



              hovertemplate:



                `${features[0] ?? "X"}: %{x:.3f}<br>` +



                `Kernel coordinate: %{y:.3f}<br>` +



                `${state.parameters.kernel}` +



                "<extra></extra>",



            } as Data);



          }



        );



      } else {



        /*



         * Original-space reference plane.



         */



        result.push({



          type: "surface",



          name: "Original Space",



          x: [



            [xMin, xMax],



            [xMin, xMax],



          ],



          y: [



            [yMin, yMin],



            [yMax, yMax],



          ],



          z: [



            [0, 0],



            [0, 0],



          ],



          opacity: 0.07,



          showscale: false,



          colorscale: [



            [0, "#64748b"],



            [1, "#64748b"],



          ],



          hoverinfo: "skip",



        } as Data);







        /*



         * Vertical guides visibly show the lifting.



         */



        points.forEach((point, index) => {



          result.push({



            type: "scatter3d",



            mode: "lines",



            name: "Kernel Lift",



            showlegend: index === 0,



            x: [point.x, point.x],



            y: [point.y, point.y],



            z: [



              0,



              transformedZ[index] ?? 0,



            ],



            line: {



              width: 2,



              color: "#64748b",



            },



            opacity: 0.5,



            hoverinfo: "skip",



          } as Data);



        });



      }



    }







    /*



     * =====================================================



     * STEP 10



     * FINAL EDUCATIONAL KERNEL-SPACE MODEL



     * =====================================================



     */







    if (showFinal) {



      const classA =



        targets[0] ?? "";



      const classB =



        targets[1] ?? "";







      const classAValues = rows



        .map((row, index) => ({



          target: String(row.target),



          value: transformedZ[index] ?? 0,



        }))



        .filter(



          (item) => item.target === classA



        )



        .map((item) => item.value);







      const classBValues = rows



        .map((row, index) => ({



          target: String(row.target),



          value: transformedZ[index] ?? 0,



        }))



        .filter(



          (item) => item.target === classB



        )



        .map((item) => item.value);







      const mean = (values: number[]) =>



        values.length === 0



          ? 0



          : values.reduce(



              (sum, value) => sum + value,



              0



            ) / values.length;







      const separatingValue =



        targets.length >= 2



          ? (mean(classAValues) +



              mean(classBValues)) /



            2



          : 0;







      if (viewMode === "2d") {



        /*



         * Show transformed observations again in 2D.



         */



        targets.forEach(



          (target, targetIndex) => {



            const indexes = rows



              .map((row, index) => ({



                row,



                index,



              }))



              .filter(



                ({ row }) =>



                  String(row.target) === target



              );







            result.push({



              type: "scatter",



              mode: "markers",



              name: `${target} kernel space`,



              x: indexes.map(



                ({ index }) =>



                  points[index]?.x ?? 0



              ),



              y: indexes.map(



                ({ index }) =>



                  transformedZ[index] ?? 0



              ),



              marker: {



                size: 14,



                color:



                  CLASS_COLORS[



                    targetIndex %



                      CLASS_COLORS.length



                  ],



                line: {



                  width: 2,



                  color: "#ffffff",



                },



              },



            } as Data);



          }



        );







        result.push({



          type: "scatter",



          mode: "lines",



          name: "Kernel-space separator",



          x: [xMin, xMax],



          y: [



            separatingValue,



            separatingValue,



          ],



          line: {



            width: 5,



            color: "#8b5cf6",



          },



          hovertemplate:



            "Educational separator in transformed representation" +



            "<extra></extra>",



        } as Data);



      } else {



        result.push({



          type: "surface",



          name: "Kernel-space separator",



          x: [



            [xMin, xMax],



            [xMin, xMax],



          ],



          y: [



            [yMin, yMin],



            [yMax, yMax],



          ],



          z: [



            [



              separatingValue,



              separatingValue,



            ],



            [



              separatingValue,



              separatingValue,



            ],



          ],



          opacity: 0.6,



          showscale: false,



          colorscale: [



            [0, "#8b5cf6"],



            [1, "#8b5cf6"],



          ],



          hovertemplate:



            "Educational separator in transformed representation" +



            "<extra></extra>",



        } as Data);



      }



    }







    /*



     * =====================================================



     * STEP 11



     * LIVE QUERY POINT + DECISION SCORE



     * =====================================================



     */







    if (showQuery) {

      const modelQueryX =

        queryEvaluation.modelQuery[0] ?? 0;



      const modelQueryY =

        queryEvaluation.modelQuery[1] ?? 0;



      const queryScore =

        queryEvaluation.score;



      const predictedClass =

        queryEvaluation.prediction;



      if (viewMode === "2d") {

        result.push({

          type: "scatter",

          mode: "markers+text",

          name: "Query Point",

          x: [modelQueryX],

          y: [modelQueryY],

          text: [`Prediction: ${predictedClass}`],

          textposition: "top center",

          marker: {

            size: 19,

            symbol: "diamond",

            color: "#facc15",

            line: {

              width: 4,

              color: "#ffffff",

            },

          },

          hovertemplate:

            `Query point<br>` +

            `Kernel score gap: ${queryScore.toFixed(4)}<br>` +

            `Confidence: ${(queryEvaluation.confidence * 100).toFixed(1)}%<br>` +

            `Predicted class: ${predictedClass}` +

            "<extra></extra>",

        } as Data);

      } else {

        const queryZ =

          showTransform || showFinal

            ? normalizeKernelValue(

                finite(

                  calculateKernel(

                    state.parameters.kernel,

                    queryEvaluation.modelQuery,

                    rows[0]?.features ?? [],

                    {

                      gamma: state.parameters.gamma,

                      degree: state.parameters.degree,

                      coef0: state.parameters.coef0,

                    }

                  )

                ),

                transformedRaw

              )

            : hasThirdFeature

              ? queryEvaluation.modelQuery[2] ?? 0

              : queryScore;



        result.push({

          type: "scatter3d",

          mode: "markers+text",

          name: "Query Point",

          x: [modelQueryX],

          y: [modelQueryY],

          z: [queryZ],

          text: [`Prediction: ${predictedClass}`],

          textposition: "top center",

          marker: {

            size: 12,

            symbol: "diamond",

            color: "#facc15",

            line: {

              width: 4,

              color: "#ffffff",

            },

          },

          hovertemplate:

            `Query point<br>` +

            `Kernel score gap: ${queryScore.toFixed(4)}<br>` +

            `Confidence: ${(queryEvaluation.confidence * 100).toFixed(1)}%<br>` +

            `Predicted class: ${predictedClass}` +

            "<extra></extra>",

        } as Data);

      }

    }



    return result;



  }, [



    rows,



    points,



    targets,



    features,



    boundary,



    decisionScores,



    transformedZ,

    kernelSurface,



    supportIndexes,



    violationIndexes,



    xRange,



    yRange,



    hasThirdFeature,



    effectiveMargin,



    safeC,



    showClasses,



    showCandidates,



    showBoundary,



    showMargins,



    showSupportVectors,



    showC,



    showKernel,



    showTransform,



    showFinal,



    showQuery,



    viewMode,



    state.parameters.kernel,



    state.parameters.gamma,



    state.parameters.degree,



    state.parameters.coef0,



    state.parameters.classWeight,



    state.queryPoint.values,



    rawRows,



    scalingEnabled,



    queryEvaluation,



    transformedRaw,



  ]);







  const stepTitle = [



    "",



    "Raw SVC Observations",



    "Class Labels Revealed",



    "Candidate Hyperplanes",



    "Maximum-Margin Separator",



    "Margin Geometry",



    "Support Vectors",



    "Soft Margin & C",



    "Kernel Relationships",



    "Kernel Transformation",



    "Final Kernel-Space Model",



    "Live SVC Prediction",



  ][step];







  const zAxisTitle =
    showKernel || showTransform || showFinal
      ? `${state.parameters.kernel} kernel similarity`
      : hasThirdFeature
        ? features[2] ?? "Feature 3"
        : "Decision Score";



  const layout = useMemo<Partial<Layout>>(



    () => ({



      autosize: true,



      height: 600,







      margin: {



        l: 58,



        r: 28,



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



          stepTitle ??



          "Support Vector Classification",



        font: {



          size: 19,



          color: "#f8fafc",



        },



      },







      xaxis: {



        title: {



          text: features[0] ?? "Feature 1",



        },



        gridcolor: "#1e293b",



        zerolinecolor: "#334155",



        range: [



          xRange.min - xRange.padding,



          xRange.max + xRange.padding,



        ],



      },







      yaxis: {



        title: {



          text:



            showTransform || showFinal



              ? `${state.parameters.kernel} kernel coordinate`



              : features[1] ?? "Feature 2",



        },



        gridcolor: "#1e293b",



        zerolinecolor: "#334155",



        range:



          showTransform || showFinal



            ? [-1.2, 1.2]



            : [



                yRange.min - yRange.padding,



                yRange.max + yRange.padding,



              ],



      },







      scene: {



        bgcolor: "#020617",







        xaxis: {



          title: {



            text: features[0] ?? "Feature 1",



          },



          gridcolor: "#1e293b",



          backgroundcolor: "#020617",



          showbackground: true,



        },







        yaxis: {



          title: {



            text: features[1] ?? "Feature 2",



          },



          gridcolor: "#1e293b",



          backgroundcolor: "#020617",



          showbackground: true,



        },







        zaxis: {



          title: {



            text: zAxisTitle,



          },



          gridcolor: "#1e293b",



          backgroundcolor: "#020617",



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



        y: -0.16,



        bgcolor: "rgba(2,6,23,0.55)",



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



          ? "preserve-svc-camera"



          : undefined,



    }),



    [



      features,



      xRange,



      yRange,



      stepTitle,



      showTransform,



      showFinal,



      zAxisTitle,



      state.parameters.kernel,



      viewMode,



    ]



  );







  if (rows.length === 0) {



    return (



      <div className="svm-empty-scene">



        <strong>



          Activate a dataset to start the SVC



          visual lesson.



        </strong>







        <p>



          Use the default dataset or upload a CSV.



        </p>



      </div>



    );



  }







  const queryX =

    state.queryPoint.values[0] ?? 0;



  const queryY =

    state.queryPoint.values[1] ?? 0;



  const queryScore =

    queryEvaluation.score;



  const queryPrediction =

    queryEvaluation.prediction;



  return (



    <div className="svm-plot-shell">



      <div className="dimension-explanation">



        <span>



          {viewMode === "2d"



            ? showTransform || showFinal



              ? "2D KERNEL PROJECTION"



              : "2D FEATURE SPACE"



            : showTransform || showFinal



              ? "3D KERNEL SPACE"



              : hasThirdFeature



                ? "3D FEATURE SPACE"



                : "3D DECISION SPACE"}



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

        {(showKernel || showTransform || showFinal) && (
          <small>
            {kernelLearningMessage}
          </small>
        )}



      </div>







      {showC && (



        <div className="kernel-step-banner">



          <span>SOFT-MARGIN CONTROL</span>







          <strong>



            C = {safeC.toFixed(2)}



          </strong>







          <small>



            Lower C increases educational



            violation tolerance; higher C makes



            the visual margin stricter.



          </small>



        </div>



      )}







      {showKernel && (



        <div className="kernel-step-banner">



          <span>KERNEL RELATIONSHIPS</span>







          <strong>



            {state.parameters.kernel.toUpperCase()}



          </strong>







          <small>



            Change kernel parameters and the



            similarity connections update live.



          </small>



        </div>



      )}







      {showTransform && (



        <div className="kernel-transform-banner">



          <span>KERNEL TRANSFORMATION</span>







          <strong>



            Original Space → Educational Kernel



            Representation



          </strong>







          <small>



            Gamma, degree and coef0 affect the



            transformation whenever they apply



            to the selected kernel.



          </small>



        </div>



      )}







      {showFinal && (



        <div className="kernel-transform-banner">



          <span>FINAL VISUAL MODEL</span>







          <strong>



            Separation in transformed



            representation



          </strong>







          <small>



            This visual teaches kernel intuition;



            it does not claim to reproduce



            sklearn's hidden feature map exactly.



          </small>



        </div>



      )}







      {showQuery && (



        <div className="kernel-step-banner">



          <span>LIVE PREDICTION</span>







          <strong>



            {queryPrediction}



          </strong>







          <small>

            Kernel score gap:{" "}

            {queryScore.toFixed(4)} · confidence{" "}

            {(queryEvaluation.confidence * 100).toFixed(1)}%

            {" · "}

            {state.parameters.classWeight === "balanced"

              ? "balanced class weighting"

              : "standard class weighting"}

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







      {showQuery && (



        <div className="query-controls">



          <strong>



            Move the query point



          </strong>







          <label>



            <span>



              {features[0] ?? "X"}:{" "}



              {queryX.toFixed(3)}



            </span>







            <input



              type="range"



              min={



                rawXRange.min - rawXRange.padding



              }



              max={



                rawXRange.max + rawXRange.padding



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







                setQueryPoint({ values });



              }}



            />



          </label>







          <label>



            <span>



              {features[1] ?? "Y"}:{" "}



              {queryY.toFixed(3)}



            </span>







            <input



              type="range"



              min={



                rawYRange.min - rawYRange.padding



              }



              max={



                rawYRange.max + rawYRange.padding



              }



              step={Math.max(



                rawYRange.span / 120,



                0.01



              )}



              value={queryY}



              onChange={(event) => {



                const values = [



                  ...state.queryPoint.values,



                ];







                values[1] = Number(



                  event.target.value



                );







                setQueryPoint({ values });



              }}



            />



          </label>







          <div className="query-result">



            <span>Prediction</span>







            <strong>



              {queryPrediction}



            </strong>







            <small>

              kernel score gap = {queryScore.toFixed(4)}

              {" · "}

              {(queryEvaluation.confidence * 100).toFixed(1)}%

            </small>



          </div>



        </div>



      )}



    </div>



  );



}







export default function SVM3DScene(



  props: Props



) {



  const { state } = useSVM();







  /*



   * Keep the already-working dedicated SVR



   * visual-learning implementation completely



   * separate from SVC.



   */



  if (state.task === "regression") {



    return (



      <SVRVisualLearningScene



        step={props.step}



        viewMode={props.viewMode}



      />



    );



  }







  return <SVCScene {...props} />;



}