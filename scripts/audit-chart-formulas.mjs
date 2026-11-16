import assert from "node:assert/strict";
import { apiBaseUrl } from "../src/core/api/base-url.mjs";
// Verify full allocation history, unchanged cohort dates, and 120-month CAGR.
const base = apiBaseUrl(process.env.API_BASE_URL || undefined);
async function get(path) {
  const response = await fetch(base + path, {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200, path);
  return response.json();
}
async function all(path) {
  const rows = [];
  for (let offset = 0; ;) {
    const page = await get(`${path}?limit=1000&offset=${offset}`);
    rows.push(...page);
    if (page.length < 1000) return rows;
    offset += page.length;
  }
}
const [analysis, monthly, allocations] = await Promise.all([
  get("/api/v1/analysis/allocation-returns"),
  all("/api/v1/sp500/monthly"),
  all("/api/v1/stock-asset-allocation"),
]);
function addMonths(date, count) {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + count);
  return result.toISOString();
}
const monthlyIndex = new Map(
  monthly.map((row, index) => [new Date(row.date).toISOString(), index]),
);
assert.equal(
  analysis.data.length,
  allocations.length,
  "Analysis must contain every allocation row",
);
const allocationByDate = new Map(
  allocations.map((row) => [new Date(row.date).toISOString(), row]),
);
let checkedReturns = 0;
let pendingReturns = 0;
let maxReturnDifference = 0;
for (const point of analysis.data) {
  const raw = allocationByDate.get(new Date(point.date).toISOString());
  assert.ok(raw, `Unchanged allocation cohort date: ${point.date}`);
  assert.equal(Number(point.percentage), Number(raw.percentage));
  const index = monthlyIndex.get(new Date(raw.date).toISOString());
  assert.notEqual(index, undefined);
  const first = monthly[index];
  const future = monthly[index + 120];
  if (
    !future ||
    first.adjusted_close == null ||
    future.adjusted_close == null
  ) {
    assert.equal(point.return_10, null);
    pendingReturns++;
  } else {
    assert.equal(
      addMonths(first.date, 120),
      new Date(future.date).toISOString(),
    );
    const expected =
      Math.pow(
        Number(future.adjusted_close) / Number(first.adjusted_close),
        0.1,
      ) - 1;
    const difference = Math.abs(Number(point.return_10) - expected);
    assert.ok(
      difference < 0.000001,
      `CAGR mismatch at ${point.date}: ${difference}`,
    );
    maxReturnDifference = Math.max(maxReturnDifference, difference);
    checkedReturns++;
  }
}
console.log(
  JSON.stringify(
    {
      allocationPoints: analysis.data.length,
      cohortDates:
        "unchanged source dates, paired with returns starting in the same month",
      realizedReturnsChecked: checkedReturns,
      pendingReturns,
      maxReturnDifference,
      allocationPercentRange: [
        Math.min(...allocations.map((p) => Number(p.percentage) * 100)),
        Math.max(...allocations.map((p) => Number(p.percentage) * 100)),
      ],
    },
    null,
    2,
  ),
);
