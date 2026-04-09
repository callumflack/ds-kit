# Dependency Reference

Consumer repos should expect:

- React
- Tailwind CSS v4
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-slot`
- `lucide-react`
- `tw-animate-css`
- `shadcn`

Also check:

- the app supports `@import "tailwindcss"` and `@theme inline`
- global CSS can import `styles/index.css`
- the repo either uses `@/` aliases or the imports are adjusted

Notes:

- `components/ui/button.tsx` depends on `components/typography/field.tsx`
- `lib/utils.ts` is a compatibility re-export of `cn` from `lib/classes.ts`
