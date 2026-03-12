# Install Notes

The intended workflow is manual copy first.

For a fresh Next.js app:

1. Copy the contents of `styles/`, `lib/`, and `components/` into matching folders in the target repo.
2. Ensure the target app loads `styles/index.css` as its global stylesheet entry.
3. Ensure path aliases match the copied imports, or adapt imports after copy.
4. Install the runtime dependencies listed in `references/dependencies.md`.
5. Verify that Tailwind 4, `@theme inline`, and the shared `cn` helper are wired up.
6. Start with `Text` and `Button`; add the wider field/control system later if needed.
7. Run `pnpm install && pnpm run check` for Biome (lint/format). Copy `biome.json` when consuming.

Expected follow-up adaptation points:

- **@source scan path**: If build misses shared UI (e.g. auth pages), add `@source "../**/*.{ts,tsx,js,jsx,html}";` to `styles/index.css`.
- brand colors
- font files and font loading
- app-specific token aliases
- any import alias differences between repos
