import type { CSSProperties, ReactNode } from 'react';

/** Nook's own palette and type. Screens never use the site's tokens. */
export const n = {
  clay: '#E7E1D7',
  paper: '#F4F0EA',
  card: '#FCFAF7',
  sunk: '#EBE5DC',
  ink: '#2B2724',
  soft: '#736A62',
  mute: '#A39990',
  line: '#E2DBD1',
  stone: '#CDC4B8',
  glow: '#FF7A3D',
  glowDeep: '#C4501B',
  glowSoft: '#FFE4D5',
  night: '#211E1B',
  nightCard: '#2E2926',
  nightLine: '#3A3430',
  nightSoft: '#ADA39A',
  eink: '#DCD7CC',
  font: "'Outfit', ui-sans-serif, system-ui, sans-serif"
};

export function Screen({
  children,
  style,
  bg = n.paper,
  dark = false
}: {
  children: ReactNode;
  style?: CSSProperties;
  bg?: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: bg,
        color: dark ? '#F4EFE8' : n.ink,
        fontFamily: n.font,
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

type IconProps = { size?: number; color?: string; width?: number; style?: CSSProperties };

function svg(size: number, color: string, width: number, style: CSSProperties | undefined, children: ReactNode) {
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
      style={{ flex: 'none', display: 'block', ...style }}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const Icon = {
  bulb: ({ size = 20, color = 'currentColor', width = 1.9, style }: IconProps) =>
    svg(size, color, width, style, (
      <>
        <path d='M9.2 17.2h5.6M10 20.5h4' />
        <path d='M12 3.4a6 6 0 0 0-3.6 10.8c.6.5.9 1.1.9 1.8v1.2h5.4V16c0-.7.3-1.3.9-1.8A6 6 0 0 0 12 3.4Z' />
      </>
    )),
  heat: ({ size = 20, color = 'currentColor', width = 1.9, style }: IconProps) =>
    svg(size, color, width, style, (
      <>
        <path d='M10 13.6V5.2a2 2 0 1 1 4 0v8.4a4 4 0 1 1-4 0Z' />
        <path d='M12 10v6' />
      </>
    )),
  music: ({ size = 20, color = 'currentColor', width = 1.9, style }: IconProps) =>
    svg(size, color, width, style, (
      <>
        <path d='M9 17.5V6l10-2.2v11.5' />
        <circle cx='6.6' cy='17.6' r='2.5' />
        <circle cx='16.6' cy='15.4' r='2.5' />
      </>
    )),
  back: ({ size = 20, color = 'currentColor', width = 2.1, style }: IconProps) =>
    svg(size, color, width, style, <path d='M14.5 5.5 8 12l6.5 6.5' />),
  next: ({ size = 16, color = 'currentColor', width = 2, style }: IconProps) =>
    svg(size, color, width, style, <path d='m9.5 5.5 6.5 6.5-6.5 6.5' />),
  check: ({ size = 14, color = 'currentColor', width = 2.6, style }: IconProps) =>
    svg(size, color, width, style, <path d='m5 12.5 4.5 4.5L19 7.5' />),
  plus: ({ size = 18, color = 'currentColor', width = 2, style }: IconProps) =>
    svg(size, color, width, style, <path d='M12 5v14M5 12h14' />),
  /** The remote locating itself: a point with two arcs. */
  here: ({ size = 16, color = 'currentColor', width = 1.9, style }: IconProps) =>
    svg(size, color, width, style, (
      <>
        <circle cx='12' cy='13' r='1.8' fill={color} stroke='none' />
        <path d='M8.2 9.2a5.4 5.4 0 0 0 0 7.6M15.8 9.2a5.4 5.4 0 0 1 0 7.6' />
        <path d='M5.4 6.4a9.4 9.4 0 0 0 0 13.2M18.6 6.4a9.4 9.4 0 0 1 0 13.2' />
      </>
    )),
  more: ({ size = 20, color = 'currentColor', style }: IconProps) =>
    svg(size, color, 0, style, (
      <>
        <circle cx='6' cy='12' r='1.7' fill={color} />
        <circle cx='12' cy='12' r='1.7' fill={color} />
        <circle cx='18' cy='12' r='1.7' fill={color} />
      </>
    )),
  lamp: ({ size = 20, color = 'currentColor', width = 1.9, style }: IconProps) =>
    svg(size, color, width, style, (
      <>
        <path d='M8 4h8l2.6 6.5H5.4Z' />
        <path d='M12 10.5V20M8.5 20h7' />
      </>
    )),
  pendant: ({ size = 20, color = 'currentColor', width = 1.9, style }: IconProps) =>
    svg(size, color, width, style, (
      <>
        <path d='M12 2.5v6' />
        <path d='M5 16a7 7 0 0 1 14 0Z' />
        <path d='M10.5 19h3' />
      </>
    )),
  strip: ({ size = 20, color = 'currentColor', width = 1.9, style }: IconProps) =>
    svg(size, color, width, style, (
      <>
        <rect x='3' y='9.5' width='18' height='5' rx='2.5' />
        <path d='M7 7V5.5M12 7V5.5M17 7V5.5M7 17v1.5M12 17v1.5M17 17v1.5' />
      </>
    ))
};

/** Mode glyph by name, so the remote and the app draw the same marks. */
export function ModeGlyph({ mode, ...p }: IconProps & { mode: 'light' | 'heat' | 'music' }) {
  if (mode === 'light') return Icon.bulb(p);
  if (mode === 'heat') return Icon.heat(p);
  return Icon.music(p);
}

export function TabBar({ active }: { active: 'rooms' | 'keys' | 'energy' | 'home' }) {
  const tabs = [
    ['rooms', 'Rooms'],
    ['keys', 'Keys'],
    ['energy', 'Energy'],
    ['home', 'Home']
  ] as const;
  return (
    <div
      style={{
        marginTop: 'auto',
        height: 84,
        paddingBottom: 30,
        borderTop: `1px solid ${n.line}`,
        background: n.paper,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        fontSize: 11.5,
        fontWeight: 500
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
            color: id === active ? n.ink : n.mute,
            fontWeight: id === active ? 600 : 500
          }}
        >
          <TabGlyph id={id} />
          {label}
        </div>
      ))}
    </div>
  );
}

function TabGlyph({ id }: { id: string }) {
  const p = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (id === 'rooms')
    return (
      <svg {...p}>
        <rect x='4' y='4' width='7' height='9' rx='2' />
        <rect x='13' y='4' width='7' height='5' rx='2' />
        <rect x='4' y='15' width='7' height='5' rx='2' />
        <rect x='13' y='11' width='7' height='9' rx='2' />
      </svg>
    );
  if (id === 'keys')
    return (
      <svg {...p}>
        <circle cx='12' cy='8.5' r='5' />
        <rect x='4' y='16' width='7' height='4.5' rx='1.6' />
        <rect x='13' y='16' width='7' height='4.5' rx='1.6' />
      </svg>
    );
  if (id === 'energy')
    return (
      <svg {...p}>
        <path d='M13 3 5.5 13.5H12L11 21l7.5-10.5H12Z' />
      </svg>
    );
  return (
    <svg {...p}>
      <path d='M4 11 12 4.5 20 11v8.5H4Z' />
      <path d='M9.5 19.5v-5h5v5' />
    </svg>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontSize: 13,
        fontWeight: 600,
        color: n.soft,
        letterSpacing: '0.01em',
        marginBottom: 10
      }}
    >
      <span>{children}</span>
      {action && <span style={{ color: n.glowDeep, fontWeight: 600 }}>{action}</span>}
    </div>
  );
}

/** A thin ring like the remote's, for room cards and small summaries. */
export function MiniRing({
  fill,
  size = 46,
  stroke = 4,
  track = n.line,
  children
}: {
  fill: number;
  size?: number;
  stroke?: number;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill='none' stroke={track} strokeWidth={stroke} />
        {fill > 0.004 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill='none'
            stroke={n.glow}
            strokeWidth={stroke}
            strokeLinecap='round'
            strokeDasharray={`${c * Math.min(fill, 1)} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
      )}
    </div>
  );
}

export function Toggle({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? n.ink : n.stone,
        position: 'relative',
        flex: 'none',
        display: 'block'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: 10,
          background: on ? n.glow : '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}
      />
    </span>
  );
}
