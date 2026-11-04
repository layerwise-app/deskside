import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/** Header, main, and footer for the scrolling pages (everything but the desk). */
export function PageShell({
  children,
  fortune,
  headerCenter
}: {
  children: ReactNode;
  fortune: number;
  headerCenter?: ReactNode;
}) {
  return (
    <div className='page'>
      <a className='skip-link label' href='#main'>
        Skip to content
      </a>
      <SiteHeader center={headerCenter} />
      <main id='main' tabIndex={-1} className='outline-none'>
        {children}
      </main>
      <SiteFooter fortune={fortune} />
    </div>
  );
}
