
"use client";

import { useMemo, useState, type CSSProperties } from "react";

type Sample = { score: number; actual: 0 | 1 };
type Level = "basic" | "intermediate" | "advanced";

// Fixed teaching dataset: 20 observations, 9 positives, 11 negatives.
const samples: Sample[] = [
  { score: 0.98, actual: 1 }, { score: 0.93, actual: 1 },
  { score: 0.88, actual: 0 }, { score: 0.84, actual: 1 },
  { score: 0.79, actual: 1 }, { score: 0.74, actual: 0 },
  { score: 0.69, actual: 1 }, { score: 0.63, actual: 0 },
  { score: 0.58, actual: 1 }, { score: 0.53, actual: 0 },
  { score: 0.47, actual: 1 }, { score: 0.42, actual: 0 },
  { score: 0.37, actual: 0 }, { score: 0.32, actual: 1 },
  { score: 0.27, actual: 0 }, { score: 0.21, actual: 0 },
  { score: 0.15, actual: 1 }, { score: 0.08, actual: 0 },
  { score: 0.04, actual: 0 }, { score: 0.02, actual: 0 },
];

const safeDivide = (a: number, b: number) => b === 0 ? 0 : a / b;
const fmt = (n: number) => `${(n * 100).toFixed(1)}%`;
const decimal = (n: number) => n.toFixed(3);

function calculateMetrics(data: Sample[], threshold: number) {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (const sample of data) {
    const prediction = sample.score >= threshold ? 1 : 0;
    if (prediction === 1 && sample.actual === 1) tp++;
    else if (prediction === 0 && sample.actual === 0) tn++;
    else if (prediction === 1 && sample.actual === 0) fp++;
    else fn++;
  }
  const precision = safeDivide(tp, tp + fp);
  const recall = safeDivide(tp, tp + fn);
  const specificity = safeDivide(tn, tn + fp);
  const f1 = safeDivide(2 * precision * recall, precision + recall);
  const fpr = safeDivide(fp, fp + tn);
  const fnr = safeDivide(fn, fn + tp);
  const npv = safeDivide(tn, tn + fn);
  const accuracy = safeDivide(tp + tn, data.length);
  const balancedAccuracy = (recall + specificity) / 2;
  const f2 = safeDivide(5 * precision * recall, 4 * precision + recall);
  const mccDenominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
  const mcc = safeDivide(tp * tn - fp * fn, mccDenominator);
  return { tp, tn, fp, fn, precision, recall, specificity, f1, fpr, fnr, npv, accuracy, balancedAccuracy, f2, mcc };
}

type Point = { x: number; y: number };

function trapezoidArea(points: Point[]) {
  return points.slice(1).reduce((sum, point, i) => {
    const previous = points[i];
    return sum + (point.x - previous.x) * (point.y + previous.y) / 2;
  }, 0);
}

function buildCurves(data: Sample[]) {
  const thresholds = [
    1.01,
    ...Array.from(new Set(data.map(s => s.score))).sort((a, b) => b - a),
    0,
  ];
  const results = thresholds.map(t => calculateMetrics(data, t));
  const rocPoints = results.map(m => ({ x: m.fpr, y: m.recall }));
  const positiveCount = data.filter(s => s.actual === 1).length;

  // PR curve begins at recall=0, precision=1 by plotting convention.
  const prPoints: Point[] = [{ x: 0, y: 1 }];
  for (const m of results.slice(1)) {
    prPoints.push({ x: m.recall, y: m.precision });
  }

  const eps = 1e-15;
  const logLoss = -data.reduce(
    (sum, s) =>
      sum +
      s.actual * Math.log(Math.max(eps, Math.min(1 - eps, s.score))) +
      (1 - s.actual) * Math.log(Math.max(eps, Math.min(1 - eps, 1 - s.score))),
    0
  ) / data.length;

  const brier = data.reduce(
    (sum, s) => sum + (s.score - s.actual) ** 2,
    0
  ) / data.length;

  return {
    rocPoints,
    prPoints,
    rocAuc: trapezoidArea(rocPoints),
    prAucTrapezoid: trapezoidArea(prPoints),
    prevalence: positiveCount / data.length,
    logLoss,
    brier,
  };
}

const cardStyle: CSSProperties = {
  padding: 16,
  border: "1px solid var(--border, #d1d5db)",
  borderRadius: 12,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
  gap: 12,
};

const headingStyle: CSSProperties = { marginBottom: 10 };

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div style={{ ...cardStyle, minWidth: 130, flex: "1 1 130px" }}>
      <div style={{ fontSize: 13, opacity: 0.8 }}>{label}</div>
      <strong style={{ fontSize: 24 }}>{value}</strong>
      {detail && (
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 5 }}>
          {detail}
        </div>
      )}
    </div>
  );
}

function Formula({
  name,
  formula,
  substitution,
  explanation,
}: {
  name: string;
  formula: string;
  substitution: string;
  explanation: string;
}) {
  return (
    <div style={cardStyle}>
      <strong>{name}</strong>
      <div
        style={{
          fontFamily: "ui-monospace, Consolas, monospace",
          marginTop: 9,
          overflowWrap: "anywhere",
        }}
      >
        {formula}
      </div>
      <div style={{ marginTop: 6, fontWeight: 600 }}>
        {substitution}
      </div>
      <p style={{ marginBottom: 0, fontSize: 13, opacity: 0.85 }}>
        {explanation}
      </p>
    </div>
  );
}

function Curve({
  points,
  current,
  kind,
}: {
  points: Point[];
  current?: Point;
  kind: "roc" | "pr";
}) {
  const pointToSvg = (x: number, y: number) => ({
    x: 45 + x * 290,
    y: 325 - y * 290,
  });

  const path = points.map((p, i) => {
    const q = pointToSvg(p.x, p.y);
    return `${i === 0 ? "M" : "L"} ${q.x} ${q.y}`;
  }).join(" ");

  const marker = current && pointToSvg(current.x, current.y);

  return (
    <svg
      viewBox="0 0 380 365"
      role="img"
      aria-label={
        kind === "roc"
          ? "ROC curve showing true positive rate against false positive rate"
          : "Precision-recall curve"
      }
      style={{ width: "100%", maxWidth: 460, height: "auto" }}
    >
      <rect
        x="45" y="35" width="290" height="290"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
      {kind === "roc" && (
        <line
          x1="45" y1="325" x2="335" y2="35"
          stroke="#9ca3af"
          strokeDasharray="6 5"
          strokeWidth="2"
        />
      )}
      <path
        d={path}
        fill="none"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {marker && (
        <circle
          cx={marker.x}
          cy={marker.y}
          r="6"
          fill="#dc2626"
          stroke="white"
          strokeWidth="2"
        />
      )}
      <text
        x="190" y="355" fontSize="13"
        textAnchor="middle" fill="currentColor"
      >
        {kind === "roc" ? "False Positive Rate" : "Recall"}
      </text>
      <text
        x="15" y="180" fontSize="13"
        textAnchor="middle" fill="currentColor"
        transform="rotate(-90 15 180)"
      >
        {kind === "roc" ? "True Positive Rate" : "Precision"}
      </text>
      <text x="42" y="342" fontSize="12" fill="currentColor">0</text>
      <text x="332" y="342" fontSize="12" fill="currentColor">1</text>
      <text x="28" y="40" fontSize="12" fill="currentColor">1</text>
    </svg>
  );
}

const questions: Record<
  Level,
  {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[]
> = {
  basic: [
    {
      question: "What does a false negative mean?",
      options: [
        "A negative case predicted positive",
        "A positive case predicted negative",
        "A correct negative prediction",
      ],
      answer: 1,
      explanation:
        "A false negative is a missed actual positive. In screening, this can mean missing a person who needs follow-up.",
    },
    {
      question:
        "What happens to the number of predicted positives when the threshold is raised?",
      options: [
        "It cannot increase",
        "It always increases",
        "It never changes",
      ],
      answer: 0,
      explanation:
        "Raising the threshold makes it harder to predict positive. The count stays the same or decreases.",
    },
  ],
  intermediate: [
    {
      question:
        "Which metric directly measures the fraction of actual positives detected?",
      options: ["Precision", "Recall", "Specificity"],
      answer: 1,
      explanation:
        "Recall = TP/(TP+FN), also called sensitivity or true positive rate.",
    },
    {
      question:
        "Does ROC-AUC change when you move only the classification threshold?",
      options: ["Yes", "No"],
      answer: 1,
      explanation:
        "ROC-AUC evaluates ranking over all thresholds. The current threshold changes the operating point, not the score ranking.",
    },
  ],
  advanced: [
    {
      question:
        "For severe class imbalance, which view often reveals positive-class retrieval quality more clearly?",
      options: [
        "Accuracy alone",
        "Precision–recall curve",
        "Training loss alone",
      ],
      answer: 1,
      explanation:
        "PR curves focus on precision and recall for the positive class. Always interpret them with prevalence and business costs.",
    },
    {
      question:
        "Can a classifier have high ROC-AUC but poorly calibrated probabilities?",
      options: ["Yes", "No"],
      answer: 0,
      explanation:
        "Ranking discrimination and calibration are different properties. High ROC-AUC does not guarantee that predicted 0.8 means an 80% event rate.",
    },
  ],
};

export default function AdvancedClassificationEvaluationLab() {
  const [threshold, setThreshold] = useState(0.5);
  const [level, setLevel] = useState<Level>("basic");
  const [falsePositiveCost, setFalsePositiveCost] = useState(1);
  const [falseNegativeCost, setFalseNegativeCost] = useState(5);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const metrics = useMemo(
    () => calculateMetrics(samples, threshold),
    [threshold]
  );

  const curves = useMemo(() => buildCurves(samples), []);

  const comparisons = useMemo(
    () =>
      [0.2, 0.3, 0.5, 0.7, 0.8].map(t => ({
        threshold: t,
        ...calculateMetrics(samples, t),
      })),
    []
  );

  const costRows = useMemo(
    () =>
      Array.from({ length: 101 }, (_, i) => {
        const t = i / 100;
        const m = calculateMetrics(samples, t);
        return {
          threshold: t,
          ...m,
          cost: m.fp * falsePositiveCost + m.fn * falseNegativeCost,
        };
      }),
    [falsePositiveCost, falseNegativeCost]
  );

  const minCost = Math.min(...costRows.map(r => r.cost));
  const optimalRows = costRows.filter(r => r.cost === minCost);
  const currentCost =
    metrics.fp * falsePositiveCost +
    metrics.fn * falseNegativeCost;

  const currentPoint = {
    x: metrics.fpr,
    y: metrics.recall,
  };

  const commonExplanation =
    level === "basic"
      ? "A confusion matrix compares actual answers with predictions. True positives and true negatives are correct predictions. False positives and false negatives are mistakes."
      : level === "intermediate"
        ? "Precision measures how many predicted positives are correct. Recall measures how many actual positives are detected. F1 balances precision and recall. Changing the threshold changes these metrics."
        : "The ROC curve plots true positive rate against false positive rate across thresholds. AUC summarizes ranking discrimination and is independent of the currently selected decision threshold. AUC does not measure probability calibration.";

  return (
    <div
      className="native-viz-content"
      style={{ display: "grid", gap: 22, lineHeight: 1.65 }}
    >
      <header>
        <h3>Advanced Classification Evaluation Studio</h3>
        <p>
          Explore how classification thresholds affect predictions,
          confusion matrices, precision, recall and F1-score.
          Analyze ROC-AUC using a fixed illustrative dataset.
          Switch levels to unlock different explanations, worked
          calculations, and applied evaluation tools.
        </p>
        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Teaching dataset: {samples.length} observations ·{" "}
          {samples.filter(s => s.actual === 1).length} actual positives ·{" "}
          {samples.filter(s => s.actual === 0).length} actual negatives.
          This is illustrative data, not a validated real-world model.
        </p>
      </header>

      <div
        className="native-viz-actions"
        role="group"
        aria-label="Choose learning level"
      >
        {(["basic", "intermediate", "advanced"] as const).map(item => (
          <button
            key={item}
            type="button"
            className={level === item ? "active" : ""}
            aria-pressed={level === item}
            onClick={() => {
              setLevel(item);
              setQuizAnswers({});
            }}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <section style={cardStyle}>
        <h4 style={headingStyle}>
          {level === "basic"
            ? "Basic: Understand every prediction"
            : level === "intermediate"
              ? "Intermediate: Evaluate a classifier correctly"
              : "Advanced: Make defensible model decisions"}
        </h4>

        {level === "basic" ? (
          <p>
            Imagine a model predicting whether an event will happen.
            A score of 0.79 means the model assigns a score of 0.79
            to the positive class; it is not automatically a
            well-calibrated 79% probability. At threshold 0.50,
            scores of 0.50 or more are classified positive.
            Lowering the threshold flags more cases, which can catch
            more positives but also create more false alarms.
          </p>
        ) : level === "intermediate" ? (
          <p>
            Evaluate more than accuracy: compare precision, recall,
            specificity, balanced accuracy, F1, and F2. Understand
            the difference between a threshold-dependent decision
            metric and a threshold-independent ranking metric.
            Inspect both ROC and precision–recall curves, especially
            when the positive class is rare.
          </p>
        ) : (
          <p>
            Advanced evaluation connects statistical performance to
            decisions. Consider asymmetric error costs, ranking
            versus probability calibration, dataset shift, subgroup
            performance, confidence intervals, and leakage-free
            threshold selection. A high AUC does not automatically
            imply safe or profitable deployment.
          </p>
        )}
      </section>

      <section style={cardStyle}>
        <label htmlFor="evaluation-threshold">
          <strong>
            Classification threshold: {threshold.toFixed(2)}
          </strong>
        </label>

        <input
          id="evaluation-threshold"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          style={{ width: "100%", marginTop: 12 }}
        />

        <p>
          A score greater than or equal to the threshold is
          classified as positive.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[0.2, 0.3, 0.5, 0.7, 0.8].map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setThreshold(t)}
              style={{
                padding: "6px 12px",
                border: "1px solid var(--border, #d1d5db)",
                borderRadius: 8,
                background:
                  Math.abs(threshold - t) < 0.001
                    ? "#dbeafe"
                    : "transparent",
                color:
                  Math.abs(threshold - t) < 0.001
                    ? "#172033"
                    : "inherit",
                cursor: "pointer",
              }}
            >
              {t.toFixed(2)}
            </button>
          ))}
        </div>

        <p style={{ marginBottom: 0, fontSize: 13 }}>
          Currently predicted positive: {metrics.tp + metrics.fp} of{" "}
          {samples.length}. Predicted negative: {metrics.tn + metrics.fn}.
          Raising the threshold cannot increase the number of
          predicted positives.
        </p>
      </section>

      <section>
        <h4 style={headingStyle}>Confusion Matrix</h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {([
            [
              "True Negative",
              metrics.tn,
              "#dcfce7",
              "Actual 0, predicted 0",
            ],
            [
              "False Positive",
              metrics.fp,
              "#fee2e2",
              "Actual 0, predicted 1",
            ],
            [
              "False Negative",
              metrics.fn,
              "#fee2e2",
              "Actual 1, predicted 0",
            ],
            [
              "True Positive",
              metrics.tp,
              "#dcfce7",
              "Actual 1, predicted 1",
            ],
          ] as const).map(([label, value, background, detail]) => (
            <div
              key={label}
              style={{
                padding: 20,
                borderRadius: 12,
                background,
                color: "#172033",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13 }}>{label}</div>
              <strong style={{ fontSize: 30 }}>{value}</strong>
              <div style={{ fontSize: 12 }}>{detail}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Rows: actual negative, actual positive. Columns:
          predicted negative, predicted positive.
        </p>

        <p>
          <strong>Current interpretation:</strong> The classifier
          correctly detects {metrics.tp} positive cases and{" "}
          {metrics.tn} negative cases. It produces {metrics.fp} false
          alarms and misses {metrics.fn} actual positives.
        </p>

        {level === "basic" && (
          <div style={cardStyle}>
            <strong>Simple example:</strong> In a screening scenario,
            a false positive means an unaffected person is flagged
            for additional checks. A false negative means a person
            who actually has the condition is missed. Which mistake
            is more harmful depends on the context.
          </div>
        )}
      </section>

      <section>
        <h4 style={headingStyle}>Live Evaluation Metrics</h4>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <MetricCard
            label="Accuracy"
            value={fmt(metrics.accuracy)}
            detail="Overall correct predictions"
          />
          <MetricCard
            label="Precision"
            value={fmt(metrics.precision)}
            detail="TP / predicted positives"
          />
          <MetricCard
            label="Recall"
            value={fmt(metrics.recall)}
            detail="TP / actual positives"
          />
          <MetricCard
            label="F1 Score"
            value={fmt(metrics.f1)}
            detail="Harmonic mean of precision and recall"
          />
          <MetricCard
            label="Specificity"
            value={fmt(metrics.specificity)}
            detail="TN / actual negatives"
          />
          <MetricCard
            label="False Positive Rate"
            value={fmt(metrics.fpr)}
            detail="FP / actual negatives"
          />

          {level !== "basic" && (
            <>
              <MetricCard
                label="False Negative Rate"
                value={fmt(metrics.fnr)}
                detail="FN / actual positives"
              />
              <MetricCard
                label="Negative Predictive Value"
                value={fmt(metrics.npv)}
                detail="TN / predicted negatives"
              />
              <MetricCard
                label="Balanced Accuracy"
                value={fmt(metrics.balancedAccuracy)}
                detail="Mean of recall and specificity"
              />
              <MetricCard
                label="F2 Score"
                value={fmt(metrics.f2)}
                detail="Weights recall more than precision"
              />
            </>
          )}

          {level === "advanced" && (
            <MetricCard
              label="Matthews Correlation"
              value={decimal(metrics.mcc)}
              detail="Balanced association measure (-1 to +1)"
            />
          )}
        </div>

        <p style={{ fontSize: 12, opacity: 0.8 }}>
          If a metric has a zero denominator, this teaching demo
          displays 0. In production reporting, mark such metrics
          as undefined and document the convention.
        </p>
      </section>

      <section>
        <h4 style={headingStyle}>Step-by-step metric calculations</h4>

        <div style={gridStyle}>
          <Formula
            name="Accuracy"
            formula="(TP + TN) / (TP + TN + FP + FN)"
            substitution={`(${metrics.tp} + ${metrics.tn}) / ${samples.length} = ${fmt(metrics.accuracy)}`}
            explanation="Correct predictions among all observations. Can mislead on imbalanced data."
          />

          <Formula
            name="Precision"
            formula="TP / (TP + FP)"
            substitution={`${metrics.tp} / (${metrics.tp} + ${metrics.fp}) = ${fmt(metrics.precision)}`}
            explanation="When the model predicts positive, how often is it correct?"
          />

          <Formula
            name="Recall (Sensitivity / TPR)"
            formula="TP / (TP + FN)"
            substitution={`${metrics.tp} / (${metrics.tp} + ${metrics.fn}) = ${fmt(metrics.recall)}`}
            explanation="How many of the actual positives were caught?"
          />

          <Formula
            name="F1-score"
            formula="2 × Precision × Recall / (Precision + Recall)"
            substitution={`2 × ${decimal(metrics.precision)} × ${decimal(metrics.recall)} / (${decimal(metrics.precision)} + ${decimal(metrics.recall)}) = ${fmt(metrics.f1)}`}
            explanation="Balances precision and recall, without using true negatives."
          />

          {level !== "basic" && (
            <>
              <Formula
                name="Specificity (TNR)"
                formula="TN / (TN + FP)"
                substitution={`${metrics.tn} / (${metrics.tn} + ${metrics.fp}) = ${fmt(metrics.specificity)}`}
                explanation="How many actual negatives are correctly rejected?"
              />

              <Formula
                name="False Positive Rate"
                formula="FP / (FP + TN) = 1 − Specificity"
                substitution={`${metrics.fp} / (${metrics.fp} + ${metrics.tn}) = ${fmt(metrics.fpr)}`}
                explanation="Fraction of negatives incorrectly flagged."
              />

              <Formula
                name="False Negative Rate"
                formula="FN / (FN + TP) = 1 − Recall"
                substitution={`${metrics.fn} / (${metrics.fn} + ${metrics.tp}) = ${fmt(metrics.fnr)}`}
                explanation="Fraction of positives missed."
              />

              <Formula
                name="Balanced Accuracy"
                formula="(Recall + Specificity) / 2"
                substitution={`(${decimal(metrics.recall)} + ${decimal(metrics.specificity)}) / 2 = ${fmt(metrics.balancedAccuracy)}`}
                explanation="Treats sensitivity and specificity equally."
              />
            </>
          )}
        </div>
      </section>

      <section>
        <h4 style={headingStyle}>ROC Curve</h4>

        <Curve
          points={curves.rocPoints}
          current={currentPoint}
          kind="roc"
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <MetricCard
            label="ROC-AUC"
            value={curves.rocAuc.toFixed(3)}
          />
          <MetricCard
            label="Current TPR"
            value={fmt(metrics.recall)}
          />
          <MetricCard
            label="Current FPR"
            value={fmt(metrics.fpr)}
          />
        </div>

        <p>
          The blue curve evaluates every possible classification
          threshold. The red point represents your selected
          threshold. ROC-AUC stays constant because the model
          scores do not change.
        </p>

        <p>
          <strong>Interpretation:</strong> ROC-AUC estimates how often
          a randomly selected positive receives a higher score than
          a randomly selected negative (with half credit for ties).
          An AUC of 0.5 corresponds to chance-level ranking; 1.0
          means perfect ranking on this dataset.
        </p>
      </section>

      {level !== "basic" && (
        <section>
          <h4 style={headingStyle}>Precision–Recall Curve</h4>

          <Curve
            points={curves.prPoints}
            current={{
              x: metrics.recall,
              y: metrics.precision,
            }}
            kind="pr"
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <MetricCard
              label="PR-AUC (trapezoid)"
              value={curves.prAucTrapezoid.toFixed(3)}
            />
            <MetricCard
              label="Positive prevalence"
              value={fmt(curves.prevalence)}
            />
            <MetricCard
              label="Current Precision"
              value={fmt(metrics.precision)}
            />
          </div>

          <p>
            The PR curve focuses on how reliably positive predictions
            identify true positives as recall changes. It is often
            especially informative for rare-positive problems.
            The no-skill precision baseline is approximately the
            positive-class prevalence.
          </p>

          <p style={{ fontSize: 13, opacity: 0.85 }}>
            <strong>Important:</strong> The displayed PR-AUC uses
            trapezoidal interpolation. Scikit-learn&apos;s{" "}
            <code>average_precision_score</code> uses a different
            step-wise calculation, so the values may differ.
          </p>
        </section>
      )}

      {level !== "basic" && (
        <section>
          <h4 style={headingStyle}>
            Compare thresholds side by side
          </h4>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: 640,
              }}
            >
              <thead>
                <tr>
                  {[
                    "Threshold",
                    "TP",
                    "FP",
                    "FN",
                    "TN",
                    "Precision",
                    "Recall",
                    "F1",
                  ].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: 9,
                        borderBottom:
                          "1px solid var(--border, #d1d5db)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisons.map(row => (
                  <tr
                    key={row.threshold}
                    style={{
                      background:
                        Math.abs(threshold - row.threshold) < 0.001
                          ? "rgba(37,99,235,.1)"
                          : "transparent",
                    }}
                  >
                    <td style={{ padding: 9 }}>
                      {row.threshold.toFixed(2)}
                    </td>
                    <td>{row.tp}</td>
                    <td>{row.fp}</td>
                    <td>{row.fn}</td>
                    <td>{row.tn}</td>
                    <td>{fmt(row.precision)}</td>
                    <td>{fmt(row.recall)}</td>
                    <td>{fmt(row.f1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Moving the threshold changes the confusion matrix and
            threshold-dependent metrics. It does not change ROC-AUC,
            PR-AUC, log loss, or Brier score because those are
            computed from the unchanged scores.
          </p>
        </section>
      )}

      {level === "advanced" && (
        <section style={cardStyle}>
          <h4 style={headingStyle}>
            Cost-sensitive threshold optimization
          </h4>

          <p>
            Assign an illustrative cost to each false positive and
            false negative. The tool searches thresholds from 0.00
            to 1.00 in steps of 0.01 to find the minimum cost{" "}
            <em>on this small teaching dataset</em>.
          </p>

          <div style={gridStyle}>
            <label>
              Cost per false positive
              <input
                aria-label="Cost per false positive"
                type="number"
                min="0"
                max="10000"
                step="1"
                value={falsePositiveCost}
                onChange={e =>
                  setFalsePositiveCost(
                    Math.max(
                      0,
                      Math.min(10000, Number(e.target.value) || 0)
                    )
                  )
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: 8,
                }}
              />
            </label>

            <label>
              Cost per false negative
              <input
                aria-label="Cost per false negative"
                type="number"
                min="0"
                max="10000"
                step="1"
                value={falseNegativeCost}
                onChange={e =>
                  setFalseNegativeCost(
                    Math.max(
                      0,
                      Math.min(10000, Number(e.target.value) || 0)
                    )
                  )
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: 8,
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 14,
            }}
          >
            <MetricCard
              label="Current total cost"
              value={currentCost.toFixed(0)}
              detail={`${metrics.fp} FP × ${falsePositiveCost} + ${metrics.fn} FN × ${falseNegativeCost}`}
            />
            <MetricCard
              label="Minimum observed cost"
              value={minCost.toFixed(0)}
              detail="Across 101 tested thresholds"
            />
            <MetricCard
              label="Best threshold range"
              value={`${optimalRows[0].threshold.toFixed(2)}–${optimalRows[optimalRows.length - 1].threshold.toFixed(2)}`}
              detail="May contain ties or disconnected optimal values"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setThreshold(optimalRows[0].threshold)
            }
            style={{
              marginTop: 12,
              padding: "9px 14px",
              border:
                "1px solid var(--border, #d1d5db)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Use a minimum-cost threshold
          </button>

          <p style={{ fontSize: 13 }}>
            In a real project, choose a threshold using validation
            or cross-validation data, then evaluate once on an
            untouched test set. Cost assumptions and prevalence
            must match deployment conditions.
          </p>
        </section>
      )}

      {level === "advanced" && (
        <section>
          <h4 style={headingStyle}>
            Probability quality: calibration and proper scoring rules
          </h4>

          <div style={gridStyle}>
            <MetricCard
              label="Log loss"
              value={curves.logLoss.toFixed(4)}
              detail="Penalizes confident incorrect probabilities strongly"
            />
            <MetricCard
              label="Brier score"
              value={curves.brier.toFixed(4)}
              detail="Mean squared probability error; lower is better"
            />
          </div>

          <p>
            <strong>Discrimination</strong> asks whether positives
            rank above negatives; ROC-AUC measures this.{" "}
            <strong>Calibration</strong> asks whether cases assigned
            a probability near 0.70 actually occur about 70% of the
            time across many comparable predictions. A classifier
            can rank well yet be poorly calibrated.
          </p>

          <p>
            <strong>Reliability diagrams:</strong> group predicted
            probabilities into bins and compare mean predicted
            probability with observed positive rate. Binning
            choices and sample size affect interpretation.
            Calibrate with held-out data (for example, sigmoid or
            isotonic methods), not the final test set.
          </p>
        </section>
      )}

      <section style={cardStyle}>
        <h4 style={headingStyle}>Understand the evaluation</h4>

        <p>{commonExplanation}</p>

        {level === "basic" ? (
          <>
            <p>
              <strong>Try this experiment:</strong> Reduce the
              threshold to 0.20, then increase it to 0.80.
              Observe how false positives, false negatives,
              precision, and recall change.
            </p>

            <p>
              <strong>Remember:</strong> Accuracy counts all correct
              decisions; precision asks whether positive predictions
              are trustworthy; recall asks whether positive cases
              were found. There is no universally best metric.
            </p>
          </>
        ) : level === "intermediate" ? (
          <>
            <p>
              <strong>Class imbalance:</strong> If 99% of cases are
              negative, a classifier predicting negative for everyone
              achieves 99% accuracy while detecting no positives.
              Inspect per-class metrics, the confusion matrix,
              prevalence, and precision–recall behavior.
            </p>

            <p>
              <strong>F-beta:</strong> F1 balances precision and
              recall. F2 places more weight on recall, while F0.5
              places more weight on precision. Select beta based
              on the actual problem.
            </p>

            <p>
              <strong>Multiclass:</strong> Evaluate each class
              one-versus-rest and aggregate with macro (equal class
              weight), weighted (support-weighted), or micro
              (global TP/FP/FN) averaging. These averages answer
              different questions.
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>ROC-AUC versus PR-AUC:</strong> ROC-AUC evaluates
              ranking across positives and negatives; PR curves
              foreground the positive class and depend strongly
              on prevalence. Neither alone identifies the best
              operating threshold.
            </p>

            <p>
              <strong>Cross-validation and leakage:</strong> Put
              preprocessing, feature selection, and model training
              inside each training fold. Tune hyperparameters and
              thresholds without using final test labels. Consider
              nested CV for less biased model-selection estimates.
            </p>

            <p>
              <strong>Uncertainty:</strong> Report sample sizes and
              confidence intervals (for example, bootstrap intervals
              on an independent test set). Use patient/group-aware
              or time-aware resampling when observations are
              dependent. Check subgroup performance, drift, and
              cost assumptions before deployment.
            </p>

            <p>
              <strong>Multilabel and multiclass:</strong> Choose
              one-vs-rest or one-vs-one evaluation deliberately,
              report averaging schemes, and check per-class
              performance rather than hiding weak classes behind
              a single summary score.
            </p>
          </>
        )}
      </section>

      {level !== "basic" && (
        <section style={cardStyle}>
          <h4 style={headingStyle}>
            Python / scikit-learn evaluation example
          </h4>

          <p>
            Replace <code>y_true</code> and{" "}
            <code>y_score</code> with labels and predicted
            positive-class scores from an untouched evaluation set.
          </p>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontSize: 12,
              padding: 14,
              borderRadius: 10,
              background: "#101827",
              color: "#e5edf7",
            }}
          >
            {`import numpy as np
from sklearn.metrics import (
    confusion_matrix, classification_report,
    roc_auc_score, average_precision_score,
    log_loss, brier_score_loss
)

y_true = np.array([1, 0, 1, 0, 1, 0])
y_score = np.array([0.92, 0.71, 0.65, 0.31, 0.43, 0.12])
threshold = ${threshold.toFixed(2)}
y_pred = (y_score >= threshold).astype(int)

print(confusion_matrix(y_true, y_pred, labels=[0, 1]))
print(classification_report(y_true, y_pred, zero_division=0))
print("ROC-AUC:", roc_auc_score(y_true, y_score))
print("Average precision:", average_precision_score(y_true, y_score))
print("Log loss:", log_loss(y_true, y_score))
print("Brier score:", brier_score_loss(y_true, y_score))`}
          </pre>

          <p style={{ fontSize: 13 }}>
            For probability-based metrics, supply
            scores/probabilities, not hard class predictions.
            For reliable conclusions, use more than this tiny
            example dataset.
          </p>
        </section>
      )}

      <section style={cardStyle}>
        <h4 style={headingStyle}>
          Practice: {level.charAt(0).toUpperCase() + level.slice(1)}
          {" "}checkpoint
        </h4>

        {questions[level].map((q, i) => {
          const key = `${level}-${i}`;
          const selected = quizAnswers[key];

          return (
            <div
              key={key}
              style={{
                padding: "12px 0",
                borderTop: i
                  ? "1px solid var(--border, #d1d5db)"
                  : "none",
              }}
            >
              <strong>
                {i + 1}. {q.question}
              </strong>

              <div
                style={{
                  display: "grid",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {q.options.map((option, index) => (
                  <label
                    key={option}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="radio"
                      name={`evaluation-${key}`}
                      checked={selected === index}
                      onChange={() =>
                        setQuizAnswers(prev => ({
                          ...prev,
                          [key]: index,
                        }))
                      }
                    />{" "}
                    {option}
                  </label>
                ))}
              </div>

              {selected !== undefined && (
                <p
                  style={{
                    color:
                      selected === q.answer
                        ? "#15803d"
                        : "#b45309",
                    marginBottom: 0,
                  }}
                >
                  <strong>
                    {selected === q.answer
                      ? "Correct."
                      : "Not quite."}
                  </strong>{" "}
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
