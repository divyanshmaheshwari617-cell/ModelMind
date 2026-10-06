import {
  useMemo,
  useState,
} from "react";

import Plot from "react-plotly.js";

import {
  sigmoid,
  oddsFromProbability,
} from "../utils/logisticMath";

function createRange(
  start: number,
  end: number,
  count: number
) {
  const step =
    (end - start) /
    Math.max(
      count - 1,
      1
    );

  return Array.from(
    { length: count },
    (_, index) =>
      start +
      index * step
  );
}

export default function SigmoidVisualizer() {
  const [score, setScore] =
    useState(0);

  const graph =
    useMemo(() => {
      const x =
        createRange(
          -10,
          10,
          250
        );

      return {
        x,
        y:
          x.map(sigmoid),
      };
    }, []);

  const probability =
    sigmoid(score);

  const odds =
    oddsFromProbability(
      probability
    );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            STEP 1 — SIGMOID
          </span>

          <h2>
            From any score to a
            probability
          </h2>
        </div>

        <span className="value-pill">
          p ={" "}
          {probability.toFixed(
            4
          )}
        </span>
      </div>

      <p className="muted">
        Linear Regression can output
        any number. Logistic
        Regression sends its linear
        score through the sigmoid
        function so the result always
        stays between 0 and 1.
      </p>

      <div className="formula-box">
        <strong>
          z = β₀ + β₁x₁ +
          β₂x₂ + ...
        </strong>

        <span>↓</span>

        <strong>
          p = 1 / (1 + e⁻ᶻ)
        </strong>
      </div>

      <label className="control-card">
        <span>
          Linear score z
        </span>

        <strong>
          {score.toFixed(2)}
        </strong>

        <input
          type="range"
          min={-10}
          max={10}
          step={0.1}
          value={score}
          onChange={(event) =>
            setScore(
              Number(
                event.target
                  .value
              )
            )
          }
        />
      </label>

      <Plot
        data={[
          {
            type: "scatter",
            mode: "lines",
            x: graph.x,
            y: graph.y,
            name:
              "Sigmoid probability",
            line: {
              width: 4,
            },
          },

          {
            type: "scatter",
            mode:
              "markers+text",
            x: [score],
            y: [probability],
            text: [
              `p=${probability.toFixed(
                3
              )}`,
            ],
            textposition:
              "top center",
            name:
              "Current score",
            marker: {
              size: 13,
            },
          },

          {
            type: "scatter",
            mode: "lines",
            x: [-10, 10],
            y: [0.5, 0.5],
            name:
              "Default threshold 0.5",
            line: {
              dash: "dash",
              width: 2,
            },
          },
        ]}
        layout={{
          autosize: true,
          height: 440,

          xaxis: {
            title: {
              text:
                "Linear score z",
            },
            range: [-10, 10],
          },

          yaxis: {
            title: {
              text:
                "Probability P(y=1)",
            },
            range: [-0.05, 1.05],
          },

          margin: {
            l: 65,
            r: 30,
            t: 35,
            b: 60,
          },

          paper_bgcolor:
            "transparent",

          plot_bgcolor:
            "transparent",

          legend: {
            orientation: "h",
          },
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

      <div className="metric-grid">
        <div className="metric-card">
          <span>
            Linear score
          </span>

          <strong>
            {score.toFixed(2)}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Probability
          </span>

          <strong>
            {(
              probability * 100
            ).toFixed(1)}
            %
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Odds
          </span>

          <strong>
            {odds.toFixed(3)}
          </strong>
        </div>

        <div className="metric-card">
          <span>
            Class @ 0.5
          </span>

          <strong>
            {probability >= 0.5
              ? "1"
              : "0"}
          </strong>
        </div>
      </div>

      <div className="info-box">
        When z = 0, sigmoid gives
        exactly 0.5. Positive scores
        move probability toward 1;
        negative scores move it
        toward 0.
      </div>
    </section>
  );
}