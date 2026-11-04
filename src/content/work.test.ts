import { describe, expect, it } from 'vitest';
import type { Block, CaseStudy, ImageAsset } from '~/content/types';
import { getCase, nextCase, order, work } from './work';

function imagesOf(c: CaseStudy): ImageAsset[] {
  const fromBlock = (b: Block): ImageAsset[] => {
    switch (b.type) {
      case 'image':
        return [b.image];
      case 'pair':
        return b.images.map((f) => f.image);
      case 'beforeAfter':
        return [b.before.image, b.after.image];
      case 'video':
        return [b.poster];
      default:
        return [];
    }
  };
  return [c.cover.image, ...c.blocks.flatMap(fromBlock)];
}

describe('case studies', () => {
  it('are all listed, in order, with unique slugs', () => {
    const slugs = work.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.slice(0, order.length)).toEqual(order.filter((s) => slugs.includes(s)));
  });

  it.each(work.map((c) => [c.slug, c] as const))('%s is complete', (_, c) => {
    expect(c.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(c.key.length).toBeGreaterThan(0);
    expect(c.key.length).toBeLessThanOrEqual(12);
    for (const field of ['title', 'kind', 'summary', 'client', 'year', 'role', 'problem', 'outcome'] as const) {
      expect(c[field].trim(), field).not.toBe('');
    }
    expect(c.summary.length).toBeLessThanOrEqual(200);
    expect(c.team.length).toBeGreaterThan(0);
    expect(c.decisions.length).toBeGreaterThan(0);
    expect(c.cover.image.og, 'cover share image').toBeTruthy();
    expect(c.cover.alt.trim()).not.toBe('');
  });

  it.each(work.map((c) => [c.slug, c] as const))('%s shows at least five distinct screens and a live demo', (_, c) => {
    expect(new Set(imagesOf(c)).size).toBeGreaterThanOrEqual(5);
    expect(c.blocks.some((b) => b.type === 'demo')).toBe(true);
  });

  it.each(work.map((c) => [c.slug, c] as const))('%s describes every image', (_, c) => {
    for (const b of c.blocks) {
      if (b.type === 'image') expect(b.alt.trim()).not.toBe('');
      if (b.type === 'pair') for (const f of b.images) expect(f.alt.trim()).not.toBe('');
      if (b.type === 'beforeAfter') expect(b.before.alt && b.after.alt).toBeTruthy();
      if (b.type === 'video') expect(b.alt.trim()).not.toBe('');
    }
  });

  it('looks up by slug and wraps to the first after the last', () => {
    expect(getCase(work[0].slug)).toBe(work[0]);
    expect(getCase('nope')).toBeUndefined();
    expect(nextCase(work[0].slug)).toBe(work[1]);
    expect(nextCase(work.at(-1)!.slug)).toBe(work[0]);
  });
});
