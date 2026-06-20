// ui-state.mjs
//
// A discriminated union for async UI state, plus the transition function that
// drives it. This is the second half of "TypeScript at boundaries": validated
// data (from boundary.mjs) flows INTO a typed UI state machine so every render
// path — including empty and error — is represented explicitly and cannot be
// forgotten.
//
// Why a discriminated union instead of a bag of booleans
// (`isLoading`, `error`, `data`)? With booleans you can represent impossible
// states like "loading AND error AND has data". With a discriminated union the
// `status` field is the single source of truth, and each status carries ONLY
// the fields that make sense for it. The compiler (under strict TS) then forces
// the view layer to handle every case.

/**
 * @template T
 * @typedef {(
 *   | { status: "idle" }
 *   | { status: "loading" }
 *   | { status: "success", data: T }
 *   | { status: "error", message: string }
 * )} ViewState
 */

/**
 * Events that can move the machine between states. Mirrors a typical fetch
 * lifecycle: kick off a request, then resolve it from a boundary Result, or
 * reset back to idle.
 *
 * @template T
 * @typedef {(
 *   | { type: "fetch" }
 *   | { type: "resolved", result: import("./boundary.mjs").Result<T> }
 *   | { type: "reset" }
 * )} ViewEvent
 */

/**
 * The starting state for any async view.
 * @template T
 * @returns {ViewState<T>}
 */
export function initialState() {
  return { status: "idle" };
}

/**
 * Pure reducer / transition function. Given the current state and an event,
 * return the next state. Pure means: same inputs -> same output, no I/O, no
 * mutation. That is what makes it trivially testable (see ui-state.test.mjs)
 * and what lets it map straight onto React's `useReducer` or React 19's
 * `useActionState` (see the README upgrade path).
 *
 * Note how a `resolved` event consumes a boundary `Result`: a validation
 * failure becomes the `error` UI state instead of crashing the render. The
 * network/validation boundary and the UI state machine meet exactly here.
 *
 * @template T
 * @param {ViewState<T>} state
 * @param {ViewEvent<T>} event
 * @returns {ViewState<T>}
 */
export function transition(state, event) {
  switch (event.type) {
    case "fetch":
      // Starting (or retrying) a request always lands in loading, regardless
      // of where we were. This is also how an error state retries.
      return { status: "loading" };

    case "resolved":
      // Only a request that is in flight can be resolved. Ignoring stray
      // `resolved` events guards against late/duplicate responses overwriting
      // a state the user has already moved on from (a real fetch race).
      if (state.status !== "loading") {
        return state;
      }
      return event.result.ok
        ? { status: "success", data: event.result.value }
        : { status: "error", message: event.result.error };

    case "reset":
      return { status: "idle" };

    default:
      // Exhaustiveness guard. Under strict TypeScript, `event` is narrowed to
      // `never` here; if you add a new event type and forget a case, the
      // `never` assignment becomes a compile error. At runtime it documents the
      // bug loudly instead of silently dropping the event.
      return assertNever(event, state);
  }
}

/**
 * Render-friendly label derived from the state. Demonstrates how a view can
 * switch over the discriminant once, with a guaranteed branch for the empty
 * (idle) and error cases — the states production UIs most often forget.
 *
 * @template T
 * @param {ViewState<T>} state
 * @returns {string}
 */
export function describeState(state) {
  switch (state.status) {
    case "idle":
      return "Nothing loaded yet.";
    case "loading":
      return "Loading...";
    case "success":
      // `data` is only reachable in this branch — the union makes it safe.
      return Array.isArray(state.data)
        ? `Loaded ${state.data.length} item(s).`
        : "Loaded.";
    case "error":
      return `Could not load: ${state.message}`;
    default:
      return assertNever(state, state);
  }
}

/**
 * Exhaustiveness helper. Accepts the supposedly-impossible value plus a
 * fallback to return so callers stay total.
 * @template T
 * @param {never} impossible
 * @param {ViewState<T>} fallback
 * @returns {ViewState<T>}
 */
function assertNever(impossible, fallback) {
  // eslint-disable-next-line no-console
  console.warn("unhandled union case:", impossible);
  return fallback;
}
