import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './swatchbook/images';

const swatchbook: CaseStudy = {
  slug: 'swatchbook',
  title: 'Swatchbook',
  key: 'Swatchbook',
  kind: 'Design tool plugin',
  summary:
    'An open-source design tool plugin that finds near-miss colors in a file and swaps each one for the nearest token that still passes contrast.',
  client: 'Open source, sponsored by Halyard',
  year: '2024',
  role: 'Designer and maintainer',
  team: [
    'Ines Okafor, plugin engineering',
    'Ravi Menon, color science (contributor)',
    'Joon Park, accessibility testing (contributor)'
  ],
  color: { bg: '#E9ECF1', fg: '#15171A', accent: '#2E6BFF' },
  cover: {
    image: images.cover,
    alt: 'A checkout card for a boat slip with its fee labels selected, next to the Swatchbook panel suggesting ink/700 because the nearest token, ink/500, fails contrast on the gray price box.'
  },
  problem:
    'Design files drift. When Halyard audited the booking file of a client, a slip-rental company called Moorage, it found 212 unique hex values against a library of 38 tokens. Most of the extras were near misses nobody could see, like #6E7A87 standing in for #66727F, but 41 text layers failed contrast, and cleaning the file up by hand took a designer three days.',
  decisions: [
    {
      title: 'Audit by distance, not exact match',
      body: 'An exact-match search calls #18242F and #14202B different colors, which is true and useless. Swatchbook converts every fill and stroke to CIELAB, measures ΔE2000 to each token, and groups strays into clusters around the nearest one, so 174 strays read as 31 decisions.'
    },
    {
      title: 'Suggest the nearest token that passes where the layer sits',
      body: 'Gray fee labels were closest to ink/500, which passes on white but reaches only 4.36:1 on the gray price box. Swatchbook measures contrast against the fill actually beneath each layer and steps along the same ramp until it passes. My first version searched every token and offered a blue for gray text, so staying in the ramp became the rule.'
    },
    {
      title: 'One click to replace, one row to undo',
      body: 'Replacing is a single button, so every swap is written to a Changelog page in the file: layer, before and after, ΔE, contrast, and who ran it. Anyone can revert a row weeks later, which is what made design leads comfortable running it on shared files.'
    }
  ],
  outcome:
    'Swatchbook has 11,400 installs. An average audit replaces 86% of strays automatically, and Moorage’s booking file went from 212 colors to 41 in an afternoon: 38 tokens plus three illustration colors kept on purpose.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Halyard, a design-systems consultancy, kept running the same cleanup for clients: export every color in a file, sort the hexes in a spreadsheet, then fix them layer by layer. They sponsored me to turn that routine into a free, open-source plugin that teams could run on their own files.',
        'The constraint was trust. A plugin that quietly rewrites colors across a shared file gets uninstalled after one bad afternoon. So the design had three jobs: show how far each color has drifted, pick a replacement a designer would agree with, and make every change easy to see and undo.'
      ]
    },
    {
      type: 'image',
      image: images.audit,
      alt: 'A vector editor with two Moorage frames on the canvas and the Swatchbook audit panel open: 212 colors in use, 38 matching a token, 174 strays, mostly under ΔE 2.',
      caption: 'Most strays sit under ΔE 2, which is why nobody had noticed them. The 41 contrast failures are the ones that matter.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.clusters,
          alt: 'The Clusters tab: strays grouped under ink/500, kelp/600, and coral/600, each with a count of layers, a ΔE range, and how many fail AA.'
        },
        {
          image: images.fix,
          alt: 'The Fix tab with the cancellation note selected: its stray green fails at 3.93:1, and kelp/600 is suggested at 4.56:1.'
        }
      ],
      caption: 'Clusters turn 174 strays into 31 decisions. The fix panel always shows the nearest token, even when it fails, so a suggestion is never a mystery.'
    },
    {
      type: 'demo',
      component: lazy(() => import('./swatchbook/demo')),
      title: 'Fix the strays on a checkout card',
      hint: 'Pick a stray, check the suggested token and its contrast, then Replace. Undo puts the old color back.',
      height: { mobile: 784, desktop: 670 },
      caption:
        'Contrast is measured against the fill under each layer: the same gray that passes on the white card fails on the price box.'
    },
    {
      type: 'text',
      heading: 'Why the nearest color was wrong',
      body: [
        'Fixing every stray to its nearest token would have repaired only half of the 41 failing text layers, because the nearest token often failed too. Designers had eyeballed a lighter gray on a gray background, and the token they were reaching for was built for white.',
        'The ramp rule accepts a bigger visual jump, ΔE 18.4 for the fee labels, to get text people can read. The panel lists the nearest token anyway, marked Fail, so the jump is a visible decision rather than a surprise.'
      ]
    },
    {
      type: 'beforeAfter',
      before: {
        image: images.before,
        alt: 'The checkout card before cleanup, with six numbered strays: 13 colors on the frame, two of them failing contrast.'
      },
      after: {
        image: images.after,
        alt: 'The same card after cleanup: nine colors, all tokens, every text layer passing AA.'
      },
      labels: ['Before: 13 colors', 'After: 9 tokens'],
      caption: 'Drag to compare. Most swaps are invisible; the fee labels get darker on purpose.'
    },
    {
      type: 'quote',
      quote:
        'We had been calling it the gray problem for a year. Swatchbook showed us it was nineteen grays, six of them failing on our own price boxes, and we cleaned up the whole booking file before dinner.',
      name: 'Dana Whitlock',
      title: 'Design lead, Moorage'
    },
    {
      type: 'image',
      image: images.changelog,
      alt: 'The Swatchbook changelog page inside the file: a table of replacements with layer, before and after colors, ΔE, contrast before and after, and one reverted row.',
      caption: 'The Changelog page lives in the file, so the history travels with it, even to people who never install the plugin.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.settings,
          alt: 'Settings: tokens come from the Moorage Core and Extended libraries, matching uses ΔE2000 up to 10, contrast target AA, and illustration layers are skipped.'
        },
        {
          image: images.done,
          alt: 'The audit report: 212 colors down to 41, with 150 replaced automatically, 21 by hand, 3 kept as exceptions, and no text failing AA.'
        }
      ],
      caption: 'Token source is set per file. Exceptions are kept deliberately and listed in the report, not hidden.'
    },
    {
      type: 'metrics',
      items: [
        { value: '11,400', label: 'Installs', detail: 'free and open source' },
        { value: '86%', label: 'Strays replaced', detail: 'in an average audit, automatically' },
        { value: '212 → 41', label: 'Colors in Moorage’s file', detail: 'in one afternoon' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'Swatchbook only trusts solid fills. Gradients and text over photos are flagged for a person, which is honest but slow: in Moorage’s file they were 9 of the 24 decisions left after the automatic pass. The next version samples the pixels under text on images and suggests a scrim token when no text color can pass.'
      ]
    }
  ]
};

export default swatchbook;
