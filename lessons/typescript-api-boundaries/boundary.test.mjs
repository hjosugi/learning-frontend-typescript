// boundary.test.mjs
//
// Non-interactive test for the whole lesson. Run with:
//   node lessons/typescript-api-boundaries/boundary.test.mjs
//
// Uses only node:assert (no test framework, no install) to match the
// projects/browser-state-lab/*.test.mjs convention. Exits non-zero on the
// first failed assertion, so it is safe to use in CI.

import assert from "node:assert/strict";

import { parseUser, parseUserList, parseUserListResponse } from "./boundary.mjs";
import { initialState, transition, describeState } from "./ui-state.mjs";
import { at, atOr, getAt, lookup, indexById } from "./safe-index.mjs";

// --- boundary: valid input --------------------------------------------------

{
  const result = parseUser({
    id: "u1",
    name: "Ada",
    role: "admin",
    tags: ["a", "b"],
  });
  assert.equal(result.ok, true);
  // Narrowing on `ok` makes `value` available; this is the success branch.
  assert.equal(result.ok && result.value.name, "Ada");
  assert.equal(result.ok && result.value.role, "admin");
  assert.deepEqual(result.ok && result.value.tags, ["a", "b"]);
}

// Extra/garbage keys are tolerated AND stripped: the typed model must not carry
// the unknown `hacked` field through.
{
  const result = parseUser({
    id: "u2",
    name: "Grace",
    role: "member",
    tags: [],
    hacked: "drop tables",
  });
  assert.equal(result.ok, true);
  assert.ok(result.ok);
  assert.deepEqual(Object.keys(result.value).sort(), ["id", "name", "role", "tags"]);
}

// --- boundary: missing field ------------------------------------------------

{
  const result = parseUser({ id: "u3", role: "guest", tags: [] }); // name missing
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.error, /name/);
  assert.match(result.ok ? "" : result.error, /missing/);
}

// --- boundary: wrong type ---------------------------------------------------

{
  const result = parseUser({ id: 42, name: "x", role: "admin", tags: [] }); // id is a number
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.error, /id/);
}

{
  // role present but not in the union
  const result = parseUser({ id: "u4", name: "x", role: "superuser", tags: [] });
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.error, /role/);
}

{
  // tags is an array but not of strings
  const result = parseUser({ id: "u5", name: "x", role: "guest", tags: ["ok", 7] });
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.error, /tags/);
}

// --- boundary: garbage / wrong top-level input ------------------------------

for (const garbage of [null, undefined, 42, "a string", ["array"], true]) {
  const result = parseUser(garbage);
  assert.equal(result.ok, false, `expected failure for ${String(garbage)}`);
}

// --- boundary: list endpoint + path reporting -------------------------------

{
  const result = parseUserList({
    users: [
      { id: "1", name: "A", role: "admin", tags: [] },
      { id: "2", name: "B", role: "member", tags: ["x"] },
    ],
  });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.value.length, 2);
}

{
  // Second element is broken; the error must point at the index.
  const result = parseUserList({
    users: [
      { id: "1", name: "A", role: "admin", tags: [] },
      { id: "2", name: "B", role: "member", tags: [99] },
    ],
  });
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.error, /users\[1\]/);
  assert.match(result.ok ? "" : result.error, /tags/);
}

// --- boundary: raw response text (never throws on bad JSON) -----------------

{
  const good = parseUserListResponse('{"users":[{"id":"1","name":"A","role":"guest","tags":[]}]}');
  assert.equal(good.ok, true);

  const bad = parseUserListResponse("{ not json");
  assert.equal(bad.ok, false);
  assert.match(bad.ok ? "" : bad.error, /valid JSON/);
  // The key promise: malformed JSON produced a Result, not a thrown exception.
}

// --- ui-state: transitions --------------------------------------------------

{
  let state = initialState();
  assert.equal(state.status, "idle");
  assert.equal(describeState(state), "Nothing loaded yet.");

  // idle -> loading
  state = transition(state, { type: "fetch" });
  assert.equal(state.status, "loading");

  // loading -> success carries validated data
  const parsed = parseUserList({ users: [{ id: "1", name: "A", role: "admin", tags: [] }] });
  state = transition(state, { type: "resolved", result: parsed });
  assert.equal(state.status, "success");
  assert.equal(state.status === "success" && state.data.length, 1);
  assert.equal(describeState(state), "Loaded 1 item(s).");
}

{
  // A validation failure flows into the error state instead of crashing.
  let state = transition(initialState(), { type: "fetch" });
  const parsed = parseUser({ id: 1 }); // invalid -> err Result
  state = transition(state, { type: "resolved", result: parsed });
  assert.equal(state.status, "error");
  assert.match(state.status === "error" ? state.message : "", /id/);
  assert.match(describeState(state), /Could not load/);

  // error -> loading (retry) -> idle (reset)
  state = transition(state, { type: "fetch" });
  assert.equal(state.status, "loading");
  state = transition(state, { type: "reset" });
  assert.equal(state.status, "idle");
}

{
  // Race guard: a `resolved` event while idle is ignored (stale response).
  const idle = initialState();
  const next = transition(idle, {
    type: "resolved",
    result: parseUser({ id: "1", name: "A", role: "guest", tags: [] }),
  });
  assert.equal(next.status, "idle");
}

// --- safe-index: guarded lookups --------------------------------------------

{
  const list = ["a", "b", "c"];
  assert.equal(at(list, 0), "a");
  assert.equal(at(list, 5), undefined); // out of range -> undefined, no throw
  assert.equal(at(list, -1), undefined);
  assert.equal(at(list, 1.5), undefined); // non-integer index
  assert.equal(atOr(list, 99, "fallback"), "fallback");

  const hit = getAt(list, 1);
  assert.equal(hit.ok && hit.value, "b");
  const miss = getAt(list, 99);
  assert.equal(miss.ok, false);
  assert.match(miss.ok ? "" : miss.error, /out of range/);
}

{
  const record = { name: "Ada" };
  assert.equal(lookup(record, "name"), "Ada");
  assert.equal(lookup(record, "missing"), undefined);
  // Inherited keys must NOT count as present.
  assert.equal(lookup(record, "toString"), undefined);
}

{
  const users = [
    { id: "u1", name: "Ada", role: "admin", tags: [] },
    { id: "u2", name: "Grace", role: "member", tags: [] },
  ];
  const index = indexById(users);
  assert.equal(index.get("u2")?.name, "Grace");
  assert.equal(index.get("nope"), undefined); // stale id -> handled miss
}

console.log("ok");
