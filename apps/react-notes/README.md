# React Notes

Source repo: `react-keep`

Last verified: 2026-06-20

## Goal

Learn React state, typed events, controlled inputs, derived UI, and component extraction by building a small note-taking app.

## Prerequisites

- Node.js 24 LTS
- pnpm 9.x or 10.x

## Run

```bash
pnpm install
pnpm --filter react-notes dev
```

## Test

```bash
pnpm --filter react-notes build
```

## Walkthrough

- `App.tsx` owns the note list state.
- The form uses controlled inputs so React state is the source of truth.
- Notes use stable `crypto.randomUUID()` ids instead of array indexes.
- Legacy Material UI dependencies were removed and replaced with `lucide-react` icons plus plain CSS.

## Exercises

- Persist notes to `localStorage`.
- Add an edit mode for an existing note.
- Add a character counter and disable submit for empty notes.
- Split the form and list into separate files once the state flow is clear.

## Further Reading

- React docs: https://react.dev/learn
- Vite docs: https://vite.dev/guide/
- TypeScript handbook: https://www.typescriptlang.org/docs/

