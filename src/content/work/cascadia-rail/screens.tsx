import { useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { TicketCode } from './code';
import {
  BIKE_FEE,
  days,
  dayLabel,
  dayLabelLong,
  LOWEST,
  MONTH,
  rider,
  stops,
  TODAY,
  trainsFor,
  YEAR,
  type Train
} from './data';
import { Code, Icon, Label, Mark, nums, Screen, Switch, t, TabBar, Time } from './theme';

const money = (n: number) => `$${n}`;
const cents = (n: number) => `$${n.toFixed(2)}`;

/** "8:15 am" minus some minutes, for platform posting times. */
export function minus(time: string, mins: number) {
  const [hm, mer] = time.split(' ');
  const [h, m] = hm.split(':').map(Number);
  let total = ((h % 12) + (mer === 'pm' ? 12 : 0)) * 60 + m - mins;
  total = (total + 1440) % 1440;
  const H = Math.floor(total / 60);
  const M = total % 60;
  const h12 = H % 12 === 0 ? 12 : H % 12;
  return `${h12}:${String(M).padStart(2, '0')} ${H < 12 ? 'am' : 'pm'}`;
}

const reset: CSSProperties = {
  border: 'none',
  margin: 0,
  padding: 0,
  font: 'inherit',
  color: 'inherit',
  background: 'none',
  textAlign: 'inherit'
};

/** A real button when it has a handler; a plain box in stills. */
function Tap({
  onClick,
  label,
  disabled,
  style,
  children,
  className,
  pressed,
  describedBy,
  current
}: {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  style?: CSSProperties;
  children: ReactNode;
  className?: string;
  pressed?: boolean;
  describedBy?: string;
  current?: 'date';
}) {
  if (!onClick)
    return (
      <div style={style} className={className}>
        {children}
      </div>
    );
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      aria-describedby={describedBy}
      aria-current={current}
      disabled={disabled}
      className={className}
      style={{ ...reset, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick, label = 'Back', dark }: { onClick?: () => void; label?: string; dark?: boolean }) {
  return (
    <Tap
      onClick={onClick}
      label={label}
      className={dark ? 'cr-on-dark' : undefined}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        display: 'grid',
        placeItems: 'center',
        background: dark ? 'rgba(244,241,232,0.12)' : t.paper,
        boxShadow: dark ? 'none' : `inset 0 0 0 1px ${t.line}`,
        color: dark ? t.cream : t.ink,
        flex: 'none'
      }}
    >
      <Icon name='back' size={22} stroke={2.2} />
    </Tap>
  );
}

function Heading({
  children,
  style,
  headingRef
}: {
  children: ReactNode;
  style?: CSSProperties;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <h3
      ref={headingRef}
      tabIndex={headingRef ? -1 : undefined}
      style={{ margin: 0, font: 'inherit', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, outline: 'none', ...style }}
    >
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function RouteDot({ filled }: { filled?: boolean }) {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        flex: 'none',
        background: filled ? t.teal : t.paper,
        boxShadow: `inset 0 0 0 3px ${t.teal}`
      }}
    />
  );
}

function Chip({ children, active, style }: { children: ReactNode; active?: boolean; style?: CSSProperties }) {
  return (
    <span
      style={{
        height: 38,
        padding: '1px 14px 0',
        borderRadius: 19,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 14,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: active ? t.tealSoft : t.paper,
        color: active ? t.teal : t.ink,
        boxShadow: active ? `inset 0 0 0 1.5px ${t.teal}` : `inset 0 0 0 1px ${t.line}`,
        ...style
      }}
    >
      {children}
    </span>
  );
}

/** Home: pick a route. The date comes next, with its price. */
export function SearchScreen() {
  const recent = [
    ['Eugene', 'EUG', 'Portland', 'PDX', 19, 'Last trip Feb 21'],
    ['Portland', 'PDX', 'Tacoma', 'TAC', 24, 'Last trip Feb 9'],
    ['Salem', 'SLM', 'Seattle', 'SEA', 41, 'Last trip Jan 30']
  ] as const;
  return (
    <Screen>
      <div style={{ padding: '58px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Mark size={28} />
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', color: t.teal, paddingTop: 2 }}>
              CASCADIA RAIL
            </span>
          </div>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: t.paper,
              boxShadow: `inset 0 0 0 1px ${t.line}`,
              display: 'grid',
              placeItems: 'center',
              color: t.ink
            }}
          >
            <Icon name='bell' size={20} />
          </span>
        </div>
        <Heading style={{ fontSize: 31, marginTop: 22 }}>Where to, Dana?</Heading>
      </div>

      <div
        style={{
          margin: '18px 16px 0',
          background: t.paper,
          borderRadius: 22,
          boxShadow: `inset 0 0 0 1px ${t.line}, 0 1px 0 rgba(19,42,46,0.05)`,
          position: 'relative'
        }}
      >
        {[
          ['From', 'Portland', 'Union Station', 'PDX', false],
          ['To', 'Seattle', 'King Street Station', 'SEA', true]
        ].map(([label, city, station, code, filled], i) => (
          <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', height: 86 }}>
            <RouteDot filled={filled as boolean} />
            <div style={{ flex: 1 }}>
              <Label style={{ color: t.mute }}>{label as string}</Label>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 3 }}>{city as string}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: t.mute, marginTop: 2 }}>
                {station as string} <Code>{code as string}</Code>
              </div>
            </div>
            {i === 0 && <span style={{ width: 44 }} />}
          </div>
        ))}
        <div style={{ position: 'absolute', left: 24, top: 52, height: 82, borderLeft: `2px dashed ${t.faint}` }} />
        <div style={{ position: 'absolute', left: 50, right: 18, top: 86, height: 1, background: t.line }} />
        <span
          style={{
            position: 'absolute',
            right: 18,
            top: 64,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: t.cream,
            boxShadow: `inset 0 0 0 1.5px ${t.line}`,
            display: 'grid',
            placeItems: 'center',
            color: t.teal
          }}
        >
          <Icon name='swap' size={20} stroke={2.1} />
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '12px 16px 0' }}>
        <Chip>
          <Icon name='user' size={17} />1 adult
          <Icon name='down' size={15} color={t.mute} />
        </Chip>
        <Chip active>
          <Icon name='bike' size={18} />
          Bike +$5
        </Chip>
        <Chip>
          One way
          <Icon name='down' size={15} color={t.mute} />
        </Chip>
      </div>

      <div style={{ margin: '16px 16px 0' }}>
        <div
          style={{
            height: 56,
            borderRadius: 16,
            background: t.teal,
            color: t.cream,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 17,
            fontWeight: 800,
            paddingTop: 2
          }}
        >
          See fares for March <Icon name='arrow' size={20} color={t.yellow} stroke={2.2} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: t.mute, marginTop: 10 }}>
          Lowest this month: <b style={{ color: t.ink }}>{money(LOWEST)}</b> on 5 days
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <Label style={{ color: t.mute }}>Recent routes</Label>
        <div style={{ marginTop: 6 }}>
          {recent.map(([from, fc, to, tc, fare, last], i) => (
            <div
              key={from + to}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 60,
                borderTop: i ? `1px solid ${t.line}` : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 16, fontWeight: 750 }}>
                  {from} <Icon name='arrow' size={15} color={t.mute} /> {to}
                </div>
                <div style={{ fontSize: 12.5, color: t.mute, marginTop: 2 }}>
                  {fc} – {tc} • {last}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11.5, color: t.mute, fontWeight: 600 }}>from</div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{money(fare)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active='book' />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Fare calendar                                                       */
/* ------------------------------------------------------------------ */

function TealHeader({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: t.teal, color: t.cream, padding: '54px 16px 18px', ...style }}>{children}</div>;
}

type CalendarProps = {
  selected?: number;
  onPick?: (date: number) => void;
  onBack?: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
};

/** The first screen of booking: every day with its lowest fare. */
export function FareCalendarScreen({ selected, onPick, onBack, headingRef }: CalendarProps) {
  const interactive = Boolean(onPick);
  const trains = selected ? trainsFor(selected) : [];
  return (
    <Screen>
      <TealHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {(onBack || !interactive) && <BackButton dark onClick={onBack} label='Back to search' />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label style={{ color: 'rgba(244,241,232,0.66)' }}>One way • 1 adult • bike</Label>
            <Heading headingRef={headingRef} style={{ fontSize: 24, marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
              Portland <Icon name='arrow' size={20} color={t.yellow} stroke={2.4} /> Seattle
            </Heading>
          </div>
        </div>
      </TealHeader>

      <div style={{ padding: '18px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36 }}>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {MONTH} <span style={{ color: t.mute, fontWeight: 600 }}>{YEAR}</span>
          </div>
          {!interactive && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[false, true].map((on) => (
                <span
                  key={String(on)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    display: 'grid',
                    placeItems: 'center',
                    background: on ? t.paper : 'transparent',
                    boxShadow: `inset 0 0 0 1px ${t.line}`,
                    color: on ? t.ink : t.faint
                  }}
                >
                  <Icon name={on ? 'next' : 'back'} size={18} stroke={2.2} />
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, fontSize: 12.5, fontWeight: 650, color: t.mute }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.ink }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: t.yellow }} />
            <span id={interactive ? 'cr-lowest' : undefined}>Lowest fare, {money(LOWEST)}</span>
          </span>
          <span>One way, per adult</span>
        </div>

        <div
          aria-hidden
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 16, textAlign: 'center' }}
        >
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Label key={i} style={{ color: t.mute }}>
              {d}
            </Label>
          ))}
        </div>
        <div
          role={interactive ? 'group' : undefined}
          aria-label={interactive ? `${MONTH} ${YEAR} fares` : undefined}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 8 }}
        >
          {days.map((d) => {
            const isSel = d.date === selected;
            const bg = d.past ? 'transparent' : isSel ? t.teal : d.cheapest ? t.yellow : t.paper;
            const ring = d.today && !isSel ? `inset 0 0 0 2px ${t.teal}` : d.past || d.cheapest || isSel ? 'none' : `inset 0 0 0 1px ${t.line}`;
            const label = d.past ? `${dayLabelLong(d.date)}, unavailable` : `${dayLabelLong(d.date)}, from ${money(d.fare!)}`;
            return (
              <Tap
                key={d.date}
                onClick={interactive && !d.past ? () => onPick?.(d.date) : undefined}
                label={interactive ? label : undefined}
                disabled={interactive && d.past ? true : undefined}
                className='cr-cell'
                describedBy={interactive && d.cheapest ? 'cr-lowest' : undefined}
                current={interactive && d.today ? 'date' : undefined}
                style={{
                  height: 70,
                  borderRadius: 12,
                  background: bg,
                  boxShadow: ring,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  color: d.past ? t.faint : isSel ? t.cream : t.ink,
                  position: 'relative',
                  ...(interactive && d.past ? { cursor: 'default' } : null)
                }}
              >
                <span style={{ fontSize: 17, fontWeight: 800, lineHeight: 1, paddingTop: 3 }}>{d.date}</span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: d.cheapest || isSel ? 800 : 650,
                    lineHeight: 1,
                    color: d.past ? 'transparent' : isSel ? t.yellow : d.cheapest ? t.ink : t.mute
                  }}
                >
                  {d.past ? '–' : money(d.fare!)}
                </span>
                {d.today && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 6,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: isSel ? t.yellow : t.teal
                    }}
                  />
                )}
              </Tap>
            );
          })}
        </div>
      </div>

      <div style={{ margin: '14px 16px 0' }}>
        <div
          style={{
            background: t.tealSoft,
            borderRadius: 18,
            padding: '13px 16px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            fontSize: 13.5,
            lineHeight: 1.4,
            color: t.ink
          }}
        >
          <span style={{ color: t.teal, marginTop: 1 }}>
            <Icon name='clock' size={20} stroke={2} />
          </span>
          <span>
            <b>Midweek is cheapest.</b> Fridays and spring break week (Mar 23–29) cost up to twice as much.
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '0 16px 40px' }}>
        {selected ? (
          <div
            style={{
              background: t.paper,
              borderRadius: 20,
              boxShadow: `inset 0 0 0 1px ${t.line}, 0 6px 18px -10px rgba(19,42,46,0.3)`,
              padding: '14px 14px 14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{ flex: 1 }}>
              <Label style={{ color: t.mute }}>{dayLabelLong(selected)}</Label>
              <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, letterSpacing: '-0.01em' }}>
                {trains.length} trains, from {money(Math.min(...trains.map((x) => x.fare)))}
              </div>
            </div>
            <span
              style={{
                height: 50,
                padding: '2px 20px 0',
                borderRadius: 14,
                background: t.teal,
                color: t.cream,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 800,
                fontSize: 16
              }}
            >
              See trains <Icon name='arrow' size={18} color={t.yellow} stroke={2.2} />
            </span>
          </div>
        ) : (
          <FareAlert interactive={interactive} />
        )}
      </div>
    </Screen>
  );
}

/** Watch a route for a cheaper Friday. Works for real in the demo. */
function FareAlert({ interactive }: { interactive: boolean }) {
  const [on, setOn] = useState(false);
  const body = (
    <>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: t.yellowSoft, color: t.ink, display: 'grid', placeItems: 'center', flex: 'none' }}>
        <Icon name='bell' size={20} />
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800 }}>Watch Friday fares</span>
        <span style={{ display: 'block', fontSize: 12.5, color: t.mute, marginTop: 1 }}>
          {on ? 'On: we will nudge you under $40' : 'Nudge me if one drops under $40'}
        </span>
      </span>
      <Switch on={on} />
    </>
  );
  const style: CSSProperties = {
    width: '100%',
    background: t.paper,
    borderRadius: 18,
    boxShadow: `inset 0 0 0 1px ${t.line}`,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  };
  if (!interactive) return <div style={style}>{body}</div>;
  return (
    <button
      type='button'
      role='switch'
      aria-checked={on}
      aria-label='Watch Friday fares under $40'
      onClick={() => setOn((v) => !v)}
      style={{ ...reset, cursor: 'pointer', ...style }}
    >
      {body}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Trains for a day                                                    */
/* ------------------------------------------------------------------ */

function TrainTag({ train }: { train: Train }) {
  if (train.lowest)
    return (
      <span
        style={{
          height: 22,
          padding: '2px 8px 0',
          borderRadius: 6,
          background: t.yellow,
          color: t.ink,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center'
        }}
      >
        Lowest
      </span>
    );
  if (train.warn) return <span style={{ fontSize: 12.5, fontWeight: 800, color: t.brick }}>{train.note}</span>;
  if (train.bikeFull) return <span style={{ fontSize: 12.5, fontWeight: 700, color: t.mute }}>{train.note}</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 650, color: t.mute }}>
      <Icon name='bike' size={16} />
      {train.note?.replace(' bike spaces', '')}
    </span>
  );
}

type TrainsProps = {
  date: number;
  onBack?: () => void;
  onDay?: (date: number) => void;
  onPick?: (train: Train) => void;
  headingRef?: Ref<HTMLHeadingElement>;
  scroll?: boolean;
};

/** One day's trains, with the neighbouring days' fares a tap away. */
export function TrainListScreen({ date, onBack, onDay, onPick, headingRef, scroll }: TrainsProps) {
  const trains = trainsFor(date);
  const start = Math.min(Math.max(date - 2, TODAY), 31 - 4);
  const strip = days.slice(start - 1, start + 4);
  const interactive = Boolean(onPick);
  return (
    <Screen>
      <TealHeader style={{ paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton dark onClick={onBack} label='Back to calendar' />
          <div style={{ flex: 1 }}>
            <Heading headingRef={headingRef} style={{ fontSize: 21, display: 'flex', alignItems: 'center', gap: 7 }}>
              Portland <Icon name='arrow' size={17} color={t.yellow} stroke={2.4} /> Seattle
            </Heading>
            <div style={{ fontSize: 13, color: 'rgba(244,241,232,0.7)', marginTop: 4, fontWeight: 600 }}>
              {dayLabel(date)} • 1 adult • bike
            </div>
          </div>
        </div>
        <div
          role={onDay ? 'group' : undefined}
          aria-label={onDay ? 'Nearby days' : undefined}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 14 }}
        >
          {strip.map((d) => {
            const active = d.date === date;
            const Tag = onDay ? 'button' : 'div';
            return (
              <Tag
                key={d.date}
                {...(onDay
                  ? {
                      type: 'button' as const,
                      'aria-pressed': active,
                      'aria-label': `${dayLabelLong(d.date)}, from ${money(d.fare!)}`,
                      onClick: () => onDay(d.date),
                      className: 'cr-on-dark'
                    }
                  : {})}
                style={{
                  ...reset,
                  height: 56,
                  borderRadius: 12,
                  background: active ? t.cream : 'rgba(244,241,232,0.09)',
                  color: active ? t.teal : t.cream,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: onDay ? 'pointer' : undefined,
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1, paddingTop: 2, opacity: active ? 1 : 0.8 }}>
                  {dayLabel(d.date).replace(',', '').replace(' Mar', '')}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: active ? t.teal : d.cheapest ? t.yellow : t.cream,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {active && d.cheapest && <span style={{ width: 7, height: 7, borderRadius: 4, background: t.yellowDeep }} />}
                  {money(d.fare!)}
                </span>
              </Tag>
            );
          })}
        </div>
      </TealHeader>

      <div
        style={{
          flex: 1,
          overflowY: scroll ? 'auto' : 'hidden',
          padding: '12px 16px 40px',
          position: 'relative'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
            fontWeight: 650,
            color: t.mute,
            padding: '0 2px'
          }}
        >
          <span style={{ display: 'flex', gap: 4, color: t.teal }}>
            <Icon name='window' size={16} />
            <Icon name='quiet' size={16} />
            <Icon name='bike' size={16} />
          </span>
          Your usual: window, quiet car, near bikes
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '12px 2px 8px' }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>{trains.length} trains</span>
          <span style={{ fontSize: 12, color: t.mute, fontWeight: 600 }}>Per adult • bike +{money(BIKE_FEE)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trains.map((tr) => (
            <Tap
              key={tr.no}
              onClick={interactive && !tr.bikeFull ? () => onPick?.(tr) : undefined}
              disabled={interactive && tr.bikeFull ? true : undefined}
              label={
                interactive
                  ? `Train ${tr.no}, ${tr.dep} to ${tr.arr}, ${money(tr.fare)}${tr.lowest ? ', lowest fare' : ''}${tr.note ? `, ${tr.note}` : ''}`
                  : undefined
              }
              className='cr-row'
              style={{
                display: 'block',
                width: '100%',
                background: t.paper,
                borderRadius: 16,
                boxShadow: tr.lowest ? `inset 0 0 0 2px ${t.yellow}` : `inset 0 0 0 1px ${t.line}`,
                padding: '14px 16px 12px',
                opacity: tr.bikeFull ? 0.55 : 1,
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Time value={tr.dep} size={22} />
                <span style={{ flex: 'none', width: 26, height: 2, borderRadius: 1, background: t.faint }} />
                <Time value={tr.arr} size={22} weight={700} style={{ color: t.mute }} />
                <span style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {money(tr.fare)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                <span style={{ fontSize: 12.5, color: t.mute, fontWeight: 600 }}>
                  {tr.duration} • 4 stops • <span style={{ color: t.ink, fontWeight: 750 }}>Train {tr.no}</span>
                </span>
                <TrainTag train={tr} />
              </div>
            </Tap>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Confirm sheet (demo)                                                */
/* ------------------------------------------------------------------ */

export function ConfirmSheet({
  date,
  train,
  onPay,
  onClose,
  payRef
}: {
  date: number;
  train: Train;
  onPay: () => void;
  onClose: () => void;
  payRef?: Ref<HTMLButtonElement>;
}) {
  const total = train.fare + BIKE_FEE;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5, fontFamily: t.font, ...nums }}>
      <button
        type='button'
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className='cr-scrim'
        style={{ ...reset, position: 'absolute', inset: 0, background: 'rgba(8,32,36,0.46)', cursor: 'default' }}
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`Confirm train ${train.no}`}
        className='cr-sheet'
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: t.cream,
          color: t.ink,
          borderRadius: '26px 26px 0 0',
          padding: '10px 20px 40px',
          boxShadow: '0 -10px 30px rgba(8,32,36,0.18)'
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 3, background: t.line, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Label style={{ color: t.mute }}>
              Train {train.no} • {dayLabel(date)}
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <Time value={train.dep} size={26} />
              <Icon name='arrow' size={18} color={t.mute} />
              <Time value={train.arr} size={26} />
            </div>
            <div style={{ fontSize: 13, color: t.mute, marginTop: 6 }}>Portland Union Station to Seattle King Street</div>
          </div>
          <button
            type='button'
            onClick={onClose}
            style={{ ...reset, cursor: 'pointer', fontSize: 14, fontWeight: 800, color: t.teal, padding: '6px 2px' }}
          >
            Cancel
          </button>
        </div>
        <div
          style={{
            marginTop: 16,
            background: t.paper,
            borderRadius: 16,
            boxShadow: `inset 0 0 0 1px ${t.line}`,
            padding: '12px 14px',
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}
        >
          <span
            style={{ width: 38, height: 38, borderRadius: 10, background: t.tealSoft, color: t.teal, display: 'grid', placeItems: 'center' }}
          >
            <Icon name='seat' size={20} stroke={2} />
          </span>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>
              Car {rider.car} • Seat {rider.seat}
            </div>
            <div style={{ fontSize: 12.5, color: t.mute, marginTop: 1 }}>Window, quiet car, one car from your bike</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Adult fare</span>
            <span>{cents(train.fare)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bike in Car {rider.bikeCar}</span>
            <span>{cents(BIKE_FEE)}</span>
          </div>
          <div style={{ height: 1, background: t.line, margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
            <span>Total</span>
            <span>{cents(total)}</span>
          </div>
        </div>
        <button
          ref={payRef}
          type='button'
          onClick={onPay}
          style={{
            ...reset,
            cursor: 'pointer',
            marginTop: 16,
            width: '100%',
            height: 56,
            borderRadius: 16,
            background: t.teal,
            color: t.cream,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 17,
            fontWeight: 800,
            paddingTop: 2
          }}
        >
          <Icon name='card' size={20} color={t.yellow} /> Pay {cents(total)}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: t.mute, marginTop: 10 }}>
          Card ending {rider.card} • free changes until departure
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seat preferences and map                                            */
/* ------------------------------------------------------------------ */

function Segmented({ options, value }: { options: string[]; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        background: '#E9E5D8',
        borderRadius: 12,
        padding: 3,
        height: 42
      }}
    >
      {options.map((o) => (
        <span
          key={o}
          style={{
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            paddingTop: 2,
            fontSize: 14,
            fontWeight: 800,
            background: o === value ? t.paper : 'transparent',
            color: o === value ? t.ink : t.mute,
            boxShadow: o === value ? '0 1px 2px rgba(19,42,46,0.14)' : 'none'
          }}
        >
          {o}
        </span>
      ))}
    </div>
  );
}

function SimpleTop({ back, right }: { back: string; right?: ReactNode }) {
  return (
    <div style={{ padding: '54px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: t.mute }}>
        <BackButton />
        {back}
      </span>
      {right}
    </div>
  );
}

/** Seats as preferences. The map is there if you want it. */
export function SeatPrefsScreen() {
  const prefs = [
    { icon: 'quiet', title: 'Quiet car', body: 'Low voices, phones on silent', on: true },
    { icon: 'bike', title: 'Near the bike car', body: 'Your bike rides in Car 5', on: true },
    { icon: 'forward', title: 'Facing forward', body: 'Skip seats that ride backwards', on: true },
    { icon: 'seat', title: 'Table seat', body: 'Four seats around a table', on: false }
  ] as const;
  return (
    <Screen>
      <SimpleTop back='Train 507' />
      <div style={{ padding: '18px 20px 0' }}>
        <Heading style={{ fontSize: 28 }}>How do you like to ride?</Heading>
        <div style={{ fontSize: 14, color: t.mute, marginTop: 6 }}>Thu, Mar 12 • 8:15 am to Seattle • saved for next time</div>
      </div>
      <div style={{ margin: '18px 16px 0', background: t.paper, borderRadius: 20, boxShadow: `inset 0 0 0 1px ${t.line}`, padding: '14px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, marginBottom: 10 }}>
          <span style={{ color: t.teal }}>
            <Icon name='window' size={19} />
          </span>
          Seat
        </div>
        <Segmented options={['Window', 'Aisle', 'Either']} value='Window' />
        <div style={{ marginTop: 8 }}>
          {prefs.map((p) => (
            <div
              key={p.title}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: `1px solid ${t.line}` }}
            >
              <span style={{ color: t.teal }}>
                <Icon name={p.icon} size={20} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{p.title}</div>
                <div style={{ fontSize: 12.5, color: t.mute, marginTop: 1 }}>{p.body}</div>
              </div>
              <Switch on={p.on} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          margin: '12px 16px 0',
          background: t.teal,
          color: t.cream,
          borderRadius: 20,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}
      >
        <div style={{ flex: 1 }}>
          <Label style={{ color: t.yellow }}>Best match</Label>
          <div style={{ fontSize: 23, fontWeight: 800, marginTop: 5, letterSpacing: '-0.01em' }}>Car 4 • Seat 12A</div>
          <div style={{ fontSize: 12.5, opacity: 0.78, marginTop: 3 }}>Window, forward, next to your bike</div>
        </div>
        <MiniConsist />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 14.5, fontWeight: 800, color: t.teal }}>
        Choose on a seat map instead <Icon name='next' size={16} stroke={2.4} />
      </div>

      <div style={{ marginTop: 'auto', padding: '0 16px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: t.mute, padding: '0 4px 10px' }}>
          <span>Adult $29.00 • bike $5.00</span>
          <span style={{ color: t.ink, fontWeight: 800 }}>Total $34.00</span>
        </div>
        <div
          style={{
            height: 56,
            borderRadius: 16,
            background: t.teal,
            color: t.cream,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 17,
            fontWeight: 800,
            paddingTop: 2
          }}
        >
          <Icon name='card' size={20} color={t.yellow} /> Pay $34.00 • card 4417
        </div>
      </div>
    </Screen>
  );
}

/** Six cars, ours highlighted, bike car marked. */
function MiniConsist() {
  return (
    <div aria-hidden style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3, 4, 5, 6].map((c) => (
          <span
            key={c}
            style={{
              width: 14,
              height: 22,
              borderRadius: c === 1 ? '7px 3px 3px 7px' : 3,
              background: c === 4 ? t.yellow : c === 5 ? 'rgba(244,241,232,0.45)' : 'rgba(244,241,232,0.18)'
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 3, fontSize: 9.5, fontWeight: 800, opacity: 0.75 }}>
        {[1, 2, 3, 4, 5, 6].map((c) => (
          <span key={c} style={{ width: 14, textAlign: 'center' }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

const cars = [
  { no: 1, name: 'Business', left: 6 },
  { no: 2, name: 'Coach', left: 9 },
  { no: 3, name: 'Café', left: 0 },
  { no: 4, name: 'Quiet', left: 14 },
  { no: 5, name: 'Bikes', left: 11 },
  { no: 6, name: 'Coach', left: 21 }
];

/** Taken seats in Car 4, rows 6 to 17. Deterministic, hand-placed. */
const taken = new Set([
  '6B', '6C', '7A', '7D', '8B', '8C', '8D', '9A', '9B', '10C', '10D',
  '11A', '11B', '12C', '13A', '13D', '14B', '14C', '15A', '15B', '15D', '16C', '17A', '17D'
]);

function SeatBox({ id, state, back }: { id: string; state: 'open' | 'taken' | 'yours'; back: 'top' | 'bottom' }) {
  const fill = state === 'yours' ? t.teal : state === 'taken' ? '#DCD7C8' : t.paper;
  return (
    <span
      style={{
        width: 40,
        height: 30,
        borderRadius: 8,
        background: fill,
        boxShadow: state === 'open' ? `inset 0 0 0 1.5px ${t.faint}` : 'none',
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        fontSize: 11,
        fontWeight: 800,
        color: state === 'yours' ? t.cream : 'transparent'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 5,
          right: 5,
          height: 4,
          borderRadius: 2,
          [back]: 3,
          background: state === 'yours' ? t.yellow : state === 'taken' ? '#C7C1AF' : t.faint
        }}
      />
      {id}
    </span>
  );
}

/** On request: a seat map of the quiet car. */
export function SeatMapScreen() {
  const rows = Array.from({ length: 10 }, (_, i) => i + 7);
  return (
    <Screen>
      <SimpleTop back='Preferences' right={<span style={{ fontSize: 14, fontWeight: 800, color: t.teal }}>Reset to best match</span>} />
      <div style={{ padding: '14px 20px 0' }}>
        <Heading style={{ fontSize: 26 }}>Pick a seat</Heading>
        <div style={{ fontSize: 13.5, color: t.mute, marginTop: 5 }}>Train 507 • seats face Seattle unless marked</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, margin: '14px 16px 0' }}>
        {cars.map((c) => {
          const active = c.no === 4;
          return (
            <span
              key={c.no}
              style={{
                height: 54,
                borderRadius: c.no === 1 ? '18px 8px 8px 18px' : 8,
                background: active ? t.teal : t.paper,
                color: active ? t.cream : c.left === 0 ? t.faint : t.ink,
                boxShadow: active ? 'none' : `inset 0 0 0 1px ${t.line}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                {c.no}
                {c.no === 5 && <Icon name='bike' size={13} stroke={2.1} />}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1, opacity: 0.75 }}>{c.left ? `${c.name}` : 'No seats'}</span>
            </span>
          );
        })}
      </div>

      <div
        style={{
          margin: '14px auto 0',
          width: 258,
          background: t.paper,
          borderRadius: 26,
          boxShadow: `inset 0 0 0 1.5px ${t.line}`,
          padding: '12px 18px 10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', color: t.mute }}>
          <span>DOORS</span>
          <span>TOWARD CAR 3</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 40px 1fr 40px 40px', columnGap: 6, marginTop: 8, textAlign: 'center' }}>
          {['A', 'B', '', 'C', 'D'].map((c, i) => (
            <Label key={i} style={{ color: t.mute }}>
              {c}
            </Label>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
          {rows.map((r) => {
            const back = r <= 9 ? 'top' : 'bottom';
            return (
              <div key={r}>
                {r === 10 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '86px 1fr 86px', columnGap: 6, margin: '-1px 0 4px' }}>
                    <span style={{ height: 14, borderRadius: 4, background: '#E5DFCF' }} />
                    <span />
                    <span style={{ height: 14, borderRadius: 4, background: '#E5DFCF' }} />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 40px 1fr 40px 40px', columnGap: 6, alignItems: 'center' }}>
                  {['A', 'B'].map((c) => (
                    <SeatBox key={c} id={`${r}${c}`} back={back} state={`${r}${c}` === '12A' ? 'yours' : taken.has(`${r}${c}`) ? 'taken' : 'open'} />
                  ))}
                  <span style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: t.faint }}>{r}</span>
                  {['C', 'D'].map((c) => (
                    <SeatBox key={c} id={`${r}${c}`} back={back} state={taken.has(`${r}${c}`) ? 'taken' : 'open'} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', color: t.mute, marginTop: 8 }}>
          <span>LUGGAGE</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            TO BIKES <Icon name='bike' size={12} stroke={2.2} />
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14, fontSize: 12, fontWeight: 650, color: t.mute }}>
        {[
          ['Yours', t.teal, 'none'],
          ['Open', t.paper, `inset 0 0 0 1.5px ${t.faint}`],
          ['Taken', '#DCD7C8', 'none']
        ].map(([l, bg, sh]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 12, borderRadius: 4, background: bg, boxShadow: sh }} />
            {l}
          </span>
        ))}
        <span>Rows 7–9 face back</span>
      </div>

      <div style={{ marginTop: 'auto', padding: '0 16px 40px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, paddingLeft: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Seat 12A</div>
          <div style={{ fontSize: 12.5, color: t.mute }}>Window • facing forward</div>
        </div>
        <span
          style={{
            height: 54,
            padding: '2px 26px 0',
            borderRadius: 16,
            background: t.teal,
            color: t.cream,
            display: 'flex',
            alignItems: 'center',
            fontSize: 16.5,
            fontWeight: 800
          }}
        >
          Keep 12A
        </span>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Live ticket                                                         */
/* ------------------------------------------------------------------ */

type TicketProps = {
  date?: number;
  train?: Train;
  /** `tbd` until dispatch assigns a platform. */
  platform?: 'tbd' | 'posted';
  /** Play the "just posted" highlight. */
  fresh?: boolean;
  onBack?: () => void;
  onScan?: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
};

function Tile({
  label,
  value,
  sub,
  tone,
  className,
  style,
  badge
}: {
  label: string;
  value: ReactNode;
  sub: string;
  tone: 'tbd' | 'posted' | 'plain';
  className?: string;
  style?: CSSProperties;
  badge?: string;
}) {
  const posted = tone === 'posted';
  return (
    <div
      className={className}
      style={{
        height: 128,
        borderRadius: 16,
        padding: '13px 12px 11px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: posted ? t.yellow : tone === 'tbd' ? 'transparent' : t.paper,
        boxShadow: tone === 'plain' ? `inset 0 0 0 1px ${t.line}` : 'none',
        border: tone === 'tbd' ? `2px dashed ${t.faint}` : '2px solid transparent',
        transition: 'background 360ms ease-out, border-color 360ms',
        position: 'relative',
        ...style
      }}
    >
      <Label style={{ color: posted ? 'rgba(19,42,46,0.72)' : t.mute }}>{label}</Label>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div
          className={posted ? 'cr-value' : undefined}
          style={{
            fontSize: tone === 'tbd' ? 28 : 46,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: tone === 'tbd' ? t.faint : posted ? t.ink : t.teal,
            paddingTop: 4
          }}
        >
          {value}
        </div>
        {badge && (
          <span
            className='cr-badge'
            style={{
              height: 20,
              padding: '2px 7px 0',
              borderRadius: 10,
              background: t.ink,
              color: t.yellow,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: posted ? 'rgba(19,42,46,0.75)' : t.mute, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{sub}</div>
    </div>
  );
}

const defaultTrain = trainsFor(12)[2];

/** The ticket fills in its platform when dispatch assigns one. */
export function TicketScreen({ date = 12, train = defaultTrain, platform = 'posted', fresh, onBack, onScan, headingRef }: TicketProps) {
  const posted = platform === 'posted';
  const postedAt = minus(train.dep, 20);
  const checkedAt = minus(train.dep, 34);
  const updates = [
    ...(posted ? [{ at: postedAt, text: 'Platform 3 posted. Boarding now.', hot: true }] : []),
    { at: checkedAt, text: `Train ${train.no} is on time.`, hot: false },
    { at: 'Mar 3', text: `Car ${rider.car}, seat ${rider.seat} picked from your usual.`, hot: false },
    { at: 'Mar 3', text: `Booked. ${cents(train.fare + BIKE_FEE)} on card ${rider.card}.`, hot: false }
  ];
  return (
    <Screen bg={t.teal} style={{ color: t.cream }}>
      <div style={{ padding: '54px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton dark onClick={onBack} label='Back to trains' />
        <span
          style={{
            height: 32,
            padding: '2px 12px 0',
            borderRadius: 16,
            background: t.tealDeep,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 13,
            fontWeight: 800
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#5CC796', marginTop: -2 }} />
          On time • leaves in {posted ? 20 : 21} min
        </span>
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <Label style={{ color: 'rgba(244,241,232,0.62)' }}>
          {dayLabel(date)} • Booking {rider.booking}
        </Label>
        <Heading headingRef={headingRef} style={{ fontSize: 27, marginTop: 6 }}>
          Train {train.no} to Seattle
        </Heading>
      </div>

      <div style={{ margin: '16px 14px 0', background: t.cream, color: t.ink, borderRadius: 24, position: 'relative' }}>
        <div style={{ padding: '18px 18px 16px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 8 }}>
          <div>
            <Time value={train.dep} size={34} />
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>Portland</div>
            <div style={{ fontSize: 12.5, color: t.mute }}>Union Station</div>
          </div>
          <div style={{ textAlign: 'center', paddingBottom: 22 }}>
            <div style={{ color: t.teal, display: 'flex', justifyContent: 'center' }}>
              <Icon name='train' size={20} />
            </div>
            <div style={{ fontSize: 11.5, color: t.mute, fontWeight: 700, marginTop: 4 }}>{train.duration}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Time value={train.arr} size={34} />
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>Seattle</div>
            <div style={{ fontSize: 12.5, color: t.mute }}>King Street</div>
          </div>
        </div>
        {/* Perforation */}
        <div style={{ position: 'relative', height: 2, margin: '0 18px', borderTop: `2px dashed ${t.line}` }}>
          <span style={{ position: 'absolute', left: -30, top: -12, width: 22, height: 22, borderRadius: 11, background: t.teal }} />
          <span style={{ position: 'absolute', right: -30, top: -12, width: 22, height: 22, borderRadius: 11, background: t.teal }} />
        </div>
        <div style={{ padding: '16px 14px 0', display: 'grid', gridTemplateColumns: '1.3fr 0.95fr 1fr', gap: 8 }}>
          <Tile
            label='Platform'
            value={posted ? '3' : 'TBD'}
            sub={posted ? `Posted ${postedAt}` : `Posts ~${postedAt}`}
            tone={posted ? 'posted' : 'tbd'}
            className={fresh ? 'cr-fresh' : undefined}
            badge={fresh ? 'New' : undefined}
          />
          <Tile label='Car' value={String(rider.car)} sub='Quiet car' tone='plain' />
          <Tile label='Seat' value={rider.seat} sub='Window' tone='plain' />
        </div>
        <div
          style={{
            margin: '12px 14px 0',
            fontSize: 13,
            lineHeight: 1.4,
            color: posted ? t.ink : t.mute,
            minHeight: 36,
            fontWeight: posted ? 650 : 500
          }}
        >
          {posted
            ? 'Head to Platform 3. Car 4 stops by the north stairs; your bike goes in Car 5, right behind it.'
            : 'Platforms are posted about 20 minutes before departure. This ticket updates on its own.'}
        </div>
        <div
          style={{
            margin: '14px 0 0',
            padding: '12px 18px 16px',
            borderTop: `1px solid ${t.line}`,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13
          }}
        >
          <span>
            <b style={{ fontWeight: 800 }}>{rider.name}</b>
            <span style={{ color: t.mute }}> • adult + bike</span>
          </span>
          <span style={{ color: t.mute }}>{cents(train.fare + BIKE_FEE)} paid</span>
        </div>
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <Label style={{ color: 'rgba(244,241,232,0.55)' }}>Updates</Label>
        <div style={{ marginTop: 6 }}>
          {updates.map((u) => (
            <div
              key={u.text}
              className={u.hot && fresh ? 'cr-update' : undefined}
              style={{ display: 'flex', gap: 12, fontSize: 13, padding: '5px 0', alignItems: 'baseline' }}
            >
              <span style={{ width: 58, flex: 'none', color: u.hot ? t.yellow : 'rgba(244,241,232,0.55)', fontWeight: 800 }}>{u.at}</span>
              <span style={{ color: u.hot ? t.cream : 'rgba(244,241,232,0.78)', fontWeight: u.hot ? 750 : 500 }}>{u.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '0 14px 40px' }}>
        <Tap
          onClick={onScan}
          label={onScan ? 'Show to conductor (scan mode)' : undefined}
          className={onScan ? 'cr-on-dark' : undefined}
          style={{
            width: '100%',
            height: 58,
            borderRadius: 16,
            background: t.yellow,
            color: t.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 17,
            fontWeight: 800,
            paddingTop: 2
          }}
        >
          <Icon name='code' size={22} stroke={2} /> Show to conductor
        </Tap>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Scan mode                                                           */
/* ------------------------------------------------------------------ */

/** For the conductor: big code, big car and seat, full brightness. */
export function ScanScreen({
  onDone,
  clock = '8:22:14',
  live,
  headingRef,
  date = 12,
  train = defaultTrain
}: {
  onDone?: () => void;
  clock?: string;
  live?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  date?: number;
  train?: Train;
}) {
  return (
    <Screen bg='#FFFFFF'>
      <div style={{ padding: '56px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Heading headingRef={headingRef} style={{ fontSize: 15, letterSpacing: 0 }}>
          Show to the conductor
        </Heading>
        <span
          style={{
            height: 30,
            padding: '2px 11px 0',
            borderRadius: 15,
            background: t.yellowSoft,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            fontWeight: 800
          }}
        >
          <Icon name='sun' size={16} stroke={2.1} /> Brightness 100%
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', margin: '18px 20px 0', borderRadius: 20, background: t.teal, color: t.cream }}>
        <div style={{ padding: '14px 18px 12px', borderRight: `1px solid ${t.lineDark}` }}>
          <Label style={{ color: t.yellow }}>Car</Label>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em', marginTop: 6 }}>{rider.car}</div>
        </div>
        <div style={{ padding: '14px 18px 12px' }}>
          <Label style={{ color: t.yellow }}>Seat</Label>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em', marginTop: 6 }}>{rider.seat}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
        <div style={{ padding: 12, borderRadius: 24, boxShadow: `inset 0 0 0 1.5px ${t.line}` }}>
          <TicketCode size={300} seed={`${rider.booking}-${train.no}-${date}`} />
        </div>
      </div>

      <div style={{ margin: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          aria-hidden
          className={live ? 'cr-band' : undefined}
          style={{
            flex: 1,
            height: 12,
            borderRadius: 6,
            backgroundImage: `repeating-linear-gradient(115deg, ${t.yellow} 0 12px, ${t.teal} 12px 24px)`,
            backgroundSize: '52px 12px'
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 800, ...nums }}>{clock}</span>
      </div>
      <div style={{ fontSize: 11.5, color: t.mute, margin: '6px 20px 0', fontWeight: 600 }}>
        The stripe moves and the clock runs, so a screenshot will not pass.
      </div>

      <div style={{ margin: '16px 20px 0' }}>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em' }}>{rider.name}</div>
        <div style={{ fontSize: 13.5, color: t.mute, marginTop: 3 }}>Adult, with a bike in Car 5</div>
        <div style={{ fontSize: 13.5, color: t.mute, marginTop: 1 }}>
          Train {train.no} • Portland to Seattle • {dayLabel(date)}
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '0 20px 40px' }}>
        <Tap
          onClick={onDone}
          label={onDone ? 'Done, back to ticket' : undefined}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 16,
            boxShadow: `inset 0 0 0 1.5px ${t.line}`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 16.5,
            fontWeight: 800,
            paddingTop: 2
          }}
        >
          Done
        </Tap>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Trip status                                                         */
/* ------------------------------------------------------------------ */

/** On board: where the train is and what is next. */
export function TripStatusScreen() {
  return (
    <Screen>
      <TealHeader style={{ paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton dark />
          <div>
            <Label style={{ color: 'rgba(244,241,232,0.62)' }}>Train 507 • Thu, Mar 12</Label>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4 }}>Portland to Seattle</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 11, height: 11, borderRadius: 6, background: '#5CC796' }} />
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>On time</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700 }}>Arrives Seattle</div>
            <Time value='11:41 am' size={22} />
          </div>
        </div>
        <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'rgba(244,241,232,0.16)', marginTop: 16 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '44%', borderRadius: 4, background: t.yellow }} />
          <span
            style={{
              position: 'absolute',
              left: '44%',
              top: -5,
              width: 18,
              height: 18,
              marginLeft: -9,
              borderRadius: 9,
              background: t.yellow,
              boxShadow: `0 0 0 4px ${t.teal}`
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, opacity: 0.7, marginTop: 8 }}>
          <span>PDX 8:15</span>
          <span>2 h to go</span>
          <span>SEA 11:41</span>
        </div>
      </TealHeader>

      <div style={{ padding: '16px 20px 0', flex: 1 }}>
        <div style={{ position: 'relative' }}>
          {stops.map((s, i) => {
            const done = s.state === 'done';
            const yours = s.state === 'yours';
            const next = s.state === 'next';
            return (
              <div key={s.name}>
                {next && (
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', height: 44 }}>
                    <div style={{ width: 62 }} />
                    <div style={{ width: 22, display: 'flex', justifyContent: 'center', position: 'relative', alignSelf: 'stretch' }}>
                      <span style={{ position: 'absolute', top: 0, bottom: '50%', width: 3, background: t.teal }} />
                      <span style={{ position: 'absolute', top: '50%', bottom: 0, width: 3, background: t.line }} />
                      <span
                        style={{
                          position: 'relative',
                          alignSelf: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          background: t.yellow,
                          display: 'grid',
                          placeItems: 'center',
                          color: t.ink,
                          boxShadow: `0 0 0 4px ${t.cream}`
                        }}
                      >
                        <Icon name='train' size={16} stroke={2.1} />
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 750, color: t.ink }}>
                      Near Centralia • next stop in 21 min
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 14, minHeight: yours ? 76 : 72 }}>
                  <div style={{ width: 62, paddingTop: 1 }}>
                    <Time value={s.time} size={15} weight={800} style={{ color: done ? t.mute : t.ink }} />
                  </div>
                  <div style={{ width: 22, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    {i < stops.length - 1 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          bottom: 0,
                          width: 3,
                          background: done && stops[i + 1].state === 'done' ? t.teal : done ? t.teal : t.line
                        }}
                      />
                    )}
                    {i > 0 && <span style={{ position: 'absolute', top: 0, height: 8, width: 3, background: done ? t.teal : t.line }} />}
                    <span
                      style={{
                        position: 'relative',
                        width: yours ? 18 : 14,
                        height: yours ? 18 : 14,
                        marginTop: yours ? 0 : 2,
                        borderRadius: 9,
                        background: done ? t.teal : yours ? t.ink : t.cream,
                        boxShadow: done ? 'none' : `inset 0 0 0 3px ${yours ? t.ink : t.faint}`
                      }}
                    >
                      {yours && <span style={{ position: 'absolute', inset: 5, borderRadius: 4, background: t.yellow }} />}
                    </span>
                  </div>
                  <div style={{ flex: 1, paddingBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: done ? t.mute : t.ink, lineHeight: 1.1 }}>{s.name}</div>
                    <div style={{ fontSize: 12.5, color: yours ? t.teal : t.mute, fontWeight: yours ? 750 : 500, marginTop: 3 }}>
                      {s.note}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 16px 40px' }}>
        <div
          style={{
            background: t.paper,
            borderRadius: 18,
            boxShadow: `inset 0 0 0 1px ${t.line}`,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 10, background: t.tealSoft, color: t.teal, display: 'grid', placeItems: 'center' }}>
            <Icon name='bell' size={20} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800 }}>Nudge me before Seattle</div>
            <div style={{ fontSize: 12.5, color: t.mute }}>10 min ahead, and which side to exit</div>
          </div>
          <Switch on />
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Before: the old first step                                          */
/* ------------------------------------------------------------------ */

/** Before: step one of seven, and not a price in sight. */
export function OldBookingScreen() {
  const sys = 'ui-sans-serif, system-ui, -apple-system, sans-serif';
  const field = (label: string, value: string, opts: { muted?: boolean; select?: boolean; disabled?: boolean; optional?: boolean } = {}) => (
    <div key={label} style={{ opacity: opts.disabled ? 0.45 : 1 }}>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
        {label} {!opts.disabled && !opts.optional && <span style={{ color: '#c33' }}>*</span>}
      </div>
      <div
        style={{
          height: 40,
          borderRadius: 6,
          border: '1px solid #cfcfcf',
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 14,
          color: opts.muted ? '#a0a0a0' : '#222',
          background: '#fff'
        }}
      >
        {value}
        {opts.select && <span style={{ color: '#999', fontSize: 11 }}>▼</span>}
      </div>
    </div>
  );
  const stepper = (label: string, n: number) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 40, borderBottom: '1px solid #eee' }}>
      <span style={{ fontSize: 14, color: '#333' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15 }}>
        <span style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #cfcfcf', display: 'grid', placeItems: 'center', color: '#999' }}>−</span>
        {n}
        <span style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #cfcfcf', display: 'grid', placeItems: 'center', color: '#555' }}>+</span>
      </span>
    </div>
  );
  return (
    <Screen bg='#F6F6F4' style={{ fontFamily: sys, color: '#222', fontVariantNumeric: 'normal', fontFeatureSettings: 'normal' }}>
      <div style={{ background: '#1d5a63', color: '#fff', padding: '56px 16px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Book a Trip</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Step 1 of 7 • Trip Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 12 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} style={{ height: 4, borderRadius: 2, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 18px 0', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', gap: 18, fontSize: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, border: '5px solid #1d5a63', boxSizing: 'border-box' }} /> One-Way
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, border: '1.5px solid #aaa', boxSizing: 'border-box' }} /> Round-Trip
          </span>
        </div>
        {field('Origin Station', 'Select origin', { muted: true, select: true })}
        {field('Destination Station', 'Select destination', { muted: true, select: true })}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {field('Depart Date', 'MM/DD/YYYY', { muted: true })}
          {field('Return Date', 'MM/DD/YYYY', { muted: true, disabled: true })}
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>
            Passengers <span style={{ color: '#c33' }}>*</span>
          </div>
          {stepper('Adults (16–64)', 1)}
          {stepper('Children (2–15)', 0)}
          {stepper('Seniors (65+)', 0)}
        </div>
        {field('Promo Code (optional)', '', { optional: true })}
        <div style={{ fontSize: 12, color: '#777', lineHeight: 1.4 }}>
          Bicycles, pets and accessibility needs can be added in Step 4. Fares are displayed after seat selection.
        </div>
      </div>
      <div style={{ padding: '0 18px 40px' }}>
        <div
          style={{ height: 46, borderRadius: 6, background: '#c9cfcf', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 16 }}
        >
          Continue
        </div>
      </div>
    </Screen>
  );
}
