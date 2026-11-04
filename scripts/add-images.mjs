#!/usr/bin/env node
/**
 * Prepare images for a case study.
 *
 *   pnpm add-images <slug-or-folder> <image...>
 *
 *   pnpm add-images stoop ~/Desktop/checkout.png ~/Desktop/cover.jpg
 *   pnpm add-images src/content/work/stoop renders/
 *
 * A slug means `src/content/work/<slug>/`. Each image becomes WebP files at
 * 800, 1600, and 2880 px wide (never wider than the original), named after
 * the source file: `checkout.png` → `checkout-800.webp`, …. An image named
 * `cover` also gets `cover-og.jpg` (1200×630) for link previews. GIFs are
 * copied untouched. SVGs are rejected: export them as PNG first.
 *
 * Afterwards the folder's `images.ts` is rewritten to list every image with
 * its size and a tiny blurred placeholder. Import it from the case study:
 *
 *   import { images } from './stoop/images';
 */
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const WIDTHS = [800, 1600, 2880];
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.tif', '.tiff']);
const OUTPUT = /^(.+)-(\d+)\.webp$/;

export function slugifyName(file) {
  return path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveFolder(target, cwd = process.cwd()) {
  const isSlug = /^[a-z0-9-]+$/.test(target);
  return path.resolve(cwd, isSlug ? path.join('src/content/work', target) : target);
}

async function expandInputs(inputs) {
  const files = [];
  for (const input of inputs) {
    const info = await stat(input).catch(() => null);
    if (!info) throw new Error(`Not found: ${input}`);
    if (info.isDirectory()) {
      for (const entry of (await readdir(input)).sort()) {
        if (!entry.startsWith('.')) files.push(path.join(input, entry));
      }
    } else {
      files.push(input);
    }
  }
  return files;
}

async function blurOf(input) {
  const buffer = await sharp(input, { animated: false })
    .resize({ width: 16 })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

/** Convert one source image into the folder. Returns what was written. */
export async function processImage(file, folder) {
  const ext = path.extname(file).toLowerCase();
  const name = slugifyName(file);
  if (!name) throw new Error(`Cannot name an image after "${file}"`);

  if (ext === '.svg') {
    throw new Error(
      `${path.basename(file)}: SVG is not supported. Export it as a PNG at 2× and add that instead.`
    );
  }

  if (ext === '.gif') {
    const target = path.join(folder, `${name}.gif`);
    if (path.resolve(file) !== path.resolve(target)) await copyFile(file, target);
    return { name, written: [path.basename(target)] };
  }

  if (!RASTER.has(ext)) {
    throw new Error(`${path.basename(file)}: unsupported type "${ext}".`);
  }

  const meta = await sharp(file).metadata();
  if (!meta.width || !meta.height) throw new Error(`${file}: unreadable image`);
  const widths = WIDTHS.filter((width) => width < meta.width);
  if (widths.length < WIDTHS.length) widths.push(Math.min(meta.width, WIDTHS.at(-1)));

  const written = [];
  for (const width of new Set(widths)) {
    const out = path.join(folder, `${name}-${width}.webp`);
    await sharp(file)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(out);
    written.push(path.basename(out));
  }

  if (name === 'cover') {
    const out = path.join(folder, 'cover-og.jpg');
    await sharp(file)
      .rotate()
      .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(out);
    written.push(path.basename(out));
  }

  return { name, written };
}

function identifier(name, suffix) {
  const camel = name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return `${/^[0-9]/.test(camel) ? `img${camel}` : camel}${suffix}`;
}

/** Rewrite `images.ts` from every prepared image in the folder. */
export async function writeManifest(folder) {
  const entries = (await readdir(folder)).sort();
  const groups = new Map();
  for (const entry of entries) {
    const match = OUTPUT.exec(entry);
    if (match) {
      const [, name, width] = match;
      if (!groups.has(name)) groups.set(name, { kind: 'webp', files: [] });
      groups.get(name).files.push({ file: entry, width: Number(width) });
    } else if (entry.endsWith('.gif')) {
      groups.set(entry.slice(0, -4), { kind: 'gif', files: [{ file: entry }] });
    }
  }

  const imports = [];
  const items = [];
  for (const [name, group] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const files = group.files.sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
    const largest = path.join(folder, files.at(-1).file);
    const meta = await sharp(largest, { animated: false }).metadata();
    const blur = await blurOf(path.join(folder, files[0].file));
    const sources = files.map((f) => {
      const id = identifier(name, f.width ? String(f.width) : 'Gif');
      imports.push(`import ${id} from './${f.file}';`);
      return `{ src: ${id}, width: ${f.width ?? meta.width} }`;
    });
    let og = '';
    if (name === 'cover' && existsSync(path.join(folder, 'cover-og.jpg'))) {
      imports.push(`import coverOg from './cover-og.jpg';`);
      og = `,\n    og: coverOg`;
    }
    items.push(
      `  ${JSON.stringify(name)}: {\n    width: ${meta.width},\n    height: ${meta.pageHeight ?? meta.height},\n    blur: '${blur}',\n    sources: [${sources.join(', ')}]${og}\n  }`
    );
  }

  const source = `// Generated by \`pnpm add-images\`. Run it again instead of editing this file.
import type { ImageAsset } from '~/content/types';
${imports.join('\n')}

export const images = {
${items.join(',\n')}
} satisfies Record<string, ImageAsset>;
`;
  await writeFile(path.join(folder, 'images.ts'), source);
  return [...groups.keys()];
}

async function main() {
  const [target, ...inputs] = process.argv.slice(2);
  if (!target || inputs.length === 0) {
    console.error('Usage: pnpm add-images <slug-or-folder> <image-or-folder...>');
    process.exit(1);
  }
  const folder = resolveFolder(target);
  await mkdir(folder, { recursive: true });

  const files = await expandInputs(inputs);
  let failed = false;
  for (const file of files) {
    try {
      const { written } = await processImage(file, folder);
      console.log(`✓ ${path.basename(file)} → ${written.join(', ')}`);
    } catch (error) {
      failed = true;
      console.error(`✗ ${error.message}`);
    }
  }
  const names = await writeManifest(folder);
  console.log(`\n${path.relative(process.cwd(), path.join(folder, 'images.ts'))}: ${names.join(', ')}`);
  if (failed) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('add-images.mjs')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
