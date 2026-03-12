# Dependencies

**Dev (ds-kit repo only):** `@biomejs/biome` — lint/format. See `biome.json` for Tailwind-aware config.

These copied files currently assume:

- React
- Tailwind CSS v4
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-slot`
- `lucide-react`
- `tw-animate-css`
- `shadcn`

Other assumptions to check in a target repo:

- the app supports `@import "tailwindcss"` and `@theme inline`
- global CSS can import `styles/index.css`
- the repo either uses `@/` aliases or the copied imports are adjusted
- font assets referenced in `styles/index.css` exist or are replaced

Notes:

- `components/ui/button.tsx` depends on `components/typography/field.tsx` for shared heights and interaction states.
- `lib/utils.ts` is kept as a compatibility re-export of `cn` from `lib/classes.ts`.
