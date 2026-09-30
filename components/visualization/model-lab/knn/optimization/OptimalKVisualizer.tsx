import Plot from "react-plotly.js";

import type {
  KNNTask,
  KOptimizationPoint,
} from "../types/knn";

import KRiskAnalyzer from "./KRiskAnalyzer";

interface Props {
  points: KOptimizationPoint[];
  task: KNNTask;
  currentK: number;
  onKSelect?: (k: number) => void;
}

export default function OptimalKVisualizer({
  points,
  task,
  currentK,
  onKSelect,
}: Props) {
  if (points.length === 0) {
    return (
      <>
        <section className="knn-card">
          <h2>Optimal K Analysis</h2>

          <p className="knn-muted">
            More validation data is required
            to compare different K values.
          </p>
        </section>

        <KRiskAnalyzer
          currentK={currentK}
          trainingSize={Math.max(currentK, 1)}
        />
      </>
    );
  }

  const best =
    task === "classification"
      ? points.reduce((bestPoint, point) =>
          point.score > bestPoint.score
            ? point
            : bestPoint,
        )
      : points.reduce((bestPoint, point) =>
          point.score < bestPoint.score
            ? point
            : bestPoint,
        );

  const yTitle =
    task === "classification"
      ? "Validation Accuracy"
      : "Validation RMSE";

  const estimatedTrainingSize =
    Math.max(
      ...points.map((point) => point.k),
      currentK,
    );

  const bestIsOne = best.k === 1;

  return (
    <>
      <KRiskAnalyzer
        currentK={currentK}
        trainingSize={estimatedTrainingSize}
      />

      <section className="knn-card">
        <div className="knn-section-heading">
          <div>
            <p className="knn-eyebrow">
              HYPERPARAMETER LAB
            </p>

            <h2>
              Validation-Based K Analysis
            </h2>

            <p className="knn-muted">
              Compare validation performance
              across candidate K values. This is
              evidence from the current validation
              split, not a universal recommendation.
            </p>
          </div>

          <span className="knn-badge">
            Best validation K = {best.k}
          </span>
        </div>

        <Plot
          data={[
            {
              type: "scatter",
              mode: "lines+markers",
              name: yTitle,

              x: points.map(
                (point) => point.k,
              ),

              y: points.map(
                (point) => point.score,
              ),

              hovertemplate:
                "K = %{x}<br>" +
                `${yTitle} = %{y:.4f}` +
                "<extra></extra>",
            },

            {
              type: "scatter",
              mode: "markers+text",
              name: "Current K",

              x: [currentK],

              y: [
                points.find(
                  (point) =>
                    point.k === currentK,
                )?.score ??
                  points[0].score,
              ],

              text: ["Current K"],
              textposition: "top center",

              marker: {
                size: 14,
                symbol: "diamond",
              },
            },

            {
              type: "scatter",
              mode: "markers+text",
              name: "Best validation K",

              x: [best.k],
              y: [best.score],

              text: ["Best validation"],
              textposition: "bottom center",

              marker: {
                size: 16,
                symbol: "star",
              },
            },
          ]}
          layout={{
            autosize: true,
            height: 450,

            margin: {
              l: 70,
              r: 30,
              t: 30,
              b: 70,
            },

            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",

            font: {
              color: "#dce6ff",
            },

            xaxis: {
              title: {
                text:
                  "Number of Neighbors (K)",
              },

              dtick: 1,

              gridcolor:
                "rgba(255,255,255,0.08)",
            },

            yaxis: {
              title: {
                text: yTitle,
              },

              gridcolor:
                "rgba(255,255,255,0.08)",
            },
          }}
          config={{
            responsive: true,
            displaylogo: false,
          }}
          style={{
            width: "100%",
          }}
          onClick={(event) => {
            const clicked =
              event.points?.[0]?.x;

            const selectedK =
              Number(clicked);

            if (
              Number.isFinite(selectedK)
            ) {
              onKSelect?.(selectedK);
            }
          }}
        />

        <div className="knn-stat-grid">
          <div className="knn-stat">
            <span>Current K</span>
            <strong>{currentK}</strong>
          </div>

          <div className="knn-stat">
            <span>
              Best validation K
            </span>

            <strong>{best.k}</strong>
          </div>

          <div className="knn-stat">
            <span>
              Best validation
              {task === "classification"
                ? " accuracy"
                : " RMSE"}
            </span>

            <strong>
              {best.score.toFixed(4)}
            </strong>
          </div>
        </div>

        {bestIsOne ? (
          <div className="knn-warning-box">
            <strong>
              K = 1 achieved the best result
              on this validation split.
            </strong>

            <p>
              Do not interpret this as proof
              that K = 1 is always the best
              choice. K = 1 has very high
              variance and can be sensitive
              to noise and outliers. Compare
              nearby K values and use robust
              validation before selecting the
              final model.
            </p>
          </div>
        ) : (
          <div className="knn-info-box">
            <strong>
              Why is this called “Best
              validation K”?
            </strong>

            <p>
              This value performed best among
              the tested K values on the
              current validation split. It is
              not a universal KNN rule and can
              change when the dataset or split
              changes.
            </p>
          </div>
        )}

        {onKSelect && !bestIsOne && (
          <button
            type="button"
            className="knn-primary-button"
            onClick={() =>
              onKSelect(best.k)
            }
          >
            Try Best Validation K ={" "}
            {best.k}
          </button>
        )}

        {onKSelect && bestIsOne && (
          <button
            type="button"
            className="knn-primary-button"
            onClick={() =>
              onKSelect(best.k)
            }
          >
            Explore K = 1
          </button>
        )}
      </section>
    </>
  );
}