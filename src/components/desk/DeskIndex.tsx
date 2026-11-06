import { Link } from '@tanstack/react-router';
import { Clock } from '~/components/site/Clock';
import { Fortune } from '~/components/site/Fortune';
import { PoweredBy } from '~/components/site/PoweredBy';
import { Picture } from '~/components/site/Picture';
import { SocialLinks } from '~/components/site/Social';
import { work } from '~/content/work';
import { portfolio } from '~/portfolio.config';
import { images as deskImages } from '~/assets/desk/images';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The plain text index of every project. It is the home page on phones,
 * with reduced motion, and without WebGL, where it opens with a rendered
 * still of the desk.
 */
export function DeskIndex({
  fortune,
  canDesk,
  onDesk
}: {
  fortune: number;
  canDesk: boolean;
  onDesk: () => void;
}) {
  return (
    <section id='index' className='desk-index flex-col' aria-labelledby='index-heading'>
      <header className='site-header label'>
        <Link to='/about' className='block w-fit'>
          <span className='block text-ink'>{portfolio.name}</span>
          <span className='block text-muted'>{portfolio.role}</span>
        </Link>
        <div className='site-header-center'>
          {canDesk && (
            <button type='button' className='desk-toggle link' onClick={onDesk}>
              Back to the desk <kbd className='kbd'>I</kbd>
            </button>
          )}
        </div>
        <nav aria-label='Site'>
          <ul role='list' className='flex justify-end gap-5'>
            <li>
              <Link to='/work' className='link'>
                Work
              </Link>
            </li>
            <li>
              <Link to='/about' className='link'>
                About
              </Link>
            </li>
            <li>
              <Link to='/contact' className='link'>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='grid-page mt-10 md:mt-16'>
        <div className='index-still col-span-12 mb-10 overflow-hidden max-md:-mx-[var(--gutter)] md:mb-14'>
          <Picture
            image={deskImages.still}
            alt={`A beige 1980s computer on a desk beside a green glazed mug. Its screen shows ${work[0].title}.`}
            sizes='100vw'
            priority
            className='mx-auto max-w-[1100px] md:rounded-[4px]'
          />
        </div>
        <p className='col-span-12 max-w-[30ch] text-[clamp(24px,3vw,40px)] leading-[1.12] tracking-[-0.025em] text-balance md:col-span-8'>
          {portfolio.tagline}
        </p>
        <div className='col-span-12 mt-14 md:mt-20'>
          <h2
            id='index-heading'
            tabIndex={-1}
            className='label mb-4 flex justify-between text-muted outline-none'
          >
            <span>Index</span>
            <span>
              {pad(work.length)} projects
            </span>
          </h2>
          <ol role='list'>
            {work.map((c, i) => (
              <li key={c.slug}>
                <Link to='/work/$slug' params={{ slug: c.slug }} className='index-row'>
                  <span className='label text-muted'>{pad(i + 1)}</span>
                  <span className='index-title text-[19px] leading-tight font-medium tracking-[-0.01em]'>
                    <span className='index-swatch' style={{ background: c.color.bg }} aria-hidden />
                    {c.title}
                  </span>
                  <span className='index-kind label text-muted'>{c.kind}</span>
                  <span className='index-client label text-muted'>{c.client}</span>
                  <span className='index-year label text-muted'>{c.year}</span>
                  <span className='index-arrow label' aria-hidden>
                    →
                  </span>
                  <span className='index-summary text-[15px] leading-snug text-muted md:hidden'>
                    {c.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <footer className='site-footer label mt-auto'>
        <div className='flex flex-col gap-1'>
          <Clock />
          <span className='text-muted'>{portfolio.location.city}</span>
        </div>
        <Fortune initial={fortune} className='site-footer-fortune' />
        <div className='flex flex-col items-end gap-1'>
          <SocialLinks className='flex gap-4' />
          <PoweredBy />
        </div>
      </footer>
    </section>
  );
}
