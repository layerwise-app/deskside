import { Link } from '@tanstack/react-router';
import { PageShell } from '~/components/site/PageShell';

/** Shown for any address that isn't a page. */
export function NotFound() {
  return (
    <PageShell fortune={4}>
      <section className='grid-page mt-16 md:mt-24'>
        <p className='label col-span-3 mt-3 text-muted'>Error 404</p>
        <div className='col-span-9 col-start-4 max-md:mt-4'>
          <h1 className='text-[clamp(44px,6.4vw,96px)] leading-[0.94] font-medium tracking-[-0.045em]'>
            Nothing on this channel.
          </h1>
          <p className='mt-6 max-w-[44ch] text-[19px] leading-relaxed text-muted'>
            The page you asked for isn’t here. It may have moved, or the address has a typo.
          </p>
          <ul role='list' className='label mt-10 flex flex-wrap gap-6'>
            <li>
              <Link to='/' className='underline underline-offset-4'>
                Back to the desk
              </Link>
            </li>
            <li>
              <Link to='/work' className='underline underline-offset-4'>
                See all work
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
