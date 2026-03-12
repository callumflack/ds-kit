# Contract

The kit is portable because these layers stay aligned:

- Semantic tokens are authored in CSS variables first, primarily in `styles/vars.css`.
- Tailwind-facing semantic aliases are mapped in `styles/index.css`.
- Any semantic utility namespace that can conflict in Tailwind class merging must be registered in `lib/classes.ts`.
- `components/typography/text.tsx` is the canonical typography primitive.
- `components/ui/button.tsx` is the canonical interactive primitive.
- `components/typography/field.tsx` is shared interaction geometry, not just a forms file. It currently provides focus, invalid, and sizing helpers used by button.

When extending the kit:

- Add new semantics at the token layer before adding component variants.
- Update `classes.ts` whenever new semantic Tailwind utilities need merge awareness.
- Prefer building on `Text` and `Button` rather than introducing disconnected styling patterns.
