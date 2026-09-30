import type {
  RegressionMetrics as RegressionMetricsType,
} from "../types/svm";

type Props = {
  metrics:
    RegressionMetricsType;
};

export default function RegressionMetrics({
  metrics,
}: Props) {
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
        SVR Regression Metrics
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        These values are computed
        on the held-out test set.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <Metric
          name="MSE"
          value={
            metrics.mse
          }
        />

        <Metric
          name="RMSE"
          value={
            metrics.rmse
          }
        />

        <Metric
          name="MAE"
          value={
            metrics.mae
          }
        />

        <Metric
          name="R²"
          value={
            metrics.r2
          }
        />
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
          lineHeight: 1.7,
        }}
      >
        <strong
          style={{
            color:
              "#e2e8f0",
          }}
        >
          How to read them
        </strong>

        <div
          style={{
            marginTop: 8,
          }}
        >
          MSE strongly penalizes
          larger prediction
          errors.
        </div>

        <div
          style={{
            marginTop: 6,
          }}
        >
          RMSE is the square root
          of MSE and uses the same
          units as the target.
        </div>

        <div
          style={{
            marginTop: 6,
          }}
        >
          MAE measures average
          absolute prediction
          error.
        </div>

        <div
          style={{
            marginTop: 6,
          }}
        >
          R² describes how much
          target variation is
          explained relative to a
          mean baseline. Test R²
          can be negative when the
          model performs worse
          than that baseline.
        </div>
      </div>
    </section>
  );
}

function Metric({
  name,
  value,
}: {
  name: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 15,
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
        {name}
      </div>

      <div
        style={{
          fontSize: 23,
          fontWeight: 700,
          marginTop: 6,
        }}
      >
        {value.toFixed(4)}
      </div>
    </div>
  );
}