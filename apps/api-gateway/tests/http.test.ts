import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import { requestJson, UpstreamError } from "../src/utils/http.js";

function createTestServer(handler: Parameters<typeof createServer>[0]) {
  const server = createServer(handler);

  return new Promise<{ baseUrl: string; close: () => Promise<void> }>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;

      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise<void>((closeResolve, closeReject) => {
            server.close((error) => (error ? closeReject(error) : closeResolve()));
          })
      });
    });
  });
}

test("requestJson sends JSON body and parses JSON response", async () => {
  const server = await createTestServer((request, response) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ method: request.method, body: JSON.parse(body) }));
    });
  });

  try {
    const result = await requestJson<{ method: string; body: { ok: boolean } }>(server.baseUrl, {
      method: "POST",
      body: { ok: true }
    });

    assert.equal(result.method, "POST");
    assert.equal(result.body.ok, true);
  } finally {
    await server.close();
  }
});

test("requestJson throws UpstreamError for non-2xx response", async () => {
  const server = await createTestServer((_request, response) => {
    response.statusCode = 503;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "service unavailable" }));
  });

  try {
    await assert.rejects(() => requestJson(server.baseUrl), (error) => {
      assert.ok(error instanceof UpstreamError);
      assert.equal(error.statusCode, 503);
      return true;
    });
  } finally {
    await server.close();
  }
});
