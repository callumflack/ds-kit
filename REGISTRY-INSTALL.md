# Registry Install Notes

The intended workflow is shadcn registry first.

In this source repo, the shipped runtime lives under `src/`. In a consuming app, installed files may land under `styles/` or `src/styles/` depending on that repo's shadcn setup.

In your Next.js app:

1. Run `npx shadcn@latest init`.
2. Add the `@ds-kit` registry entry to `components.json`.
3. Run `npx shadcn@latest add @ds-kit/core`.
4. Ensure the target app loads `styles/index.css` from its global stylesheet entry.
5. Check `references/install-assumptions.md` for the runtime and setup assumptions a consuming app must satisfy.
6. Verify that Tailwind 4, `@theme inline`, and the shared `cn` helper are wired up.

## What the helper should do

`scripts/post-add-ds-kit.mjs` should stay tiny.

Its job is:

- confirm the expected `styles/*.css` files exist after `shadcn add`
- ensure the app's global stylesheet entrypoint imports `styles/index.css`

Its job is not:

- moving files around
- reshaping the install output
- masking a broken registry definition

Expected follow-up adaptation points:

- **@source scan path**: If build misses shared UI (e.g. auth pages), add `@source "../**/*.{ts,tsx,js,jsx,html}";` to `styles/index.css`.
- brand colors
- app-specific token aliases
- any import alias differences between repos

## Styling contract

`ds-kit` is a layer on top of `shadcn` plus Tailwind, not a replacement for either.

- `styles/index.css` keeps the shared Tailwind entry imports in one place.
- `styles/semantic-tokens.css` owns the fluid primitives plus ds-kit semantic tokens.
- `styles/tailwind-aliases.css` maps Tailwind's default variable names onto ds-kit semantic tokens.
- Keep `--text-*: initial;` in its own `@theme` block inside `styles/semantic-tokens.css`; that is a deliberate guard against the Biome + Cursor CSS formatting bug documented in `history/260409-ultracite-cursor-css-formatting.md`.
- Prefer semantic utilities like `text-*`, `bg-*`, `rounded-*`, and spacing aliases over direct `var(--token)` usage in app code.
- Reach into `vars.css` when changing source values.
- Extend `semantic-tokens.css` when the shared semantic API needs a new token.
