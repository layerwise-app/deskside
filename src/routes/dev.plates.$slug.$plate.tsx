import { createFileRoute, notFound } from '@tanstack/react-router';
import type { ComponentType } from 'react';
import type { Plates } from '~/content/plates';

// Development only: renders one still from a project's `plates.tsx` so
// `pnpm render-plates` can screenshot it, or the project's live demo alone at
// `/dev/plates/<slug>/_demo`. Production builds drop both and answer 404.
const modules: Record<string, { plates: Plates }> = import.meta.env.DEV
  ? import.meta.glob<{ plates: Plates }>('../content/work/*/plates.tsx', {
      eager: true
    })
  : {};
const demos: Record<string, { default: ComponentType }> = import.meta.env.DEV
  ? import.meta.glob<{ default: ComponentType }>('../content/work/*/demo.tsx', {
      eager: true
    })
  : {};

function platesFor(slug: string) {
  return modules[`../content/work/${slug}/plates.tsx`]?.plates;
}

export const Route = createFileRoute('/dev/plates/$slug/$plate')({
  loader: ({ params }) => {
    if (!import.meta.env.DEV) throw notFound();
    const plates = platesFor(params.slug);
    const special = params.plate === '_list' || params.plate === '_demo';
    if (!plates || (!special && !plates[params.plate])) {
      throw notFound();
    }
  },
  head: () => ({
    meta: [{ title: 'Plate' }, { name: 'robots', content: 'noindex' }]
  }),
  component: PlatePage
});

function PlatePage() {
  const { slug, plate } = Route.useParams();
  const plates = platesFor(slug)!;
  if (plate === '_list') {
    const list = Object.entries(plates).map(([name, p]) => ({
      name,
      width: p.width,
      height: p.height
    }));
    return <pre id='plates'>{JSON.stringify(list)}</pre>;
  }
  if (plate === '_demo') {
    // The live demo on its own, for trying it and recording videos.
    const Demo = demos[`../content/work/${slug}/demo.tsx`]?.default;
    return (
      <div
        data-plate-ready
        style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#EEEEEB' }}
      >
        {Demo ? <Demo /> : <p>No demo.tsx in this folder.</p>}
      </div>
    );
  }
  return <div data-plate-ready>{plates[plate].render()}</div>;
}
