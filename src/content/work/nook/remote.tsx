import { useId, type CSSProperties, type ReactNode } from 'react';
import { modeOrder, type Mode } from './data';
import { ModeGlyph, n } from './theme';

/**
 * The Nook remote, drawn top-down at 5 px per millimetre: a 64 × 96 mm
 * pebble with an endless dial, a light ring, three mode lights, and four
 * keys with e-ink labels. All coordinates below are in that 320 × 480 box.
 */
export const REMOTE = { width: 320, height: 480 };
export const DIAL = { cx: 160, cy: 154, knob: 88, ring: 101, well: 108.5, reach: 112 };
export const KEYS = { w: 92, h: 56, gap: 8, x: 64, y: 306 };
export const keyBox = (i: number) => ({
  left: KEYS.x + (i % 2) * (KEYS.w + KEYS.gap),
  top: KEYS.y + Math.floor(i / 2) * (KEYS.h + KEYS.gap)
});
export const MODES_ROW = { y: 283, x: { light: 114, heat: 160, music: 206 } as Record<Mode, number> };

export type Finish = 'charcoal' | 'clay';

export const finishes = {
  charcoal: {
    bodyHi: '#403A36',
    bodyLo: '#1F1C1A',
    sheen: 'rgba(255,255,255,0.11)',
    rimHi: 'rgba(255,255,255,0.26)',
    rimLo: 'rgba(0,0,0,0.5)',
    groove: '#161412',
    pipe: '#3A3430',
    knobHi: '#504A44',
    knobLo: '#1D1A18',
    faceHi: '#252220',
    faceLo: '#3C3733',
    tick: 'rgba(255,255,255,0.08)',
    dimpleHi: 'rgba(0,0,0,0.55)',
    dimpleLo: 'rgba(255,255,255,0.12)',
    glyph: '#837A72',
    keyHi: '#3D3834',
    keyLo: '#2D2926',
    keyEdge: '#151311',
    keySheen: 'rgba(255,255,255,0.09)',
    eink: '#DBD6CB',
    led: '#4A443F',
    logo: '#5E5751'
  },
  clay: {
    bodyHi: '#F1EBE2',
    bodyLo: '#C8BFB1',
    sheen: 'rgba(255,255,255,0.6)',
    rimHi: 'rgba(255,255,255,0.85)',
    rimLo: 'rgba(80,62,44,0.25)',
    groove: '#B4A999',
    pipe: '#EEE9E1',
    knobHi: '#F4EFE8',
    knobLo: '#C2B8A9',
    faceHi: '#CFC6B8',
    faceLo: '#E8E2D8',
    tick: 'rgba(70,52,36,0.1)',
    dimpleHi: 'rgba(70,52,36,0.38)',
    dimpleLo: 'rgba(255,255,255,0.7)',
    glyph: '#9A8F82',
    keyHi: '#F0EBE2',
    keyLo: '#DCD4C7',
    keyEdge: '#B3A999',
    keySheen: 'rgba(255,255,255,0.8)',
    eink: '#D4D0C6',
    led: '#C8BFB1',
    logo: '#A99F91'
  }
};
type FinishSpec = (typeof finishes)['charcoal'];

/** A superellipse, close to the pebble the industrial designer carved. */
const BODY = (() => {
  const cx = 160;
  const cy = 240;
  const a = 150;
  const b = 230;
  const e = 2 / 3.2;
  const steps = 360;
  let d = '';
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = cx + a * Math.sign(c) * Math.abs(c) ** e;
    const y = cy + b * Math.sign(s) * Math.abs(s) ** e;
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
})();

/** Knurling on the dial's edge: 60 fine ridges. */
const TICKS = (() => {
  const { cx, cy, knob } = DIAL;
  let d = '';
  for (let i = 0; i < 60; i++) {
    const t = (i / 60) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    d += `M${(cx + c * (knob - 7.5)).toFixed(2)} ${(cy + s * (knob - 7.5)).toFixed(2)}L${(cx + c * (knob - 1.5)).toFixed(2)} ${(cy + s * (knob - 1.5)).toFixed(2)}`;
  }
  return d;
})();

function useSvgId() {
  return `nk${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

function Defs({ id, f }: { id: string; f: FinishSpec }) {
  return (
    <defs>
      <linearGradient id={`${id}b`} x1='0.15' y1='0' x2='0.85' y2='1'>
        <stop offset='0' stopColor={f.bodyHi} />
        <stop offset='1' stopColor={f.bodyLo} />
      </linearGradient>
      <radialGradient id={`${id}s`} cx='0.3' cy='0.12' r='0.7'>
        <stop offset='0' stopColor={f.sheen} />
        <stop offset='1' stopColor={f.sheen} stopOpacity='0' />
      </radialGradient>
      <linearGradient id={`${id}r`} x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stopColor={f.rimHi} />
        <stop offset='0.55' stopColor={f.rimHi} stopOpacity='0' />
        <stop offset='1' stopColor={f.rimLo} />
      </linearGradient>
      <linearGradient id={`${id}w`} x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stopColor={f.rimLo} />
        <stop offset='1' stopColor={f.rimHi} />
      </linearGradient>
      <linearGradient id={`${id}k`} x1='0.25' y1='0' x2='0.75' y2='1'>
        <stop offset='0' stopColor={f.knobHi} />
        <stop offset='1' stopColor={f.knobLo} />
      </linearGradient>
      <linearGradient id={`${id}f`} x1='0.25' y1='0' x2='0.75' y2='1'>
        <stop offset='0' stopColor={f.faceHi} />
        <stop offset='1' stopColor={f.faceLo} />
      </linearGradient>
      <linearGradient id={`${id}d`} x1='0.3' y1='0' x2='0.7' y2='1'>
        <stop offset='0' stopColor={f.dimpleHi} />
        <stop offset='1' stopColor={f.dimpleLo} />
      </linearGradient>
      <filter id={`${id}g`} x='-25%' y='-25%' width='150%' height='150%'>
        <feGaussianBlur stdDeviation='5' />
      </filter>
    </defs>
  );
}

/** The dial in its well, with the light ring filled to `fill` (0 to 1). */
function DialGroup({
  id,
  f,
  fill,
  rotation,
  ease
}: {
  id: string;
  f: FinishSpec;
  fill: number;
  rotation: number;
  ease: number;
}) {
  const { cx, cy, knob, ring, well } = DIAL;
  const c = 2 * Math.PI * ring;
  const lit = Math.max(0, Math.min(1, fill));
  const arc = (width: number, stroke: string, extra?: Record<string, unknown>) => (
    <circle
      cx={cx}
      cy={cy}
      r={ring}
      fill='none'
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap='round'
      strokeDasharray={c}
      style={{
        strokeDashoffset: c * (1 - lit),
        transition: ease ? `stroke-dashoffset ${ease}ms cubic-bezier(0.25, 0.8, 0.25, 1)` : undefined
      }}
      {...extra}
    />
  );
  return (
    <g>
      <circle cx={cx} cy={cy} r={well} fill={f.groove} />
      <circle cx={cx} cy={cy} r={well} fill='none' stroke={`url(#${id}w)`} strokeWidth='1.5' />
      <circle cx={cx} cy={cy} r={ring} fill='none' stroke={f.pipe} strokeWidth='7' />
      <g
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ opacity: lit > 0.003 ? 1 : 0, transition: ease ? 'opacity 160ms' : undefined }}
      >
        {arc(14, n.glow, { filter: `url(#${id}g)`, opacity: 0.8 })}
        {arc(7, n.glow)}
        {arc(1.8, '#FFD9C6', { opacity: 0.9 })}
      </g>
      <circle cx={cx} cy={cy} r={knob} fill={`url(#${id}k)`} />
      <g transform={`rotate(${rotation} ${cx} ${cy})`}>
        <path d={TICKS} stroke={f.tick} strokeWidth='1.5' strokeLinecap='round' />
      </g>
      <circle cx={cx} cy={cy} r={knob - 9} fill={`url(#${id}f)`} />
      <circle cx={cx} cy={cy} r={knob - 9} fill='none' stroke={`url(#${id}w)`} strokeWidth='1.4' />
      <g transform={`rotate(${rotation} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy - knob + 24} r='6.5' fill={`url(#${id}d)`} />
      </g>
    </g>
  );
}

/** One scene key with its e-ink label and a small light under it. */
export function KeyCap({
  label,
  active = false,
  finish = 'charcoal',
  w = KEYS.w,
  h = KEYS.h
}: {
  label: string;
  active?: boolean;
  finish?: Finish;
  w?: number;
  h?: number;
}) {
  const f = finishes[finish];
  const k = h / KEYS.h;
  const inset = 7 * k;
  const size = (label.length > 8 ? 12 : label.length > 6 ? 13.5 : 14.5) * k;
  return (
    <span
      className='nook-cap'
      style={{
        display: 'block',
        position: 'relative',
        width: w,
        height: h,
        borderRadius: 15 * k,
        background: `linear-gradient(180deg, ${f.keyHi}, ${f.keyLo})`,
        boxShadow: `0 0 0 ${1.5 * k}px ${f.keyEdge}, inset 0 1px 0 ${f.keySheen}, 0 ${2 * k}px 0 ${f.keyEdge}`,
        transition: 'transform 90ms ease-out, box-shadow 90ms ease-out'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: inset,
          right: inset,
          top: inset,
          height: h - inset - 17 * k,
          borderRadius: 6 * k,
          background: f.eink,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2), inset 0 1.5px 2px rgba(0,0,0,0.14)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: n.font,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1,
          color: '#2A2724',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {label}
      </span>
      <span
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 6.5 * k,
          width: 16 * k,
          height: 3 * k,
          marginLeft: -8 * k,
          borderRadius: 2,
          background: active ? n.glow : f.led,
          boxShadow: active ? '0 0 6px 1px rgba(255,122,61,0.8)' : 'inset 0 1px 1px rgba(0,0,0,0.25)',
          transition: 'background 160ms, box-shadow 160ms'
        }}
      />
    </span>
  );
}

type RemoteProps = {
  finish?: Finish;
  /** How full the light ring is, 0 to 1. */
  fill: number;
  /** Where the knob has been turned to, in degrees. Only hands move it. */
  rotation?: number;
  mode?: Mode;
  labels?: string[];
  active?: number | null;
  /** A number, or a CSS expression such as `var(--nook-scale)`. */
  scale?: number | string;
  /** Ring transition in ms. 0 for stills. */
  ease?: number;
  shadow?: boolean;
  onKey?: (i: number) => void;
  onMode?: (m: Mode) => void;
  /** Drawn on top in the remote's 320 × 480 coordinates, e.g. the dial's hit area. */
  children?: ReactNode;
  style?: CSSProperties;
};

const modeNames: Record<Mode, string> = { light: 'Lights', heat: 'Heat', music: 'Music' };

export function Remote({
  finish = 'charcoal',
  fill,
  rotation = 0,
  mode = 'heat',
  labels = ['Morning', 'Dinner', 'Movie', 'Away'],
  active = null,
  scale = 1,
  ease = 0,
  shadow = true,
  onKey,
  onMode,
  children,
  style
}: RemoteProps) {
  const id = useSvgId();
  const f = finishes[finish];
  const s = typeof scale === 'number' ? String(scale) : scale;
  const KeyTag = onKey ? 'button' : 'div';
  const ModeTag = onMode ? 'button' : 'div';
  return (
    <div
      className='nook-remote'
      style={{
        width: `calc(${REMOTE.width}px * ${s})`,
        height: `calc(${REMOTE.height}px * ${s})`,
        flex: 'none',
        position: 'relative',
        ...style
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: REMOTE.width,
          height: REMOTE.height,
          transform: `scale(${s})`,
          transformOrigin: '0 0'
        }}
      >
        {shadow && (
          <svg
            width={REMOTE.width}
            height={REMOTE.height}
            viewBox='0 0 320 480'
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            aria-hidden
          >
            <filter id={`${id}h`} x='-40%' y='-40%' width='180%' height='180%'>
              <feGaussianBlur stdDeviation='20' />
            </filter>
            <filter id={`${id}c`} x='-20%' y='-20%' width='140%' height='140%'>
              <feGaussianBlur stdDeviation='4' />
            </filter>
            <path d={BODY} transform='translate(3.2 26) scale(0.98)' fill='rgba(52,38,28,0.34)' filter={`url(#${id}h)`} />
            <path d={BODY} transform='translate(0 5)' fill='rgba(40,30,22,0.28)' filter={`url(#${id}c)`} />
          </svg>
        )}
        <svg
          width={REMOTE.width}
          height={REMOTE.height}
          viewBox='0 0 320 480'
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          aria-hidden
        >
          <Defs id={id} f={f} />
          <path d={BODY} fill={`url(#${id}b)`} />
          <path d={BODY} fill={`url(#${id}s)`} />
          <path d={BODY} fill='none' stroke={`url(#${id}r)`} strokeWidth='1.6' />
          <DialGroup id={id} f={f} fill={fill} rotation={rotation} ease={ease} />
          <text
            x='160'
            y='452'
            textAnchor='middle'
            fontFamily={n.font}
            fontWeight='600'
            fontSize='13'
            letterSpacing='2.2'
            fill={f.logo}
          >
            nook
          </text>
        </svg>

        {children}
        <div
          role={onMode ? 'radiogroup' : undefined}
          aria-label={onMode ? 'What the dial controls' : undefined}
          aria-hidden={onMode ? undefined : true}
        >
          {modeOrder.map((m) => {
            const on = m === mode;
            return (
              <ModeTag
                key={m}
                className={onMode ? 'nook-mode' : undefined}
                {...(onMode
                  ? {
                      type: 'button' as const,
                      role: 'radio',
                      'aria-checked': on,
                      'aria-label': modeNames[m],
                      onClick: () => onMode(m)
                    }
                  : {})}
                style={{
                  position: 'absolute',
                  left: MODES_ROW.x[m] - 21,
                  top: MODES_ROW.y - 16,
                  width: 42,
                  height: 32,
                  padding: 0,
                  border: 'none',
                  borderRadius: 10,
                  background: 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  color: on ? n.glow : f.glyph,
                  cursor: onMode ? 'pointer' : undefined,
                  transition: 'color 160ms'
                }}
              >
                <ModeGlyph
                  mode={m}
                  size={19}
                  width={1.9}
                  style={{
                    filter: on ? 'drop-shadow(0 0 3px rgba(255,122,61,0.9))' : 'none',
                    transition: 'filter 160ms'
                  }}
                />
              </ModeTag>
            );
          })}
        </div>

        {labels.map((label, i) => {
          const box = keyBox(i);
          return (
            <KeyTag
              key={i}
              className={onKey ? 'nook-key' : undefined}
              {...(onKey
                ? { type: 'button' as const, 'aria-pressed': active === i, onClick: () => onKey(i) }
                : { 'aria-hidden': true })}
              style={{
                position: 'absolute',
                left: box.left,
                top: box.top,
                width: KEYS.w,
                height: KEYS.h,
                padding: 0,
                border: 'none',
                borderRadius: 15,
                background: 'transparent',
                font: 'inherit',
                cursor: onKey ? 'pointer' : undefined
              }}
            >
              <KeyCap label={label} active={active === i} finish={finish} />
            </KeyTag>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The same dial, cut out of the pebble, for the app. The phone draws it at
 * the same proportions so what people learn on one works on the other.
 */
export function DialArt({
  size,
  fill,
  rotation = 0,
  finish = 'charcoal'
}: {
  size: number;
  fill: number;
  rotation?: number;
  finish?: Finish;
}) {
  const id = useSvgId();
  const f = finishes[finish];
  const r = 126;
  const { cx, cy } = DIAL;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${cx - r - 2} ${cy - r - 2} ${2 * r + 4} ${2 * r + 4}`}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden
    >
      <Defs id={id} f={f} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}b)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}s)`} />
      <circle cx={cx} cy={cy} r={r} fill='none' stroke={`url(#${id}r)`} strokeWidth='1.4' />
      <DialGroup id={id} f={f} fill={fill} rotation={rotation} ease={0} />
    </svg>
  );
}
