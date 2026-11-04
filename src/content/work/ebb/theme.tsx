import type { CSSProperties, ReactNode } from 'react';

/** Ebb's own palette and type. Screens never use the site's tokens. */
export const t = {
  bg: '#0F110D',
  surface: '#171A14',
  raised: '#1F231B',
  line: '#2A3024',
  lineSoft: '#21261D',
  fg: '#EEF3E2',
  soft: '#A7B29A',
  mute: '#717C67',
  lime: '#C6F26B',
  limeDim: '#3A4A22',
  limeInk: '#16200A',
  coral: '#F58E76',
  coralDim: '#4A2A22',
  sage: '#7E8C73',
  sageDim: '#2B3327',
  font: "'Archivo', ui-sans-serif, system-ui, sans-serif"
};

/** Heart rate zone ramp, from recovery to max. */
export const zoneColors = ['#5F6B57', '#93A874', t.lime, '#F2C27A', t.coral];

export function Screen({
  children,
  style,
  bg = t.bg
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
        color: t.fg,
        fontFamily: t.font,
        fontSize: 15,
        lineHeight: 1.35,
        display: 'flex',
        flexDirection: 'column',
        fontVariantNumeric: 'tabular-nums',
        WebkitFontSmoothing: 'antialiased',
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** Small uppercase section label. */
export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 650,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: t.mute,
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** The band's three LEDs, drawn small inside the app. */
export function Leds({
  lit,
  color = t.lime,
  size = 9,
  gap = 5,
  positions,
  style
}: {
  /** How many light from the left. */
  lit?: number;
  color?: string;
  size?: number;
  gap?: number;
  /** Or exactly which ones light. */
  positions?: [boolean, boolean, boolean];
  style?: CSSProperties;
}) {
  const on = positions ?? [0, 1, 2].map((i) => i < (lit ?? 0));
  return (
    <span aria-hidden style={{ display: 'inline-flex', gap, alignItems: 'center', ...style }}>
      {on.map((v, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            background: v ? color : '#2E3429',
            boxShadow: v ? `0 0 ${size * 0.9}px ${color}88` : 'inset 0 0 0 1px #3A4134',
            transition: 'background 200ms, box-shadow 200ms'
          }}
        />
      ))}
    </span>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: t.surface,
        borderRadius: 18,
        boxShadow: `inset 0 0 0 1px ${t.lineSoft}`,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  tone = 'neutral',
  style
}: {
  children: ReactNode;
  tone?: 'lime' | 'coral' | 'neutral' | 'sage';
  style?: CSSProperties;
}) {
  const tones = {
    lime: { background: t.lime, color: t.limeInk },
    coral: { background: t.coral, color: '#2A0F08' },
    neutral: { background: t.raised, color: t.fg },
    sage: { background: t.sageDim, color: t.soft }
  } as const;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 26,
        padding: '0 10px',
        borderRadius: 13,
        fontSize: 12.5,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        transition: 'background 200ms, color 200ms',
        ...tones[tone],
        ...style
      }}
    >
      {children}
    </span>
  );
}

export function Chevron({ dir = 'left', size = 22, color = t.fg }: { dir?: 'left' | 'right'; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke={color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

export type Tab = 'today' | 'week' | 'sleep' | 'plan' | 'band';

export function TabBar({ active }: { active: Tab }) {
  const tabs: [Tab, string][] = [
    ['today', 'Today'],
    ['week', 'Week'],
    ['sleep', 'Sleep'],
    ['plan', 'Plan'],
    ['band', 'Band']
  ];
  return (
    <div
      style={{
        marginTop: 'auto',
        height: 82,
        paddingBottom: 28,
        borderTop: `1px solid ${t.lineSoft}`,
        background: t.bg,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        flex: 'none'
      }}
    >
      {tabs.map(([id, label]) => (
        <div
          key={id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            color: id === active ? t.lime : t.mute
          }}
        >
          <TabGlyph id={id} />
          {label}
        </div>
      ))}
    </div>
  );
}

function TabGlyph({ id }: { id: Tab }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };
  if (id === 'today')
    return (
      <svg {...common}>
        <circle cx='12' cy='12' r='4' />
        <path d='M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6' />
      </svg>
    );
  if (id === 'week')
    return (
      <svg {...common}>
        <path d='M5 19v-6M9.7 19V8M14.3 19v-8M19 19V5' />
      </svg>
    );
  if (id === 'sleep')
    return (
      <svg {...common}>
        <path d='M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z' />
      </svg>
    );
  if (id === 'plan')
    return (
      <svg {...common}>
        <rect x='4' y='5.5' width='16' height='14' rx='2.5' />
        <path d='M4 10h16M8.5 3.5v4M15.5 3.5v4' />
      </svg>
    );
  return (
    <svg {...common}>
      <ellipse cx='12' cy='12' rx='8' ry='5.5' />
      <rect x='9' y='14.5' width='6' height='4' rx='1.2' fill='currentColor' stroke='none' />
    </svg>
  );
}

/** Diagonal stripes for planned load, so it never reads as done. */
export function stripes(color: string, alpha = 0.55) {
  return `repeating-linear-gradient(135deg, ${color} 0 3px, color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent) 3px 6px)`;
}
