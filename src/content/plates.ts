import type { ReactNode } from 'react';

/**
 * A still to render from a project's React screens. `pnpm render-plates`
 * screenshots each one at 2× and hands the PNGs to `pnpm add-images`.
 */
export type PlateSpec = {
  /** CSS pixels. 1440×900 renders a 2880×1800 image. */
  width: number;
  height: number;
  render: () => ReactNode;
};

export type Plates = Record<string, PlateSpec>;
