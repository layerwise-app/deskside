import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './long-wave/images';

const longWave: CaseStudy = {
  slug: 'long-wave',
  title: 'Long Wave',
  key: 'Long Wave',
  kind: 'Podcast app',
  summary:
    'A podcast player for two-hour interviews where the timeline is the episode’s chapters, so coming back a week later doesn’t mean scrubbing blind.',
  client: 'Long Wave Audio, Portland',
  year: '2024',
  role: 'Product designer (contract, 5 months)',
  team: [
    'Nadia Ferreira, product lead',
    'Jonah Whitcomb, iOS',
    'Tamsin Reyes, audio producer',
    'Emil Strand, data analysis'
  ],
  color: { bg: '#14171F', fg: '#F3E9D7', accent: '#F2A541' },
  cover: {
    image: images.cover,
    alt: 'Three phone screens from Long Wave: a list of ten chapters, the player with a chapter title riding above the timeline mid-drag, and a transcript following playback.'
  },
  problem:
    'Long Wave’s interviews run two hours, and almost nobody hears one in a sitting. In six months of playback logs, 64% of resumes came three or more days after the pause. People came back, didn’t recognize where they were, and dragged a hairline scrubber backwards looking for something familiar. The median resumed session started with three scrub-backs, and 29% of those sessions ended inside ten minutes.',
  decisions: [
    {
      title: 'Make the chapters the scrubber',
      body: 'Producers already wrote chapter titles for the show notes, and almost nobody read them. Now each chapter is a segment of the timeline, sized by its length, and a drag snaps to the start of whichever one is under your finger, with its title riding above. I gave up free scrubbing on purpose; the skip buttons and the transcript handle fine seeking.'
    },
    {
      title: 'Say what happened before you left',
      body: 'Come back after three days or more and the episode opens on a Previously card: a 30-second recap written by the producer, and the last line you heard, word for word. You can resume where you stopped, start the chapter over, or hear the host read the recap.'
    },
    {
      title: 'Let the transcript do the precise seeking',
      body: 'The transcript follows playback, and every line is a jump target. Finding the part about the flood becomes a search for “flood”, not a guess at a timecode.'
    }
  ],
  outcome:
    'In the 12 weeks after launch, episode completion rose 22% against the old player, and scrub-back events per resumed session fell 40%. Recaps were optional, and producers wrote them for 70% of new episodes.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Long Wave Audio is an independent network of eleven long-form interview shows, recorded in a converted print shop in Portland’s Central Eastside. Episodes run from 90 minutes to two and a half hours. About 40% of their listening happens in their own app, the one player they control. Nadia Ferreira, the product lead, put the brief in one line: people start episodes and don’t finish them.',
        'Emil Strand’s analysis said most of them didn’t quit, they paused, and came back days later to a player that only knew timecodes. I sat with eight listeners while they resumed an episode they had paused the week before. All eight scrubbed backwards. None of them knew how far to go.'
      ]
    },
    {
      type: 'beforeAfter',
      before: {
        image: images.before,
        alt: 'The old player: large artwork and a thin progress line, dragged back to 38:20 with only the timecode shown above the thumb.'
      },
      after: {
        image: images.after,
        alt: 'The new player mid-drag: the timeline is ten chapter segments, and a card above the finger reads Chapter 5 of 10, Lofting: the whole boat, full size, on the floor, 46:20.'
      },
      labels: ['Before: a timecode', 'After: a chapter'],
      caption:
        'Drag to compare. Same moment in both: a listener looking for where she left off. The old bubble could only tell her a number.'
    },
    {
      type: 'demo',
      component: lazy(() => import('./long-wave/demo')),
      title: 'Scrub by chapter',
      hint: 'Drag along the timeline, or focus it and use the arrow keys. Press play to watch the transcript follow.',
      height: { mobile: 700, desktop: 780 },
      caption:
        'The thumb lands on a chapter’s first line, never mid-sentence. The back-15 and forward-30 buttons are still there for “what did he just say?”'
    },
    {
      type: 'image',
      image: images.anatomy,
      alt: 'A close-up of the chapter scrubber with four numbered callouts: the chapter title above the finger, the thin finger line beside the thumb, segment widths, and played chapters in amber.',
      caption:
        'Chapter starts are snap targets, so producers place them on the first word of a new topic. That rule came from Tamsin’s first round of edits.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.chapters,
          alt: 'The chapter list as a sheet: ten producer-written titles with start times and lengths, four checked as played and Lofting highlighted at 4:42 of 16:28.'
        },
        {
          image: images.transcript,
          alt: 'The transcript view: earlier lines dimmed, the current line from Hollis highlighted, a search field above, and a pill reading Following playback.'
        }
      ],
      caption: 'The chapter list is for choosing by title, the transcript for everything finer. Tapping a line plays from its first word.'
    },
    {
      type: 'text',
      heading: 'Coming back after a week',
      body: [
        'The three-day line came from the logs. People who resumed within two days mostly kept going; past three, scrub-backs tripled. So the Previously card only appears after three days, and never for episodes paused in the first ten minutes.',
        'Producers were the real constraint. Tamsin Reyes, who produces Workbench, gave me ten minutes per episode as the budget. A recap you can hear in 30 seconds is about 75 words, so the recap field in their show-notes template has a 75-word limit and a running count. The last line you heard comes from the transcript, so it costs producers nothing.'
      ]
    },
    {
      type: 'image',
      image: images.flow,
      alt: 'Three steps of resuming: the library with a Workbench episode marked Recap waiting, the Previously card with the recap and the last line heard, and the player picking up at 51:09.',
      caption: 'Six days away. The library flags the recap, the card fills you in, and the player picks up at 51:02.'
    },
    {
      type: 'quote',
      quote:
        'I wrote chapter titles for show notes for six years and I’m fairly sure nobody read them. Now they’re what people put their thumb on, so I write them like headlines. The recap takes me ten minutes, usually while the export runs.',
      name: 'Tamsin Reyes',
      title: 'Producer, Workbench'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.episode,
          alt: 'The episode page for Workbench episode 41: artwork, title, a short description, a Resume at 51:02 button, and chapters 3 to 7 as a contents list.'
        },
        {
          image: images.recap,
          alt: 'The Previously card while the recap plays: the first sentences are lit as Miriam reads them, with 0:12 of 0:30 elapsed and a Skip to 51:02 button.'
        }
      ],
      caption:
        'Hosts record the recap in the same session as the ad reads. Words light up as Miriam reads them, so you can follow along or read ahead.'
    },
    {
      type: 'metrics',
      items: [
        { value: '+22%', label: 'Episode completion', detail: 'against the old player, 12 weeks' },
        { value: '−40%', label: 'Scrub-back events', detail: 'per resumed session' },
        { value: '70%', label: 'Episodes with a recap', detail: 'optional, written by producers' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'Chapters work because Long Wave’s producers write good ones. Shows syndicated from outside the network arrive without chapters, and their timeline falls back to a plain line. The next step is drafting chapters from the transcript for producers to edit, not to publish unedited: the titles are the interface now, and a vague one costs a listener a wrong jump.'
      ]
    }
  ]
};

export default longWave;
