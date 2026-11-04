import type { ReactNode } from 'react';
import { ItemArt, items, type Item } from './items';
import { Button, Pill, Screen, TabBar, t } from './theme';

const money = (n: number) => `$${n}`;

function Header({ children }: { children: ReactNode }) {
  return <div style={{ padding: '58px 20px 0' }}>{children}</div>;
}

function PickupBadge() {
  return (
    <span
      style={{
        position: 'absolute',
        left: 8,
        top: 8,
        height: 22,
        padding: '0 8px',
        borderRadius: 11,
        background: 'rgba(255,251,244,0.92)',
        fontSize: 11,
        fontWeight: 650,
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 3, background: t.sage }} />
      Porch pickup
    </span>
  );
}

function Tile({ item }: { item: Item }) {
  return (
    <div>
      <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 14, overflow: 'hidden' }}>
        <ItemArt kind={item.kind} />
        {item.pickup && <PickupBadge />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 550, lineHeight: 1.25 }}>{item.title}</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{money(item.price)}</div>
      </div>
      <div style={{ fontSize: 12, color: t.soft, marginTop: 2 }}>
        {item.hood} · {item.miles} mi
      </div>
    </div>
  );
}

/** The home feed: what neighbors are selling within walking distance. */
export function FeedScreen() {
  return (
    <Screen>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: t.soft, fontWeight: 600 }}>Within 3 mi of</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em' }}>
              Sellwood <span style={{ color: t.tomato }}>↓</span>
            </div>
          </div>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              boxShadow: `inset 0 0 0 1.5px ${t.line}`,
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke={t.ink} strokeWidth='2.2'>
              <circle cx='10.5' cy='10.5' r='6.5' />
              <path d='m15.5 15.5 5 5' strokeLinecap='round' />
            </svg>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, overflow: 'hidden' }}>
          <Pill active>All</Pill>
          <Pill>Furniture</Pill>
          <Pill>Plants</Pill>
          <Pill>Kitchen</Pill>
          <Pill>Bikes</Pill>
        </div>
      </Header>
      <div
        style={{
          padding: '18px 20px 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '18px 14px',
          overflow: 'hidden',
          flex: 1
        }}
      >
        {items.slice(0, 6).map((item) => (
          <Tile key={item.id} item={item} />
        ))}
      </div>
      <TabBar active='nearby' />
    </Screen>
  );
}

/** Sold prices of similar items nearby, as a range instead of a guess. */
export function CompsBar({ low, high, price }: { low: number; high: number; price: number }) {
  const min = low - 30;
  const max = high + 30;
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div style={{ position: 'relative', height: 28 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 12, height: 4, borderRadius: 2, background: t.line }} />
        <div
          style={{
            position: 'absolute',
            left: pos(low),
            width: `calc(${pos(high)} - ${pos(low)})`,
            top: 12,
            height: 4,
            borderRadius: 2,
            background: t.sage
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: pos(price),
            top: 4,
            width: 20,
            height: 20,
            marginLeft: -10,
            borderRadius: 10,
            background: t.ink,
            boxShadow: `0 0 0 3px ${t.paper}`
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.soft }}>
        <span>{money(min)}</span>
        <span style={{ color: t.ink, fontWeight: 600 }}>
          Sold nearby: {money(low)}–{money(high)}
        </span>
        <span>{money(max)}</span>
      </div>
    </div>
  );
}

/** One listing, with comps and the next free pickup windows. */
export function DetailScreen() {
  const item = items[0];
  return (
    <Screen>
      <div style={{ height: 420, position: 'relative' }}>
        <ItemArt kind='dresser' />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: i === 0 ? 18 : 6, height: 6, borderRadius: 3, background: i === 0 ? t.ink : 'rgba(42,33,27,0.3)' }} />
          ))}
        </div>
      </div>
      <div style={{ padding: '18px 20px 0', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{item.title}</div>
          <div style={{ fontSize: 26, fontWeight: 750 }}>{money(item.price)}</div>
        </div>
        <div style={{ fontSize: 13, color: t.soft, marginTop: 6 }}>
          Good condition · one drawer sticks in damp weather
        </div>
        <div style={{ marginTop: 18 }}>
          <CompsBar low={60} high={95} price={85} />
        </div>
        <div
          style={{
            marginTop: 18,
            padding: '12px 14px',
            borderRadius: 14,
            background: t.cream,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 19, background: t.butter, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            R
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 650, fontSize: 14.5 }}>Ruth · Sellwood</div>
            <div style={{ fontSize: 12.5, color: t.soft }}>23 pickups · replies in about an hour</div>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 650 }}>0.6 mi</span>
        </div>
        <div style={{ fontSize: 12.5, color: t.soft, marginTop: 14 }}>
          Next windows: <b style={{ color: t.ink }}>Sat 10–12</b>, Sat 2–4, Sun 9–11
        </div>
      </div>
      <div style={{ padding: '12px 20px 40px', display: 'flex', gap: 10 }}>
        <Button tone='ghost' style={{ width: 62 }}>
          ♡
        </Button>
        <Button style={{ flex: 1 }}>Book a pickup</Button>
      </div>
    </Screen>
  );
}

/** Listing starts with the camera: three guided shots. */
export function CameraScreen() {
  const shots = [
    { label: 'Front', done: true },
    { label: 'Detail', done: true },
    { label: 'Wide', done: false }
  ];
  return (
    <Screen bg='#14110e' style={{ color: '#fff' }}>
      <div style={{ position: 'absolute', inset: '0 0 230px 0', overflow: 'hidden' }}>
        <ItemArt kind='dresser' framing='normal' style={{ filter: 'saturate(0.95) brightness(0.96)' }} />
        {/* Framing guide */}
        <div
          style={{
            position: 'absolute',
            inset: '120px 26px 70px',
            border: '2px solid rgba(255,255,255,0.85)',
            borderRadius: 18
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 650
          }}
        >
          <span style={{ background: 'rgba(20,17,14,0.72)', padding: '8px 14px', borderRadius: 18 }}>
            Step back so the whole piece fits
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 230, background: '#14110e', padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {shots.map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: s.done ? 'none' : 'inset 0 0 0 1.5px rgba(255,255,255,0.4)',
                  outline: i === 2 ? `2px solid ${t.tomato}` : 'none',
                  outlineOffset: 2
                }}
              >
                {s.done && <ItemArt kind='dresser' framing={i === 1 ? 'close' : 'normal'} />}
              </div>
              <div style={{ fontSize: 11.5, marginTop: 6, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, padding: '0 22px' }}>
          <span style={{ fontSize: 15, opacity: 0.85 }}>Cancel</span>
          <span style={{ width: 74, height: 74, borderRadius: 37, border: '4px solid #fff', display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 58, height: 58, borderRadius: 29, background: '#fff' }} />
          </span>
          <span style={{ fontSize: 15, opacity: 0.85 }}>2 of 3</span>
        </div>
      </div>
    </Screen>
  );
}

function Field({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${t.line}` }}>
      <div style={{ fontSize: 12, color: t.soft, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: t.sage, fontWeight: 600, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

/** After the photos: everything filled in from similar sold items. */
export function ReviewScreen() {
  return (
    <Screen>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600 }}>
          <span style={{ color: t.soft }}>Back</span>
          <span>Review</span>
          <span style={{ color: t.tomato }}>Post</span>
        </div>
      </Header>
      <div style={{ padding: '16px 20px 0', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, height: 190 }}>
          <div style={{ gridRow: 'span 2', borderRadius: 14, overflow: 'hidden' }}>
            <ItemArt kind='dresser' />
          </div>
          <div style={{ borderRadius: 10, overflow: 'hidden' }}>
            <ItemArt kind='dresser' framing='close' />
          </div>
          <div style={{ borderRadius: 10, overflow: 'hidden' }}>
            <ItemArt kind='dresser' style={{ transform: 'scale(1.3)' }} />
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 12.5,
            fontWeight: 650,
            color: t.ink,
            background: t.sageSoft,
            borderRadius: 10,
            padding: '8px 12px'
          }}
        >
          Filled in from 14 similar dressers sold near you. Tap anything to change it.
        </div>
        <Field label='Title' value='Walnut lowboy dresser, 6 drawers' />
        <Field label='Category' value='Furniture › Dressers' hint='Suggested' />
        <Field label='Condition' value={<><Pill active style={{ height: 28 }}>Good</Pill><Pill style={{ height: 28 }}>Like new</Pill><Pill style={{ height: 28 }}>Worn</Pill></>} />
        <div style={{ padding: '14px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, color: t.soft, fontWeight: 600 }}>Price</span>
            <span style={{ fontSize: 24, fontWeight: 750 }}>$85</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <CompsBar low={60} high={95} price={85} />
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 20px 40px' }}>
        <Button>Post for pickup</Button>
      </div>
    </Screen>
  );
}

export type PickupDay = { id: string; dow: string; date: string; windows: { id: string; label: string; taken?: boolean }[] };

export const pickupDays: PickupDay[] = [
  {
    id: 'fri',
    dow: 'Fri',
    date: 'Nov 7',
    windows: [
      { id: 'fri-5', label: '5:00 – 7:00 pm' },
      { id: 'fri-7', label: '7:00 – 9:00 pm', taken: true }
    ]
  },
  {
    id: 'sat',
    dow: 'Sat',
    date: 'Nov 8',
    windows: [
      { id: 'sat-10', label: '10:00 am – 12:00 pm' },
      { id: 'sat-2', label: '2:00 – 4:00 pm' },
      { id: 'sat-4', label: '4:00 – 6:00 pm', taken: true }
    ]
  },
  {
    id: 'sun',
    dow: 'Sun',
    date: 'Nov 9',
    windows: [
      { id: 'sun-9', label: '9:00 – 11:00 am' },
      { id: 'sun-1', label: '1:00 – 3:00 pm' }
    ]
  }
];

type PickupProps = {
  day: string;
  window: string | null;
  onDay?: (id: string) => void;
  onWindow?: (id: string) => void;
  onConfirm?: () => void;
};

/** Choose one of the seller's windows. A $5 hold keeps both sides honest. */
export function PickupScreen({ day, window, onDay, onWindow, onConfirm }: PickupProps) {
  const current = pickupDays.find((d) => d.id === day)!;
  const interactive = Boolean(onDay);
  const Tag = interactive ? 'button' : 'div';
  return (
    <Screen>
      <Header>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.soft }}>Walnut lowboy dresser · $85</div>
        <div style={{ fontSize: 28, fontWeight: 750, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1.1 }}>
          When can you
          <br />
          come by?
        </div>
        <div style={{ fontSize: 13.5, color: t.soft, marginTop: 8 }}>
          Ruth leaves it on her porch in SE Harold St. You get the address once booked.
        </div>
      </Header>
      <div role={interactive ? 'radiogroup' : undefined} aria-label={interactive ? 'Pickup day' : undefined} style={{ display: 'flex', gap: 10, padding: '22px 20px 0' }}>
        {pickupDays.map((d) => {
          const active = d.id === day;
          return (
            <Tag
              key={d.id}
              {...(interactive
                ? { type: 'button' as const, role: 'radio', 'aria-checked': active, onClick: () => onDay?.(d.id) }
                : {})}
              style={{
                flex: 1,
                height: 70,
                borderRadius: 16,
                border: 'none',
                font: 'inherit',
                color: active ? t.paper : t.ink,
                background: active ? t.ink : t.cream,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: interactive ? 'pointer' : undefined,
                transition: 'background 160ms, color 160ms'
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.75 }}>{d.dow}</span>
              <span style={{ fontSize: 17, fontWeight: 700 }}>{d.date}</span>
            </Tag>
          );
        })}
      </div>
      <div role={interactive ? 'radiogroup' : undefined} aria-label={interactive ? 'Pickup window' : undefined} style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {current.windows.map((w) => {
          const active = w.id === window;
          return (
            <Tag
              key={w.id}
              {...(interactive
                ? {
                    type: 'button' as const,
                    role: 'radio',
                    'aria-checked': active,
                    disabled: w.taken,
                    onClick: () => onWindow?.(w.id)
                  }
                : {})}
              style={{
                height: 58,
                borderRadius: 16,
                border: 'none',
                font: 'inherit',
                textAlign: 'left',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: w.taken ? '#A39689' : t.ink,
                background: t.paper,
                boxShadow: active ? `inset 0 0 0 2.5px ${t.tomato}` : `inset 0 0 0 1.5px ${t.line}`,
                cursor: interactive && !w.taken ? 'pointer' : undefined,
                transition: 'box-shadow 160ms'
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 650, textDecoration: w.taken ? 'line-through' : 'none' }}>{w.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: w.taken ? '#A39689' : active ? t.tomato : t.soft }}>
                {w.taken ? 'Booked' : active ? 'Selected' : 'Free'}
              </span>
            </Tag>
          );
        })}
      </div>
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ fontSize: 12.5, color: t.soft, textAlign: 'center', marginBottom: 10 }}>
          $5 hold, refunded when you pick up. Cancel free until 2 hours before.
        </div>
        {interactive ? (
          <button
            type='button'
            onClick={onConfirm}
            disabled={!window}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 16,
              border: 'none',
              font: 'inherit',
              fontSize: 17,
              fontWeight: 650,
              background: window ? t.tomato : t.line,
              color: window ? '#fff' : '#A39689',
              cursor: window ? 'pointer' : 'not-allowed',
              transition: 'background 160ms'
            }}
          >
            {window ? 'Hold this window · $5' : 'Pick a window'}
          </button>
        ) : (
          <Button>Hold this window · $5</Button>
        )}
      </div>
    </Screen>
  );
}

/** The booked pickup, shared by both people. */
export function ConfirmScreen({ windowLabel = 'Sat, Nov 8 · 10:00 am – 12:00 pm', onChange }: { windowLabel?: string; onChange?: () => void }) {
  return (
    <Screen bg={t.cream}>
      <Header>
        <div style={{ fontSize: 13, fontWeight: 650, color: t.sage, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: t.sage }} /> Pickup booked
        </div>
        <div style={{ fontSize: 28, fontWeight: 750, letterSpacing: '-0.03em', marginTop: 8, lineHeight: 1.1 }}>
          It’s on Ruth’s
          <br />
          porch for you.
        </div>
      </Header>
      <div style={{ margin: '22px 20px 0', borderRadius: 22, background: t.paper, overflow: 'hidden', boxShadow: '0 1px 0 rgba(42,33,27,0.08)' }}>
        <div style={{ height: 150 }}>
          <ItemArt kind='dresser' />
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 650, color: t.soft }}>When</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{windowLabel}</div>
          <div style={{ fontSize: 12, fontWeight: 650, color: t.soft, marginTop: 12 }}>Where</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>7314 SE Harold St</div>
          <div style={{ fontSize: 13, color: t.soft }}>Side porch, under the blue awning</div>
          <div style={{ height: 1, background: t.line, margin: '14px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>Pay Ruth at pickup</span>
            <b>$85</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 4, color: t.soft }}>
            <span>Hold, refunded at pickup</span>
            <span>$5</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: t.paper, borderRadius: 16, padding: '12px 14px', fontSize: 14, alignSelf: 'flex-start', maxWidth: '82%' }}>
          Great! Bring a friend, it’s heavy. The bottom left drawer sticks a bit.
          <div style={{ fontSize: 11, color: t.soft, marginTop: 4 }}>Ruth · 2 min ago</div>
        </div>
      </div>
      <div style={{ marginTop: 'auto', padding: '0 20px 40px', display: 'flex', gap: 10 }}>
        {onChange ? (
          <button
            type='button'
            onClick={onChange}
            style={{ flex: 1, height: 54, borderRadius: 16, border: 'none', font: 'inherit', fontSize: 16, fontWeight: 650, background: 'transparent', color: t.ink, boxShadow: `inset 0 0 0 1.5px ${t.line}`, cursor: 'pointer' }}
          >
            Change time
          </button>
        ) : (
          <Button tone='ghost' style={{ flex: 1 }}>
            Change time
          </Button>
        )}
        <Button style={{ flex: 1, background: t.ink, boxShadow: 'none' }}>Directions</Button>
      </div>
    </Screen>
  );
}

/** Before: the nine-field form sellers abandoned. */
export function OldFormScreen() {
  const fields = [
    ['Title', ''],
    ['Category', 'Choose…'],
    ['Subcategory', 'Choose…'],
    ['Condition', 'Choose…'],
    ['Price', '$'],
    ['Description', ''],
    ['Dimensions', 'W × D × H'],
    ['Pickup notes', ''],
    ['Neighborhood', 'Choose…']
  ];
  return (
    <Screen bg='#ffffff' style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ padding: '58px 20px 0' }}>
        <div style={{ fontSize: 17, fontWeight: 600, textAlign: 'center' }}>New listing</div>
        <div style={{ fontSize: 12, color: '#8a8a8a', textAlign: 'center', marginTop: 2 }}>Step 1 of 3 · Details</div>
      </div>
      <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {fields.map(([label, placeholder]) => (
          <div key={label}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
              {label} <span style={{ color: '#c33' }}>*</span>
            </div>
            <div
              style={{
                height: label === 'Description' ? 64 : 38,
                borderRadius: 6,
                border: '1px solid #d0d0d0',
                padding: '0 10px',
                display: 'flex',
                alignItems: label === 'Description' ? 'flex-start' : 'center',
                paddingTop: label === 'Description' ? 9 : 0,
                fontSize: 14,
                color: '#aaa'
              }}
            >
              {placeholder}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ height: 46, borderRadius: 8, background: '#cfcfcf', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600 }}>
          Next: Add photos
        </div>
      </div>
    </Screen>
  );
}
