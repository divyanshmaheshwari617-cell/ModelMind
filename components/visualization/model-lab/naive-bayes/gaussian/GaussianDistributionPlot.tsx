import type { GaussianNBModel } from "../types/naiveBayes";
import { gaussianPDF } from "../utils/naiveBayesMath";

type Props = {
  model: GaussianNBModel;
  feature: string;
  queryValue: number;
};

const COLORS = ["#38bdf8", "#f472b6", "#fbbf24", "#34d399"];

function getStandardDeviation(variance: number) {
  return Math.sqrt(Math.max(variance, 0));
}

export default function GaussianDistributionPlot({
  model,
  feature,
  queryValue,
}: Props) {
  const width = 760;
  const height = 310;

  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 50;

  const statistics = model.classes.map((classLabel) => ({
    classLabel,
    stats: model.statistics[classLabel][feature],
  }));

  const minX = Math.min(
    queryValue,
    ...statistics.map(({ stats }) => {
      const standardDeviation = getStandardDeviation(stats.variance);

      return (
        stats.mean -
        3 * Math.max(standardDeviation, 0.01)
      );
    })
  );

  const maxX = Math.max(
    queryValue,
    ...statistics.map(({ stats }) => {
      const standardDeviation = getStandardDeviation(stats.variance);

      return (
        stats.mean +
        3 * Math.max(standardDeviation, 0.01)
      );
    })
  );

  const range = Math.max(maxX - minX, 1);

  const xMin = minX - range * 0.08;
  const xMax = maxX + range * 0.08;

  const samples = 120;

  const curves = statistics.map(({ classLabel, stats }) => {
    const points = Array.from({ length: samples }, (_, index) => {
      const x =
        xMin +
        (index / (samples - 1)) *
          (xMax - xMin);

      return {
        x,
        y: gaussianPDF(x, stats.mean, stats.variance),
      };
    });

    return {
      classLabel,
      stats,
      points,
    };
  });

  const maxY = Math.max(
    ...curves.flatMap((curve) =>
      curve.points.map((point) => point.y)
    ),
    0.001
  );

  function scaleX(value: number) {
    return (
      paddingLeft +
      ((value - xMin) / (xMax - xMin)) *
        (width - paddingLeft - paddingRight)
    );
  }

  function scaleY(value: number) {
    return (
      height -
      paddingBottom -
      (value / maxY) *
        (height - paddingTop - paddingBottom)
    );
  }

  function makePath(points: { x: number; y: number }[]) {
    return points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${scaleX(point.x)} ${scaleY(
            point.y
          )}`
      )
      .join(" ");
  }

  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>GAUSSIAN DISTRIBUTION</div>

      <h3 style={titleStyle}>
        How does Gaussian Naive Bayes understand {feature}?
      </h3>

      <p style={descriptionStyle}>
        Gaussian Naive Bayes creates a separate bell curve for every
        class. The centre is the class mean μ and the spread is controlled
        by variance σ².
      </p>

      <div style={legendStyle}>
        {curves.map((curve, index) => {
          const standardDeviation = getStandardDeviation(
            curve.stats.variance
          );

          return (
            <div key={curve.classLabel} style={legendItemStyle}>
              <span
                style={{
                  ...legendDotStyle,
                  background: COLORS[index % COLORS.length],
                }}
              />

              <strong>{curve.classLabel}</strong>

              <span style={mutedStyle}>
                μ = {curve.stats.mean.toFixed(2)} • σ ={" "}
                {standardDeviation.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <div style={svgWrapperStyle}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={svgStyle}
          role="img"
          aria-label={`Gaussian distributions for ${feature}`}
        >
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#475569"
            strokeWidth="1.5"
          />

          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {curves.map((curve, index) => (
            <g key={curve.classLabel}>
              <path
                d={makePath(curve.points)}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth="4"
                strokeLinecap="round"
              />

              <line
                x1={scaleX(curve.stats.mean)}
                y1={paddingTop + 10}
                x2={scaleX(curve.stats.mean)}
                y2={height - paddingBottom}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity="0.7"
              />

              <text
                x={scaleX(curve.stats.mean)}
                y={paddingTop}
                fill={COLORS[index % COLORS.length]}
                textAnchor="middle"
                fontSize="12"
              >
                μ {curve.classLabel}
              </text>
            </g>
          ))}

          <line
            x1={scaleX(queryValue)}
            y1={paddingTop}
            x2={scaleX(queryValue)}
            y2={height - paddingBottom}
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          <circle
            cx={scaleX(queryValue)}
            cy={height - paddingBottom}
            r="6"
            fill="#f8fafc"
          />

          <text
            x={scaleX(queryValue)}
            y={height - 18}
            fill="#f8fafc"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
          >
            New student = {queryValue.toFixed(1)}
          </text>

          <text
            x={width / 2}
            y={height - 3}
            fill="#94a3b8"
            textAnchor="middle"
            fontSize="12"
          >
            {feature}
          </text>

          <text
            x="16"
            y={height / 2}
            fill="#94a3b8"
            textAnchor="middle"
            fontSize="12"
            transform={`rotate(-90 16 ${height / 2})`}
          >
            Probability Density
          </text>
        </svg>
      </div>

      <div style={likelihoodGridStyle}>
        {curves.map((curve, index) => {
          const likelihood = gaussianPDF(
            queryValue,
            curve.stats.mean,
            curve.stats.variance
          );

          return (
            <div key={curve.classLabel} style={likelihoodCardStyle}>
              <div
                style={{
                  color: COLORS[index % COLORS.length],
                  fontWeight: 900,
                }}
              >
                {curve.classLabel}
              </div>

              <div style={formulaStyle}>
                P({queryValue.toFixed(1)} | {curve.classLabel})
              </div>

              <strong style={likelihoodValueStyle}>
                {likelihood.toExponential(4)}
              </strong>
            </div>
          );
        })}
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
  color: "#38bdf8",
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
  flexWrap: "wrap" as const,
  gap: 10,
  margin: "13px 0",
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 10px",
  borderRadius: 9,
  background: "#020617",
};

const legendDotStyle = {
  width: 10,
  height: 10,
  borderRadius: "50%",
};

const mutedStyle = {
  color: "#94a3b8",
  fontSize: 12,
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

const likelihoodGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 9,
  marginTop: 12,
};

const likelihoodCardStyle = {
  padding: 12,
  borderRadius: 10,
  background: "#020617",
  border: "1px solid #1e293b",
};

const formulaStyle = {
  marginTop: 5,
  color: "#94a3b8",
  fontFamily: "monospace",
  fontSize: 11,
};

const likelihoodValueStyle = {
  display: "block",
  marginTop: 7,
  color: "#f8fafc",
};