import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './alder-card/images';

const alderCard: CaseStudy = {
  slug: 'alder-card',
  title: 'Alder Card',
  key: 'Alder',
  kind: 'Bank card',
  summary:
    'A number-free, upright debit card for an Oregon credit union, and an app where freezing a lost card takes one tap instead of a 14-minute phone hold.',
  client: 'Alder Credit Union, Oregon',
  year: '2023',
  role: 'Lead designer, card and app',
  team: ['Rosa Imbert, card production', 'Kenji Albright, iOS', 'Dee Okonkwo, fraud operations', 'Martin Szabo, compliance'],
  color: { bg: '#E8E4D8', fg: '#1E3A2C', accent: '#C59B4B' },
  cover: {
    image: images.cover,
    alt: 'The new Alder debit card, upright and forest green with a brass chip and no number, beside a phone showing its Card screen with a large Freeze button and four category locks.'
  },
  problem:
    'Alder members who lost a card had one way to stop it: call a branch and wait, 14 minutes on average. The card they were protecting had all sixteen digits embossed on the front, and fraud ops was logging more and more calls from people posing as Alder and asking members to read those digits out. The app did have spending limits, three screens deep, and fewer than 3% of members had ever opened them.',
  decisions: [
    {
      title: 'Take the number off the plastic',
      body: 'The front has the chip, the contactless mark, the member’s name and nothing worth photographing. Number, expiry and CVC live in the app behind Face ID and hide again after 30 seconds. That costs a step for anyone who types a card in online, which is the job the virtual card was made for.'
    },
    {
      title: 'Make Freeze the biggest thing on the screen',
      body: 'Freeze is one tap with five seconds to undo, and the card art frosts over so its state reads at a glance. I dropped the confirmation dialog: in testing, people who thought their card was stolen stalled at “Are you sure?”, and a mistaken freeze costs nothing to reverse. Bills already set up on the card keep going through.'
    },
    {
      title: 'Lock categories, not amounts',
      body: 'Four switches replaced the limits form: gambling, online, abroad and ATM. Each one says what still gets through, and a stopped charge shows up in activity with the lock that stopped it. Online shopping moved to a virtual card with its own number, which can be replaced in the app without new plastic.'
    }
  ],
  outcome:
    'In the first six months, freeze-related calls to branches fell 83%. 41% of members set at least one lock in their first month with the new card. Reissue costs fell by $212,000 a year, mostly because cards that turn up under a car seat the next morning are now unfrozen instead of cancelled.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Alder Credit Union has 38 branches across Oregon and about 210,000 members. In 2023 every debit card was due for reissue with a new chip vendor, which gave us one chance to change the plastic itself, not only the app. The catch: the vendor needed final art 14 weeks before the first cards shipped, so the card had to be finished before the app screens were.',
        'I spent two days at the Salem and Bend branches listening in on card calls. Most callers did not know whether the card was lost or just misplaced. They wanted to stop it now and decide later, and the only tool the branch had was cancel.'
      ]
    },
    {
      type: 'image',
      image: images.cards,
      alt: 'Front and back of the new card. The front is forest green with a tonal alder leaf, a brass chip, the Alder wordmark and the member’s name. The back has the magnetic stripe, a help number, and a line saying Alder will never call or text to ask for card details.',
      caption: 'Final art as sent to the vendor. The back says where the number went, and that we will never call to ask for it.'
    },
    {
      type: 'beforeAfter',
      before: {
        image: images['old-card'],
        alt: 'The 2016 card: landscape, glossy green with a mountain scene, and all sixteen digits, the expiry and the name embossed in raised silver type.'
      },
      after: {
        image: images['new-card'],
        alt: 'The 2023 card, upright on the same surface: chip, contactless mark, wordmark and name, and no number.'
      },
      labels: ['2016: embossed', '2023: number-free'],
      caption: 'Drag to compare. Everything a phone camera could lift from the old front is gone from the new one.'
    },
    {
      type: 'text',
      heading: 'What we gave up',
      body: [
        'A card without a number is only safe if members can still find the number when they need it. About 9% of members had never signed in to the app, most of them over 70. Martin in compliance and I settled on a tear-off slip in the card mailer with the number printed on it, and any branch can show it after ID. Four in a hundred new cardholders ask for the slip.'
      ]
    },
    {
      type: 'demo',
      component: lazy(() => import('./alder-card/demo')),
      title: 'Freeze, lock, reveal',
      hint: 'Freeze the card and undo it, flip a lock, or show the card details.',
      height: { mobile: 700, desktop: 780 },
      caption:
        'There is no “Are you sure?”. Five seconds of undo is quicker for the member who meant it and just as safe for the one who didn’t.'
    },
    {
      type: 'image',
      image: images.freeze,
      alt: 'Three screens: the card active; the same card frosted over with a Card frozen message and an Undo button; and the lost card screen, with a map of where the card was last used and options to unfreeze or replace it.',
      caption: 'After a freeze, the app shows where the card was last used. Six in ten frozen cards are unfrozen within two days.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.details,
          alt: 'The card details screen after Face ID: the card turned over to show its number, expiry and CVC, copy buttons for each, a 24-second countdown, and a warning that Alder will never call to ask for them.'
        },
        {
          image: images.virtual,
          alt: 'The virtual card screen: a pale brass card ending 7716 marked Virtual, a $300 monthly limit with $86.40 used, and an option to get a new number.'
        }
      ],
      caption: 'The number moved into the app. Online shopping moved to a second number that can be replaced in a tap.'
    },
    {
      type: 'quote',
      quote:
        'Monday mornings used to be cancellations for people who left a wallet at a brewery on Saturday. Now they freeze it from the parking lot, and by the time they call us they’ve usually found it.',
      name: 'Teresa Villanueva',
      title: 'Branch manager, Alder Credit Union, Salem'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.locks,
          alt: 'The Locks screen: gambling and abroad switched on, online and ATM off, each with a line on what it covers, and a list of what always goes through, such as bills and refunds.'
        },
        {
          image: images.activity,
          alt: 'The Activity screen: October spending split by category, then transactions with category icons, including a $412.60 charge from Guadalajara stopped by the Abroad lock with an Allow once option.'
        }
      ],
      caption: 'A stopped charge names the lock that stopped it, with Allow once right there, so a lock never strands someone at a till.'
    },
    {
      type: 'metrics',
      items: [
        { value: '−83%', label: 'Freeze-related branch calls', detail: 'first six months after launch' },
        { value: '41%', label: 'Members who set a lock', detail: 'in their first month with the card' },
        { value: '$212k', label: 'Saved on reissues each year', detail: 'cards unfrozen instead of cancelled' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'About half the freeze calls that still reach a branch come from someone trying to freeze a partner’s or a parent’s card on a joint account. Today each holder can only freeze their own. The next test lets either holder freeze any card on the account, with a notification to the other, while unfreezing stays with the card’s owner.'
      ]
    }
  ]
};

export default alderCard;
