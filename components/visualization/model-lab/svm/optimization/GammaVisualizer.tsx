import {
  useMemo,
  useState,
} from "react";

import {
  explainGamma,
} from "../utils/svmMath";

type Props = {
  initialGamma?: number;
  onChange?: (
    gamma: number
  ) => void;
};

export default function GammaVisualizer({
  initialGamma = 1,
  onChange,
}: Props) {
  const [gamma, setGamma] =
    useState(initialGamma);

  const explanation =
    useMemo(
      () =>
        explainGamma(
          gamma
        ),
      [gamma]
    );

  function update(
    value: number
  ) {
    setGamma(value);
    onChange?.(value);
  }

  const influence =
    100 /
    Math.sqrt(
      gamma + 0.1
    );

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
        Gamma Parameter
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        Gamma controls how
        quickly similarity falls
        as two observations move
        farther apart in the RBF
        kernel.
      </p>

      <div
        style={{
          background:
            "#020617",
          padding: 16,
          borderRadius: 12,
          marginTop: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >
          <strong>γ</strong>

          <strong>
            {gamma.toFixed(
              3
            )}
          </strong>
        </div>

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
            update(
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <Card
          title="Influence radius"
          value={
            explanation.influenceRadius
          }
        />

        <Card
          title="Boundary complexity"
          value={
            explanation.boundaryComplexity
          }
        />

        <Card
          title="Model risk"
          value={
            explanation.overfittingRisk
          }
        />
      </div>

      <div
        style={{
          marginTop: 20,
          height: 300,
          background:
            "#020617",
          borderRadius: 14,
          position:
            "relative",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            position:
              "absolute",
            left: "50%",
            top: "50%",
            width: Math.min(
              240,
              influence
            ),
            height: Math.min(
              240,
              influence
            ),
            transform:
              "translate(-50%, -50%)",
            borderRadius:
              "50%",
            background:
              "rgba(56,189,248,0.20)",
            border:
              "2px solid #38bdf8",
            transition:
              "all 0.2s",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            left: "50%",
            top: "50%",
            width: 12,
            height: 12,
            borderRadius:
              "50%",
            background:
              "#f8fafc",
            transform:
              "translate(-50%, -50%)",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            bottom: 14,
            left: 14,
            right: 14,
            textAlign:
              "center",
            color:
              "#94a3b8",
          }}
        >
          {
            explanation.influenceRadius
          }{" "}
          influence radius
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 12,
          background:
            "#020617",
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        <strong
          style={{
            color:
              "#e2e8f0",
          }}
        >
          RBF Kernel
        </strong>

        <div
          style={{
            fontFamily:
              "monospace",
            marginTop: 8,
          }}
        >
          K(x,z) =
          exp(-γ ||x-z||²)
        </div>

        <div
          style={{
            marginTop: 12,
          }}
        >
          γ ={" "}
          {explanation.gamma.toFixed(
            3
          )}
        </div>

        <div
          style={{
            marginTop: 7,
          }}
        >
          Boundary:{" "}
          <strong
            style={{
              color:
                "#e2e8f0",
            }}
          >
            {
              explanation.boundaryComplexity
            }
          </strong>
        </div>

        <div
          style={{
            marginTop: 7,
          }}
        >
          Risk:{" "}
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
    </section>
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