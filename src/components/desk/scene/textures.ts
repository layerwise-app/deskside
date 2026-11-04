import * as THREE from 'three';

/** Small deterministic PRNG so textures look the same on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(width: number, height: number) {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  const ctx = el.getContext('2d')!;
  return { el, ctx };
}

function texture(el: HTMLCanvasElement, srgb = true) {
  const tex = new THREE.CanvasTexture(el);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Height noise for a faint textured-plastic finish. */
export function bumpTexture(seed: number, size = 256) {
  const { el, ctx } = canvas(size, size);
  const img = ctx.createImageData(size, size);
  const rand = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + rand() * 40;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = texture(el, false);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * The mug: speckled stoneware with a glossy glaze dipped over the top. The
 * texture wraps the lathe profile, so `v` runs from the base, up the outside,
 * over the rim, and down the inside.
 */
export function glazeTextures(glaze: string, glazeLimit: number, rimV = 0.5) {
  const w = 1024;
  const h = 512;
  const color = canvas(w, h);
  const rough = canvas(w, h);
  const rand = rng(42);
  const clay = '#d9c8a8';

  // Where the glaze stops on the outside wall, in texture rows (v from bottom).
  const edge = new Float32Array(w);
  const drips: { x: number; len: number; width: number }[] = [];
  for (let i = 0; i < 9; i++) {
    drips.push({ x: rand() * w, len: 0.03 + rand() * 0.07, width: 14 + rand() * 30 });
  }
  for (let x = 0; x < w; x++) {
    const u = x / w;
    let v =
      glazeLimit +
      Math.sin(u * Math.PI * 2 * 3 + 0.4) * 0.012 +
      Math.sin(u * Math.PI * 2 * 7 + 1.3) * 0.006;
    for (const d of drips) {
      let dx = Math.abs(x - d.x);
      dx = Math.min(dx, w - dx);
      if (dx < d.width) v -= d.len * Math.cos((dx / d.width) * (Math.PI / 2)) ** 2;
    }
    edge[x] = v;
  }

  const base = new THREE.Color(glaze);
  const dark = base.clone().multiplyScalar(0.8);
  const light = base.clone().lerp(new THREE.Color('#d9e2d2'), 0.38);
  const cImg = color.ctx.createImageData(w, h);
  const rImg = rough.ctx.createImageData(w, h);
  const clayColor = new THREE.Color(clay);
  const srgb = new THREE.Color();
  for (let y = 0; y < h; y++) {
    const v = 1 - y / h;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const e = edge[x];
      let r: number, g: number, b: number, ro: number;
      if (v < e) {
        // Bare clay with iron speckle.
        const speck = rand() < 0.012 ? 0.45 : 1;
        const n = 0.94 + rand() * 0.08;
        r = clayColor.r * n * speck;
        g = clayColor.g * n * speck;
        b = clayColor.b * n * speck;
        ro = 0.86;
      } else {
        // Glaze pools darker near its edge and breaks lighter on the rim.
        const fromEdge = Math.min(1, (v - e) / 0.06);
        const rim = Math.max(0, 1 - Math.abs(v - rimV) / 0.03);
        const mix = base.clone().lerp(dark, (1 - fromEdge) * 0.6).lerp(light, rim * 0.65);
        const n = 0.97 + rand() * 0.05;
        r = mix.r * n;
        g = mix.g * n;
        b = mix.b * n;
        ro = 0.14;
      }
      // THREE.Color works in linear light; canvas pixels are sRGB.
      srgb.setRGB(r, g, b).convertLinearToSRGB();
      cImg.data[i] = Math.min(255, srgb.r * 255);
      cImg.data[i + 1] = Math.min(255, srgb.g * 255);
      cImg.data[i + 2] = Math.min(255, srgb.b * 255);
      cImg.data[i + 3] = 255;
      rImg.data[i] = rImg.data[i + 1] = rImg.data[i + 2] = ro * 255;
      rImg.data[i + 3] = 255;
    }
  }
  color.ctx.putImageData(cImg, 0, 0);
  rough.ctx.putImageData(rImg, 0, 0);
  return { map: texture(color.el), roughnessMap: texture(rough.el, false) };
}

/** A small model badge for the computer's chin. */
export function badgeTexture(text: string, font: string) {
  const { el, ctx } = canvas(512, 96);
  ctx.fillStyle = '#7d7462';
  ctx.font = `500 44px ${font}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 18, 50);
  return texture(el);
}
