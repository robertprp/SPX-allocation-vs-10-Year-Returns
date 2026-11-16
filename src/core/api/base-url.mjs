/** Validate configuration without including its value in errors or logs. */
export function apiBaseUrl(configured = "http://localhost:8080") {
  let url;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("API_BASE_URL must be a valid HTTP(S) API URL.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "API_BASE_URL must use HTTP(S) without credentials, a query, or a fragment.",
    );
  }
  return url.toString().replace(/\/+$/, "");
}
