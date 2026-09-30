import {
  useMemo,
} from "react";

import type {
  SVMKernel,
} from "../types/svm";

import {
  compareKernels,
} from "../utils/svmMath";

type Props = {
  x: number[];
  z: number[];
  gamma: number;
  degree: number;
};

type ComparisonItem = {
  kernel: SVMKernel;
  label: string;
  value: number;
};

export default function KernelComparison({
  x,
  z,
  gamma,
  degree,
}: Props) {
  const kernelResult =
    useMemo(
      () =>
        compareKernels(
          x,
          z,
          gamma,
          degree
        ),
      [
        x,
        z,
        gamma,
        degree,
      ]
    );

  const comparisons =
    useMemo<
      ComparisonItem[]
    >(
      () => [
        {
          kernel:
            "linear",
          label:
            "Linear",
          value:
            kernelResult.linear,
        },
        {
          kernel:
            "rbf",
          label: "RBF",
          value:
            kernelResult.rbf,
        },
        {
          kernel:
            "polynomial",
          label:
            "Polynomial",
          value:
            kernelResult.polynomial,
        },
      ],
      [kernelResult]
    );

  const maximum =
    Math.max(
      1e-9,
      ...comparisons.map(
        (item) =>
          Math.abs(
            item.value
          )
      )
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
        Kernel Comparison
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        The same pair of
        observations can receive
        very different similarity
        scores depending on the
        selected kernel.
      </p>

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background:
            "#020617",
          marginTop: 16,
          fontFamily:
            "monospace",
        }}
      >
        x = [
        {x
          .map((value) =>
            value.toFixed(2)
          )
          .join(", ")}
        ]
        <br />

        z = [
        {z
          .map((value) =>
            value.toFixed(2)
          )
          .join(", ")}
        ]
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gap: 14,
        }}
      >
        {comparisons.map(
          (item) => {
            const width =
              Math.max(
                2,
                (Math.abs(
                  item.value
                ) /
                  maximum) *
                  100
              );

            return (
              <div
                key={
                  item.kernel
                }
                style={{
                  background:
                    "#020617",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    gap: 12,
                  }}
                >
                  <strong>
                    {
                      item.label
                    }
                  </strong>

                  <span
                    style={{
                      fontFamily:
                        "monospace",
                    }}
                  >
                    {item.value.toFixed(
                      4
                    )}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    height: 12,
                    borderRadius: 999,
                    background:
                      "#1e293b",
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      height:
                        "100%",
                      width: `${width}%`,
                      background:
                        "#38bdf8",
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
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
          Remember:
        </strong>{" "}
        kernel values are
        similarity computations,
        not probabilities. Their
        numerical scales can be
        very different, so the bar
        lengths should not be
        interpreted as model
        accuracy.
      </div>
    </section>
  );
}