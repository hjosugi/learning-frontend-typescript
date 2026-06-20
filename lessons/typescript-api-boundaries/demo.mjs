// demo.mjs
//
// A tiny, dependency-free walkthrough you can RUN to watch untrusted JSON pass
// through the boundary and drive the UI state machine. There is no server and
// no network: we hand the boundary a "good" and a "bad" raw response string,
// exactly the kind of value you would get from `await response.text()`.
//
//   node lessons/typescript-api-boundaries/demo.mjs

import { parseUserListResponse } from "./boundary.mjs";
import { initialState, transition, describeState } from "./ui-state.mjs";
import { indexById } from "./safe-index.mjs";

/**
 * Simulate one fetch lifecycle without any I/O: start loading, then resolve the
 * view from a validated boundary Result.
 * @param {string} label
 * @param {string} rawResponseText
 */
function runFetch(label, rawResponseText) {
  console.log(`\n=== ${label} ===`);

  let state = initialState();
  console.log("state:", state.status, "-", describeState(state));

  // User triggers a request.
  state = transition(state, { type: "fetch" });
  console.log("state:", state.status, "-", describeState(state));

  // The response arrives as untrusted text and is validated at the boundary.
  const result = parseUserListResponse(rawResponseText);
  state = transition(state, { type: "resolved", result });
  console.log("state:", state.status, "-", describeState(state));

  if (state.status === "success") {
    // Safe indexed access into validated data: a present id and a missing one.
    const index = indexById(state.data);
    console.log("lookup u2 :", index.get("u2")?.name ?? "(not found)");
    console.log("lookup ghost:", index.get("ghost")?.name ?? "(not found)");
  }
}

// A well-formed response.
runFetch(
  "valid response",
  JSON.stringify({
    users: [
      { id: "u1", name: "Ada", role: "admin", tags: ["founder"] },
      { id: "u2", name: "Grace", role: "member", tags: [] },
    ],
  }),
);

// A response where one record has a wrong-typed field. Note the app does not
// crash; it lands in a typed error state with an actionable message.
runFetch(
  "invalid response (role is wrong)",
  JSON.stringify({
    users: [{ id: "u1", name: "Ada", role: "superuser", tags: [] }],
  }),
);

// Malformed JSON. `JSON.parse` would throw — the boundary catches it.
runFetch("malformed JSON", "{ this is not json");

console.log("\ndemo complete");
