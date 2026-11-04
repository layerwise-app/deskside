/**
 * Everything about the owner of this site lives here. Change a value, save,
 * and every page picks it up. Case studies live in `src/content/work/`.
 */

export type FontFile = {
  /** A file in `public/fonts/`, like `/fonts/ibm-plex-sans-var.woff2`. */
  src: string;
  /** One weight (`400`) or a variable range (`100 700`). */
  weight: string;
  style: 'normal' | 'italic';
};

export type FontSetting = {
  family: string;
  files: FontFile[];
  /** Used while the font loads and if it fails. */
  fallback: string;
};

export type SocialLink = {
  label: string;
  /** Two or three letters for the tiny corner labels. */
  short: string;
  href: string;
};

export const portfolio = {
  name: 'Sam Ibarra',
  role: 'Product designer',
  location: {
    city: 'Portland, Oregon',
    /** Shown next to the clock in the corner of the desk. */
    short: 'PDX',
    /** The clock shows the owner's local time in this IANA time zone. */
    timeZone: 'America/Los_Angeles'
  },

  /** One sentence for search results and link previews. */
  tagline:
    'Product designer in Portland making calm, specific software for marketplaces, money, transit, and the home.',

  bio: [
    'I design products people use with one hand while doing something else: buying a dresser off a neighbor, catching the 7:40 to Seattle, turning down the heat from the couch.',
    'For eleven years I have worked inside small teams at startups and agencies, usually as the first or only designer. I write the spec, draw the screens, build the prototype, and stay through launch to watch what breaks.',
    'Before software I repaired vintage audio gear in a shop on SE Division. I still think the best interfaces are knobs: obvious, forgiving, and satisfying to turn.'
  ],

  /**
   * Where contact form messages are emailed. Leave it empty to only save
   * messages to the database (see the Database tab in Layerwise).
   */
  ownerEmail: '',

  /** Replace each `href` with your own profile address. */
  social: [
    { label: 'Instagram', short: 'IG', href: 'https://www.instagram.com/' },
    { label: 'LinkedIn', short: 'IN', href: 'https://www.linkedin.com/' },
    { label: 'Are.na', short: 'AR', href: 'https://www.are.na/' },
    { label: 'GitHub', short: 'GH', href: 'https://github.com/' }
  ] satisfies SocialLink[],

  /** A CV in `public/`, linked from About. */
  cv: { href: '/sam-ibarra-cv.pdf', label: 'CV, PDF, 2 pages' },

  fonts: {
    sans: {
      family: 'IBM Plex Sans',
      files: [
        { src: '/fonts/ibm-plex-sans-var.woff2', weight: '100 700', style: 'normal' },
        { src: '/fonts/ibm-plex-sans-var-italic.woff2', weight: '100 700', style: 'italic' }
      ],
      fallback: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
    },
    mono: {
      family: 'IBM Plex Mono',
      files: [
        { src: '/fonts/ibm-plex-mono-400.woff2', weight: '400', style: 'normal' },
        { src: '/fonts/ibm-plex-mono-500.woff2', weight: '500', style: 'normal' }
      ],
      fallback: 'ui-monospace, Menlo, Consolas, monospace'
    }
  } satisfies Record<'sans' | 'mono', FontSetting>,

  /**
   * Site colors. Text colors must keep 4.5:1 contrast on `paper`.
   * `beige`, `glaze`, and `desk` color the objects in the 3D scene.
   */
  colors: {
    paper: '#EEEEEB',
    paperDeep: '#DEDEDA',
    ink: '#171716',
    muted: '#5C5B57',
    line: '#CFCFCA',
    accent: '#E0482B',
    beige: '#CBC3AF',
    glaze: '#3E7269',
    desk: '#E4E3DF'
  },

  /** One of these shows in a corner of the desk. Click it for another. */
  fortunes: [
    'The second idea is usually the honest one.',
    'Name the button after what happens next.',
    'A good default is a decision you made for a stranger.',
    'Ship the boring version. Watch someone use it.',
    'Empty states are first impressions.',
    'If it needs a tooltip, it needs a better label.',
    'Every setting is a question you could not answer.',
    'Draw it at the size of a thumb.',
    'Motion is a sentence. Give it a subject.',
    'The spec is done when the edge cases are boring.'
  ]
};

export type Portfolio = typeof portfolio;
