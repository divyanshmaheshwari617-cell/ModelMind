import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import {
  TrainingSnapshot,
} from "../types/logisticRegression";

interface Props {
  history:
    TrainingSnapshot[];
}

export default function TrainingAnimation({
  history,
}: Props) {
  const [index, setIndex] =
    useState(0);

  const [playing, setPlaying] =
    useState(false);

  const [speed, setSpeed] =
    useState(120);

  useEffect(() => {
    if (
      !playing ||
      history.length === 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setIndex(
            (current) => {
              if (
                current >=
                history.length -
                  1
              ) {
                setPlaying(
                  false
                );

                return current;
              }

              return (
                current + 1
              );
            }
          );
        },
        speed
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    playing,
    speed,
    history.length,
  ]);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [history]);

  const current =
    history[
      Math.min(
        index,
        Math.max(
          history.length - 1,
          0
        )
      )
    ];

  const graph =
    useMemo(
      () => ({
        iterations:
          history.map(
            (step) =>
              step.iteration
          ),

        loss:
          history.map(
            (step) =>
              step.loss
          ),

        accuracy:
          history.map(
            (step) =>
              step.accuracy
          ),
      }),
      [history]
    );

  if (!current) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            GRADIENT DESCENT
          </span>

          <h2>
            Watch Logistic
            Regression learn
          </h2>
        </div>

        <span className="value-pill">
          Iteration{" "}
          {current.iteration}
        </span>
      </div>

      <p className="muted">
        These are the actual
        gradient-descent snapshots
        stored while your Logistic
        Regression model was
        training.
      </p>

      <div className="toolbar-row">
        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setPlaying(
              (value) =>
                !value
            )
          }
        >
          {playing
            ? "Pause"
            : "▶ Play"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);
            setIndex(
              Math.max(
                0,
                index - 1
              )
            );
          }}
        >
          Previous
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);
            setIndex(
              Math.min(
                history.length -
                  1,
                index + 1
              )
            );
          }}
        >
          Next
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setPlaying(false);
            setIndex(0);
          }}
        >
          Reset
        </button>
      </div>

      <div className="control-grid">
        <label className="control-card">
          <span>
            Training step
          </span>

          <strong>
            {index + 1} /{" "}
            {history.length}
          </strong>

          <input
            type="range"
            min={0}
            max={
              history.length - 1
            }
            step={1}
            value={index}
            onChange={(event) => {
              setPlaying(false);
              setIndex(
                Number(
                  event.target
                    .value
                )
              );
            }}
          />
        </label>

        <label className="control-card">
          <span>
            Animation speed
          </span>

          <select
            value={speed}
            onChange={(event) =>
              setSpeed(
                Number(
                  event.target
                    .value
                )
              )
            }
          >
            <option value={300}>
              Slow
            </option>

            <option value={120}>
              Normal
            </option>

            <option value={40}>
              Fast
            </option>
          </select>
        </label>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>Loss</span>
          <strong>
            {current.loss.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Training accuracy
          </span>
          <strong>
            {(
              current.accuracy *
              100
            ).toFixed(1)}
            %
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Intercept
          </span>
          <strong>
            {current.intercept.toFixed(
              4
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Iteration
          </span>
          <strong>
            {current.iteration}
          </strong>
        </div>
      </div>

      <Plot
        data={[
          {
            type: "scatter",
            mode: "lines",
            x:
              graph.iterations.slice(
                0,
                index + 1
              ),
            y:
              graph.loss.slice(
                0,
                index + 1
              ),
            name: "Log Loss",
            line: {
              width: 4,
            },
          },
        ]}
        layout={{
          autosize: true,
          height: 380,

          xaxis: {
            title: {
              text:
                "Training iteration",
            },
          },

          yaxis: {
            title: {
              text:
                "Objective / loss",
            },
          },

          margin: {
            l: 65,
            r: 25,
            t: 25,
            b: 55,
          },

          paper_bgcolor:
            "transparent",
          plot_bgcolor:
            "transparent",
        }}
        useResizeHandler
        style={{
          width: "100%",
        }}
        config={{
          responsive: true,
          displaylogo: false,
        }}
      />

      <div className="sub-panel">
        <h3>
          Live coefficients
        </h3>

        <div className="coefficient-list">
          {Object.entries(
            current.coefficients
          ).map(
            ([
              feature,
              coefficient,
            ]) => (
              <div
                className="coefficient-row"
                key={feature}
              >
                <span>
                  {feature}
                </span>

                <strong>
                  {coefficient.toFixed(
                    5
                  )}
                </strong>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}