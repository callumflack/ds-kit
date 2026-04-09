#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CATEGORIES,
  compareThemeAndClassTokens,
  formatThemeAndClassComparison,
  getAlignedCounts,
  mergeThemeTokens,
  parseClassTokens,
  parseThemeTokens,
} from "./lib/verify-tw-merge-theme.mjs";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}
const ROOT = process.cwd();
const THEME_SOURCE_PATHS = [
  join(ROOT, "src/styles/semantic-tokens.css"),
  join(ROOT, "src/styles/tailwind-aliases.css"),
];
const CLASSES_PATH = join(ROOT, "src/lib/classes.ts");

for (const themePath of THEME_SOURCE_PATHS) {
  if (!existsSync(themePath)) {
    fail(
      `${themePath.replace(`${ROOT}/`, "")} missing. Run from the ds-kit repo root.`
    );
  }
}

if (!existsSync(CLASSES_PATH)) {
  fail("src/lib/classes.ts missing. Run from the ds-kit repo root.");
}

try {
  const themeTokenParts = THEME_SOURCE_PATHS.map((themePath) =>
    parseThemeTokens(
      readFileSync(themePath, "utf8"),
      themePath.replace(`${ROOT}/`, "")
    )
  );
  const themeTokens = mergeThemeTokens(...themeTokenParts);
  const classesContents = readFileSync(CLASSES_PATH, "utf8");
  const classTokens = Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      parseClassTokens(classesContents, category),
    ])
  );
  const comparison = compareThemeAndClassTokens(themeTokens, classTokens);

  if (comparison.ok) {
    const counts = getAlignedCounts(themeTokens);
    console.log(
      `✅ Theme/class merge map is aligned: text=${counts[0]}, radius=${counts[1]}, spacing=${counts[2]}`
    );
    process.exit(0);
  }

  for (const line of formatThemeAndClassComparison(comparison)) {
    console.log(line);
  }
  fail(
    "Tailwind merge tokens are out of sync with theme variables. Update src/styles/semantic-tokens.css, src/styles/tailwind-aliases.css, and src/lib/classes.ts together."
  );
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
