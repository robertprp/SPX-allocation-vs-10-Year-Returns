import { ApiError, apiGet } from "./client";
import type {
  AllocationAnalysis,
  DatasetStatus,
  Recession,
  Sp500Daily,
} from "./types";

export const getAllocationAnalysis = (signal?: AbortSignal) =>
  apiGet<AllocationAnalysis>("/api/v1/analysis/allocation-returns", signal);

export const getDatasetStatus = (signal?: AbortSignal) =>
  apiGet<DatasetStatus[]>("/api/v1/datasets", signal);

export async function getLatestDaily(
  signal?: AbortSignal,
): Promise<Sp500Daily | null> {
  try {
    return await apiGet<Sp500Daily>("/api/v1/sp500/daily/latest", signal);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function loadAllRecessions(
  signal?: AbortSignal,
): Promise<Recession[]> {
  const rows: Recession[] = [];
  const limit = 1000;
  for (let offset = 0; offset <= 1_000_000;) {
    const page = await apiGet<Recession[]>(
      `/api/v1/recessions?limit=${limit}&offset=${offset}`,
      signal,
    );
    rows.push(...page);
    if (page.length < limit) return rows;
    offset += page.length;
  }
  throw new Error("Recession pagination exceeded the API offset limit");
}
