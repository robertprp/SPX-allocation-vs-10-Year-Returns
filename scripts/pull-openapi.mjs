import { writeFile } from "node:fs/promises";

const base = (process.env.API_BASE_URL || "http://localhost:8080").replace(
  /\/+$/,
  "",
);
const response = await fetch(`${base}/openapi.json`, {
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok)
  throw new Error(`OpenAPI download failed: HTTP ${response.status}`);
const schema = await response.json();
if (!schema.openapi || !schema.paths || !schema.components?.schemas) {
  throw new Error("Response is not an OpenAPI document with component schemas");
}
await writeFile(
  new URL("../openapi.json", import.meta.url),
  `${JSON.stringify(schema, null, 2)}\n`,
);
console.log(`Updated openapi.json from ${base}`);
