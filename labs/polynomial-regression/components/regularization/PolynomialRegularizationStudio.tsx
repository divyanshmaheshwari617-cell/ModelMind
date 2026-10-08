
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getPolynomialCurve,
  getPolynomialSurface,
  type TrainingRequest,
  type TrainingResponse,
  type Regularization,
} from "@/lib/api/polynomialApi";

interface Props {
  request: TrainingRequest | null;
  viewMode: "2d" | "3d";
  xFeature?: string;
  yFeature?: string;
}

type Method = Regularization;
type ResultMap = Partial<Record<Method, TrainingResponse>>;

const METHODS: Method[] = ["none", "ridge", "lasso"];

const METHOD_LABELS: Record<Method, string> = {
  none: "OLS",
  ridge: "Ridge (L2)",
  lasso: "Lasso (L1)",
};

const METHOD_COLORS: Record<Method, string> = {
  none: "#38bdf8",
  ridge: "#a78bfa",
  lasso: "#34d399",
};

function format(value: number | null | undefined, digits = 4) {
  if (value == null || !Number.isFinite(value)) return "—";

  if (value !== 0 && Math.abs(value) < 0.0001) {
    return value.toExponential(2);
  }

  return value.toFixed(digits);
}

function nonzeroCount(coefficients: number[]) {
  return coefficients.filter(
    (coefficient) => Math.abs(coefficient) > 1e-8
  ).length;
}

export default function PolynomialRegularizationStudio({
  request,
  viewMode,
  xFeature = "x",
  yFeature = "",
}: Props) {
  const [alphaExponent, setAlphaExponent] = useState(0);
  const [results, setResults] = useState<ResultMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] =
    useState<Method>("ridge");
  const [metric, setMetric] = useState<"rmse" | "r2">("rmse");

  const alpha = Math.pow(10, alphaExponent);

  const validRequest =
    request !== null &&
    (viewMode === "2d" ||
      (Boolean(xFeature) &&
        Boolean(yFeature) &&
        xFeature !== yFeature));

  // Keep the request reference stable when the parent has not changed
  // its training configuration.
  const rows = request?.rows;
  const features = request?.features;
  const target = request?.target;
  const degree = request?.degree;
  const testSize = request?.test_size;
  const randomState = request?.random_state;
  const interactionOnly = request?.interaction_only;
  const standardize = request?.standardize;
  const preprocessing = request?.preprocessing;

  useEffect(() => {
    const controller = new AbortController();

    if (
      !validRequest ||
      !rows ||
      !features ||
      !target ||
      degree == null
    ) {
      return () => controller.abort();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults({});
    setError(null);
    setLoading(true);

    async function trainAll() {
      const nextResults: ResultMap = {};

      try {
        for (const method of METHODS) {
          if (controller.signal.aborted) return;

          const configuration: TrainingRequest = {
            rows: rows!,
            features: features!,
            target: target!,
            degree: degree!,
            regularization: method,
            alpha: method === "none" ? 0 : alpha,
            test_size: testSize ?? 0.2,
            random_state: randomState ?? 42,
            interaction_only: interactionOnly ?? false,
            standardize: standardize ?? true,
            preprocessing,
          };

          const response =
            viewMode === "3d"
              ? await getPolynomialSurface(
                  {
                    ...configuration,
                    x_feature: xFeature,
                    y_feature: yFeature,
                    grid_size: 20,
                  },
                  controller.signal
                )
              : await getPolynomialCurve(
                  configuration,
                  controller.signal
                );

          if (controller.signal.aborted) return;

          nextResults[method] = response;
          setResults({ ...nextResults });
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Regularization comparison failed."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void trainAll();

    return () => controller.abort();
  }, [
    validRequest,
    rows,
    features,
    target,
    degree,
    testSize,
    randomState,
    interactionOnly,
    standardize,
    preprocessing,
    alpha,
    viewMode,
    xFeature,
    yFeature,
  ]);

  const comparison = useMemo(
    () =>
      METHODS.flatMap((method) => {
        const result = results[method];
        if (!result) return [];

        const coefficients = result.polynomial.coefficients;

        return [{
          method,
          label: METHOD_LABELS[method],
          trainRmse: result.metrics.train.rmse,
          testRmse: result.metrics.test.rmse,
          trainR2: result.metrics.train.r2,
          testR2: result.metrics.test.r2,
          features: result.polynomial.feature_count,
          nonzero: nonzeroCount(coefficients),
          coefficientNorm: Math.sqrt(
            coefficients.reduce(
              (sum, coefficient) => sum + coefficient ** 2,
              0
            )
          ),
        }];
      }),
    [results]
  );

  const selectedResult = results[selectedMethod];

  const coefficientChart = useMemo(() => {
    const result = selectedResult;
    if (!result) return [];

    return result.polynomial.feature_names
      .map((name, index) => ({
        name,
        coefficient: result.polynomial.coefficients[index] ?? 0,
        magnitude: Math.abs(
          result.polynomial.coefficients[index] ?? 0
        ),
      }))
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, 20);
  }, [selectedResult]);

  const performanceChart = comparison.map((row) => ({
    name: row.label,
    train: metric === "rmse" ? row.trainRmse : row.trainR2,
    test: metric === "rmse" ? row.testRmse : row.testR2,
  }));

  const best = comparison.length === METHODS.length
    ? comparison.reduce((winner, current) =>
        current.testRmse < winner.testRmse
          ? current
          : winner
      )
    : null;

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
      <div>
        <div className="flex items-center gap-2 text-violet-400">
          <SlidersHorizontal size={21} />
          <span className="text-xs font-semibold uppercase tracking-widest">
            ModelMind Regularization Studio
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-white">
          OLS vs Ridge vs Lasso
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Train three polynomial regression models using
          the same dataset, degree, and train/test split.
          Explore how L1 and L2 regularization influence
          coefficients and generalization.
        </p>
      </div>

      {!validRequest ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-400">
          Select a valid dataset and input features to
          enable regularization comparison.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-2 text-sky-300">
              <SlidersHorizontal size={18} />
              <h3 className="font-semibold">
                Regularization Strength
              </h3>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="regularization-alpha"
                className="text-sm text-slate-300"
              >
                Alpha (logarithmic scale)
              </label>

              <span className="rounded-lg bg-violet-500/15 px-4 py-2 font-mono text-sm text-violet-300">
                α = {format(alpha)}
              </span>
            </div>

            <input
              id="regularization-alpha"
              type="range"
              min={-4}
              max={3}
              step={0.5}
              value={alphaExponent}
              onChange={(event) =>
                setAlphaExponent(Number(event.target.value))
              }
              className="mt-5 w-full accent-violet-500"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0.0001</span>
              <span>1</span>
              <span>1000</span>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-400">
              Alpha affects Ridge and Lasso. OLS has no
              regularization penalty and serves as the
              baseline. The three models use the same
              configured random split.
            </p>

            {loading && (
              <p className="mt-4 text-sm text-sky-300">
                Training comparison models with Python...
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
              >
                {error}
              </p>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {METHODS.map((method) => {
              const result = results[method];
              const coefficients =
                result?.polynomial.coefficients ?? [];

              return (
                <div
                  key={method}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: METHOD_COLORS[method],
                      }}
                    />
                    <h3 className="font-semibold text-white">
                      {METHOD_LABELS[method]}
                    </h3>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Train RMSE
                      </span>
                      <span className="font-mono text-white">
                        {format(result?.metrics.train.rmse)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Test RMSE
                      </span>
                      <span className="font-mono text-white">
                        {format(result?.metrics.test.rmse)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Test R²
                      </span>
                      <span className="font-mono text-white">
                        {format(result?.metrics.test.r2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Nonzero coefficients
                      </span>
                      <span className="font-mono text-white">
                        {result
                          ? `${nonzeroCount(coefficients)} / ${coefficients.length}`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!result}
                    onClick={() => setSelectedMethod(method)}
                    className={`mt-5 w-full rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40 ${
                      selectedMethod === method
                        ? "bg-violet-600 text-white"
                        : "border border-slate-700 text-slate-300"
                    }`}
                  >
                    {selectedMethod === method
                      ? "Inspecting coefficients"
                      : "Inspect coefficients"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-violet-300">
                <BarChart3 size={19} />
                <h3 className="font-semibold">
                  Performance Comparison
                </h3>
              </div>

              <div className="flex gap-2">
                {(["rmse", "r2"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMetric(value)}
                    className={`rounded-lg px-4 py-2 text-sm ${
                      metric === value
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {value === "rmse" ? "RMSE" : "R²"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceChart}
                  margin={{
                    top: 10,
                    right: 15,
                    bottom: 15,
                    left: 10,
                  }}
                >
                  <CartesianGrid
                    stroke="#263244"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    width={65}
                    tickFormatter={(value: number) =>
                      Number(value).toPrecision(3)
                    }
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
                      metric.toUpperCase(),
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="train"
                    name="Training"
                    fill="#38bdf8"
                  />
                  <Bar
                    dataKey="test"
                    name="Testing"
                    fill="#a78bfa"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-2 text-emerald-300">
              <Activity size={19} />
              <h3 className="font-semibold">
                Coefficient Shrinkage Explorer
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Inspect the 20 largest absolute coefficients
              of the selected model. Magnitudes are reported
              in the backend coefficient space, so they are
              not necessarily direct feature importance scores.
            </p>

            <div className="mt-5 h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={coefficientChart}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 25,
                    bottom: 10,
                    left: 20,
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
                    dataKey="name"
                    width={100}
                    stroke="#94a3b8"
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
                  <Bar dataKey="magnitude">
                    {coefficientChart.map((term, index) => (
                      <Cell
                        key={`${term.name}-${index}`}
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

            {selectedResult && (
              <p className="mt-4 text-xs text-slate-400">
                Coefficient space:{" "}
                {selectedResult.polynomial.coefficient_space}
              </p>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="border-b border-slate-800 text-xs text-slate-400">
                <tr>
                  <th className="p-4">Method</th>
                  <th className="p-4">Train RMSE</th>
                  <th className="p-4">Test RMSE</th>
                  <th className="p-4">Train R²</th>
                  <th className="p-4">Test R²</th>
                  <th className="p-4">Nonzero terms</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.method}
                    className="border-b border-slate-800/70 text-slate-300"
                  >
                    <td className="p-4 font-semibold text-white">
                      {row.label}
                    </td>
                    <td className="p-4">
                      {format(row.trainRmse)}
                    </td>
                    <td className="p-4">
                      {format(row.testRmse)}
                    </td>
                    <td className="p-4">
                      {format(row.trainR2)}
                    </td>
                    <td className="p-4">
                      {format(row.testR2)}
                    </td>
                    <td className="p-4">
                      {row.nonzero} / {row.features}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {best && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 text-emerald-300">
                <BrainCircuit size={18} />
                <h3 className="font-semibold">
                  Lowest Observed Test RMSE
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {best.label} currently has the lowest
                test RMSE ({format(best.testRmse)}) among
                these three configurations. This does not
                establish that it will perform best on
                future data.
              </p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                title: "OLS",
                description:
                  "Ordinary Least Squares minimizes squared training errors without an explicit coefficient penalty. It may overfit when polynomial complexity is high.",
              },
              {
                title: "Ridge — L2",
                description:
                  "Ridge penalizes the sum of squared coefficients. It usually reduces coefficient magnitudes smoothly, helping control model complexity.",
              },
              {
                title: "Lasso — L1",
                description:
                  "Lasso penalizes the sum of absolute coefficients. It can drive coefficients exactly to zero, effectively selecting polynomial terms.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5"
              >
                <div className="flex items-center gap-2 text-sky-300">
                  <Info size={18} />
                  <h3 className="font-semibold">
                    {item.title}
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs leading-6 text-slate-500">
            Comparison uses backend-fitted models with
            matching data and split settings. Changing
            alpha triggers new training requests.
            For reliable hyperparameter selection,
            use training-set cross-validation and
            preserve a final untouched test set.
          </p>
        </>
      )}
    </section>
  );
}
