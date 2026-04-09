#!/usr/bin/env node

/**
 * Capture full-page screenshots of every route at desktop and mobile viewports.
 *
 * Usage:
 *   npx playwright test --config /dev/null scripts/capture-screenshots.mjs
 *
 * Or simply:
 *   node scripts/capture-screenshots.mjs
 *
 * Requires:
 *   - Playwright installed (`npx playwright install chromium` if needed)
 *   - Dev server running at BASE_URL (default http://localhost:3000)
 *
 * Output:  screenshots/<route>-<viewport>.png
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = resolve(import.meta.dirname, "..", "public", "screenshots");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/primary-source-data", name: "primary-source-data" },
  { path: "/case-studies", name: "case-studies" },
  { path: "/case-studies/fortune-500-fashion-brand", name: "cs-fashion" },
  {
    path: "/case-studies/avinasi-labs-longevity-prediction",
    name: "cs-avinasi",
  },
  {
    path: "/case-studies/solo-ai-ground-truth-listening-data",
    name: "cs-solo-ai",
  },
  { path: "/case-studies/thweet-basement-bar-demand", name: "cs-thweet" },
  { path: "/context-gateway", name: "context-gateway" },
  { path: "/research", name: "research" },
  { path: "/blog", name: "blog" },
  {
    path: "/blog/open-problems-in-ai-data-economics",
    name: "blog-open-problems",
  },
  {
    path: "/blog/model-influence-functions-measuring-data-quality",
    name: "blog-model-influence",
  },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  let count = 0;

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route.path}`;
      const filename = `${route.name}-${vp.name}.png`;

      process.stdout.write(`  ${filename} ...`);
      await page.goto(url, { waitUntil: "load", timeout: 15_000 });
      // Brief pause for fonts / images to settle
      await page.waitForTimeout(600);
      await page.screenshot({
        fullPage: true,
        path: resolve(OUT_DIR, filename),
        type: "png",
      });
      process.stdout.write(" done\n");
      count++;
    }

    await context.close();
  }

  await browser.close();

  // Write manifest for the gallery page
  const manifest = VIEWPORTS.flatMap((vp) =>
    ROUTES.map((route) => ({
      route: route.path,
      name: route.name,
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      file: `${route.name}-${vp.name}.png`,
    }))
  );
  await writeFile(
    resolve(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(
    `\n✓ ${count} screenshots + manifest saved to public/screenshots/`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
