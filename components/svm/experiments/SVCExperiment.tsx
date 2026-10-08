import type { SVMParameters } from "../types/svm";
import type { SVCExperimentOutput } from "./experimentEngine";
import { getKernelLabel } from "./experimentEngine";

type Props = {
  result: SVCExperimentOutput;
  parameters: SVMParameters;
};

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function SVCExperiment({
  result,
  parameters,
}: Props) {
  return (
    <div className="svm-experiment-content">
      <div className="experiment-metric-grid">
        <Metric label="Accuracy" value={pct(result.accuracy)} />
        <Metric label="Macro Precision" value={pct(result.macroPrecision)} />
        <Metric label="Macro Recall" value={pct(result.macroRecall)} />
        <Metric label="Macro F1" value={pct(result.macroF1)} />
        <Metric
          label="Support Candidates"
          value={result.supportVectorIndexes.length}
        />
        <Metric
          label="Misclassified"
          value={result.misclassifiedIndexes.length}
        />
      </div>

      <div className="experiment-two-column">
        <section className="experiment-panel">
          <div className="experiment-panel-kicker">CONFUSION MATRIX</div>
          <h3>Class-by-class predictions</h3>
          <div className="confusion-wrap">
            <table className="confusion-table">
              <thead>
                <tr>
                  <th>Actual ↓ / Predicted →</th>
                  {result.labels.map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.labels.map((label, rowIndex) => (
                  <tr key={label}>
                    <th>{label}</th>
                    {result.labels.map((_predictedLabel, columnIndex) => (
                      <td key={columnIndex}>
                        {result.confusionMatrix[rowIndex]?.[columnIndex] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="experiment-panel">
          <div className="experiment-panel-kicker">ACTIVE MODEL</div>
          <h3>{getKernelLabel(parameters.kernel)} SVC</h3>
          <div className="experiment-facts">
            <Fact label="C" value={parameters.C.toFixed(3)} />
            <Fact label="Gamma" value={parameters.gamma.toFixed(3)} />
            <Fact label="Degree" value={parameters.degree} />
            <Fact label="Coef0" value={parameters.coef0.toFixed(3)} />
            <Fact
              label="Class Weight"
              value={parameters.classWeight === "balanced" ? "Balanced" : "None"}
            />
          </div>
          <p className="experiment-truth">
            Browser experiment: leave-one-out educational kernel scoring.
            Metrics are internally consistent with this ModelMind visual model;
            they are not presented as sklearn SVC optimizer results.
          </p>
        </section>
      </div>

      <section className="experiment-panel">
        <div className="experiment-panel-kicker">DECISION INSPECTION</div>
        <h3>Observation-level result</h3>
        <div className="experiment-row-list">
          {result.actual.slice(0, 12).map((actual, index) => {
            const predicted = result.predicted[index] ?? "—";
            const correct = actual === predicted;
            return (
              <div className="experiment-row" key={index}>
                <span>#{index + 1}</span>
                <strong>{actual}</strong>
                <b>→</b>
                <strong>{predicted}</strong>
                <small>
                  gap {(result.decisionGap[index] ?? 0).toFixed(3)}
                </small>
                <em className={correct ? "ok" : "bad"}>
                  {correct ? "Correct" : "Misclassified"}
                </em>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="experiment-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="experiment-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
