import { useMemo } from "react";

import type {
  Hyperplane2D,
  SVMRow,
} from "../types/svm";

import {
  analyzeSupportVectors,
} from "../utils/svmMath";

type Props = {
  rows: SVMRow[];
  labels: (-1 | 1)[];
  hyperplane: Hyperplane2D;
};

export default function SupportVectorVisualizer({
  rows,
  labels,
  hyperplane,
}: Props) {
  const analysis =
    useMemo(
      () =>
        analyzeSupportVectors(
          rows,
          labels,
          hyperplane
        ),
      [
        rows,
        labels,
        hyperplane,
      ]
    );

  const supportVectors =
    analysis.filter(
      (point) =>
        point.isSupportVector
    );

  const violations =
    analysis.filter(
      (point) =>
        point.violatesMargin
    );

  const misclassified =
    analysis.filter(
      (point) =>
        point.misclassified
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
        Support Vector Analysis
      </h2>

      <p
        style={{
          color:
            "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        Support vectors are the
        observations closest to
        the separating margin.
        They are the points that
        most directly constrain
        the position of the SVM
        boundary.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <SummaryCard
          title="Total Points"
          value={
            analysis.length
          }
          description="Observations currently being analyzed"
        />

        <SummaryCard
          title="Support Vectors"
          value={
            supportVectors.length
          }
          description="Points on or inside the margin region"
        />

        <SummaryCard
          title="Margin Violations"
          value={
            violations.length
          }
          description="Points with y·f(x) < 1"
        />

        <SummaryCard
          title="Misclassified"
          value={
            misclassified.length
          }
          description="Points with y·f(x) < 0"
        />
      </div>

      <div
        style={{
          marginTop: 20,
          overflowX:
            "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            minWidth: 720,
          }}
        >
          <thead>
            <tr>
              {[
                "Point",
                "Class",
                "Functional Margin",
                "Distance",
                "Support Vector",
                "Margin Violation",
                "Misclassified",
              ].map(
                (heading) => (
                  <th
                    key={
                      heading
                    }
                    style={{
                      padding: 10,
                      textAlign:
                        "left",
                      borderBottom:
                        "1px solid #334155",
                      color:
                        "#cbd5e1",
                      fontSize: 13,
                    }}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {analysis.map(
              (
                point,
                index
              ) => (
                <tr
                  key={
                    point.row.id
                  }
                  style={{
                    background:
                      point.misclassified
                        ? "rgba(127, 29, 29, 0.22)"
                        : point.isSupportVector
                        ? "rgba(120, 53, 15, 0.18)"
                        : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: 10,
                      borderBottom:
                        "1px solid #1e293b",
                    }}
                  >
                    #{index + 1}
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom:
                        "1px solid #1e293b",
                    }}
                  >
                    {point.label >
                    0
                      ? "+1"
                      : "-1"}
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom:
                        "1px solid #1e293b",
                    }}
                  >
                    {point.functionalMargin.toFixed(
                      3
                    )}
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom:
                        "1px solid #1e293b",
                    }}
                  >
                    {point.geometricDistance.toFixed(
                      3
                    )}
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom:
                        "1px solid #1e293b",
                    }}
                  >
                    <Status
                      active={
                        point.isSupportVector
                      }
                      yes="Yes"
                      no="No"
                    />
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom:
                        "1px solid #1e293b",
                    }}
                  >
                    <Status
                      active={
                        point.violatesMargin
                      }
                      yes="Violation"
                      no="No"
                    />
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom:
                        "1px solid #1e293b",
                    }}
                  >
                    <Status
                      active={
                        point.misclassified
                      }
                      yes="Yes"
                      no="No"
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gap: 10,
        }}
      >
        <Explanation
          title="y · f(x) > 1"
          text="The point is correctly classified and lies outside the margin."
        />

        <Explanation
          title="y · f(x) = 1"
          text="The point lies exactly on the canonical margin and is a support vector."
        />

        <Explanation
          title="0 < y · f(x) < 1"
          text="The point is correctly classified but lies inside the margin, so it violates the margin."
        />

        <Explanation
          title="y · f(x) < 0"
          text="The point is on the wrong side of the decision boundary and is misclassified."
        />
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
          Why are they called
          support vectors?
        </strong>

        <br />

        The maximum-margin
        boundary is constrained by
        the observations nearest
        the margin. In the trained
        SVM solution, these
        influential observations
        are the support vectors.
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
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
            "#94a3b8",
          fontSize: 13,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginTop: 5,
        }}
      >
        {value}
      </div>

      <div
        style={{
          color:
            "#64748b",
          fontSize: 12,
          marginTop: 5,
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

function Status({
  active,
  yes,
  no,
}: {
  active: boolean;
  yes: string;
  no: string;
}) {
  return (
    <span
      style={{
        display:
          "inline-block",
        padding:
          "4px 8px",
        borderRadius: 999,
        background:
          active
            ? "#451a03"
            : "#052e16",
        color:
          active
            ? "#fdba74"
            : "#86efac",
        fontSize: 12,
      }}
    >
      {active
        ? yes
        : no}
    </span>
  );
}

function Explanation({
  title,
  text,
}: {
  title: string;
  text: string;
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
      <strong
        style={{
          fontFamily:
            "monospace",
        }}
      >
        {title}
      </strong>

      <div
        style={{
          marginTop: 5,
          color:
            "#94a3b8",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  );
}