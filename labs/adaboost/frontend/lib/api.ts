
import type {
  DataSet,
  TrainConfig,
  TrainResult,
  SurfaceRequest,
  SurfaceResponse,
} from "./types";

const API = (
  process.env.NEXT_PUBLIC_ADABOOST_API_URL ||
  "http://127.0.0.1:8020"
).replace(/\/+$/, "");

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(API + path, init);
  } catch {
    throw new Error(
      `Could not connect to AdaBoost backend at ${API}. ` +
      "Check that FastAPI is running and the API URL is correct."
    );
  }

  if (!response.ok) {
    let reason = `HTTP ${response.status}`;

    try {
      const json = await response.json();

      reason =
        typeof json.detail === "string"
          ? json.detail
          : JSON.stringify(json.detail || json);
    } catch {
      // Keep the original HTTP error.
    }

    throw new Error(reason);
  }

  return response.json() as Promise<T>;
}

/**
 * Load a built-in dataset.
 */
export const getDataset = (id: string) =>
  request<DataSet>(
    `/api/datasets/${encodeURIComponent(id)}`
  );

/**
 * Train AdaBoost once.
 */
export const trainModel = (config: TrainConfig) =>
  request<TrainResult>("/api/train", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

/**
 * Recalculate a 2D/3D prediction surface
 * using an ALREADY-TRAINED AdaBoost model.
 *
 * No training is performed.
 */
export const getDynamicSurface = (
  config: SurfaceRequest
) =>
  request<SurfaceResponse>("/api/surface", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
