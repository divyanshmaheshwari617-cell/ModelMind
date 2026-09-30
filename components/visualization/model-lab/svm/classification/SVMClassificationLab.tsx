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

import ClassificationMetrics from "../metrics/ClassificationMetrics";

import SVCDecisionVisualizer from "./SVCDecisionVisualizer";

import {
  encodeBinaryLabels,
  evaluateSVC,
  getBinaryClasses,
  trainSVC,
} from "./svcMath";

type Props = {
  rows: SVMRow[];

  featureNames: string[];

  scalingEnabled: boolean;
};

export default function SVMClassificationLab({
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

  const [queryX, setQueryX] =
    useState(0);

  const [queryY, setQueryY] =
    useState(0);

  const classes =
    useMemo(
      () =>
        getBinaryClasses(
          rows
        ),
      [rows]
    );

  const negativeClass =
    classes[0] ?? "Class 0";

  const positiveClass =
    classes[1] ?? "Class 1";

  const options =
    useMemo(
      () => ({
        kernel,
        C,
        gamma,
        degree,
      }),
      [
        kernel,
        C,
        gamma,
        degree,
      ]
    );

  const evaluation =
    useMemo(
      () =>
        evaluateSVC(
          rows,
          negativeClass,
          positiveClass,
          options,
          scalingEnabled
        ),
      [
        rows,
        negativeClass,
        positiveClass,
        options,
        scalingEnabled,
      ]
    );

  /*
    Visualization can use the
    whole dataset because this is
    an educational model view.

    Evaluation above remains
    leakage-safe and uses a
    train/test split.
  */
  const visualRows =
    useMemo(() => {
      if (
        !scalingEnabled
      ) {
        return rows;
      }

      const scalers =
        createScalers(rows);

      return standardizeRows(
        rows,
        scalers
      );
    }, [
      rows,
      scalingEnabled,
    ]);

  const visualLabels =
    useMemo(
      () =>
        encodeBinaryLabels(
          visualRows,
          negativeClass,
          positiveClass
        ),
      [
        visualRows,
        negativeClass,
        positiveClass,
      ]
    );

  const visualModel =
    useMemo(
      () =>
        trainSVC(
          visualRows,
          visualLabels,
          options
        ),
      [
        visualRows,
        visualLabels,
        options,
      ]
    );

  const firstFeature =
    featureNames[0] ??
    "Feature 1";

  const secondFeature =
    featureNames[1] ??
    "Feature 2";

  if (
    rows.length < 4
  ) {
    return (
      <Message>
        At least four prepared
        rows are required for the
        SVC lab.
      </Message>
    );
  }

  if (
    classes.length !== 2
  ) {
    return (
      <Message>
        SVC Classification in
        this lab currently
        requires exactly two
        target classes.
      </Message>
    );
  }

  if (
    featureNames.length < 2
  ) {
    return (
      <Message>
        Select at least two
        numerical features to use
        the 2D SVC decision
        visualization.
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
          SVC Classification
        </h2>

        <p
          style={{
            color:
              "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          Train a binary Support
          Vector Classifier and
          explore how C, kernel,
          gamma and polynomial
          degree change its
          behavior.
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
                      event
                        .target
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
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          <Info
            label="Negative class"
            value={String(
              negativeClass
            )}
          />

          <Info
            label="Positive class"
            value={String(
              positiveClass
            )}
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
            label="Scaling"
            value={
              scalingEnabled
                ? "Standardized"
                : "Off"
            }
          />
        </div>
      </section>

      <section
        style={sectionStyle}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          Query Point
        </h2>

        <p
          style={{
            color:
              "#94a3b8",
          }}
        >
          Enter a new point and
          watch the trained SVC
          classify it.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <Control>
            <label>
              {firstFeature}
            </label>

            <input
              type="number"
              value={queryX}
              onChange={(
                event
              ) =>
                setQueryX(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              style={
                inputStyle
              }
            />
          </Control>

          <Control>
            <label>
              {secondFeature}
            </label>

            <input
              type="number"
              value={queryY}
              onChange={(
                event
              ) =>
                setQueryY(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              style={
                inputStyle
              }
            />
          </Control>
        </div>

        {scalingEnabled && (
          <div
            style={{
              marginTop: 14,
              color:
                "#fbbf24",
              fontSize: 13,
            }}
          >
            The visualization is
            currently using
            standardized feature
            coordinates, so query
            values here are also
            interpreted in that
            standardized space.
          </div>
        )}
      </section>

      <SVCDecisionVisualizer
        rows={visualRows}
        labels={
          visualLabels
        }
        model={
          visualModel
        }
        featureNames={[
          firstFeature,
          secondFeature,
        ]}
        queryPoint={[
          queryX,
          queryY,
        ]}
      />

      <ClassificationMetrics
        metrics={
          evaluation.metrics
        }
        negativeLabel={String(
          negativeClass
        )}
        positiveLabel={String(
          positiveClass
        )}
      />

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
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          Test metrics are
          calculated using a
          deterministic stratified
          train/test split. When
          scaling is enabled, the
          scaler is fitted only on
          the training rows and
          then applied to the test
          rows. This prevents
          preprocessing leakage
          from the test set.
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
        background:
          "#020617",
        borderRadius: 10,
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
        background:
          "#020617",
        borderRadius: 10,
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