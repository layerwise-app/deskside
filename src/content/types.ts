import type { ComponentType } from 'react';

/**
 * An image prepared by `pnpm add-images`. Each one has WebP files at up to
 * three widths, its size, and a tiny blurred placeholder. GIFs are kept as
 * they are and have a single source.
 */
export type ImageAsset = {
  width: number;
  height: number;
  /** A ~16px wide blurred preview as a data URL, shown while loading. */
  blur: string;
  /** Smallest first. */
  sources: { src: string; width: number }[];
  /** A 1200×630 JPG made from covers, used for link previews. */
  og?: string;
};

export type Figure = {
  image: ImageAsset;
  /** Describe what the image shows for people who cannot see it. */
  alt: string;
};

export type Block =
  /** Paragraphs, with an optional small heading. */
  | { type: 'text'; heading?: string; body: string[] }
  /** One image across the content column, or the full page when `bleed`. */
  | ({ type: 'image'; caption?: string; bleed?: boolean } & Figure)
  /** Two images side by side (stacked on phones). */
  | { type: 'pair'; images: [Figure, Figure]; caption?: string }
  /** A muted, looping video. `src` is an imported `.mp4` or `.webm`. */
  | {
      type: 'video';
      src: string;
      poster: ImageAsset;
      /** What happens in the video, for people who cannot watch it. */
      alt: string;
      caption?: string;
    }
  /**
   * A working piece of the product, mounted from React components in the
   * project's folder. `height` reserves space so the page never jumps.
   */
  | {
      type: 'demo';
      component: ComponentType;
      title: string;
      /** One line telling visitors what to try. */
      hint: string;
      height: { mobile: number; desktop: number };
      caption?: string;
    }
  | { type: 'quote'; quote: string; name: string; title: string }
  /** A draggable comparison. Both images must be the same size. */
  | {
      type: 'beforeAfter';
      before: Figure;
      after: Figure;
      caption?: string;
      labels?: [string, string];
    }
  | {
      type: 'metrics';
      items: { value: string; label: string; detail?: string }[];
    };

export type CaseStudy = {
  /** The address: `/work/<slug>`. Lowercase letters, numbers, and dashes. */
  slug: string;
  title: string;
  /** Printed on the key that selects this project. Up to 12 characters; 10 or fewer fit at every screen size. */
  key: string;
  /** What it is, in two or three words: "Podcast app". */
  kind: string;
  /** One sentence for the index, search results, and link previews. */
  summary: string;
  client: string;
  year: string;
  role: string;
  team: string[];
  /** Colors for the computer screen and the case study page. */
  color: { bg: string; fg: string; accent: string };
  /** Shown on the computer screen and used as the share image. */
  cover: Figure;
  problem: string;
  decisions: { title: string; body: string }[];
  outcome: string;
  blocks: Block[];
};
