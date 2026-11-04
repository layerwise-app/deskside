import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './stoop/images';

const stoop: CaseStudy = {
  slug: 'stoop',
  title: 'Stoop',
  key: 'Stoop',
  kind: 'Marketplace',
  summary:
    'A neighborhood resale app where listing a dresser takes three photos and pickup is booked like a table.',
  client: 'Stoop, Portland',
  year: '2025',
  role: 'Lead product designer',
  team: ['Priya Natarajan, product', 'Theo Brandt, iOS', 'Lena Ocampo, Android', 'Marcus Hale, backend'],
  color: { bg: '#F3EADB', fg: '#2A211B', accent: '#E4572E' },
  cover: {
    image: images.cover,
    alt: 'Two phone screens from Stoop: a feed of furniture for sale near Sellwood, and a walnut dresser listed for $85.'
  },
  problem:
    'Stoop had plenty of buyers and not enough listings. Sellers quit a nine-field form at a rate of 58%, and the ones who finished then lost Saturdays to buyers who never showed: one planned pickup in three ended with a dresser still on the porch.',
  decisions: [
    {
      title: 'Start with the camera, not a form',
      body: 'Listing opens on three guided shots. From the photos and 40,000 past sales, Stoop fills in the title, category, and a price range. Every field is still editable, but most sellers just tap Post.'
    },
    {
      title: 'Show prices as what actually sold nearby',
      body: 'A single suggested price felt like the app guessing. A bar of what similar items sold for within two miles gave sellers a reason to trust it and buyers a reason not to haggle.'
    },
    {
      title: 'Book pickup like a table',
      body: 'Sellers set two-hour windows when they will be home. Buyers pick one and put down a $5 hold that comes back at pickup. No more “is this still available?” threads that go nowhere.'
    }
  ],
  outcome:
    'Median time to list fell from 4 minutes 10 seconds to 52 seconds. Pickup no-shows dropped from 31% to 9%, and weekly new listings grew 2.4× in the ten weeks after launch.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Stoop started as a neighborhood email list in Sellwood and grew into an app for about 30,000 people on Portland’s east side. The founders asked for one thing: more stuff to buy. Their research said sellers were the bottleneck, and the form was the obvious suspect.',
        'Shadowing six sellers showed the form was only half of it. People would happily write a description; what they hated was pricing something they had no feel for, and then waiting around for a stranger who might not come.'
      ]
    },
    {
      type: 'image',
      image: images.flow,
      alt: 'Three steps of listing on Stoop: a camera with a framing guide, a review screen with every field filled in, and the finished listing.',
      caption: 'Three photos, one review, posted. The framing guide asks for a front, a detail, and a wide shot.'
    },
    {
      type: 'beforeAfter',
      before: {
        image: images.before,
        alt: 'The old listing form: nine empty required fields and a disabled Next button.'
      },
      after: {
        image: images.after,
        alt: 'The new review screen: photos at the top, title, category, condition, and price already filled in.'
      },
      labels: ['Before: nine fields', 'After: one review'],
      caption: 'Drag to compare. The old form asked for photos last; the new flow starts with them and works backwards.'
    },
    {
      type: 'demo',
      component: lazy(() => import('./stoop/demo')),
      title: 'Book a porch pickup',
      hint: 'Pick a day and a window, then hold it. You can change the time afterwards.',
      height: { mobile: 700, desktop: 780 },
      caption:
        'Taken windows stay visible but struck through, so buyers can see the seller is real and busy, not ignoring them.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.feed,
          alt: 'The Nearby feed: a two-column grid of a dresser, a rattan chair, a monstera, and a road bike with prices and distances.'
        },
        {
          image: images.detail,
          alt: 'A listing page for a walnut dresser at $85, with a bar showing similar dressers sold nearby for $60 to $95.'
        }
      ],
      caption: 'Porch pickup is a filter and a promise: only items with open windows carry the badge.'
    },
    {
      type: 'quote',
      quote:
        'I used to price everything at twenty dollars and hope. Now I can see the dresser down the street went for ninety, so I ask eighty-five and it’s gone by Sunday.',
      name: 'Ruth Alvarado',
      title: 'Seller in Sellwood, 23 pickups'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.pickup,
          alt: 'Choosing a pickup window: Saturday selected, with 10 to 12 highlighted and 4 to 6 already booked.'
        },
        {
          image: images.confirm,
          alt: 'A booked pickup card with the time, the porch address, and a message from the seller.'
        }
      ]
    },
    {
      type: 'metrics',
      items: [
        { value: '52 s', label: 'Median time to list', detail: 'down from 4 min 10 s' },
        { value: '9%', label: 'Pickup no-shows', detail: 'down from 31%' },
        { value: '2.4×', label: 'Weekly new listings', detail: 'ten weeks after launch' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'The $5 hold works, but it adds a payment step that scares off some first-time buyers. The next test makes the hold optional for buyers with three completed pickups, so trust is earned once and then gets out of the way.'
      ]
    }
  ]
};

export default stoop;
