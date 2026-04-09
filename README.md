# Design System Kit

This repo publishes a small shadcn registry for the reusable ds-kit foundation.

`core` currently includes:

- the CSS token and theme layer in `src/styles/`
- the merge-aware `cn()` policy in `src/lib/classes.ts`
- the typography primitive in `src/components/typography/text.tsx`
- the shared control geometry in `src/components/typography/field.tsx`
- the interactive primitive in `src/components/ui/button.tsx`

It intentionally does not try to ship a full app shell or a giant component catalog.

In this source repo, `src/` is the canonical shipped runtime surface. Root-level files are repo-only.

## Install in another repo

1. Initialize shadcn in the target repo.
2. Add this registry entry to `components.json`:

```json
{
  "registries": {
    "@ds-kit": "https://raw.githubusercontent.com/callumflack/ds-kit/main/public/r/{name}.json"
  }
}
```

3. Install the kit:

```bash
npx shadcn@latest add @ds-kit/core
```

4. Make sure the target app imports `styles/index.css` from its global stylesheet entrypoint.

One-off install also works:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/callumflack/ds-kit/main/public/r/core.json
```

## Source repo checks

Before publishing registry changes from this repo:

```bash
pnpm run registry:build
pnpm run verify:registry-surface
pnpm run verify:ds-kit
pnpm run verify:tw-merge
pnpm run ultracite:verify-setup
```

`verify:registry-surface` is the drift alarm between `src/` and `registry.json`.
It fails when a shippable runtime file exists under `src/` but is not declared in the registry, or when `registry.json` points at a missing `src/` file.

## Docs

Root docs govern the repo. They stay capitalized and at the top level because they define rules or workflows that shape the whole kit:

- `CONTRACT.md`: the runtime contract across tokens, Tailwind aliases, merge rules, and canonical primitives
- `REGISTRY-INSTALL.md`: the source-repo install and publish notes for shipping the kit through the registry

`references/` is for supporting docs. These help with decisions or setup, but they do not define the repo's core contract:

- `references/promotion-rule.md`: what belongs in ds-kit vs a consuming app
- `references/install-assumptions.md`: the consumer app assumptions behind a working registry install

## Skills

- `skills/ds-kit/SKILL.md`: use in a consuming app to install or audit ds-kit via the registry
  It carries its own bundled references in `skills/ds-kit/references/` and helper scripts in `skills/ds-kit/scripts/`.
- `.agents/skills/ds-kit-registry-guardian/SKILL.md`: use in this source repo when changing `registry.json`, publishing items, or debugging install failures
