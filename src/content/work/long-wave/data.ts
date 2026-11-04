/**
 * The sample episode and library behind every Long Wave screen. Times are in
 * seconds from the start of the episode.
 */

export type Chapter = { start: number; title: string };
export type Line = { t: number; who: 'MIRIAM' | 'HOLLIS'; text: string };

export const episode = {
  show: 'Workbench',
  host: 'Miriam Sato',
  number: 41,
  title: 'Hollis Brandvold: Forty Feet of Cedar',
  guest: 'Hollis Brandvold',
  released: 'Oct 22, 2024',
  duration: 7634, // 2:07:14
  producer: 'Tamsin Reyes',
  description:
    'Hollis Brandvold has built 23 wooden boats in a barn on Youngs Bay, outside Astoria, and he still draws every one full size on the floor first. Miriam spent two days in the shop while he steamed ribs for a 40-foot cedar cutter.'
};

/** Where the listener paused, six days before the resume screens. */
export const pausedAt = 3062; // 51:02

const ts = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

export const chapters: Chapter[] = [
  { start: 0, title: 'Cold open: a barn on Youngs Bay' },
  { start: ts(0, 4, 12), title: 'A father who fished, a son who wouldn’t' },
  { start: ts(0, 17, 40), title: 'Four years of sweeping in Port Townsend' },
  { start: ts(0, 31, 5), title: 'Why it has to be Port Orford cedar' },
  { start: ts(0, 46, 20), title: 'Lofting: the whole boat, full size, on the floor' },
  { start: ts(1, 2, 48), title: 'Steaming the ribs' },
  { start: ts(1, 18, 30), title: 'The winter the shop flooded' },
  { start: ts(1, 33, 15), title: 'Clients who want a boat, and clients who want a story' },
  { start: ts(1, 47, 52), title: 'Launch day on the Columbia' },
  { start: ts(1, 58, 40), title: 'What he tells the next apprentice' }
];

export const chapterEnd = (i: number) =>
  i + 1 < chapters.length ? chapters[i + 1].start : episode.duration;

export const chapterLength = (i: number) => chapterEnd(i) - chapters[i].start;

export function chapterAt(t: number) {
  for (let i = chapters.length - 1; i >= 0; i--) if (t >= chapters[i].start) return i;
  return 0;
}

export const transcript: Line[] = [
  { t: ts(0, 0, 0), who: 'MIRIAM', text: 'It’s seven in the morning and the tide is out, so the barn smells like mud and cedar.' },
  { t: ts(0, 0, 9), who: 'HOLLIS', text: 'Mind the bucket. That’s the glue pot. It’s been warming since five.' },
  { t: ts(0, 0, 16), who: 'MIRIAM', text: 'There’s a boat in here. Most of a boat. It’s upside down and it fills the whole building.' },
  { t: ts(0, 0, 25), who: 'HOLLIS', text: 'Forty feet, give or take. She’ll be right side up by Christmas, if the cedar behaves.' },
  { t: ts(0, 0, 34), who: 'MIRIAM', text: 'I’m Miriam Sato, and this is Workbench.' },

  { t: ts(0, 4, 12), who: 'MIRIAM', text: 'Your dad fished out of Astoria for thirty years.' },
  { t: ts(0, 4, 17), who: 'HOLLIS', text: 'Thirty-one. Gillnetting, mostly salmon, on a boat called the Inga Marie.' },
  { t: ts(0, 4, 25), who: 'HOLLIS', text: 'And I was seasick every single time. He thought I was faking.' },
  { t: ts(0, 4, 33), who: 'MIRIAM', text: 'So the water was never the plan.' },
  { t: ts(0, 4, 37), who: 'HOLLIS', text: 'The water was the thing I was running from. I just ended up building the way back to it.' },

  { t: ts(0, 17, 40), who: 'MIRIAM', text: 'You were nineteen when you showed up in Port Townsend.' },
  { t: ts(0, 17, 46), who: 'HOLLIS', text: 'Nineteen, with a duffel bag and a letter from my shop teacher.' },
  { t: ts(0, 17, 53), who: 'HOLLIS', text: 'The old man read it, handed it back, and gave me a broom.' },
  { t: ts(0, 18, 1), who: 'MIRIAM', text: 'How long were you sweeping?' },
  { t: ts(0, 18, 4), who: 'HOLLIS', text: 'Four years before he let me plane a plank. I counted.' },

  { t: ts(0, 31, 5), who: 'MIRIAM', text: 'Every builder I’ve talked to has a wood they swear by.' },
  { t: ts(0, 31, 11), who: 'HOLLIS', text: 'Port Orford cedar. It grows on about a hundred miles of coast and nowhere else.' },
  { t: ts(0, 31, 19), who: 'HOLLIS', text: 'It bends without arguing, it doesn’t rot, and it smells like pepper when you cut it.' },
  { t: ts(0, 31, 28), who: 'MIRIAM', text: 'And you pick the logs yourself.' },
  { t: ts(0, 31, 31), who: 'HOLLIS', text: 'Twice a year I drive down to Gold Beach and walk the yard. You can’t do it from a catalog.' },

  { t: ts(0, 46, 20), who: 'MIRIAM', text: 'Okay. Explain lofting to me like I’ve never seen a boat.' },
  { t: ts(0, 46, 26), who: 'HOLLIS', text: 'You take the drawings, which are tiny, and you draw the whole boat again at full size.' },
  { t: ts(0, 46, 34), who: 'HOLLIS', text: 'On the floor. In pencil. Every frame, every curve, one on top of the other.' },
  { t: ts(0, 46, 43), who: 'MIRIAM', text: 'This floor? The one we’re standing on?' },
  { t: ts(0, 46, 47), who: 'HOLLIS', text: 'Painted it white in March. It’s been a boat ever since.' },
  { t: ts(0, 50, 21), who: 'MIRIAM', text: 'How do you know when a line is right?' },
  { t: ts(0, 50, 25), who: 'HOLLIS', text: 'You bend a batten along the nails and sight down it, with your eye right on the floor.' },
  { t: ts(0, 50, 35), who: 'HOLLIS', text: 'If it’s fair, it looks like water. If it isn’t, it looks like a mistake.' },
  { t: ts(0, 50, 44), who: 'MIRIAM', text: 'And you can see that from down there.' },
  { t: ts(0, 50, 52), who: 'HOLLIS', text: 'If the line is wrong on the floor, it’s wrong in the water. There’s no fixing it later.' },
  { t: ts(0, 51, 4), who: 'MIRIAM', text: 'That’s a lot of pressure on a pencil.' },
  { t: ts(0, 51, 8), who: 'HOLLIS', text: 'That’s why I use three. Hard, soft, and one nobody else is allowed to touch.' },
  { t: ts(0, 51, 17), who: 'MIRIAM', text: 'Which one is this?' },
  { t: ts(0, 51, 19), who: 'HOLLIS', text: 'That’s the one nobody touches. Put it down.' },

  { t: ts(1, 2, 48), who: 'HOLLIS', text: 'This is the steam box. It’s a plywood coffin with a kettle on the end, basically.' },
  { t: ts(1, 2, 56), who: 'HOLLIS', text: 'An hour per inch of thickness. These are an inch and a quarter, so we wait.' },
  { t: ts(1, 3, 5), who: 'MIRIAM', text: 'And then?' },
  { t: ts(1, 3, 7), who: 'HOLLIS', text: 'Then you have about ninety seconds to bend it before it remembers it’s a tree.' },
  { t: ts(1, 3, 16), who: 'MIRIAM', text: 'Ninety seconds.' },
  { t: ts(1, 3, 18), who: 'HOLLIS', text: 'Ninety if you’re lucky. Grab those gloves.' },

  { t: ts(1, 18, 30), who: 'MIRIAM', text: 'Tell me about the winter of 2015.' },
  { t: ts(1, 18, 34), who: 'HOLLIS', text: 'King tide and a storm on the same night. The bay came in under the doors.' },
  { t: ts(1, 18, 42), who: 'HOLLIS', text: 'I had a half-planked dory on the stands and eight inches of saltwater on the floor.' },
  { t: ts(1, 18, 51), who: 'MIRIAM', text: 'And the lofting? The drawings on the floor?' },
  { t: ts(1, 18, 55), who: 'HOLLIS', text: 'Gone. Six weeks of pencil, gone by morning. I sat on the stairs and laughed.' },

  { t: ts(1, 33, 15), who: 'MIRIAM', text: 'Who buys a forty-foot cedar boat in 2024?' },
  { t: ts(1, 33, 20), who: 'HOLLIS', text: 'Two kinds of people. People who want a boat, and people who want to say they have one.' },
  { t: ts(1, 33, 29), who: 'HOLLIS', text: 'The first kind visit every month and ask about the fastenings.' },
  { t: ts(1, 33, 36), who: 'HOLLIS', text: 'The second kind ask about the name.' },
  { t: ts(1, 33, 40), who: 'MIRIAM', text: 'Which kind is this one for?' },
  { t: ts(1, 33, 43), who: 'HOLLIS', text: 'A retired schoolteacher from Cathlamet. She’s the first kind.' },

  { t: ts(1, 47, 52), who: 'MIRIAM', text: 'Walk me through a launch.' },
  { t: ts(1, 47, 56), who: 'HOLLIS', text: 'You wait for slack water. You get everybody who helped, and their kids, down to the ramp.' },
  { t: ts(1, 48, 5), who: 'HOLLIS', text: 'Then the trailer backs out, and for about three seconds nobody breathes.' },
  { t: ts(1, 48, 13), who: 'MIRIAM', text: 'What are you listening for?' },
  { t: ts(1, 48, 16), who: 'HOLLIS', text: 'Nothing. If she’s quiet, she’s tight. You want her to sit there like she’s always been there.' },

  { t: ts(1, 58, 40), who: 'MIRIAM', text: 'There’s someone sweeping your floor right now.' },
  { t: ts(1, 58, 44), who: 'HOLLIS', text: 'Ada. Eight months in. She’s better than I was at year three.' },
  { t: ts(1, 58, 52), who: 'MIRIAM', text: 'What do you tell her?' },
  { t: ts(1, 58, 55), who: 'HOLLIS', text: 'Sharpen everything before lunch. Never trust a line you drew tired.' },
  { t: ts(1, 59, 3), who: 'HOLLIS', text: 'And sweep. The sweeping is where you learn to look.' }
];

export function lineIndexAt(t: number) {
  for (let i = transcript.length - 1; i >= 0; i--) if (t >= transcript[i].t) return i;
  return 0;
}

/** The producer's recap for listeners who come back after three days. */
export const recap =
  'Hollis grew up seasick on his father’s gillnetter in Astoria and swore off the water. At 19 he talked his way into a Port Townsend boat shop and swept floors for four years before he planed a plank. He builds only in Port Orford cedar, from logs he picks himself in Gold Beach. When you left, he was showing Miriam how he draws the whole boat full size on the barn floor.';

/** h:mm:ss or m:ss. */
export function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** “16 min”, “1 h 16 min”. */
export function minutes(seconds: number) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export type ShowId = 'workbench' | 'table' | 'draft' | 'night' | 'tide';

export const library = {
  continue: [
    {
      show: 'workbench' as ShowId,
      showName: 'Workbench',
      title: episode.title,
      when: '6 days ago',
      at: pausedAt,
      duration: episode.duration,
      chapter: 4,
      chapterCount: 10,
      recap: true
    },
    {
      show: 'table' as ShowId,
      showName: 'The Long Table',
      title: 'Inez Calloway and the last hop yard in Aurora',
      when: 'Yesterday',
      at: 4044,
      duration: 6510,
      chapter: 6,
      chapterCount: 9,
      recap: false
    }
  ],
  queue: [
    {
      show: 'draft' as ShowId,
      showName: 'Second Draft',
      title: 'Theo Lindgren cut 400 pages and kept the ending',
      duration: 8465,
      chapters: 12
    },
    {
      show: 'night' as ShowId,
      showName: 'Night Shift',
      title: 'Lorna Pike raises the Hawthorne Bridge',
      duration: 5800,
      chapters: 8
    },
    {
      show: 'tide' as ShowId,
      showName: 'Low Tide',
      title: 'Counting sea stars at Haystack Rock',
      duration: 6738,
      chapters: 11
    }
  ]
};
