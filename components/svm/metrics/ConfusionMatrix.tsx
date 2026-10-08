import type {
  ClassificationExperiment,
} from "../experiment/experimentEngine";

type Props = {
  result:
    ClassificationExperiment;
};

export default function ConfusionMatrix({
  result,
}: Props) {
  if (
    result.labels.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="experiment-block">
      <h4>
        Confusion Matrix
      </h4>

      <p className="experiment-help">
        Rows are actual classes and
        columns are predicted classes.
      </p>

      <div
        className="confusion-grid"
        style={{
          gridTemplateColumns:
            `130px repeat(${result.labels.length}, minmax(80px, 1fr))`,
        }}
      >
        <div className="confusion-heading">
          Actual ↓ / Predicted →
        </div>

        {result.labels.map(
          (label) => (
            <div
              key={`head-${label}`}
              className="confusion-heading"
            >
              {label}
            </div>
          )
        )}

        {result.labels.map(
          (
            actual,
            actualIndex
          ) => (
            <>
              <div
                key={`actual-${actual}`}
                className="confusion-heading"
              >
                {actual}
              </div>

              {result.labels.map(
                (
                  predicted,
                  predictedIndex
                ) => (
                  <div
                    key={`${actual}-${predicted}`}
                    className={
                      actualIndex ===
                      predictedIndex
                        ? "confusion-cell correct"
                        : "confusion-cell"
                    }
                  >
                    {
                      result
                        .confusionMatrix[
                          actualIndex
                        ][
                          predictedIndex
                        ]
                    }
                  </div>
                )
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}