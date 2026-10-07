import { useEffect, useState } from "react";

import {
  NumericRow,
  TrainedRegularizationModel,
} from "../types/regularization";

import {
  predictNewRow,
} from "../utils/regularizationMath";

interface Props {
  model: TrainedRegularizationModel;
}

export default function NewValuePredictor({ model }: Props) {
  const createDefaults = () =>
    Object.fromEntries(
      model.scalers.map((scaler) => [
        scaler.feature,
        scaler.mean,
      ])
    ) as NumericRow;

  const [values, setValues] = useState<NumericRow>(
    createDefaults()
  );

  useEffect(() => {
    setValues(createDefaults());
  }, [model]);

  const prediction = predictNewRow(values, model);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TRY THE MODEL</span>
          <h2>Predict a new value</h2>
        </div>
      </div>

      <div className="feature-grid">
        {model.features.map((feature) => (
          <label className="input-card" key={feature}>
            <span>{feature}</span>

            <input
              type="number"
              step="any"
              value={values[feature] ?? 0}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [feature]: Number(event.target.value),
                }))
              }
            />
          </label>
        ))}
      </div>

      <div className="prediction-result">
        <span>Predicted {model.target}</span>
        <strong>{prediction.toFixed(4)}</strong>
      </div>
    </section>
  );
}