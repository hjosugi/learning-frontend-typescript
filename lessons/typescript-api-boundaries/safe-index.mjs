// safe-index.mjs
//
// "no unchecked index access" in runnable form.
//
// With `noUncheckedIndexedAccess` enabled (see the strict tsconfig in the
// README upgrade path), every `array[i]` and `record[key]` is typed as
// `T | undefined`, not `T`. The compiler then refuses to let you use the value
// until you have proven it exists. This file shows the runtime habits that make
// that compiler rule painless: check-then-use, default values, and total
// lookups that return a Result.
//
// These mirror the real bugs the rule prevents: reading past the end of an
// array, looking up a key that is not present, or trusting an index that came
// from untrusted input.

import { ok, err } from "./boundary.mjs";

/**
 * Safe array access. Returns the element or `undefined` — never throws, and the
 * `undefined` is explicit so callers must handle the out-of-range case. This is
 * exactly the shape `arr[i]` already has under `noUncheckedIndexedAccess`; we
 * make it a function so the runtime behaviour matches the type.
 *
 * @template T
 * @param {readonly T[]} list
 * @param {number} index
 * @returns {T | undefined}
 */
export function at(list, index) {
  if (index < 0 || index >= list.length || !Number.isInteger(index)) {
    return undefined;
  }
  return list[index];
}

/**
 * Array access with a default. Useful when "missing" has a sensible neutral
 * value, so the caller does not have to branch.
 *
 * @template T
 * @param {readonly T[]} list
 * @param {number} index
 * @param {T} fallback
 * @returns {T}
 */
export function atOr(list, index, fallback) {
  const value = at(list, index);
  return value === undefined ? fallback : value;
}

/**
 * Total array access: returns a Result so an out-of-range read becomes a
 * handled error instead of an `undefined` that silently propagates. This is the
 * same discipline as the API boundary — push the failure into the type.
 *
 * @template T
 * @param {readonly T[]} list
 * @param {number} index
 * @returns {import("./boundary.mjs").Result<T>}
 */
export function getAt(list, index) {
  const value = at(list, index);
  if (value === undefined) {
    return err(`index ${index} is out of range (length ${list.length})`);
  }
  return ok(value);
}

/**
 * Safe record / dictionary lookup. Under `noUncheckedIndexedAccess`,
 * `record[key]` is `V | undefined`; this guards it. `Object.hasOwn` avoids
 * falsely matching inherited keys like `toString`.
 *
 * @template V
 * @param {Record<string, V>} record
 * @param {string} key
 * @returns {V | undefined}
 */
export function lookup(record, key) {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

/**
 * Build a lookup index from a list of items keyed by a field, then offer safe
 * access into it. Real-world boundary pattern: an API returns a `User[]`, the
 * UI wants `usersById[selectedId]`, and that id might not be present (deleted,
 * stale link, typo in the URL). The lookup must tolerate the miss.
 *
 * @template {{ id: string }} T
 * @param {readonly T[]} items
 * @returns {{ get: (id: string) => T | undefined }}
 */
export function indexById(items) {
  /** @type {Record<string, T>} */
  const byId = Object.create(null);
  for (const item of items) {
    byId[item.id] = item;
  }
  return {
    get(id) {
      return lookup(byId, id);
    },
  };
}
