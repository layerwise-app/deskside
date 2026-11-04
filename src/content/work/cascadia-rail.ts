import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './cascadia-rail/images';
import journey from './cascadia-rail/journey.mp4';

const cascadiaRail: CaseStudy = {
  slug: 'cascadia-rail',
  title: 'Cascadia Rail',
  key: 'Cascadia',
  kind: 'Train ticket app',
  summary:
    'A regional rail app where the date picker shows every day’s fare and the ticket finds its own platform.',
  client: 'Cascadia Rail, Portland',
  year: '2025',
  role: 'Lead product designer',
  team: [
    'Imani Okafor, product',
    'Ben Takeda, iOS',
    'Rosa Delgado, payments',
    'Walt Kerrigan, conductor operations'
  ],
  color: { bg: '#0E4D57', fg: '#F4F1E8', accent: '#F6C445' },
  cover: {
    image: images.cover,
    alt: 'Two Cascadia Rail screens: a March fare calendar for Portland to Seattle with the $29 days filled in yellow, and a live ticket for train 507 showing Platform 3, Car 4, Seat 12A.'
  },
  problem:
    'Booking a ticket took seven screens, and the price showed up on the fifth. Fares change by the day, so riders who had already picked a date, a train and a seat found out it cost $56 instead of $29, and 40% of them left right there. The ones who paid got a PDF that conductors had to pinch and zoom in a swaying aisle.',
  decisions: [
    {
      title: 'Put the price on the calendar',
      body: 'The first screen after the route is the month, and every day shows its lowest one-way fare. The cheapest days are filled in signal yellow, so a rider who can move a day sees the $29 Tuesday before committing to the $56 Friday. Date and price became one decision instead of a surprise at step five.'
    },
    {
      title: 'Ask how people ride, not which seat',
      body: 'Almost nobody wanted 12A in particular; they wanted a window, the quiet car, or to sit near their bike. Four switches, saved for next time, choose the seat, and the map is one tap away. In testing, seven riders in eight never opened it.'
    },
    {
      title: 'A ticket that keeps up with the train',
      body: 'The ticket fills in its platform when dispatch assigns one, about 20 minutes before departure, so nobody has to stand under the departures board. For the conductor it turns into scan mode: full brightness, car and seat in huge type, and a code that reads at arm’s length.'
    }
  ],
  outcome:
    'Median booking time fell from 2 minutes 40 seconds to 28 seconds. Mobile’s share of ticket sales went from 31% to 64%, and conductors take 35% less time to check a full car.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Cascadia Rail runs eight trains each way between Portland and Seattle, and fewer south through Salem to Eugene. Its app sold 31% of tickets; the rest went through the website and station windows. Imani Okafor, who leads product, asked for two things: more people booking on their phones, and no more conductors squinting at PDFs.',
        'The old flow asked for stations, a date, passengers, a train, a seat and extras before it showed a price. Fares here move with the day and with how full a train is, so the number on step five was often a shock. The funnel put 40% of all drop-off on that one screen, more than the other six combined.'
      ]
    },
    {
      type: 'image',
      image: images.flow,
      alt: 'Three steps of booking: choosing Portland to Seattle, the eight trains on Thursday, March 12 with the $29 train 507 marked lowest, and the new ticket with its platform still to be posted.',
      caption:
        'Route, then day, then train. The fare calendar sits between the first two, and the ticket starts with a dashed platform the app fills in later.'
    },
    {
      type: 'beforeAfter',
      before: {
        image: images.before,
        alt: 'The old first step: empty origin, destination and date fields, passenger steppers, and a note that fares appear after seat selection.'
      },
      after: {
        image: images.after,
        alt: 'The new first step: March as a grid of days, each with its lowest fare, and five $29 days filled in yellow.'
      },
      labels: ['Before: step 1 of 7', 'After: the fare calendar'],
      caption: 'Drag to compare. The old first step asked for a date with no price; the new one is nothing but dates with prices.'
    },
    {
      type: 'text',
      heading: 'Keeping the price honest',
      body: [
        'A “from” price only helps if the fare still exists when you tap it. With Rosa Delgado on payments, we refresh the month every five minutes and drop the yellow mark when fewer than four seats are left at that fare, so riders are rarely promised a $29 day that turns out to be $33.',
        'The calendar cost us the combined round-trip picker. The return now gets its own calendar after the outbound train, one more screen for the 22% of trips that are round trips, in exchange for a month that stays readable on a phone.'
      ]
    },
    {
      type: 'demo',
      component: lazy(() => import('./cascadia-rail/demo')),
      title: 'Pick a day by its price',
      hint: 'Tap a day, choose a train and pay, then watch the ticket get its platform.',
      height: { mobile: 700, desktop: 780 },
      caption:
        'The demo skips ahead to departure morning. In service the platform posts about 20 minutes before the train leaves, and the ticket updates on its own.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.seats,
          alt: 'Seat preferences: window selected, quiet car, near the bike car and facing forward switched on, and a best match of Car 4, Seat 12A.'
        },
        {
          image: images.seatmap,
          alt: 'The optional seat map for Car 4, the quiet car, with seat 12A selected, taken seats shaded, and rows 7 to 9 facing backwards.'
        }
      ],
      caption: 'Preferences pick the seat. The map is still there for the one rider in eight who wants a particular one.'
    },
    {
      type: 'text',
      heading: 'Tickets for the conductor',
      body: [
        'I rode six shifts with conductors between Portland and Seattle. On a full Friday train, checking one 72-seat car took about 11 minutes, most of it spent zooming into PDFs and asking people to turn their brightness up. Walt Kerrigan, who runs conductor operations, said the line his crews hear most is “hang on, it’s loading.”',
        'Scan mode is built to be read at arm’s length in a moving aisle. The screen goes to full brightness, the car and seat are the biggest things on it, and a moving stripe and running clock show it is live rather than a screenshot. Once a ticket has its platform it also works with no signal.'
      ]
    },
    {
      type: 'pair',
      images: [
        {
          image: images.scan,
          alt: 'Scan mode on a white screen: Car 4 and Seat 12A in very large type above a square boarding code, with a moving stripe and a clock reading 8:22:14.'
        },
        {
          image: images.status,
          alt: 'Trip status for train 507: on time, near Centralia, with Olympia-Lacey next at 10:02 am and Seattle marked as the rider’s stop at 11:41 am.'
        }
      ],
      caption: 'One live ticket, two readers: the conductor in the aisle, and the rider watching for their stop.'
    },
    {
      type: 'quote',
      quote:
        'On a full Friday I used to be checking tickets until Olympia. Now people hold the phone up, I read the car and seat from three rows back, and I’m done before Kelso.',
      name: 'Deb Haugland',
      title: 'Conductor, Portland to Seattle, 19 years'
    },
    {
      type: 'video',
      src: journey,
      poster: images.journey,
      alt: 'A screen recording of one booking: a finger taps Thursday, March 12 at $29, picks train 507, pays $34, and the ticket appears with the platform to be posted. Two seconds later Platform 3 slides in, then scan mode shows Car 4, Seat 12A over a boarding code.',
      caption: 'One booking on the test build, from calendar to scan mode in fifteen seconds. Across the pilot the median rider took 28.'
    },
    {
      type: 'metrics',
      items: [
        { value: '28 s', label: 'Median booking time', detail: 'down from 2 min 40 s' },
        { value: '64%', label: 'Sales made on phones', detail: 'up from 31%' },
        { value: '−35%', label: 'Time to check a full car', detail: 'over six weeks of Friday trains' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'The calendar answers “when is it cheap?”, but weekly riders ask “when is it cheap for me?” The next version learns your usual train and marks days by that train’s fare instead of the day’s lowest. It matters most on Fridays, when the 5:40 am is cheap and nobody wants it.'
      ]
    }
  ]
};

export default cascadiaRail;
