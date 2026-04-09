# 260409 Ultracite Cursor CSS Formatting

## Summary

This note records the investigation into why `Ultracite + Biome + Cursor` was not
behaving cleanly for CSS save-formatting in this repo, especially around the
Tailwind v4 theme files in `styles/`.

Short version:

- `Ultracite` already enables the relevant Biome CSS settings.
- `Biome` CLI formatting works for the sensitive CSS files in this repo.
- `Cursor` CSS save-formatting is the broken path here.
- The practical workaround is:
  `Biome` for the repo generally, `Prettier` for CSS in Cursor only.

## Problem Statement

Desired state:

- vanilla `Ultracite`
- `Biome` as the formatter
- edit CSS in Cursor
- press save
- no broken Tailwind token ordering
- no editor errors

Observed failures during investigation:

- Cursor showed `Request textDocument/rangeFormatting failed.` with source `Biome`
- earlier experiments left the repo in confusing intermediate states
- there was concern that formatting was moving `--text-*: initial;` into the wrong
  place and breaking text tokens

## What We Checked

### Repo config

We checked:

- [`biome.json`](/Users/cflack/Repos/callumflack/ds-kit/biome.json)
- [`.vscode/settings.json`](/Users/cflack/Repos/callumflack/ds-kit/.vscode/settings.json)
- [`.vscode/extensions.json`](/Users/cflack/Repos/callumflack/ds-kit/.vscode/extensions.json)
- [`styles/ds-kit-theme.css`](/Users/cflack/Repos/callumflack/ds-kit/styles/ds-kit-theme.css)
- [`styles/tailwind-text-token-bridge.css`](/Users/cflack/Repos/callumflack/ds-kit/styles/tailwind-text-token-bridge.css)

### External references

We checked:

- [Biome getting started](https://biomejs.dev/guides/getting-started/)
- [Ultracite docs](https://docs.ultracite.ai/)
- [Ultracite repo](https://github.com/haydenbleasel/ultracite)
- [Ultracite configuration docs](https://www.ultracite.ai/configuration)
- [Ultracite migrate from Stylelint docs](https://docs.ultracite.ai/migrate/stylelint)
- [Vercel next-forge](https://github.com/vercel/next-forge)

We also compared another working repo:

- [context-gateway `.vscode/settings.json`](/Users/cflack/Repos/vana-com/context-gateway/.vscode/settings.json)
- [context-gateway `biome.json`](/Users/cflack/Repos/vana-com/context-gateway/biome.json)

## What We Learned

### 1. Ultracite was not missing the CSS setup

The important Biome CSS config was already aligned with Ultracite expectations:

- `css.formatter.enabled: true`
- `css.parser.tailwindDirectives: true`

So the root issue was not "we forgot to configure Biome for CSS."

### 2. Biome CLI and Cursor save-formatting are not the same thing

This was the key distinction.

`Biome` could format the CSS files from the CLI without breaking the sensitive
Tailwind theme files.

But Cursor save-formatting was failing with:

- `Request textDocument/rangeFormatting failed.`

That means the broken path is editor integration, specifically the formatting path
Cursor uses for CSS save behavior in this repo.

### 3. The Tailwind v4 editor hint is worth keeping

From `next-forge`, one useful editor-side detail was:

- `tailwindCSS.experimental.configFile`

For CSS-first Tailwind v4 repos, this helps the Tailwind extension understand the
real CSS entry point. In this repo that is:

- `styles/index.css`

This improves editor behavior, but it does not solve the Biome range-formatting
failure.

### 4. Prettier appears safe for the scary CSS files

We tested `Prettier` against:

- `styles/ds-kit-theme.css`
- `styles/tailwind-text-token-bridge.css`

It preserved the critical `--text-*: initial;` reset and did not visibly damage the
theme bridge file in our checks.

## Options We Considered

### Option A: Pure Ultracite + Biome everywhere

Pros:

- cleanest ideal state
- lowest conceptual overhead

Cons:

- not reliable in Cursor for CSS save-formatting in this repo today
- reproduces the failing `rangeFormatting` editor path

Conclusion:

- not viable right now

### Option B: Disable CSS save-formatting entirely

Pros:

- avoids Cursor throwing errors
- keeps Biome canonical

Cons:

- bad day-to-day editing experience
- not "Zen like"
- forces manual formatting

Conclusion:

- acceptable as a temporary safety stop
- not the preferred steady state

### Option C: Biome generally, Prettier for CSS in Cursor only

Pros:

- preserves Ultracite/Biome as the main formatter stack
- fixes the practical save workflow in Cursor
- avoids the broken Biome CSS save path
- tested safe enough on the sensitive Tailwind files

Cons:

- not perfectly pure
- one extra tool exists only because of editor behavior

Conclusion:

- best practical workaround found

## Current Decision

Current repo policy:

- `Biome` is the default formatter for the repo generally
- `Prettier` is used for CSS in Cursor only
- `Biome` CSS support remains enabled in `biome.json`
- Tailwind editor config points at `styles/index.css`
- setup verification checks both `Biome` and `Prettier` behavior on the sensitive
  CSS files

## Files Changed As Part Of This Investigation

- [`biome.json`](/Users/cflack/Repos/callumflack/ds-kit/biome.json)
- [`.vscode/settings.json`](/Users/cflack/Repos/callumflack/ds-kit/.vscode/settings.json)
- [`.vscode/extensions.json`](/Users/cflack/Repos/callumflack/ds-kit/.vscode/extensions.json)
- [`.prettierrc.json`](/Users/cflack/Repos/callumflack/ds-kit/.prettierrc.json)
- [`scripts/verify-ultracite-setup.mjs`](/Users/cflack/Repos/callumflack/ds-kit/scripts/verify-ultracite-setup.mjs)
- [`README.md`](/Users/cflack/Repos/callumflack/ds-kit/README.md)
- [`AGENTS.md`](/Users/cflack/Repos/callumflack/ds-kit/AGENTS.md)

## Open Question

If Cursor or the Biome extension fixes CSS `textDocument/rangeFormatting` support
later, we should revisit this and try to remove the CSS-only Prettier workaround.

That future cleanup should start by testing:

1. `biomejs.biome` as the CSS formatter in Cursor
2. CSS save-formatting on `styles/ds-kit-theme.css`
3. preservation of `--text-*: initial;`
4. removal of the Prettier CSS-only workaround if all of the above hold
