// Tests firestore.rules against the Firestore emulator.
// Run with: yarn test:firestore-rules
import assert from "node:assert/strict";

const HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const PROJECT = process.env.GCLOUD_PROJECT || "demo-potlucky";
const BASE = `http://${HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;

const str = (v) => ({ stringValue: v });
const arr = (values) => ({ arrayValue: { values } });

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.status;
}

const results = [];
async function expect(name, promise, allowed) {
  const status = await promise;
  const ok = allowed ? status === 200 : status === 403;
  results.push({ name, ok, status });
  console.log(`${ok ? "ok  " : "FAIL"} ${name} (HTTP ${status})`);
}

const room = "pumpkin-pleasant-9x2Qk";
const valid = { fields: { name: str("Friendsgiving"), users: arr([]), foods: arr([]) } };

await expect("create a room", call("PATCH", `/rooms/${room}`, valid), true);
await expect("read a room by id", call("GET", `/rooms/${room}`), true);
await expect(
  "merge-update a room",
  call("PATCH", `/rooms/${room}?updateMask.fieldPaths=date&updateMask.fieldPaths=location`, {
    fields: { date: str("Nov 27"), location: str("") },
  }),
  true
);
await expect("list rooms", call("GET", `/rooms`), false);
await expect("delete a room", call("DELETE", `/rooms/${room}`), false);
await expect(
  "create a room with a weird id",
  call("PATCH", `/rooms/${encodeURIComponent("a b")}`, valid),
  false
);
await expect(
  "write an unknown field",
  call("PATCH", `/rooms/${room}?updateMask.fieldPaths=isAdmin`, { fields: { isAdmin: str("yes") } }),
  false
);
await expect(
  "write an oversized name",
  call("PATCH", `/rooms/${room}?updateMask.fieldPaths=name`, { fields: { name: str("x".repeat(5000)) } }),
  false
);
await expect(
  "write a non-list foods field",
  call("PATCH", `/rooms/${room}?updateMask.fieldPaths=foods`, { fields: { foods: str("nope") } }),
  false
);
await expect("write another collection", call("PATCH", `/secrets/x`, valid), false);
await expect("read another collection", call("GET", `/secrets/x`), false);

assert.ok(results.every((r) => r.ok), "some Firestore rules tests failed");
console.log(`\n${results.length} Firestore rules tests passed`);
