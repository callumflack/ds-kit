export const languageFormatterBlocks = {
  "[typescript]": "biomejs.biome",
  "[typescriptreact]": "biomejs.biome",
  "[javascript]": "biomejs.biome",
  "[javascriptreact]": "biomejs.biome",
  "[json]": "biomejs.biome",
  "[jsonc]": "biomejs.biome",
  "[graphql]": "biomejs.biome",
  "[html]": "biomejs.biome",
  "[markdown]": "biomejs.biome",
  "[mdx]": "biomejs.biome",
  "[svelte]": "biomejs.biome",
  "[vue]": "biomejs.biome",
  "[yaml]": "biomejs.biome",
};

const textTokenPattern = /--text-(?!\*: initial;)[a-z0-9-]+\s*:/;

export function getSettingsValidationErrors(settings, extensions) {
  const errors = [];
  const settingsPath = ".vscode/settings.json";
  const extensionsPath = ".vscode/extensions.json";

  if (settings["editor.defaultFormatter"] !== "esbenp.prettier-vscode") {
    errors.push(
      `${settingsPath} should set editor.defaultFormatter to "esbenp.prettier-vscode", not "${settings["editor.defaultFormatter"]}"`
    );
  }

  if (settings["editor.formatOnPaste"] !== true) {
    errors.push(`${settingsPath} should set editor.formatOnPaste to true`);
  }

  if (settings["editor.formatOnSave"] !== true) {
    errors.push(`${settingsPath} should set editor.formatOnSave to true`);
  }

  if (settings["emmet.showExpandedAbbreviation"] !== "never") {
    errors.push(
      `${settingsPath} should set emmet.showExpandedAbbreviation to "never"`
    );
  }

  if (settings["js/ts.tsdk.path"] !== "node_modules/typescript/lib") {
    errors.push(
      `${settingsPath} should set js/ts.tsdk.path to "node_modules/typescript/lib"`
    );
  }

  if (settings["js/ts.tsdk.promptToUseWorkspaceVersion"] !== true) {
    errors.push(
      `${settingsPath} should set js/ts.tsdk.promptToUseWorkspaceVersion to true`
    );
  }

  if (
    settings["tailwindCSS.experimental.configFile"] !== "src/styles/index.css"
  ) {
    errors.push(
      `${settingsPath} should set tailwindCSS.experimental.configFile to "src/styles/index.css" for Tailwind v4 CSS-first editor support`
    );
  }

  if (
    JSON.stringify(settings["tailwindCSS.classFunctions"]) !==
    JSON.stringify(["cva", "cn"])
  ) {
    errors.push(
      `${settingsPath} should set tailwindCSS.classFunctions to ["cva", "cn"]`
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

  if (
    settings["[css]"]?.["editor.defaultFormatter"] !== "esbenp.prettier-vscode"
  ) {
    errors.push(
      `${settingsPath} [css] must use esbenp.prettier-vscode as the CSS formatter`
    );
  }

  if (
    settings["editor.codeActionsOnSave"]?.["source.fixAll.biome"] !==
      "explicit" ||
    settings["editor.codeActionsOnSave"]?.["source.organizeImports.biome"] !==
      "explicit"
  ) {
    errors.push(
      `${settingsPath} should keep Biome fixAll and organizeImports code actions on save set to "explicit"`
    );
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
  const firstTextTokenIndex = themeCss.search(textTokenPattern);

  if (resetIndex === -1) {
    errors.push(
      `${label} lost the Tailwind text namespace reset in src/styles/tokens-semantic.css`
    );
  } else if (firstTextTokenIndex !== -1 && resetIndex > firstTextTokenIndex) {
    errors.push(
      `${label} moved --text-*: initial; below other --text-* declarations in src/styles/tokens-semantic.css`
    );
  }

  if (!bridgeCss.includes("--text-xs: var(--text-fine);")) {
    errors.push(`${label} changed the Tailwind alias layer unexpectedly`);
  }

  return errors;
}
