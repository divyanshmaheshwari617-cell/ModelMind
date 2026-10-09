
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Eye,
  EyeOff,
  Info,
  Maximize2,
} from "lucide-react";

import type {
  EnsembleTrainingResponse,
  EnsemblePlotPoint,
} from "@/lib/api/ensembleApi";

interface Props {
  result: EnsembleTrainingResponse;
}

const WIDTH = 900;
const HEIGHT = 520;
const LEFT = 76;
const RIGHT = 30;
const TOP = 30;
const BOTTOM = 72;

const plotWidth = WIDTH - LEFT - RIGHT;
const plotHeight = HEIGHT - TOP - BOTTOM;

const CLASS_COLORS = [
  "#818cf8",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#22d3ee",
  "#facc15",
  "#a78bfa",
  "#f87171",
];

function formatNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return "N/A";
  return Number(value.toFixed(digits)).toString();
}

function extent(values: number[]): [number, number] {
  const valid = values.filter(Number.isFinite);

  if (valid.length === 0) return [-1, 1];

  const min = Math.min(...valid);
  const max = Math.max(...valid);

  if (min === max) {
    const padding = Math.max(1, Math.abs(min) * 0.1);
    return [min - padding, max + padding];
  }

  return [min, max];
}

function scale(
  value: number,
  min: number,
  max: number,
  start: number,
  end: number,
): number {
  if (max === min) return (start + end) / 2;

  return (
    start + ((value - min) / (max - min)) * (end - start)
  );
}

function colorForClass(
  label: number,
  classes: number[],
): string {
  const index = Math.max(0, classes.indexOf(label));
  return CLASS_COLORS[index % CLASS_COLORS.length];
}

function regressionColor(
  value: number,
  min: number,
  max: number,
): string {
  const fraction =
    max === min
      ? 0.5
      : Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Blue (low) to violet (middle) to orange (high).
  const hue = 215 - fraction * 190;
  return `hsl(${hue} 75% 53%)`;
}

function Ticks({
  min,
  max,
  axis,
}: {
  min: number;
  max: number;
  axis: "x" | "y";
}) {
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => {
        const value = min + ((max - min) * i) / 5;

        if (axis === "x") {
          const x = scale(
            value,
            min,
            max,
            LEFT,
            LEFT + plotWidth,
          );

          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={TOP}
                y2={TOP + plotHeight}
                stroke="#263246"
                strokeDasharray="3 6"
              />
              <text
                x={x}
                y={TOP + plotHeight + 24}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize={12}
              >
                {formatNumber(value, 2)}
              </text>
            </g>
          );
        }

        const y = scale(
          value,
          min,
          max,
          TOP + plotHeight,
          TOP,
        );

        return (
          <g key={i}>
            <line
              x1={LEFT}
              x2={LEFT + plotWidth}
              y1={y}
              y2={y}
              stroke="#263246"
              strokeDasharray="3 6"
            />
            <text
              x={LEFT - 12}
              y={y + 4}
              textAnchor="end"
              fill="#94a3b8"
              fontSize={12}
            >
              {formatNumber(value, 2)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function PlotPoints({
  points,
  xMin,
  xMax,
  yMin,
  yMax,
  isTwoFeature,
  isClassification,
  classes,
  test,
}: {
  points: EnsemblePlotPoint[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  isTwoFeature: boolean;
  isClassification: boolean;
  classes: number[];
  test: boolean;
}) {
  return (
    <g>
      {points.map((point, index) => {
        if (point.x === null || point.actual === null) {
          return null;
        }

        const yValue = isTwoFeature
          ? point.y
          : point.actual;

        if (yValue === null || yValue === undefined) {
          return null;
        }

        const cx = scale(
          point.x,
          xMin,
          xMax,
          LEFT,
          LEFT + plotWidth,
        );

        const cy = scale(
          yValue,
          yMin,
          yMax,
          TOP + plotHeight,
          TOP,
        );

        const color = isClassification
          ? colorForClass(point.actual, classes)
          : test
            ? "#fbbf24"
            : "#38bdf8";

        return (
          <circle
            key={`${test ? "test" : "train"}-${index}`}
            cx={cx}
            cy={cy}
            r={test ? 5.1 : 3.6}
            fill={test ? "#0b1220" : color}
            stroke={color}
            strokeWidth={test ? 2.2 : 1}
            opacity={test ? 1 : 0.8}
          >
            <title>
              {[
                test ? "Test sample" : "Training sample",
                `X: ${formatNumber(point.x)}`,
                isTwoFeature
                  ? `Y: ${formatNumber(yValue)}`
                  : null,
                `Actual: ${formatNumber(point.actual)}`,
                point.predicted !== undefined &&
                point.predicted !== null
                  ? `Predicted: ${formatNumber(point.predicted)}`
                  : null,
              ]
                .filter(Boolean)
                .join("\n")}
            </title>
          </circle>
        );
      })}
    </g>
  );
}

export default function Ensemble2DChart({
  result,
}: Props) {
  const [showTrain, setShowTrain] = useState(true);
  const [showTest, setShowTest] = useState(true);
  const [showSurface, setShowSurface] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const visualization = result.visualization;
  const classification = result.task === "classification";

  const xValues = visualization.x_values;
  const yValues = visualization.y_values;

  const isTwoFeature =
    visualization.y_feature !== null &&
    yValues.length > 0 &&
    Array.isArray(visualization.z_values);

  const classes = useMemo(() => {
    if (!classification) return [];

    return Array.from(
      new Set(
        [
          ...visualization.train_points,
          ...visualization.test_points,
        ]
          .map((point) => point.actual)
          .filter((value): value is number => value !== null),
      ),
    ).sort((a, b) => a - b);
  }, [visualization, classification]);

  const [xMin, xMax] = extent(xValues);

  const verticalValues = isTwoFeature
    ? yValues
    : [
        ...visualization.train_points.map(
          (point) => point.actual,
        ),
        ...visualization.test_points.map(
          (point) => point.actual,
        ),
        ...(visualization.predictions ?? []),
      ].filter((value): value is number => value !== null);

  const [rawYMin, rawYMax] = extent(verticalValues);

  const yPadding = isTwoFeature
    ? 0
    : Math.max((rawYMax - rawYMin) * 0.08, 0.1);

  const yMin = rawYMin - yPadding;
  const yMax = rawYMax + yPadding;

  const zValues = visualization.z_values ?? [];
  const flatZ = zValues.flat().filter(Number.isFinite);

  const [zMin, zMax] = extent(flatZ);

  const cellWidth =
    xValues.length > 1
      ? plotWidth / (xValues.length - 1)
      : plotWidth;

  const cellHeight =
    yValues.length > 1
      ? plotHeight / (yValues.length - 1)
      : plotHeight;

  const curvePoints =
    visualization.predictions?.map((prediction, index) => {
      const x = xValues[index];

      return `${scale(
        x,
        xMin,
        xMax,
        LEFT,
        LEFT + plotWidth,
      )},${scale(
        prediction,
        yMin,
        yMax,
        TOP + plotHeight,
        TOP,
      )}`;
    }).join(" ") ?? "";

  const chart = (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${result.model} fitted ${
        classification ? "classification" : "regression"
      } visualization`}
    >
      <defs>
        <clipPath id="ensemble-plot-clip">
          <rect
            x={LEFT}
            y={TOP}
            width={plotWidth}
            height={plotHeight}
          />
        </clipPath>
      </defs>

      <rect
        x={LEFT}
        y={TOP}
        width={plotWidth}
        height={plotHeight}
        rx={8}
        fill="#0a1220"
      />

      <g clipPath="url(#ensemble-plot-clip)">
        {isTwoFeature &&
          showSurface &&
          zValues.map((row, rowIndex) =>
            row.map((prediction, columnIndex) => {
              const x = scale(
                xValues[columnIndex],
                xMin,
                xMax,
                LEFT,
                LEFT + plotWidth,
              );

              const y = scale(
                yValues[rowIndex],
                yMin,
                yMax,
                TOP + plotHeight,
                TOP,
              );

              const color = classification
                ? colorForClass(prediction, classes)
                : regressionColor(
                    prediction,
                    zMin,
                    zMax,
                  );

              return (
                <rect
                  key={`${rowIndex}-${columnIndex}`}
                  x={x - cellWidth / 2}
                  y={y - cellHeight / 2}
                  width={cellWidth + 1}
                  height={cellHeight + 1}
                  fill={color}
                  opacity={0.37}
                >
                  <title>
                    {`${visualization.x_feature}: ${formatNumber(
                      xValues[columnIndex],
                    )}\n${visualization.y_feature}: ${formatNumber(
                      yValues[rowIndex],
                    )}\nPrediction: ${formatNumber(prediction)}`}
                  </title>
                </rect>
              );
            }),
          )}
      </g>

      <Ticks
        min={xMin}
        max={xMax}
        axis="x"
      />
      <Ticks
        min={yMin}
        max={yMax}
        axis="y"
      />

      <g clipPath="url(#ensemble-plot-clip)">
        {!isTwoFeature &&
          showSurface &&
          curvePoints && (
            <polyline
              points={curvePoints}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

        {showTrain && (
          <PlotPoints
            points={visualization.train_points}
            xMin={xMin}
            xMax={xMax}
            yMin={yMin}
            yMax={yMax}
            isTwoFeature={isTwoFeature}
            isClassification={classification}
            classes={classes}
            test={false}
          />
        )}

        {showTest && (
          <PlotPoints
            points={visualization.test_points}
            xMin={xMin}
            xMax={xMax}
            yMin={yMin}
            yMax={yMax}
            isTwoFeature={isTwoFeature}
            isClassification={classification}
            classes={classes}
            test
          />
        )}
      </g>

      <rect
        x={LEFT}
        y={TOP}
        width={plotWidth}
        height={plotHeight}
        rx={8}
        fill="none"
        stroke="#475569"
      />

      <text
        x={LEFT + plotWidth / 2}
        y={HEIGHT - 18}
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize={14}
      >
        {visualization.x_feature}
      </text>

      <text
        transform={`translate(20 ${
          TOP + plotHeight / 2
        }) rotate(-90)`}
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize={14}
      >
        {isTwoFeature
          ? visualization.y_feature
          : result.dataset.target}
      </text>
    </svg>
  );

  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-5 ${
        expanded
          ? "fixed inset-3 z-50 overflow-auto bg-[#080d19] shadow-2xl"
          : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity
            size={21}
            className="text-violet-400"
          />

          <div>
            <h2 className="text-xl font-bold text-white">
              Interactive 2D Model Visualization
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isTwoFeature
                ? classification
                  ? "Fitted classification regions and observed samples"
                  : "Fitted regression prediction heatmap and observed samples"
                : "Fitted predictions across one input feature"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-violet-500"
          title={expanded ? "Exit expanded view" : "Expand chart"}
        >
          <Maximize2 size={17} />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          {
            label: "Train Points",
            active: showTrain,
            change: setShowTrain,
          },
          {
            label: "Test Points",
            active: showTest,
            change: setShowTest,
          },
          {
            label: "Prediction Layer",
            active: showSurface,
            change: setShowSurface,
          },
        ].map((control) => (
          <button
            key={control.label}
            type="button"
            onClick={() =>
              control.change(!control.active)
            }
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
              control.active
                ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                : "border-slate-700 bg-slate-950 text-slate-400"
            }`}
          >
            {control.active ? (
              <Eye size={14} />
            ) : (
              <EyeOff size={14} />
            )}
            {control.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
        {chart}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-400" />
          Training observations
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-amber-400 bg-slate-950" />
          Test observations
        </span>

        {classification &&
          classes.map((label) => (
            <span
              key={label}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: colorForClass(
                    label,
                    classes,
                  ),
                }}
              />
              Class {label}
            </span>
          ))}
      </div>

      {!classification && isTwoFeature && (
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <span>Low prediction</span>
          <div
            className="h-3 max-w-52 flex-1 rounded-full"
            style={{
              background:
                "linear-gradient(to right, hsl(215 75% 53%), hsl(120 75% 53%), hsl(25 75% 53%))",
            }}
          />
          <span>High prediction</span>
          <span className="font-mono text-slate-500">
            {formatNumber(zMin)} – {formatNumber(zMax)}
          </span>
        </div>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <Info
          size={17}
          className="mt-0.5 shrink-0 text-sky-400"
        />
        <p className="text-xs leading-6 text-slate-300">
          {isTwoFeature
            ? "The background shows predictions from the trained model across two selected input features. Hover over a region or observation to inspect values. Any additional features are held at representative training-set values."
            : "The line shows fitted model predictions across the selected feature, and the markers show observed training and test targets. Hover over a point for its values."}
        </p>
      </div>
    </section>
  );
}
