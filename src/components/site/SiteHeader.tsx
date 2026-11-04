import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { portfolio } from '~/portfolio.config';

const nav = [
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
] as const;

/** The corner labels at the top of every inner page. */
export function SiteHeader({ center }: { center?: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className='site-header label'>
      <Link to='/' className='block w-fit'>
        <span className='block text-ink'>{portfolio.name}</span>
        <span className='block text-muted'>{portfolio.role}</span>
      </Link>
      <div className='site-header-center'>{center}</div>
      <nav aria-label='Site'>
        <ul role='list' className='flex justify-end gap-5'>
          {nav.map((item) => {
            const current = path === item.to || path.startsWith(`${item.to}/`);
            return (
              <li key={item.to}>
                <Link to={item.to} className='link' aria-current={current ? 'page' : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
