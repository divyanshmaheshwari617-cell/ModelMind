import type {
  ClassificationMetrics as ClassificationMetricsType,
} from "../types/svm";
type Props = {
  metrics:
    ClassificationMetricsType;
  negativeLabel?: string;
  positiveLabel?: string;
};

export default function ClassificationMetrics({
  metrics,
  negativeLabel = "Class -1",
  positiveLabel = "Class +1",
}: Props) {
  const matrix =
    metrics.confusionMatrix;

  return (
    <section
      style={{
        border:
          "1px solid #334155",
        borderRadius: 16,
        padding: 20,
        background:
          "#0f172a",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        Classification
        Performance
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        These metrics are
        calculated from the held
        out test portion of the
        dataset, not the training
        rows.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <MetricCard
          title="Accuracy"
          value={
            metrics.accuracy
          }
        />

        <MetricCard
          title="Precision"
          value={
            metrics.precision
          }
        />

        <MetricCard
          title="Recall"
          value={
            metrics.recall
          }
        />

        <MetricCard
          title="F1 Score"
          value={
            metrics.f1
          }
        />
      </div>

      <h3
        style={{
          marginTop: 24,
        }}
      >
        Confusion Matrix
      </h3>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            minWidth: 520,
            textAlign:
              "center",
          }}
        >
          <thead>
            <tr>
              <th
                style={
                  headerStyle
                }
              >
                Actual ↓ /
                Predicted →
              </th>

              <th
                style={
                  headerStyle
                }
              >
                {negativeLabel}
              </th>

              <th
                style={
                  headerStyle
                }
              >
                {positiveLabel}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th
                style={
                  headerStyle
                }
              >
                {negativeLabel}
              </th>

              <td
                style={
                  cellStyle
                }
              >
                <strong>
                  {
                    matrix.trueNegative
                  }
                </strong>

                <div
                  style={
                    noteStyle
                  }
                >
                  True Negative
                </div>
              </td>

              <td
                style={
                  cellStyle
                }
              >
                <strong>
                  {
                    matrix.falsePositive
                  }
                </strong>

                <div
                  style={
                    noteStyle
                  }
                >
                  False Positive
                </div>
              </td>
            </tr>

            <tr>
              <th
                style={
                  headerStyle
                }
              >
                {positiveLabel}
              </th>

              <td
                style={
                  cellStyle
                }
              >
                <strong>
                  {
                    matrix.falseNegative
                  }
                </strong>

                <div
                  style={
                    noteStyle
                  }
                >
                  False Negative
                </div>
              </td>

              <td
                style={
                  cellStyle
                }
              >
                <strong>
                  {
                    matrix.truePositive
                  }
                </strong>

                <div
                  style={
                    noteStyle
                  }
                >
                  True Positive
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 12,
          background:
            "#020617",
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        <strong
          style={{
            color:
              "#e2e8f0",
          }}
        >
          Reading the metrics
        </strong>

        <div
          style={{
            marginTop: 8,
          }}
        >
          Accuracy = overall
          fraction predicted
          correctly.
        </div>

        <div
          style={{
            marginTop: 6,
          }}
        >
          Precision = among
          predicted positive
          observations, how many
          were actually positive.
        </div>

        <div
          style={{
            marginTop: 6,
          }}
        >
          Recall = among actual
          positive observations,
          how many were detected.
        </div>

        <div
          style={{
            marginTop: 6,
          }}
        >
          F1 balances precision
          and recall using their
          harmonic mean.
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background:
          "#020617",
      }}
    >
      <div
        style={{
          color:
            "#64748b",
          fontSize: 13,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {(value * 100).toFixed(
          1
        )}
        %
      </div>
    </div>
  );
}

const headerStyle = {
  padding: 12,
  border:
    "1px solid #334155",
  background: "#020617",
};

const cellStyle = {
  padding: 18,
  border:
    "1px solid #334155",
};

const noteStyle = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 12,
};
