import type {
  ClassificationExperiment,
} from "../experiment/experimentEngine";

type Props = {
  result:
    ClassificationExperiment;
};

function percent(
  value: number
) {
  return `${(
    value * 100
  ).toFixed(1)}%`;
}

export default function ClassificationMetrics({
  result,
}: Props) {
  return (
    <div className="metric-grid">
      <Metric
        name="Accuracy"
        value={percent(
          result.accuracy
        )}
      />

      <Metric
        name="Precision"
        value={percent(
          result.precision
        )}
      />

      <Metric
        name="Recall"
        value={percent(
          result.recall
        )}
      />

      <Metric
        name="F1 Score"
        value={percent(
          result.f1
        )}
      />

      <Metric
        name="Support Vectors"
        value={String(
          result.supportVectorCount
        )}
      />

      <Metric
        name="Misclassified"
        value={String(
          result.misclassifiedCount
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