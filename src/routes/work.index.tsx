import { createFileRoute, Link } from '@tanstack/react-router';
import { randomFortune } from '~/components/site/Fortune';
import { PageShell } from '~/components/site/PageShell';
import { Picture } from '~/components/site/Picture';
import { work } from '~/content/work';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

const pad = (n: number) => String(n).padStart(2, '0');

export const Route = createFileRoute('/work/')({
  loader: () => ({ fortune: randomFortune() }),
  head: () =>
    seo({
      title: `Work — ${portfolio.name}`,
      description: `Case studies by ${portfolio.name}: ${work
        .slice(0, 4)
        .map((c) => c.kind.toLowerCase())
        .join(', ')}, and more.`,
      path: '/work'
    }),
  component: WorkPage
});

function WorkPage() {
  const { fortune } = Route.useLoaderData();
  const years = work.map((c) => Number(c.year)).filter(Boolean);
  return (
    <PageShell fortune={fortune}>
      <header className='grid-page mt-16 md:mt-24'>
        <p className='label col-span-3 mt-3 text-muted'>
          {pad(work.length)} projects
          <br />
          {Math.min(...years)}–{Math.max(...years)}
        </p>
        <div className='col-span-9 col-start-4 max-md:mt-4'>
          <h1 className='text-[clamp(52px,8vw,124px)] leading-[0.9] font-medium tracking-[-0.05em]'>Work</h1>
          <p className='mt-6 max-w-[36ch] text-[clamp(21px,2.2vw,30px)] leading-[1.22] tracking-[-0.018em] text-balance'>
            Products built around one interaction worth getting right. Every case study has a working piece you can try.
          </p>
        </div>
      </header>

      <ol role='list' className='mt-16 px-[var(--gutter)] md:mt-24'>
        {work.map((c, i) => (
          <li key={c.slug} className='border-t border-line last:border-b'>
            <Link to='/work/$slug' params={{ slug: c.slug }} className='group work-row'>
              <span className='label text-muted'>{pad(i + 1)}</span>
              <span className='work-thumb overflow-hidden rounded-[3px]' style={{ background: c.color.bg }}>
                <Picture
                  image={c.cover.image}
                  alt=''
                  sizes='(min-width: 768px) 320px, 100vw'
                  className='transition-transform duration-500 ease-out group-hover:scale-[1.03]'
                />
              </span>
              <span className='work-text'>
                <span className='block text-[clamp(28px,3.2vw,44px)] leading-none font-medium tracking-[-0.035em]'>
                  {c.title}
                </span>
                <span className='mt-3 block max-w-[46ch] text-[16px] leading-snug text-muted'>{c.summary}</span>
              </span>
              <span className='work-meta label text-muted'>
                <span className='block text-ink'>{c.kind}</span>
                <span className='block'>{c.client}</span>
                <span className='block'>{c.year}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
