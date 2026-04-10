#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const ROOT = process.cwd();
const STYLE_FILES = [
  "vars.css",
  "utils.css",
  "index.css",
  "semantic-tokens.css",
  "tailwind-aliases.css",
  "animations.css",
  "icons.css",
];
const KNOWN_ENTRYPOINTS = [
  "app/globals.css",
  "src/app/globals.css",
  "src/styles.css",
  "styles.css",
];
const SEARCH_ROOTS = ["app", "src", "components", "styles"];
const IMPORTABLE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mdx"]);
const SKIP_DIRS = new Set([
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
      readFileSync(join(ROOT, "components.json"), "utf8")
    );
    return config?.aliases?.components ?? null;
  } catch {
    return null;
  }
})();

const useSrcMode =
  (typeof styleAlias === "string" && styleAlias.startsWith("src/")) ||
  (existsSync(join(ROOT, "src", "styles")) &&
    !existsSync(join(ROOT, "styles")));
const expectedStylesDir = useSrcMode ? "src/styles" : "styles";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

for (const file of STYLE_FILES) {
  if (!existsSync(join(ROOT, expectedStylesDir, file))) {
    fail(`Missing ${join(expectedStylesDir, file)}`);
  }
}

const legacyRoots = useSrcMode
  ? [join(ROOT, "src", "components"), join(ROOT, "components")]
  : [join(ROOT, "components")];

const legacyFound = [];
for (const root of legacyRoots) {
  for (const file of STYLE_FILES) {
    const candidate = join(root, file);
    if (existsSync(candidate)) {
      legacyFound.push(candidate.replace(`${ROOT}/`, ""));
    }
  }
}
if (legacyFound.length > 0) {
  fail(`Legacy style files still present: ${legacyFound.join(", ")}`);
}

let sawStylesReference = false;
const needed = new Set(STYLE_FILES.map((file) => `styles/${file}`));

const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      walk(full);
      continue;
    }

    const ext = extname(entry.name);
    if (!IMPORTABLE_EXTS.has(ext)) {
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
};

for (const root of SEARCH_ROOTS) {
  const start = join(ROOT, root);
  if (!existsSync(start)) {
    continue;
  }
  walk(start);
}

if (!sawStylesReference) {
  fail("No reference to styles/*.css found in app source");
}

const entrypoints = KNOWN_ENTRYPOINTS.filter((entry) =>
  existsSync(join(ROOT, entry))
);
if (entrypoints.length > 0) {
  const importedInEntrypoint = entrypoints.some((entrypoint) => {
    const text = readFileSync(join(ROOT, entrypoint), "utf8");
    return text.includes("styles/index.css");
  });
  if (!importedInEntrypoint) {
    fail(
      `Global entrypoint exists (${entrypoints.join(", ")}), but none import styles/index.css`
    );
  }
}

console.log(`✅ DS Kit install verified in ${expectedStylesDir}`);
