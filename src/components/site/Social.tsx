import { portfolio } from '~/portfolio.config';

/** The owner's profiles, as tiny labels (`IG IN AR GH`) or a full list. */
export function SocialLinks({ variant = 'short', className }: { variant?: 'short' | 'full'; className?: string }) {
  return (
    <ul className={className} role='list'>
      {portfolio.social.map((s) => (
        <li key={s.href}>
          <a
            href={s.href}
            target='_blank'
            rel='me noopener noreferrer'
            className='link'
            aria-label={variant === 'short' ? `${s.label} (opens in a new tab)` : undefined}
          >
            {variant === 'short' ? s.short : s.label}
            {variant === 'full' && <span className='sr-only'> (opens in a new tab)</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
