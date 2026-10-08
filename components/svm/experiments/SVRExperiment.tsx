import type { SVMParameters } from "../types/svm";
import type { SVRExperimentOutput } from "./experimentEngine";
import { getKernelLabel } from "./experimentEngine";

type Props = {
  result: SVRExperimentOutput;
  parameters: SVMParameters;
};

function number(value: number) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(4);
}

export default function SVRExperiment({
  result,
  parameters,
}: Props) {
  return (
    <div className="svm-experiment-content">
      <div className="experiment-metric-grid">
        <Metric label="MAE" value={number(result.mae)} />
        <Metric label="MSE" value={number(result.mse)} />
        <Metric label="RMSE" value={number(result.rmse)} />
        <Metric label="R²" value={number(result.r2)} />
        <Metric
          label="Outside ε"
          value={result.outsideEpsilonIndexes.length}
        />
        <Metric
          label="Support Candidates"
          value={result.supportVectorIndexes.length}
        />
      </div>

      <div className="experiment-two-column">
        <section className="experiment-panel">
          <div className="experiment-panel-kicker">RESIDUAL ANALYSIS</div>
          <h3>Actual vs predicted</h3>
          <div className="experiment-row-list">
            {result.actual.slice(0, 12).map((actual, index) => {
              const predicted = result.predicted[index] ?? 0;
              const residual = result.residuals[index] ?? 0;
              const outside =
                Math.abs(residual) > parameters.epsilon;

              return (
                <div className="experiment-row" key={index}>
                  <span>#{index + 1}</span>
                  <strong>{actual.toFixed(3)}</strong>
                  <b>→</b>
                  <strong>{predicted.toFixed(3)}</strong>
                  <small>residual {residual.toFixed(3)}</small>
                  <em className={outside ? "bad" : "ok"}>
                    {outside ? "Outside ε" : "Inside ε"}
                  </em>
                </div>
              );
            })}
          </div>
        </section>

        <section className="experiment-panel">
          <div className="experiment-panel-kicker">ACTIVE MODEL</div>
          <h3>{getKernelLabel(parameters.kernel)} SVR</h3>
          <div className="experiment-facts">
            <Fact label="C" value={parameters.C.toFixed(3)} />
            <Fact label="Epsilon" value={parameters.epsilon.toFixed(3)} />
            <Fact label="Gamma" value={parameters.gamma.toFixed(3)} />
            <Fact label="Degree" value={parameters.degree} />
            <Fact label="Coef0" value={parameters.coef0.toFixed(3)} />
          </div>
          <p className="experiment-truth">
            Browser experiment: leave-one-out educational kernel regression.
            The epsilon and error metrics react to the shared ModelMind state;
            this is not claimed to reproduce sklearn SVR optimization exactly.
          </p>
        </section>
      </div>
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
