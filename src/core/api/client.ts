import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function retryDelay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Read-only REST requests. Only 503 responses are retried, at most twice. */
export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const base = (process.env.API_BASE_URL || "http://localhost:8080").replace(
    /\/+$/,
    "",
  );
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${base}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(10_000)])
        : AbortSignal.timeout(10_000),
    });
    if (response.ok) return response.json() as Promise<T>;

    const body: unknown = await response.json().catch(() => null);
    const error = body as Partial<ApiErrorBody> | null;
    if (response.status === 503 && attempt < 2) {
      await retryDelay(250 * 2 ** attempt, signal);
      continue;
    }
    throw new ApiError(
      response.status,
      typeof error?.code === "string" ? error.code : "http_error",
      typeof error?.message === "string"
        ? error.message
        : `HTTP ${response.status}`,
    );
  }
}
