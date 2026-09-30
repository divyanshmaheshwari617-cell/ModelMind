import type {
  ColumnAnalysis,
  ImputationMethod,
} from "./preprocessingMath";

type Props = {
  analyses: ColumnAnalysis[];

  methods: Record<
    string,
    ImputationMethod
  >;

  onMethodChange: (
    column: string,
    method: ImputationMethod
  ) => void;
};

const methods: {
  value: ImputationMethod;
  label: string;
}[] = [
  {
    value: "none",
    label: "Do not fill",
  },
  {
    value: "mean",
    label: "Mean",
  },
  {
    value: "median",
    label: "Median",
  },
  {
    value: "most-frequent",
    label: "Most Frequent",
  },
  {
    value: "remove",
    label: "Remove Row",
  },
];

export default function MissingValueAnalyzer({
  analyses,
  methods: selectedMethods,
  onMethodChange,
}: Props) {
  const totalMissing =
    analyses.reduce(
      (sum, analysis) =>
        sum +
        analysis.missing,
      0
    );

  return (
    <section
      style={{
        border:
          "1px solid #334155",
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
        Missing Value Analysis
      </h2>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        SVMs require numeric,
        finite feature values.
        ModelMind first shows
        what is missing and lets
        you choose how to handle
        it. Nothing is filled
        automatically.
      </p>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          background: "#020617",
        }}
      >
        Total missing feature
        values:{" "}
        <strong>
          {totalMissing}
        </strong>
      </div>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                "Feature",
                "Missing",
                "Missing %",
                "Type",
                "Skewness",
                "Recommended",
                "Your Choice",
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding: 10,
                    textAlign:
                      "left",
                    borderBottom:
                      "1px solid #334155",
                    color:
                      "#cbd5e1",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {analyses.map(
              (analysis) => (
                <tr
                  key={
                    analysis.column
                  }
                >
                  <td
                    style={{
                      padding: 10,
                    }}
                  >
                    {
                      analysis.column
                    }
                  </td>

                  <td
                    style={{
                      padding: 10,
                    }}
                  >
                    {
                      analysis.missing
                    }
                  </td>

                  <td
                    style={{
                      padding: 10,
                    }}
                  >
                    {analysis.missingPercentage.toFixed(
                      1
                    )}
                    %
                  </td>

                  <td
                    style={{
                      padding: 10,
                    }}
                  >
                    {analysis.numeric
                      ? "Numeric"
                      : "Categorical"}
                  </td>

                  <td
                    style={{
                      padding: 10,
                    }}
                  >
                    {analysis.skewness ===
                    null
                      ? "—"
                      : analysis.skewness.toFixed(
                          2
                        )}
                  </td>

                  <td
                    style={{
                      padding: 10,
                    }}
                  >
                    {
                      analysis.recommendedMethod
                    }
                  </td>

                  <td
                    style={{
                      padding: 10,
                    }}
                  >
                    <select
                      value={
                        selectedMethods[
                          analysis
                            .column
                        ] ??
                        "none"
                      }
                      onChange={(
                        event
                      ) =>
                        onMethodChange(
                          analysis.column,
                          event
                            .target
                            .value as ImputationMethod
                        )
                      }
                    >
                      {methods.map(
                        (
                          method
                        ) => (
                          <option
                            key={
                              method.value
                            }
                            value={
                              method.value
                            }
                          >
                            {
                              method.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {totalMissing === 0 && (
        <p
          style={{
            marginBottom: 0,
            color: "#86efac",
          }}
        >
          No missing values were
          detected in the selected
          features.
        </p>
      )}
    </section>
  );
}