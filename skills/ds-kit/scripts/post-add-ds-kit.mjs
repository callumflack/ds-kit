#!/usr/bin/env node

import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

const STYLE_FILES = [
  "vars.css",
  "utils.css",
  "index.css",
  "fluid-tokens.css",
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

const root = process.cwd();

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectStylesDir() {
  const componentsConfig = await readJsonIfExists(path.join(root, "components.json"));
  const alias = componentsConfig?.aliases?.components;
  const sourceMode =
    typeof alias === "string"
      ? alias.startsWith("src/")
      : existsSync(path.join(root, "src", "components")) &&
        !existsSync(path.join(root, "components"));

  return sourceMode ? path.join(root, "src", "styles") : path.join(root, "styles");
}

function normalizeImportPath(filePath) {
  const normalized = filePath.split(path.sep).join("/");
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
}

async function ensureStyles() {
  const stylesDir = await detectStylesDir();

  for (const fileName of STYLE_FILES) {
    const filePath = path.join(stylesDir, fileName);
    if (!(await fileExists(filePath))) {
      throw new Error(`Missing ${path.relative(root, filePath)}`);
    }
  }

  return stylesDir;
}

async function ensureImport(stylesDir) {
  const styleIndexPath = path.join(stylesDir, "index.css");

  for (const relativeEntrypoint of KNOWN_ENTRYPOINTS) {
    const entrypoint = path.join(root, relativeEntrypoint);
    if (!(await fileExists(entrypoint))) {
      continue;
    }

    const importPath = normalizeImportPath(
      path.relative(path.dirname(entrypoint), styleIndexPath)
    );
    const content = await fs.readFile(entrypoint, "utf8");

    if (
      content.includes(importPath) ||
      content.includes("./styles/index.css") ||
      content.includes("../styles/index.css") ||
      content.includes("@/styles/index.css") ||
      content.includes("styles/index.css")
    ) {
      return { entrypoint, importPath, status: "already-present" };
    }

    await fs.writeFile(entrypoint, `@import "${importPath}";\n${content}`, "utf8");
    return { entrypoint, importPath, status: "inserted" };
  }

  throw new Error(
    `Could not find a global stylesheet entrypoint. Expected one of: ${KNOWN_ENTRYPOINTS.join(", ")}`
  );
}

async function main() {
  const stylesDir = await ensureStyles();
  const importResult = await ensureImport(stylesDir);

  console.log("post-add-ds-kit");
  console.log(`- styles dir: ${path.relative(root, stylesDir)}`);
  console.log(
    `- globals import: ${importResult.status} (${path.relative(root, importResult.entrypoint)} -> ${importResult.importPath})`
  );
}

main().catch((error) => {
  console.error(`post-add-ds-kit failed: ${error.message}`);
  process.exit(1);
});
