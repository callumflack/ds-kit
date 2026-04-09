# Install Assumptions

This file documents what must already be true in a consuming app for a `ds-kit` registry install to work cleanly.

**Dev (ds-kit repo only):** `@biomejs/biome` — lint/format. See `biome.json` for Tailwind-aware config.

A consuming app currently needs:

- React
- Tailwind CSS v4
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-slot`
- `lucide-react`
- `tw-animate-css`
- `shadcn`

Other install assumptions to check in a target repo:

- the app supports `@import "tailwindcss"` and `@theme inline`
- global CSS can import `styles/index.css`
- the repo either uses `@/` aliases or the installed imports are adjusted

Notes:

- `components/ui/button.tsx` depends on `components/typography/field.tsx` for shared heights and interaction states.
- `lib/utils.ts` is kept as a compatibility re-export of `cn` from `lib/classes.ts`.
