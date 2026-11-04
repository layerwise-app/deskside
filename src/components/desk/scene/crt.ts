import * as THREE from 'three';
import { rng } from './textures';

export type Channel = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  bg: string;
  fg: string;
  cover: string;
};

const W = 1024;
const H = 768;
const FLICKER_MS = 380;
const OSD_MS = 1800;
const OSD_FADE_MS = 320;

/**
 * The computer's screen. A 2D canvas draws the selected project's cover with
 * scanlines and a vignette, and plays a short channel-change flicker. Three
 * reads it as the glass's emissive texture.
 */
export class CrtScreen {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private images = new Map<string, HTMLImageElement>();
  private noise: HTMLCanvasElement[] = [];
  private overlay: HTMLCanvasElement;
  private channels: Channel[];
  private index: number;
  private previous = -1;
  private switchedAt = -Infinity;
  private animate = true;
  private dirty = true;
  private lastSince = Infinity;
  private rand = rng(3);
  onImageLoad: () => void = () => {};

  constructor(channels: Channel[], index: number, private font: string) {
    this.channels = channels;
    this.index = index;
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    // Mipmaps keep the scanlines from shimmering at small sizes.
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.anisotropy = 8;
    this.overlay = this.buildOverlay();
    for (let i = 0; i < 4; i++) this.noise.push(this.buildNoise());
    this.load(channels[index]);
    this.draw(performance.now());
  }

  get current() {
    return this.index;
  }

  /** Start loading every cover in the background, current one first. */
  preloadAll() {
    for (const channel of this.channels) this.load(channel);
  }

  private load(channel: Channel) {
    if (this.images.has(channel.slug)) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = channel.cover;
    img.addEventListener(
      'load',
      () => {
        this.dirty = true;
        this.onImageLoad();
      },
      { once: true }
    );
    this.images.set(channel.slug, img);
  }

  set(index: number, animate: boolean) {
    if (index === this.index) return;
    this.previous = this.index;
    this.index = index;
    this.animate = animate;
    this.switchedAt = animate ? performance.now() : -Infinity;
    this.lastSince = 0;
    this.dirty = true;
    this.load(this.channels[index]);
  }

  /** Draw if anything changed. Returns true while it needs more frames. */
  update(now: number) {
    const since = now - this.switchedAt;
    const end = OSD_MS + OSD_FADE_MS;
    const flicker = this.animate && since < FLICKER_MS;
    const fading = since >= OSD_MS && since < end;
    const final = this.lastSince < end && since >= end;
    if (!this.dirty && !flicker && !fading && !final) return false;
    this.draw(now);
    this.texture.needsUpdate = true;
    this.dirty = false;
    this.lastSince = since;
    return flicker || fading;
  }

  /** Milliseconds until the on-screen channel number starts to fade. */
  nextWake(now: number) {
    const since = now - this.switchedAt;
    return since < OSD_MS ? OSD_MS - since : -1;
  }

  private drawChannel(index: number, offsetY = 0) {
    const { ctx } = this;
    const channel = this.channels[index];
    ctx.fillStyle = channel.bg;
    ctx.fillRect(0, 0, W, H);
    const img = this.images.get(channel.slug);
    const drawAt = (y: number) => {
      if (img && img.complete && img.naturalWidth > 0) {
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2 + y, dw, dh);
      } else {
        // Until the cover arrives, show the title on the project's color.
        ctx.fillStyle = channel.fg;
        ctx.font = `500 64px ${this.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(channel.title.toUpperCase(), W / 2, H / 2 + y);
        ctx.textAlign = 'left';
      }
    };
    if (offsetY === 0) {
      drawAt(0);
    } else {
      const y = ((offsetY % H) + H) % H;
      drawAt(y);
      drawAt(y - H);
      // The blanking bar between two frames as the picture rolls.
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, y - 14, W, 22);
    }
  }

  private draw(now: number) {
    const { ctx } = this;
    const since = now - this.switchedAt;
    const p = this.animate ? Math.min(1, since / FLICKER_MS) : 1;

    if (p < 0.14 && this.previous >= 0) {
      // Old picture blooms and tears as the tuner lets go.
      this.drawChannel(this.previous);
      ctx.fillStyle = `rgba(255,255,255,${0.35 + p * 2.5})`;
      ctx.fillRect(0, 0, W, H);
      this.drawNoise(0.7);
    } else if (p < 0.62) {
      const q = (p - 0.14) / 0.48;
      const ease = 1 - (1 - q) ** 3;
      this.drawChannel(this.index, (1 - ease) * H * 0.42);
      this.tear(1 - ease);
      this.drawNoise(0.38 * (1 - ease) + 0.06);
      const flash = Math.floor(now / 33) % 2 === 0 ? 0.14 : 0;
      if (flash) {
        ctx.fillStyle = `rgba(255,255,255,${flash * (1 - q)})`;
        ctx.fillRect(0, 0, W, H);
      }
    } else {
      this.drawChannel(this.index);
      if (p < 1) this.drawNoise(0.06 * (1 - (p - 0.62) / 0.38));
    }

    this.drawOsd(since);
    ctx.drawImage(this.overlay, 0, 0);
  }

  private tear(amount: number) {
    if (amount < 0.05) return;
    const { ctx } = this;
    const bands = 3;
    for (let i = 0; i < bands; i++) {
      const y = Math.floor(this.rand() * H);
      const h = 6 + Math.floor(this.rand() * 26);
      const shift = (this.rand() - 0.5) * 70 * amount;
      ctx.drawImage(this.canvas, 0, y, W, h, shift, y, W, h);
    }
  }

  private drawNoise(alpha: number) {
    const { ctx } = this;
    ctx.globalAlpha = alpha;
    const n = this.noise[Math.floor(this.rand() * this.noise.length)];
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(n, 0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 1;
  }

  private drawOsd(since: number) {
    if (since >= OSD_MS + OSD_FADE_MS || !Number.isFinite(since)) return;
    const { ctx } = this;
    const fade = since > OSD_MS ? 1 - (since - OSD_MS) / OSD_FADE_MS : 1;
    const label = `CH ${String(this.index + 1).padStart(2, '0')}`;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.font = `500 46px ${this.font}`;
    ctx.textBaseline = 'top';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(label, 64, 52);
    ctx.fillStyle = '#9dff9a';
    ctx.fillText(label, 64, 52);
    ctx.restore();
  }

  private buildNoise() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 192;
    const x = c.getContext('2d')!;
    const img = x.createImageData(256, 192);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = this.rand() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  /** Scanlines and a vignette, drawn over every frame. */
  private buildOverlay() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const x = c.getContext('2d')!;
    x.fillStyle = 'rgba(0,0,0,0.05)';
    for (let y = 0; y < H; y += 3) x.fillRect(0, y, W, 1);
    const g = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.26)');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    return c;
  }

  dispose() {
    this.texture.dispose();
  }
}
