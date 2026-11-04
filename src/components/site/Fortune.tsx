import { useState } from 'react';
import { portfolio } from '~/portfolio.config';

/** A small "fortune" line. Press it for another one. */
export function Fortune({ initial, className }: { initial: number; className?: string }) {
  const list = portfolio.fortunes;
  const [index, setIndex] = useState(initial % list.length);
  return (
    <button
      type='button'
      className={`fortune ${className ?? ''}`}
      onClick={() => setIndex((i) => (i + 1) % list.length)}
      title='Another fortune'
    >
      <span className='text-muted'>Fortune </span>
      <span aria-live='polite'>{list[index]}</span>
    </button>
  );
}

export function randomFortune() {
  return Math.floor(Math.random() * portfolio.fortunes.length);
}
