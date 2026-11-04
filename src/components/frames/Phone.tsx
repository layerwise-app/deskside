import type { CSSProperties, ReactNode } from 'react';

export const PHONE = { width: 390, height: 844 };

type PhoneProps = {
  children: ReactNode;
  /** Status bar ink: `dark` for light screens, `light` for dark screens. */
  bar?: 'dark' | 'light';
  /** Screen background, shown behind the status bar. */
  screen?: string;
  time?: string;
  /** Scales the whole device; layout space shrinks with it. */
  scale?: number;
  className?: string;
  style?: CSSProperties;
  /** Hide the status bar for full-bleed screens that draw their own. */
  statusBar?: boolean;
  /**
   * Scale with the viewport instead of `scale`: 0.74 on phones, 0.82 from
   * 768px up. Use it in live demos so their reserved height stays exact.
   */
  fit?: boolean;
};

/**
 * A generic phone drawn in code around a real 390×844 screen. The status bar
 * is 47px tall and the home indicator area 34px; screens should pad for both.
 */
export function Phone({
  children,
  bar = 'dark',
  screen = '#ffffff',
  time = '9:41',
  scale = 1,
  className,
  style,
  statusBar = true,
  fit = false
}: PhoneProps) {
  const bezel = 11;
  const outerW = PHONE.width + bezel * 2;
  const outerH = PHONE.height + bezel * 2;
  const ink = bar === 'dark' ? '#111111' : '#ffffff';
  return (
    <div
      className={[fit ? 'phone-fit' : '', className].filter(Boolean).join(' ') || undefined}
      style={{
        width: fit ? `calc(${outerW}px * var(--phone-scale))` : outerW * scale,
        height: fit ? `calc(${outerH}px * var(--phone-scale))` : outerH * scale,
        flex: 'none',
        ...style
      }}
    >
      <div
        style={{
          width: outerW,
          height: outerH,
          transform: fit ? 'scale(var(--phone-scale))' : scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: '0 0',
          borderRadius: 62,
          padding: bezel,
          background: 'linear-gradient(145deg, #3b3b3d 0%, #18181a 38%, #0c0c0d 100%)',
          boxShadow:
            'inset 0 0 0 1.5px rgba(255,255,255,0.14), inset 0 0 0 4px #0a0a0b, 0 30px 60px -20px rgba(20,20,30,0.35), 0 12px 24px -12px rgba(20,20,30,0.25)',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: PHONE.width,
            height: PHONE.height,
            borderRadius: 51,
            overflow: 'hidden',
            position: 'relative',
            background: screen,
            isolation: 'isolate'
          }}
        >
          {children}
          {statusBar && <StatusBar ink={ink} time={time} />}
          {/* Front camera */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 13,
              left: '50%',
              width: 22,
              height: 22,
              marginLeft: -11,
              borderRadius: 11,
              background: 'radial-gradient(circle at 40% 40%, #2a2d3a 0 3px, #050506 4px)',
              zIndex: 20
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 9,
              left: '50%',
              width: 134,
              height: 5,
              marginLeft: -67,
              borderRadius: 3,
              background: ink,
              opacity: 0.85,
              zIndex: 20
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatusBar({ ink, time }: { ink: string; time: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 47,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 30px 0 40px',
        color: ink,
        font: '600 16px/1 ui-sans-serif, system-ui, -apple-system, sans-serif',
        letterSpacing: '-0.01em',
        zIndex: 19,
        pointerEvents: 'none'
      }}
    >
      <span>{time}</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width='18' height='12' viewBox='0 0 18 12' fill={ink}>
          <rect x='0' y='8' width='3' height='4' rx='1' />
          <rect x='5' y='5.5' width='3' height='6.5' rx='1' />
          <rect x='10' y='3' width='3' height='9' rx='1' />
          <rect x='15' y='0' width='3' height='12' rx='1' />
        </svg>
        <svg width='16' height='12' viewBox='0 0 16 12' fill='none' stroke={ink} strokeWidth='2' strokeLinecap='round'>
          <path d='M1.5 4.2a9.6 9.6 0 0 1 13 0' />
          <path d='M4.2 7a5.6 5.6 0 0 1 7.6 0' />
          <circle cx='8' cy='10' r='1' fill={ink} stroke='none' />
        </svg>
        <svg width='27' height='13' viewBox='0 0 27 13' fill='none'>
          <rect x='0.5' y='0.5' width='23' height='12' rx='3.5' stroke={ink} opacity='0.4' />
          <rect x='2' y='2' width='17' height='9' rx='2' fill={ink} />
          <path d='M25 4.5v4a2 2 0 0 0 0-4Z' fill={ink} opacity='0.45' />
        </svg>
      </span>
    </div>
  );
}

/**
 * A full-viewport background for rendering stills: the device or detail sits
 * centered on the project's color. Used by each project's `plates.tsx`.
 */
export function Plate({
  children,
  background,
  style
}: {
  children: ReactNode;
  background: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
}
