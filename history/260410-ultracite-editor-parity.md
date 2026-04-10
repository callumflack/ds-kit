# 260410 Ultracite Editor Parity

## Summary

We reset the repo back toward stock `Ultracite` editor + Biome config, while
keeping one explicit repo exception:

- `Cursor` should keep using `Prettier` for plain CSS save-formatting

That exception stays because real manual testing in Cursor showed that
`Biome` was not reliably formatting this repo's CSS on save, even when the file
was opened in plain `css` mode.

## Commits

This decision landed in these commits:

- `6d270ca` `refactor(tooling): simplify ultracite setup verification`
- `58bdfe6` `chore(editor): restore stock ultracite setup with css fallback`
- `78b0014` `style(skills): format ds-kit helper scripts`

Important earlier context:

- `7653332` `chore: lock css formatting to prettier in editor setup`

That earlier commit captured the first practical workaround. The commits above
clean it up, restore parity where possible, and document the minimum justified
deviation.

## What We Learned

### 1. The real problem was Cursor save-formatting, not Biome CLI

`Biome` CLI support was not the issue.

The failure was the editor integration path in Cursor for CSS save-formatting in
this repo.

### 2. `[tailwindcss]` and `[postcss]` were not needed here

A settings block like `[tailwindcss]` only matters if the editor actually opens
the file in the `tailwindcss` language mode.

This repo does **not** force `.css` files into Tailwind CSS mode via
`files.associations`, so the real save path here is:

1. open `.css` file
2. editor language is `css`
3. `[css]` settings apply

So:

- `[css]` matters
- `[tailwindcss]` does not
- `[postcss]` does not

### 3. `tailwindCSS.experimental.configFile` is useful, but separate

This setting helps Tailwind IntelliSense understand the repo's Tailwind v4
CSS-first entrypoint.

It does **not** change the editor language mode by itself.

We kept it because it improves editor behavior and points at the real entry:

- `src/styles/index.css`

### 4. `tailwindCSS.classFunctions` is worth keeping

We added:

- `tailwindCSS.classFunctions: ["cva", "cn"]`

This is only an IntelliSense hint for Tailwind autocomplete/hover support
inside `cva()` and `cn()` strings. It does not affect formatting or runtime.

This repo uses both helpers heavily, so it is a cheap, useful win.

### 5. Stock Ultracite uses Prettier at the root editor fallback

Stock `Ultracite` editor config does **not** make Biome the global default
formatter.

Instead it uses:

- root `editor.defaultFormatter = esbenp.prettier-vscode`
- per-language overrides back to `biomejs.biome`

That means the stock shape is:

- fallback formatter: Prettier
- supported languages: Biome

We restored that shape.

### 6. `biome.json` had drifted beyond stock Ultracite

The repo had accumulated custom Biome config that was either redundant or no
longer needed.

We confirmed that stock Ultracite already provides:

- CSS formatting enabled
- `css.parser.tailwindDirectives: true`
- standard 2-space indentation

So we removed duplicated local config and left `biome.json` close to a bare
`extends` file.

### 7. The setup verifier had become too clever

The old verify script:

- parsed settings
- rewrote CSS files with `prettier --write`
- checked token ordering with custom logic

That was too much ceremony for a setup check.

We simplified it to:

- assert the intended `.vscode` settings/extensions shape
- run `prettier --check` on the Tailwind-sensitive CSS files
- run `ultracite check` on the editor config files

Verify scripts should not mutate tracked files.

## Current Decision

Keep the repo on:

- stock Ultracite editor defaults where possible
- stock Ultracite Biome config where possible
- one explicit CSS exception for Cursor

That means:

- root editor fallback stays on `Prettier`
- JS/TS/JSON/etc stay on `Biome`
- plain `[css]` stays on `Prettier`
- no `[tailwindcss]` override
- no `[postcss]` override
- keep `tailwindCSS.experimental.configFile`
- keep `tailwindCSS.classFunctions`

## Current Policy

### Editor

- Use stock Ultracite editor defaults.
- Keep `[css] = esbenp.prettier-vscode`.
- Do not add `[tailwindcss]` unless the repo actually forces CSS files into that
  language mode.

### Biome

- Keep `biome.json` near-vanilla and rely on Ultracite presets.
- Do not duplicate preset behavior locally without a current repro.

### Verification

- `pnpm run verify:ultracite` should stay small and non-mutating.
- It exists to pin the agreed editor policy, not to implement a custom CSS test
  harness.

## Practical Rule

For this repo, the stable rule is:

- `Biome` for the repo generally
- `Prettier` for CSS save-formatting in Cursor
- Tailwind IntelliSense hints kept
- no fake Tailwind language-mode config unless we truly adopt it
