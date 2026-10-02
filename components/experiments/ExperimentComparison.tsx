"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ExperimentMetric,
  ModelMindExperiment,
} from "@/types/experiment";

interface Props {
  experiments: ModelMindExperiment[];
}

export default function ExperimentComparison({
  experiments,
}: Props) {
  const [leftId, setLeftId] =
    useState("");

  const [rightId, setRightId] =
    useState("");

  const left =
    experiments.find(
      (experiment) =>
        experiment.id === leftId
    ) ?? null;

  const right =
    experiments.find(
      (experiment) =>
        experiment.id === rightId
    ) ?? null;

  const metricNames =
    useMemo(() => {
      if (!left || !right) {
        return [];
      }

      return Array.from(
        new Set([
          ...left.metrics.map(
            (metric) => metric.name
          ),
          ...right.metrics.map(
            (metric) => metric.name
          ),
        ])
      );
    }, [left, right]);

  if (experiments.length === 0) {
    return (
      <div
        style={{
          padding: "32px",
        }}
      >
        <h2>
          Experiment Comparison
        </h2>

        <p
          style={{
            opacity: 0.65,
            lineHeight: 1.7,
          }}
        >
          No experiments have been
          recorded yet. ModelMind will
          use this workspace to compare
          models, parameters, metrics and
          training time.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "28px",
        overflow: "auto",
        width: "100%",
      }}
    >
      <h2>
        Experiment Comparison
      </h2>

      <p
        style={{
          opacity: 0.65,
          lineHeight: 1.7,
          maxWidth: "760px",
        }}
      >
        Compare two machine-learning
        experiments. ModelMind shows what
        changed without automatically
        declaring one model universally
        better.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "16px",
          marginTop: "22px",
        }}
      >
        <ExperimentSelector
          label="Experiment A"
          value={leftId}
          experiments={experiments}
          onChange={setLeftId}
        />

        <ExperimentSelector
          label="Experiment B"
          value={rightId}
          experiments={experiments}
          onChange={setRightId}
        />
      </div>

      {left && right && (
        <div
          style={{
            marginTop: "24px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <ComparisonRow
            label="Model"
            left={left.modelName}
            right={right.modelName}
          />

          <ComparisonRow
            label="Task"
            left={left.task}
            right={right.task}
          />

          <ComparisonRow
            label="Training time"
            left={formatTime(
              left.trainingTimeMs
            )}
            right={formatTime(
              right.trainingTimeMs
            )}
          />

          {metricNames.map(
            (metricName) => (
              <ComparisonRow
                key={metricName}
                label={metricName}
                left={metricValue(
                  left.metrics,
                  metricName
                )}
                right={metricValue(
                  right.metrics,
                  metricName
                )}
              />
            )
          )}

          <ComparisonRow
            label="Parameters"
            left={formatParameters(
              left.parameters
            )}
            right={formatParameters(
              right.parameters
            )}
          />
        </div>
      )}
    </div>
  );
}

interface SelectorProps {
  label: string;
  value: string;

  experiments:
    ModelMindExperiment[];

  onChange: (
    value: string
  ) => void;
}

function ExperimentSelector({
  label,
  value,
  experiments,
  onChange,
}: SelectorProps) {
  return (
    <label>
      <div
        style={{
          marginBottom: "7px",
          fontSize: "12px",
          opacity: 0.65,
        }}
      >
        {label}
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={{
          width: "100%",
          padding: "11px",
          borderRadius: "9px",
          border:
            "1px solid rgba(255,255,255,0.1)",
          background: "#11141a",
          color: "inherit",
        }}
      >
        <option value="">
          Select experiment
        </option>

        {experiments.map(
          (experiment) => (
            <option
              key={experiment.id}
              value={experiment.id}
            >
              {experiment.name} —{" "}
              {experiment.modelName}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function ComparisonRow({
  label,
  left,
  right,
}: {
  label: string;
  left: string;
  right: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "180px 1fr 1fr",
        borderBottom:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          padding: "13px",
          opacity: 0.6,
          fontSize: "12px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          padding: "13px",
          whiteSpace: "pre-wrap",
        }}
      >
        {left}
      </div>

      <div
        style={{
          padding: "13px",
          whiteSpace: "pre-wrap",
        }}
      >
        {right}
      </div>
    </div>
  );
}

function metricValue(
  metrics: ExperimentMetric[],
  name: string
): string {
  const metric =
    metrics.find(
      (item) =>
        item.name === name
    );

  if (!metric) {
    return "—";
  }

  return String(metric.value);
}

function formatTime(
  milliseconds: number | null
): string {
  if (milliseconds === null) {
    return "—";
  }

  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(
      0
    )} ms`;
  }

  return `${(
    milliseconds / 1000
  ).toFixed(2)} s`;
}

function formatParameters(
  parameters: Record<
    string,
    string | number | boolean | null
  >
): string {
  const entries =
    Object.entries(parameters);

  if (entries.length === 0) {
    return "Default / not recorded";
  }

  return entries
    .map(
      ([key, value]) =>
        `${key} = ${String(value)}`
    )
    .join("\n");
}