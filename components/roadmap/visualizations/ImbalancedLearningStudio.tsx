
"use client";

import { useMemo, useState, type CSSProperties } from "react";

type Level = "basic" | "intermediate" | "advanced";
type Method = "original" | "oversample" | "undersample" | "smote" | "weights";
type Point = { x: number; y: number; label: 0 | 1; synthetic?: boolean };

const panel: CSSProperties = {
  border: "1px solid var(--border, #d1d5db)",
  borderRadius: 12,
  padding: 16,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const methods: { id: Method; name: string }[] = [
  { id: "original", name: "Original" },
  { id: "oversample", name: "Oversampling" },
  { id: "undersample", name: "Undersampling" },
  { id: "smote", name: "SMOTE" },
  { id: "weights", name: "Class weights" },
];

function Metric({ title, value, note }: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <div style={panel}>
      <div style={{ fontSize: 13, opacity: .8 }}>{title}</div>
      <strong style={{ fontSize: 25 }}>{value}</strong>
      {note && <p style={{ fontSize: 12 }}>{note}</p>}
    </div>
  );
}

function makePoints(minority: number): Point[] {
  const majorityCount = 100 - minority;
  const minorityCount = minority;

  const majority: Point[] = Array.from(
    { length: majorityCount },
    (_, i) => ({
      x: 15 + ((i * 37) % 65),
      y: 12 + ((i * 29) % 65),
      label: 0 as const,
    })
  );

  const positive: Point[] = Array.from(
    { length: minorityCount },
    (_, i) => ({
      x: 45 + ((i * 13) % 43),
      y: 45 + ((i * 17) % 43),
      label: 1 as const,
    })
  );

  return [...majority, ...positive];
}

function transformPoints(points: Point[], method: Method): Point[] {
  const majority = points.filter(p => p.label === 0);
  const minority = points.filter(p => p.label === 1);

  if (method === "original" || method === "weights") return points;

  if (method === "undersample") {
    return [
      ...majority.slice(0, minority.length),
      ...minority,
    ];
  }

  if (method === "oversample") {
    return [
      ...majority,
      ...Array.from(
        { length: majority.length },
        (_, i) => ({
          ...minority[i % minority.length],
          synthetic: true,
        })
      ),
    ];
  }

  const synthetic = Array.from(
    { length: Math.max(0, majority.length - minority.length) },
    (_, i): Point => {
      const a = minority[i % minority.length];
      const b = minority[(i + 1) % minority.length];
      const alpha = ((i * 17) % 97) / 100;

      return {
        x: a.x + alpha * (b.x - a.x),
        y: a.y + alpha * (b.y - a.y),
        label: 1,
        synthetic: true,
      };
    }
  );

  return [...points, ...synthetic];
}

function Scatter({ points }: { points: Point[] }) {
  return (
    <svg
      viewBox="0 0 400 300"
      style={{ width: "100%", maxWidth: 650 }}
      role="img"
      aria-label="Illustrative class distribution scatter plot"
    >
      <rect
        x="25" y="15" width="350" height="255"
        fill="none" stroke="currentColor" strokeOpacity=".4"
      />

      {points.map((p, i) => (
        <circle
          key={i}
          cx={25 + p.x * 3.5}
          cy={270 - p.y * 2.55}
          r={p.synthetic ? 4 : 3}
          fill={p.label ? "#e11d48" : "#2563eb"}
          opacity={p.synthetic ? .4 : .75}
          stroke={p.synthetic ? "#be123c" : "none"}
          strokeWidth="1"
        >
          <title>
            {p.label ? "Minority" : "Majority"}
            {p.synthetic ? " (resampled/synthetic)" : ""}
          </title>
        </circle>
      ))}

      <text x="25" y="290" fontSize="11" fill="currentColor">
        Feature 1
      </text>
      <text x="8" y="15" fontSize="11" fill="currentColor">
        Feature 2
      </text>
      <circle cx="195" cy="289" r="4" fill="#2563eb" />
      <text x="204" y="293" fontSize="10" fill="currentColor">
        Majority
      </text>
      <circle cx="270" cy="289" r="4" fill="#e11d48" />
      <text x="279" y="293" fontSize="10" fill="currentColor">
        Minority
      </text>
    </svg>
  );
}

export default function ImbalancedLearningStudio() {
  const [level, setLevel] = useState<Level>("basic");
  const [method, setMethod] = useState<Method>("original");
  const [minority, setMinority] = useState(10);
  const [weight, setWeight] = useState(5);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const points = useMemo(() => makePoints(minority), [minority]);
  const changed = useMemo(
    () => transformPoints(points, method),
    [points, method]
  );

  const positive = changed.filter(p => p.label === 1).length;
  const negative = changed.filter(p => p.label === 0).length;
  const ratio = positive / Math.max(1, changed.length);

  const examples = {
    original: "Use the original training class distribution.",
    oversample:
      "Random oversampling duplicates minority examples. It increases their frequency without creating new feature values.",
    undersample:
      "Random undersampling removes majority examples. It balances counts but may discard useful information.",
    smote:
      "SMOTE interpolates new minority examples between minority neighbors. This is a simplified two-dimensional teaching illustration.",
    weights:
      "Class weighting increases the penalty for mistakes on the minority class without changing the dataset size.",
  };

  const quiz = level === "basic"
    ? {
        q: "A dataset has 95 negatives and 5 positives. A model predicts all negatives. What is its accuracy?",
        options: ["5%", "50%", "95%"],
        correct: 2,
        why: "It correctly predicts 95 of 100 cases but misses every positive.",
      }
    : level === "intermediate"
      ? {
          q: "When should SMOTE be applied?",
          options: [
            "Before train/test splitting",
            "Only to training folds",
            "To the final test set",
          ],
          correct: 1,
          why: "Resampling test data or validation data creates leakage or distorts evaluation.",
        }
      : {
          q: "Does oversampling automatically improve real-world precision?",
          options: ["Yes", "No"],
          correct: 1,
          why: "Precision depends on false positives, recall, prevalence, and the trained decision policy.",
        };

  const key = `${level}-${quiz.q}`;

  return (
    <div
      className="native-viz-content"
      style={{ display: "grid", gap: 22, lineHeight: 1.6 }}
    >
      <header>
        <h3>Imbalanced Learning & Resampling Studio</h3>
        <p>
          Explore why high accuracy can be misleading and how different
          training strategies affect class representation.
          All examples are illustrative, not trained ML model results.
        </p>
      </header>

      <div className="native-viz-actions" role="group" aria-label="Difficulty">
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

      <section style={panel}>
        <h4>
          {level === "basic"
            ? "Basic: Understand class imbalance"
            : level === "intermediate"
              ? "Intermediate: Compare resampling strategies"
              : "Advanced: Cost-sensitive learning and evaluation"}
        </h4>

        <p>
          {level === "basic"
            ? "Class imbalance means one target class appears much more frequently than another. For example, a fraud dataset may contain 99% legitimate transactions and 1% fraud."
            : level === "intermediate"
              ? "Oversampling, undersampling, and SMOTE modify the training distribution. They may help a model learn minority patterns, but they are not guaranteed to improve test performance."
              : "Use resampling inside cross-validation training folds, compare class-weighted models, monitor PR-AUC and recall at a chosen precision, and evaluate on the untouched natural-prevalence test set."}
        </p>
      </section>

      <section style={panel}>
        <label>
          <strong>Minority class: {minority}%</strong>
          <input
            type="range"
            min="1"
            max="50"
            value={minority}
            onChange={e => setMinority(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <div style={{ ...grid, marginTop: 12 }}>
          <Metric title="Original majority" value={`${100 - minority}%`} />
          <Metric title="Original minority" value={`${minority}%`} />
          <Metric
            title="Majority-only accuracy"
            value={`${100 - minority}%`}
            note="Minority recall = 0% when the model predicts only the majority class."
          />
        </div>
      </section>

      <section style={panel}>
        <h4>Choose a learning strategy</h4>

        <div
          className="native-viz-actions"
          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {methods.map(m => (
            <button
              key={m.id}
              type="button"
              className={method === m.id ? "active" : ""}
              aria-pressed={method === m.id}
              onClick={() => setMethod(m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>

        <p>{examples[method]}</p>

        <Scatter points={changed} />

        <div style={grid}>
          <Metric title="Displayed majority" value={String(negative)} />
          <Metric title="Displayed minority" value={String(positive)} />
          <Metric title="Displayed minority share" value={`${(ratio * 100).toFixed(1)}%`} />
        </div>

        {method === "weights" && (
          <div style={{ marginTop: 16 }}>
            <label>
              Minority class weight: {weight}
              <input
                type="range"
                min="1"
                max="20"
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </label>

            <p>
              In weighted classification, a minority error may contribute
              {` ${weight} times `}as much loss as an equally severe
              majority error, depending on the loss function.
              Dataset counts remain unchanged.
            </p>
          </div>
        )}
      </section>

      {level !== "basic" && (
        <section style={panel}>
          <h4>Method comparison</h4>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Method", "Changes rows?", "Key trade-off"].map(h => (
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
                {[
                  ["Oversampling", "Yes", "Duplicates may encourage overfitting"],
                  ["Undersampling", "Yes", "May lose useful majority information"],
                  ["SMOTE", "Yes", "Synthetic samples may cross class boundaries"],
                  ["Class weights", "No", "Alters optimization, not sample count"],
                ].map(row => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ padding: 8 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {level === "advanced" && (
        <section style={panel}>
          <h4>Advanced evaluation principles</h4>

          <p>
            <strong>Precision:</strong> TP / (TP + FP). It tells you
            how many flagged cases are actually positive.
          </p>

          <p>
            <strong>Recall:</strong> TP / (TP + FN). It tells you
            how many actual positives the model finds.
          </p>

          <p>
            <strong>PR-AUC:</strong> Summarizes precision–recall
            behavior across thresholds. It is especially informative
            for many rare-event problems, alongside ROC-AUC,
            confusion matrices, and operational costs.
          </p>

          <p>
            <strong>Data leakage:</strong> Split the dataset before
            resampling. During cross-validation, fit the sampler only
            on each training fold. Keep validation and test sets at
            their original distribution.
          </p>

          <p>
            <strong>Calibration:</strong> Resampling may change
            predicted probability calibration. Evaluate probabilities
            on untouched validation data.
          </p>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              background: "#111827",
              color: "#f9fafb",
              padding: 14,
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            {`# Example: install imbalanced-learn separately
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score

pipeline = Pipeline([
    ("smote", SMOTE(random_state=42)),
    ("model", LogisticRegression(max_iter=1000))
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(
    pipeline, X_train, y_train,
    scoring="average_precision",
    cv=cv
)
print("Mean average precision:", scores.mean())

# Evaluate once on the untouched held-out test set.`}
          </pre>

          <p style={{ fontSize: 13 }}>
            This is an instructional snippet. It assumes X_train and
            y_train are already defined, and that each training fold
            contains enough minority samples for the chosen SMOTE
            neighbor setting.
          </p>
        </section>
      )}

      <section style={panel}>
        <h4>Practice checkpoint</h4>

        <p><strong>{quiz.q}</strong></p>

        {quiz.options.map((option, i) => (
          <label
            key={option}
            style={{ display: "block", marginBottom: 8 }}
          >
            <input
              type="radio"
              name={`imbalance-${level}`}
              checked={answers[key] === i}
              onChange={() =>
                setAnswers(a => ({ ...a, [key]: i }))
              }
            />
            {" "}{option}
          </label>
        ))}

        {answers[key] !== undefined && (
          <p>
            <strong>
              {answers[key] === quiz.correct ? "Correct." : "Try again."}
            </strong>
            {" "}{quiz.why}
          </p>
        )}
      </section>
    </div>
  );
}
