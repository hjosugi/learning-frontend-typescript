# Further Learning Resources

Curated primary sources for this repo's named learning targets: browser-facing
TypeScript, React, runtime validation at API/UI boundaries, discriminated unions
for UI state, typed response models, and `noUncheckedIndexedAccess`.

Only canonical primary sources are listed (official docs, standards bodies,
well-known books). Prefer the doc root over deep guessed paths.

Last verified: 2026-06-21

## TypeScript at boundaries

- **TypeScript Handbook** — https://www.typescriptlang.org/docs/
  The official language docs. Read "Narrowing", "Discriminated Unions", and
  "Type Guards" for the patterns this lesson uses; they are the canonical
  description of `value is T` predicates and `never` exhaustiveness.

- **TSConfig Reference** — https://www.typescriptlang.org/tsconfig/
  Per-flag reference. See `strict`, `noUncheckedIndexedAccess`, and
  `noFallthroughCasesInSwitch` — the exact compiler options the upgrade path
  turns on to make the runtime guards in this lesson compile-time guarantees.

- **JSDoc support in TypeScript** — https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
  How `@typedef`, `@template`, and `@param` annotations in plain `.mjs`/`.js`
  are understood by the compiler. This is what lets the no-build lesson express
  the same types it would in `.ts`.

## Runtime validation and JSON

- **MDN: JSON.parse()** — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  Defines exactly what `JSON.parse` returns (untyped) and when it throws — the
  reason the boundary must validate and catch rather than trust the result.

- **MDN: Using the Fetch API** — https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  Canonical guide to `fetch`, response bodies, and `response.text()`/`.json()`,
  which is where untrusted data enters a frontend app.

- **ECMAScript Language Specification (ECMA-262)** — https://tc39.es/ecma262/
  The standards-body source of truth for `typeof`, `Array.isArray`,
  `Object.hasOwn`, and property access semantics used by the safe-index guards.

## React (UI state, Actions, error handling)

- **React documentation** — https://react.dev
  Official React docs. See the `useActionState`, `useReducer`, and "You Might
  Not Need an Effect" pages for how the `Result` and `ViewState` unions map onto
  React 19 form Actions and reducers.

- **Vite documentation** — https://vite.dev
  The build tool the apps use. Relevant when promoting this Node-only lesson to
  a typed module compiled and bundled alongside the React apps.

## Accessibility (empty / loading / error states)

- **WAI-ARIA Authoring Practices Guide** — https://www.w3.org/WAI/ARIA/apg/
  W3C guidance. See live regions (`role="status"`, `role="alert"`) for
  announcing loading and error states, which is the accessibility note in the
  boundaries lesson.

- **MDN: ARIA live regions** — https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
  Practical reference for polite vs assertive announcements when async UI state
  changes.

## Books

- **Programming TypeScript** (Boris Cherny, O'Reilly) — https://www.oreilly.com
  A thorough treatment of the type system, including discriminated unions,
  exhaustiveness, and modeling data at boundaries.
