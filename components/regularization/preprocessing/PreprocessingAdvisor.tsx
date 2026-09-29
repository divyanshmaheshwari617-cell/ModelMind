import {
  NumericRow,
} from "../types/regularization";

interface Props {
  rows: NumericRow[];
  features: string[];
}

interface FeatureAdvice {
  feature: string;
  mean: number;
  median: number;
  skewness: number;
  recommendation: string;
}

function mean(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

function median(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 ===
    0
  ) {
    return (
      (
        sorted[middle - 1] +
        sorted[middle]
      ) / 2
    );
  }

  return sorted[middle];
}

function skewness(
  values: number[]
): number {
  if (values.length < 3) {
    return 0;
  }

  const valueMean =
    mean(values);

  const variance =
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          value - valueMean,
          2
        ),
      0
    ) / values.length;

  const std =
    Math.sqrt(variance);

  if (std < 1e-10) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          (
            value -
            valueMean
          ) / std,
          3
        ),
      0
    ) / values.length
  );
}

export default function PreprocessingAdvisor({
  rows,
  features,
}: Props) {
  const advice:
    FeatureAdvice[] =
    features.map(
      (feature) => {
        const values =
          rows
            .map(
              (row) =>
                Number(
                  row[
                    feature
                  ]
                )
            )
            .filter(
              (value) =>
                Number.isFinite(
                  value
                )
            );

        const featureMean =
          mean(values);

        const featureMedian =
          median(values);

        const featureSkew =
          skewness(values);

        const absoluteSkew =
          Math.abs(
            featureSkew
          );

        let recommendation =
          "Mean";

        if (
          absoluteSkew >= 1
        ) {
          recommendation =
            "Median";
        } else if (
          absoluteSkew >= 0.5
        ) {
          recommendation =
            "Consider Median";
        }

        return {
          feature,
          mean: featureMean,
          median:
            featureMedian,
          skewness:
            featureSkew,
          recommendation,
        };
      }
    );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            PREPROCESSING ADVISOR
          </span>

          <h2>
            Understand the feature
            distributions
          </h2>
        </div>
      </div>

      <p className="muted">
        This advisor does not change
        your dataset. It uses
        skewness to explain whether
        mean or median imputation is
        generally more appropriate
        for each numerical feature.
      </p>

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
              <th>Feature</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Skewness</th>
              <th>
                Suggested strategy
              </th>
            </tr>
          </thead>

          <tbody>
            {advice.map(
              (item) => (
                <tr
                  key={
                    item.feature
                  }
                >
                  <td>
                    {
                      item.feature
                    }
                  </td>

                  <td>
                    {item.mean.toFixed(
                      3
                    )}
                  </td>

                  <td>
                    {item.median.toFixed(
                      3
                    )}
                  </td>

                  <td>
                    {item.skewness.toFixed(
                      3
                    )}
                  </td>

                  <td>
                    <span className="feature-chip">
                      {
                        item.recommendation
                      }
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div
        className="info-box"
        style={{
          marginTop: 20,
        }}
      >
        Rule used for learning:
        |skewness| &lt; 0.5 → Mean
        is usually reasonable;
        0.5–1 → inspect the
        distribution and consider
        Median; ≥ 1 → Median is
        generally more robust to
        strong skewness and extreme
        values.
      </div>
    </section>
  );
}