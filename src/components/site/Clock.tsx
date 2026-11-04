import { useEffect, useState } from 'react';
import { portfolio } from '~/portfolio.config';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: portfolio.location.timeZone,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
});

/** The owner's local time, ticking. Monospaced so it never changes width. */
export function Clock({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={className}>
      <span aria-hidden>{portfolio.location.short} </span>
      <time dateTime={now.toISOString()} suppressHydrationWarning>
        <span className='sr-only'>Local time in {portfolio.location.city}: </span>
        {formatter.format(now)}
      </time>
    </span>
  );
}
