import {
  useMemo,
  useState,
} from "react";

import Papa from "papaparse";

import type {
  NBRow,
  NBValue,
  NaiveBayesVariant,
} from "../types/naiveBayes";

import MissingValueAnalyzer from "../preprocessing/MissingValueAnalyzer";
import FeatureTypeAnalyzer from "../preprocessing/FeatureTypeAnalyzer";

import {
  defaultNBDatasets,
  type DefaultNBDataset,
} from "../visual-learning/defaultDatasets";

type Props = {
  onUseDataset?: (
    rows: NBRow[],
    features: string[],
    targetColumn: string,
    variant: NaiveBayesVariant
  ) => void;
};

type CSVRecord = Record<
  string,
  string
>;

export default function NaiveBayesDatasetAnalyzer({
  onUseDataset,
}: Props) {
  const [rows, setRows] =
    useState<NBRow[]>([]);

  const [columns, setColumns] =
    useState<string[]>([]);

  const [
    selectedFeatures,
    setSelectedFeatures,
  ] = useState<string[]>([]);

  const [
    targetColumn,
    setTargetColumn,
  ] = useState("");

  const [variant, setVariant] =
    useState<NaiveBayesVariant>(
      "gaussian"
    );

  const [datasetName, setDatasetName] =
    useState("No dataset selected");

  const [message, setMessage] =
    useState(
      "Choose a default dataset or upload your own CSV."
    );

  const targetClasses = useMemo(
    () =>
      Array.from(
        new Set(
          rows.map(
            (row) =>
              row.target
          )
        )
      ),
    [rows]
  );

  const canUseDataset =
    rows.length > 0 &&
    selectedFeatures.length >
      0 &&
    targetColumn !== "";

  function loadDefaultDataset(
    dataset: DefaultNBDataset
  ) {
    const copiedRows =
      dataset.rows.map(
        (row) => ({
          ...row,

          features: {
            ...row.features,
          },
        })
      );

    setRows(copiedRows);

    setColumns([
      ...dataset.features,
      dataset.targetName,
    ]);

    setSelectedFeatures([
      ...dataset.features,
    ]);

    setTargetColumn(
      dataset.targetName
    );

    setVariant(
      dataset.variant
    );

    setDatasetName(
      dataset.name
    );

    setMessage(
      dataset.description
    );
  }

  function handleCSVUpload(
    file: File
  ) {
    Papa.parse<CSVRecord>(
      file,
      {
        header: true,

        skipEmptyLines: true,

        complete: (
          result
        ) => {
          const fields =
            result.meta
              .fields ?? [];

          if (
            fields.length <
            2
          ) {
            setMessage(
              "The CSV needs at least one feature column and one target column."
            );

            return;
          }

          const defaultTarget =
            fields[
              fields.length -
                1
            ];

          const defaultFeatures =
            fields.filter(
              (field) =>
                field !==
                defaultTarget
            );

          const parsedRows: NBRow[] =
            result.data.map(
              (
                record,
                index
              ) => {
                const features: Record<
                  string,
                  NBValue
                > = {};

                defaultFeatures.forEach(
                  (
                    feature
                  ) => {
                    features[
                      feature
                    ] =
                      parseCSVValue(
                        record[
                          feature
                        ]
                      );
                  }
                );

                return {
                  id:
                    index +
                    1,

                  features,

                  target:
                    String(
                      record[
                        defaultTarget
                      ] ??
                        ""
                    ).trim(),
                };
              }
            );

          setRows(
            parsedRows
          );

          setColumns(
            fields
          );

          setSelectedFeatures(
            defaultFeatures
          );

          setTargetColumn(
            defaultTarget
          );

          setVariant(
            "gaussian"
          );

          setDatasetName(
            file.name
          );

          setMessage(
            `Loaded ${parsedRows.length} rows. ModelMind initially treats the final column "${defaultTarget}" as the target. You can change it below.`
          );
        },

        error: () => {
          setMessage(
            "ModelMind could not read this CSV file."
          );
        },
      }
    );
  }

  function changeTarget(
    newTarget: string
  ) {
    if (
      newTarget ===
      targetColumn
    ) {
      return;
    }

    /*
      Reconstruct each row from
      the current features +
      current target.

      This allows the user to
      choose a different target
      after CSV upload.
    */

    const rebuiltRows =
      rows.map((row) => {
        const completeRecord: Record<
          string,
          NBValue
        > = {
          ...row.features,

          [targetColumn]:
            row.target,
        };

        const newFeatures: Record<
          string,
          NBValue
        > = {};

        columns.forEach(
          (column) => {
            if (
              column !==
              newTarget
            ) {
              newFeatures[
                column
              ] =
                completeRecord[
                  column
                ] ??
                null;
            }
          }
        );

        return {
          ...row,

          features:
            newFeatures,

          target:
            String(
              completeRecord[
                newTarget
              ] ??
                ""
            ),
        };
      });

    setRows(
      rebuiltRows
    );

    setTargetColumn(
      newTarget
    );

    setSelectedFeatures(
      columns.filter(
        (column) =>
          column !==
          newTarget
      )
    );
  }

  function toggleFeature(
    feature: string
  ) {
    setSelectedFeatures(
      (previous) => {
        if (
          previous.includes(
            feature
          )
        ) {
          return previous.filter(
            (item) =>
              item !==
              feature
          );
        }

        return [
          ...previous,
          feature,
        ];
      }
    );
  }

  const availableFeatures =
    columns.filter(
      (column) =>
        column !==
        targetColumn
    );

  return (
    <section
      style={
        containerStyle
      }
    >
      <div style={introStyle}>
        <div>
          <div
            style={
              eyebrowStyle
            }
          >
            DATASET LAB
          </div>

          <h2
            style={{
              margin:
                "5px 0 8px",
            }}
          >
            Naive Bayes Dataset
            Analyzer
          </h2>

          <p
            style={
              descriptionStyle
            }
          >
            Start with a
            meaningful default
            example or upload
            your own CSV. Then
            inspect the data
            before training.
          </p>
        </div>

        <label
          style={
            uploadStyle
          }
        >
          Upload CSV

          <input
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(
              event
            ) => {
              const file =
                event.target
                  .files?.[0];

              if (file) {
                handleCSVUpload(
                  file
                );
              }

              event.currentTarget.value =
                "";
            }}
          />
        </label>
      </div>

      <div
        style={
          defaultGridStyle
        }
      >
        <DefaultDatasetButton
          title="Gaussian NB"
          subtitle="Student performance"
          detail="Continuous numerical features"
          active={
            datasetName ===
            defaultNBDatasets
              .gaussian
              .name
          }
          onClick={() =>
            loadDefaultDataset(
              defaultNBDatasets.gaussian
            )
          }
        />

        <DefaultDatasetButton
          title="Multinomial NB"
          subtitle="Email word counts"
          detail="Count / frequency features"
          active={
            datasetName ===
            defaultNBDatasets
              .multinomial
              .name
          }
          onClick={() =>
            loadDefaultDataset(
              defaultNBDatasets.multinomial
            )
          }
        />

        <DefaultDatasetButton
          title="Bernoulli NB"
          subtitle="Email word presence"
          detail="Binary 0 / 1 features"
          active={
            datasetName ===
            defaultNBDatasets
              .bernoulli
              .name
          }
          onClick={() =>
            loadDefaultDataset(
              defaultNBDatasets.bernoulli
            )
          }
        />
      </div>

      <div
        style={
          statusStyle
        }
      >
        <strong>
          {datasetName}
        </strong>

        <span>
          {message}
        </span>
      </div>

      {rows.length >
        0 && (
        <>
          <DatasetSummary
            rows={rows}
            featureCount={
              selectedFeatures.length
            }
            targetColumn={
              targetColumn
            }
            classCount={
              targetClasses.length
            }
          />

          <section
            style={
              cardStyle
            }
          >
            <div
              style={
                eyebrowStyle
              }
            >
              MODEL SETUP
            </div>

            <h3>
              Choose target,
              features and Naive
              Bayes variant
            </h3>

            <div
              style={
                setupGridStyle
              }
            >
              <label>
                <div
                  style={
                    labelStyle
                  }
                >
                  Target column
                </div>

                <select
                  value={
                    targetColumn
                  }
                  onChange={(
                    event
                  ) =>
                    changeTarget(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                >
                  {columns.map(
                    (
                      column
                    ) => (
                      <option
                        key={
                          column
                        }
                        value={
                          column
                        }
                      >
                        {
                          column
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <div
                  style={
                    labelStyle
                  }
                >
                  Naive Bayes
                  variant
                </div>

                <select
                  value={
                    variant
                  }
                  onChange={(
                    event
                  ) =>
                    setVariant(
                      event
                        .target
                        .value as NaiveBayesVariant
                    )
                  }
                  style={
                    inputStyle
                  }
                >
                  <option value="gaussian">
                    Gaussian
                  </option>

                  <option value="multinomial">
                    Multinomial
                  </option>

                  <option value="bernoulli">
                    Bernoulli
                  </option>
                </select>
              </label>
            </div>

            <div
              style={{
                marginTop: 16,
              }}
            >
              <div
                style={
                  labelStyle
                }
              >
                Input features
              </div>

              <div
                style={
                  featureGridStyle
                }
              >
                {availableFeatures.map(
                  (
                    feature
                  ) => {
                    const selected =
                      selectedFeatures.includes(
                        feature
                      );

                    return (
                      <button
                        type="button"
                        key={
                          feature
                        }
                        onClick={() =>
                          toggleFeature(
                            feature
                          )
                        }
                        style={{
                          ...featureButtonStyle,

                          borderColor:
                            selected
                              ? "#8b5cf6"
                              : "#334155",

                          background:
                            selected
                              ? "#312e81"
                              : "#020617",
                        }}
                      >
                        <span>
                          {
                            feature
                          }
                        </span>

                        <span>
                          {selected
                            ? "✓ Selected"
                            : "Not selected"}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          {selectedFeatures.length >
            0 && (
            <>
              <MissingValueAnalyzer
                rows={rows}
                features={
                  selectedFeatures
                }
                onRowsChange={
                  setRows
                }
              />

              <FeatureTypeAnalyzer
  rows={rows}
  features={
    selectedFeatures
  }
  variant={
    variant
  }
  onVariantChange={
    setVariant
  }
/>
            </>
          )}

          <DatasetPreview
            rows={rows}
            features={
              selectedFeatures
            }
            targetColumn={
              targetColumn
            }
          />

          <section
            style={
              readyStyle
            }
          >
            <div>
              <strong>
                Ready for the
                Naive Bayes lab?
              </strong>

              <div
                style={
                  readyTextStyle
                }
              >
                ModelMind will
                use the selected
                features and
                target in the
                visualization
                and model
                training stages.
              </div>
            </div>

            <button
              type="button"
              disabled={
                !canUseDataset
              }
              style={{
                ...useButtonStyle,

                opacity:
                  canUseDataset
                    ? 1
                    : 0.45,

                cursor:
                  canUseDataset
                    ? "pointer"
                    : "not-allowed",
              }}
              onClick={() => {
                if (
                  !canUseDataset
                ) {
                  return;
                }

                onUseDataset?.(
                  rows,
                  selectedFeatures,
                  targetColumn,
                  variant
                );
              }}
            >
              Use This Dataset
            </button>
          </section>
        </>
      )}
    </section>
  );
}

function parseCSVValue(
  value:
    | string
    | undefined
): NBValue {
  if (
    value === undefined ||
    value.trim() === ""
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  const numeric =
    Number(trimmed);

  if (
    Number.isFinite(
      numeric
    )
  ) {
    return numeric;
  }

  return trimmed;
}

function DefaultDatasetButton({
  title,
  subtitle,
  detail,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  detail: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...defaultButtonStyle,

        borderColor:
          active
            ? "#8b5cf6"
            : "#334155",

        background:
          active
            ? "#312e81"
            : "#0f172a",
      }}
    >
      <strong>
        {title}
      </strong>

      <span
        style={
          defaultSubtitleStyle
        }
      >
        {subtitle}
      </span>

      <span
        style={
          defaultDetailStyle
        }
      >
        {detail}
      </span>
    </button>
  );
}

function DatasetSummary({
  rows,
  featureCount,
  targetColumn,
  classCount,
}: {
  rows: NBRow[];
  featureCount: number;
  targetColumn: string;
  classCount: number;
}) {
  const items = [
    {
      label: "Rows",
      value: rows.length,
    },
    {
      label:
        "Selected features",
      value: featureCount,
    },
    {
      label:
        "Target column",
      value:
        targetColumn ||
        "Not selected",
    },
    {
      label:
        "Target classes",
      value: classCount,
    },
  ];

  return (
    <div
      style={
        summaryGridStyle
      }
    >
      {items.map(
        (item) => (
          <div
            key={
              item.label
            }
            style={
              summaryCardStyle
            }
          >
            <div
              style={
                summaryLabelStyle
              }
            >
              {item.label}
            </div>

            <strong>
              {item.value}
            </strong>
          </div>
        )
      )}
    </div>
  );
}

function DatasetPreview({
  rows,
  features,
  targetColumn,
}: {
  rows: NBRow[];
  features: string[];
  targetColumn: string;
}) {
  const preview =
    rows.slice(0, 8);

  return (
    <section
      style={cardStyle}
    >
      <div
        style={eyebrowStyle}
      >
        DATA PREVIEW
      </div>

      <h3>
        What does each row
        represent?
      </h3>

      <p
        style={
          descriptionStyle
        }
      >
        Each row is one
        observation. The
        selected features are
        the information given
        to Naive Bayes, while{" "}
        <strong>
          {targetColumn}
        </strong>{" "}
        is what the model tries
        to predict.
      </p>

      <div
        style={
          tableWrapperStyle
        }
      >
        <table
          style={
            tableStyle
          }
        >
          <thead>
            <tr>
              <th
                style={
                  cellStyle
                }
              >
                ID
              </th>

              {features.map(
                (
                  feature
                ) => (
                  <th
                    key={
                      feature
                    }
                    style={
                      cellStyle
                    }
                  >
                    {
                      feature
                    }
                  </th>
                )
              )}

              <th
                style={
                  targetCellStyle
                }
              >
                {
                  targetColumn
                }
              </th>
            </tr>
          </thead>

          <tbody>
            {preview.map(
              (row) => (
                <tr
                  key={
                    row.id
                  }
                >
                  <td
                    style={
                      cellStyle
                    }
                  >
                    {
                      row.id
                    }
                  </td>

                  {features.map(
                    (
                      feature
                    ) => (
                      <td
                        key={
                          feature
                        }
                        style={
                          cellStyle
                        }
                      >
                        {row
                          .features[
                          feature
                        ] ===
                        null
                          ? "Missing"
                          : String(
                              row
                                .features[
                                feature
                              ]
                            )}
                      </td>
                    )
                  )}

                  <td
                    style={
                      targetCellStyle
                    }
                  >
                    {
                      row.target
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const containerStyle = {
  display: "grid",
  gap: 14,
};

const introStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap" as const,
  padding: 18,
  borderRadius: 18,
  background: "#0f172a",
  border:
    "1px solid #334155",
};

const eyebrowStyle = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
  color: "#a78bfa",
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const uploadStyle = {
  padding:
    "11px 16px",
  borderRadius: 10,
  background: "#7c3aed",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const defaultGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 10,
};

const defaultButtonStyle = {
  textAlign:
    "left" as const,
  padding: 15,
  borderRadius: 13,
  border:
    "1px solid #334155",
  color: "#f8fafc",
  cursor: "pointer",
  display: "grid",
  gap: 6,
};

const defaultSubtitleStyle = {
  color: "#cbd5e1",
  fontSize: 13,
};

const defaultDetailStyle = {
  color: "#64748b",
  fontSize: 12,
};

const statusStyle = {
  display: "grid",
  gap: 5,
  padding: 13,
  borderRadius: 11,
  background: "#020617",
  border:
    "1px solid #1e293b",
  color: "#cbd5e1",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 9,
};

const summaryCardStyle = {
  padding: 13,
  borderRadius: 11,
  background: "#0f172a",
  border:
    "1px solid #334155",
};

const summaryLabelStyle = {
  color: "#64748b",
  fontSize: 11,
  marginBottom: 5,
};

const cardStyle = {
  padding: 18,
  borderRadius: 16,
  background: "#0f172a",
  border:
    "1px solid #334155",
};

const setupGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const labelStyle = {
  marginBottom: 6,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 9,
  border:
    "1px solid #475569",
  background: "#020617",
  color: "#f8fafc",
};

const featureGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 8,
};

const featureButtonStyle = {
  padding: 11,
  borderRadius: 9,
  border:
    "1px solid #334155",
  color: "#e2e8f0",
  cursor: "pointer",
  display: "flex",
  justifyContent:
    "space-between",
  gap: 8,
};

const tableWrapperStyle = {
  overflowX:
    "auto" as const,
};

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse" as const,
  minWidth: 600,
};

const cellStyle = {
  padding: 9,
  borderBottom:
    "1px solid #1e293b",
  textAlign:
    "left" as const,
  color: "#cbd5e1",
  fontSize: 13,
};

const targetCellStyle = {
  ...cellStyle,
  color: "#c4b5fd",
  fontWeight: 700,
};

const readyStyle = {
  padding: 17,
  borderRadius: 14,
  border:
    "1px solid #4c1d95",
  background: "#1e1b4b",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap" as const,
};

const readyTextStyle = {
  color: "#cbd5e1",
  marginTop: 5,
  fontSize: 13,
};

const useButtonStyle = {
  padding:
    "11px 16px",
  borderRadius: 10,
  border: "none",
  background: "#8b5cf6",
  color: "white",
  fontWeight: 900,
};