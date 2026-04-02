---
name: ds-kit-registry-guardian
description: Use this skill whenever you need to publish ds-kit updates, add or modify registry components, or safely roll out `shadcn`-installable items from this repo. Use it even when the request only says "release", "publish", "ship", "new component", or "update registry", because this workflow must block unsafe or partial component updates.
---

# DS Kit Registry Guardian

Use this skill to safely publish `ds-kit` updates as a shadcn registry and guard accidental component drift.

## Goal

Keep the registry truthful and installable:
- every changed runtime file is represented in `registry.json`
- every published item is buildable
- package outputs are committed and publicly hostable
- a consumer can run `npx shadcn@latest add @ds-kit/<item>` immediately

## Scope

Use this skill when asked to:
- publish or release ds-kit
- add a new component/utility/style to the source tree
- update any registry item
- troubleshoot bad `shadcn add` installs from a consuming repo

## Guardrails (mandatory)

Before any publish:

1. Confirm this repo is the source of truth:
   - canonical path: `/Users/cflack/Repos/callumflack/ds-kit`
2. Identify changed files:
   - `git status --short`
3. For every changed file under:
   - `components/`, `lib/`, `styles/`
   check that path is already in `registry.json` (under the intended item’s `files[].path`).
4. If a changed file is missing from `registry.json`, stop and add it.
5. Keep `name` values stable and unique in `registry.json` (especially for existing items).
6. Never hand-edit generated files in `public/r/` without rebuilding first.

## Registry layout assumption

- Registry definition: `registry.json`
- Build output: `public/r/*.json`
- Build script: `pnpm registry:build` (from `package.json`)
- Initial install target: `core`

If the repo adds separate components later, convert from single `core` to granular items, but keep this guardrail rule:
`<item>` is the `name` in `registry.json`, not the file path.

## Publish workflow

1. Implement change in source (`styles`, `lib`, `components`).
2. Update `registry.json`:
   - add/update item in `items`
   - keep each file entry with `path` + `type`.
3. Validate schema quickly:
   - required for changed entries: `name`, `type`, `title`, `description`, `files`
4. Build registry payload:
   - `pnpm registry:build`
5. Ensure outputs are present:
   - `public/r/core.json` exists for `core`
   - if itemized: `public/r/<item>.json` for each changed/added item
6. Verify installability:
   - `pnpm registry:build` succeeded
   - no unresolved imports in generated files
7. Add and commit:
   - `package.json` changes
   - `registry.json`
   - generated `public/r/*.json`
8. Push to `main` or release branch.
9. Publish/serve registry endpoint (GitHub Pages/Vercel), then ensure item URL resolves:
   - `https://<host>/r/<item>.json`
10. Smoke check from a scratch repo:
   - add to `components.json`:
     - `@ds-kit: "https://<host>/r/{name}.json"`
   - run `npx shadcn@latest add @ds-kit/core`

## Consume from any repo

- add to `components.json`:

```json
{
  "registries": {
    "@ds-kit": "https://<host>/r/{name}.json"
  }
}
```

- install:
  - `npx shadcn@latest add @ds-kit/core`

For one-off item URLs:
- `npx shadcn@latest add https://<host>/r/core.json`

## Change types and required updates

- New file in existing item:
  - add file to that item’s `files` array, rebuild.
- New public-facing primitive (component/lib/style):
  - add new item with unique `name`, `type`, `files`.
- Renamed file:
  - remove old path from item `files`, add new path, rebuild.
- Breaking change:
  - treat as a major version update in release notes and docs.

## Output format

Always return:
1. files changed
2. items touched/added/removed
3. generated registry files updated
4. validation/build result
5. next consumer test command

If any guardrail fails, return a blocker list first, do not mark as ready to publish.

## Example prompts

- "Create a new registry item for `components/elements/new-widget.tsx` and publish it."
- "Can we publish ds-kit updates now? check guardrails and run release steps."
- "`npx shadcn@latest add @ds-kit/core` fails; verify registry setup."
