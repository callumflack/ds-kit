import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  compareThemeAndClassTokens,
  mergeThemeTokens,
  parseClassTokens,
  parseThemeTokens,
} from "../scripts/lib/verify-tw-merge-theme.mjs";
import {
  getSettingsValidationErrors,
  getThemeCssValidationErrors,
} from "../scripts/lib/verify-ultracite-setup.mjs";
import { createFixtureWorkspace, runScript } from "./helpers/run-script.js";

const fixtureRoot = new URL("./fixtures/", import.meta.url);
const cleanups = [];

function useFixture(name) {
  const fixture = createFixtureWorkspace(new URL(name, fixtureRoot));
  cleanups.push(fixture.cleanup);
  return fixture.workspace;
}

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});

describe("verify scripts", () => {
  it("verify-registry-surface passes for aligned src and registry", () => {
    const workspace = useFixture("verify-registry-surface/pass");
    const result = runScript("scripts/verify-registry-surface.mjs", workspace);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Registry surface matches src/");
  });

  it("verify-registry-surface fails when src has an undeclared runtime file", () => {
    const workspace = useFixture("verify-registry-surface/pass");
    writeFileSync(
      join(workspace, "src/lib/card.ts"),
      "export const Card = null;\n"
    );

    const result = runScript("scripts/verify-registry-surface.mjs", workspace);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("missing from registry.json");
    expect(result.stderr).toContain("src/lib/card.ts");
  });

  it("verify-ds-kit-install passes for a valid root-style install", () => {
    const workspace = useFixture("verify-ds-kit-install/pass");
    const result = runScript("scripts/verify-ds-kit-install.mjs", workspace);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("DS Kit install verified in styles");
  });

  it("verify-ds-kit-install fails when globals.css does not import styles/index.css", () => {
    const workspace = useFixture("verify-ds-kit-install/pass");
    writeFileSync(
      join(workspace, "app/globals.css"),
      '@import "../styles/vars.css";\n'
    );

    const result = runScript("scripts/verify-ds-kit-install.mjs", workspace);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("none import styles/index.css");
  });

  it("verify-tw-merge-theme token logic passes for aligned tokens", () => {
    const themeTokens = mergeThemeTokens(
      parseThemeTokens(
        "@theme { --text-body: 1rem; --radius-button: 8px; --spacing-panel: 2rem; }",
        "semantic"
      ),
      parseThemeTokens("@theme {}", "aliases")
    );
    const classSource = `extend: { theme: { text: ["body"], radius: ["button"], spacing: ["panel"] } }`;
    const classTokens = {
      text: parseClassTokens(classSource, "text"),
      radius: parseClassTokens(classSource, "radius"),
      spacing: parseClassTokens(classSource, "spacing"),
    };

    expect(compareThemeAndClassTokens(themeTokens, classTokens)).toMatchObject({
      ok: true,
      problems: [],
    });
  });

  it("verify-tw-merge-theme token logic fails on drift", () => {
    const themeTokens = mergeThemeTokens(
      parseThemeTokens(
        "@theme { --text-body: 1rem; --radius-button: 8px; --spacing-panel: 2rem; }",
        "semantic"
      ),
      parseThemeTokens("@theme {}", "aliases")
    );
    const classSource = `extend: { theme: { text: ["body"], radius: ["button"], spacing: [] } }`;
    const classTokens = {
      text: parseClassTokens(classSource, "text"),
      radius: parseClassTokens(classSource, "radius"),
      spacing: parseClassTokens(classSource, "spacing"),
    };

    expect(compareThemeAndClassTokens(themeTokens, classTokens)).toMatchObject({
      ok: false,
      problems: [
        {
          category: "spacing",
          direction: "missing-in-classes",
          tokens: ["panel"],
        },
      ],
    });
  });

  it("verify-ultracite-setup config logic passes for valid settings", () => {
    const settings = {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.formatOnPaste": true,
      "editor.formatOnSave": true,
      "emmet.showExpandedAbbreviation": "never",
      "js/ts.tsdk.path": "node_modules/typescript/lib",
      "js/ts.tsdk.promptToUseWorkspaceVersion": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.biome": "explicit",
        "source.organizeImports.biome": "explicit",
      },
      "tailwindCSS.experimental.configFile": "src/styles/index.css",
      "tailwindCSS.classFunctions": ["cva", "cn"],
      "[typescript]": { "editor.defaultFormatter": "biomejs.biome" },
      "[typescriptreact]": { "editor.defaultFormatter": "biomejs.biome" },
      "[javascript]": { "editor.defaultFormatter": "biomejs.biome" },
      "[javascriptreact]": { "editor.defaultFormatter": "biomejs.biome" },
      "[json]": { "editor.defaultFormatter": "biomejs.biome" },
      "[jsonc]": { "editor.defaultFormatter": "biomejs.biome" },
      "[css]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true,
      },
      "[graphql]": { "editor.defaultFormatter": "biomejs.biome" },
      "[html]": { "editor.defaultFormatter": "biomejs.biome" },
      "[markdown]": { "editor.defaultFormatter": "biomejs.biome" },
      "[mdx]": { "editor.defaultFormatter": "biomejs.biome" },
      "[svelte]": { "editor.defaultFormatter": "biomejs.biome" },
      "[vue]": { "editor.defaultFormatter": "biomejs.biome" },
      "[yaml]": { "editor.defaultFormatter": "biomejs.biome" },
    };
    const extensions = {
      recommendations: ["biomejs.biome", "esbenp.prettier-vscode"],
    };
    expect(getSettingsValidationErrors(settings, extensions)).toEqual([]);
  });

  it("verify-ultracite-setup theme CSS logic passes for valid token files", () => {
    const themeCss = "@theme { --text-*: initial; --text-fine: 0.75rem; }";
    const bridgeCss = "@theme { --text-xs: var(--text-fine); }";

    expect(getThemeCssValidationErrors(themeCss, bridgeCss)).toEqual([]);
  });

  it("verify-ultracite-setup theme CSS logic fails when text reset moves", () => {
    const themeCss = "@theme { --text-fine: 0.75rem; --text-*: initial; }";
    const bridgeCss = "@theme { --text-xs: var(--text-fine); }";

    expect(
      getThemeCssValidationErrors(themeCss, bridgeCss).some((error) =>
        error.includes("moved --text-*: initial; below other --text-*")
      )
    ).toBe(true);
  });

  it("verify-ultracite-setup theme CSS logic fails on alias drift", () => {
    const themeCss = "@theme { --text-*: initial; --text-fine: 0.75rem; }";
    const bridgeCss = "@theme { --text-sm: var(--text-small); }";

    expect(
      getThemeCssValidationErrors(themeCss, bridgeCss).some((error) =>
        error.includes("changed the Tailwind alias layer unexpectedly")
      )
    ).toBe(true);
  });

  it("verify-ultracite-setup config logic fails on bad Tailwind path", () => {
    const settings = {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.formatOnPaste": true,
      "editor.formatOnSave": true,
      "emmet.showExpandedAbbreviation": "never",
      "js/ts.tsdk.path": "node_modules/typescript/lib",
      "js/ts.tsdk.promptToUseWorkspaceVersion": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.biome": "explicit",
        "source.organizeImports.biome": "explicit",
      },
      "tailwindCSS.experimental.configFile": "styles/index.css",
      "tailwindCSS.classFunctions": ["cva", "cn"],
      "[typescript]": { "editor.defaultFormatter": "biomejs.biome" },
      "[typescriptreact]": { "editor.defaultFormatter": "biomejs.biome" },
      "[javascript]": { "editor.defaultFormatter": "biomejs.biome" },
      "[javascriptreact]": { "editor.defaultFormatter": "biomejs.biome" },
      "[json]": { "editor.defaultFormatter": "biomejs.biome" },
      "[jsonc]": { "editor.defaultFormatter": "biomejs.biome" },
      "[css]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true,
      },
      "[graphql]": { "editor.defaultFormatter": "biomejs.biome" },
      "[html]": { "editor.defaultFormatter": "biomejs.biome" },
      "[markdown]": { "editor.defaultFormatter": "biomejs.biome" },
      "[mdx]": { "editor.defaultFormatter": "biomejs.biome" },
      "[svelte]": { "editor.defaultFormatter": "biomejs.biome" },
      "[vue]": { "editor.defaultFormatter": "biomejs.biome" },
      "[yaml]": { "editor.defaultFormatter": "biomejs.biome" },
    };
    settings["tailwindCSS.experimental.configFile"] = "styles/index.css";
    const extensions = {
      recommendations: ["biomejs.biome", "esbenp.prettier-vscode"],
    };

    expect(
      getSettingsValidationErrors(settings, extensions).some((error) =>
        error.includes(
          'should set tailwindCSS.experimental.configFile to "src/styles/index.css"'
        )
      )
    ).toBe(true);
  });
});
