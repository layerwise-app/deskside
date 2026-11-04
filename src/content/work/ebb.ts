import { lazy } from 'react';
import type { CaseStudy } from '~/content/types';
import { images } from './ebb/images';

const ebb: CaseStudy = {
  slug: 'ebb',
  title: 'Ebb',
  key: 'Ebb',
  kind: 'Fitness tracker',
  summary:
    'A screenless band and app that tell runners what to do today in one sentence, and keep the week inside a healthy range instead of chasing a daily score.',
  client: 'Ebb Labs, Portland',
  year: '2024',
  role: 'Design lead, app and band',
  team: [
    'Jonah Reyes, hardware',
    'Ilse Varga, firmware',
    'Kenji Moreau, iOS',
    'Amara Lind, sports physiologist'
  ],
  color: { bg: '#0F110D', fg: '#EEF3E2', accent: '#C6F26B' },
  cover: {
    image: images.cover,
    alt: 'Two phone screens from Ebb: Friday’s readiness, which says “Go easy today” because resting heart rate is 6 bpm above normal, and the week’s planned load of 428 inside a 320 to 480 corridor.'
  },
  problem:
    'Ebb’s first band shipped with the usual daily strain score, and people chased it. They trained hard to turn a day green, skipped rest to keep a streak, and wrote in when the number dropped: “why is my score low?” was 30% of all support tickets. Our physiologist was seeing the overuse injuries the score was supposed to prevent.',
  decisions: [
    {
      title: 'Say readiness in one sentence',
      body: 'The morning screen no longer shows a number out of 100. It says what to do and why: “Go easy today. Your resting heart rate is 6 bpm above your 30-day normal.” The two signals behind it, resting heart rate and HRV, sit underneath with their normal range. Longtime wearers missed the score, so it stayed one tap away for a month; fewer than 4% ever opened it.'
    },
    {
      title: 'A weekly corridor, not daily targets',
      body: 'Load counts against a range built from your last four weeks, 0.8 to 1.2 times your average. Any single day can be big or small; what matters is where Sunday lands. Planned workouts show in the corridor before you do them, so an overreaching week is visible on Friday instead of after the injury.'
    },
    {
      title: 'Three LEDs, no screen',
      body: 'Hardware had a small OLED working, and every layout we tried on it became a smaller score. Three LEDs can’t show a number. Tap once for today, twice for where the week is heading. Dropping the display took projected battery life from 4 days to 9.'
    }
  ],
  outcome:
    'In the 16 weeks after launch, “why is my score low” tickets fell 71%. Four-week retention of new wearers rose 18%, from 54% to 64%. In an opt-in survey of 1,240 wearers, self-reported overuse injuries fell 34% against the same group’s previous quarter.',
  blocks: [
    {
      type: 'text',
      heading: 'The brief',
      body: [
        'Ebb Labs is a twelve-person wearables company in Portland. Its band is for recreational runners and riders: people training for a half marathon or a gravel century, not professionals. The founders asked me to redesign the app around the question their support inbox kept asking, some version of “why is my score low?”',
        'I read 400 of those tickets and sat in on six coaching sessions with Amara, our physiologist. The score wasn’t wrong; it was being used as a target. A daily number invites you to beat it every day, and training doesn’t work that way. Hard days need easy days after them, and the unit that matters is the week.'
      ]
    },
    {
      type: 'image',
      image: images.mornings,
      alt: 'Three mornings in Ebb. Tuesday: “Ready for a hard day,” resting heart rate and HRV both normal, three lights on the band. Thursday: “A normal day,” HRV a little low, two lights. Friday: “Go easy today,” resting heart rate 6 bpm above normal, one coral light.',
      caption:
        'The same screen on three mornings. The sentence changes; the two signals underneath always say why.'
    },
    {
      type: 'demo',
      component: lazy(() => import('./ebb/demo')),
      title: 'Plan Saturday’s long run',
      hint: 'Drag Saturday’s bar or use the arrow keys, and watch the week total and Sunday’s sentence. When the week goes over, try Rest on Sunday.',
      height: { mobile: 700, desktop: 780 },
      caption:
        'The week tips over at 22 km. The fix depends on how far over you are: rest on Sunday for a small overshoot, a shorter Saturday for a big one.'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.week,
          alt: 'The week screen with Saturday’s long run at 24 km. The week total of 504 shows in coral, 24 over the 320 to 480 range, and Sunday’s sentence reads “Make Sunday a rest day.”'
        },
        {
          image: images.plan,
          alt: 'The training plan for the Wildwood 30K: a stepped corridor rising from August to November, with each week’s load as a dot inside it and one September week above it at 492.'
        }
      ],
      caption:
        'The corridor follows your last four weeks, so it rises as you get fitter. The one week over was a trail race on top of a full long run.'
    },
    {
      type: 'text',
      heading: 'Three lights',
      body: [
        'The band was going to have a screen. Jonah had a 0.9-inch OLED running in the first prototype, and every screen we designed for it turned into a smaller version of the score. Three LEDs can’t show a number, which settled the argument.',
        'Tap once and they show today: three for ready, two for a normal day, one coral for go easy. Tap twice and they show the week: left for under, middle for inside the corridor, right for over. In testing, 11 of 12 people could read both patterns after a day without opening the app.'
      ]
    },
    {
      type: 'image',
      image: images.hardware,
      alt: 'A drawing of the Ebb band, a chalk-colored knit strap with a dark pod showing one coral light, next to the app’s Band screen that explains the light patterns for today and for the week. Below the band, the pod’s underside with its optical heart rate sensor and two charging pins.',
      caption:
        'One coral light on Friday morning means go easy. The Band screen is the only place the patterns are spelled out, and most people visit it once.'
    },
    {
      type: 'quote',
      quote:
        'My runners used to show up wrecked on Tuesdays because an app told them Sunday was a green day. Now they ask me whether their week is in the corridor, which is the question I wanted them asking all along.',
      name: 'Rosa Delgado',
      title: 'Run coach, Eastside Distance Project'
    },
    {
      type: 'pair',
      images: [
        {
          image: images.workout,
          alt: 'Tuesday’s interval session: a heart rate line colored by zone with six peaks for six 800 m reps, minutes in each zone, rep splits from 2:58 down to 2:52, and the week’s load so far.'
        },
        {
          image: images.sleep,
          alt: 'Thursday night’s sleep: 6 hours 41 minutes, a chart of deep, light, REM and awake stages, overnight heart rate bottoming at 55, and a suggested 10:45 pm bedtime before Saturday’s long run.'
        }
      ],
      caption:
        'Workouts and sleep feed the same two signals. Both screens end with what they mean for the week, not with a grade.'
    },
    {
      type: 'metrics',
      items: [
        { value: '−71%', label: '“Why is my score low?” tickets', detail: 'were 30% of all support tickets' },
        { value: '+18%', label: 'Four-week retention', detail: '54% to 64% of new wearers' },
        { value: '−34%', label: 'Self-reported overuse injuries', detail: '12-week survey of 1,240 wearers' }
      ]
    },
    {
      type: 'text',
      heading: 'What I would do next',
      body: [
        'The corridor counts a run and a ride as the same kind of load, and they aren’t: two hours on the bike leaves your legs far fresher than two hours on the road. Amara and I are testing a version that tracks impact separately, so a triathlete’s week can be full without reading as over.'
      ]
    }
  ]
};

export default ebb;
