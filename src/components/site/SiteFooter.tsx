import { Link } from '@tanstack/react-router';
import { portfolio } from '~/portfolio.config';
import { Clock } from './Clock';
import { Fortune } from './Fortune';
import { SocialLinks } from './Social';

/** The corner labels at the bottom of every inner page. */
export function SiteFooter({ fortune }: { fortune: number }) {
  return (
    <footer className='site-footer label'>
      <div className='flex flex-col gap-1'>
        <Clock />
        <span className='text-muted'>{portfolio.location.city}</span>
      </div>
      <Fortune initial={fortune} className='site-footer-fortune' />
      <div className='flex flex-col items-end gap-1'>
        <SocialLinks className='flex gap-4' />
        <Link to='/' className='link text-muted'>
          Back to the desk
        </Link>
      </div>
    </footer>
  );
}
