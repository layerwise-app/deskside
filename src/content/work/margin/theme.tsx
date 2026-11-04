import type { CSSProperties, ReactNode } from 'react';

/** Margin's own palette and type. Screens never use the site's tokens. */
export const m = {
  paper: '#F7F3EA',
  sheet: '#FCFAF5',
  deep: '#EFE8DA',
  ink: '#23283A',
  soft: '#5C5F6E',
  faint: '#8E8C84',
  line: '#E2DAC9',
  ruling: '#CFD7E2',
  pencil: '#C8442E',
  /** Red pencil dark enough for small text on paper. */
  pencilText: '#B13A25',
  gap: '#CFC7B6',
  future: '#E3DCCC',
  font: "'Newsreader', ui-serif, Georgia, serif",
  sans: "ui-sans-serif, system-ui, -apple-system, sans-serif"
};

export type InkId = 'bright' | 'steady' | 'restless' | 'low' | 'heavy';

/** Five mood inks, named like a printer's tins. None is better than another. */
export const inks: { id: InkId; mood: string; name: string; color: string }[] = [
  { id: 'bright', mood: 'Bright', name: 'Ochre', color: '#D39A3B' },
  { id: 'steady', mood: 'Steady', name: 'Moss', color: '#7D9262' },
  { id: 'restless', mood: 'Restless', name: 'Rose', color: '#D5867B' },
  { id: 'low', mood: 'Low', name: 'Slate', color: '#5C7396' },
  { id: 'heavy', mood: 'Heavy', name: 'Plum', color: '#77567A' }
];

export const ink = (id: InkId) => inks.find((i) => i.id === id)!;

/** Small caps label: uppercase, tracked, in red pencil or soft ink. */
export const caps: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: '0.09em',
  textTransform: 'uppercase'
};

export function Screen({
  children,
  style,
  bg = m.paper
}: {
  children: ReactNode;
  style?: CSSProperties;
  bg?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: bg,
        color: m.ink,
        fontFamily: m.font,
        fontSize: 16,
        lineHeight: 1.4,
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function InkDot({ id, size = 10, style }: { id: InkId; size?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: size / 2,
        background: ink(id).color,
        flex: 'none',
        ...style
      }}
    />
  );
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function Icon({ name, size = 20 }: { name: 'year' | 'search' | 'back' | 'down' | 'up' | 'swap' | 'bell'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true };
  switch (name) {
    case 'year':
      return (
        <svg {...common} fill='currentColor'>
          {[6, 12, 18].map((y) => [6, 12, 18].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r={x === 18 && y === 18 ? 1.3 : 2.1} />))}
        </svg>
      );
    case 'search':
      return (
        <svg {...common} {...stroke}>
          <circle cx='10.5' cy='10.5' r='6' />
          <path d='m15 15 5 5' />
        </svg>
      );
    case 'back':
      return (
        <svg {...common} {...stroke}>
          <path d='M14.5 5.5 8 12l6.5 6.5' />
        </svg>
      );
    case 'down':
      return (
        <svg {...common} {...stroke}>
          <path d='m6.5 9.5 5.5 5.5 5.5-5.5' />
        </svg>
      );
    case 'up':
      return (
        <svg {...common} {...stroke}>
          <path d='m6.5 14.5 5.5-5.5 5.5 5.5' />
        </svg>
      );
    case 'swap':
      return (
        <svg {...common} {...stroke}>
          <path d='M5 9.5h12.5L14 6' />
          <path d='M19 14.5H6.5L10 18' />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common} {...stroke}>
          <path d='M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z' />
          <path d='M10 20.5a2.2 2.2 0 0 0 4 0' />
        </svg>
      );
  }
}

/** The two quiet corner buttons on the page: the year and search. */
export function CornerIcons() {
  const btn: CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: 19,
    display: 'grid',
    placeItems: 'center',
    color: m.ink,
    boxShadow: `inset 0 0 0 1.25px ${m.line}`
  };
  return (
    <div aria-hidden style={{ display: 'flex', gap: 8 }}>
      <span style={btn}>
        <Icon name='year' size={18} />
      </span>
      <span style={btn}>
        <Icon name='search' size={18} />
      </span>
    </div>
  );
}

/** Top of the Today page: the date, set like a letterhead. */
export function DateHead({ weekday, date, right }: { weekday: string; date: string; right?: ReactNode }) {
  return (
    <div style={{ padding: '60px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ ...caps, color: m.soft }}>{weekday}</div>
        <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.1, marginTop: 4 }}>{date}</div>
      </div>
      {right ?? <CornerIcons />}
    </div>
  );
}

/** A back link and a centered title, for the screens behind the page. */
export function BackBar({ label = 'Today', title, right }: { label?: string; title?: string; right?: ReactNode }) {
  return (
    <div
      style={{
        padding: '56px 16px 0',
        height: 100,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        fontSize: 16
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: m.ink }}>
        <Icon name='back' size={22} />
        {label}
      </span>
      <span style={{ fontWeight: 600 }}>{title}</span>
      <span style={{ justifySelf: 'end' }}>{right}</span>
    </div>
  );
}

export const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
