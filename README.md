# Finance Allocation

A Next.js chart comparing US stock asset allocation with annualized forward ten-year S&P 500 returns. The red allocation series continues through the latest available quarter; the blue return series ends about ten years earlier because more recent outcomes are not yet known.

## Requirements

- Node.js 22.13 or later.
- pnpm 10.34.9, pinned in `package.json`.
- The separate REST backend running at `http://localhost:8080`, or another origin reachable from the Next.js server.

The frontend does not start the backend or trigger ingestion. It requires no database credentials or API keys.

## Run locally

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open [localhost:3000](http://localhost:3000). If your installed pnpm cannot select the pinned version, use `npx pnpm@10.34.9` in place of `pnpm` in these commands.

## Environment configuration

| Variable       | Default                 | Used by                                    |
| -------------- | ----------------------- | ------------------------------------------ |
| `API_BASE_URL` | `http://localhost:8080` | Next.js server and API maintenance scripts |

Set `API_BASE_URL` in the ignored `.env.local` file during development, or in your hosting provider's server environment. It must be an HTTP(S) URL without embedded credentials, query parameters, or fragments. An optional deployment path prefix is supported.

```dotenv
API_BASE_URL=http://localhost:8080
```

In Docker, use the backend service hostname reachable from the frontend container. Browser CORS does not apply to these server-to-server requests.

`API_BASE_URL` is server configuration. Do not rename it to `NEXT_PUBLIC_API_BASE_URL`, put credentials in it, or expose environment variables through `next.config.ts`'s `env` option. The REST client has a `server-only` guard so importing it into a Client Component fails the build. Only the chart observations are passed to the browser.

## Production

Configure the server environment, then run:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The backend must be reachable when a visitor loads the page. The page renders dynamically and API requests use `cache: "no-store"`. Development HMR fetch caching is also disabled so corrected observations appear after a refresh.

## Chart and API contract

The page loads `GET /api/v1/analysis/allocation-returns` as a plain JSON object. It plots the complete `data` array with snake_case fields:

- Preserve each UTC API date. A 2016 return point describes the 2016–2026 return.
- Multiply ratios by 100 once: `"0.30130"` becomes 30.130%. Round only tooltip text.
- Retain allocation rows with null returns. Nulls create gaps in the return line; a true zero remains valid.
- Use the full historical time axis, with a normal 17.5%–57.5% allocation axis on the left and an inverted −7.5%–24% return axis on the right.

Only 503 errors explicitly marked `retryable: true` receive automatic retries, with at most three attempts. Backoff respects server retry delays and cancellation. Nonretryable errors and empty results have dedicated states.

See [chart mathematics](docs/chart-mathematics.md) for the return formula, source units, date semantics, and reference implementation. Shared API helpers also cover pagination, dataset coverage, and latest daily data without adding them to the page.

## OpenAPI types

The checked-in `openapi.json` keeps type generation independent of a running backend. To refresh it from the backend and regenerate the TypeScript types:

```sh
pnpm api:schema
pnpm api:generate
```

Maintenance scripts read `API_BASE_URL` from the command environment; they do not load `.env.local` automatically. Generated types describe the wire format but do not validate responses at runtime.

## Validation

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

With the backend running, `pnpm audit:chart` performs a read-only check of allocation coverage, source dates, and ten-year return calculations.

The test command enables Node's `react-server` condition to exercise the guarded REST client outside Next.js. Dependency versions are pinned in `package.json` and `pnpm-lock.yaml`.

## Public repository hygiene

`.env.example` contains only a local placeholder. Actual environment files, local registry authentication, private-key files, dependencies, and Next.js build/cache output are ignored by Git. Configuration errors and schema-download success messages do not print the configured API URL.

Publish the source through Git. When creating a source archive manually, exclude the `.git` directory and ignored files too: `.gitignore` does not filter an arbitrary folder or ZIP upload. In particular, `.next` contains generated server keys and must not be published as source.

Before publishing changes, review the files Git will include:

```sh
git status --short
git ls-files
```

For a credential scan, install [Gitleaks](https://github.com/gitleaks/gitleaks) and run `gitleaks git --log-opts="--all" --redact`. Keep real values out of screenshots, logs, issue reports, and pull request descriptions.

## References

- [Reference financial chart](https://github.com/stimulating-ai/financial-charts)
- [Reference data scraper](https://github.com/stimulating-ai/financial-scraper)
- Website: [finance.rbus.me](https://finance.rbus.me/)

Contact (Discord): rbus#7954
