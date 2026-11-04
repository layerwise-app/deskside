import type { CaseStudy } from '~/content/types';

// Every `<slug>.ts` file in this folder is a case study. Its default export
// is picked up here automatically.
const modules = import.meta.glob<{ default: CaseStudy }>(['./*.ts', '!./index.ts', '!./*.test.ts'], {
  eager: true
});

/**
 * The order of the keys on the desk and the rows in the index. A case study
 * that is not listed here goes at the end. The desk has room for ten keys.
 */
export const order = [
  'stoop',
  'long-wave',
  'ebb',
  'alder-card',
  'margin',
  'nook',
  'swatchbook',
  'cascadia-rail'
];

const rank = (slug: string) => {
  const i = order.indexOf(slug);
  return i === -1 ? order.length : i;
};

export const work: CaseStudy[] = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean)
  .sort((a, b) => rank(a.slug) - rank(b.slug) || a.title.localeCompare(b.title));

export function getCase(slug: string) {
  return work.find((c) => c.slug === slug);
}

/** The project after this one, wrapping around to the first. */
export function nextCase(slug: string) {
  const i = work.findIndex((c) => c.slug === slug);
  return work[(i + 1) % work.length];
}
