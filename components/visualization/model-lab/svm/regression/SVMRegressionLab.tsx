import {
  useMemo,
  useState,
} from "react";

import type {
  SVMKernel,
  SVMRow,
} from "../types/svm";

import {
  createScalers,
  standardizeRows,
} from "../utils/svmMath";

import RegressionMetrics from "../metrics/RegressionMetrics";

import EpsilonTubeVisualizer from "./EpsilonTubeVisualizer";

import SVRPredictionVisualizer from "./SVRPredictionVisualizer";

import {
  evaluateSVR,
  trainSVR,
} from "./svrMath";

type Props = {
  rows: SVMRow[];

  featureNames: string[];

  scalingEnabled: boolean;
};

export default function SVMRegressionLab({
  rows,
  featureNames,
  scalingEnabled,
}: Props) {
  const [kernel, setKernel] =
    useState<SVMKernel>(
      "linear"
    );

  const [C, setC] =
    useState(1);

  const [gamma, setGamma] =
    useState(1);

  const [degree, setDegree] =
    useState(3);

  const [epsilon, setEpsilon] =
    useState(0.5);

  const options =
    useMemo(
      () => ({
        kernel,
        C,
        gamma,
        degree,
        epsilon,
      }),
      [
        kernel,
        C,
        gamma,
        degree,
        epsilon,
      ]
    );

  const evaluation =
    useMemo(
      () =>
        evaluateSVR(
          rows,
          options,
          scalingEnabled
        ),
      [
        rows,
        options,
        scalingEnabled,
      ]
    );

  /*
    Whole-dataset scaling is
    allowed here only for the
    educational visualization.

    The evaluation path above
    splits first and fits scalers
    on training rows only.
  */
  const visualRows =
    useMemo(() => {
      if (
        !scalingEnabled
      ) {
        return rows;
      }

      const scalers =
        createScalers(
          rows
        );

      return standardizeRows(
        rows,
        scalers
      );
    }, [
      rows,
      scalingEnabled,
    ]);

  const visualModel =
    useMemo(
      () =>
        trainSVR(
          visualRows,
          options
        ),
      [
        visualRows,
        options,
      ]
    );

  if (
    rows.length < 4
  ) {
    return (
      <Message>
        At least four prepared
        rows are required for the
        SVR lab.
      </Message>
    );
  }

  if (
    featureNames.length < 1
  ) {
    return (
      <Message>
        Select at least one
        numerical feature for
        SVR.
      </Message>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      <section
        style={sectionStyle}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          Support Vector
          Regression
        </h2>

        <p
          style={{
            color:
              "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          SVR tries to fit a
          function while ignoring
          small errors inside an
          ε-wide tolerance tube.
          C controls the penalty
          for errors outside that
          tube.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
            marginTop: 18,
          }}
        >
          <Control>
            <label>
              Kernel
            </label>

            <select
              value={kernel}
              onChange={(
                event
              ) =>
                setKernel(
                  event.target
                    .value as SVMKernel
                )
              }
              style={
                inputStyle
              }
            >
              <option value="linear">
                Linear
              </option>

              <option value="rbf">
                RBF
              </option>

              <option value="polynomial">
                Polynomial
              </option>
            </select>
          </Control>

          <Control>
            <label>
              C ={" "}
              {C.toFixed(2)}
            </label>

            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={
                Math.log10(C)
              }
              onChange={(
                event
              ) =>
                setC(
                  Math.pow(
                    10,
                    Number(
                      event
                        .target
                        .value
                    )
                  )
                )
              }
            />
          </Control>

          <Control>
            <label>
              ε ={" "}
              {epsilon.toFixed(
                2
              )}
            </label>

            <input
              type="range"
              min="0"
              max="5"
              step="0.05"
              value={epsilon}
              onChange={(
                event
              ) =>
                setEpsilon(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </Control>

          {kernel !==
            "linear" && (
            <Control>
              <label>
                Gamma ={" "}
                {gamma.toFixed(
                  3
                )}
              </label>

              <input
                type="range"
                min="-2"
                max="1.5"
                step="0.05"
                value={
                  Math.log10(
                    gamma
                  )
                }
                onChange={(
                  event
                ) =>
                  setGamma(
                    Math.pow(
                      10,
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  )
                }
              />
            </Control>
          )}

          {kernel ===
            "polynomial" && (
            <Control>
              <label>
                Degree ={" "}
                {degree}
              </label>

              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={degree}
                onChange={(
                  event
                ) =>
                  setDegree(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              />
            </Control>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          <Info
            label="Kernel"
            value={kernel}
          />

          <Info
            label="Support vectors"
            value={String(
              visualModel
                .supportVectorIndices
                .length
            )}
          />

          <Info
            label="ε"
            value={epsilon.toFixed(
              3
            )}
          />

          <Info
            label="Scaling"
            value={
              scalingEnabled
                ? "Standardized"
                : "Off"
            }
          />
        </div>
      </section>

      <EpsilonTubeVisualizer
        rows={visualRows}
        model={visualModel}
        featureName={
          featureNames[0] ??
          "Feature 1"
        }
      />

      <SVRPredictionVisualizer
        model={visualModel}
        featureNames={
          featureNames
        }
      />

      <RegressionMetrics
        metrics={
          evaluation.metrics
        }
      />

      <section
        style={sectionStyle}
      >
        <h3
          style={{
            marginTop: 0,
          }}
        >
          What ε Changes
        </h3>

        <p
          style={{
            color:
              "#94a3b8",
            lineHeight: 1.7,
          }}
        >
          A larger ε creates a
          wider no-penalty region,
          so more observations can
          lie inside the tube
          without contributing to
          epsilon-insensitive
          loss. A smaller ε makes
          the model more sensitive
          to smaller residuals.
        </p>

        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background:
              "#020617",
            fontFamily:
              "monospace",
          }}
        >
          Lε = max(0,
          |y - ŷ| - ε)
        </div>
      </section>

      <section
        style={sectionStyle}
      >
        <h3
          style={{
            marginTop: 0,
          }}
        >
          Evaluation Safety
        </h3>

        <p
          style={{
            color:
              "#94a3b8",
            lineHeight: 1.7,
            marginBottom: 0,
          }}
        >
          Test metrics use a
          deterministic train/test
          split. When scaling is
          enabled, scaling
          statistics are fitted
          only on training rows
          and then applied to the
          held-out test rows.
        </p>
      </section>
    </div>
  );
}

function Control({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 12,
        borderRadius: 10,
        background:
          "#020617",
      }}
    >
      {children}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        background:
          "#020617",
      }}
    >
      <div
        style={{
          color:
            "#64748b",
          fontSize: 12,
        }}
      >
        {label}
      </div>

      <strong
        style={{
          display: "block",
          marginTop: 5,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function Message({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 14,
        background:
          "#0f172a",
        border:
          "1px solid #334155",
        color:
          "#fbbf24",
      }}
    >
      {children}
    </div>
  );
}

const sectionStyle = {
  border:
    "1px solid #334155",
  borderRadius: 16,
  padding: 20,
  background: "#0f172a",
};

const inputStyle = {
  width: "100%",
  padding: 9,
  borderRadius: 8,
  border:
    "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};