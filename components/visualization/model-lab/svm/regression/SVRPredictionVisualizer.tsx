import {
  useMemo,
  useState,
} from "react";

import {
  predictSVR,
  type TrainedSVR,
} from "./svrMath";

type Props = {
  model: TrainedSVR;

  featureNames: string[];
};

export default function SVRPredictionVisualizer({
  model,
  featureNames,
}: Props) {
  const [values, setValues] =
    useState<number[]>(
      () =>
        new Array(
          Math.max(
            1,
            featureNames.length
          )
        ).fill(0)
    );

  const prediction =
    useMemo(
      () =>
        predictSVR(
          model,
          values
        ).prediction,
      [model, values]
    );

  function updateValue(
    index: number,
    value: number
  ) {
    setValues(
      (current) =>
        current.map(
          (
            existing,
            currentIndex
          ) =>
            currentIndex ===
            index
              ? value
              : existing
        )
    );
  }

  return (
    <section
      style={{
        border: "1px solid #334155",
        borderRadius: 16,
        padding: 20,
        background: "#0f172a",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        Predict a New Value
      </h2>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        Enter feature values to
        see the current SVR model
        prediction immediately.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {featureNames.map(
          (
            feature,
            index
          ) => (
            <label
              key={feature}
              style={{
                display: "grid",
                gap: 7,
                padding: 12,
                borderRadius: 10,
                background: "#020617",
              }}
            >
              <span>
                {feature}
              </span>

              <input
                type="number"
                value={
                  values[
                    index
                  ] ?? 0
                }
                onChange={(
                  event
                ) =>
                  updateValue(
                    index,
                    Number(
                      event
                        .target
                        .value
                    )
                  )
                }
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding: 9,
                  borderRadius: 8,
                  border:
                    "1px solid #334155",
                  background:
                    "#0f172a",
                  color:
                    "#e2e8f0",
                }}
              />
            </label>
          )
        )}
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 18,
          borderRadius: 12,
          background: "#020617",
        }}
      >
        <div
          style={{
            color: "#64748b",
            fontSize: 13,
          }}
        >
          Predicted target
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {prediction.toFixed(
            4
          )}
        </div>

        <div
          style={{
            color: "#94a3b8",
            marginTop: 8,
          }}
        >
          ε-tube around this
          prediction: [
          {(
            prediction -
            model.epsilon
          ).toFixed(4)}
          ,{" "}
          {(
            prediction +
            model.epsilon
          ).toFixed(4)}
          ]
        </div>
      </div>
    </section>
  );
}