import Plot from "react-plotly.js";

import { TrainedRegularizationModel } from "../types/regularization";

interface Props {
  linear: TrainedRegularizationModel;
  ridge: TrainedRegularizationModel;
  lasso: TrainedRegularizationModel;
  elasticNet: TrainedRegularizationModel;
}

export default function ModelComparisonGraph({
  linear,
  ridge,
  lasso,
  elasticNet,
}: Props) {
  const features = linear.features;

  const models = [
    { name: "OLS", model: linear },
    { name: "Ridge", model: ridge },
    { name: "Lasso", model: lasso },
    { name: "Elastic Net", model: elasticNet },
  ];

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">MODEL COMPARISON</span>
          <h2>Same data, different coefficient behavior</h2>
        </div>
      </div>

      <Plot
        data={models.map(({ name, model }) => ({
          x: features,
          y: features.map(
            (feature) => model.coefficients[feature] ?? 0
          ),
          type: "bar",
          name,
        }))}
        layout={{
          barmode: "group",
          autosize: true,
          height: 430,
          margin: {
            l: 60,
            r: 20,
            t: 20,
            b: 70,
          },
          xaxis: {
            title: { text: "Features" },
          },
          yaxis: {
            title: { text: "Standardized coefficient" },
          },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
        }}
        useResizeHandler
        style={{ width: "100%" }}
        config={{
          responsive: true,
          displaylogo: false,
        }}
      />
    </section>
  );
}