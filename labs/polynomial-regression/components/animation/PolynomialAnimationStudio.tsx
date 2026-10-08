
"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Layers3,
  Activity,
  Info,
} from "lucide-react";

import Polynomial3DChart from "@/components/charts/Polynomial3DChart";
import PolynomialBackend2DChart from "@/components/charts/PolynomialBackend2DChart";

import {
  getPolynomialCurve,
  getPolynomialSurface,
  type TrainingRequest,
  type CurveResponse,
  type SurfaceResponse,
} from "@/lib/api/polynomialApi";

type Frame = CurveResponse | SurfaceResponse;

interface Props {
  request: TrainingRequest | null;
  onFramesChange?: (
  frames: Record<number, CurveResponse | SurfaceResponse>
) => void;
  viewMode: "2d" | "3d";
  xFeature?: string;
  yFeature?: string;
  targetName?: string;
  showResiduals?: boolean;
}

function metric(value: number | null | undefined) {
  return value == null || !Number.isFinite(value)
    ? "—"
    : value.toFixed(4);
}

function isSurface(
  frame: Frame
): frame is SurfaceResponse {
  return "surface" in frame;
}

export default function PolynomialAnimationStudio({
  request,
  onFramesChange,
  viewMode,
  xFeature = "x",
  yFeature = "",
  targetName = "y",
  showResiduals = false,
}: Props) {
  const [frames, setFrames] = useState<
    Record<number, Frame>
  >({});

  const [currentDegree, setCurrentDegree] =
    useState(1);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loadingDegree, setLoadingDegree] =
    useState<number | null>(null);
  const [error, setError] = useState<string | null>(
    null
  );

  const maxDegree = Math.max(
    1,
    Math.min(10, Math.floor(request?.degree ?? 1))
  );

  const valid3D =
    viewMode === "2d" ||
    (Boolean(xFeature) &&
      Boolean(yFeature) &&
      xFeature !== yFeature);

  const rows = request?.rows;
  const features = request?.features;
  const preprocessing = request?.preprocessing;
  const regularization = request?.regularization;
  const alpha = request?.alpha;
  const testSize = request?.test_size;
  const randomState = request?.random_state;
  const interactionOnly = request?.interaction_only;
  const standardize = request?.standardize;
  const target = request?.target;

  useEffect(() => {

    const controller = new AbortController();

    if (
      !rows ||
      !features ||
      !target ||
      !regularization ||
      !valid3D
    ) {
      return;
    }

    // Restart playback when the dataset or model
    // configuration changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrames({});
    onFramesChange?.({});
    setCurrentDegree(1);
    setPlaying(false);
    setError(null);

    const config: TrainingRequest = {
      rows,
      features,
      target,
      degree: 1,
      regularization,
      alpha: alpha ?? 1,
      test_size: testSize ?? 0.2,
      random_state: randomState ?? 42,
      interaction_only: interactionOnly ?? false,
      standardize: standardize ?? true,
      preprocessing,
    };

    async function loadFrames() {
      for (let degree = 1; degree <= maxDegree; degree++) {
        if (controller.signal.aborted) return;

        setLoadingDegree(degree);

        try {
          const frameRequest = {
            ...config,
            degree,
          };

          const result =
            viewMode === "3d"
              ? await getPolynomialSurface(
                  {
                    ...frameRequest,
                    x_feature: xFeature,
                    y_feature: yFeature,
                    grid_size: 30,
                  },
                  controller.signal
                )
              : await getPolynomialCurve(
                  frameRequest,
                  controller.signal
                );

          if (controller.signal.aborted) return;

          setFrames((previous) => ({
  ...previous,
  [degree]: result,
}));
        } catch (cause) {
          if (controller.signal.aborted) return;

          setError(
            `Degree ${degree}: ${
              cause instanceof Error
                ? cause.message
                : "Training failed"
            }`
          );

          break;
        }
      }

      if (!controller.signal.aborted) {
        setLoadingDegree(null);
      }
    }

    void loadFrames();

    return () => controller.abort();
  }, [
    rows,
    features,
    target,
    regularization,
    alpha,
    testSize,
    randomState,
    interactionOnly,
    standardize,
    preprocessing,
    maxDegree,
    viewMode,
    xFeature,
    yFeature,
        valid3D,
  ]);

  // Phase 5E: Share trained frames with comparison studio
  useEffect(() => {
    onFramesChange?.(frames);
  }, [frames, onFramesChange]);

  const frame = frames[currentDegree];
  const loadedCount = Object.keys(frames).length;

  useEffect(() => {
    if (!playing) return;

    const interval = window.setInterval(() => {
      setCurrentDegree((previous) => {
        const next = previous + 1;

        if (next > maxDegree) {
          return 1;
        }

        if (!frames[next]) {
          return previous;
        }

        return next;
      });
    }, 1800 / speed);

    return () => window.clearInterval(interval);
  }, [playing, speed, maxDegree, frames]);

  const previousDegree = () => {
    setPlaying(false);
    setCurrentDegree((value) =>
      Math.max(1, value - 1)
    );
  };

  const nextDegree = () => {
    setPlaying(false);
    setCurrentDegree((value) => {
      const next = Math.min(maxDegree, value + 1);
      return frames[next] ? next : value;
    });
  };

  const reset = () => {
    setPlaying(false);
    setCurrentDegree(1);
  };

  const explanation =
    currentDegree === 1
      ? "Degree 1 fits a plane in 3D or a straight line in 2D. It contains no squared or higher-order polynomial terms."
      : currentDegree === 2
        ? "Degree 2 introduces squared terms and, with two input features, an interaction term. The fitted surface can bend into a curved shape."
        : currentDegree === 3
          ? "Degree 3 introduces cubic terms and higher-order interactions. The model can represent more complex nonlinear relationships."
          : "Higher degrees introduce additional polynomial terms. The model becomes more flexible, but may also become sensitive to noise and overfit.";

  return (
    <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400">
            <Layers3 size={21} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              ModelMind Animation Studio
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold text-white">
            {viewMode === "3d"
              ? "3D Polynomial Surface Evolution"
              : "2D Polynomial Curve Evolution"}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Watch real models trained at different
            polynomial degrees. Each frame uses
            predictions returned by your Python backend.
          </p>
        </div>

        <span className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          Degree {currentDegree} / {maxDegree}
        </span>
      </div>

      {!request || !valid3D ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-200">
          Select valid numeric features and train a
          model to enable animation.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Polynomial degree
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                {currentDegree}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Test R²
              </p>
              <p className="mt-2 text-2xl font-bold text-sky-300">
                {metric(frame?.metrics.test.r2)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Test RMSE
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">
                {metric(frame?.metrics.test.rmse)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            {frame ? (
              viewMode === "3d" && isSurface(frame) ? (
                <Polynomial3DChart result={frame} />
              ) : !isSurface(frame) ? (
                <PolynomialBackend2DChart
                  result={frame}
                  featureName={xFeature}
                  targetName={targetName}
                  showResiduals={showResiduals}
                />
              ) : null
            ) : (
              <div className="flex min-h-80 items-center justify-center p-6 text-center text-sm text-slate-400">
                {loadingDegree !== null
                  ? `Training polynomial degree ${loadingDegree}...`
                  : "Waiting for trained model frames."}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-300">
                Degree progression
              </span>
              <span className="text-violet-300">
                {loadedCount} / {maxDegree} trained
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={maxDegree}
              step={1}
              value={currentDegree}
              onChange={(event) => {
                setPlaying(false);
                const next = Number(event.target.value);

                if (frames[next]) {
                  setCurrentDegree(next);
                }
              }}
              className="w-full accent-violet-500"
              aria-label="Select trained polynomial degree"
            />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={previousDegree}
                disabled={currentDegree <= 1}
                className="rounded-xl border border-slate-700 p-3 disabled:opacity-40"
                aria-label="Previous degree"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                disabled={loadedCount < 2}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {playing ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} />
                )}
                {playing ? "Pause" : "Play"}
              </button>

              <button
                type="button"
                onClick={nextDegree}
                disabled={
                  currentDegree >= maxDegree ||
                  !frames[currentDegree + 1]
                }
                className="rounded-xl border border-slate-700 p-3 disabled:opacity-40"
                aria-label="Next degree"
              >
                <ChevronRight size={19} />
              </button>

              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <div className="ml-auto flex items-center gap-2">
                <label
                  htmlFor="polynomial-animation-speed"
                  className="text-xs text-slate-400"
                >
                  Speed
                </label>

                <select
                  id="polynomial-animation-speed"
                  value={speed}
                  onChange={(event) =>
                    setSpeed(Number(event.target.value))
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value={0.5}>0.5×</option>
                  <option value={1}>1×</option>
                  <option value={1.5}>1.5×</option>
                  <option value={2}>2×</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
            <div className="flex items-center gap-2 text-sky-300">
              <Info size={18} />
              <h3 className="font-semibold">
                How is this model fitted?
              </h3>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              {explanation}
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              The backend expands the selected input
              features into polynomial terms, estimates
              coefficients using the selected regression
              method, and generates predictions across
              the feature range.
              {viewMode === "3d"
                ? " The predictions form the displayed 3D surface."
                : " The predictions form the displayed 2D curve."}
            </p>
          </div>

          {frame && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Activity
                  size={18}
                  className="text-emerald-400"
                />
                <h3 className="font-semibold text-white">
                  Model at degree {currentDegree}
                </h3>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p className="text-slate-400">
                  Polynomial features:{" "}
                  <strong className="text-white">
                    {frame.polynomial.feature_count}
                  </strong>
                </p>

                <p className="text-slate-400">
                  Training samples:{" "}
                  <strong className="text-white">
                    {frame.dataset.training_rows}
                  </strong>
                </p>

                <p className="text-slate-400">
                  Train R²:{" "}
                  <strong className="text-white">
                    {metric(frame.metrics.train.r2)}
                  </strong>
                </p>

                <p className="text-slate-400">
                  Test R²:{" "}
                  <strong className="text-white">
                    {metric(frame.metrics.test.r2)}
                  </strong>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {frame.polynomial.feature_names.map(
                  (name, index) => (
                    <span
                      key={`${name}-${index}`}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-sky-300"
                    >
                      {name}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {loadingDegree !== null && (
            <p className="text-sm text-sky-300">
              Preparing degree {loadingDegree}...
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300"
            >
              {error}
            </p>
          )}

          <p className="text-xs leading-6 text-slate-500">
            Playback shows separately trained models
            with increasing polynomial degree. It does
            not represent gradient-descent iterations.
            All frames use the same data split and
            preprocessing configuration.
          </p>
        </>
      )}
    </section>
  );
}
