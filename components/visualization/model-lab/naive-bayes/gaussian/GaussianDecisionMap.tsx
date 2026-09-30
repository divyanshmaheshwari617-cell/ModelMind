import type {
  GaussianNBModel,
  NBRow,
} from "../types/naiveBayes";

import {
  predictGaussianNB,
} from "../utils/naiveBayesMath";

type Props = {
  model: GaussianNBModel;
  rows: NBRow[];
  xFeature: string;
  yFeature: string;
  queryValues: Record<string, number>;
};

const CLASS_COLORS = [
  "#38bdf8",
  "#f472b6",
  "#fbbf24",
  "#34d399",
];

export default function GaussianDecisionMap({
  model,
  rows,
  xFeature,
  yFeature,
  queryValues,
}: Props) {
  const width = 760;
  const height = 430;

  const left = 60;
  const right = 25;
  const top = 25;
  const bottom = 55;

  const numericRows = rows
    .map((row) => {
      const x = Number(row.features[xFeature]);
      const y = Number(row.features[yFeature]);

      return {
        row,
        x,
        y,
      };
    })
    .filter(
      (item) =>
        Number.isFinite(item.x) &&
        Number.isFinite(item.y)
    );

  if (numericRows.length === 0) {
    return null;
  }

  const xs = numericRows.map((item) => item.x);
  const ys = numericRows.map((item) => item.y);

  const rawXMin = Math.min(...xs);
  const rawXMax = Math.max(...xs);
  const rawYMin = Math.min(...ys);
  const rawYMax = Math.max(...ys);

  const xPadding =
    Math.max(rawXMax - rawXMin, 1) * 0.15;

  const yPadding =
    Math.max(rawYMax - rawYMin, 1) * 0.15;

  const xMin = rawXMin - xPadding;
  const xMax = rawXMax + xPadding;
  const yMin = rawYMin - yPadding;
  const yMax = rawYMax + yPadding;

  function sx(value: number) {
    return (
      left +
      ((value - xMin) / (xMax - xMin)) *
        (width - left - right)
    );
  }

  function sy(value: number) {
    return (
      height -
      bottom -
      ((value - yMin) / (yMax - yMin)) *
        (height - top - bottom)
    );
  }

  const gridColumns = 36;
  const gridRows = 24;

  const cells: {
    x: number;
    y: number;
    w: number;
    h: number;
    classLabel: string;
  }[] = [];

  for (let yi = 0; yi < gridRows; yi++) {
    for (let xi = 0; xi < gridColumns; xi++) {
      const x1 =
        xMin +
        (xi / gridColumns) *
          (xMax - xMin);

      const x2 =
        xMin +
        ((xi + 1) / gridColumns) *
          (xMax - xMin);

      const y1 =
        yMin +
        (yi / gridRows) *
          (yMax - yMin);

      const y2 =
        yMin +
        ((yi + 1) / gridRows) *
          (yMax - yMin);

      const values: Record<string, number> = {
        ...queryValues,
        [xFeature]: (x1 + x2) / 2,
        [yFeature]: (y1 + y2) / 2,
      };

      const prediction =
        predictGaussianNB(model, values);

      cells.push({
        x: sx(x1),
        y: sy(y2),
        w: sx(x2) - sx(x1) + 1,
        h: sy(y1) - sy(y2) + 1,
        classLabel: prediction.predictedClass,
      });
    }
  }

  const queryPrediction =
    predictGaussianNB(model, queryValues);

  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>
        2D DECISION MAP
      </div>

      <h3 style={titleStyle}>
        Where does Gaussian Naive Bayes predict each class?
      </h3>

      <p style={descriptionStyle}>
        The background shows the model's predicted class across{" "}
        <strong>{xFeature}</strong> and{" "}
        <strong>{yFeature}</strong>. Other features are held at the
        current slider values.
      </p>

      <div style={legendStyle}>
        {model.classes.map((classLabel, index) => (
          <div key={classLabel} style={legendItemStyle}>
            <span
              style={{
                ...dotStyle,
                background:
                  CLASS_COLORS[
                    index % CLASS_COLORS.length
                  ],
              }}
            />

            {classLabel}
          </div>
        ))}

        <div style={legendItemStyle}>
          <span style={queryDotStyle} />
          New student
        </div>
      </div>

      <div style={svgWrapperStyle}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={svgStyle}
        >
          {cells.map((cell, index) => {
            const classIndex =
              model.classes.indexOf(cell.classLabel);

            return (
              <rect
                key={index}
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                fill={
                  CLASS_COLORS[
                    Math.max(classIndex, 0) %
                      CLASS_COLORS.length
                  ]
                }
                opacity="0.13"
              />
            );
          })}

          <line
            x1={left}
            y1={height - bottom}
            x2={width - right}
            y2={height - bottom}
            stroke="#64748b"
          />

          <line
            x1={left}
            y1={top}
            x2={left}
            y2={height - bottom}
            stroke="#64748b"
          />

          {numericRows.map((item) => {
            const classIndex =
              model.classes.indexOf(item.row.target);

            return (
              <g key={item.row.id}>
                <circle
                  cx={sx(item.x)}
                  cy={sy(item.y)}
                  r="7"
                  fill={
                    CLASS_COLORS[
                      Math.max(classIndex, 0) %
                        CLASS_COLORS.length
                    ]
                  }
                  stroke="#020617"
                  strokeWidth="2"
                />

                <title>
                  {`Observation ${item.row.id}
${xFeature}: ${item.x}
${yFeature}: ${item.y}
Class: ${item.row.target}`}
                </title>
              </g>
            );
          })}

          <circle
            cx={sx(queryValues[xFeature])}
            cy={sy(queryValues[yFeature])}
            r="11"
            fill="#f8fafc"
            stroke="#020617"
            strokeWidth="3"
          />

          <circle
            cx={sx(queryValues[xFeature])}
            cy={sy(queryValues[yFeature])}
            r="15"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          <text
            x={width / 2}
            y={height - 10}
            fill="#94a3b8"
            textAnchor="middle"
            fontSize="12"
          >
            {xFeature}
          </text>

          <text
            x="17"
            y={height / 2}
            fill="#94a3b8"
            textAnchor="middle"
            fontSize="12"
            transform={`rotate(-90 17 ${height / 2})`}
          >
            {yFeature}
          </text>
        </svg>
      </div>

      <div style={predictionStyle}>
        New student →{" "}
        <strong>{queryPrediction.predictedClass}</strong>
      </div>
    </section>
  );
}

const cardStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid #334155",
  background: "#0f172a",
};

const eyebrowStyle = {
  color: "#34d399",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.3,
};

const titleStyle = {
  margin: "5px 0 8px",
};

const descriptionStyle = {
  color: "#94a3b8",
  lineHeight: 1.6,
};

const legendStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  margin: "12px 0",
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#cbd5e1",
  fontSize: 12,
};

const dotStyle = {
  width: 10,
  height: 10,
  borderRadius: "50%",
};

const queryDotStyle = {
  ...dotStyle,
  background: "#f8fafc",
  border: "1px solid #64748b",
};

const svgWrapperStyle = {
  overflowX: "auto" as const,
  borderRadius: 12,
  background: "#020617",
};

const svgStyle = {
  width: "100%",
  minWidth: 650,
  display: "block",
};

const predictionStyle = {
  marginTop: 10,
  padding: 10,
  borderRadius: 9,
  background: "#052e16",
  border: "1px solid #166534",
  color: "#bbf7d0",
};