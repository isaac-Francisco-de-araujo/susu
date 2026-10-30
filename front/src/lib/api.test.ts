import { test } from "node:test";
import assert from "node:assert/strict";
import { api, resetCsrf } from "./api.ts";

test("writes use a session cookie and CSRF header without persisting or forwarding passwords", async (context) => {
  resetCsrf();
  const calls: { url: string; init?: RequestInit | undefined }[] = [];
  context.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return url.endsWith("/auth/csrf")
      ? Response.json({ headerName: "X-CSRF-TOKEN", token: "test-token" })
      : Response.json({ id: "saved" });
  });
  assert.deepEqual(await api("/clients", { method: "POST", body: "{}" }), { id: "saved" });
  assert.deepEqual(calls.map(call => call.url), ["/api/auth/csrf", "/api/clients"]);
  const headers = new Headers(calls[1]?.init?.headers);
  assert.equal(headers.get("X-CSRF-TOKEN"), "test-token");
  assert.equal(headers.has("Authorization"), false);
  assert.equal(calls[1]?.init?.credentials, "include");
  assert.equal(calls[1]?.init?.cache, "no-store");
  resetCsrf();
});

test("a rejected CSRF token is refreshed on the next action without replaying a write", async (context) => {
  resetCsrf();
  let tokens = 0;
  let writes = 0;
  context.mock.method(globalThis, "fetch", async (url: string) => {
    if (url.endsWith("/auth/csrf")) return Response.json({ headerName: "X-CSRF-TOKEN", token: `token-${++tokens}` });
    writes++;
    return writes === 1
      ? Response.json({ detail: "Sessão de segurança expirada" }, { status: 403 })
      : new Response(null, { status: 204 });
  });
  await assert.rejects(api("/clients/record", { method: "DELETE" }), /Sessão de segurança expirada/);
  assert.equal(writes, 1);
  await api("/clients/record", { method: "DELETE" });
  assert.equal(tokens, 2);
  assert.equal(writes, 2);
  resetCsrf();
});

test("public reads do not create a CSRF session", async (context) => {
  const calls: string[] = [];
  context.mock.method(globalThis, "fetch", async (url: string) => {
    calls.push(url);
    return Response.json([]);
  });
  await api("/services");
  assert.deepEqual(calls, ["/api/services"]);
});
