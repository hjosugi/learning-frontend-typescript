# TypeScript at Boundaries: Runtime Validation, Discriminated Unions, Safe Indexing

A no-build, Node-only lesson on protecting the two places TypeScript can lie to
you: the **network boundary** (where `JSON.parse` hands you `any`) and **array /
record indexing** (where a value can be `undefined` at runtime even though the
type says otherwise). It also shows the **discriminated union** pattern twice —
once as a `Result` for validation, once as a `ViewState` for async UI.

This is the dependency-light warmup for the strict-TypeScript and React 19 work
described in [`docs/2026-learning-items.md`](../../docs/2026-learning-items.md)
under "TypeScript at boundaries". It follows the same convention as
[`projects/browser-state-lab`](../../projects/browser-state-lab): runnable ESM
`.mjs` with JSDoc `@typedef` annotations that express the exact types, plus a
`*.test.mjs` using `node:assert`. No build step, no `pnpm install`.

Last verified: 2026-06-21

## Goal

After this lesson you can:

1. Validate an untrusted API response into a typed model **without throwing
   across the boundary**, returning a discriminated-union `Result`.
2. Model async UI as a `idle | loading | success | error` discriminated union
   and drive it with a pure reducer, so empty and error states are impossible
   to forget.
3. Access arrays and records safely, the way `noUncheckedIndexedAccess` forces
   you to.
4. Lift all of the above into strict TypeScript and into React 19
   `useActionState` (see "Upgrade path").

## Prerequisites

- Node v24 LTS or newer (verified on v26). No packages to install.
- Comfort with ES modules and basic TypeScript ideas (unions, generics).

## Run

Runs the walkthrough (no server, no network — it feeds the boundary a good
response, a bad one, and malformed JSON, and prints the resulting UI state):

```bash
node lessons/typescript-api-boundaries/demo.mjs
```

## Test

Non-interactive, exits non-zero on the first failure:

```bash
node lessons/typescript-api-boundaries/boundary.test.mjs
```

It covers: valid input, missing field, wrong type, out-of-union value,
non-string array elements, garbage top-level input, malformed JSON, list-element
path reporting, every UI state transition (including the stale-response race
guard), and the safe-index helpers.

## Files

| File | What it teaches |
| --- | --- |
| `boundary.mjs` | Validate untrusted JSON into a typed `User` / `User[]`; returns `Result` and never throws. |
| `ui-state.mjs` | `ViewState` discriminated union + pure `transition` reducer; validated data flows into typed UI state. |
| `safe-index.mjs` | `noUncheckedIndexedAccess`-style guarded array/record lookups. |
| `demo.mjs` | Runnable end-to-end walkthrough. |
| `boundary.test.mjs` | `node:assert` test for all of the above. |
| `tsconfig.strict.json` | The strict config used in the upgrade path. |

## Walkthrough

### 1. Never trust the wire

`JSON.parse` returns `any`. If you assign it straight to `const user: User = ...`
TypeScript believes you, but the runtime value can be anything. `boundary.mjs`
funnels every response through `parseUser` / `parseUserList`, which:

- reject garbage top-level input (null, number, array, string),
- catch missing fields and wrong-typed fields with one guard each,
- mirror the `"admin" | "member" | "guest"` union with a runtime `ROLES` tuple,
- **copy** known fields into a fresh object so unknown/garbage keys are stripped,
- return `{ ok: true, value }` or `{ ok: false, error }` — the boundary never
  throws, even on malformed JSON (`parseUserListResponse` catches the
  `JSON.parse` exception and converts it to a `Result`).

### 2. Make impossible UI states impossible

`ui-state.mjs` models the async lifecycle as a discriminated union, not a bag of
booleans. Because `data` lives only on the `success` member and `message` only
on `error`, you cannot accidentally read `data` while loading. The pure
`transition` reducer is the only way to move between states; a `resolved` event
consumes a boundary `Result`, so a validation failure becomes the **error UI
state** rather than a crash. The `default` branch is an exhaustiveness guard
(`never`) so adding a state without handling it is caught.

### 3. Treat every index as maybe-missing

`safe-index.mjs` is the runtime shape of `noUncheckedIndexedAccess`: `at`
returns `T | undefined`, `getAt` returns a `Result`, `lookup` uses `Object.hasOwn`
so inherited keys like `toString` do not count as present, and `indexById`
builds a by-id map whose `get` tolerates a stale/typo id — the classic
"`usersById[idFromUrl]` is undefined" bug.

## Upgrade path

This lesson is intentionally Node-only so it runs with zero install. Here is how
to swap in the real heavy tooling — strict TypeScript and Vite/React — using the
existing pnpm workspace.

### A. Convert to strict TypeScript (tsc / Vite)

The repo is already a pnpm workspace whose `pnpm-workspace.yaml` includes
`lessons/*`, and the apps already build with `tsc --noEmit && vite build` under
`strict` + `noUncheckedIndexedAccess` (see `apps/react-notes/tsconfig.json`).

1. Rename the `.mjs` files to `.ts` and delete the JSDoc comment markers — the
   `@typedef` blocks become real TypeScript almost line-for-line. For example
   `boundary.mjs`:

   ```ts
   export type User = {
     id: string;
     name: string;
     role: "admin" | "member" | "guest";
     tags: string[];
   };

   export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

   export function parseUser(input: unknown): Result<User> { /* same body */ }
   ```

   The guards (`isString`, `isRole`, ...) keep their `value is T` predicates;
   they were already written as type predicates in JSDoc.

2. Add a `package.json` and the strict `tsconfig.strict.json` shipped here
   (it sets `strict: true` and `noUncheckedIndexedAccess: true`, matching the
   app tsconfigs). Then type-check from the repo root:

   ```bash
   pnpm install
   pnpm --filter typescript-api-boundaries exec tsc --noEmit -p tsconfig.strict.json
   ```

3. With `noUncheckedIndexedAccess` on, the compiler will now demand the exact
   guards this lesson already uses — `input.users[i]` is `unknown | undefined`,
   `list[index]` is `T | undefined`. The runtime habits become compile-time
   guarantees for free.

### B. Plug the same `Result` into React 19 `useActionState`

React 19 form Actions return their result as the action state, which is exactly
a `Result` discriminant. The boundary code is reused verbatim:

```tsx
import { useActionState } from "react";
import { parseUserListResponse, type Result, type User } from "./boundary";

type State = Result<User[]> | { ok: true; value: [] };

async function loadAction(_prev: State, formData: FormData): Promise<State> {
  const res = await fetch(`/api/users?q=${formData.get("q")}`);
  return parseUserListResponse(await res.text()); // <- same boundary, no throw
}

function UsersForm() {
  const [state, action, pending] = useActionState<State>(loadAction, { ok: true, value: [] });
  if (pending) return <p role="status">Loading…</p>;
  if (!state.ok) return <p role="alert">{state.error}</p>;           // error UI
  if (state.value.length === 0) return <p>No users found.</p>;        // empty UI
  return <ul>{state.value.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

`useActionState`'s pending flag replaces the `loading` member; the `Result`'s
`ok` discriminant maps directly onto the success/error branches; and the
`length === 0` check is the empty state. The `transition` reducer in
`ui-state.mjs` maps just as directly onto `useReducer` if you are not using form
Actions.

## Accessibility / empty / error-state note

This ties back to the React apps in `apps/`. A discriminated UI state is only
useful if every member renders something a user (and a screen reader) can
perceive:

- **empty** — render an explicit message, like `react-notes` does with its
  `<p className="empty-state">No notes yet.</p>`. Never render a blank region.
- **loading** — expose progress to assistive tech with `role="status"` (a polite
  live region) so the spinner is announced, not silent.
- **error** — render the `Result`'s `error` in a `role="alert"` (assertive live
  region) so a failed validation is announced immediately, and offer a retry
  control (a `fetch` event back into `loading`).
- **keyboard** — the retry/reset controls must be real focusable `<button>`s,
  matching the keyboard-reachable controls in `react-notes` and
  `react-color-lab`.

The point of the union is that the compiler forces you to provide all four
branches — which is the same discipline as not shipping a UI that is blank while
loading or silent on error.

## Exercises

1. **Structured errors.** Change `Result`'s error from `string` to
   `{ path: string; code: "missing" | "type" | "json"; message: string }` and
   update `parseUserList` to collect *all* field errors instead of failing on
   the first. Add tests asserting the path and code.
2. **Schema for a new endpoint.** Add `parsePagedUsers` for
   `{ items: User[]; nextCursor: string | null }`, reusing `parseUser`. Cover a
   missing `nextCursor`, a wrong-typed `nextCursor`, and a valid `null`.
3. **Strict-mode toggle.** Add an option to `parseUser` that *rejects* unknown
   keys (strict schema) instead of stripping them, and a test proving the
   `hacked` key now fails. Decide when each policy is appropriate.
4. **Wire it to a real fetch.** Write a `loadUsers(url)` that calls `fetch`,
   reads `await res.text()`, and returns `parseUserListResponse(...)`. Drive the
   `transition` reducer from it and handle a non-2xx status as an error state.
5. **Promote to TypeScript.** Follow the Upgrade path: convert one module to
   `.ts`, enable `noUncheckedIndexedAccess`, and confirm the compiler flags any
   indexing you do *without* the `safe-index` helpers.

## Further reading

See [`docs/learning-resources.md`](../../docs/learning-resources.md) for curated
primary sources (TypeScript handbook, MDN, React docs, WAI-ARIA).
