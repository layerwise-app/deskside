import type { InkId } from './theme';

/**
 * One fictional writer's year in Margin: Ines Calloway, Foster-Powell.
 * Everything is generated from a fixed seed so stills render identically.
 */
export const YEAR = 2025;
export const DAYS = 365;
export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
export const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const monthStarts = monthLengths.map((_, i) => monthLengths.slice(0, i).reduce((a, b) => a + b, 0));

/** Zero-based day of the year. `month` is zero-based, `day` is the date. */
export const doy = (month: number, day: number) => monthStarts[month] + day - 1;

/** Tuesday, November 4, 2025. */
export const TODAY = doy(10, 4);

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const order: InkId[] = ['bright', 'steady', 'restless', 'low', 'heavy'];

// How each month tends to feel, in Portland: grey winters, bright summers.
const weights = [
  [1, 3, 2, 4, 2],
  [1, 3, 2, 4, 2],
  [2, 3, 3, 3, 1],
  [3, 3, 3, 2, 1],
  [4, 3, 2, 1, 1],
  [5, 3, 2, 1, 0.5],
  [5, 3, 2, 1, 1],
  [4, 3, 2, 1, 1],
  [3, 4, 2, 2, 1],
  [2, 4, 2, 3, 1],
  [2, 3, 2, 4, 1.5],
  [2, 3, 2, 3, 1]
];

export const monthOf = (d: number) => monthStarts.filter((s) => s <= d).length - 1;

/** Days with something written, so the stories in the screens line up. */
const forced: Record<number, InkId> = {
  [doy(1, 6)]: 'low',
  [doy(2, 22)]: 'bright',
  [doy(4, 17)]: 'bright',
  [doy(6, 3)]: 'heavy',
  [doy(8, 2)]: 'restless',
  [doy(9, 11)]: 'restless',
  [doy(9, 19)]: 'steady',
  [doy(10, 3)]: 'steady'
};

/** Two weeks at the coast, August 9–24, with nothing written. */
export const coastGap = { from: doy(7, 9), to: doy(7, 24) };

function build(): (InkId | null)[] {
  const rand = mulberry32(20251104);
  const out: (InkId | null)[] = [];
  let wrote = true;
  let prev: InkId = 'steady';
  for (let d = 0; d < DAYS; d++) {
    const r1 = rand();
    const r2 = rand();
    const r3 = rand();
    if (d >= TODAY) {
      out.push(null);
      continue;
    }
    wrote = r1 < (wrote ? 0.8 : 0.42);
    if (d >= coastGap.from && d <= coastGap.to) wrote = false;
    if (forced[d]) wrote = true;
    if (!wrote) {
      out.push(null);
      continue;
    }
    let pick: InkId;
    if (forced[d]) pick = forced[d];
    else if (r2 < 0.4) pick = prev;
    else {
      const w = weights[monthOf(d)];
      const total = w.reduce((a, b) => a + b, 0);
      let x = r3 * total;
      let i = 0;
      while (x > w[i]) x -= w[i++];
      pick = order[Math.min(i, 4)];
    }
    prev = pick;
    out.push(pick);
  }
  return out;
}

/** 2025 up to yesterday. Today and the rest of the year are empty. */
export const yearBefore = build();

/** 2025 with today's entry saved in ochre. */
export const yearWithToday = yearBefore.map((v, i) => (i === TODAY ? ('bright' as InkId) : v));

export const written = (data: (InkId | null)[]) => data.filter(Boolean).length;

export const inkCounts = (data: (InkId | null)[]) =>
  Object.fromEntries(order.map((id) => [id, data.filter((v) => v === id).length])) as Record<InkId, number>;

export const prompts = [
  'What did you fix this week?',
  'Who made today a little easier?',
  'What’s on the windowsill right now?',
  'What did you eat that you’d eat again?',
  'Where did you go that wasn’t home or work?'
];

export const todayEntry = {
  prompt: prompts[0],
  ink: 'bright' as InkId,
  time: '9:12 pm',
  text: 'The back brake on the blue bike. Took two tries, Dmitri’s cable cutters and the good dish towel, which is now a grease towel. Rode it down to the Esplanade after and it stopped like it meant it. Small, but mine.'
};

export type PastEntry = {
  year: number;
  weekday: string;
  ink: InkId;
  prompt: string;
  text: string;
  /** What the margin shows beside today. */
  note: string;
};

/** November 4 in earlier years: what appears in today's margin. */
export const onThisDay: PastEntry[] = [
  {
    year: 2024,
    weekday: 'Monday',
    ink: 'steady',
    prompt: 'What was the weather where you were?',
    text: 'First real rain of the fall. Wore canvas shoes to Laurelhurst like an optimist and walked home squelching. Made the lentil soup from Mom’s card, the one with the coffee ring.',
    note: 'First real rain. Canvas shoes, like an optimist.'
  },
  {
    year: 2023,
    weekday: 'Saturday',
    ink: 'bright',
    prompt: 'What did you put in the ground?',
    text: 'Forty garlic cloves in the plot on Klickitat. Dmitri says I planted them upside down. Dmitri is wrong, probably. We’ll know in June.',
    note: 'Forty garlic cloves in the plot on Klickitat.'
  },
  {
    year: 2022,
    weekday: 'Friday',
    ink: 'low',
    prompt: 'What are you leaving behind this week?',
    text: 'Last day at the print shop. Arlo let me keep the brass composing stick and said it was always mine anyway. Bus home in the dark at 5:10.',
    note: 'Last day at the print shop. Kept the brass stick.'
  }
];

/** Margin notes for the printed year: one line beside its month. */
export const yearNotes: { month: number; day: number; to?: number; text: string }[] = [
  { month: 1, day: 6, text: 'Snow day. Power out for nine hours.' },
  { month: 2, day: 22, text: 'Peas in along the back fence. Too early.' },
  { month: 4, day: 17, text: 'The Springwater out to Boring and back.' },
  { month: 6, day: 3, text: 'Dad’s knee surgery. It went fine.' },
  { month: 7, day: 9, to: 24, text: 'At the coast. Didn’t write, didn’t need to.' },
  { month: 9, day: 11, text: 'Interview at the bindery on Water Ave.' },
  { month: 10, day: 4, text: 'Fixed the back brake. Small, but mine.' }
];

export type SearchHit = { date: string; year: number; ink: InkId; prompt: string; before: string; match: string; after: string };

export const searchHits: SearchHit[] = [
  {
    date: 'Nov 4',
    year: 2025,
    ink: 'bright',
    prompt: 'What did you fix this week?',
    before: 'The back brake on the blue ',
    match: 'bike',
    after: '. Took two tries, Dmitri’s cable cutters and the good dish towel…'
  },
  {
    date: 'Oct 19',
    year: 2025,
    ink: 'steady',
    prompt: 'Where did you go that wasn’t home or work?',
    before: 'Rode the ',
    match: 'bike',
    after: ' out to Sauvie Island for the last pumpkins. Headwind both ways, somehow.'
  },
  {
    date: 'Sep 2',
    year: 2025,
    ink: 'restless',
    prompt: 'What took longer than it should have?',
    before: 'Brake squealing again. Walked the ',
    match: 'bike',
    after: ' up Division instead of fighting it.'
  },
  {
    date: 'May 17',
    year: 2025,
    ink: 'bright',
    prompt: 'What are you quietly proud of?',
    before: 'All of the Springwater on the ',
    match: 'bike',
    after: ', out to Boring and back. 42 miles. Legs are soup.'
  },
  {
    date: 'Mar 8',
    year: 2024,
    ink: 'low',
    prompt: 'What did today cost you?',
    before: 'Flat on the Hawthorne Bridge in sideways rain. Carried the ',
    match: 'bike',
    after: ' the last mile home.'
  }
];
