# Design System Kit

This repo is the canonical copy-first design-system foundation.

It is intentionally small. V1 includes:

- the token source in `styles/`
- the Tailwind theme bridge in `styles/index.css`
- the semantic `cn` merge policy in `lib/classes.ts`
- the typography primitive in `components/typography/text.tsx`
- the customized button primitive in `components/ui/button.tsx`
- the shared field sizing and interaction helpers that button depends on in `components/typography/field.tsx`

V1 intentionally excludes the broader form/control system, app wrappers, and product-specific convenience components.

## Repo layout

- `styles/`, `lib/`, and `components/` are the installable runtime surface.
- `.vscode/settings.json` should be copied into consuming repos to suppress "Unknown at rule" warnings for Tailwind directives (`@apply`, `@theme`, etc.).
- `skills/` contains the ds-kit skill used to install, audit, and extend the kit.
- `references/` contains supporting notes such as dependency assumptions and source mapping.
- `CONTRACT.md`, `PROMOTION-RULE.md`, and `INSTALL-NOTES.md` define the operating rules for the kit.

## How to use this repo

Use this repo as the source of truth for the shared foundation.

- Copy the runtime surface into a target app when starting a new project.
- Use `skills/ds-kit/SKILL.md` to guide install, audit, and extension workflows.
- Keep app-specific branding local unless it proves durable enough to promote back here.

The goal is local ownership in each consuming repo without losing a clear canonical source.
