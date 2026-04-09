---
name: ds-kit
description: Install and audit ds-kit in a consuming app via the shadcn registry. Use when the user wants `@ds-kit/core` added to another repo, needs the registry install verified, or wants to check that a consuming app still matches the ds-kit contract.
---

# DS Kit

Use this skill in a consuming repo, not in the ds-kit source repo.

If the work is about `registry.json`, `public/r/*.json`, publishing, or fixing the source registry itself, use `.agents/skills/ds-kit-registry-guardian/SKILL.md` instead.

Keep this file lean. Use bundled references and scripts:

- `references/install.md`
- `references/contract.md`
- `references/install-assumptions.md`
- `scripts/post-add-ds-kit.mjs`
- `scripts/verify-install.mjs`

## Scope

Current install target:

- `@ds-kit/core`

The kit contract currently centers on:

- CSS tokens first
- Tailwind theme mapping in `index.css`
- merge-aware semantic utilities in `classes.ts`
- `Text` as the canonical typography primitive
- `Button` as the canonical interactive primitive
- shared sizing/focus/invalid helpers in `components/typography/field.tsx`

Do not bypass the registry by copying files unless the user explicitly asks for that.

## Modes

Choose the narrowest mode that fits the request.

### Install

Use for requests like:

- "install my ds kit here"
- "set up my design system in this Next app"
- "add `@ds-kit/core` to this app"

Workflow:

1. Inspect the target repo before editing.
2. Check the target structure:
   - whether `src/` exists
   - whether imports use `@/`
   - where global CSS is loaded
   - whether Tailwind 4 is in use
3. Ensure shadcn is initialized.
4. Add the `@ds-kit` registry entry if it is missing.
5. Run `npx shadcn@latest add @ds-kit/core`.
6. Ensure the global stylesheet entrypoint imports `styles/index.css`.
7. Read `references/install-assumptions.md` and `references/install.md` if you need the exact caveats.
8. Run `node <skill-dir>/scripts/post-add-ds-kit.mjs`.
9. Run `node <skill-dir>/scripts/verify-install.mjs`.
10. Check integration assumptions and report follow-up work:
   - dependencies
   - global stylesheet entrypoint
   - alias differences
11. Summarize exactly what was installed and any manual follow-up.

Default behavior:

- Prefer `shadcn add @ds-kit/core`.
- Make the smallest integration edits needed after install.

### Audit

Use for requests like:

- "audit this repo against ds-kit"
- "does this app still follow my design-system contract?"
- "check whether the design-system install drifted"

Audit for these conditions:

- semantic tokens are defined in CSS before component-level use
- Tailwind-facing semantic aliases live in `styles/index.css`
- `classes.ts` knows about merge-sensitive semantic utilities
- `Text` remains the canonical typography primitive
- `Button` remains the canonical interactive primitive
- `Button` and related components still use the shared sizing/focus contract rather than inventing parallel geometry

Read `references/contract.md` when you need the precise contract wording.

Findings should be concrete and path-based. Focus on drift, missing touchpoints, and parallel styling systems.

### Extend

Use for requests like:

- "add a new semantic token"
- "add a button variant"
- "extend the text scale"
- "rename a design token semantically"

This mode is for extending a consuming app after the registry install, not for publishing ds-kit itself.

Before editing, identify all required touchpoints. For common local changes:

- new token:
  - local `styles/vars.css`
  - local `styles/index.css`
  - local `lib/classes.ts` if merge-sensitive utilities change
- new typography semantic:
  - local `styles/index.css`
  - local `components/typography/text.tsx`
  - local `lib/classes.ts` if it creates new merge-sensitive utilities
- new button semantic:
  - local `components/ui/button.tsx`
  - local supporting token/theme files if the variant depends on new semantics
- shared control sizing/state change:
  - local `components/typography/field.tsx`
  - local `components/ui/button.tsx`

Prefer changing the token and contract layers first, then component variants.

Read `references/contract.md` before changing merge-sensitive semantics.

## Guardrails

- Treat ds-kit as a registry install in consumer repos.
- Do not switch to manual copy unless the user explicitly wants that.
- Do not silently broaden the install with unrelated `ui/*` files.
- Keep app-specific branding local unless the user explicitly wants to promote it back into ds-kit.
- If a requested change seems foundational and reusable, suggest promoting it back to the ds-kit source repo.

## Output

For install work, report:

- whether `@ds-kit` was configured
- what `shadcn add` installed
- integration assumptions checked
- manual follow-up, if any

For audit work, report:

- findings first
- any open questions or assumptions
- brief drift summary

For extension work, report:

- which contract layers were updated
- any follow-up promotion recommendation

## Example prompts

- "Install my ds-kit into this Next app."
- "Audit this repo against my ds-kit contract."
- "Add `@ds-kit/core` and make sure globals are wired up."
