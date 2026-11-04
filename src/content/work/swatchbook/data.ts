import { contrast, deltaE } from './color';

/**
 * Moorage Core: the fictional client's 12-color token set (the full library
 * has 38; the other 26 live in Moorage Extended). Ramps run light to dark.
 */
export type Token = { name: string; hex: string; ramp: string };

export const tokens: Token[] = [
  { name: 'ink/900', hex: '#14202B', ramp: 'ink' },
  { name: 'ink/700', hex: '#3A4856', ramp: 'ink' },
  { name: 'ink/500', hex: '#66727F', ramp: 'ink' },
  { name: 'fog/300', hex: '#D5DCE3', ramp: 'fog' },
  { name: 'fog/100', hex: '#EEF2F5', ramp: 'fog' },
  { name: 'paper/0', hex: '#FFFFFF', ramp: 'paper' },
  { name: 'sea/700', hex: '#0B5670', ramp: 'sea' },
  { name: 'sea/600', hex: '#0F6E8C', ramp: 'sea' },
  { name: 'sea/100', hex: '#DCEFF5', ramp: 'sea' },
  { name: 'kelp/600', hex: '#2C7A4B', ramp: 'kelp' },
  { name: 'kelp/100', hex: '#E2F3E7', ramp: 'kelp' },
  { name: 'coral/600', hex: '#C4432D', ramp: 'coral' }
];

export const tk = (name: string) => tokens.find((t) => t.name === name)!.hex;

/**
 * How a stray is used decides which contrast check applies: body text needs
 * 4.5:1, large text 3:1, a fill is checked against the label it carries, and
 * a decorative stroke has no minimum.
 */
export type StrayKind = 'text' | 'large' | 'fill' | 'stroke';

export type Stray = {
  id: string;
  hex: string;
  label: string;
  layers: number;
  kind: StrayKind;
  /** The fill behind text or strokes, or the label color on top of a fill. */
  against: string;
};

/** The near-miss colors on the sample checkout card, most layers first. */
export const strays: Stray[] = [
  { id: 'fees', hex: '#6E7A87', label: 'Fee labels', layers: 3, kind: 'text', against: tk('fog/100') },
  { id: 'notice', hex: '#348556', label: 'Cancellation note', layers: 2, kind: 'text', against: tk('kelp/100') },
  { id: 'divider', hex: '#E1E6EB', label: 'Dividers', layers: 2, kind: 'stroke', against: tk('paper/0') },
  { id: 'title', hex: '#18242F', label: 'Slip title', layers: 1, kind: 'large', against: tk('paper/0') },
  { id: 'link', hex: '#13759A', label: 'Promo link', layers: 1, kind: 'text', against: tk('paper/0') },
  { id: 'button', hex: '#137396', label: 'Reserve button', layers: 1, kind: 'fill', against: tk('paper/0') }
];

export const minFor = (kind: StrayKind) => (kind === 'stroke' ? 0 : kind === 'large' ? 3 : 4.5);

export type Candidate = { token: Token; dE: number; ratio: number; pass: boolean };

export type Analysis = {
  stray: Stray;
  min: number;
  /** The stray's own contrast today. */
  ratio: number;
  pass: boolean;
  nearest: Candidate;
  suggested: Candidate;
  candidates: Candidate[];
  reason: string;
};

/**
 * Rank every token by ΔE2000 from the stray. Suggest the nearest one if it
 * passes; otherwise walk the nearest token's ramp for the closest step that
 * passes, and only then look in other ramps.
 */
export function analyze(s: Stray): Analysis {
  const min = minFor(s.kind);
  const ranked: Candidate[] = tokens
    .map((token) => {
      const ratio = contrast(token.hex, s.against);
      return { token, dE: deltaE(s.hex, token.hex), ratio, pass: ratio >= min };
    })
    .sort((a, b) => a.dE - b.dE);
  const nearest = ranked[0];
  const suggested = nearest.pass
    ? nearest
    : (ranked.find((c) => c.pass && c.token.ramp === nearest.token.ramp) ?? ranked.find((c) => c.pass)!);
  const rest = ranked.filter((c) => c !== nearest && c !== suggested);
  const candidates = suggested === nearest ? [nearest, rest[0], rest[1]] : [nearest, suggested, rest[0]];
  const ratio = contrast(s.hex, s.against);
  const n = nearest.token.name;
  const reason =
    s.kind === 'stroke'
      ? `Decorative, so only distance counts. ${n} is ΔE ${nearest.dE.toFixed(1)} away.`
      : suggested !== nearest
        ? `${n} is nearest but fails here. ${suggested.token.name} is the closest ${suggested.token.ramp} step that passes.`
        : ratio < min
          ? `The stray itself fails today. ${n} is nearest and passes.`
          : nearest.dE < 2
            ? `${n} is nearest and passes. A ΔE under 2 is hard to see at all.`
            : `${n} is nearest and passes. Few people will notice the swap.`;
  return { stray: s, min, ratio, pass: ratio >= min, nearest, suggested, candidates, reason };
}

export const analyses = Object.fromEntries(strays.map((s) => [s.id, analyze(s)])) as Record<string, Analysis>;

/** Colors on the checkout card before cleanup: stray hex per stray id. */
export const beforeColors = Object.fromEntries(strays.map((s) => [s.id, s.hex])) as Record<string, string>;
export const afterColors = Object.fromEntries(
  strays.map((s) => [s.id, analyses[s.id].suggested.token.hex])
) as Record<string, string>;

/** Tokens the card uses directly, which never change. */
export const cardTokens = ['paper/0', 'fog/300', 'fog/100', 'ink/900', 'ink/700', 'ink/500', 'kelp/100'];

/** Deterministic PRNG for generated stray chips. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();

/** Near-miss variants of a token: what a file collects over two years. */
export function nearMisses(base: string, count: number, seed: number, maxDE = 5) {
  const r = rng(seed);
  const n = parseInt(base.slice(1), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const out: { hex: string; dE: number }[] = [];
  let guard = 0;
  while (out.length < count && guard++ < 500) {
    const spread = 2 + r() * 9;
    const hex = '#' + rgb.map((c) => hex2(c + (r() * 2 - 1) * spread)).join('');
    const dE = deltaE(base, hex);
    if (dE > 0.3 && dE <= maxDE && !out.some((o) => o.hex === hex)) out.push({ hex, dE });
  }
  return out.sort((a, b) => a.dE - b.dE);
}

/** Clusters in the client's whole file (38 tokens, 174 strays). */
export type Cluster = { token: string; hex: string; strays: number; layers: number; failing: number; seed: number };

export const clusters: Cluster[] = [
  { token: 'ink/500', hex: tk('ink/500'), strays: 19, layers: 241, failing: 6, seed: 11 },
  { token: 'kelp/600', hex: tk('kelp/600'), strays: 9, layers: 47, failing: 4, seed: 15 },
  { token: 'coral/600', hex: tk('coral/600'), strays: 7, layers: 31, failing: 2, seed: 17 },
  { token: 'sea/600', hex: tk('sea/600'), strays: 23, layers: 176, failing: 0, seed: 12 },
  { token: 'fog/300', hex: tk('fog/300'), strays: 17, layers: 302, failing: 0, seed: 13 },
  { token: 'ink/900', hex: tk('ink/900'), strays: 14, layers: 388, failing: 0, seed: 14 },
  { token: 'sand/200', hex: '#F2E6CF', strays: 12, layers: 64, failing: 0, seed: 16 }
];

/** Audit totals for the client's booking file. */
export const audit = {
  file: 'Moorage / Booking flows',
  pages: 4,
  layers: 1906,
  colors: 212,
  tokens: 38,
  strays: 174,
  clusters: 31,
  outliers: 3,
  auto: 150,
  failing: 41,
  bands: [
    { label: 'Under 2', note: 'invisible', count: 96 },
    { label: '2 to 5', note: 'subtle', count: 58 },
    { label: '5 to 10', note: 'visible', count: 17 },
    { label: 'Over 10', note: 'outliers', count: 3 }
  ]
};
