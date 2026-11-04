import type { CSSProperties, ReactNode } from 'react';

/** Cascadia Rail's own palette and type. Screens never use the site's tokens. */
export const t = {
  teal: '#0E4D57',
  tealDeep: '#0A3C44',
  tealMid: '#1F6570',
  tealSoft: '#DDE7E4',
  cream: '#F4F1E8',
  paper: '#FCFAF4',
  ink: '#132A2E',
  mute: '#5E7A7D',
  faint: '#A2B2B1',
  line: '#E1DCCD',
  lineDark: 'rgba(244,241,232,0.16)',
  yellow: '#F6C445',
  yellowDeep: '#C99A1E',
  yellowSoft: '#FBEAB4',
  green: '#3F9A73',
  brick: '#B4502F',
  font: "'Overpass', ui-sans-serif, system-ui, sans-serif"
};

/** Times and fares always line up in columns. */
export const nums: CSSProperties = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: "'tnum' on" };

export function Screen({
  children,
  style,
  bg = t.cream
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
        color: t.ink,
        fontFamily: t.font,
        fontSize: 15,
        lineHeight: 1.35,
        display: 'flex',
        flexDirection: 'column',
        ...nums,
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** Small uppercase signage label. */
export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        lineHeight: 1.2,
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** A time with a small meridiem, like a departures board. */
export function Time({
  value,
  size = 22,
  weight = 800,
  style
}: {
  value: string;
  size?: number;
  weight?: number;
  style?: CSSProperties;
}) {
  const [hm, m] = value.split(' ');
  return (
    <span style={{ fontSize: size, fontWeight: weight, letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap', ...nums, ...style }}>
      {hm}
      {m && (
        <span style={{ fontSize: Math.round(size * 0.5), fontWeight: 700, letterSpacing: 0, marginLeft: 3 }}>{m}</span>
      )}
    </span>
  );
}

type IconName =
  | 'back'
  | 'next'
  | 'down'
  | 'swap'
  | 'arrow'
  | 'bike'
  | 'quiet'
  | 'window'
  | 'seat'
  | 'train'
  | 'ticket'
  | 'clock'
  | 'user'
  | 'sun'
  | 'code'
  | 'check'
  | 'card'
  | 'bell'
  | 'forward';

export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  stroke = 1.9,
  style
}: {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
  style?: CSSProperties;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { display: 'block', flex: 'none', ...style },
    'aria-hidden': true
  };
  switch (name) {
    case 'back':
      return (
        <svg {...p}>
          <path d='M14.5 5.5 8 12l6.5 6.5' />
        </svg>
      );
    case 'next':
      return (
        <svg {...p}>
          <path d='M9.5 5.5 16 12l-6.5 6.5' />
        </svg>
      );
    case 'down':
      return (
        <svg {...p}>
          <path d='m6.5 9.5 5.5 5.5 5.5-5.5' />
        </svg>
      );
    case 'swap':
      return (
        <svg {...p}>
          <path d='M8 19V5M4.5 8.5 8 5l3.5 3.5' />
          <path d='M16 5v14M12.5 15.5 16 19l3.5-3.5' />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...p}>
          <path d='M4 12h15M13.5 6.5 19 12l-5.5 5.5' />
        </svg>
      );
    case 'bike':
      return (
        <svg {...p}>
          <circle cx='5.5' cy='15.5' r='3.5' />
          <circle cx='18.5' cy='15.5' r='3.5' />
          <path d='M5.5 15.5 9 9h6.5l3 6.5M9 9 12 15.5h-6.5M12 15.5 15.5 9M14 6h2.5' />
          <path d='M8 6.5h2.5' />
        </svg>
      );
    case 'quiet':
      return (
        <svg {...p}>
          <path d='M4 9.5h3l4.5-3.5v12L7 14.5H4z' />
          <path d='m15.5 9.5 5 5M20.5 9.5l-5 5' />
        </svg>
      );
    case 'window':
      return (
        <svg {...p}>
          <rect x='4.5' y='4.5' width='15' height='15' rx='4' />
          <path d='M4.5 12h15' />
        </svg>
      );
    case 'seat':
      return (
        <svg {...p}>
          <path d='M7 4.5v9a2 2 0 0 0 2 2h7' />
          <path d='M7 15.5 6 20M16 15.5l1.5 4.5M10 11h5.5a2 2 0 0 1 2 2v2.5' />
        </svg>
      );
    case 'train':
      return (
        <svg {...p}>
          <rect x='5.5' y='3.5' width='13' height='14' rx='3.5' />
          <path d='M5.5 10.5h13M9 14.2h.01M15 14.2h.01M8.5 17.5 6.5 21M15.5 17.5l2 3.5' />
        </svg>
      );
    case 'ticket':
      return (
        <svg {...p}>
          <path d='M4 7.5a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5z' />
          <path d='M14 6.5v11' strokeDasharray='2 2.2' />
        </svg>
      );
    case 'clock':
      return (
        <svg {...p}>
          <circle cx='12' cy='12' r='8' />
          <path d='M12 7.5V12l3 2' />
        </svg>
      );
    case 'user':
      return (
        <svg {...p}>
          <circle cx='12' cy='8.5' r='3.5' />
          <path d='M5 19.5c1.2-3.2 3.9-4.8 7-4.8s5.8 1.6 7 4.8' />
        </svg>
      );
    case 'sun':
      return (
        <svg {...p}>
          <circle cx='12' cy='12' r='3.8' />
          <path d='M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4' />
        </svg>
      );
    case 'code':
      return (
        <svg {...p}>
          <path d='M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16' />
          <path d='M8.5 8.5h2v2h-2zM13.5 8.5h2v2h-2zM8.5 13.5h2v2h-2zM13.5 13.5h2v2h-2z' />
        </svg>
      );
    case 'check':
      return (
        <svg {...p}>
          <path d='m5.5 12.5 4 4 9-9' />
        </svg>
      );
    case 'card':
      return (
        <svg {...p}>
          <rect x='3.5' y='6' width='17' height='12' rx='2.5' />
          <path d='M3.5 10h17M7 14.5h3' />
        </svg>
      );
    case 'bell':
      return (
        <svg {...p}>
          <path d='M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z' />
          <path d='M10 20.5h4' />
        </svg>
      );
    case 'forward':
      return (
        <svg {...p}>
          <path d='M12 19V5M6.5 10.5 12 5l5.5 5.5' />
        </svg>
      );
  }
}

/** The Cascadia Rail mark: a signal-yellow C wrapped around a length of track. */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 26 26' aria-hidden style={{ display: 'block', flex: 'none' }}>
      <rect width='26' height='26' rx='7' fill={t.teal} />
      <path d='M17.6 7.6A7 7 0 1 0 17.6 18.4' fill='none' stroke={t.yellow} strokeWidth='2.6' strokeLinecap='round' />
      <path d='M11 11.2h11M11 14.8h11' stroke={t.cream} strokeWidth='1.5' strokeLinecap='round' />
      <path d='M14 10v6M18 10v6' stroke={t.cream} strokeWidth='1.2' strokeLinecap='round' opacity='0.7' />
    </svg>
  );
}

/** Visual-only switch for static screens. */
export function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        background: on ? t.teal : '#D3D0C4',
        position: 'relative',
        flex: 'none',
        transition: 'background 160ms'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
          transition: 'left 160ms'
        }}
      />
    </span>
  );
}

export function TabBar({ active }: { active: 'book' | 'tickets' | 'trips' | 'you' }) {
  const tabs = [
    ['book', 'Book', 'train'],
    ['tickets', 'Tickets', 'ticket'],
    ['trips', 'Trip status', 'clock'],
    ['you', 'Account', 'user']
  ] as const;
  return (
    <div
      style={{
        marginTop: 'auto',
        height: 84,
        paddingBottom: 30,
        borderTop: `1px solid ${t.line}`,
        background: t.paper,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 700
      }}
    >
      {tabs.map(([id, label, icon]) => (
        <div
          key={id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            color: id === active ? t.teal : t.faint,
            position: 'relative'
          }}
        >
          <Icon name={icon} size={24} stroke={id === active ? 2.1 : 1.9} />
          {label}
          {id === 'tickets' && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                left: '50%',
                marginLeft: 8,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                background: t.yellow,
                color: t.ink,
                fontSize: 10,
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                padding: '1px 4px 0'
              }}
            >
              1
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Station code in a signage box. */
export function Code({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '2px 6px 0',
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.08em',
        background: tone === 'dark' ? 'rgba(244,241,232,0.14)' : t.tealSoft,
        color: tone === 'dark' ? t.cream : t.teal
      }}
    >
      {children}
    </span>
  );
}
