import type {
  ClassificationMetrics as ClassificationMetricsType,
} from "../types/knn";

interface Props {
  metrics:
    ClassificationMetricsType;
}

export default function ClassificationMetrics({
  metrics,
}: Props) {
  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            MODEL EVALUATION
          </p>

          <h2>
            Classification Metrics
          </h2>
        </div>

        <span className="knn-badge">
          Accuracy{" "}
          {(
            metrics.accuracy *
            100
          ).toFixed(1)}
          %
        </span>
      </div>

      <div className="knn-stat-grid">
        <div className="knn-stat">
          <span>
            Accuracy
          </span>

          <strong>
            {(
              metrics.accuracy *
              100
            ).toFixed(2)}
            %
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Macro Precision
          </span>

          <strong>
            {metrics.macroPrecision.toFixed(
              4,
            )}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Macro Recall
          </span>

          <strong>
            {metrics.macroRecall.toFixed(
              4,
            )}
          </strong>
        </div>

        <div className="knn-stat">
          <span>
            Macro F1
          </span>

          <strong>
            {metrics.macroF1.toFixed(
              4,
            )}
          </strong>
        </div>
      </div>

      <h3>
        Confusion Matrix
      </h3>

      <div className="knn-table-wrap">
        <table className="knn-table">
          <thead>
            <tr>
              <th>
                Actual ↓ /
                Predicted →
              </th>

              {metrics.classes.map(
                (classLabel) => (
                  <th
                    key={String(
                      classLabel,
                    )}
                  >
                    {String(
                      classLabel,
                    )}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {metrics.confusionMatrix.map(
              (
                row,
                rowIndex,
              ) => (
                <tr
                  key={
                    rowIndex
                  }
                >
                  <th>
                    {String(
                      metrics
                        .classes[
                        rowIndex
                      ],
                    )}
                  </th>

                  {row.map(
                    (
                      value,
                      columnIndex,
                    ) => (
                      <td
                        key={
                          columnIndex
                        }
                      >
                        {value}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <h3>
        Per-Class Performance
      </h3>

      <div className="knn-table-wrap">
        <table className="knn-table">
          <thead>
            <tr>
              <th>
                Class
              </th>

              <th>
                Precision
              </th>

              <th>
                Recall
              </th>

              <th>
                F1
              </th>

              <th>
                Support
              </th>
            </tr>
          </thead>

          <tbody>
            {metrics.perClass.map(
              (item) => (
                <tr
                  key={String(
                    item.classLabel,
                  )}
                >
                  <td>
                    {String(
                      item.classLabel,
                    )}
                  </td>

                  <td>
                    {item.precision.toFixed(
                      4,
                    )}
                  </td>

                  <td>
                    {item.recall.toFixed(
                      4,
                    )}
                  </td>

                  <td>
                    {item.f1.toFixed(
                      4,
                    )}
                  </td>

                  <td>
                    {item.support}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="knn-info-box">
        <strong>
          Do not judge the model
          only by accuracy.
        </strong>

        <p>
          Precision tells us how
          reliable predicted classes
          are, recall tells us how
          many actual examples were
          recovered, and F1 balances
          precision and recall.
        </p>
      </div>
    </section>
  );
}