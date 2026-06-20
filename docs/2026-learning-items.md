# 2026 Learning Items: Frontend TypeScript

Last verified: 2026-06-20

## Baseline

- Node.js 24 LTS for stable learning work
- React 19.2.x
- TypeScript 6.x
- Vite 8.x
- Svelte 5.x
- Nuxt 4.x

## Must Learn

### React 19 application patterns

- form Actions
- `useActionState`
- `useFormStatus`
- `useOptimistic`
- Suspense and async UI boundaries
- error boundaries and recovery UI

Projects:

- Add a form Actions lesson to `apps/react-notes`.
- Add optimistic add/remove behavior to `apps/react-color-lab`.
- Build `apps/react-recipes` from `react-sandbox-h`.

### TypeScript at boundaries

- strict mode
- discriminated unions for UI state
- typed API response models
- runtime validation at network boundaries
- no unchecked index access

Projects:

- Add `lessons/typescript-api-boundaries`.
- Convert JSON imports to typed modules or validated data.

### Production UI basics

- accessibility checks
- responsive layout
- loading, empty, and error states
- keyboard navigation
- performance budgets
- screenshots for README files

Projects:

- Add one screenshot per runnable app under `docs/images`.
- Add accessibility notes to each app README.

### Framework comparison

- React client app
- Svelte 5 component model
- Nuxt 4 form handling
- refine search/admin UI

Projects:

- `apps/svelte-product-page`
- `apps/nuxt-form`
- `apps/refine-search`

## Done

- `apps/react-notes`: React 19 / Vite 8 / TypeScript 6 migration
- `apps/react-color-lab`: React 19 / Vite 8 / TypeScript 6 migration
- root `pnpm build` passes

## Next

1. Add `apps/react-recipes`.
2. Add React 19 form Actions exercise.
3. Add screenshots for migrated apps.
4. Start `apps/svelte-product-page`.

