import {
  useMemo,
  useState,
} from "react";

import {
  explainCParameter,
} from "../utils/svmMath";

type Props = {
  initialC?: number;
  onChange?: (
    value: number
  ) => void;
};

export default function CParameterVisualizer({
  initialC = 1,
  onChange,
}: Props) {
  const [c, setC] =
    useState(initialC);

  const explanation =
    useMemo(
      () =>
        explainCParameter(c),
      [c]
    );

  function updateC(
    value: number
  ) {
    setC(value);
    onChange?.(value);
  }

  const normalized =
    Math.min(
      1,
      Math.log10(c + 1) /
        Math.log10(101)
    );

  const marginWidth =
    36 -
    normalized * 24;

  const violationTolerance =
    15 +
    (1 - normalized) * 65;

  return (
    <section
      style={sectionStyle}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        C Parameter:
        Soft vs Hard Margin
      </h2>

      <p style={paragraphStyle}>
        C controls how strongly
        SVM penalizes training
        points that violate the
        margin or are
        misclassified.
      </p>

      <div
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 12,
          background:
            "#020617",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 12,
          }}
        >
          <strong>C</strong>

          <strong>
            {c.toFixed(2)}
          </strong>
        </div>

        <input
          type="range"
          min="-2"
          max="2"
          step="0.05"
          value={
            Math.log10(c)
          }
          onChange={(
            event
          ) =>
            updateC(
              Math.pow(
                10,
                Number(
                  event.target
                    .value
                )
              )
            )
          }
          style={{
            width: "100%",
            marginTop: 12,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            color:
              "#64748b",
            fontSize: 12,
          }}
        >
          <span>0.01</span>
          <span>1</span>
          <span>100</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <Card
          title="Margin preference"
          value={
            explanation.marginPreference
          }
        />

        <Card
          title="Error tolerance"
          value={
            explanation.errorTolerance
          }
        />

        <Card
          title="Model complexity"
          value={
            explanation.overfittingRisk
          }
        />

        <Card
          title="Regularization strength"
          value={
            explanation.regularizationStrength.toFixed(
              4
            )
          }
        />
      </div>

      <div
        style={{
          height: 240,
          position:
            "relative",
          marginTop: 20,
          background:
            "#020617",
          borderRadius: 14,
          overflow:
            "hidden",
          border:
            "1px solid #1e293b",
        }}
      >
        <div
          style={{
            position:
              "absolute",
            top: 25,
            bottom: 25,
            left: `${
              50 -
              marginWidth
            }%`,
            right: `${
              50 -
              marginWidth
            }%`,
            background:
              "rgba(245,158,11,0.10)",
          }}
        />

        <Line
          left={
            50 -
            marginWidth
          }
          dashed
        />

        <Line left={50} />

        <Line
          left={
            50 +
            marginWidth
          }
          dashed
        />

        <div
          style={{
            position:
              "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            textAlign:
              "center",
            color:
              "#94a3b8",
          }}
        >
          Educational visualization
          of the margin/error
          trade-off
        </div>
      </div>

      <div
        style={infoStyle}
      >
        <strong>
          Current C ={" "}
          {explanation.C.toFixed(
            3
          )}
        </strong>

        <div
          style={{
            marginTop: 10,
          }}
        >
          Margin preference:{" "}
          <strong
            style={{
              color:
                "#e2e8f0",
            }}
          >
            {
              explanation.marginPreference
            }
          </strong>
        </div>

        <div
          style={{
            marginTop: 7,
          }}
        >
          Error tolerance:{" "}
          <strong
            style={{
              color:
                "#e2e8f0",
            }}
          >
            {
              explanation.errorTolerance
            }
          </strong>
        </div>

        <div
          style={{
            marginTop: 7,
          }}
        >
          Complexity warning:{" "}
          <strong
            style={{
              color:
                "#e2e8f0",
            }}
          >
            {
              explanation.overfittingRisk
            }
          </strong>
        </div>
      </div>

      <div
        style={infoStyle}
      >
        <strong
          style={{
            color:
              "#e2e8f0",
          }}
        >
          Important:
        </strong>{" "}
        C does not literally turn
        a soft-margin SVM into a
        mathematical hard-margin
        SVM. A large C instead
        places a stronger penalty
        on margin violations.
      </div>

      <div
        style={{
          ...infoStyle,
          fontSize: 13,
        }}
      >
        The percentage shown by
        the visual is conceptual;
        it is not the actual
        percentage of allowed
        training errors.
        Current visual tolerance
        indicator:{" "}
        {violationTolerance.toFixed(
          0
        )}
        %.
      </div>
    </section>
  );
}

function Line({
  left,
  dashed = false,
}: {
  left: number;
  dashed?: boolean;
}) {
  return (
    <div
      style={{
        position:
          "absolute",
        top: 25,
        bottom: 50,
        left: `${left}%`,
        borderLeft: `3px ${
          dashed
            ? "dashed"
            : "solid"
        } ${
          dashed
            ? "#f59e0b"
            : "#f8fafc"
        }`,
      }}
    />
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background:
          "#020617",
        padding: 14,
        borderRadius: 12,
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

      <strong
        style={{
          display: "block",
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        {value}
      </strong>
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

const paragraphStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const infoStyle = {
  marginTop: 16,
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  color: "#94a3b8",
  lineHeight: 1.6,
};