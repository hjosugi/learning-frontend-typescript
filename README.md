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

## What This Repo Teaches

This repo is for product-facing frontend engineering, not just framework samples.

The examples should make these tradeoffs visible:

- when state should be local, derived, URL-based, or server-backed
- how form state, validation, pending UI, optimistic updates, and error recovery fit together
- how TypeScript models protect API and UI boundaries
- how accessibility and responsive behavior are verified, not guessed
- how browser APIs such as media, storage, fetch, and real-time transports affect app design

## How To Study It

Start with one app at a time and read the README before the source code:

1. run the app
2. identify the state model and API boundary
3. change one behavior
4. add or update a test/check
5. write the lesson note while the tradeoff is still fresh

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

## What Belongs Here

- UI applications and browser-facing TypeScript
- React, Svelte, Nuxt, HTML/CSS, and Vite examples
- browser API usage from the client side
- frontend accessibility, performance, and state-management notes

## What Belongs Elsewhere

- backend API implementation belongs in `learning-backend-ddd`
- browser-side P2P/WebRTC experiments belong here; deeper protocol mechanics belong in `learning-platform-engineering`
- deployment, reverse proxy, and WebTransport server notes belong in `learning-platform-engineering`
- AI model calls and credentials belong in `learning-ai-python`

## 2026 Learning Items

See [docs/2026-learning-items.md](docs/2026-learning-items.md).
See [docs/repository-profile.md](docs/repository-profile.md) for GitHub description, topics, public safety notes, and first milestones.

Main additions:

- React 19 form Actions, `useActionState`, `useFormStatus`, `useOptimistic`
- strict TypeScript API boundary models
- accessibility, responsive states, and performance basics
- Svelte 5 and Nuxt 4 comparison lessons

## First Milestones

1. Keep `react-notes` and `react-color-lab` building on the current baseline.
2. Move `react-sandbox-h` into `apps/react-recipes`.
3. Move `refine-search` into `apps/refine-search` and document data-provider boundaries.
4. Move `svelte-sandbox` and `nuxt3-form` into focused lessons instead of broad sandboxes.
5. Curate `html-css` into layout, responsive, animation, and form lessons.

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
