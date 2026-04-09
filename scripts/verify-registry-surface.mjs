#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, "src");
const REGISTRY_PATH = join(ROOT, "registry.json");
const SHIPPABLE_EXTENSIONS = new Set([".css", ".js", ".jsx", ".ts", ".tsx"]);
const IGNORED_BASENAMES = new Set([".DS_Store"]);

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function walk(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED_BASENAMES.has(entry.name)) {
      continue;
    }

    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(absolutePath));
      continue;
    }

    if (!SHIPPABLE_EXTENSIONS.has(extname(entry.name))) {
      continue;
    }

    files.push(relative(ROOT, absolutePath));
  }

  return files;
}

const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
const declaredFiles = new Set(
  registry.items.flatMap((item) => item.files.map((file) => file.path))
);
const srcFiles = walk(SRC_ROOT).sort();

const missingFromRegistry = srcFiles.filter((file) => !declaredFiles.has(file));
const missingFromSrc = Array.from(declaredFiles)
  .filter((file) => file.startsWith("src/"))
  .filter((file) => !srcFiles.includes(file))
  .sort();

if (missingFromRegistry.length > 0) {
  fail(
    [
      "src/ contains shippable runtime files missing from registry.json:",
      ...missingFromRegistry.map((file) => `- ${file}`),
      "",
      "src/ is the canonical shipped surface. Add these paths to registry.json or move them out of src/.",
    ].join("\n")
  );
}

if (missingFromSrc.length > 0) {
  fail(
    [
      "registry.json points at src/ files that do not exist:",
      ...missingFromSrc.map((file) => `- ${file}`),
      "",
      "Update registry.json or restore the missing files.",
    ].join("\n")
  );
}

console.log(`✅ Registry surface matches src/: ${srcFiles.length} files`);
