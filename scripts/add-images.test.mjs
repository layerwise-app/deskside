import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { processImage, resolveFolder, slugifyName, writeManifest } from './add-images.mjs';

let dir;
let out;

async function png(name, width, height) {
  const file = path.join(dir, name);
  await sharp({ create: { width, height, channels: 3, background: '#0E4D57' } }).png().toFile(file);
  return file;
}

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'add-images-src-'));
  out = await mkdtemp(path.join(tmpdir(), 'add-images-out-'));
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
  await rm(out, { recursive: true, force: true });
});

describe('add-images', () => {
  it('names files after the source', () => {
    expect(slugifyName('/x/Checkout Flow (final).PNG')).toBe('checkout-flow-final');
    expect(resolveFolder('stoop', '/repo')).toBe(path.join('/repo', 'src/content/work/stoop'));
  });

  it('writes 800, 1600 and 2880 px WebP files for a large image', async () => {
    const { written } = await processImage(await png('Big Screen.png', 3200, 2000), out);
    expect(written).toEqual(['big-screen-800.webp', 'big-screen-1600.webp', 'big-screen-2880.webp']);
    const meta = await sharp(path.join(out, 'big-screen-1600.webp')).metadata();
    expect([meta.width, meta.height]).toEqual([1600, 1000]);
  });

  it('never enlarges a small image', async () => {
    const { written } = await processImage(await png('small.png', 1200, 900), out);
    expect(written).toEqual(['small-800.webp', 'small-1200.webp']);
  });

  it('makes a 1200×630 share image from a cover', async () => {
    const { written } = await processImage(await png('cover.png', 2000, 1400), out);
    expect(written).toContain('cover-og.jpg');
    const meta = await sharp(path.join(out, 'cover-og.jpg')).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });

  it('copies GIFs untouched', async () => {
    const gif = path.join(dir, 'loop.gif');
    await sharp({ create: { width: 40, height: 30, channels: 3, background: '#E0482B' } }).gif().toFile(gif);
    await processImage(gif, out);
    expect(await readFile(path.join(out, 'loop.gif'))).toEqual(await readFile(gif));
  });

  it('rejects SVG', async () => {
    const svg = path.join(dir, 'logo.svg');
    await writeFile(svg, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
    await expect(processImage(svg, out)).rejects.toThrow(/SVG is not supported/);
  });

  it('lists every image with its size and a blurred placeholder', async () => {
    const names = await writeManifest(out);
    expect(names.sort()).toEqual(['big-screen', 'cover', 'loop', 'small']);
    const manifest = await readFile(path.join(out, 'images.ts'), 'utf8');
    expect(manifest).toContain('"big-screen": {\n    width: 2880,\n    height: 1800,');
    expect(manifest).toContain("blur: 'data:image/webp;base64,");
    expect(manifest).toContain("import coverOg from './cover-og.jpg';");
    expect(manifest).toContain("import loopGif from './loop.gif';");
    expect((await readdir(out)).filter((f) => f.endsWith('.svg'))).toEqual([]);
  });
});
