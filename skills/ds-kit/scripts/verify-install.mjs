#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.cwd();
const styleFiles = [
  "tokens-primitive.css",
  "utils.css",
  "index.css",
  "tokens-semantic.css",
  "tailwind-aliases.css",
  "animations.css",
  "icons.css",
];
const knownEntrypoints = [
  "app/globals.css",
  "src/app/globals.css",
  "src/styles.css",
  "styles.css",
];
const searchRoots = ["app", "src", "components", "styles"];
const importableExts = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mdx"]);
const skipDirs = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
  ".vercel",
]);

const styleAlias = (() => {
  try {
    const config = JSON.parse(
      readFileSync(join(root, "components.json"), "utf8")
    );
    return config?.aliases?.components ?? null;
  } catch {
    return null;
  }
})();

const useSrcMode =
  typeof styleAlias === "string" && styleAlias.startsWith("src/");
const expectedStylesDir = useSrcMode ? "src/styles" : "styles";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

for (const file of styleFiles) {
  if (!existsSync(join(root, expectedStylesDir, file))) {
    fail(`Missing ${join(expectedStylesDir, file)}`);
  }
}

let sawStylesReference = false;
const needed = new Set(styleFiles.map((file) => `styles/${file}`));

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) {
        continue;
      }
      walk(full);
      continue;
    }

    if (!importableExts.has(extname(entry.name))) {
      continue;
    }

    const contents = readFileSync(full, "utf8");
    for (const needle of needed) {
      if (contents.includes(needle)) {
        sawStylesReference = true;
        break;
      }
    }
  }
}

for (const searchRoot of searchRoots) {
  const start = join(root, searchRoot);
  if (existsSync(start)) {
    walk(start);
  }
}

if (!sawStylesReference) {
  fail("No reference to styles/*.css found in app source");
}

const entrypoints = knownEntrypoints.filter((entry) =>
  existsSync(join(root, entry))
);
if (entrypoints.length > 0) {
  const importedInEntrypoint = entrypoints.some((entrypoint) =>
    readFileSync(join(root, entrypoint), "utf8").includes("styles/index.css")
  );
  if (!importedInEntrypoint) {
    fail(
      `Global entrypoint exists (${entrypoints.join(", ")}), but none import styles/index.css`
    );
  }
}

console.log(`✅ DS Kit install verified in ${expectedStylesDir}`);
