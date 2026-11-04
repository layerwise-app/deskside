# Deskside

A portfolio template for product designers. The home page is one small 3D
scene: a beige 1980s computer and a glazed mug on a desk. A row of keys along
the bottom changes what's on the computer's screen. Click the screen and the
camera moves in and opens the case study as a normal page. Everything else is
plain, fast HTML: a text index of the work, case studies, About, and Contact.

The sample owner, Sam Ibarra, and all eight projects are fictional. Replace
them with your own (see [Make it yours](#make-it-yours)).

- **Home** (`/`): the desk. On phones, with reduced motion, or without WebGL,
  it's a plain text index that opens with a rendered still of the desk. Press
  <kbd>I</kbd> on the desk to switch between them.
- **Work** (`/work`): every project in one list.
- **Case study** (`/work/<slug>`): title, client, year, role, team, problem,
  decisions, outcome, then content blocks such as live demos, images, video,
  quotes, before/after sliders, and metrics.
- **About** (`/about`): bio, services, experience, clients, CV download.
- **Contact** (`/contact`): a form that saves to the database and can email you.

Built with TanStack Start, React, Three.js, and Tailwind CSS, on Cloudflare
Workers with a D1 database.

## Commands

```bash
pnpm dev                 # start the dev server (Layerwise runs this for you)
pnpm check-types         # TypeScript
pnpm lint                # oxlint
pnpm test                # vitest
pnpm build               # type check and production build
pnpm add-images <slug> <image...>         # prepare images for a case study
pnpm render-plates <slug> --url <dev url> --add   # render stills from React screens
pnpm favicons            # regenerate favicons from public/logo.svg
pnpm db:generate --name <change>          # after editing src/db/schema.ts
pnpm db:migrate          # apply migrations to the local database
```

## Make it yours

### 1. Your details

Open `src/portfolio.config.ts`. It holds your name, role, city and time zone
(the desk's clock shows your local time), the one-line tagline, the bio,
social links, the CV, fonts, colors, and the little "fortunes" shown in a
corner of the desk. Save and every page updates.

The About page's services, experience, and clients are in
`src/content/about.ts`.

Replace `public/sam-ibarra-cv.pdf` with your CV and point `cv.href` at it.

### 2. Replace the sample work

Each project is one file and one folder in `src/content/work/`:

```
src/content/work/
  index.ts             # finds every project; `order` sets the key order
  stoop.ts             # the case study: text, facts, and blocks
  stoop/               # its images, video, and React screens
```

To remove a sample project, delete both its `.ts` file and its folder, and
take its slug out of `order` in `src/content/work/index.ts`. Keep at least one
project. To start clean, delete all eight and add your own as below.

### 3. Add a project

1. **Prepare the images.** Export your screens as PNG or JPG (2× is ideal) and
   run:

   ```bash
   pnpm add-images harbor ~/Desktop/harbor/cover.png ~/Desktop/harbor/checkout.png
   ```

   This creates `src/content/work/harbor/`, writes WebP files at 800, 1600,
   and 2880 px wide (never larger than the original), and writes
   `src/content/work/harbor/images.ts` with each image's size and a tiny
   blurred placeholder. Run it again to add more images; it rewrites
   `images.ts` each time.

   - Name one image `cover`. It's shown on the computer's screen, at the top
     of the case study, and as the link preview (a 1200×630 `cover-og.jpg` is
     made from it). Landscape images around 16:10 fit the screen best.
   - Image names come from file names: `Checkout Flow.png` becomes
     `images['checkout-flow']`.
   - GIFs are copied as they are. SVGs are rejected; export them as PNG.

2. **Write the case study.** Create `src/content/work/harbor.ts`:

   ```ts
   import type { CaseStudy } from '~/content/types';
   import { images } from './harbor/images';

   const harbor: CaseStudy = {
     slug: 'harbor', // the address: /work/harbor
     title: 'Harbor',
     key: 'Harbor', // printed on the desk key: up to 12 characters, 10 fit everywhere
     kind: 'Ferry booking app',
     summary: 'A ferry booking app where the car deck fills up before your eyes.',
     client: 'Harbor Line, Bellingham',
     year: '2026',
     role: 'Lead product designer',
     team: ['Ana Ruiz, engineering', 'Tom Lee, product'],
     color: { bg: '#123C5A', fg: '#F2F0EA', accent: '#F4B740' },
     cover: { image: images.cover, alt: 'The Harbor app showing the car deck filling up.' },
     problem: 'Riders could not tell whether a car spot was left until they paid.',
     decisions: [
       { title: 'Show the deck', body: 'A live diagram of the car deck replaced the “limited” badge.' }
     ],
     outcome: 'Abandoned checkouts fell by a third in the first month.',
     blocks: [
       { type: 'text', heading: 'The problem', body: ['First paragraph.', 'Second paragraph.'] },
       { type: 'image', image: images.checkout, alt: 'Checkout with the deck diagram.', caption: 'Optional caption.' }
     ]
   };

   export default harbor;
   ```

3. **Place its key.** Add `'harbor'` to `order` in
   `src/content/work/index.ts` where you want it. Projects not listed go at
   the end.

That's all. The project now has a key on the desk (the first ten projects
get keys), a row in the index and on `/work`, its own page at `/work/harbor`,
and an entry in `/sitemap.xml`.

### 4. Content blocks

`blocks` is a list. Use any of these, in any order. Every image needs `alt`
text describing what it shows.

```ts
{ type: 'text', heading: 'Optional heading', body: ['Paragraph', 'Paragraph'] }
{ type: 'image', image: images.flow, alt: '…', caption: '…', bleed: true } // bleed: full page width
{ type: 'pair', images: [{ image: images.a, alt: '…' }, { image: images.b, alt: '…' }], caption: '…' }
{ type: 'video', src: video, poster: images.videoPoster, alt: 'What happens in the video', caption: '…' }
{ type: 'demo', component: lazy(() => import('./harbor/demo')), title: '…', hint: 'What to try', height: { mobile: 700, desktop: 780 } }
{ type: 'quote', quote: '…', name: 'Deb Haugland', title: 'Conductor' }
{ type: 'beforeAfter', before: { image: images.before, alt: '…' }, after: { image: images.after, alt: '…' }, labels: ['Before', 'After'] }
{ type: 'metrics', items: [{ value: '28 s', label: 'Median booking time', detail: 'down from 2 min 40 s' }] }
```

`beforeAfter` needs two images of the same size. Every type is defined, with
comments, in `src/content/types.ts`.

### 5. Live demos

A live demo is a working piece of your product, mounted on the case study
page. Write it as a React component in the project's folder with a default
export, for example `src/content/work/harbor/demo.tsx`, and add a block:

```ts
import { lazy } from 'react';
// …
{
  type: 'demo',
  component: lazy(() => import('./harbor/demo')),
  title: 'Book a car spot',
  hint: 'Pick a sailing and watch the deck fill.',
  height: { mobile: 700, desktop: 780 } // reserved space, so the page never jumps
}
```

Demos load only when the page needs them. Wrap phone screens in
`<Phone fit>` from `~/components/frames/Phone` to get a device frame that
scales to the space. Keep demos self-contained (no network calls), usable with
a keyboard, and still when `prefers-reduced-motion` is set. The sample demos
in each project folder show the patterns.

### 6. Swap a live demo for an image or a video

Not every project needs code. Replace the `demo` block with an `image` block
(see above), or with a video:

1. Export a muted H.264 MP4, ideally under 5 MB. Short loops of 10 to 20
   seconds work best. To make one from a screen recording:

   ```bash
   ffmpeg -i recording.mov -vf "scale=1920:-2,format=yuv420p" -c:v libx264 -crf 24 -preset slow -an -movflags +faststart src/content/work/harbor/walkthrough.mp4
   ```

2. Save its first frame and add it as the poster:

   ```bash
   ffmpeg -i src/content/work/harbor/walkthrough.mp4 -vframes 1 walkthrough-poster.png
   pnpm add-images harbor walkthrough-poster.png
   ```

3. Import the video and use a `video` block:

   ```ts
   import walkthrough from './harbor/walkthrough.mp4';
   // …
   { type: 'video', src: walkthrough, poster: images['walkthrough-poster'], alt: 'A rider books a car spot…' }
   ```

Videos play muted and looping while on screen, have a pause button, and stay
paused on their poster with reduced motion. Cascadia Rail's case study has an
example.

### 7. Stills from React screens (optional)

The sample projects draw their screens as React components, so the stills
and the live demos always match. To do the same, list stills in
`src/content/work/<slug>/plates.tsx` (see any sample project), then, with the
dev server running:

```bash
pnpm render-plates harbor --url http://127.0.0.1:5173 --add
```

This screenshots each plate at 2× from `/dev/plates/<slug>/<plate>` (a page
that exists only in development) and passes the PNGs to `add-images`. Use the
address your dev server prints. It uses Chrome if it's installed, or run
`pnpm exec playwright install chromium` once.

### 8. Fonts

The site uses IBM Plex Sans and IBM Plex Mono, served from `public/fonts/`.
To change them:

1. Put the `.woff2` files in `public/fonts/` (and their license next to them
   in `public/fonts/licenses/`).
2. Update `fonts` in `src/portfolio.config.ts`: the family name, each file
   with its weight (`'400'`, or `'100 700'` for a variable font) and style,
   and a fallback stack.

The `@font-face` rules and preload links are generated from the config.
`sans` sets all text; `mono` sets the small labels, the keys, and the
computer's screen.

### 9. Colors

`colors` in `src/portfolio.config.ts`:

- `paper`, `paperDeep`: the background and the studio sweep behind the desk.
- `ink`, `muted`: text. Keep both at 4.5:1 contrast or more on `paper`.
- `line`: hairlines. `accent`: the light on the selected key and small marks.
- `beige`, `glaze`, `desk`: the computer, the mug, and the desk in the 3D scene.

Each project's `color` (`bg`, `fg`, `accent`) colors its screen on the desk and
the top of its case study. Keep `fg` readable on `bg`.

### 10. The contact form

Messages are checked on the server (name, a valid email, 10 to 5,000
characters), then saved to the `contact_messages` table. See them in the
Database tab in Layerwise. A hidden field catches bots, which get a normal
"thanks" but are not saved. Each visitor can send 3 messages per 10 minutes
and 10 per day; limits are kept by a hash of their IP address, never the
address itself.

To be emailed each message, set `ownerEmail` in `src/portfolio.config.ts`. The
email's reply-to is the sender, so you can answer straight from your inbox.
In the local preview, emails land in Email → Local in Layerwise instead of
being sent. Real email starts after the site is published.

### 11. Search and sharing

Every page has its own title and description. `/sitemap.xml` lists every
page and case study, and the site describes its owner to search engines as a
`Person` (from `src/portfolio.config.ts`).

- Link previews use `public/og-image.jpg` (1200×630) for the home, Work,
  About, and Contact pages, and each project's cover for its case study.
- When you connect a custom domain, set `url` in `src/lib/site.ts` to it.

### 12. Logo and icons

The logo is `public/logo.svg`: a Deskside key with its light on. To use your
own, replace it (a square SVG that reads at 32 px) and run `pnpm favicons`.
That writes `public/logo.png` at 1024×1024 and every favicon and app icon
from it, including `public/android-chrome-512x512.png`, which Layerwise uses
as the project's avatar. The app manifest (`/site.webmanifest`) takes its name
and colors from `src/portfolio.config.ts`.

## How the desk works

The scene is modeled in code with Three.js, with no downloaded models, in
`src/components/desk/scene/`. The computer's screen is a canvas texture
showing the selected project's cover; changing projects plays a short CRT
channel change. The camera drifts with the pointer, and dragging turns the
desk a little before it springs back. It renders only when something moves,
and stops entirely when the tab or the desk is out of view.

On the desk:

| Key | Action |
| --- | --- |
| <kbd>1</kbd>–<kbd>9</kbd>, <kbd>0</kbd> | Select a project |
| <kbd>←</kbd> <kbd>→</kbd> | Previous or next project |
| <kbd>Enter</kbd> | Open the selected project |
| <kbd>I</kbd> | Switch between the desk and the text index |
| <kbd>Esc</kbd> | On a case study, return to the desk |

Below 768 px wide, with `prefers-reduced-motion`, or without WebGL, the home
page is the text index instead.

## Project structure

```
src/
  portfolio.config.ts      # you: name, bio, links, fonts, colors
  content/
    about.ts               # About page lists
    types.ts               # CaseStudy and Block types
    work/                  # case studies (one .ts + one folder each)
  components/
    desk/                  # the home page desk and the 3D scene
    case/Blocks.tsx        # content block renderers
    frames/Phone.tsx       # device frame for screens and demos
    site/                  # header, footer, clock, links
  routes/                  # pages
  lib/contact*.ts          # contact form rules and server function
  db/schema.ts             # the contact_messages table
scripts/
  add-images.mjs           # image pipeline
  render-plates.mjs        # stills from React screens
  favicons.mjs             # icons from public/logo.svg
public/
  fonts/                   # self-hosted fonts and their licenses
```

## Fonts and licenses

All fonts are self-hosted from `public/fonts/` and licensed under the SIL Open
Font License 1.1. License texts are in `public/fonts/licenses/`.

| Font | Used for |
| --- | --- |
| [IBM Plex Sans](https://github.com/IBM/plex) | Site text |
| [IBM Plex Mono](https://github.com/IBM/plex) | Labels, keys, the computer's screen |
| [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) | Stoop sample screens |
| [Fraunces](https://github.com/undercasetype/Fraunces) | Long Wave sample screens |
| [Archivo](https://github.com/Omnibus-Type/Archivo) | Ebb sample screens |
| [Schibsted Grotesk](https://github.com/schibsted/schibsted-grotesk) | Alder Card sample screens |
| [Newsreader](https://github.com/productiontype/Newsreader) | Alder Card and Margin sample screens |
| [Outfit](https://github.com/Outfitio/Outfit-Fonts) | Nook sample screens |
| [Overpass](https://github.com/RedHatOfficial/Overpass) | Cascadia Rail and Swatchbook sample screens |

The sample-screen fonts are only downloaded on the pages that use them. If you
delete the sample projects, you can delete their fonts and their
`@font-face` rules in `src/styles/project-fonts.css`.
