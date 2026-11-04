import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './nook/images';

const nook: CaseStudy = {
  slug: 'nook',
  title: 'Nook',
  key: 'Nook',
  kind: 'Smart home remote',
  summary:
    'A palm-sized remote with one dial and four labeled keys that runs a home’s lights, heat, and music, so guests and grandparents can use it too.',
  client: 'Nook Home, Portland',
  year: '2023',
  role: 'Product designer, hardware interface and app',
  team: [
    'Ines Carvalho, industrial design',
    'Tomás Reyes, firmware',
    'Hana Kobayashi, iOS',
    'Dmitri Volkov, Android'
  ],
  color: { bg: '#E7E1D7', fg: '#2B2724', accent: '#FF7A3D' },
  cover: {
    image: images.cover,
    alt: 'The charcoal Nook remote with its light ring lit and the Dinner key on, beside a phone showing the Rooms screen with six rooms and the remote located in the living room.'
  },
  problem:
    'The households we visited ran lights, heat, and music from five or more apps, and only the person who installed them could use any of them. Guests texted from the spare room to ask how to turn the heat up. One grandmother left every lamp on overnight rather than ask for her son’s phone. Nook Home had a crowdfunding date, a $79 price, and a remote that had to work for someone who never set it up.',
  decisions: [
    {
      title: 'One dial that knows which room it is in',
      body: 'Ultra-wideband radios in the remote, its charging base, and two plug-in beacons place it to within about three feet, so the dial always turns the room you are standing in. There is no room picker and no menu. A ring of light around the dial fills to the level, so you can read it from the sofa. The radio added $6 to the bill of materials, and we paid for it by cutting the screen.'
    },
    {
      title: 'Four keys with labels you write',
      body: 'Scenes live on four physical keys whose e-ink labels are set from the app and hold with no power, so a key still says Away after a month in a drawer. We shipped them as Morning, Dinner, Movie, and Away. In the first week, 61% of households renamed at least one, usually to a routine of their own, like Homework or Bath.'
    },
    {
      title: 'The app’s dial is the same dial',
      body: 'On the phone the dial is drawn at the remote’s real size, turns the same way under one finger, and the same press switches between heat, lights, and music. The number sits under the dial on both, not inside it, so people learn to read the ring. What someone learns on one works on the other.'
    }
  ],
  outcome:
    'Across the first 2,100 homes, households use Nook 14 times a day, and 92% of those changes happen on the remote rather than a phone. The campaign closed at 6,200 backers, 3.1 times its goal.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Nook Home was four people and a foam prototype when they brought me in: a pebble meant to replace the drawer of apps that runs a modern house. I owned everything you touch, on the hardware and in the app, with a crowdfunding launch eleven months out and a $79 retail price to hit.',
        'I spent the first month in 14 homes around Portland. The person who installed the lights, the thermostat, and the speakers could run them, from five or more apps. Guests, kids, and grandparents could run none of them. The brief became one sentence: the person who did not set it up should get it right on the first try.'
      ]
    },
    {
      type: 'image',
      image: images.hardware,
      alt: 'The Nook remote in charcoal with callouts: an endless dial in a recessed well, a light ring filled three quarters of the way, three mode lights for lights, heat, and music, and four keys with e-ink labels. Beside it, the clay finish, 64 by 96 millimetres and 118 grams.',
      caption: 'Two finishes, one layout. The first prototype had a color screen in the dial; cutting it paid for the room-sensing radio.'
    },
    {
      type: 'text',
      heading: 'Fewer things, each one physical',
      body: [
        'Early prototypes had a round screen in the dial and a list of rooms to scroll. In testing, people who had not set it up spent their first minute reading. When we replaced the screen with a ring of light and let the remote work out which room it was in, strangers to the house got the heat right on the first try 19 times in 20, up from 9.',
        'The dial does one thing at a time. Pressing it steps through lights, heat, and music, and a small light shows which one you are turning. The knob only moves when a hand moves it: when a scene changes the heat, the ring moves and the knob stays put, so the remote never looks like it is turning itself.'
      ]
    },
    {
      type: 'demo',
      component: lazy(() => import('./nook/demo')),
      title: 'Turn the dial, press a key',
      hint: 'Drag around the dial or use the arrow keys. Press the dial to switch what it controls, then try a key or carry the remote to another room.',
      height: { mobile: 650, desktop: 560 },
      caption: 'Scene keys move the ring, never the knob. Carry the remote to the kitchen and the same dial turns the kitchen.'
    },
    {
      type: 'image',
      image: images.mirror,
      alt: 'The charcoal remote beside a phone showing the living room in the Nook app. Both dials are the same size, both rings are filled to 69 degrees, and the Dinner key is lit on both.',
      caption: 'The app draws the dial at the remote’s real size, so what you learn on one transfers to the other.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.lights,
          alt: 'Living room lights in the app: all lights at 40%, warmth set to 2700 K, four lamps with their own levels and switches, and an automatic off at 11:30 pm.'
        },
        {
          image: images.scene,
          alt: 'Editing key 3: the four keys previewed with the third relabeled from Movie to Reading, a label field at 7 of 10 letters, and what the key does in each room.'
        }
      ],
      caption: 'The dial sets a room’s level and keeps each lamp’s share. A renamed key redraws on the remote in about two seconds.'
    },
    {
      type: 'quote',
      quote:
        'My son’s house had a tablet on the wall I was afraid to touch. This one I pick up and turn, and the living room gets warm. I pressed Movie by mistake once and the lights went down, and that was all that happened.',
      name: 'June Halvorsen',
      title: 'Beta tester, visiting family in St. Johns'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.energy,
          alt: 'The Energy screen for October: 361 kWh used for heat, 13% less than the year before, daily bars with a dip marked Away from the 13th to the 15th, use by room, and 438 changes, 403 of them on the remote.'
        },
        {
          image: images.setup,
          alt: 'Setup step 3 of 4: a floor plan with the living room, kitchen, and hall learned, and the bedroom highlighted while the app waits for a press of the dial there.'
        }
      ],
      caption: 'Setup takes about four minutes: walk the remote to each room and press the dial once.'
    },
    {
      type: 'metrics',
      items: [
        { value: '14', label: 'Uses per household a day', detail: 'first 90 days, 2,100 homes' },
        { value: '92%', label: 'Changes made on the remote', detail: 'not on a phone' },
        { value: '6,200', label: 'Backers', detail: '3.1× the campaign goal' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'The remote only knows a room once someone walks it there during setup, and one household in six skipped a room they rarely use. Next I would let it learn a room the first time the dial is pressed there, and ask about it afterwards instead of up front.'
      ]
    }
  ]
};

export default nook;
