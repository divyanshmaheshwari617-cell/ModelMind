import Plot from "react-plotly.js";

import {
  TrainedRegularizationModel,
} from "../types/regularization";

interface Props {
  models: TrainedRegularizationModel[];
}

function label(model: TrainedRegularizationModel) {
  if (model.modelType === "linear") return "OLS";
  if (model.modelType === "ridge") return "Ridge";
  if (model.modelType === "lasso") return "Lasso";
  return "Elastic Net";
}

export default function TrainTestErrorGraph({ models }: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">GENERALIZATION</span>
          <h2>Training error vs unseen test error</h2>
        </div>
      </div>

      <Plot
        data={[
          {
            x: models.map(label),
            y: models.map((model) => model.trainMetrics.rmse),
            type: "bar",
            name: "Train RMSE",
          },
          {
            x: models.map(label),
            y: models.map((model) => model.testMetrics.rmse),
            type: "bar",
            name: "Test RMSE",
          },
        ]}
        layout={{
          barmode: "group",
          autosize: true,
          height: 410,
          margin: {
            l: 65,
            r: 20,
            t: 20,
            b: 55,
          },
          yaxis: {
            title: { text: "RMSE" },
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