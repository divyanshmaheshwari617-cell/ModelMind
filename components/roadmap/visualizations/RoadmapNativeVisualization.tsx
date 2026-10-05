"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  getVisualizationContent,
  type NativeVisualizationContent,
} from "../../../data/roadmap/visualizations";

interface RoadmapNativeVisualizationProps {
  visualizationId?: string;
  title?: string;
  description?: string;
  skillId: string;
}

interface InteractiveLabProps {
  visualizationId?: string;
}

/* =========================================================
   SHARED HELPERS
   ========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function mean(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

function standardDeviation(
  values: number[]
) {
  if (values.length === 0) {
    return 0;
  }

  const average = mean(values);

  const variance =
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          value - average,
          2
        ),
      0
    ) / values.length;

  return Math.sqrt(variance);
}

function minMaxScale(
  values: number[]
) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  if (minimum === maximum) {
    return values.map(() => 0);
  }

  return values.map(
    (value) =>
      (value - minimum) /
      (maximum - minimum)
  );
}

function standardScale(
  values: number[]
) {
  const average = mean(values);
  const std =
    standardDeviation(values);

  if (std === 0) {
    return values.map(() => 0);
  }

  return values.map(
    (value) =>
      (value - average) / std
  );
}

function median(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle = Math.floor(
    sorted.length / 2
  );

  if (
    sorted.length % 2 === 0
  ) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
}

function formatNumber(
  value: number,
  digits = 2
) {
  return Number.isFinite(value)
    ? value.toFixed(digits)
    : "0.00";
}

/* =========================================================
   PYTHON EXECUTION LAB
   ========================================================= */

function PythonExecutionLab() {
  const [step, setStep] =
    useState(0);

  const steps = [
    {
      code: "x = 10",
      memory: ["x = 10"],
      output: "No output",
      explanation:
        "Python evaluates 10 and binds the name x to that integer object.",
    },
    {
      code: "y = x * 2",
      memory: [
        "x = 10",
        "y = 20",
      ],
      output: "No output",
      explanation:
        "Python reads x, calculates 10 × 2 and binds y to 20.",
    },
    {
      code: "x = x + 5",
      memory: [
        "x = 15",
        "y = 20",
      ],
      output: "No output",
      explanation:
        "The old value of x is read first. Python calculates 15 and then rebinds x.",
    },
    {
      code: "print(x, y)",
      memory: [
        "x = 15",
        "y = 20",
      ],
      output: "15 20",
      explanation:
        "print reads the current values and sends them to output.",
    },
  ];

  const active =
    steps[
      clamp(
        step,
        0,
        steps.length - 1
      )
    ];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Execution explorer"
        value={`Step ${step + 1}/${steps.length}`}
      />

      <div className="native-viz-three-column">
        <Panel title="CURRENT STATEMENT">
          <pre>
            <code>{active.code}</code>
          </pre>
        </Panel>

        <Panel title="MEMORY">
          {active.memory.map(
            (item) => (
              <div key={item}>
                <strong>{item}</strong>
              </div>
            )
          )}
        </Panel>

        <Panel title="OUTPUT">
          <strong>
            {active.output}
          </strong>
        </Panel>
      </div>

      <Explanation>
        {active.explanation}
      </Explanation>

      <StepButtons
        current={step}
        maximum={steps.length - 1}
        onChange={setStep}
      />
    </div>
  );
}

/* =========================================================
   PYTHON DATA STRUCTURE LAB
   ========================================================= */

function DataStructureLab() {
  const [selected, setSelected] =
    useState<
      | "list"
      | "tuple"
      | "dictionary"
      | "set"
    >("list");

  const structures = {
    list: {
      syntax:
        "[10, 20, 20, 30]",
      ordered: "Yes",
      mutable: "Yes",
      duplicates: "Yes",
      access: "Index",
      use:
        "Ordered collection that may change.",
    },

    tuple: {
      syntax:
        "(10, 20, 20, 30)",
      ordered: "Yes",
      mutable: "No",
      duplicates: "Yes",
      access: "Index",
      use:
        "Fixed ordered collection.",
    },

    dictionary: {
      syntax:
        "{'name': 'ModelMind', 'level': 'Advanced'}",
      ordered:
        "Insertion ordered",
      mutable: "Yes",
      duplicates:
        "Keys must be unique",
      access: "Key",
      use:
        "Fast key-value lookup.",
    },

    set: {
      syntax:
        "{10, 20, 30}",
      ordered:
        "No positional indexing",
      mutable: "Yes",
      duplicates: "No",
      access:
        "Membership",
      use:
        "Unique values and membership tests.",
    },
  };

  const active =
    structures[selected];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Data structure explorer"
        value={selected.toUpperCase()}
      />

      <div className="native-viz-actions">
        {(
          Object.keys(
            structures
          ) as Array<
            keyof typeof structures
          >
        ).map((key) => (
          <button
            type="button"
            key={key}
            className={
              selected === key
                ? "active"
                : ""
            }
            onClick={() =>
              setSelected(key)
            }
          >
            {key}
          </button>
        ))}
      </div>

      <Panel title="PYTHON REPRESENTATION">
        <pre>
          <code>
            {active.syntax}
          </code>
        </pre>
      </Panel>

      <div className="native-viz-insight-grid">
        <Metric
          label="Ordered"
          value={active.ordered}
        />

        <Metric
          label="Mutable"
          value={active.mutable}
        />

        <Metric
          label="Duplicates"
          value={active.duplicates}
        />

        <Metric
          label="Access"
          value={active.access}
        />
      </div>

      <Explanation>
        {active.use}
      </Explanation>
    </div>
  );
}

/* =========================================================
   FUNCTION CALL LAB
   ========================================================= */

function FunctionCallLab() {
  const [step, setStep] =
    useState(0);

  const steps = [
    {
      title: "Function definition",
      code:
        "def calculate_total(price, quantity):",
      detail:
        "price and quantity are parameters.",
    },
    {
      title: "Function call",
      code:
        "calculate_total(50, 3)",
      detail:
        "50 and 3 are arguments supplied by the caller.",
    },
    {
      title: "Local calculation",
      code:
        "total = price * quantity",
      detail:
        "Inside the function, total becomes 150.",
    },
    {
      title: "Return",
      code:
        "return total",
      detail:
        "150 is returned to the caller.",
    },
  ];

  const active =
    steps[step];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Function call explorer"
        value={`${step + 1}/${steps.length}`}
      />

      <Panel title={active.title}>
        <pre>
          <code>{active.code}</code>
        </pre>
      </Panel>

      <Explanation>
        {active.detail}
      </Explanation>

      <StepButtons
        current={step}
        maximum={steps.length - 1}
        onChange={setStep}
      />
    </div>
  );
}

/* =========================================================
   GENERIC PROCESS LAB
   ========================================================= */

function ProcessLab({
  stages,
  label,
}: {
  stages: string[];
  label: string;
}) {
  const [stage, setStage] =
    useState(0);

  return (
    <div className="native-viz-content">
      <LabToolbar
        label={label}
        value={`${stage + 1}/${stages.length}`}
      />

      <div className="native-viz-pipeline">
        {stages.map(
          (item, index) => (
            <button
              type="button"
              key={item}
              className={
                index === stage
                  ? "native-viz-pipeline-node active"
                  : index < stage
                    ? "native-viz-pipeline-node complete"
                    : "native-viz-pipeline-node"
              }
              onClick={() =>
                setStage(index)
              }
            >
              <span>
                {index + 1}
              </span>

              {item}
            </button>
          )
        )}
      </div>

      <Explanation>
        <strong>
          Current stage:
        </strong>{" "}
        {stages[stage]}
      </Explanation>

      <StepButtons
        current={stage}
        maximum={stages.length - 1}
        onChange={setStage}
      />
    </div>
  );
}

/* =========================================================
   NUMPY BROADCASTING
   ========================================================= */

function NumpyBroadcastingLab() {
  const [scalar, setScalar] =
    useState(10);

  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  const transformed =
    matrix.map((row) =>
      row.map(
        (value) =>
          value + scalar
      )
    );

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="NumPy broadcasting"
        value={`+ ${scalar}`}
      />

      <label className="native-viz-slider">
        <span>
          Broadcast scalar
        </span>

        <input
          type="range"
          min="-10"
          max="20"
          value={scalar}
          onChange={(event) =>
            setScalar(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>{scalar}</strong>
      </label>

      <div className="native-viz-three-column">
        <Panel title="ORIGINAL ARRAY">
          <Matrix values={matrix} />
        </Panel>

        <Panel title="BROADCAST">
          <strong>
            + {scalar}
          </strong>
        </Panel>

        <Panel title="RESULT">
          <Matrix
            values={transformed}
          />
        </Panel>
      </div>

      <Explanation>
        NumPy conceptually applies
        the scalar to every element
        without requiring you to
        manually write a nested
        Python loop.
      </Explanation>
    </div>
  );
}

/* =========================================================
   PANDAS OPERATIONS
   ========================================================= */

function PandasLab() {
  const [
    minimumScore,
    setMinimumScore,
  ] = useState(70);

  const rows = [
    {
      name: "Aarav",
      course: "ML",
      score: 82,
    },
    {
      name: "Diya",
      course: "AI",
      score: 67,
    },
    {
      name: "Kabir",
      course: "ML",
      score: 91,
    },
    {
      name: "Meera",
      course: "AI",
      score: 74,
    },
  ];

  const filtered =
    rows.filter(
      (row) =>
        row.score >=
        minimumScore
    );

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="DataFrame filtering"
        value={`${filtered.length}/${rows.length} rows`}
      />

      <label className="native-viz-slider">
        <span>
          Minimum score
        </span>

        <input
          type="range"
          min="50"
          max="95"
          value={minimumScore}
          onChange={(event) =>
            setMinimumScore(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {minimumScore}
        </strong>
      </label>

      <DataTable
        headers={[
          "Name",
          "Course",
          "Score",
        ]}
        rows={filtered.map(
          (row) => [
            row.name,
            row.course,
            row.score,
          ]
        )}
      />

      <Explanation>
        Equivalent idea:
        {" "}
        <code>
          df[df["score"] &gt;=
          {minimumScore}]
        </code>
      </Explanation>
    </div>
  );
}

/* =========================================================
   DATA QUALITY / CLEANING
   ========================================================= */

function DataQualityLab() {
  const [
    fixMissing,
    setFixMissing,
  ] = useState(false);

  const [
    fixDuplicate,
    setFixDuplicate,
  ] = useState(false);

  const [
    fixCategory,
    setFixCategory,
  ] = useState(false);

  const issues =
    Number(!fixMissing) +
    Number(!fixDuplicate) +
    Number(!fixCategory);

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Data quality inspector"
        value={`${issues} issue${issues === 1 ? "" : "s"}`}
      />

      <DataTable
        headers={[
          "Name",
          "Age",
          "City",
          "Issue",
        ]}
        rows={[
          [
            "A",
            fixMissing
              ? "29"
              : "Missing",
            "Delhi",
            fixMissing
              ? "Fixed"
              : "Missing value",
          ],
          [
            "B",
            "31",
            fixCategory
              ? "Delhi"
              : "delhi",
            fixCategory
              ? "Fixed"
              : "Inconsistent category",
          ],
          [
            "B",
            "31",
            "Delhi",
            fixDuplicate
              ? "Removed"
              : "Possible duplicate",
          ],
        ]}
      />

      <div className="native-viz-actions">
        <button
          type="button"
          onClick={() =>
            setFixMissing(
              (value) => !value
            )
          }
        >
          {fixMissing
            ? "Undo imputation"
            : "Fix missing"}
        </button>

        <button
          type="button"
          onClick={() =>
            setFixCategory(
              (value) => !value
            )
          }
        >
          {fixCategory
            ? "Undo category fix"
            : "Standardize category"}
        </button>

        <button
          type="button"
          onClick={() =>
            setFixDuplicate(
              (value) => !value
            )
          }
        >
          {fixDuplicate
            ? "Restore duplicate"
            : "Remove duplicate"}
        </button>
      </div>

      <div className="native-viz-insight-grid">
        <Metric
          label="Remaining issues"
          value={String(issues)}
        />

        <Metric
          label="Status"
          value={
            issues === 0
              ? "Ready"
              : "Needs attention"
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   EDA LAB
   ========================================================= */

function EdaLab() {
  const [feature, setFeature] =
    useState<
      "age" | "income"
    >("age");

  const datasets = {
    age: [
      18, 22, 25, 27, 30,
      32, 35, 38, 42, 48,
    ],

    income: [
      22, 28, 32, 35, 41,
      45, 52, 63, 82, 120,
    ],
  };

  const values =
    datasets[feature];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="EDA distribution explorer"
        value={feature}
      />

      <div className="native-viz-actions">
        <button
          type="button"
          className={
            feature === "age"
              ? "active"
              : ""
          }
          onClick={() =>
            setFeature("age")
          }
        >
          Age
        </button>

        <button
          type="button"
          className={
            feature === "income"
              ? "active"
              : ""
          }
          onClick={() =>
            setFeature("income")
          }
        >
          Income
        </button>
      </div>

      <BarValues
        values={values}
      />

      <div className="native-viz-insight-grid">
        <Metric
          label="Mean"
          value={formatNumber(
            mean(values)
          )}
        />

        <Metric
          label="Median"
          value={formatNumber(
            median(values)
          )}
        />

        <Metric
          label="Minimum"
          value={String(
            Math.min(...values)
          )}
        />

        <Metric
          label="Maximum"
          value={String(
            Math.max(...values)
          )}
        />
      </div>

      <Explanation>
        Switch variables and compare
        how their center, range and
        distribution shape differ.
        EDA is about interpreting
        these patterns, not simply
        generating charts.
      </Explanation>
    </div>
  );
}

/* =========================================================
   STATISTICS LAB
   ========================================================= */

function StatisticsLab() {
  const [outlier, setOutlier] =
    useState(50);

  const values = [
    30,
    32,
    35,
    38,
    outlier,
  ];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Distribution & outlier explorer"
        value={`Outlier = ${outlier}`}
      />

      <label className="native-viz-slider">
        <span>
          Move extreme observation
        </span>

        <input
          type="range"
          min="40"
          max="500"
          value={outlier}
          onChange={(event) =>
            setOutlier(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {outlier}
        </strong>
      </label>

      <BarValues
        values={values}
      />

      <div className="native-viz-insight-grid">
        <Metric
          label="Mean"
          value={formatNumber(
            mean(values)
          )}
        />

        <Metric
          label="Median"
          value={formatNumber(
            median(values)
          )}
        />

        <Metric
          label="Std. deviation"
          value={formatNumber(
            standardDeviation(
              values
            )
          )}
        />
      </div>

      <Explanation>
        Move the extreme value.
        Notice how the mean and
        standard deviation respond
        much more strongly than the
        median.
      </Explanation>
    </div>
  );
}

/* =========================================================
   MISSING VALUES
   ========================================================= */

function MissingValueLab() {
  const [strategy, setStrategy] =
    useState<
      "mean" | "median" | "zero"
    >("mean");

  const known = [
    20,
    22,
    24,
    26,
    100,
  ];

  const replacement =
    strategy === "mean"
      ? mean(known)
      : strategy === "median"
        ? median(known)
        : 0;

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Imputation explorer"
        value={strategy}
      />

      <div className="native-viz-actions">
        {(
          [
            "mean",
            "median",
            "zero",
          ] as const
        ).map((item) => (
          <button
            type="button"
            key={item}
            className={
              strategy === item
                ? "active"
                : ""
            }
            onClick={() =>
              setStrategy(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      <DataTable
        headers={[
          "Row",
          "Original",
          "After",
        ]}
        rows={[
          ["1", "20", "20"],
          ["2", "22", "22"],
          [
            "3",
            "Missing",
            formatNumber(
              replacement
            ),
          ],
          ["4", "24", "24"],
          ["5", "26", "26"],
          ["6", "100", "100"],
        ]}
      />

      <Explanation>
        Mean is affected by the
        extreme value 100. Median is
        more resistant. Zero may
        introduce an artificial
        meaning if zero is a valid
        measurement.
      </Explanation>
    </div>
  );
}

/* =========================================================
   OUTLIER LAB
   ========================================================= */

function OutlierLab() {
  const [extreme, setExtreme] =
    useState(120);

  const values = [
    20,
    22,
    23,
    25,
    26,
    28,
    extreme,
  ];

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const q1 =
    sorted[
      Math.floor(
        sorted.length * 0.25
      )
    ];

  const q3 =
    sorted[
      Math.floor(
        sorted.length * 0.75
      )
    ];

  const iqr = q3 - q1;
  const upper =
    q3 + 1.5 * iqr;

  const flagged =
    extreme > upper;

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="IQR outlier explorer"
        value={
          flagged
            ? "Flagged"
            : "Not flagged"
        }
      />

      <label className="native-viz-slider">
        <span>
          Extreme observation
        </span>

        <input
          type="range"
          min="25"
          max="160"
          value={extreme}
          onChange={(event) =>
            setExtreme(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {extreme}
        </strong>
      </label>

      <BarValues
        values={values}
      />

      <div className="native-viz-insight-grid">
        <Metric
          label="Q1"
          value={formatNumber(q1)}
        />

        <Metric
          label="Q3"
          value={formatNumber(q3)}
        />

        <Metric
          label="IQR"
          value={formatNumber(iqr)}
        />

        <Metric
          label="Upper fence"
          value={formatNumber(
            upper
          )}
        />
      </div>

      <Explanation>
        The IQR rule flags values for
        investigation. A flagged
        value is not automatically an
        error and should not
        automatically be deleted.
      </Explanation>
    </div>
  );
}

/* =========================================================
   FEATURE SCALING
   ========================================================= */

function FeatureScalingLab() {
  const [method, setMethod] =
    useState<
      | "original"
      | "standard"
      | "minmax"
    >("original");

  const ages = [
    22,
    30,
    45,
    50,
  ];

  const salaries = [
    25000,
    60000,
    150000,
    200000,
  ];

  const transformedAges =
    method === "standard"
      ? standardScale(ages)
      : method === "minmax"
        ? minMaxScale(ages)
        : ages;

  const transformedSalaries =
    method === "standard"
      ? standardScale(
          salaries
        )
      : method === "minmax"
        ? minMaxScale(
            salaries
          )
        : salaries;

  const distanceBefore =
    Math.sqrt(
      Math.pow(
        ages[1] - ages[0],
        2
      ) +
        Math.pow(
          salaries[1] -
            salaries[0],
          2
        )
    );

  const distanceAfter =
    Math.sqrt(
      Math.pow(
        transformedAges[1] -
          transformedAges[0],
        2
      ) +
        Math.pow(
          transformedSalaries[1] -
            transformedSalaries[0],
        2
      )
    );

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Scaling & distance"
        value={method}
      />

      <div className="native-viz-actions">
        {(
          [
            "original",
            "standard",
            "minmax",
          ] as const
        ).map((item) => (
          <button
            type="button"
            key={item}
            className={
              method === item
                ? "active"
                : ""
            }
            onClick={() =>
              setMethod(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      <DataTable
        headers={[
          "Age",
          "Salary",
          "Scaled age",
          "Scaled salary",
        ]}
        rows={ages.map(
          (age, index) => [
            age,
            salaries[index],
            formatNumber(
              transformedAges[
                index
              ]
            ),
            formatNumber(
              transformedSalaries[
                index
              ]
            ),
          ]
        )}
      />

      <div className="native-viz-insight-grid">
        <Metric
          label="Original distance"
          value={formatNumber(
            distanceBefore
          )}
        />

        <Metric
          label="Displayed distance"
          value={formatNumber(
            distanceAfter
          )}
        />
      </div>

      <Explanation>
        Before scaling, salary
        dominates Euclidean distance
        because its numerical range
        is much larger. Scaling
        changes the geometry used by
        distance-based algorithms.
      </Explanation>
    </div>
  );
}

/* =========================================================
   ENCODING
   ========================================================= */

function EncodingLab() {
  const [method, setMethod] =
    useState<
      "ordinal" | "onehot"
    >("onehot");

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Categorical encoding"
        value={method}
      />

      <div className="native-viz-actions">
        <button
          type="button"
          className={
            method === "ordinal"
              ? "active"
              : ""
          }
          onClick={() =>
            setMethod("ordinal")
          }
        >
          Integer encoding
        </button>

        <button
          type="button"
          className={
            method === "onehot"
              ? "active"
              : ""
          }
          onClick={() =>
            setMethod("onehot")
          }
        >
          One-hot encoding
        </button>
      </div>

      {method === "ordinal" ? (
        <DataTable
          headers={[
            "Color",
            "Encoded",
          ]}
          rows={[
            ["Red", 1],
            ["Green", 2],
            ["Blue", 3],
          ]}
        />
      ) : (
        <DataTable
          headers={[
            "Color",
            "Red",
            "Green",
            "Blue",
          ]}
          rows={[
            [
              "Red",
              1,
              0,
              0,
            ],
            [
              "Green",
              0,
              1,
              0,
            ],
            [
              "Blue",
              0,
              0,
              1,
            ],
          ]}
        />
      )}

      <Explanation>
        Arbitrary integers can imply
        an order and distance that
        nominal categories do not
        possess. One-hot encoding
        avoids that artificial
        ordering.
      </Explanation>
    </div>
  );
}

/* =========================================================
   FEATURE ENGINEERING / SELECTION
   ========================================================= */

function FeatureEngineeringLab() {
  const [height, setHeight] =
    useState(175);

  const [weight, setWeight] =
    useState(70);

  const meters =
    height / 100;

  const bmi =
    weight /
    (meters * meters);

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Feature engineering"
        value={`BMI ${formatNumber(bmi, 1)}`}
      />

      <label className="native-viz-slider">
        <span>
          Height (cm)
        </span>

        <input
          type="range"
          min="140"
          max="210"
          value={height}
          onChange={(event) =>
            setHeight(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>{height}</strong>
      </label>

      <label className="native-viz-slider">
        <span>
          Weight (kg)
        </span>

        <input
          type="range"
          min="40"
          max="150"
          value={weight}
          onChange={(event) =>
            setWeight(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>{weight}</strong>
      </label>

      <div className="native-viz-three-column">
        <Metric
          label="Height"
          value={`${height} cm`}
        />

        <Metric
          label="Weight"
          value={`${weight} kg`}
        />

        <Metric
          label="Derived BMI"
          value={formatNumber(
            bmi,
            1
          )}
        />
      </div>

      <Explanation>
        Feature engineering combines
        raw measurements into a
        representation that may
        expose useful domain
        structure more directly.
      </Explanation>
    </div>
  );
}

function FeatureSelectionLab() {
  const initialFeatures = [
    {
      name: "Age",
      score: 0.62,
    },
    {
      name: "Income",
      score: 0.81,
    },
    {
      name: "Customer ID",
      score: 0.03,
    },
    {
      name: "Tenure",
      score: 0.74,
    },
    {
      name: "Random noise",
      score: 0.01,
    },
  ];

  const [threshold, setThreshold] =
    useState(0.2);

  const selected =
    initialFeatures.filter(
      (feature) =>
        feature.score >=
        threshold
    );

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Feature selection"
        value={`${selected.length}/${initialFeatures.length} selected`}
      />

      <label className="native-viz-slider">
        <span>
          Importance threshold
        </span>

        <input
          type="range"
          min="0"
          max="0.9"
          step="0.05"
          value={threshold}
          onChange={(event) =>
            setThreshold(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {threshold.toFixed(2)}
        </strong>
      </label>

      <DataTable
        headers={[
          "Feature",
          "Illustrative score",
          "Decision",
        ]}
        rows={initialFeatures.map(
          (feature) => [
            feature.name,
            feature.score.toFixed(
              2
            ),
            feature.score >=
            threshold
              ? "Keep"
              : "Remove",
          ]
        )}
      />

      <Explanation>
        This is an illustrative
        selection score. Real feature
        selection must happen inside
        the validation procedure when
        the selection method learns
        from data.
      </Explanation>
    </div>
  );
}

/* =========================================================
   PIPELINE / PREPROCESSING
   ========================================================= */

function PipelineBuilderLab() {
  const [stage, setStage] =
    useState(0);

  const stages = [
    "Raw Dataset",
    "Train/Test Split",
    "Numeric: SimpleImputer",
    "Numeric: StandardScaler",
    "Categorical: SimpleImputer",
    "Categorical: OneHotEncoder",
    "ColumnTransformer",
    "Pipeline",
    "Estimator",
    "Cross-Validation",
  ];

  return (
    <ProcessLab
      stages={stages}
      label="Leakage-safe pipeline"
    />
  );
}

/* =========================================================
   TRAIN / VALIDATION / TEST
   ========================================================= */

function TrainTestLab() {
  const [
    trainPercent,
    setTrainPercent,
  ] = useState(70);

  const validation = 15;

  const safeTrain =
    Math.min(
      trainPercent,
      80
    );

  const safeTest =
    100 -
    safeTrain -
    validation;

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Dataset splitting"
        value={`${safeTrain}/${validation}/${safeTest}`}
      />

      <label className="native-viz-slider">
        <span>
          Training percentage
        </span>

        <input
          type="range"
          min="50"
          max="80"
          value={safeTrain}
          onChange={(event) =>
            setTrainPercent(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {safeTrain}%
        </strong>
      </label>

      <div className="native-viz-insight-grid">
        <Metric
          label="Training"
          value={`${safeTrain}%`}
        />

        <Metric
          label="Validation"
          value={`${validation}%`}
        />

        <Metric
          label="Test"
          value={`${safeTest}%`}
        />
      </div>

      <Explanation>
        Training learns parameters.
        Validation guides development.
        The test set remains outside
        repeated model-selection
        decisions.
      </Explanation>
    </div>
  );
}

/* =========================================================
   DATA LEAKAGE
   ========================================================= */

function LeakageLab() {
  const [
    scaleBeforeSplit,
    setScaleBeforeSplit,
  ] = useState(false);

  const [
    futureFeature,
    setFutureFeature,
  ] = useState(false);

  const [
    duplicateAcrossSplit,
    setDuplicateAcrossSplit,
  ] = useState(false);

  const count =
    Number(scaleBeforeSplit) +
    Number(futureFeature) +
    Number(
      duplicateAcrossSplit
    );

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Leakage simulator"
        value={`${count} leakage source${count === 1 ? "" : "s"}`}
      />

      <div className="native-viz-actions">
        <ToggleButton
          active={
            scaleBeforeSplit
          }
          label="Scale before split"
          onClick={() =>
            setScaleBeforeSplit(
              (value) => !value
            )
          }
        />

        <ToggleButton
          active={futureFeature}
          label="Use future feature"
          onClick={() =>
            setFutureFeature(
              (value) => !value
            )
          }
        />

        <ToggleButton
          active={
            duplicateAcrossSplit
          }
          label="Duplicate across split"
          onClick={() =>
            setDuplicateAcrossSplit(
              (value) => !value
            )
          }
        />
      </div>

      <Panel title="VALIDATION TRUST">
        <strong>
          {count === 0
            ? "High - no simulated leakage"
            : count === 1
              ? "Compromised"
              : "Severely compromised"}
        </strong>
      </Panel>

      <Explanation>
        Leakage can make validation
        scores look better while
        making the experiment less
        trustworthy.
      </Explanation>
    </div>
  );
}

/* =========================================================
   BIAS VARIANCE
   ========================================================= */

function BiasVarianceLab() {
  const [
    complexity,
    setComplexity,
  ] = useState(5);

  const trainingScore =
    60 + complexity * 4;

  const validationScore =
    62 +
    complexity * 5 -
    Math.pow(
      complexity - 5,
      2
    ) *
      1.8;

  const state =
    complexity <= 3
      ? "Underfitting"
      : complexity <= 6
        ? "Balanced region"
        : "Overfitting risk";

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Bias-variance explorer"
        value={state}
      />

      <label className="native-viz-slider">
        <span>
          Model complexity
        </span>

        <input
          type="range"
          min="1"
          max="10"
          value={complexity}
          onChange={(event) =>
            setComplexity(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {complexity}
        </strong>
      </label>

      <div className="native-viz-insight-grid">
        <Metric
          label="Illustrative training score"
          value={`${Math.min(trainingScore, 99).toFixed(1)}%`}
        />

        <Metric
          label="Illustrative validation score"
          value={`${Math.max(50, validationScore).toFixed(1)}%`}
        />

        <Metric
          label="Diagnosis"
          value={state}
        />
      </div>

      <Explanation>
        Training performance tends to
        improve with flexibility.
        Validation performance can
        eventually deteriorate if the
        model begins fitting sample
        noise.
      </Explanation>
    </div>
  );
}

/* =========================================================
   CROSS VALIDATION
   ========================================================= */

function CrossValidationLab() {
  const [fold, setFold] =
    useState(0);

  const folds = [0, 1, 2, 3, 4];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="5-fold cross-validation"
        value={`Fold ${fold + 1}`}
      />

      <div className="native-viz-workflow">
        {folds.map((item) => (
          <button
            type="button"
            key={item}
            className={
              item === fold
                ? "native-viz-pipeline-node active"
                : "native-viz-pipeline-node complete"
            }
            onClick={() =>
              setFold(item)
            }
          >
            <span>
              Fold {item + 1}
            </span>

            {item === fold
              ? "Validation"
              : "Training"}
          </button>
        ))}
      </div>

      <Explanation>
        Fold {fold + 1} is held out
        for validation. The remaining
        four folds train the complete
        workflow. Rotate through all
        folds to evaluate the
        procedure repeatedly.
      </Explanation>

      <StepButtons
        current={fold}
        maximum={4}
        onChange={setFold}
      />
    </div>
  );
}

/* =========================================================
   HYPERPARAMETER SEARCH
   ========================================================= */

function HyperparameterLab() {
  const [candidate, setCandidate] =
    useState(0);

  const candidates = [
    {
      value: "C = 0.01",
      score: 0.81,
    },
    {
      value: "C = 0.1",
      score: 0.86,
    },
    {
      value: "C = 1",
      score: 0.89,
    },
    {
      value: "C = 10",
      score: 0.87,
    },
  ];

  const active =
    candidates[candidate];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Hyperparameter search"
        value={active.value}
      />

      <div className="native-viz-actions">
        {candidates.map(
          (item, index) => (
            <button
              type="button"
              key={item.value}
              className={
                candidate === index
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCandidate(index)
              }
            >
              {item.value}
            </button>
          )
        )}
      </div>

      <Panel title="ILLUSTRATIVE CV SCORE">
        <strong>
          {(
            active.score * 100
          ).toFixed(1)}
          %
        </strong>
      </Panel>

      <Explanation>
        Hyperparameters are compared
        through validation evidence.
        The final test set should not
        be repeatedly used to select
        the configuration.
      </Explanation>
    </div>
  );
}

/* =========================================================
   CLASSIFICATION METRICS
   ========================================================= */

function ClassificationMetricsLab() {
  const [tp, setTp] =
    useState(40);

  const [fp, setFp] =
    useState(10);

  const [fn, setFn] =
    useState(8);

  const tn = 42;

  const accuracy =
    (tp + tn) /
    (tp + tn + fp + fn);

  const precision =
    tp + fp === 0
      ? 0
      : tp / (tp + fp);

  const recall =
    tp + fn === 0
      ? 0
      : tp / (tp + fn);

  const f1 =
    precision + recall === 0
      ? 0
      : (2 *
          precision *
          recall) /
        (precision + recall);

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Confusion matrix"
        value="Interactive"
      />

      <div className="native-viz-confusion-grid">
        <Metric
          label="True Positive"
          value={String(tp)}
        />

        <Metric
          label="False Positive"
          value={String(fp)}
        />

        <Metric
          label="False Negative"
          value={String(fn)}
        />

        <Metric
          label="True Negative"
          value={String(tn)}
        />
      </div>

      <MetricSlider
        label="True positives"
        value={tp}
        onChange={setTp}
      />

      <MetricSlider
        label="False positives"
        value={fp}
        onChange={setFp}
      />

      <MetricSlider
        label="False negatives"
        value={fn}
        onChange={setFn}
      />

      <div className="native-viz-insight-grid">
        <Metric
          label="Accuracy"
          value={`${(accuracy * 100).toFixed(1)}%`}
        />

        <Metric
          label="Precision"
          value={`${(precision * 100).toFixed(1)}%`}
        />

        <Metric
          label="Recall"
          value={`${(recall * 100).toFixed(1)}%`}
        />

        <Metric
          label="F1"
          value={`${(f1 * 100).toFixed(1)}%`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   CLUSTERING EVALUATION
   ========================================================= */

function ClusteringEvaluationLab() {
  const [
    separation,
    setSeparation,
  ] = useState(60);

  const [
    cohesion,
    setCohesion,
  ] = useState(70);

  const a =
    Math.max(
      1,
      100 - cohesion
    );

  const b =
    Math.max(
      1,
      separation
    );

  const silhouette =
    (b - a) /
    Math.max(a, b);

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Cluster quality"
        value={`Silhouette ${silhouette.toFixed(2)}`}
      />

      <MetricSlider
        label="Within-cluster cohesion"
        value={cohesion}
        onChange={setCohesion}
      />

      <MetricSlider
        label="Between-cluster separation"
        value={separation}
        onChange={setSeparation}
      />

      <div className="native-viz-insight-grid">
        <Metric
          label="a(i)"
          value={formatNumber(a)}
        />

        <Metric
          label="b(i)"
          value={formatNumber(b)}
        />

        <Metric
          label="Silhouette"
          value={silhouette.toFixed(
            2
          )}
        />
      </div>

      <Explanation>
        Better cohesion reduces
        average within-cluster
        distance. Better separation
        increases distance to the
        nearest alternative cluster.
      </Explanation>
    </div>
  );
}

/* =========================================================
   LEARNING CURVE
   ========================================================= */

function LearningCurveLab() {
  const [
    trainingSize,
    setTrainingSize,
  ] = useState(50);

  const trainScore =
    98 -
    trainingSize * 0.08;

  const validationScore =
    62 +
    Math.sqrt(
      trainingSize
    ) *
      3;

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Learning curve"
        value={`${trainingSize}% data`}
      />

      <label className="native-viz-slider">
        <span>
          Training data used
        </span>

        <input
          type="range"
          min="10"
          max="100"
          value={trainingSize}
          onChange={(event) =>
            setTrainingSize(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {trainingSize}%
        </strong>
      </label>

      <div className="native-viz-insight-grid">
        <Metric
          label="Illustrative train score"
          value={`${trainScore.toFixed(1)}%`}
        />

        <Metric
          label="Illustrative validation score"
          value={`${Math.min(validationScore, 94).toFixed(1)}%`}
        />
      </div>

      <Explanation>
        The values are illustrative,
        but the interaction shows the
        diagnostic idea: compare how
        training and validation
        behavior evolves as more
        training data becomes
        available.
      </Explanation>
    </div>
  );
}

/* =========================================================
   THRESHOLD / CALIBRATION
   ========================================================= */

function ThresholdLab() {
  const [threshold, setThreshold] =
    useState(50);

  const probabilities = [
    0.92,
    0.81,
    0.67,
    0.55,
    0.44,
    0.32,
    0.21,
    0.08,
  ];

  const positive =
    probabilities.filter(
      (probability) =>
        probability >=
        threshold / 100
    ).length;

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Decision threshold"
        value={`${threshold}%`}
      />

      <label className="native-viz-slider">
        <span>
          Positive threshold
        </span>

        <input
          type="range"
          min="10"
          max="90"
          value={threshold}
          onChange={(event) =>
            setThreshold(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {threshold}%
        </strong>
      </label>

      <DataTable
        headers={[
          "Probability",
          "Prediction",
        ]}
        rows={probabilities.map(
          (probability) => [
            probability.toFixed(
              2
            ),
            probability >=
            threshold / 100
              ? "Positive"
              : "Negative",
          ]
        )}
      />

      <Explanation>
        {positive} of{" "}
        {probabilities.length}
        {" "}
        observations are currently
        classified positive. Lowering
        the threshold usually creates
        more positive predictions.
      </Explanation>
    </div>
  );
}

/* =========================================================
   IMBALANCE
   ========================================================= */

function ImbalanceLab() {
  const [
    minorityPercent,
    setMinorityPercent,
  ] = useState(5);

  const majority =
    100 - minorityPercent;

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Class imbalance"
        value={`${minorityPercent}% minority`}
      />

      <label className="native-viz-slider">
        <span>
          Minority-class percentage
        </span>

        <input
          type="range"
          min="1"
          max="50"
          value={minorityPercent}
          onChange={(event) =>
            setMinorityPercent(
              Number(
                event.target.value
              )
            )
          }
        />

        <strong>
          {minorityPercent}%
        </strong>
      </label>

      <div className="native-viz-insight-grid">
        <Metric
          label="Majority class"
          value={`${majority}%`}
        />

        <Metric
          label="Minority class"
          value={`${minorityPercent}%`}
        />

        <Metric
          label="Majority-only accuracy"
          value={`${majority}%`}
        />
      </div>

      <Explanation>
        A classifier that predicts
        only the majority class can
        achieve {majority}% accuracy
        while having zero recall for
        the minority class.
      </Explanation>
    </div>
  );
}

/* =========================================================
   INTERPRETABILITY / SHAP
   ========================================================= */

function InterpretabilityLab() {
  const [local, setLocal] =
    useState(true);

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Interpretability"
        value={
          local
            ? "Local"
            : "Global"
        }
      />

      <div className="native-viz-actions">
        <button
          type="button"
          className={
            local ? "active" : ""
          }
          onClick={() =>
            setLocal(true)
          }
        >
          Local explanation
        </button>

        <button
          type="button"
          className={
            !local ? "active" : ""
          }
          onClick={() =>
            setLocal(false)
          }
        >
          Global explanation
        </button>
      </div>

      {local ? (
        <DataTable
          headers={[
            "Feature",
            "Contribution",
          ]}
          rows={[
            ["Income", "+0.18"],
            ["Age", "+0.07"],
            ["Debt", "-0.12"],
            ["Tenure", "+0.04"],
          ]}
        />
      ) : (
        <DataTable
          headers={[
            "Feature",
            "Illustrative importance",
          ]}
          rows={[
            ["Income", "0.34"],
            ["Debt", "0.27"],
            ["Age", "0.19"],
            ["Tenure", "0.12"],
          ]}
        />
      )}

      <Explanation>
        {local
          ? "Local explanations describe factors associated with one particular prediction."
          : "Global explanations summarize broader model behavior across many observations."}
      </Explanation>
    </div>
  );
}

function ShapLab() {
  const [income, setIncome] =
    useState(15);

  const [debt, setDebt] =
    useState(-8);

  const [tenure, setTenure] =
    useState(5);

  const baseline = 50;

  const result =
    baseline +
    income +
    debt +
    tenure;

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="SHAP contribution intuition"
        value={`${result}%`}
      />

      <MetricSlider
        label="Income contribution"
        min={-20}
        max={20}
        value={income}
        onChange={setIncome}
      />

      <MetricSlider
        label="Debt contribution"
        min={-20}
        max={20}
        value={debt}
        onChange={setDebt}
      />

      <MetricSlider
        label="Tenure contribution"
        min={-20}
        max={20}
        value={tenure}
        onChange={setTenure}
      />

      <div className="native-viz-insight-grid">
        <Metric
          label="Baseline"
          value={`${baseline}%`}
        />

        <Metric
          label="Contribution sum"
          value={`${income + debt + tenure}%`}
        />

        <Metric
          label="Illustrative output"
          value={`${result}%`}
        />
      </div>

      <Explanation>
        This simplified additive
        example demonstrates the
        baseline-plus-contributions
        intuition. SHAP contributions
        are model explanations, not
        causal effects.
      </Explanation>
    </div>
  );
}

/* =========================================================
   EXPERIMENT TRACKING
   ========================================================= */

function ExperimentTrackingLab() {
  const [selected, setSelected] =
    useState(0);

  const experiments = [
    {
      name: "Run 01",
      preprocessing:
        "Basic",
      score: "0.82",
    },
    {
      name: "Run 02",
      preprocessing:
        "Scaled",
      score: "0.86",
    },
    {
      name: "Run 03",
      preprocessing:
        "Pipeline v2",
      score: "0.88",
    },
  ];

  const active =
    experiments[selected];

  return (
    <div className="native-viz-content">
      <LabToolbar
        label="Experiment tracking"
        value={active.name}
      />

      <div className="native-viz-actions">
        {experiments.map(
          (experiment, index) => (
            <button
              type="button"
              key={experiment.name}
              className={
                selected === index
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelected(index)
              }
            >
              {experiment.name}
            </button>
          )
        )}
      </div>

      <div className="native-viz-insight-grid">
        <Metric
          label="Run"
          value={active.name}
        />

        <Metric
          label="Preprocessing"
          value={
            active.preprocessing
          }
        />

        <Metric
          label="Illustrative CV score"
          value={active.score}
        />
      </div>

      <Explanation>
        Metrics become useful
        evidence only when the data,
        preprocessing, parameters and
        evaluation protocol are also
        recorded.
      </Explanation>
    </div>
  );
}

/* =========================================================
   VISUALIZATION ROUTER
   ========================================================= */

function InteractiveLab({
  visualizationId,
}: InteractiveLabProps) {
  switch (visualizationId) {
    case "python-execution-flow-explorer":
      return <PythonExecutionLab />;

    case "python-data-structure-explorer":
      return <DataStructureLab />;

    case "python-function-call-explorer":
      return <FunctionCallLab />;

    case "python-data-processing-pipeline":
      return (
        <ProcessLab
          label="Python data pipeline"
          stages={[
            "Load",
            "Validate",
            "Clean",
            "Transform",
            "Analyze",
            "Output",
          ]}
        />
      );

    case "python-exception-flow-explorer":
      return (
        <ProcessLab
          label="Exception flow"
          stages={[
            "Enter try",
            "Execute statement",
            "Exception raised",
            "Find matching except",
            "Handle error",
            "Continue / finally",
          ]}
        />
      );

    case "python-oop-object-explorer":
      return (
        <ProcessLab
          label="Object lifecycle"
          stages={[
            "Define class",
            "Create object",
            "Initialize attributes",
            "Call method",
            "Update object state",
          ]}
        />
      );

    case "python-generator-memory-explorer":
      return (
        <ProcessLab
          label="Generator execution"
          stages={[
            "Create generator",
            "Request next value",
            "Execute until yield",
            "Pause state",
            "Resume on next()",
            "StopIteration",
          ]}
        />
      );

    case "numpy-array-broadcasting-explorer":
      return (
        <NumpyBroadcastingLab />
      );

    case "pandas-dataframe-operation-explorer":
      return <PandasLab />;

    case "data-cleaning-quality-explorer":
    case "advanced-data-quality-dashboard":
      return <DataQualityLab />;

    case "eda-interactive-dashboard":
    case "advanced-eda-multivariate-lab":
    case "chart-selection-playground":
      return <EdaLab />;

    case "statistics-distribution-sampling-lab":
      return <StatisticsLab />;

    case "missing-value-imputation-lab":
      return <MissingValueLab />;

    case "outlier-detection-lab":
      return <OutlierLab />;

    case "feature-scaling-distance-lab":
      return <FeatureScalingLab />;

    case "categorical-encoding-lab":
      return <EncodingLab />;

    case "feature-engineering-playground":
      return (
        <FeatureEngineeringLab />
      );

    case "feature-selection-lab":
      return (
        <FeatureSelectionLab />
      );

    case "advanced-preprocessing-flow-lab":
    case "pipeline-column-transformer-builder":
      return <PipelineBuilderLab />;

    case "ml-foundations-workflow-explorer":
      return (
        <ProcessLab
          label="ML workflow"
          stages={[
            "Define problem",
            "Collect data",
            "EDA",
            "Split",
            "Preprocess",
            "Train",
            "Validate",
            "Test",
            "Inference",
          ]}
        />
      );

    case "train-validation-test-explorer":
      return <TrainTestLab />;

    case "data-leakage-simulator":
      return <LeakageLab />;

    case "bias-variance-complexity-explorer":
      return <BiasVarianceLab />;

    case "cross-validation-fold-explorer":
      return (
        <CrossValidationLab />
      );

    case "hyperparameter-search-explorer":
      return (
        <HyperparameterLab />
      );

    case "classification-metrics-explorer":
      return (
        <ClassificationMetricsLab />
      );

    case "clustering-evaluation-lab":
      return (
        <ClusteringEvaluationLab />
      );

    case "learning-curve-diagnostic-lab":
      return <LearningCurveLab />;

    case "model-selection-comparison-lab":
      return (
        <HyperparameterLab />
      );

    case "calibration-threshold-explorer":
      return <ThresholdLab />;

    case "imbalanced-learning-resampling-lab":
      return <ImbalanceLab />;

    case "model-interpretability-lab":
      return (
        <InterpretabilityLab />
      );

    case "shap-contribution-lab":
      return <ShapLab />;

    case "experiment-tracking-dashboard":
      return (
        <ExperimentTrackingLab />
      );

    case "complete-ml-workflow-lab":
      return (
        <ProcessLab
          label="Complete ML workflow"
          stages={[
            "Problem definition",
            "Data validation",
            "EDA",
            "Leakage-safe split",
            "Pipeline",
            "Cross-validation",
            "Hyperparameter tuning",
            "Final test",
            "Save workflow",
            "Inference",
            "Monitoring",
          ]}
        />
      );

    default:
      return (
        <ProcessLab
          label="Concept explorer"
          stages={[
            "Understand",
            "Experiment",
            "Observe",
            "Explain",
            "Apply",
          ]}
        />
      );
  }
}

/* =========================================================
   EDUCATIONAL CONTENT
   ========================================================= */

function LearningObjectives({
  content,
}: {
  content: NativeVisualizationContent;
}) {
  return (
    <section className="native-viz-learning-section">
      <SectionHeading
        eyebrow="LEARNING GOALS"
        title="What you will understand"
      />

      <div className="native-viz-objective-grid">
        {content.learningObjectives.map(
          (objective, index) => (
            <div
              className="native-viz-objective"
              key={objective}
            >
              <span>
                {index + 1}
              </span>

              <p>{objective}</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function ConceptCards({
  content,
}: {
  content: NativeVisualizationContent;
}) {
  return (
    <section className="native-viz-learning-section">
      <SectionHeading
        eyebrow="DEEP CONCEPTS"
        title="Build the mental model"
      />

      <div className="native-viz-concept-grid">
        {content.concepts.map(
          (concept) => (
            <article
              className="native-viz-concept-card"
              key={concept.title}
            >
              <h5>
                {concept.title}
              </h5>

              <p>
                {concept.explanation}
              </p>
            </article>
          )
        )}
      </div>
    </section>
  );
}

function FormulaSection({
  content,
}: {
  content: NativeVisualizationContent;
}) {
  if (
    !content.formulas ||
    content.formulas.length === 0
  ) {
    return null;
  }

  return (
    <section className="native-viz-learning-section">
      <SectionHeading
        eyebrow="MATHEMATICAL INTUITION"
        title="Understand the mathematics"
      />

      <div className="native-viz-formula-grid">
        {content.formulas.map(
          (formula) => (
            <article
              className="native-viz-formula-card"
              key={formula.name}
            >
              <h5>
                {formula.name}
              </h5>

              <div className="native-viz-formula">
                {formula.formula}
              </div>

              <p>
                {formula.explanation}
              </p>
            </article>
          )
        )}
      </div>
    </section>
  );
}

function ObservationSection({
  content,
}: {
  content: NativeVisualizationContent;
}) {
  return (
    <section className="native-viz-learning-section">
      <SectionHeading
        eyebrow="OBSERVE"
        title="What should you notice?"
      />

      <div className="native-viz-observation-list">
        {content.observations.map(
          (observation) => (
            <article
              key={
                observation.title
              }
            >
              <strong>
                {observation.title}
              </strong>

              <p>
                {
                  observation.description
                }
              </p>
            </article>
          )
        )}
      </div>
    </section>
  );
}

function MistakesSection({
  content,
}: {
  content: NativeVisualizationContent;
}) {
  return (
    <section className="native-viz-learning-section">
      <SectionHeading
        eyebrow="WATCH OUT"
        title="Common mistakes"
      />

      <div className="native-viz-mistake-list">
        {content.commonMistakes.map(
          (mistake, index) => (
            <div
              key={mistake}
              className="native-viz-mistake"
            >
              <span>
                {index + 1}
              </span>

              <p>{mistake}</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function ChallengeSection({
  content,
}: {
  content: NativeVisualizationContent;
}) {
  const [
    activeChallenge,
    setActiveChallenge,
  ] = useState(0);

  const [showHint, setShowHint] =
    useState(false);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const challenge =
    content.challenges[
      clamp(
        activeChallenge,
        0,
        content.challenges.length -
          1
      )
    ];

  if (!challenge) {
    return null;
  }

  function selectChallenge(
    index: number
  ) {
    setActiveChallenge(index);
    setShowHint(false);
    setShowAnswer(false);
  }

  return (
    <section className="native-viz-learning-section">
      <SectionHeading
        eyebrow="CHECK YOUR UNDERSTANDING"
        title="Mini challenge"
      />

      <div className="native-viz-challenge-card">
        <div className="native-viz-toolbar">
          <span className="native-viz-badge">
            Challenge{" "}
            {activeChallenge + 1}
          </span>

          <span>
            {activeChallenge + 1}/
            {content.challenges.length}
          </span>
        </div>

        <h5>
          {challenge.question}
        </h5>

        <div className="native-viz-actions">
          <button
            type="button"
            onClick={() =>
              setShowHint(
                (value) => !value
              )
            }
          >
            {showHint
              ? "Hide hint"
              : "Show hint"}
          </button>

          <button
            type="button"
            onClick={() =>
              setShowAnswer(
                (value) => !value
              )
            }
          >
            {showAnswer
              ? "Hide answer"
              : "Reveal answer"}
          </button>
        </div>

        {showHint && (
          <div className="native-viz-hint">
            <strong>Hint:</strong>{" "}
            {challenge.hint}
          </div>
        )}

        {showAnswer && (
          <div className="native-viz-answer">
            <strong>
              Answer:
            </strong>{" "}
            {challenge.answer}
          </div>
        )}

        {content.challenges.length >
          1 && (
          <div className="native-viz-actions">
            <button
              type="button"
              disabled={
                activeChallenge === 0
              }
              onClick={() =>
                selectChallenge(
                  activeChallenge - 1
                )
              }
            >
              Previous challenge
            </button>

            <button
              type="button"
              disabled={
                activeChallenge ===
                content.challenges
                  .length -
                  1
              }
              onClick={() =>
                selectChallenge(
                  activeChallenge + 1
                )
              }
            >
              Next challenge
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   SHARED UI
   ========================================================= */

function LabToolbar({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="native-viz-toolbar">
      <span className="native-viz-badge">
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="native-viz-panel">
      <span className="native-viz-label">
        {title}
      </span>

      {children}
    </div>
  );
}

function Explanation({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="native-viz-explanation">
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="native-viz-panel">
      <span className="native-viz-label">
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}

function MetricSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange:
    (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="native-viz-slider">
      <span>{label}</span>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
      />

      <strong>{value}</strong>
    </label>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active ? "active" : ""
      }
      onClick={onClick}
    >
      {active ? "ON: " : "OFF: "}
      {label}
    </button>
  );
}

function StepButtons({
  current,
  maximum,
  onChange,
}: {
  current: number;
  maximum: number;
  onChange:
    (value: number) => void;
}) {
  return (
    <div className="native-viz-actions">
      <button
        type="button"
        disabled={current === 0}
        onClick={() =>
          onChange(
            Math.max(
              current - 1,
              0
            )
          )
        }
      >
        Previous
      </button>

      <button
        type="button"
        disabled={
          current === maximum
        }
        onClick={() =>
          onChange(
            Math.min(
              current + 1,
              maximum
            )
          )
        }
      >
        Next
      </button>
    </div>
  );
}

function Matrix({
  values,
}: {
  values: number[][];
}) {
  return (
    <div>
      {values.map(
        (row, index) => (
          <div key={index}>
            [
            {row
              .map((value) =>
                formatNumber(
                  value,
                  Number.isInteger(
                    value
                  )
                    ? 0
                    : 2
                )
              )
              .join(", ")}
            ]
          </div>
        )
      )}
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<
    Array<string | number>
  >;
}) {
  return (
    <div className="native-viz-table-wrap">
      <table className="native-viz-table">
        <thead>
          <tr>
            {headers.map(
              (header) => (
                <th key={header}>
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map(
                  (
                    value,
                    columnIndex
                  ) => (
                    <td
                      key={
                        columnIndex
                      }
                    >
                      {value}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function BarValues({
  values,
}: {
  values: number[];
}) {
  const maximum =
    Math.max(...values);

  return (
    <div className="native-viz-bars">
      {values.map(
        (value, index) => (
          <div
            className="native-viz-bar-column"
            key={`${value}-${index}`}
          >
            <div
              className="native-viz-bar"
              style={{
                height: `${Math.max(
                  (value /
                    maximum) *
                    160,
                  12
                )}px`,
              }}
            />

            <span>{value}</span>
          </div>
        )
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="native-viz-section-heading">
      <span>{eyebrow}</span>
      <h4>{title}</h4>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function RoadmapNativeVisualization({
  visualizationId,
  title,
  description,
  skillId,
}: RoadmapNativeVisualizationProps) {
  const content =
    getVisualizationContent(
      visualizationId
    );

  if (!content) {
    return (
      <div className="roadmap-native-visualization">
        <div className="roadmap-native-visualization-header">
          <div>
            <span className="native-viz-live-badge">
              INTERACTIVE
            </span>

            <h4>
              {title ??
                "Interactive visualization"}
            </h4>

            <p>
              {description ??
                "Explore this concept interactively."}
            </p>
          </div>
        </div>

        <InteractiveLab
          visualizationId={
            visualizationId
          }
        />
      </div>
    );
  }

  return (
    <div className="roadmap-native-visualization">
      <div className="roadmap-native-visualization-header">
        <div>
          <span className="native-viz-live-badge">
            INTERACTIVE LEARNING LAB
          </span>

          <h4>{content.title}</h4>

          <p>
            {content.subtitle}
          </p>
        </div>

        <span className="native-viz-badge">
          {skillId}
        </span>
      </div>

      <section className="native-viz-learning-section native-viz-introduction">
        <div>
          <span className="native-viz-label">
            WHAT ARE WE EXPLORING?
          </span>

          <p>
            {content.concept}
          </p>
        </div>

        <div>
          <span className="native-viz-label">
            WHY DOES IT MATTER?
          </span>

          <p>
            {content.whyItMatters}
          </p>
        </div>
      </section>

      <LearningObjectives
        content={content}
      />

      <section className="native-viz-learning-section">
        <SectionHeading
          eyebrow="TRY IT YOURSELF"
          title="Interactive experiment"
        />

        <InteractiveLab
          visualizationId={
            visualizationId
          }
        />
      </section>

      <ConceptCards
        content={content}
      />

      <FormulaSection
        content={content}
      />

      <ObservationSection
        content={content}
      />

      <MistakesSection
        content={content}
      />

      <ChallengeSection
        content={content}
      />

      <section className="native-viz-key-insight">
        <span>
          KEY INSIGHT
        </span>

        <p>
          {content.keyInsight}
        </p>
      </section>
    </div>
  );
}