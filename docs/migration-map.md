# Migration Map

Last verified: 2026-06-20

## Version Targets

| Area | Target |
| --- | --- |
| Node.js | 24 LTS |
| TypeScript | 6.0.3 |
| Vite | 8.0.16 |
| React | 19.2.7 |
| React DOM | 19.2.7 |
| ESLint | 10.5.0 |
| Svelte | 5.56.3 |
| SvelteKit | 2.66.0 |
| Nuxt | 4.4.8 |
| refine core | 5.0.12 |

## Repo Mapping

| Source repo | Destination | Treatment |
| --- | --- | --- |
| `html-css` | `lessons/html-css` | Curate into grouped lessons. Do not keep every numbered directory as top-level learning material. |
| `setup/typescript` | `appendix/typescript-setup` | Update to TypeScript 6 and modern test/tooling notes. |
| `react-keep` | `apps/react-notes` | Update React 18 to React 19. Replace legacy Material UI packages. |
| `react-color-info` | `apps/react-color-lab` | Merge with `react-color`. Keep as state, list rendering, and rating exercise. |
| `react-color` | `apps/react-color-lab` | Empty placeholder. Absorb concept only, then archive source repo. |
| `react-sandbox-h` | `apps/react-recipes` | Keep as props/composition exercise. Update Vite/React/TypeScript. |
| `refine-search` | `apps/refine-search` | Update refine 4 to refine 5 and React Router assumptions. |
| `svelte-sandbox` | `apps/svelte-product-page` | Convert Svelte 5 prerelease usage to stable Svelte 5 runes where useful. |
| `nuxt3-form` | `apps/nuxt-form` | Placeholder. Rebuild as Nuxt 4 form validation lesson. |
| `youtube-api` | `lessons/youtube-api` | Keep as API boundary lesson. Avoid teaching browser-side secret handling. |

## Migration Rules

- Keep source repos intact until the consolidated lesson builds.
- Move code by lesson intent, not by old repo name.
- Prefer small runnable examples over large copied folders.
- Every runnable app must have `dev`, `build`, and either `test` or `check`.
- Every lesson must include `Last verified`.
- Empty source repos become archive candidates after their concept is represented here.

## Migration Status

| Destination | Status | Verification |
| --- | --- | --- |
| `apps/react-notes` | Migrated from `react-keep`; legacy Material UI removed; typed React 19 sample created. | `pnpm --filter react-notes build` passed on 2026-06-20. |
| `apps/react-color-lab` | Migrated from `react-color-info`; `react-color` absorbed as concept-only placeholder; typed React 19 sample created. | `pnpm --filter react-color-lab build` passed on 2026-06-20. |
| frontend workspace | Root workspace build passed for migrated apps. | `pnpm build` passed on 2026-06-20. |

## Known Risks

- ESLint 10 and TypeScript 6 can require config changes; update lint only after each app builds.
- Vite 8 may require newer plugin versions and Node 24+.
- `react-keep` depends on legacy Material UI packages; replace them with plain CSS or a current maintained UI package.
- YouTube API examples must not put API secrets in frontend code.
- `html-css` contains many generated or exercise assets. Keep only material with clear learning value.
