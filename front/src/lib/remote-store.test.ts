import { test } from "node:test";
import assert from "node:assert/strict";
import { createRemoteStore } from "./remote-store.ts";

test("a successful write remains in the store when the following GET fails", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch");
  fetch.mock.mockImplementationOnce(async () => Response.json([{ id: "old" }]));
  const store = createRemoteStore<{ id: string }[]>("/items", []);
  await store.refresh();
  fetch.mock.mockImplementationOnce(async () =>
    Response.json({ detail: "Falha ao atualizar" }, { status: 503 }),
  );
  let writes = 0;
  await store.mutate(
    async () => {
      writes += 1;
      return { id: "saved" };
    },
    (items, saved) => [...items, saved],
  );
  assert.deepEqual(store.get(), [{ id: "old" }, { id: "saved" }]);
  assert.equal(writes, 1);
});

test("an older pending GET finishes before applying the mutation response", async (context) => {
  let complete!: (response: Response) => void;
  const fetch = context.mock.method(globalThis, "fetch");
  fetch.mock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        complete = resolve;
      }),
  );
  const store = createRemoteStore<{ id: string }[]>("/items", []);
  const refresh = store.refresh();
  const mutation = store.mutate(
    async () => ({ id: "saved" }),
    (items, saved) => [...items, saved],
  );
  fetch.mock.mockImplementationOnce(async () =>
    Response.json({ detail: "Falha" }, { status: 503 }),
  );
  complete(Response.json([{ id: "old" }]));
  await Promise.all([refresh, mutation]);
  assert.deepEqual(store.get(), [{ id: "old" }, { id: "saved" }]);
});
