import type {
  RegressionExperiment,
} from "../experiment/experimentEngine";

type Props = {
  result:
    RegressionExperiment;
};

function format(
  value: number
) {
  if (
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value.toFixed(4);
}

export default function RegressionMetrics({
  result,
}: Props) {
  return (
    <div className="metric-grid">
      <Metric
        name="MAE"
        value={format(
          result.mae
        )}
      />

      <Metric
        name="MSE"
        value={format(
          result.mse
        )}
      />

      <Metric
        name="RMSE"
        value={format(
          result.rmse
        )}
      />

      <Metric
        name="R²"
        value={format(
          result.r2
        )}
      />

      <Metric
        name="Support Vectors"
        value={String(
          result.supportVectorCount
        )}
      />

      <Metric
        name="Inside ε Tube"
        value={String(
          result.predictions.filter(
            (item) =>
              !item.outsideEpsilon
          ).length
        )}
      />
    </div>
  );
}

function Metric({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <div className="metric-card">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}