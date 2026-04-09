#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  getSettingsValidationErrors,
  getThemeCssValidationErrors,
} from "./lib/verify-ultracite-setup.mjs";

const settingsPath = ".vscode/settings.json";
const extensionsPath = ".vscode/extensions.json";

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
};

if (!existsSync(settingsPath)) {
  fail(`Missing ${settingsPath}`);
}

if (!existsSync(extensionsPath)) {
  fail(`Missing ${extensionsPath}`);
}

const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
const extensions = JSON.parse(readFileSync(extensionsPath, "utf8"));

for (const error of getSettingsValidationErrors(settings, extensions)) {
  fail(error);
}

const themeCss = readFileSync("src/styles/semantic-tokens.css", "utf8");
const bridgeCss = readFileSync("src/styles/tailwind-aliases.css", "utf8");

for (const error of getThemeCssValidationErrors(themeCss, bridgeCss)) {
  fail(error);
}

try {
  execSync(
    'pnpm exec prettier "src/styles/semantic-tokens.css" "src/styles/tailwind-aliases.css" --write --config .prettierrc.json',
    {
      stdio: "pipe",
    }
  );

  const prettierThemeCss = readFileSync(
    "src/styles/semantic-tokens.css",
    "utf8"
  );
  const prettierBridgeCss = readFileSync(
    "src/styles/tailwind-aliases.css",
    "utf8"
  );

  for (const error of getThemeCssValidationErrors(
    prettierThemeCss,
    prettierBridgeCss,
    "Prettier formatting check"
  )) {
    fail(error);
  }
} catch (error) {
  fail("Prettier formatting check failed for the Tailwind theme files");
}

try {
  execSync(
    "pnpm exec ultracite check .vscode/settings.json .vscode/extensions.json",
    {
      stdio: "inherit",
    }
  );
} catch (error) {
  fail("ultracite check failed for .vscode settings + extensions");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("✅ Ultracite editor setup is aligned.");
