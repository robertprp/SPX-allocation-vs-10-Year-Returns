import assert from "node:assert/strict";
import { test } from "node:test";
import { apiBaseUrl } from "../src/core/api/base-url.mjs";

test("API configuration supports local, deployed, and prefixed server origins", () => {
  assert.equal(apiBaseUrl(), "http://localhost:8080");
  assert.equal(
    apiBaseUrl("https://api.example.test/"),
    "https://api.example.test",
  );
  assert.equal(
    apiBaseUrl("https://api.example.test/finance/"),
    "https://api.example.test/finance",
  );
});

test("invalid or credential-bearing configuration never appears in errors", () => {
  const values = [
    "private-invalid-configuration",
    "https://example-user:example-password@api.example.test/",
    "https://api.example.test/?access=private-example",
    "https://api.example.test/#private-example",
    "file:///private/example",
  ];
  for (const value of values) {
    assert.throws(
      () => apiBaseUrl(value),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /^API_BASE_URL must/);
        assert.ok(!error.message.includes(value));
        assert.ok(!error.message.includes("example-password"));
        assert.ok(!error.message.includes("private-example"));
        return true;
      },
    );
  }
});
