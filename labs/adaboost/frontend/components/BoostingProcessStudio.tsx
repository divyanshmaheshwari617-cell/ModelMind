
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BrainCircuit,
  Target,
  Activity,
  Info,
  CheckCircle2,
  XCircle,
  BarChart3,
  Layers3,
  Calculator,
} from "lucide-react";

import type {
  Task,
  TrainResult,
  BoostingDiagnosticRound,
  BoostingObservation,
  BoostingSample,
} from "@/lib/types";

type Level = "basic" | "intermediate" | "advanced";
type View = "samples" | "weights" | "explain";
type WeightView = "before" | "after";

interface Props {
  result: TrainResult | null;
  stage: number;
  onStageChange?: (stage: number) => void;
}

const colors = {
  panel: "#111d31",
  panelAlt: "#17243b",
  border: "#30425f",
  text: "#edf3ff",
  muted: "#a7b7d0",
  cyan: "#54d6c2",
  purple: "#9477ff",
  red: "#fb7185",
  amber: "#fbbf7b",
  blue: "#60a5fa",
};

const panelStyle: CSSProperties = {
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 20,
};

const buttonBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  borderRadius: 9,
  padding: "10px 14px",
  border: `1px solid ${colors.border}`,
  background: "#1a2a44",
  color: colors.text,
  cursor: "pointer",
  fontWeight: 600,
};

const formatNumber = (
  value: number | null | undefined,
  digits = 4
): string => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value.toFixed(digits);
};

const formatValue = (
  value: string | number | null
): string => {
  if (value === null) return "—";

  return typeof value === "number"
    ? formatNumber(value)
    : String(value);
};

function Panel({
  title,
  children,
  description,
}: {
  title: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <section style={panelStyle}>
      <h3 style={{ marginTop: 0, color: colors.text }}>
        {title}
      </h3>

      {description && (
        <p
          style={{
            color: colors.muted,
            lineHeight: 1.7,
            marginTop: -4,
          }}
        >
          {description}
        </p>
      )}

      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div
      style={{
        background: colors.panelAlt,
        border: `1px solid ${colors.border}`,
        padding: 16,
        borderRadius: 12,
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: colors.muted,
          fontSize: 12,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <strong
        style={{
          display: "block",
          color: colors.text,
          fontSize: 21,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </strong>

      {note && (
        <small style={{ color: colors.muted }}>
          {note}
        </small>
      )}
    </div>
  );
}

function WeightBars({
  observations,
  samples,
  view,
}: {
  observations: BoostingObservation[];
  samples: BoostingSample[];
  view: WeightView;
}) {
  const sampleMap = useMemo(
    () => new Map(samples.map((s) => [s.position, s])),
    [samples]
  );

  const values = observations.map((item) =>
    view === "before"
      ? item.weight_before
      : item.weight_after
  );

  const max = Math.max(
    0,
    ...values.filter(
      (value): value is number =>
        value !== null && Number.isFinite(value)
    )
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {observations.map((item) => {
        const weight =
          view === "before"
            ? item.weight_before
            : item.weight_after;

        const width =
          weight !== null && max > 0
            ? Math.max(0, (weight / max) * 100)
            : 0;

        const sample = sampleMap.get(item.position);

        const color =
          item.correct === false
            ? colors.red
            : colors.cyan;

        return (
          <div key={item.position}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 7,
                color: colors.text,
              }}
            >
              <span>
                Sample{" "}
                {sample?.row_index ?? item.position}
                {" · "}
                {item.correct === true
                  ? "Correct"
                  : item.correct === false
                  ? "Incorrect"
                  : "Unknown"}
              </span>

              <strong>{formatNumber(weight, 6)}</strong>
            </div>

            <div
              style={{
                height: 12,
                background: "#26364e",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${width}%`,
                  background: color,
                  borderRadius: 20,
                  transition: "width 250ms ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SampleTable({
  observations,
  samples,
  task,
}: {
  observations: BoostingObservation[];
  samples: BoostingSample[];
  task: Task;
}) {
  const sampleMap = useMemo(
    () => new Map(samples.map((s) => [s.position, s])),
    [samples]
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: colors.text,
          fontSize: 13,
        }}
      >
        <thead>
          <tr>
            {[
              "Sample",
              "Actual",
              "Prediction",
              task === "classification"
                ? "Outcome"
                : "Absolute error",
            ].map((heading) => (
              <th
                key={heading}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: `1px solid ${colors.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {observations.map((item) => {
            const sample = sampleMap.get(item.position);

            return (
              <tr key={item.position}>
                <td
                  style={{
                    padding: 12,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {sample?.row_index ?? item.position}
                </td>

                <td style={{ padding: 12 }}>
                  {formatValue(item.actual)}
                </td>

                <td style={{ padding: 12 }}>
                  {formatValue(item.predicted)}
                </td>

                <td style={{ padding: 12 }}>
                  {task === "classification" ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color:
                          item.correct === true
                            ? colors.cyan
                            : colors.red,
                      }}
                    >
                      {item.correct === true ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <XCircle size={15} />
                      )}

                      {item.correct === true
                        ? "Correct"
                        : "Incorrect"}
                    </span>
                  ) : (
                    formatNumber(item.absolute_error)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Explanation({
  task,
  level,
  diagnostic,
}: {
  task: Task;
  level: Level;
  diagnostic: BoostingDiagnosticRound;
}) {
  if (level === "basic") {
    return (
      <div style={{ lineHeight: 1.9, color: colors.muted }}>
        <h3 style={{ color: colors.text }}>
          What happened in this round?
        </h3>

        <p>
          AdaBoost trained a weak learner using the
          current training distribution.
        </p>

        {task === "classification" ? (
          <>
            <p>
              The learner predicted a class for each
              training observation. Some predictions
              were correct and others were wrong.
            </p>

            <p>
              AdaBoost increases the relative importance
              of incorrectly classified observations
              when preparing the next learner.
            </p>
          </>
        ) : (
          <>
            <p>
              The weak regressor predicted a numerical
              value for every training observation.
            </p>

            <p>
              AdaBoost.R2 uses normalized prediction
              errors to determine the importance of
              observations in later rounds.
            </p>
          </>
        )}
      </div>
    );
  }

  if (level === "intermediate") {
    return (
      <div style={{ lineHeight: 1.9, color: colors.muted }}>
        <h3 style={{ color: colors.text }}>
          Understanding the diagnostics
        </h3>

        <p>
          <b>Estimator error:</b>{" "}
          {formatNumber(diagnostic.estimator_error)}
        </p>

        <p>
          <b>Estimator contribution:</b>{" "}
          {formatNumber(diagnostic.estimator_weight)}
        </p>

        {task === "classification" ? (
          <>
            <p>
              The estimator error measures how much
              weighted classification error was made
              by this weak learner.
            </p>

            <p>
              A more effective learner generally
              receives greater influence when its
              prediction is combined with other learners.
            </p>

            <p>
              The displayed weak-learner accuracy is
              measured on training observations, not
              on the independent test set.
            </p>
          </>
        ) : (
          <>
            <p>
              AdaBoost.R2 uses error-dependent sampling
              probabilities for successive regressors.
            </p>

            <p>
              Unlike classification, the ensemble
              combines regression predictions using
              a weighted median.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ lineHeight: 1.9, color: colors.muted }}>
      <h3 style={{ color: colors.text }}>
        Mathematical intuition
      </h3>

      {task === "classification" ? (
        <>
          <p>
            For the discrete SAMME algorithm, the
            weighted classification error is:
          </p>

          <div style={formula}>
            ε = Σ wᵢ · I(yᵢ ≠ hₜ(xᵢ)) / Σ wᵢ
          </div>

          <p>
            With K classes, the estimator contribution is:
          </p>

          <div style={formula}>
            αₜ = learning_rate ×
            [ln((1 − εₜ) / εₜ) + ln(K − 1)]
          </div>

          <p>
            The relative sample-weight update is:
          </p>

          <div style={formula}>
            wᵢ(new) ∝ wᵢ(old) ×
            exp(αₜ × I(yᵢ ≠ hₜ(xᵢ)))
          </div>

          <p>
            The reconstructed weights shown in this
            studio illustrate this mathematical rule.
            They are not historical weights recorded
            directly by scikit-learn.
          </p>
        </>
      ) : (
        <>
          <p>
            AdaBoost.R2 computes absolute prediction errors
            and scales them relative to the maximum error.
          </p>

          <div style={formula}>
            Lᵢ = |yᵢ − hₜ(xᵢ)| / maxⱼ |yⱼ − hₜ(xⱼ)|
          </div>

          <p>
            Depending on the selected loss, normalized
            errors can be transformed using linear,
            square, or exponential loss.
          </p>

          <p>
            The final regression ensemble uses
            a weighted median rather than the
            classification voting rule.
          </p>
        </>
      )}
    </div>
  );
}

const formula: CSSProperties = {
  margin: "12px 0",
  padding: 15,
  background: "#091528",
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  color: colors.cyan,
  fontFamily: "monospace",
  overflowX: "auto",
};

export default function BoostingProcessStudio({
  result,
  stage,
  onStageChange,
}: Props) {
  const [localStage, setLocalStage] = useState(stage);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [view, setView] = useState<View>("samples");
  const [level, setLevel] = useState<Level>("basic");
  const [weightView, setWeightView] =
    useState<WeightView>("before");

  const diagnostics = result?.boosting_diagnostics;

  const rounds = diagnostics?.rounds ?? [];

  const roundNumbers = useMemo(
    () => rounds.map((round) => round.round),
    [rounds]
  );

  const selectedStage = onStageChange
    ? stage
    : localStage;

  const activeIndex = useMemo(() => {
    if (!rounds.length) return -1;

    const exact = roundNumbers.indexOf(
      selectedStage + 1
    );

    if (exact >= 0) return exact;

    // Diagnostics may contain only sampled rounds
    // when the ensemble exceeds 80 estimators.
    let closest = 0;
    let distance = Infinity;

    roundNumbers.forEach((round, index) => {
      const difference = Math.abs(
        round - (selectedStage + 1)
      );

      if (difference < distance) {
        distance = difference;
        closest = index;
      }
    });

    return closest;
  }, [rounds.length, roundNumbers, selectedStage]);

  const active =
    activeIndex >= 0
      ? rounds[activeIndex]
      : null;

  function changeRound(index: number) {
    if (
      index < 0 ||
      index >= rounds.length
    ) {
      return;
    }

    const newStage = rounds[index].round - 1;

    setLocalStage(newStage);
    onStageChange?.(newStage);
    setWeightView("before");
  }

  useEffect(() => {
    if (!playing || rounds.length < 2) return;

    const timer = window.setInterval(() => {
      const currentIndex = roundNumbers.indexOf(
        selectedStage + 1
      );

      const nextIndex =
        currentIndex >= 0
          ? currentIndex + 1
          : roundNumbers.findIndex(
              (round) => round > selectedStage + 1
            );

      if (
        nextIndex < 0 ||
        nextIndex >= rounds.length
      ) {
        setPlaying(false);
        return;
      }

      const nextStage = rounds[nextIndex].round - 1;

      setLocalStage(nextStage);
      onStageChange?.(nextStage);
    }, speed);

    return () => window.clearInterval(timer);
  }, [
    playing,
    speed,
    rounds,
    roundNumbers,
    selectedStage,
    onStageChange,
  ]);

  if (!result) {
    return (
      <div style={panelStyle}>
        <BrainCircuit
          size={36}
          color={colors.purple}
        />

        <h2 style={{ color: colors.text }}>
          Step-by-Step Boosting Process
        </h2>

        <p style={{ color: colors.muted }}>
          Train an AdaBoost model to explore its
          fitted weak learners, predictions,
          mistakes, and boosting diagnostics.
        </p>
      </div>
    );
  }

  if (!diagnostics || !active) {
    return (
      <div style={panelStyle}>
        <Info color={colors.amber} />

        <h3 style={{ color: colors.text }}>
          Boosting diagnostics unavailable
        </h3>

        <p style={{ color: colors.muted }}>
          The current training result does not contain
          detailed boosting diagnostics. Run training
          again using the updated backend.
        </p>
      </div>
    );
  }

  const isClassification =
    result.task === "classification";

  const hasNext =
    activeIndex < rounds.length - 1;

  const hasPrevious = activeIndex > 0;

  const incorrect = active.observations.filter(
    (item) => item.correct === false
  ).length;

  const correct = active.observations.filter(
    (item) => item.correct === true
  ).length;

  return (
    <div
      style={{
        color: colors.text,
        display: "grid",
        gap: 18,
      }}
    >
      {/* HEADER */}

      <section
        style={{
          ...panelStyle,
          background:
            "linear-gradient(120deg,#15243c,#251c4c)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: colors.cyan,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <BrainCircuit size={18} />
          MODELMIND BOOSTING LAB
        </div>

        <h2 style={{ fontSize: 27, marginBottom: 8 }}>
          Step-by-Step Boosting Process
        </h2>

        <p
          style={{
            color: colors.muted,
            lineHeight: 1.8,
          }}
        >
          Explore how individual weak learners
          contribute to your AdaBoost ensemble.
          Investigate sample predictions, training
          errors and changes across boosting rounds.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 9,
            marginTop: 16,
          }}
        >
          <span style={chipStyle}>
            <Layers3 size={14} />
            {diagnostics.total_estimators} learners
          </span>

          <span style={chipStyle}>
            <Target size={14} />
            {diagnostics.sample_count} sampled observations
          </span>

          <span style={chipStyle}>
            <Activity size={14} />
            {result.task}
          </span>
        </div>
      </section>

      {/* ROUND NAVIGATION */}

      <Panel
        title="Boosting Round Explorer"
        description="Navigate fitted weak learners and inspect their individual predictions."
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                color: colors.muted,
                fontSize: 13,
              }}
            >
              Selected boosting round
            </div>

            <strong style={{ fontSize: 26 }}>
              {active.round}
              <span
                style={{
                  fontSize: 16,
                  color: colors.muted,
                }}
              >
                {" / "}
                {diagnostics.total_estimators}
              </span>
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              style={buttonBase}
              disabled={!hasPrevious}
              onClick={() =>
                changeRound(activeIndex - 1)
              }
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              style={buttonBase}
              onClick={() => {
                setPlaying(false);
                changeRound(0);
              }}
            >
              <RotateCcw size={16} />
            </button>

            <button
              style={buttonBase}
              disabled={rounds.length < 2}
              onClick={() => {
                if (!playing && !hasNext) {
                  changeRound(0);
                }

                setPlaying((old) => !old);
              }}
            >
              {playing ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}

              {playing ? "Pause" : "Play"}
            </button>

            <button
              style={buttonBase}
              disabled={!hasNext}
              onClick={() =>
                changeRound(activeIndex + 1)
              }
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(0, rounds.length - 1)}
          value={Math.max(0, activeIndex)}
          aria-label="Boosting diagnostic round"
          onChange={(event) => {
            setPlaying(false);
            changeRound(Number(event.target.value));
          }}
          style={{
            width: "100%",
            marginTop: 20,
            accentColor: colors.purple,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            color: colors.muted,
            fontSize: 12,
            marginTop: 8,
          }}
        >
          <span>Round {rounds[0]?.round}</span>

          <label>
            Playback speed{" "}
            <select
              value={speed}
              onChange={(event) =>
                setSpeed(Number(event.target.value))
              }
              style={{
                background: colors.panelAlt,
                color: colors.text,
                padding: 7,
                borderRadius: 7,
              }}
            >
              <option value={1600}>Slow</option>
              <option value={800}>Normal</option>
              <option value={350}>Fast</option>
            </select>
          </label>

          <span>
            Round {rounds[rounds.length - 1]?.round}
          </span>
        </div>

        {diagnostics.returned_rounds <
          diagnostics.total_estimators && (
          <p
            style={{
              color: colors.amber,
              marginTop: 14,
            }}
          >
            The backend returned a representative
            selection of boosting rounds to keep
            visualization responsive. The model
            itself still uses all fitted estimators.
          </p>
        )}
      </Panel>

      {/* ROUND METRICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(170px,1fr))",
          gap: 12,
        }}
      >
        <Stat
          label="Estimator error"
          value={formatNumber(active.estimator_error)}
          note="Backend estimator diagnostic"
        />

        <Stat
          label="Estimator weight"
          value={formatNumber(active.estimator_weight)}
          note="Contribution to ensemble"
        />

        <Stat
          label={
            isClassification
              ? "Weak learner accuracy"
              : "Weak learner MAE"
          }
          value={formatNumber(
            isClassification
              ? active.weak_learner_accuracy
              : active.weak_learner_mae
          )}
          note="Full training set"
        />

        <Stat
          label="Sample observations"
          value={String(active.observations.length)}
          note="Selected for inspection"
        />
      </div>

      {/* VIEW SELECTION */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
        }}
      >
        {(
          [
            ["samples", "Sample Predictions", BarChart3],
            ["weights", "Sample Weights", Target],
            ["explain", "Explain This Round", Calculator],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => {
              setView(id);
              setWeightView("before");
            }}
            style={{
              ...buttonBase,
              background:
                view === id
                  ? "#7555ee"
                  : "#1a2a44",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* SAMPLE PREDICTIONS */}

      {view === "samples" && (
        <Panel
          title="Weak Learner Predictions"
          description="Predictions come from the selected fitted decision tree, not the final ensemble."
        >
          {isClassification && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <span style={{ color: colors.cyan }}>
                <CheckCircle2 size={16} style={{ verticalAlign: "middle" }} />
                {" "}
                {correct} correct
              </span>

              <span style={{ color: colors.red }}>
                <XCircle size={16} style={{ verticalAlign: "middle" }} />
                {" "}
                {incorrect} incorrect
              </span>
            </div>
          )}

          <SampleTable
            observations={active.observations}
            samples={diagnostics.samples}
            task={result.task}
          />

          <p
            style={{
              color: colors.muted,
              fontSize: 12,
              marginTop: 16,
              lineHeight: 1.7,
            }}
          >
            These rows are a deterministic sample
            of the training dataset. The number of
            correct and incorrect predictions above
            applies only to these displayed rows.
          </p>
        </Panel>
      )}

      {/* SAMPLE WEIGHTS */}

      {view === "weights" && (
        <Panel
          title={
            isClassification
              ? "Classification Weight Evolution"
              : "Regression Error Analysis"
          }
        >
          {isClassification ? (
            <>
              <p
                style={{
                  color: colors.muted,
                  lineHeight: 1.8,
                }}
              >
                Compare reconstructed sample
                importance immediately before and
                after the selected learner.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 9,
                  marginBottom: 20,
                }}
              >
                {(["before", "after"] as const).map(
                  (item) => (
                    <button
                      key={item}
                      style={{
                        ...buttonBase,
                        background:
                          weightView === item
                            ? "#7555ee"
                            : "#1a2a44",
                      }}
                      onClick={() =>
                        setWeightView(item)
                      }
                    >
                      {item === "before"
                        ? "Before update"
                        : "After update"}
                    </button>
                  )
                )}
              </div>

              {weightView === "after" &&
              active.observations.every(
                (item) => item.weight_after === null
              ) ? (
                <p style={{ color: colors.amber }}>
                  No subsequent weight update is
                  available for this final learner.
                </p>
              ) : (
                <WeightBars
                  observations={active.observations}
                  samples={diagnostics.samples}
                  view={weightView}
                />
              )}

              <div
                style={{
                  ...panelStyle,
                  marginTop: 20,
                  background: "#1b293e",
                }}
              >
                <Info
                  size={17}
                  color={colors.amber}
                />

                <p
                  style={{
                    color: colors.muted,
                    lineHeight: 1.8,
                  }}
                >
                  {diagnostics.weight_note}
                </p>

                <p
                  style={{
                    color: colors.muted,
                    fontSize: 12,
                  }}
                >
                  Bar lengths are scaled relative to
                  the largest displayed sample weight.
                  Values represent weights over the
                  full training distribution, not
                  percentages within this sample.
                </p>
              </div>
            </>
          ) : (
            <>
              <p
                style={{
                  color: colors.muted,
                  lineHeight: 1.8,
                }}
              >
                Historical AdaBoost.R2 sample
                weights are not included in the
                fitted model diagnostics.
              </p>

              <p
                style={{
                  color: colors.amber,
                }}
              >
                {diagnostics.weight_note}
              </p>

              <SampleTable
                observations={active.observations}
                samples={diagnostics.samples}
                task={result.task}
              />
            </>
          )}
        </Panel>
      )}

      {/* EXPLANATION */}

      {view === "explain" && (
        <Panel title="Learn the Mathematics">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 9,
              marginBottom: 20,
            }}
          >
            {(
              [
                "basic",
                "intermediate",
                "advanced",
              ] as const
            ).map((item) => (
              <button
                key={item}
                style={{
                  ...buttonBase,
                  background:
                    level === item
                      ? "#7555ee"
                      : "#1a2a44",
                }}
                onClick={() => setLevel(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <Explanation
            task={result.task}
            level={level}
            diagnostic={active}
          />
        </Panel>
      )}

      {/* FINAL NOTE */}

      <div
        style={{
          color: colors.muted,
          fontSize: 12,
          lineHeight: 1.8,
          display: "flex",
          alignItems: "flex-start",
          gap: 9,
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />

        <span>
          The displayed diagnostics come from fitted
          weak learners. Classification weights are
          reconstructed educational values, while
          AdaBoost.R2 historical weights are unavailable.
          Ensemble performance should be evaluated
          separately using the train/test learning curves.
        </span>
      </div>
    </div>
  );
}

const chipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "8px 12px",
  borderRadius: 9,
  background: "#1b3049",
  border: `1px solid ${colors.border}`,
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
};
