import type { CSSProperties, ReactNode } from 'react';

/** Alder's own palette and type. Screens never use the site's tokens. */
export const a = {
  paper: '#E8E4D8',
  linen: '#F2EFE7',
  surface: '#FBFAF6',
  forest: '#1E3A2C',
  forestDeep: '#132A1E',
  forestMid: '#2D5240',
  moss: '#4F7A5E',
  mossSoft: '#DDE7DD',
  brass: '#C59B4B',
  brassDeep: '#86652A',
  brassSoft: '#EFE4C8',
  ink: '#16261D',
  soft: '#5A665E',
  faint: '#8E968F',
  line: '#DCD7C9',
  frost: '#D3E6EE',
  frostMid: '#8DBBD0',
  frostInk: '#1F5770',
  frostPale: '#EAF4F8',
  rust: '#A5432C',
  rustSoft: '#F4E2DA',
  font: "'Schibsted Grotesk', ui-sans-serif, system-ui, sans-serif"
};

/** The fictional card. The numbers fail the Luhn check on purpose. */
export const card = {
  holder: 'June Halvorsen',
  number: ['4921', '5530', '1187', '0384'],
  last4: '0384',
  expiry: '08/28',
  cvc: '417',
  account: 'Everyday Checking ··4410',
  virtual: { number: ['4921', '6604', '2219', '7716'], last4: '7716', expiry: '03/25' }
};

export function Screen({
  children,
  style,
  bg = a.linen
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
        color: a.ink,
        fontFamily: a.font,
        fontSize: 15,
        lineHeight: 1.35,
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** Resets a native button so it can be styled like the static screens. */
export const bare: CSSProperties = {
  border: 'none',
  margin: 0,
  padding: 0,
  background: 'none',
  font: 'inherit',
  color: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent'
};

const r2 = (n: number) => Math.round(n * 100) / 100;

const flake = (() => {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 3) * i - Math.PI / 2;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    if (i < 3) d += `M${r2(12 - 9 * c)} ${r2(12 - 9 * s)}L${r2(12 + 9 * c)} ${r2(12 + 9 * s)}`;
    const bx = 12 + 5.4 * c;
    const by = 12 + 5.4 * s;
    for (const k of [-1, 1]) {
      const b = ang + k * 0.8;
      d += `M${r2(bx)} ${r2(by)}L${r2(bx + 3.1 * Math.cos(b))} ${r2(by + 3.1 * Math.sin(b))}`;
    }
  }
  return d;
})();

const glyphs = {
  snowflake: <path d={flake} />,
  faceid: (
    <>
      <path d='M4 8.5V6.5A2.5 2.5 0 0 1 6.5 4h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2' />
      <path d='M9 9.5v1.4M15 9.5v1.4M12.2 9.5v3.6h-1M9.4 15.4a3.9 3.9 0 0 0 5.2 0' />
    </>
  ),
  back: <path d='M14.5 5.5 8 12l6.5 6.5' />,
  next: <path d='M9.5 5.5 16 12l-6.5 6.5' />,
  close: <path d='M6.5 6.5l11 11M17.5 6.5l-11 11' />,
  copy: (
    <>
      <rect x='8.5' y='8.5' width='11' height='11' rx='2.5' />
      <path d='M5 15.5v-9A1.5 1.5 0 0 1 6.5 5h9' />
    </>
  ),
  dice: (
    <>
      <rect x='4' y='4' width='16' height='16' rx='4' />
      <circle cx='9' cy='9' r='1.1' fill='currentColor' />
      <circle cx='15' cy='15' r='1.1' fill='currentColor' />
      <circle cx='12' cy='12' r='1.1' fill='currentColor' />
    </>
  ),
  globe: (
    <>
      <circle cx='12' cy='12' r='8.5' />
      <path d='M3.5 12h17M12 3.5c-2.6 2.4-3.8 5.2-3.8 8.5s1.2 6.1 3.8 8.5c2.6-2.4 3.8-5.2 3.8-8.5S14.6 5.9 12 3.5Z' />
    </>
  ),
  plane: (
    <path d='M20.5 15.2v-1.6l-7-4.4V4.6a1.5 1.5 0 0 0-3 0v4.6l-7 4.4v1.6l7-2.1v4.6l-2 1.5v1.3l3.5-.9 3.5.9v-1.3l-2-1.5v-4.6z' />
  ),
  cash: (
    <>
      <rect x='3' y='6.5' width='18' height='11' rx='2.2' />
      <circle cx='12' cy='12' r='2.6' />
      <path d='M6.5 9.8v.01M17.5 14.2v.01' />
    </>
  ),
  home: (
    <>
      <path d='M4 11 12 4.5l8 6.5V20H4z' />
      <path d='M10 20v-5h4v5' />
    </>
  ),
  card: (
    <>
      <rect x='6.5' y='3' width='11' height='18' rx='2.4' />
      <path d='M9.5 6.8h2.4v3.2H9.5z' />
    </>
  ),
  pay: <path d='M5 9h13.5L15 5.5M19 15H5.5L9 18.5' />,
  help: (
    <>
      <path d='M5 18.5V7a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 7v7.5a2.5 2.5 0 0 1-2.5 2.5H8.5L5 19.5z' />
      <path d='M10 8.9a2.1 2.1 0 1 1 2.9 2c-.5.2-.9.6-.9 1.2v.3M12 14.6v.01' />
    </>
  ),
  coffee: (
    <>
      <path d='M5 9h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z' />
      <path d='M16 10.5h1.2a2.4 2.4 0 0 1 0 4.8H15.6M8.5 3.8v2.2M11.5 3.8v2.2' />
    </>
  ),
  basket: (
    <>
      <path d='M4 9.5h16l-1.6 8.9a1.8 1.8 0 0 1-1.8 1.6H7.4a1.8 1.8 0 0 1-1.8-1.6z' />
      <path d='M8.5 9.5 11 4.5M15.5 9.5 13 4.5M9.5 13v3.5M14.5 13v3.5' />
    </>
  ),
  bolt: <path d='M13 3 5.5 13.5H12L11 21l7.5-10.5H12z' />,
  fuel: (
    <>
      <rect x='4.5' y='4' width='9.5' height='16' rx='1.8' />
      <path d='M4.5 10h9.5M14 8.5l3 2.6v6.4a1.5 1.5 0 0 0 3 0V9.2l-2.5-2.5' />
    </>
  ),
  wrench: (
    <path d='M14.7 6.3a4 4 0 0 0-5.4 5.4L4.6 16.4a2 2 0 0 0 2.9 2.9l4.7-4.7a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.5-.5-2.4z' />
  ),
  fork: <path d='M7 3.5v6a2.5 2.5 0 0 0 5 0v-6M9.5 3.5V21M17 3.5c-1.9 0-3 2.3-3 5.5s1.3 4 3 4V21' />,
  book: (
    <>
      <path d='M5 5.5A2 2 0 0 1 7 3.5h12v14H7a2 2 0 0 0-2 2z' />
      <path d='M5 19.5a2 2 0 0 0 2 2h12v-4' />
    </>
  ),
  disc: (
    <>
      <circle cx='12' cy='12' r='8.5' />
      <circle cx='12' cy='12' r='2.4' />
    </>
  ),
  lock: (
    <>
      <rect x='5' y='10.5' width='14' height='10' rx='2.4' />
      <path d='M8 10.5V8a4 4 0 0 1 8 0v2.5' />
    </>
  ),
  check: <path d='M5 12.5l4.5 4.5L19 7.5' />,
  pin: (
    <>
      <path d='M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z' />
      <circle cx='12' cy='10' r='2.4' />
    </>
  ),
  refresh: <path d='M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4' />,
  shield: (
    <>
      <path d='M12 3.5 5 6v5.5c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6z' />
      <path d='M9 12l2.2 2.2L15.5 10' />
    </>
  ),
  truck: (
    <>
      <path d='M3 6.5h11v9.5H3zM14 9.5h4l3 3v3.5h-7' />
      <circle cx='7' cy='17.5' r='1.8' />
      <circle cx='17' cy='17.5' r='1.8' />
    </>
  ),
  phone: (
    <path d='M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z' />
  ),
  ban: (
    <>
      <circle cx='12' cy='12' r='8.5' />
      <path d='m6 6 12 12' />
    </>
  )
};

export type IconName = keyof typeof glyphs;

export function Icon({
  name,
  size = 22,
  width = 1.9,
  color = 'currentColor',
  style
}: {
  name: IconName;
  size?: number;
  width?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={width}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
      style={{ display: 'block', flex: 'none', ...style }}
    >
      {glyphs[name]}
    </svg>
  );
}

/** The on/off track used by every switch, interactive or not. */
export function Track({ on, tone = a.forest, size = 'md' }: { on: boolean; tone?: string; size?: 'md' | 'lg' }) {
  const w = size === 'lg' ? 54 : 42;
  const h = size === 'lg' ? 32 : 26;
  const k = h - 6;
  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        display: 'block',
        flex: 'none',
        width: w,
        height: h,
        borderRadius: h / 2,
        background: on ? tone : '#CDC7B6',
        transition: 'background 200ms'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          width: k,
          height: k,
          borderRadius: k / 2,
          background: '#fff',
          boxShadow: '0 1px 3px rgba(19,42,30,0.3)',
          transform: on ? `translateX(${w - k - 6}px)` : 'none',
          transition: 'transform 220ms cubic-bezier(.3,.7,.3,1)'
        }}
      />
    </span>
  );
}

export function TopBar({ back = 'Card', right }: { back?: string; right?: ReactNode }) {
  return (
    <div
      style={{
        padding: '56px 16px 0 12px',
        height: 92,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 'none'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 16, fontWeight: 550, color: a.forest }}>
        <Icon name='back' size={24} width={2.1} />
        {back}
      </span>
      {right}
    </div>
  );
}

export function TabBar({ active = 'card' }: { active?: 'home' | 'card' | 'pay' | 'help' }) {
  const tabs = [
    ['home', 'Accounts', 'home'],
    ['card', 'Card', 'card'],
    ['pay', 'Transfer', 'pay'],
    ['help', 'Help', 'help']
  ] as const;
  return (
    <div
      aria-hidden
      style={{
        marginTop: 'auto',
        height: 82,
        paddingBottom: 30,
        flex: 'none',
        borderTop: `1px solid ${a.line}`,
        background: a.surface,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        position: 'relative',
        zIndex: 2
      }}
    >
      {tabs.map(([id, label, icon]) => (
        <div
          key={id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            color: id === active ? a.forest : a.faint
          }}
        >
          <Icon name={icon} size={24} width={id === active ? 2.1 : 1.8} />
          {label}
        </div>
      ))}
    </div>
  );
}

/** A rounded white group, like an inset list. */
export function Group({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: a.surface,
        borderRadius: 20,
        boxShadow: `0 0 0 1px ${a.line}`,
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 650,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: a.soft,
        ...style
      }}
    >
      {children}
    </div>
  );
}
