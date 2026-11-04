import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Band } from './band';
import {
  CORRIDOR,
  LONG_RUN_LOAD_PER_KM,
  LONG_RUN_MAX_KM,
  forecast,
  formatDuration,
  levelLeds,
  longRunMinutes,
  weekDays,
  type Level,
  type Status,
  type Sunday
} from './data';
import { Card, Chevron, Chip, Label, Leds, Screen, TabBar, stripes, t, zoneColors } from './theme';

const statusColor = (s: Status) => (s === 'over' ? t.coral : s === 'under' ? t.sage : t.lime);
const levelColor = (l: Level) => (l === 'easy' ? t.coral : t.lime);

function Top({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: '58px 20px 0', ...style }}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Corridor meter: the week's load against its healthy range           */
/* ------------------------------------------------------------------ */

type Segment = { load: number; planned: boolean; highlight?: boolean };

export function CorridorMeter({
  segments,
  status,
  scaleMax = 600,
  labels = true,
  height = 12
}: {
  segments: Segment[];
  status: Status;
  scaleMax?: number;
  labels?: boolean;
  height?: number;
}) {
  const pct = (v: number) => `${(Math.min(v, scaleMax) / scaleMax) * 100}%`;
  const color = statusColor(status);
  let acc = 0;
  const wall = (v: number) => (
    <div
      style={{
        position: 'absolute',
        left: pct(v),
        top: -6,
        height: height + 12,
        width: 2,
        marginLeft: -1,
        borderRadius: 1,
        background: t.lime,
        opacity: 0.9
      }}
    />
  );
  return (
    <div style={{ position: 'relative', paddingTop: 6, paddingBottom: labels ? 22 : 6 }}>
      <div style={{ position: 'relative', height }}>
        {/* Zones */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: height / 2, overflow: 'hidden', background: '#20251C' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(CORRIDOR.low), width: `calc(${pct(CORRIDOR.high)} - ${pct(CORRIDOR.low)})`, background: '#2E3A1D' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(CORRIDOR.high), right: 0, background: t.coralDim }} />
        </div>
        {/* Days */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: height / 2, overflow: 'hidden' }}>
          {segments.map((s, i) => {
            const left = acc;
            acc += s.load;
            if (s.load <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: pct(left),
                  width: `max(0px, calc(${pct(s.load)} - 2px))`,
                  background: s.planned ? stripes(color, s.highlight ? 0.55 : 0.3) : color,
                  boxShadow: s.highlight ? `inset 0 0 0 1.5px ${color}` : undefined,
                  transition: 'left 160ms, width 160ms, background 200ms'
                }}
              />
            );
          })}
        </div>
        {wall(CORRIDOR.low)}
        {wall(CORRIDOR.high)}
      </div>
      {labels && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, fontSize: 11.5, fontWeight: 600, color: t.soft }}>
          <span style={{ position: 'absolute', left: 0 }}>0</span>
          <span style={{ position: 'absolute', left: pct(CORRIDOR.low), transform: 'translateX(-50%)', color: t.lime }}>{CORRIDOR.low}</span>
          <span style={{ position: 'absolute', left: pct(CORRIDOR.high), transform: 'translateX(-50%)', color: t.lime }}>{CORRIDOR.high}</span>
          <span style={{ position: 'absolute', right: 0 }}>{scaleMax}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Today: readiness as one sentence, with the two signals behind it    */
/* ------------------------------------------------------------------ */

// Oct 1 to Oct 18, 2024.
const rhrDays = [52, 53, 51, 52, 52, 50, 51, 53, 52, 51, 52, 51, 53, 52, 51, 52, 53, 58];
const hrvDays = [50, 48, 53, 55, 49, 52, 47, 51, 54, 56, 50, 49, 52, 55, 53, 46, 43, 47];
const RHR_NORMAL = { avg: 52, lo: 50, hi: 54 };
const HRV_NORMAL = { avg: 51, lo: 44, hi: 58 };

type MorningId = 'tue' | 'thu' | 'fri';

const mornings: Record<
  MorningId,
  {
    date: string;
    index: number;
    level: Level;
    headline: string;
    reason: string;
    plan: { title: string; detail: string; load: number };
    done: number;
    sleep: { asleep: string; note: string; short: boolean };
  }
> = {
  tue: {
    date: 'Tuesday, October 15',
    index: 14,
    level: 'ready',
    headline: 'Ready for a hard day.',
    reason: 'Resting heart rate and HRV are both right at your normal.',
    plan: { title: 'Intervals, 6 × 800 m', detail: '2:55 per rep with a 400 m jog between. Duniway track.', load: 96 },
    done: 44,
    sleep: { asleep: '7 h 38 min', note: 'At your need', short: false }
  },
  thu: {
    date: 'Thursday, October 17',
    index: 16,
    level: 'steady',
    headline: 'A normal day.',
    reason: 'Your HRV is a little low after Tuesday, but resting heart rate is steady.',
    plan: { title: 'Tempo ride, 65 min', detail: '20 minutes at 150–158 bpm on the Springwater trail.', load: 72 },
    done: 146,
    sleep: { asleep: '7 h 50 min', note: '15 min over your need', short: false }
  },
  fri: {
    date: 'Friday, October 18',
    index: 17,
    level: 'easy',
    headline: 'Go easy today.',
    reason: 'Your resting heart rate is 6 bpm above your 30-day normal.',
    plan: { title: 'Easy run, 30 min', detail: 'Keep it under 145 bpm. If your legs feel heavy, walk the hills.', load: 30 },
    done: 218,
    sleep: { asleep: '6 h 41 min', note: '54 min short', short: true }
  }
};

function Spark({
  values,
  lo,
  hi,
  min,
  max,
  out,
  w = 136,
  h = 38
}: {
  values: number[];
  lo: number;
  hi: number;
  min: number;
  max: number;
  out: boolean;
  w?: number;
  h?: number;
}) {
  const x = (i: number) => 3 + (i / (values.length - 1)) * (w - 8);
  const y = (v: number) => h - 3 - ((v - min) / (max - min)) * (h - 6);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = values[values.length - 1];
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden>
      <rect x='0' y={y(hi)} width={w} height={y(lo) - y(hi)} rx='3' fill={t.sageDim} />
      <path d={d} fill='none' stroke={t.soft} strokeWidth='1.8' strokeLinejoin='round' strokeLinecap='round' />
      <circle cx={x(values.length - 1)} cy={y(last)} r='4.5' fill={out ? t.coral : t.lime} stroke={t.surface} strokeWidth='2' />
    </svg>
  );
}

function Signal({
  name,
  value,
  unit,
  normal,
  delta,
  out,
  spark
}: {
  name: string;
  value: number;
  unit: string;
  normal: string;
  delta: string;
  out: boolean;
  spark: ReactNode;
}) {
  return (
    <Card style={{ flex: 1, padding: '14px 14px 12px', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, fontWeight: 650, color: t.soft }}>{name}</span>
        <span style={{ fontSize: 12, fontWeight: 750, color: out ? t.coral : t.soft }}>{delta}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <span style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.soft }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: t.mute, marginTop: 4, marginBottom: 10 }}>{normal}</div>
      {spark}
    </Card>
  );
}

export function TodayScreen({ day = 'fri' }: { day?: MorningId }) {
  const m = mornings[day];
  const rhr = rhrDays.slice(m.index - 13, m.index + 1);
  const hrv = hrvDays.slice(m.index - 13, m.index + 1);
  const rhrNow = rhr[rhr.length - 1];
  const hrvNow = hrv[hrv.length - 1];
  const rhrDelta = rhrNow - RHR_NORMAL.avg;
  const rhrOut = rhrNow > RHR_NORMAL.hi || rhrNow < RHR_NORMAL.lo;
  const hrvOut = hrvNow > HRV_NORMAL.hi || hrvNow < HRV_NORMAL.lo;
  const hrvPct = Math.round(((hrvNow - HRV_NORMAL.avg) / HRV_NORMAL.avg) * 100);
  const color = levelColor(m.level);
  const plannedTotal = 428;
  return (
    <Screen>
      <Top>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: t.soft }}>{m.date}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 30,
              padding: '0 11px',
              borderRadius: 15,
              background: t.surface,
              boxShadow: `inset 0 0 0 1px ${t.lineSoft}`,
              fontSize: 12,
              fontWeight: 650,
              color: t.soft
            }}
          >
            <Leds lit={levelLeds[m.level]} color={color} size={7} gap={4} />
            On your band
          </span>
        </div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 0.98,
            marginTop: 26,
            maxWidth: 330
          }}
        >
          {m.headline}
        </div>
        <div style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.3, marginTop: 14, color: '#D3DAC6', maxWidth: 340, letterSpacing: '-0.01em' }}>
          {m.reason}
        </div>
      </Top>

      <div style={{ padding: '26px 20px 0' }}>
        <Label style={{ marginBottom: 10 }}>Behind this</Label>
        <div style={{ display: 'flex', gap: 10 }}>
          <Signal
            name='Resting HR'
            value={rhrNow}
            unit='bpm'
            normal={`Normal ${RHR_NORMAL.lo}–${RHR_NORMAL.hi}`}
            delta={rhrDelta === 0 ? 'Normal' : `${rhrDelta > 0 ? '+' : '−'}${Math.abs(rhrDelta)} bpm`}
            out={rhrOut}
            spark={<Spark values={rhr} lo={RHR_NORMAL.lo} hi={RHR_NORMAL.hi} min={47} max={60} out={rhrOut} />}
          />
          <Signal
            name='HRV'
            value={hrvNow}
            unit='ms'
            normal={`Normal ${HRV_NORMAL.lo}–${HRV_NORMAL.hi}`}
            delta={hrvOut ? `${hrvPct > 0 ? '+' : '−'}${Math.abs(hrvPct)}%` : 'In range'}
            out={hrvOut}
            spark={<Spark values={hrv} lo={HRV_NORMAL.lo} hi={HRV_NORMAL.hi} min={38} max={62} out={hrvOut} />}
          />
        </div>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <Label style={{ marginBottom: 10 }}>Today’s plan</Label>
        <Card style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16.5, fontWeight: 700 }}>{m.plan.title}</div>
            <div style={{ fontSize: 13.5, color: t.soft, marginTop: 3, lineHeight: 1.35, textWrap: 'pretty' }}>{m.plan.detail}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 750 }}>{m.plan.load}</div>
            <div style={{ fontSize: 11.5, color: t.mute, fontWeight: 600 }}>load</div>
          </div>
        </Card>
        <Card style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke={t.soft} strokeWidth='1.9' strokeLinejoin='round' aria-hidden>
            <path d='M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z' />
          </svg>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: t.soft }}>
            Last night <b style={{ color: t.fg, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.sleep.asleep}</b>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 650, color: m.sleep.short ? t.coral : t.soft }}>{m.sleep.note}</span>
          <Chevron dir='right' size={16} color={t.mute} />
        </Card>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <Label>This week</Label>
          <span style={{ fontSize: 12.5, color: t.soft, fontWeight: 600 }}>
            <b style={{ color: t.fg }}>{m.done}</b> done · {plannedTotal} planned · range {CORRIDOR.low}–{CORRIDOR.high}
          </span>
        </div>
        <CorridorMeter
          labels={false}
          height={10}
          status='in'
          segments={[
            { load: m.done, planned: false },
            { load: plannedTotal - m.done, planned: true }
          ]}
        />
      </div>
      <TabBar active='today' />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Week: the load corridor, with the weekend still to plan             */
/* ------------------------------------------------------------------ */

const PLOT_H = 150;
const PLOT_MAX = 300;

type WeekProps = {
  km: number;
  sunday: Sunday;
  onKm?: (km: number) => void;
  onSunday?: (s: Sunday) => void;
};

function LongRunColumn({
  km,
  load,
  status,
  onKm
}: {
  km: number;
  load: number;
  status: Status;
  onKm?: (km: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const color = statusColor(status);
  const interactive = Boolean(onKm);
  const barH = Math.max(4, (load / PLOT_MAX) * PLOT_H);

  const fromPointer = (clientY: number) => {
    const el = ref.current;
    if (!el || !onKm) return;
    const box = el.getBoundingClientRect();
    const ratio = (box.bottom - clientY) / box.height;
    const next = (PLOT_MAX / LONG_RUN_LOAD_PER_KM) * ratio;
    onKm(Math.max(0, Math.min(LONG_RUN_MAX_KM, Math.round(next))));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!onKm) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    fromPointer(e.clientY);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!onKm || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    fromPointer(e.clientY);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onKm) return;
    const step: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 5, PageDown: -5 };
    let next: number | null = null;
    if (e.key in step) next = km + step[e.key];
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = LONG_RUN_MAX_KM;
    if (next === null) return;
    e.preventDefault();
    onKm(Math.max(0, Math.min(LONG_RUN_MAX_KM, next)));
  };

  const minutes = longRunMinutes(km);
  return (
    <div
      ref={ref}
      {...(interactive
        ? {
            role: 'slider',
            tabIndex: 0,
            'aria-label': 'Saturday long run distance',
            'aria-valuemin': 0,
            'aria-valuemax': LONG_RUN_MAX_KM,
            'aria-valuenow': km,
            'aria-valuetext': km === 0 ? 'Skipped' : `${km} kilometres, about ${formatDuration(minutes)}, load ${load}`,
            'aria-orientation': 'vertical' as const,
            onPointerDown,
            onPointerMove,
            onKeyDown,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false)
          }
        : {})}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: interactive ? 'ns-resize' : undefined,
        touchAction: interactive ? 'none' : undefined,
        borderRadius: 10,
        outlineOffset: 2
      }}
    >
      {/* Reach of the handle, so the column reads as draggable */}
      <div style={{ position: 'absolute', left: 6, right: 6, top: 0, bottom: 0, borderRadius: 9, background: focused ? 'rgba(238,243,226,0.08)' : 'rgba(238,243,226,0.035)', boxShadow: focused ? `inset 0 0 0 1.5px ${color}66` : undefined, transition: 'background 160ms, box-shadow 160ms' }} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          width: 30,
          marginLeft: -15,
          bottom: 0,
          height: barH,
          borderRadius: '7px 7px 3px 3px',
          background: stripes(color, 0.45),
          boxShadow: `inset 0 0 0 1.5px ${color}`,
          transition: 'height 120ms, background 200ms, box-shadow 200ms'
        }}
      />
      {/* Handle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          width: 38,
          height: 14,
          marginLeft: -19,
          bottom: barH - 7,
          borderRadius: 7,
          background: color,
          boxShadow: `0 0 0 3px ${t.bg}, 0 4px 12px rgba(0,0,0,0.5)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          transition: 'bottom 120ms, background 200ms'
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 2, height: 6, borderRadius: 1, background: t.limeInk, opacity: 0.6 }} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: barH + 12,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 800,
          color,
          transition: 'bottom 120ms, color 200ms'
        }}
      >
        {load}
      </div>
    </div>
  );
}

export function WeekScreen({ km, sunday, onKm, onSunday }: WeekProps) {
  const days = weekDays(km, sunday);
  const f = forecast(km, sunday);
  const color = statusColor(f.status);
  const interactive = Boolean(onKm);
  const statusText =
    f.status === 'in' ? 'In your corridor' : f.status === 'over' ? `${f.gap} over range` : `${f.gap} under range`;
  const minutes = longRunMinutes(km);

  const stepBtn = (delta: number, label: string) => {
    const disabled = km + delta < 0 || km + delta > LONG_RUN_MAX_KM;
    const common: CSSProperties = {
      width: 40,
      height: 40,
      borderRadius: 20,
      border: 'none',
      background: t.raised,
      color: t.fg,
      display: 'grid',
      placeItems: 'center',
      boxShadow: `inset 0 0 0 1px ${t.line}`,
      opacity: disabled ? 0.4 : 1,
      flex: 'none'
    };
    const glyph = (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
        <path d={delta > 0 ? 'M3 8h10M8 3v10' : 'M3 8h10'} />
      </svg>
    );
    return interactive ? (
      <button
        type='button'
        aria-label={label}
        disabled={disabled}
        onClick={() => onKm?.(km + delta)}
        style={{ ...common, cursor: disabled ? 'default' : 'pointer', font: 'inherit' }}
      >
        {glyph}
      </button>
    ) : (
      <span style={common}>{glyph}</span>
    );
  };

  const sundayOptions: [Sunday, string][] = [
    ['spin', 'Easy spin, 45 min'],
    ['rest', 'Rest']
  ];

  return (
    <Screen>
      {interactive && <style>{demoKeyframes}</style>}
      <Top>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Label>Oct 14 – 20 · Build week 3 of 5</Label>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 4 }}>This week</div>
          </div>
        </div>
      </Top>

      {/* Week total against the corridor */}
      <div style={{ padding: '14px 20px 0' }}>
        <Card style={{ padding: '14px 16px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color, transition: 'color 200ms' }}>
                {f.total}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.soft, lineHeight: 1.2 }}>
                planned
                <br />
                load
              </span>
            </div>
            <span key={f.status} className='ebb-anim' style={{ display: 'inline-flex', animation: interactive ? 'ebb-pop 300ms ease-out' : undefined }}>
            <Chip tone={f.status === 'in' ? 'lime' : f.status === 'over' ? 'coral' : 'sage'}>
              {f.status === 'in' && (
                <svg width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M2.5 6.2 5 8.5l4.5-5' />
                </svg>
              )}
              {statusText}
            </Chip>
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: t.soft, marginTop: 6 }}>
            Healthy range {CORRIDOR.low}–{CORRIDOR.high}, from your last 4 weeks
          </div>
          <div style={{ marginTop: 10 }}>
            <CorridorMeter
              status={f.status}
              segments={days.map((d) => ({ load: d.load, planned: d.state !== 'done', highlight: d.id === 'sat' }))}
            />
          </div>
        </Card>
      </div>

      {/* Daily bars: no daily targets, just what each day holds */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ position: 'relative', height: PLOT_H + 24, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: t.line }} />
          <div style={{ position: 'absolute', left: 0, top: 2, width: 240 }}>
            <Label>By day</Label>
            <div style={{ fontSize: 12.5, color: t.mute, marginTop: 3, lineHeight: 1.3 }}>No daily targets, only a weekly range.</div>
          </div>
          {days.map((d) => {
            const isSat = d.id === 'sat';
            const barH = d.load === 0 ? 0 : Math.max(3, (d.load / PLOT_MAX) * PLOT_H);
            const planned = d.state !== 'done';
            return (
              <div key={d.id} style={{ position: 'relative' }}>
                {isSat ? (
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: PLOT_H }}>
                      <LongRunColumn km={km} load={d.load} status={f.status} onKm={onKm} />
                    </div>
                  </div>
                ) : (
                  <>
                    {d.load > 0 ? (
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          width: 26,
                          marginLeft: -13,
                          bottom: 0,
                          height: barH,
                          borderRadius: '6px 6px 2px 2px',
                          background: planned ? stripes('#AEB8A2', 0.25) : '#D8DFCB',
                          boxShadow: planned ? `inset 0 0 0 1.5px #AEB8A2` : undefined
                        }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', left: '50%', width: 14, marginLeft: -7, bottom: 6, height: 2, borderRadius: 1, background: t.mute }} />
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: barH + 6,
                        textAlign: 'center',
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: planned ? t.soft : t.fg
                      }}
                    >
                      {d.load > 0 ? d.load : ''}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginTop: 8, textAlign: 'center' }}>
          {days.map((d) => (
            <div key={d.id}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: d.state === 'today' ? t.lime : d.state === 'done' ? t.fg : t.soft }}>
                {d.state === 'today' ? 'Today' : d.dow}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: t.mute, marginTop: 1 }}>{d.short}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Saturday: the planned long run */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 650, color: t.mute }}>Saturday · Long run</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{km === 0 ? 'Skip' : `${km} km`}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: t.soft }}>{km === 0 ? 'No run' : `${formatDuration(minutes)} at 5:50/km`}</span>
            </div>
          </div>
          {stepBtn(-1, 'One kilometre shorter')}
          {stepBtn(1, 'One kilometre longer')}
        </div>
      </div>

      {/* Sunday, as the morning sentence will read */}
      <div style={{ padding: '14px 20px 0' }}>
        <Card style={{ padding: '14px 16px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Label>Sunday morning, expected</Label>
            <Leds lit={levelLeds[f.level]} color={levelColor(f.level)} size={8} gap={4} />
          </div>
          <div
            key={f.headline}
            className='ebb-anim'
            style={{ fontSize: 19.5, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1.2, animation: interactive ? 'ebb-rise 260ms ease-out' : undefined }}
          >
            {f.headline}
          </div>
          <div style={{ fontSize: 13.5, color: t.soft, marginTop: 4, lineHeight: 1.38, minHeight: 37 }}>{f.detail}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <span style={signalChip}>
              Resting HR <b style={{ color: f.rhr >= 5 ? t.coral : t.fg }}>{f.rhr === 0 ? 'normal' : `+${f.rhr} bpm`}</b>
            </span>
            <span style={signalChip}>
              HRV <b style={{ color: f.hrv >= 15 ? t.coral : t.fg }}>{f.hrv === 0 ? 'normal' : `−${f.hrv}%`}</b>
            </span>
          </div>
          <div
            role={interactive ? 'radiogroup' : undefined}
            aria-label={interactive ? 'Sunday plan' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.lineSoft}` }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 650, color: t.mute, marginRight: 'auto' }}>Sunday</span>
            {sundayOptions.map(([id, label]) => {
              const active = sunday === id;
              const style: CSSProperties = {
                height: 32,
                padding: '0 12px',
                borderRadius: 16,
                border: 'none',
                font: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                background: active ? t.fg : 'transparent',
                color: active ? t.bg : t.soft,
                boxShadow: active ? 'none' : `inset 0 0 0 1.5px ${t.line}`,
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'background 160ms, color 160ms'
              };
              return interactive ? (
                <button
                  key={id}
                  type='button'
                  role='radio'
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  data-sunday={id}
                  onClick={() => onSunday?.(id)}
                  onKeyDown={(e) => {
                    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
                    e.preventDefault();
                    const next: Sunday = id === 'spin' ? 'rest' : 'spin';
                    onSunday?.(next);
                    e.currentTarget.parentElement?.querySelector<HTMLElement>(`[data-sunday='${next}']`)?.focus();
                  }}
                  style={{ ...style, cursor: 'pointer' }}
                >
                  {label}
                </button>
              ) : (
                <span key={id} style={style}>
                  {label}
                </span>
              );
            })}
          </div>
        </Card>
      </div>
    </Screen>
  );
}

const demoKeyframes = `
@keyframes ebb-pop { 0% { transform: scale(0.9); } 55% { transform: scale(1.07); } 100% { transform: scale(1); } }
@keyframes ebb-rise { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ebb-anim { animation: none !important; } }
`;

const signalChip: CSSProperties = {
  display: 'inline-flex',
  gap: 6,
  alignItems: 'center',
  height: 28,
  padding: '0 10px',
  borderRadius: 8,
  background: t.raised,
  fontSize: 12.5,
  fontWeight: 600,
  color: t.soft
};

/* ------------------------------------------------------------------ */
/* Workout detail: Tuesday's intervals, with heart rate zones          */
/* ------------------------------------------------------------------ */

const ZONES = [
  { id: 'Z1', name: 'Recovery', lo: 0, hi: 123 },
  { id: 'Z2', name: 'Easy', lo: 124, hi: 138 },
  { id: 'Z3', name: 'Steady', lo: 139, hi: 151 },
  { id: 'Z4', name: 'Threshold', lo: 152, hi: 165 },
  { id: 'Z5', name: 'Max', lo: 166, hi: 999 }
];
const zoneOf = (hr: number) => ZONES.findIndex((z) => hr <= z.hi);

const REP_START = 15;
const REP_CYCLE = 5.5;
const REP_LEN = 2.95;

/** Tuesday's session, sampled every 20 seconds. Deterministic. */
const intervalHr = (() => {
  const pts: { m: number; hr: number }[] = [];
  const step = 1 / 3;
  let hr = 98;
  for (let i = 0; i <= 175; i++) {
    const m = i * step;
    let target: number;
    let tau = 1.2;
    if (m < REP_START) {
      target = 112 + (m / REP_START) * 28;
      tau = 2;
    } else if (m < REP_START + REP_CYCLE * 6) {
      const k = Math.floor((m - REP_START) / REP_CYCLE);
      const into = m - REP_START - k * REP_CYCLE;
      if (into < REP_LEN) {
        target = 176 + k * 2;
        tau = 0.8;
      } else {
        target = 118;
        tau = 0.7;
      }
    } else {
      target = 114 - Math.min(10, (m - 48) * 0.8);
      tau = 1.6;
    }
    hr += (target - hr) * (1 - Math.exp(-step / tau));
    const noise = Math.sin(i * 1.7) * 1.1 + Math.sin(i * 0.37 + 1) * 1.5;
    pts.push({ m, hr: Math.round(hr + noise) });
  }
  return pts;
})();

const intervalStats = (() => {
  const minutes = [0, 0, 0, 0, 0];
  let sum = 0;
  let max = 0;
  for (const p of intervalHr) {
    minutes[zoneOf(p.hr)] += 1 / 3;
    sum += p.hr;
    max = Math.max(max, p.hr);
  }
  const reps = Array.from({ length: 6 }, (_, k) => {
    const s = REP_START + k * REP_CYCLE;
    const inRep = intervalHr.filter((p) => p.m >= s && p.m <= s + REP_LEN + 0.34);
    return Math.max(...inRep.map((p) => p.hr));
  });
  return { minutes: minutes.map((v) => Math.round(v)), avg: Math.round(sum / intervalHr.length), max, reps };
})();

function HrChart({ w = 350, h = 150 }: { w?: number; h?: number }) {
  const min = 90;
  const max = 192;
  const x = (m: number) => (m / 58.33) * w;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  const d = intervalHr.map((p, i) => `${i ? 'L' : 'M'}${x(p.m).toFixed(1)} ${y(p.hr).toFixed(1)}`).join(' ');
  const stops = ZONES.map((z, i) => ({ y0: y(Math.min(max, z.hi + 0.5)), y1: y(Math.max(min, z.lo - 0.5)), color: zoneColors[i] }));
  return (
    <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      <defs>
        <linearGradient id='ebb-hr-line' x1='0' x2='0' y1='0' y2={h} gradientUnits='userSpaceOnUse'>
          {stops
            .slice()
            .reverse()
            .flatMap((s, i) => [
              <stop key={`a${i}`} offset={Math.max(0, s.y0 / h)} stopColor={s.color} />,
              <stop key={`b${i}`} offset={Math.min(1, s.y1 / h)} stopColor={s.color} />
            ])}
        </linearGradient>
      </defs>
      {stops.map((s, i) => (
        <rect key={i} x='0' y={s.y0} width={w} height={s.y1 - s.y0} fill={s.color} opacity={0.07 + i * 0.012} />
      ))}
      {[124, 139, 152, 166].map((v) => (
        <line key={v} x1='0' x2={w} y1={y(v - 0.5)} y2={y(v - 0.5)} stroke={t.bg} strokeWidth='1' />
      ))}
      {Array.from({ length: 6 }, (_, k) => {
        const s = REP_START + k * REP_CYCLE;
        return (
          <g key={k}>
            <rect x={x(s)} y='0' width={x(REP_LEN)} height={h} fill={t.fg} opacity='0.05' />
            <text x={x(s + REP_LEN / 2)} y='-6' textAnchor='middle' fontSize='10' fontWeight='700' fill={t.mute} fontFamily={t.font}>
              {k + 1}
            </text>
          </g>
        );
      })}
      <path d={d} fill='none' stroke='url(#ebb-hr-line)' strokeWidth='2' strokeLinejoin='round' />
      {[0, 15, 30, 45].map((m) => (
        <text key={m} x={x(m) + (m === 0 ? 0 : 0)} y={h + 15} textAnchor={m === 0 ? 'start' : 'middle'} fontSize='11' fontWeight='600' fill={t.mute} fontFamily={t.font}>
          {m === 0 ? '0' : `${m}`}
        </text>
      ))}
      <text x={w} y={h + 15} textAnchor='end' fontSize='11' fontWeight='600' fill={t.mute} fontFamily={t.font}>
        58 min
      </text>
    </svg>
  );
}

export function WorkoutScreen() {
  const s = intervalStats;
  const splits = ['2:58', '2:55', '2:57', '2:54', '2:56', '2:52'];
  const maxMin = Math.max(...s.minutes);
  return (
    <Screen>
      <Top style={{ paddingTop: 54 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: -6 }}>
          <Chevron />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.soft }}>Tuesday, Oct 15 · 6:12 am</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 12 }}>Intervals, 6 × 800 m</div>
        <div style={{ fontSize: 14, color: t.soft, marginTop: 4 }}>Duniway Park track · 10.4 km</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 16, gap: 8 }}>
          {[
            ['Time', '58:20'],
            ['Avg HR', `${s.avg}`],
            ['Max HR', `${s.max}`],
            ['Load', '96']
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11.5, fontWeight: 650, color: t.mute }}>{k}</div>
              <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: '-0.02em', color: k === 'Load' ? t.lime : t.fg }}>{v}</div>
            </div>
          ))}
        </div>
      </Top>

      <div style={{ padding: '18px 20px 0' }}>
        <Label style={{ marginBottom: 10 }}>Heart rate</Label>
        <div style={{ paddingTop: 12 }}>
          <HrChart h={140} />
        </div>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <Label style={{ marginBottom: 8 }}>Time in zones</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ZONES.slice()
            .reverse()
            .map((z) => {
              const i = ZONES.indexOf(z);
              const mins = s.minutes[i];
              return (
                <div key={z.id} style={{ display: 'grid', gridTemplateColumns: '28px 86px 1fr 44px', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 800, color: zoneColors[i] }}>{z.id}</span>
                  <span style={{ color: t.soft, fontWeight: 500 }}>
                    {z.lo === 0 ? `under ${z.hi + 1}` : z.hi === 999 ? `${z.lo}+` : `${z.lo}–${z.hi}`}
                  </span>
                  <span style={{ height: 10, borderRadius: 5, background: t.raised, position: 'relative', overflow: 'hidden' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(mins / maxMin) * 100}%`, background: zoneColors[i], borderRadius: 5 }} />
                  </span>
                  <span style={{ textAlign: 'right', fontWeight: 700 }}>{mins} min</span>
                </div>
              );
            })}
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <Label style={{ marginBottom: 8 }}>Reps</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {splits.map((sp, i) => (
            <div key={i} style={{ background: t.surface, borderRadius: 10, padding: '8px 0 7px', textAlign: 'center', boxShadow: `inset 0 0 0 1px ${t.lineSoft}` }}>
              <div style={{ fontSize: 14.5, fontWeight: 750 }}>{sp}</div>
              <div style={{ fontSize: 10.5, color: t.mute, fontWeight: 600, marginTop: 1 }}>{s.reps[i]} bpm</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13.5, color: '#D3DAC6', marginTop: 12, lineHeight: 1.4 }}>
          Your reps stayed within 6 seconds of each other, and the last was the fastest. Heart rate fell under 125 in every jog.
        </div>
      </div>
      <div style={{ padding: '16px 20px 0' }}>
        <Card style={{ padding: '12px 16px 2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Week so far</span>
            <span style={{ fontSize: 12.5, color: t.soft, fontWeight: 600 }}>
              <b style={{ color: t.fg }}>140</b> done · range {CORRIDOR.low}–{CORRIDOR.high}
            </span>
          </div>
          <CorridorMeter
            labels={false}
            height={10}
            status='in'
            segments={[
              { load: 44, planned: false },
              { load: 96, planned: false },
              { load: 288, planned: true }
            ]}
          />
        </Card>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Sleep                                                               */
/* ------------------------------------------------------------------ */

type Stage = 'awake' | 'rem' | 'light' | 'deep';
const STAGES: Stage[] = ['awake', 'rem', 'light', 'deep'];
const stageColor: Record<Stage, string> = { awake: t.coral, rem: '#93A874', light: '#56614F', deep: t.lime };
const stageName: Record<Stage, string> = { awake: 'Awake', rem: 'REM', light: 'Light', deep: 'Deep' };

// Thursday night, 11:48 pm to 6:52 am: 424 minutes in bed.
const night: [Stage, number][] = [
  ['awake', 9], ['light', 14], ['deep', 28], ['light', 10], ['rem', 9], ['light', 22], ['deep', 18], ['light', 16],
  ['rem', 16], ['awake', 3], ['light', 30], ['deep', 10], ['light', 18], ['rem', 21], ['light', 34], ['awake', 4],
  ['light', 26], ['deep', 6], ['light', 22], ['rem', 24], ['light', 40], ['rem', 18], ['light', 19], ['awake', 7]
];

const fmtHM = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;

function Hypnogram({ w = 318, rowH = 26 }: { w?: number; rowH?: number }) {
  const total = night.reduce((s, [, m]) => s + m, 0);
  let acc = 0;
  const h = rowH * STAGES.length;
  return (
    <svg width={w} height={h + 18} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      {STAGES.map((s, i) => (
        <line key={s} x1='0' x2={w} y1={i * rowH + rowH / 2} y2={i * rowH + rowH / 2} stroke={t.line} strokeDasharray='2 4' />
      ))}
      {night.slice(0, -1).map(([stage], i) => {
        const end = (night.slice(0, i + 1).reduce((a, [, m]) => a + m, 0) / total) * w;
        const a = STAGES.indexOf(stage) * rowH + rowH / 2;
        const b = STAGES.indexOf(night[i + 1][0]) * rowH + rowH / 2;
        return <line key={i} x1={end} x2={end} y1={a} y2={b} stroke='#3F4738' strokeWidth='1.5' />;
      })}
      {night.map(([stage, m], i) => {
        const x = (acc / total) * w;
        acc += m;
        const row = STAGES.indexOf(stage);
        return <rect key={i} x={x} y={row * rowH + 4} width={Math.max(2, (m / total) * w)} height={rowH - 8} rx='2.5' fill={stageColor[stage]} />;
      })}
      {[
        ['11:48 pm', 0],
        ['2 am', 132],
        ['4 am', 252],
        ['6:52 am', 424]
      ].map(([label, m]) => (
        <text
          key={label}
          x={((m as number) / total) * w}
          y={h + 15}
          textAnchor={m === 0 ? 'start' : m === 424 ? 'end' : 'middle'}
          fontSize='11'
          fontWeight='600'
          fill={t.mute}
          fontFamily={t.font}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

export function SleepScreen() {
  const by = (s: Stage) => night.filter(([st]) => st === s).reduce((a, [, m]) => a + m, 0);
  const asleep = night.filter(([s]) => s !== 'awake').reduce((a, [, m]) => a + m, 0);
  const need = 455;
  const week = [
    ['Sat', 462],
    ['Sun', 440],
    ['Mon', 485],
    ['Tue', 458],
    ['Wed', 432],
    ['Thu', 470],
    ['Fri', asleep]
  ] as const;
  const wMax = 540;
  const wMin = 300;
  // Overnight heart rate, every 10 minutes.
  const hr = Array.from({ length: 43 }, (_, i) => {
    const base = 64 - 9 * Math.sin(Math.min(1, i / 26) * (Math.PI / 2)) + (i > 26 ? (i - 26) * 0.2 : 0);
    return base + Math.sin(i * 1.3) * 0.9 + Math.sin(i * 0.5) * 0.6;
  });
  const hrMin = 46;
  const hrMax = 66;
  const hw = 150;
  const hh = 48;
  const hd = hr.map((v, i) => `${i ? 'L' : 'M'}${((i / (hr.length - 1)) * hw).toFixed(1)} ${(hh - ((v - hrMin) / (hrMax - hrMin)) * hh).toFixed(1)}`).join(' ');
  const lowIdx = hr.indexOf(Math.min(...hr));
  return (
    <Screen>
      <Top>
        <Label>Thursday night</Label>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {Math.floor(asleep / 60)}
            <span style={{ fontSize: 26, color: t.soft, fontWeight: 700, margin: '0 10px 0 4px' }}>h</span>
            {asleep % 60}
            <span style={{ fontSize: 26, color: t.soft, fontWeight: 700, marginLeft: 4 }}>min</span>
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.35, marginTop: 8, color: '#D3DAC6', letterSpacing: '-0.01em' }}>
          {need - asleep} minutes short of your usual need. You fell asleep 50 minutes later than usual after the evening ride.
        </div>
      </Top>

      <div style={{ padding: '16px 20px 0' }}>
        <Card style={{ padding: '14px 14px 12px' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 40, display: 'flex', flexDirection: 'column' }}>
              {STAGES.map((s) => (
                <div key={s} style={{ height: 26, fontSize: 11.5, fontWeight: 650, color: t.soft, display: 'flex', alignItems: 'center' }}>
                  {stageName[s]}
                </div>
              ))}
            </div>
            <Hypnogram w={278} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.lineSoft}` }}>
            {(['deep', 'rem', 'light', 'awake'] as Stage[]).map((s) => (
              <div key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 650, color: t.soft }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: stageColor[s] }} />
                  {stageName[s]}
                </div>
                <div style={{ fontSize: 16, fontWeight: 750, marginTop: 3 }}>{s === 'awake' ? `${by(s)} min` : fmtHM(by(s))}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ padding: '10px 20px 0', display: 'flex', gap: 10 }}>
        <Card style={{ flex: 1.15, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 650, color: t.soft }}>Heart rate overnight</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 750, color: t.coral }}>55</span>
            <span style={{ fontSize: 12, color: t.soft, fontWeight: 600 }}>lowest · usually 49</span>
          </div>
          <svg width={hw} height={hh + 4} style={{ display: 'block', marginTop: 6, overflow: 'visible' }} aria-hidden>
            <line x1='0' x2={hw} y1={hh - ((49 - hrMin) / (hrMax - hrMin)) * hh} y2={hh - ((49 - hrMin) / (hrMax - hrMin)) * hh} stroke={t.mute} strokeDasharray='3 3' />
            <path d={hd} fill='none' stroke={t.soft} strokeWidth='1.8' strokeLinejoin='round' />
            <circle cx={(lowIdx / (hr.length - 1)) * hw} cy={hh - ((hr[lowIdx] - hrMin) / (hrMax - hrMin)) * hh} r='4' fill={t.coral} stroke={t.surface} strokeWidth='2' />
          </svg>
        </Card>
        <Card style={{ flex: 1, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 650, color: t.soft }}>Last 7 nights</div>
          <div style={{ fontSize: 12, color: t.mute, marginTop: 4, fontWeight: 600 }}>
            Need <b style={{ color: t.fg }}>{fmtHM(need)}</b>
          </div>
          <div style={{ position: 'relative', height: 58, marginTop: 8, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
            <div style={{ position: 'absolute', left: -2, right: -2, bottom: ((need - wMin) / (wMax - wMin)) * 58, height: 0, borderTop: `1.5px dashed ${t.soft}` }} />
            {week.map(([d, v]) => (
              <div key={d} style={{ flex: 1, height: ((v - wMin) / (wMax - wMin)) * 58, borderRadius: 3, background: d === 'Fri' ? t.coral : '#56614F' }} />
            ))}
          </div>
        </Card>
      </div>
      <div style={{ padding: '10px 20px 0' }}>
        <Card style={{ padding: '2px 16px' }}>
          {[
            ['Fell asleep', '11:57 pm', 'usually 11:07 pm', true],
            ['Woke up', '6:52 am', 'usually 6:45 am', false]
          ].map(([k, v, usual, late], i) => (
            <div
              key={k as string}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 40,
                borderTop: i ? `1px solid ${t.lineSoft}` : undefined,
                fontSize: 14
              }}
            >
              <span style={{ flex: 1, color: t.soft, fontWeight: 600 }}>{k}</span>
              <span style={{ fontWeight: 750, color: late ? t.coral : t.fg }}>{v}</span>
              <span style={{ width: 120, textAlign: 'right', fontSize: 12.5, color: t.mute, fontWeight: 600 }}>{usual}</span>
            </div>
          ))}
        </Card>
      </div>
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ borderRadius: 16, padding: '12px 14px', background: '#1C2614', boxShadow: `inset 0 0 0 1px #2C3A1C`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: t.lime, marginTop: 6, flex: 'none', boxShadow: `0 0 8px ${t.lime}88` }} />
          <span style={{ fontSize: 14, lineHeight: 1.4, color: t.fg, fontWeight: 500 }}>
            Tonight, lights out by 10:45 pm gets you your 7 h 35 before Saturday’s long run.
          </span>
        </div>
      </div>
      <TabBar active='sleep' />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Band: glance and LED settings                                       */
/* ------------------------------------------------------------------ */

function LedRow({
  positions,
  color,
  label,
  current,
  note
}: {
  positions: [boolean, boolean, boolean];
  color: string;
  label: string;
  current?: boolean;
  note?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 38 }}>
      <span style={{ width: 52, height: 24, borderRadius: 12, background: '#090A08', display: 'grid', placeItems: 'center', flex: 'none' }}>
        <Leds positions={positions} color={color} size={7} gap={5} />
      </span>
      <span style={{ fontSize: 14.5, fontWeight: current ? 700 : 550, color: current ? t.fg : t.soft, flex: 1 }}>{label}</span>
      {current && (
        <span style={{ fontSize: 11.5, fontWeight: 700, color: t.bg, background: t.fg, borderRadius: 6, padding: '3px 7px' }}>{note ?? 'Now'}</span>
      )}
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span style={{ width: 46, height: 28, borderRadius: 14, background: on ? t.lime : t.raised, position: 'relative', flex: 'none' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 11, background: on ? t.limeInk : t.soft }} />
    </span>
  );
}

export function BandScreen() {
  return (
    <Screen>
      <Top>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Band</div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: t.soft }}>Synced 6:58 am</span>
        </div>
      </Top>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 0' }}>
        <Band width={300} leds={[true, false, false]} ledColor={t.coral} hole={t.bg} />
      </div>
      <div style={{ padding: '2px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 750 }}>Ebb Band, Chalk</div>
          <div style={{ fontSize: 12.5, color: t.soft, marginTop: 2 }}>62% · about 5 days left</div>
        </div>
        <svg width='30' height='15' viewBox='0 0 30 15' fill='none' aria-hidden>
          <rect x='0.75' y='0.75' width='25.5' height='13.5' rx='4' stroke={t.soft} strokeWidth='1.5' />
          <rect x='3' y='3' width='14' height='9' rx='2' fill={t.lime} />
          <path d='M28 5v5' stroke={t.soft} strokeWidth='2' strokeLinecap='round' />
        </svg>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <Label style={{ marginBottom: 4 }}>Tap once: today</Label>
        <LedRow positions={[true, true, true]} color={t.lime} label='Ready for a hard day' />
        <LedRow positions={[true, true, false]} color={t.lime} label='A normal day' />
        <LedRow positions={[true, false, false]} color={t.coral} label='Go easy' current />
      </div>
      <div style={{ padding: '12px 20px 0' }}>
        <Label style={{ marginBottom: 4 }}>Tap twice: this week</Label>
        <LedRow positions={[true, false, false]} color={t.sage} label='Under your range' />
        <LedRow positions={[false, true, false]} color={t.lime} label='In your corridor' current />
        <LedRow positions={[false, false, true]} color={t.coral} label='Over your range' />
      </div>
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46, borderTop: `1px solid ${t.lineSoft}` }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 650 }}>Show today when I wake</div>
            <div style={{ fontSize: 12, color: t.mute }}>Lights for 4 seconds, then off</div>
          </div>
          <Toggle on />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46, borderTop: `1px solid ${t.lineSoft}` }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 650 }}>Dim from 10 pm to 6 am</div>
            <div style={{ fontSize: 12, color: t.mute }}>Taps still work, at a quarter brightness</div>
          </div>
          <Toggle on />
        </div>
      </div>
      <TabBar active='band' />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Plan: weeks against their corridors, toward a 30K                   */
/* ------------------------------------------------------------------ */

const loadHistory = [
  // Weeks starting Jul 22 to Nov 11, 2024. The first four only seed the corridor.
  { wk: 'Jul 22', load: 296 },
  { wk: 'Jul 29', load: 312 },
  { wk: 'Aug 5', load: 318 },
  { wk: 'Aug 12', load: 330 },
  { wk: 'Aug 19', load: 334 },
  { wk: 'Aug 26', load: 360 },
  { wk: 'Sep 2', load: 350 },
  { wk: 'Sep 9', load: 376 },
  { wk: 'Sep 16', load: 388 },
  { wk: 'Sep 23', load: 492 },
  { wk: 'Sep 30', load: 330 },
  { wk: 'Oct 7', load: 390 },
  { wk: 'Oct 14', load: 428, now: true },
  { wk: 'Oct 21', load: 465, future: true },
  { wk: 'Oct 28', load: 470, future: true },
  { wk: 'Nov 4', load: 360, future: true },
  { wk: 'Nov 11', load: 470, future: true }
].map((w, i, all) => {
  if (i < 4) return { ...w, lo: 0, hi: 0 };
  const avg = all.slice(i - 4, i).reduce((s, x) => s + x.load, 0) / 4;
  return { ...w, lo: Math.round(avg * 0.8), hi: Math.round(avg * 1.2) };
});

function CorridorHistory({ w = 326 }: { w?: number }) {
  const weeks = loadHistory.slice(4);
  const slots = weeks.length + 1;
  const left = 30;
  const slot = (w - left) / slots;
  const cx = (i: number) => left + slot * (i + 0.5);
  const top = 22;
  const ph = 150;
  const vMin = 240;
  const vMax = 560;
  const y = (v: number) => top + ((vMax - v) / (vMax - vMin)) * ph;
  const upper = weeks.map((wk, i) => `${i ? 'L' : 'M'}${cx(i) - slot / 2} ${y(wk.hi)} L${cx(i) + slot / 2} ${y(wk.hi)}`).join(' ');
  const lowerPts = weeks.map((wk, i) => [cx(i) - slot / 2, cx(i) + slot / 2, y(wk.lo)] as const);
  const lower = lowerPts.map(([a, b, yy], i) => `${i ? 'L' : 'M'}${a} ${yy} L${b} ${yy}`).join(' ');
  const area =
    upper +
    ' ' +
    lowerPts
      .slice()
      .reverse()
      .map(([a, b, yy]) => `L${b} ${yy} L${a} ${yy}`)
      .join(' ') +
    ' Z';
  const nowIdx = weeks.findIndex((wk) => wk.now);
  const line = (from: number, to: number) =>
    weeks
      .slice(from, to + 1)
      .map((wk, i) => `${i ? 'L' : 'M'}${cx(from + i)} ${y(wk.load)}`)
      .join(' ');
  const months: [number, string][] = [
    [0, 'Aug'],
    [2, 'Sep'],
    [7, 'Oct'],
    [11, 'Nov']
  ];
  const text = { fontFamily: t.font, fontSize: 11, fontWeight: 650 } as const;
  return (
    <svg width={w} height={top + ph + 24} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      {[300, 400, 500].map((v) => (
        <g key={v}>
          <line x1={left} x2={w} y1={y(v)} y2={y(v)} stroke={t.line} strokeDasharray='2 4' />
          <text x='0' y={y(v) + 4} fill={t.mute} {...text}>
            {v}
          </text>
        </g>
      ))}
      <path d={area} fill='#26311B' />
      <path d={upper} fill='none' stroke={t.lime} strokeOpacity='0.6' strokeWidth='1.5' />
      <path d={lower} fill='none' stroke={t.lime} strokeOpacity='0.6' strokeWidth='1.5' />
      <path d={line(0, nowIdx)} fill='none' stroke={t.soft} strokeWidth='1.8' strokeLinejoin='round' />
      <path d={line(nowIdx, weeks.length - 1)} fill='none' stroke={t.sage} strokeWidth='1.8' strokeDasharray='3 4' />
      {weeks.map((wk, i) => {
        const over = !wk.future && wk.load > wk.hi;
        const x = cx(i);
        const yy = y(wk.load);
        if (wk.now)
          return (
            <g key={wk.wk}>
              <circle cx={x} cy={yy} r='6' fill={t.lime} stroke={t.surface} strokeWidth='2.5' />
              <text x={x} y={yy - 11} textAnchor='middle' fill={t.lime} {...text} fontWeight={750}>
                Now
              </text>
            </g>
          );
        if (wk.future) return <circle key={wk.wk} cx={x} cy={yy} r='4' fill={t.surface} stroke={t.sage} strokeWidth='1.8' />;
        return (
          <g key={wk.wk}>
            <circle cx={x} cy={yy} r={over ? 5 : 4} fill={over ? t.coral : t.fg} stroke={t.surface} strokeWidth='2' />
            {over && (
              <text x={x} y={yy - 10} textAnchor='middle' fill={t.coral} {...text} fontWeight={750}>
                {wk.load}
              </text>
            )}
          </g>
        );
      })}
      {/* Race */}
      <g transform={`translate(${cx(weeks.length) - 5} ${y(430)})`}>
        <path d='M1 20V1' stroke={t.fg} strokeWidth='1.8' strokeLinecap='round' />
        <path d='M1 2h11l-2.5 3.8L12 9.5H1Z' fill={t.lime} />
      </g>
      {months.map(([i, m]) => (
        <text key={m} x={cx(i) - 5} y={top + ph + 18} fill={t.mute} {...text}>
          {m}
        </text>
      ))}
      <text x={cx(weeks.length) + 6} y={top + ph + 18} textAnchor='end' fill={t.fg} {...text}>
        Race
      </text>
    </svg>
  );
}

export function PlanScreen() {
  const upcoming = [
    { dates: 'Oct 21 – 27', name: 'Build', note: 'Long run 20 km' },
    { dates: 'Oct 28 – Nov 3', name: 'Build', note: 'Long run 23 km, hills' },
    { dates: 'Nov 4 – 10', name: 'Lighter week', note: 'Long run 14 km' },
    { dates: 'Nov 11 – 17', name: 'Peak', note: 'Long run 26 km on trail' }
  ];
  const row = (key: string, title: ReactNode, note: string, right: ReactNode, last = false) => (
    <div
      key={key}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 52,
        borderBottom: last ? undefined : `1px solid ${t.lineSoft}`
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: t.mute, marginTop: 1 }}>{note}</div>
      </div>
      <div style={{ textAlign: 'right' }}>{right}</div>
    </div>
  );
  return (
    <Screen>
      <Top>
        <Label>Training plan</Label>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 4 }}>Wildwood 30K</div>
        <div style={{ fontSize: 14, color: t.soft, marginTop: 4 }}>Saturday, Nov 23 · 5 weeks to go</div>
      </Top>

      <div style={{ padding: '16px 20px 0' }}>
        <Card style={{ padding: '14px 12px 12px' }}>
          <div style={{ padding: '0 4px' }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>7 of the last 8 weeks in your corridor</div>
            <div style={{ fontSize: 12.5, color: t.soft, marginTop: 2 }}>The range moves up as your last four weeks do.</div>
          </div>
          <div style={{ marginTop: 6 }}>
            <CorridorHistory />
          </div>
          <div
            style={{
              display: 'flex',
              gap: 14,
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${t.lineSoft}`,
              fontSize: 11.5,
              fontWeight: 600,
              color: t.soft,
              paddingLeft: 4
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 9, background: '#26311B', borderTop: `1.5px solid ${t.lime}99`, borderBottom: `1.5px solid ${t.lime}99` }} />
              Corridor
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: t.fg }} />
              Done
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, boxShadow: `inset 0 0 0 1.6px ${t.sage}` }} />
              Planned
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: t.coral }} />
              Over
            </span>
          </div>
        </Card>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <Label style={{ marginBottom: 2 }}>Next five weeks</Label>
        {upcoming.map((u, i) => {
          const w = loadHistory[13 + i];
          return row(
            u.dates,
            <>
              {u.dates} <span style={{ color: t.soft, fontWeight: 550 }}>· {u.name}</span>
            </>,
            u.note,
            <>
              <div style={{ fontSize: 15, fontWeight: 750 }}>{w.load}</div>
              <div style={{ fontSize: 11.5, color: t.mute, fontWeight: 600 }}>
                of {w.lo}–{w.hi}
              </div>
            </>
          );
        })}
        {row(
          'race',
          <>
            Nov 18 – 23 <span style={{ color: t.soft, fontWeight: 550 }}>· Race week</span>
          </>,
          'Taper, then the 30K. Corridor paused.',
          <span style={{ fontSize: 12.5, fontWeight: 700, color: t.lime }}>Race</span>,
          true
        )}
      </div>
      <TabBar active='plan' />
    </Screen>
  );
}
