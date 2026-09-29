import Plot from "react-plotly.js";

import {
  CoefficientPathPoint,
} from "../types/regularization";

interface Props {
  paths: CoefficientPathPoint[];
  features: string[];
}

export default function CoefficientPathGraph({
  paths,
  features,
}: Props) {
  if (paths.length === 0) return null;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">REGULARIZATION PATH</span>
          <h2>What happens when α increases?</h2>
        </div>
      </div>

      <p className="muted">
        Every line represents one feature coefficient. Move from weak
        regularization on the left toward stronger regularization on the
        right.
      </p>

      <Plot
        data={features.map((feature) => ({
          x: paths.map((point) => point.alpha),
          y: paths.map(
            (point) => point.coefficients[feature] ?? 0
          ),
          type: "scatter",
          mode: "lines+markers",
          name: feature,
        }))}
        layout={{
          autosize: true,
          height: 430,
          margin: {
            l: 65,
            r: 25,
            t: 25,
            b: 60,
          },
          xaxis: {
            title: { text: "α (regularization strength)" },
          },
          yaxis: {
            title: { text: "Coefficient" },
            zeroline: true,
          },
          legend: {
            orientation: "h",
          },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
        }}
        useResizeHandler
        style={{
          width: "100%",
          height: "430px",
        }}
        config={{
          responsive: true,
          displaylogo: false,
        }}
      />
    </section>
  );
}