import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, apiGet } from "../src/core/api/client";
import {
  getAllocationAnalysis,
  getLatestDaily,
  loadAllRecessions,
} from "../src/core/api/endpoints";
import { allocationChartData } from "../src/utils/chart";
import { formatBigNumber, formatDate } from "../src/utils/format";

const analysis = {
  correlation_squared: null,
  expected_returns: 0.04,
  extrapolated_returns: 0.035,
  last_updated_date: "2026-07-01T00:00:00Z",
  last_extrapolated_date: "2026-11-13T14:30:00Z",
  data: [
    {
      date: "2026-07-01T00:00:00Z",
      percentage: "0.350000000000000001",
      return_10: null,
    },
    { date: "2026-08-01T00:00:00Z", percentage: null, return_10: "0" },
    { date: "2026-09-01T00:00:00Z", percentage: "0", return_10: "-0.05" },
  ],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("analysis uses GET, no wrapper/auth, and preserves decimal strings and nulls", async (t) => {
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    assert.equal(
      url,
      "http://localhost:8080/api/v1/analysis/allocation-returns",
    );
    assert.equal(init.method, "GET");
    assert.deepEqual(init.headers, { Accept: "application/json" });
    assert.equal(init.cache, "no-store");
    return json(analysis);
  });
  assert.deepEqual(await getAllocationAnalysis(), analysis);
});

test("configured backend origin supports a trailing slash", async (t) => {
  const original = process.env.API_BASE_URL;
  process.env.API_BASE_URL = "https://api.example.test/";
  t.after(() => {
    if (original === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = original;
  });
  t.mock.method(globalThis, "fetch", async (url: string) => {
    assert.equal(url, "https://api.example.test/api/v1/datasets");
    return json([]);
  });
  assert.deepEqual(await apiGet("/api/v1/datasets"), []);
});

test("recessions load every page, including the final empty page at an exact limit", async (t) => {
  const recession = {
    start_date: "2008-01-01T00:00:00Z",
    end_date: "2009-01-01T00:00:00Z",
  };
  const offsets: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    const query = new URL(url).searchParams;
    assert.equal(query.get("limit"), "1000");
    offsets.push(query.get("offset")!);
    return json(offsets.length === 1 ? Array(1000).fill(recession) : []);
  });
  assert.equal((await loadAllRecessions()).length, 1000);
  assert.deepEqual(offsets, ["0", "1000"]);
});

test("empty recession list is valid", async (t) => {
  t.mock.method(globalThis, "fetch", async () => json([]));
  assert.deepEqual(await loadAllRecessions(), []);
});

test("latest daily 404 is empty, but another route's 404 stays an error", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () =>
    json({ code: "not_found", message: "No observations" }, 404),
  );
  assert.equal(await getLatestDaily(), null);
  await assert.rejects(
    getAllocationAnalysis(),
    (error: unknown) => error instanceof ApiError && error.status === 404,
  );
  assert.equal(mock.mock.callCount(), 2);
});

test("400 and 405 retain structured errors and are never retried", async (t) => {
  for (const status of [400, 405]) {
    const mock = t.mock.method(globalThis, "fetch", async () =>
      json({ code: "invalid_request", message: "Invalid filters" }, status),
    );
    await assert.rejects(
      apiGet("/api/v1/recessions"),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === status &&
        error.code === "invalid_request" &&
        error.message === "Invalid filters",
    );
    assert.equal(mock.mock.callCount(), 1);
    mock.mock.restore();
  }
});

test("non-JSON errors get an HTTP fallback", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("Bad gateway", { status: 502 }),
  );
  await assert.rejects(
    apiGet("/api/v1/datasets"),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 502 &&
      error.code === "http_error" &&
      error.message === "HTTP 502",
  );
});

test("503 retries are bounded to three attempts", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () =>
    json({ code: "unavailable", message: "Insufficient inputs" }, 503),
  );
  await assert.rejects(
    getAllocationAnalysis(),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 503 &&
      error.message === "Insufficient inputs",
  );
  assert.equal(mock.mock.callCount(), 3);
});

test("503 can recover on a subsequent attempt", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () =>
    ++calls === 1 ? json({ code: "unavailable" }, 503) : json(analysis),
  );
  assert.deepEqual(await getAllocationAnalysis(), analysis);
  assert.equal(calls, 2);
});

test("cancellation interrupts backoff and prevents more requests", async (t) => {
  const controller = new AbortController();
  const mock = t.mock.method(globalThis, "fetch", async () => {
    setTimeout(() => controller.abort(), 10);
    return json({ code: "unavailable" }, 503);
  });
  await assert.rejects(getAllocationAnalysis(controller.signal), {
    name: "AbortError",
  });
  assert.equal(mock.mock.callCount(), 1);
});

test("charts preserve zero and negative returns, null gaps, and exact UTC instants", () => {
  const original = structuredClone(analysis.data);
  const chart = allocationChartData(analysis.data);
  assert.deepEqual(
    chart.datasets[0].data.map((point) => point.y),
    [null, 0, -5],
  );
  assert.deepEqual(
    chart.datasets[1].data.map((point) => point.y),
    [35, null, 0],
  );
  assert.equal(chart.datasets[0].data[0].x, Date.parse(analysis.data[0].date));
  assert.deepEqual(analysis.data, original);
  assert.deepEqual(allocationChartData([]).datasets[0].data, []);
});

test("statistics use UTC day of month, null correlation is unavailable, percentages use fractions", () => {
  assert.equal(formatDate("2026-11-13T14:30:00Z"), "13/11/2026");
  assert.equal(formatBigNumber(null, 5), "Unavailable");
  assert.equal(formatBigNumber(0, 5), "0.00000");
  assert.equal(formatBigNumber(0.04, 2, 100), "4.00");
});

test("OpenAPI-optional decimal fields also create chart gaps", () => {
  const chart = allocationChartData([{ date: "2026-07-01T00:00:00Z" }]);
  assert.equal(chart.datasets[0].data[0].y, null);
  assert.equal(chart.datasets[1].data[0].y, null);
});
