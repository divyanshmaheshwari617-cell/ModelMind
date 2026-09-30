import type {
  SVMRow,
} from "../types/svm";

type Props = {
  rows: SVMRow[];
  featureColumns: string[];
  enabled: boolean;
  onEnabledChange: (
    enabled: boolean
  ) => void;
};

type FeatureRange = {
  name: string;
  minimum: number;
  maximum: number;
  range: number;
};

function calculateRanges(
  rows: SVMRow[],
  featureColumns: string[]
): FeatureRange[] {
  return featureColumns.map(
    (
      featureName,
      featureIndex
    ) => {
      const values =
        rows
          .map(
            (row) =>
              row.features[
                featureIndex
              ]
          )
          .filter(
            (value) =>
              Number.isFinite(
                value
              )
          );

      if (
        values.length === 0
      ) {
        return {
          name:
            featureName,
          minimum: 0,
          maximum: 0,
          range: 0,
        };
      }

      const minimum =
        Math.min(...values);

      const maximum =
        Math.max(...values);

      return {
        name:
          featureName,
        minimum,
        maximum,
        range:
          maximum -
          minimum,
      };
    }
  );
}

export default function ScalingAnalyzer({
  rows,
  featureColumns,
  enabled,
  onEnabledChange,
}: Props) {
  const ranges =
    calculateRanges(
      rows,
      featureColumns
    );

  const positiveRanges =
    ranges
      .map(
        (feature) =>
          feature.range
      )
      .filter(
        (range) =>
          range > 0
      );

  const largestRange =
    positiveRanges.length
      ? Math.max(
          ...positiveRanges
        )
      : 0;

  const smallestRange =
    positiveRanges.length
      ? Math.min(
          ...positiveRanges
        )
      : 0;

  const ratio =
    smallestRange > 0
      ? largestRange /
        smallestRange
      : 1;

  const scalingStronglyRecommended =
    ratio >= 10;

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
        Feature Scaling
      </h2>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        Scaling is especially
        important for SVM because
        distances, margins and
        kernel similarity can be
        dominated by features
        with much larger numeric
        ranges.
      </p>

      <div
        style={{
          display: "grid",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {ranges.map(
          (feature) => (
            <div
              key={
                feature.name
              }
              style={{
                padding: 12,
                borderRadius: 10,
                background:
                  "#020617",
              }}
            >
              <strong>
                {feature.name}
              </strong>

              <div
                style={{
                  marginTop: 5,
                  color:
                    "#94a3b8",
                  fontSize: 14,
                }}
              >
                Min:{" "}
                {feature.minimum.toFixed(
                  3
                )}{" "}
                | Max:{" "}
                {feature.maximum.toFixed(
                  3
                )}{" "}
                | Range:{" "}
                {feature.range.toFixed(
                  3
                )}
              </div>
            </div>
          )
        )}
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 10,
          background:
            scalingStronglyRecommended
              ? "#451a03"
              : "#052e16",
          marginBottom: 16,
        }}
      >
        {scalingStronglyRecommended
          ? `The largest selected feature range is about ${ratio.toFixed(
              1
            )}× the smallest. Standardization is strongly recommended.`
          : "The selected feature ranges are relatively similar, but standardization is still usually recommended for SVM."}
      </div>

      <label
        style={{
          display: "flex",
          alignItems:
            "center",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={enabled}
          onChange={(
            event
          ) =>
            onEnabledChange(
              event.target
                .checked
            )
          }
        />

        Standardize selected
        features
      </label>

      <p
        style={{
          marginBottom: 0,
          color: "#64748b",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        During final model
        evaluation, ModelMind will
        split the data first,
        calculate scaling
        statistics from the
        training set only, and
        then apply those same
        statistics to the test
        set.
      </p>
    </section>
  );
}