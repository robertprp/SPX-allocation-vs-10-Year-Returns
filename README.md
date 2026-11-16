# Finance Allocation

A chart of stock asset allocation versus S&P 500 annualized ten-year returns.

## Development

Use Node.js 22.13+ and the pnpm version pinned in `package.json` (via Corepack or `npx pnpm@10.34.9`).

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

The REST backend defaults to `http://localhost:8080`. Override `API_BASE_URL` in `.env.local` or the server deployment environment. Requests run in Next.js on the server, with no authorization header. In Docker, use a hostname reachable from the Next.js container; the backend can listen on `API_LISTEN=0.0.0.0:8080`.

## REST v1 integration

- Analysis: `GET /api/v1/analysis/allocation-returns`, including the complete `data` array.
- The page draws only the allocation and realized-return series. Shared API helpers also support paginated recessions, dataset coverage, and latest daily data, without adding those to the page.
- Responses are bare objects/arrays with snake_case fields. Wire types in `src/core/api/types.ts` alias types generated from the checked-in `openapi.json`. These TypeScript types do not validate responses at runtime.
- Decimal strings remain intact through server rendering and are converted only for charting or display. Chart ratios are multiplied by 100 once, with rounding only in tooltip text. Missing values create chart gaps; zero returns remain visible. Dates retain their UTC timestamps.
- Requests use fresh data at request time. Only HTTP 503 errors marked `retryable: true` get up to two retries. Backoff honors server retry delays with jitter; nonretryable errors are surfaced immediately. An empty analysis array shows an empty state.
- [Chart mathematics and reference comparison](docs/chart-mathematics.md) documents the annualized-return formula, unchanged source dates, fixed reference axes, and corrected allocation units. Run `pnpm audit:chart` for a read-only comparison against the live API.

Backend API discovery: `GET /`, guide: `GET /docs`, machine-readable schema: `GET /openapi.json`. The backend can export its schema without a database using `cargo run --locked -- --export-openapi openapi.json`. Use that schema for future generated clients or runtime validators. A copy is checked in so generation works offline. Refresh it with `pnpm api:schema`, then run `pnpm api:generate`. Set `API_BASE_URL` in the command environment to pull from a different origin. The schema marks nullable properties optional, so chart conversion handles both null and omitted fields.

Server-side requests do not require browser CORS. If adding direct browser requests, the backend allows `http://localhost:3000` and `http://localhost:5173` by default; configure `CORS_ALLOWED_ORIGINS` for other frontend origins. `/healthz` and `/readyz` do not establish ingestion coverage; use `/api/v1/datasets` for stored row counts and latest observation dates.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Next.js uses ESLint's flat configuration. Tailwind v4 uses `@tailwindcss/postcss` and CSS theme configuration. Dependencies are pinned to stable versions and resolved in `pnpm-lock.yaml`. ESLint 9.39.5 and TypeScript 5.9.3 are the latest versions satisfying the full toolchain's peer requirements: the lint plugins require ESLint 9, and `openapi-typescript` requires TypeScript 5.

Website: https://finance.rbus.me/

Contact (Discord): rbus#7954
