# Install Reference

Use the shadcn registry path by default.

## Standard flow

1. Run `npx shadcn@latest init`.
2. Add this registry entry to `components.json`:

```json
{
  "registries": {
    "@ds-kit": "https://raw.githubusercontent.com/callumflack/ds-kit/main/public/r/{name}.json"
  }
}
```

3. Run `npx shadcn@latest add @ds-kit/core`.
4. Ensure the app's global stylesheet entrypoint imports `styles/index.css`.

## Post-add intent

The post-add step should stay tiny:

- confirm the expected `styles/*.css` files exist
- ensure the global stylesheet imports `styles/index.css`

It should not move files around or compensate for a broken registry payload.

## Common follow-up

- If shared UI is missing from Tailwind scanning, add `@source "../**/*.{ts,tsx,js,jsx,html}";` to `styles/index.css`.
- Keep branding and product-specific tokens local unless they prove reusable.
- If the app does not use `@/`, adjust imports after install.
