import type { CSSProperties, ReactNode } from 'react';
import { tk } from './data';
import { p } from './theme';

/**
 * The sample design on the canvas: Moorage's "Reserve a slip" checkout card,
 * drawn the way the client's designers drew it. Six of its colors are strays;
 * `colors` maps each stray id to the color it currently has.
 */
export const CARD = { width: 320, height: 432 };

const font = "'Overpass', ui-sans-serif, system-ui, sans-serif";

const Dot = () => (
  <span
    aria-hidden
    style={{ display: 'inline-block', width: 3, height: 3, borderRadius: 2, background: 'currentColor', margin: '0 7px', verticalAlign: 'middle', position: 'relative', top: -1 }}
  />
);

/** A numbered marker outside the card's left edge, with a leader to the layer at (x, y). */
export type Pin = { n: number; x: number; y: number; tone: 'stray' | 'token' };

/** A layer painted with a stray. Selection outlines every layer of the stray. */
function Layer({
  id,
  selected,
  children,
  style
}: {
  id: string;
  selected?: string | null;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const on = selected === id;
  return (
    <div
      data-stray={id}
      style={{
        position: 'relative',
        outline: on ? `1.5px solid ${p.accent}` : '1.5px solid transparent',
        outlineOffset: 1,
        borderRadius: 1,
        ...style
      }}
    >
      {children}
    </div>
  );
}

function PinMark({ pin }: { pin: Pin }) {
  const color = pin.tone === 'stray' ? p.fail : p.pass;
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top: pin.y,
        left: -30,
        width: pin.x + 24,
        height: 0,
        borderTop: `1.5px dashed ${color}`,
        pointerEvents: 'none'
      }}
    >
      <span
        style={{
          position: 'absolute',
          right: -3,
          top: -3.75,
          width: 6,
          height: 6,
          borderRadius: 3,
          background: color
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: -22,
          top: -11.75,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: color,
          color: '#fff',
          font: `700 12px/22px ${p.ui}`,
          textAlign: 'center'
        }}
      >
        {pin.n}
      </span>
    </span>
  );
}

export function SampleCard({
  colors,
  selected,
  pins,
  style
}: {
  colors: Record<string, string>;
  selected?: string | null;
  pins?: Pin[];
  style?: CSSProperties;
}) {
  const layer = (id: string, children: ReactNode, s?: CSSProperties) => (
    <Layer id={id} selected={selected} style={s}>
      {children}
    </Layer>
  );
  const fee = (label: string, amount: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', height: 22 }}>
      {layer('fees', <span style={{ color: colors.fees }}>{label}</span>)}
      <span style={{ color: tk('ink/900'), fontVariantNumeric: 'tabular-nums' }}>{amount}</span>
    </div>
  );
  const divider = () => layer('divider', <div style={{ height: 1, background: colors.divider }} />);

  return (
    <div
      style={{
        width: CARD.width,
        height: CARD.height,
        boxSizing: 'border-box',
        padding: 20,
        borderRadius: 14,
        background: tk('paper/0'),
        boxShadow: `inset 0 0 0 1px ${tk('fog/300')}, 0 1px 2px rgba(20,32,43,0.06), 0 8px 24px -12px rgba(20,32,43,0.18)`,
        fontFamily: font,
        color: tk('ink/900'),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style
      }}
    >
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: tk('ink/500'), height: 14 }}>
        WILLAMETTE MOORAGE<Dot />DOCK B
      </div>
      {layer(
        'title',
        <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: '-0.02em', color: colors.title, lineHeight: '26px' }}>
          Slip B-14, 32 ft
        </div>,
        { marginTop: 6 }
      )}
      <div style={{ fontSize: 13, color: tk('ink/700'), marginTop: 3, lineHeight: '18px' }}>
        Fri, Nov 13 to Mon, Nov 16<Dot />3 nights
      </div>
      <div style={{ marginTop: 14 }}>{divider()}</div>
      <div
        style={{
          marginTop: 14,
          padding: '10px 12px',
          borderRadius: 9,
          background: tk('fog/100'),
          fontSize: 13
        }}
      >
        {fee('3 nights × $54.00', '$162.00')}
        {fee('Shore power, 30 amp', '$18.00')}
        {fee('Taxes and fees', '$14.58')}
        <div style={{ height: 1, background: tk('fog/300'), margin: '6px 0 6px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', height: 22, fontSize: 15, fontWeight: 750 }}>
          <span>Total</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>$194.58</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          minHeight: 40,
          padding: '0 12px',
          borderRadius: 9,
          background: tk('kelp/100'),
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12.5,
          fontWeight: 600
        }}
      >
        {layer(
          'notice',
          <svg width='15' height='15' viewBox='0 0 16 16' fill='none' style={{ display: 'block' }}>
            <circle cx='8' cy='8' r='6.2' stroke={colors.notice} strokeWidth='1.8' />
            <path d='m5.3 8.2 1.8 1.8 3.6-3.8' stroke={colors.notice} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        )}
        {layer('notice', <span style={{ color: colors.notice }}>Free cancellation until Wed, Nov 11, 5 pm</span>)}
      </div>
      <div style={{ marginTop: 14 }}>{divider()}</div>
      <div style={{ marginTop: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 18 }}>
        {layer(
          'link',
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.link, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Add promo code
          </span>
        )}
        <span style={{ fontSize: 12.5, color: tk('ink/700') }}>Pay with gift card</span>
      </div>
      {layer(
        'button',
        <div
          style={{
            height: 44,
            borderRadius: 9,
            background: colors.button,
            color: tk('paper/0'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 650
          }}
        >
          Reserve for $194.58
        </div>,
        { marginTop: 12 }
      )}
      <div style={{ fontSize: 11.5, color: tk('ink/500'), textAlign: 'center', marginTop: 9, lineHeight: '16px' }}>
        You will not be charged until check-in.
      </div>
      {pins?.map((pin) => <PinMark key={pin.n} pin={pin} />)}
    </div>
  );
}

/** A second frame from the same file, for canvas context: notification settings. */
export function SettingsCard({ style }: { style?: CSSProperties }) {
  const rows: [string, string, boolean][] = [
    ['Booking confirmations', 'Email and text', true],
    ['Slip opens on your waitlist', 'Within a minute', true],
    ['Small craft advisories', 'River forecast, 6 am', true],
    ['Monthly statement', 'First of the month', false],
    ['Offers from partner marinas', 'About twice a year', false]
  ];
  return (
    <div
      style={{
        width: CARD.width,
        height: CARD.height,
        boxSizing: 'border-box',
        padding: 20,
        borderRadius: 14,
        background: tk('paper/0'),
        boxShadow: `inset 0 0 0 1px ${tk('fog/300')}, 0 1px 2px rgba(20,32,43,0.06), 0 8px 24px -12px rgba(20,32,43,0.18)`,
        fontFamily: font,
        color: tk('ink/900'),
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: '-0.02em', lineHeight: '26px' }}>Notifications</div>
      <div style={{ fontSize: 13, color: tk('ink/700'), marginTop: 3 }}>How Moorage reaches you about slip B-14.</div>
      <div style={{ display: 'flex', marginTop: 14, padding: 3, borderRadius: 9, background: tk('fog/100'), fontSize: 12.5, fontWeight: 650 }}>
        {['Email', 'Text', 'Push'].map((c, i) => (
          <span
            key={c}
            style={{
              flex: 1,
              height: 28,
              borderRadius: 7,
              display: 'grid',
              placeItems: 'center',
              background: i === 1 ? tk('paper/0') : 'transparent',
              boxShadow: i === 1 ? `0 1px 2px rgba(20,32,43,0.12), inset 0 0 0 1px ${tk('fog/300')}` : 'none',
              color: i === 1 ? tk('ink/900') : '#6F7B88'
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 6 }}>
        {rows.map(([title, sub, on], i) => (
          <div
            key={title}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 50,
              borderTop: i ? '1px solid #DFE4E9' : 'none'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#17222C' }}>{title}</div>
              <div style={{ fontSize: 11.5, color: '#727E8A', marginTop: 1 }}>{sub}</div>
            </div>
            <span
              style={{
                width: 34,
                height: 20,
                borderRadius: 10,
                background: on ? '#1A7392' : '#CBD3DB',
                position: 'relative',
                flex: 'none'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: on ? 16 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: '#fff',
                  boxShadow: '0 1px 2px rgba(20,32,43,0.25)'
                }}
              />
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 'auto',
          height: 44,
          borderRadius: 9,
          background: tk('ink/900'),
          color: tk('paper/0'),
          display: 'grid',
          placeItems: 'center',
          fontSize: 15,
          fontWeight: 650
        }}
      >
        Save changes
      </div>
    </div>
  );
}
