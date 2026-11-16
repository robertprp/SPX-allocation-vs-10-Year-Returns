# Stock allocation versus forward ten-year S&P 500 return

The backend's `FRONTEND_CHART_HANDOFF.md` is the current rendering contract. The page contains only the two-series chart.

## Values and dates

Read every row from `GET /api/v1/analysis/allocation-returns`. The response is a plain object with `correlation_squared`, `last_updated_date`, and `data`. Forecast fields are no longer part of the response.

- Draw every nonnull allocation, even if its `return_10` is null.
- Keep a null return as a gap; never convert it to zero or connect across it.
- Multiply each ratio by 100 once. Preserve numeric precision in plotted values; only tooltip text is rounded to three decimals. For example, `"0.30130"` is displayed as 30.130%, and `"0.56406"` as 56.406%.
- Use the API date directly for both values. A return point at October 2016 measures October 2016–October 2026. Do not shift it to 2026 or apply the historical reference application's publication offsets.
- Use the full historical time range. Allocation currently continues through April 2026 while realized returns stop around October 2016.
- If all returns are null, still draw allocation and mark the return legend unavailable.

## Reference axes

Both series share one time axis. Values are percentage points before entering the chart.

| Series                                   | Axis  | Minimum | Maximum | Direction |
| ---------------------------------------- | ----- | ------- | ------- | --------- |
| Stock allocation, red                    | Left  | 17.5%   | 57.5%   | Normal    |
| Annualized forward ten-year return, blue | Right | −7.5%   | 24%     | Inverted  |

These are fixed presentation bounds, not independent normalizations. Data outside them is never clamped or rescaled; extending these bounds would be an explicit presentation change. The reference [axis configuration](https://github.com/stimulating-ai/financial-charts/blob/cbdd12072fa6903096b509e57d69834bb77b9cc8/assets/scripts/AllocationChart.js) and [US chart template](https://github.com/stimulating-ai/financial-charts/blob/cbdd12072fa6903096b509e57d69834bb77b9cc8/app/views/usa-allocation.html) establish these limits. Chart.js and Highcharts use different spline interpolation, so their exact smoothed paths can differ.

## Backend calculations

The backend now pairs each allocation with the forward ten-year return starting in the same source month:

```text
return_10(t) = (adjusted_close(t + 120 monthly observations) / adjusted_close(t))^(1/10) − 1
```

Missing future monthly observations leave `return_10` null. The allocation-led LEFT JOIN keeps those rows in the chart. Correlation eligibility affects only the statistic, not either series. The chart does not calculate or display forecasts or correlation statistics.

The corrected allocation source uses equity and debt in the same units:

```text
E = a + f
D = b + c + d + e + g
allocation = E / (E + D)
```

This replaces the historical equity-only `/1000` conversion, which became incorrect once all FRED inputs used millions of dollars. The frontend does not compensate for that old source error. Corrected source observations include October 1946 at 30.130%, January 2000 at 51.494%, April 2021 at 50.043%, and April 2026 at 56.406%.

## Freshness and errors

Requests use `cache: "no-store"`; the page renders dynamically. Next.js development HMR fetch caching is disabled so old `0.000xx` responses are not reused across edits. Reloading the page fetches the corrected response. There is no client data cache or service worker.

Only HTTP 503 responses explicitly marked `retryable: true` receive automatic retries, with at most three total attempts. The client uses the larger of the server's body/header retry delay and exponential backoff, plus jitter. A delay beyond the 30-second automatic wait budget is surfaced rather than shortened. Cancellation stops backoff; errors retain `retryable`, `retry_after_seconds`, and the request ID. Nonretryable `data_unavailable` errors are not retried automatically.

## Read-only verification

Run `pnpm audit:chart` with the backend available. Override `API_BASE_URL` in the command environment for another origin. It fetches every allocation and monthly page, checks that all allocations remain on their API dates, and independently recalculates every available ten-year return from stored adjusted prices. The fractional-return tolerance of 0.000001 accommodates the SQL view's REAL/decimal conversion.
