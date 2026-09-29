import Plot from "react-plotly.js";

const x = [
  0, 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10,
];

const actual = [
  3.0,
  4.4,
  5.0,
  6.8,
  7.2,
  8.9,
  9.2,
  10.7,
  11.0,
  12.5,
  13.1,
];

const underfit = x.map(
  (value) =>
    5.2 + 0.48 * value
);

const goodFit = x.map(
  (value) =>
    3.2 + 1.0 * value
);

const overfit = [
  3.0,
  4.5,
  4.8,
  7.1,
  6.9,
  9.2,
  8.9,
  11.1,
  10.6,
  12.9,
  13.1,
];

export default function FitComplexityVisualizer() {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            MODEL COMPLEXITY
          </span>

          <h2>
            Underfitting → Good Fit →
            Overfitting
          </h2>
        </div>
      </div>

      <p className="muted">
        Regularization controls model
        complexity. Too little
        flexibility can underfit,
        while excessive complexity
        can memorize training data.
        The goal is strong
        generalization to unseen data.
      </p>

      <Plot
        data={[
          {
            type: "scatter",
            mode: "markers",
            x,
            y: actual,
            name: "Observed data",
            marker: {
              size: 8,
            },
          },

          {
            type: "scatter",
            mode: "lines",
            x,
            y: underfit,
            name: "Underfitting",
          },

          {
            type: "scatter",
            mode: "lines",
            x,
            y: goodFit,
            name: "Good fit",
          },

          {
            type: "scatter",
            mode: "lines",
            x,
            y: overfit,
            name: "Overfitting",
          },
        ]}
        layout={{
          autosize: true,
          height: 450,

          xaxis: {
            title: {
              text: "Input feature",
            },
          },

          yaxis: {
            title: {
              text: "Target",
            },
          },

          margin: {
            l: 60,
            r: 25,
            t: 30,
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
          height: "450px",
        }}
        config={{
          responsive: true,
          displaylogo: false,
        }}
      />

      <div className="three-column-grid">
        <div className="mini-card">
          <span>Underfitting</span>
          <strong>
            High Bias
          </strong>
          <p className="muted">
            Model is too simple and
            misses useful patterns.
          </p>
        </div>

        <div className="mini-card">
          <span>Good Fit</span>
          <strong>
            Balanced
          </strong>
          <p className="muted">
            Learns useful structure
            while still generalizing.
          </p>
        </div>

        <div className="mini-card">
          <span>Overfitting</span>
          <strong>
            High Variance
          </strong>
          <p className="muted">
            Model follows training
            noise too closely.
          </p>
        </div>
      </div>
    </section>
  );
}