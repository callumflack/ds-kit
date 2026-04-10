#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  getSettingsValidationErrors,
  getThemeCssValidationErrors,
} from "./lib/verify-ultracite.mjs";

const settingsPath = ".vscode/settings.json";
const extensionsPath = ".vscode/extensions.json";

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
};

const parseJsonc = (path) =>
  JSON.parse(readFileSync(path, "utf8").replaceAll(/^\s*\/\/.*$/gm, ""));

if (!existsSync(settingsPath)) {
  fail(`Missing ${settingsPath}`);
}

if (!existsSync(extensionsPath)) {
  fail(`Missing ${extensionsPath}`);
}

const settings = parseJsonc(settingsPath);
const extensions = parseJsonc(extensionsPath);
const themeCss = readFileSync("src/styles/semantic-tokens.css", "utf8");
const bridgeCss = readFileSync("src/styles/tailwind-aliases.css", "utf8");

for (const error of getSettingsValidationErrors(settings, extensions)) {
  fail(error);
}

for (const error of getThemeCssValidationErrors(themeCss, bridgeCss)) {
  fail(error);
}

try {
  execSync(
    'pnpm exec prettier "src/styles/semantic-tokens.css" "src/styles/tailwind-aliases.css" --check --config prettier.config.mjs',
    {
      stdio: "pipe",
    }
  );
} catch (_error) {
  fail("Prettier check failed for the Tailwind theme files");
}

try {
  execSync(
    "pnpm exec ultracite check .vscode/settings.json .vscode/extensions.json",
    {
      stdio: "inherit",
    }
  );
} catch (_error) {
  fail("ultracite check failed for .vscode settings + extensions");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("✅ Ultracite editor setup is aligned.");
