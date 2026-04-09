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

const projectRoot = process.cwd();

function projectPath(...segments) {
  return path.join(projectRoot, ...segments);
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
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

async function detectSourceMode() {
  const componentsConfig = await readJsonIfExists(
    projectPath("components.json")
  );
  const alias = componentsConfig?.aliases?.components;

  if (typeof alias === "string") {
    return alias.startsWith("src/");
  }

  return (
    existsSync(projectPath("src", "components")) &&
    !existsSync(projectPath("components"))
  );
}

function normalizeImportPath(filePath) {
  const normalized = filePath.split(path.sep).join("/");
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
}

async function getInstallContext() {
  const sourceMode = await detectSourceMode();
  const stylesDir = sourceMode
    ? projectPath("src", "styles")
    : projectPath("styles");
  const styleIndexPath = path.join(stylesDir, "index.css");

  return { sourceMode, stylesDir, styleIndexPath };
}

async function assertInstalledStyles(stylesDir) {
  for (const fileName of STYLE_FILES) {
    const filePath = path.join(stylesDir, fileName);
    if (!(await fileExists(filePath))) {
      throw new Error(`Missing ${path.relative(projectRoot, filePath)}`);
    }
  }
}

async function findEntrypoint() {
  for (const entrypoint of KNOWN_ENTRYPOINTS) {
    const absolutePath = projectPath(entrypoint);
    if (await fileExists(absolutePath)) {
      return absolutePath;
    }
  }

  return null;
}

async function ensureStylesImport(styleIndexPath) {
  const entrypoint = await findEntrypoint();

  if (!entrypoint) {
    throw new Error(
      `Could not find a global stylesheet entrypoint. Expected one of: ${KNOWN_ENTRYPOINTS.join(", ")}`
    );
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
    return {
      entrypoint,
      importPath,
      status: "already-present",
    };
  }

  await fs.writeFile(
    entrypoint,
    `@import "${importPath}";\n${content}`,
    "utf8"
  );

  return {
    entrypoint,
    importPath,
    status: "inserted",
  };
}

async function main() {
  const { sourceMode, stylesDir, styleIndexPath } = await getInstallContext();

  await assertInstalledStyles(stylesDir);
  const importResult = await ensureStylesImport(styleIndexPath);

  console.log("post-add-ds-kit");
  console.log(`- source mode: ${sourceMode ? "yes" : "no"}`);
  console.log(`- styles dir: ${path.relative(projectRoot, stylesDir)}`);
  console.log(
    `- globals import: ${importResult.status} (${path.relative(projectRoot, importResult.entrypoint)} -> ${importResult.importPath})`
  );
}

main().catch((error) => {
  console.error(`post-add-ds-kit failed: ${error.message}`);
  process.exit(1);
});
