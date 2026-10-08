
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Calculator,
  Info,
  Sigma,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  TrainingResponse,
} from "@/lib/api/polynomialApi";

interface Props {
  result: TrainingResponse | null;
  featureName?: string;
  targetName?: string;
  viewMode?: "2d" | "3d";
}

type Tab = "equation" | "coefficients" | "prediction";

function format(value: number | null | undefined, digits = 5) {
  if (value == null || !Number.isFinite(value)) return "—";

  if (value !== 0 && (Math.abs(value) >= 100000 || Math.abs(value) < 0.0001)) {
    return value.toExponential(3);
  }

  return value.toFixed(digits);
}

function prettyTerm(name: string) {
  return name
    .replace(/\^(\d+)/g, (_, exponent: string) => {
      const superscripts: Record<string, string> = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
      };

      return exponent
        .split("")
        .map((digit) => superscripts[digit] ?? digit)
        .join("");
    })
    .replace(/ /g, " × ");
}

function getTermValue(
  name: string,
  features: Record<string, number | null>
): number | null {
  const factors = name.trim().split(/\s+/);

  if (!factors.length || !name.trim()) return null;

  let product = 1;

  for (const factor of factors) {
    const match = /^(.+?)(?:\^(\d+))?$/.exec(factor);

    if (!match) return null;

    const feature = match[1];
    const power = match[2] ? Number(match[2]) : 1;
    const value = features[feature];

    if (value == null || !Number.isFinite(value)) {
      return null;
    }

    product *= value ** power;
  }

  return product;
}

export default function PolynomialCoefficientStudio({
  result,
  featureName = "x",
  targetName = "y",
  viewMode = "2d",
}: Props) {
  const [tab, setTab] = useState<Tab>("equation");
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [observationIndex, setObservationIndex] = useState(0);
  const [showAllTerms, setShowAllTerms] = useState(false);

  const polynomial = result?.polynomial;

  const terms = useMemo(() => {
    if (!polynomial) return [];

    return polynomial.feature_names.map((name, index) => ({
      index,
      name,
      prettyName: prettyTerm(name),
      coefficient: polynomial.coefficients[index] ?? 0,
      magnitude: Math.abs(polynomial.coefficients[index] ?? 0),
    }));
  }, [polynomial]);

  const sortedTerms = useMemo(
    () =>
      [...terms].sort(
        (a, b) => b.magnitude - a.magnitude
      ),
    [terms]
  );

  const displayedTerms = showAllTerms
    ? sortedTerms
    : sortedTerms.slice(0, 20);

  const activeTerm =
    terms.find((term) => term.index === selectedTerm) ??
    sortedTerms[0] ??
    null;

  const observations = result?.predictions ?? [];
  const selectedObservation =
    observations[observationIndex] ?? observations[0];

  const rawContributions = useMemo(() => {
    if (!selectedObservation) return [];

    return terms.map((term) => {
      const featureValue = getTermValue(
        term.name,
        selectedObservation.features
      );

      return {
        ...term,
        featureValue,
        contribution:
          featureValue == null
            ? null
            : featureValue * term.coefficient,
      };
    });
  }, [terms, selectedObservation]);

  const rawPrediction = useMemo(() => {
    if (!polynomial || rawContributions.some(
      (term) => term.contribution == null
    )) {
      return null;
    }

    return (
      polynomial.intercept +
      rawContributions.reduce(
        (sum, term) => sum + (term.contribution ?? 0),
        0
      )
    );
  }, [polynomial, rawContributions]);

  const coefficientSpace = polynomial?.coefficient_space ?? "unknown";

  const originalSpace =
    coefficientSpace.toLowerCase().includes("original") ||
    coefficientSpace.toLowerCase().includes("unscaled");

  const canDecompose =
    originalSpace &&
    rawPrediction !== null &&
    Number.isFinite(rawPrediction);

  const equation = useMemo(() => {
    if (!polynomial) return "";

    const pieces = [
      format(polynomial.intercept),
    ];

    for (const term of terms) {
      const sign = term.coefficient < 0 ? " − " : " + ";
      pieces.push(
        `${sign}${format(Math.abs(term.coefficient))}(${term.prettyName})`
      );
    }

    return `ŷ = ${pieces.join("")}`;
  }, [polynomial, terms]);

  const regularizationExplanation =
    result?.model.regularization === "ridge"
      ? "Ridge regression adds an L2 penalty to the training objective. It discourages large coefficients, but usually does not force them exactly to zero."
      : result?.model.regularization === "lasso"
        ? "Lasso regression adds an L1 penalty to the training objective. It can shrink some polynomial coefficients exactly to zero, effectively removing those terms."
        : "Ordinary Least Squares minimizes the sum of squared prediction errors without an explicit coefficient penalty.";

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
      <div>
        <div className="flex items-center gap-2 text-violet-400">
          <Sigma size={22} />
          <span className="text-xs font-semibold uppercase tracking-widest">
            ModelMind Coefficient Studio
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-white">
          Polynomial Equation & Coefficient Explorer
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Explore the fitted polynomial equation, understand
          every coefficient, and discover how polynomial
          features influence predictions.
        </p>
      </div>

      {!result || !polynomial ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
          Waiting for backend model coefficients.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Polynomial degree", String(result.model.degree)],
              ["Expanded features", String(polynomial.feature_count)],
              ["Intercept", format(polynomial.intercept)],
              ["Regression", result.model.regularization.toUpperCase()],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="text-xs text-slate-400">
                  {label}
                </p>
                <p className="mt-3 break-all text-xl font-bold text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["equation", "Polynomial Equation"],
                ["coefficients", "Coefficient Analysis"],
                ["prediction", "Prediction Breakdown"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  tab === value
                    ? "bg-violet-600 text-white"
                    : "bg-slate-950 text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "equation" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center gap-2 text-sky-300">
                  <Calculator size={19} />
                  <h3 className="font-semibold">
                    Fitted Polynomial Equation
                  </h3>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <p className="min-w-max font-mono text-sm leading-9 text-sky-300">
                    {equation}
                  </p>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Coefficient representation:{" "}
                  <strong className="text-white">
                    {coefficientSpace}
                  </strong>
                </p>

                {!originalSpace && (
                  <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-7 text-amber-200">
                    These coefficients may operate on
                    transformed or standardized polynomial
                    features. The displayed equation is a
                    representation of the fitted model,
                    not necessarily a direct formula using
                    untransformed input values.
                  </p>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
                  <div className="flex items-center gap-2 text-sky-300">
                    <Info size={18} />
                    <h3 className="font-semibold">
                      How Polynomial Expansion Works
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    A polynomial regression model first
                    transforms input features into powers
                    and interaction terms. Linear regression
                    is then fitted to these expanded features.
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-950 p-4 font-mono text-xs leading-7 text-sky-300">
                    <p>Degree 1: x</p>
                    <p>Degree 2: x, x²</p>
                    <p>Degree 3: x, x², x³</p>
                    <p>Two features: x₁, x₂, x₁², x₁x₂, x₂² ...</p>
                  </div>
                </div>

                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                  <div className="flex items-center gap-2 text-violet-300">
                    <BrainCircuit size={18} />
                    <h3 className="font-semibold">
                      Why Coefficients Matter
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Each coefficient multiplies one expanded
                    feature. Its sign determines whether
                    that term adds to or subtracts from
                    the prediction for a positive term value.
                    Its magnitude must be interpreted
                    alongside feature scaling and input values.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "coefficients" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center gap-2 text-violet-300">
                  <BarChart3 size={19} />
                  <h3 className="font-semibold">
                    Coefficient Magnitudes
                  </h3>
                </div>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Larger bars indicate larger absolute
                  coefficients in the reported coefficient
                  space. This is not automatically a measure
                  of feature importance.
                </p>

                <div className="mt-5 h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={displayedTerms}
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 25,
                        bottom: 10,
                        left: 30,
                      }}
                    >
                      <CartesianGrid
                        stroke="#263244"
                        strokeDasharray="4 4"
                      />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                      />
                      <YAxis
                        type="category"
                        dataKey="prettyName"
                        stroke="#94a3b8"
                        width={105}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 12,
                        }}
                        formatter={(value) => [
                          typeof value === "number"
                            ? format(value)
                            : String(value ?? "—"),
                          "Absolute coefficient",
                        ]}
                      />
                      <Bar
                        dataKey="magnitude"
                        name="Absolute coefficient"
                      >
                        {displayedTerms.map((term) => (
                          <Cell
                            key={term.index}
                            fill={
                              term.coefficient < 0
                                ? "#38bdf8"
                                : "#a78bfa"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {sortedTerms.length > 20 && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAllTerms((value) => !value)
                    }
                    className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"
                  >
                    {showAllTerms
                      ? "Show top 20 terms"
                      : `Show all ${sortedTerms.length} terms`}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="border-b border-slate-800 text-xs text-slate-400">
                    <tr>
                      <th className="p-4">Term</th>
                      <th className="p-4">Coefficient</th>
                      <th className="p-4">Magnitude</th>
                      <th className="p-4">Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTerms.map((term) => (
                      <tr
                        key={term.index}
                        onClick={() =>
                          setSelectedTerm(term.index)
                        }
                        className={`cursor-pointer border-b border-slate-800/70 ${
                          activeTerm?.index === term.index
                            ? "bg-violet-500/10"
                            : "hover:bg-slate-900"
                        }`}
                      >
                        <td className="p-4 font-mono text-sky-300">
                          {term.prettyName}
                        </td>
                        <td className="p-4 text-white">
                          {format(term.coefficient)}
                        </td>
                        <td className="p-4 text-slate-300">
                          {format(term.magnitude)}
                        </td>
                        <td className="p-4 text-slate-300">
                          {term.coefficient > 0
                            ? "Positive"
                            : term.coefficient < 0
                              ? "Negative"
                              : "Zero"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeTerm && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
                  <h3 className="font-semibold text-sky-300">
                    Selected Term: {activeTerm.prettyName}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Coefficient: {format(activeTerm.coefficient)}.
                    This term contributes its coefficient
                    multiplied by the corresponding expanded
                    feature value to the model prediction.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "prediction" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Activity size={19} />
                  <h3 className="font-semibold">
                    Observation Prediction Explorer
                  </h3>
                </div>

                {observations.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">
                    No backend observations are available.
                  </p>
                ) : (
                  <>
                    <label
                      htmlFor="coefficient-observation"
                      className="mt-5 block text-sm text-slate-300"
                    >
                      Choose an observation
                    </label>

                    <select
                      id="coefficient-observation"
                      value={Math.min(
                        observationIndex,
                        observations.length - 1
                      )}
                      onChange={(event) =>
                        setObservationIndex(
                          Number(event.target.value)
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm"
                    >
                      {observations.map((observation, index) => (
                        <option key={index} value={index}>
                          Observation {index + 1} —{" "}
                          {observation.split}
                        </option>
                      ))}
                    </select>

                    {selectedObservation && (
                      <>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {[
                            ["Actual", format(selectedObservation.actual)],
                            ["Backend prediction", format(selectedObservation.predicted)],
                            ["Residual", format(selectedObservation.residual)],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                            >
                              <p className="text-xs text-slate-400">
                                {label}
                              </p>
                              <p className="mt-2 text-lg font-semibold text-white">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {Object.entries(
                            selectedObservation.features
                          ).map(([name, value]) => (
                            <span
                              key={name}
                              className="rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-sky-300"
                            >
                              {name}: {format(value)}
                            </span>
                          ))}
                        </div>

                        {canDecompose ? (
                          <>
                            <div className="mt-5 overflow-x-auto">
                              <table className="w-full min-w-[620px] text-left text-sm">
                                <thead className="border-b border-slate-800 text-slate-400">
                                  <tr>
                                    <th className="p-3">Term</th>
                                    <th className="p-3">Expanded value</th>
                                    <th className="p-3">Coefficient</th>
                                    <th className="p-3">Contribution</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rawContributions.map((term) => (
                                    <tr
                                      key={term.index}
                                      className="border-b border-slate-800/70"
                                    >
                                      <td className="p-3 font-mono text-sky-300">
                                        {term.prettyName}
                                      </td>
                                      <td className="p-3">
                                        {format(term.featureValue)}
                                      </td>
                                      <td className="p-3">
                                        {format(term.coefficient)}
                                      </td>
                                      <td className="p-3 text-emerald-300">
                                        {format(term.contribution)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <p className="mt-5 rounded-xl bg-slate-900 p-4 font-mono text-sm text-emerald-300">
                              Intercept + contributions ={" "}
                              {format(rawPrediction)}
                            </p>

                            <p className="mt-3 text-xs text-slate-400">
                              Calculated using reported coefficients
                              and raw input values. Compare with
                              backend prediction:{" "}
                              {format(selectedObservation.predicted)}.
                            </p>
                          </>
                        ) : (
                          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                            <h4 className="font-semibold text-amber-200">
                              Exact raw-input decomposition unavailable
                            </h4>
                            <p className="mt-3 text-sm leading-7 text-slate-300">
                              The backend reports coefficients in
                              the "{coefficientSpace}" space, or
                              some required input values are missing.
                              Reconstructing the prediction from
                              raw features could be incorrect.
                              The backend prediction above remains
                              the authoritative result.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
            <div className="flex items-center gap-2 text-violet-300">
              <BrainCircuit size={18} />
              <h3 className="font-semibold">
                Understanding {result.model.regularization.toUpperCase()}
              </h3>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              {regularizationExplanation}
            </p>
          </div>

          <p className="text-xs leading-6 text-slate-500">
            Model: degree {result.model.degree} ·{" "}
            {viewMode.toUpperCase()} · Feature: {featureName} ·{" "}
            Target: {targetName}. Coefficient magnitude alone
            should not be interpreted as causal importance.
          </p>
        </>
      )}
    </section>
  );
}
