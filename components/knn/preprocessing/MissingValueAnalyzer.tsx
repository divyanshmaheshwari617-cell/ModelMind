import type {
  ColumnSummary,
  MissingStrategy,
} from "./preprocessingMath";

interface Props {
  summaries: ColumnSummary[];

  strategy: MissingStrategy;

  onStrategyChange: (
    strategy: MissingStrategy,
  ) => void;
}

export default function MissingValueAnalyzer({
  summaries,
  strategy,
  onStrategyChange,
}: Props) {
  const columnsWithMissing =
    summaries.filter(
      (column) =>
        column.missingCount > 0,
    );

  const totalMissing =
    summaries.reduce(
      (sum, column) =>
        sum +
        column.missingCount,
      0,
    );

  return (
    <section className="knn-card">
      <div className="knn-section-heading">
        <div>
          <p className="knn-eyebrow">
            PREPROCESSING
          </p>

          <h2>
            Missing Value Analyzer
          </h2>
        </div>

        <span className="knn-badge">
          {totalMissing} missing
        </span>
      </div>

      {columnsWithMissing.length ===
      0 ? (
        <div className="knn-success-box">
          <strong>
            No missing values
            detected.
          </strong>

          <p>
            Every detected column
            currently contains a
            value for every row.
          </p>
        </div>
      ) : (
        <>
          <div className="knn-warning-box">
            <strong>
              Missing values matter
              in KNN.
            </strong>

            <p>
              KNN calculates
              distances between
              samples. A missing
              feature means that
              distance cannot be
              calculated normally.
            </p>
          </div>

          <div className="knn-table-wrap">
            <table className="knn-table">
              <thead>
                <tr>
                  <th>
                    Column
                  </th>

                  <th>
                    Missing
                  </th>

                  <th>
                    Missing %
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Median
                  </th>

                  <th>
                    Mean
                  </th>
                </tr>
              </thead>

              <tbody>
                {columnsWithMissing.map(
                  (column) => (
                    <tr
                      key={
                        column.name
                      }
                    >
                      <td>
                        {
                          column.name
                        }
                      </td>

                      <td>
                        {
                          column.missingCount
                        }
                      </td>

                      <td>
                        {column.missingPercentage.toFixed(
                          1,
                        )}
                        %
                      </td>

                      <td>
                        {column.isNumeric
                          ? "Numeric"
                          : "Categorical"}
                      </td>

                      <td>
                        {column.median ===
                        null
                          ? "—"
                          : column.median.toFixed(
                              3,
                            )}
                      </td>

                      <td>
                        {column.mean ===
                        null
                          ? "—"
                          : column.mean.toFixed(
                              3,
                            )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="knn-control-block">
        <label>
          Missing-value strategy
        </label>

        <select
          value={strategy}
          onChange={(event) =>
            onStrategyChange(
              event.target
                .value as MissingStrategy,
            )
          }
        >
          <option value="median">
            Median imputation
          </option>

          <option value="mean">
            Mean imputation
          </option>

          <option value="most-frequent">
            Most-frequent value
          </option>

          <option value="drop">
            Drop incomplete rows
          </option>
        </select>
      </div>

      <div className="knn-info-box">
        <strong>
          ModelMind recommendation
        </strong>

        <p>
          Median is a strong default
          for numerical KNN features
          because it is less affected
          by extreme values than the
          mean. You can still choose
          another strategy and see
          how the usable dataset
          changes.
        </p>
      </div>
    </section>
  );
}