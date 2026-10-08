"use client";



export type RegressionPoint = {

  x: number;

  y: number;

};



type RegressionAnimationProps = {

  data: RegressionPoint[];



  weight: number;



  bias: number;



  showResiduals?: boolean;



  activeIndexes?: number[];

};



export default function RegressionAnimation({

  data,

  weight,

  bias,

  showResiduals = true,

  activeIndexes = [],

}: RegressionAnimationProps) {

  const width = 760;

  const height = 430;



  const paddingLeft = 60;

  const paddingRight = 30;

  const paddingTop = 30;

  const paddingBottom = 55;



  
  /*
  ========================================================
  FIND GRAPH RANGE
  Keep the axes based on the dataset, not predictions.
  ========================================================
  */

  let minDataX = Infinity;
  let maxDataX = -Infinity;
  let minDataY = Infinity;
  let maxDataY = -Infinity;

  for (const point of data) {
    if (
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y)
    ) {
      continue;
    }

    minDataX = Math.min(minDataX, point.x);
    maxDataX = Math.max(maxDataX, point.x);

    minDataY = Math.min(minDataY, point.y);
    maxDataY = Math.max(maxDataY, point.y);
  }

  if (!Number.isFinite(minDataX)) {
    minDataX = 0;
    maxDataX = 10;
  }

  if (!Number.isFinite(minDataY)) {
    minDataY = 0;
    maxDataY = 10;
  }

  const xMargin = Math.max(
    1,
    (maxDataX - minDataX) * 0.08
  );

  const yMargin = Math.max(
    1,
    (maxDataY - minDataY) * 0.1
  );

  const minX = minDataX - xMargin;
  const maxX = maxDataX + xMargin;

  const minY = minDataY - yMargin;
  const maxY = maxDataY + yMargin;

  /*

  ========================================================

  GRAPH COORDINATE CONVERSION

  ========================================================

  */



  function toGraphX(

    value: number

  ) {

    const usableWidth =

      width -

      paddingLeft -

      paddingRight;



    return (

      paddingLeft +

      ((value - minX) /

        (maxX - minX)) *

        usableWidth

    );

  }



  function toGraphY(

    value: number

  ) {

    const usableHeight =

      height -

      paddingTop -

      paddingBottom;



    return (

      height -

      paddingBottom -

      ((value - minY) /

        (maxY - minY)) *

        usableHeight

    );

  }



  /*

  ========================================================

  REGRESSION LINE

  ========================================================

  */

const lineStartX = minX;

  const lineEndX = maxX;



  const lineStartY =

    weight * lineStartX +

    bias;



  const lineEndY =

    weight * lineEndX +

    bias;

  const regressionLineValid =

  Number.isFinite(weight) &&

  Number.isFinite(bias) &&

  Number.isFinite(lineStartX) &&

  Number.isFinite(lineEndX) &&

  Number.isFinite(lineStartY) &&

  Number.isFinite(lineEndY) &&

  Number.isFinite(toGraphX(lineStartX)) &&

  Number.isFinite(toGraphX(lineEndX)) &&

  Number.isFinite(toGraphY(lineStartY)) &&

  Number.isFinite(toGraphY(lineEndY));



  /*

  ========================================================

  GRID

  ========================================================

  */



  const gridLines = 5;



  const xGrid =

    Array.from(

      {

        length:

          gridLines + 1,

      },

      (_, index) => {

        return (

          minX +

          ((maxX - minX) /

            gridLines) *

            index

        );

      }

    );



  const yGrid =

    Array.from(

      {

        length:

          gridLines + 1,

      },

      (_, index) => {

        return (

          minY +

          ((maxY - minY) /

            gridLines) *

            index

        );

      }

    );



  /*

  ========================================================

  ACTIVE SAMPLE HELPER



  Later:

  Batch GD       -> all points active

  SGD            -> one point active

  Mini-Batch GD  -> subset active

  ========================================================

  */



const allSamplesActive = activeIndexes.includes(-1);



const activeIndexSet = new Set(

  allSamplesActive ? [] : activeIndexes

);



function isActive(index: number) {

  return allSamplesActive || activeIndexSet.has(index);

}

  return (

    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">

      {/* HEADER */}



      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">

            Live Model

          </p>



          <h3 className="mt-2 text-lg font-semibold text-zinc-100">

            Regression Line

          </h3>



          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">

            Watch the model line

            move as Gradient

            Descent changes the

            weight and bias.

          </p>

        </div>



        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2">

          <p className="text-xs text-zinc-500">

            Current Model

          </p>



          <p className="mt-1 font-mono text-sm font-semibold text-zinc-100">

            y ={" "}

            {weight.toPrecision(5)}x{" "}

            {bias >= 0 ? "+" : "-"}{" "}

            {Math.abs(bias).toPrecision(5)}

          </p>

        </div>

      </div>



      {/* GRAPH */}



      <div className="overflow-x-auto p-4">

        <svg

          viewBox={`0 0 ${width} ${height}`}

          className="min-w-[620px] w-full"

          role="img"

          aria-label="Linear regression visualization"

        >

          {/* GRID X */}



          {xGrid.map(

            (

              value,

              index

            ) => {

              const x =

                toGraphX(value);

              if (!Number.isFinite(x)) return null;



              return (

                <g

                  key={`x-${index}`}

                >

                  <line

                    x1={x}

                    y1={

                      paddingTop

                    }

                    x2={x}

                    y2={

                      height -

                      paddingBottom

                    }

                    stroke="currentColor"

                    strokeWidth="1"

                    className="text-zinc-900"

                  />



                  <text

                    x={x}

                    y={

                      height -

                      25

                    }

                    textAnchor="middle"

                    fill="currentColor"

                    className="text-[11px] text-zinc-600"

                  >

                    {value.toFixed(

                      1

                    )}

                  </text>

                </g>

              );

            }

          )}



          {/* GRID Y */}



          {yGrid.map(

            (

              value,

              index

            ) => {

              const y =

                toGraphY(value);

              if (!Number.isFinite(y)) return null;



              return (

                <g

                  key={`y-${index}`}

                >

                  <line

                    x1={

                      paddingLeft

                    }

                    y1={y}

                    x2={

                      width -

                      paddingRight

                    }

                    y2={y}

                    stroke="currentColor"

                    strokeWidth="1"

                    className="text-zinc-900"

                  />



                  <text

                    x={

                      paddingLeft -

                      10

                    }

                    y={y + 4}

                    textAnchor="end"

                    fill="currentColor"

                    className="text-[11px] text-zinc-600"

                  >

                    {value.toFixed(

                      1

                    )}

                  </text>

                </g>

              );

            }

          )}



          {/* AXES */}



          <line

            x1={paddingLeft}

            y1={

              height -

              paddingBottom

            }

            x2={

              width -

              paddingRight

            }

            y2={

              height -

              paddingBottom

            }

            stroke="currentColor"

            strokeWidth="2"

            className="text-zinc-700"

          />



          <line

            x1={paddingLeft}

            y1={paddingTop}

            x2={paddingLeft}

            y2={

              height -

              paddingBottom

            }

            stroke="currentColor"

            strokeWidth="2"

            className="text-zinc-700"

          />



          {/* AXIS LABELS */}



          <text

            x={

              width / 2

            }

            y={

              height - 5

            }

            textAnchor="middle"

            fill="currentColor"

            className="text-xs text-zinc-500"

          >

            Feature X

          </text>



          <text

            x="15"

            y={

              height / 2

            }

            textAnchor="middle"

            fill="currentColor"

            className="text-xs text-zinc-500"

            transform={`rotate(-90 15 ${

              height / 2

            })`}

          >

            Target Y

          </text>



          {/* RESIDUALS */}



          {showResiduals &&

            data.map(

              (

                point,

                index

              ) => {

                const prediction =

                  weight *

                    point.x +

                  bias;

                if (!(Number.isFinite(toGraphX(point.x)) && Number.isFinite(toGraphY(point.y)) && Number.isFinite(toGraphY(prediction)))) return null;



                return (

                  <line

                    key={`residual-${index}`}

                    x1={toGraphX(

                      point.x

                    )}

                    y1={toGraphY(

                      point.y

                    )}

                    x2={toGraphX(

                      point.x

                    )}

                    y2={toGraphY(

                      prediction

                    )}

                    stroke="currentColor"

                    strokeWidth={

                      isActive(

                        index

                      )

                        ? 3

                        : 1.5

                    }

                    strokeDasharray="5 4"

                    className={

                      isActive(

                        index

                      )

                        ? "text-amber-400"

                        : "text-zinc-700"

                    }

                  />

                );

              }

            )}



          {/* REGRESSION LINE */}



          {regressionLineValid && (
          <line

            x1={toGraphX(

              lineStartX

            )}

            y1={toGraphY(

              lineStartY

            )}

            x2={toGraphX(

              lineEndX

            )}

            y2={toGraphY(

              lineEndY

            )}

            stroke="currentColor"

            strokeWidth="4"

            strokeLinecap="round"

            className="text-blue-400 transition-all duration-200"

          />
          )}



          {/* PREDICTION POINTS */}



          {data.map(

            (

              point,

              index

            ) => {

              const prediction =

                weight *

                  point.x +

                bias;

                if (!(Number.isFinite(toGraphX(point.x)) && Number.isFinite(toGraphY(prediction)))) return null;



              return (

                <circle

                  key={`prediction-${index}`}

                  cx={toGraphX(

                    point.x

                  )}

                  cy={toGraphY(

                    prediction

                  )}

                  r="3"

                  fill="currentColor"

                  className="text-blue-300 transition-all duration-200"

                />

              );

            }

          )}



          {/* ACTUAL DATA */}



          {data.map(

            (

              point,

              index

            ) => {

              const active =

                isActive(index);

                if (!Number.isFinite(toGraphX(point.x)) || !Number.isFinite(toGraphY(point.y))) return null;



              return (

                <g

                  key={`point-${index}`}

                >

                  {active && (

                    <circle

                      cx={toGraphX(

                        point.x

                      )}

                      cy={toGraphY(

                        point.y

                      )}

                      r="11"

                      fill="none"

                      stroke="currentColor"

                      strokeWidth="2"

                      className="text-amber-400"

                    />

                  )}



                  <circle

                    cx={toGraphX(

                      point.x

                    )}

                    cy={toGraphY(

                      point.y

                    )}

                    r={

                      active

                        ? 6

                        : 5

                    }

                    fill="currentColor"

                    className={

                      active

                        ? "text-amber-300"

                        : "text-zinc-100"

                    }

                  />

                </g>

              );

            }

          )}

        </svg>

      </div>



      {/* LEGEND */}



      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-800 px-5 py-4 text-xs text-zinc-500">

        <LegendItem

          symbol="●"

          label="Actual data"

        />



        <LegendItem

          symbol="━"

          label="Regression line"

        />



        <LegendItem

          symbol="•"

          label="Prediction"

        />



        {showResiduals && (

          <LegendItem

            symbol="┊"

            label="Prediction error"

          />

        )}



        {activeIndexes.length >

          0 && (

          <LegendItem

            symbol="◉"

            label="Samples used in current update"

          />

        )}

      </div>

    </div>

  );

}



function LegendItem({

  symbol,

  label,

}: {

  symbol: string;

  label: string;

}) {

  return (

    <div className="flex items-center gap-2">

      <span className="font-mono text-zinc-300">

        {symbol}

      </span>



      <span>{label}</span>

    </div>

  );

}