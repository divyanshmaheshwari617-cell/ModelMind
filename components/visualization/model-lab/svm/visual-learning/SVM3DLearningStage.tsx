import Plot from "react-plotly.js";

import type {
  SVMKernel,
  SVMTask,
} from "../types/svm";

import {
  defaultSVCVisualRows,
  defaultSVRVisualRows,
} from "./defaultDatasets";

type Props = {
  task: SVMTask;
  step: number;
  C: number;
  epsilon: number;
  kernel: SVMKernel;
  gamma: number;
  degree: number;
  queryX: number;
  queryY: number;
};

export default function SVM3DLearningStage({
  task,
  step,
  C,
  epsilon,
  kernel,
  gamma,
  degree,
  queryX,
  queryY,
}: Props) {
  if (task === "classification") {
    return (
      <SVCStage
        step={step}
        C={C}
        kernel={kernel}
        gamma={gamma}
        degree={degree}
        queryX={queryX}
        queryY={queryY}
      />
    );
  }

  return (
    <SVRStage
      step={step}
      C={C}
      epsilon={epsilon}
      kernel={kernel}
      gamma={gamma}
      degree={degree}
      queryX={queryX}
    />
  );
}

function SVCStage({
  step,
  C,
  kernel,
  gamma,
  degree,
  queryX,
  queryY,
}: Omit<Props, "task" | "epsilon">) {
  /*
    BEGINNER STORY

    Each point represents one student.

    Feature 1 -> Study Hours
    Feature 2 -> Attendance level

    Class A -> Needs Improvement
    Class B -> Strong Performance
  */

  const classA =
    defaultSVCVisualRows.filter(
      (row) =>
        row.target === "Class A"
    );

  const classB =
    defaultSVCVisualRows.filter(
      (row) =>
        row.target === "Class B"
    );

  const transformedZ = (
    x: number,
    y: number
  ) => {
    if (step < 8) {
      return 0;
    }

    if (kernel === "rbf") {
      const dx = x - 3.1;
      const dy = y - 3.0;

      return (
        Math.exp(
          -gamma *
            (dx * dx + dy * dy)
        ) * 3
      );
    }

    if (
      kernel === "polynomial"
    ) {
      const normalized =
        (x + y - 6) / 4;

      return (
        Math.pow(
          normalized,
          Math.min(
            degree,
            4
          )
        ) * 1.5
      );
    }

    return 0;
  };

  const showBoundary =
    step >= 2;

  const showMargins =
    step >= 5;

  const showSupportVectors =
    step >= 6;

  const showQuery =
    step >= 9;

  const boundaryOffset =
    step === 2 ? 0.75 : 0;

  const softShift =
    step >= 7
      ? Math.max(
          -0.35,
          Math.min(
            0.35,
            (1 - C) * 0.12
          )
        )
      : 0;

  const planeCenter =
    6 +
    boundaryOffset +
    softShift;

  const marginDistance =
    step >= 7
      ? Math.max(
          0.55,
          Math.min(
            1.45,
            1.15 /
              Math.sqrt(
                Math.max(
                  C,
                  0.15
                )
              )
          )
        )
      : 1;

  const planeX = [
    0.5,
    2.5,
    4.5,
    6.5,
  ];

  const planeY = [
    0.5,
    2.5,
    4.5,
    6.5,
  ];

  const makePlaneZ = (
    offset: number
  ) =>
    planeY.map((y) =>
      planeX.map((x) => {
        const signed =
          x +
          y -
          (planeCenter +
            offset);

        return (
          -signed * 0.8 +
          0.5
        );
      })
    );

  const classATrace = {
    type: "scatter3d" as const,
    mode:
      step === 1
        ? ("markers+text" as const)
        : ("markers" as const),

    x: classA.map(
      (row) =>
        row.features[0]
    ),

    y: classA.map(
      (row) =>
        row.features[1]
    ),

    z: classA.map(
      (row) =>
        transformedZ(
          row.features[0],
          row.features[1]
        )
    ),

    text:
      step === 1
        ? classA.map(
            (_, index) =>
              `Student ${index + 1}`
          )
        : undefined,

    textposition:
      "top center" as const,

    name:
      "Needs Improvement",

    marker: {
      size: 9,
      color: "#38bdf8",

      line: {
        color: "#e0f2fe",
        width: 1,
      },
    },

    customdata:
      classA.map(
        (_, index) => [
          `Student ${
            index + 1
          }`,
          "Needs Improvement",
        ]
      ),

    hovertemplate:
      "<b>%{customdata[0]}</b>" +
      "<br>Study Hours: %{x:.1f}" +
      "<br>Attendance Level: %{y:.1f}" +
      "<br>Result: %{customdata[1]}" +
      "<extra></extra>",
  };

  const classBTrace = {
    type: "scatter3d" as const,
    mode:
      step === 1
        ? ("markers+text" as const)
        : ("markers" as const),

    x: classB.map(
      (row) =>
        row.features[0]
    ),

    y: classB.map(
      (row) =>
        row.features[1]
    ),

    z: classB.map(
      (row) =>
        transformedZ(
          row.features[0],
          row.features[1]
        )
    ),

    text:
      step === 1
        ? classB.map(
            (_, index) =>
              `Student ${
                index +
                classA.length +
                1
              }`
          )
        : undefined,

    textposition:
      "top center" as const,

    name:
      "Strong Performance",

    marker: {
      size: 9,
      color: "#f472b6",

      line: {
        color: "#fce7f3",
        width: 1,
      },
    },

    customdata:
      classB.map(
        (_, index) => [
          `Student ${
            index +
            classA.length +
            1
          }`,
          "Strong Performance",
        ]
      ),

    hovertemplate:
      "<b>%{customdata[0]}</b>" +
      "<br>Study Hours: %{x:.1f}" +
      "<br>Attendance Level: %{y:.1f}" +
      "<br>Result: %{customdata[1]}" +
      "<extra></extra>",
  };

  const supportRows =
    defaultSVCVisualRows.filter(
      (row) => {
        const score =
          row.features[0] +
          row.features[1];

        return (
          Math.abs(
            score - 6
          ) < 1.3
        );
      }
    );

  const supportTrace = {
    type: "scatter3d" as const,
    mode:
      "markers+text" as const,

    x: supportRows.map(
      (row) =>
        row.features[0]
    ),

    y: supportRows.map(
      (row) =>
        row.features[1]
    ),

    z: supportRows.map(
      (row) =>
        transformedZ(
          row.features[0],
          row.features[1]
        )
    ),

    text:
      supportRows.map(
        () =>
          "Support Vector"
      ),

    textposition:
      "top center" as const,

    name:
      "Support Vector",

    marker: {
      size: 16,
      color:
        "rgba(0,0,0,0)",

      line: {
        color: "#facc15",
        width: 6,
      },
    },

    hovertemplate:
      "<b>Support Vector</b>" +
      "<br>Study Hours: %{x:.1f}" +
      "<br>Attendance Level: %{y:.1f}" +
      "<br><br>This student is close to the margin." +
      "<br>It helps determine the SVM boundary." +
      "<extra></extra>",
  };

  const decisionTrace = {
    type: "surface" as const,

    x: planeX,
    y: planeY,
    z: makePlaneZ(0),

    name:
      step === 2
        ? "Candidate Separator"
        : "Decision Boundary",

    showscale: false,

    opacity:
      step === 2
        ? 0.42
        : 0.62,

    colorscale: [
      [0, "#8b5cf6"],
      [1, "#8b5cf6"],
    ],

    hovertemplate:
      step === 2
        ? "<b>Possible Separator</b><br>SVM is still looking for the best boundary.<extra></extra>"
        : "<b>SVM Decision Boundary</b><br>This separates the two predicted classes.<extra></extra>",
  };

  const marginOneTrace = {
    type: "surface" as const,

    x: planeX,
    y: planeY,
    z: makePlaneZ(
      marginDistance
    ),

    name:
      "Positive Margin",

    showscale: false,

    opacity: 0.2,

    colorscale: [
      [0, "#22c55e"],
      [1, "#22c55e"],
    ],

    hovertemplate:
      "<b>Margin Boundary</b><br>SVM tries to keep this gap as wide as possible.<extra></extra>",
  };

  const marginTwoTrace = {
    type: "surface" as const,

    x: planeX,
    y: planeY,
    z: makePlaneZ(
      -marginDistance
    ),

    name:
      "Negative Margin",

    showscale: false,

    opacity: 0.2,

    colorscale: [
      [0, "#f59e0b"],
      [1, "#f59e0b"],
    ],

    hovertemplate:
      "<b>Margin Boundary</b><br>Together the two margin surfaces show the SVM safety gap.<extra></extra>",
  };

  const queryPrediction =
    queryX + queryY >=
    planeCenter
      ? "Strong Performance"
      : "Needs Improvement";

  const queryTrace = {
    type: "scatter3d" as const,

    mode:
      "markers+text" as const,

    x: [queryX],
    y: [queryY],

    z: [
      transformedZ(
        queryX,
        queryY
      ),
    ],

    text: [
      "New Student",
    ],

    textposition:
      "top center" as const,

    name: "New Student",

    marker: {
      size: 13,
      color: "#22c55e",
      symbol: "diamond",

      line: {
        color: "#ffffff",
        width: 2,
      },
    },

    hovertemplate:
      "<b>New Student</b>" +
      `<br>Study Hours: ${queryX.toFixed(
        1
      )}` +
      `<br>Attendance Level: ${queryY.toFixed(
        1
      )}` +
      `<br><b>Prediction: ${queryPrediction}</b>` +
      "<extra></extra>",
  };

  const data: any[] = [
    classATrace,
    classBTrace,
  ];

  if (showBoundary) {
    data.push(
      decisionTrace
    );
  }

  if (showMargins) {
    data.push(
      marginOneTrace,
      marginTwoTrace
    );
  }

  if (
    showSupportVectors
  ) {
    data.push(
      supportTrace
    );
  }

  if (showQuery) {
    data.push(queryTrace);
  }

  const explanation =
    getSVCExplanation(
      step,
      kernel,
      C,
      queryPrediction
    );

  return (
    <StageShell
      title={
        step >= 8
          ? `${kernel.toUpperCase()} Kernel — Student Classification`
          : "SVC — Student Performance Classification"
      }
      subtitle={
        explanation.subtitle
      }
      explanation={
        explanation.explanation
      }
      legendItems={[
        {
          symbol: "🔵",
          title:
            "Blue point",
          text:
            "One student in the Needs Improvement class.",
        },
        {
          symbol: "🩷",
          title:
            "Pink point",
          text:
            "One student in the Strong Performance class.",
        },
        ...(step >= 2
          ? [
              {
                symbol:
                  "🟪",
                title:
                  "Purple surface",
                text:
                  step ===
                  2
                    ? "A possible separator between the two student groups."
                    : "The SVM decision boundary.",
              },
            ]
          : []),
        ...(step >= 5
          ? [
              {
                symbol:
                  "↔️",
                title:
                  "Margin",
                text:
                  "The safety gap that SVM tries to maximize.",
              },
            ]
          : []),
        ...(step >= 6
          ? [
              {
                symbol:
                  "🟡",
                title:
                  "Yellow ring",
                text:
                  "A support vector — an influential student near the margin.",
              },
            ]
          : []),
        ...(step >= 9
          ? [
              {
                symbol:
                  "🟢",
                title:
                  "Green diamond",
                text:
                  "A new student whose class SVM is predicting.",
              },
            ]
          : []),
      ]}
    >
      <Plot
        data={data}
        layout={{
          autosize: true,

          margin: {
            l: 0,
            r: 0,
            t: 10,
            b: 0,
          },

          paper_bgcolor:
            "#020617",

          plot_bgcolor:
            "#020617",

          font: {
            color:
              "#cbd5e1",
          },

          legend: {
            orientation:
              "h",
            x: 0,
            y: 1.06,
          },

          scene: {
            bgcolor:
              "#020617",

            xaxis: {
              title:
                "Study Hours",
              gridcolor:
                "#1e293b",
              zerolinecolor:
                "#334155",
              range: [
                0.3,
                5.8,
              ],
            },

            yaxis: {
              title:
                "Attendance Level",
              gridcolor:
                "#1e293b",
              zerolinecolor:
                "#334155",
              range: [
                0.3,
                5.8,
              ],
            },

            zaxis: {
              title:
                step >= 8
                  ? "Kernel Transformation"
                  : "SVM Learning Space",
              gridcolor:
                "#1e293b",
              zerolinecolor:
                "#334155",
            },

            camera: {
              eye: {
                x: 1.55,
                y: 1.55,
                z: 1.15,
              },
            },
          },

          uirevision:
            `svc-${step}-${kernel}`,
        }}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
        }}
        style={{
          width: "100%",
          height: "610px",
        }}
      />
    </StageShell>
  );
}

function SVRStage({
  step,
  C,
  epsilon,
  kernel,
  gamma,
  degree,
  queryX,
}: Omit<
  Props,
  "task" | "queryY"
>) {
  /*
    REGRESSION STORY

    Each point = one student.

    X = Study Hours
    Y = Exam Score

    SVR learns the relationship
    while allowing errors inside
    the epsilon tube.
  */

  const points =
    defaultSVRVisualRows;

  const prediction = (
    x: number
  ) => {
    const linear =
      1.02 * x + 0.65;

    if (
      step >= 8 &&
      kernel === "rbf"
    ) {
      return (
        linear +
        Math.sin(
          x * gamma
        ) *
          0.75
      );
    }

    if (
      step >= 8 &&
      kernel ===
        "polynomial"
    ) {
      const centered =
        (x - 5.5) / 5;

      return (
        linear +
        Math.pow(
          centered,
          Math.min(
            degree,
            4
          )
        ) *
          1.2
      );
    }

    return linear;
  };

  const showFunction =
    step >= 2;

  const showTube =
    step >= 3;

  const showInside =
    step >= 4;

  const showOutside =
    step >= 5;

  const showSupport =
    step >= 6;

  const showQuery =
    step >= 9;

  const tubeWidth =
    step >= 7
      ? Math.max(
          0.1,
          epsilon
        )
      : 0.65;

  const xLine =
    Array.from(
      { length: 80 },
      (_, index) =>
        0.8 +
        (index / 79) *
          9.4
    );

  const predictedLine =
    xLine.map(
      prediction
    );

  const actualX =
    points.map(
      (row) =>
        row.features[0]
    );

  const actualY =
    points.map(
      (row) =>
        Number(row.target)
    );

  const insidePoints =
    points.filter(
      (row) => {
        const x =
          row.features[0];

        const y =
          Number(
            row.target
          );

        return (
          Math.abs(
            y -
              prediction(x)
          ) <= tubeWidth
        );
      }
    );

  const outsidePoints =
    points.filter(
      (row) => {
        const x =
          row.features[0];

        const y =
          Number(
            row.target
          );

        return (
          Math.abs(
            y -
              prediction(x)
          ) > tubeWidth
        );
      }
    );

  const supportPoints =
    points.filter(
      (row) => {
        const x =
          row.features[0];

        const y =
          Number(
            row.target
          );

        return (
          Math.abs(
            Math.abs(
              y -
                prediction(x)
            ) -
              tubeWidth
          ) <
            0.45 ||
          Math.abs(
            y -
              prediction(x)
          ) > tubeWidth
        );
      }
    );

  const pointTrace = {
    type:
      "scatter3d" as const,

    mode:
      step === 1
        ? ("markers+text" as const)
        : ("markers" as const),

    x: actualX,
    y: actualY,

    z: actualX.map(
      () => 0
    ),

    text:
      step === 1
        ? points.map(
            (_, index) =>
              `Student ${
                index + 1
              }`
          )
        : undefined,

    textposition:
      "top center" as const,

    name:
      "Actual Students",

    marker: {
      size: 8,
      color: "#38bdf8",

      line: {
        color: "#e0f2fe",
        width: 1,
      },
    },

    customdata:
      points.map(
        (_, index) => [
          `Student ${
            index + 1
          }`,
        ]
      ),

    hovertemplate:
      "<b>%{customdata[0]}</b>" +
      "<br>Study Hours: %{x:.1f}" +
      "<br>Actual Exam Score: %{y:.1f}" +
      "<extra></extra>",
  };

  const predictionTrace = {
    type:
      "scatter3d" as const,

    mode: "lines" as const,

    x: xLine,
    y: predictedLine,

    z: xLine.map(
      () => 0
    ),

    name:
      "Predicted Score",

    line: {
      color: "#ffffff",
      width: 7,
    },

    hovertemplate:
      "<b>SVR Prediction Function</b>" +
      "<br>Study Hours: %{x:.1f}" +
      "<br>Predicted Score: %{y:.1f}" +
      "<extra></extra>",
  };

  const upperTrace = {
    type:
      "scatter3d" as const,

    mode: "lines" as const,

    x: xLine,

    y: predictedLine.map(
      (value) =>
        value +
        tubeWidth
    ),

    z: xLine.map(
      () => 0
    ),

    name: "+ ε",

    line: {
      color: "#22c55e",
      width: 5,
      dash: "dash",
    },

    hovertemplate:
      "<b>Upper ε Boundary</b><br>Errors inside this tube are tolerated.<extra></extra>",
  };

  const lowerTrace = {
    type:
      "scatter3d" as const,

    mode: "lines" as const,

    x: xLine,

    y: predictedLine.map(
      (value) =>
        value -
        tubeWidth
    ),

    z: xLine.map(
      () => 0
    ),

    name: "- ε",

    line: {
      color: "#22c55e",
      width: 5,
      dash: "dash",
    },

    hovertemplate:
      "<b>Lower ε Boundary</b><br>Errors inside this tube are tolerated.<extra></extra>",
  };

  const insideTrace = {
    type:
      "scatter3d" as const,

    mode:
      "markers" as const,

    x: insidePoints.map(
      (row) =>
        row.features[0]
    ),

    y: insidePoints.map(
      (row) =>
        Number(row.target)
    ),

    z: insidePoints.map(
      () => 0.12
    ),

    name:
      "Inside ε-Tube",

    marker: {
      size: 10,
      color: "#22c55e",
    },

    hovertemplate:
      "<b>Inside ε-Tube</b>" +
      "<br>This student's prediction error is within the tolerated range." +
      "<extra></extra>",
  };

  const outsideTrace = {
    type:
      "scatter3d" as const,

    mode:
      "markers" as const,

    x: outsidePoints.map(
      (row) =>
        row.features[0]
    ),

    y: outsidePoints.map(
      (row) =>
        Number(row.target)
    ),

    z: outsidePoints.map(
      () => 0.12
    ),

    name:
      "Outside ε-Tube",

    marker: {
      size: 10,
      color: "#ef4444",
    },

    hovertemplate:
      "<b>Outside ε-Tube</b>" +
      "<br>This student's error exceeds ε and contributes to the SVR loss." +
      "<extra></extra>",
  };

  const supportTrace = {
    type:
      "scatter3d" as const,

    mode:
      "markers+text" as const,

    x: supportPoints.map(
      (row) =>
        row.features[0]
    ),

    y: supportPoints.map(
      (row) =>
        Number(row.target)
    ),

    z: supportPoints.map(
      () => 0.18
    ),

    text:
      supportPoints.map(
        () =>
          "Support Vector"
      ),

    textposition:
      "top center" as const,

    name:
      "Support Vectors",

    marker: {
      size: 16,
      color:
        "rgba(0,0,0,0)",

      line: {
        color: "#facc15",
        width: 6,
      },
    },

    hovertemplate:
      "<b>SVR Support Vector</b>" +
      "<br>This student helps determine the regression function or ε-tube." +
      "<extra></extra>",
  };

  const queryPrediction =
    prediction(queryX);

  const queryTrace = {
    type:
      "scatter3d" as const,

    mode:
      "markers+text" as const,

    x: [queryX],
    y: [
      queryPrediction,
    ],
    z: [0.35],

    text: [
      "New Student",
    ],

    textposition:
      "top center" as const,

    name:
      "New Student",

    marker: {
      size: 12,
      color: "#a78bfa",
      symbol: "diamond",

      line: {
        color: "#ffffff",
        width: 2,
      },
    },

    hovertemplate:
      "<b>New Student Prediction</b>" +
      `<br>Study Hours: ${queryX.toFixed(
        1
      )}` +
      `<br>Predicted Exam Score: ${queryPrediction.toFixed(
        2
      )}` +
      "<extra></extra>",
  };

  const data: any[] = [
    pointTrace,
  ];

  if (showFunction) {
    data.push(
      predictionTrace
    );
  }

  if (showTube) {
    data.push(
      upperTrace,
      lowerTrace
    );
  }

  if (showInside) {
    data.push(
      insideTrace
    );
  }

  if (showOutside) {
    data.push(
      outsideTrace
    );
  }

  if (showSupport) {
    data.push(
      supportTrace
    );
  }

  if (showQuery) {
    data.push(
      queryTrace
    );
  }

  const explanation =
    getSVRExplanation(
      step,
      kernel,
      tubeWidth,
      C,
      queryPrediction
    );

  return (
    <StageShell
      title="SVR — Predicting Student Exam Score"
      subtitle={
        explanation.subtitle
      }
      explanation={
        explanation.explanation
      }
      legendItems={[
        {
          symbol: "🔵",
          title:
            "Blue point",
          text:
            "One student with actual study hours and exam score.",
        },
        ...(step >= 2
          ? [
              {
                symbol:
                  "⚪",
                title:
                  "White line",
                text:
                  "The score predicted by SVR.",
              },
            ]
          : []),
        ...(step >= 3
          ? [
              {
                symbol:
                  "🟢",
                title:
                  "Green dashed lines",
                text:
                  "The ε-tube — prediction errors inside this range are tolerated.",
              },
            ]
          : []),
        ...(step >= 5
          ? [
              {
                symbol:
                  "🔴",
                title:
                  "Red point",
                text:
                  "A student outside the ε-tube whose error contributes to loss.",
              },
            ]
          : []),
        ...(step >= 6
          ? [
              {
                symbol:
                  "🟡",
                title:
                  "Yellow ring",
                text:
                  "A support vector influencing the SVR solution.",
              },
            ]
          : []),
        ...(step >= 9
          ? [
              {
                symbol:
                  "🟣",
                title:
                  "Purple diamond",
                text:
                  "A new student whose exam score is being predicted.",
              },
            ]
          : []),
      ]}
    >
      <Plot
        data={data}
        layout={{
          autosize: true,

          margin: {
            l: 0,
            r: 0,
            t: 10,
            b: 0,
          },

          paper_bgcolor:
            "#020617",

          plot_bgcolor:
            "#020617",

          font: {
            color:
              "#cbd5e1",
          },

          legend: {
            orientation:
              "h",
            x: 0,
            y: 1.06,
          },

          scene: {
            bgcolor:
              "#020617",

            xaxis: {
              title:
                "Study Hours",
              gridcolor:
                "#1e293b",
            },

            yaxis: {
              title:
                "Exam Score",
              gridcolor:
                "#1e293b",
            },

            zaxis: {
              title:
                "SVR Learning Space",
              gridcolor:
                "#1e293b",

              range: [
                -1.5,
                1.5,
              ],
            },

            camera: {
              eye: {
                x: 1.45,
                y: 1.45,
                z: 1.1,
              },
            },
          },

          uirevision:
            `svr-${step}-${kernel}`,
        }}
        config={{
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
        }}
        style={{
          width: "100%",
          height: "610px",
        }}
      />
    </StageShell>
  );
}

function getSVCExplanation(
  step: number,
  kernel: SVMKernel,
  C: number,
  prediction: string
) {
  switch (step) {
    case 1:
      return {
        subtitle:
          "Each dot is one student.",
        explanation:
          "Study Hours and Attendance Level are the two inputs. Blue students need improvement, while pink students show strong performance. SVM will learn how to separate these two groups.",
      };

    case 2:
      return {
        subtitle:
          "Can we place a separator between the two student groups?",
        explanation:
          "The purple surface is a possible separator. At this stage, think only about separating the blue students from the pink students.",
      };

    case 3:
      return {
        subtitle:
          "This separator is called the hyperplane.",
        explanation:
          "For a linear SVM, the decision boundary is represented by wᵀx + b = 0. Students on different sides receive different class predictions.",
      };

    case 4:
      return {
        subtitle:
          "SVM does not want just any separator.",
        explanation:
          "It searches for a boundary that leaves the largest useful gap between the two classes. This is the maximum-margin idea.",
      };

    case 5:
      return {
        subtitle:
          "The gap around the decision boundary is the margin.",
        explanation:
          "A wider margin generally means the boundary is farther from the closest observations. SVM tries to maximize this separation.",
      };

    case 6:
      return {
        subtitle:
          "Now look at the yellow-ringed students.",
        explanation:
          "These are support vectors. They are the important observations near the margin that strongly influence where the SVM boundary is placed.",
      };

    case 7:
      return {
        subtitle:
          `Soft-margin SVM — C = ${C.toFixed(
            2
          )}`,
        explanation:
          "Real datasets are rarely perfectly separable. C controls how strongly SVM penalizes margin violations. Try moving the C slider and watch the geometry change.",
      };

    case 8:
      return {
        subtitle:
          `${kernel.toUpperCase()} kernel transformation`,
        explanation:
          "When a straight boundary is not enough, a kernel lets SVM represent a more useful separation in a transformed feature space. Rotate the 3D graph and switch kernels.",
      };

    default:
      return {
        subtitle:
          `New student prediction: ${prediction}`,
        explanation:
          "The green diamond is a new student. Change Study Hours and Attendance Level and watch which side of the learned decision boundary the student falls on.",
      };
  }
}

function getSVRExplanation(
  step: number,
  kernel: SVMKernel,
  epsilon: number,
  C: number,
  prediction: number
) {
  switch (step) {
    case 1:
      return {
        subtitle:
          "Each dot represents one student.",
        explanation:
          "Study Hours is the input and Exam Score is the continuous target. SVR will learn a function that predicts exam score.",
      };

    case 2:
      return {
        subtitle:
          "The white line is the SVR prediction function.",
        explanation:
          "For any number of study hours, the line gives the score predicted by the regression model.",
      };

    case 3:
      return {
        subtitle:
          `The green boundaries create an ε-tube. ε = ${epsilon.toFixed(
            2
          )}`,
        explanation:
          "SVR allows a tolerance region around its prediction function. Small prediction errors inside this tube are treated differently from errors outside it.",
      };

    case 4:
      return {
        subtitle:
          "Green points are inside the ε-tube.",
        explanation:
          "These students have prediction errors within the tolerated ε range.",
      };

    case 5:
      return {
        subtitle:
          "Red points fall outside the ε-tube.",
        explanation:
          "Their prediction error is larger than ε, so the excess error contributes to the SVR loss.",
      };

    case 6:
      return {
        subtitle:
          "Yellow rings identify SVR support vectors.",
        explanation:
          "These influential observations help determine the position of the prediction function and ε-tube.",
      };

    case 7:
      return {
        subtitle:
          `ε = ${epsilon.toFixed(
            2
          )} • C = ${C.toFixed(
            2
          )}`,
        explanation:
          "Change ε to alter the tolerance tube. Change C to control how strongly errors outside the tube are penalized.",
      };

    case 8:
      return {
        subtitle:
          `${kernel.toUpperCase()} kernel`,
        explanation:
          "A nonlinear kernel allows SVR to model curved relationships when a simple straight prediction function is not sufficient.",
      };

    default:
      return {
        subtitle:
          `Predicted exam score: ${prediction.toFixed(
            2
          )}`,
        explanation:
          "The purple diamond represents a new student. Move the Study Hours slider and SVR will update the predicted exam score.",
      };
  }
}

type LegendItem = {
  symbol: string;
  title: string;
  text: string;
};

function StageShell({
  title,
  subtitle,
  explanation,
  legendItems,
  children,
}: {
  title: string;
  subtitle: string;
  explanation: string;
  legendItems: LegendItem[];
  children:
    React.ReactNode;
}) {
  return (
    <section style={stageStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            INTERACTIVE 3D
            LEARNING
          </div>

          <h2
            style={{
              margin:
                "5px 0 5px",
            }}
          >
            {title}
          </h2>

          <div style={subtitleStyle}>
            {subtitle}
          </div>
        </div>

        <div style={hintStyle}>
          Drag to rotate •
          Scroll to zoom •
          Hover over points
        </div>
      </div>

      <div style={explanationStyle}>
        <div style={explanationIconStyle}>
          💡
        </div>

        <div>
          <strong>
            What is happening?
          </strong>

          <div
            style={{
              marginTop: 5,
              color:
                "#cbd5e1",
              lineHeight: 1.6,
            }}
          >
            {explanation}
          </div>
        </div>
      </div>

      <div style={plotShellStyle}>
        {children}
      </div>

      <div style={legendStyle}>
        <div style={legendHeadingStyle}>
          HOW TO READ THIS
          VISUALIZATION
        </div>

        <div style={legendGridStyle}>
          {legendItems.map(
            (
              item,
              index
            ) => (
              <div
                key={`${item.title}-${index}`}
                style={
                  legendItemStyle
                }
              >
                <div style={legendSymbolStyle}>
                  {item.symbol}
                </div>

                <div>
                  <strong>
                    {item.title}
                  </strong>

                  <div style={legendTextStyle}>
                    {item.text}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

const stageStyle = {
  border:
    "1px solid #334155",
  borderRadius: 20,
  padding: 18,
  background: "#0f172a",
};

const headerStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: 12,
  marginBottom: 12,
};

const eyebrowStyle = {
  color: "#a78bfa",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.4,
};

const subtitleStyle = {
  color: "#94a3b8",
  lineHeight: 1.5,
};

const hintStyle = {
  color: "#64748b",
  fontSize: 12,
  padding:
    "7px 10px",
  borderRadius: 999,
  background: "#020617",
};

const explanationStyle = {
  display: "flex",
  gap: 12,
  padding: 14,
  marginBottom: 12,
  borderRadius: 12,
  border:
    "1px solid #312e81",
  background: "#111827",
};

const explanationIconStyle = {
  fontSize: 22,
};

const plotShellStyle = {
  overflow: "hidden",
  borderRadius: 15,
  background: "#020617",
};

const legendStyle = {
  marginTop: 14,
  padding: 15,
  borderRadius: 13,
  background: "#020617",
  border:
    "1px solid #1e293b",
};

const legendHeadingStyle = {
  color: "#a78bfa",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 1.3,
  marginBottom: 11,
};

const legendGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 9,
};

const legendItemStyle = {
  display: "flex",
  gap: 10,
  alignItems:
    "flex-start",
  padding: 10,
  borderRadius: 10,
  background: "#0f172a",
};

const legendSymbolStyle = {
  fontSize: 20,
  minWidth: 27,
};

const legendTextStyle = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.45,
};