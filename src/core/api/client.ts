import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryable = false,
    public readonly retryAfterSeconds: number | null = null,
    public readonly requestId: string | null = null,
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

function nonnegativeSeconds(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function headerRetrySeconds(value: string | null): number | null {
  if (value === null) return null;
  if (/^\d+(\.\d+)?$/.test(value)) return nonnegativeSeconds(Number(value));
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, (date - Date.now()) / 1000) : null;
}

/** Fresh REST reads. Retry explicitly retryable 503s, at most twice. */
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
        ? AbortSignal.any([signal, AbortSignal.timeout(20_000)])
        : AbortSignal.timeout(20_000),
    });
    if (response.ok) return response.json() as Promise<T>;

    const body: unknown = await response.json().catch(() => null);
    const error = body as Partial<ApiErrorBody> | null;
    const bodyDelay = nonnegativeSeconds(error?.retry_after_seconds);
    const headerDelay = headerRetrySeconds(response.headers.get("Retry-After"));
    const retryAfterSeconds =
      bodyDelay === null && headerDelay === null
        ? null
        : Math.max(bodyDelay ?? 0, headerDelay ?? 0);
    const apiError = new ApiError(
      response.status,
      typeof error?.code === "string" ? error.code : "http_error",
      typeof error?.message === "string"
        ? error.message
        : `HTTP ${response.status}`,
      error?.retryable === true,
      retryAfterSeconds,
      typeof error?.request_id === "string"
        ? error.request_id
        : response.headers.get("x-request-id"),
    );
    const delay =
      Math.max(250 * 2 ** attempt, (retryAfterSeconds ?? 0) * 1000) +
      Math.random() * 100;
    if (
      response.status === 503 &&
      apiError.retryable &&
      attempt < 2 &&
      delay <= 30_000
    ) {
      await retryDelay(delay, signal);
      continue;
    }
    throw apiError;
  }
}
