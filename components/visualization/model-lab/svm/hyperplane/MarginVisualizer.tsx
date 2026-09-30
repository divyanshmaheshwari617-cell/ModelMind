import type {
  Hyperplane2D,
} from "../types/svm";

import {
  calculateMarginWidth,
  hyperplaneMagnitude,
} from "../utils/svmMath";

type Props = {
  hyperplane: Hyperplane2D;
};

export default function MarginVisualizer({
  hyperplane,
}: Props) {
  const magnitude =
    hyperplaneMagnitude(
      hyperplane
    );

  const marginWidth =
    calculateMarginWidth(
      hyperplane
    );

  const halfMargin =
    marginWidth / 2;

  const maximumVisualMargin = 5;

  const normalizedMargin =
    Math.min(
      1,
      marginWidth /
        maximumVisualMargin
    );

  const center = 50;

  const visualHalfWidth =
    Math.max(
      4,
      normalizedMargin *
        35
    );

  const leftMargin =
    center -
    visualHalfWidth;

  const rightMargin =
    center +
    visualHalfWidth;

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
        Understanding the Margin
      </h2>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        SVM does not only try to
        separate the classes. It
        searches for a separating
        hyperplane with a large
        margin around it.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <Metric
          label="||w||"
          value={magnitude}
        />

        <Metric
          label="Distance to each margin"
          value={halfMargin}
        />

        <Metric
          label="Total margin width"
          value={marginWidth}
        />
      </div>

      <div
        style={{
          marginTop: 22,
          height: 210,
          position:
            "relative",
          overflow:
            "hidden",
          borderRadius: 14,
          background:
            "#020617",
          border:
            "1px solid #1e293b",
        }}
      >
        <div
          style={{
            position:
              "absolute",
            top: 0,
            bottom: 0,
            left: `${leftMargin}%`,
            right: `${
              100 -
              rightMargin
            }%`,
            background:
              "rgba(245, 158, 11, 0.10)",
          }}
        />

        <VerticalLine
          left={
            leftMargin
          }
          color="#f59e0b"
          dashed
          label="-1 Margin"
        />

        <VerticalLine
          left={center}
          color="#f8fafc"
          label="Decision Boundary"
        />

        <VerticalLine
          left={
            rightMargin
          }
          color="#f59e0b"
          dashed
          label="+1 Margin"
        />

        <div
          style={{
            position:
              "absolute",
            left: 14,
            bottom: 12,
            right: 14,
            color:
              "#64748b",
            textAlign:
              "center",
            fontSize: 13,
          }}
        >
          Larger weight magnitude
          → smaller margin.
          Smaller weight magnitude
          → wider margin.
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 12,
          background:
            "#020617",
          lineHeight: 1.7,
        }}
      >
        <div
          style={{
            fontFamily:
              "monospace",
            color:
              "#e2e8f0",
          }}
        >
          Margin width =
          2 / ||w||
        </div>

        <p
          style={{
            color:
              "#94a3b8",
            marginBottom: 0,
          }}
        >
          For the current
          hyperplane, ||w|| ={" "}
          {magnitude.toFixed(
            3
          )}
          , so the margin width
          is{" "}
          {marginWidth.toFixed(
            3
          )}
          .
        </p>
      </div>

      {magnitude <=
        1e-9 && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            background:
              "#451a03",
            color:
              "#fdba74",
          }}
        >
          Both weights are zero,
          so a meaningful
          separating hyperplane
          does not currently
          exist.
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 14,
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
        {label}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {value.toFixed(3)}
      </div>
    </div>
  );
}

function VerticalLine({
  left,
  color,
  label,
  dashed = false,
}: {
  left: number;
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <>
      <div
        style={{
          position:
            "absolute",
          left: `${left}%`,
          top: 28,
          bottom: 50,
          borderLeft: `3px ${
            dashed
              ? "dashed"
              : "solid"
          } ${color}`,
          transform:
            "translateX(-50%)",
        }}
      />

      <div
        style={{
          position:
            "absolute",
          left: `${left}%`,
          top: 8,
          transform:
            "translateX(-50%)",
          color,
          fontSize: 12,
          whiteSpace:
            "nowrap",
        }}
      >
        {label}
      </div>
    </>
  );
}