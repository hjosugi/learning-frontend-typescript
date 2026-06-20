# React Color Lab

Source repos: `react-color-info`, `react-color`

Last verified: 2026-06-20

## Goal

Learn typed collections, controlled forms, derived state, list rendering, and event callbacks in React.

## Prerequisites

- Node.js 24 LTS
- pnpm 9.x or 10.x

## Run

```bash
pnpm install
pnpm --filter react-color-lab dev
```

## Test

```bash
pnpm --filter react-color-lab build
```

## Walkthrough

- `App.tsx` owns the color collection and the form draft.
- `initialColors.ts` keeps seed data typed instead of importing untyped JSON.
- `StarRating` exposes each star as a real button with an accessible label.
- `ColorCard` receives callbacks from the parent instead of mutating data directly.
- The average rating is derived with `useMemo` from the current color list.

## Exercises

- Add edit mode for title and hex value.
- Add filtering by minimum rating.
- Persist the color list to `localStorage`.
- Validate pasted hex colors and show inline errors.

## Further Reading

- React docs: https://react.dev/learn
- TypeScript handbook: https://www.typescriptlang.org/docs/
- MDN color input: https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/input/color

