import type { CSSProperties, ReactNode } from 'react';

/** Stoop's own palette and type. Screens never use the site's tokens. */
export const t = {
  cream: '#F3EADB',
  paper: '#FFFBF4',
  ink: '#2A211B',
  soft: '#6E6157',
  line: '#E6DBC9',
  tomato: '#E4572E',
  tomatoDeep: '#B8401F',
  sage: '#8EA58B',
  sageSoft: '#E3EADB',
  butter: '#F6D77B',
  font: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif"
};

export function Screen({
  children,
  style,
  bg = t.paper
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
        fontFeatureSettings: "'ss01' on",
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  active,
  style
}: {
  children: ReactNode;
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 34,
        padding: '0 14px',
        borderRadius: 17,
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: active ? t.ink : 'transparent',
        color: active ? t.paper : t.ink,
        boxShadow: active ? 'none' : `inset 0 0 0 1.5px ${t.line}`,
        ...style
      }}
    >
      {children}
    </span>
  );
}

export function TabBar({ active }: { active: 'nearby' | 'saved' | 'sell' | 'inbox' | 'you' }) {
  const tabs = [
    ['nearby', 'Nearby'],
    ['saved', 'Saved'],
    ['sell', 'Sell'],
    ['inbox', 'Inbox'],
    ['you', 'You']
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
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600
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
            color: id === active ? t.ink : '#A39689'
          }}
        >
          {id === 'sell' ? (
            <span
              style={{
                width: 40,
                height: 28,
                borderRadius: 10,
                background: t.tomato,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 500
              }}
            >
              +
            </span>
          ) : (
            <TabGlyph id={id} />
          )}
          {label}
        </div>
      ))}
    </div>
  );
}

function TabGlyph({ id }: { id: string }) {
  const common = { width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 1.9 };
  if (id === 'nearby')
    return (
      <svg viewBox='0 0 24 24' {...common}>
        <path d='M4 11.5 12 5l8 6.5V20H4z' strokeLinejoin='round' />
        <path d='M9.5 20v-5h5v5' />
      </svg>
    );
  if (id === 'saved')
    return (
      <svg viewBox='0 0 24 24' {...common}>
        <path d='M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.1c0 5.1-7 9.4-7 9.4Z' strokeLinejoin='round' />
      </svg>
    );
  if (id === 'inbox')
    return (
      <svg viewBox='0 0 24 24' {...common}>
        <path d='M4.5 6.5h15v10h-9l-4 3v-3h-2z' strokeLinejoin='round' />
      </svg>
    );
  return (
    <svg viewBox='0 0 24 24' {...common}>
      <circle cx='12' cy='9' r='3.6' />
      <path d='M5 19.5c1.3-3.3 4-4.8 7-4.8s5.7 1.5 7 4.8' strokeLinecap='round' />
    </svg>
  );
}

export function Button({
  children,
  tone = 'primary',
  style
}: {
  children: ReactNode;
  tone?: 'primary' | 'ghost';
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        height: 54,
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 17,
        fontWeight: 650,
        letterSpacing: '-0.01em',
        background: tone === 'primary' ? t.tomato : 'transparent',
        color: tone === 'primary' ? '#fff' : t.ink,
        boxShadow: tone === 'primary' ? `0 1px 0 ${t.tomatoDeep}` : `inset 0 0 0 1.5px ${t.line}`,
        ...style
      }}
    >
      {children}
    </span>
  );
}
