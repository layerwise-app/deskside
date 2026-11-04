import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './margin/images';

const margin: CaseStudy = {
  slug: 'margin',
  title: 'Margin',
  key: 'Margin',
  kind: 'Journal app',
  summary:
    'A journaling app that asks one small question a day, gives you three lines to answer it, and never counts your streak.',
  client: 'Margin, Portland',
  year: '2025',
  role: 'Design partner, 7 months (equity + fee)',
  team: ['Wren Halvorsen, cofounder, product and prompts', 'Dario Kessler, cofounder, engineering', 'Asha Lindqvist, iOS (contract)'],
  color: { bg: '#F7F3EA', fg: '#23283A', accent: '#C8442E' },
  cover: {
    image: images.cover,
    alt: 'Two phone screens from Margin: a saved page answering “What did you fix this week?” with notes from earlier years in the margin, and 2025 drawn as columns of colored dots, one per day.'
  },
  problem:
    'Journaling apps lose about 80% of new users in two weeks, and Margin was doing worse than most: 7% of people who wrote a first entry were still writing at day 30. The people who left told us two things. A blank page asked for a better day than they had, and a streak counter turned one missed night into a reason to stop for good.',
  decisions: [
    {
      title: 'One small question, three lines',
      body: 'Every day opens on a single prompt, like “What did you fix this week?”, and a ruled field three lines tall. Three lines is enough to say something and too little to feel like homework. Keep writing opens the rest of the page, and over half of entries use it.'
    },
    {
      title: 'No streaks: a year in dots',
      body: 'Each entry leaves one dot in the mood ink you picked. A missed day stays plain paper: nothing resets, nothing turns red, and no second reminder goes out. Dropping the streak cost about 6% of daily opens in week one and was ahead by week three.'
    },
    {
      title: 'Your past self in the margin',
      body: 'Beside today’s field, behind a red pencil rule, sits what you wrote on this date in earlier years. It gives an empty page something to answer. In someone’s first year, before there are earlier years, the margin shows what they wrote four weeks ago.'
    }
  ],
  outcome:
    'Day-30 retention for new users went from 7% to 34%, against a category average of about 9%. The median entry is 41 words, well past the three lines people are shown, and an app store’s editorial team featured Margin in its fall collection on writing habits.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Margin is two people in a converted garage in Montavilla. Wren writes the prompts and runs the company; Dario builds the app. The first version had a small, loyal base and a leaky front door: nine in ten new users were gone within a month. They offered me a fee and equity to rethink that first month with them, over seven months, alongside a contract iOS engineer.',
        'I started with people who had quit, not the ones who stayed. In fourteen interviews the most common answers were “I didn’t know what to write” and “I broke my streak and felt bad opening it.” Nobody left because Margin was missing a feature, so most of the work was taking things away.'
      ]
    },
    {
      type: 'image',
      image: images.flow,
      alt: 'Three Margin screens: today’s question above an empty three-line field, the same field opened to eight lines with a finished answer and ochre ink chosen, and November 4 shown across four years.',
      caption: 'The page asks one question. The margin answers with what you wrote on this date before.'
    },
    {
      type: 'demo',
      component: lazy(() => import('./margin/demo')),
      title: 'Write today’s page',
      hint: 'Answer the question, pick an ink, and save. Watch for the new dot in November.',
      height: { mobile: 700, desktop: 780 },
      caption:
        'The field stays three lines tall until you ask for more. Ink is optional; a page saved without one prints in plain ink blue.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.inks,
          alt: 'A specimen card of Margin’s five mood inks as drawdown swatches: ochre for bright, moss for steady, rose for restless, slate for low and plum for heavy, each with a one-line description and its count of days.'
        },
        {
          image: images.closeup,
          alt: 'A close crop of the writing field with spec notes in red pencil: three ruled lines 32 px apart, the Keep writing control turning red once text runs past three lines, and the margin of earlier years beside it.'
        }
      ],
      caption:
        'We tested a five-point mood scale first. People graded their days, then skipped writing the bad ones. Named inks have no top or bottom.'
    },
    {
      type: 'text',
      heading: 'What we gave up',
      body: [
        'Streaks work, for about a week. The old counter got people to open the app daily at first, and when we removed it in a test, day-7 opens fell by about 6%. By day 21 the group with dots was ahead and kept pulling away: someone who missed a Tuesday wrote again on Thursday instead of deciding they had failed.',
        'We also gave up the blank page as the default. About 4% of people turn prompts off, mostly long-time diarists, and they get a full page with no question at all. That setting is two taps deep on purpose.'
      ]
    },
    {
      type: 'image',
      bleed: true,
      image: images.year,
      alt: 'One writer’s 2025 as twelve rows of dots, one per day and colored by mood ink, with days circled in red pencil and noted in a margin: a snow day, a long bike ride, a knee surgery, two weeks at the coast with no entries, and the day she fixed her bike brake.',
      caption: 'Testers asked to print their year, so it became an export. A two-week gap reads as a trip, not a failure.'
    },
    {
      type: 'quote',
      quote:
        'I quit two journal apps over the little flame. In Margin I missed most of August, came back in September, and my year was just sitting there waiting for me, a few dots lighter.',
      name: 'Teodora Vance',
      title: 'Writing in Margin since March, St. Johns'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.search,
          alt: 'Searching for “bike”: a row of tags with bike selected, and five dated entries from 2025 and 2024 with the word marked in red pencil.'
        },
        {
          image: images.reminders,
          alt: 'The last onboarding step: four reminder times with After dinner, 8:45 pm selected, six of seven days on, and a preview of the notification asking “What did you fix this week?”'
        }
      ],
      caption: 'There is one reminder, and it carries the day’s question, so the notification is already the prompt.'
    },
    {
      type: 'metrics',
      items: [
        { value: '34%', label: 'Day-30 retention', detail: 'up from 7%; category average about 9%' },
        { value: '41 words', label: 'Median entry', detail: 'three lines hold about 15' },
        { value: '4.2', label: 'Pages a week', detail: 'among people still writing at day 30' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'Wren writes a question for every day of the year, and about one entry in five answers a different question than the one asked. People already have favorites. Next is letting them keep a few and bring them back, without turning the prompt into a menu.'
      ]
    }
  ]
};

export default margin;
