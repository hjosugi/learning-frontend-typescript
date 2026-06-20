# Learning Frontend TypeScript

React, Svelte, Nuxt, HTML/CSS, and browser-facing TypeScript examples consolidated for learning.

Last verified: 2026-06-20

## Runtime Baseline

- Node.js: 24 LTS for normal learning work
- Package manager: pnpm 9.x or 10.x
- TypeScript: 6.x
- React: 19.2.x
- Vite: 8.x
- Svelte: 5.x
- SvelteKit: 2.x
- Nuxt: 4.x

Node 26 is current, but this repo uses Node 24 LTS as the default so examples stay stable for learners.

## Source Repositories

This learning repo absorbs the non-fork frontend and TypeScript setup repositories:

- `refine-search`
- `react-keep`
- `react-color-info`
- `react-color`
- `react-sandbox-h`
- `svelte-sandbox`
- `nuxt3-form`
- `html-css`
- `youtube-api`
- `setup`

Fork repositories are intentionally excluded.

## Planned Structure

```text
apps/
  react-notes/          # from react-keep
  react-color-lab/      # from react-color-info and react-color
  react-recipes/        # from react-sandbox-h
  refine-search/        # from refine-search
  svelte-product-page/  # from svelte-sandbox
  nuxt-form/            # from nuxt3-form
lessons/
  html-css/             # curated from html-css
  youtube-api/          # browser/API boundary notes from youtube-api
appendix/
  typescript-setup/     # from setup/typescript
docs/
  migration-map.md
  2026-learning-items.md
  browser-networking.md
```

## Learning Path

1. HTML and CSS fundamentals
2. TypeScript project setup
3. React state and component extraction
4. React forms and derived UI
5. React app structure with search and filtering
6. Svelte 5 runes and component composition
7. Nuxt 4 form handling
8. Browser networking boundaries
9. Browser API boundaries and YouTube API handling

## 2026 Learning Items

See [docs/2026-learning-items.md](docs/2026-learning-items.md).
See [docs/repository-profile.md](docs/repository-profile.md) for GitHub description, topics, public safety notes, and first milestones.

Main additions:

- React 19 form Actions, `useActionState`, `useFormStatus`, `useOptimistic`
- strict TypeScript API boundary models
- accessibility, responsive states, and performance basics
- Svelte 5 and Nuxt 4 comparison lessons

## Standard Lesson Shape

Each lesson should include:

- Goal
- Prerequisites
- Run
- Test
- Walkthrough
- Exercises
- Further reading
- Last verified
