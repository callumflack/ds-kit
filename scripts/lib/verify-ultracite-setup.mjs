export const languageFormatterBlocks = {
  "[typescript]": "biomejs.biome",
  "[typescriptreact]": "biomejs.biome",
  "[javascript]": "biomejs.biome",
  "[javascriptreact]": "biomejs.biome",
  "[json]": "biomejs.biome",
  "[jsonc]": "biomejs.biome",
  "[css]": "esbenp.prettier-vscode",
  "[postcss]": "esbenp.prettier-vscode",
  "[tailwindcss]": "esbenp.prettier-vscode",
  "[graphql]": "biomejs.biome",
  "[html]": "biomejs.biome",
  "[markdown]": "biomejs.biome",
  "[mdx]": "biomejs.biome",
  "[svelte]": "biomejs.biome",
  "[vue]": "biomejs.biome",
  "[yaml]": "biomejs.biome",
};

export function getSettingsValidationErrors(settings, extensions) {
  const errors = [];
  const settingsPath = ".vscode/settings.json";
  const extensionsPath = ".vscode/extensions.json";

  if (settings["editor.defaultFormatter"] !== "biomejs.biome") {
    errors.push(
      `${settingsPath} should set editor.defaultFormatter to "biomejs.biome", not "${settings["editor.defaultFormatter"]}"`
    );
  }

  if (settings["biome.enabled"] !== true) {
    errors.push(`${settingsPath} should set biome.enabled to true`);
  }

  if (
    settings["tailwindCSS.experimental.configFile"] !== "src/styles/index.css"
  ) {
    errors.push(
      `${settingsPath} should set tailwindCSS.experimental.configFile to "src/styles/index.css" for Tailwind v4 CSS-first editor support`
    );
  }

  if (
    !(
      Array.isArray(extensions.recommendations) &&
      extensions.recommendations.includes("biomejs.biome")
    )
  ) {
    errors.push(`${extensionsPath} should recommend the Biome extension`);
  }

  if (
    !(
      Array.isArray(extensions.recommendations) &&
      extensions.recommendations.includes("esbenp.prettier-vscode")
    )
  ) {
    errors.push(
      `${extensionsPath} should recommend the Prettier extension for CSS save-formatting`
    );
  }

  const missingLanguageBlocks = Object.entries(languageFormatterBlocks)
    .map(([block, formatter]) => {
      const cfg = settings[block];
      return !cfg || cfg["editor.defaultFormatter"] !== formatter
        ? block
        : null;
    })
    .filter(Boolean);

  if (missingLanguageBlocks.length > 0) {
    errors.push(
      `Missing formatter overrides for: ${missingLanguageBlocks.join(", ")}`
    );
  }

  const cssBlock = settings["[css]"];
  if (!cssBlock || cssBlock["editor.formatOnSave"] !== true) {
    errors.push(
      `${settingsPath} [css] must set editor.formatOnSave to true so Cursor can save-format CSS with Prettier.`
    );
  }

  if (cssBlock?.["editor.defaultFormatter"] !== "esbenp.prettier-vscode") {
    errors.push(
      `${settingsPath} [css] must use esbenp.prettier-vscode as the CSS formatter`
    );
  }

  for (const block of ["[postcss]", "[tailwindcss]"]) {
    const cfg = settings[block];
    if (!cfg || cfg["editor.defaultFormatter"] !== "esbenp.prettier-vscode") {
      errors.push(
        `${settingsPath} ${block} must use esbenp.prettier-vscode as the formatter`
      );
    }
    if (cfg?.["editor.formatOnSave"] !== true) {
      errors.push(
        `${settingsPath} ${block} must set editor.formatOnSave to true`
      );
    }
  }

  if (settings["prettier.enable"] !== true) {
    errors.push(`${settingsPath} should keep prettier.enable set to true`);
  }

  if (settings["prettier.requireConfig"] !== true) {
    errors.push(`${settingsPath} should set prettier.requireConfig to true`);
  }

  return errors;
}

export function getThemeCssValidationErrors(
  themeCss,
  bridgeCss,
  label = "Theme CSS check"
) {
  const errors = [];
  const resetIndex = themeCss.indexOf("--text-*: initial;");
  const firstTextTokenIndex = themeCss.search(
    /--text-(?!\*: initial;)[a-z0-9-]+\s*:/
  );

  if (resetIndex === -1) {
    errors.push(
      `${label} lost the Tailwind text namespace reset in src/styles/semantic-tokens.css`
    );
  } else if (firstTextTokenIndex !== -1 && resetIndex > firstTextTokenIndex) {
    errors.push(
      `${label} moved --text-*: initial; below other --text-* declarations in src/styles/semantic-tokens.css`
    );
  }

  if (!bridgeCss.includes("--text-xs: var(--text-fine);")) {
    errors.push(`${label} changed the Tailwind alias layer unexpectedly`);
  }

  return errors;
}
