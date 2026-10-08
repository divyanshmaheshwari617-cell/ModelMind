import Plot
  from "react-plotly.js";

import type {
  ClassificationExperiment,
} from "../experiment/experimentEngine";

type Props = {
  result:
    ClassificationExperiment;
};

export default function DecisionScorePlot({
  result,
}: Props) {
  const indexes =
    result.predictions.map(
      (_, index) =>
        index + 1
    );

  return (
    <div className="experiment-block">
      <h4>
        Decision / Similarity Scores
      </h4>

      <p className="experiment-help">
        Higher values indicate stronger
        similarity to the selected
        predicted class in the current
        educational browser engine.
      </p>

      <Plot
        data={[
          {
            x: indexes,
            y:
              result.predictions.map(
                (item) =>
                  item.score
              ),

            type: "scatter",
            mode:
              "markers",

            text:
              result.predictions.map(
                (item) =>
                  `Actual: ${item.actual}<br>Predicted: ${item.predicted}`
              ),

            marker: {
              size: 10,
            },

            name:
              "Decision score",
          },
        ]}
        layout={{
          autosize: true,

          paper_bgcolor:
            "transparent",

          plot_bgcolor:
            "transparent",

          font: {
            color:
              "#e8e9ff",
          },

          margin: {
            l: 55,
            r: 20,
            t: 20,
            b: 50,
          },

          xaxis: {
            title: {
              text:
                "Observation",
            },
          },

          yaxis: {
            title: {
              text:
                "Score",
            },
          },
        }}
        config={{
          responsive: true,
          displaylogo: false,
        }}
        style={{
          width: "100%",
          height: "350px",
        }}
      />
    </div>
  );
}