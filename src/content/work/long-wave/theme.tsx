import type { CSSProperties, ReactNode } from 'react';

/** Long Wave's own palette and type. Screens never use the site's tokens. */
export const t = {
  night: '#14171F',
  raised: '#1C2029',
  raised2: '#242936',
  line: '#2B303C',
  paper: '#F3E9D7',
  soft: '#A9A293',
  dim: '#6E6C68',
  amber: '#F2A541',
  amberDeep: '#C9811F',
  slate: '#8593A8',
  slateDeep: '#3A4558',
  serif: "'Fraunces', ui-serif, Georgia, serif",
  sans: "ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif"
};

export function Screen({
  children,
  style,
  bg = t.night
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
        color: t.paper,
        fontFamily: t.sans,
        fontSize: 15,
        lineHeight: 1.35,
        display: 'flex',
        flexDirection: 'column',
        WebkitFontSmoothing: 'antialiased',
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** Small caps label, the one bit of UI type that isn't the system face. */
export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: t.sans,
        fontSize: 11,
        fontWeight: 650,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: t.soft,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export type IconName =
  | 'down'
  | 'back'
  | 'more'
  | 'play'
  | 'pause'
  | 'prevChapter'
  | 'nextChapter'
  | 'back15'
  | 'fwd30'
  | 'chapters'
  | 'transcript'
  | 'moon'
  | 'queue'
  | 'download'
  | 'plus'
  | 'check'
  | 'search'
  | 'home'
  | 'library'
  | 'grip'
  | 'speaker'
  | 'share'
  | 'text';

export function Icon({
  name,
  size = 24,
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
    case 'down':
      return (
        <svg {...p}>
          <path d='m6 9.5 6 6 6-6' />
        </svg>
      );
    case 'back':
      return (
        <svg {...p}>
          <path d='M14.5 6 8.5 12l6 6' />
        </svg>
      );
    case 'more':
      return (
        <svg {...p}>
          <circle cx='6' cy='12' r='1.3' fill={color} stroke='none' />
          <circle cx='12' cy='12' r='1.3' fill={color} stroke='none' />
          <circle cx='18' cy='12' r='1.3' fill={color} stroke='none' />
        </svg>
      );
    case 'play':
      return (
        <svg {...p} stroke='none'>
          <path d='M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2Z' fill={color} />
        </svg>
      );
    case 'pause':
      return (
        <svg {...p} stroke='none'>
          <rect x='6.5' y='5' width='3.8' height='14' rx='1.2' fill={color} />
          <rect x='13.7' y='5' width='3.8' height='14' rx='1.2' fill={color} />
        </svg>
      );
    case 'prevChapter':
      return (
        <svg {...p}>
          <path d='M6 5.5v13' />
          <path d='M18 6.2v11.6a.6.6 0 0 1-.9.5L9.6 12.5a.6.6 0 0 1 0-1l7.5-5.8a.6.6 0 0 1 .9.5Z' fill={color} stroke='none' />
        </svg>
      );
    case 'nextChapter':
      return (
        <svg {...p}>
          <path d='M18 5.5v13' />
          <path d='M6 6.2v11.6a.6.6 0 0 0 .9.5l7.5-5.8a.6.6 0 0 0 0-1L6.9 5.7a.6.6 0 0 0-.9.5Z' fill={color} stroke='none' />
        </svg>
      );
    case 'back15':
    case 'fwd30': {
      const back = name === 'back15';
      return (
        <svg {...p} viewBox='0 0 28 28' width={size + 4} height={size + 4}>
          <path
            d={back ? 'M7.2 8.4A9 9 0 1 1 5 14' : 'M20.8 8.4A9 9 0 1 0 23 14'}
          />
          <path d={back ? 'M7.6 4.2v4.6h4.6' : 'M20.4 4.2v4.6h-4.6'} />
          <text
            x='14'
            y='17.6'
            textAnchor='middle'
            fill={color}
            stroke='none'
            style={{ font: `700 8.6px ${t.sans}` }}
          >
            {back ? '15' : '30'}
          </text>
        </svg>
      );
    }
    case 'chapters':
      return (
        <svg {...p}>
          <path d='M4 6.5h2M4 12h2M4 17.5h2' />
          <path d='M9.5 6.5h10.5M9.5 12h10.5M9.5 17.5h7' />
        </svg>
      );
    case 'transcript':
      return (
        <svg {...p}>
          <path d='M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-8l-4.5 3.2V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5Z' />
          <path d='M7.5 9.5h9M7.5 13h6' />
        </svg>
      );
    case 'moon':
      return (
        <svg {...p}>
          <path d='M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z' />
        </svg>
      );
    case 'queue':
      return (
        <svg {...p}>
          <path d='M4 6.5h16M4 11.5h16M4 16.5h9' />
          <path d='m16 15 4.5 2.8L16 20.6Z' fill={color} />
        </svg>
      );
    case 'download':
      return (
        <svg {...p}>
          <path d='M12 4.5v10.5M7.5 10.8 12 15.2l4.5-4.4' />
          <path d='M5 19.5h14' />
        </svg>
      );
    case 'plus':
      return (
        <svg {...p}>
          <path d='M12 5.5v13M5.5 12h13' />
        </svg>
      );
    case 'check':
      return (
        <svg {...p}>
          <path d='m5.5 12.5 4.2 4.2 8.8-9.4' />
        </svg>
      );
    case 'search':
      return (
        <svg {...p}>
          <circle cx='10.8' cy='10.8' r='6.3' />
          <path d='m15.6 15.6 4.6 4.6' />
        </svg>
      );
    case 'home':
      return (
        <svg {...p}>
          <circle cx='12' cy='12' r='8.5' />
          <path d='M10 8.6v6.8a.4.4 0 0 0 .6.3l5-3.4a.4.4 0 0 0 0-.6l-5-3.4a.4.4 0 0 0-.6.3Z' fill={color} stroke='none' />
        </svg>
      );
    case 'library':
      return (
        <svg {...p}>
          <path d='M5 4.5v15M9.5 4.5v15' />
          <path d='m13.8 5.4 4.1-1 3.3 14.6-4.1 1Z' />
        </svg>
      );
    case 'grip':
      return (
        <svg {...p}>
          <path d='M6 9h12M6 15h12' />
        </svg>
      );
    case 'speaker':
      return (
        <svg {...p}>
          <path d='M4.5 9.5h3l4.5-4v13l-4.5-4h-3Z' />
          <path d='M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11' />
        </svg>
      );
    case 'share':
      return (
        <svg {...p}>
          <path d='M12 15V4.5M8 8.2l4-3.8 4 3.8' />
          <path d='M7 11H6a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18 11h-1' />
        </svg>
      );
    case 'text':
      return (
        <svg {...p}>
          <path d='M4.5 18.5 9 6.5l4.5 12M6.2 14.2h5.6' />
          <path d='M15.5 12.4a2.8 2.8 0 0 1 5 1.7v4.4M20.5 15.8c-3.6 0-5.2.8-5.2 1.9 0 .9.8 1.3 1.8 1.3 1.7 0 3.4-1 3.4-3.2' />
        </svg>
      );
  }
}

/** Three bars that bounce while audio plays. Still in plates and under reduced motion. */
export function Playing({ color = t.amber, live = false }: { color?: string; live?: boolean }) {
  const bars = [0.55, 1, 0.75];
  return (
    <span aria-hidden style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 12, width: 14 }}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: `${h * 100}%`,
            borderRadius: 1.5,
            background: color,
            transformOrigin: 'bottom',
            animation: live ? `lw-eq 900ms ${i * 140}ms ease-in-out infinite alternate` : undefined
          }}
        />
      ))}
    </span>
  );
}

/** Keyframes used by the live demo. Rendered once inside a screen. */
export const keyframes = `
@keyframes lw-eq { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }
@keyframes lw-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes lw-pop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
`;
