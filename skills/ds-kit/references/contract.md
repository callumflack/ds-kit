# Contract Reference

The install is healthy when these layers stay aligned:

- semantic tokens live in CSS first
- Tailwind-facing aliases live in `styles/index.css`
- merge-sensitive `text`, `radius`, and `spacing` namespaces are represented in `lib/classes.ts`
- `components/typography/text.tsx` stays the typography primitive
- `components/ui/button.tsx` stays the interactive primitive
- `components/typography/field.tsx` owns shared control geometry and state

## When extending locally

- Add semantics at the token layer before adding component variants.
- Update `styles/index.css` and `lib/classes.ts` together when new semantic `text`, `radius`, or `spacing` tokens appear.
- Prefer building on `Text` and `Button` instead of inventing a parallel styling system.
