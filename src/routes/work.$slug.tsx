import { createFileRoute, Link, notFound, useNavigate, useRouter } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Blocks } from '~/components/case/Blocks';
import { RETURN_KEY, transition } from '~/components/desk/webgl';
import { randomFortune } from '~/components/site/Fortune';
import { PageShell } from '~/components/site/PageShell';
import { Picture } from '~/components/site/Picture';
import { getCase, nextCase, work } from '~/content/work';
import { siteUrl } from '~/lib/site';
import { portfolio } from '~/portfolio.config';
import { seo } from '~/utils/seo';

const pad = (n: number) => String(n).padStart(2, '0');

export const Route = createFileRoute('/work/$slug')({
  loader: ({ params }) => {
    if (!getCase(params.slug)) throw notFound();
    return { fortune: randomFortune() };
  },
  head: ({ params }) => {
    const study = getCase(params.slug);
    if (!study) return {};
    const path = `/work/${study.slug}`;
    return seo({
      title: `${study.title}, ${study.kind.toLowerCase()} case study — ${portfolio.name}`,
      description: study.summary,
      path,
      image: study.cover.image.og ?? study.cover.image.sources.at(-1)!.src,
      imageAlt: study.cover.alt,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: study.title,
        headline: `${study.title}: ${study.summary}`,
        description: study.summary,
        url: siteUrl(path),
        image: siteUrl(study.cover.image.og ?? study.cover.image.sources.at(-1)!.src),
        dateCreated: study.year,
        genre: study.kind,
        creator: { '@type': 'Person', '@id': siteUrl('/#person'), name: portfolio.name },
        sourceOrganization: { '@type': 'Organization', name: study.client }
      }
    });
  },
  component: CaseStudyPage
});

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const { fortune } = Route.useLoaderData();
  const study = getCase(slug)!;
  const next = nextCase(slug);
  const number = work.findIndex((c) => c.slug === slug) + 1;
  const navigate = useNavigate();
  const router = useRouter();

  // When the desk zoomed into the screen, its color covers the page and lifts.
  const [veil] = useState(() => {
    const color = transition.color;
    transition.color = '';
    return color;
  });
  const [fromDesk] = useState(() => Boolean(veil));

  const back = () => {
    try {
      sessionStorage.setItem(RETURN_KEY, study.slug);
    } catch {
      // Ignore: the desk starts on its first channel.
    }
    if (fromDesk && window.history.length > 1) router.history.back();
    else navigate({ to: '/' });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const el = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <PageShell
      fortune={fortune}
      headerCenter={
        <Link
          to='/'
          className='desk-toggle link'
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            back();
          }}
        >
          ← Back to the desk <kbd className='kbd'>Esc</kbd>
        </Link>
      }
    >
      {veil && <div className='case-veil' style={{ background: veil }} aria-hidden />}
      <article>
        <div className='case-hero mt-5 md:mt-6' style={{ background: study.color.bg }}>
          <Picture
            image={study.cover.image}
            alt={study.cover.alt}
            sizes='100vw'
            priority
            className='case-hero-img'
          />
        </div>

        <header className='grid-page mt-12 md:mt-16'>
          <p className='label col-span-3 mt-3 text-muted'>
            Case study {pad(number)} / {pad(work.length)}
            <br />
            {study.kind}
          </p>
          <div className='col-span-9 col-start-4 max-md:mt-4'>
            <h1 className='text-[clamp(52px,8vw,124px)] leading-[0.9] font-medium tracking-[-0.05em]'>{study.title}</h1>
            <p className='mt-6 max-w-[34ch] text-[clamp(21px,2.2vw,30px)] leading-[1.22] tracking-[-0.018em] text-balance md:mt-8'>
              {study.summary}
            </p>
          </div>
        </header>

        <dl className='grid-page mt-14 md:mt-20'>
          <div className='col-span-9 col-start-4 grid gap-6 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-4'>
            <Meta label='Client'>{study.client}</Meta>
            <Meta label='Year'>{study.year}</Meta>
            <Meta label='Role'>{study.role}</Meta>
            <Meta label='Team'>
              <ul role='list'>
                {study.team.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </Meta>
          </div>
        </dl>

        <section className='grid-page mt-24 md:mt-32' aria-labelledby='problem'>
          <h2 id='problem' className='label col-span-3 mb-4 text-muted'>
            The problem
          </h2>
          <p className='col-span-7 col-start-4 max-w-[46ch] text-[clamp(20px,1.8vw,25px)] leading-[1.4] tracking-[-0.012em]'>
            {study.problem}
          </p>
        </section>

        <section className='grid-page mt-20 md:mt-28' aria-labelledby='decisions'>
          <h2 id='decisions' className='label col-span-3 mb-6 text-muted'>
            Decisions
          </h2>
          <ol role='list' className='col-span-9 col-start-4 grid gap-10 md:grid-cols-3 md:gap-6'>
            {study.decisions.map((d, i) => (
              <li key={d.title} className='border-t border-line pt-4'>
                <span className='label text-muted'>{pad(i + 1)}</span>
                <h3 className='mt-3 text-[19px] leading-snug font-medium tracking-[-0.01em]'>{d.title}</h3>
                <p className='mt-3 text-[16px] leading-[1.6] text-ink/85'>{d.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className='grid-page mt-20 md:mt-28' aria-labelledby='outcome'>
          <h2 id='outcome' className='label col-span-3 mb-4 text-muted'>
            Outcome
          </h2>
          <p className='col-span-7 col-start-4 max-w-[46ch] text-[clamp(20px,1.8vw,25px)] leading-[1.4] tracking-[-0.012em]'>
            {study.outcome}
          </p>
        </section>

        <Blocks study={study} />
      </article>

      <nav aria-label='Next project' className='mt-28 md:mt-40'>
        <Link
          to='/work/$slug'
          params={{ slug: next.slug }}
          className='group grid-page block py-14 md:py-20'
          style={{ background: next.color.bg, color: next.color.fg }}
        >
          <span className='label col-span-3 opacity-75'>
            Next project
            <br />
            {pad(work.indexOf(next) + 1)} / {pad(work.length)}
          </span>
          <span className='col-span-9 col-start-4 max-md:mt-4'>
            <span className='block text-[clamp(44px,6.5vw,96px)] leading-[0.92] font-medium tracking-[-0.045em]'>
              {next.title}
              <span aria-hidden className='inline-block pl-[0.2em] transition-transform duration-300 group-hover:translate-x-3'>
                →
              </span>
            </span>
            <span className='mt-4 block max-w-[40ch] text-[17px] leading-snug opacity-85'>{next.summary}</span>
          </span>
        </Link>
      </nav>
    </PageShell>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className='label text-muted'>{label}</dt>
      <dd className='mt-2 text-[15px] leading-snug'>{children}</dd>
    </div>
  );
}
