#!/usr/bin/env node
/**
 * Make every icon from the logo.
 *
 *   pnpm favicons
 *
 * Reads `public/logo.svg` (square) and writes `public/logo.png` at
 * 1024×1024, the favicons (`favicon.ico` with 16, 32, and 48 px images,
 * `favicon-16x16.png`, `favicon-32x32.png`, `favicon.png`, `favicon.svg`),
 * `apple-touch-icon.png`, and the Android icons, including
 * `android-chrome-512x512.png`, which Layerwise uses as the project's avatar.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const pub = path.resolve(process.cwd(), 'public');
const source = path.join(pub, 'logo.svg');

/** Render the SVG at `size` px, sharp at every size. */
function render(svg, size) {
  // Rasterize at the target size so small icons are hinted, not downscaled.
  return sharp(svg, { density: Math.max(1, (72 * size) / 1024) * 4 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 });
}

/** An .ico file holding PNG images. */
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, at);
    header.writeUInt8(size >= 256 ? 0 : size, at + 1);
    header.writeUInt8(0, at + 2);
    header.writeUInt8(0, at + 3);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

const svg = await readFile(source).catch(() => {
  console.error('public/logo.svg not found. Add a square SVG logo there first.');
  process.exit(1);
});
const meta = await sharp(svg).metadata();
if (meta.width !== meta.height) console.warn(`Warning: logo.svg is ${meta.width}×${meta.height}; icons are square.`);

const outputs = {
  'logo.png': 1024,
  'android-chrome-512x512.png': 512,
  'android-chrome-192x192.png': 192,
  'apple-touch-icon.png': 180,
  'favicon-32x32.png': 32,
  'favicon.png': 32,
  'favicon-16x16.png': 16
};
for (const [file, size] of Object.entries(outputs)) {
  await render(svg, size).toFile(path.join(pub, file));
  console.log(`✓ ${file} (${size}×${size})`);
}

const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(async (size) => ({ size, data: await render(svg, size).toBuffer() })));
await writeFile(path.join(pub, 'favicon.ico'), ico(pngs));
console.log(`✓ favicon.ico (${sizes.join(', ')} px)`);

await copyFile(source, path.join(pub, 'favicon.svg'));
console.log('✓ favicon.svg');
