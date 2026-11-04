import { createFileRoute, Link } from '@tanstack/react-router';
import { randomFortune } from '~/components/site/Fortune';
import { PageShell } from '~/components/site/PageShell';
import { SocialLinks } from '~/components/site/Social';
import { about } from '~/content/about';
import { personJsonLd } from '~/lib/structured-data';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

export const Route = createFileRoute('/about')({
  loader: () => ({ fortune: randomFortune() }),
  head: () =>
    seo({
      title: `About — ${portfolio.name}`,
      description: `${portfolio.name} is a ${portfolio.role.toLowerCase()} in ${portfolio.location.city}. Services, experience, selected clients, and a CV to download.`,
      path: '/about',
      jsonLd: { ...personJsonLd(), '@type': 'Person' }
    }),
  component: AboutPage
});

function AboutPage() {
  const { fortune } = Route.useLoaderData();
  return (
    <PageShell fortune={fortune}>
      <header className='grid-page mt-16 md:mt-24'>
        <p className='label col-span-3 mt-3 text-muted'>About</p>
        <h1 className='col-span-9 col-start-4 max-w-[22ch] text-[clamp(34px,4.6vw,68px)] leading-[1.02] font-medium tracking-[-0.04em] text-balance max-md:mt-4'>
          {about.lead}
        </h1>
      </header>

      <section className='grid-page mt-16 md:mt-24' aria-label='Biography'>
        <dl className='label col-span-3 flex flex-col gap-4 max-md:order-2 max-md:mt-12'>
          {about.facts.map(([k, v]) => (
            <div key={k}>
              <dt className='text-muted'>{k}</dt>
              <dd className='mt-1 text-ink'>{v}</dd>
            </div>
          ))}
          <div>
            <dt className='text-muted'>Elsewhere</dt>
            <dd className='mt-1'>
              <SocialLinks variant='full' className='flex flex-col gap-1' />
            </dd>
          </div>
        </dl>
        <div className='prose-case col-span-6 col-start-4 text-[18px] leading-[1.65]'>
          {portfolio.bio.map((p) => (
            <p key={p} className='max-w-[60ch]'>
              {p}
            </p>
          ))}
          <p className='mt-8!'>
            <a
              href={portfolio.cv.href}
              download
              className='label inline-flex items-center gap-3 rounded-[3px] bg-ink px-4 py-3 text-paper transition-colors hover:bg-ink/85'
            >
              Download CV <span className='text-paper/70'>{portfolio.cv.label}</span> <span aria-hidden>↓</span>
            </a>
          </p>
        </div>
      </section>

      <section className='grid-page mt-24 md:mt-32' aria-labelledby='services'>
        <h2 id='services' className='label col-span-3 mb-6 text-muted'>
          Services
        </h2>
        <ul role='list' className='col-span-9 col-start-4 grid gap-x-6 gap-y-10 md:grid-cols-2'>
          {about.services.map((s, i) => (
            <li key={s.title} className='border-t border-line pt-4'>
              <span className='label text-muted'>{String(i + 1).padStart(2, '0')}</span>
              <h3 className='mt-3 text-[21px] leading-snug font-medium tracking-[-0.015em]'>{s.title}</h3>
              <p className='mt-2 max-w-[44ch] text-[16px] leading-[1.6] text-ink/85'>{s.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className='grid-page mt-24 md:mt-32' aria-labelledby='experience'>
        <h2 id='experience' className='label col-span-3 mb-6 text-muted'>
          Experience
        </h2>
        <ol role='list' className='col-span-9 col-start-4'>
          {about.experience.map((e) => (
            <li key={e.years} className='grid gap-1 border-t border-line py-4 last:border-b md:grid-cols-[150px_1fr_1fr] md:gap-6'>
              <span className='label pt-1 text-muted tabular-nums'>{e.years}</span>
              <span className='text-[17px] leading-snug'>
                <span className='font-medium'>{e.role}</span>
                <span className='block text-muted'>{e.place}</span>
              </span>
              <span className='text-[15px] leading-snug text-muted md:pt-0.5'>{e.note}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className='grid-page mt-24 md:mt-32' aria-labelledby='clients'>
        <h2 id='clients' className='label col-span-3 mb-6 text-muted'>
          Selected clients
        </h2>
        <ul role='list' className='col-span-9 col-start-4 flex flex-wrap gap-x-[0.6em] gap-y-1 text-[clamp(24px,2.8vw,40px)] leading-[1.2] tracking-[-0.03em]'>
          {about.clients.map((c, i) => (
            <li key={c}>
              {c}
              {i < about.clients.length - 1 && <span className='text-muted'>,</span>}
            </li>
          ))}
        </ul>
        <p className='col-span-9 col-start-4 mt-12 text-[17px]'>
          Working on something?{' '}
          <Link to='/contact' className='underline decoration-1 underline-offset-4 hover:decoration-2'>
            Send a note
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
