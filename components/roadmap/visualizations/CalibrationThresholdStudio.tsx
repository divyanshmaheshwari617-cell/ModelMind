
"use client";

import { useMemo, useState, type CSSProperties } from "react";

type Level = "basic" | "intermediate" | "advanced";
type Sample = { score: number; actual: 0 | 1 };

const data: Sample[] = [
  { score: .95, actual: 1 }, { score: .89, actual: 1 },
  { score: .83, actual: 0 }, { score: .78, actual: 1 },
  { score: .74, actual: 1 }, { score: .69, actual: 0 },
  { score: .65, actual: 1 }, { score: .60, actual: 1 },
  { score: .56, actual: 0 }, { score: .52, actual: 1 },
  { score: .48, actual: 0 }, { score: .44, actual: 1 },
  { score: .39, actual: 0 }, { score: .35, actual: 1 },
  { score: .31, actual: 0 }, { score: .27, actual: 0 },
  { score: .23, actual: 1 }, { score: .19, actual: 0 },
  { score: .14, actual: 0 }, { score: .08, actual: 0 },
];

const box: CSSProperties = {
  border: "1px solid var(--border, #d1d5db)",
  borderRadius: 12,
  padding: 16,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 12,
};

const div = (a: number, b: number) => b ? a / b : 0;
const pct = (v: number) => `${(100 * v).toFixed(1)}%`;

function metrics(items: Sample[], t: number) {
  let tp = 0, tn = 0, fp = 0, fn = 0;

  for (const s of items) {
    const p = s.score >= t;

    if (p && s.actual) tp++;
    else if (p && !s.actual) fp++;
    else if (!p && s.actual) fn++;
    else tn++;
  }

  const precision = div(tp, tp + fp);
  const recall = div(tp, tp + fn);
  const specificity = div(tn, tn + fp);

  return {
    tp, tn, fp, fn,
    precision,
    recall,
    specificity,
    accuracy: div(tp + tn, items.length),
    f1: div(2 * precision * recall, precision + recall),
  };
}

function calibration(items: Sample[], bins: number) {
  return Array.from({ length: bins }, (_, i) => {
    const group = items.filter(
      s => Math.min(bins - 1, Math.floor(s.score * bins)) === i
    );

    return {
      index: i,
      count: group.length,
      predicted: div(
        group.reduce((a, s) => a + s.score, 0),
        group.length
      ),
      observed: div(
        group.reduce((a, s) => a + s.actual, 0),
        group.length
      ),
    };
  });
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div style={box}>
      <div style={{ fontSize: 13, opacity: .8 }}>{label}</div>
      <strong style={{ fontSize: 24 }}>{value}</strong>
      {detail && (
        <div style={{ fontSize: 12, opacity: .8 }}>{detail}</div>
      )}
    </div>
  );
}

function Reliability({
  bins,
}: {
  bins: ReturnType<typeof calibration>;
}) {
  const px = (x: number) => 45 + x * 290;
  const py = (y: number) => 325 - y * 290;

  return (
    <svg
      viewBox="0 0 380 365"
      style={{ width: "100%", maxWidth: 480 }}
      role="img"
      aria-label="Reliability diagram"
    >
      <rect
        x="45" y="35" width="290" height="290"
        fill="none" stroke="currentColor" strokeOpacity=".4"
      />
      <line
        x1="45" y1="325" x2="335" y2="35"
        stroke="#9ca3af" strokeDasharray="5 5" strokeWidth="2"
      />

      {bins.filter(b => b.count > 0).map(b => (
        <g key={b.index}>
          <line
            x1={px(b.predicted)}
            y1={py(b.observed)}
            x2={px(b.predicted)}
            y2="325"
            stroke="#2563eb"
            strokeOpacity=".15"
          />
          <circle
            cx={px(b.predicted)}
            cy={py(b.observed)}
            r={Math.max(5, Math.min(12, 3 + b.count))}
            fill="#2563eb"
          >
            <title>
              {`Bin ${b.index + 1}: n=${b.count}, predicted=${pct(b.predicted)}, observed=${pct(b.observed)}`}
            </title>
          </circle>
        </g>
      ))}

      <text x="190" y="355" textAnchor="middle" fontSize="12" fill="currentColor">
        Mean predicted probability
      </text>
      <text
        x="13" y="180" textAnchor="middle" fontSize="12"
        fill="currentColor" transform="rotate(-90 13 180)"
      >
        Observed positive rate
      </text>
      <text x="42" y="342" fontSize="12" fill="currentColor">0</text>
      <text x="332" y="342" fontSize="12" fill="currentColor">1</text>
      <text x="28" y="40" fontSize="12" fill="currentColor">1</text>
    </svg>
  );
}

const quizzes: Record<
  Level,
  { q: string; answers: string[]; correct: number; why: string }[]
> = {
  basic: [
    {
      q: "What does a 0.70 decision threshold mean?",
      answers: [
        "Predict positive when score is at least 0.70",
        "70% of predictions must be correct",
        "70% of cases are positive",
      ],
      correct: 0,
      why: "A threshold converts a score into a class decision. It does not establish calibration.",
    },
    {
      q: "If we raise the threshold, predicted positives...",
      answers: [
        "Cannot increase",
        "Always increase",
        "Are unchanged by definition",
      ],
      correct: 0,
      why: "Raising the cutoff can only retain or reduce positive predictions.",
    },
  ],
  intermediate: [
    {
      q: "Which metric measures probability squared error?",
      answers: ["Brier score", "F1-score", "Recall"],
      correct: 0,
      why: "Brier score averages (predicted probability - observed label) squared.",
    },
    {
      q: "Can ROC-AUC change just by moving a threshold?",
      answers: ["Yes", "No"],
      correct: 1,
      why: "ROC-AUC summarizes rankings over thresholds, not one operating point.",
    },
  ],
  advanced: [
    {
      q: "Where should you tune a decision threshold?",
      answers: [
        "Final test set",
        "Validation or cross-validation data",
        "Production labels after reporting test results",
      ],
      correct: 1,
      why: "Keep the final test set untouched for honest evaluation.",
    },
    {
      q: "Does a lower Brier score prove perfect calibration?",
      answers: ["Yes", "No"],
      correct: 1,
      why: "Brier score reflects overall probability accuracy, including calibration and discrimination.",
    },
  ],
};

export default function CalibrationThresholdStudio() {
  const [level, setLevel] = useState<Level>("basic");
  const [threshold, setThreshold] = useState(.5);
  const [binCount, setBinCount] = useState(5);
  const [fpCost, setFpCost] = useState(1);
  const [fnCost, setFnCost] = useState(5);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const m = useMemo(() => metrics(data, threshold), [threshold]);
  const bins = useMemo(() => calibration(data, binCount), [binCount]);

  const brier = useMemo(
    () => data.reduce((a, s) => a + (s.score - s.actual) ** 2, 0) / data.length,
    []
  );

  const logloss = useMemo(
    () => -data.reduce(
      (a, s) =>
        a +
        s.actual * Math.log(Math.max(1e-15, s.score)) +
        (1 - s.actual) * Math.log(Math.max(1e-15, 1 - s.score)),
      0
    ) / data.length,
    []
  );

  const ece = useMemo(
    () => bins.reduce(
      (a, b) =>
        a + b.count / data.length * Math.abs(b.predicted - b.observed),
      0
    ),
    [bins]
  );

  const costs = useMemo(
    () => Array.from({ length: 101 }, (_, i) => {
      const t = i / 100;
      const r = metrics(data, t);
      return {
        t,
        cost: r.fp * fpCost + r.fn * fnCost,
        ...r,
      };
    }),
    [fpCost, fnCost]
  );

  const best = costs.reduce((a, b) => b.cost < a.cost ? b : a);

  return (
    <div
      className="native-viz-content"
      style={{ display: "grid", gap: 22, lineHeight: 1.6 }}
    >
      <header>
        <h3>Calibration & Threshold Studio</h3>
        <p>
          Explore decisions, actual outcomes, probability reliability,
          and error costs using a fixed illustrative dataset of
          {" "}{data.length} observations. Scores are treated as
          candidate probabilities for teaching; calibration is not assumed.
        </p>
      </header>

      <div
        className="native-viz-actions"
        role="group"
        aria-label="Learning difficulty"
      >
        {(["basic", "intermediate", "advanced"] as const).map(l => (
          <button
            key={l}
            type="button"
            className={level === l ? "active" : ""}
            aria-pressed={level === l}
            onClick={() => {
              setLevel(l);
              setAnswers({});
            }}
          >
            {l[0].toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      <section style={box}>
        <h4>
          {level === "basic"
            ? "Basic: scores versus decisions"
            : level === "intermediate"
              ? "Intermediate: metrics and reliability"
              : "Advanced: calibration methods and decision policy"}
        </h4>

        {level === "basic" ? (
          <p>
            A score of 0.80 is the model&apos;s estimate for the
            positive class. At a threshold of 0.50, it becomes a
            positive prediction. Whether scores near 0.80 correspond
            to 80% actual positive outcomes is a separate question
            called calibration.
          </p>
        ) : level === "intermediate" ? (
          <p>
            Threshold selection controls the precision–recall trade-off.
            Calibration measures how closely estimated probabilities
            match observed frequencies. Use the confusion matrix for
            decisions and proper scoring rules to assess probability quality.
          </p>
        ) : (
          <p>
            Choose the decision threshold based on validation data,
            application costs, and deployment prevalence. Evaluate
            calibration separately from discrimination; consider sigmoid
            (Platt) scaling, isotonic regression, dataset shift,
            and reliability uncertainty.
          </p>
        )}
      </section>

      <section style={box}>
        <label htmlFor="calibration-threshold">
          <strong>Decision threshold: {threshold.toFixed(2)}</strong>
        </label>

        <input
          id="calibration-threshold"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          style={{ width: "100%" }}
        />

        <p>
          {m.tp + m.fp} predicted positive;
          {" "}{m.tn + m.fn} predicted negative.
          A score greater than or equal to the threshold is classified positive.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[.2, .35, .5, .65, .8].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setThreshold(t)}
              style={{
                padding: "6px 10px",
                border: "1px solid var(--border,#ccc)",
                borderRadius: 8,
                background:
                  Math.abs(t - threshold) < .001
                    ? "#dbeafe"
                    : "transparent",
                color:
                  Math.abs(t - threshold) < .001
                    ? "#172033"
                    : "inherit",
              }}
            >
              {t.toFixed(2)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Live prediction table</h4>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Case", "Score", "Actual", "Predicted", "Result"].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderBottom: "1px solid var(--border,#ccc)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((s, i) => {
                const p = s.score >= threshold;
                const result = p
                  ? (s.actual ? "TP" : "FP")
                  : (s.actual ? "FN" : "TN");

                return (
                  <tr key={i}>
                    <td style={{ padding: 6 }}>{i + 1}</td>
                    <td>{s.score.toFixed(2)}</td>
                    <td>{s.actual ? "Positive" : "Negative"}</td>
                    <td>{p ? "Positive" : "Negative"}</td>
                    <td><strong>{result}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4>Confusion matrix and live metrics</h4>

        <div style={grid}>
          <Stat label="True positives" value={String(m.tp)} />
          <Stat label="False positives" value={String(m.fp)} />
          <Stat label="False negatives" value={String(m.fn)} />
          <Stat label="True negatives" value={String(m.tn)} />
        </div>

        <div style={{ ...grid, marginTop: 12 }}>
          <Stat
            label="Precision"
            value={pct(m.precision)}
            detail={`${m.tp}/(${m.tp}+${m.fp})`}
          />
          <Stat
            label="Recall"
            value={pct(m.recall)}
            detail={`${m.tp}/(${m.tp}+${m.fn})`}
          />
          <Stat
            label="F1-score"
            value={pct(m.f1)}
            detail="2 × precision × recall / (precision + recall)"
          />
          <Stat
            label="Accuracy"
            value={pct(m.accuracy)}
            detail={`${m.tp + m.tn}/${data.length}`}
          />
          {level !== "basic" && (
            <Stat
              label="Specificity"
              value={pct(m.specificity)}
              detail={`${m.tn}/(${m.tn}+${m.fp})`}
            />
          )}
        </div>

        <p style={{ fontSize: 13 }}>
          When a denominator is zero, this demonstration displays 0;
          production reports should explicitly document undefined metrics.
        </p>
      </section>

      <section>
        <h4>Probability calibration: reliability diagram</h4>

        <p>
          The dashed diagonal represents ideal agreement between average
          predicted probability and observed positive frequency. Blue dots
          show nonempty bins. Small bins are noisy, so do not treat this
          tiny dataset as proof of calibration.
        </p>

        <label>
          Number of bins: {binCount}
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={binCount}
            onChange={e => setBinCount(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <Reliability bins={bins} />

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Bin",
                  "Count",
                  "Mean score",
                  "Observed positive rate",
                ].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: 8,
                      borderBottom: "1px solid var(--border,#ccc)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {bins.map(b => (
                <tr key={b.index}>
                  <td style={{ padding: 6 }}>{b.index + 1}</td>
                  <td>{b.count}</td>
                  <td>{b.count ? pct(b.predicted) : "—"}</td>
                  <td>{b.count ? pct(b.observed) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4>Probability scoring</h4>

        <div style={grid}>
          <Stat
            label="Brier score"
            value={brier.toFixed(4)}
            detail="Mean (score − label)²; lower is better"
          />
          <Stat
            label="Log loss"
            value={logloss.toFixed(4)}
            detail="−mean[y log(p) + (1−y) log(1−p)]"
          />
          {level !== "basic" && (
            <Stat
              label="Binned ECE"
              value={ece.toFixed(4)}
              detail="Weighted absolute calibration gap; bin-dependent"
            />
          )}
        </div>

        <p>
          <strong>Important:</strong> These scores depend on the original
          probability estimates, not the chosen decision threshold.
          Brier score and log loss assess probability quality,
          but neither alone proves perfect calibration.
        </p>
      </section>

      {level !== "basic" && (
        <section>
          <h4>Compare decision thresholds</h4>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 560,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Threshold", "TP", "FP", "FN", "TN",
                    "Precision", "Recall", "F1",
                  ].map(h => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: 7,
                        borderBottom: "1px solid var(--border,#ccc)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[.2, .35, .5, .65, .8].map(t => {
                  const x = metrics(data, t);

                  return (
                    <tr key={t}>
                      <td style={{ padding: 7 }}>{t.toFixed(2)}</td>
                      <td>{x.tp}</td>
                      <td>{x.fp}</td>
                      <td>{x.fn}</td>
                      <td>{x.tn}</td>
                      <td>{pct(x.precision)}</td>
                      <td>{pct(x.recall)}</td>
                      <td>{pct(x.f1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p>
            Lower thresholds generally raise recall while potentially
            increasing false alarms. Higher thresholds often improve
            precision, but precision is not guaranteed to move
            monotonically on every dataset.
          </p>
        </section>
      )}

      {level === "advanced" && (
        <>
          <section style={box}>
            <h4>Cost-sensitive threshold selection</h4>

            <p>
              Set the relative cost of each mistake. This teaching
              example searches thresholds from 0 to 1 in increments
              of 0.01 and minimizes FP × FP cost + FN × FN cost
              on these illustrative labels.
            </p>

            <div style={grid}>
              <label>
                Cost per false positive
                <input
                  aria-label="False positive cost"
                  type="number"
                  min="0"
                  max="10000"
                  value={fpCost}
                  onChange={e =>
                    setFpCost(
                      Math.max(0, Math.min(10000, Number(e.target.value) || 0))
                    )
                  }
                  style={{ display: "block", width: "100%", padding: 8 }}
                />
              </label>

              <label>
                Cost per false negative
                <input
                  aria-label="False negative cost"
                  type="number"
                  min="0"
                  max="10000"
                  value={fnCost}
                  onChange={e =>
                    setFnCost(
                      Math.max(0, Math.min(10000, Number(e.target.value) || 0))
                    )
                  }
                  style={{ display: "block", width: "100%", padding: 8 }}
                />
              </label>
            </div>

            <div style={{ ...grid, marginTop: 12 }}>
              <Stat
                label="Current cost"
                value={String(m.fp * fpCost + m.fn * fnCost)}
              />
              <Stat
                label="Minimum observed cost"
                value={String(best.cost)}
              />
              <Stat
                label="One best threshold"
                value={best.t.toFixed(2)}
              />
            </div>

            <button
              type="button"
              onClick={() => setThreshold(best.t)}
              style={{
                marginTop: 12,
                padding: 10,
                border: "1px solid var(--border,#ccc)",
                borderRadius: 8,
              }}
            >
              Apply minimum-cost threshold
            </button>

            <p style={{ fontSize: 13 }}>
              Never select a threshold using the final test set.
              Use validation or cross-validation, then evaluate
              on held-out test data.
            </p>
          </section>

          <section style={box}>
            <h4>Calibration methods and evaluation pitfalls</h4>

            <p>
              <strong>Sigmoid / Platt scaling:</strong> Fits a logistic
              mapping from raw model scores to calibrated probabilities.
              Often appropriate with limited calibration data,
              but the sigmoid shape may be restrictive.
            </p>

            <p>
              <strong>Isotonic regression:</strong> Learns a
              non-decreasing flexible mapping. It can capture
              nonlinear calibration patterns but can overfit
              small calibration datasets.
            </p>

            <p>
              <strong>Calibration vs discrimination:</strong>
              Discrimination asks whether positives rank above negatives
              (for example ROC-AUC); calibration asks whether stated
              probabilities match empirical rates. A monotone calibration
              transform usually preserves ranking, but ties can change
              ranking metrics.
            </p>

            <p>
              <strong>ECE caveats:</strong> Expected calibration error
              depends on bins, sample size, and aggregation choices.
              Reliability diagrams and proper scoring rules should
              be considered together.
            </p>

            <p>
              <strong>Deployment:</strong> Use held-out calibration data,
              monitor prevalence shift, report uncertainty and subgroup
              performance, and avoid data leakage across training,
              calibration, threshold selection, and final evaluation.
            </p>
          </section>
        </>
      )}

      {level !== "basic" && (
        <section style={box}>
          <h4>Python / scikit-learn example</h4>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              background: "#111827",
              color: "#f3f4f6",
              padding: 14,
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            {`import numpy as np
from sklearn.metrics import (
    confusion_matrix, precision_score, recall_score,
    f1_score, brier_score_loss, log_loss
)
from sklearn.calibration import calibration_curve

y_true = np.array([1, 0, 1, 0, 1, 0])
y_prob = np.array([.92, .75, .65, .40, .33, .12])
threshold = ${threshold.toFixed(2)}
y_pred = (y_prob >= threshold).astype(int)

print(confusion_matrix(y_true, y_pred, labels=[0, 1]))
print("Precision:", precision_score(y_true, y_pred, zero_division=0))
print("Recall:", recall_score(y_true, y_pred, zero_division=0))
print("F1:", f1_score(y_true, y_pred, zero_division=0))
print("Brier:", brier_score_loss(y_true, y_prob))
print("Log loss:", log_loss(y_true, y_prob))
mean_true, mean_pred = calibration_curve(y_true, y_prob, n_bins=3)
print(mean_pred, mean_true)`}
          </pre>

          <p>
            For fitted estimators, use{" "}
            <code>CalibratedClassifierCV</code> with suitable validation
            or cross-validation to avoid fitting calibration on the
            same observations used to train the base estimator.
          </p>
        </section>
      )}

      <section style={box}>
        <h4>
          {level[0].toUpperCase() + level.slice(1)} practice checkpoint
        </h4>

        {quizzes[level].map((q, i) => {
          const key = `${level}-${i}`;

          return (
            <div
              key={key}
              style={{
                padding: "12px 0",
                borderTop: i
                  ? "1px solid var(--border,#ccc)"
                  : "none",
              }}
            >
              <strong>{i + 1}. {q.q}</strong>

              <div style={{ display: "grid", gap: 5, marginTop: 8 }}>
                {q.answers.map((answer, j) => (
                  <label key={answer}>
                    <input
                      type="radio"
                      name={`calibration-${key}`}
                      checked={answers[key] === j}
                      onChange={() =>
                        setAnswers(a => ({ ...a, [key]: j }))
                      }
                    />
                    {" "}{answer}
                  </label>
                ))}
              </div>

              {answers[key] !== undefined && (
                <p>
                  <strong>
                    {answers[key] === q.correct
                      ? "Correct."
                      : "Try again."}
                  </strong>
                  {" "}{q.why}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
