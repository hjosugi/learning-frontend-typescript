// boundary.mjs
//
// Validate-at-the-boundary module.
//
// The contract of this file: data crossing the network boundary is UNTRUSTED.
// `JSON.parse` gives us `any`/`unknown`, not a typed model. We never let an
// unvalidated shape leak into the rest of the app, and we NEVER throw across
// the boundary. Every parse returns a discriminated-union Result so the caller
// is forced (by the type system, once this is strict TypeScript) to handle the
// failure path.
//
// The same types are expressed here with JSDoc so this file runs under plain
// Node (no build step). The "## Upgrade path" section of the README shows how
// to lift these annotations into real strict TypeScript almost line-for-line.

// --- Domain model -----------------------------------------------------------

/**
 * The typed model the rest of the app is allowed to see. Once a value has this
 * type, downstream code can trust every field without re-checking it.
 *
 * @typedef {object} User
 * @property {string} id
 * @property {string} name
 * @property {"admin" | "member" | "guest"} role
 * @property {string[]} tags
 */

/**
 * A discriminated-union Result. The `ok` field is the discriminant: TypeScript
 * (and a human reader) can narrow on it. There is exactly one shape for success
 * and one for failure, so callers cannot forget the error case.
 *
 * @template T
 * @typedef {{ ok: true, value: T } | { ok: false, error: string }} Result
 */

/**
 * Build a success Result.
 * @template T
 * @param {T} value
 * @returns {Result<T>}
 */
export function ok(value) {
  return { ok: true, value };
}

/**
 * Build a failure Result. The error is a plain string here to keep the lesson
 * focused; in production you would often carry a structured error (field path,
 * code, message) — see the Exercises section of the README.
 * @param {string} error
 * @returns {Result<never>}
 */
export function err(error) {
  return { ok: false, error };
}

// --- Small typed field guards -----------------------------------------------
//
// Each guard answers one question about an `unknown` value and narrows its
// type. Keeping them tiny makes the validator readable and makes failures
// point at a specific field.

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isString(value) {
  return typeof value === "string";
}

const ROLES = /** @type {const} */ (["admin", "member", "guest"]);

/**
 * Narrow an unknown value to the role union.
 * @param {unknown} value
 * @returns {value is User["role"]}
 */
function isRole(value) {
  // `includes` over a readonly tuple is the runtime mirror of the `"admin" |
  // "member" | "guest"` type. Both must change together.
  return typeof value === "string" && ROLES.includes(/** @type {never} */ (value));
}

/**
 * Narrow an unknown value to an array of strings.
 * @param {unknown} value
 * @returns {value is string[]}
 */
function isStringArray(value) {
  return Array.isArray(value) && value.every(isString);
}

// --- The boundary validator -------------------------------------------------

/**
 * Validate one untrusted value into a typed `User`.
 *
 * This is the single choke point: nothing reaches the typed model without
 * passing through here. It covers the three failure families the README and
 * tests exercise:
 *   1. wrong/garbage input    (not an object at all)
 *   2. missing field          (key absent or undefined)
 *   3. wrong type             (key present but the wrong shape)
 * Extra/unknown keys are tolerated by default (forward-compatible), which is
 * the usual choice for evolving APIs; the README shows how to make it strict.
 *
 * @param {unknown} input
 * @returns {Result<User>}
 */
export function parseUser(input) {
  // 1. Garbage / wrong top-level type. A JSON `null`, a number, an array, or a
  //    string would all fail here instead of exploding later with
  //    "cannot read property 'id' of undefined".
  if (!isPlainObject(input)) {
    return err(`expected an object, received ${describe(input)}`);
  }

  // 2 & 3. Per-field checks. Missing keys read back as `undefined`, so the same
  //        guard catches both "missing" and "wrong type".
  if (!isString(input.id)) {
    return err(fieldError("id", "string", input.id));
  }
  if (!isString(input.name)) {
    return err(fieldError("name", "string", input.name));
  }
  if (!isRole(input.role)) {
    return err(fieldError("role", '"admin" | "member" | "guest"', input.role));
  }
  if (!isStringArray(input.tags)) {
    return err(fieldError("tags", "string[]", input.tags));
  }

  // Only now do we construct the trusted shape. We copy fields explicitly
  // rather than returning `input`, so unknown/garbage keys never ride along
  // into the typed model.
  /** @type {User} */
  const user = {
    id: input.id,
    name: input.name,
    role: input.role,
    tags: [...input.tags],
  };
  return ok(user);
}

/**
 * Validate a list endpoint: `{ users: [...] }`. Demonstrates composing the
 * single-item validator and reporting WHICH element failed (index in the path).
 *
 * @param {unknown} input
 * @returns {Result<User[]>}
 */
export function parseUserList(input) {
  if (!isPlainObject(input)) {
    return err(`expected an object, received ${describe(input)}`);
  }
  if (!Array.isArray(input.users)) {
    return err(fieldError("users", "array", input.users));
  }

  /** @type {User[]} */
  const users = [];
  for (let i = 0; i < input.users.length; i += 1) {
    const result = parseUser(input.users[i]);
    if (!result.ok) {
      // Fail fast with a path so the error is actionable.
      return err(`users[${i}]: ${result.error}`);
    }
    users.push(result.value);
  }
  return ok(users);
}

/**
 * Convenience boundary that takes the raw response TEXT (what you actually get
 * from `await response.text()`) and turns it into a typed list. `JSON.parse`
 * itself throws on malformed JSON, so we catch it here and convert to a
 * Result — keeping the promise we made: never throw across the boundary.
 *
 * @param {string} rawText
 * @returns {Result<User[]>}
 */
export function parseUserListResponse(rawText) {
  let json;
  try {
    json = JSON.parse(rawText);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    return err(`response was not valid JSON: ${reason}`);
  }
  return parseUserList(json);
}

// --- Error message helpers --------------------------------------------------

/**
 * Human-readable description of an unknown value's runtime type.
 * @param {unknown} value
 * @returns {string}
 */
function describe(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Build a consistent "field X: expected Y, got Z" message.
 * @param {string} field
 * @param {string} expected
 * @param {unknown} received
 * @returns {string}
 */
function fieldError(field, expected, received) {
  if (received === undefined) {
    return `field "${field}": expected ${expected}, but it was missing`;
  }
  return `field "${field}": expected ${expected}, received ${describe(received)}`;
}
