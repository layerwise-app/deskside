#!/usr/bin/env node
/**
 * Render a project's stills from its React screens.
 *
 *   pnpm render-plates <slug> [plate...] --url http://127.0.0.1:5173 [--add] [--out dir]
 *
 * Opens `/dev/plates/<slug>/<plate>` on the running dev server for every plate
 * in `src/content/work/<slug>/plates.tsx`, screenshots it at 2×, and writes
 * PNGs to `--out` (default: a temporary folder). With `--add`, the PNGs go
 * straight through `scripts/add-images.mjs` into the project's folder.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const add = args.includes('--add');
if (add) args.splice(args.indexOf('--add'), 1);
const url = (flag('--url') ?? process.env.DEV_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '');
const out = flag('--out') ?? mkdtempSync(path.join(os.tmpdir(), 'plates-'));
const [slug, ...only] = args;
if (!slug) {
  console.error('Usage: pnpm render-plates <slug> [plate...] --url <dev server> [--add] [--out dir]');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const browser = await chromium
  .launch({ channel: 'chrome' })
  .catch(() => chromium.launch());
try {
  const page = await browser.newPage();
  await page.goto(`${url}/dev/plates/${slug}/_list`, { waitUntil: 'load', timeout: 120_000 });
  const list = JSON.parse(await page.locator('#plates').innerText());
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  for (const plate of list) {
    if (only.length && !only.includes(plate.name)) continue;
    const p = await ctx.newPage();
    await p.setViewportSize({ width: plate.width, height: plate.height });
    await p.goto(`${url}/dev/plates/${slug}/${plate.name}`, { waitUntil: 'load', timeout: 120_000 });
    await p.waitForSelector('[data-plate-ready]', { state: 'attached', timeout: 120_000 });
    await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null)))
      );
    });
    await p.waitForTimeout(250);
    const file = path.join(out, `${plate.name}.png`);
    await p.screenshot({ path: file });
    await p.close();
    console.log(`✓ ${file}`);
  }
} finally {
  await browser.close();
}

if (add) {
  execFileSync(process.execPath, [path.join(import.meta.dirname, 'add-images.mjs'), slug, out], {
    stdio: 'inherit'
  });
}
